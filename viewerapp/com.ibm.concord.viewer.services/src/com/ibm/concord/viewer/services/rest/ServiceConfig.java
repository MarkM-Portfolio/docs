/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class ServiceConfig extends DefaultHandler
{
  private static final Logger logger = Logger.getLogger(ServiceConfig.class.getName());

  private boolean load = false;

  private static ServiceConfig instance;

  private Properties handlers = new Properties();

  private SAXParserFactory parserFactory = SAXParserFactory.newInstance();

  public static ServiceConfig getInstance()
  {
    if (instance == null)
    {
      instance = new ServiceConfig();
    }
    return instance;
  }

  private ServiceConfig()
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
      is = getClass().getResourceAsStream("/com/ibm/concord/viewer/services/rest/service-config.xml");
      parser.parse(is, this);
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Unable to read the atom handler registry.", e);
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
    if ("handler".equals(qName) && load)
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

      if ("concord".equals(product))
        load = true;
      else
        load = false;
    }
  }
}
