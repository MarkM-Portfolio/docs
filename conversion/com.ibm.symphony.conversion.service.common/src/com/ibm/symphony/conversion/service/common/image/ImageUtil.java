package com.ibm.symphony.conversion.service.common.image;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.font.FontRenderContext;
import java.awt.font.TextAttribute;
import java.awt.font.TextLayout;
import java.awt.font.TextMeasurer;
import java.awt.image.BufferedImage;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.text.AttributedString;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.imageio.ImageIO;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class ImageUtil
{
  private static Map<String, TextAttribute> textStyleNameMap = new HashMap<String, TextAttribute>();

  private static Map<TextAttribute, Object> textStyleValueMap = new HashMap<TextAttribute, Object>();
  static
  {
    textStyleNameMap.put("font-family", TextAttribute.FAMILY);
    textStyleNameMap.put("font-weight", TextAttribute.WEIGHT);
    textStyleNameMap.put("underline", TextAttribute.UNDERLINE);
    textStyleNameMap.put("color", TextAttribute.FOREGROUND);
    textStyleNameMap.put("font-size", TextAttribute.SIZE);
    textStyleNameMap.put("italic", TextAttribute.POSTURE);
    textStyleNameMap.put("line-through", TextAttribute.STRIKETHROUGH);
    textStyleNameMap.put("vertical-align", TextAttribute.SUPERSCRIPT);
  }
  static
  {
    textStyleValueMap.put(TextAttribute.WEIGHT, TextAttribute.WEIGHT_BOLD);
    textStyleValueMap.put(TextAttribute.POSTURE, TextAttribute.POSTURE_OBLIQUE);
    textStyleValueMap.put(TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON);
    textStyleValueMap.put(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_ON);
  }

  public static TextAttribute getTAStyleName(String styleName, Object styleValue)
  {
    TextAttribute taStyleName = textStyleNameMap.get(styleName);
    if (taStyleName == null)
    {
      if (styleName.equals("text-decoration"))
        taStyleName = textStyleNameMap.get(((String) styleValue).trim());
      if (styleName.equals("font-style"))
        taStyleName = textStyleNameMap.get(((String) styleValue).trim());
    }
    return taStyleName;
  }

  public static Object getTAStyleValue(TextAttribute taStyleName, Object styleValue)
  {
    Object taStyleValue = textStyleValueMap.get(taStyleName);
    if (taStyleValue == null)
    {
      if (taStyleName.equals(TextAttribute.FOREGROUND))
        taStyleValue = Color.decode(String.valueOf(styleValue).trim());
      else if (taStyleName.equals(TextAttribute.SIZE))
      {
        int indexOfPT = ((String) styleValue).indexOf("pt");
        if (indexOfPT != -1)
          taStyleValue = Double.parseDouble(((String) styleValue).substring(0, indexOfPT));
        else
          taStyleValue = Double.parseDouble(((String) styleValue));
      }
      else if (taStyleName.equals(TextAttribute.WEIGHT) && ((String) styleValue).trim().indexOf("normal") == -1)
        taStyleValue = textStyleNameMap.get(taStyleName);
      else if (taStyleName.equals(TextAttribute.FAMILY))
        taStyleValue = ((String) styleValue).split(",")[0];
      else if (taStyleName.equals(TextAttribute.SUPERSCRIPT))
      {
        if (((String) styleValue).equals("super"))
          taStyleValue = TextAttribute.SUPERSCRIPT_SUPER;
        else
          taStyleValue = TextAttribute.SUPERSCRIPT_SUB;
      }
    }
    return taStyleValue;
  }

  public static class TextDrawingParams
  {
    int textTotalHeight = 0, nextLineBreakIndex = 0, startIndex = 0;

    TextLayout preLayout = null, nextLayout = null;

    int totalAdvance = 0;

    String graphicHoriAlign = "", verticalAlign = "", paragraphHoriAlign = "";

    Node curNode = null;

    boolean hasBRInCurrentNode = false;

    public boolean isBRInCurrentNode()
    {
      return hasBRInCurrentNode;
    }

    public void setHasBRInCurrentNode(boolean hasBRInCurrentNode)
    {
      this.hasBRInCurrentNode = hasBRInCurrentNode;
    }

    public Node getCurNode()
    {
      return curNode;
    }

    public void setCurNode(Node curNode)
    {
      this.curNode = curNode;
    }

    public void setParagraphHoriAlign(String styleName, Map<String, Map<String, String>> styles)
    {
      this.setParagraphHoriAlign("center");
      /*
       * Map<String,String> style = styles.get(styleName); String paragraphAlign = style.get("text-align"); if(paragraphAlign != null &&
       * !paragraphAlign.equals("")) this.setParagraphHoriAlign(paragraphAlign);
       */
    }

    public String getGraphicHoriAlign()
    {
      return graphicHoriAlign;
    }

    public void setGraphicHoriAlign(String graphicHoriAlign)
    {
      this.graphicHoriAlign = graphicHoriAlign;
    }

    public String getVerticalAlign()
    {
      return verticalAlign;
    }

    public void setVerticalAlign(String verticalAlign)
    {
      this.verticalAlign = verticalAlign;
    }

    public String getParagraphHoriAlign()
    {
      return paragraphHoriAlign;
    }

    public void setParagraphHoriAlign(String paragraphHoriAlign)
    {
      this.paragraphHoriAlign = paragraphHoriAlign;
    }

    public int getStartIndex()
    {
      return startIndex;
    }

    public void setStartIndex(int startIndex)
    {
      this.startIndex = startIndex;
    }

    public int getTotalAdvance()
    {
      return totalAdvance;
    }

    public void setTotalAdvance(int totalAdvance)
    {
      this.totalAdvance = totalAdvance;
    }

    public int getNextLineBreakIndex()
    {
      return nextLineBreakIndex;
    }

    public void setNextLineBreakIndex(int nextLineBreakIndex)
    {
      this.nextLineBreakIndex = nextLineBreakIndex;
    }

    public TextLayout getNextLayout()
    {
      return nextLayout;
    }

    public void setNextLayout(TextLayout nextLayout)
    {
      this.nextLayout = nextLayout;
    }

    public int getTextTotalHeight()
    {
      return textTotalHeight;
    }

    public void setTextTotalHeight(int textTotalHeight)
    {
      this.textTotalHeight = textTotalHeight;
    }

    public TextLayout getPreLayout()
    {
      return preLayout;
    }

    public void setPreLayout(TextLayout preLayout)
    {
      this.preLayout = preLayout;
    }
  }

  public static void drawText(Graphics2D g2d, int width, int height, List<Element> paragraphs, Map<String, Map<String, String>> styles,
      Map<String, String> alignMap)
  {
    TextDrawingParams params = new TextDrawingParams();
    params.setGraphicHoriAlign(alignMap.get("horiAlign"));
    params.setVerticalAlign(alignMap.get("verticalAlign"));
    List<List<List<TextLayout>>> paragraphList = new ArrayList<List<List<TextLayout>>>();

    for (int i = 0; i < paragraphs.size(); i++)
    {
      List<List<TextLayout>> lineList = new ArrayList<List<TextLayout>>();
      Element paragraph = paragraphs.get(i);
      measureParagraph(g2d, width, height, paragraph, styles, params, lineList);
      paragraphList.add(lineList);
    }
    // draw text to buffered image
    drawText(g2d, width, height, params.getTextTotalHeight(), paragraphList, params);
  }

  public static void drawText(File imageFile, File targetFile, List<Element> paragraphs, Map<String, Map<String, String>> styles,
      Map<String, String> alignMap)
  {
    OutputStream out = null;
    try
    {
      BufferedImage bi = ImageIO.read(imageFile);
      Graphics2D g2d = (Graphics2D) bi.getGraphics();
      int width = bi.getWidth(null), height = bi.getHeight(null);
      drawText(g2d, width, height, paragraphs, styles, alignMap);
      out = new BufferedOutputStream(new FileOutputStream(targetFile));
      ImageIO.write(bi, "png", out);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    finally
    {
      if (out != null)
        try
        {
          out.close();
        }
        catch (IOException e)
        {

        }
    }
  }

  private static void measureParagraph(Graphics2D g2d, int width, int height, Element paragraph, Map<String, Map<String, String>> styles,
      TextDrawingParams params, List<List<TextLayout>> lineList)
  {
    Node node = paragraph.getFirstChild();
    params.setCurNode(node);
    String paragraphStyleName = paragraph.getAttribute("class");
    if (paragraphStyleName == null || paragraphStyleName.equals(""))
      paragraphStyleName = "default-style_paragraph";
    params.setParagraphHoriAlign(paragraphStyleName, styles);
    List<TextLayout> layoutList = new ArrayList<TextLayout>();
    int h = params.getTextTotalHeight();
    while (params.getCurNode() != null)
    {
      measureLine(g2d, width, params.getCurNode(), layoutList, params, paragraphStyleName, styles);
      if ((params.getTotalAdvance() == width || params.getCurNode() == null) && layoutList.size() > 0)
      {
        h += (layoutList.get(0).getAscent());
        h += layoutList.get(0).getDescent() + layoutList.get(0).getLeading();
        lineList.add(layoutList);
        layoutList = new ArrayList<TextLayout>();
        params.setTotalAdvance(0);
        params.setHasBRInCurrentNode(false);
      }
    }
    params.setTextTotalHeight(h);
  }

  private static void measureLine(Graphics2D g2d, int width, Node node, List<TextLayout> layoutList, TextDrawingParams params,
      String paragraphStyleName, Map<String, Map<String, String>> styles)
  {
    TextMeasurer measurer = createTextMeasurer(params, g2d, node, paragraphStyleName, styles);
    if (measurer == null)
    {
      params.setStartIndex(0);
      if (params.isBRInCurrentNode())
        params.setTotalAdvance(width);
      params.setCurNode(params.getCurNode().getNextSibling());
      return;
    }
    AttributedString as = getAttributedString(params, node);
    measureSpan(measurer, width, params, as, layoutList);
  }

  private static void measureSpan(TextMeasurer measurer, int width, TextDrawingParams params, AttributedString as,
      List<TextLayout> layoutList)
  {
    int start = params.getStartIndex();
    int lineBreakIndex = measurer.getLineBreakIndex(start, width);
    TextLayout layout = measurer.getLayout(start, lineBreakIndex);
    layoutList.add(layout);
    if (lineBreakIndex != as.getIterator().getEndIndex())
    {
      params.setTotalAdvance(width);
      params.setStartIndex(lineBreakIndex);
    }
    else
    {
      params.setStartIndex(0);
      Node nextNode = params.getCurNode().getNextSibling();
      params.setCurNode(nextNode);
    }
  }

  /*
   * private static void measureText(Graphics2D g2d, int width, int height, AttributedString as, AttributedString nextAs,String position,
   * TextMeasurer measurer,TextMeasurer nextMeasurer, List<List<Object>> layoutList,TextDrawingParams params) { int h =
   * params.getTextTotalHeight(),start = 0, lineBreakIndex = 0; float x = 0; TextLayout layout = null; boolean goToEnd = false,
   * isDrawFromNewLine = true; while (true) { float dx = 0; isDrawFromNewLine = true; if (!position.equals("begin") && start ==0 ) { layout
   * = params.getNextLayout(); lineBreakIndex = params.getNextLineBreakIndex(); if (lineBreakIndex == as.getIterator().getEndIndex())
   * goToEnd = true; int startIndex = params.getStartIndex(); if(goToEnd ) { if(!position.equals("end")) dx = measurerDxByNextLayout(width,
   * nextMeasurer,nextAs, params, layout,layoutList,position); else { if(startIndex >= 0) dx = calculateDxInEndPosition(width, layoutList,
   * params, layout, startIndex); } } else { if(startIndex == -1) { dx =
   * getDxByAlign(params,width,params.getPreLayout().getAdvance(),layout.getAdvance()) + params.getPreLayout().getAdvance(); } else {
   * params.setStartIndex(-1); dx = getDxByAlign(params,width,params.getTotalAdvance(),layout.getAdvance()); } } isDrawFromNewLine = false;
   * } else { lineBreakIndex = measurer.getLineBreakIndex(start, width); layout = measurer.getLayout(start, lineBreakIndex); if
   * (lineBreakIndex == as.getIterator().getEndIndex()) goToEnd = true; if (goToEnd && !position.equals("end") && nextMeasurer != null) { dx
   * = measurerDxByNextLayout(width, nextMeasurer,nextAs, params, layout,layoutList,position); } else { dx =
   * getDxByAlign(params,width,0,layout.getAdvance()); } h += (layout.getAscent()); h += layout.getDescent() + layout.getLeading(); }
   * List<Object> param = new ArrayList<Object>(); param.add(layout); param.add(x + dx); param.add(isDrawFromNewLine);
   * layoutList.add(param); start = lineBreakIndex; if (goToEnd) { params.setPreLayout(layout); params.setTextTotalHeight(h); break; } }
   * 
   * } private static float getDxByAlign(TextDrawingParams params, int width, float preAdvance, float curAdvance) { float dx; String
   * graphicHoriAlign = params.getGraphicHoriAlign(); String paragraphHoriAlign = params.getParagraphHoriAlign(); String align =
   * graphicHoriAlign; if(!paragraphHoriAlign.equals("")) { align = paragraphHoriAlign; } if(align.equals("left")) dx = preAdvance; else
   * if(align.equals("right")) dx = width - preAdvance - curAdvance; else dx = (width - preAdvance - curAdvance)/2; return dx; }
   */
  private static float getYByAlign(TextDrawingParams params, int height, float advance)
  {
    float y;
    String verticalAlign = params.getVerticalAlign();
    if (verticalAlign.equals("top"))
      y = 0;
    else if (verticalAlign.equals("bottom"))
      y = height - advance;
    else
      y = (height - advance) / 2;
    return y;

  }

  private static float getXByAlign(TextDrawingParams params, int width, float advance)
  {
    float x;

    String graphicHoriAlign = params.getGraphicHoriAlign();
    String paragraphHoriAlign = params.getParagraphHoriAlign();
    String align = graphicHoriAlign;
    if (!paragraphHoriAlign.equals(""))
    {
      align = paragraphHoriAlign;
    }
    if (align.equals("right"))
      x = width - advance;
    else if (align.equals("center"))
      x = (width - advance) / 2;
    else
      x = 0;
    return x;
  }

  /*
   * private static float calculateDxInEndPosition(int width, List<List<Object>> layoutList, TextDrawingParams params, TextLayout layout,
   * int startIndex) { float dx; dx = getDxByAlign(params,width,params.getTotalAdvance(),layout.getAdvance()); resetDx2LayoutList(dx,
   * startIndex, layoutList); dx =(dx + params.getTotalAdvance() - layout.getAdvance()); return dx; }
   * 
   * private static float measurerDxByNextLayout(int width, TextMeasurer nextMeasurer, AttributedString nextAs, TextDrawingParams params,
   * TextLayout layout, List<List<Object>> layoutList, String position) { float dx = params.getTotalAdvance(); int startIndex =
   * params.getStartIndex(); int nextLineBreakIndex = nextMeasurer.getLineBreakIndex(0, width - layout.getAdvance()); TextLayout nextLayout
   * = nextMeasurer.getLayout(0, nextLineBreakIndex); if(nextLineBreakIndex != nextAs.getIterator().getEndIndex()) { if(startIndex == -1) dx
   * = getDxByAlign(params,width,layout.getAdvance(),nextLayout.getAdvance()); else { dx = calculateDxInEndPosition(width, layoutList,
   * params, nextLayout, startIndex); } } else { if(startIndex == -1) { params.setStartIndex(layoutList.size());
   * params.setTotalAdvance(layout.getAdvance() + nextLayout.getAdvance()); } else params.setTotalAdvance(params.getTotalAdvance() +
   * nextLayout.getAdvance()); dx = -1; } params.setNextLineBreakIndex(nextLineBreakIndex); params.setNextLayout(nextLayout); return dx; }
   * private static void resetDx2LayoutList(float dx, int startIndex, List<List<Object>> layoutList) { float preAdvance = 0; for(int
   * i=startIndex; i<layoutList.size();i++) { List<Object> list = layoutList.get(i); TextLayout tl = (TextLayout)list.get(0); list.set(1,
   * dx+preAdvance); preAdvance += tl.getAdvance(); } } private static String getPosition(int i, int max) { if(i == 0) return "begin"; else
   * if(i == max) return "end"; else return "middle"; }
   */
  private static TextMeasurer createTextMeasurer(Graphics2D g2d, AttributedString as, Map<String, Object> style)
  {
    FontRenderContext frc = g2d.getFontRenderContext();

    Set<String> styleNameSet = style.keySet();
    Iterator<String> it = styleNameSet.iterator();
    while (it.hasNext())
    {
      String styleName = it.next();
      TextAttribute taName = getTAStyleName(styleName, style.get(styleName));
      if (taName != null)
      {
        Object taValue = getTAStyleValue(taName, style.get(styleName));
        if (taValue == null)
          as.addAttribute(taName, style.get(styleName));
        else
          as.addAttribute(taName, taValue);
      }
    }

    TextMeasurer measurer = new TextMeasurer(as.getIterator(), frc);
    return measurer;
  }

  private static TextMeasurer createTextMeasurer(TextDrawingParams params, Graphics2D g2d, Node node, String paragraphStyleName,
      Map<String, Map<String, String>> styles)
  {
    TextMeasurer measurer = null;
    if (node != null)
    {
      String text = "";
      text = getText(params, node);
      if ((text == null || text.equals("")))
        return null;
      Map<String, Object> style = getTextStyle(node, paragraphStyleName, styles);
      AttributedString as = new AttributedString(text);
      measurer = createTextMeasurer(g2d, as, style);
    }
    return measurer;
  }

  private static AttributedString getAttributedString(TextDrawingParams params, Node node)
  {
    AttributedString as = null;
    if (node != null)
    {
      String text = getText(params, node);
      if (text != null)
        as = new AttributedString(text);
    }
    return as;
  }

  private static String getText(TextDrawingParams params, Node node)
  {
    StringBuffer sb = new StringBuffer();
    if (node.getNodeName().equals(HtmlCSSConstants.SPAN))
    {
      NodeList spanChildren = ((Element) node).getChildNodes();
      for (int i = 0; i < spanChildren.getLength(); i++)
      {
        if (spanChildren.item(i).getNodeName().equals("#text"))
          sb.append(spanChildren.item(i).getNodeValue());
        else if (spanChildren.item(i).getNodeName().equals(HtmlCSSConstants.BR))
        {
          params.setHasBRInCurrentNode(true);
          return null;
        }
      }
    }
    else if (node.getNodeName().equals("#text"))
    {
      sb.append(node.getNodeValue());
    }
    return sb.toString();
  }

  private static Map<String, Object> getTextStyle(Node node, String paragraphStyleName, Map<String, Map<String, String>> styles)
  {
    Map<String, Object> style = new HashMap<String, Object>();
    Map<String, String> paragraphStyle = styles.get(paragraphStyleName);
    style.put("color", "#000000");
    style.putAll(paragraphStyle);
    if (node.getNodeName().equals(HtmlCSSConstants.SPAN))
    {
      String spanStyleName = ((Element) node).getAttribute("class");
      if (spanStyleName != null && !spanStyleName.trim().equals(""))
      {
        Map<String, String> spanStyle = styles.get(spanStyleName);
        style.putAll(spanStyle);
      }
    }
    parseFontSizeForPercentage(style);
    return style;
  }

  private static void drawText(Graphics2D g2d, int width, int height, int textTotalHeight, List<List<List<TextLayout>>> paragraphList,
      TextDrawingParams params)
  {
    float y = (height - textTotalHeight) / 2;
    y = getYByAlign(params, height, textTotalHeight);
    for (int pIndex = 0; pIndex < paragraphList.size(); pIndex++)
    {
      List<List<TextLayout>> lineList = paragraphList.get(pIndex);
      for (int i = 0; i < lineList.size(); i++)
      {
        float advance = 0;
        List<TextLayout> layoutList = lineList.get(i);
        TextLayout tl = layoutList.get(0);
        y += (tl.getAscent());
        for (int j = 0; j < layoutList.size(); j++)
        {
          tl = layoutList.get(j);
          float x;
          advance += tl.getAdvance();
          if (j == layoutList.size() - 1)
          {
            x = getXByAlign(params, width, advance);
            for (int k = 0; k < layoutList.size(); k++)
            {
              tl = layoutList.get(k);
              tl.draw(g2d, x, y);
              x += tl.getAdvance();
            }
          }
        }
        y += tl.getDescent() + tl.getLeading();
      }
    }

  }

  private static void parseFontSizeForPercentage(Map<String, Object> style)
  {
    String fontSize = (String) style.get("font-size");
    if (fontSize != null && fontSize.indexOf("%") != -1)
      style.remove("font-size");
  }

  public static void addToImageList(ConversionContext context, String xPos, String yPos, String width, String height, String zIndex,
      String src, boolean isExist)
  {
    List<ImageDescriptor> imageList = (List<ImageDescriptor>) context.get("GroupImageList");
    try
    {
      if (imageList != null)
      {
        if (isExist)
        {
          File file = new File(context.get("targetFolder") + File.separator + src);
          imageList.add(new ImageDescriptor(ImageIO.read(file), xPos, yPos, zIndex, width, height));
        }
        else
          imageList.add(new ImageDescriptor(src, xPos, yPos, zIndex, width, height));
      }
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
  }

  public static void addToImageList(ConversionContext context, String xPos, String yPos, String width, String height, String zIndex,
      Image image)
  {
    List<ImageDescriptor> imageList = (List<ImageDescriptor>) context.get("GroupImageList");
    if (imageList != null)
    {
      imageList.add(new ImageDescriptor(image, xPos, yPos, zIndex, width, height));
    }
  }

  public static void groupShapes(Graphics2D g2d, int xPos, int yPos, List<ImageDescriptor> imageList)
  {
    // sort with zIndex
    Object[] imageArray = imageList.toArray();
    Arrays.sort(imageArray);
    // draw every image or shape on the big image
    for (int i = 0; i < imageArray.length; i++)
    {
      ImageDescriptor imageDescriptor = (ImageDescriptor) imageArray[i];
      Image image = imageDescriptor.getImage();
      g2d.drawImage(image, imageDescriptor.getXPos() - xPos, imageDescriptor.getYPos() - yPos, imageDescriptor.getWidth(),
          imageDescriptor.getHeight(), null);
    }
  }

  public static void groupShapes(File targetFile, ImageDescriptor bigImageDescriptor, List<ImageDescriptor> imageList)
  {
    OutputStream out = null;
    Graphics2D g2d = null;
    try
    {
      out = new BufferedOutputStream(new FileOutputStream(targetFile));
      BufferedImage bigImage = new BufferedImage(bigImageDescriptor.getWidth(), bigImageDescriptor.getHeight(), BufferedImage.TYPE_INT_ARGB);
      g2d = bigImage.createGraphics();
      RenderingHints qualityHints = new RenderingHints(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
      qualityHints.put(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
      g2d.setRenderingHints(qualityHints);
      groupShapes(g2d, bigImageDescriptor.getXPos(), bigImageDescriptor.getYPos(), imageList);
      ImageIO.write(bigImage, "png", out);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    finally
    {
      if (out != null)
      {
        try
        {
          out.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      if (g2d != null)
      {
        g2d.dispose();
      }
    }
  }

  public static ImageDescriptor calcBigImageInfo(List<ImageDescriptor> imageList)
  {
    Iterator iter = imageList.iterator();
    int width = 0;
    int height = 0;
    int xPos = 100;
    int yPos = 100;
    while (iter.hasNext())
    {
      ImageDescriptor imageDescriptor = (ImageDescriptor) iter.next();
      int newWidth = imageDescriptor.getXPos() + imageDescriptor.getWidth();
      if (newWidth > width)
        width = newWidth;
      int newHeight = imageDescriptor.getYPos() + imageDescriptor.getHeight();
      if (newHeight > height)
        height = newHeight;

      if (imageDescriptor.getXPos() < xPos)
        xPos = imageDescriptor.getXPos();
      if (imageDescriptor.getYPos() < yPos)
        yPos = imageDescriptor.getYPos();
    }

    return new ImageDescriptor(null, xPos, yPos, 0, width - xPos, height - yPos);
  }
}
