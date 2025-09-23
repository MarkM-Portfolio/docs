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

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import com.ibm.json.java.JSONObject;


/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class ACE
{
  private String principal;
  private Set<Permission> permissions;
  // Specifies the type of the ACE, such as: "user", "community". This ACE presents an user if the 'type' is null.
  private String type;
  
  public static final String PRINCIPAL = "principal";
  public static final String PERMISSION = "permission";
  public static final String TYPE = "type";
  public static final String SEPARATOR = ",";
  
  /**
   * @param principal   A prinicpal represents a user management object, e.g, a user, group or role
   * @param permissions A set of permissions
   */
  public ACE(String principal, Set<Permission> permissions)
  {
    this.principal = principal;
    this.permissions = permissions;
  }
  
  /**
   * @param principal   A prinicpal represents a user management object, e.g, a user, group or role
   * @param permissions A set of permissions
   * @param type Specifies the type, such as: "user", "community". This ACE presents an user if the 'type' is null.
   */
  public ACE(String principal, Set<Permission> permissions, String type)
  {
    this.principal = principal;
    this.permissions = permissions;
    this.type = type;
  }
  
  public String getPrincipal()
  {
    return principal;
  }
  
  public Set<Permission> getPermissions()
  {
    return permissions;
  }
  
  public String getType()
  {
    return type;
  }
  
  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();
    json.put(PRINCIPAL, principal);
    
    StringBuffer sb = new StringBuffer("");
    Iterator<Permission> iter = permissions.iterator();
    while (iter.hasNext())
    {
      Permission p = iter.next();
      sb.append(p);
      if (iter.hasNext())
      {
        sb.append(SEPARATOR);
      }
    }
    json.put(PERMISSION, sb.toString());
    
    if (type != null)
    {
      json.put(TYPE, type);
    }
    
    return json;
  }
  
  public static ACE fromJSON(JSONObject json)
  {
    String principal = (String)json.get(PRINCIPAL);
    String permissions = (String)json.get(PERMISSION);
    String type = (String)json.get(TYPE);
    String[] ps = permissions.split(SEPARATOR);
    Set<Permission> permSet = new HashSet<Permission>();
    for (int i = 0; i < ps.length; i++)
    {
      if (ps[i].equalsIgnoreCase("edit"))
      {
        permSet.add(Permission.EDIT);
      }
      else {
        permSet.add(Permission.VIEW);
      }
    }
    ACE ace = new ACE(principal, permSet, type);
    return ace;
  }
}
