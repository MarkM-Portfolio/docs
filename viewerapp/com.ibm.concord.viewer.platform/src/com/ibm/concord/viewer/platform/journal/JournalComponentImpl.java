/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.journal;

import java.io.File;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.spi.journal.IJournalAdapter;
import com.ibm.json.java.JSONObject;

import com.ibm.concord.viewer.config.ViewerConfig;

public class JournalComponentImpl extends Component
{
  private static final Logger LOG = Logger.getLogger(JournalComponentImpl.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.viewer.platform.journal";

  private IJournalAdapter adapter;

  @Override
  protected void init(JSONObject config)
  {
    LOG.finer("entering( " + "init" + config + ")");
    String path = ViewerConfig.getInstance().getInstallRoot() + File.separator + "journal";
    File file = new File(path);
    if (!file.exists())
    {
      file.mkdirs();
    }
    try
    {
      JSONObject adapterJson = (JSONObject) config.get("adapter");
      String clazz = (String) adapterJson.get("class");
      JSONObject adapterCfg = (JSONObject) adapterJson.get("config");
      adapter = (IJournalAdapter) Class.forName(clazz).newInstance();
      adapter.init(adapterCfg);
    }
    catch (Throwable e)
    {
      LOG.severe("init failed" + e);
    }
    LOG.finer("exting( " + "init" + config + ")");
  }

  public Object getService(Class<?> clazz)
  {
    if (IJournalAdapter.class == clazz)
    {
      return adapter;
    }
    return null;
  }

  public Object getService(String id)
  {
    throw new UnsupportedOperationException("Not implemented yet.");
  }
}
