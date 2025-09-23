package com.ibm.conversion.service.rest.servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.conversion.service.rest.servlet.util.WASConfigHelper;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;

public class NFSHeartBeatService
{
  private static final Logger LOG = Logger.getLogger(NFSHeartBeatService.class.getName());
  private static final NFSHeartBeatService heartBeat = new NFSHeartBeatService();
  private static final String DOCS_SHARE = "DOCS_SHARE";
  private static final String VIEWER_SHARE = "VIEWER_SHARE";
  //beat interval is 1 seconds
  private int interval = 10 * 60 * 1000;
  private Timer timer;
  
  private NFSHeartBeatService()
  {
  }
  
  public static NFSHeartBeatService getInstance()
  {
    return heartBeat;
  }
  
  public void init()
  {
    String docsShare = WASConfigHelper.getCellVariable(DOCS_SHARE);
    LOG.log(Level.INFO, "DOCS_SHARE is located at " + docsShare);
    String viewerShare = WASConfigHelper.getCellVariable(VIEWER_SHARE);
    LOG.log(Level.INFO, "VIEWER_SHARE is located at " + viewerShare);
    String repositoryPath = WASConfigHelper.getCellVariable("CONVERSION_INSTALL_ROOT");
    File docsLocal = new File(repositoryPath, "docs_share");
    if(docsShare != null)
    {
      if(!docsLocal.exists() && !docsLocal.mkdirs())
      {
        LOG.log(Level.WARNING, "failed to create folder " + docsLocal.getAbsolutePath());
      }
      createTempFile(docsShare, "docs.txt");
    }
    File viewerLocal = new File(repositoryPath, "viewer_share");
    if(viewerShare != null)
    {
      if(!viewerLocal.exists() && !viewerLocal.mkdirs())
      {
        LOG.log(Level.WARNING, "failed to create folder " + viewerLocal.getAbsolutePath());
      }
      createTempFile(viewerShare, "viewer.txt");
    }

    timer = new Timer();
    timer.schedule(new HeartBeat(docsShare, docsLocal.getAbsolutePath(), viewerShare, viewerLocal.getAbsolutePath()), 0, interval);
  }
  
  private void createTempFile(String remote, String name)
  {
    File file = new File(remote, name);
    FileOutputStream fos = null;
    try
    {
      fos = new FileOutputStream(file);
      String content = "this is a test file " + name;
      fos.write(content.getBytes());
    }
    catch(FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "can not find the file " + file.getAbsolutePath());
    }
    catch(IOException e)
    {
      LOG.log(Level.SEVERE, "io error when writing to " + file.getAbsolutePath());
    }
    finally
    {
      if(fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "io error when closing " + file.getAbsolutePath());
        }
      }
    }
  }
}

class HeartBeat extends TimerTask
{
  private static final Logger LOG = Logger.getLogger(HeartBeat.class.getName());

  private String docsRemote;
  private String docsLocal;
  private String viewerRemote;
  private String viewerLocal;
  
  public HeartBeat(String docsRemote, String docsLocal, String viewerRemote, String viewerLocal)
  {
    this.docsRemote = docsRemote;
    this.docsLocal = docsLocal;
    this.viewerLocal = viewerLocal;
    this.viewerRemote = viewerRemote;
  }
  
  private void copyFile(String remote, String local, String name) throws Exception
  {
    if(remote != null)
    {
      File source = new File(remote, name);
      File target = new File(local, name);
      long start = System.currentTimeMillis();
      NFSFileUtil.nfs_copyFileToFile(source, target, 0);
      long end = System.currentTimeMillis();
      LOG.fine("copy file from " + source.getAbsolutePath() + " to " + target.getAbsolutePath() + " cost:" + (end - start) + " ms");
      if(!target.delete())
      {
        LOG.log(Level.WARNING, "failed to delete file " + target.getAbsolutePath());
      }  
    }
    
  }
  
  public void run()
  {
    try
    {
      //for docs
      copyFile(docsRemote, docsLocal, "docs.txt");
      //for viewer
      copyFile(viewerRemote, viewerLocal, "viewer.txt");
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed when performing nfs heart beat check " , e);
    }
  }
}
