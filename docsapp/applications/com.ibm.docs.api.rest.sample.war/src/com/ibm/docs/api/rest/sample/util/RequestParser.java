package com.ibm.docs.api.rest.sample.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

public class RequestParser
{
  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)");
  
  private String docId;
  
  private String type;
  
  public RequestParser(HttpServletRequest request)
  {
    String path = request.getPathInfo();
    
    if (path == null)
    {
      path = "";
    }
    else if (path.endsWith("/"))
    {
      while (path.endsWith("/") && path.length() > 1)
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    
    Matcher matcher = pathPattern.matcher(path);
    Matcher result = matcher.matches() ? matcher : null;
    if (result != null)
    {
      docId = result.group(1);
      type = result.group(2);
    }
  }
  
  public String getDocId()
  {
    return docId;
  }
  
  public String getType()
  {
    return type;
  }

}
