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
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;

import com.ibm.concord.viewer.document.common.util.Image;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.rendition.IRendition;
import com.ibm.json.java.JSONObject;

public class Rendition implements IRendition
{
  private static final Logger LOG = Logger.getLogger(Rendition.class.getName());

  private static final String CLASS_NAME = Rendition.class.getName();

  private static final String WIDTH = "w";

  private static final String HEIGTH = "h";

  private File image;

  private int width = 0;

  private int height = 0;
  
  private String stellentType = null;
  
  private int defaultWidth = 0;
  
  private int defaultHeight = 0;  

  public Rendition(File f) throws IOException
  {
    image = f;
    prepare();
  }
  
  public Rendition(File f, String stellentType, String width) throws IOException
  {
    image = f;
    this.stellentType = stellentType;
    try
    {
      defaultWidth = Integer.parseInt(width);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "The config width cannot be parsed for " + stellentType);
      defaultWidth = 1024;
    }
    this.setSize();
    forcePrepare();
  }

  public boolean renameTo(String path)
  {
    File src = image;
    File dest = new File(path);
    if (src.renameTo(dest))
    {
      return true;
    }
    else
    {
      StringBuffer msg = new StringBuffer();
      msg.append(" From:" + src.getAbsolutePath());
      msg.append(" To:" + dest.getAbsolutePath());
      LOG.log(Level.SEVERE, "Rename failed, will try moveFile(copy+delete)." + msg.toString());
      return false;
    }
  }
  
  public boolean moveTo(String path) throws IOException
  {
    File src = image;
    File dest = new File(path);
    
    try
    {
      FileUtils.moveFile(src, dest);
      return true;
    }
    catch (IOException e)
    {
      StringBuffer msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_MOVE_FILE_FAILED);
      msg.append(" From:" + src.getAbsolutePath());
      msg.append(" To:" + dest.getAbsolutePath());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_MOVE_FILE_FAILED, msg.toString()));
      throw e;
    }
  }

  public Rendition(String path) throws IOException
  {
    this(new File(path));
  }

  private void prepare() throws IOException
  {
    LOG.entering(CLASS_NAME, "prepare");

    Image pic = new Image(image.getAbsolutePath());
    width = pic.getWidth();
    height = pic.getHeight();
    if (width == -1 || height == -1 || pic.isCorrupted())
    {
      throw new RuntimeException("Error occured when prepare image: " + image.getName());
    }

    LOG.exiting(CLASS_NAME, "prepare");
  }

  public int getWidth()
  {
    return width;
  }

  public int getHeigth()
  {
    return height;
  }

  public String getName()
  {
    return image.getName();
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.rendition.IRendition#toJson() should be like { thumbnail0 : { map : { }, size : { } } }
   */
  public JSONObject toJson()
  {
    JSONObject size = new JSONObject();
    size.put(WIDTH, getWidth());
    size.put(HEIGTH, getHeigth());

    return size;
  }
  
  public void forcePrepare()
  {
    LOG.entering(CLASS_NAME, "forcePrepare");
    Image pic = null;
    try
    {
      pic = new Image(image.getAbsolutePath());
      width = pic.getWidth();
      height = pic.getHeight();
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE,"Exception throws out for forcePrepare + " + image.getAbsolutePath());
      width = -1;
      height = -1;
    }

    if(pic == null || pic.isCorrupted())
    {
      StringBuffer msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_FILE_CORRUPTED);
      msg.append(" File is:" + image.getAbsolutePath());
      msg.append(" Default size:" + defaultWidth + " X " + defaultHeight);
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_FILE_CORRUPTED, msg.toString()));
    }
    if (width == -1 || height == -1)
    {
      width = defaultWidth;
      height = defaultHeight;
    }
    LOG.exiting(CLASS_NAME, "forcePrepare");
  }
  
  private void setSize()
  {
    if (stellentType.equals(DocumentTypeUtils.PRESENTATION))
    {
      // The ratio is 1024 * 768
      defaultHeight = (int) (defaultWidth * 768 / 1024);
    }
    else if (stellentType.equals(DocumentTypeUtils.SPREADSHEET))
    {
      // The ratio is 3541 * 1094
      defaultHeight = (int) (defaultWidth * 1094 / 3541);
    }
    else if (stellentType.equals(DocumentTypeUtils.TEXT))
    {
      // The ratio is 1024 * 1325
      defaultHeight = (int) (defaultWidth * 1325 / 1024);
    }
    else
    {
      // The ratio is 1024 * 1325
      defaultHeight = (int) (defaultWidth * 1325 / 1024);
    }
  }
}
