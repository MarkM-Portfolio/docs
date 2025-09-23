/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class NewFeaturesUtil
{
  private static final Logger LOG = Logger.getLogger(NewFeaturesUtil.class.getName());

  private static final String TEXT_KEY = "text";

  private static final String PRES_KEY = "pres";

  private static final String SHEET_KEY = "sheet";

  private static final String VERSION_KEY = "versionID";

  private static final String FEATURE_KEY = "feature";

  private static final String FEATURESID_KEY = "featureIDs";

  private static final String featuresFile = "feature.json";

  private static boolean hasTextNewFeatures = false;

  private static boolean hasPresNewFeatures = false;

  private static boolean hasSheetNewFeatures = false;


  static
  {
    String filePath = Platform.getServletContext().getRealPath("/") + File.separator + featuresFile;
    File configFile = new File(filePath);
    JSONObject rootObj = null;

    // get the new features json object
    if (configFile.exists() && configFile.isFile())
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(configFile);
        JSONObject tempConfigObj = JSONObject.parse(fis);
        rootObj = tempConfigObj;
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.WARNING, "Config file: " + configFile.getAbsolutePath()
            + " must exist and be a file for system to work, the exception is: " + e);
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Malformed config file: " + configFile.getAbsolutePath()
            + " can not be parsed successfully, the exception is: ", e);
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
            LOG.log(Level.WARNING, "io error when closing " + configFile.getAbsolutePath());
          }
        }
      }
    }
    else
    {
      LOG.log(Level.WARNING, "Config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.");
    }

    // got the new features json, initialize the boolean now
    if (rootObj != null)
    {
      String version = ConcordUtil.getVersion();
      hasTextNewFeatures = hasNewFeatures(rootObj, TEXT_KEY, version);
      hasPresNewFeatures = hasNewFeatures(rootObj, PRES_KEY, version);
      hasSheetNewFeatures = hasNewFeatures(rootObj, SHEET_KEY, version);
    }
  }

  private static boolean hasNewFeatures(JSONObject json, String docType, String version)
  {
    if (json != null && version != null)
    {
      JSONObject editorObj = (JSONObject) json.get(docType);
      if (editorObj != null)
      {
        JSONArray featuresArray = (JSONArray) editorObj.get(FEATURE_KEY);
        if (featuresArray != null)
        {
          for (int i = 0; i < featuresArray.size(); i++)
          {
            JSONObject featureObj = (JSONObject) featuresArray.get(i);
            if (featureObj != null)
            {
              String fVersion = (String) featureObj.get(VERSION_KEY);
              LOG.log(Level.INFO, "Checking feature version {0} against product version {1} for {2}", new Object[] { fVersion, version,
                  docType });
              if (version.equalsIgnoreCase(fVersion))
              {
                JSONArray vfArray = (JSONArray) featureObj.get(FEATURESID_KEY);
                if (vfArray != null)
                {
                  LOG.log(Level.INFO, "{0} has {1} new features in version {2}.", new Object[] { docType, vfArray.size(), version });
                  if (vfArray.size() > 0)
                  {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  public static boolean hasTextNewFeatures()
  {
    return hasTextNewFeatures;
  }

  public static boolean hasPresNewFeatures()
  {
    return hasPresNewFeatures;
  }

  public static boolean hasSheetNewFeatures()
  {
    return hasSheetNewFeatures;
  }

}
