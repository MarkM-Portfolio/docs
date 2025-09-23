/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "所有公式",
	LABEL_FORMULA_LIST: "公式列表：",
	formula:{
	ABS:{	
	    Syntax:"${0}(数字)",
	    Disp:"返回数字的绝对值。"
    },
    ACOS:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的反余弦。角度以弧度形式返回。"
    },
    ACOSH:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的反双曲余弦。"
    },
    ACOT:{    
    	Syntax:"${0}(数字)",
        Disp:"返回数字的反余切。角度以弧度形式度量。"
    },
    ACOTH:{    
    	Syntax:"${0}(数字)",
        Disp:"返回数字的反双曲余切。"
    },
    ADDRESS:{
         Syntax:"${0}(行${1} 列${1} [绝对值]${1} [a1]${1} [工作表])",
         Disp:"用文本来确定一个单元格的引用地址。",
         Arguments: {
        	 2 : [{
        		 label : "${0} - 绝对",
        		 result : 1
        	 }, {
        		 label : "${0} - 绝对行/相对列",
        		 result : 2
        	 }, {
        		 label : "${0} - 相对行/绝对列",
        		 result : 3
        	 }, {
        		 label : "${0} - 相对",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 样式",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 样式",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(逻辑值 1${1} [逻辑值 2]${1} ...)",
    	Disp:"只有在所有自变量的逻辑值为 TRUE 时，函数才返回 TRUE。"
    },
    ASIN:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的反正弦。角度以弧度形式返回。"
    },
    ASINH:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的反双曲正弦。"
    },
    ATAN:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的反正切。角度以弧度形式返回。"
    },
    AVERAGE:{    
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"返回自变量的平均值。"
    },
    AVERAGEA:{    
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"计算一个抽样的平均值。文本被定值为零。"
    },
    AVERAGEIF:{    
    	Syntax:"${0}(范围${1} 条件${1} [平均值范围])",
    	Disp:"返回符合给定条件的自变量的平均值（算数平均值）。"
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(平均值范围${1} 条件范围 1${1} 条件 1${1} ...)",
    	Disp:"返回符合多个条件的自变量的平均值（算数平均值）。"
    },
    ATAN2:{
    	Syntax:"${0}(x_数字${1} y_数字)",
    	Disp:"返回指定的 x- 和 y- 坐标的反正切。反正切为从 x 轴到包含原点 (0, 0) 和坐标点 (x_数字, y_数字) 的线的角度。"
    },
    ATANH:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的反双曲正切。数字必须在 -1 与 1 之间（不包括 -1 和 1）。"
    },
    BASE:{    
    	Syntax:"${0}(数字${1} 基数${1} [最小长度])",
    	Disp:"按照所定义的数字系统进位方式，将正整数转换成文本。"
    },
    BIN2DEC:{
    	Syntax:"${0}(数字)",
    	Disp:"将一个二进制数字转换成一个十进制数字。"
    }, 
    BIN2HEX:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个二进制数字转换成一个十六进制数字。"
    }, 
    BIN2OCT:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个二进制数字转换成一个八进制数字。"
    },
    CEILING:{  
    	Syntax: "${0}（数字${1} 增量）",
    	Disp:"将数字向上舍入成最接近的整数或其基数的最小倍数。"
    },
    CHAR: {
    	Syntax: "${0}(数字)",
    	Disp: "返回数字映射的字符。它会在 Unicode 字符映射中查找该字符。数字在 1 到 255 之间。"
    },
    CHOOSE: {
    	Syntax: "${0}(索引${1} 值1${1} [值2]${1} ...)",
    	Disp: "根据索引查找并返回相应的值。它可以从最多 30 个值中选择。"
    },
    CODE:{
    	Syntax:"${0}(文本)",
    	Disp:"返回以 Unicode 编码的文本字符串中第一个字符的数字代码。"
    },
    COLUMN:{    
    	Syntax:"${0}([引用])",
    	Disp:"确定一个引用的内部列号。"
    },
    COLUMNS:{    
    	Syntax:"${0}(数组)",
    	Disp:"返回数组或引用中的列数。"
    },
    COMBIN:{
    	Syntax:"${0}(数字${1} 数字选择)",
    	Disp:"返回给定项数的组合数。使用 ${0} 来确定给定项数的可能总组数。"
    },
    CONCATENATE:{   
    	Syntax:"${0}(文本 1${1} ...)",
    	Disp:"将多个文本字符串合并为一个字符串。"
    },
    CONVERT:{
    	Syntax:"${0}(数字${1} 源单位${1} 目标单位)",
    	Disp:"将数字从一个度量系统转换为另一个度量系统。",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - 克",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - 斯勒格",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - 磅质量（英国常衡制）",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U（原子质量单位）",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - 盎司质量（英国常衡制）",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - 米",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - 法定英里",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - 英寸",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - 英尺",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - 码",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - 埃",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - 派卡",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - 年",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - 天",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - 小时",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - 分钟",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - 秒",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - 帕斯卡",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - 大气",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - 毫米汞柱 (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - 牛顿",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - 达因",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - 磅力",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - 焦耳",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - 尔格",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - 国际热量单位卡路里",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - 电子伏特",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - 马力时",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - 瓦特时",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - 尺磅",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - 热力学卡路里",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - 马力",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - 瓦特",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - 特斯拉",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - 高斯",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - 摄氏度",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - 华氏度",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - 开",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - 茶匙",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - 汤匙",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - 液量盎司",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - 杯",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - 美国一品脱",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - 英国一品脱",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - 夸脱",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - 加仑",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - 升",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(数字)",
    	Disp:"返回给定角度的余弦。"
    },
    COSH:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的双曲余弦。"
    },
    COT:{    
    	Syntax:"${0}(数字)",
        Disp:"返回给定数字的余切。"
    },
    COTH:{    
    	Syntax:"${0}(数字)",
        Disp:"返回给定数字的双曲余切。"
    },
    COUNT:{   
    	Syntax:"${0}(值1${1} [值2]${1} ...)",
    	Disp:"计算自变量列表中数字的数目。忽略文本项。"
    },
    COUNTA:{   
    	Syntax:"${0}(值1${1} [值2]${1} ...)",
    	Disp:"计算自变量列表中值的数目。"
    },
    COUNTBLANK:{   
    	Syntax:"${0}(范围)",
    	Disp: "计算指定范围内空白单元格的数目。"
    },
    COUNTIF:{
    	Syntax: "${0}(范围${1} 条件)",
    	Disp:"计算符合给定条件的单元格数目。"
    },
    COUNTIFS:{
    	Syntax: "${0}(条件范围 1${1} 条件 1${1} ...)",
    	Disp:"计算符合多个条件的单元格数量。"
    },
    CUMIPMT:{	
	    Syntax:"${0}（比率${1} 期数${1} 期值${1} 期开始${1} 期结束${1} 类型）",
	    Disp:"计算两个指定期之间支付的累计利息。"
    },
    CUMPRINC:{	
	    Syntax:"${0}（比率${1} 期数${1} 期值${1} 期开始${1} 期结束${1} 类型）",
	    Disp:"计算两个指定期之间针对贷款支付的累计本金。"
    }, 
    DATE:{	
	    Syntax:"${0}(年${1} 月${1} 日)",
	    Disp:"为给定的日期提供一个内部数字。"
    },  
    DATEDIF:{	
	    Syntax:"${0}(开始日期${1} 结束日期${1} 格式)",
	    Disp:"返回两个日期之间相差的年、月或天数。",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - 时间段内完整年份数。",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - 时间段内完整月份数。",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - 时间段内天数。",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - 开始日期和结束日期之间相差的天数，忽略月份和年份。",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - 开始日期和结束日期之间相差的月份数，忽略年份。",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - 开始日期和结束日期之间相差的天数，忽略年份。",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(文本)",
	    Disp:"针对可能具有日期格式的文本返回一个内部数字。"
    }, 
    DAY:{
    	Syntax:"${0}(数字)",
    	Disp:"返回指定日期值对应哪一天。将以 1 到 31 之间的整数返回该日。还可以输入负日期/时间值。"
    },
    DAYS360:{
    	Syntax:"${0}(开始日期${1} 结束日期${1} [方法])",
    	Disp:"计算两个日期之间相差的天数（以一年 360 天计算）。",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - 美国 (NASD) 算法",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - 欧洲算法",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(开始日期${1} 结束日期${1})",
    	Disp:"计算两个日期之间相差的天数。"
    },
    DEC2BIN:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个十进制数字转换成一个二进制数字。"
    }, 
    DEC2HEX:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个十进制数字转换成一个十六进制数字。"
    },
    DEC2OCT:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个十进制数字转换成一个八进制数字。"
    },
    DEGREES:{	
	    Syntax:"${0}(角度)",
	    Disp:"将弧度转换为度数。"
    },
    DISC:{
    	Syntax:"${0}（结算${1} 到期日${1} 价格${1} 赎回${1} [基础]）",
    	Disp:"计算证券的折现率。"
    }, 
    DOLLAR:{
    	Syntax:"${0}(数字${1} [小数位数])",
    	Disp:"使用 $（美元）货币格式，将数字转换为文本。"
    },
    EDATE:{
    	Syntax:"${0}（开始日期${1} 月份数）",
    	Disp:"返回表示日期的序列号，此序列号指示开始日期之前或之后的月份数。"
    },
    EOMONTH:{
    	Syntax:"${0}（开始日期${1} 月份数）",
    	Disp:"返回表示当月最后一天的序列号，此序列号指示开始日期之前或之后的月份数。"
    },
    ERFC:{   
    	Syntax:"${0}(数字)",
        Disp:"返回互补误差函数，在数字与无穷之间集成。"
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(引用)",
    	Disp:"返回与某一错误类型对应的数字。"
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
    	Syntax:"${0}(数字)",
    	Disp:"返回一个数字，该数字是向上舍入的最接近的偶数。"
    },
    EXACT:{    
    	Syntax:"${0}(文本 1${1} 文本 2)",
    	Disp: "比较两个文本字符串，如果它们完全相同，那么返回 TRUE。该函数是区分大小写的。"
    },
    EXP:{    
    	Syntax:"${0}(数字)",
    	Disp: "返回 e 的给定数字次幂。"
    },
    FACT:{  
    	Syntax:"${0}(数字)",
    	Disp:"计算一个数的阶乘。"
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(数字)",
        Disp:"返回数字的双阶乘。"
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"将逻辑值以 FALSE 返回。"
    },
    FIND:{   
    	Syntax:"${0}(查找文本${1} 文本${1} [位置])",
    	Disp:"在其他文本字符串中查找某个文本字符串（区分大小写）。"
    },
    FIXED:{
    	Syntax:"${0}(数字${1} [小数位数]${1} [无逗号])",
    	Disp:"将数字设置为具有固定小数位数的文本格式。",
    	Arguments: {
    		2 : [{
    			label : "${0} - 禁止逗号",
    			result : "TRUE"
    		}, {
    			label : "${0} - 不禁止逗号",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}（数字${1} 基数）",
    	Disp:"将数字向下舍入成其基数的最小倍数。"
    },
    FORMULA:{   
    	Syntax:"${0}(引用)",
    	Disp:"返回一个公式单元格的公式。"
    },
    FREQUENCY:{   
    	Syntax:"${0}(数字顺序列表数据${1} 数字顺序列表二进制)",
    	Disp:"将值分类为多个区段，并计算每个区段中值的个数。"
    },
    FV:{
    	Syntax:"${0}（比率${1} 期数${1} 期到期日${1} [期值]${1} [类型]）",
    	Disp:"根据固定利率来计算投资的未来价值。"
    },
    FVSCHEDULE:{    
    	Syntax:"${0}（本金${1} 计划）",
        Disp:"在应用一系列复合利率之后，计算初始本金的未来价值。"
    },
    GAMMALN:{   
    	Syntax:"${0}(数字)",
        Disp:"返回伽玛函数的自然对数。"
    },
    GCD:{   
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
        Disp:"返回所有自变量的最大公约数。"
    },
    HEX2BIN:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个十六进制数字转换成一个二进制数字。"
    }, 
    HEX2DEC:{
    	Syntax:"${0}(数字)",
    	Disp:"将一个十六进制数字转换成一个十进制数字。"
    }, 
    HEX2OCT:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个十六进制数字转换成一个八进制数字。"
    },
    HOUR:{   
    	Syntax:"${0}(数字)",
    	Disp:"确定时间值在一天中的小时 (0-23) 的序数。"
    },
    HLOOKUP:{   
    	Syntax:"${0}(搜索条件${1} 数组${1} 索引${1} [排序])",
    	Disp:"水平方向搜索某个单元格并引用其下方的单元格。",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - 近似匹配",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - 完全匹配",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(链接${1} [单元格文本])",
    	Disp:"返回的链接指向网络资源或指向链接所引用的范围。显示“单元格文本”（可选，前提是已提供）；否则，将链接显示为文本。"
    },    
    IF:{    
    	Syntax:"${0}(测试${1} [then 值]${1} [otherwise 值])",
    	Disp:"指定要执行的逻辑测试。"
    },
    IFS:{
    	Syntax:"${0}(测试 1${1} 值是否为 true 1${1} ...)",
    	Disp:"运行逻辑测试以检查是否符合一个或多个条件，并返回与第一个“TRUE”条件相匹配的值。"
    },
    IFERROR:{
    	Syntax:"${0}(值${1} 值是否出错)",
    	Disp:"如果表达式出错，则返回您指定的值。否则，返回表达式的结果。"
    },
    IFNA:{
    	Syntax:"${0}(值${1} 值是否为 na)",
    	Disp:"如果表达式返回 #N/A 错误值，则返回您指定的值。否则，返回表达式的结果。"
    },
    INDEX:{    
    	Syntax:"${0}(引用${1} 行${1} [列]${1} [范围])",
    	Disp:"返回一个已定义范围内的单元格引用。"
    },
    INDIRECT:{    
    	Syntax:"${0}(引用${1} [引用样式])",
    	Disp:"以文本格式返回所引用的单元格的内容。",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 样式",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 样式",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(数字)",
    	Disp:"将数字向下舍入为最接近的整数。"
    },
    IPMT:{
    	Syntax:"${0}(比率${1} 期${1} 期数${1} 期值${1} [终值]${1} [类型])",
    	Disp:"根据定期还款和固定利率计算投资的某个时期的利息还款金额。"
    }, 
    ISBLANK:{   
    	Syntax:"${0}(值)",
    	Disp:"如果引用的单元格为空，那么返回 TRUE，否则返回 FALSE。"
    },
    ISERR:{
    	Syntax:"${0}(值)",
    	Disp:"如果值是一个错误值且不等于 #N/A，那就返回 TRUE。"
    },
    ISERROR:{
    	Syntax:"${0}(值)",
    	Disp:"如果这个值是一个错误值，那么返回 TRUE。"
    },
    ISEVEN:{    
    	Syntax:"${0}(值)",
    	Disp:"如果这个值是偶数，那么返回 TRUE，否则返回 FALSE。" 
    },
    ISFORMULA:{    
    	Syntax:"${0}(引用)",
    	Disp:"如果这个单元格是一个公式单元格，那么返回 TRUE。"
    },
    ISLOGICAL:{    
    	Syntax:"${0}(值)",
    	Disp:"如果这个值包含逻辑数值，那么返回 TRUE。"
    },
    ISNA:{    
    	Syntax:"${0}(值)",
    	Disp:"如果值等于 #NV，那就返回 TRUE。"
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(值)",
    	Disp:"如果这个值不是文本，那就返回 true。"
    },
    ISNUMBER:{   
    	Syntax:"${0}(值)",
    	Disp:"如果这个值是一个数值，那么返回 TRUE。"
    },
    ISODD:{    
    	Syntax:"${0}(值)",
    	Disp:"如果这个值是奇整数，那么返回 TRUE。"
    },
    ISPMT:{
    	Syntax:"${0}（比率${1} 期${1} 期数${1} 期值）",
    	Disp:"计算指定投资期内支付的利息。"
    }, 
    ISREF:{    
    	Syntax:"${0}(值)",
    	Disp:"如果这个值是一个引用，那么返回 TRUE。"
    },
    ISTEXT:{    
    	Syntax:"${0}(值)",
    	Disp:"如果值是一个文本，那就返回 TRUE。"
    },
    LARGE:{
        Syntax:"${0}(数组${1} 第 n 位)",
    	Disp:"返回一组值中按从大到小排第 n 位的值。"
    },
    LCM:{   
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
        Disp:"返回列表中所有数字的最小公倍数。"
    },
    LEFT:{
        Syntax:"${0}(文本${1} [长度])",
    	Disp:"从文本开头起返回指定的字符数。"
    },
    LEN:{
    	Syntax:"${0}(文本)",
    	Disp:"返回文本字符串的长度。"
    },
    LENB:{
    	Syntax:"${0}(文本)",
    	Disp:"返回文本字符串的字节数。"
    },
    LN:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的自然对数。"
    },
    LOG:{
    	Syntax:"${0}(数字${1} [底数])",
    	Disp:"返回数字针对指定底数的对数。"
    },
    LOG10:{
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的底数为 10 的对数。"
    },
    LOOKUP:{
    	Syntax: "${0}(搜索条件${1} 搜索向量${1} [结果向量])",
    	Disp:"通过与其他向量中的值进行比较，从而确定向量中的值。"
    },
    LOWER:{    
    	Syntax:"${0}(文本)",
    	Disp:"将文本转换为小写字母。"
    },    
    MATCH:{    
    	Syntax: "${0}(搜索条件${1} 查找数组${1} [类型])",
    	Disp:"比较值之后，定义数组中的位置。",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - 小于",
         		 result : 1
         	 }, {
         		 label : "${0} - 完全匹配",
         		 result : 0
         	 }, {
         		 label : "${0} - 大于",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"返回一列自变量中的最大值。"
    },
    MEDIAN:{    
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"如果给定了奇数个值，将返回中值。否则，将返回两个中值的算术平均值。"
    },
    MID:{    
    	Syntax:"${0}(文本${1} 数字${1} 数字)",
    	Disp:"返回文本的部分文本字符串。"
    }, 
    MIN:{    
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"返回一列自变量中的最小值。"
    },    
    MINUTE:{    
    	Syntax:"${0}(数字)",
    	Disp:"确定时间值在一小时中的分钟 (0-59) 的序数。"
    },    
    MOD:{    
    	Syntax:"${0}(被除数${1} 除数)",
    	Disp:"返回除数除以被除数所得的余数。"
    },
    MODE:{    
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"返回样本中出现频率最高的值。"
    },
    MONTH:{    
    	Syntax:"${0}(数字)",
    	Disp:"返回指定日期值对应哪一月。将以 1 到 12 之间的整数返回该月。"
    },
    MROUND:{   
    	Syntax: "${0}（数字${1} 倍数）",
        Disp:"返回舍入指定倍数的数字。"
    },
    MMULT:{    
    	Syntax:"${0}(数字${1} 数组)",
    	Disp:"数组乘积。计算两个数组的乘积。"
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
        Disp:"返回一组数字的多项式系数。"
    },
    N:{    
    	Syntax:"${0}(值)",
    	Disp:"将一个值转换成一个数字。"
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"返回错误值 #NA。"
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(开始日期${1} 结束日期${1} [节假日])",
    	Disp:"返回两个日期之间相差的工作日天数。"
    },
    NOT:{    
    	Syntax:"${0}(逻辑值)",
    	Disp:"对自变量值求反。"
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"确定计算机的当前时间。"
    },
    NPV:{   
    	Syntax:"${0}（比率${1} 值 1${1} [值 2]${1} ...）",
        Disp:"根据提供的折现率以及一系列未来的支付和收入来计算投资的净现值。"
    },
    OCT2BIN:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个八进制数字转换成一个二进制数字。"
    },
    OCT2DEC:{
    	Syntax:"${0}(数字)",
    	Disp:"将一个八进制数字转换成一个十进制数字。"
    },
    OCT2HEX:{
    	Syntax:"${0}(数字${1} [位数])",
    	Disp:"将一个八进制数字转换成一个十六进制数字。"
    },
    ODD:{    
    	Syntax:"${0}(数字)",
    	Disp:"将数字朝着远离 0 的方向向上舍入为最接近的奇数。"
    },
    OFFSET:{
    	Syntax:"${0}(引用${1} 行${1} 列${1} [高度]${1} [宽度])",
    	Disp:"针对由一个单元格或单元格范围中的指定行数和列数组成的范围，返回对该范围的引用。"
    },
    OR:{    
    	Syntax:"${0}(逻辑值 1${1} [逻辑值 2]${1} ...)",
    	Disp:"只要有一个参数的逻辑值为 TRUE，即返回 TRUE。"
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"返回 Pi 的近似值。"
    },
    PMT:{
    	Syntax:"${0}(比率${1} 期数${1} 期值${1} [终值]${1} [类型])",
    	Disp:"根据定期还款和固定利率返回贷款付款。"
    },
    POWER:{    
    	Syntax:"${0}(底数${1} 幂)",
    	Disp:"数字的乘幂。"
    },
    PPMT:{
    	Syntax:"${0}(比率${1} 期${1} 期数${1} 期值${1} [终值]${1} [类型])",
    	Disp:"根据定期还款和固定利率计算投资的某个时期的还款金额。"
    },
    PRICEDISC:{
    	Syntax:"${0}（结算${1} 到期日${1} 贴现${1} 赎回${1} [基础]）",
    	Disp:"计算贴现证券每 ¥100 面值的价格。"
    },
    PRICEMAT:{
    	Syntax:"${0}（结算${1} 到期日${1} 发放${1} 比率${1} 收益${1} [基础]）",
    	Disp:"计算在到期日支付利息的证券的每 ¥100 面值的价格。"
    },
    PRODUCT:{   
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"将作为自变量给出的所有数字相乘并返回乘积。"
    },
    PROPER:{    
    	Syntax:"${0}(文本)",
    	Disp:"将文本字符串转换为适当的大小写，其中每个词语的首字母转换为大写，其他所有字母转换为小写。"
    },
    PV:{
    	Syntax:"${0}（比率${1} 期数${1} 期到期日${1} [终值]${1} [类型]）",
    	Disp:"根据一系列未来支付来计算投资的现值。"
    }, 
    QUOTIENT:{    
    	Syntax:"${0}（分子${1} 分母）",
        Disp:"返回一个数字除以另一个数字的结果，截断为整数。"
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "返回 0 到 1 之间的随机数。"
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(下限${1} 上限)",
    	Disp: "返回指定数值之间的一个随机整数。"
    },
    RANK:{    
    	Syntax:"${0}(数字${1} 引用${1} [顺序])",
    	Disp: "返回样本中的值的排名。",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - 降序",
          		 result : 0
          	 }, {
          		 label : "${0} - 升序",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}（结算${1} 到期日${1} 投资${1} 贴现${1} [基础]）",
    	Disp:"计算全额投资证券到期时收到的金额。"
    }, 
    REPLACE:{    
    	Syntax: "${0}(文本${1} 位置${1} 长度${1} 新文本)",
    	Disp:"用不同文本字符串替换某一文本字符串中的字符。"	
    },
    REPT:{    
    	Syntax: "${0}(文本${1} 计数)",
    	Disp:"将文本重复给定的次数。"	
    },
    RIGHT:{
    	Syntax: "${0}(文本${1} [数字])",
    	Disp:"返回文本的最后一个或多个字符。"
    },
    RIGHTB:{
    	Syntax: "${0}(文本${1} [数字])",
    	Disp:"返回文本的最后一个或多个字符。"
    },
    ROUND:{   
    	Syntax: "${0}(数字${1} 计数)",
    	Disp:"按预先定义的精度舍入数字。"
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(数字${1} 计数)",
    	Disp:"按预先定义的精度向下舍入数字。"
    },
    ROUNDUP:{   
    	Syntax: "${0}(数字${1} 计数)",
    	Disp:"按预先定义的精度向上舍入数字。"
    },
    ROW:{   
    	Syntax:"${0}([引用])",
    	Disp:"定义引用的内部行号。"
    },
    ROWS:{   
    	Syntax:"${0}(数组)",
    	Disp:"返回在数组或引用中的行数。"
    },
    RADIANS:{   
    	Syntax:"${0}(角度)",
    	Disp:"将度数转换为弧度。"
    },
    ROMAN:{   
    	Syntax:"${0}(数字${1} [形式])",
    	Disp:"将阿拉伯数字转换为罗马数字（以文本形式）。",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 经典",
          		 result : 0
          	 }, {
          		 label : "${0} - 更简洁",
          		 result : 1
          	 }, {
          		 label : "${0} - 更简洁",
          		 result : 2
          	 }, {
          		 label : "${0} - 更简洁",
          		 result : 3
          	 }, {
          		 label : "${0} - 简化",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(查找文本${1} 文本${1} [位置])",
    	Disp:"在其他文本值中查找某个文本字值（不区分大小写）。"
    },  
    SIGN:{    
    	Syntax:"${0}(数字)",
        Disp:"返回数字的代数符号。"
    },
    SIN:{    
    	Syntax:"${0}(数字)",
    	Disp:"返回给定角度的正弦。"
    },
    SINH:{    
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的双曲正弦。"
    },
    SECOND:{    
    	Syntax:"${0}(数字)",
    	Disp:"确定时间值在一分钟中的秒 (0-59) 的序数。"
    },
    SERIESSUM:{    
    	Syntax:"${0}（x${1} n${1} m${1} 系数）",
        Disp:"基于公式返回幂级数之和。"
    },
    SHEET:{   
    	Syntax:"${0}([引用])",
    	Disp:"返回一个引用或字符串的内部工作表号。"
    },
    SMALL:{   
    	Syntax:"${0}(数组${1} 第 n 位)",
    	Disp:"返回一组值中按从小到大排第 n 位的值。"
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(文本${1} 旧文本${1} 新文本${1})",
    	Disp:"在将旧文本替换为新文本之后，返回结果文本。"
    },
    SUBTOTAL:{   
    	Syntax:"${0}(函数${1} 范围${1} ...)",
    	Disp:"计算电子表格中的小计。",
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
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"返回自变量的求和值。"
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(数组 1${1} [数组 2]${1} ...)",
    	Disp:"返回数组参数的乘积之和。"
    },
    SUMIF:{   
    	Syntax:"${0}(范围${1} 条件${1} [求和范围])",
    	Disp:"对符合条件的自变量求和。"
    },
    SUMIFS:{
    	Syntax: "${0}(求和范围${1} 条件范围 1${1} 条件 1${1} ...)",
    	Disp:"对符合多个条件的自变量求和。"
    },
    SQRT:{   
    	Syntax:"${0}(数字)",
    	Disp:"返回数字的平方根。"
    },
    SQRTPI:{   
    	Syntax:"${0}(数字)",
        Disp:"返回（数字 * pi）的平方根。"
    },
    STDEV:
    {
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"基于样本计算标准偏差。"
    },
    STDEVP:
    {
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
    	Disp:"基于全体数值计算标准偏差。"
    },
    SUMSQ:{
    	Syntax:"${0}(数字 1${1} [数字 2]${1} ...)",
        Disp:"返回列表中数字的平方和。"
    },
    T:{
    	Syntax:"${0}(文本)",
    	Disp:"将参数转换为文本。"
    },
    TAN:{    
    	Syntax:"${0}(数字)",
        Disp:"返回给定数字的正切。"
    },
    TANH:{    
    	Syntax:"${0}(数字)",
        Disp:"返回给定数字的双曲正切。"
    },
    TBILLPRICE:{
    	Syntax:"${0}（结算${1} 到期日${1} 贴现）",
    	Disp:"计算国库券的每 ¥100 面值的价格。"
    },
    TEXT:{
    	Syntax:"${0}(值${1} 格式代码)",
    	Disp:"根据数字格式代码的规则将值转换为文本并返回该文本。"
    },
    TIME:{   
    	Syntax:"${0}(小时${1} 分钟${1} 秒)",
    	Disp:"通过小时、分钟和秒的详细信息确定时间值。"
    },
    TIMEVALUE:{	
	    Syntax:"${0}(文本)",
	    Disp:"针对可能具有时间格式的文本返回一个内部数字。"
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"确定计算机的当前日期。"
    },    
    TRIM:{
    	Syntax:"${0}(文本)",
    	Disp:"除去所有前置和尾随的空格。所有其他的 2 个或更多个连续内部空格都将替换为单个空格。"
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"返回逻辑值 TRUE。"
    },
    TRUNC:{   
    	Syntax:"${0}(数字${1} [计数])",
    	Disp:"去除数字的小数位。"
    },
    TYPE:{   
    	Syntax:"${0}(值)",
    	Disp:"定义值的数据类型。"	
    },
    UPPER:{  
    	Syntax: "${0}(文本)",
    	Disp:"将文本转换成大写字母。"
    },
    VALUE:{    
    	Syntax: "${0}(文本)",
    	Disp:"将文本参数转换成数字。"
    },
    VAR:{    
    	Syntax: "${0}(数字 1${1} [数字 2]${1}...)",
    	Disp:"基于采样估算方差。"
    },
    VARA:{    
    	Syntax: "${0}(数字 1${1} [数字 2]${1}...)",
    	Disp:"基于采样估算方差，包括数字、文本和逻辑值。"
    },
    VARP:{    
    	Syntax: "${0}(数字 1${1} [数字 2]${1}...)",
    	Disp:"基于全体数值计算方差。"
    },
    VARPA:{    
    	Syntax: "${0}(数字 1${1} [数字 2]${1}...)",
    	Disp:"基于全体数值计算方差，包括数字、文本和逻辑值。"
    },
    VLOOKUP:{    
    	Syntax: "${0}(搜索条件${1} 数组${1} 索引${1} [排序顺序])",
    	Disp:"垂直搜索并引用指定的单元格。",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - 近似匹配",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - 完全匹配",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(数字${1} [类型])",
    	Disp:"以整数值返回星期几的日期值。",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 数字 1（周日）至 7（周六）",
          		 result : 1
          	 }, {
          		 label : "${0} - 数字 1（周一）至 7（周日）",
          		 result : 2
          	 }, {
          		 label : "${0} - 数字 0（周一）至 6（周日）",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - 数字 1（周一）至 7（周日）",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - 数字 1（周二）至 7（周一）",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - 数字 1（周三）至 7（周二）",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - 数字 1（周四）至 7（周三）",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - 数字 1（周五）至 7（周四）",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - 数字 1（周六）至 7（周五）",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - 数字 1（周日）至 7（周六）",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(数字${1} [模])",
    	Disp:"计算与给定日期对应的日历周。",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 周日",
          		 result : 1
          	 }, {
          		 label : "${0} - 周一",
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
    	Syntax:"${0}(开始日期${1} 天数${1} [节假日])",
    	Disp:"返回在某日期之前或之后，与该日期相隔指定工作日的某一日期的日期值。"
    },
    XNPV:{   
    	Syntax:"${0}（比率${1} 值${1} 日期）",
    	Disp:"计算现金流量表的净现值。"
    },
    YEAR:{    
    	Syntax:"${0}(数字)",
    	Disp:"以整数返回年份的日期值。"
    }
}
})

