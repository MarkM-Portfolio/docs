package com.ibm.docs.common.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

public class WinRegistryUtil
{
  private static final String LANMAN_WORKSTATION_PARAMETERS = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanWorkstation\\Parameters";

  private static final Logger LOG = Logger.getLogger(WinRegistryUtil.class.getName());

  private static String executeCommand(String command) throws Exception
  {
    LOG.log(Level.INFO, "Execute command: {0}", command);
    Process process = Runtime.getRuntime().exec(command);
    BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
    BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
    String result = "";
    String s = null;
    while ((s = stdInput.readLine()) != null)
    {
      result += s;
    }
    while ((s = stdError.readLine()) != null)
    {
      result += s;
    }
    return result;
  }

  public static String addRegistry(String keyName, String valueName, String type, String data) throws Exception
  {
    String command = "REG ADD " + keyName + " /v " + valueName + " /t " + type + " /d " + data + " /f";
    return executeCommand(command);
  }

  public static String queryRegistry(String keyName, String valueName) throws Exception
  {
    String command = "REG QUERY " + keyName + " /v " + valueName;
    return executeCommand(command);
  }

  public static String addCifsRegistry(String valueName) throws Exception
  {
    return addRegistry(LANMAN_WORKSTATION_PARAMETERS, valueName, "REG_DWORD", "0");
  }

  public static String queryCifsRegistry(String valueName) throws Exception
  {
    return queryRegistry(LANMAN_WORKSTATION_PARAMETERS, valueName);
  }

  public static void handleCifsRegisty(String valueName) throws Exception
  {
    String queryResult1 = queryCifsRegistry(valueName);

    String addResult = addCifsRegistry(valueName);
    LOG.log(Level.INFO, "Add registry {0}, message: {1}", new String[] { valueName, addResult });

    String queryResult2 = queryCifsRegistry(valueName);

    if (!queryResult1.equals(queryResult2))
    {
      LOG.log(Level.WARNING, "Before adding registry {0}, query message: {1}", new String[] { valueName, queryResult1 });
      LOG.log(Level.WARNING, "After adding registry {0}, query message: {1}", new String[] { valueName, queryResult2 });
      LOG.log(
          Level.WARNING,
          "After adding registry, if the value of {0} is different from the original value, please restart the server to make the registry take effect.",
          valueName);
    }

  }

  public static void initCiftsRegistries()
  {
    if (System.getProperty("os.name").toUpperCase().indexOf("WIN") != -1)
    {
      new Thread(new Runnable()
      {
        public void run()
        {
          try
          {
            handleCifsRegisty("FileInfoCacheLifetime");
            handleCifsRegisty("FileNotFoundCacheLifetime");
            handleCifsRegisty("DirectoryCacheLifetime");
          }
          catch (Exception e)
          {
            LOG.log(
                Level.WARNING,
                "Failed to set registry. Please refer to https://idoc2.swg.usma.ibm.com/symphony/index.jsp?topic=/com.ibm.help.ibmdocs.deploy_2.0/mount_cifs_share_on_windows.html to manually set the registry.");
          }

        }
      }).start();
    }

  }

}
