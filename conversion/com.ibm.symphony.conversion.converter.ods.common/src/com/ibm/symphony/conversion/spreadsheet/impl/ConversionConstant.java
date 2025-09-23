/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.impl;

import java.util.HashMap;
import java.util.regex.Pattern;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.SpreadsheetConfig;

public class ConversionConstant {
    final public static String SHEETSARRAY = "sheetsArray";
    final public static String ROWSIDARRAY = "rowsIdArray";
    final public static String COLUMNSIDARRAY = "columnsIdArray";
    final public static String SHEETSIDARRAY = "sheetsIdArray";
    final public static String REPEATEDNUM = "rn";
    final public static String COLUMNIDX = "colindex";
    final public static String COMMENT = "comment";
    final public static String CONTENT = "content";
    final public static String REFERENCE = "reference";
    final public static String AUTHOR = "author";
    final public static String COLUMNS = "columns";
    final public static String ROWS = "rows";
    final public static String SHEETNAME = "sheetname";
    final public static String SHEETINDEX = "sheetindex";
    final public static String MAXCOLINDEX = "maxColumnIndex";    
    final public static String SHEETHIDE = "hide";
    final public static String SHEETVERYHIDE = "veryhide";
    final public static String SHEETSHOW = "show";
    final public static String OFF_GRIDLINES = "offGridLine";
    //freeze window settings.
    final public static String CURRENTPOSITIONX = "CursorPositionX";
    final public static String CURRENTPOSITIONY = "CursorPositionY";
    final public static String VERTICAL_SPLIT_POSITION = "VerticalSplitPosition";
    final public static String VERTICAL_SPLIT_MODE = "VerticalSplitMode";
    final public static String HORIZONTAL_SPLIT_MODE = "HorizontalSplitMode";
    final public static String HORIZONTAL_SPLIT_POSITION = "HorizontalSplitPosition";
    final public static String ACTIVE_SPLITRANGE = "ActiveSplitRange";
    final public static String POSITION_LEFT = "PositionLeft";
    final public static String POSITION_RIGHT = "PositionRight";
    final public static String POSITION_TOP = "PositionTop";
    final public static String POSITION_BOTTOM = "PositionBottom";
    final public static int VIEW_FREEZE_MODE = 2;
    final public static int VIEW_SPLIT_MODE = 1;
    final public static int VIEW_DEFAULT_MODE = 0;
    
    
    final public static String VERTICAL_SPLIT_POSITION_JS = "freezeRow";
    final public static String HORIZONTAL_SPLIT_POSITION_JS = "freezeCol";
    
    
    final public static String SHEETS = "sheets";
    final public static String STYLES = "styles";
    final public static String STYLEID = "sid";
    final public static String DATAFILED = "data";
    final public static String SHEETID = "sheetid";
    final public static String ENDSHEETID = "endsheetid";
    public static final String ID_STRING = "id";
    final public static String ROWID = "or";
    final public static String IMGID = "img";
    final public static String ROWINDEX = "rowindex";
    final public static String VALUE = "v";
    final public static String REFERENCEVALUE = "value";
    final public static String SHOWVALUE = "sv";
    final public static String CALCULATEDVALUE = "cv";
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
    final public static String BORDERCOLOR = "bordercolor";
    final public static String BORDER_LEFT = "l";
    final public static String BORDER_RIGHT = "r";
    final public static String BORDER_TOP = "t";
    final public static String BORDER_BOTTOM = "b";
    final public static String BORDER_LEFT_COLOR = "lc";
    final public static String BORDER_RIGHT_COLOR = "rc";
    final public static String BORDER_TOP_COLOR = "tc";
    final public static String BORDER_BOTTOM_COLOR = "bc";
    final public static String BORDERSTYLE = "borderstyle";
    final public static String DEFAULT_BORDER_STYLE = "solid";
    final public static String BORDER_LEFT_STYLE_A = "border_left_style";
    final public static String BORDER_LEFT_STYLE = "ls";
    final public static String BORDER_RIGHT_STYLE_A = "border_right_style";
    final public static String BORDER_RIGHT_STYLE = "rs";
    final public static String BORDER_TOP_STYLE_A = "border_top_style";
    final public static String BORDER_TOP_STYLE = "ts";
    final public static String BORDER_BOTTOM_STYLE_A = "border_bottom_style";
    final public static String BORDER_BOTTOM_STYLE = "bs";
    final public static String WRAPTEXT = "wrap";
    final public static String TEXT_ALIGN = "align";
    final public static String VERTICAL_ALIGN = "valign";
    final public static String DIRECTION = "dir";
    final public static String RTL = "rtl";
    final public static String LTR = "ltr";
    final public static String INDENT = "indent";
    final public static String BACKGROUND_COLOR = "bg";
    final public static String WIDTH = "w";
    final public static String HEIGHT = "h";
    final public static String FORMATS = "formats";
    final public static String RANGE_STARTCOLID = "scid";
    final public static String RANGE_ENDCOLID = "ecid";
    final public static String RANGE_STARTROWID = "srid";
    final public static String RANGE_ENDROWID = "erid";
    final public static String RANGE_ATTRIBUTE = "attr";
	final public static String LEFTTOKENINDEX = "lIdx";
	final public static String RIGHTTOKENINDEX = "rIdx";
//    final public static String NAME_USAGE = "NAMES";
    final public static String NAME_RANGE = "names";
    final public static String VIRTUAL_REFERENCE = "vRef";
    final public static String UNNAME_RANGE = "unnames";
    final public static String PRESERVE_RANGE = "pnames";
    final public static String RANGE_USAGE = "usage";
    final public static String USAGE_FIlTER = "FILTER";
    final public static String VISIBILITY_FIlTER = "filter";
    final public static String DEFAULT_CELL_STYLE = "defaultcellstyle";
    final public static String DEFAULT_ROW_STYLE = "defaultrowstyle";
    final public static String SHEET_ROW_HEIGHT = "rowHeight";
    final public static String DEFAULT_COLUMN_STYLE = "defaultcolumnstyle";
    final public static String DEFAULT_COLUMN_WIDTH = "defaultcolumnwidth";
    public final static String DEFAULT_CELL_STYLE_NAME = "Default";
    final public static String KEY_NEW_DEFAULT = "NewDefault";
    final public static String URL = "url";
    final public static String FILE_VERSION_FIELD = "version";
    final public static String DATE_1904 = "date1904";
    final public static String INDEX = "index";
    final public static String PROPERTY = "property";
    final public static String META = "meta";
	final public static String LOCALE = "locale";
    final public static String DELTA = "delta";
    final public static String STYLE  = "style";
    final public static String FORMULACELL_REFERNCE_NAME = "cells";
    final public static String REFERENCE_TYPE = "type";
    final public static String ROWID_NAME = "rid";
    final public static String CELLS = "cells";
    final public static String IS_EMPTY = "isempty";
    final public static String COLUMNID_NAME = "cid";
    final public static String RANGE_ADDRESS = "addr";
    final public static String RANGE_HREF = "href";
    final public static String RANGE_LINK = "link";
    final public static String DIR_PIC_PREFIX = "Pictures";
    final public static String DIR_OBJ_PREFIX = "./ObjectReplacements";
    final public static String POSITION_X= "x";
    final public static String POSITION_Y = "y";
    final public static String POSITION_TYPE = "pt";
    final public static String INDEX_Z = "z";    
    final public static String POSITION_EX = "ex";
    final public static String POSITION_EY = "ey";
    final public static String CHART_SERIES = "series";
    final public static String ROW_SERIES = "row";
    final public static String ALT = "alt";
//    public static final Object RANGE_PARENT_ID = "parentid";
    final public static String FORMULA_TOKEN_INDEX = "index";
    final public static String INVALID_REF = "#REF!";
    final public static String COMMENT_ID = "commentsId";
//    final public static String CONCORD_TASK = "TASK";
//    final public static String CONCORD_COMMENT = "COMMENTS";
    final public static String CONCORD_COMMENT_CONTENT = "COMMENT_CONTENT";
    final public static String FRAG_DOC_ID = "fragid";
    final public static String VISIBILITY = "visibility";    
    final public static String SORT_RESULTS = "sortresults";
    public static final String IMAGESRC_SET = "imageSrcSet";
    final public static String COLSPAN = "cs";
    final public static String ROWSPAN = "rs";
    final public static String ISCOVERED = "ic";
    
    //data validation
    final public static String TYPE_WHOLE = "whole";
    final public static String TYPE_DECIMAL = "decimal";
    final public static String TYPE_DATE = "date";
    final public static String TYPE_TIME = "time";
    final public static String TYPE_TEXTLENTH = "textLength";
    final public static String TYPE_LIST = "list";
    
    final public static String OPERATOR_GREATER = ">";
    final public static String OPERATOR_GREATER_EQUAL = ">=";
    final public static String OPERATOR_LESS = "<";
    final public static String OPERATOR_LESS_EQUAL = "<=";
    final public static String OPERATOR_NOT_EQUAL = "!=";
    final public static String OPERATOR_EQUAL = "==";
    final public static String OPERATOR_BET = "between";
    final public static String OPERATOR_NOT_BET = "notBetween";
    
    final public static String PARENT_ID = "parentId";
    final public static String CRITERIA = "criteria";
    final public static String VALIDATION_TYPE = "type";
    final public static String VALIDATION_OPERATOR = "operator";
    final public static String VALIDATION_VALUE1 = "value1";
    final public static String VALIDATION_VALUE2 = "value2";
    final public static String SHOW_DROPDOWN = "showDropDown";
    final public static String DISPLAY_LIST = "displayList";
    final public static String ALLOW_BLANK = "allowBlank";
    final public static String SHOW_INPUT_MESSAGE = "showInputMsg";
    final public static String SHOW_ERROR_MESSAGE = "showErrorMsg";
    final public static String ERROR_STYLE = "errorStyle";
    final public static String ERROR_TITLE = "errorTitle";
    final public static String ERROR = "error";
    final public static String PROMPT_TITLE = "promptTitle";
    final public static String PROMPT = "prompt";

    final public static String ORIGINAL_ODS_FILTER = "originalOdsFilter";
    //absolute address type
    final public static int ABSOLUTE_NONE = 0;
    final public static int ABSOLUTE_SHEET = 1;
    final public static int ABSOLUTE_COLUMN = 2;
    final public static int ABSOLUTE_ROW = 4;
    final public static int ABSOLUTE_END_SHEET = 8;
    final public static int ABSOLUTE_END_COLUMN = 16;
    final public static int ABSOLUTE_END_ROW = 32;
    final public static String ABSOLUTE_TOKEN = "$";
    final public static String FORMAT = "format";
    final public static String FORMATCATEGORY_A = "category";
    final public static String FORMATCATEGORY = "cat";
    final public static String FORMATCATEGORY_NEGATIVE = "ncategory";
    final public static String FORMATCATEGORY_ZERO = "zcategory";
    final public static String FORMATCODE = "code";
    final public static String FORMATCURRENCY_A = "currency";
    final public static String FORMATCURRENCY = "cur";
    final public static String FORMATCURRENCY_NEGATIVE = "ncurrency";
    final public static String FORMATCURRENCY_ZERO= "zcurrency";
    public static final String OFFICE = "office";
    public static final String FONT_FACE_DECLS = "font-face-decls";
    final public static String FORMAT_FONTCOLOR_POSITIVE = "fcolor";
    final public static String FORMAT_FONTCOLOR_NEGATIVE = "nfcolor";
    final public static String FORMAT_FONTCOLOR_ZERO = "zfcolor";
    final public static String FORMAT_FONTCOLOR_TEXT = "tfcolor";

    final public static String FORMAT_FONTCOLOR_A = "fmcolor";
    final public static String FORMAT_FONTCOLOR = "clr";
    final public static String STYLE_PRESERVE = "preserve";
    
    final public static String CURRENCY_COUNTRY = "number:country";
    final public static String CURRENCY_LANGUAGE = "number:language";
    final public static String STYLE_NUMBERFORMAT = "style:numberformat-string";
    final public static String NUMBER_TRUNCATE_OVERFLOW = "number:truncate-on-overflow";
    
    //MAX row/column in UI
    final public static int MAX_ROW_NUM = 1048576;
    final public static int MAX_COL_NUM = 1024;
    //max row/column in reference
    final public static int MAX_REF_ROW_NUM = SpreadsheetConfig.getMaxSheetRows();
    //FIXME when export excel file to ods by symphony, somehow there would exists row data at the end
    // of sheet that have non-default row height, the row data should be ignored, otherwise the 
    // spreadsheet will be wrongly treated as too large document when convert, so ignore all rows
    // data after the 60000th row, as a result, those data will be lost when export.
    final public static int MAX_ROW_INDEX = 100000;
    // if content.js length should less than below size. Or Docs server may have Out of Memory Exception 
    final public static int MAX_CONTENTJS_LENGTH = 150*1024*1024;
    final public static long MAX_CELL_COUNT = SpreadsheetConfig.getMaxCellCount();
    final public static long MAX_FORMULA_CELL_COUNT = SpreadsheetConfig.getMaxFormulaCellCount();
    //max id for the row/column in reference.js
    final public static String MAX_REF = "M";
    final public static String UPDATES = "updates"; // for message updates
    
    final public static String BREAK_PAGE = "page"; 

    final public static String ST = "os";
    final public static String SID = "ce";
    final public static String COLUMNID = "oc";
    final public static String PRESERVEID = "n";
    final public static String CALCULATED = "calculated";
    
    // origin names
    final public static String ORIGIN_SHEETID = "os";
    final public static String ORIGIN_ROWID = "or";
    final public static String ORIGIN_COLUMNID = "oc";
    
    //format style name prefix
    final public static String FORMATID = "FN";
    final public static String SID_USER = "ceuser";
    final public static int FONTPOINTUNIT = 20;
    final public static int DEFAULT_SIZE_VALUE = 200; // FIXME font size
    final public static int DEFAULT_FONT_SIZE = DEFAULT_SIZE_VALUE/FONTPOINTUNIT;
    
    final public static String DEFAULT_FONT_NAME = "Arial";
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
    final public static String DEFAULT_VERTICAL_ALIGN_VALUE = "bottom";
    final public static String VERTICAL_ALIGN_VALUE_TOP = "top";
    final public static String VERTICAL_ALIGN_VALUE_MIDDLE = "middle";
    final public static String TEXT_ALIGN_VALUE_JUSTIFY = "justify";
    final public static String DEFAULT_BACKGROUD_COLOR_VALUE = "#000040";
    final public static String DEFAULT_WHITE_COLOR_VALUE = "#ffffff";
    final public static String DEFAULT_BLACK_COLOR_VALUE = "#000000";
    final public static int DEFAULT_WIDTH_VALUE = 80; // FIXME column width, Changed to 80 By ZHF 
    final public static int DEFAULT_HEIGHT_VALUE = 16; // FIXME row height
    final public static double HEIGHT_FONT_FACTOR = (double)DEFAULT_HEIGHT_VALUE/DEFAULT_FONT_SIZE;
    final public static String DEFAULT_BORDER_THIN = "thin";
    final public static String DEFAULT_BORDER_THICK = "thick";
    final public static String DEFAULT_FORMAT_VALUE = "general";
    final public static String DEFAULT_FORMAT_CATEGORY = "number";
    final public static String DEFAULT_NUMBER_FORMAT_CODE = "#0.########";    
    final public static String FILE_TYPE_OTS = "ots";
    final public static String FILE_TYPE_ODS = "ods";
    final public static String FILE_TYPE_XLS = "xls";
    final public static String FILE_TYPE_CSV = "csv";
    final public static String CELL_REFERENCE = "cell";
    final public static String RANGE_REFERENCE = "range";
    final public static String ROW_REFERENCE = "row";
    final public static String COL_REFERENCE = "col";
    final public static String SHEET_REFERENCE = "sheet";
    final public static String NAMES_REFERENCE = "names";
    final public static String IS_REPLACE = "bR";
    final public static String IS_COLUMN = "bCol";

    public final static int ID_INITAL_VALUE = 1;
    
    //MAX SHOW COL
    final public static int MAX_SHOW_COL_NUM = 52;
    
    // data format stuff
    final public static String GENERAL = "GENERAL";
    final public static String NUMBERS_TYPE = "number";
    final public static int NUMBERS_INDEX = 1;
    final public static String PERCENTS_TYPE = "percent";
    final public static String PERCENTAGE_TYPE = "percentage";
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
    final public static String STRING_TYPE = "string";
    final public static String FLOAT_TYPE = "float";
    
    final public static String[] CURRENCY_SYMBOLS = {
        "USD",
        "EUR",
        "CNY",
        "JPY"
    };
    
    final public static String[][] CURRENCY_SYMBOL = {
      {"ARS", "$" },//         
      {"AUD", "$" },//         
      {"BOB", "$b" },       
      {"BRL", "R$" },       
      {"CAD", "CA$" },      
      {"CHF", "sFr." },      
      {"CLP", "$" },        
      {"CNY", "\u00a5" },
      {"COP", "$" },        
      {"CRC", "\u20a1" },        
      {"CZK", "K\u010d" },
      {"DEM", "\u20ac"}, 
      {"DKK", "kr" },      
      {"DOP", "RD$" },     
      {"FRF", "\u20ac"},
      {"EGP", "\u062c\u002e\u0645\u002e" },
      {"EUR", "\u20ac" },        
      {"GBP", "\u00a3" },        
      {"HKD", "HK$"},
      {"HRK", "kn" },       
      {"HUF", "Ft" },       
      {"IDR", "Rp" },       
      {"ILS", "\u20aa" },        
      {"INR", "\u20a8" },  
      {"ITL", "\u20ac" },
      {"JPY", "\u00a5" },
      {"KRW", "\u20a9" },        
      {"MAD", "\u062f.\u0645. " },    
      {"MXN", "$" },        
      {"MYR", "RM" }, 
      {"NLG", "\u20ac" },
      {"NOK", "kr" },       
      {"NZD", "$" },        
      {"PAB", "B/." },      
      {"PEN", "S/." },      
      {"PHP", "Php" },      
      {"PKR", "\u20a8" },        
      {"PLN", "z\u0142" },   
      {"PTE", "\u20ac" },
      {"PYG", "Gs" },       
      {"RON", "lei" },      
      {"RUB", "\u0440\u0443\u0431" },      
      {"SAR", "\ufdfc" },   
      {"SEK", "kr" },       
      {"SGD", "$" },        
      {"SVC", "$" },        
      {"THB", "\u0e3f" },        
      {"TRY", "TL" },      
      {"TWD", "NT$"},
      {"USD", "$"},
      {"UYU", "$U" },       
      {"VEF", "Bs" },       
      {"VND", "\u20ab" },        
      {"ZAR", "R" }         
    };
    
    //	get currency language by currency code
    //	Germany: "DEM" ==> lang = "de"; country = "DE"
    final public static String[][] CURRENCY_LANGUAGE_COUNTRY_BY_CODE = {
    	{"AUD", "en", "AU"},
    	{"BRL", "pt", "BR"},
    	{"CHF", "fr", "CH"},
    	{"CNY", "zh", "CN"},   
    	{"TWD", "zh", "TW"},
    	{"HKD", "zh", "HK"},
    	{"IDR", "id", "ID"},
        {"DEM", "de", "DE"},
        {"DKK", "da", "DK"},
        {"EGP", "ar", "EG"},
        {"EUR", "", ""}, 
        {"FRF", "fr", "FR"},
        {"GBP", "en", "GB"},
        {"ITL", "it", "IT"}, 
        {"JPY", "ja", "JP"},
        {"KRW", "ko", "KR"}, 
        {"NLG", "nl", "NL"},
        {"PLN", "pl", "PL"}, 
        {"PTE", "pt", "PT"}, 
        {"RUB", "ru", "RU"}, 
        {"SEK", "sv", "SE"}, 
        {"THB", "th", "TH"}, 
        {"TRY", "tr", "TR"}, 
        {"USD", "en", "US"},
        {"ZAR", "en", "ZA"}
      };
   
    final public static String[][] CURRENCY_CODE_BY_LANGUAGE_COUNTRY = {
    	{"AUD", "en-AU"},
    	{"BRL", "pt-BR"},
    	{"CHF", "fr-CH"},
    	{"CNY", "zh-CN"},   
    	{"TWD", "zh-TW"},
    	{"HKD", "zh-HK"},
        {"DEM", "de-DE"},
        {"DKK", "da-DK"},
        {"EGP", "ar-EG"},
 //       {"EUR", "ur-UR"}, 
        {"FRF", "fr-FR"},
        {"GBP", "en-GB"},
        {"ITL", "it-IT"}, 
        {"JPY", "ja-JP"},
        {"KRW", "ko-KR"}, 
        {"NLG", "nl-NL"},
        {"RUB", "ru-RU"}, 
        {"SEK", "sv-SE"}, 
        {"THB", "th-TH"}, 
        {"TRY", "tr-TR"}, 
        {"USD", "en-US"},
        {"ZAR", "en-ZA"}
      };
    
    //	get currency country by currency code
    //	Germany: "DEM" ==> "EUR"
    final public static String[][] OFFICE_CURRENCY_BY_CODE = {
        {"DEM", "EUR"},      
        {"FRF", "EUR"},
        {"ITL", "EUR"},
        {"PTE", "EUR"},
        {"TRY", "TRL"},
        {"NLG", "EUR"}
      };

   
    final public static String[] FORMAT_TYPES = {
        NUMBERS_TYPE,
        PERCENTS_TYPE,
        CURRENCY_TYPE,
        DATE_TYPE,
        TIME_TYPE,
        SCIENTIFIC_TYPE,
        FRACTION_TYPE,
        BOOLEAN_TYPE,
        TEXT_TYPE
    };
    
    //dojo date/time pattern name <--> ICU date/time pattern name
    final public static String[][] DATETIMETYPES = {
    	{"datetimelong", "5"},	//DateFormat.LONG(date) + DateFormat.LONG(time)
    	{"datetimeshort", "4"}, //DateFormat.SHORT(date) + DateFormat.SHORT(time)
    	{"short", "3"},			//DateFormat.SHORT(date or time)
    	{"medium", "2"},		//DateFormat.MEDIUM(date or time)
    	{"long", "1"},			//DateFormat.LONG(date or time)
    	{"full", "0"}, 			//DateFormat.FULL(date or time)
    	{"default", "-1"}
    };

    public static HashMap<String, Object> defaultValue = new HashMap<String, Object>();
    public static JSONArray jsFormatList = new JSONArray();
    public static JSONObject defaultStyle = null;
    public static JSONArray jsODFFormatList = new JSONArray();

    final static HashMap<String,String> TEXT_ALIGN_MAP = new HashMap<String,String>();
    final static HashMap<String,String> VERTICAL_ALIGN_MAP = new HashMap<String,String>();
  
  public static final String STYLE_OVERWRITE = "OverWrite";  
    
  public static final String ODF_ELEMENT_TABLETABLE = "table:table";
  public static final String ODF_ELEMENT_CHART_CHART = "chart:chart";
  public static final String ODF_ELEMENT_TABLETABLE_COLUMN = "table:table-column";
  public static final String ODF_ELEMENT_TABLETABLE_ROW = "table:table-row";
  public static final String ODF_ELEMENT_TABLETABLE_CELL = "table:table-cell";
  public static final String ODF_ELEMENT_TABLECONVEREDTABLE_CELL = "table:covered-table-cell";
  public static final String ODF_ELEMENT_OFFICE_ANNONATION = "office:annotation";
  public static final String ODF_ELEMENT_OFFICE_DOCUMENT_CONTENT ="office:document-content";
  public static final String ODF_ELEMENT_OFFICE_DOCUMENT_STYLES ="office:document-styles";
  public static final String ODF_ELEMENT_OFFICE_DOCUMENT_SETTINGS ="office:document-settings";
  public static final String ODF_ELEMENT_OOO_DOCUMENT_SETTINGS ="ooo:configuration-settings";
  public static final String ODF_ELEMENT_CONFIG_CONFIG_ITEM_SET ="config:config-item-set";
  public static final String ODF_ELEMENT_CONFIG_CONFIG_ITEM_MAP_NAMED ="config:config-item-map-named";
  public static final String ODF_ELEMENT_CONFIG_CONFIG_NAME ="config:name";
  final public static String ODF_ELEMENT_CONFIG_SHOWGRID = "ShowGrid";
  public static final String ODF_ELEMENT_OFFICE_SCRIPTS = "office:scripts";
  public static final String ODF_ELEMENT_OFFICE_FONT_DECLS = "office:font-face-decls";
  public static final String ODF_ELEMENT_TEXT_P = "text:p";
  public static final String ODF_ELEMENT_TEXT_H = "text:h";
  public static final String ODF_ELEMENT_TEXT_SPAN = "text:span";
  public static final String ODF_ELEMENT_TEXT_A = "text:a";
  public static final String ODF_ATTR_XLINK_HREF = "xlink:href";
  public static final String ODF_ELEMENT_NAMED_RANGE = "table:named-range";
  public static final String ODF_ELEMENT_NAMED_EXPRESSION = "table:named-expression";
  public static final String ODF_ELEMENT_NAMED_EXPRESSIONS = "table:named-expressions";
  public static final String ODF_ELEMENT_TABLE_TABLE_HEADER_ROWS = "table:table-header-rows";
  public static final String ODF_ELEMENT_TABLE_TABLE_ROWS = "table:table-rows";
  public static final String ODF_ELEMENT_TABLE_ROW_GROUP = "table:table-row-group";
  public static final String ODF_ELEMENT_TABLE_TABLE_HEADER_COLUMNS = "table:table-header-columns";
  public static final String ODF_ELEMENT_TABLE_TABLE_COLUMNS = "table:table-columns";
  public static final String ODF_ELEMENT_TABLE_COLUMN_GROUP = "table:table-column-group";
  public static final String ODF_ELEMENT_TABLE_SOURCE = "table:table-source";
  public static final String ODF_ELEMENT_STYLE_FONT_FACE = "style:font-face";
  public static final String ODF_ELEMENT_CHART_PLOT_AREA = "chart:plot-area";
  public static final String ODF_ELEMENT_OFFICE_SPREADSHEET = "office:spreadsheet";
  public static final String ODF_ELEMENT_OFFICE_BODY = "office:body";
  public static final String ODF_ELEMENT_OFFICE_CHART = "office:chart";
  
  public static final String ODF_ELEMENT_OFFICE_AUTOMATIC_STYLES = "office:automatic-styles";
  public static final String ODF_ELEMENT_OFFICE_STYLES = "office:styles";
  public static final String ODF_ELEMENT_DRAW_OBJECT = "draw:object";
  public static final String ODF_ELEMENT_DRAW_A = "draw:a";
  public static final String ODF_ELEMENT_DRAW_IMAGE = "draw:image";
  public static final String ODF_ELEMENT_DRAW_FRAME = "draw:frame";
  public static final String ODF_ELEMENT_SVG_TITLE = "svg:title";
  public static final String ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATIONS = "table:content-validations";
  public static final String ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATION = "table:content-validation";
  public static final String ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES = "table:database-ranges";
  public static final String ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE = "table:database-range";
  public static final String ODF_ELEMENT_TABLE_TABLE_FILTER = "table:filter";
  public static final String ODF_ELEMENT_TABLE_TABLE_FILTER_CONDITION = "table:filter-condition";
  public static final String ODF_ELEMENT_TABLE_TABLE_FILTER_AND = "table:filter-and";
  public static final String ODF_ELEMENT_TABLE_TABLE_FILTER_OR = "table:filter-or";
  public static final String ODF_ELEMENT_TABLE_TABLE_HELP_MESSAGE = "table:help-message";
  public static final String ODF_ELEMENT_TABLE_TABLE_ERROR_MESSAGE = "table:error-message";
  public static final String ODF_ELEMENT_TABLE_TABLE_CALCULATION_SETTINGS = "table:calculation-settings";
  public static final String ODF_ELEMENT_TABLE_TABLE_NULL_DATE = "table:null-date";
 	
  public static final String ODF_ATTRIBUTE_STYLE_PARENT_STYLE_NAME = "style:parent-style-name";
  public static final String ODF_ATTRIBUTE_STYLE_DATA_STYLE_NAME = "style:data-style-name";
  public static final String ODF_ATTRIBUTE_STYLE_TABLE_PROPERTIES = "style:table-properties";
  public static final String ODF_ATTRIBUTE_STYLE_TABLE_DISPLAY = "table:display";
  public static final String ODF_ATTRIBUTE_TABLE_VISIBILITY = "table:visibility";
  public static final String ODF_ATTRIBUTE_TABLE_TABLE_FORMULA = "table:formula";
  public static final String ODF_ATTRIBUTE_DRAW_NAME = "draw:name";
  public static final String ODF_ATTRIBUTE_OFFICE_VALUE_TYPE = "office:value-type";
  public static final String ODF_ATTRIBUTE_OFFICE_VALUE_PREFIX = "office:prefix";
  public static final String ODF_ATTRIBUTE_OFFICE_VALUE = "office:value";
  public static final String ODF_ATTRIBUTE_OFFICE_BOOLEAN_VALUE = "office:boolean-value";
  public static final String ODF_ATTRIBUTE_OFFICE_STRING_VALUE = "office:string-value";
  public static final String ODF_ATTRIBUTE_OFFICE_CURRENCY = "office:currency";
  public static final String ODF_ATTRIBUTE_OFFICE_DATE_VALUE = "office:date-value";
  public static final String ODF_ATTRIBUTE_OFFICE_TIME_VALUE = "office:time-value";
  public static final String ODF_ATTRIBUTE_FO_BORDER = "fo:border";
  public static final String ODF_ATTRIBUTE_FO_BORDER_LEFT  = "fo:border-left";
  public static final String ODF_ATTRIBUTE_FO_BORDER_RIGHT  = "fo:border-right";
  public static final String ODF_ATTRIBUTE_FO_BORDER_TOP = "fo:border-top";
  public static final String ODF_ATTRIBUTE_FO_BORDER_BOTTOM =  "fo:border-bottom";
  public static final String ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED = "table:number-columns-repeated";
  public static final String ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_SPANNED = "table:number-columns-spanned";
  public static final String ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_SPANNED = "table:number-rows-spanned";
  public static final String ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_REPEATED = "table:number-rows-repeated";
  public static final String ODF_ATTRIBUTE_TABLE_STYLE_NAME = "table:style-name";  
  public static final String ODF_ATTRIBUTE_TABLE_BASE_CELL_ADDRESS = "table:base-cell-address";
  public static final String ODF_ATTRIBUTE_TABLE_END_CELL_ADDRESS  = "table:end-cell-address";
  public static final String ODF_ATTRIBUTE_TABLE_END_X  = "table:end-x";
  public static final String ODF_ATTRIBUTE_TABLE_END_Y  = "table:end-y";
  public static final String ODF_ATTRIBUTE_SVG_X  = "svg:x";
  public static final String ODF_ATTRIBUTE_SVG_Y  = "svg:y";  
  public static final String ODF_ATTRIBUTE_SVG_WIDTH  = "svg:width";
  public static final String ODF_ATTRIBUTE_SVG_HEIGHT  = "svg:height";
  public static final String ODF_ATTRIBUTE_DRAW_ZINDEX  = "draw:z-index";
  public static final String ODF_ATTRIBUTE_TABLE_BACKGROUND = "table:table-background";
  public static final String ODF_ATTRIBUTE_TABLE_NAME = "table:name"; 
  public static final String ODF_ATTRIBUTE_TABLE_TARGET_RAGNE_ADDRESS = "table:target-range-address";
  public static final String ODF_ATTRIBUTE_TABLE_DISPALY_FILTER_BUTTONS = "table:display-filter-buttons";
  public static final String ODF_ATTRIBUTE_TABLE_FIELD_NUMBER = "table:field-number";
  public static final String ODF_ATTRIBUTE_TABLE_VALUE = "table:value";
  public static final String ODF_ATTRIBUTE_TABLE_OPERATOR = "table:operator";
  public static final String ODF_ELEMENT_TABLE_SHAPES = "table:shapes";
  public static final String ODF_ATTRIBUTE_TABLE_CONDITION = "table:condition";
  public static final String ODF_ATTRIBUTE_TABLE_EXPRESSION = "table:expression";
  public static final String ODF_ATTRIBUTE_TABLE_CONTENT_VALIDATION_NAME = "table:content-validation-name";
  public static final String ODF_ATTRIBUTE_TABLE_ALLOW_EMPTY_CELL = "table:allow-empty-cell";
  public static final String ODF_ATTRIBUTE_TABLE_MESSAGE_TYPE = "table:message-type";
  public static final String ODF_ATTRIBUTE_TABLE_TITLE = "table:title";
  public static final String ODF_ATTRIBUTE_TABLE_DISPLAY_LIST = "table:display-list";
  public static final String ODF_ATTRIBUTE_TABLE_DISPLAY = "table:display";
  public static final String ODF_ATTRIBUTE_TABLE_DATE_VALUE = "table:date-value";

  public final static Pattern doublePattern = Pattern.compile("^-?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)([e|E][-|+]?[0-9]+)?$");

  public final static Pattern percentPattern = Pattern.compile("^-?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)%$");

  public static final Pattern booleanPattern = Pattern.compile("true|false|TRUE|FALSE");
  
  public static enum JSONWriteMode {WORKSHEET, SHEET, ROW};
  
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


  /**
   * Document feature items (in developer's view) implemented in draft JSON.
   */
  public enum DocumentFeature {
    /**
     * JSON property name is abbred. Introduced after document version 1.0
     */
    ABBR_NAME,
    /**
     * Formula in draft JSON is always updated and don't need to be updated during partial load.
     */
    ALWAYS_UPDATED_FORMULA,
    /**
     * Cell has precise type marked in JSON.
     */
    TYPED_CELL;
  }

  final public static String PROTECTION_PROTECTED = "protected";
  final public static String STYLE_UNLOCKED = "unlocked";
  final public static String STYLE_HIDDEN = "hidden";
}
