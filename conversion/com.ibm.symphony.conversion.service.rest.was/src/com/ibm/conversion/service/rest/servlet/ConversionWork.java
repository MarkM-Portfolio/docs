/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.conversion.service.rest.servlet.util.ServletUtil;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.converter.libre.ThumbnailConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.common.filetype.MimeTypeConstants;
import com.ibm.symphony.conversion.service.common.filetype.MimeTypeDetector;
import com.ibm.symphony.conversion.service.common.filetype.OOXMLPwdDetector;
import com.ibm.symphony.conversion.service.common.util.FileTypeUtil;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.ibm.websphere.asynchbeans.Work;

public class ConversionWork implements Work
{
  private static final Logger LOG = Logger.getLogger(ConversionWork.class.getName());

  private static final int LOG_ID = 1230;// 1230-1239

  private String jobId;

  private String sourceMIMEType;

  private String targetMIMEType;

  private String convVersion;

  private File sourceFile;

  private File tempSourceFile;

  private File targetFolder;

  private File tempTargetFolder;

  private String nfsTargetFolderPath;

  @SuppressWarnings("rawtypes")
  private Map parameters;

  private ConversionResult result = null;

  private boolean completed = false;

  private Thread workThread = null;

  private boolean isViewerWork = false;

  private boolean useSymphonyImport = false;

  private boolean useJavaConverterImport = false;

  private boolean useConversionLib = false;

  private IConversionService conversionService = null;

  public static final String SERVER_INFO_FILE_NAME = "serverInfo.txt";

  public static final String FILE_PWD_PARA_NAME = "filePassword";

  private Object[] logParas = new Object[4];

  private long endTime = System.currentTimeMillis();

  private long wkThreadStartTime = System.currentTimeMillis();

  public File getSourceFile()
  {
    return sourceFile;
  }

  public File getTargetFolder()
  {
    return targetFolder;
  }

  private void copyTargetToNFS(boolean isRelease)
  {
    LOG.entering(getClass().getName(), "copyTargetToNFS ", new Object[] { jobId, isRelease });

    // TargetFolder pre-check to prevent assertion of nfs directory non-existence.
    if (isViewerWork && result.isSucceed() && !targetFolder.exists())
    {
      // Job is for one-page upload conversion
      if (ThumbnailConverter.FULLIMAGE_DIR.equals(targetFolder.getName()))
      {
        String pathName = targetFolder.getParentFile().getParentFile().getParentFile().getParentFile().getParentFile().getParentFile()
            .getName();
        if (ThumbnailConverter.CACHE_DIR_TEMPPREVIEW.equals(pathName) || ThumbnailConverter.CACHE_DIR_CCMPREVIEW.equals(pathName))
        {
          return;
        }
      } // Cache is valid, job is to downsize the first page
      else if (ThumbnailConverter.THUMBNAILSERVICE_DIR.endsWith(targetFolder.getName()))
      {
        {
          String pathName = targetFolder.getParentFile().getParentFile().getParentFile().getParentFile().getParentFile().getName();
          if (ThumbnailConverter.CACHE_DIR_TEMPPREVIEW.equals(pathName) || ThumbnailConverter.CACHE_DIR_CCMPREVIEW.equals(pathName))
          {
            return;
          }
        }
      }
    }

    // after conversion, copy file from local to UNC and change result file path
    File nfsTargetFolder = new File(nfsTargetFolderPath);
    if (NFSFileUtil.nfs_assertExistsDirectory(nfsTargetFolder, NFSFileUtil.NFS_RETRY_SECONDS))
    {
      if (!isRelease && !isViewerWork && result.isSucceed())
      {
        long startCopy = System.currentTimeMillis();
        boolean success = NFSFileUtil.nfs_copyDirToDir(tempTargetFolder, nfsTargetFolder, NFSFileUtil.NFS_RETRY_SECONDS);
        String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
        if (!success)
        {
          ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_NFS_IO_EXCEPTION), new LogEntry(requestid,
              "Fail to copy source files from local to NFS").toString());
          result.addWarning(new ConversionWarning(ConversionConstants.ERROR_NFS_IO_EXCEPTION, false, "", "NFS IO exception"));
          result.setSucceed(false);
          createResultJson();
          NFSFileUtil.nfs_copyFileToDir(new File(tempTargetFolder, Constants.JOB_RESULT_FILE_NAME), nfsTargetFolder, null,
              NFSFileUtil.NFS_RETRY_SECONDS);
        }
        long endCopy = System.currentTimeMillis();
        LOG.log(Level.INFO, new LogEntry(requestid, "copy target file from local: " + tempTargetFolder.getAbsolutePath()
            + " to shared storage: " + nfsTargetFolderPath + " cost time: " + (endCopy - startCopy) + " ms").toString());
      }
      else
      {
        NFSFileUtil.nfs_copyFileToDir(new File(tempTargetFolder, Constants.JOB_RESULT_FILE_NAME), nfsTargetFolder, null,
            NFSFileUtil.NFS_RETRY_SECONDS);
        LOG.log(Level.INFO, "copy target result file from local: " + tempTargetFolder.getAbsolutePath() + " to shared storage: "
            + nfsTargetFolderPath);
      }
    }
    else
    {
      ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_NFS_TARGET_MISSING_ERR, logParas,
          "NFS target folder is not existing,it may be removed for service time out.", null);
    }
    LOG.exiting(getClass().getName(), "Realease:" + isRelease + ". copyTargetToNFS .");
  }

  /**
   * @param sourceMIMEType
   *          - the MIME type of the input file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
   * @param targetMIMEType
   *          - the MIME type of the output file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
   * @param sourceFile
   *          - the file to be converted
   * @param targetFolder
   *          - the target folder to store converted file
   * @param parameters
   *          - the parameters for converter
   * @throws IOException
   * @throws FileNotFoundException
   */

  private void storeConversionResult(boolean isRelease)
  {
    LOG.entering(getClass().getName(), "storeConversionResult ", new Object[] { jobId, isRelease });
    // create conversion version when import document to draft for draft migration
    if (this.convVersion != null)
      createVersionInfo();

    if (!isViewerWork && result.isSucceed())
    {
      if (result.getConvertedFile() != null)
      {
        result.setConvertedFilePath(nfsTargetFolderPath + File.separator + result.getConvertedFile().getName());
      }
    }

    createResultJson();

    LOG.exiting(getClass().getName(), "Realease:" + isRelease + ". storeConversionResult .");
  }

  private void createVersionInfo()
  {
    File resFile = new File(tempTargetFolder, Constants.JOB_RESULT_VERSION_FILE_NAME);
    try
    {
      NFSFileUtil.nfs_writeStringToFile(resFile, this.convVersion, NFSFileUtil.NFS_RETRY_SECONDS);
    }
    catch (IOException e)
    {
      String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
      ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_VERSIONINFO_NEW_ERR, logParas,
          new LogEntry(requestid, String.format("IOException %s", new Object[] { e })).toString(), null);
    }
  }

  private void createStatusJson()
  {
    File statusFile = new File(targetFolder, Constants.JOB_STATUS_FILE_NAME);

    JSONObject statusObj = new JSONObject();
    statusObj.put(Constants.PARAMETER_JOBID, this.jobId);
    try
    {
      NFSFileUtil.nfs_writeStringToFile(statusFile, statusObj.toString(), NFSFileUtil.NFS_RETRY_SECONDS);
    }
    catch (IOException e)
    {
      String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
      ConversionLogger.log(
          LOG,
          Level.WARNING,
          new LogEntry(requestid, String.format("Conversion status object is failed to be written: %s , IOException %s  ", new Object[] {
              statusFile.getAbsolutePath(), e })).toString());
    }
  }

  private void createResultJson()
  {
    File resFile = new File(tempTargetFolder, Constants.JOB_RESULT_FILE_NAME);
    if (resFile.exists())
    {
      ConversionLogger.log(LOG, Level.INFO, "result.json has already existed in directory " + tempTargetFolder);
      resFile.delete();
    }
    JSONObject convRes = new JSONObject();
    convRes.put("isSuccess", result.isSucceed());
    convRes.put("mimeType", result.getMimeType());
    convRes.put("targetFilePath", result.getConvertedFilePath());
    JSONArray errCodes = new JSONArray();
    List<ConversionWarning> convWarnings = result.getWarnings();
    for (int i = 0; i < convWarnings.size(); i++)
    {
      ConversionWarning convWarning = convWarnings.get(i);
      JSONObject warningObj = new JSONObject();
      warningObj.put("id", convWarning.getFetureID());
      warningObj.put("isPreserved", convWarning.isPreserved());
      warningObj.put("location", convWarning.getLocation());
      warningObj.put("description", convWarning.getDescription());
      warningObj.put("parameters", ServletUtil.map2JSONObject(convWarning.getParameters()));
      errCodes.add(warningObj);
    }
    convRes.put("errCodes", errCodes);

    try
    {
      NFSFileUtil.nfs_writeStringToFile(resFile, convRes.toString(), NFSFileUtil.NFS_RETRY_SECONDS);
    }
    catch (IOException e)
    {
      String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
      ConversionLogger.log(
          LOG,
          Level.WARNING,
          new LogEntry(requestid, String.format(" Conversion Result is failed to be written: %s , IOException %s  ",
              new Object[] { resFile.getAbsolutePath(), e })).toString());
    }
  }

  private String getConversionVersion(String sourceMIMEType, String targetMIMEType)
  {
    String version = null;

    if (targetMIMEType.equals(ConversionConstants.HTML_MIMETYPE) || targetMIMEType.equals(ConversionConstants.JSON_MIMETYPE))
    {
      String sourceType = FileTypeUtil.getEditorType(sourceMIMEType);
      if (sourceType != null)
      {
        if (sourceType.equals("document"))
          version = ConversionConstants.CURRENT_CONVERTER_VERSION_DOCUMENT;
        else if (sourceType.equals("presentation"))
          version = ConversionConstants.CURRENT_CONVERTER_VERSION_PRESENTATION;
        else if (sourceType.equals("spreadsheet"))
          version = ConversionConstants.CURRENT_CONVERTER_VERSION_SPREADSHEET;
      }
    }
    return version;
  }

  private File getTmpSourceFile(File sourceFile, File tempFolder)
  {
    File tempSourceFolder = new File(tempFolder, "source-" + UUID.randomUUID());
    if (!tempSourceFolder.exists())
    {
      tempSourceFolder.mkdirs();
    }

    // copy file from UNC to local temp folder
    File tempSourceFile = null;
    boolean success = false;
    long startCopy = System.currentTimeMillis();
    if (NFSFileUtil.nfs_isDirectory(sourceFile, NFSFileUtil.NFS_RETRY_SECONDS))
    {
      success = NFSFileUtil.nfs_copyDirToDir(sourceFile, tempSourceFolder, NFSFileUtil.NFS_RETRY_SECONDS);
      tempSourceFile = tempSourceFolder;
    }
    else
    {
      success = NFSFileUtil.nfs_copyFileToDir(sourceFile, tempSourceFolder, null, NFSFileUtil.NFS_RETRY_SECONDS);
      tempSourceFile = new File(tempSourceFolder, sourceFile.getName());
    }
    long endCopy = System.currentTimeMillis();
    LOG.log(
        Level.INFO,
        "copy source file from shared storage: " + sourceFile.getAbsolutePath() + " to local temp path: "
            + tempSourceFile.getAbsolutePath() + " cost time: " + (endCopy - startCopy) + " ms");

    if ((endCopy - startCopy) > 10000)
      ConversionLogger.log(LOG, Level.WARNING, LOG_ID + 2,
          "It took more than 10s to copy source file from shared storage: " + sourceFile.getAbsolutePath() + " to local temp path: "
              + (endCopy - startCopy) + " ms");

    if (success)
      return tempSourceFile;
    else
      return null;
  }

  private File getTmpTargetFolder(File targetFolder, File tempFolder)
  {
    File tempTargetFolder = null;
    if (targetFolder != null)
    {
      tempTargetFolder = new File(tempFolder, "target-" + UUID.randomUUID());
      if (!tempTargetFolder.exists())
      {
        tempTargetFolder.mkdirs();
      }
    }

    return tempTargetFolder;
  }

  private void initWorkCategory()
  {
    String typeGroup = MimeTypeDetector.MimeTypeGroup.get(this.sourceMIMEType);
    if (ServletUtil.isViewerWork(this.targetMIMEType))
    {
      this.isViewerWork = true;
      if (MimeTypeDetector.MimeTypeGroup_ODF.equals(typeGroup))
      {
        this.useSymphonyImport = true;
      }
    }
    else
    // for editing
    {
      if (this.targetMIMEType.equals(ConversionConstants.HTML_MIMETYPE) || this.targetMIMEType.equals(ConversionConstants.JSON_MIMETYPE))
      {
        this.useJavaConverterImport = true;
      }
      if (MimeTypeDetector.MimeTypeGroup_OFFICE.equals(typeGroup))
      {
        this.useSymphonyImport = true;
      }
      else if (MimeTypeDetector.MimeTypeGroup_OFFICEXML.equals(typeGroup))
      {
        if (ConversionLibManager.getInstance().isConvLibEnabled())
        {
          this.useConversionLib = true;
          this.useJavaConverterImport = false;
        }
        else
        {
          this.useSymphonyImport = true;
        }
      }
      else if (this.sourceMIMEType.equals(ConversionConstants.ODT_MIMETYPE) || this.sourceMIMEType.equals(ConversionConstants.TXT_MIMETYPE))
      {
        if (ConversionLibManager.getInstance().isConvLibEnabled())
        {
          this.useConversionLib = true;
          this.useJavaConverterImport = false;
        }
      }
    }
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  private boolean preProcessing()
  {
    File tempFolder = ConversionWorkManager.getInstance().getConversionTempFolder();
    tempSourceFile = getTmpSourceFile(sourceFile, tempFolder);
    if (tempSourceFile == null)
    {
      String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
      ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_NFS_IO_EXCEPTION), new LogEntry(requestid,
          "Fail to copy source files from NFS to local").toString());
      result = new ConversionResult();
      result.addWarning(new ConversionWarning(ConversionConstants.ERROR_NFS_IO_EXCEPTION, false, "", "NFS IO exception"));
      result.setSucceed(false);
      return false;
    }

    tempTargetFolder = getTmpTargetFolder(targetFolder, tempFolder);

    String isPasswordPrompt = (String) this.parameters.get("isPasswordPrompt");
    if("true".equalsIgnoreCase(isPasswordPrompt)){
      result = new ConversionResult();
      LOG.log(Level.WARNING, "Password Protected document with draft.");
      result.addWarning(new ConversionWarning(ConversionConstants.ERROR_INVALID_FILE_PASSWORD, false, "", "Invalid File Password"));
      result.setSucceed(false);
      return false;
    }
      
    if (FileTypeUtil.OFFICEXML_MIMETYPE_LIST.contains(sourceMIMEType) && FileTypeUtil.isPwdProtectedOOXML(tempSourceFile))
    {
      try
      {
        if (!OOXMLPwdDetector.decryptOOXML(tempSourceFile, (String) this.parameters.get(FILE_PWD_PARA_NAME)))
        {
          result = new ConversionResult();
          LOG.log(Level.WARNING, "Password Protected document.");
          result.addWarning(new ConversionWarning(ConversionConstants.ERROR_INVALID_FILE_PASSWORD, false, "", "Invalid File Password"));
          result.setSucceed(false);
          return false;
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "decryptOOXML failed. " + e.getMessage());
      }
    }
    

    if (Boolean.valueOf((String) parameters.get(Constants.PARAMETER_UPGRADE_VERSION)))
    {
      File odfDraftFile = new File(tempSourceFile, "odfdraft");
      parameters.put(Constants.INIT_SOURCE_MIMETYPE, sourceMIMEType);
      // spreadsheet already implement the ooxml upgrade, so here do not need to get odf mime type for spreadsheet when upgrade
      // 1) while if the xlsx file was converted by Symphony(with old conversion build), it still has odfdraft file
      // in this case we still need ods2json converter to upgrade
      // 2) for other file type(such as doc and presentation, if they implement ooxml upgrade, should modify here
      // 3) for new created xls draft
      if (odfDraftFile.exists() || !"spreadsheet".equals(FileTypeUtil.getEditorType(sourceMIMEType))
          || MimeTypeConstants.XLS_MIMETYPE.equals(sourceMIMEType))
        sourceMIMEType = FileTypeUtil.getODFDraftMimeType(odfDraftFile, sourceMIMEType);
    }
    else
    {
      JSONObject obj = new JSONObject();
      boolean isFromTemplate = Boolean.valueOf((String) parameters.get(Constants.PARAMETER_FROMTEMPLATE));
      obj.put("isFromTemplate", isFromTemplate);

      // verify the file mime type.
      if (!FileTypeUtil.isCorrectFileType(tempSourceFile, sourceMIMEType, (Map) obj, tempTargetFolder))
      {
        String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
        if (FileTypeUtil.OFFICEXML_MIMETYPE_LIST.contains(sourceMIMEType) && FileTypeUtil.isPwdProtectedOOXML(tempSourceFile))
        {
          ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD), logParas,
              new LogEntry(requestid, "Password Protected Office Document.").toString(), null);
          result = new ConversionResult();
          result.addWarning(new ConversionWarning(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD, false, "",
              "Password Protected Office Document"));
          result.setSucceed(false);
          return false;
        }
        ConversionLogger.log(LOG, Level.WARNING, new LogEntry(requestid, "Invalid File Mime Type - " + sourceMIMEType + " / "
            + isFromTemplate + " / " + tempSourceFile.getAbsolutePath()).toString());
        sourceMIMEType = FileTypeUtil.getFileMimeType(tempSourceFile, sourceMIMEType);
        obj.put(Constants.PARAMETER_CORRECT_SOURCETYPE, sourceMIMEType);
        result = new ConversionResult();
        result.addWarning(new ConversionWarning(ConversionConstants.ERROR_INVALID_FILE_MIME_TYPE, false, "", "Invalid File Mime Type",
            (Map) obj));
        result.setSucceed(false);
        return false;
      }
      else
      {
        String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
        if (isFromTemplate)
        {
          String localFilePath = (String) obj.get(Constants.PARAMETER_FILEPATH);
          if (localFilePath != null)
          {
            File localFile = new File(localFilePath);
            NFSFileUtil.nfs_copyFileToDir(localFile, targetFolder, null, NFSFileUtil.NFS_RETRY_SECONDS);
            String filePath = targetFolder.getAbsoluteFile() + File.separator + localFile.getName();

            filePath = ServletUtil.transformPath(filePath);
            obj.put(Constants.PARAMETER_FILEPATH, filePath);
          }
          ConversionLogger
              .log(LOG, Level.WARNING, new LogEntry(requestid, "Template file, MIME Type is changed to normal type").toString());
          result = new ConversionResult();
          result.addWarning(new ConversionWarning(ConversionConstants.STATUS_MIME_TYPE_MODIFIED, false, "",
              "Template file, MIME Type is changed to normal type", obj));
          result.setSucceed(false);
          return false;
        }

        if (FileTypeUtil.ODF_MIMETYPE_LIST.contains(sourceMIMEType))
        {
          if (FileTypeUtil.isPwdProtectedOdf(tempSourceFile))
          {
            ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD), logParas,
                new LogEntry(requestid, "Password Protected ODF Document.").toString(), null);
            result = new ConversionResult();
            result.addWarning(new ConversionWarning(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD, false, "",
                "Password Protected ODF Document"));
            result.setSucceed(false);
            return false;
          }
        }
      }
    }
    return true;
  }

  @SuppressWarnings("rawtypes")
  public ConversionWork(String jobId, String sourceMIMEType, String targetMIMEType, File sourceFile, File targetFolder,
      IConversionService conversionService, Map parameters)
  {
    this.jobId = jobId;
    this.sourceMIMEType = sourceMIMEType;
    this.targetMIMEType = targetMIMEType;
    this.sourceFile = sourceFile;
    this.targetFolder = targetFolder;
    this.conversionService = conversionService;
    this.parameters = parameters;
    this.convVersion = getConversionVersion(sourceMIMEType, targetMIMEType);
    this.nfsTargetFolderPath = (parameters != null) ? (String) parameters.get(Constants.PARAMETER_NFS_TARGET_FOLDER) : null;
    initWorkCategory();
    this.logParas[0] = sourceFile;
    this.logParas[1] = targetFolder;
    this.logParas[2] = sourceMIMEType;
    this.logParas[3] = targetMIMEType;
  }

  public void release()
  {
    long timeCost = System.currentTimeMillis() - this.wkThreadStartTime;
    LOG.log(Level.INFO, "Was Release Work : " + jobId + " after " + timeCost + "ms");
    long timeout = ConversionWorkManager.getInstance().getWorkManagerTimeout();
    if (!completed && timeout > 1000 && timeCost < (timeout - 1000))
    {
      LOG.log(Level.INFO, "Work actually is NOT time out : " + jobId + " and less than " + timeout + "ms");
      Timer timer = new Timer();
      timer.schedule(new TimerTask()
      {
        public void run()
        {
          LOG.log(Level.INFO, "Execute timer task in release: " + jobId);
          releaseTask();
        }
      }, (timeout - timeCost - 1000));
    }
    else
    {
      releaseTask();
    }
    LOG.log(Level.FINER, "End of release: " + jobId);
  }

  public void cancel()
  {
    ConversionLogger.log(LOG, Level.FINER, "Cancel Work : " + jobId);
    // stop the Java thread
    if (workThread != null)
    {
      completed = true;
      ConversionLogger.log(LOG, Level.INFO, LOG_ID, "Conversion Work thread :" + workThread.getId() + " will be interrupted");
      workThread.interrupt();
      workThread = null;
    }
    else
    {
      completed = true;
      ConversionLogger.log(LOG, Level.INFO, LOG_ID, "Conversion Work thread is in queue, set as completed");
    }
  }

  @SuppressWarnings("unchecked")
  public void run()
  {
    LOG.entering(getClass().getName(), "run", new Object[] { sourceMIMEType, targetMIMEType, sourceFile });
    long start = System.currentTimeMillis();
    this.wkThreadStartTime = start;
    StringBuilder sb = new StringBuilder();
    sb.append("conversion started, ").append(sourceMIMEType).append(", ").append(targetMIMEType).append(", ").append(sourceFile);
    LOG.log(Level.INFO, sb.toString());
    if (completed)
    {
      sb = new StringBuilder();
      sb.append("conversion canceled, ").append(sourceMIMEType).append(", ").append(targetMIMEType).append(", ").append(sourceFile);
      LOG.log(Level.INFO, sb.toString());
      this.endTime = System.currentTimeMillis();

      ConversionWorkManager.getInstance().updateThreadCount(false);
      ConversionWorkManager.getInstance().getTaskMap().remove(jobId);
      return;
    }
    if (targetFolder != null)
      createStatusJson();

    workThread = Thread.currentThread();

    try
    {
      // create server info file which records the full server name is used to monitor the node is down or not in cluster env
      // temporarily disable fail-over, do not create server info file
      // createServerInfoFile();

      // because NFS is not stable, in order to reduce NFS I/O, copy the source from NFS to local before call conversion work
      // after conversion, copy the results to NFS again
      ConversionResult convRes = null;
      if (!preProcessing())
      {
        this.endTime = System.currentTimeMillis();
        return;
      }

      IFormatConverter converter = conversionService.getConverter(sourceMIMEType, targetMIMEType);

      if (!isViewerWork)
      {
        if (targetFolder == null)
        {
          convRes = converter.convert(tempSourceFile, parameters);
        }
        else
        {
          convRes = converter.convert(tempSourceFile, tempTargetFolder, parameters);
        }
      }
      else
      {
        if (targetFolder == null)
        {
          convRes = converter.convert(tempSourceFile, parameters);
        }
        else
        {
          parameters.put("real_target_folder", nfsTargetFolderPath);
          convRes = converter.convert(tempSourceFile, tempTargetFolder, parameters);
        }
      }
      // if converter return unknown error as well as result already has value, just keep it
      if ((result == null) || !convRes.containErrCode(ConversionConstants.ERROR_UNKNOWN))
        result = convRes;

      // set mimetype if not set. It maybe "application/zip" for "text/html".
      if (result.getMimeType() == null)
      {
        result.setMimeType(targetMIMEType);
      }
      LOG.exiting(getClass().getName(), "run", result);
    }
    catch (Throwable e)
    {
      String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
      ConversionLogger.log(
          LOG,
          Level.WARNING,
          Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR,
          logParas,
          new LogEntry(requestid, String.format("Exception %s , from Converter, source file is: ",
              new Object[] { e, sourceFile.toString() })).toString(), e);

      if (result == null)
      {
        result = new ConversionResult();
      }
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      if (tempTargetFolder != null)
      {
        storeConversionResult(false);
        copyTargetToNFS(false);
      }
      completed = true;
      workThread = null;

      if (tempSourceFile != null)
      {
        if (tempSourceFile.isDirectory())
        {
          FileUtil.forceDelete(tempSourceFile);
        }
        else
        {
          FileUtil.forceDelete(tempSourceFile.getParent());
        }
      }

      if (tempTargetFolder != null)
      {
        FileUtil.forceDelete(tempTargetFolder);
      }
      ConversionWorkManager.getInstance().updateThreadCount(false);
      // remove the job from taskMap, only get result from disk result.json since
      // the Caller may not only check result.json to get result instead of call get result API
      // currently the code to get result from taskMap is still kept there for further reference.
      ConversionWorkManager.getInstance().getTaskMap().remove(jobId);
    }

    long end = System.currentTimeMillis();
    sb = new StringBuilder();
    sb.append("conversion completed, ").append(result.isSucceed()).append(" cost ").append((end - start) + "ms, ").append(sourceMIMEType)
        .append(", ").append(targetMIMEType).append(", ").append(sourceFile);
    LOG.log(Level.INFO, sb.toString());
    this.endTime = end;
    LOG.log(Level.INFO, "Current thread number is {0} and task number remained is {1}", new Object[] {
        ConversionWorkManager.getInstance().getThreadCount(), ConversionWorkManager.getInstance().getTaskMap().size() });
    LOG.exiting(getClass().getName(), "run");
  }

  public void releaseTask()
  {
    if (!completed)
    {
      if (result == null)
      {
        result = new ConversionResult();
        ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME, false, "",
            "Work Manager is Released!");
        result.addWarning(ce);
        result.setSucceed(false);
      }
      if (targetFolder != null)
      {
        storeConversionResult(true);
        copyTargetToNFS(true);
      }
      completed = true;
    }
    else
    {
      LOG.log(Level.FINEST, "Job has been completed, nothing to do in release task. " + jobId);
    }
    // WorkManager will call release() when the work thread is timeout.
    // To solve the svt defect 48513 - when soffice is hung, the java thread also is hung -,
    // so here, we interrupt the java thread when Conversion work thread is timeout.
    // In the catch clause of run() method, it will catch the InterruptedException and do the corresponding processing.
    if (workThread != null)
    {
      workThread.interrupt();
      workThread = null;
    }

    // remove the job from task map
    ConversionWorkManager.getInstance().getTaskMap().remove(jobId);
    LOG.log(Level.INFO, "Release work and only remove job from task map : " + jobId);
  }

  public boolean isDone()
  {
    return completed;
  }

  public ConversionResult get()
  {
    return result;
  }

  public long getEndTime()
  {
    return endTime;
  }

  public boolean isUseSymphonyImport()
  {
    return useSymphonyImport;
  }

  public boolean isUseStellent()
  {
    return isViewerWork;
  }

  public boolean isUseJavaConverterImport()
  {
    return useJavaConverterImport;
  }

  public boolean isUseConversionLib()
  {
    return useConversionLib;
  }
}
