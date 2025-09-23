package com.ibm.concord.services.rest.handlers;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.UserPreferenceBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IUserPreferenceDAO;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.EntitlementConstants;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.json.java.JSONObject;

public class EntitlementHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(EntitlementHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);

    JSONObject json = parseUser(request, user);
    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    json.serialize(response.getWriter());

  }

  public static JSONObject parseUser(HttpServletRequest request, UserBean user)
  {
    JSONObject json = user.toJSON();

    IUserPreferenceDAO prefDAO = (IUserPreferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IUserPreferenceDAO.class);
    UserPreferenceBean prefBean = prefDAO.getById(user.getId(), "");// userid + prop_key TODO
    if (prefBean != null && prefBean.getPreference() != null)
    {
      byte[] prefBytes = prefBean.getPreference();
      JSONObject prefJson = null;
      try
      {
        prefJson = JSONObject.parse(new String(prefBytes));
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "parsing preference io error.", e);
      }
      json.put("preference", prefJson);
    }
    LOG.info(new ActionLogEntry(user, Action.CHECKENTITLEMENT, "").toString());

    IEntitlementService entitlementSvr = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IEntitlementService.class);
    EntitlementLevel entitlementLevel = entitlementSvr.getEntitlementLevel(user);
    json.put("entitlement", entitlementLevel.ordinal());

    IGateKeeperService gkService = (IGateKeeperService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IGateKeeperService.class);
    JSONObject features = gkService.getUserFeatures(user);
    json.put("gatekeeper", ((features == null) ? "" : features));

    boolean isCloud = Platform.getConcordConfig().isCloud();
    boolean isS2SCall = ConcordUtil.isS2SCallRequest(request);
    if (isCloud && !isS2SCall)
    {
      boolean hasBHDocs = CookieHelper.hasDocsEntitlementCookie(request, user.getId());
      json.put("entitlement_allowed", hasBHDocs);
    }
    else
    {
      boolean isEntitled = request.isUserInRole(EntitlementConstants.USER_ROLE_ENTITLED);
      isEntitled = isEntitled || request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_1)
          || request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_2) || request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_3);
      json.put("entitlement_allowed", isEntitled);
    }
    return json;
  }

}
