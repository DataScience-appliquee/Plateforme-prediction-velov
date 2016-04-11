var http = require('http');
var querystring = require('querystring');
var geo = require('./geo.js');

const PORT = 8080;

var server = http.createServer(function(request, response){

	var adresse = querystring.parse(request.url.substring(2)).address; // call with http://server:port/?address={address to encode}
	
	console.log(adresse);
	
	geo.geocode(adresse, function(geodata){
	    response.writeHead(501, { 'Content-Type': 'application/json' });
	    response.end(JSON.stringify(geodata));
	}, function(err) {
	    response.writeHead(501, { 'Content-Type': 'application/json' });
	    response.end(JSON.stringify({error : err}));
	})
});

server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});