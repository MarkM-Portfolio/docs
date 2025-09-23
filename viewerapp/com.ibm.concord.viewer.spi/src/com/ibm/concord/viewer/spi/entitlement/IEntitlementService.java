package com.ibm.concord.viewer.spi.entitlement;

import javax.servlet.http.HttpServletRequest;

public interface IEntitlementService
{
  public static final String ROLE_ENTITLED_USER = "entitledUser";

  public boolean isEntitledUser(HttpServletRequest request);
}
