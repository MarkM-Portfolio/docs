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

package com.ibm.concord.viewer.platform.util;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.platform.encryption.Encryptor;
import com.ibm.concord.viewer.platform.encryption.EncryptorFactory;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.MalformedRequestException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.exception.AccessException;
import com.ibm.concord.viewer.spi.exception.DocumentServiceException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.docs.common.helper.LanguageCookieHelper;
import com.ibm.json.java.JSONObject;

public class ViewerUtil
{

  private static final String MSIE8 = "msie 8.0";

  private static final String MSIE9 = "msie 9.0";

  private static final int PRIMARY_MAX_SLOT = 1024;

  private static final int SECONDARY_MAX_SLOT = 1024;

  public static String[] colors = { "#C7E3E4", "#F9CECE", "#BFE0BD", "#FEF8BF", "#DAC6DD", "#FFE2B6", "#D6D8D2", "#E2E5B0", "#E4D2C2",
      "#BCC5D0",

      "#EAA9A6", "#9CD29A", "#F1DC93", "#C1A8E6", "#DECDB9", "#A9BFE3", "#9EDCD7", "#DCDC96", "#D5B0D1", "#BECDCE", "#FACB96", "#BEDC93",
      "#D1C1CC", "#AABED3", "#F1B798", "#AAD0BD", "#F4B0C3", "#BAC5CF", "#CDCDB5", "#DBC2C2" };

  private static String[] borderColors = { "#759B9F", "#E18284", "#6AA868", "#F8E90B", "#AA6DAE", "#D2BB98", "#8D938F", "#B2C149",
      "#B48C6B", "#6F7B88",

      "#C28D8C", "#80AE81", "#C6B77B", "#9F8DB0", "#B9AB9B", "#8EA0BE", "#85B5B3", "#B5B67E", "#B193AF", "#9FABAC",

      "#CEA97E", "#9EB87C", "#ADA1AA", "#8E9EB0", "#C69880", "#8DAD9F", "#C992A3", "#9AA5AD", "#AAAB98", "#B5A2A3" };

  public static final String DEFAULT_BORDER_COLOR = "#759B9F";

  public static final String USER_ROLE_ADMIN = "viewerAdmin";

  public static final String HEADER_KEY_REPOID = "X-VIEWER-REPOID";

  private static final String BUILD = "build_timestamp";

  private static final String VERSION = "build_version";

  private static final String DESC = "build_description";

  private static final String PRODUCT_NAME = "product_name";

  private static final String IFIX_VERSION = "ifix_version";

  private static final String PATCH_BASE_BUILD = "patch_base_build";

  private static final String YES = "yes";

  private static final String NO = "no";

  // private static JSONObject buildInfo;

  private static Random random;

  private static Map<String, String> colorsMap = new HashMap<String, String>(30);

  private static String STATIC_IMAGE_ROOT_PATH = "";

  private static String STATIC_HTML_ROOT_PATH = "";

  private static final Logger LOG = Logger.getLogger(ViewerUtil.class.getName());

  private static final Map<Integer, Integer> errorCodeMap = new HashMap<Integer, Integer>()
  {
    {
      put(RepositoryAccessException.EC_REPO_NOVIEWPERMISSION, HttpServletResponse.SC_UNAUTHORIZED);
      put(RepositoryAccessException.EC_REPO_NOEDITPERMISSION, HttpServletResponse.SC_UNAUTHORIZED);
      put(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, HttpServletResponse.SC_NOT_FOUND);
      put(RepositoryAccessException.EC_REPO_CANNOT_FILES, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      put(RepositoryAccessException.EC_REPO_OUT_OF_SPACE, HttpServletResponse.SC_BAD_REQUEST);
      put(RepositoryAccessException.EC_REPO_CANNOT_EDIT_LOCKED_DOC, HttpServletResponse.SC_UNAUTHORIZED);
      put(RepositoryAccessException.EC_REPO_UNPUBLISHED_FILE, HttpServletResponse.SC_BAD_REQUEST);

      put(AccessException.EC_DOCUMENT_ENCRYPT, HttpServletResponse.SC_BAD_REQUEST);
      put(ConversionException.EC_CONV_SERVICE_UNAVAILABLE, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      put(ConversionException.EC_CONV_DOC_TOOLARGE, HttpServletResponse.SC_BAD_REQUEST);
      put(ConversionException.EC_CONV_CONVERT_TIMEOUT, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      put(ConversionException.EC_CONV_INVALID_FORMAT, HttpServletResponse.SC_BAD_REQUEST);
      put(ConversionException.EC_CONV_EXT_CONTENT_MISMATCH, HttpServletResponse.SC_BAD_REQUEST);
      put(ConversionException.EC_CONV_UNSUPPORTED_FORMAT, HttpServletResponse.SC_BAD_REQUEST);
      put(UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE, HttpServletResponse.SC_BAD_REQUEST);

      put(ConversionException.EC_CONV_IO_EXCEPTION, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      put(ConversionException.EC_CONV_UNEXPECIFIED_ERROR, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      put(ConversionException.EC_CONV_DOWNSIZE_ERROR, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      put(ConversionException.EC_CONV_SINGLE_PAGE_OVERTIME, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      put(ConversionException.EC_CON_ENCRPTED_ERROR, HttpServletResponse.SC_BAD_REQUEST);
      put(ConversionException.EC_CONV_SYSTEM_BUSY, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      put(ConversionException.EC_CONV_EMPTY_FILE_ERROR, HttpServletResponse.SC_BAD_REQUEST);
      put(ConversionException.EC_CONV_CORRUPTED_FILE_ERROR, HttpServletResponse.SC_BAD_REQUEST);
      put(MalformedRequestException.EC_MALFORMED_INVALID_REQUEST, HttpServletResponse.SC_BAD_REQUEST);

      put(MalformedRequestException.EC_FULLVIEWER_INVALID_REQUEST, HttpServletResponse.SC_NOT_FOUND);
      put(1601, HttpServletResponse.SC_SERVICE_UNAVAILABLE); // CacheDataAccessException.EC_CACHEDATA_ACCESS_ERROR
      put(1602, HttpServletResponse.SC_SERVICE_UNAVAILABLE); // CacheStorageAccessException.EC_CACHESTORAGE_ACCESS_ERROR
      put(DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      put(HttpServletResponse.SC_BAD_REQUEST, HttpServletResponse.SC_BAD_REQUEST);
      put(3333, HttpServletResponse.SC_BAD_REQUEST);
      put(0, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      put(2001, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  };

  static
  {
    random = new Random();
    random.setSeed(System.currentTimeMillis());

    for (int i = 0; i < colors.length; i++)
    {
      colorsMap.put(colors[i], borderColors[i]);
    }
  }

  /**
   * Randomly generates <code>Task</code> id based on the current time.
   *
   * @return taskId
   */
  public static String generateTaskId()
  {
    long rid = System.currentTimeMillis() + random.nextInt();
    return String.valueOf(rid);
  }

  public static String generateProblemId()
  {
    long rid = System.currentTimeMillis() + random.nextInt();
    return String.valueOf(rid);
  }

  public static String getBorderColor(String color)
  {
    return colorsMap.get(color);
  }

  private static JSONObject getBuildInfo()
  {
    JSONObject buildInfo = ViewerConfig.getInstance().getBuildInfo();
    LOG.log(Level.FINE, "Viewer build info:" + (buildInfo == null ? "" : buildInfo.toString()));
    return buildInfo;
  }

  public static void initBuildVersion(String path)
  {
    // buildInfo = ViewerConfig.getInstance().getBuildInfo();
    // LOG.log(Level.FINE, "Viewer build info:" + (buildInfo == null ? "" : buildInfo.toString()));
    JSONObject buildInfo = getBuildInfo();
    if (buildInfo != null && !buildInfo.get(BUILD).equals("local build"))
    {
      STATIC_HTML_ROOT_PATH = "/static/" + buildInfo.get(BUILD);
    }
    else
    {
      STATIC_HTML_ROOT_PATH = "";
    }
    STATIC_IMAGE_ROOT_PATH = Platform.getServletContext().getContextPath() + STATIC_HTML_ROOT_PATH;
  }

  public static String getStaticRootPath()
  {
    return STATIC_IMAGE_ROOT_PATH;
  }

  public static String getHTMLStaticRootPath()
  {
    return STATIC_HTML_ROOT_PATH.replace("/viewer", "") + "/js/html";
  }

  public static String getBuildVersion()
  {
    if (getBuildInfo() == null)
      return "local build";
    return (String) getBuildInfo().get(VERSION);
  }

  public static String getBuildNumber()
  {
    if (getBuildInfo() == null)
      return "local build";
    return (String) getBuildInfo().get(BUILD);
  }

  public static String getDescription()
  {
    if (getBuildInfo() == null)
      return "local build";
    return (String) getBuildInfo().get(DESC);
  }

  public static String getProductName()
  {
    if (getBuildInfo() == null)
      return "local build";
    return (String) getBuildInfo().get(PRODUCT_NAME);
  }

  public static long getIfixVersion()
  {
    if (getBuildInfo() == null)
      return 0;
    Boolean keyExists = getBuildInfo().containsKey(IFIX_VERSION);
    return keyExists? (Long) getBuildInfo().get(IFIX_VERSION) : -1;
  }

  public static String getPatchBaseBuild()
  {
    if (getBuildInfo() == null)
      return "local build";
    Boolean keyExists = getBuildInfo().containsKey(PATCH_BASE_BUILD);
    return keyExists? (String) getBuildInfo().get(PATCH_BASE_BUILD) : "";
  }

  public static String getAboutText()
  {
    return getDescription() + " " + getBuildVersion();
  }

  public static String getUserAgent(String feature)
  {
    return "IBM-LC-" + feature + "-IBM Docs_" + getBuildVersion() + "-" + System.getProperty("os.name");
  }

  public static void writeJSON(String fileName, JSONObject json) throws Exception
  {
    JSONObject combine = null;
    combine = readJSON(fileName);

    // combine the two json;
    Iterator itr = json.keySet().iterator();
    while (itr.hasNext())
    {
      String key = itr.next().toString();
      String value = json.get(key).toString();
      combine.put(key, value);
    }
    FileOutputStream fout = null;
    try
    {
      fout = new FileOutputStream(fileName);
      combine.serialize(fout);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "write json failed. the file is " + fileName);
      throw e;
    }
    finally
    {

      try
      {
        if (fout != null)
          fout.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Failed to close stream for file when writing " + fileName);
        throw e;
      }
    }
  }

  public static JSONObject readJSON(String fileName)
  {
    JSONObject json = null;
    FileInputStream fins = null;
    try
    {
      fins = new FileInputStream(fileName);
      json = JSONObject.parse(fins);
    }
    catch (IOException e)
    {
      if (new File(fileName).exists())
      {
        LOG.log(Level.WARNING, "Read json failed. the file is " + fileName);
      }
      json = new JSONObject();
    }
    finally
    {
      try
      {
        if (fins != null)
          fins.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Failed to close stream for file when reading " + fileName);
      }
    }
    return json;
  }

  public static TaskCategory getCategoryFromTargetPath(String targetPath)
  {
    if (targetPath.indexOf("thumbnailService") > 0)
    {
      return TaskCategory.THUMBNAILSERVICE;
    }
    else if (targetPath.indexOf("thumbnails") > 0)
    {
      return TaskCategory.THUMBNAILS;
    }
    else if (targetPath.indexOf("html") > 0)
    {
      return TaskCategory.HTML;
    }
    else
    {
      return TaskCategory.FULLIMAGES;
    }
  }

  /**
   * Create new target folder, when the targetFolder exist, it will create new folder under current folder
   *
   * @param targetFolder
   * @param category
   * @return new created folder's absolute Path.
   */
  public static String createTargetFolder(String targetFolder, TaskCategory category)
  {
    String prefix = "";
    if (category.equals(TaskCategory.FULLIMAGES))
    {
      prefix = "pictures";
    }
    else if (category.equals(TaskCategory.HTML))
    {
      prefix = "html";
    }
    else
    {
      prefix = "thumbnails";
    }
    File targetFile = new File(targetFolder).getParentFile();
    File files[] = targetFile.listFiles();
    int max = -1;

    for (int i = 0; i < files.length; i++)
    {
      String fileName = files[i].getName();
      if (fileName.indexOf(prefix) >= 0 && files[i].isDirectory() && !fileName.equals(prefix))
      {
        int index = Integer.parseInt(fileName.substring(prefix.length()));
        if (index >= max)
          max = index;
      }
    }
    if (max != -1)
    {
      max = max + 1;
    }
    else
    {
      max = 1;
    }
    File newTarget = new File(targetFile, prefix + max);

    FileUtil.createTempFolder(newTarget);
    if (category.equals(TaskCategory.FULLIMAGES))
    {
      File thumbnailsTarget = new File(targetFile, "thumbnails" + max);
      FileUtil.createTempFolder(thumbnailsTarget);
    }
    if (category.equals(TaskCategory.THUMBNAILS))
    {
      File picturesTarget = new File(targetFile, "pictures" + max);
      FileUtil.createTempFolder(picturesTarget);
    }
    if (category.equals(TaskCategory.HTML))
    {
      File picturesTarget = new File(targetFile, "html" + max);
      FileUtil.createTempFolder(picturesTarget);
    }
    LOG.log(Level.INFO, "Repeat targetPath for " + category.toString() + ":" + newTarget.getAbsolutePath());
    return newTarget.getAbsolutePath();
  }

  /**
   * Get the latest folder under targetFolder, if no folder is found, it will return the targetFolder;
   *
   * @param targetFolder
   * @param category
   * @return
   */
  public static String getTargetFolder(String targetFolder, TaskCategory category)
  {
    String prefix = "";
    if (category.equals(TaskCategory.FULLIMAGES))
    {
      prefix = "pictures";
    }
    else if (category.equals(TaskCategory.HTML))
    {
      prefix = "html";
    }
    else
    {
      prefix = "thumbnails";
    }

    File targetFile = new File(targetFolder).getParentFile();
    File files[] = targetFile.listFiles();
    int max = -1;

    for (int i = 0; i < files.length; i++)
    {
      String fileName = files[i].getName();
      if (fileName.indexOf(prefix) >= 0 && files[i].isDirectory() && !fileName.equals(prefix))
      {
        int index = Integer.parseInt(fileName.substring(prefix.length()));
        if (index >= max)
          max = index;
      }
    }
    if (max == -1)
      return targetFolder;
    else
      return new File(targetFile, prefix + max).getAbsolutePath();
  }

  public static boolean writeTimestamp(String fileName, Date date)
  {
    File f = new File(fileName);
    PrintWriter pw = null;
    try
    {
      pw = new PrintWriter(new FileOutputStream(f, true));
      pw.println("" + date.getTime());
      pw.flush();
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "File not found when writing timestamp file:" + fileName);
      return false;
    }
    finally
    {
      if (pw != null)
      {
        pw.close();
      }
    }
    return true;
  }

  public static String getTimestamp(String fileName)
  {
    BufferedReader reader = null;
    String line = null;
    try
    {
      reader = new BufferedReader(new InputStreamReader(new FileInputStream(fileName)));
      String temp = null;
      while ((temp = reader.readLine()) != null)
      {
        line = temp;
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.FINEST, "No timestamp file:" + fileName);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IO Exception when reading timestamp file:" + fileName);
    }
    finally
    {
      if (reader != null)
      {
        try
        {
          reader.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "IO Exception when closing stream for reading timestamp file:" + fileName);
        }
      }
    }
    return line;
  }

  public static String format(Date date)
  {
    DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    return format.format(date);
  }

  public static String getDeployment()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("deployment");
    if (config != null)
    {
      String env = (String) config.get("env");
      return env;
    }

    return null;
  }

  public static String getiNotesCache()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("iNotes");
    String ret = "";
    if (config != null)
    {
      String cache_control = (String) config.get("browser_cache");
      if (YES.equalsIgnoreCase(cache_control))
      {
        ret = "private, must-revalidate, max-age=3600";
      }
      else if (NO.equalsIgnoreCase(cache_control))
      {
        ret = "no-store,must-revalidate,no-cache";
      }
      else
        return ret;
    }
    return ret;
  }

  public static String getiNotesPrint()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("iNotes");
    String ret = "";
    if (config != null)
    {
      String print = (String) config.get("enable_print");
      if (YES.equalsIgnoreCase(print))
      {
        ret = "enable";
      }
      else if (NO.equalsIgnoreCase(print))
      {
        ret = "disable";
      }
      else
        return ret;
    }
    return ret;
  }

  public static String getFileOwnerOrgId(IDocumentEntry docEntry, UserBean user)
  {
    // if (docEntry.getCreator()[3] != null)
    // {
    // return docEntry.getCreator()[3];
    // }
    // else
    // {
    String orgId = null;
    IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID).getService(
        docEntry.getRepository());
    if (directoryAdapter != null)
    {
      orgId = directoryAdapter.getById(null, docEntry.getCreator()[0]).getOrgId();
    }
    // for archived user, the org id maybe null.
    if (orgId == null)
    {
      // get org id from doc history.
      // for document without doc history, for example this document was not edited by IBM Docs, use current user's org id.
      if ((orgId == null) && (user != null))
      {
        orgId = user.getOrgId();
      }
    }
    return orgId;
    // }
  }

  public static String getFallbackLocale(HttpServletRequest request)
  {
    String locale = request.getParameter("lang");
    if (locale != null && locale.length() > 0)
    {
      StringBuffer msg = new StringBuffer("Got the locale from request parameter: lang=");
      msg.append(locale);
      msg.append(". The validate result is ");
      // check if the locale string is valid, only letter and -, _ are allowed
      Matcher matcher = Pattern.compile("^[a-zA-Z0-9\\-_\\.]+").matcher(locale);
      int end = 0;
      if (matcher.find() && (end = matcher.end()) > 0)
      {
        if (end > 16)
        { // limit length to 16
          end = 16;
        }
        locale = locale.substring(0, end);
        msg.append(locale);
      }
      else
      {
        locale = null; // not a valid locale string
        msg.append("null");
      }
      msg.append(".");
      LOG.log(Level.FINE, msg.toString());
    }
    if (locale == null || 0 == locale.length())
    {
      locale = request.getLocale().toString().toLowerCase();
      LOG.log(Level.FINE, "Got the locale from request: {0}.", locale);
    }
    locale = locale.replaceAll("_", "-");

    String country = request.getParameter("country");
    if (country != null && country.length() > 0)
    {
      if ((!locale.contains("-")) && (country.length() == 2))
      {
        locale = locale + "-" + country;
      }
    }

    locale = LanguageCookieHelper.getFallbackLanguage(locale);

    return locale;
  }

  private static final String X_UA_IE10 = "IE=10";

  private static final String X_UA_IEEdge = "IE=edge";

  /**
   *
   * @param request
   *          , the request
   * @return the value of X-UA-Compatible
   */
  public static String getXUACompatible(HttpServletRequest request)
  {
    try
    {
      String ua = request.getHeader("User-Agent");
      ua = ua != null ? ua.toLowerCase() : null;
      if (ua != null)
      {
        if (ua.indexOf("trident/7") >= 0)
        {
          return X_UA_IE10;
        }
        else
        {
          return X_UA_IEEdge;
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Can not get suitable X-UA-Compatible,apply default value.");
    }

    return X_UA_IEEdge;
  }

  public static boolean isIE8(String userAgent)
  {
    return isSpecificBrowser(userAgent, MSIE8);
  }

  public static boolean isIE9(String userAgent)
  {
    return isSpecificBrowser(userAgent, MSIE9);
  }

  public static boolean isSpecificBrowser(String userAgent, String browserInfo)
  {
    try
    {
      if (userAgent != null)
      {
        return userAgent.toLowerCase().contains(browserInfo);
      }
      else
      {
        return false;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Failed to tell if the user agent is IE8. " + e.getMessage());
      return false;
    }
  }

  public static void gzipJson2Response(JSONObject json, HttpServletResponse response)
  {
    try
    {
      // ServletOutputStream out = response.getOutputStream();
      // response.addHeader("Content-Encoding", "gzip");
      // GZIPOutputStream gzipOutputStream = new GZIPOutputStream(out);
      json.serialize(response.getWriter());
      // gzipOutputStream.close();
      // out.close();
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed to gzip content to response. " + e.getMessage());
    }
  }

  public static void gzipTxtResponse(String str, HttpServletResponse response)
  {
    try
    {
      // ServletOutputStream out = response.getOutputStream();
      // response.addHeader("Content-Encoding", "gzip");
      // GZIPOutputStream gzipOutputStream = new GZIPOutputStream(out);
      response.getOutputStream().write(str.getBytes());
      // gzipOutputStream.close();
      // out.close();
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed to gzip content to response. " + e.getMessage());
    }
  }

  public static String decompressGzip(InputStream is)
  {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    GZIPInputStream gis = null;
    try
    {
      gis = new GZIPInputStream(is);
      int len;
      byte[] buffer = new byte[1024];
      while ((len = gis.read(buffer)) > -1)
      {
        baos.write(buffer, 0, len);
      }
      baos.flush();
      return new String(baos.toByteArray());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      if (gis != null)
      {
        try
        {
          gis.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, e.getMessage(), e);
        }
      }
    }
    return null;
  }

  private static final Pattern servletPathPattern = Pattern.compile("/app|/uploadconvert|/upload");

  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)(/content)?(/.+)?");

  private static final String API_PREFIX = "/api";

  private static final Pattern API_PATH_PATTERN = Pattern.compile("/([^/]+)/([^/]+)/([^/]+)?(/.+)?");

  public static String[] getRepoAndFile(HttpServletRequest request)
  {
    String servletPath = request.getServletPath();
    String path = request.getPathInfo();

    LOG.log(Level.FINE, "servletpath is {0}, pathInfo is {1}", new String[] { servletPath, path });

    String repoId = null;
    String fileId = null;

    Matcher appDocMatcher = servletPathPattern.matcher(servletPath);

    if (path != null)
    {
      if (servletPath.startsWith(API_PREFIX))
      {
        Matcher repositoryMatcher = API_PATH_PATTERN.matcher(path);
        repositoryMatcher = repositoryMatcher.matches() ? repositoryMatcher : null;
        if (repositoryMatcher != null && repositoryMatcher.groupCount() >= 2)
        {
          repoId = repositoryMatcher.group(2);
          fileId = repositoryMatcher.group(3);
        }
      }
      else
      {
        Matcher repositoryMatcher = pathPattern.matcher(path);
        repositoryMatcher = repositoryMatcher.matches() ? repositoryMatcher : null;
        if (repositoryMatcher != null)
        {
          // view: /viewer/app/lcfiles/{fileId}/content?mode=compact, path /lcfiles/{fileId}/content
          // upload convert: /viewer/uploadconvert/toscana/{fileId}, path /toscana/{fileId}
          // upload: /viewer/upload/lcfiles/{fileId}, path /lcfiles/{fileId}
          if (appDocMatcher.matches())
          {
            repoId = repositoryMatcher.group(1);
            fileId = repositoryMatcher.group(2);
          }
        }
      }

    }

    if (repoId == null)
    {
      repoId = ((HttpServletRequest) request).getParameter("repository");
    }
    if (repoId == null)
    {
      repoId = request.getHeader(HEADER_KEY_REPOID);
    }
    if (repoId == null)
    {
      // request from convertsion server: /viewer/thumbnail, path /thumbnail
      repoId = request.getParameter("repoId");
      fileId = request.getParameter("docid");
    }
    return new String[] { repoId, fileId };
  }

  public static String[] hash(String docUri)
  {
    String[] result = new String[2];
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(docUri.getBytes());
      BigInteger[] modAndRemainder = new BigInteger(rawMD5).abs().divideAndRemainder(BigInteger.valueOf(PRIMARY_MAX_SLOT));
      result[1] = modAndRemainder[0].abs().remainder(BigInteger.valueOf(SECONDARY_MAX_SLOT)).toString();
      result[0] = modAndRemainder[1].toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      LOG.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash cache descriptor directory failed. {0}", e);
      throw new IllegalArgumentException(e);
    }

    return result;
  }

  public static String pathConnect(List<String> dirs)
  {
    String path = "";
    if (dirs == null)
    {
      return path;
    }

    for (Iterator<String> iter = dirs.iterator(); iter.hasNext();)
    {
      String dir = iter.next();
      if ("".equals(path))
      {
        path = dir;
      }
      else
      {
        path = new StringBuffer(path).append(File.separator).append(dir).toString();
      }
    }

    return path;
  }

  public static InputStream getEncryptStream(InputStream in, IDocumentEntry entry, UserBean user, Encryptor.EncryptionMode mode)
  {
    LOG.entering(ViewerUtil.class.getName(), "getEncryptStream", new Object[] { entry.getDocUri(), mode.name() });
    InputStream is = null;
    if (RepositoryServiceUtil.needEncryption(entry.getRepository()))
    {
      String orgId = ViewerUtil.getFileOwnerOrgId(entry, user);
      try
      {
        Encryptor encryptor = EncryptorFactory.getEncryptor();
        SecretKey key = encryptor.generateKey(orgId);
        is = encryptor.getInputStream(in, key, mode);
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Fail to generate encrypt input stream, use the original input stream instead. {0}", e);
      }
    }

    if (is == null)
      is = in;
    LOG.exiting(ViewerUtil.class.getName(), "getEncryptStream", is == null);
    return is;
  }

  public static boolean isIOSMobileRequest(HttpServletRequest request)
  {
    String ua = request.getHeader("User-Agent");
    ua = ua != null ? ua.toLowerCase() : null;
    if (ua == null)
      return false;
    if (ua.indexOf("docsNative") != -1)
    {
      return true;
    }
    return false;
  }

  public static boolean isMobileBrowser(HttpServletRequest request) {
	  String ua = request.getHeader("User-Agent");
	  ua = StringUtils.lowerCase(ua);

	  if ((StringUtils.contains(ua, "ipad") && StringUtils.contains(ua, "safari"))
			  ||StringUtils.contains(ua, "iphone")
			  ||StringUtils.contains(ua, "android")) {
	      return true;
	  }
	  return false;
  }

  /**
   * Get the http status code by internal error code
   *
   * @param errCode
   * @return httpStatusCode
   */
  public static int getHttpStatusByErrorCode(int errCode)
  {
    return errorCodeMap.get(errCode) == null ? HttpServletResponse.SC_INTERNAL_SERVER_ERROR : errorCodeMap.get(errCode);
  }
}
