const http = require('http');
const stringDecoder = require('string_decoder').StringDecoder;
const port = 3000;
const helpers = require('./helpers');
const Buffer = require('buffer').Buffer;
const handlers = require('./handlers');

let server = {}

server.httpServer = http.createServer(function(req,res){

    let queryUrl = req.url;
    let parsedUrl = new URL(queryUrl,'http://localhost:3000');
    let path = parsedUrl.pathname;
    let cleanedPath = path.replace(/^\/+|\/+$/g,'');
    const searchParamsString = parsedUrl.searchParams.toString();
    const queryStringObject = helpers.parseParams(searchParamsString);
    let queryMethod = req.method.toLocaleLowerCase();
    let headers = req.headers;
    let decoder = new stringDecoder('base64');
    let buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });
    req.on('end',function(){
        buffer += decoder.end();
        let data = {
            'cleanedPath' : cleanedPath,
            'queryStringObject' : queryStringObject,
            'method' : queryMethod,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(Buffer.from(buffer,'base64').toString('utf-8'))
        }
        let routerHandler = typeof(server.router[cleanedPath]) !== 'undefined' ? server.router[cleanedPath] : handlers.notFound;
        routerHandler = cleanedPath.indexOf('public/') > -1 ? handlers.public : routerHandler;
        function mainServer(statusCode,payload,contentType){
            contentType = typeof(contentType) == 'string' ? contentType : 'json';
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            let payloadString = '';
            if(contentType == 'json'){
                res.setHeader('Content-Type','application/json');
                res.setHeader('location','/');
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);

            }
            if(contentType == 'html'){
                res.setHeader('Content-Type','text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }
            if(contentType == 'css'){
                res.setHeader('Content-Type','text/css');
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }
            if(contentType == 'png'){
                res.setHeader('Content-Type','image/png');
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }
            if(contentType == 'javascript'){
                res.setHeader('Content-Type','text/javascript');
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }
            if(contentType == 'plain'){
                res.setHeader('Content-Type','text/plain');
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
                
            }

            res.writeHead(statusCode);
            res.end(payloadString);
        }
        try{
            const fetchServerData = async function(){
                const dataStream = await routerHandler(data);
                if(dataStream !== undefined){
                    const statusCode = await dataStream.statusCode;
                    const payload = await dataStream.payload;
                    const contentType = await dataStream.contentType;
                    mainServer(statusCode,payload,contentType);
                } else {
                    mainServer(500,{});
                }
 
            }
            fetchServerData();
        } catch(e){
            console.error(e);
        }
    })
})


// Router object
server.router = {
    '' : handlers.index,
    'public' : handlers.public,
    'create' : handlers.postCreate,
    'posts' : handlers.blogPost,
    'read' : handlers.read,
    'edit' : handlers.edit
}

server.init = function(){
    server.httpServer.listen(port,function(){
        console.log('Server listening on port: '+port);
    });
}

module.exports = server;