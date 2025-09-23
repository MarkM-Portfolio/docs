/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Totes les fórmules",
	LABEL_FORMULA_LIST: "Llista de fórmules:",
	formula:{
	ABS:{	
	    Syntax:"${0}(nombre)",
	    Disp:"Retorna el valor absolut d\'un nombre."
    },
    ACOS:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna l'arc cosinus d'un nombre. L'angle es retorna en radians."
    },
    ACOSH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Torna el cosinus hiperbòlic invers d\'un nombre."
    },
    ACOT:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la cotangent inversa d'un nombre. L'angle es mesura en radians."
    },
    ACOTH:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la cotangent hiperbòlica inversa d'un nombre."
    },
    ADDRESS:{
         Syntax:"${0}(fila${1} columna${1} [abs]${1} [a1]${1} [full])",
         Disp:"Torna la referència a una cel·la com a text.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absoluta",
        		 result : 1
        	 }, {
        		 label : "${0} - Fila absoluta / Columna relativa",
        		 result : 2
        	 }, {
        		 label : "${0} - Fila relativa / Columna absoluta",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativa",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - Estil R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - Estil A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(valor lògic 1${1} [valor lògic 2]${1} ...)",
    	Disp:"Retorna TRUE si tots els arguments són TRUE."
    },
    ASIN:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna l'arc sinus d'un nombre. L'angle es retorna en radians."
    },
    ASINH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Torna el sinus hiperbòlic invers d\'un nombre."
    },
    ATAN:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna l'arc tangent d'un nombre. L'angle es retorna en radians."
    },
    AVERAGE:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Retorna la mitjana aritmètica dels arguments."
    },
    AVERAGEA:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Torna el valor de mitjana d\'un exemple. El text s\'avalua com a zero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(interval${1} criteris${1} [interval_mitjà])",
    	Disp:"Retorna la mitjana (mitjana aritmètica) dels arguments que compleixen la condició proporcionada."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(interval_mitjà${1} interval_criteri1${1} criteri1${1} ...)",
    	Disp:"Retorna la mitjana (mitjana aritmètica) dels arguments que compleixen diverses condicions."
    },
    ATAN2:{
    	Syntax:"${0}(x_núm${1} y_núm)",
    	Disp:"Retorna l\'arc tangent, o la tangent inversa de les coordenades x- i y- especificades. L\'arc tangent és l\'angle des de l\'eix x- a la línia que conté l\'origen (0, 0) i un punt amb coordenades (x_núm, y_núm)."
    },
    ATANH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna la tangent hiperbòlica d\'un nombre. El nombre ha d\'estar entre -1 i 1 (llevat de -1 i 1)."
    },
    BASE:{    
    	Syntax:"${0}(nombre${1} base${1} [longitud mínima])",
    	Disp:"Converteix un enter positiu en text des d\'un sistema numèric a la base definida."
    },
    BIN2DEC:{
    	Syntax:"${0}(nombre)",
    	Disp:"Converteix un nombre binari a un nombre decimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre binari a un nombre hexadecimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre binari a un nombre octal."
    },
    CEILING:{  
    	Syntax: "${0}(nombre${1} increment)",
    	Disp:"Arrodoneix un nombre a l\'enter o múltiple significatiu més proper."
    },
    CHAR: {
    	Syntax: "${0}(nombre)",
    	Disp: "Retorna un caràcter assignat pel nombre. Cerca el caràcter amb assignació de caràcters Unicode. El nombre està entre l'1 i el 255."
    },
    CHOOSE: {
    	Syntax: "${0}(índex${1} valor1${1} [valor2${1} ...)",
    	Disp: "Cerca i retorna el valor corresponent segons l\'índex. Pot TRIAR fins a 30 valors."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Torna un codi numèric del primer caràcter d\'una cadena de text codificada en unicode."
    },
    COLUMN:{    
    	Syntax:"${0}([referència])",
    	Disp:"Torna el número de columna intern d\'una referència."
    },
    COLUMNS:{    
    	Syntax:"${0}(matriu)",
    	Disp:"Torna el nombre de columnes d\'una matriu o referència."
    },
    COMBIN:{
    	Syntax:"${0}(nombre${1} nombre_seleccionat)",
    	Disp:"Retorna el nombre de combinacions d\'un nombre d\'elements determinats. Utilitzeu ${0} per determinar el nombre total possible de grups per a un nombre determinat d\'elements."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Combina diverses sèries de text en una sola sèrie."
    },
    CONVERT:{
    	Syntax:"${0}(nombre${1} d_unitat${1} a_unitat)",
    	Disp:"Converteix un nombre d\'un sistema de mesura a un altre.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Lliura (unitat de massa, avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unitat de massa atòmica)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Massa d'unça (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metre",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Milla terrestre",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Polzada",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Peu",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Iarda",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Àngstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Any",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Dia",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Hora",
       		 result : "\"h\""
       	 }, {
       		 label : "${0} - Minut",
       		 result : "\"min\""
       	 }, {
       		 label : "${0} - Segon",
       		 result : "\"s\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmósfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Milímetres de mercuri (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Lliura (força)",
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
       		 label : "${0} - Electronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Cavall de vapor-hora",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-hora",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Peu-lliura",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Caloria termodinàmica",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Cavall de vapor",
       		 result : "\"CV\""
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
       		 label : "${0} - Grau Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Grau Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Culleradeta",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Cullerada",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Unça de fluid",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Tassa",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Pinta EUA",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Pinta Regne Unit",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galó",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litre",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el cosinus d\'un angle determinat."
    },
    COSH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el cosinus hiperbòlic d\'un nombre."
    },
    COT:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la cotangent d'un nombre determinat."
    },
    COTH:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la cotangent hiperbòlica d'un nombre determinat."
    },
    COUNT:{   
    	Syntax:"${0}(valor1${1} [valor2]${1} ...)",
    	Disp:"Compta la quantitat de nombres hi ha a la llista d\'arguments. Les entrades de text s'ignoren."
    },
    COUNTA:{   
    	Syntax:"${0}(valor1${1} [valor2]${1} ...)",
    	Disp:"Compta la quantitat de valors que hi ha a la llista d\'arguments."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(interval)",
    	Disp: "Compta les cel·les en blanc d\'un abast especificat."
    },
    COUNTIF:{
    	Syntax: "${0}(interval${1} criteris)",
    	Disp:"Compta el nombre de cel·les que compleixen la condició proporcionada."
    },
    COUNTIFS:{
    	Syntax: "${0}(interval_criteri1${1} criteri1${1} ...)",
    	Disp:"Compta el nombre de cel·les que compleixen diverses condicions."
    },
    CUMIPMT:{	
	    Syntax:"${0}(taxa${1} nper${1} pv${1} període_ini${1} període_final${1} tipus)",
	    Disp:"Calcula l'interès cumulatiu pagat entre dos períodes especificats."
    },
    CUMPRINC:{	
	    Syntax:"${0}(taxa${1} nper${1} pv${1} període_ini${1} període_final${1} tipus)",
	    Disp:"Calcula el principal cumulatiu pagat en un préstec entre dos períodes especificats."
    }, 
    DATE:{	
	    Syntax:"${0}(any${1} mes${1} dia)",
	    Disp:"Proporciona un número intern per a la data indicada."
    },  
    DATEDIF:{	
	    Syntax:"${0}(data d\'inici${1} data d\'acabament${1} format)",
	    Disp:"Retorna la diferència en anys, mesos o dies entre dues dates.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - El nombre d'anys complets del període.",
	    		result: "\"A\""
	    	}, {
	    		label: "${0} - El nombre de mesos complets del període.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - El nombre de dies del període.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - El nombre de dies entre data_inici i data_acabament, ignorant mesos i anys.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - El nombre de mesos entre data_inici i data_acabament, ignorant anys.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - El nombre de dies entre data_inici i data_acabament, ignorant anys.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Torna un número intern per a un text que tingui un format de data possible."
    }, 
    DAY:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el dia d\'un valor de data especificat. El dia es retorna com un enter entre 1 i 31. També podeu introduir un valor de data/hora negatiu."
    },
    DAYS360:{
    	Syntax:"${0}(data_inici${1} data_finalització${1} [mètode])",
    	Disp:"Calcula la quantitat de dies entre les dues dates d'acord amb l'any de 360 dies.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Mètode EUA (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Mètode europeu",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(data_inici${1} data_finalització${1})",
    	Disp:"Calcula el nombre de dies entre dues dates."
    },
    DEC2BIN:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre decimal a un nombre binari."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre decimal a un nombre hexadecimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre decimal a un nombre octal."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"Converteix els radiants en graus."
    },
    DISC:{
    	Syntax:"${0}(liquidació${1} venciment${1} pr${1} amortització${1} [base])",
    	Disp:"Calcula la taxa de descompte d'un valor."
    }, 
    DOLLAR:{
    	Syntax:"${0}(nombre${1} [decimals])",
    	Disp:"Converteix un nombre en text, amb el format de moneda $ (dòlar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} mesos)",
    	Disp:"Retorna el número de sèrie que representa la data que és el nombre indicat de mesos abans o després d'start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} mesos)",
    	Disp:"Retorna el número de sèrie del darrer dia del mes que és el nombre indicat de mesos abans o després d'start_date "
    },
    ERFC:{   
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la funció d'error complementària, integrada entre un nombre i l'infinit."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referència)",
    	Disp:"Torna un nombre corresponent a un tipus d\'error."
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
    	Syntax:"${0}(número)",
    	Disp:"Retorna un nombre arrodonit a l\'enter parell més proper."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Compara dues sèries de text i retorna TRUE si són idèntiques. Aquesta funció distingeix entre majúscules i minúscules."
    },
    EXP:{    
    	Syntax:"${0}(número)",
    	Disp: "Torna e elevat a un nombre determinat."
    },
    FACT:{  
    	Syntax:"${0}(nombre)",
    	Disp:"Calcula la factorial d\'un nombre."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la factorial doble d'un nombre."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Retorna el valor lògic com a FALS."
    },
    FIND:{   
    	Syntax:"${0}(text cerca${1} text${1} [posició])",
    	Disp:"Cerca una cadena de text dins una altra (distingeix entre majúscules i minúscules)."
    },
    FIXED:{
    	Syntax:"${0}(nombre${1} [decimals]${1} [sense_comes])",
    	Disp:"Formata un nombre com a text amb un nombre fix de decimals.",
    	Arguments: {
    		2 : [{
    			label : "${0} - evita comes",
    			result : "TRUE"
    		}, {
    			label : "${0} - no evitis comes",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(nombre${1} significació)",
    	Disp:"Arrodoneix un nombre a la baixa al múltiple significatiu més proper."
    },
    FORMULA:{   
    	Syntax:"${0}(referència)",
    	Disp:"Torna la fórmula d\'una cel·la de fórmula."
    },
    FREQUENCY:{   
    	Syntax:"${0}(LlistaSeqüènciaNombre_dades${1} LlistaSeqüènciaNombre_bins)",
    	Disp:"Categoritza valors en intervals i compta el nombre de valors a cada interval."
    },
    FV:{
    	Syntax:"${0}(taxa${1} nper${1} pmt${1} [pv]${1} [tipus])",
    	Disp:"Calcula el valor futur d'una inversió segons un tipus d'interès constant."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} planificació)",
        Disp:"Calcula el valor futur d'un principal inicial després d'aplicar una sèrie de taxes d'interès."
    },
    GAMMALN:{   
    	Syntax:"${0}(nombre)",
        Disp:"Retorna el logaritme natural de la funció gamma."
    },
    GCD:{   
    	Syntax:"${0}(nombre1${1} [nombre2]${1} ...)",
        Disp:"Retorna el màxim comú divisor de tots els arguments."
    },
    HEX2BIN:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre hexadecimal a un nombre binari."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(nombre)",
    	Disp:"Converteix un nombre hexadecimal a un nombre decimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre hexadecimal a un nombre octal."
    },
    HOUR:{   
    	Syntax:"${0}(nombre)",
    	Disp:"Determina el nombre seqüencial de l\'hora del dia (0-23) per al valor d\'hora."
    },
    HLOOKUP:{   
    	Syntax:"${0}(criteris_cerca${1} matriu${1} Índex${1} [ordenat])",
    	Disp:"Cerca horitzontal i fa referència a les cel·les que hi ha a sota.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Coincidència aproximada",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Coincidència exacta",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(enllaç${1} [text_cel·la])",
    	Disp:"Retorna un enllaç que apunta a un recurs de xarxa o a un enllaç que fa referència a un interval. Si es proporciona, es mostra text_cel·la (opcional), si no mostra l'enllaç com un text."
    },    
    IF:{    
    	Syntax:"${0}(prova${1} [valor_then]${1} [valor_otherwise])",
    	Disp:"Especifica que s\'ha de realitzar una prova lògica."
    },
    IFS:{
    	Syntax:"${0}(prova1${1} valor_si_cert1${1} ...)",
    	Disp:"Executa proves lògiques per comprovar si es compleixen una o diverses condicions i retorna un valor que coincideix amb la primera condició TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(valor${1} valor_si_error)",
    	Disp:"Retorna el valor que especifiqueu si l'expressió és un error. En cas contrari, retorna el resultat de l'expressió."
    },
    IFNA:{
    	Syntax:"${0}(valor${1} valor_si_na)",
    	Disp:"Retorna el valor que especifiqueu si l'expressió retorna el valor d'error #N/A. En cas contrari, retorna el resultat de l'expressió."
    },
    INDEX:{    
    	Syntax:"${0}(referència${1} fila${1} [columna]${1} [interval])",
    	Disp:"Torna una referència a una cel·la a partir d\'un abast definit."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [estil_ref])",
    	Disp:"Torna el contingut d\'una cel·la a la qual es fa referència en format de text.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - Estil R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - Estil A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Arrodoneix un nombre a l\'enter inferior més pròxim."
    },
    IPMT:{
    	Syntax:"${0}(taxa${1} per${1} nper${1} pv${1} [fv]${1} [tipus])",
    	Disp:"Calcula la quantitat d'amortització d'interessos per a un període per a una inversió basada en pagaments regulars i una taxa d'interès fixa."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(valor)",
    	Disp:"Retorna TRUE si la cel·la referenciada està en blanc, si no retorna FALSE."
    },
    ISERR:{
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor és un valor d\'error no igual a #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor és un valor d\'error."
    },
    ISEVEN:{    
    	Syntax:"${0}(valor)",
    	Disp:"Retorna TRUE si el valor és parell, en cas contrari retorna FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referència)",
    	Disp:"Torna TRUE si la cel·la és una cel·la de fórmula."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor comporta un nombre lògic."
    },
    ISNA:{    
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor és #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor no és un text."
    },
    ISNUMBER:{   
    	Syntax:"${0}(valor)",
    	Disp:"Retorna TRUE si el valor és un nombre."
    },
    ISODD:{    
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor és un enter senar."
    },
    ISPMT:{
    	Syntax:"${0}(taxa${1} per${1} nper${1} pv)",
    	Disp:"Calcula l'interès pagat durant un període especificat per a una inversió."
    }, 
    ISREF:{    
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor és una referència."
    },
    ISTEXT:{    
    	Syntax:"${0}(valor)",
    	Disp:"Torna TRUE si el valor és un text."
    },
    LARGE:{
        Syntax:"${0}(matriu${1} n_posició)",
    	Disp:"Torna el valor n més gran d\'un conjunt de valors."
    },
    LCM:{   
    	Syntax:"${0}(nombre1${1} [nombre2]${1} ...)",
        Disp:"Retorna el mínim comú múltiple de tots els nombres de la llista."
    },
    LEFT:{
        Syntax:"${0}(text${1} [longitud])",
    	Disp:"Torna el nombre especificat de caràcters des de l\'inici d\'un text."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Torna la longitud d\'una cadena de text."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Torna el nombre de bytes d\'una cadena de text."
    },
    LN:{
    	Syntax:"${0}(nombre)",
    	Disp:"Torna el logaritme natural d\'un nombre."
    },
    LOG:{
    	Syntax:"${0}(nombre${1} [base])",
    	Disp:"Torna el logaritme d\'un nombre en una base especificada."
    },
    LOG10:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el logaritme en base 10 d\'un nombre."
    },
    LOOKUP:{
    	Syntax: "${0}(criteri cerca${1} vector cerca${1} [vector_resultat])",
    	Disp:"Determina un valor en un vector mitjançant la comparació de valors en un altre sector."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converteix text en minúscules."
    },    
    MATCH:{    
    	Syntax: "${0}(criteri de cerca${1} cerca_matriu${1} [tipus])",
    	Disp:"Defineix una posició en una matriu després de comparar valors.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Menor que",
         		 result : 1
         	 }, {
         		 label : "${0} - Coincidència exacta",
         		 result : 0
         	 }, {
         		 label : "${0} - Més gran que",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Retorna el valor màxim d\'una llista d\'arguments."
    },
    MEDIAN:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Retorna el valor central, si es proporciona un nombre senar de valors. En cas contrari, retorna la mitjana aritmètica entre els dos valors del mig."
    },
    MID:{    
    	Syntax:"${0}(text${1} nombre${1} nombre)",
    	Disp:"Torna una cadena de text parcial d\'un text."
    }, 
    MIN:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Retorna el valor mínim d\'una llista d\'arguments."
    },    
    MINUTE:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Determina el nombre seqüencial per al minut de l\'hora (0-59) per al valor de l\'hora."
    },    
    MOD:{    
    	Syntax:"${0}(nombre_dividit${1} divisor)",
    	Disp:"Retorna la resta quan el nombre dividit es divideix pel divisor."
    },
    MODE:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Torna el valor més comú d\'un exemple."
    },
    MONTH:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el mes corresponent al valor de data proporcionat. El mes es retorna com un enter entre 1 i 12."
    },
    MROUND:{   
    	Syntax: "${0}(nombre${1} múltiple)",
        Disp:"Retorna un nombre arrodonit al múltiple especificat."
    },
    MMULT:{    
    	Syntax:"${0}(matriu${1} matriu)",
    	Disp:"Multiplicació de matrius. Torna el producte de dues matrius."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(nombre1${1} [nombre2]${1} ...)",
        Disp:"Retorna el coeficient multinomial d'un conjunt de nombres."
    },
    N:{    
    	Syntax:"${0}(valor)",
    	Disp:"Converteix un valor en un nombre."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Retorna el valor d\'error #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(data inici${1} data acabament${1} [vacances])",
    	Disp:"Torna el nombre de dies laborables entre dues dates."
    },
    NOT:{    
    	Syntax:"${0}(valor lògic)",
    	Disp:"Inverteix el valor de l\'argument."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Determina l\'hora actual de l\'ordinador."
    },
    NPV:{   
    	Syntax:"${0}(taxa${1} valor 1${1} [valor 2]${1} ...)",
        Disp:"Calcula el valor actual net d'una inversió segons un tipus de descompte proporcionat una sèrie de pagaments i renda futurs."
    },
    OCT2BIN:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre octal a un nombre binari."
    },
    OCT2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Converteix un nombre octal a un nombre decimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(nombre${1} [llocs])",
    	Disp:"Converteix un nombre octal a un nombre hexadecimal."
    },
    ODD:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Arrodoneix un nombre a l\'alça fins a l\'enter senar superior més pròxim, on \"up\" significa \"away de 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(referència${1} files${1} columnes${1} [alçada]${1} [amplada])",
    	Disp:"Torna una referència a un interval que és un nombre concret de files i columnes a partir d\'una cel·la o interval de cel·les."
    },
    OR:{    
    	Syntax:"${0}(valor lògic 1${1} [valor lògic 2]${1} ...)",
    	Disp:"Retorna TRUE si com a mínim un argument és TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Torna el valor aproximat de Pi."
    },
    PMT:{
    	Syntax:"${0}(taxa${1} nper${1} pv${1} [fv]${1} [tipus])",
    	Disp:"Retorna el pagament per a un préstec basat en pagaments regulars i una taxa d'interès fixa."
    },
    POWER:{    
    	Syntax:"${0}(base${1} potència)",
    	Disp:"Eleva un nombre a la potència d\'un altre."
    },
    PPMT:{
    	Syntax:"${0}(taxa${1} per${1} nper${1} pv${1} [fv]${1} [tipus])",
    	Disp:"Calcula la quantitat d'amortització per a un període per a una inversió basada en pagaments regulars i una taxa d'interès fixa."
    },
    PRICEDISC:{
    	Syntax:"${0}(liquidació${1} venciment${1} descompte${1} amortització${1} [base])",
    	Disp:"Calcula el preu per un valor nominal de 100 dòlars d'un valor amb descompte."
    },
    PRICEMAT:{
    	Syntax:"${0}(liquidació${1} venciment${1} emissió${1} taxa${1} yld${1} [base])",
    	Disp:"Calcula el preu per un valor nominal de 100 dòlars d'un valor que dóna interès al venciment."
    },
    PRODUCT:{   
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Multiplica tots els nombres proporcionats com a arguments i en retorna el producte."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converteix una cadena de text al cas correcte, la primera lletra de cada paraula en majúscula i totes les altres lletres en minúscula."
    },
    PV:{
    	Syntax:"${0}(taxa${1} nper${1} pmt${1} [fv]${1} [tipus])",
    	Disp:"Calcula el valor actual d'una inversió segons una sèrie de pagaments futurs."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerador${1} denominador)",
        Disp:"Retorna el resultat d'un nombre dividit per un altre nombre, truncat a un enter."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Retorna un nombre aleatori entre 0 i 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(inferior${1} superior)",
    	Disp: "Torna un enter aleatori entre els nombres que especifiqueu."
    },
    RANK:{    
    	Syntax:"${0}(nombre${1} ref${1} [ordre])",
    	Disp: "Torna la classificació d\'un valor d\'exemple.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Descendent",
          		 result : 0
          	 }, {
          		 label : "${0} - Ascendent",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(liquidació${1} venciment${1} inversió${1} descompte${1} [base])",
    	Disp:"Calcula la quantitat rebuda al venciment per a un valor invertit totalment."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} posició ${1} longitud${1} text nou)",
    	Disp:"Reemplaça els caràcters dins una cadena de text per una cadena de text diferent."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} recompte)",
    	Disp:"Repeteix text un nombre determinat de vegades."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [nombre])",
    	Disp:"Retorna el darrer caràcter o els darrers caràcters d\'un text."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [nombre])",
    	Disp:"Retorna el darrer caràcter o els darrers caràcters d\'un text."
    },
    ROUND:{   
    	Syntax: "${0}(nombre${1} recompte)",
    	Disp:"Arrodoneix un nombre amb una precisió predefinida."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(nombre${1} recompte)",
    	Disp:"Arrodoneix un nombre a la baixa fins a una precisió predefinida."
    },
    ROUNDUP:{   
    	Syntax: "${0}(nombre${1} recompte)",
    	Disp:"Arrodoneix un nombre a l\'alta fins a una precisió predefinida."
    },
    ROW:{   
    	Syntax:"${0}([referència])",
    	Disp:"Defineix el nombre de fila intern d\'una referència."
    },
    ROWS:{   
    	Syntax:"${0}(matriu)",
    	Disp:"Torna el nombre de files d\'una matriu o referència."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"Converteix els angles en radiants."
    },
    ROMAN:{   
    	Syntax:"${0}(nombre${1} [format])",
    	Disp:"Converteix un numeral àrab en romà, com a text.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Clàssic",
          		 result : 0
          	 }, {
          		 label : "${0} - Més concís",
          		 result : 1
          	 }, {
          		 label : "${0} - Més concís",
          		 result : 2
          	 }, {
          		 label : "${0} - Més concís",
          		 result : 3
          	 }, {
          		 label : "${0} - Simplificat",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(text cerca${1} text${1} [posició])",
    	Disp:"Cerca un valor de text dins un altre valor (no distingeix entre majúscules i minúscules)."
    },  
    SIGN:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna el signe algebraic d'un nombre."
    },
    SIN:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el sinus d\'un angle determinat."
    },
    SINH:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Retorna el sinus hiperbòlic d\'un nombre."
    },
    SECOND:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Determina el nombre seqüencial per al minut (0-59) per al valor de temps."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coeficients)",
        Disp:"Retorna la suma d'una sèrie de potències basada en la fòrmula."
    },
    SHEET:{   
    	Syntax:"${0}([referència])",
    	Disp:"Torna el número de full intern d\'una referència o una cadena."
    },
    SMALL:{   
    	Syntax:"${0}(matriu${1} n_posició)",
    	Disp:"Torna el valor n més petit d\'un conjunt de valors."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} antic${1} nou${1} [quin])",
    	Disp:"Torna text on un text antic es substitueix per un text nou."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funció${1} interval${1} ...)",
    	Disp:"Calcula els subtotals d\'un full de càlcul.",
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
    	Syntax:"${0}(nombre1${1} [nombre2]${1} ...)",
    	Disp:"Torna la suma de tots els arguments."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matriu 1${1} [matriu 2]${1} ...)",
    	Disp:"Torna la suma dels productes dels arguments de matriu."
    },
    SUMIF:{   
    	Syntax:"${0}(interval${1} criteris${1} [interval de suma])",
    	Disp:"Obté el total dels arguments que compleixen les condicions."
    },
    SUMIFS:{
    	Syntax: "${0}(interval_suma${1} interval_criteri1${1} criteri1${1} ...)",
    	Disp:"Obté el total dels arguments que compleixen diverses condicions."
    },
    SQRT:{   
    	Syntax:"${0}(nombre)",
    	Disp:"Torna l\'arrel quadrada d\'un nombre."
    },
    SQRTPI:{   
    	Syntax:"${0}(nombre)",
        Disp:"Retorna l'arrel quadrada del (nombre * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Calcula la desviació estàndard d'acord amb un exemple."
    },
    STDEVP:
    {
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Calcula la desviació estàndard d'acord amb tota la població."
    },
    SUMSQ:{
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
        Disp:"Retorna la suma dels quadrats dels nombres de la llista."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Converteix els seus arguments en text."
    },
    TAN:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la tangent del nombre especificat."
    },
    TANH:{    
    	Syntax:"${0}(nombre)",
        Disp:"Retorna la tangent hiperbòlica del nombre especificat."
    },
    TBILLPRICE:{
    	Syntax:"${0}(liquidació${1} venciment${1} descompte)",
    	Disp:"Calcula el preu per un valor nominal de 100 dòlars per a una lletra del tresor."
    },
    TEXT:{
    	Syntax:"${0}(valor${1} codiformat)",
    	Disp:"Converteix el valor a un text d\'acord amb les regles d\'un codi de format numèric i la retorna."
    },
    TIME:{   
    	Syntax:"${0}(hora${1} minut${1} segon)",
    	Disp:"Determina un valor d\'hora a partir dels detalls d\'hora, minut i segon."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Torna un nombre intern per a un text que tingui un possible format horari."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determina la data actual de l\'ordinador."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Elimina tots els espais inicials i finals. Qualsevol altra seqüència de 2 o més espais interiors es substitueix per un sol espai."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Retorna el valor lògic TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(nombre${1} [recompte])",
    	Disp:"Trunca les posicions decimals d\'un nombre."
    },
    TYPE:{   
    	Syntax:"${0}(valor)",
    	Disp:"Defineix el tipus de dades d\'un valor."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Converteix text en majúscules."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Converteix un argument de text en un nombre."
    },
    VAR:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Fa una estimació de la variància segons un exemple."
    },
    VARA:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Fa una estimació de la variància segons un exemple, inclosos els nombres, el text i els valors lògics."
    },
    VARP:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Calcula la variància segons tota la població."
    },
    VARPA:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Calcula la variància segons tota la població, inclosos els nombres, el text i els valors lògics."
    },
    VLOOKUP:{    
    	Syntax: "${0}(criteri de cerca${1} matriu${1} índex${1} [ordre de classificació])",
    	Disp:"Cerca i referència vertical a les cel·les indicades.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Coincidència aproximada",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Coincidència exacta",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(número${1} [tipus])",
    	Disp:"Torna el dia de la setmana per al valor de data com a enter.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Números 1 (diumenge) al 7 (dissabte)",
          		 result : 1
          	 }, {
          		 label : "${0} - Números 1 (dilluns) al 7 (diumenge)",
          		 result : 2
          	 }, {
          		 label : "${0} - Números 0 (dilluns) al 6 (diumenge)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Números 1 (dilluns) al 7 (diumenge)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Números 1 (dimarts) al 7 (dilluns)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Números 1 (dimecres) al 7 (dimarts)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Números 1 (dijous) al 7 (dimecres)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Números 1 (divendres) al 7 (dijous)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Números 1 (dissabte) al 7 (divendres)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Números 1 (diumenge) al 7 (dissabte)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(número${1} [mode])",
    	Disp:"Calcula la setmana de calendari que correspon a la data indicada.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Diumenge",
          		 result : 1
          	 }, {
          		 label : "${0} - Dilluns",
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
    	Syntax:"${0}(data inici${1} dies${1} [vacances])",
    	Disp:"Torna el número de sèrie de la data anterior o posterior a un nombre de dies laborables especificats."
    },
    XNPV:{   
    	Syntax:"${0}(taxa${1} valors${1} dates)",
    	Disp:"Calcula el valor actual net per a una planificació de fluxes de caixa."
    },
    YEAR:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Torna l\'any d\'un valor de data com a enter."
    }
}
})

