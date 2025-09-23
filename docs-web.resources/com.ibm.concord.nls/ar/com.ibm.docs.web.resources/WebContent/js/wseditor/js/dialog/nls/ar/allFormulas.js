/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "كل المعادلات",
	LABEL_FORMULA_LIST: "كشف المعادلات:",
	formula:{
	ABS:{	
	    Syntax:"${0}(number)",
	    Disp:"يتم ارجاع القيمة المطلقة للرقم."
    },
    ACOS:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع مقابل جيب التمام لرقم. يتم ارجاع الزاوية بوحدة قياس الزوايا."
    },
    ACOSH:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع مقابل جيب التمام الزائد لرقم."
    },
    ACOT:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع مقابل ظل التمام لرقم. يتم قياس الزاوية بالرديان."
    },
    ACOTH:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع مقابل ظل التمام القطعي لرقم."
    },
    ADDRESS:{
         Syntax:"${0}(row${1} column${1} [abs]${1} [a1]${1} [sheet])",
         Disp:"يتم ارجاع المرجع الى خانة كنص.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - مطلق",
        		 result : 1
        	 }, {
        		 label : "${0} - صف مطلق / عمود نسبى",
        		 result : 2
        	 }, {
        		 label : "${0} - صف نسبى / عمود مطلق",
        		 result : 3
        	 }, {
        		 label : "${0} - نسبى",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - أسلوب R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - أسلوب A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"يتم ارجاع TRUE اذا كانت كل المتغيرات المستقلة TRUE."
    },
    ASIN:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع مقابل جيب الزاوية لرقم. يتم ارجاع الزاوية بوحدة قياس الزوايا."
    },
    ASINH:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع مقابل جيب الزاوية الزائد لرقم."
    },
    ATAN:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع مقابل ظل الزاوية لرقم. يتم ارجاع الزاوية بوحدة قياس الزوايا."
    },
    AVERAGE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم ارجاع متوسط المتغيرات المستقلة."
    },
    AVERAGEA:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم ارجاع متوسط القيمة لنموذج. يتم تقييم النص كما صفر."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(range${1} criteria${1} [average_range])",
    	Disp:"يتم ارجاع المتوسط (المتوسط الحسابي) للمتغيرات المستقلة التي تحقق الشرط المحدد."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(average_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"يتم ارجاع المتوسط (المتوسط الحسابي) للمتغيرات المستقلة التي تحقق عدة شروط."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"يتم ارجاع ظل الزاوية العكسي، أو مقابل ظل الزاوية، للاحداثيات س وص المحددة. ظل الزاوية العكسي هو الزاوية من محور س الى سطر يحتوى على الأصل (0، 0) ونقطة بالاحداثيات (x_num، y_num)."
    },
    ATANH:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع معكوس الظل القطعى لرقم. الرقم يجب أن يكون بين -1 و 1 (باستبعاد -1 و 1)."
    },
    BASE:{    
    	Syntax:"${0}(number${1} radix${1} [minimum length])",
    	Disp:"يتم تحويل رقم صحيح موجب الى نص من نظام رقم الأساس المعرف."
    },
    BIN2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"يتم تحويل رقم ثنائي الى رقم عشري."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم ثنائي الى رقم سداسي عشري."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم ثنائي الى رقم ثماني."
    },
    CEILING:{  
    	Syntax: "${0}(number${1} increment)",
    	Disp:"يتم تقريب الرقم لأقرب رقم صحيح أو مضاعف ذو دلالة."
    },
    CHAR: {
    	Syntax: "${0}(number)",
    	Disp: "يتم ارجاع حرف متناظر بالرقم. يتم ايجاد الحرف بمناظرة حروف Unicode. الرقم يكون بين 1 و 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} value1${1} [value2]${1} ...)",
    	Disp: "هذه المعادلة تجد القيمة المقابلة وفقا الى الفهرس. يمكن أن تختار من قيم يصل عددها حتى 30 قيمة."
    },
    CODE:{
    	Syntax:"${0}(text)",
    	Disp:"يتم ارجاع كود للحرف الأول فى مجموعة حروف نصية تم تشفيرها باستخدام unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([reference])",
    	Disp:"يتم ارجاع رقم العمود الداخلى لمرجع."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"يتم ارجاع عدد الأعمدة فى مصفوفة أو مرجع."
    },
    COMBIN:{
    	Syntax:"${0}(number${1} number_chosen)",
    	Disp:"يتم ارجاع التركيبات لعدد معين من البنود. قم باستخدام ${0} لتحديد اجمالى العدد الممكن من المجموعات لعدد معين من البنود."
    },
    CONCATENATE:{   
    	Syntax:"${0}(text 1${1} ...)",
    	Disp:"يتم دمج مجموعة حروف نصية عديدة داخل مجموعة حروف واحدة."
    },
    CONVERT:{
    	Syntax:"${0}(number${1} from_unit${1} to_unit)",
    	Disp:"يتم تحويل رقم من نام قياس الى آخر.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - جرام",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - عيار",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - رطل (وزن)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (وحدة الكتلة الذرية)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - أوقية (وزن)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - متر",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - ميل تشريعي",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - بوصة",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - قدم",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - ياردا",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - انجستروم دولي",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - حرف مطبعى",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - سنة",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - يوم",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - ساعة",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - دقيقة",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - ثانية",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - باسكال",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - حالة الطقس",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - مليمتر من الزئبق (وحدة ضغط تور)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - نيوتن",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - داين",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - قوة الضرب",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - جول",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - أرج",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - سعرات حرارية IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - الكترون فولت",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - قوة الحصان-ساعة",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - واط-ساعة",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - قدم-رطل",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - السعرات الحرارية",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - قوة حصان",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - واط",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - تسلا",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - جاوس",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - درجة مئوية",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - فهرنهايت",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - كيلفين",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - ملعقة صغيرة",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - ملعقة كبيرة",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - أوقية السوائل",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - فنجان",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - باينت أمريكى",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - باينت انجليزي",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - ربع جالون",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - جالون",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - لتر",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع جيب التمام للزاوية المحددة."
    },
    COSH:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع جيب التمام الزائد لرقم."
    },
    COT:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع ظل التمام لرقم محدد."
    },
    COTH:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع مقابل ظل التمام القطعي لرقم محدد."
    },
    COUNT:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"يتم عد كم عدد الأرقام الموجودة فى كشف المتغيرات المستقلة. يتم تجاهل ادخالات النص."
    },
    COUNTA:{   
    	Syntax:"${0}(value1${1} [value2]${1} ...)",
    	Disp:"يتم تعداد القيم الموجودة فى كشف المتغيرات المستقلة."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(range)",
    	Disp: "يتم تعداد الخانات الفارغة فى مدى محدد."
    },
    COUNTIF:{
    	Syntax: "${0}(range${1} criteria)",
    	Disp:"يتم حساب عدد الخانات التي تحقق الشرط المحدد."
    },
    COUNTIFS:{
    	Syntax: "${0}(criteria_range1${1} criteria1${1} ...)",
    	Disp:"يتم حساب عدد الخانات التي تحقق عدة شروط."
    },
    CUMIPMT:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"يتم احتساب الفائدة التراكمية المدفوعة بين فترتين محددتين."
    },
    CUMPRINC:{	
	    Syntax:"${0}(rate${1} nper${1} pv${1} start_period${1} end_period${1} type)",
	    Disp:"يتم احتساب أصل الدين التراكمي المدفوع للقرض، بين فترتين محددتين."
    }, 
    DATE:{	
	    Syntax:"${0}(year${1} month${1} day)",
	    Disp:"يوفر رقم داخلى للتاريخ المحدد."
    },  
    DATEDIF:{	
	    Syntax:"${0}(start date${1} end date${1} format)",
	    Disp:"يتم ارجاع الفرق بالسنوات أو الشهور أو الأيام بين تاريخين.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - عدد الأعوام التامة فى الفترة الزمنية.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - عدد الشهور التامة فى الفترة الزمنية.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - عدد الأيام فى الفترة الزمنية.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - عدد الأيام بين تاريخ البدء وتاريخ الانتهاء، تجاهل الشهور والسنين.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - عدد الشهور بين تاريخ البدء وتاريخ الانتهاء، تجاهل السنين.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - عدد الأيام بين تاريخ البدء وتاريخ الانتهاء، تجاهل السنين.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"يتم ارجاع رقم داخلي لنص بنسق التاريخ الممكن."
    }, 
    DAY:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع اليوم لقيمة التاريخ المحدد. يتم ارجاع اليوم كرقم صحيح بين 1 و 31‏. يمكنك أيضا ادخال قيمة سالبة للتاريخ/الوقت."
    },
    DAYS360:{
    	Syntax:"${0}(تاريخ البدء${1} تاريخ الانتهاء${1} [method])",
    	Disp:"يتم احتساب عدد الأيام بين تاريخين على أساس عام من 360-يوم.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - الطريقة الأمريكية (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - الطريقة الأوروبية",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(تاريخ البدء${1} تاريخ الانتهاء${1})",
    	Disp:"يتم احتساب عدد الأيام بين تاريخين 360-يوم."
    },
    DEC2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم عشري الى رقم ثنائي."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم عشري الى رقم سداسي عشري."
    },
    DEC2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم عشري الى رقم ثماني."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"يتم تحويل الأقطار الى درجات."
    },
    DISC:{
    	Syntax:"${0}(settlement${1} maturity${1} pr${1} redemption${1} [basis])",
    	Disp:"يتم احتساب معدل الخصم للسندات المالية."
    }, 
    DOLLAR:{
    	Syntax:"${0}(number${1} [decimals])",
    	Disp:"يتم تحويل رقم الى نص، باستخدام نسق العملة $ (الدولار)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"يتم ارجاع رقم التسلسل الذي يمثل التاريخ الذي يعد عدد الشهور المشار اليها قبل أو بعد start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} months)",
    	Disp:"يتم ارجاع رقم التسلسل الذي يعد آخر يوم من الشهر الذي يعد عدد الشهور المشار اليها قبل أو بعد start_date"
    },
    ERFC:{   
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع دالة الخطأ التكميلية، التي تم تكاملها بين رقم وما لا نهاية."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(reference)",
    	Disp:"يتم ارجاع رقم مقابل لنوع الخطأ."
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
    	Disp:"يتم ارجاع رقم تم تقريبه الى أقرب رقم زوجي."
    },
    EXACT:{    
    	Syntax:"${0}(text 1${1} text 2)",
    	Disp: "يتم المقارنة بين اثنين من مجموعات الحروف النصية ويتم ارجاع TRUE اذا كانت متماثلة. هذه المعادلة حساسة لحالة الحرف."
    },
    EXP:{    
    	Syntax:"${0}(number)",
    	Disp: "يتم ارجاع e أس الرقم المحدد."
    },
    FACT:{  
    	Syntax:"${0}(number)",
    	Disp:"يتم احتساب القيمة العشرية لرقم."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع المضروب المزدوج لرقم."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"يتم ارجاع القيمة المنطقية كما FALSE."
    },
    FIND:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"يتم البحث عن مجموعة حروف من نص داخل أخر (حساس لحالة الحرف)."
    },
    FIXED:{
    	Syntax:"${0}(number${1} [decimals]${1} [no_commas])",
    	Disp:"يتم تنسيق رقم كنص بعدد ثابت من الأرقام العشرية.",
    	Arguments: {
    		2 : [{
    			label : "${0} - منع الفاصلات",
    			result : "TRUE"
    		}, {
    			label : "${0} - لا تمنع الفاصلات",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(number${1} significance)",
    	Disp:"يتم تقريب الرقم للأقل لأقرب مضاعف ذو دلالة."
    },
    FORMULA:{   
    	Syntax:"${0}(reference)",
    	Disp:"يتم ارجاع المعادلة لخانة المعادلة."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bins)",
    	Disp:"يتم تصنيف القيم في فواصل ويتم احتساب عدد القيم في كل فاصل."
    },
    FV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"يتم احتساب القيمة المستقبلية للاستثمار بناءا على معدل الفائدة الثابت."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(principal${1} schedule)",
        Disp:"يتم احتساب القيمة المستقبلية لأصل الدين المبدئي، بعد تطبيق سلسلة من معدلات الفائدة المركبة."
    },
    GAMMALN:{   
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع لوغاريتم طبيعى لمعادلة جاما."
    },
    GCD:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"يتم ارجاع أكبر قاسم مشترك لكل المتغيرات المستقلة."
    },
    HEX2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم سداسي عشري الى رقم ثنائي."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"يتم تحويل رقم سداسي عشري الى رقم عشري."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم سداسي عشري الى رقم ثماني."
    },
    HOUR:{   
    	Syntax:"${0}(number)",
    	Disp:"يتم تحديد الرقم المتعاقب للساعة من اليوم(0-23) لقيمة الوقت."
    },
    HLOOKUP:{   
    	Syntax:"${0}(search_criteria${1} array${1} Index${1} [sorted])",
    	Disp:"المرجع والبحث الأفقى للخانات الموجودة بالأسفل.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - مطابقة تقريبية",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - مطابقة تامة",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(الوصلات${1} ‏‎[cell_text]‎‏)",
    	Disp:"ارجاع وصلة تشير الى مصدر شبكة الاتصال أو الى مدى مشار اليه بواسطة وصلة. يقوم بعرض ‏‎cell_text‎‏ (اختياريا) اذا تم اتاحته؛ بخلاف ذلك، يقوم بعرض الوصلة كنص."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_value]${1} [otherwise_value])",
    	Disp:"يتم تحديد الاختبار المنطقى المقرر تنفيذه."
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)",
    	Disp:"يتم اجراء اختبارات منطقية للتحقق مما اذا كان قد تم تحقيق شرط أو أكثر وارجاع القيمة التي تطابق شرط TRUE الأول."
    },
    IFERROR:{
    	Syntax:"${0}(value${1} value_if_error)",
    	Disp:"يتم ارجاع القيمة التي تقوم بتحديدها اذا كان التعبير خطأ. خلاف ذلك، يتم ارجاع نتيجة التعبير."
    },
    IFNA:{
    	Syntax:"${0}(value${1} value_if_na)",
    	Disp:"يتم ارجاع القيمة التي قد تقوم بتحديدها اذا قام التعبير بارجاع قيمة الخطأ ‏‎#N/A‎‏.‏ خلاف ذلك، يتم ارجاع نتيجة التعبير."
    },
    INDEX:{    
    	Syntax:"${0}(reference${1} row${1} [column]${1} [range])",
    	Disp:"يتم ارجاع المرجع الى خانة من مدى معرف."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_style])",
    	Disp:"يتم ارجاع محتويات الخانة المشار اليها فى نموذج النص.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - أسلوب R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - أسلوب A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم تقريب الرقم الى أقرب رقم صحيح."
    },
    IPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"يتم احتساب مبلغ سداد الفائدة لفترة زمنية لاستثمار على أساس دفعات منتظمة ومعدل فائدة ثابت."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت الخانة المشار اليها فارغة، والا فيتم ارجاع FALSE."
    },
    ISERR:{
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة هى قيمة خطأ لا تساوى #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة هى قيمة خطأ."
    },
    ISEVEN:{    
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة رقم زوجي، والا فيتم ارجاع FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(reference)",
    	Disp:"يتم ارجاع TRUE اذا كانت الخانة هى خانة معادلة."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة تحمل رقم منطقى."
    },
    ISNA:{    
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة تساوى #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع true اذا كانت القيمة ليست بنص."
    },
    ISNUMBER:{   
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة هى رقم."
    },
    ISODD:{    
    	Syntax:"${0}(value)",
    	Disp:"تقوم بارجاع TRUE اذا كانت القيمة عددا? صحيحا? فرديا?."
    },
    ISPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv)",
    	Disp:"يتم احتساب الفائدة المدفوعة خلال فترة زمنية محددة للاستثمار."
    }, 
    ISREF:{    
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة مرجع."
    },
    ISTEXT:{    
    	Syntax:"${0}(value)",
    	Disp:"يتم ارجاع TRUE اذا كانت القيمة نص."
    },
    LARGE:{
        Syntax:"${0}(array${1} nth_position)",
    	Disp:"يتم ارجاع أكبر قيمة nth من مجموعة من القيم."
    },
    LCM:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"يتم ارجاع أصغر مضاعف مشترك لكل الأرقام التي في الكشف."
    },
    LEFT:{
        Syntax:"${0}(text${1} [length])",
    	Disp:"يتم ارجاع العدد المحدد من الحروف من بدء نص ما."
    },
    LEN:{
    	Syntax:"${0}(text)",
    	Disp:"يتم ارجاع طول مجموعة حروف النص."
    },
    LENB:{
    	Syntax:"${0}(text)",
    	Disp:"يتم ارجاع عدد وحدات البايت بمجموعة حروف النص."
    },
    LN:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع اللوغاريتم الطبيعى لرقم."
    },
    LOG:{
    	Syntax:"${0}(number${1} [base])",
    	Disp:"يتم ارجاع اللوغاريتم لرقم بأساس معين."
    },
    LOG10:{
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع لوغاريتم بأساس-10 لرقم."
    },
    LOOKUP:{
    	Syntax: "${0}(search criterion${1} search vector${1} [result_vector])",
    	Disp:"تحدد هذه المعادلة قيمة فى متجه بالمقارنة بالقيم فى متجه أخر."
    },
    LOWER:{    
    	Syntax:"${0}(text)",
    	Disp:"يتم تحويل نص الى الحروف السفلية."
    },    
    MATCH:{    
    	Syntax: "${0}(search criterion${1} lookup_array${1} [type])",
    	Disp:"يتم تعريف موضع فى مصفوفة بعد مقارنة القيم.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - أقل من",
         		 result : 1
         	 }, {
         		 label : "${0} - مطابقة تامة",
         		 result : 0
         	 }, {
         		 label : "${0} - أكبر من",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم ارجاع أقصى قيمة فى كشف بالمتغيرات المستقلة."
    },
    MEDIAN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم ارجاع القيمة فى المنتصف، اذا تم اعطاؤها عدد فردى للقيم. والا، فيتم ارجاع المتوسط الحسابى للقيمتين فى المنتصف."
    },
    MID:{    
    	Syntax:"${0}(text${1} number${1} number)",
    	Disp:"يتم ارجاع مجموعة حروف جزئية لنص."
    }, 
    MIN:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم ارجاع أدنى قيمة فى كشف بالمتغيرات المستقلة."
    },    
    MINUTE:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم تحديد الرقم المتعاقب للدقيقة من الساعة(0-59) لقيمة الوقت."
    },    
    MOD:{    
    	Syntax:"${0}(divided_number${1} divisor)",
    	Disp:"يتم ارجاع القيمة المتبقية عندما يتم قسمة رقم على المقسوم عليه."
    },
    MODE:{    
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم ارجاع القيم الأكثر تكرارا فى عينة."
    },
    MONTH:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع الشهر لقيمة التاريخ المحدد. يتم ارجاع الشهر كرقم صحيح بين 1 و 12‏."
    },
    MROUND:{   
    	Syntax: "${0}(number${1} multiple)",
        Disp:"يتم ارجاع رقم تم تقريبه الى مضاعف محدد."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"مضاعفة المصفوفة. يتم ارجاع حاصل ضرب مصفوفتين."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(number1${1} [number 2]${1} ...)",
        Disp:"يتم ارجاع معامل متعدد الحدود لمجموعة من الأرقام."
    },
    N:{    
    	Syntax:"${0}(value)",
    	Disp:"يتم تحويل قيمة الى رقم."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"يتم ارجاع قيمة الخطأ ‏‎#N/A‎‏.‏"
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(start date${1} end date${1} [holidays])",
    	Disp:"يتم ارجاع عدد أيام العمل ما بين تاريخين."
    },
    NOT:{    
    	Syntax:"${0}(logical value)",
    	Disp:"يتم عكس قيمة المتغير المستقل."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"يتم تحديد الوقت الحالى للحاسب الآلى."
    },
    NPV:{   
    	Syntax:"${0}(rate${1} value 1${1} [value 2]${1} ...)",
        Disp:"يتم احتساب صافي القيمة الحالية للاستثمار، بناءا على معدل الخصم المتاح، وسلاسل المدفوعات والدخل المستقبلية."
    },
    OCT2BIN:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم ثماني الى رقم ثنائي."
    },
    OCT2DEC:{
    	Syntax:"${0}(number)",
    	Disp:"يتم تحويل رقم ثماني الى رقم عشري."
    },
    OCT2HEX:{
    	Syntax:"${0}(number${1} [places])",
    	Disp:"يتم تحويل رقم ثماني الى رقم سداسي عشري."
    },
    ODD:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم تقريب الرقم لأعلى الى أقرب رقم صحيح مفرد، حيث \"أعلى\" تعنى \"بعيدا عن 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} rows${1} cols${1} [height]${1} [width])",
    	Disp:"يتم ارجاع مرجع الى مدى يمثل عدد محدد من الصفوف والأعمدة من خانة أو مدى من الخانات."
    },
    OR:{    
    	Syntax:"${0}(logical value 1${1} [logical value 2]${1} ...)",
    	Disp:"يتم ارجاع TRUE اذا كان هناك على الأقل متغير مستقل بقيمة TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"يتم ارجاع قيمة تقريبية الى Pi."
    },
    PMT:{
    	Syntax:"${0}(rate${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"يتم ارجاع دفعات القرض على أساس دفعات منتظمة ومعدل فائدة ثابت."
    },
    POWER:{    
    	Syntax:"${0}(base${1} power)",
    	Disp:"يتم رفع الرقم الى الأس لرقم أخر."
    },
    PPMT:{
    	Syntax:"${0}(rate${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"يتم احتساب مبلغ السداد لفترة زمنية لاستثمار على أساس دفعات منتظمة ومعدل فائدة ثابت."
    },
    PRICEDISC:{
    	Syntax:"${0}(settlement${1} maturity${1} discount${1} redemption${1} [basis])",
    	Disp:"يتم احتساب السعر لكل قيمة أسمية بمبلغ 100 جنيه من قيمة السندات المالية المخفضة."
    },
    PRICEMAT:{
    	Syntax:"${0}(settlement${1} maturity${1} issue${1} rate${1} yld${1} [basis])",
    	Disp:"يتم احتساب السعر لكل قيمة أسمية بمبلغ 100 جنيه من قيمة السندات المالية التي يتم دفع فائدتها عند الاستحقاق."
    },
    PRODUCT:{   
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم مضاعفة كل الأرقام المحددة كمتغيرات مستقلة ويتم ارجاع حاصل الضرب."
    },
    PROPER:{    
    	Syntax:"${0}(text)",
    	Disp:"يتم تحويل مجموعة حروف النص الى حالة الحروف المناسبة، الحرف الأول من كل كلمة يصبح حرف علوى وكل الحروف الأخرى تصبح حروف سفلية."
    },
    PV:{
    	Syntax:"${0}(rate${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"يتم احتساب القيمة الحالية للاستثمار، بناءا على سلاسل المدفوعات المستقبلية."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numerator${1} denominator)",
        Disp:"يتم ارجاع نتيجة قسمة رقم على رقم آخر، تم اقتطاعه الى رقم صحيح."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "تقوم بارجاع رقم عشوائي بين 0 و 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bottom${1} top)",
    	Disp: "يتم ارجاع رقم صحيح عشوائى من بين الأرقام التى تقوم بتحديدها."
    },
    RANK:{    
    	Syntax:"${0}(number${1} ref${1} [order])",
    	Disp: "يتم ارجاع الترتيب لقيمة فى عينة.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - تنازلي",
          		 result : 0
          	 }, {
          		 label : "${0} - تصاعدي",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(settlement${1} maturity${1} investment${1} discount${1} [basis])",
    	Disp:"يتم احتساب المبلغ المستلم عند الاستحقاق للسندات المالية التي تم الاستثمار فيها بالكامل."
    }, 
    REPLACE:{    
    	Syntax: "${0}(text${1} position${1} length${1} new text)",
    	Disp:"يتم استبدال الحروف داخل مجموعة حروف نصية بمجموعة حروف نصية مختلفة."	
    },
    REPT:{    
    	Syntax: "${0}(text${1} count)",
    	Disp:"يكرر النص بعدد مرات معين."	
    },
    RIGHT:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"يتم ارجاع أخر حرف أو حروف فى النص."
    },
    RIGHTB:{
    	Syntax: "${0}(text${1} [number])",
    	Disp:"يتم ارجاع أخر حرف أو حروف فى النص."
    },
    ROUND:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"يتم تقريب رقم بدقة معرفة مسبقا."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"يتم تقريب رقم فاتجاه الصفر بدقة معرفة مسبقا."
    },
    ROUNDUP:{   
    	Syntax: "${0}(number${1} count)",
    	Disp:"يتم تقريب رقم بعيدا عن الصفر بدقة معرفة مسبقا."
    },
    ROW:{   
    	Syntax:"${0}([reference])",
    	Disp:"يتم تعريف رقم الصف الداخلى لمرجع."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"يتم ارجاع عدد الصفوف فى مصفوفة أو مرجع."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"يتم تحويل الدرجات الى زاوية نصف قطرية."
    },
    ROMAN:{   
    	Syntax:"${0}(number${1} [form])",
    	Disp:"يتم تحويل رقم بالعربية الى الرومانية، كنص.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - تقليدي",
          		 result : 0
          	 }, {
          		 label : "${0} - أكثر ايجازا",
          		 result : 1
          	 }, {
          		 label : "${0} - أكثر ايجازا",
          		 result : 2
          	 }, {
          		 label : "${0} - أكثر ايجازا",
          		 result : 3
          	 }, {
          		 label : "${0} - مبسط",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find text${1} text${1} [position])",
    	Disp:"يتم البحث عن قيمة نص واحد داخل أخر (بلا حساسية لحالة الحرف)."
    },  
    SIGN:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع العلامة الجبرية لرقم."
    },
    SIN:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع جيب الزاوية للزاوية المحددة."
    },
    SINH:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع جيب الزاوية الزائد لرقم."
    },
    SECOND:{    
    	Syntax:"${0}(number)",
    	Disp:"يتم تحديد الرقم المتعاقب للثانية من الدقيقة(0-59) لقيمة الوقت."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficients)",
        Disp:"يتم ارجاع مجموع سلاسل الأس وفقا للمعادلات."
    },
    SHEET:{   
    	Syntax:"${0}([reference])",
    	Disp:"يتم ارجاع رقم الجدول الداخلى لمرجع أو مجموعة حروف."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} nth_position)",
    	Disp:"يتم ارجاع أصغر قيمة nth من مجموعة من القيم."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(text${1} old${1} new${1} [which])",
    	Disp:"يتم ارجاع النص حيث يتم استبدال نص قديم بنص جديد."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(function${1} range${1} ...)",
    	Disp:"يتم احتساب الاجماليات الفرعية فى الجداول الحسابية.",
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
    	Disp:"يتم ارجاع اجمالى كل المتغيرات المستقلة."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"يتم ارجاع اجمالى حاصل ضرب المتغيرات المستقلة بالمصفوفة."
    },
    SUMIF:{   
    	Syntax:"${0}(range${1} criteria${1} [sum range])",
    	Disp:"اجماليات المتغيرات المستقلة التى تطابق الشروط."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"يتم حساب مجموع المتغيرات المستقلة التى تحقق عدة شروط."
    },
    SQRT:{   
    	Syntax:"${0}(number)",
    	Disp:"يتم ارجاع الجذر التربيعى لرقم."
    },
    SQRTPI:{   
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع الجذر التربيعي الى ‏‎(number * pi)‎‏."
    },
    STDEV:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم احتساب الانحراف المعياري وفقا لعينة."
    },
    STDEVP:
    {
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
    	Disp:"يتم احتساب الانحراف المعياري عل أساس عناصر الحصر بالكامل."
    },
    SUMSQ:{
    	Syntax:"${0}(number 1${1} [number 2]${1} ...)",
        Disp:"يتم ارجاع اجمالي الأرقام التربيعية لأرقام في الكشف."
    },
    T:{
    	Syntax:"${0}(text)",
    	Disp:"يتم تحويل المتغيرات المستقلة الخاصة بها الى نص."
    },
    TAN:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع ظل الزاوية لرقم محدد."
    },
    TANH:{    
    	Syntax:"${0}(number)",
        Disp:"يتم ارجاع الظل القطعي لرقم محدد."
    },
    TBILLPRICE:{
    	Syntax:"${0}(settlement${1} maturity${1} discount)",
    	Disp:"يتم احتساب السعر لكل قيمة أسمية بمبلغ 100 جنيه لأذون الخزانة."
    },
    TEXT:{
    	Syntax:"${0}(value${1} formatcode)",
    	Disp:"يتم تحويل القيمة الى نص بناءا على قواعد لكود تنسيق الرقم ويتم ارجاعه."
    },
    TIME:{   
    	Syntax:"${0}(hour${1} minute${1} second)",
    	Disp:"يتم تحديد قيمة وقتية من تفاصيل الساعة والدقيقة والثانية."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(text)",
	    Disp:"يتم ارجاع رقم داخلى لنص بنسق الوقت الممكن."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"يتم تحديد التاريخ الحالى للحاسب الآلى."
    },    
    TRIM:{
    	Syntax:"${0}(text)",
    	Disp:"يتم ازالة كل المسافات فى البداية والخلفية. أى تسلسل أخر من 2 أو أكثر من المساحات الداخلية يتم استبدالها بمسافة واحدة."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"يتم ارجاع القيمة المنطقية TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(number${1} [count])",
    	Disp:"يتم اقتطاع الأماكن العشرية من الرقم."
    },
    TYPE:{   
    	Syntax:"${0}(value)",
    	Disp:"يتم تعريف نوع التاريخ لقيمة."	
    },
    UPPER:{  
    	Syntax: "${0}(text)",
    	Disp:"يتم تحويل نص الى الحروف العلوية."
    },
    VALUE:{    
    	Syntax: "${0}(text)",
    	Disp:"يتم تحويل متغير مستقل نصى الى رقم."
    },
    VAR:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"يتم تقييم التباين بناءا على عينة."
    },
    VARA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"يتم تقييم التباين بناءا على عينة، تتضمن أرقام ونص وقيم منطقية."
    },
    VARP:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"يتم احتساب التباين وفقا الى عناصر الحصر بالكامل."
    },
    VARPA:{    
    	Syntax: "${0}(number1${1} [number2]${1}...)",
    	Disp:"يتم احتساب التباين وفقا الى عناصر الحصر بالكامل، بما فى ذلك الأرقام والنص  والقيم المنطقية."
    },
    VLOOKUP:{    
    	Syntax: "${0}(search criterion${1} array${1} index${1} [sort order])",
    	Disp:"البحث الرأسى والمرجع للاشارة الى الخانات.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - مطابقة تقريبية",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - مطابقة تامة",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(number${1} [type])",
    	Disp:"يتم ارجاع اليوم من الأسبوع لقيمة التاريخ كرقم صحيح.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - الأرقام 1 (الأحد) الى 7 (السبت)",
          		 result : 1
          	 }, {
          		 label : "${0} - الأرقام 1 (الاثنين) الى 7 (الأحد)",
          		 result : 2
          	 }, {
          		 label : "${0} - الأرقام 0 (الاثنين) الى 6 (الأحد)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - الأرقام 1 (الاثنين) الى 7 (الأحد)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - الأرقام 1 (الثلاثاء) الى 7 (الاثنين)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - الأرقام 1 (الأربعاء) الى 7 (الثلاثاء)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - الأرقام 1 (الخميس) الى 7 (الأربعاء)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - الأرقام 1 (الجمعة) الى 7 (الخميس)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - الأرقام 1 (السبت) الى 7 (الجمعة)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - الأرقام 1 (الأحد) الى 7 (السبت)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(number${1} [mode])",
    	Disp:"يتم احتساب أسبوع التقويم مقابل التاريخ المحدد.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - الأحد",
          		 result : 1
          	 }, {
          		 label : "${0} - الاثنين",
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
    	Disp:"يتم ارجاع رقم مسلسل للتاريخ قبل أو بعد عدد محدد من أيام العمل."
    },
    XNPV:{   
    	Syntax:"${0}(rate${1} values${1} dates)",
    	Disp:"يتم احتساب صافي القيمة الحالية لجدولة التدفقات النقدية."
    },
    YEAR:{    
    	Syntax:"${0}(number)",
    	Disp:"يقوم بارجاع السنة بقيمة التاريخ كرقم صحيح."
    }
}
})

