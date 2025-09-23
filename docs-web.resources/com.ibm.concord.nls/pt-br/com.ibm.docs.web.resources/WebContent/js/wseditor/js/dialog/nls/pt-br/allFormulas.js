/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Todas as Fórmulas",
	LABEL_FORMULA_LIST: "Lista de fórmulas:",
	formula:{
	ABS:{	
	    Syntax:"${0}(number)",
	    Disp:"Retorna o valor absoluto de um número."
    },
    ACOS:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o arco cosseno de um número. O ângulo é retornado em radianos."
    },
    ACOSH:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o cosseno hiperbólico inverso de um número."
    },
    ACOT:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna a cotangente inversa de um número. O ângulo é medido em radianos."
    },
    ACOTH:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna a cotangente hiperbólica inversa de um número."
    },
    ADDRESS:{
         Syntax:"${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"Retorna a referência para uma célula como texto.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absoluto",
        		 result : 1
        	 }, {
        		 label : "${0} - Linha absoluta / Coluna relativa",
        		 result : 2
        	 }, {
        		 label : "${0} - Linha relativa / Coluna Absoluta",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativo",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - estilo R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - estilo A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Retorna TRUE se todos os argumentos forem VERDADEIROS."
    },
    ASIN:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o arco seno de um número. O ângulo é retornado em radianos."
    },
    ASINH:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o seno hiperbólico inverso de um número."
    },
    ATAN:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o arco tangente de um número. O ângulo é retornado em radianos."
    },
    AVERAGE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Retorna a média dos argumentos."
    },
    AVERAGEA:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Retorna o valor médio de uma amostra. O texto é avaliado como zero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(range${1} criteria${1} [average_range])",
    	Disp:"Retorna a média (média aritmética) dos argumentos que atendem à condição dada."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(average_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Retorna a média (média aritmética) dos argumentos que atendem a várias condições."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Retorna o arco tangente, ou tangente inverso, das coordenadas x e y especificadas. O arco tangente é o ângulo do eixo x para uma linha que contém a origem (0, 0) e um ponto com as coordenadas (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna a tangente hiperbólica inversa de um número. O número deve estar entre -1 e 1 (excluindo -1 e 1)."
    },
    BASE:{    
    	Syntax:"${0}(number${1} radix${1} [minimum length])",
    	Disp:"Converte um número inteiro positivo para texto de um sistema numérico para a base definida."
    },
    BIN2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Converte um número binário em um número decimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número binário em um número hexadecimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número binário em um número octal."
    },
    CEILING:{  
    	Syntax: "${0}(number${1} increment)",
    	Disp:"Arredonda um número para o número inteiro mais próximo ou para múltiplos de significância."
    },
    CHAR: {
    	Syntax: "${0}(number)",
    	Disp: "Retorna um caractere mapeado pelo número. Ele localiza o caractere no mapa de caracteres Unicode. O número está entre 1 e 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} value1${1} [value2]${1} ...)",
    	Disp: "Localiza e retorna o valor correspondente de acordo com o índice. Ele pode ESCOLHER até 30 valores."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Retorna um código numérico para o primeiro caractere em uma sequência de texto codificada em unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"Retorna o número da coluna interna de uma referência."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Retorna o número de colunas em uma matriz ou referência."
    },
    COMBIN:{
    	Syntax:"${0}(number${1} number_chosen)",
    	Disp:"Retorna o número de combinações para um número de itens específico. Use ${0} para determinar o número de grupos total possível para um número de itens específico."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Combina várias sequências de texto em uma sequência."
    },
    CONVERT:{
    	Syntax:"${0}(number${1} from_unit${1} to_unit)",
    	Disp:"Converte um número de um sistema de medida para outro.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Grama",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Massa em libras (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unidade de massa atômica)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Massa em onças (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metro",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Milha de estatuto",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Polegada",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Pé",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Jarda",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - paica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Ano",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Dia",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Hora",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minuto",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Segundo",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atomosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milímetros de Mercúrio (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dina",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Força em libras",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - calorias de TI",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Cavalos-vapor-hora",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-hora",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Pé-libra",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Caloria termodinâmica",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Cavalo-vapor",
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
       		 label : "${0} - Grau Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Grau Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Colher de chá",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Colher de sopa",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Onça líquida",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Xícara",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - ponto E.U.A.",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - ponto U.K.",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galão",
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
    	Syntax:"${0}(number)",
    	Disp:"Retorna o cosseno do ângulo fornecido."
    },
    COSH:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o cosseno hiperbólico de um número."
    },
    COT:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna a cotangente de um determinado número."
    },
    COTH:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna a cotangente hiperbólica de um determinado número."
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Conta quantos números estão na lista de argumentos. Entradas de texto são ignoradas."
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Conta quantos valores estão na lista de argumentos."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(range)",
    	Disp: "Conta as células em branco em um intervalo especificado."
    },
    COUNTIF:{
    	Syntax: "${0}(range${1} criteria)",
    	Disp:"Conta o número de células que atendem à condição dada."
    },
    COUNTIFS:{
    	Syntax: "${0}(criteria_range1${1} criteria1${1} ...)",
    	Disp:"Conta o número de células que atendem a várias condições."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"Calcula o juros acumulativo pago entre dois períodos especificados."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"Calcula o principal acumulativo pago em um empréstimo, entre dois períodos especificados."
    }, 
    DATE:{	
	    Syntax:"${0}(year${1} month${1} day)",
	    Disp:"Fornece um número interno para a data determinada."
    },  
    DATEDIF:{	
	    Syntax:"${0}(start date${1} end date${1} format)",
	    Disp:"Retorna a diferença em anos, meses ou dias entre duas datas.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - O número de anos completos no período.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - O número de meses completos no período.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - O número de dias no período.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - O número de dias entre a data de início e a data de encerramento, ignorando meses e anos.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - O número de meses entre a data de início e a data de encerramento, ignorando anos.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - O número de dias entre a data de início e a data de encerramento, ignorando anos.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Retorna um número interno para um texto que possui um formato de data possível."
    }, 
    DAY:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o dia do valor da data determinada. O dia é retornado como um número inteiro entre 1 e 31. Você também pode inserir um valor de data/hora negativo."
    },
    DAYS360:{
    	Syntax:"${0}(start_date${1} end_date${1} [method])",
    	Disp:"Calcula o número de dias entre duas datas com base em um ano de 360 dias.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Método (NASD) U.S.",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Método Europeu",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(start_date${1} end_date${1})",
    	Disp:"Calcula o número de dias entre duas datas."
    },
    DEC2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número decimal em um número binário."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número decimal em um número hexadecimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número decimal em um número octal."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"Converte radianos em graus."
    },
    DISC:{
    	Syntax:"${0}(settlement${1} maturity${1} pr${1} redemption${1} [basis])",
    	Disp:"Calcula a taxa de desconto para uma segurança."
    }, 
    DOLLAR:{
    	Syntax:"${0}(number${1} [decimals])",
    	Disp:"Converte um número em texto, usando o formato de moeda $ (dólar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"Retorna o número de série que representa a data que é a quantidade indicada de meses anteriores ou posteriores a start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"Retorna o número de série para o último dia do mês que é o número indicado de meses anteriores ou posteriores a start_date"
    },
    ERFC:{   
    	Syntax:"${0}(number)",
        Disp:"Retorna a função complementar de erro integrada entre um número e o infinito."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"Retorna um número correspondente a um tipo de erro."
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
    	Disp:"Retorna um número arredondado para o número inteiro par mais próximo."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Compara duas sequências e retorna TRUE se elas forem idênticas. Essa função faz distinção entre maiúsculas e minúsculas."
    },
    EXP:{    
    	Syntax:"${0}(number)",
    	Disp: "Retorna e elevado a um determinado número."
    },
    FACT:{  
    	Syntax:"${0}(number)",
    	Disp:"Calcula o fator de um número."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(number)",
        Disp:"Retorna o duplo fatorial de um número."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Retorna o valor lógico como FALSE."
    },
    FIND:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Procura uma sequência de texto em outra (faz distinção entre maiúsculas e minúsculas)."
    },
    FIXED:{
    	Syntax:"${0}(number${1} [decimals]${1} [no_commas])",
    	Disp:"Formata um número como texto com um número fixo de decimais.",
    	Arguments: {
    		2 : [{
    			label : "${0} - evitar vírgulas",
    			result : "TRUE"
    		}, {
    			label : "${0} - não evitar vírgulas",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(number${1} significance)",
    	Disp:"Arredonda um número para baixo para o múltiplo mais próximo de significância."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"Retorna a fórmula de uma célula de fórmula."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Categoriza os valores em intervalos e conta o número de valores em cada intervalo."
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"Calcula o valor futuro de um investimento com base em uma taxa de juros constante."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} planejamento)",
        Disp:"Calcula o valor futuro de um principal inicial, após aplicar uma série de taxas de juros compostos."
    },
    GAMMALN:{   
    	Syntax:"${0}(number)",
        Disp:"Retorna um logaritmo natural da função gama."
    },
    GCD:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"Retorna o maior divisor comum de todos os argumentos."
    },
    HEX2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número hexadecimal em um número binário."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Converte um número hexadecimal em um número decimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número hexadecimal em um número octal."
    },
    HOUR:{   
    	Syntax:"${0}(number)",
    	Disp:"Determina o número sequencial da hora do dia (0 a 23) para o valor de tempo."
    },
    HLOOKUP:{   
    	Syntax:"${0}(search_criteria${1} array${1} Index${1} [sorted])",
    	Disp:"Procura horizontal e referência para as células localizadas abaixo.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Correspondência aproximada",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Correspondência exata",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [cell_text])",
    	Disp:"Retorna um link que aponta para um recurso de rede ou para um intervalo referenciado pelo link. Exibe cell_text (opcional) caso seja fornecido ou exibe o link como texto."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_value]${1} [otherwise_value])",
    	Disp:"Especifica um teste lógico a ser executado."
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)",
    	Disp:"Executa testes lógicos para verificar se uma ou mais condições foram atendidas e retorna um valor que corresponde à primeira condição TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(value${1} value_if_error)",
    	Disp:"Retornará o valor que você especificar se a expressão for um erro. Caso contrário, retornará o resultado da expressão."
    },
    IFNA:{
    	Syntax:"${0}(value${1} value_if_na)",
    	Disp:"Retornará o valor que você especificar se a expressão retornar o valor de erro #N/A. Caso contrário, retornará o resultado da expressão."
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} row${1} [column]${1} [range])",
    	Disp:"Retorna uma referência para uma célula de um intervalo definido."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"Retorna o conteúdo de uma célula que é mencionada no formulário de texto.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - estilo R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - estilo A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(number)",
    	Disp:"Arredonda um número para baixo para o número inteiro mais próximo."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Calcula a quantia de reembolso de juros em um período, para um investimento com base em pagamentos regulares e uma taxa de juros fixa."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se a célula referida estiver em branco, caso contrário, retorna FALSE."
    },
    ISERR:{
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for um valor de erro que não seja igual a #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for um valor com erro."
    },
    ISEVEN:{    
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for par, caso contrário, retorna FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"Retorna TRUE se a célula for uma célula de fórmula."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor contiver um número lógico."
    },
    ISNA:{    
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for igual a #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(value)",
    	Disp:"Retorna True se o valor não for texto."
    },
    ISNUMBER:{   
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for um número."
    },
    ISODD:{    
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for um número inteiro ímpar."
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"Calcula os juros pagos durante um período especificado para um investimento."
    }, 
    ISREF:{    
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for uma referência."
    },
    ISTEXT:{    
    	Syntax:"${0}(value)",
    	Disp:"Retorna TRUE se o valor for texto."
    },
    LARGE:{
        Syntax:"${0}(array${1} nth_position)",
    	Disp:"Retorna o enésimo maior valor de um conjunto de valores."
    },
    LCM:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"Retorna o mínimo múltiplo comum de todos os números da lista."
    },
    LEFT:{
        Syntax:"${0}(text${1} [length])",
    	Disp:"Retorna o número especificado de caracteres do início de um texto."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Retorna o comprimento de uma sequência de texto."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Retorna o número de bytes de uma sequência de texto."
    },
    LN:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o logaritmo natural de um número."
    },
    LOG:{
    	Syntax:"${0}(number${1} [base])",
    	Disp:"Retorna o logaritmo de um número em uma base especificada."
    },
    LOG10:{
    	Syntax:"${0}(number)",
    	Disp:"Retorna o logaritmo base-10 de um número."
    },
    LOOKUP:{
    	Syntax: "${0}(search criterion${1} search vector${1} [result_vector])",
    	Disp:"Determina um valor em um vetor por comparação com valores em outro vetor."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converte texto em minúscula."
    },    
    MATCH:{    
    	Syntax: "${0}(search criterion${1} lookup_array${1} [type])",
    	Disp:"Define uma posição em uma matriz após comparar valores.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Menos do que",
         		 result : 1
         	 }, {
         		 label : "${0} - Correspondência exata",
         		 result : 0
         	 }, {
         		 label : "${0} - Maior do que",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Retorna o valor máximo em uma lista de argumentos."
    },
    MEDIAN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Retorna o valor médio, se for determinado um número ímpar de valores. Caso contrário, retorna a média aritmética dos dois valores médios."
    },
    MID:{    
    	Syntax:"${0}(text${1} number${1} number)",
    	Disp:"Retorna uma sequência de texto parcial de um texto."
    }, 
    MIN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Retorna o valor mínimo em uma lista de argumentos."
    },    
    MINUTE:{    
    	Syntax:"${0}(number)",
    	Disp:"Determina o número sequencial do minuto da hora (0 a 59) para o valor de tempo."
    },    
    MOD:{    
    	Syntax:"${0}(divided_number${1} divisor)",
    	Disp:"Retorna o resto quando o número dividido é dividido pelo divisor."
    },
    MODE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Retorna o valor mais comum em uma amostra."
    },
    MONTH:{    
    	Syntax:"${0}(number)",
    	Disp:"Retorna o mês de um determinado valor de data. O mês é retornado como um número inteiro entre 1 e 12."
    },
    MROUND:{   
    	Syntax: "${0}(number${1} multiple)",
        Disp:"Retorna um número arredondado para um múltiplo específico."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Multiplicação de matriz. Retorna o produto de duas matrizes."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"Retorna o coeficiente multinomial de um conjunto de números."
    },
    N:{    
    	Syntax:"${0}(value)",
    	Disp:"Converte um valor em um número."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Retorna o valor de erro #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(start date${1} end date${1} [holidays])",
    	Disp:"Retorna o número de dias úteis entre duas datas."
    },
    NOT:{    
    	Syntax:"${0}(logical value)",
    	Disp:"Retorna o valor do argumento."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Determina o horário atual do computador."
    },
    NPV:{   
    	Syntax:"${0}(rate${1} value 1${1} [value 2]${1} ...)",
        Disp:"Calcula o valor presente líquido de um investimento, com base em uma taxa de desconto fornecida e em uma série de futuros pagamentos e receitas."
    },
    OCT2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número octal em um número binário."
    },
    OCT2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"Converte um número octal em um número decimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"Converte um número octal em um número hexadecimal."
    },
    ODD:{    
    	Syntax:"${0}(number)",
    	Disp:"Arredonda um número para cima para o número inteiro ímpar mais próximo, em que \"para cima\" significa \"distante de 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rows${1} cols${1} [height]${1} [width])",
    	Disp:"Retorna uma referência a um intervalo que é um número especificado de linhas e colunas a partir de uma célula ou intervalo de células."
    },
    OR:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Retorna TRUE se pelo menos um argumento for VERDADEIRO."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Retorna o valor aproximado de Pi."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Retorna o pagamento de um empréstimo com base em pagamentos regulares e uma taxa de juros fixa."
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)",
    	Disp:"Aumenta um número à potência do outro."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Calcula a quantia a ser reembolsada em um período, para um investimento com base em pagamentos regulares e uma taxa de juros fixa."
    },
    PRICEDISC:{
    	Syntax:"${0}(settlement${1} maturity${1} discount${1} redemption${1} [basis])",
    	Disp:"Calcula o preço por valor nominal de R$100 de uma segurança descontada."
    },
    PRICEMAT:{
    	Syntax:"${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [basis])",
    	Disp:"Calcula o preço por valor nominal de R$100 de uma segurança que paga juros na data de vencimento."
    },
    PRODUCT:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Multiplica todos os números fornecidos como argumentos e retorna o produto."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converte uma sequência de texto no tamanho de letra adequado, a primeira letra de cada palavra em maiúscula e todas as outras letras em minúscula."
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"Calcula o valor presente de um investimento, com base em uma série de pagamentos futuros."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerator${1} denominator)",
        Disp:"Retorna o resultado de uma divisão de um número por outro truncado para um número inteiro."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Retorna um número aleatório entre 0 e 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)",
    	Disp: "Retorna um número inteiro aleatório entre os números especificados."
    },
    RANK:{    
    	Syntax:"${0}(number${1} ref${1} [order])",
    	Disp: "Retorna a classificação de um valor na amostra.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Decrescente",
          		 result : 0
          	 }, {
          		 label : "${0} - Ascendente",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])",
    	Disp:"Calcula a quantia recebida no vencimento para uma segurança totalmente investida."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} position${1} length${1} new text)",
    	Disp:"Substitui caracteres em uma sequência de texto por uma sequência de texto diferente."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} count)",
    	Disp:"Repete o texto um determinado número de vezes."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"Retorna o(s) último(s) caractere(s) do texto."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"Retorna o(s) último(s) caractere(s) do texto."
    },
    ROUND:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Arredonda um número para uma precisão predefinida."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Arredonda um número para baixo para uma precisão predefinida."
    },
    ROUNDUP:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Arredonda um número para cima para uma precisão predefinida."
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"Define o número da linha interna de uma referência."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Retorna o número de linhas em uma matriz ou referência."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"Converte graus em radianos."
    },
    ROMAN:{   
    	Syntax:"${0}(number${1} [form])",
    	Disp:"Converte um numeral arábico em romano, como texto.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Clássico",
          		 result : 0
          	 }, {
          		 label : "${0} - Mais conciso",
          		 result : 1
          	 }, {
          		 label : "${0} - Mais conciso",
          		 result : 2
          	 }, {
          		 label : "${0} - Mais conciso",
          		 result : 3
          	 }, {
          		 label : "${0} - Simplificado",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Procura por um valor de texto em outro (não faz distinção de maiúsculas e minúsculas)."
    },  
    SIGN:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna um símbolo algébrico de um número."
    },
    SIN:{    
    	Syntax:"${0}(number)",
    	Disp:"Retorna o seno do ângulo fornecido."
    },
    SINH:{    
    	Syntax:"${0}(number)",
    	Disp:"Retorna o seno hiperbólico de um número."
    },
    SECOND:{    
    	Syntax:"${0}(number)",
    	Disp:"Determina o número sequencial do segundo do minuto (0 a 59) para o valor de tempo."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficients)",
        Disp:"Retorna a soma de uma série de potências baseada na fórmula."
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"Retorna o número da planilha interna de uma referência ou sequência."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} nth_position)",
    	Disp:"Retorna o enésimo menor valor de um conjunto de valores."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} old${1} new${1} [which])",
    	Disp:"Retorna o texto no qual um texto antigo é substituído por um novo texto."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"Calcula os subtotais em uma planilha.",
    	Arguments: {
    		0 : [{
    			label : "${0} - MÉDIA",
    			result : 1
    		}, {
    			label : "${0} - CONTAGEM",
    			result: 2
    		}, {
    			label : "${0} - CONTAGEM",
    			result: 3
    		}
    		, {
    			label : "${0} - MÁX",
    			result: 4
    		}
    		, {
    			label : "${0} - MÍN",
    			result: 5
    		}
    		, {
    			label : "${0} - PRODUTO",
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
    			label : "${0} - SOMA",
    			result: 9
    		}
    		, {
    			label : "${0} - VAR",
    			result: 10
    		}, {
    			label : "${0} - VARP",
    			result: 11
    		}, {
    			label : "${0} - MÉDIA",
    			result: 101
    		}, {
    			label : "${0} - CONTAGEM",
    			result: 102
    		}, {
    			label : "${0} - CONTAGEM",
    			result: 103
    		}, {
    			label : "${0} - MÁX",
    			result: 104
    		}, {
    			label : "${0} - MÍN",
    			result: 105
    		}, {
    			label : "${0} - PRODUTO",
    			result: 106
    		}, {
    			label : "${0} - STDEV",
    			result: 107
    		}, {
    			label : "${0} - STDEVP",
    			result: 108
    		}, {
    			label : "${0} - SOMA",
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
    	Disp:"Retorna a soma de todos os argumentos."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Retorna a soma dos produtos dos argumentos da matriz."
    },
    SUMIF:{   
    	Syntax:"${0}(range${1} criteria${1} [sum range])",
    	Disp:"Totais dos argumentos que atendem às condições."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Totaliza os argumentos que atendem a várias ondições."
    },
    SQRT:{   
    	Syntax:"${0}(number)",
    	Disp:"Retorna a raiz quadrada de um número."
    },
    SQRTPI:{   
    	Syntax:"${0}(number)",
        Disp:"Retorna a raiz quadrada de (número * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Calcula o desvio padrão com base em uma amostra."
    },
    STDEVP:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Calcula o desvio padrão com base em uma população inteira."
    },
    SUMSQ:{
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
        Disp:"Retorna a soma dos quadrados dos números da lista."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Converte seus argumentos em texto."
    },
    TAN:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna a tangente de um determinado número."
    },
    TANH:{    
    	Syntax:"${0}(number)",
        Disp:"Retorna a tangente hiperbólica de um determinado número."
    },
    TBILLPRICE:{
    	Syntax:"${0}(settlement${1} maturity${1} discount)",
    	Disp:"Calcula o preço por valor nominal de R$100 para um Título do Tesouro."
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)",
    	Disp:"Converte o valor em um texto de acordo com as regras de um código de formato numérico e o retorna."
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)",
    	Disp:"Determina um valor de tempo a partir dos detalhes de hora, minuto e segundo."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Retorna um número interno para um texto que possui um formato de data possível."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determina a data atual do computador."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Remove todos os espaços à esquerda e à direita. Qualquer outra sequência de dois ou mais espaços internos será substituída por um espaço único."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Retorna o valor lógico TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(number${1} [count])",
    	Disp:"Trunca os decimais de um número."
    },
    TYPE:{   
    	Syntax:"${0}(value)",
    	Disp:"Define o tipo de dado de um valor."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Converte texto em maiúscula."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Converte um argumento de texto em um número."
    },
    VAR:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Estima a variação com base em uma amostra."
    },
    VARA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Estima a variação com base em uma amostra, incluindo números, texto e valores lógicos."
    },
    VARP:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Calcula a variação com base no preenchimento inteiro."
    },
    VARPA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Calcula a variação com base no preenchimento inteiro, incluindo números, texto e valores lógicos."
    },
    VLOOKUP:{    
    	Syntax: "${0}(search criterion${1} array${1} index${1} [sort order])",
    	Disp:"Procura vertical e referência para células indicadas.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Correspondência aproximada",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Correspondência exata",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(number${1} [type])",
    	Disp:"Retorna o dia da semana para o valor de data como um número inteiro.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Números 1 (Domingo) a 7 (Sábado)",
          		 result : 1
          	 }, {
          		 label : "${0} - Números 1 (Segunda) a 7 (Domingo)",
          		 result : 2
          	 }, {
          		 label : "${0} - Números 0 (Segunda) a 6 (Domingo)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Números 1 (Segunda) a 7 (Domingo)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Números 1 (Terça-feira) a 7 (Segunda)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Números 1 (Quarta-feira) a 7 (Terça-feira)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Números 1 (Terça-feira) a 7 (Quarta-feira)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Números 1 (Sexta-feira) a 7 (Terça-feira)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Números 1 (Sábado) a 7 (Sexta-feira)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Números 1 (Domingo) a 7 (Sábado)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(number${1} [mode])",
    	Disp:"Calcula a semana do calendário correspondente à data determinada.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Domingo",
          		 result : 1
          	 }, {
          		 label : "${0} - Segunda-feira",
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
    	Disp:"Retorna o número de série da data antes ou após um número especificado de dias úteis."
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} values${1} dates)",
    	Disp:"Calcula o valor presente líquido para um planejamento de fluxos de caixa."
    },
    YEAR:{    
    	Syntax:"${0}(number)",
    	Disp:"Retorna o ano de um valor de data como um número inteiro."
    }
}
})

