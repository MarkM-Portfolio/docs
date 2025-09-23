/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.external.repository.rest;

import java.util.Calendar;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.util.MimeTypeUtil;
import com.ibm.json.java.JSONObject;

public class RestDocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  public static final String ID = "id";
  
  public static final String NAME = "name";
  
  public static final String EMAIL = "email";
  
  public static final String LOGIN = "login";
  
  public static final String ORG = "org";
  
  public static final String CREATED_BY = "created_by";
  
  public static final String MODIFIED_BY = "modified_by";
  
  public static final String OWNED_BY = "owned_by";
  
  public static final String CREATED_AT = "created_at";
  
  public static final String MODIFIED_AT = "modified_at";
  
  public static final String LABEL = "name";
  
  public static final String DESCRIPTION = "description";
  
  public static final String MIME = "mime";
  
  public static final String SIZE = "size";
  
  public static final String VERSION = "version";
  
  public static final String FILE_VERSION = "file_version";  
  
  private static final Logger LOG = Logger.getLogger(RestDocumentEntry.class.getName());
  
  private String repoId;
  
  private String repoType;

  private String docId;

  private String title;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String[] modifier;

  private String[] creator;

  private String versionLabel;
  
  private String repoHomeUrl;

  private Set<Permission> permissions;

  private long mediaSize = -1;

  public RestDocumentEntry(String repoId, String repoType, String repoHomeUrl, JSONObject jsonData)
  {
    this.repoId = repoId;
    this.repoType = repoType;
    this.repoHomeUrl = repoHomeUrl;
    init(jsonData);
  }
  
  private void init(JSONObject jsonData)
  {
    initCommonItems(jsonData);
    docId = (String)jsonData.get(ID);
    
    JSONObject creatorObj = (JSONObject)jsonData.get(CREATED_BY);
    if(creatorObj!=null)
    {
      String id = (String)creatorObj.get(ID);
      String name = (String)creatorObj.get(NAME);
      String email = (creatorObj.get(EMAIL) != null) ? (String)creatorObj.get(EMAIL) : (String)creatorObj.get(LOGIN);
      String org = (String)creatorObj.get(ORG);
      creator = new String[] {id, name, email, org};      
    }
    else
    {
      LOG.log(Level.WARNING, "No creator returned for the document meta!");
    }
    
    mime = (String)jsonData.get(MIME);    
    String label = (String)jsonData.get(LABEL);
    
    if(mime == null)
    {
      LOG.log(Level.WARNING, "No mime returned for the document meta!");
      if(label != null && label.length() > 0)
      {
        mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(label.toLowerCase());
        if(mime == null)
        {
          LOG.log(Level.WARNING, "Did not get the mime from label!");
        }
      }
    }    
    
    if(label != null && label.length() > 0)
    {
      ext = extractExt(label);
      title = trimExt(label);
    }
    else
    {
      LOG.log(Level.WARNING, "No label returned for the document meta!");
      ext = (String)jsonData.get("type");
      if (mime == null)
        mime = DocumentTypeUtils.getMimeType(ext);
    }
    
    description = (String)jsonData.get(DESCRIPTION);
    
    JSONObject permissionObj = (JSONObject) jsonData.get("permissions");
    if (permissionObj != null)
    {
//      if ("true".equalsIgnoreCase((String)permissionObj.get("write")))
//      {
//        permissions = Permission.PUBLISH_SET;
//      }
//      else
        if ("true".equalsIgnoreCase((String)permissionObj.get("read")))
      {
        permissions = Permission.VIEW_SET;
      }
      else
      {
        permissions = Permission.EMPTY_SET;
      }
    }
    else
    {
//      permissions = Permission.PUBLISH_SET;
      permissions = Permission.VIEW_SET;
    }
  }
  
  /**
   * modified, modifier, versionLabel, mediaSize -- common used for getDocument and updateDocument
   * @param jsonData
   */
  private void initCommonItems(JSONObject jsonData)
  {
    String calendarStr = (String)jsonData.get(MODIFIED_AT);
    if(calendarStr != null)
    {
      try
      {
        modified = javax.xml.bind.DatatypeConverter.parseDateTime(calendarStr);
      }
      catch(IllegalArgumentException e)
      {
        LOG.log(Level.WARNING, "Error parse calendar: " + calendarStr);
        modified = Calendar.getInstance();
      }
    }    
    else
    {
      modified = Calendar.getInstance();
    }
        
    JSONObject modifierObj = (JSONObject)jsonData.get(MODIFIED_BY);
    if(modifierObj!=null)
    {
      String id = (String)modifierObj.get(ID);
      String name = (String)modifierObj.get(NAME);
      String email = (modifierObj.get(EMAIL) != null) ? (String)modifierObj.get(EMAIL) : (String)modifierObj.get(LOGIN);
      modifier = new String[] {id, name, email};      
    }
    else
    {
      LOG.log(Level.WARNING, "No modifier returned for the document meta!");
    }    
    
    versionLabel = (String)jsonData.get(VERSION);
    if(versionLabel == null)
    {
      versionLabel = "unknown";
      JSONObject file_version = (JSONObject)jsonData.get(FILE_VERSION);
      if( file_version != null )
      {
        String file_version_id = (String)file_version.get(ID);  
        if( file_version_id != null )
        {
          versionLabel = file_version_id;          
        }
      }      
    }
    
    updateMediaSize(jsonData);  
  }

  private void updateMediaSize(JSONObject jsonData)
  {
    try
    {
      Object obj = jsonData.get(SIZE);
      if(obj instanceof Integer)
      {
        mediaSize = (Integer)obj;
      }
      else if(obj instanceof Long)
      {
        mediaSize = (Long)obj;
      }
      else if(obj instanceof String)
      {
        mediaSize = Integer.getInteger((String)obj);
      }
      else
      {
        LOG.log(Level.WARNING, "Error to get mediaSize: " + obj.toString());
      }
    }
    catch(Exception e)
    {
      LOG.log(Level.WARNING, "Error to parser the media size: " + e);
      mediaSize = 100;
    }  
  }
  
  public void update(JSONObject jsonData)
  {
    initCommonItems(jsonData);
  }  
  
  public void updateVersion(JSONObject jsonData)
  {
    versionLabel = (String)jsonData.get(ID);
    updateMediaSize(jsonData);
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
    return title;
  }

  public String getTitleWithExtension()
  {
    if (title == null)
      title = "";
    if (ext == null)
      ext = "";
    return title + "." + ext;
  }

  public String getRepository()
  {
    return repoId;
  }
  
  public String getRepositoryType()
  {
    return this.repoType;
  }

  public String getExtension()
  {
    return ext;
  }

  public String getDescription()
  {
    return description;
  }
  
  public String getFileDetailsURL()
  {
    return repoHomeUrl;
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
    return versionLabel;
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
    return true;
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
