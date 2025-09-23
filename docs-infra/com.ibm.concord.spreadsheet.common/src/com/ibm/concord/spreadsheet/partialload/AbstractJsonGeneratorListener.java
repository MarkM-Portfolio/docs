/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload;

import org.codehaus.jackson.JsonGenerator;

/**
 * Listens generation event in {@link JsonGenerator} implementations. All listener function do nothing.
 * 
 */
public abstract class AbstractJsonGeneratorListener
{
  public void onStartObject()
  {
  }

  public void onEndObject()
  {
  }

  public void onFieldName(String name)
  {
  }
  
  public void onWriteNumber(Number n)
  {
    onWriteDefault(n);
  }
  
  public String onString(String s)
  {
    onWriteDefault(s);
    return s;
  }
  
  public void onWriteBoolean(boolean b)
  {
    onWriteDefault(b);
  }
  
  public void onWriteNull()
  {
    onWriteDefault(null);
  }

  protected void onWriteDefault(Object o)
  {
  }
}
