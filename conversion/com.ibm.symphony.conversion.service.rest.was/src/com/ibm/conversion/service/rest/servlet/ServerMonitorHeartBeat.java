/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.common.ConversionLogger;

public class ServerMonitorHeartBeat
{
  private static final Logger LOG = Logger.getLogger(ServerMonitorHeartBeat.class.getName());

  private static final ServerMonitorHeartBeat _instance = new ServerMonitorHeartBeat();

  private int HB_DELAY;
  private int HB_INTERVAL;

  private Timer timer;

  private ServerMonitorHeartBeat()
  {
    HB_DELAY = 2* 1000;
    HB_INTERVAL = 2 * 1000;
  }

  public static ServerMonitorHeartBeat getInstance()
  {
    return _instance;
  }

  public void start(File serverMonitorFile)
  {
    _instance.startBeating(serverMonitorFile);
  }

  public void cancel()
  {
    _instance.cancelBeating();
  }
  
  private void startBeating(File serverMonitorFile)
  {
    timer = new Timer();
    timer.schedule(new HeartBeat(serverMonitorFile), HB_DELAY, HB_INTERVAL);
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
    File serverMonitorFile;

    HeartBeat(File serverMonitorFile)
    {
      this.serverMonitorFile = serverMonitorFile;
    }

    @Override
    public void run()
    {
      synchronized(serverMonitorFile)
      {
        FileOutputStream fos = null;
        try
        {
          fos = new FileOutputStream(serverMonitorFile);
          fos.write(65);
          fos.flush();
        }
        catch (FileNotFoundException e)
        {
          ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_SERVER_MONITOR_WRITE_ERR, "Fail to update server monitor file: " + serverMonitorFile.getAbsolutePath()
              + "- monitor file is not found, maybe the NFS network is corrupted or server is overloaded.",e);
        }
        catch (IOException e)
        {
          ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_SERVER_MONITOR_WRITE_ERR, "Fail to update server monitor file: " + serverMonitorFile.getAbsolutePath()
              + "- IO Exception while write byte to file, maybe the NFS network is corrupted or server is overloaded.",e);
        }
        finally
        {
          if(fos != null)
          {
            try
            {
              fos.close();
            }
            catch (IOException e)
            {
              ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_FILESTREAM_CLOSE_ERR, "Fail to close server monitor file stream.",e);
            }
          }
        }
      }
    }
  }
}
