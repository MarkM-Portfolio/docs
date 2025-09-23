package com.ibm.docs.viewer.external.util;

import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

public class RequestParser
{
  private String repoId;

  private String docUri;

  private String docContentPath;

  private String docVersion = null;

  private boolean isSupportedMode = false;

  private String mimeType;

  private HashMap<String, Boolean> parameters = new HashMap<String, Boolean>();

  private String viewURL;

  // Pattern to match request path (expecting "/${repoId}/${docUri}/${filePath}")
  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)/?(.+)?");

  private static final Pattern containVersionPattern = Pattern.compile("(^[0-9]+)/(.+)");

  public RequestParser(HttpServletRequest request)
  {
    // Use HttpServletRequest.getPathInfo to get a decoded path.
    Matcher matcher = pathPattern.matcher(request.getPathInfo());
    Matcher result = matcher.matches() ? matcher : null;
    if (result != null)
    {
      String g1 = result.group(1);
      if(g1 != null && (g1.equalsIgnoreCase("thumbnails") || g1.equalsIgnoreCase("docsvr")))
      {
        repoId = result.group(2);
        docUri = result.group(3);
      }
      else
      {
        repoId = result.group(1);
        docUri = result.group(2);
        docContentPath = result.group(3);
        if( docContentPath != null )
        {
          matcher = containVersionPattern.matcher(docContentPath);
          result = matcher.matches() ? matcher : null;
          if (result != null) // contains version
          {
            docVersion = result.group(1);
            docContentPath = result.group(2);
          }
        }
      }
    }
  }

  public String getViewURL()
  {
    return viewURL;
  }

  public String getMimeType()
  {
    return mimeType;
  }

  public String getRepoId()
  {
    return repoId;
  }

  public String getDocUri()
  {
    return docUri;
  }

  public String getDocContentPath()
  {
    return docContentPath;
  }

  public String getDocVersion()
  {
    return docVersion;
  }

  public HashMap<String, Boolean> getParameters()
  {
    return parameters;
  }

  public Boolean isSupportedMode()
  {
    return isSupportedMode;
  }

}
