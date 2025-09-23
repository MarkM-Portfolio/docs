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

import com.ibm.concord.spi.util.IStorageAdapter;


public interface IRevisionStorageAdapterFactory
{
  public abstract IRevisionStorageAdapter newRevisionAdapter(String pathname);

  public abstract IRevisionStorageAdapter newRevisionAdapter(String parent, String child);

  public abstract IRevisionStorageAdapter newRevisionAdapter(IRevisionStorageAdapter parent, String child);
  
  public abstract IRevisionStorageAdapter newRevisionAdapter(IStorageAdapter parent, String child);

}
