/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Hashtable;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.conversion.ConversionTask;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.ConversionEvent;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.platform.conversion.TaskListener;
import com.ibm.concord.viewer.platform.conversionResult.ConversionConstants;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.DocumentServiceException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.viewer.platform.encryption.Encryptor;

/**
 * @author sfeiguo@cn.ibm.com
 * 
 */
public class SpreadsheetDocumentServiceHelper extends DocumentServiceHelper
{
  static Logger LOG = Logger.getLogger(SpreadsheetDocumentServiceHelper.class.getName());

  private static final String CLASS_NAME = SpreadsheetDocumentServiceHelper.class.getName();

  private ConversionTask htmlTask = null;

  private String targetMimeType = "application/json";

  public SpreadsheetDocumentServiceHelper(UserBean caller, String userAgent, String mode, IDocumentEntry entry,
      IConversionService conversionService, String targetMimeType, IConversionJob job)
  {
    super(caller, userAgent, mode, entry, conversionService, targetMimeType, job);
  }

  protected void setCacheDescriptor4UploadConversion()
  {
    cacheDesc = new HTMLCacheDescriptor(caller, entry);
    LOG.log(Level.INFO, ">>> HTML upload conversion request. Path= {0}", cacheDesc.getInternalURI());
  }

  protected boolean isHTML()
  {
    return true;
  }

  public void exec() throws Exception
  {
    StringBuffer msg = new StringBuffer("Viewer conversion fails.");
    try
    {
      if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
      {
        this.manageRequest();
      }
      else if (job.getCurrentType().equals(Constant.STATUS_MANAGE))
      {
        String resultPath = this.cacheDesc.getInternalURI() + File.separator + entry.getDocId();
        JSONObject result = ConversionUtils.getConversionResult(resultPath);
        int statusCode = (Integer) result.get(ConversionUtils.STATUS_CODE);
        if (String.valueOf(statusCode).equals(ConversionConstants.SC_OK)
            || String.valueOf(statusCode).equals(ConversionConstants.SC_ACCEPTED))
        {
          CacheStorageManager.getCacheStorageManager().prepareCache(this.cacheDesc);
          this.manageWork();
        }
        else if (String.valueOf(statusCode).equals(ConversionConstants.ERROR_FILE_IS_TOO_LARGE))
        {
          ConversionException ce = new ConversionException("Found upload coversion error during manage work for view service.",
              ConversionException.EC_CONV_DOC_TOOLARGE);
          ce.getData().put(Constant.JOBID, result.get(ConversionTask.JOB_ID));
          Object conv_err_code = result.get("conv_err_code");
          if (conv_err_code != null)
          {
            ce.getData().put(Constant.CONV_ERR_CODE, conv_err_code);
          }
          throw ce;
        }
      }
      else
      {

        // normal logic for view      
        cleanFolder(new File(this.cacheDesc.getInternalURI() + File.separator + entry.getDocId()));
        if(!Constant.STATUS_PASSWORD_PROMPT.equalsIgnoreCase(job.getCurrentType())) {          
          job.setCurrentType(Constant.STATUS_VIEW);          
        }
        
        this.prepare();
        try
        {
          this.convertHTML();
          this.queryState();
        }
        catch (ConversionException e)
        {
          this.correctMimeType(e);
          this.convertHTML();
          this.queryState();
        }
        storeCache();
        cleanSourceAndTempDocumentAfterConversion();
        LOG.log(Level.INFO, "Rendition conversion done. Document Id: " + entry.getDocId());
      }
    }
    catch (ConversionException e)
    {
      msg.append(ServiceCode.S_ERROR_CONVERSION_EXCEPTION);
      msg.append(" Error code:" + e.getErrCode());
      msg.append(" Error message:" + e.getMessage());
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_CONVERSION_EXCEPTION, msg.toString()));
      throw e;
    }
    catch (RepositoryAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString()));
      throw e;
    }
    catch (FileNotFoundException e)
    {
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, "File is not found." + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (InterruptedException e)
    {
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, "InterruptedException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (IOException e)
    {
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      msg.append(" IO Message:" + e.getMessage());
      LOG.log(Level.SEVERE, "IOException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (UnsupportedMimeTypeException e)
    {
      msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
      msg.append("The MIME type of ");
      msg.append(entry.getDocUri());
      msg.append(" is " + entry.getMimeType());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
      throw e;
    }
    catch (CacheDataAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACESS_CACHE_DATA);
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      msg.append(" Cache Directory:" + cacheDesc.getInternalURI());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_CACHE_DATA, msg.toString()));
      throw e;
    }
    catch (Exception e)
    {
      msg.append(ServiceCode.S_SEVERE_UNKNOWN_ERROR);
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_UNKNOWN_ERROR, msg.toString()), e);
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
  }

  private void convertHTML() throws Exception
  {
    this.options.clear();
    this.options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.lockerFileName);
    this.options.put(Constant.VIEWER_SHARED_DATA_NAME, cacheDesc.getSharedDataName());
    this.options.put(Constant.VIEWER_SHARED_DATA_ROOT, cacheDesc.getCacheHome());

    if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
    {
      String targetMediaPath = this.cacheDesc.getInternalURI() + File.separator + entry.getDocId();
      File targetMediaFolder = new File(targetMediaPath);
      targetMediaFolder.mkdirs();
      this.htmlTask = conversionService.convert(this.filePath, this.mimeType, getTargetMimeType(), targetMediaFolder.getAbsolutePath(),
          this.options, true, job);
    }
    else
    {
      this.htmlTask = conversionService.convert(this.filePath, this.mimeType, getTargetMimeType(), this.cacheDesc.getHtmlURI(),
          this.options, true, job);
      this.helper.addElement(Constant.STEP_KEY, Constant.JOB_HTML_STARTED);
    }
  }

  public void manageWork() throws Exception
  {
    try
    {
      final String conversionDir = cacheDesc.getInternalURI() + File.separator + entry.getDocId();
      ConversionTask task = conversionService.createConversionTask(TaskCategory.HTML);
      Hashtable<String, Object> params = new Hashtable<String, Object>();
      params.put("targetPath", conversionDir);
      task.setParamMap(params);

      task.addTaskListenner(new TaskListener()
      {

        public void onEvent(ConversionEvent event) throws FileNotFoundException, InterruptedException, IOException
        {
          if (event.equals(ConversionEvent.DONE))
          {
            // move all the conversion result
            File mediaDir = new File(cacheDesc.getHtmlURI());
            File[] conversionResults = new File(conversionDir).listFiles();
            for (File f : conversionResults)
            {
              File dest = new File(mediaDir, f.getName());
              if (f.isDirectory()) {
                if (!NFSFileUtil.nfs_MoveDirToDir(f, dest, NFSFileUtil.NFS_RETRY_SECONDS)) {
                  throw new IOException("Exception raised when moving directory: " + f.getAbsolutePath());
                }
              } else {
                boolean succ = NFSFileUtil.nfs_renameFile(f, dest, NFSFileUtil.NFS_RETRY_SECONDS); 
                if (!succ)
                {
                  throw new IOException("Exception raised when moving file: " + f.getAbsolutePath());
                }
              }
            }
            // clean up source document for space save
            cleanSourceAndTempDocumentAfterConversion();
          }
        }

        public void setConvertDir(String convertDir)
        {
        }

        public String getConvertDir()
        {
          return null;
        }

        public void addListener(TaskListener otherType)
        {
          throw new RuntimeException("addListener is not supported by this TaskListener");
        }

      });

      conversionService.queryState(new ConversionTask[] { task }, job);

      storeCache();
      LOG.log(Level.INFO, "Rendition conversion done. Manage work for view. Document Id: " + entry.getDocId());
    }
    catch (Exception e)
    {
      LOG.log(Level.INFO, "Rendition conversion failed. Manage work for view. Document Id: " + entry.getDocId());
      throw e;
    }
    finally
    {
      // If manage work failed, we should clean the upload conversion, if the upload conversion is not cleaned and invalid result file is
      // in,
      // then this document can never be converted again
      // If manage work succeeded, the folder also need to be cleaned
      cleanFolder(new File(this.cacheDesc.getInternalURI() + File.separator + entry.getDocId()));
    }
  }

  public void manageRequest()
  {
    try
    {
      LOG.log(Level.FINE, "Submitting request for HTML conversion on upload. Document Id: " + entry.getDocId());

      prepare();
      convertHTML();

      LOG.log(Level.INFO, "HTML conversion on upload request submitted. Document Id: " + entry.getDocId());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Conversion on upload failed. Document Id:" + this.entry.getDocId());
    }
  }

  private void storeCache() throws Exception
  {
    DocumentServiceUtil.storeDraft(this.caller, this.entry, null, true);
    // encrypt here
    /* for mail and vsfiles repository files, encrypt the html cache content */
    if (RepositoryServiceUtil.needEncryption(this.entry.getRepository()))
    {
      encryptHtmlCache();
    }

    helper.addElement(Constant.STEP_KEY, Constant.JOB_STORE_CACHE_FINISHED);
    LOG.log(Level.FINEST, "importDocument:" + this.cacheDesc.getInternalURI() + " " + " finished");
  }

  protected String getTargetMimeType()
  {
    return this.targetMimeType;
  }

  private void queryState() throws Exception
  {
    conversionService.queryState(new ConversionTask[] { this.htmlTask }, job);
    this.helper.addElement(Constant.STEP_KEY, Constant.JOB_QUERYSTATE_FINISHED);
  }

  private void encryptHtmlCache()
  {
    File mediaDir = new File(cacheDesc.getHtmlURI());
    if (!mediaDir.exists())
      return;

    File encryptDir = new File(mediaDir.getAbsolutePath() + ".enc");
    if (!encryptDir.mkdir())
      return;

    boolean allencrypted = true;

    try
    {
      LOG.log(Level.FINE, CLASS_NAME, "begin to encrypt html cache in folder " + mediaDir);
      allencrypted = encryptFolder(mediaDir, encryptDir, entry, caller);

      if (allencrypted == true)
      {
        File done = new File(encryptDir, ConversionUtils.ENCRYPTION_DONE);
        done.createNewFile();
        File tmpDel = new File(cacheDesc.getHtmlURI() + ".del");
        mediaDir.renameTo(tmpDel);
        encryptDir.renameTo(mediaDir);
        FileUtils.deleteDirectory(tmpDel);
        LOG.log(Level.FINE, CLASS_NAME, "encrypt done for html cache in folder " + mediaDir);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when try to encrypt the html cache under directory, {0} {1}", new Object[] { mediaDir, e });
    }

    if (allencrypted == false)
    {
      encryptDir.delete();
    }
  }

  private boolean encryptFolder(File srcdir, File destdir, IDocumentEntry entry, UserBean user)
  {
    boolean rc = true;

    File[] cachefiles = srcdir.listFiles();
    try
    {
      for (File f : cachefiles)
      {
        File dest = new File(destdir, f.getName());
        if (f.isFile())
        {
          String fname = f.getName();
          if (0 == fname.compareTo("meta.json") || 0 == fname.compareTo("status.json") || 0 == fname.compareTo("conversionVersion.txt")
              || 0 == fname.compareTo("error.json") || 0 == fname.compareTo("result.json") || 0 == fname.compareTo("password_hash.json"))
            FileUtils.copyFile(f, dest);
          else
          {
            InputStream in = new FileInputStream(f);
            InputStream en = ViewerUtil.getEncryptStream(in, entry, user, Encryptor.EncryptionMode.ENCRYPTION);
            FileUtil.copyInputStreamToFile(en, dest);
          }
        }
        else
        {
          File subdir = new File(destdir, f.getName());
          subdir.mkdir();
          rc = encryptFolder(f, subdir, entry, user);
          if (rc == false)
          {
            break;
          }
        }
      }
    }
    catch (IOException e)
    {
      rc = false;
    }

    return rc;
  }

  public void cleanSourceAndTempDocumentAfterConversion()
  {
    super.cleanSourceAndTempDocumentAfterConversion();
    File contentfile = new File(cacheDesc.getHtmlURI(), "contentfile");
    if (contentfile.exists())
      contentfile.delete();
  }
}
