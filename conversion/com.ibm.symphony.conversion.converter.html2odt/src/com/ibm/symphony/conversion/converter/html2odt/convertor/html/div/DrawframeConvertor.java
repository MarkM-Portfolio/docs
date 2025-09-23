package com.ibm.symphony.conversion.converter.html2odt.convertor.html.div;

import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.convertor.html.DIVConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class DrawframeConvertor extends DIVConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    List<OdfElement> odfElements = indexTable.getOdfNodes(htmlElement);
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if( odfElement == null)
    {
      odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName("draw:frame"));
      indexTable.addEntryByHtmlNode(htmlElement, odfElement);
    }
    XMLConvertorUtil.appendDrawFrame(context, odfElement, parent);
    
    //convertAttributes(context, htmlElement, odfElement);

    convertChildren(context, htmlElement, odfElement);

  }

}
