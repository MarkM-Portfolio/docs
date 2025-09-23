/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2pdf;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Element;

import symphony.org.w3c.tidy.Tidy;

public class HTML2PDFUtil
{
  /*
   * TODO : While header footer contains too many content, It will cover the content of document. So We need to calculate the correct height
   * of header footer
   */
  private static final Logger log = Logger.getLogger(HTML2PDFUtil.class.getName());

  public static String LINE_SEPARATOR = System.getProperty("line.separator");

  public static String generateCssMarginStr(Map map)
  {
    StringBuffer ret = new StringBuffer("margin: ");
    Float top = getFloat(map.get("top"));
    Float headerHeight = new Float(0);
    if (map.containsKey("HH"))
      headerHeight = getFloat(map.get("HH"));
    ret.append(Float.toString(top + headerHeight) + "mm");
    ret.append(" ");
    ret.append(formatString(map.get("right")));
    ret.append(" ");
    Float bottom = getFloat(map.get("bottom"));
    Float footerHeight = new Float(0);
    if (map.containsKey("FH"))
      footerHeight = getFloat(map.get("FH"));
    ret.append(Float.toString(bottom + footerHeight) + "mm");
    ret.append(" ");
    ret.append(formatString(map.get("left")));
    ret.append(";");
    return ret.toString();
  }

  public static String generateCssForFirstPage(Map map)
  {
    StringBuffer ret = new StringBuffer("margin: ");
    Float top = getFloat(map.get("top"));
    if (generateBoolean(map, "header"))
    {
      Float headerHeight = getFloat(map.get("HH"));
      ret.append(Float.toString(top + headerHeight) + "mm");
    }
    else
      ret.append(Float.toString(top) + "mm");
    ret.append(" ");
    ret.append(formatString(map.get("right")));
    ret.append(" ");
    Float bottom = getFloat(map.get("bottom"));
    if (generateBoolean(map, "footer"))
    {
      Float footerHeight = getFloat(map.get("FH"));
      ret.append(Float.toString(bottom + footerHeight) + "mm");
    }
    else
      ret.append(Float.toString(bottom) + "mm");
    ret.append(" ");
    ret.append(formatString(map.get("left")));
    ret.append(";");
    return ret.toString();
  }

  public static String generateCssSizeStr(Map map)
  {
    StringBuffer ret = new StringBuffer("size: ");
    ret.append(formatString(map.get("width")));
    ret.append(" ");
    ret.append(formatString(map.get("height")));
    ret.append(";");
    ret.append("padding-top:2mm;");
    return ret.toString();
  }

  public static String generateCssStr(Map map, String headerStr, String footerStr)
  {
    String start = "<html><head>" + "<style type=\"text/css\" media=\"all\">" + " p{ " + "margin:0px; " + "padding:0px;" + " }" + " </style>" + "</head>"
        + "<body style=\"font-size:10pt;\">";
    String end = "</body></html>";

    String header = (start + headerStr + end).replace("\"", "\\\"");
    String footer = (start + footerStr + end).replace("\"", "\\\"");
    StringBuffer ret = new StringBuffer("@media print{@page:first {counter-increment: page;");
    if (generateBoolean(map, "header"))
    {
      ret.append("@top-center{" + "content:xhtml(\"" + header + "\");" + "border-bottom: 0.2mm black solid;vertical-align: bottom;}");
    }
    else
    {
      ret.append("@top-center{content:normal}");
    }
    if (generateBoolean(map, "footer"))
    {
      ret.append("@bottom-center{" + "content:xhtml(\"" + footer + "\");" + "border-top: 0.2mm black solid;vertical-align: top;}");
    }
    else
    {
      ret.append("@bottom-center{content:normal}");
    }
    ret.append(generateCssSizeStr(map));
    ret.append(generateCssForFirstPage(map));
    ret.append("}");
    // all pages;
    ret.append("@page {" + "counter-increment: page;");
    if (map.containsKey("HH") && getFloat(map.get("HH")) > 0)
    {
      ret.append("@top-center{" + "content:xhtml(\"" + header + "\");" + "border-bottom: 0.2mm black solid;vertical-align: bottom;}");
    }
    if (map.containsKey("FH") && getFloat(map.get("FH")) > 0)
    {
      ret.append("@bottom-center{" + "content:xhtml(\"" + footer + "\");" + "border-top: 0.2mm black solid;vertical-align: top;}");
    }
    ret.append(generateCssSizeStr(map));
    ret.append(generateCssMarginStr(map));
    ret.append("}}");

    // for page number
    ret.append("span.ODT_PN:after{ content:counter(page);}");
    return ret.toString();
  }

  public static boolean generateBoolean(Map map, String key)
  {
    boolean ret = false;
    String value = (String) map.get(key);
    if (value != null && value.length() > 1)
      ret = Boolean.valueOf(value.substring(0, value.length() - 1));
    return ret;
  }

  // str is a String
  public static Float getFloat(Object str)
  {
    String ret = (String) str;
    ret = ret.substring(0, ret.length() - 1);
    Float f = Float.valueOf(ret);
    f /= 100;
    return f;
  }

  public static String formatString(Object str)
  {
    return getFloat(str).toString() + "mm";
  }

  public static String getInnerHTML(Tidy tidy, Element element, boolean isInner)
  {
    String content = null;
    try
    {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      tidy.pprint(element, baos);
      content = baos.toString("UTF-8");
      if (isInner)
      {
        if (element.getChildNodes().getLength() <= 0)
        {
          baos.close();
          return "";
        }
        int i = content.indexOf(">");
        int l = content.lastIndexOf("<");
        content = content.substring(i + 1, l);
      }

      content = content.replaceAll(LINE_SEPARATOR, "");
      content = content.replaceAll(" />", ">");
      baos.close();
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, "error get inner html: " + element + ", " + isInner, e);
    }
    return content;
  }
}
