package com.ibm.docs.viewer.automation;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;

import com.ibm.websphere.management.AdminClient;
import com.ibm.websphere.management.AdminClientFactory;
import com.ibm.websphere.management.exception.ConnectorException;

public class WASAppHelper
{
  private static AdminClient client = null;

  private static WASAppHelper instance;

  static final String devObjectName = "WebSphere:name=ApplicationManager,process=server1,platform=proxy,node=sept11Node01,version=7.0.0.25,type=ApplicationManager,mbeanIdentifier=ApplicationManager,cell=sept11Node01Cell,spec=1.0";

  static final String devAppName = "com.ibm.concord.viewer.ear";

  static final String serverObjectName = "WebSphere:name=ApplicationManager,process=bxv7v683Viewer,platform=proxy,node=bxv7v683Node02,version=8.0.0.5,type=ApplicationManager,mbeanIdentifier=ApplicationManager,cell=bxv7v683Cell01,spec=1.0";

  static final String serverAppName = "ViewerApp";
  
  private static final Logger logger = Logger.getLogger(WASAppHelper.class.getName());


  public static WASAppHelper getInstance()
  {
    if (instance == null)
    {
      instance = new WASAppHelper();
    }
    
    return instance;
  }

  WASAppHelper()
  {
    Properties props = new Properties();
//    props.setProperty(AdminClient.CONNECTOR_HOST, "localhost");
    props.setProperty(AdminClient.CONNECTOR_HOST, ProxyConfig.getConfig().getDMGRAddr());
//    props.setProperty(AdminClient.CONNECTOR_PORT, "8880");
    props.setProperty(AdminClient.CONNECTOR_PORT, ProxyConfig.getConfig().getSOAPPort());
    props.setProperty(AdminClient.CONNECTOR_TYPE, AdminClient.CONNECTOR_TYPE_SOAP);
    props.setProperty(AdminClient.CONNECTOR_SECURITY_ENABLED, "true");
    props.setProperty(AdminClient.USERNAME, ProxyConfig.getConfig().getUsername());
    props.setProperty(AdminClient.PASSWORD, ProxyConfig.getConfig().getPassword());
    try
    {
      client = AdminClientFactory.createAdminClient(props);
    }
    catch (ConnectorException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
    }
  }

  public void startApplication() throws Exception
  {
    Exception ex = null;
    try
    {
//      ObjectName on = new ObjectName(devObjectName);
      String[] names = ProxyConfig.getConfig().getObjectName();
      for(String name : names)
      {
        ObjectName on = new ObjectName(name);

        client.invoke(on, "startApplication", new Object[] { ProxyConfig.getConfig().getAppName() }, new String[] { "java.lang.String" });
      }
    }
    catch (InstanceNotFoundException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (MBeanException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (ReflectionException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (MalformedObjectNameException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (NullPointerException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (ConnectorException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    if(ex != null)
    {
      throw ex;
    }
  }

  public void stopApplication() throws Exception
  {
    Exception ex = null;
    try
    {
//      ObjectName on = new ObjectName(devObjectName);
      String[] names = ProxyConfig.getConfig().getObjectName();
      for(String name : names)
      {
        ObjectName on = new ObjectName(name);

        client.invoke(on, "stopApplication", new Object[] { ProxyConfig.getConfig().getAppName() }, new String[] { "java.lang.String" });
      }
//      client.invoke(on, "stopApplication", new Object[] { devAppName }, new String[] { "java.lang.String" });
    }
    catch (InstanceNotFoundException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (MBeanException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (ReflectionException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (MalformedObjectNameException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (NullPointerException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    catch (ConnectorException e)
    {
      ex = e;
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    
    if(ex != null)
    {
      throw ex;
    }
  }
}
