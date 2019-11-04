var fs = require('fs');
var request = require('request');

var url = "http://13.209.89.75";

request.get(url + "/api/search", function(err, res, body) {
    fs.writeFileSync("output.json",JSON.stringify(body));
});