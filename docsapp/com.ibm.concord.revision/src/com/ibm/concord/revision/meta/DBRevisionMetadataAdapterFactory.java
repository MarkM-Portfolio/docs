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

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.revision.IRevisionMetaAdapterFactory;

public class DBRevisionMetadataAdapterFactory implements IRevisionMetaAdapterFactory
{

  @Override
  public IRevisionDAO getRevisionMetadataAdapter(String customerId)
  {
    IRevisionDAO revisionDAO = (IRevisionDAO)Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IRevisionDAO.class);
    return revisionDAO;

  }

}
