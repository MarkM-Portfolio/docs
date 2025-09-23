/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.servlet;

import java.io.IOException;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.document.services.DocumentURLBuilder;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.MalformedRequestException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class NewDocumentServlet extends HttpServlet
{
  private static final Logger LOG = Logger.getLogger(NewDocumentServlet.class.getName());

  private static final long serialVersionUID = 7115607687902434761L;

  private static final String ATTR_ERROR_CODE = "error_code";

  private static final String ATTR_CORRECT_FORMAT = "correct_format";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String repo = request.getParameter("repository");
    String type = request.getParameter("type");
    String template_repo = request.getParameter("template_repo");
    String template_uri = request.getParameter("template_uri");
    String raw_doc_title = request.getParameter("doc_title");
    String externalValue = request.getParameter("isExternal");
    String contextType = request.getParameter("contextType");
    String contextValue = request.getParameter("contextValue");
    String contextFolder = request.getParameter("contextFolder");
    String doc_title = null;
    if (raw_doc_title != null)
    {
      doc_title = new String(raw_doc_title.getBytes("ISO-8859-1"), "UTF-8");
    }
    boolean isExternal = false;// by default, it is false
    if ("true".equalsIgnoreCase(externalValue))
    {
      isExternal = true;
    }
    if (contextType == null)
    {
      contextType = "";
    }
    if (contextValue == null)
    {
      contextValue = "";
    }
    if (contextFolder == null)
    {
      contextFolder = "";
    }
    JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    try
    {
      String folderUri = request.getParameter("community");
      if (folderUri == null)
      {
        String communityUuid = request.getParameter("communityuuid");
        if (communityUuid != null)
        {
          LOG.log(Level.INFO, "communityuuid is " + communityUuid);
          folderUri = RepositoryServiceUtil.getFolderUri(user, repo, communityUuid);
          LOG.log(Level.INFO, "folderUri is " + folderUri);
        }
      }
      if (folderUri == null)
      {
        contextType = "";
        contextValue = "";
      }
      if (repo != null && !RepositoryServiceUtil.supportedRepository(repo))
      {
        // malformed request
        throw new MalformedRequestException("The request is not an valid one.");
      }
      if (type == null || !DocumentServiceUtil.supportedDocumentService(type))
      {
        // malformed request
        throw new MalformedRequestException("The request is not an valid one.");
      }

      if (template_uri != null)
      {
        // create a new document from a template file
        if (template_repo == null)
        {
          template_repo = RepositoryServiceUtil.getDefaultRepositoryId();
        }
        IDocumentEntry entry = DocumentEntryUtil.getEntry(user, template_repo, template_uri, false);
        if (!Permission.VIEW.hasPermission(entry.getPermission()))
        {
          // no view access
          throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOVIEWPERMISSION);
        }
        IDocumentService docSrv = DocumentServiceUtil.getDocumentService(entry.getMimeType());
        JSONObject data = new JSONObject();
        if (doc_title != null)
        {
          data.put("newTitle", doc_title);
        }
        data.put("isExternal", isExternal);
        data.put("contextType", contextType);
        data.put("contextValue", contextValue);
        data.put("contextFolder", contextFolder);

        IDocumentEntry newEntry = docSrv.createDocumentFromTemplate(user, entry, template_repo, folderUri, data);

        IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
            IJournalAdapter.class);
        JournalHelper.Actor a = new JournalHelper.Actor(user.getEmail(), user.getId(), user.getCustomerId());
        JournalHelper.Entity jnl_obj = null;
        if (newEntry == null)
        {
          jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, "", "", "");
        }
        else
        {
          jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, newEntry.getTitleWithExtension(), newEntry.getDocId(),
              user.getCustomerId());
        }
        journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_EDITOR, a, JournalHelper.Action.CREATE, jnl_obj,
            (newEntry == null) ? JournalHelper.Outcome.FAILURE : JournalHelper.Outcome.SUCCESS).build());

        // set document history
        if (newEntry != null)
        {
          IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
          IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);

          String repId = newEntry.getRepository();
          String docUri = newEntry.getDocUri();
          if (docHisotryDAO.get(repId, docUri) == null)
          {
            DocHistoryBean dhb = new DocHistoryBean(repId, docUri);
            dhb.setLastModified(newEntry.getModified().getTimeInMillis());
            String orgId = ConcordUtil.retrieveFileOwnerOrgId(newEntry, user);
            dhb.setOrgId(orgId);
            dhb.setDocId(newEntry.getDocId());
            dhb.setVersionSeriesId(newEntry.getVersionSeriesId());
            dhb.setLibraryId(newEntry.getLibraryId());
            dhb.setCommunityId(newEntry.getCommunityId());
            dhb.setAutoPublish(AutoPublishConfig.getAutoPublish());
            dhb.setDLastVisit(Calendar.getInstance().getTime());
            dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
            docHisotryDAO.add(dhb);
          }
        }

        String newDocUri = DocumentURLBuilder.getEditDocumentURI(newEntry);
        // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
        HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
        response.sendRedirect(response.encodeRedirectURL(newDocUri));
        return;
      }

      IDocumentEntry docEntry = DocumentServiceUtil.createDocument(user, type, repo, folderUri, null);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Could not create a new {0} document in repository {1}.", new Object[] { type, repo });
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
      dhb.setAutoPublish(AutoPublishConfig.getAutoPublish());
      dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
      docHisotryDAO.add(dhb);

      String redirectUri = DocumentURLBuilder.getEditDocumentURI(docEntry);
      // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      response.sendRedirect(response.encodeRedirectURL(redirectUri));
    }
    catch (ConversionException e)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" ConversionException : %s . ",
          new Object[] { e })).toString());
      request.setAttribute(ATTR_ERROR_CODE, e.getErrCode());
      String format = (String) e.getData().get("correctFormat");
      if (format != null && !"".equals(format) && !"unsupported null".equals(format))
      {
        request.setAttribute(ATTR_CORRECT_FORMAT, format);
      }
      // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
    catch (MalformedRequestException e)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" MalformedRequestException : %s . ",
          new Object[] { e })).toString());
      request.setAttribute(ATTR_ERROR_CODE, e.getErrorCode());
      // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
    catch (RepositoryAccessException e)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" RepositoryAccessException : %s . ",
          new Object[] { e })).toString());
      request.setAttribute(ATTR_ERROR_CODE, e.getStatusCode());
      // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
    catch (UnsupportedMimeTypeException e)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" UnsupportedMimeTypeException : %s . ",
          new Object[] { e })).toString());
      request.setAttribute(ATTR_ERROR_CODE, e.getErrorCode());
      // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);

      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
    catch (Exception e)
    {
      // String problemId = ConcordUtil.generateProblemId();
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" problem id %s and Exception : %s . ",
          new Object[] { URLConfig.getRequestID(), e })).toString());
      // unknown error
      // request.setAttribute("problem_id", problemId);
      // HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }
}
