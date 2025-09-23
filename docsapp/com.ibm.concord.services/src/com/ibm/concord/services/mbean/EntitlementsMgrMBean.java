/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.mbean;

import com.ibm.concord.spi.exception.AccessException;

/**
 * A JMX management bean that being used to manage the entitlements of subscribers on IBM Docs services.
 * 
 */
public interface EntitlementsMgrMBean
{
  /**
   * Presents the subscriber is an user.
   */
  public static final String SUBSCRIBER_TYPE_USER = "USER";

  /**
   * Presents the subscriber is an organization.
   */
  public static final String SUBSCRIBER_TYPE_ORG = "ORG";

  /**
   * Presents the subscriber is a group.
   */
  public static final String SUBSCRIBER_TYPE_GROUP = "GROUP";

  /**
   * Get the entitlement level of specified subscriber.
   * 
   * @param subscriberId
   *          specifies the id of the subscriber
   * @param subscriberType
   *          specifies the type of the subscriber
   * @return the entitlement level if find the subscriber, <code>null</code> otherwise
   */
  public String getEntitlementLevel(String subscriberId, String subscriberType);

  /**
   * Add a subscriber that subscribes the entitlement on IBM Docs services.
   * 
   * @param subscriberId
   *          specifies the id of the subscriber
   * @param subscriberType
   *          specifies the type of the subscriber
   * @param level
   *          specifies the entitlement level being subscribed
   * @return true if subscriber successfully, false otherwise
   */
  public boolean addSubscriber(String subscriberId, String subscriberType, String level);

  /**
   * Remove the specified subscriber that subscribes the entitlement on IBM Docs services.
   * 
   * @param subscriberId
   *          specifies the id of subscriber being removed
   * @param subscriberType
   *          specifies the subscriber type being removed, it could be 0: user; 1: organization; 2: group
   * @return true if remove the subscriber success, false otherwise
   */
  public boolean removeSubscriber(String subscriberId, String subscriberType);

  /**
   * Update the specified subscriber that subscribes the entitlement on IBM Docs services.
   * 
   * @param subscriberId
   *          specifies the id of subscriber being updated
   * @param subscriberType
   *          specifies the subscriber type being updated, it could be 0: user; 1: organization; 2: group
   * @param level
   *          specifies the entitlement level being updated to
   * @return true if update the subscriber success, false otherwise
   */
  public boolean updateSubscriber(String subscriberId, String subscriberType, String level);

  /**
   * @see com.ibm.docs.entitlement.gatekeeper.GateKeeperAdapter#doService(String, String)
   * @param filepath
   *          GateKeeper configuration file (gatekeeper.json)
   * @throws AccessException
   */
  public boolean doService(String filepath) throws AccessException;
}
