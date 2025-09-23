/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.mbean;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.platform.Platform;


/**
 * @author linfeng_li
 * 
 */
public class DomainListMgr implements DomainListMgrMBean
{
  private final Logger LOG = Logger.getLogger(DomainListMgr.class.getName());

  private final String pattenStr = "^((https|http):\\/\\/)[\\w\\.\\-_*]+[\\:]?([\\d]{2,5})?(\\/)?$";

  /* (non-Javadoc)
   * @see com.ibm.concord.viewer.admin.mbean.DomainListMgrMBean#addDomain(java.lang.String)
   */
  @Override
  public boolean addDomain(String domain)
  {
    LOG.entering(this.getClass().getName(), "addDomain");
    try
    {
      boolean result = Pattern.matches(pattenStr, domain);
      if (!result)
      {
        LOG.log(Level.WARNING, "Domain : {0} is not regular!!!!", new Object[] { domain });
        return false;
      }
      Platform.getViewerConfig().addConfigList(ConfigConstants.DOMAIN_LIST_KEY, domain);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Remove Domain failed . Failed to add domain {0} !!!!", new Object[] { domain });
      return false;
    }
    LOG.exiting(this.getClass().getName(), "addDomain");
    return true;
  }

  /* (non-Javadoc)
   * @see com.ibm.concord.viewer.admin.mbean.DomainListMgrMBean#removeDomain(java.lang.String)
   */
  @Override
  public boolean removeDomain(String domain)
  {
    LOG.entering(this.getClass().getName(), "removeDomain");
    try
    {
      boolean result = Pattern.matches(pattenStr, domain);
      if (!result)
      {
        LOG.log(Level.WARNING, "Add Domain failed . Domain : {0} is not regular!!!!", new Object[] { domain });
        return false;
      }
      Platform.getViewerConfig().removeConfigList(ConfigConstants.DOMAIN_LIST_KEY, domain);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to remove domain {0} !!!!", new Object[] { domain });
      return false;
    }
    LOG.exiting(this.getClass().getName(), "removeDomain");
    return true;
  }

}
