package com.ibm.concord.document.services.autopublish;

import java.util.Calendar;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AutoPublishAction
{
  private static final Logger LOG = Logger.getLogger(AutoPublishAction.class.getName());

  private IDocumentEntry docEntry;

  private UserBean user;

  DraftDescriptor draftDescriptor;

  private static ConcurrentHashMap<String, Object> running = new ConcurrentHashMap<String, Object>();

  synchronized private boolean setRunningLock(String uri)
  {
    if (!running.containsKey(uri))
    {
      running.put(uri, new Object());
      return true;
    }
    else
    {
      return false;
    }
  }

  private Object removeRunningLock(String uri)
  {
    Object lock = running.remove(uri);
    return lock;
  }

  public AutoPublishAction(IDocumentEntry docEntry, UserBean user, DraftDescriptor dd)
  {
    this.docEntry = docEntry;
    this.user = user;
    this.draftDescriptor = dd;
  }

  public void action()
  {
    if (!(docEntry.getRepository().equalsIgnoreCase(RepositoryConstants.REPO_TYPE_FILES)
        || docEntry.getRepository().equalsIgnoreCase(RepositoryConstants.REPO_TYPE_ECM)
        || docEntry.getRepository().equalsIgnoreCase(RepositoryConstants.REPO_TYPE_LOCAL)
        || docEntry.getRepositoryType().equalsIgnoreCase(RepositoryConstants.REPO_TYPE_EXTERNAL_REST)))
    {
      LOG.log(Level.INFO, "Dont auto publish document {0} on behalf of {1} because the repository {2} does not support", new Object[] {
          docEntry.getDocUri(), user.getId(), docEntry.getRepository() });
      return;
    }

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);
    IDocumentService docService = docServiceProvider.getDocumentService(docEntry.getMimeType());

    JSONObject draftMeta;
    try
    {
      draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDescriptor);
    }
    catch (DraftDataAccessException e)
    {
      LOG.log(Level.WARNING, "Failed to auto publishing document {0} on behalf of {1}, the draft exception is: {2}", new Object[] {
          docEntry.getDocUri(), user.getId(), e });
      return;
    }

    if (draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey()) != null
        && ((Boolean) draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey())).booleanValue())
    {
      LOG.log(Level.INFO, "Dont auto publish document {0} on behalf of {1} because the draft has already been published to repository",
          new Object[] { docEntry.getDocUri(), user.getId() });
      return;
    }

    if (setRunningLock(docEntry.getDocUri()))
    {
      LOG.log(Level.INFO, "Lock and start to publish document {0} on behalf of {1} ...",
          new Object[] { docEntry.getDocUri(), user.getId() });
    }
    else
    {
      LOG.log(Level.INFO, "Cancel publish document {0} on behalf of {1} because there is a publish thread running...", new Object[] {
          docEntry.getDocUri(), user.getId() });
      return;
    }

    boolean success = false;
    try
    {
      IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
      IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
      DocHistoryBean oldDhb = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());

      boolean overwrite = true;
      String communityId = docEntry.getCommunityId();
      boolean bEmptyCommunityId = (communityId == null || communityId.length() == 0);
      // ECM repository with empty community it, it is icn
      if (RepositoryConstants.REPO_TYPE_ECM.equalsIgnoreCase(docEntry.getRepository()) && bEmptyCommunityId)
      {
        overwrite = !AutoPublishUtil.isAutoPublish(docEntry);
      }
      else
      {
        long lastPublishAt = oldDhb != null ? oldDhb.getLastAutoPublished() : -1;
        if (lastPublishAt > 0)
        {
          long interval = AutoPublishUtil.getNewVersionInterval();
          long currentTime = AtomDate.valueOf(Calendar.getInstance()).getTime();

          if ((currentTime - lastPublishAt) > interval)
          {// larger than 1 hour since last auto publish?
            overwrite = false;
            LOG.log(Level.INFO,
                "Generate new version when auto publish document {0} on behalf of {1} because its published more than {2} ms ago.",
                new Object[] { docEntry.getDocUri(), user.getId(), interval });
          }
          else
          {
            LOG.log(Level.INFO,
                "Overwrite current version when auto publish document {0} on behalf of {1} because its published less than {2} ms",
                new Object[] { docEntry.getDocUri(), user.getId(), interval });
          }
        }
        else
        {
          // generate new version if no meta field
          overwrite = false;
        }
      }

      LOG.log(Level.INFO, "Auto publishing document {0} on behalf of {1}...", new Object[] { docEntry.getDocUri(), user.getId() });
      IDocumentEntry newDocEntry = docService.publish(docEntry, user, new JSONObject(), new JSONArray(), overwrite);
      success = true;

      draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(newDocEntry.getModified()).getValue());
      draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), newDocEntry.getVersion());
      draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey(), newDocEntry.getContentHash());
      draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), Boolean.valueOf(true));
      draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), newDocEntry.getMimeType());
      draftMeta.put(DraftMetaEnum.EXT.getMetaKey(), newDocEntry.getExtension());
      draftMeta.put(DraftMetaEnum.TITLE.getMetaKey(), newDocEntry.getTitle());
      DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDescriptor, draftMeta);

      DocHistoryBean dhb = new DocHistoryBean(newDocEntry.getRepository(), newDocEntry.getDocUri());
      dhb.setLastModified(newDocEntry.getModified().getTimeInMillis());
      dhb.setOrgId(draftDescriptor.getCustomId());
      dhb.setDocId(newDocEntry.getDocId());
      dhb.setVersionSeriesId(newDocEntry.getVersionSeriesId());
      dhb.setLibraryId(newDocEntry.getLibraryId());
      dhb.setCommunityId(newDocEntry.getCommunityId());
      dhb.setAutoPublish(true);
      dhb.setLastAutoPublished(Calendar.getInstance().getTimeInMillis());
      if (docHisotryDAO.get(dhb.getRepoId(), dhb.getDocUri()) == null)
      {
        dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
        docHisotryDAO.add(dhb);
      }
      else
      {
        docHisotryDAO.updateAutoPublishAt(dhb);
      }
      LOG.log(Level.INFO, "Auto published document {0} on behalf of {1} !!", new Object[] { docEntry.getDocUri(), user.getId() });
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to auto publishing document {0} on behalf of {1}, the exception is: {2}",
          new Object[] { docEntry.getDocUri(), user.getId(), e });
    }
    finally
    {
      removeRunningLock(docEntry.getDocUri());
    }

    // Journal
    IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
        IJournalAdapter.class);
    JournalHelper.Actor actor = new JournalHelper.Actor(user.getEmail(), user.getId(), user.getCustomerId());
    JournalHelper.Entity jnl_obj = null;
    if (docEntry != null)
      jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, docEntry.getTitleWithExtension(), docEntry.getDocId(),
          user.getCustomerId());
    else
      jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, "", "", user.getCustomerId());
    journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, actor, JournalHelper.Action.EXPORT, jnl_obj,
        success ? JournalHelper.Outcome.SUCCESS : JournalHelper.Outcome.FAILURE).build());

  }
}
