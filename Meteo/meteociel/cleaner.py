#!/usr/bin/python

# -*- coding: UTF-8 -*-

def cleaner(source):
    "Clean all source code to make something sweet or at least, trying to"
    # Brute encode to utf-8 because source code looks like a mix between iso-8859-1 and something else (kind of a joke isn't it ?)
    # It seems to be ok but at html.fromString(trueCode) it's going crazy, it changes string's charset 
    # which is making me crazy. Doesn't matter, I have another solution ;)
    #source = source.encode("utf-8")
    #source = UnicodeDammit(source)
    #source = source.unicode_markup

    # Getting the one and only useful code in all of this garbage
    startIndex = source.index("<table width=100% border=1 cellpadding=1 cellspacing=0 bordercolor=#C0C8FE bgcolor=#EBFAF7>")
    startingCode = source[startIndex:]
    endIndex = startingCode.index("</table>")
    trueCode = startingCode[:endIndex+8]

    # It would have been easier if it worked on this shitty website source code...
    #print(clean_html(trueCode))

    # but instead, I have to clean this mess manually... 
    trueCode = trueCode.replace("<br>", "")
    trueCode = trueCode.replace("<i>", "")
    trueCode = trueCode.replace("</i>", "")
    trueCode = trueCode.replace("<b>", "")
    trueCode = trueCode.replace("</b>", "")
    trueCode = trueCode.replace("&nbsp;", " ")
    trueCode = trueCode.replace("&nbsp", "")
    trueCode = trueCode.replace(" align=center", "")
    trueCode = trueCode.replace(" align=\"center\"", "")
    trueCode = trueCode.replace(" colspan=2", "")
    trueCode = trueCode.replace("<div>", "")
    trueCode = trueCode.replace("</div>", "")

    # Delete all units
    trueCode = trueCode.replace(" hPa", "")
    trueCode = trueCode.replace(" h", "")
    trueCode = trueCode.replace(" km/h", "")
    trueCode = trueCode.replace("%", "")
    trueCode = trueCode.replace(" km", "")
    trueCode = trueCode.replace(" aucune", "0")

    #... and apply my encoding charset solution !
    trueCode = trueCode.replace(u"\xe9", "e")
    trueCode = trueCode.replace(u" \xb0C", "")
    
    return trueCode
