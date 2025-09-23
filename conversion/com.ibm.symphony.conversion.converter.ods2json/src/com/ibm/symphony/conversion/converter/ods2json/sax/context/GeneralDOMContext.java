/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfFileDom;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

/**
 * Still use OdfToolkit style convenience API, so the styleContext is only used to append the style dom tree
 * 
 * 
 */
public class GeneralDOMContext extends GeneralContext
{
  private StringBuffer mCharsForTextNode = new StringBuffer();

  Element mElement;

  public GeneralDOMContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }

  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
    return new GeneralDOMContext(mImport, uri, localName, qName, mTarget);
  }

  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    OdfFileDom doc = mImport.getDocument();
    if (!ConversionUtil.hasValue(mUri) || !ConversionUtil.hasValue(mQName))
      mElement = doc.createElement(mLocalName);
    else
      mElement = doc.createElementNS(mUri, mQName);
    String attrPrefix = null;
    String attrURL = null;
    OdfAttribute attr = null;
    for (int i = 0; i < attributes.getLength(); i++)
    {
      attrURL = attributes.getURI(i);
      attrPrefix = attributes.getQName(i);
      if (!ConversionUtil.hasValue(attrURL) || !ConversionUtil.hasValue(attrPrefix))
      {
        attr = doc.createAttribute(attributes.getLocalName(i));
      }
      else
      {
        attr = doc.createAttributeNS(attrURL, attrPrefix);
      }
      mElement.setAttributeNodeNS(attr);
      // don't exit because of invalid attribute values
      try
      {
        // set Value in the attribute to allow validation in the attribute
        attr.setValue(attributes.getValue(i));
      } // if we detect an attribute with invalid value: remove attribute node
      catch (IllegalArgumentException e)
      {
        mElement.removeAttributeNode(attr);
      }
    }
    // add the new element as a child of the current context node
    Node parent = mImport.getCurrentNode();
    if(parent != null)
      parent.appendChild(mElement);
    mImport.setCurrentNode(mElement);
  }

  public void endElement()
  {
    super.endElement();
//    this.flushTextNode();
    Node parent = (Node) mElement.getParentNode();
    mImport.setCurrentNode(parent);
  }

  public void characters(char[] ch, int start, int length)
  {
    super.characters(ch, start, length);
    mCharsForTextNode.append(ch, start, length);
    this.flushTextNode();
  }

  public void flushTextNode()
  {
    if (mCharsForTextNode.length() > 0)
    {
      Text text = mImport.getDocument().createTextNode(mCharsForTextNode.toString());
      mElement.appendChild(text);
      mCharsForTextNode.setLength(0);
    }
  }
}
