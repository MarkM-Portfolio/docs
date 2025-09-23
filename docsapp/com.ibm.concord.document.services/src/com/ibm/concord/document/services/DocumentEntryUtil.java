/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.document.services;

import java.util.Calendar;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentEntryUtil
{
  private static final Logger LOG = Logger.getLogger(DocumentEntryUtil.class.getName());

  private static IRepositoryAdapter getRepositoryAdapter(String repoId)
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryProviderRegistry.class);
    return service.getRepository(repoId);
  }
  
  public static String getRepoTypeFromId(String repoId)
  {            
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    if( repoAdapter != null )
    {
      return repoAdapter.getRepoType();
    }          
    return null;      
  }  

  private static JSONObject getDraftMetaData(DraftDescriptor draftDesc) throws DraftStorageAccessException, DraftDataAccessException
  {
    JSONObject draftMetadata = null;
    if (DraftStorageManager.getDraftStorageManager().isDraftExisted(draftDesc))
    {
      if (draftDesc.getDraftMetaSnapshot() != null)
      {
        draftMetadata = draftDesc.clearDraftMetaSnapshot();
      }
      else
      {
        draftMetadata = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
      }
    }
    return draftMetadata;
  }

  /**
   * Get entry, overwrite the TITLE, MIME and EXT from draft
   * 
   * @param caller
   * @param repoId
   * @param uri
   * @return
   * @throws RepositoryAccessException
   */
  private static IDocumentEntry getCombiedDocEntry(UserBean caller, String repoId, String uri) throws RepositoryAccessException,
      DraftStorageAccessException, DraftDataAccessException
  {
    IDocumentEntry docEntry = DocumentEntryUtil.getEntry(caller, repoId, uri);

    DraftDescriptor draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(
        ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller), docEntry.getRepository(), docEntry.getDocUri());

    JSONObject draftMetadata = getDraftMetaData(draftDesc);
    if (draftMetadata != null && !draftMetadata.isEmpty())
    {
      if(draftMetadata.get("meta_damaged") != null)
      {
        boolean metaDamaged = ((Boolean)draftMetadata.get("meta_damaged")).booleanValue();
        if(metaDamaged)
        {
          updateMeta(draftDesc, docEntry, caller);
          return docEntry;
        }
      }
      DraftDocumentEntry draftDocEntry = new DraftDocumentEntry(docEntry, draftMetadata);
      // Put the document entry into dynamic cache.
      DocumentEntryHelper.putEntryToCache(caller, draftDocEntry);
      return draftDocEntry;
    }
    else
    {
      DocumentEntryHelper.clearEntryCache(caller, docEntry.getDocUri());
    }

    return docEntry;
  }

  private static void updateMeta(DraftDescriptor draftDesc, IDocumentEntry docEntry, UserBean caller) throws DraftDataAccessException
  {
    JSONObject draftMeta = new JSONObject();
    String date = AtomDate.valueOf(Calendar.getInstance()).getValue();
    draftMeta.put(DraftMetaEnum.CUSTOMER_ID.getMetaKey(), ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller));
    draftMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), docEntry.getDocUri());
    draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(docEntry.getModified()).getValue());
    draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), docEntry.getVersion());
    draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey(), docEntry.getContentHash());
    draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), docEntry.getMimeType());
    draftMeta.put(DraftMetaEnum.EXT.getMetaKey(), docEntry.getExtension());
    draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey(), date);
    draftMeta.put(DraftMetaEnum.REPOSITORY_ID.getMetaKey(), docEntry.getRepository());
    draftMeta.put(DraftMetaEnum.TITLE.getMetaKey(), docEntry.getTitle());
    draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey(), caller.getId());
    draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), true);
    draftMeta.put(DraftMetaEnum.DRAFT_CREATED.getMetaKey(), date);
    draftMeta.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), date);
    DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDesc, draftMeta);
  }

  /**
   * Get entry from the repository
   * 
   * @param caller
   * @param repoId
   * @param uri
   * @return
   * @throws RepositoryAccessException
   */
  public static IDocumentEntry getEntry(UserBean caller, String repoId, String uri) throws RepositoryAccessException
  {
    IRepositoryAdapter adapter = getRepositoryAdapter(repoId);
    IDocumentEntry docEntry = adapter.getDocument(caller, uri);

    // Clear the document entry in dynamic cache when ever retrieved from repository.
    DocumentEntryHelper.clearEntryCache(caller, docEntry.getDocUri());

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
   *          directly. the cache docEntry depends on draft active status, should always be called when draft is accessible
   * @return
   * @throws RepositoryAccessException
   */
  public static IDocumentEntry getEntry(UserBean caller, String repoId, String uri, boolean bCache) throws RepositoryAccessException,
      DraftStorageAccessException, DraftDataAccessException
  {
    IDocumentEntry docEntry = null;
    if (bCache)
    { // cached the combined docEntry: repository + draft
      synchronized (caller)
      {
        // Get the document entry from dynamic cache at first.
        String callerId = (caller != null)? caller.getId() : null;
        docEntry = DocumentEntryHelper.getCachedEntry(callerId, uri);

        // If can't find the document entry from dynamic cache, fetch the document entry by repository adapter and draft meta.
        if (docEntry == null)
        {
          docEntry = getCombiedDocEntry(caller, repoId, uri);
        }
      }
    }
    else
    { // get the docEntry from repo
      docEntry = getCombiedDocEntry(caller, repoId, uri); // set the cache any way no matter get docEntry from cache or not
    }

    return docEntry;
  }

  public static IDocumentEntry setIBMdocsType(UserBean caller, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    IDocumentEntry newEntry = repoAdapter.setIBMdocsType(caller, docEntry, false);
    // Put the document entry into dynamic cache.
    DocumentEntryHelper.putEntryToCache(caller, newEntry);
    return newEntry;
  }

  public static boolean share(UserBean caller, IDocumentEntry docEntry, ACE ace) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    repoAdapter.addACE(caller, docEntry, ace);

    return true;
  }

  public static void lock(UserBean caller, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    IRepositoryAdapter adapter = getRepositoryAdapter(docEntry.getRepository());
    adapter.lockDocument(caller, docEntry);
    // Clear the document entry in dynamic cache when ever retrieved from repository.
    DocumentEntryHelper.clearEntryCache(caller, docEntry.getDocUri());
  }

  public static void unlock(UserBean caller, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    IRepositoryAdapter adapter = getRepositoryAdapter(docEntry.getRepository());
    adapter.unlockDocument(caller, docEntry);
    // Clear the document entry in dynamic cache when ever retrieved from repository.
    DocumentEntryHelper.clearEntryCache(caller, docEntry.getDocUri());
  }

  // create document entry from repository and draft
  public static class DraftDocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
  {

    private final IDocumentEntry repDocEntry;

    private String title;

    private String ext;

    private String mime;

    protected DraftDocumentEntry(IDocumentEntry docEntry, JSONObject draftMetadata)
    {
      repDocEntry = docEntry;
      String repoV = docEntry.getVersion();
      String draftBaseV = (String) draftMetadata.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey());
      
      title = docEntry.getTitle();
      if(draftBaseV != null && !draftBaseV.equalsIgnoreCase(repoV))
      {
        title = (String) draftMetadata.get(DraftMetaEnum.TITLE.getMetaKey());
      }
      
      String draftExt = (String) draftMetadata.get(DraftMetaEnum.EXT.getMetaKey());
      ext = draftExt != null ? draftExt : docEntry.getExtension();
      
      String draftMime = (String) draftMetadata.get(DraftMetaEnum.MIME.getMetaKey());
      mime = draftMime != null ? draftMime : (String) draftMetadata.get(DraftMetaEnum.MIME.getMetaKey());
    }
    
    public IDocumentEntry getRepoDocEntry()
    {
      return repDocEntry;
    }

    public String getTitle()
    {
      return title;
    }

    public String getExtension()
    {
      return ext;
    }

    public String getMimeType()
    {
      return mime;
    }

    public void setMimeType(String mimeType)
    {
      mime = mimeType;
    }

    public String getLibraryType()
    {
      return repDocEntry.getLibraryType();
    }

    public String getDocId()
    {
      return repDocEntry.getDocId();
    }

    public String getDocUri()
    {
      return repDocEntry.getDocUri();
    }

    public String getRepository()
    {
      return repDocEntry.getRepository();
    }
    
    public String getRepositoryType()
    {
      return repDocEntry.getRepositoryType();
    }    

    public String getDescription()
    {
      return repDocEntry.getDescription();
    }

    public Calendar getModified()
    {
      return repDocEntry.getModified();
    }

    public String[] getModifier()
    {
      return repDocEntry.getModifier();
    }

    public String[] getCreator()
    {
      return repDocEntry.getCreator();
    }

    public Set<Permission> getPermission()
    {
      return repDocEntry.getPermission();
    }

    public long getMediaSize()
    {
      return repDocEntry.getMediaSize();
    }

    public String getVersion()
    {
      return repDocEntry.getVersion();
    }

    public boolean getIsSharable()
    {
      return repDocEntry.getIsSharable();
    }

    public boolean isExternal()
    {
      return repDocEntry.isExternal();
    }

    public boolean isPublished()
    {
      return repDocEntry.isPublished();
    }

    public boolean isEncrypt()
    {
      return repDocEntry.isEncrypt();
    }

    public boolean isLocked()
    {
      return repDocEntry.isLocked();
    }

    public String[] getLockOwner()
    {
      return repDocEntry.getLockOwner();
    }

    public String getFileDetailsURL()
    {
      return repDocEntry.getFileDetailsURL();
    }
    
    public String getFilesListURL()
    {
      return repDocEntry.getFilesListURL();
    }
    
    public String getLibraryId()
    {
      return repDocEntry.getLibraryId();
    }
    
    public String getLibraryGenerator()
    {
      return repDocEntry.getLibraryGenerator();
    }    
    
    public String getCommunityId()
    {
      return repDocEntry.getCommunityId();
    }
    
    public String getCommunityType()
    {
      return repDocEntry.getCommunityType();
    }
    
    public String getCommunityUrl()
    {
      return repDocEntry.getCommunityUrl();
    }    
    
    public String getTitleWithExtension()
    {
      if (title == null)
        title = "";
      if (ext == null)
        ext = "";
      return title + "." + ext;
    }
    
    /**
     * ECM/CCM interfaces
     */
    public boolean getIsPublishable()
    {
      return repDocEntry.getIsPublishable();
    }
    
    public String getFncsServer()
    {
      return repDocEntry.getFncsServer();
    }
    
    public String getPrivateWorkCopyId()
    {
      return repDocEntry.getPrivateWorkCopyId();
    }
   
    public JSONObject getGlobalApproval()
    {
      return repDocEntry.getGlobalApproval();
    }
    
    public JSONArray getApprovers()
    {
      return repDocEntry.getApprovers();
    } 
    
    public String getVersionSeriesId()
    {
      return repDocEntry.getVersionSeriesId();
    }
    
    public String getVersionSeriesUri()
    {
      return repDocEntry.getVersionSeriesUri();
    }
        
    public String getContentHash()
    {
      return repDocEntry.getContentHash();
    }     
  }
}
