/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.bean;

public class HouseKeepingResult
{
  private long cleanedUploads;

  private long cleanedSnapshots;

  private long cleanedCaches;

  private long migratedCount;

  private long failedMigrations;

  public long getCleanedUploads()
  {
    return cleanedUploads;
  }

  public void setCleanedUploads(long cleanedUploads)
  {
    this.cleanedUploads = cleanedUploads;
  }

  public long getCleanedSnapshots()
  {
    return cleanedSnapshots;
  }

  public void setCleanedSnapshots(long cleanedSnapshots)
  {
    this.cleanedSnapshots = cleanedSnapshots;
  }

  public long getCleanedCaches()
  {
    return cleanedCaches;
  }

  public void setCleanedCaches(long cleanedCaches)
  {
    this.cleanedCaches = cleanedCaches;
  }

  public long getMigratedCount()
  {
    return migratedCount;
  }

  public void setMigratedCount(long migratedCount)
  {
    this.migratedCount = migratedCount;
  }

  public long getFailedMigrations()
  {
    return failedMigrations;
  }

  public void setFailedMigrations(long failedMigrations)
  {
    this.failedMigrations = failedMigrations;
  }

}
