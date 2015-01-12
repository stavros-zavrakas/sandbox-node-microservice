var packageJson = require("./../package.json");

module.exports = function(app){
    app.get('/api', function (req, res) {
        res.send({
            name : packageJson.name,
            version : packageJson.version,
            description : packageJson.description || ""
        });
    });

    app.get('/api', function (req, res) {
        res.send('Hello API');
    })
};








