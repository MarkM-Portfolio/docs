package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;

public class DrawImageDomConvertor extends GeneralConvertor
{
  private Object parentInput;
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    DrawImageElement element = new DrawImageElement(contentDocument);
    element.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_TYPE), "simple");
    element.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_SHOW), "embed");
    element.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_ACTUATE), "onLoad");
    return element;
  }
  
  public void setInput(Object input)
  {
    this.parentInput = input;
  }
  
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    if(parentInput instanceof DrawFrameRange)
    {
      DrawFrameRange range = (DrawFrameRange)parentInput;
      String src = range.href;
      if(range.usage==RangeType.CHART_AS_IMAGE)
	  {
		  int idx = src.lastIndexOf("/");
		  String objName = src.substring(idx+1);
		  idx = objName.lastIndexOf(".");
		  objName = objName.substring(0,idx);
		  src = "./ObjectReplacements/" + objName;
	  }
      if(src.startsWith(ConversionConstant.DIR_PIC_PREFIX))
      {
        src = ODSConvertUtil.saveImageSrcName(context,src);
      }
      ((DrawImageElement)element).setXlinkHrefAttribute( src );
    }
  }

  protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
  {

  }
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
  }
  
}
