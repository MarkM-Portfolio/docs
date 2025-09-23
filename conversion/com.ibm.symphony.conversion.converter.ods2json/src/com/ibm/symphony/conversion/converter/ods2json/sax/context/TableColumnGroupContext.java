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

import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.PreserveManager;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;

public class TableColumnGroupContext extends GeneralContext
{

  public TableColumnGroupContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }

  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case TABLE_TABLE_COLUMN :
        context = new TableColumnContext(mImport, uri, localName, qName, mTarget);
        break;
      case TABLE_TABLE_HEADER_COLUMNS :
      case TABLE_TABLE_COLUMNS :
      case TABLE_TABLE_COLUMN_GROUP :
        context = new TableColumnGroupContext(mImport, uri, localName, qName, mTarget);
        break;
      default:
        context = new GeneralContext(mImport, uri, localName, qName, mTarget);
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
          break;
      }
      GeneralContext convertor = childConvertor.get(index);
      Object child = convertor.getTarget();
      if (child != null && child instanceof ConversionUtil.Column)
      {
        ParsedRef ref = this.getColRef(context, (ConversionUtil.Column) child);
        manager.addChildRange(context, this, ref);
      }
      loop++;
    }
  }

  public ParsedRef getColRef(ConversionContext context, ConversionUtil.Column col)
  {
    ContextInfo info = (ContextInfo) context.get("TableInfo");
    Sheet sheet = (Sheet) context.get("Sheet");
    String sheetName = sheet.sheetName;
    ReferenceParser.ParsedRefType type = null;
    String sCol = null;
    String eCol = null;
    type = ReferenceParser.ParsedRefType.COLUMN;
    sCol = ReferenceParser.translateCol(col.columnIndex + 1);
    if (col.repeatedNum > 0)
    {
      eCol = ReferenceParser.translateCol(col.columnIndex + 1 + col.repeatedNum);
    }
    ParsedRef ref = new ParsedRef(sheetName, null, sCol, null, null, eCol, type, 0);
    return ref;
  }

}
