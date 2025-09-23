package com.ibm.conversion.service.rest.servlet;

import java.io.File;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;

public class CleanTempFilesHeartBeat
{
  private static final Logger LOG = Logger.getLogger(CleanTempFilesHeartBeat.class.getName());

  private static final CleanTempFilesHeartBeat _instance = new CleanTempFilesHeartBeat();

  private long HB_DELAY;
  private long HB_INTERVAL;
  
  private Timer timer;

  private CleanTempFilesHeartBeat()
  {
    HB_DELAY = 60*1000;
    HB_INTERVAL = 60*60*1000;
  }

  public static CleanTempFilesHeartBeat getInstance()
  {
    return _instance;
  }

  public void start(IConversionService conversionService)
  {
    _instance.startBeating(conversionService);
  }

  public void cancel()
  {
    _instance.cancelBeating();
  }
  
  private void startBeating(IConversionService conversionService)
  {
    timer = new Timer();
    Long intervalByMinute = (Long)conversionService.getConfig("cleanTempFilesSchedule");
    if(intervalByMinute != null)
    {
      HB_INTERVAL = intervalByMinute *60 * 1000;
    }
    String tempFolderPath = conversionService.getRepositoryPath() + File.separator + "temp";
    timer.schedule(new HeartBeat(tempFolderPath), HB_DELAY, HB_INTERVAL);
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
    private String tempFolderPath = null;
    
    public HeartBeat(String tempFolderPath)
    {
      this.tempFolderPath = tempFolderPath;
    }
    
    @Override
    public void run()
    {
      cleanDirectory(new File(tempFolderPath));
    }
    
    private void cleanDirectory(File dir)
    {

      if (!dir.exists())
      {
        return;
      }

      File[] files = dir.listFiles();
      for (int i = 0; i < files.length; i++)
      {
        File f = files[i];
        if (f.isDirectory())
        {
          cleanDirectory(f);
        }
        if((System.currentTimeMillis() - f.lastModified()) > 60*60*1000)
        {
          if (!f.delete())
          {
            LOG.log(Level.INFO, "Clean temp file fail: " + f.getAbsolutePath() +", will try again in next cycle.");   
          }
        }
      }
    
    }
  }
}
