package com.ibm.docs.viewer.automation.util;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

public class LoggerUtil
{
  public static void setLogingProperties(Logger logger)
  {
    try
    {
//      SimpleDateFormat sdf = new SimpleDateFormat("yy.MM.dd_hh.mm.ss");

      String userHome = System.getProperty("user.home");
      File logFile = new File(new File(userHome), "viewer_automation"/* _" + sdf.format(Calendar.getInstance().getTime()) */+ ".log");
//      StreamHandler sh;
      FileHandler fh;
      try
      {
//        sh = new StreamHandler(new FileOutputStream(logFile), new SimpleFormatter());
        fh = new FileHandler(logFile.getAbsolutePath(), false);
        fh.setFormatter(new SimpleFormatter());
        fh.setLevel(Level.FINE);
        // sh.setFormatter(new SimpleFormatter());
        logger.addHandler(fh);
      }
      catch (FileNotFoundException e)
      {
        System.out.println("Unable to init log file");
        e.printStackTrace();
      }
      catch (IOException e)
      {
        System.out.println("Unable to init log file");
        e.printStackTrace();
      }

//      logger.setLevel(Level.FINE);
    }
    catch (SecurityException e)
    {
      logger.log(Level.SEVERE, "security error", e);
      System.exit(0);
    }
  }
}
