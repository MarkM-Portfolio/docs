/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.presentation.upgrade;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IUpgradeConvertor;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion11.converter.html2odp.HTML2ODPConverter;
import com.ibm.symphony.conversion11.service.exception.ConversionException;


public class GeneralHtmlUpgradeConvertor11 extends AbstractHtmlUpgradeConvertor
{

  private static final String CLASS = GeneralHtmlUpgradeConvertor11.class.getName();

  private static final String FLIPH_AND_FLIPV = "flipH flipV";

  private static final String FLIPVH = "flipVH";

  @Override
  protected void doCurrentUpgrade(ConversionContext context, Object input, Object output, String conversionVersion)
  {
    // NOTE: input may be null if the draft has never been published prior to the upgrade (i.e. no "odfdraft"
    // will exist)
    // Update the Office_styles.css with the new flipVH class (defect 11946)
    updateOfficeStyles(context, conversionVersion);
    updateFlipVHinContent(context, output);

    // Update table cells with to eliminate height differences between cells (defect 8535)
    updateTableCells(context, output);

    // Update list structure from 110 to CURRENT_CONVERTER_VERSION_PRESENTATION(111)
    if (conversionVersion.equals(ConversionConstants.CONVERTER_VERSION_PRESENTATION_110))
    {
      updateFontSize(context, (Document) output);
      try
      {
        updateListStructure(context);
      }
      catch (ConversionException e)
      {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }
  }

  private void updateListStructure(ConversionContext context) throws ConversionException {
    // upgraded html works as input for export
    String srcHtmlPath = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE);
    final IConversionService conversionService = ConversionService.getInstance();
    Map<String, String> parameters =
        new HashMap() { { put("repositoryPath", conversionService.getRepositoryPath());} };
    com.ibm.symphony.conversion11.service.ConversionResult
        result = HTML2ODPConverter.convert(new File(srcHtmlPath), parameters);
    context.put(ODPConvertConstants.CONTEXT_EXPORT_CONVERT_RESULT, result.getConvertedFilePath());
  }

  @Override
  protected IUpgradeConvertor getPredecessorUpgradeConvertor()
  {
    return null; // Because there is no previous upgrade convertor
  }

  /**
   * updateOfficeStyles adds the flipVH class to Office_styles.css
   *
   * @param conversionVersion
   *          - this is the source conversionVersion, ie the release that this file was saved.
   */
  private void updateOfficeStyles(ConversionContext context, String conversionVersion)
  {
    String fileDir = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE);
    String filePath = fileDir + File.separator + ODPConvertConstants.CSS_STYLE_COMMON_FILE;
    String globalStyle = ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS
        + " .flipVH {-moz-transform: scale(-1,-1);-webkit-transform: scale(-1,-1);-o-transform: scale(-1,-1);-ms-transform: scale(-1,-1);transform: scale(-1,-1);}\n";

    Writer outputCSS = null;

    try
    {
      // Copy the original file to new file name
      // Making a copy of the old office_styles.css, not sure if necessary
      FileUtil.copyFileToDir(new File(filePath), new File(fileDir),
                             ODPConvertConstants.CSS_STYLE_COMMON_FILE + conversionVersion);

      outputCSS = new BufferedWriter(new FileWriter(filePath, true));
      outputCSS.append(globalStyle);
      outputCSS.close();
    }
    catch (FileNotFoundException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".writeContents");
      ODPCommonUtil.logException(Level.WARNING, message, e);
    }
    catch (IOException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".writeContents");
      ODPCommonUtil.logException(Level.WARNING, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(outputCSS);
    }
  }

  /**
   * Go through the content.html and look for "flipH flipV" and if found replace it with "flipVH"
   */
  @SuppressWarnings("unused")
  private void updateFlipVHinContent(ConversionContext context, Object html)
  {
    Document htmlDoc = (Document) html;
    NodeList nodes = htmlDoc.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_IMG);
    for (int i = 0; i < nodes.getLength(); i++)
    {
      Element e = (Element) nodes.item(i);
      String classVal = e.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if (classVal.contains(FLIPH_AND_FLIPV))
      {
        classVal = classVal.replace(FLIPH_AND_FLIPV, FLIPVH);
        e.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classVal);
      }
    }
  }


  /**
   * Go through the content.html and look for "TD elements". If found, and TD has no children append the following child to it
   *
   * <p>
   * <span> </span> <br class="hideInIE">
   * </p>
   */
  private void updateTableCells(ConversionContext context, Object html)
  {
    Document htmlDoc = (Document) html;
    NodeList nodes = htmlDoc.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_TD);
    for (int i = 0; i < nodes.getLength(); i++)
    {
      Element e = (Element) nodes.item(i);
      // Get the child nodes of the TD element
      NodeList children = e.getChildNodes();
      // If no children, add an break, etc
      if (children.getLength() == 0)
      {
        Element blankTableCellElement = createBlankTableCellElement(context, htmlDoc);
        e.appendChild(blankTableCellElement);
      }
    }
  }

  private Element createBlankTableCellElement(ConversionContext context, Document htmlDoc)
  {
    String prefix = ""; // Prefix to prepend to HTML ID
    // Create the P element and set the removal candidate attribute
    Element pElement = HtmlUpgradeUtils.createHtmlElementWithoutIndexing(context, htmlDoc, ODPConvertConstants.HTML_ELEMENT_P, prefix);
    pElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_CLASS_TEXT_P + " "
        + ODPConvertConstants.HTML_ATTR_SPACE_PLACEHOLDER);
    pElement.setAttribute(ODPConvertConstants.HTML_ATTR_REMOVAL_CANDIDATE, "1");

    // Create the span element and insert a blank node
    // Then append to the p element
    Element spanElement = HtmlUpgradeUtils
        .createHtmlElementWithoutIndexing(context, htmlDoc, ODPConvertConstants.HTML_ELEMENT_SPAN, prefix);
    // Add the &nbsp;
    Text t = htmlDoc.createTextNode(ODPConvertConstants.STRING_NBSP);
    spanElement.appendChild(t);
    pElement.appendChild(spanElement);

    // Create the brElement with the "hideInIE" attribute
    // Then append to the p element
    Element brElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_BR);
    brElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HIDE_IN_IE);
    pElement.appendChild(brElement);

    return pElement;
  }

  private void updateFontSize(ConversionContext context, Document htmlDoc)
  {
    try
    {
      Element body = (Element) htmlDoc.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_BODY).item(0);

      getCSSFromContent(context, htmlDoc);
      getCSSFromStyle(context);

      updateChildrenFontSize(context, body, ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  private void updateFontSize(ConversionContext context, Element element, double parentfs)
  {
    double fontsize = parentfs;
    String fs = getFontSize(context, element);
    if(fs != null)
    {
      fontsize = Double.parseDouble(fs) * parentfs;

      element.setAttribute(ODPConvertConstants.CSS_FONT_SIZE_PFS, ConvertUtil.parseFontSizeToString(fontsize));
    }
    updateChildrenFontSize(context, element, fontsize);
  }
  private void updateChildrenFontSize(ConversionContext context, Element element, double fontsize)
  {
    Node child = element.getFirstChild();
    while(child != null)
    {
      if(child instanceof Element)
        updateFontSize(context, (Element) child, fontsize);

      child = child.getNextSibling();
    }
  }

  private String getFontSize(ConversionContext context, Element element)
  {
    String style = element.getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
    String fontsize = getFontSize(style);
    if(fontsize == null)
    {
      String classNames = element.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if(classNames != null)
      {
        String[] className = classNames.trim().split(" ");
        if(className.length < 2)
          return null;

        Map<String, String> contentCssMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
        Map<String, String> officeStyleCssMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);
        Map<String, String> autoStyleCssMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);

        for(int i=className.length-1; i>0; i--)
        {
          String CSSName = "." + className[i].trim();
          
          if(contentCssMap != null)
          {
            style = contentCssMap.get(CSSName);
            if(style == null)
            {
              String CSSNamePrefix = getCSSNamePrefix(element);
              if(CSSNamePrefix != null)
                style = contentCssMap.get(CSSNamePrefix + CSSName);
            }
            
            fontsize = getFontSize(style);
            if(fontsize != null)
              break;
            else if(style != null)
              continue;
          }
          if(officeStyleCssMap != null)
          {
            style = officeStyleCssMap.get(CSSName);
            fontsize = getFontSize(style);
            if(fontsize != null)
              break;
            else if(style != null)
              continue;
          }
          if(autoStyleCssMap != null)
          {
            style = autoStyleCssMap.get(CSSName);
            fontsize = getFontSize(style);
            if(fontsize != null)
              break;
          }
        }
      }
    }

    String name = element.getNodeName();
    if ((fontsize == null)
        && (name.equals(ODPConvertConstants.HTML_ELEMENT_SPAN)
            || name.equals(ODPConvertConstants.HTML_ELEMENT_P)
            || name.equals(ODPConvertConstants.HTML_ELEMENT_UL)
            || name.equals(ODPConvertConstants.HTML_ELEMENT_OL)
            || name.equals(ODPConvertConstants.HTML_ELEMENT_LI)
            )
        )
    {
      fontsize = "1";
    }

    return fontsize;
  }
  
  private String getCSSNamePrefix(Node element)
  {
    String prefix = null;
    String nodeName = element.getNodeName().toLowerCase();
    if(nodeName.equals(ODPConvertConstants.HTML_ELEMENT_UL) || nodeName.equals(ODPConvertConstants.HTML_ELEMENT_OL))
    {
      prefix =  getCSSNamePre(nodeName, element.getParentNode());
    }
    else if(nodeName.equals(ODPConvertConstants.HTML_ELEMENT_LI))
    {
      prefix =  getCSSNamePre(nodeName, element.getParentNode().getParentNode());
    }

    return prefix;
  }
  
  private String getCSSNamePre(String prefix, Node element)
  {
    String nodeName = element.getNodeName().toLowerCase();
    if(nodeName.equals(ODPConvertConstants.HTML_ELEMENT_LI))
    {
      prefix = nodeName + " " + prefix;
      return getCSSNamePre(prefix, element.getParentNode().getParentNode());
    }
    else
      return prefix;
  }
  
  private String getFontSize(String style)
  {
    if(style != null && style.indexOf(ODPConvertConstants.CSS_FONT_SIZE) != -1)
    {
      Map<String, String> styleMap = ConvertUtil.buildCSSMap(style);
      String fontSize = styleMap.get(ODPConvertConstants.CSS_FONT_SIZE);
      if (fontSize != null && fontSize.length() > 0)
      {
        if (fontSize.endsWith("em"))
        {
          int emIndex = fontSize.indexOf("em");
          return fontSize.substring(0, emIndex);
        }
      }
    }
    return null;
  }

  static void getCSSFromContent(ConversionContext context, Document htmlDoc)
  {
    Map<String, String> cssMap =
        (Map<String, String>)context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    if (cssMap != null && !cssMap.isEmpty())
    {
      return;
    }

    String style = null;
    Element cssStyles = (Element) htmlDoc.getElementsByTagName("style").item(0);
    if (cssStyles != null)
    {
      String attr = cssStyles.getAttribute("type");
      if (attr.equals(ODPConvertConstants.CSS_STYLE_TEXT_CSS))
      {
        Node child = cssStyles.getFirstChild();
        if (child != null && child.getNodeType() == Node.TEXT_NODE)
        {
          style = child.getNodeValue();
        }
      }
    }

    if(style != null)
    {
      cssMap = createCssStyleMap(style);
      context.put(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE, cssMap);
    }
  }

  private void getCSSFromStyle(ConversionContext context)
  {
    Map<String, String> officeStyleMap = 
        (Map<String, String>)context.get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);
    Map<String, String> autoOfficeStyleMap = 
        (Map<String, String>)context.get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);
    if (officeStyleMap != null && !officeStyleMap.isEmpty()
        && autoOfficeStyleMap != null && !autoOfficeStyleMap.isEmpty())
    {
      return;
    }

    String sourcePath = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE);
    if (officeStyleMap == null || officeStyleMap.isEmpty())
    {
      String officeStyle =
          getCSSStyleAsString(sourcePath + File.separator
                              + ODPConvertConstants.CSS_STYLE_COMMON_FILE);
      if(officeStyle != null)
      {
        officeStyleMap = createCssStyleMap(officeStyle);
        context.put(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE, officeStyleMap);
      }
    }

    if (autoOfficeStyleMap == null || autoOfficeStyleMap.isEmpty())
    {
      String autoStyle =
          getCSSStyleAsString(sourcePath + File.separator
                              + ODPConvertConstants.CSS_STYLE_AUTO_FILE);
      if(autoStyle != null)
      {
        autoOfficeStyleMap = createCssStyleMap(autoStyle);
        context.put(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE, autoOfficeStyleMap);
      }
    }
  }

  private String getCSSStyleAsString(String fileName)
  {
    BufferedReader br = null;
    StringBuilder sBuilder = new StringBuilder();
    try
    {
      br = new BufferedReader(new InputStreamReader(new FileInputStream(fileName)));
      String line = null;
      while (true)
      {
        line = br.readLine();
        if (line == null)
        {
          break;
        }
        sBuilder.append(line);
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Exception:", e);
    }
    finally
    {
      if (br != null)
      {
        try
        {
          br.close();
        }
        catch (IOException e)
        {
          log.log(Level.SEVERE, "Failed to close buffer.", e);
        }
      }
    }

    return sBuilder.toString();
  }

  private static Map<String, String> createCssStyleMap(String rawStyles)
  {
    // strip ".concord" from the css styles
    rawStyles = rawStyles.replaceAll(ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS + " ", "");

    String styles[] = rawStyles.split("\\.*\\}"); // create array so we can build a map

    int capacity = ODPCommonUtil.calculateHashCapacity(styles.length);
    Map<String, String> cssMap = new HashMap<String, String>(capacity);

    for (int i = 0; i < styles.length; i++)
    {
      String key = "";
      String value = "";

      try
      {
        // we have each stylename and contents in the array element, so now split those up
        String style[] = styles[i].split("\\.*\\{");

        key = style[0].trim();
        // TODO: keep old code for reference
        //         if (style.length > 0 && style[0] != null && style[0].length() > 0)
        //         {
        //           int index = style[0].lastIndexOf(".");
        //           if (index != -1)
        //           {
        //             key = style[0].substring(index).trim();
        //           }
        //         }

        if (style.length == 2 && style[1] != null)
          value = style[1];

        if (key.length() > 0)
        {
          String oldValue = cssMap.get(key);
          if (oldValue != null && !oldValue.isEmpty())
          {
            key = oldValue + key;
          }
          cssMap.put(key, value);
        }
      }
      catch (Exception e)
      {
        e.printStackTrace();
      }
    }

    return cssMap;
  }

  @Override
  protected String getSupportedVersion()
  {
    return ConversionConstants.CURRENT_CONVERTER_VERSION_PRESENTATION;
  }
}
