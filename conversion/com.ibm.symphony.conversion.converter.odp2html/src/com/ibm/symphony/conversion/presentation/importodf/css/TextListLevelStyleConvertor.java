/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;

import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeMasterStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyleListLevelProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleBullet;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleImage;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.content.StyleMasterPageElementConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.g11n.OpenSymbolUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class TextListLevelStyleConvertor extends ODFStyleElementConvertor
{

  private final static String VERTICAL_POSITION = "0.2em"; // value for vertical position on background-position

  private final static int FO_WIDTH = 0;

  private final static int MIN_LABEL_WIDTH = 1;

  private final static int SPACE_BEFORE = 2;
  
  private final static double DEFAULT_PAGE_WIDTH = 25.4;

  /*
   * Convert <text:list-level-style-bullet>, <text:list-level-style-image>, <text:list-level-style-number> into :before pseudo element
   * styles
   * 
   * @param context - Conversion context pointer
   * 
   * @param element - ODF element to parse
   * 
   * @param output - style map to put the converted css styles into
   * 
   * @see
   * com.ibm.symphony.conversion.presentation.importodf.css.ODFStyleElementConvertor#doConvert(com.ibm.symphony.conversion.service.common
   * .ConversionContext, org.w3c.dom.Node, java.lang.Object)
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  @Override
  protected void doConvert(ConversionContext context, Node element, Object output)
  {

    boolean isBullet = true;
    boolean isImage = false;

    double[] values = new double[3];
    values[FO_WIDTH] = 0.0;
    values[MIN_LABEL_WIDTH] = 0.0;
    values[SPACE_BEFORE] = 0.0;

    String fontName = "";
    String url = "";
    String masterName = (String)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM);

    if (element instanceof OdfTextListLevelStyleImage)
    {
      isImage = true;
      isBullet = false;
    }
    
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) output;
    String styleName;
    if(masterName != null && masterName.length() > 0)
    	styleName = ".ML_"+ masterName;
    else
    	styleName = CSSConvertUtil.getStyleName(element, context); // ".I-lst-Lxx_ww-ww " (preceding period, with blank at end)

    // get the level we're processing
    int listLevel = 1;
    NamedNodeMap attributes = element.getAttributes();
    if (attributes != null)
    {
      Node txtLevelNode = attributes.getNamedItem(ODFConstants.TEXT_LEVEL);
      if (txtLevelNode != null)
        listLevel = Integer.valueOf(txtLevelNode.getNodeValue());
    }

    // Next, we need to get the font name before we can do some of our processing
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child instanceof OdfStyleTextProperties)
      {
        String childFontName = ((OdfElement) child).getAttribute(ODPConvertConstants.ODF_ATTR_FONT_FAMILY);
        if (childFontName != null && childFontName.length() > 0)
        {
          if ("StarSymbol".equalsIgnoreCase(childFontName))
            fontName = "OpenSymbol";
          else
            fontName = childFontName; // copy to member variable
        }
        break;
      }
    }
    
    // now build the style map name (without ":before" pseudo element)
    String styleMapName = "";
    boolean needsRtlSeparator = false;   
    if(masterName!=null && masterName.length() > 0){
    	styleMapName = styleName;
    }
    else   
    	styleMapName = CSSConvertUtil.buildCssListStyleName(ODPConvertConstants.HTML_ELEMENT_LI, styleName, listLevel);

    // build the name for the :before pseudo element
    StringBuilder tempBuf = new StringBuilder(styleMapName.trim());
    tempBuf.append(ODPConvertConstants.CSS_BEFORE);
    tempBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);

    // for bullets/numbers, create :before pseudo element
    String cssStyleMapName = tempBuf.toString();
    String lstStyleMapName = "";
    String lstMRStyleMapName = "";
    if(masterName == null || masterName.length() == 0){
    	if(cssStyleMapName.startsWith(".lst-")){ // in concord donwloaded odp, may occur this condition
    		lstStyleMapName = cssStyleMapName;
    		cssStyleMapName = cssStyleMapName.replaceFirst("lst-", "IL_");
    	}
    	else
    		lstStyleMapName = cssStyleMapName.replaceFirst("IL_", "lst-");
    	lstMRStyleMapName = lstStyleMapName.replaceFirst("lst-", "lst-MR-");
    }


    Map<String, String> lstStyleMap = CSSConvertUtil.getStyleMap(lstStyleMapName, styles);
    Map<String, String> styleMap = CSSConvertUtil.getStyleMap(cssStyleMapName, styles);
    //Map<String, String> lstMRStyleMap = CSSConvertUtil.getStyleMap(lstMRStyleMapName, styles);

    // If it's not empty, we've already built the styles, don't need to do it again
    if (!styleMap.isEmpty())
      return;

    if (!isImage)
    {
    	if(lstStyleMapName.length() > 0){
    		// always add "white-space:pre"
    		lstStyleMap = CSSConvertUtil.getStyleMap(lstStyleMapName, styles);
    		lstStyleMap.put(ODPConvertConstants.CSS_WHITE_SPACE, ODPConvertConstants.CSS_PRE);
    		lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND, ODPConvertConstants.HTML_VALUE_NONE);
    		lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, ODPConvertConstants.HTML_VALUE_NONE);
    		lstStyleMap.put(ODPConvertConstants.ODF_ATTR_STYLE_DISPLAY, ODPConvertConstants.CSS_INLINE);

    	}
    	else{
    		styleMap.put(ODPConvertConstants.CSS_WHITE_SPACE, ODPConvertConstants.CSS_PRE);
    		styleMap.put(ODPConvertConstants.CSS_BACKGROUND, ODPConvertConstants.HTML_VALUE_NONE);
        styleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, ODPConvertConstants.HTML_VALUE_NONE);
        styleMap.put(ODPConvertConstants.ODF_ATTR_STYLE_DISPLAY, ODPConvertConstants.CSS_INLINE);

    	}
    }

    // initialize the "content:" element in the :before pseudo element
    // [0] - prefix, [1] - bullet/number style, [2] - suffix
    String[] bpeContentAttr = { "", "", "" };

    if (attributes.getLength() > 0)
    {
      // process attributes
      for (int j = 0; j < attributes.getLength(); j++)
      {
        OdfAttribute attr = (OdfAttribute) attributes.item(j);
        String value = attr.getValue();

        // style:num-format
        if (ODPConvertConstants.ODF_STYLE_NUM_FORMAT.equals(attr.getNodeName()))
        {
          if (attr.getNodeValue().length() > 0)
          {
            // handle Japanese numbering format
            if (value.equals(ODPConvertConstants.JAPANESE_NUMBER_J1) || value.equals(ODPConvertConstants.JAPANESE_NUMBER_J2))
            {
              bpeContentAttr[1] = " attr(" + ODPConvertConstants.HTML_VALUES_TAG + ")";
            }
            else
            // normal number
            {
              // Format is of the form: I-lst-X (where X is number format (1,a,A,i,I))
              bpeContentAttr[1] = "attr(values)";
              needsRtlSeparator = true;
            }
          }
          isBullet = false;
        }

        // text:bullet-char
        else if (ODPConvertConstants.ODF_ATTR_TEXT_BULLET_CHAR.equals(attr.getNodeName()))
        {
          String tmpvalue ="";
          // use special mapping table for OpenSymbol font
          if (fontName.equalsIgnoreCase("OpenSymbol"))
          {
        	tmpvalue = OpenSymbolUtil.transformUnicode(value);
            bpeContentAttr[1] = " \"" + tmpvalue + "\"";
          }
          else
          {
        	tmpvalue = extractToUnicode(value);
            bpeContentAttr[1] = " \"" +  tmpvalue + "\"";
          }
          
          if(tmpvalue.contains("2022") && (fontName.equalsIgnoreCase("Webdings")||fontName.equalsIgnoreCase("Wingdings"))){
        	  fontName = "Arial";
          }
          needsRtlSeparator = true;
        }

        // style:num-prefix
        else if (ODPConvertConstants.ODF_ATTR_STYLE_NUM_PREFIX.equals(attr.getNodeName()))
        {
          // use special mapping table for OpenSymbol font
          if (fontName.equalsIgnoreCase("OpenSymbol"))
          {
            bpeContentAttr[0] = " \"" + OpenSymbolUtil.transformUnicode(value) + "\"";
          }
          else
          {
            bpeContentAttr[0] = " \"" + extractToUnicode(value) + "\"";
          }
        }

        // style:num-suffix
        else if (ODPConvertConstants.ODF_ATTR_STYLE_NUM_SUFFIX.equals(attr.getNodeName()))
        {
          // use special mapping table for OpenSymbol font
          if (fontName.equalsIgnoreCase("OpenSymbol"))
          {
            bpeContentAttr[2] = " \"" + OpenSymbolUtil.transformUnicode(value) + "\" \" \"";
          }
          else
          {
            bpeContentAttr[2] = " \"" + extractToUnicode(value) + "\" \" \"";
          }
          needsRtlSeparator = true;
        }

        // xlink:href
        else if (ODPConvertConstants.ODF_ATTR_XLINK_HREF.equals(attr.getNodeName()))
        {
        	url = value;
        }

        else
        {
          // nothing we need to process
        }
      } // end, process attributes

      if (!isImage)
      {
        // save the "content:" attribute from what we built
        String newContent = bpeContentAttr[0] + bpeContentAttr[1] + bpeContentAttr[2];
        if (newContent.length() > 0)
        {
        	String cssStyleMapNameRtl;
        	if(lstStyleMapName != null && lstStyleMapName.length()>0){
        		lstStyleMap = CSSConvertUtil.getStyleMap(lstStyleMapName, styles);
        		lstStyleMap.put(ODPConvertConstants.CSS_CONTENT, newContent); // create the content style
        		cssStyleMapNameRtl = lstStyleMapName.replaceFirst(ODPConvertConstants.CSS_BEFORE, 
        				ODPConvertConstants.CSS_RTL_QUALIFIER + ODPConvertConstants.CSS_BEFORE);
        	}else {
        		styleMap.put(ODPConvertConstants.CSS_CONTENT, newContent); // create the content style
        		cssStyleMapNameRtl = cssStyleMapName.replaceFirst(ODPConvertConstants.CSS_BEFORE, 
        				ODPConvertConstants.CSS_RTL_QUALIFIER + ODPConvertConstants.CSS_BEFORE);
        	}
          //add invisible RLM UCC 200F in order to prevent messing text and bullet in list item with 'rtl' direction          
          if(needsRtlSeparator) {
              Map<String, String> styleMapRtl = CSSConvertUtil.getStyleMap(cssStyleMapNameRtl, styles);
        	  styleMapRtl.put(ODPConvertConstants.CSS_CONTENT, newContent + "\" \\200F\"");
          }
        }
      }
    }

    //
    // now parse the children of the <text:list-level-style-xxx> element
    //

    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);

      // <style:list-level-properties> element
      if (child instanceof OdfStyleListLevelProperties)
      {
      		values = processListLevelStyleProperties(context, (OdfElement) child, styleMap, values, url, lstStyleMapName, lstMRStyleMapName, styles, isImage);

      }

      // <style:text-properties> element
      else if (child instanceof OdfStyleTextProperties)
      {
        processTextProperties(context, element, (OdfElement) child, styleMap, cssStyleMapName, isBullet, styles, listLevel, fontName, lstStyleMapName);
      }

    }

    // make sure we have text-align set for non-images - if not, set a default so the bullet/number is aligned correctly
    if (!isImage && !styleMap.containsKey(ODPConvertConstants.CSS_TEXT_ALIGN))
    {
      // default to "text-align:left"
      styleMap.put(ODPConvertConstants.CSS_TEXT_ALIGN, ODPConvertConstants.CSS_ATTR_LEFT);

    }
    
    double marginLeft_d = getMarginLeft(isImage, values);

    // lastly, generate a style map to use for the <li> to contain the non-pseudo element attributes.
    if(lstStyleMapName.length() > 0){
    	//buildLiCssStyle(context, lstStyleMapName, isImage, marginLeft_d);
    	HtmlConvertUtil.insertStyleToBodyFirst(context, lstStyleMapName);
    	HtmlConvertUtil.insertStyleToBodyFirst(context, cssStyleMapName);
    }
    else{
    	buildLiCssStyle(context, styleMapName, isImage, marginLeft_d, values[MIN_LABEL_WIDTH]);
    	HtmlConvertUtil.insertStyleToBodyFirst(context, cssStyleMapName);
    	HtmlConvertUtil.insertStyleToBodyFirst(context, styleMapName);
    }
    

    // all done
  }

  /*
   * Process the <style:text-properties> element
   * 
   * @param element - ODF element
   * 
   * @param child - ODF child element
   * 
   * @param styleMap - style map to add properties to
   * 
   * @param styleName - css style name (e.g. li.I-lst-L23:before)
   * 
   * @param isBullet - true if we are processing a bullet style
   * 
   * @param styles - list of styles in context
   * 
   * @param listLevel - current list level being processed
   */
  @SuppressWarnings("restriction")
  private void processTextProperties(ConversionContext context, Node element, OdfElement textProperties, Map<String, String> styleMap, String styleName,
      boolean isBullet, Map<String, Map<String, String>> styles, int listLevel, String fontName, String lstStyleMapName)
  {
    if (textProperties != null)
    {
      // set font-family
    	Map<String, String> lstStyleMap = CSSConvertUtil.getStyleMap(lstStyleMapName, styles);
      if (fontName.length() > 0)
      {
        String fontNameLower = fontName.toLowerCase();
        // add fall-back generic font family info in case the browser doesn't support the ODF font family
        if (!fontNameLower.contains("arial"))
          fontName += ",Arial";
        if (!fontNameLower.contains("sans-serif"))
          fontName += ",sans-serif";

        if(lstStyleMapName != null && lstStyleMapName.length() > 0){
      		lstStyleMap.put(ODPConvertConstants.CSS_FONT_FAMILY, fontName);
      		styleMap.put(ODPConvertConstants.CSS_FONT_FAMILY, fontName);
        }
        else
        	styleMap.put(ODPConvertConstants.CSS_FONT_FAMILY, fontName);
      }
      else{
        if(!isBullet){
        	if(lstStyleMapName != null && lstStyleMapName.length() > 0){
        		lstStyleMap.put(ODPConvertConstants.CSS_FONT_FAMILY, "Arial");
          }
          else
          	styleMap.put(ODPConvertConstants.CSS_FONT_FAMILY, "Arial");
        }
      }

      // set relative font-size of the bullet/number
      String fontSize = textProperties.getAttribute(ODPConvertConstants.ODF_ATTR_FONT_SIZE);
      if (fontSize.length() > 0)
      {
        double fontSize_d = Measure.extractNumber(fontSize);
        // First do a sanity check on the value. Defect 11935 documents that Symphony implemented the following
        // logic to tolerate bogus values - thus we will do the same.
        if (Double.compare(fontSize_d, 250.0) > 0 ||Double.compare(fontSize_d, 0)<=0)
        {
          fontSize_d = 100.0;
        }
//        if(lstStyleMapName != null && lstStyleMapName.length() > 0){
//      		lstStyleMap.put(ODPConvertConstants.CSS_FONT_SIZE, fontSize_d/100+"em");
//        }
//        styleMap.put(ODPConvertConstants.CSS_FONT_SIZE, fontSize_d/100+"em");
        styleMap.put(ODPConvertConstants.CSS_ABS_BULLET_FONT_SCALE, String.valueOf(fontSize_d/100));
        
//        String styleMapNameIE9p = ODPConvertConstants.CSS_CONCORD_IE9p_SLIDE_EDITOR_PREFIX_CLASS
//        + ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS + " " + lstStyleMapName;
//        Map<String, String> styleMapIE9p = CSSConvertUtil.getStyleMap(styleMapNameIE9p, styles);
//        styleMapIE9p.put(ODPConvertConstants.CSS_FONT_FAMILY, "");
//        String masterName = (String)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM);
//        if(isBullet && (masterName==null || masterName.length()==0)){
//        	styleMapIE9p.put(ODPConvertConstants.CSS_CONTENT, "\"\u2022\"");
//        }
//          + "em");
        // find the previous <text:list-level-style-xxx> if we're at level-2 or lower
//        double prevFontSize_d = 100.0;
//        if (listLevel > 1)
//        {
//          Node prevOdfSib = element.getPreviousSibling();
//          if (prevOdfSib != null)
//          {
//            NodeList children = prevOdfSib.getChildNodes();
//            for (int i = 0; i < children.getLength(); i++)
//            {
//              Node child = children.item(i);
//              if (child instanceof OdfStyleTextProperties)
//              {
//                String prevFontSize = ((OdfElement) child).getAttribute(ODPConvertConstants.ODF_ATTR_FONT_SIZE);
//                if (prevFontSize != null && prevFontSize.length() > 0)
//                {
//                  prevFontSize_d = Measure.extractNumber(prevFontSize);
//                }
//                break; // don't need to look at any more children
//              }
//            }
//          }
//        }
        // calculate the delta we need to use
//        fontSize_d = fontSize_d / prevFontSize_d;
//        if (Double.compare(fontSize_d, 1.0) != 0) // only need to create a stylemap if its not 100%
//        {
//          // font size delta is not 100%, need to create a style map for IE9 to set the new font size
//
//          String styleMapNameIE9p = ODPConvertConstants.CSS_CONCORD_IE9p_SLIDE_EDITOR_PREFIX_CLASS
//              + ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS + " " + styleName;
//          Map<String, String> styleMapIE9p = CSSConvertUtil.getStyleMap(styleMapNameIE9p, styles);
//          if (styleMapIE9p.isEmpty())
//          {
//            styleMapIE9p.put(ODPConvertConstants.CSS_FONT_SIZE, MeasurementUtil.formatDecimal(fontSize_d, 0)
//                + "em");
//            if (isBullet)
//            {
//              // add "vertical-align:middle" for bullets that aren't 100%
//              styleMapIE9p.put(ODPConvertConstants.CSS_VERTICAL_ALIGN, ODPConvertConstants.CSS_ATTR_MIDDLE);
//            }
//          }
//        }
      }

      // set color of the bullet/number
      String color = textProperties.getAttribute(ODPConvertConstants.ODF_ATTR_COLOR);
      if (color.length() > 0)
      {
        styleMap.put(ODPConvertConstants.CSS_FONT_COLOR, color);
        styleMap.put(ODPConvertConstants.CSS_ABS_BULLET_FONT_COLOR, color);
      }else{
        //black is default color
        styleMap.put(ODPConvertConstants.CSS_FONT_COLOR, "#000000");
        styleMap.put(ODPConvertConstants.CSS_ABS_BULLET_FONT_COLOR, "#000000");
      }
    }
  }

  /*
   * Process the <style:list-level-properties> element
   * 
   * @param context - Conversion context
   * 
   * @param child - ODF element
   * 
   * @param styleMap - style map to add properties to
   */
  @SuppressWarnings("restriction")
  private double[] processListLevelStyleProperties(ConversionContext context, OdfElement styleProperties, Map<String, String> styleMap,
      double[] values, String url, String lstStyleName, String lstMRStyleMapName, Map<String, Map<String, String>> styles, boolean isImage)
  {
    if (styleProperties != null)
    {
      values[FO_WIDTH] = -1.0;
      double foHeight = -1.0;

      NamedNodeMap attributes = styleProperties.getAttributes();

      if (attributes != null && attributes.getLength() > 0)
      {
        for (int j = 0; j < attributes.getLength(); j++)
        {
          Node attrNode = attributes.item(j);

          // get width
          if (attrNode.getNodeName().equals(ODPConvertConstants.ODF_ATTR_FO_WIDTH))
          {
            values[FO_WIDTH] = Measure.extractNumber(attrNode.getNodeValue());
          }
          else if (attrNode.getNodeName().equals(ODPConvertConstants.ODF_ATTR_FO_HEIGHT))
          {
            foHeight = Measure.extractNumber(attrNode.getNodeValue());
          }
          else if (attrNode.getNodeName().equals(OdfStyleListLevelProperties.MinLabelWidth.toString()))
          {
            values[MIN_LABEL_WIDTH] += Measure.extractNumber(attrNode.getNodeValue());
          }
          else if (attrNode.getNodeName().equals(OdfStyleListLevelProperties.MinLabelDistance.toString()))
          {
            values[MIN_LABEL_WIDTH] += Measure.extractNumber(attrNode.getNodeValue());
          }
          else if (attrNode.getNodeName().equals(OdfStyleListLevelProperties.SpaceBefore.toString()))
          {
            values[SPACE_BEFORE] = Measure.extractNumber(attrNode.getNodeValue());

          }
        }
      }
      
      //try to get margin-right(distance between bullet and text) value and percent

      double left = values[MIN_LABEL_WIDTH];
      if(left > 0 && values[FO_WIDTH] > 0)
      	left -= values[FO_WIDTH];
      else
      	left *= 0.8;
      if(left < 0)
      	left = 0;
      String masterName = (String)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM);
      double containerWidth_d = Measure.extractNumber(ODPConvertUtil.getContainerWidth(context));
      if(masterName != null && masterName.length() > 0){
      	String masterPageName = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
      	double master_containerWidth_d = getOutlineMasterWidth(context, masterPageName);
      	if(master_containerWidth_d > 0.0){
      		double margin_right = (left / master_containerWidth_d) * 100;
      		styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, MeasurementUtil.formatDecimal(margin_right) + ODPConvertConstants.SYMBOL_PERCENT);
      	}
      	else{
      		if(containerWidth_d > 0.0){
      			double margin_right = (left / containerWidth_d) * 100;
      			styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, MeasurementUtil.formatDecimal(margin_right) + ODPConvertConstants.SYMBOL_PERCENT);
      		}
      		else
      			styleMap.put(ODPConvertConstants.HTML_ATTR_ABS_MARGIN_RIGHT, MeasurementUtil.formatDecimal(left) + "cm");

      	}
      }else{
      	double margin_right = (left / containerWidth_d) * 100;
        Map<String, String> lstMRStyleMap = CSSConvertUtil.getStyleMap(lstMRStyleMapName, styles);
        lstMRStyleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, MeasurementUtil.formatDecimal(margin_right) + ODPConvertConstants.SYMBOL_PERCENT);
      }
      /* else if(isNumbering)
      	styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, MeasurementUtil.formatDecimal(margin_right - SPACE_BEFORE*2) + ODPConvertConstants.SYMBOL_PERCENT);
      else
      	styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, MeasurementUtil.formatDecimal(margin_right - SPACE_BEFORE) + ODPConvertConstants.SYMBOL_PERCENT);*/
      // Set background-size of the image. We assume that if we have a fo:width, we must be processing
      // an image. It should always be there for images, and never be there for bullets/numbers
      
      if (Double.compare(values[FO_WIDTH], -1.0) > 0)
      {
        // the only way to get the image to size correctly is to map the width from cm's to directly to
        // em's. Using a percent of the container doesn't work because that causes it to scale to
        // use the entire list item block. (If you specify the size as a percentage, the size is relative
        // to the width and height of the parent element - i.e. the <li>)
        //StringBuilder backgroundSize = new StringBuilder(Double.toString(values[FO_WIDTH]));
        //backgroundSize.append("em");
    	//d37579: [ODPConversion]Customized graphic bullet size still is kept after import into IBM docs for ppt file
    	//use the same size for image symbol. 0.183 0.183 & 1.083
        if (Double.compare(foHeight, -1.0) > 0)
        {
          if(lstStyleName != null && lstStyleName.length() > 0){
        		Map<String, String> lstStyleMap = CSSConvertUtil.getStyleMap(lstStyleName, styles);
          	if(url.length()>0){
          		lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, "url(" + url + ")");
          		//lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_SIZE, Double.toString(foHeight) + "em " + Double.toString(foHeight) +"em");
          		styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, 0 + ODPConvertConstants.SYMBOL_PERCENT);
          		lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_SIZE, "0.813em 0.813em");
          		lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_POSITION, "center center");
          		lstStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_REPEAT, "no-repeat");
          	}
          	lstStyleMap.put(ODPConvertConstants.ODF_ATTR_STYLE_DISPLAY, ODPConvertConstants.CSS_INLINE_BLOCK);
          	lstStyleMap.put(ODPConvertConstants.CSS_FONT_SIZE, "1");
          	//lstStyleMap.put(ODPConvertConstants.SVG_ATTR_WIDTH, Double.toString(values[FO_WIDTH])+"em");
          	lstStyleMap.put(ODPConvertConstants.SVG_ATTR_WIDTH, "1.083em");
          	lstStyleMap.put(ODPConvertConstants.CSS_CONTENT, "\"\\8\"");
          }
          else{
          	if(url.length()>0){
          		styleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, "url(" + url + ")");
          		//styleMap.put(ODPConvertConstants.CSS_BACKGROUND_SIZE, Double.toString(foHeight) + "em " + Double.toString(foHeight) +"em");
          		styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, 0 + ODPConvertConstants.SYMBOL_PERCENT);
          		styleMap.put(ODPConvertConstants.CSS_BACKGROUND_SIZE, "0.813em 0.813em");
          		styleMap.put(ODPConvertConstants.CSS_BACKGROUND_POSITION, "center center");
          		styleMap.put(ODPConvertConstants.CSS_BACKGROUND_REPEAT, "no-repeat");
          	}
          	styleMap.put(ODPConvertConstants.ODF_ATTR_STYLE_DISPLAY, ODPConvertConstants.CSS_INLINE_BLOCK);
          	styleMap.put(ODPConvertConstants.CSS_ABS_BULLET_FONT_SCALE, "1");
          	//styleMap.put(ODPConvertConstants.SVG_ATTR_WIDTH, Double.toString(values[FO_WIDTH])+"em");
          	styleMap.put(ODPConvertConstants.SVG_ATTR_WIDTH, "1.083em");
          	styleMap.put(ODPConvertConstants.CSS_CONTENT, "\"\\8\"");
          }
        }
      }
    }
    return values;
  }
  
  
  private double getOutlineMasterWidth(ConversionContext context, String draw_master_name){
  	String master_name = draw_master_name;
  	if(master_name.startsWith("u"))
  		master_name = master_name.replaceFirst("u", "_");
  	OdfOfficeMasterStyles masterStyles = ((OdfDocument) context.getSource()).getOfficeMasterStyles();
    NodeList list = masterStyles.getElementsByTagName(ODPConvertConstants.ODF_STYLE_MASTER_PAGE);
    if(list == null)
    	return 0.0;
    for (int i = 0; i < list.getLength(); i++)
    {
      OdfElement node = (OdfElement) list.item(i);
      if (node instanceof StyleMasterPageElement)
      {
      	String style_name = node.getAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
      	if(style_name !=null && style_name.equals(master_name)){
      		NodeList childList = node.getChildNodes();
      		if(childList == null)
      			return 0.0;
      		for(int j = 0; j < childList.getLength(); j++){
      			OdfElement childNode = (OdfElement) childList.item(j);
      			String pre_class = childNode.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
      			if(pre_class != null && pre_class.equals("outline")){
      				String width = childNode.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
      				if(width!=null && width.length()>0)
      					return Measure.extractNumber(width);
      			}
      		}
      	}
      }
    }
    return 0.0;
  }

  /*
   * Return unicode representation of the input string
   * 
   * @param str - String to convert
   * 
   * @return String - string in unicode
   */
  private String extractToUnicode(String str)
  {
    int count = str.codePointCount(0, str.length());
    StringBuilder sb = new StringBuilder(16);
    for (int i = 0; i < count; i++)
    {
      sb.append("\\");
      sb.append(String.format("%04x", str.codePointAt(i)));
    }

    String newStr = sb.toString();

    // special case "00ad". It's a "soft-hyphen" that isn't really supported on browsers - it could be hidden/not displayed.
    // we'll map it to a short hyphen character
    newStr = newStr.replaceAll("00ad", "002d");
    newStr = newStr.replaceAll("f06c", "2022");
    newStr = newStr.replaceAll("00a7", "2022");

    return newStr;
  }

  /*
   * Calculate the padding-left value that needs to be on the list item
   * 
   * @param isImage - indicator if we are processing an image
   * 
   * @return double - padding left value to use
   */
  private double getMarginLeft(boolean isImage, double[] values)
  {
    double marginLeft_d = values[SPACE_BEFORE]+values[MIN_LABEL_WIDTH];

    // we can't handle negative space-before, so adjust the label width (padding-left) to be the
    // difference between the minLabelWidth and text:space-before (defect 7189/7545)
    if (Double.compare(values[SPACE_BEFORE], -0.5) < 0)
    {
    	marginLeft_d = -0.5;
    }
    return marginLeft_d;

  }

  /*
   * Create css style for the non-pseudo element to hold the padding-left and text-indent information
   * 
   * @param context - conversion context
   * 
   * @param styleMapName - name of style map to create (e.g. "li.I-lst-Lxx_ww-ww")
   * 
   * @param isImage - indicator if we are processing an image
   * 
   * @param paddingLeft_d - padding left value to use
   */
  private void buildLiCssStyle(ConversionContext context, String styleMapName, boolean isImage, double marginLeft_d, double min_label_width)
  {
    Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
    Map<String, String> styleMap = CSSConvertUtil.getStyleMap(styleMapName, styles);
    String masterName = (String)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM);
    double containerWidth_d = 0.0;
    if(masterName != null && masterName.length() > 0){
    	String masterPageName = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    	containerWidth_d = getOutlineMasterWidth(context, masterPageName);
    }
    else
    	containerWidth_d = Measure.extractNumber(ODPConvertUtil.getContainerWidth(context));
    if(containerWidth_d <= 0)
    	containerWidth_d = DEFAULT_PAGE_WIDTH;
    styleMap.put(ODPConvertConstants.HTML_ATTR_ABS_LIST_MARGIN_LEFT, MeasurementUtil.formatDecimal(marginLeft_d) + "cm");
    double value = (marginLeft_d/containerWidth_d)*100;
    styleMap.put(ODPConvertConstants.HTML_ATTR_LIST_MARGIN_LEFT, MeasurementUtil.formatDecimal(value) + "%");
  	styleMap.put(ODPConvertConstants.HTML_ATTR_ABS_MIN_LABEL_WIDTH, MeasurementUtil.formatDecimal(min_label_width) + "cm");

  }

}
