var timeStart = Date.now();

// Import des modules node.js
var request = require('request');
var pg = require('pg');
var fs = require('fs');



// Parametres
var args = process.argv.slice(2);

if(args.length != 5)
{
    return console.error("Usage :\n"
                        +"@param args[0] doit être l'adresse de la base de données avec le numéro de port ex: 0.0.0.0:5432 ou localhost:5432\n"
                        +"@param args[1] doit être le nom de la base de données\n"
                        +"@param args[2] doit être le nom de la table où insérer les données\n"
                        +"@param args[3] doit être le nom d'utilisateur pour se connecter à la base de données\n"
                        +"@param args[4] doit être le mot de passe pour se connecter à la base de données\n");
    // Exemple : node insertVelovDispo.js localhost velov vlj_el_velov postgres admin
}

// Chaine de connexion a la bd postgres
var conString = "postgres://"+args[3]+":"+args[4]+"@"+args[0]+"/"+args[1];
console.log("Connection string: " + conString);


// Formattage de la date pour le nom du fichier
Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
    value: function() {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return this.getFullYear() +
               pad2(this.getMonth() + 1) +
               pad2(this.getDate()) +
               pad2(this.getHours()) +
               pad2(this.getMinutes()) +
               pad2(this.getSeconds());
    }
});


// Requete http du json velov
var url = 'https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json';
request(url, function callbackRequest(error, response, body) {

	// Si echec de la requete http
	if (error || response.statusCode != 200)  {
		console.log("Got an error: ", error, ", status code: ", response.statusCode);
	}
	else
	{
		// Succes de la requete http
		
		// Ecriture du fichier
		var fileName = "jsonFiles/velov_"+(new Date().YYYYMMDDHHMMSS())+".json";
		fs.writeFile(fileName, body, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The file was saved : " + fileName);
		}); 
		
		// Lecture du json
		var jsonResponse = JSON.parse(body);
		var data = jsonResponse.values;
		console.log("Got a response:", data.length, "data");
		//console.log("Got a response: ", body);


		// Connexion a la bd
		var client = new pg.Client(conString);
		client.connect(function callbackConnect(err) {
			if(err) {
				return console.error('could not connect to postgres', err);
			}
	  
			// Construction du tableau des valeurs a inserer
			var values = new Array();
			for(var i = 0; i < data.length; i++) {
				values.push([
						data[i].number,
						data[i].name,
						data[i].address,
						data[i].address2,
						data[i].commune,
						data[i].nmarrond,
						data[i].bonus,
						data[i].pole,
						data[i].lat,
						data[i].lng,
						data[i].bike_stands,
						data[i].status,
						data[i].available_bike_stands,
						data[i].available_bikes,
						data[i].availabilitycode,
						data[i].availability,
						data[i].banking,
						data[i].gid,
						data[i].last_update,
						data[i].last_update_fme
						]);
				
				//console.log(data[i].name);
				//Si on avait un callback dans la boucle, il faudrait gérer l'itération en asynchrone : cf. http://metaduck.com/01-asynchronous-iteration-patterns.html
			}
			//console.log(values);
		
		
			// On insere toutes les lignes en 1 seule requete (ce qui permet d'inserer 349 lignes en 1.2s au lieu de 2.5s en faisant 349 requetes (test sur PC))
			// http://stackoverflow.com/questions/24008668/mass-insert-into-postgres-with-brianc-node-postgres
			// Ajout de replace(/'/g,'\'\'') pour remplacer les ' des adresses (rue de l'université...) par des '' pour la chaine d'insertion pg
			values = JSON.stringify(values).replace(/'/g,'\'\'').replace(/\[/g,"(").replace(/\]/g,")").replace(/"/g,'\'').slice(1,-1);
			client.query(
					//'INSERT INTO dispo (number, last_update_fme, last_update, available_bike_stands, available_bikes, status)'
					'INSERT INTO '+args[2]+' (number,name,address,address2,commune,nmarrond,bonus,pole,lat,lng,bike_stands,status,available_bike_stands,available_bikes,availabilitycode,availability,banking,gid,last_update,last_update_fme)'
					+ ' VALUES ' + values, 
				function callbackQuery(err, result) {
					if(err) {
						console.error('error running query', err);
					} else {
						console.log("Fin:", data.length, "insert ok in", (Date.now()-timeStart)/1000, "seconds");
					}
					client.end();
				}
			);
		});	
	}

});

// todo :
// tester avec native bindings (pg-native)
// utiliser objet pour clarifier code
// utiliser un orm pour simplifier l'insert...
