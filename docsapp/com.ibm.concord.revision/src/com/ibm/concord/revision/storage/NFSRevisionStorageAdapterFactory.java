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
import com.ibm.concord.platform.revision.IRevisionStorageAdapterFactory;
import com.ibm.concord.spi.util.IStorageAdapter;

public class NFSRevisionStorageAdapterFactory implements IRevisionStorageAdapterFactory
{
  
  
  public IRevisionStorageAdapter newRevisionAdapter(String pathname)
  {
    IRevisionStorageAdapter revisionFile = new NFSRevisionStorageAdapter();
    revisionFile.init(pathname);
    return revisionFile;
  }

  public IRevisionStorageAdapter newRevisionAdapter(String parent, String child)
  {
    IRevisionStorageAdapter revisionFile = new NFSRevisionStorageAdapter();
    revisionFile.init(parent, child);
    return revisionFile;
  }

  public IRevisionStorageAdapter newRevisionAdapter(IRevisionStorageAdapter parent, String child)
  {
    IRevisionStorageAdapter revisionFile = new NFSRevisionStorageAdapter();
    revisionFile.init(parent, child);
    return revisionFile;
  }
  
  public IRevisionStorageAdapter newRevisionAdapter(IStorageAdapter parent, String child)
  {
    IRevisionStorageAdapter revisionFile = new NFSRevisionStorageAdapter();
    revisionFile.init(parent, child);
    return revisionFile;    
  }

}
