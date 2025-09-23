/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.common;

public class ConversionConstant {
    final public static String FILE_VERSION = DocumentVersion.VERSION_1_0_1.toString();
    final public static String CSV_FLAG = "csv";
    final public static String DATE1904 = "date1904";
    final public static String SHEETSARRAY = "sheetsArray";
    final public static String ROWSIDARRAY = "rowsIdArray";
    final public static String COLUMNSIDARRAY = "columnsIdArray";
    final public static String SHEETSIDARRAY = "sheetsIdArray";
    final public static String LASTVISITSHEET = "lastVisitSheet";
    final public static String REPEATEDNUM_A = "rn";
	final public static String REPEATEDNUM = "rn";
    final public static String COLUMNIDX = "colindex";
    final public static String COMMENT = "comment";
    final public static String CONTENT = "content";
    final public static String REFERENCE = "reference";
    final public static String REF_VALUE = "refValue";
    final public static String REF_TYPE = "refType";
    final public static String ACTION = "action";
    final public static String AUTHOR = "author";
    final public static String DATA = "data";
    final public static String COLUMNS = "columns";
    final public static String ROWS = "rows";
    final public static String ROWS_SHOW = "s";
    final public static String ROWS_HIDDEN = "h";
    final public static String SHEETNAME = "sheetname";
    final public static String SHEETINDEX = "sheetindex";
    final public static String SHEETHIDE = "hide";
    final public static String SHEETVERYHIDE = "veryhide";
    
    final public static String MAXCOLINDEX = "maxColumnIndex";
    final public static String SHEET_ROW_HEIGHT = "rowHeight";
    final public static String SHEETS = "sheets";
    final public static String STYLES = "styles";
    final public static String STYLEID_A = "styleid";
	final public static String STYLEID = "sid";
	final public static String KEY_STRING_INDEX = "sIdx";
    final public static String PARTIAL_REFERENCE = "bPR";
    final public static String SHEETID = "sheetid";
    final public static String ENDSHEETID = "endsheetid";
    final public static String ROWID = "ro";
    final public static String ROWINDEX = "rowindex";
    final public static String COLINDEX = "col";
    final public static String OPERATOR = "op";
    final public static String VALUE_A = "v";
    final public static String TOKENARRAY = "tarr";
    final public static String CELL_TYPE = "t";
	final public static String VALUE = "v";
	final public static String FORMULA_VALUE = "fv";
    final public static String LINK = "link";
    final public static String SHOWVALUE_A = "showvalue";
	final public static String SHOWVALUE = "sv";
    final public static String CALCULATEDVALUE_A = "calculatedvalue";
	final public static String CALCULATEDVALUE = "cv";
	final public static String CELL_DIRTY = "d";
	final public static String FORMULA_ERRORCODE = "ec";//used in cell content
	final public static String FORMULA_ERRORPROP = "ep";//used in cell reference which is the function error properties
    final public static String MAXROWINDEX = "maxrow";
    final public static String MAXROWCOUNT = "maxrowcount";
    final public static String MAXCOLCOUNT = "maxcolcount";
    final public static String STARTROW = "startrow";
    final public static String STARTCOL = "startcol";
    final public static String ENDROW = "endrow";
    final public static String ENDCOL = "endcol";
    final public static String FONT = "font";
    final public static String FONTNAME_A = "name";
    final public static String FONTNAME = "n";
    final public static String SIZE_A = "size";
    final public static String SIZE = "sz";
    final public static String COLOR_A = "color";
    final public static String COLOR = "c";
    final public static String ITALIC_A = "italic";
    final public static String ITALIC = "i";
    final public static String UNDERLINE_A = "underline";
    final public static String UNDERLINE = "u";
    final public static String STRIKTHROUGH_A = "strikethrough";
    final public static String STRIKTHROUGH = "st";
    final public static String BOLD_A = "bold";
    final public static String BOLD = "bd";
    final public static String BORDER = "border";
    final public static String STYLE_PRESERVE = "preserve";
    final public static String STYLE_DXFID = "dxfId";    
    final public static String BORDERCOLOR = "bordercolor";
    final public static String BORDER_LEFT_A = "border_left";
	final public static String BORDER_LEFT = "l";
    final public static String BORDER_RIGHT_A = "border_right";
	final public static String BORDER_RIGHT = "r";
    final public static String BORDER_TOP_A = "border_top";
	final public static String BORDER_TOP = "t";
    final public static String BORDER_BOTTOM_A = "border_bottom";
	final public static String BORDER_BOTTOM = "b";
    final public static String BORDER_LEFT_COLOR_A = "border_left_color";
	final public static String BORDER_LEFT_COLOR = "lc";
    final public static String BORDER_RIGHT_COLOR_A = "border_right_color";
	final public static String BORDER_RIGHT_COLOR = "rc";
    final public static String BORDER_TOP_COLOR_A = "border_top_color";
	final public static String BORDER_TOP_COLOR = "tc";
    final public static String BORDER_BOTTOM_COLOR_A = "border_bottom_color";
	final public static String BORDER_BOTTOM_COLOR = "bc";
	final public static String BORDERSTYLE = "borderstyle";
	final public static String BORDER_LEFT_STYLE_A = "border_left_style";
	final public static String BORDER_LEFT_STYLE = "ls";
	final public static String BORDER_RIGHT_STYLE_A = "border_right_style";
	final public static String BORDER_RIGHT_STYLE = "rs";
	final public static String BORDER_TOP_STYLE_A = "border_top_style";
	final public static String BORDER_TOP_STYLE = "ts";
	final public static String BORDER_BOTTOM_STYLE_A = "border_bottom_style";
	final public static String BORDER_BOTTOM_STYLE = "bs";
    final public static String WRAPTEXT_A = "wraptext";
	final public static String WRAPTEXT = "wrap";
    final public static String TEXT_ALIGN_A = "text_align";
	final public static String TEXT_ALIGN = "align";
	final public static String VERTICAL_ALIGN_A = "vertical_align";
	final public static String VERTICAL_ALIGN = "valign";
	final public static String DIRECTION_A = "direction";
	final public static String DIRECTION = "dir";
    final public static String INDENT = "indent";
    final public static String BACKGROUND_COLOR_A = "background_color";
	final public static String BACKGROUND_COLOR = "bg";
    final public static String WIDTH_A = "width";
	final public static String WIDTH = "w";
    final public static String HEIGHT_A = "h";
	final public static String HEIGHT = "h";
    final public static String FORMATS = "formats";
    final public static String RANGE_STARTCOLID_A = "startcolid";
	final public static String RANGE_STARTCOLID = "scid";
    final public static String RANGE_ENDCOLID_A = "endcolid";
	final public static String RANGE_ENDCOLID = "ecid";
    final public static String RANGE_STARTROWID_A = "startrowid";
	final public static String RANGE_STARTROWID = "srid";
    final public static String RANGE_ENDROWID_A = "endrowid";
	final public static String RANGE_ENDROWID = "erid";
	final public static String LEFTTOKENINDEX = "lIdx";
	final public static String RIGHTTOKENINDEX = "rIdx";
//    final public static String NAME_USAGE = "NAMES";
    final public static String NAME_RANGE = "names";
    final public static String VIRTUAL_REFERENCE = "vRef";
    final public static String RECOVER_REFERENCE = "RECREF";
    final public static String UNNAME_RANGE = "unnames";
    final public static String RANGE_USAGE = "usage";
    final public static String USAGE_CONDITIONAL_FORMAT = "CONDITIONAL_FORMAT";    
    final public static String USAGE_DATA_VALIDATION = "DATA_VALIDATION";
    final public static String USAGE_FILTER = "FILTER";
    final public static String USAGE_COMMENTS = "COMMENTS";
    final public static String USAGE_IMAGE = "IMAGE";
    final public static String USAGE_SHAPE = "SHAPE";
    final public static String USAGE_CHART = "chart";
    final public static String USAGE_TASK = "TASK";
    final public static String USAGE_CHART_AS_IMAGE = "CHART_AS_IMAGE";
    final public static String USAGE_NAMES = "NAMES";
    final public static String RANGE_OPTIONAL_DATA = "data";
    final public static String RANGE_ACL_DATA_TYPE = "type";
    final public static String RANGE_ACL_DATA_ADD = "add";
    final public static String RANGE_ACL_DATA_DELETE = "delete";
    final public static String RANGE_ACL_TYPE_READONLY = "readOnly";
    final public static String RANGE_ACL_DATA_OWNERS = "owners";
    final public static String RANGE_ACL_DATA_CREATOR = "creator";
    final public static String DEFAULT_CELL_STYLE = "defaultcellstyle";
    final public static String DEFAULT_ROW_STYLE = "defaultrowstyle";
    final public static String DEFAULT_COLUMN_STYLE = "defaultcolumnstyle";
    final public static String DEFAULT_COLUMN_WIDTH = "defaultcolumnwidth";
    final public static String DEFAULT_CELL_STYLE_NAME = "Default";
    final public static String UNDO_DEFAULT = "bUD";
    final public static String URL = "url";
    final public static String FILE_TYPE_FIELD = "filetype";
    final public static String FILE_VERSION_FIELD = "version";
    final public static String INDEX = "index";
    final public static String PROPERTY = "property";
    final public static String META = "meta";
	final public static String LOCALE = "locale";
    final public static String DELTA = "delta";
    final public static String STYLE_A = "style";
    final public static String STYLE = "style";
    final public static String FORMULACELL_REFERNCE_NAME = "cells";
    final public static String REFERENCE_TYPE = "type";
    final public static String ROWID_NAME_A = "rowid";
    final public static String ROWID_NAME = "rid";
    final public static String CELLS = "cells";
    final public static String IS_EMPTY = "isempty";
    final public static String COLUMNID_NAME_A = "columnid";
    final public static String COLUMNID_NAME = "cid";
    final public static String RANGE_ADDRESS_A = "address";
	final public static String RANGE_ADDRESS = "addr";
    final public static String ROW_SERIES = "row";
    final public static String FORMULA_TOKEN_INDEX = "index";
    final public static String INVALID_REF = "#REF!";
    final public static String COMMENT_ID = "commentsId";
//    final public static String CONCORD_TASK = "TASK";
//    final public static String CONCORD_COMMENT = "COMMENTS";
    final public static String CONCORD_COMMENT_CONTENT = "COMMENT_CONTENT";
    final public static String FRAG_DOC_ID = "fragid";
    final public static String VISIBILITY_A = "visibility";
    final public static String VISIBILITY = "visibility"; // "vis"
    final public static String TABCOLOR = "color";
    final public static String SORT_RESULTS = "sortresults";
    final public static String COLSPAN_A = "cs";
	final public static String COLSPAN = "cs";
	final public static String ROWSPAN = "rs";
    final public static String ISCOVERED_A = "iscovered";
	final public static String ISCOVERED = "ic";
    final public static String RANGEID = "rangeid";  
    final public static String ACTION_ID = "uuid";
    final public static String OFFSET = "off";
    final public static String OFFSET_A = "off";
    
    final public static String FORMAT = "format";
    final public static String FORMATCATEGORY_A = "category";
    final public static String FORMATCATEGORY = "cat";
    final public static String FORMATCODE = "code";
    final public static String FORMATCURRENCY_A = "currency";
    final public static String FORMATCURRENCY = "cur";
    final public static String FORMAT_FONTCOLOR_A = "fmcolor";
    final public static String FORMAT_FONTCOLOR = "clr";
    final public static String RANGE_USAGE_COPY = "copy";
    final public static String RANGE_ATTR_PARENT = "parent";
    final public static String ATTR = "attr";
    final public static String PRESERVE_NAMES_RANGE = "pnames";
    final public static String BSHOW_HIDE = "bshowhide";
    
    final public static String CHART_PLOTAREA = "plotArea";
    final public static String CHART_PLOTS = "plots";
    final public static String CHART_AXIS = "axis";
    final public static String CHART_SERIES = "series";
    final public static String CHART_xVal = "xVal";
    final public static String CHART_yVal = "yVal";
    final public static String CHART_LABEL = "label";
    final public static String CHART_REF = "ref";
    final public static String CHART_CATEGORY = "cat";
    final public static String CHART_SETTINGS = "settings";
    
    final public static String ORIGINAL_ODS_FILTER = "originalOdsFilter";
    final public static String ORIGINAL_OOXML_FILTER = "originalOOXMLFilter";
    final public static String COLOR_FILTER = "color";
    final public static String DATE_TIME_FILTER = "datetime";
    final public static String DYNAMIC_FILTER = "dynamic";
    final public static String TOP10_FILTER = "top10";
    //MAX row
//  final public static int MAX_ROW_NUM = 65535;//TODO:65536...
    //MAX SHOW COL
    final public static int MAX_SHOW_COL_NUM = 1024;
    final public static int MIN_SHOW_COL_NUM = 26;
    final public static int MAX_SHOW_ROW_NUM = 10000;
    //MAX row/column in UI
    final public static int MAX_ROW_NUM = 1048576;  
    final public static int MAX_COL_NUM = 1024;
    // threshold for row style. a row that has style cells (including repeats), larger than this number is determined
    // to have a row style.
    final public static int THRES_ROW_STYLE = 900;
    // As a whole document style when insert the first column
    final public static int THRES_GLOBAL_COL_STYLE = 900;
    //max row/column in reference
    public static int MAX_REF_ROW_NUM;
    
    //max id for the row/column in reference.js
    final public static String MAX_REF = "M";
    final public static String UPDATES = "updates"; // for message updates
    final public static String ATOMIC = "atomic";//the atomic property of a message.
    
    // max row count for filter broadcast event
    final public static int MAX_FILTER_ROW_COUNT = 5;
    
    final public static String ST = "st";
    final public static String SID = "ce";
    final public static String COLUMNID = "co";
    final public static String PRESERVEID = "n";
    final public static String RANGE_PREFIX = "ra"; 
    final public static String CALCULATED = "calculated";

    // origin names
    final public static String ORIGIN_SHEETID = "os";
    final public static String ORIGIN_ROWID = "or";
    final public static String ORIGIN_COLUMNID = "oc";
    
    //init row/column/sheet index
    final public static String INIT_ROW_INDEX = "initrow";
    final public static String INIT_COLUMN_INDEX = "initcol";
    final public static String INIT_STYLE_INDEX = "initstyle";
    final public static String INIT_SHEET_INDEX = "initsheet";
    
    //format style name prefix
    final public static String FORMATID = "FN";
    final public static String SID_USER = "ceuser";
    final public static int FONTPOINTUNIT = 20;
    final public static String DEFAULT_FONT_NAME = "Arial";
    final public static int DEFAULT_SIZE_VALUE = 200; // FIXME font size
    final public static int DEFAULT_BOLD_VALUE = 400; // FIXME font bold size
    final public static boolean DEFAULT_FALSE = false;
    final public static String DEFAULT_COLOR_VALUE = "#ffffff";
    final public static String DEFAULT_ZERO = "0";
    final public static String DEFAULT_COLOR_ZERO = "#000040";
    final public static int DEFAULT_ZERO_INT = 0;
    final public static int DEFAULT_ZERO_FLOAT = 0;
    final public static String DEFAULT_TEXT_ALIGN_VALUE = "left";
    final public static String TEXT_ALIGN_VALUE_RIGHT = "right";
    final public static String TEXT_ALIGN_VALUE_CENTER = "center";
    final public static String TEXT_ALIGN_VALUE_JUSTIFY = "justify";
    final public static String DEFAULT_BACKGROUD_COLOR_VALUE = "#000040";
    final public static String DEFAULT_WHITE_COLOR_VALUE = "#ffffff";
    final public static String DEFAULT_BLACK_COLOR_VALUE = "#000000";
    final public static int DEFAULT_WIDTH_VALUE = 80; // FIXME column width, changed to 80 by ZHF
    final public static int DEFAULT_HEIGHT_VALUE = 16; // FIXME row height
    final public static String DEFAULT_BORDER_THIN = "thin";
    final public static String DEFAULT_BORDER_THICK = "thick";
    final public static String DEFAULT_FORMAT_VALUE = "general";
    final public static String FILE_TYPE_ODS = "ods";
    final public static String FILE_TYPE_XLS = "xls";
    final public static String FILE_TYPE_CSV = "csv";
    final public static String CELL_REFERENCE = "cell";
    final public static String RANGE_REFERENCE = "range";
    final public static String CHART_REFERENCE = "chart";
    final public static String RANGES = "ranges";
    final public static String DEFAULT_STYLE_RANGES = "defaultstyleranges";
    final public static String PRESERVE_RANGES = "preserveranges";
    final public static String ROWS_META = "rowsmeta";
    final public static String COLS_META = "colsmeta";
    final public static String ROW_REFERENCE = "row";
    final public static String COL_REFERENCE = "col";
//    final public static String ROWRANGE_REFERENCE = "rowrange";
//    final public static String COLRANGE_REFERENCE = "colrange";
    final public static String SHEET_REFERENCE = "sheet";
    final public static String NAMES_REFERENCE = "names";
    final public static String IS_REPLACE = "bR";
    final public static String IS_REPLACE_COMMENTS = "bRCmts";
    final public static String IS_COLUMN = "bCol";
    final public static String IS_FOLLOW_PART = "bFollowPart";
    final public static String IS_ROW = "bRow";
    final public static String FOR_CUT = "bCut";
    final public static String FOR_CUT_PASTE = "bCutPaste";
    final public static String FOR_SHEET = "bSheet";
    final public static String IGNORE_FILTER_ROW = "ignoreFilteredRow";
    
    final public static String REF_TYPE_CELL = "cell";
    final public static String REF_TYPE_ROW = "row";
    final public static String REF_TYPE_COLUMN = "column";
    final public static String REF_TYPE_SHEET = "sheet";
    final public static String REF_TYPE_NAMERANGE = "namerange";
    final public static String REF_TYPE_UNNAMERANGE = "unnamerange";
	final public static String REF_TYPE_RANGE = "range";
	final public static String REF_TYPE_CHART = "chart";
    
    final static int ID_INITAL_VALUE = 1;
	final public static String ACTION_INSERT = "insert";
	final public static String ACTION_DELETE = "delete";
	final public static String ACTION_SET = "set";
	final public static String ACTION_CLEAR = "clear";
	final public static String ACTION_MOVE = "move";
	final public static String ACTION_LOCK = "lock";
	final public static String ACTION_RELEASE = "release";
	final public static String ACTION_SORT = "sort";
	final public static String ACTION_FILTER = "filter";
	final public static String ACTION_MERGE = "merge";
	final public static String ACTION_SPLIT = "split";
	final public static String ACTION_FREEZE = "freeze";
	
    // data format stuff
    final public static String GENERAL = "GENERAL";
    final public static String NUMBERS_TYPE = "number";
    final public static int NUMBERS_INDEX = 1;
    final public static String PERCENTS_TYPE = "percent";
    final public static int PERCENTS_INDEX = 2;
    final public static String CURRENCY_TYPE = "currency";
    final public static int CURRENCY_INDEX = 3;
    final public static String DATE_TYPE = "date";
    final public static int DATE_INDEX = 4;
    final public static String TIME_TYPE = "time";
    final public static int TIME_INDEX = 5;
    final public static String SCIENTIFIC_TYPE = "scientific";
    final public static int SCIENTIFIC_INDEX = 6;
    final public static String FRACTION_TYPE = "fraction";
    final public static int FRACTION_INDEX = 7;
    final public static String BOOLEAN_TYPE = "boolean";
    final public static int BOOLEAN_INDEX = 8;
    final public static String TEXT_TYPE = "text";
    final public static int TEXT_INDEX = 9;
    final public static int STRING_INDEX = 0;
    
    final public static String CHART_DIRTY = "chart_dirty";
    
    final public static String FREEZEROW = "freezeRow";
    final public static String FREEZECOLUMN = "freezeCol";
    
    final public static String CHUNK_ID = "chunkId";
    
    final public static String OFFGRIDLINES = "offGridLine";
    
    // chart constants
	public final static String LEGEND = "legend";
	public final static String TITLE = "title";
	public final static String PLOTAREA = "plotArea";
	public final static String AXIS = "axis";
	public final static String DATASOURCE = "dataSource";
	public final static String CATEGORIES = "cat";
	public final static String REF = "ref";
	public final static String REF_ID = "ref_id";
	public final static String PLOTS = "plots";
	public final static String TYPE = "type";
	public final static String SERIES_LIST = "series";
	public final static String X_VALUES = "xVal";
	public final static String Y_VALUES = "yVal";
	public final static String BUBBLE_SIZE = "bubbleSize";
	public final static String LABEL = "label";
	public final static String VALUES = "val";
	public final static String PTS = "pts";
	public final static String CACHE = "cache";
	public final static String EXREF = "exRef";
	
    final public static String PROTECTION_PROTECTED = "protected";
    final public static String STYLE_UNLOCKED = "unlocked";
    final public static String STYLE_HIDDEN = "hidden";
	

   //comments constants
    public final static String COMMENTSID = "id";
	public final static String ITEMS = "items";
	public final static String ITEM = "item";
	public final static String ACTION_APPEND = "append";
	public final static String ACTION_UNDOAPPEND = "undoAppend";
	
	//data validation constants
	public final static String CRITERIA = "criteria";
	public final static String PARENTID = "parentId";
	public final static String VALUE1 = "value1";
	public final static String VALUE2 = "value2";
	public final static String SHARED_REF_DELTA = "shared_ref_delta";
	
	//conditional format constants
	public final static String CRITERIAS = "criterias";
	public final static String CFVOS = "cfvos";
	public final static String VAL = "val";
  // cell types
	public final static int CELL_TYPE_NUMBER = 0;
  
    public final static int CELL_TYPE_STRING = 1;
  
    public final static int CELL_TYPE_BOOLEAN = 2;
  
    public final static int CELL_TYPE_ERROR = 3;
  
    public final static int CELL_TYPE_UNKNOWN = 4;
  
    public final static int FORMULA_TYPE_NONE = 0;
  
    public final static int FORMULA_TYPE_NORMAL = 1;
  
    public final static int FORMULA_TYPE_ARRAY = 2;
  
    public final static int FORMULA_TYPE_TABLE = 3;
  
    public final static int FORMULA_TYPE_SHARED = 4;
  
    public final static int FORMULA_TYPE_MASK = 7; // lower 3 bits 1
}