/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.storage;

import com.ibm.concord.platform.revision.IRevisionStorageAdapter;
import com.ibm.concord.platform.util.NFSStorageAdapter;

public class NFSRevisionStorageAdapter extends NFSStorageAdapter implements IRevisionStorageAdapter
{
  @Override
  public void init(IRevisionStorageAdapter parent, String child)
  {
    super.init(parent, child);
  }
}
