/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.members;

public enum UserProperty {
  PROP_DISPLAYNAME ("display_name"),
  PROP_EMAIL ("email"),
  PROP_ISTHIRDPARTY ("is_thirdparty"),
  PROP_DN ("dn"),
  PROP_ORGID ("org_id"),
  PROP_ORGNAME ("org_name"),
  PROP_CUSTOMERID ("customer_id"),
  PROP_ROLEID ("role_id"),
  PROP_ROLENAME ("role_name"),
  PROP_REPOID ("repo_id"),
  PROP_TELEPHONE ("telephone"),
  PROP_MOBILE ("mobile"),
  PROP_JOBTITLE ("job_title"),
  PROP_ADDRESS ("address"),
  PROP_PHOTO ("photo"), 
  PROP_SHORTNAME ("short_name");
    
  private final String key;
  
  UserProperty(String key)
  {
    this.key = key;
  }

  @Override
  public String toString()
  {
    return this.key;
  }
}
