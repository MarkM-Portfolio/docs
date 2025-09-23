/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.impl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Stack;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import javax.xml.bind.DatatypeConverter;

import org.antlr.runtime.ANTLRInputStream;
import org.antlr.runtime.CommonTokenStream;
import org.antlr.runtime.RecognitionException;
import org.antlr.runtime.Token;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.number.OdfNumber;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.spreadsheet.ServiceConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class ConversionUtil {

  private static final Logger LOG = Logger.getLogger(ConversionUtil.class.getName());
  private static final Pattern PATTERN_FORMULA = Pattern.compile("(^=.+)|(^\\{=.+\\}$)");
  
  private static final Pattern PATTERN_EXTERNAL_FORMULA = Pattern.compile("\\['file:///(.+)'([^\\[\\]]+)\\]");
  
  /**
   * OO format
   */
  public final static String[] ooFormulaCategory = { "com.sun.star.sheet.addin.DateFunctions.get","com.sun.star.sheet.addin.Analysis.get"};
  public final static String OOOPREFIX = "ORG.OPENOFFICE.";
  public final static String OOOC = "OOOC:";
  
  private static enum FState {NONE, SINGLEQUOTE, DOUBLEQUOTE};
  private static HashMap<String,String> longkey2ShortMap; 
  public static volatile boolean _cellHasUnicode = false;
  
  private static final String TEXTREGEX = "@";
  private static final Pattern pattern = Pattern.compile(TEXTREGEX);
  
  private static final int MAX_NUM_VALIDATION = 5000;

  /**
   * An Interface for converting spreadsheet related object to JSON object
   *
   */
  public interface JSONModel{
    /**
     * convert spreadsheet related inner class to content.js
     * @return content JSON object
     */
    public OrderedJSONObject storeContentToJSON();
    /**
     * convert spreadsheet related inner class to meta.js 
     * @return meta JSON object
     */
    public OrderedJSONObject storeMetaToJSON();
    /**
     * convert spreadsheet related inner class to ref.js
     * @return ref JSON object
     */
    public OrderedJSONObject storeRefToJSON();
    /**
     * convert JSON object to construct spreadsheet related inner class
     */
    public void getObjectFromJSON() throws IOException;
    
    public JSONType getType();
  }

  /**
   * CellStyleType is a structure which represent a JSON object for styles tag
   * 
   */
  public static class CellStyleType implements JSONModel{
	  public String styleId;
    /***
     * tags from content.js
     */
	public int formatIndex;
    public String formatCategory;
    public String formatCode;
    public String formatCurrency;
    // font style
    public String fontName;
    public double fontSize;
    public String fontColor;
    public String fmFontColor;
    public boolean fontItalic;
    public boolean fontUnderline;
    public boolean fontStrikeThrough;
    public boolean fontBold;

    //border style
    public String borderLeft;
    public String borderRight;
    public String borderTop;
    public String borderBottom;

    //bordercolor style
    public String borderLeftColor;
    public String borderRightColor;
    public String borderTopColor;
    public String borderBottomColor;
    
    //border Style set
    public String borderLeftStyle;
    public String borderRightStyle;
    public String borderBottomStyle;
    public String borderTopStyle;    

    public String textAlign;
    public String verticalAlign;
    public String backgroundColor;
    public int indent;
    public boolean wraptext;
    public String direction;
    
    // style for cell protection
    public boolean hidden;
    public boolean unlocked;
    
    // preserve style(transformed from column style)
    public String preserveStyleName;
    
    /***
     * tags from meta.js
     */
    /***
     * for save back
     */
    public JSONObject stytleContentJSON;
    public JSONObject styleMetaJSON;

    /**
     * set default attribute of CellStyleType
     */
    public CellStyleType(){
      styleId = "";
      formatCategory = "";
      formatCode = "";
      formatCurrency = "";
      //set default value for the styles
      fontName = ConversionConstant.DEFAULT_FONT_NAME;
      fontSize = ConversionConstant.DEFAULT_FONT_SIZE;
      fontColor = ConversionConstant.DEFAULT_BLACK_COLOR_VALUE;
      fmFontColor = "";
      fontItalic = ConversionConstant.DEFAULT_FALSE;
      fontUnderline = ConversionConstant.DEFAULT_FALSE;
      fontStrikeThrough = ConversionConstant.DEFAULT_FALSE;
      fontBold = ConversionConstant.DEFAULT_FALSE;

      //ConversionConstant.DEFAULT_ZERO maps to NONE
      borderLeft = ConversionConstant.DEFAULT_ZERO;
      borderRight = ConversionConstant.DEFAULT_ZERO;
      borderTop = ConversionConstant.DEFAULT_ZERO;
      borderBottom = ConversionConstant.DEFAULT_ZERO;

      borderLeftColor = ConversionConstant.DEFAULT_BLACK_COLOR_VALUE;
      borderRightColor = ConversionConstant.DEFAULT_BLACK_COLOR_VALUE;
      borderTopColor = ConversionConstant.DEFAULT_BLACK_COLOR_VALUE;
      borderBottomColor = ConversionConstant.DEFAULT_BLACK_COLOR_VALUE;

      borderLeftStyle = ConversionConstant.DEFAULT_BORDER_STYLE;
      borderRightStyle = ConversionConstant.DEFAULT_BORDER_STYLE;
      borderBottomStyle = ConversionConstant.DEFAULT_BORDER_STYLE;
      borderTopStyle = ConversionConstant.DEFAULT_BORDER_STYLE;
      
//      textAlign = ConversionConstant.DEFAULT_TEXT_ALIGN_VALUE;
      textAlign = "";
      verticalAlign = "";
      backgroundColor = ConversionConstant.DEFAULT_WHITE_COLOR_VALUE;
      indent = ConversionConstant.DEFAULT_ZERO_FLOAT;
      wraptext = ConversionConstant.DEFAULT_FALSE;
      direction = "";
      stytleContentJSON = null;
      styleMetaJSON = null;
      hidden = false;
      unlocked = false;
    }	

    //copy constructure
    public CellStyleType(CellStyleType copy){
        styleId = copy.styleId;
        //set default value for the styles
        formatCategory = copy.formatCategory;
        formatCode = copy.formatCode;
        formatCurrency = copy.formatCurrency;
        fontName = copy.fontName;
        fontSize = copy.fontSize;
        fontColor = copy.fontColor;
        fmFontColor = copy.fmFontColor;
        fontItalic = copy.fontItalic;
        fontUnderline = copy.fontUnderline;
        fontStrikeThrough = copy.fontStrikeThrough;
        fontBold = copy.fontBold;

        //ConversionConstant.DEFAULT_ZERO maps to NONE
        borderLeft = copy.borderLeft;
        borderRight = copy.borderRight;
        borderTop = copy.borderTop;
        borderBottom = copy.borderBottom;

        borderLeftColor = copy.borderLeftColor;
        borderRightColor = copy.borderRightColor;
        borderTopColor = copy.borderTopColor;
        borderBottomColor = copy.borderBottomColor;

        borderLeftStyle = copy.borderLeftStyle;
        borderRightStyle = copy.borderRightStyle;
        borderBottomStyle = copy.borderBottomStyle;
        borderTopStyle = copy.borderTopStyle;
        
//        textAlign = ConversionConstant.DEFAULT_TEXT_ALIGN_VALUE;
        textAlign = copy.textAlign;
        verticalAlign = copy.verticalAlign;
        backgroundColor = copy.backgroundColor;
        indent = copy.indent;
        wraptext = copy.wraptext;
        direction = copy.direction;
        stytleContentJSON = copy.stytleContentJSON;
        styleMetaJSON = copy.styleMetaJSON;
        hidden = copy.hidden;
        unlocked = copy.unlocked;
      }
    
    public OrderedJSONObject storeContentToJSON(){
      return storeContentToJSON(false);
    }

    //if bDefault is true, then also put the default value to JSON
    //this is used to store the defaultCellStyle to "styles"
    public OrderedJSONObject storeContentToJSON( boolean bDefault){

      OrderedJSONObject cellStyleJSON = new OrderedJSONObject();
      //the fontStyleJSON object is a JSON object for font style
      OrderedJSONObject fontStyleJSON = new OrderedJSONObject();
      if( (!fontName.equals(ConversionConstant.DEFAULT_FONT_NAME)) || bDefault)
        fontStyleJSON.put(ConversionConstant.FONTNAME,fontName);
      if( (fontSize != ConversionConstant.DEFAULT_FONT_SIZE) || bDefault)
        fontStyleJSON.put(ConversionConstant.SIZE, fontSize);
      if( (!fontColor.equals(ConversionConstant.DEFAULT_BLACK_COLOR_VALUE)) || bDefault)
        fontStyleJSON.put(ConversionConstant.COLOR, fontColor);
      if(fontItalic || bDefault)
        fontStyleJSON.put(ConversionConstant.ITALIC, fontItalic);
      if(fontUnderline || bDefault)
        fontStyleJSON.put(ConversionConstant.UNDERLINE, fontUnderline);
      if(fontStrikeThrough || bDefault)
        fontStyleJSON.put(ConversionConstant.STRIKTHROUGH, fontStrikeThrough);
      if(fontBold || bDefault)
        fontStyleJSON.put(ConversionConstant.BOLD, fontBold);

      OrderedJSONObject formatStyleJSON = new OrderedJSONObject();
      if(hasValue(formatCategory) || bDefault)
        formatStyleJSON.put(ConversionConstant.FORMATCATEGORY, formatCategory);
      if(hasValue(formatCode) || bDefault)
        formatStyleJSON.put(ConversionConstant.FORMATCODE, formatCode);
      if (hasValue(formatCurrency) || bDefault)
        formatStyleJSON.put(ConversionConstant.FORMATCURRENCY, formatCurrency);
      if (hasValue(fmFontColor) || bDefault)
    	  formatStyleJSON.put(ConversionConstant.FORMAT_FONTCOLOR, fmFontColor);
 
      //the borderStyleJSON object is a JSON object for border style
      OrderedJSONObject borderStyleJSON = new OrderedJSONObject();
      if( (!borderLeft.equals(ConversionConstant.DEFAULT_ZERO)) || bDefault)
        borderStyleJSON.put(ConversionConstant.BORDER_LEFT, borderLeft);
      if( (!borderRight.equals(ConversionConstant.DEFAULT_ZERO)) || bDefault)
        borderStyleJSON.put(ConversionConstant.BORDER_RIGHT, borderRight);
      if( (!borderTop.equals(ConversionConstant.DEFAULT_ZERO)) || bDefault)
        borderStyleJSON.put(ConversionConstant.BORDER_TOP, borderTop);
      if( (!borderBottom.equals(ConversionConstant.DEFAULT_ZERO)) || bDefault)
        borderStyleJSON.put(ConversionConstant.BORDER_BOTTOM, borderBottom);

      //the borderColorJSON object is a JSON object for border color style
      //TO CONFIRM
      OrderedJSONObject borderColorJSON = new OrderedJSONObject();
      if( (!borderLeftColor.equals(ConversionConstant.DEFAULT_BLACK_COLOR_VALUE)) || bDefault)
        borderColorJSON.put(ConversionConstant.BORDER_LEFT_COLOR, borderLeftColor);
      if( (!borderRightColor.equals(ConversionConstant.DEFAULT_BLACK_COLOR_VALUE)) || bDefault)
        borderColorJSON.put(ConversionConstant.BORDER_RIGHT_COLOR, borderRightColor);
      if( (!borderTopColor.equals(ConversionConstant.DEFAULT_BLACK_COLOR_VALUE)) || bDefault)
        borderColorJSON.put(ConversionConstant.BORDER_TOP_COLOR, borderTopColor);
      if( (!borderBottomColor.equals(ConversionConstant.DEFAULT_BLACK_COLOR_VALUE)) || bDefault)
        borderColorJSON.put(ConversionConstant.BORDER_BOTTOM_COLOR, borderBottomColor);
      OrderedJSONObject borderLineStyleJSON = new OrderedJSONObject();
      if( (!borderLeftStyle.equals(ConversionConstant.DEFAULT_BORDER_STYLE)) || bDefault)
    	  borderLineStyleJSON.put(ConversionConstant.BORDER_LEFT_STYLE, borderLeftStyle);
      if( (!borderRightStyle.equals(ConversionConstant.DEFAULT_BORDER_STYLE)) || bDefault)
    	  borderLineStyleJSON.put(ConversionConstant.BORDER_RIGHT_STYLE, borderRightStyle);
      if( (!borderTopStyle.equals(ConversionConstant.DEFAULT_BORDER_STYLE)) || bDefault)
    	  borderLineStyleJSON.put(ConversionConstant.BORDER_TOP_STYLE, borderTopStyle);
      if( (!borderBottomStyle.equals(ConversionConstant.DEFAULT_BORDER_STYLE)) || bDefault)
    	  borderLineStyleJSON.put(ConversionConstant.BORDER_BOTTOM_STYLE, borderBottomStyle);
      
      if(!formatStyleJSON.isEmpty())
          cellStyleJSON.put(ConversionConstant.FORMAT, formatStyleJSON);      
      if(!fontStyleJSON.isEmpty())
        cellStyleJSON.put(ConversionConstant.FONT, fontStyleJSON);
      if(!borderStyleJSON.isEmpty())
        cellStyleJSON.put(ConversionConstant.BORDER,borderStyleJSON);
      if(!borderColorJSON.isEmpty())
        cellStyleJSON.put(ConversionConstant.BORDERCOLOR, borderColorJSON);
      if(!borderLineStyleJSON.isEmpty())
    	  cellStyleJSON.put(ConversionConstant.BORDERSTYLE, borderLineStyleJSON);
      if(hasValue(textAlign) || bDefault){
    	  cellStyleJSON.put(ConversionConstant.TEXT_ALIGN, textAlign);
      }
      if(hasValue(verticalAlign) || bDefault){
    	  cellStyleJSON.put(ConversionConstant.VERTICAL_ALIGN, verticalAlign);
      }
      if( (!backgroundColor.equals(ConversionConstant.DEFAULT_WHITE_COLOR_VALUE)) || bDefault)
        cellStyleJSON.put(ConversionConstant.BACKGROUND_COLOR, backgroundColor);
      if( (indent != ConversionConstant.DEFAULT_ZERO_FLOAT) || bDefault)
        cellStyleJSON.put(ConversionConstant.INDENT, indent);
      if( wraptext || bDefault)
        cellStyleJSON.put(ConversionConstant.WRAPTEXT, wraptext);
      if(hidden || bDefault)
          cellStyleJSON.put(ConversionConstant.STYLE_HIDDEN, hidden);
      if(unlocked || bDefault)
          cellStyleJSON.put(ConversionConstant.STYLE_UNLOCKED, unlocked);
      if( hasValue(direction) )
          cellStyleJSON.put(ConversionConstant.DIRECTION, direction);      
      if( hasValue(preserveStyleName))
        cellStyleJSON.put(ConversionConstant.STYLE_PRESERVE, preserveStyleName);
      return cellStyleJSON;
    }

    //if bDefault is true, then also put the default value to JSON
    //this is used to store the defaultCellStyle to "styles"
    public boolean hasSameContent(CellStyleType cellStyle){

      if( (fontName.equals(cellStyle.fontName))
          && (fontSize == cellStyle.fontSize)
          && (fontColor.equals(cellStyle.fontColor))
          && (fmFontColor.equals(cellStyle.fmFontColor))
          && (fontItalic == cellStyle.fontItalic)
          && (fontUnderline == cellStyle.fontUnderline)
          && (fontStrikeThrough == cellStyle.fontStrikeThrough)
          && (fontBold == cellStyle.fontBold)
          && (borderLeft.equals(cellStyle.borderLeft))
          && (borderRight.equals(cellStyle.borderRight))
          && (borderTop.equals(cellStyle.borderTop))
          && (borderBottom.equals(cellStyle.borderBottom))
          && (borderLeftColor.equals(cellStyle.borderLeftColor))
          && (borderRightColor.equals(cellStyle.borderRightColor))
          && (borderTopColor.equals(cellStyle.borderTopColor))
          && (borderBottomColor.equals(cellStyle.borderBottomColor))
          && (borderLeftStyle.equals(cellStyle.borderLeftStyle))
          && (borderRightStyle.equals(cellStyle.borderRightStyle))
          && (borderTopStyle.equals(cellStyle.borderTopStyle))
          && (borderBottomStyle.equals(cellStyle.borderBottomStyle))
          && (formatCategory.equals(cellStyle.formatCategory))
          && (formatCode.equals(cellStyle.formatCode))
          && (formatCurrency.equals(cellStyle.formatCurrency))

          && (textAlign.equals(cellStyle.textAlign))
          && (verticalAlign.equals(cellStyle.verticalAlign))
          && (backgroundColor.equals(cellStyle.backgroundColor))
          && (indent == cellStyle.indent)
          && (wraptext == cellStyle.wraptext)
          && (hidden == cellStyle.hidden)
          && (unlocked == cellStyle.unlocked)
          && (direction.equals(cellStyle.direction)))
        return true;
      return false;

    }

    public OrderedJSONObject storeMetaToJSON(){
      return null;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }
    
    public void getObjectFromJSON(DocumentVersion version) throws IOException
    {
      boolean bLongKey = version.compareTo(DocumentVersion.VERSION_1_0_3) < 0;
      if (stytleContentJSON != null)
      {
        JSONObject formatJSON = (JSONObject) stytleContentJSON.get(ConversionConstant.FORMAT);
        if(formatJSON!=null)
        { 
          String key = bLongKey ? ConversionConstant.FORMATCATEGORY_A : ConversionConstant.FORMATCATEGORY;
          Object value = formatJSON.get(key);
          if(value!=null)
            this.formatCategory = (String)value;
          value = formatJSON.get(ConversionConstant.FORMATCODE);
          if(value!=null)
            this.formatCode = (String)value;
          key =  bLongKey ? ConversionConstant.FORMATCURRENCY_A : ConversionConstant.FORMATCURRENCY;
          value = formatJSON.get(key);
          if(value!=null)
            this.formatCurrency = (String)value;
          key = bLongKey ? ConversionConstant.FORMAT_FONTCOLOR_A : ConversionConstant.FORMAT_FONTCOLOR;
          value = formatJSON.get(key);
          if(value!=null)
            this.fmFontColor = (String)value;
        }

        JSONObject fontJSON = (JSONObject) stytleContentJSON.get(ConversionConstant.FONT);
        if (fontJSON!=null)
        {
          String key = bLongKey ? ConversionConstant.FONTNAME_A : ConversionConstant.FONTNAME;
          Object value = fontJSON.get(key);
          if(value!=null)
            this.fontName = (String) value;
          key = bLongKey ? ConversionConstant.SIZE_A : ConversionConstant.SIZE;
          Object fs = fontJSON.get(key);
          if (fs instanceof Number)
            this.fontSize = ((Number) fs).doubleValue();
          key = bLongKey ? ConversionConstant.COLOR_A : ConversionConstant.COLOR;
          value = fontJSON.get(key);
          if(value!=null)
            this.fontColor = (String)value;
          key = bLongKey ? ConversionConstant.ITALIC_A : ConversionConstant.ITALIC; 
          Boolean italic = (Boolean)fontJSON.get(key);
          if (italic!=null)
            this.fontItalic = italic;
          key = bLongKey ? ConversionConstant.UNDERLINE_A : ConversionConstant.UNDERLINE; 
          Boolean underline = (Boolean)fontJSON.get(key);
          if(underline!=null)
            this.fontUnderline = underline;
          key = bLongKey ? ConversionConstant.STRIKTHROUGH_A : ConversionConstant.STRIKTHROUGH; 
          Boolean st = (Boolean)fontJSON.get(ConversionConstant.STRIKTHROUGH);
          if(st!=null)
            this.fontStrikeThrough = st;
          key =  bLongKey ? ConversionConstant.BOLD_A : ConversionConstant.BOLD; 
          Boolean bold = (Boolean)fontJSON.get(key);
          if(bold!=null)
            this.fontBold = bold;
        }

        if (stytleContentJSON.containsKey(ConversionConstant.BORDER))
        {
          JSONObject borderJSON = (JSONObject) stytleContentJSON.get(ConversionConstant.BORDER);
          if (borderJSON.containsKey(ConversionConstant.BORDER_LEFT))
            this.borderLeft = borderJSON.get(ConversionConstant.BORDER_LEFT).toString();
          if (borderJSON.containsKey(ConversionConstant.BORDER_RIGHT))
            this.borderRight = borderJSON.get(ConversionConstant.BORDER_RIGHT).toString();
          if (borderJSON.containsKey(ConversionConstant.BORDER_TOP))
            this.borderTop = borderJSON.get(ConversionConstant.BORDER_TOP).toString();
          if (borderJSON.containsKey(ConversionConstant.BORDER_BOTTOM))
            this.borderBottom = borderJSON.get(ConversionConstant.BORDER_BOTTOM).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.BORDERCOLOR))
        {
          JSONObject borderColorJSON = OrderedJSONObject.parse(stytleContentJSON.get(ConversionConstant.BORDERCOLOR).toString());
          if (borderColorJSON.containsKey(ConversionConstant.BORDER_LEFT_COLOR))
            this.borderLeftColor = borderColorJSON.get(ConversionConstant.BORDER_LEFT_COLOR).toString();
          if (borderColorJSON.containsKey(ConversionConstant.BORDER_RIGHT_COLOR))
            this.borderRightColor = borderColorJSON.get(ConversionConstant.BORDER_RIGHT_COLOR).toString();
          if (borderColorJSON.containsKey(ConversionConstant.BORDER_TOP_COLOR))
            this.borderTopColor = borderColorJSON.get(ConversionConstant.BORDER_TOP_COLOR).toString();
          if (borderColorJSON.containsKey(ConversionConstant.BORDER_BOTTOM_COLOR))
            this.borderBottomColor = borderColorJSON.get(ConversionConstant.BORDER_BOTTOM_COLOR).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.BORDERSTYLE))
        {
          JSONObject borderStyleJSON = OrderedJSONObject.parse(stytleContentJSON.get(ConversionConstant.BORDERSTYLE).toString());
          if (borderStyleJSON.containsKey(ConversionConstant.BORDER_LEFT_STYLE))
            this.borderLeftStyle = borderStyleJSON.get(ConversionConstant.BORDER_LEFT_STYLE).toString();
          if (borderStyleJSON.containsKey(ConversionConstant.BORDER_RIGHT_STYLE))
            this.borderRightStyle = borderStyleJSON.get(ConversionConstant.BORDER_RIGHT_STYLE).toString();
          if (borderStyleJSON.containsKey(ConversionConstant.BORDER_TOP_STYLE))
            this.borderTopStyle = borderStyleJSON.get(ConversionConstant.BORDER_TOP_STYLE).toString();
          if (borderStyleJSON.containsKey(ConversionConstant.BORDER_BOTTOM_STYLE))
            this.borderBottomStyle = borderStyleJSON.get(ConversionConstant.BORDER_BOTTOM_STYLE).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.TEXT_ALIGN))
        {
          this.textAlign = stytleContentJSON.get(ConversionConstant.TEXT_ALIGN).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.VERTICAL_ALIGN))
        {
          this.verticalAlign = stytleContentJSON.get(ConversionConstant.VERTICAL_ALIGN).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.BACKGROUND_COLOR))
        {
          this.backgroundColor = stytleContentJSON.get(ConversionConstant.BACKGROUND_COLOR).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.INDENT))
        {
          this.indent = Integer.parseInt(stytleContentJSON.get(ConversionConstant.INDENT).toString());
        }
        if (stytleContentJSON.containsKey(ConversionConstant.WRAPTEXT))
        {
          this.wraptext = Boolean.parseBoolean(stytleContentJSON.get(ConversionConstant.WRAPTEXT).toString());
        }
        if (stytleContentJSON.containsKey(ConversionConstant.STYLE_HIDDEN))
        {
          this.hidden = Boolean.parseBoolean(stytleContentJSON.get(ConversionConstant.STYLE_HIDDEN).toString());
        }
        if (stytleContentJSON.containsKey(ConversionConstant.STYLE_UNLOCKED))
        {
          this.unlocked = Boolean.parseBoolean(stytleContentJSON.get(ConversionConstant.STYLE_UNLOCKED).toString());
        }
        if (stytleContentJSON.containsKey(ConversionConstant.DIRECTION))
        {
          this.direction = stytleContentJSON.get(ConversionConstant.DIRECTION).toString();
        }
        if (stytleContentJSON.containsKey(ConversionConstant.STYLE_PRESERVE))
        {
          this.preserveStyleName = stytleContentJSON.get(ConversionConstant.STYLE_PRESERVE).toString();
        }
      }
    }

    public void getObjectFromJSON() throws IOException {

      
    }
    
    public JSONType getType(){
      return JSONType.STYLE;
    }
  }

  /**
   * Comment is a structure which represent a JSON object for comment tag
   * 
   */
  public static class Comment implements JSONModel{
    /***
     * tags from content.js 
     */
	  public String author;
	  public String content;

    /***
     * tags from meta.js
     */
    /***
     * for save back
     */
	  public JSONObject commentContentJSON;
    //construct Comment to put all the default value
    public Comment(){
      author = "";
      content = "";
      commentContentJSON = null;
    }
    public OrderedJSONObject storeContentToJSON(){
      OrderedJSONObject commentJSON = new OrderedJSONObject();
      if(hasValue(author))
        commentJSON.put(ConversionConstant.AUTHOR, author);
      if(hasValue(content))
        commentJSON.put(ConversionConstant.CONTENT, content);
      return commentJSON;
    }
    public OrderedJSONObject storeMetaToJSON(){
      return null;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    public void getObjectFromJSON() {
      if(commentContentJSON != null) {
        if (commentContentJSON.containsKey(ConversionConstant.AUTHOR))
          this.author = commentContentJSON.get(ConversionConstant.AUTHOR).toString();
        if (commentContentJSON.containsKey(ConversionConstant.CONTENT))
          this.content = commentContentJSON.get(ConversionConstant.CONTENT).toString();
      } 
    }
    
    public JSONType getType(){
      return JSONType.COMMENT;
    }
  }


  /**
   * Cell is a structure which represent a JSON object for cell tag
   * 
   */
  public static class Cell implements JSONModel{
	  public String cellId;
	  public String rowId;
    /***
     * tags from content.js
     */		
	  public Object value;
	  public Object calculateValue;
	  public String showValue;
	  public int repeatedNum;
	  // used to record orignal value in cell in content.js
      public int org_repeatedNum;
	  public String styleId;
	  public Comment comment;
      public Boolean commentUpdated;
	  public int colSpan;
      public int rowSpan;
	  public boolean isCovered;
	  public int formatType;
	  public int currencySymbol;	 
	  public String link;
	  public int type;
	  public ErrorCode ec;
	  
	  public String validationName;
    /***
     * tags from meta.js
     */

    /**
     * tags from ref.js
     */
    /***
     * for save back
     */
	  public int cellIndex;
	  // public JSONObject cellContentJSON;    <== do not keep json reference to save memory

    public Cell(){	
      cellId = "";
      value = "";
      calculateValue = null;
      showValue = "";
      repeatedNum = 0;
      org_repeatedNum = 0;
      styleId = "";
      comment = null;
      commentUpdated = null;
      // cellContentJSON = null;
      colSpan = 1;
      isCovered = false;     
      link = "";
      type = 0;
      ec = ErrorCode.NONE;
      validationName = "";
    }
    
    public Cell(Cell clonedCell){
    	if(clonedCell != null){
        cellId = clonedCell.cellId;
        rowId = clonedCell.rowId;
        value = clonedCell.value;
        calculateValue = clonedCell.calculateValue ;
        showValue = clonedCell.showValue;
        repeatedNum = clonedCell.repeatedNum;
        styleId = clonedCell.styleId;
        comment = clonedCell.comment;
        commentUpdated = null;
        // cellContentJSON = clonedCell.cellContentJSON;
        colSpan = clonedCell.colSpan;
        rowSpan = clonedCell.rowSpan;
        isCovered = clonedCell.isCovered;       
        link = clonedCell.link;
        type = clonedCell.type;
        ec = clonedCell.ec;
        validationName = clonedCell.validationName;
        cellIndex = clonedCell.cellIndex;
    	}else{
          cellId = "";
    	  value = "";
    	  calculateValue = null;
    	  showValue = "";
    	  repeatedNum = 0;
    	  styleId = "";
    	  comment = null;
    	  // cellContentJSON = null;
          colSpan = 1;
          isCovered = false;         
          link = "";
    	  type = 0;
    	  ec = ErrorCode.NONE;
    	  validationName = "";
    	}
      }
    
    public OrderedJSONObject storeContentToJSON(){

      OrderedJSONObject cellJSON = new OrderedJSONObject();	
      //In order to reduce the draft size, use v -> value, cv -> calculateValue, sv -> showValue
      if (hasValue(value)){
        if (IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_OOXML) && 
            isFormulaString(value.toString()) )
        {
          cellJSON.put("v", IDMFormulaLexer.transODFFormulaToOOXML(value.toString()));
        }
        else
        {
    	  cellJSON.put("v", value);
        }
    	  //enable calculate value when cell has value and calculate value != null
        if (calculateValue != null)
        {
          cellJSON.put("cv", calculateValue);
//          if(ec != null && ec != ErrorCode.NONE)
//            cellJSON.put("ec", ec.toIntValue());
        }
        if( type > 0)
          cellJSON.put("t", type);
        if (hasValue(link))
          cellJSON.put("link", link);
      }      
      /*if (hasValue(showValue)&& !showValue.equals(value) && !showValue.equals(calculateValue))
        cellJSON.put("sv", showValue);*/
      if( repeatedNum > 0 )
        cellJSON.put(ConversionConstant.REPEATEDNUM, repeatedNum);
      if(hasValue(styleId))
        cellJSON.put(ConversionConstant.STYLEID, styleId);
      if(comment != null){
        OrderedJSONObject commentJSON = comment.storeContentToJSON();
        if(!commentJSON.isEmpty())
          cellJSON.put(ConversionConstant.COMMENT, comment.storeContentToJSON());
      }
      if(colSpan > 1)
      {
    	  cellJSON.put(ConversionConstant.COLSPAN, colSpan);
      }
      if(rowSpan > 1)
      {
          cellJSON.put(ConversionConstant.ROWSPAN, rowSpan);
      }
      if(isCovered)
      {
    	  cellJSON.put(ConversionConstant.ISCOVERED, isCovered);
      }
      return cellJSON;
    }

    public OrderedJSONObject storeMetaToJSON(){
      return null;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    @Override
    public void getObjectFromJSON()
    {
      // Do not use this kind of function. cellContentJSON is removed
      Exception e = new Exception("not implemented");
      e.printStackTrace();
    }

    public void getObjectFromJSON(JSONObject cellContentJSON) throws IOException{

      if(cellContentJSON != null) {
    	/************
    	 * Because value,calculateValue,and showValue are used v, cv and sv in draft document,
    	 * but server model still use value,calculateValue,and showValue, 
    	 * conversion need transform these keys
    	*****************/  
        if(cellContentJSON.containsKey("v"))
          this.value = cellContentJSON.get("v");
        if(cellContentJSON.containsKey("cv")){
          boolean bDirty = false;
          if(cellContentJSON.containsKey("d")){
            bDirty = Boolean.parseBoolean(cellContentJSON.get("d").toString());
          }
          if(!bDirty)
          {
            this.calculateValue = cellContentJSON.get("cv");
            if(cellContentJSON.containsKey("ec"))
            {
              int code = Integer.parseInt(cellContentJSON.get("ec").toString());
              if(code > 0)
                ec = ErrorCode.getErrorCodeByIntCode(code);
            }
          }
        }
        if(cellContentJSON.containsKey("t"))
          this.type = Integer.parseInt(cellContentJSON.get("t").toString());
        
        if(cellContentJSON.containsKey("sv"))
          this.showValue = cellContentJSON.get("sv").toString();
        if (cellContentJSON.containsKey("link"))
        {
          this.link = cellContentJSON.get("link").toString();
        }
        if(cellContentJSON.containsKey(ConversionConstant.REPEATEDNUM)) 
        {
          this.repeatedNum =Integer.parseInt(cellContentJSON.get(ConversionConstant.REPEATEDNUM).toString());
          // record repeated num here. so we do not need cell json in following process
          this.org_repeatedNum = this.repeatedNum;
        }
        if(cellContentJSON.containsKey(ConversionConstant.STYLEID))
          this.styleId = cellContentJSON.get(ConversionConstant.STYLEID).toString();
        if(cellContentJSON.containsKey(ConversionConstant.COMMENT))
        {
          JSONObject commentContentJSON = (JSONObject) cellContentJSON.get(ConversionConstant.COMMENT);
          this.comment = new Comment();
          this.comment.commentContentJSON = commentContentJSON;
          comment.getObjectFromJSON();
        }
        if(cellContentJSON.containsKey(ConversionConstant.COLSPAN))
        {
        	this.colSpan = Integer.parseInt(cellContentJSON.get(ConversionConstant.COLSPAN).toString());
        	if(this.colSpan > ConversionConstant.MAX_COL_NUM)
              this.colSpan = ConversionConstant.MAX_COL_NUM;//otherwise Symphony can not import 
        }
        if(cellContentJSON.containsKey(ConversionConstant.ROWSPAN))
        {
            this.rowSpan = Integer.parseInt(cellContentJSON.get(ConversionConstant.ROWSPAN).toString());
            if(this.rowSpan > ConversionConstant.MAX_ROW_NUM)
              this.rowSpan = ConversionConstant.MAX_ROW_NUM;//otherwise Symphony can not import 
        }
        if(cellContentJSON.containsKey(ConversionConstant.ISCOVERED))
        {
        	this.isCovered = Boolean.parseBoolean(cellContentJSON.get(ConversionConstant.ISCOVERED).toString());
        }
      }
    }
    
    public JSONType getType(){
      return JSONType.CELL;
    }
  }
  /**
   * Column is a structure represent a JSON object for column tag
   * 
   */
  public static class Column implements JSONModel{
	  public String columnId;
    /***
     * tags from content.js
     */

    /***
     * tags from meta.js
     */

	  public int columnIndex;
	  public String sheetId;
	  public int width;	
	  public static int defaultWidth = ConversionConstant.DEFAULT_WIDTH_VALUE;//used for export
	  public String styleId;
	  public String defaultCellStyleName;// the default cell style name in content.xml
	  public int repeatedNum;
	  public String visibility;

    /***
     * for save back
     */
	  public JSONObject columnMetaJSON;
    public Column(){
      columnId = "";
      columnIndex = -1;
      sheetId = "";
      width = ConversionConstant.DEFAULT_WIDTH_VALUE;
      styleId = "";
      repeatedNum = 0;
      columnMetaJSON = null;
      visibility = "";
    }

    public OrderedJSONObject storeContentToJSON(){
      return null;
    }
    public OrderedJSONObject storeMetaToJSON(){

      OrderedJSONObject columnJSON = new OrderedJSONObject();
//      columnJSON.put(ConversionConstant.SHEETID, sheetId);
      if(width != ConversionConstant.DEFAULT_WIDTH_VALUE)
        columnJSON.put(ConversionConstant.WIDTH, width);
      if(hasValue(styleId))
        columnJSON.put(ConversionConstant.STYLEID, styleId);
      if(repeatedNum > 0)
        columnJSON.put(ConversionConstant.REPEATEDNUM, repeatedNum);
      if(hasValue(visibility))
    	  columnJSON.put(ConversionConstant.VISIBILITY, visibility);  
      return columnJSON;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    public void getObjectFromJSON() {
      if(columnMetaJSON != null) {
        if(columnMetaJSON.containsKey(ConversionConstant.SHEETID))
          this.sheetId = columnMetaJSON.get(ConversionConstant.SHEETID).toString();
        if(columnMetaJSON.containsKey(ConversionConstant.WIDTH))
          this.width = Integer.parseInt(columnMetaJSON.get(ConversionConstant.WIDTH).toString());
        else
          this.width = Column.defaultWidth;
        if(columnMetaJSON.containsKey(ConversionConstant.STYLEID))
          this.styleId = columnMetaJSON.get(ConversionConstant.STYLEID).toString();
        if(columnMetaJSON.containsKey(ConversionConstant.REPEATEDNUM))
          this.repeatedNum = Integer.parseInt(columnMetaJSON.get(ConversionConstant.REPEATEDNUM).toString());
        if(columnMetaJSON.containsKey(ConversionConstant.VISIBILITY))
            this.visibility = columnMetaJSON.get(ConversionConstant.VISIBILITY).toString();
      } 
    }
    
    public JSONType getType(){
      return JSONType.COLUMN;
    }
  }


  /**
   * Row is a structure which represent a JSON object for Row tag
   * 
   */	
  public static class Row implements JSONModel{
	  public String rowId;
    /***
     * all tags from content.js
     */
	  public List<Cell> cellList;
	  public String jsonCellString = null;
    /***
     * all tags from meta.js
     */

	  public String sheetId;
	  public int rowIndex; 
	  public int height;
	  public static int defaultHeight = ConversionConstant.DEFAULT_HEIGHT_VALUE;
	  public String styleId;
	  public int repeatedNum;
	  public String visibility;
	  public boolean isOptimizeHeight;

    /***
     * for save back
     */
	  // remove raw rowContentJSON, record colid -> cell map in one hashmap
	  // so need not keep rowContentJSON in following process
	  public HashMap<String,Integer> cellmap;
	  public JSONObject rowMetaJSON;
    public Row(){
      rowId = "";
      cellList = new ArrayList<Cell>();
      sheetId = "";
      rowIndex = -1;
      height = defaultHeight;
      styleId = "";
      repeatedNum = 0;
      visibility = "";
      isOptimizeHeight = true;
      
      cellmap = new HashMap<String,Integer>();
      rowMetaJSON = null;
    }
    
    public Row(Row clonedRow)
    {
    	this.rowId = clonedRow.rowId;
    	this.sheetId = clonedRow.sheetId;
    	this.rowIndex = clonedRow.rowIndex;
    	this.height = clonedRow.height;
    	this.styleId = clonedRow.styleId;
    	this.repeatedNum = clonedRow.repeatedNum;
    	this.visibility = clonedRow.visibility;
    	this.isOptimizeHeight = clonedRow.isOptimizeHeight;
    	
    	this.cellList = new ArrayList<Cell>();
    	this.cellmap = new HashMap<String,Integer>();
    	
    	int cellCnt = clonedRow.cellList.size();
    	for(int i = 0; i < cellCnt; i++)
    	{
    		Cell cell = clonedRow.cellList.get(i);
    		Cell newCell = new Cell(cell);
    		newCell.org_repeatedNum = cell.repeatedNum;
    		this.cellList.add(newCell);
    		this.cellmap.put(cell.cellId, this.cellList.size()-1);
    	}
    }
    
    public void storeToJSONString()
    {
      try
      {
        if (cellList != null)
        {
          OrderedJSONObject rowjson = storeCellsToJSON();
          if (!rowjson.isEmpty())
          {
            jsonCellString = rowjson.serialize();
            cellList = null;
          }
        }
      }
      catch (Exception e)
      {
      }
    }

    public OrderedJSONObject storeContentToJSON()
    {
      if (jsonCellString != null && jsonCellString.length() > 0)
      {
        OrderedJSONObject rowJSON = new OrderedJSONObject();
        rowJSON.put("rawjson", jsonCellString);
        return rowJSON;
      }
      else
      {
        return storeCellsToJSON();
      }
    }

    public OrderedJSONObject storeCellsToJSON()
    {
      OrderedJSONObject rowJSON = new OrderedJSONObject();
      for (int i = 0; i < cellList.size(); i++)
      {
        Cell cell = cellList.get(i);
        // check if the cell style is the same with the corresponding row style
        if (hasValue(styleId) && styleId.equals(cell.styleId))
          cell.styleId = "";
        // the converter should check if the cell style is the same with the corresponding column style by itself
        OrderedJSONObject cellJSON = cell.storeContentToJSON();
        // if the cell is empty or only have the repeate number, then it is not necessary to put in the cell
        if (!cellJSON.isEmpty() && !((cellJSON.size() == 1) && (cellJSON.get(ConversionConstant.REPEATEDNUM) != null)))
          rowJSON.put(cell.cellId, cellJSON);
      }
      return rowJSON;
    }
    
    public OrderedJSONObject storeMetaToJSON(){
      return storeMetaToJSON(null);
    }
    
    public OrderedJSONObject storeMetaToJSON(Sheet sheet){
      OrderedJSONObject rowJSON = new OrderedJSONObject();
      if( sheet!= null && height != sheet.rowHeight)
        rowJSON.put(ConversionConstant.HEIGHT, height);
      if(hasValue(styleId))
        rowJSON.put(ConversionConstant.STYLEID, styleId);
      if(repeatedNum > 0)
        rowJSON.put(ConversionConstant.REPEATEDNUM, repeatedNum);
      if(hasValue(visibility))
    	rowJSON.put(ConversionConstant.VISIBILITY, visibility); 
      return rowJSON;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }
    
    public void getObjectFromJSON() {
      getObjectFromJSON(null);
    }
    public void getObjectFromJSON(Sheet sheet) {

      //meta
      if(rowMetaJSON != null) {
        if(rowMetaJSON.containsKey(ConversionConstant.SHEETID))
          this.sheetId = rowMetaJSON.get(ConversionConstant.SHEETID).toString();
        if(rowMetaJSON.containsKey(ConversionConstant.STYLEID))
          this.styleId = rowMetaJSON.get(ConversionConstant.STYLEID).toString();
        //TODO: rowIndex should got from rowIdArray
        //				if(rowMetaJSON.containsKey(ConversionConstant.ROWINDEX))
        //					this.rowIndex = Integer.parseInt(rowMetaJSON.get(ConversionConstant.ROWINDEX).toString());
        if(rowMetaJSON.containsKey(ConversionConstant.HEIGHT))
          this.height = Integer.parseInt(rowMetaJSON.get(ConversionConstant.HEIGHT).toString());
        else if (sheet != null)
          this.height = sheet.rowHeight;
        if(rowMetaJSON.containsKey(ConversionConstant.REPEATEDNUM))
          this.repeatedNum = Integer.parseInt(rowMetaJSON.get(ConversionConstant.REPEATEDNUM).toString());
        if(rowMetaJSON.containsKey(ConversionConstant.VISIBILITY))
          this.visibility = rowMetaJSON.get(ConversionConstant.VISIBILITY).toString();
      }

    }

    public static boolean isStyledRow(ConversionUtil.Row row) {
      if((row.height == ConversionUtil.Row.defaultHeight) 
          && !ConversionUtil.hasValue(row.styleId) && row.repeatedNum <= 0
          && !ConversionUtil.hasValue(row.visibility))
        return false;
      return true;
    }
    
    public JSONType getType(){
      return JSONType.ROW;
    }
    // lookup colid -> cell map in cellmap
    // so need not keep rowContentJSON in following process
    public Cell getCellByIndex(String colId) 
    {
      Integer idx = cellmap.get(colId);
      if (idx!=null) 
      {
        return cellList.get(idx);
      }
      return null;
    }

    public Cell getPrevCell(List<String> columnIdArray, String startColId)
    {
      for (int i=0;i<columnIdArray.size();i++)
      {
        String colId = columnIdArray.get(i);
        if (startColId.equals(colId) && i>0)
        {
          for (int j = i-1 ; j>=0; j--)
          {
            String prevColId = columnIdArray.get(j);
            if (prevColId!=null && prevColId.length()>0)
            {
              Integer idx = cellmap.get(prevColId);
              if (idx!=null) 
              {
                return cellList.get(idx);
              }
            }
          }
        }
      }
      return null;
    }
  }

//RANGE TYPE for preserve
  public static enum DataValidationType{
    WHOLE("cell-content-is-whole-number"), 
    DECIMAL("cell-content-is-decimal-number"), 
    DATE("cell-content-is-date"), 
    TIME("cell-content-is-time"), 
    LIST("cell-content-is-in-list"), 
    TEXTLENGTH("cell-content-text-length"),
    TEXTLENGTH1("cell-content-text-length-is-between"),
    TEXTLENGTH2("cell-content-text-length-is-not-between");
    
    private String mValue;
    DataValidationType(String value){
      mValue = value;
    }
    
    public String toString(){
      return mValue;
    }
    
    public static DataValidationType enumValueOf(String value) {
      for(DataValidationType aIter : values()) {
          if (value.equalsIgnoreCase(aIter.toString())) {
          return aIter;
          }
      }
      return null;
    }
  }
  
  /**
   * Validation is a structure which represent a JSON object for content-validation tag
   */
  public static class Validation implements JSONModel{
	  public String name;
	  public List<JSONObject> ranges;
	  //TODO: attrs
	  
	  public boolean allowBlank;
	  public String baseAddress;
	  public boolean showDropDown;
	  public boolean showInputMsg;
	  public boolean showErrorMsg;
	  public String displayList;
	  public String errorStyle;
	  public String errorTitle; 
	  public String error;
	  public String promptTitle;
	  public String prompt;
	  
	  public String type;
	  public String operator;
	  public String value1; 
	  public String value2;
	  
	  public JSONObject criteria;
	  public ParsedRef baseRef;
	  
	  public boolean isValue1F;
	  public boolean isValue2F;
	  
	  private static String conStr1 = " and cell-content()";
	  private static String conStr2 = " and cell-content-is-between";
	  private static String conStr3 = " and cell-content-is-not-between";
	  public Validation()
	  {
		  ranges = new ArrayList<JSONObject>();
		  criteria = null;
		  displayList = "";
		  errorStyle = "";
		  errorTitle = "";
		  error = "";
		  promptTitle = "";
		  prompt = "";
		  type = "";
		  operator = "";
		  value1 = "";
		  value2 = "";
		  allowBlank = true;
		  showDropDown = true;
		  showInputMsg = true;
		  showErrorMsg = true;
	  }
	  
	  public Validation(String name, String baseAddress)
	  {
		  this();
		  this.name = name;
		  this.baseAddress = baseAddress;
		  this.baseRef = ReferenceParser.parse(this.baseAddress);
	  }

	  public void setCondition(String condition)
	  {
		  parseCondition(condition);
	  }
	  
	  public void addRange(String sheetName, int startRow, int endRow, int startCol, int endCol)
	  {	
    		int size = ranges.size();
    		JSONObject last = size > 0 ? ranges.get(size - 1) : null;
    		
    		if(last != null){
    			String lastSheetName = (String)last.get("sheetName");
    			if(lastSheetName.equals(sheetName))
    			{
    				int lastStartRow = (Integer)last.get("startRow");
    				int lastEndRow = (Integer)last.get("endRow");
    				if(startRow == lastStartRow && endRow == lastEndRow)
    				{
    					int lastEndCol = (Integer)last.get("endCol");
    					if(startCol == lastEndCol + 1)
    					{
    						last.put("endCol", endCol);
    						return;
    					}
    				}
    			}
    		}
    		
    		JSONObject range = new JSONObject();
    		range.put("sheetName", sheetName);
    		range.put("startRow", startRow);
    		range.put("endRow", endRow);
    		range.put("startCol", startCol);
    		range.put("endCol", endCol);
    		ranges.add(range);
	  }
	  
	  private void parseCondition(String condition)
	  {
		  if(condition.startsWith("of:"))
			  condition = condition.substring(3);
		  int sepIdx = condition.indexOf("(");
		  int len = condition.length();
		  String pre = condition.substring(0, sepIdx);
		  DataValidationType dvType = DataValidationType.enumValueOf(pre);
		  if(dvType == null)
			  return;
		  switch(dvType)
		  {
		  case LIST:
			  type = ConversionConstant.TYPE_LIST;
			  String value = condition.substring(sepIdx + 1, len - 1);
			  if(value.charAt(0) == '"')
				  value1 = this.parseList(value);
			  else
			  {
				  if(value.startsWith("["))
					  value = value.substring(1, value.length() - 1);
				  ParsedRef ref = ReferenceParser.parse(value);
				  if(ref != null)
				  {
					  ref.patternMask = ref.patternMask & (ref.patternMask ^ ReferenceParser.END_SHEET);
					  ref.patternMask = ref.patternMask & (ref.patternMask ^ ReferenceParser.EMPTY_END_SHEET);
					  value1 = ref.toString();
				  }else
					  value1 = value;
			  }
			  break;
		  case TEXTLENGTH1:
		  case TEXTLENGTH2:
			  type = ConversionConstant.TYPE_TEXTLENTH;
			  operator = (dvType == DataValidationType.TEXTLENGTH1) ? ConversionConstant.OPERATOR_BET : ConversionConstant.OPERATOR_NOT_BET;
			  parseValues(condition.substring(sepIdx));
			  break;
		  case TEXTLENGTH:
			  type = ConversionConstant.TYPE_TEXTLENTH;
			  parseValue(condition.substring(sepIdx + 2));
			  break;
		  case WHOLE:
			  type = ConversionConstant.TYPE_WHOLE;
			  parseCon(condition.substring(sepIdx + 2));
			  break;
		  case DECIMAL:
			  type = ConversionConstant.TYPE_DECIMAL;
			  parseCon(condition.substring(sepIdx + 2));
			  break;
		  case DATE:
			  type = ConversionConstant.TYPE_DATE;
			  parseCon(condition.substring(sepIdx + 2));
			  break;
		  case TIME:
			  type = ConversionConstant.TYPE_TIME;
			  parseCon(condition.substring(sepIdx + 2));
			  break;
		  default:
			  break;
		  }
	  }
	  
	  private String parseList(String oriValue)
	  {
		  int len = oriValue.length();
		  if(len <= 2)
			  return oriValue;
		 StringBuffer ret = new StringBuffer();
		 ret.append('"');
		 int quoNum = 0;
		  for(int i = 0; i < len; i++)
		  {
			 char c = oriValue.charAt(i);
			 switch(c)
			 {
			 case '"' :
				 if(quoNum >= 1 && quoNum % 2 != 0 && i < len -1  && oriValue.charAt( i + 1) == '"'){
					 ret.append('"');
					 i ++;
					 quoNum ++;
				 }
				 quoNum ++;
				 break;
			 case ';' :
				 if(quoNum % 2 == 0)
					 ret.append(',');
				 else
					 ret.append(';');
				 break;
			 default :
				 ret.append(c);
				 break;
			 }
		  }
		  ret.append('"');
		  return ret.toString();
	  }
	  
	  //parse opt and values
	  private void parseCon(String valuesStr)
	  {
		  if(valuesStr.startsWith(conStr1)){
			  valuesStr = valuesStr.substring(19);
			  parseValue(valuesStr);
		  }
		  else if(valuesStr.startsWith(conStr2)){
			  operator = ConversionConstant.OPERATOR_BET;
			  valuesStr = valuesStr.substring(28);
			  parseValues(valuesStr);
		  }
		  else if(valuesStr.startsWith(conStr3)){
			  operator = ConversionConstant.OPERATOR_NOT_BET;
			  valuesStr = valuesStr.substring(32);
			  parseValues(valuesStr);
		  }
	  }
	  
	  //parse opt and value1
	  private void parseValue(String valueStr)
	  {
		  int preLen = 1;
		  if(valueStr.startsWith("="))
			  operator = ConversionConstant.OPERATOR_EQUAL;
		  else if(valueStr.startsWith(ConversionConstant.OPERATOR_GREATER_EQUAL)){
			  operator = ConversionConstant.OPERATOR_GREATER_EQUAL;
			  preLen = 2;
		  }
		  else if(valueStr.startsWith(ConversionConstant.OPERATOR_LESS_EQUAL)){
			  operator = ConversionConstant.OPERATOR_LESS_EQUAL;
			  preLen = 2;
		  }
		  else if(valueStr.startsWith(ConversionConstant.OPERATOR_GREATER))
			  operator = ConversionConstant.OPERATOR_GREATER;
		  else if(valueStr.startsWith(ConversionConstant.OPERATOR_LESS))
			  operator = ConversionConstant.OPERATOR_LESS;
		  else if(valueStr.startsWith(ConversionConstant.OPERATOR_NOT_EQUAL)){
			  operator = ConversionConstant.OPERATOR_NOT_EQUAL;
			  preLen = 2;
		  }
		  
		  value1 = valueStr.substring(preLen);
	  }
	  
	  //parse value1 and value2
	  private void parseValues(String valuesStr)
	  {
		  valuesStr = valuesStr.substring(1, valuesStr.length() - 1);
		  String [] values = valuesStr.split(",");
		  int len = values.length;
		  if(len == 2)
		  {
			  value1 = values[0];
			  value2 = values[1];
		  }
		  else
		  {
			  int idx = 1;
			  value1 = values[0];
			  while(idx <len && value1.contains("(") && !value1.endsWith(")"))
			  {
				 value1 += values[idx];
				 idx ++;
			  }
			  
			  if(idx < len)
			  {
				  value2 = values[idx];
				  while(idx <len && value2.contains("(") && !value2.endsWith(")"))
				  {
					 value2 += values[idx];
					 idx ++;
				  }
			  }  
		  }
	  }
	  
	  public OrderedJSONObject storeContentToJSON()
	  {
		 return null;
	  }
	  
	  public void createRagnes(Document doc)
	  {
		  
	  }
	  
	  public OrderedJSONObject storeContentToJSON(Document doc, OrderedJSONObject unnamesJSON)
	  {
		 // merge ranges in vertical direction.
		//clone new data validation when in different sheet.
		  int len = ranges.size();
		  int baseRow = 1;
		  int baseCol = 1;
		  //parse base address
		  ParsedRef parsedBaseRef = ReferenceParser.parse(baseAddress); 
		  if(parsedBaseRef != null){
			  baseRow = parsedBaseRef.getIntStartRow();
			  baseCol = parsedBaseRef.getIntStartCol();
		  }
		  String parentId = null;
		  int topRow = 0;
		  int leftCol = 0;
		  String currSheet = null;
		  JSONObject parentData = null;
		  JSONObject data = null;
		  for(int i = 0; i < len; i ++)
		  {
			  OrderedJSONObject rangeJSON = new OrderedJSONObject();
			  JSONObject range = ranges.get(i);
			  if(range.containsKey("merged"))
				  continue;
			  
			  data = new JSONObject();
			  String sheetName = (String)range.get("sheetName");
			  int startRow = (Integer)range.get("startRow");
			  int endRow = (Integer)range.get("endRow");
			  int startCol = (Integer)range.get("startCol");
			  int endCol = (Integer)range.get("endCol");
			  if(currSheet == null)
			  {
				  parentData = data;
				  currSheet = sheetName;
				  topRow = startRow;
				  leftCol = startCol;
			  }
			  else if(!currSheet.equals(sheetName))
			  {
				  //output parent criteria;
				  if(parentData != null)
				  {
					OrderedJSONObject criteira = storeCriteriaToJSON(topRow - baseRow, leftCol - baseCol);
					parentData.put(ConversionConstant.CRITERIA, criteira);
				  }
				  parentData = data;
				  parentId = null; // split to different sheet;
				  topRow = startRow;
				  leftCol = startCol;
			  }else{
				  if(startRow < topRow)
					  topRow = startRow;
				  if(startCol < leftCol)
					  leftCol = startCol;
			  }
			  
			  int start = i + 1;
			  //merge ranges in vertical direction.
			  while(start < len){
				  JSONObject nextRange = ranges.get(start);
				  start ++;
				  String nextSheetName = (String)nextRange.get("sheetName");
				  if(!sheetName.equals(nextSheetName))
					  break;
				  
				  int nextStartRow = (Integer)nextRange.get("startRow");
				  if(endRow + 1 != nextStartRow)
					  break;
				  
				  int nextStartCol = (Integer)nextRange.get("startCol");
				  if(startCol != nextStartCol)
					  continue;
				  int nextEndCol = (Integer)nextRange.get("endCol");
				  if(endCol != nextEndCol)
					  continue;
				  
				  endRow = (Integer)nextRange.get("endRow");
				  nextRange.put("merged", true);
			  }
			  Sheet sheet = doc.getSheetByName(sheetName);
			  String rangeId = name.concat("_").concat(sheet.sheetId).concat("_").concat(String.valueOf(i));
			  if(parentId == null){
				  parentId = rangeId;
			  }else
				  data.put(ConversionConstant.PARENT_ID, parentId);
			  
			  rangeJSON.put(ConversionConstant.RANGE_USAGE, RangeType.VALIDATION.toString());
			  rangeJSON.put(ConversionConstant.DATAFILED, data);
			  
			  ParsedRef ref = new ParsedRef(sheetName, ReferenceParser.translateRow(startRow), ReferenceParser.translateCol(startCol), null,
					  ReferenceParser.translateRow(endRow), ReferenceParser.translateCol(endCol));
			  String addr = ref.toString();
			  if (!IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_ODF))
				  addr = IDMFormulaLexer.transODFFormulaToOOXML(addr);
			  rangeJSON.put(ConversionConstant.RANGE_ADDRESS, addr);
			  
			  rangeJSON.put(ConversionConstant.SHEETID, sheet.sheetId);
			  rangeJSON.put(ConversionConstant.RANGE_STARTROWID, ConversionUtil.updateIdArray(startRow, sheet, doc, true, true));
			  rangeJSON.put(ConversionConstant.RANGE_ENDROWID, ConversionUtil.updateIdArray(endRow, sheet, doc, true, true));
			  rangeJSON.put(ConversionConstant.RANGE_STARTCOLID, ConversionUtil.updateIdArray(startCol, sheet, doc, false, true));
			  rangeJSON.put(ConversionConstant.RANGE_ENDCOLID, ConversionUtil.updateIdArray(endCol, sheet, doc, false, true));			  
			  
			  unnamesJSON.put(rangeId, rangeJSON);
		  }
		  
		  //output parent criteria;
		  if(parentData != null)
		  {
			OrderedJSONObject criteira = storeCriteriaToJSON(topRow - baseRow, leftCol - baseCol);
			parentData.put(ConversionConstant.CRITERIA, criteira);
		  }
		  
		  return unnamesJSON;
	  }
	  
	  private String transFormValue(String value, int rowDelta, int colDelta)
	  {
		  if(IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_OOXML))
		  {
			  value = IDMFormulaLexer.transODFFormulaToOOXML(value, rowDelta, colDelta);
		  }
		  return value;
	  }
	  
	  private OrderedJSONObject storeCriteriaToJSON(int rowDelta, int colDelta)
	  {
		  OrderedJSONObject criteira = new OrderedJSONObject();	
		  if (hasValue(value1))
		  {
			  if(type.equals(ConversionConstant.TYPE_LIST)){
				  if(isValue1F)
					  criteira.put(ConversionConstant.VALIDATION_VALUE1, transFormValue(value1, rowDelta, colDelta));
				  else
					  criteira.put(ConversionConstant.VALIDATION_VALUE1, value1);
			  }else{
				  try
				  {
					  int val = Integer.parseInt(value1);
					  criteira.put(ConversionConstant.VALIDATION_VALUE1, val);
				  }catch(NumberFormatException e)
				  {
					  try
					  {
						  double val = Double.parseDouble(value1);
						  criteira.put(ConversionConstant.VALIDATION_VALUE1, val);
					  }
					  catch(NumberFormatException e1)
					  {
						  if(isValue1F)
							  criteira.put(ConversionConstant.VALIDATION_VALUE1, transFormValue(value1, rowDelta, colDelta));
						  else
							  criteira.put(ConversionConstant.VALIDATION_VALUE1, value1);
					  }
				  }
			  }
		  }
		  if (hasValue(value2))
		  {
			  try
			  {
				  int val = Integer.parseInt(value2);
				  criteira.put(ConversionConstant.VALIDATION_VALUE2, val);
			  }catch(NumberFormatException e)
			  {
				  try
				  {
					  double val = Double.parseDouble(value2);
					  criteira.put(ConversionConstant.VALIDATION_VALUE2, val);
				  }
				  catch(NumberFormatException e1)
				  {
					  if(isValue2F)
						  criteira.put(ConversionConstant.VALIDATION_VALUE2, transFormValue(value2, rowDelta, colDelta));
					  else
						  criteira.put(ConversionConstant.VALIDATION_VALUE2, value2);
				  }
			  }
		  }
		  if (hasValue(type))
			  criteira.put(ConversionConstant.VALIDATION_TYPE, type);
		  if (hasValue(operator))
			  criteira.put(ConversionConstant.VALIDATION_OPERATOR, operator);
		  if (hasValue(showDropDown))
			  criteira.put(ConversionConstant.SHOW_DROPDOWN, showDropDown);
		  if (hasValue(allowBlank))
			  criteira.put(ConversionConstant.ALLOW_BLANK, allowBlank);
		  if (hasValue(showInputMsg))
			  criteira.put(ConversionConstant.SHOW_INPUT_MESSAGE, showInputMsg);
		  if (hasValue(showErrorMsg))
			  criteira.put(ConversionConstant.SHOW_ERROR_MESSAGE, showErrorMsg);
		  if (hasValue(errorStyle))
			  criteira.put(ConversionConstant.ERROR_STYLE, errorStyle);
		  if (hasValue(errorTitle))
			  criteira.put(ConversionConstant.ERROR_TITLE, errorTitle);
		  if (hasValue(error))
			  criteira.put(ConversionConstant.ERROR, error);
		  if (hasValue(promptTitle))
			  criteira.put(ConversionConstant.PROMPT_TITLE, promptTitle);
		  if (hasValue(prompt))
			  criteira.put(ConversionConstant.PROMPT, prompt);
		  if (hasValue(displayList))
			  criteira.put(ConversionConstant.DISPLAY_LIST, displayList);
		  
		  return criteira;
	  }
	  
	  public OrderedJSONObject storeMetaToJSON()
	  {
		  return null;
	  }
	 
	  public OrderedJSONObject storeRefToJSON()
	  {
		  return null;
	  }

	  private String getOperatorValue(String value)
	  {
		  String result = "=" + IDMFormulaLexer.transOOXMLFormulaToODF(value);
		  result = ODSConvertUtil.getODFFormula(result, false);
		  return result.substring(1);
	  }
	  
	  public String getCondition()
	  {
		  String conditionStr = "of:";
		  String functionStr = "";
		  if(this.type.equalsIgnoreCase("whole"))
		  {
			  functionStr = DataValidationType.WHOLE.toString();
		  }
		  else if(this.type.equalsIgnoreCase("decimal"))
		  {
			  functionStr = DataValidationType.DECIMAL.toString();
		  }
		  else if(this.type.equalsIgnoreCase("date"))
		  {
			  functionStr = DataValidationType.DATE.toString();
		  }
		  else if(this.type.equalsIgnoreCase("time"))
		  {
			  functionStr = DataValidationType.TIME.toString();
		  }
		  else if(this.type.equalsIgnoreCase("list"))
		  {
			  functionStr = DataValidationType.LIST.toString();
			  if(this.value1.startsWith("\""))
			  {
				  String val = this.value1.substring(1, this.value1.length() - 1);
				  if(val.length() > 0)
				  {
					  String[] list = val.split(",");
					  StringBuffer listVal = new StringBuffer();
					  for(int i = 0; i < list.length; i ++)
					  {
						  String v = list[i];
						  listVal.append('"');
						  listVal.append(v.replaceAll("\"", "\"\""));
						  listVal.append('"');
						  listVal.append(';');
					  }
					 val = listVal.substring(0,listVal.length() - 1);
				  }
				 conditionStr += functionStr + "(" +  val.toString() + ")";
			  }
			  else
				  conditionStr += functionStr + "(" + this.getOperatorValue(this.value1) + ")";
			  return conditionStr;
		  }
		  else if(this.type.equalsIgnoreCase("textLength"))
		  {
			  if(this.operator.equalsIgnoreCase("between"))
				  functionStr = "cell-content-text-length-is-between";
			  else if(this.operator.equalsIgnoreCase("notBetween"))
				  functionStr = "cell-content-text-length-is-not-between";
			  if(functionStr.length() == 0)
			  {
				  functionStr = DataValidationType.TEXTLENGTH.toString();
				  String operator = this.operator.equalsIgnoreCase("==")? "=" : this.operator;
				  conditionStr += functionStr + "()" + operator + this.getOperatorValue(this.value1);
			  }
			  else
			  {
				  conditionStr += functionStr + "(" + this.getOperatorValue(this.value1)  + ","
						  			+ this.getOperatorValue(this.value2)  + ")";
			  }
			  return conditionStr;
		  }
		  
		  String andStr = "";
		  if(this.operator.equalsIgnoreCase("between"))
			  andStr = "cell-content-is-between";
		  else if(this.operator.equalsIgnoreCase("notbetween"))
			  andStr = "cell-content-is-not-between";
		  
		  if(andStr.length() == 0)
		  {
			  String operator = this.operator.equalsIgnoreCase("==") ? "=" : this.operator;
			  conditionStr += functionStr + "() " + "and cell-content()" + operator + this.getOperatorValue(this.value1);
		  }
		  else
		  {
			  conditionStr += functionStr + "() " + "and " + andStr + "(" + this.getOperatorValue(this.value1)  
					  + "," + this.getOperatorValue(this.value2)  + ")";
		  }
		  
		  return conditionStr;
	  }
	  
	  public void updateBaseRef(int newRow, int newCol)
	  {
		  int sr = this.baseRef.getIntStartRow();
		  int sc = this.baseRef.getIntStartCol();
		  if(newRow < sr)
		  {
			  this.baseRef.startRow = ReferenceParser.translateRow(newRow);
		  }	  
		  if(newCol < sc)
		  {
			  this.baseRef.startCol = ReferenceParser.translateCol(newCol);
		  }
	  }
	  
	  public String getBassAddress()
	  {
		  return this.baseRef.getStartCellAddress();
	  }
	  public void setCriteria(JSONObject criteria)
	  {
		  this.criteria = criteria;
	  }
	  
	  public void getObjectFromJSON() throws IOException
	  {
		  if(criteria == null) return;
		  if(criteria.containsKey(ConversionConstant.VALIDATION_TYPE))
			  this.type = criteria.get(ConversionConstant.VALIDATION_TYPE).toString();
		  if(criteria.containsKey(ConversionConstant.VALIDATION_OPERATOR))
			  this.operator =  criteria.get(ConversionConstant.VALIDATION_OPERATOR).toString();
		  if(criteria.containsKey(ConversionConstant.VALIDATION_VALUE1))
			  this.value1 = criteria.get(ConversionConstant.VALIDATION_VALUE1).toString();
		  if(criteria.containsKey(ConversionConstant.VALIDATION_VALUE2))
			  this.value2 = criteria.get(ConversionConstant.VALIDATION_VALUE2).toString();
		  
		  if(criteria.containsKey(ConversionConstant.SHOW_DROPDOWN))
			  this.showDropDown = Boolean.parseBoolean(criteria.get(ConversionConstant.SHOW_DROPDOWN).toString());
		  if(criteria.containsKey(ConversionConstant.ALLOW_BLANK))
			  this.allowBlank = Boolean.parseBoolean(criteria.get(ConversionConstant.ALLOW_BLANK).toString());
		  if(criteria.containsKey(ConversionConstant.SHOW_INPUT_MESSAGE))
			  this.showInputMsg = Boolean.parseBoolean(criteria.get(ConversionConstant.SHOW_INPUT_MESSAGE).toString());
		  if(criteria.containsKey(ConversionConstant.SHOW_ERROR_MESSAGE))
			  this.showErrorMsg = Boolean.parseBoolean(criteria.get(ConversionConstant.SHOW_ERROR_MESSAGE).toString());
		  if(criteria.containsKey(ConversionConstant.DISPLAY_LIST))
			  this.displayList = criteria.get(ConversionConstant.DISPLAY_LIST).toString();
		  
		  if(criteria.containsKey(ConversionConstant.ERROR))
			  this.error = criteria.get(ConversionConstant.ERROR).toString();
		  if(criteria.containsKey(ConversionConstant.ERROR_STYLE))
			  this.errorStyle = criteria.get(ConversionConstant.ERROR_STYLE).toString();
		  if(criteria.containsKey(ConversionConstant.ERROR_TITLE))
			  this.errorTitle = criteria.get(ConversionConstant.ERROR_TITLE).toString();
		  
		  if(criteria.containsKey(ConversionConstant.PROMPT))
			  this.prompt = criteria.get(ConversionConstant.PROMPT).toString();
		  if(criteria.containsKey(ConversionConstant.PROMPT_TITLE))
			  this.promptTitle = criteria.get(ConversionConstant.PROMPT_TITLE).toString();
		  
	  }
	    
	  public JSONType getType()
	  {
		  return JSONType.VALIDATION;
	  }
  }
  
  
  /**
   * ValidationTransformManager used to export data validations to ods
   *
   */
  public static class ValidationTransformManager{
	   
	  public class ValidationRange {
		  
		  public String sheetId;
		  public int startRow;
		  public int endRow;
		  public int startCol;
		  public int endCol;
		  
		  public String rangeId;  // this could be the same with validationName, if it's the master validationRange;
		  public String validationName; // this is the validation name which would appear in validationMap
		  
		  public ValidationRange(UnNameRange range)
		  {
			  ParsedRef ref = ReferenceParser.parse(range.address);
			  this.sheetId = range.sheetId;
			  this.startRow = ref.getIntStartRow();
			  this.endRow = ref.getIntEndRow() == -1 ? this.startRow : ref.getIntEndRow();
			  this.startCol = ref.getIntStartCol();
			  this.endCol = ref.getIntEndCol() == -1 ? this.startCol : ref.getIntEndCol();
			  if(ref.type == ReferenceParser.ParsedRefType.COLUMN){
				  this.startRow = 1;
				  this.endRow = ConversionConstant.MAX_ROW_NUM;
			  }else if(ref.type == ReferenceParser.ParsedRefType.ROW){
				  this.startCol = 1;
				  this.endCol = ConversionConstant.MAX_COL_NUM;
			  }
			  
			  this.rangeId = range.rangeId;
		  }
		  
		  public void setValidationName(String id)
		  {
			  this.validationName = id;
		  }
	  }
	  public Document doc;
	  // store the validations' criteria 
	  public HashMap<String, Validation> validationMap;
	  
	  // rangeId : ValidationRange, all the validation ranges
	  public HashMap<String,ValidationRange> rangeMap;  
	  
	  public HashMap<String,String> slaveRangeMap; // slave rangeId : parent rangeId

	  /*
	   * store the ValidationRange, in this order
	   * String: sheetId 
	   * Integer: the start row index of range
	   * ArrayList<String>: the rangeId list [ rId1, rId2...]
	   */
	  public HashMap<String,HashMap<Integer,ArrayList<String>>> orderedRanges;
	  public HashMap<String, List<Row>> rows; // store the transformed vRangeList( in rows&cells format )
	  
	  public ValidationTransformManager(Document doc)
	  {
		  this.doc = doc;
		  this.validationMap = new HashMap<String, Validation>();
		  this.rangeMap = new HashMap<String,ValidationRange>();
		  this.orderedRanges = new HashMap<String,HashMap<Integer,ArrayList<String>>>();
		  this.slaveRangeMap = new HashMap<String,String>();
		  this.rows = new HashMap<String, List<Row>>();
	  }
	  
	  public void updateBaseRefs()
	  {
		  try{
			  Iterator<String> iter = this.slaveRangeMap.keySet().iterator();
			  while(iter.hasNext())
			  {
				  String slaveId = iter.next();
				  String parentId = this.slaveRangeMap.get(slaveId);
				  Validation v = this.validationMap.get(parentId);
				  ValidationRange vRange = this.rangeMap.get(slaveId);
				  v.updateBaseRef(vRange.startRow, vRange.startCol);
			  }
		  }catch(Exception e)
		  {
			  e.printStackTrace();
		  }
	  }

	  public void addValidation(UnNameRange range)
	  {
		  //construct the ValidationRange
		  //add to validationMap if it's master
		  //add to rangeMap
		  //add to vRangeList
		  range.address = IDMFormulaLexer.transOOXMLFormulaToODF(range.address);
		  ValidationRange vRange = new ValidationRange(range);
		  
		  try{
			  //it's a slave data validation range
			  if(range.data.containsKey(ConversionConstant.PARENT_ID))
			  {
				  String parentId =(String) range.data.get(ConversionConstant.PARENT_ID);
				  vRange.setValidationName(parentId);
				  this.slaveRangeMap.put(vRange.rangeId, parentId);
			  }
			  else if(range.data.containsKey(ConversionConstant.CRITERIA))
			  {
				  vRange.setValidationName(vRange.rangeId);
				  
				  // add to rangeMap
				  JSONObject criteria = (JSONObject) range.data.get(ConversionConstant.CRITERIA);
				  Validation vld = new Validation(vRange.rangeId, range.address);
				  vld.setCriteria(criteria);
				  vld.getObjectFromJSON();
				  this.validationMap.put(vRange.validationName, vld);
			  } 
		  }catch(IOException e)
		  {
			  e.printStackTrace();
		  }
		  
		  this.rangeMap.put(vRange.rangeId, vRange);
	  }
	  /**
	   * sort all the ranges in rangeMap, store them into vRangeList
	   */
	  public void sortRanges()
	  {
		  int rangeCnt = this.rangeMap.size();
		  Iterator<String> iter =  this.rangeMap.keySet().iterator(); 
		  while(iter.hasNext())
		  {
			  String rangeId = iter.next();
			  ValidationRange vRange = this.rangeMap.get(rangeId);
			  String sheetId = vRange.sheetId;
			  int startRow = vRange.startRow;
			  
			  HashMap<Integer,ArrayList<String>> ordRanges = this.orderedRanges.get(sheetId);
			  if(null == ordRanges)
			  {
				  ordRanges = new HashMap<Integer,ArrayList<String>>();
				  this.orderedRanges.put(sheetId, ordRanges);
			  }
			  ArrayList<String> rIdList = ordRanges.get(startRow);
			  if(null == rIdList)
			  {
				  rIdList = new ArrayList<String>();
				  ordRanges.put(startRow, rIdList);
			  }
			  this.addToRangeIdList(vRange, rIdList);
		  }
	  }
	  
	  private void addToRangeIdList(ValidationRange vRange, ArrayList<String> rIdList)
	  {
		  int startCol = vRange.startCol;
		  int start = 0, end = rIdList.size() -1, mid = 0;
		  while(start <= end)
		  {
			  mid = (start + end) >> 1;
		  	  String rId = rIdList.get(mid);
		  	  ValidationRange r = this.rangeMap.get(rId);
		  	  if(startCol > r.startCol)
		  		  start = mid + 1;
		  	  else
		  		  end = mid -1;
		  }
		  //need to put the vRange in end +1
		  rIdList.add(end + 1, vRange.rangeId);
	  }
	  
	  private List<Integer> getEndRows(ArrayList<String> rIdList, int nextRowIndex)
	  {
		  List<Integer> endRows = new ArrayList<Integer>();
		  //use this hashSet to avoid the duplicated rows
		  HashSet<Integer> rowsSet = new HashSet<Integer>();
		  boolean hasExceed = false;
		  int cnt = rIdList.size();
		  for(int i = 0; i < cnt ;i++)
		  {
			  String rId = rIdList.get(i);
			  ValidationRange vRange = this.rangeMap.get(rId);
			  int endRow = vRange.endRow;
			  if(endRow < nextRowIndex)
			  {
				  if(!rowsSet.contains(endRow))
				  {
					  endRows.add(endRow);
					  rowsSet.add(endRow);
				  }
			  }
			  else
				  hasExceed = true;
		  }
		  if(hasExceed)
		  {
			  if(nextRowIndex != ConversionConstant.MAX_ROW_NUM )
				  nextRowIndex--;
			  if(!rowsSet.contains(nextRowIndex))
				  endRows.add(nextRowIndex);
		  }
		  Collections.sort(endRows);
		  return endRows;
	  }
	  
	  private void mergeLeftRangesToNext(ArrayList<String> leftRIdList, ArrayList<String> nextRIdList)
	  {
		  int leftCnt = leftRIdList.size();
		  int nextCnt = nextRIdList.size();
		  int j = 0;
		  for(int i = 0; i < leftCnt; i++)
		  {
			  String leftRId = leftRIdList.get(i);
			  ValidationRange leftVRange = this.rangeMap.get(leftRId);
			  while(j < nextCnt)
			  {
				  String nextRId = nextRIdList.get(j);
				  ValidationRange nextVRange = this.rangeMap.get(nextRId);
				  if(nextVRange.startCol > leftVRange.startCol)
					  break;
				  j++;
			  }
			  nextRIdList.add(j, leftRId);
			  nextCnt++;
		  }
	  }
	  
	  private void constructRowsByRanges(HashMap<Integer,ArrayList<String>> ordRanges, String sheetId)
	  {
		  Sheet sheet = doc.getSheetById(sheetId);
		  List<Row> rowsList = new ArrayList<Row>();
		  this.rows.put(sheetId, rowsList);
		  int startRowCnt = ordRanges.size();
		  Object [] startRows = ordRanges.keySet().toArray();
		  Arrays.sort(startRows);
		  //consume the vRanges start with startRow
		  for(int i = 0; i < startRowCnt; i++)
		  {
			  Integer startRow = (Integer)startRows[i];
			  ArrayList<String> rIdList = ordRanges.get(startRow);
			  
			  int nextRowIndex = i == (startRowCnt -1) ? ConversionConstant.MAX_ROW_NUM :(Integer) startRows[i+1];
			  List<Integer> endRows = this.getEndRows(rIdList, nextRowIndex);
			  int endRowCnt = endRows.size();
			  int curStartRow = startRow;
			  for(int j = 0; j < endRowCnt; j++)
			  {
				  int endRow = endRows.get(j);
		          Row row = new Row();
		          row.sheetId = sheetId;
		          row.rowIndex = curStartRow -1;
		          row.rowId = this.doc.getId("row", sheetId, row.rowIndex, true);//sheet.rowIdArray.get(row.rowIndex);
		          row.repeatedNum = endRow - curStartRow;
		          curStartRow = endRow + 1;
		          for(int k = 0; k < rIdList.size();)
		          {
		        	  String rId = rIdList.get(k);
		        	  ValidationRange vRange = this.rangeMap.get(rId);
		        	  //construct cells by the vRange
	                  Cell cell = new Cell();
	                  cell.rowId = row.rowId;
	                  cell.cellIndex = vRange.startCol -1;
	                  cell.cellId = sheet.columnIdArray.get(cell.cellIndex);
	                  cell.repeatedNum = vRange.endCol - vRange.startCol;
	                  cell.org_repeatedNum = cell.repeatedNum;
	                  cell.validationName = vRange.validationName;
	                  row.cellList.add(cell);
	                  row.cellmap.put(cell.cellId, row.cellList.size()-1);  // create (colid) -> (cell index in cellList) map
	                  //this vRange consumed complete
	                  if(endRow == vRange.endRow)
	                	  rIdList.remove(k);
	                  else
	                	  k++;
		          }
		          rowsList.add(row);
			  }	  
			  if(rIdList.size() > 0)
			  {
				  ArrayList<String> nextRIdList = ordRanges.get(nextRowIndex);
				  this.mergeLeftRangesToNext(rIdList, nextRIdList);
			  }
		  }
	  }
	  /**
	   * transform vRangeList to rows&cells format
	   */
	  public void transformToRows()
	  {
		  Iterator<String> iter = this.orderedRanges.keySet().iterator();
		  //sheet level
		  while(iter.hasNext())
		  {
			  String sheetId = iter.next();
			  HashMap<Integer,ArrayList<String>> ordRanges = this.orderedRanges.get(sheetId);
			  this.constructRowsByRanges(ordRanges, sheetId);
		  }	  
	  }
	  
	  private boolean hasIntersection(int start1, int end1, int start2, int end2)
	  {
		  if(end1 < start2 || end2 < start1)
			  return false;
		  return true;
	  }
	  
	  //after merge data cells with data validation cells, the cached cellMap is dirty, need to rebuild
	  private void updateCellMap(Row row)
	  {
		  int cnt = row.cellList.size();
		  row.cellmap.clear();
		  for(int i = 0; i < cnt; i++)
		  {
			  Cell cell = row.cellList.get(i);
			  row.cellmap.put(cell.cellId, i);
		  }
	  }
	  /**
	   * vRow and dataRow must have the same start and end index
	   * @param vRow : validation Rows
	   * @param dataRow: 
	   */
	  private void mergeValidationWithRow(Row vRow, Row dataRow)
	  {
		  String sheetId = vRow.sheetId;
		  List<Cell> vCells = vRow.cellList;
		  List<Cell> dataCells = dataRow.cellList;
		  List<Cell> result = new ArrayList<Cell>();
		  int vCellCnt = vCells.size(), dataCellCnt = dataCells.size();
		  int i = 0, j = 0;
		  while( i < vCellCnt && j < dataCellCnt)
		  {
			  Cell vCell = vCells.get(i);
			  Cell dataCell = dataCells.get(j);
			  int vStart = vCell.cellIndex, vEnd = vStart + vCell.repeatedNum;
			  int dataStart = dataCell.cellIndex, dataEnd = dataStart + dataCell.repeatedNum;
			  boolean hasIntersection = this.hasIntersection(vStart, vEnd, dataStart, dataEnd); 
			  if(hasIntersection)
			  {
				 //1: first part
				  if(vStart < dataStart)
				  {
					  int currentEnd = dataStart -1;
					  Cell newCell = new Cell(vCell);
					  newCell.repeatedNum = currentEnd - vStart;
					  newCell.org_repeatedNum = newCell.repeatedNum;
					  vCell.cellIndex = dataStart;
					  vCell.cellId = dataCell.cellId;
					  vCell.repeatedNum = vEnd - dataStart;
					  result.add(newCell);
				  }
				  else
				  {
					  int currentEnd = vStart - 1;
					  if(dataStart <= currentEnd)
					  {
						  Cell newCell = new Cell(dataCell);
						  newCell.repeatedNum = currentEnd - dataStart;
						  newCell.org_repeatedNum = newCell.repeatedNum;
						  dataCell.cellIndex = vStart;
						  dataCell.cellId = vCell.cellId;
						  dataCell.repeatedNum = dataEnd - vStart;
						  result.add(newCell);
					  }
				  }
				  //2 :intersection part, dataCell and vCell must have the same start index and same end
				  Cell newCell = new Cell(dataCell);
				  newCell.validationName = vCell.validationName;
				  if(vEnd < dataEnd)
				  {
					 newCell.repeatedNum = vEnd - newCell.cellIndex;
					 i++;
					 // the left part
					 dataCell.cellIndex = vEnd + 1;
					 dataCell.cellId = this.doc.getId("col", sheetId,  dataCell.cellIndex, true);
					 dataCell.repeatedNum = dataEnd - dataCell.cellIndex;
				  }
				  else if(vEnd == dataEnd)
				  {
					  newCell.repeatedNum = vEnd - newCell.cellIndex;
					  i++; 
					  j++;
				  }
				  else 
				  {
					  newCell.repeatedNum = dataEnd - newCell.cellIndex;;
					  j++;
					  //the left part
					  vCell.cellIndex = dataEnd + 1;
					  vCell.cellId = this.doc.getId("col", sheetId, vCell.cellIndex, true);
					  vCell.repeatedNum = vEnd - vCell.cellIndex;
				  }
				  newCell.org_repeatedNum = newCell.repeatedNum;
				  result.add(newCell);

			  }
			  else
			  {
				  if(vStart < dataStart)
				  {
					  vCell.org_repeatedNum = vCell.repeatedNum;
					  result.add(vCell);
					  i++;
				  }
				  else{
					  dataCell.org_repeatedNum = dataCell.repeatedNum;
					  result.add(dataCell);
					  j++;
				  }
			  }
		  }
		  while(i < vCellCnt)
		  {
			  result.add(vCells.get(i));
			  i++;
		  }
		  while(j < dataCellCnt)
		  {
			  result.add(dataCells.get(j));
			  j++;
		  }
		  dataRow.cellList = result;
		  this.updateCellMap(dataRow);
	  }
	  
	  private List<Row> removeDuplicateRows(List<Row> dataRows)
	  {
		  List<Row> dpRows = new ArrayList<Row>();
		  for(int i = 0; i < dataRows.size() ; )
		  {
			  Row row = dataRows.get(i);
			  if(row.repeatedNum > 0)
			  {
				  int start = row.rowIndex;
				  int end = start + row.repeatedNum;
				  i++;
				  while(i < dataRows.size())
				  {
					  Row nRow = dataRows.get(i);
					  if(nRow.rowIndex > end )
						  break;
					  dpRows.add(nRow);
					  dataRows.remove(i);
				  }
			  }
			  else
				  i++;
		  }
		  return dpRows;
	  }
	  
	  private void recoverDuplicateRows(List<Row> dataRows, List<Row> dpRows)
	  {
		  int dpRowsCnt = dpRows.size();
		  if(dpRowsCnt == 0) return;
		  int i = 0, j = 0;
		  while(i < dpRowsCnt && j < dataRows.size())
		  {
			  Row dpRow = dpRows.get(i);
			  Row dataRow = dataRows.get(j);
			  int startRow = dataRow.rowIndex, endRow = startRow + dataRow.repeatedNum;
			  if(dpRow.rowIndex > endRow)
			  {
				  j++; 
			  }
			  else
			  {
				  int k = j+1;
				  while(i < dpRowsCnt)
				  {
					  dpRow = dpRows.get(i);
					  if(dpRow.rowIndex == startRow)
					  {
						  i++;
					  }
					  else if(dpRow.rowIndex > startRow && dpRow.rowIndex <= endRow)
					  {
						  dataRows.add(k, dpRow);
						  k++;
						  i++;
					  }
					  else
						  break;
				  }
				  j = k;
			  }
		  }

	  }
	  
	  private void mergeValidationWithRowsPerSheet(List<Row> vRows, Sheet sheet)
	  {
		  String sheetId = sheet.sheetId;
		  List<Row> dataRows = sheet.rowList;
		  int vRowsCnt = vRows.size();
		  if(vRowsCnt == 0) return;
		  List<Row> dpRows = this.removeDuplicateRows(dataRows);
		  int dataRowsCnt = dataRows.size();
		  List<Row> result = new ArrayList<Row>();
		  
		  int i = 0, j = 0;
		  while( i < vRowsCnt &&  j < dataRowsCnt)
		  {
			  Row vRow = vRows.get(i);
			  Row dataRow = dataRows.get(j);
			  int vStart = vRow.rowIndex, vEnd = vStart + vRow.repeatedNum;
			  int dataStart = dataRow.rowIndex, dataEnd = dataStart + dataRow.repeatedNum;
			  boolean hasIntersection = this.hasIntersection(vStart, vEnd, dataStart, dataEnd);
			  if(hasIntersection)
			  {
				  //3 parts: first none intersection part, intersection part, last intersection part
				  //1: first part
				  if(vStart < dataStart)
				  {
					  int currentEnd = dataStart -1;
					  if(currentEnd >= vStart)
					  {
						  Row first = new Row(vRow);
						  first.repeatedNum = currentEnd - vStart;
						  vRow.rowIndex = dataStart;
						  vRow.rowId = dataRow.rowId;
						  vRow.repeatedNum = vEnd - dataStart;
						  result.add(first);
					  }
				  }
				  else
				  {
					  int currentEnd = vStart -1;
					  if(currentEnd >= dataStart)
					  {
						  Row first = new Row(dataRow);
						  first.repeatedNum = currentEnd -dataStart;
						  dataRow.rowIndex = vStart;
						  dataRow.rowId = vRow.rowId;
						  dataRow.repeatedNum = dataEnd - vStart;
						  result.add(first);
					  }
				  }
				  //2 : intersection part, 
				  int currentEnd = vEnd < dataEnd ? vEnd : dataEnd;
				  Row newDataRow = new Row(dataRow);
				  Row newVRow = null;
				  if(vEnd < dataEnd)
				  {
					  newDataRow.repeatedNum = vEnd - newDataRow.rowIndex;
					  i++;
					  // the left part
					  dataRow.rowIndex = vEnd + 1;
					  dataRow.rowId = this.doc.getId("row", sheetId, dataRow.rowIndex, true);
					  dataRow.repeatedNum = dataEnd - dataRow.rowIndex;
				  }
				  else if( vEnd == dataEnd)
				  {
					  newDataRow.repeatedNum = vEnd - newDataRow.rowIndex;
					  i++;
					  j++;
				  }
				  else
				  {
					  newDataRow.repeatedNum = dataEnd - newDataRow.rowIndex;
					  j++;
					  newVRow = new Row(vRow);
					  vRow.rowIndex = dataEnd + 1;
					  vRow.rowId = this.doc.getId("row", sheetId, vRow.rowIndex, true);
					  vRow.repeatedNum = vEnd - vRow.rowIndex;
				  }
				  this.mergeValidationWithRow(newVRow == null ? vRow : newVRow, newDataRow);
				  result.add(newDataRow);
			  }	  
			  else
			  {
				  if(vStart < dataStart)
				  {
					  result.add(vRow);
					  i++;
				  }	 
				  else
				  {
					  result.add(dataRow);
					  j++;
				  }				  
			  }
		  }
		  while(i < vRowsCnt)
		  {
			  result.add(vRows.get(i));
			  i++;
		  }
		  while(j < dataRowsCnt)
		  {
			  result.add(dataRows.get(j));
			  j++;
		  }
		  this.recoverDuplicateRows(result, dpRows);
		  sheet.rowList = result;
	  }

	  /**
	   * merge with the sheet's row list
	   * @return
	   */
	  public void mergeWithRows()
	  {
		  try{
			  if(this.validationMap.isEmpty())
				  return;
			  this.sortRanges();
			  this.transformToRows();
			  Iterator<String> iter = this.rows.keySet().iterator();
			  while(iter.hasNext())
			  {
				  String sheetId = iter.next();
				  List<Row> rowsList = this.rows.get(sheetId);
				  Sheet sheet = this.doc.getSheetById(sheetId);
				  this.mergeValidationWithRowsPerSheet(rowsList, sheet);
			  }
		  }catch(Exception e)
		  {
			  e.printStackTrace();
		  }

	  }
  }
  /**
   * Sheet is a structure which represent a JSON object for sheet tag
   * 
   */	
  public static class Sheet implements JSONModel{	  
	  public String sheetId;
    /***
     * all tags from content.js
     */
    //the row with content or style
	  public List<Row> rowList;
    /***
     * all tags from meta.js
     */
	  public int sheetIndex;
	  public String sheetName;
	  public String visibility;
	  public int maxColumnIndex;
	  public List<String> rowIdArray;
	  public List<String> columnIdArray;
	  public int maxRowIndex;
	  public int horizontalSplitMode;
	  public int verticalSplitMode;
	  public int horizontalSplitPosition;
	  public int verticalSplitPosition;
	  public String sheetDirection;
	  public boolean protectionProtected;
	  public int rowHeight;
	  public boolean showGridLines;
    /**
     * all tags from ref.js
     */
	  public List<Cell> formulaCellList;
    /***
     * for save back
     */
	  // try not use these two json objects. Will remove them after getObjectFromJSON() invoked
	  private JSONObject sheetContentJSON;
	  private JSONObject sheetMetaJSON;
    //save in concord.js zipped with ods
    //the column with style
	  public List<Column> columnList;
    /**
     * for formula parse
    */
      public boolean isODFFormula;

	  
    public Sheet(){
		
      sheetId = "";
	  protectionProtected = false;
      rowList = new ArrayList<Row>();
      sheetIndex = -1;
      sheetName = "";
      visibility = "";
      maxColumnIndex = 0;
      maxRowIndex = 0;
      horizontalSplitMode = -1;
      verticalSplitMode = -1;
      horizontalSplitPosition = -1;
      verticalSplitPosition = -1;
      sheetDirection = "";    
      rowIdArray = new ArrayList<String>();
      columnIdArray = new ArrayList<String>();

      sheetContentJSON = new JSONObject();
      sheetMetaJSON = new JSONObject();
      columnList = new ArrayList<Column>();

      formulaCellList = new ArrayList<Cell>();
      rowHeight = ConversionConstant.DEFAULT_HEIGHT_VALUE;
      showGridLines = true;
    }

    public OrderedJSONObject storeRowsToJSON() {
      OrderedJSONObject rowsJSON = new OrderedJSONObject();
      for(int i=0; i<rowList.size(); i++){
        Row row = rowList.get(i);
        OrderedJSONObject rowJSON = row.storeContentToJSON();
        if(!rowJSON.isEmpty())
          rowsJSON.put(row.rowId, rowJSON);
      }
      
      return rowsJSON;
    }
    
    public OrderedJSONObject storeContentToJSON(){
      OrderedJSONObject sheetJSON = new OrderedJSONObject();
      OrderedJSONObject rowsJSON = storeRowsToJSON();
      sheetJSON.put(ConversionConstant.ROWS, rowsJSON);

      return sheetJSON;
    }


    public OrderedJSONObject storeMetaToJSON(){
      OrderedJSONObject sheetJSON = new OrderedJSONObject();
      sheetJSON.put(ConversionConstant.SHEETINDEX, sheetIndex);
      sheetJSON.put(ConversionConstant.SHEETNAME, sheetName);
      if(protectionProtected)
    	  sheetJSON.put(ConversionConstant.PROTECTION_PROTECTED, protectionProtected);
      if (visibility.length()!= 0)
      {
        sheetJSON.put(ConversionConstant.VISIBILITY, visibility);
      }
      if(horizontalSplitMode == ConversionConstant.VIEW_FREEZE_MODE || horizontalSplitMode == ConversionConstant.VIEW_DEFAULT_MODE)
      {
    	  sheetJSON.put(ConversionConstant.HORIZONTAL_SPLIT_POSITION_JS, horizontalSplitPosition);
      }
      if(verticalSplitMode == ConversionConstant.VIEW_FREEZE_MODE || verticalSplitMode == ConversionConstant.VIEW_DEFAULT_MODE)
      {
    	  sheetJSON.put(ConversionConstant.VERTICAL_SPLIT_POSITION_JS, verticalSplitPosition);
      }
      if(ConversionConstant.RTL.equalsIgnoreCase(sheetDirection))
      {
    	  sheetJSON.put(ConversionConstant.DIRECTION, sheetDirection);
      }
      sheetJSON.put(ConversionConstant.OFF_GRIDLINES, !showGridLines);
      if(maxColumnIndex > 0)
    	  sheetJSON.put(ConversionConstant.MAXCOLINDEX, maxColumnIndex);
      if (rowHeight > 0 && rowHeight != ConversionConstant.DEFAULT_HEIGHT_VALUE)
        sheetJSON.put(ConversionConstant.SHEET_ROW_HEIGHT, rowHeight);
      return sheetJSON;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    //the JSON Object for one member of sheetsArray
    public OrderedJSONObject getJSONFromSheetArray(){
      OrderedJSONObject sheetJSON = new OrderedJSONObject();
      if(rowIdArray.size() > 0){
    	  RawJSONObject rowIdArrayJSON = new RawJSONObject(rowIdArray);
        sheetJSON.put(ConversionConstant.ROWSIDARRAY, rowIdArrayJSON);
      }
      if(columnIdArray.size() > 0){
        JSONArray colIdArrayJSON = new JSONArray();
        colIdArrayJSON.addAll(columnIdArray);
        sheetJSON.put(ConversionConstant.COLUMNSIDARRAY, colIdArrayJSON);
      }
      return sheetJSON;
    }


    public void getObjectFromJSON() throws IOException{
      if( (sheetContentJSON != null) && ( sheetMetaJSON != null)) {
    	//meta
        if(sheetMetaJSON.containsKey(ConversionConstant.SHEETINDEX))
          this.sheetIndex = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.SHEETINDEX).toString());
        if(sheetMetaJSON.containsKey(ConversionConstant.SHEETNAME))
          this.sheetName = sheetMetaJSON.get(ConversionConstant.SHEETNAME).toString();
        if(sheetMetaJSON.containsKey(ConversionConstant.VISIBILITY))
          this.visibility = sheetMetaJSON.get(ConversionConstant.VISIBILITY).toString();        
        if(sheetMetaJSON.containsKey(ConversionConstant.MAXCOLINDEX))
            this.maxColumnIndex = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.MAXCOLINDEX).toString());
        if(sheetMetaJSON.containsKey(ConversionConstant.HORIZONTAL_SPLIT_POSITION_JS)){
        	this.horizontalSplitPosition = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.HORIZONTAL_SPLIT_POSITION_JS).toString());	
        	this.horizontalSplitMode = this.horizontalSplitPosition > 0 ? ConversionConstant.VIEW_FREEZE_MODE : ConversionConstant.VIEW_DEFAULT_MODE;
        }
        if(sheetMetaJSON.containsKey(ConversionConstant.DIRECTION)){
        	this.sheetDirection = (String) sheetMetaJSON.get(ConversionConstant.DIRECTION);
        }
        if(sheetMetaJSON.containsKey(ConversionConstant.VERTICAL_SPLIT_POSITION_JS)){
        	this.verticalSplitPosition = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.VERTICAL_SPLIT_POSITION_JS).toString());
        	this.verticalSplitMode = this.verticalSplitPosition > 0 ? ConversionConstant.VIEW_FREEZE_MODE : ConversionConstant.VIEW_DEFAULT_MODE;
        }
        if(sheetMetaJSON.containsKey(ConversionConstant.SHEET_ROW_HEIGHT))
          this.rowHeight = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.SHEET_ROW_HEIGHT).toString());
       /* if(sheetMetaJSON.containsKey(ConversionConstant.HORIZONTAL_SPLIT_MODE))
            this.horizontalSplitMode = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.HORIZONTAL_SPLIT_MODE).toString());
        if(sheetMetaJSON.containsKey(ConversionConstant.VERTICAL_SPLIT_MODE))
            this.verticalSplitMode = Integer.parseInt(sheetMetaJSON.get(ConversionConstant.VERTICAL_SPLIT_MODE).toString());*/
        //content
        JSONObject rowsContentJSON = null;
        if(sheetContentJSON.containsKey(ConversionConstant.ROWS))
          rowsContentJSON = (JSONObject) sheetContentJSON.get(ConversionConstant.ROWS);
        for(int rowIndex = 0; rowIndex < this.rowIdArray.size(); rowIndex++){
          Row row = new Row();
          row.sheetId = this.sheetId;
          row.rowIndex = rowIndex;
          String rowId = rowIdArray.get(rowIndex);
          if(!rowId.equals("")){
            row.rowId = rowId;
            if(rowsContentJSON!=null&&rowsContentJSON.containsKey(rowId)){
              JSONObject rowJSON = null;
              Object jsonobj = rowsContentJSON.get(rowId);
              if (jsonobj instanceof String) // row json is packed as a string to save memory
                rowJSON = JSONObject.parse((String)jsonobj);
              else
                rowJSON = (JSONObject) rowsContentJSON.get(rowId);
              for(int columnIndex = 0;columnIndex < this.columnIdArray.size();columnIndex++){
                if(!columnIdArray.get(columnIndex).equals("")){
                  String columnId = columnIdArray.get(columnIndex);
                  if(rowJSON.containsKey(columnId)){
                    Cell cell = new Cell();
                    cell.cellId = columnId;
                    cell.rowId = row.rowId;   //set row id here
                    cell.cellIndex = columnIndex;
                    JSONObject cellJSON = (JSONObject) rowJSON.get(columnId);
                    // cell.cellContentJSON = cellJSON;
                    cell.getObjectFromJSON(cellJSON);
                    if (!this.isODFFormula && isFormulaString(cell.value.toString()))
                    {
                      cell.value = IDMFormulaLexer.transOOXMLFormulaToODF(cell.value.toString());
                    }
                    row.cellList.add(cell);
                    row.cellmap.put(columnId, row.cellList.size()-1);  // create (colid) -> (cell index in cellList) map
                  }
                }
              }
            }
            this.rowList.add(row);
          }
        }
      }
      // release json object in sheets which is not used 
      this.sheetContentJSON = null;
      this.sheetMetaJSON = null;
    }

    public JSONType getType(){
      return JSONType.SHEET;
    }
    
    /**
     * get the row with the specified rowId
     * @param rowId
     * @return row instance
     */
    public Row getRowById(String rowId){
      if(hasValue(rowId)){
        for(int i=0;i<rowList.size();i++){
          Row row = rowList.get(i);
          if(row.rowId.equals(rowId))
            return row;
        }
      }
      return null;

    }

    /**
     * get the row with the specified rowId
     * @param rowId
     * @return row instance
     */
    public Row getRowByIndex(int rowIdx){
      if (rowList.size()==0)
        return null;
      int startidx = 0;
      int endidx = rowList.size() - 1;
      do {
        int pos = (startidx + endidx) / 2;
        Row row = rowList.get(pos);
        if (rowIdx < row.rowIndex ) 
        {
          endidx = (endidx == pos)? pos -1 : pos;
        }
        else if (rowIdx > row.rowIndex + row.repeatedNum)
        {
          startidx = (startidx == pos)? pos + 1 : pos;
        }
        else
        {
          return row;
        }
      } while (startidx <= endidx);
      return null;
    }

    /**
     * get the column with the specified columnId
     * @param columnId
     * @return column instance
     */
    public Column getStyledColumnById(String columnId){
      if(hasValue(columnId)){
        for(int i=0;i<columnList.size();i++){
          Column column = columnList.get(i);
          if(column.columnId.equals(columnId))
            return column;
        }
      }
      return null;
    }
    
    /**
     * get the style column which can cover the column at specified index
     * @param columnIndex   0-based
     * @return
     */
    public Column getCoveredStyleColumnByIndex(int columnIndex){
      for(int i=0;i<columnList.size();i++){
        Column column = columnList.get(i);
        if(column != null){
          if(column.columnIndex <= columnIndex){
            if(column.columnIndex + column.repeatedNum >= columnIndex)
              return column;
          }else
            return null;
        }
      }
      return null;
    }
  }
  /**
   * Name is a structure which represent a JSON object for names tag
   * 
   */	
  public static class Range implements JSONModel{
	  public String rangeId;
    /***
     * all tags from content.js
     */
	  public String address;
	  public String sheetId;
      public String endSheetId;
	  public String startRowId;
	  public String startColId;
	  public String endRowId;
	  public String endColId;
	  public RangeType usage;
    /***
     * all tags from meta.js
     */
    /**
     * for save back
     */
	  public JSONObject rangeContentJSON;
	  public JSONObject rangeMetaJSON;
    public Range(){
      rangeId = "";	
      address = "";
      sheetId = "";
      endSheetId = "";
      startRowId = "";
      startColId = "";
      endRowId = "";
      endColId = "";
      usage = RangeType.NORMAL;
      rangeContentJSON = null;
      rangeMetaJSON = null;
    }
    public OrderedJSONObject storeContentToJSON(){

      OrderedJSONObject rangeJSON = new OrderedJSONObject();
      if(hasValue(address))
      {
        if (IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_ODF))
        {
          rangeJSON.put(ConversionConstant.RANGE_ADDRESS, address);
        }
        else
        {
          rangeJSON.put(ConversionConstant.RANGE_ADDRESS, IDMFormulaLexer.transODFFormulaToOOXML(address));
        }
        
      }
      if(hasValue(sheetId))
        rangeJSON.put(ConversionConstant.SHEETID, sheetId);
      if(hasValue(endSheetId))
        rangeJSON.put(ConversionConstant.ENDSHEETID, endSheetId);
      if(hasValue(startRowId))
        rangeJSON.put(ConversionConstant.RANGE_STARTROWID, startRowId);
      if(hasValue(startColId))
        rangeJSON.put(ConversionConstant.RANGE_STARTCOLID, startColId);
      if(hasValue(endRowId))
        rangeJSON.put(ConversionConstant.RANGE_ENDROWID, endRowId);
      if(hasValue(endColId))
        rangeJSON.put(ConversionConstant.RANGE_ENDCOLID, endColId);
      if( usage != RangeType.NORMAL )
        rangeJSON.put(ConversionConstant.RANGE_USAGE, usage.toString());
      return rangeJSON;

    }

    public OrderedJSONObject storeMetaToJSON(){
      return null;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    public void getObjectFromJSON() {

      if(rangeContentJSON != null) {
        if(rangeContentJSON.containsKey(ConversionConstant.SHEETID))
          this.sheetId = rangeContentJSON.get(ConversionConstant.SHEETID).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.ENDSHEETID))
          this.endSheetId = rangeContentJSON.get(ConversionConstant.ENDSHEETID).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.RANGE_STARTROWID))
          this.startRowId = rangeContentJSON.get(ConversionConstant.RANGE_STARTROWID).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.RANGE_STARTCOLID))
          this.startColId = rangeContentJSON.get(ConversionConstant.RANGE_STARTCOLID).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.RANGE_ENDROWID))
          this.endRowId = rangeContentJSON.get(ConversionConstant.RANGE_ENDROWID).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.RANGE_ENDCOLID))
          this.endColId = rangeContentJSON.get(ConversionConstant.RANGE_ENDCOLID).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.RANGE_ADDRESS))
          this.address = rangeContentJSON.get(ConversionConstant.RANGE_ADDRESS).toString();
        if(rangeContentJSON.containsKey(ConversionConstant.RANGE_USAGE))
          this.usage = RangeType.enumValueOf(rangeContentJSON.get(ConversionConstant.RANGE_USAGE).toString());
      } 
    }
    
    public JSONType getType(){
      return JSONType.RANGE;
    }
  }
  
  public static class DrawFrameRange extends UnNameRange
  {
	public Document doc;
    public String href;
    public String link;
    public boolean ib;
    public int z = -1;
    public double x;
    public double y;
    public double w;
    public double h;
    public String pt;
    public double ex = -2.0;
    public double ey = -2.0;
    public String alt;
	
    public OrderedJSONObject storeContentToJSON(){
    	
    	//Just a work around. When update to new version, the end cell address is lost.
        //We use the chart width / default column width as the column number, and chart height /default row height as the row number
        if(this.usage==RangeType.CHART)
        {
      	  ReferenceParser.ParsedRef ref = ReferenceParser.parse(this.address);
      	  if(doc!=null && ref!=null && ref.type == ReferenceParser.ParsedRefType.CELL)
      	  {
  			  int startRowIdx = ReferenceParser.translateRow(ref.startRow);
  	    	  int startColIdx = ReferenceParser.translateCol(ref.startCol);
  	    	  
  			  int rowCnt = (int)this.h/Row.defaultHeight;
  			  int colCnt = (int)this.w/Column.defaultWidth;
  			  Sheet sheet = null;
  			  for(int i=0;i<doc.sheetList.size();i++)
  			  {
  				  Sheet item = doc.sheetList.get(i);
  				  if(this.sheetId.equals(item.sheetId))
  				  {
  					  sheet = item;
  					  break;
  				  }
  			  }
  			  if(rowCnt>1 || colCnt>1)
  			  {
  				  if(rowCnt>1)
  				  {
  					  int endRow = startRowIdx+rowCnt-1;
    				  this.endRowId = ConversionUtil.updateIdArray(endRow-1, sheet, doc, true, true);
    				  ref.endRow = ReferenceParser.translateRow(endRow);
  				  }
    			  if(colCnt>1)
    			  {
    				  int endCol = startColIdx+colCnt-1;
    				  this.endColId = ConversionUtil.updateIdArray(endCol-1, sheet, doc, false, true);
    				  ref.endCol = ReferenceParser.translateCol(endCol);
    			  }
    			  ref.type = ReferenceParser.ParsedRefType.RANGE;
    			  ref.patternMask |= ReferenceParser.END_COLUMN;
    			  ref.patternMask |= ReferenceParser.END_ROW;
    			  this.address = ref.toString();
  			  }
  		  }
  	  }
      OrderedJSONObject content = super.storeContentToJSON();
      if(hasValue(href))
        data.put(ConversionConstant.RANGE_HREF, href);
      if(hasValue(link))
        data.put(ConversionConstant.RANGE_LINK, link);
      data.put(ConversionConstant.POSITION_X, x);
      data.put(ConversionConstant.POSITION_Y, y);
      if(hasValue(pt))
        data.put(ConversionConstant.POSITION_TYPE, pt);
      data.put(ConversionConstant.WIDTH, w);
      data.put(ConversionConstant.HEIGHT, h);
      if(ex != -2.0)
        data.put(ConversionConstant.POSITION_EX, ex);
      if(ey != -2.0)
      data.put(ConversionConstant.POSITION_EY, ey);      
      if(z != -1)
        data.put(ConversionConstant.INDEX_Z, z);
      if(hasValue(alt))
    	data.put(ConversionConstant.ALT, alt);
      
      return content;
    }
    
    public void getObjectFromJSON() {
      super.getObjectFromJSON();
      if(data != null) {
        if(data.containsKey(ConversionConstant.RANGE_HREF))
          this.href= data.get(ConversionConstant.RANGE_HREF).toString();
        if(data.containsKey(ConversionConstant.POSITION_X))
          this.x = Double.parseDouble(data.get(ConversionConstant.POSITION_X).toString());
        if(data.containsKey(ConversionConstant.POSITION_Y))
          this.y = Double.parseDouble(data.get(ConversionConstant.POSITION_Y).toString());
        if(data.containsKey(ConversionConstant.POSITION_TYPE))
          this.pt = data.get(ConversionConstant.POSITION_TYPE).toString();        
        if(data.containsKey(ConversionConstant.WIDTH))
          this.w = Double.parseDouble(data.get(ConversionConstant.WIDTH).toString());
        if(data.containsKey(ConversionConstant.HEIGHT))
          this.h = Double.parseDouble(data.get(ConversionConstant.HEIGHT).toString());
        if(data.containsKey(ConversionConstant.POSITION_EX))
          this.ex =Double.parseDouble(data.get(ConversionConstant.POSITION_EX).toString());
        if(data.containsKey(ConversionConstant.POSITION_EY))
          this.ey = Double.parseDouble(data.get(ConversionConstant.POSITION_EY).toString());        
        if(data.containsKey(ConversionConstant.INDEX_Z))
          this.z =Integer.parseInt(data.get(ConversionConstant.INDEX_Z).toString());
        if(data.containsKey(ConversionConstant.RANGE_LINK))
          this.link = data.get(ConversionConstant.RANGE_LINK).toString();
        if(data.containsKey(ConversionConstant.ALT)){
          String alt = data.get(ConversionConstant.ALT).toString();
          if(!alt.equals(""))
        	  this.alt = alt;
        }
      }
    }
    
    //Calculate the end cell address by the chart height and width
    private void calculateEndCell()
    {
    	if(this.usage==RangeType.CHART && doc!=null)
        {
      	  ReferenceParser.ParsedRef ref = ReferenceParser.parse(this.address);
      	  if(ref==null)
      		  return;
      	  
      	  boolean sameRow = !hasValue(this.endRowId) || this.endRowId.equals(this.startRowId);
      	  boolean sameCol = !hasValue(this.endColId) || this.endColId.equals(this.startColId);
      	  
      	  if(sameRow && sameCol)
      	  {
  			  int startRowIdx = ReferenceParser.translateRow(ref.startRow);
  	    	  int startColIdx = ReferenceParser.translateCol(ref.startCol);
  	    	  
  			  List<Row> uniqueRows = doc.uniqueRows.uniqueRowList;
  			  int accHeight = 0;
  			  int lastRowIdx = startRowIdx;
  			  boolean rowDone = false;
  			  for(int i=0;i<uniqueRows.size();i++)
  			  {
  				  Row row = uniqueRows.get(i);
  				  if(!row.sheetId.equals(this.sheetId))
  					  continue;
  				  
  				  if(row.rowIndex>=lastRowIdx)
  				  {
  					  while(row.rowIndex>lastRowIdx)
  					  {
  						  accHeight += Row.defaultHeight;
  						  if(accHeight>this.h+this.y)
  						  {
  							  rowDone = true;
  							  break;
  						  }
  						  lastRowIdx++;
  					  }
  					  if(rowDone)
  						  break;
  					  
  					  while(lastRowIdx<=row.rowIndex + row.repeatedNum)
  					  {
  						  if(!"hide".equals(row.visibility) && !"filter".equals(row.visibility))
  							  accHeight += row.height;
  						  if(accHeight>this.h+this.y)
  						  {
  							  rowDone = true;
  							  break;
  						  }
  						  lastRowIdx++;
  					  }
  					  if(rowDone)
  						  break;
  				  }
  				  else if(row.rowIndex + row.repeatedNum>=lastRowIdx)
  				  {
  					  while(lastRowIdx<=row.rowIndex + row.repeatedNum)
  					  {
  						  if(!"hide".equals(row.visibility) && !"filter".equals(row.visibility))
  							  accHeight += row.height;
  						  if(accHeight>this.h+this.y)
  						  {
  							  rowDone = true;
  							  break;
  						  }
  						  lastRowIdx++;
  					  }
  					  if(rowDone)
  						  break;
  				  }
  			  }
  			  if(!rowDone)
  			  {
  				  while(true)
  				  {
  					  accHeight += Row.defaultHeight;
  					  if(accHeight>this.h+this.y)
  						  break;
  					  lastRowIdx++;
  				  }
  			  }
  			  List<Column> uniqueCols = doc.uniqueColumns.uniqueColumnList;
  			  int accWidth = 0;
  			  int lastColIdx = startColIdx;
  			  boolean colDone = false;
  			  for(int i=0;i<uniqueCols.size();i++)
  			  {
  				  Column col = uniqueCols.get(i);
  				  if(!col.sheetId.equals(this.sheetId))
  					  continue;
  				 
  				  if(col.columnIndex>=lastColIdx)
  				  {
  					  while(col.columnIndex>lastColIdx)
  					  {
  						  accWidth += Column.defaultWidth;
  						  if(accWidth>this.w+this.x)
  						  {
  							  colDone = true;
  							  break;
  						  }
  						  lastColIdx++;
  					  }
  					  if(colDone)
  						  break;
  					  while(lastColIdx <= col.columnIndex + col.repeatedNum)
  					  {
  						  if(!"hide".equals(col.visibility) && !"filter".equals(col.visibility))
  							  accWidth += col.width;
  						  if(accWidth>this.w+this.x)
  						  {
  							  colDone = true;
  							  break;
  						  }
  						  lastColIdx++;
  					  }
  					  if(colDone)
  						  break;
  				  }
  				  else if(col.columnIndex+col.repeatedNum>=lastColIdx)
  				  {
  					  while(lastColIdx<=col.columnIndex + col.repeatedNum)
  					  {
  						  if(!"hide".equals(col.visibility) && !"filter".equals(col.visibility))
  							  accWidth += col.width;
  						  if(accWidth>this.w+this.x)
  						  {
  							  colDone = true;
  							  break;
  						  }
  						  lastColIdx++;
  					  }
  					  if(colDone)
  						  break;
  				  }
  			  }
  			  if(!colDone)
  			  {
  				  while(true)
  				  {
  					  accWidth += Column.defaultWidth;
  					  if(accWidth>this.w+this.x)
  						  break;
  					  lastColIdx ++;
  				  }
  			  }
  			  if(lastColIdx>startColIdx || lastRowIdx>startRowIdx)
  			  {
  				  ref.endRow = ReferenceParser.translateRow(lastRowIdx);
  				  ref.endCol = ReferenceParser.translateCol(lastColIdx);
  				  ref.type = ReferenceParser.ParsedRefType.RANGE;
  				  ref.patternMask |= ReferenceParser.END_ROW;
  			      ref.patternMask |= ReferenceParser.END_COLUMN;
  				  this.address = ref.toString();
  			  }
  		  }
  	  }
    }
  }
  
  public static class UnNameRange extends Range
  {
    public JSONObject data;
    
    public UnNameRange()
    {
      super();
      data = new JSONObject();
    }
    
    public OrderedJSONObject storeContentToJSON(){
      OrderedJSONObject content = super.storeContentToJSON();
      content.put(ConversionConstant.DATAFILED, data);
      return content;
    }
    
    public void getObjectFromJSON() {
      super.getObjectFromJSON();
      data = (JSONObject) rangeContentJSON.get(ConversionConstant.DATAFILED);
    }
  }

  /**
   * Rows is a structure which represent a JSON object for the unique row container of the meta.js
   */
  public static class Rows implements JSONModel{

	public List<Row> uniqueRowList;
	private Document doc;
    /**
     * for save back
     */
    public Rows(Document doc){
      uniqueRowList = new ArrayList<Row>();
      this.doc = doc;
    }
    public OrderedJSONObject storeContentToJSON() {
      return null;
    }

    public OrderedJSONObject storeMetaToJSON() {
      Map<String, Sheet> sheetIdMap = new HashMap<String, Sheet>();
      OrderedJSONObject rowsJSON = new OrderedJSONObject();
      for(int i=0;i<uniqueRowList.size();i++){
        Row uniqueRow = uniqueRowList.get(i);
        String sheetId = uniqueRow.sheetId;
        OrderedJSONObject perSheetRows = (OrderedJSONObject) rowsJSON.get(sheetId);
        Sheet sheet = sheetIdMap.get(sheetId);
        if(null == perSheetRows)
        {
          perSheetRows = new OrderedJSONObject();
          rowsJSON.put(sheetId, perSheetRows);
          sheet = doc.getSheetById(sheetId);
          sheetIdMap.put(sheetId, sheet);
        }
        perSheetRows.put(uniqueRow.rowId, uniqueRow.storeMetaToJSON(sheet));
      }
      return rowsJSON;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    public void getObjectFromJSON() throws IOException {
    }
    
    public JSONType getType(){
      return JSONType.DEFAULT;
    }

  }

  /**
   * Columns is a structure which represent a JSON object for the unique column container of the meta.js
   */
  public static class Columns implements JSONModel{

	  public List<Column> uniqueColumnList;
    /**
     * save back to odf
     */
	  public JSONObject columnsMetaJSON;
    public Columns(){
      uniqueColumnList = new ArrayList<Column>();
      columnsMetaJSON = null;
    }
    public OrderedJSONObject storeContentToJSON() {
      return null;
    }

    public OrderedJSONObject storeMetaToJSON() {
      OrderedJSONObject colsJSON = new OrderedJSONObject();
      for(int i=0;i<uniqueColumnList.size();i++){
        Column uniqueCol = uniqueColumnList.get(i);
        String sheetId = uniqueCol.sheetId;
        OrderedJSONObject perSheetColMeta = (OrderedJSONObject) colsJSON.get(sheetId);
        if(null == perSheetColMeta)
        {
          perSheetColMeta = new OrderedJSONObject();
          colsJSON.put(sheetId, perSheetColMeta);
        }
        OrderedJSONObject colMeta = uniqueCol.storeMetaToJSON();
        if (!colMeta.isEmpty())
          perSheetColMeta.put(uniqueCol.columnId, colMeta);
      }
      return colsJSON;
    }

    public OrderedJSONObject storeRefToJSON(){
      return null;
    }

    public void getObjectFromJSON() throws IOException {
      if(columnsMetaJSON != null){
        Iterator<String> columnIter = columnsMetaJSON.keySet().iterator();
        while(columnIter.hasNext()){
          String columnId = columnIter.next();
          Column column = new Column();
          column.columnId = columnId;
          column.columnMetaJSON = JSONObject.parse(columnsMetaJSON.get(columnId).toString());
          column.getObjectFromJSON();
          uniqueColumnList.add(column);
        }
      }

    }
    
    public JSONType getType(){
      return JSONType.DEFAULT;
    }

  }
  /**
   * Document is a structure which represent a JSON object for the whole content.js or meta.js
   * 
   */	
  public static class Document implements JSONModel{
    //specified the max id of current context
	  private static final String CLAZZ = Document.class.getName();
	  private static final Logger LOG = Logger.getLogger(CLAZZ);
	  
	  public int maxRowId;
	  public int maxColumnId;
	  public int maxImgId;
    /***
     * all tags from content.js
     */
	  public String url;
	  public List<Sheet> sheetList;
	  public List<Range> nameList;
	  public List<Range> unnameList;
	  public HashMap<String, Validation> validationMap;
	  public ValidationTransformManager validationTransMgr; // used for validation export
	  
	  public List<CellStyleType> cellStyleList;
	  //font name as the key, corresponding font family as the value;
	  public HashMap<String, String> fontMap;
	  public HashMap<String, JSONObject> preserveRangeList;
	  public boolean exportProtection ;
	  public CellStyleType defaultStyle; //name with "Default"
    /**
     * all tags from meta.js
     */
	  public Rows uniqueRows;
	  public Columns uniqueColumns;

	  public int defaultColumnWidth;
	  
	  public DocumentVersion version;
	  
	  public boolean bCalculated;
	  // record locale and version info here. so need not keep docMetaJSON in following process
      public String docLocale;
      public String docVersion;
      public boolean isDate1904;
    /**
     * for save back
     */
	  public JSONObject docContentJSON;
	  public JSONObject docMetaJSON;
	  public JSONObject docPreserveJSON;
      public JSONArray  docCommentsJSON;
	 /**
	  * for formula parse
	 */
     public boolean isODFFormula;

    public Document(){
      url = "";
      sheetList = new ArrayList<Sheet>();
      nameList = new ArrayList<Range>();
      unnameList = new ArrayList<Range>();
      validationMap = new HashMap<String, Validation>();
      validationTransMgr = new ValidationTransformManager(this);
      cellStyleList = new ArrayList<CellStyleType>();
      preserveRangeList = new HashMap<String, JSONObject>();
      docCommentsJSON = new JSONArray();
      uniqueRows = new Rows(this);
      uniqueColumns = new Columns();

      docContentJSON = null;
      docMetaJSON = null;
      docLocale = "";
      docVersion = "";
      maxRowId = -1;
      maxColumnId = -1;
      fontMap = new HashMap<String, String>();
      Column.defaultWidth = ConversionConstant.DEFAULT_WIDTH_VALUE;
      defaultColumnWidth = ConversionConstant.DEFAULT_WIDTH_VALUE;
      version = DocumentVersion.BEFORE_1_0_0;
      bCalculated = true;
      isDate1904 = false;
    }

    public String createId(boolean bRow){
      String prefix = null;
      int maxIndex = 0;
      if(bRow){
        prefix = ConversionConstant.ROWID;
        maxIndex = maxRowId++;
      }else{
        prefix = ConversionConstant.COLUMNID;
        maxIndex = maxColumnId++;
      }
      String id = prefix + maxIndex;
      return id;
    }
    

    public String createId(String type){
      String prefix = null;
      int maxIndex = 0;
      if("image".equals(type))
      {
        prefix = ConversionConstant.IMGID;
        maxIndex = maxImgId++;
      }
      else if("row".equals(type)){
        prefix = ConversionConstant.ROWID;
        maxIndex = maxRowId++;
      }else if("col".equals(type)){
        prefix = ConversionConstant.COLUMNID;
        maxIndex = maxColumnId++;
      }
      String id = prefix + maxIndex;
      return id;
    }
    
    public String getId(String type, String sheetId, int index, boolean bCreate)
    {
    	String id = "";
    	Sheet sheet = this.getSheetById(sheetId);
    	if("row".equals(type))
    	{
    		if(index < sheet.rowIdArray.size())
    		  id = sheet.rowIdArray.get(index);
    	}
    	else
    	{
    		if(index < sheet.columnIdArray.size())
    		  id = sheet.columnIdArray.get(index);
    	}
		if(id.length() == 0 && bCreate)
		{
			id = this.createId(type);
			if("row".equals(type))
			{
				int len = sheet.rowIdArray.size();
		        int fillCount = index - len + 1;
		        for (int i = 0; i < fillCount; ++i)
		        	sheet.rowIdArray.add(len+i, "");

		        sheet.rowIdArray.set(index, id);
			}
			else{
				int len = sheet.columnIdArray.size();
		        int fillCount = index - len + 1;
		        for (int i = 0; i < fillCount; ++i)
		        	sheet.columnIdArray.add(len+i, "");

		        sheet.columnIdArray.set(index, id);
			}
		}
		return id;
    }
    
    public void addValidationRange(String validationName, String sheetName, int startRow, int endRow, int startCol, int endCol)
    {
    	Validation validation = validationMap.get(validationName);
    	if(validation != null)
    		validation.addRange(sheetName, startRow, endRow, startCol, endCol);
    }
    
    public OrderedJSONObject namesToJSON() {
      OrderedJSONObject namesJSON = new OrderedJSONObject();
      for(int i = 0; i < nameList.size();i++)
      {
        Range name = nameList.get(i);
        OrderedJSONObject nameJSON = name.storeContentToJSON();
        namesJSON.put(name.rangeId,nameJSON);
      }
      return namesJSON;
    }
    
    public OrderedJSONObject unnamesToJSON() {
      OrderedJSONObject unnamesJSON = new OrderedJSONObject();
      for(int i = 0; i < unnameList.size();i++)
      {
        Range unname = unnameList.get(i);
        OrderedJSONObject unnameJSON = unname.storeContentToJSON();
        unnamesJSON.put(unname.rangeId,unnameJSON);
      }
      
      validationsToJSON(unnamesJSON);//Add validations to unnames.
      
      return unnamesJSON;
    }
    
    private OrderedJSONObject validationsToJSON(OrderedJSONObject unnamesJSON){
    	 Iterator<String> iter = validationMap.keySet().iterator();
    	 while(iter.hasNext()){
    	    String name = iter.next();
    	    Validation validation = validationMap.get(name);
    	    validation.storeContentToJSON(this, unnamesJSON);
    	 }
    	return unnamesJSON;
    }
    
    public OrderedJSONObject pnamesToJSON() {
      OrderedJSONObject preserveJSON = new OrderedJSONObject();
      Iterator<String> iter = preserveRangeList.keySet().iterator();
      while(iter.hasNext()){
        String id = iter.next();
        JSONObject range = preserveRangeList.get(id);
        preserveJSON.put(id, range);
      }
      
      return preserveJSON;
    }

    public OrderedJSONObject stylesToJSON() {
      OrderedJSONObject cellStylesJSON = new OrderedJSONObject();
      String fontFamily = null;
      for(int i = 0; i < cellStyleList.size();i++)
      {
        CellStyleType style = cellStyleList.get(i);
        if(fontMap != null){
          fontFamily = this.fontMap.get(style.fontName);
          if(fontFamily != null)
            style.fontName = fontFamily;
        }
        OrderedJSONObject styleJSON = style.storeContentToJSON();
        if(!styleJSON.isEmpty())
          cellStylesJSON.put(style.styleId, styleJSON);
      }
      
      //3 default styles
      //cell default style cellStyleType
      CellStyleType defaultCellStyle = new CellStyleType();
      cellStylesJSON.put(ConversionConstant.DEFAULT_CELL_STYLE, defaultCellStyle.storeContentToJSON(true));
      //row default style : height
      OrderedJSONObject rowStyleJSON = new OrderedJSONObject();
      rowStyleJSON.put(ConversionConstant.HEIGHT, Row.defaultHeight);
      cellStylesJSON.put(ConversionConstant.DEFAULT_ROW_STYLE, rowStyleJSON);
      //column default style : width
      OrderedJSONObject colStyleJSON = new OrderedJSONObject();
      colStyleJSON.put(ConversionConstant.WIDTH, ConversionConstant.DEFAULT_WIDTH_VALUE);
      cellStylesJSON.put(ConversionConstant.DEFAULT_COLUMN_STYLE, colStyleJSON);

      return cellStylesJSON;
    }
    
    public OrderedJSONObject storeContentToJSON(){
      LOG.entering(CLAZZ, "storeContentToJSON");
      OrderedJSONObject documentJSON = new OrderedJSONObject();
      
      documentJSON.put(ConversionConstant.CALCULATED, bCalculated);
      
      OrderedJSONObject namesJSON = namesToJSON();
      if(!namesJSON.isEmpty())
        documentJSON.put(ConversionConstant.NAME_RANGE, namesJSON);
      
      OrderedJSONObject unnamesJSON = unnamesToJSON();
      if(!unnamesJSON.isEmpty())
        documentJSON.put(ConversionConstant.UNNAME_RANGE, unnamesJSON);

      JSONObject preserveJSON = pnamesToJSON();
      if(!preserveJSON.isEmpty())
        documentJSON.put(ConversionConstant.PRESERVE_RANGE, preserveJSON);

      OrderedJSONObject cellStylesJSON = stylesToJSON();
      documentJSON.put(ConversionConstant.STYLES, cellStylesJSON);
      
      OrderedJSONObject sheetsJSON = new OrderedJSONObject();
      for(int i = 0; i < sheetList.size(); i++)
      {
        Sheet sheet = sheetList.get(i);
        OrderedJSONObject sheetJSON = sheet.storeContentToJSON();
        sheetsJSON.put(sheet.sheetId, sheetJSON);
      }
      documentJSON.put(ConversionConstant.SHEETS, sheetsJSON);

      LOG.exiting(CLAZZ, "storeContentToJSON");
      return documentJSON;
    }

    public OrderedJSONObject storeMetaToJSON(){
    	LOG.entering(CLAZZ, "storeMetaToJSON");
      OrderedJSONObject documentJSON = new OrderedJSONObject();     
      documentJSON.put(ConversionConstant.FILE_VERSION_FIELD, DocumentVersion.VERSION_1_0_4.toString());
      if (isDate1904) {
    	  documentJSON.put(ConversionConstant.DATE_1904, true); 
      }
      OrderedJSONObject sheetsJSON = new OrderedJSONObject();
      OrderedJSONObject sheetsArrayJSON = new OrderedJSONObject();

      ArrayList<String> sheetsIdArray = new ArrayList<String>();
      for(int sheetIndex = 0; sheetIndex < sheetList.size(); sheetIndex++)
      {
        Sheet sheet = sheetList.get(sheetIndex);
        OrderedJSONObject sheetJSON = sheet.storeMetaToJSON();
        sheetsJSON.put(sheet.sheetId, sheetJSON);
        sheetsIdArray.add(sheet.sheetId);				
        OrderedJSONObject sheetIDJSON = sheet.getJSONFromSheetArray();
        if(!sheetIDJSON.isEmpty())
          sheetsArrayJSON.put(sheet.sheetId, sheetIDJSON);
      }
      documentJSON.put(ConversionConstant.SHEETS, sheetsJSON);
      if(sheetsIdArray.size() > 0){
        JSONArray sheetsIdArrayJSON = new JSONArray();
        sheetsIdArrayJSON.addAll(sheetsIdArray);
        documentJSON.put(ConversionConstant.SHEETSIDARRAY, sheetsIdArrayJSON);
      }
      OrderedJSONObject uniqueRowsJON = uniqueRows.storeMetaToJSON();
      if(!uniqueRowsJON.isEmpty())
        documentJSON.put(ConversionConstant.ROWS, uniqueRowsJON);
      OrderedJSONObject uniqueColsJON = uniqueColumns.storeMetaToJSON();
      if(!uniqueColsJON.isEmpty())
        documentJSON.put(ConversionConstant.COLUMNS, uniqueColsJON);
      documentJSON.put(ConversionConstant.SHEETSARRAY, sheetsArrayJSON);
      documentJSON.put(ConversionConstant.DEFAULT_COLUMN_WIDTH, defaultColumnWidth);
      LOG.exiting(CLAZZ, "storeMetaToJSON");
      return documentJSON;
    }

    public OrderedJSONObject storeRefToJSON(){
      LOG.entering(CLAZZ, "storeRefToJSON");
      OrderedJSONObject documentJSON = new OrderedJSONObject();
      //documentJSON.put(ConversionConstant.URL,url);
      OrderedJSONObject sheetsJSON = new OrderedJSONObject();
    
      for(int sheetIndex = 0; sheetIndex < sheetList.size(); sheetIndex++)
      {
//        if(SpreadsheetConfig.exceedRefNumLimits(formulaRefCnt))
//          break;
    	String lastrowid = "";
    	OrderedJSONObject lastrow = null;
        Sheet sheet = sheetList.get(sheetIndex);
        OrderedJSONObject sheetJSON = new OrderedJSONObject();
        for(int formulaCellIndex=0; formulaCellIndex<sheet.formulaCellList.size(); formulaCellIndex++){
          Cell cell = sheet.formulaCellList.get(formulaCellIndex);
          JSONArray cellTypeJSONArray = getRefArray((String)cell.value, nameList, sheet);
//          if(SpreadsheetConfig.exceedRefNumLimits(formulaRefCnt))
//            break;
          if(cellTypeJSONArray.size() > 0){
            OrderedJSONObject cellJSON = new OrderedJSONObject();
            cellJSON.put(ConversionConstant.FORMULACELL_REFERNCE_NAME, cellTypeJSONArray);
            if (lastrowid == cell.rowId) {
            	lastrow.put(cell.cellId, cellJSON);
            } else {
            	if (lastrow!=null) {
            		try {
	            		String rowcontent = lastrow.serialize();
	            		JSONObject jsonrow = new JSONObject();
	            		jsonrow.put("rawjson", rowcontent);
	            		sheetJSON.put(lastrowid, jsonrow);
            		} catch (Exception e) {}
            	} 
            	lastrowid = cell.rowId;
            	lastrow = new OrderedJSONObject();
            	lastrow.put(cell.cellId, cellJSON);
            }
          }
        }
    	if (lastrow!=null) {
    		try {
        		String rowcontent = lastrow.serialize();
        		JSONObject jsonrow = new JSONObject();
        		jsonrow.put("rawjson", rowcontent);
        		sheetJSON.put(lastrowid, jsonrow);
    		} catch (Exception e) {}
    	} 
        if(!sheetJSON.isEmpty())
          sheetsJSON.put(sheet.sheetId, sheetJSON);
      }
      documentJSON.put(ConversionConstant.SHEETS, sheetsJSON);
      LOG.exiting(CLAZZ, "storeRefToJSON");
      return documentJSON;
    }
    
    public JSONArray getRefArray(String formula, List<Range> rangeNameList, Sheet curSheet)
    {
      ArrayList<FormulaToken> tokenList = getTokenFromFormula(formula, rangeNameList);
      JSONArray cellTypeJSONArray = new JSONArray();
      for (int i = 0; i < tokenList.size(); i++)
      {
        FormulaToken token = tokenList.get(i);
        OrderedJSONObject typeJSON = new OrderedJSONObject();
        String type = token.mType.toString();
        typeJSON.put(ConversionConstant.REFERENCE_TYPE, type);

        typeJSON.put(ConversionConstant.FORMULA_TOKEN_INDEX, token.getIndex());
        if (type.equals(ConversionConstant.CELL_REFERENCE))
        {
          Range range = new Range();
          range.address = token.getText();
          setCellRangeByToken(range, token.getRef(), this, curSheet);
          if(!ConversionUtil.hasValue(range.sheetId))
        	continue;
          typeJSON.put(ConversionConstant.SHEETID, range.sheetId);
          typeJSON.put(ConversionConstant.ROWID_NAME, range.startRowId);
          typeJSON.put(ConversionConstant.COLUMNID_NAME, range.startColId);
          typeJSON.put(ConversionConstant.RANGE_ADDRESS, token.getText());
        }
        else if (type.equals(ConversionConstant.RANGE_REFERENCE))
        {
          Range range = new Range();
          range.address = token.getText();
          setCellRangeByToken(range, token.getRef(), this, curSheet);
          if(!ConversionUtil.hasValue(range.sheetId))
        	continue;
          typeJSON.put(ConversionConstant.SHEETID, range.sheetId);
          typeJSON.put(ConversionConstant.RANGE_STARTROWID, range.startRowId);
          typeJSON.put(ConversionConstant.RANGE_STARTCOLID, range.startColId);
          typeJSON.put(ConversionConstant.RANGE_ENDROWID, range.endRowId);
          typeJSON.put(ConversionConstant.RANGE_ENDCOLID, range.endColId);
          typeJSON.put(ConversionConstant.RANGE_ADDRESS, token.getText());
        }
        else if (type.equals(ConversionConstant.NAMES_REFERENCE))
        {
          typeJSON.put(ConversionConstant.NAME_RANGE, token.mText);
        }
        else if(type.equals(ConversionConstant.VIRTUAL_REFERENCE))
        {
      	  typeJSON.put(ConversionConstant.LEFTTOKENINDEX, token.getLIndex());
      	  typeJSON.put(ConversionConstant.RIGHTTOKENINDEX, token.getRIndex());
        }
        if (!typeJSON.isEmpty())
        {
          cellTypeJSONArray.add(typeJSON);
//          formulaRefCnt++;
        }
        
//        if(SpreadsheetConfig.exceedRefNumLimits(formulaRefCnt))
//          break;
      }
      return cellTypeJSONArray;
    }

    public void getObjectFromJSON() throws IOException{
      LOG.entering(CLAZZ, "getObjectFromJSON");	
      if( (docContentJSON != null) && (docMetaJSON != null)) {
        JSONObject sheetsMetaJSON = new JSONObject();
        JSONArray sheetsIdArrayJSON = new JSONArray();
        JSONObject sheetsArrayJSON = new JSONObject();
        JSONObject sheetsContentJSON = new JSONObject();
        JSONObject stylesJSON = new JSONObject();
        JSONObject rowsMetaJSON = new JSONObject();
        JSONObject columnsMetaJSON = new JSONObject();
        if(docMetaJSON.containsKey(ConversionConstant.FILE_VERSION_FIELD))
        {
          String v = (String)docMetaJSON.get(ConversionConstant.FILE_VERSION_FIELD);
          version = DocumentVersion.parseVersionString(v);
        }
        if(docContentJSON.containsKey(ConversionConstant.URL))
          this.url =  docContentJSON.get(ConversionConstant.URL).toString();
        if(docMetaJSON.containsKey(ConversionConstant.SHEETS))
          sheetsMetaJSON = (JSONObject) docMetaJSON.get(ConversionConstant.SHEETS);
        if(docMetaJSON.containsKey(ConversionConstant.SHEETSIDARRAY))
          sheetsIdArrayJSON = (JSONArray) docMetaJSON.get(ConversionConstant.SHEETSIDARRAY);
        if(docMetaJSON.containsKey(ConversionConstant.SHEETSARRAY))
          sheetsArrayJSON = (JSONObject) docMetaJSON.get(ConversionConstant.SHEETSARRAY);
        if(docContentJSON.containsKey(ConversionConstant.SHEETS))
          sheetsContentJSON = (JSONObject) docContentJSON.get(ConversionConstant.SHEETS);
        if(docMetaJSON.containsKey(ConversionConstant.ROWS))
          rowsMetaJSON = (JSONObject) docMetaJSON.get(ConversionConstant.ROWS);
        if(docMetaJSON.containsKey(ConversionConstant.COLUMNS))
          columnsMetaJSON = (JSONObject) docMetaJSON.get(ConversionConstant.COLUMNS);
        //construct NAME RANGE
        JSONObject namesJSON = null;
        if(docContentJSON.containsKey(ConversionConstant.NAME_RANGE)){
          namesJSON = (JSONObject) docContentJSON.get(ConversionConstant.NAME_RANGE);
          Iterator<String> nameIter = namesJSON.keySet().iterator();
          while(nameIter.hasNext()){
            Range name = new Range();
            name.rangeId = nameIter.next();
            JSONObject nameJSON = (JSONObject) namesJSON.get(name.rangeId);
            name.rangeContentJSON = nameJSON;
            name.getObjectFromJSON();
            this.nameList.add(name);
          }
        }
      //construct UNNAME RANGE
        JSONObject unnamesJSON = null;
        if(docContentJSON.containsKey(ConversionConstant.UNNAME_RANGE)){
          unnamesJSON = (JSONObject) docContentJSON.get(ConversionConstant.UNNAME_RANGE);
          Iterator<String> unnameIter = unnamesJSON.keySet().iterator();
          int dvNum = 0;
          while(unnameIter.hasNext()){
            String rId = unnameIter.next();
            JSONObject unnameJSON = (JSONObject) unnamesJSON.get(rId);
            Range unname = null;
            boolean bValidation = false;
            if(unnameJSON.containsKey(ConversionConstant.DATAFILED))
            {
              String sType = (String) unnameJSON.get(ConversionConstant.RANGE_USAGE);
              RangeType type = RangeType.enumValueOf(sType);
              switch(type)
              {
                case IMAGE:
                case CHART_AS_IMAGE:
                case CHART:
                {
                  unname = new DrawFrameRange();
                  break;
                }
                case VALIDATION:
                	if (dvNum > MAX_NUM_VALIDATION)
                		continue;
                	bValidation = true;
                	dvNum++;
                default:
                {
                  unname = new UnNameRange();
                  break;
                }
              }
                
            }
            else
              unname = new Range();
            unname.rangeId = rId;
            unname.rangeContentJSON = unnameJSON;
            unname.getObjectFromJSON();
            this.unnameList.add(unname);
            
            if(bValidation == true)
            	this.validationTransMgr.addValidation((UnNameRange)unname);
          }
          if (dvNum > MAX_NUM_VALIDATION) {
        	LOG.log(Level.WARNING, "The draft contains too many data validations.");
          }
          this.validationTransMgr.updateBaseRefs();
        }
        //construct cell style list
        if(docContentJSON.containsKey(ConversionConstant.STYLES)){
          stylesJSON = (JSONObject) docContentJSON.get(ConversionConstant.STYLES);
          //default cell style
          CellStyleType defaultCellStyle = new CellStyleType();
          defaultCellStyle.styleId = ConversionConstant.DEFAULT_CELL_STYLE;
          JSONObject stytleContentJSON = (JSONObject) stylesJSON.get(ConversionConstant.DEFAULT_CELL_STYLE);
          if(stytleContentJSON != null && stytleContentJSON.containsKey(ConversionConstant.STYLE_HIDDEN))
        	  this.exportProtection = true;
          defaultCellStyle.stytleContentJSON = stytleContentJSON;
          defaultCellStyle.getObjectFromJSON(version);
          this.cellStyleList.add(defaultCellStyle);
          //default row style
          if(stylesJSON.containsKey(ConversionConstant.DEFAULT_ROW_STYLE)){
            JSONObject defaultRowStyleJSON = (JSONObject) stylesJSON.get(ConversionConstant.DEFAULT_ROW_STYLE);
            Row.defaultHeight = Integer.parseInt(defaultRowStyleJSON.get(ConversionConstant.HEIGHT).toString());
          }
          //default column style
          if(stylesJSON.containsKey(ConversionConstant.DEFAULT_COLUMN_STYLE)){
            JSONObject defaultColumnStyleJSON = (JSONObject) stylesJSON.get(ConversionConstant.DEFAULT_COLUMN_STYLE);
            Column.defaultWidth = Integer.parseInt(defaultColumnStyleJSON.get(ConversionConstant.WIDTH).toString());
          }
//          if(stylesJSON.size() > 3){
            Iterator<String> stylesIt = stylesJSON.keySet().iterator();
            while(stylesIt.hasNext()){
              String styleName = stylesIt.next();
              if(!styleName.equals(ConversionConstant.DEFAULT_CELL_STYLE)
                  && !styleName.equals(ConversionConstant.DEFAULT_ROW_STYLE)
                  && !styleName.equals(ConversionConstant.DEFAULT_COLUMN_STYLE))
              {
                CellStyleType cellStyleType = new CellStyleType();
                cellStyleType.styleId = styleName;
                cellStyleType.stytleContentJSON = (JSONObject) stylesJSON.get(styleName);
                cellStyleType.getObjectFromJSON(version);
                this.cellStyleList.add(cellStyleType);
              }
            }
//          }
        }

        //construct sheet for content
        for(int sheetIndex = 0; sheetIndex < sheetsIdArrayJSON.size(); sheetIndex ++){
          String sheetId = sheetsIdArrayJSON.get(sheetIndex).toString();
          Sheet sheet = new Sheet();
          sheet.sheetId = sheetId;
          if(sheetsMetaJSON.containsKey(sheetId))
            sheet.sheetMetaJSON = (JSONObject) sheetsMetaJSON.get(sheetId);
          if(sheetsContentJSON.containsKey(sheetId))
            sheet.sheetContentJSON = (JSONObject) sheetsContentJSON.get(sheetId);
          
          if(sheet.sheetMetaJSON != null){
  	        if(sheet.sheetMetaJSON.containsKey(ConversionConstant.PROTECTION_PROTECTED)){
  	          boolean protectionProtected = (Boolean) sheet.sheetMetaJSON.get(ConversionConstant.PROTECTION_PROTECTED);
  	          if(protectionProtected)
  	            sheet.protectionProtected =  protectionProtected;  	          
  	        }
            if(sheet.sheetMetaJSON.containsKey(ConversionConstant.OFF_GRIDLINES))
              sheet.showGridLines = !((Boolean) sheet.sheetMetaJSON.get(ConversionConstant.OFF_GRIDLINES));
          }

          if(sheetsArrayJSON.containsKey(sheetId)){

            JSONObject sheetArrayJSON = (JSONObject) sheetsArrayJSON.get(sheetId);

            JSONArray rowsIdArrayJSON = null;
            JSONArray columnsIdArrayJSON = null;
            //TODO: JSONArray construct error!!!
            if(sheetArrayJSON.containsKey(ConversionConstant.ROWSIDARRAY)){
              rowsIdArrayJSON = (JSONArray) sheetArrayJSON.get(ConversionConstant.ROWSIDARRAY); 
              sheet.rowIdArray = getIdsFromJSONArray(rowsIdArrayJSON);
            }
            if(sheetArrayJSON.containsKey(ConversionConstant.COLUMNSIDARRAY)){
              columnsIdArrayJSON = (JSONArray) sheetArrayJSON.get(ConversionConstant.COLUMNSIDARRAY);  
              sheet.columnIdArray = getIdsFromJSONArray(columnsIdArrayJSON);
            }
          }
          sheet.isODFFormula = this.isODFFormula;
          sheet.getObjectFromJSON();
          //construct Rows/Columns
          updateRowMeta(sheet, rowsMetaJSON);
          updateColumnMeta(sheet, columnsMetaJSON);
          this.sheetList.add(sheet);
        }
        this.validationTransMgr.mergeWithRows();
        this.uniqueColumns.columnsMetaJSON = columnsMetaJSON;
        this.uniqueColumns.getObjectFromJSON();
      }
      // release content json to save memory usage
      this.docContentJSON = null;
      this.docMetaJSON = null;
      
      LOG.exiting(CLAZZ, "getObjectFromJSON");
    }
    
    public JSONType getType(){
      return JSONType.DOCUMENT;
    }
    
//    public int getFormulaCount()
//    {
//      return formulaCnt;
//    }
//    
//    public int getCellCount()
//    {
//      return cellCnt;
//    }
    
    private void updateColumnMeta(Sheet sheet,JSONObject columnsMetaJSON) {
      if(columnsMetaJSON != null){
        for(int i=0;i<sheet.columnIdArray.size();i++){
          String columnId = sheet.columnIdArray.get(i);
          String sheetId = sheet.sheetId;
          if(!columnId.equals("")){
            JSONObject perSheetColMeta = (JSONObject)columnsMetaJSON.get(sheetId);
            if(null != perSheetColMeta)
            {
              JSONObject colMeta = (JSONObject)perSheetColMeta.get(columnId);
              if(null != colMeta)
              {
                Column column = new Column();
                column.sheetId = sheetId;
                column.columnIndex = i;
                column.columnId = columnId;
                column.columnMetaJSON = colMeta;
                column.getObjectFromJSON();
                this.uniqueColumns.uniqueColumnList.add(column);
                sheet.columnList.add(column);
              }
            }
          }
        }
      }
    }

    //update the row meta info in sheet.rowList
    //and construct Rows
    private void updateRowMeta(Sheet sheet, JSONObject rowsMetaJSON){
      if(rowsMetaJSON != null){
        //update sheet.rowList
        for(int i=0; i<sheet.rowList.size();i++){
          Row row = sheet.rowList.get(i);
          String rowId = row.rowId;
          String sheetId = sheet.sheetId;
          JSONObject perSheetRowMeta = (JSONObject) rowsMetaJSON.get(sheetId);
          if(null != perSheetRowMeta)
          {
            JSONObject rowMetaJSON = (JSONObject)perSheetRowMeta.get(rowId);
            if(null != rowMetaJSON)
            {
              row.rowMetaJSON = rowMetaJSON;
              row.getObjectFromJSON(sheet);
              this.uniqueRows.uniqueRowList.add(row);
            }
          }
        }
      }
    }


    private  List<String> getIdsFromJSONArray(JSONArray idArrayJSON){
      List<String> idsArray = new ArrayList<String>();
      if(idArrayJSON != null) {
        for(int i = 0; i < idArrayJSON.size(); i++){
          String id = idArrayJSON.get(i).toString();
          if(id.startsWith(ConversionConstant.ROWID))
          {
        	  int index = Integer.parseInt(id.substring(2));
        	  if(index > this.maxRowId)
        		  this.maxRowId = index;
          }
          else if(id.startsWith(ConversionConstant.COLUMNID))
          {
        	  int index = Integer.parseInt(id.substring(2));
        	  if(index > this.maxColumnId)
        		  this.maxColumnId = index;
          }
          idsArray.add(id);
        } 
        this.maxRowId++;
        this.maxColumnId++;
      }
      return idsArray;
    }

    public CellStyleType getCellStyleFromStyleId(String cellStyleId){
      if(hasValue(cellStyleId)){
        for(int i = 0; i < cellStyleList.size(); i++){
          CellStyleType cellStyle = cellStyleList.get(i);
          if(cellStyleId.equals(cellStyle.styleId)){
            return cellStyle;
          }
        }
      }
      return null;
    }

    public Sheet getSheetByName(String sheetName)
    {
    	if(hasValue(sheetName)){
            for(int i = 0; i < sheetList.size(); i++){
              Sheet sheet = sheetList.get(i);
              if(sheetName.equals(sheet.sheetName))
                return sheet;
            }
          }
         return null;
    }
    
    public Sheet getSheetById(String sheetId){
      if(hasValue(sheetId)){
        for(int i = 0; i < sheetList.size(); i++){
          Sheet sheet = sheetList.get(i);
          if(sheetId.equals(sheet.sheetId))
            return sheet;
        }
      }
      return null;
    }

    private void putToJSONObject(JSONObject obj, String key, Object value)
    {
      if (!obj.containsKey(key))
      {
        obj.put(key, value);
      }
    }
    public Object storeCommentsToJSON(String author, Date createtime)
    {
      for (int i = 0 ; i < docCommentsJSON.size(); i++)
      {
        JSONObject comments = (JSONObject) docCommentsJSON.get(i);
        JSONArray items = (JSONArray) comments.get("items");
        if (items!=null)
        {
          for (int j = 0 ; j < items.size(); j++)
          {
            JSONObject item = (JSONObject) items.get(j);
            putToJSONObject(item, "type" , "comments");
            if (!item.containsKey("resolved"))
            {
              putToJSONObject(item, "resolved" , false);
              putToJSONObject(item, "org_resolved" , false);
            }
            putToJSONObject(item, "name" , author);
            putToJSONObject(item, "time" , createtime.getTime());
            putToJSONObject(item, "uid" , "comments_odf_0");
          }
        }
      }
      return docCommentsJSON;
    }
  }
  
  public static class PageSetting {
    public static String d_width = "21cm";
    public static String d_height = "29.7cm";
    public static String d_oritation = "portrait";
    public static String d_margin = "2cm";
    public static String d_pageOrder = "ttb";//another possible value is ltr
    public String width;
    public String height;
    public String oritation;
    public String marginLeft;
    public String marginRight;
    public String marginTop;
    public String marginBottom;
    public String pageOrder;
    public Boolean hasACL;
    public Boolean hasMacro;
    
    public JSONObject toJSON()
    {
      JSONObject psObj = new JSONObject();
      if(width == null)
        width = d_width;
      else
        width = toCM(width);
      psObj.put("pageWidth", width);
      if(height == null)
        height = d_height;
      else
        height = toCM(height);
      psObj.put("pageHeight", height);
      if(oritation == null)
        oritation = d_oritation;
      psObj.put("orientation", oritation);
      if(marginLeft == null)
        marginLeft = d_margin;
      else
        marginLeft = toCM(marginLeft);
      psObj.put("marginLeft", marginLeft);
      if(marginRight == null)
        marginRight = d_margin;
      else
        marginRight = toCM(marginRight);
      psObj.put("marginRight", marginRight);
      if(marginTop == null)
        marginTop = d_margin;
      else
        marginTop = toCM(marginTop);
      psObj.put("marginTop", marginTop);
      if(marginBottom == null)
        marginBottom = d_margin;
      else
        marginBottom = toCM(marginBottom);
      psObj.put("marginBottom", marginBottom);
      if(pageOrder == null)
        pageOrder = d_pageOrder;
      psObj.put("pageOrder", pageOrder);
      if (hasACL != null && hasACL == true) 
      {
        psObj.put("hasACL", hasACL);
      }
      if (hasMacro) {
    	  psObj.put("hasMacro", hasMacro);
      }
      return psObj;
    }
    
    private String toCM(String value)
    {
      return String.valueOf(Length.parseDouble(value, Unit.CENTIMETER)) + Unit.CENTIMETER.abbr();
    }
  }
  /*
   * number format representation
   */
  public static class NumberFormat {
	  private String category;
	  private String code;
	  private String currency;
	  private String fmFontColor;
	  
	  public NumberFormat (String category, String code, String currency, String fmFontColor) {
		  this.category = category != null ? category : "";
		  this.code = code;
		  this.currency = currency != null ? currency : "";
		  this.fmFontColor = fmFontColor != null ? fmFontColor : "";
	  }
	  
	  public String getCategory ()
	  {
		  return this.category;
	  }
	  
	  public String getCode ()
	  {
		  return this.code;
	  }
	  
	  public String getCurrency ()
	  {
		  return this.currency;
	  }
	  
	  public String getFmFontColor() {
		return fmFontColor;
	  }

	public void setFmFontColor(String fmFontColor) {
		this.fmFontColor = fmFontColor;
	}

	public String toString()
	  {
	    StringBuffer buf = new StringBuffer();
	    if(ConversionUtil.hasValue(this.code))
	      buf.append(this.code);
	    if(ConversionUtil.hasValue(this.fmFontColor))
		      buf.append(this.fmFontColor);
	    if(ConversionUtil.hasValue(this.category))
	      buf.append(this.category);
	    if(ConversionUtil.hasValue(this.currency))
	      buf.append(this.currency);
	    return buf.toString();
	  }
  }
  
  public static class StyleMap {
    private String op;
    private String value;
    private String mapStyle;
    
    public StyleMap (String op, String value, String mapStyle){
      this.op = op;
      this.value = value;
      this.mapStyle = mapStyle;
    }
    
    public String getOperator(){
      return this.op;
    }
    
    public String getValue(){
      return this.value;
    }
    
    public String getMapStyle(){
      return this.mapStyle;
    }
  }
  
  /**
   * token which contains in formula
   *
   */
  public static class FormulaToken{
    public enum TokenType{
      CELL(ConversionConstant.CELL_REFERENCE),
      RANGE(ConversionConstant.RANGE_REFERENCE),
      NAME(ConversionConstant.NAMES_REFERENCE),
      VREF(ConversionConstant.VIRTUAL_REFERENCE);
      
      private String mValue;
      TokenType(String value){
        mValue = value;
      }
      
      public String toString(){
        return mValue;
      }
      
      public static TokenType enumOf(String value){
        for(TokenType iter:values()){
          if(iter.toString().equals(value)){
            return iter;
          }
        }
        return null;
      }
    }
    String mText;
    String mChangeText;
    int mIndex;
    TokenType mType;
    ReferenceParser.ParsedRef mRef;
    int lIndex;
    int rIndex;
    public void setText(String text){
      mText = text;
      mChangeText = text;
    }
    public void setOnlyText(String text){
      mText = text;
    }
    public String getText(){
      return mText;
    }
    
    public void setChangeText(String text){
      mChangeText = text;
    }
    public String getChangeText(){
      return mChangeText;
    }
    
    public void setIndex(int index){
      mIndex = index;
    }
    public int getIndex(){
      return mIndex;
    }
    
    public void setLIndex(int index){
        lIndex = index;
    }
    public int getLIndex(){
    	return lIndex;
    }
    public void setRIndex(int index){
      rIndex = index;
    }
    public int getRIndex(){
      return rIndex;
    }
    
    public void setType(TokenType type){
      mType = type;
    }
    public TokenType getType(){
      return mType;
    }
    
    public void setRef(ReferenceParser.ParsedRef ref){
        mRef = ref;
      }
      public ReferenceParser.ParsedRef getRef(){
        return mRef;
      }
    
  }
  
  //return the column index(0-based)from cell address
//  public static int getColIndexFromCellAddress(String cellAddress) {
//    String[] returnArray = splitCellAddress(cellAddress);
//    if((returnArray == null) || returnArray.length < 1 || returnArray[1] == null)
//      return -1;
//    String colNum = returnArray[1];
//    int colIndex = 0;
//    for (int i = 0; i < colNum.length(); i++) {
//      colIndex = 26 * colIndex;
//      colIndex += (Character.toUpperCase(colNum.charAt(i)) - 'A') + 1;
//    }
//
//    return (colIndex - 1);
//  }
//
////return the row index(0-based)from cell address
//  public static int getRowIndexFromCellAddress(String cellAddress) {
//    String[] returnArray = splitCellAddress(cellAddress);
//    if((returnArray == null) || returnArray.length < 2 || returnArray[2] == null)
//      return -1;
//    try{
//      return Integer.parseInt(returnArray[2]) - 1;
//    }catch(NumberFormatException e){
//      return -1;
//    }
//  }
//
//  public static String getTableNameFromCellAddress(String cellAddress) {
//    String[] returnArray = splitCellAddress(cellAddress);
//    //the sheet Name might be contain blank, which need "'"
//    if(returnArray[0].startsWith("'") && returnArray[0].endsWith("'"))
//    	returnArray[0] = returnArray[0].substring(1, returnArray[0].length() - 1);
//    return returnArray[0];
//  }
//
//  //return celladdress with sheet name if the sheetName is not empty 
//  public static String getAbsoluteCellAddress(int colIndex, int rowIndex, String sheetName) {
//    return getCellAddress(colIndex, rowIndex, sheetName, true, true, true);
//  }
  
  /*
   * next five method is to prioritize the formula operator
   * is copied from the edit part 
   */
  public static String prioritize(String formula){
        try{
            //ConversionUtil._cellHasUnicode = false;
            java.io.ByteArrayInputStream strInput = new java.io.ByteArrayInputStream(formula.getBytes("utf-8"));
            FormulaLexer lexer = new FormulaLexer(new ANTLRInputStream(strInput, "utf-8"));
            CommonTokenStream tokens = new CommonTokenStream(lexer);
            //tokens.getTokens(); // trigger
            //if(ConversionUtil._cellHasUnicode)
            //  ConversionUtil.normalizeTokens(tokens);
            String fv=prioritize(tokens.getTokens());
             if(!formula.equals(fv))
                formula=fv;;
           }catch(Exception e)
           {
               e.printStackTrace();
           }finally{
               return formula;
           }
   }

      /*
       * Get the priority level of the token with specified token type 'type'
       * @return      the priority level
       */
      private static int getPriorityLevel( int type ) {
          int level = 0;
          switch (type) {
              case FormulaLexer.WHITESPACE: // for case: =1> =2,=1*  -2,etc,we should ignore any spaces.
                  level = -1;
                  break;
              case FormulaLexer.LESS: // "<"
              case FormulaLexer.GREATER: // ">"
              case FormulaLexer.LESSEQUAL: // "<="
              case FormulaLexer.GREATEREQUAL: // ">="
                  level = 10;
                  break;
              case FormulaLexer.MODEQUAL: // "%="
              case FormulaLexer.MULTEEQUAL: // "*="
              case FormulaLexer.DIVEQUAL: // "/="
              case FormulaLexer.PLUSEQUAL: // "+="
              case FormulaLexer.MINUSEQUAL: // "-="
                  level = 20;
                  break;
              case FormulaLexer.NOTEQUAL: // "!="
              case FormulaLexer.NOTEQUAL2: // "<>"
              case FormulaLexer.EQUAL:// "="
                  level = 30;
                  break;
              case FormulaLexer.AND: // "&"
                  level = 38;
                  break;
              case FormulaLexer.PLUS: // "+"
              case FormulaLexer.MINUS: // "-"
                  level = 40;
                  break;
              case FormulaLexer.MULT: // "*"
              case FormulaLexer.DIV: // "/"
                  level = 50;
                  break;
              case FormulaLexer.POW: // "^"
                  level = 55;
                  break;
              case FormulaLexer.MODE: // "%"
                  level = 60;
                  break;
              case FormulaLexer.CONCATENATION: // "~"
                  level = 65;
                  break;
              case FormulaLexer.INTERSECT: // "!"
                  level = 70;
                  break;
  //          case FormulaLexer.RANGE_FUNC: // function token will be ignored
  //              level = 99;
  //              break;
              case FormulaLexer.P_OPEN: // "("
              case FormulaLexer.ARRAY_FORMULAR_START:
                  level = 100;
                  break;
              case FormulaLexer.P_CLOSE: // ")"
              case FormulaLexer.ARRAY_FORMULAR_END:
                  level = 101;
                  break;
              case FormulaLexer.ARG_SEP: // "," FIXME
              case FormulaLexer.ARG_SEP_WRONG:
                  level = 102;
                  break;
              default:
                  break;
          };
          
          return level;
      }

  static class LevelToken{
        public LevelToken(int level,String text){
          this.level=level;
          this.text=text;
        }
        public String text;
        public int level;
        public int endIndex=-1;
        public int startIndex=-1;
        public boolean wrongPriority=false;
        public boolean func=false;
      }

      /*
       * Get the new formula string with correct priority setting
       * @return      the new formula string
       */
      /*string*/private static String getFormulaString(List<LevelToken> list) {
          LevelToken temp=new LevelToken(0,""); // in case ")" should be append to the last token text
          list.add(temp);
          
          int length = list.size();
          for (int i = 0; i < length; ++i) {
            LevelToken o = list.get(i);
            if (o.wrongPriority) {
                if(o.startIndex==0)
                  list.get(o.startIndex).text = "(" +list.get(o.startIndex).text;
                else
                  list.get(o.startIndex).text += "(";
                list.get(o.endIndex).text = ")" + list.get(o.endIndex).text;
            }
          }
        
      
          String formula = "="; // formula string always starts with "="
          for (int i = 0; i < length; ++i)
              if (list.get(i).text != null)
                  formula += list.get(i).text;
              else 
                return null;  // sth wrong exists???
          
          return formula;
      }

  /*
   * Traverse the given token list, check whether there has any operator token that has wrong priority
   * and determine its startindex and endindex.
   * @param   list            the array of items that has 'level', 'text' and 'func'
   * @param   index           the start index of the 'list' array from which doPriority is executed
   * @param   bRecursive      true if it is one recursive function call
   */
  private static int doPriority(List<LevelToken> list,int index,boolean bRecursive){
    int length=list.size();
    int prevIndex=index;
    int currentLevel=-1;
    LevelToken item=null;
    Stack<LevelToken> itemStack = new Stack<LevelToken>();
    if (bRecursive) {       // skip the "(" token at recursive call
      if (list.get(index).level == 100) index++;
    }
    //boolean bFirstOperand = false; // the first operand isn't found yet
    while(index<length){
      LevelToken o=list.get(index);
      int level=o.level;
      // ignore all operators that don't follow any operand and
      // ignore the level 0 or -1 token
      //if (level <= 0 || !bFirstOperand) { // level 0 or -1 should be ignored
      //    if (level == 0 && !bFirstOperand) 
      //        bFirstOperand = true; // the first operand is found
      if(level <= 0){
          index++;
          continue;
      }
      // find the matched "}" token and exit at recursive call 
      if (bRecursive) {
        if (level == 101) { // the matched "P_CLOSE" token is found, exit the while loop
          
          if (itemStack.size()>0 && (itemStack.peek().endIndex==-1)){
            item = itemStack.pop();
            item.endIndex = index;
          }
          index++;        // skip the matched token
          break;
      } else if (level == 102) {  // it is the argument separator ","
          // to process the end of formula string
          while(!itemStack.isEmpty()){ 
            item = itemStack.pop();
            item.endIndex = index;
          }
          currentLevel=-1;
          prevIndex = index;
          index++;        // skip the matched token
          continue;
        }
      }
      if (currentLevel == -1 || level > currentLevel) {
        if (level > 100) {
          LOG.log(Level.INFO,"wrong formula syntax");
        }else if (level == 100) { // "("
            if (currentLevel == -1) currentLevel = level;
            prevIndex = index;
            index = doPriority(list, index, true);
            continue;
        }
        else if (currentLevel != -1) {
            // check whether the previous token is function token, if yes,
            // get the index of low level operator prior to the function token
            // for example: 1+SUM(2)*3
            if (prevIndex > 1 && list.get(prevIndex-1).func){
              prevIndex -= 2;
              o.startIndex = prevIndex;
            }else{
              prevIndex--;
              while(prevIndex>=0){ // find the previous avaliable operator in the case : =1+---1^2
                LevelToken tmp = list.get(prevIndex);
                if(tmp.level == 0 || tmp.level == 100 || tmp.level == 101 || tmp.level == 102){
                    break;
                }
                prevIndex--;
              }
              o.startIndex = ++prevIndex;
            }
            o.wrongPriority = true;
  
            itemStack.push(o);
            // shoule go to the next avaliable operator for the case: =-1*----3
            int next_index=index + 1;
            while(o.level!=60 && next_index < length){
                LevelToken tmp = list.get(next_index);
                if(tmp.level == 0 || tmp.level == 100 || tmp.level == 101 || tmp.level == 102){
                    index=next_index - 1;
                    break;
                }
                next_index++;
            }
        }
      } else if (!itemStack.isEmpty()) {
        // when process one operator we should check current index weather we should set the stored operator's right bracket in the case :1+2*2^3*4+3
        while(!itemStack.isEmpty()){
          item = itemStack.peek();
          LevelToken previousItem = list.get(item.startIndex);
            if(item.level > level && level <= previousItem.level){
              item.endIndex = index;
              itemStack.pop();    
            }else{
                // shoule go to the next avaliable operator for the case: =-1*----3
                int next_index=index + 1;
                while(item.level!=60 && next_index < length){
                    LevelToken tmp = list.get(next_index);
                    if(tmp.level == 0 || tmp.level == 100 || tmp.level == 101 || tmp.level == 102){
                        index=next_index - 1;
                        break;
                    }
                    next_index++;
                }
                break;
            }
        }
      }
      
      currentLevel = level;
      prevIndex = index;
      index++;
    }
  
    // to process the end of formula string
    while(!itemStack.isEmpty()){ 
      item = itemStack.pop();
      item.endIndex = index;
    }
    return index;
  }

      /*
       * set correct priority for the operator token
       * return the new formula string
       */
      private static String prioritize(List<Token> tokenList){
         List<LevelToken> levelList=new ArrayList<LevelToken>(10);
         int length=tokenList.size();
         String firstChar = tokenList.get(0).getText();
         int i = 1; // the first token is "=" or "{=", ignore it
         if(firstChar.equals("{"))
              i = 2;
         for (; i < length; ++i){
           Token token=tokenList.get(i);
           int type=token.getType();
           LevelToken lt=new LevelToken(getPriorityLevel(type),token.getText());
           // for case =2+3*SUM+3
           if(type==FormulaLexer.NAME){
          	int next = i+1;
  			if(next < length){
  				while(next < length && tokenList.get(next).getType() == FormulaLexer.WHITESPACE){
  					next++;
  				}
  				if(next < length && tokenList.get(next).getType() == FormulaLexer.P_OPEN)
  					lt.func = true;
  			}	
           }
           levelList.add(lt);
         }
         doPriority(levelList,0,false);
         
         return firstChar.equals("{")?("{"+getFormulaString(levelList)):getFormulaString(levelList);
      }

  /**
   * return the cell address by the column index, row index and sheet Name
   * if part of the cell address is absolute address, '$' should be as prefix.
   * if colIndex or rowIndex < 0, then the address for column or row will be turned to "#REF!"
   * if sheetName is null, the address for sheet is also "#REF!"
   * @param colIndex 0-based
   * @param rowIndex 0-based
   * @param sheetName
   * @param bColAbsolute
   * @param bRowAbsolute
   * @param bSheetAboslute
   * @return
   */
//  public static String getCellAddress(int colIndex, int rowIndex, String sheetName,
//      boolean bColAbsolute, boolean bRowAbsolute, boolean bSheetAboslute){
//    int remainder = 0;
//    int multiple = colIndex;
//    StringBuffer buffer = new StringBuffer();
//    if(colIndex < 0){
//    	buffer.append(ConversionConstant.INVALID_REF);
//    }else if(colIndex == 0){
//    	buffer.append("A");
//    }else{
//      while (multiple != 0) {
//        multiple = colIndex / 26;
//        remainder = colIndex % 26;
//        char c;
//        if (multiple == 0) {
//          c = (char) ('A' + remainder);
//        } else {
//          c = (char) ('A' + multiple - 1);
//        }
//        buffer.append(c);
//        colIndex = remainder;
//      }
//    }
//    String colAddress = buffer.toString();
//    String rowAddress = "";
//    if(rowIndex < 0)
//      rowAddress = ConversionConstant.INVALID_REF;
//    else
//      rowAddress = String.valueOf(rowIndex + 1);
//    String cellRange = (bColAbsolute?"$":"") + colAddress + (bRowAbsolute?"$":"") + rowAddress;
//    if(hasValue(sheetName)){
//      if(sheetName.contains(" ") || sheetName.contains("-"))
//    	  sheetName = "'" + sheetName + "'";
//      cellRange = (bSheetAboslute?"$":"") + ((sheetName==null)?ConversionConstant.INVALID_REF:sheetName) + "." + cellRange;
//    }
//    return cellRange;
//  }
//
//  //return array of string contain 3 member
//  //1. sheet table name, if empty, it is the current sheet name
//  //2. alphabetic represent the column 
//  //3. string represent the row number
//  static String[] splitCellAddress(String cellAddress) {
//
//    String[] returnArray = new String[3];
////    if(CellAddress.isValid(cellAddress))
//    {
//      //separate column and row from cell range
//      StringTokenizer stDot = new StringTokenizer(cellAddress, ".");
//      //get sheet table name and the cell address
//      String cell = "";
//      if (stDot.countTokens() >= 2) {
//        StringTokenizer stDollar = new StringTokenizer(stDot.nextToken(), "$");
//        returnArray[0] = stDollar.nextToken();
//        cell = stDot.nextToken();
//      } else {
//        returnArray[0] = "";
//        cell = stDot.nextToken();
//      }
//
//      //get the column/row number from the cell address
//      StringTokenizer stDollar = new StringTokenizer(cell, "$");
//      if (stDollar.countTokens() >= 2) {
//        returnArray[1] = stDollar.nextToken();
//        returnArray[2] = stDollar.nextToken();
//      } else {
//        cell = stDollar.nextToken();
//        for (int i = 0; i < cell.length(); i++) {
//          if (!Character.isLetter(cell.charAt(i))) {
//            returnArray[1] = cell.substring(0, i);
//            returnArray[2] = cell.substring(i);
//            break;
//          }
//        }
//      }
//    }
//    return returnArray;
//
//  }
//
//  /**
//   * Split the cell address to three part that is sheet,column and row
//   * and get if these part are absolute address or relative address
//   * (check if each part has '$' as prefix)
//   * @param cellAddress single cell address, rather than the range address
//   * @param addressList the list more than 3 members which will be returned
//   *                    with the sheet/column/row representation in the cellAddress
//   * @param bAbsoluteList the list more than 3 members which will be returned
//   *                      with the sheet/column/row is absolute representation or not
//   */
//  public static void splitCellAddressWithAbsoluteFlag(String cellAddress,
//      String[] addressList, boolean[] bAbsoluteList) {
//
//    if((addressList == null) || (addressList.length < 3) || 
//        (bAbsoluteList == null) || (bAbsoluteList.length < 3))
//      throw new IllegalArgumentException("addressList and bAbsoluteList should be the array which contains at least 3 members");
//    if(cellAddress == null){
//      throw new IllegalArgumentException("the will be split cellAddress should not be null! ");
//    }
//    //separate column and row from cell range
//    StringTokenizer stDot = new StringTokenizer(cellAddress, ".");
//    //get sheet table name and the cell address
//    String cell = "";
//    if (stDot.countTokens() >= 2) {
//      String sheetAddress = stDot.nextToken();
//      StringTokenizer stDollar = new StringTokenizer(sheetAddress, "$");
//      addressList[0] = stDollar.nextToken();
//      bAbsoluteList[0] = (sheetAddress.indexOf('$') != -1) ?true:false;
//      cell = stDot.nextToken();
//    } else {
//      addressList[0] = "";
//      bAbsoluteList[0] = false;
//      cell = stDot.nextToken();
//    }
//
//    //TODO: test for
//    //$A$1, $A1, A$1, A1
//    //Sheet1.$A$1, Sheet1.$A1, Sheet1.A$1, Sheet1.A1
//    //$Sheet1.$A$1, $Sheet1.$A1, $Sheet1.A$1, $Sheet1.A1
//    //get the column/row number from the cell address
//    int dollarIndex = cell.indexOf('$');
//    StringTokenizer stDollar = new StringTokenizer(cell, "$");
//    if (stDollar.countTokens() >= 2) {
//      //both column/row has $ as prefix
//      addressList[1] = stDollar.nextToken();
//      bAbsoluteList[1] = (dollarIndex == 0)?true:false;
//      addressList[2] = stDollar.nextToken();
//      bAbsoluteList[2] = true;
//    } else{
//      //neither column nor row has $ as prefix
//      //or only column has $ as prefix if dollarIndex == 0
//      cell = stDollar.nextToken();
//      for (int i = 0; i < cell.length(); i++) {
//        if (!Character.isLetter(cell.charAt(i))) {
//          addressList[1] = cell.substring(0, i);
//          bAbsoluteList[1] = (dollarIndex == 0)?true:false;
//          addressList[2] = cell.substring(i);
//          bAbsoluteList[2] = false;
//          break;
//        }
//      }
//    }
//  }
  //check if value has content
  public static boolean hasValue( String value ){
    return ((value != null) && (value.length() > 0));
  }
  
  public static boolean hasValue( Object value ){
    if(value == null)
      return false;
	if(value instanceof String)
	  return hasValue((String)value);
	return true;
  }

//  /**
//   * get format code from format index in the format table
//   * the format index is start from 0, rather than 1
//   * @param formatIndex
//   * @return the corresponding format code at format index
//   */
//  public static String getFormatCodeByIndex(int formatIndex){
//    if(formatIndex > -1){
//      if(ConversionConstant.jsODFFormatList == null || ConversionConstant.jsODFFormatList.isEmpty())
//        ConversionConstant.setToODFDefaultFormat();
//      if(formatIndex < ConversionConstant.jsODFFormatList.size())
//        return ConversionConstant.jsODFFormatList.get(formatIndex).toString();
//    }
//    return null;
//  }
//
//  /**
//   * get the format type from format index
//   * the format index is start from 0, rather than 1
//   * the format type including "boolean", "currency", "date", "float", "percentage", "string" or "time"
//   * @param formatIndex the index of format code in format table
//   * @return the format type of the format code at specified format index
//   */
//  public static String getFormatTypeByIndex(int formatIndex){
//    if(formatIndex > -1){
//      if(ConversionConstant.jsODFFormatList == null || ConversionConstant.jsODFFormatList.isEmpty())
//        ConversionConstant.setToODFDefaultFormat();
//      int index = formatIndex + 1;
//      String formatType = "";
//      for (int i = 1; i < 10; i++) {
//        int subList = 0;
//
//        switch (i) {
//          case 1 :
//              subList = ConversionConstant.MAXNUMBERS;
//              formatType = ConversionConstant.NUMBERS_TYPE;
//              break;
//            case 2 :
//              subList = ConversionConstant.MAXPERCENTS;
//              formatType = ConversionConstant.PERCENTS_TYPE;
//              break;
//            case 3 :
//              subList = ConversionConstant.MAXCURRENCY;
//              formatType = ConversionConstant.CURRENCY_TYPE;
//              break;
//            case 4 :
//              subList = ConversionConstant.MAXDATE;
//              formatType = ConversionConstant.DATE_TYPE;
//              break;
//            case 5 :
//              subList = ConversionConstant.MAXTIME;
//              formatType = ConversionConstant.TIME_TYPE;
//              break;
//            case 6 :
//              subList = ConversionConstant.MAXSCIENTIFIC;
//              formatType = ConversionConstant.SCIENTIFIC_TYPE;
//              break;
//            case 7 :
//              subList = ConversionConstant.MAXFRACTION;
//              formatType = ConversionConstant.FRACTION_TYPE;
//              break;
//            case 8 :
//              subList = ConversionConstant.MAXBOOLEAN;
//              formatType = ConversionConstant.BOOLEAN_TYPE;
//              break;
//            case 9 :
//              subList = ConversionConstant.MAXTEXT;
//              formatType = ConversionConstant.TEXT_TYPE;
//              break;
//            default:
//              break;
//        }
//
//        index = index - subList;
//        if(index <= 0)
//          return formatType;
//      }
//    }
//    return null;
//  }
//  
//  public static String getFormatTypeByTypeIndex(int typeIndex){
//    String formatType = null;
//    switch (typeIndex) {
//	  case 1 :
//	    formatType = ConversionConstant.NUMBERS_TYPE;
//	    break;
//	  case 2 :
//	    formatType = ConversionConstant.PERCENTS_TYPE;
//	    break;
//	  case 3 :
//	    formatType = ConversionConstant.CURRENCY_TYPE;
//	    break;
//	  case 4 :
//	    formatType = ConversionConstant.DATE_TYPE;
//	    break;
//	  case 5 :
//	    formatType = ConversionConstant.TIME_TYPE;
//	    break;
//	  case 6 :
//	    formatType = ConversionConstant.SCIENTIFIC_TYPE;
//	    break;
//	  case 7 :
//	    formatType = ConversionConstant.FRACTION_TYPE;
//	    break;
//	  case 8 :
//	    formatType = ConversionConstant.BOOLEAN_TYPE;
//	    break;
//	  case 9 :
//	    formatType = ConversionConstant.TEXT_TYPE;
//	    break;
//	  default:
//	    break;
//    }
//    return formatType;
//  }
//  
//  public static int getDefaultFormatIndexByType(String formatType, int symbol){
//	  if(formatType.equals(ConversionConstant.DATE_TYPE)){
//		  return 95;
//	  }else if(formatType.equals(ConversionConstant.CURRENCY_TYPE)){
//		  switch(symbol){
//		    case 1:
//			  return 51;
//		    case 2:
//			  return 66;
//		    case 3:
//			  return 56;
//		    case 4:
//			  return 61;
//		    default:
//			  return 51;
//		  }
//		  
//	  }else if(formatType.equals(ConversionConstant.PERCENTS_TYPE)){
//		  return 41;
//	  }else  if(formatType.equals(ConversionConstant.BOOLEAN_TYPE)){
//		  return 180;
//	  }
//	  return -1;
//  }
//  public static String getCurrencySymbolCharByIndex(int formatIndex){
//    if( (formatIndex >= ConversionConstant.USD_CURRENCY_START) && (formatIndex <= ConversionConstant.USD_CURRENCY_END))
//    	return ConversionConstant.USD_SYMBOL;
//    else if( (formatIndex >= ConversionConstant.EUR_CURRENCY_START) && (formatIndex <= ConversionConstant.EUR_CURRENCY_END))
//    	return ConversionConstant.EUR_SYMBOL;
//    else  if( (formatIndex >= ConversionConstant.CNY_CURRENCY_START) && (formatIndex <= ConversionConstant.CNY_CURRENCY_END))
//    	return ConversionConstant.CNY_SYMBOL;
//    else  if( (formatIndex >= ConversionConstant.JPN_CURRENCY_START) && (formatIndex <= ConversionConstant.JPN_CURRENCY_END))
//    	return ConversionConstant.JPN_SYMBOL;
//    return ConversionConstant.USD_SYMBOL;
//  }
//  
//  public static String getXLSFormatType(int formatIndex)
//  {
//    if (formatIndex > -1)
//    {
//      if (ConversionConstant.jsFormatList == null || ConversionConstant.jsFormatList.isEmpty())
//        ConversionConstant.setToDefaultFormat();
//      
//      int index = formatIndex + 1;
//      String formatType = "";
//      for (int i = 1; i < 10; i++)
//      {
//        int subList = 0;
//
//        switch (i)
//          {
//            case 1 :
//              subList = ConversionConstant.MAXNUMBERS;
//              formatType = ConversionConstant.NUMBERS_TYPE;
//              break;
//            case 2 :
//              subList = ConversionConstant.MAXPERCENTS;
//              formatType = ConversionConstant.PERCENTS_TYPE;
//              break;
//            case 3 :
//              subList = ConversionConstant.MAXCURRENCY;
//              formatType = ConversionConstant.CURRENCY_TYPE;
//              break;
//            case 4 :
//              subList = ConversionConstant.MAXDATE;
//              formatType = ConversionConstant.DATE_TYPE;
//              break;
//            case 5 :
//              subList = ConversionConstant.MAXTIME;
//              formatType = ConversionConstant.TIME_TYPE;
//              break;
//            case 6 :
//              subList = ConversionConstant.MAXSCIENTIFIC;
//              formatType = ConversionConstant.SCIENTIFIC_TYPE;
//              break;
//            case 7 :
//              subList = ConversionConstant.MAXFRACTION;
//              formatType = ConversionConstant.FRACTION_TYPE;
//              break;
//            case 8 :
//              subList = ConversionConstant.MAXBOOLEAN;
//              formatType = ConversionConstant.BOOLEAN_TYPE;
//              break;
//            case 9 :
//              subList = ConversionConstant.MAXTEXT;
//              formatType = ConversionConstant.TEXT_TYPE;
//              break;
//            default:
//              break;
//          }
//
//        index = index - subList;
//        if (index <= 0)
//          return formatType;
//      }
//    }
//    return null;
//  }
//  public static int getXLSCurrencySymbolIndexByFormatString(String formatString){
//	  int currencySymbol = -1;
//	  if(formatString.contains(ConversionConstant.XLS_USD_SYMBOL)||formatString.contains("USD"))
//  		currencySymbol = 1;
//  	  else if(formatString.contains(ConversionConstant.XLS_EUR_SYMBOL)||formatString.contains("EUR"))
//  		currencySymbol = 2;
//  	  else if(formatString.contains(ConversionConstant.XLS_CNY_SYMBOL)||formatString.contains("CNY"))
//  		currencySymbol = 3;
//  	  else if(formatString.contains(ConversionConstant.XLS_JPN_SYMBOL)||formatString.contains("JPY"))
//  		currencySymbol = 4;
//  	  else
//  		currencySymbol = -1;
//	  return currencySymbol;
//  }
//
//  /**
//   * update original formula with the updated tokens
//   * @param origFormula the original formula
//   * @param updatedTokenList    the token only with the address updated, the index should not be changed which 
//   *                            is the original token index in the original formula.
//   *                            And the original token list must come from ConversionUtil.getTokenFromFormula(origFormula, null)
//   * @return the updated formula
//   */
//  public static String updateFormula(String origFormula, 
//          ArrayList<ConversionUtil.FormulaToken> tokenList,
//          ArrayList<ConversionUtil.FormulaToken> updatedTokenList){
//    int copyStartIndex = 0;
//    StringBuffer updatedFormula = new StringBuffer();
//    if((updatedTokenList != null) && (origFormula != null)){
//      Object[] sortUpdatedTokenArray = 
//        sort(updatedTokenList.toArray(), true);
//      Object[] sortTokenArray =
//          sort(tokenList.toArray(),true);
//      for(int i=0; i<sortUpdatedTokenArray.length; i++){
//        try{
//        ConversionUtil.FormulaToken updateFormulaToken = (ConversionUtil.FormulaToken)sortUpdatedTokenArray[i];
//        ConversionUtil.FormulaToken formulaToken = (ConversionUtil.FormulaToken)sortTokenArray[i];
//          //copy part of the formula which does not related with the tokens
//          int tokenIndex = updateFormulaToken.getIndex();
//          updatedFormula.append(origFormula.substring(copyStartIndex, tokenIndex));
//          //copy the updated tokens to the updatedFormula
//          String updateTokenAddress = updateFormulaToken.getText();
//          updatedFormula.append(updateTokenAddress);
//          String tokenAddress = formulaToken.getText();
//          copyStartIndex = tokenIndex + tokenAddress.length();
//        }catch(Exception e){
//          e.printStackTrace();
//        }
//      }
//      if(copyStartIndex < origFormula.length())
//        updatedFormula.append(origFormula.substring(copyStartIndex));
//      return updatedFormula.toString();
//    }
//    //if the updated token list is null, just return the original formula
//    if(updatedTokenList == null)
//      return origFormula;
//    
//    return null;
//  }
  
  
  public static String convertFormula(String formula){
    String value = formula.startsWith("of:") ? formula.substring(3) : formula;
    String valueUpperCase = value.toUpperCase();
    if (value.contains(OOOPREFIX))
      value = value.replace(OOOPREFIX, "");
    else if(valueUpperCase.startsWith(OOOC)){
      value = value.substring(OOOC.length());
      if(valueUpperCase.contains("COM.SUN"))
          value = removeOOFormulaCategory(value);
    }
    // keep the value of the external link
    Matcher m = PATTERN_EXTERNAL_FORMULA.matcher(value);
    ArrayList<int[]> externalPos = new ArrayList<int[]>();
    while(m.find())
    {
      String link = m.group();
      int start = m.start();
      int end = m.end();
      int[] pos = {start, end};
      externalPos.add(pos);
    }
    
    char[] b = new char[value.length()];
    value.getChars(0, value.length(), b, 0);
    char[] f = new char[value.length()];
    int k = 0;
    int p = 0;
    FState state = FState.NONE;
    int externalStart = -1;
    int externalEnd = -1;
    int pos = 0;
    if(externalPos.size() > pos)
    {
      int[] e = externalPos.get(pos);
      externalStart = e[0];
      externalEnd = e[1];
    }
    
    for (int j = 0; j < b.length; ++j)
    {
      // keep the char if j in externalPos
      if(j >= externalStart && j <= externalEnd)
      {
        f[k++] = b[j];
        if(j == externalEnd)
        {
          //move to the next external position
          if(externalPos.size() > ++pos)
          {
            int[] e = externalPos.get(pos);
            externalStart = e[0];
            externalEnd = e[1];
          }
        }
        continue;
      }
        
      int c = b[j];
      switch (c)
        {
          case '\'' :
            if (state == FState.NONE)
              state = FState.SINGLEQUOTE; // the first single quote
            else if (state == FState.SINGLEQUOTE)
              state = FState.NONE; // found the end single quote
            break;
          case '"' :
            if (state == FState.NONE)
              state = FState.DOUBLEQUOTE; // the first double quote
            else if (state == FState.DOUBLEQUOTE)
              state = FState.NONE;
            break;
          default:
        }
      if (state == FState.NONE)
      {
        // ignore those character if it isn't included by neither single quote nor double quote
        if ((c == '[') || (c == '.' && (p == '[' || p == ':')) || (c == ']'))
        {
          p = b[j];
          continue;
        }
        else
          f[k++] = b[j];
      }
      else
        f[k++] = b[j];
      p = b[j];
    }
    value = String.valueOf(f, 0, k);
    return value;
  }
  
  public static void main(String[] args)
  {
    ArrayList<String> list = new ArrayList<String>();
    list.add("['file:///D:/DOCUME~1/ADMINI~1/LOCALS~1/Temp/notesC9812B/Rev[enue%20Actu]als_Feb%20Prelim.xls'#$'GEO Input'.$AD$33:.$AI$37]+[Sheet2.A1]");
    list.add("['file:///D:/DOCUME~1/ADMINI~1/LOCALS~1/Temp/notesC9812B/Revenue%20Actuals_Feb%20Prelim.xls'#$'GEO Input'.$AD$33:.$AI$37]");
    list.add("OFFSET(['file:///D:/DOCUME~1/ADMINI~1/LOCALS~1/Temp/notesEA312D/IPS%20Development%20Headcount%20April%2008a.xls'#$'2008 Attrition Rate'.$A$1];0;0;COUNTA(['file:///D:/DOCUME~1/ADMINI~1/LOCALS~1/Temp/notesEA312D/IPS%20Development%20Headcount%20April%2008a.xls'#$'2008 Attrition Rate'.$A$1:.$A$65536]);3)");
    list.add("of:=[Sheet2.A1]+[.A2]");
    list.add("of:=[Sheet2.A1]+[.A2]");
    list.add("=[.A1]");
    list.add("\"[]\"");
    list.add("['file:///D:/DOCUME~1/ADMINI~1/LOCALS~1/Temp/notesC9812B/Revenue%20Actuals_Feb%20Prelim.xls'#$'GEO Input'.$AD$33:.$AI$37]+[Sheet2.A1]");
    for(int i = 0; i < list.size(); i++)
    {
      String formula = list.get(i);
      String value = convertFormula(formula);
      System.out.println(value);
    }
    
  }
  /**
   * update original formula with the updated text
   * @param origFormula the original formula
   * @param tokenList    the token only with the address updated, the index should not be changed which 
   *                            is the original token index in the original formula.
   * @return the updated formula
   */
  public static String updateFormula(String origFormula, 
          ArrayList<ConversionUtil.FormulaToken> tokenList){
	//if the updated token list is null, just return the original formula
	    if(tokenList == null)
	      return origFormula;
	    
	  int copyStartIndex = 0;
    StringBuffer updatedFormula = new StringBuffer();
    if(origFormula != null){
      Object[] sortTokenArray =
          sort(tokenList.toArray(),true);
      for(int i=0; i<sortTokenArray.length; i++){
        try{
        ConversionUtil.FormulaToken formulaToken = (ConversionUtil.FormulaToken)sortTokenArray[i];
          //copy part of the formula which does not related with the tokens
        if(formulaToken.getRef() == null)
          continue;
          int tokenIndex = formulaToken.getIndex();
          updatedFormula.append(origFormula.substring(copyStartIndex, tokenIndex));
          //copy the updated tokens to the updatedFormula
          String updateTokenAddress = formulaToken.getChangeText();
          updatedFormula.append(updateTokenAddress);
          String tokenAddress = formulaToken.getText();
          copyStartIndex = tokenIndex + tokenAddress.length();
        }catch(Exception e){
          e.printStackTrace();
        }
      }
      if(copyStartIndex < origFormula.length())
        updatedFormula.append(origFormula.substring(copyStartIndex));
      return updatedFormula.toString();
    }
    
    return null;
  }
  private static Object[] sort(Object[] array, final boolean bAscend)
  {
    if( (array != null) && (array.length > 1) ){
      Arrays.sort(array, new Comparator()   {
        public int compare(Object obj1, Object obj2)
        {
          Object value1 = ((ConversionUtil.FormulaToken)obj1).getIndex();
          Object value2 = ((ConversionUtil.FormulaToken)obj2).getIndex();
          int result = ((Comparable)value1).compareTo(value2);
          return bAscend?result:(0-result);
        }
      });
    }
    
    return array;
  }

  /**
   * get JSON object from file
   * @param filePath JSON file
   * @return JSON object
   */
  public static JSONObject getObjectFromJSON(String filePath) 
  {
      return getObjectFromJSON(filePath, false);
  }
  /**
   * get JSON object from file
   * @param filePath JSON file
   * @param isPackRow pack row json as string for content.js
   * @return JSON object
   */
  public static JSONObject getObjectFromJSON(String filePath, boolean isPackRow) 
  {
    InputStream input = null;
    JSONObject obj = null;
    File file = new File(filePath);
    if(!file.exists())
    {
      LOG.log(Level.WARNING, filePath + " doesn't exist");
      return null;
    }
    // use Jackson to parse json instead of IBM's json4j. 
    // So we can pack row json object as a string
    
//    try {
//      input = new FileInputStream(file);
//      if(input.available()>0)
//        obj = JSONObject.parse(input);
//      input.close();
//    } catch (FileNotFoundException fnfException) {
//      LOG.log(Level.WARNING, "can not get json", fnfException);
//    } catch (IOException ioException){
//      LOG.log(Level.WARNING, "can not get json", ioException);
//    }
    JsonParser jp = null;
    try {
      JsonFactory jasonFactory = new JsonFactory();
      jp = jasonFactory.createJsonParser(file);
      jp.nextToken();
      JSONObjectGenerator jg = new JSONObjectGenerator(jasonFactory);
      jg.setPackRows(isPackRow);
      jg.copyCurrentStructure(jp);
      obj = jg.getRootObject();
      //System.out.println(filePath + ":obj1:"+obj.serialize());
    } catch (Exception e) {
      LOG.log(Level.WARNING, "can not get json by jackson", e);
    }finally{
      try
      {
        if(jp != null)
          jp.close();
      }catch(IOException e)
      {
        LOG.log(Level.WARNING, "can not close jason parser", e);
      }
    }
    return obj;
  }
  
  public static FormulaToken generateFormulaToken(String text, List<Range> nameList){
	  FormulaToken token = null;
	  if(nameList != null){
		  int len = nameList.size();
		  for(int i = 0 ; i< len; i ++)
		  {
			  Range range = nameList.get(i);
			  if(range.rangeId.equals(text))
			  {
				  token = new FormulaToken();
		          token.setType(FormulaToken.TokenType.NAME);
		          token.setText(text);
		          ReferenceParser.ParsedRef ref = ReferenceParser.parse(range.address);
		          if(ref != null)
		        	  token.setRef(ref);
		          return token;
			  }
		  }
	  }
	 
	  
	  ReferenceParser.ParsedRef ref = ReferenceParser.parse(text);
	  if(ref != null && isValidFormulaRef(ref))
	  {
		  token = new FormulaToken();
		  if(ref.type == ReferenceParser.ParsedRefType.CELL)
			  token.setType(FormulaToken.TokenType.CELL);
		  else
			  token.setType(FormulaToken.TokenType.RANGE);
		  token.setRef(ref);
		  token.setText(text);
	  }
	  //#name, also create token
	  else
	  {
		  token = new FormulaToken();
          token.setType(FormulaToken.TokenType.NAME);
          token.setText(text);         
          return token;
	  }
	  
	  return token;
  }

  public static FormulaToken generateVirtualToken(ArrayList<FormulaToken>tokenList ,FormulaToken left,FormulaToken right){
	  FormulaToken token = new FormulaToken();
	  int leftIndex = tokenList.indexOf(left);
	  int rightIndex = tokenList.indexOf(right);
	  token.setLIndex(leftIndex);
	  token.setRIndex(rightIndex);
	  token.setIndex(-1);
      token.setType(FormulaToken.TokenType.VREF);
	  return token;
  }
 
  /**
   * Get the token map from the formula.
   * @param formula the cell formula
   * @nameList  the name range list of the current document which is used to match the formula token
   * @return    the token map contains cell reference, range reference and names reference
   *            and the keys are "cell", "range", "names"
   */
  public static ArrayList<FormulaToken> getTokenFromFormula(String formula, List<Range> nameList){
//    System.out.println("Formula is : " + formula);
    //the key are "cell", "range","names"
    ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>(); 
    //formula parser limitation
    if(formula.length() > 2000)
    	return tokenList;
    
    try {
      ConversionUtil._cellHasUnicode = false;
      java.io.ByteArrayInputStream strInput = new java.io.ByteArrayInputStream(formula.getBytes("utf-8"));
      FormulaLexer lexer = new FormulaLexer(new ANTLRInputStream(strInput,"utf-8"));
      CommonTokenStream tokens = new CommonTokenStream(lexer);
      tokens.LT(0); // trigger  
      if(ConversionUtil._cellHasUnicode)
        normalizeTokens(tokens);
      FormulaParser parser = new FormulaParser(tokens);
      //input parameter
      if(nameList != null)
        parser.nameinstances = nameList;
      //output parameter
      parser.tokenList = tokenList;
      parser.prog();
      if(parser.error!=null)
        tokenList.clear();
    } catch (IOException e1) {
      tokenList.clear();
      LOG.log(Level.WARNING, "", e1);
    } catch (RecognitionException e) {
      tokenList.clear();
      LOG.log(Level.WARNING, "the formula : \"" + formula +"\" can not be recognized", e);
    } finally{
    	return tokenList;
    }
//    for(int i=0; i<tokenList.size();i++){
//      System.out.println(tokenList.get(i).mType.toString() + ":\""
//          + tokenList.get(i).mText + "\" at " + tokenList.get(i).mIndex);
//    }
  }

  private static void normalizeTokens(CommonTokenStream tokens)
  {
    List tList = tokens.getTokens();
    boolean bStart = false;
    ArrayList<Token> nameTokens = new ArrayList<Token>();
    int size = tList.size();
    for(int i=size - 1; i>=0;i--)
    {
      Token token = (Token)tList.get(i);
      int type = token.getType();
      switch(type)
      {
        case FormulaLexer.NAME1:
          token.setType(FormulaLexer.NAME);
        case FormulaLexer.NAME:
        //case FormulaLexer.RANGE_FUNC:
        //case FormulaLexer.ARRAY_FORMULAR_START:
        //case FormulaLexer.ARRAY_FORMULAR_END:
        case FormulaLexer.SINGLEQUOT_STRING:
            if(!bStart)
                bStart = true;
            nameTokens.add(token);
            break;
        default:
            if(bStart)
            {
                bStart = false;
                //collect all the tokens
                int len = nameTokens.size();
                if(len > 1)
                {
                    StringBuffer text = new StringBuffer();
                    for(int j=len-1; j>=0; j--){
                        Token tokenIter = nameTokens.get(j);
                        text.append(tokenIter.getText());
                        if(j < (len-1))
                          tList.remove(tokenIter);//delete the tokens in nameTokens except the first token
                    }
                    Token nameToken = nameTokens.get(len-1);
                    nameToken.setText(text.toString());
                    nameToken.setTokenIndex(nameToken.getTokenIndex() + len - 1); // also need to adjust token index
                    nameToken.setType(FormulaLexer.NAME);
//                    nameToken.stop = nameTokens[0].stop;
//                    tokenList.splice(i+2, nameTokens.length-1);//delete the tokens in nameTokens except the first token
                }
                nameTokens.clear();
            }
        }
      }
    }
  /**
   * Set the start/end column/row id and sheet id for cell range according to the cell range address
   * @param nameCellRange    will be updated with start/end column/row id and sheet id
   * @param cellRangeAddress    cell range address got from file
   * @param document the current document, here we can get the max rowid/columnid and sheet name list
   * @param currentSheet the current sheet which might be null if the context has no specific sheet
   * if currentSheet is null, then the sheet id of named cell range will be the first sheet of the current document
   */
   public static void setCellRangeByToken(Range nameCellRange, ReferenceParser.ParsedRef ref, 
       Document document, Sheet currentSheet)
   {
       if(ref != null)
       {
	       String sheetName = ref.sheetName;
	       
	       if(ConversionUtil.hasValue(sheetName)){
	         boolean bFind = false;
	         for(int i=0; i<document.sheetList.size();i++){
	           if(document.sheetList.get(i).sheetName.equals(sheetName)){
	             currentSheet = document.sheetList.get(i);
	             bFind = true;
	             break;
	           }
	         }
	         if(!bFind)
	           return;//the ref.sheetName is not in the document
	       }
	       if(currentSheet == null)
             currentSheet = document.sheetList.get(0);
	       nameCellRange.sheetId = currentSheet.sheetId;
	       // add end sheet name for 3d ref
           String endSheetName = ref.endSheetName;
           if(ConversionUtil.hasValue(endSheetName))
	       {
             boolean bFind = false;
             for(int i=0; i<document.sheetList.size();i++){
               if(document.sheetList.get(i).sheetName.equals(endSheetName))
               {
                 currentSheet = document.sheetList.get(i);
                 bFind = true;
                 break;
               }
             }
             if(bFind)
             {
               nameCellRange.endSheetId = currentSheet.sheetId;
             }
	       }
	       if(ConversionUtil.hasValue(ref.startCol)){
	         int startCol = ReferenceParser.translateCol(ref.startCol);
	         if(startCol != -1)
	         {
	           int nameRangeStartColIndex = startCol - 1;
	           nameCellRange.startColId = updateIdArray(nameRangeStartColIndex, currentSheet, document, false, true);
	         }
	       }
	       if(ConversionUtil.hasValue(ref.startRow)){
	         int startRow = ReferenceParser.translateRow(ref.startRow);
    	     if(startRow != -1)
    	     {
   	 	       int nameRangeStartRowIndex = startRow - 1;
    	       nameCellRange.startRowId = updateIdArray(nameRangeStartRowIndex, currentSheet, document, true, true);
    	     }  
	       }
	       
	       if(ConversionUtil.hasValue(ref.endCol)){
	         int endCol = ReferenceParser.translateCol(ref.endCol);
	         
	         if(endCol != -1)
	         {
	           int nameRangeEndColIndex = endCol - 1;
	           nameCellRange.endColId = updateIdArray(nameRangeEndColIndex, currentSheet, document, false, true);
	         }
	       }
	       if(ConversionUtil.hasValue(ref.endRow))
	       {
	         int endRow = ReferenceParser.translateRow(ref.endRow);
	         
	         if(endRow != -1 )
	         {
	           int nameRangeEndRowIndex = endRow - 1;
	           nameCellRange.endRowId = updateIdArray(nameRangeEndRowIndex, currentSheet, document, true, true);
	         }  
	       }
       }
   }
   //index is 0-based
   //if bMax=true, only create new id if index < 1000 for row or <1024 for column, otherwise, use "M" as id
   //else create id for any index
   public static String updateIdArray(int index, Sheet sheet, Document doc, boolean bRow, boolean bMax)
   {
     List<String> idArray = sheet.columnIdArray;
     int max = ConversionConstant.MAX_COL_NUM;
     if(bRow){
       idArray = sheet.rowIdArray;
       max = ConversionConstant.MAX_REF_ROW_NUM;
     }
     String id = "";
     if(bMax && (index >= max))
       id = ConversionConstant.MAX_REF;
     else{
       int emptyCount = index - idArray.size();
       for (int i = 0; i < (emptyCount + 1); i++)
         idArray.add("");
       id = idArray.get(index);
       if (id.equalsIgnoreCase(""))
       {
         id = doc.createId(bRow);
         idArray.set(index, id);
       }
     }
     return id;
   }
  public static boolean isOutOfRowCapacilty (int rowNum) {

    if (ConversionConstant.MAX_REF_ROW_NUM != -1)
      return rowNum > ConversionConstant.MAX_REF_ROW_NUM;

    return false;
  }
  
  public static boolean isOutOfCellCapacity(long cellCnt, long formulaCnt)
  {
    return (cellCnt > ConversionConstant.MAX_CELL_COUNT
        || formulaCnt > ConversionConstant.MAX_FORMULA_CELL_COUNT);
  }
  
  public static boolean isAnchorToPage(DrawFrameRange range)
  {
    return "absolute".equals(range.pt);
  }
  
  /**
   * Normalize Number pattern code
   * if just number:min-integer-digits is given, 
   * means that the digital places is depend on the value, rather than 0
   * @param code
   * @return
   */
public static String normalizeNumber(OdfNumberStyle numberStyle, String code){
    if("0".equals(code)){
      Node m = numberStyle.getFirstChild();
      if (m instanceof OdfNumber) {
    	  OdfNumber number = OdfElement.findFirstChildNode(OdfNumber.class, numberStyle);
          if(number.getNumberDecimalPlacesAttribute() == null)
              code = "";
      }
    }
    return code;
  }
  /*
   * Normalize pattern code for CURRENCY FORMATTYPE and
   * return the pair of pattern code and currency string
   * @param code 	concord format code
   * @return		[pattern, currency] or
   * 				NULL if the pattern isn't found
   */
  public static String[] normalizeCurrency(String code) {
    String currency[] = null;
    for (int i = 0; i < ConversionConstant.CURRENCY_SYMBOL.length; ++i) {
      String cs[] = ConversionConstant.CURRENCY_SYMBOL[i];
      
      if (code.equals(cs[0]) || code.equals(cs[1])) {
        String pattern = cs[0];
        if (code.equals(cs[1])) pattern = cs[1];
        code = code.replace(pattern, "");
        if (code.charAt(0) == '-') code = code.substring(1);
        code = code.trim();
        
        currency = new String[2];
        currency[0] = code;
        currency[1] = cs[0];
        break;
      }
    }
    return currency;
  }
  
  /*
   * Given Concord currency pattern code, get its currency string  
   * @param code	Concord currency pattern code
   * @return 		currency
   */
  public static String getCurrencySymbol (String code) {
    for (int i = 0; i < ConversionConstant.CURRENCY_SYMBOL.length; ++i) {
      String cs[] = ConversionConstant.CURRENCY_SYMBOL[i];
      if (code.equalsIgnoreCase(cs[0])) {
        return cs[1];
      }
    }
    return null;
  }
  
  public static String getCurrencyCode(String lang, String country){
	  String langCoun = "";
	  if(lang == null && country == null) return null;
	  lang = (lang != null) ? lang : "";
	  country = (country != null) ? "-" + country : "";
	  langCoun = lang + country;
	  for(int i = 0; i < ConversionConstant.CURRENCY_CODE_BY_LANGUAGE_COUNTRY.length; ++i){
		  String cl[] = ConversionConstant.CURRENCY_CODE_BY_LANGUAGE_COUNTRY[i];
		  if(langCoun.equalsIgnoreCase(cl[1]))
			  return cl[0];
	  }
	  return null;
  }
  
  public static String getCurrencyLanguage(String code){
	  if(code == null) return null;
	  for(int i = 0; i < ConversionConstant.CURRENCY_LANGUAGE_COUNTRY_BY_CODE.length; ++i){
		  String cl[] = ConversionConstant.CURRENCY_LANGUAGE_COUNTRY_BY_CODE[i];
		  if(code.equalsIgnoreCase(cl[0]))
			  return cl[1];
	  }
	  return null;
  }
  
  public static String getCurrencyCountry(String code){
	  if(code == null) return null;
	  for(int i = 0; i < ConversionConstant.CURRENCY_LANGUAGE_COUNTRY_BY_CODE.length; ++i){
		  String cc[] = ConversionConstant.CURRENCY_LANGUAGE_COUNTRY_BY_CODE[i];
		  if(code.equalsIgnoreCase(cc[0]))
			  return cc[2];
	  }
	  return null;
  }
  
  public static String getOfficeCurrency(String code){
	  if(code == null) return "";
	  for(int i = 0; i < ConversionConstant.OFFICE_CURRENCY_BY_CODE.length; ++i){
		  String cl[] = ConversionConstant.OFFICE_CURRENCY_BY_CODE[i];
		  if(code.equalsIgnoreCase(cl[0]))
			  return cl[1];
	  }
	  return code;
  }
  
  public static boolean isFormulaString(String v) {
    if(null == v) return false;
    if(v.startsWith("=") && v.length() > 1)
      return true;
    return false;
//    return PATTERN_FORMULA.matcher(v).matches();
  }
  
  // No framework available here to get localized date/time format
  // when create new spreadsheet or from one spreadsheet template, 'locale' is given to specify
  // what localized date/time format is required when export json to ods.
  public static String getDateTimePattern (String code, String type, String locale, boolean bDojoStyle){
	  String pattern = null;
	  
	  // as one work around, fallback to "en", in release, only germany version
	  // of date/time format got supported.
	  if (locale == null) locale = "en";
	  if (locale.contains("_"))
		 locale = locale.split("_")[0];
	  // only de locale got supported
	  if (!locale.equalsIgnoreCase("de")) locale = "en";
	  if (type.equalsIgnoreCase(ConversionConstant.DATE_TYPE)) {
		  String dates[][] = DateTimeConstant.DATES;
		  // FIXME
		  if(locale.equalsIgnoreCase("de"))
			  dates = DateTimeConstant.DATES_DE;
	      for (int i = 0; i < dates.length; ++i) {
	        String date[] = dates[i];
	        if (bDojoStyle) {
	          if (code.equalsIgnoreCase(date[1])) {
	        	  pattern = date[0];
	        	  break;
	          }
	        } else {
	          if (code.equalsIgnoreCase(date[0])) { 
	        	  pattern = date[1];
	        	  break;
	          }
	        }
	      }
	    }
		else if (type.equalsIgnoreCase(ConversionConstant.TIME_TYPE)) {
		 String times[][] = DateTimeConstant.TIMES;
		 if(locale.equalsIgnoreCase("de"))
			 times = DateTimeConstant.TIMES_DE;
	      for (int i = 0; i < times.length; ++i) {
	        String time[] = times[i];
	        if (bDojoStyle) {
	          if (code.equals(time[1])) {
	        	  pattern = time[0];
	        	  break;
	          }
	        } else {
	          if (code.equals(time[0])) {
	            pattern = time[1];
	            break;
	          }   
	        }
	      } 
		 }
	      //pattern = ((SimpleDateFormat)DateFormat.getDateTimeInstance(DateFormat.SHORT,DateFormat.SHORT,l)).toPattern();
	
	  
	  return pattern;
  }
  
  public static String getDateTimePattern (String code, String type, boolean bDojoStyle) {
    String pattern = null;
	if (type.equalsIgnoreCase(ConversionConstant.DATE_TYPE)) {
      for (int i = 0; i < DateTimeConstant.DATES.length; ++i) {
        String date[] = DateTimeConstant.DATES[i];
        if (bDojoStyle) {
          if (code.equalsIgnoreCase(date[1])) {
        	  pattern = date[0];
        	  break;
          }
        } else {
          if (code.equalsIgnoreCase(date[0])) { 
        	  pattern = date[1];
        	  break;
          }
        }
      }
//      if (pattern == null) {
//    	  String defaultDate[] = ConversionConstant.DATES[0];
//    	  if (bDojoStyle) pattern = defaultDate[0];
//    	  else pattern = defaultDate[1];
//      }
    }
	else if (type.equalsIgnoreCase(ConversionConstant.TIME_TYPE)) {
      for (int i = 0; i < DateTimeConstant.TIMES.length; ++i) {
        String time[] = DateTimeConstant.TIMES[i];
        if (bDojoStyle) {
          if (code.equalsIgnoreCase(time[1])) {
        	  pattern = time[0];
        	  break;
          }
        } else {
          if (code.equalsIgnoreCase(time[0])) {
            pattern = time[1];
            break;
          }   
        }
      }
//      if (pattern == null) {
//    	  String defaultTime[] = ConversionConstant.TIMES[0];
//    	  if (bDojoStyle) pattern = defaultTime[0];
//    	  else pattern = defaultTime[1];
//      }
    }
	
    return pattern;
  }
  
  
  public static int getDateTimeType(String code){
	  
	  for(int i = 0 ; i < ConversionConstant.DATETIMETYPES.length ; i++){
		  String pattern = ConversionConstant.DATETIMETYPES[i][0];
		  if(pattern.equals(code))
			  return Integer.parseInt(ConversionConstant.DATETIMETYPES[i][1]);
	  }
	  return -1;
  }
  
  public static InputStream getBlankSpreadSheetDocument(final String mimeType, final String source)
  {
    //get locale from meta.js
    String metaFilePath = source + File.separator + "meta.js";
    ConversionUtil.Document doc = new ConversionUtil.Document();
    doc.docMetaJSON = ConversionUtil.getObjectFromJSON(metaFilePath);
    String locale = (String)doc.docMetaJSON.get(ConversionConstant.LOCALE);
    return getBlankSpreadSheetDocument(mimeType, source, locale);
  }

  public static InputStream getBlankSpreadSheetDocument(final String mimeType, final String source, final String locale)
  {
    String suffix = ConversionConstant.FILE_TYPE_ODS;
    String templateFileName = "blankSpreadsheet"; // default file name with en-us locale.

    if (ServiceConstants.OTS_MIMETYPE.equals(mimeType))
      suffix = ConversionConstant.FILE_TYPE_OTS;
    String templatePath = templateFileName + "." + suffix;

    String localePath = templatePath;
    if (null != locale && !locale.startsWith("en"))
      localePath = locale.toLowerCase() + "/" + templatePath;

    InputStream ret = null;
    try
    {
      ret = ConversionUtil.class.getResourceAsStream("/locale/" + localePath);
      if (ret == null)
      {
        ret = ConversionUtil.class.getResourceAsStream("/locale/" + templatePath);
      }
    }
    catch (Exception e)
    {
      return ConversionUtil.class.getResourceAsStream(templatePath);
    }

    return ret;
  }

//RANGE TYPE for preserve
  public static enum RangeType{
    NORMAL("normal"), 
    DELETE("delete"), 
    ANCHOR("anchor"), 
    INHERIT("inherit"), 
    COPY("copy"), 
    FORMULA("formula"), 
    VALIDATION_REF("validation_ref"),
    RANGEFILTER("rangefilter"),//different with FILTER
    SPLIT("split"), 
    CHART("chart"), 
    NAMES("NAMES"),
    TASK("TASK"),
    FILTER("FILTER"),
    COMMENT("COMMENTS"),
    VALIDATION("DATA_VALIDATION"),
    IMAGE("IMAGE"),
    ACCESS_PERMISSION("ACCESS_PERMISSION"),
    CHART_AS_IMAGE("CHART_AS_IMAGE");
    
    private String mValue;
    RangeType(String value){
      mValue = value;
    }
    
    public String toString(){
      return mValue;
    }
    
    public static RangeType enumValueOf(String value) {
      for(RangeType aIter : values()) {
          if (value.equalsIgnoreCase(aIter.toString())) {
          return aIter;
          }
      }
      return RangeType.NORMAL;
  }
  }
  public enum JSONType{
    DOCUMENT, SHEET, COLUMN, ROW, CELL, STYLE, RANGE, COMMENT, VALIDATION, DEFAULT
  }
  
  public enum ErrorCode {
    NONE("NONE"), // no error
    ERR7("#N/A"), //
    ERR501("#Err501!"), //
    ERR502("#Err502!"), //
    ERR503("#Err503!"), //
    ERR504("#NUM!"), //
    ERR508("#Err508!"), //
    ERR509("#Err509!"), //
    ERR510("#Err510!"), //
    ERR511("#Err511!"), //
    ERR512("#Err512!"), //
    ERR513("#Err513!"), //
    ERR514("#Err514!"), //
    ERR516("#Err516!"), //
    ERR517("#Err517!"), //
    ERR518("#Err518!"), //
    ERR519("#VALUE!"), //
    ERR520("#Err520!"), //
    ERR521("#Err521!"), //
    ERR522("#Err522!"), //
    ERR523("#Err523!"), //
    ERR524("#REF!"), //
    ERR525("#NAME?"), //
    ERR526("#Err526!"), //
    ERR527("#Err527!"), //
    ERR532("#DIV/0!"), //
    ERR533("#NULL!"), //
    ERR1001("UNSUPPORT_FORMULA"),
    ERR1002("#ERROR!"), //
    ERR1003("REF_UNSUPPORT_FORMULA"), //
    ERR2001("UNPARSE");
    

    private String errorMessage;
    
    private int intCode;

    /**
     * @param msg
     *          error code message in en.
     */
    private ErrorCode(String msg)
    {
      errorMessage = msg;
      
      String name = name();
      
      if ("NONE".equals(name))//NONE??
      {
        intCode = 0;
      }
      else
      {
        intCode = Integer.parseInt(name.substring(3));
      }
    }

    public String toString()
    {
      return errorMessage;
    }
    
    public int toIntValue()
    {
      return intCode;
    }

    private final static Map<String, ErrorCode> errorCodeMessageMap;
    
    private final static Map<Integer, ErrorCode> errorCodeMap; 

    static
    {
      errorCodeMessageMap = new HashMap<String, ErrorCode>();
      
      errorCodeMap = new HashMap<Integer, ErrorCode>();
      
      ErrorCode[] codes = ErrorCode.class.getEnumConstants();
      for (int i = 0; i < codes.length; i++)
      {
        errorCodeMessageMap.put(codes[i].toString(), codes[i]);
        
        errorCodeMap.put(codes[i].toIntValue(), codes[i]);
      }
    }

    public static ErrorCode enumValueOf(String v)
    {
      return errorCodeMessageMap.get(v);
    }
    
    public static ErrorCode getErrorCodeByIntCode(int code)
    {
      return errorCodeMap.get(code);
    }
  }
  
  /**
   * this method is used to verify if the hyperlink is supported, currently, we only support http, https and ftp
   */
  public static boolean isSupportedHyperlink(String herf){
    if (herf == null)
      return false;
	  String tmp=herf.toLowerCase();
	  if(tmp.startsWith("http://")|| tmp.startsWith("https://") || tmp.startsWith("ftp://"))
		  return true;
	  return false;
  }
  

  private static String getShortKey(String longKey)
  {
      if(longkey2ShortMap==null)
      {
         longkey2ShortMap = new HashMap<String,String>();
         longkey2ShortMap.put("value", ConversionConstant.VALUE);
         longkey2ShortMap.put("calculatedvalue", ConversionConstant.CALCULATEDVALUE);
         longkey2ShortMap.put("showvalue", ConversionConstant.SHOWVALUE);
         longkey2ShortMap.put("text_align", ConversionConstant.TEXT_ALIGN);
         longkey2ShortMap.put("vertical_align", ConversionConstant.VERTICAL_ALIGN);
         longkey2ShortMap.put("background_color", ConversionConstant.BACKGROUND_COLOR);
         longkey2ShortMap.put("wraptext", ConversionConstant.WRAPTEXT);
         longkey2ShortMap.put("border_left", ConversionConstant.BORDER_LEFT);
         longkey2ShortMap.put("border_right", ConversionConstant.BORDER_RIGHT);
         longkey2ShortMap.put("border_top", ConversionConstant.BORDER_TOP);
         longkey2ShortMap.put("border_bottom", ConversionConstant.BORDER_BOTTOM);
         longkey2ShortMap.put("border_left_color", ConversionConstant.BORDER_LEFT_COLOR);
         longkey2ShortMap.put("border_right_color", ConversionConstant.BORDER_RIGHT_COLOR);
         longkey2ShortMap.put("border_top_color", ConversionConstant.BORDER_TOP_COLOR);
         longkey2ShortMap.put("border_bottom_color", ConversionConstant.BORDER_BOTTOM_COLOR);
         longkey2ShortMap.put("width", ConversionConstant.WIDTH);
         longkey2ShortMap.put("height", ConversionConstant.HEIGHT);
         longkey2ShortMap.put("address", ConversionConstant.RANGE_ADDRESS);
         longkey2ShortMap.put("startrowid", ConversionConstant.RANGE_STARTROWID);
         longkey2ShortMap.put("endrowid", ConversionConstant.RANGE_ENDROWID);
         longkey2ShortMap.put("startcolid", ConversionConstant.RANGE_STARTCOLID);
         longkey2ShortMap.put("endcolid", ConversionConstant.RANGE_ENDCOLID);
         longkey2ShortMap.put("repeatednum", ConversionConstant.REPEATEDNUM);
         longkey2ShortMap.put("styleid", ConversionConstant.STYLEID);
         longkey2ShortMap.put("columnid", ConversionConstant.COLUMNID_NAME);
         longkey2ShortMap.put("rowid", ConversionConstant.ROWID_NAME);
         longkey2ShortMap.put("colspan", ConversionConstant.COLSPAN);
         longkey2ShortMap.put("iscovered", ConversionConstant.ISCOVERED);
      }
      String shortKey = longkey2ShortMap.get(longKey);
      if(shortKey==null)
        shortKey = longKey;
      return shortKey;
  }
  
  private static void map2ShortKey(JSONObject obj)
  {
    JSONObject newObj = new JSONObject();
    Iterator<?> itor = obj.entrySet().iterator();
    while(itor.hasNext())
    {
        Map.Entry<?, ?> entry = (Map.Entry<?, ?>) itor.next();
        String key = (String)entry.getKey();
        Object value = entry.getValue();
        if(value instanceof JSONObject)
        {
          map2ShortKey((JSONObject)value);
        }
        newObj.put(getShortKey(key), value);
    }
    obj.clear();
    obj.putAll(newObj);
  }
  
  /*
   * translate the spreadsheet meta data to use short key
   * it is called only once when load the legacy (prior to 1.0) spreadsheet json file
   */
  public static void mapMeta2ShortKey(JSONObject meta)
  {
    JSONObject rowsMetaInfo = (JSONObject) meta.get(ConversionConstant.ROWS);
    if(rowsMetaInfo!=null)
    {
      Iterator<?> itor = rowsMetaInfo.entrySet().iterator();
      while(itor.hasNext())
      {
          Map.Entry<?, ?> entry = (Map.Entry<?, ?>) itor.next();
          JSONObject value = (JSONObject)entry.getValue();
          map2ShortKey(value);
      }
    }
    JSONObject columnMetaInfo = (JSONObject) meta.get(ConversionConstant.COLUMNS);
    if(columnMetaInfo!=null)
    {
      Iterator<?> itor = columnMetaInfo.entrySet().iterator();
      while(itor.hasNext())
      {
          Map.Entry<?, ?> entry = (Map.Entry<?, ?>) itor.next();
          JSONObject value = (JSONObject)entry.getValue();
          map2ShortKey(value);
      }
    }
  }
  
  /*
   * translate the spreadsheet content data to use short key
   * it is called only once when load the legacy (prior to 1.0) spreadsheet json file
   */
  public static void mapReference2ShortKey(JSONObject reference)
  {
    JSONObject sheets = (JSONObject)reference.get("sheets");
    if(sheets==null)
      return;
    
    Iterator<?> sheetItor = sheets.entrySet().iterator();
    while(sheetItor.hasNext())
    {
      Map.Entry<?, ?> sheetEntry = (Map.Entry<?, ?>)sheetItor.next();
      JSONObject sheet = (JSONObject)sheetEntry.getValue();
      Iterator<?> rowItor = sheet.entrySet().iterator();
      while(rowItor.hasNext())
      {
        Map.Entry<?, ?> rowEntry = (Map.Entry<?, ?>)rowItor.next();
        JSONObject row = (JSONObject)rowEntry.getValue();
        Iterator<?> cellsItor = row.entrySet().iterator();
        while(cellsItor.hasNext())
        {
          Map.Entry<?, ?> cellsEntry = (Map.Entry<?, ?>)cellsItor.next();
          JSONObject cells = (JSONObject)cellsEntry.getValue();
          JSONArray rangeList = (JSONArray)cells.get("cells");
          for(int i=0;i<rangeList.size();i++)
          {
            JSONObject range = (JSONObject)rangeList.get(i);
            String type = (String)range.get(ConversionConstant.REFERENCE_TYPE);
            if(type.equals(ConversionConstant.CELL_REFERENCE) || type.equals(ConversionConstant.RANGE_REFERENCE))
            {
              map2ShortKey(range);
            }
          }
        }
      }
    }
  }

  /*
   * translate the spreadsheet content data to use short key
   * it is called only once when load the legacy (prior to 1.0) spreadsheet json file
   */
  public static void mapContent2ShortKey(JSONObject content)
  {
    JSONObject sheetsContent = (JSONObject) content.get(ConversionConstant.SHEETS);
    if(sheetsContent!=null)
    {
      Iterator<?> sheetItor = sheetsContent.entrySet().iterator();
      while(sheetItor.hasNext())
      {
        Map.Entry<?, ?> sheetEntry = (Map.Entry<?, ?>)sheetItor.next();
        JSONObject sheet = (JSONObject)sheetEntry.getValue();
        Iterator<?> rowItor = sheet.entrySet().iterator();
        while(rowItor.hasNext())
        {
          Map.Entry<?, ?> rowEntry = (Map.Entry<?, ?>)rowItor.next();
          JSONObject row = (JSONObject)rowEntry.getValue();
          Iterator<?> cellItor = row.entrySet().iterator();
          while(cellItor.hasNext())
          {
            Map.Entry<?, ?> cellEntry = (Map.Entry<?, ?>)cellItor.next();
            JSONObject cell = (JSONObject)cellEntry.getValue();
            map2ShortKey(cell);
          }
        }
      }
    }
    JSONObject styles = (JSONObject) content.get(ConversionConstant.STYLES);
    if(styles!=null)
    {
      Iterator<?> styleIter = styles.entrySet().iterator();
      while (styleIter.hasNext())
      {
        Map.Entry<?, ?> entry = (Map.Entry<?, ?>)styleIter.next();
        JSONObject obj = (JSONObject)entry.getValue();
        fitBetaDraftFormatStyle(obj);
        map2ShortKey(obj);
      }
    }
    JSONObject names = (JSONObject) content.get(ConversionConstant.NAME_RANGE);
    if(names!=null)
    {
      Iterator<?> itor = names.entrySet().iterator();
      while (itor.hasNext())
      {
        Map.Entry<?, ?> entry = (Map.Entry<?, ?>)itor.next();
        JSONObject range = (JSONObject)entry.getValue();
        map2ShortKey(range);
      }
    }
    JSONObject unnames = (JSONObject) content.get(ConversionConstant.UNNAME_RANGE);
    if(unnames!=null)
    {
      Iterator<?> itor = unnames.entrySet().iterator();
      while (itor.hasNext())
      {
        Map.Entry<?, ?> entry = (Map.Entry<?, ?>)itor.next();
        JSONObject range = (JSONObject)entry.getValue();
        map2ShortKey(range);
      }
    }
  }
  
  /*
   * fit beta draft
   * "format":{"category":"","ncategory":"number","zcategory":"text","code":"","currency":"","ncurrency":"","zcurrency":""}
   * ==>
   * "format":{"category":";number;text;","code":"","currency":";;;"}
   * @param styleObject
   */
  private static void fitBetaDraftFormatStyle(JSONObject obj) {
      
      JSONObject tmp = (JSONObject)obj.get("format");
      if(tmp == null || tmp.isEmpty())
      	return;
      
      String pCode = "";
      String nCode = "";
      String zCode = "";
      String tCode = "";
      
		String code = (String) tmp.remove(ConversionConstant.FORMATCODE);
		String cate = (String) tmp.remove(ConversionConstant.FORMATCATEGORY);
		String ncate = (String) tmp.remove(ConversionConstant.FORMATCATEGORY_NEGATIVE);
		String zcate = (String) tmp.remove(ConversionConstant.FORMATCATEGORY_ZERO);
		String tcate = "";
		String cur = (String) tmp.remove(ConversionConstant.FORMATCURRENCY);
		String ncur = (String) tmp.remove(ConversionConstant.FORMATCURRENCY_NEGATIVE);
		String zcur = (String) tmp.remove(ConversionConstant.FORMATCURRENCY_ZERO);
		String tcur = "";
		
		String[] codeArray = code.split(";", 4);
		int len = codeArray.length;
		String retCode = codeArray[0];
		String retCate = cate;
		String retCur = cur;
		
		if (len == 2) {
			if (isTextFormat(codeArray[len - 1])) { //	"#.0;@@"
				pCode = nCode = zCode = codeArray[0];
				tCode = codeArray[1];
				
				cate = (cate != null) ? cate : "number";
				ncate = zcate = cate;
				tcate = "text";	//format as text when user enter string
				
				cur = (cur != null) ? cur : "";
				ncur = (ncur != null) ? ncur : cur;
				zcur = (zcur != null) ? zcur : cur;
				tcur = "";
			} else {	//	"#.0;#.00"
				pCode = zCode = codeArray[0];
				nCode = codeArray[1];
				
				zcate = cate = (cate != null) ? cate : "number"; //	";#.0" ==> cate = zcate = number, ncate = number
				ncate = (ncate != null) ? ncate : "number";
				tcate = ""; //format as text when user enter string
				
				zcur = cur = (cur != null) ? cur : "";
				ncur = (ncur != null) ? ncur : "";
				tcur = "";
			}
		} else if (len == 3) {
			if (isTextFormat(codeArray[len - 1])) {	//	"hh-mm-ss;#.0;@@"
				pCode = zCode = codeArray[0];
				nCode = codeArray[1];
				tCode = codeArray[2];
				
				zcate = cate = (cate != null) ? cate : "number";
				ncate = (ncate != null) ? ncate : "number";
				tcate = "text";
				
				zcur = cur = (cur != null) ? cur : "";
				ncur = (ncur != null) ? ncur : cur;
				tcur = "";
			} else {	//	"#.0;#.00%;#.000"
				pCode = codeArray[0];
				nCode = codeArray[1];
				zCode = codeArray[2];
				
				cate = (cate != null) ? cate : "number";
				zcate = (zcate != null) ? zcate : "number";
				ncate = (ncate != null) ? ncate : "number";
				tcate = "";	//format as text when user enter string
				
				cur = (cur != null) ? cur : "";
				ncur = (ncur != null) ? ncur : cur;
				zcur = (zcur != null) ? zcur : "";
				tcur = "";
			}
		} else if(len == 4){
			pCode = codeArray[0];
			nCode = codeArray[1];
			zCode = codeArray[2];
			tCode = codeArray[3];
			
			cate = (cate != null) ? cate : "number";
			zcate = (zcate != null) ? zcate : "number";
			ncate = (ncate != null) ? ncate : "number";
			tcate = (tcate != null) ? tcate : "text";	
			
			cur = (cur != null) ? cur : "";
			ncur = (ncur != null) ? ncur : "";
			zcur = (zcur != null) ? zcur : "";
			tcur = (tcur != null) ? tcur : "";
		}
		
		if(len >= 2){
			retCode = pCode + ";" + nCode + ";" + zCode + ";" + tCode;
			retCate = cate + ";" + ncate + ";" + zcate + ";" + tcate;
			retCur = cur + ";" + ncur + ";" + zcur + ";" + tcur;
		}
		if((retCur != null) && (retCur.indexOf(";;;") == -1))
			tmp.put(ConversionConstant.FORMATCODE, retCode);
		else
			tmp.put(ConversionConstant.FORMATCODE, "");
		if((retCur != null) && (retCur.indexOf(";;;") == -1))
			tmp.put(ConversionConstant.FORMATCATEGORY, retCate);
		else
			tmp.put(ConversionConstant.FORMATCATEGORY, "");
		
		if((retCur != null) && (retCur.indexOf(";;;") == -1))
			tmp.put(ConversionConstant.FORMATCURRENCY, retCur);

	}
	
	private static boolean isTextFormat(String codeItem) {
		String replaced = codeItem.replace("[\\].","");
		Matcher m = pattern.matcher(replaced);
		return m.find();
	}

  /**
   * remove the oo formula category
   * 
   * @param formula
   * @return
   */
  public static String removeOOFormulaCategory(String formula)
  {
    for (int i = 0; i < ooFormulaCategory.length; i++)
    {
      String prefix = ooFormulaCategory[i];
      formula = formula.replace(prefix, "");
      formula = formula.replace(prefix.toUpperCase(), "");
    }
    return formula;
  }

  /**
   * get repeat number form xml str from ods file
   * 
   * @param str
   * @return
   */
  public static int getRepeatNum(String str)
  {
    if (str == null)
      return 0;
    int rn = 0;
    String[] s = str.split(" ");
    for (int i = 0; i < s.length; i++)
    {
      String tmp = s[i];
      if (tmp.startsWith("table:number-columns-repeated="))
      {
        String v = tmp.substring("table:number-columns-repeated=".length());
        v = v.replaceAll("\"", "");
        try
        {
          rn = Integer.parseInt(v) - 1;
        }
        catch (NumberFormatException e)
        {
        }
      }
    }
    return rn;
  }
  
  /**
   * only the valid formula reference can be generated as range formula token
   * 1) CELL reference, such as Sheet1!A1, A1
   * 2) RANGE reference, such as Sheet1!A1:B2 $A1:B$2
   * 3) COLUMN/ROW reference, such as Sheet1!A:B, 1:2, Sheet1!#REF!, #REF!
   * although Sheet1!#REF! is valid reference, but do not put it in reference.js because do not need to transform it
   * notice that Sheet1!A:#REF!, #REF!:#REF! are all treated as invalid reference.
   * @return
   */
  public static boolean isValidFormulaRef(ReferenceParser.ParsedRef parsedRef){
    if(parsedRef == null)
      return false;
    if(ReferenceParser.ParsedRefType.CELL == parsedRef.type || ReferenceParser.ParsedRefType.RANGE == parsedRef.type
        || isValidWholeRowColRef(parsedRef))
      return true;
    return false;
  }
  
  public static boolean isValidWholeRowColRef(ReferenceParser.ParsedRef parsedRef){
    if((ReferenceParser.ParsedRefType.ROW == parsedRef.type && parsedRef.endRow != null //Sheet1!A or Sheet1!1 or Sheet1!A:#REF! is not allowed for formula ref
            && (!ConversionConstant.INVALID_REF.equals(parsedRef.startRow) && !ConversionConstant.INVALID_REF.equals(parsedRef.endRow) ))
        || (ReferenceParser.ParsedRefType.COLUMN == parsedRef.type && parsedRef.endCol != null
            && (!ConversionConstant.INVALID_REF.equals(parsedRef.startCol) && !ConversionConstant.INVALID_REF.equals(parsedRef.endCol) )))
      return true;
    return false;
  }
  
  public static JSONObject getPreservedCommentTaskRanges(File sourceTmpFolder) throws JsonParseException, IOException
  {
    File contentFile = new File(sourceTmpFolder.getAbsolutePath() + File.separator + "content.js");
    DraftScanner ds = new DraftScanner();
    ds.scan(contentFile);
    JSONObject ranges = ds.getPreserveRanges();
    return ranges;
  }

  public static String getVersionFinal(Class classe)
  {
    String version = null;
    String shortClassName = classe.getName().substring(classe.getName().lastIndexOf(".") + 1);
    try
    {
      ClassLoader cl = classe.getClassLoader();
      String threadContexteClass = classe.getName().replace('.', '/');
      URL url = cl.getResource(threadContexteClass + ".class");
      if (url == null)
      {
        version = shortClassName + " $ (no manifest)";
      }
      else
      {
        String path = url.getPath();
        String jarExt = ".jar";
        int index = path.indexOf(jarExt);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
        if (index != -1)
        {
          String jarPath = path.substring(0, index + jarExt.length());
          File file = new File(jarPath);
          String jarVersion = file.getName();
          JarFile jarFile = new JarFile(new File(new URI(jarPath)));
          JarEntry entry = jarFile.getJarEntry("META-INF/MANIFEST.MF");
          version = shortClassName + " $ " + jarVersion.substring(0, jarVersion.length() - jarExt.length()) + " $ "
              + sdf.format(new Date(entry.getTime()));
          jarFile.close();
        }
        else
        {
          File file = new File(path);
          version = shortClassName + " $ " + sdf.format(new Date(file.lastModified()));
        }
      }
    }
    catch (Exception e)
    {
      version = shortClassName + " $ " + e.toString();
    }
    return version;
  }
  /**
   * Compares two versions.
   * 
   * @param version1
   *          the first version
   * @param version2
   *          the second version
   * @return an int < 0 if version1 is less than version2, 0 if they are equal, and > 0 if version1 is greater
   */
  public static int compareVersion(String version1, String version2)
  {
    String versions1[] = version1.split("\\.");
    String versions2[] = version2.split("\\.");
    int length = 0;
    if (versions1.length > versions2.length)
    {
      length = versions2.length;
    }
    else
    {
      length = versions1.length;

    }
    for (int i = 0; i < length; i++)
    {
      int v1 = Integer.parseInt(versions1[i]);
      int v2 = Integer.parseInt(versions2[i]);
      if (v1 == v2)
        continue;
      return v1 - v2;
    }
    return versions1.length - versions2.length;
  }
  // ------ tool functions below to preserve unreadable text string ---------
  
  private static byte[] unzipBytes(byte[] inputdata) 
  {
    try {
      Inflater decompressor = new Inflater();
      decompressor.setInput(inputdata);
      ByteArrayOutputStream bos = new ByteArrayOutputStream(inputdata.length);
      byte[] buf = new byte[1024];
      while (!decompressor.finished()) {
        int count = decompressor.inflate(buf);
        bos.write(buf, 0, count);
  
      }
      bos.close();
      return bos.toByteArray();
    } catch (Exception e) {      e.printStackTrace();
    }  // ignore error
    return null;
  }
  public static byte[] compress(byte[] data) throws IOException {  
    Deflater deflater = new Deflater();  
    deflater.setInput(data);  
    
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);   
        
    deflater.finish();  
    byte[] buffer = new byte[1024];   
    while (!deflater.finished()) {  
     int count = deflater.deflate(buffer); // returns the generated code... index  
     outputStream.write(buffer, 0, count);   
    }  
    outputStream.close();  
    byte[] output = outputStream.toByteArray();  
    
    deflater.end();
    return output;  
   }  
  public static String ZIPStringToHexString(String str)
  {
    byte[] bytes;
    try
    {
      bytes = compress(str.getBytes("UTF-8"));
      return DatatypeConverter.printHexBinary(bytes);
    }
    catch (IOException e) {} // ignore error
    return "";
    
  }
  public static String HEXZIPStringToString(String hexStr)
  {
    try {
      byte[] bytes = DatatypeConverter.parseHexBinary(hexStr);
      byte[] unzippedBytes = unzipBytes(bytes);
      return new String(unzippedBytes, "UTF-8");
    } catch (Exception e) {}  // ignore error
    return "";
  }

}
