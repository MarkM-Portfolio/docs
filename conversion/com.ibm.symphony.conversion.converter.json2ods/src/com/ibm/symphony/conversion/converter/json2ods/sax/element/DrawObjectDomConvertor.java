package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.draw.DrawObjectElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;

public class DrawObjectDomConvertor extends GeneralConvertor {
	private Object parentInput;

	protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent) 
	{
		OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
		DrawObjectElement element = new DrawObjectElement(contentDocument);
		element.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_TYPE), "simple");
		element.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_SHOW), "embed");
		element.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_ACTUATE), "onLoad");
		return element;

	}

	public void setInput(Object input) 
	{
		this.parentInput = input;
	}

	protected void setAttributes(ConversionContext context, Object input, OdfElement element)
	{
		if (parentInput instanceof DrawFrameRange) 
		{
			DrawFrameRange range = (DrawFrameRange) parentInput;
			String src = "./" + range.rangeId;
			((DrawObjectElement)element).setXlinkHrefAttribute(src);
		}
	}

	protected void convertChildren(ConversionContext context, TransformerHandler mXmlWriter, Object input, OdfElement element) 
	{

	}

	protected void appendElement(ConversionContext context,	TransformerHandler mXmlWriter, List<OdfElement> pList, OdfElement parent)
	{
	}
}