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

import java.util.logging.Level;

import java.util.logging.Logger;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;

public class NamedRangeContext extends GeneralContext
{
  private static final Logger LOG = Logger.getLogger(NamedRangeContext.class.getName());

  public NamedRangeContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }
  // When we support name range, then enable the following code,
  // and remove "table:named-range" in preserve_name.json
  public void startElement(AttributesImpl attrs)
  {
    super.startElement(attrs);
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    ConversionUtil.Range nameCellRange = new ConversionUtil.Range();
    try
    {
      String cellRangeName = this.getAttrValue("table:name");
      nameCellRange.rangeId = ConversionUtil.hasValue(cellRangeName) ? cellRangeName : ("NameId" + info.nameRangeIndex);

      String cellRange = this.getAttrValue("table:cell-range-address");
      ReferenceParser.ParsedRef ref = ReferenceParser.parse(cellRange);
      nameCellRange.address = cellRange;
      ConversionUtil.setCellRangeByToken(nameCellRange, ref, document, null);

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "cell name range is invalid", e);
    }
    nameCellRange.usage = ConversionUtil.RangeType.NAMES;
    
    document.nameList.add(nameCellRange);
  }
}
