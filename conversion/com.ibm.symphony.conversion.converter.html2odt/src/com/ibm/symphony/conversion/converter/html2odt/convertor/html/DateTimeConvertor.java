/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import java.util.Iterator;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;

import org.odftoolkit.odfdom.doc.number.OdfNumberDateStyle;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.dom.element.text.TextDateElement;
import org.odftoolkit.odfdom.dom.element.text.TextTimeElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class DateTimeConvertor extends GeneralFieldsConvertor
{

  @Override
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    if (!htmlElement.hasChildNodes())
      return null;

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      parent.appendChild(odfElement);
      return odfElement;
    }
    else
    {
      // New Date and Time Element
      return convertNewElement(context, htmlElement, indexTable, parent);
    }
  }

  private OdfElement convertNewElement(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, OdfElement parent)
  {
    try
    {
      OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);

      String odfNodeName = null;

      String styleName = null;
      String type = null;

      Iterator<String> classes = XMLConvertorUtil.getClassNameList(htmlElement).iterator();
      while (classes.hasNext())
      {
        String className = classes.next();
        if (className.startsWith(Constants.DATE_TIME_STYLE_PREFIX))
          styleName = className.substring(Constants.DATE_TIME_STYLE_PREFIX.length());
        else if (className.startsWith(Constants.DATE_TIME_TYPE_PREFIX))
          type = className.substring(Constants.DATE_TIME_TYPE_PREFIX.length());
      }

      if (type != null)
      {
        if (type.equals("date"))
        {
          odfNodeName = ODFConstants.TEXT_DATE;
        }
        else if (type.equals("time"))
        {
          odfNodeName = ODFConstants.TEXT_TIME;
        }
        else if (type.equals("dateTime"))
        {
          odfNodeName = ODFConstants.TEXT_TIME;
        }
      }

      if (odfNodeName != null)
      {
        OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(odfNodeName));
        indexTable.addEntryByHtmlNode(htmlElement, odfElement);
        parent.appendChild(odfElement);

        parseDateTimeAttr(context, htmlElement, odfElement, styleName);

        return odfElement;
      }
      else
      {
        OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_SPAN));
        parent.appendChild(odfElement);
        return odfElement;
      }
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
    }

    return null;
  }

  private void parseDateTimeAttr(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName)
  {
    try
    {
      if (styleName == null)// concord created date time.
      {
        OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
        OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();

        OdfNumberDateStyle dateStyle = null;

        styleName = CSSUtil.getStyleName(null, "DT");
        String[] langArr = htmlElement.getAttribute(Constants.DATE_TIME_FORMAT_LANG).split("-");
        String format = getFormat(htmlElement.getAttribute(Constants.DATE_TIME_FORMAT_CODE), langArr[0]);

        dateStyle = new OdfNumberDateStyle(contentDom);
        dateStyle.buildFromFormat(format);

        dateStyle.setStyleNameAttribute(styleName);
        dateStyle.setNumberLanguageAttribute(langArr[0]);
        if (langArr.length > 1)
          dateStyle.setNumberCountryAttribute(langArr[1].toUpperCase());

        if (format.indexOf("NNNN ,") != 0)
          dateStyle.setNumberAutomaticOrderAttribute(true);

        dateStyle.removeAttribute("number:format-source");
        autoStyles.appendChild(dateStyle);
      }

      if (odfElement.getNodeName().equals(ODFConstants.TEXT_DATE))
      {
        TextDateElement dateElement = (TextDateElement) odfElement;
        dateElement.setTextFixedAttribute(true);
        dateElement.setTextDateValueAttribute(htmlElement.getAttribute(Constants.DATE_TIME_VALUE));

        dateElement.setStyleDataStyleNameAttribute(styleName);

      }
      else
      {
        TextTimeElement timeElement = (TextTimeElement) odfElement;
        timeElement.setTextTimeValueAttribute(htmlElement.getAttribute(Constants.DATE_TIME_VALUE));
        timeElement.setTextFixedAttribute(true);

        timeElement.setStyleDataStyleNameAttribute(styleName);

      }
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
    }

  }

  private String getFormat(String format, String language)
  {
    format = format.toUpperCase();
    format = format.replace("%20", " ");
    if (format.indexOf("Y") >= 0 && format.indexOf("Y") == format.lastIndexOf("Y"))
      format = format.replace("Y", "YYYY");

    if (format.indexOf("H") >= 0 && format.indexOf("H") == format.lastIndexOf("H"))
      format = format.replace("H", "HH");

    if (format.indexOf("EEEE,") == 0)
      format = "NNNN ," + format.substring(5);
    else
      format = format.replace("EEEE", "NNNN");

    format = format.replace("A", "a");
    format = format.replace("Z", "");

    return format.trim();
  }

}
