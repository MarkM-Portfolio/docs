/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.table.TableCoveredTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnGroupElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableHeaderColumnsElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableHeaderRowsElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowGroupElement;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.PreserveManager;
import com.ibm.symphony.conversion.converter.json2ods.sax.IConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class GeneralConvertor implements IConvertor
{

  private static final Logger LOG = Logger.getLogger(GeneralConvertor.class.getName());
  
  protected String qName;
  protected String id;
  protected OdfElement target;
  protected TransformerHandler mXmlWriter;
  protected Object pInput;
  
  ArrayList<GeneralConvertor> mChildConvertors;//only add child when mbChildPreserve=true
  
  protected String getNodeId(Object input)
  {
    if(id != null && !"".equals(id))
      return id;
    if(input instanceof OdfElement)
    {
      String sId = ((OdfElement)input).getAttribute(IndexUtil.ID_STRING);
      if(sId!= null && !"".equals(sId))
      {
        this.id = sId;
      }
      return this.id;
    }
    return null;
  }
  
  protected String getNodeName()
  {
    return qName;
  }
  
  protected String getStyleId(Object input)
  {
    return null;
  }
  
  protected void startOutput(Node element)
  {
    String qName = element.getNodeName();
    NamedNodeMap map = element.getAttributes();
    AttributesImpl attrs = null;
    int len = map.getLength();
    if(len > 0 )
      attrs = new AttributesImpl();
    for(int i = 0; i< len; i++)
    {
      Node attr = map.item(i);
      attrs.addAttribute(attr.getBaseURI(), "",attr.getNodeName(), "", attr.getNodeValue());
    }
    try
    {
      mXmlWriter.startElement(element.getBaseURI(), element.getLocalName(), qName, attrs);
    }
    catch (SAXException e)
    {
      LOG.log(Level.SEVERE,"Output Error");
    }
  }
  
  protected void outputText(Object input)
  {
    Text text = (Text)input;
    char[] aCh = text.getTextContent().toCharArray();
    try
    {
      mXmlWriter.characters(aCh, 0, aCh.length);
    }
    catch (SAXException e)
    {
      LOG.log(Level.SEVERE,"Output Error");
    }
  }
  
  protected void endOutput(Node element)
  {
    try
    {
      String qName = element.getNodeName();
      if(qName == null)
        return;
      mXmlWriter.endElement(element.getBaseURI(), element.getLocalName(), qName);
    }
    catch (SAXException e)
    {
      LOG.log(Level.SEVERE,"Output Error");
    }
  }
  
  protected void startOutput()
  {
    startOutput(target);
  }
  
  protected void endOutput()
  {
    endOutput(target);
  }
  
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    setTableStyleNameAttribute(context,input,element);
  }
  
  
  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    this.mXmlWriter = mXmlWriter;
    if(output instanceof Text)
      return;
    OdfElement parent = (OdfElement)output;
    this.pInput = input;
    this.startElement(context,input);
    OdfElement element = this.convertElement(context, input,parent);
    if(element==null)
    {
    	LOG.log(Level.SEVERE,"The target is null!");
    	return;
    }
    target = element;
    parent.appendChild(element);
    setAttributes(context,input,element);
    this.id = getNodeId(input);
    
    startOutput();
    
    List<OdfElement> pList = this.removeChildren(context,mXmlWriter, element);
    this.convertChildren(context,mXmlWriter, input, element);
    this.appendElement(context,mXmlWriter,pList, element);
    
    endOutput();
  }
  
  protected void startElement(ConversionContext context,Object input)
  {
    
  }
  
  protected void setTableStyleNameAttribute(ConversionContext context,Object input, OdfElement element)
  {
    HashMap<String,Map<String,String>> styleNameMap = (HashMap<String,Map<String,String>>) context.get("newStyleMap");
    String styleId = getStyleId(input);
    if(element instanceof OdfStylableElement && ConversionUtil.hasValue(styleId))
    {
      String newTableStyleName = styleNameMap.get(styleId).get(styleId);
      if(newTableStyleName != null)
      {
        element.setAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME, newTableStyleName);
      }
    }
  }
  
  protected void doPreserve(ConversionContext context,OdfElement target,OdfElement parent)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    if(id != null && !"".equals(id))
    {
      Set<PreserveNameIndex> nameSet = index.getPreserveData(id);
      if(nameSet == null)
        return;
      Iterator<PreserveNameIndex> it =  nameSet.iterator();
      PreserveManager manager = new PreserveManager();
      Map<String,List<PreserveNameIndex>> map = new HashMap<String,List<PreserveNameIndex>>();
      while( it.hasNext())
      {
        PreserveNameIndex nameIndex = it.next();
        switch(nameIndex.type)
        {
          case SPLIT:
          {
            List<PreserveNameIndex> list = map.get(nameIndex.attrName);
            if(list == null)
            {
              list = new ArrayList<PreserveNameIndex>();
              map.put(nameIndex.attrName, list);
            }
            list.add(nameIndex);
            break;
          }
          default:
          //do not do it here, because the preserve might be called several times if the preserve element id contains serveral preserve range
//            manager.doPreserve(context, id, target,parent);
            break;
        }
      }
      manager.doPreserve(context, id, target,parent);
      
      Iterator<Entry<String,List<PreserveNameIndex>>> entries =  map.entrySet().iterator();
      while(entries.hasNext())
      {
        Entry<String,List<PreserveNameIndex>> entry = entries.next();
        manager.doPreserve(context, entry, target);
      }
    }
  }
  protected void endElement(ConversionContext context)
  {

  }
  
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
    endElement(context);
    for(OdfElement node:pList)
    {
      parent.appendChild(node);
      PreserveConvertorFactory.getInstance().getConvertor(node.getNodeName()).convert(context,mXmlWriter, node, parent);
    }
  }
  
  /*
   * input can be JSON object or OdfElement
   * return the converted element according to input
   */
  
  protected OdfElement convertElement(ConversionContext context,Object input,OdfElement parent)
  {
    if( input instanceof OdfElement)
      return (OdfElement)input;
    OdfElement element = getOdfElement(context, input);
    if(element == null)
      element = createNewElement(context, input,parent);
    if(element != null)
      qName = element.getNodeName();
    return element;
  }
  
  /*
   * return the existing odf element by Id
   */
  
  protected OdfElement getOdfElement(ConversionContext context,Object input)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    String xmlId = getNodeId(input);
    OdfElement node = index.getOdfNodes(xmlId);
    return node;
  }
  
  protected boolean isNonPreserve(Node odfNode)
  {
    return odfNode instanceof TableTableCellElement || odfNode instanceof TableCoveredTableCellElement || odfNode instanceof TableTableElement || odfNode instanceof TableTableRowElement || odfNode instanceof TableTableColumnElement || odfNode instanceof TableTableRowGroupElement || odfNode instanceof TableTableColumnGroupElement || odfNode instanceof TableNamedRangeElement || odfNode instanceof TableTableHeaderRowsElement || odfNode instanceof TableTableHeaderColumnsElement;
  }
  
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    if(qName == null)
      return null;
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    OdfElement element = contentDocument.createElementNS(ODSConvertUtil.getNameSpace(qName),qName);
    return element;
  }
  
  protected List<OdfElement> removeChildren(ConversionContext context,TransformerHandler mXmlWriter, OdfElement element)
  {
    //remove the children has been deleted
    if(element == null)
      return null;
    List<OdfElement> oldChildren = new ArrayList<OdfElement>();
    List<OdfElement> tailChildren = new ArrayList<OdfElement>();
    NodeList children = element.getChildNodes();
    
    int length = children.getLength();
    for( int i = 0 ;i < length; i++)
    {
      OdfElement child = (OdfElement)element.getFirstChild();
      OdfElement odfNode = (OdfElement) element.removeChild(child);
      oldChildren.add(odfNode);
      tailChildren.add(odfNode);
      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
      if((xmlId != null && !"".equals(xmlId)) || isNonPreserve(odfNode))
      {
        if(odfNode instanceof TableNamedExpressionElement)
          continue;
        tailChildren.clear();
      }
    }
    int size = oldChildren.size();
    boolean isPrePreserved = false ;
    for(int i = 0; i < size; i++ )
    {
      OdfElement odfNode = oldChildren.get(i);
      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
      if(isNonPreserve(odfNode))
      {
        isPrePreserved = true;
        continue;
      }
      element.appendChild(odfNode);
      if(isPrePreserved)
        PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).buildDOMNode(context,mXmlWriter, odfNode, element);
      else
        PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).convert(context,mXmlWriter, odfNode, element);
    }
    return tailChildren;
  }
  
  protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
  {
    if(element == null)
      return;
    Node head = element.getFirstChild();
    
    while(head!=null)
    {
      String nodeName = head.getNodeName();
      OdfElementConvertorFactory.getInstance().getConvertor(nodeName).convert(context,mXmlWriter, head, element);
      head = head.getNextSibling();
    }
  }

  public void buildDOMNode(ConversionContext context, TransformerHandler mXMLWriter, Object input, Object output)
  {
    this.mXmlWriter = mXMLWriter;
  }
  
}
