package com.ibm.docs.viewer.mail.repository;

import java.util.Calendar;
import java.util.Set;

import com.ibm.concord.viewer.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;

public class MailDocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private String docId;

  private String title;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String[] modifier;

  private String[] creator;
  
  private Set<Permission> permissions;

  private long mediaSize = -1;

  private String versionLabel;

  private boolean isSharable = true;

  private String repository;

  public MailDocumentEntry(String repository, String docUri, String mimeType, String title, String ext, Set<Permission> permission,
      Calendar modified, String[] creator, int size)
  {
    this.repository = repository;
    this.docId = docUri;
    this.mime = mimeType;
    this.title = title;
    this.ext = ext;
    this.permissions = permission;
    this.modified = modified;
    this.creator = creator;
    this.mediaSize = size;
  }

  @Override
  public String getDocUri()
  {
    return docId;
  }

  @Override
  public String getDocId()
  {
    return docId;
  }

  @Override
  public String getMimeType()
  {
    return mime;
  }

  @Override
  public String getTitle()
  {
    return title;
  }

  @Override
  public String getRepository()
  {
    return repository;
  }

  @Override
  public String getExtension()
  {
    return ext;
  }

  @Override
  public String getDescription()
  {
    return description;
  }

  @Override
  public String getVersion()
  {
    return versionLabel;
  }

  @Override
  public Calendar getModified()
  {
    return modified;
  }

  @Override
  public String[] getModifier()
  {
    return modifier;
  }

  @Override
  public long getMediaSize()
  {
    return mediaSize;
  }

  @Override
  public String[] getCreator()
  {
    return creator;
  }

  @Override
  public Set<Permission> getPermission()
  {
    return permissions;
  }

  @Override
  public boolean getIsSharable()
  {
    return isSharable;
  }

  @Override
  public void setMimeType(String mimeType)
  {
    this.mime = mimeType;
  }

  @Override
  public boolean isEncrypt()
  {
    return false;
  }

  @Override
  public boolean isIBMDocs()
  {
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
