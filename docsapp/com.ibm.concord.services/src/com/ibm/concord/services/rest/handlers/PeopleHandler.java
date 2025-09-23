/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.UserPreferenceBean;
import com.ibm.concord.platform.bean.UserSettingsBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IUserPreferenceDAO;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.EntitlementConstants;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.BidiUtilities;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.HeadHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class PeopleHandler implements GetHandler, HeadHandler, PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(PeopleHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String method = request.getParameter("method");
    String userId = null;
    String userDN = null;
    String userEmail = null;
    if (method != null)
    {
      LOG.log(Level.FINEST, new ActionLogEntry(user, Action.SEARCHPEOPLE, "method: [" + method + "]   request: [" + request.getRequestURL() + "]").toString());

      if (method.equalsIgnoreCase("getProfileInfo"))
      {
        userId = request.getParameter("id");

        if (userId == null)
        {
          userId = user.getId();
        }
        
        String repoId = ((HttpServletRequest) request).getHeader("X-DOCS-REPOID");
        IDirectoryAdapter directoryAdapter = null;
        if(repoId != null)
        {
          directoryAdapter = (IDirectoryAdapter)Platform.getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class, repoId);
        }
        else
        {
          directoryAdapter = (IDirectoryAdapter)Platform.getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class);
        }        
        UserBean userFound = directoryAdapter.getById(user, userId);
        if (userFound == null)
        {
          LOG.log(Level.WARNING, "Did not find the user {0}.", userId);
          response.sendError(HttpServletResponse.SC_NOT_FOUND);
          return;
        }
        
        if(!permitQuery(user, userFound))
        {
          LOG.log(Level.WARNING, "The user {0} from org {1} is not permitted to query user {2} from org {3}.", new Object[] { user.getId(), user.getOrgId(), userFound.getId(), userFound.getOrgId()});
          response.sendError(HttpServletResponse.SC_FORBIDDEN);
          return;          
        }
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);

        userFound.toJSON().serialize(response.getWriter());
        return;
      }
      else if (method.equalsIgnoreCase("getProfileInfoByDN"))
      {
    	  userDN = request.getParameter("dn");

          if (userDN == null)
          {
        	  userDN = user.getDistinguishName();
          }
          
          IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)Platform.getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class);
          UserBean userFound = directoryAdapter.getByDN(user, userDN);
          if (userFound == null)
          {
            LOG.log(Level.WARNING, "Did not find the user {0}.", userDN);
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
          }
          
          if(!permitQuery(user, userFound))
          {
            LOG.log(Level.WARNING, "The user {0} from org {1} is not permitted to query user {2} from org {3}.", new Object[] { user.getId(), user.getOrgId(), userFound.getId(), userFound.getOrgId()});
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;          
          }          

          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          response.setStatus(HttpServletResponse.SC_OK);

          userFound.toJSON().serialize(response.getWriter());
          return;
      }
      else if (method.equalsIgnoreCase("getProfileInfoByEmail"))
      {
    	  userEmail = request.getParameter("email");

          if (userEmail == null)
          {
        	  userEmail = user.getEmail();
          }
          
          IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)Platform.getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class);
          UserBean userFound = directoryAdapter.getByEmail(user, userEmail);
          if (userFound == null)
          {
            LOG.log(Level.WARNING, "Did not find the user by his email address.");
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
          }
          
          if(!permitQuery(user, userFound))
          {
            LOG.log(Level.WARNING, "The user {0} from org {1} is not permitted to query user {2} from org {3}.", new Object[] { user.getId(), user.getOrgId(), userFound.getId(), userFound.getOrgId()});
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;          
          }          

          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          response.setStatus(HttpServletResponse.SC_OK);

          userFound.toJSON().serialize(response.getWriter());
          return;
      }
      else if (method.equalsIgnoreCase("searchProfiles"))
      {
        if ("true".equalsIgnoreCase(user.getExternal()))
        {
          LOG.log(Level.WARNING, "no people returned for external user");
          JSONObject json = new JSONObject();
          JSONArray items = new JSONArray();
          json.put("items", items);
          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          response.setStatus(HttpServletResponse.SC_OK);
          json.serialize(response.getWriter());
          return;
        }

        String query = request.getParameter("name");
        
        IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)Platform.getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class);
        List<UserBean> usersFound = directoryAdapter.search(user, query);

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
        
        Collections.sort(usersFound, comparator); 
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        
        JSONObject json = new JSONObject();
        JSONArray items = new JSONArray();

        boolean showEmail = ConcordUtil.showMailInTypeAhead();


        String bidiTextDir = request.getParameter(BidiUtilities.TEXT_DIR_PROP);
        
        for (UserBean userFound : usersFound)
        {
          if ("true".equalsIgnoreCase(userFound.getExternal()) || !permitQuery(user, userFound))
          {
            LOG.log(Level.INFO, "Ignored external user or user from different organization when search profiles.");
            continue;
          }

          JSONObject item = new JSONObject();
          if (showEmail)
          {
            userFound.setProperty(BidiUtilities.TEXT_DIR_PROP, bidiTextDir);
            item.put("name", ConcordUtil.compositeDisplayAndEmail(userFound));
          }
          else
          {
            item.put("name", userFound.getDisplayName());
          }

          item.put("value",userFound.getId());
          items.add(item);
        }
        if(items.size() == 0)
        {
          LOG.log(Level.WARNING, "no people find, please check your input");
        }
        json.put("items", items);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter());
        return;
      }
      else if (method.equalsIgnoreCase("getPreferenceInfo"))
      {
        String docType = request.getParameter("docType");
        JSONObject json = getRequestUserSettings(request, docType);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        json.serialize(response.getWriter());
        return;
      }
    }
    else 
    {
      JSONObject json = parseUser(request, user);
      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter());
    }
  }
  
  public void doHead(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doGet(request, response);
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (user == null)
    {
      LOG.log(Level.WARNING, "fobid to access, status code is " + HttpServletResponse.SC_FORBIDDEN);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    IUserPreferenceDAO prefDAO = (IUserPreferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IUserPreferenceDAO.class);
    String id = user.getId();

    String method = request.getParameter("method");
    if (method != null && method.length() > 0)
    {
      BufferedReader reader = request.getReader();
      StringBuilder content = new StringBuilder();
      int numRead = 0;
      char[] bytes = new char[1024];
      while ((numRead = reader.read(bytes)) >= 0)
      {
        content.append(new String(bytes, 0, numRead));
      }
      String strData = content.toString();

      UserPreferenceBean bean = prefDAO.getById(id, method); // userid+prop_key TODO
      if (bean == null)
      {
        bean = new UserPreferenceBean();
        bean.setUserId(id);
        bean.setProp_key(method);
        bean.setProp_value(strData);
        if (!prefDAO.add(bean))
        {
          LOG.log(Level.WARNING, "Could not add the user preference bean while doing {0}.", method);
          response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
          return;
        }
      }
      else
      {
        bean.setUserId(id);
        bean.setProp_key(method);
        bean.setProp_value(strData);
        if (!prefDAO.update(bean))
        {
          LOG.log(Level.WARNING, "Could not update user preference bean while doing {0}.", method);
          response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
          return;   
        }
      }
    }
    else
    {
      // preference is obsolete, need drop it in the future.
      JSONObject peopleJSON = JSONObject.parse(request.getReader());

      JSONObject prefJSON = (JSONObject) peopleJSON.get("preference");
      if (prefJSON == null)
      {
        LOG.log(Level.WARNING, "Request body does not include the preference information while updating user preference.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }

      UserPreferenceBean prefBean = prefDAO.getById(id, ""); // userid+prop_key TODO
      if (prefBean == null)
      {
        prefBean = new UserPreferenceBean();
        prefBean.setUserId(id);
        prefDAO.add(prefBean);
      }

      prefBean.setPreference(prefJSON.toString().getBytes());
      if (!prefDAO.update(prefBean))
      {
        LOG.log(Level.WARNING, "Could not update preference bean while updating user preference.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }
    }

    LOG.log(Level.FINEST, "People information updated or added in database and userbean");
    /*
    IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
        IJournalAdapter.class);
    JournalHelper.Actor a = new JournalHelper.Actor(user.getEmail(), user.getId(), user.getCustomerId());
    JournalHelper.Entity jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.USER, user.getDisplayName(), user.getId(), user.getCustomerId());
    journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_USERPREFERENCE, a, JournalHelper.Action.UPDATE, jnl_obj,
        JournalHelper.Outcome.SUCCESS).build());
    response.setStatus(HttpServletResponse.SC_OK);
    */
    
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPut(request, response);
  }
  
  public static JSONObject parseUser(HttpServletRequest request, UserBean user)
  {
    JSONObject json = user.toJSON();

    IUserPreferenceDAO prefDAO = (IUserPreferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IUserPreferenceDAO.class);
    UserPreferenceBean prefBean = prefDAO.getById(user.getId(), "");//userid + prop_key TODO
    if (prefBean != null && prefBean.getPreference() != null)
    {
      byte[] prefBytes = prefBean.getPreference();
      JSONObject prefJson = null;
      try
      {
        prefJson = JSONObject.parse(new String(prefBytes));
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "parsing preference io error.", e);
      }
      json.put("preference", prefJson);
    }

    IEntitlementService entitlementSvr = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IEntitlementService.class);
    EntitlementLevel entitlementLevel = entitlementSvr.getEntitlementLevel(user);
    json.put("entitlement", entitlementLevel.ordinal());
    
    boolean isEntitled = request.isUserInRole(EntitlementConstants.USER_ROLE_ENTITLED);
    isEntitled = isEntitled || request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_1) || request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_2) || request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_3);
    json.put("entitlement_allowed", isEntitled);

    return json;
  }
  
  public static JSONObject parseRequestUser(HttpServletRequest request)
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    return parseUser(request, user);
  }

  public static JSONObject getRequestUserSettings(HttpServletRequest request, String docType)
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);    
    UserSettingsBean bean = new UserSettingsBean(user, docType);

    return bean.toJson();
  }   
  
  private boolean permitQuery(UserBean queryer, UserBean found)
  {
    String queryerOrg = queryer.getOrgId();
    String queryOrg = found.getOrgId();
    if(queryerOrg == null || queryOrg == null || queryerOrg.length() == 0 || queryOrg.length() == 0)
    {
      return true;
    }
    
    if(queryerOrg.equalsIgnoreCase(queryOrg))
    {
      return true;
    }
    
    return false;
  }
}
