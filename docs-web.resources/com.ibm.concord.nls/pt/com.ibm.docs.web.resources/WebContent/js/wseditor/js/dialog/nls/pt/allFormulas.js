/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Todas as fórmulas",
	LABEL_FORMULA_LIST: "Lista de fórmulas:",
	formula:{
	ABS:{	
	    Syntax:"${0}(número)",
	    Disp:"Devolve o valor absoluto de um número."
    },
    ACOS:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o arco de co-seno de um número. O ângulo é devolvido em radianos."
    },
    ACOSH:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o co-seno hiperbólico inverso de um número."
    },
    ACOT:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve a co-tangente inversa de um número. O ângulo é medido em radianos."
    },
    ACOTH:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve a co-tangente hiperbólica inversa de um número."
    },
    ADDRESS:{
         Syntax:"${0}(linha${1} coluna${1} [abs]${1} [a1]${1} [folha])",
         Disp:"Devolve a referência a uma célula em formato de texto.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absoluta",
        		 result : 1
        	 }, {
        		 label : "${0} - Linha absoluta / Coluna relativa",
        		 result : 2
        	 }, {
        		 label : "${0} - Linha relativa / Coluna absoluta",
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
    	Disp:"Devolve VERDADEIRO, se todos os argumentos forem VERDADEIROS."
    },
    ASIN:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o arco de seno de um número. O ângulo é devolvido em radianos."
    },
    ASINH:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o seno hiperbólico inverso de um número."
    },
    ATAN:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o arco de tangente de um número. O ângulo é devolvido em radianos."
    },
    AVERAGE:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devolve a média dos argumentos."
    },
    AVERAGEA:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devolve o valor médio de uma amostra. Ao texto é atribuído o valor de zero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(intervalo${1} critérios${1} [intervalo_médio])",
    	Disp:"Devolve a média (média aritmética) dos argumentos que satisfazem a condição dada."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(média_intervalo${1} critérios_intervalo1${1} critérios1${1} ...)",
    	Disp:"Devolve a média (média aritmética) dos argumentos que satisfazem condições múltiplas."
    },
    ATAN2:{
    	Syntax:"${0}(x_núm${1} y_núm)",
    	Disp:"Devolve o arco tangente, ou tangente inversa, das coordenadas x e y especificadas. O arco tangente corresponde ao ângulo desde o eixo x até uma linha que contém a origem (0, 0) e um ponto com coordenadas (x_núm, y_núm)."
    },
    ATANH:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve a tangente hiperbólica inversa de um número. O número tem de estar compreendido entre -1 e 1 (excluindo -1 e 1)."
    },
    BASE:{    
    	Syntax:"${0}(número${1} base${1} [tamanho mínimo])",
    	Disp:"Converte um número inteiro positivo em texto de um sistema numérico para a base definida."
    },
    BIN2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Converte um número binário num número decimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número binário num número hexadecimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número binário num número octal."
    },
    CEILING:{  
    	Syntax: "${0}(número${1} incremento)",
    	Disp:"Arredonda um número para o número inteiro ou múltiplo de significância mais próximo."
    },
    CHAR: {
    	Syntax: "${0}(número)",
    	Disp: "Devolve um carácter mapeado pelo número. Localiza o carácter no mapa de caracteres Unicode. O número situa-se entre 1 e 255."
    },
    CHOOSE: {
    	Syntax: "${0}(índice${1} valor${1} [valor2]${1} ...)",
    	Disp: "Localiza e devolve o valor correspondente de acordo com o índice. Pode SELECCIONAR a partir de um máximo de 30 valores."
    },
    CODE:{
    	Syntax:"${0}(texto)",
    	Disp:"Devolve o código numérico para o primeiro carácter numa cadeia de texto codificada em unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([referência])",
    	Disp:"Devolve o número de colunas interno de uma referência."
    },
    COLUMNS:{    
    	Syntax:"${0}(matriz)",
    	Disp:"Devolve o número de colunas numa matriz ou referência."
    },
    COMBIN:{
    	Syntax:"${0}(número${1} número_seleccionado)",
    	Disp:"Devolve o número de combinações para um determinado número de itens. Utilize ${0} para determinar o número possível total para um determinado número de itens."
    },
    CONCATENATE:{   
    	Syntax:"${0}(texto 1${1} ...)",
    	Disp:"Combina várias cadeias de texto numa única cadeia."
    },
    CONVERT:{
    	Syntax:"${0}(número${1} da_unidade${1} para_unidade)",
    	Disp:"Converte um número de um sistema métrico para outro sistema numérico.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Grama",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Libra de massa (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unidade de massa atómica)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Onça de massa (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metro",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Milha",
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
       		 label : "${0} - Pica",
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
       		 label : "${0} - Atmosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Milímetros de Mercúrio (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Libra-força",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Caloria",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electrão-volt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Cavalo-vapor-hora",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-hora",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Libra-pé",
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
       		 label : "${0} - Chávena",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Quartilho E.U.A.",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Quartilho Reino Unido",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quarto",
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
    	Syntax:"${0}(número)",
    	Disp:"Devolve o co-seno do ângulo especificado."
    },
    COSH:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o co-seno hiperbólico de um número."
    },
    COT:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve a co-tangente do número especificado."
    },
    COTH:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve a co-tangente hiperbólica do número especificado."
    },
    COUNT:{   
    	Syntax:"${0}(valor1${1} [valor2]${1} ...)",
    	Disp:"Conta quantos números existem na lista de argumentos. As entradas de texto são ignoradas."
    },
    COUNTA:{   
    	Syntax:"${0}(valor1${1} [valor2]${1} ...)",
    	Disp:"Conta quantos valores existem na lista de argumentos."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(intervalo)",
    	Disp: "Conta as células em branco num determinado intervalo."
    },
    COUNTIF:{
    	Syntax: "${0}(intervalo${1} critérios)",
    	Disp:"Conta o número de células que satisfazem a condição dada."
    },
    COUNTIFS:{
    	Syntax: "${0}(critérios_intervalo1${1} critérios1${1} ...)",
    	Disp:"Conta o número de células que satisfazem múltiplas condições."
    },
    CUMIPMT:{	
	    Syntax:"${0}(taxa${1} nper${1} pv${1} início_período${1} fim_período${1} tipo)",
	    Disp:"Calcula os juros cumulativos pagos entre dois períodos especificados."
    },
    CUMPRINC:{	
	    Syntax:"${0}(taxa${1} nper${1} pv${1} início_período${1} fim_período${1} tipo)",
	    Disp:"Calcula o montante cumulativo pago num empréstimo, entre dois períodos especificados."
    }, 
    DATE:{	
	    Syntax:"${0}(ano${1} mês${1} dia)",
	    Disp:"Faculta um número interno para a data em questão."
    },  
    DATEDIF:{	
	    Syntax:"${0}(data de início${1} data de fim${1} formato)",
	    Disp:"Devolve a diferença em anos, meses ou dias entre duas datas.",
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
	    		label: "${0} - O número de dias entre data de início e data de fim, a ignorar os meses e anos.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - O número de meses entre data de início e data de fim, a ignorar os anos.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - O número de dias entre data de início e data de fim, a ignorar os anos.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(texto)",
	    Disp:"Devolve um número interno para um texto eventualmente em formato de data."
    }, 
    DAY:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o dia do valor de data indicado. O dia é devolvido como um número inteiro entre 1 e 31. Também pode introduzir um valor de data/hora negativo."
    },
    DAYS360:{
    	Syntax:"${0}(data_início${1} data_fim${1} [método])",
    	Disp:"Calcula o número de dias entre duas datas com base num ano de 360 dias.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Método E.U.A. (NASD)",
       		 result : "FALSO"
       	 }, {
       		 label : "${0} - Método europeu",
       		 result : "VERDADEIRO"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(data de início${1} data de fim${1})",
    	Disp:"Calcula o número de dias entre duas datas."
    },
    DEC2BIN:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número decimal num número binário."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número decimal num número hexadecimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número decimal num número octal."
    },
    DEGREES:{	
	    Syntax:"${0}(ângulo)",
	    Disp:"Converte radianos em graus."
    },
    DISC:{
    	Syntax:"${0}(liquidação${1} maturidade${1} pr${1} resgate${1} [base])",
    	Disp:"Calcula a taxa de desconto para um título."
    }, 
    DOLLAR:{
    	Syntax:"${0}(número${1} [decimais])",
    	Disp:"Converte um número em texto utilizando o formato de moeda $ (dólar)."
    },
    EDATE:{
    	Syntax:"${0}(data_início${1} meses)",
    	Disp:"Devolve o número de série que representa a data que é o número indicado de meses antes ou após a data_início "
    },
    EOMONTH:{
    	Syntax:"${0}(data_início${1} meses)",
    	Disp:"Devolve o número de série para o último dia do mês que é o número indicado de meses antes ou após a data_início"
    },
    ERFC:{   
    	Syntax:"${0}(número)",
        Disp:"Devolve a função de erro complementar, integrada entre um número e o infinito."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referência)",
    	Disp:"Devolve um número correspondente a um tipo de erro."
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
    	Disp:"Devolve um número arredondado ao número inteiro par mais próximo."
    },
    EXACT:{    
    	Syntax:"${0}(texto 1${1} texto 2)",
    	Disp: "Compara duas cadeias de texto e devolve VERDADEIRO se estas forem idênticas. Esta função é sensível a maiúsculas e minúsculas."
    },
    EXP:{    
    	Syntax:"${0}(número)",
    	Disp: "Devolve e elevado ao número indicado."
    },
    FACT:{  
    	Syntax:"${0}(número)",
    	Disp:"Calcula o factorial de um número."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(número)",
        Disp:"Devolve o factorial duplo de um número."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Devolve o valor lógico como FALSO."
    },
    FIND:{   
    	Syntax:"${0}(localizar texto${1} texto${1} [posição])",
    	Disp:"Procura uma cadeia de texto dentro de outra (sensível a maiúsculas e minúsculas)."
    },
    FIXED:{
    	Syntax:"${0}(número${1} [decimais]${1} [sem_vírgulas])",
    	Disp:"Formata um número como texto com um número fixo de decimais.",
    	Arguments: {
    		2 : [{
    			label : "${0} - impedir vírgulas",
    			result : "VERDADEIRO"
    		}, {
    			label : "${0} - não impedir vírgulas",
    			result: "FALSO" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(número${1} significância)",
    	Disp:"Arredonda um número para o múltiplo de significância inferior mais próximo."
    },
    FORMULA:{   
    	Syntax:"${0}(referência)",
    	Disp:"Devolve a fórmula de uma célula de fórmula."
    },
    FREQUENCY:{   
    	Syntax:"${0}(ListaSequênciaNúmeros_dados${1} ListaSequênciaNúmeros_bin)",
    	Disp:"Categoriza valores em intervalos e conta o número de valores em cada intervalo."
    },
    FV:{
    	Syntax:"${0}(taxa${1} nper${1} pmt${1} [pv]${1} [tipo])",
    	Disp:"Calcula o valor futuro de um investimento com base numa taxa de juro constante."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(montante${1} calendário)",
        Disp:"Calcula o valor futuro de um montante inicial, após aplicar uma série de taxas de juro compostas."
    },
    GAMMALN:{   
    	Syntax:"${0}(número)",
        Disp:"Devolve o algoritmo natural da função gama."
    },
    GCD:{   
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
        Disp:"Devolve o maior divisor comum de todos os argumentos."
    },
    HEX2BIN:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número hexadecimal num número binário."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Converte um número hexadecimal num número decimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número hexadecimal num número octal."
    },
    HOUR:{   
    	Syntax:"${0}(número)",
    	Disp:"Determina o número sequencial da hora do dia (0-23) para o valor da hora."
    },
    HLOOKUP:{   
    	Syntax:"${0}(critério_procura${1} matriz${1} Índice${1} [ordenado])",
    	Disp:"Procura horizontal e referência às células localizadas abaixo.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Correspondência aproximada",
          		 result : "VERDADEIRO"
          	 }, {
          		 label : "${0} - Correspondência exacta",
          		 result : "FALSO"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(ligação${1} [célula_texto])",
    	Disp:"Devolve uma ligação que aponta para um recurso na rede ou para um intervalo referenciado pela ligação. Apresenta texto_célula (opcional) se fornecido; caso contrário, apresenta a ligação como texto."
    },    
    IF:{    
    	Syntax:"${0}(teste${1} [valor_se_verdadeiro]${1} [valor_se_falso])",
    	Disp:"Especifica um teste lógico a ser efectuado."
    },
    IFS:{
    	Syntax:"${0}(teste1${1} valor_se_verdadeiro1${1} ...)",
    	Disp:"Executa testes lógicos para verificar se uma ou mais condições são cumpridas e devolve um valor que corresponde à primeira condição VERDADEIRA."
    },
    IFERROR:{
    	Syntax:"${0}(valor${1} valor_se_erro)",
    	Disp:"Devolve o valor que especifica se a expressão for um erro. Caso contrário, devolve o resultado da expressão."
    },
    IFNA:{
    	Syntax:"${0}(valor${1} valor_se_na)",
    	Disp:"Devolve o valor especificado se a expressão devolver o valor de erro #N/D. Caso contrário, devolve o resultado da expressão."
    },
    INDEX:{    
    	Syntax:"${0}(referência${1} linha${1} [coluna]${1} [intervalo])",
    	Disp:"Devolve uma referência a uma célula a partir de um intervalo definido."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [estilo_ref])",
    	Disp:"Devolve o conteúdo de uma célula referenciada em formato de texto.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - Estilo R1C1",
         		 result : "FALSO"
         	 }, {
         		 label : "${0} - Estilo A1",
         		 result : "VERDADEIRO"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(número)",
    	Disp:"Arredonda um número por defeito para o número inteiro mais próximo."
    },
    IPMT:{
    	Syntax:"${0}(taxa${1} por${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Calcula o valor de pagamento de juros num período de tempo para um investimento baseado em pagamentos regulares e numa taxa de juro fixa."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO se a célula referenciada estiver em branco. Caso contrário, devolve FALSO."
    },
    ISERR:{
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for qualquer valor de erro diferente de #N/D."
    },
    ISERROR:{
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for qualquer valor de erro."
    },
    ISEVEN:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO se o valor for par. Caso contrário, devolve FALSO." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referência)",
    	Disp:"Devolve VERDADEIRO, se a célula corresponder a uma célula de fórmula."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor tiver um número lógico."
    },
    ISNA:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for igual a #N/D."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor não for texto."
    },
    ISNUMBER:{   
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for um número."
    },
    ISODD:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for um número inteiro ímpar."
    },
    ISPMT:{
    	Syntax:"${0}(taxa${1} per${1} nper${1} pv)",
    	Disp:"Calcula os juros pagos durante um período especificado para um investimento."
    }, 
    ISREF:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for uma referência."
    },
    ISTEXT:{    
    	Syntax:"${0}(valor)",
    	Disp:"Devolve VERDADEIRO, se o valor for texto."
    },
    LARGE:{
        Syntax:"${0}(matriz${1} posição_ordinal)",
    	Disp:"Devolve o maior valor ordinal de um conjunto de valores."
    },
    LCM:{   
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
        Disp:"Devolve o menor múltiplo comum de todos os números da lista."
    },
    LEFT:{
        Syntax:"${0}(texto${1} [tamanho])",
    	Disp:"Devolve o número especificado de caracteres do início de um texto."
    },
    LEN:{
    	Syntax:"${0}(texto)",
    	Disp:"Devolve o tamanho de uma cadeia de texto."
    },
    LENB:{
    	Syntax:"${0}(texto)",
    	Disp:"Devolve o número de bytes de uma cadeia de texto."
    },
    LN:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o logaritmo natural de um número."
    },
    LOG:{
    	Syntax:"${0}(número${1} [base])",
    	Disp:"Devolve o logaritmo de um número numa base especificada."
    },
    LOG10:{
    	Syntax:"${0}(número)",
    	Disp:"Devolve o logaritmo base-10 de um número."
    },
    LOOKUP:{
    	Syntax: "${0}(critério de procura${1} vector de procura${1} [resultado_vector])",
    	Disp:"Determina um valor num vector por comparação com os valores de outro vector."
    },
    LOWER:{    
    	Syntax:"${0}(texto)",
    	Disp:"Converte texto em minúsculas."
    },    
    MATCH:{    
    	Syntax: "${0}(critério de procura${1} matriz_procura${1} [tipo])",
    	Disp:"Define uma posição numa matriz, após a comparação de valores.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Menor do que",
         		 result : 1
         	 }, {
         		 label : "${0} - Correspondência exacta",
         		 result : 0
         	 }, {
         		 label : "${0} - Maior do que",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devolve o valor máximo numa lista de argumentos."
    },
    MEDIAN:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devolve o valor do meio, em caso de número ímpar de valores. Caso contrário, devolve a média aritmética dos dois valores do meio."
    },
    MID:{    
    	Syntax:"${0}(texto${1} número${1} número)",
    	Disp:"Devolve uma cadeia de texto parcial de um texto."
    }, 
    MIN:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devolve o valor mínimo de uma lista de argumentos."
    },    
    MINUTE:{    
    	Syntax:"${0}(número)",
    	Disp:"Determina o número sequencial do minuto na hora (0-59) para o valor da hora."
    },    
    MOD:{    
    	Syntax:"${0}(número_dividido${1} divisor)",
    	Disp:"Devolve o resto quando o número dividido é dividido pelo divisor."
    },
    MODE:{    
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Devolve o valor mais frequente numa série de dados."
    },
    MONTH:{    
    	Syntax:"${0}(número)",
    	Disp:"Devolve o mês para o valor de data indicado. O mês é devolvido como um número inteiro entre 1 e 12."
    },
    MROUND:{   
    	Syntax: "${0}(número${1} múltiplo",
        Disp:"Devolve um número arredondado a um múltiplo especificado."
    },
    MMULT:{    
    	Syntax:"${0}(matriz${1} matriz)",
    	Disp:"Multiplicação de matrizes. Devolve o produto de duas matrizes."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
        Disp:"Devolve o coeficiente multinomial de um conjunto de números."
    },
    N:{    
    	Syntax:"${0}(valor)",
    	Disp:"Converte um valor em número."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Devolve o valor de erro #N/D."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(data de início${1} data de fim${1} [feriados])",
    	Disp:"Devolve o número de dias úteis entre duas datas."
    },
    NOT:{    
    	Syntax:"${0}(valor lógico)",
    	Disp:"Reverte o valor do argumento."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Determina a hora actual do computador."
    },
    NPV:{   
    	Syntax:"${0}(taxa${1} valor 1${1} [valor 2]${1} ...)",
        Disp:"Calcula o valor actual líquido de um investimento, baseado numa taxa de desconto fornecida e numa série de pagamentos e lucros futuros."
    },
    OCT2BIN:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número octal num número binário."
    },
    OCT2DEC:{
    	Syntax:"${0}(número)",
    	Disp:"Converte um número octal num número decimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(número${1} [casas])",
    	Disp:"Converte um número octal num número hexadecimal."
    },
    ODD:{    
    	Syntax:"${0}(número)",
    	Disp:"Arredonda um número por excesso para o número inteiro ímpar mais próximo, em que \"por excesso\" significa \"afastado de 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(referência${1} linhas${1} colunas${1} [altura]${1} [largura])",
    	Disp:"Devolve uma referência a um intervalo que corresponde a um número especificado de linhas e colunas de uma célula ou de um intervalo de células."
    },
    OR:{    
    	Syntax:"${0}(valor lógico 1${1} [valor lógico 2]${1} ...)",
    	Disp:"Devolve VERDADEIRO se existir, no mínimo, um argumento VERDADEIRO."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Devolve o valor aproximado de Pi."
    },
    PMT:{
    	Syntax:"${0}(taxa${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Devolve o pagamento para um empréstimo baseado em pagamentos regulares e uma taxa de juro fixa."
    },
    POWER:{    
    	Syntax:"${0}(base${1} potência)",
    	Disp:"Eleva um número à potência de um outro."
    },
    PPMT:{
    	Syntax:"${0}(taxa${1} por${1} nper${1} pv${1} [fv]${1} [tipo])",
    	Disp:"Calcula o valor de pagamento para um período de tempo para um investimento com base em pagamentos regulares e uma taxa de juro fixa."
    },
    PRICEDISC:{
    	Syntax:"${0}(liquidação${1} maturidade${1} desconto${1} resgate${1} [base])",
    	Disp:"Calcula o preço por valor nominal de 100&euro; de um título com desconto."
    },
    PRICEMAT:{
    	Syntax:"${0}(liquidação${1} maturidade${1} emissão${1} taxa${1} yld${1} [base])",
    	Disp:"Calcula o preço por valor nominal de 100&euro; de um título que rende juros em função da maturidade."
    },
    PRODUCT:{   
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Multiplica todos os números atribuídos como argumentos e devolve o produto."
    },
    PROPER:{    
    	Syntax:"${0}(texto)",
    	Disp:"Converte uma cadeia de texto em maiúsculas/minúsculas adequadas. A primeira letra de cada palavra em maiúsculas e todas as outras letras em minúsculas."
    },
    PV:{
    	Syntax:"${0}(taxa${1} nper${1} pmt${1} [fv]${1} [tipo])",
    	Disp:"Calcula o valor actual de um investimento, com base numa série de pagamentos futuros."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerador${1} denominador)",
        Disp:"Devolve o resultado de um número dividido por outro número, truncado como um número inteiro."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Devolve um número aleatório entre 0 e 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(fim${1} início)",
    	Disp: "Devolve um número inteiro aleatório entre os números especificados."
    },
    RANK:{    
    	Syntax:"${0}(número${1} ref${1} [ordem])",
    	Disp: "Devolve a posição de um valor na amostra.",
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
    	Syntax:"${0}(liquidação${1} maturidade${1} investimento${1} desconto${1} [base])",
    	Disp:"Calcula o montante recebido na maturidade por um título de investimento total."
    }, 
    REPLACE:{    
    	Syntax: "${0}(texto${1} posição${1} tamanho${1} novo texto)",
    	Disp:"Substitui caracteres numa cadeia de texto por uma cadeia de texto diferente."	
    },
    REPT:{    
    	Syntax: "${0}(texto${1} contagem)",
    	Disp:"Repete o texto um determinado número de vezes."	
    },
    RIGHT:{
    	Syntax: "${0}(texto${1} [número])",
    	Disp:"Devolve o último carácter ou caracteres do texto."
    },
    RIGHTB:{
    	Syntax: "${0}(texto${1} [número])",
    	Disp:"Devolve o último carácter ou caracteres do texto."
    },
    ROUND:{   
    	Syntax: "${0}(número${1} contagem)",
    	Disp:"Arredonda um número para uma exactidão predefinida."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(número${1} contagem)",
    	Disp:"Arredonda um número para baixo para uma exactidão predefinida."
    },
    ROUNDUP:{   
    	Syntax: "${0}(número${1} contagem)",
    	Disp:"Arredonda um número para cima para uma exactidão predefinida."
    },
    ROW:{   
    	Syntax:"${0}([referência])",
    	Disp:"Define o número de linha interna de uma referência."
    },
    ROWS:{   
    	Syntax:"${0}(matriz)",
    	Disp:"Devolve o número de linhas numa matriz ou referência."
    },
    RADIANS:{   
    	Syntax:"${0}(ângulo)",
    	Disp:"Converte graus em radianos."
    },
    ROMAN:{   
    	Syntax:"${0}(número${1} [formato])",
    	Disp:"Converte numeração árabe em romana, como texto.",
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
    	Syntax:"${0}(localizar texto${1} texto${1} [posição])",
    	Disp:"Localiza um valor de texto dentro de outro, sem fazer a distinção entre maiúsculas e minúsculas."
    },  
    SIGN:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve o sinal algébrico de um número."
    },
    SIN:{    
    	Syntax:"${0}(número)",
    	Disp:"Devolve o seno do ângulo especificado."
    },
    SINH:{    
    	Syntax:"${0}(número)",
    	Disp:"Devolve o seno hiperbólico de um número."
    },
    SECOND:{    
    	Syntax:"${0}(número)",
    	Disp:"Determina o número sequencial do segundo num minuto (0-59) para o valor da hora."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coeficientes",
        Disp:"Devolve a soma de uma série de potências com base na fórmula."
    },
    SHEET:{   
    	Syntax:"${0}([referência])",
    	Disp:"Devolve o número de folha interno de uma referência ou cadeia de texto."
    },
    SMALL:{   
    	Syntax:"${0}(matriz${1} posição_ordinal)",
    	Disp:"Devolve o menor valor ordinal de um conjunto de valores."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(texto${1} antigo${1} novo${1} [ocorrência])",
    	Disp:"Devolve o texto onde o texto anterior é substituído pelo texto novo."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(função${1} intervalo${1} ...)",
    	Disp:"Calcula subtotais numa folha de cálculo.",
    	Arguments: {
    		0 : [{
    			label : "${0} - MÉDIA",
    			result : 1
    		}, {
    			label : "${0} - CONTAR",
    			result: 2
    		}, {
    			label : "${0} - CONTAR.VAL",
    			result: 3
    		}
    		, {
    			label : "${0} - MÁXIMO",
    			result: 4
    		}
    		, {
    			label : "${0} - MÍNIMO",
    			result: 5
    		}
    		, {
    			label : "${0} - PRODUTO",
    			result: 6
    		}
    		, {
    			label : "${0} - DESVPAD",
    			result: 7
    		}
    		, {
    			label : "${0} - DESVPADP",
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
    			label : "${0} - CONTAR",
    			result: 102
    		}, {
    			label : "${0} - CONTAR.VAL",
    			result: 103
    		}, {
    			label : "${0} - MÁXIMO",
    			result: 104
    		}, {
    			label : "${0} - MÍNIMO",
    			result: 105
    		}, {
    			label : "${0} - PRODUTO",
    			result: 106
    		}, {
    			label : "${0} - DESVPAD",
    			result: 107
    		}, {
    			label : "${0} - DESVPADP",
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
    	Syntax:"${0}(número1${1} [número 2]${1} ...)",
    	Disp:"Devolve a soma de todos os argumentos."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matriz 1${1} [matriz 2]${1} ...)",
    	Disp:"Devolve a soma dos produtos de argumentos de matriz."
    },
    SUMIF:{   
    	Syntax:"${0}(intervalo${1} critérios${1} [intervalo da soma])",
    	Disp:"Soma o total dos argumentos que satisfazem os critérios de procura."
    },
    SUMIFS:{
    	Syntax: "${0}(soma_intervalo${1} critérios_intervalo1${1} critérios1${1} ...)",
    	Disp:"Calcula o total de argumentos que satisfazem múltiplas condições."
    },
    SQRT:{   
    	Syntax:"${0}(número)",
    	Disp:"Devolve a raiz quadrada de um número."
    },
    SQRTPI:{   
    	Syntax:"${0}(número)",
        Disp:"Devolve a raiz quadrada de (número * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Calcula o desvio padrão com base numa amostra."
    },
    STDEVP:
    {
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
    	Disp:"Calcula o desvio padrão, com base na totalidade da população indicada."
    },
    SUMSQ:{
    	Syntax:"${0}(número 1${1} [número 2]${1} ...)",
        Disp:"Devolve a soma dos quadrados dos números da lista."
    },
    T:{
    	Syntax:"${0}(texto)",
    	Disp:"Converte os respectivos argumentos em texto."
    },
    TAN:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve a tangente do número especificado."
    },
    TANH:{    
    	Syntax:"${0}(número)",
        Disp:"Devolve a tangente hiperbólica do número especificado."
    },
    TBILLPRICE:{
    	Syntax:"${0}(liquidação${1} maturidade${1} desconto)",
    	Disp:"Calcula o preço por valor nominal de 100&euro; para uma nota do Tesouro."
    },
    TEXT:{
    	Syntax:"${0}(valor${1} código_formato)",
    	Disp:"Converte o valor num texto de acordo com as regras de um código de formato numérico e devolve o mesmo."
    },
    TIME:{   
    	Syntax:"${0}(hora${1} minuto${1} segundo)",
    	Disp:"Determina um valor de tempo a partir dos detalhes de horas, minutos e segundos."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(texto)",
	    Disp:"Devolve um número inteiro para um texto com um possível formato de hora."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determina a data actual do computador."
    },    
    TRIM:{
    	Syntax:"${0}(texto)",
    	Disp:"Remove todos os espaços à esquerda e à direita. Qualquer outra sequência de 2 ou mais espaços internos é substituída por um único espaço."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Devolve o valor lógico VERDADEIRO."
    },
    TRUNC:{   
    	Syntax:"${0}(número${1} [contagem])",
    	Disp:"Trunca as casas decimais de um número."
    },
    TYPE:{   
    	Syntax:"${0}(valor)",
    	Disp:"Define o tipo de dados de um valor."	
    },
    UPPER:{  
    	Syntax: "${0}(texto)",
    	Disp:"Converte todas as letras de um texto em maiúsculas."
    },
    VALUE:{    
    	Syntax: "${0}(texto)",
    	Disp:"Converte um argumento de texto num número."
    },
    VAR:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Estima a variância com base numa amostra."
    },
    VARA:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Estima a variância com base numa amostra, incluindo números, texto e valores lógicos."
    },
    VARP:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Calcula a variância com base na totalidade da população."
    },
    VARPA:{    
    	Syntax: "${0}(número1${1} [número2]${1}...)",
    	Disp:"Calcula a variância com base na totalidade da população, incluindo números, texto e valores lógicos."
    },
    VLOOKUP:{    
    	Syntax: "${0}(critério de procura${1} matriz${1} índice${1} [sequência de ordenação])",
    	Disp:"Procura vertical e referência a células indicadas.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Correspondência aproximada",
          		 result : "VERDADEIRO"
          	 }, {
          		 label : "${0} - Correspondência exacta",
          		 result : "FALSO"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(número${1} [tipo])",
    	Disp:"Devolve o dia da semana para o valor da data como um número inteiro.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Números de 1 (Domingo) a 7 (Sábado)",
          		 result : 1
          	 }, {
          		 label : "${0} - Números de 1 (Segunda-feira) a 7 (Domingo)",
          		 result : 2
          	 }, {
          		 label : "${0} - Números de 0 (Segunda-feira) a 6 (Domingo)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Números de 1 (Segunda-feira) a 7 (Domingo)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Números de 1 (Terça-feira) a 7 (Segunda-feira)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Números de 1 (Quarta-feira) a 7 (Terça-feira)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Números de 1 (Quinta-feira) a 7 (Quarta-feira)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Números de 1 (Sexta-feira) a 7 (Quinta-feira)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Números de 1 (Sábado) a 7 (Sexta-feira)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Números de 1 (Domingo) a 7 (Sábado)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(número${1} [modo])",
    	Disp:"Calcula a semana de calendário correspondente à data indicada.",
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
    	Syntax:"${0}(data de início${1} dias${1} [feriados])",
    	Disp:"Devolve o número de série da data antes ou depois de um número especificado de dias úteis."
    },
    XNPV:{   
    	Syntax:"${0}(taxa${1} valores${1} datas)",
    	Disp:"Calcula o valor actual líquido para um calendário de fluxo de caixa."
    },
    YEAR:{    
    	Syntax:"${0}(número)",
    	Disp:"Devolve o ano correspondente a um valor de data como número inteiro."
    }
}
})

