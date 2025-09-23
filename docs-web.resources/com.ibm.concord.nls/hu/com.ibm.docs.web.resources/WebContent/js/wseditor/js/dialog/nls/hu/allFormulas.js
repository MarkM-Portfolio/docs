/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Minden képlet",
	LABEL_FORMULA_LIST: "A képletek listája:",
	formula:{
	ABS:{	
	    Syntax:"${0}(szám)",
	    Disp:"A szám abszolút értékét adja vissza."
    },
    ACOS:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám árkusz koszinuszát adja eredményül. A szög radiánban van megadva."
    },
    ACOSH:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám árkusz koszinusz hiperbolikuszát adja eredményül."
    },
    ACOT:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám árkusz kotangensét adja eredményül. A szög radiánban van megadva."
    },
    ACOTH:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám árkusz kotangens hiperbolikuszát adja eredményül."
    },
    ADDRESS:{
         Syntax:"${0}(sor${1} oszlop${1} [abs]${1} [a1]${1} [munkalap])",
         Disp:"Szöveges formában ad meg egy cellahivatkozást.",
         Arguments: {
        	 2 : [{
        		 label : "${0} – Abszolút",
        		 result : 1
        	 }, {
        		 label : "${0} – Abszolút sor / Relatív oszlop",
        		 result : 2
        	 }, {
        		 label : "${0} – Relatív sor / Abszolút oszlop",
        		 result : 3
        	 }, {
        		 label : "${0} – Relatív",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} – R1C1 stílus",
        		 result : 0
        	 }, {
        		 label: "${0} – A1 stílus",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logikai érték 1${1} [logikai érték 2]${1} ...)",
    	Disp:"Akkor ad TRUE (IGAZ) értéket eredményül, ha minden argumentum értéke TRUE."
    },
    ASIN:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám árkusz szinuszát adja eredményül. A szög radiánban van megadva."
    },
    ASINH:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám árkusz szinusz hiperbolikuszát adja eredményül."
    },
    ATAN:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám árkusz tangensét adja eredményül. A szög radiánban van megadva."
    },
    AVERAGE:{    
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Az argumentumok átlagát adja eredményül."
    },
    AVERAGEA:{    
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"A minta átlagértékét adja eredményül. A szöveget nullának tekinti."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(tartomány${1} feltétel${1} [átlag_tartomány])",
    	Disp:"Az adott feltételnek megfelelő argumentumok átlagát (számtani közepét) adja eredményül."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(átlag_tartomány${1} feltétel_tartomány1${1} feltétel1${1} ...)",
    	Disp:"A több feltételnek megfelelő argumentumok átlagát (számtani közepét) adja eredményül."
    },
    ATAN2:{
    	Syntax:"${0}(x_szám${1} y_szám)",
    	Disp:"A megadott x és y koordináta árkusz tangensét adja eredményül. Az árkusz tangens az x tengely és a koordinátákkal (x_szám, y_szám) megadott pontból az origón (0, 0) át húzott egyenes által bezárt szög."
    },
    ATANH:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám árkusz tangens hiperbolikuszát adja eredményül. A számnak -1 és 1 között kell lennie (a két szélsőértéket [-1 és 1] kizárva)."
    },
    BASE:{    
    	Syntax:"${0}(szám${1} számrendszer_alapja${1} [minimális hossz])",
    	Disp:"Átvált egy tízes számrendszerbeli pozitív egész számot egy számrendszerből a megadott alapú számrendszerbe, majd a kapott eredményt átalakítja szöveggé."
    },
    BIN2DEC:{
    	Syntax:"${0}(szám)",
    	Disp:"Bináris számot decimálissá alakít át."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Bináris számot hexadecimálissá alakít át."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Bináris számot oktálissá alakít át."
    },
    CEILING:{  
    	Syntax: "${0}(szám${1} növekmény)",
    	Disp:"A számot a legközelebbi egész számra vagy a szignifikancia legközelebbi többszörösére kerekíti fel."
    },
    CHAR: {
    	Syntax: "${0}(szám)",
    	Disp: "A karaktertábla számmal megadott karakterét adja eredményül. A Unicode karaktertáblában keres. A számnak 1 és 255 közöttinek kell lennie."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} 1._érték${1} [2._érték]${1} ...)",
    	Disp: "Az indexnek megfelelő értéket keresi meg és adja eredményül. Legföljebb 30 érték közül tud választani."
    },
    CODE:{
    	Syntax:"${0}(szöveg)",
    	Disp:"Az Unicode kódolású szöveges karakterlánc első karakteréknek numerikus kódját adja eredményül."
    },
    COLUMN:{    
    	Syntax:"${0}([hivatkozás])",
    	Disp:"A cellahivatkozásban megadott oszlop belső oszlopsorszámát adja eredményül."
    },
    COLUMNS:{    
    	Syntax:"${0}(tömb)",
    	Disp:"Egy tömbben lévő vagy cellahivatkozásban megadott oszlopok számát adja eredményül."
    },
    COMBIN:{
    	Syntax:"${0}(szám${1} választott_szám)",
    	Disp:"Adott számú elem lehetséges kombinációinak számát adja eredményül. A(z) ${0} érték segítségével az adott számú elemhez tartozó csoportok összes lehetséges számát határozhatja meg."
    },
    CONCATENATE:{   
    	Syntax:"${0}(szöveg 1${1} ...)",
    	Disp:"Több szöveges karakterláncot egyesít egy karakterlánccá."
    },
    CONVERT:{
    	Syntax:"${0}(szám${1} kiinduló_mértékegység${1} cél_mértékegység)",
    	Disp:"Átvált egy mérőszámot egyik mértékegységről a másikra.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} – Gramm",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} – Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} – Font (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} – U (atomi tömegegység)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} – Uncia (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} – Méter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} – Szárazföldi mérföld",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} – Hüvelyk",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} – Láb",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} – Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} – Angström",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} – pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} – Év",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} – Nap",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} – Óra",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} – Perc",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} – Másodperc",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} – Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} – Atmoszféra",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} – Higanymilliméter (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} – Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} – Din",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} – Font-súly",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} – Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} – Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} – IT kalória",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} – Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} – Lóerő-óra",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} – Watt-óra",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} – Lábfont",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} – BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} – Termodinamikai kalória",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} – Lóerő",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} – Watt",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} – Tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} – Gauss",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} – Celsius fok",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} – Fahrenheit fok",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} – Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} – Teáskanál",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} – Evőkanál",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} – Folyadékuncia",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} – Csésze",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} – Amerikai pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} – Angol pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} – Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} – Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} – Liter",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(szám)",
    	Disp:"Az adott szög koszinuszát adja eredményül."
    },
    COSH:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám koszinusz hiperbolikuszát adja eredményül."
    },
    COT:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám kotangensét adja eredményül."
    },
    COTH:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám kotangens hiperbolikuszát adja eredményül."
    },
    COUNT:{   
    	Syntax:"${0}(1._érték${1} [2._érték]${1} ...)",
    	Disp:"Megszámolja, hány szám szerepel az argumentumlistán. A szöveges bejegyzéseket nem veszi figyelembe."
    },
    COUNTA:{   
    	Syntax:"${0}(1._érték${1} [2._érték]${1} ...)",
    	Disp:"Megszámolja, hány érték szerepel az argumentumlistán."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(tartomány)",
    	Disp: "Megszámolja, hány üres cella van a megadott tartományban."
    },
    COUNTIF:{
    	Syntax: "${0}(tartomány${1} feltétel)",
    	Disp:"Megszámolja, hány cella felel meg az adott feltételnek."
    },
    COUNTIFS:{
    	Syntax: "${0}(feltétel_tartomány1${1} feltétel1${1} ...)",
    	Disp:"Megszámolja, hány cella felel meg több feltételnek."
    },
    CUMIPMT:{	
	    Syntax:"${0}(kamatláb${1} időszakok_száma${1} mai_érték${1} kezdő_periódus${1} végperiódus${1} típus)",
	    Disp:"Kiszámítja a kölcsönre visszafizetett összes kamat halmozott értékét két meghatározott időszak között."
    },
    CUMPRINC:{	
	    Syntax:"${0}(kamatláb${1} időszakok_száma${1} mai_érték${1} kezdő_periódus${1} végperiódus${1} típus)",
	    Disp:"Kiszámítja a kölcsönre visszafizetett összes tőkerész értékét két meghatározott időszak között."
    }, 
    DATE:{	
	    Syntax:"${0}(év${1} hónap${1} nap)",
	    Disp:"A megadott dátum belső (számítógépes) számát adja eredményül."
    },  
    DATEDIF:{	
	    Syntax:"${0}(kezdő_dátum${1} végdátum${1} formátum)",
	    Disp:"Két dátum közötti különbséget ad meg évben, hónapban vagy napban.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} – A teljes évek száma az időszakban.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} – A teljes hónapok száma az időszakban.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} – A teljes napok száma az időszakban.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - A kezdő_dátum és a végdátum közötti napok száma, figyelmen kívül hagyva a hónapokat és éveket.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - A kezdő_dátum és a végdátum közötti hónapok száma, figyelmen kívül hagyva az éveket.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - A kezdő_dátum és a végdátum közötti napok száma, figyelmen kívül hagyva az éveket.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(szöveg)",
	    Disp:"A szöveges formában megadott dátum belső (számítógépes) számát adja eredményül."
    }, 
    DAY:{
    	Syntax:"${0}(szám)",
    	Disp:"A megadott dátumban lévő nap értékét adja eredményül. A kapott érték egy 1 és 31 közötti egész szám. Negatív dátum- vagy időértéket is megadhat."
    },
    DAYS360:{
    	Syntax:"${0}(kezdő_dátum${1} végdátum${1} [metódus])",
    	Disp:"Két dátum közötti napok számát adja eredményül, 360 napos évet véve alapul.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} – Amerikai (NASD) módszer",
       		 result : "HAMIS"
       	 }, {
       		 label : "${0} – Európai módszer",
       		 result : "IGAZ"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(kezdő_dátum${1} végdátum${1})",
    	Disp:"Két dátum közötti napok számát adja eredményül."
    },
    DEC2BIN:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Decimális számot binárissá alakít át."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Decimális számot hexadecimálissá alakít át."
    },
    DEC2OCT:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Decimális számot oktálissá alakít át."
    },
    DEGREES:{	
	    Syntax:"${0}(szög)",
	    Disp:"Átalakítja a szögértéket radiánból fokká."
    },
    DISC:{
    	Syntax:"${0}(kiegyenlítés${1} lejárat${1} ár${1} visszaváltás${1} [alap])",
    	Disp:"Kiszámítja egy értékpapír leszámítolási kamatlábát."
    }, 
    DOLLAR:{
    	Syntax:"${0}(szám${1} [tizedesjegyek_száma])",
    	Disp:"Átalakítja a számot szöveggé, a $ (dollár) pénznemformátumot használva."
    },
    EDATE:{
    	Syntax:"${0}(kezdő_dátum${1} hónap)",
    	Disp:"Azt a dátumot adja vissza, amely a jelzett számú hónappal van a kezdő_dátum előtt vagy után "
    },
    EOMONTH:{
    	Syntax:"${0}(kezdő_dátum${1} hónap)",
    	Disp:"A hónap utolsó napjának a sorozatszámát adja vissza, amely a jelzett számú hónappal van a kezdő_dátum előtt vagy után"
    },
    ERFC:{   
    	Syntax:"${0}(szám)",
        Disp:"A számtól a végtelenig integrált kiegészítő hibafüggvény értékét adja eredményül."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(hivatkozás)",
    	Disp:"A hibatípusnak megfelelő számot ad eredményül."
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
    	Syntax:"${0}(szám)",
    	Disp:"Felkerekíti a számot a legközelebbi páros egész számra."
    },
    EXACT:{    
    	Syntax:"${0}(1._szöveg${1} 2._szöveg)",
    	Disp: "Összehasonlít két szöveget, és ha azonosak, akkor a TRUE (IGAZ) értéket adja eredményül. A függvény megkülönbözteti a kis- és nagybetűket."
    },
    EXP:{    
    	Syntax:"${0}(szám)",
    	Disp: "Az e értékét a számmal megadott hatványra emelve adja eredményül."
    },
    FACT:{  
    	Syntax:"${0}(szám)",
    	Disp:"A szám faktoriálisát adja eredményül."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(szám)",
        Disp:"A szám dupla faktoriálisát adja eredményül."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"A FALSE (HAMIS) logikai értéket adja eredményül."
    },
    FIND:{   
    	Syntax:"${0}(keresendő szöveg${1} szöveg${1} [elhelyezkedés])",
    	Disp:"Szöveges karakterláncot keres egy szövegben (megkülönbözteti a kis- és nagybetűket)."
    },
    FIXED:{
    	Syntax:"${0}(szám${1} [tizedesjegyek_száma]${1} [vesszők_nélkül])",
    	Disp:"Szöveggé formázza a számot, adott számú tizedesjeggyel.",
    	Arguments: {
    		2 : [{
    			label : "${0} – nincs ezreselválasztó",
    			result : "IGAZ"
    		}, {
    			label : "${0} – van ezreselválasztó",
    			result: "HAMIS" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(szám${1} szignifikancia)",
    	Disp:"A számot a szignifikancia legközelebbi többszörösére kerekíti le."
    },
    FORMULA:{   
    	Syntax:"${0}(hivatkozás)",
    	Disp:"A hivatkozással megadott képletcellában szereplő képletet adja eredményül."
    },
    FREQUENCY:{   
    	Syntax:"${0}(adatszámsor${1} rekeszszámsor)",
    	Disp:"Tartományokba szervezi az értékeket, és megszámolja, hány érték van az egyes tartományokban."
    },
    FV:{
    	Syntax:"${0}(kamatláb${1} időszakok_száma${1} részlet${1} [mai_érték]${1} [típus])",
    	Disp:"Kiszámítja egy befektetés jövőbeli értékét állandó nagyságú kamatláb alapján."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(tőke${1} ütemezés)",
        Disp:"Kiszámítja a kezdőtőke adott kamatlábak szerint megnövelt jövőbeli értékét."
    },
    GAMMALN:{   
    	Syntax:"${0}(szám)",
        Disp:"A gamma-függvény természetes alapú logaritmusát adja eredményül."
    },
    GCD:{   
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
        Disp:"Az összes argumentum legnagyobb közös osztóját adja eredményül."
    },
    HEX2BIN:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Hexadecimális számot binárissá alakít át."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(szám)",
    	Disp:"Hexadecimális számot decimálissá alakít át."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Hexadecimális számot oktálissá alakít át."
    },
    HOUR:{   
    	Syntax:"${0}(szám)",
    	Disp:"A megadott időből az óra számát (0-23) adja eredményül."
    },
    HLOOKUP:{   
    	Syntax:"${0}(keresési_feltétel${1} tömb${1} index${1} [rendezve])",
    	Disp:"Vízszintes keresést végez, és a találat oszlopában lentebb lévő cellákra hivatkozik.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} – Közelítőleges egyezés",
          		 result : "IGAZ"
          	 }, {
          		 label : "${0} – Pontos egyezés",
          		 result : "HAMIS"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [cellaszöveg])",
    	Disp:"Egy hivatkozást ad vissza, amely egy hálózati erőforrásra vagy egy hivatkozott tartományra mutat. Cellaszöveget (opcionális) jelenít meg, ha meg van adva; egyéb esetben a hivatkozást jeleníti meg szövegként."
    },    
    IF:{    
    	Syntax:"${0}(ellenőrzés${1} [akkor_érték]${1} [egyébként_érték])",
    	Disp:"Egy végrehajtandó logikai ellenőrzést ad meg."
    },
    IFS:{
    	Syntax:"${0}(ellenőrzés1${1} érték_ha_igaz1${1} ...)",
    	Disp:"Lefuttat egy logikai ellenőrzést arra vonatkozóan, hogy egy vagy több feltétel teljesül-e, és egy olyan értéket ad eredményül, amely megfelel az első IGAZ feltételnek."
    },
    IFERROR:{
    	Syntax:"${0}(érték${1} érték_ha_hiba)",
    	Disp:"Ha a kifejezés egy hiba, akkor egy meghatározott értéket ad eredményül. Egyéb esetben a kifejezés eredményét adja vissza."
    },
    IFNA:{
    	Syntax:"${0}(érték${1} érték_ha_na)",
    	Disp:"Ha egy kifejezés az #N/A hibaértéket adja eredményül, akkor a függvény egy meghatározott értéket ad vissza. Egyéb esetben a kifejezés eredményét adja vissza."
    },
    INDEX:{    
    	Syntax:"${0}(hivatkozás${1} sor${1} [oszlop]${1} [tartomány])",
    	Disp:"Egy adott tartomány megadott cellájára mutató hivatkozást ad eredményül."
    },
    INDIRECT:{    
    	Syntax:"${0}(hivatkozás${1} [hivatkozott_stílus])",
    	Disp:"Egy olyan cella tartalmát adja eredményül, amelyre szöveges formában hivatkoznak.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} – R1C1 stílus",
         		 result : "HAMIS"
         	 }, {
         		 label : "${0} – A1 stílus",
         		 result : "IGAZ"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(szám)",
    	Disp:"Lekerekíti a számot a legközelebbi egész számra."
    },
    IPMT:{
    	Syntax:"${0}(kamat${1} per${1} nper${1} pv${1} [fv]${1} [típus])",
    	Disp:"Kiszámolja a visszafizetendő kamatot egy befektetés adott időszakára vonatkozóan rendszeres fizetés és rögzített kamatláb alapján."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(érték)",
    	Disp:"Ha a hivatkozott cella üres, akkor a TRUE (IGAZ) értéket, egyébként a FALSE (HAMIS) értéket adja eredményül."
    },
    ISERR:{
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték nem a #N/A értékkel egyenlő hibaérték, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISERROR:{
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték hibaérték, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISEVEN:{    
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték páros szám, akkor a TRUE (IGAZ) értéket, egyébként a FALSE (HAMIS) értéket adja eredményül." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(hivatkozás)",
    	Disp:"Ha a cella képletet tartalmaz, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték vagy annak eredménye logikai változó, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISNA:{    
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték az #N/A érték, akkor a TRUE (IGAZ) értéket adja eredményül."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték nem szöveg, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISNUMBER:{   
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték szám, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISODD:{    
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték páratlan szám, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISPMT:{
    	Syntax:"${0}(kamatláb${1} időszak${1} időszakok_száma${1} mai_érték)",
    	Disp:"Kiszámítja a befektetés adott időszakára fizetett kamatot."
    }, 
    ISREF:{    
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték hivatkozás, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    ISTEXT:{    
    	Syntax:"${0}(érték)",
    	Disp:"Ha az érték szöveg, akkor a TRUE (IGAZ) értéket adja eredményül."
    },
    LARGE:{
        Syntax:"${0}(tömb${1} n._hely)",
    	Disp:"Az értékkészlet n. legnagyobb értékét adja eredményül."
    },
    LCM:{   
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
        Disp:"A listában szereplő összes szám legkisebb közös többszörösét adja eredményül."
    },
    LEFT:{
        Syntax:"${0}(szöveg${1} [hossz])",
    	Disp:"A megadott számú karaktert adja eredményül a szöveg elejétől kezdve."
    },
    LEN:{
    	Syntax:"${0}(szöveg)",
    	Disp:"A szöveges karakterlánc hosszát adja eredményül."
    },
    LENB:{
    	Syntax:"${0}(szöveg)",
    	Disp:"A szöveges karakterlánc bájtban mért méretét adja eredményül."
    },
    LN:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám természetes alapú logaritmusát adja eredményül."
    },
    LOG:{
    	Syntax:"${0}(szám${1} [alap])",
    	Disp:"A szám megadott alapú logaritmusát adja eredményül."
    },
    LOG10:{
    	Syntax:"${0}(szám)",
    	Disp:"A szám 10-es alapú logaritmusát adja eredményül."
    },
    LOOKUP:{
    	Syntax: "${0}(keresési feltétel${1} keresővektor${1} [eredményvektor])",
    	Disp:"Egy vektor értékét határozza meg egy másik vektor értékeivel való összevetéssel."
    },
    LOWER:{    
    	Syntax:"${0}(szöveg)",
    	Disp:"Átalakítja a szöveget csupa kisbetűssé."
    },    
    MATCH:{    
    	Syntax: "${0}(keresési feltétel${1} keresési_tömb${1} [típus])",
    	Disp:"Egy helyet határoz meg egy tömbben az értékek összehasonlítása után.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} – Kisebb mint",
         		 result : 1
         	 }, {
         		 label : "${0} – Pontos egyezés",
         		 result : 0
         	 }, {
         		 label : "${0} – Nagyobb mint",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Az argumentumlista legnagyobb értékét adja eredményül."
    },
    MEDIAN:{    
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Páratlan számú érték esetén a középső értéket adja vissza. Egyéb esetben a két középső érték számtani középértékét adja vissza."
    },
    MID:{    
    	Syntax:"${0}(szöveg${1} szám${1} szám)",
    	Disp:"Egy szöveg egy szövegrészét adja vissza."
    }, 
    MIN:{    
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Az argumentumlista legkisebb értékét adja vissza."
    },    
    MINUTE:{    
    	Syntax:"${0}(szám)",
    	Disp:"A megadott időből az óra percének számát (0-59) adja eredményül."
    },    
    MOD:{    
    	Syntax:"${0}(osztandó${1} osztó)",
    	Disp:"Az osztandónak az osztóval való elosztásakor kapott maradékot adja eredményül."
    },
    MODE:{    
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Egy minta leggyakoribb értékét adja eredményül."
    },
    MONTH:{    
    	Syntax:"${0}(szám)",
    	Disp:"A megadott dátumérték hónapját adja eredményül. A hónap egy 1 és 12 közötti egész számként jelenik meg."
    },
    MROUND:{   
    	Syntax: "${0}(szám${1} többszörös)",
        Disp:"Felkerekíti a számot a megadott többszörösre."
    },
    MMULT:{    
    	Syntax:"${0}(tömb${1} tömb)",
    	Disp:"Tömbök szorzása. A két tömb szorzatát adja eredményül."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
        Disp:"A számhalmaz multinomiális együtthatóját adja eredményül."
    },
    N:{    
    	Syntax:"${0}(érték)",
    	Disp:"Számmá alakítja az értéket."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"A #N/A hibaértéket adja eredményül."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(kezdő_dátum${1} végdátum${1} [szabadnapok])",
    	Disp:"Két dátum közötti munkanapok számát adja eredményül."
    },
    NOT:{    
    	Syntax:"${0}(logikai érték)",
    	Disp:"Az érték ellentettjét adja eredményül."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"A számítógép pillanatnyi idejét határozza meg."
    },
    NPV:{   
    	Syntax:"${0}(kamatláb${1} érték_1${1} [érték_2]${1} ...)",
        Disp:"Kiszámítja a befektetés nettó jelenlegi értékét a megadott kamatláb, illetve a jövőbeni kifizetések és bevételek alapján."
    },
    OCT2BIN:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Oktális számot binárissá alakít át."
    },
    OCT2DEC:{
    	Syntax:"${0}(szám)",
    	Disp:"Oktális számot decimálissá alakít át."
    },
    OCT2HEX:{
    	Syntax:"${0}(szám${1} [tizedesjegy])",
    	Disp:"Oktális számot hexadecimálissá alakít át."
    },
    ODD:{    
    	Syntax:"${0}(szám)",
    	Disp:"Felkerekíti a számot a legközelebbi páratlan egész számra ahol a \"fel\" azt jelenti: távolabb a 0-tól."
    },
    OFFSET:{
    	Syntax:"${0}(hivatkozás${1} sorok${1} oszlopok${1} [magasság]${1} [szélesség])",
    	Disp:"Egy olyan tartományra mutató hivatkozást ad eredményül, amely adott számú sornyi és oszlopnyi távolságra van egy bizonyos cellától vagy cellatartománytól."
    },
    OR:{    
    	Syntax:"${0}(logikai érték 1${1} [logikai érték 2]${1} ...)",
    	Disp:"Ha legalább egy argumentum értéke TRUE (IGAZ), akkor a TRUE értéket adja eredményül."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"A pi közelítő értékét adja eredményül."
    },
    PMT:{
    	Syntax:"${0}(kamat${1} nper${1} pv${1} [fv]${1} [típus])",
    	Disp:"Egy kölcsön visszafizetendő összegét adja eredményül rendszeres fizetés és rögzített kamatláb alapján."
    },
    POWER:{    
    	Syntax:"${0}(alap${1} kitevő)",
    	Disp:"A számot a kitevővel megadott hatványra emeli."
    },
    PPMT:{
    	Syntax:"${0}(kamat${1} per${1} nper${1} pv${1} [fv]${1} [típus])",
    	Disp:"Kiszámolja a visszafizetendő összeget egy befektetés adott időszakára vonatkozóan rendszeres fizetés és rögzített kamatláb alapján."
    },
    PRICEDISC:{
    	Syntax:"${0}(kiegyenlítés${1} lejárat${1} leszámítolás${1} visszaváltás${1} [alap])",
    	Disp:"Kiszámítja egy 100 Ft névértékű leszámítolt értékpapír árát."
    },
    PRICEMAT:{
    	Syntax:"${0}(kiegyenlítés${1} lejárat${1} kibocsátás${1} kamatláb${1} hozam${1} [alap])",
    	Disp:"Kiszámítja egy 100 Ft névértékű, lejáratkor kamatozó értékpapír árát."
    },
    PRODUCT:{   
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Összeszorozza egymással az argumentumként megadott összes számot, és az így kapott szorzatot adja eredményül."
    },
    PROPER:{    
    	Syntax:"${0}(szöveg)",
    	Disp:"A szöveges karakterlánc betűit az elvárások szerint alakítja kis- és nagybetűkké, minden szó első betűjét nagybetűvé, az összes többi betűt kisbetűvé."
    },
    PV:{
    	Syntax:"${0}(kamatláb${1} időszakok_száma${1} részlet${1} [jövőbeli_érték]${1} [típus])",
    	Disp:"Kiszámítja a befektetés mai értékét a jövőbeni kifizetések sorozata alapján."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(számláló${1} nevező)",
        Disp:"Két szám osztásból adódó hányadosát adja eredményül, egész számra csonkolva."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Egy 0 és 1 közötti véletlen számot ad eredményül."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(legkisebb${1} legnagyobb)",
    	Disp: "A két megadott szám közé eső véletlen egész számot ad eredményül."
    },
    RANK:{    
    	Syntax:"${0}(szám${1} hivatkozás${1} [sorrend])",
    	Disp: "Azt adja eredményül, hányadik helyet foglalja el az érték a mintán belül.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} – Csökkenő",
          		 result : 0
          	 }, {
          		 label : "${0} – Növekvő",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(kiegyenlítés${1} lejárat${1} befektetés${1} leszámítolás${1} [alap])",
    	Disp:"Kiszámítja a lejáratig teljesen lekötött értékpapír lejáratakor kapott összeget."
    }, 
    REPLACE:{    
    	Syntax: "${0}(szöveg${1} hely${1} hossz${1} új szöveg)",
    	Disp:"Szövegen belüli karaktereket cserél ki más szövegkarakterekre."	
    },
    REPT:{    
    	Syntax: "${0}(szöveg${1} szám)",
    	Disp:"A megadott számú alkalommal ismétel meg egy adott szöveget."	
    },
    RIGHT:{
    	Syntax: "${0}(szöveg${1} [szám])",
    	Disp:"Egy szöveg utolsó karakterét vagy adott számú utolsó karakterét adja eredményül."
    },
    RIGHTB:{
    	Syntax: "${0}(szöveg${1} [szám])",
    	Disp:"Egy szöveg utolsó karakterét vagy adott számú utolsó karakterét adja eredményül."
    },
    ROUND:{   
    	Syntax: "${0}(szám${1} számjegy)",
    	Disp:"A megadott pontossággal kerekíti a számot."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(szám${1} számjegy)",
    	Disp:"A megadott pontossággal kerekíti lefelé a számot."
    },
    ROUNDUP:{   
    	Syntax: "${0}(szám${1} számjegy)",
    	Disp:"A megadott pontossággal kerekíti felfelé a számot."
    },
    ROW:{   
    	Syntax:"${0}([hivatkozás])",
    	Disp:"A cellahivatkozásban megadott sor belső sorszámát adja eredményül."
    },
    ROWS:{   
    	Syntax:"${0}(tömb)",
    	Disp:"Egy tömbben lévő vagy cellahivatkozásban megadott sorok számát adja eredményül."
    },
    RADIANS:{   
    	Syntax:"${0}(szög)",
    	Disp:"Átalakítja a szögértéket fokból radiánná."
    },
    ROMAN:{   
    	Syntax:"${0}(szám${1} [formátum])",
    	Disp:"Az arab számokat római számokká (szöveggé) alakítja át.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – Klasszikus",
          		 result : 0
          	 }, {
          		 label : "${0} – Tömörebb",
          		 result : 1
          	 }, {
          		 label : "${0} – Tömörebb",
          		 result : 2
          	 }, {
          		 label : "${0} – Tömörebb",
          		 result : 3
          	 }, {
          		 label : "${0} – Egyszerűsített",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(keresendő szöveg${1} szöveg${1} [elhelyezkedés])",
    	Disp:"Egy adott szöveget keres egy másik szövegen belül (nem tesz különbséget a kis- és nagybetűk között)."
    },  
    SIGN:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám algebrai előjelét adja eredményül."
    },
    SIN:{    
    	Syntax:"${0}(szám)",
    	Disp:"Egy adott szög szinuszát adja eredményül."
    },
    SINH:{    
    	Syntax:"${0}(szám)",
    	Disp:"A szám szinusz hiperbolikuszát adja eredményül."
    },
    SECOND:{    
    	Syntax:"${0}(szám)",
    	Disp:"A megadott időből a percének másodpercének számát (0-59) adja eredményül."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} együtthatók)",
        Disp:"A képlet alapján a hatványsor összegét adja eredményül."
    },
    SHEET:{   
    	Syntax:"${0}([hivatkozás])",
    	Disp:"Hivatkozás vagy karakterlánc belső munkalapszámát adja eredményül."
    },
    SMALL:{   
    	Syntax:"${0}(tömb${1} n._hely)",
    	Disp:"Az értékkészlet n. legkisebb értékét adja eredményül."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(szöveg${1} régi${1} új${1} [melyik])",
    	Disp:"Azokat a szövegrészeket adja eredményül, ahol a régi szöveg le lett cserélve az új szövegre."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(függvény${1} tartomány${1} ...)",
    	Disp:"Kiszámolja a részösszegeket egy táblázatban.",
    	Arguments: {
    		0 : [{
    			label : "${0} – ÁTLAG",
    			result : 1
    		}, {
    			label : "${0} – DARAB",
    			result: 2
    		}, {
    			label : "${0} – DARAB2",
    			result: 3
    		}
    		, {
    			label : "${0} – MAX",
    			result: 4
    		}
    		, {
    			label : "${0} – MIN",
    			result: 5
    		}
    		, {
    			label : "${0} – SZORZAT",
    			result: 6
    		}
    		, {
    			label : "${0} – SZÓRÁS",
    			result: 7
    		}
    		, {
    			label : "${0} – SZÓRÁSP",
    			result: 8
    		}
    		, {
    			label : "${0} – SZUM",
    			result: 9
    		}
    		, {
    			label : "${0} – VAR",
    			result: 10
    		}, {
    			label : "${0} – VARP",
    			result: 11
    		}, {
    			label : "${0} – ÁTLAG",
    			result: 101
    		}, {
    			label : "${0} – DARAB",
    			result: 102
    		}, {
    			label : "${0} – DARAB2",
    			result: 103
    		}, {
    			label : "${0} – MAX",
    			result: 104
    		}, {
    			label : "${0} – MIN",
    			result: 105
    		}, {
    			label : "${0} – SZORZAT",
    			result: 106
    		}, {
    			label : "${0} – SZÓRÁS",
    			result: 107
    		}, {
    			label : "${0} – SZÓRÁSP",
    			result: 108
    		}, {
    			label : "${0} – SZUM",
    			result: 109
    		}, {
    			label : "${0} – VAR",
    			result: 110
    		}, {
    			label : "${0} – VARP",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Az összes argumentum összegét adja eredményül."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(1._tömb${1} [2._tömb]${1} ...)",
    	Disp:"A tömbben lévő argumentumok szorzatainak összegét adja eredményül."
    },
    SUMIF:{   
    	Syntax:"${0}(tartomány${1} feltétel${1} [összegzési tartomány])",
    	Disp:"Az adott feltételeknek megfelelő argumentumok összegét adja eredményül."
    },
    SUMIFS:{
    	Syntax: "${0}(össz_tartomány${1} feltétel_tartomány1${1} feltétel1${1} ...)",
    	Disp:"A több feltételnek megfelelő argumentumok összegét adja eredményül."
    },
    SQRT:{   
    	Syntax:"${0}(szám)",
    	Disp:"A szám négyzetgyökét adja eredményül."
    },
    SQRTPI:{   
    	Syntax:"${0}(szám)",
        Disp:"A (szám * pi) négyzetgyökét adja eredményül."
    },
    STDEV:
    {
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"A minta értékeinek normál szórását számolja ki."
    },
    STDEVP:
    {
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
    	Disp:"Kiszámolja a szórást az összes értékre nézve."
    },
    SUMSQ:{
    	Syntax:"${0}(1._szám${1} [2._szám]${1} ...)",
        Disp:"A listában szereplő számok négyzeteinek összegét adja eredményül."
    },
    T:{
    	Syntax:"${0}(szöveg)",
    	Disp:"Szöveggé alakítja az argumentumot."
    },
    TAN:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám tangensét adja eredményül."
    },
    TANH:{    
    	Syntax:"${0}(szám)",
        Disp:"A szám tangens hiperbolikuszát adja eredményül."
    },
    TBILLPRICE:{
    	Syntax:"${0}(kiegyenlítés${1} lejárat${1} leszámítolás)",
    	Disp:"Kiszámítja egy 100 Ft névértékű kincstárjegy árát."
    },
    TEXT:{
    	Syntax:"${0}(érték${1} formátumkód)",
    	Disp:"Szöveggé alakítja az értéket valamilyen számformázási kód szabályai szerint, és ezt adja eredményül."
    },
    TIME:{   
    	Syntax:"${0}(óra${1} perc${1} másodperc)",
    	Disp:"Az óra, perc és másodperc értékéből meghatározza az időt."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(szöveg)",
	    Disp:"Egy belső (számítógépes) számot ad vissza egy lehetséges időformátumot tartalmazó szöveg alapján."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"A számítógépen aktuális dátumot határozza meg."
    },    
    TRIM:{
    	Syntax:"${0}(szöveg)",
    	Disp:"Eltávolítja a szöveg előtti és szöveg utáni összes szóközt. A szövegen belüli minden 2 vagy több egymást követő szóköz egy szóközre csökken."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"A TRUE (IGAZ) logikai értéket adja eredményül."
    },
    TRUNC:{   
    	Syntax:"${0}(szám${1} [számjegy])",
    	Disp:"Az adott számúra csökkenti a szám tizedesjegyeit."
    },
    TYPE:{   
    	Syntax:"${0}(érték)",
    	Disp:"Meghatározza az érték adattípusát."	
    },
    UPPER:{  
    	Syntax: "${0}(szöveg)",
    	Disp:"Nagybetűssé alakítja a szöveget."
    },
    VALUE:{    
    	Syntax: "${0}(szöveg)",
    	Disp:"Számmá alakítja át a szöveges argumentumot."
    },
    VAR:{    
    	Syntax: "${0}(1._szám${1} [2._szám]${1}...)",
    	Disp:"Megbecsli a minta varianciáját."
    },
    VARA:{    
    	Syntax: "${0}(1._szám${1} [2._szám]${1}...)",
    	Disp:"Megbecsli a minta varianciáját, a mintába beleértve a számokat, szövegeket és logikai értékeket is."
    },
    VARP:{    
    	Syntax: "${0}(1._szám${1} [2._szám]${1}...)",
    	Disp:"Kiszámolja a varianciát az összes értékre nézve."
    },
    VARPA:{    
    	Syntax: "${0}(1._szám${1} [2._szám]${1}...)",
    	Disp:"Kiszámolja a varianciát az összes értékre nézve, beleértve a számokat, szövegeket és logikai értékeket is."
    },
    VLOOKUP:{    
    	Syntax: "${0}(keresési feltétel${1} tömb${1} index${1} [rendezési sorrend])",
    	Disp:"Függőleges keresést végez, és a találat sorában balra lévő cellákra hivatkozik.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} – Közelítőleges egyezés",
          		 result : "IGAZ"
          	 }, {
          		 label : "${0} – Pontos egyezés",
          		 result : "HAMIS"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(szám${1} [típus])",
    	Disp:"A dátumértékből a hét adott napjának megfelelő egész számot ad vissza eredményül.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – Számok 1-től (vasárnap) 7-ig (szombat)",
          		 result : 1
          	 }, {
          		 label : "${0} – Számok 1-től (hétfő) 7-ig (vasárnap)",
          		 result : 2
          	 }, {
          		 label : "${0} – Számok 0-tól (hétfő) 6-ig (vasárnap)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} – Számok 1-től (hétfő) 7-ig (vasárnap)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} – Számok 1-től (kedd) 7-ig (hétfő)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} – Számok 1-től (szerda) 7-ig (kedd)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} – Számok 1-től (csütörtök) 7-ig (szerda)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} – Számok 1-től (péntek) 7-ig (csütörtök)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} – Számok 1-től (szombat) 7-ig (péntek)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} – Számok 1-től (vasárnap) 7-ig (szombat)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(szám${1} [módusz])",
    	Disp:"Kiszámolja, hogy hányadik naptári hétnek felel meg a megadott dátum.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – Vasárnap",
          		 result : 1
          	 }, {
          		 label : "${0} – Hétfő",
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
    	Syntax:"${0}(kezdő_dátum${1} napok${1} [szabadnapok])",
    	Disp:"A kezdő dátum előtt vagy után a megadott számú munkanapra lévő dátumot adja vissza."
    },
    XNPV:{   
    	Syntax:"${0}(kamatláb${1} értékek${1} dátumok)",
    	Disp:"Kiszámítja az ütemezett készpénzmozgás nettó jelenlegi értékét."
    },
    YEAR:{    
    	Syntax:"${0}(szám)",
    	Disp:"A dátumértékből az évet adja eredményül egész számként."
    }
}
})

