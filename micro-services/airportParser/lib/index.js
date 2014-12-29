"use strict";

var natural = require("natural");

var airportParser = {};

airportParser.init = function init(){
    //load the data file
    airportParser._rawData = require("./../data/airports.json");
    //Create a new wordlist
    airportParser._words = [];

    airportParser._rawData.forEach(function(airport){
        var score = airport.score || 0.99;
        if (airport.iataCode.length == 3){
            if (airport.name == 'All Airports'){
                airport.name = airport.city + ' ' + airport.name
                score = airport.score || 1;
            };
            airportParser._words.push({iataCode : airport.iataCode, label : airport.name, score : score});
            airportParser._words.push({iataCode : airport.iataCode, label : airport.city, score : score});
            airportParser._words.push({iataCode : airport.iataCode, label : airport.country, score : score});
        }
    });
};

airportParser.parse = function parse(str){
    var result = {
        probability : 0,
        iataCode: ""
    };
    airportParser._words.forEach(function(word){
        var matchValue = natural.JaroWinklerDistance(str,word.label);
        if (matchValue + word.score > result.probability + 1){
            result.probability = matchValue;
            result.iataCode = word.iataCode;
        }
    });
    return result;
};

airportParser.parseSentence = function parseSentence(str, minMatchValue){
    minMatchValue = minMatchValue || 0;
    var tokenizer = new natural.WordTokenizer();
    var words = tokenizer.tokenize(str);
    var result = [];

    words.forEach(function(word){
        var parseResult = airportParser.parse(word);
        if (parseResult.probability >= minMatchValue){
            result.push({
                word : word,
                result : parseResult
            });
        };
    });

    return result;
};



module.exports = airportParser;