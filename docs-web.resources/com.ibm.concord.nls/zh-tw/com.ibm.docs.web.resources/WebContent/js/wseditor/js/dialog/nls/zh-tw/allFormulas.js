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
	LABEL_FORMULA_LIST: "公式清單：",
	formula:{
	ABS:{	
	    Syntax:"${0}(數字)",
	    Disp:"傳回數字的絕對值。"
    },
    ACOS:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的反餘弦值。傳回的角度以弧度表示。"
    },
    ACOSH:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的反雙曲線餘弦。"
    },
    ACOT:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回數字的反餘切。角度以弧度測量。"
    },
    ACOTH:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回數字的反雙曲線餘切。"
    },
    ADDRESS:{
         Syntax:"${0}(列${1} 欄${1} [絕對]${1} [a1]${1} [工作表])",
         Disp:"傳回代表資料格位置的文字。",
         Arguments: {
        	 2 : [{
        		 label : "${0} - 絕對",
        		 result : 1
        	 }, {
        		 label : "${0} - 絕對列/相對欄",
        		 result : 2
        	 }, {
        		 label : "${0} - 相對列/絕對欄",
        		 result : 3
        	 }, {
        		 label : "${0} - 相對",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 樣式",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 樣式",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(邏輯值 1${1} [邏輯值 2]${1} ...)",
    	Disp:"當所有引數皆為 TRUE 時，會傳回 TRUE。"
    },
    ASIN:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的反正弦值。傳回的角度以弧度表示。"
    },
    ASINH:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的反雙曲線正弦。"
    },
    ATAN:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的反正切值。傳回的角度以弧度表示。"
    },
    AVERAGE:{    
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"傳回引數的平均值。"
    },
    AVERAGEA:{    
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"傳回樣本的平均值。文字評估為零。"
    },
    AVERAGEIF:{    
    	Syntax:"${0}(範圍${1} 準則${1} [平均範圍])",
    	Disp:"傳回符合給定條件引數的平均值（算術平均值）。"
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(平均範圍${1} 準則範圍1${1} 準則1${1} ...)",
    	Disp:"傳回符合多個條件引數的平均值（算術平均值）。"
    },
    ATAN2:{
    	Syntax:"${0}(x 值${1} y 值)",
    	Disp:"傳回指定的 x 及 y 座標之反正切 (arctangent / inverse tangent)。反正切是指從 X 軸到一條包含原點 (0, 0) 及座標點 (x_num, y_num) 之直線的角度。"
    },
    ATANH:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的雙曲線的反正切。數字必須介於 -1 到 1 之間（不含 -1 及 1）。"
    },
    BASE:{    
    	Syntax:"${0}(數字${1} 基數${1} [長度下限])",
    	Disp:"將數字系統的正整數轉換成定義基數的文字。"
    },
    BIN2DEC:{
    	Syntax:"${0}(數字)",
    	Disp:"將二進位數轉換成十進位數。"
    }, 
    BIN2HEX:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將二進位數轉換成十六進位數。"
    }, 
    BIN2OCT:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將二進位數轉換成八進位數。"
    },
    CEILING:{  
    	Syntax: "${0}(數字${1} 增量)",
    	Disp:"將數字無條件進位為最接近的整數或基數倍數。"
    },
    CHAR: {
    	Syntax: "${0}(數字)",
    	Disp: "傳回數字所對映的字元。會在 Unicode 字元對映中尋找字元。數字在 1 和 255 之間。"
    },
    CHOOSE: {
    	Syntax: "${0}(索引${1} 值1${1} [值2]${1} ...)",
    	Disp: "根據索引尋找並傳回對應值。最多可以從 30 個值中選擇。"
    },
    CODE:{
    	Syntax:"${0}(文字)",
    	Disp:"傳回 Unicode 編碼的文字字串中，第一個字元的數字碼。"
    },
    COLUMN:{    
    	Syntax:"${0}([參照])",
    	Disp:"傳回參照的內部直欄號碼。"
    },
    COLUMNS:{    
    	Syntax:"${0}(陣列)",
    	Disp:"傳回陣列或參照中的直欄數。"
    },
    COMBIN:{
    	Syntax:"${0}(數字${1} 選擇的數字)",
    	Disp:"傳回指定項目數的組合數。請使用 ${0} 判定所指定之項目數的群組可能總數。"
    },
    CONCATENATE:{   
    	Syntax:"${0}(文字 1${1} ...)",
    	Disp:"將數個字串結合成一個字串。"
    },
    CONVERT:{
    	Syntax:"${0}(數字${1} 從_單位${1} 至_單位)",
    	Disp:"將數字從一個測量系統轉換到另一個測量系統。",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - 公克",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - 斯勒格",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - 磅質量（體重）",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U（原子量單位）",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - 盎司質量（體重）",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - 公尺",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - 法定英里",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - 英吋",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - 英尺",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - 碼",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - 埃",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - 1/6 英吋",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - 年",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - 天",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - 小時",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - 分鐘",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - 秒",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - 帕斯卡",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - 大氣壓",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - 毫米汞柱（托）",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - 牛頓",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - 達因",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - 磅力",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - 焦耳",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - 爾格",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - 國際卡路里",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - 電子伏特",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - 馬力小時",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - 瓦特小時",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - 英尺磅",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - 熱力學卡路里",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - 馬力",
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
       		 label : "${0} - 攝氏度",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - 華氏度",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - 開氏",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - 茶匙",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - 湯匙",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - 液盎司",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - 杯",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - 美制品脫",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - 英制品脫",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - 夸脫",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - 加侖",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - 公升",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回指定角度的餘弦。"
    },
    COSH:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的雙曲線餘弦。"
    },
    COT:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回指定數字的餘切。"
    },
    COTH:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回指定數字的雙曲線餘切。"
    },
    COUNT:{   
    	Syntax:"${0}(值1${1} [值2]${1} ...)",
    	Disp:"計算引數清單中有多少個數字。文字項目會被忽略。"
    },
    COUNTA:{   
    	Syntax:"${0}(值1${1} [值2]${1} ...)",
    	Disp:"計算引數清單中有多少個值。"
    },
    COUNTBLANK:{   
    	Syntax:"${0}(範圍)",
    	Disp: "計算指定範圍內的空白資料格數目。"
    },
    COUNTIF:{
    	Syntax: "${0}(範圍${1} 準則)",
    	Disp:"計算符合給定條件的資料格數目。"
    },
    COUNTIFS:{
    	Syntax: "${0}(準則範圍1${1} 準則1${1} ...)",
    	Disp:"計算符合多個條件的資料格數目。"
    },
    CUMIPMT:{	
	    Syntax:"${0}(利率${1} 總期數${1} 現值總和${1} 第一期${1} 最後一期${1} 類型)",
	    Disp:"計算在兩個指定期之間所支付的累積利息。"
    },
    CUMPRINC:{	
	    Syntax:"${0}(利率${1} 總期數${1} 現值總和${1} 第一期${1} 最後一期${1} 類型)",
	    Disp:"計算在兩個指定期之間所支付的累積貸款本金。"
    }, 
    DATE:{	
	    Syntax:"${0}(年${1} 月${1} 日)",
	    Disp:"為指定的日期提供一個內部數字。"
    },  
    DATEDIF:{	
	    Syntax:"${0}(開始日期${1} 結束日期${1} 格式)",
	    Disp:"傳回兩個日期之間的年數、月數或日數差異。",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - 期間內的完整年數。",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - 期間內的完整月數。",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - 期間內的天數。",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - 開始日期到結束日期之間的天數（忽略月份及年份）。",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - 開始日期到結束日期之間的月數（忽略年份）。",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - 開始日期到結束日期之間的天數（忽略年份）。",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(文字)",
	    Disp:"針對可能有日期格式的文字傳回內部數字。"
    }, 
    DAY:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回給定日期值的日期。傳回的日期會是介於 1 到 31 之間的整數。您也可以輸入負數的日期/時間值。"
    },
    DAYS360:{
    	Syntax:"${0}(開始日期${1} 結束日期${1} [方法])",
    	Disp:"以一年 360 天計算兩個日期之間的天數。",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - 美制 (NASD) 方法",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - 歐制方法",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(開始日期${1} 結束日期${1})",
    	Disp:"計算兩個日期之間的天數。"
    },
    DEC2BIN:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將十進位數轉換成二進位數。"
    }, 
    DEC2HEX:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將十進位數轉換成十六進位數。"
    },
    DEC2OCT:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將十進位數轉換成八進位數。"
    },
    DEGREES:{	
	    Syntax:"${0}(角度)",
	    Disp:"將弧度轉換成度數。"
    },
    DISC:{
    	Syntax:"${0}(結算${1} 到期${1} 價格${1} 贖回${1} [基準])",
    	Disp:"計算證券的貼現率。"
    }, 
    DOLLAR:{
    	Syntax:"${0}(數字${1} [小數位數])",
    	Disp:"將數字轉換為文字，並使用 $（錢號）貨幣格式。"
    },
    EDATE:{
    	Syntax:"${0} (開始日期${1} 月)",
    	Disp:"傳回代表日期的序號，它是在開始日期之前或之後月份的指示數字"
    },
    EOMONTH:{
    	Syntax:"${0} (開始日期${1} 月)",
    	Disp:"傳回月份中最後一天的序號，它是在開始日期之前或之後月份的指示數字"
    },
    ERFC:{   
    	Syntax:"${0}(數字)",
        Disp:"傳回互補誤差函數，此為從某個數字到無限值之間的積分。"
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(參照)",
    	Disp:"傳回與某個錯誤類型相對應的數字。"
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
    	Syntax:"${0}(數字)",
    	Disp:"傳回四捨五入為最接近之偶數整數的數字。"
    },
    EXACT:{    
    	Syntax:"${0}(文字 1${1} 文字 2)",
    	Disp: "比較兩個字串，若相同則傳回 TRUE。此函數須區分大小寫。"
    },
    EXP:{    
    	Syntax:"${0}(數字)",
    	Disp: "傳回指定數字的 e 次方值。"
    },
    FACT:{  
    	Syntax:"${0}(數字)",
    	Disp:"計算一個數的階乘。"
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(數字)",
        Disp:"傳回數字的雙階乘。"
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"傳回邏輯值 FALSE。"
    },
    FIND:{   
    	Syntax:"${0}(尋找文字${1} 文字${1} [位置])",
    	Disp:"在另一個文字內尋找某個文字字串（區分大小寫）。"
    },
    FIXED:{
    	Syntax:"${0}(數字${1} [小數位數]${1} [無逗號])",
    	Disp:"將數字格式化成文字，並使用固定的小數位數。",
    	Arguments: {
    		2 : [{
    			label : "${0} - 不允許逗點",
    			result : "TRUE"
    		}, {
    			label : "${0} - 允許逗點",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(數字 ${1} 基數)",
    	Disp:"將數字無條件捨去為最接近的基數倍數。"
    },
    FORMULA:{   
    	Syntax:"${0}(參照)",
    	Disp:"傳回公式資料格的公式。"
    },
    FREQUENCY:{   
    	Syntax:"${0}(數字序列清單_資料${1} 數字序列清單_區間)",
    	Disp:"將值分類為幾個區間，並計算每一個區間的值數目。"
    },
    FV:{
    	Syntax:"${0}(利率${1} 總期數${1} 每期應付金額${1} [現值]${1} [類型])",
    	Disp:"根據固定利率計算投資的未來價值。"
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(本金${1} 明細表)",
        Disp:"計算在套用一系列複利率之後，初始本金的未來價值。"
    },
    GAMMALN:{   
    	Syntax:"${0}(數字)",
        Disp:"傳回 gamma 函數的自然對數。"
    },
    GCD:{   
    	Syntax:"${0}(數字1${1} [數字 2]${1} ...)",
        Disp:"傳回所有引數的最大公因數。"
    },
    HEX2BIN:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將十六進位數轉換成二進位數。"
    }, 
    HEX2DEC:{
    	Syntax:"${0}(數字)",
    	Disp:"將十六進位數轉換成十進位數。"
    }, 
    HEX2OCT:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將十六進位數轉換成八進位數。"
    },
    HOUR:{   
    	Syntax:"${0}(數字)",
    	Disp:"決定時間值的小時 (0-23) 部分。"
    },
    HLOOKUP:{   
    	Syntax:"${0}(搜尋準則${1} 陣列${1} 索引${1} [排序])",
    	Disp:"水平搜尋資料格並參照其下方的資料格。",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - 大概相符",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - 完全相符",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}（鏈結${1} [資料格文字]）",
    	Disp:"傳回指向網路資源的鏈結，或指向鏈結所參照範圍的鏈結。顯示提供的資料格文字（選用）；否則，會將鏈結顯示為文字。"
    },    
    IF:{    
    	Syntax:"${0}(測試${1} [then 值]${1} [otherwise 值])",
    	Disp:"指定要執行的邏輯測試。"
    },
    IFS:{
    	Syntax:"${0}(測試1${1} true時的值1${1} ...)",
    	Disp:"執行邏輯測試來檢查是否符合一個以上條件，並傳回符合第一個 TRUE 條件的值。"
    },
    IFERROR:{
    	Syntax:"${0}(值${1} 發生錯誤時的值)",
    	Disp:"傳回您指定當表示式為錯誤時的值。否則傳回表示式的結果。"
    },
    IFNA:{
    	Syntax:"${0}(值${1} 不適用時的值)",
    	Disp:"傳回您指定當表示式傳回 #N/A 錯誤值時的值。否則傳回表示式的結果。"
    },
    INDEX:{    
    	Syntax:"${0}(參照${1} 列${1} [欄]${1} [範圍])",
    	Disp:"從定義的範圍傳回資料格的參照。"
    },
    INDIRECT:{    
    	Syntax:"${0}(參照${1} [參照樣式])",
    	Disp:"傳回文字表格中所參照的資料格內容。",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 樣式",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 樣式",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(數字)",
    	Disp:"將數字無條件捨去成最接近的整數。"
    },
    IPMT:{
    	Syntax:"${0}(利率${1} 期次${1} 總期數${1} 現值總和${1} [終值]${1} [類型])",
    	Disp:"根據定期付款和固定利率計算某項投資某段期間的利息償還金額。"
    }, 
    ISBLANK:{   
    	Syntax:"${0}(值)",
    	Disp:"若參照的資料格空白則傳回 TRUE，否則傳回 FALSE。"
    },
    ISERR:{
    	Syntax:"${0}(值)",
    	Disp:"如果一個錯誤值不等於 #N/A，那就傳回 TRUE。"
    },
    ISERROR:{
    	Syntax:"${0}(值)",
    	Disp:"若值為錯誤值，則傳回 TRUE。"
    },
    ISEVEN:{    
    	Syntax:"${0}(值)",
    	Disp:"若值為偶數則傳回 TRUE，否則傳回 FALSE。" 
    },
    ISFORMULA:{    
    	Syntax:"${0}(參照)",
    	Disp:"若資料格為公式資料格，則傳回 TRUE。"
    },
    ISLOGICAL:{    
    	Syntax:"${0}(值)",
    	Disp:"若值帶有邏輯數，則傳回 TRUE。"
    },
    ISNA:{    
    	Syntax:"${0}(值)",
    	Disp:"如果這個值等於 #N/A，那就傳回 TRUE。"
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(值)",
    	Disp:"若值不是文字，則傳回 true。"
    },
    ISNUMBER:{   
    	Syntax:"${0}(值)",
    	Disp:"若值為數字，則傳回 TRUE。"
    },
    ISODD:{    
    	Syntax:"${0}(值)",
    	Disp:"若值為奇數整數，則傳回 TRUE。"
    },
    ISPMT:{
    	Syntax:"${0}(利率${1} 期次${1} 總期數${1} 現值總和)",
    	Disp:"計算在指定期間支付的投資利息。"
    }, 
    ISREF:{    
    	Syntax:"${0}(值)",
    	Disp:"若值為參照，則傳回 TRUE。"
    },
    ISTEXT:{    
    	Syntax:"${0}(值)",
    	Disp:"如果值是文字，則傳回 TRUE。"
    },
    LARGE:{
        Syntax:"${0}(陣列${1} 第 n 個位置)",
    	Disp:"傳回一組值中第 n 大的值。"
    },
    LCM:{   
    	Syntax:"${0}(數字1${1} [數字 2]${1} ...)",
        Disp:"傳回清單中所有數字的最小公倍數。"
    },
    LEFT:{
        Syntax:"${0}(文字${1} [長度])",
    	Disp:"從文字開頭傳回指定長度之間的所有字元。"
    },
    LEN:{
    	Syntax:"${0}(文字)",
    	Disp:"傳回字串的長度。"
    },
    LENB:{
    	Syntax:"${0}(文字)",
    	Disp:"傳回字串的位元組數。"
    },
    LN:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的自然對數。"
    },
    LOG:{
    	Syntax:"${0}(數字${1} [基數])",
    	Disp:"以指定基數傳回數字的對數。"
    },
    LOG10:{
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字以底數為 10 的對數。"
    },
    LOOKUP:{
    	Syntax: "${0}(搜尋準則${1} 搜尋向量${1} [結果向量])",
    	Disp:"透過與另一個向量中的值進行比較，來確定向量中的值。"
    },
    LOWER:{    
    	Syntax:"${0}(文字)",
    	Disp:"將文字轉換為小寫。"
    },    
    MATCH:{    
    	Syntax: "${0}(搜尋準則${1} 查閱陣列${1} [類型])",
    	Disp:"在比較值之後定義陣列中的位置。",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - 小於",
         		 result : 1
         	 }, {
         		 label : "${0} - 完全相符",
         		 result : 0
         	 }, {
         		 label : "${0} - 大於",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"傳回引數清單中的最大值。"
    },
    MEDIAN:{    
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"如果指定奇數個值，則會傳回中間值。否則會傳回兩個中間值的算術平均值。"
    },
    MID:{    
    	Syntax:"${0}(文字${1} 數字${1} 數字)",
    	Disp:"傳回文字的部分字串。"
    }, 
    MIN:{    
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"傳回引數清單中的最小值。"
    },    
    MINUTE:{    
    	Syntax:"${0}(數字)",
    	Disp:"決定時間值的分鐘 (0-59) 部分。"
    },    
    MOD:{    
    	Syntax:"${0}(被除數${1} 除數)",
    	Disp:"傳回被除數除以除數之後的餘數。"
    },
    MODE:{    
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"傳回樣本中頻率最高的數值。"
    },
    MONTH:{    
    	Syntax:"${0}(數字)",
    	Disp:"傳回給定日期值的月份。傳回的月份會是介於 1 到 12 之間的整數。"
    },
    MROUND:{   
    	Syntax: "${0}(數字${1} 倍數)",
        Disp:"傳回四捨五入到指定倍數的數字。"
    },
    MMULT:{    
    	Syntax:"${0}(陣列${1} 陣列)",
    	Disp:"陣列乘積。傳回兩個陣列的乘積。"
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(數字1${1} [數字 2]${1} ...)",
        Disp:"傳回一組數字的多項式係數。"
    },
    N:{    
    	Syntax:"${0}(值)",
    	Disp:"將值轉換成數字。"
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"傳回錯誤值 #N/A。"
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(開始日期${1} 結束日期${1} [假日])",
    	Disp:"傳回兩個日期之間的工作天數。"
    },
    NOT:{    
    	Syntax:"${0}(邏輯值)",
    	Disp:"傳回引數的反值。"
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"決定電腦目前的時間。"
    },
    NPV:{   
    	Syntax:"${0}(利率${1} 值 1${1} [值 2]${1} ...)",
        Disp:"根據提供的貼現率及一系列未來付款與收入，計算投資的淨現值。"
    },
    OCT2BIN:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將八進位數轉換成二進位數。"
    },
    OCT2DEC:{
    	Syntax:"${0}(數字)",
    	Disp:"將八進位數轉換成十進位數。"
    },
    OCT2HEX:{
    	Syntax:"${0}(數字${1} [位數])",
    	Disp:"將八進位數轉換成十六進位數。"
    },
    ODD:{    
    	Syntax:"${0}(數字)",
    	Disp:"將數字無條件進位至最接近的奇數，其中「進位」表示「遠離 0」。"
    },
    OFFSET:{
    	Syntax:"${0}(參照${1} 列數${1} 欄數${1} [高度]${1} [寬度])",
    	Disp:"傳回從一個資料格或某個範圍的資料格算起，指定的列數和欄數的範圍參照。"
    },
    OR:{    
    	Syntax:"${0}(邏輯值 1${1} [邏輯值 2]${1} ...)",
    	Disp:"若至少有一個引數為 TRUE，則傳回 TRUE。"
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"傳回 Pi 的大約值。"
    },
    PMT:{
    	Syntax:"${0}(利率${1} 總期數${1} 現值總和${1} [終值]${1} [類型])",
    	Disp:"根據定期付款和固定利率傳回貸款的付款。"
    },
    POWER:{    
    	Syntax:"${0}(基數${1} 次方)",
    	Disp:"求出基數的次方值。"
    },
    PPMT:{
    	Syntax:"${0}(利率${1} 期次${1} 總期數${1} 現值總和${1} [終值]${1} [類型])",
    	Disp:"根據定期付款和固定利率計算某項投資某段期間的償還金額。"
    },
    PRICEDISC:{
    	Syntax:"${0}(結算${1} 到期${1} 貼現${1} 贖回${1} [基準])",
    	Disp:"計算每 $100 美元面值貼現證券的價格。"
    },
    PRICEMAT:{
    	Syntax:"${0}(結算${1} 到期${1} 發行${1} 利率${1} 收益${1} [基準])",
    	Disp:"計算每 $100 美元面值到期付息證券的價格。"
    },
    PRODUCT:{   
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"將所有作為引數的給定數字相乘，傳回其乘積。"
    },
    PROPER:{    
    	Syntax:"${0}(文字)",
    	Disp:"將字串轉換成適當的大小寫；將每一個字的第一個字母轉換成大寫，所有其他字母轉換成小寫。"
    },
    PV:{
    	Syntax:"${0}(利率${1} 總期數${1} 每期應付金額${1} [終值]${1} [類型])",
    	Disp:"根據一系列未來付款，計算投資的現值。"
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(分子${1} 分母)",
        Disp:"傳回數字除以另一個數字的結果，截斷至整數。"
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "傳回 0 到 1 之間的亂數。"
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(底端${1} 頂端)",
    	Disp: "依您指定的數字範圍傳回隨機整數。"
    },
    RANK:{    
    	Syntax:"${0}(數字${1} 參照${1} [順序])",
    	Disp: "傳回樣本中值的排位。",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - 遞減",
          		 result : 0
          	 }, {
          		 label : "${0} - 遞增",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(結算${1} 到期${1} 投資${1} 貼現${1} [基準])",
    	Disp:"計算全額投資的證券到期金額。"
    }, 
    REPLACE:{    
    	Syntax: "${0}(文字${1} 位置${1} 長度${1} 新文字)",
    	Disp:"用某字串取代另一字串中的字元。"	
    },
    REPT:{    
    	Syntax: "${0}(文字${1} 計數)",
    	Disp:"依照指定的次數重複顯示文字。"	
    },
    RIGHT:{
    	Syntax: "${0}(文字${1} [數字])",
    	Disp:"傳回文字的最後一個或最後幾個字元。"
    },
    RIGHTB:{
    	Syntax: "${0}(文字${1} [數字])",
    	Disp:"傳回文字的最後一個或最後幾個字元。"
    },
    ROUND:{   
    	Syntax: "${0}(數字${1} 計數)",
    	Disp:"將數字四捨五入至預先定義的位數。"
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(數字${1} 計數)",
    	Disp:"將數字無條件捨去成預先定義的位數。"
    },
    ROUNDUP:{   
    	Syntax: "${0}(數字${1} 計數)",
    	Disp:"將數字無條件進位至預先定義的位數。"
    },
    ROW:{   
    	Syntax:"${0}([參照])",
    	Disp:"定義參照的內部列號。"
    },
    ROWS:{   
    	Syntax:"${0}(陣列)",
    	Disp:"傳回陣列或參照中的列數。"
    },
    RADIANS:{   
    	Syntax:"${0}(角度)",
    	Disp:"將度數轉換為弧度。"
    },
    ROMAN:{   
    	Syntax:"${0}(數字${1} [格式])",
    	Disp:"將阿拉伯數字轉換成羅馬文字。",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 古典",
          		 result : 0
          	 }, {
          		 label : "${0} - 精簡",
          		 result : 1
          	 }, {
          		 label : "${0} - 精簡",
          		 result : 2
          	 }, {
          		 label : "${0} - 精簡",
          		 result : 3
          	 }, {
          		 label : "${0} - 簡化",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(尋找文字${1} 文字${1} [位置])",
    	Disp:"在另一個文字值中尋找某文字值（不區分大小寫）。"
    },  
    SIGN:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回數字的代數記號。"
    },
    SIN:{    
    	Syntax:"${0}(數字)",
    	Disp:"傳回指定角度的正弦。"
    },
    SINH:{    
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的雙曲線正弦。"
    },
    SECOND:{    
    	Syntax:"${0}(數字)",
    	Disp:"決定時間值的秒鐘 (0-59) 部分。"
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} 係數)",
        Disp:"傳回基於公式的冪級數的總和。"
    },
    SHEET:{   
    	Syntax:"${0}([參照])",
    	Disp:"傳回參照或字串的內部工作表號碼。"
    },
    SMALL:{   
    	Syntax:"${0}(陣列${1} 第 n 個位置)",
    	Disp:"傳回一組值中第 n 小的值。"
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(文字${1} 舊值${1} 新值${1} [哪一個])",
    	Disp:"將舊文字換成新文字之後傳回文字。"
    },
    SUBTOTAL:{   
    	Syntax:"${0}(函數${1} 範圍${1} ...)",
    	Disp:"計算試算表中的小計。",
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
    	Syntax:"${0}(數字1${1} [數字 2]${1} ...)",
    	Disp:"傳回所有引數的總和。"
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(陣列 1${1} [陣列 2]${1} ...)",
    	Disp:"傳回陣列引數乘積的和。"
    },
    SUMIF:{   
    	Syntax:"${0}(範圍${1} 準則${1} [總和範圍])",
    	Disp:"根據條件加總引數。"
    },
    SUMIFS:{
    	Syntax: "${0}(總和範圍${1} 準則範圍1${1} 準則1${1} ...)",
    	Disp:"加總符合多個條件的引數。"
    },
    SQRT:{   
    	Syntax:"${0}(數字)",
    	Disp:"傳回數字的平方根。"
    },
    SQRTPI:{   
    	Syntax:"${0}(數字)",
        Disp:"傳回 (數字 * pi) 的平方根。"
    },
    STDEV:
    {
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"根據樣本計算標準差。"
    },
    STDEVP:
    {
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
    	Disp:"根據整個母體計算標準差。"
    },
    SUMSQ:{
    	Syntax:"${0}(數字 1${1} [數字 2]${1} ...)",
        Disp:"傳回清單中數字平方的總和。"
    },
    T:{
    	Syntax:"${0}(文字)",
    	Disp:"將其引數轉換為文字。"
    },
    TAN:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回指定數字的正切。"
    },
    TANH:{    
    	Syntax:"${0}(數字)",
        Disp:"傳回指定數字的雙曲線正切。"
    },
    TBILLPRICE:{
    	Syntax:"${0}(結算${1} 到期${1} 貼現)",
    	Disp:"計算每 $100 美元面值國庫券的價格。"
    },
    TEXT:{
    	Syntax:"${0}(值${1} 格式代碼)",
    	Disp:"根據數字格式代碼的規則，將值轉換成文字並傳回。"
    },
    TIME:{   
    	Syntax:"${0}(小時${1} 分鐘${1} 秒)",
    	Disp:"決定時間值，包含小時、分鐘和秒鐘的詳細資料。"
    },
    TIMEVALUE:{	
	    Syntax:"${0}(文字)",
	    Disp:"針對可能有時間格式的文字傳回內部數字。"
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"決定電腦內部時鐘目前的日期。"
    },    
    TRIM:{
    	Syntax:"${0}(文字)",
    	Disp:"移除所有的前導與尾端空格。任何其他 2 個或更多的連續內部空格，都會替換成單一空格。"
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"傳回邏輯值 TRUE。"
    },
    TRUNC:{   
    	Syntax:"${0}(數字${1} [計數])",
    	Disp:"去除數字的小數位數。"
    },
    TYPE:{   
    	Syntax:"${0}(值)",
    	Disp:"定義值的資料類型。"	
    },
    UPPER:{  
    	Syntax: "${0}(文字)",
    	Disp:"將文字轉換成大寫字母。"
    },
    VALUE:{    
    	Syntax: "${0}(文字)",
    	Disp:"將文字引數轉換為數字。"
    },
    VAR:{    
    	Syntax: "${0}(數字1${1} [數字2]${1}...)",
    	Disp:"計算樣本的變異數。"
    },
    VARA:{    
    	Syntax: "${0}(數字1${1} [數字2]${1}...)",
    	Disp:"預估樣本的變異數，包括數字、文字及邏輯值。"
    },
    VARP:{    
    	Syntax: "${0}(數字1${1} [數字2]${1}...)",
    	Disp:"計算整個母體的變異數。"
    },
    VARPA:{    
    	Syntax: "${0}(數字1${1} [數字2]${1}...)",
    	Disp:"計算整個母體的變異數，包括數字、文字及邏輯值。"
    },
    VLOOKUP:{    
    	Syntax: "${0}(搜尋準則${1} 陣列${1} 索引${1} [排序順序])",
    	Disp:"垂直搜尋並參照指示的資料格。",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - 大概相符",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - 完全相符",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(數字${1} [類型])",
    	Disp:"將日期值的星期幾以整數傳回。",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 數字 1（週日）至 7（週六）",
          		 result : 1
          	 }, {
          		 label : "${0} - 數字 1（週一）至 7（週日）",
          		 result : 2
          	 }, {
          		 label : "${0} - 數字 0（週一）至 6（週日）",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - 數字 1（週一）至 7（週日）",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - 數字 1（週二）至 7（週一）",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - 數字 1（週三）至 7（週二）",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - 數字 1（週四）至 7（週三）",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - 數字 1（週五）至 7（週四）",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - 數字 1（週六）至 7（週五）",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - 數字 1（週日）至 7（週六）",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(數字${1} [模式])",
    	Disp:"計算指定日期在一年中的第幾週。",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 週日",
          		 result : 1
          	 }, {
          		 label : "${0} - 週一",
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
    	Syntax:"${0}(開始日期${1} 天數${1} [假日])",
    	Disp:"傳回指定日期之前或之後的工作天數的日期。"
    },
    XNPV:{   
    	Syntax:"${0}(利率${1} 值${1} 日期)",
    	Disp:"計算現金流量明細表的淨現值。"
    },
    YEAR:{    
    	Syntax:"${0}(數字)",
    	Disp:"傳回代表日期值年度的整數。"
    }
}
})

