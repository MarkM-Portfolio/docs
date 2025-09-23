/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.servlet;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.config.ViewerConfig.ConvertType;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.news.INewsHandler;
import com.ibm.concord.viewer.spi.news.INewsHandler.EventType;

/**
 * @author zhouqf@cn.ibm.com
 * 
 */
public class NewsEventServlet extends HttpServlet
{
  private static final String REQUEST = "request";

  private static final String REPOSITORY = "repository";

  public static final String EXTENSION = "extension";

  private static final Logger log = Logger.getLogger(NewsEventServlet.class.getName());

  private static final long serialVersionUID = 6476845491217397521L;

  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)");

  public NewsEventServlet()
  {
  }

  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    Matcher matcher = pathPattern.matcher(request.getPathInfo());
    Matcher result = matcher.matches() ? matcher : null;
    if (result == null)
    {
      log.log(Level.WARNING, "Failed to parse upload request. {0}", request.getRequestURI());
    }

    String repoId = result.group(1);
    String docUri = result.group(2);

    String type = (String) request.getParameter(REQUEST);
    EventType req = EventType.valueOf(type);
    if (req == null)
    {
      throw new IllegalStateException("Invalid request: " + type + ". Doc id: " + docUri);
    }
    else if (req == EventType.IGNORE)
    {
      log.log(Level.WARNING, "Unknown type of event is receieved and ignored. DocUri: " + docUri);
      return;
    }

    if (req == EventType.UPLOAD_FILE && !Platform.getViewerConfig().doUploadConvert(ConvertType.VIEW))
    {
      // either GENERATE_THUMBNAIL or UPLOAD_CONVERSION
      // if UPLOAD_CONVERSION is disabled, change it to GENERATE_THUMBNAIL
      log.log(Level.FINE, "Viewer cache upload conversion is disalbed, change to thumbnail type.  Doc id: {0}.", docUri);
      req = EventType.GENERATE_THUMBNAIL;
    }

    IDocumentEntry docEntry = null;
    IDocumentService docSrv = null;
    try
    {
      INewsHandler handler = getNewsHandler(repoId, docUri, req, request);
      docEntry = handler.getDocumentEntry();

      // If the doc entry cannot be accessed then return;
      if (docEntry == null)
      {
        StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_GET_DOC_ENTRY);
        msg.append(" . Document ");
        msg.append(docUri);
        msg.append(" is not found");
        log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_GET_DOC_ENTRY, msg.toString()));
        return;
      }
      if (docEntry.isEncrypt())
      {
        StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_INFO_DOCUMENT_ENCRYPTED);
        msg.append(docEntry.getDocId());
        msg.append(" is encrypted");
        log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.INFO_DOCUMENT_ENCRYPTED, msg.toString()));
        return;
      }

      String mime = docEntry.getMimeType();
      docSrv = DocumentServiceUtil.getDocumentService(mime);
      // If the document service for such Mime Type cannot be accessed then return. Purge cache event is excluded.
      if (req != EventType.PURGE_ALL && req != EventType.PURGE_VERSION && req != EventType.PURGE_SANITY && docSrv == null
          && (!repoId.equals(RepositoryServiceUtil.ECM_FILES_REPO_ID) || !DocumentTypeUtils.isImage(docEntry.getExtension())))
      {
        StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
        msg.append("The MIME type of ");
        msg.append(docEntry.getDocUri());
        msg.append(" is ");
        msg.append(mime == null ? "null" : mime);
        log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
        return;
      }
      handler.processNewsEvent();
    }
    catch (Exception e)
    {
      StringBuffer msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
      log.log(Level.WARNING, e.getMessage(), e);
      log.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString()));
    }
    finally
    {
      response.getWriter().write("OK");
    }
  }

  private INewsHandler getNewsHandler(String repoId, String docId, EventType type, HttpServletRequest request)
      throws RepositoryAccessException
  {
    if (repoId.equals(RepositoryServiceUtil.ECM_FILES_REPO_ID))
    {
      if (DocumentTypeUtils.isImage(request.getParameter(EXTENSION)))
        return new ECMNewsHandler4Img(request, type, docId);
      return new ECMNewsHandler4Doc(request, type, docId);
    }
    else if (repoId.equals(RepositoryServiceUtil.TOSCANA_REPO_ID) || repoId.equals(RepositoryServiceUtil.SANITY_REPO_ID)) {
      return new ThirdPartyFilesNewsHandler(request, type, docId, repoId);
    }
    else
    {
      return new LCFilesNewsHandler(request, type, docId, repoId);
    }
  }
  // private boolean verifyDynamicToken(HttpServletRequest request)
  // {
  // String docId = (String) request.getParameter(DOCUMENT);
  // String modified = (String) request.getParameter(MODIFIED);
  // // String relativePath = (String) request.getParameter(RELATIVEPATH);
  // String token = (String) request.getParameter("dynamicToken");
  // String ownToken = generateToken(docId, modified);
  // if (token.equals(ownToken))
  // {
  // log.log(Level.FINER, "Verified token. docId = {0} modified = {1}", new Object[] { docId, modified });
  // return true;
  // }
  // else
  // {
  // log.log(Level.WARNING, "Invalid token. docId = {0} modified = {1}", new Object[] { docId, modified });
  // return false;
  // }
  // }

  // private String generateToken(String docId, String modified)
  // {
  // String key = docId + modified;
  // try
  // {
  // byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(key.getBytes());
  //
  // StringBuffer value = new StringBuffer();
  // for (int i = 0; i < rawMD5.length; i++)
  // {
  // String hex = Integer.toHexString(0xFF & rawMD5[i]);
  // if (hex.length() == 1)
  // {
  // value.append('0');
  // }
  // value.append(hex);
  // }
  // // log.log(Level.FINER, "Dynamic token of [" + key + "]: " + value.toString());
  // return value.toString();
  // }
  // catch (NoSuchAlgorithmException e)
  // {
  // log.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash cache descriptor directory failed. {0}", e);
  // throw new IllegalArgumentException(e);
  // }
  // }
}
