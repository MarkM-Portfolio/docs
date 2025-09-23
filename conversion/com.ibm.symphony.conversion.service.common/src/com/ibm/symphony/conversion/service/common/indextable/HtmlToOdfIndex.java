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

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ODFConstants;

public class HtmlToOdfIndex
{
  private Map<String, String> indexTableBuffer = null;

  private Map<String, List<String>> htmlIdMap = null;// one html id may be

  // mapped to one xmlid
  // or a list of xml ids.
  private String draftFolderPath = null;

  private IdToDOMNodeLocator odfDomLocator = null;

  private IndexFile indexFile = null;

  Logger LOG = Logger.getLogger(HtmlToOdfIndex.class.getName());

  public HtmlToOdfIndex(String path, OdfFileDom odfDom) throws Exception
  {
    indexTableBuffer = new LinkedHashMap<String, String>();
    htmlIdMap = new HashMap<String, List<String>>();
    odfDomLocator = new IdToDOMNodeLocator(odfDom);
    draftFolderPath = path;
    indexFile = new IndexFile(draftFolderPath, indexTableBuffer, htmlIdMap);
    if (indexFile.exists())
    {
      indexFile.load();
    }
    else
    {
      LOG.log(Level.FINER,"index file does not exist, the preserve may not work if the source file is from desktop Office!");
    }
  }

  public HtmlToOdfIndex(String path) throws Exception
  {
    indexTableBuffer = new LinkedHashMap<String, String>();
    htmlIdMap = new HashMap<String, List<String>>();
    draftFolderPath = path;
    indexFile = new IndexFile(draftFolderPath, indexTableBuffer, htmlIdMap);
    if (indexFile.exists())
    {
      indexFile.load();
    }
    else
    {
      LOG.log(Level.FINER,"index file does not exist, the preserve may not work if the source file is from desktop Office!");
    }
  }

  public void setOdfFileDom(OdfFileDom odfDom)
  {
    odfDomLocator = new IdToDOMNodeLocator(odfDom);
  }

  /**
   * This method saves the index table in the ODF Document and writes the ODF Document to the file system.
   * @param odfDoc ODF Document
   * @return File for the written ODF Document
   * @throws Exception
   */
  public File save(OdfDocument odfDoc) throws Exception
  {
    return indexFile.save(odfDoc);
  }

  public void addEntryByHtmlNode(Element htmlNode, OdfElement odfNode)
  {
    addEntryByHtmlNode(htmlNode, odfNode, IndexUtil.RULE_NORMAL);
  }

  public void addEntryByHtmlNode(Element htmlNode, OdfElement odfNode, String mappingRule)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return;
    String xmlid = IndexUtil.getXmlId(odfNode);
    indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
    IndexUtil.addIntoHtmlIdMap(htmlid, xmlid, htmlIdMap);
    odfDomLocator.insertNode(xmlid, odfNode);
  }

  public void addEntriesByHtmlNode(Element htmlNode, List<OdfElement> odfNodes)
  {
    addEntriesByHtmlNode(htmlNode, odfNodes, IndexUtil.RULE_NORMAL);
  }

  public void addEntriesByHtmlNode(Element htmlNode, List<OdfElement> odfNodes, String mappingRule)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return;
    for (OdfElement odfNode : odfNodes)
    {
      addEntryByHtmlNode(htmlNode, odfNode, mappingRule);
    }
  }

  public void removeEntriesByHtmlNode(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return;
    List<String> xmlids = htmlIdMap.get(htmlid);
    for (String xmlid : xmlids)
    {
      indexTableBuffer.remove(xmlid + "," + htmlid);
    }
    htmlIdMap.remove(htmlid);
  }

  public void updateEntriesByHtmlNode(Element htmlNode, String mappingRule)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return;
    List<String> xmlids = htmlIdMap.get(htmlid);
    for (String xmlid : xmlids)
    {
      indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
    }
  }

  public String getMappingRule(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return null;
    List<String> xmlids = htmlIdMap.get(htmlid);
    if (null == xmlids)
      return null;
    String key = xmlids.get(0) + "," + htmlid;
    return indexTableBuffer.get(key);
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

  public List<OdfElement> getOdfNodes(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return null;
    if (!htmlIdMap.containsKey(htmlid))
      return null;
    List<OdfElement> odfNodes = new ArrayList<OdfElement>();
    List<String> xmlids = htmlIdMap.get(htmlid);
    for (String xmlid : xmlids)
    {
      OdfElement odfNode = (OdfElement) odfDomLocator.getNode(xmlid);
      odfNodes.add(odfNode);
    }
    return odfNodes;
  }

  public OdfElement getFirstOdfNode(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return null;
    if (!htmlIdMap.containsKey(htmlid))
      return null;
    List<String> xmlids = htmlIdMap.get(htmlid);
    OdfElement odfNode = (OdfElement) odfDomLocator.getNode(xmlids.get(0));
    return odfNode;
  }

  public boolean isHtmlNodeIndexed(Element htmlNode)
  {
    String htmlid = htmlNode.getAttribute(IndexUtil.ID_STRING);
    if (htmlid == null || htmlid.equals(""))
      return false;
    return htmlIdMap.containsKey(htmlid);
  }

  public boolean isOdfNodeIndexed(OdfElement odfNode)
  {
    String xmlid = odfNode.getAttribute(IndexUtil.ID_STRING);
    if (xmlid == null || xmlid.equals(""))
      return false;
    return true;
  }
  public void processDeletedHtmlNodes(Document htmlDoc)
  {
    processDeletedHtmlNodes(htmlDoc, null);
  }

  public void processDeletedHtmlNodes(Document htmlDoc, Map<String,List<Node>> removedNodeMap)
  {

    List<String> deletedHtmlIds = new ArrayList<String>();
    IdToDOMNodeLocator htmlDocLocator = new IdToDOMNodeLocator(htmlDoc);
    for (String htmlid : htmlIdMap.keySet())
    {
      if (htmlDocLocator.getNode(htmlid) == null)// the html node has been
      // deleted
      {
        List<String> xmlids = htmlIdMap.get(htmlid);
        List<Node> removedNodeList = null;
        if( removedNodeMap!= null && xmlids.size() > 0)
        {
          removedNodeList = new ArrayList<Node>();
          removedNodeMap.put(htmlid, removedNodeList);
        }
        for (String xmlid : xmlids)
        {
          indexTableBuffer.remove(xmlid + "," + htmlid);
          Node odfNode = odfDomLocator.getNode(xmlid);
          if (odfNode == null)
            break;
          Node parentNode = odfNode.getParentNode();
          if (parentNode == null)
            break;
          if(parentNode.getNodeName().equalsIgnoreCase(ODFConstants.ODF_ELEMENT_OFFICE_BODY))
        	  break;
          if( removedNodeList != null )
          {
            removedNodeList.add(odfNode.cloneNode(true));
          }
          parentNode.removeChild(odfNode);
          
        }
        deletedHtmlIds.add(htmlid);
      }
    }
    for (int i = 0; i < deletedHtmlIds.size(); i++)
    {
      htmlIdMap.remove(deletedHtmlIds.get(i));
    }
  }

  public void loadODFDOM(OdfFileDom odfDom)
  {
    odfDomLocator = new IdToDOMNodeLocator(odfDom);
  }

  public void clearIndex()
  {
    indexTableBuffer.clear();
    htmlIdMap.clear();
  }
}
