/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.exception.DraftTransactionException;
import com.ibm.concord.draft.exception.IllegalDraftStateException;
import com.ibm.concord.draft.internal.StatefulDraftUtil;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.draft.state.DraftState;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.platform.listener.IDraftListener;
import com.ibm.concord.revision.service.RevisionService;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.draft.IDraftDeserializer;
import com.ibm.concord.spi.draft.IDraftJSONObjectDeserializer;
import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.concord.spi.draft.IDraftSerializer;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.concord.spi.draft.IDraftStorageAdapterFactory;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.util.IStorageAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.WorkManager;
/**
 * 
 * @author Li Wang, wliwang@cn.ibm.com
 * 
 */
public class DraftStorageManager
{
  public static final Logger LOGGER = Logger.getLogger(DraftStorageManager.class.getName());

  public static final int PRIMARY_MAX_SLOT = 1024;

  public static final int SECONDARY_MAX_SLOT = 1024;

  // The max integer value of a JavaScript variable is 2^53(0x20000000000000L).
  private static final long MAX_SEQ_VALUE = 0x20000000000000L;

  final private static DraftStorageManager draftStorageManager = new DraftStorageManager(true);

  final private static DraftStorageManager draftStorageManagerWithoutCriticalSection = new DraftStorageManager(false);

  private String DRAFT_HOME;

  private String DRAFT_TEMP_HOME;

  private static final String DRAFT_LOCK_FILE_LABEL = "draft.lck";

  private static final String DRAFT_MSG_FILE_LABEL = "msg.json";

  private static final String DRAFT_META_FILE_LABEL = "meta.json";

  private static final String DRAFT_COMMENTS_LABEL = "Reserved";

  private static final String DRAFT_COMMENTS_LABEL2 = "comments.js";

  private static final String BASE_SEQ_KEY = "base_seq";

  private static final String MSGS_KEY = "msgs";

  private static final String RESULT_FILE_NAME = "result.json";

  private static final String SNAPSHOT_TIMESTAMP = "snapshot_timestamp";

  private static final String SNAPSHOT_READABLE_TAG = "readable.tag";
  
  private static final String REPO_TYPE_EXTERNAL_REST = "external.rest";

  private boolean enableCriticalSection;

  private boolean viewerSnapshotEnabled;

  private IDraftStorageAdapterFactory storageAdapterFactory;

  private static List<IDraftListener> listeners;

  private static Set<String> EXCLUDE_FILE_SET = new HashSet<String>();

  static
  {
    EXCLUDE_FILE_SET.add("odfdraft");
    EXCLUDE_FILE_SET.add("ooxmldraft");
    EXCLUDE_FILE_SET.add("Reserved");
    EXCLUDE_FILE_SET.add("indextable");
  }

  private static final FilenameFilter SNAPSHOT_FILTER = new FilenameFilter()
  {
    public boolean accept(File dir, String file)
    {
      return !EXCLUDE_FILE_SET.contains(file);
    }
  };

  /**
   * Get the DraftStorageManager instance, which will ensure access to draft storage in thread safe manner.
   * 
   * @return, the thread safe storage manager.
   */
  public static DraftStorageManager getDraftStorageManager()
  {
    return getDraftStorageManager(true);
  }

  /**
   * Get the DraftStorageManager instance, with the option of enable critical section or not.
   * 
   * getDraftStorageManager(true) equals to getDraftStorageManager()
   * 
   * @param enableCriticalSection
   *          , false returns with a none thread safe DraftStorageManager.
   * @return the thread safe storage manager or none thread safe storage manager.
   */
  public static DraftStorageManager getDraftStorageManager(boolean enableCriticalSection)
  {
    if (enableCriticalSection)
    {
      return draftStorageManager;
    }
    else
    {
      return draftStorageManagerWithoutCriticalSection;
    }
  }
  

  
  public static String getRepoTypeFromId(String repoId)
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryProviderRegistry.class);
    if (repoId == null)
    {
      try {
        repoId = RepositoryProviderRegistry.getInstance().getDefaultId();
      } catch(Exception e) {
        LOGGER.log(Level.INFO, "Could not get default repository id", e);
        return null;
      }
    }
    IRepositoryAdapter repoAdapter = service.getRepository(repoId);
    if (repoAdapter != null)
    {
      return repoAdapter.getRepoType();
    }
    return null;
  }  

  private DraftStorageManager(boolean enableCriticalSection)
  {
    this.enableCriticalSection = enableCriticalSection;
    DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
    DRAFT_HOME = draftComp.getDraftHome();
    DRAFT_TEMP_HOME = DRAFT_HOME + IDraftStorageAdapter.separator + "draft_temp";
    storageAdapterFactory = (IDraftStorageAdapterFactory) draftComp.getService(IDraftStorageAdapterFactory.class);
    IDraftListener draftRevisionListener = RevisionService.getInstance().getDraftListener();
    addListener(draftRevisionListener);

    JSONObject config = Platform.getConcordConfig().getSubConfig("viewersnapshot");
    if (config != null && config.get("enabled") != null)
    {
      this.viewerSnapshotEnabled = Boolean.parseBoolean(config.get("enabled").toString());
    }
    else
    {
      this.viewerSnapshotEnabled = false;
    }

    if (this.enableCriticalSection)
    {
      LOGGER.log(Level.INFO, "Viewer Snapshot feature enabled state is " + this.viewerSnapshotEnabled);
    }
  }

  public boolean viewerSnapshotEnabled()
  {
    return this.viewerSnapshotEnabled;
  }

  public void addListener(IDraftListener listener)
  {
    if (listener == null)
      return;
    if (listeners == null)
      listeners = new ArrayList<IDraftListener>();

    if (!listeners.contains(listener))
      listeners.add(listener);
  }

  public void notifyListener(DraftActionEvent event)
  {
    if (listeners != null)
    {
      for (IDraftListener listener : listeners)
      {
        listener.actionDone(event);
      }
    }
  }

  /**
   * Retrieve the draft descriptor for the specified document.
   * 
   * @param customId
   *          , the customer id string.
   * @param docId
   *          , the UUID string of the document. Typically, this id is given by external file repositories.
   * @param repository
   *          , the repository of this document.
   * @return
   */
  public DraftDescriptor getDraftDescriptor(String customId, String repository, String docUri)
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftDescriptor", new Object[] { customId, repository, docUri });

    String[] hash = hash(docUri);    
    String repoType = getRepoTypeFromId(repository);
    IDraftStorageAdapter customerHome = null;
    
    if( repoType != null && repoType.equals(REPO_TYPE_EXTERNAL_REST) )
    {
      IDraftStorageAdapter repoTypeHome = storageAdapterFactory.newDraftAdapter(DRAFT_HOME, repository);
      customerHome = storageAdapterFactory.newDraftAdapter(repoTypeHome, customId);      
    }
    else
    {
      customerHome = storageAdapterFactory.newDraftAdapter(DRAFT_HOME, customId);
    }
    
    IDraftStorageAdapter draftInnerHome = storageAdapterFactory.newDraftAdapter(customerHome, "draft");
    IDraftStorageAdapter primaryHashHome = storageAdapterFactory.newDraftAdapter(draftInnerHome, hash[0]);
    IDraftStorageAdapter secondaryHashHome = storageAdapterFactory.newDraftAdapter(primaryHashHome, hash[1]);
    IDraftStorageAdapter draftDespDir = storageAdapterFactory.newDraftAdapter(secondaryHashHome, docUri);

    LOGGER.exiting(DraftStorageManager.class.getName(), "getDraftDescriptor", draftDespDir.getPath());

    return new DraftDescriptor(customId, repository, docUri, draftDespDir.getPath(), hash);
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

    LOGGER.log(Level.FINEST, "Primary Hash of DOC [" + docUri + "]: " + result[0]);
    LOGGER.log(Level.FINEST, "Secondary Hash of DOC [" + docUri + "]: " + result[1]);

    return result;
  }

  /**
   * 
   * @param draftDescriptor
   * @param section
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public SectionDescriptor getSectionDescriptor(DraftDescriptor draftDescriptor, DraftSection section) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    return new SectionDescriptor(draftDescriptor, section);
  }

  /**
   * 
   * @param draftDescriptor
   * @param mediaStream
   * @param meta
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public void newDraft(final DraftDescriptor draftDescriptor, final InputStream mediaStream, final Map<DraftMetaEnum, Object> meta)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "newDraft", new Object[] { draftDescriptor, meta });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        draftStorageManagerWithoutCriticalSection.openDraft(draftDescriptor, mediaStream, meta, false);
        draftStorageManagerWithoutCriticalSection.closeDraft(draftDescriptor);
        Map<String, String> data = new HashMap<String, String>();
        data.put("version", (String) meta.get(DraftMetaEnum.DRAFT_BASE_VERSION));
        data.put("modifier", (String) meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID));
        DraftActionEvent event = new DraftActionEvent(draftDescriptor, DraftAction.IMPORT, data);
        draftStorageManagerWithoutCriticalSection.notifyListener(event);
        LOGGER.log(Level.FINE, "Draft Newly Created. {0}", draftDescriptor);

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "newDraft");
  }

  public void newDraft(final DraftDescriptor draftDescriptor, final String mediaFolder, final Map<DraftMetaEnum, Object> meta,
      final boolean isMove) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "newDraft", new Object[] { draftDescriptor, meta });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        draftStorageManagerWithoutCriticalSection.openDraft(draftDescriptor, mediaFolder, meta, isMove, false);
        draftStorageManagerWithoutCriticalSection.closeDraft(draftDescriptor);
        Map<String, String> data = new HashMap<String, String>();
        data.put("version", (String) meta.get(DraftMetaEnum.DRAFT_BASE_VERSION));
        data.put("modifier", (String) meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID));
        DraftActionEvent event = new DraftActionEvent(draftDescriptor, DraftAction.IMPORT, data);
        draftStorageManagerWithoutCriticalSection.notifyListener(event);
        LOGGER.log(Level.FINE, "Draft Newly Created. {0}", draftDescriptor);

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "newDraft");
  }

  public void restoreDraft(final DraftDescriptor draftDescriptor, final String mediaFolder, final Map<DraftMetaEnum, Object> meta,
      final boolean isMove, final String revision) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "restoreDraft", new Object[] { draftDescriptor, meta });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        draftStorageManagerWithoutCriticalSection.openDraft(draftDescriptor, mediaFolder, meta, isMove, false);
        draftStorageManagerWithoutCriticalSection.closeDraft(draftDescriptor);
        Map<String, String> data = new HashMap<String, String>();
        data.put("restoreVersion", revision);
        DraftActionEvent event = new DraftActionEvent(draftDescriptor, DraftAction.REVRESTORE, data);
        draftStorageManagerWithoutCriticalSection.notifyListener(event);
        LOGGER.log(Level.FINE, "Draft Restored For. {0}", draftDescriptor);

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "restoreDraft");
  }

  public void upgradeDraft(final DraftDescriptor draftDescriptor, final String mediaFolder, final Map<DraftMetaEnum, Object> meta,
      final boolean isMove) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "upgradeDraft", new Object[] { draftDescriptor, meta });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        draftStorageManagerWithoutCriticalSection.openDraft(draftDescriptor, mediaFolder, meta, isMove, false);
        draftStorageManagerWithoutCriticalSection.closeDraft(draftDescriptor);
        // notify draft is upgraded
        LOGGER.log(Level.FINE, "Draft Upgraded. {0}", draftDescriptor);

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "upgradeDraft");
  }

  /**
   * Check the last transaction state, if the state was BEGIN_STATE, then roll back the last transaction, if the state was COMMITTING_STATE,
   * then continue to commit the transaction.
   * 
   * @param draftDescriptor
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  private void checkDraftTransaction(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    if (draftDescriptor != null && !draftDescriptor.getInTransacting())
    {
      try
      {
        DraftTransaction transaction = new DraftTransaction(draftDescriptor);
        transaction.check();
      }
      catch (DraftTransactionException ex)
      {
        throw new DraftStorageAccessException(draftDescriptor, ex);
      }
    }
  }

  private void openDraft(DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    openDraft(draftDescriptor, false);
  }

  private void openDraft(DraftDescriptor draftDescriptor, boolean isFinal) throws DraftStorageAccessException, DraftDataAccessException
  {
    DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, isFinal);
    if (draftState.getStateId() == DraftState.NONE_STATE)
    {
      DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
          + draftState.getStateId()));
      dsae.setDefaultErrDetail("Open Draft Failed due to incorrect draft state");
      throw dsae;
    }

    openDraft(draftDescriptor, null, null, isFinal);
  }

  private void openDraft(final DraftDescriptor draftDescriptor, final Object media, final Map<DraftMetaEnum, Object> meta, boolean isFinal)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    openDraft(draftDescriptor, media, meta, false, isFinal);
  }

  /**
   * Create the draft for the specified document and draft media located in the specified uri. Draft state will switch from NONE to ACTIVE.
   * 
   * Invoke of this method will lock the draft until call finished.
   * 
   * Accepted State: NONE INACTIVE
   * 
   * @param draftDescriptor
   *          , the document id of the published document for the creating draft.
   * @param media
   *          , the uri of draft media. Only "file:///" protocol based URI supported or it is an InputStream instance.
   * @param meta
   *          , the initial meta of the newly created draft.
   * @param isMove
   *          specifies whether move the files to draft media folder, or just copy the files to draft media
   * @param isFinal
   *          specifies whether initialize the draft status in the memory.
   * @throws DraftStorageAccessException
   *           , exception when access draft media storage.
   * @throws DraftDataAccessException
   *           , exception when access draft meta-data database.
   * @throws IllegalDraftStateException
   *           , a runtime exception, draft state not accepted.
   */
  private void openDraft(final DraftDescriptor draftDescriptor, final Object media, final Map<DraftMetaEnum, Object> meta,
      final boolean isMove, final boolean isFinal) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "openDraft", new Object[] { draftDescriptor, meta });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        // Check the last transaction state.
        checkDraftTransaction(draftDescriptor);

        if (media != null && meta != null)
        {
          getDraftStorageManager(false).discardDraft(draftDescriptor);
        }

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, isFinal);
        if (draftState.getStateId() == DraftState.NONE_STATE)
        {
          OutputStream metaFileStream = null;
          OutputStream resultJsonFileStream = null;
          try
          {
            {
              JSONObject draftMeta = new JSONObject();
              draftMeta.put(DraftMetaEnum.CUSTOMER_ID.getMetaKey(), draftDescriptor.getCustomId());
              draftMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), draftDescriptor.getDocId());

              String date = AtomDate.valueOf(Calendar.getInstance()).getValue();

              if (meta != null && meta.get(DraftMetaEnum.DRAFT_SYNC_STATE) != null)
              {
                draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), (Boolean) meta.get(DraftMetaEnum.DRAFT_SYNC_STATE));
              }
              else
              {
                draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), Boolean.TRUE);
              }

              if (meta != null && meta.get(DraftMetaEnum.DRAFT_LAST_VISIT) != null)
              {
                draftMeta.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), (String) meta.get(DraftMetaEnum.DRAFT_LAST_VISIT));
              }
              else
              {
                draftMeta.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), date);
              }

              if (meta != null && meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED) != null)
              {
                draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey(), (String) meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED));
              }
              else
              {
                draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey(), date);
              }

              if (meta != null && meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID) != null)
              {
                draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey(), (String) meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID));
              }
              else
              {
                draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey(), "");
              }

              if (meta != null && meta.get(DraftMetaEnum.DRAFT_CREATED) != null)
              {
                draftMeta.put(DraftMetaEnum.DRAFT_CREATED.getMetaKey(), (String) meta.get(DraftMetaEnum.DRAFT_CREATED));
              }
              else
              {
                draftMeta.put(DraftMetaEnum.DRAFT_CREATED.getMetaKey(), date);
              }

              {
                draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), meta.get(DraftMetaEnum.MIME));
                draftMeta.put(DraftMetaEnum.REPOSITORY_ID.getMetaKey(), meta.get(DraftMetaEnum.REPOSITORY_ID));
                draftMeta.put(DraftMetaEnum.TITLE.getMetaKey(), meta.get(DraftMetaEnum.TITLE));
                draftMeta.put(DraftMetaEnum.EXT.getMetaKey(), meta.get(DraftMetaEnum.EXT));
                draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf((Calendar) meta.get(DraftMetaEnum.LAST_MODIFIED))
                    .getValue());
                draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), meta.get(DraftMetaEnum.DRAFT_BASE_VERSION));
                draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey(), meta.get(DraftMetaEnum.BASE_CONTENT_HASH));
              }
              metaFileStream = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL)
                  .getOutputStream();
              draftMeta.serialize(metaFileStream, true);

              // generate a default result.json for creating new files
              if (!FileUtil.exists(new File(draftDescriptor.getURI(), RESULT_FILE_NAME)))
              {
                JSONObject resultJson = new JSONObject();
                resultJson.put("isSuccess", true);
                resultJsonFileStream = storageAdapterFactory.newDraftAdapter(draftDescriptor.getURI(), RESULT_FILE_NAME).getOutputStream();
                resultJson.serialize(resultJsonFileStream, true);
                resultJsonFileStream.close();// must close immediately, because conversion result maybe overwrite this file
              }
            }

            if (media instanceof InputStream)
            {
              ZipUtil.unzip(new AutoCloseInputStream((InputStream) media), draftDescriptor.getURI());
            }
            else if (media instanceof String)
            {
              if (isMove)
              {
                FileUtil.nfs_MoveDirToDir(new File((String) media), new File(draftDescriptor.getURI()), FileUtil.NFS_RETRY_SECONDS);
              }
              else
              {
                FileUtil.copyDirToDir((String) media, draftDescriptor.getURI());
              }
            }
            else
            {
              DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("media: "
                  + media.getClass().getName()));
              dsae.setDefaultErrDetail("Open Draft Failed due to illegal draft media");
              throw dsae;
            }

            draftState.toActive(draftDescriptor);
          }
          catch (IOException e)
          {
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Open Draft Failed due to meta/result.json file initialization or media/result.json files population failed");
            throw dsae;
          }
          finally
          {
            if (metaFileStream != null)
            {
              try
              {
                metaFileStream.close();
              }
              catch (IOException e)
              {
                DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
                dsae.setDefaultErrDetail("Closing meta file OutputStream error");
                throw dsae;
              }
            }
          }
        }
        else if (draftState.getStateId() == DraftState.INACTIVE_STATE)
        {
          draftState.toActive(draftDescriptor);
        }
        else if (draftState.getStateId() == DraftState.ACTIVE_STATE)
        {
          ; // Do nothing here, but return directly.
        }
        else
        {
          LOGGER.log(Level.SEVERE, "Unknown Draft State Detected.  {0} {1}", new Object[] { draftDescriptor, draftState.getStateId() });
          throw new IllegalStateException();
        }

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "openDraft");
  }

  public boolean isDraftExisted(final DraftDescriptor draftDescriptor, final boolean checkTransaction) throws DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "isDraftExisted", new Object[] { draftDescriptor });

    Boolean result = null;
    try
    {
      result = (Boolean) new CriticalSection()
      {
        protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
        {
          // Check the last transaction state.
          if(checkTransaction){
            checkDraftTransaction(draftDescriptor);
          }

          DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
          if (draftState.getStateId() == DraftState.NONE_STATE)
          {
            return Boolean.FALSE;
          }
          else
          {
            return Boolean.TRUE;
          }
        }
      }.execute(draftDescriptor);
    }
    catch (DraftStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "DraftStorageManager Internal Error. {0} {1}", new Object[] { draftDescriptor, e });
      throw new IllegalStateException(e);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "isDraftExisted", result);

    return result.booleanValue();
  }
  
  public boolean isDraftExisted(final DraftDescriptor draftDescriptor) throws DraftDataAccessException{
    return isDraftExisted(draftDescriptor, true);
  }

  public boolean isDraftDirty(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "isDraftDirty", new Object[] { draftDescriptor });

    Boolean result = null;
    try
    {
      result = (Boolean) new CriticalSection()
      {
        protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
        {
          // Check the last transaction state.
          checkDraftTransaction(draftDescriptor);

          DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
          if (draftState.getStateId() == DraftState.NONE_STATE)
          {
            return Boolean.FALSE;
          }

          // getDraftStorageManager(false).openDraft(draftDescriptor);

          // draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
          // if (draftState.getStateId() != DraftState.ACTIVE_STATE)
          // {
          // LOGGER.log(Level.SEVERE, "Get Draft Sync Status Failed due to incorrect draft state. {0} {1}", new Object[] { draftDescriptor,
          // draftState.getStateId() });
          // getDraftStorageManager(false).closeDraft(draftDescriptor);
          // throw new DraftStorageAccessException(draftDescriptor, new IllegalStateException());
          // }

          Boolean result = Boolean.valueOf(!getDraftSyncState(draftDescriptor));

          // getDraftStorageManager(false).closeDraft(draftDescriptor);

          LOGGER.log(Level.FINE, "Draft Sync Status Out. {0}", draftDescriptor);
          return result;
        }
      }.execute(draftDescriptor);
    }
    catch (DraftStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "DraftStorageManager Internal Error. {0} {1}", new Object[] { draftDescriptor, e });
      throw new IllegalStateException(e);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "isDraftDirty", result);

    return result;
  }

  public boolean isDraftValid(final DraftDescriptor draftDescriptor, final IDocumentEntry docEntry) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "isDraftValid", new Object[] { draftDescriptor, docEntry });

    Boolean result = (Boolean) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        // Check the last transaction state.
        checkDraftTransaction(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() == DraftState.NONE_STATE)
        {
          LOGGER.log(Level.FINE, "Draft is Invalid. {0}", draftDescriptor);

          return Boolean.FALSE;
        }
        else if (draftState.getStateId() == DraftState.INACTIVE_STATE)
        {
          JSONObject draftMeta = null;
          IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);

          if (!metaFile.assertExistsFile())
          {
            LOGGER.log(Level.SEVERE, "Draft Meta File Missing. {0} {1}", new Object[] { draftDescriptor, metaFile.getPath() });
            throw new IllegalDraftStateException(draftDescriptor);
          }

          try
          {
            draftMeta = JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
            draftDescriptor.setDraftMetaSnapshot(draftMeta);
          }
          catch (IOException e)
          {
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Read draft meta file error");
            ddae.getData().put("metaFile", metaFile.getPath());
            throw ddae;
          }

          Map<DraftMetaEnum, Object> oldMeta = new HashMap<DraftMetaEnum, Object>();
          oldMeta.put(DraftMetaEnum.CUSTOMER_ID, draftMeta.get(DraftMetaEnum.CUSTOMER_ID.getMetaKey()));
          oldMeta.put(DraftMetaEnum.DOC_ID, draftMeta.get(DraftMetaEnum.DOC_ID.getMetaKey()));
          String oldBaseVersion = (String) draftMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey());
          oldMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION, oldBaseVersion);
          oldMeta.put(DraftMetaEnum.BASE_CONTENT_HASH, draftMeta.get(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey()));
          // oldMeta.put(DraftMetaEnum.SYNC_STATE, draftMeta.get(DraftMetaEnum.SYNC_STATE.getMetaKey()));
          // oldMeta.put(DraftMetaEnum.LAST_VISIT, draftMeta.get(DraftMetaEnum.LAST_VISIT.getMetaKey()));
          // oldMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED, draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()));
          oldMeta.put(DraftMetaEnum.MIME, draftMeta.get(DraftMetaEnum.MIME.getMetaKey()));
          oldMeta.put(DraftMetaEnum.REPOSITORY_ID, draftMeta.get(DraftMetaEnum.REPOSITORY_ID.getMetaKey()));
          oldMeta.put(DraftMetaEnum.EXT, draftMeta.get(DraftMetaEnum.EXT.getMetaKey()));
          Calendar oldLastModified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey())).getCalendar();
          oldMeta.put(DraftMetaEnum.LAST_MODIFIED, oldLastModified);

          Map<DraftMetaEnum, Object> newMeta = new HashMap<DraftMetaEnum, Object>();
          newMeta.put(DraftMetaEnum.CUSTOMER_ID, draftDescriptor.getCustomId());
          newMeta.put(DraftMetaEnum.DOC_ID, draftDescriptor.getDocId());
          String newBaseVersion = docEntry.getVersion();
          newMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION, newBaseVersion);
          newMeta.put(DraftMetaEnum.MIME, docEntry.getMimeType());
          newMeta.put(DraftMetaEnum.REPOSITORY_ID, docEntry.getRepository());
          newMeta.put(DraftMetaEnum.EXT, docEntry.getExtension());
          Calendar newLastModified = docEntry.getModified();
          newMeta.put(DraftMetaEnum.LAST_MODIFIED, docEntry.getModified());

          if (oldLastModified.getTimeInMillis() < newLastModified.getTimeInMillis() || !newBaseVersion.equalsIgnoreCase(oldBaseVersion))
          {
            draftDescriptor.setDraftOutOfDate(true);
            LOGGER.log(Level.INFO,
                "Draft is out of Date: draft version {0}, draft last modified {1}; document version {2}, document last modified {3}.",
                new Object[] { oldBaseVersion, oldLastModified.getTimeInMillis(), newBaseVersion, newLastModified.getTimeInMillis() });
          }
          else
          {
            draftDescriptor.setDraftOutOfDate(false);
          }

          boolean isValid = MessageDigest.isEqual(MD5(newMeta), MD5(oldMeta));

          LOGGER.log(Level.FINE, "#########################################################");
          LOGGER.log(Level.FINE, "Old Modified: " + AtomDate.valueOf((Calendar) oldMeta.get(DraftMetaEnum.LAST_MODIFIED)).getValue());
          LOGGER.log(Level.FINE, "New Modified: " + AtomDate.valueOf((Calendar) newMeta.get(DraftMetaEnum.LAST_MODIFIED)).getValue());
          LOGGER.log(Level.FINE, "Old Base Version: " + oldMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION));
          LOGGER.log(Level.FINE, "New Base Version: " + newMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION));
          LOGGER.log(Level.FINE, "Old MIME: " + oldMeta.get(DraftMetaEnum.MIME));
          LOGGER.log(Level.FINE, "New MIME: " + newMeta.get(DraftMetaEnum.MIME));
          LOGGER.log(Level.FINE, "Old EXT: " + oldMeta.get(DraftMetaEnum.EXT));
          LOGGER.log(Level.FINE, "New EXT: " + newMeta.get(DraftMetaEnum.EXT));
          LOGGER.log(Level.FINE, isValid ? "Draft is Valid. {0}" : "Draft is Invalid. {0}", draftDescriptor);
          LOGGER.log(Level.FINE, "#########################################################");

          return Boolean.valueOf(isValid);
        }
        else if (draftState.getStateId() == DraftState.ACTIVE_STATE)
        {
          LOGGER.log(Level.FINE, "Draft is Valid. {0}", draftDescriptor);

          return Boolean.TRUE;
        }
        else
        {
          LOGGER.log(Level.SEVERE, "Unknown Draft State Detected. {0} {1}", new Object[] { draftDescriptor, draftState.getStateId() });
          throw new IllegalStateException();
        }
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "isDraftValid", result);

    return result.booleanValue();
  }

  public boolean isContentHashSyncedWithRepo(final DraftDescriptor draftDescriptor, final IDocumentEntry docEntry)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "isDraftSizeSynced", new Object[] { draftDescriptor, docEntry });

    Boolean result = (Boolean) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        // Check the last transaction state.
        checkDraftTransaction(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() == DraftState.NONE_STATE)
        {
          LOGGER.log(Level.FINE, "Draft is Invalid. {0}", draftDescriptor);

          return Boolean.FALSE;
        }
        else if (draftState.getStateId() == DraftState.INACTIVE_STATE)
        {
          JSONObject draftMeta = null;
          IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);

          if (!metaFile.assertExistsFile())
          {
            LOGGER.log(Level.SEVERE, "Draft Meta File Missing. {0} {1}", new Object[] { draftDescriptor, metaFile.getPath() });
            throw new IllegalDraftStateException(draftDescriptor);
          }

          try
          {
            draftMeta = JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
            draftDescriptor.setDraftMetaSnapshot(draftMeta);
          }
          catch (IOException e)
          {
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Read draft meta file error");
            ddae.getData().put("metaFile", metaFile.getPath());
            throw ddae;
          }

          String oldBaseHash = (String) draftMeta.get(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey());
          String newBaseHash = docEntry.getContentHash();

          boolean isValid = true;
          if (!oldBaseHash.equalsIgnoreCase(newBaseHash))
          {
            isValid = false;
            draftDescriptor.setDraftOutOfDate(true);
            LOGGER.log(Level.INFO, "Draft is out of Date: draft hash {0}, document hash {1}.", new Object[] { oldBaseHash, newBaseHash });
          }
          else
          {
            draftDescriptor.setDraftOutOfDate(false);
          }

          return Boolean.valueOf(isValid);
        }
        else if (draftState.getStateId() == DraftState.ACTIVE_STATE)
        {
          LOGGER.log(Level.FINE, "Draft is Valid. {0}", draftDescriptor);

          return Boolean.TRUE;
        }
        else
        {
          LOGGER.log(Level.SEVERE, "Unknown Draft State Detected. {0} {1}", new Object[] { draftDescriptor, draftState.getStateId() });
          throw new IllegalStateException();
        }
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "isDraftSizeSynced", result);

    return result.booleanValue();
  }

  /**
   * Retrieve the draft media for the specified draft. This method will directly pass out the draft media InputStream.
   * 
   * @param draftDescriptor
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public JSONObject getDraftMediaAsJSONObjectWithFixCheck(final DraftDescriptor draftDescriptor,
      final IDraftJSONObjectDeserializer deserializer, final IDocumentService docService) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMediaAsJSONObjectWithFixCheck", new Object[] { draftDescriptor, deserializer });

    JSONObject result = (JSONObject) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Media Failed due to incorrect draft state");
          throw dsae;
        }

        JSONObject result = null;
        try
        {
          result = deserializer.deserialize(draftDescriptor);

          if (docService.isDraftNeedFix(draftDescriptor, result))
          {
            result = docService.fixDraft(draftDescriptor, result);

            IDraftJSONObjectSerializer ser = docService.getJSONSerializer();
            if (ser != null)
            {
              Map<String, JSONObject> toSaveData = docService.getFixedDraftSectionPair(draftDescriptor, result);
              if (toSaveData != null)
              {
                Set<String> paths = toSaveData.keySet();
                for (String path : paths)
                {
                  DraftSection ds = new DraftSection(path);
                  storeJSONDraftInternal(draftDescriptor, toSaveData.get(path), ser, ds);
                }
              }
            }
          }
        }
        catch (Exception e)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
          dsae.setDefaultErrDetail("Deserialize draft media error");
          throw dsae;
        }

        getDraftStorageManager(false).closeDraft(draftDescriptor, true);

        LOGGER.log(Level.FINE, "Draft Media Out As JSONObject. {0}", draftDescriptor);

        return result;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "deserializer", result);

    return result;
  }

  /**
   * Retrieve the draft media for the specified draft. This method will directly pass out the draft media InputStream.
   * 
   * @param draftDescriptor
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public JSONObject getDraftMediaAsJSONObject(final DraftDescriptor draftDescriptor, final IDraftJSONObjectDeserializer deserializer)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMediaAsJSONObject", new Object[] { draftDescriptor, deserializer });

    JSONObject result = (JSONObject) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Media Failed due to incorrect draft state");
          throw dsae;
        }

        JSONObject result = null;

        try
        {
          result = deserializer.deserialize(draftDescriptor);
        }
        catch (Exception e)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          if(e instanceof ConcordException)
          {
            if(((ConcordException)e).getErrCode() == 9999)
            {
              DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e, 9999);
              dsae.setDefaultErrDetail(draftDescriptor.getDocId() + " file is too large");
              throw dsae;
            }
          }
          else
          {
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Deserialize draft media error");
            throw dsae;            
          }
        }

        getDraftStorageManager(false).closeDraft(draftDescriptor, true);

        LOGGER.log(Level.FINE, "Draft Media Out As JSONObject. {0}", draftDescriptor);

        return result;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "deserializer", result);

    return result;
  }

  /**
   * Retrieve the draft media for the specified draft, returned as a specific draft model object.
   * 
   * @param draftDescriptor
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public Object getDraftMediaAsObject(final DraftDescriptor draftDescriptor, final IDraftDeserializer deserializer)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMediaAsObject", new Object[] { draftDescriptor, deserializer });

    Object result = new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Media Failed due to incorrect draft state");
          throw dsae;
        }

        Object result = null;

        try
        {
          result = deserializer.deserialize(draftDescriptor);
        }
        catch (Exception e)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
          dsae.setDefaultErrDetail("Deserialize draft media error");
          throw dsae;
        }

        getDraftStorageManager(false).closeDraft(draftDescriptor, true);

        LOGGER.log(Level.FINE, "Draft Media Out As Object. {0}", draftDescriptor);

        return result;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "getDraftMediaAsObject", result);

    return result;
  }

  /**
   * Retrieve the draft media for the specified draft. This method will directly pass out the draft media to the target folder.
   * 
   * @param draftDescriptor
   *          draft descriptor.
   * @param targetFolder
   *          target folder used to store draft copy.
   * @param filter
   *          file filter for this copy.
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public String getDraftMedia(final DraftDescriptor draftDescriptor, final String targetFolder, final FilenameFilter filter)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMedia", new Object[] { draftDescriptor, filter, targetFolder });

    String tempMediaUri = (String) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Media Failed due to incorrect draft state");
          throw dsae;
        }

        FileUtil.nfs_copyDirToDir(new File(draftDescriptor.getURI()), new File(targetFolder), filter, FileUtil.NFS_RETRY_SECONDS);

        getDraftStorageManager(false).closeDraft(draftDescriptor, true);

        LOGGER.log(Level.FINE, "Draft Media Out As SAFE InputStream. {0}", draftDescriptor);
        return targetFolder;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "getDraftMedia", tempMediaUri);

    return tempMediaUri;
  }

  /**
   * 
   * @param draftDescriptor
   * @param targetFolder
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public String getDraftMedia(final DraftDescriptor draftDescriptor, final String targetFolder) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMedia", new Object[] { draftDescriptor, targetFolder });

    String tempMediaUri = (String) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Media Failed due to incorrect draft state");
          throw dsae;
        }

        FileUtil.nfs_copyDirToDir(new File(draftDescriptor.getURI()), new File(targetFolder), FileUtil.NFS_RETRY_SECONDS);

        getDraftStorageManager(false).closeDraft(draftDescriptor, true);

        LOGGER.log(Level.FINE, "Draft Media Out As SAFE InputStream. {0}", draftDescriptor);
        return targetFolder;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "getDraftMedia", tempMediaUri);

    return tempMediaUri;
  }

  /**
   * Retrieve the draft media for the specified draft. This method will read draft content from the draft media and return uri of the draft
   * media.
   * 
   * @param draftDescriptor
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public String getDraftMedia(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMedia", new Object[] { draftDescriptor });

    String tempMedia = (String) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Media Failed due to incorrect draft state");
          throw dsae;
        }

        if (enableCriticalSection)
        {
          IDraftStorageAdapter tempHome = storageAdapterFactory.newDraftAdapter(DRAFT_TEMP_HOME);
          tempHome.mkdirs();
          String tempMediaUri = storageAdapterFactory.newDraftAdapter(DRAFT_TEMP_HOME, UUID.randomUUID().toString()).getPath();

          String[] mediaFiles = getMediaFileList(draftDescriptor);
          if (mediaFiles.length == 0)
          {
            LOGGER.log(Level.SEVERE, "Draft Media Files Missing. {0} {1}", new Object[] { draftDescriptor, mediaFiles });
            getDraftStorageManager(false).closeDraft(draftDescriptor, true);
            throw new IllegalDraftStateException(draftDescriptor);
          }

          try
          {
            ZipUtil.zip(mediaFiles, tempMediaUri);
          }
          catch (Exception e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor, true);
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Package draft media files error");
            dsae.setArrayData("mediaFiles", mediaFiles);
            dsae.getData().put("tempMediaUri", tempMediaUri);
            throw dsae;
          }

          getDraftStorageManager(false).closeDraft(draftDescriptor, true);

          LOGGER.log(Level.FINE, "Draft Media Out As SAFE ZIP URI. {0}", draftDescriptor);
          return tempMediaUri;
        }
        else
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor, true);

          LOGGER.log(Level.FINE, "Draft Media Out As URI. {0}", draftDescriptor);
          return draftDescriptor.getURI();
        }
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "getDraftMedia", tempMedia);

    return tempMedia;
  }

  public JSONObject getDraftMeta(final DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getDraftMeta", new Object[] { draftDescriptor });

    JSONObject metaObj = null;
    try
    {
      metaObj = (JSONObject) new CriticalSection()
      {
        protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
        {
          getDraftStorageManager(false).openDraft(draftDescriptor, true);

          DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, true);
          if (draftState.getStateId() != DraftState.ACTIVE_STATE)
          {
            LOGGER.log(Level.SEVERE, "Get Draft Meta Failed due to incorrect draft state. {0} {1}", new Object[] { draftDescriptor,
                draftState.getStateId() });
            getDraftStorageManager(false).closeDraft(draftDescriptor, true);
            throw new DraftStorageAccessException(draftDescriptor, new IllegalStateException());
          }

          JSONObject metaObject = null;
          IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);

          if (!metaFile.assertExistsFile())
          {
            LOGGER.log(Level.SEVERE, "Draft Meta File Missing. {0} {1}", new Object[] { draftDescriptor, metaFile.getPath() });
            getDraftStorageManager(false).closeDraft(draftDescriptor, true);
            throw new IllegalDraftStateException(draftDescriptor);
          }

          try
          {
            metaObject = JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor, true);
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Read draft meta file error");
            ddae.getData().put("metaFile", metaFile.getPath());
            throw ddae;
          }

          getDraftStorageManager(false).closeDraft(draftDescriptor, true);

          LOGGER.log(Level.FINE, "Draft Meta Out. {0}", draftDescriptor);
          return metaObject;
        }
      }.execute(draftDescriptor);
    }
    catch (DraftStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "DraftStorageManager Internal Error. {0} {1}", new Object[] { draftDescriptor, e });
      throw new IllegalStateException(e);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "getDraftMeta", metaObj);

    return metaObj;
  }

  public void setDraftMeta(final DraftDescriptor draftDescriptor, final JSONObject draftMeta) throws DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "setDraftMeta", new Object[] { draftDescriptor, draftMeta });

    try
    {
      new CriticalSection()
      {
        protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
        {
          getDraftStorageManager(false).openDraft(draftDescriptor);

          DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
          if (draftState.getStateId() != DraftState.ACTIVE_STATE)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor);
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
                + draftState.getStateId()));
            dsae.setDefaultErrDetail("Set Draft Meta Failed due to incorrect draft state");
            throw dsae;
          }

          OutputStream metaFileStream = null;
          try
          {
            InputStream metaFileInStream = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL)
                .getInputStream();
            JSONObject oldMeta = JSONObject.parse(new AutoCloseInputStream(metaFileInStream));

            boolean updated = false;
            if (draftMeta.get(DraftMetaEnum.DOC_ID.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), draftMeta.get(DraftMetaEnum.DOC_ID.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.MIME.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.MIME.getMetaKey(), draftMeta.get(DraftMetaEnum.MIME.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.TITLE.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.TITLE.getMetaKey(), draftMeta.get(DraftMetaEnum.TITLE.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.EXT.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.EXT.getMetaKey(), draftMeta.get(DraftMetaEnum.EXT.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.REPOSITORY_ID.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.REPOSITORY_ID.getMetaKey(), draftMeta.get(DraftMetaEnum.REPOSITORY_ID.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), draftMeta.get(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.DRAFT_CREATED.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DRAFT_CREATED.getMetaKey(), draftMeta.get(DraftMetaEnum.DRAFT_CREATED.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), draftMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey(), draftMeta.get(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey(), draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey(),
                  draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey()));
              updated = updated || true;
            }

            if (draftMeta.get(DraftMetaEnum.CUSTOMER_ID.getMetaKey()) != null)
            {
              oldMeta.put(DraftMetaEnum.CUSTOMER_ID.getMetaKey(), draftMeta.get(DraftMetaEnum.CUSTOMER_ID.getMetaKey()));
              updated = updated || true;
            }
            if (oldMeta.containsKey("meta_damaged"))
            {
              oldMeta.remove("meta_damaged");
              updated = true;
            }

            if (updated)
            {
              metaFileStream = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL)
                  .getOutputStream();
              oldMeta.serialize(metaFileStream, true);
            }
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor);
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Read or write draft meta file error");
            throw ddae;
          }
          finally
          {
            if (metaFileStream != null)
            {
              try
              {
                metaFileStream.close();
              }
              catch (IOException e)
              {
                getDraftStorageManager(false).closeDraft(draftDescriptor);
                DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
                ddae.setDefaultErrDetail("Closing meta file OutputStream error");
                throw ddae;
              }
            }
          }

          getDraftStorageManager(false).closeDraft(draftDescriptor);

          LOGGER.log(Level.FINE, "Draft Meta In. {0}", draftDescriptor);
          return null;
        }
      }.execute(draftDescriptor);
    }
    catch (DraftStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "DraftStorageManager Internal Error. {0} {1}", new Object[] { draftDescriptor, e });
      throw new IllegalStateException(e);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "setDraftMeta");
  }

  public void saveDraft(final DraftDescriptor draftDescriptor, final long savedSequence, final JSONArray deltaToApply)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    saveDraft(draftDescriptor, savedSequence, deltaToApply, DraftAction.AUTOSAVE);
  }

  /**
   * Accept those deltaChanges, and then save them into the draft media specified in the draft descriptor.
   * 
   * @param draftDescriptor
   * @param savedSequence
   * @param deltaToApply
   *          , messages that can be applied(merge) to content DOM directly
   * @throws DraftStorageAccessException
   *           , exception when access draft media storage.
   * @throws DraftDataAccessException
   *           , exception when access draft meta-data database.
   */
  public void saveDraft(final DraftDescriptor draftDescriptor, final long savedSequence, final JSONArray deltaToApply,
      final DraftAction action) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "saveDraft", new Object[] { draftDescriptor, deltaToApply });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          throw new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: " + draftState.getStateId()));
        }

        DraftTransaction transaction = new DraftTransaction(draftDescriptor);
        try
        {
          IComponent docSrvComp = Platform.getComponent("com.ibm.concord.document.services");
          IDocumentServiceProvider dsp = (IDocumentServiceProvider) docSrvComp.getService(IDocumentServiceProvider.class);
          IDocumentService ds = (IDocumentService) dsp.getDocumentService(getDraftStringMeta(draftDescriptor, DraftMetaEnum.MIME));
          // Begin this transaction.
          transaction.begin();

          if (ds != null)
            ds.preSaveDraft(draftDescriptor);

          JSONObject msgJson = getMsg(draftDescriptor);
          JSONArray messageArray = (JSONArray) msgJson.get(MSGS_KEY);
          if (messageArray == null || messageArray.size() == 0)
          {
            messageArray = deltaToApply;
          }
          else if (deltaToApply != null)
          {
            messageArray.addAll(deltaToApply);
          }

          /*
           * 1. deltaToApply contains messages can be applied to content DOM directly
           */
          applyMsg(draftDescriptor, messageArray, action == DraftAction.CLOSE);

          /*
           * 2. now record document's last saved sequence in msg.json
           */
          storeSavedMsgSeq(draftDescriptor, savedSequence);

          // Commit this transaction.
          DraftActionEvent event = new DraftActionEvent(draftDescriptor, action, messageArray);
          transaction.commit(event);

          // Post save draft
          if (ds != null)
            ds.postSaveDraft(draftDescriptor, savedSequence);
        }
        catch (Exception ex)
        {
          try
          {
            transaction.rollback();
          }
          catch (DraftTransactionException tex)
          {
            LOGGER.log(Level.WARNING, "Exception happens while checking the transaction.", tex);
          }
          throw new DraftStorageAccessException(draftDescriptor, ex);
        }
        finally
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
        }

        LOGGER.log(Level.FINE, "Draft Saved. {0}", draftDescriptor);

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "saveDraft");

    return;
  }

  private void closeDraft(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    closeDraft(draftDescriptor, false);
  }

  /**
   * Close draft specified by the draftDescriptor. Draft state will switch from ACTIVE to INNONE. Draft media will not be cleared until it
   * is cleaned.
   * 
   * Invoke of this method will lock the draft until call finished.
   * 
   * Accepted State: ACTIVE
   * 
   * @param draftDescriptor
   *          , The draft descriptor of the draft being discarded.
   * @throws DraftStorageAccessException
   *           , exception when access draft media storage.
   * @throws DraftDataAccessException
   *           , exception when access draft meta-data database.
   * @throws IllegalDraftStateException
   *           , a runtime exception, , draft state not accepted.
   */
  private void closeDraft(final DraftDescriptor draftDescriptor, final boolean isFinal) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "closeDraft", new Object[] { draftDescriptor });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        try
        {
          DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor, isFinal);
          if (draftState.getStateId() == DraftState.NONE_STATE)
          {
            ;
          }
          else if (draftState.getStateId() == DraftState.INACTIVE_STATE)
          {
            ;
          }
          else if (draftState.getStateId() == DraftState.ACTIVE_STATE)
          {
            // if (!draftDescriptor.getConst())
            // {
            // /*
            // * Can NOT call setDraftCalendarMeta as below directly:
            // *
            // * setDraftCalendarMeta(draftDescriptor, DraftMetaEnum.DRAFT_LAST_VISIT,
            // AtomDate.valueOf(Calendar.getInstance()).getCalendar());
            // *
            // * Because, the closeDraft itself will be called from setDraftCalendarMeta internally when having exceptional cases.
            // */
            // {
            // OutputStream metaFileStream = null;
            // try
            // {
            // IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(),
            // DRAFT_META_FILE_LABEL);
            //
            // JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
            // metaObject.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), AtomDate.valueOf(Calendar.getInstance()).getValue());
            // metaFileStream = metaFile.getOutputStream();
            // metaObject.serialize(metaFileStream, true);
            // }
            // catch (IOException e)
            // {
            // LOGGER.log(Level.SEVERE, "Update Last Visit Timestamp Failed. {0} {1} {2}", new Object[] { draftDescriptor,
            // DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), e });
            // throw new DraftDataAccessException(draftDescriptor, e);
            // }
            // finally
            // {
            // if (metaFileStream != null)
            // {
            // try
            // {
            // metaFileStream.close();
            // }
            // catch (IOException e)
            // {
            // LOGGER.log(Level.WARNING, "Close Draft Meta File Failed during Update Last Visit Timestamp. {0} {1} {2}",
            // new Object[] { draftDescriptor, DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), e });
            // throw new DraftDataAccessException(draftDescriptor, e);
            // }
            // }
            // }
            // }
            // }

            draftState.toInActive(draftDescriptor);
          }
          else
          {
            LOGGER.log(Level.SEVERE, "Unknown Draft State Detected. {0} {1}", new Object[] { draftDescriptor, draftState.getStateId() });
            throw new IllegalStateException();
          }
        }
        finally
        {
          ;
        }

        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "closeDraft");
  }

  /**
   * 
   * @param draftDescriptor
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public void discardDraft(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    discardDraft(draftDescriptor, false);
  }

  /**
   * 
   * @param draftDescriptor
   * @param toOrphan
   *          comments will be kept in the draft
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public void discardDraft(final DraftDescriptor draftDescriptor, final boolean toOrphan) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "discardDraft", new Object[] { draftDescriptor });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        {
          IDraftStorageAdapter draftHome = storageAdapterFactory.newDraftAdapter(draftDescriptor.getURI());
          IStorageAdapter[] subFiles = draftHome.listFiles();
          for (int i = 0; i < subFiles.length; i++)
          {
            if (isContentMediaFile(draftDescriptor, subFiles[i]))
            {
              if (toOrphan && (DRAFT_COMMENTS_LABEL.equals(subFiles[i].getName()) || DRAFT_COMMENTS_LABEL2.equals(subFiles[i].getName())))
              {
                continue;
              }
              subFiles[i].delete();
            }
          }
        }

        {
          resetMsg(draftDescriptor);
        }

        setDraftSyncState(draftDescriptor, true);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
        draftState.toNone(draftDescriptor);

        {
          // Discard the transaction temporary files.
          IDraftStorageAdapter tranDraftHome = storageAdapterFactory.newDraftAdapter(draftDescriptor.getTransInternalURI());
          try
          {
            if (tranDraftHome.exists())
            {
              tranDraftHome.clean();
            }
          }
          catch (IOException e)
          {
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Exception happens while clean the draft transaction directory");
            dsae.getData().put("transInternalURI", draftDescriptor.getTransInternalURI());
            throw dsae;
          }
        }

        DraftActionEvent event = new DraftActionEvent(draftDescriptor, DraftAction.DISCARD, null);
        DraftStorageManager.getDraftStorageManager().notifyListener(event);

        LOGGER.log(Level.INFO, "Draft Discarded. {0}", draftDescriptor);
        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "discardDraft");
  }

  /**
   * 
   * @param sourceDescriptor
   * @param targetDescriptor
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public boolean transferDraft(final DraftDescriptor sourceDescriptor, final DraftDescriptor targetDescriptor)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "transferDraft", new Object[] { sourceDescriptor, targetDescriptor });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sourceDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(sourceDescriptor);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sourceDescriptor);
          DraftStorageAccessException dsae = new DraftStorageAccessException(sourceDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Transfer Draft Failed due to incorrect draft state");
          throw dsae;
        }

        try
        {
          JSONObject draftMeta = getDraftStorageManager(false).getDraftMeta(sourceDescriptor);
          draftMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), targetDescriptor.getDocId());
          draftMeta.put(DraftMetaEnum.CUSTOMER_ID.getMetaKey(), targetDescriptor.getCustomId());
          getDraftStorageManager(false).setDraftMeta(sourceDescriptor, draftMeta);
        }
        catch (DraftDataAccessException e)
        {
          e.getData().put("sourceTransInternalURI", sourceDescriptor.getTransInternalURI());
          getDraftStorageManager(false).closeDraft(sourceDescriptor);
          throw e;
        }

        getDraftStorageManager(false).closeDraft(sourceDescriptor);

        return null;
      }
    }.execute(sourceDescriptor);
    
    final IDraftStorageAdapter sourceDraftHome = storageAdapterFactory.newDraftAdapter(sourceDescriptor.getInternalURI());
    final IDraftStorageAdapter targetDraftHome = storageAdapterFactory.newDraftAdapter(targetDescriptor.getInternalURI());
    targetDraftHome.getParent().mkdirs();
    
    Boolean ret = (Boolean)new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        return Boolean.valueOf(!sourceDraftHome.rename(targetDraftHome));
      }
    }.execute(sourceDescriptor);

    if (!targetDraftHome.getParent().exists() || ret)
    {
      LOGGER.log(Level.SEVERE, "Transfer Draft Failed. {0} {1}", new Object[] { sourceDraftHome.getPath(), targetDraftHome.getPath() });
      if (sourceDraftHome.exists())
      {
        new CriticalSection()
        {
          protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
          {
            getDraftStorageManager(false).openDraft(sourceDescriptor);

            DraftState draftState = StatefulDraftUtil.getDraftState(sourceDescriptor);
            if (draftState.getStateId() != DraftState.ACTIVE_STATE)
            {
              getDraftStorageManager(false).closeDraft(sourceDescriptor);
              DraftStorageAccessException dsae = new DraftStorageAccessException(sourceDescriptor, new IllegalStateException(
                  "draft state: " + draftState.getStateId()));
              dsae.setDefaultErrDetail("Transfer (Back-store) Draft Failed due to incorrect draft state");
              throw dsae;
            }

            try
            {
              JSONObject draftMeta = getDraftStorageManager(false).getDraftMeta(sourceDescriptor);
              draftMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), sourceDescriptor.getDocId());
              draftMeta.put(DraftMetaEnum.CUSTOMER_ID.getMetaKey(), sourceDescriptor.getCustomId());
              getDraftStorageManager(false).setDraftMeta(sourceDescriptor, draftMeta);
            }
            catch (DraftDataAccessException e)
            {
              e.getData().put("sourceTransInternalURI", sourceDescriptor.getTransInternalURI());
              getDraftStorageManager(false).closeDraft(sourceDescriptor);
              throw e;
            }

            getDraftStorageManager(false).closeDraft(sourceDescriptor);

            return null;
          }
        }.execute(sourceDescriptor);
      }

      LOGGER.exiting(DraftStorageManager.class.getName(), "transferDraft", false);
      return false;
    }
    else
    {
      // for id transfer the draft state point to different doc id, need to change old state to None.
      if (!targetDescriptor.getDocId().equals(sourceDescriptor.getDocId()))
      {
        DraftState sourceDraftState = StatefulDraftUtil.getDraftState(sourceDescriptor);
        sourceDraftState.toNone(sourceDescriptor);
      }
      LOGGER.exiting(DraftStorageManager.class.getName(), "transferDraft", true);
      return true;
    }
  }

  /**
   * Get the buffered messages in file msg.json, these messages have not been applied to document content.
   * 
   * @param draftDescriptor
   *          specifies the descriptor of the draft of which want to get the buffered messages
   * @return a JSONObject instance that contains the base sequence and raw messages(String format)
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public JSONObject getBufferredMsg(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getBufferredMsg", new Object[] { draftDescriptor });

    JSONObject result = (JSONObject) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Bufferred Draft Messages Failed due to incorrect draft state");
          throw dsae;
        }

        JSONObject bufMsg = getMsg(draftDescriptor);

        getDraftStorageManager(false).closeDraft(draftDescriptor);

        LOGGER.log(Level.FINE, "Draft Bufferred Messages Out. {0}", draftDescriptor);
        return bufMsg;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "getBufferredMsg", result);

    return result;
  }

  public String getSection(final SectionDescriptor sectionDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getSection", new Object[] { sectionDescriptor });

    String tempMedia = (String) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sectionDescriptor.getDraftDescriptor(), true);

        DraftState draftState = StatefulDraftUtil.getDraftState(sectionDescriptor.getDraftDescriptor(), true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(),
              new IllegalStateException("draft state: " + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Section Failed due to incorrect draft state");
          throw dsae;
        }

        if (enableCriticalSection)
        {
          IDraftStorageAdapter tempHome = storageAdapterFactory.newDraftAdapter(DRAFT_TEMP_HOME);
          tempHome.mkdirs();

          String tempMediaUri = storageAdapterFactory.newDraftAdapter(DRAFT_TEMP_HOME, UUID.randomUUID().toString()).getPath();

          String sectionUri = sectionDescriptor.getSectionUri();
          IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
          if (!sectionFile.exists())
          {
            getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
            return null;
          }
          else if (sectionFile.isFile())
          {
            try
            {
              copy(new AutoCloseInputStream(sectionFile.getInputStream()), storageAdapterFactory.newDraftAdapter(tempMediaUri));
            }
            catch (IOException e)
            {
              getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
              DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(), e);
              dsae.setDefaultErrDetail("Package draft section file error");
              dsae.getData().put("sectionFilePath", sectionFile.getPath());
              dsae.getData().put("tempMediaUri", tempMediaUri);
              throw dsae;
            }
          }
          else if (sectionFile.isFolder())
          {
            try
            {
              IStorageAdapter[] draftFiles = sectionFile.listFiles();
              Vector<String> draftFilesPath = new Vector<String>(draftFiles.length);
              for (int i = 0; i < draftFiles.length; i++)
              {
                draftFilesPath.add(draftFiles[i].getPath());
              }
              ZipUtil.zip(draftFilesPath.toArray(new String[draftFilesPath.size()]), tempMediaUri);
            }
            catch (Exception e)
            {
              getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
              DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(), e);
              dsae.setDefaultErrDetail("Package draft section files error");
              dsae.getData().put("sectionDescriptor", sectionDescriptor.toString());
              dsae.getData().put("sectionFile", sectionFile.getPath());
              dsae.getData().put("tempMediaUri", tempMediaUri);
              throw dsae;
            }
          }
          else
          {
            LOGGER.log(Level.SEVERE, "DraftStorageManager Internal Error. {0} {1}", new Object[] { sectionDescriptor, sectionFile });
            getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
            throw new IllegalStateException("sectionFile is not folder");
          }

          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);

          LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] Out As SAFE URI. {0}",
              sectionDescriptor);
          return tempMediaUri;
        }
        else
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);

          LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] Out As URI. {0}",
              sectionDescriptor);
          return sectionDescriptor.getSectionUri();
        }
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "getSection", tempMedia);

    return tempMedia;
  }

  public JSONArray getSectionAsJSONArray(final SectionDescriptor sectionDescriptor) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getSectionAsJSONArray", new Object[] { sectionDescriptor });

    JSONArray sectionContent = (JSONArray) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sectionDescriptor.getDraftDescriptor(), true);

        DraftState draftState = StatefulDraftUtil.getDraftState(sectionDescriptor.getDraftDescriptor(), true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(),
              new IllegalStateException("draft state: " + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Section (As JSONArray) Failed due to incorrect draft state");
          throw dsae;
        }

        try
        {
          prepareDraftSectionAsJSONArray(sectionDescriptor, false);
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
          ddae.setDefaultErrDetail("Prepare access of getting draft section (as JSONArray) failed");
          throw ddae;
        }

        JSONArray sectionContent = null;

        String sectionUri = sectionDescriptor.getSectionUri();
        IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
        InputStream sectionContentStream;
        try
        {
          sectionContentStream = sectionFile.getInputStream();
          sectionContent = JSONArray.parse(new AutoCloseInputStream(sectionContentStream));
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(), e);
          dsae.setDefaultErrDetail("Get draft section (ss JSONArray) failed");
          throw dsae;
        }

        getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);

        LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] Out as JSONArray. {0}",
            sectionDescriptor);
        return sectionContent;
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "getSectionAsJSONArray", sectionContent);

    return sectionContent;
  }

  public JSONObject getSectionAsJSONObject(final SectionDescriptor sectionDescriptor) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "getSectionAsJSONObject", new Object[] { sectionDescriptor });

    JSONObject sectionContent = (JSONObject) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sectionDescriptor.getDraftDescriptor(), true);

        DraftState draftState = StatefulDraftUtil.getDraftState(sectionDescriptor.getDraftDescriptor(), true);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(),
              new IllegalStateException("draft state: " + draftState.getStateId()));
          dsae.setDefaultErrDetail("Get Draft Section (As JSONObject) Failed due to incorrect draft state");
          throw dsae;
        }

        try
        {
          prepareDraftSectionAsJSONObject(sectionDescriptor, false);
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
          ddae.setDefaultErrDetail("Prepare access of getting draft section (as JSONObject) failed");
          throw ddae;
        }

        JSONObject sectionContent = null;

        String sectionUri = sectionDescriptor.getSectionUri();
        IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
        InputStream sectionContentStream;
        try
        {
          sectionContentStream = sectionFile.getInputStream();
          sectionContent = JSONObject.parse(new AutoCloseInputStream(sectionContentStream));
        }
        catch (IOException e)
        {
          LOGGER.log(Level.SEVERE, "Get Draft Section (As JSONObject) Failed. {0} {1}", new Object[] { sectionDescriptor, e });
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);
          throw new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(), e);
        }

        getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor(), true);

        LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] Out as JSONObject. {0}",
            sectionDescriptor);
        return sectionContent;
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "getSectionAsJSONObject", sectionContent);

    return sectionContent;
  }

  public void storeJSONDraftInternal(final DraftDescriptor draftDescriptor, final JSONObject draftObject,
      final IDraftJSONObjectSerializer serializer, final DraftSection section) throws DraftStorageAccessException, DraftDataAccessException
  {
    List<OutputStream> outStreams = new ArrayList<OutputStream>();
    boolean inTrans = draftDescriptor.getInTransacting();

    try
    {
      SectionDescriptor sd = getSectionDescriptor(draftDescriptor, section);
      String sectionUri = null;
      if (inTrans)
      {
        sectionUri = sd.getSectionTransUri();
      }
      else
      {
        sectionUri = sd.getSectionUri();
      }

      // prepare draft section file
      IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
      if (!sectionFile.exists())
      {
        IStorageAdapter sectionFileDir = sectionFile.getParent();
        if (!sectionFileDir.exists())
        {
          if (!sectionFileDir.mkdirs())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during draft section file preparation. {0} {1}",
                new Object[] { sd, sectionFileDir.getPath() });
            throw new IOException();
          }
          sectionFile.createNewFile();
        }
        else
        {
          sectionFile.createNewFile();
        }
      }

      // open OutputStream
      OutputStream os = sectionFile.getOutputStream();
      serializer.serialize(draftObject, os, null);
    }
    catch (IOException e)
    {
      DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
      ddae.setDefaultErrDetail("Store draft section (from draft object) failed");
      throw ddae;
    }
    finally
    {
      for (Iterator<OutputStream> outIter = outStreams.iterator(); outIter.hasNext();)
      {
        OutputStream outputStream = outIter.next();

        if (outputStream != null)
        {
          try
          {
            outputStream.close();
          }
          catch (IOException e)
          {
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Closing section file OutputStream error");
            throw ddae;
          }
        }
      }
    }
  }

  public void storeDraft(final DraftDescriptor draftDescriptor, final Object draftObject, final IDraftSerializer serializer,
      final List<DraftSection> sections) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "storeDraft", new Object[] { draftDescriptor, serializer });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: "
              + draftState.getStateId()));
          dsae.setDefaultErrDetail("Store draft from object failed due to incorrect draft state");
          throw dsae;
        }

        List<OutputStream> outStreams = new ArrayList<OutputStream>();
        boolean inTrans = draftDescriptor.getInTransacting();

        try
        {
          for (int i = 0; i < sections.size(); i++)
          {
            SectionDescriptor sd = getSectionDescriptor(draftDescriptor, sections.get(i));
            String sectionUri = null;
            if (inTrans)
            {
              sectionUri = sd.getSectionTransUri();
            }
            else
            {
              sectionUri = sd.getSectionUri();
            }

            // prepare draft section file
            IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
            if (!sectionFile.exists())
            {
              IStorageAdapter sectionFileDir = sectionFile.getParent();
              if (!sectionFileDir.exists())
              {
                if (!sectionFileDir.mkdirs())
                {
                  LOGGER.log(Level.SEVERE, "Mkdirs Failed during draft section file preparation. {0} {1}", new Object[] { sd,
                      sectionFileDir.getPath() });
                  throw new IOException();
                }
                sectionFile.createNewFile();
              }
              else
              {
                sectionFile.createNewFile();
              }
            }

            // open OutputStream
            OutputStream os = sectionFile.getOutputStream();
            outStreams.add(os);
          }

          serializer.serialize(draftObject, outStreams);
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
          ddae.setDefaultErrDetail("Store draft section (from draft object) failed");
          throw ddae;
        }
        finally
        {
          for (Iterator<OutputStream> outIter = outStreams.iterator(); outIter.hasNext();)
          {
            OutputStream outputStream = outIter.next();

            if (outputStream != null)
            {
              try
              {
                outputStream.close();
              }
              catch (IOException e)
              {
                getDraftStorageManager(false).closeDraft(draftDescriptor);
                DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
                ddae.setDefaultErrDetail("Closing section file OutputStream error");
                throw ddae;
              }
            }
          }
        }

        getDraftStorageManager(false).closeDraft(draftDescriptor);

        LOGGER.log(Level.FINE, "Serialized draft {0} from a draft object. {1}", new Object[] { draftDescriptor, draftObject });
        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "storeDraft");

    return;
  }

  public void storeSection(final SectionDescriptor sectionDescriptor, final InputStream is) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "storeSection", new Object[] { sectionDescriptor });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sectionDescriptor.getDraftDescriptor());

        DraftState draftState = StatefulDraftUtil.getDraftState(sectionDescriptor.getDraftDescriptor());
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(),
              new IllegalStateException("draft state: " + draftState.getStateId()));
          dsae.setDefaultErrDetail("Store Draft Section Failed due to incorrect draft state");
          throw dsae;
        }

        // If this is in transaction, then output the file into transaction temporary directory.
        String sectionUri = null;
        if (sectionDescriptor.getDraftDescriptor().getInTransacting())
        {
          sectionUri = sectionDescriptor.getSectionTransUri();
        }
        else
        {
          sectionUri = sectionDescriptor.getSectionUri();
        }

        IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
        if (!sectionFile.exists() || sectionFile.isFile())
        {
          try
          {
            if (!sectionFile.exists())
            {
              sectionFile.getParent().mkdirs();
              sectionFile.createNewFile();
            }

            copy(new AutoCloseInputStream(is), sectionFile);
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
            DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(), e);
            dsae.setDefaultErrDetail("Unpackage draft section file error");
            dsae.getData().put("sectionFilePath", sectionFile.getPath());
            throw dsae;
          }
        }
        else if (sectionFile.isFolder())
        {
          try
          {
            ZipUtil.unzip(new AutoCloseInputStream(is), sectionFile.getPath());
          }
          catch (Exception e)
          {
            getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
            DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(), e);
            dsae.setDefaultErrDetail("Unpackage draft section files error");
            dsae.getData().put("sectionFilePath", sectionFile.getPath());
            throw dsae;
          }
        }

        getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());

        DraftActionEvent event = new DraftActionEvent(sectionDescriptor.getDraftDescriptor(), DraftAction.STORESECTION, sectionFile);
        DraftStorageManager.getDraftStorageManager().notifyListener(event);

        LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] In. {0}", sectionDescriptor);
        return null;
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "storeSection");

    return;
  }

  public void storeSectionAsJSONArray(final SectionDescriptor sectionDescriptor, final JSONArray sectionContent)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "storeSectionAsJSONArray", new Object[] { sectionDescriptor, sectionContent });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sectionDescriptor.getDraftDescriptor());

        DraftState draftState = StatefulDraftUtil.getDraftState(sectionDescriptor.getDraftDescriptor());
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(),
              new IllegalStateException("draft state: " + draftState.getStateId()));
          dsae.setDefaultErrDetail("Store Draft Section (As JSONArray) Failed due to incorrect draft state");
          throw dsae;
        }

        try
        {
          prepareDraftSectionAsJSONArray(sectionDescriptor, true);
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
          ddae.setDefaultErrDetail("Prepare access of storing draft section (as JSONArray) failed");
          throw ddae;
        }

        // If this is in transaction, then output the file into transaction temporary directory.
        String sectionUri = null;
        if (sectionDescriptor.getDraftDescriptor().getInTransacting())
        {
          sectionUri = sectionDescriptor.getSectionTransUri();
        }
        else
        {
          sectionUri = sectionDescriptor.getSectionUri();
        }

        IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
        OutputStream sectionContentStream = null;
        try
        {
          sectionContentStream = sectionFile.getOutputStream();
          sectionContent.serialize(sectionContentStream);
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
          ddae.setDefaultErrDetail("Store draft section (as JSONArray) failed");
          ddae.getData().put("sectionContent", sectionContent);
          throw ddae;
        }
        finally
        {
          if (sectionContentStream != null)
          {
            try
            {
              sectionContentStream.close();
            }
            catch (IOException e)
            {
              getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
              DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
              ddae.setDefaultErrDetail("Closing section file OutputStream error");
              ddae.getData().put("sectionUri", sectionUri);
              throw ddae;
            }
          }
        }

        getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());

        LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] In as JSONArray. {0}",
            sectionDescriptor);
        return null;
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "storeSectionAsJSONArray");

    return;
  }

  public void storeSectionAsJSONObject(final SectionDescriptor sectionDescriptor, final JSONObject sectionContent)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    storeSectionAsJSONObject(sectionDescriptor, sectionContent, null);
  }

  public void storeSectionAsJSONObject(final SectionDescriptor sectionDescriptor, final JSONObject sectionContent,
      final IDraftJSONObjectSerializer serializer) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "storeSectionAsJSONObject", new Object[] { sectionDescriptor, sectionContent });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        getDraftStorageManager(false).openDraft(sectionDescriptor.getDraftDescriptor());

        DraftState draftState = StatefulDraftUtil.getDraftState(sectionDescriptor.getDraftDescriptor());
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftStorageAccessException dsae = new DraftStorageAccessException(sectionDescriptor.getDraftDescriptor(),
              new IllegalStateException("draft state: " + draftState.getStateId()));
          dsae.setDefaultErrDetail("Store Draft Section (As JSONObject) Failed due to incorrect draft state");
          throw dsae;
        }

        try
        {
          prepareDraftSectionAsJSONObject(sectionDescriptor, true);
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
          ddae.setDefaultErrDetail("Prepare access of storing draft section (ss JSONObject) failed");
          throw ddae;
        }

        // If this is in transaction, then output the file into transaction temporary directory.
        String sectionUri = null;
        if (sectionDescriptor.getDraftDescriptor().getInTransacting())
        {
          sectionUri = sectionDescriptor.getSectionTransUri();
        }
        else
        {
          sectionUri = sectionDescriptor.getSectionUri();
        }

        IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);
        OutputStream sectionContentStream = null;
        InputStream draftSectionInputStream = null;

        try
        {
          sectionContentStream = sectionFile.getOutputStream();
          if (serializer == null)
          {
            sectionContent.serialize(sectionContentStream);
          }
          else
          {
            File draftSectionFile = new File(sectionDescriptor.getSectionUri());
            if (draftSectionFile.exists())
            {
              draftSectionInputStream = new FileInputStream(draftSectionFile);
              serializer.serialize(sectionContent, sectionContentStream, draftSectionInputStream);
            }
            else
            {
              sectionContent.serialize(sectionContentStream);
            }
          }
        }
        catch (IOException e)
        {
          getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
          DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
          ddae.setDefaultErrDetail("Store draft section (as JSONObject) failed");
          ddae.getData().put("sectionContent", sectionContent);
          throw ddae;
        }
        finally
        {
          if (sectionContentStream != null)
          {
            try
            {
              sectionContentStream.close();
            }
            catch (IOException e)
            {
              getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
              DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
              ddae.setDefaultErrDetail("Closing section file OutputStream error");
              ddae.getData().put("sectionUri", sectionUri);
              throw ddae;
            }
          }

          if (draftSectionInputStream != null)
          {
            try
            {
              draftSectionInputStream.close();
            }
            catch (IOException e)
            {
              getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());
              DraftDataAccessException ddae = new DraftDataAccessException(sectionDescriptor.getDraftDescriptor(), e);
              ddae.setDefaultErrDetail("Closing original draft section file InputStream error");
              ddae.getData().put("sectionUri", sectionDescriptor.getSectionUri());
              throw ddae;
            }
          }
        }

        getDraftStorageManager(false).closeDraft(sectionDescriptor.getDraftDescriptor());

        LOGGER.log(Level.FINE, "Draft Section [" + sectionDescriptor.getSection().getSectionLabel() + "] In as JSONObject. {0}",
            sectionDescriptor);
        return null;
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "storeSectionAsJSONObject");

    return;
  }

  public void discardSection(final SectionDescriptor sectionDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "discardSection", new Object[] { sectionDescriptor });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionDescriptor.getSectionUri());

        if (!sectionFile.delete())
        {
          LOGGER.log(Level.SEVERE, "Discard Draft Section Failed. {0}", new Object[] { sectionDescriptor });
        }

        // Delete the transaction temporary file of this section.
        IDraftStorageAdapter sectionTranFile = storageAdapterFactory.newDraftAdapter(sectionDescriptor.getSectionTransUri());
        if (sectionTranFile.exists())
        {
          if (!sectionTranFile.delete())
          {
            LOGGER.log(Level.SEVERE, "Discard Draft Section Transaction File Failed. {0}", sectionDescriptor.getSectionTransUri());
          }
        }

        LOGGER.log(Level.FINE, "Draft Section Discarded. {0}", sectionDescriptor);
        return null;
      }
    }.execute(sectionDescriptor.getDraftDescriptor());

    LOGGER.exiting(DraftStorageManager.class.getName(), "discardSection");

    return;
  }

  public JSONArray listDraftSections(final DraftDescriptor draftDescriptor, final DraftSection filterSection)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "listDraftSection", new Object[] { draftDescriptor });

    JSONArray sectionList = (JSONArray) new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        // Check the last transaction state.
        checkDraftTransaction(draftDescriptor);

        JSONArray sectionList = new JSONArray();
        IDraftStorageAdapter draftHome = storageAdapterFactory.newDraftAdapter(draftDescriptor.getURI());
        Vector<String> mediaFiles = new Vector<String>();
        collectDraftSections(draftHome, filterSection, mediaFiles);

        for (int i = 0; i < mediaFiles.size(); i++)
        {
          IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(mediaFiles.get(i));

          JSONObject item = new JSONObject();

          item.put("name", sectionFile.getName());
          item.put("size", sectionFile.getSize());

          String absPath = sectionFile.getPath();
          item.put("abs_path", absPath);

          if (!absPath.startsWith(draftDescriptor.getURI()))
          {
            LOGGER.log(Level.SEVERE, "DraftStorageManager Internal Error. {0} {1}", new Object[] { draftDescriptor, absPath });
            throw new IllegalStateException();
          }
          else
          {
            String relPath = absPath.substring(draftDescriptor.getURI().length() + IDraftStorageAdapter.separator.length());
            item.put("rel_path", relPath);
          }

          sectionList.add(item);
        }

        LOGGER.log(Level.FINE, "Draft Section List Fetched. {0}", draftDescriptor);
        return sectionList;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "listDraftSection");

    return sectionList;
  }

  /**
   * This method is used to reset the message base sequence to 0 in "msg.json", so that can avoid the sequence overflow, this method only
   * can be called after applied all the messages and be very careful to call this method in your codes. The max integer value of a
   * JavaScript variable is 2^53(0x20000000000000L).
   * 
   * @param draftDescriptor
   * @return true if reset base sequence successfully, otherwise false
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public boolean resetMsgBaseSeq(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "resetMsgBaseSeq", new Object[] { draftDescriptor });

    Object resultObj = new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        DraftStorageManager dsm = getDraftStorageManager(false);
        dsm.openDraft(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          dsm.closeDraft(draftDescriptor);
          throw new DraftStorageAccessException(draftDescriptor, new IllegalStateException("draft state: " + draftState.getStateId()));
        }

        try
        {
          JSONObject msgJson = getMsg(draftDescriptor);
          long baseSeq = Long.parseLong(msgJson.get(BASE_SEQ_KEY).toString());
          JSONArray msgList = (JSONArray) msgJson.get(MSGS_KEY);
          // Assumes that there are 10 clients will generate 240000(10*120*200) messages in 120(Default LTPA timeout) minutes.
          // Only reset the message base sequence when the base sequence is near the max value and no message is in "msg.json".
          if ((baseSeq > 0 && (MAX_SEQ_VALUE - baseSeq) <= 240000) && (msgList == null || msgList.size() == 0))
          {
            resetMsg(draftDescriptor);
            return Boolean.TRUE;
          }
        }
        catch (Exception ex)
        {
          LOGGER.log(Level.SEVERE, "Error when reset the message base sequence " + draftDescriptor.getInternalURI(), ex);
        }
        finally
        {
          dsm.closeDraft(draftDescriptor);
        }

        return Boolean.FALSE;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "resetMsgBaseSeq");

    return (resultObj instanceof Boolean) ? ((Boolean) resultObj).booleanValue() : false;
  }

  /**
   * Append the messages to the end of draft file msg.json.
   * 
   * @param draftDescriptor
   *          specifies the description of the draft files
   * @param messageArray
   *          specifies the messages being appended
   * @return the number of messages that have been appended successfully
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public int appendMessages(final DraftDescriptor draftDescriptor, final JSONArray messageArray) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "appendMessage", new Object[] { draftDescriptor });

    if (messageArray == null || messageArray.size() == 0)
    {
      LOGGER.exiting(DraftStorageManager.class.getName(), "appendMessages");
      return 0;
    }

    Object resultObj = new CriticalSection()
    {
      /*
       * (non-Javadoc)
       * 
       * @see com.ibm.concord.draft.DraftStorageManager.CriticalSection#perform()
       */
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        DraftStorageManager dsm = getDraftStorageManager(false);
        dsm.openDraft(draftDescriptor);

        DraftState draftState = StatefulDraftUtil.getDraftState(draftDescriptor);
        if (draftState.getStateId() != DraftState.ACTIVE_STATE)
        {
          dsm.closeDraft(draftDescriptor);
          throw new DraftStorageAccessException(draftDescriptor, new IllegalStateException("Draft state: " + draftState.getStateId()));
        }

        int appendedCount = 0;
        OutputStream os = null;
        try
        {
          // Append the messages to the end of file 'msg.json'.
          IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_MSG_FILE_LABEL);
          os = msgFile.getOutputStream4Append();
          int count = messageArray.size();
          StringBuffer buffer = new StringBuffer();
          for (int index = 0; index < count; index++)
          {
            buffer.append(messageArray.get(index).toString());
            buffer.append("\r\n");
            if (buffer.length() > 8196)
            {
              os.write(buffer.toString().getBytes("UTF-8"));
              os.flush();
              appendedCount = index + 1;
              buffer = new StringBuffer();
            }
          }
          if (buffer.length() > 0)
          {
            os.write(buffer.toString().getBytes("UTF-8"));
            os.flush();
            ((FileOutputStream)os).getFD().sync();
          }
          appendedCount = count;

          // mark dirty
          updateDraftCalendarSyncMeta(draftDescriptor, DraftMetaEnum.DRAFT_LAST_MODIFIED, AtomDate.valueOf(Calendar.getInstance())
              .getCalendar(), false);
        }
        catch (Exception ex)
        {
          LOGGER.log(Level.SEVERE, "Error when appending messages to msg.json " + draftDescriptor.getInternalURI(), ex);
        }
        finally
        {
          dsm.closeDraft(draftDescriptor);
          try
          {
            if (os != null)
            {
              os.close();
            }
          }
          catch (Exception ex)
          {
            LOGGER.log(Level.WARNING, "Closing the buffered writer failed. {0} {1}", new Object[] { draftDescriptor, ex });
          }
        }

        return new Integer(appendedCount);
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "appendMessages");

    return (resultObj instanceof Integer) ? ((Integer) resultObj).intValue() : 0;
  }

  abstract class CriticalSection
  {
    public Object execute(DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
    {
      prepareDraftLocker(draftDescriptor);

      synchronized (draftDescriptor)
      {
        IDraftStorageAdapter draftLckFile = null;
        try
        {
          if (enableCriticalSection)
          {
            draftLckFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_LOCK_FILE_LABEL);
            draftLckFile.lock();

            LOGGER.log(Level.FINE, "Draft Lock Acquired : " + draftLckFile.getParent().getName() + " " + draftDescriptor);
          }

          prepareDraftMeta(draftDescriptor);
          prepareDraftMsgBuffer(draftDescriptor);
          prepareDraftTempFolder(draftDescriptor);

          return perform();
        }
        catch (IOException e)
        {
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e,
              DraftStorageAccessException.EC_DRAFTSTORAGE_LOCK_ERROR);
          dsae.setDefaultErrDetail("Error when acquire file lock for draft");
          throw dsae;
        }
        finally
        {
          if (enableCriticalSection)
          {
            if (draftLckFile != null)
            {
              try
              {
                draftLckFile.release();
              }
              catch (IOException e)
              {
                DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
                dsae.setDefaultErrDetail("Release lock file failed");
                throw dsae;
              }
            }

            LOGGER.log(Level.FINE, "Draft Lock Released: " + draftLckFile.getParent().getName() + " " + draftDescriptor);
          }
        }
      }
    }

    protected byte[] MD5(Map<DraftMetaEnum, Object> meta)
    {
      String customId = (String) meta.get(DraftMetaEnum.CUSTOMER_ID);
      String docId = (String) meta.get(DraftMetaEnum.DOC_ID);
      String repoId = (String) meta.get(DraftMetaEnum.REPOSITORY_ID);
      String docMime = (String) meta.get(DraftMetaEnum.MIME);
      String docExt = (String) meta.get(DraftMetaEnum.EXT);
      long lastModified = ((Calendar) meta.get(DraftMetaEnum.LAST_MODIFIED)).getTimeInMillis();
      String version = (String) meta.get(DraftMetaEnum.DRAFT_BASE_VERSION);
      StringBuffer sb = new StringBuffer();
      sb.append(customId);
      sb.append(repoId);
      sb.append(docId);
      sb.append(docMime);
      sb.append(docExt);
      sb.append(lastModified);
      sb.append(version);

      try
      {
        return MessageDigest.getInstance("MD5").digest(sb.toString().getBytes());
      }
      catch (NoSuchAlgorithmException e)
      {
        LOGGER.log(Level.SEVERE, "Can not find Java MD5 algorithm, draft storage damaged.", e);
        throw new IllegalArgumentException(e);
      }
    }

    protected void prepareDraftSectionAsJSONArray(SectionDescriptor sectionDescriptor, boolean forWriting) throws IOException
    {
      // If this is in transaction, then output the file into transaction temporary directory.
      String sectionUri = null;
      if (forWriting && sectionDescriptor.getDraftDescriptor().getInTransacting())
      {
        sectionUri = sectionDescriptor.getSectionTransUri();
      }
      else
      {
        sectionUri = sectionDescriptor.getSectionUri();
      }
      IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);

      if (!sectionFile.exists())
      {
        IStorageAdapter sectionFileDir = sectionFile.getParent();
        if (!sectionFileDir.exists())
        {
          if (!sectionFileDir.mkdirs())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during JSONArray Draft Section File Preparation. {0} {1}", new Object[] {
                sectionDescriptor, sectionFileDir.getPath() });
            throw new IOException();
          }

          sectionFile.createNewFile();
        }
        else
        {
          sectionFile.createNewFile();
        }

        OutputStream sectionStream = null;
        try
        {
          sectionStream = sectionFile.getOutputStream();
          new JSONArray().serialize(sectionStream, true);
        }
        finally
        {
          if (sectionStream != null)
          {
            sectionStream.close();
          }
        }
      }
    }

    protected void prepareDraftSectionAsJSONObject(SectionDescriptor sectionDescriptor, boolean forWritting) throws IOException
    {
      // If this is in transaction, then output the file into transaction temporary directory.
      String sectionUri = null;
      if (forWritting && sectionDescriptor.getDraftDescriptor().getInTransacting())
      {
        sectionUri = sectionDescriptor.getSectionTransUri();
      }
      else
      {
        sectionUri = sectionDescriptor.getSectionUri();
      }
      IDraftStorageAdapter sectionFile = storageAdapterFactory.newDraftAdapter(sectionUri);

      if (!sectionFile.exists())
      {
        IStorageAdapter sectionFileDir = sectionFile.getParent();
        if (!sectionFileDir.exists())
        {
          if (!sectionFileDir.mkdirs())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during JSONObject Draft Section File Preparation. {0} {1}", new Object[] {
                sectionDescriptor, sectionFileDir.getPath() });
            throw new IOException();
          }

          sectionFile.createNewFile();
        }
        else
        {
          sectionFile.createNewFile();
        }

        OutputStream sectionStream = null;
        try
        {
          sectionStream = sectionFile.getOutputStream();
          new JSONObject().serialize(sectionStream, true);
        }
        finally
        {
          if (sectionStream != null)
          {
            sectionStream.close();
          }
        }
      }
    }

    /*
     * used to merge a list of messages to content DOM
     */
    protected void applyMsg(DraftDescriptor draftDescriptor, JSONArray deltaToApply, boolean isClosed) throws DraftStorageAccessException,
        DraftDataAccessException
    {
      IComponent docSrvComp = Platform.getComponent("com.ibm.concord.document.services");
      IDocumentServiceProvider dsp = (IDocumentServiceProvider) docSrvComp.getService(IDocumentServiceProvider.class);
      IDocumentService ds = (IDocumentService) dsp.getDocumentService(getDraftStringMeta(draftDescriptor, DraftMetaEnum.MIME));
      try
      {
        if (deltaToApply != null && deltaToApply.size() > 0)
        {
          ds.applyMessage(draftDescriptor, deltaToApply, isClosed);

          // mark dirty
          updateDraftCalendarSyncMeta(draftDescriptor, DraftMetaEnum.DRAFT_LAST_MODIFIED, AtomDate.valueOf(Calendar.getInstance())
              .getCalendar(), false);
        }
      }
      catch (Exception e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
        dsae.setDefaultErrDetail("Failed to apply messages to document");
        throw dsae;
      }
    }

    /**
     * Update last saved sequence of messages in msg.json.
     * 
     * @param draftDescriptor
     * @param savedSequence
     *          specifies the last saved sequence
     * @throws DraftStorageAccessException
     * @throws DraftDataAccessException
     */
    protected void storeSavedMsgSeq(DraftDescriptor draftDescriptor, long savedSequence) throws DraftStorageAccessException,
        DraftDataAccessException
    {
      String fileUri = draftDescriptor.getInTransacting() ? draftDescriptor.getTransInternalURI() : draftDescriptor.getInternalURI();
      IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(fileUri, DRAFT_MSG_FILE_LABEL);
      BufferedWriter writer = null;
      try
      {
        writer = new BufferedWriter(new OutputStreamWriter(msgFile.getOutputStream()));
        writer.write(String.valueOf(savedSequence));
        writer.newLine();
        writer.flush();
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
        dsae.setDefaultErrDetail("Store saved sequence failed");
        dsae.getData().put("savedSequence", savedSequence);
        throw dsae;
      }
      finally
      {
        if (writer != null)
        {
          try
          {
            writer.close();
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor);
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Close msg.json file stream failed");
            dsae.getData().put("savedSequence", savedSequence);
            throw dsae;
          }
        }
      }
    }

    /*
     * used to return base sequence of content DOM, and kept message list
     */
    protected JSONObject getMsg(DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
    {
      JSONObject msgJson = new JSONObject();
      msgJson.put(BASE_SEQ_KEY, 0);
      msgJson.put(MSGS_KEY, new JSONArray());

      BufferedWriter writer = null;
      BufferedReader reader = null;
      try
      {
        IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_MSG_FILE_LABEL);
        reader = new BufferedReader(new InputStreamReader(new AutoCloseInputStream(msgFile.getInputStream())));

        String line = reader.readLine();
        if ("{".equals(line))
        {
          reader.close();

          // If the first line is '{', then the msg.json is the old format.
          msgJson = JSONObject.parse(new AutoCloseInputStream(msgFile.getInputStream()));

          // Save the messages as new format into msg.json.
          writer = new BufferedWriter(new OutputStreamWriter(msgFile.getOutputStream()));
          writer.write(msgJson.get(BASE_SEQ_KEY).toString());
          writer.newLine();
          JSONArray array = (JSONArray) msgJson.get(MSGS_KEY);
          int count = array != null ? array.size() : 0;
          for (int index = 0; index < count; index++)
          {
            writer.write(array.get(index).toString());
            writer.newLine();
          }
          writer.flush();
        }
        else
        {
          // First line is the base sequence.
          if (line != null && line.length() > 0)
          {
            msgJson.put(BASE_SEQ_KEY, Long.parseLong(line));
          }
          // Next lines are the messages.
          JSONArray messages = new JSONArray();
          while ((line = reader.readLine()) != null)
          {
            if (line.length() > 0)
            {
              messages.add(JSONObject.parse(line));
            }
          }
          msgJson.put(MSGS_KEY, messages);
        }
      }
      catch (NumberFormatException e)
      {
        String draftExpMsg = "Failed to parse base sequence while reading stream for draft : " + draftDescriptor.getInternalURI();
        LOGGER.log(Level.SEVERE, draftExpMsg);
        throw new NumberFormatException(draftExpMsg);
      }
      catch (IOException e)
      {
        // if it's a JSONObject, this might be generated by old code base
        // reset the file to new format
        resetMsg(draftDescriptor);
        // in this case let's return an empty anyway
        msgJson.put(BASE_SEQ_KEY, 0);
        msgJson.put(MSGS_KEY, new JSONArray());
      }
      finally
      {
        try
        {
          if (writer != null)
          {
            writer.close();
          }
          if (reader != null)
          {
            reader.close();
          }
        }
        catch (Exception e)
        {
          LOGGER.log(Level.SEVERE, "Failed to close the writing or reading stream for draft " + draftDescriptor.getInternalURI(), e);
        }
      }

      return msgJson;
    }

    /*
     * used to reset the base sequence to zero, and clear kept message list
     */
    protected void resetMsg(DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
    {
      IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_MSG_FILE_LABEL);
      BufferedWriter writer = null;
      try
      {
        if (!msgFile.exists())
        {
          msgFile.createNewFile();
        }

        // create msg.json for the first time, put base_seq as zero
        writer = new BufferedWriter(new OutputStreamWriter(msgFile.getOutputStream()));
        writer.write('0');
        writer.newLine();
        writer.flush();
      }
      catch (IOException e)
      {
        DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
        dsae.setDefaultErrDetail("Reset Msg File Failed for draft");
        throw dsae;
      }
      finally
      {
        if (writer != null)
        {
          try
          {
            writer.close();
          }
          catch (IOException e)
          {
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Close Msg File Failed during Reset Msg File");
            throw dsae;
          }
        }
      }
    }

    protected boolean isContentMediaFile(DraftDescriptor draftDescriptor, IStorageAdapter aFile)
    {
      if (aFile.getName().equals(DRAFT_LOCK_FILE_LABEL))
      {
        return false;
      }

      if (aFile.getName().equals(DRAFT_MSG_FILE_LABEL))
      {
        return false;
      }

      if (aFile.getName().equals(DRAFT_META_FILE_LABEL))
      {
        return false;
      }

      return true;
    }

    protected String[] getMediaFileList(DraftDescriptor draftDescriptor)
    {
      IDraftStorageAdapter draftHome = storageAdapterFactory.newDraftAdapter(draftDescriptor.getURI());
      IStorageAdapter[] allFiles = draftHome.listFiles();
      if (allFiles != null)
      {
        Vector<String> mediaFiles = new Vector<String>();
        for (int i = 0; i < allFiles.length; i++)
        {
          if (isContentMediaFile(draftDescriptor, allFiles[i]))
          {
            mediaFiles.add(allFiles[i].getPath());
          }
        }
        return (String[]) mediaFiles.toArray(new String[mediaFiles.size()]);
      }
      return null;
    }

    protected void collectDraftSections(IStorageAdapter draftHome, DraftSection filterSection, Vector<String> result)
    {
      IStorageAdapter[] allFiles = draftHome.listFiles();
      for (int i = 0; i < allFiles.length; i++)
      {
        if (allFiles[i].isFile())
        {
          if (filterSection == null)
          {
            result.add(allFiles[i].getPath());
          }
          else
          {
            if (allFiles[i].getPath().startsWith(filterSection.getSectionPath()))
            {
              result.add(allFiles[i].getPath());
            }
          }
        }
        else
        {
          collectDraftSections(allFiles[i], filterSection, result);
        }
      }
    }

    protected boolean getDraftSyncState(DraftDescriptor draftDescriptor) throws DraftDataAccessException, DraftStorageAccessException
    {
      try
      {
        IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);
        JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
        return ((Boolean) metaObject.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey())).booleanValue();
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
        ddae.setDefaultErrDetail("Get draft sync state failed");
        throw ddae;
      }
    }

    protected void setDraftSyncState(DraftDescriptor draftDescriptor, boolean isSync) throws DraftDataAccessException,
        DraftStorageAccessException
    {
      OutputStream metaFileStream = null;
      try
      {
        IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);
        if (metaFile.getSize() == 0)
        {
          LOGGER.log(Level.WARNING, "meta.json is 0 byte. If no one edits this file, please ignore this warning",
              new Object[] { draftDescriptor });
          return;
        }
        JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
        metaObject.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), Boolean.valueOf(isSync));
        metaFileStream = metaFile.getOutputStream();
        metaObject.serialize(metaFileStream, true);
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
        ddae.setDefaultErrDetail("Set draft sync state failed");
        throw ddae;
      }
      finally
      {
        if (metaFileStream != null)
        {
          try
          {
            metaFileStream.close();
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor);
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Close draft meta file failed during set draft sync state");
            throw ddae;
          }
        }
      }
    }

    protected String getDraftStringMeta(DraftDescriptor draftDescriptor, DraftMetaEnum metaEnum) throws DraftDataAccessException,
        DraftStorageAccessException
    {
      try
      {
        IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);
        JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(msgFile.getInputStream()));
        return (String) metaObject.get(metaEnum.getMetaKey());
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
        ddae.setDefaultErrDetail("Get draft string meta failed");
        ddae.getData().put("metaKey", metaEnum.getMetaKey());
        throw ddae;
      }
    }

    protected Calendar getDraftCalendarMeta(DraftDescriptor draftDescriptor, DraftMetaEnum metaEnum) throws DraftDataAccessException,
        DraftStorageAccessException
    {
      try
      {
        IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);
        JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(msgFile.getInputStream()));

        if (Calendar.class.equals(metaEnum.getMetaValueType()))
        {
          String atomDate = (String) metaObject.get(metaEnum.getMetaKey());
          return AtomDate.valueOf(atomDate).getCalendar();
        }
        else
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          throw new DraftDataAccessException(draftDescriptor, new IllegalArgumentException("metaValueType: " + metaEnum.getMetaValueType()));
        }
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
        ddae.setDefaultErrDetail("Get draft calendar meta failed");
        ddae.getData().put("metaKey", metaEnum.getMetaKey());
        throw ddae;
      }
    }

    protected void setDraftCalendarMeta(DraftDescriptor draftDescriptor, DraftMetaEnum metaEnum, Calendar calendarMeta)
        throws DraftDataAccessException, DraftStorageAccessException
    {
      OutputStream metaFileStream = null;
      try
      {
        IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);

        if (Calendar.class.equals(metaEnum.getMetaValueType()))
        {
          JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(msgFile.getInputStream()));
          metaObject.put(metaEnum.getMetaKey(), AtomDate.valueOf(calendarMeta).getValue());
          metaFileStream = msgFile.getOutputStream();
          metaObject.serialize(metaFileStream, true);
        }
        else
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          throw new DraftDataAccessException(draftDescriptor, new IllegalArgumentException());
        }
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
        ddae.setDefaultErrDetail("Set draft calendar meta failed");
        ddae.getData().put("metaKey", metaEnum.getMetaKey());
        throw ddae;
      }
      finally
      {
        if (metaFileStream != null)
        {
          try
          {
            metaFileStream.close();
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor);
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Close draft meta file failed during set draft calendar meta");
            ddae.getData().put("metaKey", metaEnum.getMetaKey());
            throw ddae;
          }
        }
      }
    }

    protected void updateDraftCalendarSyncMeta(DraftDescriptor draftDescriptor, DraftMetaEnum metaEnum, Calendar calendarMeta,
        boolean isSync) throws DraftDataAccessException, DraftStorageAccessException
    {
      OutputStream metaFileStream = null;
      try
      {
        IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);
        JSONObject metaObject = JSONObject.parse(new AutoCloseInputStream(msgFile.getInputStream()));
        metaObject.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), Boolean.valueOf(isSync));
        if (Calendar.class.equals(metaEnum.getMetaValueType()))
        {
          metaObject.put(metaEnum.getMetaKey(), AtomDate.valueOf(calendarMeta).getValue());
        }
        else
        {
          getDraftStorageManager(false).closeDraft(draftDescriptor);
          throw new DraftDataAccessException(draftDescriptor, new IllegalArgumentException());
        }

        String fileUri = draftDescriptor.getInTransacting() ? draftDescriptor.getTransInternalURI() : draftDescriptor.getInternalURI();
        IDraftStorageAdapter outputAdapter = storageAdapterFactory.newDraftAdapter(fileUri, DRAFT_META_FILE_LABEL);
        metaFileStream = outputAdapter.getOutputStream();
        metaObject.serialize(metaFileStream, true);
      }
      catch (IOException e)
      {
        getDraftStorageManager(false).closeDraft(draftDescriptor);
        DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
        ddae.setDefaultErrDetail("Set draft calendar, sync meta failed");
        ddae.getData().put("metaKey", metaEnum.getMetaKey());
        ddae.getData().put("isSync", isSync);
        throw ddae;
      }
      finally
      {
        if (metaFileStream != null)
        {
          try
          {
            metaFileStream.close();
          }
          catch (IOException e)
          {
            getDraftStorageManager(false).closeDraft(draftDescriptor);
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Set draft calendar, sync meta failed");
            ddae.getData().put("metaKey", metaEnum.getMetaKey());
            ddae.getData().put("isSync", isSync);
            throw ddae;
          }
        }
      }
    }

    private void prepareDraftLocker(DraftDescriptor draftDescriptor) throws DraftStorageAccessException
    {
      IDraftStorageAdapter draftDir = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI());
      draftDir.mkdirs();

      IDraftStorageAdapter draftExternalDir = storageAdapterFactory.newDraftAdapter(draftDescriptor.getURI());
      draftExternalDir.mkdirs();

      IDraftStorageAdapter draftLckFile = storageAdapterFactory.newDraftAdapter(draftDir, DRAFT_LOCK_FILE_LABEL);
      if (!draftLckFile.exists() || !draftLckFile.isFile())
      {
        try
        {
          draftLckFile.createNewFile();
          LOGGER.log(Level.FINE, "Draft Lock File Initiated for {0}", draftDescriptor.getInternalURI());
        }
        catch (IOException e)
        {
          DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
          dsae.setDefaultErrDetail("Error when create lock file for draft");
          throw dsae;
        }
      }
    }

    private void prepareDraftMeta(DraftDescriptor draftDescriptor) throws DraftDataAccessException
    {
      IDraftStorageAdapter metaFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_META_FILE_LABEL);

      if ((!metaFile.exists() || !metaFile.isFile()) || metaFile.getSize() == 0)
      {
        File[] draftFiles = ((File) metaFile.getRaw()).getParentFile().listFiles(new FilenameFilter()
        {
          public boolean accept(File dir, String name)
          {
            return new File(dir, name).isFile();
          }
        });

        boolean flag1 = (!metaFile.exists() || !metaFile.isFile()) && (draftFiles.length == 1)
            && DRAFT_LOCK_FILE_LABEL.equals(draftFiles[0].getName());
        boolean flag2 = (metaFile.exists() && metaFile.isFile() && metaFile.getSize() == 0) && (draftFiles.length != 1);
        if (flag1 || flag2)
        {
          OutputStream metaFileOutputStream = null;
          try
          {
            metaFileOutputStream = metaFile.getOutputStream();
            if (flag2)
            {
              LOGGER.info("meta.json of " + draftDescriptor.getDocId() + " is damaged. Try to fix it...");
              JSONObject obj = new JSONObject();
              obj.put("meta_damaged", true);
              obj.serialize(metaFileOutputStream, true);
              // backup draft to avoid draft lost
              try
              {
                ZipUtil.zip(draftDescriptor.getURI(), draftDescriptor.getInternalURI() + File.separator + "damaged_draft.zip");
              }
              catch (Exception e)
              {
                LOGGER.log(Level.WARNING, "failed to backup draft for document " + draftDescriptor.getDocId(), e);
              }

            }
            else
            {
              new JSONObject().serialize(metaFileOutputStream, true);
            }
            LOGGER.log(Level.FINE, "Draft Meta File Initiated for {0}", draftDescriptor.getInternalURI());
          }
          catch (IOException e)
          {
            DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
            ddae.setDefaultErrDetail("Error when create meta file for draft");
            throw ddae;
          }
          finally
          {
            if (metaFileOutputStream != null)
            {
              try
              {
                metaFileOutputStream.close();
              }
              catch (IOException e)
              {
                DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
                ddae.setDefaultErrDetail("Close draft meta file faile during preparation");
                throw ddae;
              }
            }
          }
        }
      }
    }

    private void prepareDraftMsgBuffer(DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
    {
      IDraftStorageAdapter msgFile = storageAdapterFactory.newDraftAdapter(draftDescriptor.getInternalURI(), DRAFT_MSG_FILE_LABEL);

      if (!msgFile.exists() || !msgFile.isFile())
      {
        File[] draftFiles = ((File) msgFile.getRaw()).getParentFile().listFiles(new FilenameFilter()
        {
          public boolean accept(File dir, String name)
          {
            return new File(dir, name).isFile();
          }
        });
        if ((!msgFile.exists() || !msgFile.isFile()) && (draftFiles.length == 2)
            && (DRAFT_LOCK_FILE_LABEL.equals(draftFiles[0].getName()) || DRAFT_META_FILE_LABEL.equals(draftFiles[0].getName()))
            && (DRAFT_META_FILE_LABEL.equals(draftFiles[1].getName()) || DRAFT_LOCK_FILE_LABEL.equals(draftFiles[1].getName())))
        {
          resetMsg(draftDescriptor);
          LOGGER.log(Level.FINE, "Draft Msg File Initiated for {0}", draftDescriptor.getInternalURI());
        }
      }
    }

    private void prepareDraftTempFolder(DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
    {
      IDraftStorageAdapter tempFolder = storageAdapterFactory.newDraftAdapter(draftDescriptor.getTempURI(null));

      tempFolder.mkdirs();
    }

    protected void copy(InputStream sourceStream, IDraftStorageAdapter destFile) throws IOException
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

    protected abstract Object perform() throws DraftStorageAccessException, DraftDataAccessException;
  }

  public boolean isSnapshotExisted(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    if (!viewerSnapshotEnabled())
    {
      return false;
    }
    LOGGER.entering(DraftStorageManager.class.getName(), "isSnapshotExisted", new Object[] { draftDescriptor });

    String snapshotMeidaDir = draftDescriptor.getSnapshotMediaURI();
    File resultJson = new File(snapshotMeidaDir, RESULT_FILE_NAME);
    Boolean isSuccess = false;
    try
    {
      if (resultJson.exists())
      {
        JSONObject json = null;
        json = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(resultJson)));
        if (json.containsKey("isSuccess"))
        {
          isSuccess = (Boolean) json.get("isSuccess");
        }
      }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Failed to check snapshot exist or not. {0}, {1}", new Object[] { draftDescriptor, e });
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "isSnapshotExisted", isSuccess);
    return isSuccess.booleanValue();
  }

  public void recordSnapshotErrorResult(final DraftDescriptor draftDescriptor, final String sourcePath, final int errorCode)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    if (!viewerSnapshotEnabled())
    {
      return;
    }
    LOGGER.entering(DraftStorageManager.class.getName(), "recordSnapshotErrorResult",
        new Object[] { draftDescriptor, sourcePath, errorCode });

    File resultJsonFile = new File(sourcePath, RESULT_FILE_NAME);
    String snapshotTempPath = draftDescriptor.getTempURI(UUID.randomUUID().toString());
    File snapshotTempDir = new File(snapshotTempPath);

    if (FileUtil.exists(resultJsonFile))
    {
      FileUtil.nfs_copyFileToDir(resultJsonFile, snapshotTempDir, null, FileUtil.NFS_RETRY_SECONDS);
    }
    else
    {
      OutputStream resultJsonFileStream = null;
      try
      {
        FileUtil.nfs_mkdirs(snapshotTempDir, FileUtil.NFS_RETRY_SECONDS);
        resultJsonFileStream = storageAdapterFactory.newDraftAdapter(snapshotTempPath, RESULT_FILE_NAME).getOutputStream();
        JSONObject resultJson = new JSONObject();
        resultJson.put("isSuccess", false);
        resultJson.put("id", errorCode);
        resultJson.serialize(resultJsonFileStream, true);
      }
      catch (IOException e)
      {
        DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
        dsae.setDefaultErrDetail("Failed to create result.json with error code in the snapshot folder");
        throw dsae;
      }
      finally
      {
        if (resultJsonFileStream != null)
        {
          try
          {
            resultJsonFileStream.close();
          }
          catch (IOException e)
          {
            DraftStorageAccessException dsae = new DraftStorageAccessException(draftDescriptor, e);
            dsae.setDefaultErrDetail("Failed to close result.json in the snapshot folder");
            throw dsae;
          }
        }
      }
    }

    try
    {
      Platform.getWorkManager().startWork(new GenerateSnapshotWork(draftDescriptor, snapshotTempPath, 0, true), WorkManager.INDEFINITE,
          null);
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while starting recordSnapshotErrorResult work.", e);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "recordSnapshotErrorResult");
  }

  public void cleanSnapshotReadableTag(final DraftDescriptor draftDescriptor) throws DraftStorageAccessException, DraftDataAccessException
  {
    if (!viewerSnapshotEnabled())
    {
      return;
    }

    LOGGER.entering(DraftStorageManager.class.getName(), "cleanFailedSnapshot", new Object[] { draftDescriptor });

    File readableTag = new File(draftDescriptor.getSnapshotURI(), SNAPSHOT_READABLE_TAG);
    if (readableTag.exists())
    {
      FileUtil.nfs_delete(readableTag, FileUtil.NFS_RETRY_SECONDS);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "cleanFailedSnapshot", new Object[] {});
  }

  public void generateSnapshotFromDraft(final DraftDescriptor draftDescriptor, final IDocumentEntry docEntry)
      throws DraftDataAccessException, DraftStorageAccessException
  {
    if (!viewerSnapshotEnabled())
    {
      return;
    }

    LOGGER.entering(DraftStorageManager.class.getName(), "generateSnapshotFromDraft", new Object[] { draftDescriptor });

    new CriticalSection()
    {
      protected Object perform() throws DraftStorageAccessException, DraftDataAccessException
      {
        String draftPath = draftDescriptor.getURI();
        String snapshotTempPath = draftDescriptor.getTempURI(UUID.randomUUID().toString());

        FileUtil.nfs_copyDirToDir(new File(draftPath), new File(snapshotTempPath), SNAPSHOT_FILTER, FileUtil.NFS_RETRY_SECONDS);

        try
        {
          Platform.getWorkManager().startWork(
              new GenerateSnapshotWork(draftDescriptor, snapshotTempPath, docEntry.getModified().getTimeInMillis()),
              WorkManager.INDEFINITE, null);
        }
        catch (Exception e)
        {
          LOGGER.log(Level.SEVERE, "Exception happens while starting generateSnapshotFromDraft work.", e);
        }
        return null;
      }
    }.execute(draftDescriptor);

    LOGGER.exiting(DraftStorageManager.class.getName(), "generateSnapshotFromDraft", new Object[] { draftDescriptor });
  }

  public void generateSnapshotFromRepo(final DraftDescriptor draftDescriptor, final IDocumentEntry docEntry, final String sourcePath)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    if (!viewerSnapshotEnabled())
    {
      return;
    }

    LOGGER
        .entering(DraftStorageManager.class.getName(), "generateSnapshotFromRepo", new Object[] { draftDescriptor, docEntry, sourcePath });

    String snapshotTempPath = draftDescriptor.getTempURI(UUID.randomUUID().toString());

    FileUtil.nfs_copyDirToDir(new File(sourcePath), new File(snapshotTempPath), SNAPSHOT_FILTER, FileUtil.NFS_RETRY_SECONDS);

    long docTimeStamp = docEntry.getModified().getTime().getTime();
    try
    {
      Platform.getWorkManager().startWork(new GenerateSnapshotWork(draftDescriptor, snapshotTempPath, docTimeStamp, docEntry),
          WorkManager.INDEFINITE, null);
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while starting generateSnapshotFromRepo work.", e);
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "generateSnapshotFromRepo", new Object[] { draftDescriptor });

  }

  public void updateSnapshotTimeStamp(DraftDescriptor draftDescriptor, String snapshotTempPath, long newTimeStamp)
      throws DraftStorageAccessException
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "updateSnapshotTimeStamp", new Object[] { draftDescriptor, snapshotTempPath,
        newTimeStamp });

    File resultJson = new File(snapshotTempPath, RESULT_FILE_NAME);

    if (resultJson.exists())
    {
      FileOutputStream out = null;
      try
      {
        JSONObject json = null;
        json = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(resultJson)));
        json.put(SNAPSHOT_TIMESTAMP, newTimeStamp);
        out = new FileOutputStream(resultJson);
        json.serialize(out, true);
      }
      catch (IOException e)
      {
        LOGGER.log(Level.SEVERE, "Exception happens while update Snapshot TimeStamp", e);
        throw new DraftStorageAccessException(draftDescriptor, e);
      }
      finally
      {
        if (out != null)
        {
          try
          {
            out.close();
          }
          catch (IOException e)
          {
            LOGGER.log(Level.SEVERE, "Exception happens while update Snapshot TimeStamp", e);
            throw new DraftStorageAccessException(draftDescriptor, e);
          }
        }
      }
    }
    else
    {
      OutputStream resultJsonFileStream = null;
      try
      {
        resultJsonFileStream = new FileOutputStream(resultJson);
        JSONObject json = new JSONObject();
        json.put("isSuccess", true);
        json.put(SNAPSHOT_TIMESTAMP, newTimeStamp);
        json.serialize(resultJsonFileStream, true);
      }
      catch (IOException e)
      {
        LOGGER.log(Level.SEVERE, "Exception happens while update Snapshot TimeStamp", e);
        throw new DraftStorageAccessException(draftDescriptor, e);
      }
      finally
      {
        if (resultJsonFileStream != null)
        {
          try
          {
            resultJsonFileStream.close();
          }
          catch (IOException e)
          {
            LOGGER.log(Level.SEVERE, "Exception happens while update Snapshot TimeStamp", e);
            throw new DraftStorageAccessException(draftDescriptor, e);
          }
        }
      }
    }

    LOGGER.exiting(DraftStorageManager.class.getName(), "updateSnapshotTimeStamp", new Object[] { draftDescriptor });
  }

  public long readTimeStamp(String snapshotDir)
  {
    LOGGER.entering(DraftStorageManager.class.getName(), "readTimeStamp", new Object[] { snapshotDir });

    File resultJson = new File(snapshotDir, RESULT_FILE_NAME);
    long stamp = -1;

    if (resultJson.exists())
    {
      try
      {
        JSONObject json = null;
        json = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(resultJson)));
        if (json.containsKey(SNAPSHOT_TIMESTAMP))
        {
          stamp = ((Long) json.get(SNAPSHOT_TIMESTAMP)).longValue();
        }
      }
      catch (Exception e)
      {
        LOGGER.log(Level.WARNING, "Failed to read snapshot timestamp from:" + snapshotDir, e);
      }
    }
    else
    {
      LOGGER.log(Level.FINE, "Cannot find result.json file to get snapshot timestamp" + snapshotDir);
    }
    LOGGER.exiting(DraftStorageManager.class.getName(), "readTimeStamp", new Object[] { stamp });
    return stamp;
  }

}

class AutoCleanInputStream extends AutoCloseInputStream
{
  private File cleanFile;

  public AutoCleanInputStream(FileInputStream in, File cleanFile)
  {
    super(in);
    this.cleanFile = cleanFile;
  }

  public void close() throws IOException
  {
    try
    {
      super.close();
    }
    finally
    {
      if (cleanFile != null)
      {
        cleanFile.delete();
      }
    }
  }
}
