var argh = require('argh');

var opts = {
    'username': argh.argv.username || process.env.MSGN_USERNAME,
    'port' : argh.argv.port || process.env.MSGN_PORT || 3000
};