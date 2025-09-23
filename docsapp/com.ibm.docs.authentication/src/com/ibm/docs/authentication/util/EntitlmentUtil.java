package com.ibm.docs.authentication.util;

import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.EntitlementConstants;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.framework.ComponentRegistry;

public class EntitlmentUtil
{
  private static final Logger LOG = Logger.getLogger(EntitlmentUtil.class.getName());

  private static EntitlementLevel defaultLevel4AutoProvision = EntitlementLevel.FULL;

  public static String getEntitlementLevelForRole(HttpServletRequest request)
  {
    if (request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_1))
      return EntitlementLevel.CUSTOM_1.toString();

    if (request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_2))
      return EntitlementLevel.CUSTOM_2.toString();

    if (request.isUserInRole(EntitlementConstants.USER_ROLE_CUSTOM_3))
      return EntitlementLevel.CUSTOM_3.toString();

    if (request.isUserInRole(EntitlementConstants.USER_ROLE_FULL_ENTITLED))
      return EntitlementLevel.FULL.toString();

    if (request.isUserInRole(EntitlementConstants.USER_ROLE_SOCIAL_ENTITLED))
      return EntitlementLevel.SOCIAL.toString();

    if (request.isUserInRole(EntitlementConstants.USER_ROLE_BASIC_ENTITLED))
      return EntitlementLevel.BASIC.toString();

    if (request.isUserInRole(EntitlementConstants.USER_ROLE_ENTITLED))
      return defaultLevel4AutoProvision.toString();

    return null;
  }

  public static boolean checkEntitlement(HttpServletRequest request, UserBean userBean, boolean doProvision)
  {
    return checkEntitlement(request, userBean, doProvision, null);
  }
  /**
   * 
   * @param request
   * @param userBean
   * @param doProvision
   * @param roleLevel is input level, it will be updated to database
   * @return
   */
  public static boolean checkEntitlement(HttpServletRequest request, UserBean userBean, boolean doProvision, String roleLevel)
  {
    IEntitlementService entitlementSvr = (IEntitlementService) ComponentRegistry.getInstance()
        .getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class);
    if (roleLevel == null || "".equalsIgnoreCase(roleLevel))
    {
      roleLevel = getEntitlementLevelForRole(request);
    }
    LOG.log(Level.INFO, "The newly entitled user {0} was mapped to entitlement level {1}.", new Object[] { userBean.getId(), roleLevel });
    if (roleLevel != null)
    {// predefined user role
      userBean.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), roleLevel);
      if (userBean.getId() != null && doProvision)
      {
        EntitlementLevel level = entitlementSvr.getEntitlementLevel(userBean);
        if (EntitlementLevel.NONE == level)
        {// not in subscriber table or have NONE entitle
          Subscriber subscriber = new Subscriber(userBean.getId(), userBean.getCustomerId(), Subscriber.TYPE_USER, "",
              userBean.getDisplayName(), userBean.getEmail(), Subscriber.STATE_ACTIVE, roleLevel);
          if (entitlementSvr.addSubscriber(subscriber))
          {// try add it
            LOG.log(Level.INFO, "The newly entitled user {0} was added into subscriber table for entitlement level {1}.", new Object[] {
                userBean.getId(), roleLevel });
          }
          else
          {// failure
            LOG.log(Level.WARNING, "The newly entitled user {0} was failed to add or update for entitlement level {1}.", new Object[] {
                userBean.getId(), roleLevel });
          }
        }
        else
        {// entitle changed
          Subscriber subscriber = new Subscriber(userBean.getId(), userBean.getCustomerId(), Subscriber.TYPE_USER, "",
              userBean.getDisplayName(), userBean.getEmail(), Subscriber.STATE_ACTIVE, roleLevel);
          if (entitlementSvr.updateSubscriber(subscriber))
          {// update first
            LOG.log(Level.INFO, "The entitled user {0} was updated for entitlement level {1}.",
                new Object[] { userBean.getId(), roleLevel });
          }
          else if (entitlementSvr.addSubscriber(subscriber))
          {// or, add it again
            LOG.log(Level.INFO, "The entitled user {0} was added into subscriber table for entitlement level {1}.",
                new Object[] { userBean.getId(), roleLevel });
          }
          else
          {
            LOG.log(Level.WARNING, "The entitled user {0} was failed to be removed for entitlement level {1}.",
                new Object[] { userBean.getId(), roleLevel });
          }
        }
      }
      else
      {
        if (userBean.getId() == null)
        {
          LOG.log(Level.WARNING, "The entitled user has no ID!!!");
        }
      }
      return true;
    }
    else
    {
      if (userBean.getId() != null && doProvision && EntitlementLevel.NONE != entitlementSvr.getEntitlementLevel(userBean))
      {
        if (entitlementSvr.removeSubscriber(userBean.getId(), Subscriber.TYPE_USER))
        {
          LOG.log(Level.INFO, "The entitled user {0} was deleted from subscriber table.", userBean.getId());
        }
        else
        {
          LOG.log(Level.WARNING, "The entitled user {0} was failed to be deleted from subscriber table.", userBean.getId());
        }
      }
      else
      {
        LOG.log(Level.WARNING, "The entitled user {0} was not mapped to predefined role.", userBean.getId());
      }
      return false;
    }
  }
  
  public static boolean isURLAllowed4Mobile(HttpServletRequest request, Set<URLMatcher> URL_PATTERN)
  {
    String ua = request.getHeader("User-Agent");
    boolean noEntitleCheck = false;
    if (ua != null && ua.toLowerCase().contains("mobile"))
    {
      boolean enabledEntitle4Mobile = false;
      String value = (String) ComponentRegistry.getInstance().getComponent(EntitlementComponent.COMPONENT_ID).getConfig().get("mobile_entitle_check");
      if (value != null)
      {
        enabledEntitle4Mobile = Boolean.parseBoolean(value);
      }
      if (enabledEntitle4Mobile)
      {
        Iterator<URLMatcher> iterator = URL_PATTERN.iterator();
        while (iterator.hasNext())
        {
          URLMatcher matcher = iterator.next();
          noEntitleCheck = matcher.match(request.getRequestURI(), request.getParameterMap());
          if (noEntitleCheck)
          {
            LOG.log(Level.FINEST, request.getRequestURI() + " " + noEntitleCheck);
            break;
          }
        }
      }
    }
    return noEntitleCheck;
  }  
}
