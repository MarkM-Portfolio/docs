/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers;

import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocRecentsDAO;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.HeadHandler;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RecentFilesHandler implements GetHandler, HeadHandler
{
  private static final Logger LOG = Logger.getLogger(RecentFilesHandler.class.getName());

  private static final String DOC_ID = "docId";

  private static final String REPO_ID = "repoId";

  private static final String DOC_TITLE = "docTitle";

  private static final String DOC_MIME = "docMime";

  private static final String DOC_EXT = "docExt";

  private static final String DOC_MODIFIED = "docModified";

  public void doHead(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doGet(request, response);
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    String method = request.getParameter("method");
    if (method != null)
    {
      if (method.equalsIgnoreCase("getAll"))
      {
        JSONObject jsonObj = getAllRecentFiles(request);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        jsonObj.serialize(response.getWriter());
        return;
      }
      else if (method.equalsIgnoreCase("getFileStatus"))
      {
        String docId = request.getParameter(DOC_ID);
        String repoId = request.getParameter(REPO_ID);
        JSONObject jsObj = getRecentFileStatus(request, docId, repoId);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        jsObj.serialize(response.getWriter());
        return;
      }
    }
    else
    {
      JSONObject jsonObj = getAllRecentFiles(request);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      jsonObj.serialize(response.getWriter());
      return;
    }
  }

  public static JSONObject parseRecentFilesRequest(HttpServletRequest request)
  {
    return getAllRecentFiles(request);
  }

  private static JSONObject getAllRecentFiles(HttpServletRequest request)
  {
    JSONObject json = new JSONObject();
    JSONArray items = new JSONArray();
    if (supportRecentFiles(request))
    {
      UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
      if (user != null)
      {
        String curRepoId = null;
        String curDocId = null;
        IDocumentEntry curDocEntry = (IDocumentEntry) request.getAttribute("doc_entry");
        if (curDocEntry != null)
        {
          curRepoId = curDocEntry.getRepository();
          curDocId = curDocEntry.getDocId();
        }

        String userId = user.getId();
        IDocRecentsDAO daoRecentFiles = (IDocRecentsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
            IDocRecentsDAO.class);
        String[] filesArray = daoRecentFiles.get(userId);
        for (int i = 0; i < filesArray.length; i++)
        {
          String[] aFileInfoArray = filesArray[i].split("@");
          String docId = aFileInfoArray[0];
          String repoId = aFileInfoArray[1];
          if (docId == null || repoId == null || (docId.equalsIgnoreCase(curDocId) && repoId.equalsIgnoreCase(curRepoId)))
          {// we don't return current editing draft item for suspicious: draft lock compete between EditAction, recent files and upload
           // conversion.
            continue;
          }

          try
          {
            String docTitle = null;
            String docMime = null;
            String docExt = null;
            AtomDate docModified = null;
            // String lastEditorId = null;
            DraftDescriptor dd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(user.getOrgId(), repoId, docId);
            if (DraftStorageManager.getDraftStorageManager(false).isDraftExisted(dd, false))
            {
              JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
              docTitle = (String) draftMeta.get(DraftMetaEnum.TITLE.getMetaKey());
              String modified = (String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey());
              if (modified != null)
              {
                docModified = AtomDate.valueOf(modified);
              }
              docExt = (String) draftMeta.get(DraftMetaEnum.EXT.getMetaKey());
              docMime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
              // lastEditorId = (String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey());
            }
            else
            {
              IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, docId, true);
              docTitle = docEntry.getTitle();
              Calendar modified = docEntry.getModified();
              if (modified != null)
              {
                docModified = AtomDate.valueOf(docEntry.getModified());
              }
              docExt = docEntry.getExtension();
              docMime = docEntry.getMimeType();
              // lastEditorId = docEntry.getModifier()[0];
            }
            JSONObject item = new JSONObject();
            if (docId != null && repoId != null && docTitle != null)
            {
              item.put(DOC_ID, docId);
              item.put(REPO_ID, repoId);
              item.put(DOC_TITLE, docTitle);
              item.put(DOC_MIME, docMime);
              item.put(DOC_EXT, docExt);

              long date = (docModified != null) ? docModified.getTime() : null;
              item.put(DOC_MODIFIED, date);
              items.add(item);
            }
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "Failed to get recent file " + docId + " from repository " + repoId + ". The error is " + e.getMessage()
                + " from " + e);
          }
        }
        json.put("items", items);

        return json;
      }
    }

    json.put("items", items);
    return json;
  }

  private JSONObject getRecentFileStatus(HttpServletRequest request, String docId, String repoId)
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (user != null)
    {
      JSONObject json = new JSONObject();
      json.put("docId", docId);
      json.put("repoId", repoId);

      IDocumentEntry docEntry = null;
      try
      {
        docEntry = DocumentEntryUtil.getEntry(user, repoId, docId, true);
        if (Permission.EDIT.hasPermission(docEntry.getPermission()))
        {
          json.put("status", 0);
        }
        else
        {
          json.put("status", RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
        }
      }
      catch (ConcordException e)
      {
        json.put("status", e.getErrCode());
        LOG.log(Level.SEVERE, "Error to get recent file status.", e);
      }

      return json;
    }
    return null;
  }

  private static boolean supportRecentFiles(HttpServletRequest request)
  {
    IDocumentEntry docEntry = (IDocumentEntry) request.getAttribute("doc_entry");
    String repoId = (docEntry != null) ? docEntry.getRepository() : ConcordUtil.getRepoId((HttpServletRequest) request);
    return RepositoryServiceUtil.supportRecentFiles(repoId);
  }
}
