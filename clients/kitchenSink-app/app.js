var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var routes = require("./lib/routes.js")(app);


app.use('/app', express.static(__dirname + '/public'));

http.listen(3000, function () {
    var host = http.address().address
    var port = http.address().port
    console.log('Example app listening at http://%s:%s', host, port)
});

io.on('connection', function(socket){
    console.log('a new user connected');
});