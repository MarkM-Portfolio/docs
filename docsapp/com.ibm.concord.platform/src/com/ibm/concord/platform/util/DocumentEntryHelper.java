/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import java.util.Calendar;
import java.util.Set;

import org.apache.abdera.model.AtomDate;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.cache.DistributedMap;

public class DocumentEntryHelper
{
  private static final Logger LOG = Logger.getLogger(DocumentEntryHelper.class.getName());
  
  public static JSONObject toJSON(final IDocumentEntry docEntry)
  {
    JSONObject json = new JSONObject();
    json.put(IDocumentEntry.TITLE, docEntry.getTitle());
    json.put(IDocumentEntry.MIMETYPE, docEntry.getMimeType());
    json.put(IDocumentEntry.OWNER, docEntry.getCreator()[0]);
    json.put(IDocumentEntry.DOC_URI, docEntry.getDocUri());
    json.put(IDocumentEntry.EXT, docEntry.getExtension());
    json.put(IDocumentEntry.REPO_ID, docEntry.getRepository());
    json.put(IDocumentEntry.MODIFIED, AtomDate.valueOf(docEntry.getModified()).getValue());
    json.put(IDocumentEntry.SHARABLE, docEntry.getIsSharable());
    json.put(IDocumentEntry.ISCOMMUNITYFILE, docEntry.getLibraryType());
    json.put(IDocumentEntry.COMMUNITY_ID,docEntry.getCommunityId());
    
    json.put(IDocumentEntry.READ_ONLY, !Permission.EDIT.hasPermission(docEntry.getPermission()));
    json.put(IDocumentEntry.IS_EXTERNAL, docEntry.isExternal());
    json.put(IDocumentEntry.PUBLISHABLE, docEntry.getIsPublishable());
    json.put(IDocumentEntry.IS_LOCKED, docEntry.isLocked());
    json.put(IDocumentEntry.LOCK_OWNER, getLockOwnerJsonFromArray(docEntry.getLockOwner()));
    
    // ECM/CCM properties
    json.put(IDocumentEntry.FNCS_SERVER, docEntry.getFncsServer());
    json.put(IDocumentEntry.PWC_ID, docEntry.getPrivateWorkCopyId());
    json.put(IDocumentEntry.APPROVAL_PROPERTIES, docEntry.getGlobalApproval());
    json.put(IDocumentEntry.APPROVERS, docEntry.getApprovers());
    
    if (URLConfig.getResponseID() != null && !"".equals(URLConfig.getResponseID()))
    {
      json.put(HttpSettingsUtil.RESPONSE_ID, URLConfig.getResponseID());
    }
    
    return json;
  }
  
  public static JSONObject getLockOwnerJsonFromArray(String[] lockOwner)
  {
    JSONObject obj = new JSONObject();
    if(lockOwner != null)      
    {
      if(lockOwner[0] != null)
        obj.put("id", lockOwner[0]);
      if(lockOwner[1] != null)
        obj.put("email", lockOwner[1]);
      if(lockOwner[2] != null)
        obj.put("name", lockOwner[1]);
    }   
    return obj;
  }

  public static IDocumentEntry fromJSON(final JSONObject entryObj)
  {
    return new AbstractDocumentEntry()
    {
      public String[] getCreator()
      {
        String[] result = new String[3];
        result[0] = (String) entryObj.get(IDocumentEntry.OWNER);
        return result;
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

      public String getRepository()
      {
        return (String) entryObj.get(IDocumentEntry.REPO_ID);
      }

      public String getTitle()
      {
        return (String) entryObj.get(IDocumentEntry.TITLE);
      }

      public boolean getIsSharable()
      {
        Object object = entryObj.get(IDocumentEntry.SHARABLE);
        return ((object instanceof Boolean) ? ((Boolean) object).booleanValue() : true);
      }
      
      public boolean isExternal()
      {
        Object object = entryObj.get(IDocumentEntry.IS_EXTERNAL);
        return ((object instanceof Boolean) ? ((Boolean) object).booleanValue() : false);
      }

      public boolean isPublished()
      {
        return true;
      }
      
      public boolean getIsPublishable()
      {
        Object object = entryObj.get(IDocumentEntry.PUBLISHABLE);
        return ((object instanceof Boolean) ? ((Boolean) object).booleanValue() : false);
      }
      
      public String getFncsServer()
      {
        return (String) entryObj.get(IDocumentEntry.FNCS_SERVER);
      }

      public String getPrivateWorkCopyId()
      {
        return (String) entryObj.get(IDocumentEntry.PWC_ID);
      }
      
      public JSONObject getGlobalApproval()
      {
        return (JSONObject) entryObj.get(IDocumentEntry.APPROVAL_PROPERTIES);
      }
      
      public JSONArray getApprovers()
      {
        return (JSONArray) entryObj.get(IDocumentEntry.APPROVERS);
      }      
      
      public Set<Permission> getPermission()
      {
        Object object = entryObj.get(IDocumentEntry.READ_ONLY);
        boolean readOnly = ((object instanceof Boolean) ? ((Boolean) object).booleanValue() : true);
        return readOnly ? Permission.VIEW_SET : Permission.EDIT_SET;
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
  
  /**
   * Get the document entry from the dynamic cache.
   * 
   * @param caller
   * @param docEntry
   */
  public static IDocumentEntry getCachedEntry(String callerId, String uri)
  {
    IDocumentEntry docEntry = null;
    try
    {
      if (callerId != null && uri != null)
      {
        DistributedMap cachedMap = Platform.getDocEntryCacheMap();
        if (cachedMap != null)
        {
          StringBuffer entryKey = new StringBuffer();
          entryKey.append(callerId);
          entryKey.append("@");
          entryKey.append(uri);
          Object object = cachedMap.get(entryKey.toString());
          if (object instanceof IDocumentEntry)
          {
            docEntry = (IDocumentEntry) object;
          }
        }
      }
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed to get document entry from dynamic cache ", e);
    }
    return docEntry;
  }  
  
  /**
   * Put the document entry into the dynamic cache.
   * 
   * @param caller
   * @param docEntry
   */
  public static void putEntryToCache(UserBean caller, IDocumentEntry docEntry)
  {
    try
    {
      if (caller != null && docEntry != null)
      {
        DistributedMap cachedMap = Platform.getDocEntryCacheMap();
        if (cachedMap != null)
        {
          StringBuffer entryKey = new StringBuffer();
          entryKey.append(caller.getId());
          entryKey.append("@");
          entryKey.append(docEntry.getDocUri());
          cachedMap.put(entryKey.toString(), docEntry);
        }
      }
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed to put document entry into dynamic cache ", e);
    }
  }

  public static void clearEntryCache(UserBean caller, String docUri)
  {
    try
    {
      if (caller != null && docUri != null)
      {
        DistributedMap cachedMap = Platform.getDocEntryCacheMap();
        if (cachedMap != null)
        {
          StringBuffer entryKey = new StringBuffer();
          entryKey.append(caller.getId());
          entryKey.append("@");
          entryKey.append(docUri);
          cachedMap.remove(entryKey.toString());
        }
      }
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed to clear document entry in dynamic cache ", e);
    }
  }  
}
