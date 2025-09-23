/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.doc.text.OdfWhitespaceProcessor;
import org.odftoolkit.odfdom.dom.element.dc.DcCreatorElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeAnnotationElement;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Comment;

public class CommentsConvertor 
{
  private static final Logger LOG = Logger.getLogger(CommentsConvertor.class.getName());
  
  public void convert(ConversionContext context, TransformerHandler hdl, Object input,ConversionUtil.Range range)
  {
    Cell cell = (Cell) input;
    if (range != null)
    {
      Map<String, JSONObject> items = (Map<String, JSONObject>) context.get("comments");
      String id = range.rangeId;
      JSONObject item = items.get(id);
      if (item != null)
      {
        if (isCommentsModified(item))
        {
          try {
            convertComments(hdl, item);
            cell.commentUpdated = true;  // use as a flag to indicate new comments is added.
          } 
          catch (Exception e)
          {
            LOG.log(Level.WARNING,"failed to wrtie comments.json " + e.getMessage() , e);
          }
        }
        else
        {
          cell.commentUpdated = false;  // use as a flag to indicate new comments is added.
        }
      }
    }
  }

  private void convertComments(TransformerHandler hdl, JSONObject comments) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl();
    attrs.addAttribute("", "", "id", "", (String) comments.get("id"));
    // attrs.addAttribute("", "", "draw:style-name", "", "gr1");
//    attrs.addAttribute("", "", "draw:caption-point-y", "", "-0.028cm");
//    attrs.addAttribute("", "", "draw:caption-point-x", "", "0.039cm");
    attrs.addAttribute("", "", "svg:x", "", "4.06cm");
//    attrs.addAttribute("", "", "svg:height", "", "1.99cm");
    attrs.addAttribute("", "", "svg:width", "", "5.543cm");
    // attrs.addAttribute("", "", "draw:text-style-name", "", "P1");
    hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_OFFICE_ANNONATION, attrs);
    // set dc:date 
    String dc_date = getDateString(comments);
    if (!dc_date.isEmpty()) 
    {
      hdl.startElement("", "", "dc:date", null);
      char[] text = dc_date.toCharArray();
      hdl.characters(text, 0, text.length);
      hdl.endElement("", "", "dc:date");
    }
    // set readable text
    char C_ZEROWIDTH_CHAR = '\u200B';
    JSONArray items = (JSONArray) comments.get("items");
    for (int i = 0; i < items.size(); i++)
    {
      JSONObject item = (JSONObject) items.get(i);
      String author = (String) item.get("name"); // item.RemoveChild(author);
      Long time = (Long) item.get("time"); 
      item.remove("time");
      Boolean resolved = (Boolean) item.get("resolved"); 
      item.remove("resolved");
      String content = (String) item.get("content"); 
      item.remove("content");
      // output author
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
      OutputText(hdl, C_ZEROWIDTH_CHAR + "#" + author + ":");
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
      // output time
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
      SimpleDateFormat tf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
      tf.setTimeZone(TimeZone.getTimeZone("GMT"));
      OutputText(hdl, C_ZEROWIDTH_CHAR + "#" + tf.format(new Date(time)) + "Z");
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
      // output resolve status
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
      if (resolved != null && resolved == true)
        OutputText(hdl, C_ZEROWIDTH_CHAR + "====");
      else
        OutputText(hdl, C_ZEROWIDTH_CHAR + "----");
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
      // output content
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
      OutputText(hdl, content);
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
      OutputText(hdl, C_ZEROWIDTH_CHAR + "");
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
    }  
    // output text end
    hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
    OutputText(hdl, C_ZEROWIDTH_CHAR + "####");
    hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
    // output reserved json
    try
    {
      String reserved = "\"items\":"+items.serialize();
      if (!reserved.isEmpty())
      {
        hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
        OutputText(hdl, ConversionUtil.ZIPStringToHexString(reserved));
        hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING,"failed to wrtie reserved json for comments " + e.getMessage() , e);
    }
    hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_OFFICE_ANNONATION);
  }
  private void OutputText(TransformerHandler hdl, String string) throws SAXException
  {
    char[] text = string.toCharArray();
    hdl.characters(text, 0, text.length);
  }

  private String getDateString(JSONObject comments)
  {
    JSONArray items = (JSONArray) comments.get("items");
    long t = 0;
    for (int i = 0; i < items.size(); i++)
    {
      JSONObject item = (JSONObject) items.get(i);
      // if uid contains "-", it is added by Docs
      Long nt = (Long) item.get("time");
      if (nt != null && nt > t)
        t = nt;
    }  
    if (t > 0)
    {
      SimpleDateFormat tf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
      tf.setTimeZone(TimeZone.getTimeZone("GMT"));
      return tf.format(new Date(t));
    }
    return "";
  }

  private boolean isCommentsModified(JSONObject comments)
  {
    boolean ismodified = false;
    JSONArray items = (JSONArray) comments.get("items");
    for (int i = 0; i < items.size(); i++)
    {
      JSONObject item = (JSONObject) items.get(i);
      // if uid contains "-", it is added by Docs
      if (item.get("uid") != null)
      {
        String uid = item.get("uid").toString();
        if (uid.indexOf('-')>0 || !uid.startsWith("comments"))
        {
          ismodified = true;
          break;
        }
      }
      boolean org_resolved = item.containsKey("org_resolved")?(Boolean) item.get("org_resolved") : false;
      boolean resolved = item.containsKey("resolved")? (Boolean) item.get("resolved") : false;
      if (org_resolved != resolved)
      {
        ismodified = true;
        break;
      }
    }  
    return ismodified;
  }
}
