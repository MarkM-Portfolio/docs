/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.housekeeping.bean.Frequency;
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.strategy.CacheStrategy;
import com.ibm.json.java.JSONObject;

public class HouseKeepingUtil
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingUtil.class.getName());

  public static final String SNAPSHOT = "snapshot_";

  public static final String UPLOAD = "upload_";

  public static final String CACHE = "cache_";

  public static final String MIGRATION = "migration_";

  public static final String MAIN = "main_";

  /**
   * To create the house keeping task id due to the organization id, which is used for thread pool to query task status.
   * 
   * @param orgId
   * @return the task id
   */
  public static String getHKTaskId(String type)
  {
    StringBuffer sb = new StringBuffer(type);
    sb.append(type).append(UUID.randomUUID().toString());
    return sb.toString();
  }

  /**
   * Is the service id wanted ?
   * 
   * @param key
   *          , the value of service id
   * @param type
   *          , which type of service
   * @return whether the server id is the wanted type or not
   */
  public static boolean isServiceId(String key, String type)
  {
    return (key.indexOf(type) != -1);
  }

  /**
   * Is it an legal draft?
   * 
   * @param dd
   *          draft descriptor
   * @return whether the draft is an legal draft
   */
  public static boolean validateDraft(DraftDescriptor dd)
  {
    return new File(dd.getInternalURI(), "draft.lck").exists() && new File(dd.getInternalURI(), "msg.json").exists()
        && new File(dd.getInternalURI(), "meta.json").exists();
  }

  /**
   * 
   * @param dataCenter
   *          current cloud name
   * @return the configured specific organization
   */
  public static String getPolicyOrganization(String dataCenter)
  {
    try
    {
      if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.HOUSE_KEEPING_POLICY) == null)
      {
        LOG.log(Level.INFO, "\"policy\" settings for \"House_Keeping\" was not found.");
      }
      else
      {
        JSONObject pConfig = (JSONObject) (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.HOUSE_KEEPING_POLICY));
        if (pConfig != null)
        {
          String orgName = (String) pConfig.get(dataCenter);
          if (orgName != null)
          {
            LOG.log(Level.INFO, "\"policy\" settings for \"House_Keeping\" was found. The organization is: " + orgName);
          }
          else
          {
            LOG.log(Level.INFO, "\"policy Data Center\" settings for \"House_Keeping\" was not found");
          }
          return orgName;
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "\"policy\" settings for \"House_Keeping\" was illegal.");
    }
    return null;
  }

  public static List<String> getScheduledAtOnce()
  {
    try
    {
      if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.HOUSE_KEEPING_POLICY) == null)
      {
        LOG.log(Level.INFO, "\"policy\" settings for \"House_Keeping\" was not found.");
      }
      else
      {
        JSONObject pConfig = (JSONObject) (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.HOUSE_KEEPING_POLICY));
        if (pConfig != null)
        {
          String envs = (String) pConfig.get(ConfigConstants.HOUSE_KEEPING_SCHEDULEDATONCE);
          if (envs != null && !"".equals(envs.trim()))
          {
            LOG.log(Level.INFO, "\"scheduledatonce\" settings for \"House_Keeping\" was found. the values: {0}", new Object[] { envs });
            List<String> envsList = new ArrayList<String>();
            String[] envArray = envs.split(",");
            for (int i = 0; i < envArray.length; i++)
            {
              envsList.add(envArray[i].toLowerCase());
            }
            return envsList;
          }
          else
          {
            LOG.log(Level.INFO, "\"scheduledatonce\" settings for \"House_Keeping\" was not found.");
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "\"scheduledatonce\" settings for \"House_Keeping\" was illegal.");
    }
    return new ArrayList<String>(0);
  }

  public static boolean isSafeMode()
  {
    try
    {
      if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.HOUSE_KEEPING_POLICY) == null)
      {
        LOG.log(Level.INFO, "\"policy\" settings for \"House_Keeping\" was not found.");
      }
      else
      {
        JSONObject pConfig = (JSONObject) (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.HOUSE_KEEPING_POLICY));
        if (pConfig != null)
        {
          String orgName = (String) pConfig.get(ConfigConstants.HOUSE_KEEPING_SAFE_MODE);
          if ("false".equalsIgnoreCase(orgName))
          {
            LOG.log(Level.INFO, "\"safemode\" settings for \"House_Keeping\" was found. The safe mode is close!");
            return false;
          }
          else
          {
            LOG.log(Level.INFO, "\"safemode\" settings for \"House_Keeping\" is {0}", new Object[] { orgName });
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "\"safemode\" settings for \"House_Keeping\" was illegal.");
    }
    return true;
  }

  public static Frequency getFrequency()
  {
    Frequency frequency = Frequency.weekly;
    try
    {
      if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.HOUSE_KEEPING_FREQUENCY) == null)
      {
        LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was not found, \"weekly\" days as default.");
      }
      else
      {
        String value = (String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.HOUSE_KEEPING_FREQUENCY);
        if (!validateFrequency(value))
        {
          frequency = Frequency.weekly;
          LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was illegal, \"weekly\" days as default.");
        }
        else
        {
          frequency = Frequency.valueOf(value);
          LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" found: " + frequency);
        }
      }
    }
    catch (Exception e)
    {
      frequency = Frequency.weekly;
      LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was illegal, \"weekly\" days as default.");
    }
    return frequency;
  }

  private static boolean validateFrequency(String frequency)
  {
    return (Frequency.now.toString().equalsIgnoreCase(frequency)) || (Frequency.hourly.toString().equalsIgnoreCase(frequency))
        || (Frequency.daily.toString().equalsIgnoreCase(frequency)) || (Frequency.weekly.toString().equalsIgnoreCase(frequency))
        || (Frequency.monthly.toString().equalsIgnoreCase(frequency));
  }

  /**
   * 
   * @param docId
   *          doc id
   * @param filter
   *          the assigned first leval hash value list
   * @return whether the docsId has been assigned to this Docs server to handle housekeeping
   */
  public static boolean isAssignedDocId(String docId, List<String> filter)
  {
    if (filter == null || filter.size() == 0)
    {
      return true;
    }
    String[] result = JobUtil.hash(docId);
    return (filter.contains(result[0]));
  }

  /**
   * Whether the draft exists on NFS server or not
   * 
   * @param draftHome
   * @param hk
   *          migration bean
   * @return
   */
  public static boolean isMigrationDraftExisted(File draftHome, HouseKeepingData hk)
  {
    String orgId = hk.getOrgId();
    File orgFile = new File(draftHome, orgId); // organization folder
    if (orgFile.exists())
    {
      File orgDraftHome = new File(orgFile, "draft");
      if (orgDraftHome.exists())
      {
        String docId = hk.getDocId();
        String[] result = JobUtil.hash(docId);
        File flHash = new File(orgDraftHome, result[0]);
        if (flHash.exists())
        {
          File slHash = new File(flHash, result[1]);
          if (slHash.exists())
          {
            File draft = new File(slHash, docId);
            if (draft.exists())
            {
              File[] subfiles = draft.listFiles();
              if (subfiles != null && subfiles.length > 0)
              {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * The job cache path is like this: job_cache/126/job_cache/816/418/e1e828ad-4c37-4a7b-92c9-ddbc50ed30e1/...
   * 
   * @param hk
   *          housekeeping bean
   * @param strategy
   *          cache strategy
   */
  public static void cleanCache(HouseKeepingData hk, CacheStrategy strategy)
  {
    File jobHome = new File(Job.JOB_HOME);
    String orgId = hk.getOrgId();
    File orgFile = new File(jobHome, orgId); // organization folder
    if (!orgFile.exists())
    {
      LOG.log(Level.INFO, "Failed to find the org:{0} to clean its cache!", new Object[] { orgId });
      return;
    }
    File orgCacheHome = new File(orgFile, JobUtil.JOB_CACHE); // job_cache folder
    if (!orgCacheHome.exists())
    {
      return;
    }
    String docId = hk.getDocId();
    String[] result = JobUtil.hash(docId);
    if (result[0] == null || result[1] == null)
    {
      LOG.log(Level.FINEST, "Failed to calcualte first:{0}/second:{1} level hash values!", new Object[] { result[0], result[1] });
      return;
    }
    File flFile = new File(orgCacheHome, result[0]); // first level hash folder
    if (!flFile.exists())
    {
      LOG.log(Level.FINEST, "Failed to find the first level hash folder :{0} to clean its cache!", new Object[] { result[0] });
      return;
    }
    File slFile = new File(flFile, result[1]); // second level hash folder
    if (!slFile.exists())
    {
      LOG.log(Level.FINEST, "Failed to find the second level hash folder :{0} to clean its cache!", new Object[] { result[1] });
      return;
    }
    File docCacheHome = new File(slFile, docId); // draft folder
    if (docCacheHome.exists())
    {

      File[] cacheInstanceHome = docCacheHome.listFiles();
      for (int o = 0; o < cacheInstanceHome.length; o++)
      {
        strategy.cleanInstance(cacheInstanceHome[o]);
      }
      if (docCacheHome.list().length == 0)
      {
        docCacheHome.delete();
      }
    }
  }
}
