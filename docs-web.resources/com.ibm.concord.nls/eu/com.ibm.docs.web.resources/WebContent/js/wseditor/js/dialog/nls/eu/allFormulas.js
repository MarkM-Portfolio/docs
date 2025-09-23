/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Formula guztiak",
	LABEL_FORMULA_LIST: "Formula-zerrenda:",
	formula:{
	ABS:{	
	    Syntax:"${0}(zenbakia)",
	    Disp:"Zenbaki baten balio absolutua ematen du."
    },
    ACOS:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten arku kosinua ematen du. Angelua radianatan itzuliko du."
    },
    ACOSH:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten arku kosinu hiperbolikoa ematen du."
    },
    ACOT:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Zenbaki baten alderantzizko kotangentea ematen du. Angelua radianatan neurtzen da."
    },
    ACOTH:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Zenbaki baten alderantzizko kotangente hiperbolikoa ematen du."
    },
    ADDRESS:{
         Syntax:"${0}(errenkada${1} zutabea${1} [abs]${1} [a1]${1} [orria])",
         Disp:"Gelaxka-erreferentzia bat ematen du testu gisa.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolutua",
        		 result : 1
        	 }, {
        		 label : "${0} - Errenkada absolutua / Zutabe erlatiboa",
        		 result : 2
        	 }, {
        		 label : "${0} - Errenkada erlatiboa / Zutabe absolutua",
        		 result : 3
        	 }, {
        		 label : "${0} - Erlatiboa",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 estiloa",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 estiloa",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(1.balio logikoa${1} [2.balio logikoa]${1} ...)",
    	Disp:"EGIAZKOA ematen du argumentu guztiak EGIAZKOAk badira."
    },
    ASIN:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten arku sinua ematen du. Angelua radianatan itzuliko du."
    },
    ASINH:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten arku sinu hiperbolikoa ematen du."
    },
    ATAN:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten arku tangentea ematen du. Angelua radianatan itzuliko du."
    },
    AVERAGE:{    
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Argumentuen batezbestekoa ematen du."
    },
    AVERAGEA:{    
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Lagin baten batez besteko balioa ematen du. Testuaren balioa zero izango da."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(barrutia${1} irizpidea${1} [batezbesteko_barrutia])",
    	Disp:"Emandako baldintza betetzen duten argumentuen batezbesteko aritmetikoa ematen du."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(batezbesteko_barrutia${1} irizpide_barrutia1${1} irizpide1${1} ...)",
    	Disp:"Hainbat baldintza betetzen dituzten argumentuen batezbesteko aritmetikoa ematen du."
    },
    ATAN2:{
    	Syntax:"${0}(x_zk${1} y_zk)",
    	Disp:"Zehaztutako x- eta y- koordinatuen arku tangentea edo alderantzizko tangentea ematen du. Arku tangentea x ardatzetik jatorria (0,0) duen lerro bateraino eta koordenadak (x_zb, y_zb) dituen puntu bateraino doan angelua da."
    },
    ATANH:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten alderantzizko tangente hiperbolikoa ematen du. Zenbakia -1 eta 1 artean egon behar da (ezin da -1 edo 1 izan)."
    },
    BASE:{    
    	Syntax:"${0}(zenbakia${1} radix${1} [luzera minimoa])",
    	Disp:"Osoko zenbaki positibo bat testu bihurtzen du zenbakizko sistema batetik zehaztutako oinarrira."
    },
    BIN2DEC:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki bitar bat zenbaki hamartar bihurtzen du."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki bitar bat zenbaki hamaseitar bihurtzen du."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki bitar bat zenbaki zortzitar bihurtzen du."
    },
    CEILING:{  
    	Syntax: "${0}(zenbakia${1} gehikuntza)",
    	Disp:"Zenbaki bat biribiltzen du eta hurbilen dagoen osoko zenbaki edo multiplo bihurtzen du."
    },
    CHAR: {
    	Syntax: "${0}(zenbakia)",
    	Disp: "Zenbakiak mapatutako karaktere bat ematen du. Karakterea aurkitzen du Unicode karaktere-mapan. Zenbakia 1 eta 255 artekoa da."
    },
    CHOOSE: {
    	Syntax: "${0}(aurkibidea${1} 1.balioa${1} [2.balioa]${1} ...)",
    	Disp: "Dagokion balioa aurkitzen eta itzultzen du, aurkibidearen arabera. 30 balio edo gehiago AUKERA ditzake."
    },
    CODE:{
    	Syntax:"${0}(testua)",
    	Disp:"Unicodeko testu-kate baten lehenengo karaktererako zenbakizko kode bat ematen du"
    },
    COLUMN:{    
    	Syntax:"${0}([erreferentzia])",
    	Disp:"Erreferentzia baten barruko zutabe-zenbakia ematen du."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrizea)",
    	Disp:"Erreferentzia edo matrize batean dagoen zutabe-kopurua ematen du."
    },
    COMBIN:{
    	Syntax:"${0}(zenbakia${1} kopuru_aukeratua)",
    	Disp:"Zehaztutako elementu-kopuru baterako konbinazio-kopurua ematen du. Erabili ${0} zehaztutako elementu-kopuru baterako egon daitezkeen taldeen kopurua zehazteko."
    },
    CONCATENATE:{   
    	Syntax:"${0}(1.testua${1} ...)",
    	Disp:"Hainbat testu-kate kate bakar bihurtzen du."
    },
    CONVERT:{
    	Syntax:"${0}(zenbakia${1} unitatetik${1} unitatera)",
    	Disp:"Zenbaki bat neurri-sistema batetik beste sistema batera pasatzen du.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gramoa",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug-a",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Libra (masa)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (masa-unitate atomikoa)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Ontza (masa)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metroa",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Milia",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Hazbetea",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Oina",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yarda",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Urtea",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Eguna",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Ordua",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minutua",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Segundoa",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milimetro merkurioa (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newtona",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dina",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Libera (indarra)",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Kaloria",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Zaldiaren indar-ordua",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-ordua",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Oin-libera",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Kaloria termodinamikoa",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Zaldi-indarra",
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
       		 label : "${0} - Celsius gradua",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Fahrenheit gradua",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Koilaratxokada",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Koilarakada",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Likidozko ontza",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Katilukada",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - EE.BBetako pinta",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - E.B-ko pinta",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galoia",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litroa",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Emandako angeluaren kosinua ematen du."
    },
    COSH:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten kosinu hiperbolikoa ematen du."
    },
    COT:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Zehaztutako zenbakiaren kotangentea ematen du."
    },
    COTH:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Zehaztutako zenbakiaren kotangente hiperbolikoa ematen du."
    },
    COUNT:{   
    	Syntax:"${0}(1.balioa${1} [2.balioa]${1} ...)",
    	Disp:"Argumentu-zerrendan zenbat zenbaki dagoen kalkulatzen du. Ez ditu testu-sarrerak aintzat hartzen."
    },
    COUNTA:{   
    	Syntax:"${0}(1.balioa${1} [2.balioa]${1} ...)",
    	Disp:"Argumentu-zerrendan zenbat balio dagoen zenbatzen du."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(barrutia)",
    	Disp: "Zehaztutako barruti batean zenbat gelaxka huts dagoen zenbatzen du."
    },
    COUNTIF:{
    	Syntax: "${0}(barrutia${1} irizpidea)",
    	Disp:"Emandako baldintza betetzen duten gelaxkak zenbatzen ditu."
    },
    COUNTIFS:{
    	Syntax: "${0}(irizpide_barrutia1${1} irizpidea1${1} ...)",
    	Disp:"Hainbat baldintza betetzen dituzten gelaxkak zenbatzen ditu."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} mota)",
	    Disp:"Zehaztutako bi daten artean ordaindutako interes metatua ematen du."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} mota)",
	    Disp:"Mailegu batean, zehaztutako bi daten artean ordaindutako printzipal metatua ematen du."
    }, 
    DATE:{	
	    Syntax:"${0}(urtea${1} hilabetea${1} eguna)",
	    Disp:"Zehaztutako datarako barneko zenbaki bat ematen du."
    },  
    DATEDIF:{	
	    Syntax:"${0}(hasiera_data${1} amaiera_data${1} formatua)",
	    Disp:"Bi daten arteko tartea ematen du urtetan, hilabetetan edo egunetan.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Epean dauden urte osoak.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Epean dauden hilabete osoak.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Epean dauden egun osoak.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - hasiera_data eta amaiera_dataren artean dagoen egun-kopurua, hilabeteak eta urteak aintzat hartu gabe.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - hasiera_data eta amaiera_dataren artean dagoen hilabete-kopurua, urteak aintzat hartu gabe.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - hasiera_data eta amaiera_dataren artean dagoen egun-kopurua, urteak aintzat hartu gabe.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(testua)",
	    Disp:"Barneko zenbaki bat ematen du data-formatua izan litekeen testu baterako."
    }, 
    DAY:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Emandako dataren eguna ematen du. Eguna 1 eta 31 arteko osoko zenbaki bat izango da. Balio negatibo bat ere eman dezakezu."
    },
    DAYS360:{
    	Syntax:"${0}(hasiera_data${1} amaiera_data${1} [metodoa])",
    	Disp:"Bi daten artean zenbat egun dagoen zenbatzen du, urteak 360 egun ditueneko oinarria kontuan hartuta.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - EE.BBetako metodoa (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europako metodoa",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(hasiera_data${1} amaiera_data${1})",
    	Disp:"Bi daten artean zenbat egun dagoen zenbatzen du."
    },
    DEC2BIN:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki hamartar bat zenbaki bitar bihurtzen du."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki hamartar bat zenbaki hamaseitar bihurtzen du."
    },
    DEC2OCT:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki hamartar bat zenbaki zortzitar bihurtzen du."
    },
    DEGREES:{	
	    Syntax:"${0}(angelua)",
	    Disp:"Radianak gradu bihurtzen ditu."
    },
    DISC:{
    	Syntax:"${0}(settlement${1} maturity${1} pr${1} redemption${1} [oinarria])",
    	Disp:"Gordailu baten deskontu-tasa ematen du."
    }, 
    DOLLAR:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki bat testu bihurtzen du eta $ (dolar) diru-formatua erabiltzen du."
    },
    EDATE:{
    	Syntax:"${0}(hasiera_data ${1} hilabete)",
    	Disp:"Hasiera_data baino lehenagoko edo geroagoko hilabeteen kopurua adierazten duen serie-zenbakia itzultzen du"
    },
    EOMONTH:{
    	Syntax:"${0}(hasiera_data ${1} hilabete)",
    	Disp:"Hasiera_data baino lehenago edo geroago adierazitako hilabete kopuruaren hilabeteko azken egunerako serie-zenbakia itzultzen du"
    },
    ERFC:{   
    	Syntax:"${0}(zenbakia)",
        Disp:"Errore-funtzio osagarria itzultzen du (zenbaki bat eta infinituaren artean)."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(erreferentzia)",
    	Disp:"Errore-mota adierazten duen zenbakia ematen du."
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
    	Syntax:"${0}(zenbakia)",
    	Disp:"Biribildutako zenbaki bat ematen du; biribiltzeko, hurbilen dagoen bikoiti osoa erabiliko du."
    },
    EXACT:{    
    	Syntax:"${0}(1.testua${1} 2.testua)",
    	Disp: "Bi testu-kate alderatzen ditu eta EGIAZKOA itzultzen du berdin-berdinak badira. Funtzio honek maiuskulak eta minuskulak bereizten ditu.This function is case-sensitive."
    },
    EXP:{    
    	Syntax:"${0}(zenbakia)",
    	Disp: "e ber zehaztutako zenbakiaren eragiketa ematen du."
    },
    FACT:{  
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten faktoriala ematen du."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(zenbakia)",
        Disp:"Zenbaki baten faktorial bikoiztua ematen du."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"FALTSUA balio logikoa ematen du."
    },
    FIND:{   
    	Syntax:"${0}(aurkitu testua${1} testua${1} [posizioa])",
    	Disp:"Testu-kate baten barruan dagoen beste testu-kate bat bilatzen du (maiuskulak eta minuskulak bereizten ditu)."
    },
    FIXED:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak]${1} [komarik_ez])",
    	Disp:"Testu-formatua aplikatzen dio zenbaki bati eta hamartarren kopuru finko bat gehitzen dio.",
    	Arguments: {
    		2 : [{
    			label : "${0} - eragotzi komak",
    			result : "TRUE"
    		}, {
    			label : "${0} - ez eragotzi komak",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(zenbakia${1} esangura)",
    	Disp:"Zenbaki bat behetik biribiltzen du eta hurbilen dagoen multiploa erabiltzen du."
    },
    FORMULA:{   
    	Syntax:"${0}(erreferentzia)",
    	Disp:"Formula-gelaxka baten formula ematen du."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Balioak bitartetan sailkatzen ditu eta bitarte bakoitzeko balioak zenbatzen ditu."
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [mota])",
    	Disp:"Inbertsio baten etorkizunezko balioa ematen du, interes-tasa konstante baten arabera."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} schedule)",
        Disp:"Hasierako printzipal baten etorkizunezko balioa ematen du, interes-tasa konponduen serie bat aplikatu ondoren."
    },
    GAMMALN:{   
    	Syntax:"${0}(zenbakia)",
        Disp:"Gamma funtzioaren logaritmo naturala ematen du."
    },
    GCD:{   
    	Syntax:"${0}(1.zenbakia${1} [2. zenbakia]${1} ...)",
        Disp:"Argumentu guztien zatitzaile komunetako handiena ematen du."
    },
    HEX2BIN:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki hamaseitar bat zenbaki bitar bihurtzen du."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki hamaseitar bat zenbaki hamartar bihurtzen du."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki hamaseitar bat zenbaki zortzitar bihurtzen du."
    },
    HOUR:{   
    	Syntax:"${0}(zenbakia)",
    	Disp:"Eguneko orduaren (0-23) zenbaki sekuentziala zehazten du."
    },
    HLOOKUP:{   
    	Syntax:"${0}(bilatzeko_irizpidea${1} matrizea${1} Aurkibidea${1} [ordenatua])",
    	Disp:"Bilaketa horizontala eta behean kokaturiko gelaxka-erreferentzia.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Gutxi gorabeherako bat-etortzea",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Bat-etortze zehatza",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(esteka${1} [gelaxka_testua])",
    	Disp:"Sare-baliabide baterako edo estekak erreferentziatutako barruti baterako esteka bat ematen du. Gelaxka_testua bistaratzen du (aukerakoa), eman bada. Bestela, esteka bistaratzen du testu gisa."
    },    
    IF:{    
    	Syntax:"${0}(testa${1} [balioa_egiazkoa_bada]${1} [balioa_faltsua_bada])",
    	Disp:"Burutuko den test logiko bat zehazten du."
    },
    IFS:{
    	Syntax:"${0}(test1${1} balioa_egiazkoa_bada1${1} ...)",
    	Disp:"Test logikoak exekutatzen ditu baldintza bat edo gehiago betetzen diren egiaztatzeko eta lehenengo TRUE baldintza betetzen duen balio bat ematen du."
    },
    IFERROR:{
    	Syntax:"${0}(balioa${1} balioa_errorea_bada)",
    	Disp:"Adierazpena errore bat bada, zuk zehaztutako balioa ematen du. Bestela, adierazpenaren emaitza ematen du."
    },
    IFNA:{
    	Syntax:"${0}(balioa${1} balioa_na_bada)",
    	Disp:"Adierazpenak #N/A errore-balioa ematen badu, zuk zehaztutako balioa ematen du. Bestela, adierazpenaren emaitza ematen du."
    },
    INDEX:{    
    	Syntax:"${0}(erreferentzia${1} errenkada${1} [zutabea]${1} [barrutia])",
    	Disp:"Gelaxkako erreferentzia bat ematen du zehaztutako barruti batetik."
    },
    INDIRECT:{    
    	Syntax:"${0}(erref${1} [erref_estiloa])",
    	Disp:"Testu-balio batek zehaztutako gelaxka baten edukia ematen du.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 estiloa",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 estiloa",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki bat behetik biribiltzen du eta hurbilen dagoen osoko zenbakia erabiltzen du."
    },
    IPMT:{
    	Syntax:"${0}(tasa${1} per${1} nper${1} pv${1} [fv]${1} [mota])",
    	Disp:"Inbertsioaren aldi bati dagokion interes-itzulkina kalkulatzen du. Horretarako, ordainketa erregularrak eta interes finkoko tasa bat hartzen ditu kontuan."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du erreferentzia-gelaxka hutsik badago; bestela, FALTSUA ematen du."
    },
    ISERR:{
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa errore-balio bat bada (#N/A kenduta)."
    },
    ISERROR:{
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa errore-balio bat bada."
    },
    ISEVEN:{    
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa bikoitia bada; bestela, FALTSUA ematen du." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(erreferentzia)",
    	Disp:"EGIAZKOA ematen du gelaxka formula-gelaxka bat bada."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioak zenbaki logiko bat badu."
    },
    ISNA:{    
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa #N/A bada."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(balioa)",
    	Disp:"Egiazkoa ematen du balioa testua ez bada."
    },
    ISNUMBER:{   
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa zenbaki bat bada."
    },
    ISODD:{    
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa osoko zenbaki bakoiti bat bada."
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"Inbertsio batean, zehaztutako aldi batean ordaindutako interesa ematen du."
    }, 
    ISREF:{    
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa erreferentzia bat bada."
    },
    ISTEXT:{    
    	Syntax:"${0}(balioa)",
    	Disp:"EGIAZKOA ematen du balioa testua bada."
    },
    LARGE:{
        Syntax:"${0}(matrizea${1} Ngarren.posizioa)",
    	Disp:"Balio batzuetatik, Ngarren balio handiena ematen du."
    },
    LCM:{   
    	Syntax:"${0}(1.zenbakia${1} [2. zenbakia]${1} ...)",
        Disp:"Zerrendako zenbaki guztien multiplo komun txikien ematen du."
    },
    LEFT:{
        Syntax:"${0}(testua${1} [luzera])",
    	Disp:"Zehaztutako karaktere-kopurua ematen du testu baten hasieratik."
    },
    LEN:{
    	Syntax:"${0}(testua)",
    	Disp:"Testu-kate baten luzera ematen du."
    },
    LENB:{
    	Syntax:"${0}(testua)",
    	Disp:"Testu-kate baten byte-kopurua ematen du."
    },
    LN:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten logaritmo naturala ematen du."
    },
    LOG:{
    	Syntax:"${0}(zenbakia${1} [oinarria])",
    	Disp:"Zenbaki baten logaritmoa ematen du zehaztutako oinarrian."
    },
    LOG10:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten logaritmo hamartarra ematen du."
    },
    LOOKUP:{
    	Syntax: "${0}(bilatzeko_irizpidea${1} bilatzeko bektorea${1} [emaitza_bektorea])",
    	Disp:"Balio bat zehazten du bektore batean beste bektore bateko balioekin alderatuz."
    },
    LOWER:{    
    	Syntax:"${0}(testua)",
    	Disp:"Testua minuskulaz idazten du."
    },    
    MATCH:{    
    	Syntax: "${0}(bilatzeko_irizpidea${1} bilaketa_matrizea${1} [mota])",
    	Disp:"Posizio bat zehazten du matrize batean balioak alderatu eta gero.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Hau baino txikiagoa:",
         		 result : 1
         	 }, {
         		 label : "${0} - Bat-etortze zehatza",
         		 result : 0
         	 }, {
         		 label : "${0} - Hau baino handiagoa:",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Argumentu-zerrenda bateko balio maximoa ematen du."
    },
    MEDIAN:{    
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Balio-kopurua bakoitia bada, erdibideko zenbakia ematen du. Bestela, erdibideko balio biren batezbesteko aritmetikoa itzultzen du."
    },
    MID:{    
    	Syntax:"${0}(testua${1} zenbakia${1} zenbakia)",
    	Disp:"Testu bateko testu-kate baten zati bat ematen du."
    }, 
    MIN:{    
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Argumentu-zerrenda bateko balio minimoa ematen du."
    },    
    MINUTE:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Data-balioaren minutua ematen du; 0 eta 59 arteko zenbaki sekuentzial bat izango da."
    },    
    MOD:{    
    	Syntax:"${0}(zatikizuna${1} zatitzailea)",
    	Disp:"Ondarra ematen du zatitzaileak zatikizun zenbakia zatitzean."
    },
    MODE:{    
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Lagin batean gehien errepikatzen den balioa ematen du."
    },
    MONTH:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Emandako dataren hilabetea ematen du. Hilabetea 1 eta 12 arteko osoko zenbaki bat izango da."
    },
    MROUND:{   
    	Syntax: "${0}(zenbakia${1} multiploa)",
        Disp:"Zehaztutako multiplo bat kontuan hartuta, biribildutako zenbaki bat ematen du."
    },
    MMULT:{    
    	Syntax:"${0}(matrizea${1} matrizea)",
    	Disp:"Matrize-biderketa. Bi matrizeren biderkadura ematen du."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(1.zenbakia${1} [2. zenbakia]${1} ...)",
        Disp:"Zenbaki multzo baten koefiziente multinomiala ematen du."
    },
    N:{    
    	Syntax:"${0}(balioa)",
    	Disp:"Balio bat zenbaki bihurtzen du."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"#N/A errore-balioa ematen du."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(hasiera_data${1} amaiera_data${1} [oporrak])",
    	Disp:"Bi dataren artean dagoen lanegun-kopurua ematen du."
    },
    NOT:{    
    	Syntax:"${0}(balio logikoa)",
    	Disp:"Argumentu baten balioa leheneratzen du."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Ordenagailuaren uneko ordua zehazten du."
    },
    NPV:{   
    	Syntax:"${0}(rate${1} value 1${1} [value 2]${1} ...)",
        Disp:"Inbertsio batek orain duen balio garbia ematen du, emandako deskontu-tasa bat eta etorkizunezko ordainketak eta irabaziak kontuan hartuta."
    },
    OCT2BIN:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki zortzitar bat zenbaki bitar bihurtzen du."
    },
    OCT2DEC:{
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki zortzitar bat zenbaki hamartar bihurtzen du."
    },
    OCT2HEX:{
    	Syntax:"${0}(zenbakia${1} [hamartarrak])",
    	Disp:"Zenbaki zortzitar bat zenbaki hamaseitar bihurtzen du."
    },
    ODD:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki bat gora biribiltzen du eta hurbilen dagoen osoko zenbaki bakoitia erabiltzen du; \"gora\"-k \"0tik urruntzea\" esan nahi du."
    },
    OFFSET:{
    	Syntax:"${0}(erreferentzia${1} errenkadak${1} zut${1} [altuera]${1} [zabalera])",
    	Disp:"Barruti-erreferentzia bat ematen du; erreferentzia gelaxka edo gelaxka-barruti baten errenkada eta zutabeen zehaztutako kopuru bat da."
    },
    OR:{    
    	Syntax:"${0}(1.balio logikoa${1} [2.balio logikoa]${1} ...)",
    	Disp:"EGIAZKOA ematen du argumentu bat, gutxienez, EGIAZKOA bada."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Pi zenbakiaren gutxi gorabeherako balioa ematen du."
    },
    PMT:{
    	Syntax:"${0}(tasa${1} nper${1} pv${1} [fv]${1} [mota])",
    	Disp:"Mailegu baten ordainketaren balioa ematen du. Horretarako, ordainketa erregularrak eta interes finkoko tasa bat hartzen ditu kontuan."
    },
    POWER:{    
    	Syntax:"${0}(oinarria${1} berretura)",
    	Disp:"Zenbaki bat berretzen du beste baten berretura erabiliz."
    },
    PPMT:{
    	Syntax:"${0}(tasa${1} per${1} nper${1} pv${1} [fv]${1} [mota])",
    	Disp:"Inbertsioaren aldi bati dagokion diru-itzulkina kalkulatzen du. Horretarako, ordainketa erregularrak eta interes finkoko tasa bat hartzen ditu kontuan."
    },
    PRICEDISC:{
    	Syntax:"${0}(settlement${1} maturity${1} discount${1} redemption${1} [oinarria])",
    	Disp:"Deskontu-gordailu baten balio faziala ematen du (per 100 $)."
    },
    PRICEMAT:{
    	Syntax:"${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [oinarria])",
    	Disp:"Epemugan interesak ematen dituen gordailu baten balio faziala ematen du (per 100 $)."
    },
    PRODUCT:{   
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Argumentu gisa emandako zenbaki guztiak biderkatzen ditu eta biderkadura ematen du."
    },
    PROPER:{    
    	Syntax:"${0}(testua)",
    	Disp:"Testu-kate baten minuskulak eta maiuskulak egokitzen ditu: hitz bakoitzaren lehenengo letra maiuskulaz idazten du eta besteak minuskulaz."
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [mota])",
    	Disp:"Inbertsio batek orain duen balio garbia ematen du, etorkizunezko ordainketak kontuan hartuta."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(zenbakitzailea${1} izendatzailea)",
        Disp:"Bi zenbakien arteko zatiketaren emaitza ematen du, osoko zenbaki gisa."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "0 eta 1 arteko ausazko zenbaki bat ematen du."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(behekoa${1} goikoa)",
    	Disp: "Zeuk zehaztutako zenbakien arteko ausazko osoko zenbaki bat ematen du."
    },
    RANK:{    
    	Syntax:"${0}(zenbakia${1} erref${1} [ordena])",
    	Disp: "Balio batek laginean duen sailkapena ematen du.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Beherantz",
          		 result : 0
          	 }, {
          		 label : "${0} - Gorantz",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])",
    	Disp:"Inbertsio-gordailu batean, epemugan jasotako kopurua ematen du."
    }, 
    REPLACE:{    
    	Syntax: "${0}(testua${1} posizioa${1} luzera${1} testu berria)",
    	Disp:"Testu-kate bateko karaktereak ordezkatzen ditu beste testu-kate batekin."	
    },
    REPT:{    
    	Syntax: "${0}(testua${1} zenbatu)",
    	Disp:"Testu bat errepikatzen du hainbat zehaztutako aldiz."	
    },
    RIGHT:{
    	Syntax: "${0}(testua${1} [zenbakia])",
    	Disp:"Testu-karaktereen azken karakterea ematen du."
    },
    RIGHTB:{
    	Syntax: "${0}(testua${1} [zenbakia])",
    	Disp:"Testu-karaktereen azken karakterea ematen du."
    },
    ROUND:{   
    	Syntax: "${0}(zenbakia${1} zenbatu)",
    	Disp:"Zenbaki bat biribiltzen du aurrez zehaztutako irizpidea jarraituz."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(zenbakia${1} zenbatu)",
    	Disp:"Zenbaki bat behetik biribiltzen du aurrez zehaztutako irizpidea jarraituz."
    },
    ROUNDUP:{   
    	Syntax: "${0}(zenbakia${1} zenbatu)",
    	Disp:"Zenbaki bat gora biribiltzen du aurrez zehaztutako irizpidea jarraituz."
    },
    ROW:{   
    	Syntax:"${0}([erreferentzia])",
    	Disp:"Erreferentzia baten barneko errenkada-zenbakia definitzen du."
    },
    ROWS:{   
    	Syntax:"${0}(matrizea)",
    	Disp:"Erreferentzia-matrize bateko errenkada-kopurua ematen du."
    },
    RADIANS:{   
    	Syntax:"${0}(angelua)",
    	Disp:"Graduak radian bihurtzen ditu."
    },
    ROMAN:{   
    	Syntax:"${0}(zenbakia${1} [forma])",
    	Disp:"Arabiar zifrak erromatar bihurtzen ditu testu gisa.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klasikoa",
          		 result : 0
          	 }, {
          		 label : "${0} - Laburragoa",
          		 result : 1
          	 }, {
          		 label : "${0} - Laburragoa",
          		 result : 2
          	 }, {
          		 label : "${0} - Laburragoa",
          		 result : 3
          	 }, {
          		 label : "${0} - Sinplifikatua",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(aurkitu testua${1} testua${1} [posizioa])",
    	Disp:"Testu-balio bat bilatzen du beste baten barruan (ez ditu maiuskulak eta minuskulak bereizten)."
    },  
    SIGN:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Zenbaki baten sinbolo aljebraikoa ematen du."
    },
    SIN:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zehaztutako angeluaren sinua ematen du."
    },
    SINH:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten sinu hiperbolikoa ematen du."
    },
    SECOND:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Minutuko segundoaren (0-59) zenbaki sekuentziala zehazten du."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koefizienteak)",
        Disp:"Formula kontuan hartuta, berretura multzo baten batuketa ematen du."
    },
    SHEET:{   
    	Syntax:"${0}([erreferentzia])",
    	Disp:"Erreferentzia edo kate baten barneko orri-zenbakia ematen du."
    },
    SMALL:{   
    	Syntax:"${0}(matrizea${1} Ngarren.posizioa)",
    	Disp:"Balio batzuetatik, Ngarren balio txikiena ematen du."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(testua${1} jatorrizkoa${1} berria${1} [non])",
    	Disp:"Jatorrizko testua ordezkatzen da eta testu berria ematen du."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funtzioa${1} barrutia${1} ...)",
    	Disp:"Kalkulu-orri bateko subtotalak kalkulatzen ditu.",
    	Arguments: {
    		0 : [{
    			label : "${0} - BATEZBESTEKOA",
    			result : 1
    		}, {
    			label : "${0} - ZENBATU",
    			result: 2
    		}, {
    			label : "${0} - AKONTUA",
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
    			label : "${0} - BIDERKADURA",
    			result: 6
    		}
    		, {
    			label : "${0} - DESEST",
    			result: 7
    		}
    		, {
    			label : "${0} - DESESTP",
    			result: 8
    		}
    		, {
    			label : "${0} - BATU",
    			result: 9
    		}
    		, {
    			label : "${0} - BAR",
    			result: 10
    		}, {
    			label : "${0} - BARP",
    			result: 11
    		}, {
    			label : "${0} - BATEZBESTEKOA",
    			result: 101
    		}, {
    			label : "${0} - ZENBATU",
    			result: 102
    		}, {
    			label : "${0} - AKONTUA",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - BIDERKADURA",
    			result: 106
    		}, {
    			label : "${0} - DESEST",
    			result: 107
    		}, {
    			label : "${0} - DESESTP",
    			result: 108
    		}, {
    			label : "${0} - BATU",
    			result: 109
    		}, {
    			label : "${0} - BAR",
    			result: 110
    		}, {
    			label : "${0} - BARP",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(1.zenbakia${1} [2. zenbakia]${1} ...)",
    	Disp:"Argumentu guztien batura ematen du."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(1. matrizea${1} [2. matrizea]${1} ...)",
    	Disp:"Matrize-argumentuen biderkaduren batura ematen du."
    },
    SUMIF:{   
    	Syntax:"${0}(barrutia${1} irizpidea${1} [bati barrutia])",
    	Disp:"Baldintzak betetzen dituzten argumentu-kopurua ematen du."
    },
    SUMIFS:{
    	Syntax: "${0}(batuketa_barrutia${1} irizpide_barrutia1${1} irizpidea1${1} ...)",
    	Disp:"Hainbat baldintza betetzen dituzten argumentuen kopurua ematen du."
    },
    SQRT:{   
    	Syntax:"${0}(zenbakia)",
    	Disp:"Zenbaki baten erro karratua ematen du."
    },
    SQRTPI:{   
    	Syntax:"${0}(zenbakia)",
        Disp:"(number * pi) zenbakiaren erro karratua ematen du."
    },
    STDEV:
    {
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Desbideratze estandarra kalkulatzen du lagin bat oinarri hartuta."
    },
    STDEVP:
    {
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
    	Disp:"Desbideratze estandarra kalkulatzen du populazio osoa oinarri hartuta."
    },
    SUMSQ:{
    	Syntax:"${0}(1 zenbakia${1} [2 zenbakia]${1} ...)",
        Disp:"Zerrendako zenbakien karratuen batuketa ematen du."
    },
    T:{
    	Syntax:"${0}(testua)",
    	Disp:"Argumentuak testu bihurtzen ditu."
    },
    TAN:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Emandako zenbakiaren tangentea ematen du."
    },
    TANH:{    
    	Syntax:"${0}(zenbakia)",
        Disp:"Emandako zenbakiaren tangente hiperbolikoa ematen du."
    },
    TBILLPRICE:{
    	Syntax:"${0}(settlement${1} maturity${1} discount)",
    	Disp:"Altxorraren letra baten balio faziala ematen du (per 100 $)."
    },
    TEXT:{
    	Syntax:"${0}(balioa${1} formatukodea)",
    	Disp:"Balioa testu bihurtzen du zenbaki-formatuaren kode baten arauak jarraituz, eta gero ematen du."
    },
    TIME:{   
    	Syntax:"${0}(ordua${1} minutua${1} segundoa)",
    	Disp:"Ordu-balio bat zehazten du ordu, minutu eta segundoak kontuan hartuta."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(testua)",
	    Disp:"Ordu-formatua izan litekeen testu baten barneko zenbaki bat ematen du."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Ordenagailuaren uneko data zehazten du."
    },    
    TRIM:{
    	Syntax:"${0}(testua)",
    	Disp:"Hasierako eta amaierako zuriune guztiak kentzen ditu. Jarraitutako barneko zuriune bi edo gehiagorik ordezkatuko dira zuriune bakar batekin."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"EGIAZKOA balio logikoa ematen du."
    },
    TRUNC:{   
    	Syntax:"${0}(zenbakia${1} [zenbatu])",
    	Disp:"Zenbaki baten hamartarren kopurua trunkatzen du."
    },
    TYPE:{   
    	Syntax:"${0}(balioa)",
    	Disp:"Balio baten datu-mota zehazten du."	
    },
    UPPER:{  
    	Syntax: "${0}(testua)",
    	Disp:"Testua maiuskulaz idazten du."
    },
    VALUE:{    
    	Syntax: "${0}(testua)",
    	Disp:"Testu-argumentu bat zenbaki bihurtzen du."
    },
    VAR:{    
    	Syntax: "${0}(1.zenbakia${1} [2.zenbakia]${1}...)",
    	Disp:"Bariantzaren kalkulua egiten du lagin bat oinarri hartuta."
    },
    VARA:{    
    	Syntax: "${0}(1.zenbakia${1} [2.zenbakia]${1}...)",
    	Disp:"Bariantzaren kalkula egiten du lagin bat oinarri hartuta, zenbakiak, testua eta balio logikoak ere kontuan hartuz."
    },
    VARP:{    
    	Syntax: "${0}(1.zenbakia${1} [2.zenbakia]${1}...)",
    	Disp:"Bariantzaren kalkulua egiten du populazio osoa oinarri hartuta."
    },
    VARPA:{    
    	Syntax: "${0}(1.zenbakia${1} [2.zenbakia]${1}...)",
    	Disp:"Bariantzaren kalkula egiten du populazio osoa oinarri hartuta, zenbakiak, testua eta balio logikoak ere kontuan hartuz."
    },
    VLOOKUP:{    
    	Syntax: "${0}(bilatzeko_irizpidea${1} matrizea${1} aurkibidea${1} [ordenatzeko irizpidea])",
    	Disp:"Bilaketa bertikala eta zehaztutako gelaxka-erreferentzia.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Gutxi gorabeherako bat-etortzea",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Bat-etortze zehatza",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(zenbakia${1} [mota])",
    	Disp:"Data-balioaren astearen eguna ematen du osoko zenbakiak erabiliz.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 1etik (igandea) 7ra (larunbata)",
          		 result : 1
          	 }, {
          		 label : "${0} - 1etik (astelehena) 7ra (igandea)",
          		 result : 2
          	 }, {
          		 label : "${0} - 0tik (astelehena) 6ra (igandea)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - 1etik (astelehena) 7ra (igandea)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - 1etik (asteartea) 7ra (astelehena)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - 1etik (asteazkena) 7ra (asteartea)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - 1etik (osteguna) 7ra (asteazkena)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - 1etik (ostirala) 7ra (osteguna)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - 1etik (larunbata) 7ra (ostirala)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - 1etik (igandea) 7ra (larunbata)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(zenbakia${1} [modua])",
    	Disp:"Zehaztutako datari dagokion egutegi-astea kalkulatzen du.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Igandea",
          		 result : 1
          	 }, {
          		 label : "${0} - Astelehena",
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
    	Syntax:"${0}(hasiera_data${1} egunak${1} [oporrak])",
    	Disp:"Zehaztutako lanegun-kopuruaren atzetik datorren edo baino lehenagoko dataren serie-zenbakia ematen du."
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} values${1} dates)",
    	Disp:"Zehaztutako kutxako fluxu baten oraingo balio garbia ematen du."
    },
    YEAR:{    
    	Syntax:"${0}(zenbakia)",
    	Disp:"Data-balio baten urtea ematen du osoko zenbakiak erabiliz."
    }
}
})

