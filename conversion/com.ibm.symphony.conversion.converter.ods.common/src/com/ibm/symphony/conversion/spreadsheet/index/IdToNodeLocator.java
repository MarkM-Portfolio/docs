/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfMediaType;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfXMLFile;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElementBase;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;

public class IdToNodeLocator
{
  private Map<String, Node> idNodeMap = null;
  private Map<String, List<String>> styleNameMap = null;
  private Node content = null;
  private OdfFileDom fileDom = null;
  
  private void traverseDOMTree(ConversionContext context, Node node)
  {
    int type = node.getNodeType();
    switch (type)
      {
        case Node.DOCUMENT_NODE :
        {
          traverseDOMTree(context,((Document) node).getDocumentElement());
          break;
        }
        case Node.ELEMENT_NODE :
        {
          OdsNodeLocatorFactory.getInstance().getLocator(node).traverse(context, node, null);
          break;
        }
        default:
          break;
      }
  }

  private void traverseElementsTree(Node node)
  {
    String id = "";
    if(node instanceof Element)
      id = ((Element) node).getAttribute(IndexUtil.ID_STRING);
    if (!id.equals(""))
      idNodeMap.put(id, node);
    String nodeName = node.getNodeName();
    if(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW.equals(nodeName))
    {
      traverseTableRowElementTree(node, id);
    }
    else
    {
      if (node.hasChildNodes())
      {
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++)
        {  
          Node child = children.item(i);
          traverseElementsTree(child);
        }
      }
    }
  }
  
  private void traverseChartDocument(ConversionContext localtorContext,OdfDocument doc)
  {
    List<OdfDocument> chartDocs = doc.getEmbeddedDocuments(OdfMediaType.CHART);
    int length = chartDocs.size();
    for(int i=0; i < length; i++){
      try{
        OdfDocument chartDoc = chartDocs.get(i);
        OdfFileDom contentDom = chartDoc.getContentDom();
        OdsNodeLocatorFactory.getInstance().getLocator(contentDom).traverse(localtorContext, contentDom, null);
//        traverseDOMTree(contentDom);
      }catch (Exception e) {
      }
    }
  }
  
  private void traverseTableRowElementTree(Node node,String id)
  {
    String parentId = id;
    int columnIndex =  0;
    if (node.hasChildNodes())
    {
      NodeList children = node.getChildNodes();
      int length = children.getLength();
      for (int i = 0; i < length; i++)
      {
        Node child = children.item(i);
        if(child instanceof TableTableCellElementBase)
        {
          TableTableCellElementBase cell = (TableTableCellElementBase)child;
          String cellStyle = cell.getStyleName();
          int repeatNum = cell.getTableNumberColumnsRepeatedAttribute();
          columnIndex += repeatNum;
          String childId = ((Element) node).getAttribute(IndexUtil.ID_STRING);
          if ("".equals(childId))
          {
            String sCol = ReferenceParser.translateCol(columnIndex);
            String cellId = IndexUtil.generateCellId(parentId, sCol);
            idNodeMap.put(cellId, child);
          }
          if(!"".equals(cellStyle))
          {
            
          }
        }
        traverseElementsTree(child);
      }
    }
  }

  
  public IdToNodeLocator(ConversionContext context,com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document jsonDoc,OdfDocument doc)
  {
    idNodeMap = new HashMap<String, Node>();
    styleNameMap = new HashMap<String, List<String>>();
    try
    {
      String fileName = OdfXMLFile.CONTENT.getFileName();
      content = ODSConvertUtil.parseXML(doc, fileName , context);
      context.put("Target", content);
      fileDom = new OdfFileDom(doc,doc.getDocumentPackagePath() + fileName);
      context.put("idNodeMap", idNodeMap);
      context.put("styleNameMap", styleNameMap);
      
      traverseDOMTree(context,content);
      traverseChartDocument(context,doc);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }
  
  public Node getNode(String id)
  {
    return idNodeMap.get(id);
  }
  
  void insertNode(String id, Node node)
  {
      idNodeMap.put(id, node);
  }
  
  void removeNodeFromDOM(String id)
  {
    Node node = idNodeMap.get(id);
    if (node == null)
      return;
    Node parentNode = node.getParentNode();
    if (parentNode == null)
      return;
    parentNode.removeChild(node);
    idNodeMap.remove(id);
  }
  
  OdfFileDom getOdfFileDom()
  {
    return fileDom;
  }
  
  Node getDocument()
  {
    return content;
  }

}
