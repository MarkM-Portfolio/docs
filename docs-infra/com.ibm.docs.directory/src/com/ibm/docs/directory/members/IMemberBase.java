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

import java.util.Set;

public interface IMemberBase
{
  public static final String PROP_PRINCIPALID = "principal_id";
  
  public static final String DEFAULT_ORG_ID = "default_org";
  
  public String getId();
  
  public String getProperty(String key);
  public void setProperty(String key, String value);
  public Set<String> listProperties();
}
