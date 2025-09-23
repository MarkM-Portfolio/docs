/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.mbean;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Hashtable;
import java.util.Map;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SharedStorageMgr implements SharedStorageMgrMBean
{
  private static final Logger LOG = Logger.getLogger(SharedStorageMgr.class.getName());

  private static final Map<String, String> mountEntries = new Hashtable<String, String>();

  public String[] showmount()
  {
    LOG.entering(SharedStorageMgr.class.getName(), "showmount");
    LOG.exiting(SharedStorageMgr.class.getName(), "showmount");
    return mountEntries.values().toArray(new String[mountEntries.values().size()]);
  }

  public boolean mount(String serverHost, String sharedFrom, String sharedTo, Integer retry, Integer timeo)
  {
    if (serverHost == null)
    {
      throw new NullPointerException("The server host of the shared storage is null.");
    }
    serverHost = serverHost.trim();

    if (sharedFrom == null)
    {
      throw new NullPointerException("The shared directory in the shared storage is null.");
    }
    sharedFrom = sharedFrom.trim();

    if (sharedTo == null)
    {
      throw new NullPointerException("The shared to directory in the local system is null.");
    }
    sharedTo = sharedTo.trim();

    LOG.entering(SharedStorageMgr.class.getName(), "mount", new Object[] { serverHost, sharedFrom, sharedTo, retry, timeo });

    Vector<String> commandArgs = new Vector<String>();
    if (System.getProperty("os.name", "Unknown").startsWith("Linux"))
    {
      commandArgs.add("mount");
      commandArgs.add("-f");
      commandArgs.add("nfs");
      commandArgs.add("-o");
      if (retry > 0 && timeo > 0)
      {
        commandArgs.add("sec=sys,bg,soft,retry=" + retry + ",timeo=" + timeo + ",nfsvers=3");
      }
      else if (retry > 0)
      {
        commandArgs.add("sec=sys,bg,soft,retry=" + retry + ",nfsvers=3");
      }
      else if (timeo > 0)
      {
        commandArgs.add("sec=sys,bg,soft,timeo=" + timeo + ",nfsvers=3");
      }
      else
      {
        commandArgs.add("sec=sys,bg,soft,nfsvers=3");
      }
      commandArgs.add(serverHost + ":" + sharedFrom);
      commandArgs.add(sharedTo);
    }
    else if (System.getProperty("os.name", "Unknown").startsWith("Windows"))
    {
      commandArgs.add("mount");
      commandArgs.add("-o");
      commandArgs.add("mtype=soft");
      if (retry > 0)
      {
        commandArgs.add("retry=" + retry);
      }
      if (timeo > 0)
      {
        commandArgs.add("timeout=" + timeo);
      }
      commandArgs.add("casesensitive=yes");
      commandArgs.add("anon");
      commandArgs.add(serverHost + ":" + sharedFrom);
      commandArgs.add(sharedTo);
    }
    else
    {
      LOG.log(Level.INFO, "Shared Storage Mount Failed. Not Supported OS: {0}", System.getProperty("os.name"));
      return false;
    }

    int exitValue = -1;
    try
    {
      LOG.log(Level.INFO, "Mount Shared Storage for HCL Docs: {0}", commandArgs);
      Process p = Runtime.getRuntime().exec(commandArgs.toArray(new String[commandArgs.size()]));
      exitValue = getResult(p);
      if (exitValue == 0)
      {
        mountEntries.put(sharedTo, commandArgs.toString());
        LOG.log(Level.INFO, "Exit from Mount Process: {0}, SUCCESS", new Object[] { exitValue });
      }
      else
      {
        LOG.log(Level.INFO, "Exit from Mount Process: {0}, FAILED", new Object[] { exitValue });
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Mount Shared Storage Failed.", e);
    }

    boolean result = exitValue == 0;
    if (result)
    {
      result = result && validate(sharedTo);
    }

    LOG.exiting(SharedStorageMgr.class.getName(), "mount", result);
    return result;
  }

  private boolean validate(String sharedTo)
  {
    LOG.entering(SharedStorageMgr.class.getName(), "validate", new Object[] { sharedTo });

    boolean result = true;

    if (!new File(sharedTo).canWrite())
    {
      LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not write.", sharedTo);
      result = false;
      LOG.exiting(SharedStorageMgr.class.getName(), "validate", result);
      return result;
    }
    if (!new File(sharedTo).canRead())
    {
      LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not read.", sharedTo);
      result = false;
      LOG.exiting(SharedStorageMgr.class.getName(), "validate", result);
      return result;
    }

    String testDirName = UUID.randomUUID().toString();
    String testFileName = UUID.randomUUID().toString();
    File testDir = new File(sharedTo, testDirName);
    if (!testDir.mkdirs())
    {
      LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not create directory into it.", sharedTo);
      result = false;
      LOG.exiting(SharedStorageMgr.class.getName(), "validate", result);
      return result;
    }

    File testFile = new File(testDir, testFileName);
    FileOutputStream fos = null;
    try
    {
      if (!testFile.createNewFile())
      {
        LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not create file {1} into the test directory {2}.",
            new Object[] { sharedTo, testFileName, testDirName });
      }
      else
      {
        fos = new FileOutputStream(testFile);
        byte[] data = new byte[] { 1, 0, 0, 1 };
        fos.write(data);
        fos.flush();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not create or write file {1} in the test directory {2} with exception {3}.",
          new Object[] { sharedTo, testFileName, testDirName, e });
      result = false;
    }
    finally
    {
      if (fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but close output stream for file {0}.", new Object[] { sharedTo,
              testFileName });
          result = false;
        }
      }
    }

    if (result)
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(testFile);
        byte[] data = new byte[4];
        fis.read(data, 0, 4);

        if (data[0] == 1 && data[1] == 0 && data[2] == 0 && data[3] == 1)
        {
          result = true;
        }
        else
        {
          LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but content in file {1} in the test directory {2} may be corrupted during previous read or write.",
              new Object[] { sharedTo, testFileName, testDirName });
          result = false;
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not read file {1} in the test directory {2} with exception {3}.",
            new Object[] { sharedTo, testFileName, testDirName, e });
        result = false;
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
            LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but close input stream for file {0}.", new Object[] { sharedTo,
                testFileName });
            result = false;
          }
        }

        if (!testFile.delete())
        {
          LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not delete file {1}.", new Object[] { sharedTo,
              testFileName });
          result = false;
        }

        if (!testDir.delete())
        {
          LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not delete directory {1}.", new Object[] { sharedTo,
              testDirName });
          result = false;
        }
      }
    }
    else
    {
      if (!testFile.delete())
      {
        LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not delete file {1}.", new Object[] { sharedTo,
            testFileName });
        result = false;
      }

      if (!testDir.delete())
      {
        LOG.log(Level.SEVERE, "Shared storaged has been mounted to {0}, but can not delete directory {1}.", new Object[] { sharedTo,
            testDirName });
        result = false;
      }
    }

    LOG.exiting(SharedStorageMgr.class.getName(), "validate", result);
    return result;
  }

  public boolean umount(String sharedTo)
  {
    if (sharedTo == null)
    {
      throw new NullPointerException("The shared to directory in the local system is null.");
    }
    sharedTo = sharedTo.trim();

    LOG.entering(SharedStorageMgr.class.getName(), "umount", new Object[] { sharedTo });

    if ("all".equalsIgnoreCase(sharedTo))
    {
      boolean result = true;
      String[] sharedToEntires = mountEntries.keySet().toArray(new String[mountEntries.keySet().size()]);
      for (int i = 0; i < sharedToEntires.length; i++)
      {
        result = result && umount(sharedToEntires[i]);
      }
      return result;
    }

    Vector<String> commandArgs = new Vector<String>();
    if (System.getProperty("os.name", "Unknown").startsWith("Linux"))
    {
      commandArgs.add("umount");
      commandArgs.add("-f");
      commandArgs.add(sharedTo);
    }
    else if (System.getProperty("os.name", "Unknown").startsWith("Windows"))
    {
      commandArgs.add("umount");
      commandArgs.add("-f");
      commandArgs.add(sharedTo);
    }
    else
    {
      LOG.log(Level.INFO, "Shared Storage Umount Failed. Not Supported OS: {0}", System.getProperty("os.name"));
      return false;
    }

    int exitValue = -1;
    try
    {
      LOG.log(Level.INFO, "Umount Shared Storage for HCL Docs: {0}", commandArgs);
      Process p = Runtime.getRuntime().exec(commandArgs.toArray(new String[commandArgs.size()]));
      exitValue = getResult(p);
      if (exitValue == 0)
      {
        mountEntries.remove(sharedTo);
        LOG.log(Level.INFO, "Exit from Umount Process: {0}, SUCCESS.", new Object[] { exitValue });
      }
      else
      {
        LOG.log(Level.INFO, "Exit from Umount Process: {0}, FAILED.", new Object[] { exitValue });
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Umount Shared Storage Failed.", e);
    }

    LOG.exiting(SharedStorageMgr.class.getName(), "umount", exitValue == 0);
    return exitValue == 0;
  }

  private int getResult(Process process)
  {
    /*
     * Redirect stderr and stdin of sub-process to its parent WAS process.
     */
    {
      BufferedReader br1 = new BufferedReader(new InputStreamReader(process.getErrorStream()));
      String line1 = null;
      try
      {
        while ((line1 = br1.readLine()) != null)
        {
          System.err.println("Sub-Process STD_ERR[" + line1 + "]");
        }
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      finally
      {
        if (br1 != null)
        {
          try
          {
            br1.close();
          }
          catch (IOException e)
          {
            e.printStackTrace();
          }
        }
      }

      BufferedReader br2 = new BufferedReader(new InputStreamReader(process.getInputStream()));
      String line2 = null;
      try
      {
        while ((line2 = br2.readLine()) != null)
        {
          LOG.info("Sub-Process STD_OUT[" + line2 + "]");
        }
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      finally
      {
        if (br2 != null)
        {
          try
          {
            br2.close();
          }
          catch (IOException e)
          {
            e.printStackTrace();
          }
        }
      }
    }

    try
    {
      return process.waitFor();
    }
    catch (InterruptedException e)
    {
      return -1;
    }
  }
}
