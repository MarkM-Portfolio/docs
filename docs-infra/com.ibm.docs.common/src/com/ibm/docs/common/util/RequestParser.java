package com.ibm.docs.common.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

/**
 * This parses requests to ConcordDocServlet. This assumes URL pattern is /concord/app/${editorType}/${repoId}/${docUri}/${docContentPath}
 * Where editorType - text | pres | sheet docContentPath - the requested file path, or "edit" for editor page
 */
public class RequestParser
{
  private String editorType;

  private String repoId;

  private String docUri;

  private String docContentPath;

  private String actionType;

  private boolean isDraft;

  private boolean isRootRequest;

  // Pattern to match servlet path (expecting "/app/${editorType}")
  private static final Pattern servletPathPattern = Pattern.compile("/app/(doc)");

  // Pattern to match request path (expecting "/${repoId}/${docUri}/${filePath}")
  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)/([^/]+)(/draft)?/(.+)");

  public RequestParser(HttpServletRequest request)
  {
    Matcher matcher = servletPathPattern.matcher(request.getServletPath());
    Matcher result = matcher.matches() ? matcher : null;
    if (result != null)
    {
      editorType = result.group(1);
    }

    // Use HttpServletRequest.getPathInfo to get a decoded path.
    String path = request.getPathInfo();
    if (path != null)
    {
      matcher = pathPattern.matcher(path);
      result = matcher.matches() ? matcher : null;
      if (result != null)
      {
        repoId = result.group(1);
        docUri = result.group(2);
        actionType = result.group(3);
        isDraft = Boolean.valueOf(result.group(4) != null).booleanValue();
        docContentPath = result.group(5);
      }
    }
    else
    {
      isRootRequest = true;
    }
  }

  public boolean isRootRequest()
  {
    return isRootRequest;
  }

  public String getActionType()
  {
    return actionType;
  }

  public String getEditorType()
  {
    return editorType;
  }

  public String getRepoId()
  {
    return repoId;
  }

  public String getDocUri()
  {
    return docUri;
  }

  public boolean isDraft()
  {
    return isDraft;
  }

  public String getDocContentPath()
  {
    return docContentPath;
  }

}
