package com.ibm.concord.viewer.services.servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.CacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.document.common.rendition.RenditionUtil;
import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;

public class ECMCopyCacheJob implements Work
{

  private static final String CLAZZ = ECMCopyCacheJob.class.getName();

  private static final Logger logger = Logger.getLogger(CLAZZ);

  private static final String FULLIMAGE = "pictures";

  private static final String THUMBNAIL = "thumbnails";

  private static final String CONTENTFILE = "contentfile";

  ICacheDescriptor draftCacheDesc;

  ICacheDescriptor publishCacheDesc;

  ThumbnailDescriptor draftThumbCacheDesc;

  ThumbnailDescriptor publishThumbCacheDesc;

  IDocumentEntry draft;

  IDocumentEntry publishVer;

  ECMNewsHandler handler;

  UserBean user;

  private File targetFullImagesDir;

  private File targetThumbnailsDir;

  private File targetCacheHome;

  private File srcCacheHome;

  public ECMCopyCacheJob(ECMNewsHandler handler, UserBean user, IDocumentEntry draft, IDocumentEntry publishVer)
  {
    this.user = user;
    this.handler = handler;
    this.draft = draft;
    this.publishVer = publishVer;
    draftCacheDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, draft, null);
    draftThumbCacheDesc = new ThumbnailDescriptor(draft);
    logger.log(Level.FINER, "draftCacheDesc: " + draftCacheDesc.getInternalURI());
    logger.log(Level.FINER, "draftThumbCacheDesc: " + draftThumbCacheDesc.getInternalURI());
    if (publishVer != null)
    {
      publishCacheDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, publishVer, null);
      publishThumbCacheDesc = new ThumbnailDescriptor(publishVer);
      logger.log(Level.FINER, "publishCacheDesc: " + publishCacheDesc.getInternalURI());
      logger.log(Level.FINER, "publishThumbCacheDesc: " + publishThumbCacheDesc.getInternalURI());
    }
  }

  private File getWorkingDir()
  {
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);

    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();

    jContext.mediaURI = draft.getDocUri();
    jContext.sourceMime = draft.getMimeType();
    jContext.targetMime = docServiceProvider.getDocumentType(draft.getMimeType());
    jContext.modified = draft.getModified().getTimeInMillis();
    jContext.forceSave = false;
    jContext.requester = user;
    jContext.docEntry = draft;
    jContext.draftDescriptor = draftCacheDesc;
    jContext.isHTML = draftCacheDesc.getViewContext() != ViewContext.VIEW_IMAGE;

    return new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId()));
  }

  private boolean hasUploadConversion()
  {
    File f = new File(new File(srcCacheHome, publishVer.getDocId()), FULLIMAGE);
    try
    {
      if (publishCacheDesc.getViewContext() != ViewContext.VIEW_IMAGE)
      {
        f = f.getParentFile();
      }
      if (f.exists())
      {
        File result = new File(f, "result.json");
        if (!result.exists())
        {
          return false;
        }
        JSONObject res;

        res = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(result)));
        Object obj = res.get("isSuccess");
        if (obj != null)
        {
          return (Boolean) obj;
        }
      }
    }
    catch (FileNotFoundException e)
    {
      logger.log(Level.WARNING, "Failed to get result.json for upload conversion check." + e.getMessage());
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Failed to parse result.json for upload conversion check." + e.getMessage());
    }
    return false;
  }

  @Override
  public void run()
  {
    if (publishVer != null && publishCacheDesc != null)
    {
      /**
       * FIXME: There are two user actions that can trigger CREATE_DRAFT event. 1) Check-out a draft, in which document content doesn't
       * changes. 2) Upload new version > Save as draft, in which document content may changes. Since we don't have content hash provided by
       * CMIS document entry, we just use media size as a temporary solution. In situation 2), skip copy and start conversion.
       */

      logger.log(Level.FINEST, ">>> publish media size={0} ", publishVer.getMediaSize());
      logger.log(Level.FINEST, ">>> draft media size={0} ", draft.getMediaSize());
      if (publishVer.getMediaSize() == draft.getMediaSize())
      {
        boolean isUploaded = false;

        /**
         * !Important: Cannot trust the cacheDesc for publish version here, since the last modify will be modified in docEntry while
         * document is checked-out. Need to traverse and get the latest cache directory as copy source.
         */
        srcCacheHome = getLatestModifiedPath(new File(publishCacheDesc.getInternalURI()).getParentFile().listFiles());
        logger.log(Level.FINER, "srcCacheHome: " + srcCacheHome);

        if (!isCacheValid())
        {
          if (!hasUploadConversion())
          {
            logger.log(Level.FINER, "Cannot find copy source. No cache for publish version.");
            handler.conversionService(user, draft);
            return;
          }
          else
          {
            isUploaded = true;
          }
        }

        logger.log(Level.FINER, "Found copy source. Start to copy cache from publish version. isUploaded= " + isUploaded);
        prepare();

        if (copyDocCache(isUploaded))
        {
          // failed to copy thumbnails will not trigger a new conversion.
          copyThumbnails();
          return;
        }
        else
        {
          logger.log(Level.WARNING, "Failed to copy cache from publish version. Remove draft cache.");
          FileUtil.removeDirectory(targetCacheHome);
        }
      }
      else
      {
        logger.log(Level.FINER, "Media size changed, need to start a new conversion.");
      }
    }
    handler.conversionService(user, draft);
  }

  private boolean isCacheValid()
  {
    /**
     * !Important: Cannot trust the cacheDesc.isValid here, since the last modify will be modified in docEntry while document is
     * checked-out. Need to use the re-checked srcCacheHome.
     */

    boolean ret;
    if (draftCacheDesc.getViewContext() == ViewContext.VIEW_IMAGE)
    {
      ret = CacheDescriptor.metaFileValid(new File(srcCacheHome, ICacheDescriptor.CACHE_META_FILE_LABEL))
          && CacheDescriptor.metaFileValid(new File(srcCacheHome, ICacheDescriptor.RENDITION_META_FILE_LABEL));
    }
    else
    {
      ret = CacheDescriptor.metaFileValid(new File(srcCacheHome, ICacheDescriptor.CACHE_META_FILE_LABEL));

    }
    return ret;
  }

  private boolean copyDocCache(boolean isUploaded)
  {
    srcCacheHome = getLatestModifiedPath(new File(publishCacheDesc.getInternalURI()).getParentFile().listFiles());
    File srcFullImagesDir;
    File srcThumbnailsDir;
    File srcJsonDir;
    if (isUploaded)
    {
      srcFullImagesDir = new File(new File(srcCacheHome, publishVer.getDocUri()), FULLIMAGE);
      srcThumbnailsDir = new File(new File(srcCacheHome, publishVer.getDocUri()), THUMBNAIL);
      srcJsonDir = srcFullImagesDir;
    }
    else
    {
      srcFullImagesDir = new File(new File(srcCacheHome, CacheStorageManager.MEDIA_INFO_FILE_LABEL), FULLIMAGE);
      srcThumbnailsDir = new File(new File(srcCacheHome, CacheStorageManager.MEDIA_INFO_FILE_LABEL), THUMBNAIL);
      srcJsonDir = srcCacheHome;
    }
    logger.log(Level.FINER, "srcFullImagesDir: " + srcFullImagesDir);
    logger.log(Level.FINER, "srcThumbnailsDir: " + srcThumbnailsDir);
    logger.log(Level.FINER, "srcJsonDir: " + srcJsonDir);
    try
    {
      FileUtil.copyDirectory(srcFullImagesDir, targetFullImagesDir, new FilenameFilter()
      {

        @Override
        public boolean accept(File dir, String name)
        {
          if (name.matches(RenditionUtil.sourcePattern))
          {
            return true;
          }
          else
          {
            return false;
          }
        }
      });

      FileUtil.copyDirectory(srcThumbnailsDir, targetThumbnailsDir);

      File srcContentDir = new File(srcCacheHome, publishVer.getDocUri());
      try
      {
        FileUtil.copyDirectory(srcContentDir, targetCacheHome, new FilenameFilter()
        {

          @Override
          public boolean accept(File dir, String name)
          {
            if (name.equals(CONTENTFILE))
            {
              return true;
            }
            else
            {
              return false;
            }
          }
        });
      }
      catch (IOException e)
      {
        logger.log(Level.WARNING, "Failed to copy contentfile.", e);
      }

      FileUtil.copyDirectory(srcJsonDir, targetFullImagesDir, new FilenameFilter()
      {

        @Override
        public boolean accept(File dir, String name)
        {
          if (name.endsWith(".json"))
          {
            return true;
          }
          else
          {
            return false;
          }
        }
      });
      try
      {
        new File(getWorkingDir(), System.currentTimeMillis() + Job.CACHE_AGE_BIT + getWorkingDir().getName()).createNewFile();
      }
      catch (IOException e)
      {
        logger.log(Level.WARNING, "Create Cache Age Bit File Failed.", e);
      }

    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Failed to copy cache from [" + srcCacheHome + "] to [" + targetCacheHome + "]. IsUploaded: " + isUploaded
          + ". Error:" + e.getLocalizedMessage());
      return false;
    }
    return true;
  }

  private void prepare()
  {
    String uploadCacheRoot = this.draftCacheDesc.getInternalURI() + File.separator + draft.getDocId();
    targetCacheHome = new File(uploadCacheRoot);
    targetCacheHome.mkdirs();
    targetFullImagesDir = new File(uploadCacheRoot + File.separator + FULLIMAGE);
    targetThumbnailsDir = new File(uploadCacheRoot + File.separator + THUMBNAIL);
    targetFullImagesDir.mkdirs();
    targetThumbnailsDir.mkdirs();

    logger.log(Level.FINER, "targetCacheHome: " + targetCacheHome);
    logger.log(Level.FINER, "targetFullImagesDir: " + targetFullImagesDir);
    logger.log(Level.FINER, "targetThumbnailsDir: " + targetThumbnailsDir);
  }

  private File getLatestModifiedPath(File[] folders)
  {
    if (folders == null || folders.length == 0)
      return null;

    File latestModifed = null;
    Calendar latestCal = Calendar.getInstance();
    latestCal.setTimeInMillis(0);

    for (File f : folders)
    {
      try
      {
        long curModified = Long.parseLong(f.getName());
        Calendar present = Calendar.getInstance();
        present.setTimeInMillis(curModified);
        if (latestCal.before(present))
        {
          latestModifed = f;
          latestCal = present;
        }
      }
      catch (NumberFormatException e)
      {
        // nothing
      }
    }
    return latestModifed;
  }

  private boolean copyThumbnails()
  {
    boolean result = false;
    File targetCacheHome = new File(draftThumbCacheDesc.getThumbnailServiceURI());
    File srcCacheHome = getLatestModifiedPath(new File(publishThumbCacheDesc.getInternalURI()).getParentFile().listFiles());
    srcCacheHome = new File(srcCacheHome, "thumbnailService");

    if (new File(srcCacheHome, "size.json").exists())
    {
      try
      {
        FileUtil.copyDirectory(srcCacheHome, targetCacheHome);
        result = true;
        logger.log(Level.INFO, "Successfully copied thumbnails from [" + srcCacheHome + "] to [" + targetCacheHome + "]");
      }
      catch (IOException e)
      {
        logger.log(Level.WARNING,
            "Failed to copy thumbnails from [" + srcCacheHome + "] to [" + targetCacheHome + "]. Error:" + e.getLocalizedMessage());
      }
    }
    return result;
  }

  @Override
  public void release()
  {
    // TODO Auto-generated method stub

  }

}
