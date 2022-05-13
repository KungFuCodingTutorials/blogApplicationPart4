



// I'm the main javacript
let app = {};

app.client = {};

app.client.request = async function(headers,path,method,queryStringObject,payload){
    try{
        headers = typeof(headers) == 'object' && headers !== null ? headers : {};
        path = typeof(path) == 'string' ? path : '/';
        method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
        queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
        payload = typeof(payload) == 'object' && payload !== null ? payload : {};

        // Build the request URL
        let requestUrl = path+'?';
        let searchParams = new URLSearchParams(queryStringObject).toString();
        requestUrl += searchParams;

        let requestHeader = new Headers();
        for(let headerKey in headers){
            if(requestHeader.hasOwnProperty(headerKey)){
                requestHeader.set(headerKey,requestHeader[headerKey]);
            }
        }
        let payloadString = JSON.stringify(payload); 
        if(method !== 'GET'){
            let response = await fetch(requestUrl,{
                'method': method,
                'headers' : headers,
                'body' : payloadString
            });
            let data = await response.json();
            return data;
        } else {
            let response = await fetch(requestUrl,{
                'method': method,
                'headers' : headers,
            });
            let data = await response.json();
            return data;
        }


    } catch(e){
        console.error(e);
    }
}

app.postCreate = async function(){
    let postCreateForm = document.querySelector('#postCreateForm');
    postCreateForm.addEventListener('submit',async function(e){
        e.preventDefault();
        let formDataString = new FormData(e.target);
        let title = formDataString.get('title');
        let tag1 = formDataString.get('tag1');
        let tag2 = formDataString.get('tag2');
        let tag3 = formDataString.get('tag3');
        let readingMinutes = formDataString.get('readingMinutes');
        let postImage = formDataString.get('postImage');
        let mainContent = formDataString.get('mainContent');
        let tagObject = [];
        tagObject.push(tag1.toLocaleLowerCase());
        tagObject.push(tag2.toLocaleLowerCase());
        tagObject.push(tag3.toLocaleLowerCase());
        let fileName = postImage.name;
        let fileExtension = fileName.substring(fileName.indexOf('.') + 1, fileName.length) || fileName;
        let acceptableExtensions = ['png','jpg','jpeg'];
        console.log(fileExtension)
        if(acceptableExtensions.indexOf(fileExtension) > - 1){
            let fileReader = new FileReader();
            fileReader.readAsDataURL(postImage);
            fileReader.addEventListener('load',async function(e){
                let fileContent = e.target.result;
                if(fileExtension == 'jpeg' || fileExtension == 'jpg'){
                    let cleanFileContent = fileContent.replace('data:image/jpeg;base64','');
                    let postCreateObject = {
                        "title" : title,
                        "tag" : tagObject,
                        "readingMinutes" : parseInt(readingMinutes,10),
                        "mainContent" : mainContent,
                        "fileName" : fileName,
                        "fileExtension" : fileExtension,
                        "fileContent" : cleanFileContent
                    }
                    let responseObject = await app.client.request(undefined,'posts','POST',undefined,postCreateObject);
                    if(responseObject){
                        window.location = '/';
                    }
                } else {
                    let cleanFileContent = fileContent.replace('data:image/png;base64','');
                    let postCreateObject = {
                        "title" : title,
                        "tag" : tagObject,
                        "readingMinutes" : parseInt(readingMinutes,10),
                        "mainContent" : mainContent,
                        "fileName" : fileName,
                        "fileExtension" : fileExtension,
                        "fileContent" : cleanFileContent
                    }
                    let responseObject = await app.client.request(undefined,'posts','POST',undefined,postCreateObject);
                    console.log(responseObject)
                    if(responseObject){
                        window.location = '/';
                    }
                }
            })
        } else {
            console.log('File format acceptable are: '+acceptableExtensions);
        }
    })
}

app.homePost = async function(){

    let serverResponse = await app.client.request(undefined,'posts','GET',undefined,undefined);
    app.showPost(serverResponse)
}

app.showPost = async function(results){

    let serverResponse = results;
    let message = document.querySelector('.message');
    if(serverResponse.Error){
        let allCard = document.querySelectorAll('.tutorialsCard');
        for(let i=0;i<allCard.length;i++){
            allCard[i].remove();
        }
        message.innerText = serverResponse.Error;  
    } else {
        let allCard = document.querySelectorAll('.tutorialsCard');
        for(let i=0;i<allCard.length;i++){
            allCard[i].remove();
        }
        for(let j=0;j<serverResponse.length;j++){
            let queryStringObject = {
                "id" : serverResponse[j],
            }
            let singlePostData = await app.client.request(undefined,'posts','GET',queryStringObject,undefined);
            let tutorialContainer = document.querySelector('.tutorialsContainer');
            let tutorialsCard = document.createElement('a');
            let tutorialsInfo = document.createElement('div');
            let postImage = document.createElement('img');
            let postTitle = document.createElement('h2');
            let readingMinutes = document.createElement('div');
            let readingMinutesP = document.createElement('p');
            let tagsContainer = document.createElement('div');
            let tags1 = document.createElement('p');
            let tags2 = document.createElement('p');
            let tags3 = document.createElement('p');
            tutorialContainer.appendChild(tutorialsCard).appendChild(tutorialsInfo);
            tutorialsCard.setAttribute('class','tutorialsCard');
            tutorialsCard.setAttribute('href','read?id='+singlePostData.id);
            tutorialsInfo.setAttribute('class','tutorialsInfo');
            postImage.src = './../public/images/upload/'+singlePostData.fileName+'.'+singlePostData.fileExtension;
            postTitle.setAttribute('class','postTitle');
            tutorialsInfo.appendChild(postImage);
            tutorialsInfo.appendChild(postTitle).innerText = singlePostData.title;
            tagsContainer.setAttribute('class','tags');
            tutorialsInfo.appendChild(tagsContainer).appendChild(tags1).innerText = singlePostData.tag[0];
            tagsContainer.appendChild(tags2).innerText = singlePostData.tag[1];
            tagsContainer.appendChild(tags3).innerText = singlePostData.tag[2];
            readingMinutes.setAttribute('class','minReading');
            tutorialsInfo.appendChild(readingMinutes).appendChild(readingMinutesP).innerText = singlePostData.readingMinutes+' min.';
        }
    }
}

app.searchBar = async function(){
    try{
        let postSearchForm = document.querySelector('#searchForm');
        postSearchForm.addEventListener('submit',async function(e){
            e.preventDefault();
            let formData = new FormData(e.target);
            let keyword = formData.get('keyword');
            let queryStringObject = {
                'keyword' : keyword,
            }
            let serverResponse = await app.client.request(undefined,'posts','GET',queryStringObject,undefined);
            app.showPost(serverResponse);
        })
    } catch(e){
        console.error(e)
    }
}

app.readPost = async function(){
    let mainImage = document.querySelector('.mainImage');
    let headingContainer = document.querySelector('.headingContainer');
    mainImage.src = headingContainer.dataset.link;
}

app.editPost = async function(){
    try{
        let postId = window.location.href.split('=')[1];
        postId = typeof(postId) == 'string' && postId.trim().length == 20 ? postId.trim() : false;
        let queryStringObject = {
            'id' : postId
        }
        let postData = await app.client.request(undefined,'posts','GET',queryStringObject,undefined);
        console.log(postData);
        let imagePreview = document.querySelector('#imagePreview');
        let titleInput = document.querySelector('[name=title]');
        let mainContentInput = document.querySelector('[name=mainContent]');
        let tag1Input = document.querySelector('[name=tag1]');
        let tag2Input = document.querySelector('[name=tag2]');
        let tag3Input = document.querySelector('[name=tag3]');
        let readingMinutesInput = document.querySelector('[name=readingMinutes]');
        titleInput.value = postData.title;
        mainContentInput.value = postData.mainContent;
        tag1Input.value = postData.tag[0];
        tag2Input.value = postData.tag[1];
        tag3Input.value = postData.tag[2];
        readingMinutesInput.value = postData.readingMinutes;
        imagePreview.src = '/public/images/upload/'+postData.fileName+'.'+postData.fileExtension;


        // Build the post upadte object
        let postCreateForm = document.querySelector('#postEditForm');
        postCreateForm.addEventListener('submit',async function(e){
            e.preventDefault();
            let formDataString = new FormData(e.target);
            let title = formDataString.get('title');
            let tag1 = formDataString.get('tag1');
            let tag2 = formDataString.get('tag2');
            let tag3 = formDataString.get('tag3');
            let readingMinutes = formDataString.get('readingMinutes');
            let postImage = formDataString.get('postImage');
            let mainContent = formDataString.get('mainContent');
            let tagObject = [];
            tagObject.push(tag1.toLocaleLowerCase());
            tagObject.push(tag2.toLocaleLowerCase());
            tagObject.push(tag3.toLocaleLowerCase());
            let fileName = postImage.name;
            let fileExtension = fileName.substring(fileName.indexOf('.') + 1, fileName.length) || fileName;
            let acceptableExtensions = ['png','jpg','jpeg'];
            if(postImage.size === 0){
                let postEditObject = {
                    "id" : postId,
                    "title" : title,
                    "tag" : tagObject,
                    "readingMinutes" : parseInt(readingMinutes,10),
                    "mainContent" : mainContent,
                }
                let serverResponse = await app.client.request(undefined,'posts','PUT',undefined,postEditObject);
                console.log(serverResponse);
            }
            console.log(fileExtension)
            if(acceptableExtensions.indexOf(fileExtension) > - 1){
                let fileReader = new FileReader();
                fileReader.readAsDataURL(postImage);
                fileReader.addEventListener('load',async function(e){
                    let fileContent = e.target.result;
                    if(fileExtension == 'jpeg' || fileExtension == 'jpg'){
                        let cleanFileContent = fileContent.replace('data:image/jpeg;base64','');
                        let postCreateObject = {
                            "id" : postId,
                            "title" : title,
                            "tag" : tagObject,
                            "readingMinutes" : parseInt(readingMinutes,10),
                            "mainContent" : mainContent,
                            "fileName" : fileName,
                            "fileExtension" : fileExtension,
                            "fileContent" : cleanFileContent
                        }
                        let responseObject = await app.client.request(undefined,'posts','PUT',undefined,postCreateObject);
                        if(responseObject){
                            window.location = '/';
                        }
                    } else {
                        let cleanFileContent = fileContent.replace('data:image/png;base64','');
                        let postCreateObject = {
                            "id" : postId,
                            "title" : title,
                            "tag" : tagObject,
                            "readingMinutes" : parseInt(readingMinutes,10),
                            "mainContent" : mainContent,
                            "fileName" : fileName,
                            "fileExtension" : fileExtension,
                            "fileContent" : cleanFileContent
                        }
                        let responseObject = await app.client.request(undefined,'posts','PUT',undefined,postCreateObject);
                        console.log(responseObject)
                        if(responseObject){
                            window.location = '/';
                        }
                    }
                })
            } else {
                console.log('File format acceptable are: '+acceptableExtensions);
            }
        })

    } catch(e){
        console.error(e);
    }
}


app.showPreview = function(){
    let postImage = document.querySelector('#postImage');
    postImage.addEventListener('change',function(event){
        if(event.target.files.length > 0){
            let src = URL.createObjectURL(event.target.files[0]);
            let preview = document.getElementById('imagePreview');
            preview.src = src;
            
           
        }
    })
}


app.init = function(){
    if(window.location.pathname === '/'){
        app.homePost();
        app.searchBar();
    }
    if(window.location.pathname === '/create'){
        app.postCreate();
        app.showPreview();
    }
    if(window.location.pathname === '/read'){
        app.readPost();
    }
    if(window.location.pathname === '/edit'){
        app.editPost();
        app.showPreview();
    }
}

app.init();

export {app};