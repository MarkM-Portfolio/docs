/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css;

import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleBullet;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleNumber;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;

import com.ibm.json.java.JSONObject;

public class ListStyleUtil
{

  public static String[] defaultListItemMarginLeft = {"0.741cm", "1.482cm", "2.223cm", "2.963cm", "3.704cm", "4.445cm", "5.186cm", "5.927cm", "6.668cm", "7.408cm"};

  public static String defaultListItemTextIndent = "-0.741cm" ;
  
  public static String[] defaultListItemMarginLeftLA = {"0.762cm","1.016cm","1.27cm","1.824cm","1.928cm","2.132cm","2.286cm","2.64cm","2.754cm","2.91cm"};

  public static String[] defaultListItemTextIndentLA = {"-0.762cm","-1.016cm","-1.27cm","-1.824cm","-1.928cm","-2.132cm","-2.286cm","-2.64cm","-2.754cm","-2.91cm"};
  
  public static final int LIST_TYPE_BULLET = 0;

  public static final int LIST_TYPE_NUMBERING = 1;

  public static final int LIST_TYPE_IMAGE = 2;

  private static JSONObject listMap;

  static final Pattern numFormatPattern = Pattern.compile("([1IiAa])");

  static
  {
    InputStream input = ListStyleUtil.class.getResourceAsStream("List-Style-Map.json");
    try
    {
      listMap = JSONObject.parse(input);
    }
    catch (IOException e)
    {
      e.printStackTrace();
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
          
        }
      }
    }
  }

  public static boolean isConcordListStyle(String name)
  {
    return listMap.containsKey(name);
  }
  
  public static JSONObject getListMap()
  {
    return listMap;
  }

  public static TextListLevelStyleElementBase generateListStyleLevel(OdfFileDom fileDom, String spec, String prefix, String suffix,
      int level) throws Exception
  {
    Matcher m = numFormatPattern.matcher(spec);
    TextListLevelStyleElementBase styleItem = null;
    if (m.find()) // if it has 1, I, i, A, or a, it's a numbering style
    {
      // numbering style
      String numberFormat = m.group(1);
      int displayLevels = 1;
      OdfTextListLevelStyleNumber number = new OdfTextListLevelStyleNumber(fileDom);

      if (prefix == null || prefix.length() == 0)
        prefix = spec.substring(0, m.start(1));

      if (suffix == null || suffix.length() == 0)
        suffix = spec.substring(m.end(1));

      number.setStyleNumPrefixAttribute(prefix);
      number.setStyleNumFormatAttribute(numberFormat);
      number.setStyleNumSuffixAttribute(suffix);
      number.setTextDisplayLevelsAttribute(displayLevels);
      styleItem = number;
    }
    else
    // it's a bullet style
    {
      OdfTextListLevelStyleBullet bullet = new OdfTextListLevelStyleBullet(fileDom);
      if (prefix == null)
        prefix = "";
      if (suffix == null)
        suffix = "";

      bullet.setStyleNumPrefixAttribute(prefix);
      bullet.setStyleNumSuffixAttribute(suffix);
      if (!spec.equals(""))
      {
        bullet.setTextBulletCharAttribute(spec.substring(0, 1));
      }
      else
      {
        bullet.setTextBulletCharAttribute("");
      }
      styleItem = bullet;
    }
    styleItem.setTextLevelAttribute(level);
    return styleItem;
  }
  
  private static String parseCharValue( JSONObject styleMap, String key)
  {
    return String.valueOf((char) ((Integer.decode( (String)styleMap.get(key) )).intValue()));
  }
  public static TextListLevelStyleElementBase generateConcordListStyleLevel(OdfFileDom fileDom, String name, int level) throws Exception
  {
    JSONObject styleMap = (JSONObject) listMap.get(name);
    if (styleMap == null)
    {
      return null; 
    }
    
    
    TextListLevelStyleElementBase styleItem = null;
    int type = ((Long) styleMap.get("Type")).intValue() ;
    String prefix = "";
    if( styleMap.containsKey("Prefix") )
      prefix = parseCharValue(styleMap, "Prefix");
    
    String suffix = "";
    if( styleMap.containsKey("Suffix") )
      suffix = parseCharValue(styleMap, "Suffix");
    
    switch( type )
    {
      case LIST_TYPE_BULLET:
        OdfTextListLevelStyleBullet bullet = new OdfTextListLevelStyleBullet(fileDom);
        String bulletChar = parseCharValue(styleMap, "Bullet-Char");
        
        bullet.setTextBulletCharAttribute( bulletChar ); 
        bullet.setStyleNumPrefixAttribute(prefix);
        bullet.setStyleNumSuffixAttribute(suffix);
        bullet.setTextStyleNameAttribute("Bullet_20_Symbols");
        
        styleItem = bullet;
        break;
        
      case LIST_TYPE_NUMBERING:
        OdfTextListLevelStyleNumber number = new OdfTextListLevelStyleNumber(fileDom);
        number.setStyleNumPrefixAttribute(prefix);
        number.setStyleNumSuffixAttribute(suffix);
        
        String numberFormat = (String) styleMap.get("Num-Format");
        number.setStyleNumFormatAttribute(numberFormat);
        
        Long displayLevels = (Long) styleMap.get("Display-Levels");
        if ( displayLevels == null)
          displayLevels = 1L;
        number.setTextDisplayLevelsAttribute(displayLevels.intValue());
        number.setTextStyleNameAttribute("Numbering_20_Symbols");

        
        styleItem = number;
        break;
    }
    
    styleItem.setTextLevelAttribute(level);
    
    return styleItem;
  }
  
}
