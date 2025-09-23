/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.entitlement;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.entitlement.Entitlement;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.json.java.JSONObject;

/**
 * Service being used to manage the entitlements.
 * 
 */
public class EntitlementServiceImpl implements IEntitlementService
{
  private static final Logger LOG = Logger.getLogger(EntitlementServiceImpl.class.getName());
  
  private static final String CONFIG_ENTITLEMENT_LEVEL = "defaultLevel";
  private static final String CONFIG_ENTITLEMENT_SETTINGS = "settings";
  
  private static Map<String, Map<String, Entitlement>> entitleLevelMap = new HashMap<String, Map<String, Entitlement>>();
  
  private ISubscriberDAO subscriberDAO;
  
  /**
   * 
   */
  public EntitlementServiceImpl()
  {
    initEntitlementLevelMap();
    subscriberDAO = (ISubscriberDAO)ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
  }
  
  /**
   * Parse the entitlement level from the String.
   * 
   * @param levelStr
   * @return
   */
  private EntitlementLevel parseEntitlementLevel(String levelStr)
  {
    EntitlementLevel level = EntitlementLevel.NONE;
    if (EntitlementLevel.NONE.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.NONE;
    }
    else if (EntitlementLevel.BASIC.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.BASIC;
    }
    else if (EntitlementLevel.SOCIAL.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.SOCIAL;
    }
    else if (EntitlementLevel.FULL.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.FULL;
    }
    else if (EntitlementLevel.CUSTOM_1.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.CUSTOM_1;
    }
    else if (EntitlementLevel.CUSTOM_2.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.CUSTOM_2;
    }
    else if (EntitlementLevel.CUSTOM_3.toString().equalsIgnoreCase(levelStr))
    {
      level = EntitlementLevel.CUSTOM_3;
    }
    return level;
  }
  
  /**
   * Update the feature settings for specified entitlement level according to mapping in configuration file.
   * 
   * @param settings specifies the mapping settings in configuration file
   * @param level specifies the entitlement level
   */
  private void updateLevelFeatureSetting(JSONObject settings, String level)
  {
    JSONObject mappingSettings = (JSONObject) settings.get(level);
    Map<String, Entitlement> entitleMap = entitleLevelMap.get(level);
    if (mappingSettings != null && entitleMap != null)
    {
      Object assignSetting = mappingSettings.get(IEntitlementService.ENTITLE_NAME_ASSIGNMENT);
      if (assignSetting != null)
      {
        Entitlement entitlement = entitleMap.get(IEntitlementService.ENTITLE_NAME_ASSIGNMENT);
        entitlement.setBooleanValue("true".equalsIgnoreCase((String) assignSetting));
      }
      
      Object coeditSetting = mappingSettings.get(IEntitlementService.ENTITLE_NAME_COEDIT);
      if (coeditSetting != null)
      {
        Entitlement entitlement = entitleMap.get(IEntitlementService.ENTITLE_NAME_COEDIT);
        entitlement.setBooleanValue("true".equalsIgnoreCase((String) coeditSetting));
      }
      
      Object conversionDuringUploadSetting = mappingSettings.get(ENTITLE_NAME_CONVERSION_DURING_UPLOAD);
      if (conversionDuringUploadSetting != null)
      {
        Entitlement entitlement = entitleMap.get(ENTITLE_NAME_CONVERSION_DURING_UPLOAD);
        entitlement.setBooleanValue("true".equalsIgnoreCase((String)conversionDuringUploadSetting));
      }
    }
  }
  
  /**
   * Read the mapping between entitlement levels and features from concord configuration file.
   * 
   */
  private void readEntitlementSetting()
  {
    try
    {
      JSONObject config = ComponentRegistry.getInstance().getComponent(EntitlementComponent.COMPONENT_ID).getConfig();
      JSONObject settings = (JSONObject) config.get(CONFIG_ENTITLEMENT_SETTINGS);
      if (settings != null)
      {
        // Read the settings of "FULL" level.
        updateLevelFeatureSetting(settings, EntitlementLevel.FULL.toString());
        
        // Read the settings of "SOCIAL" level.
        updateLevelFeatureSetting(settings, EntitlementLevel.SOCIAL.toString());
        
        // Read the settings of "BASIC" level.
        updateLevelFeatureSetting(settings, EntitlementLevel.BASIC.toString());
        
        // Read the settings of "CUSTOM_1" level.
        updateLevelFeatureSetting(settings, EntitlementLevel.CUSTOM_1.toString());

        // Read the settings of "CUSTOM_2" level.
        updateLevelFeatureSetting(settings, EntitlementLevel.CUSTOM_2.toString());

        // Read the settings of "CUSTOM_3" level.
        updateLevelFeatureSetting(settings, EntitlementLevel.CUSTOM_3.toString());
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while getting the entitlement settings of user from configuration file.", ex);
    }
  }
  
  /**
   * Initializes the map between entitlement level and entitlements.
   * 
   */
  private void initEntitlementLevelMap()
  {
    // Initialize EntitlementLevel.NONE entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.NONE.toString(), entitleMap);
    }
    
    // Initialize EntitlementLevel.BASIC entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.BASIC.toString(), entitleMap);
    }
    
    // Initialize EntitlementLevel.SOCIAL entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.SOCIAL.toString(), entitleMap);
    }
    
    // Initialize EntitlementLevel.FULL entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.FULL.toString(), entitleMap);
    }
    
    // Initialize EntitlementLevel.CUSTOM_1 entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, true);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.CUSTOM_1.toString(), entitleMap);
    }
    
    // Initialize EntitlementLevel.CUSTOM_2 entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.CUSTOM_2.toString(), entitleMap);
    }
    
    // Initialize EntitlementLevel.CUSTOM_3 entitlements map.
    {
      Map<String, Entitlement> entitleMap = new HashMap<String, Entitlement>();
      
      Entitlement entitlement = new Entitlement(ENTITLE_NAME_ASSIGNMENT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_COEDIT, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitlement = new Entitlement(ENTITLE_NAME_CONVERSION_DURING_UPLOAD, false);
      entitleMap.put(entitlement.getName(), entitlement);
      
      entitleLevelMap.put(EntitlementLevel.CUSTOM_3.toString(), entitleMap);
    }
    
    // Read the mapping between entitlement levels and features from concord configuration file.
    readEntitlementSetting();
  }  
  
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#getEntitlementsByLevel(com.ibm.concord.platform.entitlement.IEntitlementService.EntitlementLevel)
   */
  public Map<String, Entitlement> getEntitlementsByLevel(EntitlementLevel level)
  {
    LOG.entering(this.getClass().getName(), "getEntitlementsByLevel", new Object[]{level});
    Map<String, Entitlement> entitleMap = entitleLevelMap.get(level.toString());
    LOG.exiting(this.getClass().getName(), "getEntitlementsByLevel", new Object[]{level});
    return entitleMap;
  }
  
  /**
   * Gets the entitlement levels of specified users.
   * 
   * @param users
   * @return
   */
  private Map<UserBean, EntitlementLevel> getEntitlementLevels(UserBean[] users)
  {
    Map<UserBean, EntitlementLevel> userLevelMap = new HashMap<UserBean, EntitlementLevel>();
    EntitlementLevel defaultLevel = EntitlementLevel.NONE;
    
    // Read the default entitlement level from the concord configuration file firstly.
    try
    {
      JSONObject config = ComponentRegistry.getInstance().getComponent(EntitlementComponent.COMPONENT_ID).getConfig();
      Object levelStr = config.get(CONFIG_ENTITLEMENT_LEVEL);
      if (levelStr instanceof String)
      {
        defaultLevel = parseEntitlementLevel((String)levelStr);
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while getting the entitlement information of user from configuration file.", ex);
    }
    
    List<String> idList = new ArrayList<String>();
    List<Integer> typeList = new ArrayList<Integer>();
    List<UserBean> uncachedUserList = new ArrayList<UserBean>();
    int size = users != null ? users.length : 0;
    for (int index = 0; index < size; index++)
    {
      UserBean user = users[index];
      {
        // TODO: Only process the subscriber type currently: User and Organization. Support other types(Group) in future.

        String userId = user.getId();
        if (userId != null)
        {
          idList.add(userId);
          typeList.add(Subscriber.TYPE_USER);
        }

        String orgId = user.getOrgId();
        if (orgId != null)
        {
          idList.add(orgId);
          typeList.add(Subscriber.TYPE_ORG);
        }

        uncachedUserList.add(user);
      }
    }
    
    if (uncachedUserList.size() > 0)
    {
      // Get the entitlements information from database.
      Map<String, Subscriber> subscriberMap = subscriberDAO != null ? subscriberDAO.getSubscriberByIDsTypes(idList, typeList) : null;
      LOG.log(Level.FINEST, "entitlement information in database is " + subscriberMap);

      int length = uncachedUserList != null ? uncachedUserList.size() : 0;
      for (int index = 0; index < length; index++)
      {
        EntitlementLevel level = defaultLevel;
        UserBean user = uncachedUserList.get(index);
        
        // TODO: Only process the subscriber type currently: User and Organization. Support other types(Group) in future.
        String userId = user.getId();
        String orgId = user.getOrgId();
        if (subscriberMap != null)
        {
          if (userId != null)
          {
            Subscriber subscriber = subscriberMap.get(userId + "_" + Subscriber.TYPE_USER);
            if (subscriber != null && Subscriber.STATE_ACTIVE.equals(subscriber.getState()))
            {
              level = this.parseEntitlementLevel(subscriber.getEntitlement());
              LOG.log(Level.FINEST, "subscriber " + subscriber.getId() + " in state " + subscriber.getState() + " to get entitlement " + level);
            }
            else
            {
              if (orgId != null)
              {
                subscriber = subscriberMap.get(orgId + "_" + Subscriber.TYPE_ORG);
                if (subscriber != null && Subscriber.STATE_ACTIVE.equals(subscriber.getState()))
                {
                  level = this.parseEntitlementLevel(subscriber.getEntitlement());
                  LOG.log(Level.FINEST, "subscriber " + subscriber.getId() + " in state " + subscriber.getState() + " to get entitlement " + level);
                }
              }
            }
          }
        }
        
        userLevelMap.put(user, level);
      }
    }
    
    return userLevelMap;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#getEntitlementLevel(com.ibm.concord.spi.beans.UserBean, boolean)
   */
  public EntitlementLevel getEntitlementLevel(UserBean user)
  {
    LOG.entering(this.getClass().getName(), "getEntitlementLevel", new Object[]{user.getId()});
    EntitlementLevel level = null;    
    String entitleStr = user.getEntitlement();
    if(entitleStr != null && entitleStr.length() > 0 )
    { // get entitlement from UserBean first
      level = this.parseEntitlementLevel(entitleStr);
      level = level != null ? level : EntitlementLevel.NONE;
    }
    else
    { // otherwise, get entitlement from the database then.  
      Map<UserBean, EntitlementLevel> levelMap = getEntitlementLevels(new UserBean[]{user});
      level = levelMap.get(user);  
      level = level != null ? level : EntitlementLevel.NONE;
      user.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), level.toString());
    }
        
    LOG.exiting(this.getClass().getName(), "getEntitlementLevel", new Object[]{user.getId()});
    return level;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spi.entitlements.IEntitlementService#getEntitlementLevel(com.ibm.concord.spi.entitlements.Subscriber)
   */
  public EntitlementLevel getEntitlementLevel(Subscriber subscriber)
  {
    LOG.entering(this.getClass().getName(), "getEntitlementLevel", new Object[]{subscriber.getId(), subscriber.getCustomerId()});
    EntitlementLevel level = EntitlementLevel.NONE;
    if (subscriber != null)
    {
      level = parseEntitlementLevel(subscriber.getEntitlement());
    }
    LOG.exiting(this.getClass().getName(), "getEntitlementLevel", new Object[]{subscriber.getId(), subscriber.getCustomerId()});
    return level;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#getEntitlements(com.ibm.concord.spi.beans.UserBean)
   */
  public Map<String, Entitlement> getEntitlements(UserBean user)
  {
    LOG.entering(this.getClass().getName(), "getEntitlements", new Object[]{user.getId()});
    Map<String, Entitlement> entitlements = getEntitlementsByLevel(getEntitlementLevel(user));
    LOG.exiting(this.getClass().getName(), "getEntitlements", new Object[]{user.getId()});
    return entitlements;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#isEntitled(com.ibm.concord.spi.beans.UserBean, java.lang.String)
   */
  public boolean isEntitled(UserBean user, String featureName)
  {
    LOG.entering(this.getClass().getName(), "isEntitled", new Object[]{user.getId(), featureName});
    Map<String, Entitlement> entitlementsMap = getEntitlements(user);
    boolean isEntitled = false;
    if (entitlementsMap != null)
    {
      Entitlement entitlement = entitlementsMap.get(featureName);
      if (entitlement != null)
      {
        isEntitled = entitlement.getBooleanValue();
      }
    }
    LOG.exiting(this.getClass().getName(), "isEntitled", new Object[]{user.getId(), featureName});
    return isEntitled;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#isEntitled(com.ibm.concord.spi.beans.UserBean[], java.lang.String)
   */
  public boolean[] isEntitled(UserBean[] users, String featureName)
  {
    LOG.entering(this.getClass().getName(), "isEntitled", new Object[]{users.length, featureName});
    boolean[] result = null;
    int length = users != null ? users.length : 0;
    if (length > 0)
    {
      result = new boolean[length];
      Map<UserBean, EntitlementLevel> levelsMap = this.getEntitlementLevels(users);
      for (int index = 0; index < length; index++)
      {
        result[index] = false;
        Map<String, Entitlement> entitlementsMap = getEntitlementsByLevel(levelsMap.get(users[index]));
        if (entitlementsMap != null)
        {
          Entitlement entitlement = entitlementsMap.get(featureName);
          result[index] = entitlement != null ? entitlement.getBooleanValue() : false;
          LOG.log(Level.FINEST, "user {0} is entitld to access this feature? {1}", new Object[]{users[index].getId(), result[index]});
        }
      }
    }
    LOG.exiting(this.getClass().getName(), "isEntitled", new Object[]{users.length, featureName});
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#getSubscriber(java.lang.String, int)
   */
  public Subscriber getSubscriber(String id, int type)
  {
    LOG.entering(this.getClass().getName(), "getSubscriber", new Object[]{id, type});
    Subscriber subscriber = null;
    if (subscriberDAO != null)
    {
      subscriber = subscriberDAO.getSubscriber(id, type);
    }
    LOG.exiting(this.getClass().getName(), "getSubscriber", new Object[]{id, type});
    return subscriber;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#getSubscriberCountByCustID(java.lang.String)
   */
  public int getSubscriberCountByCustID(String customerId)
  {
    LOG.entering(this.getClass().getName(), "getSubscriberCountByCustID", new Object[]{customerId});
    int count = 0;
    if (subscriberDAO != null)
    {
      count = subscriberDAO.getSubscriberCountByCustID(customerId);
    }
    LOG.exiting(this.getClass().getName(), "getSubscriberCountByCustID", new Object[]{customerId});
    return count;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#addSubscriber(com.ibm.concord.platform.entitlement.Subscriber)
   */
  public boolean addSubscriber(Subscriber subscriber)
  {
    LOG.entering(this.getClass().getName(), "addSubscriber", new Object[]{subscriber.getId(), subscriber.getCustomerId(), subscriber.getEntitlement()});
    boolean result = false;
    if (subscriberDAO != null)
    {
//      updateEntitlementInCache(subscriber.getId(), parseEntitlementLevel(subscriber.getEntitlement()));
      result = subscriberDAO.addSubscriber(subscriber);
    }
    LOG.exiting(this.getClass().getName(), "addSubscriber", new Object[]{subscriber.getId(), subscriber.getCustomerId(), subscriber.getEntitlement()});
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#updateSubscriber(com.ibm.concord.platform.entitlement.Subscriber)
   */
  public boolean updateSubscriber(Subscriber subscriber)
  {
    LOG.entering(this.getClass().getName(), "updateSubscriber", new Object[]{subscriber.getId(), subscriber.getCustomerId()});
    boolean result = false;
    if (subscriberDAO != null && subscriber != null)
    {
      result = subscriberDAO.updateSubscriber(subscriber);
    }
    LOG.exiting(this.getClass().getName(), "updateSubscriber", new Object[]{subscriber.getId(), subscriber.getCustomerId()});
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.entitlement.IEntitlementService#revokeSubscriber(java.lang.String, int)
   */
  public boolean removeSubscriber(String id, int type)
  {
    LOG.entering(this.getClass().getName(), "removeSubscriber", new Object[]{id, type});
    boolean result = false;
    if (subscriberDAO != null)
    {
      result = subscriberDAO.removeSubscriber(id, type);
    }
    LOG.exiting(this.getClass().getName(), "removeSubscriber", new Object[]{id, type});
    return result;
  }
}
