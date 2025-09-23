/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.job;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.job.IConversionJob;

public class JobUtil
{
  public static final Logger LOGGER = Logger.getLogger(JobUtil.class.getName());

  public static final String JOB_CACHE = "job_cache";

  public static final int PRIMARY_MAX_SLOT = 1024;

  public static final int SECONDARY_MAX_SLOT = 1024;

  public static String getDefaultWorkingDir(ICacheDescriptor cacheDesc, String jobId)
  {
    LOGGER.entering(JobUtil.class.getName(), "getDefaultWorkingDir",
        new Object[] { cacheDesc.getDocId(), jobId, cacheDesc.getViewContext() });

    // FOR ALL VIEWER JOBS, IT ALWAYS uses local hash
    String path = cacheDesc.getWorkingDir();
    File workDir = new File(path, jobId);

    if (!workDir.exists())
    {
      try
      {
        boolean result = NFSFileUtil.nfs_mkdirs(workDir, NFSFileUtil.NFS_RETRY_SECONDS);
        if (!result)
        {
          LOGGER.log(Level.SEVERE, "Error, failed workDir.mkdirs: {0} - {1}", new Object[] { result, workDir.getPath() });
        }
        else
        {
          LOGGER.log(Level.FINER, "workDir.mkdirs: {0} - {1}", new Object[] { result, workDir.getPath() });
        }
      }
      catch (Exception e)
      {
        LOGGER.log(Level.SEVERE, "Failed to workDir.mkdirs " + workDir.getPath() + "! {0}", e);
      }
    }

    LOGGER.exiting(JobUtil.class.getName(), "getDefaultWorkingDir", workDir.getPath());
    return workDir.getPath();
  }

  public static boolean isHTMLJob(IConversionJob job)
  {
    if (job instanceof Job)
    {
      Job job1 = (Job) job;
      JobContext context = job1.getJobContext();
      if (context instanceof ImportDraftFromRepositoryContext)
        return ((ImportDraftFromRepositoryContext) context).isHTML;
    }
    return false;
  }
}
