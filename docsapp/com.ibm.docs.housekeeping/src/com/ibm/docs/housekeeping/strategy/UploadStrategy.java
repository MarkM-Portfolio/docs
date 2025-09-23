/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.strategy;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.platform.Platform;

/**
 * 
 * The strategy is for upload conversion housekeeping. The current algorithm is consistent with original one. 1> If the size threshold is
 * not satisfied, the date time is calculated by concord-config.json (by default 21 days) 2> If the size threshold is satisfied (> 70%), the
 * date time is fixed (3 days)
 * 
 */
public class UploadStrategy extends AbstractStrategy
{
  private static final Logger LOG = Logger.getLogger(UploadStrategy.class.getName());

  static
  {
    criticalAgeThreshold = 3;

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.UPLD_AGE_THRESHOLD_PER_ORG_KEY) == null)
    {
      age_threshold = 7;
      LOG.log(Level.INFO, "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" was not found, \"90\" days as default.");
    }
    else
    {
      try
      {
        age_threshold = Integer.parseInt((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.UPLD_AGE_THRESHOLD_PER_ORG_KEY));

        if (age_threshold < 0)
        {
          age_threshold = 7;
          LOG.log(Level.INFO, "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" found: " + age_threshold);

          if (age_threshold < 2 || age_threshold > 10)
          {
            LOG.log(Level.WARNING, "\"age_threshold_of_upld_conv_per_org\" settings is recommended to be any number between [3, 120].");
          }
        }
      }
      catch (Exception e)
      {
        age_threshold = 7;
        LOG.log(Level.INFO, "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
      }
    }

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY) == null)
    {
      size_threshold = 128f;
      LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was not found, \"128\" GBs as default.");
    }
    else
    {
      try
      {
        size_threshold = Float.parseFloat((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY));

        if (size_threshold.compareTo(new Float(0.1)) >= 0 && size_threshold.compareTo(new Float(0.9)) <= 0)
        {
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" found (RATIO): " + size_threshold);
        }
        else if (size_threshold.compareTo(new Float(16)) < 0)
        {
          size_threshold = 128f;
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" found: " + size_threshold);

          if (size_threshold.compareTo(new Float(64)) < 0)
          {
            LOG.log(Level.WARNING, "\"size_threshold_of_draft_per_org\" settings is recommended to be any number between [64, ~].");
          }
        }
      }
      catch (Exception e)
      {
        size_threshold = 128f;
        LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
      }
    }
  }
}
