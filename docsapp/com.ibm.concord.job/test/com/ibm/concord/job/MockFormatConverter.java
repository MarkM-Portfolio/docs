/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;


import java.io.InputStream;
import java.util.Hashtable;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

public class MockFormatConverter implements IFormatConverter
{
  private static final Logger LOG = Logger.getLogger(MockFormatConverter.class.getName());

  public static int DefaultWeight = 10000;

  private static PrimaryPlusSecondarySyncMap tasks = new PrimaryPlusSecondarySyncMap();

  public String getConversionResultAsURI(String jobId) throws IllegalConvertException, FormatConversionException
  {
    LOG.entering(MockFormatConverter.class.getName(), "getConversionResultAsFilePath");

    String result = null;

    synchronized (tasks)
    {
//    TaskData ingTask = executingTasks.get(jobId);
      TaskData ingTask = tasks.getExecutingTask(jobId);
      if (ingTask == null)
      {
//        TaskData edTask = preservedTasks.get(jobId);
        TaskData edTask = tasks.getPreservedTask(jobId);
        if (edTask == null)
        {
          throw new FormatConversionException();
        }
        else
        {
          if (edTask.count - 1 == 0)
          {
//            preservedTasks.remove(jobId);
            tasks.removeTask(jobId);
          }
          else
          {
            edTask.count = edTask.count - 1;
          }

          result = edTask.mediaUri;
        }
      }
      else
      {
        result = null;
      }
    }

    LOG.exiting(MockFormatConverter.class.getName(), "getConversionResultAsFilePath");

    return result;
  }

  public InputStream getConversionResultAsStream(String jobId) throws IllegalConvertException, FormatConversionException
  {
    LOG.entering(MockFormatConverter.class.getName(), "getConversionResultAsStream");

    InputStream result = null;

//    TaskData ingTask = executingTasks.get(jobId);
    TaskData ingTask = tasks.getExecutingTask(jobId);
    if (ingTask == null)
    {
      TaskData edTask = tasks.getPreservedTask(jobId);
//      TaskData edTask = preservedTasks.get(jobId);
      if (edTask == null)
      {
        throw new FormatConversionException();
      }
      else
      {
        if (edTask.count - 1 == 0)
        {
//          preservedTasks.remove(jobId);
          tasks.removeTask(jobId);
        }
        else
        {
          edTask.count = edTask.count - 1;
        }

        result = edTask.mediaStream;
      }
    }
    else
    {
      result = null;
    }

    LOG.exiting(MockFormatConverter.class.getName(), "getConversionResultAsStream");

    return result;
  }

  public String postConversionTask(String sourceMime, String targetMime, InputStream mediaStream, long mediaLength)
      throws IllegalConvertException, FormatConversionException, MediaSizeExceededException
  {
    LOG.entering(MockFormatConverter.class.getName(), "postConversionTaskInStream");

    String jobId = UUID.randomUUID().toString();

    TaskData td = new TaskData();
    td.sourceMime = sourceMime;
    td.targetMime = targetMime;
    td.mediaLength = mediaLength;

    td.mediaStream = mediaStream;
    td.mediaUri = null;

//    executingTasks.put(jobId, td);
    tasks.addTask(jobId, td);

    new ConversionThread(jobId).start();

    LOG.exiting(MockFormatConverter.class.getName(), "postConversionTaskInStream");

    return jobId;
  }

  public String postConversionTask(String sourceMime, String targetMime, String mediaUri, long mediaLength)
      throws IllegalConvertException, FormatConversionException, MediaSizeExceededException
  {
    LOG.entering(MockFormatConverter.class.getName(), "postConversionTaskInUri");

    String jobId = UUID.randomUUID().toString();

    TaskData td = new TaskData();

    td.sourceMime = sourceMime;
    td.targetMime = targetMime;
    td.mediaLength = mediaLength;

    td.mediaStream = null;
    td.mediaUri = mediaUri;

//    executingTasks.put(jobId, td);
    tasks.addTask(jobId, td);

    new ConversionThread(jobId).start();

    LOG.exiting(MockFormatConverter.class.getName(), "postConversionTaskInUri");

    return jobId;
  }

  class ConversionThread extends Thread
  {
    private String jobId;

    public ConversionThread(String jobId)
    {
      this.jobId = jobId;
    }

    public void run()
    {
//      TaskData td = executingTasks.get(jobId);
      TaskData td = tasks.getExecutingTask(jobId);
      LOG.log(Level.FINE, "Conversion Started: [" + td.sourceMime + "] " + "to" + " [" + td.targetMime + "] " + td.mediaLength + " bytes");

      try
      {
        Thread.sleep(DefaultWeight);
      }
      catch (InterruptedException ignored)
      {
        ;
      }

      LOG.log(Level.FINE, "Conversion Ended: [" + td.sourceMime + "] " + "to" + " [" + td.targetMime + "] " + td.mediaLength + " bytes");

//      td = executingTasks.remove(jobId);
//      td.count = 100;
//      preservedTasks.put(jobId, td);
      tasks.switchTask(jobId);

//      LOG.log(Level.INFO, "Conversion Finished: [" + td.sourceMime + "] " + "to" + " [" + td.targetMime + "] " + td.mediaLength + " bytes");
    }
  }

  class TaskData
  {
    private String sourceMime;
    private String targetMime;
    private long mediaLength;

    private String mediaUri;
    private InputStream mediaStream;

    private int count;
  }

  static class PrimaryPlusSecondarySyncMap
  {
    private Map<String, TaskData> preservedTasks = new Hashtable<String, TaskData>();
    private Map<String, TaskData> executingTasks = new Hashtable<String, TaskData>();

    private synchronized TaskData getPreservedTask(String jobId)
    {
      return preservedTasks.get(jobId);
    }

    private synchronized TaskData getExecutingTask(String jobId)
    {
      return executingTasks.get(jobId);
    }

    private synchronized void addTask(String jobId, TaskData td)
    {
      executingTasks.put(jobId, td);
    }

    private synchronized void removeTask(String jobId)
    {
      preservedTasks.remove(jobId);
    }

    private synchronized void switchTask(String jobId)
    {
      TaskData td = executingTasks.remove(jobId);
      td.count = 100;
      preservedTasks.put(jobId, td);
    }
  }
}
