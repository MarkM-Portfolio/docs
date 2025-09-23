/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.revision;

import com.ibm.concord.platform.dao.IRevisionDAO;


public interface IRevisionMetaAdapterFactory
{

  public abstract IRevisionDAO getRevisionMetadataAdapter(String customerId);


}