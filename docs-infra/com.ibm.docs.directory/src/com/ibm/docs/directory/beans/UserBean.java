/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.beans;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class UserBean
{
  protected IUser user;

  // Keys for JSON
  public static final String ID = "id";

  public static final String ORG_ID = "org_id";

  public static final String ORG_NAME = "org_name";

  public static final String CUSTOMER_ID = "cust_id";

  public static final String EMAIL = "email";

  public static final String IS_EXTERNAL = "is_external";

  public static final String DISPLAY_NAME = "disp_name";

  public static final String DISTINGUISH_NAME = "dn";

  public static final String ROLE_ID = "role_id";

  public static final String ROLE_NAME = "role_name";

  public static final String TELEPHONE = "tel";

  public static final String MOBILE = "mobile";

  public static final String PHOTO_URL = "photo";

  public static final String JOB_TITLE = "job_title";

  public static final String ADDRESS = "addr";
  
  private Map<String, Object> objs = new HashMap<String, Object>();

  public UserBean()
  {
    this.user = new IUser()
    {
      private Map<String, String> props = new HashMap<String, String>();

      public String getId()
      {
        return props.get(ID);
      }

      public String getProperty(String key)
      {
        return props.get(key);
      }

      public void setProperty(String key, String value)
      {
        props.put(key, value);
      }

      public Set<String> listProperties()
      {
        return this.props.keySet();
      }

      public IOrg getOrg()
      {
        return null;
      }
    };
  }

  public UserBean(IUser user)
  {
    this.user = user;
  }

  public UserBean(String userId, String orgId, String displayName, String email)
  {
    this();
    this.user.setProperty(ID, userId);
    this.user.setProperty(ORG_ID, orgId);
    this.user.setProperty(CUSTOMER_ID, orgId);
    this.user.setProperty(DISPLAY_NAME, displayName);
    this.user.setProperty(EMAIL, email);
  }

  public String getProperty(String key)
  {
    return user.getProperty(key);
  }

  public void setProperty(String key, String value)
  {
    user.setProperty(key, value);
  }

  public String getId()
  {
    return user.getId();
  }

  public String getOrgId()
  {
    return getProperty(UserProperty.PROP_ORGID.toString());
  }

  public String getOrgName()
  {
    return getProperty(UserProperty.PROP_ORGNAME.toString());
  }

  /**
   * @deprecated, use getOrgId() instead.
   * @return
   */
  public String getCustomerId()
  {
    return getOrgId();
  }

  /**
   * If you are not sure the right choice between this _getCustomerId or getOrgId, then choose getOrgId.
   * 
   * @return
   */
  public String _getCustomerId()
  {
    return getProperty(UserProperty.PROP_CUSTOMERID.toString());
  }

  public String getEmail()
  {
    return getProperty(UserProperty.PROP_EMAIL.toString());
  }

  public String getDisplayName()
  {
    return getProperty(UserProperty.PROP_DISPLAYNAME.toString());
  }

  public String getShortName()
  {
    return getProperty(UserProperty.PROP_SHORTNAME.toString());
  }
  
  public String getExternal()
  {
    return getProperty(UserProperty.PROP_ISEXTERNAL.toString());
  }

  public String getDistinguishName()
  {
    return getProperty(UserProperty.PROP_DN.toString());
  }

  public String getRoleId()
  {
    return getProperty(UserProperty.PROP_ROLEID.toString());
  }

  public String getRoleName()
  {
    return getProperty(UserProperty.PROP_ROLENAME.toString());
  }

  public String getTelephone()
  {
    return getProperty(UserProperty.PROP_TELEPHONE.toString());
  }

  public String getMobile()
  {
    return getProperty(UserProperty.PROP_MOBILE.toString());
  }

  public String getPhotoUrl()
  {
    return getProperty(UserProperty.PROP_PHOTO.toString());
  }

  public String getJobTitle()
  {
    return getProperty(UserProperty.PROP_JOBTITLE.toString());
  }

  public String getAddress()
  {
    return getProperty(UserProperty.PROP_ADDRESS.toString());
  }

  public String getEntitlement()
  {
    return getProperty(UserProperty.PROP_ENTITLEMENT.toString());
  }

  public String getGateKeeper()
  {
    return getProperty(UserProperty.PROP_GATEKEEPER.toString());
  }
  
  public Object getObject(String key)
  {
    return objs.get(key);
  }
  
  public void setObject(String key, Object obj)
  {
    objs.put(key, obj);
  }

  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();
    json.put(ID, this.getId());

    String orgId = this.getOrgId();
    json.put(ORG_ID, orgId == null ? "" : orgId);

    String orgName = this.getOrgName();
    json.put(ORG_NAME, orgName == null ? "" : orgName);

    String customerId = this.getCustomerId();
    json.put(CUSTOMER_ID, customerId == null ? "" : customerId);

    String email = this.getEmail();
    json.put(EMAIL, email == null ? "" : email);

    String displayName = this.getDisplayName();
    json.put(DISPLAY_NAME, displayName == null ? "" : displayName);

    String isExternal = this.getExternal();
    json.put(IS_EXTERNAL, isExternal == null ? "" : isExternal);

    String dn = this.getDistinguishName();
    json.put(DISTINGUISH_NAME, dn == null ? "" : dn);

    String tel = this.getTelephone();
    json.put(TELEPHONE, tel == null ? "" : tel);

    String mobile = this.getMobile();
    json.put(MOBILE, mobile == null ? "" : mobile);

    String jobTitle = this.getJobTitle();
    json.put(JOB_TITLE, jobTitle == null ? "" : jobTitle);

    String address = this.getAddress();
    json.put(ADDRESS, address == null ? "" : address);

    String roleId = this.getRoleId();
    json.put(ROLE_ID, roleId == null ? "" : roleId);

    String roleName = this.getRoleName();
    json.put(ROLE_NAME, roleName == null ? "" : roleName);

    String photoUrl = this.getPhotoUrl();
    json.put(PHOTO_URL, photoUrl == null ? "" : photoUrl);

    String entitlement = this.getEntitlement();
    json.put(UserProperty.PROP_ENTITLEMENT.toString(), entitlement == null ? "" : entitlement);

    JSONObject obj = null;
    String gatekeeper = null;
    try
    {
      gatekeeper = this.getGateKeeper();
      if (gatekeeper != null && !"".equals(gatekeeper))
      {
        obj = JSONObject.parse(gatekeeper);
      }
    }
    catch (Exception e)
    {
      String CLASS_NAME = UserBean.class.getName();
      Logger LOG = Logger.getLogger(CLASS_NAME);
      LOG.log(Level.WARNING, "Failed to parse gatekeeper: " + gatekeeper, e);
    }
    if (obj != null)
    {
      json.put(UserProperty.PROP_GATEKEEPER.toString(), obj);
    }

    return json;
  }
  
  public String toString()
  {
    return this.getId() + ":" + this.getCustomerId();
  }
}
