package com.ibm.docs.viewer.automation;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.json.java.JSONObject;

/**
 * Servlet implementation class ViewerProxy
 */
public class ViewerProxy extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static final String PARAM_SETTING = "setting";

  private static final String PARAM_QUERY = "query";

  private static final String PARAM_DELETE_CACHE = "delete_cache";

  private static final String PARAM_DELETE_THUMBNAILS = "delete_thumbnails";

  private static final String PARAM_RELATIVE_PATH = "relativePath";

  private static final String PARAM_TYPE = "type";

  private static final String PARAM_CONFIG = "config";

  private static final String STATUS_ERROR = "error";

  private static final String STATUS_SUCC = "succ";

  private static final Logger logger = Logger.getLogger(ViewerProxy.class.getName());

  private static final String CELL_VAR = "cellVar";

  /**
   * @see HttpServlet#HttpServlet()
   */
  public ViewerProxy()
  {
    super();

  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    try
    {
      String type = request.getParameter(PARAM_TYPE);
      if (PARAM_SETTING.equalsIgnoreCase(type))
      {
        response.setContentType("text/x-json");
        JSONObject config = ViewerConfig2.getInstance().getConfig();
        if (config != null)
        {
          config.serialize(response.getWriter(), true);
        }
        else
        {
          logger.log(Level.WARNING, "No configuration for response.");
          putResponse(response, STATUS_ERROR, "Configuration file not found!");
        }
      }
      else if (PARAM_QUERY.equalsIgnoreCase(type))
      {
        String key = request.getParameter(CELL_VAR);
        if (key != null)
        {
          String value = WASConfigHelper.getCellVariable(key);
          response.getWriter().print(value);
        }
      }
      else
      {
        logger.log(Level.WARNING, "Invalid request!");
        putResponse(response, STATUS_SUCC, "Not supported");
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }
    // WASAppHelper.getInstance().startApplication();
  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    String type = request.getParameter(PARAM_TYPE);
    logger.log(Level.INFO, "type= " + type);
    if (PARAM_SETTING.equalsIgnoreCase(type))
    {
      try
      {
        WASAppHelper.getInstance().stopApplication();
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "Failed to stop " + ProxyConfig.getConfig().getAppName() + ". " + e.getMessage(), e);
        putResponse(response, STATUS_ERROR, "Failed to stop application.");
        return;
      }

      String config = request.getParameter(PARAM_CONFIG);
      if (!ViewerConfig2.getInstance().refresh(config))
      {
        putResponse(response, STATUS_ERROR, "Failed to refresh configuration file");
        return;
      }

      try
      {
        WASAppHelper.getInstance().startApplication();
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "Failed to start " + ProxyConfig.getConfig().getAppName() + ". " + e.getMessage(), e);
        putResponse(response, STATUS_ERROR, "Failed to start application.");
        return;
      }
      putResponse(response, STATUS_SUCC, "done");
    }
    else if (PARAM_DELETE_CACHE.equalsIgnoreCase(type))
    {
      String sharedDateRoot = WASConfigHelper.getCellVariable("VIEWER_SHARED_DATA_ROOT");
      String relativePath = request.getParameter(PARAM_RELATIVE_PATH);

      StringBuffer cachePath = new StringBuffer(sharedDateRoot);
      if (!sharedDateRoot.endsWith(File.separator) && !relativePath.startsWith(File.separator))
      {
        cachePath.append(File.separatorChar);
      }
      cachePath.append(relativePath);
      logger.log(Level.INFO, "Cache to be removed: " + cachePath);
      File cacheFile = new File(cachePath.toString());
      if (!cacheFile.exists())
      {
        putResponse(response, STATUS_ERROR, "Can't find the cache: " + cacheFile.getAbsolutePath());
        return;
      }
      else
      {
        removeDirectory(cacheFile);
        putResponse(response, STATUS_SUCC, "done");
      }
    }
    else if (PARAM_DELETE_THUMBNAILS.equalsIgnoreCase(type))
    {
      String relativePath = request.getParameter(PARAM_RELATIVE_PATH);
      StringBuffer thumbnailPath = new StringBuffer(relativePath);
      logger.log(Level.INFO, "Thumbnails to be removed: " + thumbnailPath);
      File thumbnails = new File(thumbnailPath.toString());
      if (!thumbnails.exists())
      {
        putResponse(response, STATUS_ERROR, "Can't find the thumbnails: " + thumbnails.getAbsolutePath());
        return;
      }
      else
      {
        removeDirectory(thumbnails);
        putResponse(response, STATUS_SUCC, "done");
      }
    }
    else
    {
      putResponse(response, STATUS_ERROR, "Not supported");
      return;
    }
  }

  private void putResponse(HttpServletResponse response, String status, String msg) throws IOException
  {
    response.setContentType("application/json");
    JSONObject res = new JSONObject();
    res.put(status, msg);

    res.serialize(response.getWriter(), true);
  }

  public static void cleanDirectory(File dir)
  {
    if (!dir.exists())
    {
      return;
    }

    File[] files = dir.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.isDirectory())
      {
        cleanDirectory(f);
        f.delete();
      }
      else
      {
        f.delete();
      }
    }
  }

  public static void removeDirectory(File dir)
  {
    cleanDirectory(dir);
    dir.delete();
  }

}
