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

import java.util.Calendar;
import java.util.Set;

import com.ibm.concord.spi.beans.Permission;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AbstractDocumentEntry implements IDocumentEntry
{

  public String getDocUri()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getDocId()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getMimeType()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getTitle()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getRepository()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getExtension()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getDescription()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getFileDetailsURL()
  {
    // TODO Auto-generated method stub
    return null;
  }
  
  public String getFilesListURL()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getVersion()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public Calendar getModified()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String[] getModifier()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public long getMediaSize()
  {
    // TODO Auto-generated method stub
    return 0;
  }

  public String[] getCreator()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public Set<Permission> getPermission()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public boolean getIsSharable()
  {
    // TODO Auto-generated method stub
    return false;
  }
  
  public String getCommunityId()
  {
    // TODO Auto-generated method stub
    return "";
  }
  
  public String getCommunityType()
  {
    return null;
  }
  
  public String getCommunityUrl()
  {
    return null;
  }

  public boolean isPublished()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public boolean isEncrypt()
  {
    // TODO Auto-generated method stub
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

  public void setMimeType(String mimeType)
  {
    // TODO Auto-generated method stub

  }

  public String getDocumentId()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getCategory()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getLibraryId()
  {
    return null;
  }

  public String getLibraryType()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getLibraryGenerator()
  {
    return null;
  }
  
  public boolean isExternal()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public String getTitleWithExtension()
  {
    // TODO Auto-generated method stub
    return null;
  }
  
  /**
   * ECM/CCM interfaces
   */  
  public boolean getIsPublishable()
  {
    // TODO Auto-generated method stub
    return true;
  }
  
  public String getFncsServer()
  {
    return null;
  }
  
  public String getPrivateWorkCopyId()
  {
    return null;
  }
 
  public JSONObject getGlobalApproval()
  {
    return null;
  }
  
  public JSONArray getApprovers()
  {
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
   
  public String getContentHash()
  {
    return String.valueOf(getMediaSize());
  }
  
  public IDocumentEntry getRepoDocEntry()
  {
    return null;
  }
  
  public static String trimExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = title;
    }
    else
    {
      result = title.substring(0, index);
    }

    return result;
  }

  public static String extractExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = "";
    }
    else
    {
      result = title.substring(index + 1);
    }

    return result;
  }

  @Override
  public String getRepositoryType()
  {
    return this.getRepository();
  }

}
