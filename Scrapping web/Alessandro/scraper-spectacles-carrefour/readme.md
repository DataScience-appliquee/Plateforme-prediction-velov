Le script permet de récupérer les données relatives aux spectacles vendus par le site Carrefour Spectacles.

**INSTALLATION**

$ npm install

**CONFIGURATION**

=> fichier "config.json"

**DEMARRAGE**

$ npm start

**CONSULTATION DES RESULTATS**

On peut utiliser le module json.tool de Python pour faire du *pretty printing* :

$ python -m json.tool *dump_file*

**NOTA BENE**

Vu le nombre de résultats relatifs à la ville de Lyon et la lenteur du script, il est recommandé de tester le script en remplaçant 'lyon' dans le *searchFilter* par une ville qui offre moins de spectacles, comme par exemple 'vienne'.

**TODO**

Optimiser le code pour réduire le temps d'exécution.
