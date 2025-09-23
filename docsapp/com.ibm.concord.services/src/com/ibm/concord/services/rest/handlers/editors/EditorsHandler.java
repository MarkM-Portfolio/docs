/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.editors;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.collaboration.editors.EditorsList;
import com.ibm.concord.collaboration.editors.EditorsListUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class EditorsHandler implements GetHandler, PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(EditorsHandler.class.getName());
  private static final String KEY_EDITORS = "editors";
  
  private void addEditor(HttpServletRequest request, HttpServletResponse response, UserBean user, String repoId, String uri, IDocumentEntry docEntry) throws Exception
  {    
    // Get editor to be added
    JSONObject editorJSON = JSONObject.parse(request.getReader());
    DocumentEditorBean editor = DocumentEditorBean.fromJSON(editorJSON);
    
    if (editor != null)
    {
      editor.setDocId(uri);
      editor.setDocRepoId(repoId);
    }
    else
    {
      LOG.log(Level.WARNING, "Did not contain any editor in request while adding editor.");
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    // Get existing editor list
    EditorsList editorList = EditorsListUtil.getEditorsList(user, docEntry);
    editorList.sortList(user); // need sort it to make sure editor is on top of the list
    int existingEditorIndex = editorList.indexOf(editor);
    DocumentEditorBean resultEditor = null;
    
    if (existingEditorIndex >= 0)
    {
      // if editor exists, return the existing editor, without add
      resultEditor = editorList.get(existingEditorIndex);
    }
    else
    {
      if(editorList.add(editor)) {
        resultEditor = editor;       
        // persist the editors to database
        EditorsList.addEditorToDB(docEntry, resultEditor); 
      }      
    }
    
    // Response
    if (resultEditor != null)
    {
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);

      resultEditor.toJSON().serialize(response.getWriter());
    }
    else
    {
      // This could happen if there is no color can be assigned
      LOG.log(Level.WARNING, "There is no color can be assigned while adding editor.");
      response.sendError(HttpServletResponse.SC_CONFLICT);
    }
  }
  
  private void updateEditorIndicators(HttpServletRequest request, HttpServletResponse response, UserBean user, String repoId, String uri, IDocumentEntry docEntry) throws Exception
  {
    JSONObject json = JSONObject.parse(request.getReader());
    String userId = (String) json.get("userId");
    JSONObject indicators = (JSONObject) json.get("indicators");
    
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IDocumentEditorsDAO.class);
    
    DocumentEditorBean editor = docEditorsDAO.getDocumentEditor(docEntry, userId);
    if(editor != null && editor.getId().equalsIgnoreCase(userId)) {
      if(indicators != null) {
        editor.setIndicators(indicators);
        this.updateCachedIndicators(user, editor, docEntry);
        docEditorsDAO.updateEditorIndicators(editor);
      }
      else {
        LOG.log(Level.WARNING, "The indicators to be updated is null.");
      }
    }
    else {
      LOG.log(Level.WARNING, "The editor bean is null.");
    }
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);    
  }
  
  private void updateEditorIndicator(HttpServletRequest request, HttpServletResponse response, UserBean user, String repoId, String uri, IDocumentEntry docEntry) throws Exception
  {
    JSONObject json = JSONObject.parse(request.getReader());
    String userId = (String) json.get("userId");
    String indicatorId = (String) json.get("indicatorId");
    String indicatorValue = (String) json.get("indicatorValue");
    
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IDocumentEditorsDAO.class);
    
    DocumentEditorBean editor = docEditorsDAO.getDocumentEditor(docEntry, userId);
    if(editor != null && editor.getId().equalsIgnoreCase(userId)) {
      if(indicatorId != null) {
        String oldValue = null;
        JSONObject indicatorsJson = editor.getIndicators();
        if(indicatorsJson == null) {
          indicatorsJson = new JSONObject(); 
        }    
        else {
          oldValue = (String) indicatorsJson.get(indicatorId);
        }        
        if(oldValue == null || !oldValue.equalsIgnoreCase(indicatorValue)) { // need update
          indicatorsJson.remove(indicatorId);
          indicatorsJson.put(indicatorId, indicatorValue);
          editor.setIndicators(indicatorsJson);
          this.updateCachedIndicators(user, editor, docEntry);
          docEditorsDAO.updateEditorIndicators(editor);          
        }
        else {
          LOG.log(Level.WARNING, "The indicator value to be updated is same as the old value.");    
        }
      }
      else {
        LOG.log(Level.WARNING, "The indicator id to be updated is null.");
      }
    }
    else {
      LOG.log(Level.WARNING, "The editor bean is null.");
    }
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);    
  }  
  
  private void updateCachedIndicators(UserBean user,  DocumentEditorBean editor, IDocumentEntry docEntry) {
    EditorsList editorList = EditorsListUtil.getEditorsList(user, docEntry);
    if( editorList != null) {
      DocumentEditorBean bean = editorList.getEditorById(editor.getUserId());  
      if(bean != null) {
        bean.setIndicators(editor.getIndicators()); 
      }                   
    } 
    else
    {
      LOG.log(Level.WARNING, "Falied to update indicator for user {0} in document {1}@{2}", new Object[]{user.getId(), docEntry.getDocUri(), docEntry.getRepository()});
    }
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    this.doPost(request, response);
  }

  /* (non-Javadoc)
   * @see com.ibm.concord.services.rest.PostHandler#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   * This adds an editor to the document's editors list.
   * The JSON expected looks like:
   * {
   *    "userId": "...",
   *    "orgId: "...",
   *    "displayName: "..."
   * }
   * The returned JSON in response represents an editor, see com.ibm.concord.platform.bean.DocumentEditorBean for details.
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    // Get user
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (user == null)
    {
      LOG.log(Level.WARNING, "The user is not authenticated while adding editor.");
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    // Get document
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Can not get the document entry.", e);
    }
    
    if (docEntry == null)
    {
      LOG.log(Level.WARNING, "Did not find the entry of document {0} while adding editor.", uri);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    
    // Check if user has edit access
    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while adding editor.", new Object[]{user.getId(), uri});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    String method = request.getParameter("method");
    
    if(method != null && method.equalsIgnoreCase("updateIndicators")) {
      this.updateEditorIndicators(request, response, user, repoId, uri, docEntry);
    }    
    else if(method != null && method.equalsIgnoreCase("updateIndicator")) {
      this.updateEditorIndicator(request, response, user, repoId, uri, docEntry);
    }
    else {
      this.addEditor(request, response, user, repoId, uri, docEntry);
    }
  }

  /* (non-Javadoc)
   * @see com.ibm.concord.services.rest.GetHandler#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   * This lists all editors of the document.
   * Response is a JSON object looks like:
   * {
   *    editors:
   *    [
   *        {...}, // editor information, see com.ibm.concord.platform.bean.DocumentEditorBean for details
   *        ...... // some other editors
   *    ]
   * }
   */
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    
    // get document entry
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Can not get the document entry.", e);
    }
    
    if (docEntry == null)
    {
      LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting editor list.", uri);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    
    // User must have view access to see editors list
    if (!Permission.VIEW.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have view permission on document {1} while getting editor list.", new Object[]{user.getId(), uri});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    // Get cached editors list, or, get it from the database
    EditorsList editorList = EditorsListUtil.getEditorsList(user, docEntry);  
    editorList.sortList(user);  // need sort it to make sure editor is on top of the list
    // Assemble response into a JSON
    JSONObject json = new JSONObject();
    json.put(EditorsHandler.KEY_EDITORS, editorList.toJSON());
    
    // Response
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    json.serialize(response.getWriter());
  }
}
