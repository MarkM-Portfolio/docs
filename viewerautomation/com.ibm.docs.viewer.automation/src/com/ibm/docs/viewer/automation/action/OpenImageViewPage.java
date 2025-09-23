package com.ibm.docs.viewer.automation.action;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;

public class OpenImageViewPage extends AbstractAction
{
  protected String fileId;

  protected String jobId;

  protected String version;

  protected String repositoryId;

  protected String userAgent;

  private String[] params;

  protected static final String JOB_ID_PATTERN = "DOC_SCENE.jobId = \\(\"\\w{4,32}\""; // DOC_SCENE.jobId = ("null"
                                                                                       // DOC_SCENE.jobId =
                                                                                       // ("8cd368e3e607acdb8973a1f7db03d35c"

  protected static final String VERSION_PATTERN = "DOC_SCENE.version = \\d{1,32}"; // DOC_SCENE.version = 1

  private static final Logger logger = Logger.getLogger(OpenImageViewPage.class.getName());

  public OpenImageViewPage(HttpClient client, Server server, String fileId, String repositoryId, String userAgent, String[] params)
  {
    super(client, server, RequestType.HTTP_GET);

    this.fileId = fileId;
    this.repositoryId = repositoryId;
    this.userAgent = userAgent;
    this.params = params;
  }

  public OpenImageViewPage(HttpClient client, Server server, String fileId, String repositoryId)
  {
    this(client, server, fileId, repositoryId, null, null);
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    if (userAgent != null)
    {
      request.setHeader("User-Agent", userAgent);
    }

  }

  @Override
  // TODO change it to pattern way
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);
    String response = data.getDataAsString();
    Pattern pattern = null;
    Matcher match = null;

    String temp = null;

    pattern = Pattern.compile(JOB_ID_PATTERN);

    match = pattern.matcher(response);
    while (match.find())
    {
      temp = match.group();
      if (temp != null)
        break;
    }
    if (temp != null)
    {
      jobId = temp.substring(temp.indexOf("\"") + 1, temp.lastIndexOf("\""));
    }
    else
    {
      logger.warning("Unexpected reponse data when opening view page.");
      throw new Exception("Unexpected reponse data");
    }

    temp = null;

    pattern = Pattern.compile(VERSION_PATTERN);

    match = pattern.matcher(response);
    while (match.find())
    {
      temp = match.group();
      if (temp != null)
        break;
    }
    if (temp != null)
    {
      version = temp.substring(temp.indexOf("=") + 1).trim();
    }
    else
    {
      logger.warning("Unexpected reponse data when opening view page.");
      throw new Exception("Unexpected reponse data");
    }

  }

  @Override
  protected String getURI()
  {
    StringBuffer url = new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/app/").append(repositoryId).append("/")
        .append(fileId).append("/content");

    List<NameValuePair> parameters = null;
    if (!ViewerAutomationConfig.getConfig().getFullViewerEnabled())
    {
      if (parameters == null)
      {
        parameters = new ArrayList<NameValuePair>();
      }
      parameters.add(new BasicNameValuePair("mode", "compact"));
    }
    if (params != null)
    {
      if (parameters == null)
      {
        parameters = new ArrayList<NameValuePair>();
      }
      for (String param : params)
      {
        String[] tokens = param.split("=");
        parameters.add(new BasicNameValuePair(tokens[0], tokens[1]));
      }
    }
    if (parameters != null)
    {
      String parameterString = URLEncodedUtils.format(parameters, "utf-8"); //$NON-NLS-1$
      url.append("?").append(parameterString).toString();
    }
    logger.info("View url: " + url);

    return url.toString();
  }

  @Override
  public Map<String, String> getData()
  {
    Map<String, String> map = new HashMap<String, String>();
    map.put("jobId", jobId);
    map.put("version", version);
    return map;
  }

  public static void main(String args[])
  {
    String testStr = "DOC_SCENE.jobId = (\"null\"==\"null\")";
    String PATTERN = "DOC_SCENE.jobId = \\(\"\\w{4,32}\""; // " + 32 + "
    String dist = null;
    Pattern p = Pattern.compile(PATTERN);

    Matcher m = p.matcher(testStr);
    while (m.find())
    {
      dist = m.group();
    }
    dist.substring(dist.indexOf("\"") + 1, dist.lastIndexOf("\""));

    String VERSION_PATTERN = "DOC_SCENE.version = \\d{1,32}";
    String vv = " DOC_SCENE.version = 1;";
    p = Pattern.compile(VERSION_PATTERN);

    m = p.matcher(vv);
    while (m.find())
    {
      dist = m.group();
    }
    dist.substring(dist.indexOf("=") + 1);

  }

}
