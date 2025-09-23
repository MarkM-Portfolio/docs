/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.mbean;

import java.util.logging.Logger;

import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.migration.IMigrationService;
import com.ibm.concord.migration.MigrationComponent;
import com.ibm.concord.platform.Platform;
import com.ibm.docs.framework.IComponent;
import com.ibm.json.java.JSONObject;

public class Migration implements MigrationMBean
{
  public static final Logger LOG = Logger.getLogger(Migration.class.getName());
  
  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.services.mbean.MigrationMBean#start()
   */
  public void start()
  {
    IComponent migrationCmp = Platform.getComponent(MigrationComponent.COMPONENT_ID);
    if (migrationCmp != null)
    {
      IMigrationService migrationService = (IMigrationService) migrationCmp.getService(IMigrationService.class);
      if (migrationService != null)
      {
        migrationService.process();
      }
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.migration.mbean.MigrationMBean#enableAfterRestart(boolean)
   */
  public void enableAfterRestart(boolean enable)
  {
    IComponent migrationCmp = Platform.getComponent(MigrationComponent.COMPONENT_ID);
    if (migrationCmp != null)
    {
      IMigrationService migrationService = (IMigrationService) migrationCmp.getService(IMigrationService.class);
      if (migrationService != null)
      {
        // for sc, if there is no migration work manager that means this server is not migration host server, no need to start migration
        // process.
        if (migrationService.getWorkManager() != null)
        {
          JSONObject config = migrationCmp.getConfig();
          config.put(ConfigConstants.ENABLED_KEY, String.valueOf(enable));
          LOG.info("Update Migration configurationk: " + config.toString());
          Platform.getConcordConfig().updateConfigFile();
        }
      }
    }
  }
}
