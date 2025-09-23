/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Todas las fórmulas",
	LABEL_FORMULA_LIST: "Lista de fórmulas:",
	formula:{
	ABS:{	
	    Syntax:"${0}(número)",
	    Disp:"Permite calcular el valor absoluto de un número."
    },
    ACOS:{
    	Syntax:"${0}(número)",
    	Disp:"Devolverá el arco coseno de un número. El ángulo se devuelve en radianes."
    },
    ACOSH:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el coseno hiperbólico inverso de un número."
    },
    ACOT:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve la cotangente inversa de un número. El ángulo de la cotangente se mide en radianes."
    },
    ACOTH:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve la cotangente hiperbólica inversa de un número."
    },
    ADDRESS:{
         Syntax:"${0}(fila${1} columna${1} [abs]${1} [a1]${1} [hoja])",
         Disp:"Devuelve la referencia a una celda como texto.",
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
        		 label : "${0} - Estilo R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - Estilo A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(valor lógico 1${1} [valor lógico 2]${1} ...)",
    	Disp:"El valor es TRUE cuando todos los argumentos dan TRUE."
    },
    ASIN:{
    	Syntax:"${0}(número)",
    	Disp:"Devolverá el arco seno de un número. El ángulo se devuelve en radianes."
    },
    ASINH:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el seno hiperbólico inverso de un número."
    },
    ATAN:{
    	Syntax:"${0}(número)",
    	Disp:"Devolverá el arco tangente de un número. El ángulo se devuelve en radianes."
    },
    AVERAGE:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devuelve el promedio de los argumentos."
    },
    AVERAGEA:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devuelve el valor medio para un ejemplo. El texto se valorará como cero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(rango${1} criterios${1} [rango_medio])",
    	Disp:"Devuelve el promedio (media aritmética) de los argumentos que cumplen la condición proporcionada."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(rango_medio${1} rango_criterio1${1} criterio1${1} ...)",
    	Disp:"Devuelve el promedio (media aritmética) de los argumentos que cumplen varias condiciones."
    },
    ATAN2:{
    	Syntax:"${0}(x_núm${1} y_núm)",
    	Disp:"Devuelve el arco tangente, o la tangente inversa, de las coordenadas x- e y- especificadas. El arco tangente es el ángulo desde el eje x a una línea que contiene el origen (0, 0) y un punto con coordenadas (x_núm, y_núm)."
    },
    ATANH:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve la tangente hiperbólica inversa de un número. El número debe estar entre -1 y 1 (excepto -1 y 1)."
    },
    BASE:{    
    	Syntax:"${0}(número${1} base${1} [longitud mínima])",
    	Disp:"Convierte un número entero positivo en un texto de un sistema numérico para la base dada."
    },
    BIN2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Convierte un número binario en un número decimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número binario en un número hexadecimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número binario en un número octal."
    },
    CEILING:{  
    	Syntax: "${0}(número${1} incremento)",
    	Disp:"Redondea un número al íntegro o múltiplo significativo más cercano."
    },
    CHAR: {
    	Syntax: "${0}(número)",
    	Disp: "Devuelve un carácter correlacionado por el número. Busca el carácter con mapa de caracteres Unicode. El número está entre el 1 y el 255."
    },
    CHOOSE: {
    	Syntax: "${0}(índice${1} valor1${1} [valor2]${1} ...)",
    	Disp: "Busca y devuelve el valor correspondiente de acuerdo con el índice. Puede ELEGIR de un máximo de 30 valores."
    },
    CODE:{
    	Syntax:"${0}(texto)",
    	Disp:"Devuelve un código numérico del primer carácter de una cadena de texto codificada en unicode."
    },
    COLUMN:{    
    	Syntax:"${0}([referencia])",
    	Disp:"Devuelve el número de columna interno de una referencia."
    },
    COLUMNS:{    
    	Syntax:"${0}(matriz)",
    	Disp:"Devuelve el número de columnas de una matriz o referencia."
    },
    COMBIN:{
    	Syntax:"${0}(número${1} número_elegido)",
    	Disp:"Devuelve el número de combinaciones de un número determinado de elementos. Utilice ${0} para determinar el número total posible de grupos para un número determinado de elementos."
    },
    CONCATENATE:{   
    	Syntax:"${0}(texto 1${1} ...)",
    	Disp:"Combina varias cadenas de caracteres en una sola."
    },
    CONVERT:{
    	Syntax:"${0}(número${1} de_unidad${1} a_unidad)",
    	Disp:"Convierte un número de un sistema de medida a otro.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gramo",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Libra (unidad de masa, avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unidad de masa atómica)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Onza (unidad de masa, avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metro",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Milla terrestre",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Pulgada",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Pie",
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
       		 label : "${0} - Año",
       		 result : "\"año\""
       	 }, {
       		 label : "${0} - Día",
       		 result : "\"día\""
       	 }, {
       		 label : "${0} - Hora",
       		 result : "\"h\""
       	 }, {
       		 label : "${0} - Minuto",
       		 result : "\"min\""
       	 }, {
       		 label : "${0} - Segundo",
       		 result : "\"s\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmósfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Milímetros de mercurio (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dina",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Libra (fuerza)",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Caloría IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electronvoltio",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Caballo de fuerza-hora",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Vatio-hora",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Pie-libra",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Caloría termodinámica",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Caballo de fuerza",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - Vatio",
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
       		 label : "${0} - Cucharadita",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Cucharada",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Onza fluida",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Taza",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Pinta de EE.UU.",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Pinta del Reino Unido",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galón",
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
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el coseno de un ángulo determinado."
    },
    COSH:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el coseno hiperbólico de un número."
    },
    COT:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve la cotangente de un número dado."
    },
    COTH:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve la cotangente hiperbólica de un número dado."
    },
    COUNT:{   
    	Syntax:"${0}(valor1${1} [valor2]${1} ...)",
    	Disp:"Cuenta cuántos números hay en la lista de argumentos. Las entradas de texto se ignoran."
    },
    COUNTA:{   
    	Syntax:"${0}(valor1${1} [valor2]${1} ...)",
    	Disp:"Cuenta cuántos valores haya en la lista de argumentos."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(rango)",
    	Disp: "Cuenta las celdas vacías en un rango especificado."
    },
    COUNTIF:{
    	Syntax: "${0}(rango${1} criterios)",
    	Disp:"Cuenta el número de celdas que cumplen la condición proporcionada."
    },
    COUNTIFS:{
    	Syntax: "${0}(rango_criterio1${1} criterio1${1} ...)",
    	Disp:"Cuenta el número de celdas que cumplen varias condiciones."
    },
    CUMIPMT:{	
	    Syntax:"${0}(tasa${1} nper${1} pv${1} período_ini${1} período_fin${1} tipo)",
	    Disp:"Calcula el interés acumulado pagado entre dos períodos especificados."
    },
    CUMPRINC:{	
	    Syntax:"${0}(tasa${1} nper${1} pv${1} período_ini${1} período_fin${1} tipo)",
	    Disp:"Calcula el principal acumulado pagado en un préstamo, entre dos períodos especificados."
    }, 
    DATE:{	
	    Syntax:"${0}(año${1} mes${1} día)",
	    Disp:"Devuelve el número interno de una fecha especificada."
    },  
    DATEDIF:{	
	    Syntax:"${0}(fecha inicio${1} fecha fin${1} formato)",
	    Disp:"Devuelve la diferencia en años, meses o días entre dos fechas.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - El número de años completos del período.",
	    		result: "\"A\""
	    	}, {
	    		label: "${0} - El número de meses completos del período.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - El número de días del período.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - El número de días entre fecha_inicio y fecha_fin, ignorando meses y años.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - El número de meses entre fecha_inicio y fecha_fin, ignorando años.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - El número de días entre fecha_inicio y fecha_fin, ignorando años.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(texto)",
	    Disp:"Devuelve un número interno para un texto con un posible formato de fecha."
    }, 
    DAY:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el día del valor de fecha proporcionado. El número de días que se produce como resultado está comprendido entre 1 y 31. También puede especificar un valor de fecha/hora negativo."
    },
    DAYS360:{
    	Syntax:"${0}(fecha_inicio${1} fecha_finalización${1} [método])",
    	Disp:"Calcula el número de días entre las dos fechas en base a un año de 360 días.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Método de EE.UU. (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Método europeo",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(fecha_inicio${1} fecha_finalización${1})",
    	Disp:"Calcula el número de días entre dos fechas."
    },
    DEC2BIN:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número decimal en un número binario."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número decimal en un número hexadecimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número decimal en un número octal."
    },
    DEGREES:{	
	    Syntax:"${0}(ángulo)",
	    Disp:"Convierte radianes en grados."
    },
    DISC:{
    	Syntax:"${0}(liquidación${1} vencimiento${1} pr${1} amortización${1} [base])",
    	Disp:"Calcula la tasa de descuento de un valor."
    }, 
    DOLLAR:{
    	Syntax:"${0}(número${1} [decimales])",
    	Disp:"Convierte un número en texto, con el formato de moneda $ (dólar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} meses)",
    	Disp:"Devuelve el número de serie que representa la fecha que es el número indicado de meses antes o después de start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} meses)",
    	Disp:"Devuelve el número de serie del último día del mes que es el número indicado de meses antes o después de start_date "
    },
    ERFC:{   
    	Syntax:"${0}(número)",
        Disp:"Devuelve la función de error complementaria, integrada entre un número y el infinito."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referencia)",
    	Disp:"Devuelve un número correspondiente a un tipo de error."
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
    	Disp:"Devuelve un número redondeado al alza al entero par más cercano."
    },
    EXACT:{    
    	Syntax:"${0}(texto 1${1} texto 2)",
    	Disp: "Compara dos cadenas de texto y devuelve TRUE si son iguales. Esta función es sensible a mayúsculas y minúsculas."
    },
    EXP:{    
    	Syntax:"${0}(número)",
    	Disp: "Devuelve la e alcanzada por el número determinado."
    },
    FACT:{  
    	Syntax:"${0}(número)",
    	Disp:"Calcula el factorial de un número."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(número)",
        Disp:"Devuelve el factorial doble de un número."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Devuelve el valor lógico FALSE."
    },
    FIND:{   
    	Syntax:"${0}texto búsqueda${1} texto${1} [posición])",
    	Disp:"Busca una cadena de texto dentro de otra (distingue entre mayúsculas y minúsculas)."
    },
    FIXED:{
    	Syntax:"${0}(números${1} [decimales]${1} [sin_comas])",
    	Disp:"Da formato a un número como texto con un número fijo de decimales.",
    	Arguments: {
    		2 : [{
    			label : "${0} - evitar comas",
    			result : "TRUE"
    		}, {
    			label : "${0} - no evitar comas",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(número${1} significancia)",
    	Disp:"Redondea un número a la baja al múltiplo significativo más cercano."
    },
    FORMULA:{   
    	Syntax:"${0}(referencia)",
    	Disp:"Devuelve la fórmula de una celda con fórmula."
    },
    FREQUENCY:{   
    	Syntax:"${0}(ListaSecuenciaNúmero_datos${1} ListaSecuenciaNúmero_bins)",
    	Disp:"Categoriza valores en intervalos y cuenta el número de valores de cada intervalo."
    },
    FV:{
    	Syntax:"${0}(tasa${1} nper${1} pmt${1} [pv]${1} [tipo])",
    	Disp:"Calcula el valor futuro de una inversión según un tipo de interés constante."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} planificación)",
        Disp:"Calcula el valor futuro de un principal inicial después de aplicar una serie de tasas de interés compuestas."
    },
    GAMMALN:{   
    	Syntax:"${0}(número)",
        Disp:"Devuelve el logaritmo natural de la función gamma."
    },
    GCD:{   
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
        Disp:"Devuelve el máximo común divisor de todos los argumentos."
    },
    HEX2BIN:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número hexadecimal en un número binario."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Convierte un número hexadecimal en un número decimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número hexadecimal en un número octal."
    },
    HOUR:{   
    	Syntax:"${0}(número)",
    	Disp:"Determina el número secuencial de la hora del día (0-23) para el valor de hora."
    },
    HLOOKUP:{   
    	Syntax:"${0}(criterio_búsqueda${1} matriz${1} Índice${1} [ordenado])",
    	Disp:"Búsqueda horizontal y referencia a las celdas ubicadas debajo.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Coincidencia aproximada",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Coincidencia exacta",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(enlace${1} [texto_celda])",
    	Disp:"Devuelve un enlace que apunta a un recurso de red o a un enlace que hace referencia a un rango. Si se proporciona, se muestra texto_celda (opcional), si no se muestra el enlace como texto."
    },    
    IF:{    
    	Syntax:"${0}(prueba${1} [valor_then]${1} [valor_otherwise])",
    	Disp:"Especifica una prueba lógica que debe llevarse a cabo."
    },
    IFS:{
    	Syntax:"${0}(prueba1${1} valor_si_verdadero1${1} ...)",
    	Disp:"Ejecuta pruebas lógicas para comprobar si se cumplen una o varias condiciones y devuelve un valor que cumple la primera condición TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(valor${1} valor_si_error)",
    	Disp:"Devuelve el valor que especifique si la expresión es un error. De lo contrario, devuelve el resultado de la expresión."
    },
    IFNA:{
    	Syntax:"${0}(valor${1} valor_si_na)",
    	Disp:"Devuelve el valor que especifique si la expresión devuelve el valor de error #N/A. De lo contrario, devuelve el resultado de la expresión."
    },
    INDEX:{    
    	Syntax:"${0}(referencia${1} fila${1} [columna]${1} [rango])",
    	Disp:"Devuelve una referencia a una celda de un rango definido."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [estilo_ref])",
    	Disp:"Devuelve los contenidos de una celda a la que se hace referencia en formato de texto.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - Estilo R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - Estilo A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(número)",
    	Disp:"Redondea un número hacia abajo hasta el número entero más próximo."
    },
    IPMT:{
    	Syntax:"${0}(tasa${1} per${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Calcula la cantidad de amortización de intereses para un período para una inversión basada en pagos regulares y una tasa de interés fija."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si la celda de referencia está en blanco, de lo contrario devuelve FALSE."
    },
    ISERR:{
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es un valor de error no igual a #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es un valor de error."
    },
    ISEVEN:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es par, de lo contrario devuelve FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referencia)",
    	Disp:"Devuelve TRUE si la celda es una celda de fórmula"
    },
    ISLOGICAL:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor tiene un número lógico."
    },
    ISNA:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es igual a #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve true si el valor no es texto."
    },
    ISNUMBER:{   
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es un número."
    },
    ISODD:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es un entero impar."
    },
    ISPMT:{
    	Syntax:"${0}(tasa${1} per${1} nper${1} pv)",
    	Disp:"Calcula el interés pagado durante un período especificado para una inversión."
    }, 
    ISREF:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es una referencia."
    },
    ISTEXT:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devuelve TRUE si el valor es texto."
    },
    LARGE:{
        Syntax:"${0}(matriz${1} n_posición)",
    	Disp:"Devuelve el enésimo valor más grande a partir de un conjunto de valores."
    },
    LCM:{   
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
        Disp:"Devuelve el mínimo común múltiplo de todos los números de la lista."
    },
    LEFT:{
        Syntax:"${0}(texto${1} [longitud])",
    	Disp:"Devuelve el número especificado de caracteres desde el inicio de un texto."
    },
    LEN:{
    	Syntax:"${0}(texto)",
    	Disp:"Devuelve la longitud de una cadena de texto."
    },
    LENB:{
    	Syntax:"${0}(texto)",
    	Disp:"Devuelve el número de bytes de una cadena de texto."
    },
    LN:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el logaritmo natural de un número."
    },
    LOG:{
    	Syntax:"${0}(número${1} [base])",
    	Disp:"Devuelve el logaritmo de un número en una base especificada."
    },
    LOG10:{
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el logaritmo en base 10 de un número."
    },
    LOOKUP:{
    	Syntax: "${0}(criterio búsqueda${1} vector búsqueda${1} [vector_resultado])",
    	Disp:"Determina el valor de un vector mediante la comparación de valores en otro vector."
    },
    LOWER:{    
    	Syntax:"${0}(texto)",
    	Disp:"Convierte el texto a minúsculas."
    },    
    MATCH:{    
    	Syntax: "${0}(buscar criterio${1} matriz_búsqueda${1} [tipo])",
    	Disp:"Define una posición en una matriz después de comparar los valores.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Menor que",
         		 result : 1
         	 }, {
         		 label : "${0} - Coincidencia exacta",
         		 result : 0
         	 }, {
         		 label : "${0} - Mayor que",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devuelve el valor máximo de una lista de argumentos."
    },
    MEDIAN:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devuelve el valor de en medio, si se proporciona un número impar de valores. De lo contrario, devuelve la media aritmética de los dos valores de en medio."
    },
    MID:{    
    	Syntax:"${0}(texto${1} número${1} número)",
    	Disp:"Devuelve una cadena de texto parcial."
    }, 
    MIN:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devuelve el valor mínimo de una lista de argumentos."
    },    
    MINUTE:{    
    	Syntax:"${0}(número)",
    	Disp:"Determina el número secuencial para el minuto de la hora (0-59) para el valor de tiempo."
    },    
    MOD:{    
    	Syntax:"${0}(número_dividido${1} divisor)",
    	Disp:"Devuelve el resto cuando el número dividido se divide entre el divisor."
    },
    MODE:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devuelve el valor más común de una muestra."
    },
    MONTH:{    
    	Syntax:"${0}(número)",
    	Disp:"Calcula el mes en función del valor de fecha especificado. El número de mes que se produce como resultado está comprendido entre 1 y 12."
    },
    MROUND:{   
    	Syntax: "${0}(número${1} múltiplo)",
        Disp:"Devuelve un número redondeado a un múltiplo especificado."
    },
    MMULT:{    
    	Syntax:"${0}(matriz${1} matriz)",
    	Disp:"Multiplicación de matrices. Devuelve el producto de dos matrices."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
        Disp:"Devuelve el coeficiente multinomial de un conjunto de números."
    },
    N:{    
    	Syntax:"${0}(valor)",
    	Disp:"Convierte un valor en un número."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Esta función define una de las celdas con el valor de error #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(fecha_inicio${1} fecha fin${1} [vacaciones])",
    	Disp:"Devuelve el número de días laborables entre dos fechas."
    },
    NOT:{    
    	Syntax:"${0}(valor lógico)",
    	Disp:"Anula el valor del argumento."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Determina la hora actual del sistema."
    },
    NPV:{   
    	Syntax:"${0}(tasa${1} valor 1${1} [valor 2]${1} ...)",
        Disp:"Calcula el valor neto actual de una inversión según una tasa de descuento proporcionada y una serie de pagos y renta futuros."
    },
    OCT2BIN:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número octal en un número binario."
    },
    OCT2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Convierte un número octal en un número decimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(número${1} [posiciones])",
    	Disp:"Convierte un número octal en un número hexadecimal."
    },
    ODD:{    
    	Syntax:"${0}(número)",
    	Disp:"Redondea un número al alza al entero impar más cercano, donde \"up\" significa \"away from 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(referencia${1} filas${1} cols${1} [altura]${1} [anchura])",
    	Disp:"Devuelve una referencia a un rango que es un número determinado de filas y columnas de una celda o un área de celdas."
    },
    OR:{    
    	Syntax:"${0}(valor lógico 1${1} [valor lógico 2]${1} ...)",
    	Disp:"El resultado es TRUE si por lo menos un argumento es TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Devuelve el valor aproximado de Pi."
    },
    PMT:{
    	Syntax:"${0}(tasa${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Devuelve el pago para un préstamo basado en pagos regulares y una tasa de interés fija."
    },
    POWER:{    
    	Syntax:"${0}(base${1} potencia)",
    	Disp:"Eleva un número a la potencia de otro."
    },
    PPMT:{
    	Syntax:"${0}(tasa${1} per${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Calcula la cantidad de amortización para un período para una inversión basada en pagos regulares y una tasa de interés fija."
    },
    PRICEDISC:{
    	Syntax:"${0}(liquidación${1} vencimiento${1} descuento${1} amortización${1} [base])",
    	Disp:"Calcula el precio por un valor nominal de 100 dólares de un valor descontado."
    },
    PRICEMAT:{
    	Syntax:"${0}(liquidación${1} vencimiento${1} emisión${1} tasa${1} yld${1} [base])",
    	Disp:"Calcula el precio por un valor nominal de 100 dólares que paga intereses al vencimiento."
    },
    PRODUCT:{   
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Multiplica todos los números indicados como argumentos y devuelve el producto."
    },
    PROPER:{    
    	Syntax:"${0}(texto)",
    	Disp:"Convierte una cadena de texto a mayúsculas y minúsculas correctas, la primera letra de cada palabra en mayúsculas y el resto en minúsculas."
    },
    PV:{
    	Syntax:"${0}(tasa${1} nper${1} pmt${1} [fv]${1} [tipo])",
    	Disp:"Calcula el valor actual de una inversión según una serie de pagos futuros."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerador${1} denominador)",
        Disp:"Devuelve el resultado de un número dividido por otro número, truncado a un entero."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Devuelve un número aleatorio entre 0 y 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(inferior${1} superior)",
    	Disp: "Devuelve un entero aleatorio entre los números especificados."
    },
    RANK:{    
    	Syntax:"${0}(número${1} ref${1} [orden])",
    	Disp: "Devuelve la clasificación de un valor en una muestra.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Descendente",
          		 result : 0
          	 }, {
          		 label : "${0} - Ascendente",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(liquidación${1} vencimiento${1} inversión${1} descuento${1} [base])",
    	Disp:"Calcula la cantidad recibida al vencimiento para un valor invertido completamente."
    }, 
    REPLACE:{    
    	Syntax: "${0}(texto${1} posición${1} longitud${1} texto_nuevo)",
    	Disp:"Reemplaza los caracteres dentro de una serie de texto por una serie de texto distinta."	
    },
    REPT:{    
    	Syntax: "${0}(texto${1} recuento)",
    	Disp:"Repite el texto un número de veces determinado."	
    },
    RIGHT:{
    	Syntax: "${0}(texto${1} [número])",
    	Disp:"Devuelve el último carácter o los últimos caracteres de un texto."
    },
    RIGHTB:{
    	Syntax: "${0}(texto${1} [número])",
    	Disp:"Devuelve el último carácter o los últimos caracteres de un texto."
    },
    ROUND:{   
    	Syntax: "${0}(número${1} recuento)",
    	Disp:"Redondea un número según la precisión predefinida."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(número${1} recuento)",
    	Disp:"Redondea un número hacia abajo, en dirección hacia cero."
    },
    ROUNDUP:{   
    	Syntax: "${0}(número${1} recuento)",
    	Disp:"Redondea un número al alza en dirección hacia cero."
    },
    ROW:{   
    	Syntax:"${0}([referencia])",
    	Disp:"Define el número de fila interno de una referencia."
    },
    ROWS:{   
    	Syntax:"${0}(matriz)",
    	Disp:"Determina el número de filas de una referencia o una matriz."
    },
    RADIANS:{   
    	Syntax:"${0}(ángulo)",
    	Disp:"Convierte grados en radianes."
    },
    ROMAN:{   
    	Syntax:"${0}(número${1} [formato])",
    	Disp:"Convierte un numeral árabe en romano, como texto.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Clásico",
          		 result : 0
          	 }, {
          		 label : "${0} - Más conciso",
          		 result : 1
          	 }, {
          		 label : "${0} - Más conciso",
          		 result : 2
          	 }, {
          		 label : "${0} - Más conciso",
          		 result : 3
          	 }, {
          		 label : "${0} - Simplificado",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}texto búsqueda${1} texto${1} [posición])",
    	Disp:"Busca un valor de texto dentro de otro (no sensible a mayúsculas o minúsculas)."
    },  
    SIGN:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve el signo algebraico de un número."
    },
    SIN:{    
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el seno de un ángulo determinado."
    },
    SINH:{    
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el seno hiperbólico de un número."
    },
    SECOND:{    
    	Syntax:"${0}(número)",
    	Disp:"Determina el número secuencial para el segundo del minuto (0-59) para el valor de tiempo."
    },
    SERIESSUM:{    
    	Syntax:"${0}(coeficientes x${1} n${1} m${1})",
        Disp:"Devuelve la suma de una serie de potencias basada en la fórmula."
    },
    SHEET:{   
    	Syntax:"${0}([referencia])",
    	Disp:"Devuelve el número de hoja interno de una referencia o serie."
    },
    SMALL:{   
    	Syntax:"${0}(matriz${1} n_posición)",
    	Disp:"Devuelve el enésimo valor más pequeño a partir de un conjunto de valores."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(texto${1} antiguo${1} nuevo${1} [anchura])",
    	Disp:"Devuelve texto en el que un texto anterior se sustituye por un nuevo texto."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(función${1} rango${1} ...)",
    	Disp:"Devuelve un subtotal en una hoja de cálculo.",
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
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
    	Disp:"Devuelve la suma de todos los argumentos."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matriz 1${1} [matriz 2]${1} ...)",
    	Disp:"Devuelve la suma de los productos de los argumentos de la matriz."
    },
    SUMIF:{   
    	Syntax:"${0}(rango${1} criterios${1} [rango de suma])",
    	Disp:"Indica el total de argumentos que cumplen las condiciones."
    },
    SUMIFS:{
    	Syntax: "${0}(rango_suma${1} rango_criterio1${1} criterio1${1} ...)",
    	Disp:"Indica el total de argumentos que cumplen varias condiciones."
    },
    SQRT:{   
    	Syntax:"${0}(número)",
    	Disp:"Devuelve la raíz cuadrada de un número."
    },
    SQRTPI:{   
    	Syntax:"${0}(número)",
        Disp:"Devuelve la raíz cuadrada del (número * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Calcular la desviación estándar de una muestra."
    },
    STDEVP:
    {
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Calcular la desviación estándar basada en toda la población."
    },
    SUMSQ:{
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
        Disp:"Devuelve la suma de los cuadrados de los números de la lista."
    },
    T:{
    	Syntax:"${0}(texto)",
    	Disp:"Convierte sus argumentos en texto."
    },
    TAN:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve la tangente del número especificado."
    },
    TANH:{    
    	Syntax:"${0}(número)",
        Disp:"Devuelve la tangente hiperbólica del número especificado."
    },
    TBILLPRICE:{
    	Syntax:"${0}(liquidación${1} vencimiento${1} descuento)",
    	Disp:"Calcula el precio por un valor nominal de 100 dólares para una letra del tesoro."
    },
    TEXT:{
    	Syntax:"${0}(valor${1} código_formato)",
    	Disp:"Convierte el valor en un texto según las reglas de un código de formato numérico y lo devuelve."
    },
    TIME:{   
    	Syntax:"${0}(hora${1} minuto${1} segundo)",
    	Disp:"Determina un valor de hora a partir de los detalles de hora, minuto y segundo."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(texto)",
	    Disp:"Devuelve un número interno para un texto con un posible formato horario."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determina la fecha actual del equipo."
    },    
    TRIM:{
    	Syntax:"${0}(texto)",
    	Disp:"Elimina todos los espacios delanteros y trasero. Cualquier otra secuencia de 2 o más espacios internos se sustituyen por un único espacio."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Devuelve el valor lógico TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(número${1} [recuento])",
    	Disp:"Trunca las posiciones decimales de un número."
    },
    TYPE:{   
    	Syntax:"${0}(valor)",
    	Disp:"Define el tipo de datos de un valor."	
    },
    UPPER:{  
    	Syntax: "${0}(texto)",
    	Disp:"Convierte el texto a mayúsculas."
    },
    VALUE:{    
    	Syntax: "${0}(texto)",
    	Disp:"Convierte un argumento de texto en un número."
    },
    VAR:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Hace una estimación de la varianza según un ejemplo."
    },
    VARA:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Hace una estimación de la varianza según un ejemplo, incluyendo números, texto y valores lógicos."
    },
    VARP:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Calcula la varianza según toda la población."
    },
    VARPA:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Calcula la varianza según toda la población, incluyendo números, texto y valores lógicos."
    },
    VLOOKUP:{    
    	Syntax: "${0}(criterio búsqueda${1} matriz${1} índice${1} [orden de clasificación])",
    	Disp:"Búsqueda vertical y referencia a las celdas indicadas.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Coincidencia aproximada",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Coincidencia exacta",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(número${1} [tipo])",
    	Disp:"Calcula el día de la semana en el valor de fecha como un entero.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Números 1 (domingo) a 7 (sábado)",
          		 result : 1
          	 }, {
          		 label : "${0} - Números 1 (lunes) a 7 (domingo)",
          		 result : 2
          	 }, {
          		 label : "${0} - Números 0 (lunes) a 6 (domingo)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Números 1 (lunes) a 7 (domingo)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Números 1 (martes) a 7 (lunes)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Números 1 (miércoles) a 7 (martes)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Números 1 (jueves) a 7 (miércoles)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Números 1 (viernes) a 7 (jueves)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Números 1 (sábado) a 7 (viernes)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Números 1 (domingo) a 7 (sábado)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(número${1} [modalidad])",
    	Disp:"Calcula la semana del año correspondiente a la fecha especificada.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Domingo",
          		 result : 1
          	 }, {
          		 label : "${0} - Lunes",
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
    	Syntax:"${0}(fecha de inicio${1} días${1} [vacaciones])",
    	Disp:"Devuelve el número de serie de una fecha anterior o posterior a un número de días laborables especificados."
    },
    XNPV:{   
    	Syntax:"${0}(tasa${1} valores${1} fechas)",
    	Disp:"Calcula el valor neto actual para una planificación de flujos de caja."
    },
    YEAR:{    
    	Syntax:"${0}(número)",
    	Disp:"Devuelve el año de un valor de fecha como entero."
    }
}
})

