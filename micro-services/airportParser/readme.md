airport parser micro-service
============================

#goal

Detect airports in a given search string

#airport reference list

The ./data/airports.json contains a list of airports.
A single airport definition looks like

'''json
  {
    "name":"London, All Airports",
    "city":"London",
    "country":"United Kingdom",
    "iataCode":"LON",
    "icaoCode":"",
    "latitude":51.508056,
    "longitude":-0.127778,
    "altitudeInFeet":66,
    "timeZoneOffsetFromUTC":0,
    "daylightSavingsTime":"E",
    "timeZoneInTzDataFormat":"Europe/London",
    "countryIsoCode2":"GB",
    "score":1
  }
'''

An index is build on the airport.name, airport.city, airport.country.
A score 0.00 -> 1.00 can be given to default airports for United Kingdom
we have here give it the max score of 1 and will thus be the default airport in case of a search q="United Kingdom"

#Usage

see ./test/countryParserTests for usa cases and examples.
please note the airportParser.init() function has to be called before using the
airportParser.parseSentence("your_sentence") function.

##example

Create a request message by posting the following message on the message-bus

'''json
{
    "topic":"search.topic.airport",
    "processId":""
    "q":"2 nights from London to Italy"
}
'''