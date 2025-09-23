/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.json.java.JSONObject;

/**
 * @author Wang Li, wliwang@cn.ibm.com
 */
public class DraftDescriptor
{
  private String customId;

  private String docUri;

  private String draftURI; // URI of draft media. Typical forms in "file:///", "nsf://", etc.

  private String primaryHash;

  private String secondaryHash;

  private String repoId;

  private JSONObject draftMeta;

  private boolean inTransacting;

  private Boolean draftOutOfDate;

  public DraftDescriptor(String draftURI, String[] hash)
  {
    if (draftURI == null && hash == null || hash.length < 2)
    {
      throw new NullPointerException();
    }

    this.customId = null;
    this.docUri = null;
    this.repoId = null;
    this.draftURI = draftURI;
    primaryHash = hash[0];
    secondaryHash = hash[1];
  }

  public DraftDescriptor(String customId, String repoId, String docUri, String draftURI, String[] hash)
  {
    if (customId == null || docUri == null || draftURI == null || hash == null || hash.length < 2)
    {
      throw new NullPointerException();
    }

    this.customId = customId;
    this.repoId = repoId;
    this.docUri = docUri;
    this.draftURI = draftURI;
    primaryHash = hash[0];
    secondaryHash = hash[1];
  }

  public String getURI()
  {
    return draftURI + IDraftStorageAdapter.separator + "media";
  }

  public String getSnapshotURI()
  {
    return draftURI + IDraftStorageAdapter.separator + "snapshot";
  }

  public String getSnapshotMediaURI()
  {
    return getSnapshotURI() + IDraftStorageAdapter.separator + "media";
  }
  
  public String getTempURI(String eigenvalue)
  {
    if (eigenvalue == null || eigenvalue.length() == 0)
    {
      return draftURI + IDraftStorageAdapter.separator + "temp";
    }
    else
    {
      return draftURI + IDraftStorageAdapter.separator + "temp" + IDraftStorageAdapter.separator + eigenvalue;
    }
  }

  /**
   * Set whether in transacting operation or not currently.
   * 
   * @param inTransacting
   */
  public void setInTransacting(boolean inTransacting)
  {
    this.inTransacting = inTransacting;
  }

  /**
   * Get whether in transacting operation or not currently.
   * 
   * @param inTransacting
   */
  public boolean getInTransacting()
  {
    return this.inTransacting;
  }

  /**
   * Get the transaction temporary path that writing document content related files into.
   * 
   * @return
   */
  public String getTransURI()
  {
    return getTransInternalURI() + IDraftStorageAdapter.separator + "media";
  }

  /**
   * Get the transaction temporary 'draft' directory, all draft temporary files are written in this directory.
   * 
   * @return
   */
  public String getTransInternalURI()
  {
    return draftURI + IDraftStorageAdapter.separator + "trans" + IDraftStorageAdapter.separator + "draft";
  }

  public String getCacheURI(String eigenvalue)
  {
    if (eigenvalue == null || eigenvalue.length() == 0)
    {
      return draftURI + IDraftStorageAdapter.separator + "cache";
    }
    else
    {
      return draftURI + IDraftStorageAdapter.separator + "cache" + IDraftStorageAdapter.separator + eigenvalue;
    }
  }

  public String getInternalURI()
  {
    return draftURI;
  }

  public String getDocId()
  {
    return docUri;
  }

  public String getCustomId()
  {
    return customId;
  }

  public String toString()
  {
    return customId + " " + docUri + " " + draftURI;
  }

  public String getPrimaryHash()
  {
    return primaryHash;
  }

  public String getSecondaryHash()
  {
    return secondaryHash;
  }

  public String getRepository()
  {
    return repoId;
  }

  public JSONObject getDraftMetaSnapshot()
  {
    return draftMeta;
  }

  public JSONObject setDraftMetaSnapshot(JSONObject meta)
  {
    return draftMeta = meta;
  }

  public JSONObject clearDraftMetaSnapshot()
  {
    JSONObject meta = draftMeta;
    draftMeta = null;
    return meta;
  }
  
  public void setDraftOutOfDate(boolean isDraftOutOfDate)
  {
    draftOutOfDate = isDraftOutOfDate;
  }

  public Boolean isDraftOutOfDate()
  {
    return draftOutOfDate;
  }

  public void clearDraftOutOfDate()
  {
    draftOutOfDate = null;
  }
}
