package com.ibm.docs.api.rest.sample.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Properties;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class HandlerConfig extends DefaultHandler
{
  private static HandlerConfig instance;
  
  private Properties handlers = new Properties();
  
  private SAXParserFactory parserFactory = SAXParserFactory.newInstance();
  
  public static HandlerConfig getInstance()
  {
    if (instance == null)
    {
      instance = new HandlerConfig();
    }
    return instance;
  }
  
  private HandlerConfig()
  {
    parseHandlers();
  }
  
  private void parseHandlers()
  {
    SAXParser parser = null;
    InputStream is = null;
    try
    {
      parser = parserFactory.newSAXParser();
      is = getClass().getResourceAsStream("/com/ibm/docs/api/rest/sample/servlet/service-config.xml");
      parser.parse(is, this);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }
  }

  public Properties getHandlers()
  {
    return handlers;
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if ("handler".equals(qName))
    {
      String clazz = attributes.getValue("class");
      HashMap<String, Object> props = new HashMap<String, Object>(2);
      String url = attributes.getValue("url");
      props.put("url", url);
      Boolean needSecure = Boolean.valueOf(attributes.getValue("secure"));
      props.put("secure", needSecure);
      handlers.put(clazz, props);
    }
    else if ("handlers".equals(qName))
    {
      String product = attributes.getValue("product");
    }
  }  

}
