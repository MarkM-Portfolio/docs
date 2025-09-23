/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.style;

import java.util.HashMap;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableCellProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.PositiveLength;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.attribute.AttributeConvertorFactory;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.NumberFormat;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.StyleMap;

public class TableCellStyleHelper
{
  private static final Logger LOG = Logger.getLogger(TableCellStyleHelper.class.getName());

  public void convert(OdfElement styles, ConversionContext context)
  {
    LOG.entering(getClass().getName(), "convert");
    Document document = (Document) context.get("Target");
    HashMap<String, ConversionUtil.NumberFormat> cellFormatNameIdMap = (HashMap<String, NumberFormat>) context.get("cellFormatNameIdMap");
    HashMap<String, StyleMap> cellFormatStyleIdMap = (HashMap<String, StyleMap>) context.get("cellFormatStyleIdMap");
    HashMap<String, String> cellStyleNameIdMap = (HashMap<String, String>) context.get("cellStyleNameIdMap");
    HashMap<String, CellStyleType> cellCurrencyMap = (HashMap<String, CellStyleType>) context.get("cellCurrencyMap");
    try
    {
      Iterator<OdfStyle> cellStyleIter = null;
      if (styles instanceof OdfOfficeAutomaticStyles)
      {
        OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles) styles;
        cellStyleIter = autoStyles.getStylesForFamily(OdfStyleFamily.TableCell).iterator();
      }
      else
      {
        OdfOfficeStyles ostyles = (OdfOfficeStyles) styles;
        cellStyleIter = ostyles.getStylesForFamily(OdfStyleFamily.TableCell).iterator();
      }

      while (cellStyleIter.hasNext())
      {
        OdfStyle odfCellStyle = cellStyleIter.next();
        ConversionUtil.CellStyleType cellStyle = new ConversionUtil.CellStyleType();

        // fill cell style
        // get referenced number format style
        String formatStyleName = odfCellStyle.getStyleDataStyleNameAttribute();
        String parentStyleName = odfCellStyle.getStyleParentStyleNameAttribute();
        OdfStyle parent = null;
        if (ConversionUtil.hasValue(parentStyleName))
          parent = (OdfStyle) odfCellStyle.getParentStyle();
        while (formatStyleName == null && ConversionUtil.hasValue(parentStyleName) && !parentStyleName.equals("Default"))
        {
          formatStyleName = parent.getStyleDataStyleNameAttribute();
          parentStyleName = parent.getStyleParentStyleNameAttribute();
          if (ConversionUtil.hasValue(parentStyleName))
            parent = (OdfStyle) parent.getParentStyle();
        }
        if (formatStyleName != null)
        {
          if (cellFormatNameIdMap.containsKey(formatStyleName))
          {
            ConversionUtil.NumberFormat format = cellFormatNameIdMap.get(formatStyleName);
            if (format != null)
            {
              cellStyle.formatCategory = format.getCategory();
              cellStyle.formatCode = format.getCode();
              if (format.getCurrency() != null)
                  cellStyle.formatCurrency = format.getCurrency();
              // check if it has style map
              List<StyleMap> maps = (List<StyleMap>) cellFormatStyleIdMap.get(formatStyleName);
              if (maps != null)
              {
                  cellStyle.fmFontColor = format.getFmFontColor();
                  updateCellStyleWithStyleMap(context, cellStyle, maps);
              }
              else{
                  String fc = format.getFmFontColor();
            	  cellStyle.fmFontColor = fc;
//                  if(ODSConvertUtil.isValidTextFormatCode(cellStyle.formatCode))
//                  cellStyle.fmFontColor_text = format.getFmFontColor();
              }

            }
          }
          // TODO bug fix for Book1.ods at B16:C18
          // the format style might be composed by several styles
          // for example,the value greater than 0 or less than 0 might have different style
        }
        convertTextProperties(document, odfCellStyle, cellStyle);
        convertTableCellBorderProperties(context, odfCellStyle, cellStyle);
        convertTextAlignment(odfCellStyle, cellStyle);
        convertVerticalAlignment(odfCellStyle, cellStyle);
        convertDirection(odfCellStyle, cellStyle);
        // : indent here is the left margin, Sym1.x does not support the right margin
        // and indent use mm as the unit
        String marginLeft = odfCellStyle.getProperty(OdfStyleParagraphProperties.MarginLeft);
        if (marginLeft != null)
        {
          cellStyle.indent = PositiveLength.parseInt(marginLeft, Unit.PIXEL);
        }
        // TODO: the unit of color? RGB or int
        String backgroundColor = odfCellStyle.getProperty(OdfStyleTableCellProperties.BackgroundColor);
        if (backgroundColor != null)
          cellStyle.backgroundColor = backgroundColor;
        String wrap = odfCellStyle.getProperty(OdfStyleTableCellProperties.WrapOption);
        if (wrap != null)
          cellStyle.wraptext = wrap.equalsIgnoreCase("wrap");

        // get cell protection styles        
        String cellProtect = odfCellStyle.getProperty(OdfStyleTableCellProperties.CellProtect);       
        if (cellProtect != null)
          setCellProtectInfo(cellStyle, cellProtect);

        String cellStyleName = odfCellStyle.getStyleNameAttribute();
        
        if (ConversionUtil.hasValue(cellStyleName))
        {
          if (!cellStyle.storeContentToJSON().isEmpty())
          {
            cellStyle.styleId = cellStyleName;
            cellStyle.styleId = getExistStyleId(document, cellStyle);
            if (!ConversionUtil.hasValue(cellStyle.styleId))
            {
              if(ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(cellStyleName)){
                cellStyle.styleId = ConversionConstant.DEFAULT_CELL_STYLE_NAME;
                document.defaultStyle = cellStyle;
              }else
                cellStyle.styleId = createStyleId(context);   
              document.cellStyleList.add(cellStyle);
            }
          }
          else
            cellStyle.styleId = ConversionConstant.DEFAULT_CELL_STYLE;
          // for currency, the currency symbol is decided by the cell content, office:currency attribute
          if (ConversionConstant.CURRENCY_TYPE.equals(cellStyle.formatCategory))//Not sure about the logic here... && !ConversionUtil.hasValue(cellStyle.formatCategory_n))
          {
            cellCurrencyMap.put(cellStyle.styleId, cellStyle);
          }
          cellStyleNameIdMap.put(cellStyleName, cellStyle.styleId);
        }
      }

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Convert cell style failed", e);
    }
  }

  private void setCellProtectInfo(ConversionUtil.CellStyleType cellStyle, String cellProtect){
	  if(cellProtect == null) return;
	  String str = cellProtect.toLowerCase();
	  if("hidden-and-protected".equalsIgnoreCase(str)){	  
		  cellStyle.hidden = true;
		  return;
	  }
	  if("formula-hidden".equalsIgnoreCase(str)){	  
		  cellStyle.hidden = true;
		  cellStyle.unlocked = true;
		  return;
	  }
	  if("none".equalsIgnoreCase(str)){
		  cellStyle.unlocked = true;
		  return;
	  }
	  if(str.indexOf("formula-hidden") >= 0){
		  cellStyle.hidden = true;
	  }	  
  }
  public static String createStyleId(ConversionContext context)
  {
    int styleIndex = (Integer)context.get("styleIndex");
    String id = ConversionConstant.SID + styleIndex++;
    context.put("styleIndex", styleIndex);
    return id;
  }

  private void convertTextAlignment(OdfStyle odfCellStyle, ConversionUtil.CellStyleType cellStyle)
  {
    String textAlign = odfCellStyle.getProperty(OdfStyleParagraphProperties.TextAlign);
    if (textAlign != null)
    {
      if (textAlign.equalsIgnoreCase("start"))
        textAlign = "left";
      else if (textAlign.equalsIgnoreCase("end"))
        textAlign = "right";
      cellStyle.textAlign = textAlign;
    }
  }
  
  private void convertVerticalAlignment(OdfStyle odfCellStyle, ConversionUtil.CellStyleType cellStyle)
  {
    String verticalAlign = odfCellStyle.getProperty(OdfStyleTableCellProperties.VerticalAlign);
    if (verticalAlign != null)
    {
      cellStyle.verticalAlign = verticalAlign;
    }
  }
 
  private void convertDirection(OdfStyle odfCellStyle, ConversionUtil.CellStyleType cellStyle)
  {
    String writingMode = odfCellStyle.getProperty(OdfStyleParagraphProperties.WritingMode);
    if (writingMode != null)
    {
      if (writingMode.equalsIgnoreCase(ODFConstants.RL_TB))
    	  cellStyle.direction = "rtl";
      else if (writingMode.equalsIgnoreCase(ODFConstants.LR_TB))
    	  cellStyle.direction = "ltr";
    }
  }

  private void convertTextProperties(Document document, OdfStyle odfCellStyle, ConversionUtil.CellStyleType cellStyle)
  {
    // other property of cell style
    String fontName = odfCellStyle.getProperty(OdfStyleTextProperties.FontName);
    // TODO not set font name here
    if (fontName != null)
      cellStyle.fontName = fontName;
    // TODO:fontsize must be "pt" ? String or int
    String fontSize = odfCellStyle.getProperty(OdfStyleTextProperties.FontSize);
    if (fontSize != null)
    {
      cellStyle.fontSize = Length.parseDouble(fontSize, Unit.POINT);
    }

    if (document.fontMap != null)
    {
      String fontFamily = document.fontMap.get(cellStyle.fontName);
      if (fontFamily != null)
        cellStyle.fontName = fontFamily;
    }
    // TODO: fontColor should be RGB like "#ffffff"
    String fontColor = odfCellStyle.getProperty(OdfStyleTextProperties.Color);
    if (fontColor != null)
      cellStyle.fontColor = fontColor;
    String italiaStyle = odfCellStyle.getProperty(OdfStyleTextProperties.FontStyle);
    if (italiaStyle != null)
      cellStyle.fontItalic = italiaStyle.equalsIgnoreCase("italic");
    // TODO: underline and strike through can be solid, double, etc. here just check if it has value
    String underlineStyle = odfCellStyle.getProperty(OdfStyleTextProperties.TextUnderlineStyle);
    if (underlineStyle != null)
      cellStyle.fontUnderline = !underlineStyle.equalsIgnoreCase("none");
    String strikeThroughStyle = odfCellStyle.getProperty(OdfStyleTextProperties.TextLineThroughStyle);
    if (strikeThroughStyle != null)
      cellStyle.fontStrikeThrough = !strikeThroughStyle.equalsIgnoreCase("none");
    String boldStyle = odfCellStyle.getProperty(OdfStyleTextProperties.FontWeight);
    if (boldStyle != null)
      cellStyle.fontBold = boldStyle.equalsIgnoreCase("bold");

  }

  private void convertTableCellBorderProperties(ConversionContext context, OdfStyle odfCellStyle, ConversionUtil.CellStyleType cellStyle)
  {
    Set<OdfStyleProperty> set = new HashSet<OdfStyleProperty>();
    // contain fo:border in cell style
    boolean bBorder = odfCellStyle.hasProperty(OdfStyleTableCellProperties.Border);
    if (bBorder)
      set.add(OdfStyleTableCellProperties.Border);
    else
    {
      // contain fo:left-border in cell style
      boolean bLeftBorder = odfCellStyle.hasProperty(OdfStyleTableCellProperties.BorderLeft);
      if (bLeftBorder)
      {
        set.add(OdfStyleTableCellProperties.BorderLeft);
        set.add(OdfStyleTableCellProperties.BorderRight);
        set.add(OdfStyleTableCellProperties.BorderTop);
        set.add(OdfStyleTableCellProperties.BorderBottom);
      }
      else
      {
        // get the border property from parent style
        set.add(OdfStyleTableCellProperties.Border);
        set.add(OdfStyleTableCellProperties.BorderLeft);
        set.add(OdfStyleTableCellProperties.BorderRight);
        set.add(OdfStyleTableCellProperties.BorderTop);
        set.add(OdfStyleTableCellProperties.BorderBottom);
      }
    }
    Map<OdfStyleProperty, String> map = odfCellStyle.getProperties(set);
    Iterator<Entry<OdfStyleProperty, String>> entries = map.entrySet().iterator();
    while (entries.hasNext())
    {
      Entry<OdfStyleProperty, String> entry = entries.next();
      String qName = entry.getKey().getName().getQName();
      if (entry.getValue() != null)
        AttributeConvertorFactory.getInstance().getConvertor(qName).convert(context, cellStyle, qName, entry.getValue());
    }
  }

  // {
  // //do not use getProperty here, because if this element does not have such property
  // //it will also search for the parent style.
  // // String border = odfCellStyle.getProperty(OdfStyleTableCellProperties.Border);
  // boolean bBorder = odfCellStyle.hasProperty(OdfStyleTableCellProperties.Border);
  // if (bBorder)
  // {
  // String qName = OdfStyleTableCellProperties.Border.getName().getQName();
  // AttributeConvertorFactory.getInstance().getConvertor(qName).convert(context, cellStyle, qName, border);
  // }
  // else
  // {
  // Set<OdfStyleProperty> set = new HashSet<OdfStyleProperty>();
  //
  // set.add(OdfStyleTableCellProperties.BorderLeft);
  // set.add(OdfStyleTableCellProperties.BorderRight);
  // set.add(OdfStyleTableCellProperties.BorderTop);
  // set.add(OdfStyleTableCellProperties.BorderBottom);
  // Map<OdfStyleProperty, String> map = odfCellStyle.getProperties(set);
  // Iterator<Entry<OdfStyleProperty, String>> entries = map.entrySet().iterator();
  // while (entries.hasNext())
  // {
  // Entry<OdfStyleProperty, String> entry = entries.next();
  // String qName = entry.getKey().getName().getQName();
  // if (entry.getValue() != null)
  // AttributeConvertorFactory.getInstance().getConvertor(qName).convert(context, cellStyle, qName, entry.getValue());
  // }
  // }
  // }

  private String getExistStyleId(Document document, ConversionUtil.CellStyleType cellStyle)
  {
    for (int i = 0; i < document.cellStyleList.size(); i++)
    {
      ConversionUtil.CellStyleType style = document.cellStyleList.get(i);
      if (style.hasSameContent(cellStyle) 
          && !ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(cellStyle.styleId)
          && !ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(style.styleId))
        return style.styleId;
    }
    return null;
  }

  private void updateCellStyleWithStyleMap(ConversionContext context, CellStyleType cellStyle, List<StyleMap> maps)
  {
    HashMap<String, ConversionUtil.NumberFormat> cellFormatNameIdMap = (HashMap<String, NumberFormat>) context.get("cellFormatNameIdMap");
    Iterator<StyleMap> mapIter = maps.iterator();
    StringBuffer formatCodeStr = new StringBuffer();
    StringBuffer formatColorStr = new StringBuffer();
    StringBuffer formatCategoryStr = new StringBuffer();
    StringBuffer formatCurrencyStr = new StringBuffer();
    String pCategory = cellStyle.formatCategory;
    String nCategory = "";
    String zCategory = "";
    String pCode = cellStyle.formatCode;
    String nCode = "";
    String zCode = "";
    String pCurr = cellStyle.formatCurrency;
    String nCurr = "";
    String zCurr = "";
    String pColor = cellStyle.fmFontColor;
    String nColor = "";
    String zColor = "";
   
    boolean p = false, n = false, z = false;
    while (mapIter.hasNext()) {                         
        StyleMap map = mapIter.next();
        String num = map.getValue();
        if ("0".equals(num)) {
            String op = map.getOperator();
            String aStyleName = map.getMapStyle();
            ConversionUtil.NumberFormat aFormat = cellFormatNameIdMap.get(aStyleName);
            String aFormatCode = null;
            String aFormatColor = null;
            if (aFormat != null) {
                aFormatCode = aFormat.getCode();
                aFormatColor = aFormat.getFmFontColor() != null ? aFormat.getFmFontColor() : "";
              //  if (!aFormatCode.equals(cellStyle.formatCode)) { //[blue]#.0;[red]#.00;[green]#.0(missing)
                    if (op.equals(">")) {
                        pCode = aFormatCode;
                        pColor = aFormatColor;
                        pCategory = aFormat.getCategory();
                        pCurr = aFormat.getCurrency();
                        p = true;
                    } else if (op.equals(">=")) {
                        zCode = pCode = aFormatCode;
                        zColor = pColor = aFormatColor;
                        zCategory = pCategory = aFormat.getCategory();
                        zCurr = pCurr = aFormat.getCurrency();
                        z = p = true;
                    } else if (op.equals("<")) {
                        nCode = aFormatCode;
                        nColor = aFormatColor;
                        nCategory = aFormat.getCategory();
                        nCurr = aFormat.getCurrency();
                        n = true;
                    } else if (op.equals("<=")) {
                        zCode = nCode = aFormatCode;
                        zColor = nColor = aFormatColor;
                        zCategory = nCategory = aFormat.getCategory();
                        zCurr = nCurr = aFormat.getCurrency();
                        z = n = true;
                    } else if (op.equals("=")) {
                        zCode = aFormatCode;
                        zColor = aFormatColor;
                        zCategory = aFormat.getCategory();
                        zCurr = aFormat.getCurrency();
                        z = true;
                    } else if (op.equals("<>")) { 
                    	pCode = aFormatCode;
                    	pColor = aFormatColor;
                    	pCategory = aFormat.getCategory();
                    	pCurr = aFormat.getCurrency();
                    	p = true;
                    	if(!n){	//  "n(<);z(=);p(<>);t"
	                        nCode = pCode;
	                        nColor = pColor;
	                        nCategory = pCategory;
	                        nCurr = pCurr;
	                        n = p;
                    	}
                    }   
              //  }
            }
        }
    }
    
    if(p || (cellStyle.formatCategory != "text")){
    	formatCodeStr.append(pCode);
    	formatColorStr.append(pColor);
    	formatCategoryStr.append(pCategory);
    	formatCurrencyStr.append(pCurr);
    	p = true;
    }
    if(n){ 
    	formatCodeStr.append(";" + nCode);
    	formatColorStr.append(";" + nColor);
    	formatCategoryStr.append(";" + nCategory);
    	formatCurrencyStr.append(";" + nCurr);
    }
    else if(p && z && cellStyle.formatCategory != "text"){	// [blue]#.0;[green]#.00 ==> p & n & z	 [blue]#.0;[red]@@ ==> p & n & z & t
    	formatCodeStr.append(";" + cellStyle.formatCode);
    	formatColorStr.append(";" + cellStyle.fmFontColor);
    	formatCategoryStr.append(";" + cellStyle.formatCategory);
    	formatCurrencyStr.append(";" + cellStyle.formatCurrency);
    }
    else{	//[blue]#.0;[green]@@ ==> p & z & t
    	formatCodeStr.append(";");
    	formatColorStr.append(";");
    	formatCategoryStr.append(";");
    	formatCurrencyStr.append(";");
    }
   
    if(z){
    	formatCodeStr.append(";" + zCode);
    	formatColorStr.append(";" + zColor);
    	formatCategoryStr.append(";" + zCategory);
    	formatCurrencyStr.append(";" + zCurr);
    }else if(n && cellStyle.formatCategory.equals("text")){ // "<0;@"
		formatCodeStr.append(";");
    	formatColorStr.append(";");
    	formatCategoryStr.append(";");
    	formatCurrencyStr.append(";");
	}
    
    if((p && n) || cellStyle.formatCategory.equals("text")){ // "n;z;p;t"
    	formatCodeStr.append(";" + cellStyle.formatCode);
    	formatColorStr.append(";" + cellStyle.fmFontColor);
    	formatCategoryStr.append(";" + cellStyle.formatCategory);
    	formatCurrencyStr.append(";" + cellStyle.formatCurrency);
    }

    cellStyle.formatCode = formatCodeStr.toString();
    cellStyle.fmFontColor = formatColorStr.toString();
    cellStyle.formatCurrency = formatCurrencyStr.toString();
    cellStyle.formatCategory = formatCategoryStr.toString(); 
    
    LOG.exiting(getClass().getName(), "convert");
  }

}
