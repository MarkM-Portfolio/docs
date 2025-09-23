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

import java.util.Stack;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.attribute.office.OfficeVersionAttribute;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;
import org.xml.sax.Attributes;
import org.xml.sax.ContentHandler;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class ODSXMLReader implements ContentHandler
{
  private static final String CLAZZ = ODSXMLReader.class.getName();

  private static final Logger LOG = Logger.getLogger(CLAZZ);

  private OdfFileDom mDocument;

  // the context node
  private Node mNode;

  // the context parent node
  private Node pNode;

  private boolean isInParagraph = false; 
  
  private boolean isInSheet;

  private boolean isInCell;


  // a stack of sub handlers. handlers will be pushed on the stack whenever
  // they are required and must pop themselves from the stack when done
  private Stack<ContentHandler> mHandlerStack = new Stack<ContentHandler>();
  
  private StringBuilder mCharsForTextNode = new StringBuilder();

  ODSXMLReader(Node rootNode)
  {
    if (rootNode instanceof OdfFileDom)
    {
      mDocument = (OdfFileDom) rootNode;
    }
    else
    {
      mDocument = (OdfFileDom) rootNode.getOwnerDocument();
    }
    mNode = rootNode;
  }

  public OdfFileDom getDocument()
  {
    return mDocument;
  }

  public void startDocument() throws SAXException
  {
  }

  public void endDocument() throws SAXException
  {
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {

    AttributesImpl attrs = new AttributesImpl(attributes);
    if (qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE))
      isInSheet = true;
    // if there is a specilized handler on the stack, dispatch the event

    Element element = null;

    if (isInSheet)
    {
      if(qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL) || qName
          .equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
      {
        isInCell = true;
      }else
      {
        if(qName.equals(ConversionConstant.ODF_ELEMENT_TABLE_SOURCE))
        {
          //IBM Docs does not support import data from table source
          //so preserve it when export, all the cells in the source table should be constructed for preserve
          isInSheet = false;
          isInCell = false;
        }
      }
    }
    if(!isInCell)
      flushTextNode();
    
    if (isInCell)
      return;

    if (!isInCell)
    {
      if ("".equals(uri) || "".equals(qName))
      {
        element = mDocument.createElement(localName);
      }
      else
      {
        element = mDocument.createElementNS(uri, qName);
      }
      // add the new element as a child of the current context node

      String attrPrefix = null;
      String attrURL = null;
      OdfAttribute attr = null;
      int len = attributes.getLength();
      for (int i = 0; i < len; i++)
      {
        attrURL = attributes.getURI(i);
        attrPrefix = attributes.getQName(i);
        if (!ConversionUtil.hasValue(attrURL) || !ConversionUtil.hasValue(attrPrefix))
        {
          attr = mDocument.createAttribute(attributes.getLocalName(i));
        }
        else
        {
          attr = mDocument.createAttributeNS(attrURL, attrPrefix);
        }
        element.setAttributeNodeNS(attr);
        // element.setAttributeNode(attr);
        // element.setAttributeNS(namespaceURI, qualifiedName, value)
        if (attr instanceof OfficeVersionAttribute)
        {
          // write out not the original value, but the version of this odf version
          attr.setValue(OfficeVersionAttribute.Value._1_2.toString());
        }
        else
        {
          // don't exit because of invalid attribute values
          try
          {
            // set Value in the attribute to allow validation in the attribute
            attr.setValue(attributes.getValue(i));
          } // if we detect an attribute with invalid value: remove attribute node
          catch (IllegalArgumentException e)
          {
            element.removeAttributeNode(attr);
          }
        }
      }
    }

    if (mNode != null && element != null)
    {
      mNode.appendChild(element);
      // push the new element as the context node...
      mNode = element;
      pNode = mNode;
    }
  }

  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    if(!isInCell)
      flushTextNode();
    if( "text:p".equals(qName) || "text:h".equals(qName))
      isInParagraph = false;
    if (!isInCell)
    {
      if (mNode != null)
        pNode = mNode.getParentNode();
      mNode = pNode;
    }
    if (isInSheet && qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL)
        || qName.equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
    {
      isInCell = false;
    }
    if (qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE))
      isInSheet = false;
  }

  /**
   * http://xerces.apache.org/xerces2-j/faq-sax.html#faq-2 : SAX may deliver contiguous text as multiple calls to characters, for reasons
   * having to do with parser efficiency and input buffering. It is the programmer's responsibility to deal with that appropriately, e.g. by
   * accumulating text until the next non-characters event.
   */
  public void characters(char[] ch, int start, int length) throws SAXException
  {
    if(!isInCell)
    {
      if (!mHandlerStack.empty()) {
        mHandlerStack.peek().characters(ch, start, length);
      } else {
          mCharsForTextNode.append(ch, start, length);
      }
    }
  }
  
  /**
   * http://xerces.apache.org/xerces2-j/faq-sax.html#faq-2 :
   * SAX may deliver contiguous text as multiple calls to characters,
   * for reasons having to do with parser efficiency and input buffering.
   * It is the programmer's responsibility to deal with that appropriately,
   * e.g. by accumulating text until the next non-characters event.
   */
  private void flushTextNode() {
      if (mCharsForTextNode.length() > 0) {
          if( isInParagraph )
          {
            Text text = mDocument.createTextNode(mCharsForTextNode.toString());
            mNode.appendChild(text);
          }
          else
          {
            // ignore white space characters in the non-paragraph elements
            String str = mCharsForTextNode.toString();
            if(! str.matches("\\s+") )
            {
              Text text = mDocument.createTextNode(str);
              mNode.appendChild(text);
            }
          }
          mCharsForTextNode.setLength(0);
      }
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

  public void skippedEntity(String name) throws SAXException
  {
  }

  public void startPrefixMapping(String prefix, String uri) throws SAXException
  {

  }

  public void setDocumentLocator(Locator locator)
  {
    
  }
}
