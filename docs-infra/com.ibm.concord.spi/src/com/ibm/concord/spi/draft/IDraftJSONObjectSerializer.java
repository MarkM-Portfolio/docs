/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.draft;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import com.ibm.json.java.JSONObject;

/**
 * For customized serialization for JSONObject when writing draft.
 */
public interface IDraftJSONObjectSerializer
{
  /**
   * Customized serialization of draft JSONObject.
   * 
   * @param sectionContent
   *          JSONObject need to serialize
   * @param sectionOutputStream
   *          outputStream to serialize to
   * @param originalDraftSectionInputStream
   *          inputStream for original section JSON before saving.
   * @throws IOException
   */
  public void serialize(JSONObject sectionContent, OutputStream sectionOutputStream, InputStream originalDraftSectionInputStream)
      throws IOException;
}
