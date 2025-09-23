/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.serialize.impl;

import java.io.IOException;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandler;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandlerResult;

/**
 * Default handler implementation that iterate deeper in JSON structure. Exit on END_OBJECT. Do nothing on onEnd().
 */
public class DefaultValueHandler implements IValueHandler
{
  private IValueHandler handler;

  public DefaultValueHandler()
  {
    this.handler = null;
  }

  public DefaultValueHandler(IValueHandler nestedHandler)
  {
    this.handler = nestedHandler;
  }

  public IValueHandlerResult handle(JsonParser jsonParser) throws JsonParseException, IOException
  {
    if (jsonParser.getCurrentToken().equals(JsonToken.END_OBJECT))
    {
      return IValueHandlerResult.END;
    }

    return doHandle(jsonParser);
  }

  /**
   * Default implement goes deeper with this handler.
   * 
   * @param jsonParser
   * @return
   * @throws IOException
   * @throws JsonParseException
   */
  protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
  {
    if (handler != null)
    {
      return new IValueHandlerResult.IterateDeeper(handler);
    }
    else
    {
      return IValueHandlerResult.SKIP;
    }
  }

  public void onEnd(JsonParser jsonParser) throws JsonParseException, IOException
  {
    // do nothing
    ;
  }
}
