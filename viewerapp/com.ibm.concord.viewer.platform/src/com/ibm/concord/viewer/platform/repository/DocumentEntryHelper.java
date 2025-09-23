/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.repository;

import java.util.Calendar;
import java.util.Set;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.json.java.JSONObject;

public class DocumentEntryHelper
{
  public static JSONObject toJSON(final IDocumentEntry docEntry)
  {
    JSONObject json = new JSONObject();
    json.put(IDocumentEntry.TITLE, docEntry.getTitle());
    json.put(IDocumentEntry.MIMETYPE, docEntry.getMimeType());
    json.put(IDocumentEntry.OWNER, docEntry.getCreator()[0]);
    json.put(IDocumentEntry.DOC_URI, docEntry.getDocUri());
    json.put(IDocumentEntry.EXT, docEntry.getExtension());
    json.put(IDocumentEntry.REPO_ID, docEntry.getRepository());
    json.put(IDocumentEntry.REPO_TYPE, docEntry.getRepositoryType());
    json.put(IDocumentEntry.MODIFIED, AtomDate.valueOf(docEntry.getModified()).getValue());
    json.put(IDocumentEntry.SHARABLE, docEntry.getIsSharable());
    json.put(IDocumentEntry.COMMUNITY_ID, docEntry.getCommunityId());
    return json;
  }

  public static IDocumentEntry fromJSON(final JSONObject entryObj)
  {
    return new IDocumentEntry()
    {
      public String[] getCreator()
      {
        String[] result = new String[3];
        result[0] = (String) entryObj.get(IDocumentEntry.OWNER);
        return result;
      }

      public String getDescription()
      {
        return null;
      }

      public String getDocId()
      {
        return null;
      }

      public String getDocUri()
      {
        return (String) entryObj.get(IDocumentEntry.DOC_URI);
      }

      public String getExtension()
      {
        return (String) entryObj.get(IDocumentEntry.EXT);
      }

      public long getMediaSize()
      {
        return -1;
      }

      public String getMimeType()
      {
        return (String) entryObj.get(IDocumentEntry.MIMETYPE);
      }

      public Calendar getModified()
      {
        String atomDate = (String) entryObj.get(IDocumentEntry.MODIFIED);
        return AtomDate.valueOf(atomDate).getCalendar();
      }

      public String[] getModifier()
      {
        return null;
      }

      public Set<Permission> getPermission()
      {
        return null;
      }

      public String getRepository()
      {
        return (String) entryObj.get(IDocumentEntry.REPO_ID);
      }

      public String getRepositoryType()
      {
        return (String) entryObj.get(IDocumentEntry.REPO_TYPE);
      }

      public String getTitle()
      {
        return (String) entryObj.get(IDocumentEntry.TITLE);
      }

      public String getVersion()
      {
        return null;
      }

      public boolean getIsSharable()
      {
        Object object = entryObj.get(IDocumentEntry.SHARABLE);
        return ((object instanceof Boolean) ? ((Boolean) object).booleanValue() : true);
      }

      public void setMimeType(String mimeType)
      {
      }

      public boolean isEncrypt()
      {
        // TODO Auto-generated method stub
        return false;
      }

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

      @Override
      public String getCommunityId()
      {
        return (String) entryObj.get(IDocumentEntry.COMMUNITY_ID);
      }

      @Override
      public boolean getPwdProtected()
      {
        // TODO Auto-generated method stub
        return false;
      }

      @Override
      public void setPwdProtected(boolean isPwdProtected)
      {
        // TODO Auto-generated method stub

      }
    };
  }

  public static IDocumentEntry getDocumentEntry(final IDocumentEntry docEntry, final String modified)
  {
    if (modified == null || modified.equals(String.valueOf(docEntry.getModified().getTimeInMillis())))
    {
      return docEntry;
    }
    return new IDocumentEntry()
    {
      public String[] getCreator()
      {
        return docEntry.getCreator();
      }

      public String getDescription()
      {
        return docEntry.getDescription();
      }

      public String getDocId()
      {
        return docEntry.getDocId();
      }

      public String getDocUri()
      {
        return docEntry.getDocUri();
      }

      public String getExtension()
      {
        return docEntry.getExtension();
      }

      public long getMediaSize()
      {
        return docEntry.getMediaSize();
      }

      public String getMimeType()
      {
        return docEntry.getMimeType();
      }

      public Calendar getModified()
      {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(Long.valueOf(modified));
        return c;
        // return docEntry.getModified();
      }

      public String[] getModifier()
      {
        return docEntry.getModifier();
      }

      public Set<Permission> getPermission()
      {
        return docEntry.getPermission();
      }

      public String getRepository()
      {
        return docEntry.getRepository();
      }

      public String getRepositoryType()
      {
        return docEntry.getRepositoryType();
      }

      public String getTitle()
      {
        return docEntry.getTitle();
      }

      public String getVersion()
      {
        return docEntry.getVersion();
      }

      public boolean getIsSharable()
      {
        return docEntry.getIsSharable();
      }

      public void setMimeType(String mimeType)
      {

      }

      public boolean isEncrypt()
      {
        return docEntry.isEncrypt();
      }

      public boolean isIBMDocs()
      {
        return docEntry.isIBMDocs();
      }

      @Override
      public boolean hasViewPermission()
      {
        return docEntry.hasViewPermission();
      }

      @Override
      public String getFileDetailsURL()
      {
        return null;
      }

      @Override
      public String getCommunityId()
      {
        return docEntry.getCommunityId();
      }

      @Override
      public boolean getPwdProtected()
      {
        return false;
      }

      @Override
      public void setPwdProtected(boolean isPwdProtected)
      {
        // TODO Auto-generated method stub
      }
    };
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
}
