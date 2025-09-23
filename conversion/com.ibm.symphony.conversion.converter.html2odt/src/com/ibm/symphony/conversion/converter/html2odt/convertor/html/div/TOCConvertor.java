package com.ibm.symphony.conversion.converter.html2odt.convertor.html.div;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.style.StyleColumnsElement;
import org.odftoolkit.odfdom.dom.element.style.StyleSectionPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleStyleElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.DIVConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class TOCConvertor extends DIVConvertor
{
  
  
  
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String divclass = htmlElement.getAttribute("class");
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (divclass.startsWith("TOC_Imported"))// An imported TOC, no update, just preserve
    {
      parent.appendChild(odfElement);
      return;
    }
    else if (divclass.equals("TOC placeholder_container"))
    {     
      if (odfElement == null)// A new TOC
      {
        convertNewTOC(context, htmlElement, parent);
      }
      else
      {  // An imported TOC, has updated
        parent.appendChild(odfElement);
        convertUpdatedTOC(context, htmlElement, parent);
      }
      return;
    }
  }

  @SuppressWarnings("restriction")
  protected void convertNewTOC(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfFileDom odfFileDom = XMLConvertorUtil.getCurrentFileDom(context);
    OdfOfficeAutomaticStyles automaticStyles = odfFileDom.getAutomaticStyles();
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfOfficeStyles officeStyles;
    try
    {
      officeStyles = ((OdfDocument) context.getTarget()).getStylesDom().getOfficeStyles();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return;
    }

    OdfStyle sect1Style = (OdfStyle) automaticStyles.newStyleStyleElement("section", "Sect" + UUID.randomUUID().toString().substring(0, 4));
    StyleSectionPropertiesElement sectionPro = sect1Style.newStyleSectionPropertiesElement();
    sectionPro.setStyleEditableAttribute(false);
    StyleColumnsElement columnPro = sectionPro.newStyleColumnsElement(1);
    columnPro.setFoColumnGapAttribute("0cm");
    String htmlStyle = htmlElement.getAttribute("style");
    if (htmlStyle.contains(HtmlCSSConstants.BACKGROUND_COLOR))
    {
      Map<String, String> cssMap = ConvertUtil.buildCSSMap(htmlStyle);
      Iterator<Entry<String, String>> it = cssMap.entrySet().iterator();
      while (it.hasNext())
      {
        Entry<String, String> entry = it.next();
        if (HtmlCSSConstants.BACKGROUND_COLOR.equals(entry.getKey()))
        {
          sectionPro.setFoBackgroundColorAttribute(entry.getValue());
        }
      }
    }

    OdfElement tableOfContent = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_TABLE_OF_CONTENT));
    indexTable.addEntryByHtmlNode(htmlElement, tableOfContent);
    ((OdfStylableElement) tableOfContent).setStyleName(sect1Style.getStyleNameAttribute());
    tableOfContent.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_NAME), "Table of Contents1");
    parent.appendChild(tableOfContent);

    OdfElement tableOfContentSource = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_TABLE_OF_CONTENT_SOURCE));
    tableOfContentSource.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_OUTLINE_LEVEL), "10");
    tableOfContent.appendChild(tableOfContentSource);

    OdfStyle contentsHeadingStyle = (OdfStyle) officeStyles.getStyle("Contents_20_Heading", OdfStyleFamily.Paragraph);
    if (contentsHeadingStyle == null)
    {
      contentsHeadingStyle = (OdfStyle) officeStyles.newStyleStyleElement("paragraph", "Contents_20_Heading");
      contentsHeadingStyle.setStyleDisplayNameAttribute("Contents Heading");
      contentsHeadingStyle.setStyleParentStyleNameAttribute("Heading");
      contentsHeadingStyle.setStyleClassAttribute("index");
    }
    OdfElement indexTitleTemplate = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_TITLE_TEMPLATE));
    indexTitleTemplate.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_STYLE_NAME), "Contents_20_Heading");
    tableOfContentSource.appendChild(indexTitleTemplate);

    String tocTitle = htmlElement.getFirstChild().getFirstChild().getNodeValue();
    Text titleNode1 = odfFileDom.createTextNode(tocTitle);
    indexTitleTemplate.appendChild(titleNode1);

    OdfStyle indexLinkStyle = (OdfStyle) officeStyles.getStyle("Index_20_Link", OdfStyleFamily.Text);
    if (indexLinkStyle == null)
    {
      indexLinkStyle = (OdfStyle) officeStyles.newStyleStyleElement("text", "Index_20_Link");
      indexLinkStyle.setStyleDisplayNameAttribute("Index Link");
    }

    for (int i = 1; i < 11; i++)
    {
      OdfElement tocEntryTemplate = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_TABLE_OF_CONTENT_ENTRY_TEMPLATE));
      tocEntryTemplate.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_OUTLINE_LEVEL), Integer.toString(i));
      tocEntryTemplate.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_STYLE_NAME), "Contents_20_" + Integer.toString(i));

      OdfElement indexEntryLinkStart = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_ENTRY_LINK_START));
      indexEntryLinkStart.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_STYLE_NAME), "Index_20_Link");
      tocEntryTemplate.appendChild(indexEntryLinkStart);

      OdfElement indexEntryChapter = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_ENTRY_CHAPTER));
      tocEntryTemplate.appendChild(indexEntryChapter);

      OdfElement indexEntryText = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_ENTRY_TEXT));
      tocEntryTemplate.appendChild(indexEntryText);

      OdfElement indexEntryTabStop = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_ENTRY_TAB_STOP));
      indexEntryTabStop.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_TYPE), "right");
      indexEntryTabStop.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_LEADER_CHAR), ".");
      tocEntryTemplate.appendChild(indexEntryTabStop);

      OdfElement indexEntryPageNumber = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_ENTRY_PAGE_NUMBER));
      tocEntryTemplate.appendChild(indexEntryPageNumber);

      OdfElement indexEntryLinkEnd = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_ENTRY_LINK_END));
      tocEntryTemplate.appendChild(indexEntryLinkEnd);

      tableOfContentSource.appendChild(tocEntryTemplate);
    }

    OdfElement indexBody = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_BODY));
    tableOfContent.appendChild(indexBody);

    OdfElement indexTitle = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_TITILE));
    ((OdfStylableElement) indexTitle).setStyleName(sect1Style.getStyleNameAttribute());
    indexTitle.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_NAME), "Table of Contents1_Head");
    indexBody.appendChild(indexTitle);

    updateStyle(context, htmlElement);
    convertChildren(context, htmlElement, indexBody);
    updateIndexBody(indexBody, automaticStyles, officeStyles);
  }

  @SuppressWarnings("restriction")
  protected void convertUpdatedTOC(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfFileDom odfFileDom = XMLConvertorUtil.getCurrentFileDom(context);
    OdfOfficeAutomaticStyles automaticStyles = odfFileDom.getAutomaticStyles();
    OdfOfficeStyles officeStyles;
    try
    {
      officeStyles = ((OdfDocument) context.getTarget()).getStylesDom().getOfficeStyles();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return;
    }

    OdfStyle sect1Style = (OdfStyle) automaticStyles.newStyleStyleElement("section", "Sect" + UUID.randomUUID().toString().substring(0, 4));
    StyleSectionPropertiesElement sectionPro = sect1Style.newStyleSectionPropertiesElement();
    sectionPro.setStyleEditableAttribute(false);
    StyleColumnsElement columnPro = sectionPro.newStyleColumnsElement(1);
    columnPro.setFoColumnGapAttribute("0cm");

    OdfStyle indexLinkStyle = (OdfStyle) officeStyles.getStyle("Index_20_Link", OdfStyleFamily.Text);
    if (indexLinkStyle == null)
    {
      indexLinkStyle = (OdfStyle) officeStyles.newStyleStyleElement("text", "Index_20_Link");
      indexLinkStyle.setStyleDisplayNameAttribute("Index Link");
    }

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement tableOfContent = indexTable.getFirstOdfNode(htmlElement);
    ((OdfStylableElement) tableOfContent).setStyleName(sect1Style.getStyleNameAttribute());
    OdfElement tableOfContentSource = (OdfElement) tableOfContent.getFirstChild();
    OdfElement indexBody = (OdfElement) tableOfContent.getLastChild();
    OdfElement indexTitleTemplate = (OdfElement) tableOfContentSource.getFirstChild();
    Node firstP = htmlElement.getFirstChild();
    if (firstP instanceof Element)
    {
      String firstPClass = ((Element) firstP).getAttribute(HtmlCSSConstants.CLASS);
      if (firstPClass != null && (firstPClass.contains("tocTitle") || firstPClass.contains("toc_title")))
      {
        String tocTitle = firstP.getFirstChild().getNodeValue();
        Text titleNode1 = odfFileDom.createTextNode(tocTitle);
        Node titleNodeOld = indexTitleTemplate.getFirstChild();
        if (titleNodeOld != null)
          indexTitleTemplate.replaceChild(titleNode1, indexTitleTemplate.getFirstChild());
        else
          indexTitleTemplate.appendChild(titleNode1);

        OdfElement indexTitle = (OdfElement) indexBody.getFirstChild();
        if (indexTitle != null && indexTitle.getNodeName().equals(ODFConstants.TEXT_INDEX_TITILE))
        {
          ((OdfStylableElement) indexBody.getFirstChild()).setStyleName(sect1Style.getStyleNameAttribute());
        }
        else
        {
          indexTitle = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_INDEX_TITILE));
          ((OdfStylableElement) indexTitle).setStyleName(sect1Style.getStyleNameAttribute());
          indexTitle.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_NAME), "Table of Contents1_Head");
          if (indexBody.getChildNodes() == null)
            indexBody.appendChild(indexTitle);
          else
            indexBody.insertBefore(indexTitle, indexBody.getFirstChild());
        }
      }
    }
    updateStyle(context, htmlElement);
    convertChildren(context, htmlElement, indexBody);
    updateIndexBody(indexBody, automaticStyles, officeStyles);
  }
  
  private void updateStyle(ConversionContext context, Element htmlElement)
  {
    Map<String, Map<String, String>> wholeMap = (Map<String, Map<String, String>>) context.get(Constants.TEMPLATE_STYLE_TOC_SOURCE);
    NodeList nodeList = htmlElement.getChildNodes();
    for (int i = 0; i < nodeList.getLength(); i++)
    {
      Element p = (Element) nodeList.item(i);
      String pClass = p.getAttribute("class");
      Map<String, String> cssMap = wholeMap.get("div p." + pClass);
      // merge the css from cssMap to style string
      if (cssMap != null && !cssMap.isEmpty())
      {
        String styleString = p.getAttribute("style");
        StringBuffer style = new StringBuffer("");
        style.append(styleString);
        for (String key : cssMap.keySet())
          style.append(key + ":" + cssMap.get(key) + ";");
        p.setAttribute("style", style.toString());
      }
    }
  }

  @SuppressWarnings("restriction")
  private void updateIndexBody(OdfElement indexBody, OdfOfficeAutomaticStyles automaticStyles, OdfOfficeStyles officeStyles)
  {
    Node indexTitle = indexBody.getFirstChild();
    Node textP = indexTitle;
    if (ODFConstants.TEXT_INDEX_TITILE.equals(indexTitle.getNodeName()))
    {
      OdfElement p = (OdfElement) indexTitle.getNextSibling();
      String pStyleName = p.getAttribute(ODFConstants.TEXT_STYLE_NAME);
      OdfStyle pStyle = automaticStyles.getStyle(pStyleName, OdfStyleFamily.Paragraph);
      pStyle.setStyleParentStyleNameAttribute("Contents_20_Heading");
      String id = p.getAttribute("id");
      p.removeAttribute("id");
      Node pClone = p.cloneNode(true);
      ((OdfElement) pClone).setAttribute("id", id);
      indexTitle.appendChild(pClone);
      textP = p.getNextSibling();
      indexBody.removeChild(p);
    }

    while (textP != null)
    {
      Node textA = textP.getFirstChild();
      if (textP.getNodeName().equals(ODFConstants.TEXT_P) && textA != null && textA.getNodeName().equals(ODFConstants.TEXT_A))
      {
        OdfElement odfP = (OdfElement) textP;
        OdfElement odfA = (OdfElement) textA;
        String link = odfA.getAttribute(ODFConstants.XLINK_HREF);
        int blankPos = link.indexOf("_");
        String sn = link.substring(0, blankPos);
        int level = sn.split("\\.").length;
        if (blankPos == 0 || level == 0)
          continue;
        odfA.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_HREF), sn + link.substring(blankPos + 1));
        odfA.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_TYPE), "simple");
        odfA.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_STYLE_NAME), "Index_20_Link");
        odfA.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_VISITED_STYLE_NAME), "Index_20_Link");
        String textPStyleName = odfP.getAttribute(ODFConstants.TEXT_STYLE_NAME);
        String contentStyleName = "Contents_20_" + level;
        OdfStyle contentsStyle = (OdfStyle) officeStyles.getStyle(contentStyleName, OdfStyleFamily.Paragraph);
        if (contentsStyle == null)
        {
          contentsStyle = (OdfStyle) officeStyles.newStyleStyleElement("paragraph", contentStyleName);
          contentsStyle.setStyleDisplayNameAttribute("Contents " + level);
          contentsStyle.setStyleParentStyleNameAttribute("Index");
          contentsStyle.setStyleClassAttribute("index");
        }
        if (textPStyleName == null || textPStyleName.equals(""))
          ((StyleStyleElement) odfP).setStyleNameAttribute(contentStyleName);
        else
        {
          OdfStyle textPStyle = automaticStyles.getStyle(textPStyleName, OdfStyleFamily.Paragraph);
          textPStyle.setStyleParentStyleNameAttribute(contentStyleName);
        }
      }
      textP = textP.getNextSibling();
    }
  }
}
