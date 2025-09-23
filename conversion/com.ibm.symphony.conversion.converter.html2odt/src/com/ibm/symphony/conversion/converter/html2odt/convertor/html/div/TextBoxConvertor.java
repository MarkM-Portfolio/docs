package com.ibm.symphony.conversion.converter.html2odt.convertor.html.div;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.w3c.dom.Element;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.BodyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.DIVConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class TextBoxConvertor extends DIVConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if( odfElement == null)
    {
      odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.DRAW_TEXT_BOX));
      indexTable.addEntryByHtmlNode(htmlElement, odfElement);
      convertAttributes(context, htmlElement, parent, odfElement);
    }
    parent.appendChild(odfElement);
    String type = (String) htmlElement.getAttribute("_type");
    if( type != null && type.indexOf(HtmlCSSConstants.TOPDIV) != -1)
    {
      BodyConvertor.stripRedundantDiv(context, htmlElement);
    }
    convertChildren(context, htmlElement, odfElement);

  }
  
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement parent, OdfElement odfElement)
  {
    String className = htmlElement.getAttribute(HtmlCSSConstants.CLASS);
    int index = className.indexOf(" textbox");
    if(index != -1)
      ((OdfStylableElement)parent).setStyleName(className.substring(0, index));
    
    Map<String, String> cssMap = ConvertUtil.buildCSSMap(htmlElement.getAttribute(HtmlCSSConstants.STYLE));
    CSSUtil.updateHeightWidth(cssMap);
    JSONObject htmlMap = XMLConvertorUtil.getHtmlTextMap();
    Iterator<Entry<String, String>> it = cssMap.entrySet().iterator();
    while (it.hasNext())
    {
      Entry<String, String> entry = it.next();
      String key = entry.getKey();
      String value = entry.getValue();
      String odfKey = (String) htmlMap.get(key);
      String odfValue = value;
      
      if (key.equals(HtmlCSSConstants.WIDTH) || key.equals(HtmlCSSConstants.HEIGHT) || key.equals(HtmlCSSConstants.TOP)
          || key.equals(HtmlCSSConstants.LEFT) || key.equals(HtmlCSSConstants.ZINDEX))
      {
        if (value.endsWith("px"))
          odfValue = CSSUtil.convertPXToIN(value);
        parent.setOdfAttributeValue(ConvertUtil.getOdfName(odfKey), odfValue);
      }
    }
  }

}
