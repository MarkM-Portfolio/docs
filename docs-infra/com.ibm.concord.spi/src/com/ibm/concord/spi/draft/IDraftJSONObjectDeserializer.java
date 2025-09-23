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

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.json.java.JSONObject;

/**
 * Deserializes draft media to JSONObject. Implementations should take care of the InputStreams opened from draft directory.
 */
public interface IDraftJSONObjectDeserializer
{
  public JSONObject deserialize(DraftDescriptor draftDescriptor) throws Exception;
}
