/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.browsers.BrowserFilterHelper.Browser;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.servlet.PlatformInitializer;
import com.ibm.concord.services.servlet.SmartCloudInitializer;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.DocumentSessionService;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.common.util.AESUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Decoder;
import com.ibm.misc.BASE64Encoder;
import com.ibm.websphere.runtime.ServerName;

public class ServiceUtil
{
  private static final Logger LOG = Logger.getLogger(ServiceUtil.class.getName());
  
  private static final String CLASS_NAME = ServiceUtil.class.getName();

  // Status code(0) presents that the request can be served by current server.
  public static final int SERVING_STATUS_SUCCESS = 0;

  // Status code(1) presents that the request cannot be served by current server.
  public static final int SERVING_STATUS_OTHERSRV = 1;

  // Status code(2) presents that exception happens while checking the serving server.
  public static final int SERVING_STATUS_EXCEPTION = 2;

  public static final DiskFileItemFactory FILE_ITEM_FACTORY;

  public static boolean isCookiesEnforceSecure = false;

  static
  {
    FILE_ITEM_FACTORY = new DiskFileItemFactory();
    isCookiesEnforceSecure = ConcordConfig.getInstance().isCookiesEnforceSecure();
  }

  public static String getDataFromCookie(Cookie cookies[], String key)
  {
    if(cookies != null){
      for (int i = 0; i < cookies.length; i++)
      {
        Cookie cookie = cookies[i];
        if (cookie.getName().equals(key))
        {
          try
          {
            String value = cookie.getValue();
            if (value != null && !value.equals("") && !value.equals("null"))
            {
              value = URLDecoder.decode(value, "UTF-8");
              return value;
            }
            return value;
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "io error when get data from cookie.", e);
          }
        }
      }
    }
    return null;
  }

  public static JSONObject getJSONDataFromCookie(Cookie cookies[], String key)
  {
    String value = getDataFromCookie(cookies, key);
    if ((value != null) && (value.length() > 0))
    {
      JSONObject obj = null;
      try
      {
        obj = JSONObject.parse(value);
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Error to parse JSON object when get data from cookie.", e);
      }
      return obj;
    }
    else
      return null;

  }

  /**
   * Parse the server names in cookie, the cookie name is the repository id + "_" + document id, the value is: current server name + ";" +
   * old server name, the old server is the last server that serve the document, current server is the current server that serve the
   * document.
   * 
   * @param cookies
   *          specifies all the cookies
   * @param repoId
   *          specifies the repository id
   * @param docId
   *          specifies the document id
   * @return full names of the servers, first element is the current server, second element is the old server
   */
  public static String[] getSrvNamesInCookie(Cookie cookies[], String repoId, String docId)
  {
    String serverNames[] = new String[2];
    try
    {
      int length = cookies != null ? cookies.length : 0;
      String encodedKey = URLEncoder.encode((repoId + "_" + docId), "UTF-8");
      for (int index = 0; index < length; index++)
      {
        Cookie cookie = cookies[index];
        if (cookie != null && encodedKey.equals(cookie.getName()) && cookie.getValue() != null)
        {
          String servers = AESUtil.aesDecryptByString(cookie.getValue());
          int number = servers.indexOf(";");
          if (number >= 0)
          {
            serverNames[0] = servers.substring(0, number);
            serverNames[1] = servers.substring(number + 1, servers.length());
          }
          else
          {
            serverNames[0] = servers;
            serverNames[1] = null;
          }
          serverNames[0] = "".equals(serverNames[0]) ? null : serverNames[0];
          serverNames[1] = "".equals(serverNames[1]) ? null : serverNames[1];
          break;
        }
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Error happen while getting the server names in cookie.", ex);
    }
    return serverNames;
  }

  /**
   * Create a cookie. The name of cookie is: repository id + "_" + document id, the value of cookie is the encoded full name of server that
   * is serving the specified document.
   * 
   * @param repoId
   *          specifies the repository id of the document
   * @param docId
   *          specifies the id of the document
   * @param serverName
   *          specifies the name of server that is serving the document
   * @return created cookie instance
   * @throws IOException
   */
  public static Cookie createServingSrvCookie(String repoId, String docId, String serverName) throws IOException
  {
    Cookie cookie = null;
    try
    {
      String encodedKey = URLEncoder.encode((repoId + "_" + docId), "UTF-8");
      String encodedName = serverName != null ? AESUtil.aesEncryptToString(serverName) : "";
      if (encodedName.contains("\r"))
      {
        // Does not allow to contain the character'\r\n' in cookie value.
        encodedName = encodedName.replace("\r", "");
      }
      if (encodedName.contains("\n"))
      {
        // Does not allow to contain the character'\r\n' in cookie value.
        encodedName = encodedName.replace("\n", "");
      }
      cookie = new Cookie(encodedKey, encodedName);
      cookie.setMaxAge(-1);
      cookie.setPath("/docs/");
      if (isCookiesEnforceSecure)
        cookie.setSecure(isCookiesEnforceSecure);
      try
      {// cswg is still using WAS7 against servlet 2.5, the cookie does not have method setHttpOnly.
        cookie.setHttpOnly(true);
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "No function setHttpOnly defined, just ignore it...");
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while creating the serving server cookie for document " + docId, ex);
    }
    return cookie;
  }

  /**
   * Check if specified document is served by current server or not. If it's served by current server, then continue. If it has been served
   * by another server, then should redirect to the same URL.
   * 
   * @param repoId
   *          specifies the repository id of the document
   * @param docId
   *          specifies the id of the document
   * @return 0 if can serve the request in this server, 1 if is not served by this server, 2 if exception happens while access the database
   * @throws IOException
   */
  public static int checkServingSrv(HttpServletRequest request, HttpServletResponse response, String repoId, String docId)
      throws IOException
  {
    return checkServingSrv(request, response, repoId, docId, true);
  }

  /**
   * Check if specified document is served by current server or not. If it's served by current server, then continue. If it has been served
   * by another server, then should redirect to the same URL.
   * 
   * @param repoId
   *          specifies the repository id of the document
   * @param docId
   *          specifies the id of the document
   * @isAddServer specifies if add current server as serving server of the document into database if it does not exist in database
   * @return 0 if can serve the request in this server, 1 if is not served by this server, 2 if exception happens while access the database
   * @throws IOException
   */
  public static int checkServingSrv(HttpServletRequest request, HttpServletResponse response, String repoId, String docId,
      boolean isAddServer) throws IOException
  {
    LOG.entering(CLASS_NAME, "checkServingSrv", new Object[]{request.getRequestURL(), request.getUserPrincipal(), docId, isAddServer});
    String servingServer = ServerName.getFullName();

    DocumentSessionService service = DocumentSessionService.getInstance();
    DocumentSession session = SessionManager.getInstance().getSession(repoId, docId);
    String srvNamesInCookie[] = ServiceUtil.getSrvNamesInCookie(request.getCookies(), repoId, docId);
    String srvInCookie = srvNamesInCookie[0];
    String oldSrvInCookie = srvNamesInCookie[1];

    if(LOG.isLoggable(Level.FINE))
    {
      LOG.fine("the server name contained in the cookie:" + srvInCookie + ":" + oldSrvInCookie);
    }
    // If the document session exists, then serve the request in this server and do not need to check the database.
    if (session != null)
    {
      if (servingServer != null && !servingServer.equals(srvInCookie))
      {
        Cookie cookie = ServiceUtil.createServingSrvCookie(repoId, docId, servingServer);
        if (cookie != null)
        {
          response.addCookie(cookie);
          LOG.log(Level.INFO, "Document {0} session exists, update cookie as {1}", new Object[] { docId, servingServer });
        }
      }
      LOG.exiting(CLASS_NAME, "checkServingSrv", new Object[]{request.getRequestURL(), request.getUserPrincipal(), docId, isAddServer});
      return SERVING_STATUS_SUCCESS;
    }
    // If the document session does not exist, then should check the serving server in database.
    boolean isServingHere = true;
    try
    {
      String srvNameInDB = service.getServingServer(repoId, docId);
      if(LOG.isLoggable(Level.FINE))
      {
        LOG.fine("the server name contained in the database:" + srvNameInDB);
      }
      if (srvNameInDB != null)
      {
        isServingHere = srvNameInDB.equals(ServerName.getFullName());
        servingServer = srvNameInDB;
        if (!isServingHere)
        {
          if (!isDocsAppAvailable(srvNameInDB))
          {
            // Using current server to update the serving server in database according to document id, and server name in database.
            isServingHere = service.updateServingSrv(repoId, docId, srvNameInDB);
            servingServer = isServingHere ? ServerName.getFullName() : service.getServingServer(repoId, docId);
            LOG.log(Level.INFO,
                "Document {0} was served by {1} previously, but will be served by {2}. Found cookie {3};{4} set in this session.",
                new Object[] { docId, srvNameInDB, servingServer, srvInCookie, oldSrvInCookie });
          }
          else
          {
            /**
             * FIEXME edge case without any cookie in request 1. If srvNameInDB is up at this time and request can come to srvNameInDB,
             * this branch will be ok and request will be routed to srvNameInDB. 2. If srvNameInDB is up at this time and request can not
             * come to srvNameInDB, this branch will lead to infinite loop.
             */
          }
          
//          if (srvInCookie == null && oldSrvInCookie != null && oldSrvInCookie.equals(srvNameInDB))
//          {
//            if (!isDocsAppAvailable(oldSrvInCookie))
//            {
//              // Using current server to update the serving server in database according to document id, and old server name.
//              isServingHere = service.updateServingSrv(repoId, docId, oldSrvInCookie);
//              servingServer = isServingHere ? ServerName.getFullName() : service.getServingServer(repoId, docId);
//            }
//          }
//          else if (srvInCookie != null && !srvInCookie.equals(ServerName.getFullName()))
//          {
//            if (!isDocsAppAvailable(srvNameInDB))
//            {
//              // Using current server to update the serving server in database according to document id, and server name in database.
//              isServingHere = service.updateServingSrv(repoId, docId, srvNameInDB);
//              servingServer = isServingHere ? ServerName.getFullName() : service.getServingServer(repoId, docId);
//            }
//          }
//          else
//          {
//            if (!isDocsAppAvailable(srvNameInDB))
//            {
//              isServingHere = service.updateServingSrv(repoId, docId, srvNameInDB);
//              servingServer = ServerName.getFullName();
//              LOG.log(Level.INFO,
//                  "Nothing found in cookie. Document {0} was served by {1} previously, but will be served by current server: {2}",
//                  new Object[] { docId, srvNameInDB, servingServer });
//            }
//            else
//            {
//              /**
//               * FIEXME edge case without any cookie in request 1. If srvNameInDB is up at this time and request can come to srvNameInDB,
//               * this branch will be ok and request will be routed to srvNameInDB. 2. If srvNameInDB is up at this time and request can not
//               * come to srvNameInDB, this branch will lead to infinite loop.
//               */
//            }
//          }
        }
      }
      else
      {
        if (isAddServer)
        {
          // Serve the request of specified document in current server.
          isServingHere = service.serveDocument(repoId, docId);
          servingServer = isServingHere ? ServerName.getFullName() : service.getServingServer(repoId, docId);
        }
      }
      if(LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "Doc {0} is served by {1}, current server: {2}",
            new Object[] { docId, servingServer, ServerName.getFullName() });  
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while checking the serving server for document " + docId, ex);
      return SERVING_STATUS_EXCEPTION;
    }

    if (servingServer != null && !servingServer.equals(srvInCookie))
    {
      Cookie cookie = ServiceUtil.createServingSrvCookie(repoId, docId, servingServer);
      if (cookie != null)
      {
        response.addCookie(cookie);
        LOG.log(Level.INFO, "Document {0} update cookie as {1}", new Object[] { docId, servingServer });
      }
    }
    LOG.exiting(CLASS_NAME, "checkServingSrv", new Object[] { request.getRequestURL(), request.getUserPrincipal(), docId, isAddServer });
    return isServingHere ? SERVING_STATUS_SUCCESS : SERVING_STATUS_OTHERSRV;
  }

  /**
   * Set a status code into response that presents that the document is served by other server. Current server can not handle the request of
   * this document.
   * 
   * @param response
   *          HTTP response
   */
  public static void setWrongSrvResponse(HttpServletResponse response) throws IOException
  {
    if (response != null)
    {
      // Status code(471) is defined in IBMDocs, not a standard HTTP status code. Means the document
      // is served by other server. Current server can not handle the request of this document.
      sendError(response, 471);
    }
  }

  public static String getDocumentContentDispositionValue(HttpServletRequest request, IDocumentEntry docEntry, String extension)
  {
    Browser type = (Browser) request.getAttribute("browser_type");
    String title = docEntry.getTitle();

    if (Browser.SAFARI.equals(type) || Browser.CHROME.equals(type))
    {
      try
      {
        return "attachment;" + "filename=\"" + new String(title.getBytes("UTF-8"), "ISO-8859-1") + "." + extension + "\"";
      }
      catch (UnsupportedEncodingException e)
      {
        LOG.log(Level.WARNING, "unsupported encoding charset ", e);
        return "attachment; filename" + "=" + encodeTitle(title, "UTF-8") + "." + extension;
      }
    }
    else if (Browser.FIREFOX.equals(type))
    {
      return "attachment; filename*" + "=" + encodeTitle(title, "UTF-8") + "." + extension;
    }
    else
    {
      return "attachment; filename" + "=" + encodeTitle(title, "UTF-8") + "." + extension;
    }
  }

  private static String encodeTitle(String title, String enc)
  {
    try
    {
      String newTitle = URLEncoder.encode(title, enc);
      return newTitle.replaceAll("[+]", "%20");
    }
    catch (UnsupportedEncodingException e)
    {
      LOG.log(Level.WARNING, "Unsupported Encoding Type", e);
    }
    return null;
  }

  /**
   * Set error status for response.
   * 
   * @param response
   *          the response instance
   * @param status
   *          error code
   * @throws IOException
   */
  public static void sendError(HttpServletResponse response, int status) throws IOException
  {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.sendError(status);
  }

  /**
   * Set error status for response.
   * 
   * @param response
   *          the response instance
   * @param status
   *          error code
   * @throws IOException
   */
  public static void sendError(HttpServletResponse response, int status, String errMsg) throws IOException
  {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.sendError(status, errMsg);
  }

  public static void checkDraftValid(DraftDescriptor draftDesc, IDocumentEntry docEntry, UserBean caller)
      throws DraftStorageAccessException, DraftDataAccessException
  {
    JSONObject draftMetadata = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
    if (draftMetadata != null && draftMetadata.isEmpty())
    {
      updateMeta(draftDesc, docEntry, caller);
    }
  }

  private static void updateMeta(DraftDescriptor draftDesc, IDocumentEntry docEntry, UserBean caller) throws DraftDataAccessException
  {
    JSONObject draftMeta = new JSONObject();
    String date = AtomDate.valueOf(Calendar.getInstance()).getValue();
    draftMeta.put(DraftMetaEnum.CUSTOMER_ID.getMetaKey(), ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller));
    draftMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), docEntry.getDocUri());
    draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(docEntry.getModified()).getValue());
    draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), docEntry.getVersion());
    draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), docEntry.getMimeType());
    draftMeta.put(DraftMetaEnum.EXT.getMetaKey(), docEntry.getExtension());
    draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey(), date);
    draftMeta.put(DraftMetaEnum.REPOSITORY_ID.getMetaKey(), docEntry.getRepository());
    draftMeta.put(DraftMetaEnum.TITLE.getMetaKey(), docEntry.getTitle());
    draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey(), caller.getId());
    draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), true);
    draftMeta.put(DraftMetaEnum.DRAFT_CREATED.getMetaKey(), date);
    draftMeta.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), date);
    DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDesc, draftMeta);
  }

  /**
   * Check whether IBM Docs application is available on specified server. Try to change last modified time of status file of specified
   * server, if cannot change it, then the Docs application should be available on that server, otherwise application on the server should
   * be unavailable.
   * 
   * @param serverFullName
   *          specifies the server being checked
   * @return true if the IBM Docs application is available, otherwise false
   */
  public static boolean isDocsAppAvailable(String serverFullName)
  {
    if (serverFullName == null)
    {
      return false;
    }
    if (serverFullName.equals(ServerName.getFullName()))
    {
      // If the checked server is the current server, then return true.
      return true;
    }

    boolean isAvailable = false;
    SmartCloudInitializer scInitializer = null;
    if (Platform.getConcordConfig().isCloud())
      scInitializer = PlatformInitializer.getSmartCloudInitializer();
    if (scInitializer != null && scInitializer.isZookeeperEnabled())
    {
      // check zookeeper status
      isAvailable = scInitializer.isServerAvailable(serverFullName);
    }
    else
    {
      isAvailable = ServiceUtil.checkStatusFile(serverFullName);
    }
    if (isAvailable)
    {
      LOG.log(Level.INFO, "The Docs application is available on server " + serverFullName);
    }
    else
    {
      LOG.log(Level.INFO, "The Docs application is not available on server " + serverFullName);
    }
    return isAvailable;
  }
  
  public static boolean checkStatusFile(String serverFullName)
  {
    boolean isAvailable = false;
    FileInputStream oStatusFileStream = null;
    FileOutputStream nStatusFileStream = null;
    try
    {
      // Try to change the last modified time of the status file to check the locking status.
      String statusFilesDir = ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "status" + File.separator;
      File otherStatusFile = new File(statusFilesDir + serverFullName.replace('\\', '_') + ".lck");
      oStatusFileStream = new FileInputStream(otherStatusFile);

      File myStatusFile = new File(statusFilesDir + ServerName.getFullName().replace('\\', '_') + ".lck");
      nStatusFileStream = new FileOutputStream(myStatusFile);
      nStatusFileStream.write(48);
      nStatusFileStream.flush();

      // If the interval modified time is bigger than 15 seconds, then we think checked server is unavailable.
      isAvailable = (myStatusFile.lastModified() - otherStatusFile.lastModified()) < 15000;
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Exception happens while checking the status of Docs application on server " + serverFullName, ex);
    }
    finally
    {
      try
      {
        if (oStatusFileStream != null)
        {
          oStatusFileStream.close();
        }
      }
      catch (Throwable ex)
      {
        LOG.log(Level.WARNING, "Exception happens while close the other status file stream of Docs application on server "
            + serverFullName, ex);
      }
      try
      {
        if (nStatusFileStream != null)
        {
          nStatusFileStream.close();
        }
      }
      catch (Throwable ex)
      {
        LOG.log(Level.WARNING, "Exception happens while close the my status file stream of Docs application on server " + serverFullName,
            ex);
      }
    }
    return isAvailable;
  
  }
}
