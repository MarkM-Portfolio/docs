/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.indextable;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

public class IndexUtil
{
  public static final String ID_STRING = "id";

  public static final String INDEXFILE_NAME = "indextable";

  public static final String ODFDRAFT_NAME = "odfdraft";

  public static final String RULE_NORMAL = "normal";

  public static final String RULE_NOUPDATE = "NoUpdate";

  public static final String RULE_SHOW_AS_PLACEHOLDER = "show_as_placeholder";

  public static HashSet<String> NO_ID_NODES = null;
  static
  {
    NO_ID_NODES = new HashSet<String>();
    NO_ID_NODES.add("br");
    NO_ID_NODES.add("BR");
    NO_ID_NODES.add("strong");
    NO_ID_NODES.add("STRONG");
    NO_ID_NODES.add("em");
    NO_ID_NODES.add("EM");
    NO_ID_NODES.add("u");
    NO_ID_NODES.add("U");
    NO_ID_NODES.add("strike");
    NO_ID_NODES.add("STRIKE");
    NO_ID_NODES.add("span");
    NO_ID_NODES.add("SPAN");
  }

  public static String getHtmlId(Element htmlNode)
  {
    return getHtmlId(htmlNode, "id_");
  }

  public static String getHtmlId(Element htmlNode, String baseId)
  {
    String htmlid = htmlNode.getAttribute(ID_STRING);
    if (htmlid == null || htmlid.length() == 0)
    {
      htmlid = DOMIdGenerator.generate(baseId);
      htmlNode.setAttribute(ID_STRING, htmlid);
    }
    return htmlid;
  }

  public static String getXmlId(OdfElement odfNode)
  {
    return getXmlId(odfNode, "id_");
  }

  public static String getXmlId(OdfElement odfNode, String baseId)
  {
    String xmlid = odfNode.getAttribute(ID_STRING);
    if (xmlid == null || xmlid.length() == 0)
    {
      xmlid = DOMIdGenerator.generate(baseId);
      odfNode.setAttribute(ID_STRING, xmlid);
    }
    return xmlid;
  }

  public static void addIntoHtmlIdMap(String htmlid, String xmlid, Map<String, List<String>> htmlIdMap)
  {
    if (htmlIdMap != null && htmlIdMap.containsKey(htmlid))
    {
      List<String> xmlids = htmlIdMap.get(htmlid);
      xmlids.add(xmlid);
    }
    else
    {
      List<String> xmlids = new ArrayList<String>();
      xmlids.add(xmlid);
      htmlIdMap.put(htmlid, xmlids);
    }
  }
  
  public static void addIntoXmlIdMap(String htmlid, String xmlid, Map<String, List<String>>xmlIdMap)
  {
    if (xmlIdMap != null && xmlIdMap.containsKey(xmlid))
    {
      List<String> htmlids = xmlIdMap.get(xmlid);
      htmlids.add(htmlid);
    }
    else
    {
      List<String> htmlids = new ArrayList<String>();
      htmlids.add(htmlid);
      xmlIdMap.put(xmlid, htmlids);
    }
  }  
}
