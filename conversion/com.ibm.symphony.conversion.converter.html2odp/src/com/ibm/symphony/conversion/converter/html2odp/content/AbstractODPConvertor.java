/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import java.util.ArrayList;
import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.draw.OdfDrawCircle;
import org.odftoolkit.odfdom.doc.draw.OdfDrawConnector;
import org.odftoolkit.odfdom.doc.draw.OdfDrawCustomShape;
import org.odftoolkit.odfdom.doc.draw.OdfDrawEllipse;
import org.odftoolkit.odfdom.doc.draw.OdfDrawImage;
import org.odftoolkit.odfdom.doc.draw.OdfDrawLine;
import org.odftoolkit.odfdom.doc.draw.OdfDrawMeasure;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPath;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPolygon;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPolyline;
import org.odftoolkit.odfdom.doc.draw.OdfDrawRect;
import org.odftoolkit.odfdom.doc.draw.OdfDrawRegularPolygon;
import org.odftoolkit.odfdom.doc.text.OdfTextAuthorName;
import org.odftoolkit.odfdom.doc.text.OdfTextDate;
import org.odftoolkit.odfdom.doc.text.OdfTextFileName;
import org.odftoolkit.odfdom.doc.text.OdfTextLineBreak;
import org.odftoolkit.odfdom.doc.text.OdfTextPageNumber;
import org.odftoolkit.odfdom.doc.text.OdfTextSpan;
import org.odftoolkit.odfdom.doc.text.OdfTextTime;
import org.odftoolkit.odfdom.dom.element.draw.DrawGElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationNotesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odp.style.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.TextDecorationHandler;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public abstract class AbstractODPConvertor implements IConvertor
{

  // private static final String CLASS = AbstractODPConvertor.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  public void convert(ConversionContext context, Object input, Object output)
  {
    Element htmlElement = (Element) input;

    // Many elements during conversion expect the style attribute to be set even
    // if it is only an empty string. Firefox and Safari appear to do this consistently
    // but IE does not. Some browsers treat "" the same as no value and in this
    // case IE sees it as no value and removes the attribute.
    // For now add the style="" attribute if it is not set for an element. Doing
    // this for all now though spans and tables are the identified elements that need
    // this to be set during conversion.
    if (htmlElement instanceof Element)
    {
      String style = htmlElement.getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
      if (style == null || style.length() <= 0)
      {
        htmlElement.setAttribute(ODPConvertConstants.HTML_STYLE_TAG, "");
      }
    }

    OdfElement odfParent = (OdfElement) output;

    // coliva. Make sure to detect 'defaultContentText' or 'defaultContentImage' class values.
    // This indicates information supplied as default text/data that can be stripped from the
    // export to ODF as the corresponding ODF Element will have its own built-in default text
    // (controlled by the element's style).
    if (ContentConvertUtil.containsDefaultData(htmlElement))
    {
      return;
    }

    doContentConvert(context, htmlElement, odfParent);
  }
  public String getTextContent (Element htmlElement,String vaule){
	  if(vaule==null)vaule = "";
	  if (htmlElement.hasChildNodes())
	    {
	      NodeList list = htmlElement.getChildNodes();
	      for (int i = 0; i < list.getLength(); i++)
	      {
	        Node node = list.item(i);
	        if (node instanceof Element)
	        {
	          Element childElement = (Element) node;
	          if(childElement.getNodeName().equalsIgnoreCase("li")||childElement.getNodeName().equalsIgnoreCase("p"))
	        	  vaule +="\n";   
	          vaule = getTextContent(childElement,vaule);
	        }
	        else if (node instanceof Text)
	        {
	          Text txtElement = (Text) node;
	          vaule += txtElement.getNodeValue();
	        }
	      }
	   }
	  return vaule;
  }
  private boolean isTextParagraph(Node node)
  {
    String value = ((Element) node).getAttribute(ODPConvertConstants.HTML_CLASS_TEXT_P);
    if (value.length() == 0)
    {
      return false;
    }
    else
    {
      return Boolean.parseBoolean(value);
    }
  }

  /**
   * Get the ODF node name that should be used on export for the given html element
   * @param htmlElement - the element being exported to ODF
   * @return the odf element node name to use - or NOT FOUND if unknown
   */
  protected String getOdfNodeName(Node htmlElement)
  {
    // first try map
    String name = (String) ODFConvertorUtil.getHtmlTextMap().get(htmlElement.getNodeName());

    // if can't get from map,try class
    if (name == null)
    {
      Element element = (Element) htmlElement;
      String elementClass = element.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      name = ContentConvertUtil.getNodeNameByClass(elementClass);
    }
    if (name.equals(ContentConvertUtil.NOT_FOUND))
    {
      if(htmlElement.getNodeName().equals("font"))
        name = ODPConvertConstants.ODF_ELEMENT_TEXTSPAN;
      else if(isTextParagraph(htmlElement))
        name = ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH;
    }
    return name;
  }

  abstract protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent);

  /**
   * TODO this is stupid, need to remove this method. Why create an ODF element orphan node?
   * 
   * @param context
   * @param htmlElement
   * @return
   */
  protected OdfElement convertElement(ConversionContext context, Element htmlElement)
  {
    return ODFConvertorUtil.convertElement(context, htmlElement);
  }

  /**
   * Check if this element is part of a group (draw:g). Note: Presentation Notes children must be handled special because in that case, the
   * element is not a child of the parent.
   * 
   * @param odfParent
   *          - The parent element at which to stop checking for a draw:g
   * @param element
   *          - The element to check if it is a member of a group
   * @return boolean
   */
  @SuppressWarnings("restriction")
  private boolean isElementInGroup(OdfElement odfParent, OdfElement element)
  {
    if (element instanceof PresentationNotesElement)
      return false;
    if (odfParent instanceof DrawGElement)
      return true;
    OdfElement child = element;
    Node tmpParent = child.getParentNode();
    while (tmpParent != null && tmpParent != odfParent
        && !(tmpParent instanceof PresentationNotesElement) && (tmpParent instanceof OdfElement))
    {
      child = (OdfElement) tmpParent;
      if (child instanceof DrawGElement)
        return true;
      
      tmpParent = child.getParentNode();
    }
    return false;
  }

  /**
   * 
   * @param odfParent
   * @param element
   * @return
   */
  // @SuppressWarnings("unused")
  // private boolean isElementInGroup(OdfElement odfParent, OdfElement element)
  // {
  // OdfElement odfGroup = OdfElement.findFirstChildNode(OdfDrawGroup.class, odfParent);
  // return findInGroup(odfGroup, element);
  // }

  /**
   * 
   * @param odfGroup
   * @param element
   * @return
   */
  // @SuppressWarnings("restriction")
  // private boolean findInGroup(OdfElement odfGroup, OdfElement element)
  // {
  // if (odfGroup != null)
  // {
  // if (odfGroup.hasChildNodes())
  // {
  // NodeList children = odfGroup.getChildNodes();
  // for (int i = 0; i < children.getLength(); i++)
  // {
  // OdfElement odfElement = (OdfElement) children.item(i);
  // if (odfElement.equals(element))
  // return true;
  // }
  // }
  //
  // return findInGroup(OdfElement.findNextChildNode(OdfDrawGroup.class, odfGroup), element);
  // }
  // else
  // {
  // return false;
  // }
  // }

  @SuppressWarnings({ "unchecked", "restriction" })
  protected void convertChildren(ConversionContext context, Element htmlParent, OdfElement odfParent)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    // remove span without id first
    List<Node> oldChildren = (List<Node>) context.get(ODPConvertConstants.CONTEXT_OLD_CHILDREN);
    if (oldChildren == null)
      oldChildren = new ArrayList<Node>();
    Object reOrderFlag = context.get(ODPConvertConstants.CONTEXT_REORDER);

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    
    if (reOrderFlag != null && (Boolean) reOrderFlag && (odfParent!=null) && !(isShape(odfParent)))
    {
      int length = odfParent.getChildNodes().getLength();
      for (int i = 0; i < length; i++)
      {
        Node node = odfParent.removeChild(odfParent.getFirstChild());

        // Ignore unnecessary spans, line breaks, and text nodes
        if (node instanceof Text // Text node
            || node instanceof OdfTextLineBreak // line break
            || (node instanceof OdfTextSpan) && shouldSpanBeRemoved(node, indexTable)) // span does not include a field and is not indexed
        {
          // don't preserve, just remove
        }
        else
        {
          oldChildren.add(node);
        }
      }
      // append preserved objects before any indexable element
      for (int i = 0; i < oldChildren.size(); i++)
      {
        Node node = oldChildren.get(i);
        if (!indexTable.isOdfNodeIndexed((OdfElement) node) && !ODPConvertConstants.ODF_ELEMENT_TEXTLIST.equals(node.getNodeName()))
        {
          odfParent.appendChild(node);
        }
        else
        {
          break;
        }
      }

      if (htmlParent.hasChildNodes())
      {
        NodeList list = htmlParent.getChildNodes();
        for (int i = 0; i < list.getLength(); i++)
        {
          Node node = list.item(i);

          if (node instanceof Element)
          {
            Element childElement = (Element) node;

            // append odfChild and preserved objects after the odfChild and before next indexable element
            OdfElement odfChild = indexTable.getFirstOdfNode(childElement);
            // Added additional check to make sure we do not attempt to add an element that is part of a Group to the parent
            // since that would essentially destroy the grouping. The group "draw:g" is already re-ordered.
            // Added another check to make sure we were NOT appending a presentation notes element to a draw frame.
            // Yet another check as we don't want to append presentation notes to a draw page
            if (odfChild != null
                && !odfParent.equals(odfChild)
                && !isElementInGroup(odfParent, odfChild)
                && !(odfParent.getNodeName().equalsIgnoreCase(ODFConstants.DRAW_FRAME) && (odfChild.getNodeName()
                    .equalsIgnoreCase(ODFConstants.ODF_ELEMENT_PRESENTATIONNOTES)))
                && !(odfParent.getNodeName().equalsIgnoreCase(ODFConstants.DRAW_PAGE) && (odfChild
                    .getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS).equalsIgnoreCase(ODPConvertConstants.HTML_VALUE_NOTES))))
            {
              odfParent.appendChild(odfChild);
              int index = oldChildren.indexOf(odfChild);
              while (++index < oldChildren.size())
              {
                Node node1 = oldChildren.get(index);
                if (!indexTable.isOdfNodeIndexed((OdfElement) node1) && !ODPConvertConstants.ODF_ELEMENT_TEXTLIST.equals(node1.getNodeName()))
                {
                  odfParent.appendChild(node1);
                }
                else
                {
                  break;
                }
              }
            }
          }
          // else if(node instanceof Text)
          // {
          // Text txtElement = (Text) node;
          // odfParent.appendChild(contentDom.createTextNode(txtElement.getNodeValue()));
          // }
        }
      }
    }
    if (htmlParent.hasChildNodes())
    {
      NodeList list = htmlParent.getChildNodes();
      String nName = odfParent.getNodeName();
      Node newOdfParent = null;
      boolean isAnode = false;
      if(nName.equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_A)) {
    	odfParent.removeAttribute("id");
    	newOdfParent = odfParent.cloneNode(false);
    	isAnode = true;
      }
      for (int i = 0; i < list.getLength(); i++)
      {
        Node node = list.item(i);
        Object parentTextSize = context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
        if (node instanceof Element)
        {
          Element childElement = (Element) node;

          // Ignore Placeholders
          String styleName = childElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
          if ((styleName != null) && (styleName.contains(ODPConvertConstants.HTML_CLASS_PLACEHOLDER)))
          {
            break;
          }

          IConvertor convertor = ODPConvertFactory.getInstance().getConvertor(node);
          Element target = this.convertElement(context, childElement);
          // this target created is not USED AT ALL!!!
          if (target == null || target.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN))
          {
            context.put(ODPConvertConstants.CONTEXT_REORDER, false);
            context.put(ODPConvertConstants.CONTEXT_OLD_CHILDREN, oldChildren);
          }
          else
          {
            context.put(ODPConvertConstants.CONTEXT_REORDER, true);
            context.put(ODPConvertConstants.CONTEXT_OLD_CHILDREN, new ArrayList<Node>());
          }
          if(isAnode && target.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_LINE_BREAK)) {
            Node pnode = odfParent.getParentNode();
            convertor.convert(context, childElement, pnode);
            pnode.appendChild(newOdfParent);
            odfParent = (OdfElement) newOdfParent;
          } else 
            convertor.convert(context, childElement, odfParent);
        }
        else if (node instanceof Text)
        {
          Text txtElement = (Text) node;

          odfParent.appendChild(contentDom.createTextNode(txtElement.getNodeValue()));
        }
        context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, parentTextSize);
      }
      // restore reorder flag for parent
      if (reOrderFlag != null)
        context.put(ODPConvertConstants.CONTEXT_REORDER, reOrderFlag);
    }
  }

  /**
   * 
   * @param node
   *          span to be checked to see if contains a field or is not indexed
   * @param indexTable
   *          the indexTable to check if the span is indexed
   * @return true is span does NOT contain a field and is NOT indexed
   */
  private boolean shouldSpanBeRemoved(Node node, HtmlToOdfIndex indexTable)
  {
    boolean isIndexed = indexTable.isOdfNodeIndexed((OdfElement) node);
    if (isIndexed)
      return false;  // If indexed, do not remove the span

    // Check to see if the span contains a field, if so return false
    NodeList children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      // Note: Only checking the immediate children, in the future we
      // may have to look at the children's children, etc.
      Node childNode = children.item(i);
      if (childNode instanceof OdfTextDate || childNode instanceof OdfTextTime || childNode instanceof OdfTextPageNumber
          || childNode instanceof OdfTextAuthorName || childNode instanceof OdfTextFileName)
        return false;
    }
    // Since the span is not indexed and does not contain a field, return false.
    return true;
  }

  /**
   * 
   * @param element
   *          OdfElement to check
   * @return true if the OdfElement passed in is a shape, false otherwise
   */
  private boolean isShape(OdfElement element)
  {
    if (element instanceof OdfDrawCustomShape || element instanceof OdfDrawRect || element instanceof OdfDrawEllipse
        || element instanceof OdfDrawCircle || element instanceof OdfDrawImage || element instanceof OdfDrawLine
        || element instanceof OdfDrawConnector || element instanceof OdfDrawPath || element instanceof OdfDrawPolyline
        || element instanceof OdfDrawPolygon || element instanceof OdfDrawMeasure || element instanceof OdfDrawRegularPolygon)
      return true;
    return false;
  }

  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement odfElement, OdfElement odfParent)
  {
     OdfStyleFamily family = getNodeFamily(odfElement);
     this.parseAttributes(context, htmlNode, odfElement, odfParent, family);
  }

  /**
   * Get the OdfStyleFamily which is associated with the ODF element type
   * 
   * @param odfElement
   *          - the OdfElement to check
   * @return OdfStyleFamily - the style family associated with the odfElement. OdfStyleFamily.Text is the default.
   */
  @SuppressWarnings("restriction")
  protected OdfStyleFamily getNodeFamily(OdfElement odfElement)
  {
    OdfStyleFamily family = OdfStyleFamily.Text;
    if (ODFConstants.TEXT_P.equals(odfElement.getNodeName())) 
    {
      family = OdfStyleFamily.Paragraph;
    }
    else if (ODFConstants.TEXT_H.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Paragraph;
    }
    else if (ODFConstants.DRAW_FRAME.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_IMAGE.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_TEXT_BOX.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_A.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.TABLE_TABLE_COLUMN.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.TableColumn;
    }
    else if (ODFConstants.TABLE_TABLE_CELL.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.TableCell;
    }
    else if (ODFConstants.TABLE_TABLE_ROW.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.TableRow;
    }
    else if (ODFConstants.TABLE_TABLE.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Table;
    }
    return family;
  }

  @SuppressWarnings("restriction")
  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement element, OdfElement odfParent,
      OdfStyleFamily family)
  {
    NamedNodeMap attributes = htmlNode.getAttributes();
    boolean isSpan = htmlNode.getNodeName().equalsIgnoreCase("span");
    for (int i = 0; i < attributes.getLength(); i++)
    {
      Node attr = attributes.item(i);
      String nodeName = attr.getNodeName();
      String nodeValue = attr.getNodeValue();
      if (ContentConvertUtil.isPreservedAttribute(nodeName))
      {
        String qName = ContentConvertUtil.convertToQName(nodeName);
        String val = element.getAttribute(qName);
        if (val.compareTo(nodeValue) != 0)
        {
          // If a table has been copied and pasted in concord, we don't want to omit this. Overall not
          // sure why this was included for default cell style name. If something comes up revisit but
          // for now comment out this check. Predefined and Custom styles have been modified to handle as well.
          /*
           * if (qName.equals(ODPConvertConstants.ODF_STYLE_DEFAULT_CELL_STYLE_NAME) && (val == null || "".equals(val))) continue;
           */
          // if(!qName.equals("presentation:class") && !nodeValue.equals("group"))
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, nodeValue);
        }
      }
      else if (ODPConvertConstants.HTML_ATTR_STYLE.equals(nodeName))
      {
        String styleName = getStyleNameFromClass(attributes);
        String styleString = nodeValue;

        if ("".equals(styleName) && !"".equals(styleString) && family == OdfStyleFamily.Text)
        {
          // For text family styles, when the editor is used to change something such as the font-family, they will
          // frequently insert a new span and set the attribute which is being changed as an inline value - without
          // copying the style class name into the new span. So, if a span is found without a styleName, we need to search
          // the parent chain for a styleName to base our new style upon. Note that we need to get this styleName from the
          // parent ODF element because there could have been previous inline attributes which were applied to the
          // original style causing the new text style to be created.
          styleName = getParentStyleName(element, odfParent);
        }

        // defect 9864, filters the text-decoration values of the style string against the styletemplate values of the html
        // node's parent
        styleString = TextDecorationHandler.filterInlineStyle(styleString, htmlNode);
        
        if(isSpan){
        	// ignore line-height in span.
            if (styleString.contains(ODPConvertConstants.CSS_LINE_HEIGHT)) 
            {
              String [] styles = styleString.split(ODPConvertConstants.SYMBOL_SEMICOLON);
              styleString = "";
    	      for (int j = 0; j < styles.length; j++) {
    	    	if (!styles[j].trim().startsWith(ODPConvertConstants.CSS_LINE_HEIGHT))
    	    		styleString += styles[j] + ODPConvertConstants.SYMBOL_SEMICOLON;
    	      }
            }
        }
        CSSStyleConvertorFactory.getInstance().getConvertor(family).convertStyle(context, htmlNode, element, styleName, styleString);
      }
      // krings: Add to the context that the current element we are processing is a field and
      // put both a boolean the field type into the context.
      else if (nodeName.equals(ODPConvertConstants.HTML_ATTR_FIELD))
      {
        context.put(ODPConvertConstants.CONTEXT_FIELD_BOOLEAN_ATTRIBUTE, true);
        context.put(ODPConvertConstants.CONTEXT_FIELD_TYPE, nodeValue);
      }
    }
  }

  /**
   * Get the parent style name from the parent element chain that should be used as a "base" style from which inline style attributes should
   * be applied
   * 
   * @param odfElement
   *          - the OdfElement to which the style will be added
   * @param odfParent
   *          - the parent node to which the odfElement will be applied (also the parent chain to use to search for a "base" style to use).
   * @return String containing the "base" style name to use. "" if no "base" style is found.
   */
  @SuppressWarnings("restriction")
  protected String getParentStyleName(OdfElement odfElement, OdfElement odfParent)
  {
    String styleName = ""; // Default to no parent styleName

    // odfElement and odfParent are required. If not both provided return no parent style.
    if (odfElement == null || odfParent == null)
      return styleName;

    OdfElement parent = odfParent;
    // Get the node types
    String parentType = parent.getNodeName();
    String type = odfElement.getNodeName();

    // Search the parent style chain for a parent which has the same type and a text:style-name which
    // can be used as a "base" style for the new text:style-name we're going to create if inline styles have
    // changed.
    while (parentType.equals(type))
    {
      String parentStyleName = odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);
      if (parentStyleName != null && !"".equals(parentStyleName))
      {
        styleName = parentStyleName;
        break;
      }
      parent = (OdfElement) parent.getParentNode();
      if (parent == null)
      {
        break;
      }
      else
      {
        parentType = parent.getNodeName();
      }
    }

    return styleName;
  }

  /**
   * Some of the html element has the odf attributes not belong to the odf element it mapped. For example, the draw:frame element don't have
   * xlink attribute. But when the draw:frame's inner content is a draw:object, the converted html have such elements.
   * 
   * @param attrName
   * @return
   */
  protected boolean definedForThisElement(String attrName)
  {
    return true;
  }

  protected String getStyleNameFromClass(NamedNodeMap attrs)
  {
    Node classAttr = attrs.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classAttr == null)
      return "";

    String[] classes = classAttr.getNodeValue().trim().split(ODPConvertConstants.SYMBOL_WHITESPACE);
    if (classes == null || classes.length == 0)
      return "";

    if (classes.length == 1)
    {
       if (classes[0].startsWith("P"))
         return classes[0];
       else
    	 return "";
    }

    if (classes.length > 1)
    {
      return classes[1];
    }

    // should not go here since cases are divided into [0], [1], [2...]
    return "";
  }

  /**
   * Remove a child space placeholder which was inserted during import to prevent optimization out of an empty paragraph or paragraph with
   * an empty span.
   * 
   * @param htmlNode
   *          - the htmlNode which may contain a space placeholder.
   * @return true if the resulting structure is empty i.e. has no text nodes.
   */
  protected boolean removeSpacePlaceholder(Element htmlNode)
  {
    boolean isEmpty = false;

    String className = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (className != null && className.contains(ODPConvertConstants.HTML_ATTR_SPACE_PLACEHOLDER))
    {
      // Check if we have only a single child. If that child is still only our &nbsp placeholder,
      // then remove it.

      int numchildren = htmlNode.getChildNodes().getLength();
      if (numchildren == 1 || numchildren == 2)
      {
        Node child = htmlNode.getFirstChild();
        isEmpty = fixChild(htmlNode, child);

        if (numchildren == 2)
        {
          Node child2 = htmlNode.getLastChild();
          if (!child2.getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_BR))
          {
            isEmpty = false;
          }
        }
      }
      // Remove space placeholder from the class list to ensure it isn't treated as a style name
      String[] values = className.split("\\s+"); // split by whitespace
      StringBuilder classList = new StringBuilder(128);
      for (String value : values)
      {
        if (!value.equals(ODPConvertConstants.HTML_ATTR_SPACE_PLACEHOLDER))
        {
          classList.append(value);
          classList.append(" ");
        }
      }
      htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classList.toString());
    }

    return isEmpty;
  }

  /**
   * Try to remove the nbsp char / placeholder char. Make recursive call to ensure the span is considered. Return true if the resulting
   * structure is 'empty' i.e. has no text values.
   * 
   * @param parent
   * @param child
   * @return true if the structure is empty.
   */
  protected boolean fixChild(Node parent, Node child)
  {
    if (child.getNodeType() == Node.TEXT_NODE)
    {
      String text = child.getNodeValue();
      if (text != null && ODPConvertConstants.STRING_NBSP.equals(text))
      {
        // Remove the space placeholder
        parent.removeChild(child);
        return true;
      }
    }
    else if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.HTML_ELEMENT_SPAN))
    {
      if (child.getChildNodes().getLength() == 1)
        return fixChild(child, child.getFirstChild());
    }

    return false;
  }
}
