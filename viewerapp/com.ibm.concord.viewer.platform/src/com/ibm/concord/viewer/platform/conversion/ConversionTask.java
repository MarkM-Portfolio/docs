/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.platform.util.JobHelper;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.job.IConversionJob.JOB_PRIORITY_TYPE;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class ConversionTask
{
  private static final Logger LOG = Logger.getLogger(ConversionTask.class.getName());

  private static final String SOURCE_MIME_TYPE = "sourceMIMEType"; //$NON-NLS-1$

  private static final String TARGET_MIME_TYPE = "targetMIMEType"; //$NON-NLS-1$

  private static final String FILE_PATH = "filePath"; //$NON-NLS-1$

  //  private static final String RETURN_PATH = "returnPath"; //$NON-NLS-1$

  // private static final String JOB_RESULT_FILE_NAME ="result.json";

  public static final String JOB_ID = "JOBID"; //$NON-NLS-1$

  private static final String STATUS_CODE = "statusCode"; //$NON-NLS-1$

  private static final String TARGET_PATH = "targetFolder"; //$NON-NLS-1$

  public static final String FORCECONVERT = "forceConvert";

  public static final int MAX_OF_RETRY = 3;

  public static final int INTERVAL_OF_RETRY = 500;

  public static final String DETECT = "detect";

  private static final String THUMBANIL_PATH = "thumbnailFolder";

  // private static final int SO_TIMEOUT = 120000;

  private String conversionServiceURL;

  private String conversionResultURL;

  // private static S2SCallHelper s2sCallHelper = new S2SCallHelper();

  private HttpClient httpClient;

  private String jobId = null;

  private String targetPath = null;

  protected List<TaskListener> listeners = new ArrayList<TaskListener>();

  private String outputFilePath = null;

  protected TaskCategory category = TaskCategory.FULLIMAGES;

  private String viewerLockerPath = null;

  private Hashtable<String, Object> paramMap = null;

  private boolean isFolderChanged = false;

  private String currentType = "VIEW";
  
  private String password = null;

  // for failover
  protected String jobDone = Constant.JOB_FULLIMAGE_DONE;

  protected String jobIdKey = Constant.FULLIMAGE_JOBID_KEY;

  protected String targetPathKey = Constant.FULLIMAGE_TARGETPATH_KEY;
  
  protected boolean isPasswordPrompt = false;

  public enum TaskCategory {
    THUMBNAILSERVICE, THUMBNAILS, FULLIMAGES, HTML
  }

  public enum ConversionEvent {
    START, CONVERTING, DONE, PREFETCH
  }

  public ConversionTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    this.conversionServiceURL = conversionServiceURL;
    this.conversionResultURL = conversionResultURL;
    this.httpClient = httpClient;
  }

  /**
   * 
   * @param changeFolder
   *          If changeFolder is false, then we will not create new folder, this is used for 493 logic. If changeFolder is true, then we
   *          will create new folder.
   * @return
   * @throws Exception
   */
  public JSONObject repeatConvertRequest(boolean changeFolder, boolean detect) throws Exception
  {
    LOG.log(Level.INFO, "Repeate task is called for ChangeFolder(" + changeFolder + ") " + getCategory().toString());
    String path = paramMap.get("path").toString();
    String sourceType = paramMap.get("sourceType").toString();
    String targetType = paramMap.get("targetType").toString();
    String targetPath = paramMap.get("targetPath").toString();
    Map<String, Object> options = (HashMap<String, Object>) paramMap.get("options");
    Map<String, Object> cloneOptions = new HashMap<String, Object>();
    cloneOptions.putAll(options);

    if (this.getViewerLockerPath() == null)
    {
      this.setViewerLockerPath(options.get(Constant.VIEWER_JOB_LOCKER_KEY).toString());
    }
    if (changeFolder)
    {
      String newTargetPath = ViewerUtil.createTargetFolder(targetPath, getCategory());
      for (int i = 0; i < this.listeners.size(); i++)
      {
        TaskListener handler = listeners.get(i);
        handler.setConvertDir(newTargetPath);
      }
      this.removeConversionJobInfo();
      targetPath = newTargetPath;
    }
    return this.convertRequest(path, sourceType, targetType, targetPath, cloneOptions, detect, currentType, this.password);
  }

  public void resetListener()
  {
    // Done
    for (int i = 0; i < this.listeners.size(); i++)
    {
      TaskListener handler = listeners.get(i);
      String convertDir = handler.getConvertDir();
      TaskCategory cat = ViewerUtil.getCategoryFromTargetPath(convertDir);
      String p = ViewerUtil.getTargetFolder(convertDir, cat);
      handler.setConvertDir(p);
    }
  }

  public boolean getIsFolderChanged()
  {
    return isFolderChanged;
  }

  public void setIsFolderChanged(boolean isFolderChanged)
  {
    this.isFolderChanged = isFolderChanged;
  }

  public JSONObject convertRequest(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options,
      boolean detect, String currentType, String password) throws Exception
  {
    /*
     * Remove the version check before each conversion request since 2.0. Only check once on the platform initialization.
     */
    // if (!ViewerVersionCheck.isValidVersion())
    // {
    // LOG.log(Level.SEVERE, "Viewer application version is incompatible with Conversion!");
    // throw new Exception("Viewer application version is incompatible with Conversion!");
    // }

    this.password = password;
    if (getParamMap() == null)
    {
      paramMap = new Hashtable<String, Object>();
      Map<String, Object> cloneOptions = new HashMap<String, Object>();
      cloneOptions.putAll(options);
      paramMap.put("path", path);
      paramMap.put("sourceType", sourceType);
      paramMap.put("targetType", targetType);
      paramMap.put("targetPath", targetPath);
      paramMap.put("options", cloneOptions);
      this.currentType = currentType;
    }
    
    LOG.log(Level.FINE,
        Messages.getString("ConversionTask.7") + " Document path is " + targetPath + ";" + sourceType + ";" + targetType + ";"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$
    this.setViewerLockerPath(options.get(Constant.VIEWER_JOB_LOCKER_KEY).toString());
    options.remove(Constant.VIEWER_JOB_LOCKER_KEY);

    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    if(this.isPasswordPrompt) {
      parameters.add(new NameValuePair("isPasswordPrompt", "true"));
    }
    parameters.add(new NameValuePair(SOURCE_MIME_TYPE, sourceType));
    parameters.add(new NameValuePair(TARGET_MIME_TYPE, targetType));
    String sharedRoot = (String) options.remove(Constant.VIEWER_SHARED_DATA_ROOT);
    String docsDraftHome = ViewerConfig.getInstance().getDocsDraftHome();
    boolean convert2DocsDraft = StringUtils.isNotBlank(docsDraftHome) && path.startsWith(docsDraftHome);
    String sharedDataName = (String) options.remove(Constant.VIEWER_SHARED_DATA_NAME);   
    
    parameters.add(new NameValuePair("filePassword", this.password));    
    
    if (convert2DocsDraft)
    {
      path = new Path(docsDraftHome, path).resolveToRelativePath();
      sharedDataName = ViewerConfig.getInstance().getDocsSharedDataName();
    }
    else
    {
      path = new Path(sharedRoot, path).resolveToRelativePath();
    }

    char firstch = path.length() > 0 ? path.charAt(0) : ' ';
    if (firstch != '\\' && firstch != '/')
    {
      LOG.log(Level.WARNING, "Resolved relative sourceFilePath is incorrect: " + path + ", check if $VIEWER_SHARED_DATA_ROOT is correct:"
          + sharedRoot);
    }
    path = "${" + sharedDataName + "}" + path;
    parameters.add(new NameValuePair(FILE_PATH, path));
    LOG.log(Level.INFO, "Conversion parameter: filepath - {0}", path);

    parameters.add(new NameValuePair(DETECT, String.valueOf(detect)));
    
    JOB_PRIORITY_TYPE jobPriority = (JOB_PRIORITY_TYPE) options.remove(Constant.JOB_PRIORITY);
    if (((jobPriority == null || jobPriority == JOB_PRIORITY_TYPE.NORMAL) && currentType.equals(Constant.STATUS_UPLOAD))
        || jobPriority == JOB_PRIORITY_TYPE.LOW)
    {
      parameters.add(new NameValuePair(Constant.UPLOAD_CONVERT_KEY, String.valueOf(true)));
    }
    if (targetPath != null)
    {
      targetPath = convert2DocsDraft ? new Path(docsDraftHome, targetPath).resolveToRelativePath() : new Path(sharedRoot, targetPath)
          .resolveToRelativePath();
      targetPath = "${" + sharedDataName + "}" + targetPath;
      parameters.add(new NameValuePair(TARGET_PATH, targetPath));
    }
    if (options != null)
    {
      String thumbnailTarget = (String) options.get("thumbnailTarget");
      if (thumbnailTarget != null)
      {
        thumbnailTarget = convert2DocsDraft ? new Path(docsDraftHome, thumbnailTarget).resolveToRelativePath() : new Path(sharedRoot,
            thumbnailTarget).resolveToRelativePath();
        thumbnailTarget = "${" + sharedDataName + "}" + thumbnailTarget;
        parameters.add(new NameValuePair(THUMBANIL_PATH, thumbnailTarget));
      }

      Iterator<Map.Entry<String, Object>> iter = options.entrySet().iterator();
      while (iter.hasNext())
      {
        Map.Entry<String, Object> entry = (Map.Entry<String, Object>) iter.next();
        Object value = entry.getValue();
        if (value instanceof String[])
        {
          value = makeValue(entry.getValue());
        }
        parameters.add(new NameValuePair(entry.getKey(), (String) value));
      }
    }

    JSONObject convertResponse = new JSONObject();
    PostMethod postMethod = new PostMethod(conversionServiceURL);
    postMethod.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getEncodedToken());

    try
    {
      NameValuePair[] paras = new NameValuePair[parameters.size()];
      paras = parameters.toArray(paras);
      postMethod.addParameters(paras);

      /*
       * This is commented because the timeout is setted when the httpclient is created // Add socket timeout here, if timeout occurs, then
       * it will throws exception httpPostRequest.getParams().setParameter(HttpMethodParams.SO_TIMEOUT, new Integer(SO_TIMEOUT));
       */
      int statusCode = 200;
      for (int i = 0; i < MAX_OF_RETRY; i++)
      {
        try
        {
          statusCode = httpClient.executeMethod(postMethod);
        }
        catch (SocketTimeoutException e)
        {
          throw e;
        }
        catch (IOException e)
        {
          try
          {
            Thread.sleep(INTERVAL_OF_RETRY);
          }
          catch (Exception e1)
          {
            LOG.log(Level.WARNING, "InterruptedException occurred when sleeping for retry(connection reset)" + e1.getMessage());
            throw e1;
          }
          LOG.logp(Level.WARNING, "ConversionTask", "convertRequest", "httpClient.execute() throws IOException and will recall for " + i
              + " times." + e.getMessage(), e);
          continue;
        }
        break;
      }
      convertResponse.put(STATUS_CODE, statusCode);
      
      Header responseHeaders = postMethod.getResponseHeader(HttpSettingsUtil.PROBLEM_ID);
      if (responseHeaders != null)
      {
        String responseID = responseHeaders.getValue();
        convertResponse.put(HttpSettingsUtil.RESPONSE_ID, responseID);
        LOG.fine(new LogEntry(URLConfig.getRequestID(), responseID, String.format("Response back by call url : %s .", conversionServiceURL)).toString());
      }
      if (statusCode == 202)
      {
        InputStream is = postMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          this.jobId = (String) responseObj.get(JOB_ID);
          this.targetPath = targetPath;
          convertResponse.put(JOB_ID, jobId);
          LOG.log(Level.FINE, Messages.getString("ConversionTask.0") + jobId); //$NON-NLS-1$
          this.saveConversionJobInfo(jobId, targetPath);
        }
      }
      else if (statusCode == 413)
      {
        try
        {
          InputStream is = postMethod.getResponseBodyAsStream();
          if (is != null)
          {
            JSONObject resObj = JSONObject.parse(is);
            if (resObj.containsKey("config"))
              convertResponse.put("config", resObj.get("config"));
            if (resObj.containsKey("conv_err_code"))
              convertResponse.put("conv_err_code", resObj.get("conv_err_code"));
          }
        }
        catch (Exception ex)
        {
          LOG.log(Level.WARNING, "Exception happens while getting the conversion result", ex);
        }
      }
      else if (statusCode == 415)
      {
        InputStream is = postMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          String correctSourceMime = (String) responseObj.get("correctSourceMIMEType");
          String format = FormatUtil.MS_FORMATS.get(correctSourceMime);
          if (format == null)
          {
            format = FormatUtil.ODF_FORMATS.get(correctSourceMime);
          }
          if (format == null)
          {
            format = FormatUtil.OTHER_FORMATS.get(correctSourceMime);
          }
          if (format == null)
          {
            format = "unsupported " + correctSourceMime;
            LOG.log(Level.WARNING,
                "Conversion task fails. Conversion job id is " + this.jobId + " " + "Document path: "
                    + paramMap.get("targetPath").toString() + " StatusCode: " + statusCode);
          }
          convertResponse.put("asFormat", format);
          LOG.info(Messages.getString("ConversionTask.0") + correctSourceMime); //$NON-NLS-1$

        }
      }
      else
      {
        LOG.info(Messages.getString("ConversionTask.1") + statusCode); //$NON-NLS-1$
      }
    }
    catch (SocketTimeoutException e)
    {
      LOG.log(Level.SEVERE, "Socket connection is timed out.", e);
      throw new ConversionException("Socket connection is timed out.");
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IOException cached: " + e.getMessage(), e);
      throw new ConversionException("IOException cached: " + e.getMessage());
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Unknown error happened.", e);
      throw new ConversionException("Unknow exception happened");
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }
    return convertResponse;
  }

  private String makeValue(Object value)
  {
    if (value instanceof String[])
    {
      String[] strs = (String[]) value;
      StringBuffer buffer = new StringBuffer();
      for (int i = 0; i < strs.length; i++)
      {
        buffer.append(strs[i]);
        buffer.append(";");
      }
      return buffer.toString();
    }
    return null;
  }

  public JSONObject getConversionResult(String jobID, String targetPATH) throws Exception
  {
    String path = paramMap.get("targetPath").toString();
    return ConversionUtils.getConversionResult(path);
  }

  public void addTaskListenner(TaskListener tl)
  {
    listeners.add(tl);
  }

  public void fireEvent(ConversionEvent event) throws FileNotFoundException, InterruptedException, IOException
  {
    for (TaskListener tl : listeners)
    {
      tl.onEvent(event);
    }
    if (event.equals(ConversionEvent.DONE))
    {
      if (getViewerLockerPath() == null)
      {
        return;
      }
      JobHelper helper = new JobHelper(this.getViewerLockerPath());
      String key = this.getJobDone();
      try
      {
        if (!this.getCategory().equals(TaskCategory.THUMBNAILS))
        {
          helper.addElement(key, "true");
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Failed to write task done status to job locker file" + e.getMessage());
      }
    }
  }

  public String getOutputFilePath()
  {
    return this.outputFilePath;
  }

  public void setJobId(String jobId)
  {
    this.jobId = jobId;
  }

  public String getJobId()
  {
    return jobId;
  }

  private void saveConversionJobInfo(String jobId, String targetPath)
  {
    JobHelper helper = new JobHelper(this.getViewerLockerPath());

    if (targetPath == null || !targetPath.contains("media"))
      return;

    try
    {
      helper.addElements(new String[] { this.getJobIdKey(), this.getTargetPathKey() }, new String[] { jobId, targetPath });
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      LOG.log(Level.SEVERE, "Writing jobid for " + this.getCategory() + " failed");
    }
  }

  public TaskCategory getCategory()
  {
    return category;
  }

  public void setCategory(TaskCategory category)
  {
    this.category = category;
  }

  public String getViewerLockerPath()
  {
    return viewerLockerPath;
  }

  public void setViewerLockerPath(String viewerLockerPath)
  {
    this.viewerLockerPath = viewerLockerPath;
  }

  public String getTargetPath()
  {
    return targetPath;
  }

  public void setTargetPath(String targetPath)
  {
    this.targetPath = targetPath;
  }

  public Hashtable<String, Object> getParamMap()
  {
    return paramMap;
  }

  public void setParamMap(Hashtable<String, Object> paramMap)
  {
    this.paramMap = paramMap;
  }

  private void removeConversionJobInfo()
  {
    JobHelper helper = new JobHelper(this.getViewerLockerPath());
    String keys[] = new String[2];
    keys[0] = this.getJobIdKey();
    keys[1] = this.getTargetPathKey();
    helper.removeElements(keys);
  }

  public String getJobDone()
  {
    return jobDone;
  }

  public void setJobDone(String jobDone)
  {
    this.jobDone = jobDone;
  }

  public String getJobIdKey()
  {
    return jobIdKey;
  }

  public void setJobIdKey(String jobIdKey)
  {
    this.jobIdKey = jobIdKey;
  }

  public String getTargetPathKey()
  {
    return targetPathKey;
  }

  public void setTargetPathKey(String targetPathKey)
  {
    this.targetPathKey = targetPathKey;
  }

  public void savePasswordHash()
  {
    LOG.info("savePasswordHash ...");
    if(this.password == null) {
      LOG.info("this.password is null do nothing.");
      return;
    }    
    String htmlPath = paramMap.get("targetPath").toString();
    String passwordHashJsonPath = htmlPath + File.separator + "password_hash.json";
    LOG.info("passwordHashJsonPath: " + passwordHashJsonPath);
    File passwordHashJsonFile = new File(passwordHashJsonPath);
    String result;
    JSONObject passwordHashJson = null;
    try
    {      
      if(!passwordHashJsonFile.exists()) {
        LOG.info("passwordHashJsonFile does not exists .");
        FileUtil.nfs_createNewFile(passwordHashJsonFile, FileUtil.NFS_RETRY_SECONDS);
        passwordHashJson = new JSONObject();
      } else {
        LOG.info("passwordHashJsonFile exists .");
        result = FileUtil.nfs_readFileAsString(passwordHashJsonFile, FileUtil.NFS_RETRY_SECONDS);
        passwordHashJson = JSONObject.parse(result);    
      }         
      passwordHashJson.put("PasswordHash", DigestUtils.md5Hex(this.password));
      FileUtil.nfs_writeStringToFile(passwordHashJsonFile, passwordHashJson.toString(), FileUtil.NFS_RETRY_SECONDS);
      LOG.info("savePasswordHash done .");
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Save password hash to meta for the document failed. " + e.getMessage());
    }

  }
}

