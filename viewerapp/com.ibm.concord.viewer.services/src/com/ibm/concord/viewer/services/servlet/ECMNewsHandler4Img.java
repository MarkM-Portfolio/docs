package com.ibm.concord.viewer.services.servlet;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailServiceJob4Img;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.docs.viewer.ecm.repository.ECMDocumentEntry;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;
import com.ibm.websphere.asynchbeans.WorkException;

public class ECMNewsHandler4Img extends ECMNewsHandler
{
  private static BlockingLinkedHashMap<String, String> imageBLHM = new BlockingLinkedHashMap<String, String>(
      Integer.parseInt(Platform.getViewerConfig().getSubConfig(ConfigConstants.THUMBNAILS_KEY)
          .get(ConfigConstants.THUMBNAILSRV_IMAGE_TASKQUEUE_CAPACITY).toString()));

  private static Thread tct = null;

  private static Logger log = Logger.getLogger(ECMNewsHandler4Img.class.getName());

  public ECMNewsHandler4Img(HttpServletRequest request, EventType type, String docId)
  {
    super(request, type, docId);
  }

  @Override
  protected void thumbnailService(UserBean user, IDocumentEntry docEntry)
  {
    imageBLHM.put(docEntry.getDocId(), docEntry.getDocId());
    startWorking();
  }

  @Override
  public void conversionService(UserBean user, IDocumentEntry docEntry)
  {
    log.entering(ECMNewsHandler4Img.class.getName(), "conversionService", new Object[] { user.getId(), docEntry.getDocUri() });

    ThumbnailServiceJob4Img thumsJob = new ThumbnailServiceJob4Img(user, docEntry);
    thumsJob.schedule();

    log.exiting(ECMNewsHandler4Img.class.getName(), "conversionService");
  }

  private void startWorking()
  {
    if (tct == null)
      tct = new Thread(new JobScheduler(), "Image Thumbnail Job Scheduler");
    if (!tct.isAlive())
      tct.start();
  }

  private class JobScheduler implements Runnable
  {
    @Override
    public void run()
    {
      while (true)
      {
        try
        {
          String docID = imageBLHM.take();
          scheduleTasks(docID);
        }
        catch (InterruptedException e)
        {
          log.log(Level.WARNING, "Failed to run image thumbnail job.", e);
        }
      }
    }

    /**
     * @param docID
     * @throws InterruptedException
     * 
     */
    public void scheduleTasks(String docID) throws InterruptedException
    {
      try
      {
        RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
            .getService(RepositoryServiceUtil.ECM_FILES_REPO_ID);
        ECMRepository ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);

        ECMDocumentEntry ecmEntry = (ECMDocumentEntry) ecmAdapter.getDocumentBySONATA(docID);

        IDocumentEntry draftEntry = null;

        IDocumentEntry publishedEntry = null;

        if (ecmEntry != null)
        {
          if (ecmEntry.isDraft())
          {
            String verId = ecmEntry.getLatestMajorVersionId();
            if (verId != null)
            {
              draftEntry = ecmAdapter.getDocumentBySONATA(verId);
            }
          }
          String pwcId = ecmEntry.getPrivateWorkCopyId();
          if (pwcId != null)
          {
            publishedEntry = ecmAdapter.getDocumentBySONATA(pwcId);
          }
        }

        if (draftEntry != null)
        {
          scheduleTask(draftEntry);
        }

        if (publishedEntry != null)
        {
          scheduleTask(publishedEntry);
        }
      }
      catch (RepositoryAccessException e)
      {
        log.log(Level.SEVERE, "RepositoryAccessException:" + e.getMessage());
      }
      catch (WorkException e)
      {
        log.log(Level.SEVERE, "WorkException:" + e.getMessage());
      }
      catch (IllegalArgumentException e)
      {
        log.log(Level.SEVERE, "IllegalArgumentException:" + e.getMessage());
      }
    }

    /**
     * @param docEntry
     * @throws WorkException
     * @throws InterruptedException
     */
    private void scheduleTask(IDocumentEntry docEntry) throws WorkException, InterruptedException
    {
      ThumbnailServiceJob4Img thumsJob = new ThumbnailServiceJob4Img(user, docEntry);
      thumsJob.schedule();
      synchronized (docEntry)
      {
        docEntry.wait();
      }
    }
  }
}
