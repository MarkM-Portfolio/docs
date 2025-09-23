/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Tutte le formule",
	LABEL_FORMULA_LIST: "Elenco formule:",
	formula:{
	ABS:{	
	    Syntax:"${0}(numero)",
	    Disp:"Restituisce il valore assoluto di un numero."
    },
    ACOS:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituice l'arco coseno di un numero. L'angolo viene restituito in radianti."
    },
    ACOSH:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il coseno iperbolico inverso di un numero."
    },
    ACOT:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la cotangente inversa di un numero. L'angolo è misurato in radianti."
    },
    ACOTH:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la cotangente iperbolica inversa di un numero."
    },
    ADDRESS:{
         Syntax:"${0}(riga${1} colonna${1} [abs]${1} [a1]${1} [foglio])",
         Disp:"Restituisce il riferimento a una cella come testo.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Assoluto",
        		 result : 1
        	 }, {
        		 label : "${0} - Riga assoluta / Colonna relativa",
        		 result : 2
        	 }, {
        		 label : "${0} - Riga relativa / Colonna assoluta",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativo",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - Stile R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - Stile A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(valore logico 1${1} [valore logico 2]${1} ...)",
    	Disp:"Restituisce TRUE se il valore di tutti gli argomenti è TRUE."
    },
    ASIN:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituice l'arco seno di un numero. L'angolo viene restituito in radianti."
    },
    ASINH:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il seno iperbolico inverso di un numero."
    },
    ATAN:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituice l'arco tangente di un numero. L'angolo viene restituito in radianti."
    },
    AVERAGE:{    
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce la media degli argomenti."
    },
    AVERAGEA:{    
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce il valore di media per un campione. Il testo viene valutato zero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(intervallo${1} criteri${1} [intervallo_medio])",
    	Disp:"Torna alla media (media aritmetica) degli argomenti che soddisfano la condizione data."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(intervallo medio${1} intervallo_criteri1${1} criteri1${1} ...)",
    	Disp:"Torna alla media (media aritmetica) degli argomenti che soddisfano più condizioni."
    },
    ATAN2:{
    	Syntax:"${0}(num_x_${1} num_y)",
    	Disp:"Restituisce l'arcotangente o la tangente inversa delle coordinate x e y specificate. L'arcotangente è l'angolo dall'asse delle x a una linea contenente l'origine (0, 0) e un punto con le coordinate (num_x, num_y)."
    },
    ATANH:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce la tangente iperbolica inversa di un numero. Il numero deve essere compreso tra -1 e 1 (esclusi -1 e 1)."
    },
    BASE:{    
    	Syntax:"${0}(numero${1} radice${1} [lunghezza minima])",
    	Disp:"Converte un numero intero positivo in testo da un sistema numerico a una base definita."
    },
    BIN2DEC:{
    	Syntax:"${0}(numero)",
    	Disp:"Converte un numero binario in un numero decimale."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero binario in un numero esadecimale."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero binario in un numero ottale."
    },
    CEILING:{  
    	Syntax: "${0}(numero${1} incremento)",
    	Disp:"Arrotonda un numero all'intero o a un multiplo del valore più vicino."
    },
    CHAR: {
    	Syntax: "${0}(numero)",
    	Disp: "Restituisce il carattere associato al numero. Rileva il carattere nella mappa di caratteri Unicode. Il numero è compreso tra 1 e 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indice${1} valore1${1} [valore2]${1} ...)",
    	Disp: "Trova e restituisce il valore corrispondente in base all'indice. Può SCEGLIERE fino a 30 valori."
    },
    CODE:{
    	Syntax:"${0}(testo)",
    	Disp:"Restituisce un codice numerico per il primo carattere in una stringa di testo con codifica in unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([riferimento])",
    	Disp:"Restituisce il numero di colonna interno di un riferimento."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Restituisce il numero di colonne in un array o riferimento."
    },
    COMBIN:{
    	Syntax:"${0}(numero${1} numero_scelto)",
    	Disp:"Restituisce il numero di combinazioni per un numero di elementi fornito. Utilizzare ${0} per determinare il numero totale di gruppi possibili per un numero di elementi fornito."
    },
    CONCATENATE:{   
    	Syntax:"${0}(testo 1${1} ...)",
    	Disp:"Unisce diverse stringhe di testo in una sola stringa."
    },
    CONVERT:{
    	Syntax:"${0}(numero${1} da_unità${1} a_unità)",
    	Disp:"Converte un numero da un sistema di misura a un altro.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Grammo",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Libbra-massa (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unità di massa atomica)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Oncia-massa (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metro",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Miglio statuto",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Pollice",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Piede",
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
       		 label : "${0} - Anno",
       		 result : "\"anno\""
       	 }, {
       		 label : "${0} - Giorno",
       		 result : "\"giorno\""
       	 }, {
       		 label : "${0} - Ora",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minuto",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Secondo",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atomosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - millimetri di mercurio (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dina",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Libbra-forza",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Caloria IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elettronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Cavallo-vapore-ora",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Wattora",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Piede-libbra",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Caloria termodinamica",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Cavallo vapore",
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
       		 label : "${0} - Grado Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Grado Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Teaspoon",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Tablespoon",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Oncia fluida",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Cup",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Pinta U.S.",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Pinta inglese",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quarto",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallone",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litro",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il coseno dell'angolo fornito."
    },
    COSH:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il coseno iperbolico di un numero."
    },
    COT:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la cotangente del numero fornito."
    },
    COTH:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la cotangente iperbolica del numero fornito."
    },
    COUNT:{   
    	Syntax:"${0}(valore1${1} [valore2]${1} ...)",
    	Disp:"Conta i numeri presenti nell'elenco degli argomenti. Le voci contenenti testo vengono ignorate."
    },
    COUNTA:{   
    	Syntax:"${0}(valore1${1} [valore2]${1} ...)",
    	Disp:"Conta il numero di valori presenti nell'elenco degli argomenti."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(intervallo)",
    	Disp: "Conta il numero di celle vuote in un intervallo specificato."
    },
    COUNTIF:{
    	Syntax: "${0}(intervallo${1} criteri)",
    	Disp:"Conta il numero di celle che soddisfano la condizione data."
    },
    COUNTIFS:{
    	Syntax: "${0}(intervallo_criteri1${1} criteri1${1} ...)",
    	Disp:"Conta il numero di celle che soddisfano più condizioni."
    },
    CUMIPMT:{	
	    Syntax:"${0}(tasso${1} nper${1} pv${1} periodo_inizio${1} periodo_fine${1} tipo)",
	    Disp:"Calcola l'interesse cumulativo pagato tra due periodi specificati."
    },
    CUMPRINC:{	
	    Syntax:"${0}(tasso${1} nper${1} pv${1} periodo_inizio${1} periodo_fine${1} tipo)",
	    Disp:"Calcola il capitale cumulativo pagato su un prestito, tra due periodi specificati."
    }, 
    DATE:{	
	    Syntax:"${0}(anno${1} mese${1} giorno)",
	    Disp:"Fornisce un numero interno per la data fornita."
    },  
    DATEDIF:{	
	    Syntax:"${0}(data di inizio${1} data di fine${1} formato)",
	    Disp:"Restituisce la differenza in anni, mesi o giorni tra due date.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Il numero di anni completi nel periodo.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Il numero di mesi completi nel periodo.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Il numero di giorni nel periodo.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Numero di giorni tra la data_inizio e la data_ fine, ignorando i mesi e gli anni.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Numero di mesi tra la data_inizio e la data_fine, ignorando gli anni.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Numero di giorni tra la data_inizio e la data_fine, ignorando gli anni.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(testo)",
	    Disp:"Restituisce un numero interno per un testo con un possibile formato data."
    }, 
    DAY:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il giorno di un valore data fornito. Il giorno è restituito come numero intero compreso tra 1 e 31. È possibile anche immettere un valore data/ora negativo."
    },
    DAYS360:{
    	Syntax:"${0}(data_inizio${1} data_fine${1} [metodo])",
    	Disp:"Calcola il numero di giorni tra due date in base a un anno di 360 giorni.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Metodo U.S. (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Metodo europeo",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(data_inizio${1} data_fine${1})",
    	Disp:"Calcola il numero di giorni tra due date."
    },
    DEC2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero decimale in un numero binario."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero decimale in un numero esadecimale."
    },
    DEC2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero decimale in un numero ottale."
    },
    DEGREES:{	
	    Syntax:"${0}(angolo)",
	    Disp:"Converte i radianti in gradi."
    },
    DISC:{
    	Syntax:"${0}(saldo${1} data_maturazione${1} pr${1} riscatto${1} [base])",
    	Disp:"Calcola il tasso di sconto per un titolo."
    }, 
    DOLLAR:{
    	Syntax:"${0}(numero${1} [decimali])",
    	Disp:"Converte un numero in testo, utilizzando il formato della valuta $ (dollaro)."
    },
    EDATE:{
    	Syntax:"${0}(data_di_inizio${1} mesi)",
    	Disp:"Ritorna al numero di serie che rappresenta la data relativa al numero indicato di mesi prima o dopo la data_di_inizio "
    },
    EOMONTH:{
    	Syntax:"${0}(data_di_inizio${1} mesi)",
    	Disp:"Ritorna al numero di serie per l'ultimo giorno del mese che rappresenta il numero indicato di mesi prima o dopo la data_di_inizio "
    },
    ERFC:{   
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la funzione di errore complementare, integrata tra un numero e l'infinito."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(riferimento)",
    	Disp:"Restituisce un numero corrispondente ad un tipo di errore."
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
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce un numero arrotondato al numero intero pari più vicino."
    },
    EXACT:{    
    	Syntax:"${0}(testo 1${1} testo 2)",
    	Disp: "Confronta due stringhe di testo e restituisce TRUE se sono identiche. Questa funzione è sensibile al maiuscolo/minuscolo."
    },
    EXP:{    
    	Syntax:"${0}(numero)",
    	Disp: "Restituisce e elevato al numero fornito."
    },
    FACT:{  
    	Syntax:"${0}(numero)",
    	Disp:"Calcola il fattoriale di un numero."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(numero)",
        Disp:"Restituisce il doppio fattoriale di un numero."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Restituisce il valore logico FALSE."
    },
    FIND:{   
    	Syntax:"${0}(trova testo${1} testo${1} [posizione])",
    	Disp:"Cerca una stringa di testo all'interno di un'altra (sensibile al maiuscolo/minuscolo)."
    },
    FIXED:{
    	Syntax:"${0}(numero${1} [decimali]${1} [senza_virgole])",
    	Disp:"Formatta un numero come testo con un numero di decimali fisso.",
    	Arguments: {
    		2 : [{
    			label : "${0} - impedisci virgole",
    			result : "TRUE"
    		}, {
    			label : "${0} - non impedire virgole",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(numero${1} valore)",
    	Disp:"Arrotonda un numero per difetto al multiplo più vicino."
    },
    FORMULA:{   
    	Syntax:"${0}(riferimento)",
    	Disp:"Restituisce la formula di una cella di formula."
    },
    FREQUENCY:{   
    	Syntax:"${0}(ElencoSequenzaNumeri_dati${1} ElencoSequenzaNumeri_bin)",
    	Disp:"Classifica i valori in intervalli e conta il numero di valori in ciascun intervallo."
    },
    FV:{
    	Syntax:"${0}(tasso${1} nper${1} pmt${1} [pv]${1} [tipo])",
    	Disp:"Calcola il valore futuro di un investimento sulla base di un tasso di interesse costante."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(capitale${1} programma)",
        Disp:"Calcola il valore futuro di un capitale iniziale, dopo l'applicazione di una serie di tassi di interesse composti."
    },
    GAMMALN:{   
    	Syntax:"${0}(numero)",
        Disp:"Restituisce il logaritmo naturale della funzione gamma."
    },
    GCD:{   
    	Syntax:"${0}(numero1${1} [numero 2]${1} ...)",
        Disp:"Restituisce il massimo comun divisore di tutti gli argomenti."
    },
    HEX2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero esadecimale in un numero binario."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(numero)",
    	Disp:"Converte un numero esadecimale in un numero decimale."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero esadecimale in un numero ottale."
    },
    HOUR:{   
    	Syntax:"${0}(numero)",
    	Disp:"Determina il numero sequenziale dell'ora del giorno (0-23) per il valore orario."
    },
    HLOOKUP:{   
    	Syntax:"${0}(criteri_ricerca${1} array${1} Indice${1} [con ordinamento])",
    	Disp:"Ricerca orizzontale e riferimento alle celle sottostanti.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Corrispondenza approssimata",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Corrispondenza esatta",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [testo_cella])",
    	Disp:"Restituisce un collegamento che punta ad una risorsa di rete o ad un intevallo a cui fa riferimento il collegamento. Visualizza  testo_cella (facoltativo) se fornito, altrimenti visualizza il collegamento come testo."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [se_vero]${1} [se_falso])",
    	Disp:"Specifica un test logico da eseguire."
    },
    IFS:{
    	Syntax:"${0}(test1${1} valore_se_true1${1} ...)",
    	Disp:"Esegue test logici per verificare se una o più condizioni sono soddisfatte e restituisce un valore che corrisponde alla prima condizione TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(valore${1} valore se errore)",
    	Disp:"Restituisce il valore che si specifica se l'espressione è un errore. Altrimenti restituisce il risultato dell'espressione."
    },
    IFNA:{
    	Syntax:"${0}(valore${1} valore_se_na)",
    	Disp:"Restituisce il valore che si specifica se l'espressione restituisce il valore di errore #N/A. Altrimenti restituisce il risultato dell'espressione."
    },
    INDEX:{    
    	Syntax:"${0}(riferimento${1} riga${1} [colonna]${1} [intervallo])",
    	Disp:"Restituisce il riferimento a una cella da un intervallo definito."
    },
    INDIRECT:{    
    	Syntax:"${0}(rif${1} [stile_rif])",
    	Disp:"Restituisce il contenuto di una cella che ha un riferimento in formato testo.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - Stile R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - Stile A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(numero)",
    	Disp:"Arrotonda un numero per difetto al numero intero più vicino."
    },
    IPMT:{
    	Syntax:"${0}(tasso${1} per${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Calcola l'importo del rimborso degli interessi per un periodo per un investimento basato su pagamenti regolari e un tasso di interesse fisso."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se la cella di riferimento è vuota, altrimenti restituisce FALSE."
    },
    ISERR:{
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è un valore di errore diverso da #N/D."
    },
    ISERROR:{
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è un valore di errore."
    },
    ISEVEN:{    
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è pari, altrimenti restituisce FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(riferimento)",
    	Disp:"Restituisce TRUE se la cella è una cella di formula."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore ha un formato numerico logico."
    },
    ISNA:{    
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è uguale a #N/D."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce true se il valore non è un testo."
    },
    ISNUMBER:{   
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è un numero."
    },
    ISODD:{    
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è un numero dispari."
    },
    ISPMT:{
    	Syntax:"${0}(tasso${1} per${1} nper${1} pv)",
    	Disp:"Calcola l'interesse pagato durante un periodo specificato per un investimento."
    }, 
    ISREF:{    
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è un riferimento."
    },
    ISTEXT:{    
    	Syntax:"${0}(valore)",
    	Disp:"Restituisce TRUE se il valore è un testo."
    },
    LARGE:{
        Syntax:"${0}(array${1} posizione_nth)",
    	Disp:"Restituisce il maggior valore nth di una serie di valori."
    },
    LCM:{   
    	Syntax:"${0}(numero1${1} [numero 2]${1} ...)",
        Disp:"Restituisce il minimo comune multiplo di tutti i numeri nell'elenco."
    },
    LEFT:{
        Syntax:"${0}(testo${1} [lunghezza])",
    	Disp:"Restituisce il numero specificato di caratteri dall'inizio di un testo."
    },
    LEN:{
    	Syntax:"${0}(testo)",
    	Disp:"Restituisce la lunghezza di una stringa di testo."
    },
    LENB:{
    	Syntax:"${0}(testo)",
    	Disp:"Restituisce il numero di byte di una stringa di testo."
    },
    LN:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il logaritmo naturale di un numero."
    },
    LOG:{
    	Syntax:"${0}(numero${1} [base])",
    	Disp:"Restituisce il logaritmo di un numero in una base specificata."
    },
    LOG10:{
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il logaritmo a base 10 di un numero."
    },
    LOOKUP:{
    	Syntax: "${0}(criterio di ricerca${1} vettore di ricerca${1} [vettore_risultato])",
    	Disp:"Determina un valore in un vettore in confronto ai valori contenuti in un altro vettore."
    },
    LOWER:{    
    	Syntax:"${0}(testo)",
    	Disp:"Converte il testo in minuscolo."
    },    
    MATCH:{    
    	Syntax: "${0}(criterio di ricerca${1} array_ricerca${1} [tipo])",
    	Disp:"Definisce una posizione in un array dopo aver confrontato i valori.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Minore di",
         		 result : 1
         	 }, {
         		 label : "${0} - Corrispondenza esatta",
         		 result : 0
         	 }, {
         		 label : "${0} - Maggiore di",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce il valore massimo di un elenco di argomenti."
    },
    MEDIAN:{    
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce il valore medio, se viene dato un numero dispari di valori. Altrimenti, restituisce la media aritmetica dei due  valori medi."
    },
    MID:{    
    	Syntax:"${0}(testo${1} numero${1} numero)",
    	Disp:"Restituisce una stringa di testo parziale di un testo."
    }, 
    MIN:{    
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce il valore minimo di un elenco di argomenti."
    },    
    MINUTE:{    
    	Syntax:"${0}(numero)",
    	Disp:"Determina il numero sequenziale per il minuto dell'ora (0-59) per il valore orario."
    },    
    MOD:{    
    	Syntax:"${0}(numero_diviso${1} divisore)",
    	Disp:"Restituisce il resto quando il numero diviso viene diviso per un divisore."
    },
    MODE:{    
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce il valore più comune in un campione."
    },
    MONTH:{    
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il mese per il valore data fornito. Il mese è restituito come numero intero compreso tra 1 e 12."
    },
    MROUND:{   
    	Syntax: "${0}(numero${1} multiplo)",
        Disp:"Restituisce un numero arrotondato a un multiplo specificato."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Moltiplicazione array. Restituisce il prodotto di due array."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(numero1${1} [numero 2]${1} ...)",
        Disp:"Restituisce il coefficiente multinomiale di una serie di numeri."
    },
    N:{    
    	Syntax:"${0}(valore)",
    	Disp:"Converte un valore in un numero."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Imposta nella cella il valore di errore #N/D."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(data di inizio${1} data di fine${1} [festività])",
    	Disp:"Restituisce il numero di giornate lavorative tra due date."
    },
    NOT:{    
    	Syntax:"${0}(valore logico)",
    	Disp:"Inverte il valore dell'argomento."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Determina l'ora corrente del computer."
    },
    NPV:{   
    	Syntax:"${0}(tasso${1} valore 1${1} [valore 2]${1} ...)",
        Disp:"Calcola il valore netto corrente di un investimento, sulla base di un tasso di sconto indicato, e una serie di pagamenti e utili futuri."
    },
    OCT2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero ottale in un numero binario."
    },
    OCT2DEC:{
    	Syntax:"${0}(numero)",
    	Disp:"Converte un numero ottale in un numero decimale."
    },
    OCT2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte un numero ottale in un numero esadecimale."
    },
    ODD:{    
    	Syntax:"${0}(numero)",
    	Disp:"Arrotonda un numero per eccesso al numero intero dispari più vicino, dove \"per eccesso\" indica \"lontano da 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(riferimento${1} righe${1} colonne${1} [altezza]${1} [larghezza])",
    	Disp:"Restituisce un riferimento a un intervallo che è un numero di righe e di colonne specificato da una cella o un intervallo di celle."
    },
    OR:{    
    	Syntax:"${0}(valore logico 1${1} [valore logico 2]${1} ...)",
    	Disp:"Restituisce TRUE se almeno un argomento è TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Restituisce il valore approssimato di Pi."
    },
    PMT:{
    	Syntax:"${0}(tasso${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Restituisce il pagamento per un prestito basato su pagamenti regolari e un tasso di interesse fisso."
    },
    POWER:{    
    	Syntax:"${0}(base${1} potenza)",
    	Disp:"Restituisce il risultato di un numero elevato alla potenza indicata."
    },
    PPMT:{
    	Syntax:"${0}(tasso${1} per${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Calcola l'importo del rimborso per un periodo per un investimento basato su pagamenti regolari e un tasso di interesse fisso."
    },
    PRICEDISC:{
    	Syntax:"${0}(saldo${1} data_maturazione${1} sconto${1} riscatto${1} [base])",
    	Disp:"Calcola il prezzo per valore nominale $100 di un titolo scontato."
    },
    PRICEMAT:{
    	Syntax:"${0}(saldo${1} data_maturazione${1} emissione${1} tasso${1} yld${1} [base])",
    	Disp:"Calcola il prezzo per valore nominale $100 di un titolo che paga l'interesse alla data di maturazione."
    },
    PRODUCT:{   
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Moltiplica tutti i numeri forniti come argomenti e restituisce il prodotto."
    },
    PROPER:{    
    	Syntax:"${0}(testo)",
    	Disp:"Converte una stringa di testo con il maiuscolo/minuscolo appropriato, la prima lettera di ciascuna parola in maiuscolo e tutte le altre in minuscolo."
    },
    PV:{
    	Syntax:"${0}(tasso${1} nper${1} pmt${1} [fv]${1} [tipo])",
    	Disp:"Calcola il valore corrente di un investimento, sulla base di una serie di pagamenti futuri."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numeratore${1} denominatore)",
        Disp:"Restituisce il risultato di un numero diviso per un altro numero, troncato a un numero intero."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Restituisce un numero casuale tra 0 e 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(inferiore${1} superiore)",
    	Disp: "Restituisce un numero casuale intero compreso tra i numeri specificati."
    },
    RANK:{    
    	Syntax:"${0}(numero${1} rif${1} [ordine])",
    	Disp: "Restituisce il rango di un valore in un campione.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Discendente",
          		 result : 0
          	 }, {
          		 label : "${0} - Ascendente",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(saldo${1} data_maturazione${1} investimento${1} sconto${1} [base])",
    	Disp:"Calcola l'importo ricevuto alla data di maturazione per un titolo totalmente investito."
    }, 
    REPLACE:{    
    	Syntax: "${0}(testo${1} posizione${1} lunghezza${1} nuovo testo)",
    	Disp:"Sostituisce caratteri di una stringa di testo con un'altra stringa di testo."	
    },
    REPT:{    
    	Syntax: "${0}(testo${1} conteggio)",
    	Disp:"Ripete il testo un determinato numero di volte."	
    },
    RIGHT:{
    	Syntax: "${0}(testo${1} [numero])",
    	Disp:"Restituisce l'ultimo carattere o caratteri di testo."
    },
    RIGHTB:{
    	Syntax: "${0}(testo${1} [numero])",
    	Disp:"Restituisce l'ultimo carattere o caratteri di testo."
    },
    ROUND:{   
    	Syntax: "${0}(numero${1} conteggio)",
    	Disp:"Arrotonda un numero a un numero di cifre specificato."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(numero${1} conteggio)",
    	Disp:"Arrotonda un numero per difetto a un'accuratezza predefinita."
    },
    ROUNDUP:{   
    	Syntax: "${0}(numero${1} conteggio)",
    	Disp:"Arrotonda un numero per eccesso a un'accuratezza predefinita."
    },
    ROW:{   
    	Syntax:"${0}([riferimento])",
    	Disp:"Restituisce il numero di riga interno di un riferimento."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Restituisce il numero di righe in un array o riferimento."
    },
    RADIANS:{   
    	Syntax:"${0}(angolo)",
    	Disp:"Converte i gradi in radianti."
    },
    ROMAN:{   
    	Syntax:"${0}(numero${1} [formato])",
    	Disp:"Converte una cifra araba in numero romano in formato testo.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Classico",
          		 result : 0
          	 }, {
          		 label : "${0} - Più conciso",
          		 result : 1
          	 }, {
          		 label : "${0} - Più conciso",
          		 result : 2
          	 }, {
          		 label : "${0} - Più conciso",
          		 result : 3
          	 }, {
          		 label : "${0} - Semplificato",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(trova testo${1} testo${1} [posizione])",
    	Disp:"Cerca un valore di testo in un alto (non è sensibile alle maiuscole/minuscole)."
    },  
    SIGN:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce il segno algebrico di un numero."
    },
    SIN:{    
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il seno dell'angolo fornito."
    },
    SINH:{    
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce il seno iperbolico di un numero."
    },
    SECOND:{    
    	Syntax:"${0}(numero)",
    	Disp:"Determina il numero sequenziale per il secondo del minuto (0-59) per il valore orario."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficienti)",
        Disp:"Restituisce la somma di una serie di potenze basate sulla formula."
    },
    SHEET:{   
    	Syntax:"${0}([riferimento])",
    	Disp:"Restituisce il numero di foglio interno di un riferimento o una stringa."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} posizione_nth)",
    	Disp:"Restituisce il valore nth più piccolo in una serie di valori."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(testo${1} vecchio${1} nuovo${1} [quale])",
    	Disp:"Sostituisce il nuovo testo a quello esistente in una stringa di testo."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funzione${1} intervallo${1} ...)",
    	Disp:"Calcola i subtotali in un foglio di calcolo.",
    	Arguments: {
    		0 : [{
    			label : "${0} - MEDIA",
    			result : 1
    		}, {
    			label : "${0} - CONTEGGIO",
    			result: 2
    		}, {
    			label : "${0} - CONTEGGIOA",
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
    			label : "${0} - PRODOTTO",
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
    			label : "${0} - SOMMA",
    			result: 9
    		}
    		, {
    			label : "${0} - VAR",
    			result: 10
    		}, {
    			label : "${0} - VARP",
    			result: 11
    		}, {
    			label : "${0} - MEDIA",
    			result: 101
    		}, {
    			label : "${0} - CONTEGGIO",
    			result: 102
    		}, {
    			label : "${0} - CONTEGGIOA",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - PRODOTTO",
    			result: 106
    		}, {
    			label : "${0} - STDEV",
    			result: 107
    		}, {
    			label : "${0} - STDEVP",
    			result: 108
    		}, {
    			label : "${0} - SOMMA",
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
    	Syntax:"${0}(numero1${1} [numero 2]${1} ...)",
    	Disp:"Restituisce la somma di tutti gli argomenti."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Restituisce la somma dei prodotti di argomenti di array."
    },
    SUMIF:{   
    	Syntax:"${0}(intervallo${1} criteri${1} [intervallo somma])",
    	Disp:"Somma gli argomenti che soddisfano le condizioni."
    },
    SUMIFS:{
    	Syntax: "${0}(intervallo_somme${1} intervallo_criteri1${1} criteri1${1} ...)",
    	Disp:"Esegue il totale degli argomenti che soddisfano più condizioni."
    },
    SQRT:{   
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce la radice quadrata di un numero."
    },
    SQRTPI:{   
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la radice quadrata di (numero * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Calcola la deviazione standard basata su un campione."
    },
    STDEVP:
    {
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
    	Disp:"Calcola la deviazione standard basata sull'intera popolazione."
    },
    SUMSQ:{
    	Syntax:"${0}(numero 1${1} [numero 2]${1} ...)",
        Disp:"Restituisce la somma dei quadrati dei numeri nell'elenco."
    },
    T:{
    	Syntax:"${0}(testo)",
    	Disp:"Converte i suoi argomenti in testo."
    },
    TAN:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la tangente del numero fornito."
    },
    TANH:{    
    	Syntax:"${0}(numero)",
        Disp:"Restituisce la tangente iperbolica del numero fornito."
    },
    TBILLPRICE:{
    	Syntax:"${0}(saldo${1} data_maturazione${1} sconto)",
    	Disp:"Calcola il prezzo per valore nominale $100 di un buono del Tesoro."
    },
    TEXT:{
    	Syntax:"${0}(valore${1} codice formato)",
    	Disp:"Converte il valore in un testo in base alle regole di un codice in formato numerico e lo restituisce."
    },
    TIME:{   
    	Syntax:"${0}(ora${1} minuto${1} secondo)",
    	Disp:"Determina un valore orario dai dettagli di ora, minuto e secondo."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(testo)",
	    Disp:"Restituisce un numero interno per un testo con un possibile formato ora."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determina la data corrente del computer."
    },    
    TRIM:{
    	Syntax:"${0}(testo)",
    	Disp:"Rimuove tutti gli spazi iniziali e finali. Eventuali altre sequenze di 2 o più spazi interni vengono sostituite con uno spazio singolo."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Restituisce il valore logico TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(numero${1} [conteggio])",
    	Disp:"Elimina la parte decimale di un numero."
    },
    TYPE:{   
    	Syntax:"${0}(valore)",
    	Disp:"Definisce il tipo di dati di un valore."	
    },
    UPPER:{  
    	Syntax: "${0}(testo)",
    	Disp:"Converte il testo in maiuscolo."
    },
    VALUE:{    
    	Syntax: "${0}(testo)",
    	Disp:"Converte un argomento testuale in un numero."
    },
    VAR:{    
    	Syntax: "${0}(numero1${1} [numero2]${1}...)",
    	Disp:"Calcola la varianza basata su un campione."
    },
    VARA:{    
    	Syntax: "${0}(numero1${1} [numero2]${1}...)",
    	Disp:"Calcola la varianza basata su un campione, includendo numeri, testo e valori logici."
    },
    VARP:{    
    	Syntax: "${0}(numero1${1} [numero2]${1}...)",
    	Disp:"Calcola la varianza basata sull'intera popolazione."
    },
    VARPA:{    
    	Syntax: "${0}(numero1${1} [numero2]${1}...)",
    	Disp:"Calcola la varianza basata sull'intera popolazione, includendo numeri, testo e valori logici."
    },
    VLOOKUP:{    
    	Syntax: "${0}(criterio di ricerca${1} array${1} indice${1} [ordinamento])",
    	Disp:"Ricerca verticale e riferimento alle celle indicate.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Corrispondenza approssimata",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Corrispondenza esatta",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(numero${1} [tipo])",
    	Disp:"Restituisce il giorno della settimana per il valore data come cifra intera.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Numeri da 1 (Domenica) a 7 (Sabato)",
          		 result : 1
          	 }, {
          		 label : "${0} - Numeri da 1 (Lunedì) a 7 (Domenica)",
          		 result : 2
          	 }, {
          		 label : "${0} - Numeri da 0 (Lunedì) a 6 (Sabato)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Numeri da 1 (Lunedì) a 7 (Domenica)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Numeri da 1 (Martedì) a 7 (Lunedì)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Numeri da 1 (Mercoledì) a 7 (Martedì)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Numeri da 1 (Giovedì) a 7 (Mercoledì)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Numeri da 1 (Venerdì) a 7 (Giovedì)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Numeri da 1 (Sabato) a 7 (Venerdì)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Numeri da 1 (Domenica) a 7 (Sabato)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(numero${1} [modo])",
    	Disp:"Calcola la settimana del calendario corrispondente alla data fornita.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Domenica",
          		 result : 1
          	 }, {
          		 label : "${0} - Lunedì",
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
    	Syntax:"${0}(data di inizio${1} giorni${1} [festività])",
    	Disp:"Restituisce il numero seriale della data antecedente o successiva a un numero specificato di giorni lavorativi."
    },
    XNPV:{   
    	Syntax:"${0}(tasso${1} valori${1} date)",
    	Disp:"Calcola il valore netto attuale per un programma di flussi di cassa."
    },
    YEAR:{    
    	Syntax:"${0}(numero)",
    	Disp:"Restituisce l'anno di un valore data come numero intero."
    }
}
})

