/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html;

import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.GraphicsEnvironment;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.draw.OdfDrawFrame;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.element.draw.DrawCircleElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawConnectorElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawCustomShapeElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawEllipseElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawLineElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawMeasureElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPathElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPolygonElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPolylineElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawRectElement;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertorFactory;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.g11n.G11NFontFamilyUtil;

public class HtmlConvertUtil
{
  private static final String CLASS = HtmlConvertUtil.class.getName();

  @SuppressWarnings("unused")
  private static final Logger LOG = Logger.getLogger(CLASS);

  // Default Initial Capacity for the Position Attributes HashSet
  private static final int POSITION_ATTRIBUTES_SET_CAPACITY = (int) (8 * 1.33) + 1;

  /**
   * Set of Position type Attributes
   */
  private static final HashSet<String> cvPositionAttributes = new HashSet<String>(POSITION_ATTRIBUTES_SET_CAPACITY);
  static
  {
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_X);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_X1);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_X2);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_Y);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_Y1);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_Y2);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
    cvPositionAttributes.add(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT);
  }

  private static String getDrawFrameDirection(ConversionContext context, Node drawFrameElement)
  {
	  String direction = null;
	  String key = ((OdfDrawFrame)drawFrameElement).getPresentationStyleNameAttribute();
	  if(key == null)		
		  key = ((OdfDrawFrame)drawFrameElement).getDrawStyleNameAttribute();
	
	  while(key != null && key.length() > 0) {
			direction = getElementDirection(context, null, key);
			if(direction == null)
				key = getParentStyleName(key, context);
			else
				break;
	  }  
	  return direction;
  }
  
  private static String getElementDirection(ConversionContext context, Node element, String styleName)
  {
	  if(styleName == null)
		  styleName = HtmlConvertUtil.getStyleValue(element);
	  
	  return ((styleName != null) ? CSSConvertUtil.getAttributeValue(context,	
			  HtmlCSSConstants.DIRECTION, styleName) : null);
  }
  
    /*
     * Fetch resolved HTML 'direction' attribute value (ODP'writing-mode')
     * Inspects explicit element paragraph properties , if not found goes over draw frame styles hierarchy upwards
     * until it reaches the top 'standard' (default) style. If not found takes direction from 'page' ('default-style')
     * paragraph properties. Resolves "page" writing-mode value by 'page' style.
     * For table direction ignores 'page' writing-mode, however if no style towards upward hierarchy defines writing-mode,
     * takes it from 'page', all according to ODP specification
     */
  public static String getDirectionAttr(ConversionContext context, Node element, boolean isTableElement)
  {
	    String direction = null;
		//analyze paragraph style
		if (element != null)
			direction = getElementDirection(context, element, null);
		
		if(direction == null) {	
			//analyze draw frame style
			Node drawFrameElement = (Node) context.get(ODPConvertConstants.ODF_DRAW_FRAME_ELEMENT);
			if(drawFrameElement != null)
				direction = getDrawFrameDirection(context, drawFrameElement);
		}
		//resolve missing or page direction by default (page)
		if(direction == null || (ODFConstants.PAGE.equalsIgnoreCase(direction) && !isTableElement))
			direction = getElementDirection(context, null, ODPConvertConstants.ODF_STYLE_DEFAULT_NAME);
			
		return direction;
  }

  public static String getStyleValue(Node node)
  {
    return getStyleValue(node, ODPConvertConstants.ODF_ATTR_GENERAL_STYLE_NAME);
  }

  public static String getStyleValue(Node node, String pattern)
  {
    NamedNodeMap attrs = node.getAttributes();
    Node currItem = null;
    for (int i = 0; i < attrs.getLength(); i++)
    {
      currItem = attrs.item(i);
      if (currItem.getNodeName().endsWith(pattern))
        break;
      currItem = null;
    }
    if (currItem != null)
      return currItem.getNodeValue();
    return null;
  }

  public static boolean hasParentStyleName(Node node)
  {
    Node parentStyleAttr = node.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
    if (parentStyleAttr != null)
      return true;
    return false;
  }

  public static Node getParentStyleName(Node node)
  {
    Node parentStyleAttr = node.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
    return parentStyleAttr;
  }

  // mich - defect 2896, similarly to getParentStyleName, this method returns a StyleNameAttribute object, rather than the
  // style name as a string like the method's name seems to imply, it's however been named this way to stay in line with
  // getParentStyleName
  public static Node getStyleName(Node node)
  {
    Node styleAttr = node.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
    return styleAttr;
  }
  
  
  private static int getAttributeFromList(ConversionContext context, String styleName, String type){
  	String name = "";
  	if(styleName.startsWith("MP_"))
  		name = styleName.replaceFirst("MP_", "ML_");
  	else
  		return 0;
  	Node container = (Node) context.get(ODPConvertConstants.CONTEXT_PRESENTATION_STYLE_CONTAINER);
  	NodeList children = container.getChildNodes();
    int numNodes = children.getLength();
    for (int i = 0; i < numNodes; i++)
    {
      if(children.item(i).getAttributes().getNamedItem("id").getNodeValue().equals(name)){
      	Node attr = children.item(i).getAttributes().getNamedItem(type);
      	if(attr == null)
      		return 0;
      	String left = attr.getNodeValue();
      	if(left == null || left.isEmpty())
      		return 0;
      	else
      		return Integer.parseInt(left);
      }
    }
  	return 0;
  }
  
  
  private static boolean isContain(Node container, String styleName){
	  NodeList childList = container.getChildNodes();
	  for(int index = 0; index < childList.getLength(); index++){
		  Node item = childList.item(index);
		  if(item instanceof Element){
			  if(((Element)item).getAttribute("id").equalsIgnoreCase(styleName)){
				  return true;
			  }
		  }
	  }
	  return false;
  }
  
  
  public static void insertStyleToBodyFirst(ConversionContext context, String styleName){
  	Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
  	Map<String, String> usedStyleMap;
  	if(styleName.startsWith("."))
  		usedStyleMap = CSSConvertUtil.getStyleMap(styleName, styles);
  	else
  		usedStyleMap = CSSConvertUtil.getStyleMap("."+styleName, styles);

  		if(usedStyleMap.isEmpty())
			return;
		Node container = (Node) context.get(ODPConvertConstants.CONTEXT_PRESENTATION_STYLE_CONTAINER);
		if(container == null)
			return;  //this maybe happened when load master object, no need add these style, due to can not edit
		
		if(styleName.startsWith("."))
			styleName = styleName.substring(1);
		// TODO: maybe it's better to trim when generating styleName
		if(isContain(container, styleName.trim()))
			return;
		Element elem = container.getOwnerDocument().createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
		elem.setAttribute("id", styleName.trim()); // no ending space is allowed in editor
		boolean bUsed = false;
		Iterator<Map.Entry<String, String>> itr = usedStyleMap.entrySet().iterator();
		int value = 0;
		boolean flag = false, flag2 = false;
		while(itr.hasNext())
		{
			Map.Entry<String,String> entry = itr.next();
			if(entry.getKey().startsWith("abs-")){
				if(entry.getValue().endsWith("cm")){
					value = (int)(Measure.extractNumber(entry.getValue())*1000);
					if(entry.getKey().equals(ODPConvertConstants.HTML_ATTR_ABS_MARGIN_LEFT) 
							&& styleName.startsWith("MP_")){
						int left = getAttributeFromList(context, styleName, ODPConvertConstants.HTML_ATTR_ABS_LIST_MARGIN_LEFT);
						value += left;
						flag = true;
					}
					if(entry.getKey().equals(ODPConvertConstants.HTML_ATTR_ABS_TEXT_INDENT) 
							&& styleName.startsWith("MP_")){
						int min_label_width = getAttributeFromList(context, styleName, ODPConvertConstants.HTML_ATTR_ABS_MIN_LABEL_WIDTH);
						value -= min_label_width;
						flag2 = true;
					}
					elem.setAttribute(entry.getKey(), String.valueOf(value));
				}
				else{
					if(entry.getKey().equals(ODPConvertConstants.CSS_ABS_BULLET_FONT_COLOR)){
						String color = entry.getValue();
						elem.setAttribute(entry.getKey(), color);
					}else if(entry.getKey().equals(ODPConvertConstants.CSS_ABS_BULLET_FONT_SCALE)){
						String scale = entry.getValue();
						elem.setAttribute(entry.getKey(), scale);
					}
					else if(entry.getKey().equals("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT)){
						String scale = entry.getValue();
						elem.setAttribute(entry.getKey(), scale);
					}
					else{
						value = (int)Measure.extractNumber(entry.getValue());
						elem.setAttribute(entry.getKey(), String.valueOf(value));
					}
				}
				
				bUsed = true;
			}
		}
		if(bUsed){
			if(styleName.startsWith("MP_") && !flag){
				int left = getAttributeFromList(context, styleName, ODPConvertConstants.HTML_ATTR_ABS_LIST_MARGIN_LEFT);
				if(left != 0){
					elem.setAttribute(ODPConvertConstants.HTML_ATTR_ABS_MARGIN_LEFT, String.valueOf(left));
				}
			}
			if(styleName.startsWith("MP_") && !flag2){
				int left = getAttributeFromList(context, styleName, ODPConvertConstants.HTML_ATTR_ABS_MIN_LABEL_WIDTH);
				if(left != 0){
					elem.setAttribute(ODPConvertConstants.HTML_ATTR_ABS_TEXT_INDENT, String.valueOf(-left));
				}
			}
			container.appendChild(elem);
		}
  }
  
  
  
  public static void copyMasterGeneralStyle(String masterName, String preName, ConversionContext context){
		String newClassName = masterName + "_" + preName + "_1";
		//This function is used to copy non-outline pre class, so there is no level, default set 1
		String retStyleMapName = "MP_"+newClassName;
		Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
		Map<String, String> usedStyleMap = CSSConvertUtil.getStyleMap("."+retStyleMapName, styles);
		if(!usedStyleMap.isEmpty())
			return; 
		String parStyleName = masterName + "-" + preName;
		Map<String, String> parStyleMap = 
				CSSConvertUtil.getContextCSSClassStyleMap(context, parStyleName);
		if(parStyleMap == null || parStyleMap.isEmpty()){
			//System.out.println("error! master:"+masterName+"  pre:"+preName);
			return;
		}
		Iterator<Map.Entry<String, String>> itr = parStyleMap.entrySet().iterator();
		while(itr.hasNext()){
			Map.Entry<String,String> entry = itr.next();
			if(!entry.getKey().startsWith("font-size")
					&& !entry.getKey().equalsIgnoreCase("min-height"))
				usedStyleMap.put(entry.getKey(), entry.getValue());
		}
		//add to body first here
		insertStyleToBodyFirst(context, retStyleMapName);
  }
  
  
  /**
	 * Add new merged paragraph master class to css style map, and return class name
	 * @param className
	 * @return
	 */
	public static boolean mergeParagraphMasterClass(String masterName, String preName, int index, ConversionContext context){
		String newClassName = masterName + "_" + preName;
		String retStyleMapName = "MP_"+newClassName+"_"+index;
		Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
		Map<String, String> usedStyleMap = CSSConvertUtil.getStyleMap("."+retStyleMapName, styles);
		if(!usedStyleMap.isEmpty())
			return false; // already convert before, no need to convert again
		String parStyleName = masterName + "-" + preName + index;
		while(parStyleName.length() > 0){
			Map<String, String> parStyleMap = 
					CSSConvertUtil.getContextCSSClassStyleMap(context, parStyleName);
			if(parStyleMap == null)
				return false;   //if here, check it, maybe something wrong
			Iterator<Map.Entry<String, String>> itr = parStyleMap.entrySet().iterator();
			while(itr.hasNext())
			{
				Map.Entry<String,String> entry = itr.next();
				if(!usedStyleMap.containsKey(entry.getKey()) && !entry.getKey().startsWith("padding-") 
						&& !entry.getKey().startsWith("font-size")){
					usedStyleMap.put(entry.getKey(), entry.getValue());
				}
			}
			parStyleName = getParentStyleName(parStyleName, context);
		}
		//add to body first here
		insertStyleToBodyFirst(context, retStyleMapName);
		return true;
	}
	
	
	private static String getParentStyleName(String className, ConversionContext context){
		if(className.startsWith("u"))
			className = className.replaceFirst("u", "_");
		List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(
				context, className);
		String parStyleName = "";
		if (nodeList != null && nodeList.size() > 0) {
			// Should only be a single style with this name
			Node styleNode = nodeList.get(0);
			Node parentNode = HtmlConvertUtil.getParentStyleName(styleNode);
			if(parentNode != null){
				parStyleName = parentNode.getNodeValue();
				if(parStyleName.startsWith("_"))
					parStyleName = parStyleName.replaceFirst("_", "u");
			}
		}
		return parStyleName;
	}
	
	
	
	public static void convertListMasterStyle(String masterName, String preName, ConversionContext context, int level){
		Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
		Node listMasterLevelStyle = null;
		String outlineStyleNameNew = masterName+"_"+preName;
		String outlineStyleName = masterName +"-"+preName;
		if(outlineStyleName == null || outlineStyleNameNew == null)
			return;
		listMasterLevelStyle = getListMasterLevelStyleNode(context, outlineStyleName, 
				level);
		if(listMasterLevelStyle == null)
			return;
		context.put(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM, outlineStyleNameNew+"_"+level);
		
		CSSConvertorFactory.getInstance().getConvertor(listMasterLevelStyle)
		.convert(context, listMasterLevelStyle, styles);
		context.remove(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM);
	}
	
	
	private static Node getListMasterLevelStyleNode(ConversionContext context,
			String odfMasterListStyleName, int listLevel){
		odfMasterListStyleName += "1";
		Node listLevelNode = null;
		if(odfMasterListStyleName.startsWith("u"))
			odfMasterListStyleName = odfMasterListStyleName.replaceFirst("u", "_");
		List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(
				context, odfMasterListStyleName);
		if (nodeList != null && nodeList.size() > 0) {
			// Should only be a single style with this name
			Node listStyle = nodeList.get(0);
			//<style:style style:name="Default-outline1" style:family="presentation">
			//    <style:graphic-properties draw:fill="none" draw:stroke="none">
			//        <text:list-style style:name="Default-outline1">
			//             <text:list-level-style-bullet text:bullet-char="." text:level="1">
			//we need get the  <text:list-level-style-bullet> this layer, now we are at <style:style>
			listStyle = listStyle.getFirstChild();
			if(listStyle == null || !(listStyle instanceof OdfStyleGraphicProperties))
				return null;
			listStyle = listStyle.getFirstChild();
			if(listStyle == null || !(listStyle instanceof OdfTextListStyle))
				return null;
			NodeList listLevels = listStyle.getChildNodes();

			int level = listLevel - 1;
			if (listLevels.getLength() < level) // shouldn't ever happen, but just to be safe
				level = 0;
			listLevelNode = listLevels.item(level);
		}
		return listLevelNode;
	}
  
  

  /**
   * Gets a list of the position type attributes that are on the node
   * 
   * @param node
   *          Node to search
   * @return List<Node> List of Position type Attributes
   */
  public static List<Node> getPosAttributes(Node node)
  {
    NamedNodeMap attrMap = node.getAttributes();

    int size = attrMap.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<Node> posList = new ArrayList<Node>(capacity);

    for (int i = 0; i < size; i++)
    {
      Node attr = attrMap.item(i);
      if (cvPositionAttributes.contains(attr.getNodeName()))
      {
        posList.add(attr);
      }
    }
    return posList;
  }
  

  public static String parsePosition(List<Node> attributes, boolean relative, ConversionContext context)
  {

    if (attributes == null || attributes.isEmpty())
      return null;
    StringBuilder posBuf = new StringBuilder(64);
    if (relative)
      posBuf.append(ODPConvertConstants.CSS_POSITION_RELATIVE);
    else
      posBuf.append(ODPConvertConstants.CSS_POSITION_ABSOLUTE);
    String tranformAttrName;
    String transformValue;
    String x1Value, x2Value, y1Value, y2Value, widthValue, heightValue;
    x1Value = x2Value = y1Value = y2Value = widthValue = heightValue = "";
    for (Node node : attributes)
    {
      if (node == null)
        continue;
      else
      {
        String nodeName = node.getNodeName();
        if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_X))
        {
          tranformAttrName = "left";
          transformValue = MeasurementUtil.convertCMToPercentage(node, context);
          if (transformValue != null && transformValue.length() > 0)
            posBuf.append(ODPConvertUtil.formatAttribute(tranformAttrName, transformValue));
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_Y))
        {
          tranformAttrName = "top";
          transformValue = MeasurementUtil.convertCMToPercentage(node, context);
          if (transformValue != null && transformValue.length() > 0)
            posBuf.append(ODPConvertUtil.formatAttribute(tranformAttrName, transformValue));
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_WIDTH))
        {
          widthValue = MeasurementUtil.convertCMToPercentage(node, context);
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT))
        {
          heightValue = MeasurementUtil.convertCMToPercentage(node, context);
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_X1))
        {
          x1Value = transformValue = MeasurementUtil.convertCMToPercentage(node, context);
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_X2))
        {
          x2Value = MeasurementUtil.convertCMToPercentage(node, context);
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_Y1))
        {
          y1Value = transformValue = MeasurementUtil.convertCMToPercentage(node, context);
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_SVG_Y2))
        {
          y2Value = MeasurementUtil.convertCMToPercentage(node, context);
        }
      }
    }
    if ((widthValue == null || widthValue.length() == 0) && (x1Value != null && x1Value.length() > 0) && (x2Value != null && x2Value.length() > 0))
    {
      widthValue = String.valueOf(MeasurementUtil.formatDecimal(Math.abs(Float.parseFloat(x2Value.substring(0, x2Value.length() - 1))
          - Float.parseFloat(x1Value.substring(0, x1Value.length() - 1)))))
          + "%";
      double leftValue = Math.min(Double.parseDouble(x1Value.substring(0, x1Value.indexOf("%"))),
          Double.parseDouble(x2Value.substring(0, x2Value.indexOf("%"))));
      posBuf.append(ODPConvertUtil.formatAttribute("left", String.valueOf(leftValue) + '%'));

    }
    if (widthValue != null && widthValue.length() > 0)
    {
      posBuf.append(ODPConvertUtil.formatAttribute("width", widthValue));
    }
    if ((heightValue == null || heightValue.length() == 0) && (y1Value != null && y1Value.length() > 0) && (y2Value != null && y2Value.length() > 0))
    {
      heightValue = String.valueOf(MeasurementUtil.formatDecimal(Math.abs(Float.parseFloat(y2Value.substring(0, y2Value.length() - 1))
          - Float.parseFloat(y1Value.substring(0, y1Value.length() - 1)))))
          + "%";
      double topValue = Math.min(Double.parseDouble(y1Value.substring(0, y1Value.indexOf("%"))),
          Double.parseDouble(y2Value.substring(0, y2Value.indexOf("%"))));
      posBuf.append(ODPConvertUtil.formatAttribute("top", String.valueOf(topValue) + '%'));
    }
    if (heightValue != null && heightValue.length() > 0)
    {
      posBuf.append(ODPConvertUtil.formatAttribute("height", heightValue));
    }
    return posBuf.toString();
  }

  public static boolean isShape(Node node)
  {
    return node instanceof DrawLineElement || node instanceof DrawRectElement || node instanceof DrawCircleElement
        || node instanceof DrawEllipseElement || node instanceof DrawCustomShapeElement || node instanceof DrawConnectorElement
        || node instanceof DrawPolylineElement || node instanceof DrawPolygonElement || node instanceof DrawPathElement
        || node instanceof DrawMeasureElement;
  }

  /**
   * Determines if the current element being processed is during Shape Processing
   * 
   * @param context
   *          Conversion context
   * 
   * @return boolean true if the Context contains the flag indicating Shape processing is in progress
   */
  public static boolean insideShape(ConversionContext context)
  {
    boolean isShape = false;
    try
    {
      isShape = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SHAPE);
    }
    catch (Exception e)
    {
      return false;
    }
    return isShape;
  }

  public static boolean isLineOrConnector(Node node)
  {
    return node instanceof DrawLineElement || node instanceof DrawConnectorElement || node instanceof DrawMeasureElement;
  }
  
  // FontMetricSingleton is a utility class that holds some convenient function calls to get font metrics informatoin.
  
  static public class FontMetricSingleton
  {
    private static final FontMetricSingleton instance = new FontMetricSingleton();

    private BufferedImage IMAGE = null;
    private Graphics GRAPHICS = null;

    private HashSet<String> fontList = null;
    private String defaultFont = "";
    private Map<String,String> fallbackMap = null;
    
    private FontMetricSingleton()
    {
      try
      {
        initialize();
      }
      catch(Exception e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, "FontMetricSingleton" + ".initialize");
        ODPCommonUtil.logException(Level.WARNING, message, e);
      }
    }
    
    private void initialize() throws Exception
    {
      IMAGE = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
      GRAPHICS = IMAGE.getGraphics();

      String fl[];
      fl = GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames();
      
      int buflen = 1;
      
      if ( (fl == null) || (fl.length == 0) )
      {
        ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_INSTALLED_FONT_LOOKUP_FAIL);
      }
      else
      {
        buflen = fl.length;

        // we intend arial to be the default but if it isn't present just
        // pick the first font to be the default
        defaultFont = fl[0];
      }
      
      fontList = new HashSet<String>(buflen);
      fallbackMap = Collections.synchronizedMap(new HashMap<String,String>(buflen));
      
      if (fl == null)
      {
        return; 
      }

      for (String font : fl)
      {
        fontList.add(font.toLowerCase());
      }
      
      if (fontList.contains(ODPConvertConstants.FONT_FAMILY_ARIAL.toLowerCase()))
      {
        defaultFont = ODPConvertConstants.FONT_FAMILY_ARIAL;
      }
    }
    
    public static FontMetricSingleton getInstance()
    {
      return instance;
    }
    
    /**
     * Returns the passed-in font argument if the font is installed on the system, otherwise will return the
     * first fallback font from the fallback font list configuration that is installed on the system. If no
     * font qualifies, then a static default is returned (arial).
     * 
     * @param font
     * @return
     */
    public String getInstalledFont(String font)
    {
      if (font == null || fontList == null || fontList.contains(font.toLowerCase()))
      {
        return font;
      }
      
      // If the font isn't installed, see if one of the fallback fonts is installed
      String fallback = getFallbackFont(font);
      if (fallback != null)
      {
        return fallback;
      }
      
      // wasn't cached so look it up now
      
      String fontlist = G11NFontFamilyUtil.getFontFamilyWithFallBack(font);
      if (fontlist != null && fontlist.length() > 0)
      {
        String[] fontv = fontlist.split(",");
        if (fontv != null && fontv.length > 1)
        {
          // skip the first one because it's always the original font
          for (int x = 1; x < fontv.length; x++)
          {
            // for some reason the fallback api wraps the font names in single quotes.
            // these need to be stripped.
            String tmp = fontv[x];
            int len = fontv[x].length();
            if (len <= 2)
              continue;
            
            tmp = tmp.substring(1,len - 1);
            
            if (fontList.contains(tmp.toLowerCase()))
            {
              saveFallbackFont(font,tmp);
              return tmp;
            }
          }
        }
      }
      
      return defaultFont;
    }
    
    /** 
     * returns the FontMetric data for the given font information. Note that if the font is not installed
     * on the system, default data is returned.
     * 
     * @param font
     * @param ptSize
     * @return
     * @throws Exception
     */
    public FontMetrics getFontMetrics(String font, int ptSize) throws Exception
    {
      Font f = new Font(font, Font.PLAIN, ptSize);
      FontMetrics fm = GRAPHICS.getFontMetrics(f);

      return fm;
    }
    
    private String getFallbackFont(String font)
    {
      return fallbackMap.get(font.toLowerCase());
    }
    
    private void saveFallbackFont(String font, String fallback)
    {
      fallbackMap.put(font.toLowerCase(), fallback);
    }
  }
}
