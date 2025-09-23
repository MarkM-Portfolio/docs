package com.ibm.docs.sanity.check.conv;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpMethod;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.URLCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.json.java.JSONObject;

public class ThumbnailsCheckPoint extends URLCheckPoint
{
  private static String className = ThumbnailsCheckPoint.class.getSimpleName();

  private static final Logger LOG = Logger.getLogger(className);

  private static final Properties messages = new Properties();

  private String s2sToken;

  static
  {
    messages.put(className + "@doCheckMore@1", "View service responsed an un-expected code {0}");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(className,
      "This checkpoint is for pinging Viewer application server to make sure thumbnails can be normally copied to Files.", messages);

  public ThumbnailsCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  protected Header[] getRequestHeaders()
  {
    return new Header[] { new Header("s2stoken", s2sToken), new Header("onBehalfOf", "sanity@ibm.com") };
  }

  @Override
  public SanityCheckPointItem report()
  {
    prepare(cpItem);

    return cpItem;
  }

  @Override
  public void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException
  {
    if (httpStatus == 403 || httpStatus == 500 || httpStatus == 404 )
    {
      LOG.info("Viewer response: " + httpStatus);
      throw new SanityCheckException(this, cpItem, ThumbnailsCheckPoint.class, "doCheckMore", 1);
    }

    cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
  }

  @Override
  public String getURL()
  {
    String viewerURL = null;
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

          JSONObject topology = (JSONObject) configJson.get("topology");
          viewerURL = (String) topology.get("viewer");
          viewerURL = viewerURL + "/thumbnail";
          LOG.info("Viewer URL is set to be " + viewerURL);

          s2sToken = (String) configJson.get("token");
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
      LOG.log(Level.WARNING, "Failed to get Viewer setting.  " + e.getMessage(), e);
    }
    return viewerURL;
  }

  @Override
  public SanityCheckPointItem getCheckPointItem()
  {
    return cpItem;
  }

}
