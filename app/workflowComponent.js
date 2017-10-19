const config = require('./config/server');

/*
 * javascript representation of wheel's task 
 *
 */
class Task{
  constructor(pos){
    this.type='task';
    this.name=null;
    this.description=null;
    /** path for its directory */
    this.path=null;
    /** filename of entry point of this task*/
    this.script=null;
    this.inputFiles=[];
    this.outputFiles=[];
    /** 
     * flag for clean up temporary workspace on remote host
     * 0: do clenup
     * 1: do not clenup
     * 2: same as parent
     */
    this.cleanupFlag=null;
    this.maxSizeCollection=null;
    this.previous=[];
    this.next=[];
    this.host='localhost';
    this.jobScheduler=null;
    this.state='pre runnnig';
    this.index=null;
    this.x=pos.x;
    this.y=pos.y;
  }
}
/*
 * task absrtuct class of task containers 
 */
class BaseTaskGraph{
  constructor(pos, parent){
    this.type=null;
    this.name=null;
    this.description=null;
    this.path=null;
    this.nodes=[];
    this.start=[];
    this.inputFiles=[];
    this.outputFiles=[];
    this.cleanupFlag=null;
    this.parent=parent;
    this.index=null;
    this.x=pos.x;
    this.y=pos.y;
  }
}
class Workflow extends BaseTaskGraph{
  constructor(pos, parent){
    // define pseudo position for root workflow
    var pos2=pos || {x:0, y:0};
    super(pos2, parent);
    this.jsonFile= `${config.default_filename}${config.extension.workflow}`;
    this.type='workflow';
  }
}
class ParameterStudy extends BaseTaskGraph{
  constructor(...args){
    super(...args);
    this.type='parameterStudy';
    this.jsonFile= `${config.default_filename}${config.extension.pstudy}`;
    this.parameters=[];
  }
}

/*
 * control flow classes
 */
class BaseControlFlow{
  constructor(pos){
    this.type=null;
    this.name=null;
    this.previous=[];
    this.next=[];
    this.blockStart=null;
    this.inputFiles=[];
    this.outputFiles=[];
    this.index=null;
    this.x=pos.x;
    this.y=pos.y;
  }
}
class For extends BaseControlFlow{
  constructor(...args){
    super(...args);
    this.type='for';
    this.start=null;
    this.end=null;
    this.step=null;
  }
}
class While extends BaseControlFlow{
  constructor(...args){
    super(...args);
    this.type='while';
    this.condition=null;
  }
}
class If extends BaseControlFlow{
  constructor(pos){
    super(pos);
    this.type='if';
    this.condition=null;
    this.elseBlockStart=null;
  }
}
/*
 * loop over kind of array
 */
class Foreach extends BaseControlFlow{
  constructor(pos){
    super(pos);
    this.type='foreach';
    this.indexList=[];
  }
}

/*
 * factory method for workflow component class
 */
function factory(type, ...args){
  var node=null;
  switch(type){
    case 'task':
      node=new Task(...args);
      break;
    case 'workflow':
      node=new Workflow(...args);
      break;
    case 'PS':
      node=new ParameterStudy(...args);
      break;
    case 'if':
      node=new If(...args);
      break;
    case 'for':
      node=new For(...args);
      break;
    case 'while':
      node=new While(...args);
      break;
    case 'foreach':
      node=new Foreach(...args);
      break;
  }
  return node;
}

module.exports.factory=factory;
module.exports.Workflow=Workflow;
