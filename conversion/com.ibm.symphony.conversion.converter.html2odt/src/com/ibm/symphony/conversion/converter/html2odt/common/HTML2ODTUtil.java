package com.ibm.symphony.conversion.converter.html2odt.common;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeFontFaceDecls;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.OdfElementUtil;
import com.ibm.symphony.conversion.service.common.util.StringPool;

public class HTML2ODTUtil
{
  private static Logger log = Logger.getLogger(HTML2ODTUtil.class.getName());

  public static void loadPreservedStyle(ConversionContext context, Document htmlDoc, OdfDocument odfDoc, StringPool stringPool)
  {

    loadPreservedListStyle(context, htmlDoc, odfDoc, stringPool);

  }

  private static void loadPreservedListStyle(ConversionContext context, Document htmlDoc, OdfDocument odfDoc, StringPool stringPool)
  {

    Iterator<String> keysIt = getListStyleElementKeys(htmlDoc);
    if (keysIt == null)
      return;

    try
    {
      OdfFileDom styleDom = odfDoc.getStylesDom();
      OdfOfficeStyles autoStyles = styleDom.getOfficeStyles();
      while (keysIt.hasNext())
      {
        String key = "LST_" + (String) keysIt.next();
        String value = stringPool.getString(key);
        OdfTextListStyle oldStyle = autoStyles.getListStyle(key.substring(4));
        if (oldStyle != null)
          autoStyles.removeChild(oldStyle);

        OdfElement unflatten = unflattenListStyle(styleDom, value);
        if(unflatten!=null)
        {
          autoStyles.appendChild(unflatten);
          genListTextStyle(styleDom, autoStyles, unflatten, stringPool);          
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.FINEST, "Failed to get list auto styles.", e);
    }
  }

  private static void genListTextStyle(OdfFileDom styleDom, OdfOfficeStyles autoStyles, OdfElement txtListStyleE, StringPool stringPool)
  {
    OdfTextListStyle txtListStyle = (OdfTextListStyle) txtListStyleE;
    OdfOfficeFontFaceDecls fontFaceDecls = ConvertUtil.getOfficeFontFaceDecls(styleDom);

    for (int i = 1; i < txtListStyle.getLength(); i++)
    {
      TextListLevelStyleElementBase listLevelStyle = txtListStyle.getLevel(i);

      if (listLevelStyle.hasAttribute(ODFConstants.TEXT_STYLE_NAME))
      {
        String textStyleName = listLevelStyle.getAttribute(ODFConstants.TEXT_STYLE_NAME);
        OdfStyle oldTextStyle = autoStyles.getStyle(textStyleName, OdfStyleFamily.Text);
        if (oldTextStyle == null)
        {
          String txtStyleValue = stringPool.getString("SST_" + textStyleName);
          if (txtStyleValue != null)
          {
            OdfElement newTextStyle = unflattenListStyle(styleDom, txtStyleValue);
            autoStyles.appendChild(newTextStyle);
          }
        }
      }

      OdfStylePropertiesBase textPro = listLevelStyle.getPropertiesElement(OdfStylePropertiesSet.TextProperties);
      if (textPro != null && textPro.hasAttribute(ODFConstants.STYLE_FONT_NAME))
      {
        String fontName = textPro.getAttribute(ODFConstants.STYLE_FONT_NAME);
        if (ConvertUtil.getFontFaceElement(fontFaceDecls, fontName) == null)
        {
          String fontFaceEValue = stringPool.getString("SFF_" + fontName);
          if (fontFaceEValue != null)
          {
            OdfElement newFontFaceE = unflattenListStyle(styleDom, fontFaceEValue);
            fontFaceDecls.appendChild(newFontFaceE);
          }
        }
      }
    }
  }

  private static Iterator<String> getListStyleElementKeys(Document htmlDoc)
  {
    NodeList styles = htmlDoc.getElementsByTagName("style");
    if (styles == null)
      return null;

    List<String> keys = new ArrayList<String>();

    for (int i = 0; i < styles.getLength(); i++)
    {
      String listName = ((Element) styles.item(i)).getAttribute("lst_name");
      if (listName != null && listName.length() > 0)
        keys.add(listName);
    }

    if (keys.size() == 0)
      return null;

    return keys.iterator();
  }

  private static OdfElement unflattenListStyle(OdfFileDom fileDom, String flatten)
  {
    try
    {
      OdfElement odfElement = (OdfElement) OdfElementUtil.unflattenElement(fileDom, flatten, null);
      return odfElement;
    }
    catch (Exception e)
    {
      log.log(Level.FINEST, "Failed to unflatten list auto styles.", e);
    }
    return null;
  }
}
