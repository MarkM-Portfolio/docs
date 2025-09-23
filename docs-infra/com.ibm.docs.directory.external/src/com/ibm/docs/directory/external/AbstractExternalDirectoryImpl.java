package com.ibm.docs.directory.external;

import java.util.List;

import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;

public abstract class AbstractExternalDirectoryImpl
{
  public abstract UserBean getById(UserBean caller, String id);

  public abstract IOrg getOrgById(String orgId);

  public abstract UserBean getByEmail(UserBean caller, String email);

  public abstract UserBean getByDN(UserBean caller, String DN);

  public abstract List<UserBean> search(UserBean user, String query);

  public abstract IMembersModel getMembersModel();
}
