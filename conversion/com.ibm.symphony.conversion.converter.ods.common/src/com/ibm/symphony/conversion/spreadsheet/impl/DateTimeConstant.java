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

/**
 * Keep the patterns used in Toolbar/Menubar except(short, medium, long, full)
 * 
 */
public class DateTimeConstant {
	 final public static String[][] DATES = {
	        {"short", "M/d/yyyy"}, //dd.MM.yyyy
	        {"short", "M/d/yy"}, //dd.MM.yy
	        {"medium", "MMM d, yyyy"},//dd.MM.yyyy
	        {"long", "MMMM d, yyyy"},//d. MMMM y
	        {"full", "EEEE, MMMM dd, yyyy"},//EEEE, dd. MMMM y
	        {"full", "EEEE, MMMM d, yyyy"},//EEEE, d. MMMM y
//	        {"yM", "M/yyyy"},
//	        {"yQ", "Q yyyy"},
//	        {"yyQ", ""},
//	        {"MMMEd", "E, MMM d"},
//	        {"yQQQ", ""},
//	        {"MMM", "LLL"},
//	        {"y", "y"},
	        {"yMMM", "MMM yyyy"},//MMM y, or the same
//	        {"EEEd", "d EEE"},
//	        {"yMMMM", "MMMM y"},
//	        {"MMMMEd", "E, MMMM d"},
	        {"MMMd", "MMM d"},//d. MMM
//	        {"MMMMd", "MMMM d"},
//	        {"M", "L"},
//	        {"MEd", "E, M/d"},
//	        {"yMMMEd", "EEE, MMM d, y"},
//	        {"Md", "M/d"},
//	        {"yMEd", "EEE, M/d/yyyy"},
//	        {"d", "d"},
//	        {"dMMM", "d MMM"},
	        {"dateTimeShort", "M/d/yy h:mm a"},//dd.MM.yy HH:mm
	        {"dateTimeLong", "MMMM d, yyyy h:mm:ss a z"}//d. mmmm yyyy hh:mm:ss z
	    };    
	 final public static String[][] DATES_DE = {
	        {"short", "dd.MM.yy"}, //dd.MM.yy
	        {"medium", "dd.MM.yyyy"},//dd.MM.yyyy
	        {"long", "d. MMMM y"},//d. MMMM y
	        {"full", "EEEE, dd. MMMM y"},//EEEE, dd. MMMM y
	        {"full", "EEEE, d. MMMM y"},//EEEE, d. MMMM y
//	        {"yM", "M/yyyy"},
//	        {"yQ", "Q yyyy"},
//	        {"yyQ", ""},
//	        {"MMMEd", "E, MMM d"},
//	        {"yQQQ", ""},
//	        {"MMM", "LLL"},
//	        {"y", "y"},
	        {"yMMM", "MMM yyyy"},//MMM y, or the same
//	        {"EEEd", "d EEE"},
//	        {"yMMMM", "MMMM y"},
//	        {"MMMMEd", "E, MMMM d"},
	        {"MMMd", "d. MMM"},//d. MMM
//	        {"MMMMd", "MMMM d"},
//	        {"M", "L"},
//	        {"MEd", "E, M/d"},
//	        {"yMMMEd", "EEE, MMM d, y"},
//	        {"Md", "M/d"},
//	        {"yMEd", "EEE, M/d/yyyy"},
//	        {"d", "d"},
//	        {"dMMM", "d MMM"},
	        {"dateTimeShort", "dd.MM.yy HH:mm"},//dd.MM.yy HH:mm
	        {"dateTimeLong", "d. MMMM yyyy hh:mm:ss z"}//d. mmmm yyyy hh:mm:ss z
	    };    
	
	final public static String[][] TIMES = {
        {"short", "h:mm a"},
        {"medium", "h:mm:ss a"},
        {"long", "h:mm:ss a z"}, 
        {"long", "H:mm:ss z"},
        {"full", "h:mm:ss a zzzz"},
        {"Hm", "HH:mm"},
        {"Hms", "H:mm:ss"},
//        {"ms", "mm:ss"},
        {"hm", "h:mm a"},
//        {"HHmmss", ""},
//        {"H", ""},
//        {"hms", ""},
//        {"HHmm", ""},
        {"dateTimeShort", "M/d/yy h:mm a"},
        {"dateTimeLong", "MMMM d, y h:mm:ss a z"}
//        {"dateTimeShort2", "d/M/yy h:mm a"},
//        {"dateTimeLong2", "d MMMM, y h:mm:ss a z"}
    };
	final public static String[][] TIMES_DE = {
        {"short", "HH:mm"},
        {"medium", "HH:mm:ss"},
        {"long", "HH:mm:ss z"},
        {"long", "H:mm:ss z"},
        {"full", "h:mm:ss a zzzz"},
        {"Hm", "h:mm a"},
        {"Hms", "H:mm:ss"},
//        {"ms", "mm:ss"},
//        {"hm", "h:mm a"},
//        {"HHmmss", ""},
//        {"H", ""},
//        {"hms", ""},
//        {"HHmm", ""},
        {"dateTimeShort", "M/d/yy h:mm a"},
        {"dateTimeLong", "MMMM d, y h:mm:ss a z"}
//        {"dateTimeShort2", "d/M/yy h:mm a"},
//        {"dateTimeLong2", "d MMMM, y h:mm:ss a z"}
    };
}