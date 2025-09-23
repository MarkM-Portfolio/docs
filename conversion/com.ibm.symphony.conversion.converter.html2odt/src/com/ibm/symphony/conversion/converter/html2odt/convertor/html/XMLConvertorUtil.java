/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.UUID;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.style.StyleStyleElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Attr;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class XMLConvertorUtil
{
  private static Logger log = Logger.getLogger(XMLConvertorUtil.class.getName());

  static JSONObject htmlTextMap = null;

  static JSONObject htmlTableMap = null;

  static JSONObject htmlTableCellMap = null;

  static
  {
    InputStream input = null;
    try
    {
      htmlTextMap = new JSONObject();
      htmlTextMap.putAll(ConvertUtil.getHtmlMap());

      input = XMLConvertorUtil.class.getResourceAsStream("Html-Text-Map.json");
      htmlTextMap.putAll(JSONObject.parse(input));
      input.close();

      input = XMLConvertorUtil.class.getResourceAsStream("Html-Table-Map.json");
      htmlTableMap = JSONObject.parse(input);
      input.close();

      input = XMLConvertorUtil.class.getResourceAsStream("Html-Table-Cell-Map.json");
      htmlTableCellMap = JSONObject.parse(input);
      input.close();
    }
    catch (FileNotFoundException fnfException)
    {
      fnfException.printStackTrace();
      log.severe("Can't find Html-Text-Map.json or Html-Table-Map.json");
    }
    catch (IOException ioException)
    {
      ioException.printStackTrace();
      log.severe("Can't load Html-Text-Map.json or Html-Table-Map.json");
    }
    finally
    {
      if (input != null)
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
  }

  public static JSONObject getHtmlTextMap()
  {
    return htmlTextMap;
  }

  public static JSONObject getHtmlTableMap()
  {
    return htmlTableMap;
  }

  public static JSONObject getHtmlTableCellMap()
  {
    return htmlTableCellMap;
  }

  public static void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfStyleFamily family)
  {
    // JSONObject jsObj = XMLConvertorUtil.getHtmlTextMap();
    NamedNodeMap attributes = htmlElement.getAttributes();
    try
    {
      OdfFileDom contentDom = getCurrentFileDom(context);

      boolean hasStyle = false;
      for (int i = 0; i < attributes.getLength(); i++)
      {
        Node attr = attributes.item(i);
        if (Constants.STYLE.equals(attr.getNodeName()))
        {
          hasStyle = true;
          convertStyle(context, htmlElement, odfElement, family, attributes, attr.getNodeValue());
        }

        // currently only convert style, attribute are not converted
        // Object odfAttrName = jsObj.get(attr.getNodeName());
        // if (odfAttrName != null)
        // {
        // OdfName name = ConvertUtil.getOdfName((String) odfAttrName);
        // String value = attr.getNodeValue();
        // Attr odfAttr = contentDom.createAttributeNS(name);
        // odfAttr.setValue(value);
        // odfElement.setAttributeNode(odfAttr);
        // }
      }
      if(!hasStyle)
      {
        convertStyle(context, htmlElement, odfElement, family, attributes, null);
      }
    }
    catch (Exception e)
    {
      addWarning(context, htmlElement, Constants.WARNING_ATTRIBUTE, e);
    }

  }
  
  public static void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfStyleFamily family, NamedNodeMap attributes, String styleString)
  {
    Node classAttr = attributes.getNamedItem(Constants.CLASS);
    String styleName = classAttr == null ? null : classAttr.getNodeValue();
    if (styleName != null)
    {
      String[] styles = styleName.split(" ");
      if (styles.length > 1)
      {
        if (styles[0].equals("shape") || styles[0].equals("anchor") || styles[0].equals("anchort"))
          styleName = styles[1];
      }
    }
    if (styleName != null || styleString != null)
      CSSStyleConvertorFactory.getInstance().getConvertor(family).convertStyle(context, htmlElement, odfElement, styleName, styleString);
  }

  public static String getElementPath(Element htmlElement)
  {
    StringBuffer sb = new StringBuffer();
    List<String> paths = new ArrayList<String>();
    Node tmp = htmlElement;
    do
    {
      paths.add(tmp.getNodeName());
    }
    while ((tmp = tmp.getParentNode()) != null);
    for (int i = paths.size() - 1; i >= 0; i--)
    {
      sb.append(paths.get(i)).append(".");
    }
    return sb.toString();
  }

  public static OdfElement convertStyleTagToSpan(ConversionContext context, OdfDocument odfDoc, OdfElement parent, String styleString)
      throws DOMException, Exception
  {

    OdfElement odfElement = getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName("text:span"));

    parent.appendChild(odfElement);
    CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Text).convertStyle(context, null, odfElement, null, styleString);
    return odfElement;
  }

  public static void copyPreservedProperties(ConversionContext context,Set<String> preservedStyles, OdfStyle newStyle, OdfStyle oldStyle)
  {
    if (newStyle != null && oldStyle != null)// need to copy preserved properties from old style to new style
    {
      NamedNodeMap attrsOld = oldStyle.getAttributes();
      for (int i = 0; i < attrsOld.getLength(); i++)
      {
        String attrName = attrsOld.item(i).getNodeName();
        if (!ConvertUtil.getODFMap().containsKey(attrName) || attrName.equals(ODFConstants.STYLE_MASTER_PAGE_NAME))
        {
          newStyle.setAttributeNode((Attr) newStyle.getOwnerDocument().importNode(attrsOld.item(i), true));
        }
      }
      
      Map<OdfStyleProperty, String> oldProps = oldStyle.getStyleProperties();
      Iterator<Entry<OdfStyleProperty, String>> it = oldProps.entrySet().iterator();
      while (it.hasNext())
      {
        Entry<OdfStyleProperty, String> entry = it.next();
        if (!newStyle.hasProperty(entry.getKey()))
        {
          OdfStyleProperty prop = entry.getKey();
          // don't add concord supported properties for they maybe deleted by concord
          String propName = prop.getName().getPrefix() + ":" + prop.getName().getLocalName();
          if (!ConvertUtil.getODFMap().containsKey(propName)
              /*|| prop.equals(OdfParagraphProperties.MarginLeft)*/)
          {
            newStyle.setProperty(prop, entry.getValue());
          }
          else
          {
            String stylePropName = (String) ConvertUtil.getODFMap().get( propName);
            if(preservedStyles != null && preservedStyles.contains( stylePropName ))
            {
              newStyle.setProperty(prop, entry.getValue());
            }
          }
        }
        //The style:delete-number-tab-stop cannot be queried by getStyleProperties(), so preserve it manually.
        OdfStylePropertiesSet proSet = OdfStylePropertiesSet.ParagraphProperties;
        OdfStylePropertiesBase proElement = oldStyle.getPropertiesElement(proSet);
        if (proElement != null && proElement.hasAttribute(ODFConstants.STYLE_DELETE_NUMBER_TAB_STOP))
        {
          OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
          OdfName name = ConvertUtil.getOdfName((String) ODFConstants.STYLE_DELETE_NUMBER_TAB_STOP);
          OdfAttribute odfAttr = contentDom.createAttributeNS(name);
          odfAttr.setValue(proElement.getAttribute(ODFConstants.STYLE_DELETE_NUMBER_TAB_STOP));
          newStyle.getOrCreatePropertiesElement(proSet).setAttributeNode(odfAttr);
        }
      }
    }
  }

  interface ElementFilter
  {
    boolean verify(Node node);
  }

  public static void copyChildren(OdfFileDom doc, OdfElement source, OdfElement target, ElementFilter filter) throws Exception
  {
    NodeList children = source.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node node = OdfDomUtil.cloneNode(doc, children.item(i), true);
      if (filter == null || filter.verify(node))
      {
        target.appendChild(node);
      }
    }
  }

  public static void addStyle(ConversionContext context, OdfElement odfElement, Map<OdfStyleProperty, String> styleMap,
      OdfStyleFamily family, String parentStyle)
  {
    if (odfElement == null || styleMap == null)
      return;

    OdfStylableElement stylable = (OdfStylableElement) odfElement;
    String styleName = stylable.getStyleName();
    try
    {
      OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
      OdfStyle newOdfStyle = newOdfStyle(contentDom, styleMap, family, parentStyle);

      if (styleName == null || styleName.equals(""))
      {
        autoStyles.appendChild(newOdfStyle);
        stylable.setStyleName(newOdfStyle.getStyleNameAttribute());
      }
      else
      {
        OdfStyle oldStyle = CSSUtil.getOldStyle(context, styleName, family);
        copyPreservedProperties(context,null, newOdfStyle, oldStyle);
        stylable.setStyleName(newOdfStyle.getStyleNameAttribute());
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
      log.severe(e.toString());
    }
  }

  public static OdfStyle newOdfStyle(OdfFileDom contentDom, Map<OdfStyleProperty, String> styleMap, OdfStyleFamily family,
      String parentStyle)
  {
    Iterator<Entry<OdfStyleProperty, String>> iStyle = styleMap.entrySet().iterator();

    OdfStyle odfStyle = new OdfStyle(contentDom);
    String styleName = CSSUtil.getStyleName(family, null);
    odfStyle.setStyleNameAttribute(styleName);
    odfStyle.setStyleFamilyAttribute(family.getName());
    if (parentStyle != null)
      odfStyle.setStyleParentStyleNameAttribute(parentStyle);

    while (iStyle.hasNext())
    {
      Entry<OdfStyleProperty, String> entry = iStyle.next();
      odfStyle.setProperty(entry.getKey(), entry.getValue());
    }

    return odfStyle;
  }

  public static void addWarning(ConversionContext context, Element htmlElement, String id, Throwable th)
  {
    th.printStackTrace();
    addWarning(context, htmlElement, id, th.getMessage());
  }

  public static void addWarning(ConversionContext context, Element htmlElement, String id, String description)
  {
    ConversionResult result = (ConversionResult) context.get("result");
    String location = getElementPath(htmlElement);
    result.addWarning(new ConversionWarning(id, false, description, location));
    log.info(location + "--" + description);
  }

  public static OdfStyleBase getStyle(String styleName, OdfStyleFamily family, OdfDocument odfDoc)
  {
    OdfStyle style = null;
    try
    {
      style = odfDoc.getContentDom().getAutomaticStyles().getStyle(styleName, family);
      if (style == null)
      {
        style = odfDoc.getStylesDom().getAutomaticStyles().getStyle(styleName, family);
        if (style == null)
          style = odfDoc.getStylesDom().getOfficeStyles().getStyle(styleName, family);
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return style;
  }

  public static boolean equalsProperty(String p1, String p2, double threshold)
  {
    if (p1 != null && p2 != null)
    {
      if (p1.equals(p2))
        return true;

      double val1 = 0;
      double val2 = 0;
      try
      {
        if ((p1.endsWith("cm") && p2.endsWith("in")))
        {
          val1 = Double.parseDouble(p1.substring(0, p1.length() - 2));
          val2 = Double.parseDouble(p2.substring(0, p2.length() - 2));
          val2 *= 2.54;
          return Math.abs(val1 - val2) < threshold;
        }

        if ((p2.endsWith("cm") && p1.endsWith("in")))
        {
          val1 = Double.parseDouble(p1.substring(0, p1.length() - 2));
          val1 *= 2.54;
          val2 = Double.parseDouble(p2.substring(0, p2.length() - 2));
          return Math.abs(val1 - val2) < threshold;
        }
        if ((p2.endsWith("cm") && p1.endsWith("cm")) || (p2.endsWith("in") && p1.endsWith("in")))
        {
          val1 = Double.parseDouble(p1.substring(0, p1.length() - 2));
          val2 = Double.parseDouble(p2.substring(0, p2.length() - 2));
          return Math.abs(val1 - val2) < threshold;
        }
      }
      catch (NumberFormatException nfe)
      {
        return false;
      }
    }
    return p1 == p2;
  }

  public static void removeInheritStyle(OdfStyleBase child, OdfStyleBase oldStyle, OdfStyleBase parent)
  {
    if (null == child || null == parent)
      return;
    Map<OdfStyleProperty, String> childProps = child.getStyleProperties();

    Iterator<Entry<OdfStyleProperty, String>> it = childProps.entrySet().iterator();

    HashSet<String> set = new HashSet<String>();
    set.add(ODFConstants.STYLE_TEXT_UNDERLINE_STYLE);
    set.add(ODFConstants.STYLE_TEXT_UNDERLINE_COLOR);
    set.add(ODFConstants.STYLE_TEXT_UNDERLINE_WIDTH);

    while (it.hasNext())
    {
      Entry<OdfStyleProperty, String> entry = it.next();
      if (!set.contains(entry.getKey().toString()) && equalsProperty(entry.getValue(), parent.getProperty(entry.getKey()), 0.005))
      {
        if( oldStyle != null && oldStyle.hasProperty(entry.getKey()) )
          continue;
        // remove the same style property
        child.removeProperty(entry.getKey());
      }
    }
  }

  public static void generateDefaultHeadingStyle(ConversionContext context, int level)
  {
    try
    {
      StyleStyleElement newStyle = ((OdfDocument) context.getTarget()).getStylesDom().getOfficeStyles().newStyleStyleElement("", "");
      newStyle.setStyleFamilyAttribute("paragraph");
      newStyle.setStyleDisplayNameAttribute("Heading " + level);
      newStyle.setStyleNameAttribute("Heading_20_" + level);
      if (level == 1 || level == 2)
        newStyle.setStyleParentStyleNameAttribute("Default_20_Text");
      else
        newStyle.setStyleParentStyleNameAttribute("Heading");
      newStyle.setStyleNextStyleNameAttribute("Text_20_Body_20_Single");
      newStyle.setStyleDefaultOutlineLevelAttribute(level);
      newStyle.setStyleListLevelAttribute(1);
      StyleTextPropertiesElement textPro = newStyle.newStyleTextPropertiesElement("true");
      setWeightOfStyleTextProperties(textPro, "bold");
      switch (level)
        {
          case 1 :
            setSizeOfStyleTextProperties(textPro, "115%");
            break;
          case 2 :
            setSizeOfStyleTextProperties(textPro, "14pt");
            setStyleOfStyleTextProperties(textPro, "italic");
            break;
          case 3 :
            setSizeOfStyleTextProperties(textPro, "14pt");
            break;
          case 4 :
            setSizeOfStyleTextProperties(textPro, "85%");
            setStyleOfStyleTextProperties(textPro, "italic");
            break;
          case 5 :
            setSizeOfStyleTextProperties(textPro, "85%");
            break;
          default:
            setSizeOfStyleTextProperties(textPro, "75%");
            break;
        }
    }
    catch (Exception e)
    {
      e.printStackTrace();
      log.severe(e.toString());
    }
  }

  private static void setSizeOfStyleTextProperties(StyleTextPropertiesElement pros, String size)
  {
    pros.setFoFontSizeAttribute(size);
    pros.setStyleFontSizeAsianAttribute(size);
    pros.setStyleFontSizeComplexAttribute(size);
  }

  private static void setStyleOfStyleTextProperties(StyleTextPropertiesElement pros, String style)
  {
    pros.setFoFontStyleAttribute(style);
    pros.setStyleFontStyleAsianAttribute(style);
    pros.setStyleFontStyleComplexAttribute(style);
  }

  private static void setWeightOfStyleTextProperties(StyleTextPropertiesElement pros, String weight)
  {
    pros.setFoFontWeightAttribute(weight);
    pros.setStyleFontWeightAsianAttribute(weight);
    pros.setStyleFontWeightComplexAttribute(weight);
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

  public static OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfDocument odfDoc = (OdfDocument) context.getTarget();
    String htmlNodeName = htmlElement.getNodeName();
    try
    {
      // convert strong/em/u/strike to span with style
      if ("strong".equalsIgnoreCase(htmlNodeName))
      {
        return XMLConvertorUtil.convertStyleTagToSpan(context, odfDoc, parent, "font-weight:bold;");
      }
      else if ("em".equalsIgnoreCase(htmlNodeName))
      {
        return XMLConvertorUtil.convertStyleTagToSpan(context, odfDoc, parent, "font-style:italic;");
      }
      else if ("u".equalsIgnoreCase(htmlNodeName))
      {
        return XMLConvertorUtil.convertStyleTagToSpan(context, odfDoc, parent, "text-decoration:underline;");
      }
      else if ("strike".equalsIgnoreCase(htmlNodeName))
      {
        return XMLConvertorUtil.convertStyleTagToSpan(context, odfDoc, parent, "text-decoration:line-through;");
      }
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
      return null;
    }

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();

    // OdfDocument odfDoc = (OdfDocument) context.getTarget();
    // String htmlNodeName = htmlElement.getNodeName();

    JSONObject htmlMap = getHtmlTextMap();
    String odfNodeName = (String) htmlMap.get(htmlNodeName);
    if (odfNodeName != null)
    {
      try
      {
        OdfElement odfElement = getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(odfNodeName));

        parent.appendChild(odfElement);
        if (!IndexUtil.NO_ID_NODES.contains(htmlNodeName))
        {
          indexTable.addEntryByHtmlNode(htmlElement, odfElement);
        }
        return odfElement;
      }
      catch (Exception e)
      {
        addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
        return null;
      }
    }
    else
    {
      addWarning(context, htmlElement, Constants.WARNING_ELEMENT, "Can't create OdfElement for html element:" + htmlElement.getNodeName());
      return null;
    }
  }

  public static OdfFileDom getCurrentFileDom(ConversionContext context)
  {
    OdfDocument odfDoc = (OdfDocument) context.getTarget();
    OdfFileDom fileDom = null;
    try
    {
      if (context.get(Constants.TARGET_ROOT_NODE).equals(ODFConstants.OFFICE_TEXT))
        fileDom = odfDoc.getContentDom();
      else
        fileDom = odfDoc.getStylesDom();

    }
    catch (Exception e)
    {
      e.printStackTrace();
    }

    return fileDom;
  }

  public static List<String> getClassNameList(Element htmlElement)
  {
    List<String> classNameList = new ArrayList<String>();

    String elementClass = htmlElement.getAttribute(Constants.CLASS);
    if (elementClass != null)
    {
      StringTokenizer st = new StringTokenizer(elementClass.trim(), " ");
      while (st.hasMoreTokens())
      {
        String className = st.nextToken().trim();
        if (!className.equals(""))
        {
          classNameList.add(className);
        }
      }
    }

    return classNameList;
  }

  public static boolean isShape(ConversionContext context, Element htmlElement)
  {
    NamedNodeMap attributes = htmlElement.getAttributes();

    Node classAttr = attributes.getNamedItem(Constants.CLASS);
    if (classAttr != null)
    {
      String styleName = classAttr.getNodeValue();
      if (styleName != null)
      {
        if( styleName.indexOf( "shape") != -1 || styleName.indexOf("group") != -1)
          return true;
      }
    }
    return false;
  }

  public static void appendChild(ConversionContext context, OdfElement child, OdfElement parent)
  {
    String anchorType = child.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    if (ODFConstants.OFFICE_TEXT.equals(parent.getNodeName()) && (anchorType == null || !"page".equals(anchorType)))
    {
      OdfElement p = getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
      p.appendChild(child);
      parent.appendChild(p);
    }
    else if(anchorType != null && "page".equals(anchorType))
    {
      Node first = parent.getFirstChild();
      parent.insertBefore(child, first); 
    }
    else
      parent.appendChild(child);
  }
  public static void appendDrawFrame(ConversionContext context, OdfElement child, OdfElement parent)
  {
    if(child.getParentNode() != null && ODFConstants.DRAW_A.equals(child.getParentNode().getNodeName()) && 
        !ODFConstants.DRAW_IMAGE.equals(child.getFirstChild().getNodeName()))
    {
      appendChild(context, (OdfElement) child.getParentNode(), parent);
      String drawStyleName = child.getAttribute(ODFConstants.DRAW_STYLE_NAME);
      if(drawStyleName != null && !"".equals(drawStyleName))
        ((OdfStylableElement) child).setStyleName(drawStyleName);
    }
    else
      appendChild(context, child, parent);
  }
}
