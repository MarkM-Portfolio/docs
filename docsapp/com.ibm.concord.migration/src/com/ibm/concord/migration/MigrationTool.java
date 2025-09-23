/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.migration.context.MigrationStatus;
import com.ibm.concord.migration.tasks.IMigrationTask;
import com.ibm.concord.migration.tasks.MigrationTaskContext;
import com.ibm.concord.migration.tasks.UpgradeDocumentHistoryDBTask;
import com.ibm.concord.migration.tasks.UpgradeDraftTask;
import com.ibm.concord.migration.tasks.UpgradeUploadConversionTask;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.platform.exceptions.ConversionException;

public class MigrationTool
{
  public static final Logger LOGGER = Logger.getLogger(MigrationTool.class.getName());

  private static final int DEFAULT_INTERVAL = 1; // second

  private MigrationStatus status;

  private List<IMigrationTask> tasks = new ArrayList<IMigrationTask>();

  private static String UPGRADE_LIST_NAME = "upgrade_list";

  private File fileUpgradeList = null;

  private Map<String, IMigrationTask> taskMap = new HashMap<String, IMigrationTask>();

  private int interval = DEFAULT_INTERVAL;

  private List<MigrationTaskContext> updateList;

  public MigrationTool(MigrationStatus status)
  {
    tasks.add(new UpgradeDocumentHistoryDBTask());
    tasks.add(new UpgradeDraftTask());
    tasks.add(new UpgradeUploadConversionTask());

    for (IMigrationTask task : tasks)
    {
      taskMap.put(task.getClass().getName(), task);
    }

    this.status = status;
    MigrationComponent component = (MigrationComponent) Platform.getComponent(MigrationComponent.COMPONENT_ID);
    String migrationHome = component.getMigrationHome();
    File home = new File(migrationHome);
    if (!home.exists())
      home.mkdirs();
    if (component.getConfig().get("interval") != null)
    {
      try
      {
        interval = Integer.parseInt((String) component.getConfig().get("interval"));
      }
      catch (NumberFormatException e)
      {
        LOGGER.info("Failed to parse interval config: " + component.getConfig().get("interval"));
        interval = DEFAULT_INTERVAL;
      }
    }
    this.fileUpgradeList = new File(migrationHome, UPGRADE_LIST_NAME);
  }

  public boolean process() throws JobExecutionException
  {
    LOGGER.info("MigrationTool starts for " + this.status.getVersionString());
    if (this.status.getStatus() == MigrationStatus.NOT_START)
    {
      if (scanDraft())
        this.status.setStatus(MigrationStatus.STARTED);
      else
        return false;
    }

    if ((this.status.getStatus() == MigrationStatus.STARTED) || (this.status.getStatus() == MigrationStatus.ON_PROGRESS))
    {
      if (this.updateList == null)
      {
        if (!this.readUpdateFile())
          return false;
      }
    }
    long startPosition = -1;

    if (this.status.getStatus() == MigrationStatus.ON_PROGRESS)
    {
      startPosition = this.status.getCurrentPosition();
    }

    long i = 0;
    for (MigrationTaskContext entry : this.updateList)
    {
      if (i > startPosition)
      {
        IMigrationTask task = this.getTaskByName(entry.getTaskName());
        if (task == null)
          LOGGER.log(Level.INFO, "The task " + entry.getTaskName() + " is not found.");
        else
        {
          LOGGER.log(Level.INFO, "Start to upgrade file " + entry.getWorkHome() + ".");
          try
          {
            if (task.migrate(entry))
            {
              LOGGER.log(Level.INFO, "Upgrade file " + entry.getWorkHome() + " successfully.");
            }
            else
            {
              LOGGER.log(Level.WARNING, "Failed to upgrade file " + entry.getWorkHome());
            }
          }
          catch (Exception e)
          {
            LOGGER.log(Level.WARNING, "Failed to run background migration service ", e.getMessage());
            if (e instanceof ConversionException)
            {
              JobExecutionException ne = new JobExecutionException(((ConversionException) e).getErrCode(), e);
              ne.getData().put("jobid", ((ConversionException) e).getData().get("jobid"));
              throw ne;
            }
            else
              throw new JobExecutionException(-1, e);
          }
        }
        this.status.setStatus(MigrationStatus.ON_PROGRESS, i);
        try
        {
          Thread.sleep(interval * 1000);
        }
        catch (InterruptedException e)
        {

        }
      }

      i++;
    }

    this.status.setStatus(MigrationStatus.COMPLETE);

    LOGGER.info("MigrationTool completes, with " + updateList.size() + " drafts are submitted to upgrade.");

    return true;
  }

  private boolean scanDraft()
  {
    boolean bSucc = true;
    DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
    File draftHome = new File(draftComp.getDraftHome());
    try
    {
      File[] orgHomes = draftHome.listFiles(new OrganizationHomeFilter());
      updateList = new ArrayList<MigrationTaskContext>();
      if (orgHomes != null)
      {
        for (File orgHome : orgHomes)
        {
          File orgDraftHome = new File(orgHome, "draft");
          File[] primaryDraftHomes = orgDraftHome.listFiles();
          if (primaryDraftHomes != null)
          {
            for (File primaryDraftHome : primaryDraftHomes)
            {
              int primaryHash = validateHash(primaryDraftHome.getName());
              if (primaryHash >= 0 && primaryHash <= DraftStorageManager.PRIMARY_MAX_SLOT && primaryDraftHome.isDirectory())
              {
                File[] secondaryDraftHomes = primaryDraftHome.listFiles();
                if (secondaryDraftHomes != null)
                {
                  for (File secondaryDraftHome : secondaryDraftHomes)
                  {
                    int secondaryHash = validateHash(secondaryDraftHome.getName());
                    if (secondaryHash >= 0 && secondaryHash <= DraftStorageManager.SECONDARY_MAX_SLOT && secondaryDraftHome.isDirectory())
                    {
                      File[] docDraftHomes = secondaryDraftHome.listFiles();
                      if (docDraftHomes != null)
                      {
                        for (File docDraftHome : docDraftHomes)
                        {
                          for (IMigrationTask task : tasks)
                          {
                            MigrationTaskContext context = task.check(orgDraftHome, docDraftHome);
                            if (context != null)
                            {
                              LOGGER.log(Level.FINE, "Add " + context.getWorkHome() + " in upgrade list");
                              updateList.add(context);
                            }
                          }
                        }
                      }
                      else
                      {
                        LOGGER.log(Level.INFO, "No draft found in secondary draft directory: " + secondaryDraftHome.getAbsolutePath());
                      }
                    }
                  }
                }
                else
                {
                  LOGGER.log(Level.INFO, "No draft found in primary draft directory: " + primaryDraftHome.getAbsolutePath());
                }
              }
            }
          }
          else
          {
            LOGGER.log(Level.INFO, "No draft found in organization draft home: " + orgDraftHome.getAbsolutePath());
          }
        }
      }
      else
      {
        LOGGER.log(Level.INFO, "No organization home found in draft home: " + draftHome.getAbsolutePath());
      }
    }
    catch (Exception e)
    {
      bSucc = false;
      LOGGER.log(Level.WARNING, "Failed to scan files", e);
    }

    if (bSucc)
    {
      Collections.sort(updateList, new Comparator<MigrationTaskContext>()
      {

        @Override
        public int compare(MigrationTaskContext set1, MigrationTaskContext set2)
        {
          if (set1.getPriority() > set2.getPriority())
          {
            return -1;
          }
          else if (set1.getPriority() < set2.getPriority())
          {
            return 1;
          }
          else
          {
            return 0;
          }
        }
      });

      bSucc = this.writeUpgradeFile(updateList);
    }

    return bSucc;
  }

  private int validateHash(String hash)
  {
    try
    {
      return Integer.valueOf(hash).intValue();
    }
    catch (NumberFormatException e)
    {
      return -1;
    }
  }

  private boolean writeUpgradeFile(List<MigrationTaskContext> updateList)
  {
    if (this.fileUpgradeList.exists())
      this.fileUpgradeList.delete();

    boolean bSucc = true;
    OutputStream out = null;
    try
    {
      if (!this.fileUpgradeList.exists())
        this.fileUpgradeList.createNewFile();
      out = new FileOutputStream(this.fileUpgradeList);
      StringBuffer buffer = new StringBuffer();
      for (MigrationTaskContext entry : updateList)
      {
        buffer.append(entry.toString());
        buffer.append("\r\n");

        if (buffer.length() > 8196)
        {
          out.write(buffer.toString().getBytes("UTF-8"));
          out.flush();
          buffer = new StringBuffer();
        }
      }
      if (buffer.length() > 0)
      {
        out.write(buffer.toString().getBytes("UTF-8"));
        out.flush();
      }
    }
    catch (FileNotFoundException e)
    {
      LOGGER.log(Level.WARNING, "Failed to write " + fileUpgradeList.getPath(), e);
      bSucc = false;
    }
    catch (IOException e)
    {
      LOGGER.log(Level.WARNING, "Failed to write " + fileUpgradeList.getPath(), e);
      bSucc = false;
    }
    finally
    {
      if (out != null)
        try
        {
          out.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Failed to close stream " + fileUpgradeList.getPath(), e);
        }
    }

    return bSucc;
  }

  private boolean readUpdateFile()
  {
    boolean bSucc = true;
    BufferedReader reader = null;
    updateList = new ArrayList<MigrationTaskContext>();
    try
    {
      reader = new BufferedReader(new InputStreamReader(new AutoCloseInputStream((new FileInputStream(this.fileUpgradeList)))));
      String line = null;
      while ((line = reader.readLine()) != null)
      {
        if (line.length() > 0)
        {
          MigrationTaskContext context = MigrationTaskContext.fromString(line);
          if (context != null)
          {
            this.updateList.add(context);
          }
          else
          {
            LOGGER.log(Level.INFO, "Failed to parse the line " + line);
          }
        }
      }
    }
    catch (FileNotFoundException e)
    {
      LOGGER.log(Level.WARNING, "Failed to read file " + fileUpgradeList.getPath(), e);
      bSucc = false;
    }
    catch (IOException e)
    {
      LOGGER.log(Level.WARNING, "Failed to read file " + fileUpgradeList.getPath(), e);
      bSucc = false;
    }
    finally
    {
      if (reader != null)
      {
        try
        {
          reader.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Failed to close stream " + fileUpgradeList.getPath(), e);
        }
      }
    }

    return bSucc;
  }

  private IMigrationTask getTaskByName(String clazz)
  {
    return taskMap.get(clazz);
  }

  class OrganizationHomeFilter implements FileFilter
  {
    public boolean accept(File orgHome)
    {
      return orgHome.isDirectory() && !"stateful_draft_list".equalsIgnoreCase(orgHome.getName())
          && !"draft_temp".equalsIgnoreCase(orgHome.getName()) && !"global_cache".equalsIgnoreCase(orgHome.getName());
    }
  }
}
