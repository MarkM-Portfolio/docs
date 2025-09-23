package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableContentValidationElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class ContentValidationConvertor extends GeneralConvertor {

	private static final Logger LOG = Logger.getLogger(ContentValidationConvertor.class.getName());
	
	 protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
	  {
	    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
	    try
	    {
	      TableContentValidationElement tableElement = new TableContentValidationElement(contentDocument);
	      return tableElement;
	    }
	    catch (Exception e)
	    {
	      LOG.log(Level.WARNING, "can not create a content validation ", e);
	    }
	    return null;
	  }
	 
	 protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
	 {
		  ConversionUtil.Validation vld = (ConversionUtil.Validation) input;
		  OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_ERROR_MESSAGE).convert(context, mXmlWriter ,vld, element);
		  if(vld.showInputMsg || vld.prompt.length() > 0 || vld.promptTitle.length() > 0)
		  {
			  OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HELP_MESSAGE).convert(context, mXmlWriter ,vld, element);
		  }
	 }
	 
	  protected void setAttributes(ConversionContext context, Object input, OdfElement element)
	  {
		TableContentValidationElement vElement = (TableContentValidationElement) target;
		ConversionUtil.Validation vld = (ConversionUtil.Validation) input;
		
		vElement.setTableNameAttribute(vld.name);
		
		String baseCellAddr = vld.getBassAddress();
		vElement.setTableBaseCellAddressAttribute(baseCellAddr);
		vElement.setTableAllowEmptyCellAttribute(vld.allowBlank);
		vElement.setTableConditionAttribute(vld.getCondition());
		if(vld.type.equalsIgnoreCase("list"))
		{
			if(vld.showDropDown == false)
				vElement.setTableDisplayListAttribute("no");
			else
			{
				if(vld.displayList.length() > 0)
					vElement.setTableDisplayListAttribute(vld.displayList);
				else
					vElement.setTableDisplayListAttribute("unsorted");
			}
		}
	  }
}
