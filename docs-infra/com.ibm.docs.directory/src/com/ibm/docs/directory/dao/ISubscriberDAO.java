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

package com.ibm.docs.directory.dao;

import java.util.List;
import java.util.Map;

import com.ibm.docs.directory.members.Subscriber;

/**
 * Data access object for accessing Subscriber database table.
 *
 */
public interface ISubscriberDAO
{
  public static final String COL_SUBSCRIBER_ID = "ID";
  public static final String COL_CUSTOMER_ID = "CUSTOMER_ID";
  public static final String COL_TYPE = "TYPE";
  public static final String COL_LOCALE = "LOCALE";
  public static final String COL_DISPLAY_NAME = "DISPLAY_NAME";
  public static final String COL_EMAIL = "EMAIL";
  public static final String COL_STATE = "STATE";
  public static final String COL_ENTITLEMENT = "ENTITLEMENT";

  /**
   * Get user properties of the specified subscriber.
   *
   * @param subscriberId, the id of the retrieving subscriber.
   * @return a map containing property key and value pairs.
   */
  public Map<String, String> getById(String subscriberId);

  /**
   * Get a list of subscriber id of the specified customer.
   *
   * @param customerId, the id of the retrieving customer.
   * @return a list containing all the subscribers of the customer.
   */
  public List<String> getByCustomerId(String customerId);

  /**
   * Search to find subscriber whose property exactly matched with the specified value.
   *
   * @param column, the DB column of the matching property.
   * @param value, the property value of the matching criteria.
   * @return a list of matched subscriber id.
   */
  public List<String> searchByColumnExactMatch(String column, String value);

  /**
   * Search to find subscriber whose property substring matched with the specified value.
   *
   * @param column, the DB column of the matching property.
   * @param value, the property value of the matching criteria.
   * @return a list of matched subscriber id.
   */
  public List<String> searchByColumnSubString(String column, String value);

  /**
   * Get the subscriber by the subscriber's id, the subscriber could be an user, an organization, or a group.
   *
   * @param subscriberId id of subscriber, it could be user id, organization id, or group id
   * @param type specifies the subscriber type, it could be 0: user; 1: organization; 2: group
   * @return the subscriber instance with specified id or <code>null</code> if none
   */
  public Subscriber getSubscriber(String subscriberId, int type);

  /**
   * Get the subscriber by the subscriber's id and customer's id, the subscriber could be an user, an organization, or a group.
   *
   * @param subscriberId
   * @param type
   * @param String
   * @return
   */
  public Subscriber getSubscriber(String subscriberId, int type, String customerId);

  /**
   * Find the subscribers from database according to the specified id and type list.
   *
   * @param idList specifies the list of subscriber id that want to find, each id in this list should match the type in typeList
   * @param typeList specifies the list of subscriber type that want to find, each type in this list should match the id in idList
   * @return the a map, the key is the id_type, the value is the subscriber
   */
  public Map<String, Subscriber> getSubscriberByIDsTypes(List<String> idList, List<Integer> typeList);

  /**
   * Get the count of subscribers according the customer id, the customer could be an organization.
   *
   * @param customerId specifies the id of the customer id
   * @return the count of subscribers
   */
  public int getSubscriberCountByCustID(String customerId);

  /**
   * Add a subscriber that subscribes the entitlement on HCL Docs services into database.
   *
   * @param subscriber specifies the subscriber being added
   * @return true if add the subscriber into database successfully, false otherwise
   */
  public boolean addSubscriber(Subscriber subscriber);

  /**
   * Remove the specified subscriber that subscribes the entitlement on HCL Docs services from database.
   *
   * @param subscriberId subscriberId id of subscriber being removed from database
   * @param type specifies the subscriber type, it could be 0: user; 1: organization; 2: group
   * @return true if remove the subscriber from database successfully, false otherwise
   */
  public boolean removeSubscriber(String subscriberId, int type);

  /**
   * Update the specified subscriber that subscribes the entitlement on HCL Docs services in database.
   *
   * @param subscriber specifies the subscriber being updated
   * @return true if update the subscriber in database successfully, false otherwise
   */
  public boolean updateSubscriber(Subscriber subscriber);

  /**
   * Update the entitlement of the specified subscriber on HCL Docs services in database.
   *
   * @param subscriber
   * @return
   */
  public boolean updateSubscriberEntitlement(Subscriber subscriber);
}
