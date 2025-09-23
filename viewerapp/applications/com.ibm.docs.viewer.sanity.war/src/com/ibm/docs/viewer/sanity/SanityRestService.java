/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.sanity;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response;

import org.apache.commons.httpclient.HttpStatus;

import com.ibm.docs.viewer.sanity.util.MimeTypeUtil;
import com.ibm.docs.viewer.sanity.util.SanityFileUtil;
import com.ibm.docs.viewer.sanity.util.ViewerSanityRequestParser;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author linfeng_li
 * 
 */
public class SanityRestService extends HttpServlet
{

  /**
   * 
   */
  private static final long serialVersionUID = -8219203655995021004L;

  private static final Logger LOG = Logger.getLogger(SanityRestService.class.getName());

  private List<FunctionHandlerEntry> funcHandlers = null;

  public static final Object obj = new Object();

  public void init() throws ServletException
  {
    this.funcHandlers = new ArrayList<FunctionHandlerEntry>();
    this.funcHandlers.add(new FunctionHandlerEntry("/([^/]+)/meta", "Meta"));
    this.funcHandlers.add(new FunctionHandlerEntry("/([^/]+)/content", "DocumentContent"));
    this.funcHandlers.add(new FunctionHandlerEntry("/([^/]+)/thumbnail", "Thumbnail"));
    this.funcHandlers.add(new FunctionHandlerEntry("/profiles", "Profiles"));
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
  {
    LOG.entering(this.getClass().getName(), "doGet", req.getPathInfo());
    try
    {
      String func = getHandlerEntry(req).getFunc();
      for (Method method : getClass().getMethods())
      {
        if (generateFuncName(req, func).toUpperCase().equals(method.getName().toUpperCase()))
        {
          method.invoke(this, new Object[] { req, resp });
          return;
        }
      }
    }
    catch (SecurityException e)
    {
      LOG.log(Level.SEVERE, "SecurityException occur .", e);
      try
      {
        resp.sendError(HttpStatus.SC_BAD_REQUEST);
      }
      catch (IOException e1)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e1);
      }
    }
    catch (NullPointerException e2)
    {
      LOG.log(Level.SEVERE, "NullPointerException occur .", e2);
      try
      {
        resp.sendError(HttpStatus.SC_NO_CONTENT);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    catch (Exception e3)
    {
      LOG.log(Level.SEVERE, "Exception occur .", e3);
      try
      {
        resp.sendError(HttpStatus.SC_NOT_FOUND);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    LOG.exiting(this.getClass().getName(), "doGet");
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    LOG.entering(this.getClass().getName(), "doPost", req.getPathInfo());
    try
    {
      String func = getHandlerEntry(req).getFunc();
      for (Method method : getClass().getMethods())
      {
        if (generateFuncName(req, func).toUpperCase().equals(method.getName().toUpperCase()))
        {
          method.invoke(this, new Object[] { req, resp });
          return;
        }
      }
    }
    catch (SecurityException e)
    {
      LOG.log(Level.SEVERE, "SecurityException occur .", e);
      try
      {
        resp.sendError(HttpStatus.SC_BAD_REQUEST);
      }
      catch (IOException e1)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e1);
      }
    }
    catch (NullPointerException e2)
    {
      LOG.log(Level.SEVERE, "NullPointerException occur .", e2);
      try
      {
        resp.sendError(HttpStatus.SC_NO_CONTENT);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    catch (Exception e3)
    {
      LOG.log(Level.SEVERE, "Exception occur .", e3);
      try
      {
        resp.sendError(HttpStatus.SC_NOT_FOUND);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    LOG.exiting(this.getClass().getName(), "doPost");
  }

  private FunctionHandlerEntry getHandlerEntry(HttpServletRequest httpServletRequest)
  {
    LOG.entering(this.getClass().getName(), "FunctionHandlerEntry");
    String str;
    String pathInfo = httpServletRequest.getPathInfo();
    if (pathInfo == null)
    {
      str = "";
    }
    else
    {
      if (pathInfo.endsWith("/"))
      {
        while (pathInfo.endsWith("/") && pathInfo.length() > 1)
        {
          pathInfo = pathInfo.substring(0, pathInfo.length() - 1);
        }
      }
      str = pathInfo;
    }
    FunctionHandlerEntry funcHandlerEntry = null;
    for (FunctionHandlerEntry functionHandlerEntry : this.funcHandlers)
    {
      if (functionHandlerEntry.match(str) != null)
      {
        funcHandlerEntry = functionHandlerEntry;
        break;
      }
    }
    LOG.exiting(this.getClass().getName(), "doPost", "funcHandlerEntry : " + funcHandlerEntry.toString());
    return funcHandlerEntry;
  }

  private String generateFuncName(HttpServletRequest httpServletRequest, String str)
  {
    LOG.entering(this.getClass().getName(), "generateFuncName");
    String method = httpServletRequest.getMethod();
    if (method.equals("GET"))
    {
      return "get" + str;
    }
    if (method.equals("POST"))
    {
      return "post" + str;
    }
    LOG.exiting(this.getClass().getName(), "generateFuncName", "str : " + str);
    return str;
  }

  public void getProfiles(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException
  {
    LOG.entering(this.getClass().getName(), "getProfiles");
    ServletContext servletContext = httpServletRequest.getSession().getServletContext();
    String parameter = httpServletRequest.getParameter("userid");
    String realPath = servletContext.getRealPath("/WEB-INF/samples/");
    String profilePath = realPath + "profiles.json";
    JSONObject meta = SanityFileUtil.getJson(profilePath);

    if (meta != null)
    {
      JSONArray jSONArray = (JSONArray) meta.get("items");
      if (parameter != null)
      {
        for (int i = 0; i < jSONArray.size(); i++)
        {
          JSONObject jSONObject = (JSONObject) jSONArray.get(i);
          if (parameter.equalsIgnoreCase((String) jSONObject.get("id")))
          {
            httpServletResponse.setContentType("text/x-json");
            httpServletResponse.setCharacterEncoding("UTF-8");
            jSONObject.serialize(httpServletResponse.getWriter());
            return;
          }
        }
      }
      else
      {
        meta = (JSONObject) jSONArray.get(0);
        httpServletResponse.setContentType("text/x-json");
        httpServletResponse.setCharacterEncoding("UTF-8");
        meta.serialize(httpServletResponse.getWriter());
        return;
      }
    }
    httpServletResponse.sendError(HttpStatus.SC_NO_CONTENT);
    LOG.exiting(this.getClass().getName(), "getProfiles");
  }

  public void getDocumentContent(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    LOG.entering(this.getClass().getName(), "getDocumentContent");
    InputStream is = null;
    BufferedInputStream bis = null;
    ServletOutputStream out = null;
    String docId = new ViewerSanityRequestParser(request).getDocId();
    String realPath = request.getSession().getServletContext().getRealPath("/WEB-INF/samples/" + docId);
    String contentType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(realPath);
    File file = new File(realPath);
    if (file.exists())
    {
      response.setContentType(contentType);
      response.setHeader("Content-disposition", "filename=" + docId);
      response.setStatus(Response.Status.OK.getStatusCode());
      try
      {
        is = new FileInputStream(file);
        bis = new BufferedInputStream(is);
        out = response.getOutputStream();
        int numRead = -1;
        byte[] data = new byte[8192];
        while ((numRead = bis.read(data)) > 0)
        {
          out.write(data, 0, numRead);
        }
        out.flush();
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Exception occur .", e);
      }
      finally
      {
        if (is != null)
          is.close();
        if (bis != null)
          bis.close();
        if (out != null)
          out.close();
      }
    }
    else
    {
      response.sendError(HttpServletResponse.SC_NO_CONTENT);
    }

    LOG.exiting(this.getClass().getName(), "getDocumentContent");
  }

  public void getMeta(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    LOG.entering(this.getClass().getName(), "getMeta");
    String realPath = request.getSession().getServletContext()
        .getRealPath("/WEB-INF/samples/" + new ViewerSanityRequestParser(request).getDocId());
    String meatPath = realPath + ".meta";
    JSONObject meta = SanityFileUtil.getJson(meatPath);
    if (meta != null)
    {
      response.setContentType("text/x-json");
      response.setCharacterEncoding("UTF-8");
      meta.serialize(response.getWriter());
      return;
    }
    response.sendError(HttpServletResponse.SC_NO_CONTENT);
    LOG.exiting(this.getClass().getName(), "getDocumentContent");
  }

  public void postThumbnail(HttpServletRequest request, HttpServletResponse response)
  {
    LOG.entering(this.getClass().getName(), "postThumbnail");
    synchronized (SanityRestService.obj)
    {
      LOG.log(Level.FINE, String.format("Thumbnails call back by url %s .", request.getPathInfo()));
      SanityRestService.obj.notify();
    }
    LOG.exiting(this.getClass().getName(), "postThumbnail");
  }

  public void destroy()
  {
    this.funcHandlers = null;
  }

  private class FunctionHandlerEntry
  {
    private String function;

    private Pattern pathPattern;

    public FunctionHandlerEntry(String str, String func)
    {
      this.pathPattern = Pattern.compile(str);
      this.function = func;
    }

    public Matcher match(String str)
    {
      Matcher matcher = this.pathPattern.matcher(str);
      if (matcher.matches())
      {
        return matcher;
      }
      return null;
    }

    public String getFunc()
    {
      return this.function;
    }

    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString()
    {
      return "FunctionHandlerEntry [function=" + function + ", pathPattern=" + pathPattern + "]";
    }
  }
}
