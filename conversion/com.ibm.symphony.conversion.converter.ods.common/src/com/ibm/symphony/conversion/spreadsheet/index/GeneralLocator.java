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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class GeneralLocator implements ILocator
{

  protected Object target;
  protected OdfElement element;
  protected String styleId;
  
  protected void startElement(ConversionContext localtorContext,Object output)
  {
    
  }
  
  public void traverse(ConversionContext localtorContext, Object input, Object output)
  {
    HashMap<String, Node> idNodeMap = (HashMap<String, Node>) localtorContext.get("idNodeMap");
    HashMap<String, List<String>> styleNameMap = (HashMap<String,List<String>>) localtorContext.get("styleNameMap");
    target = output;
    if(input instanceof Text)
      return;
    element = (OdfElement)input;
    
    this.startElement(localtorContext,output);
    String id = element.getAttribute(IndexUtil.ID_STRING);
    if (!id.equals(""))
      idNodeMap.put(id, element);
    String styleName = element.getAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
    String styleId = getStyleId();
    if(null != styleId && !"".equals(styleId) && !"".equals(styleName))
    {
      List<String> styleList = styleNameMap.get(styleId);
      if( styleList == null )
        styleList = new ArrayList<String>();
      styleList.add(styleName);
      styleNameMap.put(styleId,styleList );
    }
    this.traverseChildren(localtorContext);
    this.endElement(localtorContext);
  }
  
  protected void endElement(ConversionContext localtorContext)
  {
    
  }

  protected Object getTarget()
  {
    return target;
  }
  
  protected String getStyleId()
  {
    return styleId;
  }
  
  protected void traverseChildren(ConversionContext localtorContext)
  {
    NodeList list = element.getChildNodes();
    int length = list.getLength();
    for (int i = 0; i < length; i++)
    {
      Node child = list.item(i);
      ILocator convertor = OdsNodeLocatorFactory.getInstance().getLocator(child);
      convertor.traverse(localtorContext, child, target);
    }
  }

}
