/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.authentication.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

public class ViaEntry
{

  public static final String VIA_FIELD = "Via";

  public static final String HTTP_PROTOCOL = "HTTP";

  private static final Logger LOGGER = Logger.getLogger(ViaEntry.class.toString());

  private static Map<String, List<ViaEntry>> cache = new HashMap<String, List<ViaEntry>>();

  private String protocol;

  private String version;

  private String server;

  private String comments;

  @SuppressWarnings("unchecked")
  public static List<ViaEntry> parseViaEntries(HttpServletRequest request)
  {
    LOGGER.entering(ViaEntry.class.getName(), "parseViaEntries", new Object[] { request });

    ArrayList<ViaEntry> retVal = new ArrayList<ViaEntry>();
    Enumeration<String> viaFileds = request.getHeaders(VIA_FIELD);
    while (viaFileds.hasMoreElements())
    {
      String viaFieldVal = viaFileds.nextElement();
      retVal.addAll(parseViaEntries(viaFieldVal));
    }

    LOGGER.exiting(ViaEntry.class.getName(), "parseViaEntries", retVal);
    return retVal;
  }

  public static List<ViaEntry> parseViaEntries(String viaFieldVal)
  {
    LOGGER.entering(ViaEntry.class.getName(), "parseViaEntries", new Object[] { viaFieldVal });

    List<ViaEntry> retVal = new ArrayList<ViaEntry>();

    if (cache.containsKey(viaFieldVal))
    {
      retVal = cache.get(viaFieldVal);
    }
    else
    {
      StringTokenizer st = new StringTokenizer(viaFieldVal, ",");
      while (st.hasMoreTokens())
      {
        String token = st.nextToken().trim();
        retVal.add(parseViaEntry(token));
      }
      cache.put(viaFieldVal, Collections.unmodifiableList(retVal));
    }

    LOGGER.exiting(ViaEntry.class.getName(), "parseViaEntries", retVal);
    return retVal;
  }

  public static ViaEntry parseViaEntry(String token)
  {
    LOGGER.entering(ViaEntry.class.getName(), "parseViaEntry", new Object[] { token });

    String protocol = HTTP_PROTOCOL;
    String version = null;
    String server = null;
    String comments = null;

    StringTokenizer st = new StringTokenizer(token, " ");
    int count = 0;
    while (st.hasMoreTokens())
    {
      String part = st.nextToken();
      switch (count)
        {
          case 0 :
            version = part;
            if (part.indexOf('/') != -1)
            {
              protocol = part.substring(0, part.indexOf('/'));
              version = part.substring(part.indexOf('/') + 1);
            }
            break;
          case 1 :
            server = part;
            break;
          case 2 :
            comments = part;
            break;
          default:
            comments += " " + part;
        }
      count++;
    }
    if (count < 2)
    {
      throw new IllegalArgumentException("Via field doesn't conform to RFC2616.");
    }

    ViaEntry retVal = new ViaEntry(protocol, version, server, comments);

    LOGGER.exiting(ViaEntry.class.getName(), "parseViaEntry", retVal);
    return retVal;
  }

  private ViaEntry(String protocol, String version, String server, String comments)
  {
    this.protocol = protocol;
    this.version = version;
    this.server = server;
    this.comments = comments;
  }

  public String getProtocol()
  {
    return protocol;
  }

  public String getVersion()
  {
    return version;
  }

  public String getServer()
  {
    return server;
  }

  public String getComments()
  {
    return comments;
  }

  public String toString()
  {
    StringBuffer retVal = new StringBuffer();
    retVal.append("ViaEntry [").append(protocol).append(", ").append(version).append(", ").append(server).append(", ").append(comments)
        .append("]");
    return retVal.toString();
  }
}
