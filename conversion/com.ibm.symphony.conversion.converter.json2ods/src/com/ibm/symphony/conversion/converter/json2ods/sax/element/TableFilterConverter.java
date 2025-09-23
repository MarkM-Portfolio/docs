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

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.table.TableDatabaseRangeElement;
import org.odftoolkit.odfdom.dom.element.table.TableDatabaseRangesElement;
import org.odftoolkit.odfdom.dom.element.table.TableFilterConditionElement;
import org.odftoolkit.odfdom.dom.element.table.TableFilterElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionsElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class TableFilterConverter extends GeneralConvertor
{
  public void convertChildren(ConversionContext context, TransformerHandler mXmlWriter, Object input, OdfElement element)
  {
    OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_FILTER_CONDITION)
        .convert(context, mXmlWriter, input, element);
  }

  protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");

    TableFilterElement element = new TableFilterElement(contentDom);
    return element;
  }
}