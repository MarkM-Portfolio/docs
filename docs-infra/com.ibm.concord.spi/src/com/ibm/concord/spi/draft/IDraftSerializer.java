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
import java.io.OutputStream;
import java.util.List;

/**
 * For customized serialization for JSONObject when writing draft.
 */
public interface IDraftSerializer
{
  /**
   * Customized serialization of draft object.
   */
  public void serialize(Object draftObject, List<OutputStream> outStreams) throws IOException;
}
