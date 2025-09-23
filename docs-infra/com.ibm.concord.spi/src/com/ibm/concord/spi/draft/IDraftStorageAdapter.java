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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import com.ibm.concord.spi.util.IStorageAdapter;

public interface IDraftStorageAdapter extends IStorageAdapter
{
  public void init(IDraftStorageAdapter parent, String child);

}
