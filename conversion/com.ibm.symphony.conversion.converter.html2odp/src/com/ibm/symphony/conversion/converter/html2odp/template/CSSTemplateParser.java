/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.template;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.service.common.ConversionContext;

/**
 * CSS template parser
 * 
 */
public class CSSTemplateParser
{
  private static final String CLASS = CSSTemplateParser.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  /**
   * Read the css template file and convert it into a css hashMap.
   * 
   * @param context
   *          - The current conversion context
   * @param fileName
   *          - The filename to use when reading the css template file
   * @param contextName
   *          - The name to use when storing the css hashMap in the conversion context.
   * @return mapCSSInfo - the css hashMap. null if an error occurred loading or parsing the css file.
   */
  protected static Map<String, Map<String, String>> loadCSSDocument(ConversionContext context, String fileName)
  {
    InputStream fInput = null;
    BufferedReader br = null;
    try
    {
      fInput = CSSTemplateParser.class.getResourceAsStream(fileName);
      if (fInput != null)
      {
        br = new BufferedReader(new InputStreamReader(fInput));
        String line = "";

        StringBuilder sBuilder = new StringBuilder(128);

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
              Map<String, String> currentCSSBlockInfo = mapCSSInfo.get(CSSBlock[0].trim());
              if (currentCSSBlockInfo == null) // Add the map
                mapCSSInfo.put(CSSBlock[0].trim(), mapCSSBlockInfo);
              else
              // Combine the maps
              {
                currentCSSBlockInfo.putAll(mapCSSBlockInfo);
                mapCSSInfo.put(CSSBlock[0], currentCSSBlockInfo);
              }
              break;
            }

            String strSubName = CSSBlock[0].substring(0, nNameFind).trim();
            Map<String, String> currentCSSBlockInfo = mapCSSInfo.get(strSubName);
            if (currentCSSBlockInfo == null) // Add the map
              mapCSSInfo.put(strSubName, mapCSSBlockInfo);
            else
            // Combine the maps
            {
              currentCSSBlockInfo.putAll(mapCSSBlockInfo);
              mapCSSInfo.put(strSubName, currentCSSBlockInfo);
            }
            CSSBlock[0] = CSSBlock[0].substring(nNameFind + 1, CSSBlock[0].length());
          }
          strCSSContent = CSSBlock[2];
        }
        return mapCSSInfo;
      }

    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".loadCSSDocument");
      ODPCommonUtil.logException(context, Level.SEVERE, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(br);
      ODPMetaFile.closeResource(fInput);
    }
    return null;
  }

  private static String[] getCSSBlock(String source, String start, String End)
  {
    if (source == null || source.length() == 0)
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

    result[0] = source.substring(0, nFind1).trim();// strCSSBlockName
    result[1] = source.substring(nFind1 + 1, nFind2).trim();// strCSSBlockInfo
    result[2] = source.substring(nFind2 + 1, source.length());// strContent

    return result;
  }

  private static String[] getCSSStyle(String source)
  {
    if (source != null && source.length() > 0 && !source.endsWith(";"))
      source = source + ";";

    return getCSSBlock(source, ":", ";");
  }

  private static void putStyleMap(String styleString, Map<String, String> resultMap)
  {
    if (styleString != null)
      styleString = styleString.toLowerCase().trim();
    while (true)
    {
      String[] CSSStyle = getCSSStyle(styleString);
      if (CSSStyle == null)
        break;

      resultMap.put(CSSStyle[0], CSSStyle[1]);
      styleString = CSSStyle[2];
    }
  }
}
