/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "สูตรทั้งหมด",
	LABEL_FORMULA_LIST: "รายการสูตร:",
	formula:{
	ABS:{	
	    Syntax:"${0}(number)",
	    Disp:"ส่งคืนค่าสัมบูรณ์ของตัวเลข"
    },
    ACOS:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืน arc cosine ของตัวเลข มุมคืนค่าเป็นเรเดียน"
    },
    ACOSH:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืน inverse hyperbolic cosine ของตัวเลข"
    },
    ACOT:{    
    	Syntax:"${0}(number)",
        Disp:"ส่งคืน inverse cotangent ของตัวเลข มุมจะวัดเป็นเรเดียน"
    },
    ACOTH:{    
    	Syntax:"${0}(number)",
        Disp:"ส่งคืน inverse hyperbolic cotangent ของตัวเลข"
    },
    ADDRESS:{
         Syntax:"${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"ส่งคืนการอ้างอิงเซลล์ในรูปของข้อความ",
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
    	Disp:"ส่งคืนค่า TRUE หากอาร์กิวเมนต์ทั้งหมดเป็น TRUE"
    },
    ASIN:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืน arc sine ของตัวเลข มุมคืนค่าเป็นเรเดียน"
    },
    ASINH:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืน inverse hyperbolic sine ของตัวเลข"
    },
    ATAN:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืน arc tangent ของตัวเลข มุมคืนค่าเป็นเรเดียน"
    },
    AVERAGE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"ส่งคืนค่าเฉลี่ยของอาร์กิวเมนต์"
    },
    AVERAGEA:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"ส่งคืนค่าเฉลี่ยสำหรับตัวอย่าง ข้อความมีการประเมินเป็นศูนย์"
    },
    AVERAGEIF:{    
    	Syntax:"${0}(range${1} criteria${1} [average_range])",
    	Disp:"คืนค่าเฉลี่ย (arithmetic mean) ของอาร์กิวเมนต์ที่ตรงกับเงื่อนไขที่ระบุ"
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(average_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"คืนค่าเฉลี่ย (ค่าเฉลี่ยเลขคณิต) ของอาร์กิวเมนต์ที่ตรงกับหลายเงื่อนไข"
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"ส่งคืนค่า arctangent หรือ inverse tangent ของพิกัด x และ y ที่ระบุ ค่า arctangent คือมุมจากแกน x ถึงเส้นที่มีจุดกำเนิด (0, 0) และจุดตามพิกัด (x_num, y_num)"
    },
    ATANH:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืนค่า inverse hyperbolic tangent ของตัวเลข ตัวเลขต้องอยู่ระหว่าง -1 กับ 1 (ไม่รวม -1 และ 1)"
    },
    BASE:{    
    	Syntax:"${0}(number${1} radix${1} [minimum length])",
    	Disp:"แปลงเลขจำนวนเต็มบวกให้เป็นข้อความจากระบบตัวเลขให้เป็นฐานที่กำหนด"
    },
    BIN2DEC:{
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"แปลงตัวเลขฐานสองให้เป็นตัวเลขฐานสิบ"
    }, 
    BIN2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสองให้เป็นตัวเลขฐานสิบหก"
    }, 
    BIN2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสองให้เป็นตัวเลขฐานแปด"
    },
    CEILING:{  
    	Syntax: "${0}(การเพิ่มขึ้นของตัวเลข${1})",
    	Disp:"ปัดเศษตัวเลขให้เป็นเลขจำนวนเต็มที่ใกล้เคียงที่สุดหรือคูณด้วยค่าที่มีความหมาย"
    },
    CHAR: {
    	Syntax: "${0}(ตัวเลข)",
    	Disp: "ส่งคืนอักขระที่แม็พโดยตัวเลข ค้นหาอักขระในแผนที่อักขระ Unicode ตัวเลขอยู่ระหว่าง 1 ถึง 255"
    },
    CHOOSE: {
    	Syntax: "${0}(ดัชนี${1} ค่า1${1} [ค่า2]${1} ...)",
    	Disp: "ค้นหาและส่งคืนค่าที่สอดคล้องกันตามดัชนี ไวยากรณ์นี้สามารถ CHOOSE ได้มากถึง 30 ค่า"
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"ส่งคืนโค้ดตัวเลขสำหรับอักขระตัวแรกในสตริงข้อความที่เข้ารหัสในรูปแบบ unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"ส่งคืนหมายเลขคอลัมน์ภายในของการอ้างอิง"
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"ส่งคืนจำนวนคอลัมน์ในอาร์เรย์หรือการอ้างอิง"
    },
    COMBIN:{
    	Syntax:"${0}(number${1} number_chosen)",
    	Disp:"ส่งคืนตัวเลขผสมสำหรับจำนวนไอเท็มที่กำหนด ใช้ ${0} เพื่อกำหนดตัวเลขที่เป็นไปได้ทั้งหมดของกลุ่มสำหรับจำนวนไอเท็มที่กำหนด"
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"รวมสตริงข้อความต่างๆ ให้เป็นหนึ่งสตริง"
    },
    CONVERT:{
    	Syntax:"${0}(number${1} from_unit${1} to_unit)",
    	Disp:"แปลงตัวเลขจากระบบหน่วยวัดหนึ่งเป็นอีกระบบหนึ่ง",
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
    COS:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืนค่า cosine ของมุมที่กำหนด"
    },
    COSH:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืน hyperbolic cosine ของตัวเลข"
    },
    COT:{    
    	Syntax:"${0}(number)",
        Disp:"ส่งคืน cotangent ของตัวเลขที่กำหนด"
    },
    COTH:{    
    	Syntax:"${0}(number)",
        Disp:"ส่งคืน hyperbolic cotangent ของตัวเลขที่กำหนด"
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"นับจำนวนตัวเลขที่อยู่ในรายการของอาร์กิวเมนต์ รายการข้อความถูกละเว้น"
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"นับจำนวนค่าที่อยู่ในรายการของอาร์กิวเมนต์"
    },
    COUNTBLANK:{   
    	Syntax:"${0}(range)",
    	Disp: "นับเซลล์ที่ว่างในช่วงที่ระบุไว้"
    },
    COUNTIF:{
    	Syntax: "${0}(range${1} criteria)",
    	Disp:"นับจำนวนของเซลล์ที่ตรงกับเงื่อนไขที่ระบุ"
    },
    COUNTIFS:{
    	Syntax: "${0}(criteria_range1${1} criteria1${1} ...)",
    	Disp:"นับจำนวนเซลล์ที่ตรงกับหลายเงื่อนไข"
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"คำนวณดอกเบี้ยสะสมที่ชำระระหว่างช่วงเวลาที่ระบุสองช่วง"
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"คำนวณเงินต้นสะสมที่ชำระสำหรับเงินกู้ ระหว่างช่วงเวลาที่ระบุสองช่วง"
    }, 
    DATE:{	
	    Syntax:"${0}(year${1} month${1} day)",
	    Disp:"แสดงหมายเลขภายในสำหรับวันที่ที่กำหนด"
    },  
    DATEDIF:{	
	    Syntax:"${0}(start date${1} end date${1} format)",
	    Disp:"ส่งคืนความแตกต่างในหน่วยปี เดือน หรือวันระหว่างสองวันที่",
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
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"ส่งคืนหมายเลขภายในสำหรับข้อความที่มีรูปแบบวันที่ซึ่งเป็นไปได้"
    }, 
    DAY:{
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืนวันของค่าวันที่ที่กำหนด วันมีการส่งคืนเป็นเลขจำนวนเต็มระหว่าง 1 ถึง 31 คุณยังสามารถป้อนค่าวันที่/เวลาที่เป็นค่าลบได้ด้วย"
    },
    DAYS360:{
    	Syntax:"${0}(start_date${1} end_date${1} [method])",
    	Disp:"คำนวณจำนวนวันระหว่างวันที่ทั้งสองตามปีแบบ 360 วัน",
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
    	Disp:"คำนวณจำนวนวันระหว่างสองวันที่"
    },
    DEC2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสิบให้เป็นตัวเลขฐานสอง"
    }, 
    DEC2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสิบให้เป็นตัวเลขฐานสิบหก"
    },
    DEC2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสิบให้เป็นตัวเลขฐานแปด"
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"แปลงมุมเรเดียนให้เป็นองศา"
    },
    DISC:{
    	Syntax:"${0}(settlement${1} maturity${1} pr${1} redemption${1} [basis])",
    	Disp:"คำนวณอัตราส่วนลดสำหรับหลักทรัพย์"
    }, 
    DOLLAR:{
    	Syntax:"${0}(number${1} [decimals])",
    	Disp:"แปลงตัวเลขให้เป็นข้อความ โดยใช้รูปแบบสกุลเงิน $ (ดอลลาร์)"
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"ส่งคืนหมายเลขอนุกรมที่แทนค่าวันที่ที่เป็นจำนวนเดือนที่ระบุไว้ก่อนหรือหลัง start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"ส่งคืนหมายเลขอนุกรมสำหรับวันสุดท้ายขอเดือนที่เป็นจำนวนเดือนที่ระบุไว้ก่อนหรือหลัง start_date"
    },
    ERFC:{   
    	Syntax:"${0}(ตัวเลข)",
        Disp:"ส่งคืนฟังก์ชันข้อผิดพลาดเพิ่มเติม ที่รวมกันระหว่างตัวเลขและค่าอนันต์"
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"คืนค่าตัวเลขที่สอดคล้องกับชนิดข้อผิดพลาด"
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
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืนค่าตัวเลขที่ปัดเศษขึ้นให้ใกล้เคียงกับเลขจำนวนเต็มที่เป็นเลขคู่"
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "เปรียบเทียบสตริงข้อความสองชุดและส่งคืนค่า TRUE หากสตริงข้อความเหล่านั้นตรงกัน ฟังก์ชันนี้เป็นแบบตรงตามตัวพิมพ์"
    },
    EXP:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp: "ส่งคืน e ที่เพิ่มโดยตัวเลขที่กำหนด"
    },
    FACT:{  
    	Syntax:"${0}(number)",
    	Disp:"คำนวณแฟกทอเรียลของตัวเลข"
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(ตัวเลข)",
        Disp:"ส่งคืน double factorial ของตัวเลข"
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"ส่งคืนค่าตรรกะที่เป็นค่า FALSE"
    },
    FIND:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"ค้นหาสตริงของข้อความภายในรายการอื่น (ตรงตามตัวพิมพ์)"
    },
    FIXED:{
    	Syntax:"${0}(number${1} [decimals]${1} [no_commas])",
    	Disp:"รูปแบบตัวเลขเป็นข้อความพร้อมจำนวนทศนิยมคงที่",
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
    	Disp:"ปัดเศษจำนวนลงให้ใกล้เคียงกับค่าที่คูณด้วยค่าที่มีความหมายมากที่สุด"
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"ส่งคืนสูตรของเซลล์สูตร"
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"จัดหมวดหมู่ค่าเป็นช่วง และนับจำนวนค่าในแต่ละช่วง"
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"คำนวณค่าในอนาคตของเงินลงทุนโดยอิงตามอัตราดอกเบี้ยคงที่"
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} schedule)",
        Disp:"คำนวณค่าในอนาคตของเงินต้นขั้นต้น หลังจากใช้ชุดของอัตราดอกเบี้ยดอกเบี้ย"
    },
    GAMMALN:{   
    	Syntax:"${0}(ตัวเลข)",
        Disp:"ส่งคืนลอการิทึมธรรมชาติของฟังก์ชัน gamma"
    },
    GCD:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"ส่งคืนตัวหารร่วมมากของอาร์กิวเมนต์ทั้งหมด"
    },
    HEX2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสิบหกให้เป็นตัวเลขฐานสอง"
    }, 
    HEX2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"แปลงตัวเลขฐานสิบหกให้เป็นตัวเลขฐานสิบ"
    }, 
    HEX2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานสิบหกให้เป็นตัวเลขฐานแปด"
    },
    HOUR:{   
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"กำหนดหมายเลขลำดับของชั่วโมงของวัน (0-23) สำหรับค่าเวลา"
    },
    HLOOKUP:{   
    	Syntax:"${0}(search_criteria${1} array${1} Index${1} [sorted])",
    	Disp:"ค้นหาตามแนวนอนและอ้างถึงเซลล์ที่อยู่ด้านล่าง",
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
    	Syntax:"${0}(link${1} [cell_text])",
    	Disp:"คืนค่าลิงก์ที่ชี้ไปยังรีซอร์สเครือข่ายหรือช่วงที่อ้างอิงโดยลิงก์ แสดง cell_text (ทางเลือก) หากมี; หรือแสดงลิงก์เป็นข้อความ"
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_value]${1} [otherwise_value])",
    	Disp:"ระบุการทดสอบเชิงตรรกะที่ต้องดำเนินการ"
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)",
    	Disp:"รันการทดสอบโลจิคัลเพื่อตรวจสอบว่าตรงกับเงื่อนไขอย่างน้อยหนึ่งเงื่อนไขและคืนค่าที่ตรงกับเงื่อนไข TRUE แรก"
    },
    IFERROR:{
    	Syntax:"${0}(value${1} value_if_error)",
    	Disp:"คืนค่าที่คุณระบุถ้านิพจน์เป็นข้อผิดพลาด หรือคืนค่าผลลัพธ์ของนิพจน์"
    },
    IFNA:{
    	Syntax:"${0}(value${1} value_if_na)",
    	Disp:"คืนค่าที่ระบุถ้านิพจน์คืนค่าข้อผิดพลาด #N/A หรือคืนค่าผลลัพธ์ของนิพจน์"
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} row${1} [column]${1} [range])",
    	Disp:"ส่งคืนการอ้างถึงไปยังเซลล์จากช่วงที่กำหนดไว้"
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"ส่งคืนเนื้อหาของเซลล์ที่อ้างอิงในรูปแบบข้อความ",
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
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ปัดเศษตัวเลขลงเป็นจำนวนเต็มที่ใกล้เคียงที่สุด"
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"คำนวณยอดชำระดอกเบี้ยใหม่สำหรับช่วงเวลาเพื่อการลงทุนตามการชำระแบบปกติและอัตราดอกเบี้ยคงที่"
    }, 
    ISBLANK:{   
    	Syntax:"${0}(value)",
    	Disp:"ส่งคืนค่า TRUE หากเซลล์ที่อ้างถึงเป็นค่าว่าง ไม่เช่นนั้นให้ส่งคืนค่า FALSE"
    },
    ISERR:{
    	Syntax:"${0}(value)",
    	Disp:"คืนค่า TRUE เมื่อค่าเป็นค่าผิดพลาดที่ไม่เท่ากับ #N/A"
    },
    ISERROR:{
    	Syntax:"${0}(value)",
    	Disp:"ส่งคืนค่า TRUE หากค่านั้นเป็นค่าที่ผิดพลาด"
    },
    ISEVEN:{    
    	Syntax:"${0}(value)",
    	Disp:"ส่งคืนค่า TRUE หากค่านั้นเป็นเลขคู่ ไม่เช่นนั้นให้ส่งคืนค่า FALSE" 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"ส่งคืนค่า TRUE หากเซลล์นั้นคือเซลล์สูตร"
    },
    ISLOGICAL:{    
    	Syntax:"${0}(value)",
    	Disp:"ส่งคืนค่า TRUE หากค่านั้นใช้ตัวเลขเชิงตรรกะ"
    },
    ISNA:{    
    	Syntax:"${0}(value)",
    	Disp:"คืนค่า TRUE เมื่อค่าเท่ากับ #N/A"
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(value)",
    	Disp:"คืนค่า true เมื่อค่าไม่ใช่ข้อความ"
    },
    ISNUMBER:{   
    	Syntax:"${0}(ค่า)",
    	Disp:"ส่งคืนค่า TRUE หากค่านั้นคือตัวเลข"
    },
    ISODD:{    
    	Syntax:"${0}(ค่า)",
    	Disp:"ส่งคืนค่า TRUE หากค่านั้นคือเลขจำนวนเต็มที่เป็นเลขคี่"
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"อัตราของดอกเบี้ยที่ชำระระหว่างช่วงเวลาที่ระบุสำหรับการลงทุน"
    }, 
    ISREF:{    
    	Syntax:"${0}(ค่า)",
    	Disp:"ส่งคืนค่า TRUE หากค่านั้นคือการอ้างอิง"
    },
    ISTEXT:{    
    	Syntax:"${0}(ค่า)",
    	Disp:"คืนค่า TRUE เมื่อค่าเป็นข้อความ"
    },
    LARGE:{
        Syntax:"${0}(array${1} nth_position)",
    	Disp:"ส่งคืนค่าที่มากที่สุด nth จากชุดค่า"
    },
    LCM:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"ส่งคืนตัวคูณร่วมน้อยของตัวเลขทั้งหมดในรายการ"
    },
    LEFT:{
        Syntax:"${0}(text${1} [length])",
    	Disp:"ส่งคืนจำนวนอักขระที่ระบุตั้งแต่จุดเริ่มต้นของข้อความ"
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"ส่งคืนความยาวของสตริงข้อความ"
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"ส่งคืนจำนวนไบต์ของสตริงข้อความ"
    },
    LN:{
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืนลอการิทึมธรรมชาติของตัวเลข"
    },
    LOG:{
    	Syntax:"${0}(number${1} [base])",
    	Disp:"ส่งคืนลอการิทึมของตัวเลขในฐานที่ระบุ"
    },
    LOG10:{
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืนลอการิทึมฐาน 10 ของตัวเลข"
    },
    LOOKUP:{
    	Syntax: "${0}(search criterion${1} search vector${1} [result_vector])",
    	Disp:"กำหนดค่าในเวคเตอร์โดยเปรียบเทียบกับค่าในเวคเตอร์อื่น"
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"แปลงข้อความเป็นตัวพิมพ์เล็ก"
    },    
    MATCH:{    
    	Syntax: "${0}(search criterion${1} lookup_array${1} [type])",
    	Disp:"กำหนดตำแหน่งในอาร์เรย์หลังจากเปรียบเทียบค่า",
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
    	Syntax:"${0}(ตัวเลข 1${1} [ตัวเลข 2]${1} ...)",
    	Disp:"ส่งคืนค่าสูงสุดในรายการอาร์กิวเมนต์"
    },
    MEDIAN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"ส่งคืนค่ากึ่งกลาง ถ้ากำหนดค่าเป็นจำนวนคี่ หรือส่งคืนค่าเฉลี่ยเลขคณิตของค่ากลางสองค่า"
    },
    MID:{    
    	Syntax:"${0}(text${1} number${1} number)",
    	Disp:"ส่งคืนสตริงข้อความบางส่วนของข้อความ"
    }, 
    MIN:{    
    	Syntax:"${0}(ตัวเลข 1${1} [ตัวเลข 2]${1} ...)",
    	Disp:"ส่งคืนค่าต่ำสุดในรายการของอาร์กิวเมนต์"
    },    
    MINUTE:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"กำหนดหมายเลขลำดับของนาทีของชั่วโมง (0-59) สำหรับค่าเวลา"
    },    
    MOD:{    
    	Syntax:"${0}(divided_number${1} divisor)",
    	Disp:"ส่งคืนเศษเมื่อตัวเลขถูกหารด้วยตัวหาร"
    },
    MODE:{    
    	Syntax:"${0}(ตัวเลข 1${1} [ตัวเลข 2]${1} ...)",
    	Disp:"ส่งคืนค่าที่ใช้ร่วมกันมากที่สุดในตัวอย่าง"
    },
    MONTH:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืนเดือนของค่าวันที่ที่กำหนด เดือนมีการส่งคืนเป็นเลขจำนวนเต็มระหว่าง 1 ถึง 12"
    },
    MROUND:{   
    	Syntax: "${0}(number${1} multiple)",
        Disp:"ส่งคืนตัวเลขที่ปัดเป็นตัวคูณที่ระบุ"
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"การคูณอาร์เรย์ ส่งคืนผลิตภัณฑ์ของสองอาร์เรย์"
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"ส่งคืน multinomial coefficient ของชุดของตัวเลข"
    },
    N:{    
    	Syntax:"${0}(ค่า)",
    	Disp:"แปลงค่าให้เป็นตัวเลข"
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"ส่งคืนค่าผิดพลาด #N/A"
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(start date${1} end date${1} [holidays])",
    	Disp:"ส่งคืนจำนวนวันทำงานระหว่างสองวันที่"
    },
    NOT:{    
    	Syntax:"${0}(logical value)",
    	Disp:"กลับค่าของอาร์กิวเมนต์"
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"กำหนดเวลาปัจจุบันของคอมพิวเตอร์"
    },
    NPV:{   
    	Syntax:"${0}(rate${1} value 1${1} [value 2]${1} ...)",
        Disp:"คำนวณมูลค่าปัจจุบันสุทธิ โดยอิงตามอัตราส่วนลดที่ระบุ และชุดของการชำระเงินและรายได้ในอนาคต"
    },
    OCT2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานแปดให้เป็นตัวเลขฐานสอง"
    },
    OCT2DEC:{
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"แปลงตัวเลขฐานแปดให้เป็นตัวเลขฐานสิบ"
    },
    OCT2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"แปลงตัวเลขฐานแปดให้เป็นตัวเลขฐานสิบหก"
    },
    ODD:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ปัดเศษตัวเลขขึ้นเป็นเลขจำนวนเต็มคี่ที่ใกล้ที่สุด โดยที่ \"up\" หมายถึง \"away from 0\""
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rows${1} cols${1} [height]${1} [width])",
    	Disp:"ส่งคืนการอ้างอิงไปยังช่วงที่เป็นจำนวนแถวและคอลัมน์ที่ระบุตั้งแต่เซลล์หรือช่วงของเซลล์"
    },
    OR:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"ส่งคืนค่า TRUE หากมีอย่างน้อยหนึ่งอาร์กิวเมนต์ที่มีค่า TRUE"
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"ส่งคืนค่าที่เหมาะสมของ Pi"
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"คืนค่าการชำระเงินกู้ตามการชำระแบบปกติและอัตราดอกเบี้ยคงที่"
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)",
    	Disp:"แสดงตัวเลขเป็นเลขยกกำลังของเลขอื่น"
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"คำนวณยอดชำระใหม่สำหรับช่วงเวลาเพื่อการลงทุนตามการชำระแบบปกติและอัตราดอกเบี้ยคงที่"
    },
    PRICEDISC:{
    	Syntax:"${0}(settlement${1} maturity${1} discount${1} redemption${1} [basis])",
    	Disp:"คำนวณมูลค่าราคาต่อ $100 ของหลักทรัพย์ที่ลดลง"
    },
    PRICEMAT:{
    	Syntax:"${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [basis])",
    	Disp:"คำนวณมูลค่าราคาต่อ $100 ของหลักทรัพย์ที่ชำระค่าดอกเบี้ยเงินในวันครบกำหนด"
    },
    PRODUCT:{   
    	Syntax:"${0}(ตัวเลข 1${1} [ตัวเลข 2]${1} ...)",
    	Disp:"คูณตัวเลขทั้งหมดที่กำหนดเป็นอาร์กิวเมนต์และส่งคืนผลิตภัณฑ์"
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"แปลงสตริงข้อความเป็นตัวพิมพ์ที่เหมาะสม โดยอักษรตัวแรกของแต่ละคำเป็นตัวพิมพ์ใหญ่และตัวอักษรอื่นทั้งหมดเป็นตัวพิมพ์เล็ก"
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"คำนวณมูลค่าปัจจุบันของเงินลงทุน โดยอิงตามชุดของการชำระเงินในอนาคต"
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerator${1} denominator)",
        Disp:"ส่งคืนผลลัพธ์ของตัวเลขที่หารด้วยตัวเลขอื่น ที่ตัดเป็นเลขจำนวนเต็ม"
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "ส่งคืนตัวเลขแบบสุ่มระหว่าง 0 และ 1"
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)",
    	Disp: "ส่งคืนเลขจำนวนเต็มแบบสุ่มระหว่างจำนวนที่คุณระบุไว้"
    },
    RANK:{    
    	Syntax:"${0}(number${1} ref${1} [order])",
    	Disp: "ส่งคืนอันดับของค่าในตัวอย่าง",
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
    RECEIVED:{
    	Syntax:"${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])",
    	Disp:"คำนวณจำนวนเงินที่ได้รับในวันครบกำหนดสำหรับหลักทรัพย์ที่ลงทุนครบจำนวน"
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} position${1} length${1} new text)",
    	Disp:"แทนที่อักขระภายในสตริงข้อความด้วยสตริงข้อความอื่น"	
    },
    REPT:{    
    	Syntax: "${0}(text${1} count)",
    	Disp:"ทำซ้ำข้อความตามจำนวนครั้งที่กำหนด"	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"ส่งคืนอักขระสุดท้ายของข้อความ"
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"ส่งคืนอักขระสุดท้ายของข้อความ"
    },
    ROUND:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"ปัดเศษตัวเลขให้เป็นตัวเลขที่ถูกต้องที่กำหนดไว้ล่วงหน้า"
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"ปัดเศษตัวเลขลงเป็นความแม่นยำที่กำหนดไว้ล่วงหน้า"
    },
    ROUNDUP:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"ปัดเศษตัวเลขขึ้นเป็นความแม่นยำที่กำหนดไว้ล่วงหน้า"
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"นิยามหมายเลขแถวภายในของการอ้างอิง"
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"ส่งคืนจำนวนแถวในอาร์เรย์หรือการอ้างอิง"
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"แปลงองศาเป็นเรเดียน"
    },
    ROMAN:{   
    	Syntax:"${0}(number${1} [form])",
    	Disp:"แปลงตัวเลขอารบิกให้เป็นตัวเลขโรมัน, เป็นข้อความ",
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
    	Disp:"มองหาค่าข้อความหนึ่งค่าภายในข้อความอื่น (ไม่สนใจขนาดตัวพิมพ์)"
    },  
    SIGN:{    
    	Syntax:"${0}(number)",
        Disp:"ส่งคืนเครื่องหมาย algebraic ของตัวเลข"
    },
    SIN:{    
    	Syntax:"${0}(number)",
    	Disp:"ส่งคืนค่า sine ของมุมที่กำหนด"
    },
    SINH:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืน hyperbolic sine ของตัวเลข"
    },
    SECOND:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"กำหนดหมายเลขลำดับของวินาทีของนาที (0-59) สำหรับค่าเวลา"
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficients)",
        Disp:"ส่งคืนผลรวมของเลขยกกำลังที่ขึ้นอยู่กับสูตร"
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"ส่งคืนหมายเลขชีตภายในของการอ้างอิงหรือสตริง"
    },
    SMALL:{   
    	Syntax:"${0}(array${1} nth_position)",
    	Disp:"ส่งคืนค่าที่น้อยที่สุด nth จากชุดค่า"
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} old${1} new${1} [which])",
    	Disp:"ส่งคืนข้อความที่ข้อความเก่าถูกแทนที่ด้วยข้อความใหม่"
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"คำนวณผลรวมย่อยในสเปร็ดชีต",
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
    	Disp:"ส่งคืนผลรวมของอาร์กิวเมนต์ทั้งหมด"
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"ส่งคืนผลรวมของผลิตภัณฑ์ของอาร์เรย์อาร์กิวเมนต์"
    },
    SUMIF:{   
    	Syntax:"${0}(range${1} criteria${1} [sum range])",
    	Disp:"รวมอาร์กิวเมนต์ทั้งหมดที่ตรงกับเงื่อนไข"
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"ผลรวมอาร์กิวเมนต์ที่ตรงกับหลายเงื่อนไข"
    },
    SQRT:{   
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืนรากที่สองของตัวเลข"
    },
    SQRTPI:{   
    	Syntax:"${0}(ตัวเลข)",
        Disp:"ส่งคืนรากที่สองของ (ตัวเลข * pi)"
    },
    STDEV:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"คำนวณค่าคลาดเคลื่อนมาตรฐานโดยใช้ตัวอย่าง"
    },
    STDEVP:
    {
    	Syntax:"${0}(ตัวเลข 1${1} [ตัวเลข 2]${1} ...)",
    	Disp:"คำนวณค่าคลาดเคลื่อนมาตรฐานโดยใช้ประชากรทั้งหมด"
    },
    SUMSQ:{
    	Syntax:"${0}(ตัวเลข 1${1} [ตัวเลข 2]${1} ...)",
        Disp:"ส่งคืนผลรวมยกำลังสองของตัวเลขในรายการ"
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"แปลงอาร์กิวเมนต์ให้เป็นข้อความ"
    },
    TAN:{    
    	Syntax:"${0}(ตัวเลข)",
        Disp:"ส่งคืน tangent ของตัวเลขที่กำหนด"
    },
    TANH:{    
    	Syntax:"${0}(ตัวเลข)",
        Disp:"ส่งคืน hyperbolic tangent ของตัวเลขที่กำหนด"
    },
    TBILLPRICE:{
    	Syntax:"${0}(settlement${1} maturity${1} discount)",
    	Disp:"คำนวณมูลค่าราคาต่อ $100 สำหรับตราสารหนี้"
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)",
    	Disp:"แปลงค่าให้เป็นข้อความตามกฎของโค้ดรูปแบบตัวเลข และส่งคืนข้อความนั้น"
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)",
    	Disp:"กำหนดค่าเวลาจากรายละเอียดของชั่วโมง นาที และวินาที"
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"ส่งคืนหมายเลขภายในสำหรับข้อความที่มีรูปแบบเวลาที่เป็นไปได้"
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"กำหนดวันที่ปัจจุบันของคอมพิวเตอร์"
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"ลบช่องว่างนำและช่องว่างตามหลังทั้งหมด ลำดับอื่นของช่องว่างภายใน 2 ช่องขึ้นไปจะถูกแทนที่ด้วยช่องว่างเดียว"
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"ส่งคืนค่าตรรกะที่เป็นค่า TRUE"
    },
    TRUNC:{   
    	Syntax:"${0}(number${1} [count])",
    	Disp:"ตัดปลายตำแหน่งทศนิยมของตัวเลข"
    },
    TYPE:{   
    	Syntax:"${0}(ค่า)",
    	Disp:"กำหนดชนิดข้อมูลของค่า"	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"แปลงข้อความเป็นตัวพิมพ์ใหญ่"
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"แปลงอาร์กิวเมนต์ข้อความให้เป็นตัวเลข"
    },
    VAR:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"ประมาณความคลาดเคลื่อนโดยอิงตัวอย่าง"
    },
    VARA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"ประมาณความคลาดเคลื่อนโดยอิงตัวอย่าง รวมถึงตัวเลข ข้อความ และค่าตรรกะ"
    },
    VARP:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"คำนวณความคลาดเคลื่อนโดยอิงประชากรทั้งหมด"
    },
    VARPA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"คำนวณความคลาดเคลื่อนโดยอิงประชากรทั้งหมด รวมถึงตัวเลข ข้อความ และค่าตรรกะ"
    },
    VLOOKUP:{    
    	Syntax: "${0}(search criterion${1} array${1} index${1} [sort order])",
    	Disp:"การค้นหาแนวตั้งและอ้างถึงเซลล์ที่บ่งชี้",
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
    	Disp:"ส่งคืนวันของสัปดาห์สำหรับค่าวันที่เป็นเลขจำนวนเต็ม",
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
    	Disp:"คำนวณสัปดาห์ปฏิทินที่สอดคล้องกับวันที่ที่กำหนด",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Sunday",
          		 result : 1
          	 }, {
          		 label : "${0} - Monday",
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
    	Disp:"ส่งคืนหมายเลขอนุกรมของวันที่ก่อนหรือหลังจำนวนที่ระบุของวันทำงาน"
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} values${1} dates)",
    	Disp:"คำนวณมูลค่าปัจจุบันสุทธิสำหรับกำหนดเวลาของเงินสดหมุนเวียน"
    },
    YEAR:{    
    	Syntax:"${0}(ตัวเลข)",
    	Disp:"ส่งคืนค่าปีของค่าวันที่เป็นเลขจำนวนเต็ม"
    }
}
})

