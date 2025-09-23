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

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.concord.viewer.spi.util.MimeTypeUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalFSRepository implements IRepositoryAdapter
{
  // private static final Logger LOG = Logger.getLogger(LocalFSRepository.class.getName());

  private static final String METAFILE_EXT = ".js";

  private static final String KEY_TITLE = "title";

  private static final String KEY_MIMETYPE = "mimetype";

  private static final String KEY_ACL = "acl";

  private static final String KEY_OWNER = "owner";

  private File directory;

  private String id;

  private String filePath;

  private String cacheHome;

  private String sharedDataName;

  private Logger logger = Logger.getLogger(LocalFSRepository.class.getName());

  public LocalFSRepository()
  {
    ;
  }

  public void init(JSONObject config)
  {
    if (config.get("folder") == null)
    {
      throw new IllegalStateException("<folder> setting is missing from [Concord Storage] repository adapter config.");
    }

    if (config.get("id") == null)
    {
      throw new IllegalStateException("<id> setting is missing from [Concord Storage] repository adapter config.");
    }

    String folder = (String) config.get("folder");
    id = (String) config.get("id");

    directory = new File(folder);

    CacheType type = CacheType.NFS;
    try
    {
      type = CacheType.valueOf(((String) config.get(ConfigConstants.CACHE_TYPE)).toUpperCase());
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Cache_type is not configured or the value is not accepted. The default value of nfs is used.");
    }
    cacheHome = ViewerConfig.getInstance().getDataRoot(type);
    sharedDataName = ViewerConfig.getInstance().getSharedDataName(type);

    // Get upload path
    filePath = (String) config.get("files_path");
  }

  public boolean impersonationAllowed()
  {
    return true;
  }

  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {
    docUri = decodeDocURI(docUri);

    try
    {
      File metaFile = new File(directory, docUri + METAFILE_EXT);
      FileInputStream metaIn = new FileInputStream(metaFile);
      JSONObject metaJson = JSONObject.parse(metaIn);
      metaIn.close();
      JSONArray aclJson = (JSONArray) metaJson.get(KEY_ACL);
      if (aclJson == null)
      {
        aclJson = new JSONArray();
      }

      // tricky: in localtest repository, we use email as ace principal, but the caller gives a user id
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID).getService(
          "viewer.storage");
      UserBean user = directoryAdapter.getById(requester, anACE.getPrincipal());
      String email = user.getEmail();

      JSONObject aceJson = anACE.toJSON();
      aceJson.put(ACE.PRINCIPAL, email);
      boolean found = false;
      for (int i = 0; i < aclJson.size(); i++)
      {
        JSONObject a = (JSONObject) aclJson.get(i);
        String principal = (String) a.get(ACE.PRINCIPAL);
        if (principal.equalsIgnoreCase(email))
        {
          a.put(ACE.PERMISSION, aceJson.get(ACE.PERMISSION));
          found = true;
          break;
        }
      }
      if (!found)
      {
        aclJson.add(aceJson);
      }
      metaJson.put(KEY_ACL, aclJson);

      FileOutputStream metaOut = new FileOutputStream(metaFile);
      metaJson.serialize(metaOut);
      metaOut.close();
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();
    File file = new File(directory, docUri);
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(file);
      return fis;
    }
    catch (FileNotFoundException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
    }
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    return getDocument(requester, docUri);
  }

  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    docUri = decodeDocURI(docUri);

    if (!new File(directory, docUri).exists() || !new File(directory, docUri + METAFILE_EXT).exists())
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, "", "File Not Exist.");
    }

    DocumentEntry entry = null;
    FileInputStream metaIn = null;
    try
    {
      File metaFile = new File(directory, docUri + METAFILE_EXT);
      metaIn = new FileInputStream(metaFile);
      JSONObject metaJson = JSONObject.parse(metaIn);
      String title = (String) metaJson.get(KEY_TITLE);
      int index = title.lastIndexOf('.');
      String name = title;
      String ext = "";
      if (index >= 0)
      {
        name = title.substring(0, index);
        ext = title.substring(index + 1);
      }
      String mimeType = (String) metaJson.get(KEY_MIMETYPE);
      mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(title);
      String[] creator = new String[4];
      String owner = (String) metaJson.get(KEY_OWNER);
      if (owner == null)
      {
        owner = requester.getId();
      }

      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID).getService(
          "viewer.storage");
      UserBean user = directoryAdapter.getById(requester, owner);

      creator[0] = user.getId();
      creator[1] = user.getDisplayName();
      creator[2] = user.getEmail();
      creator[3] = null;

      Set<Permission> permissions = null;
      if (requester.getId().equals(owner))
      {
        permissions = Permission.EDIT_SET;
      }
      else
      {
        List<ACE> acl = getAllACE(requester, new DocumentEntry(id, docUri, null, null, null, null, null, null, null, null, 0, true));
        Iterator<ACE> iter = acl.iterator();
        while (iter.hasNext())
        {
          ACE anACE = iter.next();
          if (anACE.getPrincipal().equals(requester.getId()))
          {
            permissions = anACE.getPermissions();
            break;
          }
        }
      }

      if (permissions == null)
      {
        throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION, "",
            "You do not have permission to get this document.");
      }

      Calendar lastModified = Calendar.getInstance();
      lastModified.setTimeInMillis(new File(directory, docUri).lastModified());

      entry = new DocumentEntry(id, docUri, name, ext, mimeType, "", lastModified, creator, creator, permissions, new File(directory,
          docUri).length(), true);
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    finally
    {
      if (metaIn != null)
      {
        try
        {
          metaIn.close();
        }
        catch (IOException e)
        {
          throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
        }
      }
    }

    return entry;
  }

  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    return new IDocumentEntry[] { getDocument(requester, docUri) };
  }

  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();
    docUri = decodeDocURI(docUri);

    Vector<ACE> acl = new Vector<ACE>();
    FileInputStream metaIn = null;
    try
    {
      File metaFile = new File(directory, docUri + METAFILE_EXT);
      metaIn = new FileInputStream(metaFile);
      JSONObject metaJson = JSONObject.parse(metaIn);
      JSONArray aclJson = (JSONArray) metaJson.get(KEY_ACL);
      if (aclJson != null)
      {
        for (int i = 0; i < aclJson.size(); i++)
        {
          JSONObject aceJson = (JSONObject) aclJson.get(i);
          acl.add(ACE.fromJSON(aceJson));
        }
      }
    }
    catch (FileNotFoundException e)
    {
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(e);
    }
    finally
    {
      if (metaIn != null)
      {
        try
        {
          metaIn.close();
        }
        catch (IOException e)
        {
          throw new RepositoryAccessException(e);
        }
      }
    }
    return acl;
  }

  private void writeMetaFile(File metaFile, String title, String mimeType, String owner) throws IOException
  {
    FileOutputStream metaOut = null;
    FileInputStream metaIn = null;
    try
    {
      JSONObject metaJson = null;
      if (metaFile.exists())
      {
        metaIn = new FileInputStream(metaFile);
        metaJson = JSONObject.parse(metaIn);
      }
      else
      {
        metaJson = new JSONObject();
      }
      metaJson.put(KEY_TITLE, title);
      metaJson.put(KEY_MIMETYPE, mimeType);
      if (owner != null)
      {
        metaJson.put(KEY_OWNER, owner);
      }
      metaOut = new FileOutputStream(metaFile);
      metaJson.serialize(metaOut);
    }
    finally
    {
      if (metaOut != null)
      {
        metaOut.close();
      }

      if (metaIn != null)
      {
        metaIn.close();
      }
    }
  }

  private void writeFile(File file, InputStream contentStream) throws IOException
  {
    FileOutputStream out = null;
    try
    {
      out = new FileOutputStream(file);
      int numRead = -1;
      byte[] data = new byte[8192];
      while ((numRead = contentStream.read(data)) > 0)
      {
        out.write(data, 0, numRead);
      }
    }
    finally
    {
      if (out != null)
      {
        out.close();
      }

      if (contentStream != null)
      {
        contentStream.close();
      }
    }
  }

  private String decodeDocURI(String docUri) throws RepositoryAccessException
  {
    try
    {
      return URLDecoder.decode(docUri, "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      throw new RepositoryAccessException(e);
    }
  }

  private String trimExt(String title)
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

  private String extractExt(String title)
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

  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum)
  {
    return new Iterator<IDocumentEntry>()
    {
      public boolean hasNext()
      {
        return false;
      }

      public IDocumentEntry next()
      {
        throw new NoSuchElementException();
      }

      public void remove()
      {
        throw new UnsupportedOperationException();
      }
    };
  }

  public String getFilesPath()
  {
    return filePath;
  }

  @Override
  public JSONObject getRepositoryConfig()
  {
    throw new UnsupportedOperationException();
  }

  public boolean isCacheEncrypt()
  {
    return false;
  }

  @Override
  public String getCacheHome()
  {
    return cacheHome;
  }

  @Override
  public String getSharedDataName()
  {
    return sharedDataName;
  }

  @Override
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    throw new UnsupportedOperationException("Local repository doesn't support log event.");
  }
  @Override
  public void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException
      
  {
    throw new UnsupportedOperationException("repository doesn't support setThumbnail.");      
  }
  
  public String getRepositoryType()
  {
    return RepositoryServiceUtil.LOCALTEST_FILES_REPO_ID;
  }      
}
