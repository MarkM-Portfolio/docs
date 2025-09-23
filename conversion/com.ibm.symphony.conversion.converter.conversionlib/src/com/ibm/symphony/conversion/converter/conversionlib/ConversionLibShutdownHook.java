package com.ibm.symphony.conversion.converter.conversionlib;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;


public class ConversionLibShutdownHook extends Thread
{
  Process process = null;
  private static final Logger log = Logger.getLogger(ConversionLibShutdownHook.class.getName());
  
  public ConversionLibShutdownHook(Process proc)
  {
    process = proc;
  }
  
  public void run()
  {
    process.destroy();
  }
  
  public void cleanUp()
  {
    if (process != null)
    {
      final InputStream is = process.getInputStream();
      if (is != null)
      {
        try
        {
          is.close();
        }
        catch (Exception e)
        {
          log.logp(Level.SEVERE, ConversionLibShutdownHook.class.getName(), "cleanUp--InputStream", e.getMessage(), e);
        }
      }
      final OutputStream os = process.getOutputStream();
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (Exception e)
        {
          log.logp(Level.SEVERE, ConversionLibShutdownHook.class.getName(), "cleanUp--OutputStream", e.getMessage(), e);
        }
      }
      final InputStream eis = process.getErrorStream();
      if (eis != null)
      {
        try
        {
          eis.close();
        }
        catch (Exception e)
        {
          log.logp(Level.SEVERE, ConversionLibShutdownHook.class.getName(), "cleanUp--ErrorStream", e.getMessage(), e);
        }
      }
      process = null;
    }
  }
}
