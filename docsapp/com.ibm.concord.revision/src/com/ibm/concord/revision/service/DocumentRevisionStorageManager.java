/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.service;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.IRevisionStorageAdapter;
import com.ibm.concord.platform.revision.IRevisionStorageAdapterFactory;
import com.ibm.concord.platform.revision.RevisionDescriptor;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.revision.exception.RevisionStorageException;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.concord.spi.util.IStorageAdapter;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentRevisionStorageManager
{
  private static final Logger LOGGER = Logger.getLogger(DocumentRevisionStorageManager.class.getName());

  private String customer;

  private String docUri;

  private String repoId;

  private IRevisionStorageAdapterFactory storageAdapterFactory;

  private String[] hash;

  private IRevisionStorageAdapter rootDir;

  private IRevisionStorageAdapter latestDir;

  // private IRevisionStorageAdapter latestMetaFile;

  private static final String REVISION_INNER_FOLDER = "revision";

  private static final String REVISION_CACHE_FOLDER = "cache";

  private static final String REVISION_LATEST_FOLDER = "latest";

  private static final String REVISION_BASE_FOLDER = "base";

  private static final String REVISION_MEDIA_FOLDER = "media";

  private static final String REVISION_DELTA_FOLDER = "delta";

  private static final String REVISION_MSG_FILE = "msg.json";

  private static final String REVISION_MODIFIER_FILE = "modifiers.json";

  private static final String REVISION_TEMP_FOLDER = "temp";

  private static final String REVISION_CACHE_LAST_VISIT = "lastVisit.txt";

  public static final int PRIMARY_MAX_SLOT = 1024;

  public static final int SECONDARY_MAX_SLOT = 1024;

  public DocumentRevisionStorageManager(IDocumentEntry docEntry, UserBean user)
  {
    this(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user), docEntry.getRepository(), docEntry.getDocUri());
  }

  public DocumentRevisionStorageManager(String customer, String repoId, String docUri)
  {
    this(customer, repoId, docUri, null);
  }

  public DocumentRevisionStorageManager(String customer, String repoId, String docUri, IRevisionService revisionService)
  {
    this.customer = customer;
    this.repoId = repoId;
    this.docUri = docUri;
    if (revisionService == null)
    {
      RevisionComponent revisionComp = (RevisionComponent) Platform.getComponent(RevisionComponent.COMPONENT_ID);
      revisionService = (IRevisionService) revisionComp.getService(IRevisionService.class);
    }

    this.storageAdapterFactory = revisionService.getRevisionStorageAdapterFactory();

    hash = hash(docUri);
    IRevisionStorageAdapter customerHome = storageAdapterFactory.newRevisionAdapter(revisionService.getRevisionHome(), customer);
    IRevisionStorageAdapter revisionInnerHome = storageAdapterFactory.newRevisionAdapter(customerHome, REVISION_INNER_FOLDER);
    IRevisionStorageAdapter primaryHashHome = storageAdapterFactory.newRevisionAdapter(revisionInnerHome, hash[0]);
    IRevisionStorageAdapter secondaryHashHome = storageAdapterFactory.newRevisionAdapter(primaryHashHome, hash[1]);
    rootDir = storageAdapterFactory.newRevisionAdapter(secondaryHashHome, docUri);
    latestDir = storageAdapterFactory.newRevisionAdapter(rootDir, REVISION_LATEST_FOLDER);
  }

  public IRevisionStorageAdapter getRevisionRoot()
  {
    return rootDir;
  }

  public IRevisionStorageAdapter getRevisionCacheDir()
  {
    IRevisionStorageAdapter documentDir = this.getRevisionRoot();
    IRevisionStorageAdapter cacheDir = storageAdapterFactory.newRevisionAdapter(documentDir, REVISION_CACHE_FOLDER);

    return cacheDir;
  }

  public IRevisionStorageAdapter getRevisionLatestDir()
  {
    return latestDir;
  }

  public IRevisionStorageAdapter getRevisionTempDir()
  {
    IRevisionStorageAdapter documentDir = this.getRevisionRoot();
    IRevisionStorageAdapter latestDir = storageAdapterFactory.newRevisionAdapter(documentDir, REVISION_TEMP_FOLDER);

    return latestDir;

  }

  public IRevisionStorageAdapter getInternalFile(String childURI)
  {
    return storageAdapterFactory.newRevisionAdapter(rootDir, childURI);
  }

  public IRevisionStorageAdapter getFile(IRevisionStorageAdapter parent, String child)
  {
    return storageAdapterFactory.newRevisionAdapter(parent, child);
  }

  public IRevisionStorageAdapter getFile(String path)
  {
    return storageAdapterFactory.newRevisionAdapter(path);
  }

  public RevisionDescriptor getRevisionDescriptor(int majorNo, int minorNo)
  {
    IRevisionStorageAdapter documentDir = this.getRevisionRoot();
    IRevisionStorageAdapter majorDir = storageAdapterFactory.newRevisionAdapter(documentDir, majorNo + "");
    IRevisionStorageAdapter revisionDir = null;
    if (minorNo > 0)
      revisionDir = storageAdapterFactory.newRevisionAdapter(majorDir, minorNo + "");
    else
      revisionDir = majorDir;

    IRevisionStorageAdapter cache = getRevisionCacheDir();
    IRevisionStorageAdapter revisionInCache = getFile(cache, majorNo + "");
    revisionInCache = getFile(revisionInCache, minorNo + "");

    return new RevisionDescriptor(customer, repoId, docUri, revisionDir.getPath(), revisionInCache.getPath(), hash, majorNo, minorNo);
  }

  public boolean createRevisionFolder(RevisionDescriptor rd)
  {
    IRevisionStorageAdapter dir = storageAdapterFactory.newRevisionAdapter(rd.getInternalURI());
    LOGGER.log(Level.FINE, "Create revision folder {0}.", new Object[] { dir.getPath() });
    if (!dir.exists())
      return dir.mkdirs();
    else
      return true;
  }

  public boolean createLatestFolder() throws RevisionStorageException
  {
    if (hasLatestDelta())
      throw new RevisionStorageException("Latest folder has already been created");
    IRevisionStorageAdapter latestDeltaDirAdapter = getFile(latestDir, REVISION_DELTA_FOLDER);
    LOGGER.log(Level.FINE, "Create delta folder in latest folder {0}.", new Object[] { latestDeltaDirAdapter.getPath() });
    if (!latestDeltaDirAdapter.exists() && !latestDeltaDirAdapter.mkdirs())
      return false;
    IRevisionStorageAdapter deltaMsgFile = getFile(latestDeltaDirAdapter, REVISION_MSG_FILE);
    LOGGER.log(Level.FINE, "Create msg file in latest folder {0}.", new Object[] { deltaMsgFile.getPath() });
    try
    {
      deltaMsgFile.createNewFile();
    }
    catch (IOException e1)
    {
      throw new RevisionStorageException(e1);
    }
    return true;
  }

  String copyDraftToRevisionFolder(final String draftURI, final RevisionDescriptor rd) throws RevisionStorageException
  {
    IRevisionStorageAdapter targetFolder = storageAdapterFactory.newRevisionAdapter(rd.getMediaURI());
    if (!targetFolder.exists())
      targetFolder.mkdirs();

    String target = null;
    LOGGER.log(Level.INFO, "Copy draft to content folder: source {0}, target {1}", new Object[] { draftURI, targetFolder.getPath() });
    // target = DraftStorageManager.getDraftStorageManager().getDraftMedia(dd, targetFolder.getPath());
    if (FileUtil.nfs_copyDirToDir(new File(draftURI), new File(targetFolder.getPath()), FileUtil.NFS_RETRY_SECONDS))
    {
      target = targetFolder.getPath();
      LOGGER.log(Level.FINE, "Copy draft to content folder successfully: source {0}, target {1}",
          new Object[] { draftURI, targetFolder.getPath() });
    }
    else
    {
      LOGGER.log(Level.WARNING, "Failed to copy draft to content folder" + targetFolder.getPath());
      throw new RevisionStorageException("Failed to copy draft to content folder" + targetFolder.getPath());
    }

    return target;
  }

  String moveLatestToRevisionFolder(final RevisionDescriptor rd) throws RevisionStorageException
  {
    if (rd.getMinorRevisionNo() <= 0)
    {
      throw new RevisionStorageException("The content in latest folder can only be moved to minor revision");
    }

    IRevisionStorageAdapter revisionFolder = storageAdapterFactory.newRevisionAdapter(rd.getInternalURI());
    // remove modifier file
    IRevisionStorageAdapter modifierFile = getFile(latestDir, REVISION_MODIFIER_FILE);
    if (modifierFile.exists())
      modifierFile.delete();
    if (!latestDir.rename(revisionFolder))
    {
      LOGGER.log(Level.WARNING, "Failed to copy latest delta to revision folder, source {0}, target {1}",
          new Object[] { latestDir.getPath(), revisionFolder.getPath() });
      throw new RevisionStorageException("Failed to copy latest delta to revision folder");
    }
    LOGGER.log(Level.FINE, "Copy latest delta to revision folder successfully, source {0}, target {1}", new Object[] { latestDir.getPath(),
        revisionFolder.getPath() });
    return revisionFolder.getPath();
  }

  public void copySection(IStorageAdapter sectionFile, String relativePath) throws RevisionStorageException
  {
    IRevisionStorageAdapter latestDeltaDirAdapter = getFile(latestDir, REVISION_DELTA_FOLDER);
    IStorageAdapter targetFile = getFile(latestDeltaDirAdapter, relativePath);
    LOGGER.log(Level.FINE, "Copy section {0} to {1}", new Object[] { sectionFile.getPath(), targetFile.getPath() });
    if (sectionFile.isFile())
    {
      if (!targetFile.exists() || targetFile.isFile())
      {
        try
        {
          if (!targetFile.exists())
          {
            targetFile.getParent().mkdirs();
            targetFile.createNewFile();
          }

          copy(new AutoCloseInputStream(sectionFile.getInputStream()), targetFile);
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Copy Draft Section File Error. {0} {1} {2}",
              new Object[] { sectionFile.getPath(), targetFile.getPath(), e });
          throw new RevisionStorageException(e);
        }
      }
    }
    else
    // folder
    {
      if (!FileUtil.nfs_copyDirToDir(new File(sectionFile.getPath()), new File(targetFile.getPath()), FileUtil.NFS_RETRY_SECONDS))
      {
        LOGGER.log(Level.WARNING, "Copy Draft Section File Error. {0} {1} {2}",
            new Object[] { sectionFile.getPath(), targetFile.getPath() });
        throw new RevisionStorageException("Copy Draft Section File Error.");
      }
    }
  }

  public void appendDeltaMessages(final JSONArray msgs) throws RevisionStorageException
  {
    if (!hasLatestDelta())
      createLatestFolder();
    IRevisionStorageAdapter latestDeltaDir = getFile(latestDir, REVISION_DELTA_FOLDER);
    IRevisionStorageAdapter msgFile = getFile(latestDeltaDir, REVISION_MSG_FILE);
    OutputStream os = null;
    try
    {
      os = msgFile.getOutputStream4Append();
      int count = msgs.size();
      StringBuffer buffer = new StringBuffer();
      for (int index = 0; index < count; index++)
      {
        buffer.append(msgs.get(index).toString());
        buffer.append("\r\n");
        if (buffer.length() > 8196)
        {
          os.write(buffer.toString().getBytes("UTF-8"));
          os.flush();
          buffer = new StringBuffer();
        }
      }
      if (buffer.length() > 0)
      {
        os.write(buffer.toString().getBytes("UTF-8"));
        os.flush();
      }

    }
    catch (IOException e)
    {
      throw new RevisionStorageException(e);
    }
    finally
    {
      try
      {
        if (os != null)
          os.close();
      }
      catch (IOException e)
      {
        LOGGER.warning("Failed to close " + msgFile.getPath());
      }
    }
  }

  public void addModifier(final String userId) throws RevisionStorageException
  {
    IRevisionStorageAdapter modifierFile = getFile(latestDir, REVISION_MODIFIER_FILE);
    if (!modifierFile.exists())
    {
      try
      {
        if (!latestDir.exists())
          createLatestFolder();
        modifierFile.createNewFile();
      }
      catch (IOException e)
      {
        throw new RevisionStorageException(e);
      }
    }

    OutputStream os = null;
    try
    {
      os = modifierFile.getOutputStream4Append();
      StringBuffer buffer = new StringBuffer();
      buffer.append(userId);
      buffer.append("\r\n");
      os.write(buffer.toString().getBytes("UTF-8"));
      os.flush();
    }
    catch (IOException e)
    {
      throw new RevisionStorageException(e);
    }
    finally
    {
      try
      {
        if (os != null)
          os.close();
      }
      catch (IOException e)
      {
        LOGGER.warning("Failed to close " + modifierFile.getPath());
      }
    }
  }

  public List<String> getModifiers() throws RevisionStorageException
  {
    IRevisionStorageAdapter modifierFile = getFile(latestDir, REVISION_MODIFIER_FILE);
    List<String> modifiers = new ArrayList<String>();
    if (!modifierFile.exists() || modifierFile.getSize() == 0)
      return modifiers;
    BufferedReader in = null;
    try
    {
      in = new BufferedReader(new InputStreamReader(new AutoCloseInputStream(modifierFile.getInputStream())));
      String line = null;
      while ((line = in.readLine()) != null)
      {
        if (line.length() > 0)
        {
          modifiers.add(line);
        }
      }
    }
    catch (IOException e)
    {
      throw new RevisionStorageException(e);
    }
    finally
    {
      try
      {
        in.close();
      }
      catch (IOException e)
      {
        LOGGER.warning("Failed to close " + modifierFile.getPath());
      }
    }
    return modifiers;
  }

  public void clearModifier() throws RevisionStorageException
  {
    IRevisionStorageAdapter modifierFile = getFile(latestDir, REVISION_MODIFIER_FILE);
    if (modifierFile.exists())
      modifierFile.delete();
    try
    {
      if (!latestDir.exists())
        createLatestFolder();
      modifierFile.createNewFile();
    }
    catch (IOException e)
    {
      throw new RevisionStorageException(e);
    }

  }

  private boolean inCache(int majorNo, int minorNo)
  {
    RevisionDescriptor rd = getRevisionDescriptor(majorNo, minorNo);

    return inCache(rd);
  }

  private boolean inCache(RevisionDescriptor rd)
  {
    IRevisionStorageAdapter revisionInCache = getFile(rd.getCacheURI());

    if (!revisionInCache.exists())
      return false;

    IRevisionStorageAdapter revisionMedia = getFile(revisionInCache, REVISION_MEDIA_FOLDER);
    if (revisionMedia.exists())
    {
      if (revisionMedia.isFile())
        return false;

      if (revisionMedia.listFiles().length > 0)
        return true;
    }

    return false;
  }

  private boolean hasMedia(int majorNo, int minorNo)
  {
    RevisionDescriptor rd = getRevisionDescriptor(majorNo, minorNo);
    IRevisionStorageAdapter revisionRoot = getFile(rd.getInternalURI());
    IRevisionStorageAdapter revisionMedia = null;
    if (minorNo != 0)
      revisionMedia = getFile(revisionRoot, REVISION_MEDIA_FOLDER);
    else
      revisionMedia = getFile(revisionRoot, REVISION_BASE_FOLDER);
    if (revisionMedia.exists())
    {
      if (revisionMedia.isFile())
        return false;

      if (revisionMedia.listFiles().length > 0)
        return true;
    }

    return false;
  }

  public String getContentMediaFolder(RevisionDescriptor rd)
  {
    if (rd.getMinorRevisionNo() == 0)
    {
      return rd.getMediaURI();
    }
    else
    {
      IStorageAdapter media = getFile(rd.getMediaURI());
      if (media.exists() && media.isFolder() && media.listFiles().length > 0)
        return media.getPath();

      IStorageAdapter cache = getFile(rd.getCacheURI());
      media = getFile((IRevisionStorageAdapter) cache, REVISION_MEDIA_FOLDER);
      if (media.exists() && media.isFolder() && media.listFiles().length > 0)
        return media.getPath();
    }
    return null;
  }

  public RevisionDescriptor[] getRevisionsInCacheFolder(int majorNo)
  {
    IRevisionStorageAdapter cacheRoot = getRevisionCacheDir();
    IRevisionStorageAdapter majorCache = getFile(cacheRoot, majorNo + "");
    if (!majorCache.exists() || majorCache.isFile())
      return null;
    IStorageAdapter[] caches = majorCache.listFiles();
    RevisionDescriptor[] rds = new RevisionDescriptor[caches.length];
    int i = 0;
    for (IStorageAdapter cache : caches)
    {
      String folderName = cache.getName();
      IStorageAdapter media = storageAdapterFactory.newRevisionAdapter(cache, REVISION_MEDIA_FOLDER);
      if (media.exists() && media.isFolder())
      {
        try
        {
          int minorNo = Integer.parseInt(folderName);
          rds[i] = getRevisionDescriptor(majorNo, minorNo);
        }
        catch (Exception e)
        {
          LOGGER.warning("getRevisionsInCacheFolder: failed to parse folder " + cache.getPath() + " to revision number.");
        }
        i++;
      }
    }
    return rds;
  }

  public JSONArray getMessages(RevisionDescriptor rd) throws RevisionStorageException
  {
    IRevisionStorageAdapter deltaMsgFile = getFile(rd.getDeltaMsgURI());
    JSONArray msgs = new JSONArray();
    BufferedReader in = null;
    try
    {
      in = new BufferedReader(new InputStreamReader(new AutoCloseInputStream(deltaMsgFile.getInputStream())));
      String line = null;
      while ((line = in.readLine()) != null)
      {
        msgs.add(JSONObject.parse(line));
      }
    }
    catch (IOException e)
    {
      throw new RevisionStorageException(e);
    }
    finally
    {
      try
      {
        in.close();
      }
      catch (IOException e)
      {
        LOGGER.warning("Failed to close " + deltaMsgFile.getPath());
      }
    }
    return msgs;
  }

  public List getAttachmentFolders(RevisionDescriptor rd)
  {
    IStorageAdapter deltaFolder = getFile(rd.getDeltaURI());
    if (!deltaFolder.exists())
      return null;
    IStorageAdapter[] files = deltaFolder.listFiles();
    List folders = new JSONArray();
    for (IStorageAdapter file : files)
    {
      if (file.isFolder() && !file.getName().equals(REVISION_DELTA_FOLDER) && !file.getName().equals(REVISION_TEMP_FOLDER))
        folders.add(file.getPath());
    }
    return folders;
  }

  public void updateLastAccess(int majorNo, int minorNo) throws RevisionStorageException
  {
    RevisionDescriptor rd = getRevisionDescriptor(majorNo, minorNo);
    if (inCache(rd))
    {
      IRevisionStorageAdapter cache = getFile(rd.getCacheURI());
      IRevisionStorageAdapter lastVisit = getFile(cache, REVISION_CACHE_LAST_VISIT);
      LOGGER.fine("UpdateLastAccess: update file " + lastVisit.getPath());
      if (!lastVisit.exists())
      {
        try
        {
          lastVisit.createNewFile();
        }
        catch (IOException e)
        {
          LOGGER.warning("Failed to create " + lastVisit.getPath());
          throw new RevisionStorageException(e);
        }
      }

      OutputStream os = null;
      try
      {
        os = lastVisit.getOutputStream();
        StringBuffer buffer = new StringBuffer();
        buffer.append(AtomDate.valueOf(Calendar.getInstance()).getValue());
        os.write(buffer.toString().getBytes("UTF-8"));
        os.flush();
      }
      catch (IOException e)
      {
        throw new RevisionStorageException(e);
      }
      finally
      {
        try
        {
          if (os != null)
            os.close();
        }
        catch (IOException e)
        {
          LOGGER.warning("Failed to close " + lastVisit.getPath());
        }
      }
    }

  }

  boolean hasLatestDelta()
  {
    IRevisionStorageAdapter latestDeltaDir = getFile(latestDir, REVISION_DELTA_FOLDER);
    IRevisionStorageAdapter deltaMsg = getFile(latestDeltaDir, REVISION_MSG_FILE);
    if (deltaMsg.exists() && deltaMsg.getSize() != 0)
      return true;
    else
      return false;

  }

  private String[] hash(String docUri)
  {
    String[] result = new String[2];
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(docUri.getBytes());
      BigInteger[] modAndRemainder = new BigInteger(rawMD5).abs().divideAndRemainder(BigInteger.valueOf(PRIMARY_MAX_SLOT));
      result[1] = modAndRemainder[0].abs().remainder(BigInteger.valueOf(SECONDARY_MAX_SLOT)).toString();
      result[0] = modAndRemainder[1].toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      LOGGER.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash draft descriptor directory failed.", e);
      throw new IllegalArgumentException(e);
    }
    //
    // LOGGER.log(Level.FINEST, "Primary Hash of DOC [" + docUri + "]: " + result[0]);
    // LOGGER.log(Level.FINEST, "Secondary Hash of DOC [" + docUri + "]: " + result[1]);

    return result;
  }

  protected void copy(InputStream sourceStream, IStorageAdapter destFile) throws IOException
  {
    OutputStream os = null;
    try
    {
      os = new BufferedOutputStream(destFile.getOutputStream());
      byte[] bytes = new byte[4096];
      int readLength = 0;
      while ((readLength = sourceStream.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLength);
      }
    }
    catch (IOException e)
    {
      throw e;
    }
    finally
    {
      if (os != null)
      {
        os.close();
      }
    }
  }

}
