/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Všetky vzorce",
	LABEL_FORMULA_LIST: "Zoznam vzorcov:",
	formula:{
	ABS:{	
	    Syntax:"${0}(číslo)",
	    Disp:"Vráti absolútnu hodnotu čísla."
    },
    ACOS:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti arkuskosínus čísla. Vráti sa veľkosť uhla v radiánoch."
    },
    ACOSH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti inverzný prirodzený kosínus čísla."
    },
    ACOT:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti inverzný kotangens čísla. Uhol je meraný v radiánoch."
    },
    ACOTH:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti inverzný hyperbolický kotangens čísla."
    },
    ADDRESS:{
         Syntax:"${0}(riadok${1} stĺpec${1} [abs]${1} [a1]${1} [hárok])",
         Disp:"Vráti referenciu na bunku ako text.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - absolútne",
        		 result : 1
        	 }, {
        		 label : "${0} - absolútny riadok/relatívny stĺpec",
        		 result : 2
        	 }, {
        		 label : "${0} - relatívny riadok/absolútny stĺpec",
        		 result : 3
        	 }, {
        		 label : "${0} - relatívne",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - štýl R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - štýl A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logická hodnota 1${1} [logická hodnota 2]${1} ...)",
    	Disp:"Vráti hodnotu TRUE, ak sú všetky argumenty TRUE."
    },
    ASIN:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti arkussínus čísla. Vráti sa veľkosť uhla v radiánoch."
    },
    ASINH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti inverzný prirodzený sínus čísla."
    },
    ATAN:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti arkustangens čísla. Vráti sa veľkosť uhla v radiánoch."
    },
    AVERAGE:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti priemer argumentov."
    },
    AVERAGEA:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti priemernú hodnotu pre vzorku. Text sa vyhodnocuje ako nula."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(rozsah${1} kritérium${1} [priemerný_rozsah])",
    	Disp:"Vráti priemer (aritmetickú strednú hodnotu) argumentov, ktoré vyhovujú danej podmienke."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(priemerný_rozsah${1} rozsah_kritéria1${1} kritérium1${1} ...)",
    	Disp:"Vráti priemer (aritmetickú strednú hodnotu) argumentov, ktoré vyhovujú viacerým podmienkam."
    },
    ATAN2:{
    	Syntax:"${0}(x_číslo${1} y_číslo)",
    	Disp:"Vráti arkustangens alebo inverzný tangens zadaných súradníc x a y. Arkustangens je uzol medzi osou x a čiarou, ktorá prechádza počiatkom (0, 0) a bodom zo súradnicami (x_číslo, y_číslo)."
    },
    ATANH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti inverzný prirodzený tangens čísla. Číslo musí byť medzi -1 a 1 (mimo -1 a 1)."
    },
    BASE:{    
    	Syntax:"${0}(číslo${1} základ${1} [minimálna dĺžka])",
    	Disp:"Konvertuje kladné celé číslo na text z číselného systému na definovaný základ."
    },
    BIN2DEC:{
    	Syntax:"${0}(číslo)",
    	Disp:"Konvertuje binárne číslo na desiatkové číslo."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje binárne číslo na šestnástkové číslo."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje binárne číslo na osmičkové číslo."
    },
    CEILING:{  
    	Syntax: "${0}(číslo${1} inkrement)",
    	Disp:"Zaokrúhli číslo nahor na najbližšie celé číslo alebo na najbližší násobok danej hodnoty."
    },
    CHAR: {
    	Syntax: "${0}(číslo)",
    	Disp: "Vráti znak, ktorý je namapovaný k číslu. Znak sa hľadá v mape znakov Unicode. Číslo je medzi 1 a 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} hodnota1${1} [hodnota2]${1} ...)",
    	Disp: "Nájde a vráti zodpovedajúcu hodnotu podľa indexu. Môže vybrať z najviac 30 hodnôt."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Vráti číselný kód pre prvý znak v textovom reťazci, ktorý je používa kód unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([referencia])",
    	Disp:"Vráti interné číslo stĺpca referencie."
    },
    COLUMNS:{    
    	Syntax:"${0}(pole)",
    	Disp:"Vráti počet stĺpcov v poli alebo referencii."
    },
    COMBIN:{
    	Syntax:"${0}(číslo${1} vybraté číslo)",
    	Disp:"Vráti počet kombinácií pre daný počet položiek. Ak chcete určiť celkový možný počet skupín pre daný počet položiek, použite ${0}."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Kombinuje viacero textových reťazcov do jedného reťazca."
    },
    CONVERT:{
    	Syntax:"${0}(číslo${1} zdrojová_jednotka${1} cieľová_jednotka)",
    	Disp:"Konvertuje číslo z jedného meracieho systému do druhého.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Hmotnosť v librách (anglosaská sústava)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (jednotka atómovej hmotnosti)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Hmotnosť v uncách (anglosaská sústava)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Míľa",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Palec",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Stopa",
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
       		 label : "${0} - Rok",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Deň",
       		 result : "\"deň\""
       	 }, {
       		 label : "${0} - Hodina",
       		 result : "\"h\""
       	 }, {
       		 label : "${0} - Minúta",
       		 result : "\"min\""
       	 }, {
       		 label : "${0} - Sekunda",
       		 result : "\"s\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosféra",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - výška ortuťového stĺpca v milimetroch (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyn",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Sila v librách",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Kalória IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektrónvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Konská sila-hodina",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-hodina",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Stopa-libra",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Termodynamická kalória",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Konská sila",
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
       		 label : "${0} - Stupeň celzia",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Stupeň fahrenheita",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Čajová lyžička",
       		 result : "\"č. l.\""
       	 }, {
       		 label : "${0} - Polievková lyžica",
       		 result : "\"p. l.\""
       	 }, {
       		 label : "${0} - Dutá unca",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Šálka",
       		 result : "\"š.\""
       	 }, {
       		 label : "${0} - Americká pinta",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Anglická pinta",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Štvrtina galónu",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galón",
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
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti kosínus daného uhla."
    },
    COSH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti prirodzený kosínus čísla."
    },
    COT:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti kotangens daného čísla."
    },
    COTH:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti hyperbolický kotangens daného čísla."
    },
    COUNT:{   
    	Syntax:"${0}(hodnota1${1} [hodnota2]${1} ...)",
    	Disp:"Spočíta, koľko čísiel je v zozname argumentov. Textové položky sa ignorujú."
    },
    COUNTA:{   
    	Syntax:"${0}(hodnota1${1} [hodnota2]${1} ...)",
    	Disp:"Spočíta, koľko hodnôt je v zozname argumentov."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(rozsah)",
    	Disp: "Spočíta prázdne bunky v danom rozsahu."
    },
    COUNTIF:{
    	Syntax: "${0}(rozsah${1} kritérium)",
    	Disp:"Spočíta počet buniek, ktoré vyhovujú danej podmienke."
    },
    COUNTIFS:{
    	Syntax: "${0}(rozsah_kritéria1${1} kritérium1${1} ...)",
    	Disp:"Spočíta počet buniek, ktoré vyhovujú viacerým podmienkam."
    },
    CUMIPMT:{	
	    Syntax:"${0}(sadzba${1} pobd${1} sh${1} začiatočné_obdobie${1} koncové_obdobie${1} typ)",
	    Disp:"Vypočíta kumulatívny úrok zaplatený medzi dvomi zadanými obdobiami."
    },
    CUMPRINC:{	
	    Syntax:"${0}(sadzba${1} pobd${1} sh${1} začiatočné_obdobie${1} koncové_obdobie${1} typ)",
	    Disp:"Vypočíta kumulatívnu istinu pôžičky zaplatenú medzi dvomi zadanými obdobiami."
    }, 
    DATE:{	
	    Syntax:"${0}(rok${1} mesiac${1} deň)",
	    Disp:"Poskytne interné číslo pre daný dátum."
    },  
    DATEDIF:{	
	    Syntax:"${0}(začiatočný_dátum${1} koncový_dátum${1} formát)",
	    Disp:"Vráti rozdiel v rokoch, mesiacoch alebo dňoch medzi dvomi dátumami.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Počet celých rokov v období.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Počet celých mesiacov v období.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Počet dní v období.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Počet dní medzi začiatočný_dátum a koncový_dátom, pričom sa ignorujú mesiace a roky.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Počet mesiacov medzi začiatočný_dátum a koncový_dátom, pričom sa ignorujú roky.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Počet rokov medzi začiatočný_dátum a koncový_dátom, pričom sa ignorujú roky.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Vráti interné číslo pre text s možným formátom dátumu."
    }, 
    DAY:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti deň danej hodnoty dátumu. Deň sa vráti ako celé číslo medzi 1 a 31. Môžete tiež zadať zápornú hodnotu dátum/čas."
    },
    DAYS360:{
    	Syntax:"${0}(začiatočný_dátum${1} koncový_dátum${1} [metóda])",
    	Disp:"Vypočíta počet dní medzi dvomi dátumami podľa 360-dňového kalendára.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Americká metóda (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Európska metóda",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(začiatočný_dátum${1} koncový_dátum${1})",
    	Disp:"Vypočíta počet dní medzi dvomi dátumami."
    },
    DEC2BIN:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje desiatkové číslo na binárne číslo."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje desiatkové číslo na šestnástkové číslo."
    },
    DEC2OCT:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje desiatkové číslo na osmičkové číslo."
    },
    DEGREES:{	
	    Syntax:"${0}(uhol)",
	    Disp:"Konvertuje radiány na stupne."
    },
    DISC:{
    	Syntax:"${0}(vyrovnanie${1} splatnosť${1} pr${1} vyplatenie${1} [základ])",
    	Disp:"Vypočíta diskontnú sadzbu cenného papiera."
    }, 
    DOLLAR:{
    	Syntax:"${0}(číslo${1} [desatinné miesta])",
    	Disp:"Konvertuje číslo na text pomocou formátu meny $ (dolár)."
    },
    EDATE:{
    	Syntax:"${0}(začiatočný_dátum${1} mesiace)",
    	Disp:"Vráti sériové číslo, ktoré reprezentuje dátum určený zadaným počtom mesiacov pred alebo po začiatočný_dátum "
    },
    EOMONTH:{
    	Syntax:"${0}(začiatočný_dátum${1} mesiace)",
    	Disp:"Vráti sériové číslo posledného dňa mesiaca, ktorý je určený zadaným počtom mesiacov pred alebo po začiatočný_dátum"
    },
    ERFC:{   
    	Syntax:"${0}(číslo)",
        Disp:"Vráti komplementárnu chybovú funkciu integrovanú medzi číslom a nekonečnom."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referencia)",
    	Disp:"Vráti číslo, ktoré zodpovedá typu chyby."
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
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti číslo zaokrúhlené na najbližšie párne celé číslo."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Porovná dva textové reťazce a vráti hodnotu TRUE, ak sú rovnaké. Táto funkcia rozlišuje veľkosť písmen."
    },
    EXP:{    
    	Syntax:"${0}(číslo)",
    	Disp: "Vráti e umocnené na dané číslo."
    },
    FACT:{  
    	Syntax:"${0}(číslo)",
    	Disp:"Vypočíta faktoriál čísla."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(číslo)",
        Disp:"Vráti dvojitý faktoriál čísla."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Vráti logickú hodnotu ako FALSE."
    },
    FIND:{   
    	Syntax:"${0}(hľadaný text${1} text${1} [pozícia])",
    	Disp:"Hľadá reťazec textu v inom reťazci (rozlišuje veľkosť písmen)."
    },
    FIXED:{
    	Syntax:"${0}(číslo${1} [desatinné miesta${1} [no_commas])",
    	Disp:"Formátuje číslo ako text s pevným počtom desatinných miest.",
    	Arguments: {
    		2 : [{
    			label : "${0} - zabrániť čiarkam",
    			result : "TRUE"
    		}, {
    			label : "${0} - nezabrániť čiarkam",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(číslo${1} hodnota)",
    	Disp:"Zaokrúhli číslo nadol na najbližší násobok danej hodnoty."
    },
    FORMULA:{   
    	Syntax:"${0}(referencia)",
    	Disp:"Vráti vzorec bunky vzorca."
    },
    FREQUENCY:{   
    	Syntax:"${0}(údaje_poradového_zoznamu_čísiel${1} rozsahy_poradového_zoznamu_čísiel)",
    	Disp:"Kategorizuje hodnoty do intervalov a spočíta počet hodnôt v každom intervale."
    },
    FV:{
    	Syntax:"${0}(sadzba${1} pobd${1} pmt${1} [sh]${1} [typ])",
    	Disp:"Vypočíta budúcu hodnotu investície na základe konštantnej úrokovej sadzby."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(istina${1} plán)",
        Disp:"Vypočíta budúcu hodnotu začiatočnej istiny po priradení série zložených úrokových sadzieb."
    },
    GAMMALN:{   
    	Syntax:"${0}(číslo)",
        Disp:"Vráti prirodzený logaritmus funkcie gamma."
    },
    GCD:{   
    	Syntax:"${0}(číslo1${1} [číslo 2]${1} ...)",
        Disp:"Vráti najväčšieho spoločného deliteľa všetkých argumentov."
    },
    HEX2BIN:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje šestnástkové číslo na binárne číslo."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(číslo)",
    	Disp:"Konvertuje šestnástkové číslo na desiatkové číslo."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje šestnástkové číslo na osmičkové číslo."
    },
    HOUR:{   
    	Syntax:"${0}(číslo)",
    	Disp:"Určí poradové číslo hodiny dňa (0-23) pre hodnotu času."
    },
    HLOOKUP:{   
    	Syntax:"${0}(vyhľadávacie_kritérium${1} pole${1} index${1} [sorted])",
    	Disp:"Horizontálne vyhľadávanie a referencia na bunky, ktoré sú nižšie.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približná zhoda",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Presná zhoda",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(odkaz${1} [text_bunky])",
    	Disp:"Vráti odkaz, ktorý ukazuje na sieťový prostriedok alebo na rozsah referencovaný odkazom. Zobrazí text_bunky (voliteľné), ak je zadaný. Inak zobrazí odkaz ako text."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [hodnota_potom${1} [hodnota_inak])",
    	Disp:"Určuje logický text na vykonanie."
    },
    IFS:{
    	Syntax:"${0}(test1${1} hodnota_pri_pravde1${1} ...)",
    	Disp:"Spustí logické testy na kontrolu, či je splnená jedna alebo viacero podmienok a vráti hodnotu, ktorá sa zhoduje s prvou podmienkou TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(hodnota${1} hodnota_pri_chybe)",
    	Disp:"Vráti vami zadanú hodnotu, ak je výraz chybný. Inak vráti výsledok výrazu."
    },
    IFNA:{
    	Syntax:"${0}(hodnota${1} hodnota_pri_na)",
    	Disp:"Vráti vami zadanú hodnotu, ak výraz vráti chybovú hodnotu #N/A. Inak vráti výsledok výrazu."
    },
    INDEX:{    
    	Syntax:"${0}(referencia${1} riadok${1} [stĺpec]${1} [rozsah])",
    	Disp:"Vráti referenciu na bunku z definovaného rozsahu."
    },
    INDIRECT:{    
    	Syntax:"${0}(referencia${1} [štýl_referencie])",
    	Disp:"Vráti obsah bunky, ktorá je referencovaná formou textu.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - štýl R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - štýl A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Zaokrúhli číslo nadol na najbližšie celé číslo."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Vypočíta výšku úrokovej splátky pre obdobie investície na základe pravidelných splátok a fixnej úrokovej sadzby."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je referencovaná bunka prázdna, inak vráti hodnotu FALSE."
    },
    ISERR:{
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak sa hodnota chyby nerovná #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota chyba."
    },
    ISEVEN:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota párna, inak vráti hodnotu FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referencia)",
    	Disp:"Vráti hodnotu TRUE, ak ide o bunku vzorca."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota logické číslo."
    },
    ISNA:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak sa hodnota rovná #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu true, ak hodnota nie je text."
    },
    ISNUMBER:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota číslo logické číslo."
    },
    ISODD:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota celé nepárne číslo."
    },
    ISPMT:{
    	Syntax:"${0}(sadzba${1} obd${1} pobd${1} sh)",
    	Disp:"Vypočíta hodnotu úroku zaplateného  v danom období investície."
    }, 
    ISREF:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota referencia."
    },
    ISTEXT:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vráti hodnotu TRUE, ak je hodnota text."
    },
    LARGE:{
        Syntax:"${0}(pole${1} n-tá_pozícia)",
    	Disp:"Vráti n-tú najväčšiu hodnotu z množiny hodnôt."
    },
    LCM:{   
    	Syntax:"${0}(číslo1${1} [číslo 2]${1} ...)",
        Disp:"Vráti najmenší spoločný násobok všetkých čísiel v zozname."
    },
    LEFT:{
        Syntax:"${0}(text${1} [dĺžka])",
    	Disp:"Vráti zadaný počet znakov od začiatku textu."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Vráti dĺžku textového reťazca."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Vráti počet bajtov textového reťazca."
    },
    LN:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti prirodzený logaritmus čísla."
    },
    LOG:{
    	Syntax:"${0}(číslo${1} [základ])",
    	Disp:"Vráti logaritmus čísla v danom základe."
    },
    LOG10:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti logaritmus čísla so základom 10."
    },
    LOOKUP:{
    	Syntax: "${0}(vyhľadávacie kritérium${1} vyhľadávací vektor${1} [vektor_výsledkov])",
    	Disp:"Určí hodnotu vo vektore porovnaním s hodnotami v inom vektore."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Konvertuje text na malé písmená."
    },    
    MATCH:{    
    	Syntax: "${0}(vyhľadávacie kritérium${1} vyhľadávacie_pole${1} [typ])",
    	Disp:"Definuje pozíciu v poli po porovnaní hodnôt.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Menší ako",
         		 result : 1
         	 }, {
         		 label : "${0} - Presná zhoda",
         		 result : 0
         	 }, {
         		 label : "${0} - Väčší ako",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti maximálnu hodnotu v zozname argumentov."
    },
    MEDIAN:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti strednú hodnotu, ak je daný nepárny počet hodnôt. Inak vráti aritmetický priemer dvoch stredných hodnôt."
    },
    MID:{    
    	Syntax:"${0}(text${1} číslo${1} číslo)",
    	Disp:"Vráti čiastočný textový reťazec z textu."
    }, 
    MIN:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti minimálnu hodnotu v zozname argumentov."
    },    
    MINUTE:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Určí poradové číslo pre minútu hodiny (0 - 59) pre hodnotu času."
    },    
    MOD:{    
    	Syntax:"${0}(delenec${1} deliteľ)",
    	Disp:"Vráti zvyšok po vydelení delenca deliteľom."
    },
    MODE:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti najbežnejšiu hodnotu vo vzorke."
    },
    MONTH:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti mesiac pre danú hodnotu dátumu. Mesiac sa vráti ako celé číslo medzi 1 a 12."
    },
    MROUND:{   
    	Syntax: "${0}(číslo${1} násobok)",
        Disp:"Vráti číslo zaokrúhlené na daný násobok."
    },
    MMULT:{    
    	Syntax:"${0}(pole${1} pole)",
    	Disp:"Násobenie polí. Vráti súčin dvoch polí."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(číslo1${1} [číslo 2]${1} ...)",
        Disp:"Vráti koeficient polynómu množiny čísiel."
    },
    N:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Konvertuje hodnotu na číslo."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Vráti hodnotu chyby #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(začiatočný_dátum${1} koncový_dátum${1} [sviatky])",
    	Disp:"Vráti počet pracovných dní medzi dvomi dátumami."
    },
    NOT:{    
    	Syntax:"${0}(logická hodnota)",
    	Disp:"Neguje hodnotu argumentu."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Určí aktuálny čas počíta."
    },
    NPV:{   
    	Syntax:"${0}(sadzba${1} hodnota 1${1} [hodnota 2]${1} ...)",
        Disp:"Vypočíta čistú súčasnú hodnotu investície pomocou zadanej diskontnej sadzby a série budúcich platieb a príjmov."
    },
    OCT2BIN:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje osmičkové číslo na binárne číslo."
    },
    OCT2DEC:{
    	Syntax:"${0}(číslo)",
    	Disp:"Konvertuje osmičkové číslo na desiatkové číslo."
    },
    OCT2HEX:{
    	Syntax:"${0}(číslo${1} [miesta])",
    	Disp:"Konvertuje osmičkové číslo na šestnástkové číslo."
    },
    ODD:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Zaokrúhli číslo nahor na najbližšie celé nepárne číslo, pričom \"nahor\" znamená \"pred od nuly\"."
    },
    OFFSET:{
    	Syntax:"${0}(referencia${1} riadky${1} stĺpce${1} [výška]${1} [šírka])",
    	Disp:"Vráti referenciu na rozsah určený zadaným počtom riadkov a stĺpcov z bunky alebo rozsahu buniek."
    },
    OR:{    
    	Syntax:"${0}(logická hodnota 1${1} [logická hodnota 2]${1} ...)",
    	Disp:"Vráti hodnotu TRUE, ak má aspoň jeden argument hodnotu TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Vráti približnú hodnotu Pí."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Vráti splátku pre pôžičku na základe regulárnych splátok a fixnej úrokovej sadzby."
    },
    POWER:{    
    	Syntax:"${0}(základ${1} mocnina)",
    	Disp:"Umocní základ na zadanú mocninu."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Vypočíta výšku splátky pre obdobie investície na základe pravidelných splátok a fixnej úrokovej sadzby."
    },
    PRICEDISC:{
    	Syntax:"${0}(vyrovnanie${1} splatnosť${1} zľava${1} vyplatenie${1} [základ])",
    	Disp:"Vypočíta cenu diskontného cenného papiera s nominálnou hodnotou 100 EUR."
    },
    PRICEMAT:{
    	Syntax:"${0}(vyrovnanie${1} splatnosť${1} emisia${1} sadzba${1} výnos${1} [základ])",
    	Disp:"Vypočíta cenu cenného papiera s nominálnou hodnotou 100 EUR, ktorý prináša úroky k dátumu splatnosti."
    },
    PRODUCT:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vynásobí všetky čísla dané ako argumenty a vráti súčin."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Konvertuje textový reťazec na správnu veľkosť písmen - každé slovo bude mať veľké prvé písmeno a všetky ostatné písmená malé."
    },
    PV:{
    	Syntax:"${0}(sadzba${1} pobd${1} pmt${1} [bh]${1} [typ])",
    	Disp:"Vypočíta aktuálnu hodnotu investície pomocou série budúcich platieb."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(čitateľ${1} menovateľ)",
        Disp:"Vráti výsledok čísla vydeleného iným číslom, orezaný na celé číslo."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Vráti náhodné číslo medzi 0 a 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(spodok${1} vrch)",
    	Disp: "Vráti náhodné celé číslo medzi číslami, ktoré zadáte."
    },
    RANK:{    
    	Syntax:"${0}(číslo${1} ref${1} [poradie])",
    	Disp: "Vráti relatívnu veľkosť hodnoty vo vzorke.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Zostupné",
          		 result : 0
          	 }, {
          		 label : "${0} - Vzostupné",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(vyrovnanie${1} splatnosť${1} investícia${1} zľava${1} [základ])",
    	Disp:"Vypočíta sumu prijatú k dátumu splatnosti za úplne investovaný cenný papier."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} pozícia${1} dĺžka${1} nový text)",
    	Disp:"Nahradí znaky v textovom reťazci iným textovým reťazcom."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} počet)",
    	Disp:"Zopakuje text podľa zadaného počtu opakovaní."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [číslo])",
    	Disp:"Vráti posledný znak alebo znaky textu."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [číslo])",
    	Disp:"Vráti posledný znak alebo znaky textu."
    },
    ROUND:{   
    	Syntax: "${0}(číslo${1} počet)",
    	Disp:"Zaokrúhli číslo na vopred definovanú presnosť."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(číslo${1} počet)",
    	Disp:"Zaokrúhli číslo nadol na vopred definovanú presnosť."
    },
    ROUNDUP:{   
    	Syntax: "${0}(číslo${1} počet)",
    	Disp:"Zaokrúhli číslo nahor na vopred definovanú presnosť."
    },
    ROW:{   
    	Syntax:"${0}([referencia])",
    	Disp:"Definuje interné číslo riadka referencie."
    },
    ROWS:{   
    	Syntax:"${0}(pole)",
    	Disp:"Vráti počet riadkov v poli alebo referencii."
    },
    RADIANS:{   
    	Syntax:"${0}(uhol)",
    	Disp:"Konvertuje uhly na radiány."
    },
    ROMAN:{   
    	Syntax:"${0}(číslo${1} [formát])",
    	Disp:"Konvertuje arabské číslo na rímske vo forme textu.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klasické",
          		 result : 0
          	 }, {
          		 label : "${0} - Viac zhustené",
          		 result : 1
          	 }, {
          		 label : "${0} - Viac zhustené",
          		 result : 2
          	 }, {
          		 label : "${0} - Viac zhustené",
          		 result : 3
          	 }, {
          		 label : "${0} - Zjednodušené",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(hľadaný text${1} text${1} [pozícia])",
    	Disp:"Pohľadá jednu textovú hodnotu v inej (nerozlišuje sa veľkosť písmen)."
    },  
    SIGN:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti algebraické znamienko čísla."
    },
    SIN:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti sínus daného uhla."
    },
    SINH:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti prirodzený sínus čísla."
    },
    SECOND:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Určí poradové číslo pre sekundu minúty (0 - 59) pre hodnotu času."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koeficienty)",
        Disp:"Vráti súčet mocninového radu na základe vzorca."
    },
    SHEET:{   
    	Syntax:"${0}([referencia])",
    	Disp:"Vráti interné číslo hárka referencie alebo reťazca."
    },
    SMALL:{   
    	Syntax:"${0}(pole${1} n-tá_pozícia)",
    	Disp:"Vráti n-tú najmenšiu hodnotu z množiny hodnôt."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} starý${1} nový${1} [ktorý])",
    	Disp:"Vráti text, v ktorom je starý text nahradený novým textom."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkcia${1} rozsah${1} ...)",
    	Disp:"Vypočíta medzisúčty v tabuľke.",
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
    	Syntax:"${0}(číslo1${1} [číslo 2]${1} ...)",
    	Disp:"Vráti súčet všetkých argumentov."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(pole 1${1} [pole 2]${1} ...)",
    	Disp:"Vráti súčet súčinov argumentov poľa."
    },
    SUMIF:{   
    	Syntax:"${0}(rozsah${1} kritérium${1} [rozsah sumy])",
    	Disp:"Spočíta argumenty, ktoré vyhovujú podmienkam."
    },
    SUMIFS:{
    	Syntax: "${0}(rozsah_sumácie${1} rozsah_kritéria1${1} kritérium1${1} ...)",
    	Disp:"Spočíta argumenty, ktoré vyhovujú viacerým podmienkam."
    },
    SQRT:{   
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti druhú odmocninu čísla."
    },
    SQRTPI:{   
    	Syntax:"${0}(číslo)",
        Disp:"Vráti druhú odmocninu výrazu (číslo * pí)."
    },
    STDEV:
    {
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vypočíta štandardnú odchýlku na základe vzorky."
    },
    STDEVP:
    {
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vypočíta štandardnú odchýlku na základe celej populácie."
    },
    SUMSQ:{
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
        Disp:"Vráti súčet štvorcov čísiel v zozname."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Konvertuje svoje argumenty na text."
    },
    TAN:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti tangens daného čísla."
    },
    TANH:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vráti hyperbolický tangens daného čísla."
    },
    TBILLPRICE:{
    	Syntax:"${0}(vyrovnanie${1} splatnosť${1} zľava)",
    	Disp:"Vypočíta cenu za každých 100 EUR nominálnej hodnoty štátnej pokladničnej poukážky."
    },
    TEXT:{
    	Syntax:"${0}(hodnota${1} kód_formátu)",
    	Disp:"Konvertuje hodnotu na text podľa pravidiel kódu formátu čísiel a vráti ju."
    },
    TIME:{   
    	Syntax:"${0}(hodina${1} minúta${1} sekunda)",
    	Disp:"Určí hodnotu času na základe hodiny, minúty a sekundy."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Vráti interné číslo pre text s možným formátom času."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Určí aktuálny dátum počítača."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Odstráni všetky začiatočné a koncové medzery. Každá postupnosť iná ako dve alebo viaceré vnútorné medzery sa nahradí jednou medzerou."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Vráti logickú hodnotu TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(číslo${1} [počet])",
    	Disp:"Oreže desatinné miesta čísla."
    },
    TYPE:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Definuje údajový typ hodnoty."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Konvertuje text na veľké písmená."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Konvertuje textový argument na číslo."
    },
    VAR:{    
    	Syntax: "${0}(číslo1${1} [číslo2]${1}...)",
    	Disp:"Odhadne rozdiel na základe vzorky."
    },
    VARA:{    
    	Syntax: "${0}(číslo1${1} [číslo2]${1}...)",
    	Disp:"Odhadne rozdiel na základe vzorky vrátane číselných, textových a logických hodnôt."
    },
    VARP:{    
    	Syntax: "${0}(číslo1${1} [číslo2]${1}...)",
    	Disp:"Vypočíta rozdiel na základe celej populácie."
    },
    VARPA:{    
    	Syntax: "${0}(číslo1${1} [číslo2]${1}...)",
    	Disp:"Vypočíta rozdiel na základe celej populácie vrátane číselných, textových the logických hodnôt."
    },
    VLOOKUP:{    
    	Syntax: "${0}(vyhľadávacie kritérium${1} pole${1} index${1} [poradie zoradenia])",
    	Disp:"Vertikálne vyhľadávanie a referencia na určené bunky.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približná zhoda",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Presná zhoda",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(číslo${1} [typ])",
    	Disp:"Vráti deň týždňa pre hodnotu dátumu ako celé číslo.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Čísla 1 (nedeľa) až 7 (sobota)",
          		 result : 1
          	 }, {
          		 label : "${0} - Čísla 1 (pondelok) až 7 (nedeľa)",
          		 result : 2
          	 }, {
          		 label : "${0} - Čísla 0 (pondelok) až 6 (nedeľa)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Čísla 1 (pondelok) až 7 (nedeľa)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Čísla 1 (utorok) až 7 (pondelok)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Čísla 1 (streda) až 7 (utorok)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Čísla 1 (štvrtok) až 7 (streda)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Čísla 1 (piatok) až 7 (štvrtok)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Čísla 1 (sobota) až 7 (piatok)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Čísla 1 (nedeľa) až 7 (sobota)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(číslo${1} [režim])",
    	Disp:"Vypočíta kalendárny týždeň, ktorý zodpovedá danému dátumu.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Nedeľa",
          		 result : 1
          	 }, {
          		 label : "${0} - Pondelok",
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
    	Syntax:"${0}(začiatočný_dátum${1} dni${1} [sviatky])",
    	Disp:"Vráti poradové číslo dátumu pred alebo po danom počte pracovných dní."
    },
    XNPV:{   
    	Syntax:"${0}(sadzba${1} hodnoty${1} dátumy)",
    	Disp:"Vypočíta čistú súčasnú hodnotu plánu hotovostných tokov."
    },
    YEAR:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Vráti rok hodnoty dátumu ako celé číslo."
    }
}
})

