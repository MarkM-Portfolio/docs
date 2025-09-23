/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import symphony.org.w3c.tidy.DomUtil;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.image.ImageUtil;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODFDrawingParser;
import com.ibm.symphony.conversion.service.common.util.OdfElementUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ShapeConvertor extends HtmlConvertor
{

  static Set<String> formalParentNodeType = new HashSet<String>();
  static
  {
    formalParentNodeType.add(HtmlCSSConstants.P);
    formalParentNodeType.add(HtmlCSSConstants.DIV);
    formalParentNodeType.add(HtmlCSSConstants.SPAN);
    formalParentNodeType.add(HtmlCSSConstants.BODY);
  }

  static Set<String> unUsedImgStyle = new HashSet<String>();
  static
  {
    unUsedImgStyle.add("background-color");
    unUsedImgStyle.add("margin");
    unUsedImgStyle.add("padding");
    unUsedImgStyle.add("padding-left");
    unUsedImgStyle.add("padding-right");
    unUsedImgStyle.add("padding-top");
    unUsedImgStyle.add("padding-bottom");
    unUsedImgStyle.add("margin-left");
    unUsedImgStyle.add("margin-right");
    unUsedImgStyle.add("margin-top");
    unUsedImgStyle.add("margin-bottom");
  }

  Logger log = Logger.getLogger(ShapeConvertor.class.getName());

  public static class ShapeParameters
  {
    OdfElement drawGElement = null;

    Map<String, String> alignMap = new HashMap<String, String>();

    List<Element> paragraphs = new ArrayList<Element>();

    public Map<String, String> getAlignMap()
    {
      return alignMap;
    }

    public void setAlignMap(Map<String, String> alignMap)
    {
      this.alignMap = alignMap;
    }

    public List<Element> getParagraphs()
    {
      return paragraphs;
    }

    public void setParagraphs(List<Element> paragraphs)
    {
      this.paragraphs = paragraphs;
    }

    public OdfElement getDrawGElement()
    {
      return drawGElement;
    }

    public void setDrawGElement(OdfElement drawGElement)
    {
      this.drawGElement = drawGElement;
    }

    boolean hasText = false;

    OdfStyle graphicStyle = null;

    public OdfStyle getGraphicStyle()
    {
      return graphicStyle;
    }

    public void setGraphicStyle(OdfStyle graphicStyle)
    {
      this.graphicStyle = graphicStyle;
    }

    public boolean hasText()
    {
      return hasText;
    }

    public void setHasText(boolean hasText)
    {
      this.hasText = hasText;
    }

    String anchorType = "";

    String _type = "";

    Node coordinate = null;

    public Node getCoordinate()
    {
      return coordinate;
    }

    public void setCoordinate(Node coordinate)
    {
      this.coordinate = coordinate;
    }

    public String get_type()
    {
      return _type;
    }

    public void set_type(String _type)
    {
      this._type = _type;
    }

    public String getAnchorType()
    {
      return anchorType;
    }

    public void setAnchorType(String anchorType)
    {
      this.anchorType = anchorType;
    }

    public String x, y, w, h = "";

    public double left_delta, top_delta = 0.0;

    private void set2DefaultValue()
    {
      x = "";
      y = "";
      w = "";
      h = "";
      left_delta = 0.0;
      top_delta = 0.0;
    }

    String shapeId = null;

    public String getShapeId()
    {
      return shapeId;
    }

    public void setShapeId(String shapeId)
    {
      this.shapeId = shapeId;
    }
  }

  public static OdfStyle getGraphicStyle(ConversionContext context, OdfElement element)
  {
    OdfOfficeAutomaticStyles autoStyles = null;
    OdfStyle graphicStyle = null;
    try
    {
      String contentDom = (String) context.get("contentRootNode");
      if (contentDom != null && contentDom.equals(ODFConstants.OFFICE_TEXT))
      {
        autoStyles = (OdfOfficeAutomaticStyles) ((OdfDocument) context.get("source")).getContentDom().getAutomaticStyles();
      }
      else
      {
        autoStyles = (OdfOfficeAutomaticStyles) ((OdfDocument) context.get("source")).getStylesDom().getAutomaticStyles();
      }
      String styleName = element.getAttribute("draw:style-name");
      graphicStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Graphic);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return graphicStyle;
  }

  private void applyShapeId(Element image, String shapeId)
  {
    if (image != null && shapeId != null)
    {
      HtmlConvertorUtil.setAttribute(image, "_shapeid", shapeId, false);
    }
  }

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Map<String, Object> groupRelatedParams = HtmlConvertorUtil.getGroupRelatedParameters(element);
    String anchorType = (String) groupRelatedParams.get("anchortype");
    String zIndex = (String) groupRelatedParams.get("zindex");
    String contentDom = (String) context.get("contentRootNode");
    if (context.get("CurrentListRoot") != null || contentDom == null || !contentDom.equals(ODFConstants.OFFICE_TEXT))
    {
      if (context.get("CurrentListRoot") == null || !anchorType.equals("as-char"))
        return;
    }
    // create a file to store the converted png and svg files.
    OdfStyle graphicStyle = getGraphicStyle(context, element);
    ShapeParameters params = new ShapeParameters();
    params.setGraphicStyle(graphicStyle);
    createPictureFile(context, element);
    params.set_type((String) parent.getAttribute("_type"));
    Document doc = (Document) context.getTarget();
    OdfToHtmlIndex indexTable = context.getOdfToHtmlIndexTable();
    Element locationDiv = null;
    try
    {
      locationDiv = HtmlConvertorUtil.getLocationDiv(context, element, parent, anchorType);
      HtmlConvertorUtil.appendLocationDiv2Parent(context, parent, locationDiv);
    }
    catch (Exception e1)
    {
      e1.printStackTrace();
    }
    /**
     * if (parent.getAttribute("_type") != null && !((String) parent.getAttribute("_type")).equals("")) {
     * params.setShapeId(parent.getAttribute(HtmlCSSConstants.ID)); applyShapeId(parent, params.getShapeId()); } else { if (locationDiv !=
     * null) { params.setShapeId(locationDiv.getAttribute(HtmlCSSConstants.ID)); } }
     * 
     * if (locationDiv != null) { applyShapeId(locationDiv, params.getShapeId()); }
     */

    this.setPageWidthHeight(context);
    try
    {
      this.convertODF2PNGByPres(context, element, locationDiv, params);
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Faild to convert the shape to png", e);
    }
    Element htmlNode = (Element) locationDiv.getLastChild();
    if (htmlNode == null || htmlNode.getNodeName().equals(HtmlCSSConstants.DIV))
    {
      parent.removeChild(parent.getLastChild());
      params.set2DefaultValue();
      return;
    }
    if (GroupShapeConvertor.isUnderGroup(context))
    {
      convertGroupedShape(context, element, params, doc, locationDiv, groupRelatedParams, anchorType, zIndex, htmlNode);
      return;
    }
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    String[] sizes = parseImageStyle(context, element, htmlNode, locationDiv, params);
    convertTextOnShape(doc, context, element, sizes, params);
    combineAndReplaceImgWithText(context, params, htmlNode);
    HtmlConvertorUtil.setPostionByAnchorType(context, locationDiv, htmlNode, element, anchorType);
    HtmlConvertorUtil.normalizeDiv(context, parent, locationDiv, false, anchorType, null);
    convertALTText(context, element,htmlNode, locationDiv);
    postConvert(context, element, parent, params, locationDiv, htmlNode, sizes);
  }

  private static void convertALTText(ConversionContext context, OdfElement element, Node htmlNode, Element locationDiv)
  {
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node node = children.item(i);

      if(node instanceof OdfElement)
      {
        OdfElement child = (OdfElement) node;
        if (child.getNodeName().equals(ODFConstants.SVG_TITLE))
        {
          HtmlConvertorUtil.setAttribute(((Element) htmlNode),HtmlCSSConstants.ALT, child.getTextContent());
          return;
        }
        else if (child.getNodeName().equals(ODFConstants.ODF_ELEMENT_SVGDESC))
        {
          HtmlConvertorUtil.setAttribute((Element) htmlNode, HtmlCSSConstants.ALT, child.getTextContent());
          return;
        }
        else if (child.getNodeName().equals(ODFConstants.DRAW_ENHANCED_GEOMETRY))
        {
          HtmlConvertorUtil.setAttribute((Element) htmlNode, HtmlCSSConstants.ALT, child.getAttribute(ODFConstants.DRAW_TYPE));
          return;
        }
      }
    }
  }

  private void convertGroupedShape(ConversionContext context, OdfElement element, ShapeParameters params, Document doc,
      Element locationDiv, Map<String, Object> groupRelatedParams, String anchorType, String zIndex, Element htmlNode)
  {
    String[] shapeAttribute = getShapeAttribute(context, element, params);
    if (htmlNode != null && ((String) htmlNode.getAttribute("style")).indexOf("z-index") == -1)
      HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.STYLE, htmlNode.getAttribute(HtmlCSSConstants.STYLE) + "z-index:" + zIndex
          + ";");
    params.setAnchorType(anchorType);

    convertTextOnShape(doc, context, element, shapeAttribute, params);
    if (params.hasText())
    {
      BufferedImage bi = combineTextAndImg(context, params, htmlNode);
      ImageUtil.addToImageList(context, shapeAttribute[0], shapeAttribute[1], shapeAttribute[2], shapeAttribute[3], zIndex, bi);
    }
    else
      ImageUtil.addToImageList(context, shapeAttribute[0], shapeAttribute[1], shapeAttribute[2], shapeAttribute[3], zIndex,
          htmlNode.getAttribute(HtmlCSSConstants.SRC), true);
    locationDiv.removeChild(htmlNode);
    OdfStyle drawGGraphicStyle = getGraphicStyle(context, (OdfElement) groupRelatedParams.get("drawg"));
    HtmlConvertorUtil.setHeightAccordingWrapOption(context, shapeAttribute[1], shapeAttribute[3], locationDiv, drawGGraphicStyle,
        params.getAnchorType(), true);
  }

  private void postConvert(ConversionContext context, OdfElement element, Element parent, ShapeParameters params, Element locationDiv,
      Element htmlNode, String[] sizes)
  {
    // if the shape is in a table , set the div style with width and height
    if (context.get("WrapOption") != "run-through")
      handleShapeInTable(locationDiv, parent, sizes, params);
    params.set2DefaultValue();
    params.setHasText(false);
    htmlNode.removeAttribute(HtmlCSSConstants.ID);// regenerate id with body id.
    HtmlConvertorUtil.addEntryByOdfNode(context, element, htmlNode);
    // apply _shapeId to image node, _shapeId equals image id
    params.setShapeId(htmlNode.getAttribute(HtmlCSSConstants.ID));
    applyShapeId(htmlNode, params.getShapeId());

    String src = htmlNode.getAttribute(HtmlCSSConstants.SRC);
    if (src.indexOf("Copy-") == -1)
    {
      if (src.indexOf("Pictures") != -1)
        src = src.substring(9);
      String sourceImgFile = context.get("targetFolder") + File.separator + "Pictures" + File.separator + src;
      String movedSourceImgFile = context.get("targetFolder") + File.separator + "Pictures" + File.separator + "shape" + File.separator
          + src;
      File sourceFile = new File(sourceImgFile);
      File movedSourceFile = new File(movedSourceImgFile);
      sourceFile.renameTo(movedSourceFile);
      HtmlConvertorUtil.setAttribute(htmlNode, "src", htmlNode.getAttribute("src").substring(0, 9) + "shape/" + src);
      HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.CKE_SAVED_SRC, htmlNode.getAttribute("src").substring(0, 9) + "shape/"
          + src);
    }
    else if (src != null && !src.equals(""))
      HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.CKE_SAVED_SRC, src);
    HtmlConvertorUtil.flatten(context, element, htmlNode);
  }

  private void createPictureFile(ConversionContext context, OdfElement element)
  {
    File targetFolder = (File) context.get("targetFolder");
    File pictureDir = new File(targetFolder.getPath() + File.separator + "Pictures");
    if (!pictureDir.exists())
      pictureDir.mkdirs();

    File pictureDir1 = new File(targetFolder.getPath() + File.separator + "Pictures" + File.separator + "shape");
    if (!pictureDir1.exists())
      pictureDir1.mkdirs();
    try
    {
      OdfElement drawFillImage = ConvertUtil.getDrawFillImage((OdfDocument) context.getSource(), element);
      if (drawFillImage != null)
        HtmlConvertorUtil.updateImageDirAndCopyImageToDraftFolder(context, drawFillImage.getAttribute(ODFConstants.XLINK_HREF),
            drawFillImage);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, e.getMessage(), e);
    }

  }

  private void handleShapeInTable(Element parent, Element paragraph, String[] sizes, ShapeParameters params)
  {
    if (paragraph.getParentNode().getNodeName().equals(HtmlCSSConstants.TD))
    {
      String parentStyle = (String) parent.getAttribute("style");
      if (sizes[0].equals(""))
        sizes[0] = "0cm";
      if (sizes[1].equals(""))
        sizes[1] = "0cm";
      String tolWidth = "", tolHeight = "", curWidth = sizes[0], curHeight = sizes[1];
      if (parentStyle.indexOf("height") != -1 && parentStyle.indexOf("width") != -1)
      {
        String[] cmSplits = parentStyle.split("cm");
        double preWidth = 0, preHeight = 0;
        for (int j = 0; j < cmSplits.length; j++)
        {
          String child = cmSplits[j];
          if (child.indexOf("width:") != -1)
          {
            preWidth = Double.parseDouble(child.substring(child.indexOf("width:") + 6));
            parentStyle = parentStyle.replace("width", "preWidth");
          }
          else if (child.indexOf("height:") != -1)
          {
            preHeight = Double.parseDouble(child.substring(child.indexOf("height:") + 7));
            parentStyle = parentStyle.replace("height", "preHeight");
          }
        }
        double currY = Double.parseDouble(curHeight.split("cm")[0]) + Double.parseDouble(sizes[2].split("cm")[0]);
        if (preHeight < currY)
          tolHeight = String.valueOf(currY) + "cm";
        double currX = Double.parseDouble(curWidth.split("cm")[0]) + Double.parseDouble(sizes[3].split("cm")[0]);
        if (preWidth < currX)
          tolWidth = String.valueOf(currX) + "cm";
      }
      // the first time to set the current shape width and height to the secondDiv
      else
      {
        if (parentStyle.indexOf("height") == -1)
          HtmlConvertorUtil.setAttribute(parent, "style", parentStyle + "height:" + curHeight + ";");
        if (parentStyle.indexOf("width") == -1)
          HtmlConvertorUtil.setAttribute(parent, "style", parentStyle + "width:" + curWidth + ";");
      }
      // only if the current width and height is larger than before, set them to the secondDiv
      if (!tolHeight.equals(""))
        HtmlConvertorUtil.setAttribute(parent, "style", parent.getAttribute("style") + "height:" + tolHeight + ";");
      if (!tolWidth.equals(""))
        HtmlConvertorUtil.setAttribute(parent, "style", parent.getAttribute("style") + "width:" + tolWidth + ";");
      stripDrawFrameDivHeight(parent);
    }
  }

  private void stripDrawFrameDivHeight(Element parent)
  {
    NodeList nodeList = parent.getChildNodes();
    for (int i = 0; i < nodeList.getLength(); i++)
    {
      Node node = nodeList.item(i);
      if (node.getNodeName().equals(HtmlCSSConstants.DIV) && ((Element) node).getAttribute("class").indexOf("shape") == -1)
      {
        String style = ((String) ((Element) node).getAttribute("style"));
        style = style.replace("height:", "");
        HtmlConvertorUtil.setAttribute(((Element) node), "style", style);
      }
    }
  }

  private boolean isInchOfTransform(OdfElement element)
  {
    boolean isInchOfTransform = false;
    String transform = element.getAttribute(ODFConstants.DRAW_TRANSFORM);
    if (null != transform && !transform.equals(""))
    {
      if (transform.split("translate").length == 2)
      {
        String translate = transform.split("translate")[1];
        int start = translate.indexOf("(");
        int end = translate.indexOf(")");
        translate = translate.substring(start + 1, end);
        String left = translate.split(" ")[0];
        // y = translate.split(" ")[1];
        if (UnitUtil.getUnit(left).toLowerCase().equals(Unit.INCH.abbr()))
          isInchOfTransform = true;
      }
    }
    return isInchOfTransform;
  }

  private boolean convertODF2PNGByPres(ConversionContext context, OdfElement element, Element parent, ShapeParameters params)
  {
    boolean isTransform = false;
    Document doc = (Document) context.getTarget();
    ODFDrawingParser drawingParser = new ODFDrawingParser(context, ((File) context.get("targetFolder")).getPath());
    JSONObject sizeMap = drawingParser.parse(element, parent, true);
    if (sizeMap.get("top") != null && sizeMap.get("left") != null)
    {
      if (isInchOfTransform(element))
      {
        params.x = UnitUtil.convertINToCM((String) sizeMap.get("left"));
        params.y = UnitUtil.convertINToCM((String) sizeMap.get("top"));
      }
      else
      {
        params.x = (String) sizeMap.get("left") + "cm";
        params.y = (String) sizeMap.get("top") + "cm";
      }
      isTransform = true;
    }
    if (sizeMap.get("width") != null && sizeMap.get("height") != null)
    {
      String width = (String) sizeMap.get("width");
      String height = (String) sizeMap.get("height");
      if (UnitUtil.getUnit(width).toLowerCase().equals(Unit.INCH.abbr()))
        params.w = UnitUtil.convertINToCM(width);
      else
        params.w = UnitUtil.convertPXToCM(width);
      if (UnitUtil.getUnit(height).toLowerCase().equals(Unit.INCH.abbr()))
        params.h = UnitUtil.convertINToCM(height);
      else
        params.h = UnitUtil.convertPXToCM(height);
    }

    return isTransform;
  }

  private void setPageWidthHeight(ConversionContext context)
  {
    context.put(ODFConstants.CONTEXT_TARGET_BASE, ((File) context.get("targetFolder")).getPath());
    OdfElement styles = null;
    String pageWidth, pageHeight;
    try
    {
      styles = (OdfElement) ((OdfDocument) context.get("source")).getStylesDom().getAutomaticStyles();
      OdfElement layout = null;
      for (int i = 0; i < styles.getChildNodes().getLength(); i++)
      {
        if (styles.getChildNodes().item(i).getNodeName().equals("style:page-layout"))
          layout = (OdfElement) styles.getChildNodes().item(i);
      }
      pageWidth = layout.getChildNodes().item(0).getAttributes().getNamedItem("fo:page-width").getNodeValue();
      pageHeight = layout.getChildNodes().item(0).getAttributes().getNamedItem("fo:page-height").getNodeValue();
      if (UnitUtil.getUnit(pageWidth).toLowerCase().equals(Unit.INCH.abbr()))
        pageWidth = UnitUtil.convertINToCM(pageWidth);
      if (UnitUtil.getUnit(pageHeight).toLowerCase().equals(Unit.INCH.abbr()))
        pageHeight = UnitUtil.convertINToCM(pageHeight);
      context.put(ODFConstants.CONTEXT_PAGE_WIDTH, pageWidth);
      context.put(ODFConstants.CONTEXT_PAGE_HEIGHT, pageHeight);
    }
    catch (Exception e1)
    {
      log.log(Level.INFO, "There is thrown exception when fetch the page-width or page-height value" + e1);
    }
  }

  private Element createDivElement(ConversionContext context, boolean isAbandon)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");
    Element div = doc.createElement(HtmlCSSConstants.DIV);
    HtmlConvertorUtil.setAttribute(div, "id", DOMIdGenerator.generate(bodyId));
    String adds = "";
    if (isAbandon)
      adds = "unselectableDiv";

    HtmlConvertorUtil.setAttribute(div, "class", "shape" + " " + adds, false);
    HtmlConvertorUtil.setAttribute(div, "unselectable", "on", false);
    HtmlConvertorUtil.setAttribute(div, "contenteditable", "false", false);
    return div;
  }

  private void convertTextOnShape(Document doc, ConversionContext context, OdfElement element, String[] sizes, ShapeParameters params)
  {
    Map<String, Object> map = recordCurrentContextParameters(context);
    NodeList children = element.getChildNodes();
    Element textDiv = createDivElement(context, true);
    String verticalAlign = "", horiAlign = "";
    try
    {
      OdfStyle graphicStyle = params.getGraphicStyle();
      if (graphicStyle.item(0).getAttributes().getNamedItem("draw:textarea-vertical-align") != null)
        verticalAlign = graphicStyle.item(0).getAttributes().getNamedItem("draw:textarea-vertical-align").getNodeValue();
      if (graphicStyle.item(0).getAttributes().getNamedItem("draw:textarea-horizontal-align") != null)
        horiAlign = graphicStyle.item(0).getAttributes().getNamedItem("draw:textarea-horizontal-align").getNodeValue();
      if (verticalAlign == null || verticalAlign.equals(""))
        verticalAlign = "middle";
      if (horiAlign == null || horiAlign.equals(""))
        horiAlign = "center";
      params.getAlignMap().put("verticalAlign", verticalAlign);
      params.getAlignMap().put("horiAlign", "center");
    }
    catch (Exception e3)
    {
      // TODO Auto-generated catch block
      log.log(Level.INFO, "The div convered from p was changed faild! The exception info is :" + e3);
    }
    String style = "display:table-cell;width:" + sizes[0] + ";height:" + sizes[1] + ";vertical-align:" + verticalAlign + ";";

    for (int i = 0; i < children.getLength(); i++)
    {
      Node node = children.item(i);
      if (node.getNodeName().equals(ODFConstants.TEXT_P))
      {
        for (int j = 0; j < node.getChildNodes().getLength(); j++)
        {
          Node pChild = node.getChildNodes().item(j);
          if (pChild.getNodeName().equals(ODFConstants.TEXT_SPAN))
          {
            for (int k = 0; k < pChild.getChildNodes().getLength(); k++)
            {
              Node spanChild = pChild.getChildNodes().item(k);
              if (spanChild.getNodeName().equals("#text"))
                if (null != spanChild.getNodeValue() && !spanChild.getNodeValue().equals(""))
                {
                  params.setHasText(true);
                  break;
                }
            }
          }
          else if (pChild.getNodeName().equals("#text"))
          {
            if (null != pChild.getNodeValue() && !pChild.getNodeValue().equals(""))
            {
              params.setHasText(true);
              break;
            }
          }
        }

        if (params.hasText())
        {
          IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(node);
          convertor.convert(context, node, textDiv);
          params.getParagraphs().add((Element) textDiv.getLastChild());
        }
      }
    }
    HtmlConvertorUtil.removeID(element);
    restoreCurrentContextParameters(context, map);
  }

  private static void combineAndReplaceImgWithText(ConversionContext context, ShapeParameters params, Element imgNode)
  {
    if (params.hasText())
    {
      Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context.get("InplaceStyle");
      String src = imgNode.getAttribute("src");
      if (src.indexOf("Pictures") != -1)
        src = src.substring(9);
      String sourceImgFile = context.get("targetFolder") + File.separator + "Pictures" + File.separator + src;
      String movedSourceImgFile = context.get("targetFolder") + File.separator + "Pictures" + File.separator + "shape" + File.separator
          + src;
      String targetImgFile = context.get("targetFolder") + File.separator + "Pictures" + File.separator + "shape" + File.separator
          + "Copy-" + src;
      File sourceFile = new File(sourceImgFile);
      File movedSourceFile = new File(movedSourceImgFile);
      sourceFile.renameTo(movedSourceFile);
      HtmlConvertorUtil.setAttribute(imgNode, "src", imgNode.getAttribute("src").substring(0, 9) + "shape/" + "Copy-" + src);
      ImageUtil.drawText(movedSourceFile, new File(targetImgFile), params.getParagraphs(), styles, params.getAlignMap());
    }
  }

  private static BufferedImage combineTextAndImg(ConversionContext context, ShapeParameters params, Element imgNode)
  {
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String src = imgNode.getAttribute("src");
    if (src.indexOf("Pictures") != -1)
      src = src.substring(9);
    String sourceImgFile = context.get("targetFolder") + File.separator + "Pictures" + File.separator + src;
    BufferedImage bi = null;
    try
    {
      bi = ImageIO.read(new File(sourceImgFile));
      Graphics2D g2d = (Graphics2D) bi.getGraphics();
      int width = bi.getWidth(null), height = bi.getHeight(null);
      ImageUtil.drawText(g2d, width, height, params.getParagraphs(), styles, params.getAlignMap());
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    return bi;
  }

  private Map<String, Object> recordCurrentContextParameters(ConversionContext context)
  {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("CurrentParagraph", context.get("CurrentParagraph"));
    map.put("CurrentOdfParagraph", context.get("CurrentOdfParagraph"));
    map.put("HasAddedP4Del", context.get("HasAddedP4Del"));
    map.put("WrapOption", context.get("WrapOption"));
    return map;
  }

  private void restoreCurrentContextParameters(ConversionContext context, Map<String, Object> map)
  {
    context.put("CurrentParagraph", map.get("CurrentParagraph"));
    context.put("CurrentOdfParagraph", map.get("CurrentOdfParagraph"));
    context.put("HasAddedP4Del", map.get("HasAddedP4Del"));
    context.put("WrapOption", map.get("WrapOption"));
  }

  private static String[] parseImageStyle(ConversionContext context, OdfElement element, Element htmlNode, Element parentDiv,
      ShapeParameters params)
  {
    // pare style for image tag

    String oldStyleValue = htmlNode.getAttribute(HtmlCSSConstants.STYLE);
    if (htmlNode.getAttribute("class").indexOf("shape") == -1)
      HtmlConvertorUtil.setAttribute(htmlNode, "class", "shape" + " " + htmlNode.getAttribute("class"));
    String _type = "shape";
    HtmlConvertorUtil.setAttribute(htmlNode, "_type", _type, false);
    StringBuilder imageStyle = new StringBuilder();
    stripUnusedStyle(oldStyleValue, imageStyle);

    String[] shapeAttribute = getShapeAttribute(context, element, params);
    String xPos = shapeAttribute[0];
    String yPos = shapeAttribute[1];
    String width = shapeAttribute[2];
    String height = shapeAttribute[3];
    imageStyle.append("left:");
    imageStyle.append(xPos);
    imageStyle.append(';');
    imageStyle.append("top:");
    imageStyle.append(yPos);
    imageStyle.append(';');
    if (width.length() > 0)
    {
      imageStyle.append("width:");
      imageStyle.append(width);
      imageStyle.append(';');
    }
    if (!"0cm".equals(height))
    {
      imageStyle.append("height:");
      imageStyle.append(height);
      imageStyle.append(';');
    }

    String zIndex = element.getAttribute(ODFConstants.DRAW_Z_INDEX);
    if (zIndex.length() > 0)
    {
      imageStyle.append("z-index:");
      imageStyle.append(zIndex);
      imageStyle.append(';');
    }
    HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.STYLE, imageStyle.toString());
    HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.NAME, element.getAttribute(ODFConstants.DRAW_NAME));
    // Caculate size for Parent Div
    HtmlConvertorUtil.setHeightAccordingWrapOption(context, yPos, height, parentDiv, params.getGraphicStyle(), params.getAnchorType(),
        false);
    return new String[] { width, height, yPos, xPos };
  }

  private static String[] getShapeAttribute(ConversionContext context, OdfElement element, ShapeParameters params)
  {
    String width = params.w, height = params.h;
    String xPos = element.getAttribute(ODFConstants.SVG_X);
    String xPos1 = element.getAttribute(ODFConstants.ODF_ATTR_SVG_X1);
    String xPos2 = element.getAttribute(ODFConstants.ODF_ATTR_SVG_X2);
    if (xPos.length() > 0 || (null != params.x && params.x.length() > 0))
    {
      if (xPos.length() <= 0)
      {
        xPos = params.x;
        params.x = "";
      }
      if (context.get("contentRootNode").equals("style:header"))
      {
        if (xPos.startsWith("-"))
          xPos = "0cm";
      }
    }
    else if (xPos1 != null && xPos2 != null && xPos1 != "" && xPos2 != "")
    {
      if (UnitUtil.getUnit(xPos1).toLowerCase().equals(Unit.INCH.abbr()))
        xPos1 = UnitUtil.convertINToCM(xPos1);
      if (UnitUtil.getUnit(xPos2).toLowerCase().equals(Unit.INCH.abbr()))
        xPos2 = UnitUtil.convertINToCM(xPos2).split("cm")[0];
      double doubleX1 = Double.parseDouble(xPos1.split("cm")[0]);
      double doubleX2 = Double.parseDouble(xPos2.split("cm")[0]);
      xPos = doubleX1 >= doubleX2 ? xPos2 : xPos1;
      // width = String.valueOf(Math.abs(doubleX1 - doubleX2))+"cm";
      // if(doubleX1 == doubleX2)

    }
    else
    {
      xPos = "0cm";
    }
    if (UnitUtil.getUnit(xPos).toLowerCase().equals(Unit.INCH.abbr()))
      xPos = UnitUtil.convertINToCM(xPos);
    if (xPos.indexOf("cm") == -1)
      xPos = xPos + "cm";

    String yPos = element.getAttribute(ODFConstants.SVG_Y);
    String yPos1 = element.getAttribute(ODFConstants.ODF_ATTR_SVG_Y1);
    String yPos2 = element.getAttribute(ODFConstants.ODF_ATTR_SVG_Y2);
    if (yPos.length() > 0 || (null != params.y && params.y.length() > 0))
    {
      if (yPos.length() <= 0)
      {
        yPos = params.y;
        params.y = "";
      }
      if (context.get("contentRootNode").equals("style:header"))
      {
        if (yPos.startsWith("-"))
          yPos = "0cm";
      }
    }
    else if (yPos1 != null && yPos2 != null && yPos1 != "" && yPos2 != "")
    {
      if (UnitUtil.getUnit(yPos1).toLowerCase().equals(Unit.INCH.abbr()))
        yPos1 = UnitUtil.convertINToCM(yPos1);
      if (UnitUtil.getUnit(yPos2).toLowerCase().equals(Unit.INCH.abbr()))
        yPos2 = UnitUtil.convertINToCM(yPos2);
      double doubleY1 = Double.parseDouble(yPos1.split("cm")[0]);
      double doubleY2 = Double.parseDouble(yPos2.split("cm")[0]);
      yPos = doubleY1 >= doubleY2 ? yPos2 : yPos1;
      // height = String.valueOf(Math.abs(doubleY1 - doubleY2))+"cm";
    }
    else
    {
      yPos = "0cm";
    }
    if (UnitUtil.getUnit(yPos).toLowerCase().equals(Unit.INCH.abbr()))
      yPos = UnitUtil.convertINToCM(yPos);
    if (yPos.indexOf("cm") == -1)
      yPos = yPos + "cm";

    if (width.equals(""))
      width = element.getAttribute(ODFConstants.SVG_WIDTH);

    if (width.length() > 0)
    {
      if (UnitUtil.getUnit(width).toLowerCase().equals(Unit.INCH.abbr()))
        width = UnitUtil.convertINToCM(width);
    }

    if (height.equals(""))
      height = element.getAttribute(ODFConstants.SVG_HEIGHT);
    if (height.length() > 0)
    {
      if (UnitUtil.getUnit(height).toLowerCase().equals(Unit.INCH.abbr()))
        height = UnitUtil.convertINToCM(height);
    }
    else
    {
      height = "0cm";
    }

    return new String[] { xPos, yPos, width, height };
  }

  private static void stripUnusedStyle(String oldStyleValue, StringBuilder imageStyle)
  {
    String[] values = oldStyleValue.split(";");
    for (int i = 0; i < values.length; i++)
    {
      if (!unUsedImgStyle.contains(values[i].split(":")[0]))
        imageStyle.append(values[i] + ";");
    }
  }
}
