/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;

public class ConversionContext
{
  public static String CLASS = ConversionContext.class.toString();

  Logger log = Logger.getLogger(ConversionContext.class.getName());
  
  private Map<String, Object> context = new HashMap<String, Object>();

  private OdfToHtmlIndex odfToHtmlIndexTable;

  private HtmlToOdfIndex htmlToOdfIndexTable;
  
  private HashSet<String> headinglinkRefList = new HashSet<String>();
  private HashMap<Element, String> headingNameMap = new HashMap<Element, String>();
  
  private Map<String, Future<?>> subTasks = new HashMap<String,Future<?>>();
  
  private ExecutorService pool;

  public void setExecutorService(ExecutorService pool)
  {
    this.pool = pool;
  }

  public Object get(String key)
  {
    return context.get(key);
  }

  public void put(String key, Object value)
  {
    context.put(key, value);
  }

  public Object remove(String key)
  {
    return context.remove(key);
  }

  public void clear()
  {
    context.clear();
    subTasks.clear();
  }

  public String[] getAllKeys()
  {
    Set<String> keySet = context.keySet();
    String[] keys = new String[keySet.size()];
    keySet.toArray(keys);
    return keys;
  }

  public Object getSource()
  {
    return get("source");
  }

  public Object getTarget()
  {
    return get("target");
  }

  public OdfToHtmlIndex getOdfToHtmlIndexTable()
  {
    return odfToHtmlIndexTable;
  }

  public void setOdfToHtmlIndexTable(OdfToHtmlIndex indexTable)
  {
    this.odfToHtmlIndexTable = indexTable;
  }

  public HashSet<String> getHeadinglinkRefList()
  {
    return headinglinkRefList;
  }
  
  public HashMap<Element, String> getHeadingNameMap()
  {
    return headingNameMap;
  }
  
  /**
   * @return the htmlToOdfIndexTable
   */
  public HtmlToOdfIndex getHtmlToOdfIndexTable()
  {
    return htmlToOdfIndexTable;
  }

  /**
   * @param htmlToOdfIndexTable
   *          the htmlToOdfIndexTable to set
   */
  public void setHtmlToOdfIndexTable(HtmlToOdfIndex htmlToOdfIndexTable)
  {
    this.htmlToOdfIndexTable = htmlToOdfIndexTable;
  }
  
  public void addTask(String id, final Runnable r)
  {
    Future<?> future = pool.submit(r);
    subTasks.put(id, future);
  }
  
  public void addTask(String id, final Callable<?> c)
  {
    Future<?> future = pool.submit(c);
    subTasks.put(id, future);
  }
  
  public Future<?> getTask(String id)
  {
    return subTasks.get(id);
  }
  
  public Collection<Future<?>> getAllSubTasks()
  {
    return subTasks.values();
  }
  
  public void finishAllSubTasks()
  {
    for( Future<?> f : subTasks.values())
    {
      try
      {
        if( ! f.isDone())
          f.get();
      }
      catch (InterruptedException e)
      {
        log.logp(Level.SEVERE, CLASS, "finishAllSubTasks", e.getLocalizedMessage(), e);
      }
      catch (ExecutionException e)
      {
        log.logp(Level.SEVERE, CLASS, "finishAllSubTasks", e.getLocalizedMessage(), e);
      }
    }
  }
  
  /**
   * Finish all subtasks with a maximum allowed timeout value (per outstanding subtask) as specified.
   * @param timeout - in milliseconds.
   */
  public void finishAllSubTasks(long timeout)
  {
    for( Future<?> f : subTasks.values())
    {
      try
      {
        if( ! f.isDone())
          f.get(timeout, TimeUnit.MILLISECONDS);
      }
      catch (InterruptedException e)
      {
        log.logp(Level.SEVERE, CLASS, "finishAllSubTasks", e.getLocalizedMessage(), e);
      }
      catch (ExecutionException e)
      {
        log.logp(Level.SEVERE, CLASS, "finishAllSubTasks", e.getLocalizedMessage(), e);
      }
      catch (TimeoutException e)
      {
        log.logp(Level.SEVERE, CLASS, "finishAllSubTasks", e.getLocalizedMessage(), e);
      }
    }
  }
}
