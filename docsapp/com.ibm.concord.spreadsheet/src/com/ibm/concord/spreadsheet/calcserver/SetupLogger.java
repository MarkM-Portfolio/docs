package com.ibm.concord.spreadsheet.calcserver;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.LogManager;

public class SetupLogger
{
  public static void setup(String workingDir) throws IOException
  {
    InputStream configIn = SetupLogger.class.getClassLoader().getResourceAsStream(
        "com/ibm/concord/spreadsheet/calcserver/logging.properties");

    System.setProperty("user.home", workingDir);

    LogManager.getLogManager().readConfiguration(configIn);
  }
}
