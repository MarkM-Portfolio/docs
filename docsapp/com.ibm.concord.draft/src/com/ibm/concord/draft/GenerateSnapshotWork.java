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

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.FileLocker;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.framework.IComponent;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;

public class GenerateSnapshotWork implements Work
{
  private static final Logger LOGGER = Logger.getLogger(GenerateSnapshotWork.class.getName());

  private static final String SNAPSHOT_LOCK_FILE = "snapshot.lck";
  private static final String SNAPSHOT_READABLE_TAG = "readable.tag";
  
  private static final int WAIT_VIEWER_TIME_LIMIT;  
  static {
    int value = -1;
    try
    {
      JSONObject config = Platform.getConcordConfig().getSubConfig("viewersnapshot");
      if (config != null && config.get("wait_viewer_reading_time") != null)
      {
        value = Integer.parseInt(config.get("wait_viewer_reading_time").toString());
      }
      else
      {
        value = 10000;
      }
    }
    catch (Exception e)
    {
      value = 10000;
      LOGGER.log(Level.WARNING, "wait_viewer_reading_time configuration is invalid.", e);
    }
    finally
    {
      WAIT_VIEWER_TIME_LIMIT = value;
    }
  }
  
  private static final int WAIT_VIEWER_TIME_INTERVAL = 200; //200 ms
  private static final int WAIT_VIEWER_TIME_LIMIT_COUNT = WAIT_VIEWER_TIME_LIMIT/WAIT_VIEWER_TIME_INTERVAL; 
  
  private static final int WAIT_LOCK_TIME_LIMIT = WAIT_VIEWER_TIME_LIMIT + 2000; //2 sec longer than waiting for viewer
  private static final int WAIT_LOCK_TIME_INTERVAL = 200;
  private static final int WAIT_LOCK_TIME_LIMIT_COUNT = WAIT_LOCK_TIME_LIMIT/WAIT_LOCK_TIME_INTERVAL;

  private DraftDescriptor draftDesc;
  private String snapshotTempPath;
  private long newTimeStamp;
  private boolean recordError;
  private IDocumentEntry docEntry;

  public GenerateSnapshotWork(DraftDescriptor draftDesc, String snapshotTempPath, long newTimeStamp)
  {
    this(draftDesc, snapshotTempPath, newTimeStamp, false, null);
  }
  
  public GenerateSnapshotWork(DraftDescriptor draftDesc, String snapshotTempPath, long newTimeStamp, IDocumentEntry docEntry)
  {
    this(draftDesc, snapshotTempPath, newTimeStamp, false, docEntry);
  }

  public GenerateSnapshotWork(DraftDescriptor draftDesc, String snapshotTempPath, long newTimeStamp, boolean recordError)
  {
    this(draftDesc, snapshotTempPath, newTimeStamp, recordError, null);
  }
  public GenerateSnapshotWork(DraftDescriptor draftDesc, String snapshotTempPath, long newTimeStamp, boolean recordError, IDocumentEntry docEntry)
  {
    this.draftDesc = draftDesc;
    this.snapshotTempPath = snapshotTempPath;
    this.newTimeStamp = newTimeStamp;
    this.recordError = recordError;
    this.docEntry = docEntry;
  }

  public void run()
  {
    LOGGER.entering(GenerateSnapshotWork.class.getName(), "run", new Object[] { draftDesc, snapshotTempPath, newTimeStamp, recordError});
    
    String snapshotPath = draftDesc.getSnapshotURI();
    String snapshotMediapath = draftDesc.getSnapshotMediaURI();
    File snapshotLockFile = new File(draftDesc.getSnapshotURI(), SNAPSHOT_LOCK_FILE);
    FileLocker fileLock = new FileLocker(snapshotLockFile);
    
    int waitCount = 0;
    boolean shouldGenerate = false;
    
    File snapshotTempFolder = new File(snapshotTempPath);
    File snapshotFolder = new File(snapshotPath);
    File snapshotMediaFolder = new File(draftDesc.getSnapshotMediaURI());
    File snapshotTrashFolder = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));

    if (!snapshotFolder.exists() || !snapshotFolder.isDirectory())
    {
      FileUtil.nfs_mkdirs(snapshotFolder, FileUtil.NFS_RETRY_SECONDS);
    }
    if (!snapshotLockFile.exists())
    {
      try
      {
        FileUtil.nfs_createNewFile(snapshotLockFile, FileUtil.NFS_RETRY_SECONDS);
      }
      catch (IOException e)
      {
        LOGGER.log(Level.SEVERE, "Exceptions happen while creating snapshot.lck file", e);
      }
    }

    while (!fileLock.lock()) 
    {
      if (waitCount++ > WAIT_LOCK_TIME_LIMIT_COUNT)
      {
        LOGGER.log(Level.SEVERE, "Timeout lock snapshot.lck, do not generate snapshot now. {0}", new Object[] { draftDesc });
        return;
      }
      try
      {
        Thread.sleep(WAIT_VIEWER_TIME_INTERVAL);
      }
      catch (InterruptedException e)
      {
        LOGGER.log(Level.SEVERE, "Interrupted to lock snapshot.lck, dont't generate snapshot now. {0}", new Object[] { draftDesc });
        return;
      }
    }

    try
    {
      if (recordError)
      {
        shouldGenerate = true;
      }
      else if (DraftStorageManager.getDraftStorageManager(false).isSnapshotExisted(draftDesc))
      {
        boolean needUpgrade = false;
        if (docEntry != null)
        {
          IComponent docSrvComp = Platform.getComponent("com.ibm.concord.document.services");
          IDocumentServiceProvider dsp = (IDocumentServiceProvider) docSrvComp.getService(IDocumentServiceProvider.class);
          String version = (String) dsp.getDocumentService(docEntry.getMimeType()).getConfig().get("draftFormatVersion");
          needUpgrade = ConcordUtil.checkDraftFormatVersion(draftDesc.getSnapshotMediaURI(), version);
        }
        long snapshotTimeStamp = DraftStorageManager.getDraftStorageManager(false).readTimeStamp(snapshotMediapath);
        if (newTimeStamp >= snapshotTimeStamp || needUpgrade)
        {
          shouldGenerate = true;
        }
        else
        {
          shouldGenerate = false;
        }
      }
      else
      {
        shouldGenerate = true;
      }

      if (!shouldGenerate)
      {
        return;
      }
      File readableTag = new File(draftDesc.getSnapshotURI(), SNAPSHOT_READABLE_TAG);
      if (readableTag.exists())
      {
        FileUtil.nfs_delete(readableTag, FileUtil.NFS_RETRY_SECONDS);
      }
      DraftStorageManager.getDraftStorageManager(false).updateSnapshotTimeStamp(draftDesc, snapshotTempPath, newTimeStamp);
      if (snapshotMediaFolder.exists())
      {
        waitCount = 0;
        while (!snapshotMediaFolder.renameTo(snapshotTrashFolder))
        {
          if (waitCount++ > WAIT_VIEWER_TIME_LIMIT_COUNT)
          {
            LOGGER.log(Level.SEVERE, "Timeout rename snapshotTrashFolder, can not generate snapshot now. {0}", new Object[] { draftDesc });
            return;
          }
          try
          {
            Thread.sleep(WAIT_VIEWER_TIME_INTERVAL);
          }
          catch (InterruptedException e)
          {
            LOGGER.log(Level.SEVERE, "Interrupted to rename snapshotTrashFolder, can not generate snapshot now. {0}",
                new Object[] { draftDesc });
            return;
          }
        }
      }

      waitCount = 0;

      if (!snapshotTempFolder.renameTo(snapshotMediaFolder))
      {
        LOGGER.log(Level.WARNING, "failed to rename " + snapshotTempFolder.getAbsolutePath() + " to " + snapshotMediaFolder.getAbsolutePath() + "! Start to copy...");
        FileUtil.cleanDirectory(snapshotMediaFolder);
        if (!snapshotMediaFolder.delete())
        {
          LOGGER.log(Level.WARNING, "failed to delete meida directory " + snapshotMediaFolder.getAbsolutePath());
        }
        if(!FileUtil.nfs_copyDirToDir(snapshotTempFolder, snapshotMediaFolder, FileUtil.NFS_RETRY_SECONDS))
        {
          LOGGER.log(Level.SEVERE, "failed to copy snapshot, can not generate snapshot now. {0}", new Object[] { draftDesc });
          return;
        }
      }

      if (!readableTag.exists())
      {
        try
        {
          FileUtil.nfs_createNewFile(readableTag, FileUtil.NFS_RETRY_SECONDS);
        }
        catch (IOException e)
        {
          LOGGER.log(Level.SEVERE, "Exceptions happen while creating readable.tag file", e);
          throw new DraftStorageAccessException(draftDesc, e);
        }
      }
      LOGGER.log(Level.FINE, "Succeed to generate snapshot, {0}", new Object[] { draftDesc });

    }
    catch (DraftStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Exceptions happen while running GenerateSnapshotWork", e);
    }
    catch (DraftDataAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Exceptions happen while running GenerateSnapshotWork", e);
    }   
    finally
    {
      fileLock.unlock();
      if (snapshotTempFolder.exists())
      {
        FileUtil.nfs_cleanDirectory(snapshotTempFolder, FileUtil.NFS_RETRY_SECONDS);
        FileUtil.nfs_delete(snapshotTempFolder, FileUtil.NFS_RETRY_SECONDS);
      }
      if (snapshotTrashFolder.exists())
      {
        FileUtil.nfs_cleanDirectory(snapshotTrashFolder, FileUtil.NFS_RETRY_SECONDS);
        FileUtil.nfs_delete(snapshotTrashFolder, FileUtil.NFS_RETRY_SECONDS);
      }
    }
  }

  public void release()
  {

  }
}