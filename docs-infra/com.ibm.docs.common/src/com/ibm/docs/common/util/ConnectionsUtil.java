package com.ibm.docs.common.util;

public class ConnectionsUtil
{
  public static String getUserAgent(String feature)
  {
    String version = System.getProperty("DOCS_VERSION");
    return "IBM-LC-" + feature + "-IBM Docs_" + version + "-" + System.getProperty("os.name");
  }
}
