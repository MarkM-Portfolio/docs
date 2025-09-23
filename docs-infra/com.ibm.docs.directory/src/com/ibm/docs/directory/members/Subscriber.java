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

package com.ibm.docs.directory.members;

/**
 * Presents the information of subscriber on HCL Docs services in database.
 *
 */
public class Subscriber
{
  /**
   * Presents the subscriber's type is an user.
   */
  public static final int TYPE_USER = 0;
  /**
   * Presents the subscriber's type is an organization.
   */
  public static final int TYPE_ORG = 1;
  /**
   * Presents the subscriber's type is a group.
   */
  public static final int TYPE_GROUP = 2;

  public static final String STATE_ACTIVE = "ACTIVE";
  public static final String STATE_SUSPENDED = "SUSPENDED";
  public static final String STATE_PENDING = "PENDING";
  public static final String STATE_HELD = "HELD";
  public static final String STATE_REMOVE_PENDING = "REMOVE_PENDING";
  public static final String STATE_REMOVED = "REMOVED";

  private String id;
  private String customerId;
  private int type;
  private String locale;
  private String displayName;
  private String email;
  private String state;
  private String entitlement;

  /**
   *
   * @param id
   */
  public Subscriber(String id)
  {
    this.id = id;
  }

  /**
   *
   * @param id
   * @param customerId
   * @param type
   * @param displayName
   * @param email
   * @param state
   * @param entitlement
   */
  public Subscriber(String id, String customerId, int type, String locale, String displayName, String email, String state, String entitlement)
  {
    this.id = id;
    this.customerId = customerId;
    this.type = type;
    this.locale = locale;
    this.displayName = displayName;
    this.email = email;
    this.state = state;
    this.entitlement = entitlement;
  }

  /**
   * Get the id of this subscriber.
   *
   * @return
   */
  public String getId()
  {
    return id;
  }

  /**
   * Get the customer id of this subscriber.
   *
   * @return
   */
  public String getCustomerId()
  {
    return customerId;
  }

  /**
   * Set the customer id of this subscriber.
   *
   * @param customerId
   */
  public void setCustomerId(String customerId)
  {
    this.customerId = customerId;
  }

  /**
   * Get the type of this subscriber.
   *
   * @return
   */
  public int getType()
  {
    return this.type;
  }

  /**
   * Set the type of this subscriber.
   *
   * @param type
   */
  public void setType(int type)
  {
    this.type = type;
  }

  public String getLocale()
  {
    return this.locale;
  }

  public void setLocale(String locale)
  {
    this.locale = locale;
  }

  /**
   * Get the display name of this subscriber.
   *
   * @return
   */
  public String getDisplayName()
  {
    if (displayName != null && displayName.length() > 128)
    {
      return displayName.substring(0, 128);
    }
    else
    {
      return displayName;
    }
  }

  /**
   * Set the display name of this subscriber.
   *
   * @param displayName
   */
  public void setDisplayName(String displayName)
  {
    this.displayName = displayName;
  }

  /**
   * Get the email of this subscriber.
   *
   * @return
   */
  public String getEmail()
  {
    return email;
  }

  /**
   * Set the email of this subscriber.
   *
   * @param email
   */
  public void setEmail(String email)
  {
    this.email = email;
  }

  /**
   * Get the state of this subscriber.
   *
   * @return
   */
  public String getState()
  {
    return state;
  }

  /**
   * Set the state of this subscriber.
   *
   * @param state
   */
  public void setState(String state)
  {
    this.state = state;
  }

  /**
   * Get the entitlement level of this subscriber. All the levels are defined in class <code>EntitlementLevel</code>
   *
   * @return
   */
  public String getEntitlement()
  {
    return entitlement;
  }

  /**
   * Set the entitlement level of this subscriber. All the levels are defined in class <code>EntitlementLevel</code>
   *
   * @param entitlement specifies the level
   */
  public void setEntitlement(String entitlement)
  {
    this.entitlement = entitlement;
  }
}
