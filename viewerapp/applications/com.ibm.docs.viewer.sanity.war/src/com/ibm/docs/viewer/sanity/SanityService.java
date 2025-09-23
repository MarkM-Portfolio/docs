package com.ibm.docs.viewer.sanity;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;

import com.ibm.docs.viewer.sanity.exception.ConfigurationException;
import com.ibm.docs.viewer.sanity.util.SanityConstants;
import com.ibm.docs.viewer.sanity.util.SanityFileUtil;
import com.ibm.docs.viewer.sanity.util.SanityServiceUtil;
import com.ibm.docs.viewer.sanity.util.WASConfigHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;

public class SanityService extends HttpServlet implements ISanityCheck
{
  private static final Logger LOG = Logger.getLogger(SanityService.class.getName());

  private JSONObject results = new JSONObject();

  private JSONObject config = null;

  private String conversionURL;

  private String editorHostURL;

  private boolean isSnapshotEnabled;

  private String s2sToken;

  private String j2cAlias;

  private boolean isSmartCloud;

  private HttpClient httpClient;

  private String eidtorStorage;

  private boolean isViewerVerse;

  private String filesPath;

  public static final String SMART_CLOUD = "smart_cloud";

  public static final String enterKey = System.getProperty("line.separator");

  private boolean isThirdPartyCheckEnabled = false ;

  /**
   *
   */
  private static final long serialVersionUID = 1L;

  private static long JOB_CHECK_FAILOVER_INTERVAL = 2 * 60 * 1000;

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    config = null;
    doCheck(req);

    String date = new Date().toString();
    StringBuffer fileBuffer = new StringBuffer("[").append(date).append("] ").append("Viewer sanity results:").append(enterKey)
        .append(enterKey);

    StringBuffer responseBuffer = new StringBuffer();
    responseBuffer.append("<table width='80%' border=\"0\" bgcolor=\"darkGray\">");
    responseBuffer.append("<tr>").append("<th aligh=\"left\">").append("<font color=\"#FFFFFF\">");
    responseBuffer.append("SANITY CHECK REPORT - HCL Docs Viewer");
    responseBuffer.append("</font>").append("</th>").append("</tr>");
    responseBuffer.append("<tr>");
    responseBuffer.append("<td>");
    responseBuffer.append("<table width='100%' border=\"0\">");
    responseBuffer.append("<tr bgcolor=\"#FFFFFF\">");
    responseBuffer.append("<th>").append("Test").append("</th>");
    responseBuffer.append("<th>").append("Details").append("</th>");
    // responseBuffer.append("<th>").append("Status").append("</th>");
    // responseBuffer.append("<th>").append("Duration (ms)").append("</th>");
    responseBuffer.append("<th>").append("Result").append("</th>");
    responseBuffer.append("</tr>");

    Set<Object> keys = results.keySet();
    Iterator iter = keys.iterator();
    while (iter.hasNext())
    {
      // html response
      String key = (String) iter.next();
      String msg = (String) ((JSONObject) results.get(key)).get(ISanityCheck.STATUS_MSG);
      responseBuffer.append("<tr>");
      responseBuffer.append("<td width='20%' bgcolor=\"#F0F0F0\">");
      responseBuffer.append(key);
      responseBuffer.append("</td>");
      responseBuffer.append("<td width='70%' bgcolor=\"#F0F0F0\">");
      responseBuffer.append(msg);
      String status = (String) ((JSONObject) results.get(key)).get(ISanityCheck.STATUS);
      if (status.equals(ISanityCheck.STATUS_SUCCESS))
      {
        responseBuffer.append("<td align=\"center\" bgcolor=\"#00FF00\">").append(ISanityCheck.STATUS_SUCCESS).append("</td>");
      }
      else
      {
        responseBuffer.append("<td align=\"center\" bgcolor=\"#FF0000\">").append(ISanityCheck.STATUS_FAIL).append("</td>");
      }
      responseBuffer.append("</tr>");

      // file output

      fileBuffer.append(key).append(": ").append(status).append(". ").append(enterKey);
      fileBuffer.append(msg).append(enterKey).append(enterKey);
    }
    resp.setContentType("text/html");
    resp.setCharacterEncoding("UTF-8");
    resp.setStatus(HttpServletResponse.SC_OK);
    resp.getWriter().write(responseBuffer.toString());

    String path = WASConfigHelper.getServerLogPath();
    if (path != null)
    {
      File targetDir = new File(path);
      if (!targetDir.exists())
      {
        LOG.log(Level.SEVERE, "Failed to write sanity results, since {0} is not existed.", targetDir);
        return;
      }
      File targetFile = new File(targetDir, "vsanityResult.txt");
      PrintWriter p = null;
      try
      {
        if (!targetFile.exists() && !targetFile.createNewFile())
        {
          LOG.log(Level.SEVERE, "Failed to create file at {0}", targetFile);
        }
        else
        {
          p = new PrintWriter(new FileOutputStream(targetFile));
          p.write(fileBuffer.toString());
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Failed to write sanity results to local disk.", e);
      }
      finally
      {
        if (p != null)
        {
          p.close();
          p = null;
        }
      }
    }
  }

  public void doCheck(HttpServletRequest request)
  {
    checkConfiguration();
    checkViewerSharedStorage();
    checkFilesSharedStorage();
    checkDocsSharedStorage();
    if (isViewerVerse)
    {
      checkLocalStorage();
    }
    else
    {
      checkConversionNodes();
    }
    checkThirdIntegration(request);
  }

  private void checkLocalStorage()
  {
    JSONObject status = new JSONObject();
    URL url = null;
    File testFile = null;
    File testFolder = null;
    GetMethod getMethod = null;
    try
    {
      String hostname = InetAddress.getLocalHost().getCanonicalHostName();
      conversionURL = conversionURL.replace("localhost", hostname);
      LOG.info("conversionURL=" + conversionURL);
      url = new URL(conversionURL);

      String localDataRoot = WASConfigHelper.getCellVariable("VIEWER_LOCAL_DATA_ROOT");
      if (localDataRoot == null)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Unable to find the local data root in Websphere variables.");
        LOG.log(Level.WARNING, "Unable to find the local data root in Websphere variables.");
        return;
      }

      String localDataName = WASConfigHelper.getCellVariable("VIEWER_LOCAL_DATA_NAME");
      if (localDataName == null)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Unable to find the local data name in Websphere variables.");
        LOG.log(Level.WARNING, "Unable to find the local data name in Websphere variables.");
        return;
      }

      testFolder = new File(localDataRoot, String.valueOf(System.currentTimeMillis()));
      testFolder.mkdirs();
      testFile = new File(testFolder, "touchme" + System.currentTimeMillis());
      testFile.createNewFile();

      String path = "${" + localDataName + "}/" + testFolder.getName() + "/" + testFile.getName();
      getMethod = new GetMethod(url.toString() + "?from=viewer&f=" + URLEncoder.encode(path, "UTF-8"));
      String code = new BASE64Encoder().encode(s2sToken.getBytes());
      getMethod.setRequestHeader("token", code);
      int statusCode = 200;
      try
      {
        statusCode = httpClient.executeMethod(getMethod);
      }
      catch (Exception e)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Failed to connect to \"" + url.toString()
            + "\".  Please make sure conversion url is correctly configurated.");
        LOG.log(Level.WARNING, "Failed to connect to " + url.toString() + ".  " + e.getMessage());
        return;
      }

      if (200 != statusCode)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Conversion returns unexpected HTTP code: " + statusCode);
        LOG.log(Level.WARNING, "Conversion returns unexpected HTTP code: " + statusCode);
        return;
      }
      InputStream is = getMethod.getResponseBodyAsStream();
      JSONObject r = JSONObject.parse(is);
      String s = (String) r.get("status");
      if ("succ".equals(s))
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
        status.put(
            ISanityCheck.STATUS_MSG,
            new StringBuffer("Conversion server endpoint: ").append(url.toString())
                .append(".\n  Local storage can be accessed by both Viewer and Conversion.").toString());
      }
      else
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Conversion did not return expected status.");
        LOG.log(Level.WARNING, "Conversion did not return expected status.");
      }
    }
    catch (Exception e)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, e.getMessage());
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
      results.put(ISanityCheck.LOCAL_DATA_CHECK, status);
      if (testFile != null && testFile.exists())
      {
        testFile.delete();
      }
      if (testFolder != null && testFolder.exists())
      {
        testFolder.delete();
      }
    }

  }

  private void checkDocsSharedStorage()
  {
    JSONObject status = new JSONObject();
    if (!isSnapshotEnabled)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
      status.put(ISanityCheck.STATUS_MSG, "Snapshot is not enabled on this server. Further check is ignored.");
      results.put(ISanityCheck.DOCS_SHARED_DATA_CHECK, status);
      return;
    }

    GetMethod getMethod = null;
    try
    {
      File docsSharedRoot = new File(eidtorStorage);
      if (!docsSharedRoot.exists() || !docsSharedRoot.canRead())
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Failed to access docs shared data root.");
        LOG.log(Level.WARNING, "Failed to access docs shared data root: ", docsSharedRoot);
      }

      StringBuffer buf = new StringBuffer(editorHostURL).append(editorHostURL.endsWith("/") ? "version" : "/version");
      getMethod = new GetMethod(buf.toString());
      String code = new BASE64Encoder().encode(s2sToken.getBytes());
      getMethod.setRequestHeader("token", code);
      int statusCode = 200;
      try
      {
        statusCode = httpClient.executeMethod(getMethod);
      }
      catch (Exception e)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Failed to connect to \"" + buf.toString()
            + "\".  Please make sure docs url is correctly configurated.");
        LOG.log(Level.WARNING, "Failed to connect to " + buf.toString() + ".  " + e.getMessage());
        return;
      }

      if (200 != statusCode)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Docs returns unexpected HTTP code: " + statusCode);
        LOG.log(Level.WARNING, "Docs returns unexpected HTTP code: {0}. URL is {1}", new Object[] { statusCode, buf });
        return;
      }
      InputStream is = getMethod.getResponseBodyAsStream();
      JSONObject r = JSONObject.parse(is);
      String s = (String) r.get("build_timestamp");
      if (s != null && !s.isEmpty())
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
        status.put(ISanityCheck.STATUS_MSG,
            new StringBuffer("Docs server endpoint: ").append(buf.toString()).append(".\n  Docs storage can be accessed by Viewer.")
                .toString());
      }
      else
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Docs did not return expected status.");
        LOG.log(Level.WARNING, "Docs did not return expected status.");
      }
    }
    catch (Exception e)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, e.getMessage());
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      results.put(ISanityCheck.DOCS_SHARED_DATA_CHECK, status);
    }

  }

  @Override
  public void checkFilesSharedStorage()
  {
    JSONObject status = new JSONObject();
    File previewParent = null;
    File test = null;
    try
    {
      if (filesPath == null || filesPath.isEmpty() || filesPath.equals("None"))
      {
        StringBuffer msg = new StringBuffer();
        msg.append("Unable to find files_path in viewer-config.json. Further check is ignored.");

        status.put(ISanityCheck.STATUS, isViewerVerse ? ISanityCheck.STATUS_SUCCESS : ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msg.toString());
        LOG.log(Level.WARNING, msg.toString());
      }
      else
      {
        previewParent = new File(filesPath);
        if (!previewParent.exists())
        {
          StringBuffer msg = new StringBuffer("files_path (");
          msg.append(previewParent.getAbsolutePath());
          msg.append("), which is defined in viewer-config.json, does not exist.");

          status.put(ISanityCheck.STATUS, isViewerVerse ? ISanityCheck.STATUS_SUCCESS : ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, msg.toString());
          LOG.log(Level.WARNING, msg.toString());
        }
        else
        {
          test = new File(previewParent, String.valueOf(System.currentTimeMillis()));
          boolean succ = test.createNewFile();
          if (!succ)
          {
            StringBuffer msg = new StringBuffer("Failed to create file in files_path (");
            msg.append(previewParent.getAbsolutePath());
            msg.append("), which is defined in viewer-config.json.");

            status.put(ISanityCheck.STATUS, isViewerVerse ? ISanityCheck.STATUS_SUCCESS : ISanityCheck.STATUS_FAIL);
            status.put(ISanityCheck.STATUS_MSG, msg.toString());
            LOG.log(Level.WARNING, msg.toString());
          }
          else
          {
            StringBuffer msg = new StringBuffer("File created successfully in files_path (");
            msg.append(previewParent.getAbsolutePath());
            msg.append("), which is defined in viewer-config.json.");

            status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
            status.put(ISanityCheck.STATUS_MSG, msg.toString());
            LOG.log(Level.INFO, msg.toString());
          }
        }
      }
    }
    catch (IOException e)
    {
      StringBuffer msg = new StringBuffer("Failed to create file in files_path (");
      msg.append(previewParent.getAbsolutePath());
      msg.append("), which is defined in viewer-config.json.");

      status.put(ISanityCheck.STATUS, isViewerVerse ? ISanityCheck.STATUS_SUCCESS : ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, msg.toString());
      LOG.log(Level.WARNING, msg.toString());
    }
    finally
    {
      if (test != null && test.exists())
      {
        test.delete();
      }
      results.put(ISanityCheck.THUMBNAIL_CHECK, status);
    }
  }

  public void checkConfiguration()
  {
    JSONObject status = new JSONObject();
    try
    {
      config = ViewerConfig2.getInstance().getConfig();

      if (config == null)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "No configuration file was found.");
        LOG.log(Level.WARNING, "No configuration file was found.");
        return;
      }
      else
      {
        JSONObject envConfig = (JSONObject) config.get("deployment");
        if (envConfig == null || envConfig.get("env") == null)
        {
          status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, "deployment > env not found.");
          LOG.log(Level.WARNING, "Failed to find depolyment setting in viewer config.");
          return;
        }
        String deploy_env = (String) envConfig.get("env");
        isSmartCloud = SMART_CLOUD.equalsIgnoreCase(deploy_env);
        try
        {
          String deploy_symbol = (String) envConfig.get("symbol");
          isViewerVerse = (deploy_symbol.equalsIgnoreCase("verse"));
        }
        catch (Exception e)
        {
          isViewerVerse = false;
        }

        JSONObject component = (JSONObject) config.get("component");
        JSONArray components = (JSONArray) component.get("components");
        Iterator<JSONObject> iter = components.iterator();
        while (iter.hasNext())
        {
          JSONObject com = iter.next();
          String id = (String) com.get("id");
          if ("com.ibm.concord.viewer.platform.conversion".equals(id))
          {
            JSONObject conversionConfig = (JSONObject) com.get("config");
            JSONObject conversionSrv = ((JSONObject) conversionConfig.get("conversionService"));
            conversionURL = (String) conversionSrv.get("serviceurl");
            j2cAlias = (String) conversionSrv.get("j2c_alias");
            if (j2cAlias == null)
            {
              j2cAlias = (String) conversionSrv.get("j2cAlias");
            }
            break;
          }
          else if ("com.ibm.concord.viewer.platform.repository".equals(id))
          {
            JSONObject repositoryConfig = (JSONObject) com.get("config");
            JSONArray adapters = ((JSONArray) repositoryConfig.get("adapters"));
            Iterator<JSONObject> iterA = adapters.iterator();
            while (iterA.hasNext())
            {
              JSONObject adapter = iterA.next();
              String idA = (String) adapter.get("id");
              if ("lcfiles".equals(idA))
              {
                JSONObject adapterConfig = (JSONObject) adapter.get("config");
                filesPath = (String) adapterConfig.get("files_path");
                LOG.log(Level.INFO, "files_path in viewer config is {0}", filesPath);
                break;
              }
            }
          }
        }
        if (conversionURL == null || (j2cAlias == null && !isSmartCloud))
        {
          status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, "Invalid settting in viewer config.");
          LOG.log(Level.WARNING, "Invalid setting in viewer config: conversionURL -{0}, j2cAlias - {1}", new Object[] { conversionURL,
              j2cAlias });
          return;
        }

        JSONObject docsIntegration = (JSONObject) config.get("docs_integration");
        JSONObject htmlConfig = (JSONObject) config.get("HtmlViewerConfig");

        isSnapshotEnabled = Boolean.valueOf((String) docsIntegration.get("docs_enabled"))
            && Boolean.valueOf((String) htmlConfig.get("enabled")) && Boolean.valueOf((String) htmlConfig.get("snapshot_mode"));
        if (isSnapshotEnabled)
        {
          editorHostURL = (String) docsIntegration.get("host");
          eidtorStorage = (String) docsIntegration.get("shared_data_root");
          if (editorHostURL == null || eidtorStorage == null)
          {
            status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
            status.put(ISanityCheck.STATUS_MSG, "Invalid settting in viewer config.");
            LOG.log(Level.WARNING, "Invalid setting in viewer config: docs host -{0}, editorUrl - {1}", new Object[] { eidtorStorage,
                editorHostURL });
            return;
          }
        }

        JSONObject s2s = (JSONObject) config.get("S2S");
        s2sToken = (String) s2s.get("token");
        if (s2sToken == null)
        {
          status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, "Invalid settting in viewer config.");
          LOG.log(Level.WARNING, "Invalid setting in viewer config: s2s token is empty.");
          return;
        }
        httpClient = SanityServiceUtil.createHttpsClient(j2cAlias, isSmartCloud);
        if (httpClient == null)
        {
          status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, "Invalid settting in viewer config.");
          LOG.log(Level.WARNING, "Failed to initiate httpclient.");
          return;
        }

        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
        status.put(ISanityCheck.STATUS_MSG, "Configuration file found and correctly parsed.");
      }
    }
    catch (FileNotFoundException e)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, ViewerConfig2.getInstance().getConfigFile().getName() + " not found: " + e.getMessage());
      LOG.log(Level.WARNING, e.getMessage(), e);
      return;
    }
    catch (IOException e)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status
          .put(ISanityCheck.STATUS_MSG, "Unable to read " + ViewerConfig2.getInstance().getConfigFile().getName() + ". " + e.getMessage());
      LOG.log(Level.WARNING, e.getMessage(), e);
      return;
    }
    catch (ConfigurationException e)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, e.getMessage());
      LOG.log(Level.WARNING, e.getMessage(), e);
      return;
    }
    finally
    {
      results.put(ISanityCheck.CONFIG_CHECK, status);
    }
  }

  public void checkViewerSharedStorage()
  {
    JSONObject status = new JSONObject();
    URL url = null;
    File testFile = null;
    File testFolder = null;
    GetMethod getMethod = null;
    try
    {
      String hostname = InetAddress.getLocalHost().getCanonicalHostName();
      conversionURL = conversionURL.replace("localhost", hostname);
      LOG.info("conversionURL=" + conversionURL);
      url = new URL(conversionURL);

      String sharedDataRoot = WASConfigHelper.getCellVariable("VIEWER_SHARED_DATA_ROOT");
      if (sharedDataRoot == null)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Unable to find the shared data root in Websphere variables.");
        LOG.log(Level.WARNING, "Unable to find the shared data root in Websphere variables.");
        return;
      }

      String sharedDataName = WASConfigHelper.getCellVariable("VIEWER_SHARED_DATA_NAME");
      if (sharedDataName == null)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Unable to find the shared data name in Websphere variables.");
        LOG.log(Level.WARNING, "Unable to find the shared data name in Websphere variables.");
        return;
      }

      testFolder = new File(sharedDataRoot, String.valueOf(System.currentTimeMillis()));
      testFolder.mkdirs();
      testFile = new File(testFolder, "touchme" + System.currentTimeMillis());
      testFile.createNewFile();

      String path = "${" + sharedDataName + "}/" + testFolder.getName() + "/" + testFile.getName();
      getMethod = new GetMethod(url.toString() + "?from=viewer&f=" + URLEncoder.encode(path, "UTF-8"));
      String code = new BASE64Encoder().encode(s2sToken.getBytes());
      getMethod.setRequestHeader("token", code);
      int statusCode = 200;
      try
      {
        statusCode = httpClient.executeMethod(getMethod);
      }
      catch (Exception e)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Failed to connect to \"" + url.toString()
            + "\".  Please make sure conversion url is correctly configurated.");
        LOG.log(Level.WARNING, "Failed to connect to " + url.toString() + ".  " + e.getMessage());
        return;
      }

      if (200 != statusCode)
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Conversion returns unexpected HTTP code: " + statusCode);
        LOG.log(Level.WARNING, "Conversion returns unexpected HTTP code: " + statusCode);
        return;
      }
      InputStream is = getMethod.getResponseBodyAsStream();
      JSONObject r = JSONObject.parse(is);
      String s = (String) r.get("status");
      if ("succ".equals(s))
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
        status.put(
            ISanityCheck.STATUS_MSG,
            new StringBuffer("Conversion server endpoint: ").append(url.toString())
                .append(".\n  Shared storage can be accessed by both Viewer and Conversion.").toString());
      }
      else
      {
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, "Conversion did not return expected status.");
        LOG.log(Level.WARNING, "Conversion did not return expected status.");
      }
    }
    catch (Exception e)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, e.getMessage());
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
      results.put(ISanityCheck.SHARED_DATA_CHECK, status);
      if (testFile != null && testFile.exists())
      {
        testFile.delete();
      }
      if (testFolder != null && testFolder.exists())
      {
        testFolder.delete();
      }
    }
  }

  public void checkConversionNodes()
  {
    JSONArray nodes = null;
    GetMethod getMethod = null;
    try
    {
      nodes = SanityServiceUtil.getConversionNodes();
      for (Iterator<JSONObject> iter = nodes.iterator(); iter.hasNext();)
      {
        JSONObject status = new JSONObject();
        String url = "";
        try
        {
          JSONObject inst = (JSONObject) iter.next();
          String host = (String) inst.get(ISanityCheck.CONVERSION_HOST_KEY);
          String port = (String) inst.get(ISanityCheck.CONVERSION_PORT_KEY);
          if (!"".equals(port))
          {
            port = ":" + port;
          }
          url = new StringBuffer("http://").append(host).append(port).append("/conversion/version").toString();
          LOG.info("Conversion server information: " + url);

          HttpClient httpClient = SanityServiceUtil.createHttpsClient(j2cAlias, isSmartCloud);
          getMethod = new GetMethod(url);
          httpClient.executeMethod(getMethod);
          int statusCode = getMethod.getStatusCode();

          if (200 != statusCode)
          {
            status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
            status.put(ISanityCheck.STATUS_MSG, "Failed to get " + url + ".  Response code: " + statusCode);
            LOG.log(Level.WARNING, "Failed to get " + url + ".  Response code: " + statusCode);
          }
          else
          {
            status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
            status.put(ISanityCheck.STATUS_MSG, "Successfully performed GET request on " + url);
          }
          results.put(ISanityCheck.CONVERSION_CHECK + " on " + host, status);
        }
        catch (Exception e)
        {
          status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, "Failed on " + url + ".  " + e.getMessage());
        }
      }
    }
    catch (Exception e)
    {
      JSONObject status = new JSONObject();
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, e.getMessage());
      LOG.warning(e.getMessage());

      results.put(ISanityCheck.CONVERSION_CHECK, status);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
  }

  /**
   * @param request
   * @throws UnsupportedEncodingException
   *
   */
  @SuppressWarnings("unchecked")
  private void checkThirdIntegration(HttpServletRequest request)
  {
    LOG.entering(this.getClass().getName(), "checkThirdIntegration");
    /**
     * enable/disable third party integration check by request parameter
     */
    String thirdcheckFlag = request.getParameter(ISanityCheck.THIRD_PARTH_CHECK);
    if ("false".equalsIgnoreCase(thirdcheckFlag) || "disable".equals(thirdcheckFlag) || "0".equals(thirdcheckFlag))
    {
      isThirdPartyCheckEnabled = false;
      results.remove(ISanityCheck.THIRD_PART_CHECK);
    }
    else if ("true".equalsIgnoreCase(thirdcheckFlag) || "enable".equals(thirdcheckFlag) || "1".equals(thirdcheckFlag))
    {
      isThirdPartyCheckEnabled = true;
    }

    if (!isThirdPartyCheckEnabled)
    {
      LOG.log(Level.INFO, "Third party integration check have been disabled.");
      return;
    }

    JSONObject status = new JSONObject();
    SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmssms");
    Date now = new Date();
    String nowTime = df.format(now);
    String docId = "sample_" + nowTime + ".docx";
    ServletContext context = request.getSession().getServletContext();
    String filePathSrc = context.getRealPath("/WEB-INF/samples/" + "sample.docx");
    String filePath = context.getRealPath("/WEB-INF/samples/" + docId);
    String metaFilePath = filePath + ".meta";

    boolean thirdPartCheckFlag = false;
    String viewerUrl = null;
    String s2sTokenStr = null;
    String sanityJ2CAlias = null;
    /**
     * check whether there is sanity check in viewer-config.json
     */
    JSONObject component = (JSONObject) config.get("component");
    JSONArray components = (JSONArray) component.get("components");
    Iterator<JSONObject> iter = components.iterator();
    while (iter.hasNext() && !thirdPartCheckFlag)
    {
      JSONObject com = iter.next();
      String id = (String) com.get("id");
      if ("com.ibm.concord.viewer.platform.repository".equals(id))
      {
        JSONObject repositoryConfig = (JSONObject) com.get("config");
        JSONArray adapters = ((JSONArray) repositoryConfig.get("adapters"));
        Iterator<JSONObject> adapterIter = adapters.iterator();
        while (adapterIter.hasNext())
        {
          JSONObject adapter = adapterIter.next();
          String repoID = (String) adapter.get("id");
          if ("sanity".equals(repoID))
          {
            thirdPartCheckFlag = true;
            JSONObject adapterConfig = (JSONObject) adapter.get("config");
            viewerUrl = (String) adapterConfig.get("viewer_url");
            s2sTokenStr = (String) adapterConfig.get("s2s_token");
            sanityJ2CAlias = (String) adapterConfig.get("j2c_alias");
            LOG.log(Level.FINE, "files_path in viewer config is {0}", filesPath);
            break;
          }
        }
      }
    }
    if (!thirdPartCheckFlag)
    {
      LOG.log(Level.WARNING, "No third party integration checks required .");
      return;
    }
    if (viewerUrl == null || (viewerUrl != null && "".equals(viewerUrl)))
    {
      viewerUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
      LOG.log(Level.WARNING, String.format(
          "Invalid setting in viewer config: viewerUrl is empty , do local third party integration cehck , viewerUrl : %s .", viewerUrl));
    }
    if (s2sTokenStr == null)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, "Invalid settting in viewer config.");
      LOG.log(Level.WARNING, "Invalid setting in viewer config: s2s token is empty.");
      return;
    }
    if (sanityJ2CAlias == null)
    {
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, "Invalid settting in viewer config.");
      LOG.log(Level.WARNING, "Invalid setting in viewer config: s2s token is empty.");
      return;
    }
    String viewerURL = viewerUrl.trim().endsWith("/") == true ? viewerUrl.substring(0, viewerUrl.lastIndexOf("/")) : viewerUrl;
    LOG.log(Level.WARNING, String.format("Get viewer url : %s , from viewer config.", viewerURL));
    String url = String.format("%s/viewer/uploadconvert/sanity/{ID}", viewerURL);
    String viewUrl = String.format("%s/viewer/app/sanity/{ID}/content?mode=compact", viewerURL);
    String jobCheckUrl = String.format("%s/viewer/api/job/sanity/{ID}/{jobID}", viewerURL);
    String metaUrl = String.format("%s/viewer/app/sanity/{ID}/content/meta.json?mode=compact", viewerURL);
    String viewCleanUrl = String.format("%s/viewer/upload/sanity/{ID}?request=PURGE_SANITY", viewerURL);
    InputStream is = null;
    try
    {
      JSONObject copyFileToFileResult = SanityFileUtil.copyFileToFile(filePathSrc, filePath);
      if (copyFileToFileResult != null && copyFileToFileResult.containsKey(ISanityCheck.STATUS_FAIL))
      {
        String msgStr = String.format("Except occur when call copyFileToFile , msg : %s.",
            copyFileToFileResult.get(ISanityCheck.STATUS_FAIL));
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }
      JSONObject generateMetaResult = SanityFileUtil.generateMeta(filePath, metaFilePath);
      if (generateMetaResult != null && generateMetaResult.containsKey(ISanityCheck.STATUS_FAIL))
      {
        String msgStr = String.format("Except occur when call generateMeta , msg : %s.", generateMetaResult.get(ISanityCheck.STATUS_FAIL));
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }
      String code = new BASE64Encoder().encode(s2sTokenStr.trim().getBytes());
      HttpClient httpClient = SanityServiceUtil.createHttpsClient(sanityJ2CAlias.trim(), isSmartCloud);
      if (httpClient == null)
      {
        String msgStr = "Failed to initiate httpclient.";
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }

      String uploadURL = url.replace("{ID}", URLEncoder.encode(docId, "UTF-8"));
      PostMethod postMethod = new PostMethod(uploadURL);
      postMethod.setRequestHeader("s2stoken", code);
      int statusCode = httpClient.executeMethod(postMethod);
      if (statusCode != Response.Status.OK.getStatusCode())
      {
        String msgStr = String.format("Except statusCode return after upload document to viewer by url : %s .", uploadURL);
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }

      String importJobIDStr = null;
      Header importJobIDresponseHeader = postMethod.getResponseHeader(SanityConstants.IMPORT_JOB_ID);
      if (importJobIDresponseHeader == null
          || (importJobIDresponseHeader != null && (importJobIDresponseHeader.getValue() == null || "".equals(importJobIDresponseHeader
              .getValue()))))
      {
        String msgStr = String.format("Except response return after upload document to viewer by url : %s .", uploadURL);
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }

      Header importJobModifiedResponseHeader = postMethod.getResponseHeader(SanityConstants.IMPORT_JOB_MODIFIED);

      /**
       * wait for thumbnails job call back to notify web container thread
       */
      long waitThumbnailsJobStartTime = new Date().getTime();
      synchronized (SanityRestService.obj)
      {
        LOG.log(Level.FINE, "Start to wait for thumbnails job call back .");
        SanityRestService.obj.wait(JOB_CHECK_FAILOVER_INTERVAL);
      }
      long waitThumbnailsJobEndTime = new Date().getTime();
      LOG.log(Level.FINE, String.format("Wait %s ms for thumbnails job call back .", waitThumbnailsJobEndTime - waitThumbnailsJobStartTime));

      /**
       * check status of import job
       */
      int importJobCheckTimes = 1;
      importJobIDStr = importJobIDresponseHeader.getValue();
      String importJobCheckURL = jobCheckUrl.replace("{ID}", URLEncoder.encode(docId, "UTF-8")).replace("{jobID}",
          URLEncoder.encode(importJobIDStr, "UTF-8"));
      GetMethod importJobCheckGetMethod = new GetMethod(importJobCheckURL);
      importJobCheckGetMethod.setRequestHeader("s2stoken", code);
      long importJobStartTime = new Date().getTime();
      long importJobEndTime = importJobStartTime;
      JSONObject importJobResp = null;
      while (importJobEndTime - importJobStartTime <= JOB_CHECK_FAILOVER_INTERVAL)
      {
        LOG.log(Level.FINE, String.format("The %s time to check job id status by url %s .", importJobCheckTimes++, importJobCheckURL));
        int jobCheckStatusCode = httpClient.executeMethod(importJobCheckGetMethod);
        if (jobCheckStatusCode != Response.Status.OK.getStatusCode())
        {
          LOG.log(Level.WARNING, String.format("Check job id status failed by url %s .", importJobCheckURL));
          continue;
        }
        is = importJobCheckGetMethod.getResponseBodyAsStream();
        if (is != null)
        {
          importJobResp = JSONObject.parse(is);
          LOG.log(Level.WARNING, String.format("Result %s of check job id status  by url %s .", importJobResp, importJobCheckURL));
          if (importJobResp != null && importJobResp.containsKey("status") && "complete".equals(importJobResp.get("status")))
          {
            break;
          }
        }
        Thread.sleep(1000);
        importJobEndTime = new Date().getTime();
      }
      if (importJobResp == null
          || !(importJobResp != null && importJobResp.containsKey("status") && "complete".equals(importJobResp.get("status"))))
      {
        String msgStr = String.format("Except occur when check import job status by url %s .", importJobCheckURL);
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }

      /**
       * view document
       */
      String viewURL = viewUrl.replace("{ID}", URLEncoder.encode(docId, "UTF-8"));
      GetMethod viewGetMethod = new GetMethod(viewURL);
      viewGetMethod.setRequestHeader("s2stoken", code);
      int viewStatusCode = httpClient.executeMethod(viewGetMethod);
      if (viewStatusCode != Response.Status.OK.getStatusCode())
      {
        String msgStr = String.format("Except status return when view document by url %s .", viewURL);
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }
      String metaURL = metaUrl.replace("{ID}", URLEncoder.encode(docId, "UTF-8"));
      GetMethod metaGetMethod = new GetMethod(metaURL);
      metaGetMethod.setRequestHeader("s2stoken", code);
      int metaStatusCode = httpClient.executeMethod(metaGetMethod);
      if (metaStatusCode == Response.Status.OK.getStatusCode())
      {
        JSONObject checkViewerDraftResult = checkViewerDraft(filePath, metaURL, metaGetMethod);
        if (checkViewerDraftResult != null && checkViewerDraftResult.containsKey(ISanityCheck.STATUS_FAIL))
        {
          String msgStr = String.format("Except occur when call checkViewerDraft , msg : %s.",
              checkViewerDraftResult.get(ISanityCheck.STATUS_FAIL));
          status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
          status.put(ISanityCheck.STATUS_MSG, msgStr);
          LOG.log(Level.WARNING, msgStr);
          return;
        }
      }
      else
      {
        String msgStr = String.format("Unable to get meta.json of doc by url %s .", metaURL);
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }

      /**
       * clean cache
       */
      String viewCleanURL = viewCleanUrl.replace("{ID}", URLEncoder.encode(docId, "UTF-8"));
      PostMethod viewCleanPostMethod = new PostMethod(viewCleanURL);
      viewCleanPostMethod.setRequestHeader("s2stoken", code);
      viewCleanPostMethod.setParameter(SanityConstants.MIMETYPE, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      viewCleanPostMethod.setParameter(SanityConstants.TITLE, docId);
      viewCleanPostMethod.setParameter(SanityConstants.FILESIZE,
          (String) (generateMetaResult.get("size") != null ? generateMetaResult.get("size") : "11965"));
      viewCleanPostMethod.setParameter("modified", importJobModifiedResponseHeader.getValue());
      int viewCleanStatusCode = httpClient.executeMethod(viewCleanPostMethod);
      if (viewCleanStatusCode != Response.Status.OK.getStatusCode())
      {
        String msgStr = String.format("Unable to clean cache of sanity check by url %s .", viewCleanURL);
        status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
        status.put(ISanityCheck.STATUS_MSG, msgStr);
        LOG.log(Level.WARNING, msgStr);
        return;
      }

      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_SUCCESS);
      status.put(ISanityCheck.STATUS_MSG, String.format("Successfully performed http request on url : %s .", uploadURL));
    }
    catch (UnsupportedEncodingException e)
    {
      String msgStr = "UnsupportedEncodingException occur when simulate http request to viewer for third party integration check.";
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, msgStr);
      LOG.log(Level.SEVERE, msgStr, e);
    }
    catch (HttpException e)
    {
      String msgStr = "HttpException occur when simulate http request to viewer for third party integration check.";
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, msgStr);
      LOG.log(Level.SEVERE, msgStr, e);
    }
    catch (IOException e)
    {
      String msgStr = "IOException occur when simulate http request to viewer for third party integration check.";
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, msgStr);
      LOG.log(Level.SEVERE, msgStr, e);
    }
    catch (Exception e)
    {
      String msgStr = "Except occur when simulate http request to viewer for third party integration check.";
      status.put(ISanityCheck.STATUS, ISanityCheck.STATUS_FAIL);
      status.put(ISanityCheck.STATUS_MSG, msgStr);
      LOG.log(Level.SEVERE, msgStr, e);
    }
    finally
    {
      File file = new File(filePath);
      if (file.exists())
      {
        file.delete();
      }
      File metaFile = new File(metaFilePath);
      if (metaFile.exists())
      {
        metaFile.delete();
      }

      try
      {
        if (is != null)
        {
          is.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(
            Level.SEVERE,
            "IOException occur when close file input stream after simulate http request to viewer for third party integration checkof checkThirdIntegration .",
            e);
      }

      results.put(ISanityCheck.THIRD_PART_CHECK, status);
    }

    LOG.exiting(this.getClass().getName(), "checkThirdIntegration");
  }

  /**
   * @param status
   * @param filePath
   * @param metaURL
   * @param metaGetMethod
   * @throws IOException
   */
  private JSONObject checkViewerDraft(String filePath, String metaURL, GetMethod metaGetMethod)
  {
    LOG.entering(this.getClass().getName(), "checkViewerDraft");
    JSONObject resultJson = new JSONObject();
    InputStream is = null;
    OutputStream out = null;
    InputStream metaInputStream = null;
    JSONObject metaJsonObject = null;
    String meta1Path = filePath + ".meta.1";
    File meta1File = new File(meta1Path);
    try
    {
      is = metaGetMethod.getResponseBodyAsStream();
      out = new FileOutputStream(meta1File);
      final byte[] buffer = new byte[8192];
      int n = 0;
      while ((n = is.read(buffer)) != -1)
      {
        out.write(buffer, 0, n);
      }
      out.flush();
      metaInputStream = new FileInputStream(meta1File);
      metaJsonObject = JSONObject.parse(metaInputStream);
    }
    catch (IOException e)
    {
      String msgStr = String.format("IOException occur when get meta.json of doc by url %s .", metaURL);
      resultJson.put(ISanityCheck.STATUS_FAIL, msgStr);
      LOG.log(Level.WARNING, msgStr, e);
      return resultJson;
    }
    finally
    {
      try
      {
        if (is != null)
          is.close();
        if (out != null)
          out.close();
        if (metaInputStream != null)
          metaInputStream.close();
      }
      catch (IOException e)
      {
        String msgStr = String.format("IOException occur when close stream of doc by url %s .", metaURL);
        resultJson.put(ISanityCheck.STATUS_FAIL, msgStr);
        LOG.log(Level.WARNING, msgStr, e);
        return resultJson;
      }
    }
    if (meta1File.length() == 0)
    {
      String msgStr = String.format("Unable to get meta.json of doc by url %s .", metaURL);
      resultJson.put(ISanityCheck.STATUS_FAIL, msgStr);
      LOG.log(Level.WARNING, msgStr);
      return resultJson;
    }

    if (meta1File.exists())
    {
      meta1File.delete();
    }
    resultJson.put(ISanityCheck.STATUS_SUCCESS, metaJsonObject);
    LOG.exiting(this.getClass().getName(), "checkViewerDraft resultJson : " + resultJson);
    return resultJson;
  }

}
