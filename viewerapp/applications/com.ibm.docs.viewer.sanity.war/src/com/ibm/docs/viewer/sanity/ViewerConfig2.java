package com.ibm.docs.viewer.sanity;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.viewer.sanity.exception.ConfigurationException;
import com.ibm.docs.viewer.sanity.util.WASConfigHelper;
import com.ibm.json.java.JSONObject;

public class ViewerConfig2
{
  private File configFile;

  private static ViewerConfig2 inst = null;

  private static final Logger logger = Logger.getLogger(ViewerConfig2.class.getName());

  private static final String CONFIG_FILE_FOLDER = "IBMDocs-config";

  public static ViewerConfig2 getInstance()
  {
    if (inst == null)
    {
      inst = new ViewerConfig2();
    }

    return inst;
  }

  public File getConfigFile()
  {
    return configFile;
  }

  public JSONObject getConfig() throws IOException, FileNotFoundException, ConfigurationException
  {
    String cellPath = WASConfigHelper.getCellPath();

    if (cellPath != null)
    {
      File configFileFolder = new File(cellPath, CONFIG_FILE_FOLDER);
      if (configFileFolder.exists() && configFileFolder.isDirectory())
      {
        String configRoot = configFileFolder.getAbsolutePath();
        configFile = new File(configRoot, "viewer-config.json");
        logger.info("Viewer Configuration file is set to be \"" + configFile.getAbsolutePath() + "\"");
      }
      else
      {
        throw new ConfigurationException("Configuration folder " + configFileFolder + " does not exist.");
      }
    }
    else
    {
      throw new ConfigurationException("Unable to find cell path.");
    }

    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(configFile);
      return JSONObject.parse(fis);
    }
    catch (FileNotFoundException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
    finally
    {
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (IOException e)
        {
          logger.warning("Failed to close the configuration input stream. " + e.getMessage());
        }
      }
    }
  }
}
