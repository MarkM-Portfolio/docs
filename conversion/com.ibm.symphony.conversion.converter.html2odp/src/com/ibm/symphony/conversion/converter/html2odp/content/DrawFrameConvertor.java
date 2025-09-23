/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.conversion.converter.html2odp.content;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.draw.OdfDrawFrame;
import org.odftoolkit.odfdom.doc.draw.OdfDrawImage;
import org.odftoolkit.odfdom.doc.draw.OdfDrawObject;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPath;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odp.model.Division;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.IMetricsRelation;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_POINT_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_RANGE_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPClipConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ZIndexUtil;
import com.ibm.symphony.conversion.presentation.ZIndexedElement;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class DrawFrameConvertor extends AbstractODPConvertor
{
  private static final String CLASS = DrawFrameConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final String DP2 = "dp2";

  private static final String GR3 = "gr3";

  private static final String PR4 = "pr4"; // "notes"

  private static final String DPT_WIDTH = "13.968cm";

  private static final String DPT_HEIGHT = "10.476cm";

  private static final String DPT_X = "3.81cm";

  private static final String DPT_Y = "2.123cm";

  private static final String DF_WIDTH = "17.271cm";

  private static final String DF_HEIGHT = "12.322cm";

  private static final String DF_X = "2.159cm";

  private static final String DF_Y = "13.271cm";

  enum PAGE_PRES_CLASS {
    HEADER, PAGE_NUMBER, FOOTER, DATE_TIME, LAYOUT, TITLE, SUBTITLE, OUTLINE, NOTES;
    public static PAGE_PRES_CLASS toEnum(String s)
    {
      try
      {
        return PAGE_PRES_CLASS.valueOf(s.toUpperCase().replaceAll("-", "_"));
      }
      catch (Exception ex)
      {
        return LAYOUT;
      }
    }
  }

  @Override
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    try
    {
      Element htmlElement = (Element) htmlNode;
      OdfElement odfElement = null;
      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

      // escape the conversion for master page defined draw frames.

      String drawLayer = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER);
      String htmlClass = getStyleNameFromClass(htmlNode.getAttributes());
      boolean isNew = (Boolean) context.get(ODPConvertConstants.CONTEXT_IS_NEW_DOC);
      if ((!isNew && ODPConvertConstants.HTML_VALUE_BACKGROUND.equalsIgnoreCase(drawLayer))
          || htmlClass.contains(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE))
      {
        return;
      }

      // Get the z-index so that we can put the ODF draw:frame into the correct order
      String style = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
      CSSProperties styleProperties = new CSSProperties(style.toLowerCase(), true);
      String zIndexValue = styleProperties.getProperty(ODPConvertConstants.HTML_ATTR_ZINDEX);
      int zIndex = 0; // Default to lowest priority (at the back)
      if (zIndexValue != null)
      {
        try
        {
          zIndex = Integer.parseInt(zIndexValue);
        }
        catch (NumberFormatException nfe)
        {
        } // Default to lowest priority
      }
      @SuppressWarnings("unchecked")
      LinkedList<ZIndexedElement> zIndexList = (LinkedList<ZIndexedElement>) context.get(ODPConvertConstants.CONTEXT_PAGE_FRAME_LIST);

      // default the master presentation style name to match the master page template name (we'll change it if we find a presentation class)
      String masterPageName = (String) context.get(ODPConvertConstants.CONTEXT_PAGE_TEMPLATE_NAME);
      context.put(ODPConvertConstants.CONTEXT_DRAWFRAME_MASTER_PRES_NAME, masterPageName + "-outline1");

      boolean foundOutline = false;
      String pres_class = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS);

      // Special case some of the presentation class types
      // Title, Subtitle, and Outline are processed in DrawTextBoxConvertor.
      if (pres_class != null)
      {
        String masterPresClass = "";
        PAGE_PRES_CLASS classType = PAGE_PRES_CLASS.toEnum(pres_class);
        switch (classType)
          {
            case HEADER :
            case FOOTER :
            case DATE_TIME :
              return;
            case PAGE_NUMBER :
              context.put(ODPConvertConstants.CONTEXT_FIELD_BOOLEAN_ATTRIBUTE, true);
              context.put(ODPConvertConstants.CONTEXT_FIELD_TYPE, ODPConvertConstants.HTML_ATTR_PAGE_NUMBER_FIELD);
              break;
            case NOTES :
            {
              String preserve_pClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_PRES_CLASS);
              if (preserve_pClass != null && preserve_pClass.equals(ODPConvertConstants.HTML_VALUE_PAGE_NUMBER))
              {
                htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, preserve_pClass);
                return;
              }

              processPresentationNotes(context, htmlNode, odfParent, zIndexList);
              context.remove(ODPConvertConstants.CONTEXT_EXPORT_OUTLINE_FONTSIZE_MAP);
              return;
            }
            case OUTLINE :
            {
              disablePlaceHolderObj(htmlElement);
              foundOutline = true;
              masterPresClass = "outline1";
              break;
            }
            case TITLE :
            case SUBTITLE :
            {
              masterPresClass = pres_class;
              break;
            }
          }
        // set master page template name using the presentation class
        if (masterPresClass.length() > 0 && masterPageName != null && masterPageName.length() > 0)
        {
          masterPageName += "-" + masterPresClass;
          context.put(ODPConvertConstants.CONTEXT_DRAWFRAME_MASTER_PRES_NAME, masterPageName);
        }
        else
          context.put(ODPConvertConstants.CONTEXT_DRAWFRAME_MASTER_PRES_NAME, "");
      }

      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      // decide whether create new odfElement
      boolean isExistingElement = true;
      if (indexTable.isHtmlNodeIndexed(htmlElement))
      {
        context.put(ODPConvertConstants.CONTEXT_ELEMENT_EXISTS, isExistingElement);
        context.put(ODPConvertConstants.CONTEXT_COPIED_ELEMENT, false);
        odfElement = indexTable.getFirstOdfNode(htmlElement);
        if (foundOutline)
          removePreservedObj(odfElement);
        // Find the element that we need to move. We need to move the child of the draw:page as
        // a whole, not necessarily the draw:frame.
        // Update the draw:frame order based on the current z-index
        if (odfElement != null)
        {
          if (odfElement != odfParent)
          {
            ZIndexUtil.updateOrder(zIndexList, zIndex, findChildToMove(odfElement, odfParent), odfParent);
          }
          if (isModifiableShape())
            setLocation(context, htmlElement, odfElement, false);
        }
      }
      else
      {
        // Create the draw:frame
        isExistingElement = false; // This is a new element
        context.put(ODPConvertConstants.CONTEXT_ELEMENT_EXISTS, isExistingElement);
        String preserveForCopy = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_FOR_COPY);
        boolean copiedElement = false;
        if (preserveForCopy != null && preserveForCopy.length() > 0)
        {
          copiedElement = true;
          context.put(ODPConvertConstants.CONTEXT_COPIED_ELEMENT, true);
        }
        String odfNodeName = getOdfNodeName(htmlElement);
        odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);

        // Insert the new draw:frame based on the z-index
        ZIndexUtil.appendInOrder(zIndexList, zIndex, odfElement, odfParent);

        if (isModifiableShape())
        {
          setLocation(context, htmlElement, odfElement, copiedElement);
          // If the htmlElement does not contain a "preserveforcopy" attribute, set styles the pre SC102 way
          if (!copiedElement)
            setStyleInformation(context, htmlElement, odfElement);
          processCustomShapePreserveOnlyElements(contentDom, odfElement, htmlElement);
        }
        indexTable.addEntryByHtmlNode(htmlElement, odfElement);
      }
      context.remove(ODPConvertConstants.CONTEXT_ELEMENT_EXISTS);

      if (odfElement != null)
      {
        // parse preserved attributes. Except for Shape Objects and Images
        if (!htmlClass.equals(ODPConvertConstants.HTML_CLASS_DRAW_IMAGE)
            && (!htmlClass.equals(ODPConvertConstants.HTML_CLASS_IMPORTED_IMAGE)))
        {
          if (!(odfElement instanceof OdfDrawImage))
          {
            if (!(odfElement instanceof OdfDrawPath || isModifiableShape()))
            {
              parseAttributes(context, htmlNode, odfElement, odfParent);
              setParentFontSizeContext(context, htmlElement, odfElement);

              // the import code will only factor in the "outline" font sizes if an outline pres class
              // draw frame is found. Otherwise the font size is not factored into the style information.
              // therefore the font size from the outline styles must be omitted when exporting.
              if (foundOutline)
              {
                setOutlineFontSizeMap(context, odfElement);
              }
            }
            else
            {
              setParentFontSizeContextODFDraw(context, odfElement);
            }
          }
        }
        else
        {
          // location (and size) might have changed, update it
          // We are a drawImage... let's see if we've been clipped
          if (ODPClipConvertUtil.isImageClipped(context, odfElement))
            processClippedImage(context, odfParent, htmlNode);
          setLocationForImage(context, htmlElement, odfElement, isExistingElement);
          if (!isExistingElement) // We need to set attributes on a new element
            parseAttributesForImage(context, htmlElement, odfElement);
          setParentFontSizeContext(context, htmlElement, odfElement);
        }

        // set draw frame width for children
        setParentWidth(context, odfElement);

        this.convertChildren(context, htmlElement, odfElement);
        updatePlaceholderValue(odfElement);
      }

      // remove the font size map to make sure it isn't used outside the draw frame.
      context.remove(ODPConvertConstants.CONTEXT_EXPORT_OUTLINE_FONTSIZE_MAP);

      // remove the list clone map to make sure it isn't used outside the draw frame.
      context.remove(ODPConvertConstants.CONTEXT_EXPORT_LIST_CLONE_MAP);
      // remove the list suffix to ensure we use a new one for the next container
      context.remove(ODPConvertConstants.CONTEXT_LIST_STYLE_SUFFIX);

      context.remove(ODPConvertConstants.CONTEXT_DRAWFRAME_MASTER_PRES_NAME);
      context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, ODPCommonUtil.LOG_ERROR_CONVERT_DRAWFRAME, e);
    }
  }

  /**
   * Set width of draw-frame in the context for children to use to convert % to cm's
   *
   * @param context
   *          - Conversion context
   * @param odfElement
   *          - draw frame odf element
   *
   */
  @SuppressWarnings("restriction")
  protected void setParentWidth(ConversionContext context, OdfElement odfElement)
  {
    String svgWidth = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
    if (svgWidth != null && svgWidth.length() > 0)
    {
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, svgWidth);
    }
  }

  /**
   * Find the child or the draw:page which might be a candidate to move based on the z-index. This will be a direct child of the draw:page
   * odfParent regardless of where the odfElement being processed existed. It may be contained within a draw:g or a presentation:note or
   * some other structure that must be moved as a whole.
   *
   * @param odfElement
   *          - the draw:frame found in the indextable
   * @param odfParent
   *          - the draw:page parent
   * @return OdfElement which is a candidate to move.
   */
  @SuppressWarnings("restriction")
  protected OdfElement findChildToMove(OdfElement odfElement, OdfElement odfParent)
  {
    OdfElement child = odfElement;
    while (child.getParentNode() != null && child.getParentNode() != odfParent)
    {
      try
      {
        child = (OdfElement) child.getParentNode();
      }
      catch (ClassCastException e)
      {
        log.log(Level.WARNING, "The parent node " + child.getParentNode().toString() + " is not OdfElement", e);
        break;
      }
    }
    return child;
  }

  /**
   * Processes the draw frame div structure for Presentation Notes
   * <p>
   *
   * @param context
   *          Conversion context
   * @param htmlNode
   *          HTML Node to process
   * @param odfParent
   *          Parent element for the presentation notes
   * @param zIndexList
   *          The current zIndexList for this page
   * @return void
   *
   */
  @SuppressWarnings("restriction")
  private void processPresentationNotes(ConversionContext context, Element htmlNode, OdfElement odfParent,
      LinkedList<ZIndexedElement> zIndexList)
  {
    Element htmlElement = (Element) htmlNode;
    OdfElement odfElement = null;
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();

    // decide whether create new odfElement
    if (indexTable.isHtmlNodeIndexed(htmlElement))
    {
      odfElement = indexTable.getFirstOdfNode(htmlElement);
      // Update the presentation:notes structure order, moving the presentation notes to the end (if not already there)
      // Find the element that we need to move. We need to move the child of the draw:page as
      // a whole, not necessarily the draw:frame.
      // Update the draw:frame order based on the current z-index
      ZIndexUtil.updateOrder(zIndexList, Integer.MAX_VALUE, findChildToMove(odfElement, odfParent), odfParent);
    }
    else
    {
      // Create a new presentation:notes structure
      OdfElement pnElement = createPresentationNotes(context, odfParent, contentDom, zIndexList);
      setHeaderFormats(pnElement, htmlElement, contentDom);
      odfElement = createPresentationNotesThumbnail(context, pnElement, contentDom);
      odfElement = createPresentationNotesFrame(context, pnElement, contentDom, htmlElement);

      indexTable.addEntryByHtmlNode(htmlElement, odfElement);
    }

    // For now, only the textbox within the presentation:notes section can be changed. Only convert the children.
    // Restore the draw:page-thumbnail first, then the draw:frame from the original and the parse the children inside the draw frame

    if (odfElement != null)
    {
      // Find the draw:frame element
      Node drawFrameElement = odfElement;
      NodeList children = odfElement.getChildNodes();
      for (int i = 0; i < children.getLength(); i++)
      {
        Node child = children.item(i);
        if (child instanceof OdfDrawFrame)
        {
          drawFrameElement = child;
          break;
        }
      }

      // set draw frame width for children
      setParentWidth(context, (OdfElement) drawFrameElement);

      context.put(ODPConvertConstants.CONTEXT_DIV_CONTEXT, ODPConvertConstants.DIV_CONTEXT_TYPE.SPEAKER_NOTES);
      this.convertChildren(context, htmlElement, (OdfElement) drawFrameElement);
      context.remove(ODPConvertConstants.CONTEXT_DIV_CONTEXT);
      context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    }
  }

  /**
   * sets the Header formats contained in the speaker/presentation notes section. These fields include page-number, header, footer and
   * date-time (footer, page-number and date-time are not the same as the footer that is seen in the normal view, date-time
   *
   * @param pnElement
   *          odf Element to set the header formats on
   * @param htmlElement
   *          htmlElement output from HCL Docs
   * @param contentDom
   *          Content DOM
   */
  @SuppressWarnings("restriction")
  private void setHeaderFormats(OdfElement pnElement, Element htmlElement, OdfFileDom contentDom)
  {

    // Process the Header
    String headerFormat = htmlElement.getAttribute("pn_presentation_use-header-name");
    if (headerFormat != null && headerFormat.length() > 0)
    {
      String attributeName = ODPConvertConstants.ODF_ATTR_USE_HEADER_NAME;
      OdfAttribute attribute = contentDom.createAttributeNS(attributeName, attributeName);
      attribute.setValue(headerFormat);
      pnElement.setAttributeNodeNS(attribute);
    }

    // Process the footer contained within the header .ie within speaker notes
    String footerFormat = htmlElement.getAttribute("pn_presentation_use-footer-name");
    if (footerFormat != null && footerFormat.length() > 0)
    {
      String attributeName = ODPConvertConstants.ODF_ATTR_USE_FOOTER_NAME;
      OdfAttribute attribute = contentDom.createAttributeNS(attributeName, attributeName);
      attribute.setValue(footerFormat);
      pnElement.setAttributeNodeNS(attribute);
    }

    // Process the date-time contained within the header .ie within speaker notes
    String dateTimeFormat = htmlElement.getAttribute("pn_presentation_use-date-time-name");
    if (dateTimeFormat != null && dateTimeFormat.length() > 0)
    {
      String attributeName = ODPConvertConstants.ODF_ATTR_USE_DATE_TIME_NAME;
      OdfAttribute attribute = contentDom.createAttributeNS(attributeName, attributeName);
      attribute.setValue(dateTimeFormat);
      pnElement.setAttributeNodeNS(attribute);
    }

    // Need to process the draw style name form the copied from page (if this was copied)
    String pnClassAttr = htmlElement.getAttribute("pn_class");
    if (pnClassAttr != null && pnClassAttr.length() > 0)
    {
      String attributeName = ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME;
      String drawStyleName = pnClassAttr
          .substring((ODPConvertConstants.HTML_ATTR_PRESENTATIONNOTES + ODPConvertConstants.SYMBOL_WHITESPACE).length());
      if (drawStyleName.startsWith("dp"))
      {
        OdfAttribute attribute = contentDom.createAttributeNS(attributeName, attributeName);
        attribute.setValue(drawStyleName);
        pnElement.setAttributeNodeNS(attribute);
      }
    }

  }

  /**
   * Created the presentation:notes ODF Element for a new Presentation (and attaches it to the parent)
   * <p>
   *
   * @param context
   *          Conversion context
   * @param odfParent
   *          Parent element for the presentation notes
   * @param contentDom
   *          Content DOM
   * @param zIndexList
   *          The current zIndexList for this page
   * @return OdfElement - newly created presentation:notes ODF Element
   *
   */
  @SuppressWarnings("restriction")
  private OdfElement createPresentationNotes(ConversionContext context, OdfElement odfParent, OdfFileDom contentDom,
      LinkedList<ZIndexedElement> zIndexList)
  {
    String attributeName = null;
    OdfAttribute attribute = null;

    // Create a new presentation:notes ODF Element
    String pnClass = ODPConvertConstants.ODF_ELEMENT_PRESENTATIONNOTES;
    OdfElement pnElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(pnClass), pnClass);
    // Insert the new draw:frame based on the z-index
    ZIndexUtil.appendInOrder(zIndexList, Integer.MAX_VALUE, pnElement, odfParent);

    attributeName = ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DP2);
    pnElement.setAttributeNodeNS(attribute);

    return pnElement;
  }

  /**
   * Created the draw:page-thumbnail ODF Element for a new Presentation (and attaches it to the parent)
   * <p>
   *
   * @param context
   *          Conversion context
   * @param odfParent
   *          Parent element for the draw:page-thumbnail
   * @param contentDom
   *          Content DOM
   * @return OdfElement - newly created draw:page-thumbnail ODF Element
   *
   */
  @SuppressWarnings("restriction")
  private OdfElement createPresentationNotesThumbnail(ConversionContext context, OdfElement odfParent, OdfFileDom contentDom)
  {
    String attributeName = null;
    OdfAttribute attribute = null;

    // Create a new draw:page-thumbnail ODF Element
    String dptClass = ODPConvertConstants.ODF_ELEMENT_DRAW_PAGETHUMBNAIL;
    OdfElement dptElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(dptClass), dptClass);
    odfParent.appendChild(dptElement);

    attributeName = ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(GR3);
    dptElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(ODPConvertConstants.PAGE);
    dptElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_DRAW_LAYER;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(ODPConvertConstants.HTML_VALUE_LAYOUT);
    dptElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_WIDTH;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DPT_WIDTH);
    dptElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_HEIGHT;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DPT_HEIGHT);
    dptElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_X;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DPT_X);
    dptElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_Y;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DPT_Y);
    dptElement.setAttributeNodeNS(attribute);

    return dptElement;
  }

  /**
   * Created the draw:frame ODF Element for a new Presentation (and attaches it to the parent)
   * <p>
   *
   * @param context
   *          Conversion context
   * @param odfParent
   *          Parent element for the draw:frame
   * @param contentDom
   *          Content DOM
   * @param htmlElement
   *          Presentation notes draw_frame element
   * @return OdfElement - newly created draw:frame ODF Element
   *
   */
  @SuppressWarnings("restriction")
  private OdfElement createPresentationNotesFrame(ConversionContext context, OdfElement odfParent, OdfFileDom contentDom,
      Element htmlElement)
  {
    String attributeName = null;
    OdfAttribute attribute = null;

    // Create a new draw:frame ODF Element
    String odfNodeName = getOdfNodeName(htmlElement);
    OdfElement odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
    odfParent.appendChild(odfElement);

    attributeName = ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(PR4);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(ODPConvertConstants.HTML_VALUE_NOTES);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_PRESENTATION_PLACEHOLDER;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(ODPConvertConstants.HTML_VALUE_TRUE);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_DRAW_LAYER;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(ODPConvertConstants.HTML_VALUE_LAYOUT);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_WIDTH;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DF_WIDTH);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_HEIGHT;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DF_HEIGHT);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_X;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DF_X);
    odfElement.setAttributeNodeNS(attribute);

    attributeName = ODPConvertConstants.ODF_ATTR_SVG_Y;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(DF_Y);
    odfElement.setAttributeNodeNS(attribute);

    return odfElement;
  }

  private void processClippedImage(ConversionContext context, OdfElement odfParent, Element drawFrameHtml)
  {
    // Get the clipInfo attribute from the drawFrameHtml
    HashMap<String, String> clipInfo = getClipInfo(context, drawFrameHtml);
    if (null == clipInfo)
      return; // Element not clipped

    // If the image is unmodified, reset drawFrame info to original
    if (isImageModified(clipInfo, drawFrameHtml))
    {
      recalculateSizeAndLocation(clipInfo, drawFrameHtml);
    }
    else
    {
      resetElement(clipInfo, drawFrameHtml);
    }
  }

  private void recalculateSizeAndLocation(HashMap<String, String> clipInfo, Element drawFrameHtml)
  {
    // We know the proportions haven't changed since you cannot clip in Concord.
    // If that changes someday, this will have to be redone
    HashMap<String, String> styleInfoMap = ODPClipConvertUtil.getInLineStyleMap(drawFrameHtml);
    double currentX = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_LEFT));
    double currentY = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_TOP));
    double currentW = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_WIDTH));
    double currentH = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_HEIGHT));

    double calculatedW = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_WIDTH_PERCENT));
    double calculatedH = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_HEIGHT_PERCENT));
    double originalW = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_WIDTH_PERCENT));
    double originalH = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_HEIGHT_PERCENT));

    // Calculate top (Y)
    double yRatio = currentH / calculatedH;
    double newH = originalH * yRatio;
    double borderH = (currentH - newH) / 2;
    double newY = currentY + borderH;
    String newDFTop = Double.toString(ODPClipConvertUtil.roundIt1000th(newY)) + ODPConvertConstants.SYMBOL_PERCENT;
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_TOP, newDFTop);

    // Calculate left (X)
    double xRatio = currentW / calculatedW;
    double newW = originalW * xRatio;
    double borderW = (currentW - newW) / 2;
    double newX = currentX + borderW;
    String newDFLeft = Double.toString(ODPClipConvertUtil.roundIt1000th(newX)) + ODPConvertConstants.SYMBOL_PERCENT;
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_LEFT, newDFLeft);

    // Calculate height
    double h1 = originalH;
    double h2 = calculatedH;
    double h4 = currentH;
    String newDFHeight = calculateRatio(h1, h2, h4);
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_HEIGHT, newDFHeight);

    // Calculate width
    double w1 = originalW;
    double w2 = calculatedW;
    double w4 = currentW;
    String newDFWidth = calculateRatio(w1, w2, w4);
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_WIDTH, newDFWidth);

    String newStyle = ODPClipConvertUtil.getStyleString(styleInfoMap);
    // Set the styles in the drawframe element to the new location
    drawFrameHtml.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, newStyle);
  }

  private String calculateRatio(double x1, double x2, double x4)
  {
    //
    double x3 = x1 / x2 * x4;
    double roundedX3 = ((int) ((x3 * 1000) + 0.5)) / 1000;
    return Double.toString(roundedX3) + "%";
  }

  /**
   * getClipInfo gets the "bread crumbs" from the drawFrame element
   */
  private HashMap<String, String> getClipInfo(ConversionContext context, Element drawFrameHtml)
  {
    String clipInfo = drawFrameHtml.getAttribute(ODPConvertConstants.CLIP_INFO_ATTRIBUTE);
    if (clipInfo.length() == 0)
      return null;
    String[] ciAttrs = clipInfo.split(ODPConvertConstants.SYMBOL_SEMICOLON);

    int capacity = ODPCommonUtil.calculateHashCapacity(ciAttrs.length);
    HashMap<String, String> clipInfoMap = new HashMap<String, String>(capacity);
    for (int i = 0; i < ciAttrs.length; i++)
    {
      String[] attr = ciAttrs[i].split(ODPConvertConstants.SYMBOL_COLON);
      clipInfoMap.put(attr[0], attr[1]);
    }
    return clipInfoMap;
  }

  private boolean isImageModified(HashMap<String, String> clipInfo, Element drawFrameHtml)
  {
    double calculatedX = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_X_PERCENT));
    double calculatedY = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_Y_PERCENT));
    double calculatedW = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_WIDTH_PERCENT));
    double calculatedH = extractPercent(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_HEIGHT_PERCENT));

    HashMap<String, String> styleInfoMap = ODPClipConvertUtil.getInLineStyleMap(drawFrameHtml);
    // Compare current with calculated X location
    double currentX = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_LEFT));
    if (!attributesEqual(currentX, calculatedX))
      return true;

    // Compare current with calculated Y location
    double currentY = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_TOP));
    if (!attributesEqual(currentY, calculatedY))
      return true;

    // Compare current with calculated width
    double currentW = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_WIDTH));
    if (!attributesEqual(currentW, calculatedW))
      return true;

    // Compare current with calculated height
    double currentH = extractPercent(styleInfoMap.get(ODPConvertConstants.ALIGNMENT_HEIGHT));
    if (!attributesEqual(currentH, calculatedH))
      return true;

    return false; // Image has not been modified
  }

  /**
   * Compares 2 doubles, if difference < 1/100, returns true
   *
   * @return
   */
  private boolean attributesEqual(double x, double y)
  {
    double OneHundreth = 0.01;
    if (Double.compare(Math.abs(x - y), OneHundreth) <= 0)
      return true;
    return false;
  }

  private double extractPercent(String s)
  {
    String sPercent = s.substring(0, s.indexOf(ODPConvertConstants.SYMBOL_PERCENT));
    return Double.parseDouble(sPercent);
  }

  private void resetElement(HashMap<String, String> clipInfo, Element drawFrameHtml)
  {
    HashMap<String, String> styleInfoMap = ODPClipConvertUtil.getInLineStyleMap(drawFrameHtml);

    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_LEFT, clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_X_PERCENT));
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_TOP, clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_Y_PERCENT));
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_HEIGHT, clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_HEIGHT_PERCENT));
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_WIDTH, clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_WIDTH_PERCENT));

    String newStyle = ODPClipConvertUtil.getStyleString(styleInfoMap);
    drawFrameHtml.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, newStyle);
  }

  @SuppressWarnings("restriction")
  private void setLocation(ConversionContext context, Element htmlElement, OdfElement odfElement, boolean copiedElement)
  {
    String styleValue = htmlElement.getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
    String odfStyle = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM);

    // If element is not copied, see if it is one of the unmovable elements and return
    if (!copiedElement)
    {
      // For now prevent rotates images/shapes/textboxes from being moved/resized
      if ((styleValue == null || styleValue.contains(ODPConvertConstants.CSS_ATTR_ROTATE)))
        return;
      if ((odfStyle == null || odfStyle.contains(ODPConvertConstants.CSS_ATTR_ROTATE)))
        return;
      // Check to see if the custom shape is 3 dimensional or contains extrusions, if so prevent them from being moved
      NodeList enhancedGeos = odfElement.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_DRAWENHANCEDGEOMETRY);
      for (int i = 0; i < enhancedGeos.getLength(); i++)
      {
        OdfElement eg = (OdfElement) enhancedGeos.item(i);
        NamedNodeMap attrs = eg.getAttributes();
        for (int j = 0; j < attrs.getLength(); j++)
        {
          Node attr = attrs.item(j);
          if (attr.getNodeName().startsWith(ODPConvertConstants.ODF_ATTR_DR3D)
              || attr.getNodeName().startsWith(ODPConvertConstants.ODF_ATTR_DRAW_EXTRUSION))
            return;
        }
      }

      // CSS handling of callouts positioning is different than ODP. In CSS, the callout shape
      // size is the entire shape including the "callout" piece. In ODP, the shape is only
      // the shape itself, not including the callout.
      if (isCallOut(odfElement))
        return;
    }

    Map<String, String> inlineStylesMap = ContentConvertUtil.buildStringStringMap(htmlElement
        .getAttribute(ODPConvertConstants.HTML_STYLE_TAG));
    String dcseLine = htmlElement.getAttribute(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_LINE);
    // Check to see if this was a draw custom shape line or connector
    if (dcseLine != null && dcseLine.length() > 0)
    {
      // If horizontal, set the height to 0
      if (dcseLine.equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_HORIZONTAL))
      {
        String height = "0.0";
        inlineStylesMap.put(ODPConvertConstants.ALIGNMENT_HEIGHT, height + ODPConvertConstants.SYMBOL_PERCENT);
      }
      // If vertical, set the width to 0
      else
      {
        String width = "0.0";
        inlineStylesMap.put(ODPConvertConstants.ALIGNMENT_WIDTH, width + ODPConvertConstants.SYMBOL_PERCENT);
      }
    }
    context.put(ODPConvertConstants.CONTEXT_INLINE_STYLE_MAP, inlineStylesMap);
    if (copiedElement)
    {
      String preserveCopyString = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_FOR_COPY);
      if (preserveCopyString != null && preserveCopyString.length() > 0)
      {
        boolean preserveCase = true;
        boolean removeWhiteSpace = false;
        Map<String, String> preserveMap = ContentConvertUtil.buildStringStringMap(preserveCopyString, preserveCase, removeWhiteSpace);
        context.put(ODPConvertConstants.CONTEXT_COPY_PRESERVE_MAP, preserveMap);
      }
    }
    convertLocationStyles(styleValue, odfElement, context);
    context.remove(ODPConvertConstants.CONTEXT_INLINE_STYLE_MAP);
    context.remove(ODPConvertConstants.CONTEXT_COPY_PRESERVE_MAP);
  }

  @SuppressWarnings("restriction")
  private void setLocationForImage(ConversionContext context, Element htmlElement, OdfElement odfElement, boolean isExistingElement)
  {
    String styleValue = htmlElement.getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
    String odfStyle = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM);

    if (isExistingElement) // if existing image is rotated or transformed, we don't allow location modification
    {
      if ((styleValue == null || styleValue.contains(ODPConvertConstants.CSS_ATTR_ROTATE)))
        return;
      if ((odfStyle == null || odfStyle.contains(ODPConvertConstants.CSS_ATTR_ROTATE)))
        return;
    }

    Map<String, String> inlineStylesMap = ContentConvertUtil.buildStringStringMap(htmlElement
        .getAttribute(ODPConvertConstants.HTML_STYLE_TAG));
    context.put(ODPConvertConstants.CONTEXT_INLINE_STYLE_MAP, inlineStylesMap);
    convertLocationStyles(styleValue, odfElement, context);
    context.remove(ODPConvertConstants.CONTEXT_INLINE_STYLE_MAP);
  }

  /**
   * Extract the attributes fromt the html and apply to odfElement
   */
  private void parseAttributesForImage(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    // Set the attributes from the htmlElement into the odfElement
    setOdfElementAttribute(htmlElement, ODPConvertConstants.HTML_ATTR_DRAW_TEXT_STYLE_NAME, odfElement,
        ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME);
    setOdfElementAttribute(htmlElement, ODPConvertConstants.HTML_ATTR_DRAW_LAYER, odfElement, ODPConvertConstants.ODF_ATTR_DRAW_LAYER);
    setOdfElementAttribute(htmlElement, ODPConvertConstants.HTML_ATTR_DRAW_NAME, odfElement, ODPConvertConstants.ODF_ATTR_DRAW_NAME);
    setOdfElementAttribute(htmlElement, ODPConvertConstants.HTML_ATTR_DRAW_TRANSFORM, odfElement,
        ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM);
  }

  @SuppressWarnings("restriction")
  private void setOdfElementAttribute(Element htmlElement, String htmlAttrName, OdfElement odfElement, String odfElementName)
  {
    String attributeValue = htmlElement.getAttribute(htmlAttrName);
    if (attributeValue.length() > 0) // Only set the attribute if it has a value
    {
      odfElement.setAttributeNS(ContentConvertUtil.getNamespaceUri(odfElementName), odfElementName, attributeValue);
      if (htmlAttrName.equals(ODPConvertConstants.HTML_ATTR_DRAW_TRANSFORM))
      { // remove the svg:x and svg:y attributes if the transform attribute is set
        odfElement.removeAttribute(ODPConvertConstants.ODF_ATTR_SVG_X);
        odfElement.removeAttribute(ODPConvertConstants.ODF_ATTR_SVG_Y);
      }
    }
  }

  /**
   *
   * @param odfElement
   *          current element being processed
   * @return true, if element is a callout
   */
  @SuppressWarnings("restriction")
  private boolean isCallOut(OdfElement odfElement)
  {
    NodeList children = odfElement.getChildNodes();
    if (children == null)
      return false;
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_DRAWENHANCEDGEOMETRY))
      {
        NamedNodeMap attrs = child.getAttributes();
        for (int j = 0; attrs != null && j < attrs.getLength(); j++)
        {
          Node attr = attrs.item(j);
          if (attr.getNodeName().equals(ODPConvertConstants.ODF_ATTR_DRAW_TYPE))
          {
            String attrValue = attr.getNodeValue();
            // if odp, "callout" is contained ;if from PPT/PPTX, draw type might be set as "mso-"
            if (attrValue.contains(ODPConvertConstants.ODF_ATTR_VALUE_CALLOUT) || attrValue.startsWith("mso-"))
              return true;
          }
        }
      }
    }
    return false;
  }

  @SuppressWarnings("restriction")
  private void setStyleInformation(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    boolean done = false;
    String grStyle = null;
    String PStyle = null;
    ;

    // Get the list of div tags and go looking for the appropriate style tags
    NodeList children = htmlElement.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_DIV);
    for (int i = 0; i < children.getLength() && !done; i++)
    {
      // Extract the graphic style and apply it
      Node child = children.item(i);
      if (child instanceof Element)
      {
        Element e = (Element) child;
        String shapeClasses = e.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        if (shapeClasses != null && shapeClasses.startsWith(ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES))
        {
          done = true;
          String[] styles = shapeClasses.split(ODPConvertConstants.SYMBOL_WHITESPACE);
          // Start with 1 to skip the draw_shape_classes string
          for (int j = 1; j < styles.length; j++)
          {
            if (styles[j].startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_GR))
              grStyle = styles[j];
            if (styles[j].startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_P))
              PStyle = styles[j];
          }
        }
        if (shapeClasses != null && shapeClasses.startsWith(ODPConvertConstants.HTML_VALUE_DRAW_FRAME))
        {
          int indexOfPreserveGrStyle = shapeClasses.indexOf(ODPConvertConstants.HTML_ATTR_PRESERVE_GR_STYLE);
          if (indexOfPreserveGrStyle >= 0)
          {
            String tempString = shapeClasses.substring(indexOfPreserveGrStyle + ODPConvertConstants.HTML_ATTR_PRESERVE_GR_STYLE.length());
            int endOfGrStyle = tempString.indexOf(ODPConvertConstants.SYMBOL_WHITESPACE);
            if (endOfGrStyle == -1)
              endOfGrStyle = tempString.length();
            grStyle = tempString.substring(0, endOfGrStyle);
          }
          int indexOfPreservePStyle = shapeClasses.indexOf(ODPConvertConstants.HTML_ATTR_PRESERVE_P_STYLE);
          if (indexOfPreservePStyle >= 0)
          {
            String tempString = shapeClasses.substring(indexOfPreservePStyle + ODPConvertConstants.HTML_ATTR_PRESERVE_P_STYLE.length());
            int endOfPStyle = tempString.indexOf(ODPConvertConstants.SYMBOL_WHITESPACE);
            if (endOfPStyle == -1)
              endOfPStyle = tempString.length();
            PStyle = tempString.substring(0, endOfPStyle);
          }
        }
      }
    }
    if (grStyle != null)
    {
      odfElement.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, grStyle);
    }
    if (PStyle != null)
    {
      odfElement.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME, PStyle);
    }
  }

  /**
   * Set up a font size map for the outline list levels. This way, when we do the font size calculations, we can get the right font size
   * that the inline styles are relative to.
   *
   * @param context
   * @param element
   */
  @SuppressWarnings("restriction")
  private void setOutlineFontSizeMap(ConversionContext context, OdfElement element)
  {
    OdfElement odfParent = (OdfElement) element.getParentNode();
    if (odfParent == null)
    {
      return;
    }

    String masterPage = odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_MASTER_PAGE_NAME);
    OdfFileDom contentDom = (OdfFileDom) context.get("target");

    Map<Integer, Double> outlineFSMap = new HashMap<Integer, Double>();

    for (int level = 1; level <= 9; level++)
    {
      String styleName = masterPage + "-outline" + level;
      Double parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Presentation);
      if (parentTextSize != null)
      {
        outlineFSMap.put(level, parentTextSize);
      }
    }

    context.put(ODPConvertConstants.CONTEXT_EXPORT_OUTLINE_FONTSIZE_MAP, outlineFSMap);
  }

  @SuppressWarnings("restriction")
  protected void setParentFontSizeContext(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    String pres_class = htmlElement.getAttribute("presentation_class");
    if (pres_class != null)
    {
      OdfFileDom contentDom = (OdfFileDom) context.get("target");
      OdfElement odfParent = (OdfElement) odfElement.getParentNode();
      // Double parentTextSize = ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT;
      Double parentTextSize = null;
      String styleName = null;
      // String styleName = odfElement.getAttribute("draw:text-style-name");
      // parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Paragraph);
      if ((pres_class.equals("title") || pres_class.equals("subtitle")))
      {
        if (parentTextSize == null)
        {
          styleName = odfParent.getAttribute("draw:master-page-name") + "-" + pres_class;
          parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Presentation);
        }
      }
      else if (pres_class.equals("outline"))
      {
        if (parentTextSize == null)
        {
          styleName = odfParent.getAttribute("draw:master-page-name") + "-outline1";
          parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Presentation);
        }
      }
      else
      {
        styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
        if (styleName != null && styleName.length() > 0)
        {
          parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Presentation);
        }
      }

      // mich - defect 2896, if no parent text size could be found yet, lookup the parent style of the presentation style or the
      // draw style, and see if it defines a font size
      if (parentTextSize == null)
      {
        String elementStyleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
        OdfStyleFamily elementStyleFamily = OdfStyleFamily.Presentation;

        // mich - defect 9169, code added to address specific cases, see defect for details
        if (elementStyleName == null || elementStyleName.length() == 0)
        {
          elementStyleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
          elementStyleFamily = OdfStyleFamily.Graphic;
        }
        if (elementStyleName == null || elementStyleName.length() == 0)
        {
          // in some cases, the draw:style-name attribute is not set in the odf element, we need to derive it from the css class
          // name of the nested div of the draw:frame
          elementStyleName = getDeepDrawFrameClassesGraphicStyleName(odfElement, htmlElement);
          elementStyleName = ContentConvertUtil.getOriginalNameFromCDUPStyle(elementStyleName);
          elementStyleFamily = OdfStyleFamily.Graphic;
        }

        if (elementStyleName != null && elementStyleName.length() > 0)
        {
          String parentStyleName = ContentConvertUtil.getParentStyleName(context, elementStyleName);
          if (parentStyleName != null && parentStyleName.length() > 0)
          {
            parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), parentStyleName, elementStyleFamily);
          }
        }
      }

      // the draw:text-style-name attribute must not be used to obtain any styles
      // if (parentTextSize == null)
      // {
      // styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME);
      // if (styleName != null && styleName.length() > 0)
      // {
      // parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Paragraph);
      // }
      // }

      if (parentTextSize == null)
      {
        parentTextSize = ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT;
      }

      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, parentTextSize);
    }
  }

  /**
   * Digs through the child nodes of a given html element and returns the graphic style name from the class attribute where the
   * "draw_frame_classes" value can be found.
   *
   * @param htmlElement
   *          - the html element to dig into
   * @return the graphic style name
   */
  @SuppressWarnings("restriction")
  private String getDeepDrawFrameClassesGraphicStyleName(OdfElement odfElement, Element htmlElement)
  {
    if (!odfElement.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME))
    {
      // this method applies only for draw:frame elements specifically
      return null;
    }

    // check if the current element fits the conditions
    String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classAttr != null && classAttr.contains(ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES))
    {
      String[] classes = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      for (int i = 0; i < classes.length; i++)
      {
        if (classes[i].startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_GR))
        {
          return classes[i];
        }
      }
    }

    // otherwise dig through its children
    NodeList list = htmlElement.getChildNodes();
    int length = list.getLength();
    for (int i = 0; i < length; i++)
    {
      Node item = list.item(i);
      if (item.getNodeType() == Node.ELEMENT_NODE)
      {
        String style = getDeepDrawFrameClassesGraphicStyleName(odfElement, (Element) item);
        if (style != null)
        {
          return style;
        }
      }
    }

    return null;
  }

  /**
   * Similarly to setParentFontSizeContext, sets the parent font size in the context, but in the scope of an ODFDraw element, such as
   * OdfDrawCustomShape, OdfDrawRect, OdfDrawEllipse, and OdfDrawCircle.
   *
   * This method was added by mich in the scope of defect 2896.
   *
   * @param context
   *          conversion context
   * @param odfElement
   *          odf element to work with
   */
  @SuppressWarnings("restriction")
  private void setParentFontSizeContextODFDraw(ConversionContext context, OdfElement odfElement)
  {
    // lookup both the draw:style-name and presentation:style-name attributes
    // one or the other may be set on an ODFDraw element, but never both at the same time
    String styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    OdfStyleFamily styleFamily = OdfStyleFamily.Graphic;
    if (styleName == null || styleName.length() == 0)
    {
      styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
      styleFamily = OdfStyleFamily.Presentation;
    }
    if (styleName == null || styleName.length() == 0)
    {
      // could not find any style name, bail out
      return;
    }

    String parentStyleName = ContentConvertUtil.getParentStyleName(context, styleName);
    if (parentStyleName == null || parentStyleName.length() == 0)
    {
      // could not find any parent style name, bail out
      return;
    }

    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    Double parentTextSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), parentStyleName, styleFamily);
    if (parentTextSize == null)
    {
      // could not determine a proper text size, bail out
      return;
    }

    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, parentTextSize);
  }

  /**
   * This method is used to protect more than one draw-frame node using the same style name with different style.
   *
   * @param context
   * @param element
   */
  // @SuppressWarnings({ "restriction", "unchecked" })
  // private void checkNodeStyle(ConversionContext context, OdfElement element)
  // {
  // String styleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
  // String odfAttrName = ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME;
  // OdfStyleFamily family = OdfStyleFamily.Graphic;
  // if ("".equals(styleName))
  // {
  // styleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
  // if ("".equals(styleName))
  // {
  // return;
  // }
  // odfAttrName = ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME;
  // family = OdfStyleFamily.Presentation;
  // }
  // // yangjun ,should replace styleMap by ODPConvertStyleMappingUtil
  // Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
  // // OdfElement style = styleMap.get(styleName);
  // List<Node> styleL = ODPConvertStyleMappingUtil.getStyleNameInContentNodesByKey(context, styleName);
  // if (styleL != null)
  // {
  // OdfElement style = (OdfElement) styleL.get(0);
  // Map<String, OdfElement> usedStyle = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_USED_STYLE_MAP);
  // if (usedStyle.containsKey(styleName))
  // {
  // style = (OdfElement) usedStyle.get(styleName).cloneNode(true);
  // styleName = CSSUtil.getStyleName(family, styleName);
  // element.setOdfAttributeValue(ConvertUtil.getOdfName(odfAttrName), styleName); // set the new odp file
  // style.setAttribute(ODFConstants.STYLE_NAME, styleName);
  // OdfFileDom contentDom = (OdfFileDom) context.get("target");
  // OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
  // autoStyles.appendChild(style);
  // styleMap.put(styleName, style);
  // ODPConvertStyleMappingUtil.addNodeToContent(context, style);
  // // styleName=newName;
  // // style=newStyle;
  // }
  // usedStyle.put(styleName, style);
  // }
  // }

  @SuppressWarnings({ "restriction" })
  protected void parseAttributes(ConversionContext context, Element htmlElement, OdfElement element, OdfElement odfParent)
  {
    // first parse the inline styles into a style map.
    Map<String, String> inlineStylesMap = ContentConvertUtil.buildStringStringMap(htmlElement.getAttribute("style"));
    context.put("inline-styles-map", inlineStylesMap);

    NamedNodeMap attributes = htmlElement.getAttributes();

    for (int i = 0; i < attributes.getLength(); i++)
    {
      Node attr = attributes.item(i);
      String nodeName = attr.getNodeName();

      if (ODPConvertConstants.HTML_ATTR_STYLE.equalsIgnoreCase(nodeName))
      {
        // checkNodeStyle(context, element);
        String styleValue = attr.getNodeValue();

        // For now prevent rotates images/shapes/textboxes from being moved/resized
        if (!styleValue.contains(ODPConvertConstants.CSS_ATTR_ROTATE))
        {
          convertLocationStyles(attr.getNodeValue(), element, context);
        }
      }
      else if (ContentConvertUtil.isPreservedAttribute(nodeName))
      {
        String qName = ContentConvertUtil.convertToQName(nodeName);
        if (ODPConvertConstants.ODF_ATTR_DRAW_LAYER.equalsIgnoreCase(qName))
        {
          if (htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).contains("layoutClass"))
          {
            // need set the draw:layer to layout.
            element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, ODPConvertConstants.HTML_VALUE_LAYOUT);
          }
          else
          {
            element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
          }
        }
        else if (definedForThisElement(nodeName) && element.getAttribute(qName).compareTo(attr.getNodeValue()) != 0)
        {
          // temp: work around.
          if ((attr.getNodeValue().length() > 0) && !attr.getNodeName().equalsIgnoreCase(attr.getNodeValue()))
          {
            element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
          }
        }
      }
    }

    // String preStyleName = element.getAttribute("presentation:style-name");
    // if (preStyleName != null && !"".equals(preStyleName))
    // {
    // /**
    // * update the content.xml presentation name.
    // */
    // Map<String, OdfStyle> preMap = (Map<String, OdfStyle>) context.get(ODPConvertConstants.CONTEXT_PRE_STYLE_NAME_MAP);
    // if (preMap != null)
    // {
    // OdfStyle style = preMap.get(preStyleName);
    // String page_template = (String) context.get(ODPConvertConstants.CONTEXT_PAGE_TEMPLATE_NAME);
    // if (style != null && page_template != null)
    // {
    // String oldName = style.getStyleParentStyleNameAttribute();
    // String postfix = oldName.substring(oldName.lastIndexOf("-"), oldName.length());
    // style.setStyleParentStyleNameAttribute(page_template + postfix);
    // }
    // }
    // }

    context.remove("inline-styles-map");
  }

  @SuppressWarnings({ "unchecked", "restriction" })
  protected Division convertLocationStyles(String styleValue, OdfElement element, ConversionContext context)
  {

    Map<String, String> styles = (Map<String, String>) context.get("inline-styles-map");

    Division division = new Division();
    String position = styles.get("position");

    String visibility = styles.get("visible");

    if ("hidden".equalsIgnoreCase(visibility))
    {
      return null;
    }

    division.setPositionType(position);

    boolean styleCloned = false;
    for (LOCATION_RANGE_TYPE typeName : LOCATION_RANGE_TYPE.values())
    {
      String valueStr = styles.get(typeName.toString());
      if (valueStr != null)
      {
        // contains the location type.
        String qName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_HTML).get(typeName.toString());
        String attributeValue = convertMetricsValues(valueStr, context, typeName);
        division.setValue(attributeValue, typeName.toString());
        // element.setAttribute(qName, attributeValue);
        String currentValue = element.getAttribute(qName);
        // Update the height or width if it has changed
        if (currentValue == null || currentValue.length() == 0 || MeasurementUtil.compare(currentValue, attributeValue) != 0)
        {
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attributeValue);

          if (element instanceof OdfDrawFrame)
          {
            // Update the min-height or min-width if the size of the draw frame has changed and the
            // style already contained a min-height or min-width
            // Note: If the draw frame is for a text box with a presentation style, the equivalent
            // update is done in DrawTextBoxConvertor.
            String styleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
            if (styleName != null && styleName.length() > 0)
            {
              Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
              OdfElement style = styleMap.get(styleName);
              if (style != null)
              {
                // Get the current fo:min-xxx property
                OdfStyleProperty property = OdfStyleGraphicProperties.MinHeight;
                if (typeName == LOCATION_RANGE_TYPE.width)
                {
                  property = OdfStyleGraphicProperties.MinWidth;
                }
                String currentMin = ((OdfStyleBase) style).getProperty(property);
                if (currentMin != null && currentMin.length() > 0 && MeasurementUtil.compare(currentMin, attributeValue) != 0)
                {
                  if (!styleCloned) // Not yet cloned?
                  {
                    // Create new presentation style to protect the initial presentation style (in case another
                    // draw:frame is using it but hasn't been resized)
                    OdfElement newStyle = (OdfElement) style.cloneNode(true);
                    String newName = CSSUtil.getStyleName(((OdfStyleBase) style).getFamily(), styleName);
                    newStyle.setAttribute(ODFConstants.STYLE_NAME, newName);
                    ((OdfStyleBase) newStyle).setProperty(property, attributeValue);
                    // Update the element to point to the cloned style
                    element.setAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, newName);
                    // Add the new style to the DOM
                    OdfFileDom odfDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
                    odfDom.getAutomaticStyles().appendChild(newStyle);
                    styleMap.put(newName, newStyle);
                    ODPConvertStyleMappingUtil.addNodeToContent(context, newStyle);
                    styleCloned = true;
                  }
                  else
                  {
                    ((OdfStyleBase) style).setProperty(property, attributeValue);
                  }
                }
              }
            }
          }
        }
      }
    }

    for (LOCATION_POINT_TYPE typeName : LOCATION_POINT_TYPE.values())
    {
      String valueStr = styles.get(typeName.toString());
      if (valueStr != null)
      {
        String qName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_HTML).get(typeName.toString());
        String attributeValue = convertMetricsValues(valueStr, context, typeName);
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attributeValue);
      }
    }

    // Check to see if we are working with a new or existing element.
    boolean copiedElement = isCopiedElement(context);

    if (copiedElement)
    { // Not an existing element, so set styles appropriately
      Map<String, String> copyPreserve = getCopyPreserveAttribute(context);
      if (copyPreserve == null)
      {
        return division; // Should not happen on a copied element
      }

      setCopiedAttrs(context, element);
    }

    return division;
  }

  protected void setCopiedAttrs(ConversionContext context, Element element)
  {
    Map<String, String> copyPreserve = getCopyPreserveAttribute(context);
    if (copyPreserve == null)
    {
      return; // Should not happen on a copied element
    }
    String layer = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_DRAW_LAYER);
    if (layer != null && layer.length() > 0)
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_LAYER),
          ODPConvertConstants.ODF_ATTR_DRAW_LAYER, layer);

    String styleName = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_DRAW_STYLE_NAME);
    if (styleName != null && styleName.length() > 0)
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, styleName);

    String textStyleName = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_TEXT_STYLE_NAME);
    if (textStyleName != null && textStyleName.length() > 0)
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME, textStyleName);

    String drawTextStyleName = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_DRAW_TEXT_STYLE_NAME);
    if (drawTextStyleName != null && drawTextStyleName.length() > 0)
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME, drawTextStyleName);

    String transform = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_DRAW_TRANSFORM);
    if (transform != null && transform.length() > 0)
    { // Because the element contains a transform, replace the height and width that was calculated above and
      // remove the x and y location because it is included in the transform. This implies we are not allowing
      // copied transformed object to be moved. It can be copied from one page to another, but it will be placed
      // in the same position.
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM),
          ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM, transform);
      String height = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_HEIGHT);
      if (height != null && height.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT),
            ODPConvertConstants.ODF_ATTR_SVG_HEIGHT, height);
      }
      String width = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_WIDTH);
      if (width != null && width.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_WIDTH),
            ODPConvertConstants.ODF_ATTR_SVG_WIDTH, width);
      }
      element.removeAttribute(ODPConvertConstants.ODF_ATTR_SVG_X);
      element.removeAttribute(ODPConvertConstants.ODF_ATTR_SVG_Y);
    }

    String viewBox = (String) copyPreserve.get(ODPConvertConstants.HTML_SVG_ATTR_SVGVIEWBOX);
    if (viewBox != null && viewBox.length() > 0)
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_SVG_ATTR_SVGVIEWBOX),
          ODPConvertConstants.ODF_SVG_ATTR_SVGVIEWBOX, viewBox);
  }

  protected String convertMetricsValues(String valueStr, ConversionContext context, IMetricsRelation relation)
  {
    MetricsUnit value = new MetricsUnit(valueStr);
    double cmValue = 0.0;
    switch (value.getType())
      {
        case PERCENTAGE :
          Division size = (Division) context.get("current-size");
          double pValue = 0.0;
          pValue = relation.relateWithWidth() ? size.getWidth().getRealValue() : size.getHeight().getRealValue();

          cmValue = pValue * value.getRealValue();
          break;
        case PX :
          cmValue = value.getRealValue() * ODPConvertConstants.CM_TO_INCH_CONV / 96;
          break;
        case CM :
        default:
          cmValue = value.getRealValue();
          break;
      }
    String attributeValue = MeasurementUtil.formatDecimal(cmValue) + "cm";

    return attributeValue;
  }

  @Override
  protected boolean definedForThisElement(String attrName)
  {
    if (attrName.startsWith("xlink"))
      return false;
    return true;
  }

  @SuppressWarnings("restriction")
  private void processCustomShapePreserveOnlyElements(OdfFileDom contentDom, OdfElement odfElement, Element htmlElement)
  {
    OdfElement newElement = null;

    // Get the list of div tags and go looking for the appropriate style tags
    NodeList children = htmlElement.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_DIV);
    for (int i = 0; i < children.getLength() && newElement == null; i++)
    {
      // Extract the graphic style and apply it accordingly
      Node child = children.item(i);
      if (child instanceof Element)
      {
        Element e = (Element) child;
        NamedNodeMap attrs = e.getAttributes();
        for (int j = 0; j < attrs.getLength(); j++)
        {
          Node attr = attrs.item(j);
          String attrName = attr.getNodeName();
          if (attrName != null && attrName.startsWith(ODPConvertConstants.HTML_ATTR_PRESERVE_ONLY))
          {
            String attrValue = attr.getNodeValue();
            if (attrValue.length() > 0)
            {
              newElement = ContentConvertUtil.unflattenElement(contentDom, attrValue);
              if (null != newElement)
                odfElement.appendChild(newElement);
            }
          }
        }
      }
    }
  }

  /**
   *
   * @param context
   * @return true if we are processing an existing element
   */
  protected boolean isCopiedElement(ConversionContext context)
  {
    Boolean bCopiedElement = (Boolean) context.get(ODPConvertConstants.CONTEXT_COPIED_ELEMENT);
    if (bCopiedElement == null)
      return false;
    else
      return bCopiedElement.booleanValue();
  }

  /**
   * returns the copyforpreserve attribute from the context if it exists
   *
   * @param context
   * @return Map of attribute settings or null if not there
   */
  @SuppressWarnings("unchecked")
  protected Map<String, String> getCopyPreserveAttribute(ConversionContext context)
  {
    Map<String, String> copyPreserve = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_COPY_PRESERVE_MAP);
    if (copyPreserve == null)
    {
      return null;
    }
    return copyPreserve;
  }

  /**
   *
   * @return true if shape is Modifiable
   */
  protected boolean isModifiableShape()
  {
    return false;
  }

  private void disablePlaceHolderObj(Element htmlElement)
  {
    NamedNodeMap attrs = htmlElement.getAttributes();
    for (int j = 0; j < attrs.getLength(); j++)
    {
      Node attr = attrs.item(j);
      String attrName = attr.getNodeName();
      if (attrName != null && attrName.startsWith(ODPConvertConstants.HTML_ATTR_PRESERVE_ONLY))
        htmlElement.removeAttributeNode((Attr) attr);
    }
  }

  private void removePreservedObj(OdfElement element)
  {
    NodeList childs = element.getChildNodes();
    for (int i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (child instanceof OdfDrawObject)
        element.removeChild(child);
    }
  }

  private void updatePlaceholderValue(OdfElement odfElement)
  {
    String placeholder = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_PLACEHOLDER);
    if ("false".equals(placeholder))
    {
      Node node = odfElement.getFirstChild();
      if (node != null && node.getFirstChild() == null)
        odfElement.setAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_PLACEHOLDER, "true");
    }
  }
}
