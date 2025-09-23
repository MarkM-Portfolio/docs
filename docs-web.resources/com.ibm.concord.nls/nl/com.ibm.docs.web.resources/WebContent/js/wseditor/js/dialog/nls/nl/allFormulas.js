/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Alle formules",
	LABEL_FORMULA_LIST: "Formulelijst:",
	formula:{
	ABS:{	
	    Syntax:"${0}(getal)",
	    Disp:"Retourneert de absolute waarde van een getal."
    },
    ACOS:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de arccosinus van een getal. De hoek wordt uitgedrukt in radialen."
    },
    ACOSH:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de arccosinus hyperbolicus van een getal."
    },
    ACOT:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de arccotangens van een getal. De hoek wordt uitgedrukt in radialen."
    },
    ACOTH:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de arccotangens hyperbolicus van een getal."
    },
    ADDRESS:{
         Syntax:"${0}(rij${1} kolom${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"Retourneert de verwijzing naar een cel als tekst.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absoluut",
        		 result : 1
        	 }, {
        		 label : "${0} - Rij absoluut / Kolom relatief",
        		 result : 2
        	 }, {
        		 label : "${0} - Rij relatief / Kolom absoluut",
        		 result : 3
        	 }, {
        		 label : "${0} - Relatief",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1-stijl",
        		 result : 0
        	 }, {
        		 label: "${0} - A1-stijl",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logische waarde 1${1} [logische waarde 2]${1} ...)",
    	Disp:"Retourneert TRUE als alle argumenten TRUE zijn."
    },
    ASIN:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de arcsinus van een getal. De hoek wordt uitgedrukt in radialen."
    },
    ASINH:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de arcsinus hyperbolicus van een getal."
    },
    ATAN:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de arctangens van een getal. De hoek wordt uitgedrukt in radialen."
    },
    AVERAGE:{    
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert het gemiddelde van de argumenten."
    },
    AVERAGEA:{    
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert de gemiddelde waarde. Tekst wordt geïnterpreteerd als nul."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(bereik${1} criteria${1} [gemiddelde_bereik])",
    	Disp:"Retourneert het (rekenkundig) gemiddelde van de argumenten die aan de opgegeven voorwaarde voldoen."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(gemiddelde_bereik${1} criteria_bereik1${1} criteria1${1} ...)",
    	Disp:"Retourneert het (rekenkundig) gemiddelde van de argumenten die aan meerdere opgegeven voorwaarden voldoen."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Retourneert de arctangens, of boogtangens, voor de opgegeven x- en y-coördinaten. De arctangens is de hoek die de x-as maakt met een lijn door de oorsprong (0, 0) en een punt met coördinaten (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de arctangens hyperbolicus van een getal. Het getal moet tussen -1 en 1 liggen (exclusief -1 en 1 zelf)."
    },
    BASE:{    
    	Syntax:"${0}(getal${1} radix${1} [minimumlengte])",
    	Disp:"Converteert een positief geheel getal vanuit een aangegeven getalsysteem naar tekst."
    },
    BIN2DEC:{
    	Syntax:"${0}(getal)",
    	Disp:"Converteert een binair getal naar een decimaal getal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een binair getal naar een hexadecimaal getal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een binair getal naar een octaal getal."
    },
    CEILING:{  
    	Syntax: "${0}(getal${1} increment)",
    	Disp:"Rondt een getal naar boven af tot het dichtstbijzijnde gehele getal of veelvoud van het increment."
    },
    CHAR: {
    	Syntax: "${0}(getal)",
    	Disp: "Retourneert een teken dat is gekoppeld aan het getal. Het teken wordt opgezocht in de Unicode-tekenset. Getal heeft een waarde van 1 tot 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} waarde1${1} [waarde2]${1} ...)",
    	Disp: "Zoekt en retourneert de waarde die is aangegeven met de index. Er kan worden gekozen uit een lijst van maximaal 30 waarden."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Retourneert een numerieke code voor het eerste teken van een tekstreeks met Unicode-codering."
    },
    COLUMN:{    
    	Syntax:"${0}([verwijzing])",
    	Disp:"Retourneert het interne kolomnummer van een verwijzing."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Bepaalt het aantal kolommen in een array of verwijzing."
    },
    COMBIN:{
    	Syntax:"${0}(getal${1} aantal)",
    	Disp:"Retourneert het aantal combinaties voor een bepaald aantal items. Gebruik ${0} om het totale aantal mogelijke groepen voor een bepaald aantal items te bepalen."
    },
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1} ...)",
    	Disp:"Voegt meerdere tekenreeksen samen tot één tekenreeks."
    },
    CONVERT:{
    	Syntax:"${0}(getal${1} van_eenheid${1} naar_eenheid)",
    	Disp:"Converteert een getal van het ene maatstelsel naar het andere.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pond-massa (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomaire massaeenheid)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Ons-massa (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Standaardmijl",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Inch",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Foot",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Jaar",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Dag",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Uur",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minuut",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Seconde",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosfeer",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Millimeter kwik (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pond-kracht",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT calorie",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Paardenkracht-uur",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-uur",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Foot-pound",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Thermodynamische calorie",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Paardenkracht",
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
       		 label : "${0} - Graad Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Graad Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Theelepel",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Eetlepel",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Fluid ounce",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Kop",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - V.S. pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - V.K. pint",
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
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de cosinus van de opgegeven hoek."
    },
    COSH:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de cosinus hyperbolicus van een getal."
    },
    COT:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de cotangens van het opgegeven getal."
    },
    COTH:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de cotangens hyperbolicus van het opgegeven getal."
    },
    COUNT:{   
    	Syntax:"${0}(waarde1${1} [waarde2]${1} ...)",
    	Disp:"Telt hoeveel cijfers voorkomen in de lijst van argumenten. Tekstwaarden worden genegeerd."
    },
    COUNTA:{   
    	Syntax:"${0}(waarde1${1} [waarde2]${1} ...)",
    	Disp:"Telt hoeveel waarden voorkomen in de lijst van argumenten."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(bereik)",
    	Disp: "Telt de lege cellen in een opgegeven bereik."
    },
    COUNTIF:{
    	Syntax: "${0}(bereik${1} criteria)",
    	Disp:"Telt het aantal cellen die aan de opgegeven voorwaarde voldoen."
    },
    COUNTIFS:{
    	Syntax: "${0}(criteria_bereik1${1} criteria1${1} ...)",
    	Disp:"Telt het aantal cellen die aan meerdere opgegeven voorwaarden voldoen."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rente${1} nper${1} hw${1} startperiode${1} eindperiode${1} type)",
	    Disp:"Berekent de cumulatieve rente over een bepaalde periode."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rente${1} nper${1} hw${1} startperiode${1} eindperiode${1} type)",
	    Disp:"Berekent de cumulatieve terugbetaalde hoofdsom voor een lening over een bepaalde periode."
    }, 
    DATE:{	
	    Syntax:"${0}(jaar${1} maand${1} dag)",
	    Disp:"Retourneert een intern getal voor de opgegeven datum."
    },  
    DATEDIF:{	
	    Syntax:"${0}(begindatum${1} einddatum${1} notatie)",
	    Disp:"Retourneert het verschil in jaren, maanden of dagen tussen twee datums.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Het aantal volledige jaren in de periode.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Het aantal volledige maanden in de periode.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Het aantal dagen in de periode.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Het aantal dagen tussen begin- en einddatum, met weglating van maanden en jaren.",
	    		result: "dagen \"MD\""
	    	}, {
	    		label: "${0} - Het aantal maanden tussen begin- en einddatum, met weglating van jaren.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Het aantal dagen tussen begin- en einddatum, met weglating van jaren.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Retourneert een interne waarde voor een tekst met een mogelijke datumindeling."
    }, 
    DAY:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de dag voor een opgegeven datumwaarde. Het resultaat is een geheel getal van 1 tot 31."
    },
    DAYS360:{
    	Syntax:"${0}(begindatum${1} eindadatum${1} [method])",
    	Disp:"Berekent het aantal dagen tussen de twee datums op basis van een jaar van 360 dagen.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - V.S.-methode (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europese methode",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(begindatum${1} einddatum${1})",
    	Disp:"Berekent het aantal dagen tussen de twee datums."
    },
    DEC2BIN:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een decimaal getal naar een binair getal."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een decimaal getal naar een hexadecimaal getal."
    },
    DEC2OCT:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een decimaal getal naar een octaal getal."
    },
    DEGREES:{	
	    Syntax:"${0}(hoek)",
	    Disp:"Convereert radialen naar graden."
    },
    DISC:{
    	Syntax:"${0}(stortingsdatum${1} vervaldatum${1} prijs${1} aflossingsprijs${1} [soort_jaar])",
    	Disp:"Berekent het discontopercentage voor een waardepapier."
    }, 
    DOLLAR:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een getal naar tekst, met valuta-indeling $ (dollar)."
    },
    EDATE:{
    	Syntax:"${0}(begindatum${1} maanden)",
    	Disp:"Retourneert het volgnummer voor de datum die wordt aangeduid met het opgegeven aantal maanden voor of na de begindatum"
    },
    EOMONTH:{
    	Syntax:"${0}(begindatum${1} maanden)",
    	Disp:"Retourneert het volgnummer voor de laatste dag van de maand die wordt aangeduid met het opgegeven aantal maanden voor of na de begindatum"
    },
    ERFC:{   
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de complementaire foutfunctie, geïntegreerd van het opgegeven getal tot oneindig."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(verwijzing)",
    	Disp:"Retourneert een getal dat overeenkomt met een fouttype."
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
    	Syntax:"${0}(getal)",
    	Disp:"Rondt een getal af naar het dichtstbijzijnde bovenliggende even gehele getal."
    },
    EXACT:{    
    	Syntax:"${0}(tekst 1${1} tekst 2)",
    	Disp: "Vergelijkt twee tekenreeksen en retourneert TRUE als deze identiek zijn. Deze functie is hoofdlettergevoelig."
    },
    EXP:{    
    	Syntax:"${0}(getal)",
    	Disp: "Retourneert de waarde van e tot de macht van het opgegeven getal."
    },
    FACT:{  
    	Syntax:"${0}(getal)",
    	Disp:"Berekent de faculteit van een getal."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de dubbelfaculteit van een getal."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Retourneert de logische waarde als FALSE."
    },
    FIND:{   
    	Syntax:"${0}(zoektekst${1} tekst${1} [positie])",
    	Disp:"Zoekt een tekenreeks binnen een andere tekenreeks (hoofdlettergevoelig)."
    },
    FIXED:{
    	Syntax:"${0}(getal${1} [decimalen]${1} [geen_duizendtallen])",
    	Disp:"Formatteert een getal als tekst met een vast aantal decimalen.",
    	Arguments: {
    		2 : [{
    			label : "${0} - geen komma's toestaan",
    			result : "TRUE"
    		}, {
    			label : "${0} - komma's toestaan",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(getal${1} significantie)",
    	Disp:"Rondt een getal naar beneden af tot het dichtstbijzijnde veelvoud van de significantie."
    },
    FORMULA:{   
    	Syntax:"${0}(verwijzing)",
    	Disp:"Retourneert de formule van een formulecel."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Categoriseert waarden in intervallen en telt het aantal waarden in elk interval."
    },
    FV:{
    	Syntax:"${0}(rente${1} nper${1} bet${1} [hw]${1} [type])",
    	Disp:"Berekent de toekomstige waarde van een investering, gebaseerd op een constant rentepercentage."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(hoofdsom${1} schema)",
        Disp:"Berekent de toekomstige waarde van een aanvangshoofdsom nadat de samengestelde rente eraan is toegevoegd."
    },
    GAMMALN:{   
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de natuurlijke logaritme van de gammafunctie."
    },
    GCD:{   
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
        Disp:"Retourneert de grootste gemene deler van alle argumenten."
    },
    HEX2BIN:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een hexadecimaal getal naar een binair getal."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(getal)",
    	Disp:"Converteert een hexadecimaal getal naar een decimaal getal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een hexadecimaal getal naar een octaal getal."
    },
    HOUR:{   
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert het uur voor een opgegeven tijdwaarde. Het resultaat is een geheel getal van 0 tot 23."
    },
    HLOOKUP:{   
    	Syntax:"${0}(zoekcriteria${1} array${1} index${1} [gesorteerd])",
    	Disp:"Zoekt horizontaal en verwijst naar de onderliggende cellen.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Benadering",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exact",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [celtekst])",
    	Disp:"Retourneert een link naar een netwerkresource, of naar een bereik dat door de link wordt aangeduid. Optioneel wordt het argument 'celtekst' afgebeeld, indien opgegeven. Anders wordt de link afgebeeld als tekst."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [dan_waarde]${1} [anders_waarde])",
    	Disp:"Geeft een uit te voeren logische test aan."
    },
    IFS:{
    	Syntax:"${0}(test1${1} waarde_indien_waar1${1} ...)",
    	Disp:"Voert logische tests uit om te controleren of aan een of meer voorwaarden wordt voldaan, en retourneert een waarde die overeenkomt met de eerste voorwaarde die TRUE (waar) is."
    },
    IFERROR:{
    	Syntax:"${0}(waarde${1} waarde_indien_fout)",
    	Disp:"Retourneert de waarde die u opgeeft als de expressie fout is. Anders wordt het resultaat van de expressie geretourneerd."
    },
    IFNA:{
    	Syntax:"${0}(waarde${1} waarde_indien_na)",
    	Disp:"Retourneert de waarde die u opgeeft als de expressie de foutwaarde #N/A retourneert. Anders wordt het resultaat van de expressie geretourneerd."
    },
    INDEX:{    
    	Syntax:"${0}(verwijzing${1} rij${1} [kolom]${1} [bereik])",
    	Disp:"Retourneert een verwijzing naar de cel vanuit een gedefinieerd bereik."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_stijl])",
    	Disp:"Retourneert de inhoud van een cel waarnaar wordt verwezen in de vorm van tekst.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1-stijl",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1-stijl",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(getal)",
    	Disp:"Rondt een getal naar beneden af tot het dichtstbijzijnde gehele getal."
    },
    IPMT:{
    	Syntax:"${0}(tarief${1} per${1} nbet${1} hw${1} [tw]${1} [type])",
    	Disp:"Berekent de renteterugbetaling voor een bepaalde periode en voor een investering op basis van periodieke betaling en een vast rentetarief."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de cel waarnaar wordt verwezen leeg is, anders FALSE."
    },
    ISERR:{
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een foutwaarde is, die niet gelijk is aan #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een foutwaarde is."
    },
    ISEVEN:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE voor een even waarde, anders FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(verwijzing)",
    	Disp:"Retourneert TRUE als de cel een formulecel is."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een logisch getal is."
    },
    ISNA:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde gelijk is aan #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde geen tekstwaarde is."
    },
    ISNUMBER:{   
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een getal is."
    },
    ISODD:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een oneven geheel getal is."
    },
    ISPMT:{
    	Syntax:"${0}(rente${1} per${1} nper${1} hw)",
    	Disp:"Berekent de betaalde rente gedurende een bepaalde periode voor een investering."
    }, 
    ISREF:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een verwijzing is."
    },
    ISTEXT:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Retourneert TRUE als de waarde een tekstwaarde is."
    },
    LARGE:{
        Syntax:"${0}(array${1} n-de_positie)",
    	Disp:"Retourneert de n-de hoogste waarde van een set waarden."
    },
    LCM:{   
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
        Disp:"Retourneert het kleinste gemene veelvoud van alle getallen in de lijst."
    },
    LEFT:{
        Syntax:"${0}(tekst${1} [lengte])",
    	Disp:"Retourneert het opgegeven aantal tekens vanaf de start van een tekst."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Retourneert de lengte van een tekenreeks."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Retourneert het aantal bytes van een tekenreeks."
    },
    LN:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de natuurlijke logaritme van een getal."
    },
    LOG:{
    	Syntax:"${0}(getal${1} [grondtal])",
    	Disp:"Retourneert de logaritme van een getal voor het opgegeven grondtal."
    },
    LOG10:{
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert van een getal de logaritme met grondtal 10."
    },
    LOOKUP:{
    	Syntax: "${0}(zoekcriterium${1} zoekvector${1} [resultaatvector])",
    	Disp:"Bepaalt een waarde in een vector door vergelijking met waarden in een andere vector."
    },
    LOWER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Zet de tekst om in kleine letters."
    },    
    MATCH:{    
    	Syntax: "${0}(zoekcriterium${1} zoekarray${1} [type])",
    	Disp:"Bepaalt een positie in een array na vergelijking van de waarden.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Kleiner dan",
         		 result : 1
         	 }, {
         		 label : "${0} - Exact",
         		 result : 0
         	 }, {
         		 label : "${0} - Groter dan",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert de maximale waarde in een lijst van argumenten."
    },
    MEDIAN:{    
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert de middelste waarde van een oneven aantal waarden. Als een even aantal waarden is opgegeven, wordt het gemiddelde van de twee middelste waarden berekend."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} getal${1} getal)",
    	Disp:"Retourneert het met de opgegeven getallen aangegeven deel van een tekst."
    }, 
    MIN:{    
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert de minimale waarde in een lijst van argumenten."
    },    
    MINUTE:{    
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de minuut voor een opgegeven tijdwaarde. Het resultaat is een geheel getal van 0 tot 59."
    },    
    MOD:{    
    	Syntax:"${0}(noemer${1} deler)",
    	Disp:"Retourneert de rest wanneer de noemer wordt gedeeld door de deler."
    },
    MODE:{    
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert de meest voorkomende waarde in een reeks waarden."
    },
    MONTH:{    
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de maand voor een opgegeven datumwaarde. Het resultaat is een geheel getal van 1 tot 12."
    },
    MROUND:{   
    	Syntax: "${0}(getal${1} veelvoud)",
        Disp:"Retourneert een getal, afgerond naar het opgegeven veelvoud."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Retourneert het product van twee arrays."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
        Disp:"Retourneert de multinomiaalcoëfficiënt van een set getallen."
    },
    N:{    
    	Syntax:"${0}(waarde)",
    	Disp:"Converteert een waarde naar een getal."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Retourneert de foutwaarde #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(begindatum${1} einddatum${1} [vrije-dagen])",
    	Disp:"Retourneert het aantal werkdagen tussen twee datums."
    },
    NOT:{    
    	Syntax:"${0}(logische waarde)",
    	Disp:"Keert de waarde van het argument om."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Bepaalt de huidige tijd van de computer."
    },
    NPV:{   
    	Syntax:"${0}(rente${1} waarde 1${1} [waarde 2]${1} ...)",
        Disp:"Berekent de netto huidige waarde van een investering op basis van een discontopercentage en een reeks periodieke betalingen en inkomsten."
    },
    OCT2BIN:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een octaal getal naar een binair getal."
    },
    OCT2DEC:{
    	Syntax:"${0}(getal)",
    	Disp:"Converteert een octaal getal naar een decimaal getal."
    },
    OCT2HEX:{
    	Syntax:"${0}(getal${1} [decimalen])",
    	Disp:"Converteert een octaal getal naar een hexadecimaal getal."
    },
    ODD:{    
    	Syntax:"${0}(getal)",
    	Disp:"Rondt een getal af naar het dichtstbijzijnde bovenliggende oneven gehele getal, waarbij \"boven\" betekent \"gerekend vanaf 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(verwijzing${1} rijen${1} kolommen${1} [hoogte]${1} [breedte])",
    	Disp:"Retourneert een verwijzing naar een bereik van het opgegeven aantal rijen en kolommen vanaf een cel of reeks cellen."
    },
    OR:{    
    	Syntax:"${0}(logische waarde 1${1} [logische waarde 2]${1} ...)",
    	Disp:"Retourneert TRUE als ten minste één argument TRUE is. "
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Retourneert de benaderde waarde van pi."
    },
    PMT:{
    	Syntax:"${0}(tarief${1} nbet${1} hw${1} [tw]${1} [type])",
    	Disp:"Retourneert de betaling van een lening op basis van periodieke betaling en een vast rentetarief."
    },
    POWER:{    
    	Syntax:"${0}(grondtal${1} macht)",
    	Disp:"Verheft een getal tot een bepaalde macht."
    },
    PPMT:{
    	Syntax:"${0}(tarief${1} per${1} nbet${1} hw${1} [tw]${1} [type])",
    	Disp:"Berekent de terugbetaling voor een bepaalde periode en voor een investering op basis van periodieke betaling en een vast rentetarief."
    },
    PRICEDISC:{
    	Syntax:"${0}(stortingsdatum${1} vervaldatum${1} disconto${1} aflossingsprijs${1} [soort_jaar])",
    	Disp:"Bepaalt de prijs per 100 euro nominale waarde voor een verdisconteerd waardepapier."
    },
    PRICEMAT:{
    	Syntax:"${0}(stortingsdatum${1} vervaldatum${1} uitgifte${1} rente${1} rendement${1} [soort_jaar])",
    	Disp:"Bepaalt de prijs per 100 euro nominale waarde voor een waardepapier waarvan de rente wordt uitgekeerd op de vervaldatum."
    },
    PRODUCT:{   
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Vermenigvuldigt alle getallen van de argumenten met elkaar en retourneert het product."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Converteert een tekenreeks naar een tekst met een beginkapitaal en verder kleine letters."
    },
    PV:{
    	Syntax:"${0}(rente${1} nper${1} bet${1} [tw]${1} [type])",
    	Disp:"Berekent de huidige waarde van een investering op basis van een reeks toekomstige betalingen."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(teller${1} noemer)",
        Disp:"Retourneert het resultaat van de deling van twee getallen, afgekapt op een geheel getal."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Retourneert een toevalswaarde tussen 0 en 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(onder${1} boven)",
    	Disp: "Retourneert een geheel getal met een toevalswaarde tussen de opgegeven getallen."
    },
    RANK:{    
    	Syntax:"${0}(getal${1} ref${1} [volgorde])",
    	Disp: "Retourneert het rangnummer van een waarde in een reeks.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Aflopend",
          		 result : 0
          	 }, {
          		 label : "${0} - Oplopend",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(stortingsdatum${1} vervaldatum${1} investering${1} disconto${1} [soort_jaar])",
    	Disp:"Berekent het bedrag dat op de vervaldatum wordt uitgekeerd voor een volgestort waardepapier."
    }, 
    REPLACE:{    
    	Syntax: "${0}(tekst${1} positie${1} lengte${1} nieuwe tekst)",
    	Disp:"Vervangt tekens binnen een tekenreeks door een andere tekenreeks."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} aantal)",
    	Disp:"Herhaalt een tekst zo vaak als aangegeven."	
    },
    RIGHT:{
    	Syntax: "${0}(tekst${1} [getal])",
    	Disp:"Retourneert het laatste teken of het opgegeven aantal laatste tekens van een tekst."
    },
    RIGHTB:{
    	Syntax: "${0}(tekst${1} [getal])",
    	Disp:"Retourneert het laatste teken of het opgegeven aantal laatste tekens van een tekst."
    },
    ROUND:{   
    	Syntax: "${0}(getal${1} aantal)",
    	Disp:"Rondt een getal af op een opgegeven aantal decimalen."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(getal${1} aantal)",
    	Disp:"Rondt een getal naar beneden af op het opgegeven aantal decimalen."
    },
    ROUNDUP:{   
    	Syntax: "${0}(getal${1} aantal)",
    	Disp:"Rondt een getal naar boven af op het opgegeven aantal decimalen."
    },
    ROW:{   
    	Syntax:"${0}([verwijzing])",
    	Disp:"Definieert het interne rijnummer van een verwijzing."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Retourneert het aantal rijen in een array."
    },
    RADIANS:{   
    	Syntax:"${0}(hoek)",
    	Disp:"Converteert graden naar radialen."
    },
    ROMAN:{   
    	Syntax:"${0}(getal${1} [vorm])",
    	Disp:"Converteert een Arabisch cijfer naar een Romeins cijfer, in tekst.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klassiek",
          		 result : 0
          	 }, {
          		 label : "${0} - Beknopter",
          		 result : 1
          	 }, {
          		 label : "${0} - Beknopter",
          		 result : 2
          	 }, {
          		 label : "${0} - Beknopter",
          		 result : 3
          	 }, {
          		 label : "${0} - Vereenvoudigd",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(zoektekst${1} tekst${1} [positie])",
    	Disp:"Zoekt een tekenreeks binnen een andere tekenreeks (niet hoofdlettergevoelig)."
    },  
    SIGN:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert het algebraïsche teken van een getal."
    },
    SIN:{    
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de sinus van de opgegeven hoek."
    },
    SINH:{    
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de sinus hyperbolicus van een getal."
    },
    SECOND:{    
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de seconde voor een opgegeven tijdwaarde. Het resultaat is een geheel getal van 0 tot 59."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coëfficiënten)",
        Disp:"Retourneert de som van een machtreeks op basis van de formule."
    },
    SHEET:{   
    	Syntax:"${0}([verwijzing])",
    	Disp:"Retourneert het interne werkbladnummer van een verwijzing of tekenreeks."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} n-de_positie)",
    	Disp:"Retourneert de n-de laagste waarde van een set waarden."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} oud${1} nieuw${1} [welk])",
    	Disp:"Retourneert tekst waarbij de met welk aangeduide plek met oude tekst is vervangen door nieuwe tekst."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(functie${1} bereik${1} ...)",
    	Disp:"Berekent subtotalen in een werkblad.",
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
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Retourneert de som van alle argumenten."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Retourneert de som van de producten van de corresponderende array-elementen."
    },
    SUMIF:{   
    	Syntax:"${0}(bereik${1} criteria${1} [som bereik])",
    	Disp:"Berekent het totaal van de argumenten die voldoen aan de voorwaarden."
    },
    SUMIFS:{
    	Syntax: "${0}(som_bereik${1} criteria_bereik1${1} criteria1${1} ...)",
    	Disp:"Berekent de som van de argumenten die voldoen aan meerdere opgegeven voorwaarden."
    },
    SQRT:{   
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert de vierkantswortel van een getal."
    },
    SQRTPI:{   
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de vierkantswortel van (getal * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Berekent de standaardafwijking op basis van een steekproef."
    },
    STDEVP:
    {
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Berekent de standaardafwijking op basis van de volledige populatie."
    },
    SUMSQ:{
    	Syntax:"${0}(getal 1${1} [getal 2]${1} ...)",
        Disp:"Retourneert de som van de kwadraten van de getallen in de lijst."
    },
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Converteert de argumenten naar tekst."
    },
    TAN:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de tangens van het opgegeven getal."
    },
    TANH:{    
    	Syntax:"${0}(getal)",
        Disp:"Retourneert de tangens hyperbolicus van het opgegeven getal."
    },
    TBILLPRICE:{
    	Syntax:"${0}(stortingsdatum${1} vervaldatum${1} disconto)",
    	Disp:"Berekent de prijs per 100 euro nominale waarde voor schatkistpapier."
    },
    TEXT:{
    	Syntax:"${0}(waarde${1} indelingscode)",
    	Disp:"Converteert de waarde van een tekenreeks op basis van de regels van een getalindelingscode."
    },
    TIME:{   
    	Syntax:"${0}(uur${1} minuut${1} seconde)",
    	Disp:"Bepaalt de tijdswaarde uit de opgegeven aantallen uren, minuten en seconden."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Retourneert een interne waarde voor een tekst met een mogelijke tijdindeling."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Bepaalt de huidige datum van de computer."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Verwijdert alle voorafgaande spaties en volgspaties. Alle overige reeksen van 2 of meer spaties binnen de tekst worden vervangen door enkele spaties."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Retourneert de logische waarde TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(getal${1} [aantal])",
    	Disp:"Kapt een getal af op het opgegeven aantal decimaalposities."
    },
    TYPE:{   
    	Syntax:"${0}(waarde)",
    	Disp:"Definieert het gegevenstype van een waarde."	
    },
    UPPER:{  
    	Syntax: "${0}(tekst)",
    	Disp:"Zet tekst om in hoofdletters."
    },
    VALUE:{    
    	Syntax: "${0}(tekst)",
    	Disp:"Converteert een tekstargument naar een getal."
    },
    VAR:{    
    	Syntax: "${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Schat de variantie op basis van een steekproef."
    },
    VARA:{    
    	Syntax: "${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Schat de variantie op basis van een steekproef, inclusief getallen, tekst en logische waarden."
    },
    VARP:{    
    	Syntax: "${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Berekent de variantie op basis van de gehele populatie."
    },
    VARPA:{    
    	Syntax: "${0}(getal 1${1} [getal 2]${1} ...)",
    	Disp:"Berekent de variantie op basis van de gehele populatie, inclusief getallen, tekst en logische waarden."
    },
    VLOOKUP:{    
    	Syntax: "${0}(zoekcriterium${1} array${1} index${1} [sorteervolgorde])",
    	Disp:"Zoekt verticaal en verwijst naar de aangegeven cellen.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Benadering",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exact",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(getal${1} [type])",
    	Disp:"Retourneert de dag van de week voor een opgegeven datumwaarde. Het resultaat is een geheel getal.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Getallen 1 (zondag) tot 7 (zaterdag)",
          		 result : 1
          	 }, {
          		 label : "${0} - Getallen 1 (maandag) tot 7 (zondag)",
          		 result : 2
          	 }, {
          		 label : "${0} - Getallen 0 (maandag) tot 6 (zondag)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Getallen 1 (maandag) tot 7 (zondag)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Getallen 1 (dinsdag) tot 7 (maandag)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Getallen 1 (woensdag) tot 7 (dinsdag)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Getallen 1 (donderdag) tot 7 (woensdag)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Getallen 1 (vrijdag) tot 7 (donderdag)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Getallen 1 (zaterdag) tot 7 (vrijdag)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Getallen 1 (zondag) tot 7 (zaterdag)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(getal${1} [modus])",
    	Disp:"Berekent de kalenderweek voor de opgegeven datumwaarde.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - zondag",
          		 result : 1
          	 }, {
          		 label : "${0} - maandag",
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
    	Syntax:"${0}(begindatum${1} dagen${1} [vrije-dagen])",
    	Disp:"Retourneert het volgnummer van de datum voor of na het opgegeven aantal werkdagen."
    },
    XNPV:{   
    	Syntax:"${0}(rente${1} waarden${1} datums)",
    	Disp:"Berekent de netto huidige waarde van een reeks cashflows."
    },
    YEAR:{    
    	Syntax:"${0}(getal)",
    	Disp:"Retourneert het jaar voor een opgegeven datumwaarde. Het resultaat is een geheel getal."
    }
}
})

