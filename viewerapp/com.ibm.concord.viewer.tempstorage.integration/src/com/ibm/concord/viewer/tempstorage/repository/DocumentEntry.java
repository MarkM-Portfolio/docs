/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.tempstorage.repository;

import java.util.Calendar;
import java.util.Set;

import com.ibm.concord.viewer.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;

public class DocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private String docId;

  private String title;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String[] modifier;

  private String[] creator;

  private String versionLabel;

  private Set<Permission> permissions;

  private long mediaSize = -1;

  private String libraryType;

  private String libraryId;

  private boolean isSharable = true;

  private String widgetId;

  protected DocumentEntry()
  {
    ;
  }

  public DocumentEntry(String docId, String mimeType, String version, String title, String ext, Set<Permission> permission,
      Calendar modified, String[] creator)
  {
    this.docId = docId;
    this.mime = mimeType;
    this.versionLabel = version;
    this.title = title;
    this.ext = ext;
    this.permissions = permission;
    this.modified = modified;
    this.creator = creator;
  }

  protected String getLibraryType()
  {
    return this.libraryType;
  }

  protected String getLibraryId()
  {
    return this.libraryId;
  }

  /**
   * Get the community widget id that the document belong to.
   * 
   * @return
   */
  protected String getWidgetId()
  {
    return this.widgetId;
  }

  public String getDocId()
  {
    return docId;
  }

  public String getDocUri()
  {
    return docId;
  }

  public String getMimeType()
  {
    return mime;
  }

  public String getTitle()
  {
    return title;
  }

  public String getRepository()
  {
    return TempStorageRepository.REPO_ID_TEMP_STORAGE;
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
//    modified.setTimeInMillis(1);
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
    return versionLabel;
  }

  /**
   * If the document's library type is "communityFiles", then it's community owned file and can not be shared.
   */
  public boolean getIsSharable()
  {
    return isSharable;
  }

  public void setMimeType(String mimeType)
  {
    this.mime = mimeType;
  }

  public void setDocId(String id)
  {
    docId = id;
  }

  public void setVersion(String version)
  {
    versionLabel = version;
  }

  public void setTitle(String title)
  {
    this.title = title;
  }

  public void setExt(String ext)
  {
    this.ext = ext;
  }

  public void setPermission(Set<Permission> permission)
  {
    this.permissions = permission;
  }

  public void setModified(Calendar date)
  {
    this.modified = date;
  }

  public void setCreator(String[] creator)
  {
    this.creator = creator;
  }

  @Override
  public boolean isEncrypt()
  {
    return false;
  }

  @Override
  public boolean isIBMDocs()
  {
    // TODO Auto-generated method stub
    return true;
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
