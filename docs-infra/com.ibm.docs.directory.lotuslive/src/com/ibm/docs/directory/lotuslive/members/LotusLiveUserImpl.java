/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.lotuslive.members;

import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;

import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.wsspi.wssecurity.saml.data.SAMLAttribute;

public class LotusLiveUserImpl implements IUser
{
  public static final String SAML_ATTR_SUBSCRIBERID = "saas_subscriberid";
  static final String SAML_ATTR_PERSONID = "saas_personid";
  static final String SAML_ATTR_CUSTOMERID = "saas_customerid";
  static final String SAML_ATTR_MAIL = "saas_mail";
  static final String SAML_ATTR_USERNAME = "saas_username";
  static final String SAML_ATTR_ORGID = "saas_customerid";
  static final String SAML_ATTR_ORGNAME = "saas_orgname";
  static final String SAML_ATTR_GROUPS = "saas_groups";
  static final String SAML_ATTR_SESSIONCREATION = "saas_sessioncreation";  
  
  public static final String PROP_STATE = "state";
  public static final String PROP_ENTITLEMENT = "entitlement";
  
  private String id;
  private HashMap<String, String> properties = new HashMap<String, String>();
  
  public LotusLiveUserImpl(Subject subject)
  {
    Set<List> attrSet = subject.getPublicCredentials(List.class);
    if (attrSet != null && !attrSet.isEmpty())
    {
      for (List attr : attrSet)
      {                        
        for (Object attrObj : attr)
        {
          if(attrObj instanceof SAMLAttribute)
          {
            SAMLAttribute samlAttr = (SAMLAttribute) attrObj;
            
            if(SAML_ATTR_SUBSCRIBERID.equals(samlAttr.getName()))
            {
              this.id = samlAttr.getStringAttributeValue()[0];
            }
            if(SAML_ATTR_CUSTOMERID.equals(samlAttr.getName()))
            {
              this.setProperty(UserProperty.PROP_CUSTOMERID.toString(), samlAttr.getStringAttributeValue()[0]);
            }
            if(SAML_ATTR_MAIL.equals(samlAttr.getName()))
            {
              this.setProperty(UserProperty.PROP_EMAIL.toString(), samlAttr.getStringAttributeValue()[0]);
            }
            if(SAML_ATTR_USERNAME.equals(samlAttr.getName()))
            {
              this.setProperty(UserProperty.PROP_DISPLAYNAME.toString(), samlAttr.getStringAttributeValue()[0]);
            }
            if(SAML_ATTR_ORGID.equals(samlAttr.getName()))
            {
              this.setProperty(UserProperty.PROP_ORGID.toString(), samlAttr.getStringAttributeValue()[0]);
            }
          }
        }
      }
    }
  }
  
  public LotusLiveUserImpl(String id, Map<String, String> properties)
  {
	  this.id = id;
	  this.properties.putAll(properties);
  }
  
  public LotusLiveUserImpl(String id, DSObject dsObj)
  {
    this.id = id;
    this.setProperty(UserProperty.PROP_CUSTOMERID.toString(), dsObj.get_orgid());
    this.setProperty(UserProperty.PROP_EMAIL.toString(), dsObj.get_email());
    this.setProperty(UserProperty.PROP_DISPLAYNAME.toString(), dsObj.get_name());
    this.setProperty(UserProperty.PROP_ORGID.toString(), dsObj.get_orgid());
  }
  
  public LotusLiveUserImpl(Subscriber subscriber)
  {
    this.id = subscriber.getId();
    this.setProperty(UserProperty.PROP_CUSTOMERID.toString(), subscriber.getCustomerId());
    this.setProperty(UserProperty.PROP_EMAIL.toString(), subscriber.getEmail());
    this.setProperty(UserProperty.PROP_DISPLAYNAME.toString(), subscriber.getDisplayName());
    this.setProperty(UserProperty.PROP_ORGID.toString(), subscriber.getCustomerId());
  }

  public LotusLiveUserImpl(HttpServletRequest request)
  {
    this.id = request.getHeader(SAML_ATTR_SUBSCRIBERID);
    this.setProperty(UserProperty.PROP_CUSTOMERID.toString(), request.getHeader(SAML_ATTR_CUSTOMERID));
    this.setProperty(UserProperty.PROP_EMAIL.toString(), request.getHeader(SAML_ATTR_MAIL));
    
    String userName = request.getHeader(SAML_ATTR_USERNAME);
    try
    {
      if (userName != null)
      {
        userName = URLDecoder.decode(userName, "UTF-8");        
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    this.setProperty(UserProperty.PROP_DISPLAYNAME.toString(), userName);
    
    this.setProperty(UserProperty.PROP_ORGID.toString(), request.getHeader(SAML_ATTR_ORGID));
  }

  public String getId()
  {
    return this.id;
  }

  public String getProperty(String key)
  {
    return this.properties.get(key);
  }

  public void setProperty(String key, String value)
  {
    this.properties.put(key, value);
  }

  public Set<String> listProperties()
  {
    return this.properties.keySet();
  }

  public IOrg getOrg()
  {
    // TODO: No implementation of IOrg for LL environment yet
    return null;
  }

}
