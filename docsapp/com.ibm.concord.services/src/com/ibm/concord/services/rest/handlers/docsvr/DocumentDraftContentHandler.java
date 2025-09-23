/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArray;

public class DocumentDraftContentHandler implements GetHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentDraftContentHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, e.getErrMsg(), e);
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while getting draft.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
      else
      {
        LOGGER.log(Level.WARNING, "Error happens when getting the entry of document {0} while getting draft.", uri);
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }
    }

    DocumentSession docSess = SessionManager.getInstance().getSession(repoId, docEntry.getDocUri());
    DraftDescriptor dd = null;
    if (docSess == null)
    {
      dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
          docEntry.getRepository(), docEntry.getDocUri());
    }
    else
    {
      // autosave to update last modified date
      docSess.autoSave();
      dd = docSess.getDraftDescriptor();
    }

    if (DraftStorageManager.getDraftStorageManager().isDraftExisted(dd))
    {
      File draftFile = null;
      InputStream draftMediaStream = null;
      try
      {
        String tmpDraftMediaUri = DraftStorageManager.getDraftStorageManager().getDraftMedia(dd);
        LOGGER.log(Level.INFO, "Save draft of document " + docEntry.getDocUri() + " to " + tmpDraftMediaUri);
        draftFile = new File(tmpDraftMediaUri);
        response.setContentType(Platform.getMimeType(".zip"));
        response.setHeader("Content-Length", Long.valueOf(draftFile.length()).toString());
        response.setHeader("Content-disposition", ServiceUtil.getDocumentContentDispositionValue(request, docEntry, "zip"));
        response.setHeader("X-Content-Type-Options", "nosniff");
//        HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
        JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
        HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
        response.setStatus(HttpServletResponse.SC_OK);
        draftMediaStream = new BufferedInputStream(new FileInputStream(draftFile));
        OutputStream os = response.getOutputStream();
        int numRead = -1;
        byte[] data = new byte[8192];
        while ((numRead = draftMediaStream.read(data)) > 0)
        {
          os.write(data, 0, numRead);
        }
      }
      catch (Exception e)
      {
        LOGGER.log(Level.WARNING, "Error occurs when getting draft of document " + docEntry.getDocUri(), e);
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      }
      finally
      {
        if (draftMediaStream != null)
          draftMediaStream.close();

        if (draftFile != null)
          draftFile.delete();
      }
      return;
    }
    else
    {
      LOGGER.log(Level.WARNING, "The draft of document {0} does not exist while getting draft.", docEntry.getDocUri());
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
  }

}
