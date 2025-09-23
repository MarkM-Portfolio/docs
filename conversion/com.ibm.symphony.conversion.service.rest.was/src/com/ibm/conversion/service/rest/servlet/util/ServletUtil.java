/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet.util;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.ibm.conversion.service.rest.servlet.Constants;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.impl.ConversionConfig;

public class ServletUtil
{
  private static Map<String, String> sharedDataRootMap = new HashMap<String, String>();

  private static final Logger LOG = Logger.getLogger(ServletUtil.class.getName());

  private static final int LOG_ID = 1260;// 1260-1269

  private static JSONObject buildInfo;

  private static final String BUILD = "build_timestamp";

  private static final String VERSION = "build_version";

  private static final String PRODUCT_NAME = "product_name";

  private static final String IFIX_VERSION = "ifix_version";

  private static final String DESC = "build_description";

  private static final String PATCH_BASE_BUILD = "patch_base_build";

  static
  {
    buildInfo = ConversionConfig.getInstance().getSubConfig("build-info");
    LOG.log(Level.INFO, "IBMConversion biuld info:" + buildInfo.toString());
  }

  /**
   * Get the shared root data path
   *
   * @param sourceFilePath
   *          input the source file path
   * @return return the shared data root path from the given source file path, only get once from WAS var
   */
  private static String getSharedDataRoot(String sourceFilePath)
  {
    String sharedDataRoot = "";
    if (sourceFilePath.startsWith("$"))
    {
      int start = sourceFilePath.indexOf("{");
      int end = sourceFilePath.indexOf("}", start);
      String wasVariableName = sourceFilePath.substring(start + 1, end);
      if (!sharedDataRootMap.containsKey(wasVariableName))
      {
        sharedDataRoot = WASConfigHelper.getCellVariable(wasVariableName);
        if (sharedDataRoot != null)
        {
          if (File.separator.equals("/"))
          {
            sharedDataRoot = sharedDataRoot.replace('\\', '/');
          }
          else
          {
            sharedDataRoot = sharedDataRoot.replace('/', '\\');
          }

          if (sharedDataRoot.endsWith(File.separator))
          {
            sharedDataRoot = sharedDataRoot.substring(0, sharedDataRoot.length() - 1);
          }
          sharedDataRootMap.put(wasVariableName, sharedDataRoot);
        }
        else
        {
          ConversionLogger.log(LOG, Level.INFO, LOG_ID, "WAS variable " + wasVariableName + " is not configured.");
          sharedDataRoot = "";
        }
      }
      sharedDataRoot = sharedDataRootMap.get(wasVariableName);
    }
    else
    // input is absolute path, to match the prefix in shared data root map
    {
      Set<Entry<String, String>> entrySet = sharedDataRootMap.entrySet();
      Iterator<Entry<String, String>> it = entrySet.iterator();
      while (it.hasNext())
      {
        String value = it.next().getValue();
        if (sourceFilePath.startsWith(value))
        {
          sharedDataRoot = value;
          break;
        }
      }
    }
    return sharedDataRoot;
  }

  /**
   * Serialize ConversionWarnings to response
   *
   * @param response
   * @param values
   * @throws IOException
   */
  public static void writeWarnings(HttpServletResponse response, ArrayList<ConversionWarning> values) throws IOException
  {
    JSONObject warnings = new JSONObject();
    JSONArray arr = new JSONArray();
    if (values != null && values.size() > 0)
    {
      for (int i = 0; i < values.size(); i++)
      {
        ConversionWarning e = values.get(i);
        JSONObject obj = new JSONObject();
        obj.put("id", e.getFetureID());
        obj.put("isPreserved", e.isPreserved());
        // don't return to client currently
        // obj.put("location", e.getLocation());
        obj.put("description", e.getDescription());
        arr.add(obj);
      }
    }
    warnings.put("errCodes", arr);
    response.getOutputStream().print(warnings.serialize());
  }

  /**
   * Parse multipart request
   *
   * @param request
   * @param incomingFolder
   * @param parameters
   * @throws Exception
   */
  public static File parseMultipart(HttpServletRequest request, File incomingFolder, Map parameters) throws Exception
  {
    DiskFileItemFactory factory = new DiskFileItemFactory(1024 * 1024, incomingFolder);
    ServletFileUpload upload = new ServletFileUpload(factory);
    List<?> items = upload.parseRequest(request);
    Iterator iter = items.iterator();
    boolean hasFile = false;
    File result = null;
    while (iter.hasNext())
    {
      FileItem item = (FileItem) iter.next();
      if (item.isFormField())
      {
        String name = item.getFieldName();
        String value = item.getString();
        parameters.put(name, value);
      }
      else
      {
        if (!hasFile)
        {
          result = new File(incomingFolder, FileUtil.generateFileName());
          item.write(result);
          hasFile = true;
        }
        else
        {
          throw new Exception("More than one file.");
        }
      }
    }
    if (hasFile && result != null)
    {
      return result;
    }
    else
    {
      throw new Exception("Can't parse file.");
    }
  }

  /**
   * Transform the give source from relative path to absolute path or vice versa
   *
   * @param sourceFilePath
   *          - the given source file path
   * @return target file path after transformation
   */
  public static String transformPath(String sourceFilePath)
  {
    String targetFilePath = "";
    if (File.separator.equals("/"))
    {
      sourceFilePath = sourceFilePath.replace('\\', '/');
    }
    else
    {
      sourceFilePath = sourceFilePath.replace('/', '\\');
    }

    if (sourceFilePath.startsWith("$"))// the path is relative path with the prefix was var like ${DOCS_SHARED_DATA_ROOT}
    {
      String sharedDataRoot = getSharedDataRoot(sourceFilePath);
      targetFilePath = sourceFilePath.substring(sourceFilePath.indexOf("}") + 1);
      targetFilePath = sharedDataRoot + targetFilePath;
    }
    else
    // the path is absolute path, need to transform to relative path, or keep unchanged
    {
      if (!sharedDataRootMap.isEmpty())// need to transform to relative path while return conversion result path
      {
        targetFilePath = sourceFilePath.substring(getSharedDataRoot(sourceFilePath).length());
      }
      else
      {
        targetFilePath = sourceFilePath;
      }
    }
    return targetFilePath;
  }

  public static String getFirstSharedDataRoot()
  {
    if (sharedDataRootMap.isEmpty())
      return null;

    Set<Entry<String, String>> entrySet = sharedDataRootMap.entrySet();
    Iterator<Entry<String, String>> it = entrySet.iterator();
    return it.next().getValue();
  }

  public static boolean isRunnableAvailable(IFormatConverter converter,String sourceMIMEType, String targetMIMEType, String targetFolderPath)
  {
    long beforeDetect = System.currentTimeMillis();

    Boolean available = converter.isRunnableAvailable();
    /** add the isRunnableAvailable method in IFormatConverter interface so here is no need to use reflect to call this method.
    Method method = null;
    try
    {
      method = converter.getClass().getMethod("isRunnableAvailable", new Class[] {});
    }
    catch (SecurityException e)
    {
      ConversionLogger.log(LOG, Level.WARNING, "SecurityException exception when getting method for detect request, targetFolderPath: "
          + targetFolderPath + " " + e.getMessage());
    }
    catch (NoSuchMethodException e)
    {
      ConversionLogger.log(LOG, Level.WARNING, "NoSuchMethodException exception when getting method for detect request, targetFolderPath: "
          + targetFolderPath + " " + e.getMessage());
    }

    if (method != null)
    {
      try
      {
        available = (Boolean) method.invoke(converter);
      }
      catch (IllegalArgumentException e)
      {
        ConversionLogger.log(LOG, Level.WARNING, "IllegalArgumentException exception when invoking method for detect request, targetFolderPath: "
            + targetFolderPath + " " + e.getMessage());
      }
      catch (IllegalAccessException e)
      {
        ConversionLogger.log(LOG, Level.WARNING, "IllegalAccessException exception when invoking method for detect request, targetFolderPath: "
            + targetFolderPath + " " + e.getMessage());
      }
      catch (InvocationTargetException e)
      {
        ConversionLogger.log(LOG, Level.WARNING, "InvocationTargetException exception when invoking method for detect request, targetFolderPath: "
            + targetFolderPath + " " + e.getMessage());
      }*/

      if (!available)
      {
        try
        {
          // try to use the sleep to get F5 change its balancing policy
          Thread.sleep(1000);
        }
        catch (Exception e)
        {
          ConversionLogger.log(LOG, Level.WARNING, e.getMessage());
        }
        long endDetect = System.currentTimeMillis();
        if ((endDetect - beforeDetect) > 9 * 1000)
        {
          ConversionLogger.log(LOG, Level.WARNING, "Took more than 9s to finish detecting, targetFolderPath" + targetFolderPath);
        }
      }
//    }
    return available;
  }

  /**
   * @param param the converted object
   * @return convert the Map object to JSONObject
   */
  public static JSONObject map2JSONObject(Map param)
  {
    JSONObject obj = null;
    if (param !=null)
    {
      obj = new JSONObject();
      Set<Map.Entry<?, ?>> entries = param.entrySet();
      for (Map.Entry<?, ?> entry : entries)
      {
        Object value = entry.getValue();
        if (value != null)
        {
          if (value instanceof Map)
            value = ServletUtil.map2JSONObject((Map)value);
        }
        obj.put(entry.getKey(), value);
      }
    }
    return obj;

  }

  /**
   * @param param the converted object
   * @return if this request is from viewer
   */
  public static boolean isViewerWork(String targetMIMEType)
  {
    if (targetMIMEType.equals(Constants.PNG) || targetMIMEType.equals(Constants.GIF)
        || targetMIMEType.equals(Constants.JPEG))
      return true;
    else
      return false;
  }

  public static String getVersion()
  {
    return (String) buildInfo.get(VERSION);
  }

  public static String getBuildNumber()
  {
    return (String) buildInfo.get(BUILD);
  }

  public static String getProductName()
  {
    return (String) buildInfo.get(PRODUCT_NAME);
  }

  public static String getBuildDescription()
  {
    return (String) buildInfo.get(DESC);
  }

  public static long getIfixVersion()
  {
     Boolean keyExists = buildInfo.containsKey(IFIX_VERSION);
     return keyExists? (Long) buildInfo.get(IFIX_VERSION) : -1;
  }

  public static String getPatchBaseBuild()
  {
    Boolean keyExists = buildInfo.containsKey(PATCH_BASE_BUILD);
    return keyExists? (String) buildInfo.get(PATCH_BASE_BUILD) : "";
  }
}
