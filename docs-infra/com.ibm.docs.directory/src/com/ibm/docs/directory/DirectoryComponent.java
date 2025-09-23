/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.common.oauth.IOAuthTokenListener;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.dao.ICustomerCredentialDAO;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class DirectoryComponent extends Component
{
  private static final Logger LOG = Logger.getLogger(DirectoryComponent.class.getName());

  public static final String COMPONENT_ID = "com.ibm.docs.directory";

  private Map<String, IDirectoryAdapter> providersMap = new HashMap<String, IDirectoryAdapter>();

  private IDirectoryAdapter defaultProvider;

  private ISubscriberDAO subscriberDAO;

  private ICustomerCredentialDAO ccDAO;
  
  private IOAuthTokenListener oauthTokenListener;

  protected void init(JSONObject config) throws InitializationException
  {
    LOG.finer("entering( " + "init" + config + ")");

    try
    {
      Class<?> clazzS = Class.forName("com.ibm.concord.dao.db2.SubscriberDAOImpl");
      subscriberDAO = (ISubscriberDAO) clazzS.newInstance();

      Class<?> clazzC = Class.forName("com.ibm.concord.dao.db2.CustomerCredentialDAOImpl");
      ccDAO = (ICustomerCredentialDAO) clazzC.newInstance();
      
      Class<?> clazzO = Class.forName("com.ibm.concord.dao.db2.OAuthTokenDAOImpl");
      oauthTokenListener = (IOAuthTokenListener) clazzO.newInstance();
    }
    catch (ClassNotFoundException e)
    {
      LOG.log(Level.SEVERE, "component " + COMPONENT_ID + "com.ibm.concord.dao.db2.SubscriberDAOImpl" + " initialization failed", e);
    }
    catch (IllegalAccessException e)
    {
      LOG.log(Level.SEVERE, "component " + COMPONENT_ID + "com.ibm.concord.dao.db2.SubscriberDAOImpl" + " initialization failed", e);
    }
    catch (InstantiationException e)
    {
      LOG.log(Level.SEVERE, "component " + COMPONENT_ID + "com.ibm.concord.dao.db2.SubscriberDAOImpl" + " initialization failed", e);
    }
    catch (Throwable e)
    {
      LOG.log(Level.SEVERE, "component " + COMPONENT_ID + "com.ibm.concord.dao.db2.SubscriberDAOImpl" + " initialization failed", e);
    }

    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IDirectoryAdapter provider = (IDirectoryAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);
        provider.init(providerConfig);
        providersMap.put(id, provider);
        if (id.equalsIgnoreCase((String) config.get("default")))
        {
          defaultProvider = provider;
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "component " + COMPONENT_ID + " initialization failed", e);
        throw new IllegalStateException(e);
      }
    }

    LOG.finer("exting( " + "init" + config + ")");

  }

  public Object getService(Class<?> clazz)
  {
    if (IDirectoryAdapter.class == clazz)
    {
      return defaultProvider;
    }
    else if (clazz == ISubscriberDAO.class)
    {
      return subscriberDAO;
    }
    else if (clazz == ICustomerCredentialDAO.class)
    {
      return ccDAO;
    }
    else if (clazz == IOAuthTokenListener.class)
    {
      return oauthTokenListener;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    if (IDirectoryAdapter.class == clazz)
    {
      IDirectoryAdapter adapter = providersMap.get(adaptorId);
      return adapter;
    }
    return super.getService(clazz);
  }

}
