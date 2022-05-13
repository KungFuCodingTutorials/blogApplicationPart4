const server = require('./server/server');

// Create the app container

let app = {};

app.init = function(){
    server.init();
}

app.init();

//Export the module
module.exports = app;