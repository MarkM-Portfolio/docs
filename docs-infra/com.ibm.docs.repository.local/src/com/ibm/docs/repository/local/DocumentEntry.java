/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.local;

import java.util.Calendar;
import java.util.Set;

import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;


public class DocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private String repoId;
  
  private String docId;

  private String label;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String[] modifier;

  private String[] creator;

  private Set<Permission> permissions;
  
  private String version;

  private long mediaSize;

  public DocumentEntry(String repoId, String docId, String label, String ext, String mime, String description, String version, Calendar modified, String[] modifier,
      String[] creator, Set<Permission> permission, long mediaSize)
  {
    this.repoId = repoId;
    this.docId = docId;
    this.label = label;
    this.ext = ext;
    this.mime = mime;
    this.description = description;
    this.modified = modified;
    this.modifier = modifier;
    this.creator = creator;
    this.version = version;
    this.permissions = permission;
    this.mediaSize = mediaSize;
  }

  public String getDocId()
  {
    return docId;
  }

  public String getDocUri()
  {
    return getDocId();
  }

  public String getMimeType()
  {
    return mime;
  }

  public String getTitle()
  {
    return label;
  }

  public String getRepository()
  {
    return this.repoId;
  }

  public String getExtension()
  {
    return ext;
  }

  public String getDescription()
  {
    return description;
  }

  public Calendar getModified()
  {
    return modified;
  }

  public String[] getModifier()
  {
    return modifier;
  }

  public String[] getCreator()
  {
    return creator;
  }

  public Set<Permission> getPermission()
  {
    return permissions;
  }

  public long getMediaSize()
  {
    return mediaSize;
  }

  public String getVersion()
  {
//    return Long.toString(getModified().getTimeInMillis());
    return version;
  }
  
  public boolean getIsSharable()
  {
    return true;
  }
  
  public void setMimeType(String mimeType)
  {
    this.mime = mimeType;
  }

  public String getFileDetailsURL()
  {
    return null;
  }
  
  public String getFilesListURL()
  {
    return null;
  }

  public boolean isPublished()
  {
    return true;
  }

  public boolean isEncrypt()
  {
    return false;
  }

  public boolean isLocked() 
  {
	// TODO Auto-generated method stub
	return false;
  }

  public String[] getLockOwner() 
  {
	 // TODO Auto-generated method stub
	 return null;
  }
  
  public String getVersionSeriesId()
  {
    return null;
  }
  
  public String getVersionSeriesUri()
  {
    return null;
  }
}
