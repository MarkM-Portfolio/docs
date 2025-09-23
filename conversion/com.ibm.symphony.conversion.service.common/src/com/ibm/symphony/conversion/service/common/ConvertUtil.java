/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.TreeMap;
import java.util.UUID;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeFontFaceDecls;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.style.StyleFontFaceElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ConvertUtil
{
  static JSONObject odfMap = null;

  static JSONObject htmlMap = null;

  static JSONObject namespaceMap = null;

  static JSONObject defaultValueMap = null;

  static JSONObject attributeMap = null;
  
  static JSONObject svgMap = null;
  
  public static final int CONTENT_DOM = 0;

  public static final int STYLE_DOM = 1;
  
  static JSONObject defaultPDFOptions = null; 
  
  static JSONObject preservedShapeStyleMap = null;
  
  static JSONObject CJKLocaleInfoMap = null;
  
  static JSONObject unCJKLocaleInfoMap = null;
  
  public static Set<String> noCvtFormats = new HashSet<String>();
  
  public static Set<String> CJKLocale = new HashSet<String>();

  public static JSONObject getPreservedShapeStyleMap()
  {
    return preservedShapeStyleMap;
  }
  
  private static JSONObject parseJSON(String resourceName)
  {
    InputStream input = null;
    JSONObject ret = null;
    try
    {
      input = ConvertUtil.class.getResourceAsStream(resourceName);
      ret = JSONObject.parse(input);      
    }
    catch(Exception e)
    {
    }
    finally
    {
      if( input != null )
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
    return ret;
  }
  
  static
  {
    try
    {
      odfMap = parseJSON("ODF-Map.json");
      htmlMap = parseJSON("Html-Map.json");
      namespaceMap = parseJSON("Namespace-Map.json");
      defaultValueMap = parseJSON("DefaultValue.json");
      attributeMap = parseJSON("ODF-Attr-Map.json");
      svgMap = parseJSON("ODF-SVG.json");
      defaultPDFOptions = parseJSON("PDFOptions.json");
      preservedShapeStyleMap = parseJSON("Preserved-Shape-Style-Map.json");
      CJKLocaleInfoMap = parseJSON("g11n/CJKLocaleInfo.json");
      unCJKLocaleInfoMap = parseJSON("g11n/UnCJKLocaleInfo.json");
      
      noCvtFormats.add("jpg");
      noCvtFormats.add("jpeg");
      noCvtFormats.add("bmp");
      noCvtFormats.add("png");
      noCvtFormats.add("gif");
      
      CJKLocale.add("lotusJapanese");
      CJKLocale.add("lotusKorean");
      CJKLocale.add("lotusZHCN");
      CJKLocale.add("lotusZHTW");
      CJKLocale.add("lotusZH");
    }
    catch (Exception exception)
    {
      exception.printStackTrace();
    }
  }

  public static JSONObject getODFMap()
  {
    return odfMap;
  }

  public static JSONObject getHtmlMap()
  {
    return htmlMap;
  }

  public static JSONObject getNamespaceMap()
  {
    return namespaceMap;
  }

  public static JSONObject getDefaultValueMap()
  {
    return defaultValueMap;
  }

  public static JSONObject getAttrMap()
  {
    return attributeMap;
  }

  public static JSONObject getSVGMap()
  {
    return svgMap;
  }
  
  public static JSONObject getDefaultPDFOptions()
  {
    return defaultPDFOptions;
  }
  
  public static JSONObject getCJKLocaleInfoMap()
  {
    return CJKLocaleInfoMap;
  }
  
  public static JSONObject getUnCJKLocaleInfoMap()
  {
    return unCJKLocaleInfoMap;
  }

  public static OdfName getOdfName(String name)
  {
    String[] names = name.split(":");
    if (names.length == 2)
    {
      return OdfName.newName((String) namespaceMap.get(names[0]), name);
    }
    else if (names.length == 1)
    {
      return OdfName.newName(name);
    }
    else
    {
      throw new RuntimeException("incorrect name");
    }
  }
  
  public static double convertUnitToCM(String input)
  {
    double val;
    if (input.endsWith("cm"))
    {
      val = Double.parseDouble(input.substring(0, input.length() - 2));
    }
    else if (input.endsWith("in"))
    {
      val = Double.parseDouble(input.substring(0, input.length() - 2));
      val *= 72;
    }
    else if(input.endsWith("pt"))
    {
      val = Double.parseDouble(input.substring(0, input.length() - 2));
      val = val*2.54/72;
    }
    else
    {
      val = Double.parseDouble(input);
    }
    return val;
  }

  public static String convertUnitToPT(String input)
  {
    double val = 0;
    if (input.endsWith("in"))
    {
      val = Double.parseDouble(input.substring(0, input.length() - 2));
      val *= 72;
      return val + "pt";
    }
    else if (input.endsWith("cm"))
    {
      val = Double.parseDouble(input.substring(0, input.length() - 2));
      val *= (0.3937) * 72;
      return val + "pt";
    }
    else
      return input;
  }

  public static String convertUnitsToPT(String input)
  {
    String[] units = input.split(" ");
    StringBuilder sb = new StringBuilder();
    for (String unit : units)
    {
      sb.append(convertUnitToPT(unit));
      sb.append(" ");
    }
    return sb.toString();
  }

  public static String addLength(String l1, String l2)
  {     
    if(l1.endsWith("*") || l2.endsWith("*")) 
      return addRelativeLength(l1,l2);
      
    double val1 = 0;
    double val2 = 0;
    if (l1.endsWith("in"))
    {
      val1 = Double.parseDouble(l1.substring(0, l1.length() - 2));
      val1 *= 2.54;
    }
    else if (l1.endsWith("cm"))
    {
      val1 = Double.parseDouble(l1.substring(0, l1.length() - 2));
    }

    if (l2.endsWith("in"))
    {
      val2 = Double.parseDouble(l2.substring(0, l2.length() - 2));
      val2 *= 2.54;
    }
    else if (l2.endsWith("cm"))
    {
      val2 = Double.parseDouble(l2.substring(0, l2.length() - 2));
    }
    return (val1 + val2) + "cm";
  }

  public static String addRelativeLength(String l1, String l2)
  {
    if(l1.endsWith("*") && l2.endsWith("*"))
    {
      double val1 = 0;
      double val2 = 0;
      val1 = Double.parseDouble(l1.substring(0, l1.length() - 1));
      val2 = Double.parseDouble(l2.substring(0, l2.length() - 1));
      return (val1 + val2) + "*";     
    }
    else
      return "-1*";
  }

  public static int compareLength(String l1, String l2)
  {
    double val1 = 0;
    double val2 = 0;
    if (l1.endsWith("in"))
    {
      val1 = Double.parseDouble(l1.substring(0, l1.length() - 2));
      val1 *= 2.54;
    }
    else if (l1.endsWith("cm"))
    {
      val1 = Double.parseDouble(l1.substring(0, l1.length() - 2));
    }
    else if (l1.endsWith("pt"))
    {
      val1 = Double.parseDouble(l1.substring(0, l1.length() - 2));
      val1 = val1*2.54/72;
    }

    if (l2.endsWith("in"))
    {
      val2 = Double.parseDouble(l2.substring(0, l2.length() - 2));
      val2 *= 2.54;
    }
    else if (l2.endsWith("cm"))
    {
      val2 = Double.parseDouble(l2.substring(0, l2.length() - 2));
    }
    else if (l2.endsWith("pt"))
    {
      val2 = Double.parseDouble(l2.substring(0, l2.length() - 2));
      val2 = val2*2.54/72;
    }

    return new Double(val1).compareTo(new Double(val2));
  }

  public static OdfElement searchElement(String exp, OdfDocument doc)
  {
    return searchElement(exp, doc, CONTENT_DOM);
  }

  public static OdfElement searchElement(String exp, OdfDocument doc, int type)
  {
    try
    {
      OdfFileDom dom = null;
      switch (type)
        {
          case CONTENT_DOM :
            dom = doc.getContentDom();
            break;
          case STYLE_DOM :
            dom = doc.getStylesDom();
            break;
          default:
            return null;
        }
      XPath xpath = doc.getXPath();
      return (OdfElement) xpath.evaluate(exp, dom, XPathConstants.NODE);
    }
    catch (Exception e)
    {
      return null;
    }

  }

  public static NodeList searchElements(String exp, OdfDocument doc)
  {
    return searchElements(exp, doc, CONTENT_DOM);
  }

  public static NodeList searchElements(String exp, OdfDocument doc, int type)
  {
    try
    {
      OdfFileDom dom = null;
      switch (type)
        {
          case CONTENT_DOM :
            dom = doc.getContentDom();
            break;
          case STYLE_DOM :
            dom = doc.getStylesDom();
            break;
          default:
            return null;
        }
      XPath xpath = doc.getXPath();
      return (NodeList) xpath.evaluate(exp, dom, XPathConstants.NODESET);
    }
    catch (Exception e)
    {
      return null;
    }
  }
    
  public static String convertMapToStyle(Map<String, String> styleMap)
  {
    StringBuilder sb = new StringBuilder();
    Iterator<Entry<String, String>> it = styleMap.entrySet().iterator();
    while (it.hasNext())
    {
      Entry<String, String> entry = it.next();
      sb.append(entry.getKey());
      sb.append(':');
      sb.append(entry.getValue());
      sb.append(';');
    }
    return sb.toString();
  }

  public static Map<String, String> buildCSSMap(String htmlStyle)
  {    
    Map<String, String> rs = new TreeMap<String, String>();
    
    if(htmlStyle == null) 
    	return rs;
    
    StringTokenizer st = new StringTokenizer(htmlStyle, ";");
    while (st.hasMoreTokens())
    {
      String prop = st.nextToken();
      int index = prop.indexOf(":");
      if(index < 0 || index == prop.length())
        continue;
      
      String name = prop.substring(0, index);
      String value = prop.substring(index + 1);
      if (name != null)
      {
        // defect 38783,38738,38699,38533 to lower case is important, used as key in map
        name = name.trim().toLowerCase();
      }
      if (value != null)
        value = value.trim();
      rs.put(name, value);
    }
    return rs;
  }
  
  public static void createPlaceHolder(ConversionContext context, Element oldNode, boolean replace)
  {
    createPlaceHolder(context, oldNode, replace,  "Unsupported content");
  }

  public static void createPlaceHolder(ConversionContext context, Element oldNode, boolean replace, String msg)
  {
    Document doc = (Document) context.getTarget();
    
    Element div = null;
    String oldStyle = "";
    if( replace )
    {
      div = doc.createElement(HtmlCSSConstants.DIV);
      oldStyle = oldNode.getAttribute(HtmlCSSConstants.STYLE);
      div.setAttribute("style", oldStyle);
      div.setAttribute("id", oldNode.getAttribute("id"));
      oldNode.getParentNode().replaceChild(div, oldNode);
    }
    else
    {
      div = oldNode;
    }

    div.setAttribute("class", "placeholder");
    //div.setAttribute(HtmlCSSConstants.STYLE, oldStyle + "background-color:#f4f5f6;border: 1px #aeaeae solid;overflow:hidden;float:left");
    div.setAttribute(HtmlCSSConstants.CONTENT_EDITABLE, "false");
    
    Element div2 = doc.createElement(HtmlCSSConstants.DIV);
    div.appendChild(div2);
    div2.setAttribute(HtmlCSSConstants.STYLE, "position:relative; top: 40%;");
    
    Element div3 = doc.createElement(HtmlCSSConstants.DIV);
    div2.appendChild(div3);
    div3.setAttribute(HtmlCSSConstants.STYLE, "position:relative; top: -50%;text-align:center");
    
    Element p = doc.createElement(HtmlCSSConstants.P);
    div3.appendChild(p);
    
    Text txt = doc.createTextNode(msg);
    p.appendChild(txt);
    
    Element span = doc.createElement(HtmlCSSConstants.SPAN);
    p.appendChild(span);
    span.setAttribute(HtmlCSSConstants.STYLE, "background:url('/concord/images/help_16.png') no-repeat scroll 0% 0% transparent;");
    span.appendChild(doc.createTextNode("\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"));
  }
  
  public static String getLRPadding(Map<String, String> styleMap)
  {
    String LRPadding = null;
    String[] paddingArray = getPadding(styleMap);
    String paddingLeft = paddingArray[3];
    String paddingRight = paddingArray[1];

    if (paddingLeft == null && paddingRight == null)
      return null;
    else if (paddingRight == null)
      paddingRight = paddingLeft;
    else if (paddingLeft == null)
      paddingLeft = paddingRight;

    LRPadding = UnitUtil.addLength(paddingLeft, paddingRight);

    return LRPadding;
  }
  public static String getTBPadding(Map<String, String> styleMap)
  {
    String TBPadding = null;
    String[] paddingArray = getPadding(styleMap);
    String paddingTop = paddingArray[0];
    String paddingBottom = paddingArray[2];

    if (paddingTop == null && paddingBottom == null)
      return null;
    else if (paddingBottom == null)
      paddingBottom = paddingTop;
    else if (paddingTop == null)
      paddingTop = paddingBottom;

    TBPadding = UnitUtil.addLength(paddingTop, paddingBottom);

    return TBPadding;
  }
  
  public static String[] getPadding(Map<String, String> styleMap)
  {
    String padding = null;
    String[] paddingArray = new String[4];

    if (styleMap.containsKey(HtmlCSSConstants.PADDING))
      padding = styleMap.get(HtmlCSSConstants.PADDING);

    if (padding != null)
      paddingArray = getPaddingMarginArr(padding);

    if (styleMap.containsKey(HtmlCSSConstants.PADDING_TOP))
      paddingArray[0] = styleMap.get(HtmlCSSConstants.PADDING_TOP);

    if (styleMap.containsKey(HtmlCSSConstants.PADDING_RIGHT))
      paddingArray[1] = styleMap.get(HtmlCSSConstants.PADDING_RIGHT);    

    if (styleMap.containsKey(HtmlCSSConstants.PADDING_BOTTOM))
      paddingArray[2] = styleMap.get(HtmlCSSConstants.PADDING_BOTTOM);
    
    if (styleMap.containsKey(HtmlCSSConstants.PADDING_LEFT))
      paddingArray[3] = styleMap.get(HtmlCSSConstants.PADDING_LEFT);
    
   return paddingArray;
  }

  public static String[] getMargin(Map<String, String> styleMap)
  {
    String margin = null;
    String[] marginArray = new String[4];

    if (styleMap.containsKey(HtmlCSSConstants.MARGIN))
      margin = styleMap.get(HtmlCSSConstants.MARGIN);

    if (margin != null)
      marginArray = getPaddingMarginArr(margin);


    if (styleMap.containsKey(HtmlCSSConstants.MARGIN_TOP))
      marginArray[0] = styleMap.get(HtmlCSSConstants.MARGIN_TOP);

    if (styleMap.containsKey(HtmlCSSConstants.MARGIN_RIGHT))
      marginArray[1] = styleMap.get(HtmlCSSConstants.MARGIN_RIGHT);    

    if (styleMap.containsKey(HtmlCSSConstants.MARGIN_BOTTOM))
      marginArray[2] = styleMap.get(HtmlCSSConstants.MARGIN_BOTTOM);
    
    if (styleMap.containsKey(HtmlCSSConstants.MARGIN_LEFT))
      marginArray[3] = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);

    return marginArray;
  }

  public static String[] getPaddingMarginArr(String property)
  {
      String Left = null;
      String Right = null;
      String Top = null;
      String Bottom = null;

      StringTokenizer st = new StringTokenizer(property, " ");
      int i = 0;
      while (st.hasMoreTokens())
      {
        i++;
        String subV = st.nextToken();
        switch (i)
          {
            case 1 :
              Right = subV;
              Left = subV;
              Top = subV;
              Bottom = subV;
              break;
            case 2 :
              Right = subV;
              Left = subV;
              break;
            case 3 :
              Bottom = subV;
              break;
            case 4 :
              Left = subV;
              break;
          }
      }

    String[] result = {Top, Right, Bottom, Left};
    return result;
  }

  public static boolean filterElement(Node oNode, boolean bReassignId, boolean bFilterComment, boolean bFilterTask)
  {
  
    if (oNode.getNodeType() != Node.ELEMENT_NODE)
    {
      return false;
    }
    Element element = (Element) oNode;
  
    if (bFilterTask)
    {
      if (element.getTagName().equalsIgnoreCase("fieldset"))
      {
        Element fieldset = element;
        Element reference = (Element) fieldset.getLastChild().getPreviousSibling();
        Node node = reference.getFirstChild();
        if (node != null)
        {
          Node parent = fieldset.getParentNode();
          while (node != null)
          {
            Node next = node.getNextSibling();
            if (!filterElement(node, bReassignId, bFilterComment, bFilterTask))
              reference.removeChild(node);
            parent.insertBefore(node, fieldset);
            node = next;
          }
          parent.removeChild(fieldset);
        }
  
        return true; // removed
      }
    }
  
    if (bFilterComment)
    {
      if (element.getAttribute("commentid").length() > 0)
      {
        if (element.getTagName().equalsIgnoreCase("IMG"))
        {
          element.getParentNode().removeChild(element);
          return true; // removed
        }
        else
          element.removeAttribute("commentid");
      }
  
    }
  
    if (bReassignId)
    {
      if (element.hasAttribute("id"))
        element.setAttribute("id", UUID.randomUUID().toString());
    }
  
    if (element.hasChildNodes())
    {
      Node node = element.getFirstChild();
      while (node != null)
      {
        Node nextNode = node.getNextSibling();
        filterElement(node, bReassignId, bFilterComment, bFilterTask);
        node = nextNode;
      }
    }
  
    return false;
  
  }
  
  public static OdfElement getDrawFillImage(OdfDocument odfDoc, OdfElement odfElement)throws Exception
  {
    String drawStyleName = odfElement.getAttribute(ODFConstants.DRAW_STYLE_NAME);
    if(drawStyleName != null)
    {
      OdfOfficeAutomaticStyles autoStyles = odfDoc.getContentDom().getAutomaticStyles();  
      OdfOfficeStyles officeStyles = odfDoc.getContentDom().getOfficeStyles();
      OdfStyle drawStyle = null;
      if (autoStyles != null)
      {
        drawStyle = autoStyles.getStyle(drawStyleName, OdfStyleFamily.Graphic);
      }
      if(drawStyle == null && officeStyles != null)
      {
        drawStyle = officeStyles.getStyle(drawStyleName, OdfStyleFamily.Graphic);
      }
      if(drawStyle != null)
      {
        OdfStylePropertiesBase drawStyleGraphicPro = drawStyle.getPropertiesElement(OdfStylePropertiesSet.GraphicProperties);
        if(drawStyleGraphicPro != null)
        {
          String picName = drawStyleGraphicPro.getAttribute(ODFConstants.ODF_ATTR_DRAW_FILL_IMAGE_NAME);
          if(picName != null)
          {
            OdfOfficeStyles odfStyles = odfDoc.getStylesDom().getOfficeStyles();
            NodeList nodelist = odfStyles.getElementsByTagName(ODFConstants.ODF_ATTR_DRAW_FILL_IMAGE);
            if(nodelist != null)
            {
              for(int i=0; i<nodelist.getLength(); i++)
              {
                OdfElement node = (OdfElement) nodelist.item(i);
                if(picName.equals(node.getAttribute(ODFConstants.DRAW_NAME)))
                {
                  return node;
                }
              }
            }
          }
        }
      }
    }
    
    return null;
  }
  
  public static void getTabRelateToIndent(ConversionContext context, OdfDocument odfDoc) throws Exception
  {
    context.put("TabsRelativeToIndent", true);
    NodeList nodelist = odfDoc.getSettingsDom().getElementsByTagName(ODFConstants.CONFIG_CONFIG_ITEM);
    int len = nodelist.getLength();
    for(int i=0; i<len; i++)
    {
      String configName = ((Element) nodelist.item(i)).getAttribute(ODFConstants.CONFIG_NAME);
      if("TabsRelativeToIndent".equals(configName))
      {
        Node node = nodelist.item(i).getFirstChild();
        if(node instanceof Text)
        {
          Text txtElement = (Text) node;
          String txt = txtElement.getNodeValue();
          if("false".equals(txt))
            context.put("TabsRelativeToIndent", false);
        }
        break;
      }
    }
  }
  
  //Set <meta:generator> in meta.xml as product name
  public static void setMetaDomMetaGenerator(OdfDocument odfDoc) throws Exception
  {
    OdfFileDom metadom = odfDoc.getMetaDom();
    OdfOfficeMeta fMetadata = new OdfOfficeMeta(metadom);
    fMetadata.setGenerator(ODFConstants.PRODUCT_NAME);
  }
  
  public static OdfOfficeFontFaceDecls getOfficeFontFaceDecls(OdfFileDom odfFileDom)
  {
    OdfElement odfContent = odfFileDom.getRootElement();
    NodeList decls = odfContent.getElementsByTagNameNS((String) ConvertUtil.getNamespaceMap().get("office"),
        "font-face-decls");
    OdfOfficeFontFaceDecls decl = null;
    if (decls.getLength() == 0)
    {
      decl = new OdfOfficeFontFaceDecls(odfFileDom);
      odfContent.appendChild(decl);
    }
    else
    {
      decl = (OdfOfficeFontFaceDecls) decls.item(0);
    }
    return decl;
  }

  public static StyleFontFaceElement getFontFaceElement(OdfOfficeFontFaceDecls decls, String name)
  {
    StyleFontFaceElement sffe = null;
    NodeList children = decls.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      sffe = (StyleFontFaceElement) children.item(i);
      if (name.equalsIgnoreCase(sffe.getStyleNameAttribute()))
        return sffe;
    }
    return null;
  }  
  

  public static String parseFontSizeToString(double fontsize)
  {
    if((int)fontsize > (fontsize-0.1))
      return Integer.toString((int)fontsize);
    else if((int)fontsize+1 < (fontsize+0.1))
      return Integer.toString((int)fontsize+1);
    else
      return Double.toString(fontsize);
    
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

   public static String readVersionText(File sourceFile)
  {
    String version = null;
    try
    {
      if (sourceFile.exists())
        version = NFSFileUtil.nfs_readFileAsString(sourceFile, 0);
    }
    catch (IOException e)
    {
    }
    return version;
  }

}
