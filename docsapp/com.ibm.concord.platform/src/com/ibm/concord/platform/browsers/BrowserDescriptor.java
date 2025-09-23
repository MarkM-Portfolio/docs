/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.browsers;

import com.ibm.json.java.JSONArray;

public class BrowserDescriptor
{

  public String id;

  public JSONArray os;

  public String display;
    
  public JSONArray versions;
  
  public String type;

  public String getId()
  {
    return id;
  }

  public JSONArray getOs()
  {
    return os;
  }
  public String getDisplay()
  {
    return display;
  }

  public JSONArray getVersions()
  {
    return versions;
  }
  
  public String getType()
  {
    return type;
  }

  private String capitilized(String string)
  {
    StringBuilder strBuilder = new StringBuilder(string);
    strBuilder.setCharAt(0, Character.toUpperCase(strBuilder.charAt(0)));
    return strBuilder.toString();

  }

}