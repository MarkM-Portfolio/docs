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

import java.util.List;
import java.util.Map;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.bean.DocEBean;
import com.ibm.json.java.JSONObject;

public interface IGateKeeperService
{
  public static final String FEATURE_ID = "featureId";

  public static final String FEATURE_NAME = "featureName";

  public static final String FEATURE_DETAIL = "featureDetail";

  public static final String FEATURE_URL = "featureUrl";

  public static final String FEATURE_STATUS = "enabled";

  public static final String GLOBAL_LEVEL_NAME = "gk_global_level@cn.ibm.com";

  /**
   * Query global features by the unique level name.
   * 
   * @return the global features
   * @throws AccessException
   */
  public GateKeeperEntitlement queryGlobalFeatures() throws AccessException;

  /**
   * To add or update a global feature
   * 
   * @param features
   *          , HashMap, key is featureId and value is featureValue
   * @return whether the feature has been entitled successfully
   * @throws AccessException
   */
  public boolean entitleGlobalFeatures(Map<String, String> features) throws AccessException;

  /**
   * To remove a global feature via its feature's id
   * 
   * @param featureIds
   *          list of feature id
   * @return whether the feature has been removed successfully or not
   * @throws AccessException
   */
  public boolean removeGlobalEntitlementFeatures(List<String> featureIds) throws AccessException;

  /**
   * To enable a global feature via its feature' id
   * 
   * @param fMap
   *          the key is feature id and value is feature's status (enabled or disabled)
   * @return whether the feature has been enabled successfully
   * @throws AccessException
   */
  public boolean turnOnOffGlobalEntitlementFeatures(Map<String, Boolean> fMap) throws AccessException;

  /**
   * To add an entitlement level into database according to its name and configuration features
   * 
   * @param levelName
   *          level's name
   * @param features
   *          feature configuration data {{"featureID1": {"featureName":"feature1", "featureDetail":{}}},{"featureID2":{...}}}
   * @return the entitlement level id
   */
  public String addEntitlementLevel(String levelName, String features) throws AccessException;

  /**
   * To delete an entitlement level by its id
   * 
   * @param levelId
   * @return whether this action is successful or not
   */
  public boolean deleteEntitlementLevel(String levelId) throws AccessException;

  /**
   * To update an entitlement level by its id and features
   * 
   * @param levelId
   *          entitlement id
   * @param features
   *          feature configuration data {{"featureID1": {"featureName":"feature1", "featureDetail":{}}},{"featureID2":{...}}}
   * @return whether this action is successful or not
   */
  public boolean updateEntitlementLevel(String levelId, String features) throws AccessException;

  /**
   * To get a user's entitlement information
   * 
   * @param userId
   *          user id
   * @param orgId
   *          organization id
   * @return the user's entitlement bean
   */
  public GateKeeperEntitlement getUserEntitlementLevel(String userId, String orgId) throws AccessException;

  /**
   * To get an organization's entitlement information
   * 
   * @param orgId
   *          organization id
   * @return the organization's entitlement bean
   */
  public GateKeeperEntitlement getOrgEntitlementLevel(String orgId) throws AccessException;

  /**
   * To insert a user's entitilement level by its user id, organization id and the entitlement level id
   * 
   * @param userId
   *          user id
   * @param orgId
   *          organization id
   * @param levelId
   *          entitlement level id
   * @return whether this action is successful or not
   */
  public boolean addUserEntitlementLevel(String userId, String orgId, String levelId) throws AccessException;

  /**
   * To update a user's entitilement level by its user id, organization id and the entitlement level id
   * 
   * @param userId
   *          user id
   * @param orgId
   *          organization id
   * @param levelId
   *          entitlement level id
   * @return whether this action is successful or not
   */
  public boolean updateUserEntitlementLevel(String userId, String orgId, String levelId) throws AccessException;

  /**
   * To insert an organization's entitilement level by its organization id and the entitlement level id
   * 
   * @param orgId
   *          organization id
   * @param orgName
   *          organization name
   * @param levelId
   *          entitlement level id
   * @return whether this action is successful or not
   */
  public boolean addOrgEntitlementLevel(String orgId, String orgName, String levelId) throws AccessException;

  /**
   * To update an organization's entitilement level by its organization id and the entitlement level id
   * 
   * @param orgId
   *          organization id
   * @param orgName
   *          organization name
   * @param levelId
   *          entitlement level id
   * @return whether this action is successful or not
   */
  public boolean updateOrgEntitlementLevel(String orgId, String orgName, String levelId) throws AccessException;

  /**
   * To know whether the user has been entitled this feature or not. If the given feature id can be found in the features json data, return
   * true else return false
   * 
   * @param userId
   *          user id
   * @param orgId
   *          organization id
   * @param featureId
   *          featureId in the feature(JSON data format: {{"featureId1": {"featureName":"feature1",
   *          "featureDetail":{}}},{"featureID2":{...}}})
   * @return whether the user has been entitled this feature or not
   */
  public boolean isUserEntitled(String userId, String orgId, String featureId);

  /**
   * To know whether the organization has been entitled this feature or not. If the given feature id can be found in the features json data,
   * return true else return false
   * 
   * @param orgId
   *          organization id
   * @param featureId
   *          featureId in the feature(JSON data format: {{"featureId1": {"featureName":"feature1",
   *          "featureDetail":{}}},{"featureID2":{...}}})
   * @return whether the organization has been entitled this feature or not
   */
  public boolean isOrgEntitled(String orgId, String featureId);

  /**
   * To get an entitlement level by its name. If the name is not unique, it returns null.
   * 
   * @param levelName
   *          level's name
   * @return the entitlement level id
   */
  public List<DocEBean> queryEntitlementLevelByName(String levelName) throws AccessException;

  /**
   * To add a new feature to an organization by its id
   * 
   * @param orgId
   *          organization id
   * @param orgName
   *          organization name
   * @param featureId
   *          featureId in the feature(JSON data format: {"featureId1": {"featureName":"feature1","featureDetail":{}}})
   * @param featureValue
   *          featureValue in the feature (JSON data format: {"featureId1": {"featureName":"feature1","featureDetail":{}}})
   * @return whether the feature has been assigned or not
   */
  public boolean addNewFeatureToOrg(String orgId, String orgName, String featureId, String featureValue);

  /**
   * To remove a feature from an organization by its id
   * 
   * @param orgId
   *          organization id
   * @param orgName
   *          organization name
   * @param featureId
   *          featureId in the feature(JSON data format: {{"featureId1": {"featureName":"feature1",
   *          "featureDetail":{}}},{"featureID2":{...}}})
   * @return whether the feature has been removed or not
   */
  public boolean removeFeatureFromOrg(String orgId, String orgName, String featureId);

  /**
   * To add a new feature to a user list by their ids and the given organization id
   * 
   * @param userIds
   *          list of user ids
   * @param orgId
   *          organization id
   * @param featureId
   *          featureId in the feature(JSON data format: {"featureId1": {"featureName":"feature1","featureDetail":{}}})
   * @param featureValue
   *          featureValue in the feature (JSON data format: {"featureId1": {"featureName":"feature1","featureDetail":{}}})
   * @return whether the feature has been assigned or not
   */
  public boolean addNewFeatureToUsers(String[] userIds, String orgId, String featureId, String featureValue);

  /**
   * To get all features available to the given user. The algorithm is ${org's features} U ${user's features}. If the feature id is the same
   * , user's feature configuration will override his parent's feature configuration.
   * 
   * @param user
   *          the user bean
   * @return feature list
   */
  public JSONObject getUserFeatures(UserBean user);

  /**
   * To add a new feature to a user by its id and its organization id
   * 
   * @param userId
   *          the user id
   * @param orgId
   *          organization id
   * @param featureId
   *          featureId in the feature(JSON data format: {"featureId1": {"featureName":"feature1","featureDetail":{}}})
   * @param featureValue
   *          featureValue in the feature (JSON data format: {"featureId1": {"featureName":"feature1","featureDetail":{}}})
   * @return whether the feature has been assigned or not
   */
  public boolean addNewFeatureToUser(String userId, String orgId, String featureId, String featureValue) throws AccessException;

  /**
   * To remove a feature from a user list by their ids and the given organization id
   * 
   * @param userIds
   *          list of user ids
   * @param orgId
   *          organization id
   * @param featureId
   *          featureId in the feature(JSON data format: {{"featureId1": {"featureName":"feature1",
   *          "featureDetail":{}}},{"featureID2":{...}}})
   * @return whether the feature has been removed or not
   */
  public boolean removeFeatureFromUsers(String[] userIds, String orgId, String featureId);

  /**
   * To remove a feature from a user by its id and its organization id
   * 
   * @param userId
   *          the user id
   * @param orgId
   *          organization id
   * @param featureId
   *          featureId in the feature(JSON data format: {{"featureId1": {"featureName":"feature1",
   *          "featureDetail":{}}},{"featureID2":{...}}})
   * @throws AccessException
   * @return whether the feature has been removed or not
   */
  public boolean removeFeatureFromUser(String userId, String orgId, String featureId) throws AccessException;
}
