/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer;

import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.osgi.framework.BundleContext;

public class DocsPlugin extends AbstractUIPlugin
{
  // The plug-in ID
  public static final String PLUGIN_ID = "com.ibm.docs.im.installer"; //$NON-NLS-1$

  // The shared instance
  private static DocsPlugin plugin;

  public DocsPlugin()
  {
    plugin = this;
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.eclipse.ui.plugin.AbstractUIPlugin#stop(org.osgi.framework.BundleContext)
   */
  public void stop(BundleContext context) throws Exception
  {
    plugin = null;
    super.stop(context);
  }

  /**
   * Returns the shared instance
   * 
   * @return the shared instance
   */
  public static DocsPlugin getDefault()
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
