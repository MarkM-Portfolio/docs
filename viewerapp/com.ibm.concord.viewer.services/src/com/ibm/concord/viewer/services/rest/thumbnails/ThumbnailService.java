package com.ibm.concord.viewer.services.rest.thumbnails;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.concurrent.BlockingQueue;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.job.IConversionJob.JOB_PRIORITY_TYPE;

public abstract class ThumbnailService
{
  private static final Logger log = Logger.getLogger(ThumbnailService.class.getName());
  
  protected static final String THUMBNAILS_SIZE_DESCRIPTION = "size.json";

  protected static final String PREVIEW = "preview";

  protected static final String STATE = "status.json";

  protected static final String THUMBNAILSERVICE_FILENAME = "ThumbnailService";

  protected static final long THUMBNAILSERVICE_FAILOVER_INTERVAL = 150 * 1000;

  protected UserBean user;

  protected IDocumentEntry docEntry;

  protected ICacheDescriptor draftDesc;

  protected ThumbnailDescriptor thumbSrvDraftDesc;

  protected String thumbnailServiceCachedDir;

  protected String filesThumbnailsHome;

  public BlockingQueue<String> jobMsgQ = null;
  
  public JOB_PRIORITY_TYPE jobPriority = JOB_PRIORITY_TYPE.NORMAL;
  
  public ThumbnailService(UserBean user, IDocumentEntry docEntry)
  {
    this.user = user;
    this.docEntry = docEntry;
    this.draftDesc = new ImageCacheDescriptor(user, docEntry);
    this.thumbSrvDraftDesc = new ThumbnailDescriptor(docEntry);
    String repoId = docEntry.getRepository();
    if (repoId.equals(RepositoryServiceUtil.ECM_FILES_REPO_ID))
    {
      thumbnailServiceCachedDir = thumbSrvDraftDesc.getThumbnailServiceURI();
    }
    //In SC Verse, for LC files, 
    // 1. for files, this property will not be used.
    // 2. for images, we will not use files_path as working folder, 
    //    but viewer thumbnail cache. do downsize job and upload to files through http.
    else if (repoId.equals(RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID) || repoId.equals(RepositoryServiceUtil.TOSCANA_REPO_ID)
        || repoId.equals(RepositoryServiceUtil.SANITY_REPO_ID))
    {
      thumbnailServiceCachedDir = thumbSrvDraftDesc.getThumbnailServiceURI();
    }
    else
    {
      String[] md5 = ViewerUtil.hash(docEntry.getDocUri());
      this.filesThumbnailsHome = new StringBuffer()
          .append(
              RepositoryServiceUtil
                  .getRepositoryFilesPath(ViewerConfig.getInstance().isLocalEnv() ? RepositoryServiceUtil.LOCALTEST_FILES_REPO_ID : repoId))
          .append(File.separator).append(PREVIEW).toString();
      StringBuffer path = new StringBuffer(filesThumbnailsHome).append(File.separator).append(md5[0]).append(File.separator).append(md5[1])
          .append(File.separator).append(docEntry.getDocUri()).append(File.separator).append(docEntry.getModified().getTimeInMillis());
      thumbnailServiceCachedDir = path.toString();
    }
  }
  
  public String getthumbnailServiceCachedDir()
  {
    return thumbnailServiceCachedDir;
  }
  
  public boolean isThumbnailsExisted()
  {
    String repoId = docEntry.getRepository();
    File flag = null;
    if (repoId.equals(RepositoryServiceUtil.ECM_FILES_REPO_ID) || repoId.equals(RepositoryServiceUtil.LOCALTEST_FILES_REPO_ID)
        || repoId.equals(RepositoryServiceUtil.TOSCANA_REPO_ID) || repoId.equals(RepositoryServiceUtil.SANITY_REPO_ID))
    {
      File cacheDir = new File(thumbnailServiceCachedDir);
      cacheDir.list();
      flag = new File(cacheDir, "size.json");
    }
    else
    {
      String filesResult = thumbSrvDraftDesc.getInternalURI() + File.separator + "result";
      flag = new File(filesResult);
      //TODO clean the thumbnail in Files preview folder.
    }
    if (flag.exists())
    {
      return true;
    }
    return false;
  }
  
  protected boolean aquireLock()
  {
    File lockDir = new File(thumbSrvDraftDesc.getThumbnailServiceURI());
    if (!lockDir.exists())
    {
      lockDir.mkdirs();
    }
    File thumbSrvLock = new File(lockDir, THUMBNAILSERVICE_FILENAME);
    if (thumbSrvLock.exists())
    {
      boolean isFailover = new Date().getTime() - thumbSrvLock.lastModified() > THUMBNAILSERVICE_FAILOVER_INTERVAL;
      if (isFailover)
      {
        thumbSrvLock.delete();
        log.log(
            Level.WARNING,
            "Aquire lock for thumbnail service, failover occurred, and the time is passed 150s, will re-generate now. DocId: {0} LastModified: {1}",
            new Object[] { docEntry.getDocId(), docEntry.getModified().getTimeInMillis() });
      }
      else
      {
        log.log(Level.WARNING, "Thumbnail service is running on another node, this request will be ignored. DocId: {0} LastModified: {1}",
            new Object[] { docEntry.getDocId(), docEntry.getModified().getTimeInMillis() });
        return false;
      }
    }
    try
    {
      if (!thumbSrvLock.createNewFile())
      {
        log.log(Level.WARNING, "Create thumbnail service lock failed. DocId: {0} LastModified: {1}", new Object[] { docEntry.getDocId(),
            docEntry.getModified().getTimeInMillis() });
        return false;
      }
    }
    catch (IOException e)
    {
      log.log(Level.WARNING, "Create thumbnail service lock failed. DocId: {0} LastModified: {1}", new Object[] { docEntry.getDocId(),
          docEntry.getModified().getTimeInMillis() });
      return false;
    }
    log.log(Level.INFO, "Aquired thumbnail service lock successfully. DocId: {0} LastModified: {1}", new Object[] { docEntry.getDocId(),
        docEntry.getModified().getTimeInMillis() });
    return true;
  }
  
  protected void releaseLock()
  {
    File lockDir = new File(thumbnailServiceCachedDir);
    if (!lockDir.exists())
    {
      log.log(Level.WARNING, "Image thumbnail service lock parent directory does not exist. DocId: {0} LastModified: {1}", new Object[] {
          docEntry.getDocId(), docEntry.getModified().getTimeInMillis() });
      return;
    }
    File thumbSrvLock = new File(lockDir, THUMBNAILSERVICE_FILENAME);
    if (!thumbSrvLock.exists())
    {
      log.log(Level.WARNING, "Image thumbnail service lock does not exist. DocId: {0} LastModified: {1}",
          new Object[] { docEntry.getDocId(), docEntry.getModified().getTimeInMillis() });
      return;
    }
    if (!thumbSrvLock.delete())
    {
      log.log(Level.WARNING, "Deleting image thumbnail service lock failed. DocId: {0} LastModified: {1}",
          new Object[] { docEntry.getDocId(), docEntry.getModified().getTimeInMillis() });
      return;
    }
    log.log(Level.INFO, "Deleted image thumbnail service lock successfully. DocId: {0} LastModified: {1}",
        new Object[] { docEntry.getDocId(), docEntry.getModified().getTimeInMillis() });
  }
  
  abstract public void exec();
}