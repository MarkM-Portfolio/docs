package com.ibm.docs.viewer.automation;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ViewerConfig2
{
  private String sharedDataRoot;

  private File configFile;

  private JSONObject config;

  private static ViewerConfig2 inst = null;

  private static final Logger logger = Logger.getLogger(ViewerConfig2.class.getName());

  public void init() throws FileNotFoundException, IOException
  {
    sharedDataRoot = WASConfigHelper.getCellVariable("VIEWER_SHARED_DATA_ROOT");
    String cellPath = WASConfigHelper.getCellPath();
    configFile = new File(new File(cellPath, "IBMDocs-config"), "viewer-config.json");
    logger.info("Viewer Configuration file is set to be \"" + configFile.getAbsolutePath() + "\"");

    config = JSONObject.parse(new FileInputStream(configFile));
  }

  public static ViewerConfig2 getInstance()
  {
    if (inst == null)
    {
      inst = new ViewerConfig2();
      try
      {
        inst.init();
      }
      catch (FileNotFoundException e)
      {
        logger.log(Level.WARNING, e.getMessage(), e);
        inst = null;
      }
      catch (IOException e)
      {
        logger.log(Level.WARNING, e.getMessage(), e);
        inst = null;
      }
    }

    return inst;
  }

  public File getConfigFile()
  {
    return configFile;
  }

  public JSONObject getConfig()
  {
    try
    {
      return JSONObject.parse(new FileInputStream(configFile));
    }
    catch (FileNotFoundException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    return null;
  }

  public String getFilesDirectory(String repoId)
  {
    JSONObject repositories = getSubComponent("com.ibm.concord.viewer.platform.repository");
    JSONObject repConfig = (JSONObject) repositories.get("config");
    JSONArray adapters = (JSONArray) repConfig.get("adapters");
    JSONObject repository = null;
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject obj = (JSONObject) adapters.get(i);
      String id = (String) obj.get("id");
      if (id.equals(repoId))
      {
        repository = obj;
      }
    }

    JSONObject adapterConfig = (JSONObject) repository.get("config");
    String path = (String) adapterConfig.get("files_path");
    return path;

  }

  public JSONObject getSubComponent(String id)
  {
    JSONObject root = (JSONObject) config.get("component");
    JSONArray components = (JSONArray) root.get("components");
    JSONObject component = null;
    for (int i = 0; i < components.size(); i++)
    {
      JSONObject obj = (JSONObject) components.get(i);
      String cid = (String) obj.get("id");
      if (id.equals(cid))
      {
        component = obj;
      }
    }
    return component;
  }

  public boolean refresh(String config)
  {
    // json.
    FileOutputStream fos = null;
    boolean ret = true;
    try
    {
      JSONObject json = JSONObject.parse(config);
      // byte[] buffer = new byte[2048];
      fos = new FileOutputStream(configFile);
      // int len;
      // while ((len = is.read(buffer)) > 0)
      // {
      // fos.write(buffer, 0, len);
      // }
      json.serialize(fos);
      this.config = json;
    }
    catch (FileNotFoundException e)
    {
      ret = false;
      logger.log(Level.WARNING, "Failed to write configuration viewer file.  " + e.getMessage(), e);
    }
    catch (IOException e)
    {
      ret = false;
      logger.log(Level.WARNING, "Failed to write configuration viewer file.  " + e.getMessage(), e);
    }
    finally
    {
      // if (is != null)
      // {
      // try
      // {
      // is.close();
      // }
      // catch (IOException e)
      // {
      // }
      // }
      if (fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
        }
      }
    }
    return ret;
  }
}
