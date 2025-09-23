/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.tasks;

import java.io.File;
import java.io.FilenameFilter;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.conversion.ConversionConstants;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONObject;

public class UpgradeUploadConversionTask implements IMigrationTask
{
  private static final Logger LOG = Logger.getLogger(UpgradeUploadConversionTask.class.getName());

  private static final Pattern JOB_ID_PATTERN = Pattern.compile("([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})|([0-9a-f]{32})");

  private static final FilenameFilter DRAFT_FILTER = new FilenameFilter()
  {
    public boolean accept(File paramFile, String paramString)
    {
      Matcher matcher = JOB_ID_PATTERN.matcher(paramString);
      return matcher.matches();
    }
  };

  @Override
  public MigrationTaskContext check(File orgHome, File draftHome)
  {
    LOG.entering(this.getClass().getName(), "check", new Object[] { draftHome.getPath() });
    boolean needUpgrade = false;
    MigrationTaskContext context = null;
    try
    {
      String jobId = getNewestJobId(draftHome.getAbsolutePath());
      if (jobId != null)
      {
        File uploadFolder = getUploadFolder(draftHome.getAbsolutePath(), jobId);
        if (uploadFolder != null)
        {
          String ext = getDocumentExt(uploadFolder);
          if (ext != null)
          {
            String sourceMime = Platform.getMimeType("." + ext);
            File targetFolder = new File(uploadFolder, "concord");
            boolean convertCompleted = false;
            if (targetFolder.exists() && targetFolder.isDirectory())
            {
              File resultFile = new File(targetFolder, ConversionConstants.RESULT_FILE_NAME);
              if (resultFile.exists())
                convertCompleted = true;
            }
            if (convertCompleted)
            {
              IDocumentService docSrv = DocumentServiceUtil.getDocumentService(sourceMime);
              if (docSrv != null)
              {
                needUpgrade = ConcordUtil.checkDraftFormatVersion(targetFolder.getPath(), docSrv.getDraftFormatVersion());
              }
              if (needUpgrade)
              {
                FileUtil.nfs_cleanDirectory(targetFolder, FileUtil.NFS_RETRY_SECONDS);
                FileUtil.nfs_delete(targetFolder, FileUtil.NFS_RETRY_SECONDS);
                String customerId = orgHome.getParentFile().getName();
                context = new MigrationTaskContext(draftHome.getPath(), uploadFolder.getPath(), getClass().getName(), customerId,
                    RepositoryServiceUtil.getDefaultRepositoryId(), null, ext, 0);
              }
            }
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to check file " + draftHome.getPath(), e);
    }

    LOG.exiting(this.getClass().getName(), "check", new Object[] { draftHome.getPath(), needUpgrade });
    return context;
  }

  @Override
  public boolean migrate(MigrationTaskContext context) throws Exception
  {
    String mime = Platform.getMimeType("." + context.getExtension());

    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(mime);
    IDocumentEntry entry = context.getDocumentEntry();

    File root = new File(context.getWorkHome());

    File contentFile = new File(root, "contentfile." + context.getExtension());

    if (!contentFile.exists() || !contentFile.isFile())
    {
      LOG.log(Level.WARNING, "Did not find contentfile." + context.getExtension() + " when upgrade " + context.getWorkHome()
          + ". Upgrade cancel.");
      return false;
    }
    /*
    JSONObject parameters = new JSONObject();
    parameters.put(Constant.KEY_UPLOAD_CONVERT, "true");
    parameters.put(Constant.KEY_BACKGROUND_CONVERT, "true");
    parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, root.getName());
    */
    ImportDocumentContext parameters = new ImportDocumentContext();
    parameters.uploadConvert = true;
    parameters.backgroundConvert = true;
    parameters.uploadConvertID = root.getName();
    try
    {
      docSrv.importDocument(null, entry, parameters);
    }
    catch (ConversionException e)
    {
      LOG.log(Level.WARNING, "Exception got when upgrade " + context.getWorkHome(), e);
      if ((e.getErrCode() == ConversionException.EC_CONV_SERVICE_UNAVAILABLE) || (e.getErrCode() == ConversionException.EC_CON_SERVER_BUSY))
      {
        throw e;
      }
      else
      {
        return false;
      }
    }
    catch (RepositoryAccessException rae)
    {
      int nErrorCode = rae.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
      {
        LOG.log(Level.WARNING, "Did not find document on repository when upgrading draft {0}.", context.getWorkHome());
      }
      else
      {
        LOG.log(Level.WARNING, "Download document from repository thrown errors when upgrading draft " + context.getWorkHome(), rae);
      }
      return false;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception got when upgrade " + context.getWorkHome(), e);
      return false;
    }

    return true;
  }

  private File getUploadFolder(String draftHome, String jobID)
  {
    File uploadConvertFolder = new File(draftHome + IDraftStorageAdapter.separator + "temp" + IDraftStorageAdapter.separator + "upload");
    if (uploadConvertFolder.exists())
    {
      File mediaFolder = new File(uploadConvertFolder, jobID);
      if (mediaFolder.exists())
      {
        return mediaFolder;
      }
    }
    return null;
  }

  private String getNewestJobId(String draftHome)
  {
    String jobId = null;
    File uploadDir = new File(draftHome + IDraftStorageAdapter.separator + "temp" + IDraftStorageAdapter.separator + "upload");
    if ((uploadDir != null) && (uploadDir.isDirectory()))
    {
      File[] drafts = uploadDir.listFiles(DRAFT_FILTER);
      if (drafts != null)
      {
        long time = 0;
        for (File file : drafts)
        {
          long lastModified = file.lastModified();
          if (lastModified > time && file.isDirectory())
          {
            time = lastModified;
            jobId = file.getName();
          }
        }
      }
    }
    return jobId;
  }

  private String getDocumentExt(File uploadFolder)
  {
    String ext = null;
    if ((uploadFolder != null) && (uploadFolder.isDirectory()))
    {
      File[] files = uploadFolder.listFiles();
      if (files != null)
      {
        for (File file : files)
        {
          if (file.getName().startsWith("contentfile."))
          {
            ext = file.getName().split("contentfile.")[1];
          }
        }
      }
    }
    return ext;
  }
}