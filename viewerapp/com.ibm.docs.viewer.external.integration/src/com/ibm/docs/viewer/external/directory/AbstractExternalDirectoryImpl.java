package com.ibm.docs.viewer.external.directory;

import java.util.List;

import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;

public abstract class AbstractExternalDirectoryImpl
{
  public abstract UserBean getById(UserBean caller, String id);

  public abstract IOrg getOrgById(String orgId);

  public abstract UserBean getByEmail(UserBean caller, String email);

  public abstract UserBean getByDN(UserBean caller, String DN);

  public abstract List<UserBean> search(UserBean user, String query);

  public abstract IMembersModel getMembersModel();
}