package com.ibm.symphony.conversion.converter.conversionlib;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.common.ConversionLogger;

public class StreamGobbler extends Thread
{
  static Logger log = Logger.getLogger(StreamGobbler.class.getName());
  
  InputStream is;
  String type;
  long id;

  StreamGobbler(InputStream is, String type, long id)
  {
    this.is = is;
    this.type = type;
    this.id = id;
  }

  public void run()
  {
    try
    {
      InputStreamReader isr = new InputStreamReader(is);
      BufferedReader br = new BufferedReader(isr);
      String line = null;
      while ((line = br.readLine()) != null)
      {
        if (type.equals("Error"))
        {
          // LogManager.logError(line);
          ConversionLogger.log(log, Level.INFO, 527, Long.toHexString(id)+": "+line);
        }
        else
        {
          // LogManager.logDebug(line);
          ConversionLogger.log(log, Level.INFO, 527, Long.toHexString(id)+": "+line);
        }
      }
    }
    catch (IOException ioe)
    {
      // ioe.printStackTrace();
      ConversionLogger.log(log, Level.INFO, 527, Long.toHexString(id)+": StreamGobbler - IOException");
    }
  }

}
