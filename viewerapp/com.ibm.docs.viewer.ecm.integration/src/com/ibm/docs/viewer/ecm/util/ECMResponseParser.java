package com.ibm.docs.viewer.ecm.util;

import java.io.InputStream;

import org.xml.sax.helpers.DefaultHandler;

import com.ibm.json.java.JSONObject;

public abstract class ECMResponseParser extends DefaultHandler
{
  abstract void init(InputStream is);
  
  public abstract JSONObject getJson();
  
  public void setInputStream(InputStream is)
  {
    init(is);
  }
}
