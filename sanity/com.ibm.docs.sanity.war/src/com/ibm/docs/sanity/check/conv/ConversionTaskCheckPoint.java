package com.ibm.docs.sanity.check.conv;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.params.HttpClientParams;

import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.sanity.Constants;
import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.constants.ConversionConstants;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.task.ConversionTask;
import com.ibm.docs.sanity.task.ConversionUploadTask;
import com.ibm.docs.sanity.task.GetResultTask;
import com.ibm.docs.sanity.util.FileUtil;
import com.ibm.docs.sanity.util.PathUtil;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONObject;

public class ConversionTaskCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(ConversionTaskCheckPoint.class.getName());

  private static final int MAX_RETRY = 120;

  private static final Properties messages;

  private static String conversionHostURl = "http://127.0.0.1";

  private static final String conversionService = "/conversion/ConversionService";

  private static final String resultService = "/conversion/ConversionResult";

  private static final String SANITY_HOME = "/draft/sanity/draft";

  private String DEFAULT_WC_DEFAULTHOST_PORT = "9080";

  private JSONObject rootConfig;

  private HttpClient httpClient;

  private String sourcePath;

  private String targetPath;

  private String relativeTargetPath2;

  private String sourceType;

  private String sharedDataRoot = null;

  private String tagetType;

  private String j2c_alias;

  private int triedNumber;

  static
  {
    String className = ConversionTaskCheckPoint.class.getSimpleName();

    messages = new Properties();
    messages.put(className + "@setUp@1", "The installation root path was not found.");
    messages.put(className + "@setUp@2", "The configuration file at [{0}] was not found.");
    messages.put(className + "@setUp@3", "The configuration file content cannot be parsed.");

    messages.put(className + "@doCheck@1", "Failed to upload the sample document to directory [{0}].");
    messages.put(className + "@doCheck@2", "Error Code : 495. It takes too long to convert the document [{0}] from conversion server.");
    messages.put(className + "@doCheck@3", "The document type [{0}] is not supported.");
    messages.put(className + "@doCheck@4", "Length Required");
    messages.put(className + "@doCheck@5", "Error Code : 413. The document [{0}] is too large to be converted.");
    messages.put(className + "@doCheck@6", "Error Code : 415. The document type [{0}] is invalid.");
    messages.put(className + "@doCheck@7", "Error Code : 496. Unable to make the call to conversion server.");
    messages.put(className + "@doCheck@8", "No response from the conversion server.");
    messages.put(className + "@doCheck@9", "The conversion server returned unexpected status. [{0}]");
    messages.put(className + "@doCheck@10", "Unable to find the s2s token in the configuration file.");

    if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
    {
      try
      {
        conversionHostURl = "http://" + InetAddress.getLocalHost().getCanonicalHostName();
        LOG.log(Level.INFO, "conversionHostURl is: " + conversionHostURl);
      }
      catch (UnknownHostException e)
      {
        LOG.log(Level.SEVERE, "Failed to get canonical host name!!");
      }
    }
  }

  private static final SanityCheckPointItem cpItem = new SanityCheckPointItem(ConversionTaskCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for conversion service.", messages);

  public ConversionTaskCheckPoint(String formatMime, int nPort)
  {
    super(formatMime);
    DEFAULT_WC_DEFAULTHOST_PORT = Integer.toString(nPort);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(ConversionTaskCheckPoint.class.getName(), "setUp");
    try
    {
      XMLConfiguration cellVarConfig;
      cellVarConfig = new XMLConfiguration(ServerTypeUtil.varFile);
      String installRoot = ServerTypeUtil.getCellVariable(cellVarConfig, "CONVERSION_INSTALL_ROOT");
      if (installRoot == null)
      {
        throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "setUp", 1);
      }

      String configPath = new PathUtil(ServerTypeUtil.IBMDocsConfigPath, File.separator + "conversion-config.json").resolveToAbsolutePath();
      File configFile = new File(configPath);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          rootConfig = JSONObject.parse(fis);
        }
        catch (FileNotFoundException e)
        {
          throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "setUp", e);
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "setUp", e);
        }
      }
      else
      {
        String sPath = configFile.getPath();
        Properties prop = System.getProperties();
        String os = prop.getProperty("os.name");
        if (os.startsWith("win") || os.startsWith("Win"))
          sPath = sPath.replaceAll("\\\\", "\\\\\\\\");
        throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "setUp", 2, new Object[] { escape(sPath,
            this.getFormatMime()) });
      }

      if (rootConfig == null)
      {
        throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "setUp", 3);
      }

      j2c_alias = (String) rootConfig.get(Constants.J2C_ALIAS);
      if (j2c_alias == null || j2c_alias.length() == 0)
      {
        j2c_alias = Constants.J2C_ALIAS_DEFAULT;
      }

      sharedDataRoot = (String) ((JSONObject) rootConfig.get("shared_storage")).get("shared_to");
      if (sharedDataRoot == null)
      {
        JSONObject sharedStoragePath = (JSONObject) rootConfig.get("shared_storage");
        JSONObject docsStoragePath = (JSONObject) sharedStoragePath.get("docs");
        sharedDataRoot = (String) docsStoragePath.get("to");
      }
      String doucumentUri = UUID.randomUUID().toString();
      relativeTargetPath2 = SANITY_HOME + "/" + doucumentUri;
      sourcePath = new PathUtil(sharedDataRoot, relativeTargetPath2).resolveToAbsolutePath();

      sourceType = "application/vnd.oasis.opendocument.text";
      targetPath = sourcePath;
      tagetType = "application/json";

      httpClient = createHttpClient();
      triedNumber = 0;
    }
    catch (ConfigurationException e)
    {
      throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "setUp", e);
    }

    LOG.exiting(ConversionTaskCheckPoint.class.getName(), "setUp");
  }

  public void doCheck() throws SanityCheckException
  {
    LOG.entering(ConversionTaskCheckPoint.class.getName(), "doCheck");

    sourcePath = new ConversionUploadTask(sourcePath).upload();
    if (sourcePath == null)
    {
      throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", 1, new Object[] { sourcePath });
    }

    try
    {
      convert(rootConfig);  
    }
    catch(SanityCheckException e)
    {
      throw e;
    }
    catch(Exception e)
    {
      throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", e);
    }
    finally
    {
      if (sharedDataRoot != null)
      {
        String sanityPath = new PathUtil(sharedDataRoot, relativeTargetPath2).resolveToAbsolutePath();
        File sanityFilefolder = new File(sanityPath);
        if (sanityFilefolder.exists() && sanityFilefolder.isDirectory())
        {
          LOG.log(Level.INFO, "Delete Result of Sanity Conversion Request: targetPath=" + targetPath + "; source=" + sourcePath);
          FileUtil.cleanDirectory(sanityFilefolder);
          if (!sanityFilefolder.delete())
          {
            LOG.warning("Failed to delete sanity folder " + targetPath);
          }
        }
      }
    }
  }

  private JSONObject convert(JSONObject rootConfig) throws SanityCheckException
  {
    LOG.entering(ConversionTaskCheckPoint.class.getName(), "convert");

    JSONObject resultobject = null;
    int statusCode = HttpStatus.SC_INTERNAL_SERVER_ERROR;
    String conversionURl = conversionHostURl + ":" + DEFAULT_WC_DEFAULTHOST_PORT + conversionService;
    ConversionTask task = new ConversionTask(conversionURl, httpClient, rootConfig);
    try
    {
      resultobject = task.convertRequest(sourcePath, targetPath, sourceType, tagetType, sharedDataRoot);
    }
    catch (IOException e)
    {
      throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", 9);
    }

    if (resultobject != null && resultobject.get("token") != null && ((String) resultobject.get("token")).equalsIgnoreCase("null"))
    {
      throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", 10);
    }

    statusCode = (Integer) resultobject.get(ConversionConstants.STATUS_CODE);
    LOG.log(Level.INFO, "Conversion Request Returned: code=" + statusCode + "; source=" + sourcePath + "; target=" + targetPath);

    String relativeTargetPath = (String) resultobject.get(ConversionConstants.TARGET_PATH);
    String jobID = (String) resultobject.get(ConversionConstants.JOB_ID);

    boolean submitSucc = true;
    if (statusCode != 202)
    {
      LOG.log(Level.WARNING, "Submit converison task failed. Abort conversion.");
      submitSucc = false;
    }

    if (relativeTargetPath == null)
    {
      LOG.log(Level.WARNING, "null targetFolder returned from conversion server. Abort conversion.");
      submitSucc = false;
    }

    if (jobID == null)
    {
      LOG.log(Level.WARNING, "null jobID returned from conversion server. Abort conversion.");
      submitSucc = false;
    }

    if (submitSucc)
    {
      do
      {
        try
        {
          Thread.sleep(1000);
        }
        catch (InterruptedException e)
        {
          LOG.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
        }
        String resultURL = conversionHostURl + ":" + DEFAULT_WC_DEFAULTHOST_PORT + resultService;
        GetResultTask getTask = new GetResultTask(resultURL, httpClient, rootConfig);
        try
        {
          resultobject = getTask.exec2(jobID, relativeTargetPath, targetPath);
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Query conversion job status failed, jobID=" + jobID + ", relativeTargetPath=" + relativeTargetPath, e);
          triedNumber++;
          continue;
        }
        if (resultobject != null && resultobject.get("token") != null && ((String) resultobject.get("token")).equalsIgnoreCase("null"))
        {
          throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", 10);
        }
        statusCode = (Integer) resultobject.get(ConversionConstants.STATUS_CODE);
        if (statusCode == 202)
        {
          triedNumber++;
          continue;
        }
        else
        {
          break;
        }
      }
      while (triedNumber < MAX_RETRY);

      if (triedNumber < MAX_RETRY)
      {
        if(statusCode == 200)
        {
          cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        }
        else
        {
          throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", 9);
        }
      }
      else
      {
        throw new SanityCheckException(this, cpItem, ConversionTaskCheckPoint.class, "doCheck", 9);
      }
    }
    LOG.exiting(ConversionTaskCheckPoint.class.getName(), "convert", resultobject);
    return resultobject;
  }

  public HttpClient createHttpClient()
  {
    LOG.entering(ConversionTaskCheckPoint.class.getName(), "createHttpClient");

    if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
    {
      MultiThreadedHttpConnectionManager connMngr = new MultiThreadedHttpConnectionManager();
      connMngr.getParams().setDefaultMaxConnectionsPerHost(10);
      connMngr.getParams().setMaxTotalConnections(10);
      httpClient = new HttpClient(connMngr);
      HttpClientParams clientParams = httpClient.getParams();
      clientParams.setParameter("http.conn-manager.timeout", 100000);
      clientParams.setParameter("http.socket.timeout", 10000);
      clientParams.setParameter("http.connection.timeout", 10000);
    }
    else
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2c_alias);
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }

    LOG.exiting(ConversionTaskCheckPoint.class.getName(), "createHttpClient", httpClient != null);
    return httpClient;
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();

    LOG.entering(ConversionTaskCheckPoint.class.getName(), "tearDown");
    LOG.exiting(ConversionTaskCheckPoint.class.getName(), "tearDown");

    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(ConversionTaskCheckPoint.class.getName(), "report");

    prepare(cpItem);

    LOG.exiting(ConversionTaskCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }
}
