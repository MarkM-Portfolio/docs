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

import java.util.Map;
import java.util.Random;
import java.util.Stack;
import java.util.StringTokenizer;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.type.Color;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.GeneralCSSPropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class CSSUtil
{
  private final static Random r = new Random();

  /**
   * convert html value to odf value
   * 
   * @param odfProp
   * @param value
   * @return
   */
  public static String convertHtmlStyleValue(OdfStyleProperty odfProp, String value)
  {
    // TODO convert html value to odf value
    if (value == null)
      return "";
    value = value.trim();
    if( OdfStyleTextProperties.Display.equals( odfProp ) && "block".equals(value) )
      return null;
    
    String rs = value;
    // convert px to pt or inch
    if (value.toLowerCase().endsWith("px"))
    {
      if (OdfStyleTextProperties.FontSize.equals(odfProp) || OdfStyleTextProperties.FontWeight.equals(odfProp))
      {
        rs = convertPXToPT(value);
      }
      else
      {
        rs = convertPXToIN(value);
      }
    }
    // defect 38773, IE save color as #0ff, should change to SixDigitHexRGB
    else if (odfProp.getName().getLocalName().indexOf("color") >= 0)
    {
      if (!"transparent".equalsIgnoreCase(value) && !"inherit".equalsIgnoreCase(value))//background color may be transparent,do not convert
        rs = Color.toSixDigitHexRGB(value);
    }
    else if (odfProp.getName().getLocalName().indexOf("writing-mode") >= 0)
    { 	
    	rs = HtmlCSSConstants.RTL.equalsIgnoreCase(value) ? ODFConstants.RL_TB : ODFConstants.LR_TB;
    }
    return rs;
  }

  public static String convertPXToIN(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }

  public static String convertPXToPT(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.POINT) + Unit.POINT.abbr());
  }

  public static String convertPTToIN(String value)
  {
    String length = value.toLowerCase().replace("pt", "");
    String indent = length + Unit.POINT.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }

  public static String convertBorderValue(String subV)
  {
	  String rs = subV;
	  if("thin".equals(subV)){
		  rs = "0.0008in";
	  }else if("medium".equals(subV)){
		rs = "0.0346in";
	  }else if("thick".equals(subV)){
		rs = "0.0693in";
	  }else if("red".equals(subV)){
		rs = "#ff0000";
	  }else if("green".equals(subV)){
		rs = "#00ff00";
	  }else if("blue".equals(subV)){
		rs = "#0000ff";
	  }else if(subV.indexOf("rgb") != -1){
		rs = Color.toSixDigitHexRGB(subV);
	  }else if(subV.endsWith("px")){
	    rs = convertPXToIN(subV);
	  }
	  return rs;
  }
  
  public static String parseBorderStyle(String styleString)
  {
      String rs = styleString;
      
      if(styleString != null)
      {
        styleString = styleString.replace(";", "");
        String[] style = styleString.split(" ");
        switch(style.length)
        {
          case 1:
            rs = style[0] ;
            rs += " ";          
            rs += style[0];
            rs += " ";
            rs += style[0];
            rs += " ";
            rs += style[0]; 
            break;
          case 2:
            rs = style[0] ;
            rs += " ";          
            rs += style[1];
            rs += " ";
            rs += style[0];
            rs += " ";
            rs += style[1];
            break;
          case 3:
            rs = style[0] ;
            rs += " ";          
            rs += style[1];
            rs += " ";
            rs += style[2];
            rs += " ";
            rs += style[1]; 
            break;
          case 4:  
            rs = styleString;
            break;            
        }
      }      
      return rs;
  }

  
  public static OdfStyle getOldStyle(ConversionContext context, String styleName, OdfStyleFamily odfStyleFamily)
  {
	if(styleName == null || styleName.equals("")) return null;

    try
    {
      OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfOfficeStyles odfStyles = ((OdfDocument)context.getTarget()).getStylesDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = currentFileDom.getAutomaticStyles();
      OdfStyle oldStyle = null;
      if (autoStyles != null)
      {
        oldStyle = autoStyles.getStyle(styleName, odfStyleFamily);
      }
      if (oldStyle == null && odfStyles != null)
      {
        oldStyle = odfStyles.getStyle(styleName, odfStyleFamily);
      }
      
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public static OdfTextListStyle getOldListStyle(ConversionContext context, String styleName)
  {
    try
    {
      OdfDocument odfDoc = (OdfDocument) context.getTarget();
      OdfOfficeStyles odfStyles = odfDoc.getStylesDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = XMLConvertorUtil.getCurrentFileDom(context).getAutomaticStyles();
      OdfTextListStyle oldStyle = null;
      if (autoStyles != null)
      {
        oldStyle = autoStyles.getListStyle(styleName);
      }
      if ( odfStyles != null && oldStyle == null )
      {
        oldStyle = odfStyles.getListStyle(styleName);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;      
    }
  }

  public static OdfNumberStyle getOldNumberStyle(ConversionContext context, String styleName)
  {
    try
    {
      OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfOfficeStyles odfStyles = currentFileDom.getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = currentFileDom.getAutomaticStyles();
      OdfNumberStyle oldStyle = null;
      if (odfStyles != null)
      {
        oldStyle = odfStyles.getNumberStyle(styleName);
      }
      if (oldStyle == null && autoStyles != null)
      {
        oldStyle = autoStyles.getNumberStyle(styleName);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public static String getStyleName(OdfStyleFamily odfStyleFamily, String prefix)
  {
    if (prefix == null)
    {
      prefix = String.valueOf(odfStyleFamily.getName().charAt(0)).toUpperCase();
    }
    return prefix + "_" + r.nextInt(Integer.MAX_VALUE);
  }

  public static double getCMLength(String input)
  {
    input = input.trim().toLowerCase();
    if(input.endsWith("cm")) 
      return getLength(input);
    if(input.endsWith("px")) 
      input = convertPXToPT(input);
    
    return Length.parseDouble(getLength(input) + getODFUnit(input).abbr(), Unit.CENTIMETER);
  }

  public static String getSumofWidth(String[] rowWidth)
  {
    String sumValue = null;
    for(int i=0;i<rowWidth.length;i++)
    {
      if(sumValue == null ) 
        sumValue = rowWidth[i];
      else if(rowWidth[i] != null) 
        sumValue = addLength(rowWidth[i],sumValue);
    }    
    return sumValue;
  }

  public static String addLength(String l1, String l2)
  {     
    String l1Unit = getUnit(l1);
    String l2Unit = getUnit(l2);
    if(l1Unit.equals(l2Unit))
      return getLength(l1) + getLength(l2) + l1Unit;
    
    return (getCMLength(l1) + getCMLength(l2)) + "cm";
  }

  public static String decreaseLength(String l1, String l2)
  {     
    String l1Unit = getUnit(l1);
    String l2Unit = getUnit(l2);
    if(l1Unit.equals(l2Unit))
      return getLength(l1) - getLength(l2) + l1Unit;
    
    return (getCMLength(l1) - getCMLength(l2)) + "cm";
  }

  public static int compareLength(String l1, String l2)
  {
    if(getUnit(l1).equals(getUnit(l2)))
      return new Double(getLength(l1)).compareTo(new Double(getLength(l2)));

    return new Double(getCMLength(l1)).compareTo(new Double(getCMLength(l2)));
  }

  
  public static double getLength(String input)
  {
    input = input.trim().toLowerCase();
    double val1 = 0;
    if(input.endsWith("%"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 1));

    if(input.endsWith("*"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 1));

    if (input.endsWith("in"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("cm"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("px"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("pt"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("mm"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("pc"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));

    return val1;
  }
  
  public static String getUnit(String input)
  {
    String unit = "";
    if(input.endsWith("%"))
      unit = "%";

    if(input.endsWith("*"))
      unit = "*";
    
    if (input.endsWith("in"))
      unit = "in";
    else if (input.endsWith("cm"))
      unit = "cm";
    else if (input.endsWith("px"))
      unit = "px";
    else if (input.endsWith("pt"))
      unit = "pt";
    else if (input.endsWith("mm"))
      unit = "mm";
    else if (input.endsWith("pc"))
      unit = "pc";

    return unit;
  }

  public static Unit getODFUnit(String input)
  {
    if(input.endsWith("%") || input.endsWith("*"))
      return null;    
    
    Unit odfUnit = null;
    
    if (input.endsWith("in"))
      odfUnit = Unit.INCH;
    else if (input.endsWith("cm"))
      odfUnit = Unit.CENTIMETER;
    else if (input.endsWith("px"))
      odfUnit = Unit.PIXEL;
    else if (input.endsWith("pt"))
      odfUnit = Unit.POINT;
    else if (input.endsWith("mm"))
      odfUnit = Unit.MILLIMETER;
    else if (input.endsWith("pc"))
      odfUnit = Unit.PICA;
    
    return odfUnit;

//    return Length.parseUnit(input);
  }

  public static Object getODFName(OdfStyleFamily family,String name)
  {
    Object odfName = null;
    if (OdfStyleFamily.Table.equals(family) || OdfStyleFamily.TableRow.equals(family) || OdfStyleFamily.TableColumn.equals(family))
    {
      odfName = XMLConvertorUtil.getHtmlTableMap().get(name);
    }
    else if(OdfStyleFamily.TableCell.equals(family))
    {
      odfName = XMLConvertorUtil.getHtmlTableCellMap().get(name);
      if(odfName == null)
        odfName = XMLConvertorUtil.getHtmlTextMap().get(name);
    } 
    else
    {
      odfName = XMLConvertorUtil.getHtmlTextMap().get(name);
    }
    
    return odfName;
  }

  public static OdfStyleProperty getODFStyleProperty(OdfStyleFamily family,String odfName)
  {
    Map <String, OdfStyleProperty> propertyMap = GeneralCSSPropertyConvertor.getPropertyMap(family);
    OdfStyleProperty property = propertyMap.get(odfName);
    
    if (family != OdfStyleFamily.Paragraph && property == null)
    {
      propertyMap = GeneralCSSPropertyConvertor.getPropertyMap(OdfStyleFamily.Paragraph);
      property = propertyMap.get(odfName);
    }     

    return property;    
  }

  public static void convertBorderValues(Map<String, String> htmlStyle, String key, String[] values)
  {
    String htmlValue = htmlStyle.get(key);
    if (htmlValue != null && !"".equals(htmlValue))
    {
      htmlValue = convertRGBValues(htmlValue);
      StringTokenizer st = new StringTokenizer(htmlValue, " ");
      int i = 0;
      while (st.hasMoreTokens())
      {
        String subV = st.nextToken();
        if ("-moz-use-text-color".equals(subV))
        {
          String textColor = htmlStyle.get("color");
          if (textColor != null && !"".equals(textColor))
          {
            subV = textColor;
          }
          else
          {
            subV = "#000000";// default black color
          }
        }
        subV = convertBorderValue(subV);
        i++;
        switch (i)
          {
            case 1 :
              values[0] = subV;
              values[2] = subV;
              values[1] = subV;
              values[3] = subV;
              break;
            case 2 :
              values[1] = subV;
              values[3] = subV;
              break;
            case 3 :
              values[2] = subV;
              break;
            case 4 :
              values[3] = subV;
              break;
          }
      }
    }
  }

  public static String convertRGBValues(String htmlValue)
  {
    String rs = htmlValue;
    int start_idx = 0;
    if (htmlValue != null && !"".equals(htmlValue))
      start_idx = htmlValue.indexOf("rgb");
    if (start_idx != -1)
    {
      StringBuffer sb = new StringBuffer();
      int end_idx = -1;
      do
      {
        sb.append(htmlValue.substring(end_idx + 1, start_idx));
        end_idx = htmlValue.indexOf(")", start_idx);
        String colorV = Color.toSixDigitHexRGB(htmlValue.substring(start_idx, end_idx + 1));
        sb.append(colorV);
        start_idx = htmlValue.indexOf("rgb", end_idx + 1);
      }
      while (-1 != start_idx);
      sb.append(htmlValue.substring(end_idx + 1));
      rs = sb.toString();
    }
    return rs;
  }

  public static String getShorthandValue(String[] borderWidthArray, String[] borderStyleArray, String[] borderColorArray, int index)
  {
    StringBuffer sb = new StringBuffer();
    sb.append(borderWidthArray[index]);
    sb.append(" ");
    sb.append(borderStyleArray[index]);
    sb.append(" ");
    sb.append(borderColorArray[index]);
    return sb.toString();
  }  
  
  public static String getListStyleName(String className)
  {
    int index = className.lastIndexOf('_');
    if (index != -1)
      className = className.substring(0, index);
    return className;
  }
  
  public static int getListStyleLevel(String className)
  {
    int index = className.lastIndexOf('_');
    if (index != -1)
    {
      String strLevel = className.substring(index+1);
      try
      {
        return Integer.parseInt(strLevel);
      }
      catch( NumberFormatException e)
      {
        return -1;
      }
    }
    return -1;
  }
  
  public static String getTemplateClassName(ConversionContext context, Element htmlElement)
  {
    String fullClassName = null;
    
    //get full class name before body
    Node tempNode = htmlElement;
    while(!"body".equals(tempNode.getNodeName()))
    {
      String tempName = tempNode.getNodeName();
      NamedNodeMap attrs = tempNode.getAttributes();
      if(attrs != null)
      {
        Node classAttr = attrs.getNamedItem(Constants.CLASS);
        String tempClassName = (classAttr == null)? null: classAttr.getNodeValue();
        if(tempClassName != null)
        {
          tempName = tempName + "." + tempClassName;
        }
      }
      if(fullClassName == null)
      {
        fullClassName = tempName;
      }
      else {
        fullClassName = tempName + " " + fullClassName;
      }
      tempNode = tempNode.getParentNode();
    }

    //get body class name by "concord_Doc_Style"
    String bodyClassName =(String) context.get(Constants.BODY_CLASS_NAME);
    
    //get final full class name
    if(fullClassName == null)
    {
      fullClassName = bodyClassName;
    }
    else {
      fullClassName = bodyClassName + " " + fullClassName;
    }
    
    return fullClassName;
  }
  
  public static Stack<String> generateTemplateKeyStack(String templateKey)
  {
    Stack<String> keyStack = new Stack<String>();
    
    //the full path class and direct class in body have high priority
    keyStack.push(templateKey);
    String[] subStrs = templateKey.split(" ");
    if(subStrs.length > 1)
    {
      keyStack.push(subStrs[0] + " " + subStrs[subStrs.length-1]);
      int index = subStrs[subStrs.length-1].lastIndexOf(".");
      if( index != -1)
      {
        keyStack.push(subStrs[0] + " " + subStrs[subStrs.length-1].substring(0,index));
      }
      
      //put inherited class names into the stack
      String tempStr = templateKey;
      index = tempStr.lastIndexOf(" ");
      while(index != -1)
      {
        String firstStr = tempStr.substring(0, index);
        String secondStr = tempStr.substring(index+1);
        if(secondStr.indexOf(".") != -1)
        {
          firstStr = tempStr.substring(0, tempStr.lastIndexOf("."));
        }
        tempStr = firstStr;
        keyStack.push(tempStr);
        index = tempStr.lastIndexOf(" ");
      }
    }
    
    return keyStack;
  }
  public static void updateHeightWidth(Map<String, String> styleMap)
  {
    String width = styleMap.get(HtmlCSSConstants.WIDTH);
    String height = styleMap.get(HtmlCSSConstants.HEIGHT);
    if (width != null)
    {
      String LRPaddingWidth = ConvertUtil.getLRPadding(styleMap);
      if(LRPaddingWidth != null)
      {
        String newWidth = UnitUtil.addLength(width, LRPaddingWidth);   
        styleMap.put(HtmlCSSConstants.WIDTH, newWidth);
      }
    }
    if (height != null)
    {
      String TBPaddingWidth = ConvertUtil.getTBPadding(styleMap);
      if(TBPaddingWidth != null)
      {
        String newHeight = UnitUtil.addLength(height, TBPaddingWidth);  
        styleMap.put(HtmlCSSConstants.HEIGHT, newHeight);
      }
    }
  }
  
  public static String getUpdatedHeight(Map<String, String> styleMap)
  {
    String height = styleMap.get(HtmlCSSConstants.HEIGHT);
    if (height != null)
    {
      String TBPaddingWidth = ConvertUtil.getTBPadding(styleMap);
      if(TBPaddingWidth != null)
      {
        String newHeight = UnitUtil.addLength(height, TBPaddingWidth);  
        return newHeight;
      }
    }
    
    return height;
  }
}
