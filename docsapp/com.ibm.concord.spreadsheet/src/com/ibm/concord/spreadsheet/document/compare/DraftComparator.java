package com.ibm.concord.spreadsheet.document.compare;

import java.io.File;


import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Result;
import javax.xml.transform.Transformer;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;


import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONObject;

public class DraftComparator
{
  private static final Logger LOG = Logger.getLogger(DraftComparator.class.getName());
  
  private static final String HTML_OUT_DIR = System.getProperty("java.io.tmpdir");
  
  private static final String HTML_OUT_FILE_NAME = "spreadsheet_compare.html";
  
  
  JSONObject leftMeta, rightMeta;
  JSONObject leftContent, rightContent;
  JSONObject leftRef, rightRef;
  JSONObject leftPreserve, rightPreserve;
  
  
  
  //if output the html
  static boolean bHTMLOut = true;
  //show all the html or only the different result, if bHTMLOut == true
  static boolean bShowAllHTML = false;
  /**
   * compare the draft in the same dir, but with different prefix
   * @param filePath
   * @param leftPrefix
   * @param rightPrefix
   * @throws IOException 
   * @throws FileNotFoundException 
   */
  public DraftComparator(String filePath, String leftPrefix, String rightPrefix) throws FileNotFoundException, IOException
  {
    this.getJSONObject(filePath, true, leftPrefix);
    this.getJSONObject(filePath, false, rightPrefix);
  }
  /**
   * compare the draft in different file path
   * @param leftFilePath
   * @param rightFilePath
   * @throws IOException 
   * @throws FileNotFoundException 
   */
  public DraftComparator(String leftFilePath, String rightFilePath) throws FileNotFoundException, IOException
  {
    this.getJSONObject(leftFilePath, true);
    this.getJSONObject(rightFilePath, false);
  }
  /**
   * compare the draft in different json object
   * @param left
   * @param right
   */
  public DraftComparator(JSONObject left, JSONObject right)
  {
    this.getJSONObject(left, true);
    this.getJSONObject(right, false);
  }
  
  public String compare()
  {
    ByteArrayOutputStream outStream = null;
    FileOutputStream fos = null;
    try
    {
      TransformerHandler xmlWriter = null;
      if(bHTMLOut)
      {
        //prepare xml writer
        SAXTransformerFactory saxWriterFac = (SAXTransformerFactory) SAXTransformerFactory.newInstance();
        xmlWriter = saxWriterFac.newTransformerHandler();
        Transformer transformer = xmlWriter.getTransformer();
        
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
  //      transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
        transformer.setOutputProperty(OutputKeys.METHOD, "html");
        transformer.setOutputProperty(OutputKeys.VERSION, "4.0");
        outStream = new ByteArrayOutputStream();
        Result resultxml = new StreamResult(outStream);
        xmlWriter.setResult(resultxml);
        xmlWriter.startDocument();
        xmlWriter.startElement("","html","html",null);
        //set style
        xmlWriter.startElement("","head","head",null);
        xmlWriter.startElement("","style","style",null);
        String style = ".miss {background-color: red}\n" +
        		      ".notequal {background-color: yellow}\n" +
        		      ".highlight {background-color: blue}\n" +
        		      ".index {color:green}\n" +
        		      "table { width: 100%; table-layout: fixed; border-collapse: collapse;}\n" +
        		      "table td { border: 1px solid #d2d2d2; text-wrap: normal; word-wrap: break-word; vertical-align: top;}";
        xmlWriter.characters(style.toCharArray(), 0, style.length());
        xmlWriter.endElement("","style","style");
        xmlWriter.endElement("","head","head");
        xmlWriter.startElement("","body","body",null);
      }
      
      MetaJudger metaJudger = new MetaJudger();
      MetaComparator metaComp = new MetaComparator(metaJudger, "meta");
      metaComp.setmXMLWriter(xmlWriter);
      metaComp.prepare(leftMeta, rightMeta);
      ContentComparator contentComp = new ContentComparator(metaJudger, "content");
      contentComp.prepare(leftContent, rightContent);
      
      metaComp.diffPathList.clear();
      metaComp.diffRightPathList.clear();
      metaComp.compare(leftMeta, rightMeta, xmlWriter);
      contentComp.diffPathList.clear();
      contentComp.diffRightPathList.clear();
      contentComp.compare(leftContent, rightContent, xmlWriter);
  
      if(leftRef != null && rightRef != null)
      {
        ReferenceComparator refComp = new ReferenceComparator(metaJudger, "ref");
        refComp.compare(leftRef, rightRef, xmlWriter);
      }
      if(leftPreserve != null && rightPreserve != null)
      {
        MapComparator preComp = new MapComparator(metaJudger, "preserve");
        preComp.compare(leftPreserve, rightPreserve, xmlWriter);
      }

      if(bHTMLOut)
      {
        xmlWriter.endElement("","body","body");
        xmlWriter.endElement("","html","html");
        xmlWriter.endDocument();
        String outHTML = outStream.toString();
        if (false && LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "html: {0}", outHTML);
        }
        fos = new FileOutputStream(new File(HTML_OUT_DIR, HTML_OUT_FILE_NAME));
        byte[] bytes = outStream.toByteArray();
        int length = bytes.length;
        int SIZE = 8192;
        for(int i=0; i<length;)
        {
          int j = i + SIZE;
          if(j < length)
          {
            fos.write(bytes, i, SIZE);
            i+=SIZE;
          }
          else
          {
            fos.write(bytes, i, (length - i));
            break;
          }
          
        }
        fos.flush();
        return outHTML;
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
      if (outStream != null)
        try
        {
          outStream.close();
        }
        catch (IOException e1)
        {
          LOG.log(Level.SEVERE, "can't write comparation html result");
        }
      if (fos != null)
        try
        {
          fos.close();
        }
        catch (IOException e1)
        {
          LOG.log(Level.SEVERE, "can't write comparation html result");
        }
    }
    return null;
  }
  
  private void getJSONObject(String filePath, boolean isLeft) throws IOException, FileNotFoundException
  {
    getJSONObject(filePath, isLeft, "");
  }
  
  private void getJSONObject(String filePath, boolean isLeft, String prefix) throws IOException, FileNotFoundException
  {
    InputStream contentIn = null;
    InputStream metaIn = null;
    InputStream refIn = null;
    InputStream preIn = null;
    try
    {
      metaIn = new FileInputStream(new File(filePath + File.separator + prefix + "meta.js"));
      JSONObject metaObject = JSONObject.parse(metaIn);
      contentIn = new FileInputStream(new File(filePath + File.separator + prefix +  "content.js"));
      JSONObject contentObject = JSONObject.parse(contentIn);
      File refFile = new File(filePath + File.separator + prefix + "reference.js");
      JSONObject refObject = null;
      if(refFile.exists() && refFile.length() > 0){
        refIn = new FileInputStream(refFile);
        refObject = JSONObject.parse(refIn);
      }
      JSONObject preObject = null;
      File preFile = new File(filePath + File.separator + prefix + "preserve.js");
      if(preFile.exists() && preFile.length() > 0){
        preIn = new FileInputStream(preFile);
        preObject = JSONObject.parse(preIn);
      }
      if(isLeft)
      {
        leftMeta = metaObject;
        leftContent = contentObject;
        leftRef = refObject;
        leftPreserve = preObject;
      }else
      {
        rightMeta = metaObject;
        rightContent = contentObject;
        rightRef = refObject;
        rightPreserve = preObject;
      }
    }
    catch (FileNotFoundException e)
    {
      // TODO Auto-generated catch block
      LOG.log(Level.WARNING, null, e);
      throw e;
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      LOG.log(Level.WARNING, null, e);
      throw e;
    }finally
    {
      if(contentIn != null)
      {
        try
        {
          contentIn.close();
          contentIn = null;
        }
        catch (IOException e)
        {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
        
      }
      
      if(metaIn != null)
      {
        try
        {
          metaIn.close();
          metaIn = null;
        }
        catch (IOException e)
        {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
        
      }
      
      if(preIn != null)
      {
        try
        {
          preIn.close();
          preIn = null;
        }
        catch (IOException e)
        {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
        
      }
      
      if(refIn != null)
      {
        try
        {
          refIn.close();
          refIn = null;
        }
        catch (IOException e)
        {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
        
      }
    }
  
  }
  
  private void getJSONObject(JSONObject obj, boolean isLeft)
  {
    JSONObject metaObject = (JSONObject) obj.get(ConversionConstant.META);
    JSONObject contentObject = (JSONObject) obj.get(ConversionConstant.CONTENT);
    JSONObject refObject = (JSONObject) obj.get(ConversionConstant.REFERENCE);
    JSONObject preObject = (JSONObject) obj.get("preserve");
    if (isLeft)
    {
      leftMeta = metaObject;
      leftContent = contentObject;
      leftRef = refObject;
      leftPreserve = preObject;
    }
    else
    {
      rightMeta = metaObject;
      rightContent = contentObject;
      rightRef = refObject;
      rightPreserve = preObject;
    }
  }
}
