/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.FileUtils;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author yindali@cn.ibm.com
 * 
 */

public class ConcurrentFileUtil
{
  private static final Logger LOG = Logger.getLogger(ConcurrentFileUtil.class.getName());
  
  private static final int WAIT_READ_TIMEOUT = 2000;
  private static final int WAIT_WRITE_TIMEOUT = 1600;
  private static final int SLEEP_INTERVAL = 5;
  private static final int WAIT_WRITE_FINISH = 200;
  
  public static void safeWriteJSONtoFile(File file, JSONObject json) throws InterruptedException, IOException
  {
    File wrtFile = new File(file.getAbsolutePath() + ".tmp");
    FileOutputStream fout = null;
    try
    {
      fout = new FileOutputStream(wrtFile);
      json.serialize(fout);
    }
    finally
    {
      if (fout != null)
        fout.close();
    }
    File origFile = file;
    
    // put the .wlck file first to insert the write request before the coming reading requests
    File lckFile = createLockFile(origFile, "wlck");    
    LOG.log(Level.FINE, "put write lock tag" + origFile.getName());
    
    int count = 0;
    // wait until all the existing reading request which happens before the wlck is put is finished.
    while (isReadLock(origFile) && count++ < WAIT_READ_TIMEOUT) {
      try
      {
        Thread.sleep(SLEEP_INTERVAL);
      }
      catch (InterruptedException e)
      {
        LOG.log(Level.WARNING, "The thread is interrupted when waiting for read lock to release for " + file.getAbsolutePath());
        throw new IOException("The thread is interrupted when waiting for read lock to release for  " + file.getAbsolutePath());
      }
    }
    
    if (count > 0)
      LOG.log(Level.INFO, "Waiting for Read to release lock: " + count * 5 + " " + file.getAbsolutePath());
    // write the json. Rename is buggy on NFS, here we use apache copy instead
    if (origFile.exists())
    {
      origFile.delete();
    }
    boolean bNFSRename = wrtFile.renameTo(origFile);
    if (!bNFSRename)
    {
      try
      {
        FileUtils.moveFile(wrtFile, origFile);
        LOG.log(Level.FINE, "write success" + origFile.getAbsolutePath());
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "Apache move failed:" + origFile.getAbsolutePath());
        try
        {
          fout = new FileOutputStream(origFile);
          json.serialize(fout);
        }
        finally
        {
          if (fout != null)
            fout.close();
          wrtFile.delete();
        }
      }
    }
    // release the write lock
    lckFile.delete();
    LOG.log(Level.FINE, "unlock write" + origFile.getAbsolutePath());
  }

  public static JSONObject safeReadJsonFromFile(File file) throws InterruptedException, IOException
  {

    JSONObject json = null;
    File readFile = file;
    
    if (!readFile.exists()) {
      LOG.log(Level.FINE, "Json doesn't exist" + readFile.getAbsolutePath());
      return null;
    }
    
    if (ConcurrentFileUtil.getFileLength(readFile) == 0)
    {
      LOG.log(Level.FINE, "Json file lenth is 0 " + readFile.getAbsolutePath());
      return new JSONObject();
    }
    
    // check if write lock is there. If yes, wait for writing is over
    int count = 0;
    while (isWriteLock(readFile) && count++ < WAIT_WRITE_TIMEOUT) {
      try
      {
        Thread.sleep(SLEEP_INTERVAL);
      }
      catch (InterruptedException e)
      {
        LOG.log(Level.WARNING, "InterruptedException throws when waiting for write lock to release for " + readFile.getAbsolutePath());
        throw new InterruptedException("InterruptedException throws when waiting for write lock to release for "
            + readFile.getAbsolutePath());
      }
    }
    
    if (count > 0)
      LOG.log(Level.INFO, "Waiting for write to release lock: " + count * 5 + " " + readFile.getAbsolutePath());
    // after the writing is over, add the read lock and start to read
    File readLock = createLockFile(readFile, "rlck");
    LOG.log(Level.FINE, "lock read" + readLock.getName());
    
    int waitCount = 0;
    
    while (ConcurrentFileUtil.getFileLength(readFile) == 0 && waitCount < WAIT_WRITE_FINISH) {
      try
      {
        Thread.sleep(SLEEP_INTERVAL);
      }
      catch (InterruptedException e)
      {
        LOG.log(Level.WARNING, "InterruptedException throws when Waiting to read 0 length json for " + readFile.getAbsolutePath());
        throw new InterruptedException("InterruptedException throws when Waiting to read 0 length json for " + readFile.getAbsolutePath());
      }
      waitCount++;
    }
    
    if (waitCount > 0)
      LOG.log(Level.FINE, "The waiting time from 0 length json is " + waitCount*SLEEP_INTERVAL + " " + readFile.getAbsolutePath());
    
    if (waitCount == WAIT_WRITE_FINISH && ConcurrentFileUtil.getFileLength(readFile) == 0)
    {
      LOG.log(Level.WARNING, "Read failed!!!" + readFile.getAbsolutePath());
      readLock.delete();
      return json;
    }    
    
    FileInputStream fins;
    fins = new FileInputStream(readFile);
    try
    {
      json = JSONObject.parse(fins);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Read json error. the file is " + readFile.getName());  
      throw e; 
    }
    finally 
    {
      readLock.delete();
      LOG.log(Level.FINE, "unlock read " + readLock.getName());
      fins.close();
    }
    
    return json;
  }

  private static File createLockFile(File file, String ext) throws IOException
  {
    // if read lock
    if (ext.equalsIgnoreCase("rlck"))
    {
      return File.createTempFile(file.getName(), ".rlck", file.getParentFile());
    }
    else
    {
      File lockFile = new File(file.getAbsolutePath() + "." + ext);
      if (!lockFile.exists())
        lockFile.createNewFile();
      return lockFile;
    }
  }

  private static boolean isReadLock(File file)
  {
    File folder = file.getParentFile();
    File[] listOfFiles = folder.listFiles();

    for (int i = 0; i < listOfFiles.length; i++)
    {
      if (listOfFiles[i].isFile())
      {
        String fn = listOfFiles[i].getName();
        if (fn.endsWith(".rlck") && fn.startsWith(file.getName()))
          return true;
      }
    }

    return false;
  }
  
  private static boolean isWriteLock(File file)
  {
    File wlckFile = new File(file.getAbsolutePath() + ".wlck");
    return wlckFile.exists();
  }
  
  private static long getFileLength (File file)
  {
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(file);
      long len =  fis.getChannel().size();
      LOG.log(Level.FINE, "The file length is " + len + " " + file.getAbsolutePath());
      return len;
    }
    catch (FileNotFoundException e)
    {
      LOG.info("The file is not ready " + file.getAbsolutePath());
    }
    catch (IOException e)
    {
      LOG.info("Getting file length error: " + file.getAbsolutePath());
    }
    finally
    {
      if (fis != null)
        try
        {
          fis.close();
        }
        catch (IOException e)
        {
          LOG.info("Close stream error");
        }
    }
    
    return 0;
  }
  
  public static void writeMetaToFile(File file, ImageMeta meta) throws IOException {
    FileWriter fw = new FileWriter(file, true);
    PrintWriter pw = new PrintWriter(fw);
    pw.println(meta.toString());
    pw.close();
    fw.close();
  }
  
  public static void writeMetaToFile(File file, ImageMeta[] metas) throws IOException {
    if(metas.length == 0)
      return;
    
    FileWriter fw = new FileWriter(file, true);
    PrintWriter pw = new PrintWriter(fw);
    for(ImageMeta m : metas)
    {
      pw.println(m.toString());
    }
    pw.close();
    fw.close();
  }
  
  public static JSONObject readMetaFromFile(File file) {
    JSONObject json = new JSONObject();
    BufferedReader br = null;
    try
    {
      br = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
      String s;
      while ((s=br.readLine()) != null)
      {
        if (s.endsWith(ImageMeta.ROW_END))
        {
          //A valid meta
          String[] data = s.split(ImageMeta.DATA_SEP);
          if(data.length == 4)
          {
            String order = data[0];
            String name = data[1];
            String w = data[2];
            String h = data[3].substring(0, data[3].indexOf(ImageMeta.ROW_END));
            JSONObject size = new JSONObject();
            size.put("w", Integer.valueOf(w).intValue());
            size.put("h", Integer.valueOf(h).intValue());
            JSONObject sizeName = new JSONObject();
            sizeName.put("size", size);
            sizeName.put("name", name);
            json.put(order, sizeName);
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.warning("Exception when reading meta file: " + file.getAbsolutePath());
      return json;
    }
    finally {
      if(br != null) {
        try
        {
          br.close();
        }
        catch (IOException e)
        {
          LOG.warning("Error when closing meta file: " + file.getAbsolutePath());
        }
      }
    }
    
    return json;
  }
}
