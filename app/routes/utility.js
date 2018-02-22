const {promisify} = require('util');
const fs = require('fs');
const path = require('path');

const ncp = require('ncp').ncp;
const Mode = require('stat-mode');

const getSsh = require('./sshManager');


/**
 * convert to posix-style path string and remove head and tail path separator
 */
function normalizePath(pathString){
  let rt=pathString;
  // path.posix.sep('/') is disallowed as filename letter on windows OS
  // but posix allow path.win32.sep('\').
  if(pathString.includes(path.posix.sep)){
    let pathObj=path.posix.parse(pathString);
    rt = path.posix.join(pathObj.dir, pathObj.base);
  }else if(pathString.includes(path.win32.sep)){
    let pathObj=path.win32.parse(pathString);
    rt = path.posix.join(pathObj.dir.split(path.win32.sep), pathObj.base);
  }
  return rt;
}

class Utility {
  /**
   * escape meta character of regex (from MDN)
   * @param {string} string - target string which will be escaped
   * @return {string} escaped regex string
   */
  escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
  }

  /**
   * determin specified filename is invalid or not
   */
  isInvalidFilename(filename){
    const reservedWin32 = /(CON|PRN|AUX|NUL|CLOCK$|COM[0-9]|LPT[0-9])\..*/;

  }

  async mkdir_p(targetPath){
    let dirs=[];
    let target = normalizePath(targetPath);
    while(target !== path.posix.sep){
      try{
        var stats = await promisify(fs.stat)(target)
      }catch(e){
        if(e.code === 'ENOENT'){
          dirs.unshift(target);
          target = path.posix.dirname(target);
        }
      }
      if(stats.isDirectory()){
        break;
      }else if(stats.isFile()){
        return Promise.reject(new Error("file exist", target));
      }
    }
    let p = Promise.resolve();
    dirs.forEach((dir)=>{
      p = p.then(()=>{
        return promisify(fs.mkdir)(dir);
      });
    });
    return p;
  }


  /**
   * add execute permission to file
   * @param {string} file - filename in absolute path
   */
  addXSync(file){
    let stat = fs.statSync(file);
    let mode = new Mode(stat);
    let u=4;
    let g=4;
    let o=4;
    if(mode.owner.read) u+=1;
    if(mode.owner.write) u+=2;
    if(mode.group.read) g+=1;
    if(mode.group.write) g+=2;
    if(mode.others.read) o+=1;
    if(mode.others.write) o+=2;
    let modeString = u.toString()+g.toString()+o.toString();
    fs.chmodSync(file, modeString);
  }

  /**
   * promise version of ncp
   * @param {string} src - src directory
   * @param {string} dst - dst directory
   * @param {Object} options - see ncp's npm page
   */
  asyncNcp(...args){
    return new Promise((resolve, reject)=>{
      ncp(...args, (err)=>{
        if(err) reject(err);
        resolve(null);
      });
    });
  }

  getDateString (){
    let now = new Date;
    let yyyy = `0000${now.getFullYear()}`.slice(-4);
    let month = now.getMonth()+1;
    let mm = `00${month}`.slice(-2);
    let dd = `00${now.getDate()}`.slice(-2);
    let HH = `00${now.getHours()}`.slice(-2);
    let MM = `00${now.getMinutes()}`.slice(-2);
    let ss = `00${now.getSeconds()}`.slice(-2);

    return `${yyyy}${mm}${dd}-${HH}${MM}${ss}`;
  }

  replacePathsep(pathString){
    return pathString.replace(new RegExp("\\"+path.win32.sep,"g"), path.posix.sep);
  }
}

module.exports=new Utility;
