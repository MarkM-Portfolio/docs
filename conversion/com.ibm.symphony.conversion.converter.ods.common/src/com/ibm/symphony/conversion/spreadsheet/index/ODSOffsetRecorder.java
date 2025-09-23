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

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.xml.sax.Attributes;
import org.xml.sax.ContentHandler;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.index.Pair.NameIDPair;
import com.ibm.symphony.conversion.spreadsheet.index.Pair.OffSetPair;

public class ODSOffsetRecorder implements ContentHandler
{

  private Locator locator;

  private XMLLocator xmlLocator;
  
  private boolean isInSheet;

  private boolean isInCell;

  private boolean startRecord;

  private Stack<Pair.NameIDPair> idStack = new Stack<Pair.NameIDPair>();

  private Map<String, Pair.OffSetPair> index;

  private Stack<Integer> offsetStack = new Stack<Integer>();

  private int prevColNum;
  
  public String locateById(String id)
  {
    Pair.OffSetPair offsetPair = index.get(id);
    if (offsetPair == null)
      return null;
    String xml = xmlLocator.locateByOffset(offsetPair.offset, offsetPair.length);
    return xml;

  }

  public ODSOffsetRecorder(String baseURI, OdfDocument doc)
  {
    index = new HashMap<String, Pair.OffSetPair>();
    InputStream input = null;
    try
    {
      input = doc.getContentStream();
      xmlLocator = new XMLLocator(baseURI, input);
    }
    catch (Exception e)
    {
    }
    finally
    {
      try
      {
        if(input != null)
          input.close();
      }
      catch (IOException e)
      {
      }
    }
  }
  
  public void characters(char[] ch, int start, int length) throws SAXException
  {
    
  }

  public void endDocument() throws SAXException
  {
    
  }

  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    int startNum = offsetStack.peek();
    offsetStack.pop();
    int endNum = locator.getColumnNumber();

    int len = endNum - startNum;
    if (!idStack.isEmpty())
    {
      NameIDPair idMap = idStack.peek();
      if (qName.equals(idMap.name))
      {
        if (ConversionUtil.hasValue(idMap.id))
        {
          OffSetPair map = new OffSetPair(startNum,len);
          index.put(idMap.id, map);
        }
        idStack.pop();
      }
    }
    if (isInSheet && qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL)
        || qName.equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
    {
      isInCell = false;
    }
    if (qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE))
      isInSheet = false;
    if (qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL)|| qName.equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
      startRecord = false;
    prevColNum = endNum;  
  }

  public void endPrefixMapping(String prefix) throws SAXException
  {
    
  }

  public void ignorableWhitespace(char[] ch, int start, int length) throws SAXException
  {
    
  }

  public void processingInstruction(String target, String data) throws SAXException
  {
    
  }

  public void setDocumentLocator(Locator locator)
  {
    this.locator = locator;
  }

  public void skippedEntity(String name) throws SAXException
  {
    
  }

  public void startDocument() throws SAXException
  {
    
  }

  public void startElement(String uri, String localName, String qName, Attributes atts) throws SAXException
  {

    // TODO
    // Since we assume all odf documents aligned in one line.
    int lineNum = locator.getLineNumber();
    int colNum = locator.getColumnNumber();

    prevColNum = offsetStack.isEmpty() ? 0 : prevColNum;
    offsetStack.push(prevColNum);
    prevColNum = colNum;

    if (qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE))
      isInSheet = true;
    // if there is a specilized handler on the stack, dispatch the event

    if (isInSheet
        && (qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL) || qName
            .equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL)))
    {
      isInCell = true;
    }
    
    if (isInCell)
    {
      startRecord = true;

      if (startRecord)
      {
          String id = atts.getValue(ConversionConstant.ID_STRING);
          Pair.NameIDPair nameIdPair = new Pair.NameIDPair(qName,id);
          idStack.push(nameIdPair);
      }
      return;
    }
  }

  public void startPrefixMapping(String prefix, String uri) throws SAXException
  {
    
  }
  public void close()
  {
    xmlLocator.close();
  }
}
