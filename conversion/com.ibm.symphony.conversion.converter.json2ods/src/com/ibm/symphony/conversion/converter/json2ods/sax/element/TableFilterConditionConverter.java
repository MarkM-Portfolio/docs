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

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableFilterConditionElement;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TableFilterConditionConverter extends GeneralConvertor
{
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    TableFilterConditionElement obj = (TableFilterConditionElement)target;
    JSONObject data = (JSONObject)input;

    if (data != null){
        obj.setTableFieldNumberAttribute(0);
        JSONArray values = (JSONArray)data.get("values");
        obj.setTableValueAttribute("");
        Object op = data.get("op");
        obj.setTableOperatorAttribute((op!=null)?op.toString():"=");            
    }
  }
  
  public void convertChildren(ConversionContext context, Object input, OdfElement element)
  {

  }

  protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");

    TableFilterConditionElement element = new TableFilterConditionElement(contentDom);
    return element;
  }
}