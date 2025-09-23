/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.text.TextDateElement;
import org.odftoolkit.odfdom.dom.element.text.TextTimeElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class DateTimeConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");
    Element htmlNode = HtmlConvertorUtil.createHtmlElementWithForceId(context, element, HtmlCSSConstants.SPAN);
    HtmlConvertorUtil.setAttribute(htmlNode,"_src", ODFConstants.TEXT_DATE,false);
    parent.appendChild(htmlNode);
    convertAttributes(context, element, htmlNode);
    HtmlConvertorUtil.addIdToParentSpan(context, element, parent);
    HtmlConvertorUtil.convertChildren(context, element, htmlNode);
  }

  private void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    boolean isDate = false;
    if (element.getNodeName().equals(ODFConstants.TEXT_DATE))
      isDate = true;

    String dateTimeValue = getDateTimeValue(element, isDate);
    String dateTimeStyle = "DT_STYLE_" + getDateTimeStyle(element, isDate);
    String dateTimeType = "DT_TYPE_date";
    if (!isDate)
      dateTimeType = "DT_TYPE_time";

    HtmlConvertorUtil.setAttribute(htmlNode,"datetime", dateTimeValue);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CONTENT_EDITABLE, "false",false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.UNSELECTABLE, "on",false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, "ODT_DT " + dateTimeStyle + " " + dateTimeType);
    
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
  }

  private String getDateTimeValue(OdfElement element, boolean isDate)
  {
    if (isDate)
      return ((TextDateElement) element).getTextDateValueAttribute();
    else
      return ((TextTimeElement) element).getTextTimeValueAttribute();
  }

  private String getDateTimeStyle(OdfElement element, boolean isDate)
  {
    String odfDateStyleName = null;
    if (isDate)
    {
      odfDateStyleName = ((TextDateElement) element).getStyleDataStyleNameAttribute();
    }
    else
    {
      odfDateStyleName = ((TextTimeElement) element).getStyleDataStyleNameAttribute();
    }

    return odfDateStyleName;
  }


}
