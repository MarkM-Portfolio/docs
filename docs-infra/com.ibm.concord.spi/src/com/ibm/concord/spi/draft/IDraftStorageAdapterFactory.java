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

public interface IDraftStorageAdapterFactory
{
  public abstract IDraftStorageAdapter newDraftAdapter(String pathname);

  public abstract IDraftStorageAdapter newDraftAdapter(String parent, String child);

  public abstract IDraftStorageAdapter newDraftAdapter(IDraftStorageAdapter parent, String child);
}