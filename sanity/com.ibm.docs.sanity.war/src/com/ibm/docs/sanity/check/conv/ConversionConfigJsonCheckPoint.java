package com.ibm.docs.sanity.check.conv;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.XMLConfiguration;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.json.java.JSONObject;

public class ConversionConfigJsonCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(ConversionConfigJsonCheckPoint.class.getName());

  private static final Properties messages;
  private static String className = ConversionConfigJsonCheckPoint.class.getSimpleName();
  static
  {
    
    messages = new Properties();
    messages.put(className + "@doCheck@1", "conversion-config.json json format is not correct: {0}");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(className,
      "This checkpoint is for the format of conversion-config.json for conversion service.", messages);

  public ConversionConfigJsonCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void doCheck() throws SanityCheckException
  {
    XMLConfiguration cellVarConfig;
    try
    {
      String configPath = AppConfigurationUtil.getAppConfigJsonPath("conversion");
      File configFile = new File(configPath);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          JSONObject configJson = JSONObject.parse(fis);
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Cannot open file " + configPath + ": ", e);
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
              LOG.log(Level.SEVERE, "Failed to close read stream, " + configPath + ": ", e);
            }
          }
        }
      }
    }
    catch (Exception e)
    {
      throw new SanityCheckException(this, cpItem, this.getClass(), "doCheck", 1, new Object[] { e.getMessage() });
    }
    cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
  }

  public SanityCheckPointItem report()
  {
    prepare(cpItem);
    return cpItem;
  }
}
