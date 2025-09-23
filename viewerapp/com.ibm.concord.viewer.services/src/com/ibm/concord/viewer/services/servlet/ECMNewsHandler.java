package com.ibm.concord.viewer.services.servlet;

import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.job.ECMHouseKeepingJob;
import com.ibm.concord.viewer.job.ECMHouseKeepingJob.ECMHouseKeepingType;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.news.INewsHandler;
import com.ibm.docs.viewer.ecm.repository.ECMDocumentEntry;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;
import com.ibm.websphere.asynchbeans.WorkException;
import com.ibm.websphere.cache.DistributedMap;

public abstract class ECMNewsHandler implements INewsHandler
{
  protected static final String MODIFIED = "modified";

  protected static final String DOCUMENT = "docId";

  protected EventType req;

  protected Logger log = Logger.getLogger(ECMNewsHandler4Doc.class.getName());

  protected IDocumentEntry docEntry = null;

  protected IDocumentEntry[] versions = null;

  protected HttpServletRequest request;

  protected UserBean user;

  protected String docUri;

  protected static ECMRepository ecmAdapter;

  static
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryServiceUtil.ECM_FILES_REPO_ID);
    ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
  }

  public ECMNewsHandler(HttpServletRequest request, EventType type, String docId)
  {
    this.request = request;
    this.req = type;
    this.user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    this.docUri = docId;
  }

  @Override
  public IDocumentEntry getDocumentEntry() throws RepositoryAccessException
  {
    String modified = (String) request.getParameter(MODIFIED);

    if (req == EventType.PURGE_ALL)
    {
      // TODO how to get version-history?
    }
    else if (req == EventType.PURGE_VERSION)
    {
      docEntry = this.getECMEntry(user, docUri, modified);
    }
    else if (req == EventType.UPLOAD_FILE)
    {
      docEntry = ecmAdapter.getDraftBySONATA(docUri);
      log.log(Level.INFO, "Successfully get latest object by parsing allversions xml. DocUri: " + docUri);
    }
    else
    {
      versions = ecmAdapter.getVersionsBySONATA(docUri);
      if (versions == null || versions.length == 0)
      {
        log.log(Level.WARNING, "Failed to get version history. DocUri: " + docUri);
        docEntry = null;
      }
      else
      {
        docEntry = versions[0];
        log.log(Level.INFO, "Successfully get version history. DocUri: " + docUri);
      }
    }
    if (docEntry != null)
    {
      DistributedMap cachedMap = Platform.getDocEntryCacheMap();
      cachedMap.put(docUri, docEntry);
    }
    return docEntry;
  }

  @Override
  public void processNewsEvent() throws RepositoryAccessException
  {
    log.entering(ECMNewsHandler.class.getName(), "processNewsEvent", new Object[] { req.name(), docEntry.getDocUri() });

    switch (req)
      {
        case GENERATE_THUMBNAIL :
          thumbnailService(user, docEntry);
          break;
        case UPLOAD_FILE :
          // startECMHouseKeepingJob(user, versions, ECMHouseKeepingType.PURGE_OUTDATED);
          conversionService(user, docEntry);
          break;
        case UPDATE_DRAFT :
          startECMHouseKeepingJob(user, versions, ECMHouseKeepingType.PURGE_OUTDATED_DRAFTS);
          conversionService(user, docEntry);
          break;
        case PUBLISH_DRAFT :
          startECMHouseKeepingJob(user, versions, ECMHouseKeepingType.PURGE_OUTDATED);
          conversionService(user, docEntry);
          break;
        case CREATE_DRAFT :
          if (DocumentTypeUtils.isImage(docEntry.getExtension()))
            conversionService(user, docEntry);
          else
            copyService(user, versions);
          break;
        case PURGE_VERSION :
          startECMHouseKeepingJob(user, docEntry, ECMHouseKeepingType.PURGE_VERSION);
          break;
        case PURGE_ALL :
          startECMHouseKeepingJob(user, versions, ECMHouseKeepingType.PURGE_ALL);
          break;
        case RESTORE_ALL :
          ECMDocumentEntry ecmEntry = ((ECMDocumentEntry) docEntry);
          conversionService(user, docEntry);

          IDocumentEntry entry = null;
          RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
              .getService(RepositoryServiceUtil.ECM_FILES_REPO_ID);
          ECMRepository ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
          if (ecmEntry.isDraft())
          {
            String verId = ecmEntry.getLatestMajorVersionId();
            if (verId != null)
            {
              entry = ecmAdapter.getDocumentBySONATA(verId);
            }
          }
          else
          {
            String pwcId = ecmEntry.getPrivateWorkCopyId();
            if (pwcId != null)
            {
              entry = ecmAdapter.getDocumentBySONATA(pwcId);
            }
          }
          if (entry != null)
          {
            conversionService(user, docEntry);
          }
          break;
      }

    log.exiting(ECMNewsHandler.class.getName(), "processNewsEvent");
  }

  protected void copyService(UserBean user, IDocumentEntry[] versions)
  {
    log.entering(ECMNewsHandler.class.getName(), "copyService", new Object[] { user, versions });
    IDocumentEntry draft = versions[0];
    IDocumentEntry copySrc = null;
    String latestMajorVerId = ((ECMDocumentEntry) draft).getLatestMajorVersionId();
    for (IDocumentEntry entry : versions)
    {
      if (latestMajorVerId != null && entry.getDocId().contains(latestMajorVerId))
      {
        copySrc = entry;
        log.log(Level.FINE, "Found publish version. MajorVerID: " + copySrc.getDocUri() + "DraftID: " + draft.getDocUri());
        break;
      }
      else if (((ECMDocumentEntry) entry).isLatestVersion())
      {
        copySrc = entry;
        log.log(Level.FINE, "Found latest draft version. LatestVerID: " + copySrc.getDocUri() + "DraftID: " + draft.getDocUri());
        break;
      }
    }

    try
    {
      log.log(Level.FINE, "Start to schedule ECM copy cache job.");
      Platform.getWorkManager().startWork(new ECMCopyCacheJob(this, user, draft, copySrc));
    }
    catch (WorkException e)
    {
      log.log(Level.WARNING, "Failed to start ECM copy cache job. DocId: " + versions[0].getDocId() + ".", e);
    }
    catch (IllegalArgumentException e)
    {
      log.log(Level.WARNING, "Failed to start ECM copy cache job. DocId: " + versions[0].getDocId() + ".", e);
    }

    log.entering(ECMNewsHandler.class.getName(), "copyService");
  }

  private IDocumentEntry getECMEntry(UserBean user, String docUri, String mod)
  {
    Calendar modified = Calendar.getInstance();
    if (mod != null)
    {
      modified.setTimeInMillis(Long.parseLong(mod));
    }
    else
    {
      modified.setTimeInMillis(0);
    }
    IDocumentEntry docEntry = new ECMDocumentEntry(docUri, modified);
    return docEntry;
  }

  protected void startECMHouseKeepingJob(UserBean user, IDocumentEntry[] versions, ECMHouseKeepingType type)
  {
    try
    {
      log.log(Level.FINE, "Start to schedule ECM housekeeping job.");
      Platform.getWorkManager().startWork(new ECMHouseKeepingJob(user, versions, type));
    }
    catch (WorkException e)
    {
      log.log(Level.WARNING, "Failed to start ECM housekeeping job. DocId: " + versions[0].getDocId() + ".", e);
    }
    catch (IllegalArgumentException e)
    {
      log.log(Level.WARNING, "Failed to start ECM housekeeping job. DocId: " + versions[0].getDocId() + ".", e);
    }
  }

  protected void startECMHouseKeepingJob(UserBean user, IDocumentEntry docEntry, ECMHouseKeepingType type)
  {
    try
    {
      log.log(Level.FINE, "Start to schedule ECM housekeeping job.");
      Platform.getWorkManager().startWork(new ECMHouseKeepingJob(user, docEntry, type));
    }
    catch (WorkException e)
    {
      log.log(Level.WARNING, "Failed to start ECM housekeeping job. DocId: " + docEntry.getDocUri() + ".", e);
    }
    catch (IllegalArgumentException e)
    {
      log.log(Level.WARNING, "Failed to start ECM housekeeping job. DocId: " + docEntry.getDocUri() + ".", e);
    }
  }

  abstract protected void thumbnailService(UserBean user, IDocumentEntry docEntry);

  abstract public void conversionService(UserBean user, IDocumentEntry docEntry);

}
