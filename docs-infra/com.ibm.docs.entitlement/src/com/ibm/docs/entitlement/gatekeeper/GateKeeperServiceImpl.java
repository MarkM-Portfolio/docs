/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.entitlement.gatekeeper;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.bean.DocEBean;
import com.ibm.docs.entitlement.bean.OrgEBean;
import com.ibm.docs.entitlement.bean.UserEBean;
import com.ibm.docs.entitlement.dao.IDocEntitlementDAO;
import com.ibm.docs.entitlement.dao.IOrgEntitlementDAO;
import com.ibm.docs.entitlement.dao.IUserEntitlementDAO;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

public class GateKeeperServiceImpl implements IGateKeeperService
{
  private static final String CLASS_NAME = GateKeeperServiceImpl.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS_NAME);

  @Override
  public GateKeeperEntitlement queryGlobalFeatures() throws AccessException
  {
    List<DocEBean> beanList = queryEntitlementLevelByName(IGateKeeperService.GLOBAL_LEVEL_NAME);
    if (beanList.size() == 1)
    {
      return new GateKeeperEntitlement(beanList.get(0));
    }
    else if (beanList.size() > 1)
    {
      throw new AccessException("Serious problem - multiple database records for the global entitlement!");
    }
    return null;
  }

  @Override
  public boolean entitleGlobalFeatures(Map<String, String> featuresMap) throws AccessException
  {
    GateKeeperEntitlement bean = queryGlobalFeatures();
    if (bean == null)
    {
      JSONObject tmp = new JSONObject();
      Iterator<String> itf = featuresMap.keySet().iterator();
      while (itf.hasNext())
      {
        String featureId = itf.next();
        String featureValue = featuresMap.get(featureId);
        JSONObject gValue = getFeaturesAsJson(featureValue);
        tmp.put(featureId, gValue);
      }
      LOG.log(Level.INFO, "It is the first time to entitle global features. " + tmp.toString());
      addEntitlementLevel(IGateKeeperService.GLOBAL_LEVEL_NAME, tmp.toString());
      return true;
    }
    else
    {
      String levelId = bean.getLevelId();
      String features = bean.getFeatures();
      JSONObject gValue = getFeaturesAsJson(features);
      if (gValue != null)
      {
        Iterator<String> itf = featuresMap.keySet().iterator();
        while (itf.hasNext())
        {
          String featureId = itf.next();
          String featureValue = featuresMap.get(featureId);
          gValue.put(featureId, getFeaturesAsJson(featureValue));
        }
        LOG.log(Level.INFO, "The global entitlement features have been changed. " + gValue.toString());
        IDocEntitlementDAO dao = getDocEntitlementDAO();
        return dao.update(new DocEBean(levelId, IGateKeeperService.GLOBAL_LEVEL_NAME, gValue.toString()));
      }
    }
    return false;
  }

  @Override
  public boolean removeGlobalEntitlementFeatures(List<String> featureIds) throws AccessException
  {
    GateKeeperEntitlement bean = queryGlobalFeatures();
    if (bean == null)
    {
      throw new IllegalArgumentException("Delete Failed - The global entitlement features do not exist yet.");
    }
    else
    {
      String levelId = bean.getLevelId();
      String features = bean.getFeatures();
      JSONObject gValue = getFeaturesAsJson(features);
      if (gValue != null)
      {
        Iterator<String> itf = featureIds.iterator();
        while (itf.hasNext())
        {
          String featureId = itf.next();
          if (gValue.containsKey(featureId))
          {
            gValue.remove(featureId);
            LOG.log(Level.INFO, "The global entitlement feature {0} has been removed.", new Object[] { featureId });
          }
          else
          {
            LOG.log(Level.INFO, "Delete Failed - The global entitlement feature {0} does not exist.", new Object[] { featureId });
            throw new IllegalArgumentException("Delete Failed because the following feature id does not exist - " + featureId);
          }
        }
        LOG.log(Level.INFO, "The global entitlement features have been changed. " + gValue.toString());
        IDocEntitlementDAO dao = getDocEntitlementDAO();
        return dao.update(new DocEBean(levelId, IGateKeeperService.GLOBAL_LEVEL_NAME, gValue.toString()));
      }
    }
    return false;
  }

  @Override
  public boolean turnOnOffGlobalEntitlementFeatures(Map<String, Boolean> fMap) throws AccessException
  {
    GateKeeperEntitlement bean = queryGlobalFeatures();
    if (bean == null)
    {
      throw new IllegalArgumentException("Turn OnOff features Failed because the global entitlement features do not exist yet.");
    }
    else
    {
      String levelId = bean.getLevelId();
      String features = bean.getFeatures();
      JSONObject gValue = getFeaturesAsJson(features);
      if (gValue != null)
      {
        Iterator<String> itf = fMap.keySet().iterator();
        while (itf.hasNext())
        {
          String featureId = itf.next();
          Boolean enabled = fMap.get(featureId);
          if (gValue.containsKey(featureId))
          {
            JSONObject fVObj = (JSONObject) gValue.get(featureId);
            if (fVObj != null)
            {
              fVObj.put(FEATURE_STATUS, enabled);
              LOG.log(Level.INFO, "The enabled status of global entitlement feature {0} is {1} now.", new Object[] { featureId, enabled });
            }
          }
          else
          {
            LOG.log(Level.INFO, "Failed to change enabled status to {0} because the global entitlement feature {1} does not exist.",
                new Object[] { enabled, featureId });
            throw new IllegalArgumentException("Fail to change enabled status because the following feature id does not exist - "
                + featureId);
          }
        }
        LOG.log(Level.INFO, "The global entitlement features have been changed. " + gValue.toString());
        IDocEntitlementDAO dao = getDocEntitlementDAO();
        return dao.update(new DocEBean(levelId, IGateKeeperService.GLOBAL_LEVEL_NAME, gValue.toString()));
      }
    }
    return false;
  }

  @Override
  public String addEntitlementLevel(String levelName, String features) throws AccessException
  {
    LOG.entering(CLASS_NAME, "addEntitlementLevel", new Object[] { levelName, features });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    DocEBean bean = new DocEBean(levelName, features);
    boolean success = dao.add(bean);

    LOG.exiting(CLASS_NAME, "addEntitlementLevel", new Object[] { success });
    return success ? bean.getLevelid() : null;
  }

  @Override
  public boolean deleteEntitlementLevel(String levelId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "deleteEntitlementLevel", new Object[] { levelId });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    boolean success = dao.deleteByLevelId(levelId);

    LOG.exiting(CLASS_NAME, "deleteEntitlementLevel", new Object[] { success });
    return success;
  }

  @Override
  public boolean updateEntitlementLevel(String levelId, String features) throws AccessException
  {
    LOG.entering(CLASS_NAME, "updateEntitlementLevel", new Object[] { levelId, features });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    boolean success = dao.update(new DocEBean(levelId, null, features));

    LOG.exiting(CLASS_NAME, "updateEntitlementLevel", new Object[] { success });
    return success;
  }

  @Override
  public GateKeeperEntitlement getUserEntitlementLevel(String userId, String orgId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "getUserEntitlementLevel", new Object[] { userId, orgId });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    DocEBean bean = dao.getByUser(userId, orgId);

    LOG.exiting(CLASS_NAME, "getUserEntitlementLevel", new Object[] { bean });
    return (bean != null) ? new GateKeeperEntitlement(bean) : null;
  }

  @Override
  public boolean addUserEntitlementLevel(String userId, String orgId, String levelId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "setUserEntitlementLevel", new Object[] { userId, orgId, levelId });

    IUserEntitlementDAO dao = getUserEntitlementDAO();
    UserEBean ubean = new UserEBean(userId, orgId, levelId);
    boolean success = dao.add(ubean);

    LOG.exiting(CLASS_NAME, "setUserEntitlementLevel", new Object[] { success });
    return success;
  }

  @Override
  public boolean updateUserEntitlementLevel(String userId, String orgId, String levelId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "updateUserEntitlementLevel", new Object[] { userId, orgId, levelId });

    IUserEntitlementDAO dao = getUserEntitlementDAO();
    UserEBean ubean = new UserEBean(userId, orgId, levelId);
    boolean success = dao.update(ubean);

    LOG.exiting(CLASS_NAME, "updateUserEntitlementLevel", new Object[] { success });
    return success;
  }

  @Override
  public GateKeeperEntitlement getOrgEntitlementLevel(String orgId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "getOrgEntitlementLevel", new Object[] { orgId });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    DocEBean bean = dao.getByOrg(orgId);

    LOG.exiting(CLASS_NAME, "getOrgEntitlementLevel", new Object[] { bean });
    return (bean != null) ? new GateKeeperEntitlement(bean) : null;
  }

  @Override
  public boolean addOrgEntitlementLevel(String orgId, String orgName, String levelId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "setOrgEntitlementLevel", new Object[] { orgId, orgName, levelId });

    IOrgEntitlementDAO dao = getOrgEntitlementDAO();
    OrgEBean obean = new OrgEBean(orgId, orgName, levelId);
    boolean success = dao.add(obean);

    LOG.exiting(CLASS_NAME, "setOrgEntitlementLevel", new Object[] { success });
    return success;
  }

  @Override
  public boolean updateOrgEntitlementLevel(String orgId, String orgName, String levelId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "updateOrgEntitlementLevel", new Object[] { orgId, orgName, levelId });

    IOrgEntitlementDAO dao = getOrgEntitlementDAO();
    OrgEBean obean = new OrgEBean(orgId, orgName, levelId);
    boolean success = dao.update(obean);

    LOG.exiting(CLASS_NAME, "updateOrgEntitlementLevel", new Object[] { success });
    return success;
  }

  @Override
  public List<DocEBean> queryEntitlementLevelByName(String levelName) throws AccessException
  {
    if (levelName == null)
      throw new IllegalArgumentException("Entitlement level name can not be empty");

    LOG.entering(CLASS_NAME, "queryEntitlementLevelByName", new Object[] { levelName });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    List<DocEBean> beanList = dao.getByUniqueName(levelName);

    LOG.exiting(CLASS_NAME, "queryEntitlementLevelByName", new Object[] { beanList });
    return beanList;
  }

  /************************************************************* Advanced APIs ******************************************************/

  @Override
  public boolean isUserEntitled(String userId, String orgId, String featureId)
  {
    LOG.entering(CLASS_NAME, "isUserEntitled", new Object[] { userId, orgId, featureId });
    // Check the user's org has been assigned this feature or not first
    boolean orgAssigned = isOrgEntitled(orgId, featureId);
    if (orgAssigned)
    {
      LOG.log(Level.WARNING, "isUserEntitled exiting: the user " + userId + "has the feature because its org " + orgId + "has the feature."
          + featureId);
      return true;
    }

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    DocEBean bean = null;
    try
    {
      bean = dao.getByUser(userId, orgId);
    }
    catch (AccessException e1)
    {
      LOG.log(Level.WARNING, "isUserEntitled exiting: Failed to get entitlement info for user " + userId + " " + orgId);
      return false;
    }
    if (bean != null)
    {
      String features = bean.getFeatures();
      if (features != null)
      {
        JSONObject obj = this.getFeaturesAsJson(features);
        if (obj != null)
        {
          boolean userAssigned = obj.containsKey(featureId);
          LOG.log(Level.WARNING, "isUserEntitled exiting: " + features);
          return userAssigned;
        }
      }
    }

    LOG.exiting(CLASS_NAME, "isUserEntitled");
    return false;
  }

  @Override
  public boolean isOrgEntitled(String orgId, String featureId)
  {
    LOG.entering(CLASS_NAME, "isOrgEntitled", new Object[] { orgId, featureId });

    IDocEntitlementDAO dao = getDocEntitlementDAO();
    DocEBean bean = null;
    try
    {
      bean = dao.getByOrg(orgId);
    }
    catch (AccessException e1)
    {
      LOG.log(Level.WARNING, "isOrgEntitled exiting: Failed to get entitlement info for organization " + orgId);
      return false;
    }
    if (bean != null)
    {
      String features = bean.getFeatures();
      if (features != null)
      {
        JSONObject obj = this.getFeaturesAsJson(features);
        if (obj != null)
        {
          boolean assigned = obj.containsKey(featureId);
          LOG.log(Level.WARNING, "isOrgEntitled exiting: " + features);

          return assigned;
        }
      }
    }

    LOG.exiting(CLASS_NAME, "isOrgEntitled");
    return false;
  }

  @Override
  public boolean addNewFeatureToOrg(String orgId, String orgName, String featureId, String featureValue)
  {
    LOG.entering(CLASS_NAME, "addNewFeatureToOrg", new Object[] { orgId, orgName, featureId, featureValue });

    JSONObject fValue = getFeaturesAsJson(featureValue);
    if (fValue == null)
    {
      LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: Failed to parse featureValue as JSONObject");
      return false;
    }
    GateKeeperEntitlement orgEntitlement = null;
    try
    {
      orgEntitlement = getOrgEntitlementLevel(orgId);
    }
    catch (AccessException e1)
    {
      LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: Failed to get entitlement level for organization " + orgId);
      return false;
    }

    JSONObject jsonFeature = new JSONObject();

    if (orgEntitlement != null)
    {
      String features = orgEntitlement.getFeatures();
      jsonFeature = getFeaturesAsJson(features);
      if (jsonFeature == null)
      {
        LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: Failed to parse entitlement features");
        return false;
      }

      jsonFeature.put(featureId, fValue);
      String levelId = orgEntitlement.getLevelId();
      int tCount = 0;
      try
      {
        tCount = getReferenceCount(levelId);
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: addNewFeatureToOrg exiting: Failed to getReferenceCount");
        return false;
      }
      // Only refered by this organization, just update the entitlement level record.
      if (tCount == 1)
      {
        try
        {
          updateEntitlementLevel(levelId, jsonFeature.toString());
        }
        catch (AccessException e)
        {
          LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: Failed to update entitlement level");
          return false;
        }
      }
      else
      {
        String levelName = orgEntitlement.getLevelName();
        levelName = levelName + "_" + featureId;
        try
        {
          String newLevelid = addEntitlementLevel(levelName, jsonFeature.toString());
          updateOrgEntitlementLevel(orgId, orgName, newLevelid);
        }
        catch (AccessException e)
        {
          LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: Failed to insert an entitlement level for organization " + orgId);
          return false;
        }
      }
    }
    else
    {
      String levelName = "level_" + orgId;
      jsonFeature.put(featureId, fValue);
      try
      {
        String newLevelid = addEntitlementLevel(levelName, jsonFeature.toString());
        addOrgEntitlementLevel(orgId, orgName, newLevelid);
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "addNewFeatureToOrg exiting: Failed to insert an entitlement level for organization " + orgId);
        return false;
      }
    }

    LOG.exiting(CLASS_NAME, "addNewFeatureToOrg", new Object[] { jsonFeature });
    return true;
  }

  @Override
  public boolean removeFeatureFromOrg(String orgId, String orgName, String featureId)
  {
    LOG.entering(CLASS_NAME, "removeFeatureFromOrg", new Object[] { orgId, orgName, featureId });

    GateKeeperEntitlement orgEntitlement = null;
    try
    {
      orgEntitlement = getOrgEntitlementLevel(orgId);
    }
    catch (AccessException e2)
    {
      LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to get entitlement level for organization " + orgId + ", " + featureId);
      return false;
    }
    JSONObject jsonFeature = new JSONObject();
    if (orgEntitlement != null)
    {
      String features = orgEntitlement.getFeatures();
      if (features != null)
      {
        // Get features as json format
        jsonFeature = getFeaturesAsJson(features);
        if (jsonFeature == null)
        {
          LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to parse entitlement features");
          return false;
        }
        // Check whether the featureId is owned by this organization
        if (!jsonFeature.containsKey(featureId))
        {
          LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to find the wanted feature by " + featureId);
          return false;
        }
        // Check the reference count
        String levelId = orgEntitlement.getLevelId();
        int tCount = 0;
        try
        {
          tCount = getReferenceCount(levelId);
        }
        catch (AccessException e)
        {
          LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to getReferenceCount");
          return false;
        }
        // Remove the feature from features
        jsonFeature.remove(featureId);

        if (tCount == 1)
        {
          if (jsonFeature.size() != 0)
          {
            try
            {
              this.updateEntitlementLevel(levelId, jsonFeature.toString());
            }
            catch (AccessException e)
            {
              LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to update entitlement level");
              return false;
            }
          }
          else
          {
            IDocEntitlementDAO ddao = getDocEntitlementDAO();
            try
            {
              ddao.deleteByLevelId(levelId);
            }
            catch (AccessException e1)
            {
              LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to delete the empty entitlement level " + levelId);
              return false;
            }
            // Delete the org's entitlement level
            IOrgEntitlementDAO odao = getOrgEntitlementDAO();
            try
            {
              odao.deleteByOrgId(orgId);
            }
            catch (AccessException e)
            {
              LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to delete the org's entitlement level " + levelId);
              return false;
            }
          }
        }
        // Multiple reference case
        else
        {
          // There are other features left after the delete action
          if (jsonFeature.size() != 0)
          {
            // Create a new entitlement level and associated with the org
            String levelName = orgEntitlement.getLevelName();
            levelName = levelName + "_" + featureId;
            try
            {
              String newLevelid = addEntitlementLevel(levelName, jsonFeature.toString());
              this.updateOrgEntitlementLevel(orgId, orgName, newLevelid);
            }
            catch (AccessException e)
            {
              LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to insert an entitlement for organization: " + orgId);
              return false;
            }
          }
          else
          {
            // Delete the org's entitlement level
            IOrgEntitlementDAO odao = getOrgEntitlementDAO();
            try
            {
              odao.deleteByOrgId(orgId);
            }
            catch (AccessException e)
            {
              LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to delete the org's entitlement level " + levelId);
              return false;
            }
          }
        }
      }
      else
      {
        LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to remove this feature because features is null");
        return false;
      }
    }
    else
    {
      LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to remove this feature because there is no org entitlment level");
      return false;
    }
    // To remove the feature from all users in this organization.
    IUserEntitlementDAO udao = getUserEntitlementDAO();
    String[] userIds = new String[0];
    try
    {
      userIds = udao.getUsers(orgId);
      removeFeatureFromUsers(userIds, orgId, featureId);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "removeFeatureFromOrg exiting: Failed to remove feature " + featureId + " from users " + userIds);
      return false;
    }

    LOG.exiting(CLASS_NAME, "removeFeatureFromOrg", new Object[] { jsonFeature });
    return true;
  }

  @Override
  public boolean addNewFeatureToUsers(String[] userIds, String orgId, String featureId, String featureValue)
  {
    LOG.entering(CLASS_NAME, "addNewFeatureToUsers", new Object[] { userIds, orgId, featureId, featureValue });

    for (int i = 0; i < userIds.length; i++)
    {
      try
      {
        this.addNewFeatureToUser(userIds[i], orgId, featureId, featureValue);
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "addNewFeatureToUsers exiting : Failed to add new feature to user " + userIds[i]);
        return false;
      }
    }

    LOG.exiting(CLASS_NAME, "addNewFeatureToUsers");
    return true;
  }

  @Override
  public JSONObject getUserFeatures(UserBean user)
  {
    LOG.entering(CLASS_NAME, "getUserFeatures", new Object[] { user.getId(), user.getOrgId() });
    // It returns null in the first time, no cache case
    String gatekeeper = user.getGateKeeper();
    if (gatekeeper != null)
    {
      // There is no GateKeeper service for this user
      if ("".equals(gatekeeper))
        return null;
      JSONObject obj = null;
      try
      {
        obj = JSONObject.parse(gatekeeper);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "getUserFeatures exiting: Failed to parse JSON string " + gatekeeper, e);
      }
      return obj;
    }
    else
    { // otherwise, get gatekeeper from the database then.
      String orgId = (user.getOrgId() == null) ? user.getCustomerId() : user.getOrgId();
      JSONObject jsonFeature = null;
      try
      {
        // Firstly, fetch data from global entitlement
        GateKeeperEntitlement globalBean = queryGlobalFeatures();
        if (globalBean != null)
        {
          String features = globalBean.getFeatures();
          JSONObject gFeature = getFeaturesAsJson(features);
          if (gFeature == null)
          {
            LOG.log(Level.WARNING, "getUserFeatures: Failed to parse user's global entitlement features");
          }
          else
          {
            jsonFeature = gFeature;
          }
        }
        // Secondly, fetch data from org entitlement
        GateKeeperEntitlement entitlement = this.getOrgEntitlementLevel(orgId);
        if (entitlement != null)
        {
          String features = entitlement.getFeatures();
          JSONObject orgFeature = getFeaturesAsJson(features);
          if (orgFeature == null)
          {
            LOG.log(Level.WARNING, "getUserFeatures: Failed to parse user's org entitlement features");
          }
          else
          {
            jsonFeature = this.mergeFeatures(jsonFeature, orgFeature);
          }
        }
        // Thirdly, fetch data from user entitlement
        entitlement = getUserEntitlementLevel(user.getId(), orgId);
        if (entitlement != null)
        {
          String features = entitlement.getFeatures();
          JSONObject userFeature = getFeaturesAsJson(features);
          if (userFeature == null)
          {
            LOG.log(Level.WARNING, "getUserFeatures: Failed to parse user's entitlement features");
          }
          else
          {
            if (jsonFeature == null)
            {
              return userFeature;
            }
            else
            {
              jsonFeature = this.mergeFeatures(jsonFeature, userFeature);
            }
          }
        }
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "getUserFeatures exiting: Failed to get features for user " + user.getId());
        return null;
      }

      LOG.exiting(CLASS_NAME, "getUserFeatures", new Object[] { jsonFeature });
      user.setProperty(UserProperty.PROP_GATEKEEPER.toString(), ((jsonFeature == null) ? "" : jsonFeature.toString()));
      return jsonFeature;
    }
  }

  private JSONObject mergeFeatures(JSONObject parent, JSONObject child)
  {
    if (parent == null)
      return child;
    if (child == null)
      return parent;
    JSONObject tmp = parent;
    @SuppressWarnings("rawtypes")
    Iterator itu = child.keySet().iterator();
    while (itu.hasNext())
    {
      String key = (String) itu.next();
      Object value = child.get(key);
      tmp.put(key, value);
    }
    return tmp;
  }

  public boolean addNewFeatureToUser(String userId, String orgId, String featureId, String featureValue) throws AccessException
  {
    LOG.entering(CLASS_NAME, "addNewFeatureToUser", new Object[] { userId, orgId, featureId, featureValue });

    JSONObject fValue = getFeaturesAsJson(featureValue);
    if (fValue == null)
    {
      LOG.log(Level.WARNING, "addNewFeatureToUser exiting: Failed to parse featureValue as JSONObject");
      return false;
    }
    GateKeeperEntitlement userEntitlement = getUserEntitlementLevel(userId, orgId);
    JSONObject jsonFeature = new JSONObject();
    if (userEntitlement != null)
    {
      String features = userEntitlement.getFeatures();
      jsonFeature = getFeaturesAsJson(features);
      if (jsonFeature == null)
      {
        LOG.log(Level.WARNING, "addNewFeatureToUser exiting: Failed to parse entitlement features");
        return false;
      }
      jsonFeature.put(featureId, fValue);
      String levelId = userEntitlement.getLevelId();
      int tCount = getReferenceCount(levelId);
      // Only refered by this organization, just update the entitlement level record.
      if (tCount == 1)
      {
        updateEntitlementLevel(levelId, jsonFeature.toString());
      }
      else
      {
        String levelName = userEntitlement.getLevelName();
        levelName = levelName + "_" + featureId;
        String newLevelid = addEntitlementLevel(levelName, jsonFeature.toString());
        updateUserEntitlementLevel(userId, orgId, newLevelid);
      }
    }
    else
    {
      String levelName = "level_" + userId + "_" + featureId;
      jsonFeature.put(featureId, fValue);
      String newLevelid = addEntitlementLevel(levelName, jsonFeature.toString());
      addUserEntitlementLevel(userId, orgId, newLevelid);
    }

    LOG.exiting(CLASS_NAME, "addNewFeatureToUser", new Object[] { jsonFeature });
    return true;
  }

  @Override
  public boolean removeFeatureFromUsers(String[] userIds, String orgId, String featureId)
  {
    LOG.entering(CLASS_NAME, "removeFeatureFromUsers", new Object[] { userIds, orgId, featureId });

    for (int i = 0; i < userIds.length; i++)
    {
      try
      {
        this.removeFeatureFromUser(userIds[i], orgId, featureId);
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "removeFeatureFromUsers exiting : Failed to remove feature" + featureId + " from user" + userIds[i]);
        return false;
      }
    }

    LOG.exiting(CLASS_NAME, "removeFeatureFromUsers");
    return true;
  }

  public boolean removeFeatureFromUser(String userId, String orgId, String featureId) throws AccessException
  {
    LOG.entering(CLASS_NAME, "removeFeatureFromUser", new Object[] { userId, orgId, featureId });

    GateKeeperEntitlement userEntitlement = getUserEntitlementLevel(userId, orgId);
    JSONObject jsonFeature = new JSONObject();
    if (userEntitlement != null)
    {
      String features = userEntitlement.getFeatures();
      if (features != null)
      {
        // Get features as json format
        jsonFeature = getFeaturesAsJson(features);
        if (jsonFeature == null)
        {
          LOG.log(Level.WARNING, "removeFeatureFromUser exiting: Failed to parse entitlement features");
          return false;
        }
        // Check whether the featureId is owned by this organization
        if (!jsonFeature.containsKey(featureId))
        {
          LOG.log(Level.WARNING, "removeFeatureFromUser exiting: Can not find the wanted feature by " + featureId);
          return false;
        }
        // Check the reference count
        String levelId = userEntitlement.getLevelId();
        int tCount = getReferenceCount(levelId);
        // Remove the feature from features
        jsonFeature.remove(featureId);

        if (tCount == 1)
        {
          if (jsonFeature.size() != 0)
          {
            updateEntitlementLevel(levelId, jsonFeature.toString());
          }
          else
          {
            // Delete doc's entitlement level
            IDocEntitlementDAO ddao = getDocEntitlementDAO();
            ddao.deleteByLevelId(levelId);
            // Delete the org's entitlement level
            IUserEntitlementDAO odao = getUserEntitlementDAO();
            odao.deleteByUserIdOrgId(userId, orgId);
          }
        }
        // Multiple reference case
        else
        {
          // There are other features left after the delete action
          if (jsonFeature.size() != 0)
          {
            // Create a new entitlement level and associated with the org
            String levelName = userEntitlement.getLevelName();
            levelName = levelName + "_" + featureId;
            String newLevelid = addEntitlementLevel(levelName, jsonFeature.toString());
            updateUserEntitlementLevel(userId, orgId, newLevelid);
          }
          else
          {
            // Delete the org's entitlement level
            IUserEntitlementDAO odao = getUserEntitlementDAO();
            odao.deleteByUserIdOrgId(userId, orgId);
          }
        }
      }
      else
      {
        LOG.log(Level.WARNING, "removeFeatureFromUser exiting: Failed to remove this feature because features is null");
        return false;
      }
    }
    else
    {
      LOG.log(Level.WARNING, "removeFeatureFromUser exiting: Failed to remove this feature because there is no user entitlment level");
      return false;
    }

    LOG.exiting(CLASS_NAME, "removeFeatureFromUser", new Object[] { jsonFeature });
    return true;
  }

  private JSONObject getFeaturesAsJson(String features)
  {
    if (features != null)
    {
      try
      {
        return JSONObject.parse(features);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Failed to parse features: " + features, e);
      }
    }
    return null;
  }

  /************************************************************* private APIs ******************************************************/

  private int getReferenceCount(String levelId) throws AccessException
  {
    IOrgEntitlementDAO odao = getOrgEntitlementDAO();
    int oCount = odao.getOrgReferenceCount(levelId);
    IUserEntitlementDAO udao = getUserEntitlementDAO();
    int uCount = udao.getUserReferenceCount(levelId);
    return oCount + uCount;
  }

  private IDocEntitlementDAO getDocEntitlementDAO()
  {

    return (IDocEntitlementDAO) ComponentRegistry.getInstance().getComponent(EntitlementComponent.COMPONENT_ID)
        .getService(IDocEntitlementDAO.class);
  }

  private IOrgEntitlementDAO getOrgEntitlementDAO()
  {
    return (IOrgEntitlementDAO) ComponentRegistry.getInstance().getComponent(EntitlementComponent.COMPONENT_ID)
        .getService(IOrgEntitlementDAO.class);

  }

  private IUserEntitlementDAO getUserEntitlementDAO()
  {
    return (IUserEntitlementDAO) ComponentRegistry.getInstance().getComponent(EntitlementComponent.COMPONENT_ID)
        .getService(IUserEntitlementDAO.class);

  }
}
