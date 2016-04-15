// resolve api doc:
// http://developer.factual.com/api-docs/#Resolve

var auth = require('./auth');
var Factual = require('factual-api');
var factual = new Factual(auth.key, auth.secret);
factual.startDebug();

// resovle from name and address info
var data = JSON.stringify({
        name: "AT&T Center",
        address: "1150 S Olive St",
        locality: "Los Angeles",
        region: "CA",
        postcode: "90015",
        country: "us"
});

factual.get('/t/places-us/resolve',
            {values:data},
            function (error, res) {
                if (error) { console.log(error); }
                else if (res) { console.log(res); }
});
