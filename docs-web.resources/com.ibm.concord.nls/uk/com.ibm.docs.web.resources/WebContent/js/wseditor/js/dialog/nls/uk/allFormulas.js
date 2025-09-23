/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "All Formulas",
	LABEL_FORMULA_LIST: "Formula list:",
	formula:{
	ABS:{	
	    Syntax:"${0}(number)",
	    Disp:"Returns the absolute value of a number."
    },
    ACOS:{
    	Syntax:"${0}(number)",
    	Disp:"Return the arc cosine of a number. The angle is returned in radians."
    },
    ACOSH:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the inverse hyperbolic cosine of a number."
    },
    ADDRESS:{
         Syntax:"${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"Returns the reference to a cell as text.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolute",
        		 result : 1
        	 }, {
        		 label : "${0} - Absolute row / Relative column",
        		 result : 2
        	 }, {
        		 label : "${0} - Relative row / Absolute column",
        		 result : 3
        	 }, {
        		 label : "${0} - Relative",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 style",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 style",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Returns TRUE if all arguments are TRUE."
    },
    ASIN:{
    	Syntax:"${0}(number)",
    	Disp:"Return the arc sine of a number. The angle is returned in radians."
    },
    ASINH:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the inverse hyperbolic sine of a number."
    },
    ATAN:{
    	Syntax:"${0}(number)",
    	Disp:"Return the arc tangent of a number. The angle is returned in radians."
    },
    AVERAGE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returns the average of the arguments."
    },
    AVERAGEA:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returns the average value for a sample. Text is evaluated as zero."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Returns the arctangent, or inverse tangent, of the specified x- and y-coordinates. The arctangent is the angle from the x-axis to a line containing the origin (0, 0) and a point with coordinates (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the inverse hyperbolic tangent of a number. Number must be between -1 and 1 (excluding -1 and 1)."
    },
    BASE:{    
    	Syntax:"${0}(number${1} radix${1} [minimum length])",
    	Disp:"Converts a positive integer to text from a number system to the base defined."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"Returns a numeric code for the first character in a text string which encoded in unicode"
    },
    COS:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the cosine of the given angle."
    },
    COSH:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the hyperbolic cosine of a number."
    },
    COMBIN:{
    	Syntax:"${0}(number${1} number_chosen)",
    	Disp:"Returns the number of combinations for a given number of items. Use ${0} to determine the total possible number of groups for a given number of items."
    },
    CEILING:{  
    	Syntax: "${0}(number${1} increment)",
    	Disp:"Rounds a number to the nearest integer or multiple of significance."
    },
    CHAR: {
    	Syntax: "${0}(number)",
    	Disp: "Returns a character mapped by the number. It finds the character in Unicode character map. Number is between 1 and 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} value1${1} [value2]${1} ...)",
    	Disp: "Finds and returns the corresponding value according to the index. It can CHOOSE from up to 30 values."
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"Returns the internal column number of a reference."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Returns the number of columns in an array or reference."
    },
    CONVERT:{
    	Syntax:"${0}(number${1} from_unit${1} to_unit)",
    	Disp:"Converts a number from one measurement system to antoher.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pound mass (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomic mass unit)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Ounce mass (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Statute mile",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Inch",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Foot",
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
       		 label : "${0} - Year",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Day",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Hour",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minute",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Second",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atomosphere",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - millimeters of Mercury (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pound force",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT calorie",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Horsepower-hour",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-hour",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Foot-pound",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Thermodynamic calorie",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Horsepower",
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
       		 label : "${0} - Degree Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Degree Fahrenheit",
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
       		 label : "${0} - Fluid ounce",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Cup",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - U.S. pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - U.K. pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Liter",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"Combines several text strings into one string."
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Counts how many numbers are in the list of arguments. Text entries are ignored."
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"Counts how many values are in the list of arguments."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(range)",
    	Disp: "Counts the blank cells in a specified range."
    },
    COUNTIF:{
    	Syntax: "${0}(range${1} criteria)",
    	Disp:"Counts the arguments which meet the set conditions."
    },
    DATE:{	
	    Syntax:"${0}(year${1} month${1} day)",
	    Disp:"Provides an internal number for the date given."
    },  
    DATEDIF:{	
	    Syntax:"${0}(start date${1} end date${1} format)",
	    Disp:"Returns the difference in years, months, or days between two dates.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - The number of complete years in the period.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - The number of complete months in the period.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - The number of days in the period.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - The number of days between start_date and end_date, ignoring months and years.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - The number of months between start_date and end_date, ignoring years.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - The number of days between start_date and end_date, ignoring years.",
	    		result: "\"YD\""
	    	}, 
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Returns an internal number for a text having a possible date format."
    }, 
    DAY:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the day of given date value. The day is returned as an integer between 1 and 31. You can also enter a negative date/time value."
    },
    DAYS360:{
    	Syntax:"${0}(start_date${1} end_date${1} [method])",
    	Disp:"Calculates the number of days between two dates based on a 360-day year.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - U.S. (NASD) method",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - European method",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(start_date${1} end_date${1})",
    	Disp:"Calculates the number of days between two dates."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"Converts radians to degrees."
    },
    DOLLAR:{
    	Syntax:"${0}(number${1} [decimals])",
    	Disp:"Converts a number to text, using the $ (dollar) currency format."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"Returns a number corresponding to an error type."
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
    	Disp:"Returns a number rounded up to the nearest even integer."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "Compares two text strings and returns TRUE if they are identical. This function is case-sensitive."
    },
    EXP:{    
    	Syntax:"${0}(number)",
    	Disp: "Returns e raised by the given number."
    },
    FACT:{  
    	Syntax:"${0}(number)",
    	Disp:"Calculates the factorial of a number."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Returns the logical value as FALSE."
    },
    FIND:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Looks for a string of text within another (case-sensitive)."
    },
    FIXED:{
    	Syntax:"${0}(number${1} [decimals]${1} [no_commas])",
    	Disp:"Formats a number as text with a fixed number of decimals.",
    	Arguments: {
    		2 : [{
    			label : "${0} - prevent commas",
    			result : "TRUE"
    		}, {
    			label : "${0} - do not prevent commas",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(number${1} significance)",
    	Disp:"Rounds a number down to the nearest multiple of significance."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"Returns the formula of a formula cell."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"Categorizes values into intervals and counts the number of values in each interval."
    },
    HOUR:{   
    	Syntax:"${0}(number)",
    	Disp:"Determines the sequential number of the hour of the day(0-23) for the time value."
    },
    HLOOKUP:{   
    	Syntax:"${0}(search_criteria${1} array${1} Index${1} [sorted])",
    	Disp:"Horizontal search and reference to the cells located below.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Approximate match",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exact match",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(url${1} [cell_text])",
    	Disp:"Returns a hyperlink points to a network resource specified by the url, which displays as provided(optional) cell_text."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_value]${1} [otherwise_value])",
    	Disp:"Specifies a logical test to be performed."
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} row${1} [column]${1} [range])",
    	Disp:"Returns a reference to a cell from a defined range."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"Returns the contents of a cell that is referenced in text form.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 style",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 style",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(number)",
    	Disp:"Rounds a number down to the nearest integer."
    },       
    ISBLANK:{   
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the referenced cell is blank, else return FALSE."
    },
    ISERR:{
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the value is an error value not equal to #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the value is an error value."
    },
    ISEVEN:{    
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the value is even, else return FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"Returns TRUE if the cell is a formula cell."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the value carries a logical number."
    },
    ISNA:{    
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if value equals #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(value)",
    	Disp:"Returns true if the value is not text."
    },
    ISNUMBER:{   
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the value is a number."
    },
    ISODD:{    
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if value is an odd integer."
    },
    ISREF:{    
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if the value is a reference."
    },
    ISTEXT:{    
    	Syntax:"${0}(value)",
    	Disp:"Returns TRUE if value is text."
    },
    LARGE:{
        Syntax:"${0}(array${1} nth_position)",
    	Disp:"Returns the nth largest value from a set of values."
    },
    LEFT:{
        Syntax:"${0}(text${1} [length])",
    	Disp:"Returns the specified number of characters from the start of a text."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"Returns the length of a text string."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"Returns the number of bytes of a text string."
    },
    LN:{
    	Syntax:"${0}(number)",
    	Disp:"Return the natural logarithm of a number."
    },
    LOG:{
    	Syntax:"${0}(number${1} [base])",
    	Disp:"Return the logarithm of a number in a specified base."
    },
    LOG10:{
    	Syntax:"${0}(number)",
    	Disp:"Returns the base-10 logarithm of a number."
    },
    LOOKUP:{
    	Syntax: "${0}(search criterion${1} search vector${1} [result_vector])",
    	Disp:"Determines a value in a vector by comparison to values in another vector."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converts text to lowercase."
    },    
    MATCH:{    
    	Syntax: "${0}(search criterion${1} lookup_array${1} [type])",
    	Disp:"Defines a position in an array after comparing values.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Less than",
         		 result : 1
         	 }, {
         		 label : "${0} - Exact match",
         		 result : 0
         	 }, {
         		 label : "${0} - Greater than",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returns the maximum value in a list of arguments."
    },
    MEDIAN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returns the middle value, if given an odd number of values. Otherwise, returns the arithmetic average of the two middle values."
    },
    MID:{    
    	Syntax:"${0}(text${1} number${1} number)",
    	Disp:"Returns a partial text string of a text."
    }, 
    MIN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returns the minimum value in a list of arguments."
    },    
    MINUTE:{    
    	Syntax:"${0}(number)",
    	Disp:"Determines the sequential number for the minute of the hour(0-59) for the time value."
    },    
    MOD:{    
    	Syntax:"${0}(divided_number${1} divisor)",
    	Disp:"Return the remainder when the divided number is divided by the divisor."
    },
    MODE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Returns the most common value in a sample."
    },
    MONTH:{    
    	Syntax:"${0}(number)",
    	Disp:"Returns the month for the given date value. The month is returned as an integer between 1 and 12."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Array multiplication. Returns the product of two arrays."
    },
    N:{    
    	Syntax:"${0}(value)",
    	Disp:"Converts a value to a number."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Returns the error value #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(start date${1} end date${1} [holidays])",
    	Disp:"Returns the number of the workdays between two dates."
    },
    NOT:{    
    	Syntax:"${0}(logical value)",
    	Disp:"Reverses the value of the argument."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Detemines the current time of the computer."
    },
    ODD:{    
    	Syntax:"${0}(number)",
    	Disp:"Rounds a number up to the nearest odd integer, where \"up\" means \"away from 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rows${1} cols${1} [height]${1} [width])",
    	Disp:"Returns a reference to a range that is a specified number of rows and columns from a cell or range of cells."
    },
    OR:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"Returns TRUE if at least one argument is TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Return the approximate value of Pi."
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)",
    	Disp:"Raises a number to the power of another."
    },
    PRODUCT:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Multiplies all the numbers given as arguments and returns the product."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"Converts a text string to proper case, the first letter of each word in uppercase and all other letters to lowercase."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Returns a random number between 0 and 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)",
    	Disp: "Returns a random integer between the numbers you specify."
    },
    RANK:{    
    	Syntax:"${0}(number${1} ref${1} [order])",
    	Disp: "Returns the ranking of a value in sample.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Descending",
          		 result : 0
          	 }, {
          		 label : "${0} - Ascending",
          		 result : 1
          	 }
          	 ]
           }
    },
    REPLACE:{    
    	Syntax: "${0}(text${1} position${1} length${1} new text)",
    	Disp:"Replaces characters within a text string with a different text string."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} count)",
    	Disp:"Repeats text a given number of times."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"Returns the last character or characters of text."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"Returns the last character or characters of text."
    },
    ROUND:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Rounds a number to a predefined accuracy."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Rounds a number down to a predefined accuracy."
    },
    ROUNDUP:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"Rounds a number up to a predefined accuracy."
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"Defines the internal row number of a reference."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Returns the number of rows in an array or reference."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"Converts degrees to radians."
    },
    ROMAN:{   
    	Syntax:"${0}(number${1} [form])",
    	Disp:"Converts an arabic numeral to roman, as text.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Classic",
          		 result : 0
          	 }, {
          		 label : "${0} - More concise",
          		 result : 1
          	 }, {
          		 label : "${0} - More concise",
          		 result : 2
          	 }, {
          		 label : "${0} - More concise",
          		 result : 3
          	 }, {
          		 label : "${0} - Simplifiled",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"Looks for one text value within another (not case-sensitive)."
    },  
    SIN:{    
    	Syntax:"${0}(number)",
    	Disp:"Returns the sine of the given angle."
    },
    SINH:{    
    	Syntax:"${0}(number)",
    	Disp:"Returns the hyperbolic sine of a number."
    },
    SECOND:{    
    	Syntax:"${0}(number)",
    	Disp:"Determines the sequential number for the second of the minute(0-59) for the time value."
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"Returns  the internal sheet number of a reference or a string."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} nth_position)",
    	Disp:"Returns the nth smallest value from a set of values."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} old${1} new${1} [which])",
    	Disp:"Returns text where an old text is substituted with a new text."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"Calculates subtotals in a spreadsheet.",
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
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
    	Disp:"Returns the sum of all arguments."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Returns the sum of the products of array arguments."
    },
    SUMIF:{   
    	Syntax:"${0}(range${1} criteria${1} [sum range])",
    	Disp:"Totals the arguments that meet the conditions."
    },
    SQRT:{   
    	Syntax:"${0}(number)",
    	Disp:"Returns the square root of a number."
    },
    STDEV:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Calculate the standard deviation based on a sample."
    },
    STDEVP:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"Calculate the standard deviation based on the entire population."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"Converts its arguments to text."
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)",
    	Disp:"Converts the value to a text according to the rules of a number format code and returns it."
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)",
    	Disp:"Determines a time value from the detailes of hour, minute and second."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"Returns an internal number for a text having a possible time format."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Determines the current date of the computer."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"Removes all leading and trailing spaces. Any other sequence of 2 or more inner spaces are replaced with a single space."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Return the logical value TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(number${1} [count])",
    	Disp:"Truncates the decimal places of a number."
    },
    TYPE:{   
    	Syntax:"${0}(value)",
    	Disp:"Defines the data type of a value."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"Converts text to uppercase."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"Converts a text argument to a number."
    },
    VAR:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Estimates variance based on a sample."
    },
    VARA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Estimates variance based on a sample, including numbers, text, and logical values."
    },
    VARP:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Calculates variance based on the entire population."
    },
    VARPA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"Calculates variance based on the entire population, including numbers, text, and logical values."
    },
    VLOOKUP:{    
    	Syntax: "${0}(search criterion${1} array${1} index${1} [sort order])",
    	Disp:"Vertical search and reference to indicated cells.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Approximate match",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Exact match",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(number${1} [type])",
    	Disp:"Returns the day of the week for the date value as an integer.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Numbers 1 (Sunday) through 7 (Saturady)",
          		 result : 1
          	 }, {
          		 label : "${0} - Numbers 1 (Monday) through 7 (Sunday)",
          		 result : 2
          	 }, {
          		 label : "${0} - Numbers 0 (Monday) through 6 (Sunday)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Numbers 1 (Monday) through 7 (Sunday)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Numbers 1 (Tuesday) through 7 (Monday)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Numbers 1 (Wednesday) through 7 (Tuesday)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Numbers 1 (Thursday) through 7 (Wednesday)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Numbers 1 (Friday) through 7 (Thursday)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Numbers 1 (Saturady) through 7 (Friday)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Numbers 1 (Sunday) through 7 (Saturady)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(number${1} [mode])",
    	Disp:"Calculates the calendar week corresponding to the given date.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Sunday",
          		 result : 1
          	 }, {
          		 label : "${0} - Monday",
          		 result : 2
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
          	 }
          	 ]
           }
    },
    WORKDAY:{    
    	Syntax:"${0}(start date${1} days${1} [holidays])",
    	Disp:"Returns the serial number of the date before or after a specified number of workdays."
    },
    YEAR:{    
    	Syntax:"${0}(number)",
    	Disp:"Returns the year of a date value as an integer."
    }
}
})