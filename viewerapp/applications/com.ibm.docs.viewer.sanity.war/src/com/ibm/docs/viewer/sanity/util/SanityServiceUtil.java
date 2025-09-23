package com.ibm.docs.viewer.sanity.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.management.AdminServiceFactory;

public final class SanityServiceUtil
{
  private static final Logger logger = Logger.getLogger(SanityServiceUtil.class.getName());

  public static HttpClient createHttpsClient(String j2cAlias, boolean isSmartCloud)
  {
    HttpClient httpClient = null;
    if (isSmartCloud)
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClient = httpClientCreator.create();
    }
    else
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
    }
    return httpClient;
  }

  public static JSONArray getConversionNodes() throws Exception
  {
    String rootPath = System.getProperty("user.install.root");
    if (rootPath == null || rootPath.equals(""))
    {
      logger.warning("Failed to get the websphere installation path.");
      throw new Exception("Failed to get the websphere installation path.");
    }
    else
    {
      logger.info("WAS install path: " + rootPath);
    }

    String cellName = AdminServiceFactory.getAdminService().getCellName();
    File conInstConfig = new File(new StringBuilder().append(rootPath).append(File.separator).append("config").append(File.separator)
        .append("cells").append(File.separator).append(cellName).append(File.separator).append("IBMDocs-config").append(File.separator)
        .append("conversion_sanity.json").toString());
    // conInstConfig = new File("c:/Users/IBM_ADMIN/Desktop/conversion_sanity.json");
    if (!conInstConfig.exists())
    {
      throw new FileNotFoundException(conInstConfig.getAbsolutePath() + " can't be found.");
    }
    else
    {
      ByteBuffer buffer = null;
      FileInputStream fis = null;
      FileChannel fc = null;
      try
      {
        fis = new FileInputStream(conInstConfig);
        fc = fis.getChannel();
        buffer = ByteBuffer.allocate((int) fc.size());
        while (fc.read(buffer) > 0)
        {

        }
        String s = new String(buffer.array());
        JSONObject config = JSONObject.parse(s);
        JSONArray hosts = (JSONArray) config.get("cluster_hosts");
        return hosts;
      }
      catch (Exception e)
      {
        logger.warning(e.getMessage());
        throw new Exception("Failed to read conversion server installation information.  Caused by " + e.getMessage());
      }
      finally
      {
        try
        {
          if (fc != null)
          {
            fc.close();
          }
        }
        catch (Exception e)
        {
          logger.warning(e.getMessage());
        }

        try
        {
          if (fis != null)
          {
            fis.close();
          }
        }
        catch (Exception e)
        {
          logger.warning(e.getMessage());
        }
      }

    }
  }

}
