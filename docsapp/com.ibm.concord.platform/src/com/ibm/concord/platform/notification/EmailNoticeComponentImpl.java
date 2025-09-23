/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.notification;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.spi.notification.IEmailNoticeAdapter;
import com.ibm.concord.spi.notification.IPreference;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class EmailNoticeComponentImpl extends Component
{
  private static final Logger LOG = Logger.getLogger(EmailNoticeComponentImpl.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.platform.email.notice";

  private Map<String, IEmailNoticeAdapter> providersMap = new HashMap<String, IEmailNoticeAdapter>();
  
  private Map<String, IPreference> prefProvidersMap = new HashMap<String, IPreference>();

  protected void init(JSONObject config) throws InitializationException
  {
    LOG.finer("entering( " + "init" + config + ")");

    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IEmailNoticeAdapter provider = (IEmailNoticeAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);
        provider.init(providerConfig);
        providersMap.put(id, provider);
        createPreferenceProvider(providerConfig);
      }
      catch (Exception e)
      {
        ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.INIT_EMAIL_COMPONENT_ERROR, "component " + COMPONENT_ID, e);
        throw new IllegalStateException(e);
      }
    }

    LOG.finer("exting( " + "init" + config + ")");

  }

  private void createPreferenceProvider(JSONObject providerConfig)
  {
    try
    {
      if(providerConfig.get("id").equals("lcfiles"))    
      {
        Class<?> clazz = Class.forName("com.ibm.concord.lc3.notification.ConnectionsPreferenceImpl");
        IPreference preference = (IPreference) clazz.newInstance();
        preference.init(providerConfig);
        prefProvidersMap.put("lcfiles", preference);
      }
      else
      {
        
      }
    }
    catch(Exception e)
    {
      LOG.log(Level.SEVERE, "failed to load preference class from configuration", e);
    }
   
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    if(clazz == IEmailNoticeAdapter.class)
    {
      return providersMap.get(adaptorId);
    }
    else if(clazz == IPreference.class)
    {
      return prefProvidersMap.get(adaptorId);
    }
    return super.getService(clazz, adaptorId);
  }
}
