/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Alle Formeln",
	LABEL_FORMULA_LIST: "Formelliste:",
	formula:{
	ABS:{	
	    Syntax:"${0}(Zahl)",
	    Disp:"Gibt den Absolutwert einer Zahl zurück."
    },
    ACOS:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Arkuskosinus einer Zahl zurück. Der Winkel wird in Radianten angegeben."
    },
    ACOSH:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt die Umkehrfunktion des Hyperbelkosinus einer Zahl zurück."
    },
    ACOT:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt die Umkehrfunktion des Kotangens einer Zahl zurück. Der Winkel wird in Radianten gemessen."
    },
    ACOTH:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt die Umkehrfunktion des Hyperbelkotangens einer Zahl zurück."
    },
    ADDRESS:{
         Syntax:"${0}(Zeile${1} Spalte${1} [Abs]${1} [A1]${1} [Blatt])",
         Disp:"Gibt den Verweis auf eine Zelle als Text zurück.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolut",
        		 result : 1
        	 }, {
        		 label : "${0} - Absolute Zeile/Relative Spalte",
        		 result : 2
        	 }, {
        		 label : "${0} - Relative Zeile/Absolute Spalte",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativ",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1-Stil",
        		 result : 0
        	 }, {
        		 label: "${0} - A1-Stil",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(Logischer Wert 1${1} [logischer Wert 2]${1} ...)",
    	Disp:"Gibt TRUE zurück, wenn alle Argumente TRUE sind."
    },
    ASIN:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Arkussinus einer Zahl zurück. Der Winkel wird in Radianten angegeben."
    },
    ASINH:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt die Umkehrfunktion des Hyperbelsinus einer Zahl zurück."
    },
    ATAN:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Arkustangens einer Zahl zurück. Der Winkel wird in Radianten angegeben."
    },
    AVERAGE:{    
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt den Durchschnitt der Argumente zurück."
    },
    AVERAGEA:{    
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt den Durchschnittswert für ein Beispiel zurück. Text wird als null gewertet."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(Bereich${1} Kriterien${1} [Durchschnittsbereich])",
    	Disp:"Gibt den Durchschnitt (arithmetisches Mittel) der Argumente zurück, die die angegebene Bedingung erfüllen."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(Durchschnittsbereich${1} Kriterienbereich1${1} Kriterien1${1} ...)",
    	Disp:"Gibt den Durchschnitt (arithmetisches Mittel) der Argumente zurück, die mehrere Bedingungen erfüllen."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Gibt den Arkustangens oder die Umkehrfunktion des Tangens der angegebenen x- und y-Koordinaten wieder. Der Arkustangens ist der Winkel der X-Achse zu einer Linie, die aus dem Ursprung (0, 0) und einem Punkt mit den Koordinaten (x_num, y_num) gebildet wird."
    },
    ATANH:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt die Umkehrfunktion des Hyperbeltangens einer Zahl zurück. Die Zahl muss zwischen -1 und 1 liegen (ausgenommen -1 und 1)."
    },
    BASE:{    
    	Syntax:"${0}(Zahl${1} Basis${1} [Minimallänge])",
    	Disp:"Konvertiert eine positive Ganzzahl in einen Text aus einem Zahlensystem zur angegebenen Basis."
    },
    BIN2DEC:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Konvertiert eine Binärzahl in eine Dezimalzahl."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Binärzahl in eine Hexadezimalzahl."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Binärzahl in eine Oktalzahl."
    },
    CEILING:{  
    	Syntax: "${0}(Zahl${1} Inkrement)",
    	Disp:"Rundet eine Zahl auf die nächstliegende ganze Zahl bzw. das nächstliegende Vielfache auf."
    },
    CHAR: {
    	Syntax: "${0}(Zahl)",
    	Disp: "Gibt ein durch die Zahl zugeordnetes Zeichen zurück. Das Zeichen wird in einer Unicode-Zeichentabelle gefunden. Die Zahl liegt zwischen 1 und 255."
    },
    CHOOSE: {
    	Syntax: "${0}(Index${1} Wert1${1} [Wert2]${1} ...)",
    	Disp: "Sucht und gibt den entsprechenden Wert laut Index zurück. Kann aus bis zu 30 Werten AUSWÄHLEN."
    },
    CODE:{
    	Syntax:"${0}(Text)",
    	Disp:"Gibt den numerischen Code für das erste Zeichen in einer Textzeichenfolge zurück, die in Unicode codiert ist"
    },
    COLUMN:{    
    	Syntax:"${0}([Referenz])",
    	Disp:"Gibt die interne Spaltennummer einer Referenz zurück."
    },
    COLUMNS:{    
    	Syntax:"${0}(Bereich)",
    	Disp:"Gibt die Spaltenanzahl in einem Bereich oder in einer Referenz zurück."
    },
    COMBIN:{
    	Syntax:"${0}(Zahl${1} gewählte_Zahl)",
    	Disp:"Gibt die Anzahl der Kombinationen für eine gegebene Anzahl von Einträgen zurück. Verwenden Sie ${0}, um die mögliche Gesamtanzahl von Gruppen für eine gegebene Anzahl von Einträgen zu bestimmen."
    },
    CONCATENATE:{   
    	Syntax:"${0}(Text 1${1} ...)",
    	Disp:"Kombiniert mehrere Textzeichenfolgen in eine Zeichenfolge."
    },
    CONVERT:{
    	Syntax:"${0}(Zahl${1} von_Einheit${1} in_Einheit)",
    	Disp:"Konvertiert eine Zahl aus einem Maßeinheitensystem in das andere.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gramm",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pfund (Avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomare Masseneinheit)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Unze (Avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Meile",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Zoll",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Fuß",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - Pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Jahr",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Tag",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Stunde",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minute",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Sekunde",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosphäre",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Millimeter Quecksilbersäule (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pound-force",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Kalorie (Internationale Tabelle)",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronenvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Horsepower-hour",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Wattstunde",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Foot-pound",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU (British thermal unit)",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Kalorie",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Pferdestärke",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - Watt",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - Tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - Gauss",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - Grad Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Grad Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Teelöffel",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Esslöffel",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Fluid ounce (Flüssigunze)",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Cup",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Pinte (USA)",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Pinte (U.K.)",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Liter",
       		 result : "\"l\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Kosinus des angegebenen Winkels zurück."
    },
    COSH:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Berechnet den Hyperbelkosinus einer Zahl."
    },
    COT:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt den Kotangens der angegebenen Zahl zurück."
    },
    COTH:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt den Hyperbelkotangens der angegebenen Zahl zurück."
    },
    COUNT:{   
    	Syntax:"${0}(Wert1${1} [Wert2]${1} ...)",
    	Disp:"Zählt die Zahlen in der Argumentliste. Texteinträge werden ignoriert."
    },
    COUNTA:{   
    	Syntax:"${0}(Wert1${1} [Wert2]${1} ...)",
    	Disp:"Zählt die Anzahl der Werte in der Argumentliste."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(Bereich)",
    	Disp: "Zählt die leeren Zellen in einem angegebenen Bereich."
    },
    COUNTIF:{
    	Syntax: "${0}(Bereich${1} Kriterien)",
    	Disp:"Zählt die Anzahl der Zellen, die die angegebene Bedingung erfüllen."
    },
    COUNTIFS:{
    	Syntax: "${0}(Kriterienbereich1${1} Kriterien1${1} ...)",
    	Disp:"Zählt die Anzahl der Zellen, die mehrere Bedingungen erfüllen."
    },
    CUMIPMT:{	
	    Syntax:"${0}(Rate${1} nper${1} pv${1} Startzeitraum${1} Endzeitraum${1} Typ)",
	    Disp:"Berechnet den kumulativen Zins, der zwischen zwei angegebenen Zeiträumen bezahlt wurde."
    },
    CUMPRINC:{	
	    Syntax:"${0}(Rate${1} nper${1} pv${1} Startzeitraum${1} Endzeitraum${1} Typ)",
	    Disp:"Berechnet den kumulativen Prinzipal, der für ein Darlehen bezahlt wurde, zwischen zwei angegebenen Zeiträumen. "
    }, 
    DATE:{	
	    Syntax:"${0}(Jahr${1} Monat${1} Tag)",
	    Disp:"Stellt eine interne Zahl für das angegebene Datum zur Verfügung."
    },  
    DATEDIF:{	
	    Syntax:"${0}(Anfangsdatum${1} Enddatum${1} Format)",
	    Disp:"Gibt den Unterschied in Jahren, Monaten oder Tagen zwischen zwei Datumsangaben zurück.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Die Anzahl der vollständigen Jahre in der Periode.",
	    		result: "\"J\""
	    	}, {
	    		label: "${0} - Die Anzahl der vollständigen Monate in der Periode.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Die Anzahl der Tage in der Periode.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Die Anzahl an Tagen zwischen Anfangsdatum und Enddatum ohne Berücksichtigung der Monats- und Jahresangabe.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Die Anzahl an Monaten zwischen Anfangsdatum und Enddatum ohne Berücksichtigung der Jahresangabe.",
	    		result: "\"JM\""
	    	}, {
	    		label: "${0} - Die Anzahl an Tagen zwischen Anfangsadatum und Enddatum ohne Berücksichtigung der Jahresangabe.",
	    		result: "\"JT\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(Text)",
	    Disp:"Gibt eine interne Zahl für einen Text mit einem möglichen Datumsformat zurück."
    }, 
    DAY:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Tag für einen gegebenen Datumswert zurück. Der Tag wird als Ganzzahl zwischen 1 und 31 zurückgegeben. Sie können auch einen negativen Datums-/Zeitwert eingeben."
    },
    DAYS360:{
    	Syntax:"${0}(Startdatum${1} Enddatum${1} [Methode])",
    	Disp:"Bestimmt die Tagesdifferenz zweier Daten basierend auf einem Jahr mit 360 Tagen.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - U.S. (NASD)-Methode",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europäische Methode",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(Startdatum${1} Enddatum${1})",
    	Disp:"Berechnet die Anzahl der Tage zwischen zwei Datumsangaben."
    },
    DEC2BIN:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Dezimalzahl in eine Binärzahl."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Dezimalzahl in eine Hexadezimalzahl."
    },
    DEC2OCT:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Dezimalzahl in eine Oktalzahl."
    },
    DEGREES:{	
	    Syntax:"${0}(Winkel)",
	    Disp:"Konvertiert Radianten in Grad."
    },
    DISC:{
    	Syntax:"${0}(Begleichung${1} Fälligkeit${1} pr${1} Rückzahlung${1} [Basis])",
    	Disp:"Berechnet den Diskontsatz für eine Sicherheit."
    }, 
    DOLLAR:{
    	Syntax:"${0}(Zahl${1} [Dezimalstellen])",
    	Disp:"Konvertiert eine Zahl in einen Text mit dem $-Währungsformat (Dollar)."
    },
    EDATE:{
    	Syntax:"${0}(Startdatum${1} Monate)",
    	Disp:"Gibt die Seriennummer zurück, die für das Datum steht, und die die angegebene Anzahl an Monaten vor oder nach dem Startdatum ist. "
    },
    EOMONTH:{
    	Syntax:"${0}(Startdatum${1} Monate)",
    	Disp:"Gibt die Seriennummer für den letzten Tag des Monats zurück, die die angegebene Anzahl an Monaten vor oder nach dem Startdatum ist. "
    },
    ERFC:{   
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt die komplementäre Fehlerfunktion zurück, integriert zwischen einer Zahl und Unendlich."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(Referenz)",
    	Disp:"Gibt eine Zahl zurück, die einem Fehlertyp entspricht"
//    		,
//    	Arguments: {
//       	 0 : [{
//       		 label : "${0} - #NULL!",
//       		 result : -1
//       	 }, {
//       		 label : "${0} - #DIV/0!",
//       		 result : -2
//       	 }, {
//       		 label : "${0} - #VALUE!",
//       		 result : -3
//       	 }, {
//       		 label : "${0} - #REF!",
//       		 result : -4
//       	 }, {
//       		 label : "${0} - #NAME?",
//       		 result : -5
//       	 }, {
//       		 label : "${0} - #NUM!",
//       		 result : -6
//       	 }, {
//       		 label : "${0} - #N/A",
//       		 result : -7
//       	 }, {
//       		 label : "${0} - #GETTING_DATA",
//       		 result : -8
//       	 }
//       	 ]
//        }
    },    
    EVEN:{   
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt eine auf die nächstliegende ganze Zahl gerundete Zahl zurück."
    },
    EXACT:{    
    	Syntax:"${0}(Text 1${1} Text 2)",
    	Disp: "Vergleicht zwei Textzeichenfolgen und gibt WAHR zurück, wenn diese identisch sind. Bei dieser Funktion muss die Groß-/Kleinschreibung beachtet werden."
    },
    EXP:{    
    	Syntax:"${0}(Zahl)",
    	Disp: "Gibt 'e' zurück, das um die angegebene Anzahl erhöht wird."
    },
    FACT:{  
    	Syntax:"${0}(Zahl)",
    	Disp:"Berechnet die Fakultät einer Zahl."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt die doppelte Fakultät einer Zahl zurück."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Gibt den logischen Wert als FALSE zurück."
    },
    FIND:{   
    	Syntax:"${0}(Text finden${1} Text${1} [Position])",
    	Disp:"Sucht nach einer Textzeichenfolge in einer anderen (wobei die Groß-/Kleinschreibung beachtet werden muss)."
    },
    FIXED:{
    	Syntax:"${0}(Zahl${1} [Dezimalstellen]${1} [keine_Kommas])",
    	Disp:"Formatiert eine Zahl als Text mit einer festgelegten Anzahl Dezimalstellen.",
    	Arguments: {
    		2 : [{
    			label : "${0} - Kommas verhindern",
    			result : "TRUE"
    		}, {
    			label : "${0} - Kommas nicht verhindern",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(Zahl${1} Signifikanz)",
    	Disp:"Rundet eine Zahl auf das nächstliegende Vielfache ab."
    },
    FORMULA:{   
    	Syntax:"${0}(Referenz)",
    	Disp:"Gibt die Formel einer Formelzelle zurück."
    },
    FREQUENCY:{   
    	Syntax:"${0}(ZahlSequenzListe_Daten${1} ZahlSequenzListe_Bins",
    	Disp:"Kategorisiert Werte in Intervalle und zählt die Anzahl der Werte in jedem Intervall."
    },
    FV:{
    	Syntax:"${0}(Rate${1} nper${1} pmt${1} [pv]${1} [Typ])",
    	Disp:"Berechnet den künftigen Wert einer Investition basierend auf einem konstanten Zinssatz."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(Prinzipal${1} Zeitplan)",
        Disp:"Berechnet den künftigen Wert eines ursprünglichen Prinzipals nach Anwendung einer Reihe von proportional erhöhten Zinssätzen."
    },
    GAMMALN:{   
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt den natürlichen Logarithmus der Gammafunktion zurück."
    },
    GCD:{   
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
        Disp:"Gibt den größten gemeinsamen Teiler aller Argumente zurück."
    },
    HEX2BIN:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Hexadezimalzahl in eine Binärzahl."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Konvertiert eine Hexadezimalzahl in eine Dezimalzahl."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Hexadezimalzahl in eine Oktalzahl."
    },
    HOUR:{   
    	Syntax:"${0}(Zahl)",
    	Disp:"Bestimmt die fortlaufende Stundenzahl des Tages (0-23) für den Zeitwert."
    },
    HLOOKUP:{   
    	Syntax:"${0}(Suchkriterien${1} Bereich${1} Index${1} [sortiert])",
    	Disp:"Horizontale Suche und Verweis auf die Zellen unten.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Suche nach ähnlichen Übereinstimmungen",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exakte Übereinstimmung",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [Zellentext])",
    	Disp:"Gibt einen Link zurück, der auf eine(n) vom Link referenzierte(n) Netzressource oder Bereich verweist. Zeigt Zellentext (optional) an, falls angegeben; zeigt den Link andernfalls als Text an."
    },    
    IF:{    
    	Syntax:"${0}(Prüfung${1} [Dann_Wert]${1} [Sonst_Wert])",
    	Disp:"Gibt den durchzuführenden logischen Test an."
    },
    IFS:{
    	Syntax:"${0}(Prüfung1${1} Wert_wenn_wahr1${1} ...)",
    	Disp:"Führt logische Prüfungen durch, um festzustellen, ob eine oder mehrere Bedingungen erfüllt sind, und gibt einen Wert zurück, der der ersten WAHR-Bedingung entspricht."
    },
    IFERROR:{
    	Syntax:"${0}(Wert${1} Wert_wenn_Fehler)",
    	Disp:"Gibt den Wert zurück, den Sie angeben, wenn der Ausdruck ein Fehler ist. Andernfalls wird das Ergebnis des Ausdrucks zurückgegeben."
    },
    IFNA:{
    	Syntax:"${0}(Wert${1} Wert_wenn_na)",
    	Disp:"Gibt den Wert zurück, den Sie angeben, wenn der Ausdruck den Fehlerwert #N/A (nicht zutreffend) zurückgibt. Andernfalls wird das Ergebnis des Ausdrucks zurückgegeben."
    },
    INDEX:{    
    	Syntax:"${0}(Referenz${1} Zeile${1} [Spalte]${1} [Bereich])",
    	Disp:"Gibt einen Verweis von einem definierten Bereich auf eine Zelle zurück."
    },
    INDIRECT:{    
    	Syntax:"${0}(Ref${1} [Ref_Stil])",
    	Disp:"Gibt den Inhalt einer Zelle zurück, die im Textformat referenziert werden.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1-Stil",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1-Stil",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Rundet eine Zahl auf die nächstliegende Ganzzahl ab."
    },
    IPMT:{
    	Syntax:"${0}(Rate${1} per${1} nper${1} pv${1} [fv]${1} [Typ])",
    	Disp:"Berechnet den Zinsrückzahlungsbetrag für einen Zeitraum für eine Investition auf der Grundlage von regelmäßigen Zahlungen und einem festen Zinssatz."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn die referenzierte Zelle leer ist, ansonsten wird FALSE zurückgegeben."
    },
    ISERR:{
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn der Wert ein Fehlerwert ungleich #N/A ist"
    },
    ISERROR:{
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn es sich bei dem Wert um einen Fehlerwert handelt."
    },
    ISEVEN:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn der Wert gerade ist, ansonsten wird FALSE zurückgegeben." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(Referenz)",
    	Disp:"Gibt TRUE zurück, wenn es sich bei der Zelle um eine Formelzelle handelt."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn der Wert eine logische Zahl aufweist."
    },
    ISNA:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn der Wert gleich #N/A ist"
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt 'true' zurück, wenn es sich bei dem Wert nicht um Text handelt"
    },
    ISNUMBER:{   
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn der Wert eine Zahl ist."
    },
    ISODD:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn es sich bei dem Wert um eine ungerade ganze Zahl handelt."
    },
    ISPMT:{
    	Syntax:"${0}(Rate${1} per${1} nper${1} pv)",
    	Disp:"Berechnet den Zins, der während eines angegebenen Zeitraums für eine Investition bezahlt wurde."
    }, 
    ISREF:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn der Wert ein Verweis ist."
    },
    ISTEXT:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Gibt TRUE zurück, wenn es sich bei dem Wert um Text handelt."
    },
    LARGE:{
        Syntax:"${0}(Bereich${1} xte_Position)",
    	Disp:"Gibt den xt-größten Wert aus einer Gruppe von Werten zurück."
    },
    LCM:{   
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
        Disp:"Gibt das niedrigste gemeinsame Vielfache aller Zahlen in der Liste zurück."
    },
    LEFT:{
        Syntax:"${0}(Text${1} [Länge])",
    	Disp:"Gibt eine angegebene Anzahl von Zeichen vom Anfang des Textes zurück."
    },
    LEN:{
    	Syntax:"${0}(Text)",
    	Disp:"Gibt die Länge einer Textzeichenfolge zurück."
    },
    LENB:{
    	Syntax:"${0}(Text)",
    	Disp:"Gibt die Anzahl an Bytes einer Textzeichenfolge zurück."
    },
    LN:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den natürlichen Logarithmus einer Zahl zurück."
    },
    LOG:{
    	Syntax:"${0}(Zahl${1} [Basis])",
    	Disp:"Gibt den Logarithmus einer Zahl in einer angegebenen Basis zurück."
    },
    LOG10:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Aus dem im Textfeld eingegebenen Wert wird der Logarithmus zur Basis 10 berechnet."
    },
    LOOKUP:{
    	Syntax: "${0}(Suchkriterium${1} Suchvektor${1} [Ergebnisvektor])",
    	Disp:"Bestimmt den Wert eines Vektors durch Vergleich mit Werten in einem anderen Vektor."
    },
    LOWER:{    
    	Syntax:"${0}(Text)",
    	Disp:"Konvertiert Text in Kleinbuchstaben."
    },    
    MATCH:{    
    	Syntax: "${0}(Suchkriterium${1} Suchbereich${1} [Typ])",
    	Disp:"Definiert nach dem Vergleich von Werten eine Position in einem Bereich.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Kleiner als",
         		 result : 1
         	 }, {
         		 label : "${0} - Exakte Übereinstimmung",
         		 result : 0
         	 }, {
         		 label : "${0} - Größer als",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt den größten Wert in einer Argumentliste zurück."
    },
    MEDIAN:{    
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt den mittleren Wert zurück, wenn eine ungerade Anzahl an Werten eingegeben wurde. Andernfalls wird das arithmetische Mittel der beiden mittleren Werte zurückgegeben."
    },
    MID:{    
    	Syntax:"${0}(Text${1} Zahl${1} Zahl)",
    	Disp:"Gibt eine partielle Textzeichenfolge eines Textes zurück."
    }, 
    MIN:{    
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt den kleinsten Wert in einer Argumentliste zurück."
    },    
    MINUTE:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Bestimmt die fortlaufende Minutenzahl in der Stunde (0-59) für den Zeitwert."
    },    
    MOD:{    
    	Syntax:"${0}(Dividierte_Zahl${1} Divisor)",
    	Disp:"Gibt den Restwert zurück, wenn die geteilte Zahl durch den Divisor geteilt wird."
    },
    MODE:{    
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt den häufigsten Wert in einem Beispiel zurück."
    },
    MONTH:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Monat für den gegebenen Datumswert zurück. Der Monat wird als Ganzzahl zwischen 1 und 12 zurückgegeben."
    },
    MROUND:{   
    	Syntax: "${0}(Zahl${1} Vielfaches)",
        Disp:"Gibt eine auf ein angegebenes Vielfaches gerundete Zahl zurück."
    },
    MMULT:{    
    	Syntax:"${0}(Bereich${1} Bereich)",
    	Disp:"Bereichsmultiplikation. Gibt das Produkt zweier Bereiche zurück."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
        Disp:"Gibt den multinomialen Koeffizienten einer Gruppe von Zahlen zurück."
    },
    N:{    
    	Syntax:"${0}(Wert)",
    	Disp:"Konvertiert einen Wert in eine Zahl"
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Gibt den Fehlerwert #N/A zurück."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(Startdatum${1} Enddatum${1} [Feiertage])",
    	Disp:"Gibt die Anzahl der Arbeitstage zwischen zwei Datumsangaben zurück."
    },
    NOT:{    
    	Syntax:"${0}(Logischer Wert)",
    	Disp:"Kehrt den Wert des Arguments um."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Bestimmt die aktuelle Uhrzeit des Computers."
    },
    NPV:{   
    	Syntax:"${0}(Rate${1} Wert 1${1} [Wert 2]${1} ...)",
        Disp:"Berechnet den Kapitalwert einer Invesition basierend auf einem angegebenen Diskontsatz und einer Reihe von künftigen Zahlen und Einkommen. "
    },
    OCT2BIN:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Oktalzahl in eine Binärzahl."
    },
    OCT2DEC:{
    	Syntax:"${0}(Zahl)",
    	Disp:"Konvertiert eine Oktalzahl in eine Dezimalzahl."
    },
    OCT2HEX:{
    	Syntax:"${0}(Zahl${1} [Stellen])",
    	Disp:"Konvertiert eine Oktalzahl in eine Hexadezimalzahl."
    },
    ODD:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Rundet die Zahl auf die nächst höhere Ganzzahl auf, wobei \"auf\" für \"weg von 0\" steht."
    },
    OFFSET:{
    	Syntax:"${0}(Referenz${1} Zeilen${1} Spalten${1} [Höhe]${1} [Breite])",
    	Disp:"Gibt eine Referenz auf einen Bereich zurück, der eine angegebene Anzahl an Zeilen und Spalten aus einer Zelle oder einem Bereich von Zellen zurückgibt."
    },
    OR:{    
    	Syntax:"${0}(Logischer Wert 1${1} [logischer Wert 2]${1} ...)",
    	Disp:"Gibt TRUE zurück, wenn mindestens ein Argument WAHR ist."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Gibt den ungefähren Wert von Pi zurück."
    },
    PMT:{
    	Syntax:"${0}(Rate${1} nper${1} pv${1} [fv]${1} [Typ])",
    	Disp:"Gibt die Zahlung für ein Darlehen auf der Grundlage von regelmäßigen Zahlungen und einem festen Zinssatz zurück."
    },
    POWER:{    
    	Syntax:"${0}(Basis${1} Potenz)",
    	Disp:"Potenziert eine Zahl mit einer anderen."
    },
    PPMT:{
    	Syntax:"${0}(Rate${1} per${1} nper${1} pv${1} [fv]${1} [Typ])",
    	Disp:"Berechnet den Rückzahlungsbetrag für einen Zeitraum für eine Investition auf der Grundlage von regelmäßigen Zahlungen und einem festen Zinssatz."
    },
    PRICEDISC:{
    	Syntax:"${0}(Begleichung${1} Fälligkeit${1} Abschlag${1} Rückzahlung${1} [Basis])",
    	Disp:"Berechnet den Preis pro 100 Euro Nennwert einer diskontierten Sicherheit. "
    },
    PRICEMAT:{
    	Syntax:"${0}(Begleichung${1} Fälligkeit${1} Problem${1} Rate${1} yld${1} [Basis])",
    	Disp:"Berechnet den Preis pro 100 Euro Nennwert einer Sicherheit, die Zinsen zum Fälligkeitszeitpunkt bezahlt."
    },
    PRODUCT:{   
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Multipliziert alle als Argumente angegebenen Zahlen und gibt das Produkt zurück."
    },
    PROPER:{    
    	Syntax:"${0}(Text)",
    	Disp:"Konvertiert eine Textzeichenfolge in die korrekte Groß-/Kleinschreibung. Der erste Buchstabe eines Worts wird großgeschrieben, alle übrigen Buchstaben werden klein geschrieben."
    },
    PV:{
    	Syntax:"${0}(Rate${1} nper${1} pmt${1} [fv]${1} [Typ])",
    	Disp:"Berechnet den momentanten Wert einer Investition basierend auf einer Reihe künftiger Zahlungen. "
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(Zähler${1} Nenner)",
        Disp:"Gibt das Ergebnis einer Zahl, geteilt durch eine andere Zahl, gekürzt auf eine Ganzzahl, zurück."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Gibt eine Zufallszahl zwischen 0 und 1 zurück."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(Untere${1} Obere)",
    	Disp: "Gibt eine zufällige Ganzzahl zwischen den von Ihnen angegebenen Zahlen zurück."
    },
    RANK:{    
    	Syntax:"${0}(Zahl${1} Referenz${1} [Bestellung)",
    	Disp: "Gibt die Rangordnung eines Werts in der Probe zurück.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Absteigend",
          		 result : 0
          	 }, {
          		 label : "${0} - Aufsteigend",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(Begleichung${1} Fälligkeit${1} Investition${1} Abschlag${1} [Basis])",
    	Disp:"Berechnet den zum Fälligkeitszeitpunkt erhaltenen Betrag für eine vollständig investierte Sicherheit. "
    }, 
    REPLACE:{    
    	Syntax: "${0}(Text${1} Position${1} Länge${1} Neuer Text)",
    	Disp:"Ersetzt Zeichen innerhalb einer Textzeichenfolge durch eine andere Textzeichenfolge."	
    },
    REPT:{    
    	Syntax: "${0}(Text${1} Anzahl)",
    	Disp:"Wiederholt Text in einer angegebenen Häufigkeit."	
    },
    RIGHT:{
    	Syntax: "${0}(Text${1} [Zahl])",
    	Disp:"Gibt das oder die letzte(n) Zeichen des Textes zurück."
    },
    RIGHTB:{
    	Syntax: "${0}(Text${1} [Zahl])",
    	Disp:"Gibt das oder die letzte(n) Zeichen des Textes zurück."
    },
    ROUND:{   
    	Syntax: "${0}(Zahl${1} Anzahl)",
    	Disp:"Rundet eine Zahl mit einer vordefinierten Genauigkeit."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(Zahl${1} Anzahl)",
    	Disp:"Rundet eine Zahl mit einer vordefinierten Genauigkeit ab."
    },
    ROUNDUP:{   
    	Syntax: "${0}(Zahl${1} Anzahl)",
    	Disp:"Rundet eine Zahl mit einer vordefinierten Genauigkeit auf."
    },
    ROW:{   
    	Syntax:"${0}([Referenz])",
    	Disp:"Definiert die interne Zeilennummer einer Referenz."
    },
    ROWS:{   
    	Syntax:"${0}(Bereich)",
    	Disp:"Gibt eine Anzahl von Zeilen in einem Bereich oder in einer Referenz zurück."
    },
    RADIANS:{   
    	Syntax:"${0}(Winkel)",
    	Disp:"Konvertiert eine Gradangabe in das Bogenmaß."
    },
    ROMAN:{   
    	Syntax:"${0}(Zahl${1} [Form])",
    	Disp:"Wandelt eine arabische Zahl in eine römische Zahl als Text um.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klassisch",
          		 result : 0
          	 }, {
          		 label : "${0} - Kürzer",
          		 result : 1
          	 }, {
          		 label : "${0} - Kürzer",
          		 result : 2
          	 }, {
          		 label : "${0} - Kürzer",
          		 result : 3
          	 }, {
          		 label : "${0} - Vereinfacht",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(Text finden${1} Text${1} [Position])",
    	Disp:"Sucht nach einem Textwert innerhalb eines anderen (wobei keine Groß-/Kleinschreibung beachtet werden muss)."
    },  
    SIGN:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt das algebraische Zeichen einer Zahl zurück."
    },
    SIN:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt den Sinus eines angegebenen Winkels zurück."
    },
    SINH:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Berechnet den Hyperbelsinus (hyperbolischer Sinus) einer Zahl."
    },
    SECOND:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Bestimmt die fortlaufende Sekundenzahl in der Minute (0-59) eines Zeitwerts."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} Koeffizienten)",
        Disp:"Gibt die Summe einer Potenzreihe basierend auf der Formel zurück."
    },
    SHEET:{   
    	Syntax:"${0}([Referenz])",
    	Disp:"Gibt die interne Blattnummer eines Verweises oder einer Zeichenfolge zurück."
    },
    SMALL:{   
    	Syntax:"${0}(Bereich${1} xte_Position)",
    	Disp:"Gibt den nt-kleinsten Wert aus einer Gruppe von Werten zurück."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(Text${1} alt${1} neu${1} [welche])",
    	Disp:"Gibt Text zurück, in dem ein alter Text durch einen neuen ersetzt wird."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(Funktion${1} Bereich${1} ...)",
    	Disp:"Berechnet Zwischensummen in einem Arbeitsblatt.",
    	Arguments: {
    		0 : [{
    			label : "${0} - DURCHSCHNITT",
    			result : 1
    		}, {
    			label : "${0} - ZAHL",
    			result: 2
    		}, {
    			label : "${0} - ANZAHL",
    			result: 3
    		}
    		, {
    			label : "${0} - MAX",
    			result: 4
    		}
    		, {
    			label : "${0} - MIN",
    			result: 5
    		}
    		, {
    			label : "${0} - PRODUKT",
    			result: 6
    		}
    		, {
    			label : "${0} - STDEV",
    			result: 7
    		}
    		, {
    			label : "${0} - STDEVP",
    			result: 8
    		}
    		, {
    			label : "${0} - SUM",
    			result: 9
    		}
    		, {
    			label : "${0} - VAR",
    			result: 10
    		}, {
    			label : "${0} - VARP",
    			result: 11
    		}, {
    			label : "${0} - DURCHSCHNITT",
    			result: 101
    		}, {
    			label : "${0} - ZAHL",
    			result: 102
    		}, {
    			label : "${0} - ANZAHL",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - PRODUKT",
    			result: 106
    		}, {
    			label : "${0} - STDEV",
    			result: 107
    		}, {
    			label : "${0} - STDEVP",
    			result: 108
    		}, {
    			label : "${0} - SUM",
    			result: 109
    		}, {
    			label : "${0} - VAR",
    			result: 110
    		}, {
    			label : "${0} - VARP",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Gibt die Summe aller Argumente zurück."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(Bereich 1${1} [Bereich 2]${1} ...)",
    	Disp:"Gibt die Summe der Produkte von Bereichsargumenten zurück."
    },
    SUMIF:{   
    	Syntax:"${0}(Bereich${1} Kriterien${1} [Summenbereich])",
    	Disp:"Summiert die Argumente, die die Bedingungen erfüllen."
    },
    SUMIFS:{
    	Syntax: "${0}(Summenbereich${1} Kriterienbereich1${1} Kriterien1${1} ...)",
    	Disp:"Summiert die Argumente, die mehrere Bedingungen erfüllen."
    },
    SQRT:{   
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt die Quadratwurzel einer Zahl zurück."
    },
    SQRTPI:{   
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt die Quadratwurzel von (Zahl * Pi) zurück."
    },
    STDEV:
    {
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Berechnet die Standardabweichung basierend auf einer Stichprobe."
    },
    STDEVP:
    {
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
    	Disp:"Berechnet die Standardabweichung basierend auf der Gesamtpopulation."
    },
    SUMSQ:{
    	Syntax:"${0}(Zahl 1${1} [Zahl 2]${1} ...)",
        Disp:"Gibt die Summe der Quadrate der Zahlen in der Liste zurück."
    },
    T:{
    	Syntax:"${0}(Text)",
    	Disp:"Konvertiert Argumente zu Text."
    },
    TAN:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt den Tangens der angegebenen Zahl zurück."
    },
    TANH:{    
    	Syntax:"${0}(Zahl)",
        Disp:"Gibt den Hyperbeltangens der angegebenen Zahl zurück."
    },
    TBILLPRICE:{
    	Syntax:"${0}(Begleichung${1} Fälligkeit${1} Abschlag)",
    	Disp:"Berechnet den Preis pro 100 Euro Nennwert für einen Schatzwechsel. "
    },
    TEXT:{
    	Syntax:"${0}(Wert${1} Formatcode)",
    	Disp:"Wandelt den Wert in Text nach den Regeln des Zahlenformatcodes um und gibt ihn zurück."
    },
    TIME:{   
    	Syntax:"${0}(Stunde${1} Minute${1} Sekunde)",
    	Disp:"Bestimmt den Zeitwert aus den Details für Stunde, Minute und Sekunde."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(Text)",
	    Disp:"Gibt aus einem Text in einem möglichen Zeiteingabeformat eine interne Zahl zurück."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Bestimmt das aktuelle Datum des Computers."
    },    
    TRIM:{
    	Syntax:"${0}(Text)",
    	Disp:"Entfernt alle vorhergehenden und nachfolgenden Leerzeichen. Alle anderen Folgen aus zwei oder mehr Leerzeichen werden durch ein einfaches Leerzeichen ersetzt"
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Gibt den logischen Wert TRUE zurück."
    },
    TRUNC:{   
    	Syntax:"${0}(Zahl${1} [Zahl])",
    	Disp:"Schneidet die Dezimalstellen einer Zahl ab."
    },
    TYPE:{   
    	Syntax:"${0}(Wert)",
    	Disp:"Definiert den Datentyp eines Werts."	
    },
    UPPER:{  
    	Syntax: "${0}(Text)",
    	Disp:"Konvertiert Text in Großbuchstaben."
    },
    VALUE:{    
    	Syntax: "${0}(Text)",
    	Disp:"Konvertiert ein Textargument in eine Zahl."
    },
    VAR:{    
    	Syntax: "${0}(Zahl1${1} [Zahl2]${1}...)",
    	Disp:"Schätzt Abweichung anhand einer Stichprobe ab."
    },
    VARA:{    
    	Syntax: "${0}(Zahl1${1} [Zahl2]${1}...)",
    	Disp:"Schätzt die Abweichung anhand einer Stichprobe ab, einschließlich Zahlen, Text und logischer Werte."
    },
    VARP:{    
    	Syntax: "${0}(Zahl1${1} [Zahl2]${1}...)",
    	Disp:"Berechnet die Abweichung anhand einer vollständigen Population."
    },
    VARPA:{    
    	Syntax: "${0}(Zahl1${1} [Zahl2]${1}...)",
    	Disp:"Berechnet die Abweichung anhand einer vollständigen Population, einschließlich Zahlen, Text und logischer Werte."
    },
    VLOOKUP:{    
    	Syntax: "${0}(Suchkriterium${1} Bereich${1} Index${1} [Sortierreihenfolge])",
    	Disp:"Vertikale Suche und Verweis auf angegebene Zellen.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Suche nach ähnlichen Übereinstimmungen",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exakte Übereinstimmung",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(Zahl${1} [Typ])",
    	Disp:"Gibt den Wochentag für den Datumswert als Ganzzahl zurück.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Zahlen 1 (Sonntag) bis 7 (Samstag)",
          		 result : 1
          	 }, {
          		 label : "${0} - Zahlen 1 (Montag) bis 7 (Sonntag)",
          		 result : 2
          	 }, {
          		 label : "${0} - Zahlen 0 (Montag) bis 6 (Sonntag)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Zahlen 1 (Montag) bis 7 (Sonntag)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Zahlen 1 (Dienstag) bis 7 (Montag)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Zahlen 1 (Mittwoch) bis 7 (Dienstag)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Zahlen 1 (Donnerstag) bis 7 (Mittwoch)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Zahlen 1 (Freitag) bis 7 (Donnerstag)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Zahlen 1 (Samstag) bis 7 (Freitag)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Zahlen 1 (Sonntag) bis 7 (Samstag)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(Zahl${1} [Modus])",
    	Disp:"Berechnet die Kalenderwoche entsprechend dem angegebenen Datum.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Sonntag",
          		 result : 1
          	 }, {
          		 label : "${0} - Montag",
          		 result : 2
          		 /*
          	 }, {
          		 label : "${0} - Monday",
          		 result : 11
          	 }, {
          		 label : "${0} - Tuesday",
          		 result : 12
          	 }, {
          		 label : "${0} - Wednesday",
          		 result : 13
          	 }, {
          		 label : "${0} - Thursday",
          		 result : 14
          	 }, {
          		 label : "${0} - Friday",
          		 result : 15
          	 }, {
          		 label : "${0} - Saturday",
          		 result : 16
          	 }, {
          		 label : "${0} - Sunday",
          		 result : 17
          	 }, {
          		 label : "${0} - Monday",
          		 result : 21
          		 */
          	 }
          	 ]
           }
    },
    WORKDAY:{    
    	Syntax:"${0}(Startdatum${1} Tage${1} [Feiertage])",
    	Disp:"Gibt die Seriennummer des Datums vor oder nach einer bestimmten Anzahl von Arbeitstagen zurück."
    },
    XNPV:{   
    	Syntax:"${0}(Rate${1} Werte${1} Daten)",
    	Disp:"Berechnet den Kapitalwert für einen Zeitplan von Cash-Flows."
    },
    YEAR:{    
    	Syntax:"${0}(Zahl)",
    	Disp:"Gibt das Jahr eines Datumswerts als ganze Zahl zurück."
    }
}
})

