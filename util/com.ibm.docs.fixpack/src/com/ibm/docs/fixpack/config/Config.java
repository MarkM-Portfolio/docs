/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.fixpack.config;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;


import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;
import com.ibm.json.java.JSONObject;

public class Config
{
  public static final Logger LOGGER = Logger.getLogger(Config.class.getName());

  private static final Config _instance = new Config();

  /* configuration from json */

  private String patchName;

  private String productName;

  private long iFixVersion = 0;

  private String dailyBuildsPath;

  private String goldBuildsPath;

  private String currentBuildLabel;

  private String baseBuildLabel;

  private String remoteBuildPath;

  private String baseBuildPath;

  private String envType;

  /* configuration from env */
  private String buildRoot;

  private String buildOutput;

  private String currentProductNumber;

  private String patchBaseRelpath;

  private String currentVersion;

  private String currentTimestamp;

  private String CRVersion;

  public String getPatchName()
  {
    return patchName;
  }

  public long getiFixVersion()
  {
    return iFixVersion;
  }

  public String getProductName()
  {
    return productName;
  }

  public String getCurrentBuildLabel()
  {
    return currentBuildLabel;
  }

  public String getBaseBuildLabel()
  {
    return baseBuildLabel;
  }

  public String getDailyBuildsPath()
  {
    return dailyBuildsPath;
  }

  public String getGoldBuildsPath()
  {
    return goldBuildsPath;
  }

  public String getRemoteBuildPath()
  {
    return remoteBuildPath;
  }

  public String getBaseBuildPath()
  {
    return baseBuildPath;
  }

  public String getEnvType()
  {
    return envType;
  }

  public String getBuildRoot()
  {
    return buildRoot;
  }

  public String getBuildOutput()
  {
    return buildOutput;
  }

  public String getCurrentProductNumber()
  {
    return currentProductNumber;
  }

  public String getPatchBaseRelpath()
  {
    return patchBaseRelpath;
  }

  public String getCurrentVersion()
  {
    return currentVersion;
  }

  public String getCurrentTimestamp()
  {
    return currentTimestamp;
  }

  public String getCRVersion()
  {
    return CRVersion;
  }

  public static Config getInstance()
  {
    return _instance;
  }

  private Config()
  {
  }

  /**
   * get env configuration
   */
  private void getCurrentEnv() throws IOException
  {
    try {
      buildRoot = System.getenv("BUILD_ROOT");
      buildOutput = System.getenv("BUILD_OUTPUT_DIR");
      currentProductNumber = System.getenv("PRODUCT_NUMBER");
      currentVersion = System.getenv("BUILD_ONPREMISE_VERSION");
      currentTimestamp = System.getenv("BUILD_TIMESTAMP");
      dailyBuildsPath = System.getenv("DAILYBUILDS");
      currentBuildLabel = new String(Files.readAllBytes(Paths.get(dailyBuildsPath + "/docs_app/currentBuildLabel.txt")), StandardCharsets.UTF_8).replace("\n", "").replace("\r", "");
      goldBuildsPath = System.getenv("GOLDBUILDS");
      patchBaseRelpath = System.getenv("PATCH_BASE_RELPATH");
      CRVersion = System.getenv("BUILD_VERSION");

      LOGGER.info(
        "Environment as read in by com.ibm.docs.fixpack.config.Config:getCurrentEnv():\n" +
        "  buildRoot: [" + buildRoot + "]\n" +
        "  buildOutput: [" + buildOutput + "]\n" +
        "  currentProductNumber: [" + currentProductNumber + "]\n" +
        "  currentVersion: [" + currentVersion + "]\n" +
        "  currentTimestamp: [" + currentTimestamp + "]\n" +
        "  dailyBuildsPath: [" + dailyBuildsPath + "]\n" +
        "  currentBuildLabel: [" + currentBuildLabel + "]\n" +
        "  goldBuildsPath: [" + goldBuildsPath + "]\n" +
        "  patchBaseRelpath: [" + patchBaseRelpath + "]\n" +
        "  CRVersion: [" + CRVersion + "]\n"
      );
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "error reading environment: ", e);
      throw e;
    }
  }

  /**
   * configuration from json
   *
   * @param jsonPath
   * @throws Exception
   */
  private void setPatchConfig() throws IOException
  {
    String jsonPath = buildRoot + Constant.PATCH_CONFIG_FILE;
    File file = new File(jsonPath);
    FileReader fr = null;
    JSONObject patchInfo = null;
    try
    {
      fr = new FileReader(file);
      patchInfo = JSONObject.parse(fr);
    }
    finally
    {
      IOUtils.closeQuietly(fr);
    }
    if (patchInfo != null)
    {
      if (Constant.SMARTCLOUD.equalsIgnoreCase((String) patchInfo.get("env_type")))
      {
        LOGGER.log(Level.INFO, "env_type is " + Constant.SMARTCLOUD);
        envType = Constant.SMARTCLOUD;
      }
      else if (Constant.ONPREMISE.equalsIgnoreCase((String) patchInfo.get("env_type")))
      {
        LOGGER.log(Level.INFO, "env_type is " + Constant.ONPREMISE);
        envType = Constant.ONPREMISE;
      }
      else
      {
        throw new IOException("env_type configuration error.");
      }

      patchName = (String) patchInfo.get("name");

      productName = (String) patchInfo.get("product_name");

      remoteBuildPath = getDailyBuildsPath() + File.separator + "docs_app" + File.separator + getCurrentBuildLabel() + File.separator + (String) patchInfo.get("remote_build_relpath") + File.separator + getCurrentBuildLabel() + ".zip";
      if (remoteBuildPath.contains("\\") && !File.separator.equals("\\"))
      {
        remoteBuildPath = remoteBuildPath.replaceAll("\\", "/");
      }

      baseBuildLabel = new String(Files.readAllBytes(Paths.get(goldBuildsPath + File.separator + getPatchBaseRelpath() + "/currentBuildLabel.txt")), StandardCharsets.UTF_8).replace("\n", "").replace("\r", "");

      baseBuildPath = getGoldBuildsPath() + File.separator + getPatchBaseRelpath() + File.separator + getBaseBuildLabel() + File.separator + getPatchBaseRelpath() + ".zip";
      if (baseBuildPath.contains("\\") && !File.separator.equals("\\"))
      {
        baseBuildPath = baseBuildPath.replaceAll("\\", "/");
      }

      if (patchInfo.get("ifix_version") != null && patchInfo.get("ifix_version") instanceof Long)
      {
        iFixVersion = (Long) patchInfo.get("ifix_version");
      }

    }
    else
    {
      throw new IOException("No patch config information.");
    }
  }

  public void init() throws IOException
  {
    getCurrentEnv();
    setPatchConfig();
  }
}
