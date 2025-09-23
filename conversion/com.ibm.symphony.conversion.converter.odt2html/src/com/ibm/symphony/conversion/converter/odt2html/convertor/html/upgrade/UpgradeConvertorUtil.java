/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.odt2html.convertor.ODTConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;

public class UpgradeConvertorUtil
{
  private static final Logger LOG = Logger.getLogger(UpgradeConvertorUtil.class.getName());

  static JSONObject upgradedElements;
  static
  {
    InputStream input = UpgradeConvertorUtil.class.getResourceAsStream("UpgradeElement.json");
    try
    {
      upgradedElements = JSONObject.parse(input);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Failed to parse upgradeElement.json.", e);
    }
    finally
    {
      if (input != null)
      {
        try
        {
          input.close();
        }
        catch (IOException e)
        {
        }
      }
    }
  }

  public static JSONArray getUpgradedElements(String oldVersion)
  {
    JSONArray jarry = new JSONArray();
    if (upgradedElements != null)
    {
      Iterator keys = upgradedElements.keySet().iterator();
      while (keys.hasNext())
      {
        String key = (String) keys.next();
        if (compareVersion(key, oldVersion) > 0)
        {
          jarry.addAll((JSONArray) upgradedElements.get(key));
        }
      }
    }
    return jarry;
  }
  
  /**
   * Compares two versions.
   * 
   * @param version1
   *          the first version
   * @param version2
   *          the second version
   * @return an int < 0 if version1 is less than version2, 0 if they are equal, and > 0 if version1 is greater
   */
  private static int compareVersion(String version1, String version2)
  {
    String versions1[] = version1.split("\\.");
    String versions2[] = version2.split("\\.");
    int length = 0;
    if (versions1.length > versions2.length)
    {
      length = versions2.length;
    }
    else
    {
      length = versions1.length;

    }
    for (int i = 0; i < length; i++)
    {
      int v1 = Integer.parseInt(versions1[i]);
      int v2 = Integer.parseInt(versions2[i]);
      if (v1 == v2)
        continue;
      return v1 - v2;
    }
    return versions1.length - versions2.length;
  }

  public static boolean isUpgrade(ConversionContext context)
  {
    if (context.get("isUpgrade") != null)
      return (Boolean) context.get("isUpgrade");
    return false;
  }

  public static boolean isUpgradedElement(ConversionContext context, OdfElement element)
  {
    if (isUpgrade(context))
    {
      String nodeName = element.getNodeName();

      JSONArray jArray = (JSONArray) context.get("upgradedElements");
      if (jArray != null && jArray.contains(nodeName))
        return true;

      if (!context.getOdfToHtmlIndexTable().isOdfNodeIndexed(element))
      {
        if (!ODTConvertorUtil.NON_UPGRADED_ELEMENTS.contains(nodeName))
          return true;
      }
    }
    return false;
  }

  public static void convertChildren(ConversionContext context, OdfElement element)
  {
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node node = children.item(i);
      if (node instanceof OdfElement)
      {
        OdfElement child = (OdfElement) node;
        Object key = getKeyOfConvertor(context, child);
        if (key != null)
        {
          IConvertor convertor = HtmlUpgradeConvertorFactory.getInstance().getConvertor(key);
          convertor.convert(context, child, null);
        }
      }
    }
  }

  public static Object getKeyOfConvertor(ConversionContext context, OdfElement element)
  {
    OdfToHtmlIndex index = context.getOdfToHtmlIndexTable();

    if (!isUpgradedElement(context, element))
    {
      // if indexed && failed to get html node,this node is deleted,return
      // else go on convert children
//      if (index.isOdfNodeIndexed(element) && !index.isValidOdfIndex(element))
//        return null;
//      else 
      if (ODTConvertorUtil.getDisabledElements().contains(element.getNodeName()))
        return null;
      else
        return "CONVERT_CHILD";
    }
    return element;
  }

  public static void locateNewNode(ConversionContext context, OdfElement element, Node parent, Node newNode)
  {
    // no child for parent,append
    // if right child existing,and under the same parent, insert before
    // else append to parent
    OdfToHtmlIndex index = context.getOdfToHtmlIndexTable();
    Node nextSbl = element.getNextSibling();
    if (parent.hasChildNodes() && nextSbl != null)
    {
      Node nextRefNode = null;
      String parentId = ((Element) parent).getAttribute(IndexUtil.ID_STRING);
      while (nextSbl != null)
      {
        if (nextSbl instanceof OdfElement)
        {
          Node tmpNode = index.getFirstHtmlNode((OdfElement) nextSbl);
          if (tmpNode != null)
          {
            String tmpParentId = ((Element) tmpNode.getParentNode()).getAttribute(IndexUtil.ID_STRING);
            if (tmpParentId != null && !tmpParentId.equals("") && tmpParentId.equals(parentId))
            {
              nextRefNode = tmpNode;
              break;
            }
          }
        }
        nextSbl = nextSbl.getNextSibling();
      }

      if (nextRefNode != null)
        parent.insertBefore(newNode, nextRefNode);
      else
        parent.appendChild(newNode);
    }
    else
      parent.appendChild(newNode);
  }

  public static Element getHtmlParent(ConversionContext context, OdfElement element)
  {
    return context.getOdfToHtmlIndexTable().getFirstHtmlNode((OdfElement) element.getParentNode());
  }

  public static String readVersionText(File sourceFile)
  {
    String version = null;
    try
    {
      if (sourceFile.exists())
        version = NFSFileUtil.nfs_readFileAsString(sourceFile, 0);
    }
    catch (IOException e)
    {
    }
    return version;
  }

  public static Node createNodeWithNewName(ConversionContext context, String nodeName, Node refNode)
  {
    Document htmlDoc = (Document) context.getTarget();
    Element newNode = htmlDoc.createElement(nodeName);

    NamedNodeMap attrs = refNode.getAttributes();
    if (attrs != null)
    {
      for (int i = 0; i < attrs.getLength(); i++)
      {
        HtmlConvertorUtil.setAttribute(newNode,((Attr) attrs.item(i)).getName(),((Attr) attrs.item(i)).getValue());
      }
    }

    refNode.getParentNode().insertBefore(newNode, refNode);
    return newNode;
  }

  public static Node removeAllChilds(Node node)
  {
    Node newNode = node.cloneNode(false);
    Node parent = node.getParentNode();
    parent.insertBefore(newNode, node);
    parent.removeChild(node);
    return newNode;
  }

  public static void insertToHtmlDom(ConversionContext context, Element parent)
  {
    context.getOdfToHtmlIndexTable().insertToHtmlDom(parent);
  }


}
