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

import com.ibm.concord.spi.draft.IDraftStorageAdapter;

public class RevisionDescriptor
{
  private String customId;
  private String docUri;
  private String repoId;
  private String revisionURI; // URI of draft media. Typical forms in "file:///", "nsf://", etc.
  private String primaryHash;
  private String secondaryHash;

  private int majorRevisionNo;
  private int minorRevisionNo;
  private String cacheURI;

  public RevisionDescriptor(String revisionURI, String cacheURI, String docUri2, String[] hash, int majorNo, int minorNo)
  {
    if (revisionURI == null && hash == null )
    {
      throw new NullPointerException();
    }

    if (hash.length < 2)
      throw new IllegalArgumentException();
    
    this.customId = null;
    this.docUri = null;
    this.revisionURI = revisionURI;
    this.cacheURI = cacheURI;
    primaryHash = hash[0];
    secondaryHash = hash[1];
  }

  public RevisionDescriptor(String customId, String repoId, String docUri, String revisionURI, String cacheURI, String[] hash, int majorRevisionNo, int minorRevisionNo)
  {
    if (customId == null || docUri == null || repoId == null || revisionURI == null || hash == null )
    {
      throw new NullPointerException();
    }
    
    if (hash.length < 2)
      throw new IllegalArgumentException();

    this.customId = customId;
    this.repoId = repoId;
    this.docUri = docUri;
    this.revisionURI = revisionURI;
    this.cacheURI = cacheURI;
    primaryHash = hash[0];
    secondaryHash = hash[1];
    this.majorRevisionNo = majorRevisionNo;
    this.minorRevisionNo = minorRevisionNo;
  }

  public String getTempURI(String eigenvalue)
  {
    if (eigenvalue == null || eigenvalue.length() == 0)
    {
      return revisionURI + IDraftStorageAdapter.separator + "temp";
    }
    else
    {
      return revisionURI + IDraftStorageAdapter.separator + "temp" + IDraftStorageAdapter.separator + eigenvalue;
    }
  }
  
  public String getMediaURI()
  {
    if (minorRevisionNo == 0) // major
      return revisionURI + IDraftStorageAdapter.separator + "base";
    else
      return revisionURI + IDraftStorageAdapter.separator + "media";      
  }

  public String getDeltaURI()
  {
    if (minorRevisionNo != 0) 
      return revisionURI + IDraftStorageAdapter.separator + "delta";
    else
      return null;
  }
  
  public String getDeltaMsgURI()
  {
    String deltaURI = getDeltaURI();
    if (deltaURI == null)
      return null;
    else
      return deltaURI + IDraftStorageAdapter.separator + "msg.json";
  }
  
  public String getInternalURI()
  {
    return revisionURI;
  }

  public String getCacheURI()
  {
    return cacheURI;
  }
  
  public String getDocId()
  {
    return docUri;
  }
  
  public String getRepository()
  {
    return repoId;
  }

  public String getCustomId()
  {
    return customId;
  }

  public int getMajorRevisionNo()
  {
    return majorRevisionNo;
  }

  public int getMinorRevisionNo()
  {
    return minorRevisionNo;
  }

  
  public String toString()
  {
    return customId + " " + docUri + " " + revisionURI;
  }

  public String getPrimaryHash()
  {
    return primaryHash;
  }

  public String getSecondaryHash()
  {
    return secondaryHash;
  }
}
