"use strict";

//Use the NodeJS NLP module for JaroWinklerDistance detection
var natural = require("natural");
var airportParser = {};

/**
 * Initialise the airport parser
 */
airportParser.init = function init(){
    //load the data file
    airportParser._rawData = require("./../data/airports.json");
    //Create a new index
    airportParser._index = [];
    //index the airports
    airportParser._rawData.forEach(function(airport){
        airport.score = airport.score || 0;
        if (airport.iataCode.length == 3){
            airportParser._index.push({label : airport.name, airport: airport});
            airportParser._index.push({label : airport.city, airport: airport});
            airportParser._index.push({label : airport.country, airport: airport});
        }
    });
};

/**
 * Do a JaroWinklerDistance string comparison between a given word and the index
 * The highest probability and score (defined on resource file so set defaults) wins
 * @param str
 * @returns {{probability: number, str: string, airport: {}}}
 */
airportParser.parse = function parse(str){
    var result = {
        probability : 0,
        str: str || "",
        airport: {}
    };
    airportParser._index.forEach(function(indexItem){
        var matchValue = natural.JaroWinklerDistance(str,indexItem.label);
        if (matchValue >= result.probability && indexItem.airport.score >= (result.airport.score || 0)){
            result.probability = matchValue;
            result.airport = indexItem.airport;
            //console.log({str : str, airport : airport, result : result});
        }
    });
    return result;
};

/**
 * Tokenise a given string and try to find the airports in it. Results can be filtered out using the minMatchValue.
 * @param str : input string e.g. "Holiday from London to Spain"
 * @minMatchValue number e.g. 0.95 --> match-level of at least 95%
 * @returns {{probability: number, str: string, airport: {}}}
 */
airportParser.parseSentence = function parseSentence(str, minMatchValue){
    minMatchValue = minMatchValue || 0;
    var tokenizer = new natural.WordTokenizer();
    var words = tokenizer.tokenize(str);
    var result = [];

    words.forEach(function(word){
        var parsedResult = airportParser.parse(word);
        if (parsedResult.probability >= minMatchValue){
            result.push(parsedResult);
        }
    });
    return result;
};

module.exports = airportParser;