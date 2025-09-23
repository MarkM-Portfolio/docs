/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.mail.auth;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Enumeration;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;

import filters.auth.AuthHelper;
import filters.auth.methods.helpers.User;

public class WebSEAL
{

  private static Logger log = Logger.getLogger(WebSEAL.class.getName());

  private static WebSEAL instance = null;

  public static final String HEADER_IVUSER = "iv-user";

  public static final String HEADER_USERID = "ldap_subscriberid";

  public static final String HEADER_CUSTOMERID = "ldap_customerid";

  public static final String HEADER_PERSONID = "ldap_personid";

  public static final String HEADER_NAME = "ldap_username";

  public static final String HEADER_EXTID = "ldap_extid";

  public static final String HEADER_ORGID = "ldap_orgid";

  public static final String HEADER_ORGNAME = "ldap_orgname";

  public static final String HEADER_ROLES = "iv-groups";

  public static final String HEADER_EAI_AUTH = "eai_auth";

  public static final String HEADER_BYPASS_IP_CHECK = "bypass_ip_check";

  public static final String HEADER_APP_PASSWORD = "app_password";

  public static final String HEADER_VALUE_UNAUTHENTICATED = "unauthenticated";

  public static WebSEAL getInstance()
  {
    if (instance == null)
      instance = new WebSEAL();
    return instance;
  }

  protected WebSEAL()
  {
    log.log(Level.FINE, "WebSEAL initialized");
  }

  public UserBean verify(HttpServletRequest request, HttpServletResponse response)
  {
    log.entering(WebSEAL.class.getName(), "verify");

    Enumeration<String> names = request.getHeaderNames();

    if (log.isLoggable(Level.FINE))
    {
      log.log(Level.FINE, "called for url " + request.getRequestURL() + " from " + request.getRemoteAddr());
      log.log(Level.FINE, "Requst headers: ");
      while (names.hasMoreElements())
      {
        String name = (String) names.nextElement();
        log.log(Level.FINE, "\t- " + name + ": " + request.getHeader(name));
      }
    }

    final String ivuser = urldecode(request.getHeader(HEADER_IVUSER));
    if (ivuser == null)
    {
      log.log(Level.WARNING, "No iv-user header.");
      return null;
    }

    if (ivuser.equalsIgnoreCase(HEADER_VALUE_UNAUTHENTICATED))
    {
      log.log(Level.WARNING, "Unauthenticated value in the header");
      return null;
    }

    log.log(Level.FINE, "Request contain proper iv-user header: " + ivuser);

    User user = getUserFromHeaders(request);
    AuthHelper.setCurrentUser(user);
    UserBean usrBean = getUserBean(user);

    log.exiting(WebSEAL.class.getName(), "verify");

    return usrBean;
  }

  private UserBean getUserBean(final User user)
  {
    log.entering(WebSEAL.class.getName(), "getUserBean");

    // check validation
    if (user == null || user.getSubscriberId() == null || user.getCustomerId() == null)
    {
      return null;
    }

    UserBean userbean = new UserBean(new IUser()
    {
      @Override
      public void setProperty(String key, String value)
      {
        // TODO Auto-generated method stub

      }

      @Override
      public Set<String> listProperties()
      {
        // TODO Auto-generated method stub
        return null;
      }

      @Override
      public String getProperty(String key)
      {
        if (key.equals(UserProperty.PROP_CUSTOMERID.toString()))
        {
          return user.getCustomerId();
        }
        else if (key.equals(UserProperty.PROP_EMAIL.toString()))
        {
          return user.getEmail();
        }
        else if (key.equals(UserProperty.PROP_DISPLAYNAME.toString()))
        {
          return user.getFullname();
        }
        else if (key.equals(UserProperty.PROP_ORGID.toString()))
        {
          return user.getOrgId();
        }
        else if (key.equals(UserProperty.PROP_ORGNAME.toString()))
        {
          return user.getOrgName();
        }
        else
        {
          return null;
        }
      }

      @Override
      public String getId()
      {
        return user.getSubscriberId();
      }

      @Override
      public IOrg getOrg()
      {
        return null;
      }
    });

    log.exiting(WebSEAL.class.getName(), "getUserBean");

    return userbean;
  }

  protected static String urldecode(String string)
  {
    if (string == null)
      return null;
    try
    {
      return URLDecoder.decode(string, "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      throw new RuntimeException("UTF-8 encoding is not available");
    }
  }

  public static User getUserFromHeaders(HttpServletRequest request)
  {
    log.entering(WebSEAL.class.getName(), "getUserFromHeaders");

    String userid = urldecode(request.getHeader(HEADER_USERID));
    log.log(Level.FINE, HEADER_USERID + userid == null ? "not found" : userid);

    String name = urldecode(request.getHeader(HEADER_NAME));
    log.log(Level.FINE, HEADER_NAME + name == null ? "not found" : name);

    String customerid = urldecode(request.getHeader(HEADER_CUSTOMERID));
    log.log(Level.FINE, HEADER_CUSTOMERID + customerid == null ? "not found" : customerid);

    String personid = urldecode(request.getHeader(HEADER_PERSONID));
    log.log(Level.FINE, HEADER_PERSONID + personid == null ? "not found" : personid);

    String orgid = urldecode(request.getHeader(HEADER_ORGID));
    log.log(Level.FINE, HEADER_ORGID + orgid == null ? "not found" : orgid);

    String orgname = urldecode(request.getHeader(HEADER_ORGNAME));
    log.log(Level.FINE, HEADER_ORGNAME + orgname == null ? "not found" : orgname);

    String roles = urldecode(request.getHeader(HEADER_ROLES));
    log.log(Level.FINE, HEADER_ROLES + roles == null ? "not found" : roles);

    String extid = urldecode(request.getHeader(HEADER_EXTID));
    log.log(Level.FINE, HEADER_EXTID + extid == null ? "not found" : extid);

    User user = new User(userid, personid, extid, name, customerid, orgid, orgname);

    if (roles != null && roles.length() > 0)
    {
      String[] rolestab = roles.split(",");
      for (String roleId : rolestab)
      {
        roleId = roleId.trim().replaceAll("\"", ""); // remove spaces and double quotes
        user.addRole(roleId);
      }
    }

    log.exiting(WebSEAL.class.getName(), "getUserFromHeaders");
    return user;
  }

  public static String rolesToTam(Set<String> roles)
  {
    StringBuffer result = new StringBuffer();

    boolean first = true;
    for (String roleId : roles)
    {
      if (!first)
      {
        result.append(", ");
      }
      result.append('"');
      result.append(roleId);
      result.append('"');
      first = false;
    }

    return result.toString();
  }

  public String getName()
  {
    return getClass().getName().replaceAll(getClass().getPackage().getName() + ".", "");
  }

}
