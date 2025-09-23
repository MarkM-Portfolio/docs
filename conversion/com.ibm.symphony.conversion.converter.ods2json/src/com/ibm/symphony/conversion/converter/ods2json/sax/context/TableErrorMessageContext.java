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
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class TableErrorMessageContext extends GeneralContext
{
	  private static final Logger LOG = Logger.getLogger(TableDataRangeContext.class.getName());
	  
	  boolean needPreserved = false;
	  
	  public TableErrorMessageContext(XMLImport importer, String uri, String localName, String qName, Object target)
	  {
		    super(importer, uri, localName, qName, target);
		    needPreserved = false;
	  }
	  
	  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
		    GeneralContext context = null;
		    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
		    switch(name){
		    case TEXT_P :
		    	context = new TextPContext(mImport, uri, localName, qName, mTarget);
		    	break;
		      default:
		        context =  new GeneralContext(mImport, uri, localName, qName, mTarget);
		    }
		    return context;
	  }
	
	  public void startElement(AttributesImpl attrs)
	  {
	        mAttrs = attrs;
	    	mbChildPreserve = true;
		    ConversionUtil.Validation validation = (ConversionUtil.Validation)mTarget;
		    try
		    {
		    	String title = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_TITLE);
		    	validation.errorTitle = title;
		    	
		    	String msgType = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_MESSAGE_TYPE);
		    	validation.errorStyle = msgType;
		    	
		    	String displayStr = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_DISPLAY);
		    	boolean display = (displayStr == null) ? true : Boolean.valueOf(displayStr);
		    	validation.showErrorMsg = display;
		    }
		    catch (Exception e)
		    {
		      LOG.log(Level.WARNING, "cell name range is invalid", e);
		    }
	  }
	  
	  public void endElement()
	  {
		  ConversionUtil.Validation validation = (ConversionUtil.Validation)mTarget;
		  int length = this.mChildConvertors.size();
		  StringBuilder buf = new StringBuilder();
		  for (int i = 0; i < length; i++)
		  {
		      GeneralContext conv = mChildConvertors.get(i);
		      if (conv instanceof TextPContext)
		      {
		    	  TextPContext pContext = (TextPContext) conv;
		          buf.append(pContext.getText());
		      }
	      }
		  String value = buf.toString();
	      if (value.endsWith("\n"))
	      {
	        int end = value.lastIndexOf("\n");
	        value = value.substring(0, end);
	      }
	      validation.error = value;
	  }
}
