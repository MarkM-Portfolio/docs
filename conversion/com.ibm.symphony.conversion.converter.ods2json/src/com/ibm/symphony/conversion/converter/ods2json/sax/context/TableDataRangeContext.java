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
import java.util.logging.Level;
import java.util.logging.Logger;

import org.xml.sax.helpers.AttributesImpl;



import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;

public class TableDataRangeContext extends GeneralContext
{
	  private static final Logger LOG = Logger.getLogger(TableDataRangeContext.class.getName());
	  
	  boolean needPreserved = false;
	  
	  public TableDataRangeContext(XMLImport importer, String uri, String localName, String qName, Object target)
	  {
		    super(importer, uri, localName, qName, target);
		    needPreserved = false;
	  }
	  
	  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
		    GeneralContext context = null;
		    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
		    switch(name){
		      case TABLE_TABLE_FILTER :
		        context = new TableFilterContext(mImport, uri, localName, qName, mTarget);
		        break;
		      default:
		        context =  new GeneralContext(mImport, uri, localName, qName, mTarget);
		    }
		    return context;
	  }
	
	  public void startElement(AttributesImpl attrs)
	  {
	        mAttrs = attrs;		    
		    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
		    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
		    ConversionUtil.UnNameRange filterRange = new ConversionUtil.UnNameRange();
		    
		    try
		    {
		      String address = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_TARGET_RAGNE_ADDRESS);
		      String displaystate = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_DISPALY_FILTER_BUTTONS);
		      filterRange.rangeId = ConversionConstant.UNNAME_RANGE + document.unnameList.size();
		      ReferenceParser.ParsedRef ref = ReferenceParser.parse(address);
		      int startRow = Integer.parseInt(ref.getStartRow().toString());
		      int endRow = Integer.parseInt(ref.getEndRow().toString());
		      
		      //TODO [tag:filter], just for column-based filter
		      if ("true".equalsIgnoreCase(displaystate) )
		      {
		          String sheetName = ref.getSheetName();
		          ConversionUtil.Sheet sheet = null;
		          for(int i=0;i<document.sheetList.size();i++)
		          {
		            ConversionUtil.Sheet sh = document.sheetList.get(i);
		            if(sheetName.equals(sh.sheetName))
		            {
		              sheet = sh;
		              break;
		            }
		          }
		          //for column filter do not need so much rigid for endRow
		          if( sheet!=null)
		          {
		              ref.type = ReferenceParser.ParsedRefType.RANGE;
		              ref.patternMask &= ~ReferenceParser.END_SHEET;
		              filterRange.address = ref.toString();
	                  ConversionUtil.setCellRangeByToken(filterRange, ref, document, null);
	                  filterRange.usage = ConversionUtil.RangeType.FILTER;
	                  filterRange.data.put(ConversionConstant.ORIGINAL_ODS_FILTER , true);
	                  document.unnameList.add(filterRange);
	                  this.addIdOnOdfElement(filterRange.rangeId);
		          }
		          else
		            needPreserved = true;
		      }
		      else
			      needPreserved = true;
		    }
		    catch (Exception e)
		    {
		      LOG.log(Level.WARNING, "cell name range is invalid", e);
		    }
		    if(needPreserved)
		    {
		      super.startElement(attrs);
		    }
	  }
	  
	  public void endElement()
	  {
		  if (needPreserved){
			  endPreserve();
		  }
	  }
	  
}
