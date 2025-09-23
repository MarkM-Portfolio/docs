/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.io.File;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.text.OdfTextAuthorName;
import org.odftoolkit.odfdom.doc.text.OdfTextDate;
import org.odftoolkit.odfdom.doc.text.OdfTextFileName;
import org.odftoolkit.odfdom.doc.text.OdfTextPageNumber;
import org.odftoolkit.odfdom.doc.text.OdfTextTime;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.image.ODPImageConvertor;

public class GeneralContentHtmlConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = GeneralContentHtmlConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    // required by editor, no embedded <br> under <span>
    // even there is <text:line-break> under <text:span>
    if (doesSpanContainOnlyOneLinebreak(odfElement))
    {
    	Element brhtmlElement =  addHtmlElement( odfElement.getFirstChild(), htmlParent, context);
    	brhtmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, "text_line-break");
        odfElement.removeChild(odfElement.getFirstChild());
    }
    
    //an empty span with 8203 will follow a text_line-break. if there is a span node with content after line-break then 
    //remove the empty 8203 span for line-break to keep same logical as Editor. 
    String name = odfElement.getNodeName();
    if (name.equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN)) {
    	Node preSpan = htmlParent.getLastChild();
    	if(preSpan != null && preSpan.getNodeName().equalsIgnoreCase("span")){
    		if(preSpan.hasChildNodes() && preSpan.getChildNodes().getLength() ==1){
    			Node textNode = preSpan.getFirstChild();
    			String sv = textNode.getNodeValue();
    			if(sv == null || sv.isEmpty()) {
    				htmlParent.removeChild(preSpan);
    			} else if(sv.equalsIgnoreCase(String.valueOf((char)8203))){
    				htmlParent.removeChild(preSpan);
    			}
    		}
    	}
    }
    		
    Element htmlElement = addHtmlElement(odfElement, htmlParent, context);
    // here the parent size in context will be changed.
    // Note: The reason we call parseAttributes2 if it is a field is that 
    // we store an attribute based on field type on the parent. 
    if ((htmlElement != htmlParent) || isField(odfElement))
    {
      htmlElement = parseAttributes2(odfElement, htmlElement, context);
    }
    replaceClassName(context, htmlElement);
    
    convertChildren(context, odfElement, htmlElement);
    
    addDefaultParaForEmptyPH(context, htmlElement);
    if (odfElement.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_LINE_BREAK)){
    	Document doc = (Document) context.getTarget();
    	Element e = doc.createElement("span");
    	Node t = doc.createTextNode("\u200b");
        e.appendChild(t);
        htmlElement.getParentNode().appendChild(e);
        forceLineHeight(context, e);
        //to keep same logical with Editor. if the BR text-line-break is first child of line. 
        //add an empty 8203 span before it.
        Node preNode = htmlElement.getPreviousSibling();
        if(preNode == null) {
        	Element prespan = doc.createElement("span");
        	Node pretext = doc.createTextNode("\u200b");
        	prespan.appendChild(pretext);
        	htmlElement.getParentNode().insertBefore(prespan, htmlElement);
        	forceLineHeight(context, prespan);
        }
    }
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
  }
  
  private boolean doesSpanContainOnlyOneLinebreak(Node node) {
    // 	<text:span text:style-name="T130">
    //     <text:line-break/>
    //  </text:span>
    // refer to fix of D32061
    NodeList children = node.getChildNodes();
    String name = node.getNodeName();
    if (name.equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN)
        && children.getLength() == 1
        && children.item(0).getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_LINE_BREAK))
    {
        return true;
    }
    return false;
  }

  private void addDefaultParaForEmptyPH(ConversionContext context, Element htmlElement){
  	if(!htmlElement.hasChildNodes()){
  		String preClassName = (String)context.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
  		String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
  		if(preClassName == null || master_name == null)
  			return;

  		double parentSizeInEm =
  			(Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE)/18.0;
  		String fontSizeInStyle =
  			ODPConvertConstants.CSS_FONT_SIZE + ":" + String.valueOf(parentSizeInEm) + "em";

  		Document htmlDoc = (Document) context.getTarget();
  		if(preClassName.equals("outline")){
  			Element ulElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_UL);
  			String ulClass = "text_list";// defaultContentText cb_";
  			//ulClass += preClassName;
  			ulElement.setAttribute("class", ulClass);
  			ODPConvertUtil.setAutomaticHtmlConcordId(ulElement, "");
  			htmlElement.appendChild(ulElement);
  			Element liElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_LI);
  			String strClass = "text_list-item defaultContentText cb_";
  			strClass += preClassName;
  			strClass += " ML_"+master_name +"_"+preClassName+"_1 ";
  			strClass += "MP_"+master_name +"_"+preClassName+"_1 ";
  			liElement.setAttribute("class", strClass);
  			liElement.setAttribute("level", "1");
  			liElement.setAttribute("text_p", "true");
  			ODPConvertUtil.setAutomaticHtmlConcordId(liElement, "");
  			ulElement.appendChild(liElement);
  			Element spanElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_SPAN);
  			spanElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, fontSizeInStyle);
  			ODPConvertUtil.setAutomaticHtmlConcordId(spanElement, "");
  			liElement.appendChild(spanElement);
  			
  			String id = liElement.getAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID);
			if(id != null){
				String before = ".IL_CS_body_" + id + ":before ";
				Map<String, Map<String, String>> cssStyles = null;
				cssStyles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
				if(cssStyles != null ){
					Map<String, String> inLineStyle = CSSConvertUtil.getStyleMap(before, cssStyles);
					inLineStyle.put(ODPConvertConstants.CSS_FONT_SIZE, String.valueOf(parentSizeInEm) + "em !important");
					String classpath = liElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
					classpath += "IL_CS_body_" + id;
					liElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classpath);
					Map<String, Map<String, String>> list_before_map = (Map<String, Map<String, String>>)context.get(ODPConvertConstants.CONTEXT_LIST_BEFORE_STYLE);
					if(list_before_map != null)
						list_before_map.put(before, inLineStyle);
				}
				
			}
  			addLayoutClassSSOnDiv(htmlElement);
  		}else if(preClassName.equals("title") 
  				|| preClassName.equals("subtitle")){
  			Element pElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_P);
  			String pClass = "defaultContentText cb_";
  			pClass += preClassName;
  			pClass += " MP_"+master_name +"_"+preClassName+"_1 ";
  			pElement.setAttribute("class", pClass);
  			ODPConvertUtil.setAutomaticHtmlConcordId(pElement, "");

  			htmlElement.appendChild(pElement);
  			Element spanElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_SPAN);
  			spanElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, fontSizeInStyle);
  			ODPConvertUtil.setAutomaticHtmlConcordId(spanElement, "");
  			pElement.appendChild(spanElement);
  			addLayoutClassSSOnDiv(htmlElement);
  		}else if(preClassName.equals(ODPConvertConstants.HTML_VALUE_GRAPHIC)){
  			// manually add div/img element required by editor
  			String strClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
  			if(strClass.indexOf("layoutClass") == -1){
  				htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, strClass + " layoutClass");
  			}

  			// 2nd level div
  			Element lvl2DivElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
  			htmlElement.appendChild(lvl2DivElement);
  			ODPConvertUtil.setAutomaticHtmlConcordId(lvl2DivElement, "");
  			lvl2DivElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, "imgContainer layoutClassSS");

  			// 3rd level img
  			Element imgElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_IMG);
  			lvl2DivElement.appendChild(imgElement);

  			String imageName = "imgPlaceholder.png";
  			if(ODPImageConvertor.copyImage(context, imageName)){
  				imgElement.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, "Pictures/" + imageName);
  			}else{ // go to "if" other than "else" on server
  				imgElement.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, "/docs/images/" + imageName);
  			}
  			
  			imgElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, "defaultContentImage");
  			imgElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE,
  					                "position: absolute; left: 39%; top: 39%; height: 25%; width: 25%;");
  			imgElement.setAttribute(ODPConvertConstants.HTML_ATTR_ALT, "");
  			ODPConvertUtil.setAutomaticHtmlConcordId(imgElement, "");

  			// 3rd level div
  			Element lvl3DivElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
  			lvl2DivElement.appendChild(lvl3DivElement);
  			lvl3DivElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, "defaultContentText");
  			lvl3DivElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE,
  					                    "position: absolute; top: 5%; width: 100%; text-align:center;");
  			ODPConvertUtil.setAutomaticHtmlConcordId(lvl3DivElement, "");
  			lvl3DivElement.appendChild(htmlDoc.createTextNode("Click to add image"));
  		}
  	}
  }
  
  private void addLayoutClassSSOnDiv(Element htmlElement){
  	if(htmlElement.getParentNode() != null){
  		Element gNode = (Element)(htmlElement.getParentNode().getParentNode());
  		if(gNode != null){
  			String strClass = gNode.getAttribute("class");
  			if(strClass != null && strClass.contains("draw_text-box")){
  				strClass += " layoutClassSS ";
  				gNode.setAttribute("class", strClass);
  			}
  		}
  	}
  	
  }
  
  
  private void replaceClassName(ConversionContext context, Element htmlElement){
	//add presentation_placeholder to html
	String pClass = htmlElement.getAttribute("presentation_class");
	if(pClass != null && (pClass.equals("outline") ||
			pClass.equals("title") ||
			pClass.equals("subtitle")))
		htmlElement.setAttribute("presentation_placeholder", "true");
	  
  	String fullClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
  	String preClassName = (String)context.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
    String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    if(fullClass==null || preClassName== null || master_name==null)
    	return;
    if(preClassName.equals("outline") || preClassName.equals("subtitle")){
    	fullClass = fullClass.replaceFirst(master_name+"-"+preClassName, "");
    }
    else if(preClassName.length()>0 && (preClassName.equals("title")/*|| preClassName.equals("subtitle")*/))
    	//fullClass = fullClass.replaceFirst(master_name+"-"+preClassName, "");
    	fullClass = fullClass.replaceFirst(master_name+"-"+preClassName, "MP_"+master_name+"_"+preClassName+"_1");
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, fullClass);
  }

  private boolean isField(Node odfElement)
  {
    return (odfElement instanceof OdfTextDate || odfElement instanceof OdfTextTime || odfElement instanceof OdfTextAuthorName
        || odfElement instanceof OdfTextFileName || odfElement instanceof OdfTextPageNumber);
  }
}
