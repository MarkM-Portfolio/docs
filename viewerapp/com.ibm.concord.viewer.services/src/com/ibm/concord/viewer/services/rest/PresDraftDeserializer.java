/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.codehaus.jackson.JsonFactory;

import com.ibm.concord.spreadsheet.common.utils.StreamBuilder;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.presentation.common.DraftDomFixer;
import com.ibm.concord.presentation.common.DraftJSONConverter;

public class PresDraftDeserializer
{
  public static final Logger LOG = Logger.getLogger(PresDraftDeserializer.class.getName());

  private JSONObject criteria;

  private static final String PARTIAL_FLAG = "inPartial";

  private static final String CHUNK_ID = "chunkId";

  private static final String INIT_SLIDE = "initSlide";
  
  private JsonFactory jsonFactory;
  
  private StreamBuilder streamer;

  public PresDraftDeserializer(JSONObject criteria, JsonFactory jsonFactory)
  {
    this.criteria = criteria;
    this.jsonFactory = jsonFactory;
    this.streamer = null;
  }

  public JSONObject doDeserialize(ICacheDescriptor cache) throws Exception
  {
    JSONObject state = new JSONObject();
    state.put("status", "OK");
    long time = System.currentTimeMillis();
    try
    {
      boolean bInPartial = false;

      Object partial_flag_obj = (criteria == null) ? null : criteria.get(PARTIAL_FLAG);
      if (partial_flag_obj != null)
        bInPartial = partial_flag_obj.toString().equalsIgnoreCase("true");

      String chunkId = null;
      Object chunk_id_obj = (criteria == null) ? null : criteria.get(CHUNK_ID);
      if (chunk_id_obj != null)
        chunkId = chunk_id_obj.toString();

      int initSlide = 5;
      Object init_slide_obj = (criteria == null) ? null : criteria.get(INIT_SLIDE);
      if (init_slide_obj != null)
      {
        initSlide = Integer.parseInt(init_slide_obj.toString());
      }

      String contentPath = cache.getHtmlURI() + File.separator + "content.html";
      String strContent = readFileAsString(new File(contentPath), NFSFileUtil.NFS_RETRY_SECONDS);
     
      long time2 = System.currentTimeMillis();
      
      System.out.println("PresDraft read content use time " + (time2 - time));
      
      strContent = strContent.replaceAll("[\r\n]", "");
      DraftDomFixer domfixer = new DraftDomFixer();
      strContent = domfixer.fixDom(strContent);// content.html
      
      long time3 = System.currentTimeMillis();
      
      System.out.println("PresDraft fix dom use time " + (time3 - time2));
      
      if (!bInPartial)
      {
        state.put("json", DraftJSONConverter.convert(strContent, ""));
        return state;
      }

      Matcher m2 = Pattern.compile("<\\s*div[^<]*\\s*class\\s*=\\s*[\'\"][^<]*\\s*slideWrapper[^<]*[\'\"][^<]*>").matcher(strContent);
      int slideNum = 0;
      int slideNewStart = -1;
      while (m2.find())
      {
        slideNum++;
        if (slideNum > initSlide)
        {
          slideNewStart = m2.start();
          break;
        }
      }
      // check start : no need to split package
      if (slideNewStart == -1)
      {
        state.put("json", DraftJSONConverter.convert(strContent, ""));
        return state;
      }

      // to split the content by slide
      String theFirstPackage = strContent.substring(0, slideNewStart);
      String theSecondPackage = strContent.substring(slideNewStart);

      // find the end of slideWrapper
      Matcher m3 = Pattern.compile("<\\s*/\\s*div\\s*>\\s*<\\s*div[^<]*\\s*id=[\'\"]tempStore[\'\"].*?>").matcher(theSecondPackage);
      if (m3.find())
      {
        // has "tempStore"
        int slideWrapperEnd = m3.start();
        theFirstPackage += theSecondPackage.substring(slideWrapperEnd);
        theSecondPackage = theSecondPackage.substring(0, slideWrapperEnd);
      }
      else
      {
        // no "tempStore"
        String endString = "</div></body></html>";
        theFirstPackage += endString;
        int endIndex = theSecondPackage.lastIndexOf(endString);
        if (endIndex > 0)
        {
          theSecondPackage = theSecondPackage.substring(0, endIndex);
        }
      }
      
      long time4 = System.currentTimeMillis();
      
      System.out.println("PresDraft split content use time " + (time4 - time3));

      // we can split
      if (chunk_id_obj != null)
      {
        String listBeforeStyles = "";
        Pattern myPattern = Pattern.compile("<\\s*style\\s+stylename\\s*\\=\\s*\\\"list_before_style\\\"(.*?)<\\s*/\\s*style\\s*>");
        Matcher m = myPattern.matcher(theFirstPackage);
        if (m.find())
        {
          listBeforeStyles = m.group();
        }

        theSecondPackage = "<html><head>" + listBeforeStyles + "</head><body>" + theSecondPackage + "</body></html>";
        state.put("json", DraftJSONConverter.convert(theSecondPackage, ""));
      }
      else
      {
        chunkId = UUID.randomUUID().toString();
        state.put("json", DraftJSONConverter.convert(theFirstPackage, ""));
        state.put(CHUNK_ID, chunkId);
      }

      long time_end = System.currentTimeMillis();

      System.out.println("PresDraft generate use time " + (time_end - time) + " for " + (chunk_id_obj == null ? "first batch" : "second batch"));
      return state;
    }
    catch (Exception e)
    {
      System.err.println("Parse file error: ");
      System.err.printf(e.toString());
      throw e;
    }

  }
  
  public void setStreamBuilder(StreamBuilder streamer) 
  {
    this.streamer = streamer;
  }
  
  /*
   * To support decryption, NFSFileUtil.nfs_readFileAsString() is duplicated
   */
  private String readFileAsString(File f, int seconds) throws IOException
  {
    if (!NFSFileUtil.nfs_assertExistsFile(f, seconds))
    {
      LOG.log(Level.INFO, "cannot read file as string, file does not exists: " + f.getAbsolutePath());
    }
    
    int length = (int) f.length();
    StringBuffer buffer = new StringBuffer(length);
    BufferedReader br = null;    
    IOException recordE = null;
    boolean success = false;
    try
    {
      InputStream is = null;
      if (this.streamer != null)
        is = this.streamer.getInputStream(f);
      else
        is = new FileInputStream(f);
      br = new BufferedReader(new InputStreamReader(is, NFSFileUtil.DEFAULT_ENCODING));
      int ch;
      while ((ch = br.read()) > -1)
      {
        buffer.append((char) ch);
      }
      if (buffer.length() > 0)
      {
        success = true;
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed read string from file: " + f.getAbsolutePath() + " will retry shortly");
      recordE = e;
    }
    finally {
      if (br != null)
      {
        try
        {
          br.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "cannot close stream: " + f.getAbsolutePath(), e);
        }
      }
    }
    
    if (success)
      return buffer.toString();
    
    LOG.log(Level.FINEST, "retry to read string from file: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }
    
    int retry = seconds * 1000 / NFSFileUtil.NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFSFileUtil.NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      
      try
      {
        buffer = new StringBuffer(length);
        InputStream is = null;
        if (this.streamer != null)
          is = this.streamer.getInputStream(f);
        else
          is = new FileInputStream(f);
        br = new BufferedReader(new InputStreamReader(is, NFSFileUtil.DEFAULT_ENCODING));
        int ch;
        while ((ch = br.read()) > -1)
        {
          buffer.append((char) ch);
        }
        if (buffer.length() > 0)
        {
          success = true;
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "failed to read string from file by retry: " + i + " file: " + f.getAbsolutePath(), e);
        recordE = e;
      }
      finally {
        if (br != null)
        {
          try
          {
            br.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "cannot close stream: " + f.getAbsolutePath(), e);
          }
        }
      }
      
      if (success)
      {
        LOG.log(Level.FINEST, "successfully to read string from file by retry: " + i + " file: " + f.getAbsolutePath());
        return buffer.toString();
      }
    }
    
    LOG.log(Level.INFO, "failed to read string from file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE == null)
    {
      recordE = new IOException("failed to read string from file: " + f.getAbsolutePath());
    }
    throw recordE;
  }
}
