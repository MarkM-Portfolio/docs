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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.common.util.WASConfigHelper;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class GateKeeperAdapter
{
  private static final String logName = GateKeeperAdapter.class.getName();

  private static final Logger LOG = Logger.getLogger(logName);

  private static final String GATEKEEPER_CONFIG_FILE = "gatekeeper.json";

  private static final String TASK = "task";

  private static final String CONFIG = "config";

  private static final String CONFIG_ARRAY = "organizations";

  private static final String ORG_ID = "orgId";

  private static final String ORG_NAME = "orgName";

  private static final String LEVEL_NAME = "levelName";

  private static final String FEATURES = "features";

  private static final String FEATURE_IDS = "featureIds";

  private static final String USER_IDS = "userIds";

  private static final String ID = "id";

  private static final String ENTITLE_ORG_FEATURES = "entitleFeatures4Orgs";

  private static final String UPDATE_ORG_FEATURES = "updateFeatures4Org";

  private static final String DELETE_ORG_FEATURES = "deleteFeatures4Org";

  private static final String ENTITLE_USERS_FEATURES = "entitleFeatures4Users";

  private static final String UPDATE_USERS_FEATURES = "updateFeatures4Users";

  private static final String DELETE_USERS_FEATURES = "deleteFeatures4Users";

  private static final String QUERY_GLOBAL_FEATURES = "queryGlobalFeatures";

  private static final String ENTITLE_GLOBAL_FEATURES = "entitleGlobalFeatures";

  private static final String REMOVE_GLOBAL_FEATURES_BYIDS = "removeGlobalFeaturesByIDs";

  private static final String TURN_ON_OFF_GLOBAL_FEATURES_BYIDS = "turnOnOffGlobalFeaturesByIDs";

  /**
   * According to the configuration in the given file, we provide gate keeper services
   * 
   * @param filepath
   *          , the file path of the configuration file
   * @return whether the service is well done or not
   */
  public boolean doService(IGateKeeperService service, String filepath) throws AccessException
  {
    JSONArray requests = getConfigRequests(filepath);
    if (requests == null || !checkOrgAndUsers(requests))
    {
      return false;
    }
    for (int i = 0; i < requests.size(); i++)
    {
      JSONObject obj = (JSONObject) requests.get(i);
      Object taskObj = obj.get(TASK);
      Object configObj = obj.get(CONFIG);
      if (taskObj != null && configObj != null && taskObj instanceof String && configObj instanceof JSONObject)
      {
        String task = (String) taskObj;
        JSONObject config = (JSONObject) configObj;
        String orgId = (String) config.get(ORG_ID);
        if (QUERY_GLOBAL_FEATURES.equals(task))// This task is only for debugging...
        {
          GateKeeperEntitlement gBean = service.queryGlobalFeatures();
          if (gBean == null)
            throw new IllegalArgumentException("There is no global entitlement in the Gatekeeper Management System.");
          else
            throw new IllegalArgumentException("The global entitlement for debugging: " + gBean.getFeatures());
        }
        else if (ENTITLE_GLOBAL_FEATURES.equals(task))
        {
          JSONArray array = (JSONArray) config.get(FEATURES);
          Map<String, String> fmap = new HashMap<String, String>();
          for (int u = 0; u < array.size(); u++)
          {
            JSONObject fObj = (JSONObject) array.get(u);
            if (fObj != null)
            {
              String featureId = (String) fObj.get(IGateKeeperService.FEATURE_ID);
              String featureValue = this.getFormattedFeatureValue(fObj);
              fmap.put(featureId, featureValue);
            }
          }
          service.entitleGlobalFeatures(fmap);
          continue;
        }
        else if (REMOVE_GLOBAL_FEATURES_BYIDS.equals(task))
        {
          service.removeGlobalEntitlementFeatures(getFeatureIds(config));
          continue;
        }
        else if (TURN_ON_OFF_GLOBAL_FEATURES_BYIDS.equals(task))
        {
          service.turnOnOffGlobalEntitlementFeatures(getFeatureOnOffStatus(config));
          continue;
        }
        else if (ENTITLE_ORG_FEATURES.equalsIgnoreCase(task))
        {
          JSONArray cArray = (JSONArray) config.get(CONFIG_ARRAY);
          for (int k = 0; k < cArray.size(); k++)
          {
            JSONObject cObj = (JSONObject) cArray.get(k);
            if (cObj != null)
            {
              orgId = (String) cObj.get(ORG_ID);
              String orgName = (String) cObj.get(ORG_NAME);
              String levelName = (String) cObj.get(LEVEL_NAME);
              JSONArray fArray = (JSONArray) cObj.get(FEATURES);
              for (int u = 0; u < fArray.size(); u++)
              {
                JSONObject fObj = (JSONObject) fArray.get(u);
                if (fObj != null)
                {
                  String featureId = (String) fObj.get(IGateKeeperService.FEATURE_ID);
                  GateKeeperEntitlement orgEntitlement = null;
                  try
                  {
                    orgEntitlement = service.getOrgEntitlementLevel(orgId);
                  }
                  catch (AccessException e1)
                  {
                    LOG.log(Level.WARNING, "doService : Failed to get entitlement level for organization " + orgId);
                    throw e1;
                  }
                  if (orgEntitlement == null)
                  {
                    String features = getFormattedFeature(fObj);
                    String levelId = service.addEntitlementLevel(levelName, features);
                    service.addOrgEntitlementLevel(orgId, orgName, levelId);
                  }
                  else
                  {
                    String featureValue = getFormattedFeatureValue(fObj);
                    service.addNewFeatureToOrg(orgId, orgName, featureId, featureValue);
                  }
                }
              }
            }
          }
          continue;
        }

        if (UPDATE_ORG_FEATURES.equalsIgnoreCase(task))
        {
          String orgName = (String) config.get(ORG_NAME);
          JSONArray array = (JSONArray) config.get(FEATURES);
          for (int u = 0; u < array.size(); u++)
          {
            JSONObject fObj = (JSONObject) array.get(u);
            if (fObj != null)
            {
              String featureId = (String) fObj.get(IGateKeeperService.FEATURE_ID);
              String features = getFormattedFeatureValue(fObj);
              service.addNewFeatureToOrg(orgId, orgName, featureId, features);
            }
          }
          continue;
        }

        if (DELETE_ORG_FEATURES.equalsIgnoreCase(task))
        {
          String orgName = (String) config.get(ORG_NAME);
          Iterator<String> fit = getFeatureIds(config).iterator();
          while (fit.hasNext())
          {
            String id = fit.next();
            service.removeFeatureFromOrg(orgId, orgName, id);
          }
          continue;
        }

        String[] userIds = getUserIds(config);

        if (ENTITLE_USERS_FEATURES.equalsIgnoreCase(task))
        {

          String levelName = (String) config.get(LEVEL_NAME);
          GateKeeperEntitlement userEntitlement = null;
          JSONArray array = (JSONArray) config.get(FEATURES);
          for (int u = 0; u < array.size(); u++)
          {
            JSONObject fObj = (JSONObject) array.get(u);
            if (fObj != null)
            {
              String featureId = (String) fObj.get(IGateKeeperService.FEATURE_ID);
              for (int j = 0; j < userIds.length; j++)
              {
                try
                {
                  userEntitlement = service.getUserEntitlementLevel(userIds[j], orgId);
                }
                catch (AccessException e1)
                {
                  LOG.log(Level.WARNING, "doService : Failed to get entitlement level for user " + userIds[j] + ", " + orgId);
                  throw e1;
                }
                if (userEntitlement == null)
                {
                  String features = getFormattedFeature(fObj);
                  String name = levelName + "_" + j;
                  String levelId = service.addEntitlementLevel(name, features);
                  service.addUserEntitlementLevel(userIds[j], orgId, levelId);
                }
                else
                {
                  String featureValue = getFormattedFeatureValue(fObj);
                  service.addNewFeatureToUser(userIds[j], orgId, featureId, featureValue);
                }
              }
            }
          }
          continue;
        }

        if (UPDATE_USERS_FEATURES.equalsIgnoreCase(task))
        {
          JSONArray array = (JSONArray) config.get(FEATURES);
          for (int u = 0; u < array.size(); u++)
          {
            JSONObject fObj = (JSONObject) array.get(u);
            if (fObj != null)
            {
              String featureId = (String) fObj.get(IGateKeeperService.FEATURE_ID);
              String features = getFormattedFeatureValue(fObj);
              service.addNewFeatureToUsers(userIds, orgId, featureId, features);
            }
          }
          continue;
        }

        if (DELETE_USERS_FEATURES.equalsIgnoreCase(task))
        {
          Iterator<String> fit = getFeatureIds(config).iterator();
          while (fit.hasNext())
          {
            String id = fit.next();
            service.removeFeatureFromUsers(userIds, orgId, id);
          }
          continue;
        }
      }
    }
    return true;
  }

  private String getFormattedFeatureValue(JSONObject feature)
  {
    Object featureName = feature.get(IGateKeeperService.FEATURE_NAME);
    if (featureName == null)
      throw new IllegalArgumentException("The feature's name can not be empty.");

    Object featureDetail = feature.get(IGateKeeperService.FEATURE_DETAIL);
    Object featureUrl = feature.get(IGateKeeperService.FEATURE_URL);
    Object featureOn = feature.get(IGateKeeperService.FEATURE_STATUS);

    JSONObject value = new JSONObject();
    value.put(IGateKeeperService.FEATURE_NAME, featureName);
    if (featureDetail != null)
    {
      value.put(IGateKeeperService.FEATURE_DETAIL, featureDetail);
    }
    if (featureUrl != null)
    {
      value.put(IGateKeeperService.FEATURE_URL, featureUrl);
    }
    if (featureOn != null)
    {
      value.put(IGateKeeperService.FEATURE_STATUS, featureOn);
    }
    return value.toString();
  }

  private String getFormattedFeature(JSONObject feature)
  {
    String featureId = (String) feature.get(IGateKeeperService.FEATURE_ID);
    Object featureName = feature.get(IGateKeeperService.FEATURE_NAME);
    if (featureId == null || featureName == null)
      throw new IllegalArgumentException("The feature's id and name can not be empty");

    Object featureDetail = feature.get(IGateKeeperService.FEATURE_DETAIL);
    Object featureUrl = feature.get(IGateKeeperService.FEATURE_URL);
    Object featureOn = feature.get(IGateKeeperService.FEATURE_STATUS);

    JSONObject value = new JSONObject();
    value.put(IGateKeeperService.FEATURE_NAME, featureName);
    if (featureDetail != null)
    {
      value.put(IGateKeeperService.FEATURE_DETAIL, featureDetail);
    }
    if (featureUrl != null)
    {
      value.put(IGateKeeperService.FEATURE_URL, featureUrl);
    }
    if (featureOn != null)
    {
      value.put(IGateKeeperService.FEATURE_STATUS, featureOn);
    }

    JSONObject result = new JSONObject();
    result.put(featureId, value);
    return result.toString();
  }

  private boolean checkOrgAndUsers(JSONArray requests)
  {
    Map<String, String> cachedOrgMap = new HashMap<String, String>();
    for (int i = 0; i < requests.size(); i++)
    {
      JSONObject obj = (JSONObject) requests.get(i);
      Object taskObj = obj.get(TASK);
      Object configObj = obj.get(CONFIG);
      if (taskObj != null && configObj != null && taskObj instanceof String && configObj instanceof JSONObject)
      {
        String task = (String) taskObj;
        JSONObject config = (JSONObject) configObj;
        String orgId = (String) config.get(ORG_ID);
        if (QUERY_GLOBAL_FEATURES.equals(task) || ENTITLE_GLOBAL_FEATURES.equals(task) || REMOVE_GLOBAL_FEATURES_BYIDS.equals(task)
            || TURN_ON_OFF_GLOBAL_FEATURES_BYIDS.equals(task))
        {
          continue;
        }
        else if (ENTITLE_ORG_FEATURES.equalsIgnoreCase(task))
        {
          JSONArray cArray = (JSONArray) config.get(CONFIG_ARRAY);
          for (int k = 0; k < cArray.size(); k++)
          {
            JSONObject cObj = (JSONObject) cArray.get(k);
            if (cObj != null)
            {
              orgId = (String) cObj.get(ORG_ID);
              if (orgId == null)
              {
                throw new IllegalArgumentException("doService failed: The org ID should not be empty & the gateKeeper request is: \n"
                    + cObj);
              }
              if (!cachedOrgMap.containsKey(orgId))
              {
                if (!isLegalOrg(orgId))
                {
                  throw new IllegalArgumentException("doService failed: The org ID " + orgId
                      + " is not legal (no record in Subscriber table) in gatekeeper.json. The gateKeeper request is: \n" + cObj);
                }
                else
                {
                  cachedOrgMap.put(orgId, orgId);
                }
              }
              JSONArray fArray = (JSONArray) cObj.get(FEATURES);
              if (fArray == null)
              {
                throw new IllegalArgumentException("doService failed: The key word - features is wrong & the gateKeeper request is: \n"
                    + cObj);
              }
            }
          }
          continue;
        }
        // Check organization now & org ID can not be empty
        if (orgId == null)
        {
          throw new IllegalArgumentException("doService failed: The org ID should not be empty & the gateKeeper request is: \n" + obj);
        }

        if (!cachedOrgMap.containsKey(orgId))
        {
          if (!isLegalOrg(orgId))
          {
            throw new IllegalArgumentException("doService failed: The org ID " + orgId
                + " is not legal (no record in Subscriber table) in gatekeeper.json " + " And the gateKeeper request is: \n" + obj);
          }
          else
          {
            cachedOrgMap.put(orgId, orgId);
          }
        }

        if (UPDATE_ORG_FEATURES.equalsIgnoreCase(task))
        {
          // Check features of update action for ORG
          JSONArray array = (JSONArray) config.get(FEATURES);
          if (array == null)
          {
            throw new IllegalArgumentException("doService failed: The key word - features is wrong & the gateKeeper request is: \n" + obj);
          }
          continue;
        }
        else if (DELETE_ORG_FEATURES.equalsIgnoreCase(task))
        {
          // No other checking points
          continue;
        }
        else
        {
          String[] userIds = getUserIds(config);
          // User IDs can not be empty
          if (userIds.length == 0)
          {
            throw new IllegalArgumentException("doService failed: The user IDs should not be empty & the gateKeeper request is: \n" + obj);
          }
          Map<String, Boolean> map = getUsers(userIds, orgId);
          Iterator<String> it = map.keySet().iterator();

          List<String> errorList = new ArrayList<String>();
          List<String> normalList = new ArrayList<String>();
          while (it.hasNext())
          {
            String id = it.next();
            boolean value = map.get(id).booleanValue();
            if (value)
            {
              normalList.add(id);
            }
            else
            {
              errorList.add(id);
            }
          }
          if (errorList.size() != 0)
          {
            throw new IllegalArgumentException("doService failed: These user IDs " + errorList
                + " are illegal (no record in Subscriber table) in gatekeeper.json. The gateKeeper request is: \n" + obj);
          }
          // Check features of entitle & update action for users
          if (ENTITLE_USERS_FEATURES.equalsIgnoreCase(task) || UPDATE_USERS_FEATURES.equalsIgnoreCase(task))
          {
            JSONArray array = (JSONArray) config.get(FEATURES);
            if (array == null)
            {
              throw new IllegalArgumentException("doService failed: The key word - features is wrong & the gateKeeper request is: \n" + obj);
            }
          }
        }
      }
      else
      {
        // Key words task and config can not be empty
        throw new IllegalArgumentException("doService failed: This request is malformed " + taskObj + ", " + configObj + ", \n" + obj);
      }
    }

    return true;
  }

  private Map<String, Boolean> getFeatureOnOffStatus(JSONObject config)
  {
    Map<String, Boolean> fMap = new HashMap<String, Boolean>();
    JSONArray array = (JSONArray) config.get(FEATURE_IDS);
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject idObj = (JSONObject) array.get(i);
      if (idObj != null)
      {
        String id = (String) idObj.get(ID);
        Boolean status = (Boolean) idObj.get(IGateKeeperService.FEATURE_STATUS);
        fMap.put(id, status);
      }
    }
    return fMap;
  }

  private List<String> getFeatureIds(JSONObject config)
  {
    List<String> list = new ArrayList<String>();
    JSONArray array = (JSONArray) config.get(FEATURE_IDS);
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject idObj = (JSONObject) array.get(i);
      if (idObj != null)
      {
        String id = (String) idObj.get(ID);
        list.add(id);
      }
    }
    return list;
  }

  private String[] getUserIds(JSONObject config)
  {
    List<String> list = new ArrayList<String>();
    JSONArray array = (JSONArray) config.get(USER_IDS);
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject idObj = (JSONObject) array.get(i);
      if (idObj != null)
      {
        String id = (String) idObj.get(ID);
        list.add(id);
      }
    }
    String[] userids = (String[]) list.toArray(new String[list.size()]);
    return userids;
  }

  private JSONArray getConfigRequests(String filepath)
  {
    if (filepath == null || "".equals(filepath))
    {
      filepath = WASConfigHelper.getDocsConfigPath() + File.separator + GATEKEEPER_CONFIG_FILE;
    }
    JSONArray configObj = null;
    File configFile = new File(filepath);
    if (configFile.exists() && configFile.isFile())
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(configFile);
        configObj = JSONArray.parse(fis);
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.SEVERE, "Gatekeeper config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.",
            e);
        throw new IllegalArgumentException("Gatekeeper config file: " + configFile.getAbsolutePath()
            + " must exist and be a file for system to work.");
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Malformed GateKeeper config file: " + configFile.getAbsolutePath() + " can not be parsed successfully.", e);
        throw new IllegalArgumentException("Malformed GateKeeper config file: " + configFile.getAbsolutePath()
            + " can not be parsed successfully.");
      }
      finally
      {
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "io error when closing " + configFile.getAbsolutePath());
          }
        }
      }
    }
    else
    {
      throw new IllegalArgumentException("The file does not exists, please check it again. \n" + filepath);
    }
    return configObj;
  }

  private boolean isLegalOrg(String customerId)
  {
    ISubscriberDAO dao = getSubScriber();
    int count = dao.getSubscriberCountByCustID(customerId);
    return (count > 0);
  }

  private Map<String, Boolean> getUsers(String[] userIds, String customerId)
  {
    Map<String, Boolean> map = new HashMap<String, Boolean>();
    ISubscriberDAO dao = getSubScriber();
    for (int i = 0; i < userIds.length; i++)
    {
      Subscriber subscriber = dao.getSubscriber(userIds[i], 0, customerId);
      map.put(userIds[i], Boolean.valueOf(subscriber != null));
    }
    return map;
  }

  private ISubscriberDAO getSubScriber()
  {
    return (ISubscriberDAO) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
  }
}
