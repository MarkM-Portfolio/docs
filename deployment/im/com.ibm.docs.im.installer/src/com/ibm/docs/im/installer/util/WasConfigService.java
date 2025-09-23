/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.util;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.ibm.cic.agent.ui.extensions.CustomPanel;
import com.ibm.docs.im.installer.common.ui.WASServiceListener;

public class WasConfigService
{
  private static List<WASServiceListener> listeners = new ArrayList<WASServiceListener>(2);

  private WasConfigService()
  {
  }

  public static void register(WASServiceListener listener)
  {
    listeners.add(listener);
  }

  public static void doService()
  {

    Iterator<WASServiceListener> it = listeners.iterator();
    while (it.hasNext())
    {
      WASServiceListener service = it.next();
      if (!isDisposed(service))
        service.doWASService();
    }
  }

  private static boolean isDisposed(WASServiceListener service)
  {
    if (service instanceof CustomPanel)
    {
      CustomPanel panel = (CustomPanel) service;
      if (panel.isDisposed())
        return true;
      else
        return false;
    }
    return true;
  }
}
