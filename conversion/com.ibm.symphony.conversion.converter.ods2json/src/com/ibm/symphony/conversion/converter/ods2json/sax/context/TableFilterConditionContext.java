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


import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;

public class TableFilterConditionContext extends GeneralContext
{
  private static final Logger LOG = Logger.getLogger(TableFilterConditionContext.class.getName());

  public TableFilterConditionContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public void startElement(AttributesImpl attrs)
  {
    super.startElement(attrs);
  }
  
  //inherit from GeneralContext
  public ParsedRef generatePreserveRef(String address, String attrName)
  {
    ParsedRef ref = null;
    String attrValue = null;
    try
    {
      GeneralContext pContext = this.getParentConvertor();
      while(pContext != null && !(pContext instanceof TableDataRangeContext))
      {
        pContext = pContext.getParentConvertor();
      }
        if (pContext != null && (pContext instanceof TableDataRangeContext))
        {
          TableDataRangeContext rangeContext = (TableDataRangeContext) pContext;
          if (rangeContext.needPreserved)
          {
            attrValue = this.getAttrValue(attrName);
            if (attrName.equalsIgnoreCase("table:field-number"))
            {
              int index = Integer.parseInt(attrValue);
              String rangeAddr = pContext.getAttrValue("table:target-range-address");
              ParsedRef rangeRef = ReferenceParser.parse(rangeAddr);
              if(rangeRef != null)
              {
                //change the column of rangeRef as ref of table:filter-condition
                int rangeStartCol = ReferenceParser.translateCol(rangeRef.startCol);
                rangeRef.startCol = ReferenceParser.translateCol(rangeStartCol + index);
                rangeRef.endCol = rangeRef.startCol;
                ref = rangeRef;
              }else
                return null;
            }
            else
            {
              LOG.log(Level.WARNING, "should deal with the \"{0}\" attribute for <table:filter-condition>", attrName);
            }
          }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "the value of \"{0}\" attribute for <table:filter-condition> is {1} which is not an integer", 
          new Object[]{attrName, attrValue});
    }
    finally
    {
      return ref;
    }
  }
}
