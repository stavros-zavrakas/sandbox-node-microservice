var fs = require('fs');
var spdy = require('spdy');
var logo = fs.readFileSync('images/logo.png');


//Get the certificates
var options = {
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.crt'),
    ca: fs.readFileSync('keys/server.csr')
};

//Set-up a spdy server
var server = spdy.createServer(options, function(request, response) {
    var headers = {
        'content-type': 'image/png'
    };

    response.push('/logo.png', headers, function(err, stream){
        if (err) return;
        stream.end(logo);
    });

    response.writeHead(200, {'content-type': 'text/html'});

    var message = "No SPDY for you!"
    if (request.isSpdy){
        message = "YAY! SPDY Works!"
    }

    response.end("" +
        "<html>" +
        "<head>" +
        "<title>First SPDY App!</title>" +
        "<head>" +
        "<body>" +
        "<h1>" + message + "</h1>" +
        "<img src='logo.png'></img>" +
        "</body>" +
        "<html>");
});

server.listen(8081);