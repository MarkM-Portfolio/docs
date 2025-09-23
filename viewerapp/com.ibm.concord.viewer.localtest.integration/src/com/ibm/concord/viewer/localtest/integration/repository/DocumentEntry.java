/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.localtest.integration.repository;

import java.util.Calendar;
import java.util.Set;

import com.ibm.concord.viewer.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;


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

  private long mediaSize;
  
  private boolean isIBMDocs = false;

  public DocumentEntry(String repoId, String docId, String label, String ext, String mime, String description, Calendar modified, String[] modifier,
      String[] creator, Set<Permission> permission, long mediaSize, boolean isIBMDocs)
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
    this.permissions = permission;
    this.mediaSize = mediaSize;
    this.isIBMDocs = isIBMDocs;
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
    return Long.toString(getModified().getTimeInMillis());
  }
  
  public boolean getIsSharable()
  {
    return true;
  }
  
  public void setMimeType(String mimeType)
  {
    this.mime = mimeType;
  }

  public boolean isEncrypt() {
	  // TODO Auto-generated method stub
	  return false;
  }
 
  public boolean isIBMDocs() {
    // TODO Auto-generated method stub
    return isIBMDocs;
}

  @Override
  public boolean hasViewPermission()
  {
    return Permission.VIEW.hasPermission(getPermission());
  }

  @Override
  public String getFileDetailsURL()
  {
    return null;
  }

}
