package com.ibm.concord.viewer.filters;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Logger;
import java.util.zip.GZIPOutputStream;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.filters.helper.GZipWrapperHelper;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONObject;

public class GZipFilter implements Filter
{

  private static final Logger LOG = Logger.getLogger(GZipFilter.class.getName());
  
  private JSONObject httpParams;
  
  private String[] types ;
  
  public void destroy()
  {
    httpParams = null;
  }

  /**
   * @param request
   * @return
   */
  private boolean isGZipEncoding(HttpServletRequest request)
  {
    boolean flag = false;
    String encoding = request.getHeader("Accept-Encoding");
    String reqUri = request.getRequestURI();
    boolean exclude = false;
    for (String str : types)
    {
      if (reqUri.toLowerCase().endsWith("." + str.trim().toLowerCase()))
      {
        exclude = true;
        break;
      }
    }
    if (encoding != null && encoding.indexOf("gzip") != -1 && !exclude)//skip png gzip
    {
      flag = true;
    }
    return flag;
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletResponse resp = (HttpServletResponse) response;
    HttpServletRequest req = (HttpServletRequest) request;
    try
    {
      boolean isGzip = true; // default value to true
      String gzip_optstr = (String) httpParams.get("gzip");
      if (gzip_optstr != null) {
        isGzip = Boolean.valueOf(gzip_optstr);
      }
      if (isGZipEncoding(req) && isGzip)
      {
        GZipWrapperHelper wrapper = new GZipWrapperHelper(resp);
        chain.doFilter(request, wrapper);
        byte[] responseData = wrapper.getResponseData();
        if(responseData.length==0)
        {
          //redirect page should not be gzip, this is for oauth redirect.
          return;
        }
        byte[] gzipData = gzip(responseData);
        resp.addHeader("Content-Encoding", "gzip");
        resp.setContentLength(gzipData.length);
        ServletOutputStream output = response.getOutputStream();
        output.write(gzipData);
        output.flush();
      }
      else
      {
        chain.doFilter(request, response);
      }
    }
    catch (FileNotFoundException e)
    {
      
    }

  }

  public void init(FilterConfig arg0) throws ServletException
  {
    httpParams = Platform.getViewerConfig().getSubConfig("http-params");
    String exTypeStr = (String) httpParams.get("exclude");
    if (exTypeStr != null) {
      exTypeStr.trim();
    } else {
      exTypeStr = "pdf|jpg|jpeg|png|gif";  // default value
    }
    types = new String[0];
    if (exTypeStr.length() > 0)
    {
      types = exTypeStr.split("\\|");
    }
  }

  private byte[] gzip(byte[] data)
  {
    ByteArrayOutputStream byteOutput = new ByteArrayOutputStream(10240);
    GZIPOutputStream output = null;
    try
    {
      output = new GZIPOutputStream(byteOutput);
      output.write(data);
    }
    catch (IOException e)
    {
    }
    finally
    {
      try
      {
        output.close();
      }
      catch (IOException e)
      {
      }
    }
    return byteOutput.toByteArray();
  }
}