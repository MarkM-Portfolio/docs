package com.ibm.docs.viewer.automation.action;

import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.http.client.HttpClient;

import com.ibm.docs.viewer.automation.Server;

public class OpenHTMLViewPage extends OpenImageViewPage
{
  private static final Logger logger = Logger.getLogger(OpenHTMLViewPage.class.getName());

  private static final String SPREATSHEET_JOB_ID_PATTERN = "DOC_SCENE.jobId = \"\\w{4,32}\"";

  public OpenHTMLViewPage(HttpClient client, Server server, String fileId, String repositoryId)
  {
    super(client, server, fileId, repositoryId);
  }

  public OpenHTMLViewPage(HttpClient client, Server server, String fileId, String repositoryId, String userAgent, String[] params)
  {
    super(client, server, fileId, repositoryId, userAgent, params);
  }

  protected void postExec(ResponseData data) throws Exception
  {

    /*
     * spreadsheet DOC_SCENE.jobId = "73ae02055b280f9b957c707a31f8eeec"; others DOC_SCENE.jobId =
     * ("b53fcb89081902a023689537eb4524a3"=="null")? null : "b53fcb89081902a023689537eb4524a3";
     */
    if (data.getCode() != 200)
    {
      throw new UnexpectedHTTPCode("Response code is " + data.getCode() + ", expecting 200");
    }

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
    if (temp == null)
    {
      pattern = Pattern.compile(SPREATSHEET_JOB_ID_PATTERN);

      match = pattern.matcher(response);
      while (match.find())
      {
        temp = match.group();
        if (temp != null)
          break;
      }

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
    // version = "1";

  }

}
