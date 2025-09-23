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

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.collaboration.editors.EditorsList;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentHandler implements GetHandler, DeleteHandler, PostHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentHandler.class.getName());
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String method = request.getParameter("method");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    try
    {
      boolean bFromCache = method != null && method.equalsIgnoreCase("getUserList");
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, bFromCache);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while executing method {1}.", new Object[]{uri, method});
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Repository access error happens when getting the entry of document " + uri + " in executing method "
          + method, e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Error happens when getting the entry of document " + uri + " in executing method " + method, e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.VIEW.hasPermission(docEntry.getPermission()))
    {
      LOGGER.log(Level.WARNING, "{0} did not have view permission on document {1} while executing method {2}.", new Object[]{user.getId(), uri, method});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    if (method != null)
    {
      if (method.equalsIgnoreCase("getDetail"))
      {
        JSONObject docJson = DocumentEntryHelper.toJSON(docEntry);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);

        docJson.serialize(response.getWriter());
        return;
      }
      else if (method.equalsIgnoreCase("getUserList"))
      {
        // request to get user list for auto-completion
        String permission = request.getParameter("permission");
        String keyword = request.getParameter("name");
        String usedirectory = request.getParameter("usedirectory");
        String entitlename = request.getParameter("entitlename");
        boolean bUseDirectory = false;
        
        if ((usedirectory != null) && (usedirectory.equalsIgnoreCase("yes")))
           bUseDirectory = true;
               
        JSONArray items = null;
        if (!bUseDirectory)
        {
          try
          {
            items = this.searchEditorList(user, docEntry, permission, keyword, entitlename);
          }
          catch (RepositoryAccessException e1)
          {
            LOGGER.log(Level.SEVERE, "Repository access error happens when search editor list.", e1);
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
          }
        }else{
          items = this.searchProfile(repoId, user, keyword);
        }
        
        JSONObject json = new JSONObject();

        json.put("items", items);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);

        json.serialize(response.getWriter());
        return;
      } else if (method.equalsIgnoreCase("getIsPublished")){
    	JSONObject json = new JSONObject();
        json.put("isPublished", (docEntry.getMediaSize()!=0)/*docEntry.isPublished()*/);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        json.serialize(response.getWriter());  
      }
    }
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
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
    
    // get document bean
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while discarding draft.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }      
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in discarding draft.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in discarding draft.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!docEntry.getCreator()[0].equals(user.getId()))
    {
      LOGGER.log(Level.WARNING, "Only document owner can delete this document.");
      response.sendError(HttpServletResponse.SC_FORBIDDEN, "Only document owner can delete this document!");
      return;
    }
    
    // close document session
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(docEntry);
    if (docSess != null)
    {
      mgr.closeSession(docEntry);
    }
    // clean draft storage
    DocumentServiceUtil.discardDraft(user, docEntry, docSess.getDraftDescriptor());
    response.setStatus(HttpServletResponse.SC_OK);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // get document bean
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while executing post method.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }      
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.WARNING, "Access exception happens while getting the entry of document " + uri + " in executing post method.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in executing post method.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!docEntry.getCreator()[0].equals(user.getId()))
    {
      LOGGER.log(Level.WARNING, "Only document owner can delete this document while executing post method.");
      response.sendError(HttpServletResponse.SC_FORBIDDEN, "Only document owner can delete this document!");
      return;
    }
    
    String method=request.getParameter("method");
    if (method.equalsIgnoreCase("share"))
    {
      JSONObject jsonBody = JSONObject.parse(request.getReader());
      JSONArray shareTo =(JSONArray) jsonBody.get("shareTo");
      for (int i = 0; i < shareTo.size(); i++)
      {
        JSONObject share = (JSONObject)shareTo.get(i);
        String shareMail = (String)share.get("id");
        ACE ace = new ACE(shareMail, Permission.EDIT_SET);
        //RepositoryServiceUtil.share(user, docBean.getDocumentEntry(), ace);
        try
        {
          DocumentEntryUtil.share(user, docEntry, ace);
        }
        catch (RepositoryAccessException e)
        {
          LOGGER.log(Level.SEVERE, "Repository access error happens when sharing to an user.", e);
          if(e.getErrCode() == RepositoryAccessException.EC_REPO_UNSUPPORTED_OPERATION ||
              e.getErrCode() == RepositoryAccessException.EC_REPO_OPERATION_INTENT_RESTRICTED){
            JSONObject json = new JSONObject();
            json.put("status", "error");
            json.put("error_code", e.getStatusCode());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            json.serialize(response.getWriter(), true);         
          }else
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
          return;
        }
      }
      
      LOGGER.log(Level.INFO, new ActionLogEntry(user, Action.SHAREDOC, docEntry.getDocUri(), null).toString());
      
      response.setStatus(HttpServletResponse.SC_OK);
      return;
    }
    
    LOGGER.log(Level.WARNING, "The method {0} is not implemented.", method);
    response.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED);
  }
  
  private JSONArray searchEditorList(UserBean user, IDocumentEntry docEntry, String permission, String keyword, String entitlename) throws RepositoryAccessException
  {
    IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
    IRepositoryAdapter repositoryAdapter = service.getRepository(docEntry.getRepository());
    List<ACE> acl = new ArrayList<ACE>();

    acl = repositoryAdapter.getAllACE(user, docEntry);
    
    boolean showEmail = ConcordUtil.showMailInTypeAhead();

    JSONArray items = new JSONArray();
    JSONArray prefixItems = new JSONArray();
    JSONObject item = new JSONObject();

    // TODO: Filter community member for Connections 3.5 in future.
    String owner = docEntry.getCreator()[0];
    IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)((DirectoryComponent)Platform.getComponent(DirectoryComponent.COMPONENT_ID)).getService(IDirectoryAdapter.class, docEntry.getRepository());
    UserBean ownerBean = directoryAdapter.getById(user, owner);
    if (this.bUserBeanMatch(ownerBean, keyword))
    {
      item.put("name", ownerBean.getDisplayName());
      item.put("userid", ownerBean.getId());
      if (showEmail)
        item.put("member", ownerBean.getEmail());

      item.put("type", 0);// person
      
      prefixItems.add(item);
    }
    IEntitlementService socialService = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class); 
    String defaultEName = IEntitlementService.ENTITLE_NAME_ASSIGNMENT;
    if (permission==null || permission.equals("edit"))
    {
      EditorsList editorList = new EditorsList(user, docEntry);

      List<DocumentEditorBean> userList = new ArrayList<DocumentEditorBean>();
      for (DocumentEditorBean editor : editorList)
      {
        if (!editor.getUserId().equalsIgnoreCase(owner))
        {
          if(this.bUserBeanMatch(editor, keyword))
          {
            userList.add(editor);
          }             
        }
      }

      if (entitlename != null)
      {
        if (IEntitlementService.ENTITLE_NAME_ASSIGNMENT.equalsIgnoreCase(entitlename))
        {
          defaultEName = IEntitlementService.ENTITLE_NAME_ASSIGNMENT;
        }
        else if (IEntitlementService.ENTITLE_NAME_COEDIT.equalsIgnoreCase(entitlename))
        {
          defaultEName = IEntitlementService.ENTITLE_NAME_COEDIT;
        }
        else
        {
          entitlename = null;
        }
      }
      boolean result[] = socialService.isEntitled(userList.toArray(new DocumentEditorBean[0]), defaultEName);
      int size = userList.size();
      for (int index = 0; index < size; index++)
      {
        if(entitlename != null && !result[index]) continue;
        
        DocumentEditorBean userBean = userList.get(index);
        item = new JSONObject();
        item.put("name", userBean.getDisplayName());
        item.put("userid", userBean.getUserId());
        if (showEmail)
          item.put("member", userBean.getEmail());
        item.put("type", 0);// person
        
        prefixItems.add(item);
      }     
    }
    
    if (acl != null)
    {
      for (ACE e : acl)
      {
        if (permission != null)
        { // check if the permission is correct
          boolean bAllowed = true;
          if ((permission.equals("edit")) && (!Permission.EDIT.hasPermission(e.getPermissions())))
            bAllowed = false;
          else if ((permission.equals("read")) && (!Permission.VIEW.hasPermission(e.getPermissions())))
            bAllowed = false;
          
          if (!bAllowed)
          { // if this user does not meet the permission, check if he is in prefixItems
            if (prefixItems != null)
            {
              for (Object existingItem : prefixItems)
              {
                JSONObject theObj = (JSONObject) existingItem;
                Object useridValue = theObj.get("userid");
                Object nameValue = theObj.get("name");
                if ((useridValue != null && useridValue.toString().equalsIgnoreCase(e.getPrincipal()))
                    || (nameValue != null && nameValue.toString().equalsIgnoreCase(e.getPrincipal())))
                {
                  prefixItems.remove(existingItem);
                  break;
                } 
              }                
            }
            continue;
          }
        }      
                  
        UserBean userBean = directoryAdapter.getById(user, e.getPrincipal());
        
        if((userBean != null) && (this.bUserBeanMatch(userBean, keyword)))
        {
          if (prefixItems != null)
          {
              // check if the person has been added in the list
              boolean bFound = false;
              for (Object existingItem : prefixItems)
              {
                JSONObject theObj = (JSONObject) existingItem;
                if (theObj.get("userid").toString().equalsIgnoreCase(e.getPrincipal()) || theObj.get("name").toString().equalsIgnoreCase(e.getPrincipal()))
                {
                  bFound = true;
                  break;
                }
                  
              }
              if (bFound)
                continue;
          }
          if (entitlename == null || socialService.isEntitled(userBean, defaultEName))
          {
            item = new JSONObject();
            item.put("name", userBean.getDisplayName());
            item.put("userid", e.getPrincipal());
            if (showEmail)
              item.put("member", userBean.getEmail());
            item.put("type", 0);// person
            items.add(item);
          }
        }
      }
    }
    
    items.addAll(0, prefixItems);
    
    return items;
  }
  
  private JSONArray searchProfile(String repoId, UserBean user, String keyword)
  {
    IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)((DirectoryComponent)Platform.getComponent(DirectoryComponent.COMPONENT_ID)).getService(IDirectoryAdapter.class, repoId);
    String strReg = keyword;
    if (keyword == null || keyword.length()==0)
      strReg = "*";
    else
      strReg = "*" + keyword +"*";

    List<UserBean> usersFound = directoryAdapter.search(user, strReg);
    
    Comparator<UserBean> comparator = new Comparator<UserBean>(){
      public int compare(UserBean user1, UserBean user2)
      {
        String name1 = (String) user1.getDisplayName();
        String name2 = (String) user2.getDisplayName();
        if ((name1 != null) && (name2 != null))
          return name1.compareToIgnoreCase(name2);
        
        if ((name1 == null) && (name2 != null))
          return -1;
        
        if ((name1 != null) && (name2 == null))
          return 1;
        
        // name1==null && name2==null
        return 0;
      }     
    };
    
    JSONArray items = new JSONArray();

    Collections.sort(usersFound, comparator);
    boolean showEmail = ConcordUtil.showMailInTypeAhead();
    IEntitlementService socialService = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class);
    boolean result[] = socialService.isEntitled(usersFound.toArray(new UserBean[0]), IEntitlementService.ENTITLE_NAME_ASSIGNMENT);
    int size = usersFound.size();
    for (int index = 0; index < size; index++)
    {
      if (!result[index])
        continue;

      UserBean userFound = usersFound.get(index);
      JSONObject item = new JSONObject();
      item.put("name", userFound.getDisplayName());
      item.put("userid", userFound.getId());
      if (showEmail)
        item.put("member", userFound.getEmail());
      item.put("type", 0);// person
      items.add(item);
    }
    
    if ((items.size() == 0) && (keyword.indexOf('@') != -1))
    {
      UserBean userFound = directoryAdapter.getByEmail(user, keyword);
      if (userFound != null && socialService.isEntitled(userFound, IEntitlementService.ENTITLE_NAME_ASSIGNMENT))
      {
        JSONObject item = new JSONObject();
        item.put("name", userFound.getDisplayName());
        item.put("userid", userFound.getId());
        if (showEmail)
          item.put("member", userFound.getEmail());
        item.put("type", 0);// person
        items.add(item);
      }
    }
    
    return items;
  }
  
  private boolean bUserBeanMatch(UserBean user, String keyword)
  {
    boolean bMatch = false;
    if (keyword == null || keyword.length()==0)
      bMatch = true;
    else{
      String lowKeyword = keyword.toLowerCase();
      
      String composedStr = ConcordUtil.compositeDisplayAndEmail(user).toLowerCase();
      if (composedStr.indexOf(lowKeyword)!=-1)
        bMatch = true;
    }
    
    return bMatch;
  }

  private boolean bUserBeanMatch(DocumentEditorBean editor, String keyword)
  {
    boolean bMatch = false;
    if (keyword == null || keyword.length()==0)
      bMatch = true;
    else{
      String lowKeyword = keyword.toLowerCase();
      
      String composedStr = ConcordUtil.compositeDisplayAndEmail(editor).toLowerCase();
      if (composedStr.indexOf(lowKeyword)!=-1)
        bMatch = true;
    }
    
    return bMatch;
  }
}
