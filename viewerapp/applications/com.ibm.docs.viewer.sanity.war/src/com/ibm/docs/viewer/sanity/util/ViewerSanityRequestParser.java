/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.sanity.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

/**
 * @author linfeng_li
 * 
 */
public class ViewerSanityRequestParser
{
  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)");

  private String docId;

  private String type;

  public ViewerSanityRequestParser(HttpServletRequest request)
  {
    String pathInfo = request.getPathInfo();
    if (pathInfo == null)
    {
      pathInfo = "";
    }
    else if (pathInfo.endsWith("/"))
    {
      while (pathInfo.endsWith("/") && pathInfo.length() > 1)
      {
        pathInfo = pathInfo.substring(0, pathInfo.length() - 1);
      }
    }
    Matcher matcher = pathPattern.matcher(pathInfo);
    if (!matcher.matches())
    {
      matcher = null;
    }
    if (matcher != null)
    {
      this.docId = matcher.group(1);
      this.type = matcher.group(2);
    }
  }

  public String getDocId()
  {
    return this.docId;
  }

  public String getType()
  {
    return this.type;
  }

}
