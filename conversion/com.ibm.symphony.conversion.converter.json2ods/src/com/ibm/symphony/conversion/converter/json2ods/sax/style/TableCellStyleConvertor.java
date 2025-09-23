/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.style;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableCellProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.attribute.fo.FoFontStyleAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoFontWeightAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoWrapOptionAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StyleFamilyAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StyleTextLineThroughStyleAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StyleTextUnderlineStyleAttribute;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TableCellStyleConvertor extends GeneralStyleConvertor
{
  public OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.TableCell;
  }
  

  /**
   * convert cell style to automatic styles element if export default style, all the attributes should be exported if export other style,
   * only the attributes that are not same with default style should be exported
   */
  public void convertStyle(ConversionContext context, ConversionUtil.CellStyleType cellStyleType)
  {
    
    OdfStyle odfStyle = null;

    // default cell style
    if (cellStyleType.styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
    {
      //here never hitched, because use the original document default style, rather create a default style as IBM Docs editor
      odfStyle = ODSConvertUtil.createOdfStyle(context);
      odfStyle.setStyleNameAttribute(ODSConvertUtil.DEFAULT_CELL_STYLE_NAME);
    }
    else
    {
      // other customized cell style
      HashMap<String,Map<String,String>> newStyleMap = (HashMap<String,Map<String,String>>) context.get("newStyleMap");
      
      HashMap<String, List<String>> styleNameMap = (HashMap<String,List<String>>) context.get("styleNameMap");
      List<String> styleNames = styleNameMap.get(cellStyleType.styleId);
      if(ConversionUtil.hasValue(cellStyleType.preserveStyleName))
      {
        HashMap<String, String> preserveColumnCellStyleMap = (HashMap<String, String>) context.get("preserveColumnCellStyleMap");
        preserveColumnCellStyleMap.put(cellStyleType.styleId, cellStyleType.preserveStyleName);
        if(styleNames == null)
        {
          styleNames = new ArrayList<String>();
          styleNameMap.put(cellStyleType.styleId, styleNames);
        }
        if(!styleNames.contains(cellStyleType.preserveStyleName))
          styleNames.add(cellStyleType.preserveStyleName);
      }
      if(styleNames != null)
      {
        Iterator<String> it = styleNames.iterator();
        while(it.hasNext())
        {
          String oldStyleName = it.next();
          if(ODSConvertUtil.DEFAULT_CELL_STYLE_NAME.equals(oldStyleName))
            continue;

          createStyle(context,cellStyleType,newStyleMap,oldStyleName );
        }
      }
      
      
      Map<String, Boolean> map = (Map<String, Boolean>) context.get("ProtectInfo");
      OdfStyle style = createStyle(context,cellStyleType,newStyleMap,ConversionConstant.KEY_NEW_DEFAULT );
      if(map.containsKey(cellStyleType.styleId))
        style.setProperty(OdfStyleTableCellProperties.CellProtect, "none");
    }
  }
  
  private OdfStyle createStyle(ConversionContext context,ConversionUtil.CellStyleType cellStyleType, HashMap<String,Map<String,String>> newStyleMap,String oldStyleName)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Document doc = (Document) context.get("Source");
    String cellStyleName = com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil.getStyleName(OdfStyleFamily.TableCell, ConversionConstant.SID) ;
    OdfStyle odfStyle = super.convertStyle(context, cellStyleType.styleId, oldStyleName);
    OdfStyle oldStyle = com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil.getOldStyle(context, oldStyleName, getStyleFamily());
    odfStyle.setStyleNameAttribute(cellStyleName);
    Map<String,String> map = newStyleMap.get(cellStyleType.styleId);
    if( map == null)
      map = new HashMap<String,String>();
    map.put(oldStyleName, cellStyleName);
    newStyleMap.put(cellStyleType.styleId, map);
//    odfStyle.setStyleNameAttribute(cellStyleType.styleId);
    odfStyle.setStyleParentStyleNameAttribute(ODSConvertUtil.DEFAULT_CELL_STYLE_NAME);
    odfStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_CELL.toString());
    mergeStyle(context,cellStyleType,odfStyle);
    HashMap<String, String> mColCellMap = (HashMap<String,String>) context.get("MergeColumnCellMap");
    String colId = mColCellMap.get(cellStyleType.styleId);
    Column col = (Column) index.getJsonDataObject(colId);
    if(col != null)
    {
      if(ConversionUtil.hasValue(col.styleId))
      {
        ConversionUtil.CellStyleType defaultCellStyle = (CellStyleType) context.get("defaultCellStyle");
        boolean bDefault = false;
        CellStyleType colDStyleType = doc.getCellStyleFromStyleId(col.styleId);

        if (ConversionUtil.hasValue(colDStyleType.backgroundColor)
            && oldStyle != null && "none".equals(oldStyle.getProperty(OdfStyleTableCellProperties.BackgroundColor))
            && (
                !(colDStyleType.backgroundColor.equals(defaultCellStyle.backgroundColor) || "transparent".equals(colDStyleType.backgroundColor) || bDefault))
                )
          odfStyle.setProperty(OdfStyleTableCellProperties.BackgroundColor, colDStyleType.backgroundColor);
      }
    }
    return odfStyle;
  }
  
  private void mergeStyle(ConversionContext context, ConversionUtil.CellStyleType cellStyleType, OdfStyle odfStyle)
  {
    OdfFileDom contentDom = (OdfFileDom)context.get("Target");
    OdfOfficeAutomaticStyles autoStyles = null;
    boolean bDefault = false;
    ConversionUtil.CellStyleType defaultCellStyle = (CellStyleType) context.get("defaultCellStyleFromODF");
    try
    {
      autoStyles = contentDom.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    
    //since font name is preserved, if font style is supported in the editor, the following code should be enabled accordingly.
    
    List<String> fontNameList = (List<String>) context.get("fontNameList");

    if (ConversionUtil.hasValue(cellStyleType.fontName) && (bDefault || !cellStyleType.fontName.equals(defaultCellStyle.fontName)))
    {
      odfStyle.setProperty(OdfStyleTextProperties.FontName, cellStyleType.fontName);
      odfStyle.setProperty(OdfStyleTextProperties.FontNameAsian, cellStyleType.fontName);
      odfStyle.setProperty(OdfStyleTextProperties.FontNameComplex, cellStyleType.fontName);
      if (fontNameList != null)
      {
        if (!fontNameList.contains(cellStyleType.fontName))
        {
          fontNameList.add(cellStyleType.fontName);
        }
      }
    }
    else if(ConversionUtil.hasValue(defaultCellStyle.fontName) ){
    	odfStyle.setProperty(OdfStyleTextProperties.FontName, defaultCellStyle.fontName);
    	odfStyle.setProperty(OdfStyleTextProperties.FontNameAsian, defaultCellStyle.fontName);
    	odfStyle.setProperty(OdfStyleTextProperties.FontNameComplex, defaultCellStyle.fontName);
    }
    
    if ((cellStyleType.fontSize != defaultCellStyle.fontSize) || bDefault)
    {
      String pointValue = cellStyleType.fontSize + Unit.POINT.abbr();
      odfStyle.setProperty(OdfStyleTextProperties.FontSize, pointValue);
      odfStyle.setProperty(OdfStyleTextProperties.FontSizeAsian, pointValue);
      odfStyle.setProperty(OdfStyleTextProperties.FontSizeComplex, pointValue);
    }
    
    if (ConversionUtil.hasValue(cellStyleType.fontColor) && (!cellStyleType.fontColor.equals(defaultCellStyle.fontColor) || bDefault))
    {
      odfStyle.setProperty(OdfStyleTextProperties.Color, cellStyleType.fontColor);
      if(odfStyle.getProperty(OdfStyleTextProperties.UseWindowFontColor) != null)
        odfStyle.removeProperty(OdfStyleTextProperties.UseWindowFontColor);
    } else if(odfStyle.hasProperty(OdfStyleTextProperties.Color))
    {
      odfStyle.removeProperty(OdfStyleTextProperties.Color);
    }

    if ((cellStyleType.fontItalic != defaultCellStyle.fontItalic) || bDefault)
    {
      if (cellStyleType.fontItalic)
      {
        odfStyle.setProperty(OdfStyleTextProperties.FontStyle, FoFontStyleAttribute.Value.ITALIC.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontStyleAsian, FoFontStyleAttribute.Value.ITALIC.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontStyleComplex, FoFontStyleAttribute.Value.ITALIC.toString());
      }
      else
      {
        odfStyle.setProperty(OdfStyleTextProperties.FontStyle, FoFontStyleAttribute.Value.NORMAL.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontStyleAsian, FoFontStyleAttribute.Value.NORMAL.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontStyleComplex, FoFontStyleAttribute.Value.NORMAL.toString());
      }
    }

    if ((cellStyleType.fontUnderline != defaultCellStyle.fontUnderline) || bDefault)
    {
      if (cellStyleType.fontUnderline)
        odfStyle.setProperty(OdfStyleTextProperties.TextUnderlineStyle, StyleTextUnderlineStyleAttribute.Value.SOLID.toString());
      else
        odfStyle.setProperty(OdfStyleTextProperties.TextUnderlineStyle, StyleTextUnderlineStyleAttribute.Value.NONE.toString());
    }
    if ((cellStyleType.fontStrikeThrough != defaultCellStyle.fontStrikeThrough) || bDefault)
    {
      if (cellStyleType.fontStrikeThrough)
        odfStyle.setProperty(OdfStyleTextProperties.TextLineThroughStyle, StyleTextLineThroughStyleAttribute.Value.SOLID.toString());
      else
        odfStyle.setProperty(OdfStyleTextProperties.TextLineThroughStyle, StyleTextLineThroughStyleAttribute.Value.NONE.toString());
    }
    if ((cellStyleType.fontBold != defaultCellStyle.fontBold) || bDefault)
    {
      if (cellStyleType.fontBold)
      {
        odfStyle.setProperty(OdfStyleTextProperties.FontWeight, FoFontWeightAttribute.Value.BOLD.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightAsian, FoFontWeightAttribute.Value.BOLD.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightComplex, FoFontWeightAttribute.Value.BOLD.toString());
      }
      else
      {
        odfStyle.setProperty(OdfStyleTextProperties.FontWeight, FoFontWeightAttribute.Value.NORMAL.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightAsian, FoFontWeightAttribute.Value.NORMAL.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightComplex, FoFontWeightAttribute.Value.NORMAL.toString());
      }
    }else if(odfStyle.hasProperty(OdfStyleTextProperties.FontWeight))//TODO:other style properties should be cleared as font weight
    {
      odfStyle.removeProperty(OdfStyleTextProperties.FontWeight);
      odfStyle.removeProperty(OdfStyleTextProperties.FontWeightAsian);
      odfStyle.removeProperty(OdfStyleTextProperties.FontWeightComplex);
    }
    TableCellStyleConvertor.removeBorder(odfStyle);
    if ((TableCellStyleConvertor.isSameBorder(cellStyleType.borderLeft, cellStyleType.borderLeftColor, cellStyleType.borderLeftStyle, 
    		cellStyleType.borderRight, cellStyleType.borderRightColor, cellStyleType.borderRightStyle)) 
    		&& (TableCellStyleConvertor.isSameBorder(cellStyleType.borderLeft, cellStyleType.borderLeftColor, cellStyleType.borderLeftStyle, 
    				cellStyleType.borderBottom, cellStyleType.borderBottomColor, cellStyleType.borderBottomStyle))
    		&& (TableCellStyleConvertor.isSameBorder(cellStyleType.borderLeft, cellStyleType.borderLeftColor, cellStyleType.borderLeftStyle, 
    				cellStyleType.borderTop, cellStyleType.borderTopColor, cellStyleType.borderTopStyle))){    	
    	exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.Border, cellStyleType.borderLeft, cellStyleType.borderLeftColor, cellStyleType.borderLeftStyle, true);
    }
    else
    {
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderLeft, cellStyleType.borderLeft, cellStyleType.borderLeftColor, cellStyleType.borderLeftStyle, true);
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderRight, cellStyleType.borderRight, cellStyleType.borderRightColor, cellStyleType.borderRightStyle, true);
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderTop, cellStyleType.borderTop, cellStyleType.borderTopColor, cellStyleType.borderTopStyle, true);
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderBottom, cellStyleType.borderBottom, cellStyleType.borderBottomColor, cellStyleType.borderBottomStyle, true);
    }
    if (ConversionUtil.hasValue(cellStyleType.textAlign) && (!(cellStyleType.textAlign.equals(defaultCellStyle.textAlign)) || bDefault))
    {
      // compatiblity with ODF, left->start, right->end
      if (cellStyleType.textAlign.equalsIgnoreCase(ConversionConstant.DEFAULT_TEXT_ALIGN_VALUE))
        cellStyleType.textAlign = "start";
      else if (cellStyleType.textAlign.equalsIgnoreCase(ConversionConstant.TEXT_ALIGN_VALUE_RIGHT))
        cellStyleType.textAlign = "end";
      odfStyle.setProperty(OdfStyleParagraphProperties.TextAlign, cellStyleType.textAlign);
    }
    if (ConversionUtil.hasValue(cellStyleType.verticalAlign) && (!(cellStyleType.verticalAlign.equals(defaultCellStyle.verticalAlign)) || bDefault))
    {
      odfStyle.setProperty(OdfStyleTableCellProperties.VerticalAlign, cellStyleType.verticalAlign);
    }
    if (ConversionUtil.hasValue(cellStyleType.direction))
    {
      if (cellStyleType.direction.equalsIgnoreCase(ConversionConstant.RTL))
        cellStyleType.direction = ODFConstants.RL_TB;
      else if (cellStyleType.direction.equalsIgnoreCase(ConversionConstant.LTR))
        cellStyleType.direction = ODFConstants.LR_TB ;
      odfStyle.setProperty(OdfStyleParagraphProperties.WritingMode, cellStyleType.direction);
    }
    // TODO: check, and ODF2JSONConverter use Length.parse instead of ConversionUtil.ConvertToPX
    if ((cellStyleType.indent != defaultCellStyle.indent) || bDefault)
      odfStyle.setProperty(OdfStyleParagraphProperties.MarginLeft, ODSConvertUtil.convertPXToINCH(cellStyleType.indent));
    if ((cellStyleType.wraptext != defaultCellStyle.wraptext) || bDefault)
    {
      if (cellStyleType.wraptext)
        odfStyle.setProperty(OdfStyleTableCellProperties.WrapOption, FoWrapOptionAttribute.Value.WRAP.toString());
      else
        odfStyle.setProperty(OdfStyleTableCellProperties.WrapOption, FoWrapOptionAttribute.Value.NO_WRAP.toString());
    }

    boolean exportProtection = (Boolean)context.get("exportProtection");
    if(exportProtection)
    	odfStyle.setProperty(OdfStyleTableCellProperties.CellProtect, getProtectCell(cellStyleType.hidden, cellStyleType.unlocked));

    if (ConversionUtil.hasValue(cellStyleType.backgroundColor)
        && (!(cellStyleType.backgroundColor.equals(defaultCellStyle.backgroundColor)) || bDefault))
      odfStyle.setProperty(OdfStyleTableCellProperties.BackgroundColor, cellStyleType.backgroundColor);
    else if (!isParentWithBackground(odfStyle))
      odfStyle.removeProperty(OdfStyleTableCellProperties.BackgroundColor);
    autoStyles.appendChild(odfStyle);
    
    FormatStyleConvertor convertor = new FormatStyleConvertor();

    ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(cellStyleType.formatCategory, cellStyleType.formatCode, 
        cellStyleType.formatCurrency, cellStyleType.fmFontColor);
    convertor.convertStyle(context, odfStyle, format );
    HashMap<String,String> formatStyleMap = (HashMap<String, String>) context.get("formatStyleMap");
    String dataStyleName = odfStyle.getStyleDataStyleNameAttribute();
    if(ConversionUtil.hasValue(dataStyleName))
      formatStyleMap.put(cellStyleType.styleId,dataStyleName );
  }
  
  private String getProtectCell(boolean hidden, boolean unlocked){
	  if(!hidden && unlocked) 
		  return "none";
	  StringBuffer str = new StringBuffer();
	  if(!unlocked)
		  str.append("protected");
	  if(hidden){
		  if(str.length()!=0)
			  str.append(" ");
		  str.append("formula-hidden");
	  }
	  return str.toString();	 
  }
  
  private boolean isParentWithBackground(OdfStyle odfStyle)
  {
    if( odfStyle == null)
      return false;
    boolean withBackground = false;
    OdfStyleBase parentStyle = odfStyle.getParentStyle();
    while(null != parentStyle)
    {
      String b = parentStyle.getProperty(OdfStyleTableCellProperties.BackgroundColor);
      if(b != null && !"none".equals(b))
      {
        withBackground = true;
        break;
      }
      parentStyle = parentStyle.getParentStyle();
    }
    return withBackground;
  }
  
  public static void exportCellBorderStyle(OdfStyle odfStyle, OdfStyleProperty styleProperty, String borderKind, String borerColor, String borderStyle, boolean isReset)
  {
    if (ConversionUtil.hasValue(borderKind) && ConversionUtil.hasValue(borerColor) && ConversionUtil.hasValue(borderStyle))
    {
      if (borderKind.equals(ConversionConstant.DEFAULT_ZERO) )
      {
        if(isReset)
        {
          odfStyle.setProperty(styleProperty, "none");        
        }
      }
      else
      {
    	if(!borderStyle.equals("double")){
    		odfStyle.removeProperty(OdfStyleTableCellProperties.BorderLineWidth);
        	odfStyle.removeProperty(OdfStyleTableCellProperties.BorderLineWidthBottom);
        	odfStyle.removeProperty(OdfStyleTableCellProperties.BorderLineWidthLeft);
        	odfStyle.removeProperty(OdfStyleTableCellProperties.BorderLineWidthRight);
        	odfStyle.removeProperty(OdfStyleTableCellProperties.BorderLineWidthTop);
    	}    	
        String borderWidth = ODSConvertUtil.BORDER_WIDTH_THIN;// 0.05pt
        if (borderKind.equalsIgnoreCase(ConversionConstant.DEFAULT_BORDER_THICK))
        {
          borderWidth = ODSConvertUtil.BORDER_WIDTH_THICK;// 2.5pt
        }
        String border = borderWidth + " " + getODSBorderStyle(borderStyle) + " " + borerColor;
        odfStyle.setProperty(styleProperty, border);
      }
    }
  }
  
  public static boolean isSameBorder(String borderKind1, String borerColor1, String borderStyle1, String borderKind2, String borerColor2, String borderStyle2){
	  if(borderKind1 != null && borderKind2 != null && (!borderKind1.equals(borderKind2))){
		  return false;
	  }
	  if(borerColor1 != null && borerColor2 != null && (!borerColor1.equals(borerColor2))){
		  return false;
	  }
	  if(borderStyle1 != null && borderStyle2 != null && (!borderStyle1.equals(borderStyle2))){
		  return false;
	  }	  
	  return true;
  }
  
  public static void removeBorder(OdfStyle odfStyle){
	  odfStyle.removeProperty(OdfStyleTableCellProperties.Border);
	  odfStyle.removeProperty(OdfStyleTableCellProperties.BorderLeft);
      odfStyle.removeProperty(OdfStyleTableCellProperties.BorderRight);
      odfStyle.removeProperty(OdfStyleTableCellProperties.BorderBottom);
      odfStyle.removeProperty(OdfStyleTableCellProperties.BorderTop);
  }
  
  public static String getODSBorderStyle(String borderStyle){
	  String style = "solid";
	  if(borderStyle !=null && borderStyle.equals("double"))
		  style = "double";
	  return style;
  }
}
