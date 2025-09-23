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

import com.ibm.concord.viewer.spi.beans.IReviewable;
import com.ibm.json.java.JSONObject;

public class TeamspaceParser extends ECMResponseParser
{
  private static final Logger logger = Logger.getLogger(TeamspaceParser.class.getName());

  private Properties properties = new Properties();

  private SAXParserFactory parserFactory = SAXParserFactory.newInstance();

  public static final String COMMUNITY_ID = "communityId";

  public static final String COMPONENT_ID = "componentId";

  public static final String COMMUNITY_TYPE = "communityType";

  public static final String ROOT_CATEGORY = "rootCategory";

  public static final String ROOT_FEED = "rootFeed";

  public static final String COMPONENT_GENERATOR = "generator";  
  
  public static final String DEFAULT_ROLE = "defaultRole"; 

  private String loadProp;

  private StringBuilder sb = new StringBuilder();

  public TeamspaceParser()
  {

  }

  public TeamspaceParser(InputStream is)
  {
    this.init(is);
  }

  void init(InputStream is)
  {
    SAXParser parser = null;
    try
    {
      parser = parserFactory.newSAXParser();
      parser.parse(is, this);
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Unable to read the TeamspaceEntry.", e);
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
        logger.log(Level.SEVERE, "Unable to close InputStream for the TeamspaceEntry.", e);
      }
    }
  }

  public Properties getProperties()
  {
    return properties;
  }

  private void initStringBuilder()
  {
    sb.setLength(0);
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
      initStringBuilder();
    }
    if( "td:defaultRole".equals(qName) )
    {
      initStringBuilder();
    }
  }

  public void characters(char ch[], int start, int length) throws SAXException
  {
    if (loadProp != null)
    {
      sb.append(ch, start, length);
    }
  }

  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    if( "td:defaultRole".equals(qName) )
    {
      properties.put(DEFAULT_ROLE, sb.toString());
    }
    
    if (loadProp != null)
    {
      if (loadProp.equalsIgnoreCase(COMPONENT_ID))
      {
        properties.put(COMPONENT_ID, sb.toString());
        loadProp = null;
        return;
      }
      if (loadProp.equalsIgnoreCase(COMMUNITY_TYPE))
      {
        properties.put(COMMUNITY_TYPE, sb.toString());
        loadProp = null;
        return;
      }
      if (loadProp.equalsIgnoreCase(ROOT_CATEGORY))
      {
        properties.put(ROOT_CATEGORY, sb.toString());
        loadProp = null;
        return;
      }
      if (loadProp.equalsIgnoreCase(ROOT_FEED))
      {
        properties.put(ROOT_FEED, sb.toString());
        loadProp = null;
        return;
      }
      if (loadProp.equalsIgnoreCase(COMPONENT_GENERATOR))
      {
        properties.put(COMPONENT_GENERATOR, sb.toString());
        loadProp = null;
        return;
      }
      if (loadProp.equalsIgnoreCase(COMMUNITY_ID))
      {
        properties.put(COMMUNITY_ID, sb.toString());
        loadProp = null;
        return;
      }
    }
  }

  @Override
  public JSONObject getJson()
  {
    JSONObject ret = new JSONObject();
    ret.put(IReviewable.COMMUNITY_ID, properties.getProperty(COMMUNITY_ID));
    ret.put(IReviewable.COMMUNITY_TYPE, properties.getProperty(COMMUNITY_TYPE));
    ret.put(IReviewable.COMPONENT_ID, properties.getProperty(COMPONENT_ID));
    ret.put(IReviewable.COMPONENT_GENERATOR, properties.getProperty(COMPONENT_GENERATOR));

    return ret;
  }
}
