// Dependecies
let fsPromises = require('fs/promises');
let path = require('path');
let helpers = require('./helpers');


let lib = {};


lib.baseDirImage = path.join(__dirname,'/../public/images/');
lib.baseDir = path.join(__dirname,'/../database/');


lib.createImage = async function(dir,file,data,encoding){
    try{
        let fileData = await fsPromises.writeFile(lib.baseDirImage+dir+'/'+file,data,encoding);
        await fileData?.close();
        return true
    } catch(e){
        console.error(e);
    }
}


lib.create = async function(dir,file,data){
    try{
        let fileData = await fsPromises.open(lib.baseDir+dir+'/'+file+'.json','wx');
        await fileData.truncate();
        if(fileData){
            let stringData = JSON.stringify(data);
            await fsPromises.writeFile(fileData,stringData);
            await fileData?.close();
            return true;
        }
    } catch(e){
        console.error(e);
    }
}



lib.list = async function(dir){
    try{
        let fileData = await fsPromises.readdir(lib.baseDir+dir+'/');
        if(fileData && fileData.length > 0){
            let fileList = [];
            fileData.forEach(function(fileName){
                fileList.push(fileName.replace('.json',""));
            });
            return fileList;
        } else {
            return false;
        }
    } catch(e){
        console.error(e);
    }
}

lib.read = async function(dir,file){
    try{
        let fileData = await fsPromises.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8');
        if(fileData){
          let parsedData = helpers.parseJsonToObject(fileData);
          return parsedData;  
        } else {
            return false;
        }
    } catch(e){
        console.error(e);
    }
}

lib.update = async function(dir,file,data){
    try{
        let fileHandle = await fsPromises.open(lib.baseDir+dir+'/'+file+'.json','r+');
        await fileHandle.truncate();
        if(fileHandle){
            let stringData = JSON.stringify(data);
            await fsPromises.writeFile(fileHandle,stringData);
            await fileHandle.close();
            return true;
        }
    } catch(e){ 
        console.error(e);
    }
}

module.exports = lib;
