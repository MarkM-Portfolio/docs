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

import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleListLevelProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.template.ListTemplateParser;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

/**
 * Convert List entry from html2odp.
 * 
 */
public class ListConvertor extends GeneralODPConvertor
{
  private static final Logger LOG = Logger.getLogger(ListConvertor.class.toString());

  private int level = 0;
  private int oldLevel = 0;
  private String listStyleName = null;
  private String oldListStyleName = null;
  private String originalListStyleName = null;
  private boolean hasStyleInODF = false;// If true, odp contains listStyleName, no need new create list style.
  //Info about previous list node
  private int prevLevel = 0;
  private String prevListStyleName = null;
  private OdfElement prevListItemElement = null;
  
  private static Logger log = Logger.getLogger(ListConvertor.class.getName());

  @SuppressWarnings("restriction")
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
	try{
	    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
	    
	    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
	    if (indexTable.isHtmlNodeIndexed((Element) htmlNode))
	    {
	      OdfElement originalOdfElement = indexTable.getFirstOdfNode((Element) htmlNode);
	      Node parent = originalOdfElement.getParentNode();
	      if(parent != null)
	      {
	        parent.removeChild(originalOdfElement);
	        indexTable.removeEntriesByHtmlNode(htmlNode);
	      }
	    }
	    
	    OdfElement odfElement = null;
	    
	    Node prevNode = htmlNode.getPreviousSibling();
	    Element listItemNode = (Element) htmlNode.getFirstChild();
	    initListValues(context, listItemNode);
	    
	    if(listStyleName.equals(prevListStyleName) && prevNode != null && htmlNode.getNodeName().equals(prevNode.getNodeName()))
	    {
	      int levelDiff = level - prevLevel;
	      if(levelDiff == 0)
	      {
	        odfElement = (OdfElement) prevListItemElement.getParentNode();
	      }
	      else if(levelDiff == 1)
	      {
	        odfElement = newList(context, htmlNode);
	        prevListItemElement.appendChild(odfElement);
	      }
	      else if(levelDiff > 1)
	      {
	        OdfElement list = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST), ODPConvertConstants.ODF_ELEMENT_TEXTLIST);
	        prevListItemElement.appendChild(list);
	        OdfElement listItem = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM), ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM);
	        list.appendChild(listItem);       
	        for(int i=1; i<levelDiff-1; i++)
	        {
	          list = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST), ODPConvertConstants.ODF_ELEMENT_TEXTLIST);
	          listItem.appendChild(list);
	          listItem = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM), ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM);
	          list.appendChild(listItem);
	        }
	        odfElement = newList(context, htmlNode);
	        listItem.appendChild(odfElement);
	      }
	      else if(levelDiff < 0)
	      {
	        OdfElement parentElement = prevListItemElement;
	        for(int i=0; i<0-levelDiff; i++)
	        {
	          parentElement = (OdfElement) parentElement.getParentNode().getParentNode();
	        }
	        odfElement = (OdfElement) parentElement.getParentNode();
	      }
	    }
	    else
	    {
	      odfElement = newList(context, htmlNode);
	      context.put("CurrentListStyleName", listStyleName);
	      if(level == 1)
	      {
	        odfParent.appendChild(odfElement);
	        if(!"".equals(listStyleName))
	          ((TextListElement) odfElement).setTextStyleNameAttribute(listStyleName);
	      }
	      else
	      {
	        OdfElement list = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST), ODPConvertConstants.ODF_ELEMENT_TEXTLIST);
	        odfParent.appendChild(list);
	        if(!"".equals(listStyleName))
	          ((TextListElement) list).setTextStyleNameAttribute(listStyleName);
	        OdfElement listItem = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM), ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM);
	        list.appendChild(listItem);       
	        for(int i=1; i<level-1; i++)
	        {
	          list = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST), ODPConvertConstants.ODF_ELEMENT_TEXTLIST);
	          listItem.appendChild(list);
	          listItem = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM), ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM);
	          list.appendChild(listItem);
	        }
	        listItem.appendChild(odfElement);
	      }
	      try{
	    	  parseListStyle(context, htmlNode);
	      }catch(Exception e){
	    	  log.severe("ParseListStyle listStyleName "+listStyleName + " failed");
	      } 
	    }
	    context.put("CurrentListLevel", level);
	    
	    convertChildren(context, (Element) htmlNode, odfElement);
	 } catch (Exception e){
			LOG.log(Level.WARNING, "The following content may be lost: " + getTextContent(htmlNode,""), e);
	 };
  }
  
  private void initListValues(ConversionContext context, Element listItemNode)
  {
    prevListStyleName = (String) context.get("CurrentListStyleName");
    prevListItemElement = (OdfElement) context.get("CurrentListItemElement");
    if(context.get("CurrentListLevel") == null)
      prevLevel = 0;
    else
      prevLevel = (Integer) context.get("CurrentListLevel");
    
    String lilevel = listItemNode.getAttribute("level");
    if(lilevel==null || lilevel.length()==0 || lilevel.equalsIgnoreCase("NaN")){
    	lilevel = "1";
    }
    level = Integer.parseInt(lilevel);
    oldLevel = getOldLevel(listItemNode);
    oldListStyleName = listItemNode.getAttribute("_oldstylename");
    listStyleName = getListStyleName(context, listItemNode);
  }

  private String getListStyleName(ConversionContext context, Element listItemNode)
  {
    listStyleName = null;
    originalListStyleName = null;
    hasStyleInODF = false;
    Map<String, String> newListStyleNameMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_NEW_LIST_STYLE_NAME_MAP);
    if(oldLevel != 0)// 1.imported list item, or 2.copy/paste imported list item, or 3.new next list item after imported list item
    {
      listStyleName = oldListStyleName;
      if(level == oldLevel)// no change level
      {
        hasStyleInODF = true;
      }
      else // change level
      {
        if(isODFStyleConsistentWidthEidtorStyle(context))
        {
          hasStyleInODF = true;
        }
        else
        {
          String key = listStyleName+"_L"+oldLevel+"-L"+level;
          if(newListStyleNameMap.containsKey(key))
          {
            listStyleName = newListStyleNameMap.get(key);
            hasStyleInODF = true;
          }
          else
          {
            String newListStyleName = listStyleName + "_" + UUID.randomUUID().toString().substring(0, 4);
            newListStyleNameMap.put(key, newListStyleName);
            listStyleName = newListStyleName;
          }
        }
      }
    }
    else // new list item
    {
      String className = listItemNode.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      String[] classNames = className.trim().split(" ");
      for(int i=0; i<classNames.length; i++)
      {
        if(classNames[i].startsWith("lst-") && !classNames[i].startsWith("lst-MR-"))// Customized list, use liststyle.css style
        {
          listStyleName = classNames[i].trim();
          originalListStyleName = listStyleName;
          if(newListStyleNameMap.containsKey(listStyleName))
          {
            listStyleName = newListStyleNameMap.get(listStyleName);
            hasStyleInODF = true;
          }
          else
          {
            String newListStyleName = listStyleName + "_" + UUID.randomUUID().toString().substring(0, 4);
            newListStyleNameMap.put(listStyleName, newListStyleName);
            listStyleName = newListStyleName;
          }
          break;
        }
      }
      if(listStyleName == null)//Use master list style
      {
        String masterStyleName = (String) context.get(ODPConvertConstants.CONTEXT_DRAWFRAME_MASTER_PRES_NAME);
        originalListStyleName = masterStyleName;
        if(newListStyleNameMap.containsKey(masterStyleName))
        {
          listStyleName = newListStyleNameMap.get(masterStyleName);
          hasStyleInODF = true;
        }
        else
        {
          listStyleName = "ML_" + UUID.randomUUID().toString().substring(0, 4);
          newListStyleNameMap.put(masterStyleName, listStyleName);
        }
      }
    }
    
    return listStyleName;
  }
  
  private int getOldLevel(Element htmlNode)
  {
    String oldLevel = htmlNode.getAttribute("_oldlevel");
    if(oldLevel!=null && !oldLevel.equals("") && !oldLevel.equalsIgnoreCase("NaN"))
      return Integer.parseInt(oldLevel);
    else
      return 0;
  }
  
  protected void convertChildren(ConversionContext context, Element htmlParent, OdfElement odfParent)
  {
    Node childNode = htmlParent.getFirstChild();
    while(childNode != null)
    {
      if (childNode instanceof Element)
      {
        IConvertor convertor = ODPConvertFactory.getInstance().getConvertor(childNode);
        convertor.convert(context, childNode, odfParent);
      }
      childNode = childNode.getNextSibling();
    }
  }
  
  private OdfElement newList(ConversionContext context, Element htmlNode)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    String odfNodeName = getOdfNodeName(htmlNode);
    OdfElement odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
    indexTable.addEntryByHtmlNode((Element) htmlNode, odfElement);
    
    return odfElement;
  }

  protected void parseListStyle(ConversionContext context, Element htmlNode)
  {
    if (hasStyleInODF)
      return;
    
    if(oldLevel == 0)//new created list in Concord. Use master style or customized style
    {
      if(listStyleName.startsWith("lst-"))//Customized style. Use style from liststyle.css
      {
        ListTemplateParser parser = new ListTemplateParser();
        OdfTextListStyle newListStyle = parser.convertCSStoODF(context, listStyleName, htmlNode);
        if(newListStyle==null) return;
        // Save the new list style
        OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
        OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
        autoStyles.appendChild(newListStyle);
      }
      else
      {
        copyListMasterStyleIntoContentDom(context, originalListStyleName, listStyleName);
      }
    }
    else//old created list by Symphony, change level in Concord
    {
      updateListMarginForLevel(context, oldListStyleName, listStyleName, oldLevel, level);
    }
  }
  
  private void updateListMarginForLevel(ConversionContext context, String originalStyleName, String styleName, int oldLevel, int newLevel)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    OdfDocument odfDoc = contentDom.getOdfDocument();
    OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
    OdfTextListStyle oldListStyle = CSSUtil.getOldListStyle(odfDoc, originalStyleName);
    if (oldListStyle == null)
      return;
    
    OdfTextListStyle newListStyle = autoStyles.newListStyle();
    newListStyle.setStyleNameAttribute(styleName);
    
    TextListLevelStyleElementBase oldLevelDetails = oldListStyle.getLevel(oldLevel);       
    OdfStyleListLevelProperties oldLevelListProp = (OdfStyleListLevelProperties) oldLevelDetails.getPropertiesElement(OdfStylePropertiesSet.ListLevelProperties);
    String levelSpaceBefore = oldLevelListProp.getTextSpaceBeforeAttribute();
    double spaceBefore = 0.0;
    if(levelSpaceBefore != null && !"".equals(levelSpaceBefore))
      spaceBefore = ConvertUtil.convertUnitToCM(levelSpaceBefore);
    spaceBefore += (newLevel- oldLevel)*ODPConvertConstants.INCREASE_INDENT;
    
    int numLevels = oldListStyle.getChildNodes().getLength();   
    for(int i=1; i<= numLevels; i++)
    {
      TextListLevelStyleElementBase oldLevelInfo = oldListStyle.getLevel(i);
      Node newLevelDetails = oldLevelInfo.cloneNode(true);
      ((Element) newLevelDetails).setAttribute(ODPConvertConstants.ODF_ATTR_TEXT_LEVEL, Integer.toString(i));
      OdfStyleListLevelProperties newLevelListProp = (OdfStyleListLevelProperties) ((OdfStyleBase) newLevelDetails).getPropertiesElement(OdfStylePropertiesSet.ListLevelProperties);
      
      double newLevelSpaceBefore = (i - newLevel)*ODPConvertConstants.INCREASE_INDENT + spaceBefore;
      newLevelListProp.setTextSpaceBeforeAttribute(MeasurementUtil.formatDecimal(newLevelSpaceBefore, 2)+"cm");
      
      newListStyle.appendChild(newLevelDetails);
    }

    // Save the new list style
    autoStyles.appendChild(newListStyle);
  }
  
  private boolean isODFStyleConsistentWidthEidtorStyle(ConversionContext context)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    OdfDocument odfDoc = contentDom.getOdfDocument();
    OdfTextListStyle listStyle = CSSUtil.getOldListStyle(odfDoc, oldListStyleName);
    if (listStyle == null)
      return false;
    
    TextListLevelStyleElementBase basicLevelDetails = listStyle.getLevel(oldLevel); 
    TextListLevelStyleElementBase levelDetails = listStyle.getLevel(level); 
    OdfStyleListLevelProperties basicLevelProp = (OdfStyleListLevelProperties) basicLevelDetails.getPropertiesElement(OdfStylePropertiesSet.ListLevelProperties);
    String basicLevelSpaceBefore = basicLevelProp.getTextSpaceBeforeAttribute();
    OdfStyleListLevelProperties levelProp = (OdfStyleListLevelProperties) levelDetails.getPropertiesElement(OdfStylePropertiesSet.ListLevelProperties);
    String levelSpaceBefore = levelProp.getTextSpaceBeforeAttribute();
    
    double basicSpaceBefore = 0.0;
    double spaceBefore = 0.0;
    if(basicLevelSpaceBefore != null && !"".equals(basicLevelSpaceBefore))
      basicSpaceBefore = ConvertUtil.convertUnitToCM(basicLevelSpaceBefore);
    if(levelSpaceBefore != null && !"".equals(levelSpaceBefore))
      spaceBefore = ConvertUtil.convertUnitToCM(levelSpaceBefore);
    double newSpaceBefore = basicSpaceBefore + (level-oldLevel)*ODPConvertConstants.INCREASE_INDENT;
    double diff = (newSpaceBefore- spaceBefore)/spaceBefore;
    if(Math.abs(diff) >= 0.05)
      return false;
    
    boolean consistent = true;
    levelDetails.setAttribute(ODPConvertConstants.ODF_ATTR_TEXT_LEVEL, String.valueOf(oldLevel));
    levelProp.setAttribute(ODPConvertConstants.ODF_ATTR_TEXT_SPACE_BEFORE, basicLevelSpaceBefore);
    
    if(!basicLevelDetails.isEqualNode(levelDetails))
      consistent = false;
    
    levelDetails.setAttribute(ODPConvertConstants.ODF_ATTR_TEXT_LEVEL, String.valueOf(level));
    levelProp.setAttribute(ODPConvertConstants.ODF_ATTR_TEXT_SPACE_BEFORE, levelSpaceBefore);
    
    return consistent;
  }

  @SuppressWarnings("restriction")
  private void copyListMasterStyleIntoContentDom(ConversionContext context, String mlListStyleName, String listStyleName)
  {
    OdfFileDom stylesDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_STYLES_DOM);
    
    OdfStyle masterStyle = stylesDom.getOfficeStyles().getStyle(mlListStyleName, OdfStyleFamily.Presentation);
    if(masterStyle != null)
    {
      NodeList nodelist = masterStyle.getElementsByTagName(ODPConvertConstants.ODF_STYLE_TEXT_LIST);
      if(nodelist.getLength()>0)
      {
        Node node = nodelist.item(0);
        OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
        try
        {
          OdfTextListStyle listStyle = (OdfTextListStyle) OdfDomUtil.cloneNode(contentDom, node, true);
          listStyle.setStyleNameAttribute(listStyleName);
          listStyle.removeAttribute(ODPConvertConstants.ODF_ATTR_STYLE_DISPLAY_NAME);
          contentDom.getAutomaticStyles().appendChild(listStyle);
        }
        catch (Exception e)
        {
          log.severe("Clone List Style Node Failed.");
        }
      }
    }
  }

}
