package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.ArrayList;
import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionElement;
import org.odftoolkit.odfdom.dom.element.table.TableShapesElement;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class TableShapesConvertor extends GeneralConvertor
{
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    TableShapesElement element = new TableShapesElement(contentDocument);
    return element;
  }
  
  protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
  {
//    super.convertChildren(context,mXmlWriter,null,element);
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Sheet sheet = (Sheet) context.get("Sheet");
    if(element == null)
      return;
    List<Range> rangeList = index.getImageByContainerId(sheet.sheetId);
    if(rangeList == null)
      return;
    int length = rangeList.size();
    for( int  i = 0; i < length; i++ )
    {
      Range range = rangeList.get(i);
      
      if(range instanceof DrawFrameRange && ConversionUtil.hasValue(((DrawFrameRange)range).link))
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_DRAW_A).convert(context,mXmlWriter, range, element);
      else
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_DRAW_FRAME).convert(context,mXmlWriter, range, element);
    }
    
  }
  
  protected List<OdfElement> removeChildren(ConversionContext context,TransformerHandler mXmlWriter, OdfElement element)
  {
    //remove the children has been deleted
    if(element == null)
      return null;
    List<OdfElement> oldChildren = new ArrayList<OdfElement>();
    NodeList children = element.getChildNodes();
    
    int length = children.getLength();
    for( int i = 0 ;i < length; i++)
    {
      OdfElement child = (OdfElement)element.getFirstChild();
      OdfElement odfNode = (OdfElement) element.removeChild(child);
      oldChildren.add(odfNode);
    }
    int size = oldChildren.size();
    for(int i = 0; i < size; i++ )
    {
      OdfElement odfNode = oldChildren.get(i);
      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
      if((xmlId != null && !"".equals(xmlId)) || isNonPreserve(odfNode))
      {
        continue;
      }
      element.appendChild(odfNode);
      PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).convert(context,mXmlWriter, odfNode, element);
    }
    return null;
  }
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
  }
  
}
