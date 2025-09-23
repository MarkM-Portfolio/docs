package com.ibm.concord.writer;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.draft.IDraftJSONObjectDeserializer;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author xuezhiy@cn.ibm.com
 * 
 */
public class WriterDraftDeserializer implements IDraftJSONObjectDeserializer
{
  private static final String CONTENT = "content";

  private static final String STYLES = "styles";

  private static final String NUMBERING = "numbering";

  private static final String SETTINGS = "settings";

  private static final String RELATIONS = "relations";
  
  private static final String META = "meta";
  
  private static final String NSDEF = "nsDef";
  
  private static final Logger LOG = Logger.getLogger(WriterDraftDeserializer.class.getName());

  public JSONObject deserialize(DraftDescriptor draftDescriptor) throws Exception
  {
    JSONObject contentObj = null, stylesObj = null, numberingObj = null, settingsObj = null, relObj = null, metaObj = null, nsDefObj = null;
    InputStream contentIS = null, stylesIS = null, numberingIS = null, settingsIS = null, relIS = null, metaIS = null, nsDefIS = null;

    String name = "";
    try
    {
      DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);

      JSONArray draftSections = dsm.listDraftSections(draftDescriptor, null);

      for (Iterator iterator = draftSections.iterator(); iterator.hasNext();)
      {
        JSONObject section = (JSONObject) iterator.next();
        name = (String) section.get("name");
        String path = (String) section.get("abs_path");
        if (WriterDocumentModel.CONTENT_FILE.equalsIgnoreCase(name))
        {
          contentIS = new FileInputStream(path);
          contentObj = JSONObject.parse(contentIS);
        }
        else if (WriterDocumentModel.STYLES_FILE.equalsIgnoreCase(name))
        {
          stylesIS = new FileInputStream(path);
          stylesObj = JSONObject.parse(stylesIS);
        }
        else if (WriterDocumentModel.NUMBERING_FILE.equalsIgnoreCase(name))
        {
          numberingIS = new FileInputStream(path);
          numberingObj = JSONObject.parse(numberingIS);
        }
        else if (WriterDocumentModel.SETTINGS_FILE.equalsIgnoreCase(name))
        {
          settingsIS = new FileInputStream(path);
          settingsObj = JSONObject.parse(settingsIS);
        }
        else if (WriterDocumentModel.RELATIONS_FILE.equalsIgnoreCase(name))
        {
          relIS = new FileInputStream(path);
          relObj = JSONObject.parse(relIS);
        }
        else if(WriterDocumentModel.META_FILE.equalsIgnoreCase(name))
        {
        	metaIS = new FileInputStream(path);
        	metaObj = JSONObject.parse(metaIS);
        }
        else if(WriterDocumentModel.NSDEF_FILE.equalsIgnoreCase(name))
        {
        	nsDefIS = new FileInputStream(path);
        	nsDefObj = JSONObject.parse(nsDefIS);
        }
      }

      JSONObject result = new JSONObject();
      result.put(CONTENT, contentObj);
      result.put(STYLES, stylesObj);
      result.put(NUMBERING, numberingObj);
      result.put(SETTINGS, settingsObj);
      result.put(RELATIONS, relObj);
      if(metaObj != null)
    	  result.put(META, metaObj);
      if(nsDefObj != null)
    	  result.put(NSDEF, nsDefObj);

      return result;
    }
    catch(Exception e)
    {
      LOG.log(Level.WARNING, "deserialize " + name, e);
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
      if(metaIS != null)
    	  metaIS.close();
      if(nsDefIS != null)
    	  nsDefIS.close();
    }
  }

}
