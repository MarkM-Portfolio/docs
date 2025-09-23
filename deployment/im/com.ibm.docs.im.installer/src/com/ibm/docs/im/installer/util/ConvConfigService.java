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
import com.ibm.docs.im.installer.common.ui.ConvServiceListener;

public class ConvConfigService
{
  private static String convUrl;

  private static List<ConvServiceListener> listeners = new ArrayList<ConvServiceListener>(2);

  private ConvConfigService()
  {
  }

  public static void register(ConvServiceListener listener)
  {
    listeners.add(listener);
  }

  public static void notify(String url)
  {
    setConvURLValue(url);
    Iterator<ConvServiceListener> it = listeners.iterator();
    while (it.hasNext())
    {
      ConvServiceListener service = it.next();
      if (!isDisposed(service))
        service.update();
    }
  }

  private static boolean isDisposed(ConvServiceListener service)
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

  private static synchronized void setConvURLValue(String url)
  {
    convUrl = url;
  }

  public static synchronized String getConvURLValue()
  {
    return convUrl;
  }

}
