/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.document.common.util.XHTMLTransformer;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.document.services.IDocumentPart;
import com.ibm.concord.document.services.comments.CommentsDocumentPart;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.bean.UserSettingsBean;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.platform.conversion.ConversionConstants;
import com.ibm.concord.platform.conversion.IConversionService;
import com.ibm.concord.platform.conversion.Path;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.RevisionContentDescriptor;
import com.ibm.concord.platform.revision.RevisionDescriptor;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.revision.exception.RevisionDataException;
import com.ibm.concord.revision.service.RevisionService;
import com.ibm.concord.revision.util.RevisionUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.concord.spi.draft.IDraftStorageAdapterFactory;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;
import com.ibm.trl.acf.api.ActiveContentProcessorException;

public abstract class AbstractDocumentService implements IDocumentService
{
  private static final Logger LOG = Logger.getLogger(AbstractDocumentService.class.getName());

  private static final String CLASS_NAME = AbstractDocumentService.class.getName();

  private static final String CONTENT_HTML_FILE = "content.html";

  private static final String NEW_TITLE = "Untitled Draft";

  private static final String DRAFT_FORMAT_VERSION = "draftFormatVersion";

  private static final String CL_ENABLED = "CLEnabled";

  private static IConversionService conversionService;

  protected static final File CONVERSION_FOLDER;

  private static final File TEMP_FOLDER;

  private static List<IDocumentPart> documentParts;

  private static final String BR_TAG_INVALID = "></br>";

  private static final String IMG_TAG_INVALID = "></img>";

  private static final String TAG_ENCLOSE = "/>";

  private static final String IN_EDITING_FLAG_FILE_NAME = "in_editing_flag";

  protected static final String MS_FORMAT_MANE = "ms";

  protected static final String ODF_FORMAT_NAME = "odf";

  protected final List<String> exportFormats = new ArrayList<String>();

  protected final List<String> exportSourceFormats = new ArrayList<String>();

  protected final Map<String, String> format2Extension = new HashMap<String, String>();

  protected final Map<String, String> format2Mimetype = new HashMap<String, String>();

  private JSONObject config = new JSONObject();

  private boolean bCLEnbaled = false;

  static
  {
    String path = (String) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getConfig().get("path");
    CONVERSION_FOLDER = new File(path);
    FileUtil.nfs_mkdirs(CONVERSION_FOLDER, FileUtil.NFS_RETRY_SECONDS);

    TEMP_FOLDER = new File(CONVERSION_FOLDER, "temp");
    FileUtil.nfs_mkdirs(TEMP_FOLDER, FileUtil.NFS_RETRY_SECONDS);

    conversionService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);

    documentParts = new ArrayList<IDocumentPart>(1);
    documentParts.add(new CommentsDocumentPart());
  }

  protected abstract void applyMessageFiltered(DraftDescriptor draftDes, JSONArray msgList, boolean isClosed) throws Exception;

  public final DraftDescriptor restoreDraftFromRevision(UserBean user, IDocumentEntry docEntry, int major, int minor) throws Exception
  {
    final DraftDescriptor curDraft = DocumentServiceUtil.getDraftDescriptor(user, docEntry);
    DraftStorageManager draftStotageManager = DraftStorageManager.getDraftStorageManager();
    JSONObject meta = draftStotageManager.getDraftMeta(curDraft);
    String curDraftVersion = (String) meta.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey());
    IRevisionService revisionService = RevisionService.getInstance();
    RevisionContentDescriptor contentDescriptor = revisionService.getRevisionContentDescriptor(user, docEntry, major, minor);
    RevisionDescriptor rd = contentDescriptor.getRevisionDescriptor();

    // save draft before restore, will also notice revision service to record all message to latest
    DocumentSession docSess = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
    if (docSess != null)
    {
      docSess.autoSave();
    }

    if (String.valueOf(major).equalsIgnoreCase(curDraftVersion) && minor > 0)
    {
      LOG.log(Level.INFO, "Restoring minor draft {0} from aligned revision {1}.{2}", new Object[] { docEntry.getDocId(), major, minor });
    }
    else
    {
      if (minor > 0)
      {
        LOG.log(Level.WARNING, "Restoring a previous minor draft {0} from major revision {1}.{2}", new Object[] { docEntry.getDocId(),
            major, minor });
      }
      else
      {
        // TODO
        // Fire restore event to repository
        LOG.log(Level.INFO, "Restoring a previous major draft {0} from major revision {1}.{2}", new Object[] { docEntry.getDocId(), major,
            minor });
      }
      throw new RevisionDataException(RevisionDataException.ERROR_REVISION_FAILED_RESTORE, "Failed to restore version " + major + "."
          + minor);
    }
    // get draft descriptor, it's may be in cache folder for minor or base folder for major
    DraftDescriptor revDraft = RevisionUtil.getDraftForRevision(user, docEntry, major, minor);
    if (revDraft == null)
    {
      revDraft = this.generateDraftForRevision(user, docEntry, major, minor);
    }

    File tempFolder = new File(contentDescriptor.getRevisionDescriptor().getTempURI(UUID.randomUUID().toString()));
    File tempMediaFolder = new File(tempFolder, "media");
    FileUtil.nfs_mkdirs(tempMediaFolder, FileUtil.NFS_RETRY_SECONDS);
    FileUtil.copyDirToDir(contentDescriptor.getBasepath(), tempMediaFolder.getPath());

    DraftDescriptor transferDraft = new DraftDescriptor(rd.getCustomId(), rd.getRepository(), rd.getDocId(), tempMediaFolder.getPath(),
        new String[] { rd.getPrimaryHash(), rd.getSecondaryHash() });

    String revision = major + "." + minor;
    DocumentServiceUtil.restoreDraft(user, docEntry, transferDraft.getInternalURI(), true, revision);

    FileUtil.cleanDirectory(tempFolder);
    FileUtil.nfs_delete(tempFolder, FileUtil.NFS_RETRY_SECONDS);

    return DocumentServiceUtil.getDraftDescriptor(user, docEntry);
  }

  public final DraftDescriptor generateDraftForRevision(UserBean user, IDocumentEntry docEntry, int major, int minor) throws Exception
  {
    LOG.entering(this.getClass().getName(), "generateDraftForRevision", new Object[] { docEntry.getDocId(), major, minor });
    IRevisionService revisionService = RevisionService.getInstance();
    RevisionContentDescriptor contentDescriptor = revisionService.getRevisionContentDescriptor(user, docEntry, major, minor);
    if (contentDescriptor == null)
    {
      throw new RevisionDataException(RevisionDataException.ERROR_REVISION_DATA_NOT_FOUND,
          "Failed to get the content information for revision " + docEntry.getDocUri() + "@" + RevisionUtil.getRevisionLabel(major, minor));
    }
    else
    {
      RevisionDescriptor rd = contentDescriptor.getRevisionDescriptor();
      String baseURI = contentDescriptor.getBasepath();
      String tempURI = contentDescriptor.getRevisionDescriptor().getTempURI(null);

      if (!FileUtil.exists(new File(contentDescriptor.getBasepath())))
      {
        if (contentDescriptor.getBaseRevisionNo() == 0) // download from files and convert it
        {
          RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
              .getService(RepositoryProviderRegistry.class);
          IRepositoryAdapter repositoryAdapter = service.getRepository(docEntry.getRepository());

          IDocumentEntry[] versions = repositoryAdapter.getVersions(user, docEntry);
          IDocumentEntry version = null;
          for (IDocumentEntry entry : versions)
          {
            if (entry.getVersion().equals(String.valueOf(major)))
              version = entry;
          }

          if (version == null)
            throw new RevisionDataException(RevisionDataException.ERROR_REVISION_NOT_FOUND, "Failed to get document for version " + major);

          importDocument2(user, version, tempURI, contentDescriptor.getBasepath(), new HashMap());
        }
        else
          throw new RevisionDataException(RevisionDataException.ERROR_REVISION_DATA_NOT_FOUND, "Failed to get base file "
              + contentDescriptor.getBasepath());
      }

      if ((contentDescriptor.getDelta() == null || contentDescriptor.getDelta().size() == 0))
      {
        final String path = contentDescriptor.getBasepath();
        return new DraftDescriptor(rd.getCustomId(), rd.getRepository(), rd.getDocId(), path, new String[] { rd.getPrimaryHash(),
            rd.getSecondaryHash() })
        {
          public String getURI()
          {
            return path;
          }
        };
      }
      else
      {
        // copy base media to temp dir
        File tempFolder = new File(tempURI, UUID.randomUUID().toString());
        File tempMediaFolder = new File(tempFolder, "media");
        FileUtil.nfs_mkdirs(tempMediaFolder, FileUtil.NFS_RETRY_SECONDS);
        FileUtil.copyDirToDir(baseURI, tempMediaFolder.getPath());

        // copy attachments to temp dir
        JSONArray msgs = new JSONArray();
        for (Object obj : contentDescriptor.getDelta())
        {
          JSONObject delta = (JSONObject) obj;
          JSONArray msgList = (JSONArray) delta.get("msg");
          msgs.addAll(msgList);

          JSONArray attachmentFolders = (JSONArray) delta.get("attachments");
          for (Object folder : attachmentFolders)
          {
            File theFolder = new File((String) folder);
            String folderName = theFolder.getName();
            File folderInMedia = new File(tempMediaFolder, folderName);
            FileUtil.nfs_mkdirs(folderInMedia, FileUtil.NFS_RETRY_SECONDS);
            FileUtil.copyDirToDir((String) folder, folderInMedia.getPath());
          }
        }

        DraftDescriptor fakeDraftDescriptor = new DraftDescriptor(rd.getCustomId(), rd.getRepository(), rd.getDocId(),
            tempFolder.getPath(), new String[] { rd.getPrimaryHash(), rd.getSecondaryHash() });
        applyMessage(fakeDraftDescriptor, msgs, false);

        File cacheFolder = new File(rd.getCacheURI());
        FileUtil.nfs_mkdirs(cacheFolder.getParentFile(), FileUtil.NFS_RETRY_SECONDS);
        // FileUtil.nfs_mkdirs(new File(rd.getCacheURI()), FileUtil.NFS_RETRY_SECONDS);
        FileUtil.nfs_renameFile(tempFolder, new File(rd.getCacheURI()), FileUtil.NFS_RETRY_SECONDS);
        String path = rd.getCacheURI();
        LOG.log(Level.INFO, "Generate draft for revision {0}@{1}.{2} in {3}", new Object[] { docEntry.getDocId(), major, minor, path });
        return new DraftDescriptor(rd.getCustomId(), rd.getRepository(), rd.getDocId(), path, new String[] { rd.getPrimaryHash(),
            rd.getSecondaryHash() });
      }
    }
  }

  /*
   * This method will filter out comments message first, then call inherited document service to write to their own content
   */
  public final void applyMessage(DraftDescriptor draftDes, JSONArray msgList, boolean isClosed) throws Exception
  {
    if (msgList == null || msgList.size() <= 0)
    {
      return;
    }

    // split messages to different parts
    List<JSONArray> splitted = splitMessageList(msgList);

    // apply to different document parts in sequence
    for (int i = 0; i < documentParts.size(); i++)
    {
      IDocumentPart currentPart = documentParts.get(i);
      JSONArray currentPartList = splitted.get(i);
      if (currentPartList.size() > 0)
      {
        currentPart.applyMessage(draftDes, currentPartList);
      }
    }

    // apply message to main document at last
    JSONArray docMsgList = splitted.get(documentParts.size());
    if (docMsgList.size() > 0)
    {
      applyMessageFiltered(draftDes, docMsgList, isClosed);
    }
  }

  private List<JSONArray> splitMessageList(JSONArray msgList)
  {
    int len = documentParts.size() + 1;
    List<JSONArray> splitted = new ArrayList<JSONArray>(len);
    for (int i = 0; i < len; i++)
    {
      splitted.add(new JSONArray());
    }

    JSONArray docMsgList = splitted.get(documentParts.size());
    for (int i = 0; i < msgList.size(); i++)
    {
      boolean notDocMsg = false;
      JSONObject msg = (JSONObject) msgList.get(i);

      // check if this message is rejected by server, e.g, throw exception while performing OT
      String ctrlType = (String) msg.get(MessageConstants.CONTROL_TYPE);
      if (ctrlType != null && ctrlType.equalsIgnoreCase(MessageConstants.CONTROL_TYPE_REJECT))
      {
        // yes, just ignore this message
        continue;
      }

      // go through all content parts, to see if any interested with this message
      for (int j = 0; j < documentParts.size(); j++)
      {
        IDocumentPart currentPart = documentParts.get(j);
        JSONArray currentPartList = splitted.get(j);
        if (currentPart.belongsTo(msg))
        {
          // found, then go to next
          currentPartList.add(msg);
          notDocMsg = true;
          break;
        }
      }

      if (!notDocMsg)
      {
        // nobody care about it, then it's a document message
        docMsgList.add(msg);
      }
    }

    return splitted;
  }

  protected void applyXHTMLMessage(DraftDescriptor draftDes, JSONArray msgList)
  {
    FileOutputStream fos = null;
    FileInputStream fis = null;
    MediaDescriptor contentMedia = null;

    File draftTempFolder = new File(draftDes.getTempURI(null));
    File tempFolder = new File(draftTempFolder, UUID.randomUUID().toString());
    FileUtil.nfs_mkdirs(tempFolder, FileUtil.NFS_RETRY_SECONDS);

    File tmpContentFile = new File(tempFolder, "concord" + System.currentTimeMillis() + "tmp");
    try
    {
      FileUtil.nfs_createNewFile(tmpContentFile, FileUtil.NFS_RETRY_SECONDS);
      contentMedia = DocumentServiceUtil.getSubFile(draftDes, CONTENT_HTML_FILE, false);
      fos = new FileOutputStream(tmpContentFile);
      XHTMLTransformer.flushMessage(msgList, contentMedia.getStream(), fos, this.getClass().getSimpleName());
      
      if (fos != null){
        fos.flush();
        fos.close();
      }
      
      fis = new FileInputStream(tmpContentFile);
      DocumentServiceUtil.storeSubFile(draftDes, CONTENT_HTML_FILE, fis);
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "Error: Can't find " + draftDes.getDocId() + CONTENT_HTML_FILE, e);
      throw new IllegalStateException("Error: Can't find " + draftDes.getDocId() + CONTENT_HTML_FILE);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IO Error: " + draftDes.getDocId() + CONTENT_HTML_FILE, e);
      throw new IllegalStateException("IO Error: " + draftDes.getDocId() + CONTENT_HTML_FILE);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.SEVERE, "Draft accessing error: " + draftDes.getDocId(), e);
      throw new IllegalStateException("Draft accessing error: " + draftDes.getDocId(), e);
    }
    finally
    {
      try
      {
        if (fis != null)
        {
          fis.close();
        }
        if (fos != null)
        {
          fos.close();
        }
        if (!FileUtil.nfs_delete(tmpContentFile, FileUtil.NFS_RETRY_SECONDS))
        {
          LOG.log(Level.WARNING, "failed to delete file " + tmpContentFile.getAbsolutePath());
        }
        contentMedia.dispose();
        FileUtil.nfs_cleanDirectory(tempFolder, FileUtil.NFS_RETRY_SECONDS);
        if (!FileUtil.nfs_delete(tempFolder, FileUtil.NFS_RETRY_SECONDS))
        {
          LOG.log(Level.WARNING, "failed to delete directory " + tempFolder.getAbsolutePath());
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when close stream ", e);
      }
    }

  }

  public Object genOTContext(DraftDescriptor draftDes) throws Exception
  {
    return null;
  }

  public JSONObject OTContextSerialize(DraftDescriptor draftDes)
  {
    return new JSONObject();
  }

  public void removeOTContext(DraftDescriptor draftDes, String clientId)
  {
    return;
  }

  protected abstract JSONObject getCurrentStateFiltered(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria) throws Exception;

  protected JSONObject getCurrentStateXHTML(DraftDescriptor draftDes, JSONArray msgList)
  {
    try
    {
      MediaDescriptor contentMedia = DocumentServiceUtil.getSubFile(draftDes, CONTENT_HTML_FILE, true);
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      XHTMLTransformer.flushMessage(msgList, contentMedia.getStream(), baos, this.getClass().getSimpleName());
      contentMedia.dispose();
      String content = baos.toString("UTF-8");
      baos.close();
      // D28056: [Chrome][Regression] Every slide has redundant char of previous slide in exported pdf.
      char a = 65279;
      content = content.replace(String.valueOf(a), "");
      JSONObject state = new JSONObject();
      state.put("html", content);

      return state;
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "error happens when getting current state of document model", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "error happens when getting current state of document model", e);
    }

    return null;
  }

  public final JSONObject getCurrentState(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria) throws Exception
  {
    if (msgList == null || msgList.size() <= 0)
    {
      // put a empty list here
      msgList = new JSONArray();
    }

    // split messages to different parts
    List<JSONArray> splitted = splitMessageList(msgList);

    JSONObject state = new JSONObject();

    // get different document parts in sequence
    for (int i = 0; i < documentParts.size(); i++)
    {
      IDocumentPart currentPart = documentParts.get(i);
      JSONArray currentPartList = splitted.get(i);

      // check if current part is in criteria
      boolean bSelected = false;
      JSONObject partCriteria = null;
      if (criteria != null)
      {
        if (criteria.containsKey(currentPart.getId()))
        {
          partCriteria = (JSONObject) criteria.get(currentPart.getId());
          bSelected = true;
        }
      }
      else
      {
        bSelected = true;
      }

      if (bSelected)
      {
        JSONArtifact partState = currentPart.getCurrentState(draftDes, currentPartList, partCriteria);
        state.put(currentPart.getId(), partState);
      }
    }

    // check if main document is in criteria
    boolean bSelected = false;
    JSONObject docCriteria = null;
    if (criteria != null)
    {
      if (criteria.containsKey(MessageConstants.CONTENT_STATE_KEY))
      {
        docCriteria = (JSONObject) criteria.get(MessageConstants.CONTENT_STATE_KEY);
        bSelected = true;
        // add user id
        if (docCriteria != null)
        {
          docCriteria.put(MessageConstants.USER_ID, criteria.get(MessageConstants.USER_ID));
        }
      }
    }
    else
    {
      bSelected = true;
    }

    if (bSelected)
    {
      JSONArray docMsgList = splitted.get(documentParts.size());
      JSONObject contentState = getCurrentStateFiltered(draftDes, docMsgList, docCriteria);
      state.put(MessageConstants.CONTENT_STATE_KEY, contentState);
    }

    return state;
  }

  public List<String> getPreservedFileNameList()
  {
    return null;
  }

  public JSONObject getResultDocument(JSONObject baseDoc, JSONArray msgList, boolean trackingChange)
  {
    try
    {
      byte[] baseDocContent = baseDoc != null ? baseDoc.get("html").toString().getBytes("UTF-8") : new byte[0];
      ByteArrayInputStream bais = new ByteArrayInputStream(baseDocContent);
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      XHTMLTransformer.flushMessage(msgList, bais, baos, this.getClass().getSimpleName());
      bais.close();
      String content = baos.toString("UTF-8");
      baos.close();

      JSONObject state = new JSONObject();
      state.put("html", content);

      return state;
    }
    catch (FileNotFoundException e)
    {
      throw new IllegalStateException(e);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }

    return null;
  }

  public void init(JSONObject config)
  {
    this.config = config;
    String version = (String) config.get(DRAFT_FORMAT_VERSION);
    if (version == null)
    {
      config.put(DRAFT_FORMAT_VERSION, getDraftFormatVersion());
    }
    String sCLEnabled = (String) config.get(CL_ENABLED);
    if (sCLEnabled != null)
      bCLEnbaled = Boolean.valueOf(sCLEnabled.toString()).booleanValue();
  }

  protected boolean containsConcordFolder(File odfFile)
  {
    ZipInputStream zis = null;
    try
    {
      FileInputStream fis = new FileInputStream(odfFile);
      zis = new ZipInputStream(fis);
      ZipEntry entry = zis.getNextEntry();
      while ((entry = zis.getNextEntry()) != null)
      {
        if (entry.isDirectory() && entry.getName().startsWith("concord"))
        {
          return true;
        }
      }
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "error happened when checking concord folder", e);
    }
    finally
    {
      try
      {
        zis.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "error happened when close zip input stream", e);
      }
    }
    return false;
  }

  public IDocumentEntry publish(IDocumentEntry docEntry, UserBean caller, JSONObject requestData, JSONArray msgList, boolean overwrite)
      throws Exception
  {
    LOG.entering(CLASS_NAME, "publish", new Object[] { docEntry.getTitle() });

    LOG.info(new ActionLogEntry(caller, Action.PUBLISHDOC, docEntry.getDocUri(), null).toString());

    cleanHeadlessImage(docEntry, caller);

    FileInputStream fis = null;
    IDocumentEntry newDocEntry = docEntry;
    // get draft directory
    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);

    // create temp directory
    File temp = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));
    FileUtil.nfs_mkdirs(temp, FileUtil.NFS_RETRY_SECONDS);
    // create convert directory
    File convertFolder = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));
    FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);

    MediaDescriptor media = null;
    try
    {
      // create concord folder to place draft files
      File concordFolder = new File(temp, "concord");
      if (!FileUtil.nfs_mkdirs(concordFolder, FileUtil.NFS_RETRY_SECONDS))
      {
        LOG.log(Level.WARNING, "failed to create directory " + concordFolder.getAbsolutePath());
      }
      // copy draft files to temp concord folder
      copyDraftToDir(draftDesc, concordFolder.getAbsolutePath());

      prePublish(draftDesc, docEntry, concordFolder);
      // get target document's mime and ext
      String arrays[] = getPubishedMimeAndExt(caller, draftDesc);
      String targetExtension;
      String ext = docEntry.getExtension();
      if(ext == null) {
        ext = "";
      }
      if(FormatUtil.ALL_EXTS_SET.contains("." + ext)){
        targetExtension = arrays[0];
      } else {
        targetExtension = ext;
      }
      String targetMime = arrays[1];
      // prepare parameters
      Map<String, Object> parameters = new HashMap<String, Object>();
      parameters.put("actionType", "publish");
      parameters.put("packageDraft", "false");
      String picturesPath = draftDesc.getURI() + File.separator + "Pictures";
      File picturesFolder = new File(picturesPath);
      if (picturesFolder.exists())
      {
        picturesPath = ConcordUtil.getRelativePath(picturesPath);
        parameters.put("pictureFolder", picturesPath);
      }
      // convert file
      parameters.put("extension", docEntry.getExtension());
      String convertedFile = convert(concordFolder.getAbsolutePath(), getTargetMimeType(), targetMime, convertFolder.getAbsolutePath(),
          parameters);
      // publishing
      File odfFile = new File(convertedFile);
      fis = new FileInputStream(odfFile);
      String newTitle = (String) requestData.get("newTitle");
      if (newTitle == null)
      {
        newTitle = docEntry.getTitle() + "." + targetExtension;
      }
      String versionSummary = (String) requestData.get("changeSummary");
      media = new MediaDescriptor(newTitle, targetMime, fis);
      newDocEntry = DocumentServiceUtil.publishDocument(caller, docEntry, media, odfFile, versionSummary, overwrite);
      DocumentEntryHelper.clearEntryCache(caller, newDocEntry.getDocUri());
      // clean dirs
      if (!odfFile.delete())
      {
        LOG.log(Level.WARNING, "failed to delete file " + odfFile.getAbsolutePath());
      }

      DraftActionEvent event = new DraftActionEvent(draftDesc, DraftAction.PUBLISH, newDocEntry);
      DraftStorageManager.getDraftStorageManager().notifyListener(event);

      DocumentSession docSess = SessionManager.getInstance().getSession(newDocEntry.getRepository(), newDocEntry.getDocUri());
      if (docSess != null)
      {
        JSONObject message = new JSONObject();
        message.put("type", "publishNotify");
        message.put("user", caller.getId());
        message.put("overwrite", Boolean.toString(overwrite));
        message.put("data", DocumentEntryHelper.toJSON(newDocEntry));
        docSess.publishServerMessage(message);
      }

      DraftStorageManager.getDraftStorageManager().generateSnapshotFromDraft(draftDesc, newDocEntry);
    }
    catch (ConversionException e)
    {
      throw e;
    }
    catch (IOException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("error when publishing a new version document");
      dse.getData().put("docUri", docEntry.getDocUri());
      throw dse;
    }
    finally
    {
      if (media != null)
      {
        media.dispose();
      }

      FileUtil.cleanDirectory(temp);
      if (!temp.delete())
      {
        LOG.log(Level.WARNING, "failed to delete directory " + temp.getAbsolutePath());
      }
      FileUtil.cleanDirectory(convertFolder);
      if (!convertFolder.delete())
      {
        LOG.log(Level.WARNING, "failed to delete directory " + convertFolder.getAbsolutePath());
      }
    }
    LOG.exiting(CLASS_NAME, "publish", new Object[] { docEntry.getTitle() });
    return newDocEntry;
  }

  protected String[] getPubishedMimeAndExt(UserBean user, DraftDescriptor draftDesc) throws Exception
  {
    JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
    String draftMime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
    String draftExt = (String) draftMeta.get(DraftMetaEnum.EXT.getMetaKey());
    boolean isConvertedByCL = isConvertedByCL(draftDesc.getURI());
    String[] arrays = new String[2];
    if (FormatUtil.TXT_MIMETYPE.equals(draftMime) || FormatUtil.CSV_MIMETYPE.equals(draftMime))
    {
      String format = getDefaultFormat(user);
      arrays[0] = getDefaultExtension(format);
      arrays[1] = getDefaultMimeType(format);
    }
    else if (FormatUtil.MSOOXML_FORMATS.containsKey(draftMime) && (!bCLEnbaled || !isConvertedByCL))
    {
      arrays[0] = FormatUtil.OOXML2MS.get(draftExt);
      arrays[1] = FormatUtil.MS_FORMATS.get(arrays[0]);
    }
    else if (FormatUtil.DOC_MIMETYPE.equals(draftMime))
    {
      arrays[0] = FormatUtil.MSOOXML_FORMATS.get(FormatUtil.DOCX_MIMETYPE);
      arrays[1] = FormatUtil.DOCX_MIMETYPE;
    }
    else
    {
      if (DocumentServiceUtil.supportedDocumentMimeType(draftMime))
      {
        arrays[0] = draftExt;
        arrays[1] = draftMime;
      }
      else
      {
        // if the draft mime is not supported
        // the default extension and mime type will be used
        String format = getDefaultFormat(user);
        arrays[0] = getDefaultExtension(format);
        arrays[1] = getDefaultMimeType(format);
      }
    }
    return arrays;
  }

  protected void cleanPicturesDirectory(File concordFolder)
  {
    File pictures = new File(concordFolder, "Pictures");
    Set<String> filters = new HashSet<String>();
    filters.add("wmf");
    filters.add("svm");
    if (pictures.exists())
    {
      FileUtil.nfs_cleanDirectory(pictures, filters, FileUtil.NFS_RETRY_SECONDS);
    }
  }

  public IDocumentEntry saveAs(IDocumentEntry docEntry, UserBean caller, JSONObject requestData, JSONArray msgList) throws Exception
  {
    LOG.entering(CLASS_NAME, "saveAs", new Object[] { docEntry.getDocUri() });

    LOG.info(new ActionLogEntry(caller, Action.SAVEASDOC, docEntry.getDocUri(), null).toString());

    cleanHeadlessImage(docEntry, caller);
    
    // disable track change information before saveAs to new doc.
    
    String newTitle = (String) requestData.get("newTitle");
    if (newTitle == null)
      return null;
    boolean isExternal = MediaDescriptor.DEFAULT_IS_EXTERNAL_VALUE;
    boolean propagate = MediaDescriptor.DEFAULT_PROPAGATE_VALUE;
    Object ext = (requestData != null) ? requestData.get("isExternal") : null;
    Object pro = (requestData != null) ? requestData.get("propagate") : null;
    if (ext != null)
      isExternal = ext instanceof Boolean ? ((Boolean) ext).booleanValue() : Boolean.parseBoolean((String) ext);
    if (pro != null)
      propagate = pro instanceof Boolean ? ((Boolean) pro).booleanValue() : Boolean.parseBoolean((String) pro);
    String folderUri = (String) requestData.get("folderUri");

    FileInputStream targetfis = null;
    FileInputStream draftfis = null;
    IDocumentEntry newDocEntry = null;
    // get draft directory
    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);

    // create temp draft dir
    File temp = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));
    FileUtil.nfs_mkdirs(temp, FileUtil.NFS_RETRY_SECONDS);
    File convertFolder = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));
    // create convert folder
    FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);

    try
    {
      // create concord folder to place draft files
      File concordFolder = new File(temp, "concord");
      if (!FileUtil.nfs_mkdirs(concordFolder, FileUtil.NFS_RETRY_SECONDS))
      {
        LOG.log(Level.WARNING, "failed to create directory " + concordFolder.getAbsolutePath());
      }
      // copy draft files to temp concord folder
      copyDraftToDir(draftDesc, concordFolder.getAbsolutePath());

      prePublish(draftDesc, docEntry, concordFolder);
      // remove task information from content
      cleanTaskCommentsFromContent(concordFolder);
      cleanCommentsData(concordFolder);
      disableAndCleanTrackChange(concordFolder);
      // get target document's mime and ext
      String arrays[] = getPubishedMimeAndExt(caller, draftDesc);
      String targetExtension = arrays[0];
      String targetMime = arrays[1];
      // prepare parameters
      Map<String, Object> params = new HashMap<String, Object>();
      params.put("actionType", "saveas");
      params.put("packageDraft", "false");
      String picturesPath = draftDesc.getURI() + File.separator + "Pictures";
      File picturesFolder = new File(picturesPath);
      if (picturesFolder.exists())
      {
        picturesPath = ConcordUtil.getRelativePath(picturesPath);
        params.put("pictureFolder", picturesPath);
      }
      // convert and package draft to odt
      String convertedFile = convert(concordFolder.getAbsolutePath(), getTargetMimeType(), targetMime, convertFolder.getAbsolutePath(),
          params);
      // save as
      File targetFile = new File(convertedFile);
      targetfis = new FileInputStream(targetFile);
      newTitle = newTitle + "." + targetExtension;
      MediaDescriptor media = new MediaDescriptor(newTitle, targetMime, targetfis, isExternal, propagate);
      newDocEntry = DocumentServiceUtil.saveAsDocument(caller, docEntry.getRepository(), folderUri, media);
      
      // store to draft
      DocumentServiceUtil.storeDraft(caller, newDocEntry, concordFolder.getAbsolutePath(), true);
      // record document history
      IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
      IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
      String repId = newDocEntry.getRepository();
      String docUri = newDocEntry.getDocUri();
      
     
      
      if (docHisotryDAO.get(repId, docUri) == null)
      {
        DocHistoryBean dhb = new DocHistoryBean(repId, docUri);
        dhb.setLastModified(newDocEntry.getModified().getTimeInMillis());
        dhb.setOrgId(draftDesc.getCustomId());
        dhb.setDocId(newDocEntry.getDocId());
        dhb.setVersionSeriesId(newDocEntry.getVersionSeriesId());
        dhb.setLibraryId(newDocEntry.getLibraryId());
        dhb.setCommunityId(newDocEntry.getCommunityId());
        dhb.setAutoPublish(AutoPublishConfig.getAutoPublish());
        dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
        docHisotryDAO.add(dhb);
      }
    }
    catch (ConversionException e)
    {
      throw e;
    }
    catch (RepositoryAccessException e)
    {
      throw e;
    }
    catch (Exception e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("error when saving document");
      dse.getData().put("docUri", docEntry.getDocUri());
      dse.getData().put("newTitle", newTitle);
      throw dse;
    }
    finally
    {
      try
      {
        if (targetfis != null)
        {
          targetfis.close();
        }
        if (draftfis != null)
        {
          draftfis.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when closing stream", e);
      }
      FileUtil.cleanDirectory(temp);
      if (!temp.delete())
      {
        LOG.log(Level.WARNING, "failed to delete directory " + temp.getAbsolutePath());
      }
      FileUtil.cleanDirectory(convertFolder);
      if (!convertFolder.delete())
      {
        LOG.log(Level.WARNING, "failed to delete directory " + convertFolder.getAbsolutePath());
      }
    }
    LOG.exiting(CLASS_NAME, "saveAs", new Object[] { docEntry.getDocUri() });
    return newDocEntry;
  }

  protected String getContent(File contentFile)
  {
    try
    {
      InputStreamReader reader = null;
      reader = new InputStreamReader(new FileInputStream(contentFile), "UTF8");
      BufferedReader br = new BufferedReader(reader);
      String dataLine = "";
      StringBuffer sbStr = new StringBuffer();
      while (null != (dataLine = br.readLine()))
      {
        sbStr.append(dataLine);
        sbStr.append("\r\n");
      }
      br.close();
      // TEMP: Temporary fix of 15967, trim \r\n in dummy scenario
      // should be refined by using JTidy code
      String fileContent = sbStr.toString();
      fileContent = fileContent.replaceAll(">\r\n<", "><");
      fileContent = fileContent.replaceAll(">\r\n\t<", "><");
      fileContent = fileContent.replaceAll("\r\n", " ");
      return fileContent;
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "failed to read file: " + contentFile.getAbsolutePath(), e);
    }
    return null;
  }

  protected abstract void cleanTaskCommentsFromContent(File concordFolder);

  /**
   * Clean data in comments.json
   */
  public void cleanCommentsData(File concordFolder)
  {
    File commentsFile = new File(concordFolder, "Reserved" + File.separator + "comments.json");
    cleanCommentsDataFromFile(commentsFile);
  }

  protected void cleanCommentsDataFromFile(File commentsFile)
  {
    if (commentsFile.exists())
    {
      JSONArray commentsList = new JSONArray();
      FileInputStream fis = null;
      FileOutputStream fos = null;
      try
      {
        fis = new FileInputStream(commentsFile);
        commentsList = JSONArray.parse(fis);
        commentsList.clear();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when cleaning comment", e);
      }
      finally
      {
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "cannot close comments.json from when opening ", e);
          }
        }
      }
      try
      {
        // write back to comments.json
        fos = new FileOutputStream(commentsFile);
        commentsList.serialize(fos);
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when cleaning comment", e);
      }
      finally
      {
        if (fos != null)
        {
          try
          {
            fos.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "cannot close comments.json when closeing ", e);
          }
        }
      }
    }
    else
      LOG.log(Level.WARNING, "comments.json does not exist");

  }

  protected void copyDraftToDir(DraftDescriptor draftDesc, String target) throws DraftStorageAccessException, DraftDataAccessException
  {
    DraftStorageManager.getDraftStorageManager().getDraftMedia(draftDesc, target);
    File targetDir = new File(target);
    File statusFile = new File(targetDir, "status.json");
    if (statusFile.exists())
      FileUtil.nfs_delete(statusFile, FileUtil.NFS_RETRY_SECONDS);
  }

  protected JSONArray restoreMsg(DraftDescriptor draftDescriptor) throws DraftStorageAccessException
  {
    JSONArray msgArray = null;
    try
    {
      IComponent draftComp = Platform.getComponent(DraftComponent.COMPONENT_ID);
      IDraftStorageAdapterFactory storageAdapterFactory = (IDraftStorageAdapterFactory) draftComp
          .getService(IDraftStorageAdapterFactory.class);
      IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), "msg.json");
      InputStream is = msgFile.getInputStream();
      msgArray = JSONArray.parse(is);
      is.close();
    }
    catch (IOException e)
    {
      throw new DraftStorageAccessException(draftDescriptor, e);
    }

    return msgArray;
  }

  public IDocumentEntry createDocument(UserBean caller, String repository, String folderUri, JSONObject data) throws Exception
  {
    return createDocument(caller, repository, folderUri, data, null);
  }

  public IDocumentEntry createDocument(UserBean caller, String repository, String folderUri, JSONObject data, IDocumentEntry docEntry)
      throws Exception
  {
    LOG.entering(CLASS_NAME, "createDocument", new Object[] { repository });

    String title = NEW_TITLE;
    if (data != null && data.get("newTitle") != null)
      title = (String) data.get("newTitle");

    boolean isExternal = MediaDescriptor.DEFAULT_IS_EXTERNAL_VALUE;
    boolean propagate = MediaDescriptor.DEFAULT_PROPAGATE_VALUE;
    Object ext = (data != null) ? data.get("isExternal") : null;
    Object pro = (data != null) ? data.get("propagate") : null;
    if (ext != null)
      isExternal = ext instanceof Boolean ? ((Boolean) ext).booleanValue() : Boolean.parseBoolean((String) ext);
    if (pro != null)
      propagate = pro instanceof Boolean ? ((Boolean) pro).booleanValue() : Boolean.parseBoolean((String) pro);

    String contextType = null;
    String contextValue = null;
    String contextFolder = null;
    String fVisibility = null;
    Object context = (data != null) ? data.get("context") : null;
    if (context != null && context instanceof JSONObject)
    {
      JSONObject contObj = (JSONObject) context;
      contextType = (String) contObj.get("type");
      Object value = contObj.get("value");
      if (value instanceof Boolean)
      {
        boolean theValue = (Boolean) value;
        contextValue = String.valueOf(theValue);
      }
      else
      {
        contextValue = (String) contObj.get("value");
      }
      contextFolder = (String) contObj.get("collectionType");
      fVisibility = (String) contObj.get("visibility");
    }
    UUID docId = UUID.randomUUID();
    File tempFolder = new File(TEMP_FOLDER, docId.toString());
    FileUtil.nfs_mkdirs(tempFolder, FileUtil.NFS_RETRY_SECONDS);
    File convertFolder = new File(CONVERSION_FOLDER, docId.toString());
    FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);

    IDocumentEntry entry = null;
    InputStream empty_is = null;
    try
    {
      File concordFolder = new File(convertFolder, "concord");
      FileUtil.nfs_mkdirs(concordFolder, FileUtil.NFS_RETRY_SECONDS);
      createVersionFile(concordFolder);
      createTemplateDocument(data, concordFolder);

      if (data != null && data.get("attachments") != null)
      {
        JSONArray attachments = (JSONArray) data.get("attachments");
        for (int i = 0; i < attachments.size(); i++)
        {
          String absPath = (String) ((JSONObject) attachments.get(i)).get("abs_path");
          String relPath = (String) ((JSONObject) attachments.get(i)).get("rel_path");
          File attFile = new File(absPath);
          File parentFile = new File(concordFolder, relPath).getParentFile();
          if (!FileUtil.nfs_mkdirs(parentFile, FileUtil.NFS_RETRY_SECONDS))
          {
            LOG.log(Level.WARNING, "failed to create directory: " + parentFile.getAbsolutePath());
          }
          FileUtil.nfs_copyFileToFile(attFile, new File(concordFolder, relPath), FileUtil.NFS_RETRY_SECONDS);
        }
      }

      // upload a zero byte stream to repository, to indicate it is 'new'.
      if (docEntry == null)
      {
        empty_is = new ByteArrayInputStream(new byte[0]);
        String format = getDefaultFormat(caller);
        MediaOptions options = new MediaOptions(contextType, contextValue, fVisibility);
        MediaDescriptor media = new MediaDescriptor(title + "." + getDefaultExtension(format), getDefaultMimeType(format), empty_is,
            isExternal, propagate, options);
        if (folderUri == null)
        {
          entry = RepositoryServiceUtil.upload(caller, repository, media);
        }
        else
        {
          if ("personal".equals(contextFolder))
          {
            entry = RepositoryServiceUtil.upload(caller, repository, media);
          }
          else
          {
            entry = RepositoryServiceUtil.upload4Community(caller, repository, folderUri, media);
          }
        }
        media.dispose();
      }
      else
      {
        entry = docEntry;
        String name = docEntry.getTitleWithExtension();
        if (name != null)
        {
          entry.setMimeType(MimeTypeUtil.MIME_TYPE_MAP.getContentType(name));
        }
      }
      // store as draft
      DocumentServiceUtil.storeDraft(caller, entry, concordFolder.getAbsolutePath(), true);
    }
    catch (RepositoryAccessException e)
    {
      throw e;
    }
    catch (FileNotFoundException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("file not found when creating document");
      throw dse;
    }
    catch (IOException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("io error when creating document");
      throw dse;
    }
    catch (Exception e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("unknown error when creating document");
      throw dse;
    }
    finally
    {
      try
      {
        if (empty_is != null)
        {
          empty_is.close();
        }
        FileUtil.cleanDirectory(tempFolder);
        if (!tempFolder.delete())
        {
          LOG.log(Level.WARNING, "failed to delete folder " + tempFolder);
        }
        FileUtil.cleanDirectory(convertFolder);
        if (!convertFolder.delete())
        {
          LOG.log(Level.WARNING, "failed to delete folder " + convertFolder);
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when closing stream", e);
      }
    }
    LOG.exiting(CLASS_NAME, "createDocument", new Object[] { repository });
    return entry;
  }

  protected void createVersionFile(File concordFolder)
  {
    File file = new File(concordFolder, "conversionVersion.txt");
    FileOutputStream fos = null;
    try
    {
      fos = new FileOutputStream(file);
      fos.write(((String) config.get(DRAFT_FORMAT_VERSION)).getBytes());
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "failed to create " + file.getAbsolutePath(), e);
    }
    finally
    {
      try
      {
        if (fos != null)
        {
          fos.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "failed to close output stream of " + file.getAbsolutePath(), e);
      }
    }
  }

  public IDocumentEntry importDocument(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters) throws Exception
  {
    if (parameters.upgradeConvert)
    {
      return importDocumentByUpgradeConvert(caller, entry, parameters);
    }
    else if (parameters.uploadConvert)
    {
      return importDocumentByUploadConvert(caller, entry, parameters);
    }
    else
    {
      return importDocumentByNormalConvert(caller, entry, parameters);
    }
  }

  public IDocumentEntry importDocumentByUploadConvert(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters)
      throws Exception
  {

    LOG.entering(CLASS_NAME, "importDocumentByUploadConvert", new Object[] { entry.getDocUri() });

    boolean backgroundConvert = true;
    String uploadConvertID = null;
    boolean isAdminUser = false;

    if (parameters != null)
    {
      uploadConvertID = parameters.uploadConvertID;
      isAdminUser = parameters.isAdminUser;
    }

    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, entry);
    File draftTempFolder = new File(draftDesc.getTempURI(null));
    File uploadConvertFolder = null;
    File upgradeConvertFolder = new File(draftTempFolder, "upgrade");
    File mediaFolder = null;

    File seriesDraftTempFolder = null;
    if (entry.getVersionSeriesId() != null && entry.getVersionSeriesUri() != null)
    {
      DraftDescriptor seriesDraftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(draftDesc.getCustomId(),
          entry.getRepository(), entry.getVersionSeriesUri());
      seriesDraftTempFolder = new File(seriesDraftDesc.getTempURI(null));
      uploadConvertFolder = new File(seriesDraftTempFolder, "upload"); // reset uploadConvertFolder
    }
    else
    {
      uploadConvertFolder = new File(draftTempFolder, "upload");
    }

    JSONObject backgroundResult = null;
    String backgroundConvertSource = null;
    String backgroundConvertTarget = null;
    if (uploadConvertID != null)
    {
      if (seriesDraftTempFolder != null)
      {// CCM uses version series ID to contain upload convert because there is no draft ID yet at that time
        backgroundConvertSource = seriesDraftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID;
        backgroundConvertTarget = seriesDraftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID
            + File.separator + "concord";
      }
      else
      {
        backgroundConvertSource = draftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID;
        backgroundConvertTarget = draftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID
            + File.separator + "concord";
      }
      backgroundResult = checkBackgroundConvertJob(false, backgroundConvertSource, backgroundConvertTarget, entry.getMimeType());
    }

    if (backgroundResult != null)
      return entry;

    mediaFolder = new File(backgroundConvertSource);
    parameters.backgroundConvert = true;
    parameters.backgroundConvertSource = draftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID;

    // clean the old upload conversion results in a separated thread if not in editing, for reducing storage usage purpose
    File inEditingFlagFile = new File(uploadConvertFolder, IN_EDITING_FLAG_FILE_NAME);
    if (!FileUtil.exists(inEditingFlagFile) && FileUtil.exists(uploadConvertFolder))
    {
      final File[] subs = FileUtil.nfs_listFiles(uploadConvertFolder, FileUtil.NFS_RETRY_SECONDS);
      if (subs.length != 0)
      {
        new Thread(new Runnable()
        {

          public void run()
          {
            for (File file : subs)
            {
              if (FileUtil.nfs_isDirectory(file, FileUtil.NFS_RETRY_SECONDS))
              {
                FileUtil.nfs_cleanDirectory(file, FileUtil.NFS_RETRY_SECONDS);
              }
              FileUtil.nfs_delete(file, FileUtil.NFS_RETRY_SECONDS);
            }
          }
        }).start();
      }
    }
    FileUtil.nfs_mkdirs(mediaFolder, FileUtil.NFS_RETRY_SECONDS);

    File contentFile = null;
    MediaDescriptor media = null;
    try
    {
      // symphony need the correct extension for conversion
      String ext = FormatUtil.ALL_FORMATS.get(entry.getMimeType());
      contentFile = new File(mediaFolder, "contentfile" + "." + ext);
      if (!contentFile.exists())
      {
        if (isAdminUser)
        {
          media = RepositoryServiceUtil.download(null, entry, false);
        }
        else
        {
          media = RepositoryServiceUtil.download(caller, entry, false);
        }
        FileUtil.copyInputStreamToFile(media.getStream(), contentFile);
      }
      if (DocumentServiceUtil.supportedDocumentMimeType(entry.getMimeType()))
      {
        return convert(caller, entry, parameters, draftDesc, contentFile);
      }
    }
    catch (RepositoryAccessException ae)
    {
      throw ae;
    }
    catch (Exception e)
    {
      throw e;
    }
    finally
    {
      if (media != null)
      {
        media.dispose();
      }
      if (!backgroundConvert)
      {
        if (contentFile != null && !contentFile.delete())
        {
          LOG.log(Level.WARNING, "failed to delete file " + contentFile.getAbsolutePath());
        }
        FileUtil.cleanDirectory(mediaFolder);
        if (!mediaFolder.delete())
        {
          LOG.log(Level.WARNING, "failed to delete folder " + mediaFolder);
        }

        // Delete the temporary folder for converting during upload and background upgrade after finished the editing conversion job.
        if (uploadConvertFolder != null)
        {
          FileUtil.cleanDirectory(uploadConvertFolder);
        }
        if (upgradeConvertFolder != null)
        {
          FileUtil.cleanDirectory(upgradeConvertFolder);
        }
      }
    }
    LOG.exiting(CLASS_NAME, "importDocumentByUploadConvert", new Object[] { entry.getDocUri() });
    return null;
  }

  public IDocumentEntry importDocumentByUpgradeConvert(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters)
      throws Exception
  {

    LOG.entering(CLASS_NAME, "importDocumentByUpgradeConvert", new Object[] { entry.getDocUri() });

    boolean backgroundConvert = false;

    if (parameters != null)
    {
      backgroundConvert = parameters.backgroundConvert;
    }

    LOG.info("Start to upgrade document " + entry.getDocUri());
    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, entry);
    File upgradeConvertFolder = new File(draftDesc.getTempURI("upgrade"));
    File backgroundConvertRoot = new File(upgradeConvertFolder, getDraftFormatVersion());
    File backgroundConvertSource = new File(backgroundConvertRoot, "src");
    File backgroundConvertTarget = new File(backgroundConvertRoot, "concord");

    JSONObject result = checkBackgroundConvertJob(false, backgroundConvertSource.getPath(), backgroundConvertTarget.getPath(),
        entry.getMimeType());
    if (backgroundConvert)
    {

      // the background upgrade request has sent
      if (result != null)
      {
        LOG.info("The background upgrade request has been submitted");
        return null;
      }

      parameters.backgroundConvertSource = backgroundConvertSource.getPath();
      parameters.backgroundConvertTarget = backgroundConvertTarget.getPath();
    }
    else
    {
      if (result != null)
      {
        // upgrade conversion completed or started
        parameters.backgroundConvertTarget = backgroundConvertTarget.getPath();
        parameters.backgroundConvertResult = result;
      }

    }

    try
    {
      if (DocumentServiceUtil.supportedDocumentMimeType(entry.getMimeType()))
      {
        return convert(caller, entry, parameters, draftDesc, null);
      }
    }
    catch (Exception e)
    {
      throw e;
    }
    finally
    {
      if (!backgroundConvert)
      {
        if (upgradeConvertFolder != null)
        {
          FileUtil.cleanDirectory(upgradeConvertFolder);
        }
      }
    }

    LOG.exiting(CLASS_NAME, "importDocumentByUpgradeConvert", new Object[] { entry.getDocUri() });
    return null;
  }

  public IDocumentEntry importDocumentByNormalConvert(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters)
      throws Exception
  {

    LOG.entering(CLASS_NAME, "importDocumentByNormalConvert", new Object[] { entry.getDocUri() });

    String uploadConvertID = null;
    boolean getSnapshot = false;

    if (parameters != null)
    {
      uploadConvertID = parameters.uploadConvertID;
      getSnapshot = parameters.getSnapshot;
    }

    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, entry);
    File draftTempFolder = new File(draftDesc.getTempURI(null));
    File uploadConvertFolder = null;
    File upgradeConvertFolder = new File(draftTempFolder, "upgrade");
    File mediaFolder = null;

    File seriesDraftTempFolder = null;
    if (entry.getVersionSeriesId() != null && entry.getVersionSeriesUri() != null)
    {
      DraftDescriptor seriesDraftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(draftDesc.getCustomId(),
          entry.getRepository(), entry.getVersionSeriesUri());
      seriesDraftTempFolder = new File(seriesDraftDesc.getTempURI(null));
      uploadConvertFolder = new File(seriesDraftTempFolder, "upload");
    }
    else
    {
      uploadConvertFolder = new File(draftTempFolder, "upload");
    }

    JSONObject backgroundResult = null;
    String backgroundConvertSource = null;
    String backgroundConvertTarget = null;

    if (uploadConvertID != null)
    {
      if (seriesDraftTempFolder != null)
      {// CCM uses version series ID to contain upload convert because there is no draft ID yet at that time
        backgroundConvertSource = seriesDraftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID;
        backgroundConvertTarget = seriesDraftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID
            + File.separator + "concord";
      }
      else
      {
        backgroundConvertSource = draftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID;
        backgroundConvertTarget = draftTempFolder.getAbsolutePath() + File.separator + "upload" + File.separator + uploadConvertID
            + File.separator + "concord";
      }
      backgroundResult = checkBackgroundConvertJob(false, backgroundConvertSource, backgroundConvertTarget, entry.getMimeType());
    }

    mediaFolder = null;

    if (backgroundResult != null)
    {
      // upload conversion completed, need to check the upload conversion result
      parameters.backgroundConvertTarget = backgroundConvertTarget;
      parameters.backgroundConvertResult = backgroundResult;
      mediaFolder = new File(backgroundConvertSource);

      // place a flag file here in the upload root to prevent old upload conversion results been deleted when a new upload conversion is running
      File inEditingFlagFile = new File(uploadConvertFolder, IN_EDITING_FLAG_FILE_NAME);
      try
      {
        FileUtil.nfs_createNewFile(inEditingFlagFile, FileUtil.NFS_RETRY_SECONDS);
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "failed to create file " + inEditingFlagFile.getAbsolutePath());
      }
    }
    else
    {
      mediaFolder = new File(draftTempFolder, UUID.randomUUID().toString());
    }

    FileUtil.nfs_mkdirs(mediaFolder, FileUtil.NFS_RETRY_SECONDS);

    File contentFile = null;
    MediaDescriptor media = null;
    File uploadFolder = null ;
    File uploadContentFile = null ;
    try
    {
      // symphony need the correct extension for conversion
      String ext = FormatUtil.ALL_FORMATS.get(entry.getMimeType());
      contentFile = new File(mediaFolder, "contentfile" + "." + ext);
      if (backgroundResult == null)
      {
        // get upload Id
        String uploadId = generateUploadId(caller, entry, draftDesc);
        // create contentfile under upload
        uploadFolder = new File(draftTempFolder, uploadId);
        uploadContentFile = new File(uploadFolder, "contentfile" + "." + ext);
        if (FileUtil.exists(uploadContentFile))
        {
          FileUtil.nfs_copyFileToFile(uploadContentFile, contentFile, FileUtil.NFS_RETRY_SECONDS);
          LOG.log(Level.FINE, "Copy contentfile {0} to {1} ", new Object[] { uploadContentFile, contentFile });
        }
        else
        {
          media = RepositoryServiceUtil.download(caller, entry, true);

          FileUtil.copyInputStreamToFile(media.getStream(), contentFile);
        }
      }
      if (DocumentServiceUtil.supportedDocumentMimeType(entry.getMimeType()))
      {
        return convert(caller, entry, parameters, draftDesc, contentFile);
      }
    }
    catch (RepositoryAccessException ae)
    {
      if (getSnapshot && mediaFolder != null)
      {
        String targetPath = mediaFolder.getAbsolutePath();
        DraftStorageManager.getDraftStorageManager().recordSnapshotErrorResult(draftDesc, targetPath, ae.getErrCode());
      }
      throw ae;
    }
    catch (Exception e)
    {
      throw e;
    }
    finally
    {
      if (media != null)
      {
        media.dispose();
      }
      // Even if it is for snapshot, delete the useless content file
      if (contentFile != null && !contentFile.delete())
      {
        LOG.log(Level.WARNING, "failed to delete file " + contentFile.getAbsolutePath());
      }
      if (!getSnapshot)
      {
        FileUtil.cleanDirectory(mediaFolder);
        if (!mediaFolder.delete())
        {
          LOG.log(Level.WARNING, "failed to delete folder " + mediaFolder);
        }

        // Delete the temporary folder for converting during upload and background upgrade after finished the editing conversion job.
        if (uploadConvertFolder != null)
        {
          FileUtil.cleanDirectory(uploadConvertFolder);
        }
        if (upgradeConvertFolder != null)
        {
          FileUtil.cleanDirectory(upgradeConvertFolder);
        }
      }
      if (uploadContentFile != null && !uploadContentFile.delete())
      {
        LOG.log(Level.WARNING, "failed to delete file " + uploadContentFile.getAbsolutePath());
      }
      if (uploadFolder != null)
      {
        FileUtil.cleanDirectory(uploadFolder);
        if (!uploadFolder.delete())
        {
          LOG.log(Level.WARNING, "failed to delete folder " + uploadFolder);
        }
      }
    }
    LOG.exiting(CLASS_NAME, "importDocumentByNormalConvert", new Object[] { entry.getDocUri() });
    return null;
  }

  private IDocumentEntry convert(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters, DraftDescriptor draftDesc,
      File contentFile) throws Exception
  {
    Map<String, Object> params = new HashMap<String, Object>();
    boolean upgradeConvert = false;
    boolean uploadConvert = false;
    boolean backgroundConvert = false;
    String uploadConvertID = null;
    String backgroundConvertTarget = null;
    JSONObject backgroundResult = null;
    boolean getSnapshot = false;

    if (parameters != null)
    {
      String password = parameters.password;
      if (password != null)
      {
        params.put("filePassword", password);
      }

      upgradeConvert = parameters.upgradeConvert;
      uploadConvert = parameters.uploadConvert;
      uploadConvertID = parameters.uploadConvertID;
      backgroundConvertTarget = parameters.backgroundConvertTarget;
      backgroundConvert = parameters.backgroundConvert;
      backgroundResult = parameters.backgroundConvertResult;
      getSnapshot = parameters.getSnapshot;

      params.put(Constant.KEY_UPLOAD_CONVERT, String.valueOf(uploadConvert));
      params.put(Constant.KEY_BACKGROUND_CONVERT, String.valueOf(backgroundConvert));
      params.put(Constant.KEY_UPLOAD_CONVERT_ID, uploadConvertID);
      params.put(Constant.KEY_BACKGROUND_CONVERT_RESULT, backgroundResult);
      // Disable conversion limitation check when import published version of IBM Docs file.
      if (!uploadConvert && !upgradeConvert && entry.isPublished())
      {
        params.put(Constant.KEY_IS_PUBLISHED, Boolean.TRUE.toString());
      }
      params.put(Constant.KEY_FIRST_IMPORT, isFirstImport(caller, entry).toString());

    }

    File draftTempFolder = new File(draftDesc.getTempURI(null));
    File convertFolder = new File(draftTempFolder, UUID.randomUUID().toString());

    // create temp draft dir
    FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);

    File tempFolder = null;
    if (backgroundConvert)
    {
      tempFolder = new File(parameters.backgroundConvertSource);
    }
    else
    {
      tempFolder = new File(draftTempFolder, UUID.randomUUID().toString());
    }
    FileUtil.nfs_mkdirs(tempFolder, FileUtil.NFS_RETRY_SECONDS);
    String targetPath = null;
    try
    {
      LOG.info(new ActionLogEntry(caller, Action.CONVERTDOC, entry.getDocUri(), "sourceType: " + entry.getMimeType() + ", targetType: "
          + getTargetMimeType()).toString());
      if (!upgradeConvert)
      {
        File concordFolder = new File(tempFolder, "concord");
        if (backgroundConvertTarget != null && backgroundResult != null)
        {
          // if this is to check upload convert result
          concordFolder = new File(backgroundConvertTarget);
        }

        targetPath = concordFolder.getAbsolutePath();
        if (!FileUtil.exists(concordFolder) && !FileUtil.nfs_mkdirs(concordFolder, FileUtil.NFS_RETRY_SECONDS))
        {
          LOG.log(Level.WARNING, "failed to create directory " + targetPath);
        }

        conversionService.convert(contentFile.getAbsolutePath(), entry.getMimeType(), getTargetMimeType(), targetPath, params);
        String realTargetPath = params.containsKey(ConversionConstants.TARGET_PATH) ? (String) params.get(ConversionConstants.TARGET_PATH)
            : targetPath;

        if (getSnapshot)
        {
          DraftStorageManager.getDraftStorageManager().generateSnapshotFromRepo(draftDesc, entry, realTargetPath);
        }

        if (!uploadConvert && !getSnapshot)
        {
          // Dealing with orphan comments for new uploaded version
          JSONArray commentsList = null;
          boolean orphaned = DocumentServiceUtil.isOrphanCommentsFileType(entry.getExtension());
          if (orphaned && !upgradeConvert)
          {
            commentsList = DocumentServiceUtil.loadComments(draftDesc);
            if (commentsList != null && commentsList.size() != 0)
            {
              commentsList = CommentsDocumentPart.markCommentsOrphaned(commentsList);
            }
          }
          // store to draft
          // filterHtml(concordFolder); // don't do ACF filter here, if this is a origin ODF file, will do acf on conversion side.
          DocumentServiceUtil.storeDraft(caller, entry, realTargetPath, true);
          if (orphaned && !upgradeConvert && commentsList != null)
          {
            CommentsDocumentPart.write(draftDesc, commentsList);
          }
          // for deep detect
          IDocumentEntry newEntry = DocumentServiceUtil.correctFileName(caller, entry);
          return newEntry;
        }
        else
        {
          return entry;
        }
      }
      else
      {
        params.put("upgradeVersion", "true");

        if ((backgroundConvert) || backgroundResult != null)
        {
          targetPath = backgroundConvertTarget;
        }
        else
        {
          targetPath = convertFolder.getAbsolutePath();
        }

        if (backgroundResult == null)
        {
          copyDraftToDir(draftDesc, tempFolder.getAbsolutePath());
        }

        File targetFolder = new File(targetPath);
        if (!FileUtil.exists(targetFolder) && !FileUtil.nfs_mkdirs(targetFolder, FileUtil.NFS_RETRY_SECONDS))
        {
          LOG.log(Level.WARNING, "failed to create directory " + targetPath);
        }
        conversionService.convert(tempFolder.getAbsolutePath(), entry.getMimeType(), getTargetMimeType(), targetPath, params);
        // filterHtml(convertFolder); // don't do ACF filter here, if this is a origin ODF file, will do acf on conversion side.
        if (getSnapshot)
        {
          DraftStorageManager.getDraftStorageManager().generateSnapshotFromRepo(draftDesc, entry, targetPath);
        }
        if (!backgroundConvert && !getSnapshot)
        {
          DocumentServiceUtil.upgradeDraft(caller, entry, targetPath, true);
        }
        return entry;
      }
    }
    catch (ConversionException e)
    {
      DraftStorageManager.getDraftStorageManager().recordSnapshotErrorResult(draftDesc, targetPath, e.getNativeErrorCode());
      throw e;
    }
    catch (IOException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("io error when importing document");
      throw dse;
    }
    catch (ActiveContentProcessorException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("active content filting exception");
      throw dse;
    }
    catch (UnsupportedMimeTypeException e)
    {
      LOG.log(Level.SEVERE, "unsupported mime type when importing document", e);
      throw e;
    }
    catch (DraftDataAccessException e)
    {
      throw e;
    }
    catch (Exception e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("zip/unzip file error or unknown errors when importing document");
      dse.getData().put("draftUri", draftDesc.getInternalURI());
      throw dse;
    }
    finally
    {
      FileUtil.cleanDirectory(convertFolder);
      if (!convertFolder.delete())
      {
        LOG.log(Level.WARNING, "failed to delete folder " + convertFolder);
      }

      if (!backgroundConvert && null != tempFolder)
      {
        // Only delete the conversion target folder for non-uploading conversion jobs.
        FileUtil.cleanDirectory(tempFolder);
        if (!tempFolder.delete())
        {
          LOG.log(Level.WARNING, "failed to delete folder " + tempFolder);
        }
      }
    }
  }

  /**
   * 
   * @param resultFile
   * @return
   * @throws IOException
   */
  private JSONObject parseResultFile(File resultFile) throws IOException
  {
    JSONObject resultJson = null;
    if (FileUtil.exists(resultFile))
    {
      String result = FileUtil.nfs_readFileAsString(resultFile, FileUtil.NFS_RETRY_SECONDS);
      resultJson = JSONObject.parse(result);
    }
    return resultJson;
  }

  /**
   * Check whether there an uploading conversion jobs is running or not. If the status.json file exists in the target folder, means there is
   * an uploading conversion job is running, otherwise there is no uploading conversion job is running, should delete the target folder.
   * 
   * @param uploadConvert
   * @param backgroundConvertSource
   * @param backgroundConvertTarget
   * @param mimeType
   * @return
   */
  private JSONObject checkBackgroundConvertJob(boolean uploadConvert, String backgroundConvertSource, String backgroundConvertTarget,
      String mimeType)
  {
    JSONObject conversionResult = null;
    try
    {
      if (backgroundConvertSource != null && backgroundConvertTarget != null)
      {
        File statusFile = new File(backgroundConvertTarget, ConversionConstants.STATUS_FILE_NAME);
        if (uploadConvert)
        {
          // Do nothing currently.
        }
        else if (!FileUtil.exists(statusFile))
        {
          LOG.log(Level.INFO, "The background conversion job is not started, target folder is: " + backgroundConvertTarget);

          // If there is no status file in the uploading conversion target folder, then should clean the folder.
          // FileUtil.cleanDirectory(new File(backgroundConvertSource));
          FileUtil.cleanDirectory(new File(backgroundConvertTarget));
        }
        else
        {
          LOG.log(Level.INFO, "The background conversion job is started, target folder is: " + backgroundConvertTarget);

          // If there existing status file in the uploading conversion target folder, that mean the uploading conversion job is started.
          String content = FileUtil.nfs_readFileAsString(statusFile, FileUtil.NFS_RETRY_SECONDS);
          conversionResult = JSONObject.parse(content);
          conversionResult.put(ConversionConstants.STATUS_CODE, 202);

          String sharedRoot = ConcordConfig.getInstance().getSharedDataRoot();
          String relativeTargetPath = new Path(sharedRoot, backgroundConvertTarget).resolveToRelativePath();
          relativeTargetPath = "${" + ConcordConfig.getInstance().getSharedDataName() + "}" + relativeTargetPath;
          conversionResult.put(ConversionConstants.TARGET_PATH, relativeTargetPath);

          // Check result.json, for some kinds of conversion errors, ignore uploading conversion job and submit editing conversion job.
          JSONObject resultJson = parseResultFile(new File(backgroundConvertTarget, ConversionConstants.RESULT_FILE_NAME));
          if (resultJson != null)
          {
            boolean isSuccess = ((Boolean) resultJson.get("isSuccess")).booleanValue();
            if (!isSuccess)
            {
              // For any kind of conversion errors, should ignore the uploading conversion job result and submit an editing conversion job.
              conversionResult = null;
              LOG.log(Level.INFO, "The background conversion job failed");
              // If there is no status file in the uploading conversion target folder, then should clean the folder.
              // FileUtil.cleanDirectory(new File(backgroundConvertSource)); // no need to remove the convert source
              FileUtil.cleanDirectory(new File(backgroundConvertTarget));
            }
            else
            {
              LOG.log(Level.INFO, "The background conversion job succeeded");
              boolean isConvertedByCL = isConvertedByCL(backgroundConvertTarget);
              boolean shouldUpgradeOOXMLDraft = FormatUtil.MSOOXML_FORMATS.containsKey(mimeType) && bCLEnbaled && (!isConvertedByCL);
              if (ConcordUtil.checkDraftFormatVersion(backgroundConvertTarget, (String) config.get(DRAFT_FORMAT_VERSION))
                  || shouldUpgradeOOXMLDraft)
              {
                LOG.log(Level.INFO, "The background conversion result need to be upgraded");
                conversionResult = null;
                // If the converted file need to be upgraded, ignore the upload conversion result.
                FileUtil.cleanDirectory(new File(backgroundConvertSource));
                FileUtil.cleanDirectory(new File(backgroundConvertTarget));
              }
            }
          }
          else
          {
            LOG.log(Level.INFO, "The background conversion job is running");
          }
        }
      }
    }
    catch (Throwable ex)
    {
      conversionResult = null;
      LOG.log(Level.WARNING, "Exception happens while checking the background conversion job", ex);
    }
    return conversionResult;
  }

  private IDocumentEntry importDocument2(UserBean user, IDocumentEntry entry, String workingDir, String targetFolder, Map options)
      throws Exception
  {
    LOG.entering(CLASS_NAME, "importDocument2", new Object[] { entry.getDocUri(), targetFolder });

    File mediaFolder = new File(workingDir, UUID.randomUUID().toString());
    try
    {
      FileUtil.nfs_mkdirs(mediaFolder, FileUtil.NFS_RETRY_SECONDS);

      File contentFile = null;
      MediaDescriptor media = null;

      String ext = FormatUtil.ALL_FORMATS.get(entry.getMimeType());
      contentFile = new File(mediaFolder, "contentfile" + "." + ext);
      media = RepositoryServiceUtil.download(user, entry);
      FileUtil.copyInputStreamToFile(media.getStream(), contentFile);

      if (DocumentServiceUtil.supportedDocumentMimeType(entry.getMimeType()))
      {
        File target = new File(targetFolder);
        FileUtil.nfs_mkdirs(target, FileUtil.NFS_RETRY_SECONDS);
        try
        {
          convert(contentFile.getPath(), entry.getMimeType(), this.getTargetMimeType(), targetFolder, new HashMap());
        }
        // catch (ConversionException e)
        // {
        // if (e.getErrCode() == ConversionException.EC_CONV_EXT_CONTENT_MISMATCH)
        // {
        // // deep detect
        // String format = (String)e.getData("correctFormat");
        // if (format != null)
        // {
        // LOG.log(Level.INFO, "Invalid document type, asForma=" + format+", convert again");
        // // convert again
        // ext = format;
        // File newContentFile = new File(mediaFolder, "contentfile" + "." + ext);
        // FileUtil.nfs_renameFile(contentFile, newContentFile, FileUtil.NFS_RETRY_SECONDS);
        // String mimeType = Platform.getMimeType(newContentFile.getPath());
        // IDocumentService ids = DocumentServiceUtil.getDocumentService(mimeType);
        // try
        // {
        // convert(newContentFile.getPath(), mimeType, ((AbstractDocumentService)ids).getTargetMimeType(), targetFolder, new HashMap());
        // }
        // catch(Exception e2)
        // {
        // FileUtil.nfs_cleanDirectory(target, FileUtil.NFS_RETRY_SECONDS);
        // FileUtil.nfs_delete(target, FileUtil.NFS_RETRY_SECONDS);
        // LOG.log(Level.WARNING, "Failed to convert file " + entry, e);
        // throw e2;
        // }
        // }
        // else
        // {
        // FileUtil.nfs_cleanDirectory(target, FileUtil.NFS_RETRY_SECONDS);
        // FileUtil.nfs_delete(target, FileUtil.NFS_RETRY_SECONDS);
        // LOG.log(Level.WARNING, "Failed to convert file " + entry, e);
        // throw e;
        // }
        // }
        // else
        // {
        // FileUtil.nfs_cleanDirectory(target, FileUtil.NFS_RETRY_SECONDS);
        // FileUtil.nfs_delete(target, FileUtil.NFS_RETRY_SECONDS);
        // LOG.log(Level.WARNING, "Failed to convert file " + entry, e);
        // throw e;
        // }
        // }
        catch (ConversionException e)
        {
          throw e;
        }
        catch (UnsupportedMimeTypeException e)
        {
          throw e;
        }
        catch (Exception e)
        {
          DocumentServiceException dse = new DocumentServiceException(e);
          dse.setDefaultErrDetail("failed to convert file");
          dse.getData().put("docUri", entry.getDocUri());
          throw dse;
        }
        finally
        {
          FileUtil.nfs_cleanDirectory(target, FileUtil.NFS_RETRY_SECONDS);
          FileUtil.nfs_delete(target, FileUtil.NFS_RETRY_SECONDS);
        }
      }
      else
        throw new UnsupportedMimeTypeException("Unsupported mime type " + entry.getMimeType());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to convert file " + entry.getDocId(), e);
      throw e;
    }
    finally
    {
      FileUtil.nfs_cleanDirectory(mediaFolder, FileUtil.NFS_RETRY_SECONDS);
      FileUtil.nfs_delete(mediaFolder, FileUtil.NFS_RETRY_SECONDS);
    }

    LOG.exiting(CLASS_NAME, "importDocument2", new Object[] { entry.getDocUri() });
    return entry;
  }

  private Boolean isFirstImport(UserBean caller, IDocumentEntry entry)
  {
    try
    {
      IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
      RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
      IRepositoryAdapter repositoryAdapter = service.getRepository(entry.getRepository());
      IDocumentEntry[] versions;
      versions = repositoryAdapter.getVersions(caller, entry);
      if (versions.length > 1)
        return Boolean.FALSE;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "failed to get document entry", e);
    }
    return Boolean.TRUE;
  }

  private void copyPictures(File tempFolder, File targetConcord)
  {
    File rootPictures = new File(tempFolder, "Pictures");
    if (rootPictures.exists())
    {
      File concordPictures = new File(targetConcord, "Pictures");
      if (!FileUtil.nfs_mkdirs(concordPictures, FileUtil.NFS_RETRY_SECONDS))
      {
        LOG.log(Level.WARNING, "failed to create directory " + concordPictures.getAbsolutePath());
      }
      Set<String> filters = new HashSet<String>();
      filters.add(".svm");
      filters.add("*.wmf");
      filters.add("*.emf");
      FileUtil.nfs_copyDirToDir(rootPictures, concordPictures, filters, FileUtil.NFS_RETRY_SECONDS);
    }
  }

  private String getRealMimeType(File tempFolder)
  {
    BufferedReader reader = null;
    File file = new File(tempFolder, "mimetype");
    try
    {
      reader = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
      String line = reader.readLine();
      return line;
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "file not found " + file.getAbsolutePath(), e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when reading mimetype", e);
    }
    finally
    {
      if (reader != null)
      {
        try
        {
          reader.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "io error when closing buffered reader", e);
        }
      }
    }
    return null;
  }

  protected void filterHtml(File concordFolder) throws FileNotFoundException, ActiveContentProcessorException, IOException
  {
    String HTMLFileName = concordFolder.getAbsolutePath() + File.separator + "content.html";
    String tempFileName = concordFolder.getAbsolutePath() + File.separator + "content.html.new";

    File HTMLFile = new File(HTMLFileName);
    if (HTMLFile.exists())
    {
      FileInputStream old = new FileInputStream(HTMLFileName);
      FileOutputStream newFile = new FileOutputStream(tempFileName);
      ACFUtil.process(old, newFile);
      old.close();
      newFile.close();

      HTMLFile.delete();

      HTMLFile = new File(tempFileName);
      HTMLFile.renameTo(new File(HTMLFileName));

      long start = System.currentTimeMillis();

      String content = FileUtil.readFile(HTMLFileName);
      content = content.replace(BR_TAG_INVALID, TAG_ENCLOSE);
      content = content.replace(IMG_TAG_INVALID, TAG_ENCLOSE);

      HTMLFile.delete();
      FileUtil.writeFile(content, HTMLFileName);

      long end = System.currentTimeMillis();
      LOG.info("Replacing br back costs: " + (end - start));

      HTMLFile = new File(tempFileName);
      HTMLFile.renameTo(new File(HTMLFileName));
    }
  }

  public boolean isSupportedExportMimeType(String mimeType)
  {
    return exportFormats.contains(mimeType);
  }

  public boolean isSupportedExportSourceMimeType(String mimeType)
  {
    return exportSourceFormats.contains(mimeType);
  }

  abstract protected File localizePublishedContent(File contentDir);

  public String export(UserBean caller, IDocumentEntry docEntry, String targetExtension, String cacheDir, Map<String, Object> options,
      DraftDescriptor draftDesc) throws Exception
  {
    if (options == null)
    {
      options = new HashMap<String, Object>();
    }
    options.put("actionType", "export");
    if (draftDesc == null)
    {
      // export from repository
      return exportFromRepository(caller, docEntry, targetExtension, options, cacheDir);
    }
    else
    {
      // export from draft
      return exportFromDraft(caller, docEntry, targetExtension, options, cacheDir, draftDesc);
    }
  }

  protected String exportFromRepository(UserBean caller, IDocumentEntry docEntry, String targetExtension, Map<String, Object> options,
      String cacheDir) throws Exception
  {
    String mimeType = Platform.getMimeType("." + targetExtension);
    // if (isSupportedExportMimeType(mimeType))
    {
      MediaDescriptor media = null;
      media = RepositoryServiceUtil.download(caller, docEntry);

      // if (!isSupportedExportSourceMimeType(media.getMimeType()))
      // throw new UnsupportedMimeTypeException("Unsupported document type");

      String targetFolder = cacheDir;
      String resultPath = null;
      boolean bMobile = false;
      if (options.containsKey("bMobile") && ((String) options.get("bMobile")).equalsIgnoreCase("true"))
        bMobile = true;

      if (bMobile && media.getMimeType().equals(mimeType))
      {
        File resultFile = new File(targetFolder + File.separator + "content." + targetExtension);
        FileUtil.nfs_createNewFile(resultFile, FileUtil.NFS_RETRY_SECONDS);
        FileUtil.copyInputStreamToFile(media.getStream(), resultFile);
        JSONObject checkResult = null;

        checkResult = exceedContentLimit(resultFile, media.getMimeType(), bMobile);

        if (checkResult != null && checkResult.get("result").equals("true"))
        {
          LOG.log(Level.WARNING, "document exceeds content limitation");
          if (!resultFile.delete())
          {
            LOG.log(Level.WARNING, "Failed to delete result file " + resultFile.getAbsolutePath());
          }

          Object errorMsg = checkResult.get("error_message");
          int errorCode = Integer.parseInt((String) checkResult.get("error_code"));
          OutOfCapacityException error = new OutOfCapacityException(errorCode);
          if (errorMsg != null)
            error.setData(errorMsg);
          throw error;
        }

        resultPath = resultFile.getPath();
      }
      else
      {
        File tmpFolder = null;

        try
        {
          tmpFolder = new File(cacheDir, UUID.randomUUID().toString());
          FileUtil.nfs_mkdirs(tmpFolder, FileUtil.NFS_RETRY_SECONDS);

          // if (subCacheLabel != null)
          // {
          // targetFolder = File.separator + subCacheLabel;
          // }

          File tmpFile = new File(tmpFolder, "concord" + System.currentTimeMillis() + "tmp");
          FileUtil.nfs_createNewFile(tmpFile, FileUtil.NFS_RETRY_SECONDS);
          FileUtil.copyInputStreamToFile(media.getStream(), tmpFile);
          JSONObject checkResult = null;

          checkResult = exceedContentLimit(tmpFile, media.getMimeType(), bMobile);

          if (checkResult != null && checkResult.get("result").equals("true"))
          {
            LOG.log(Level.WARNING, "document exceeds content limitation");
            Object errorMsg = checkResult.get("error_message");
            int errorCode = Integer.parseInt((String) checkResult.get("error_code"));
            OutOfCapacityException error = new OutOfCapacityException(errorCode);
            if (errorMsg != null)
              error.setData(errorMsg);
            throw error;
          }

          resultPath = convert(tmpFile.getAbsolutePath(), media.getMimeType(), mimeType, options);
          if (resultPath == null)
          {
            return null;
          }
          media.dispose();

          File tmpResultFile = new File(resultPath);
          if (mimeType.equals(Platform.getMimeType(".html")))
          {
            File tmpResultFolder = tmpResultFile.getParentFile();
            File target = new File(targetFolder);
            FileUtil.nfs_copyDirToDir(tmpResultFolder, target, FileUtil.NFS_RETRY_SECONDS);

            File contentFile = localizePublishedContent(target);
            resultPath = contentFile.getParentFile().getPath();
          }
          else
          {
            FileUtil.nfs_copyFileToDir(tmpResultFile, new File(targetFolder), "content." + targetExtension, FileUtil.NFS_RETRY_SECONDS);
            resultPath = new File(targetFolder + File.separator + "content." + targetExtension).getPath();
          }
        }
        finally
        {
          // remove temp files
          if (tmpFolder != null)
          {
            FileUtil.cleanDirectory(tmpFolder);
            if (!tmpFolder.delete())
            {
              LOG.log(Level.WARNING, "Failed to delete folder " + tmpFolder.getAbsolutePath());
            }
          }
        }
      }
      return resultPath;
    }
  }

  protected String exportFromDraft(UserBean caller, IDocumentEntry docEntry, String targetExtension, Map<String, Object> options,
      String cacheDir, DraftDescriptor draftDesc) throws Exception
  {
    String targetMimeType = Platform.getMimeType("." + targetExtension);
    // if (isSupportedExportMimeType(targetMimeType))
    {
      String sourceMimeType = getTargetMimeType();

      File tempDir = null;
      boolean bCleanTemp = false;
      if (sourceMimeType.equals(targetMimeType))
      {
        tempDir = new File(cacheDir);
      }
      else
      {
        tempDir = new File(cacheDir + File.separator + "temp");
        FileUtil.nfs_mkdirs(tempDir, FileUtil.NFS_RETRY_SECONDS);
        bCleanTemp = true;
      }

      copyLatestContentTo(tempDir, docEntry, draftDesc);

      // prepare parameters
      Map<String, Object> parameters = new HashMap<String, Object>();
      String picturesPath = draftDesc.getURI() + File.separator + "Pictures";
      File picturesFolder = new File(picturesPath);
      if (picturesFolder.exists())
      {
        picturesPath = ConcordUtil.getRelativePath(picturesPath);
        parameters.put("pictureFolder", picturesPath);
      }
      // convert file
      parameters.put("extension", docEntry.getExtension());

      localizePublishedContent(tempDir);

      String resultPath = null;

      if (sourceMimeType.equals(targetMimeType))
      {
        resultPath = tempDir.getPath();
      }
      else
      {
        // IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        // IConversionService.class);
        // resultPath = cvtService.convert(tempDir.getPath(), sourceMimeType, targetMimeType, cacheDir, options);
        options.put("extension", docEntry.getExtension());
        resultPath = convert(tempDir.getPath(), sourceMimeType, targetMimeType, cacheDir, options);
      }

      if (resultPath.endsWith(".zip"))
      {
        ZipUtil.unzip(resultPath, cacheDir);
        File resultFile = new File(resultPath);
        resultFile.delete();
        resultPath = cacheDir;
      }

      if (bCleanTemp)
      {
        // clean temp folder
        FileUtil.nfs_cleanDirectory(tempDir, FileUtil.NFS_RETRY_SECONDS);
        FileUtil.nfs_delete(tempDir, FileUtil.NFS_RETRY_SECONDS);
      }

      return resultPath;
    }
  }

  // temp implement
  protected String convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options)
      throws ConversionException, UnsupportedMimeTypeException
  {
    IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);
    return cvtService.convert(path, sourceType, targetType, targetPath, options);
  }

  protected String convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException,
      UnsupportedMimeTypeException
  {
    IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);
    return cvtService.convert(path, sourceType, targetType, options);
  }

  /**
   * This method will store latest document content to a specific folder, including the content still in memory
   * 
   * @param toFolder
   *          target folder, caller need to ensure the folder exists
   * @param docEntry
   *          The entry of the document
   * @param draftDesc
   *          draft descriptor to the draft storage
   * @throws Exception
   */
  protected final void copyLatestContentTo(File toFolder, IDocumentEntry docEntry, DraftDescriptor draftDesc) throws Exception
  {
    // copy from draft storage to a temp location under cache directory
    // InputStream draftMediaStream = DraftStorageManager.getDraftStorageManager().getDraftMediaAsStream(draftDesc);
    // ZipUtil.unzip(draftMediaStream, toFolder.getPath());
    DraftStorageManager.getDraftStorageManager().getDraftMedia(draftDesc, toFolder.getAbsolutePath());

    // now let's see if there are data in memory
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(docEntry);
    if (docSess != null && docSess.outOfSync())
    {
      // if currently being edited, then use the html from memory
      JSONObject criteria = new JSONObject();
      criteria.put(MessageConstants.CONTENT_STATE_KEY, new JSONObject());
      JSONObject state = docSess.getCurrentState(criteria);
      JSONObject contentState = (JSONObject) state.get(MessageConstants.CONTENT_STATE_KEY);
      storeStateTo(toFolder, contentState);
    }
  }

  public IDocumentEntry createDocumentFromTemplate(UserBean caller, IDocumentEntry entry, String repository, String folderUri,
      JSONObject data) throws Exception
  {
    LOG.entering(CLASS_NAME, "createDocumentFromTemplate", new Object[] { entry.getDocUri(), repository });
    String title = null;
    if (data != null && data.get("newTitle") != null)
      title = (String) data.get("newTitle");

    boolean isExternal = MediaDescriptor.DEFAULT_IS_EXTERNAL_VALUE;
    boolean propagate = MediaDescriptor.DEFAULT_PROPAGATE_VALUE;
    Object ext = (data != null) ? data.get("isExternal") : null;
    Object pro = (data != null) ? data.get("propagate") : null;
    if (ext != null)
      isExternal = ext instanceof Boolean ? ((Boolean) ext).booleanValue() : Boolean.parseBoolean((String) ext);
    if (pro != null)
      propagate = pro instanceof Boolean ? ((Boolean) pro).booleanValue() : Boolean.parseBoolean((String) pro);

    String contextType = (data != null) ? (String) data.get("contextType") : null;
    String contextValue = (data != null) ? (String) data.get("contextValue") : null;
    String contextFolder = (data != null) ? (String) data.get("contextFolder") : null;

    File convertFolder = new File(CONVERSION_FOLDER, UUID.randomUUID().toString());
    FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);

    MediaDescriptor media = null;
    MediaDescriptor newMedia = null;
    IDocumentEntry newEntry = null;
    try
    {
      media = RepositoryServiceUtil.download(caller, entry);
      // avoid non-English file name cause conversion failure
      File file = new File(convertFolder, "template_internal_use." + entry.getExtension());
      FileUtil.copyInputStreamToFile(media.getStream(), file);
      Map<String, Object> parameters = new HashMap<String, Object>();
      parameters.put("fromTemplate", "true");
      String resultPath = conversionService.convert(file.getAbsolutePath(), entry.getMimeType(), getTargetMimeType(), parameters);
      File convertedFile = new File(resultPath);

      if (title == null)
      {
        title = entry.getTitle();
      }

      String fileName = convertedFile.getName();
      int lastIndex = fileName.lastIndexOf(".");
      if (lastIndex != -1 && lastIndex != fileName.length() - 1)
      {
        title = title + fileName.substring(lastIndex);
      }
      else
      {
        String format = getDefaultFormat(caller);
        title = title + "." + getDefaultExtension(format);
      }

      String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(convertedFile);
      MediaOptions options = new MediaOptions(contextType, contextValue);
      newMedia = new MediaDescriptor(title, mimeType, new FileInputStream(convertedFile), isExternal, propagate, options);

      if (folderUri == null)
      {
        newEntry = RepositoryServiceUtil.upload(caller, repository, newMedia);
      }
      else
      {
        if ("personal".equals(contextFolder))
        {
          newEntry = RepositoryServiceUtil.upload(caller, repository, newMedia);
        }
        else
        {
          newEntry = RepositoryServiceUtil.upload4Community(caller, repository, folderUri, newMedia);
        }
      }
      // get draft directory
      DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, newEntry);

      // get upload Id
      String uploadId = generateUploadId(caller, newEntry, draftDesc);
      // create temp directory
      File uploadTemp = new File(draftDesc.getTempURI(uploadId));
      FileUtil.nfs_mkdirs(uploadTemp, FileUtil.NFS_RETRY_SECONDS);

      String uploadContentExt = FormatUtil.ALL_FORMATS.get(newEntry.getMimeType());
      // copy file to temp upload folder
      File uploadContentFile = new File(uploadTemp, "contentfile" + "." + uploadContentExt);
      FileUtil.nfs_copyFileToFile(convertedFile, uploadContentFile, FileUtil.NFS_RETRY_SECONDS);
      LOG.log(Level.FINE, "Copy contentfile to {0} ", new Object[] { uploadTemp });
    }
    catch (RepositoryAccessException e)
    {
      throw e;
    }
    catch (FileNotFoundException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("file not found");
      throw dse;
    }
    catch (ConversionException e)
    {
      throw e;
    }
    catch (Exception e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("unknow error happened");
      throw dse;
    }
    finally
    {
      if (media != null)
      {
        media.dispose();
      }
      if (newMedia != null)
      {
        newMedia.dispose();
      }
      FileUtil.cleanDirectory(convertFolder);
      if (!convertFolder.delete())
      {
        LOG.log(Level.WARNING, "failed to delete folder " + convertFolder.getAbsolutePath());
      }

      FileUtil.cleanDirectory(convertFolder);
      if (!convertFolder.delete())
      {
        LOG.log(Level.WARNING, "failed to delete folder " + convertFolder.getAbsolutePath());
      }
    }
    LOG.exiting(CLASS_NAME, "createDocumentFromTemplate", new Object[] { entry.getDocUri(), repository });
    return newEntry;
  }

  public JSONObject getConfig()
  {
    return config;
  }

  public boolean isTransformCandidate(JSONObject baseMsg, JSONObject msg)
  {
    String clientId1 = (String) baseMsg.get("client_id");
    String clientId2 = (String) msg.get("client_id");
    if (!clientId1.equals(clientId2))
    {
      return true;
    }
    return false;
  }

  public void clearup(DraftDescriptor draftDes)
  {
  }

  public void preSaveDraft(DraftDescriptor draftDescriptor)
  {
  }

  public void postSaveDraft(DraftDescriptor draftDescriptor, long savedSequence)
  {
  }

  /**
   * Do something before publish
   */
  public void prePublish(DraftDescriptor draftDescriptor, IDocumentEntry docEntry, File convertFolder)
  {
  }

  /**
   * Each document service implementation store their current state to a specified folder
   * 
   * @param toFolder
   *          folder where to store
   * @param contentState
   *          contains the state of the document
   * @throws Exception
   */
  protected abstract void storeStateTo(File toFolder, JSONObject contentState) throws Exception;

  protected abstract String getTargetMimeType();

  protected abstract String getTemplateMimeType();

  protected abstract void createTemplateDocument(JSONObject data, File concordFolder) throws DocumentServiceException;

  protected abstract String getTemplateExtension();

  public abstract String getDraftFormatVersion();

  protected abstract String getServiceName();

  /**
   * This implementation will be called when the draft is about to be published or saved as another file in the repository.
   */
  protected abstract void cleanHeadlessImage(IDocumentEntry docEntry, UserBean caller);
  protected abstract void disableAndCleanTrackChange(File folder);

  protected String getDefaultMimeType(String format)
  {
    String mimeType = format2Mimetype.get(format);
    if (mimeType != null)
    {
      return mimeType;
    }
    return format2Mimetype.get(MS_FORMAT_MANE);
  }

  protected String getDefaultExtension(String format)
  {
    String extension = format2Extension.get(format);
    if (extension != null)
    {
      return extension;
    }
    return format2Extension.get(MS_FORMAT_MANE);
  }

  public void processLeaveData(UserBean caller, String docId, JSONObject data)
  {
  }

  public JSONObject processSuspiciousContent(JSONObject message)
  {
    return message;
  }

  /**
   * temp implementation before each editor has its own method
   */
  public JSONObject exceedContentLimit(DraftDescriptor draftDes)
  {
    JSONObject json = new JSONObject();
    json.put("result", "false");
    json.put("error_code", "1501");
    json.put("error_message", "10240");
    return json;
  }

  protected JSONObject exceedContentLimit(File file, String mimeType, boolean bMobile) throws Exception
  {
    JSONObject json = new JSONObject();
    json.put("result", "false");
    // json.put("result", "true");
    // json.put("error_code", "1501");
    // json.put("error_message", "10240");

    return json;
  }

  protected String getDefaultFormat(UserBean user)
  {
    UserSettingsBean bean = new UserSettingsBean(user, getServiceName());
    return bean.getFileFormat();
  }

  private boolean isConvertedByCL(String draftURI)
  {
    String tagFilePath = draftURI + IDraftStorageAdapter.separator + "odfdraft";
    return !(new File(tagFilePath).exists());
  }
  
  /**
   * @param caller : user 
   * @param newEntry : document entry
   * @param draftDesc : document description 
   * @return upload id 
   */
  private String generateUploadId(UserBean caller, IDocumentEntry newEntry, DraftDescriptor draftDesc)
  {
    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
    jContext.mediaURI = newEntry.getDocUri();
    jContext.sourceMime = newEntry.getMimeType();
    jContext.targetMime = "";
    jContext.modified = newEntry.getModified().getTimeInMillis();
    jContext.docEntry = newEntry;
    return jContext.getJobId();
  }

}
