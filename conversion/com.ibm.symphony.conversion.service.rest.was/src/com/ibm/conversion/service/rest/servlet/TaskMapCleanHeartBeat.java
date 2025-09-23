package com.ibm.conversion.service.rest.servlet;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TaskMapCleanHeartBeat
{

  private static final Logger LOG = Logger.getLogger(TaskMapCleanHeartBeat.class.getName());

  private static final TaskMapCleanHeartBeat _instance = new TaskMapCleanHeartBeat();

  private int HB_DELAY;
  private int HB_INTERVAL;

  private Timer timer;

  private TaskMapCleanHeartBeat()
  {
    HB_DELAY = 2*1000;
    HB_INTERVAL = 10*60*1000;
  }

  public static TaskMapCleanHeartBeat getInstance()
  {
    return _instance;
  }

  public void start()
  {
    _instance.startBeating();
  }

  public void cancel()
  {
    _instance.cancelBeating();
  }
  
  private void startBeating()
  {
    timer = new Timer();
    timer.schedule(new HeartBeat(), HB_DELAY, HB_INTERVAL);
  }

  private void cancelBeating()
  {
    if(timer != null)
    {
      timer.cancel();
    }
  }
  
  class HeartBeat extends TimerTask
  {
    @Override
    public void run()
    {
      Map<String, ConversionWork> taskMap = ConversionWorkManager.getInstance().getTaskMap();
      LOG.log(Level.FINEST,"taskMap size: " + taskMap.size());
      Set<Entry<String, ConversionWork>> taskEntrySet = taskMap.entrySet();
      Iterator<Entry<String, ConversionWork>> it = taskEntrySet.iterator();
      while(it.hasNext())
      {
        Entry<String, ConversionWork> entry = it.next();
        ConversionWork work = entry.getValue();
        if(work.isDone() && (System.currentTimeMillis() - work.getEndTime()) > 30000)
        {
          it.remove();
          LOG.log(Level.INFO, "Only remove job from task map : " + taskMap.size() + entry.getKey());
        }
      }
    }
  }

}
