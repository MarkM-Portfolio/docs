/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.migration.mbean.Migration;
import com.ibm.docs.framework.Component;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.management.AdminServiceFactory;

public class MigrationComponent extends Component
{
  public static final String COMPONENT_ID = "com.ibm.concord.migration";

  private static final Logger LOG = Logger.getLogger(MigrationComponent.class.getName());

  private boolean enabled = false;
  
  private boolean forceScan = false;

  private String migrationHome;

  private MigrationService migrationService;

  private ObjectInstance mbOI;

  @Override
  protected void init(JSONObject config)
  {
    if (config != null)
    {
      String sEnabled = (String) config.get("enabled");
      if (sEnabled != null)
      {
        enabled = Boolean.parseBoolean(sEnabled.toString());
      }
      String sForceScan = (String) config.get("force_scan");
      if (sForceScan != null)
      {
        forceScan = Boolean.parseBoolean(sForceScan.toString());
      }
    }

    if (migrationService == null)
    {
      migrationHome = ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "upgrade_home";
      migrationService = new MigrationService();
      initMBean();
      if (enabled)
      {
        migrationService.process();
      }
    }
  }

  public Object getService(Class<?> clazz)
  {
    if (IMigrationService.class == clazz)
    {
      return migrationService;
    }

    return super.getService(clazz);
  }

  public void destroy()
  {
    destroyMBean();
  }

  public String getMigrationHome()
  {
    return migrationHome;
  }

  public boolean isForceScan()
  {
    return forceScan;
  }
  
  private void initMBean()
  {
    MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
    try
    {
      ObjectName anON = new ObjectName("com.ibm.concord.platform.mbean:type=Migration");
      if (!mbServer.isRegistered(anON))
      {
        mbOI = mbServer.registerMBean(new Migration(), anON);
      }
    }
    catch (InstanceAlreadyExistsException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Migration Failed.", e);
    }
    catch (MBeanRegistrationException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Migration Failed.", e);
    }
    catch (NotCompliantMBeanException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Migration Failed.", e);
    }
    catch (MalformedObjectNameException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Migration Failed.", e);
    }
    catch (NullPointerException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Migration Failed.", e);
    }
  }

  private void destroyMBean()
  {
    if (mbOI != null)
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      try
      {
        mbServer.unregisterMBean(mbOI.getObjectName());
      }
      catch (MBeanRegistrationException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for Migration Failed.", e);
      }
      catch (InstanceNotFoundException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for Migration Failed.", e);
      }
    }

  }

  @Override
  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }
}
