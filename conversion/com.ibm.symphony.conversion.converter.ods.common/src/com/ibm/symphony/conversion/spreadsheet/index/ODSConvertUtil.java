/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import java.io.ByteArrayOutputStream;
import java.io.FilterInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Random;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfChartDocument;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;
import com.ibm.symphony.conversion.spreadsheet.io.XMLFilterInputStream;

public class ODSConvertUtil
{
  public final static String DEFAULT_CELL_STYLE_NAME = "Default";// "DefaultCell";
  
  public final static Random r = new Random();
  static JSONObject namespaceMap = null;

  static
  {
    namespaceMap = new JSONObject();
    namespaceMap.putAll(ConvertUtil.getNamespaceMap());
  }

  public static String getNameSpace(String qName)
  {
    String[] nodeNameSegments = qName.split(":");
    String nameSpace = (String) namespaceMap.get(nodeNameSegments[0]);
    return nameSpace;
  }

  public static void removeAttribute(AttributesImpl attrs, String qName)
  {
    int aLen = attrs.getLength();
    for (int i = 0; i < aLen; i++)
    {
      String attrQName = attrs.getQName(i);
      if (attrQName.equalsIgnoreCase(qName))
      {
        attrs.removeAttribute(i);
        break;
      }
    }
  }

  public static void removeAttribute(AttributesImpl attrs, String[] qName)
  {
    int aLen = attrs.getLength();
//    for (int i = 0; i < aLen; i++)
//    {
//      String attrQName = attrs.getQName(i);
      int len = qName.length;
      for (int j = 0; j < len; j++)
      {
        removeAttribute(attrs,qName[j]);
      }
//    }
  }

  public static XMLReader createXMLReader() throws Exception
  {
    // create sax parser
    SAXParserFactory saxFactory = SAXParserFactory.newInstance();
    saxFactory.setNamespaceAware(true);
    saxFactory.setValidating(false);
    SAXParser parser = saxFactory.newSAXParser();
    XMLReader xmlReader = parser.getXMLReader();
    // More details at http://xerces.apache.org/xerces2-j/features.html#namespaces
    xmlReader.setFeature("http://xml.org/sax/features/namespaces", true);
    // More details at http://xerces.apache.org/xerces2-j/features.html#namespace-prefixes
    xmlReader.setFeature("http://xml.org/sax/features/namespace-prefixes", true);
    // More details at http://xerces.apache.org/xerces2-j/features.html#xmlns-uris
    xmlReader.setFeature("http://xml.org/sax/features/xmlns-uris", true);
      return xmlReader;
  }
  
  public static XMLReader createXMLReader2() throws Exception
  {
    // create sax parser
    SAXParserFactory saxFactory = SAXParserFactory.newInstance();
//    saxFactory.setNamespaceAware(true);
    saxFactory.setValidating(false);
    SAXParser parser = saxFactory.newSAXParser();
    XMLReader xmlReader = parser.getXMLReader();
    // More details at http://xerces.apache.org/xerces2-j/features.html#namespaces
//    xmlReader.setFeature("http://xml.org/sax/features/namespaces", true);
    // More details at http://xerces.apache.org/xerces2-j/features.html#namespace-prefixes
//    xmlReader.setFeature("http://xml.org/sax/features/namespace-prefixes", true);
    // More details at http://xerces.apache.org/xerces2-j/features.html#xmlns-uris
    xmlReader.setFeature("http://xml.org/sax/features/xmlns-uris", true);
    return xmlReader;
  }

  public static Node parseXML(OdfDocument doc, String filePath, ConversionContext context) throws Exception
  {
    InputStream fileStream = null;
    try
    {
      XMLReader xmlReader = createXMLReader();
      String targetFolder = (String) context.get("TargetFolder");
      // initialize the input source's xml, such as content.xml
      fileStream = doc.getPackage().getInputStream(filePath);
      if (fileStream != null)
      {
        
        OdfFileDom fileDom = new OdfFileDom(doc, filePath);
        FilterInputStream filter = new XMLFilterInputStream(fileStream);
        ODSOffsetRecorder recorder = new ODSOffsetRecorder(targetFolder,doc);
        context.put("Recorder", recorder);
        xmlReader.setContentHandler(recorder);
        InputSource contentSource = new InputSource(filter);
        contentSource.setEncoding("ASCII");
        
        xmlReader.parse(contentSource);
        
        InputStream correctFileStream = doc.getPackage().getInputStream(filePath);
        ODSXMLReader handler = getReaderInstance(doc,fileDom);
        xmlReader.setContentHandler(handler);
        InputSource source = new InputSource(correctFileStream);
        xmlReader.parse(source);
        return handler.getDocument();
      }
    }
    finally
    {
      if(fileStream != null)
        fileStream.close();
    }
    return null;
  }


  private static ODSXMLReader getReaderInstance(OdfDocument doc, OdfFileDom fileDom)
  {
    ODSXMLReader importer = null;
    if (doc instanceof OdfSpreadsheetDocument)
    {
      importer = new ODSXMLReader(fileDom);
    }
    else if (doc instanceof OdfChartDocument)
    {
    }
    else
      importer = new ODSXMLReader(fileDom);
    return importer;
  }
  
  public static OdfStyle getOldStyle(ConversionContext context, String styleName, OdfStyleFamily odfStyleFamily)
  {
    if(styleName == null)
      return null;
    try
    {
      OdfFileDom contentDom = (OdfFileDom) context.get("Target");
      OdfDocument odfDoc = (OdfDocument) context.get("Document");
      OdfOfficeStyles odfStyles = odfDoc.getStylesDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
      OdfStyle oldStyle = null;
      if (odfStyles != null)
      {
        oldStyle = odfStyles.getStyle(styleName, odfStyleFamily);
      }
      if (oldStyle == null && autoStyles != null)
      {
        oldStyle = autoStyles.getStyle(styleName, odfStyleFamily);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }
  
  public static String escapeXML(String text)
  {
    if(text != null)
    {
      text = text.replaceAll("[\\x01-\\x08\\x0b-\\x0c\\x0e-\\x1f]", "");
    }
    return text;
  }
  

  public static String getODFFormula(String text, boolean startWithOf)
  {
    ArrayList<FormulaToken> tokenList = ConversionUtil.getTokenFromFormula(text, null);
    boolean bNeedUpdate = false;
    for (int i = 0; i < tokenList.size(); i++)
    {
      ConversionUtil.FormulaToken token = tokenList.get(i); 
      ReferenceParser.ParsedRef ref = token.getRef();
      if (ref != null)
      {
        String t = token.getText();
        if (t.contains(ConversionConstant.INVALID_REF))
        {
          token.setChangeText("[" + t + "]");
          bNeedUpdate = true;
        }else if(ref.type == ReferenceParser.ParsedRefType.ROW)
        {
          ref.startCol = "A";
          ref.endCol = "AMJ";
          ref.type = ReferenceParser.ParsedRefType.RANGE;
          ref.patternMask |= ReferenceParser.ABSOLUTE_COLUMN;
          ref.patternMask |= ReferenceParser.START_COLUMN;
          ref.patternMask |= ReferenceParser.ABSOLUTE_END_COLUMN;
          ref.patternMask |= ReferenceParser.END_COLUMN;
          token.setChangeText(ref.toString());
          bNeedUpdate = true;
        }else if(ref.type == ReferenceParser.ParsedRefType.COLUMN)
        {
          ref.startRow = "1";
          ref.endRow = "1048576";
          ref.type = ReferenceParser.ParsedRefType.RANGE;
          ref.patternMask |= ReferenceParser.ABSOLUTE_ROW;
          ref.patternMask |= ReferenceParser.START_ROW;
          ref.patternMask |= ReferenceParser.ABSOLUTE_END_ROW;
          ref.patternMask |= ReferenceParser.END_ROW;
          token.setChangeText(ref.toString());
          bNeedUpdate = true;
        }
      }
    }
    if (bNeedUpdate)
    {
      text = ConversionUtil.updateFormula(text, tokenList);
      StringBuffer formula = new StringBuffer();
      if(startWithOf)
    	  formula.append("of:");
      formula.append(text);
      return formula.toString();
    }
    return text;
  }
  
  public static String getStyleName(OdfStyleFamily odfStyleFamily, String prefix)
  {
    if (prefix == null || "".equals(prefix))
    {
      prefix = String.valueOf(odfStyleFamily.getName().charAt(0)).toUpperCase();
    }
    return prefix + "_" + r.nextInt(Integer.MAX_VALUE);
  }


}
