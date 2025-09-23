package com.ibm.concord.spreadsheet.document.model.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public enum Visibility {
  VISIBLE, HIDE, FILTER;

  private static Map<String, Visibility> visMap;

  private static final Logger LOG = Logger.getLogger(Visibility.class.getName());

  static
  {
    visMap = new HashMap<String, Visibility>();
    visMap.put("hide", HIDE);
    visMap.put("filter", FILTER);
    visMap.put("visible", VISIBLE);
  }

  public static Visibility toVisibility(String s)
  {
    Visibility v = visMap.get(s);
    if (v == null)
    {
      LOG.log(Level.WARNING, "Unknown visibility: {0}, ", s);
    }

    return v;
  }

  public String toString()
  {
    switch (this)
      {
        case VISIBLE :
          return "visible";
        case FILTER :
          return "filter";
        case HIDE :
          return "hide";
        default:
          return null;
      }
  }
}
