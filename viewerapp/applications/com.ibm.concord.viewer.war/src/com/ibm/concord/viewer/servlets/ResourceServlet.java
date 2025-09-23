/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.viewer.servlets;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.BooleanUtils;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;

public class ResourceServlet extends HttpServlet
{
  private static final Logger LOG = Logger.getLogger(ResourceServlet.class.getName());

  private static final long serialVersionUID = 3160051964850645058L;

  private static final String sharedWebResources = "webresource";

  private boolean isdebug = false;

  private String encoding = null;

  private static Map<String, String> mimeTypes;

  private static Map<String, byte[]> rescache;

  static
  {
    rescache = new HashMap<String, byte[]>();
    mimeTypes = new HashMap<String, String>();
  }

  public void init() throws ServletException
  {
    encoding = getInitParameter("encoding");
    if (encoding == null)
      encoding = "utf-8";
    isdebug = BooleanUtils.toBoolean(getInitParameter("isdebug"));
    LOG.log(Level.INFO, "Resource Servlet has been well initalized and static web resources can also be found on NFS server: "
        + getFileRoot());

    mimeTypes.put("js", "application/javascript"); // test/javascript is no long used by html 5
    mimeTypes.put("json", "application/json");
    mimeTypes.put("css", "text/css");
    mimeTypes.put("ico", "image/x-icon");
    mimeTypes.put("gif", "image/gif");
    mimeTypes.put("jpg", "image/jpeg");
    mimeTypes.put("jpeg", "image/jpeg");
    mimeTypes.put("jpe", "image/jpeg");
    mimeTypes.put("png", "image/png");
    mimeTypes.put("html", "text/html");
    mimeTypes.put("htm", "text/html");
    mimeTypes.put("xml", "text/xml");
  }

  public void destroy()
  {
    super.destroy();
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.log(Level.FINEST, "Request for web resource: " + request.getServletPath() + request.getPathInfo());
    Resource webresource = this.createResource(request);
    if (webresource == null)
    {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    if (checkcache(request, webresource.getLastModified()))
    {
      // If it is in cache,just return HTTP status code 304
      response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
      return;
    }

    byte bytes[] = null;
    String resourcePath = webresource.getResourcePath();
    if (!isdebug && rescache.containsKey(webresource.getResourcePath()))
    {
      bytes = (byte[]) rescache.get(resourcePath);
      if (bytes == null)
      {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    else
    {
      bytes = webresource.getData();
    }

    if (!isdebug)
    {
      if (bytes != null)
      {
        response.setDateHeader("Last-Modified", webresource.getLastModified());
        response.setHeader("ETag", Long.toString(webresource.getLastModified()));
      }
      synchronized (rescache)
      {
        rescache.put(resourcePath, bytes);
      }
    }

    if (bytes != null)
    {
      response.setContentLength(bytes.length);
      if (webresource.getMimeType() != null)
      {
        response.setContentType(webresource.getMimeType());
      }
      try
      {
        response.getOutputStream().write(bytes);
        return;
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Failed to write the resource to httpserveletresponse output stream.", e);
      }
    }
    response.sendError(HttpServletResponse.SC_NOT_FOUND);
    return;
  }

  private static String getFileRoot()
  {
    return ViewerConfig.getInstance().getSharedDataRoot() + "/" + sharedWebResources;
  }

  private static boolean isWebResourcesExisted(String timeStamp)
  {
    File stampFile = new File(getFileRoot() + "/" + timeStamp);
    return NFSFileUtil.nfs_assertExistsDirectory(stampFile, NFSFileUtil.NFS_RETRY_SECONDS);
  }

  /**
   * To read data from file url resource to byte array
   * 
   * @param url
   * @return bytes
   * @throws IOException
   */
  private byte[] getResourceBytes(URLConnection url) throws IOException
  {
    InputStream in = null;
    ByteArrayOutputStream outStream = null;
    IOException recordE = null;
    try
    {
      in = url.getInputStream();
      outStream = new ByteArrayOutputStream();
      byte[] buffer = new byte[1024];
      int len = 0;
      while ((len = in.read(buffer)) != -1)
      {
        outStream.write(buffer, 0, len);
      }
      return outStream.toByteArray();
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, e.getMessage());
      recordE = e;
    }
    finally
    {
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Failed close the inputstream" + e.getMessage());
        }
      }
      if (outStream != null)
      {
        try
        {
          outStream.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Failed close the ByteArray OutputStream" + e.getMessage());
        }
      }
    }
    throw recordE;
  }

  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    doGet(req, resp);
  }

  /**
   * To create an instance of Resource
   * 
   * @param request
   * @return
   */
  private Resource createResource(HttpServletRequest request)
  {
    String theServletPath = request.getServletPath() + request.getPathInfo();
    String buildNumber = theServletPath.split("/")[2];
    int index = theServletPath.indexOf(buildNumber);
    String filepath = theServletPath.substring(index - 1);
    int extPos = theServletPath.lastIndexOf(".");
    String extension = (extPos != -1) ? theServletPath.substring(extPos + 1) : "";
    boolean isDevelopmentEnv = "local build".equals(ViewerUtil.getBuildNumber());
    boolean isLocal = ViewerUtil.getBuildNumber().equals(buildNumber);
    boolean isCurrentDeployedBuild = (isLocal || isDevelopmentEnv);
    if (isDevelopmentEnv)
    {
      theServletPath = filepath; // for development environment, "/static" will be removed.
    }

    Resource webresource = new Resource(theServletPath);
    String resourcePath = webresource.getResourcePath();
    webresource.setMimeType(mimeTypes.get(extension));

    try
    {
      if (isCurrentDeployedBuild)
      {
        URL resource = ResourceServlet.class.getResource(resourcePath);
        if (resource != null)
        {
          String fileResPath = URLDecoder.decode(resource.getFile(), "utf-8");
          File file = new File(fileResPath);
          if (file.isFile())
          {
            long lastModified = file.lastModified();
            webresource.setLastModified(lastModified);
            LOG.log(Level.FINEST, "The web resource from local server is " + resourcePath + " and the last modified time is " + lastModified);
          }
          else
          {
            LOG.log(Level.SEVERE, "Failed to get the last modified time from local ViewerNext server for - " + resourcePath);
            return null;
          }
          // check whether the data has been cached?
          if (isdebug || !rescache.containsKey(resourcePath))
          {
            URLConnection urlConnection = resource.openConnection();
            try
            {
              byte[] bytes = getResourceBytes(urlConnection);
              webresource.setData(bytes);
              LOG.log(Level.FINEST, "Obtained web resource from local ViewerNext server for - " + resourcePath);
            }
            catch (IOException e)
            {
              LOG.log(Level.SEVERE, "Failed to obtain web resource from local ViewerNext server for - " + resourcePath, e);
              return null;
            }
          }
        }
        else
        {
          LOG.log(Level.SEVERE, "Failed to obtain web resource's lastModified and data from local ViewerNext server for - " + resourcePath);
          return null;
        }
      }
      else
      {
        if (!isWebResourcesExisted(buildNumber))
        {
          LOG.log(Level.SEVERE, "Multi-active static web resources do not exist on NFS server.");
          return null;
        }
        String nfsfilepath = getFileRoot() + filepath;
        File file = new File(nfsfilepath);
        if (file.isFile())
        {
          long lastModified = file.lastModified();
          webresource.setLastModified(lastModified);
          LOG.log(Level.FINEST, "The web resource from NFS server is " + nfsfilepath + " and the last modified time is " + lastModified);
          if (isdebug || !rescache.containsKey(resourcePath))
          {
            try
            {
              byte[] bytes = NFSFileUtil.nfs_getFileBytes(file, NFSFileUtil.NFS_RETRY_SECONDS);
              webresource.setData(bytes);
              LOG.log(Level.FINEST, "Obtained web resource from NFS server for - " + nfsfilepath);
            }
            catch (IOException e)
            {
              LOG.log(Level.SEVERE, "Failed to obtain web resource from NFS server for - " + nfsfilepath, e);
              return null;
            }
          }
        }
        else
        {
          LOG.log(Level.SEVERE, "Failed to obtain web resource's lastModified and data from NFS server for - " + nfsfilepath);
          return null;
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happened for - " + resourcePath, e);
      return null;
    }

    return webresource;
  }

  /**
   * To know whether to get the file again
   * 
   * @param req
   * @return
   */
  private boolean checkcache(HttpServletRequest req, long FileModified)
  {
    if (isdebug)
      return false;

    long ModifiedSince = -1L;
    try
    {
      ModifiedSince = req.getDateHeader("If-Modified-Since");
    }
    catch (IllegalArgumentException iae)
    {
      ModifiedSince = -1L;
    }

    long systemTime = System.currentTimeMillis();
    if (ModifiedSince != -1L)
    {
      if (ModifiedSince / 1000L == FileModified / 1000L)
      {
        return true; // return 403
      }
      if ((systemTime >= ModifiedSince) && (ModifiedSince > FileModified))
      {
        return true; // return 403
      }
      if (systemTime < ModifiedSince)
      {
        LOG.log(Level.FINEST, "The IfModifiedSince date is later than the server's current time so it is invalid, ignore.");
      }
    }
    return false;
  }

  private class Resource
  {
    private String mimeType;

    // last modified time stamp
    private long lastModified;

    // resource path
    private String resourcePath;

    // resource content
    private byte[] data;

    public Resource(String resourcePath)
    {
      this.resourcePath = resourcePath;
    }

    public long getLastModified()
    {
      return lastModified;
    }

    public void setLastModified(long lastModified)
    {
      this.lastModified = lastModified;
    }

    public String getResourcePath()
    {
      return resourcePath;
    }

    public byte[] getData()
    {
      return data;
    }

    public void setData(byte[] data)
    {
      this.data = data;
    }

    public String getMimeType()
    {
      return mimeType;
    }

    public void setMimeType(String mimeType)
    {
      this.mimeType = mimeType;
    }

  }
}
