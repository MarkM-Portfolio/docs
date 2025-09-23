/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.proxy.lotuslive.saml.filter;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class SAMLUser
{
  static final String SAML_ATTR_SUBSCRIBERID = "saas_subscriberid";

  static final String SAML_ATTR_PERSONID = "saas_personid";

  static final String SAML_ATTR_CUSTOMERID = "saas_customerid";

  static final String SAML_ATTR_MAIL = "saas_mail";

  static final String SAML_ATTR_USERNAME = "saas_username";

  static final String SAML_ATTR_ORGID = "saas_orgid";

  static final String SAML_ATTR_ORGNAME = "saas_orgname";

  static final String SAML_ATTR_GROUPS = "saas_groups";

  static final String SAML_ATTR_SESSIONCREATION = "saas_sessioncreation";

  private String personid;

  private String email;

  private String orgid;

  private String customerid;

  private String username;

  private String subscribeid;

  private String orgname;

  private String groups;

  private String sessioncreation;

  public SAMLUser(HashMap map)
  {
    Iterator it = map.entrySet().iterator();
    while (it.hasNext())
    {
      Map.Entry pairs = (Map.Entry) it.next();
      String key = (String) pairs.getKey();
      if (key.equalsIgnoreCase(SAML_ATTR_PERSONID))
        personid = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_CUSTOMERID))
        customerid = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_SUBSCRIBERID))
        subscribeid = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_MAIL))
        email = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_USERNAME))
        username = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_ORGID))
        orgid = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_ORGNAME))
        orgname = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_GROUPS))
        groups = (String) pairs.getValue();
      if (key.equalsIgnoreCase(SAML_ATTR_SESSIONCREATION))
        sessioncreation = (String) pairs.getValue();
    }
  }

  public String getPersonId()
  {
    return this.personid;
  }

  public String getUserName()
  {
    return this.username;
  }

  public String getOrgId()
  {
    return this.orgid;
  }

  public String getEmail()
  {
    return this.email;
  }

  public String getCustomerId()
  {
    return this.customerid;
  }

  public String getSubscribeId()
  {
    return this.subscribeid;
  }

  public String getOrgName()
  {
    return this.orgname;
  }

  public String getGroups()
  {
    return this.groups;
  }

  public String getSessionCreation()
  {
    return this.sessioncreation;
  }
}
