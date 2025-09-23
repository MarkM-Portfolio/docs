package com.ibm.concord.viewer.spi.beans;

import java.util.Calendar;
import java.util.Set;

public class SimpleLocalEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private String docId;

  private String mimeType;

  private Calendar lastMod;

  private String repository;

  public SimpleLocalEntry(String docId, String mimeType, Calendar lastMod, String repository)
  {
    this.docId = docId;
    this.mimeType = mimeType;
    this.lastMod = lastMod;
    this.repository = repository;
  }

  public SimpleLocalEntry(String docId, String mimeType, String repository)
  {
    this(docId, mimeType, null, repository);
  }

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
    return mimeType;
  }

  @Override
  public String getTitle()
  {
    return null;
  }

  @Override
  public String getRepository()
  {
    return repository;
  }

  @Override
  public String getExtension()
  {
    return null;
  }

  @Override
  public String getDescription()
  {
    return null;
  }

  @Override
  public String getVersion()
  {
    return null;
  }

  @Override
  public Calendar getModified()
  {
    if (lastMod == null)
    {
      Calendar ca = Calendar.getInstance();
      ca.setTimeInMillis(0);
      return ca;
    }
    else
    {
      return lastMod;
    }
  }

  @Override
  public String[] getModifier()
  {
    return null;
  }

  @Override
  public long getMediaSize()
  {
    return 0;
  }

  @Override
  public String[] getCreator()
  {
    return null;
  }

  @Override
  public Set<Permission> getPermission()
  {
    return null;
  }

  @Override
  public boolean getIsSharable()
  {
    return false;
  }

  @Override
  public void setMimeType(String mimeType)
  {

  }

  @Override
  public boolean isEncrypt()
  {
    return false;
  }

  @Override
  public boolean isIBMDocs()
  {
    return false;
  }

  @Override
  public boolean hasViewPermission()
  {
    return false;
  }

  @Override
  public String getFileDetailsURL()
  {
    return null;
  }

}
