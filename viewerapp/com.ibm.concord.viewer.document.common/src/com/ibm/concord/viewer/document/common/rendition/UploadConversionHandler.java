package com.ibm.concord.viewer.document.common.rendition;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;

import com.ibm.concord.viewer.document.common.DocumentServiceHelper;
import com.ibm.concord.viewer.platform.conversion.TaskListener;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.ConversionEvent;
import com.ibm.concord.viewer.platform.util.ConcurrentFileUtil;
import com.ibm.concord.viewer.platform.util.ImageMeta;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;

import com.ibm.json.java.JSONObject;

public class UploadConversionHandler implements TaskListener
{
  private static final Logger LOG = Logger.getLogger(UploadConversionHandler.class.getName());
  
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
  
  private boolean isPreFetched = false;
  
  private static final int PRE_FETCH_SIZE = 3;
  
  public UploadConversionHandler(String name, String convertDir, String mediaDir, String stellentType, String width)
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
    handleEvent(event, false);
  }
  
  public JSONObject getMetaJson(String dir, File metaFile) throws FileNotFoundException, IOException
  {
    File media = new File(dir);
    if (!media.exists() || !media.isDirectory())
    {
      LOG.log(Level.WARNING, "This media does not exist or is not a directory: " + mediaDir);
      throw new FileNotFoundException("This media does not exist or is not a directory" + mediaDir);
    }
    // merge Media
    if (!metaFile.exists())
    {
      metaFile.createNewFile();
    }
    JSONObject metaJson = null;
    if (metaFile.length() == 0)
    {
      metaJson = new JSONObject();
    }
    else 
    {
      metaJson = ConcurrentFileUtil.readMetaFromFile(metaFile);
    }
    return metaJson;
  }
  
  public void initMetaJson(int metaSize) throws FileNotFoundException, InterruptedException, IOException
  {
    // Consider failover case here
    List<Rendition> renditionsMedia = RenditionUtil.fromFile(new File(mediaDir), true);
    if (renditionsMedia.size() > metaSize)
    {
      ImageMeta[] metas = new ImageMeta[renditionsMedia.size() - metaSize];
      for (int index = metaSize; index < renditionsMedia.size(); index++)
      {
        Rendition rendition = renditionsMedia.get(index);
        metas[index - metaSize] = new ImageMeta(name + "_" + index, rendition.getName(), String.valueOf(rendition.getWidth()),
            String.valueOf(rendition.getHeigth()));
      }
      ConcurrentFileUtil.writeMetaToFile(renditionMetaFile, metas);
    }
  }

  public void preFetch(boolean handleCorrupted) throws FileNotFoundException, InterruptedException, IOException
  {
    if (isPreFetched)
    {
      return;
    }
    JSONObject metaJson = getMetaJson(mediaDir, renditionMetaFile);
    initMetaJson(metaJson.size());
    metaJson = getMetaJson(mediaDir, renditionMetaFile);
    int metaSize = metaJson.size();
    if (metaSize > 0)
    {
      isPreFetched = true;
      return;
    }
    else
    {
      List<Rendition> renditions = getRenditions(handleCorrupted);
      int count = renditions.size() > PRE_FETCH_SIZE ? PRE_FETCH_SIZE : renditions.size();
      if (count > 0)
      {
        update(renditions, 0, count);
        isPreFetched = true;
      }
    }
  }

  public void postFetch(boolean handleCorrupted) throws FileNotFoundException, InterruptedException, IOException
  {
    List<Rendition> renditions = getRenditions(handleCorrupted);
    if (renditions.size() > 0)
    {
      JSONObject metaJson = getMetaJson(mediaDir, renditionMetaFile);
      update(renditions, metaJson.size(), renditions.size());
    }
  }

  public List<Rendition> getRenditions(boolean handleCorrupted)
  {
    List<Rendition> renditions = null;
    if (!handleCorrupted)
    {
      renditions = RenditionUtil.fromFile(new File(convertDir), true);
    }
    else
    {
      renditions = RenditionUtil.forceFromFile(new File(convertDir), true, stellentType, width);
    }
    return renditions;
  }
  public void update(List<Rendition> renditions, int from, int count) throws FileNotFoundException, InterruptedException, IOException
  {
    if(count > 0)
    {
      ImageMeta[] metas = new ImageMeta[count];
      for(int index=from, i=0; i < count; index++, i++)
      {
        Rendition rendition = renditions.get(i);
        String mediaName = mediaDir + File.separator + rendition.getName();
        LOG.log(Level.FINE, name + "/" + mediaDir + ", index at " + index);
        if (!rendition.renameTo(mediaName))
        {
          LOG.log(Level.WARNING, "Rename failed: " +  mediaDir + File.separator + rendition.getName() + ", index at " + index);
          if(rendition.moveTo(mediaName))
          {
            LOG.log(Level.FINE, "Move File succeeded: " +  mediaDir + File.separator + rendition.getName() + ", index at " + index);
            metas[i] = new ImageMeta(name + "_" + index, rendition.getName(), String.valueOf(rendition.getWidth()), String.valueOf(rendition.getHeigth()));
          }
        }
        else
        {      
          metas[i] = new ImageMeta(name + "_" + index, rendition.getName(), String.valueOf(rendition.getWidth()), String.valueOf(rendition.getHeigth()));
        }
      }
      ConcurrentFileUtil.writeMetaToFile(renditionMetaFile, metas);
      LOG.log(Level.FINE, "Update meta file: " + renditionMetaFile.getAbsolutePath());
    }
  }

  public void handleEvent(ConversionEvent event, boolean handleCorrupted) throws FileNotFoundException, InterruptedException, IOException
  {
    if(event != null && event.equals(ConversionEvent.PREFETCH))
    {
      preFetch(handleCorrupted);
      return;
    }
    if(isPreFetched)
    {
      List<Rendition> renditions = getRenditions(handleCorrupted);
      int count = renditions.size();
      if(count > 0)
      {
        JSONObject metaJson = getMetaJson(mediaDir, renditionMetaFile);
        update(renditions,metaJson.size(), count);
      }
    }
    else
    {
      preFetch(handleCorrupted);
      otherType.onEvent(ConversionEvent.PREFETCH);
      isPreFetched = true;
      postFetch(handleCorrupted);
    }
    if (event != null && event.equals(ConversionEvent.DONE))
    {
      File f = new File(mediaDir, STATUS_DONE_FILE);
      f.createNewFile();
    }
  }
  
  public JSONObject getResultJson() throws FileNotFoundException, InterruptedException, IOException
  {
    JSONObject metaJson = null;
    try
    {
      metaJson = ConcurrentFileUtil.readMetaFromFile(renditionMetaFile);
      if(metaJson==null) metaJson = new JSONObject();
    }
    catch (Exception e)
    {
      LOG.warning("Read json file failed: " + renditionMetaFile.getAbsolutePath());
      metaJson = new JSONObject();
    }
    
    try
    {
      int mediaSize = RenditionUtil.getSizeFromFile(new File(convertDir));
      if (mediaSize > 0)
      {
       handleEvent(null, true);
       metaJson = ConcurrentFileUtil.readMetaFromFile(renditionMetaFile);
      }
      if(metaJson==null) metaJson = new JSONObject();
    }
    catch (Exception e)
    {
      LOG.warning("handleResultJson error" + renditionMetaFile.getAbsolutePath());
      metaJson = new JSONObject();
    }
    return metaJson;
  }
  
  public void setConvertDir(String convertDir)
  {
    this.convertDir = convertDir;
    this.mediaDir = convertDir;
    this.renditionMetaFile = new File(mediaDir, name + ".meta");
  }

  public String getConvertDir()
  {
    // TODO Auto-generated method stub
    return new File(mediaDir).getParentFile().getAbsolutePath() + File.separator + name;
  }

  public void addListener(TaskListener otherType)
  {
    this.otherType = otherType;
  }

}
