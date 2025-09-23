/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.meta;

import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.revision.IRevisionMetaAdapterFactory;

public class JSONRevisionMetadataAdapterFactory implements IRevisionMetaAdapterFactory
{
  
  @Override
  public IRevisionDAO getRevisionMetadataAdapter(String customerId)
  {
    return new JSONRevisionMetadataAdapter(customerId);
  }
  
}
