package com.ibm.docs.sanity.check.docs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpMethod;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.URLCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocsFilesS2SCallCheckPoint extends URLCheckPoint
{
  private static final Logger LOG = Logger.getLogger(DocsFilesS2SCallCheckPoint.class.getName()); 

  static
  {
    String className = DocsFilesS2SCallCheckPoint.class.getSimpleName();

    messages.put(className + "@setUp@2", "The installation root path was not found.");
    messages.put(className + "@setUp@3", "The configuration file at [{0}] was not found.");
    messages.put(className + "@setUp@4", "The configuration file content cannot be parsed.");
    messages.put(className + "@setUp@5", "The Files server for Docs server was not found.");    
    messages.put(className + "@setUp@6", "The Files server url is missing from the configuration file.");

    messages.put(className + "@doCheckMore@1", "Error Code : 3220, Http Status: {0}, Response Body: \"{1}\"");

  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(DocsFilesS2SCallCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for the communication between Docs server and Files server.", messages);

  private String resUrl;
  
  public DocsFilesS2SCallCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(DocsFilesS2SCallCheckPoint.class.getName(), "setUp");

    XMLConfiguration cellVarConfig;
    try
    {
      cellVarConfig = new XMLConfiguration(ServerTypeUtil.varFile);
      //String installRoot = ServerTypeUtil.getCellVariable(cellVarConfig, "DOCS_INSTALL_ROOT");
      String configFS = AppConfigurationUtil.getAppConfigJsonPath("docs");
      if (configFS == null)
      {
        throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", 2);
      }

      //installRoot = resolve(installRoot);
      JSONObject rootConfig;
      File configFile = new File(configFS);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          rootConfig = JSONObject.parse(fis);
        }
        catch (FileNotFoundException e)
        {
          throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", e);
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", e);
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
              throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", e);
            }
          }
        }
      }
      else
      {
        String sPath = configFile.getPath();
        Properties prop = System.getProperties();
        String os = prop.getProperty("os.name");
        if (os.startsWith("win") || os.startsWith("Win"))
          sPath = sPath.replaceAll("\\\\", "\\\\\\\\");
        throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", 3, new Object[] { escape(sPath,
            this.getFormatMime()) });
      }

      if (rootConfig == null)
      {
        throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", 4);
      }

      JSONArray components = (JSONArray) ((JSONObject) rootConfig.get("component")).get("components");
      JSONObject repCom = null;
      for (Object obj : components)
      {
        JSONObject component = (JSONObject) obj;
        String id = (String) component.get("id");

        if ((id != null) && (id.equals("com.ibm.docs.repository")))
        {
          repCom = (JSONObject) component;
          break;         
        }
      }
      if (repCom == null)
      {
        throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", 5);
      }
      else
      {
        JSONArray subComponents = (JSONArray) ((JSONObject) repCom.get("config")).get("adapters");
        if (subComponents == null)
        {
          throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", 5);
        }
        else
        {
          String fileSrvUrl = null;
          for (Object adapter:subComponents)
          {
            JSONObject subComponent = (JSONObject) adapter;
            String adapId = (String) subComponent.get("id");
            if ((adapId != null) && (adapId.equals("lcfiles")))
            {
              fileSrvUrl = (String) ((JSONObject) subComponent.get("config")).get("server_url");
              if (fileSrvUrl!=null)
              {                
                break;
              }
            }
          }
          
          if (fileSrvUrl==null)
          {
            throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", 6);
          }
        
          resUrl = fileSrvUrl;          
        }
      }
    }
    catch (ConfigurationException e)
    {
      throw new SanityCheckException(this, cpItem, DocsFilesS2SCallCheckPoint.class, "setUp", e);
    }

    LOG.exiting(DocsFilesS2SCallCheckPoint.class.getName(), "setUp");
    return;
  }
  
  public void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException
  {
    LOG.entering(ConversionCheckPoint.class.getName(), "doCheckMore", new Object[] { httpStatus });
  
    if (httpStatus == 404)
    {
      try
      {
        String respStr = httpMethod.getResponseBodyAsString();
        if (respStr.contains("t find task with given JOBID"))
        {
          cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        }
        else
        {
          throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "doCheckMore", 1, new Object[] { httpStatus, respStr });
        }
      }
      catch (IOException e)
      {
        throw new SanityCheckException(this, getCheckPointItem(), URLCheckPoint.class, "doCheckMore", e);
      }
    }
  
    LOG.exiting(ConversionCheckPoint.class.getName(), "doCheckMore");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(DocsFilesS2SCallCheckPoint.class.getName(), "tearDown");
    LOG.exiting(DocsFilesS2SCallCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(DocsFilesS2SCallCheckPoint.class.getName(), "report");

    cpItem.setDescription(getURL() == null ? cpItem.getDescription() : getURL());
    prepare(cpItem);

    LOG.exiting(DocsFilesS2SCallCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }

  public String getURL()
  {
    if (resUrl == null)
    {
      return null;
    }
    else
    {
      return resUrl;
    }
  }

  public SanityCheckPointItem getCheckPointItem()
  {
    return cpItem;
  }

  protected Header[] getRequestHeaders()
  {
    //Header header = new Header();
   // header.setName("token");
   // header.setValue(code);
    //return new Header[] { header };
    return new Header[] { };
  }
}
