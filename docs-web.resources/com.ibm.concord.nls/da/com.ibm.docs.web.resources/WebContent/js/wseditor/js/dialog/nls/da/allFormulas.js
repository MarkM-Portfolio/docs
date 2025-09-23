/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Alle formler",
	LABEL_FORMULA_LIST: "Formelliste:",
	formula:{
	ABS:{	
	    Syntax:"${0}(tal)",
	    Disp:"Returnerer den absolutte værdi af et tal."
    },
    ACOS:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer arccosinus af et tal. Vinklen returneres i radianer."
    },
    ACOSH:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer den omvendte hyperboliske cosinus af et tal."
    },
    ACOT:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer den omvendte cotangens af et tal. Vinklen måles i radianer."
    },
    ACOTH:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer den omvendte hyperboliske cotangens af et tal."
    },
    ADDRESS:{
         Syntax:"${0}(række${1} kolonne${1} [abs]${1} [a1]${1} [ark])",
         Disp:"Returnerer en reference til en celle som tekst.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolut",
        		 result : 1
        	 }, {
        		 label : "${0} - Absolut række/relativ kolonne",
        		 result : 2
        	 }, {
        		 label : "${0} - Relativ række/absolut kolonne",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativ",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1-type",
        		 result : 0
        	 }, {
        		 label: "${0} - A1-type",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logisk værdi 1${1} [logisk værdi 2]${1} ...)",
    	Disp:"Returnerer SAND, hvis alle argumenter evalueres til TRUE."
    },
    ASIN:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer arcsinus af et tal. Vinklen returneres i radianer."
    },
    ASINH:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer den omvendte hyperboliske sinus af et tal."
    },
    ATAN:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer arctangens af et tal. Vinklen returneres i radianer."
    },
    AVERAGE:{    
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Returnerer gennemsnittet af argumenterne."
    },
    AVERAGEA:{    
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Returnerer gennemsnitsværdien for et eksempel. Tekst evalueres som nul."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(interval${1} kriterier${1} [gennemsnitsinterval])",
    	Disp:"Returnerer gennemsnittet (aritmetisk gennemsnit) af de argumenter, der opfylder den givne betingelse."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(gennemsnitsinterval${1} kriterieinterval1${1} kriterie1${1} ...)",
    	Disp:"Returnerer gennemsnittet (aritmetisk gennemsnit) af de argumenter, der opfylder flere betingelser."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Returnerer arctangent eller omvendt tangent for de angivne x- og y-koordinater. Arctangent er vinklen fra x-aksen til en linje, der indeholder startpunktet (0, 0) og et punkt med koordinater (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer den omvendte hyperboliske tangent af et tal. Tallet skal være mellem -1 og 1 (eksklusive -1 og 1)."
    },
    BASE:{    
    	Syntax:"${0}(tal${1} radix${1} [minimumslængde])",
    	Disp:"Konverterer et positivt heltal til tekst fra et talsystem til den definerede base."
    },
    BIN2DEC:{
    	Syntax:"${0}(tal)",
    	Disp:"Konverterer et binært tal til et decimaltal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et binært tal til et hexadecimalt tal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et binært tal til et oktaltal."
    },
    CEILING:{  
    	Syntax: "${0}(tal${1} forøgelse)",
    	Disp:"Afrunder et tal til nærmeste heltal eller til multiplum af betydning."
    },
    CHAR: {
    	Syntax: "${0}(tal)",
    	Disp: "Returnerer et tegn angivet som et tal. Tegnet findes i Unicode-tegntabellen. Tallet er mellem 1 og 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} værdi1${1} [værdi2]${1} ...)",
    	Disp: "Finder og returnerer den tilsvarende værdi i henhold til indekset. Kan vælge fra 30 værdier."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Returnerer en numerisk kode for det første tegn i en tekststreng, der er kode i unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"Returnerer en references interne kolonnenummer."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Returnerer antallet af kolonner i et array eller en reference."
    },
    COMBIN:{
    	Syntax:"${0}(tal${1} tal_valgt)",
    	Disp:"Returnerer antal kombinationer for et givet antal elementer. Brug ${0} til at bestemme det totale antal mulige grupper for et givet antal elementer."
    },
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1} ...)",
    	Disp:"Kombinerer flere tekststrenge til én streng."
    },
    CONVERT:{
    	Syntax:"${0}(tal${1} fra_enhed${1} til_enhed)",
    	Disp:"Konverterer et tal fra ét målesystem til et andet.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pund-masse (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomisk masseenhed)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Ounce-masse (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Engelsk mil",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Tomme",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Fod",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Ångstrøm",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - År",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Dag",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Time",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minut",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Sekund",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosfære",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - millimeter kviksølv (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyn",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pund-kraft",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT-kalorie",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektron-volt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Hestekrafttime",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-time",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Fod-pund",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Termodynamisk kalorie",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Hestekraft",
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
       		 label : "${0} - Grader Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Grader Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Teske",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Spiseske",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Flydende ounce",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Kop",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Amerikansk pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Britisk pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Liter",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer cosinus af en given vinkel."
    },
    COSH:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer den hyperboliske cosinus af et tal."
    },
    COT:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer cotangens af en givet tal."
    },
    COTH:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer den hyperboliske cotangens af en givet tal."
    },
    COUNT:{   
    	Syntax:"${0}(værdi1${1} [værdi2]${1} ...)",
    	Disp:"Tæller antallet af tal på en liste med argumenter. Tekstoplysninger ignoreres."
    },
    COUNTA:{   
    	Syntax:"${0}(værdi1${1} [værdi2]${1} ...)",
    	Disp:"Tæller antallet af værdier på en liste med argumenter."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(område)",
    	Disp: "Tæller antal tomme celler inden for et område."
    },
    COUNTIF:{
    	Syntax: "${0}(område${1} kriterier)",
    	Disp:"Tæller antallet af celler, der opfylder den givne betingelse."
    },
    COUNTIFS:{
    	Syntax: "${0}(kriterieinterval1${1} kriterie1${1} ...)",
    	Disp:"Tæller antallet af celler, der opfylder flere betingelser."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} startperiode${1} slutperiode${1} type)",
	    Disp:"Beregner den akkumulerede rente betalt mellem to perioder."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} startperiode${1} slutperiode${1} type)",
	    Disp:"Beregner den akkumulerede hovedstol, der er betalt på et lån mellem to perioder."
    }, 
    DATE:{	
	    Syntax:"${0}(år${1} måned${1} dag)",
	    Disp:"Giver et internt tal for den angivne dato."
    },  
    DATEDIF:{	
	    Syntax:"${0}(startdato${1} slutdato${1} format)",
	    Disp:"Returnerer forskellen mellem to datoer i år, måneder eller dage.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Antal hele år i perioden.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Antal hele måneder i perioden.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Antal dage i perioden.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Antal dage mellem startdato og slutdato. Måneder og år ignoreres.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Antal måneder mellem startdato og slutdato. År ignoreres.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Antal dage mellem startdato og slutdato. År ignoreres.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Returnerer et internt tal for en tekst, der har et muligt datoformat."
    }, 
    DAY:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer dagen for en given datoværdi. Dagen returneres som et heltal mellem 1 og 31. Du kan også angive en negativ dato/klokkeslætsværdi."
    },
    DAYS360:{
    	Syntax:"${0}(start_dato${1} slut_dato${1} [metode])",
    	Disp:"Beregner antallet af dage mellem de to datoer baseret på et 360-dages år.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Amerikansk metode (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europæisk metode",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(startdato${1} slutdato${1})",
    	Disp:"Beregner antallet af dage mellem de to datoer."
    },
    DEC2BIN:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et decimaltal til et binært tal."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et decimaltal til et hexadecimalt tal."
    },
    DEC2OCT:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et decimaltal til et oktaltal."
    },
    DEGREES:{	
	    Syntax:"${0}(vinkel)",
	    Disp:"Konverterer radianer til grader."
    },
    DISC:{
    	Syntax:"${0}(afregningsdato${1} udløbsdato${1} pr${1} indløsningskurs${1} [basis])",
    	Disp:"Beregner et værdipapirs diskonto."
    }, 
    DOLLAR:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et tal til tekst med valutaformatet $ (dollar)."
    },
    EDATE:{
    	Syntax:"${0}(startdato${1} måneder)",
    	Disp:"Returnerer serienummeret, der repræsenterer den dato, der er det angivne antal måneder før eller efter startdato "
    },
    EOMONTH:{
    	Syntax:"${0}(startdato${1} måneder)",
    	Disp:"Returnerer serienummeret for den sidste dag i måneden, der er det angivne antal måneder før eller efter startdato "
    },
    ERFC:{   
    	Syntax:"${0}(tal)",
        Disp:"Returnerer den komplementære fejlfunktion, integreret mellem et tal og uendeligt."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"Returnerer et tal, der svarer til en fejlværdi."
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
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer et tal rundet op til nærmeste lige heltal."
    },
    EXACT:{    
    	Syntax:"${0}(tekst 1${1} tekst 2)",
    	Disp: "Sammenligner to tekststrenge og returnerer SAND, hvis de er identiske. Der skelnes mellem store og små bogstaver i funktionen."
    },
    EXP:{    
    	Syntax:"${0}(tal)",
    	Disp: "Returnerer e opløftet i det givne tal."
    },
    FACT:{  
    	Syntax:"${0}(tal)",
    	Disp:"Beregner et tals fakultet."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(tal)",
        Disp:"Returnerer et tals dobbelte fakultet."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Returnerer den logiske værdi som FALSK."
    },
    FIND:{   
    	Syntax:"${0}(find tekst${1} tekst${1} [position])",
    	Disp:"Søg efter en tekststreng i en anden tekststreng (der skelnes mellem store og små bogstaver)."
    },
    FIXED:{
    	Syntax:"${0}(tal${1} [decimaler]${1} [ingen_kommaer])",
    	Disp:"Formaterer et tal som tekst med et fast antal decimaler.",
    	Arguments: {
    		2 : [{
    			label : "${0} - undgå kommaer",
    			result : "TRUE"
    		}, {
    			label : "${0} - undgå ikke kommaer",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(tal${1} signifikans)",
    	Disp:"Runder et tal ned til nærmeste multiplum af betydning."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"Returnerer formlen for en formelcelle."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Kategoriserer værdier i intervaller og tæller antallet af værdier i hvert enkelt interval."
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"Beregner den fremtidige værdi af investering på basis af en fast rente."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(plan for hovedstol${1}",
        Disp:"Beregner den fremtidige værdi af en hovedstol efter anvendelse af en række sammensatte renter."
    },
    GAMMALN:{   
    	Syntax:"${0}(tal)",
        Disp:"Returnerer den naturlige logaritme af gammafunktionen."
    },
    GCD:{   
    	Syntax:"${0}(tal1${1} [tal 2]${1} ...)",
        Disp:"Returnerer den største generelle divisor af alle argumenter."
    },
    HEX2BIN:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et hexadecimalt tal til et binært tal."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(tal)",
    	Disp:"Konverterer et hexadecimalt tal til et decimaltal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et hexadecimalt tal til et oktaltal."
    },
    HOUR:{   
    	Syntax:"${0}(tal)",
    	Disp:"Fastlægger det fortløbende tal på time af dagen (0-23) for tidsværdien."
    },
    HLOOKUP:{   
    	Syntax:"${0}(søgekriterier${1} array${1} Indeks${1} [sorteret])",
    	Disp:"Vandret søgning og reference til celler nedenfor.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Tilnærmet match",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Eksakt match",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [celletekst])",
    	Disp:"Returnerer et link, som peger på en netværksressource eller et interval, der henvises til af linket. Viser celletekst (valgfrit), hvis det er angivet; ellers vises linket som tekst."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [så_værdi]${1} [ellers_værdi])",
    	Disp:"Angiver en logisk test, som skal udføres."
    },
    IFS:{
    	Syntax:"${0}(test1${1} værdi_hvis_sand1${1} ...)",
    	Disp:"Udfører logiske test for at kontrollere, om en eller flere betingelser er opfyldt, og returnerer en værdi, der matcher den første TRUE-betingelse."
    },
    IFERROR:{
    	Syntax:"${0}(værdi${1} værdi_hvis_fejl)",
    	Disp:"Returnerer værdien, du angiver, hvis udtrykket er en fejl. Ellers returneres resultatet af udtrykket."
    },
    IFNA:{
    	Syntax:"${0}(værdi${1} værdi_hvis_ikke_tilgængelig)",
    	Disp:"Returnerer værdien, du angiver, hvis udtrykket returnerer fejlværdien #N/A. Ellers returneres resultatet af udtrykket."
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} række${1} [kolonne]${1} [interval])",
    	Disp:"Returnerer en reference til en celle fra et angivet område."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"Returnerer indholdet af en celle, der henvises til i tekstformat.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1-type",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1-type",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(tal)",
    	Disp:"Runder et tal ned til det nærmeste heltal."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Beregner rentetilbagebetalingsbeløbet for en periode for en investering baseret på faste indbetalinger og en fast rentesats."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis den celle, der refereres til, er tom - ellers returneres FALSK."
    },
    ISERR:{
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er en hvilken som helst fejlværdi forskellig fra #I/T"
    },
    ISERROR:{
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er en hvilken som helst fejlværdi."
    },
    ISEVEN:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er lige - ellers returneres FALSK." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"Returnerer SAND, hvis cellen er en formelcelle."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er et logisk tal."
    },
    ISNA:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er lig med #I/T."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer TRUE, hvis værdien ikke er tekst."
    },
    ISNUMBER:{   
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er et tal."
    },
    ISODD:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er et ulige heltal."
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"Beregner den rente, der er betalt i en angiven periode, for en investering."
    }, 
    ISREF:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er en reference."
    },
    ISTEXT:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Returnerer SAND, hvis værdien er en tekst."
    },
    LARGE:{
        Syntax:"${0}(array${1} n._position)",
    	Disp:"Returnerer den n. største værdi fra et værdisæt."
    },
    LCM:{   
    	Syntax:"${0}(tal1${1} [tal 2]${1} ...)",
        Disp:"Returnerer det laveste generelle multiplum af alle tal på listen."
    },
    LEFT:{
        Syntax:"${0}(tekst${1} [længde])",
    	Disp:"Returnerer det angivne antal tegn fra begyndelsen af teksten."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Returnerer længden på en tekststreng."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Returnerer antallet af byte i en tekststreng."
    },
    LN:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer den naturlige algoritme af et tal."
    },
    LOG:{
    	Syntax:"${0}(tal${1} [basis])",
    	Disp:"Returnerer logaritmen af en tal i en angivet basis."
    },
    LOG10:{
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer base-10-logaritmen til et tal."
    },
    LOOKUP:{
    	Syntax: "${0}(søgekriterie${1} søgevektor${1} [resultatvektor])",
    	Disp:"Bestemmer en værdi i en vektor ved sammenligning med værdier i en anden vektor."
    },
    LOWER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Konverterer alle bogstaver i en tekst til små bogstaver."
    },    
    MATCH:{    
    	Syntax: "${0}(søgekriterie${1} lookup_array${1} [type])",
    	Disp:"Definerer en position i et array efter at have sammenlignet værdier.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Mindre end",
         		 result : 1
         	 }, {
         		 label : "${0} - Eksakt match",
         		 result : 0
         	 }, {
         		 label : "${0} - Større end",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Returnerer den største værdi på en liste med argumenter."
    },
    MEDIAN:{    
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Returnerer middelværdien, hvis der er et ulige antal værdier. Hvis der ikke er et ulige antal, returneres det aritmetiske gennemsnit af de to middelværdier."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} tal${1} tal)",
    	Disp:"Returnerer en del af en tekststreng i en tekst."
    }, 
    MIN:{    
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Returnerer den mindste værdi fra en liste med argumenter."
    },    
    MINUTE:{    
    	Syntax:"${0}(tal)",
    	Disp:"Fastlægger det fortløbende minuttal i timen (0-59) for tidsværdien."
    },    
    MOD:{    
    	Syntax:"${0}(divideret_tal${1} divisor)",
    	Disp:"Returnerer restværdien, når det dividerede tal divideres med divisoren."
    },
    MODE:{    
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Returnerer den mest almindelige værdi i et eksempel."
    },
    MONTH:{    
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer måneden for en given datoværdi. Måneden returneres som et heltal mellem 1 og 12."
    },
    MROUND:{   
    	Syntax: "${0}(tal${1} multiplum)",
        Disp:"Returnerer et tal afrundet til et angivet multiplum."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Arraymultiplicering. Returnerer produktet af to arrays."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(tal1${1} [tal 2]${1} ...)",
        Disp:"Returnerer den multinomiale koefficient af et sæt tal."
    },
    N:{    
    	Syntax:"${0}(værdi)",
    	Disp:"Konverterer en værdi til et tal."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Returnerer fejlværdien #I/T."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(startdato${1} slutdato${1} [fridage])",
    	Disp:"Returnerer antallet af arbejdsdage mellem to datoer."
    },
    NOT:{    
    	Syntax:"${0}(logisk værdi)",
    	Disp:"Vender det logiske arguments værdi om."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Beregner computerens aktuelle klokkeslæt."
    },
    NPV:{   
    	Syntax:"${0}(rate${1} værdi 1${1} [værdi 2]${1} ...)",
        Disp:"Beregner den aktuelle nettoværdi af en investering på basis af en angiven diskontosats og en serie fremtidige betalinger og indkomst."
    },
    OCT2BIN:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et oktaltal til et binært tal."
    },
    OCT2DEC:{
    	Syntax:"${0}(tal)",
    	Disp:"Konverterer et oktaltal til et decimaltal."
    },
    OCT2HEX:{
    	Syntax:"${0}(tal${1} [decimaler])",
    	Disp:"Konverterer et oktaltal til et hexadecimalt tal."
    },
    ODD:{    
    	Syntax:"${0}(tal)",
    	Disp:"Runder et tal op til det nærmeste ulige heltal, hvor \"op\" betyder \"modsat 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rækker${1} kolonner${1} [højde]${1} [bredde])",
    	Disp:"Returnerer en reference til et område, som er et angivet antal rækker og kolonner fra en celle eller et celleområde."
    },
    OR:{    
    	Syntax:"${0}(logisk værdi 1${1} [logisk værdi 2]${1} ...)",
    	Disp:"Returnerer SAND, hvis mindst ét argument er SAND."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Returnerer cirkaværdien for Pi."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Returnerer betalingen for et lån baseret på faste indbetalinger og en fast rentesats."
    },
    POWER:{    
    	Syntax:"${0}(basis${1} potens)",
    	Disp:"Beregner resultatet af et tal opløftet til en potens."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Beregner tilbagebetalingsbeløbet for en periode for en investering baseret på faste indbetalinger og en fast rentesats."
    },
    PRICEDISC:{
    	Syntax:"${0}(afregning${1} udløb${1} diskonto${1} indløsning${1} [basis])",
    	Disp:"Beregner kursen pr. $100 pålydende værdi for et diskonteret værdipapir."
    },
    PRICEMAT:{
    	Syntax:"${0}(afregningsdato${1} udløbsdato${1} udstedelsesdato${1} rente${1} afkast${1} [basis])",
    	Disp:"Beregner priser pr. $100 pålydende værdi for et værdipapir, der udbetaler rente ved udløb."
    },
    PRODUCT:{   
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Multiplicerer alle tal angivet som argumenter og returnerer produktet."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Konverterer en tekststreng, så det første bogstav i hvert ord er i versaler og alle andre bogstaver er med småt."
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"Beregner nutidsværdien af en investering på basis af en række fremtidige betalinger."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(tæller${1} nævner)",
        Disp:"Returnerer resultatet af et tal delt med et andet tal afkortet til et heltal."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Returnerer et tilfældigt tal mellem 0 og 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bund${1} top)",
    	Disp: "Returnerer et tilfældigt heltal mellem de tal, du angiver."
    },
    RANK:{    
    	Syntax:"${0}(tal${1} ref${1} [rækkefølge)",
    	Disp: "Returnerer prioriteringen af en værdi i et eksempel.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Faldende",
          		 result : 0
          	 }, {
          		 label : "${0} - Stigende",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(afregningsdato${1} udløbsdato${1} investering${1} diskonto${1} [basis])",
    	Disp:"Beregner beløb modtaget ved udløb af et værdipapir."
    }, 
    REPLACE:{    
    	Syntax: "${0}(tekst${1} position${1} længde${1} ny tekst)",
    	Disp:"Erstatter en del af en tekst med en anden tekst."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} antal)",
    	Disp:"Gentager tekst det angivne antal gange."	
    },
    RIGHT:{
    	Syntax: "${0}(tekst${1} [tal])",
    	Disp:"Returnerer den eller de sidste tegn i en tekst."
    },
    RIGHTB:{
    	Syntax: "${0}(tekst${1} [tal])",
    	Disp:"Returnerer den eller de sidste tegn i en tekst."
    },
    ROUND:{   
    	Syntax: "${0}(tal${1} antal)",
    	Disp:"Afrunder et tal til et angivet antal decimaler."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(tal${1} antal)",
    	Disp:"Runder et tal ned til et angivet antal decimaler."
    },
    ROUNDUP:{   
    	Syntax: "${0}(tal${1} antal)",
    	Disp:"Runder et tal op til et angivet antal decimaler."
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"Definerer en references interne rækkenummer."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Returnerer antallet af rækker i et array eller en reference."
    },
    RADIANS:{   
    	Syntax:"${0}(vinkel)",
    	Disp:"Konverterer grader til radianer."
    },
    ROMAN:{   
    	Syntax:"${0}(tal${1} [form])",
    	Disp:"Konverterer arabertal til romertal som tekst.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klassisk",
          		 result : 0
          	 }, {
          		 label : "${0} - Mere koncis",
          		 result : 1
          	 }, {
          		 label : "${0} - Mere koncis",
          		 result : 2
          	 }, {
          		 label : "${0} - Mere koncis",
          		 result : 3
          	 }, {
          		 label : "${0} - Forenklet",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find tekst${1} tekst${1} [position])",
    	Disp:"Søger efter en tekststreng i en tekst (skelner ikke mellem store og små bogstaver)."
    },  
    SIGN:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer det algebraiske tegn for et tal."
    },
    SIN:{    
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer sinus af en given vinkel."
    },
    SINH:{    
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer den hyperboliske sinus af et tal."
    },
    SECOND:{    
    	Syntax:"${0}(tal)",
    	Disp:"Fastlægger det fortløbende sekundtal i minuttet (0-59) for tidsværdien."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koefficienter)",
        Disp:"Returnerer summen af en potensrække baseret på formlen."
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"Returnerer en references eller strengs interne regnearksnummer."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} n._position)",
    	Disp:"Returnerer den n. mindste værdi fra et værdisæt."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} gammel${1} ny${1} [hvilken])",
    	Disp:"Returnerer tekst, hvor en gammel tekst er erstattet med en ny tekst."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funktion${1} interval${1} ...)",
    	Disp:"Beregner subtotaler i et regneark.",
    	Arguments: {
    		0 : [{
    			label : "${0} - AVERAGE",
    			result : 1
    		}, {
    			label : "${0} - COUNT",
    			result: 2
    		}, {
    			label : "${0} - COUNTA",
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
    			label : "${0} - PRODUCT",
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
    			label : "${0} - AVERAGE",
    			result: 101
    		}, {
    			label : "${0} - COUNT",
    			result: 102
    		}, {
    			label : "${0} - COUNTA",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - PRODUCT",
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
    	Syntax:"${0}(tal1${1} [tal 2]${1} ...)",
    	Disp:"Lægger argumenterne sammen."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Returnerer summen af produkterne af arrayargumenterne."
    },
    SUMIF:{   
    	Syntax:"${0}(interval${1} kriterier${1} [sum-interval])",
    	Disp:"Lægger de argumenter sammen, som opfylder kriterierne."
    },
    SUMIFS:{
    	Syntax: "${0}(suminterval${1} kriterieinterval1${1} kriterie1${1} ...)",
    	Disp:"Lægger de argumenter sammen, som opfylder flere betingelser."
    },
    SQRT:{   
    	Syntax:"${0}(tal)",
    	Disp:"Returnerer kvadratroden af et tal."
    },
    SQRTPI:{   
    	Syntax:"${0}(tal)",
        Disp:"Returnerer kvadratroden af (tal * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Beregner standardafvigelsen baseret på et eksempel."
    },
    STDEVP:
    {
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
    	Disp:"Beregner standardafvigelsen baseret på hele populationen."
    },
    SUMSQ:{
    	Syntax:"${0}(tal 1${1} [tal 2]${1} ...)",
        Disp:"Returnerer summen af kvadratrødderne for tallene på listen."
    },
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Konverterer dets argumenter til tekst."
    },
    TAN:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer tangens af det angivne tal."
    },
    TANH:{    
    	Syntax:"${0}(tal)",
        Disp:"Returnerer den hyperboliske tangens af det angivne tal."
    },
    TBILLPRICE:{
    	Syntax:"${0}(afregningsdato${1} udløbsdato${1} diskonto)",
    	Disp:"Beregner statsobligationens kurs pr. $100 i pålydende værdi."
    },
    TEXT:{
    	Syntax:"${0}(værdi${1} formatkode)",
    	Disp:"Konverterer værdien til en tekst i overensstemmelse med reglerne for talformatkode, og returnerer den."
    },
    TIME:{   
    	Syntax:"${0}(time${1} minut${1} sekund)",
    	Disp:"Bestemmer en tidsværdi ud fra oplysninger om time, minut og sekund."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Returnerer et internt tal for en tekst, der har et muligt klokkeslætsformat."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Fastlægger dags dato for computeren."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Fjerner alle foranstillede og efterstillede mellemrum. Alle forekomster af to eller flere mellemrum inde i teksten erstattes med et enkelt mellemrum."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Returnerer den logiske værdi SAND."
    },
    TRUNC:{   
    	Syntax:"${0}(tal${1} [antal])",
    	Disp:"Afskærer et tals decimaler."
    },
    TYPE:{   
    	Syntax:"${0}(værdi)",
    	Disp:"Bestemmer en værdis datatype."	
    },
    UPPER:{  
    	Syntax: "${0}(tekst)",
    	Disp:"Konverterer alle bogstaver i en tekst til store bogstaver."
    },
    VALUE:{    
    	Syntax: "${0}(tekst)",
    	Disp:"Konverterer et tekstargument til et tal."
    },
    VAR:{    
    	Syntax: "${0}(tal1${1} [tal2]${1}...)",
    	Disp:"Beregner varians baseret på et eksempel."
    },
    VARA:{    
    	Syntax: "${0}(tal1${1} [tal2]${1}...)",
    	Disp:"Beregner varians baseret på et eksempel, herunder tal, tekst og logiske værdier."
    },
    VARP:{    
    	Syntax: "${0}(tal1${1} [tal2]${1}...)",
    	Disp:"Beregner varians baseret på hele populationen."
    },
    VARPA:{    
    	Syntax: "${0}(tal1${1} [tal2]${1}...)",
    	Disp:"Beregner varians baseret på hele populationen, herunder tal, tekst og logiske værdier."
    },
    VLOOKUP:{    
    	Syntax: "${0}(søgekriterie${1} array${1} indeks${1} [sorteringsrækkefølge])",
    	Disp:"Lodret søgning og reference til celler, som ligger ved siden af.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Tilnærmet match",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Eksakt match",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(tal${1} [type])",
    	Disp:"Returnerer ugedagen for datoværdien som et heltal.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Tallene 1 (søndag) til og med 7 (lørdag)",
          		 result : 1
          	 }, {
          		 label : "${0} - Tallene 1 (mandag) til og med 7 (søndag)",
          		 result : 2
          	 }, {
          		 label : "${0} - Tallene 0 (mandag) til og med 6 (søndag)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Tallene 1 (mandag) til og med 7 (søndag)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Tallene 1 (tirsdag) til og med 7 (mandag)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Tallene 1 (onsdag) til og med 7 (tirsdag)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Tallene 1 (torsdag) til og med 7 (onsdag)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Tallene 1 (fredag) til og med 7 (torsdag)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Tallene 1 (lørdag) til og med 7 (fredag)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Tallene 1 (søndag) til og med 7 (lørdag)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(tal${1} [tilstand])",
    	Disp:"Beregner kalenderugen, som svarer til den givne dato.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Søndag",
          		 result : 1
          	 }, {
          		 label : "${0} - Mandag",
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
    	Syntax:"${0}(startdato${1} dage${1} [fridage])",
    	Disp:"Returnerer serienummeret på datoen før eller efter et angivet antal arbejdsdage."
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} værdier${1} datoer)",
    	Disp:"Beregner nettonutidsværdien for en pengestrømsplan."
    },
    YEAR:{    
    	Syntax:"${0}(tal)",
    	Disp:"Omregner serienummeret til et år."
    }
}
})

