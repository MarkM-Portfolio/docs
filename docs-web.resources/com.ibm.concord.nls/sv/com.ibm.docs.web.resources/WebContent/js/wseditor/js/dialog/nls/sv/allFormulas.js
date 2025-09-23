/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Alla formler",
	LABEL_FORMULA_LIST: "Formellista:",
	formula:{
	ABS:{	
	    Syntax:"${0}(number)",
	    Disp:"Returnerar det absoluta värdet av ett tal."
    },
    ACOS:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar arcus cosinus av ett tal. Vinkeln returneras i radianer."
    },
    ACOSH:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar inverterad hyperbolisk cosinus av ett tal."
    },
    ACOT:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar inverterad cotangens av ett tal. Vinkeln mäts i radianer."
    },
    ACOTH:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar inverterad hyperbolisk cotangens av ett tal."
    },
    ADDRESS:{
         Syntax:"${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"Returnerar referensen till en cell som text.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolut",
        		 result : 1
        	 }, {
        		 label : "${0} - Absolut rad/relativ kolumn",
        		 result : 2
        	 }, {
        		 label : "${0} - Relativ rad/absolut kolumn",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativ",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1-format",
        		 result : 0
        	 }, {
        		 label: "${0} - A1-format",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Returnerar TRUE om alla argument har värdet TRUE."
    },
    ASIN:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar arcus sinus av ett tal. Vinkeln returneras i radianer."
    },
    ASINH:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar inverterad hyperbolisk sinus av ett tal."
    },
    ATAN:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar arcus tangens av ett tal. Vinkeln returneras i radianer."
    },
    AVERAGE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnerar medelvärdet för argumenten."
    },
    AVERAGEA:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnerar medelvärdet för ett stickprov. Text utvärderas till noll."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(range${1} criteria${1} [average_range])",
    	Disp:"Returnerar genomsnittet (det aritmetiska medelvärdet) av argumenten som uppfyller villkoret."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(average_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Returnerar genomsnittet (det aritmetiska medelvärdet) av argumenten som uppfyller flera villkor."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Returnerar arcus tangens, eller inverterad tangens, för aX- och Y-koordinaterna. Arcus tangens är vinkeln från X-axeln till en linje med origo (0, 0) och en punkt med koordinater (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar inverterad hyperbolisk tangens av ett tal. Talet måste vara mellan -1 och 1 (exklusive -1 och 1)."
    },
    BASE:{    
    	Syntax:"${0}(number${1} radix${1} [minimum length])",
    	Disp:"Konverterar ett positivt heltal till text från ett talsystem med den angivna basen."
    },
    BIN2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Konverterar ett binärt tal till ett decimaltal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett binärt tal till ett hexadecimalt tal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett binärt tal till ett oktalt tal."
    },
    CEILING:{  
    	Syntax: "${0}(number${1} increment)",
    	Disp:"Avrundar ett tal till närmaste heltal eller till närmaste signifikanta multipel."
    },
    CHAR: {
    	Syntax: "${0}(number)",
    	Disp: "Returnerar ett tecken avbildat av talet. Tecknet hämtas från Unicode-teckentabellen. Talet är 1 till 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} value1${1} [value2]${1} ...)",
    	Disp: "Hittar och returnerar motsvarande värde enligt index. Funktionen kan VÄLJA upp till 30 värden."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Returnerar en numerisk kod för första tecknet i en Unicode-textsträng"
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"Returnerar det interna kolumnnumret för en referens."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Returnerar antalet kolumner i en matris eller referens."
    },
    COMBIN:{
    	Syntax:"${0}(number${1} number_chosen)",
    	Disp:"Returnerar antalet kombinationer för ett givet antal objekt. Använd ${0} för att bestämma det totala antalet möjliga grupper för ett givet antal objekt."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Sammanfogar flera textsträngar till en sträng."
    },
    CONVERT:{
    	Syntax:"${0}(number${1} from_unit${1} to_unit)",
    	Disp:"Konverterar ett tal från ett måttsystem till ett annat.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pund, massa (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - u (atommassaenhet)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Uns, massa (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Mil, engelsk",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Tum",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Fot",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Ångström",
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
       		 label : "${0} - Timme",
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
       		 label : "${0} - Atmosfär",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Millimeter kvicksilver (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyn, kraft",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pund, styrka",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Kalori",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Hästkraft, timme",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Wattimme",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Pundfot",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Termodynamisk kalori",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Hästkraft",
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
       		 label : "${0} - Tesked",
       		 result : "\"tsk\""
       	 }, {
       		 label : "${0} - Matsked",
       		 result : "\"msk\""
       	 }, {
       		 label : "${0} - Uns, flytande",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Kopp",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - U.S. pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - U.K. pint",
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
    	Syntax:"${0}(number)",
    	Disp:"Returnerar cosinus för vinkeln."
    },
    COSH:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar hyperbolisk cosinus av ett tal."
    },
    COT:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar cotangens av talet."
    },
    COTH:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar inverterad hyperbolisk cotangens av talet."
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Returnerar antalet tal i argumentlistan. Text ignoreras."
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Returnerar antalet värden som finns i en lista med argument."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(range)",
    	Disp: "Returnerar antalet tomma celler i ett intervall."
    },
    COUNTIF:{
    	Syntax: "${0}(range${1} criteria)",
    	Disp:"Returnerar antalet celler som uppfyller det givna villkoret."
    },
    COUNTIFS:{
    	Syntax: "${0}(criteria_range1${1} criteria1${1} ...)",
    	Disp:"Returnerar antalet celler som uppfyller villkoren."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"Beräknar kumulativ ränta som har betalats mellan två angivna perioder."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"Beräknar det kumulativa kapitalbelopp som har betalats på ett lån mellan två angivna perioder."
    }, 
    DATE:{	
	    Syntax:"${0}(year${1} month${1} day)",
	    Disp:"Ger ett internt nummer för givet datum."
    },  
    DATEDIF:{	
	    Syntax:"${0}(start date${1} end date${1} format)",
	    Disp:"Returnerar skillnaden i år, månader eller dagar mellan två datum.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Antalet hela år i perioden.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Antalet hela månader i perioden.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Antalet dagar i perioden.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Antalet dagar mellan start- och slutdatum. Månader och år ignoreras.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Antalet månader mellan start- och slutdatum. År ignoreras.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Antalet dagar mellan start- och slutdatum. År ignoreras.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Returnerar ett internt tal från en text med ett möjligt datumformat."
    }, 
    DAY:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar dagen för datumvärdet. Dagen returneras som ett heltal mellan 1 och 31. Du kan också ange ett negativt värde för datum/tid."
    },
    DAYS360:{
    	Syntax:"${0}(start_date${1} end_date${1} [method])",
    	Disp:"Beräknar antalet dagar mellan två datum baserat på ett år med 360 dagar.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - U.S.-metod (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europeisk metod",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(start_date${1} end_date${1})",
    	Disp:"Returnerar antalet dagar mellan två datum."
    },
    DEC2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett decimaltal till ett binärt tal."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett decimaltal till ett hexadecimalt tal."
    },
    DEC2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett decimaltal till ett oktalt tal."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"Konverterar radianer till grader."
    },
    DISC:{
    	Syntax:"${0}(settlement${1} maturity${1} pr${1} redemption${1} [basis])",
    	Disp:"Beräknar diskonteringsräntan för ett värdepapper ."
    }, 
    DOLLAR:{
    	Syntax:"${0}(number${1} [decimals])",
    	Disp:"Konverterar ett tal till text i valutaformatet $ (dollar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"Returnerar det seriella tal som motsvarar det datum som indikerar antalet månader före eller efter startdatum"
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"Returnerar det seriella talet för den senaste dagen i månaden som indikerar antalet månader före eller efter startdatum"
    },
    ERFC:{   
    	Syntax:"${0}(number)",
        Disp:"Returnerar den kompletterande felfunktionen, integrerat mellan ett tal och oändligheten."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"Returnerar ett nummer som motsvarar en feltyp."
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
    	Syntax:"${0}(number)",
    	Disp:"Returnerar ett tal avrundat uppåt till närmaste jämna heltal."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Jämför två textsträngar och returnerar TRUE om de är identiska. Funktionen är skiftberoende."
    },
    EXP:{    
    	Syntax:"${0}(number)",
    	Disp: "Returnerar e upphöjt med givet tal."
    },
    FACT:{  
    	Syntax:"${0}(number)",
    	Disp:"Returnerar fakulteten för ett tal."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(number)",
        Disp:"Returnerar dubbla fakulteten för ett tal."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Returnerar det logiska värdet som FALSE."
    },
    FIND:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Söker efter en textsträng i en annan (skiftberoende)."
    },
    FIXED:{
    	Syntax:"${0}(number${1} [decimals]${1} [no_commas])",
    	Disp:"Formaterar ett tal som text med ett fast antal decimaler.",
    	Arguments: {
    		2 : [{
    			label : "${0} - förhindra kommatecken",
    			result : "TRUE"
    		}, {
    			label : "${0} - förhindra inte kommatecken",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(number${1} significance)",
    	Disp:"Avrundar ett tal nedåt till närmaste signifikanta multipel."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"Returnerar formeln för en formelcell."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Kategoriserar värden i intervaller och räknar antalet värden i respektive intervall."
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"Beräknar de framtida värdet av en investering baserat på en konstant ränta."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} schedule)",
        Disp:"Beräknar det framtida värdet av initialt kapitalbelopp efter tillämpning av en serie totala räntebelopp."
    },
    GAMMALN:{   
    	Syntax:"${0}(number)",
        Disp:"Returnerar den naturliga logaritmen av gammafunktionen."
    },
    GCD:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"Returnerar den största gemensamma nämnaren för alla argumenten."
    },
    HEX2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett hexadecimalt tal till ett binärt tal."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Konverterar ett hexadecimalt tal till ett decimaltal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett hexadecimalt tal till ett oktalt tal."
    },
    HOUR:{   
    	Syntax:"${0}(number)",
    	Disp:"Returnerar timmen på dygnet för tidsvärdet som ett tal (0-23)."
    },
    HLOOKUP:{   
    	Syntax:"${0}(search_criteria${1} array${1} Index${1} [sorted])",
    	Disp:"Horisontell sökning och referens till de celler som ligger under.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Ungefärlig matchning",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exakt matchning",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [cell_text])",
    	Disp:"Returnerar en länk som pekar på en nätverksresurs eller ett intervall som refereras av länken. Visar cell_text (valfritt) om den tillhandahålls, i annat fall visas länken som text."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_value]${1} [otherwise_value])",
    	Disp:"Anger det logiska test som ska utföras."
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)",
    	Disp:"Kontrollerar om ett eller flera villkor är uppfyllda genom att genomföra olika logiska test och returnerar ett värde som matchar det första TRUE-villkoret."
    },
    IFERROR:{
    	Syntax:"${0}(value${1} value_if_error)",
    	Disp:"Returnerar det värde du anger om uttrycket är ett fel. Returnerar resultatet av uttrycket i annat fall."
    },
    IFNA:{
    	Syntax:"${0}(value${1} value_if_na)",
    	Disp:"Returnerar det värde du anger om uttrycket returnerar felvärdet #N/A. Returnerar resultatet av uttrycket i annat fall."
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} row${1} [column]${1} [range])",
    	Disp:"Returnerar en referens till en cell från ett angivet intervall."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"Returnerar innehållet i en cell som anges som referens i textform.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1-format",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1-format",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(number)",
    	Disp:"Avrundar ett tal nedåt till närmaste heltal."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Beräknar ränteåterbetalningsbeloppet för en period och en investering baserat på regelbundna betalningar och fast ränta."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om den refererade cellen är tom. Annars returneras FALSE."
    },
    ISERR:{
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är ett felvärde som inte är lika med #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är ett felvärde."
    },
    ISEVEN:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är jämnt. Annars returneras FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"Returnerar TRUE om cellen är en formelcell."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet utvärderas till ett logiskt värde."
    },
    ISNA:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är lika med #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet inte är text."
    },
    ISNUMBER:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är ett tal."
    },
    ISODD:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är ett udda tal."
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"Beräknar den ränta som har betalats under en angiven period för en investering."
    }, 
    ISREF:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är en referens."
    },
    ISTEXT:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnerar TRUE om värdet är text."
    },
    LARGE:{
        Syntax:"${0}(array${1} nth_position)",
    	Disp:"Returnerar det n:te största värdet av en uppsättning värden."
    },
    LCM:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"Returnerar den lägsta gemensamma multipeln för alla tal i listan."
    },
    LEFT:{
        Syntax:"${0}(text${1} [length])",
    	Disp:"Returnerar angivet antal tecken från början av en text."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Returnerar längden på en textsträng."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Returnerar antalet byte för en textsträng."
    },
    LN:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar den naturliga logaritmen för ett tal."
    },
    LOG:{
    	Syntax:"${0}(number${1} [base])",
    	Disp:"Returnerar logaritmen för ett tal med angiven bas."
    },
    LOG10:{
    	Syntax:"${0}(number)",
    	Disp:"Returnerar logaritmen med basen 10 för ett tal."
    },
    LOOKUP:{
    	Syntax: "${0}(search criterion${1} search vector${1} [result_vector])",
    	Disp:"Bestämmer värdet i en vektor genom jämförelse med värden i en annan vektor."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Konverterar alla bokstäver i en text till gemener."
    },    
    MATCH:{    
    	Syntax: "${0}(search criterion${1} lookup_array${1} [type])",
    	Disp:"Definierar en position i en matris efter att ha jämfört värden.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Mindre än",
         		 result : 1
         	 }, {
         		 label : "${0} - Exakt matchning",
         		 result : 0
         	 }, {
         		 label : "${0} - Större än",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnerar det största värdet i en lista med argument."
    },
    MEDIAN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnerar mittvärdet vid udda antal värden. I annat fall returneras genomsnittet av de två mittvärdena."
    },
    MID:{    
    	Syntax:"${0}(text${1} number${1} number)",
    	Disp:"Returnerar en delsträng i en text"
    }, 
    MIN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnerar det minsta värdet i en lista med argument."
    },    
    MINUTE:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnerar minuten i en timme för datumvärdet som ett tal (0-59)."
    },    
    MOD:{    
    	Syntax:"${0}(divided_number${1} divisor)",
    	Disp:"Returnerar resten när dividenden delas med divisorn."
    },
    MODE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Beräknar det vanligaste värdet i ett stickprov."
    },
    MONTH:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnerar månaden för datumvärdet. Månaden returneras som ett heltal från 1 till 12."
    },
    MROUND:{   
    	Syntax: "${0}(number${1} multiple)",
        Disp:"Returnerar ett tal avrundat till multipeln."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Matrismultiplikation. Returnerar produkten av två matriser."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"Returnerar den multinominala koefficienten för en uppsättning tal."
    },
    N:{    
    	Syntax:"${0}(value)",
    	Disp:"Konverterar ett värde till ett tal."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Returnerar felvärdet #N/A för en cell."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(start date${1} end date${1} [holidays])",
    	Disp:"Returnerar antalet arbetsdagar mellan två datum."
    },
    NOT:{    
    	Syntax:"${0}(logical value)",
    	Disp:"Inverterar värdet på argumentet."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Bestämmer den aktuella tiden för datorn."
    },
    NPV:{   
    	Syntax:"${0}(rate${1} value 1${1} [value 2]${1} ...)",
        Disp:"Beräknar aktuellt nettovärde för en investering, baserat på en angiven diskonteringsränta."
    },
    OCT2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett oktalt tal till ett binärt tal."
    },
    OCT2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Konverterar ett oktalt tal till ett decimaltal."
    },
    OCT2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Konverterar ett oktalt tal till ett hexadecimalt tal."
    },
    ODD:{    
    	Syntax:"${0}(number)",
    	Disp:"Avrundar ett tal uppåt till närmaste udda heltal där \"uppåt\" betyder \"bort från 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rows${1} cols${1} [height]${1} [width])",
    	Disp:"Returnerar en referens för ett intervall som är ett angivet antal rader och kolumner från en cell eller ett cellintervall."
    },
    OR:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Returnerar TRUE om minst ett argument är sant."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Returnerar det ungefärliga värdet av Pi."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Returnerar betalningen för ett lån baserat på regelbundna betalningar och fast ränta."
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)",
    	Disp:"Resultatet av ett tal upphöjt till en exponent."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Beräknar återbetalningsbeloppet för en period och en investering baserat på regelbundna betalningar och fast ränta."
    },
    PRICEDISC:{
    	Syntax:"${0}(settlement${1} maturity${1} discount${1} redemption${1} [basis])",
    	Disp:"Beräknar priset per 100 USD nominalvärde för ett diskonterat värdepapper."
    },
    PRICEMAT:{
    	Syntax:"${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [basis])",
    	Disp:"Beräknar priset per 100 USD nominalvärde för ett värdepapper som betalar ränta på förfallodagen."
    },
    PRODUCT:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Multiplicerar alla tal som anges som argument och returnerar produkten."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Konverterar en textsträng till korrekt skiftläge så första bokstaven i varje ord blir versalt och resten gemener."
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"Beräknar aktuellt värde för en investering, baserat på en serie framtida betalningar."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerator${1} denominator)",
        Disp:"Returnerar resultatet av ett tal dividerat med ett annat tal, avkortat till ett heltal."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Returnerar ett slumptal mellan 0 och 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)",
    	Disp: "Returnerar ett slumpmässigt heltal mellan de tal som du anger."
    },
    RANK:{    
    	Syntax:"${0}(number${1} ref${1} [order])",
    	Disp: "Beräknar rangordningen för ett värde i ett stickprov.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Fallande",
          		 result : 0
          	 }, {
          		 label : "${0} - Stigande",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])",
    	Disp:"Beräknar beloppet som erhålls på förfallodatumet för ett fullständigt investerat värdepapper."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} position${1} length${1} new text)",
    	Disp:"Ersätter en del av en text med en annan text."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} count)",
    	Disp:"Upprepar en text ett bestämt antal gånger."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"Returnerar det sista texttecknet eller de sista texttecknen."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"Returnerar det sista texttecknet eller de sista texttecknen."
    },
    ROUND:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Avrundar ett tal med en angiven exakthet."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Avrunda ett tal nedåt med en angiven exakthet."
    },
    ROUNDUP:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Avrundar ett tal uppåt med angiven exakthet."
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"Returnerar det interna radnumret för en referens."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Returnerar antalet rader i en matris eller referens."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"Konverterar grader till radianer."
    },
    ROMAN:{   
    	Syntax:"${0}(number${1} [form])",
    	Disp:"Konverterar en arabisk siffra till en romersk, som text.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klassisk",
          		 result : 0
          	 }, {
          		 label : "${0} - Mer precis",
          		 result : 1
          	 }, {
          		 label : "${0} - Mer precis",
          		 result : 2
          	 }, {
          		 label : "${0} - Mer precis",
          		 result : 3
          	 }, {
          		 label : "${0} - Förenklad",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Söker efter en textsträng i en text (inte skiftberoende)."
    },  
    SIGN:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar det algebraiska tecknet för ett tal."
    },
    SIN:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnerar sinus för vinkeln."
    },
    SINH:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnerar hyperbolisk sinus av ett tal."
    },
    SECOND:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnerar sekunden i en minut för tidsvärdet som ett tal (0-59)."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficients)",
        Disp:"Returnerar summan av en potensserie baserat på formeln."
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"Returnerar det interna arknumret för en referens eller en teckensträng."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} nth_position)",
    	Disp:"Returnerar det n:te minsta värdet av en uppsättning värden."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} old${1} new${1} [which])",
    	Disp:"Returnerar text där den gamla texten ersätts av ny text."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"Beräknar delsummor i ett ark.",
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
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
    	Disp:"Returnerar summan av alla argument."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Returnerar summan av produkterna från matrisargument."
    },
    SUMIF:{   
    	Syntax:"${0}(range${1} criteria${1} [sum range])",
    	Disp:"Returnerar summan av de argument som uppfyller villkoren."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Summerar argumenten som uppfyller de olika villkoren."
    },
    SQRT:{   
    	Syntax:"${0}(number)",
    	Disp:"Returnerar kvadratroten av ett tal."
    },
    SQRTPI:{   
    	Syntax:"${0}(number)",
        Disp:"Returnerar kvadratroten av (tal * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Beräknar standardavvikelsen i ett stickprov."
    },
    STDEVP:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Beräknar standardavvikelsen baserat på hela populationen."
    },
    SUMSQ:{
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
        Disp:"Returnerar summan av kvadraterna av talen i listan."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Konverterar argumentet till text."
    },
    TAN:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar tangens av talet."
    },
    TANH:{    
    	Syntax:"${0}(number)",
        Disp:"Returnerar hyperbolisk tangens av talet."
    },
    TBILLPRICE:{
    	Syntax:"${0}(settlement${1} maturity${1} discount)",
    	Disp:"Beräknar priset per 100 USD nominalvärde för en statsskuldsväxel."
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)",
    	Disp:"Konverterar värdet till en text enligt reglerna för en talformatskod och returnerar det."
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)",
    	Disp:"Returnerar ett tidsvärde för timme, minut och sekund."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Returnerar ett internt tal från en text med ett eventuellt tidsformat."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Returnerar det aktuella datumet för datorn."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Tar bort alla inledande och avslutande blanktecken. Övriga sekvenser med 2 eller fler inre blanktecken ersätts med ett enda blanktecken."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Returnerar det logiska värdet TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(number${1} [count])",
    	Disp:"Minskar antalet decimaler för ett tal."
    },
    TYPE:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnerar datatypen för ett värde."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Konverterar alla bokstäver i en text till versaler."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Konverterar ett textargument till ett tal."
    },
    VAR:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Beräknar variansen baserat på ett stickprov."
    },
    VARA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Beräknar variansen baserat på ett stickprov, inklusive tal, text och logiska värden."
    },
    VARP:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Beräknar variansen baserat på hela populationen."
    },
    VARPA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Beräknar variansen baserat på hela populationen, inklusive tal, text och logiska värden."
    },
    VLOOKUP:{    
    	Syntax: "${0}(search criterion${1} array${1} index${1} [sort order])",
    	Disp:"Vertikal sökning och referens till intilliggande celler.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Ungefärlig matchning",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exakt matchning",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(number${1} [type])",
    	Disp:"Returnerar veckodagen för datumvärdet som ett tal.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 1 (söndag) till 7 (lördag)",
          		 result : 1
          	 }, {
          		 label : "${0} - 1 (måndag) till 7 (söndag)",
          		 result : 2
          	 }, {
          		 label : "${0} - 0 (måndag) till 6 (söndag)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - 1 (måndag) till 7 (söndag)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - 1 (tisdag) till 7 (måndag)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - 1 (onsdag) 7 (tisdag)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - 1 (torsdag) till 7 (onsdag)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - 1 (fredag) till 7 (torsdag)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - 1 (lördag) till 7 (fredag)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - 1 (söndag) till 7 (lördag)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(number${1} [mode])",
    	Disp:"Returnerar kalenderveckan som motsvarar det angivna datumet.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Söndag",
          		 result : 1
          	 }, {
          		 label : "${0} - Måndag",
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
    	Syntax:"${0}(start date${1} days${1} [holidays])",
    	Disp:"Returnerar ett seriellt datum före eller efter ett angivet antal arbetsdagar."
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} values${1} dates)",
    	Disp:"Beräknar aktuellt nettovärde för planlagda kassaflöden."
    },
    YEAR:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnerar året för datumvärdet som ett tal."
    }
}
})

