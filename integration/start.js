redis-server /usr/local/etc/redis.conf

node ./../micro-services/airportParser/redis.js

node ./integration.js > results.log
