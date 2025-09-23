package com.ibm.docs.im.installer.common;

import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.osgi.framework.BundleContext;

public class CommonPlugin extends AbstractUIPlugin
{
  // The plug-in ID
  public static final String PLUGIN_ID = "com.ibm.docs.im.installer.common"; //$NON-NLS-1$

  // The shared instance
  private static CommonPlugin plugin;

  public CommonPlugin()
  {
    plugin = this;
  }

  public void start(BundleContext arg0) throws Exception
  {
    // TODO Auto-generated method stub

  }

  public void stop(BundleContext arg0) throws Exception
  {
    // TODO Auto-generated method stub
    plugin = null;
    super.stop(arg0);
  }

  /**
   * Returns the shared instance
   * 
   * @return the shared instance
   */
  public static CommonPlugin getDefault()
  {
    return plugin;
  }

  /**
   * Get plugin id
   * 
   * @return plugin id
   */
  public static String getPluginID()
  {
    return PLUGIN_ID;
  }
}
