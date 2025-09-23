package com.ibm.docs.viewer.mail.directory;

import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.mail.auth.MailMembersModel;
import com.ibm.docs.viewer.mail.auth.MailUserImpl;
import com.ibm.json.java.JSONObject;

public class MailDirectory implements IDirectoryAdapter
{
  private MailMembersModel membersModel;

  private static Logger LOG = Logger.getLogger(MailDirectory.class.getName());

  @Override
  public void init(JSONObject config)
  {
    this.membersModel = new MailMembersModel(DSProviderFactory.INSTANCE.getProfileProvider());
  }

  @Override
  public UserBean getById(UserBean caller, String id)
  {
    MailUserImpl userImpl = null;
    DSObject dsObj = null;
    try
    {
      dsObj = this.membersModel.getDSProvider().searchDSObjectByExactIdMatch(id, DSObject.ObjectType.PERSON);
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching " + id, e);
    }

    if (dsObj != null)
    {
      LOG.log(Level.FINE, "Get dsObj with userId {0}, orgId is {1}.", new String[] { dsObj.get_id(), dsObj.get_orgid() });
      userImpl = new MailUserImpl(this.membersModel, dsObj);
    }
    else
    {
      // let's return a profile anyway
      HashMap<String, String> properties = new HashMap<String, String>();
      properties.put(UserProperty.PROP_DN.toString(), id);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), id);
      userImpl = new MailUserImpl(this.membersModel, id, properties);
      LOG.log(Level.FINE, "Create a fake dsObj as {0}, orgId is {1}.", new String[] { userImpl.getId(), userImpl.getOrg().getId() });
    }

    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + "/images/NoPhoto_Person_48.png");
    return new UserBean(userImpl);
  }

  @Override
  public UserBean getByEmail(UserBean caller, String email)
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<UserBean> search(UserBean user, String query)
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IMembersModel getMembersModel()
  {
    return this.membersModel;
  }

}
