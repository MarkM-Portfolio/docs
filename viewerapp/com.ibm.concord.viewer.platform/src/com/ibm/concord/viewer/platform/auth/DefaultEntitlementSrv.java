package com.ibm.concord.viewer.platform.auth;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.spi.entitlement.IEntitlementService;

public class DefaultEntitlementSrv implements IEntitlementService
{
  public boolean isEntitledUser(HttpServletRequest request)
  {
    return request.isUserInRole(ROLE_ENTITLED_USER);
  }

}
