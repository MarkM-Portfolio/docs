/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.context;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.migration.MigrationComponent;
import com.ibm.concord.platform.Platform;

public class MigrationStatus
{
  private static final Logger LOGGER = Logger.getLogger(MigrationStatus.class.getName());

  private Map<String, String> versions = null;

  public final static int STARTED = 0;

  public final static int ON_PROGRESS = 1;

  public final static int COMPLETE = 2;

  public final static int NOT_START = -1;

  private final static String FLAG_FILE_EXT = ".status";

  private final static String FLAG_COMPLETE = "complete";

  private String upgradeHome;

  private String versionFlagPrefix;

  private String flagFile;

  private String completeFileName;

  private String startFileName;

  private long currentPosition = -1;

  private int status;

  private boolean isForceStart = false;

  public MigrationStatus(Map<String, String> versions, boolean isForceStart)
  {
    this.versions = versions;
    this.isForceStart = isForceStart;
    MigrationComponent component = (MigrationComponent) Platform.getComponent(MigrationComponent.COMPONENT_ID);
    this.upgradeHome = component.getMigrationHome();
    StringBuffer buffer = new StringBuffer();
    for (Entry<String, String> entry : versions.entrySet())
    {
      String name = entry.getKey();
      String version = entry.getValue();
      buffer.append(name + "_" + version + "_");
    }
    versionFlagPrefix = buffer.toString();
    completeFileName = versionFlagPrefix + FLAG_COMPLETE + FLAG_FILE_EXT;
    startFileName = versionFlagPrefix + FLAG_FILE_EXT;

    parseFlagFile();

  }

  public Map<String, String> getVersions()
  {
    return this.versions;
  }

  private void parseFlagFile()
  {
    this.status = NOT_START;
    File root = new File(this.upgradeHome);
    if (!root.exists() || !root.isDirectory())
    {
      return;
    }

    File[] files = root.listFiles();
    if (files.length == 0)
    {
      return;
    }

    for (File file : files)
    {
      String fileName = file.getName();

      if (fileName.endsWith(FLAG_FILE_EXT))
      {
        if (fileName.startsWith(this.versionFlagPrefix) && !isForceStart)
        {
          flagFile = fileName;
          this.status = STARTED;
          if (fileName.equals(this.startFileName))
            this.status = STARTED;
          else if (fileName.equals(this.completeFileName))
            this.status = COMPLETE;
          else
          {
            this.status = ON_PROGRESS;
            String position = fileName.substring(this.versionFlagPrefix.length(), fileName.lastIndexOf('.'));
            try
            {
              this.currentPosition = Long.parseLong(position);
            }
            catch (NumberFormatException e)
            {
              this.currentPosition = -1;
              LOGGER.log(Level.WARNING, "Failed to parse start position, will restart migaration process from the first item.", e);
            }
          }
        }
        else
        {
          // if the file ext is ".status", but the version is not current version, remove it.
          file.delete();
        }
      }
    }
  }

  public int getStatus()
  {
    return this.status;
  }

  public long getCurrentPosition()
  {
    return this.currentPosition;
  }

  public void setStatus(int status)
  {
    this.setStatus(status, 0);
  }

  public void setStatus(int status, long currentPosition)
  {
    if ((status < NOT_START) || (status > COMPLETE))
      throw new IllegalArgumentException("The status (" + status + ") is illegal. It must be within [-1, 2]");

    String newFileName = this.flagFile;

    switch (status)
      {
        case NOT_START :
          newFileName = null;
          break;
        case STARTED :
          newFileName = this.startFileName;
          break;
        case ON_PROGRESS :
          newFileName = versionFlagPrefix + currentPosition + FLAG_FILE_EXT;
          break;
        case COMPLETE :
          newFileName = this.completeFileName;
          break;
        default:
          newFileName = this.startFileName;
      }
    if (newFileName == null)
    {
      if (this.flagFile != null)
      {
        File flagFile = new File(this.upgradeHome, this.flagFile);
        flagFile.delete();
      }
    }
    else if (this.flagFile == null)
    {
      File flagFile = new File(this.upgradeHome, newFileName);
      try
      {
        flagFile.createNewFile();
      }
      catch (IOException e)
      {
        LOGGER.log(Level.WARNING, "Failed to create flag file " + flagFile.getPath(), e);
      }
    }
    else
    {
      File oldFlagFile = new File(this.upgradeHome, this.flagFile);
      File newFlagFile = new File(this.upgradeHome, newFileName);
      oldFlagFile.renameTo(newFlagFile);
    }

    this.flagFile = newFileName;
    if (status == ON_PROGRESS)
      this.currentPosition = currentPosition;

    LOGGER.exiting(this.getClass().getSimpleName(), "setStatus", this.flagFile);

  }

  public String getVersionString()
  {
    StringBuffer sb = new StringBuffer();
    if (this.versions != null)
    {
      sb.append("{");
      Set<Entry<String, String>> entries = this.versions.entrySet();
      int length = entries.size();
      int i = 0;
      for (Entry<String, String> entry : entries)
      {
        i++;
        sb.append(entry.getKey());
        sb.append(":");
        sb.append(entry.getValue());
        if (i < length)
          sb.append(", ");
      }
      sb.append("}");
    }
    return sb.toString();
  }
}
