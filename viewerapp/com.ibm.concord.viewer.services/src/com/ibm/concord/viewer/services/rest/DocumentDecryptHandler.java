/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2019. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.servlet.DecryptAction;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class DocumentDecryptHandler implements PostHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentDecryptHandler.class.getName());

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private static final String ATTR_ERROR_CODE = "error_code";

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.viewer.services.rest.PostHandler#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String modified = request.getParameter("version");
    String password = request.getParameter("docpwd");

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    IDocumentEntry docEntry;
    try
    {
      StringBuffer msg;
      docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri, modified, true);
      if (docEntry == null)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_GET_DOC_ENTRY);
        msg.append(" . Document ");
        msg.append(uri);
        msg.append(" is not found");
        LOGGER.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.ERROR_GET_DOC_ENTRY, msg.toString())).toString());
        // not found
        request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      if (!docEntry.hasViewPermission())
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_INFO_NO_VIEW_PERMISSION);
        msg.append(" No permission to view ");
        msg.append(docEntry.getDocUri());
        LOGGER.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.INFO_NO_VIEW_PERMISSION, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOVIEWPERMISSION);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      if (docSrv == null)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
        msg.append("The MIME type of ");
        msg.append(docEntry.getDocUri());
        msg.append(" is " + docEntry.getMimeType());
        LOGGER.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      LOGGER.info("DecryptAction will handle the decryption work for Viewer.");
      DecryptAction action = new DecryptAction(user, docEntry, password);
      action.exec(request, response);
    }
    catch (Exception e)
    {
      JSONObject json = packageGetDocEntryError(e);
      json.serialize(response.getWriter(), true);
    }

  }

  /**
   * Package the exception happens when getting the document entry into a JSON object.
   * 
   * @param exception
   *          specifies the exception happens when getting the document entry
   * @return the packaged JSON object
   */
  private JSONObject packageGetDocEntryError(Exception exception)
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    if (exception instanceof RepositoryAccessException)
    {
      int nErrorCode = ((RepositoryAccessException) exception).getStatusCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      json.put("error_code", nErrorCode);
      json.put("error_msg", exception.getMessage());
    }
    return json;
  }
}
