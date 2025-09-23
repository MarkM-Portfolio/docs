/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.beans;

import java.util.HashMap;
import java.util.Map;

import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class UserBean
{
  private IUser user;

  // Keys for JSON
  public static final String ID = "id";

  public static final String ORG_ID = "org_id";

  public static final String ORG_NAME = "org_name";

  public static final String CUSTOMER_ID = "cust_id";

  public static final String EMAIL = "email";

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

  public UserBean(IUser user)
  {
    this.user = user;
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

  public String getCustomerId()
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

  public String getShortName()
  {
    return getProperty(UserProperty.PROP_SHORTNAME.toString());
  }

  public Object getObject(String key)
  {
    return objs.get(key);
  }
  
  public void setObject(String key, Object obj)
  {
    objs.put(key, obj);
  }
  public String compositeDisplayAndEmail()
  {
    String email = this.getEmail();
    String displayName = this.getDisplayName();

    if (email == null)
    {
      return displayName;
    }
    else
    {
      return displayName + Constant.USERDISPLAY_COMPOSITE_PREFIX + email + Constant.USERDISPLAY_COMPOSITE_SUFFIX;
    }
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

    return json;
  }

}
