/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.ecm.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class DocumentEntryParser extends DefaultHandler
{
private static final Logger logger = Logger.getLogger(DocumentEntryParser.class.getName());
  
  private Properties properties = new Properties();
 
  private SAXParserFactory parserFactory = SAXParserFactory.newInstance();
  
  public static final String COMMUNITY_ID = "communityId";
  
  public static final String COMPONENT_ID = "componentId";
  
  public static final String COMMUNITY_TYPE = "communityType";
  
  public static final String ROOT_CATEGORY = "rootCategory";
  
  public static final String ROOT_FEED = "rootFeed";
  
  private String loadProp;
  
  public DocumentEntryParser(InputStream is)
  {
    this.init(is);
  }
  
  private void init(InputStream is) 
  {
    SAXParser parser = null;
    try
    {
      parser = parserFactory.newSAXParser();
      parser.parse(is, this);
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Unable to read the DocumentEntry.", e);
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
        logger.log(Level.SEVERE, "Unable to close InputStream for the DocumentEntry.", e);
        e.printStackTrace();
      }
    }  
  }
  
  public Properties getProperties()
  {
    return properties;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if ("snx:remoteApplication".equals(qName))
    {
      String id = attributes.getValue("id");
      properties.put(COMMUNITY_ID, id);
    }
    if ("snx:property".equals(qName))
    {
      loadProp = attributes.getValue("name");
    }
  }
  
  public void characters(char ch[], int start, int length) throws SAXException
  {
    if(loadProp!= null)
    {
      if(loadProp.equalsIgnoreCase(COMPONENT_ID))
      {
        properties.put(COMPONENT_ID, new String(ch, start, length));
        loadProp = null;
        return;
      }
      if(loadProp.equalsIgnoreCase(COMMUNITY_TYPE))
      {
        properties.put(COMMUNITY_TYPE, new String(ch, start, length));
        loadProp = null;
        return;        
      }
      if(loadProp.equalsIgnoreCase(ROOT_CATEGORY))
      {
        properties.put(ROOT_CATEGORY, new String(ch, start, length));
        loadProp = null;
        return;        
      }
      if(loadProp.equalsIgnoreCase(ROOT_FEED))
      {
        properties.put(ROOT_FEED, new String(ch, start, length));
        loadProp = null;
        return;        
      }      
    }
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException 
  {
    
  }
}
