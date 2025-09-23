package com.ibm.docs.sanity.check.conv;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class SofficeProcessCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(SofficeProcessCheckPoint.class.getName());

  private static final Properties messages;

  static String className = SofficeProcessCheckPoint.class.getSimpleName();
  static
  {
    messages = new Properties();
    messages.put(className + "@doCheck@1", "Cannot find soffice.bin proceses. ");
    messages.put(className + "@doCheck@2", "Should have {0} soffice.bin proceses, but only {1} found.");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(className,
      "Checking the number of soffice.bin processes running on HCL Conversion Server host.", messages);

  public SofficeProcessCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  @Override
  public void doCheck() throws SanityCheckException
  {
    BufferedReader bufferedreader = null;
    int lines = 0;
    String output = "";
    Process p = null;
    try
    {
      String[] cmd = { "/bin/sh", "-c", "ps -ef | grep -i soffice.bin | grep -v grep" };
      String os = System.getProperty("os.name");
      if (os.toLowerCase().startsWith("win"))
      {
        String cmdWin = System.getenv("windir") + "\\system32\\" + "tasklist.exe /FI \"IMAGENAME eq soffice.bin\"";
        p = Runtime.getRuntime().exec(cmdWin);
      }
      else
      {
        p = Runtime.getRuntime().exec(cmd);
      }

      p.waitFor();
      InputStreamReader isr = new InputStreamReader(p.getInputStream());
      bufferedreader = new BufferedReader(isr);

      String line = null;

      while ((line = bufferedreader.readLine()) != null)
      {
        if (line.contains("soffice.bin"))
          lines++;
        output += line + "\n";
      }
      if (0 == lines)
        throw new SanityCheckException(this, cpItem, this.getClass(), "doCheck", 1, new Object[] { output });

      String configPath = AppConfigurationUtil.getAppConfigJsonPath("conversion");
      File configFile = new File(configPath);
      int sofficeCountInConfig = -1;
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          JSONObject configJson = JSONObject.parse(fis);
          JSONObject symJson = JSONObject.parse(configJson.get("symphony").toString());
          JSONArray hostsJson = JSONArray.parse(symJson.get("host-config").toString());
          sofficeCountInConfig = hostsJson.size();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Can not open file " + configPath + ": ", e);
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
      if (sofficeCountInConfig >= 0 && lines != sofficeCountInConfig)
      {
        if (lines < sofficeCountInConfig)
        {
          if (sofficeCountInConfig - 4 >= lines)
          {
            LOG.log(Level.SEVERE, "Soffice progress sanity check case is failed, Because the number of active soffice progresses is "
                + lines + " which is less than the configured number " + sofficeCountInConfig);
            throw new SanityCheckException(this, cpItem, this.getClass(), "doCheck", 2, new Object[] { sofficeCountInConfig, lines });
          }
        }
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Query task list Failed.", e);
      throw new SanityCheckException(this, cpItem, this.getClass(), "doCheck", e);
    }
    catch (ConfigurationException e)
    {
      LOG.log(Level.SEVERE, "Cannot read the conversion-config.json file.", e);
      throw new SanityCheckException(this, cpItem, this.getClass(), "doCheck", e);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Unexpected exception happened.", e);
      throw new SanityCheckException(this, cpItem, this.getClass(), "doCheck", e);
    }
    finally
    {
      if (bufferedreader != null)
      {
        try
        {
          bufferedreader.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Failed to close buffer reader.", e);
        }
      }
      if (p != null)
      {
        p.destroy();
      }
    }
    cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
  }

  @Override
  public SanityCheckPointItem report()
  {
    prepare(cpItem);
    return cpItem;
  }
}
