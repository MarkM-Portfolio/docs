/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.admin.mbean;

import com.ibm.concord.viewer.admin.HouseKeepingBean;
import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.platform.Platform;


public class HouseKeeping implements HouseKeepingMBean
{
 
  public void reschedule(String frequency)
  {
    //set frequency
    Platform.getViewerConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.CACHE_FREQUENCY_KEY,
        frequency);
    HouseKeepingBean.getHouseKeepingBean().initListeners();    
  }

  public void updateSettings(Integer latestVersionAgeThreshold4Cache, Float cacheSizeThreshold4Cache)
  {
    Platform.getViewerConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.RENDITION_AGE_THRESHOLD_KEY,
        Integer.toString(latestVersionAgeThreshold4Cache));
    Platform.getViewerConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.CACHE_SIZE_THRESHOLD_KEY,
        Float.toString(cacheSizeThreshold4Cache));
  }
}

