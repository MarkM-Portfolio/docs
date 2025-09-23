/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.entitlement;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.entitlement.dao.IDocEntitlementDAO;
import com.ibm.docs.entitlement.dao.IOrgEntitlementDAO;
import com.ibm.docs.entitlement.dao.IUserEntitlementDAO;
import com.ibm.docs.entitlement.gatekeeper.GateKeeperServiceImpl;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * 
 */
public class EntitlementComponent extends Component
{
  private static final String CLASS_NAME = EntitlementComponent.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS_NAME);

  public static final String COMPONENT_ID = "com.ibm.docs.entitlement";

  private IEntitlementService entitleService = null;

  private IGateKeeperService gateKeeperService = null;

  private IDocEntitlementDAO docEntitlementDAO;

  private IOrgEntitlementDAO orgEntitlementDAO;

  private IUserEntitlementDAO userEntitlementDAO;

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.platform.component.Component#init(com.ibm.json.java. JSONObject)
   */
  protected void init(JSONObject config) throws InitializationException
  {
    entitleService = new EntitlementServiceImpl();
    gateKeeperService = new GateKeeperServiceImpl();
    try
    {
      Class<?> clazz = Class.forName("com.ibm.concord.dao.db2.DocEntitlementDAOImpl");
      docEntitlementDAO = (IDocEntitlementDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.OrgEntitlementDAOImpl");
      orgEntitlementDAO = (IOrgEntitlementDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.UserEntilementDAOImpl");
      userEntitlementDAO = (IUserEntitlementDAO) clazz.newInstance();
    }
    catch (ClassNotFoundException e)
    {
      LOG.log(Level.WARNING, "Failed to initialize GateKeeper service DAO adapters ", e);
    }
    catch (IllegalAccessException e)
    {
      LOG.log(Level.WARNING, "Failed to initialize GateKeeper service DAO adapters ", e);
    }
    catch (InstantiationException e)
    {
      LOG.log(Level.WARNING, "Failed to initialize GateKeeper service DAO adapters ", e);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.platform.component.Component#getService(java.lang.Class)
   */
  public Object getService(Class<?> clazz)
  {
    if (clazz == IEntitlementService.class)
    {
      return entitleService;
    }
    if (clazz == IGateKeeperService.class)
    {
      return gateKeeperService;
    }
    else if (clazz == IDocEntitlementDAO.class)
    {
      return docEntitlementDAO;
    }
    else if (clazz == IOrgEntitlementDAO.class)
    {
      return orgEntitlementDAO;
    }
    else if (clazz == IUserEntitlementDAO.class)
    {
      return userEntitlementDAO;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }
}
