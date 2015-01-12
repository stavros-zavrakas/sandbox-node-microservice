var FlakeId = require('flake-idgen');
var intformat = require('biguint-format');

var uniqueIdGen = {};

uniqueIdGen.init = function(datacenter, worker){
    uniqueIdGen._flakeIdGen = new FlakeId({ datacenter: datacenter || 0, worker: worker || 0});
};

uniqueIdGen.getUniqueId = function getUniqueId(){
    if (!uniqueIdGen._flakeIdGen){
      uniqueIdGen._flakeIdGen = new FlakeId({ datacenter:  0, worker: 0});
    }
    return  intformat(uniqueIdGen._flakeIdGen.next(), 'dec');
};

module.exports = uniqueIdGen;



