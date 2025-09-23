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

import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class TableNamedExpressionsConvertor extends GeneralConvertor
{
  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    this.mXmlWriter = mXmlWriter;
    if(output instanceof Text)
      return;
    OdfElement parent = (OdfElement)output;
    this.pInput = input;
    this.startElement(context,input);
    OdfElement element = this.convertElement(context, input,parent);
    target = element;
    parent.appendChild(element);
    setAttributes(context,input,element);
    this.id = getNodeId(input);
    
    startOutput();
    //different with GeneralConvertor, do not removeChildren
    
    this.convertChildren(context,mXmlWriter, input, element);
    //different with GeneralConverter, do no appendChildren
    endOutput();
  }
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Object input, OdfElement element)
  {
    Document doc = (Document) context.get("Source");
    
    List<OdfElement> preserveChildren = new ArrayList<OdfElement>();
    NodeList children = element.getChildNodes();
    //remove the child elements
    //and store all the unsupport elements
    int length = children.getLength();
    for( int i = 0 ;i < length; i++)
    {
      OdfElement child = (OdfElement)element.getFirstChild();
      OdfElement odfNode = (OdfElement) element.removeChild(child);
      if(odfNode instanceof TableNamedRangeElement)
        continue;
     
      preserveChildren.add(odfNode);
    }
    
    //for preserve child, such as named-expression
    for( int i = 0; i< preserveChildren.size(); i++)
    {
      OdfElement child = preserveChildren.get(i);
      PreserveConvertorFactory.getInstance().getConvertor(child.getNodeName()).convert(context, mXmlWriter ,child, element);
    }
    //for support child, such as named-range
    int nlength = doc.nameList.size();
    for (int i = 0; i < nlength ; i++)
    {
      ConversionUtil.Range range = doc.nameList.get(i);
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_NAMED_RANGE).convert(context, mXmlWriter ,range, element);
    }
  }
  
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
//    OdfFileDom contentDom = (OdfFileDom) index.getDocuemnt().getOwnerDocument();
    OdfFileDom contentDom = (OdfFileDom)index.getDocuemnt();
//    TableNamedExpressionsElement element = new TableNamedExpressionsElement(contentDom);
    Element element = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSIONS),ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSIONS);
    return (OdfElement)element;
  }
}
