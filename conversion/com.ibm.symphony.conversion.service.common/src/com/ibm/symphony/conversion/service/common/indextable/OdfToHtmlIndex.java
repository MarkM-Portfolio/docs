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

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ODFConstants;

public class OdfToHtmlIndex
{
  private Map<String, String> indexTableBuffer = null;

  private String draftFolderPath = null;

  private IndexFile indexFile = null;

  private Map<String, List<String>> xmlIdMap = null;

  private Map<String, List<String>> htmlIdMap = null;

  private IdToDOMNodeLocator htmlDomLocator = null;

  Logger LOG = Logger.getLogger(HtmlToOdfIndex.class.getName());

  public OdfToHtmlIndex(String path)
  {
    indexTableBuffer = new LinkedHashMap<String, String>();
    draftFolderPath = path;
    indexFile = new IndexFile(draftFolderPath, indexTableBuffer);
  }

  public OdfToHtmlIndex(String path, Document htmlDoc) throws IOException
  {
    indexTableBuffer = new LinkedHashMap<String, String>();
    draftFolderPath = path;
    htmlDomLocator = new IdToDOMNodeLocator(htmlDoc);
    indexFile = new IndexFile(draftFolderPath, indexTableBuffer, true);
    if (indexFile.exists())
    {
      indexFile.load();
      xmlIdMap = indexFile.getXmlIdMap();
      htmlIdMap = indexFile.getHtmlIdMap();
    }
  }

  public Element createHtmlElement(OdfElement odfNode, Document htmlDoc, String tagName)
  {
    return createHtmlElement(odfNode, htmlDoc, tagName, IndexUtil.RULE_NORMAL, "id_");
  }

  public Element createHtmlElement(OdfElement odfNode, Document htmlDoc, String tagName, String mappingRule, String baseId)
  {
    Element htmlNode = htmlDoc.createElement(tagName);
    addEntryByOdfNode(odfNode, htmlNode, mappingRule, baseId);
    return htmlNode;
  }

  /**
   * This method is used for the case that create a html element with id for those elements in NO_ID_NODES, e.g. SPAN, line break,etc
   * 
   * @param odfNode
   *          - input ODF element
   * @param htmlDoc
   *          - output html element
   * @param tagName
   *          - html element tag name
   * @return the created html element
   */
  public Element createHtmlElementWithForceId(OdfElement odfNode, Document htmlDoc, String tagName, String baseId)
  {
    Element htmlNode = htmlDoc.createElement(tagName);
    String xmlid = IndexUtil.getXmlId(odfNode);
    String htmlid = IndexUtil.getHtmlId(htmlNode, baseId);
    indexTableBuffer.put(xmlid + "," + htmlid, IndexUtil.RULE_NORMAL);
    return htmlNode;
  }

  public boolean isOdfNodeIndexed(OdfElement odfNode)
  {
    String xmlid = odfNode.getAttribute(IndexUtil.ID_STRING);
    if (xmlid == null || xmlid.length() == 0)
      return false;
    return true;
  }

  public boolean isValidOdfIndex(OdfElement odfNode)
  {
    String xmlid = odfNode.getAttribute(IndexUtil.ID_STRING);
    if (xmlid == null || xmlid.length() == 0)
      return false;

    if (xmlIdMap.containsKey(xmlid))
    {
      List<String> htmlids = xmlIdMap.get(xmlid);
      for (String htmlid : htmlids)
      {
        Node htmlNode = htmlDomLocator.getNode(htmlid);
        if (htmlNode != null)
          return true;
      }
    }
    return false;
  }

  public void addEntryByOdfNode(OdfElement odfNode, Element htmlNode)
  {
    addEntryByOdfNode(odfNode, htmlNode, IndexUtil.RULE_NORMAL, "id_");
  }

  public void addEntryByOdfNode(OdfElement odfNode, Element htmlNode, String mappingRule)
  {
    if (IndexUtil.NO_ID_NODES.contains(htmlNode.getNodeName()))
      return;// if html node does not need id, return
    String xmlid = IndexUtil.getXmlId(odfNode);
    String htmlid = IndexUtil.getHtmlId(htmlNode);
    indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
  }

  public void removeEntryByHtmlNode(Element htmlNode)
  {
    String htmlid = IndexUtil.getHtmlId(htmlNode);
    if (htmlIdMap != null)
    {
      List<String> xmlids = htmlIdMap.get(htmlid);
      for (String xmlid : xmlids)
      {
        removeEntry(xmlid + "," + htmlid);
      }
    }
  }

  public void removeEntry(String entry)
  {
    indexTableBuffer.remove(entry);
  }

  public void addEntryByOdfNode(OdfElement odfNode, Element htmlNode, String mappingRule, String htmlBaseId)
  {
    if (IndexUtil.NO_ID_NODES.contains(htmlNode.getNodeName()))
      return;// if html node does not need id, return
    String xmlid = IndexUtil.getXmlId(odfNode);
    String htmlid = IndexUtil.getHtmlId(htmlNode, htmlBaseId);
    indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
  }

  public void addEntryByOdfNode(OdfElement odfNode, String htmlid, String mappingRule)
  {
    String xmlid = IndexUtil.getXmlId(odfNode);
    indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
  }

  /**
   * This method is used for the case that add id for those elements ignore NO_ID_NODES, e.g. SPAN, line break,etc
   * 
   * @param odfNode
   *          - ODF element
   * @param htmlNode
   *          - html element
   * @param mappingRule
   *          - mapping rule
   * @return
   */
  public void addEntryByOdfNodeWithForceId(OdfElement odfNode, Element htmlNode, String mappingRule)
  {
    String xmlid = IndexUtil.getXmlId(odfNode);
    String htmlid = IndexUtil.getHtmlId(htmlNode);
    indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
  }

  public void addEntriesByOdfNode(OdfElement odfNode, List<Element> htmlNodes)
  {
    addEntriesByOdfNode(odfNode, htmlNodes, IndexUtil.RULE_NORMAL);
  }

  public void addEntriesByOdfNode(OdfElement odfNode, List<Element> htmlNodes, String mappingRule)
  {
    for (int i = 0; i < htmlNodes.size(); i++)
    {
      Element htmlNode = htmlNodes.get(i);
      if (IndexUtil.NO_ID_NODES.contains(htmlNode.getNodeName()))
        continue;// if html node does not need id, continue
      String xmlid = IndexUtil.getXmlId(odfNode);
      String htmlid = IndexUtil.getHtmlId(htmlNode);
      indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
    }
  }

  public void addEntryIndexByOdfNode(OdfElement odfNode, Element htmlNode)
  {
    addEntryByOdfNode(odfNode, htmlNode, IndexUtil.RULE_NORMAL, "id_");
    String htmlid = IndexUtil.getHtmlId(htmlNode);
    String xmlid = IndexUtil.getXmlId(odfNode);
    if (htmlIdMap != null)
      IndexUtil.addIntoHtmlIdMap(htmlid, xmlid, htmlIdMap);

    if (xmlIdMap != null)
      IndexUtil.addIntoXmlIdMap(xmlid, htmlid, xmlIdMap);
  }

  public void save(OdfDocument odfDoc) throws Exception
  {
    indexFile.save(odfDoc);
  }

  public Node getNodebyId(String id)
  {
    if (htmlDomLocator != null)
      return htmlDomLocator.getNode(id);
    return null;
  }

  public void insertToHtmlDom(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute("id");
    if (htmlDomLocator != null && htmlid != null && htmlid.length() > 0)
    {
      htmlDomLocator.insertFromParent(htmlNode);
    }
  }

  public Element getFirstHtmlNode(OdfElement odfNode)
  {
    String htmlId = getFirstHtmlIndex(odfNode);
    if (htmlId == null)
      return null;

    Element htmlNode = (Element) htmlDomLocator.getNode(htmlId);
    return htmlNode;
  }

  public String getFirstHtmlIndex(OdfElement odfNode)
  {
    if (odfNode.getNodeName().equals(ODFConstants.OFFICE_TEXT))
      return getFirstHtmlIndex((OdfElement) odfNode.getParentNode());

    String xmlid = odfNode.getAttribute(IndexUtil.ID_STRING);
    if (xmlid == null || xmlid.length() == 0)
      return null;
    if (xmlIdMap == null || !xmlIdMap.containsKey(xmlid))
      return null;
    List<String> htmlids = xmlIdMap.get(xmlid);
    return htmlids.get(0);
  }

  public String getOdfIndex(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return null;
    List<String> xmlids = htmlIdMap.get(htmlid);
    if (null == xmlids)
      return null;
    String key = xmlids.get(0);
    return key;
  }
}
