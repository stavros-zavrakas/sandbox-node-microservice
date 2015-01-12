"use strict";

var natural = require("natural");

var countryParser = {};

/**
 *
 */
countryParser.init = function init(signature){
    countryParser._signature = signature;
    //load the data file
    countryParser._rawData = require("./../data/countries.json");
    //Create a new wordlist
    countryParser._index = [];

    countryParser._rawData.forEach(function(country){
        country.score = country.score || 0;
        //Only index countries with a ISO code
        if (country.isoCode2.length == 2){
            countryParser._index.push({label : country.countryName, country: country});
            countryParser._index.push({label : country.capital, country: country});
        }
    });
};

countryParser.parse = function parse(str){
    var result = {
        probability : 0,
        str: str || "",
        country: {}
    };
    countryParser._index.forEach(function(indexItem){
        var matchValue = natural.JaroWinklerDistance(str,indexItem.label);
        if (matchValue >= result.probability && indexItem.country.score >= (result.country.score || 0)){
            result.probability = matchValue;
            result.country = indexItem.country;
        }
    });
    return result;
};

countryParser.parseSentence = function parseSentence(str, minMatchValue){
    minMatchValue = minMatchValue || 0;
    var tokenizer = new natural.WordTokenizer();
    var words = tokenizer.tokenize(str);
    var result = [];

    words.forEach(function(word){
        var parsedResult = countryParser.parse(word);
        if (parsedResult.probability >= minMatchValue){
            result.push(parsedResult);
        }
    });

    return result;
};

countryParser.processMessage = function processMessage(message, cb){
    var timer = startTimer();
    //Ensure there is a results section
    message.results = message.results || {};
    //Process only if the message was not processed
    if (message.results[countryParser._signature.service] == undefined){
        var result = countryParser.parseSentence(message.q, 0.95);
        message.results[countryParser._signature.service] = {
            signature : countryParser._signature,
            timer : stopTimer(timer),
            result : result
        };
        cb(null,'processed',message);
    }
    else {
        cb(null,'ignored',message);
    }
};



module.exports = countryParser;

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