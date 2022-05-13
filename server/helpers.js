// Dependencies
const path = require('path');
const fsPromises = require('fs/promises');

// Create the container
let helpers = {};


let someRandomQuery = 'name=kungfucoding&tutorial=blogapplication&follow=yes';
// Parse a query string into object
helpers.parseParams = function(params) {
    const output = {};
    const searchParams = new URLSearchParams(params);
  
    // Set will return only unique keys()
    new Set([...searchParams.keys()])
      .forEach(key => {
        output[key] = searchParams.getAll(key).length > 1 ? searchParams.getAll(key) : searchParams.get(key);
      });
  
    return output;
}

let stringToParse = '{"name":"kungfucoding","application":"blogApplication","follow":"yesyes"}';

helpers.parseJsonToObject = function(string){
  try{
    let obj = JSON.parse(string);
    return obj;
  } catch(e){
    return {}
  }

}

helpers.getStaticAsset = async function(fileName){
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  try{
    if(fileName){
      let publicDir = path.join(__dirname,'/../public/');
      let fileData = await fsPromises.readFile(publicDir+fileName);
      if(fileData){
        return fileData;
      }
    }
  } catch(e){
    console.error(e);
  }
}

helpers.getTemplate = async function(templateName,data){
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
  try{
    if(templateName){
      let templatesDir = path.join(__dirname,'/../templates/');
      let fileData = await fsPromises.readFile(templatesDir+templateName+'.html','utf-8');
      
      if(fileData){
        let finalString = await helpers.interpolate(fileData,data);
        return finalString;
      }

    }
  } catch(e){
    console.error(e);
  }
}


helpers.interpolate = async function(str,data){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};
  for(let key in data){
    if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){

      let replace = data[key];
      let find = '{'+key+'}';
      str = str.replace(find,replace);
      
    }
  }
  let result = await str;
  return result
}

helpers.addHeaderFooter = async function(str,data){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};
  try{
    let headerString = await helpers.getTemplate('header',data);
    if(headerString){
      let footerString = await helpers.getTemplate('footer',data);
      if(footerString){
        let fullString = headerString+str+footerString;
        return fullString;
      }
    }
  } catch(e){
    console.error(e);
  }

}


helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    let possibleCharacters = 'abcxdefghilmnopqrstuvzxyjkw0123456789';
    let str = '';
    for(let i = 0;i<strLength;i++){
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
      str+=randomCharacter;
    }
    return str;
  } else {
    return false;
  }
}


module.exports = helpers;