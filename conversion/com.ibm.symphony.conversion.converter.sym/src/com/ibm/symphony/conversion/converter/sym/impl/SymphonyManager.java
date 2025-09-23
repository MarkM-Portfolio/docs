/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.impl;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class SymphonyManager
{
  private List<SymphonyDescriptor> symphonyQueue;
  
  private List<SymphonyDescriptor> standbySymphonyQueue;

  private int maxSymphonyInstances = 4;
  
  private int maxDisconnectTimes;
  
  private int maxQueueSize = 100;

  private static final Logger LOG = Logger.getLogger(SymphonyManager.class.getName());
  
  public SymphonyManager()
  {
    this.symphonyQueue = new ArrayList<SymphonyDescriptor>();
    this.standbySymphonyQueue = new ArrayList<SymphonyDescriptor>();
    
    this.maxDisconnectTimes = 10;
    init();
  }

  /**
   * Read the soffice instances configuration from the configuration file of conversion server.
   * 
   */
  private void init()
  {
    try
    {
      JSONObject symObj = (JSONObject) ConversionService.getInstance().getConfig("symphony");
      maxQueueSize = ((Long)symObj.get("max-queue-size")).intValue();
      
      JSONArray symphonies = (JSONArray) symObj.get("host-config");
      int total = symphonies.size();
      int usedCount = total;
      // The configuration item "used-host-count" specifies count of soffice instances being used, remain instances are the standby instances.
      Long usedCountLng = (Long)symObj.get("used-host-count");
      if (usedCountLng != null)
      {
        usedCount = usedCountLng.intValue();
        usedCount = (usedCount < 0 || usedCount > total) ? total : usedCount;
      }
      maxSymphonyInstances = usedCount;
      
      LOG.log(Level.INFO, "Total count of soffice instances is: " + symphonies.size() + ", " + usedCount + " instances will be used, others are standby.");
      
      for (int i = 0; i < total && i < usedCount; i++)
      {
        JSONObject obj = (JSONObject) symphonies.get(i);
        String host = obj.get("host").toString();
        String port = obj.get("port").toString();
        SymphonyDescriptor descriptor = new SymphonyDescriptor(host, port);
        symphonyQueue.add(descriptor);
        LOG.log(Level.INFO, "init add symphony descriptors: " + descriptor.port);
      }
      
      // Put standby soffice instances into the standby soffice queue.
      for (int index = usedCount; index < total; index++)
      {
        JSONObject obj = (JSONObject) symphonies.get(index);
        String host = obj.get("host").toString();
        String port = obj.get("port").toString();
        SymphonyDescriptor descriptor = new SymphonyDescriptor(host, port);
        standbySymphonyQueue.add(descriptor);
        LOG.log(Level.INFO, "init add standby symphony descriptors: " + descriptor.port);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Fail to intialize Symphony instance configurations.", e);
    }
  }
  
  /**
   * Get the count of idle soffice instances in the queue.
   * 
   * @return the count of idle soffice instances in the queue
   */
  public int getIdleSymphonyNumber()
  {
    return symphonyQueue.size();
  }
  
  /**
   * Get the count of idle soffice instances in the standby queue.
   * 
   * @return the count of idle soffice instances in the standby queue
   */
  public int getIdleStandbySymphonyNumber()
  {
    return standbySymphonyQueue.size();
  }
  
  /**
   * Get a soffice instance from the soffice queue.
   * 
   * @return the descriptor of the soffice instance, null if the queue is empty
   */
  public synchronized SymphonyDescriptor getSymphonyDescriptor()
  {
    if (symphonyQueue.size() == 0)
    {
      LOG.log(Level.FINE, "The soffice queue is empty currently");
      return null;
    }
    else
    {
      SymphonyDescriptor descriptor = symphonyQueue.remove(0);
      LOG.log(Level.FINE, "Get the soffice from the queue, the port is: " + descriptor.port);
      return descriptor;
    }
  }
  
  /**
   * Get a soffice instance from standby queue, then put the bad soffice into the standby queue.
   * 
   * @param badDescriptor specifies the descriptor of soffice instance that can not connect to currently.
   * 
   * @return the descriptor of the soffice instance from standby queue, null if standby queue is empty
   */
  public synchronized SymphonyDescriptor getStandBySymphonyDescriptor(SymphonyDescriptor badDescriptor)
  {
    if (standbySymphonyQueue.size() == 0)
    {
      LOG.log(Level.FINE, "The standby soffice queue is empty currently");
      return null;
    }
    else
    {
      SymphonyDescriptor descriptor = standbySymphonyQueue.remove(0);
      standbySymphonyQueue.add(badDescriptor);
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "Uses the soffice(port: " + descriptor.port + ") in standby queue to replace the soffice(" + badDescriptor.port + ") in normal queue");
      }
      return descriptor;
    }
  }
  
  /**
   * Insert the descriptor of specified soffice instance into the soffice queue.
   * 
   * @param descriptor
   */
  public synchronized void addSymphonyDescriptor(SymphonyDescriptor descriptor)
  {
    symphonyQueue.add(descriptor); 
    LOG.log(Level.FINE, "Insert the descriptor of soffice instance in the soffice queue, the port is: " + descriptor.port);
  }

  /**
   * Delete specified soffice from the soffice queue.
   * 
   * @param descriptor
   */
  public synchronized void deleteSymphonyDisc(SymphonyDescriptor descriptor)
  {
    for (Iterator<?> iter = symphonyQueue.iterator(); iter.hasNext();)
    {
      SymphonyDescriptor desc = (SymphonyDescriptor) iter.next();
      if (desc.equal(descriptor))
      {
        iter.remove();
        break;
      }
    }
    return;
  }
  
  /**
   * 
   * @param times
   */
  public void setMaxDisconnectTimes(int times)
  {
    this.maxDisconnectTimes = times;
  }

  /**
   * 
   */
  public synchronized void deleteDisconnectSymphonyDiscs()
  {
    for (Iterator<?> iter = symphonyQueue.iterator(); iter.hasNext();)
    {
      SymphonyDescriptor s = (SymphonyDescriptor) iter.next();
      if (s.retry >= maxDisconnectTimes)
      {
        iter.remove();
      }
    }
    return;
  }
  
  /**
   * Get the max number of tasks in the task queue.
   * 
   * @return the max number of tasks in the task queue
   */
  public int getMaxQueueSize()
  {
    return maxQueueSize;
  }
  
  /**
   * Get the max symphony instances count that can be used, not including standby instances
   * @return
   */
  public int getMaxSymInstances()
  {
    return maxSymphonyInstances;
  }
}
