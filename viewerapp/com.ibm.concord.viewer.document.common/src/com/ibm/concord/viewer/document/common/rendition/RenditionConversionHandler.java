/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.common.rendition;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.crypto.SecretKey;

import com.ibm.concord.viewer.platform.conversion.ConversionTask.ConversionEvent;
import com.ibm.concord.viewer.platform.conversion.TaskListener;
import com.ibm.concord.viewer.platform.util.ConcurrentFileUtil;
import com.ibm.concord.viewer.platform.util.ImageMeta;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;

/**
 * @author niebomin
 * Handler for rendition conversion
 * Capabilities
 * - Check the conversion result in the conversion directory
 * - Increasingly write meta data file
 * - Move the converted rendition into external cache dir
 */
public class RenditionConversionHandler implements TaskListener
{
  private static final Logger LOG = Logger.getLogger(RenditionConversionHandler.class.getName());
 
  public TaskListener otherType = null;
  
  /**
   * The name for handler.  Thumbnail handler's name is "thumbnails"
   */
  private String name;

  /**
   * Convert directory of the rendition
   */
  private String convertDir;

  /**
   * External directory of the cache
   */
  private String mediaDir;

  /**
   * Meta data json file of current conversion result 
   */
  private File renditionMetaFile;

  private static final String STATUS_DONE_FILE = "status.done";
  
  /**
   * The stellent type value is : pres, sheet, text, pdf
   */
  private String stellentType = "";
  
  /**
   * The default width when the image is corrupted
   */
  private String width = "";
  
  private ArrayList<String> existsImages = new ArrayList<String>();
  
  private boolean firstPageDone = false;
  
  private String encryptKeyStr = null;

  public RenditionConversionHandler(String name, String convertDir, String mediaDir, String stellentType, String width)
  {
    this.name = name;
    this.convertDir = convertDir;
    this.mediaDir = mediaDir;
    this.renditionMetaFile = new File(mediaDir, name + ".meta");
    this.stellentType = stellentType;
    this.width = width;
  }

  public void onEvent(ConversionEvent event) throws FileNotFoundException, InterruptedException, IOException
  {
    
    File media = new File(mediaDir);
    if (!media.exists() || !media.isDirectory())
    {
      LOG.log(Level.WARNING, "This media does not exist or is not a directory: " + mediaDir);
      throw new FileNotFoundException("This media does not exist or is not a directory" + mediaDir);
    }
    // merge Media
    if (!renditionMetaFile.exists())
    {
      renditionMetaFile.createNewFile();
    }

    JSONObject metaJson = null;
    JSONObject delta = new JSONObject();
    if (renditionMetaFile.length() == 0)
    {
      metaJson = new JSONObject();
    }
    else 
    {
      //metaJson = ConcurrentFileUtil.safeReadJsonFromFile(renditionMetaFile);
      metaJson = ConcurrentFileUtil.readMetaFromFile(renditionMetaFile);
    }
    
    int metaSize = metaJson.size();
    if (metaSize != existsImages.size())
    {
      LOG.log(Level.INFO, "Image number in memory is different with image number in meta file, will reload from meta file: " + renditionMetaFile.getAbsolutePath());
      existsImages.clear();
      for (int i = 0; i < metaSize; i++)
      {
        existsImages.add(((JSONObject)(metaJson.get(name + "_" + i ))).get("name").toString());
      }
    }
    List<Rendition> renditions = RenditionUtil.fromFile(new File(convertDir), /* name, */true, existsImages);
    
    LOG.log(Level.FINE, "Getting rendition info for " + name + ": metasize: " + metaSize + " rendition size: " + renditions.size() + " :" + mediaDir);
    int actIndex = metaSize;
    ImageMeta[] metas = new ImageMeta[renditions.size()]; 
    for (int index = 0; index < renditions.size(); index++)
    {
      Rendition rendition = renditions.get(index);
      existsImages.add(rendition.getName());
      metas[index] = new ImageMeta(this.name + "_" + actIndex, rendition.getName(), String.valueOf(rendition.getWidth()), String.valueOf(rendition.getHeigth()));
      actIndex++;
    }

    if (actIndex > metaSize)
    {
      ConcurrentFileUtil.writeMetaToFile(renditionMetaFile, metas);
    }
    
    if (event.equals(ConversionEvent.DONE))
    {
      File f = new File(mediaDir, STATUS_DONE_FILE);
      f.createNewFile();
    }
    if(!firstPageDone)
    {
      if(metaSize > 0)
      {
        firstPageDone = true;
        LOG.log(Level.FINE, "first page in failover case for " + name+ " is ready, " + renditionMetaFile.getAbsolutePath());
        return;
      }
      if(actIndex > 0)
      {
        firstPageDone = true;
        LOG.log(Level.FINE, "first page for " + name+ " is ready, " + renditionMetaFile.getAbsolutePath());
      }
    }
  }

  public File getResultFile()
  {
    return renditionMetaFile;
  }

  /**
   * @return meta data file
   */
  public JSONObject getResultJson() throws InterruptedException, IOException
  {
    JSONObject metaJson = null;
    try
    {
      metaJson = ConcurrentFileUtil.readMetaFromFile(renditionMetaFile);
    }
    catch (Exception e)
    {
      LOG.warning("Read json file failed: " + renditionMetaFile.getAbsolutePath());
    }
    
    try
    {
      int renditionSize = RenditionUtil.getSizeFromFile(new File(convertDir));
      if (metaJson == null || metaJson.isEmpty() || ( metaJson.size() != renditionSize))
        metaJson = this.handleResultJson();
    }
    catch (Exception e)
    {
      LOG.warning("handleResultJson error" + renditionMetaFile.getAbsolutePath());
    }
    
    if (metaJson == null)
    {
      metaJson = new JSONObject();
    }
    if (shouldMoveFile())
    {
      return moveFile(getMediaDir());
    }
    return metaJson;
  }
  
  /**
   *  An redemption solution for 3014, if failed to rename pictures to folder and fails to get the json. 
   *  copy the temp folder to media first, then reconstruct the json file
   * @return
   * @throws Exception
   */
  public JSONObject handleResultJson() throws InterruptedException, IOException
  {
    LOG.info(this.name + " folder is null! move from temp folder & reconstruct rendition " + this.convertDir);
    List<Rendition> renditions = RenditionUtil.forceFromFile(new File(this.mediaDir), true, stellentType, width);
    JSONObject metaJson = new JSONObject();
    JSONObject delta = new JSONObject();
    LOG.info("The reconstruction rendition size is " + renditions.size() + " " + this.mediaDir);
    ImageMeta[] metas = new ImageMeta[renditions.size()]; 
    for (int i = 0; i < renditions.size(); i++)
    {
      Rendition rendition = renditions.get(i);
      JSONObject data = new JSONObject();
      data.put("name", rendition.getName());
      data.put("size", rendition.toJson());
      delta.put(this.name + "_" + i, data);
      metas[i] = new ImageMeta(this.name + "_" + i, rendition.getName(), String.valueOf(rendition.getWidth()), String.valueOf(rendition.getHeigth()));
    }
    metaJson.putAll(delta);
    ConcurrentFileUtil.writeMetaToFile(renditionMetaFile, metas);
    LOG.info(this.name + " merge to media directory successfully - " + this.convertDir);
    return metaJson;
  }

  public void setConvertDir(String convertDir)
  {
    this.convertDir = convertDir;
    this.mediaDir = convertDir;
    this.renditionMetaFile = new File(mediaDir, name + ".meta");
    this.existsImages.clear();
  }

  public boolean shouldMoveFile()
  {
    String fileName = new File(mediaDir).getName();
    if(!fileName.equals(name))
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  public String getMediaDir() 
  {
      return new File(mediaDir).getParentFile().getAbsolutePath() + File.separator + name;
  }

  public JSONObject moveFile(String targetFolder) throws InterruptedException, IOException
  {
    List<Rendition> renditions = RenditionUtil.forceFromFile(new File(this.mediaDir), true, stellentType, width);
    for (int i = 0; i < renditions.size(); i++)
    {
      Rendition rendition = renditions.get(i);
      String path = targetFolder + File.separator + rendition.getName();
      File dest = new File(path);
      if (dest.exists())
        dest.delete();
      if (!rendition.renameTo(path))
      {
        rendition.moveTo(path);
      }
    }
    JSONObject delta = new JSONObject();
    ImageMeta[] metas = null;
    if (renditionMetaFile.exists() || (!renditionMetaFile.exists() && FileUtil.nfs_assertExistsFile(renditionMetaFile, 1)))
    {
      List<Rendition> renditionsAfterMoved = RenditionUtil.forceFromFile(new File(targetFolder), true, stellentType, width);
      metas = new ImageMeta[renditionsAfterMoved.size()];
      for (int i = 0; i < renditionsAfterMoved.size(); i++)
      {
        Rendition rendition = renditionsAfterMoved.get(i);
        JSONObject data = new JSONObject();
        data.put("name", rendition.getName());
        data.put("size", rendition.toJson());
        delta.put(this.name + "_" + i, data);
        metas[i] = new ImageMeta(this.name + "_" + i, rendition.getName(), String.valueOf(rendition.getWidth()), String.valueOf(rendition.getHeigth()));
      }
    }
    else
    {
      LOG.log(Level.WARNING, "The meta file doesn't exist during moving the files - " + renditionMetaFile.getAbsolutePath());
      throw new IOException();
    }
    if (metas != null)
    {
      ConcurrentFileUtil.writeMetaToFile(new File(targetFolder + File.separator + renditionMetaFile.getName()), metas);
    }
    return delta;

  }

  public String getConvertDir()
  {
    // TODO Auto-generated method stub
    return this.convertDir;
  }

  public void addListener(TaskListener otherType)
  {
    this.otherType = otherType;
  }

  public void encryptCacheContent(IDocumentEntry entry, UserBean user) {
    RenditionUtil.encryptReditionFiles(new File(this.mediaDir), entry, user);
  }
}
