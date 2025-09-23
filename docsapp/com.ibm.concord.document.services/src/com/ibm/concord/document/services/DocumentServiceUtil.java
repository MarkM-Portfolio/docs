/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentServiceUtil
{
  private static final Logger LOG = Logger.getLogger(DocumentServiceUtil.class.getName());

  private static final String ODP = "odp";

  private static final String PPT = "ppt";

  public static boolean isOrphanCommentsFileType(String extension)
  {
    if (ODP.equalsIgnoreCase(extension) || PPT.equalsIgnoreCase(extension) )
    {
      return true;
    }
    return false;
  }

  public static JSONArray loadComments(DraftDescriptor draftDescriptor) throws Exception
  {
    String uri = draftDescriptor.getURI();

    String path = uri + File.separator + "comments.js";
    File commentsfile = new File(path);

    if (!commentsfile.exists())
    {
      path = uri + File.separator + "Reserved" + File.separator + "comments.json";
      commentsfile = new File(path);
    }

    if (commentsfile.exists())
    {
      InputStream stream = null;
      try
      {
        stream = new FileInputStream(path);
        JSONArray commentsJson = JSONArray.parse(stream);
        return commentsJson;
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "can not load comments.", e);
      }
      finally
      {
        try
        {
          stream.close();
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "can not close stream for comments at {0}", path);
        }
      }
    }
    return null;
  }

  public static String getDocumentType(IDocumentEntry docEntry)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.getDocumentType(docEntry.getMimeType());
  }

  public static IDocumentService getDocumentService(String mimeType)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.getDocumentService(mimeType);
  }

  public static IDocumentService getDocumentServiceByType(String type)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.getDocumentServiceByType(type);
  }

  public static IDocumentEntry createDocument(UserBean caller, String type, String repoId, String folderUri, JSONObject data)
      throws Exception
  {
    IDocumentService docSrv = getDocumentServiceByType(type);
    if (docSrv == null)
    {
      throw new UnsupportedMimeTypeException("Unsupported document type");
    }

    if (repoId == null)
    {
      repoId = RepositoryServiceUtil.getDefaultRepositoryId();
    }
    IDocumentEntry docEntry = docSrv.createDocument(caller, repoId, folderUri, data);

    IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
        IJournalAdapter.class);
    JournalHelper.Actor a = new JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId());
    // JournalHelper.Entity e = new JournalHelper.Entity("type", "nane", "id", "custeoIsd");
    JournalHelper.Entity jnl_obj = null;
    if (docEntry == null)
    {
      jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, "", "", caller.getCustomerId());
    }
    else
    {
      jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, docEntry.getTitleWithExtension(), docEntry.getDocId(),
          caller.getCustomerId());
    }
    journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_EDITOR, a, JournalHelper.Action.CREATE, jnl_obj,
        (docEntry == null) ? JournalHelper.Outcome.FAILURE : JournalHelper.Outcome.SUCCESS).build());

    LOG.log(Level.INFO, new ActionLogEntry(caller, Action.CREATEDOC, docEntry.getDocUri(), "mimeType: " + docEntry.getMimeType()
        + ", fileSize: " + docEntry.getMediaSize() + "bytes").toString());

    return docEntry;
  }

  public static boolean supportedDocumentService(String type)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.supportedDocumentService(type);
  }

  public static boolean supportedDocumentMimeType(String mimeType)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.supportedDocumentMimeType(mimeType);

  }

  public static Map<String, String> getDocumentServiceVersions()
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.getDocumentServiceVersions();
  }

  public static DraftDescriptor getDraftDescriptor(UserBean caller, IDocumentEntry docEntry)
  {
    DraftStorageManager draftStoreMgr = DraftStorageManager.getDraftStorageManager();
    SessionManager sessMgr = SessionManager.getInstance();
    String docUri = docEntry.getDocUri();
    DraftDescriptor draftDescriptor = null;
    DocumentSession docSess = sessMgr.getSession(docEntry.getRepository(), docUri);
    if (docSess == null)
    {
      draftDescriptor = draftStoreMgr.getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller), docEntry.getRepository(),
          docUri);
    }
    else
    {
      draftDescriptor = docSess.getDraftDescriptor();
    }
    return draftDescriptor;
  }

  public static void restoreDraft(UserBean caller, IDocumentEntry docEntry, String mediaUri, boolean isMove, String revision)
      throws Exception
  {
    try
    {
      DraftDescriptor draftDescriptor = getDraftDescriptor(caller, docEntry);
      Map<DraftMetaEnum, Object> draftMeta = new HashMap<DraftMetaEnum, Object>();
      draftMeta.put(DraftMetaEnum.MIME, docEntry.getMimeType());
      draftMeta.put(DraftMetaEnum.REPOSITORY_ID, docEntry.getRepository());
      draftMeta.put(DraftMetaEnum.TITLE, docEntry.getTitle());
      draftMeta.put(DraftMetaEnum.EXT, docEntry.getExtension());
      draftMeta.put(DraftMetaEnum.LAST_MODIFIED, docEntry.getModified());
      // update time
      draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED, AtomDate.valueOf(Calendar.getInstance()).getValue());
      // update editor id
      draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID, caller.getId());
      draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION, docEntry.getVersion());
      draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH, docEntry.getContentHash());
      DraftStorageManager.getDraftStorageManager().restoreDraft(draftDescriptor, mediaUri, draftMeta, isMove, revision);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Draft accessing error: " + docEntry.getDocUri(), e);
    }
  }

  public static void storeDraft(UserBean caller, IDocumentEntry docEntry, String mediaUri, boolean isMove) throws Exception
  {
    try
    {
      DraftDescriptor draftDescriptor = getDraftDescriptor(caller, docEntry);
      Map<DraftMetaEnum, Object> draftMeta = new HashMap<DraftMetaEnum, Object>();
      draftMeta.put(DraftMetaEnum.MIME, docEntry.getMimeType());
      draftMeta.put(DraftMetaEnum.REPOSITORY_ID, docEntry.getRepository());
      draftMeta.put(DraftMetaEnum.TITLE, docEntry.getTitle());
      draftMeta.put(DraftMetaEnum.EXT, docEntry.getExtension());
      draftMeta.put(DraftMetaEnum.LAST_MODIFIED, docEntry.getModified());
      // update time
      // draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED, AtomDate.valueOf(Calendar.getInstance()).getValue());
      // update editor id
      draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID, caller.getId());
      draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION, docEntry.getVersion());
      draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH, docEntry.getContentHash());
      DraftStorageManager.getDraftStorageManager().newDraft(draftDescriptor, mediaUri, draftMeta, isMove);
      DraftStorageManager.getDraftStorageManager().generateSnapshotFromDraft(draftDescriptor, docEntry);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Draft accessing error: " + docEntry.getDocUri(), e);
    }
  }

  public static void upgradeDraft(UserBean caller, IDocumentEntry docEntry, String mediaUri, boolean isMove) throws Exception
  {
    try
    {
      DraftDescriptor draftDescriptor = getDraftDescriptor(caller, docEntry);
      // get meta from old draft
      JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDescriptor);
      Map<DraftMetaEnum, Object> meta = new HashMap<DraftMetaEnum, Object>();
      meta.put(DraftMetaEnum.REPOSITORY_ID, (String) draftMeta.get(DraftMetaEnum.REPOSITORY_ID.getMetaKey()));
      meta.put(DraftMetaEnum.TITLE, (String) draftMeta.get(DraftMetaEnum.TITLE.getMetaKey()));
      meta.put(DraftMetaEnum.EXT, (String) draftMeta.get(DraftMetaEnum.EXT.getMetaKey()));
      meta.put(DraftMetaEnum.MIME, (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey()));
      meta.put(DraftMetaEnum.DRAFT_BASE_VERSION, (String) draftMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey()));
      meta.put(DraftMetaEnum.BASE_CONTENT_HASH, (String) draftMeta.get(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey()));
      meta.put(DraftMetaEnum.LAST_MODIFIED, AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey()))
          .getCalendar());
      meta.put(DraftMetaEnum.DRAFT_SYNC_STATE, (Boolean) draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey()));
      meta.put(DraftMetaEnum.DRAFT_CREATED, (String) draftMeta.get(DraftMetaEnum.DRAFT_CREATED.getMetaKey()));
      meta.put(DraftMetaEnum.DRAFT_LAST_VISIT, (String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey()));
      meta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED, (String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()));
      meta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID, (String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey()));
      DraftStorageManager.getDraftStorageManager().upgradeDraft(draftDescriptor, mediaUri, meta, isMove);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Draft accessing error: " + docEntry.getDocUri(), e);
    }
  }

  public static void discardDraft(UserBean caller, IDocumentEntry docEntry, DraftDescriptor draftDescriptor) throws Exception
  {
    try
    {
      DraftStorageManager.getDraftStorageManager().discardDraft(draftDescriptor);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Draft accessing error: " + docEntry.getDocUri(), e);
    }
  }

  public static boolean transferDraft(IDocumentEntry docEntry, final DraftDescriptor sourceDescriptor,
      final DraftDescriptor targetDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    DocumentSession docSession = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
    if (docSession == null)
    {
      if (DraftStorageManager.getDraftStorageManager().isDraftDirty(sourceDescriptor) || docEntry.getMediaSize() == 0)
      {
        return DraftStorageManager.getDraftStorageManager().transferDraft(sourceDescriptor, targetDescriptor);
      }
      else
      {
        // discard the old draft and regenerate
        DraftStorageManager.getDraftStorageManager().discardDraft(sourceDescriptor);
        return true;
      }
    }
    else
    {
      LOG.log(Level.INFO, "There is edit session for document: " + docEntry.getDocUri() + ", can not transfer draft.");
      return false;
    }
  }

  public static synchronized IDocumentEntry publishDocument(UserBean caller, IDocumentEntry docEntry, MediaDescriptor media,
      File mediaFile, String versionSummary, boolean overwrite) throws RepositoryAccessException
  {
    IDocumentEntry newDocEntry = RepositoryServiceUtil.update(caller, docEntry, media, mediaFile, versionSummary, overwrite);
    return newDocEntry;
  }

  public static IDocumentEntry saveAsDocument(UserBean caller, String repoId, String folderUri, MediaDescriptor media) throws RepositoryAccessException
  {
    IDocumentEntry entry = null;
    if (folderUri != null)
    {
      entry = RepositoryServiceUtil.upload4Community(caller, repoId, folderUri, media);
    }
    else
    {
      entry = RepositoryServiceUtil.upload(caller, repoId, media); 
    }
    
    return entry;
  }

  public static String getExportFolder(UserBean caller, IDocumentEntry docEntry, long modified)
  {
    DraftDescriptor draftDescriptor = getDraftDescriptor(caller, docEntry);
    return draftDescriptor.getCacheURI("export_" + modified);
  }

  public static void forwardView(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    String type = serviceProvider.getDocumentType(docEntry.getMimeType());

    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("doc_type", type);
    request.setAttribute("doc_mode", "view");

    IDocumentService ds = getDocumentService(docEntry.getMimeType());
    if (ds != null)
    {
      ds.forwardViewPage(caller, docEntry, request, response);
    }
    else
    {
      LOG.log(Level.WARNING, "Could not forward to view page because it's unsupported doc type: " + type);
      response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
    }
  }

  public static void forwardEdit(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    String mimeType = docEntry.getMimeType();
    String type = serviceProvider.getDocumentType(docEntry.getMimeType());

    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("doc_type", type);
    request.setAttribute("doc_mode", request.getParameter("doc_mode") != null ? request.getParameter("doc_mode") : "edit");
    IDocumentService ds = getDocumentService(docEntry.getMimeType());
    if (ds != null)
    {
      ds.forwardEditPage(caller, docEntry, request, response);
    }
    else
    {
      LOG.log(Level.WARNING, "Could not forward to edit page because it's unsupported doc type: " + type);
      response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
    }
  }

  public static void forwardRevisionViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request,
      HttpServletResponse response) throws ServletException, IOException
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    String type = serviceProvider.getDocumentType(docEntry.getMimeType());

    request.setAttribute("doc_mimeType", docEntry.getMimeType());
    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("doc_type", type);
    request.setAttribute("doc_mode", "view");

    IDocumentService ds = getDocumentService(docEntry.getMimeType());
    if (ds != null)
    {
      ds.forwardRevisionViewPage(caller, docEntry, request, response);
    }
    else
    {
      LOG.log(Level.WARNING, "Could not forward to revision view page because it's unsupported doc type: " + type);
      response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
    }
  }

  public static void forwardError(IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    String type = serviceProvider.getDocumentType(docEntry.getMimeType());
    if (docEntry != null)
    {
      String docId = docEntry.getDocId();
    }
    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("doc_type", type);
    LOG.info(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID()).toString());
    request.getRequestDispatcher("/WEB-INF/pages/error.jsp").forward(request, response);
  }

  public static void storeSubFile(DraftDescriptor draftDescriptor, String path, InputStream is) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    SectionDescriptor sectionDesp = new SectionDescriptor(draftDescriptor, new DraftSection(path));
    DraftStorageManager.getDraftStorageManager(false).storeSection(sectionDesp, is);
  }

  public static void storeSubFile(DraftDescriptor draftDescriptor, String path, byte[] content) throws DraftStorageAccessException,
      DraftDataAccessException, IOException
  {
    ByteArrayInputStream bais = null;

    try
    {
      SectionDescriptor sectionDesp = new SectionDescriptor(draftDescriptor, new DraftSection(path));
      bais = new ByteArrayInputStream(content);
      DraftStorageManager.getDraftStorageManager().storeSection(sectionDesp, bais);
    }
    finally
    {
      if (bais != null)
      {
        bais.close();
      }
    }
  }

  public static MediaDescriptor getSubFile(DraftDescriptor draftDescriptor, String path, boolean exclusive) throws FileNotFoundException
  {
    SectionDescriptor sd;
    String sectionFilePath = null;
    try
    {
      sd = DraftStorageManager.getDraftStorageManager(exclusive).getSectionDescriptor(draftDescriptor, new DraftSection(path));
      sectionFilePath = sd.getSectionUri();
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Draft accessing error: " + draftDescriptor, e);
    }

    InputStream contentStream = new FileInputStream(sectionFilePath);
    String rootPath = draftDescriptor.getURI();
    String absPath = rootPath + File.separator + path;
    String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(absPath);

    String title = null;
    int idx = absPath.lastIndexOf('/');
    if (idx < 0)
    {
      title = absPath;
    }
    else
    {
      title = absPath.substring(idx + 1, absPath.length());
    }

    MediaDescriptor media = new MediaDescriptor(title, mimeType, contentStream);
    return media;
  }

  public static String getSubmittedContent(IDocumentEntry docEntry, String content)
  {
    IDocumentService iDS = getDocumentService(docEntry.getMimeType());
    return iDS.getSubmittedContent(content);
  }

  /**
   * Change the draft meta according to document entry information.
   * 
   * @param caller
   *          caller of this request
   * @param docEntry
   *          represents the document entry in repository
   * 
   * @throws DraftDataAccessException
   */
  private static void setDraftMeta(UserBean caller, IDocumentEntry docEntry) throws DraftDataAccessException
  {
    JSONObject draftMeta = new JSONObject();
    draftMeta.put(DraftMetaEnum.EXT.getMetaKey(), docEntry.getExtension());
    draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), docEntry.getMimeType());
    draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(docEntry.getModified()).getValue());
    draftMeta.put(DraftMetaEnum.TITLE.getMetaKey(), docEntry.getTitle());
    DraftDescriptor draftDescriptor = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDescriptor, draftMeta);
  }

  /**
   * Correct the name of document according to the real MIME type of the document.
   * 
   * @param caller
   *          caller of this request
   * @param docEntry
   *          represents the document entry in repository
   * 
   * @return new document entry
   * 
   * @throws RepositoryAccessException
   * @throws DraftDataAccessException
   */
  public static IDocumentEntry correctFileName(UserBean caller, IDocumentEntry entry) throws RepositoryAccessException,
      DraftDataAccessException
  {
    String mimeType = Platform.getMimeType("." + entry.getExtension());
    String ext = entry.getExtension();
    if (ext != null && FormatUtil.ALL_EXTS_SET.contains("." + ext) && 
        mimeType != null && !mimeType.equals(entry.getMimeType()))
    {
      String correctExt = FormatUtil.ALL_FORMATS.get(entry.getMimeType());
      if (correctExt != null)
      {
        String newTitle = entry.getTitle() + "." + correctExt;
        MediaDescriptor newMedia = new MediaDescriptor(newTitle, entry.getMimeType(), null);
        IDocumentEntry newEntry = RepositoryServiceUtil.update(caller, entry, newMedia, null, false);
        setDraftMeta(caller, newEntry);
        newMedia.dispose();
        return newEntry;
      }
    }
    return entry;
  }
}
