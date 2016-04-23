// cf. doc https://github.com/lapwinglabs/x-ray

var fs = require('fs');
var Xray = require('x-ray');
var x = Xray();


// Exemple pour une date donnee : http://www.petit-bulletin.fr/lyon/recherche-agenda.html?idvillepb=1&quand=2016-3-1&ou=V1
x('http://www.petit-bulletin.fr/lyon/recherche-agenda.html?idvillepb=1', 'span.agenda a', [{
  title: 'h4',
  type: 'p span',
  lieu: 'b',
  date: x('a', ['span']),
}])
(function(err, obj) {
    // pour chaque evenement
    for (var index in obj)
    {
        // on va chercher la date et l'heure dans le texte
        var evt = obj[index];
        if( evt.date.length > 0 && evt.date[1].indexOf('>') > -1 ) evt.date = evt.date[1].substr(evt.date[1].indexOf('>')+2);
    }

    //console.log(err);
    //console.log(obj);
    console.log(obj.length + ' evenements');
    
    saveToFile(JSON.stringify(obj));
})
  .paginate('ul.pagination a:contains("Suiv")@href')
  .limit(5)
//  .write('results.json')



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

function saveToFile(data) {
    // Ecriture du fichier
    var fileName = "./data/eventPetitBulletin_"+(new Date().YYYYMMDDHHMMSS())+".json";
    fs.writeFile(fileName, data, function(err) {
        if(err) {
            return 'Erreur: ' + console.log(err);
        }
        console.log("The file was saved : " + fileName);
    }); 
}