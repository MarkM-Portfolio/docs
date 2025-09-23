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
import org.odftoolkit.odfdom.dom.element.table.TableFilterElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionsElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class TableDataRangesConverter extends GeneralConvertor
{
  public void convertChildren(ConversionContext context, TransformerHandler mXmlWriter, Object input, OdfElement element)
  {
    TableDatabaseRangesElement obj = (TableDatabaseRangesElement) target;
    Document doc = (Document) context.get("Source");
    int nlength = doc.unnameList.size();

    for (int i = 0; i < nlength; i++)
    {
      // check if preserved range overlap the filter range
      ConversionUtil.Range range = (ConversionUtil.Range) doc.unnameList.get(i);
      if (range != null && range.usage == RangeType.FILTER)
      {
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE)
            .convert(context, mXmlWriter, range, element);
      }
    }

  }

  protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    OdfFileDom contentDom = (OdfFileDom) index.getDocuemnt();
    Element element = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES),ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES);
    return (OdfElement) element;
  }
}