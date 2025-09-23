package com.ibm.docs.viewer.automation;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

public class ProxyConfig
{
  private static final String PROXYCONFIG_INSTANCES = "instances";
  private static final String PROXYCONFIG_APPNAME = "app_name";
  private static final String PROXYCONFIG_WASVERSION = "was_version";
  private static final String PROXYCONFIG_NODENAME = "node_name";
  private static final String PROXYCONFIG_PROCESS = "process";
  private static final String PROXYCONFIG_DMGRHOST= "dmgr_host";
  private static final String PROXYCONFIG_SOAP= "soap_port";
  private static final String PROXYCONFIG_USERNAME= "was_user";
  private static final String PROXYCONFIG_PASSWORD= "was_password";
  
  private static final String PROXYCONFIG_WASVERSION_PATTERN = "$VER$";
  private static final String PROXYCONFIG_NODENAME_PATTERN = "$NODE$";
  private static final String PROXYCONFIG_PROCESS_PATTERN = "$P_N$";
  private static final String PROXYCONFIG_CELLNAME_PATTERN = "$C_NAME$";
  
  private static ProxyConfig inst;
  private static JSONObject config = null;
  private static String wasVersion;
  private static String dmgrAddr;
  private static String soapPort;
  private static String username;
  private static String password;
  
  private String cellName;
  
  private static final String pattern = "WebSphere:name=ApplicationManager,process=$P_N$,platform=proxy,node=$NODE$,version=$VER$,type=ApplicationManager,mbeanIdentifier=ApplicationManager,cell=$C_NAME$,spec=1.0";
  
  private static final Logger logger = Logger.getLogger(ProxyConfig.class.getName());
  
  public void init() throws FileNotFoundException, IOException
  {
    String sharedDataRoot = WASConfigHelper.getCellVariable("VIEWER_SHARED_DATA_ROOT");
    File configFile = new File(new File(new File(sharedDataRoot, "FileViewer"), "config"), "proxy.json");
    
    logger.info("Proxy Configuration file is set to be \"" + configFile.getAbsolutePath() + "\"");
    
    config = JSONObject.parse(new FileInputStream(configFile));
    cellName = WASConfigHelper.getCellName();
    wasVersion = (String)config.get(PROXYCONFIG_WASVERSION);
    dmgrAddr = (String)config.get(PROXYCONFIG_DMGRHOST);
    soapPort = (String)config.get(PROXYCONFIG_SOAP);
    username = (String)config.get(PROXYCONFIG_USERNAME);
    password = (String)config.get(PROXYCONFIG_PASSWORD);
    
    logger.info(new StringBuffer("Cell name: ").append(cellName).append(", WAS version: ").append(wasVersion).append(", DMGR host: ")
        .append(dmgrAddr).append(", SOAP: ").append(soapPort).append(", user name: ").append(username).append(", password: ")
        .append(password).toString());
  }

  
  public static ProxyConfig getConfig()
  {
    if(inst == null)
    {
      inst = new ProxyConfig();
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
  
  public String[] getObjectName()
  {
    List<String> names = new ArrayList<String>();
    
    JSONObject json = (JSONObject)config.get(PROXYCONFIG_INSTANCES);
    Set keys = json.keySet();
    Iterator iter = keys.iterator();
    while(iter.hasNext())
    {
      String key = (String)iter.next();
      JSONObject instance = (JSONObject)json.get(key);
      String nodeName = (String)instance.get(PROXYCONFIG_NODENAME);
      String process = (String)instance.get(PROXYCONFIG_PROCESS);
      String cmd = pattern.replace(PROXYCONFIG_WASVERSION_PATTERN, wasVersion).replace(PROXYCONFIG_NODENAME_PATTERN, nodeName)
          .replace(PROXYCONFIG_PROCESS_PATTERN, process).replace(PROXYCONFIG_CELLNAME_PATTERN, cellName);
      logger.info("ObjectName: " + cmd);
      names.add(cmd);
    }
    
    return names.toArray(new String[0]);
  }
  
  public String getAppName()
  {
    return (String)config.get(PROXYCONFIG_APPNAME);
  }
  
  public String getDMGRAddr()
  {
    return dmgrAddr;
  }
  
  public String getSOAPPort()
  {
    return soapPort;
  }
  
  public String getUsername()
  {
    return username;
  }
  
  public String getPassword()
  {
    return password;
  }
  
  public static void main(String[] args)
  {
    System.out.println(pattern.replace(PROXYCONFIG_WASVERSION_PATTERN, "7").replace(PROXYCONFIG_NODENAME_PATTERN, "mynode")
        .replace(PROXYCONFIG_PROCESS_PATTERN, "server1").replace(PROXYCONFIG_CELLNAME_PATTERN, "mycell"));
  }
  
}
