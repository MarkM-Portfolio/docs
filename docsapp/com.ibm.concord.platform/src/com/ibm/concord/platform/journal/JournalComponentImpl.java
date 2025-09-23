/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.journal;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.framework.Component;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class JournalComponentImpl extends Component
{
  private static final Logger LOG = Logger.getLogger(JournalComponentImpl.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.platform.journal";

  private Map<String, IJournalAdapter> providersMap = new HashMap<String, IJournalAdapter>();

  private IJournalAdapter adapter = new IJournalAdapter()
  {

    public void init(JSONObject config)
    {
      Set<String> adapterKeys = providersMap.keySet();
      for (String adapterKey : adapterKeys)
      {
        IJournalAdapter adapter = providersMap.get(adapterKey);
        adapter.init(config);
      }
    }

    public void publish(Object[] msgBody)
    {
      Set<String> adapterKeys = providersMap.keySet();
      for (String adapterKey : adapterKeys)
      {
        IJournalAdapter adapter = providersMap.get(adapterKey);
        adapter.publish(msgBody);
      }
    }

    public void uninit()
    {
      Set<String> adapterKeys = providersMap.keySet();
      for (String adapterKey : adapterKeys)
      {
        IJournalAdapter adapter = providersMap.get(adapterKey);
        adapter.uninit();
      }
    }
  };

  @Override
  protected void init(JSONObject config)
  {
    LOG.finer("entering( " + "init" + config + ")");
    String path = ConcordConfig.getInstance().getInstallRoot() + File.separator + "journal";
    File file = new File(path);
    if (!file.exists())
    {
      file.mkdirs();
    }

    String dataStorePath = ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "dataStore";
    File dataStoreFile = new File(dataStorePath);
    if (!dataStoreFile.exists())
    {
      dataStoreFile.mkdirs();
    }

    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IJournalAdapter provider = (IJournalAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);
        provider.init(providerConfig);
        providersMap.put(id, provider);
      }
      catch (Exception e)
      {
        ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.INIT_JOURNAL_COMPONENT_ERROR, "component " + COMPONENT_ID, e);
        throw new IllegalStateException(e);
      }
    }

    LOG.finer("exting( " + "init" + config + ")");
  }

  public Object getService(Class<?> clazz)
  {
    if (IJournalAdapter.class == clazz)
    {
      return adapter;
    }
    return super.getService(clazz);
  }

  public void destroy()
  {
    if (adapter != null)
      adapter.uninit();
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }
}
