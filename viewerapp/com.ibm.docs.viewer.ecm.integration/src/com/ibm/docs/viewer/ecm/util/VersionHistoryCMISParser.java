package com.ibm.docs.viewer.ecm.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.xtq.xpath.jaxp.XPathFactoryImpl;

public class VersionHistoryCMISParser
{

  private class XMLNameSpaceResolver implements NamespaceContext
  {

    /**
     * This method returns the uri for all prefixes needed. Wherever possible it uses XMLConstants.
     * 
     * @param prefix
     * @return uri
     */
    public String getNamespaceURI(String prefix)
    {
      if (prefix == null)
      {
        throw new IllegalArgumentException("No prefix provided!");
      }
      else if (prefix.equals("td"))
      {
        return "urn:ibm.com/td";
      }
      else if (prefix.equals("cmisa"))
      {
        return "http://docs.oasis-open.org/ns/cmis/restatom/200908/";
      }
      else if (prefix.equals("cmis"))
      {
        return "http://docs.oasis-open.org/ns/cmis/core/200908/";
      }
      else if (prefix.equals("atom"))
      {
        return "http://www.w3.org/2005/Atom";
      }
      else
      {
        return XMLConstants.NULL_NS_URI;
      }
    }

    public String getPrefix(String namespaceURI)
    {
      // Not needed in this context.
      return null;
    }

    public Iterator getPrefixes(String namespaceURI)
    {
      // Not needed in this context.
      return null;
    }
  }

  private XPath parser;

  public XPath getXParser()
  {
    if (parser == null)
    {
      parser = XPathFactory.newInstance().newXPath();
      parser.setNamespaceContext(new XMLNameSpaceResolver());
    }
    return parser;
  }

  public String getDraftId(InputStream is) throws XPathExpressionException, ParserConfigurationException, SAXException, IOException
  {
    try
    {
      DocumentBuilder docBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
      final Document feed = docBuilder.parse(is);

      // files entry
      NodeList nodes = null;
      nodes = (NodeList) getXParser().evaluate("/feed/entry", feed, XPathConstants.NODESET);
      if (nodes != null && nodes.getLength() > 0)
      {
        return parseDocumentInfos(nodes.item(0));
      }
    }
    finally
    {
      is.close();
    }

    return null;
  }

  private String parseDocumentInfos(Node item) throws XPathExpressionException
  {
    // draft id
    String id = (String) getXParser().evaluate("object/properties/propertyId[@propertyDefinitionId='cmis:objectId']/value", item,
        XPathConstants.STRING);

    return id;
  }

}
