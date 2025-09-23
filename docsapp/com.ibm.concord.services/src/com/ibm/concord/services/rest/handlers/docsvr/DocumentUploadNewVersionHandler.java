/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.servlet.UploadNewVersionAction;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;

public class DocumentUploadNewVersionHandler implements PostHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentUploadNewVersionHandler.class.getName());

  private static final String ATTR_ERROR_CODE = "error_code";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.services.rest.PostHandler#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String syncDraft = request.getParameter("syncdraft");

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    try
    {
      boolean isSyncDraft = Boolean.valueOf(syncDraft);
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, !isSyncDraft);
      if (docEntry == null)
      {
        // not found
        LOGGER.warning(new LogEntry( uri, URLConfig.getRequestID(), URLConfig.getResponseID(), " not found ").toString());
        request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      if (docSrv == null)
      {
        // unsupported document format
        LOGGER.warning(new LogEntry( uri, URLConfig.getRequestID(), URLConfig.getResponseID(), " unsupported document format ")
            .toString());
        request.setAttribute(ATTR_ERROR_CODE, UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      UploadNewVersionAction action = new UploadNewVersionAction(user, docEntry, null, isSyncDraft);
      action.exec(request, response);
      return;
    }
    catch (RepositoryAccessException e)
    {
      int nErrorCode = e.getStatusCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      LOGGER.severe(new LogEntry( uri, URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " RepositoryAccessException error : %s", new Object[] { e })).toString());
      request.setAttribute(ATTR_ERROR_CODE, nErrorCode);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }
}
