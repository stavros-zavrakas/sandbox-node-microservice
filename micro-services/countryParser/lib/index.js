"use strict";

var natural = require("natural");

var countryParser = {};

countryParser.init = function init(){
    //load the data file
    countryParser._rawData = require("./../data/countries.json");
    //Create a new wordlist
    countryParser._words = [];

    countryParser._rawData.forEach(function(country){
        var score = country.score || 1;
        if (country.isoCode2.length == 2){
            //countryParser._words.push({isoCode2 : country.isoCode2, label : country.isoCode2});
            //countryParser._words.push({isoCode2 : country.isoCode2, label : country.isoCode3});
            countryParser._words.push({isoCode2 : country.isoCode2, label : country.countryName, score : score});
            countryParser._words.push({isoCode2 : country.isoCode2, label : country.capital, score : score});
        }
    });
};

countryParser.parse = function parse(str){
    var result = {
        probability : 0,
        isoCode2: ""
    };
    countryParser._words.forEach(function(word){
        var matchValue = natural.JaroWinklerDistance(str,word.label);
        if (matchValue + word.score > result.probability + 1){
            result.probability = matchValue;
            result.isoCode2 = word.isoCode2;
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
        var parseResult = countryParser.parse(word);
        if (parseResult.probability >= minMatchValue){
            result.push({
                word : word,
                result : parseResult
            });
        };
    });

    return result;
};



module.exports = countryParser;