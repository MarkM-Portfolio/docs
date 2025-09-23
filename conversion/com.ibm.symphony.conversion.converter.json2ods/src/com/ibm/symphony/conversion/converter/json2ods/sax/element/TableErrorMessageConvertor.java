package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableErrorMessageElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class TableErrorMessageConvertor extends GeneralConvertor{
	
	private static final Logger LOG = Logger.getLogger(TableErrorMessageConvertor.class.getName());
	
	protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
	{
	    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
	    try
	    {
	    	TableErrorMessageElement tableElement = new TableErrorMessageElement(contentDocument);
	        return tableElement;
	    }
	    catch (Exception e)
	    {
	      LOG.log(Level.WARNING, "can not create a named range", e);
	    }
	    return null;
	}

	
	 protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
	 {
		try{
			TableErrorMessageElement vElement = (TableErrorMessageElement) target;
			ConversionUtil.Validation vld = (ConversionUtil.Validation) input;
			if(vld.error.length() > 0)
			{
			   String[] paraArray = vld.error.split("\n");
		       for(int i=0;i<paraArray.length;i++){
		    	 mXmlWriter.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
		         String str = ODSConvertUtil.escapeXML(paraArray[i]);
		         char[] text = str.toCharArray();
		         mXmlWriter.characters(text, 0, text.length);
		         mXmlWriter.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
		       }
			}
		}catch(Exception e)
		{
			e.printStackTrace();
		}
	 }
	 
	 protected void setAttributes(ConversionContext context, Object input, OdfElement element)
	 {
		TableErrorMessageElement vElement = (TableErrorMessageElement) target;
		ConversionUtil.Validation vld = (ConversionUtil.Validation) input;
		
		vElement.setTableDisplayAttribute(vld.showErrorMsg);
		vElement.setTableMessageTypeAttribute(vld.errorStyle);
		if(vld.errorTitle.length() > 0)
			vElement.setTableTitleAttribute(vld.errorTitle);
	 }

}
