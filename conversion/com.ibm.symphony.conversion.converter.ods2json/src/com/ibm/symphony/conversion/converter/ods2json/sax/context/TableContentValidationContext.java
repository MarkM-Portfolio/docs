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

import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class TableContentValidationContext extends GeneralContext
{
	  private static final Logger LOG = Logger.getLogger(TableDataRangeContext.class.getName());
	  
	  boolean needPreserved = false;
	  
	  public TableContentValidationContext(XMLImport importer, String uri, String localName, String qName, Object target)
	  {
		    super(importer, uri, localName, qName, target);
		    needPreserved = false;
	  }
	  
	  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
		    GeneralContext context = null;
		    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
		    switch(name){
		      case TABLE_HELP_MESSAGE :
		        context = new TableHelpMessageContext(mImport, uri, localName, qName, mTarget);
		        break;
		      case TABLE_ERROR_MESSAGE :
			        context = new TableErrorMessageContext(mImport, uri, localName, qName, mTarget);
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
		    ConversionUtil.Validation validation = new ConversionUtil.Validation();
		    this.mTarget = validation;
		    try
		    {
		    	String name = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_NAME);
		    	validation.name = name;
		    	
		    	String condition = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_CONDITION);
		    	if(condition != null)
		    		validation.setCondition(condition);
		    	//
		    	String value1 = validation.value1;
		    	String value2 = validation.value2;
		    	if(validation.type == ConversionConstant.TYPE_LIST)
		    	{
		    		if(ConversionUtil.hasValue(value1) && value1.charAt(0) != '"')
		    		{
		    			validation.value1 = ODSConvertUtil.convertFormula(value1, true);
		    			validation.isValue1F = true;
		    		}
		    	}else
		    	{
		    		if(ConversionUtil.hasValue(value1))// && value1.contains("["))
		    		{
		    			validation.value1 = ODSConvertUtil.convertFormula(value1, true);
		    			validation.isValue1F = true;
		    		}
		    		if(ConversionUtil.hasValue(value2))// && value2.contains("["))
		    		{
		    			validation.value2 = ODSConvertUtil.convertFormula(value2, true);
		    			validation.isValue2F = true;
		    		}
		    	}
		    	
		    	String allowEmptyStr = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_ALLOW_EMPTY_CELL);
		    	boolean allowEmpty = (allowEmptyStr == null) ? true : Boolean.valueOf(allowEmptyStr);
		    	validation.allowBlank = allowEmpty;
		    	
		    	String displayList = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_DISPLAY_LIST);
		    	boolean showDropDown = (displayList == null) ? true : !displayList.equals("no");
		    	validation.showDropDown = showDropDown;
		    	
		    	if(showDropDown && displayList != null)
		    		validation.displayList = displayList;
		    	
		    	String baseAddress = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_BASE_CELL_ADDRESS);
		    	if(baseAddress != null)
		    		validation.baseAddress = baseAddress;
		    	
		    	document.validationMap.put(name, validation);
		    }
		    catch (Exception e)
		    {
		      LOG.log(Level.WARNING, "cell name range is invalid", e);
		    }
	  }
	  
	  public void endElement()
	  {
	  }
	  
}
