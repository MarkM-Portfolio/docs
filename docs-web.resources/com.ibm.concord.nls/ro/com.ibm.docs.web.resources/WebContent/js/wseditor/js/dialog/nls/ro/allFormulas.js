/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Toate formulele",
	LABEL_FORMULA_LIST: "Listă de formule:",
	formula:{
	ABS:{	
	    Syntax:"${0}(număr)",
	    Disp:"Returnează valoarea absolută a unui număr."
    },
    ACOS:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează arc cosinusul unui număr. Unghiul este returnat în radiani."
    },
    ACOSH:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează cosinusul hiperbolic invers al unui număr."
    },
    ACOT:{    
    	Syntax:"${0}(număr)",
        Disp:"Returnează cotangenta inversă a unui număr. Unghiul este măsurat în radiani."
    },
    ACOTH:{    
    	Syntax:"${0}(număr)",
        Disp:"Returnează cotangenta hiperbolică inversă a unui număr."
    },
    ADDRESS:{
         Syntax:"${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"Returnează referinţa la o celulă ca text.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolut",
        		 result : 1
        	 }, {
        		 label : "${0} - Rând absolut / Coloană relativă",
        		 result : 2
        	 }, {
        		 label : "${0} - Rând relativ / Coloană absolută",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativ",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - Stil R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - Stil A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Returnează TRUE dacă toate argumentele sunt TRUE."
    },
    ASIN:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează arc sinusul unui număr. Unghiul este returnat în radiani."
    },
    ASINH:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează sinusul hiperbolic invers al unui număr."
    },
    ATAN:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează arc tangenta unui număr. Unghiul este returnat în radiani."
    },
    AVERAGE:{    
    	Syntax:"${0}(număr 1${1} [număr 2]${1} ...)",
    	Disp:"Returnează media argumentelor."
    },
    AVERAGEA:{    
    	Syntax:"${0}(număr 1${1} [număr 2]${1} ...)",
    	Disp:"Returnează valoare medie pentru un eşantion. Textul este evaluat la zero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(range${1} criteria${1} [average_range])",
    	Disp:"Returnează media (media aritmetică) argumentelor care îndeplinesc condiţia dată."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(average_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Returnează media (media aritmetică) argumentelor care îndeplinesc mai multe condiţii."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Returnează arctangenta, sau tangenta inversă, a coordonatelor pe x şi pe y specificate. Arctangenta este unghiul dintre axa x la o linie care conţine originea (0, 0) şi un punct cu coordonatele (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează tangenta hiperbolică inversă a unui număr. Numărul trebuie să fie între -1 şi 1 (excluzând -1 şi 1)."
    },
    BASE:{    
    	Syntax:"${0}(număr${1} radix${1} [minimum length])",
    	Disp:"Converteşte un întreg pozitiv la text de la un sistem numeric la baza definită."
    },
    BIN2DEC:{
    	Syntax:"${0}(număr)",
    	Disp:"Converteşte un număr binar într-un număr zecimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr binar într-un număr hexazecimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr binar într-un număr în baza opt."
    },
    CEILING:{  
    	Syntax: "${0}(număr${1} increment)",
    	Disp:"Rotunjeşte un număr la cel mai apropiat întreg sau multiplu de semnificaţie."
    },
    CHAR: {
    	Syntax: "${0}(număr)",
    	Disp: "Returnează un caracter mapat de număr. Găseşte caracterul în mapare caracter Unicode. Numărul este între 1 şi 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} value1${1} [value2]${1} ...)",
    	Disp: "Găseşte şi returnează valoarea corespunzătoare în funcţie de index. Poate ALEGE din până la 30 de valori."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Returnează un cod numeric pentru primul caracter dintr-un şir text care este codat în Unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"Returnează numărul de coloană intern al unei referinţe."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrice)",
    	Disp:"Returnează numărul de coloane dintr-o matrice sau referinţă."
    },
    COMBIN:{
    	Syntax:"${0}(număr${1} număr_ales)",
    	Disp:"Returnează numărul de combinaţii pentru un număr dat de articole. Utilizaţi ${0} pentru a determina numărul posibil total de grupuri pentru un număr dat de articole."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Combină mai multe şiruri text într-un singur şir."
    },
    CONVERT:{
    	Syntax:"${0}(număr ${1} unitate_sursă ${1} unitate_ţintă)",
    	Disp:"Converteşte un număr de la un sistem de măsură la altul.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Masă în livre (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unitate atomică de masă)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Masă în uncii (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metru",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Milă englezească",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Inch",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Picior",
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
       		 label : "${0} - An",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Zi",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Oră",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minut",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Secundă",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmoferă",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milimetri coloană de mercur (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dynă",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Forţă în livre",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Calorie termodinamică",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Cal putere-oră",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-oră",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Picior-livră",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Calorie termodinamică",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Cal putere",
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
       		 label : "${0} - Linguriţă",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Lingură",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Uncie fluidă",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Ceaşcă",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Pintă americană",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Pintă englezească",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Sfert de galon",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litru",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează cosinusul unghiului dat."
    },
    COSH:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează cosinusul hiperbolic al unui număr."
    },
    COT:{    
    	Syntax:"${0}(număr)",
        Disp:"Returnează cotangenta numărului dat."
    },
    COTH:{    
    	Syntax:"${0}(număr)",
        Disp:"Returnează cotangenta hiperbolică a numărului dat."
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Numără câte numere sunt în lista de argumente. Intrările text sunt ignorate."
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Numără câte valori sunt în lista de argumente."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(range)",
    	Disp: "Numără celulele goale dintr-un interval specificat."
    },
    COUNTIF:{
    	Syntax: "${0}(range${1} criteria)",
    	Disp:"Numără celulele care îndeplinesc condiţia dată."
    },
    COUNTIFS:{
    	Syntax: "${0}(criteria_range1${1} criteria1${1} ...)",
    	Disp:"Numără celulele care îndeplinesc mai multe condiţii."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"Calculează dobânda cumulativă plătită între două perioade specificate."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"Calculează plata principală cumulativă a unui împrumut, între două perioade specificate."
    }, 
    DATE:{	
	    Syntax:"${0}(year${1} month${1} day)",
	    Disp:"Furnizează un număr intern pentru data dată."
    },  
    DATEDIF:{	
	    Syntax:"${0}(start_date${1} end_date${1} format)",
	    Disp:"Returnează diferenţa în ani, luni sau zile dintre două date.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Numărul de ani întregi din perioadă.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Numărul de luni întregi din perioadă.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Numărul de zile întregi din perioadă.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Numărul de zile între start_date şi end_date, ignorând lunile şi anii.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Numărul de luni între start_date şi end_date, ignorând anii.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Numărul de zile între start_date şi end_date, ignorând anii.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Returnează un număr intern pentru un text care are un format de dată posibil."
    }, 
    DAY:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează ziua valorii datei date. Ziua este returnată ca un întreg între 1 şi 31. Puteţi introduce de asemenea o valoare dată/oră negativă."
    },
    DAYS360:{
    	Syntax:"${0}(start_date${1} end_date${1} [method])",
    	Disp:"Calculează numărul de zile dintre două date bazat pe an cu 360 de zile.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - metoda americană (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Metoda europeană",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(start_date${1} end_date${1})",
    	Disp:"Calculează numărul de zile dintre două date."
    },
    DEC2BIN:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr zecimal într-un număr binar."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr zecimal într-un număr hexazecimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr zecimal într-un număr în baza opt."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"Converteşte radiani în grade."
    },
    DISC:{
    	Syntax:"${0}(settlement${1} maturity${1} pr${1} redemption${1} [basis])",
    	Disp:"Calculează rata de reducere pentru o hârtie de valoare."
    }, 
    DOLLAR:{
    	Syntax:"${0}(număr${1} [decimals])",
    	Disp:"Converteşte un număr la text, utilizând formatul de monedă $ (dolar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} luni)",
    	Disp:"Returnează un număr serial ce reprezintă data indicată de numărul de luni înainte sau după start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} luni)",
    	Disp:"Returnează un număr serial pentru ultima zi a lunii indicate de numărul de luni înainte sau după start_date"
    },
    ERFC:{   
    	Syntax:"${0}(număr)",
        Disp:"Returnează funcţia de eroare complementară, integrată între un număr şi infinit."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"Returnează un număr corespunzător unui tip de eroare."
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
    	Disp:"Returnează un număr rotunjit la cel mai apropiat întreg par."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Compară două şiruri text şi returnează TRUE dacă sunt identice. Această funcţie este sensibilă la majuscule."
    },
    EXP:{    
    	Syntax:"${0}(number)",
    	Disp: "Returnează o mărire a numărului dat."
    },
    FACT:{  
    	Syntax:"${0}(number)",
    	Disp:"Calculează factorialul unui număr."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(number)",
        Disp:"Returnează semifactorialul (dublu factorial) unui număr."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Returnează valoarea logică ca FALSE."
    },
    FIND:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Caută un şir de text în altul (sensibil la majuscule)."
    },
    FIXED:{
    	Syntax:"${0}(număr${1} [decimals]${1} [no_commas])",
    	Disp:"Formatează un număr ca text cu un număr fix de zecimale.",
    	Arguments: {
    		2 : [{
    			label : "${0} - împiedicare virgule",
    			result : "TRUE"
    		}, {
    			label : "${0} - neîmpiedicare virgule",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(număr${1} significance)",
    	Disp:"Rotunjeşte un număr prin lipsă la cel mai apropiat multiplu de semnificaţie."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"Returnează formula unei celule de formule."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Clasifică valorile în intervale şi numără numărul de valori din fiecare interval."
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"Calculează valoarea viitoare a unei investiţii bazată pe o rată constantă a dobânzii."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} schedule)",
        Disp:"Calculează valoarea viitoare a plăţii principale iniţiale, după aplicarea unei serii de rate de dobândă compuse."
    },
    GAMMALN:{   
    	Syntax:"${0}(number)",
        Disp:"Returnează logaritmul natural al funcţiei gamma."
    },
    GCD:{   
    	Syntax:"${0}(număr1${1} [număr 2]${1} ...)",
        Disp:"Returnează cel mai mare divizor comun al tuturor argumentelor."
    },
    HEX2BIN:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr hexazecimal într-un număr binar."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(număr)",
    	Disp:"Converteşte un număr hexazecimal într-un număr zecimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr hexazecimal într-un număr în baza opt."
    },
    HOUR:{   
    	Syntax:"${0}(number)",
    	Disp:"Determină numărul secvenţial al orei zilei (0-23) pentru valoarea orei."
    },
    HLOOKUP:{   
    	Syntax:"${0}(criterii_căutare${1} matrice${1} Index${1} [sorted])",
    	Disp:"Căutare orizontală şi referinţă la celulele localizate mai jos.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Aproximare potrivire",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Potrivire exactă",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [cell_text])",
    	Disp:"Returnează o legătură care indică la o resursă de reţea sau la un interval referit de către legătură. Afişează cell_text (opţional) dacă este furnizat; altfel, afişează legătura ca text."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_value]${1} [otherwise_value])",
    	Disp:"Specifică un test logic care să fie realizat."
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)",
    	Disp:"Rulează teste logice pentru a verifica dacă una sau mai multe condiţii sunt îndeplinite şi returnează valoarea care se potriveşte cu prima condiţie TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(value${1} value_if_error)",
    	Disp:"Returnează valoarea pe care o specificaţi dacă expresia este o eroare. Altfel, returnează rezultatul expresiei."
    },
    IFNA:{
    	Syntax:"${0}(value${1} value_if_na)",
    	Disp:"Returnează valoarea pe care o specificaţi dacă expresia returnează valoarea de eroare #N/A. Altfel, returnează rezultatul expresiei."
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} row${1} [column]${1} [range])",
    	Disp:"Returnează o referinţă la o celulă dintr-un interval definit."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"Returnează cuprinsul unei celule care este referită în formularul text.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - Stil R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - Stil A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(number)",
    	Disp:"Rotunjeşte un număr prin lipsă la cel mai apropiat întreg."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Calculează suma de rambursare a dobânzii pentru o perioadă pentru o investiţie bazată pe plăţi regulate şi o rată de dobândă fixă."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă celula referită este goală, altfel returnează FALSE."
    },
    ISERR:{
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoare este o valoare de eroare neegală cu #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este o valoare de eroare."
    },
    ISEVEN:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este pară, altfel returnează FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"Returnează TRUE dacă celula este o celulă de formule."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea poartă un număr logic."
    },
    ISNA:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este egală cu #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnează true dacă valoarea nu este text."
    },
    ISNUMBER:{   
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este un număr."
    },
    ISODD:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este un întreg impar."
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"Calculează dobânda plătită în timpul unei perioade specificate a investiţiei."
    }, 
    ISREF:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este o referinţă."
    },
    ISTEXT:{    
    	Syntax:"${0}(value)",
    	Disp:"Returnează TRUE dacă valoarea este text."
    },
    LARGE:{
        Syntax:"${0}(matrice${1} n-a_poziţie)",
    	Disp:"Returnează a n-a cea mai mare valoare dintr-un set de valori."
    },
    LCM:{   
    	Syntax:"${0}(număr1${1} [număr 2]${1} ...)",
        Disp:"Returnează cel mai mic multiplu comun al tuturor numerelor din listă."
    },
    LEFT:{
        Syntax:"${0}(text${1} [lungime])",
    	Disp:"Returnează numărul specificat de caractere de la începutul unui text."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Returnează lungimea unui şir text."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Returnează numărul de biţi al unui şir text."
    },
    LN:{
    	Syntax:"${0}(număr)",
    	Disp:"Returnează logaritmul natural al unui număr."
    },
    LOG:{
    	Syntax:"${0}(număr${1} [base])",
    	Disp:"Returnează logaritmul unui număr într-o bază specificată."
    },
    LOG10:{
    	Syntax:"${0}(number)",
    	Disp:"Returnează logaritmul în baza 10 al unui număr."
    },
    LOOKUP:{
    	Syntax: "${0}(search criterion${1} search vector${1} [result_vector])",
    	Disp:"Determină o valoare dintr-un vector prin compararea cu valori din alt vector."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converteşte textul la litere mici."
    },    
    MATCH:{    
    	Syntax: "${0}(criterii_căutare${1} matrice_căutare${1} [tip])",
    	Disp:"Defineşte o poziţie dintr-o matrice după comparare valori.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Mai mic decât",
         		 result : 1
         	 }, {
         		 label : "${0} - Potrivire exactă",
         		 result : 0
         	 }, {
         		 label : "${0} - Mai mare decât",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnează valoare maximă dintr-o listă de argumente."
    },
    MEDIAN:{    
    	Syntax:"${0}(număr 1${1} [număr 2]${1} ...)",
    	Disp:"Returnează valoarea din mijloc, dacă este dat un număr impar de valori. Altfel, returnează media aritmetică a celor două valori din mijloc."
    },
    MID:{    
    	Syntax:"${0}(text${1} număr${1} număr)",
    	Disp:"Returnează un şir text parţial al unui text."
    }, 
    MIN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnează valoarea minimă dintr-o listă de argumente."
    },    
    MINUTE:{    
    	Syntax:"${0}(number)",
    	Disp:"Determină numărul secvenţial pentru minutul orei (0-59) pentru valaorea oră."
    },    
    MOD:{    
    	Syntax:"${0}(număr_divizat${1} divizor)",
    	Disp:"Returnează restul când numărul divizat este împărţit la divizor."
    },
    MODE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returnează cea mai comună valoare dintr-un eşantion."
    },
    MONTH:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnează luna pentru valoarea datei date. Luna este returnată ca un întreg între 1 şi 12."
    },
    MROUND:{   
    	Syntax: "${0}(număr${1} multiplu)",
        Disp:"Returnează un număr rotunjit la un multiplu specificat."
    },
    MMULT:{    
    	Syntax:"${0}(matrice${1} matrice",
    	Disp:"Înmulţire matrici. Returnează produsul a două matrici."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(număr1${1} [număr 2]${1} ...)",
        Disp:"Returnează coeficientul multinomial al unui set de numere."
    },
    N:{    
    	Syntax:"${0}(value)",
    	Disp:"Converteşte o valoare la un număr."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Returnează valoarea erorii #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(start_date${1} end_date${1} [holidays])",
    	Disp:"Returnează numărul de zile lucrătoare dintre două date."
    },
    NOT:{    
    	Syntax:"${0}(logical value)",
    	Disp:"Inversează valoarea unui argument."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Determină ora curentă a computerului."
    },
    NPV:{   
    	Syntax:"${0}(rate${1} value 1${1} [value 2]${1} ...)",
        Disp:"Calculează valoarea netă prezentă a unei investiţii, bazat pe rata de reducere furnizată, şi o serie de plăţi şi venituri viitoare."
    },
    OCT2BIN:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr în baza opt într-un număr binar."
    },
    OCT2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Converteşte un număr în baza opt într-un număr zecimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(număr${1} [places])",
    	Disp:"Converteşte un număr în baza opt într-un număr hexazecimal."
    },
    ODD:{    
    	Syntax:"${0}(number)",
    	Disp:"Rotunjeşte un număr prin adaos la cel mai apropiat întreg impar, unde \"adaos\" înseamnă \"departe de 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rows${1} cols${1} [height]${1} [width])",
    	Disp:"Returnează o referinţă la un interval care este un număr specificat de rânduri şi coloane dintr-o celulă sau interval de celule."
    },
    OR:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Returnează TRUE dacă cel puţin un argumentt este TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Returnează valoarea aproximativă a lui Pi."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Returnează plata pentru un împrumut bazat pe plăţi regulate şi o rată fixă a dobânzii."
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)",
    	Disp:"Ridică un număr la puterea altuia."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Calculează suma de rambursare pentru o perioadă pentru o investiţie bazată pe plăţi regulate şi o rată de dobândă fixă."
    },
    PRICEDISC:{
    	Syntax:"${0}(settlement${1} maturity${1} discount${1} redemption${1} [basis])",
    	Disp:"Calculează preţul pe o valoare nominală de 100$ a unei hârtii de valoare reduse."
    },
    PRICEMAT:{
    	Syntax:"${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [basis])",
    	Disp:"Calculează preţul pe o valoare nominală de 100$ a unei hârtii de valoare care plăteşte dobânda la maturitate."
    },
    PRODUCT:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Înmulţeşte toate numerele date ca argumente şi returnează produsul."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converteşte un şir text la literele corespunzătoare, prima literă a fiecărui cuvânt la literă mare şi toate celelalte litere la litere mici."
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"Calculează valoarea prezentă a unei investiţii, bazat pe o serie de plăţi viitoare."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numărător${1} deîmpărţit)",
        Disp:"Returnează rezultatul unui număr divizat la alt număr, trunchiat la un întreg."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Returnează un număr aleatoriu între 0 şi 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)",
    	Disp: "Returnează un întreg aleatoriu între numerele pe care le specificaţi."
    },
    RANK:{    
    	Syntax:"${0}(număr${1} ref${1} [order])",
    	Disp: "Returnează clasificarea unei valori în eşantion.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Descrescător",
          		 result : 0
          	 }, {
          		 label : "${0} - Crescător",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])",
    	Disp:"Calculează suma primită la maturitate pentru o hârtie de valoare investită complet."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} position${1} length${1} new text)",
    	Disp:"Înlocuieşte caracterele dintr-un text cu un şir text diferit."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} count)",
    	Disp:"Repetă textul de un număr de ori dat."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [număr])",
    	Disp:"Returnează ultimul caracter sau caractere ale textului."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [număr])",
    	Disp:"Returnează ultimul caracter sau caractere ale textului."
    },
    ROUND:{   
    	Syntax: "${0}(număr${1} count)",
    	Disp:"Rotunjeşte un număr la o precizie predefinită."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(număr${1} count)",
    	Disp:"Rotunjeşte un număr prin lipsă la o precizie predefinită."
    },
    ROUNDUP:{   
    	Syntax: "${0}(număr${1} count)",
    	Disp:"Rotunjeşte un număr prin adaos la o precizie predefinită."
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"Defineşte numărul de rânduri intern al unei referinţe."
    },
    ROWS:{   
    	Syntax:"${0}(matrice)",
    	Disp:"Returnează numărul de rânduri dintr-o matrice sau referinţă."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"Converteşte grade în radiani."
    },
    ROMAN:{   
    	Syntax:"${0}(număr${1} [form])",
    	Disp:"Converteşte un numeral arab la roman, ca text.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Clasic",
          		 result : 0
          	 }, {
          		 label : "${0} - Mai concis",
          		 result : 1
          	 }, {
          		 label : "${0} - Mai concis",
          		 result : 2
          	 }, {
          		 label : "${0} - Mai concis",
          		 result : 3
          	 }, {
          		 label : "${0} - Simplificat",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Caută o valoare text în alta (nu este sensibilă la majuscule)."
    },  
    SIGN:{    
    	Syntax:"${0}(număr)",
        Disp:"Returnează semnul algebric al unui număr."
    },
    SIN:{    
    	Syntax:"${0}(număr)",
    	Disp:"Returnează sinusul unghiului dat."
    },
    SINH:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnează sinusul hiperbolic al unui număr."
    },
    SECOND:{    
    	Syntax:"${0}(number)",
    	Disp:"Determină numărul secvenţial pentru secunda minutului (0-59) pentru valoarea oră."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coeficienţi)",
        Disp:"Returnează suma seriei de puteri bazată pe formulă."
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"Returnează numărul de foaie internă al unei referinţe sau şir."
    },
    SMALL:{   
    	Syntax:"${0}(matrice${1} n-a_poziţie)",
    	Disp:"Returnează cea mai mică valoare nth dintr-un set de valori."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} vechi${1} nou${1} [which])",
    	Disp:"Returnează text unde un text vechi este înlocuit cu un text nou."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"Calculează subtotaluri dintr-o foaie de calcul.",
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
    	Syntax:"${0}(număr1${1} [număr 2]${1} ...)",
    	Disp:"Returnează suma tuturor argumentelor."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matrice 1${1} [matrice 2]${1} ...)",
    	Disp:"Returnează suma produselor argumentelor de matrice."
    },
    SUMIF:{   
    	Syntax:"${0}(range${1} criteria${1} [sum range])",
    	Disp:"Calculează totalul argumentelor care îndeplinesc condiţiile."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Totalizează argumentele care îndeplinesc mai multe condiţii."
    },
    SQRT:{   
    	Syntax:"${0}(number)",
    	Disp:"Returnează rădăcina pătrată a unui număr."
    },
    SQRTPI:{   
    	Syntax:"${0}(number)",
        Disp:"Returnează rădăcina pătrată din (număr * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(număr 1${1} [număr 2]${1} ...)",
    	Disp:"Calculează abaterea standard bazată pe un eşantion."
    },
    STDEVP:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Calculează abaterea standard bazată pe întreaga populaţie."
    },
    SUMSQ:{
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
        Disp:"Returnează suma pătratelor numerelor din listă."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Converteşte argumentele sale în text."
    },
    TAN:{    
    	Syntax:"${0}(number)",
        Disp:"Returnează tangenta numărului dat."
    },
    TANH:{    
    	Syntax:"${0}(number)",
        Disp:"Returnează tangenta hiperbolică a numărului dat."
    },
    TBILLPRICE:{
    	Syntax:"${0}(settlement${1} maturity${1} discount)",
    	Disp:"Calculează preţul pe o valoare nominală de 100$ a unui bon de tezaur."
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)",
    	Disp:"Converteşte valoarea la un text conform regulilor unui cod de format de număr şi o returnează."
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)",
    	Disp:"Determină o valoare timp din detaliile de oră, minut şi secundă."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Returnează un număr intern pentru un text care are un format de timp posibil."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determină data curentă a computerului."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Înlătură toate spaţiile. Orice altă secvenţă de 2 sau mai multe spaţii interioare este înlocuită cu un singur spaţiu."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Returnează valoarea logică TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(număr${1} [count])",
    	Disp:"Trunchiază poziţiile zecimale ale unui număr."
    },
    TYPE:{   
    	Syntax:"${0}(value)",
    	Disp:"Defineşte tipul de date al unei valori."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Converteşte textul la majuscule."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Converteşte un argument text la un număr."
    },
    VAR:{    
    	Syntax: "${0}(număr1${1} [număr2]${1}...)",
    	Disp:"Estimează variaţia bazată pe un eşantion."
    },
    VARA:{    
    	Syntax: "${0}(număr1${1} [număr2]${1}...)",
    	Disp:"Estimează variaţia bazată pe un eşantion, incluzând membri, text şi valori logice."
    },
    VARP:{    
    	Syntax: "${0}(număr1${1} [număr2]${1}...)",
    	Disp:"Calculează variaţia bazată pe întreaga populaţie."
    },
    VARPA:{    
    	Syntax: "${0}(număr1${1} [număr2]${1}...)",
    	Disp:"Estimează variaţia bazată pe întreaga populaţie, incluzând membri, text şi valori logice."
    },
    VLOOKUP:{    
    	Syntax: "${0}(criteriu_căutare${1} matrice${1} index${1} [ordine sortare])",
    	Disp:"Căutare verticală şi referinţă la celulele indicate.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Aproximare potrivire",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Potrivire exactă",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(număr${1} [tip])",
    	Disp:"Returnează ziua săptămânii pentru valoarea dată calendaristică ca un întreg.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Numere de la 1 (duminică) la 7 (sâmbătă)",
          		 result : 1
          	 }, {
          		 label : "${0} - Numere de la 1 (luni) la 7 (duminică)",
          		 result : 2
          	 }, {
          		 label : "${0} - Numere de la 0 (luni) la 6 (duminică)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Numere de la 1 (luni) la 7 (duminică)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Numere de la 1 (marţi) la 7 (luni)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Numere de la 1 (miercuri) la 7 (marţi)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Numere de la 1 (joi) la 7 (miercuri)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Numere de la 1 (vineri) la 7 (joi)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Numere de la 1 (sâmbătă) la 7 (vineri)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Numere de la 1 (duminică) la 7 (sâmbătă)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(număr${1} [mod])",
    	Disp:"Calculează săptămâna calendaristică corespunzătoare datei calendaristice date.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Duminică",
          		 result : 1
          	 }, {
          		 label : "${0} - Luni",
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
    	Disp:"Returnează numărul serial al datei înainte sau după un număr specificat de zile lucrătoare."
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} values${1} dates)",
    	Disp:"Calculează valoarea netă prezentă pentru o planificare de fluxuri de numerar."
    },
    YEAR:{    
    	Syntax:"${0}(number)",
    	Disp:"Returnează anul unei valori dată ca un întreg."
    }
}
})

