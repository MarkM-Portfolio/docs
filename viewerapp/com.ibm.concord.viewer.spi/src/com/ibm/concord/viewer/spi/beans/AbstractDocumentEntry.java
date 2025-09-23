/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.beans;

import java.util.Calendar;
import java.util.Set;

public class AbstractDocumentEntry implements IDocumentEntry
{
  protected boolean isPwdProtected = false;

  @Override
  public String getDocUri()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getDocId()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getMimeType()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getTitle()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getRepository()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getExtension()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getDescription()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getVersion()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Calendar getModified()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String[] getModifier()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public long getMediaSize()
  {
    // TODO Auto-generated method stub
    return 0;
  }

  @Override
  public String[] getCreator()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Set<Permission> getPermission()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public boolean getIsSharable()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public void setMimeType(String mimeType)
  {
    // TODO Auto-generated method stub

  }

  @Override
  public boolean isEncrypt()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public boolean isIBMDocs()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public boolean hasViewPermission()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public String getFileDetailsURL()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getCommunityId()
  {
    // TODO Auto-generated method stub
    return "";
  }

  @Override
  public String getRepositoryType()
  {
    // TODO Auto-generated method stub
    return "";
  }

  @Override
  public boolean getPwdProtected()
  {
    return isPwdProtected;
  }

  @Override
  public void setPwdProtected(boolean isPwdProtected)
  {
    this.isPwdProtected = isPwdProtected;
  }
}
