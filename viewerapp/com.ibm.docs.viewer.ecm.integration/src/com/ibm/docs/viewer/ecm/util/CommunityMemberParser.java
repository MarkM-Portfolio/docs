package com.ibm.docs.viewer.ecm.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.ibm.json.java.JSONObject;

public class CommunityMemberParser extends ECMResponseParser
{
  private static final Logger logger = Logger.getLogger(CommunityMemberParser.class.getName());

  public static final String ROLE = "role";

  private SAXParserFactory parserFactory = SAXParserFactory.newInstance();

  private boolean loadRole;

  private StringBuilder sb = new StringBuilder();

  private JSONObject role;

  @Override
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
      }
    }
  }

  public JSONObject getJson()
  {
    return role;
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if ("snx:role".equalsIgnoreCase(qName))
    {
      loadRole = true;
      role = new JSONObject();
    }
  }

  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    if ("snx:role".equalsIgnoreCase(qName))
    {
      if (sb.toString().equalsIgnoreCase("owner"))
      {
        role.put(ROLE, Boolean.TRUE);
      }
      else
      {
        role.put(ROLE, Boolean.FALSE);
      }
    }
  }

  public void characters(char ch[], int start, int length) throws SAXException
  {
    if (loadRole)
    {
      sb.append(ch, start, length);
    }
  }

}
