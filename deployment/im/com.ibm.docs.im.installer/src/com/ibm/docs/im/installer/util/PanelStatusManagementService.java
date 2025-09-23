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
import com.ibm.cic.common.core.model.IFeature;
import com.ibm.docs.im.installer.common.ui.PanelStatusListener;

public class PanelStatusManagementService
{
  private static List<PanelStatusListener> listeners = new ArrayList<PanelStatusListener>(2);
  
  private static List<CustomPanel> panels = new ArrayList<CustomPanel>(2);  
  
  static public PanelStatusManagementService instance = null;
  
  private static List<String> selectedFeatureList = new ArrayList<String>(2);

  private PanelStatusManagementService()
  {
  }
  
  public static PanelStatusManagementService getInstance()
  {
    if (instance==null)
      instance = new PanelStatusManagementService();
    
    return instance;
  }
  
  public static void register(PanelStatusListener listener)
  {
    if (!listeners.contains(listener))
      listeners.add(listener);
  }

  public static void statusNotify()
  {

    Iterator<PanelStatusListener> it = listeners.iterator();
    while (it.hasNext())
    {
      PanelStatusListener service = it.next();
      if (!isDisposed(service))
        service.statusUpdate();
    }
  }
  //improve in future
  public static void force()
  {

    Iterator<PanelStatusListener> it = listeners.iterator();
    while (it.hasNext())
    {
      PanelStatusListener service = it.next();
      if (!isDisposed(service))
        service.forceUpdate();
    }
  }

  public static void add(CustomPanel panel)
  {
    if (!panels.contains(panel))
      panels.add(panel);
  }
  
  public static void remove(CustomPanel panel)
  {
    if (panels.contains(panel))
      panels.remove(panel);
  }
  
  public static boolean getCompletedStatus()
  {
    Iterator<CustomPanel> it = panels.iterator();
    while (it.hasNext())
    {
      CustomPanel service = it.next();
      if (!service.isPageComplete())
        return false;
    }
    
    return true;
  }
  
  private static boolean isDisposed(PanelStatusListener service)
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
  
  public static void clean()
  {
    listeners.clear();
    panels.clear();
  }
  
  public static boolean isSelectedFeaturesChanged(IFeature[] features)
  {    
    boolean bChanged = false;
    if (features==null || features.length==0)
      return bChanged;
    
    List tmp = new ArrayList<String>(2);
    for (IFeature feature:features)
    {
      tmp.add(feature.getSelector().getIdentity().getId());
    }
    
    if (selectedFeatureList.size()>0)
    {
      Iterator<String> it = selectedFeatureList.iterator();
      while (it.hasNext())
      {
        String feature = it.next();        
        if (!tmp.contains(feature))
        {
          bChanged = true;          
          break;
        }
      }
    }
    
    if (!bChanged && tmp.size()>0 && selectedFeatureList.size()>0 && tmp.size() != selectedFeatureList.size())
      bChanged = true;
    
    if (bChanged || selectedFeatureList.size()==0)
    {
      selectedFeatureList.clear();
      selectedFeatureList.addAll(tmp);      
    }
    
    return bChanged && getCompletedStatus();
  }
}
