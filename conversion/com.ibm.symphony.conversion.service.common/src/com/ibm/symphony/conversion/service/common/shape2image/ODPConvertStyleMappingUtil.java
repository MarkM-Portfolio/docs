/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import java.util.logging.Level;
import java.util.logging.Logger;

//===================================================================================
// WARNING: THIS WAS ORIGINALLY IN THE ODP COMMON PROJECT.  THE VERSION THAT REMAINS
// IN THAT PACKAGE NOW WIRES-THROUGH TO THIS CLASS.  IF YOU ADD METHODS HERE, YOU WILL 
// WANT A WIRE-THROUGH METHOD THERE.
//===================================================================================
public class ODPConvertStyleMappingUtil
{
  private static final String CLASS = ODFDrawingParser.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  /**
   * Stored all elements which has the 'style-name' attribute into a fast map
   * 
   * @param odf
   * @param context
   * @throws Exception
   */

  private static void addAllStyleElements(NodeList nodeList, ConversionContext context, Map<String, List<Node>> map, String attr_name)
  {
    // check all nodes
    int length = nodeList.getLength();
    for (int i = 0; i < length; i++)
    {
      Node childNode = nodeList.item(i);
      NamedNodeMap attrs = childNode.getAttributes();
      // find the style:name node then store it into the fast map

      if (attrs != null)
      {
        Node attr = attrs.getNamedItem(attr_name);
        if (attr != null)
        {
          // stored into the fast map in context
          String nodeValue = attr.getNodeValue();
          nodeValue = getCanonicalStyleName(nodeValue);
          List<Node> mapElement = map.get(nodeValue);
          if (mapElement != null)
          {
            mapElement.add(childNode);
          }
          else
          {
            List<Node> l = new ArrayList<Node>(3);
            l.add(childNode);
            map.put(nodeValue, l);
          }
          // don't store the child node for "standard" style-name
          // if(nodeValue.equals("standard"))return;
        }
      }
      NodeList children = childNode.getChildNodes();
      if (children != null)
      {
        addAllStyleElements(children, context, map, attr_name);
      }
    }
  }

  /**
   * Stored all elements which name is 'style-name' into a fast map
   * 
   * @param odf
   * @param context
   * @throws Exception
   * @throws Exception
   */

  public static void mappingAllStyleNodes(OdfDocument odf, ConversionContext context) throws Exception
  {
    Map<String, List<Node>> drawNameMap, styleNameInContentMap, styleNameInStyleMap;

    // Map<String, List<Node>> styleNameMap;
    // styleNameMap = new HashMap<String, List<Node>>();
    // context.put(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP, styleNameMap);

    styleNameInContentMap = new HashMap<String, List<Node>>(128);
    context.put(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT, styleNameInContentMap);
    styleNameInStyleMap = new HashMap<String, List<Node>>(128);
    context.put(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE, styleNameInStyleMap);
    drawNameMap = new HashMap<String, List<Node>>(128);
    context.put(ODFConstants.CONTEXT_DRAWNAME_NODES_MAP, drawNameMap);

    // check the styles.xml
    Node root = odf.getStylesDom();
    NodeList nl = root.getChildNodes();
    // addAllStyleElements(nl, context,styleNameMap,ODPConvertConstants.ODF_ATTR_STYLE_NAME);
    addAllStyleElements(nl, context, styleNameInStyleMap, ODFConstants.ODF_ATTR_STYLE_NAME);
    addAllStyleElements(nl, context, drawNameMap, ODFConstants.ODF_ATTR_DRAW_NAME);

    // check the content.xml
    root = odf.getContentDom();
    nl = root.getChildNodes();
    // addAllStyleElements(nl, context,styleNameMap,ODPConvertConstants.ODF_ATTR_STYLE_NAME);
    addAllStyleElements(nl, context, styleNameInContentMap, ODFConstants.ODF_ATTR_STYLE_NAME);
    // addAllStyleElements(nl, context,drawNameMap,ODPConvertConstants.ODF_ATTR_DRAW_NAME);
  }

  @SuppressWarnings("unchecked")
  public static List<Node> getAllStyleNameNodesByKey(ConversionContext context, String pkey)
  {
    String key = getCanonicalStyleName(pkey);

    Map<String, List<Node>> styleMap;
    try
    {
      return (styleMap = (Map<String, List<Node>>) context.get(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE)).get(key) == null ? (styleMap = (Map<String, List<Node>>) context
          .get(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT)).get(key) : styleMap.get(key);
    }
    catch (Exception e)
    {
      if (log.isLoggable(Level.FINE))
      {
        log.fine("getAllStyleNameNodesByKey exception occurred for key " + key + " Exception message is " + e.getMessage());
      }
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public static List<Node> getStyleNameInContentNodesByKey(ConversionContext context, String pkey)
  {
    String key = getCanonicalStyleName(pkey);

    Map<String, List<Node>> styleMap = (Map<String, List<Node>>) context.get(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT);
    return styleMap.get(key);
  }

  @SuppressWarnings("unchecked")
  public static List<Node> getStyleNameInStyleNodesByKey(ConversionContext context, String pkey)
  {
    String key = getCanonicalStyleName(pkey);

    Map<String, List<Node>> styleMap = (Map<String, List<Node>>) context.get(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);
    return styleMap.get(key);
  }

  @SuppressWarnings("unchecked")
  public static List<Node> getDrawNameNodesByKey(ConversionContext context, String pkey)
  {
    String key = getCanonicalStyleName(pkey);

    Map<String, List<Node>> styleMap = (Map<String, List<Node>>) context.get(ODFConstants.CONTEXT_DRAWNAME_NODES_MAP);
    return styleMap.get(key);
  }

  @SuppressWarnings("unchecked")
  public static void addNodeToContent(ConversionContext context, Node n)
  {
    if (n != null)
    {
      Map<String, List<Node>> map = (Map<String, List<Node>>) context.get(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT);
      NamedNodeMap attrs = n.getAttributes();
      if (attrs.getNamedItem(ODFConstants.ODF_ATTR_STYLE_NAME) != null)
      {
        String nodeValue = attrs.getNamedItem(ODFConstants.ODF_ATTR_STYLE_NAME).getNodeValue();
        nodeValue = getCanonicalStyleName(nodeValue);

        if (map.containsKey(nodeValue))
        {
          List<Node> l = map.get(nodeValue);
          l.add(n);
        }
        else
        {
          List<Node> l = new ArrayList<Node>(3);
          l.add(n);
          map.put(nodeValue, l);
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  public static void addNodeToStyle(ConversionContext context, Node n)
  {
    if (n != null)
    {
      Map<String, List<Node>> map = (Map<String, List<Node>>) context.get(ODFConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);
      NamedNodeMap attrs = n.getAttributes();
      if (attrs.getNamedItem(ODFConstants.ODF_ATTR_STYLE_NAME) != null)
      {
        String nodeValue = attrs.getNamedItem(ODFConstants.ODF_ATTR_STYLE_NAME).getNodeValue();
        nodeValue = getCanonicalStyleName(nodeValue);

        if (map.containsKey(nodeValue))
        {
          List<Node> l = map.get(nodeValue);
          l.add(n);
        }
        else
        {
          List<Node> l = new ArrayList<Node>(3);
          l.add(n);
          map.put(nodeValue, l);
        }
      }
    }
  }

  static final String listPrefix = "li.";

  static final char xc = '.';

  static final String xcr = new String("_" + Integer.toHexString((int) xc) + "_");

  // in order to update this code to allow for new String, just add
  // values to these string arrays. 'before' strings for values that
  // precede the dot, 'after' strings follow the dot.

  static final String[] before = new String[] { "li", "ol", "ul", "td", "table_table-cell", "concord" };

  static final String[] after = new String[] { "concord" };

  // Build a hash table with the first two letters of the "after" strings
  // and the last two letters of the "before" strings.

  static HashMap<String, String> beforeMap = new HashMap<String, String>();

  static HashMap<String, String> afterMap = new HashMap<String, String>();

  static
  {

    for (String s : before)
    {
      beforeMap.put(s.substring(s.length() - 2), s);
    }
    for (String s : after)
    {
      afterMap.put(s.substring(0, 2), s);
    }
  }

  /**
   * Returns a canonical name where illegal characters have been 'escaped'. The escape is _XX hex-digit encoding.
   * 
   * @param inName
   * @return the canonical name
   */
  public static String getCanonicalStyleName(String inName)
  {
    if (inName == null || inName.length() == 0)
      return inName;

    Vector<Integer> matches = null;
    char[] tchar = null;

    int pos = 0;

    int length = inName.length();
    while (pos < length)
    {
      // start search at pos 1 to ignore a leading dot
      pos = inName.indexOf(xc, pos + 1);
      if (pos < 0)
        break;

      if (matches == null)
      {
        matches = new Vector<Integer>(5);
        tchar = new char[2];
      }

      // check the before strings
      if (pos >= 2)
      {
        tchar[0] = inName.charAt(pos - 2);
        tchar[1] = inName.charAt(pos - 1);
        String tmp = (new String(tchar)).toLowerCase();
        String tocheck = beforeMap.get(tmp);
        if (tocheck != null)
        {
          int startpos = pos - tocheck.length();
          if (startpos >= 0)
          {
            if ((inName.substring(startpos)).toLowerCase().startsWith(tocheck))
            {
              continue;
            }
          }
        }
      }

      // now check the after strings
      if (pos < inName.length() - 2)
      {
        tchar[0] = inName.charAt(pos + 1);
        tchar[1] = inName.charAt(pos + 2);
        String tmp = (new String(tchar)).toLowerCase();
        String tocheck = afterMap.get(tmp);
        if (tocheck != null)
        {
          if ((inName.substring(pos + 1)).toLowerCase().startsWith(tocheck))
          {
            continue;
          }
        }

      }

      // if we got this far, it means we have a real . to escape
      matches.add(new Integer(pos));
    }

    if (matches == null)
      return inName;

    if (matches.isEmpty())
      return inName;

    pos = 0;
    StringBuilder sb = new StringBuilder(inName.length() * 2);
    for (Integer x : matches)
    {
      sb.append(inName.substring(pos, x.intValue()));
      sb.append(xcr);
      pos = x.intValue() + 1;
    }

    if (pos < inName.length())
      sb.append(inName.substring(pos));

    return sb.toString();
  }

}
