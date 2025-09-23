/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.presentation.common;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DraftJSONConverter
{
  private static final Logger LOG = Logger.getLogger(DraftJSONConverter.class.getName());

  private static String docURLPath = "";

  private static String getFileString(String path)
  {
    InputStream is = null;
    BufferedReader br = null;

    String line = "";
    StringBuffer buf = new StringBuffer();
    try
    {
      is = new FileInputStream(path);
      br = new BufferedReader(new InputStreamReader(is, "UTF-8"));

      while ((line = br.readLine()) != null)
        buf.append(line + "\n");
    }
    catch (Exception e)
    {
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
      }
    }
    return buf.toString();
  }

  public static void main(String[] args) throws Exception
  {
    String content = getFileString("C:\\IBM\\sharedata\\draft\\ibm\\draft\\626\\393\\2.pptx\\media\\content.html");
    convert(content, ""); 
  }

  public static JSONObject convert(String html, String indocURLPath)
  {
    if (indocURLPath.length() > 0)
    {
      docURLPath = indocURLPath;
    }
    long d = System.currentTimeMillis();
    html = html.replaceAll("\\r|\\n", "");
    Document document = Jsoup.parse(html);
    document.select("svg img").tagName("image");
    document.outputSettings().prettyPrint(false);
    long d2 = System.currentTimeMillis();
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "It takes {0} ms to load html with JSONConvert", (d2 - d));
    }
    String id = "";
    String title = "";
    JSONArray styles = new JSONArray();
    JSONArray slides = new JSONArray();
    String customValues = "";

    Element customValue = document.getElementById("custom_style_mode_value");
    if (customValue != null)
    {
      customValues = customValue.html();
    }

    Elements heads = document.getElementsByTag("head");
    if (heads != null && heads.size() > 0)
    {
      Element head = (Element) heads.get(0);
      Elements headChildList = head.children();
      for (int i = 0; i < headChildList.size(); i++)
      {
        Element ele = headChildList.get(i);
        String tagName = ele.tagName();
        if (tagName.equalsIgnoreCase("title"))
        {
          title = ele.text();
        }
        else if (tagName.equalsIgnoreCase("link"))
        {
          String styleId = ele.attr("id");
          String src = ele.attr("href");
          String name = ele.attr("name");
          if (name == null || name.length() == 0)
            name = ele.attr("stylename");
          if (src != null && src.indexOf("office_") >= 0)
          {
            JSONObject style = new JSONObject();
            style.put("id", styleId);
            style.put("name", name);
            style.put("src", src);
            styles.add(style);
          }
        }
        else if (tagName.equalsIgnoreCase("style"))
        {
          String styleId = ele.attr("id");
          String text = ele.html();
          String name = ele.attr("name");
          if (name == null || name.length() == 0)
            name = ele.attr("stylename");

          JSONObject style = new JSONObject();
          style.put("id", styleId);
          style.put("name", name);
          style.put("text", text);
          styles.add(style);
        }
      }
    }
    long d3 = System.currentTimeMillis();

    Elements roots = document.getElementsByClass("office_presentation");

    Element root = null;
    if (roots != null && roots.size() > 0)
    {
      root = (Element) roots.get(0);
      id = root.attr("id");
    }

    Element body = document.body();

    if (root == null)
      root = body;

    Elements slideWrappers = root.children();
    String bodyClass = body.className();
    String bodyId = body.attr("id");

    for (int j = 0; j < slideWrappers.size(); j++)
    {
      Element slideWrapperEle = slideWrappers.get(j);
      if (slideWrapperEle.attr("class").contains("slideWrapper"))
      {
        try
        {
          JSONObject slide = convert2JSONSlide(slideWrapperEle);
          if (slide != null)
            slides.add(slide);
        }
        catch (Exception ex)
        {
          LOG.log(Level.WARNING, "Failed to convert JSON silde" , ex);
        }
      }
    }
    JSONObject json = new JSONObject();
    json.put("id", id);
    json.put("bodyId", bodyId);
    json.put("bodyClass", bodyClass);
    json.put("styles", styles);
    json.put("slides", slides);
    json.put("customValues", customValues);

    try
    {
      String fontSize = root.attr("sz");
      String bold = root.attr("b");
      String italic = root.attr("i");
      String underlinea = root.attr("u");
      if (fontSize.isEmpty())
        fontSize = "18";
      if (bold.isEmpty())
        bold = "0";
      if (italic.isEmpty())
        italic = "0";
      if (underlinea.isEmpty())
        underlinea = "0";
      json.put("fontSize", Integer.parseInt(fontSize));
      json.put("b", Boolean.parseBoolean(bold));
      json.put("i", Boolean.parseBoolean(italic));
      json.put("u", Boolean.parseBoolean(underlinea));
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to deal default style", e);
    }

    long d4 = System.currentTimeMillis();
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "Parse head : {0} ms Parse body: {1} ms Parse all: {2} ms", new Object[]{(d3 - d2), (d4 - d3), (d4 - d)});
    }
    return json;
  }

  private static JSONObject convert2JSONSlide(Element wrapperEle)
  {

    String wrapperId = wrapperEle.attr("id");
    String slideId = null;
    float w = 0, h = 0;
    JSONObject meta = new JSONObject();
    JSONArray elements = new JSONArray();
    JSONObject taskContainer = null;

    Elements taskEles = wrapperEle.getElementsByClass("taskContainer");
    if (taskEles.size() > 0)
    {
      Element taskEle = taskEles.first();
      JSONObject taskMeta = new JSONObject();
      String taskId = null;
      Attributes nnm = taskEle.attributes();
      for (Attribute attr : nnm)
      {
        String name = attr.getKey();
        String value = attr.getValue();
        if (name.equals("id"))
          taskId = value;
        else
        {
          taskMeta.put(name, value);
        }
      }
      taskContainer = new JSONObject();
      taskContainer.put("id", taskId);
      taskContainer.put("attrs", taskMeta);
      taskContainer.put("content", filterContent(taskEle));
    }

    Element slideEle = wrapperEle.getElementsByClass("draw_page").get(0);
    Attributes nnm = slideEle.attributes();
    for (Attribute attr : nnm)
    {
      String name = attr.getKey();
      String value = attr.getValue();
      if (name.equals("id"))
        slideId = value;
      else
      {
        if (name.equals("pageheight"))
          h = Float.parseFloat(value);
        else if (name.equals("pagewidth"))
          w = Float.parseFloat(value);

        if (name == "class")
          meta.put(name, cleanCss(value));
        else
          meta.put(name, value);
      }
    }

    Elements childList = slideEle.children();

    for (int i = 0; i < childList.size(); i++)
    {
      Element ele = childList.get(i);
      if (ele.attr("class").contains("draw_frame"))
      {
        JSONObject theElement = convert2JSONElement(ele, w, h);
        elements.add(theElement);
      }
    }

    JSONObject result = new JSONObject();
    result.put("wrapperId", wrapperId);
    result.put("id", slideId);
    result.put("w", w);
    result.put("h", h);
    result.put("attrs", meta);
    result.put("elements", elements);
    if (taskContainer != null)
      result.put("taskContainer", taskContainer);

    return result;
  }

  private static String cleanCss(String value)
  {
    return value;
  }

  private static String parseStyleJSONtoString(JSONObject styleJson)
  {
    String stylePair = "";
    Set<?> ks = styleJson.keySet();
    Iterator<?> i = ks.iterator();
    while (i.hasNext())
    {
      String k = i.next().toString().trim();
      String v = styleJson.get(k).toString().trim();
      String text = k + ":" + v + ";";
      stylePair = stylePair + text;
    }
    return stylePair;
  }

  private static JSONObject parseStyleToJSON(String styleText)
  {
    JSONObject styleJson = new JSONObject();
    String[] styles = styleText.split(";");
    for (int i = 0; i < styles.length; i++)
    {
      String stylePair = styles[i];
      String[] kv = stylePair.split(":");
      if (kv.length == 2)
      {
        String k = kv[0].trim();
        String v = kv[1].trim();
        styleJson.put(k, v);
      }
    }
    return styleJson;
  }

  private static void fixDomElementPosition(Element ele)
  {
    if (getFamily(ele).equalsIgnoreCase("notes"))
      return;
    int zindex = 500;
    String draw_layer = ele.attr("draw_layer").trim();
    if (draw_layer.equalsIgnoreCase("backgroundobjects"))
      zindex = 0;
    boolean doupdate = false;
    String styleText = ele.attr("style").trim();
    if (!styleText.isEmpty())
    {
      JSONObject styleJson = parseStyleToJSON(styleText);
      if (styleJson.get("top") == null || !styleJson.get("top").toString().trim().endsWith("%"))
      {
        styleJson.put("top", "25%");
        doupdate = true;
      }
      if (styleJson.get("left") == null || !styleJson.get("left").toString().trim().endsWith("%"))
      {
        styleJson.put("left", "18%");
        doupdate = true;
      }
      if (styleJson.get("height") == null || !styleJson.get("height").toString().trim().endsWith("%"))
      {
        styleJson.put("height", "17.8451%");
        doupdate = true;
      }
      if (styleJson.get("width") == null || !styleJson.get("width").toString().trim().endsWith("%"))
      {
        styleJson.put("width", "50%");
        doupdate = true;
      }
      if (styleJson.get("z-index") == null)
      {
        styleJson.put("z-index", zindex + "");
        doupdate = true;
      }
      styleText = parseStyleJSONtoString(styleJson);
    }
    else
    {// style is empty, using default value:
      styleText = "position: absolute; top: 25%; left: 18%; height: 17.8451%; width: 50%; z-index: " + zindex;
      doupdate = true;
    }
    if (doupdate)
      ele.attr("style", styleText);
  }

  private static JSONObject convert2JSONElement(Element ele, float slideW, float slideH)
  {
    fixDomElementPosition(ele);
    JSONObject eleMap = new JSONObject();

    String[] styles = ele.attr("style").trim().split(";");
    float t = 0, l = 0, w = 0, h = 0;
    int z = 0;
    for (int i = 0; i < styles.length; i++)
    {
      String stylePair = styles[i];
      String[] kv = stylePair.split(":");
      if (kv.length == 2)
      {
        String k = kv[0].trim();
        if (k.equalsIgnoreCase("top") || k.equalsIgnoreCase("left") || k.equalsIgnoreCase("width") || k.equalsIgnoreCase("height")
            || k.equalsIgnoreCase("z-index"))
        {
          String v = kv[1].trim();
          float floatV = 0;
          if (v.endsWith("%"))
          {
            v = v.replace("%", "");
          }
          // if (v.endsWith("px"))
          // {
          // v = v.replace("px", "");
          // float ttt = Float.parseFloat(v);
          // v = ttt/1024 +"";
          // }
          // special case for old draft. just for debug.
          if (v.length() > 0)
            floatV = Float.parseFloat(v);
          if (k.equalsIgnoreCase("top"))
          {
            t = floatV;
          }
          else if (k.equalsIgnoreCase("left"))
          {
            l = floatV;
          }
          else if (k.equalsIgnoreCase("width"))
          {
            w = floatV;
          }
          else if (k.equalsIgnoreCase("height"))
          {
            h = floatV;
          }
          else if (k.equalsIgnoreCase("z-index"))
          {
            z = (int) floatV;
          }
        }
      }
    }

    String eleId = ele.id();

    eleMap.put("id", eleId);

    eleMap.put("t", t * slideH / 100.0);
    eleMap.put("l", l * slideW / 100.0);
    eleMap.put("w", w * slideW / 100.0);
    eleMap.put("h", h * slideH / 100.0);
    eleMap.put("z", z);

    String family = getFamily(ele);
    eleMap.put("family", family);
    if (family != null)
    {
      if (family.equalsIgnoreCase("notes"))
        eleMap.put("isNotes", true);

      float parentW = Float.parseFloat(eleMap.get("w").toString());
      float parentH = Float.parseFloat(eleMap.get("h").toString());
      if (family.equalsIgnoreCase("table"))
      {
        JSONObject table = getTable(ele, parentW, parentH);
        eleMap.put("table", table);
      }
      else if (family.equalsIgnoreCase("group"))
      {
        convert2ShapeElement(ele, parentW, parentH, eleMap);
      }
      else if (family.equalsIgnoreCase("graphic"))
      {
        convert2GraphicElement(ele, parentW, parentH, eleMap);
      }
      else
        eleMap.put("content", filterContent(ele));
    }

    JSONObject meta = new JSONObject();
    eleMap.put("attrs", meta);

    Attributes nnm = ele.attributes();
    for (Attribute attr : nnm)
    {
      String name = attr.getKey();
      String value = attr.getValue();
      if (!name.equals("id"))
      {
        if (name == "class")
          meta.put(name, cleanCss(value));
        else
          meta.put(name, value);
      }
    }

    meta.remove("origh");
    meta.remove("currh");

    return eleMap;
  }

  private static String getFamily(Element ele)
  {
    String presentationClass = ele.attr("presentation_class");
    String drawLayer = ele.attr("draw_layer");
    Element dataNode = null;
    Elements children = ele.children();
    if (children != null && children.size() > 0)
      dataNode = children.get(0);
    try
    {
      if ((presentationClass.equals("outline") || (presentationClass.equals("title") || (presentationClass.equals("subtitle")))))
      {
        return "text";
      }
      else if (drawLayer.equals("backgroundobjects"))
      {
        return "background";
      }
      else if ((presentationClass.equals("graphic") || ((dataNode != null) && (dataNode.attr("class").contains("draw_image")))))
      {
        return "graphic";
      }
      else if ((presentationClass.equals("date-time")))
      {
        return "date-time";
      }
      else if ((presentationClass.equals("footer")))
      {
        return "footer";
      }
      else if ((presentationClass.equals("header")))
      {
        return "header";
      }
      else if ((presentationClass.equals("page-number")))
      {
        return "page-number";
      }
      else if (presentationClass.equals("notes"))
      {
        return "notes";
      }
      else if ((dataNode != null) && (dataNode.tagName().toLowerCase().equals("table")))
      {
        return "table";
      }
      else if ((presentationClass.equals("group")))
      {
        return "group";
      }
      else if ((((dataNode != null) && ((dataNode.attr("class").contains("draw_text-box")) || dataNode.attr("odf_element")
          .equalsIgnoreCase("draw_text-box")))))
      {
        return "text";
      }
      else
      {
        return "unknown";
      }
    }
    catch (Exception ex)
    {
      return "unknown";
    }
  }

  private static JSONObject getAttrs(Element ele, ArrayList<String> exception)
  {
    JSONObject meta = new JSONObject();
    Attributes nnm = ele.attributes();
    for (Attribute attr : nnm)
    {
      String name = attr.getKey();
      String value = attr.getValue();
      if (exception == null || !exception.contains(name))
      {
        if (name == "class")
          meta.put(name, cleanCss(value));
        else
          meta.put(name, value);
      }
    }
    return meta;
  }

  private static boolean convert2GraphicElement(Element ele, float parentW, float parentH, JSONObject eleMap)
  {
    Elements imgs = ele.getElementsByClass("defaultContentImage");
    if (imgs.size() == 1 && docURLPath.length() > 0)
    {
      Element img = imgs.get(0);
      img.attr("src", docURLPath + "/images/imgPlaceholder.png");
    }
    eleMap.put("content", filterContent(ele));
    return true;
  }

  private static boolean convert2ShapeElement(Element ele, float parentW, float parentH, JSONObject eleMap)
  {
    // Get data node ID
    Elements dataNodes = ele.children();
    if (dataNodes.size() == 1)
    {
      Element dataNode = dataNodes.get(0);
      eleMap.put("dataId", dataNode.id());

      // IMG/SVG and text box
      Elements groupFrames = dataNode.children();
      int size = groupFrames.size();
      JSONArray others = new JSONArray();
      for (int i = 0; i < size; i++)
      {
        Element groupFrame = groupFrames.get(i);
        String family = getFamily(groupFrame);
        if (family.equalsIgnoreCase("graphic"))
        { // IMG/SVG
          Elements groupDataNodes = groupFrame.children();
          int childSize = groupDataNodes.size();
          if (childSize > 0)
          {
            for (int j = 0; j < childSize; j++)
            {
              Element groupDataNode = groupDataNodes.get(j);
              String tagName = groupDataNode.tagName();
              if (tagName.equalsIgnoreCase("img"))
              {
                JSONObject img = convert2ShapeImg(groupDataNode);
                img.put("divId", groupFrame.id());
                img.put("index", j);
                eleMap.put("img", img);
              }
              else if (tagName.equalsIgnoreCase("svg"))
              {
                JSONObject svg = convert2ShapeSvg(groupDataNode);
                svg.put("divId", groupFrame.id());
                svg.put("index", j);
                eleMap.put("svg", svg);
              }
              else
              {
                // some other thing we do not expect here, like a label for the img.
                JSONObject other = convert2ShapeOther(groupDataNode);
                other.put("divId", groupFrame.id());
                other.put("index", j);
                others.add(other);
                eleMap.put("others", others);
              }
            }
          }
        }
        else if (family.equalsIgnoreCase("text"))
        { // text box
          JSONObject txtBox = convert2JSONElement(groupFrame, parentW, parentH);
          eleMap.put("txtBox", txtBox);
        }
      }
    }
    return true;
  }

  private static JSONObject convert2ShapeOther(Element ele)
  {
    JSONObject other = new JSONObject();
    other.put("tagName", ele.tagName());
    JSONObject meta = getAttrs(ele, null);
    other.put("attrs", meta);
    other.put("content", filterContent(ele));
    return other;
  }

  private static JSONObject convert2ShapeImg(Element ele)
  {
    JSONObject img = new JSONObject();
    img.put("id", ele.id());

    ArrayList<String> exception = new ArrayList<String>();
    exception.add("id");
    JSONObject meta = getAttrs(ele, exception);
    img.put("attrs", meta);

    return img;
  }

  private static JSONObject convert2ShapeSvg(Element ele)
  {
    JSONObject svg = new JSONObject();
    svg.put("id", ele.id());
    svg.put("shapeVersion", ele.attr("shape-version"));

    // Frame
    JSONObject frm = new JSONObject();
    svg.put("frm", frm);
    // custom adjust values
    JSONObject av = new JSONObject();
    String[] preserves = ele.attr("preserve0").trim().split(";");
    double l = 0, t = 0, w = 0, h = 0, dspL = 0, dspT = 0, dspW = 0, dspH = 0;
    byte dir = -1;
    for (int i = 0; i < preserves.length; i++)
    {
      String kvPair = preserves[i];
      String[] kv = kvPair.split(":");
      if (kv.length == 2)
      {
        String k = kv[0].trim();
        if (k.equalsIgnoreCase("frm_x"))
        {
          l = Double.parseDouble(kv[1].trim());
          frm.put("l", l);
        }
        else if (k.equalsIgnoreCase("frm_y"))
        {
          t = Double.parseDouble(kv[1].trim());
          frm.put("t", t);
        }
        else if (k.equalsIgnoreCase("frm_width"))
        {
          w = Double.parseDouble(kv[1].trim());
          frm.put("w", w);
        }
        else if (k.equalsIgnoreCase("frm_height"))
        {
          h = Double.parseDouble(kv[1].trim());
          frm.put("h", h);
        }
        else if (k.equalsIgnoreCase("dsp_x"))
        {
          dspL = Double.parseDouble(kv[1].trim());
        }
        else if (k.equalsIgnoreCase("dsp_y"))
        {
          dspT = Double.parseDouble(kv[1].trim());
        }
        else if (k.equalsIgnoreCase("dsp_width"))
        {
          dspW = Double.parseDouble(kv[1].trim());
        }
        else if (k.equalsIgnoreCase("dsp_height"))
        {
          dspH = Double.parseDouble(kv[1].trim());
        }
        else if (k.equalsIgnoreCase("rot_degree"))
        {
          double rot = Double.parseDouble(kv[1].trim());
          frm.put("rot", rot);
        }
        else if (k.equalsIgnoreCase("dir"))
        {
          dir = Byte.parseByte(kv[1].trim());
        }
        else if (k.contains("adj"))
        {
          // custom adjust values
          av.put(k, kv[1].trim());
        }
      }
    }

    // Gap
    JSONObject gap = new JSONObject();
    svg.put("gap", gap);
    gap.put("l", l - dspL);
    gap.put("t", t - dspT);
    gap.put("r", (dspL + dspW) - (l + w));
    gap.put("b", (dspT + dspH) - (t + h));

    if (dir != -1)
      svg.put("dir", dir);

    // Custom adjust values
    if (!av.isEmpty())
      svg.put("av", av);

    // defs
    Elements clipPath = ele.getElementsByTag("clipPath");
    int clipPathSize = clipPath.size();
    Elements gradients = ele.getElementsByAttribute("gradtarget");
    int gradientsSize = gradients.size();
    Elements pattern = ele.getElementsByAttribute("imgtarget");
    int patternSize = pattern.size();

    if (clipPathSize == 1 || gradientsSize >= 1 || patternSize == 1)
    {
      JSONObject prop = new JSONObject();
      svg.put("prop", prop);

      // clip path id
      if (clipPathSize == 1)
      {
        Element clipPathElem = clipPath.get(0);

        JSONObject cp = new JSONObject();
        String id = clipPathElem.attr("id");
        cp.put("id", id);
        if (clipPathElem.hasAttr("clip-rule"))
          cp.put("clipRule", clipPathElem.attr("clip-rule"));
        prop.put("cp", cp);

        // the path for fill. for some shapes(borderCallout3),
        // it is not the same as line path(path var)
        // so when it exists, need contain it in model
        // and for some shapes there are several paths
        // so need a vector to contain it
        Elements pathChildren = clipPathElem.children();
        int len = pathChildren.size();
        if (len > 0)
        {
          JSONArray cpaths = new JSONArray();
          for (int i = 0; i < len; i++)
          {
            Element pathElem = clipPathElem.child(i);
            String cpath = pathElem.attr("d");
            if (cpath != null)
              cpaths.add(cpath);
          }
          svg.put("cpath", cpaths);
        }
      }
      // Gradient
      if (gradientsSize >= 1)
      {
        JSONArray grads = new JSONArray();
        prop.put("grads", grads);
        for (int i = 0; i < gradientsSize; i++)
        {
          Element gradient = gradients.get(i);
          JSONObject grad = convert2ShapeProp(gradient);
          grads.add(grad);
        }
      }
      // pattern
      if (patternSize == 1)
      {
        JSONObject ptn = convert2ShapeProp(pattern.get(0));
        prop.put("ptn", ptn);
      }
    }

    // Fill-line-arrow
    Elements flas = ele.getElementsByAttributeValue("groupfor", "fill-line-arrow");
    if (flas.size() == 1)
    {
      Element fla = flas.get(0);

      Elements children = fla.children();
      for (int i = 0, len = children.size(); i < len; i++)
      {
        Element grp = children.get(i);
        String grpFor = grp.attr("groupfor");
        if (grpFor.equalsIgnoreCase("fill"))
        { // fill
          if (grp.children().size() == 1)
          {
            JSONObject jsonFill = convert2ShapeFill(grp.child(0));
            svg.put("fill", jsonFill);
          }
        }
        else if (grpFor.equalsIgnoreCase("line"))
        { // line
          if (grp.children().size() == 1)
          {
            Element line = grp.child(0);
            String path = line.attr("d"); // path
            svg.put("path", path);

            JSONObject jsonLine = convert2ShapeLine(line);
            svg.put("line", jsonLine);
          }
        }
        else if (grpFor.equalsIgnoreCase("arrow"))
        { // arrow
          JSONArray arrows = new JSONArray();
          Elements arrowChildren = grp.children();
          int size = arrowChildren.size();
          if (size >= 1)
          {
            svg.put("arrows", arrows);
            for (int j = 0; j < size; j++)
            {
              Element arrow = arrowChildren.get(j);
              JSONObject jsonArrow = convert2ShapeArrow(arrow);
              arrows.add(jsonArrow);
            }
          }
        }
      }
    }

    // title
    Elements titles = ele.getElementsByTag("title");
    if (titles.size() == 1)
    {
      svg.put("title", titles.get(0).text());
    }

    return svg;
  }

  // Font fidelity improvement for 'Helvetica Neue' font family
  private static String replaceFontName(String style)
  {
    style = undoreplaceFontName(style);
    style = style.replaceAll("'Helvetica Neue'", "'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'Helvetica Neue Light'",
        "'Helvetica Neue Light',HelveticaNeueLight,HelveticaNeue-Light,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'Helvetica Neue Black'",
        "'Helvetica Neue Black',HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'Helvetica Neue Heavy'",
        "'Helvetica Neue Heavy',HelveticaNeueHeavy,HelveticaNeue-Heavy,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'Helvetica Neue Bold'",
        "'Helvetica Neue Bold',HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style
        .replaceAll("'Helvetica Neue Medium'",
            "'Helvetica Neue Medium',HelveticaNeueMedium,HelveticaNeue-Medium,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'Helvetica Neue Thin'",
        "'Helvetica Neue Thin',HelveticaNeueThin,HelveticaNeue-Thin,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style
        .replaceAll(
            "'Helvetica Neue UltraLight'",
            "'Helvetica Neue UltraLight',HelveticaNeueUltraLight,HelveticaNeue-UltraLight,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style
        .replaceAll(
            "'Helvetica Neue Black Condensed'",
            "'Helvetica Neue Black Condensed',HelveticaNeueBlackCondensed,HelveticaNeue-Black-Condensed,HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue Black','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style
        .replaceAll(
            "'Helvetica Neue Bold Condensed'",
            "'Helvetica Neue Bold Condensed',HelveticaNeueBoldCondensed,HelveticaNeue-Bold-Condensed,HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue Bold','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'Calibri Light'", "'C-alibri-Light'");
    style = style.replaceAll("'?Calibri'?", "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    style = style.replaceAll("'C-alibri-Light'",
        "'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
    return style;
  }

  private static String undoreplaceFontName(String style)
  {
    style = style.replaceAll("'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
        "'Calibri Light'");
    style = style.replaceAll("Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif", "Calibri");
    style = style
        .replaceAll(
            "'Helvetica Neue Bold Condensed',HelveticaNeueBoldCondensed,HelveticaNeue-Bold-Condensed,HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue Bold','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
            "'Helvetica Neue Bold Condensed'");
    style = style
        .replaceAll(
            "'Helvetica Neue Black Condensed',HelveticaNeueBlackCondensed,HelveticaNeue-Black-Condensed,HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue Black','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
            "'Helvetica Neue Black Condensed'");
    style = style
        .replaceAll(
            "'Helvetica Neue UltraLight',HelveticaNeueUltraLight,HelveticaNeue-UltraLight,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
            "'Helvetica Neue UltraLight'");
    style = style.replaceAll(
        "'Helvetica Neue Thin',HelveticaNeueThin,HelveticaNeue-Thin,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
        "'Helvetica Neue Thin'");
    style = style
        .replaceAll(
            "'Helvetica Neue Medium',HelveticaNeueMedium,HelveticaNeue-Medium,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
            "'Helvetica Neue Medium'");
    style = style.replaceAll(
        "'Helvetica Neue Bold',HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
        "'Helvetica Neue Bold'");
    style = style.replaceAll(
        "'Helvetica Neue Heavy',HelveticaNeueHeavy,HelveticaNeue-Heavy,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
        "'Helvetica Neue Heavy'");
    style = style.replaceAll(
        "'Helvetica Neue Black',HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
        "'Helvetica Neue Black'");
    style = style.replaceAll(
        "'Helvetica Neue Light',HelveticaNeueLight,HelveticaNeue-Light,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif",
        "'Helvetica Neue Light'");
    style = style.replaceAll("'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif", "'Helvetica Neue'");
    return style;
  }

  private static String filterContent(Element ele)
  {
    Elements spans = ele.getElementsByTag("span");
    for (int i = 0; i < spans.size(); i++)
    {
      Element span = spans.get(i);
      String style = span.attr("style");
      style = replaceFontName(style);
      span.attr("style", style);
    }
    String html = ele.html();
    html = html.replaceAll("&nbsp;&nbsp;&nbsp;", " &nbsp; ");
    html = html.replaceAll("   ", " &nbsp; ");
    html = html.replaceAll(">&nbsp;</span>", "> </span>");
    String cursor = "cursor:pointer;";
    html = html.replaceAll(cursor, "");
    return html;
  }

  private static JSONObject convert2ShapeProp(Element ele)
  {
    JSONObject gp = new JSONObject();

    String type = ele.tagName();
    gp.put("id", ele.id());
    gp.put("type", type);

    ArrayList<String> exception = new ArrayList<String>();
    exception.add("id");
    JSONObject meta = getAttrs(ele, exception);
    gp.put("attrs", meta);

    // jsoup incorrectly change svg "image" as "img"
    if (type.equalsIgnoreCase("pattern"))
      ele.child(0).tagName("image");
    gp.put("content", filterContent(ele));

    return gp;
  }

  private static JSONObject convert2ShapeFill(Element ele)
  {
    JSONObject fill = new JSONObject();

    fill.put("id", ele.id());
    fill.put("type", ele.tagName());

    ArrayList<String> exception = new ArrayList<String>();
    exception.add("id");
    JSONObject meta = getAttrs(ele, exception);
    if (meta != null)
    {
      // for defect: 52901: [Migration][107->20]Refresh after change background color of new shape in new pptx, background color will change
      // to a rectangle
      // There is old js code generate clip path as the format: url("#contentBox__child_body_id_1831c6fa5ea565c")
      // it's use " will lead the the analyzer split it as "url(", the good solution should fix the js code
      // however for latest js code, it will not generate url as this, so fix it here
      String clipPath = (String) meta.get("clip-path");
      if (clipPath != null && !clipPath.equals(""))
      {
        clipPath = clipPath.replaceAll("\"", "");
        meta.put("clip-path", clipPath);
      }
    }

    fill.put("attrs", meta);

    return fill;
  }

  private static JSONObject convert2ShapeLine(Element ele)
  {
    JSONObject line = new JSONObject();

    line.put("id", ele.id());

    ArrayList<String> exception = new ArrayList<String>();
    exception.add("id");
    exception.add("d");
    JSONObject meta = getAttrs(ele, exception);
    line.put("attrs", meta);

    return line;
  }

  private static JSONObject convert2ShapeArrow(Element ele)
  {
    JSONObject arrow = new JSONObject();

    String id = ele.id();
    arrow.put("id", id);
    if (id.indexOf("head") >= 0)
      arrow.put("type", "head");
    else if (id.indexOf("tail") >= 0)
      arrow.put("type", "tail");

    String tagName = ele.nodeName();
    if (tagName.equalsIgnoreCase("path"))
      arrow.put("path", ele.attr("d"));
    else if (tagName.equalsIgnoreCase("circle"))
      arrow.put("circle", 1);

    ArrayList<String> exception = new ArrayList<String>();
    exception.add("id");
    exception.add("d");
    JSONObject meta = getAttrs(ele, exception);
    arrow.put("attrs", meta);

    return arrow;
  }

  private static JSONObject getTable(Element ele, float tableW, float tableH)
  {
    JSONObject table = new JSONObject();
    Elements tableEles = ele.getElementsByTag("table");
    Element tableEle = tableEles.get(0);

    JSONObject allAttrsT = new JSONObject();
    Attributes attrs = tableEle.attributes();
    for (Attribute attr : attrs)
    {
      String name = attr.getKey();
      String value = attr.getValue();
      if (name.equalsIgnoreCase("id"))
      {
        table.put(name, value);
      }
      else
      {
        allAttrsT.put(name, value);
      }
    }
    table.put("attrs", allAttrsT);

    // 1, parse colgroup
    JSONArray colWidths = getColWidths(tableEle, tableW);
    if (colWidths != null)
    {
      table.put("colWidths", colWidths);
    }

    // 2, parse TRs and TDs/THs
    JSONArray rows = getRows(tableEle, tableH);
    table.put("rows", rows);

    return table;
  }

  private static JSONArray getColWidths(Element ele, float tableW)
  {
    JSONArray colWidths = new JSONArray();
    Elements colgrps = ele.getElementsByTag("colgroup");
    if (colgrps.size() != 1)
    {
      System.out.println("Multiple colgroups, incorrect.");
      return null;
    }

    Element colgrp = colgrps.get(0);
    Elements allCols = colgrp.getElementsByTag("col");
    for (int i = 0; i < allCols.size(); i++)
    {
      String widthStr = allCols.get(i).attr("style").trim().split(";")[0];
      String[] tmp = widthStr.split(":");
      if (tmp.length != 2)
        continue;
      String width = tmp[1].replace("%", "");
      float h = 0;
      if (width.length() > 0)
        h = Float.parseFloat(width);
      colWidths.add(h * tableW / 100.0);
    }
    return colWidths;
  }

  private static JSONArray getRows(Element ele, float tableH)
  {
    JSONArray rows = new JSONArray();
    Elements allRows = ele.getElementsByTag("tr");
    for (int i = 0; i < allRows.size(); i++)
    {
      // row meta and attrs
      Element rowEle = allRows.get(i);
      JSONObject row = new JSONObject();
      JSONObject allAttrsR = new JSONObject();
      Attributes attrs = rowEle.attributes();
      for (Attribute attr : attrs)
      {
        String name = attr.getKey();
        String value = attr.getValue();
        if (name.equalsIgnoreCase("id"))
        {
          row.put(name, value);
        }
        else
        {
          allAttrsR.put(name, value);
          if (name.equalsIgnoreCase("style"))
          {
            String[] styleList = value.split(";");
            for (int k = 0; k < styleList.length; k++)
            {
              String[] styleStr = styleList[k].split(":");
              if (styleStr.length == 2 && styleStr[0].equalsIgnoreCase("height"))
              {
                String height = styleStr[1].replace("%", "");
                float h = 0;
                if (height.length() > 0)
                  h = Float.parseFloat(height);
                row.put("h", h * tableH / 100.0);
              }
            }
          }
        }
      }

      allAttrsR.remove("origh");
      allAttrsR.remove("currh");

      row.put("attrs", allAttrsR);

      // 3, cell model
      JSONArray cells = new JSONArray();
      Elements allCells = rowEle.children();

      for (int j = 0; j < allCells.size(); j++)
      {
        Element cellEle = allCells.get(j);
        JSONObject cell = new JSONObject();

        JSONObject allAttrsC = new JSONObject();
        Attributes attrs1 = cellEle.attributes();
        for (Attribute attr : attrs1)
        {
          String name = attr.getKey();
          String value = attr.getValue();
          if (name.equalsIgnoreCase("id"))
          {
            cell.put(name, value);
          }
          else
          {
            allAttrsC.put(name, value);
          }
        }
        cell.put("attrs", allAttrsC);

        // cell content as html
        cell.put("content", filterContent(cellEle));
        cell.put("isHeaderCell", cellEle.tagName().toUpperCase().equals("TH"));

        cells.add(cell);
      }
      row.put("cells", cells);
      rows.add(row);
    }

    return rows;
  }

}
