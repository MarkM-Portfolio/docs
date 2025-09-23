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
import java.util.logging.Logger;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParser;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.utils.StreamBuilder;
import com.ibm.concord.spreadsheet.partialload.PartialDeserializer;
import com.ibm.concord.spreadsheet.partialload.reference.NRJSPartialReference;
import com.ibm.concord.spreadsheet.partialload.reference.PartialReference;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.json.java.JSONObject;

public class SpreadsheetDraftDeserializer
{
  public static final Logger LOG = Logger.getLogger(SpreadsheetDraftDeserializer.class.getName());

  private JSONObject criteria;

  private JsonFactory jsonFactory;

  private final static String CONTENT_JSON_FILE = "content.js";

  private final static String META_JSON_FILE = "meta.js";

  private final static String REF_JSON_FILE = "reference.js";
  
  private StreamBuilder streamer;

  // Spreadsheet value initialize.
  static
  {
    ConversionConstant.MAX_REF_ROW_NUM = 1048576;
  }

  public SpreadsheetDraftDeserializer(JSONObject criteria, JsonFactory jsonFactory)
  {
    this.criteria = criteria;
    this.jsonFactory = jsonFactory;
    this.streamer = null;
  }

  public JSONObject doDeserialize(ICacheDescriptor cache) throws Exception
  {
    JsonParser contentJp = null;
    JSONObject metaObject = null;
    InputStream contentInputStream = null, referenceInputStream = null, metaInputStream = null;
    File contentFile = null;

    try
    {
      String folder = cache.getHtmlURI() + File.separator;
      contentFile = new File(folder + CONTENT_JSON_FILE);
      if (this.streamer != null)
        contentInputStream = this.streamer.getInputStream(contentFile);
      else
        contentInputStream = new FileInputStream(contentFile);
      contentJp = jsonFactory.createJsonParser(contentInputStream);
      if(new File(folder + REF_JSON_FILE).exists()) {
        if (this.streamer != null)
          referenceInputStream = this.streamer.getInputStream(folder + REF_JSON_FILE);
        else
          referenceInputStream = new FileInputStream(folder + REF_JSON_FILE);
      }
      if (this.streamer != null)
        metaInputStream = this.streamer.getInputStream(folder + META_JSON_FILE);
      else
        metaInputStream = new FileInputStream(folder + META_JSON_FILE);
      metaObject = JSONObject.parse(metaInputStream);
      JSONObject result = null;
      String ver = (String) metaObject.get(ConversionConstant.FILE_VERSION_FIELD);
      PartialDeserializer deserializer = new PartialDeserializer();
      deserializer.setCriteria(criteria);
      deserializer.setContentJsonParser(contentJp);
      deserializer.setMetaObject(metaObject);
      deserializer.setDocumentVersion(ver);
      deserializer.setStreamBuilder(this.streamer);
      NRJSPartialReference nrjspartialReference = new NRJSPartialReference();
      deserializer.setNRJSPartialReference(nrjspartialReference);
      nrjspartialReference.setPartialDeserializer(deserializer);
      deserializer.setDraftRootUri(cache.getHtmlURI());
      result = deserializer.deserialize();
      return result;
    }
    finally
    {
      if (contentJp != null)
      {
        contentJp.close();
      }
      if (contentInputStream != null)
      {
        contentInputStream.close();
      }
      if (metaInputStream != null)
      {
        metaInputStream.close();
      }
      if (referenceInputStream != null)
      {
        referenceInputStream.close();
      }
    }
  }
  public void setStreamBuilder(StreamBuilder streamer) 
  {
    this.streamer = streamer;
  }
}
