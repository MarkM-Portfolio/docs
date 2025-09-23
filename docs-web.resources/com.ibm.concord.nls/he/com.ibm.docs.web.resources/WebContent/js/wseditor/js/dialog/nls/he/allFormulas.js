/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "כל הנוסחאות",
	LABEL_FORMULA_LIST: "רשימת נוסחאות:",
	formula:{
	ABS:{	
	    Syntax:"${0}(number)‎",
	    Disp:"החזרת הערך המוחלט של מספר."
    },
    ACOS:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת ארק-קוסינוס של מספר. הזווית מוחזרת ברדיאנים."
    },
    ACOSH:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת הקוסינוס ההיפרבולי ההופכי של מספר."
    },
    ACOT:{    
    	Syntax:"${0}(number)‎",
        Disp:"החזרת הקוטנגנס ההופכי של מספר. הזווית נמדדת ברדיאנים."
    },
    ACOTH:{    
    	Syntax:"${0}(number)‎",
        Disp:"החזרת הקוטנגנס ההיפרבולי ההופכי של מספר."
    },
    ADDRESS:{
         Syntax:"‎${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])‎",
         Disp:"החזרת ההפניה לתא כתמליל.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - אבסולוטי",
        		 result : 1
        	 }, {
        		 label : "${0} - שורה אבסולוטית/עמודה יחסית",
        		 result : 2
        	 }, {
        		 label : "${0} - שורה יחסית / עמודה אבסולוטית",
        		 result : 3
        	 }, {
        		 label : "${0} - יחסי",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - סגנון R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - סגנון A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"‎${0}(logical value 1${1} [logical value 2]${1} ...)‎",
    	Disp:"החזרת TRUE אם כל הארגומנטים הם TRUE."
    },
    ASIN:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת ארק-סינוס של מספר. הזווית מוחזרת ברדיאנים."
    },
    ASINH:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת הסינוס ההיפרבולי ההופכי של מספר."
    },
    ATAN:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת ארק-טנגנס של מספר. הזווית מוחזרת ברדיאנים."
    },
    AVERAGE:{    
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"החזרת הממוצע של הארגומנטים."
    },
    AVERAGEA:{    
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"החזרת הערך הממוצע של דגימה. תמליל נחשב לאפס."
    },
    AVERAGEIF:{    
    	Syntax:"‎${0}(range${1} criteria${1} [average_range range])‎",
    	Disp:"החזרת הממוצע (ממוצע חשבוני) של הארגומנטים המקיימים את התנאי הנתון."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(average_range${1} criteria_range1${1} criteria1${1} ...)‎",
    	Disp:"החזרת הממוצע (ממוצע חשבוני) של הארגומנטים המקיימים תנאים מרובים."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)‎",
    	Disp:"החזרת הארק-טנגנס, או הטנגנס ההופכי, של קואורדינטות x ו-y שנבחרו. הארק-טנגנס הוא הזווית בין ציר X לקו המכיל את הראשית (0, 0) ונקודה עם הקואורדינטות (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת הטנגנס ההיפרבולי ההופכי של מספר. המספר חייב להיות בטווח ‎-1 עד 1 (להוציא ‎-1 ו-1)."
    },
    BASE:{    
    	Syntax:"‎${0}(number${1} radix${1} [minimum length])‎",
    	Disp:"המרת מספר חיובי שלם לתמליל ממערכת מספרים לבסיס שהוגדר."
    },
    BIN2DEC:{
    	Syntax:"${0}(number)‎",
    	Disp:"המרת מספר בינארי למספר עשרוני."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(number${1} [places])‎",
    	Disp:"המרת מספר בינארי למספר הקסדצימלי."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(number${1} [places])‎",
    	Disp:"המרת מספר בינארי למספר אוקטלי."
    },
    CEILING:{  
    	Syntax: "${0}(number${1} increment)‎",
    	Disp:"עיגול מספר למספר השלם הקרוב ביותר או לכפולה המשמעותית הקרובה ביותר."
    },
    CHAR: {
    	Syntax: "${0}(number)‎",
    	Disp: "החזרת תו ממופה לפי המספר. התו מאותר במפת תווי  Unicode.‏ המספר הוא בטווח 1 עד 255."
    },
    CHOOSE: {
    	Syntax: "‎${0}(index${1} value1${1} [value2]${1} ...)‎",
    	Disp: "איתור והחזרה של את הערך המתאים לפי האינדקס. הפונקציה יכולה לבחור (CHOOSE) מתוך 30 ערכים."
    },
    CODE:{
    	Syntax:"${0}(text)‎",
    	Disp:"החזרת קוד נומרי עבור התו הראשון במחרוזת תמליל בקידוד unicode.‏"
    },
    COLUMN:{    
    	Syntax:"‎${0}([reference])‎",
    	Disp:"החזרת מספר העמודה הפנימי של הפניה."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)‎",
    	Disp:"החזרת מספר העמודות במערך או בהפניה."
    },
    COMBIN:{
    	Syntax:"${0}(number${1} number_chosen)‎",
    	Disp:"החזרת מספר הצירופים עבור מספר נתון של פריטים. ${0} משמש לקביעת המספר הכולל האפשרי של קבוצות עבור מספר נתון של פריטים."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)‎",
    	Disp:"שילוב כמה מחרוזות תמליל למחרוזת אחת."
    },
    CONVERT:{
    	Syntax:"${0}(number${1} from_unit${1} to_unit)‎",
    	Disp:"המרת מספר משיטת מדידה אחת לאחרת.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - גרם",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} ‏- Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - מסה בליברות (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} ‏- U (יחידת מסה אטומית)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - מסה באונקיות (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - מטר",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - מייל תקני",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - אינץ'",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - רגל",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - יארד",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - אנגסטרום",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - פיקה",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - שנה",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - יום",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - שעה",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - דקה",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - שנייה",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - פסקאל",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - אטמוספירה",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - מילימטר כספית (טוריצ'לי)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - ניוטון",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - דין",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - כוח בליברות",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - ג'אול",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - ארג",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - קלוריית IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - אלקטרו-וולט",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - כוח סוס לשעה",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - ואט לשעה",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - רגל לליברה",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} ‏- BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - קלוריה תרמודינמית",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - כוח סוס",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - ואט",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - טסלה",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - גאוס",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - מעלות צלזיוס",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - מעלות פרנהייט",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - קלווין",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - כפית",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - כף",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} ‏- Fluid ounce",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - כוס",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - פיינט אמריקני",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - פיינט בריטי",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - קווארט",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - גלון",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - ליטר",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת הקוסינוס של הזווית הנתונה."
    },
    COSH:{
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת קוסינוס היפרבולי של מספר."
    },
    COT:{    
    	Syntax:"${0}(number)‎",
        Disp:"החזרת הקוטנגנס של המספר הנתון."
    },
    COTH:{    
    	Syntax:"${0}(number)‎",
        Disp:"החזרת הקוטנגנס ההיפרבולי של המספר הנתון."
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"מניית כמה מספרים מופיעים ברשימת הארגומנטים. המערכת מתעלמת מערכי תמליל."
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"מניית מספר הערכים המופיעים ברשימת הארגומנטים."
    },
    COUNTBLANK:{   
    	Syntax:"${0}‎(range)‎",
    	Disp: "ספירת התאים הריקים בטווח שצוין."
    },
    COUNTIF:{
    	Syntax: "${0}‎(range${1} criteria)‎",
    	Disp:"ספירת מספר התאים העונים על התנאי הנתון."
    },
    COUNTIFS:{
    	Syntax: "${0}‎(criteria_range1${1} criteria1${1} ...)‎",
    	Disp:"ספירת מספר התאים העונים על תנאים מרובים."
    },
    CUMIPMT:{	
	    Syntax:"${0}‎(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)‎",
	    Disp:"חישוב הריבית המצטברת המשולמת בין שתי תקופות ספציפיות."
    },
    CUMPRINC:{	
	    Syntax:"${0}‎(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)‎",
	    Disp:"חישוב הקרן המצטברת המשולמת על הלוואה, בין שתי תקופות ספציפיות."
    }, 
    DATE:{	
	    Syntax:"${0}‎(year${1} month${1} day)‎",
	    Disp:"מספק מספר פנימי עבור התאריך הנתון."
    },  
    DATEDIF:{	
	    Syntax:"${0}(start date${1} end date${1} format)‎",
	    Disp:"החזרת ההפרש בשנים, חודשים או ימים בין שני תאריכים.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - מספר השנים השלמות בתקופה.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - מספר החודשים השלמים בתקופה.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - מספר הימים בתקופה.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - מספר הימים בין תאריך ההתחלה ותאריך הסיום, תוך התעלמות מחודשים וימים.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - מספר החודשים בין תאריך ההתחלה ותאריך הסיום, תוך התעלמות משנים.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - מספר הימים בין תאריך ההתחלה ותאריך הסיום, תוך התעלמות משנים.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}‎(text)‎",
	    Disp:"החזרת מספר פנימי עבור תמליל שיש לו מבנה תאריך אפשרי."
    }, 
    DAY:{
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת היום של ערך התאריך הנתון. היום מוחזר כמספר שלם בטווח 1 עד 31. תוכלו גם לציין ערך תאריך/שעה שלילי."
    },
    DAYS360:{
    	Syntax:"‎${0}(start_date${1} end_date${1} [method])‎",
    	Disp:"חישוב מספר הימים בין שני תאריכים בהתבסס על שנה בת 360 יום.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - שיטה אמריקנית (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - שיטה אירופית",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(start_date${1} end_date${1})‎",
    	Disp:"חישוב מספר הימים בין שני תאריכים."
    },
    DEC2BIN:{
    	Syntax:"${0}(number${1} [places])‎",
    	Disp:"המרת מספר עשרוני בינארי למספר בינארי."
    }, 
    DEC2HEX:{
    	Syntax:"${0}‎(number${1} [places])‎",
    	Disp:"המרת מספר עשרוני בינארי למספר הסקצימלי."
    },
    DEC2OCT:{
    	Syntax:"${0}‎(number${1} [places])‎",
    	Disp:"המרת מספר עשרוני למספר אוקטלי."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)‎",
	    Disp:"המרת רדיאנים למעלות."
    },
    DISC:{
    	Syntax:"${0}‎(settlement${1} maturity${1} pr${1} redemption${1} [basis])‎",
    	Disp:"חישוב שיעור ההנחה עבור נייר ערך."
    }, 
    DOLLAR:{
    	Syntax:"‎${0}(number${1} [decimals])‎",
    	Disp:"המרת מספר לתמליל, במבנה המטבע $ (דולר)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} months)‎ ",
    	Disp:"מחזיר את המספר הסידורי המייצג את התאריך שהוא מספר החודשים המצוין לפני או אחרי start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} months)‎",
    	Disp:"מחזיר את המספר הסידורי של היום האחרון בחודש שהוא מספר החודשים המצוין לפני או אחרי start_date"
    },
    ERFC:{   
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת פונקציית השגיאה המשלימה, המשולבת בין מספר לבין אינסוף."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)‎",
    	Disp:"החזרת מספר התואם לסוג שגיאה."
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
    	Syntax:"${0}(number)‎",
    	Disp:"החזרת מספר מעוגל כלפי מעלה למספר השלם הזוגי הקרוב ביותר."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)‎",
    	Disp: "השוואה של שתי מחרוזות תמליל והחזרת TRUE אם הן זהות. הפונקציה רגישה לרישיות."
    },
    EXP:{    
    	Syntax:"${0}(number)‎",
    	Disp: "החזרת e בחזקה של המספר הנתון."
    },
    FACT:{  
    	Syntax:"${0}(number)‎",
    	Disp:"חישוב העצרת של מספר."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת העצרת הכפולה של מספר."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"החזרת הערך הלוגי בתור FALSE."
    },
    FIND:{   
    	Syntax:"‎${0}(find text${1} text${1} [position])‎",
    	Disp:"חיפוש מחרוזת תמליל בתוך מחרוזת אחרת (רגיש לרישיות)."
    },
    FIXED:{
    	Syntax:"‎${0}(number${1} [decimals]${1} [no_commas])‎",
    	Disp:"עיצוב מספר כתמליל עם מספר קבוע של מקומות עשרוניים.",
    	Arguments: {
    		2 : [{
    			label : "${0} - למנוע פסיקים",
    			result : "TRUE"
    		}, {
    			label : "${0} - לא למנוע פסיקים",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(number${1} significance)‎",
    	Disp:"עיגול מספר כלפי מטה לכפולה המשמעותית הקרובה ביותר."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)‎",
    	Disp:"החזרת הנוסחה של תא נוסחה."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)‎",
    	Disp:"סיווג ערכים למרווחים וספירת מספר הערכים בכל מרווח."
    },
    FV:{
    	Syntax:"${0}‎(rate${1} nper${1} pmt${1} [pv]${1} [type])‎",
    	Disp:"חישוב הערך העתידי של השקעה בהתבסס על שיעור ריבית קבוע."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}‎(principal${1} schedule)‎",
        Disp:"חישוב הערך העתידי של קרן התחלתית, לאחר יישום סדרה של שיעורי ריבית מורכבים."
    },
    GAMMALN:{   
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת הלוגריתם הטבעי של פונקציית גאמה."
    },
    GCD:{   
    	Syntax:"‎${0}(number1${1} [number 2]${1} ...)‎",
        Disp:"החזרת המכנה המשותף הגדול ביותר של כל הארגומנטים."
    },
    HEX2BIN:{
    	Syntax:"${0}‎(number${1} [places])‎",
    	Disp:"המרת מספר הקסדצימלי למספר בינארי."
    }, 
    HEX2DEC:{
    	Syntax:"${0}‎(number)‎",
    	Disp:"המרת מספר הקסדצימלי למספר עשרוני."
    }, 
    HEX2OCT:{
    	Syntax:"${0}‎(number${1} [places])‎",
    	Disp:"המרת מספר הקסדצימלי למספר אוקטלי."
    },
    HOUR:{   
    	Syntax:"${0}‎(number)‎",
    	Disp:"בירור המספר הסידורי של השעה ביום (0-23) עבור ערך השעה."
    },
    HLOOKUP:{   
    	Syntax:"‎${0}(search_criteria${1} array${1} Index${1} [sorted])‎",
    	Disp:"חיפוש אופקי והפניה אל התאים הממוקמים מתחת.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - התאמה מקורבת",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - התאמה מדויקת",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [cell_text])‎",
    	Disp:"מחזיר קישור המצביע אל משאב רשת או אל טווח המאוזכר על ידי הקישור. מציג את  cell_text (אופציונלי) אם סופק; במקרים אחרים, מציג את הקישור כתמליל."
    },    
    IF:{    
    	Syntax:"‎${0}(test${1} [then_value]${1} [otherwise_value])‎",
    	Disp:"ציון בדיקה לוגית לביצוע."
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)‎",
    	Disp:"הרצת בדיקות לוגיות כדי לבדוק אם תנאי אחד או יותר מתקיימים, והחזרת הערך התואם לתנאי TRUE הראשון."
    },
    IFERROR:{
    	Syntax:"${0}(value${1} value_if_error)‎",
    	Disp:"החזרת הערך שתציינו אם הביטוי הוא שגיאה. במקרים אחרים, החזרת תוצאת הביטוי."
    },
    IFNA:{
    	Syntax:"${0}(value${1} value_if_na)‎",
    	Disp:"החזרת הערך שתציינו אם הביטוי מחזיר את ערך השגיאה ‎#N/A.‏ במקרים אחרים, החזרת תוצאת הביטוי."
    },
    INDEX:{    
    	Syntax:"‎${0}(reference${1} row${1} [column]${1} [range])‎",
    	Disp:"החזרת הפניה לתא מטווח מוגדר."
    },
    INDIRECT:{    
    	Syntax:"‎${0}(ref${1} [ref_style])‎",
    	Disp:"החזרת תוכן התא המאוזכר בטופס תמליל.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - סגנון R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - סגנון A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(number)‎",
    	Disp:"עיגול מספר כלפי מטה למספר השלם הקרוב ביותר."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])‎",
    	Disp:"חישוב הסכום לתשלום החזר הריבית לתקופה עבור השקעה, בהתבסס על תשלומים קבועים ושיעור ריבית קבוע."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(value)‎",
    	Disp:"החזרת TRUE אם התא המאוזכר ריק, במקרים אחרים החזרת FALSE."
    },
    ISERR:{
    	Syntax:"${0}(value)‎",
    	Disp:"החזרת TRUE אם הערך הוא ערך שגיאה שאינו שווה ‎#N/A."
    },
    ISERROR:{
    	Syntax:"${0}(value)‎",
    	Disp:"החזרת TRUE אם הערך הוא ערך שגיאה."
    },
    ISEVEN:{    
    	Syntax:"${0}(value)‎",
    	Disp:"החזרת TRUE אם הערך זוגי, במקרים אחרים החזרת FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)‎",
    	Disp:"החזרת הערך TRUE אם התא הוא תא נוסחה."
    },
    ISLOGICAL:{    
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת TRUE אם לערך יש מספר לוגי."
    },
    ISNA:{    
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת הערך TRUE אם הערך שווה ‎#N/A.‏"
    },  
    ISNONTEXT:{   
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת true אם הערך אינו תמליל."
    },
    ISNUMBER:{   
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת TRUE אם הערך הוא מספר."
    },
    ISODD:{    
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת TRUE אם הערך הוא מספר שלם אי-זוגי."
    },
    ISPMT:{
    	Syntax:"${0}‎(rate${1} per${1} nper${1} pv)‎",
    	Disp:"חישוב הריבית המשולמת על השקעה במהלך תקופה ספציפית."
    }, 
    ISREF:{    
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת TRUE אם הערך הוא הפניה."
    },
    ISTEXT:{    
    	Syntax:"${0}‎(value)‎",
    	Disp:"החזרת TRUE אם הערך הוא תמליל."
    },
    LARGE:{
        Syntax:"${0}(array${1} nth_position)‎",
    	Disp:"החזרת הערך ה-nי הגדול ביותר מתוך מערך מספרים."
    },
    LCM:{   
    	Syntax:"‎${0}(number1${1} [number 2]${1} ...)‎",
        Disp:"החזרת הכפולה המשותפת הנמוכה ביותר של כל המספרים ברשימה."
    },
    LEFT:{
        Syntax:"‎${0}(text${1} [length])‎",
    	Disp:"החזרת מספר התווים שצוין מהתחלת התמליל."
    },
    LEN:{
    	Syntax:"${0}‎(text)‎",
    	Disp:"החזרת האורך של מחרוזת תמליל."
    },
    LENB:{
    	Syntax:"${0}‎(text)‎",
    	Disp:"החזרת מספר הבתים במחרוזת תמליל."
    },
    LN:{
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת הלוגריתם הטבעי של מספר."
    },
    LOG:{
    	Syntax:"‎${0}(number${1} [base])‎",
    	Disp:"החזרת הלוגריתם של מספר בבסיס שצוין."
    },
    LOG10:{
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת הלוגריתם בבסיס-10 של מספר."
    },
    LOOKUP:{
    	Syntax: "‎${0}(search criterion${1} search vector${1} [result_vector])‎",
    	Disp:"בירור ערך בווקטור באמצעות השוואת ערכים בווקטור אחר."
    },
    LOWER:{    
    	Syntax:"${0}‎(text)‎",
    	Disp:"המרת תמליל לאותיות לא רישיות."
    },    
    MATCH:{    
    	Syntax: "‎${0}(search criterion${1} lookup_array${1} [type])‎",
    	Disp:"הגדרת מיקום במערך אחרי השוואת ערכים.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - קטן מ-",
         		 result : 1
         	 }, {
         		 label : "${0} - התאמה מדויקת",
         		 result : 0
         	 }, {
         		 label : "${0} - גדול מ-",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"החזרת הערך המרבי ברשימת ארגומנטים."
    },
    MEDIAN:{    
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"החזרת הערך האמצעי, אם צוין מספר לא זוגי של ערכים. במקרים אחרים, החזרת הממוצע האריתמטי של שני הערכים האמצעיים."
    },
    MID:{    
    	Syntax:"${0}(text${1} number${1} number)‎",
    	Disp:"החזרת מחרוזת תמליל חלקית של תמליל."
    }, 
    MIN:{    
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"החזרת הערך המינימלי ברשימת ארגומנטים."
    },    
    MINUTE:{    
    	Syntax:"${0}‎(number)‎",
    	Disp:"בירור המספר הסידורי של הדקה בשעה (0-59) עבור ערך השעה."
    },    
    MOD:{    
    	Syntax:"${0}(divided_number${1} divisor)‎",
    	Disp:"החזרת השארית כאשר המספר המחולק מחולק במחלק."
    },
    MODE:{    
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"החזרת הערך השכיח ביותר במדגם."
    },
    MONTH:{    
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת החודש עבור ערך התאריך הנתון. החודש מוחזר כמספר שלם בטווח 1 עד 12."
    },
    MROUND:{   
    	Syntax: "${0}(number${1} multiple)‎",
        Disp:"החזרת מספר המעוגל לכפולה שצוינה."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)‎",
    	Disp:"הכפלת מערך. החזרת המכפלה של שני מערכים."
    },
    MULTINOMIAL:{   
    	Syntax:"‎${0}(number1${1} [number 2]${1} ...)‎",
        Disp:"החזרת המקדם הפולינומי של קבוצת מספרים."
    },
    N:{    
    	Syntax:"${0}‎(value)‎",
    	Disp:"המרת ערך למספר."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"החזרת ערך השגיאה ‎#N/A.‏."
    },
    NETWORKDAYS:{    
    	Syntax:"‎${0}(start date${1} end date${1} [holidays])‎",
    	Disp:"החזרת מספר ימי העבודה בין שני תאריכים."
    },
    NOT:{    
    	Syntax:"${0}(logical value)‎",
    	Disp:"היפוך הערך של הארגמונט."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"בירור השעה הנוכחית במחשב."
    },
    NPV:{   
    	Syntax:"${0}‎(rate${1} value 1${1} [value 2]${1} ...)‎",
        Disp:"חישוב ערך הנטו הנוכחי של השקעה, בהתבסס על שיעור הנחה שצוין, וסדרה של תשלומים עתידיים והכנסה."
    },
    OCT2BIN:{
    	Syntax:"${0}‎(number${1} [places])‎",
    	Disp:"המרת מספר אוקטלי למספר בינארי."
    },
    OCT2DEC:{
    	Syntax:"${0}(number)‎",
    	Disp:"המרת מספר אוקטלי למספר עשרוני."
    },
    OCT2HEX:{
    	Syntax:"${0}‎(number${1} [places])‎",
    	Disp:"המרת מספר אוקטלי בינארי למספר הסקצימלי."
    },
    ODD:{    
    	Syntax:"${0}(number)‎",
    	Disp:"עיגול מספר למעלה מספר השלם האי-זוגי הקרוב ביותר, כאשר \"למעלה\" פירושו \"התרחקות מ-0\"."
    },
    OFFSET:{
    	Syntax:"‎${0}(reference${1} rows${1} cols${1} [height]${1} [width])‎",
    	Disp:"החזרת הפניה אל טווח הנמצא במרחק מצוין של שורות ועמודות מתא או טווח תאים."
    },
    OR:{    
    	Syntax:"‎${0}(logical value 1${1} [logical value 2]${1} ...)‎",
    	Disp:"החזרת הערך TRUE אם לפחות ארגומנט אחד הוא TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"החזרת הערך המקורב של Pi."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])‎",
    	Disp:"החזרת התשלום עבור הלוואה בהתבסס על תשלומים קבועים ושיעור ריבית קבוע."
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)‎",
    	Disp:"העלאת מספר בחזקה של מספר אחר."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])‎",
    	Disp:"חישוב הסכום לתשלום החזר לתקופה עבור השקעה, בהתבסס על תשלומים קבועים ושיעור ריבית קבוע."
    },
    PRICEDISC:{
    	Syntax:"‎${0}(settlement${1} maturity${1} discount${1} redemption${1} [basis])‎",
    	Disp:"חישוב המחיר של 100 ש''ח ערך נקוב של נייר ערך בהנחה."
    },
    PRICEMAT:{
    	Syntax:"‎${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [basis])‎",
    	Disp:"חישוב המחיר של 100 ש''ח ערך נקוב של נייר ערך המשלם ריבית בפדיון."
    },
    PRODUCT:{   
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"הכפלת כל המספרים שניתנו כארגומנטים והחזרת המכפלה."
    },
    PROPER:{    
    	Syntax:"${0}‎(text)‎",
    	Disp:"המרת מחרוזת תמליל לרישיות המתאימה, האות הראשונה בכל מילה רישית וכל שאר האותיות לא רישיות."
    },
    PV:{
    	Syntax:"‎${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])‎",
    	Disp:"חישוב הערך הנוכחי של השקעה, בהתבסס על סדרה של תשלומים עתידיים."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerator${1} denominator)‎",
        Disp:"החזרת התוצאה של מספר המחולק במספר אחר, מקוצץ למספר שלם."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "החזרת מספר אקראי בין 0 לבין 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)‎",
    	Disp: "החזרת מספר שלם אקראי בין המספרים שתציינו."
    },
    RANK:{    
    	Syntax:"‎${0}(number${1} ref${1} [order])‎",
    	Disp: "החזרת הדירוג של ערך במדגם.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - יורד",
          		 result : 0
          	 }, {
          		 label : "${0} - עולה",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"‎${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])‎",
    	Disp:"חישוב הסכום המתקבל בפדיון עבור נייר ערך בהשקעה מלאה."
    }, 
    REPLACE:{    
    	Syntax: "‎${0}(text${1} position${1} length${1} new text)‎",
    	Disp:"החלפת חלק של מחרוזת תמליל במחרוזת תמליל אחרת."	
    },
    REPT:{    
    	Syntax: "‎${0}(text${1} count)‎",
    	Disp:"חזרה על תמליל מספר פעמים נתון."	
    },
    RIGHT:{
    	Syntax: "‎${0}(text${1} [number])‎",
    	Disp:"החזרת התו או התווים האחרונים במחרוזת תמליל."
    },
    RIGHTB:{
    	Syntax: "‎${0}(text${1} [number])‎",
    	Disp:"החזרת התו או התווים האחרונים במחרוזת תמליל."
    },
    ROUND:{   
    	Syntax: "‎${0}(number${1} count)‎",
    	Disp:"עיגול המספר לדיוק מוגדר-מראש."
    },
    ROUNDDOWN:{   
    	Syntax: "‎${0}(number${1} count)‎",
    	Disp:"עיגול המספר כלפי מטה לדיוק מוגדר-מראש."
    },
    ROUNDUP:{   
    	Syntax: "‎${0}(number${1} count)‎",
    	Disp:"עיגול המספר כלפי מעלה לדיוק מוגדר-מראש."
    },
    ROW:{   
    	Syntax:"‎${0}([reference])‎",
    	Disp:"הגדרת מספר השורה הפנימי של הפניה."
    },
    ROWS:{   
    	Syntax:"${0}(array)‎",
    	Disp:"החזרת מספר השורות במערך או בהפניה."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)‎",
    	Disp:"המרת מעלות לרדיאנים."
    },
    ROMAN:{   
    	Syntax:"${0}(number${1} [form])‎",
    	Disp:"המרת ספרה ערבית לספרה רומית, כתמליל.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - קלאסי",
          		 result : 0
          	 }, {
          		 label : "${0} - תמציתי יותר",
          		 result : 1
          	 }, {
          		 label : "${0} - תמציתי יותר",
          		 result : 2
          	 }, {
          		 label : "${0} - תמציתי יותר",
          		 result : 3
          	 }, {
          		 label : "${0} - מפושט",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"‎${0}(find text${1} text${1} [position])‎",
    	Disp:"חיפוש ערך תמליל אחד בתוך ערך אחד (לא רגיש לרישיות)."
    },  
    SIGN:{    
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת הסימן האלגברי של מספר."
    },
    SIN:{    
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת הסינוס של הזווית הנתונה."
    },
    SINH:{    
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת הסינוס ההיפרבולי של מספר."
    },
    SECOND:{    
    	Syntax:"${0}‎(number)‎",
    	Disp:"בירור המספר הסידורי של השנייה בדקה (0-59) עבור ערך השעה."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficients)‎",
        Disp:"החזרת הסכום של סדרה מעריכית בהתבסס על הנוסחה."
    },
    SHEET:{   
    	Syntax:"‎${0}([reference])‎",
    	Disp:"החזרת מספר הגליון הפנימי של הפניה או מחרוזת."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} nth_position)‎",
    	Disp:"החזרת הערך ה-nי הקטן ביותר מתוך מערך מספרים."
    },
    SUBSTITUTE:{   
    	Syntax:"‎${0}(text${1} old${1} new${1} [which])‎",
    	Disp:"החזרת תמליל שבו תמליל ישן מוחלף בתמליל חדש."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"חישוב סיכומי ביניים.",
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
    	Syntax:"‎${0}(number1${1} [number 2]${1} ...)‎",
    	Disp:"מחזיר את סכום כל הארגומנטים."
    },
    SUMPRODUCT:{   
    	Syntax:"‎${0}(array 1${1} [array 2]${1} ...)‎",
    	Disp:"החזרת סכום המכפלות של הארגומנטים."
    },
    SUMIF:{   
    	Syntax:"‎${0}(range${1} criteria${1} [sum range])‎",
    	Disp:"סיכום הארגומנטים העונים על התנאים."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)‎",
    	Disp:"סיכום הארגומנטים העונים על תנאים מרובים."
    },
    SQRT:{   
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת השורש הריבועי של מספר."
    },
    SQRTPI:{   
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת השורש הריבועי של (מספר * pi)."
    },
    STDEV:
    {
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"חישוב סטיית התקן בהתבסס על מדגם."
    },
    STDEVP:
    {
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
    	Disp:"חישוב סטיית התקן בהתבסס על כלל האוכלוסיה."
    },
    SUMSQ:{
    	Syntax:"‎${0}(number 1${1} [number 2]${1} ...)‎",
        Disp:"החזרת סכום הריבועים של המספרים ברשימה."
    },
    T:{
    	Syntax:"${0}‎(text)‎",
    	Disp:"המרת הארגומנטים של הפונקציה לתמליל."
    },
    TAN:{    
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת הטנגנס של המספר הנתון."
    },
    TANH:{    
    	Syntax:"${0}‎(number)‎",
        Disp:"החזרת הטנגנס ההיפרבולי של המספר הנתון."
    },
    TBILLPRICE:{
    	Syntax:"‎${0}(settlement${1} maturity${1} discount)‎",
    	Disp:"חישוב המחיר של 100 ש''ח ערך נקוב של אגרת חוב ממשלתית."
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)‎",
    	Disp:"המרת הערך לתמליל בהתאם לכללים של קוד מבנה מספר והחזרת התמליל."
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)‎",
    	Disp:"בירור ערך השעה מפרטי השעה, הדקה והשנייה."
    },
    TIMEVALUE:{	
	    Syntax:"${0}‎(text)‎",
	    Disp:"החזרת מספר פנימי עבור תמליל שיש לו מבנה שעה אפשרי."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"בירור התאריך הנוכחי במחשב."
    },    
    TRIM:{
    	Syntax:"${0}‎(text)‎",
    	Disp:"סילוק כל הרווחים המובילים והנגררים. כל רצף של 2 רווחים פנימיים או יותר מוחלף ברווח יחיד."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"החזרת הערך הלוגי TRUE.‏"
    },
    TRUNC:{   
    	Syntax:"‎${0}(number${1} [count])‎",
    	Disp:"קיצוץ מספר המקומות העשרוניים של מספר."
    },
    TYPE:{   
    	Syntax:"${0}‎(value)‎",
    	Disp:"הגדרת סוג הנתונים של ערך."	
    },
    UPPER:{  
    	Syntax: "${0}‎(text)‎",
    	Disp:"המרת תמליל לאותיות רישיות."
    },
    VALUE:{    
    	Syntax: "${0}‎(text)‎",
    	Disp:"המרת ארגומנט תמליל למספר."
    },
    VAR:{    
    	Syntax: "‎${0}(number1${1} [number2]${1}...)‎",
    	Disp:"הערכת השונות בהתבסס על מדגם."
    },
    VARA:{    
    	Syntax: "‎${0}(number1${1} [number2]${1}...)‎",
    	Disp:"הערכת השונות בהתבסס על מדגם, כולל מספרים, תמליל וערכים לוגיים."
    },
    VARP:{    
    	Syntax: "‎${0}(number1${1} [number2]${1}...)‎",
    	Disp:"חישוב שונות בהתבסס על כלל האוכלוסיה."
    },
    VARPA:{    
    	Syntax: "‎${0}(number1${1} [number2]${1}...)‎",
    	Disp:"חישוב השונות בהתבסס על כלל האוכלוסיה, כולל מספרים, תמליל וערכים לוגיים."
    },
    VLOOKUP:{    
    	Syntax: "‎${0}(search criterion${1} array${1} index${1} [sort order])‎",
    	Disp:"חיפוש אנכי והפניה אל התאים שצוינו.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - התאמה מקורבת",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - התאמה מדויקת",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"‎${0}(number${1} [type])‎",
    	Disp:"החזרת היום בשבוע עבור ערך התאריך כמספר שלם.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - מספר 1 (יום ראשון) עד 7 (שבת)",
          		 result : 1
          	 }, {
          		 label : "${0} - מספר 1 (יום שני) עד 7 (יום ראשון)",
          		 result : 2
          	 }, {
          		 label : "${0} - מספר 0 (יום שני) עד 6 (יום ראשון)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - מספר 1 (יום שני) עד 7 (יום ראשון)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - מספר 1 (יום שלישי) עד 7 (יום שני)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - מספר 1 (יום רביעי) עד 7 (יום שלישי)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - מספר 1 (יום חמישי) עד 7 (יום רביעי)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - מספר 1 (יום שישי) עד 7 (יום חמישי)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - מספר 1 (שבת) עד 7 (יום שישי)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - מספר 1 (יום ראשון) עד 7 (שבת)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"‎${0}(number${1} [mode])‎",
    	Disp:"חישוב השבוע בלוח השנה התואם לתאריך הנתון.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - יום ראשון",
          		 result : 1
          	 }, {
          		 label : "${0} - יום שני",
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
    	Syntax:"${0}(start date${1} days${1} [holidays])‎",
    	Disp:"החזרת המספר הסידורי של התאריך לפני או אחרי המספר המצוין של ימי עבודה"
    },
    XNPV:{   
    	Syntax:"‎${0}(rate${1} values${1} dates)‎",
    	Disp:"חישוב ערך הנטו הנוכחי עבור לוח זמנים של תזרימי מזומנים."
    },
    YEAR:{    
    	Syntax:"${0}‎(number)‎",
    	Disp:"החזרת השנה בערך תאריך כמספר שלם."
    }
}
})

