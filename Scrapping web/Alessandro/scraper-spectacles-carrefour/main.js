"use strict";

var fs = require('fs');

// http://casperjs.org/
var casper = require('casper').create({
  verbose: true,
  logLevel: "info",
  viewportSize: {
        width: 1024,
        height: 768
  },
  pageSettings: {
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11",
    loadImages: false
  }
});

// the following array will, at the end of the day (!), 
// contain the list of shows, each show being a JSON object
var shows = [];

var searchFilter = 'lyon';
casper.start('http://www.spectacles.carrefour.fr/recherche/' + searchFilter, function() {
    this.capture('screenshot.png');
});

casper.then( scrape );

casper.run( function() {
	var timestamp = new Date();
	var filename = 'data/dump_' + timestamp.toISOString() + '.json';
	fs.write(filename, JSON.stringify(shows), 'w');
	
	this.echo('Done!');
	this.echo('\n');
    // I don't know why this.echo does not want to print shows.length !!! Let's switch to console.log ;-)
    console.log( '# of scraped shows = ', shows.length );
	this.echo('dump file = ./' + filename).exit();
});


// ---------- main (recursive) scraping function ----------

function scrape() {

    
    if (casper.exists('#plusDeResultat')) {
        
        casper.click('#plusDeResultat');

    }

    casper.waitUntilVisible('#plusDeResultat', scrape, function() {

    	var urls = this.evaluate(function() {
    	        
    	        var elements = __utils__.findAll('a.thumbnail');
    	        
    	        return elements.map(function(e) {
    	            return e.getAttribute('href');
    	        
    	        });
    	    });

    	this.each( urls, function(self, url) {

    		// initialization
    		var show = {};
    		var selectorRoot = '#colonneReservation > div.zoneInfoGenerale > section > div:nth-child(1) > div.span8 > div.caption > ';
    		
    		self.thenOpen('http://www.spectacles.carrefour.fr' + url, function() {

    	        var title = this.getHTML(selectorRoot + 'hgroup > h1');
    			// this.echo(title);
    			show.title = title;
    			

    			if ( this.exists(selectorRoot + 'hgroup > h2') ) {
    				var subtitle = this.getHTML(selectorRoot + 'hgroup > h2');	
    				// this.echo(subtitle);
    				show.subtitle = subtitle;
    			}
    			
    			var fullAddress = this.fetchText(selectorRoot + 'section.address > p').replace(/[\n\r]+/g, '').trim().split(/\s{2,}/g);

    			show.place   = fullAddress[0];
    			show.address = fullAddress[1];
    			show.zipcode = fullAddress[2];
    			show.city    = fullAddress[3];

		 		var showtimes = this.evaluate( function() {

		 			var dates = document.getElementsByClassName('calendrierHorraires');

		 			// __utils__.echo("# dates = " + dates.length);

		 			var i, j;
		 			var date, time;
		 			var datetimes = [];

		 			for ( i = 0; i < dates.length; i++ ) {

		 				// if ( true ) {

		 					date = dates[i].id.split('_');

		 					var times = dates[i].querySelectorAll('a[data-toggle="tooltip"]');

		 					for ( j = 0; j < times.length; j++ ) {

		 						// if ( true ) { //times[j].innerHTML !== undefined ) {
		 							
		 							time = times[j].innerHTML.split(':', 2);
		 							// __utils__.echo(time);
		 							// N.B.: substr(0, 2) was added so as to trip the trailing "<sup>C</sup>" that's sometimes present...
		 							var datetime = new Date( date[0], date[1]-1, date[2], time[0], time[1].substr(0, 2), 0);
		 							datetimes.push( datetime.toISOString() );

		 						// }
		 					}
		 				// }
		 			}
		 			
		 			return datetimes;

		 		});

	 			show.showtimes = showtimes;
	 			this.echo(JSON.stringify(show));
	 			shows.push( show );	

    	    });
    	});
    });
}


function monthNameToNumber( monthName ) {
	switch( monthName.toLowerCase() ) {
		case "janvier":
			return "01";
			break;
		case "fevrier":
			return "02";
			break;
		case "février":
			return "02";
			break;
		case "mars":
			return "03";
			break;
		case "avril":
			return "04";
			break;
		case "mai":
			return "05";
			break;
		case "juin":
			return "06";
			break;
		case "juillet":
			return "07";
			break;
		case "août":
			return "08";
			break;
		case "aout":
			return "08";
			break;
		case "septembre":
			return "09";
			break;
		case "octobre":
			return "10";
			break;
		case "novembre":
			return "11";
			break;
		case "decembre":
			return "12";
			break;
		case "décembre":
			return "12";
			break;
	}
}