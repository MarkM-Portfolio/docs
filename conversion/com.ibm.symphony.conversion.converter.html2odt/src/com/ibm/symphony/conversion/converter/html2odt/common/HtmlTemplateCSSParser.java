/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.common;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class HtmlTemplateCSSParser
{
  private static final Logger log = Logger.getLogger(HtmlTemplateCSSParser.class.getName());

  private static JSONObject styleMap = null;

  private static Map<String, Map<String, String>> mapCSSInfo = null;

  private static String bodyClassName;
  
  private static String localeName = null;

  public static JSONObject getTemplateStyleMap()
  {
    InputStream input = null;
    try
    {
      input = HtmlTemplateCSSParser.class.getResourceAsStream("Style-Map.json");
      styleMap = JSONObject.parse(input);
    }
    catch (FileNotFoundException fnfException)
    {
      log.log(Level.SEVERE, fnfException.getMessage());
    }
    catch (IOException ioException)
    {
      log.log(Level.SEVERE, ioException.getMessage());
    }
    finally
    {
      if (input != null)
      {
        try
        {
          input.close();
        }
        catch (IOException e)
        {
          log.log(Level.SEVERE, "Failed to close stream.", e);
        }
      }
    }

    return styleMap;
  }

  public static void loadStyleDocument(ConversionContext context)
  {
    loadCSSDocument(context, Constants.TEMPLATE_STYLE_FILE, Constants.TEMPLATE_STYLE_SOURCE);
    loadCSSDocument(context, Constants.TEMPLATE_STYLE_HEADING_FILE, Constants.TEMPLATE_STYLE_HEADING_SOURCE);
    loadCSSDocument(context, Constants.STYLE_DOC_TEMPLATES_FILE, Constants.STYLE_DOC_TEMPLATES_SOURCE);
    loadCSSDocument(context, Constants.TEMPLATE_STYLE_TOC_FILE, Constants.TEMPLATE_STYLE_TOC_SOURCE);
  }

  public static boolean isTemplateStyle(String styleName, String family)
  {
    JSONObject styleMap = getTemplateStyleMap();
    if (styleMap.containsKey(styleName))
    {
      String value = (String) styleMap.get(styleName);
      if (value.contains("/" + family + "/"))
        return true;
    }
    return false;
  }

  /**
   * 1.readcss to cssmap 2.put cssMap in context;
   */
  private static void loadCSSDocument(ConversionContext context, String fileName, String contextName)
  {
    InputStream fInput = null;
    BufferedReader br = null;
    try
    {
      fInput = HtmlTemplateCSSParser.class.getResourceAsStream(fileName);
      if (fInput != null)
      {
        br = new BufferedReader(new InputStreamReader(fInput));
        String line = "";

        StringBuilder sBuilder = new StringBuilder();

        while (true)
        {
          line = br.readLine();
          if (line == null)
          {
            break;
          }
          sBuilder.append(line);
          sBuilder.append('\n');
        }

        for (int i = 0; i < sBuilder.length(); i++)
        {
          char cTemp = sBuilder.charAt(i);
          if (cTemp == '\n' || cTemp == '\t')
          {
            sBuilder.deleteCharAt(i);
            i--;
          }
        }

        while (true)
        {
          int nFind1 = sBuilder.indexOf("/*");
          if (-1 == nFind1)
          {
            break;
          }
          int nFind2 = sBuilder.indexOf("*/", nFind1);
          if (-1 == nFind2)
          {
            break;
          }
          sBuilder.delete(nFind1, nFind2 + 2);
        }
        String strCSSContent = sBuilder.toString();
        Map<String, Map<String, String>> mapCSSInfo = new HashMap<String, Map<String, String>>();
        while (strCSSContent.length() > 0)
        {

          String[] CSSBlock = getCSSBlock(strCSSContent, "{", "}");
          if (CSSBlock == null)
            break;

          Map<String, String> mapCSSBlockInfo = new HashMap<String, String>();
          putStyleMap(CSSBlock[1], mapCSSBlockInfo);

          while (true)
          {
            int nNameFind = CSSBlock[0].indexOf(',');
            if (-1 == nNameFind)
            {
              mapCSSInfo.put(CSSBlock[0].trim(), mapCSSBlockInfo);
              break;
            }

            String strSubName = CSSBlock[0].substring(0, nNameFind).trim();
            mapCSSInfo.put(strSubName, mapCSSBlockInfo);
            CSSBlock[0] = CSSBlock[0].substring(nNameFind + 1, CSSBlock[0].length());
          }
          strCSSContent = CSSBlock[2];
        }
        context.put(contextName, mapCSSInfo);
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
      if (fInput != null)
      {
        try
        {
          fInput.close();
        }
        catch (IOException e)
        {
          log.log(Level.SEVERE, "Failed to close stream.", e);
        }
      }
    }
  }

  /**
   * 1.get current class and inherit class style 2.get current style 3.merge previous two styles
   */
  @SuppressWarnings("unchecked")
  public static Map<String, String> getTableMergedStyle(ConversionContext context, Element htmlElement)
  {
    // get table node's class and style and merge
    Element TableElement = getTableElement(htmlElement);
    if (TableElement == null)
      return null;

    String locale = (String) context.get("locale");
    if(locale != null)
      localeName = "body." + locale;
    bodyClassName = (String) context.get(Constants.BODY_CLASS_NAME);
    mapCSSInfo = (Map<String, Map<String, String>>) context.get(Constants.TEMPLATE_STYLE_SOURCE);

    Map<String, String> mapAllStyleInfo = new HashMap<String, String>();
    List<Node> parentNodes = new ArrayList<Node>();
    putTableNodeMergedStyle(TableElement, parentNodes, mapAllStyleInfo);

    parseTableBorderStyle(mapAllStyleInfo);
    String strNodeName = htmlElement.getNodeName();

    if (!strNodeName.equals(HtmlCSSConstants.TABLE))
    {
      if (strNodeName.equals(HtmlCSSConstants.TD) || strNodeName.equals(HtmlCSSConstants.TH))
      {
        parentNodes.add(htmlElement.getParentNode().getParentNode());
        putTableNodeMergedStyle((Element) htmlElement.getParentNode(), parentNodes, mapAllStyleInfo);
      }
      putTableNodeMergedStyle(htmlElement, parentNodes, mapAllStyleInfo);
    }

    return mapAllStyleInfo;
  }

  private static String[] getCSSBlock(String source, String start, String End)
  {
    if (source == null || source.equals(""))
      return null;

    String[] result = new String[3];
    int nFind1 = source.indexOf(start);
    if (-1 == nFind1)
    {
      return null;
    }
    int nFind2 = source.indexOf(End, nFind1);
    if (-1 == nFind2)
    {
      return null;
    }

    result[0] = source.substring(0, nFind1).trim().toLowerCase();// strCSSBlockName
    result[1] = source.substring(nFind1 + 1, nFind2).trim();// strCSSBlockInfo
    result[2] = source.substring(nFind2 + 1, source.length());// strContent

    return result;
  }

  private static String[] getCSSStyle(String source)
  {
    if (source != null && !source.equals("") && !source.endsWith(";"))
      source = source + ";";

    return getCSSBlock(source, ":", ";");
  }

  private static void putStyleMap(String styleString, Map<String, String> resultMap)
  {
    if (styleString != null)
    {
      styleString = styleString.trim();
      if (styleString.length() > 2 && !styleString.endsWith(";"))
        styleString += ";";
    }

    while (true)
    {
      String[] CSSStyle = getCSSStyle(styleString);
      if (CSSStyle == null)
        break;

      if (CSSGroupStylesUtil.getGroupStylePropNames().contains(CSSStyle[0]))
        CSSGroupStylesUtil.splitGroupStyles(resultMap, CSSStyle[0], CSSStyle[1]);
      else
        resultMap.put(CSSStyle[0], CSSStyle[1]);

      styleString = CSSStyle[2];
    }
  }

  private static void putNodeMergedStyle(List<String> listCurrentCompleteClassName, String strCurrentStyle, Map<String, String> resultMap)
  {
    Map<String, String> nodeClassInfo = new HashMap<String, String>();
    Map<String, String> nodeStyleMap = new HashMap<String, String>();

    putCSSInfoMap(listCurrentCompleteClassName, mapCSSInfo, nodeClassInfo);
    putStyleMap(strCurrentStyle, nodeStyleMap);
    mergerStyleAClass(nodeStyleMap, nodeClassInfo);
    resultMap.putAll(nodeStyleMap);
  }

  private static void mergerStyleAClass(Map<String, String> styleMap, Map<String, String> classMap)
  {
    if (classMap != null)
    {
      Iterator<Entry<String, String>> cssEntrySet = classMap.entrySet().iterator();
      while (cssEntrySet.hasNext())
      {
        Entry<String, String> cssEntry = cssEntrySet.next();

        String propertyName = cssEntry.getKey();
        String styleValues = (styleMap == null) ? null : (String) styleMap.get(propertyName);
        String classValues = (String) cssEntry.getValue();

        int nIndex = classValues.indexOf("!important");

        if (nIndex != -1)
        {
          classValues = classValues.substring(0, nIndex).trim();
          styleMap.put(propertyName, classValues);
        }
        else if (styleValues == null)
        {
          styleMap.put(propertyName, classValues);
        }
      }
    }
  }

  private static void putCSSInfoMap(List<String> sourceClassName, Map<String, Map<String, String>> sourceMap, Map<String, String> resultMap)
  {
    for (int i = 0; i < sourceClassName.size(); i++)
    {
      String name = sourceClassName.get(i).toLowerCase();
      Map<String, String> mapCSSTempInfo = sourceMap.get(name);
      if (mapCSSTempInfo != null)
      {
        Iterator<Entry<String, String>> cssEntrySet = mapCSSTempInfo.entrySet().iterator();
        while (cssEntrySet.hasNext())
        {
          Entry<String, String> cssEntry = cssEntrySet.next();

          String propertyName = cssEntry.getKey();
          String classValues = (String) cssEntry.getValue();

          int nIndex = (classValues == null) ? -1 : classValues.indexOf("!important");

          if (nIndex == -1 && resultMap.containsKey(propertyName))
          {
            String eClassValues = resultMap.get(propertyName);
            if (eClassValues == null || eClassValues.indexOf("!important") != -1)
              continue;
          }

          resultMap.put(cssEntry.getKey(), cssEntry.getValue());
        }
      }
    }
  }

  private static List<String> getClassName(Element htmlElement)
  {
    List<String> className = new ArrayList<String>();
    String strCurrentName = htmlElement.getAttribute(Constants.CLASS);
    strCurrentName = (strCurrentName == null) ? "" : strCurrentName.trim();
    String strNodeName = htmlElement.getNodeName();
    String strCompleteName = "";

    // node name first
    className.add(strNodeName);

    if (!strCurrentName.equals(""))
    {
      while (true)
      {
        int nNameFind = strCurrentName.lastIndexOf(' ');
        if (-1 == nNameFind)
        {
          strCompleteName = strNodeName + '.' + strCurrentName;
          className.add(strCompleteName);
          break;
        }

        String strTempName = strCurrentName.substring(nNameFind + 1, strCurrentName.length()).trim();
        strCurrentName = strCurrentName.substring(0, nNameFind).trim();
        strCompleteName = strNodeName + '.' + strTempName;
        className.add(strCompleteName);
      }
    }
    return className;
  }

  private static void addBodyClass(List<String> input)
  {
    int iLength = input.size();
    for (int i = 0; i < iLength; i++)
    {
      input.add(bodyClassName + " " + input.get(i));
      if(localeName != null)
        input.add(localeName + " " + input.get(i));
    }
  }

  private static void addParentClassName(List<String> result, Node parentNode, String splitBy)
  {
    List<String> parents = getClassName((Element) parentNode);

    int iLength = result.size();

    for (int j = 0; j < parents.size(); j++)
    {
      for (int i = 0; i < iLength; i++)
      {
        result.add(parents.get(j) + splitBy + result.get(i));
      }
    }

    for (int i = 0; i < iLength; i++)
    {
      result.remove(0);
    }

  }

  public static void putTableNodeMergedStyle(Element element, List<Node> parentNodes, Map<String, String> resultMap)
  {
    List<String> listTableClassName = null;
    if (parentNodes == null || parentNodes.isEmpty())
      listTableClassName = getClassName(element);
    else
      listTableClassName = getClassName((Element) parentNodes.get(0));

    listTableClassName.remove(0);

    // Get full name of current class
    List<String> listNodeCompleteClassName = null;

    List<String> listNodeClassName = getClassName(element);

    listNodeCompleteClassName = getTableCompleteClassName(parentNodes, listTableClassName, listNodeClassName);

    String strCurrentStyle = element.getAttribute(Constants.STYLE);
    strCurrentStyle = (strCurrentStyle == null) ? "" : strCurrentStyle.trim();

    putNodeMergedStyle(listNodeCompleteClassName, strCurrentStyle, resultMap);
    parentNodes.add(element);

  }

  private static List<String> getTableCompleteClassName(List<Node> parentNodes, List<String> tableClass, List<String> currentClass)
  {
    List<String> result = new ArrayList<String>();
    int lastTdIdx = 0;
    for (int i = 0; i < currentClass.size(); i++)
    {
      String strCurrentName = currentClass.get(i);
      if (parentNodes.isEmpty())
        result.add(strCurrentName);
      else
      {
        for (int j = 0; j < tableClass.size(); j++)
        {
          String strTableName = tableClass.get(j);

          String strCurrentCompleteName = strTableName + " " + strCurrentName;
          result.add(strCurrentCompleteName);
        }
        if(i==0)
          lastTdIdx = result.size();
      }
    }
    int startIdx = result.size();
    addBodyClass(result);
    if (!parentNodes.isEmpty())
    {
      List<String> temp = new ArrayList<String>();
      temp.addAll((Collection<String>) currentClass);

      int iLength = parentNodes.size() - 1;
      while (iLength >= 0)
      {
        addParentClassName(temp, parentNodes.get(iLength), ">");
        iLength--;
      }

      if (!temp.isEmpty())
      {
        result.addAll(Math.min(startIdx + lastTdIdx, result.size()), temp);
      }
    }

    return result;
  }

  public static Element getTableElement(Element htmlElement)
  {
    String currentNode = htmlElement.getNodeName();
    if (currentNode.equals(HtmlCSSConstants.TABLE))
      return htmlElement;

    int nLayer = 5;
    Node parentNode = htmlElement.getParentNode();

    while (nLayer > 0)
    {
      String nodeName = parentNode.getNodeName();

      if (nodeName.equals(HtmlCSSConstants.TABLE))
        return (Element) parentNode;

      parentNode = parentNode.getParentNode();
      if (parentNode == null)
        break;

      nLayer--;
    }

    return null;
  }

  private static void parseTableBorderStyle(Map<String, String> tableStyleMap)
  {
    CSSGroupStylesUtil.mergeBorderSeparateStyle(tableStyleMap);
    for (int i = 0; i < 4; i++)
    {
      String styleName = CSSGroupStylesUtil.getBorderCSSStyleName(i, 0);
      if (tableStyleMap.containsKey(styleName))
      {
        tableStyleMap.put("table." + styleName, tableStyleMap.get(styleName));
        tableStyleMap.remove(styleName);
      }
    }
  }
}
