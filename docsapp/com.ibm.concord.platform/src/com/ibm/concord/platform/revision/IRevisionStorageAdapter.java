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

public interface IRevisionStorageAdapter extends IStorageAdapter
{
  public void init(IRevisionStorageAdapter parent, String child);

}
