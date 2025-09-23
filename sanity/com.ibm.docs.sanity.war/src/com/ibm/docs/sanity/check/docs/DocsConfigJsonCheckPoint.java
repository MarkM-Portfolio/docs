package com.ibm.docs.sanity.check.docs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONObject;

public class DocsConfigJsonCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(DocsConfigJsonCheckPoint.class.getName());

  private String targetURL = null;

  private static final Properties messages;
  static
  {
    String className = DocsConfigJsonCheckPoint.class.getSimpleName();
    messages = new Properties();
    messages.put(className + "@doCheck@1", "Format error in concord-config.json: {0}");
    messages.put(className + "@doCheck@2", "The configuration file [{0}] was not found.");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(DocsConfigJsonCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for the format of concord-config.json for Docs service.", messages);

  public DocsConfigJsonCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void doCheck() throws SanityCheckException
  {
    String configPath;
    try
    {
      configPath = AppConfigurationUtil.getAppConfigJsonPath("docs");
      configPath = ServerTypeUtil.resolvePath(configPath);
      File configFile = new File(configPath);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = new FileInputStream(configFile);
        JSONObject json = JSONObject.parse(fis);
      }
      else
      {
        String sPath = configFile.getPath();
        Properties prop = System.getProperties();
        String os = prop.getProperty("os.name");
        if (os.startsWith("win") || os.startsWith("Win"))
          sPath = sPath.replaceAll("\\\\", "\\\\\\\\");
        throw new SanityCheckException(this, cpItem, DocsConfigJsonCheckPoint.class, "doCheck", 2, new Object[] { sPath });
      }
      cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
    }
    catch (ConfigurationException e)
    {
      throw new SanityCheckException(this, cpItem, DocsConfigJsonCheckPoint.class, "setUp", e);
    }
    catch (FileNotFoundException e)
    {
      throw new SanityCheckException(this, cpItem, DocsConfigJsonCheckPoint.class, "setUp", e);
    }
    catch (IOException e)
    {
      throw new SanityCheckException(this, cpItem, DocsConfigJsonCheckPoint.class, "doCheck", 1, new Object[] { e.getMessage() });
    }
  }

  public SanityCheckPointItem report()
  {
    prepare(cpItem);
    return cpItem;
  }

  public void setTargetURL(String URL)
  {
    targetURL = URL;
  }

  public String getTargetURL()
  {
    return targetURL;
  }

}
