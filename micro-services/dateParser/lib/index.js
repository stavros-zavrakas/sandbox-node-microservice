"use strict";


/*
* Quick work-arround to detect date-time entities in a sentence using the standford NLP processor
*
*/
var dateParser = {};
var request = require("request");
var moment = require("moment");
var _ = require("underscore");
var xml2json = require("xml2json");


dateParser.init = function init(){
    //load the data file
    dateParser._rawData = require("./../data/holidays.json");
    //Create a new wordlist
    dateParser._words = [];

    dateParser._rawData.forEach(function(namedDate){
        var score = namedDate.score || 0.99;
        if (namedDate.name.length > 0){
            dateParser._words.push({dateFrom : namedDate.from, dateTo : namedDate.to, label : namedDate.name, score : score});
            namedDate.synonyms.forEach(function(synonym){
                dateParser._words.push({dateFrom : namedDate.from, dateTo : namedDate.to, label : namedDate.synonym, score : score});
            });
        }
    });
};


dateParser.parseSentence = function parseSentence(str,cb){
    var result = [];
    request.post(
        "http://nlp.stanford.edu:8080/sutime/process",
        {
            qs: {
                d: moment().format("YYYY-MM-DD"),//2014-12-29
                annotator:'sutime',
                q:str,
                rules:'english',
                relativeHeuristicLevel:'NONE'
            }
        },
        function(err,httpResponse,body){
            if (err){
                return cb(err,null);
            };
            //extract the result out the page
            body.match(/&lt;TIMEX3(.*?)&lt;\/TIMEX3&gt;/g).forEach(function(extractedDate){
                var xml = _.unescape(extractedDate);
                var json = JSON.parse(xml2json.toJson(xml));
                result.push({
                    value : moment(json.TIMEX3.value).format("YYYY-MM-DD"),
                    label : json.TIMEX3['$t']
                })
            });
            cb(null,result);
        });
};

module.exports = dateParser;