/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public enum Permission
{
  VIEW, EDIT, PUBLISH;
  
  public static final Set<Permission> EMPTY_SET = Collections.unmodifiableSet(EnumSet.noneOf(Permission.class));
  
  public static final Set<Permission> VIEW_SET = Collections.unmodifiableSet(EnumSet.of(VIEW));
  
  public static final Set<Permission> EDIT_SET = Collections.unmodifiableSet(EnumSet.of(VIEW, EDIT));
  
  public static final Set<Permission> PUBLISH_SET = Collections.unmodifiableSet(EnumSet.of(VIEW, EDIT, PUBLISH));
  
  /**
   * @param permissions
   * @return false if the permission set is null or does not contain this permission.
   */
  public boolean hasPermission(Set<Permission> permissions)
  {
    return (permissions != null && permissions.contains(this));
  }
}
