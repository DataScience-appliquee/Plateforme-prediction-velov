var cheerio = require('cheerio');
var http = require("http");
//var geo = require('./geo.js');
var fs = require('fs');

// Utility function that downloads a URL and invokes
// callback with the data.
function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}

// http://www.spectacles.carrefour.fr/rechercheDetaillee.do?embedded=false&rechercheDetailleeBean.onlytr=&rechercheDetailleeBean.menu=&rechercheDetailleeBean.currentPage=&rechercheDetailleeBean.mode_rech=detaillee&rechercheDetailleeBean.sort=date&rechercheDetailleeBean.fulltext=&rechercheDetailleeBean.searchville=Lyon&rechercheDetailleeBean.searchcodesalle=&rechercheDetailleeBean.searchtitle=&rechercheDetailleeBean.searchsalle=&rechercheDetailleeBean.searchtheme=ALL&rechercheDetailleeBean.searchsoustheme=ALL&rechercheDetailleeBean.searchgenre=&rechercheDetailleeBean.nouveautes=false&rechercheDetailleeBean.topvente=&rechercheDetailleeBean.searchregion=ALL&rechercheDetailleeBean.searchregionadministrative=&rechercheDetailleeBean.searchdept=69&rechercheDetailleeBean.searchpays=ALL&rechercheDetailleeBean.searchdatedebut=&rechercheDetailleeBean.searchdatefin=&rechercheDetailleeBean.searchjours=ALL&rechercheDetailleeBean.searchbudget=NULL&rechercheDetailleeBean.max=&rechercheDetailleeBean.searchcodins=&rechercheDetailleeBean.printathome=false&rechercheDetailleeBean.artiste=&rechercheDetailleeBean.groupCodMan=&rechercheDetailleeBean.bonsPlans=&rechercheDetailleeBean.cartePass=&rechercheDetailleeBean.carteFidelite=&rechercheDetailleeBean.groupContent=&rechercheDetailleeBean.lat=&rechercheDetailleeBean.lng=&rechercheDetailleeBean.nbKilometres=&rechercheDetailleeBean.modeAffichage=&rechercheDetailleeBean.adresseProximite=&rechercheDetailleeBean.forceReturnGroupe=&offset=40&nbResultatAffiches=400&showTriTheme=false
download("http://www.spectacles.carrefour.fr/rechercheDetaillee.do", function(response) {
	var buffer = [];
	
	parseData(response, buffer);
	
	saveToFile(JSON.stringify(buffer));
});

function parseData(response, buffer) {
    $ = cheerio.load(response);
	
	$('#produitList > li').each(function(i,v){
		var entry = cheerio.load(v);
		var data = {};
		data.title = entry('h3').html();
		data.lieu = entry('.lieu').html();
		data.date = entry('.date').html();
//		geo.geocode(data.lieu, function(geodata){
//			data.location = geodata;
//			console.log(data);
//		})
		buffer.push(data);
	});
}
function saveToFile(data) {
	fs.writeFile("./data/dump.json", data, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	
	    console.log("The file was saved!");
	});
}