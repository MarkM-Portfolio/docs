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
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionsElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableSourceElement;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.json2ods.ContextInfo;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class OfficeSpreadsheetConvertor extends GeneralConvertor
{
  //should append the source table (refer to the external link, which might also contains the cache data)
  private List<OdfElement> preserveTables = new ArrayList<OdfElement>();
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter, Object input, OdfElement element)
  {
    ContextInfo info = (ContextInfo) context.get("ContextInfo");
    Document doc = (Document)context.get("Source");
    int validationCnt = doc.validationTransMgr.validationMap.size();
    if(validationCnt > 0)
    {
    	OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATIONS).convert(context,mXmlWriter, null, element);
    }
    // convert ok content
    int length = doc.sheetList.size();
    for (int sheetIndex = 0; sheetIndex < length; sheetIndex++)
    {
      info.maxColCnt = 0;
      ConversionUtil.Sheet sheet = doc.sheetList.get(sheetIndex);
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE).convert(context, mXmlWriter, sheet, element);
    }
    
    //append source tables
    for (int sourceIndex = 0; sourceIndex < preserveTables.size(); sourceIndex++)
    {
      OdfElement sourceTableEle = preserveTables.get(sourceIndex);
      new GeneralPreserveConvertor().convert(context, mXmlWriter, sourceTableEle, element);
    }
    
    NodeList expressions = element.getElementsByTagName(ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSIONS);

    if(expressions.getLength() == 0)
    {
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSIONS).convert(context,mXmlWriter, null, element);
    }

    
    NodeList database_ranges = element.getElementsByTagName(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES);
    if(database_ranges.getLength() == 0)
    {
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES).convert(context,mXmlWriter, null, element);
    }
    
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
        if(odfNode instanceof TableTableElement)
        {
          OdfElement firstChild = (OdfElement)odfNode.getFirstChild();
          if(firstChild instanceof TableTableSourceElement)
          {
            preserveTables.add(odfNode);
          }
        }else if(odfNode instanceof TableNamedExpressionElement)
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
      if(tailChildren.contains(odfNode))//the tailChildren can be preserved and append by GeneralConvertor.convert() (the last four statements)
        continue;
      if(isPrePreserved)
        PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).buildDOMNode(context,mXmlWriter, odfNode, element);
      else
        PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).convert(context,mXmlWriter, odfNode, element);
    }
    return tailChildren;
  }
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
    endElement(context);
    for(OdfElement node:pList)
    {
      parent.appendChild(node);
      if(node instanceof TableNamedExpressionsElement)
        OdfElementConvertorFactory.getInstance().getConvertor(node.getNodeName()).convert(context,mXmlWriter, node, parent);
      else
      {
        PreserveConvertorFactory.getInstance().getConvertor(node.getNodeName()).convert(context, mXmlWriter, node, parent);
      }
    }
  }  
}
