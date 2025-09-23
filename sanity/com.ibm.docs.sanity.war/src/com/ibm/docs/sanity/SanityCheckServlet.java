package com.ibm.docs.sanity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.SocketTimeoutException;
import java.text.MessageFormat;
import java.util.Date;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.util.EntityUtils;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.check.CheckPointFactory;
import com.ibm.docs.sanity.check.ISanityCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class SanityCheckServlet extends HttpServlet
{
  private static final long serialVersionUID = 2084527884647203878L;

  private static final Logger LOG = Logger.getLogger(SanityCheckServlet.class.getName());

  private static final String ACCEPT_HEADER = "accept";

  private static final String APP_PARAMETER = "app";

  private static final String APP_DOCS = "docs";

  private static final String APP_CONVERSION = "conversion";

  private static final String APP_DOCS_AND_CONVERSION = "all";

  private static final String QUERY_TYPE = "querytype";

  private static final String QUERY_TYPE_COLLECT = "collect";

  private static final String QUERY_TYPE_REPORT = "report";

  private static final String REQUEST_RUL = "http://{0}:{1}/sanity/check?app={2}&querytype={3}";

  private static final String REPORT_JSP = "/jsp/report.jsp";

  public static final String enterKey = System.getProperty("line.separator");

  public SanityCheckServlet()
  {
    super();
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(SanityCheckServlet.class.getName(), "doGet", new Object[] { request.getRequestURI(), request.getHeader(ACCEPT_HEADER),
        request.getParameter(ACCEPT_HEADER) });

    int nServerPort = request.getServerPort();

    String acceptHeader = request.getParameter(ACCEPT_HEADER) == null ? request.getHeader(ACCEPT_HEADER) : request
        .getParameter(ACCEPT_HEADER);
    String appName = request.getParameter(APP_PARAMETER);
    String formatMime;

    if (acceptHeader == null)
    {
      formatMime = Constants.ACCEPT_HEADER_XML;
    }
    else if (acceptHeader.contains("html"))
    {
      formatMime = Constants.ACCEPT_HEADER_HTML;
    }
    else if (acceptHeader.contains("json"))
    {
      formatMime = Constants.ACCEPT_HEADER_JSON;
    }
    else if (acceptHeader.contains("xml"))
    {
      formatMime = Constants.ACCEPT_HEADER_XML;
    }
    else
    {
      formatMime = Constants.ACCEPT_HEADER_XML;
    }

    String queryType = request.getParameter(QUERY_TYPE);
    if (queryType != null)
    {
      if (queryType.equalsIgnoreCase(QUERY_TYPE_COLLECT))
      {
        formatMime = Constants.ACCEPT_HEADER_JSON;
      }
      else if (queryType.equalsIgnoreCase(QUERY_TYPE_REPORT))
      {
        doReturnReport(request, response, appName);
        return;
      }
    }

    boolean success = true;
    DeploymentServerType serverType = ServerTypeUtil.getServerType();
    if (appName != null)
    {
      if (appName.equalsIgnoreCase(APP_DOCS))
      {
        if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
        {
          serverType = DeploymentServerType.CLOUD_DOCS_ONLY;
        }
        else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
        {
          serverType = DeploymentServerType.ONPREMISE_DOCS_ONLY;
        }
      }
      else if (appName.equalsIgnoreCase(APP_CONVERSION))
      {
        if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
        {
          serverType = DeploymentServerType.CLOUD_CONVERSION_ONLY;
        }
        else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
        {
          serverType = DeploymentServerType.ONPREMISE_CONVERSION_ONLY;
        }
      }
      else if (appName.equalsIgnoreCase(APP_DOCS_AND_CONVERSION))
      {
        if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
        {
          serverType = DeploymentServerType.CLOUD_DOCS_CONVERSION;
        }
        else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
        {
          serverType = DeploymentServerType.ONPREMISE_DOCS_CONVERSION;
        }
      }
    }
    // int serverType = ServerTypeUtil.getServerType();
    ISanityCheckPoint[] all = null;
    // temporarily comment
    if (serverType == DeploymentServerType.CLOUD_DOCS_CONVERSION)
    {
      all = CheckPointFactory.createAll(formatMime, nServerPort);
    }
    else if (serverType == DeploymentServerType.CLOUD_DOCS_ONLY)
    {
      all = CheckPointFactory.create4Docs(formatMime, nServerPort);
    }
    else if (serverType == DeploymentServerType.CLOUD_CONVERSION_ONLY)
    {
      all = CheckPointFactory.create4Conv(formatMime, nServerPort);
    }
    else if (serverType == DeploymentServerType.ONPREMISE_DOCS_CONVERSION)
    {
      all = CheckPointFactory.createAll(formatMime, nServerPort);
    }
    else if (serverType == DeploymentServerType.ONPREMISE_DOCS_ONLY)
    {
      all = CheckPointFactory.create4Docs(formatMime, nServerPort);
    }
    else if (serverType == DeploymentServerType.ONPREMISE_CONVERSION_ONLY)
    {
      all = CheckPointFactory.create4Conv(formatMime, nServerPort);
    }
    else
    {
      throw new RuntimeException(MessageFormat.format(
          "Found illegal server type \"{0}\", which cannot be supported by this sanity check application.", serverType));
    }

    Vector<SanityCheckPointItem> checkResult = new Vector<SanityCheckPointItem>(all.length);

    for (int i = 0; i < all.length; i++)
    {
      try
      {
        all[i].setUp();
        all[i].doCheck();
      }
      catch (SanityCheckException sce)
      {
        success = false;
        LOG.log(Level.SEVERE, "Sanity Check Failed.", sce);
      }
      finally
      {
        try
        {
          all[i].tearDown();
        }
        catch (SanityCheckException sce)
        {
          success = false;
          LOG.log(Level.WARNING, "Sanity Check Tear Down Failed.", sce);
        }

        SanityCheckPointItem checkPointItem = all[i].report();
        checkResult.add(checkPointItem);

        LOG.log(Level.INFO, "Sanity Check Point Result: {0} {1} {2}", new Object[] { checkPointItem.getName(), checkPointItem.getResult(),
            checkPointItem.getResult().isSanity() });
      }
    }

    if (Constants.ACCEPT_HEADER_JSON.equals(formatMime))
    {
      doReturnAsJSON(request, response, checkResult);
    }
    else if (Constants.ACCEPT_HEADER_XML.equals(formatMime))
    {
      doReturnAsXML(request, response, checkResult);
    }
    else if (Constants.ACCEPT_HEADER_HTML.equals(formatMime))
    {
      doReturnAsHTML(request, response, checkResult);
      logResult(checkResult);
    }
    else
    {
      doReturnAsJSON(request, response, checkResult);
    }

    LOG.exiting(SanityCheckServlet.class.getName(), "doGet", success ? "SUCCESS" : "FAILED");
  }

  private void logResult(Vector<SanityCheckPointItem> checkResult)
  {
    String date = new Date().toString();
    StringBuffer fileBuffer = new StringBuffer("[").append(date).append("] ").append("Conversion sanity results:").append(enterKey)
        .append(enterKey);
    for (int i = 0; i < checkResult.size(); i++)
    {
      fileBuffer.append(checkResult.get(i).getName()).append(":");
      String status = checkResult.get(i).getResult().toString();
      fileBuffer.append(status.contains("OK") ? "OK" : "FAILED").append(enterKey);
      fileBuffer.append(checkResult.get(i).getDescription()).append(enterKey).append(enterKey);

    }
    String path = ServerTypeUtil.getServerLogPath();
    if (path != null)
    {
      File targetDir = new File(path);
      if (!targetDir.exists())
      {
        LOG.log(
            Level.WARNING,
            "Sanity result is not logged on this machine. It is only logged on viewernext nodes. If it is, please make sure the directory of c:/LotusLive/Log is existed.",
            targetDir);
        return;
      }
      File targetFile = new File(targetDir, "csanityResult.txt");
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

  private void doReturnAsJSON(HttpServletRequest request, HttpServletResponse response, Vector<SanityCheckPointItem> checkResult)
      throws ServletException, IOException
  {
    JSONArray jsonResult = new JSONArray();
    String jsonString = null;
    for (int i = 0; i < checkResult.size(); i++)
    {
      JSONObject result = new JSONObject();
      JSONObject rawResult = new JSONObject();
      try
      {
        jsonString = checkResult.get(i).getResult().toString();
        rawResult = JSONObject.parse(jsonString);
        rawResult.put("name", checkResult.get(i).getName());
        rawResult.put("details", checkResult.get(i).getDescription());
      }
      catch (IOException e)
      {
        rawResult.put("name", checkResult.get(i).getName());
        rawResult.put("details", "Result parse error");
        rawResult.put("duration", "Result parse error");
        rawResult.put("reason", "Result parse error");
        rawResult.put("result", "Failed");
      }
      result.put("checkpoint", rawResult);
      jsonResult.add(result);
    }

    response.setContentType(Constants.ACCEPT_HEADER_JSON);
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    jsonResult.serialize(response.getWriter(), true);
  }

  private void doReturnAsXML(HttpServletRequest request, HttpServletResponse response, Vector<SanityCheckPointItem> checkResult)
      throws ServletException, IOException
  {
    StringBuffer responseBuffer = new StringBuffer();
    responseBuffer.append("<report>");
    for (int i = 0; i < checkResult.size(); i++)
    {
      responseBuffer.append("<checkpoint>");
      responseBuffer.append("<name>");
      responseBuffer.append(checkResult.get(i).getName());
      responseBuffer.append("</name>");
      responseBuffer.append("<details>");
      responseBuffer.append(checkResult.get(i).getDescription());
      responseBuffer.append("</details>");
      responseBuffer.append(checkResult.get(i).getResult().toString());
      responseBuffer.append("</checkpoint>");
    }
    responseBuffer.append("</report>");

    response.setContentType(Constants.ACCEPT_HEADER_XML);
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(responseBuffer.toString());
  }

  private void doReturnAsHTML(HttpServletRequest request, HttpServletResponse response, Vector<SanityCheckPointItem> checkResult)
      throws ServletException, IOException
  {
    StringBuffer responseBuffer = new StringBuffer();
    responseBuffer.append("<table border=\"0\" bgcolor=\"darkGray\">");
    responseBuffer.append("<tr>").append("<th aligh=\"left\">").append("<font color=\"#FFFFFF\">");
    responseBuffer.append("SANITY CHECK REPORT - IBM DOCS & CONVERSION");
    responseBuffer.append("</font>").append("</th>").append("</tr>");
    responseBuffer.append("<tr>");
    responseBuffer.append("<td>");
    responseBuffer.append("<table border=\"0\">");
    responseBuffer.append("<tr bgcolor=\"#FFFFFF\">");
    responseBuffer.append("<th>").append("Test").append("</th>");
    responseBuffer.append("<th>").append("Details").append("</th>");
    responseBuffer.append("<th>").append("Status").append("</th>");
    responseBuffer.append("<th>").append("Duration").append("</th>");
    responseBuffer.append("<th>").append("Result").append("</th>");
    responseBuffer.append("</tr>");
    for (int i = 0; i < checkResult.size(); i++)
    {
      responseBuffer.append("<tr>");
      responseBuffer.append("<td bgcolor=\"#F0F0F0\">");
      responseBuffer.append(checkResult.get(i).getName());
      responseBuffer.append("</td>");
      responseBuffer.append("<td bgcolor=\"#F0F0F0\">");
      responseBuffer.append(checkResult.get(i).getDescription());
      responseBuffer.append("</td>");
      responseBuffer.append(checkResult.get(i).getResult().toString());
      responseBuffer.append("</tr>");
    }
    responseBuffer.append("</table>");
    responseBuffer.append("</td>");
    responseBuffer.append("</tr>");
    responseBuffer.append("</table>");

    response.setContentType(Constants.ACCEPT_HEADER_HTML);
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(responseBuffer.toString());
  }

  private void doReturnReport(HttpServletRequest request, HttpServletResponse response, String appName) throws ServletException,
      IOException
  {
    String[] apps = null;
    String messages = "";
    if ("all".equalsIgnoreCase(appName))
    {
      apps = new String[] { "docs", "conversion" };
    }
    else
    {
      apps = new String[] { appName };
    }

    JSONObject resultJSON = new JSONObject();

    for (String app : apps)
    {
      JSONObject conversionSanityJson = ServerTypeUtil.readJsonConfigureFile(app + "_sanity.json");

      if (conversionSanityJson == null)
      {
        response.setContentType(Constants.ACCEPT_HEADER_JSON);
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        messages += "Cannot open file: " + app + "_sanity.json, so no report for " + app + " servers<br/>";
        continue;
      }

      JSONArray hostArray = (JSONArray) conversionSanityJson.get("cluster_hosts");

      HttpGet collectRequest = null;
      HttpClient client = ServerTypeUtil.createHttpClient();
      for (Object host : hostArray)
      {
        try
        {
          JSONObject hostjson = (JSONObject) host;
          String hostname = (String) hostjson.get("hostname");
          String WC_defaulthost = (String) hostjson.get("WC_defaulthost");
          collectRequest = new HttpGet(MessageFormat.format(REQUEST_RUL, hostname, WC_defaulthost, app, QUERY_TYPE_COLLECT));
          HttpResponse collectResponse = client.execute(collectRequest);
          HttpEntity responseEntity = collectResponse.getEntity();
          if (responseEntity != null)
          {
            String result = EntityUtils.toString(responseEntity);
            if (result != null)
            {
              resultJSON.put(hostname, JSONArray.parse(result));
            }
          }
        }
        catch (ClientProtocolException e)
        {
          LOG.log(Level.SEVERE, "Client protocol error.", e);
          messages += "Client protocol error, when requesting sanity result from " + host.toString() + "<br/>";
        }
        catch (SocketTimeoutException e)
        {
          LOG.log(Level.SEVERE, "Socket connection is timed out.", e);
          messages += "Socket connection is timed out, when requesting sanity result from " + host.toString() + "<br/>";
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "IO error when requesting sanity result from " + host.toString() + ".", e);
          messages += "IO error, when requesting sanity result from " + host.toString() + "<br/>";
        }
        catch (Exception e)
        {
          LOG.log(Level.SEVERE, e.toString() + " when requesting sanity result from " + host.toString() + ".", e);
          messages += e.toString() + ", when requesting sanity result from " + host.toString() + "<br/>";
        }
        finally
        {
          if (collectRequest != null)
          {
            collectRequest.abort();
          }
        }
      }
    }
    request.setAttribute("Messages", messages);
    request.setAttribute("reportData", resultJSON);
    request.getRequestDispatcher(REPORT_JSP).forward(request, response);
  }
}
