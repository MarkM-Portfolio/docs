/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.web.filters;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.logging.Logger;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HttpParamsFilter implements Filter
{
  private static final Logger LOG = Logger.getLogger(HttpParamsFilter.class.getName());

  private static final String DEFAULT_STATIC_CACHE_CONTROL = "public, max-age=31536000";

  private static final String DEFAULT_STATIC_VARY = "Accept-Encoding";

  public static final MimetypesFileTypeMap MIME_TYPE_MAP = new MimetypesFileTypeMap();

  static
  {
    try
    {
      InputStream is = HttpParamsFilter.class.getResourceAsStream("/META-INF/concord.mime.types"); //$NON-NLS-1$
      BufferedReader reader = null;
      if (is != null)
      {
        try
        {
          reader = new BufferedReader(new InputStreamReader(is));
          String line;
          while ((line = reader.readLine()) != null)
          {
            int hashPos = line.indexOf('#');
            if (hashPos != -1)
            {
              line = line.substring(0, hashPos);
            }
            if (line.trim().length() > 0)
              MIME_TYPE_MAP.addMimeTypes(line);
          }
        }
        finally
        {
          if (reader != null)
          {
            reader.close();
          }
        }
      }
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
  }

  public void destroy()
  {

  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    String cacheControl = DEFAULT_STATIC_CACHE_CONTROL;

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    String requestUrl = httpRequest.getRequestURI();
    String urlList[] = requestUrl.split("/");
    String fileName = urlList[urlList.length - 1];
    String mimeType = MIME_TYPE_MAP.getContentType(fileName);
    httpResponse.setContentType(mimeType);
    httpResponse.setHeader("Cache-Control", cacheControl);
    httpResponse.setHeader("Vary", DEFAULT_STATIC_VARY);
    try
    {
      chain.doFilter(request, response);
    }
    catch (FileNotFoundException e)
    {
      httpResponse.sendError(HttpServletResponse.SC_NOT_FOUND);
    }
    catch (Exception e)
    {
      httpResponse.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

  public void init(FilterConfig arg0) throws ServletException
  {

  }

}
