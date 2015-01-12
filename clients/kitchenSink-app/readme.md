#KitchenSink-app

Sample application which shows how to use the micro-services.

The application consist out of 3 main parts:

* a simple UI showing the different features
* a REST api
* a socket.io implementation for pushes from the server to the client


##Technology stack

* NodeJs is used as app server
* The UI is written in angular.js
* (jspm)[http://jspm.io/] is used as UI package manager


















#SPDY API

Sample API to expose our Internal Message Bus to the outside world using a SPDY api.

## What is SPDY

SPDY (pronounced speedy) is an open networking protocol developed primarily at
Google for transporting web content. SPDY manipulates HTTP traffic,
with particular goals of reducing web page load latency and improving web security.

browser support:
[http://caniuse.com/#search=spdy](http://caniuse.com/#search=spdy)

more information:
[http://en.wikipedia.org/wiki/SPDY](http://en.wikipedia.org/wiki/SPDY)





# Important notice

some inspiration : https://coderwall.com/p/2gfk4w/your-first-spdy-app

'''
spdy-js $ mkdir keys
spdy-js $ openssl genrsa -des3 -out keys/server.orig.key 2048
spdy-js $ openssl rsa -in keys/server.orig.key -out keys/server.key
spdy-js $ openssl req -new -key keys/server.key -out keys/server.csr
spdy-js $ openssl x509 -req -days 365 -in keys/server.csr -signkey keys/server.key -out keys/server.crt
'''


