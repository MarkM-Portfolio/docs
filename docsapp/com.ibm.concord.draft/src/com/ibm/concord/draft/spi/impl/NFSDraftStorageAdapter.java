/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft.spi.impl;

import com.ibm.concord.platform.util.NFSStorageAdapter;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.concord.spi.util.IStorageAdapter;

public class NFSDraftStorageAdapter extends NFSStorageAdapter implements IDraftStorageAdapter
{
  public void init(IDraftStorageAdapter parent, String child)
  {
    super.init(parent, child);
  }
  
  public void init(String parent, String child)
  {
    super.init(parent, child);
  }

  public void init(IStorageAdapter parent, String child)
  {
    super.init(parent, child);
  }
}
