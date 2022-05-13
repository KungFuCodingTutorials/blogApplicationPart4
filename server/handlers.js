const helpers = require("./helpers");
const _data = require('./data');
const { read } = require("./data");

// Create the container
let handlers = {};

handlers.index = async function(data){
    try{
        if(data.method == 'get'){ 
            let templateData = {};
            let stringData = await helpers.getTemplate('index',templateData);
            if(stringData){
                let universalString = await helpers.addHeaderFooter(stringData,templateData);
                if(universalString){
                    return{
                        'statusCode' : 200,
                        'payload' : universalString,
                        'contentType' : 'html',
                    }
                } else {
                    return{
                        'statusCode' : 500,
                        'payload' : {'Error' : 'Error merging the files'},
                    }
                }
            } else {
                return{
                    'statusCode' : 500,
                    'payload' : {'Error' : 'Error reading the file'},
                }
            }
        } else {
            return{
                'statusCode' : 500,
                'payload' : {'Error' : 'Only GET method are allowed'},
            }
        }
    } catch(e){
        console.error(e);
    }
}

handlers.notFound = async function(){
    return{
        'statusCode' : 404,
        'payload' : 'Not found page',
        'contentType' : 'plain'
    }
}

handlers.public = async function(data){
    try{
        if(data.method == 'get'){
            let fileName = data.cleanedPath.replace('public','').trim();
            if(fileName.length > 0){
                let staticAssetData = await helpers.getStaticAsset(fileName);
                if(staticAssetData){
                    let contentType = 'plain';
                    if(fileName.indexOf('.css') > -1){
                        contentType = 'css';
                    }
                    if(fileName.indexOf('.png') > -1){
                        contentType = 'png';
                    }
                    if(fileName.indexOf('.jpg') > -1){
                        contentType = 'jpg';
                    }
                    if(fileName.indexOf('favicon') > -1){
                        contentType = 'favicon';
                    }
                    if(fileName.indexOf('.js') > -1){
                        contentType = 'javascript';
                    }
                    return{
                        'statusCode' : 200,
                        'payload' : staticAssetData,
                        'contentType' : contentType
                    }
                }
            }
        }
    } catch(e){
        console.error(e);
    }
}


handlers.postCreate = async function(data){
    try{
        if(data.method == 'get'){ 
            let templateData = {};
            let stringData = await helpers.getTemplate('postCreate',templateData);
            if(stringData){
                let universalString = await helpers.addHeaderFooter(stringData,templateData);
                if(universalString){
                    return{
                        'statusCode' : 200,
                        'payload' : universalString,
                        'contentType' : 'html',
                    }
                }else {
                    return{
                        'statusCode' : 500,
                        'payload' : {'Error' : 'Error merging the files'},
                    }
                }
            } else {
                return{
                    'statusCode' : 500,
                    'payload' : {'Error' : 'Error reading the file'},
                }
            }
        } else {
            return{
                'statusCode' : 500,
                'payload' : {'Error' : 'Only GET method are allowed'},
            }
        }
    } catch(e){
        console.error(e);
    }
}

handlers.edit = async function(data){
    try{
        if(data.method == 'get'){ 
            let templateData = {};
            let stringData = await helpers.getTemplate('postEdit',templateData);
            if(stringData){
                let universalString = await helpers.addHeaderFooter(stringData,templateData);
                if(universalString){
                    return{
                        'statusCode' : 200,
                        'payload' : universalString,
                        'contentType' : 'html',
                    }
                }else {
                    return{
                        'statusCode' : 500,
                        'payload' : {'Error' : 'Error merging the files'},
                    }
                }
            } else {
                return{
                    'statusCode' : 500,
                    'payload' : {'Error' : 'Error reading the file'},
                }
            }
        } else {
            return{
                'statusCode' : 500,
                'payload' : {'Error' : 'Only GET method are allowed'},
            }
        }
    } catch(e){
        console.error(e);
    }
}

handlers.blogPost = async function(data){
    let acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        return await handlers._blogPost[data.method](data);
    } else {
        return{
        'statusCode':405,
        'payload':{}
        }
    }
  }
  
  handlers._blogPost = {};
  
  
  handlers._blogPost.post = async function(data){
    try{
      let title = typeof(data.payload.title) == 'string' && data.payload.title.trim().length > 0 ? data.payload.title.trim() : false;
      let tag = typeof(data.payload.tag) == 'object' ? data.payload.tag : [];
      let readingMinutes = typeof(data.payload.readingMinutes) == 'number' && data.payload.readingMinutes > 0 ? data.payload.readingMinutes : false;
      let fileName = typeof(data.payload.fileName) == 'string' && data.payload.fileName.trim().length > 0 ? data.payload.fileName.trim() : false;
      let mainContent = typeof(data.payload.mainContent) == 'string' && data.payload.mainContent.trim().length > 0 ? data.payload.mainContent.trim() : false;
      let fileExtension = typeof(data.payload.fileExtension) == 'string' && data.payload.fileExtension.trim().length > 0 ? data.payload.fileExtension.trim() : false;
      let fileContent = typeof(data.payload.fileContent) == 'string' && data.payload.fileContent.trim().length > 0 ? data.payload.fileContent.trim() : false;
  
      if(title && tag && readingMinutes){
        let postId = helpers.createRandomString(20);
        if(fileName){
            let imageFileName = helpers.createRandomString(10);
            let allPostImagesName = [];
            let allPostImagesExtensions = [];
            allPostImagesName.push(imageFileName);
            allPostImagesExtensions.push(fileExtension);
            let imageData = await _data.createImage('upload',imageFileName+'.'+fileExtension,fileContent ,{encoding:'base64'});
            if(imageData){
                let postObject = {
                    "id" : postId,
                    "title" : title.toLocaleLowerCase(),
                    "tag" : tag,
                    "readingMinutes" : readingMinutes,
                    "fileName" : imageFileName,
                    "fileExtension" : fileExtension ,
                    "mainContent" : mainContent,
                    "allPostImagesName" : allPostImagesName,
                    "allPostImagesExtension" : allPostImagesExtensions,

                }

                let postObjectData = await _data.create('posts',postId,postObject);
                if(postObjectData){
                    return{
                        'statusCode' : 200,
                        'payload' : {'Success' : 'Post created!'}
                    }
                }

            } else {
                return{
                    'statusCode' : 400,
                    'payload' : {'Error' : 'Missing inputs'}
                }
            }
        } else {
            return{
                'statusCode' : 400,
                'payload' : {'Error' : 'Missing inputs'}
            }
        }
      } else {
        return{
          'statusCode' : 400,
          'payload' : {'Error' : 'Missing inputs'}
        }
      }
    } catch(e){
      console.error(e);
    }
    
  }



  handlers._blogPost.get = async function(data){
      try{
          if(Object.keys(data.queryStringObject).length === 0){
            let fileData = await _data.list('posts');
            if(fileData){
                return{
                    'statusCode' : 200,
                    'payload' : fileData,
                }
            } else {
                return{
                    'statusCode' : 404,
                    'payload' : {'Error' : 'No posts found'}
                }
            }
          } else{
              let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
              if(id){
                  let postData = await _data.read('posts',id);
                  if(postData){
                    return{
                        'statusCode' : 200,
                        'payload': postData
                    }
                  } else {
                      return{
                          'statusCode' : 404,
                          'payload' : {'Error' : 'No user found with that ID'}
                      }
                  }
              }
              let keyword = typeof(data.queryStringObject.keyword) == 'string' && data.queryStringObject.keyword.trim().length > 0 ? data.queryStringObject.keyword.trim() : false;
              if(keyword){
                  let listData = await _data.list('posts');
                  if(listData){
                    let allPostObjects = [];
                    let resultId = [];
                    for(let i = 0;i<listData.length;i++){
                        let postData = await _data.read('posts',listData[i]);
                        if(postData){
                            allPostObjects.push(postData);
                        }
                    }
                    if(allPostObjects.length === listData.length){
                        for(let j=0;j<allPostObjects.length;j++){
                           if(allPostObjects[j].title.indexOf(keyword.toLocaleLowerCase()) > -1 || allPostObjects[j].tag.indexOf(keyword.toLocaleLowerCase()) > -1){
                               resultId.push(allPostObjects[j].id);
                           }
                        }
                        if(resultId.length > 0){
                            return{
                                'statusCode' : 200,
                                'payload' : resultId,
                            }
                        } else {
                            return{
                                'statusCode' : 404,
                                'payload' : {'Error' : 'No post found for that keyword'}
                            }
                        }
                    }
                  } else {
                      return{
                          'statusCode' : 404,
                          'payload' : {'Error' : 'No post found'}
                      }
                  }
              } 
          }
     
      } catch(e){
          console.error(e);
      }
  }



  handlers._blogPost.put = async function(data){
      try{
        let title = typeof(data.payload.title) == 'string' && data.payload.title.trim().length > 0 ? data.payload.title.trim() : false;
        let tag = typeof(data.payload.tag) == 'object' ? data.payload.tag : [];
        let readingMinutes = typeof(data.payload.readingMinutes) == 'number' && data.payload.readingMinutes > 0 ? data.payload.readingMinutes : false;
        let fileName = typeof(data.payload.fileName) == 'string' && data.payload.fileName.trim().length > 0 ? data.payload.fileName.trim() : false;
        let mainContent = typeof(data.payload.mainContent) == 'string' && data.payload.mainContent.trim().length > 0 ? data.payload.mainContent.trim() : false;
        let fileExtension = typeof(data.payload.fileExtension) == 'string' && data.payload.fileExtension.trim().length > 0 ? data.payload.fileExtension.trim() : false;
        let fileContent = typeof(data.payload.fileContent) == 'string' && data.payload.fileContent.trim().length > 0 ? data.payload.fileContent.trim() : false;
        let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

        if(id){
            if(title || mainContent || tag || readingMinutes){
                // Read post data
                let postData = await _data.read('posts',id);
                if(postData){
                    if(title){
                        postData.title = title;
                    };
                    if(mainContent){
                        postData.mainContent = mainContent;
                    }
                    if(tag){
                        postData.tag[0] = tag[0];
                        postData.tag[1] = tag[1];
                        postData.tag[2] = tag[2];
                    }
                    if(readingMinutes){
                        postData.readingMinutes = readingMinutes;
                    }
                    if(fileName && fileExtension){
                        let imageFileName = helpers.createRandomString(10);
                        let allPostImages = [];
                        let allPostImagesExtensions = []
                        allPostImages.push(imageFileName);
                        allPostImagesExtensions.push(fileExtension);
                        postData.fileName = imageFileName;
                        postData.fileExtension = fileExtension;
                        if(!postData.allPostImages && !postData.allPostImagesExtensions){
                            postData.allPostImages = allPostImages;
                            postData.allPostImagesExtensions = allPostImagesExtensions;
                        } else {
                            postData.allPostImages.push(imageFileName);
                            postData.allPostImagesExtensions.push(fileExtension);
                        }
                    }
                    if(fileContent){
                        await _data.createImage('upload',postData.fileName+'.'+postData.fileExtension,fileContent,{encoding:'base64'});

                    }
                    let updateObject = await _data.update('posts',id,postData);
                    if(updateObject){
                        return{
                            'statusCode' : 200,
                            'payload' : {'Success' : 'Your post has been updated!'}
                        }
                    } else {
                        return{
                            'statusCode' : 500,
                            'payload' : {'Error' : 'Error updating the file'}
                        }
                    }
                } else {
                    return{
                        'statusCode' : 500,
                        'payload' : {'Error' : 'Error reading the file'}
                    }
                }
            } else {
                return{
                    'statusCode' : 400,
                    'payload' : {'Error' : 'You have to type something'}
                }
            }
        } else {
            return{
                'statusCode' : 500,
                'payload' : {'Error' : 'Error with the post ID'}
            }
        }
      } catch(e){
          console.error(e);
      }
  }

  
  handlers.read = async function(data){
      try{
        if(data.method == 'get'){
            let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
            let postData = await _data.read('posts',id);
            if(postData){
                let templateData = {
                    'id' : id,
                    'title' : postData.title,
                    'mainContent' : postData.mainContent,
                    'tag1' : postData.tag[0],
                    'tag2' : postData.tag[1],
                    'tag3' : postData.tag[2],
                    'readingMinutes' : postData.readingMinutes,
                    'fileName' : './../public/images/upload/'+postData.fileName,
                    'fileExtension' : postData.fileExtension,
                }
                let postTemplate = await helpers.getTemplate('postRead',templateData);
                if(postTemplate){
                    let totalString = await helpers.addHeaderFooter(postTemplate,templateData);
                    if(totalString){
                        return{
                            'statusCode':200, 
                            'payload' : totalString,
                            'contentType' : 'html'
                        }
                    } else {
                    return{
                        'statusCode' : 404,
                        'payload' : {'Error' : 'Not able to mergin the strings'}
                    }
                }
                } else {
                    return{
                        'statusCode' : 404,
                        'payload' : {'Error' : 'Not able to read the template'}
                    }
                }
            } else {
                return{
                    'statusCode' : 404,
                    'payload' : {'Error' : 'Not post found with that ID'}
                }
            }
        } else {
            return{
                'statusCode' : 500,
                'payload' : {'Error' : 'Only get method are allowed'}
            }
        }
      } catch(e){
          console.error(e);
      }
  }




module.exports = handlers;