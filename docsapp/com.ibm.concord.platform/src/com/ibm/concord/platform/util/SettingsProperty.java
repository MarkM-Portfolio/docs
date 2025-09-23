/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

/**
 * 
 * @author huoqif
 * 
 * append prefix(text_/sheet_/pres_) before add it to database, such as:
 * text_toolbar, sheet_toolbar, pres_toolbar
 */
public enum SettingsProperty {

	  SETTINGS_PROP_TOOLBAR ("toolbar"),
	  SETTINGS_PROP_SIDEBAR ("sidebar"),
	  SETTINGS_PROP_FEATURE ("feature_"),
	  SETTINGS_PROP_DEAFULT_PANEL ("default_panel"),
	  SETTINGS_PROP_SHOW_ASSIGNMENT ("show_assignment"),
	  SETTINGS_PROP_SHOW_INDICATOR("show_indicator"),
	  SETTINGS_PROP_SHOW_CARRIAGE_RETURN("show_carriage_return"),
	  SETTINGS_PROP_SHOW_BOOKMARK("show_bookmark"),
	  SETTINGS_PROP_SHOW_NAVIPANEL("show_navi_panel"),
	  SETTINGS_PROP_FIXED_WIDTH ("fixed_width"),  // document only
	  SETTINGS_PROP_AUTO_COMPLETE("auto_complete"), // sheet only by now.
	  SETTINGS_PROP_FORMULA ("formula"),          // sheet only
	  SETTINGS_PROP_RIGHT_DIRECTION ("right_direction"),  // sheet only
	  SETTINGS_PROP_AUTO_SPELLCHECK ("auto_spellcheck"),
	  SETTINGS_PROP_SHOW_UNSUPPORTED_FEATURE ("show_unsupported_feature"),
	  SETTINGS_PROP_SHOW_WELCOME ("show_welcome"),
	  SETTINGS_PROP_FILE_FORMAT ("file_format");
	    
	  private final String key;
	  
	  SettingsProperty(String key)
	  {
	    this.key = key;
	  }

	  @Override
	  public String toString()
	  {
	    return this.key;
	  }
}
