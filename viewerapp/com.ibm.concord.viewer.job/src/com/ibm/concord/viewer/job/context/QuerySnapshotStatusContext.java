package com.ibm.concord.viewer.job.context;

import java.util.logging.Level;

import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;

public class QuerySnapshotStatusContext extends ImportDraftFromRepositoryContext
{
  public SnapshotDescriptor snapshotDescriptor;

  @Override
  public String getJobId()
  {
    if (jobId != null)
    {
      return jobId;
    }
    else
    {
      jobId = MD5(mediaURI + QuerySnapshotStatusContext.class.getSimpleName());
      LOGGER.log(Level.FINE, "Generate JobID:" + jobId + " mediaURI:" + mediaURI);
      return jobId;
    }
  }

}
