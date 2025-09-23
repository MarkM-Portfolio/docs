package com.ibm.docs.viewer.external.members;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.ibm.concord.viewer.spi.members.IMemberBase;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.docs.viewer.external.directory.ExternalProfilesDirectoryImpl;
import com.ibm.json.java.JSONObject;

public class ExternalProfilesUserImpl implements IUser
{

  private ExternalProfilesMembersModel model;

  private String id;

  private HashMap<String, String> properties = new HashMap<String, String>();

  public ExternalProfilesUserImpl(ExternalProfilesMembersModel model, JSONObject jsonUser)
  {
    this.model = model;
    if (jsonUser != null)
    {
      this.id = (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_ID);
      String reposId = (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_REPO_ID);

      String orgId = (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_ORG_ID);
      if (orgId == null)
      {
        orgId = IMemberBase.DEFAULT_ORG_ID;
      }

      this.properties.put(UserProperty.PROP_DISPLAYNAME.toString(), (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_DISPLAY_NAME));
      this.properties.put(UserProperty.PROP_DN.toString(), id);
      this.properties.put(IMemberBase.PROP_PRINCIPALID, id);
      this.properties.put(UserProperty.PROP_EMAIL.toString(), (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_EMAIL));
      this.properties.put(UserProperty.PROP_ORGID.toString(), orgId);
      this.properties.put(UserProperty.PROP_CUSTOMERID.toString(), orgId);
      this.properties.put(UserProperty.PROP_REPOID.toString(), reposId);
      this.properties.put(UserProperty.PROP_ROLEID.toString(), "1");
      this.properties.put(UserProperty.PROP_ROLENAME.toString(), "1");
      this.properties.put(UserProperty.PROP_SHORTNAME.toString(), (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_NAME));
      this.properties.put(UserProperty.PROP_PHOTO.toString(), (String) jsonUser.get(ExternalProfilesDirectoryImpl.USER_PHOTO_URL));
    }
  }

  public ExternalProfilesUserImpl(ExternalProfilesMembersModel model, String id, Map<String, String> properties)
  {
    this.model = model;
    this.id = id;
    if (properties != null && !properties.isEmpty())
    {
      this.properties.putAll(properties);
    }
  }

  @Override
  public String getId()
  {
    return this.id;
  }

  @Override
  public String getProperty(String key)
  {
    return this.properties.get(key);
  }

  @Override
  public void setProperty(String key, String value)
  {
    this.properties.put(key, value);
  }

  @Override
  public Set<String> listProperties()
  {
    return this.properties.keySet();
  }

  @Override
  public IOrg getOrg()
  {
    String orgId = this.getProperty(UserProperty.PROP_ORGID.toString());
    IOrg org = this.model.getOrg(orgId);
    if (org == null)
    {
      org = this.model.createOrg(orgId, null);
    }
    return org;
  }

}
