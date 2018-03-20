const path = require("path");
const os = require("os");
const fs = require("fs-extra");
const {promisify} = require("util");

const klaw = require('klaw');
const express = require('express');
const {getLogger} = require('../logSettings');
const logger = getLogger('workflow');
const Dispatcher = require('./dispatcher');
const fileManager = require('./fileManager');
const {canConnect} = require('./sshManager');
const {getDateString, doCleanup, getSystemFiles} = require('./utility');
const {remoteHost, defaultCleanupRemoteRoot} = require('../db/db');
const {getCwf, setCwf, overwriteCwf, getNode, pushNode, getCurrentDir, readRwf, getRootDir, getCwfFilename, readProjectJson, resetProject} = require('./project');
const {write, setRootDispatcher, getRootDispatcher, openProject, updateProjectJson, setProjectState, getProjectState} = require('./project');
const {commitProject, revertProject, cleanProject} =  require('./project');
const {gitAdd} = require('./project');
const fileBrowser = require("./fileBrowser");
const {isInitialNode, hasChild, readChildWorkflow, createNode, removeNode, addLink, removeLink, removeAllLink, addFileLink, removeFileLink, removeAllFileLink, addValue, updateValue, updateInputFiles, updateOutputFiles, updateName, delValue, delInputFiles, delOutputFiles} = require('./workflowEditor');

function askPassword(sio, hostname){
  return new Promise((resolve, reject)=>{
    sio.on('password', (data)=>{
      resolve(data);
    });
    sio.emit('askPassword', hostname);
  });
}

/**
 * check if all scripts and remote host setting are available or not
 */
async function validationCheck(label, workflow, dir, sio){
  let promises=[]
  if(dir == null ){
    promises.push(Promise.reject(new Error('Project dir is null or undefined')));
  }
  let hosts=[];
  workflow.nodes.forEach((node)=>{
    if(node == null) return;
    if(node.type === 'task'){
      if(node.path == null){
        promises.push(Promise.reject(new Error(`illegal path ${node.name}`)));
      }
      if(node.host !== 'localhost'){
        hosts.push(node.host);
      }
      if( node.script == null){
        promises.push(Promise.reject(new Error(`script is not specified ${node.name}`)));
      }else{
        promises.push(promisify(fs.access)(path.resolve(dir, node.path, node.script)));
      }
    }else if(node.type === 'parameterStudy'){
      if(node.parameterFile === null){
        promises.push(Promise.reject(new Error(`parameter setting file is not specified ${node.name}`)));
      }
    }
    if(hasChild(node)){
      const childDir = path.resolve(dir, node.path);
      promises.push(
        readChildWorkflow(label, node)
        .then((childWF)=>{
          return validationCheck(label, childWF, childDir, sio)
        })
      );
    }
  });
  const hasInitialNode = workflow.nodes.some((node)=>{
    if(node === null) return false;
    return isInitialNode(node);
  });
  if(!hasInitialNode) promises.push(Promise.reject(new Error('no component can be run')));

  hosts = Array.from(new Set(hosts));
  let hostPromises = hosts.map((e)=>{
    let id=remoteHost.getID('name', e);
    const hostInfo = remoteHost.get(id);
    if(!hostInfo)  promises.push(Promise.reject(new Error(`illegal remote host specified ${e}`)));
    return canConnect(hostInfo)
      .catch((err)=>{
        return askPassword(sio, e)
          .then((password)=>{
            canConnect(hostInfo, password);
          });
      });
  });
  return Promise.all(promises.concat(hostPromises));
}

/**
 * remove harmfull property from obj before send to client
 */
function cleanup(obj){
  obj.nodes.forEach((child)=>{
    if(child === null) return;
    if(child.handler) delete child.handler;
    if(child.nodes){
      child.nodes.forEach((grandson)=>{
        if(grandson.hander)delete grandson.handler
      });
    }
  });
  return obj;
}

async function sendWorkflow(sio, label){
  const rt = Object.assign({}, getCwf(label));
  const promises = rt.nodes.map((child)=>{
    if(child !== null && hasChild(child)){
      return readChildWorkflow(label, child)
        .then((tmp)=>{
          child.nodes=tmp.nodes;
        })
    }
  });
  await Promise.all(promises);
  sio.emit('workflow', cleanup(rt));
}

async function onWorkflowRequest(sio, label, argWorkflowFilename){
  const workflowFilename=path.resolve(argWorkflowFilename);
  logger.debug('Workflow Request event recieved: ', workflowFilename);
  await setCwf(label, workflowFilename);
  sendWorkflow(sio, label);
}

async function onCreateNode(sio, label, msg){
  logger.debug('create event recieved: ', msg);

  let index = await createNode(label, msg);
  logger.debug('node created: ',getNode(label, index));

  try{
    await write(label);
    sio.emit('workflow', getCwf(label));
  }catch(err){
    logger.error('node create failed', err);
  }
}

async function onUpdateNode(sio, label, msg){
  logger.debug('updateNode event recieved: ', msg);
  let index=msg.index;
  let property=msg.property;
  let value=msg.value;
  let cmd=msg.cmd;

  let targetNode=getNode(label, index);
  if(property in targetNode){
    switch(cmd){
      case 'update':
        if(property === "inputFiles"){
          await updateInputFiles(label, targetNode, value);
        }else if(property === "outputFiles"){
          await updateOutputFiles(label, targetNode, value);
        }else if(property === "name"){
          await updateName(label, targetNode, value);
        }else{
          await updateValue(label, targetNode, property, value);
        }
        break;
      case 'add':
        if(Array.isArray(targetNode[property])){
          await addValue(label, targetNode, property, value);
        }
        break;
      case 'del':
        if(Array.isArray(targetNode[property])){
          if(property === "inputFiles"){
            await delInputFiles(label, targetNode, value);
          }else if(property === "outputFiles"){
            await delOutputFiles(label, targetNode, value);
          }else{
            await delValue(label, targetNode, property, value);
          }
        }
        break;
    }
    try{
      await write(label)
      sio.emit('workflow', getCwf(label));
    }catch(err){
      logger.error('node update failed', err);
    }
  }
}

async function onRemoveNode(sio, label, index){
  logger.debug('removeNode event recieved: ', index);
  const target=getNode(label, index);
  if(! target){
    logger.warn('illegal remove node request', index);
    return
  }
  const dirName=path.resolve(getCurrentDir(label),target.path);

  removeAllLink(label, index);
  removeAllFileLink(label, index);
  removeNode(label, index);
  klaw(dirName)
    .on('data', (item)=>{
      gitAdd(label, item.path, true);
    })
    .on('end', async()=>{
      try{
        await fs.remove(dirName);
        await write(label);
        sio.emit('workflow', getCwf(label));
      }catch(err){
        logger.error('remove node failed: ', err);
      }
    });
}

async function onAddLink(sio, label, msg){
  logger.debug('addLink event recieved: ', msg);
  addLink(label, msg.src, msg.dst, msg.isElse);
  try{
    await write(label)
    sio.emit('workflow', getCwf(label));
  }catch(err){
    logger.error('add link failed: ', err);
  }
}
function onRemoveLink(sio, label, msg){
  logger.debug('removeLink event recieved:', msg);
  removeLink(label, msg.src, msg.dst, msg.isElse);

  write(label)
    .then(()=>{
      sio.emit('workflow', getCwf(label));
    })
    .catch((err)=>{
      logger.error('remove link failed: ', err);
    });
}

async function onAddFileLink(sio, label, msg){
  logger.debug('addFileLink event recieved: ', msg);
  addFileLink(label, msg.src, msg.dst, msg.srcName, msg.dstName);
  try{
    await write(label);
    sio.emit('workflow', getCwf(label));
  }catch(err){
    logger.error('add filelink failed:', err);
  }
}

async function onRemoveFileLink(sio, label, msg){
  logger.debug('removeFileLink event recieved:', msg);
  removeFileLink(label, msg.src, msg.dst, msg.srcName, msg.dstName);
  try{
    await write(label);
    sio.emit('workflow', getCwf(label));
  }catch(err){
    logger.error('remove file link failed:', err);
  }
}

async function onRunProject(sio, label, rwfFilename){
  logger.debug("run event recieved");
  let rwf = await readRwf(label);
  try{
    await validationCheck(label, rwf, getRootDir(label), sio)
  }catch(err){
    logger.error('invalid root workflow:', err.message);
    logger.debug(err);
    return false
  }
  await commitProject(label);
  await setProjectState(label, 'running');
  sio.emit('projectJson', await readProjectJson(label));
  let rootDir = getRootDir(label);
  let cleanup = rwf.cleanupFlag;
  if(! cleanup){
    cleanup = defaultCleanupRemoteRoot;
  }
  rwf.cleanupFlag = cleanup;
  setRootDispatcher(label, new Dispatcher(rwf, rootDir, rootDir, getDateString(), sio));
  sio.emit('projectState', getProjectState(label));
  const timeout = setInterval(()=>{
    const cwf = getRootDispatcher(label).getCwf(getCurrentDir(label));
    overwriteCwf(label, cwf);
    sendWorkflow(sio, label);
  }, 5000);
  try{
    const projectState=await getRootDispatcher(label).dispatch();
    await setProjectState(label, projectState);
  }catch(err){
    logger.error('fatal error occurred while parsing workflow:',err);
    await setProjectState(label, 'failed');
  }
  clearInterval(timeout);
  const cwf = getRootDispatcher(label).getCwf(getCurrentDir(label));
  overwriteCwf(label, cwf);
  sendWorkflow(sio, label);
  sio.emit('projectJson', await readProjectJson(label));
}

async function onPauseProject(sio, label){
  logger.debug("pause event recieved");
  await getRootDispatcher(label).pause();
  await setProjectState(label, 'paused');
  sio.emit('projectJson', await readProjectJson(label));
}
async function onCleanProject(sio, label){
  logger.debug("clean event recieved");
  const rootDispatcher=getRootDispatcher(label);
  if(rootDispatcher != null) rootDispatcher.remove();
  await cleanProject(label);
  await resetProject(label);
  await sendWorkflow(sio, label);
  await setProjectState(label, 'not-started');
  sio.emit('projectJson', await readProjectJson(label));
}

async function onSaveProject(sio, label){
  logger.debug("saveProject event recieved");
  await commitProject(label);
  sio.emit('projectState', getProjectState(label));
}
async function onRevertProject(sio, label){
  logger.debug("revertProject event recieved");
  await revertProject(label);
  await sendWorkflow(sio, label);
  sio.emit('projectState', getProjectState(label));
}

function onTaskStateListRequest(sio, label, msg){
  logger.debug('getTaskStateList event recieved:', msg);
  const rootDispatcher=getRootDispatcher(label);
  if(rootDispatcher != null){
    const tasks=[];
    rootDispatcher._getTaskList(tasks);
    sio.emit('taskStateList', tasks);
  }else{
    logger.debug('task state list requested before root dispatcher is set');
  }
}

async function onCreateNewFile(sio, label, filename, cb){
  try{
    await promisify(fs.writeFile)(filename, '')
    await gitAdd(label, filename);
    fileBrowser(sio, 'fileList', path.dirname(filename), {"filter": {file: getSystemFiles()}});
    cb(true);
  }catch(e){
    logger.error('create new file failed', e);
    cb(false);
  }
}
async function onCreateNewDir(sio, label, dirname, cb){
  try{
    await promisify(fs.mkdir)(dirname)
    await promisify(fs.writeFile)(path.resolve(dirname,'.gitkeep'), '')
    await gitAdd(label, path.resolve(dirname,'.gitkeep'));
    fileBrowser(sio, 'fileList', path.dirname(dirname), {"filter": {file: getSystemFiles()}});
    cb(true);
  }catch(e){
    logger.error('create new directory failed', e);
    cb(false);
  }
}

module.exports = function(io){
  let label="initial";

  const sio = io.of('/workflow');
  sio.on('connect', function (socket) {
    //event listners for workflow editor
    socket.on('getWorkflow',      onWorkflowRequest.bind(null, socket, label));
    socket.on('createNode',       onCreateNode.bind(null, socket, label));
    socket.on('updateNode',       onUpdateNode.bind(null, socket, label));
    socket.on('removeNode',       onRemoveNode.bind(null, socket, label));
    socket.on('addLink',          onAddLink.bind(null, socket, label));
    socket.on('addFileLink',      onAddFileLink.bind(null, socket, label));
    socket.on('removeLink',       onRemoveLink.bind(null, socket, label));
    socket.on('removeFileLink',   onRemoveFileLink.bind(null, socket, label));

    //event listeners for project operation
    socket.on('getTaskStateList', onTaskStateListRequest.bind(null, socket, label));
    socket.on('runProject',       onRunProject.bind(null, socket, label));
    socket.on('pauseProject',     onPauseProject.bind(null, socket, label));
    socket.on('cleanProject',     onCleanProject.bind(null, socket, label));
    socket.on('saveProject',      onSaveProject.bind(null, socket, label));
    socket.on('revertProject',    onRevertProject.bind(null, socket, label));
    socket.on('stopProject',     (msg)=>{
      onPauseProject(socket, label, msg);
      onCleanProject(socket, label, msg);
    });
    socket.on('getProjectState', ()=>{
      socket.emit('projectState', getProjectState(label));
    });

    socket.on('updateProjectJson', (data)=>{
      updateProjectJson(label, data);
    });

    socket.on('getHostList', ()=>{
      socket.emit('hostList', remoteHost.getAll());
    });
    socket.on('getProjectJson', async ()=>{
      socket.emit('projectJson', await readProjectJson(label));
    });

    //event listeners for file operation
    fileManager(socket, label);
    socket.on('createNewFile', onCreateNewFile.bind(null, socket, label));;
    socket.on('createNewDir', onCreateNewDir.bind(null, socket, label));
  });

  const router = express.Router();
  router.post('/', async (req, res, next)=>{
    const projectJsonFilename=req.body.project;
    //TODO openProject will return label(index number of opend project)
    // so update label var here
    await openProject(label, projectJsonFilename);
    // cwf is set in openProject()
    res.cookie('root', getCwfFilename(label));
    res.cookie('rootDir', getCurrentDir(label));
    res.cookie('project', projectJsonFilename);
    res.sendFile(path.resolve(__dirname, '../views/workflow.html'));
  });
  return router;
}
