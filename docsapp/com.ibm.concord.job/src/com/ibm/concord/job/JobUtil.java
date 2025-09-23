/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;

import java.io.File;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class JobUtil
{
  public static final Logger LOGGER = Logger.getLogger(JobUtil.class.getName());

  public static final String JOB_CACHE = "job_cache";

  public static final int PRIMARY_MAX_SLOT = 1024;

  public static final int SECONDARY_MAX_SLOT = 1024;

  private static final String GLOBAL_CACHE = "global_cache";

  static
  {
    /*
     * JOB_HOME: /nfs_storage/ INACTIVE_DRAFT_LIST_HOME: /nfs_storage/<custom_id>/job_cache/<doc_id>/
     */
    // if (System.getProperty("JOB_HOME") == null)
    // {
    // JOB_HOME = System.getenv("JOB_HOME");
    // }
    // else
    // {
    // JOB_HOME = System.getProperty("JOB_HOME");
    // }
  }

  public static String getDefaultWorkingDir(String customId, String docUri, String jobId)
  {
    return getDefaultWorkingDir(customId, docUri, jobId, true);
  }

  public static String getDefaultWorkingDir(String customId, String docUri, String jobId, boolean mkdirs)
  {
    String[] hash = hash(docUri);
    File workDir = new File(new File(new File(new File(new File(new File(Job.JOB_HOME, customId), JOB_CACHE), hash[0]), hash[1]), docUri),
        jobId);
    if (mkdirs)
    {
      workDir.mkdirs();
    }
    return workDir.getPath();
  }

  public static String getGlobalCache()
  {
    File gCacheDir = new File(Job.JOB_HOME, GLOBAL_CACHE);
    gCacheDir.mkdirs();
    return gCacheDir.getPath();
  }

  public static String[] hash(String docUri)
  {
    String[] result = new String[2];
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(docUri.getBytes());
      BigInteger[] modAndRemainder = new BigInteger(rawMD5).abs().divideAndRemainder(BigInteger.valueOf(PRIMARY_MAX_SLOT));
      result[1] = modAndRemainder[0].abs().remainder(BigInteger.valueOf(SECONDARY_MAX_SLOT)).toString();
      result[0] = modAndRemainder[1].toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      LOGGER.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash draft descriptor directory failed.", e);
      throw new IllegalArgumentException(e);
    }

    LOGGER.log(Level.FINEST, "Primary Hash of DOC [" + docUri + "]: " + result[0]);
    LOGGER.log(Level.FINEST, "Secondary Hash of DOC [" + docUri + "]: " + result[1]);

    return result;
  }
}
