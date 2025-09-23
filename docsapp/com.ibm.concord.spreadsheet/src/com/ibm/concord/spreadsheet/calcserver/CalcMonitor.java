package com.ibm.concord.spreadsheet.calcserver;

import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Monitor formula calculation status
 * We do not allow one document calculation take too much times
 * @author weihuaw
 *
 */
public class CalcMonitor extends Thread
{
  private static long SLEEP_TIME = 60000;// one minute
  
  private static long WAIT_TIME = 300000; // five minute
  
  private static long MAX_MEM = 1000000000;
  
  private static int MAX_CALC = 10; // maximum num of calculation task run on nodejs at the same time
  
  private ConcurrentHashMap<String, Long> tasks;// docId -> start time of calculation task
  
  private static final Logger LOG = Logger.getLogger(CalcMonitor.class.getName());
  
  public CalcMonitor(String sleepTime, String waitTime, String maxMem)
  {
    tasks = new ConcurrentHashMap<String, Long>();
    long st = 0;
    long wt = 0;
    long mm = 0;
    try
    {
      if (sleepTime != null)
        st = Long.valueOf(sleepTime);
    }
    catch (NumberFormatException e)
    {
      LOG.log(Level.WARNING, "Given monitor sleep time is not right");
    }
    try
    {
      if (waitTime != null)
        wt = Long.valueOf(waitTime);
    }
    catch (NumberFormatException e)
    {
      LOG.log(Level.WARNING, "Given monitor wait time is not right");
    }
    try
    {
      if (maxMem != null)
        mm = Long.valueOf(maxMem);
    }
    catch (NumberFormatException e)
    {
      LOG.log(Level.WARNING, "Given monitor wait time is not right");
    }
    setValue(st, wt, mm);
  }
  
  
  private void setValue(long sleepTime, long waitTime, long maxMem) 
  {
    if(sleepTime > 0){
      SLEEP_TIME = sleepTime;
    }
    if(waitTime > 0) {
      WAIT_TIME = waitTime;
    }
    if(maxMem > 0){
      MAX_MEM = maxMem;
    }
    
    LOG.log(Level.INFO, "Calculate Monitor start with SLEEP_TIME : {0} , WAIT_TIME : {1}, MAX_JVM_MEM : {2}",
          new Object[]{SLEEP_TIME, WAIT_TIME, MAX_MEM});
  }
  
  public void setMaxNum(int num)
  {
    MAX_CALC = num;
  }
  
  public boolean checkPermission()
  {
    if(tasks.size() > 2)
      LOG.log(Level.WARNING, "Calculator Monitor contains " + tasks.size());
    if(tasks.size() < MAX_CALC)
      return true;
    return false;
  }
  
  public long addCalcTask(String docId)
  {
    long t = System.currentTimeMillis();
    tasks.put(docId, t);
    return t;
  }
  
  public void removeCalcTask(String docId)
  {
    tasks.remove(docId);
  }
  
//  public long getCalcTask(String docId)
//  {
//    return tasks.get(docId);
//  }
  
  public void run()
  {
    while(true)
    {
//      long time = System.currentTimeMillis();
//      Iterator<String> iter = tasks.keySet().iterator();
//      while(iter.hasNext())
//      {
//        String docId = iter.next();
//        long starttime = tasks.get(docId);
//        long duration = time - starttime;
//        if(duration > WAIT_TIME)
//          tasks.put(docId, -1L);//-1 means overtime
//      }
      try
      {
        Runtime rt = Runtime.getRuntime();
        long memory = rt.totalMemory() - rt.freeMemory();
        if(memory >  MAX_MEM)
        {
          LOG.log(Level.WARNING,"JVM exit due to memory > " + MAX_MEM + "bytes");
//          System.exit(0);
        }
        LOG.log(Level.INFO,"Java heap memory : " + memory + "bytes");
        Thread.sleep(SLEEP_TIME);
      }
      catch (InterruptedException e)
      {
        LOG.log(Level.WARNING,"Calc Monitor has been interrupt!");
      }
    }
  }
  

}
