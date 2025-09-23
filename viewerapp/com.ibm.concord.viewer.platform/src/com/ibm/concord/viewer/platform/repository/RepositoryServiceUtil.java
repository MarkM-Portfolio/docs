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

import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.websphere.cache.DistributedMap;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class RepositoryServiceUtil
{
  private static final Logger LOG = Logger.getLogger(RepositoryServiceUtil.class.getName());

  public static final String CONNECTIONS_FILES_REPO_ID = "lcfiles";

  public static final String LOCALTEST_FILES_REPO_ID = "viewer.storage";

  public static final String ECM_FILES_REPO_ID = "ecm";

  public static final String TEMP_STORAGE_REPO_ID = "tempstorage";

  public static final String MAIL_REPO_ID = "mail";
  
  public final static String EXTERNAL_CMIS_REPO_TYPE = "external.cmis";
  
  public final static String EXTERNAL_REST_REPO_TYPE = "external.rest";
  
  public static final String VSFILES_REPO_ID = "vsfiles";
  
  public static final String TOSCANA_REPO_ID = "toscana";
  
  public static final String SANITY_REPO_ID = "sanity";

  public static IRepositoryAdapter getRepositoryAdapter(String repoId)
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        repoId);
    return service.getRepository(repoId);
  }
  
  public static String getRepoTypeFromId(String repoId)
  {            
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    if( repoAdapter != null )
    {
      return repoAdapter.getRepositoryType();
    }          
    return null;      
  }  
  

  public static boolean isCCMRepoDoc(String cacheId)
  {
    if (cacheId.contains("@"))
    {
      return true;
    }
    return false;
  }

  public static boolean isCCMThumbnailsDirectory(String dir)
  {
    if (dir.equals(ICacheDescriptor.CACHE_DIR_CCMPREVIEW))
    {
      return true;
    }
    return false;
  }


  public static boolean isFilesThumbnailsTempDirectory(String dir)
  {
    if (dir.equals(ICacheDescriptor.CACHE_DIR_TEMPPREVIEW))
    {
      return true;
    }
    return false;
  }

  
  public static String getRepositoryFilesPath(String repositoryId)
  {
    IRepositoryAdapter adaptor = getRepositoryAdapter(repositoryId);
    if (adaptor != null)
    {
      return adaptor.getFilesPath();
    }
    return null;
  }

  public static MediaDescriptor download(UserBean caller, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    InputStream contentStream = repoAdapter.getContentStream(caller, docEntry);
    return new MediaDescriptor(docEntry.getTitle() + '.' + docEntry.getExtension(), docEntry.getMimeType(), contentStream);
  }

  public static boolean share(UserBean caller, IDocumentEntry docEntry, ACE ace) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    repoAdapter.addACE(caller, docEntry.getDocUri(), ace);

    return true;
  }

  /**
   * Get the document entry from the dynamic cache.
   * 
   * @param caller
   * @param docEntry
   */
  private static IDocumentEntry getCachedEntry(UserBean caller, String uri, String modified)
  {
    IDocumentEntry docEntry = null;
    try
    {
      if (caller != null && uri != null)
      {       
        /*if (modified == null)
        {
          Calendar ca = Calendar.getInstance();
          ca.setTimeInMillis(0);
          modified=String.valueOf(ca.getTimeInMillis());
        } */
        DistributedMap cachedMap = Platform.getDocEntryCacheMap();
        if (cachedMap != null)
        {
          StringBuffer entryKey = new StringBuffer();
          entryKey.append(caller.getId());
          entryKey.append("@");
          entryKey.append(getId(uri));
          //entryKey.append("@");
          //entryKey.append(modified);
          Object object = cachedMap.get(entryKey.toString());
          if (object instanceof IDocumentEntry)
          {
            docEntry = (IDocumentEntry) object;
            LOG.log(Level.FINEST, "DocEntry is found from cache: " + entryKey.toString() + " " + docEntry.getDocUri());
          }
          else
          {
            LOG.log(Level.FINEST, "DocEntry is not found from cache: " + entryKey.toString());
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to get document entry from dynamic cache ", e);
    }
    return docEntry;
  }

  public static String getId(String docUri)
  {
    String id = docUri;
    int index = docUri.lastIndexOf(IDocumentEntry.DOC_URI_SEP);
    if (index != -1)
    {
      id = id.substring(index + 1);
    }
    return id;
  }

  /**
   * Put the document entry into the dynamic cache.
   * 
   * @param caller
   * @param docEntry
   */
  public static void putEntryToCache(UserBean caller, IDocumentEntry docEntry, String docUri)
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
          entryKey.append(getId(docUri));
          //entryKey.append("@");
          //entryKey.append(String.valueOf(docEntry.getModified().getTimeInMillis()));
          cachedMap.put(entryKey.toString(), docEntry);
          LOG.log(Level.FINEST, "DocEntry is put into Cache: " + entryKey.toString() + " " + docEntry.getDocUri());
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to put document entry into dynamic cache ", e);
    }
  }

  public static IDocumentEntry getEntry(UserBean caller, String repoId, String uri) throws RepositoryAccessException
  {
    return getEntry(caller, repoId, uri, null);
  }

  public static IDocumentEntry getEntry(UserBean caller, String repoId, String uri, String mime) throws RepositoryAccessException
  {
    IRepositoryAdapter adapter = getRepositoryAdapter(repoId);
    IDocumentEntry docEntry = adapter.getDocument(caller, uri, mime);

    // Put the document entry into dynamic cache.
    putEntryToCache(caller, docEntry, uri);

    return docEntry;
  }

  /**
   * Get document entry from repository adapter or WAS dynamic cache.
   * 
   * @param caller
   * @param repoId
   * @param uri
   * @param version
   * @param mime
   * @param bCache
   *          is true, fetch the document entry from cache at first; bCache is false, fetch the document entry from repository adapter
   *          directly.
   * @return
   * @throws RepositoryAccessException
   */
  public static IDocumentEntry getEntry(UserBean caller, String repoId, String uri, String version, String mime, boolean bCache)
      throws RepositoryAccessException
  {
    IDocumentEntry docEntry = null;
    if (bCache)
    {
      synchronized (caller)
      {
        // Get the document entry from dynamic cache at first.
        docEntry = getCachedEntry(caller, uri, version);

        // If can't find the document entry from dynamic cache, fetch the document entry by repository adapter.
        if (docEntry == null)
        {
          docEntry = getEntry(caller, repoId, uri, mime);
        }
      }
    }

    if (docEntry == null)
    {
      docEntry = getEntry(caller, repoId, uri, mime);
    }

    return docEntry;

  }

  /**
   * Get document entry from repository adapter or WAS dynamic cache.
   * 
   * @param caller
   * @param repoId
   * @param uri
   * @param bCache
   *          is true, fetch the document entry from cache at first; bCache is false, fetch the document entry from repository adapter
   *          directly.
   * @return
   * @throws RepositoryAccessException
   */
  public static IDocumentEntry getEntry(UserBean caller, String repoId, String uri, String version, boolean bCache)
      throws RepositoryAccessException
  {

    return getEntry(caller, repoId, uri, version, null, bCache);
  }

  public static boolean supportedRepository(String repoId)
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    return (repoAdapter != null);
  }

  public static boolean needEncryption(String repID)
  {
    LOG.entering(RepositoryServiceUtil.class.getName(), "needEncryption", repID);

    IRepositoryAdapter repAdapter = RepositoryServiceUtil.getRepositoryAdapter(repID);
    boolean res = repAdapter.isCacheEncrypt();

    LOG.exiting(RepositoryServiceUtil.class.getName(), "needEncryption", res);

    return res;
  } 

}
