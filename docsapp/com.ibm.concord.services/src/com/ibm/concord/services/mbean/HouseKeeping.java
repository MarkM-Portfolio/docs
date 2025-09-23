/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.mbean;

import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.services.servlet.PlatformInitializer;
import com.ibm.json.java.JSONObject;

public class HouseKeeping implements HouseKeepingMBean
{
  public void reschedule(String frequency)
  {
    PlatformInitializer.initHouseKeeping(frequency);
  }

  public void updateSettings(Integer ageThreshold4Draft, Float sizeThreashold4Draft, Integer ageThreshold4Cache,
      Float sizeThreashold4Cache)
  {
    Platform.getConcordConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.DRAFT_AGE_THRESHOLD_PER_ORG_KEY,
        Integer.toString(ageThreshold4Draft));
    Platform.getConcordConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY,
        Float.toString(sizeThreashold4Draft));
    Platform.getConcordConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY,
        Integer.toString(ageThreshold4Cache));
    Platform.getConcordConfig().setSubConfig(ConfigConstants.HOUSE_KEEPING_KEY, ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY,
        Float.toString(sizeThreashold4Cache));
  }

  public String[] showSettings()
  {
    String[] settings = new String[4];
    JSONObject houseKeepingSettings = Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY);
    settings[0] = ConfigConstants.DRAFT_AGE_THRESHOLD_PER_ORG_KEY + " : " + houseKeepingSettings.get(ConfigConstants.DRAFT_AGE_THRESHOLD_PER_ORG_KEY);
    settings[1] = ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY + " : " + houseKeepingSettings.get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY);
    settings[2] = ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY + " : " + houseKeepingSettings.get(ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY);
    settings[3] = ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY + " : " + houseKeepingSettings.get(ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY);
    return settings;
  }
}
