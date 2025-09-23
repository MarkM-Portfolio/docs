/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.serialize;

import java.io.IOException;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;

public interface IValueHandler
{
  /**
   * Handle the json value current handler points to. The current token of jsonParser must not be a FIELD_NAME. If the handler needs to move
   * the jsonParser, make sure it finally points to the position BEFORE next value needs to process.
   * 
   * @param jsonParser
   * @return
   */
  public IValueHandlerResult handle(JsonParser jsonParser) throws JsonParseException, IOException;

  /**
   * Get called after merging ends.
   * 
   * @param jsonParser
   * @throws JsonParseException
   * @throws IOException
   */
  public void onEnd(JsonParser jsonParser) throws JsonParseException, IOException;
}
