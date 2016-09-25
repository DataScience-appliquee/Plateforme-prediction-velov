#!/usr/bin/python

# -*- coding: utf-8 -*-

""" Code to scrap Lyon-Bron weather from a specific date """

from lxml import html
from datetime import datetime, timedelta
from cleaner import cleaner

import requests
import pandas as pd

# Defines which date you want to get data from, january = 1, december = 12
startingDate = datetime(2016,8,1)
endingDate = datetime(2016,8,31)
deltaDate = endingDate - startingDate

# Defines which weather station code (For Lyon-Bron it is 7480)
cityCode = 7480

# Initialisation
body = []
header = []
i = 0

for d in range(0, deltaDate.days+1):
    sourcingDate = startingDate + timedelta(days=d)

    # Get webpage source code to scrap data from it with our parameters
    rawSource = requests.get("http://www.meteociel.fr/temps-reel/obs_villes.php?jour2=%s&mois2=%s&annee2=%s&code2=%s"                              % (sourcingDate.day, sourcingDate.month-1, sourcingDate.year, cityCode)) 

    # Cleaning raw source code
    source = cleaner(rawSource.text)

    # Transforming into a tree
    tree = html.fromstring(source)
    # Browsing tree, seeking for tr 
    tables = tree.xpath('//tr')
    
    # Initializing counter
    k = 0
        
    # Get header
    header = tables[0].xpath('td/text()')
    
    # Getting values and refactoring date/time
    for td in tables:
        if k > 0:
            body.append(tables[k].xpath('td/text()'))
            body[i][0] = body[i][0].lower()
            addHour = body[i][0]
            newDate = sourcingDate + timedelta(hours=int(addHour))
            
            # Take care of summer/winter UTC time for 2015/2016 
            # Winter 2016
            if newDate > datetime(2016,10,30,2):
                addUTC = "+01"
            # Summer 2016
            elif newDate > datetime(2016,3,27,2):
                addUTC = "+02"
            # Winter 2015
            elif newDate > datetime(2015,10,25,2):
                addUTC = "+01"
            # DIY
            else:
                addUTC = "Z"
            
            newDate = str(newDate).replace(" ", "")
            newDate = newDate[:10] + "T" + newDate[10:] + addUTC
            body[i][0] = newDate           
            i+=1
        k+=1
    
header[0] = "Datetime"
data = pd.DataFrame(body, columns=header)
data = data.drop('Temps', 1)
print(data)
data.to_json("test.json", orient="records")
