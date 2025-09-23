/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.Constant");
dojo.requireLocalization("websheet","Constant");
	websheet.Constant = {
		Row			:1,
		Column		:2,
		Cell		:3,
		Range		:4,
		RowRange    :12,
		ColumnRange :13,
		Sheet       :16,
		MaxCopyCells: 10000,
		MaxPointsInSeries: 10000,
		MaxCellsInPaste: 100000, // previous one is 50000
		MaxFormulaCellsInPaste: 40000, // previous one is 20000
		MaxCutCellsWebKit: 600,
		MaxFilteredRanges: 1000,
	    MaxColumnWidth:1120,
	    MinColumnIndex:26,
	    MaxColumnIndex:1024,
	    MaxColumnChar: "AMJ", // keeps change with MaxColumnIndex, 1024 <=> AMJ
	    MaxColumnCount:16384,//MS Office MAX column size
	    // threshold for row style. a row that has style cells (including repeats), larger than this number is determined
	    // to have a row style.
	    ThresRowStyle: 900,
	    ThresGlobalColStyle: 900,
	    ThresColRepeatNum: 600,
		MaxRowNum:1048576,
		MinRowIndex: 100,
		MaxArrayFormula:256,
		MaxSheetNameLen: 31, // follow excel's limitation
	    DEFAULT_BORDER_COLOR_VALUE : "#000000",
	    DEFAULT_BORDER_STYLE_VALUE : "solid",
	    DEFAULT_COLUMN_WIDTH:80,
		AbsoluteToken:"$",
		defaultRowHeight:17,
		MaxRowHeight:425,
		baseDateStr:"12/30/1899",
		baseDateStr1904:"01/01/1904",
		maxHour: 9999,	// follow XLS rule.
		bUndoDefault:"bUD",
		MAXREF:"M",
		JavaLongMaxValue: 9223372036854775807, //Long.MAX_VALUE of java
		JavaLongMinValue: -9223372036854775808,
		JsSnMinValue: 1e21,   //if a value larger than 1e21, js will parse it to scientific notation
		JsSnMaxValue_n: -1e21, //if a value smaller than -1e21, js will parse it to scientific notation
		SciNumMinExp4Edit: 20,
		SciNumMaxExp4Edit_n: -19,
		minImgWidth : 40,
		minImgHeight : 8,
		MaxUndoStackSize: 20,
		MaxNumOfLoadedCells: 1024000, // 1M cells - the maxinum number of non-empty cells in all loaded sheets at runtime,
									 // it can be configurable per browser
		Expand4ShiftCell: 100,
		
		APIEvent:
		{
			 /**
             * this event is fired after all controllers and models are loaded in editor.js
             */
            LOAD_READY: "LOAD_READY",
            
            SELECTION_CHANGE: "selection_change",
		},
	
		Event:
		{
		    // action
		    ACTION_CLEAR: "clear",
		    ACTION_INSERT: "insert",
		    ACTION_DELETE: "delete",
		    ACTION_SET: "set",
		    ACTION_GET: "get",
		    ACTION_MOVE: "move",
		    ACTION_IGNORE: "ignoreme",

			ACTION_SORT: "sort",
			ACTION_FILTER:"filter",			
			ACTION_MERGE: "merge",
			ACTION_SPLIT: "split",
			ACTION_FREEZE:"freeze",
			
		    LOCK: "lock",
		    RELEASE: "release",

		    // scope
		    SCOPE_CELL: "cell",
		    SCOPE_ROW: "row",
		    SCOPE_COLUMN: "column",
		    SCOPE_SHEET: "sheet",
		    SCOPE_UNNAMERANGE: "unnamerange",
		    SCOPE_RANGE: "range",
		    SCOPE_NAMERANGE: "namerange",
		    SCOPE_FRAGMENT: "fragment",
		    SCOPE_CHART: "chart"
		},
		/********RANGE**********/
		//REFERNCE TYPE
		RefType:
		{
			DEFAULT:	0,	//update reference when data change
			//now IGNORESET change to token property, rather than reference
			IGNORESET:	1,	// not set reference token dirty for set range data event and insert/delete row/col which can enlarge/shrink the reference size,
							// such as fetchScalaResult and vlookup
			CARESHOWHIDE: 2,//update reference when show/hide row/column
			CAREFILTER: 4,  //update reference for filter event
			CAREPOSITION: 8, // update reference when the reference position changed, even the size might not be changed, such as row/col functions
			ONLY_CARESIZE: 16, // only work when ignoreset is also exist, such as rows/columns function
			CARE_NAMEDEFINITION: 32 // update reference when name range is enable or disabled, such as name as function name
		},
		
		RecalcType:
		{
			NORMAL:		0,			//normal case, set itself and its parent dirty
			IGNORE:		1,			// never set its parent dirty
			ANCESTOR : 	2 			// the parent return this token directly, so the parent of the parent need to recalc
		},
		
		//RNAGE TYPE
		RangeType:
		{
			INVALID: -1,
			CELL: 1,
			RANGE: 2,
			ROW: 3,
			COLUMN: 4,
			SHEET: 5
		},
		//RANGE USAGE
		RangeUsage:
		{
			REFERENCE: "",
			SHARED_FORMULAS: "SHARED_FORMULAS",
			SHARED_REFS:"SHARED_REFS",
			TASK: "TASK",
			COMMENTS: "COMMENTS",
			FILTER: "FILTER",
			IMAGE: "IMAGE",
			SHAPE: "SHAPE",
			CHART: "chart",
			NAME: "NAMES",
			UNDEFINEDNAME: "UNDEFINEDNAMES",
			COVERINFO: "COVERINFO",
//			UNNAMES:"UNNAMES",//default
			NORMAL: "normal",
			DELETE: "delete",
			ANCHOR : "anchor", 
			INHERIT : "inherit",
			COPY : "copy", 
			FORMULA : "formula", 
			SPLIT : "split", 
			CHART_DATA : "chart_data",
			RANGEFILTER : "rangefilter",//unsupport filter
			DATA_VALIDATION : "DATA_VALIDATION",
			CONDITION_FORMAT: "CONDITIONAL_FORMAT",
			ACCESS_PERMISSION: "ACCESS_PERMISSION",
			UNDO: "undo"
		},
		
		//Criteria type for conditional format
		CriteriaType:
		{
			ABOVEAVERAGE:"aboveAverage",
			COLORSCALE:"colorScale",
			DATABAR:"dataBar",
			DUPLICATEVALUES:"duplicateValues",
			ICONSET:"iconSet",
			CELLIS:"cellIs",
			BEGINSWITH:"beginsWith",
			CONTAINSBLANKS:"containsBlanks",
			CONTAINSERRORS:"containsErrors",
			CONTAINSTEXT:"containsText",
			ENDSWITH:"endsWith",
			EXPRESSION:"expression",
			NOTCONTAINSBLANKS:"notContainsBlanks",
			NOTCONTAINSERRORS:"notContainsErrors",
			NOTCONTAINSTEXT:"notContainsText",
			TIMEPERIOD:"timePeriod",
			TOP10:"top10",
			UNIQUEVALUES:"uniqueValues"
		},
		//Criteria operator for conditional format, optional, only useful for "cellIs"
		CriteriaOperator:
		{
			BEGINSWITH:"beginsWith",
			BETWEEN:"between",
			CONTAINSTEXT:"containsText",
			ENDSWITH:"endsWith",
			EQUAL:"equal",
			GREATERTHAN:"greaterThan",
			GREATERTHANOREQUAL:"greaterThanOrEqual",
			LESSTHAN:"lessThan",
			LESSTHANOREQUAL:"lessThanOrEqual",
			NOTBETWEEN:"notBetween",
			NOTCONTAINS:"notContains",
			NOTEQUAL:"notEqual"
		},
		
		//TimePeriod for criteria for conditional format
		TimePeriod:
		{
			LAST7DAYS:"last7Days",
			LASTMONTH:"lastMonth",
			LASTWEEK:"lastWeek",
			NEXTMONTH:"nextMonth",
			NEXTWEEK:"nextWeek",
			THISMONTH:"thisMonth",
			THISWEEK:"thisWeek",
			TODAY:"today",
			TOMORROW:"tomorrow",
			YESTERDAY:"yesterday"
		},
		
		CfvosType:
		{
			/*For color scale, data bar, icon set, all value can be reference*/
			NUMBER:"num",
			PERCENT:"percent",
			FORMULA:"formula",
			PERCENTILE:"percentile",
			MAX:"max",
			MIN:"min",
			/*for operator*/
			/*<formula> element*/
			ELEMENT:"element",
			/*average*/
			ABOVEAVERAGE:"aboveAverage",
			EQUALAVERAGE:"equalAverage",
			STDDEV:"stdDev",
			/*top10*/
			BOTTOM:"bottom",
			//PERCENT:"percent",
			RANK:"rank",
			TIMEPERIOD:"timePeriod",
			/*containsText, notContainsText, beginsWith, endsWith*/
			TEXT:"text"
		},
		
		PermissionType:
		{
			EDITABLE: "editable",
			READONLY: "readOnly"
		},
		DataValidationType:
		{
			LIST: "list",
			CUSTOM: "custom",
			DATE: "date",
			TIME: "time",
			WHOLE: "whole",
			DECIMAL: "decimal",
			TEXTLENGTH: "textLength",
			NONE: "none"
		},
		valueType: {
			NUMBER: 0,
			STRING: 1,
		    BOOLEAN: 2,
		    FORMULA: 3,
		    UNKNOWN: 4,
		    ABSFORMULA: 5,
		    RELFORMULA: 6,
		    ERROR: 7
		},
		DataValidationErrorType:
		{
			STOP:"stop",
			WARNING: "warning",
			INFORMATION:"information"
		},
		DataValidationResult:
		{
			CANCEL: 0,
			RETRY: 1,
			APPLY: 2
		},
		//Relationship between two range address
		RangeRelation:
		{
			NOINTERSECTION: 0,
			INTERSECTION: 1,	//does not contain each other
			EQUAL:2,
			SUBSET:3,
			SUPERSET:4
		},	
		AreaUpdateInfo:
		{
			NONE : 0,
			UPDATE: 1,
			REMOVE: 2,
			ADD : 4,
			CHANGE: 8
		},
		//Relationship between two areas, they should be stored by ascending order in areaPage
		AreaRelation:
		{
			LESS: 1,
			EQUAL: 2,
			GREATER: 3,
			EQUAL_NOTSHEETRANGE: 4,
			NONE: 5
		},
	    //OPERATION TYPE
	    OPType:
		{
			SHEET:	1, 
			ROW:	2,
			COLUMN:	3,
			CELL:	4,
			RANGE:	5,
			STYLE:	6,
			RANGEADDRESS: 7,
			AREA:	8
		},
		
		DIRECTION:
		{
			UP: "up",
			DOWN: "down",
			LEFT: "left",
			RIGHT: "right"
		},
	    //the ID prefix
	    IDPrefix:
	    {
			ROW:	"ro", 
			ORIGINAL_ROW: "or",
			SHORT_ROW:	"r", 
			COLUMN:	"co",
			ORIGINAL_COLUMN:"oc",
			SHORT_COLUMN:	"c",
			SHEET:	"st",
			ORIGINAL_SHEET: "os",
			SHORT_SHEET:	"s",
			STYLE:	"ce",
			REF:	"rf",	//reference(represent range or cell referenced by formula),
			RANGE:  "ra",
			ACTION: "ac" 
		},
		//EVENT for broadcast/listener
		EventType:
		{
			DataChange:	1,
			UpdateUI: 	2,
			Mouse:		3,
			Key:		4
		},
		DataChange:
		{
			SET:	1,
			INSERT:	2,
			DELETE:	3,
			MOVE:	4,
			CLEAR:	5,
			PREDELETE:6,
			CALC:	7,
			SHOW:	8,
			HIDE:	9,
			FILTER: 10,
			PREINSERT: 11,
			SORT:	12,
			MERGE:	13,
			PRESPLIT:  14,
			CUT :	15,
			PREMOVE:16,
			CHANGEHEIGHTORWIDTH: 17
		},
		
		MenuBarType:
		{	
			POPUPMENUBAR :	1,
			POPUPMENU:	2,
			MENUITEM:	3,
			MENUSEPORATOR:	4
		},
		
		ModeVisible: {
			INVISIBLE:				0,
			EDITMODEVISIBLE:		1,
			OBSERVERMODEVISIBLE:	2,
			VIEWDRAFTMODEVISIBLE:	4,
			HTMLVIEWINVISIBLE:  	8  // this menu item is always visible in VIEWDRAFTMODE but invisible in HTMLVIEW
		},
		ProtectVisible:{
			VISIBLE:				0,
			SHEETPROTECTINVISIBLE:			1,
			WORKBOOKPROTECTINVISIBLE:	    2
		},
		
		ACLVisible: 1,  // used for the menu item / context item / toolbar item, if set this, this item would always show
		
		ACLViewPrefix: "ACL_View",
		ACLWarningPrefix: "ACL_Warning",
		//THE VALUE SHOULD BE BINARY WITH TOP BIT AS 1, OTHER BIT AS 0
		//AND BIT NUMBER SHOULD INCREMENT BY 1
		ToolbarMode:
		{
			ALL:	1, 
			LIGHT : 2
//			XXX : 4
		},
		
		ToolbarType:
		{
			BUTTON :	1,
			DROPDOWNBUTTON:	2,
			DROPDOWNBUTTON_STRING:	3,
			SEPERATOR:	4,
			TOGGLEBUTTON: 5
		},
		
		ToolbarGroup:
		{
			TOOLS: 1,
			CHAR_FORMATTING: 2,
			PARA_FORMATTING: 3,
			INSERT: 4,
			BORDER_TYPE:5,
			BORDER_STYLE:6,
			COLOR_NUMBER: 7
		},
		
		CellType: {
			VALUE: 0, // DON'T CHANGE IT, identical to undefined
			STYLE: 1,
			COVERINFO: 2,
			MIXED: 3   // mixed cell object with cell and style
		},
		
		ValueCellType:{
			NUMBER: 0,
			STRING: 1,
		    BOOLEAN: 2,
		    ERROR: 3,
		    UNKNOWN: 4,
		    FORMULA_NONE: 0,
		    FORMULA_NORMAL: 1,
		    FORMULA_ARRAY: 2,
		    FORMULA_TABLE: 3,
		    FORMULA_SHARED: 4,
		    FORMULA_TYPE_MASK: 7 // lower 3 bits 1
		},
		
		RangeIterType: {
			VALUE: 0, // for formula calculation
			OPTIMIZEVALUE: 1, // for optimized formula calculation, empty cells will be ignored
			NORMAL: 2, // for to range json
			TEXTMEASURE: 3, // for text measurement
			EXTENDRENDER: 4, // for canvas rendering
			CALCROWHEIGHT: 5, // for calculating row height 
			MIXED: 6, // for to range json, being back-compatible with dojo grid based rendering
			CHECKSORTRANGE: 7, //for sort range cell merge check.
			STYLEDVALUE: 8, // value cell mixed with style cell.
			CFOPTIMIZE: 9, //for optimize cf calculation, skip hidden cells.
			CFOPTIMIZEVALUE: 10 //for optimize cf calculation. skip hodden cells.
		},
		
		Position:{
			BOTH:0,
			PREVIOUS:1,
			NEXT:2
		},
		
		ErrorType:{
			NONE:0,
			SELF_RECURSIVE:1,
			OUTER_RECURSIVE:2,
			UNSUPPORTFORMULA:8, // the unsupported formula
			CALC_ERROR:4,	//set when calculate result is error
			UNPARSE_ERROR:5	//set when the referred cell has not been parsed
		},

		INVALID_REF: "#REF!",	

		FormulaTokenType:
		{
			ARG_SEP:"arg_sep",
			SHEET_SEP:"sheet_sep"
		},
		TokenStr:
		{
			XLS:
			{
				ARG_SEP:",",
				SHEET_SEP:"!"
			},
			ODF:
			{
				ARG_SEP:";",
				SHEET_SEP:"."
			}
		},
		FunctionValueType:
		{
			ARRAY_VALUE			:1,
			SCALA_VALUE			:-1,
			UNCERTAINTY_VALUE	:0
		},
		//the column/row/sheet has "$" or not
		AbsoluteAddressType:
		{
			NONE:		0,
			SHEET: 		1,
			COLUMN:		2,
			ROW:		4,
			END_SHEET:	8,
			END_COLUMN:	16,
			END_ROW:	32
		},
		RefAddressType :
		{
			NONE:			0,
			SHEET: 			1,           //whether has sheet name
			COLUMN:			2,
			ROW:			4,
			END_COLUMN:		8,
			END_ROW:		16,
			ABS_SHEET:  	32,			//whether sheet name is absolute
			ABS_COLUMN: 	64,
			ABS_ROW:    	128,
			ABS_END_COLUMN: 256,
			ABS_END_ROW : 	512,
			INVALID_SHEET:  1024,		// #REF, deleted sheet
			UNEXIST_SHEET:  2048		// user input sheet name that does not exist in current document
		},
		RelativeRefType :
		{
			NONE : 0,
			COLUMN: 1,
			ROW: 2,
			ALL: 3
		},
		CellErrProp:
		{
			DEFAULT:	0,
			IGNORE_ERR: 1,
			IGNORE_RECURSIVE: 1<<1,
			IGNORE_NONEPARAM: 1<<2,
			CARE_RENAMESHEET: 1<<3,
			UPDATE_ALWAYS: 1<<4,
			RETURN_REF: 1<<5, //the function might return reference as result
			GET_ARRAY: 1<<6,
			CALC_ALWAYS: 1<<7,
			NOTIFY_ALWAYS: 1<<8, // insert/delete rows/columns/sheet should notify the cell to calculate.
			CHECK_CR_AFTER_CAL:1<<9,
			IGNORE_ERR_REF:1<<10, // only used for re-calcuate for formulas ignore the #REF error, not the input
			CHANGE_PER_LOCALE: 1<<11  // the formula cells should be re-calculated when switch to different locale
		},
		Style:
		{
			FONT: "font",
			BORDER:"border",
			BORDERCOLOR:"bordercolor",
			BORDERSTYLE:"style",
			
			FORMAT: "format", // number format
			FORMATTYPE: "cat", // format category a.k.a "category"
			FORMATCODE: "code", // format code
			FORMATCURRENCY: "cur", // format currency a.k.a "currency"
			FORMAT_FONTCOLOR : "clr", // a.k.a "fmcolor"
			
			TEXT_ALIGN: "align", // a.k.a "text_align",
			VERTICAL_ALIGN: "valign", // a.k.a "vertical_align",
			BACKGROUND_COLOR: "bg", // a.k.a "background_color",
			PADDING_LEFT: "padding_left",
		    PADDING_RIGHT: "padding_right",
			INDENT: "indent",
			WRAPTEXT: "wrap", // a.k.a "wraptext",
			DIRECTION: "dir", // a.k.a "direction",
			
			//font set
			FONTNAME: "n", // a.k.a "name"
			SIZE: "sz", // a.k.a "size"
			COLOR: "c", // a.k.a "color"
			ITALIC: "i", // a.k.a "italic"
			UNDERLINE: "u", // a.k.a "underline"
			STRIKETHROUGH: "st", // a.k.a "strikethrough"
			BOLD: "bd", // a.k.a "bold"
			
			//border set
			BORDER_LEFT:   "l", // a.k.a "border_left",
			BORDER_RIGHT:  "r", // a.k.a "border_right",
			BORDER_BOTTOM:  "b", // a.k.a "border_bottom",
			BORDER_TOP:     "t", // a.k.a "border_top",
			
			//border color set
			BORDER_LEFT_COLOR:  "lc", // a.k.a "border_left_color",
			BORDER_RIGHT_COLOR:  "rc", // a.k.a "border_right_color",
			BORDER_BOTTOM_COLOR:  "bc", // a.k.a "border_bottom_color",
			BORDER_TOP_COLOR:     "tc", // a.k.a "border_top_color",
			
			//border Style set
			BORDER_LEFT_STYLE:  "ls", // a.k.a "border_left_style",
			BORDER_RIGHT_STYLE:  "rs", // a.k.a "border_right_style",
			BORDER_BOTTOM_STYLE:  "bs", // a.k.a "border_bottom_style",
			BORDER_TOP_STYLE:     "ts", // a.k.a "border_top_style",
			
			//protection style set
			PROTECTION_HIDDEN: "hidden",
			PROTECTION_UNLOCKED: "unlocked",
			
			DEFAULT: "default",
			DEFAULT_ROW_STYLE: "defaultrowstyle",
			DEFAULT_COLUMN_STYLE: "defaultcolumnstyle",
			DEFAULT_CELL_STYLE:"defaultcellstyle",
			
			HEIGHT:	"h",
			WIDTH:	"w",
			
			HASH_CODE: "hash" /* used for storing hash code in style json */,
			PRESERVE: "preserve",
			DXFID: "dxfId"
		},
		
		ROW_VISIBILITY_ATTR:
		{
		    SHOW:  "visible",
            HIDE:  "hide",
            FILTER: "filter"	    
		},
		
		COLUMN_VISIBILITY_ATTR:
		{
			//Enable it if need it
			//FILTER: "filter",
		    SHOW:  "visible",
            HIDE:  "hide"
		},
		
		SHEET_VISIBILITY_ATTR:
		{			
		    SHOW:  "visible",
            HIDE:  "hide"
		},
		
		PARAM_TYPE:
		{
			JSON: "json",
			OBJECT:"object"
		},
		
		DATA_TYPE:
		{
			NONE: "none",
			STYLE: "style",
			MAP: "map"
		},
		
		MSGMode: // message mode
		{
			NORMAL: 0,  // message sent from network
			UNDO: 1,
			REDO: 2
		},
		UpdateType: 
		{
			GRID:"grid",
			OTHER:"other"
		},
		
		FormatType: {
			"STRING"	: 0,	/// for string
			"NUMBER"	: 1,	/// Any "normal" number format, number format 1~40
			"PERCENT"	: 2,	/// Number as percent, number format 41~50
			"CURRENCY"	: 3,	/// Number as date, number format 51~90
			"DATE"		: 4,	/// Number as date, number format 91~130
			"TIME"		: 5,	/// Number as time, number format 131~170
			"SCIENTIFIC": 6,	/// Number as scientific, number format 171~175
			"FRACTION"	: 7,	  /// Number as scientific, number format 176~180
			"BOOLEAN"	: 8,	/// Number as boolean, number format 181~185 // ONLY FOR INPUT
			"TEXT"		: 9,	/// Text Format, number format 186~190
			"DATETIME"	: 10,
			"USERDEFINED": 11,	/// Format defined by user
			"GENERAL"	: 16  /// auto parse the string 
		},
		
		FormulaPredictStatus: {
			UNCHANGE:	-1,	//do not need to update the status before formula parse
			NONE:		0,	//at the beginning or found the two adjacent formula are not the same pattern
			PARSE:		1,	//parse the first formula
			PREDICT:	2	//they are the same pattern
		},
		PartialLevel: 
		{
			ALL: 0,
			SHEET: 1,
			ROW: 2
		},
		NameValidationResult:{
			VALID : 0,
			INVALID_EMPTY : 1,
			INVALID_RC : 2,
			INVALID_KEYWORDS : 3,
			INVALID_OTHER : 4
		},
		
		FreezeBarSize:	3,	//3px width/height for freeze bar.
		FreezeType:
		{
			ROW: 0,
			COLUMN: 1,
			SHEET: 2
		},
		
		linkType:{
			Ref: 0,
			URL: 1,
			File:2
		}
};
websheet.Constant.init = function() {
	var wsConst = websheet.Constant;
	
	if (dojo.isFF) { // firefox is much slower than other browsers
		wsConst.MaxTransformCells = 6000;
		wsConst.PartialRowCnt = 300;		//-1 means no limitation
		wsConst.PartialRowTimeoutDelay = 0; // ms
		wsConst.PartialParseCellCnt = 500;
		wsConst.PartialCalcCellCnt = 1000;
		wsConst.isDeepParsing = false;
		wsConst.THRESHOLD_ASYNC_SET_RANGE = 3000;
		wsConst.THRESHOLD_SPLIT_SET_RANGE = 5000;
		// threshold that merges "sendNotify" calls of set cell events;
		wsConst.THRESHOLD_MERGE_SET_CELL_EVENTS = 50;
		// threshold that merges "sendNotify" calls of undo delete events
		wsConst.THRESHOLD_MERGE_MESSAGE_UPDATES = 50;		
	} else {
		wsConst.MaxTransformCells = 60000;
		wsConst.PartialRowCnt = 2000;		//-1 means no limitation
		wsConst.PartialRowTimeoutDelay = 0; // ms
		wsConst.PartialParseCellCnt = 5000;
		wsConst.PartialCalcCellCnt = 10000;
		wsConst.isDeepParsing = false;
		wsConst.THRESHOLD_ASYNC_SET_RANGE = 3000;
		wsConst.THRESHOLD_SPLIT_SET_RANGE = 5000;
		// threshold that merges "sendNotify" calls of set cell events;
		wsConst.THRESHOLD_MERGE_SET_CELL_EVENTS = 50;
		// threshold that merges "sendNotify" calls of undo delete events
		wsConst.THRESHOLD_MERGE_MESSAGE_UPDATES = 50;
	}
	websheet.Constant.ERRORCODE =
	{	
			
		7:  { 
			errorType: 7,		//MS error.type
			errorCode: 	7,
			key:		"Err7",
			message:	"#N/A"
		},
		501:{ //Invalid character
			errorType: 4,
			errorCode: 	501,
			key:		"Err501",
			message:	"#Err501!"
		}, 
		502:{ //Invalid argument
			errorType: 4,
			errorCode: 	502,
			key:		"Err502",
			message:	"#Err502!"
		}, 
		503:{ //Invalid floating point operation
			errorType: 4,
			errorCode: 	503,
			key:		"Err503",
			message:	"#Err503!"
		}, 
		504:{ //Parameter list error",
			errorType: 6,		//MS error.type
			errorCode: 	504,
			key:		"Err504",
			message:	"#NUM!"
		}, 
		508:{ //Error: Pair missing",
			errorType: 4,
			errorCode: 	508,
			key:		"Err508",
			message:	"#Err508!"
		}, 
		509:{ //Missing operator
			errorType: 4,
			errorCode: 	509,
			key:		"Err509",
			message:	"#Err509!"
		}, 
		510:{ //Missing variable
			errorType: 4,
			errorCode: 	510,
			key:		"Err510",
			message:	"#Err510!"
		}, 
		511:{ //Missing variable
			errorType: 4,
			errorCode: 	511,
			key:		"Err511",
			message:	"#Err511!"
		}, 
		512:{ //Formula overflow
			errorType: 4,
			errorCode: 	512,
			key:		"Err512",
			message:	"#Err512!"
		}, 
		513:{ //String overflow
			errorType: 4,
			errorCode: 	513,
			key:		"Err513",
			message:	"#Err513!"
		}, 
		514:{ //Internal overflow
			errorType: 4,
			errorCode: 	514,
			key:		"Err514",
			message:	"#Err514!"
		}, 
		516:{ //Internal syntax error
			errorType: 4,
			errorCode: 	516,
			key:		"Err516",
			message:	"#Err516!"
		}, 
		517:{ //Internal syntax error
			errorType: 4,
			errorCode: 	517,
			key:		"Err517",
			message:	"#Err517!"
		}, 
		518:{ //Internal syntax error
			errorType: 4,
			errorCode: 	518,
			key:		"Err518",
			message:	"#Err518!"
		}, 
		519:{ //No result (#VALUE is in the cell rather than Err:519!)
			errorType: 3,		//MS error.type
			errorCode: 	519,
			key:		"Err519",
			message:	"#VALUE!"
		}, 
		520:{ //Internal syntax error
			errorType: 4,
			errorCode: 	520,
			key:		"Err520",
			message:	"#Err520!"
		}, 
		521:{ //Internal syntax error
			errorType: 4,
			errorCode: 	521,
			key:		"Err521",
			message:	"#Err521!"
		}, 
		522:{
			errorType: 2,
			errorCode: 	522,
			key:		"Err522",
			message:	"#Err522!"
		}, 
		523:{ //The calculation procedure does not converge
			errorType: 4,
			errorCode: 	523,
			key:		"Err523",
			message:	"#Err523!"
		}, 
		524:{ //invalid references (instead of Err:524 cell contains)
			errorType: 4,		//MS error.type
			errorCode: 	524,
			key:		"Err524",
			message:	"#REF!"
		}, 
		525:{ //invalid names (instead of Err:525 cell contains #NAME?)
			errorType: 5,		//MS error.type
			errorCode: 	525,
			key:		"Err525",
			message:	"#NAME?"
		}, 
		526:{ //Internal syntax error
			errorType: 4,
			errorCode: 	526,
			key:		"Err526",
			message:	"#Err526!"
		}, 
		527:{ //Internal overflow
			errorType: 4,
			errorCode: 	527,
			key:		"Err527",
			message:	"#Err527!"
		}, 
		532:{ // Division by zero
			errorType: 2,		//MS error.type
			errorCode: 	532,
			key:		"Err532",
			message:	"#DIV/0!"
		},
		533:{ // Refer to Null
			errorType: 4,		//MS error.type
			errorCode: 	533,
			key:		"Err533",
			message:	"#NULL!"
		},
		1001:{ // Unsupported formula, does not have definition in ODF spec
			errorType: 8,
			errorCode: 	1001,
			key:		"Err1001",
			message:	""	//the name of the unsupported formula
		},
		1002: { //parse error, does not have definition in ODF spec
			errorType: 4,
			errorCode: 	1002,
			key:		"Err1002",
			message:	"#ERROR!"
		},
		1003: {
			errorType: 4,
			errorCode: 1003,
			key:		"Err519",
			message: 	"#VALUE!"
		},
		1004: {
			eroorType: 4,
			errorCode: 1004,
			key:	"Err1004",
			message:	"#INVALID_DATETIME!"
		},
		//the error code > 2000 do not need translation
		2001: { //refer to the unparsed cell
			errorType: 5,
			errorCode: 2001,
			key:		"Err2001",
			message: 	"unparse"
		}
	};
	
//	websheet.Constant.keyMap = 
//	{
////		"dir" : websheet.Constant.Style.DIRECTION,				
////		"align" : websheet.Constant.Style.TEXT_ALIGN,
////		"valign" : websheet.Constant.Style.VERTICAL_ALIGN,
////		"indent" : websheet.Constant.Style.INDENT,
////		"bg": websheet.Constant.Style.BACKGROUND_COLOR,
////		"wrap": websheet.Constant.Style.WRAPTEXT,
////		"l": websheet.Constant.Style.BORDER_LEFT,
////		"r": websheet.Constant.Style.BORDER_RIGHT,
////		"t": websheet.Constant.Style.BORDER_TOP,
////		"b": websheet.Constant.Style.BORDER_BOTTOM,
////		"lc": websheet.Constant.Style.BORDER_LEFT_COLOR,
////		"rc": websheet.Constant.Style.BORDER_RIGHT_COLOR,
////		"tc": websheet.Constant.Style.BORDER_TOP_COLOR,
////		"bc": websheet.Constant.Style.BORDER_BOTTOM_COLOR,
////		"ls": websheet.Constant.Style.BORDER_LEFT_STYLE,
////		"rs": websheet.Constant.Style.BORDER_RIGHT_STYLE,
////		"ts": websheet.Constant.Style.BORDER_TOP_STYLE,
////		"bs": websheet.Constant.Style.BORDER_BOTTOM_STYLE,
////		"w": websheet.Constant.Style.WIDTH,
////		"h": websheet.Constant.Style.HEIGHT,
//		"category": websheet.Constant.Style.FORMATTYPE,
//		"currency": websheet.Constant.Style.FORMATCURRENCY,
//		"fmcolor": websheet.Constant.Style.FORMAT_FONTCOLOR,
//		"name": websheet.Constant.Style.FONTNAME,
//		"size": websheet.Constant.Style.SIZE,
//		"color": websheet.Constant.Style.COLOR,
//		"italic": websheet.Constant.Style.ITALIC,
//		"underline": websheet.Constant.Style.UNDERLINE,
//		"strikethrough": websheet.Constant.Style.STRIKETHROUGH,
//		"bold": websheet.Constant.Style.BOLD
//	},
	
	ACCOperate = {
		FOCUSMENUBAR:"focusmenubar",
		FOCUSTOOLBAR:"focustoolbar",
		FOCUSNAMEBOX:"focusnamebox",
		FOCUSSIDEBAR:"focussidebar"
	};
	
	BORDERCUSTOMIZE = {
		CUSTOMIZECOLOR:"CUSTOMIZECOLOR",
		CUSTOMIZESTYLE:"CUSTOMIZESTYLE",
		CUSTOMIZEBORDER:"CUSTOMIZEBORDER"
	};
	
	BORDERSTYLE = {
		THINDASHED:"thindashed",
		THINDOTTED:"thindotted",
		THINSOLID: "thinsolid",
		THICKDASHED:"thickdashed",
		THICKDOTTED:"thickdotted",
		THICKSOLID :"thicksolid"
	};
	
	BORDERTYPE = {
		ALLBORDERS:"ALLBORDERS",
		INNERBORDERS:"INNERBORDERS",
		HORIZONTALBORDERS:"HORIZONTALBORDERS",
		VERTICALBORDERS:"VERTICALBORDERS",
		OUTERBORDERS:"OUTERBORDERS",
		LEFTBORDER:"LEFTBORDER",
		TOPBORDER:"TOPBORDER",
		RIGHTBORDER:"RIGHTBORDER",
		BOTTOMBORDER:"BOTTOMBORDER",
		CLEARBORDERS:"CLEARBORDERS"
	};
	
	websheet.Constant.DEFAULT_RANGE_MASK = websheet.Constant.RefAddressType.COLUMN | websheet.Constant.RefAddressType.ROW | websheet.Constant.RefAddressType.END_COLUMN | websheet.Constant.RefAddressType.END_ROW;
	websheet.Constant.RANGE_MASK = websheet.Constant.RefAddressType.SHEET | websheet.Constant.DEFAULT_RANGE_MASK;
	websheet.Constant.DEFAULT_CELL_MASK = websheet.Constant.RefAddressType.COLUMN | websheet.Constant.RefAddressType.ROW;
	websheet.Constant.CELL_MASK = websheet.Constant.RefAddressType.SHEET | websheet.Constant.DEFAULT_CELL_MASK;
	websheet.Constant.DEFAULT_COLS_MASK = websheet.Constant.RefAddressType.COLUMN | websheet.Constant.RefAddressType.END_COLUMN;
	websheet.Constant.COLS_MASK = websheet.Constant.RefAddressType.SHEET | websheet.Constant.DEFAULT_COLS_MASK;
	websheet.Constant.DEFAULT_ROWS_MASK = websheet.Constant.RefAddressType.ROW | websheet.Constant.RefAddressType.END_ROW;
	websheet.Constant.ROWS_MASK = websheet.Constant.RefAddressType.SHEET | websheet.Constant.DEFAULT_ROWS_MASK;
}