/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.local;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalFSRepository implements IRepositoryAdapter
{
  private static final Logger LOG = Logger.getLogger(LocalFSRepository.class.getName());

  private static final String METAFILE_EXT = ".js";

  private static final String KEY_TITLE = "title";

  private static final String KEY_MIMETYPE = "mimetype";

  private static final String KEY_ACL = "acl";

  private static final String KEY_OWNER = "owner";

  private static final String KEY_VERSION = "version";

  private File directory;

  private String id;

  private JSONObject config;

  public LocalFSRepository()
  {
  }

  public void init(JSONObject config)
  {
    this.config = config;
    if (config.get("folder") == null)
    {
      throw new IllegalStateException("<folder> setting is missing from [Concord Storage] repository adapter config.");
    }

    if (config.get("id") == null)
    {
      throw new IllegalStateException("<id> setting is missing from [Concord Storage] repository adapter config.");
    }

    String folder = (String) config.get("folder");
    directory = new File(folder);
    id = (String) config.get("id");
  }

  public boolean impersonationAllowed()
  {
    return true;
  }

  public void addACE(UserBean requester, IDocumentEntry docEntry, ACE anACE) throws RepositoryAccessException
  {
    String docUri = decodeDocURI(docEntry.getDocUri());

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

      JSONObject aceJson = anACE.toJSON();
      aceJson.put(ACE.PRINCIPAL, anACE.getPrincipal());
      boolean found = false;
      for (int i = 0; i < aclJson.size(); i++)
      {
        JSONObject a = (JSONObject) aclJson.get(i);
        String principal = (String) a.get(ACE.PRINCIPAL);
        if (principal.equalsIgnoreCase(anACE.getPrincipal()))
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
    catch (Throwable e)
    {
      e.printStackTrace();
    }
  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is)
      throws RepositoryAccessException
  {
    return createDocument(requester, docLabel, docLabel, docLabel, is, true, true, null);
  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is,
      Boolean isExternal, Boolean propagate, MediaOptions options) throws RepositoryAccessException
  {
    {
      int count = 1;
      String adjustLabel = docLabel;
      while (new File(directory, adjustLabel).exists())
      {
        adjustLabel = trimExt(docLabel) + count + '.' + extractExt(docLabel);
        count++;
      }
      if (adjustLabel != null)
      {
        docLabel = adjustLabel;
      }
    }

    try
    {
      File file = new File(directory, docLabel);
      writeFile(file, is);
      File metaFile = new File(directory, docLabel + METAFILE_EXT);
      writeMetaFile(metaFile, file.getName(), MimeTypeUtil.MIME_TYPE_MAP.getContentType(file.getName()), requester.getId());

      final String documentLabel = docLabel;
      IDocumentEntry anEntry = new AbstractDocumentEntry()
      {
        public String getDocUri()
        {
          return documentLabel;
        }

        public boolean isPublished()
        {
          return true;
        }
      };
      addACE(requester, anEntry, new ACE(requester.getId(), Permission.EDIT_SET));

      return getDocument(requester, docLabel);
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(e);
    }
  }

  public IDocumentEntry setIBMdocsType(UserBean requester, IDocumentEntry docEntry, boolean createVersion) throws RepositoryAccessException
  {
    if (docEntry == null)
    {
      throw new IllegalArgumentException("The input parameter 'docEntry' is not valid.");
    }
    return docEntry;
  }

  public void deleteDocument(UserBean requester, String docLabel) throws RepositoryAccessException
  {
    if (!new File(directory, docLabel).delete())
    {
      throw new RepositoryAccessException("Delete file failed." + new File(directory, docLabel).getPath());
    }

    if (!new File(directory, docLabel + METAFILE_EXT).delete())
    {
      throw new RepositoryAccessException("Delete meta file failed." + new File(directory, docLabel + METAFILE_EXT).getPath());
    }
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return getContentStream(requester, docEntry, true);
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException
  {
    String docUri = decodeDocURI(docEntry.getDocUri());

    File file = new File(directory, docUri);
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(file);
      return fis;
    }
    catch (FileNotFoundException e)
    {
      throw new RepositoryAccessException(e);
    }
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
      mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(title.toLowerCase());

      String owner = (String) metaJson.get(KEY_OWNER);
      if (owner == null)
      {
        owner = requester.getId();
      }
      String version = metaJson.get(KEY_VERSION) == null ? "1" : metaJson.get(KEY_VERSION).toString();

      String[] creator = new String[4];
      creator[0] = requester.getId();
      creator[1] = null;
      creator[2] = null;
      creator[3] = null;

      Set<Permission> permissions = null;
      if (requester == null || requester.getEmail().equals(owner))
      {
        permissions = Permission.EDIT_SET;
      }
      else
      {
        List<ACE> acl = getAllACE(requester, new DocumentEntry(id, docUri, null, null, null, null, null, null, null, null, null, 0));
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

      entry = new DocumentEntry(id, docUri, name, ext, mimeType, "", version, lastModified, creator, creator, permissions, new File(
          directory, docUri).length());
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

  public IDocumentEntry getDocument(String docUri) throws RepositoryAccessException
  {
    // TODO: no super user support for local file system.
    return null;
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary, String docLabel)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary);
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary);
  }

  // NOTE: versionSummary is not supported in this implementation.
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary)
      throws RepositoryAccessException
  {
    String docUri = decodeDocURI(docEntry.getDocUri());

    OutputStream os = null;
    try
    {
      File file = new File(directory, docUri);
      os = new BufferedOutputStream(new FileOutputStream(file));
      byte[] bytes = new byte[4096];
      int readLength = 0;
      while ((readLength = is.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLength);
      }

      // update version
      File metaFile = new File(directory, docUri + METAFILE_EXT);
      FileInputStream metaIn = new FileInputStream(metaFile);
      JSONObject metaJson = JSONObject.parse(metaIn);
      String version = metaJson.get(KEY_VERSION) == null ? "1" : metaJson.get(KEY_VERSION).toString();
      int iVersion = Integer.parseInt(version);
      metaJson.put(KEY_VERSION, String.valueOf(iVersion + 1));
      metaIn.close();

      OutputStream metaOut = new FileOutputStream(metaFile);
      metaJson.serialize(metaOut);
      metaOut.close();

      return getDocument(requester, docUri);
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
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          throw new RepositoryAccessException(e);
        }
      }
    }
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle());
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    // TODO: Local file system will always overwrite currently.
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle());
  }

  public String getFolderUri(UserBean caller, String communityUuid)
  {
    return communityUuid;
  }

  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException
  {
    if (docEntry == null)
    {
      throw new IllegalArgumentException("The input parameter 'docEntry' is not valid.");
    }
    String docUri = docEntry.getDocUri();
    IDocumentEntry oldDoc = getDocument(requester, docUri);

    try
    {
      writeMetaFile(new File(directory, docUri + METAFILE_EXT), newLabel, MimeTypeUtil.MIME_TYPE_MAP.getContentType(newLabel),
          oldDoc.getCreator()[2]);
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(e);
    }
    return getDocument(requester, docUri);
  }

  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException
  {
    IDocumentEntry currentEntry = getDocument(requester, docUri);
    int maxVersion = Integer.parseInt(currentEntry.getVersion());
    IDocumentEntry newEntry = new DocumentEntry(currentEntry.getRepository(), currentEntry.getDocUri(), currentEntry.getTitle(),
        currentEntry.getExtension(), currentEntry.getMimeType(), currentEntry.getDescription(), String.valueOf(maxVersion + 1),
        currentEntry.getModified(), currentEntry.getModifier(), currentEntry.getCreator(), currentEntry.getPermission(),
        currentEntry.getMediaSize());
    // update version
    File metaFile = new File(directory, docUri + METAFILE_EXT);
    FileInputStream metaIn;
    try
    {
      metaIn = new FileInputStream(metaFile);
      JSONObject metaJson = JSONObject.parse(metaIn);
      metaJson.put(KEY_VERSION, String.valueOf(maxVersion + 1));
      metaIn.close();

      OutputStream metaOut = new FileOutputStream(metaFile);
      metaJson.serialize(metaOut);
      metaOut.close();
    }
    catch (FileNotFoundException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    return newEntry;
  }

  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    IDocumentEntry currentEntry = getDocument(requester, docEntry.getDocUri());
    String currentVersion = currentEntry.getVersion();
    int maxVersion = currentVersion == null ? 1 : Integer.parseInt(currentVersion);
    IDocumentEntry[] entries = new IDocumentEntry[maxVersion];
    for (int i = 1; i <= maxVersion; i++)
    {
      entries[maxVersion - i] = new DocumentEntry(currentEntry.getRepository(), currentEntry.getDocUri(), currentEntry.getTitle(),
          currentEntry.getExtension(), currentEntry.getMimeType(), currentEntry.getDescription(), String.valueOf(i),
          currentEntry.getModified(), currentEntry.getModifier(), currentEntry.getCreator(), currentEntry.getPermission(),
          currentEntry.getMediaSize());
    }
    return entries;
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

  public Iterator<IDocumentEntry> getSeedList(String timestamp, int pageSize, ActionEnum actionEnum)
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

  private static class FileComparator implements Comparator<File>
  {
    // desc sort
    public int compare(File f1, File f2)
    {
      long f1_time = f1.lastModified(), f2_time = f2.lastModified();
      return f1_time > f2_time ? -1 : (f1_time == f2_time ? 0 : 1);
    }

  }

  private static class LocalDocsFileFilter implements FileFilter
  {
    private List<String> extensionAllowList;

    private Pattern pattern;

    public LocalDocsFileFilter()
    {
      init();
    }

    void init()
    {
      if (extensionAllowList == null)
      {
        extensionAllowList = new ArrayList<String>();
        extensionAllowList.add("odt");
        extensionAllowList.add("ods");
        extensionAllowList.add("odp");
      }
      pattern = Pattern.compile("\\.([a-z]*)$", Pattern.CASE_INSENSITIVE);
    }

    public String getExtension(String fileName)
    {
      Matcher matcher = pattern.matcher(fileName);
      if (matcher.find())
      {
        String extension = matcher.group(1);
        return extension;
      }
      return "";
    }

    public boolean accept(File file)
    {
      if (FileUtil.nfs_isDirectory(file, 0))
      {
        return false;
      }
      String extension = getExtension(file.getName());
      if (extensionAllowList.contains(extension))
      {
        return true;
      }
      return false;
    }

  }

  public IDocumentEntry[] getOwnedDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    List<IDocumentEntry> result = new ArrayList<IDocumentEntry>();
    try
    {
      if (directory == null || !directory.exists() && !FileUtil.nfs_isDirectory(directory, 0))
        throw new FileNotFoundException();
      LocalDocsFileFilter fileFilter = new LocalDocsFileFilter();
      File[] files = directory.listFiles(fileFilter);
      Arrays.sort(files, new FileComparator());
      File file = null;
      int startIndex = (pageNumber - 1) * pageSize;
      for (int i = startIndex; (i < files.length && i < startIndex + pageSize); i++)
      {
        file = files[i];
        String fileName = file.getName();
        String extension = fileFilter.getExtension(fileName);
        File metaFile = new File(directory, file.getName() + METAFILE_EXT);
        InputStream metaIn = new FileInputStream(metaFile);
        JSONObject metaJson = JSONObject.parse(metaIn);
        metaIn.close();
        String version = metaJson.get(KEY_VERSION) == null ? "1" : metaJson.get(KEY_VERSION).toString();
        IDocumentEntry docEntry = new DocumentEntry(id, fileName, fileName, extension, extension, "", version, Calendar.getInstance(),
            new String[] { "test" }, new String[] { "test" }, null, 0);
        result.add(docEntry);
      }
      if (files.length <= startIndex + pageSize)
      {
        result.add(null);
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "Local repository file directory is not found!");
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return result.toArray(new IDocumentEntry[] {});
  }

  public IDocumentEntry[] getPermissiveDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    List<IDocumentEntry> result = new ArrayList<IDocumentEntry>();
    result.add(null);
    return result.toArray(new IDocumentEntry[] {});
  }

  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    throw new UnsupportedOperationException();
  }

  public HashMap<String, String> getBidiPreferences(UserBean caller) throws RepositoryAccessException
  {
    HashMap<String, String> map = new HashMap<String, String>();
    return map;
  }

  public IDocumentEntry lockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // no lock support
    return docEntry;
  }

  public IDocumentEntry unlockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // no unlock support
    return docEntry;
  }

  public JSONObject getConfig()
  {
    return config;
  }

  @Override
  public String getRepoType()
  {    
    return RepositoryConstants.REPO_TYPE_LOCAL;
  }

  @Override
  public void processLeaveData(UserBean user, String repoId, String docId, JSONObject data)
  {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void notifyServerEvent(JSONObject msg)
  {
    // TODO Auto-generated method stub

  }

}
