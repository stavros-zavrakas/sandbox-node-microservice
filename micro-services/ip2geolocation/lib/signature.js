var os = require('os');
var ip = require('ip');

var signature = {};

signature.getSignature = function getSignature(packageJson){
    return  {
        hostname : os.hostname(),
        processId : process.pid,
        service : packageJson.name + '.v' + packageJson.version,
        ip :ip.address()
    }
};

module.exports = signature;