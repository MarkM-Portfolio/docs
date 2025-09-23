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

package com.ibm.concord.platform.util;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocActivityBean;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.bean.DocReferenceBean;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.platform.browsers.BrowserFilterHelper.Browser;
import com.ibm.concord.platform.conversion.Path;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocActivityDAO;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.dao.IDocReferenceDAO;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.task.TaskComponentImpl;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.Constant;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.oauth.OAuth2Helper;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONObject;

public class ConcordUtil
{
  private static final Logger LOG = Logger.getLogger(ConcordUtil.class.getName());

  private static final String API_PREFIX = "/api";

  private static final Pattern SERVLET_PATH_PATTERN = Pattern.compile("/app/(doc)");

  private static final Pattern PATH_PATTERN = Pattern.compile("/([^/]+)/([^/]+)/([^/]+)(/draft)?/(.+)");

  private static final Pattern API_PATH_PATTERN = Pattern.compile("/([^/]+)/([^/]+)/([^/]+)?(.+)");

  public static String[] colors = { "#38A7FF",// "#C7E3E4",
      "#FA6400",// "#F9CECE",
      "#FF4EC2",// "#BFE0BD",
      "#009E69",// "#FEF8BF",
      "#AC32FF",// "#DAC6DD",
      "#B87F28",// "#FFE2B6",
      "#00D4C0",// "#D6D8D2",
      "#FF3D51",// "#E2E5B0",
      "#B8BB28",// "#E4D2C2",
      "#D819C6",// "#BCC5D0",

      "#FF9900",// "#EAA9A6",
      "#33D159",// "#9CD29A",
      "#FF4E7F",// "#F1DC93",
      "#C399FF",// "#C1A8E6",
      "#83F133",// "#DECDB9",
      "#57D9FF",// "#A9BFE3",
      "#FF7F51",// "#9EDCD7",
      "#66A2D6",// "#DCDC96",
      "#7D54FF",// "#D5B0D1",
      "#64BD83",// "#BECDCE",
      "#B29B66",// "#FACB96",
      "#FF9EBB",// "#BEDC93",
      "#64D4C0",// "#D1C1CC",
      "#99B7FF",// "#AABED3",
      "#64BB28",// "#F1B798",
      "#CF5CFF",// "#AAD0BD",
      "#00E378",// "#F4B0C3",
      "#96EB99",// "#BAC5CF",
      "#FF8030",// "#CDCDB5",
      "#C8ED00"// "#DBC2C2"
  };

  private static String[] borderColors = { "#759B9F", "#E18284", "#6AA868", "#F8E90B", "#AA6DAE", "#D2BB98", "#8D938F", "#B2C149",
      "#B48C6B", "#6F7B88",

      "#C28D8C", "#80AE81", "#C6B77B", "#9F8DB0", "#B9AB9B", "#8EA0BE", "#85B5B3", "#B5B67E", "#B193AF", "#9FABAC",

      "#CEA97E", "#9EB87C", "#ADA1AA", "#8E9EB0", "#C69880", "#8DAD9F", "#C992A3", "#9AA5AD", "#AAAB98", "#B5A2A3" };

  public static final String DEFAULT_BORDER_COLOR = "#759B9F";

  private static final String DESC = "build_description";

  private static final String BUILD = "build_timestamp";

  private static final String VERSION = "build_version";

  private static final String PRODUCT_NAME = "product_name";

  private static final String IFIX_VERSION = "ifix_version";

  private static final String PATCH_BASE_BUILD = "patch_base_build";

  private static boolean localBuild = false;

  private static Random random;

  private static Map<String, String> colorsMap = new HashMap<String, String>(30);

  private static String STATIC_ROOT_PATH = "";

  private static JSONObject buildInfo;

  private static Map<Integer, Integer> errorCodeMap = new HashMap<Integer, Integer>();
  // ATTENTION!!!!!
  // should not map docs internal error to http error status with 404,500,503,504
  // because these http error status will cause docsproxy
  // 1) set cookie as ';originaldocsserver', because it thought the originaldocsserver is not available anymore
  // 2) redirect request if it is /app/docs request which made the request redirect indefinitely and ended by browser because of so many redirections
//  {
//    {
//      put(RepositoryAccessException.EC_REPO_NOVIEWPERMISSION, HttpServletResponse.SC_UNAUTHORIZED);
//      put(RepositoryAccessException.EC_REPO_NOEDITPERMISSION, HttpServletResponse.SC_UNAUTHORIZED);
//      put(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, HttpServletResponse.SC_NOT_FOUND);
//      put(RepositoryAccessException.EC_REPO_CANNOT_FILES, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(RepositoryAccessException.EC_REPO_OUT_OF_SPACE, HttpServletResponse.SC_BAD_REQUEST);
//      put(RepositoryAccessException.EC_REPO_CANNOT_EDIT_LOCKED_DOC, HttpServletResponse.SC_UNAUTHORIZED);
//      put(AccessException.EC_DOCUMENT_ENCRYPT, HttpServletResponse.SC_BAD_REQUEST);
//
//      put(ConversionException.EC_CONV_SERVICE_UNAVAILABLE, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(ConversionException.EC_CONV_DOC_TOOLARGE, HttpServletResponse.SC_BAD_REQUEST);
//      put(OutOfCapacityException.EC_OUTOF_CAPACITY, HttpServletResponse.SC_BAD_REQUEST);
//      put(OutOfCapacityException.EC_OUTOF_CAPACITY_File_Size_Mobile, HttpServletResponse.SC_BAD_REQUEST);
//      put(OutOfCapacityException.EC_OUTOF_CAPACITY_Page_Count_Mobile, HttpServletResponse.SC_BAD_REQUEST);
//      put(OutOfCapacityException.EC_OUTOF_CAPACITY_Image_Count_Mobile, HttpServletResponse.SC_BAD_REQUEST);
//      put(OutOfCapacityException.EC_OUTOF_CAPACITY_Sheet_View_ROWCOL_Mobile, HttpServletResponse.SC_BAD_REQUEST);
//
//      put(ConversionException.EC_CONV_CONVERT_TIMEOUT, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(ConversionException.EC_CONV_INVALID_FORMAT, HttpServletResponse.SC_BAD_REQUEST);
//      put(ConversionException.EC_CONV_UNSUPPORTED_FORMAT, HttpServletResponse.SC_BAD_REQUEST);
//      put(UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE, HttpServletResponse.SC_BAD_REQUEST);
//      put(ConversionException.EC_CONV_INVALID_PASSWORD, HttpServletResponse.SC_BAD_REQUEST);
//      put(ConversionException.EC_CONV_UNSUPPORTED_ENCRYPTION, HttpServletResponse.SC_BAD_REQUEST);
//      put(ConversionException.EC_CONV_NO_NEED_TO_CONVERT, HttpServletResponse.SC_BAD_REQUEST);
//
//      put(ConversionException.EC_CON_SERVER_BUSY, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(ConversionException.EC_CONV_EXT_CONTENT_MISMATCH, HttpServletResponse.SC_BAD_REQUEST);
//      put(ConversionException.EC_CONV_EMPTY_FILE_ERROR, HttpServletResponse.SC_BAD_REQUEST);
//      put(MalformedRequestException.EC_MALFORMED_INVALID_REQUEST, HttpServletResponse.SC_BAD_REQUEST);
//      put(1601, HttpServletResponse.SC_SERVICE_UNAVAILABLE); // DraftDataAccessException.EC_DRAFTDATA_ACCESS_ERROR
//      put(1602, HttpServletResponse.SC_SERVICE_UNAVAILABLE); // DraftStorageAccessException.EC_DRAFTSTORAGE_ACCESS_ERROR
//      put(DocumentServiceException.EC_DOCUMENT_EXCEED_MAX_SESSION_ERROR, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(DocumentServiceException.EC_DOCUMENT_EXCEED_MAX_USERS_PER_SESSION_ERROR, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//
//      put(DocumentServiceException.EC_DOCUMENT_LOCKED_EDIT_ERROR, HttpServletResponse.SC_UNAUTHORIZED);
//      put(DocumentServiceException.EC_DOCUMENT_JOIN_LOCKED_SESSION_ERROR, HttpServletResponse.SC_BAD_REQUEST);
//      put(DocumentServiceException.EC_DOCUMENT_LOCKED_PUBLISH_ERROR, HttpServletResponse.SC_BAD_REQUEST);
//      put(DocumentServiceException.EC_DOCUMENT_ASYNC_RESPONSE_TIME_OUT, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(DocumentServiceException.EC_DOCUMENT_ASYNC_MAX_REQUEST_ERROR, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//      put(3001, HttpServletResponse.SC_BAD_REQUEST);
//      put(3002, HttpServletResponse.SC_BAD_REQUEST);
//      put(3101, HttpServletResponse.SC_BAD_REQUEST); // DocumentSessionException.ERR_PT_NOENTITLED_COEDIT
//      put(3102, HttpServletResponse.SC_BAD_REQUEST); // DocumentSessionException.ERR_PT_NOENTITLED_COEDIT2
//
//      /*
//       * If it is in HTML mode, replace docs error code with viewer's
//       * This code may never be used because this map is only for the method of forwarding to error.jsp
//       *    and will never be in HTML mode
//       */
//      /*
//       * put(ConversionException.EC_CONV_DOWNSIZE_ERROR, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//       * put(ConversionException.EC_CONV_IO_EXCEPTION, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//       * put(ConversionException.EC_CONV_UNEXPECIFIED_ERROR, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//       * put(ConversionException.EC_CON_ENCRPTED_ERROR, HttpServletResponse.SC_BAD_REQUEST);
//       * put(ConversionException.EC_CONV_SYSTEM_BUSY, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//       * put(ConversionException.EC_CONV_EMPTY_FILE_ERROR, HttpServletResponse.SC_BAD_REQUEST);
//       * put(ConversionException.EC_CONV_CORRUPTED_FILE_ERROR, HttpServletResponse.SC_BAD_REQUEST);
//       * put(DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR, HttpServletResponse.SC_SERVICE_UNAVAILABLE);
//       * put(400, HttpServletResponse.SC_BAD_REQUEST);
//       * put(0, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//       * put(2001, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//       */
//    }
//  };

  static
  {
    random = new Random();
    random.setSeed(System.currentTimeMillis());

    for (int i = 0; i < colors.length; i++)
    {
      colorsMap.put(colors[i], colors[i]);
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

  public static String getUserAgent(String feature)
  {
    return "IBM-LC-" + feature + "-IBM Docs_" + getVersion() + "-" + System.getProperty("os.name");
  }

  public static String getStaticRootPath()
  {
    return STATIC_ROOT_PATH;
  }

  public static JSONObject getBuildInfo()
  {
    return buildInfo;
  }

  public static String getBuildDescription()
  {
    return (String) buildInfo.get(DESC);
  }

  public static String getBuildNumber()
  {
    return (String) buildInfo.get(BUILD);
  }

  public static boolean isLocalBuild()
  {
    return localBuild;
  }

  public static String getBuild()
  {
    return (String) buildInfo.get(BUILD);
  }

  public static String getVersion()
  {
    return (String) buildInfo.get(VERSION);
  }

  public static String getProductName()
  {
    return (String) buildInfo.get(PRODUCT_NAME);
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

  public static String getRootPath()
  {
    String realPath = Platform.getServletContext().getRealPath("/");
    if (STATIC_ROOT_PATH.equals(""))
    {
      return realPath;
    }
    else
    {
      return realPath + STATIC_ROOT_PATH;
    }
  }

  public static void initVersion()
  {
    buildInfo = ConcordConfig.getInstance().getSubConfig("build-info");
    LOG.log(Level.INFO, "IBMDocs biuld info:" + buildInfo.toString());
    System.setProperty("DOCS_VERSION", getVersion());
    if (buildInfo == null || buildInfo.get(BUILD).equals("local build"))
    {
      localBuild = true;
      STATIC_ROOT_PATH = "/static";
    }
    else
    {
      STATIC_ROOT_PATH = "/static/" + buildInfo.get(BUILD);
    }
  }

  /**
   * By default,show email information in client
   *
   * @return whether to show email in type-ahead control or not
   */
  public static boolean showMailInTypeAhead()
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig("typeahead");
    if (config != null)
    {
      String value = (String) config.get("showemail");
      if ("false".equalsIgnoreCase(value))
      {
        return false;
      }
    }
    return true;
  }

  /**
   * Encoded XML Attributes
   */
  public static String encodeXMLAttributes(String s)
  {
    String r = s.replaceAll("\"", "&quot;");
    r = r.replaceAll("'", "&apos;");
    return r;
  }

  /**
   * Retrieve the org id of the specified document entry. Normally, the org id of a document is the org id of the document owner.
   *
   * In LotusLive::Files, the org id was returned in the atom entry alone with author userid/email/username.
   *
   * In Connections:Files, the org id was hide from the atom entry, so that retrieve it through IDirectoryAdapter.
   *
   * @param docEntry
   * @param user
   * @return
   */
  public static String retrieveFileOwnerOrgId(IDocumentEntry docEntry, UserBean user)
  {
    if (docEntry.getCreator()[3] != null)
    {
      return docEntry.getCreator()[3];
    }
    else
    {
      String orgId = null;
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) ((DirectoryComponent) Platform.getComponent(DirectoryComponent.COMPONENT_ID))
          .getService(IDirectoryAdapter.class, docEntry.getRepository());
      // orgId = directoryAdapter.getById(null, docEntry.getCreator()[0]).getOrgId();
      UserBean creator = directoryAdapter.getById(user, docEntry.getCreator()[0]);
      if (creator != null)
      {
        orgId = creator.getOrgId();
      }
      else
      {
        orgId = null;
      }
      // for archived user, the org id maybe null.
      if (orgId == null)
      {
        // get org id from doc history.
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
        if (docHistoryBean != null)
        {
          orgId = docHistoryBean.getOrgId();
        }
        // for document without doc history, for example this document was not edited by IBM Docs, use current user's org id.
        if ((orgId == null) && (user != null))
        {
          orgId = user.getOrgId();
        }
      }
      return orgId;
    }
  }

  public static String retrieveFileOwnerOrgIdFromDB(IDocumentEntry docEntry)
  {
    String orgId = null;
    // get org id from doc history.
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
    if (docHistoryBean != null)
    {
      orgId = docHistoryBean.getOrgId();
    }
    return orgId;
  }

  public static String getRelativePath(String absolutePath)
  {
    String sharedRoot = ConcordConfig.getInstance().getSharedDataRoot();
    String path = new Path(sharedRoot, absolutePath).resolveToRelativePath();
    path = "${" + ConcordConfig.getInstance().getSharedDataName() + "}" + path;
    return path;
  }

  /**
   * Compares two versions.
   *
   * @param version1
   *          the first version
   * @param version2
   *          the second version
   * @return an int < 0 if version1 is less than version2, 0 if they are equal, and > 0 if version1 is greater
   */
  public static int compareVersion(String version1, String version2)
  {
    String versions1[] = version1.split("\\.");
    String versions2[] = version2.split("\\.");
    int length = 0;
    if (versions1.length > versions2.length)
    {
      length = versions2.length;
    }
    else
    {
      length = versions1.length;

    }
    for (int i = 0; i < length; i++)
    {
      int v1 = Integer.parseInt(versions1[i]);
      int v2 = Integer.parseInt(versions2[i]);
      if (v1 == v2)
        continue;
      return v1 - v2;
    }
    return versions1.length - versions2.length;
  }

  /**
   * <li>If conversionVersion.txt does not exist, it indicates no upgraded needed.</li> <li>If the latest version is larger than version
   * from conversionVersion.txt, upgraded needed.</li> <li>If the latest version is less or euqal than version from conversionVersion.txt,
   * no upgrade needed.
   *
   * @param parentFolder
   *          directory where conversionVersion.txt is located.
   * @param latestVersion
   *          version read from concord-config.json
   * @return true to upgrade or else no upgrade needed.
   */
  public static boolean checkDraftFormatVersion(String parentFolder, String latestVersion)
  {
    if (latestVersion == null)
    {
      return false;
    }
    File file = new File(parentFolder, "conversionVersion.txt");
    if (file.exists())
    {
      String version = FileUtil.readFile(file.getAbsolutePath());
      int diff = ConcordUtil.compareVersion(latestVersion, version);
      return diff > 0 ? true : false;
    }
    return true;
  }

  private static final String X_UA_IE9 = "IE=9";

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
        IDocumentEntry docEntry = (IDocumentEntry) request.getAttribute("doc_entry");
        String repoId = (docEntry != null) ? docEntry.getRepository() : null;
        if (ua.indexOf("trident/6") >= 0)
        {
          if (RepositoryConstants.REPO_TYPE_ECM.equalsIgnoreCase(repoId))
            // CCM widgets must be run under IE9 mode in IE10, it's IE10 special. iframe inherited the parent document mode.
            return X_UA_IE9;
          else
            return X_UA_IE10;
        }
        if (ua.indexOf("trident/7") >= 0)
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

  /**
   *
   * @return activity url from concord-config.json
   */
  public static String getActivitiesUrl()
  {
    String activitiesUrl = null;
    IComponent component = Platform.getComponent(TaskComponentImpl.COMPONENT_ID);
    JSONObject adapterConfig = (JSONObject) component.getConfig().get("adapter");
    if (adapterConfig != null)
    {
      JSONObject config = (JSONObject) adapterConfig.get("config");
      if (config != null)
      {
        Object serverUrl = config.get(IActivityAdapter.SERVER_KEY);
        if (serverUrl != null)
        {
          activitiesUrl = serverUrl.toString();
        }
      }
    }
    return activitiesUrl;
  }

  public static String compositeDisplayAndEmail(Object user)
  {
    String email = "";
    String displayName = "";
    if (user instanceof UserBean)
    {
      email = ((UserBean) user).getEmail();
      displayName = ((UserBean) user).getDisplayName();
      String bidiTextDir = ((UserBean) user).getProperty(BidiUtilities.TEXT_DIR_PROP);
      if (bidiTextDir != null && bidiTextDir.length() > 0)
        displayName = BidiUtilities.addEmbeddingUCC(displayName, bidiTextDir);
    }
    else if (user instanceof DocumentEditorBean)
    {
      email = ((DocumentEditorBean) user).getEmail();
      displayName = ((DocumentEditorBean) user).getDisplayName();
    }
    else
    {
      ;
    }

    if (email == null && displayName == null)
    {
      return "";
    }
    else if (email == null)
    {
      return displayName;
    }
    else if (displayName == null)
    {
      return email;
    }
    else
    {
      return displayName + Constant.USERDISPLAY_COMPOSITE_PREFIX + email + Constant.USERDISPLAY_COMPOSITE_SUFFIX;
    }
  }

  public static String generateMD5Id(String eigenvalue)
  {
    try
    {
      return getHexString(MessageDigest.getInstance("MD5").digest(eigenvalue.getBytes()));
    }
    catch (NoSuchAlgorithmException e)
    {
      LOG.log(Level.WARNING, "Calculate MD5 ID failed, caused by no Java MD5 algorithm found.", e);
      return UUID.randomUUID().toString();
    }
    catch (UnsupportedEncodingException e)
    {
      LOG.log(Level.WARNING, "Calculate MD5 ID failed, caused by unsupported encoding.", e);
      return UUID.randomUUID().toString();
    }
  }

  private static String getHexString(byte[] raw) throws UnsupportedEncodingException
  {
    byte[] HEX_CHAR_TABLE = { (byte) '0', (byte) '1', (byte) '2', (byte) '3', (byte) '4', (byte) '5', (byte) '6', (byte) '7', (byte) '8',
        (byte) '9', (byte) 'a', (byte) 'b', (byte) 'c', (byte) 'd', (byte) 'e', (byte) 'f' };

    byte[] hex = new byte[2 * raw.length];
    int index = 0;

    for (byte b : raw)
    {
      int v = b & 0xFF;
      hex[index++] = HEX_CHAR_TABLE[v >>> 4];
      hex[index++] = HEX_CHAR_TABLE[v & 0xF];
    }
    return new String(hex, "ASCII");
  }

  public static void updateDbForTransferredDraft(final DraftDescriptor oldDraft, final DraftDescriptor newDraft, UserBean user,
      IDocumentEntry docEntry, final String repoId, boolean bTransferOrg, String newOrgId, Object lastModified) throws IOException
  {
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);

    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    DocHistoryBean dhb = docHisotryDAO.get(repoId, oldDraft.getDocId());
    if (dhb != null)
    {
      if (bTransferOrg)
      {
        dhb = new DocHistoryBean(repoId, newDraft.getDocId());
        dhb.setOrgId(newOrgId);
        if (lastModified != null)
        {
          long modified = AtomDate.valueOf((String) lastModified).getCalendar().getTimeInMillis();
          dhb.setLastModified(modified);
        }
        docHisotryDAO.update(dhb);
      }
      else
      {
        dhb = new DocHistoryBean(repoId, newDraft.getDocId(), dhb);
        dhb.setDocId(docEntry.getDocId());
        docHisotryDAO.delete(repoId, oldDraft.getDocId());
        docHisotryDAO.add(dhb);
      }
    }

    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) daoComp.getService(IDocumentEditorsDAO.class);
    IDocumentEntry oldDocEntry = new AbstractDocumentEntry()
    {

      public String getDocUri()
      {
        return oldDraft.getDocId();
      }

      public String getRepository()
      {
        return repoId;
      }

      public String getFileDetailsURL()
      {
        return null;
      }

      public boolean isPublished()
      {
        return true;
      }

    };

    List<DocumentEditorBean> docEditors = docEditorsDAO.getDocumentEditors(oldDocEntry);
    docEditorsDAO.removeAllEditors(oldDocEntry);
    docEditorsDAO.removeAllEditors(docEntry);
    for (int i = 0; i < docEditors.size(); i++)
    {
      DocumentEditorBean docEditor = docEditors.get(i);
      docEditor = new DocumentEditorBean(repoId, newDraft.getDocId(), docEditor);
      if (bTransferOrg)
      {
        docEditor.setOrgId(newOrgId);
      }
      docEditorsDAO.addEditor(docEntry, docEditor);
      docEditorsDAO.updateEditorIndicators(docEditor);
    }

    IDocActivityDAO docActivitiesDAO = (IDocActivityDAO) daoComp.getService(IDocActivityDAO.class);
    DocActivityBean dab = docActivitiesDAO.getByRepoAndUri(repoId, oldDraft.getDocId());
    if (dab != null)
    {
      dab = new DocActivityBean(repoId, newDraft.getDocId(), dab);
      docActivitiesDAO.deleteByRepoAndUri(repoId, oldDraft.getDocId());
      if (bTransferOrg)
      {
        dab.setOrgid(newOrgId);
      }
      docActivitiesDAO.add(dab);
    }

    IDocReferenceDAO docReferenceDAO = (IDocReferenceDAO) daoComp.getService(IDocReferenceDAO.class);
    List<DocReferenceBean> drb1 = docReferenceDAO.getByChild(repoId, oldDraft.getDocId());
    for (int i = 0; i < drb1.size(); i++)
    {
      DocReferenceBean drb = drb1.get(i);
      drb.setChildUri(newDraft.getDocId());
      if (bTransferOrg)
      {
        drb.setCreatorOrgId(newOrgId);
      }
      docReferenceDAO.deleteByChildDocument(repoId, oldDraft.getDocId());
      docReferenceDAO.add(user, drb);
    }
    List<DocReferenceBean> drb2 = docReferenceDAO.getByParent(repoId, oldDraft.getDocId());
    for (int i = 0; i < drb2.size(); i++)
    {
      DocReferenceBean drb = drb2.get(i);
      drb.setParentUri(newDraft.getDocId());
      if (bTransferOrg)
      {
        drb.setCreatorOrgId(newOrgId);
      }
      docReferenceDAO.deleteByParentDocument(repoId, oldDraft.getDocId());
      docReferenceDAO.add(user, drb);
    }
  }

  public static String getRepoId(HttpServletRequest request)
  {
    String servletPath = request.getServletPath();
    Matcher appDocMatcher = SERVLET_PATH_PATTERN.matcher(servletPath);
    String path = request.getPathInfo();
    String repoId = null;
    if (path != null)
    {
      // 1. get repoId from app uri
      Matcher repositoryMatcher = PATH_PATTERN.matcher(path);
      repositoryMatcher = repositoryMatcher.matches() ? repositoryMatcher : null;
      if (repositoryMatcher != null)
      {
        if (appDocMatcher.matches())
        {
          repoId = repositoryMatcher.group(1);
        }
        else
        {
          if (repositoryMatcher.groupCount() >= 2)
          {
            repoId = repositoryMatcher.group(2);
          }
        }
      }
    }

    // 2. get repoId from header
    if (repoId == null)
    {
      repoId = ((HttpServletRequest) request).getHeader("X-DOCS-REPOID");
    }

    // 3. get repoId from api uri
    if (repoId == null && path != null && servletPath.startsWith(API_PREFIX))
    {
      Matcher repositoryMatcher = API_PATH_PATTERN.matcher(path);
      repositoryMatcher = repositoryMatcher.matches() ? repositoryMatcher : null;
      if (repositoryMatcher != null && repositoryMatcher.groupCount() >= 2)
      {
        repoId = repositoryMatcher.group(2);
      }
    }

    return repoId;
  }

  public static String getFileRealExtension(String mime)
  {
    return (String) FormatUtil.ALL_FORMATS.get(mime);
  }

  private static final String REPOSITORY_NAME = "repository_name";

  public static String getExternalRepositoryName(String repoId)
  {
    String repository_name = "";
    RepositoryProviderRegistry registry = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryProviderRegistry.class);
    IRepositoryAdapter repoAdpt = registry.getRepository(repoId);
    if (registry != null)
    {
      JSONObject config = repoAdpt.getConfig();
      if (config != null)
      {
        String repoName = (String) config.get(REPOSITORY_NAME);
        if (repoName != null)
        {
          repository_name = repoName;
        }
      }
    }
    return repository_name;
  }

  /**
   * To know whether a request is a server to server call request
   *
   * @param request
   * @return
   */
  public static boolean isS2SCallRequest(HttpServletRequest request)
  {
    if (request == null)
    {
      throw new IllegalArgumentException("Calling isS2SCallRequest: request can not be null!");
    }
    String s2sToken = ConcordConfig.getInstance().getS2SToken();
    String token = request.getHeader("s2stoken");
    String userId = request.getHeader("onBehalfOf");
    if (userId != null && s2sToken != null && s2sToken.equalsIgnoreCase(token))
    {
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
  public static int getHttpStatusByErrorCode(int errCode) {
    return errorCodeMap.get(errCode) == null ? HttpServletResponse.SC_BAD_REQUEST : errorCodeMap.get(errCode);
  }

  public static void processLeaveData(UserBean user, String docId) {
    if (user != null && docId != null) {
      OAuth2Helper helper = null;
      String helperID = "oauth2helper" + "@" + docId;
      LOG.log(Level.INFO, "delete OAuth token for " + docId);
      if (user != null) {
        helper = (OAuth2Helper) user.getObject(helperID);
      }
      if (helper != null) {
        LOG.log(Level.INFO, "find OAuth2Helper instance to delete token:" + helperID);
        helper.deleteToken();
        user.setObject(helperID, null);
      }
    }
  }

  /**
   * Check if Note document format is supported. For non Note document this will return true
   * @param request
   * @param mimeType
   * @return true if support note document or else false
   */
  public static boolean supportNote(HttpServletRequest request, String mimeType)
  {
    Browser browser = (Browser)request.getAttribute("browser_type");
    if(FormatUtil.NOTE_MIMETYPE.equalsIgnoreCase(mimeType))
    {
      return Browser.ELECTRON.equals(browser);
    }
    return true;
  }

  // IOS native app should add 'docsNative' to its user agent string
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

}
