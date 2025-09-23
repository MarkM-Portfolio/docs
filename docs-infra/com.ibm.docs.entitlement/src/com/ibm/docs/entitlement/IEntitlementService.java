/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

/**
 *
 */
package com.ibm.docs.entitlement;

import java.util.Map;

import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.Subscriber;

/**
 * Service being used to manage the entitlements.
 *
 */
public interface IEntitlementService
{
  public static final String ENTITLE_NAME_ASSIGNMENT = "assignment";
  public static final String ENTITLE_NAME_COEDIT = "coedit";
  public static final String ENTITLE_NAME_CONVERSION_DURING_UPLOAD = "conversion_during_upload";

  /**
   * Gets all the entitlements information according to the level.
   *
   * @param level
   * @return
   */
  public Map<String, Entitlement> getEntitlementsByLevel(EntitlementLevel level);

  /**
   * Gets the entitlement level information of specified user. Any cache will be ignored.
   *
   * @param user
   * @return
   */
  public EntitlementLevel getEntitlementLevel(UserBean user);

  /**
   * Gets the entitlement level information of specified subscriber.
   *
   * @param subscriber presents the checked subscriber
   * @return entitlement level
   */
  public EntitlementLevel getEntitlementLevel(Subscriber subscriber);

  /**
   * Gets all the entitlements information of specified user.
   *
   * @param user
   * @return
   */
  public Map<String, Entitlement> getEntitlements(UserBean user);

  /**
   * Checks if the user is entitled for specified feature.
   *
   * @param user presents the checked user
   * @param featureName presents the feature name
   * @return true if the user is entitled for specified feature, otherwise false
   */
  public boolean isEntitled(UserBean user, String featureName);

  /**
   * Checks whether the specified users are entitled for the feature or not.
   *
   * @param users presents the users being checked
   * @param featureName presents the feature name being checked
   * @return the boolean array that presents whether the users are entitled for specified feature
   */
  public boolean[] isEntitled(UserBean[] users, String featureName);

  /**
   * Get the subscriber by the subscriber's id, the subscriber could be an user, an organization, or a group.
   *
   * @param id subscriber's id
   * @param type specifies the subscriber type, it could be 0: user; 1: organization; 2: group
   * @return the subscriber instance with specified id or <code>null</code> if none
   */
  public Subscriber getSubscriber(String id, int type);

  /**
   * Get the count of subscribers according the customer id, the customer could be an organization.
   *
   * @param customerId specifies the id of the customer id
   * @return the count of subscribers
   */
  public int getSubscriberCountByCustID(String customerId);

  /**
   * Add a subscriber that subscribes the entitlement on HCL Docs services.
   *
   * @param subscriber specifies the subscriber being added
   * @return true if add the subscriber successfully, false otherwise
   */
  public boolean addSubscriber(Subscriber subscriber);

  /**
   * Remove the specified subscriber that subscribes the entitlement on HCL Docs services.
   *
   * @param id specifies the id of subscriber being removed
   * @param type specifies the subscriber type being removed, it could be 0: user; 1: organization; 2: group
   * @return true if remove the subscriber successfully, false otherwise
   */
  public boolean removeSubscriber(String id, int type);

  /**
   * Update the specified subscriber that subscribes the entitlement on HCL Docs services.
   *
   * @param subscriber specifies the subscriber being updated
   * @return true if update the subscriber successfully, false otherwise
   */
  public boolean updateSubscriber(Subscriber subscriber);

  /**
   * Defines the entitlement level. Provides four levels currently(The levels may be changed in future):
   * <li>1. NONE: presents that HCL Docs is not entitled to be used;</li>
   * <li>2. BASIC: presents that HCL Docs is entitled to be used, but features 'assignment' and 'coedit' are not entitled.</li>
   * <li>3. SOCIAL: presents that HCL Docs is entitled to be used, and features 'assignment' and 'coedit' are also entitled.</li>
   * <li>4. FULL: presents that all the HCL Docs features are entitled.</li>
   *
   */
  public static enum EntitlementLevel
  {
    NONE,
    BASIC,
    SOCIAL,
    FULL,
    CUSTOM_1,
    CUSTOM_2,
    CUSTOM_3
  }
}
