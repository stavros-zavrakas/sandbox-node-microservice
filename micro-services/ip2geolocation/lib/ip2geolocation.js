"use strict";
/*
* Quick work-arround to detect date-time entities in a sentence using the standford NLP processor
*
*/
var ip2geolocation = {};
var request = require("request");


ip2geolocation.init = function init(signature){
    ip2geolocation._signature = signature;
};


ip2geolocation.getGeolocation = function getGeolocation(ipAddress,cb){
    request.get(
        "http://www.telize.com/geoip/" + ipAddress,
        {
            json : true
        },
        function(err,httpResponse,body){
            if (err){
                return cb(err,null);
            }
            cb(null,body);
        });
};

ip2geolocation.processMessage = function processMessage(message, cb){
    var timer = startTimer();
    //Ensure there is a results section
    message.results = message.results || {};
    //Process only if the message was not processed
    if (message.results[ip2geolocation._signature.service] == undefined){
        ip2geolocation.getGeolocation(message.ipAddress, function(err,result){
            message.results[ip2geolocation._signature.service] = {
                signature : ip2geolocation._signature,
                timer : stopTimer(timer),
                result : result
            };
            cb(null,'processed',message);
        });
    }
    else {
        cb(null,'ignored',message);
    }
};

module.exports = ip2geolocation;

/**
 * Starts a high resolution operating system timer
 * @return {Array} An array of [number, number] representing the time in [whole seconds, the nanoseconds remainder]
 */
function startTimer() {
    return process.hrtime();
}

/**
 * Computes the delta between now and a `startTimer()` call
 * using a high resolution timer.
 * @param  {Array} start a result from `startTimer()`
 * @return {number}       The time delta in whole milliseconds
 */
function stopTimer(start) {
    var end = process.hrtime(start);
    return parseInt(((end[0] + end[1] / 1e9) * 1e3), 10);
}