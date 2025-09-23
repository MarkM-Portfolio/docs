/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Všechny vzorce",
	LABEL_FORMULA_LIST: "Seznam vzorců:",
	formula:{
	ABS:{	
	    Syntax:"${0}(číslo)",
	    Disp:"Vrátí absolutní hodnotu čísla."
    },
    ACOS:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí arkuskosinus čísla. Úhel se uvádí v radiánech."
    },
    ACOSH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí hodnotu hyperbolického arkuskosinu čísla."
    },
    ACOT:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí arkuskotangens čísla. Úhel se měří v radiánech."
    },
    ACOTH:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí hyperbolický arkuskotangens zadaného čísla."
    },
    ADDRESS:{
         Syntax:"${0}(řádek${1} sloupec${1} [abs]${1} [a1]${1} [list])",
         Disp:"Vrátí odkaz na buňku jako text.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - absolutní",
        		 result : 1
        	 }, {
        		 label : "${0} - absolutní (řádek) / relativní (sloupec)",
        		 result : 2
        	 }, {
        		 label : "${0} - relativní (řádek) / absolutní (sloupec)",
        		 result : 3
        	 }, {
        		 label : "${0} - relativní",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - styl R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - styl A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logická hodnota 1${1} [logická hodnota 2]${1} ...)",
    	Disp:"Vrátí hodnotu TRUE, pokud mají všechny argumenty hodnotu TRUE."
    },
    ASIN:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí arkussinus čísla. Úhel se uvádí v radiánech."
    },
    ASINH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí hyperbolický arkussinus zadaného čísla."
    },
    ATAN:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí arkustangens čísla. Úhel se uvádí v radiánech."
    },
    AVERAGE:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí průměr argumentů."
    },
    AVERAGEA:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí aritmetický průměr výběru. Text je vyhodnocen jako nula."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(oblast${1} kritéria${1} [oblast_průměru])",
    	Disp:"Vrátí průměr (aritmetický) argumentů splňujících danou podmínku."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(oblast_průměru${1} oblast_kritérií_1${1} kritérium_1${1} ...)",
    	Disp:"Vrátí průměr (aritmetický) argumentů splňujících několik podmínek."
    },
    ATAN2:{
    	Syntax:"${0}(čís_x${1} čís_y)",
    	Disp:"Vrátí arkustangens neboli inverzní funkci k funkci tangens pro zadané souřadnice x a y. Arkustangens je úhel mezi osou x a přímkou obsahující počátek (0, 0) a bod se souřadnicemi (čís_x, čís_y)."
    },
    ATANH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí hyperbolický arkustangens zadaného čísla. Číslo musí být v intervalu od -1 do 1 (s vyloučením samotných hodnot -1 a 1)."
    },
    BASE:{    
    	Syntax:"${0}(číslo${1} základ${1} [minimální délka])",
    	Disp:"Převede kladné celé číslo na text vyjadřující číslo v číselné soustavě podle zadání."
    },
    BIN2DEC:{
    	Syntax:"${0}(číslo)",
    	Disp:"Převede binární číslo na dekadické číslo."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede binární číslo na hexadecimální číslo."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede binární číslo na osmičkové číslo."
    },
    CEILING:{  
    	Syntax: "${0}(číslo${1} přírůstek)",
    	Disp:"Zaokrouhlí číslo na nejbližší celé číslo nebo násobek parametru."
    },
    CHAR: {
    	Syntax: "${0}(číslo)",
    	Disp: "Vrátí znak mapovaný číslem. Znaky vyhledává na mapě znaků kódu Unicode. Číslo je v intervalu od 1 do 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} hodnota1${1} [hodnota2]${1} ...)",
    	Disp: "Vyhledá a vrátí hodnotu, která odpovídá indexu. Pomocí operátoru CHOOSE lze vybírat až z 30 hodnot."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Vrátí číselný kód prvního znaku textového řetězce v kódu Unicode."
    },
    COLUMN:{    
    	Syntax:"${0}([odkaz])",
    	Disp:"Vrátí interní číslo sloupce pro zadaný odkaz."
    },
    COLUMNS:{    
    	Syntax:"${0}(pole)",
    	Disp:"Vrátí počet sloupců v odkazované oblasti nebo poli."
    },
    COMBIN:{
    	Syntax:"${0}(číslo${1} zvolené_číslo)",
    	Disp:"Vrátí počet kombinací daného počtu položek. Pomocí parametru ${0} lze určit celkový možný počet skupin v daném počtu položek."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Sloučí několik textových řetězců do jednoho."
    },
    CONVERT:{
    	Syntax:"${0}(číslo${1} zdrojová_jednotka${1} cílová_jednotka)",
    	Disp:"Převede číslo z jednoho měrného systému do jiného.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - libra hmotnosti (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomová hmotnostní konstanta)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - unce hmotnosti (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - metr",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - statutární míle",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - palec",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - stopa",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - rok",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - den",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - hodina",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - minuta",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - sekunda",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - atmosféra",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milimetry rtuťového sloupce (torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - dyna",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - libra síly",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - kalorie",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - koňská síla za hodinu",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - watthodina",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - librostopa",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - termodynamická kalorie",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - koňská síla",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - watt",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - gauss",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - stupeň Celsia",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - stupeň Fahrenheita",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - čajová lžička",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - polévková lžíce",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - objemová unce",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - hrnek",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - americká pinta",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - britská pinta",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - kvart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - galon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - litr",
       		 result : "\"l\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí kosinus daného úhlu."
    },
    COSH:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí hodnotu hyperbolického kosinu zadaného čísla."
    },
    COT:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí kotangens zadaného čísla."
    },
    COTH:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí hyperbolický kotangens zadaného čísla."
    },
    COUNT:{   
    	Syntax:"${0}(hodnota1${1} [hodnota2]${1} ...)",
    	Disp:"Zjistí, kolik čísel je v seznamu argumentů. Textové položky jsou ignorovány."
    },
    COUNTA:{   
    	Syntax:"${0}(hodnota1${1} [hodnota2]${1} ...)",
    	Disp:"Zjistí, kolik hodnot je v seznamu argumentů."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(oblast)",
    	Disp: "Vrátí počet prázdných buněk v zadané oblasti."
    },
    COUNTIF:{
    	Syntax: "${0}(oblast${1} kritéria)",
    	Disp:"Zjistí počet buněk, které splňují danou podmínku."
    },
    COUNTIFS:{
    	Syntax: "${0}(oblast_kritérií_1${1} kritérium_1${1} ...)",
    	Disp:"Zjistí počet buněk, které splňují několik podmínek."
    },
    CUMIPMT:{	
	    Syntax:"${0}(úroková_sazba${1} celkový_počet_plateb${1} aktuální_hodnota${1} počáteční_období${1} koncové_období${1} typ)",
	    Disp:"Vypočte kumulativní úrok zaplacený mezi dvěma určenými obdobími."
    },
    CUMPRINC:{	
	    Syntax:"${0}(úroková_sazba${1} celkový_počet_plateb${1} aktuální_hodnota${1} počáteční_období${1} koncové_období${1} typ)",
	    Disp:"Vypočte kumulativní jistinu půjčky zaplacenou mezi dvěma určenými obdobími."
    }, 
    DATE:{	
	    Syntax:"${0}(rok${1} měsíc${1} den)",
	    Disp:"Vrátí interní číslo zadaného data."
    },  
    DATEDIF:{	
	    Syntax:"${0}(počáteční_datum${1} koncové_datum${1} formát)",
	    Disp:"Vrátí rozdíl v rocích, měsících a dnech mezi dvěma kalendářními daty.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - počet celých roků v rámci období.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - počet celých měsíců v rámci období.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - počet dnů v rámci období.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - počet dnů mezi počátečním datem a koncovým datem; měsíce a roky jsou ignorovány.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - počet měsíců mezi počátečním datem a koncovým datem; roky jsou ignorovány.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - počet dnů mezi počátečním datem a koncovým datem; roky jsou ignorovány.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Vrátí interní číslo pro text, který má potenciálně formát data."
    }, 
    DAY:{
    	Syntax:"${0}(číslo)",
    	Disp:"Pro zadané datum vrátí pořadové číslo dne. Hodnota dne je vrácena jako celé číslo v rozsahu 1-31. Zadaná hodnota data/času může být i záporná."
    },
    DAYS360:{
    	Syntax:"${0}(počáteční_datum${1} koncové_datum${1} [metoda])",
    	Disp:"Spočítá počet dní mezi dvěma daty, přičemž se předpokládá, že rok má 360 dní.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - americký způsob (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - evropský způsob",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(počáteční_datum ${1} koncové_datum${1})",
    	Disp:"Vrátí počet dní mezi dvěma daty."
    },
    DEC2BIN:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede dekadické číslo na binární číslo."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede dekadické číslo na hexadecimální číslo."
    },
    DEC2OCT:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede dekadické číslo na osmičkové číslo."
    },
    DEGREES:{	
	    Syntax:"${0}(úhel)",
	    Disp:"Převede radiány na stupně."
    },
    DISC:{
    	Syntax:"${0}(vypořádání${1} splatnost${1} cena${1} zaruč_cena${1} [základna])",
    	Disp:"Vypočte diskontní sazbu pro cenný papír."
    }, 
    DOLLAR:{
    	Syntax:"${0}(číslo${1} [desetinná_místa])",
    	Disp:"Převede číslo na text ve formátu měny USD (americký dolar, $)."
    },
    EDATE:{
    	Syntax:"${0}(počáteční_datum ${1} měsíce)",
    	Disp:"Vráti pořadové číslo, které představuje datum nacházející se zadaný počet měsíců před počátečním datem nebo za ním."
    },
    EOMONTH:{
    	Syntax:"${0}(počáteční_datum ${1} měsíce)",
    	Disp:"Vráti pořadové číslo posledního dne měsíce, který se nachází zadaný počet měsíců před počátečním datem nebo za ním."
    },
    ERFC:{   
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí doplňkovou chybovou funkci integrovanou v intervalu od nuly do nekonečna."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(odkaz)",
    	Disp:"Vrátí číslo odpovídající typu chyby."
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
    	Disp:"Zaokrouhlí číslo nahoru na nejbližší sudé celé číslo."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Porovná dva textové řetězce a v případě jejich shody vrátí hodnotu TRUE. Tato funkce rozlišuje velká a malá písmena."
    },
    EXP:{    
    	Syntax:"${0}(číslo)",
    	Disp: "Vrátí hodnotu e umocněnou na zadané číslo."
    },
    FACT:{  
    	Syntax:"${0}(číslo)",
    	Disp:"Vypočte faktoriál čísla."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí dvojitý faktoriál čísla."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Vrátí logickou hodnotu FALSE."
    },
    FIND:{   
    	Syntax:"${0}(hledaný text${1} text${1} [pozice])",
    	Disp:"Vyhledá textový řetězec v jiném textovém řetězci (rozlišuje velká a malá písmena)."
    },
    FIXED:{
    	Syntax:"${0}(číslo${1} [desetinná_místa]${1} [bez_čárek])",
    	Disp:"Nastaví pro číslo jako formát text s pevným počtem desetinných míst.",
    	Arguments: {
    		2 : [{
    			label : "${0} - zabránit výskytu čárek",
    			result : "TRUE"
    		}, {
    			label : "${0} - nebránit výskytu čárek",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(číslo${1} parametr)",
    	Disp:"Zaokrouhlí číslo směrem dolů na nejbližší násobek parametru."
    },
    FORMULA:{   
    	Syntax:"${0}(odkaz)",
    	Disp:"Vrátí vzorec obsažený v buňce se vzorcem."
    },
    FREQUENCY:{   
    	Syntax:"${0}(data_seznamu_posloupnosti_čísel${1} úseky_seznamu_posloupnosti_čísel)",
    	Disp:"Kategorizuje hodnoty do intervalů a určí počet hodnot v jednotlivých intervalech."
    },
    FV:{
    	Syntax:"${0}(úroková_sazba${1} celkový_počet_plateb${1} platba${1} [aktuální_hodnota]${1} [typ])",
    	Disp:"Vypočte budoucí hodnotu investice na základě konstantní úrokové sazby."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(jistina${1} plán)",
        Disp:"Vypočte budoucí hodnotu původní jistiny po použití řady sdružených úrokových sazeb."
    },
    GAMMALN:{   
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí přirozený logaritmus funkce gama."
    },
    GCD:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
        Disp:"Vrátí největšího společného dělitele všech argumentů."
    },
    HEX2BIN:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede hexadecimální číslo na binární číslo."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(číslo)",
    	Disp:"Převede hexadecimální číslo na dekadické číslo."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede hexadecimální číslo na osmičkové číslo."
    },
    HOUR:{   
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí pořadové číslo hodiny v průběhu dne jako celé číslo v rozsahu 0 až 23."
    },
    HLOOKUP:{   
    	Syntax:"${0}(kritéria_vyhledávání${1} pole${1} index${1} [řazení])",
    	Disp:"Vyhledá zadanou hodnotu v prvním řádku oblasti a vrátí hodnotu ležící ve stejném sloupci, ale vzdálenou o určený počet řádků.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - přibližná shoda",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - přesná shoda",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(odkaz${1} [text_buňky])",
    	Disp:"Vrátí odkaz vedoucí na prostředek sítě nebo na rozsah odkazovaný odkazem. Je-li zadán parametr text_buňky (volitelný), bude zobrazen; v opačném případe bude zobrazen odkaz jako text."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [hodnota_pak]${1} [hodnota_jinak])",
    	Disp:"Určí logický test, který se má provést."
    },
    IFS:{
    	Syntax:"${0}(test_1${1} hodnota_pokud_splněno_1${1} ...)",
    	Disp:"Spustí logické testy pro kontrolu splnění jedné či více podmínek a vrátí hodnotu odpovídající první SPLNĚNÉ podmínce."
    },
    IFERROR:{
    	Syntax:"${0}(hodnota${1} hodnota_pokud_chyba)",
    	Disp:"Vrátí určenou hodnotu, pokud je výraz chybový. V opačném případě vrátí výsledek výrazu."
    },
    IFNA:{
    	Syntax:"${0}(hodnota${1} hodnota_pokud_n_a)",
    	Disp:"Vrátí určenou hodnotu, pokud výraz vrátí chybovou hodnotu #N/A. V opačném případě vrátí výsledek výrazu."
    },
    INDEX:{    
    	Syntax:"${0}(odkaz${1} řádek${1} [sloupec]${1} [rozsah])",
    	Disp:"Vrátí odkaz na buňku ležící v definované oblasti."
    },
    INDIRECT:{    
    	Syntax:"${0}(odkaz${1} [styl_odkazu])",
    	Disp:"Vrátí obsah odkazované buňky v textovém formátu.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - styl R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - styl A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Zaokrouhlí číslo dolů na nejbližší celé číslo."
    },
    IPMT:{
    	Syntax:"${0}(úroková_sazba${1} období${1} celkový_počet_plateb${1} aktuální_hodnota${1} [budoucí_hodnota]${1} [typ])",
    	Disp:"Vypočítá částku zaplacenou na úrocích za období investice na základě pravidelných plateb a pevné úrokové sazby."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je odkazovaná buňka prázdná, jinak vrátí hodnotu FALSE."
    },
    ISERR:{
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je hodnota chybovou hodnotou, která není rovna #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud se jedná o chybovou hodnotu."
    },
    ISEVEN:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je hodnota sudá, jinak vrátí hodnotu FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(odkaz)",
    	Disp:"Vrátí hodnotu TRUE, pokud buňka obsahuje vzorec."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je argumentem logická hodnota."
    },
    ISNA:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud se jedná o hodnotu #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud hodnota není textová."
    },
    ISNUMBER:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je argumentem číselná hodnota."
    },
    ISODD:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je hodnotou liché celé číslo."
    },
    ISPMT:{
    	Syntax:"${0}(úroková_sazba${1} období${1} celkový_počet_plateb${1} aktuální_hodnota)",
    	Disp:"Vypočte úrok zaplacený během určeného období investice."
    }, 
    ISREF:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je hodnotou odkaz."
    },
    ISTEXT:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Vrátí hodnotu TRUE, pokud je hodnotou text."
    },
    LARGE:{
        Syntax:"${0}(pole${1} ntá_pozice)",
    	Disp:"Vrátí n-tou nejvyšší hodnotu z množiny hodnot."
    },
    LCM:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
        Disp:"Vrátí nejmenší společný násobek všech čísel v seznamu."
    },
    LEFT:{
        Syntax:"${0}(text${1} [délka])",
    	Disp:"Vrátí určený počet znaků od začátku textu."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Vrátí délku textového řetězce."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Vrátí počet bajtů v textovém řetězci."
    },
    LN:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí přirozený logaritmus čísla."
    },
    LOG:{
    	Syntax:"${0}(číslo${1} [základ])",
    	Disp:"Vrátí logaritmus čísla o zadaném základu."
    },
    LOG10:{
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí dekadický logaritmus čísla."
    },
    LOOKUP:{
    	Syntax: "${0}(vyhledávací_kritérium${1} prohledávaný_vektor${1} [výsledkový_vektor])",
    	Disp:"Vyhledá hodnotu v jednom vektoru porovnáním s hodnotami v druhém vektoru."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Převede text na malá písmena."
    },    
    MATCH:{    
    	Syntax: "${0}(vyhledávací_kritérium${1} vyhledávací_pole${1} [typ])",
    	Disp:"Vrátí polohu hledaného prvku v poli po porovnání hodnot.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - menší než",
         		 result : 1
         	 }, {
         		 label : "${0} - přesná shoda",
         		 result : 0
         	 }, {
         		 label : "${0} - větší než",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí maximální hodnotu ze seznamu argumentů."
    },
    MEDIAN:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí prostřední hodnotu, pokud je zadán lichý počet hodnot. V opačném případě vrátí aritmetický průměr dvou prostředních hodnot."
    },
    MID:{    
    	Syntax:"${0}(text${1} číslo${1} číslo)",
    	Disp:"Vrátí podřetězec textového řetězce."
    }, 
    MIN:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí minimální hodnotu ze seznamu argumentů."
    },    
    MINUTE:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Pro hodnotu času vrátí pořadové číslo minuty jako celé číslo v rozsahu 0 - 59."
    },    
    MOD:{    
    	Syntax:"${0}(dělenec${1} dělitel)",
    	Disp:"Vrátí zbytek po dělení dělence dělitelem."
    },
    MODE:{    
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí nejčastěji se vyskytující hodnotu v množině dat."
    },
    MONTH:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Pro zadané datum vrátí měsíc. Hodnota měsíce je vrácena jako celé číslo v rozsahu 1-12."
    },
    MROUND:{   
    	Syntax: "${0}(číslo${1} násobek)",
        Disp:"Vrátí číslo zaokrouhlené podle zadaného násobku."
    },
    MMULT:{    
    	Syntax:"${0}(matice${1} matice)",
    	Disp:"Součin matic. Vrátí součin dvou matic."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
        Disp:"Vrátí multinomický koeficient množiny čísel."
    },
    N:{    
    	Syntax:"${0}(hodnota)",
    	Disp:"Převede hodnotu na číslo."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Vrátí chybovou hodnotu #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(počáteční_datum${1} koncové_datum${1} [svátky])",
    	Disp:"Vrátí počet pracovních dnů mezi dvěma daty."
    },
    NOT:{    
    	Syntax:"${0}(logická hodnota)",
    	Disp:"Vrátí logickou negaci argumentu."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Vrátí aktuální čas počítače."
    },
    NPV:{   
    	Syntax:"${0}(úroková_sazba${1} hodnota 1${1} [hodnota 2]${1} ...)",
        Disp:"Vypočte čistou současnou hodnotu investice na základě zadané diskontní sazby a řady budoucích plateb a výnosu."
    },
    OCT2BIN:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede osmičkové číslo na binární číslo."
    },
    OCT2DEC:{
    	Syntax:"${0}(číslo)",
    	Disp:"Převede osmičkové číslo na dekadické číslo."
    },
    OCT2HEX:{
    	Syntax:"${0}(číslo${1} [místa])",
    	Disp:"Převede osmičkové číslo na hexadecimální číslo."
    },
    ODD:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Zaokrouhlí číslo nahoru na nejbližší liché číslo, přičemž „nahoru“ znamená „směrem od nuly“."
    },
    OFFSET:{
    	Syntax:"${0}(odkaz${1} řádky${1} sloupce${1} [výška]${1} [šířka])",
    	Disp:"Vrátí odkaz na oblast, která se nachází o zadaný počet řádků a sloupců od buňky nebo oblasti buněk."
    },
    OR:{    
    	Syntax:"${0}(logická hodnota 1${1} [logická hodnota 2]${1} ...)",
    	Disp:"Vrátí logickou hodnotu TRUE, pokud alespoň jeden z argumentů má logickou hodnotu TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Vrátí přibližnou hodnotu čísla pí."
    },
    PMT:{
    	Syntax:"${0}(úroková_sazba${1} celkový_počet_plateb${1} aktuální_hodnota${1} [budoucí_hodnota]${1} [typ])",
    	Disp:"Vrátí částku půjčky na základě pravidelných plateb a pevné úrokové sazby."
    },
    POWER:{    
    	Syntax:"${0}(základ${1} exponent)",
    	Disp:"Umocní číslo s použitím zadaného exponentu."
    },
    PPMT:{
    	Syntax:"${0}(úroková_sazba${1} období${1} celkový_počet_plateb${1} aktuální_hodnota${1} [budoucí_hodnota]${1} [typ])",
    	Disp:"Vypočítá zaplacenou částku za období investice na základě pravidelných plateb a pevné úrokové sazby."
    },
    PRICEDISC:{
    	Syntax:"${0}(vypořádání${1} splatnost${1} diskontní_sazba${1} zaruč_cena${1} [základna])",
    	Disp:"Vypočte cenu pro nominální hodnotu 100 Kč diskontovaného cenného papíru."
    },
    PRICEMAT:{
    	Syntax:"${0}(vypořádání${1} splatnost${1} emise${1} sazba${1} výnos${1} [základna])",
    	Disp:"Vypočte cenu pro nominální hodnotu 100 Kč cenného papíru s platbou úroků při splatnosti."
    },
    PRODUCT:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vynásobí všechna čísla zadaná jako argumenty a vrátí výsledek."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Převede textový řetězec na řetězec, v němž všechna slova začínají velkým písmenem a ostatní písmena jsou malá."
    },
    PV:{
    	Syntax:"${0}(úroková_sazba${1} celkový_počet_plateb${1} platba${1} [budoucí_hodnota]${1} [typ])",
    	Disp:"Vypočte současnou hodnotu investice na základě řady budoucích plateb."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(čitatel${1} jmenovatel)",
        Disp:"Vrátí výsledek dělení čísla jiným číslem zaokrouhlený na celé číslo."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Vrátí náhodné číslo v rozsahu 0 až 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(minimum${1} maximum)",
    	Disp: "Vrátí náhodné celé číslo v zadaném intervalu."
    },
    RANK:{    
    	Syntax:"${0}(číslo${1} odkaz${1} [pořadí])",
    	Disp: "Vrátí pořadí hodnoty v množině dat.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - sestupně",
          		 result : 0
          	 }, {
          		 label : "${0} - vzestupně",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(vypořádání${1} splatnost${1} investice${1} diskontní_sazba${1} [základna])",
    	Disp:"Vypočte částku získanou při splatnosti pro plně investovaný cenný papír."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} pozice${1} délka${1} nový text)",
    	Disp:"Nahradí část textu jiným řetězcem."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} počet)",
    	Disp:"Zopakuje řetězec tolikrát, kolikrát je zadáno v argumentu funkce."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [číslo])",
    	Disp:"Vrátí poslední znak nebo znaky textu."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [číslo])",
    	Disp:"Vrátí poslední znak nebo znaky textu."
    },
    ROUND:{   
    	Syntax: "${0}(číslo${1} počet)",
    	Disp:"Zaokrouhlí číslo na definovaný počet míst."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(číslo${1} počet)",
    	Disp:"Zaokrouhlí číslo dolů na definovaný počet míst."
    },
    ROUNDUP:{   
    	Syntax: "${0}(číslo${1} počet)",
    	Disp:"Zaokrouhlí číslo nahoru na definovaný počet míst."
    },
    ROW:{   
    	Syntax:"${0}([odkaz])",
    	Disp:"Vrátí interní číslo řádku zadaného odkazu."
    },
    ROWS:{   
    	Syntax:"${0}(pole)",
    	Disp:"Vrátí počet řádků v odkazovaném poli nebo oblasti."
    },
    RADIANS:{   
    	Syntax:"${0}(úhel)",
    	Disp:"Převede stupně na radiány."
    },
    ROMAN:{   
    	Syntax:"${0}(číslo${1} [formát])",
    	Disp:"Převede arabskou číslici na římskou ve formátu textu.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - klasické",
          		 result : 0
          	 }, {
          		 label : "${0} - stručnější",
          		 result : 1
          	 }, {
          		 label : "${0} - stručnější",
          		 result : 2
          	 }, {
          		 label : "${0} - stručnější",
          		 result : 3
          	 }, {
          		 label : "${0} - zjednodušené",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(hledaný text${1} text${1} [pozice])",
    	Disp:"Vyhledá výskyt jednoho textu uvnitř druhého (bez rozlišení velikosti písmen)."
    },  
    SIGN:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí algebraické znaménko čísla."
    },
    SIN:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí sinus daného úhlu."
    },
    SINH:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí hyperbolický sinus zadaného čísla."
    },
    SECOND:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Pro zadaný čas vrátí pořadové číslo sekundy v minutě jako celé číslo v rozsahu 0 až 59."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koeficienty)",
        Disp:"Vrátí součet mocninné řady podle vzorce."
    },
    SHEET:{   
    	Syntax:"${0}([odkaz])",
    	Disp:"Vrátí interní číslo listu pro zadaný odkaz nebo řetězec."
    },
    SMALL:{   
    	Syntax:"${0}(pole${1} ntá_pozice)",
    	Disp:"Vrátí n-tou nejnižší hodnotu z množiny hodnot."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} starý${1} nový${1} [který])",
    	Disp:"Vrátí text, v němž je starý text nahrazen novým textem."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkce${1} rozsah${1} ...)",
    	Disp:"Vypočítá mezisoučty v pracovním listu.",
    	Arguments: {
    		0 : [{
    			label : "${0} - PRŮMĚR",
    			result : 1
    		}, {
    			label : "${0} - POČET",
    			result: 2
    		}, {
    			label : "${0} - POČET_A",
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
    			label : "${0} - SOUČIN",
    			result: 6
    		}
    		, {
    			label : "${0} - SM_ODCH",
    			result: 7
    		}
    		, {
    			label : "${0} - SM_ODCH_P",
    			result: 8
    		}
    		, {
    			label : "${0} - SOUČET",
    			result: 9
    		}
    		, {
    			label : "${0} - ROZPTYL",
    			result: 10
    		}, {
    			label : "${0} - ROZPTYL_P",
    			result: 11
    		}, {
    			label : "${0} - PRŮMĚR",
    			result: 101
    		}, {
    			label : "${0} - POČET",
    			result: 102
    		}, {
    			label : "${0} - POČET_A",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - SOUČIN",
    			result: 106
    		}, {
    			label : "${0} - SM_ODCH",
    			result: 107
    		}, {
    			label : "${0} - SM_ODCH_P",
    			result: 108
    		}, {
    			label : "${0} - SOUČET",
    			result: 109
    		}, {
    			label : "${0} - ROZPTYL",
    			result: 110
    		}, {
    			label : "${0} - ROZPTYL_P",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí součet všech argumentů."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí součet součinů maticových argumentů."
    },
    SUMIF:{   
    	Syntax:"${0}(rozsah${1} kritéria${1} [oblast součtu])",
    	Disp:"Sečte argumenty, které vyhovují podmínkám."
    },
    SUMIFS:{
    	Syntax: "${0}(oblast_součtu${1} oblast_kritérií_1${1} kritérium_1${1} ...)",
    	Disp:"Sečte argumenty, které vyhovují několika podmínkám."
    },
    SQRT:{   
    	Syntax:"${0}(číslo)",
    	Disp:"Vrátí druhou odmocninu čísla."
    },
    SQRTPI:{   
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí druhou odmocninu hodnoty (číslo * pí)."
    },
    STDEV:
    {
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vrátí směrodatnou odchylku výběru."
    },
    STDEVP:
    {
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
    	Disp:"Vypočte směrodatnou odchylku celého souboru."
    },
    SUMSQ:{
    	Syntax:"${0}(číslo 1${1} [číslo 2]${1} ...)",
        Disp:"Vrátí součet druhých mocnin čísel v seznamu."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Převede argumenty na text."
    },
    TAN:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí tangens zadaného čísla."
    },
    TANH:{    
    	Syntax:"${0}(číslo)",
        Disp:"Vrátí hyperbolický tangens zadaného čísla."
    },
    TBILLPRICE:{
    	Syntax:"${0}(vypořádání${1} splatnost${1} diskontní_sazba)",
    	Disp:"Vypočte cenu pro nominální hodnotu 100 Kč krátkodobé státní obligace."
    },
    TEXT:{
    	Syntax:"${0}(hodnota${1} kód_formátu)",
    	Disp:"Převede hodnotu na text podle pravidel určených kódem formátu čísla a vrátí výsledek."
    },
    TIME:{   
    	Syntax:"${0}(hodina${1} minuta${1} sekunda)",
    	Disp:"Vrátí číselné vyjádření času na základě zadaných hodnot hodiny, minuty a sekundy."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Vrátí interní číslo pro text, který má potenciálně formát času."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Vrátí aktuální datum počítače."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Odebere všechny mezery na začátku a na konci textu. Všechny výskyty dvou a více mezer uvnitř textu jsou nahrazeny jednou mezerou."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Vrátí logickou hodnotu TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(číslo${1} [počet])",
    	Disp:"Odřízne desetinná místa zadaného čísla."
    },
    TYPE:{   
    	Syntax:"${0}(hodnota)",
    	Disp:"Určí datový typ hodnoty."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Převede text na velká písmena."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Převede textový argument na číslo."
    },
    VAR:{    
    	Syntax: "${0}(číslo 1${1} [číslo 2]${1}...)",
    	Disp:"Vypočte rozptyl výběru."
    },
    VARA:{    
    	Syntax: "${0}(číslo 1${1} [číslo 2]${1}...)",
    	Disp:"Vypočte rozptyl výběru, včetně čísel, textu a logických hodnot."
    },
    VARP:{    
    	Syntax: "${0}(číslo 1${1} [číslo 2]${1}...)",
    	Disp:"Zjistí rozptyl základního souboru."
    },
    VARPA:{    
    	Syntax: "${0}(číslo 1${1} [číslo 2]${1}...)",
    	Disp:"Vypočte rozptyl základního souboru, včetně čísel, textu a logických hodnot."
    },
    VLOOKUP:{    
    	Syntax: "${0}(vyhledávací_kritérium${1} pole${1} index${1} [pořadí řazení])",
    	Disp:"Vyhledá zadanou hodnotu v levém sloupci oblasti a vrátí hodnotu ležící ve stejném řádku, ale vzdálenou o určený počet sloupců.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - přibližná shoda",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - přesná shoda",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(číslo${1} [typ])",
    	Disp:"Vrátí celé číslo, které určuje den v týdnu pro zadané datum.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - čísla 1 (neděle) až 7 (sobota)",
          		 result : 1
          	 }, {
          		 label : "${0} - čísla 1 (pondělí) až 7 (neděle)",
          		 result : 2
          	 }, {
          		 label : "${0} - čísla 0 (pondělí) až 6 (neděle)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - čísla 1 (pondělí) až 7 (neděle)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - čísla 1 (úterý) až 7 (pondělí)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - čísla 1 (středa) až 7 (úterý)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - čísla 1 (čtvrtek) až 7 (středa)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - čísla 1 (pátek) až 7 (čtvrtek)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - čísla 1 (sobota) až 7 (pátek)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - čísla 1 (neděle) až 7 (sobota)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(číslo${1} [režim])",
    	Disp:"Vrátí číslo kalendářního týdne pro zadané datum.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - neděle",
          		 result : 1
          	 }, {
          		 label : "${0} - pondělí",
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
    	Syntax:"${0}(počáteční_datum${1} dny${1} [svátky])",
    	Disp:"Vrátí pořadové číslo data před zadaným počtem pracovních dní nebo po něm."
    },
    XNPV:{   
    	Syntax:"${0}(úroková_sazba${1} hodnoty${1} data)",
    	Disp:"Vypočte čistou současnou hodnotu pro plán cash flow."
    },
    YEAR:{    
    	Syntax:"${0}(číslo)",
    	Disp:"Pro zadanou hodnotu data vrátí celé číslo reprezentující rok."
    }
}
})

