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


dateParser.init = function init(signature){
    dateParser._signature = signature;
    /* //load the data file
    dateParser._rawData = require("./../data/holidays.json");
    //Create a new wordlist
    dateParser._index = [];

    dateParser._rawData.forEach(function(namedDate){
        var score = namedDate.score || 0.99;
        if (namedDate.name.length > 0){
            dateParser._words.push({dateFrom : namedDate.from, dateTo : namedDate.to, label : namedDate.name, score : score});
            namedDate.synonyms.forEach(function(synonym){
                dateParser._words.push({dateFrom : namedDate.from, dateTo : namedDate.to, label : namedDate.synonym, score : score});
            });
        }
    });*/
};


dateParser.parseSentence = function parseSentence(str,cb){
    var results = [];
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
            }
            //extract the result out the page
            var result = body.match(/&lt;TIMEX3(.*?)&lt;\/TIMEX3&gt;/g) || [];

            result.forEach(function(extractedDate){
                var xml = _.unescape(extractedDate);
                var json = JSON.parse(xml2json.toJson(xml));
                results.push({
                    value : moment(json.TIMEX3.value).format("YYYY-MM-DD"),
                    label : json.TIMEX3['$t']
                })
            });

            cb(null,results);
        });
};

dateParser.processMessage = function processMessage(message, cb){
    var timer = startTimer();
    //Ensure there is a results section
    message.results = message.results || {};
    //Process only if the message was not processed
    if (message.results[dateParser._signature.service] == undefined){
        dateParser.parseSentence(message.q, function(err,result){
            message.results[dateParser._signature.service] = {
                signature : dateParser._signature,
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

module.exports = dateParser;

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