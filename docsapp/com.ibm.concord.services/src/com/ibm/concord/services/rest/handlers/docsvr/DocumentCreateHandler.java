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

import java.io.IOException;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONObject;

public class DocumentCreateHandler implements PostHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentCreateHandler.class.getName());
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    UserBean user = (UserBean)request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String type = pathMatcher.group(1);
    String repo = request.getParameter("repository");
    String folderUri = request.getParameter("community");
    if (folderUri == null)
    {
      String communityUuid = request.getParameter("communityuuid");
      if (communityUuid != null)
      {
        LOG.log(Level.INFO, "communityuuid is " + communityUuid);
        try
        {
          folderUri = RepositoryServiceUtil.getFolderUri(user, repo, communityUuid);
          LOG.log(Level.INFO, "folderUri is " + folderUri);
        }
        catch (RepositoryAccessException e)
        {
          LOG.log(Level.SEVERE, "Failed to find communityuuid " + communityUuid, e);
          response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }    
      }
    }
    
    if (repo != null && !RepositoryServiceUtil.supportedRepository(repo))
    {
      LOG.log(Level.WARNING, "Do not support this repository type: {0}", repo);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;      
    }
    if (type == null || !DocumentServiceUtil.supportedDocumentService(type))
    {
      LOG.log(Level.WARNING, "Do not support this document type: {0}", type);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    JSONObject jBody = null;
    try
    {
      jBody = JSONObject.parse(request.getReader());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error parsing request body: ", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;      
    }
    
    try
    {
      IDocumentEntry docEntry = DocumentServiceUtil.createDocument(user, type, repo, folderUri, jBody);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Failed to create the document, document type: {0}, document repository: {1}.", new Object[]{type, repo});
        response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }
      
      // set document history
      IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
      IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
      DocHistoryBean dhb = new DocHistoryBean(docEntry.getRepository(), docEntry.getDocUri());
      dhb.setLastModified(docEntry.getModified().getTimeInMillis());
      String orgId = ConcordUtil.retrieveFileOwnerOrgId(docEntry, user);
      dhb.setOrgId(orgId);
      dhb.setDocId(docEntry.getDocId());
      dhb.setVersionSeriesId(docEntry.getVersionSeriesId());
      dhb.setLibraryId(docEntry.getLibraryId());
      dhb.setCommunityId(docEntry.getCommunityId());
      dhb.setAutoPublish(AutoPublishConfig.getAutoPublish());
      dhb.setDLastVisit(Calendar.getInstance().getTime());
      dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
      docHisotryDAO.add(dhb);
      
      JSONObject jo = DocumentEntryHelper.toJSON(docEntry);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      jo.serialize(response.getWriter());
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, e.getErrMsg(), e);
      if (e.getErrCode() == RepositoryAccessException.EC_REPO_OUT_OF_SPACE)
      {
        response.sendError(HttpServletResponse.SC_GONE);
        return;
      }
      else if(e.getErrCode() == RepositoryAccessException.EC_REPO_DUPLICATED_TITLE)
      {
        response.sendError(HttpServletResponse.SC_CONFLICT);
        return;        
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to create the document, document type: {0}, document repository: {1}. Exception: {2}", new Object[] {
            type, repo, e });
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return;
      }
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "Failed to create the document, document type: {0}, document repository: {1}. Exception: {2}", new Object[]{type, repo, e});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error creating document type: " + type, e);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;      
    }
  }
}
