package com.ibm.symphony.conversion.service.common.chart;

public class Constant
{
	  public static final String ODF_ELEMENT_CHART_CHART = "chart:chart";
	  public static final String ODF_ELEMENT_OFFICE_DOCUMENT_CONTENT ="office:document-content";
	  public static final String ODF_ELEMENT_OFFICE_DOCUMENT_STYLES ="office:document-styles";
	  public static final String ODF_ELEMENT_OFFICE_DOCUMENT_SETTINGS ="office:document-settings";
	  public static final String ODF_ELEMENT_OFFICE_FONT_DECLS = "office:font-face-decls";
	  public static final String ODF_ELEMENT_TEXT_P = "text:p";
	  public static final String ODF_ELEMENT_TEXT_H = "text:h";
	  public static final String ODF_ELEMENT_TEXT_SPAN = "text:span";
	  public static final String ODF_ELEMENT_TEXT_A = "text:a";
	  public static final String ODF_ATTR_XLINK_HREF = "xlink:href";
	  public static final String ODF_ELEMENT_STYLE_FONT_FACE = "style:font-face";
	  public static final String ODF_ELEMENT_CHART_PLOT_AREA = "chart:plot-area";
	  public static final String ODF_ELEMENT_OFFICE_SPREADSHEET = "office:spreadsheet";
	  public static final String ODF_ELEMENT_OFFICE_BODY = "office:body";
	  public static final String ODF_ELEMENT_OFFICE_CHART = "office:chart";
	  
	  public static final String ODF_ELEMENT_OFFICE_AUTOMATIC_STYLES = "office:automatic-styles";
	  public static final String ODF_ELEMENT_OFFICE_STYLES = "office:styles";
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
	  public static final String ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_REPEATED = "table:number-rows-repeated";
	  public static final String ODF_ATTRIBUTE_TABLE_STYLE_NAME = "table:style-name";
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
	  
	  final public static String INVALID_REF = "#REF!";
	  final public static String CELL_REFERENCE = "cell";
	  final public static String RANGE_REFERENCE = "range";
	  final public static String ROW_REFERENCE = "row";
	  final public static String COL_REFERENCE = "col";
	  final public static String ROWRANGE_REFERENCE = "rowrange";
	  final public static String COLRANGE_REFERENCE = "colrange";
	  final public static String SHEET_REFERENCE = "sheet";
	  
	  final public static int MAX_ROW_NUM = 1048576; 
	  final public static String LOCAL_TABLE = "local-table";
	  
	  final public static String FORMATID = "FN";
	  
	  final public static String BOOLEAN_TYPE = "boolean";
	  final public static String STRING_TYPE = "string";
	  final public static String FLOAT_TYPE = "float";
	  final public static String CURRENCY_TYPE = "currency";
	  final public static String DATE_TYPE = "date";
	  final public static String TIME_TYPE = "time";
	  final public static String PERCENTS_TYPE = "percent";
	  final public static String NUMBERS_TYPE = "number";
	  final public static String FRACTION_TYPE = "fraction";
	  final public static String SCIENTIFIC_TYPE = "scientific";
	  final public static String TEXT_TYPE = "text";
	  
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
	    
}
