/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import java.util.ArrayList;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.PreserveManager;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;

public class TableRowGroupContext extends GeneralContext
{

  public TableRowGroupContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }

  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case TABLE_TABLE_ROW :
        context = new TableRowContext(mImport, uri, localName, qName, mTarget);
        break;
      case TABLE_TABLE_HEADER_ROWS :
      case TABLE_TABLE_ROWS :
      case TABLE_TABLE_ROW_GROUP :
        context = new TableRowGroupContext(mImport, uri, localName, qName, mTarget);
        break;
    }
    return context;
  }
  
  public void preserveChild(ConversionContext context, ArrayList<GeneralContext> childConvertor)
  {
    PreserveManager manager = (PreserveManager) mContext.get("PreserveManager");
    int cnt = childConvertor.size();
    if (cnt < 1)
      return;
    int loop = 0;
    // get the start and end column range
    while (loop < 2)
    {
      int index = 0;
      if (loop != 0){
        index = cnt - 1;
        if(index == 0)
          break;//only one child
      }
      GeneralContext convertor = childConvertor.get(index);
      Object child = convertor.getTarget();
      if (child != null && child instanceof ConversionUtil.Row)
      {
        ParsedRef ref = this.getRowRef(context, (ConversionUtil.Row) child);
        manager.addChildRange(context, this, ref);
      }
      loop++;
    }
  }
  
  public ParsedRef getRowRef(ConversionContext context, ConversionUtil.Row row)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    String sheetName = sheet.sheetName;
    ReferenceParser.ParsedRefType  type = null;
    String sRow = null;
    String eRow = null;
    type = ReferenceParser.ParsedRefType.ROW;
    sRow = ReferenceParser.translateRow(row.rowIndex + 1);
    if(row.repeatedNum > 0){
      eRow = ReferenceParser.translateRow(row.rowIndex + 1 + row.repeatedNum);
    }
    ParsedRef ref = new ParsedRef(sheetName, sRow, null, null, eRow, null, type, 0);
    return ref;
  }
}
