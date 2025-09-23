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

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Iterator;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonFactory;

import com.ibm.concord.spreadsheet.common.utils.StreamBuilder;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.encryption.Encryptor;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TextDraftDeserializer
{
  public static final Logger LOG = Logger.getLogger(TextDraftDeserializer.class.getName());

  private JSONObject criteria;

  private JsonFactory jsonFactory;
  
  private static final String CONTENT = "content";

  private static final String STYLES = "styles";

  private static final String NUMBERING = "numbering";

  private static final String SETTINGS = "settings";

  private static final String RELATIONS = "relations";
  
  public final static String CONTENT_FILE = "content.json";

  public final static String STYLES_FILE = "styles.json";

  public final static String NUMBERING_FILE = "numbering.json";

  public final static String SETTINGS_FILE = "settings.json";
  
  public final static String RELATIONS_FILE = "relations.json";
  
  private StreamBuilder streamer;

  public TextDraftDeserializer(JSONObject criteria, JsonFactory jsonFactory)
  {
    this.criteria = criteria;
    this.jsonFactory = jsonFactory;
    this.streamer = null;
  }

  public JSONObject doDeserialize(ICacheDescriptor cache) throws Exception
  {
    JSONObject contentObj = null, stylesObj = null, numberingObj = null, settingsObj = null, relObj = null;
    InputStream contentIS = null, stylesIS = null, numberingIS = null, settingsIS = null, relIS = null;

    String name = "";
    try
    {
      JSONArray draftSections = new JSONArray();  //dsm.listDraftSections(draftDescriptor, null);
      
      File draftHome = new File(cache.getHtmlURI() + File.separator);

      collectDraftSections(draftHome, draftSections);
      
      for (Iterator<JSONObject> iterator = draftSections.iterator(); iterator.hasNext();)
      {
        JSONObject section = (JSONObject) iterator.next();
        name = (String) section.get("name");
        String path = (String) section.get("abs_path");
        if (TextDraftDeserializer.CONTENT_FILE.equalsIgnoreCase(name))
        {
          if (streamer != null)
            contentIS = streamer.getInputStream(path); 
          else
            contentIS = new FileInputStream(path);
          contentObj = JSONObject.parse(contentIS);
        }
        else if (TextDraftDeserializer.STYLES_FILE.equalsIgnoreCase(name))
        {
          if (streamer != null)
            stylesIS = streamer.getInputStream(path); 
          else
            stylesIS = new FileInputStream(path);
          stylesObj = JSONObject.parse(stylesIS);
        }
        else if (TextDraftDeserializer.NUMBERING_FILE.equalsIgnoreCase(name))
        {
          if (streamer != null)
            numberingIS = streamer.getInputStream(path); 
          else
            numberingIS = new FileInputStream(path);
          numberingObj = JSONObject.parse(numberingIS);
        }
        else if (TextDraftDeserializer.SETTINGS_FILE.equalsIgnoreCase(name))
        {
          if (streamer != null)
            settingsIS = streamer.getInputStream(path); 
          else
            settingsIS = new FileInputStream(path);
          settingsObj = JSONObject.parse(settingsIS);
        }
        else if (TextDraftDeserializer.RELATIONS_FILE.equalsIgnoreCase(name))
        {
          if (streamer != null)
            relIS = streamer.getInputStream(path); 
          else
            relIS = new FileInputStream(path);
          relObj = JSONObject.parse(relIS);
        }
      }

      JSONObject result = new JSONObject();
      result.put(CONTENT, contentObj);
      result.put(STYLES, stylesObj);
      result.put(NUMBERING, numberingObj);
      result.put(SETTINGS, settingsObj);
      result.put(RELATIONS, relObj);

      return result;
    }
    catch(Exception e)
    {
      System.err.println("Parse file error: " + name);
      System.err.printf(e.toString());
      throw e;
    }
    finally
    {
      if (contentIS != null)
        contentIS.close();
      if (stylesIS != null)
        stylesIS.close();
      if (numberingIS != null)
        numberingIS.close();
      if (settingsIS != null)
        settingsIS.close();
      if (relIS != null)
        relIS.close();
    }
  }
  
  private void collectDraftSections(File draftHome, JSONArray result)
  {
	//File draftHome = new File(cache.getHtmlURI() + File.separator);
    File[] allFiles = draftHome.listFiles();
    for (int i = 0; i < allFiles.length; i++)
    {
      if (allFiles[i].isFile())
      {
    	  
        JSONObject item = new JSONObject();

        item.put("name", allFiles[i].getName());
        //item.put("size", sectionFile.getSize());

        String absPath = allFiles[i].getPath();
        item.put("abs_path", absPath);

        //if (filterSection == null)
        {
          //result.add(allFiles[i].getPath());
          result.add(item);
        }
        /*else
        {
          if (allFiles[i].getPath().startsWith(filterSection.getSectionPath()))
          {
            result.add(allFiles[i].getPath());
          }
        }*/
      }
      else
      {
        collectDraftSections(allFiles[i], result);
      }
    }
  }
  
  public void setStreamBuilder(StreamBuilder streamer) 
  {
    this.streamer = streamer;
  }
}
