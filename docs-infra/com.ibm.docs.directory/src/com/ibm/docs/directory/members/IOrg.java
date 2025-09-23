/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.members;

import java.util.List;
import java.util.Map;

public interface IOrg extends IMemberBase
{
  /**
   * Get an user by unique identifier
   * @param userId the unique identifier
   * @return An instance of IUser which matches the id
   */
  public IUser getUser(String userId);
  
  /**
   * Search users that exactly matches
   * @param prop the property key to search
   * @param value the property value to search
   * @return A list of users that match.
   */
  public List<IUser> getUsersByPropertyExactMatch(UserProperty prop, String value);
  
  /**
   * Search users that contains the search string
   * @param prop the property key to search
   * @param value the property value to search
   * @return A list of users that match
   */
  public List<IUser> getUsersByPropertySubString(UserProperty prop, String value);
  
  /**
   * Create an user
   * @param userId the id to use to identify the user created
   * @param properties the properties for the user created
   * @return the user created
   */
  public IUser createUser(String userId, Map<String, String> properties);
  
  /**
   * Remove an user from organization
   * @param user the user to be removed
   */
  public void removeUser(IUser user);
}
