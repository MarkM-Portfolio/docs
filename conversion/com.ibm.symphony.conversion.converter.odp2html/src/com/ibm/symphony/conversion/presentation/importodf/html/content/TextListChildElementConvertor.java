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

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.text.OdfTextTab;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListHeaderElement;
import org.odftoolkit.odfdom.dom.element.text.TextListItemElement;
import org.odftoolkit.odfdom.dom.element.text.TextPElement;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.importodf.ListLevelDetails;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertorFactory;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TextListChildElementConvertor extends GeneralContentHtmlConvertor {
	private static final String CLASS = TextListChildElementConvertor.class
			.getName();

	private static final Logger log = Logger.getLogger(CLASS);

	@Override
	protected void doConvertHtml(ConversionContext context, Node element,
			Element htmlParent) {
		log.fine("Entering Import " + CLASS + ".doConvertHtml");

		double oldParentSize = (Double) context
				.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

		Element htmlElement = null;

		if (isOnlyTextListHeader(context)
				&& (element instanceof TextListHeaderElement
						|| element instanceof TextListItemElement)) {
			// Set the parent to be the htmlElement to add the contents of the
			// text:list-header or text:list-item children
			// list-item without any text content
			htmlElement = htmlParent;
			// Process the children as though they weren't part of a list
			super.convertChildren(context, element, htmlElement);
		} else {
			htmlElement = htmlParent;
			// parse children.
			this.convertChildren(context, element, htmlElement);

		}
		context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
	}

	@Override
	protected void convertChildren(ConversionContext context, Node element,
			Element htmlElement) {
		NodeList childList = element.getChildNodes();

		int numChildren = childList.getLength();
		boolean bNeedAddNoneListType = false;
		
		for (int i = 0; i < numChildren; i++) {
			OdfElement node = (OdfElement) childList.item(i);
			if (node instanceof TextPElement) {
				htmlElement = createULOLLILayer(node,element, htmlElement, context, bNeedAddNoneListType);
				if (bNeedAddNoneListType) {
					changeILClassForPara(context, htmlElement);
				    //break the index table id connection, if this p is empty and is not first <text:p> in <text:list-item>
					String textContent = ((Node)node).getTextContent();//node is a TextPElement at here.
					textContent = textContent.replaceAll("\u200b", "");//&#8203;
					textContent = textContent.replaceAll("\uFEFF", "");//&#65279;
					boolean bContainTextContent = textContent.length()>0;
					if(!bContainTextContent)
					{
					    String htmlid = DOMIdGenerator.generate("id");
					    htmlElement.setAttribute("id", htmlid);
					}

				}
				bNeedAddNoneListType = true;
			}
			// have to create a new level on the stack since child parsing could call
			StackableProperties.pushInContext(context);
			parseTextListChildContents(node, htmlElement, context);
			StackableProperties.popInContext(context);
			createILCSandCheckBr(context,htmlElement);
		}
	}
	private void createILCSandCheckBr(ConversionContext context, Element htmlElement){
		NodeList listChilds = htmlElement.getChildNodes();
		for(int i = 0;i<listChilds.getLength();i++){
			Node item = listChilds.item(i);
			if(item instanceof Element){
				Element spanNode =(Element)item; 
				String name = spanNode.getNodeName();
				if(name.equalsIgnoreCase("span") && htmlElement.getNodeName().equalsIgnoreCase("li")){
					// add here
					CSSProperties styleCp = new CSSProperties(spanNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
					String sfontsize = styleCp.getProperty(ODPConvertConstants.CSS_FONT_SIZE);
					String sfontName = styleCp.getProperty(ODPConvertConstants.CSS_FONT_FAMILY);
					if(sfontsize == null){
						CSSProperties listCp = new CSSProperties(spanNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOM_STYLE), true);
						sfontsize = listCp.getProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE);
						sfontName = listCp.getProperty(ODPConvertConstants.CSS_FONT_FAMILY);
						if(sfontsize!=null)
							sfontsize = Double.parseDouble(sfontsize)/18 + "em";
					}
					
					if(sfontsize == null){
						//maybe a span>a>span
						Node mybeisa = spanNode.getFirstChild();
						if(mybeisa.getNodeName()!=null && mybeisa.getNodeName().equalsIgnoreCase("a")){
							Element aspan =(Element) mybeisa.getFirstChild();
							styleCp = new CSSProperties(aspan.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
							sfontsize = styleCp.getProperty(ODPConvertConstants.CSS_FONT_SIZE);
							sfontName = styleCp.getProperty(ODPConvertConstants.CSS_FONT_FAMILY);
						} else {
							CSSProperties listCp = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
							sfontsize = listCp.getProperty(ODPConvertConstants.CSS_FONT_SIZE);
							sfontName = listCp.getProperty(ODPConvertConstants.CSS_FONT_FAMILY);
						}
					}

					if(sfontsize != null){
						String id = htmlElement.getAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID);
						if(id == null) break;
						String classpath = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
						String ilcsid = "IL_CS_body_" + id;
						if(!classpath.contains(ilcsid)){
							Map<String, Map<String, String>> cssStyles = null;
							cssStyles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
							if(cssStyles == null ) break;
							classpath += ilcsid+" ";
							String before = ".IL_CS_body_" + id + ":before ";
							htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classpath + " ");
							Map<String, String> inLineStyle = CSSConvertUtil.getStyleMap(before, cssStyles);
							inLineStyle.put(ODPConvertConstants.CSS_FONT_SIZE, sfontsize+" !important");
							if(htmlElement.getParentNode().getNodeName().equalsIgnoreCase("ol"))
								inLineStyle.put(ODPConvertConstants.CSS_FONT_FAMILY, sfontName+" !important");
							Map<String, Map<String, String>> list_before_map = (Map<String, Map<String, String>>)context.get(ODPConvertConstants.CONTEXT_LIST_BEFORE_STYLE);
							if(list_before_map != null)
								list_before_map.put(before, inLineStyle);
						}
					}
					break;
				}
			}
		}
		Node item = listChilds.item(listChilds.getLength()-1);

		if(item instanceof Element){
			Element brNode =(Element) item;
			if(!brNode.getNodeName().equalsIgnoreCase("br") && htmlElement.getNodeName().equalsIgnoreCase("li")){
				Document htmlDoc = (Document) context.getTarget();
			    Element brElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_BR);
			    brElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HIDE_IN_IE);
			    htmlElement.appendChild(brElement);
			}
		}
	}
	
	private void changeILClassForPara(ConversionContext context, Element htmlElement){
		String listCLassName = (String)context.get(ODPConvertConstants.CONTEXT_LIST_IL_CLASS_NAME);
		if(listCLassName == null || listCLassName.length() == 0){
			Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
			Map<String, String> defaultStyleMap = CSSConvertUtil.getStyleMap(".IL_Default_Hidden_4P:before", styles);
			if(defaultStyleMap.isEmpty())
				defaultStyleMap.put("visibility", "hidden");
			String fullClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
			fullClass += " IL_Default_Hidden_4P";
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, fullClass);
			return;
		}
		String newListClassName = listCLassName + "_4P:before ";
		String oldlistCLassName = listCLassName + ":before ";
		Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
		Map<String, String> usedStyleMap = CSSConvertUtil.getStyleMap("."+oldlistCLassName, styles);
		Map<String, String> newStyleMap = CSSConvertUtil.getStyleMap("."+newListClassName, styles);
		if(usedStyleMap.isEmpty() || !newStyleMap.isEmpty()){
			if(!newStyleMap.isEmpty()){
				String fullClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
				fullClass = fullClass.replaceFirst(listCLassName, listCLassName+"_4P");
				htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, fullClass);
			}else{
				newStyleMap.put("visibility", "hidden");
				String fullClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
				fullClass = fullClass.replaceFirst(listCLassName, listCLassName+"_4P");
				htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, fullClass);
			}
			return;
		}
		Iterator<Map.Entry<String, String>> itr = usedStyleMap.entrySet().iterator();
		while(itr.hasNext())
		{
			Map.Entry<String,String> entry = itr.next();
			newStyleMap.put(entry.getKey(), entry.getValue());
		}
		newStyleMap.put("visibility", "hidden");
		if(!newStyleMap.isEmpty()){
			String fullClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
			fullClass = fullClass.replaceFirst(listCLassName, listCLassName+"_4P");
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, fullClass);
		}
	}

	private boolean doesSpanContainOnlyOneLinebreak(Node node) {
		// sometimes exported odp has line break under span, which is illegal
		// 	<text:span text:style-name="T130">
		//     <text:line-break/>
		//  </text:span>
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

	private void parseTextListChildContents(Node odfNode, Element htmlParent,
			ConversionContext context) {
		double oldParentSize = (Double) context
				.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
		Element htmlElement = null;
		Document doc = (Document) context.getTarget();
		if (odfNode instanceof TextListElement) {
			new TextListElementConvertor().convert(context, odfNode, htmlParent);
		} else {
			// turn <text:p> into <span>
			if (odfNode instanceof TextPElement) {
				//although node maybe didn't contain any text, 
				//we still need create a empty span here.
				//if (odfNode.getTextContent().length() <= 0)
				//	return;
				htmlElement = htmlParent;
				parseTagPAttributes(odfNode, htmlElement, context);
				if (!odfNode.hasChildNodes()) // odfNode does not have children
				{
					Element span = createHtmlElement(context, odfNode, doc,
					ODPConvertConstants.HTML_ELEMENT_SPAN);
					span.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "");
					htmlElement = (Element) htmlParent.appendChild(span);
					CSSProperties cps = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
					String absFontSize = ConvertUtil.parseFontSizeToString(oldParentSize);
					cps.setProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE,absFontSize);
					htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, cps.getPropertiesAsString());
					// Paragraphs with only an empty span are ignored by the browser. We
					// need to add a &nbsp; so that
					// it won't be ignored.
					// Add the class="spacePlaceholder" to enable us to strip it on export
					// if the text node is unchanged
					htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,ODPConvertConstants.HTML_ATTR_SPACE_PLACEHOLDER);
					// Add the &nbsp;
					Text t = doc.createTextNode("\u00a0");
					htmlElement.appendChild(t);

				}
			} else {
				htmlElement = addHtmlElement(odfNode, htmlParent, context);
				if (htmlElement != htmlParent) {
					htmlElement = parseAttributes2(odfNode, htmlElement, context);
				}
			}

			// This check is not valid as it does not do the parent size
			// list item height or margins for the new space placeholder
			// item. htmlElement shouldn't/can't be null and if no
			// child nodes exist then the children check will just
			// fall through.
			/*
			 * if (!odfNode.hasChildNodes() || htmlElement == null) return;
			 */
			NodeList childrenNodes = odfNode.getChildNodes();
			int childrenNum = childrenNodes.getLength();

			for (int i = 0; i < childrenNum; i++) {
				StackableProperties.pushInContext(context);
				Node node = childrenNodes.item(i);
				if (doesSpanContainOnlyOneLinebreak(node))
				{
					Element brhtmlElement =  addHtmlElement( node.getFirstChild(), htmlParent, context);
			    	brhtmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, "text_line-break");
			    	node.removeChild(node.getFirstChild());
				}

				if (!(node instanceof OdfTextTab)) {
				  parseTextListChildContents(node, htmlElement, context);
				}else{
					Element span = createHtmlElement(context, odfNode, doc,ODPConvertConstants.HTML_ELEMENT_SPAN);
					String id = DOMIdGenerator.generate();
					span.setAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID, id);
					span.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "");
					htmlElement = (Element) htmlParent.appendChild(span);
					CSSProperties cps = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
					String absFontSize = ConvertUtil.parseFontSizeToString(oldParentSize);
					cps.setProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE,absFontSize);
					htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, cps.getPropertiesAsString());
					htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,ODPConvertConstants.HTML_ATTR_TAB_PLACEHOLDER);
							// Add the 4 &nbsp;
					Text t = doc.createTextNode("\u00a0\u00a0\u00a0\u00a0");
					span.appendChild(t);
				}

				if (node.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_LINE_BREAK)){
			    	Element e = doc.createElement("span");
			    	Text t = doc.createTextNode("\u200b");
			        e.appendChild(t);
			        htmlElement.getParentNode().appendChild(e);
			        forceLineHeight(context, e);
			    }
				
				StackableProperties.popInContext(context);
			}
		}
		context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
	}


	/**
	 * Create UL or OL layer when build <Li>
	 * @param node a TextPElement
	 * @param lielement
	 * @param htmlElement
	 * @param context
	 * @return
	 */
	private Element createULOLLILayer(Node node,Node lielement, Element htmlElement,
			ConversionContext context, boolean bNeedAddNoneListType) {

		Element div_root = (Element) context
				.get(ODPConvertConstants.HTML_ELEMENT_LIST_ROOT);
		ListLevelDetails listLevelDetails = (ListLevelDetails) context
				.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
		if(listLevelDetails ==null){
			listLevelDetails = new ListLevelDetails(null, "L_DEFAULT");
			context.put(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS,
					listLevelDetails);
			context.put(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX, 1);
			context.put(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME,"L_DEFAULT");
		}
		htmlElement = createULOL(context, lielement.getParentNode(), div_root,
				listLevelDetails);
		htmlElement = addHtmlElement(lielement, htmlElement, context);
		String textContent = node.getTextContent();//node is a TextPElement at here.
		textContent = textContent.replaceAll("\u200b", "");//&#8203;
		textContent = textContent.replaceAll("\uFEFF", "");//&#65279;
		boolean bContainTextContent = textContent.length()>0;
		if(!bContainTextContent){
			//htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "visibility:hidden;");
			String classAttr = htmlElement
			.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
			if(classAttr == null)
				classAttr = "sys-list-hidden ";
			else
				classAttr += "sys-list-hidden ";
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,
					classAttr.toString());
		}
		
		if (listLevelDetails.isNumber()) {
			if(!bNeedAddNoneListType){
				calculateNumbering(listLevelDetails, htmlElement, bContainTextContent);
			}
		}
		else{
			number_counter[listLevelDetails.getLevel()] = 0;
			number_counter_class[listLevelDetails.getLevel()] = null;
			start_number[listLevelDetails.getLevel()] = 0;
		}
		
	  //remove the paragraph master class in div layer
		//removeParagraphMasterClassInDiv(context);
		
		// need to set the class name before processing children
		// set master style for ulol element, add outline style name. 
		addMasterClassForLi(htmlElement, context);
	  // here you can add all style or class to htmlElement, which is a li.
		setListItemClassName(context, lielement, htmlElement); 
		addLevelStyleForLi(htmlElement, context);
		return htmlElement;
	}
	static public int LIST_MAX_LEVEL = 10;
	static int[] number_counter = new int[LIST_MAX_LEVEL+1];
	static ListLevelDetails[] number_counter_class = new ListLevelDetails[LIST_MAX_LEVEL+1];
	static int[] start_number= new int[LIST_MAX_LEVEL+1];
	
	
	static public void initCounter(){
		for(int i=0; i<number_counter.length; i++){
			number_counter[i] = 0;
			number_counter_class[i] = null;
			start_number[i] = 0;
		}
	}

	
	private void resetCounter(int index){
		if(index < 1 || index > LIST_MAX_LEVEL)
			return;
		for(int i=index; i<number_counter.length; i++){
			number_counter[i] = 0;
			number_counter_class[i] = null;
			start_number[i] = 0;
		}
	}
	
	private boolean compareLevelDetail(ListLevelDetails ld1, ListLevelDetails ld2){
		if(ld1 == null ||ld2 == null)
			return false;
		if(ld1.getNumberFormat().equals(ld2.getNumberFormat())
				&& ld1.getPrefix().equals(ld2.getPrefix())
				&& ld1.getSuffix().equals(ld2.getSuffix())
				&& (ld1.getStartValue().equals(ld2.getStartValue())||
						ld2.getStartValue().length() == 0))
			return true;
		else
			return false;
	}

	
	/**
	 * Calculate bullet numbering for <li>
	 * @param listLevelDetails
	 * @param htmlElement
	 */
	private void calculateNumbering(ListLevelDetails listLevelDetails,
			Element htmlElement, boolean bContainTextContent) {
		String startValue = listLevelDetails.getStartValue();
		int level = listLevelDetails.getLevel();
		if (level < 1 || level > LIST_MAX_LEVEL)
			return;
		if (/*startValue.length() > 0 || */
				!compareLevelDetail(number_counter_class[level],listLevelDetails)) {
			if(startValue.length() == 0){
				number_counter[level] = 1;
				start_number[level] = 1;
			}
			else{
				number_counter[level] = Integer.parseInt(startValue);
				start_number[level] = number_counter[level];
			}

			String value = String.valueOf(number_counter[level]);
			if (value.length() > 0){
				number_counter_class[level] = listLevelDetails;
				if (listLevelDetails.isJapaneseNumber())
					value = ODPConvertUtil.getCounterValue(number_counter[level]-1, number_counter_class[level].getNumberFormat());
				else
					value = CounterUtil.getCounterValueFormat(number_counter[level], number_counter_class[level].getNumberFormat());
				htmlElement.setAttribute("values", value);
				resetCounter(level+1);
			}
			
		} else {
			if (number_counter[level] == 0){
				number_counter[level] = 1;
				number_counter_class[level] = listLevelDetails;
				start_number[level] = 1;
			}
			else if(bContainTextContent){
				number_counter[level]++;
				resetCounter(level+1);
			}
			String value = String.valueOf(number_counter[level]);
			if (value.length() > 0){
				if(bContainTextContent){
					if (listLevelDetails.isJapaneseNumber())
						value = ODPConvertUtil.getCounterValue(number_counter[level]-1, number_counter_class[level].getNumberFormat());
					else
						value = CounterUtil.getCounterValueFormat(number_counter[level], number_counter_class[level].getNumberFormat());
					htmlElement.setAttribute("values", value);
				}
				else
					htmlElement.setAttribute("values", "");
			}
		}
		htmlElement.setAttribute("startNumber", ""+start_number[level]);
	}

	/**
	 * Add paragraph and list master class for <li>
	 * @param htmlElement
	 * @param context
	 */
	private void addMasterClassForLi(Element htmlElement,
			ConversionContext context) {
		String classAttr = htmlElement
				.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
		String outlineStyleName = (String) context
				.get(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME);
		if(outlineStyleName == null || outlineStyleName.length() == 0){
			String presentationClassName = (String) context
			.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
			if(presentationClassName != null && presentationClassName.equals("subtitle")){
				String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
				String fullClass = " MP_"+master_name+"_"+presentationClassName+"_1 ";
				classAttr += fullClass;
				htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,
						classAttr.toString());
			}
			return;
		}
		int outline_index = (Integer) context
				.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
		if (outline_index > 0) {
			//classAttr += mergeParagraphMasterClass(outlineStyleName, outline_index, context);
			classAttr += getParagraphMasterClassName(context,outline_index);
			classAttr += ODPConvertConstants.SYMBOL_WHITESPACE;
			classAttr += getListMasterClass(context,outline_index);
			classAttr += ODPConvertConstants.SYMBOL_WHITESPACE;
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,
					classAttr.toString());
		}
	}
	
	private String getListMasterClass(ConversionContext context, int index){
		String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
		String presentationClassName = (String) context
		.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
		return "ML_"+master_name+"_"+presentationClassName+"_"+index;
	}
	
	
	
	/**
	 * Add list level attribute in <li>
	 * @param htmlElement
	 * @param context
	 */
	private void addLevelStyleForLi(Element htmlElement, ConversionContext context) {
		int outline_index = (Integer) context
				.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
		if (outline_index > 0) {
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_LEVEL, ""
					+ outline_index);
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_OLD_LEVEL, ""
					+ outline_index);
			String odfListStyleName = (String) context.get(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME);
			if(odfListStyleName != null && odfListStyleName.length() > 0)
				htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_OLD_STYLE_NAME, odfListStyleName);
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_ROLE, "listitem");
			htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_ARIA_LEVEL, ""+ outline_index);
		}
	}

	/**
	 * Get the list style name for the current list.
	 * 
	 * @param context
	 *          - conversion context
	 * 
	 * @return String list style name (e.g. IL_xxx)
	 */
	private String getListStyleName(ConversionContext context) {

		String baseName = (String) context
				.get(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME);

		StringBuilder listStyleName = new StringBuilder();

		int outline_index = (Integer) context
				.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
		if (!baseName.startsWith(ODPConvertConstants.CSS_CONCORD_LIST_STYLE_PREFIX)) {
			listStyleName.append(ODPConvertConstants.CSS_LIST_STYLE_PREFIX_NEW);
			listStyleName.append(baseName);
			listStyleName.append(ODPConvertConstants.SYMBOL_UNDERBAR);
			String containerWidth = CSSConvertUtil
					.convertContainerWidthToStyleFormat(context);
			listStyleName.append(containerWidth);
			listStyleName.append("_level" + outline_index);
		} else {
			baseName = baseName.replaceFirst("lst-", "IL_");
			listStyleName.append(baseName);
			listStyleName.append("_level" + outline_index);
		}

		return listStyleName.toString();

	}

	/**
	 * General method to check if the element passed in is one of our special DIV
	 * types
	 * 
	 * @param listElement
	 * @param type
	 * @return
	 */
	@SuppressWarnings("unused")
	private boolean isDIVType(Element listElement, String type) {
		// If the element is a <DIV> and the class contains type then return true.
		if (listElement.getLocalName().equalsIgnoreCase(
				ODPConvertConstants.HTML_ELEMENT_DIV)) {
			String attr = listElement
					.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
			String[] classAttrs = attr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
			for (String classAttr : classAttrs) {
				if (classAttr.equalsIgnoreCase(type)) {
					return true;
				}
			}
		}

		// Not a DIV or text list type DIV
		return false;

	}

	private Element replaceUL2OL(Document doc, Element htmlElement,
			ConversionContext context, Node odfNode) {
		Element htmlParent = (Element) htmlElement.getParentNode();
		Element orderedListElement = createHtmlElement(context, odfNode, doc,
				ODPConvertConstants.HTML_ELEMENT_OL);
		// replace current "ul" fragment into "ol"
		NamedNodeMap attrMap = htmlElement.getAttributes();
		for (int j = 0; j < attrMap.getLength(); j++) {
			orderedListElement.setAttribute(attrMap.item(j).getNodeName(), attrMap
					.item(j).getNodeValue());
		}

		NodeList childMap = htmlElement.getChildNodes();
		for (int j = 0; j < childMap.getLength(); j++) {
			orderedListElement.appendChild(childMap.item(j));
		}
		htmlParent.replaceChild(orderedListElement, htmlElement);

		return orderedListElement;
	}

	/**
	 * Create new ul/ol html Element
	 * 
	 * @param context
	 *          - conversion context
	 * 
	 * @param htmlParent
	 *          - pointer to parent HTML element
	 * 
	 * @param levelDetails
	 *          - details for current list level
	 * 
	 * @return Element - new OL/UL html Element
	 */
	private Element createULOL(ConversionContext context, Node odfElement,
			Element htmlParent, ListLevelDetails levelDetails) {

		// create ul element (will change to <ol> later if its a numbered list)
		Element htmlElement = addHtmlElement(odfElement, htmlParent, context);
		if (levelDetails.isNumber()) // we have a numbered list
		{
			context.put(ODPConvertConstants.CONTEXT_TEXTLIST_PARENT_TYPE,
					ODPConvertConstants.HTML_ELEMENT_OL);

			htmlElement = replaceUL2OL((Document) context.getTarget(), htmlElement,
					context, odfElement);
			htmlElement.setAttribute("numbertype", levelDetails.getNumberFormat());
		} else
		// not a number, use ul
		{
			context.put(ODPConvertConstants.CONTEXT_TEXTLIST_PARENT_TYPE,
					ODPConvertConstants.HTML_ELEMENT_UL);
		}
		htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_ROLE, "list");
		return htmlElement;

	}
	


	/**
	 * Set the class name for this list item e.g. "I-lst-L23_22-499"
	 * 
	 * @param context
	 *          - conversion context
	 * 
	 * @param odfNode
	 *          - current ODF node being imported
	 * 
	 * @param htmlElement
	 *          - current html element being built
	 * 
	 * @return String containing the list class name that was set
	 */
	private String setListItemClassName(ConversionContext context, Node odfNode,
			Element htmlElement) {
		
		ListLevelDetails listLevelDetails = (ListLevelDetails) context
		.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
		Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
		String masterClassName = getListMasterClass(context, listLevelDetails.getLevel());
		//parse and convert list master style
		//convertListMasterStyle(context, listLevelDetails, styles);

		//parse and convert list custom style
		Node listLevelStyles = listLevelDetails.getListLevelStyleNode();
		if (listLevelStyles != null) {
			CSSConvertorFactory.getInstance().getConvertor(listLevelStyles)
				.convert(context, listLevelStyles, styles);
		}
		String outlineStyleName = (String) context.get(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME);
		boolean flag1 = false, flag2 = false, flag3 = false;
	//get list custom style name
		String listStyleName = getListStyleName(context); 
		String lstStyleName = listStyleName.replaceFirst("IL_", "lst-");
		String lstMRStyleName = lstStyleName.replaceFirst("lst-", "lst-MR-");
		if(outlineStyleName == null || outlineStyleName.length() == 0){
			flag1 = true;
			flag2 = true;
			flag3 = true;
		}
		else{
		  //there are always a blank after :before class in style map
			mergeClassBaseOnMaster(context, listStyleName+":before ", masterClassName+":before ", true);
			flag1 = mergeClassBaseOnMaster(context, listStyleName+":before ", masterClassName, true);
			
			mergeClassBaseOnMaster(context, lstStyleName+":before", masterClassName, false);
			flag2 = mergeClassBaseOnMaster(context, lstStyleName+":before", masterClassName+":before ", false);

			flag3 = mergeClassBaseOnMaster(context, lstMRStyleName+":before", masterClassName+":before ", true);

		}
		StringBuilder classBuf = new StringBuilder(
				htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS)); 
		// current classes on the <li>
		if(flag1){
			context.put(ODPConvertConstants.CONTEXT_LIST_IL_CLASS_NAME, listStyleName);
			classBuf.append(listStyleName);
			classBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
		}
		if(flag2){
			String name = getSameLstStyle(context, lstStyleName, listLevelDetails);
			if(name.length()>0)
				classBuf.append(name);
			else
				classBuf.append(lstStyleName);
			classBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
		}
		
		if(flag3){
			classBuf.append(lstMRStyleName);
			classBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
		}

		htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,
				classBuf.toString());

		return listStyleName;

	}
	
	private boolean compareLstStyle(Map<String, String> firstStyleMap, Map<String, String> secondStyleMap){
		if(firstStyleMap == null || secondStyleMap == null)
			return false;
		if(!firstStyleMap.isEmpty() && secondStyleMap.isEmpty())
			return false;
		Iterator<Map.Entry<String, String>> itr = secondStyleMap.entrySet().iterator();
		while(itr.hasNext())
		{
			Map.Entry<String,String> entry = itr.next();
			if(!entry.getKey().equalsIgnoreCase(ODPConvertConstants.CSS_FONT_FAMILY) 
					&& !entry.getKey().equalsIgnoreCase(ODPConvertConstants.CSS_FONT_SIZE)
					&& !entry.getKey().startsWith("abs-")
					&& (!firstStyleMap.containsKey(entry.getKey()) || 
					!firstStyleMap.get(entry.getKey()).equals(entry.getValue()))){
				return false;
			}
		}
		return true;
	}
	
	
	private String getSameLstStyle(ConversionContext context, String lstStyleName, ListLevelDetails listLevelDetails){
		if(!listLevelDetails.isNumber() || listLevelDetails.getNumberFormat().length() == 0)
			return "";
		String MPName = getParagraphMasterClassName(context, 9);
		@SuppressWarnings("unchecked")
		Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
		if(styles == null) //here must be convert master page element
			return "";
		String inLineClass = CSSConvertUtil.getStyleName(lstStyleName+":before");
		Map<String, String> usedStyleMap = CSSConvertUtil.getStyleMap(inLineClass, styles);
		
		if(usedStyleMap.isEmpty()){
			styles.remove(inLineClass);
			return "";  // when parse master page list, this condition happened.
		}
		
		Iterator<Map.Entry<String,Map<String,String>>> itr = styles.entrySet().iterator();
		boolean flag = false;
		String presentationClassName = (String) context
		.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
		if(presentationClassName == null || presentationClassName.length()==0
				|| presentationClassName.equals("subtitle"))
			flag = true;
		while(itr.hasNext()){
			Map.Entry<String,Map<String,String>> entry = itr.next();
			if(!flag && !entry.getKey().equals("."+MPName)){
				continue;
			}
			flag = true;
			if(entry.getKey().startsWith(".lst")){
				if(compareLstStyle(entry.getValue(), usedStyleMap)){
					String retName = entry.getKey();
					if(retName.endsWith(":before "))
						retName = retName.substring(0, retName.length()-8);
					if(retName.startsWith("."))
						retName = retName.substring(1);
					//styles.remove(usedStyleMap);
					//styles.remove(inLineClass);
					return retName;
				}
			}
		}
		return "";
	}
	
	private boolean isAllAbsValue(Map<String, String> inLineStyle){
		Iterator<Map.Entry<String, String>> itr = inLineStyle.entrySet().iterator();
		while(itr.hasNext())
		{
			Map.Entry<String,String> entry = itr.next();
			if(!entry.getKey().equalsIgnoreCase(ODPConvertConstants.CSS_FONT_FAMILY) 
					&& !entry.getKey().equalsIgnoreCase(ODPConvertConstants.CSS_FONT_SIZE) 
					&& !entry.getKey().startsWith("abs-")){
				return false;
			}
		}
		return true;
	}
	
	
	@SuppressWarnings("unchecked")
	private boolean mergeClassBaseOnMaster(ConversionContext context, String inLineClass, String masterClass, boolean isIL){
		Map<String, Map<String, String>> cssStyles = null;
		cssStyles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
		if(cssStyles == null ) return false;
		inLineClass = CSSConvertUtil.getStyleName(inLineClass);
		Map<String, String> inLineStyle = cssStyles.get(inLineClass);
		if(inLineStyle == null || inLineStyle.isEmpty())
			return false;
		masterClass = CSSConvertUtil.getStyleName(masterClass);
		Map<String, String> masterStyle = cssStyles.get(masterClass);
		if(masterStyle == null || masterStyle.isEmpty()){
			cssStyles.remove(masterClass);
			return !isAllAbsValue(inLineStyle);
		}
		
		Iterator<Map.Entry<String, String>> itr = inLineStyle.entrySet().iterator();
		while(itr.hasNext())
		{
			Map.Entry<String,String> entry = itr.next();
			if((isIL ||(!entry.getKey().equalsIgnoreCase(ODPConvertConstants.CSS_FONT_FAMILY) 
					&& !entry.getKey().equalsIgnoreCase(ODPConvertConstants.CSS_FONT_SIZE)))
					&& masterStyle.containsKey(entry.getKey()) && masterStyle
					.get(entry.getKey()).equals(entry.getValue())){
				itr.remove();
			}
		}
		if(inLineStyle.isEmpty()){
			cssStyles.remove(inLineClass);
			return false;
		}
		else{
			return !isAllAbsValue(inLineStyle);
		}
	}
	
	
	/**
	 * Determine if the current <text:list> element contains a text:list-item that
	 * has text. We do NOT check if <text:list> children include text
	 * 
	 * @param Node
	 *          - current node to check
	 * 
	 * @return boolean - true if this <text:list> contains text
	 */
	@SuppressWarnings("restriction")
	private boolean containsTextContent(Node node) {
		if (!node.hasChildNodes()) {
			return false;
		}
		NodeList items = node.getChildNodes();
		for (int i = 0; i < items.getLength(); i++) {
			Node item = items.item(i);
			if (item instanceof TextPElement) {
				if (((TextPElement) item).getTextContent().length() > 0)
					return true;
			} else if (!(item instanceof TextListElement)) {
				boolean containsText = containsTextContent(item);
				if (containsText)
					return true; // found a text node, we can stop processing children and
												// return
			}
		}
		return false;
	}
	

	/**
	 * Determine if this html element has any text node. Note: this method does
	 * NOT check any children of children
	 */
	private boolean hasText(Element htmlElement) {

		NodeList nodes = htmlElement.getChildNodes();
		int numberOfNodes = nodes.getLength();
		for (int i = 0; i < numberOfNodes; i++) {
			if (nodes.item(i) instanceof Text
					&& nodes.item(i).getNodeValue().length() > 0)
				return true;
		}

		return false;
	}

	/**
	 * Return input size as a formatted string value
	 * 
	 * @param size
	 * 
	 * @return String
	 */
	private String formatSize(double inputSize) {
		return MeasurementUtil.formatDecimal(inputSize);
	}

	/**
	 * Check if we're processing a list that contains only a text:list-header, and
	 * no list items
	 */
	private boolean isOnlyTextListHeader(ConversionContext context) {
		Object contextObj = context
				.get(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
		if (contextObj != null && (Boolean) contextObj)
			return true;
		else
			return false;
	}

	public void parseTagPAttributes(Node node, Element htmlNode,
			ConversionContext context) {
		NamedNodeMap attrs = node.getAttributes();
		if (attrs == null)
			return;

		String id = ((Element) node)
				.getAttribute(ODPConvertConstants.ODF_ATTR_TEXTID);
		if ((id != null) && (id.length() >= 1)) {
			htmlNode.setAttribute(ODPConvertConstants.ODF_ATTR_TEXTID
					.replace(ODPConvertConstants.SYMBOL_COLON,
							ODPConvertConstants.SYMBOL_UNDERBAR), id);
		}

		// merge class list from odf element with html node
		List<Node> classList = getClassElements(node,
				(OdfDocument) context.getSource(), context);
		if (classList != null && !classList.isEmpty()) {
			Attr classAttr = (Attr) htmlNode.getAttributes().getNamedItem(
					ODPConvertConstants.HTML_ATTR_CLASS);
			StringBuilder classBuf = new StringBuilder(128);

			if (classAttr != null) {
				classBuf.append(classAttr.getNodeValue());
				classBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
			}

			String classString = parseClassAttribute(classList, null, null, context);
			classBuf.append(classString);

			ODPCommonUtil.setAttributeNode(htmlNode, classAttr, classBuf.toString());

			// This will set the in-line information and process automatic colors.
			AbstractContentHtmlConvertor.processClassProperties(context, classString,
					htmlNode);
			//int outline_index = (Integer) context.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
			//String paragraphMaster = getParagraphMasterClassName(context,outline_index);
			dealwithInlineStyle(node, htmlNode,context,classString);
		} else {
			
			dealwithInlineStyle(node, htmlNode,context,null);
			//no Inline Style in TextPElement,use Style from Master
		}
	}
	public String convertToCM(String value){
	  if(value.indexOf("in")>0){
	    value = UnitUtil.convertINToPT(value);
	  }
	  if(value.indexOf("em")>0){
	    value = value.replace("em", "");
	    value = Double.parseDouble(value) * 18 + "pt";
	  }
	  if(value.indexOf("px")>0){
        value = UnitUtil.convertPXToPT(value);
      }
	  if(value.indexOf("pt")>0){
        value = UnitUtil.convertPXToCM(value);
      }
	  value = value.replace("cm", "");
	  return  value;
	}
	public void dealwithInlineStyle(Node node, Element htmlNode,ConversionContext context,String classString){
	  try{
		ListLevelDetails listLevelDetails = (ListLevelDetails)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
		String listPMaster = getParagraphMasterClassName(context,listLevelDetails.getLevel());
		String listLMaster = getListMasterClass(context,listLevelDetails.getLevel());
		if(classString == null)
			classString = listPMaster;
		
		LinkedHashMap<String, String> mprops = new LinkedHashMap<String, String>();
		mprops.put(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, null);
		mprops.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, null);
		mprops.put(ODPConvertConstants.CSS_LINE_HEIGHT, null);
		mprops.put(ODPConvertConstants.HTML_ATTR_MARGIN_TOP, null);
		mprops.put(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM, null);
		mprops.put(ODPConvertConstants.CSS_TEXT_INDENT, null);
	    mprops.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, null);
	    mprops.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, null);
	    mprops.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_TOP, null);
	    mprops.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM, null);
	    mprops.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.CSS_TEXT_INDENT, null);
	    mprops.put(ODPConvertConstants.CSS_TEXT_ALIGN, null);
	    mprops.put(ODPConvertConstants.CSS_ABS_FONT_SIZE, null);
		CSSConvertUtil.getAttributeValues(context, mprops, listPMaster);

			
		LinkedHashMap<String, String> props = new LinkedHashMap<String, String>();
	    props.put(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, null);
	    props.put(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, null);
	    props.put(ODPConvertConstants.CSS_LINE_HEIGHT, null);
	    props.put(ODPConvertConstants.HTML_ATTR_MARGIN_TOP, null);
	    props.put(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM, null);
	    props.put(ODPConvertConstants.CSS_TEXT_INDENT, null);
	    props.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, null);
	    props.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, null);
	    props.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_TOP, null);
	    props.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM, null);
	    props.put(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.CSS_TEXT_INDENT, null);
	    props.put(ODPConvertConstants.CSS_TEXT_ALIGN, null);
	    props.put(ODPConvertConstants.CSS_ABS_FONT_SIZE, null);
	    props.put(HtmlCSSConstants.DIRECTION, null);
		CSSConvertUtil.getAttributeValues(context, props, classString);
		
		
		String m_lineHeight = mprops.get(ODPConvertConstants.CSS_LINE_HEIGHT);
		String m_marginLeft = mprops.get(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT);
		String m_marginRight = mprops.get(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT);
		String m_marginBottom = mprops.get(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM);
		String m_marginTop = mprops.get(ODPConvertConstants.HTML_ATTR_MARGIN_TOP);
		String m_textIndent = mprops.get(ODPConvertConstants.CSS_TEXT_INDENT);
		String m_absmarginLeft = mprops.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT);
		String m_absmarginRight = mprops.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT);
		String m_absmarginBottom = mprops.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM);
		String m_absmarginTop = mprops.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_TOP);
		String m_abstextIndent = mprops.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.CSS_TEXT_INDENT);
		String m_absfontSize = mprops.get(ODPConvertConstants.CSS_ABS_FONT_SIZE);
		
		String mListMarginLeft = CSSConvertUtil.getAttributeValue(context, ODPConvertConstants.HTML_ATTR_ABS_LIST_MARGIN_LEFT, listLMaster);

		double mListMarginLeftD = 0.0;
		
		if(m_lineHeight ==null) m_lineHeight = "1.2558";
		if(m_marginLeft ==null) m_marginLeft = "0.0%";
		if(m_marginRight ==null) m_marginRight = "0.0%";
		if(m_marginTop ==null) m_marginTop = "0.0%";
		if(m_marginBottom ==null) m_marginBottom = "0.0%";
		if(m_textIndent ==null) m_textIndent = "0.0%";
		
		if(m_absmarginLeft ==null) m_absmarginLeft = "0.0cm";
		if(mListMarginLeft != null && mListMarginLeft.length()>0){
			mListMarginLeftD = Measure.extractNumber(mListMarginLeft);
		}
		if(m_absmarginRight ==null) m_absmarginRight = "0.0cm";
		if(m_absmarginTop ==null) m_absmarginTop = "0.0cm";
		if(m_absmarginBottom ==null) m_absmarginBottom = "0.0cm";
		if(m_abstextIndent ==null) m_abstextIndent = "0.0cm";
		
		String lineHeight = props.get(ODPConvertConstants.CSS_LINE_HEIGHT);
		String marginLeft = props.get(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT);
		String marginRight = props.get(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT);
		String marginBottom = props.get(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM);
		String marginTop = props.get(ODPConvertConstants.HTML_ATTR_MARGIN_TOP);
		String textIndent = props.get(ODPConvertConstants.CSS_TEXT_INDENT);
		String absmarginLeft = props.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT);
		String absmarginRight = props.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT);
		String absmarginBottom = props.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM);
		String absmarginTop = props.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_TOP);
		String abstextIndent = props.get(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.CSS_TEXT_INDENT);
		String absfontSize = props.get(ODPConvertConstants.CSS_ABS_FONT_SIZE);
		
		if(lineHeight ==null) lineHeight = m_lineHeight;
		if(marginLeft ==null) marginLeft = m_marginLeft;
		if(marginRight ==null) marginRight = m_marginRight;
		if(marginTop ==null) marginTop = m_marginTop;
		if(marginBottom ==null) marginBottom = m_marginBottom;
		if(textIndent ==null) textIndent = m_textIndent;
		
		if(absmarginLeft ==null) absmarginLeft = m_absmarginLeft;
		if(absmarginRight ==null) absmarginRight = m_absmarginRight;
		if(absmarginTop ==null) absmarginTop = m_absmarginTop;
		if(absmarginBottom ==null) absmarginBottom = m_absmarginBottom;
		if(abstextIndent ==null) abstextIndent = m_abstextIndent;
		
		absmarginLeft = convertToCM(absmarginLeft);
		absmarginRight = convertToCM(absmarginRight);
		absmarginTop = convertToCM(absmarginTop);
		absmarginBottom = convertToCM(absmarginBottom);
		abstextIndent = convertToCM(abstextIndent);
		
		double parentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
		if(m_absfontSize != null){
			if(m_absfontSize.endsWith("in")){
				m_absfontSize = UnitUtil.convertINToPT(m_absfontSize);
			}
			m_absfontSize = m_absfontSize.replace("pt", "");
		}
		else 
			m_absfontSize = String.valueOf(parentSize);
		
		if(absfontSize != null){
			if(absfontSize.endsWith("in")){
				absfontSize = UnitUtil.convertINToPT(absfontSize);
			}
			absfontSize = absfontSize.replace("pt", "");
		}
		else 
			absfontSize = String.valueOf(m_absfontSize);
			
		absfontSize = ConvertUtil.parseFontSizeToString(Double.parseDouble(absfontSize));
		
		String textAlign = props.get(ODPConvertConstants.CSS_TEXT_ALIGN);
		textAlign = (textAlign==null)?"left":textAlign;
		
		double marginRight_d = 0.0;
        double marginLeft_d = 0.0;
		double marginTop_d = 0.0;
        double marginBottom_d = 0.0;
        double textIndent_d = 0.0;
        double containerWidth_d = Measure.extractNumber(ODPConvertUtil.getContainerWidth(context));
		
        marginLeft_d = listLevelDetails.getSpaceBefore() + listLevelDetails.getMinLabelWidth() + Double.parseDouble(absmarginLeft)/* - listLevelDetails.getImageWidth()*/;
		marginRight_d = Double.parseDouble(absmarginRight);
		marginTop_d = Double.parseDouble(absmarginTop);
		marginBottom_d = Double.parseDouble(absmarginBottom);
		textIndent_d = Double.parseDouble(abstextIndent) - listLevelDetails.getMinLabelWidth();

        double marginLeft_da = (marginLeft_d / containerWidth_d) * 100;
        double marginRight_da = (marginRight_d / containerWidth_d) * 100;
        
        double marginTop_da = (marginTop_d / containerWidth_d) * 100;
        double marginBottom_da = (marginBottom_d / containerWidth_d) * 100;
        
        double textIndent_da = (textIndent_d / containerWidth_d) * 100;
        String direction = props.get(HtmlCSSConstants.DIRECTION);
        if(direction == null) 
            direction = HtmlConvertUtil.getDirectionAttr(context, null, false);

        //for RTL list swap right and left margins
        if(HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
        	double margin_tmp = marginLeft_da;
        	marginLeft_da = marginRight_da;
        	marginRight_da = margin_tmp;
        }
        CSSProperties cp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
        cp.setProperty(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT,MeasurementUtil.formatDecimal(marginLeft_da) + ODPConvertConstants.SYMBOL_PERCENT);
        cp.setProperty(ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT,MeasurementUtil.formatDecimal(marginRight_da) + ODPConvertConstants.SYMBOL_PERCENT);
        cp.setProperty(ODPConvertConstants.HTML_ATTR_MARGIN_TOP, MeasurementUtil.formatDecimal(marginTop_da) + ODPConvertConstants.SYMBOL_PERCENT);
        cp.setProperty(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM, MeasurementUtil.formatDecimal(marginBottom_da) + ODPConvertConstants.SYMBOL_PERCENT);
        cp.setProperty(ODPConvertConstants.CSS_TEXT_INDENT,MeasurementUtil.formatDecimal(textIndent_da) + ODPConvertConstants.SYMBOL_PERCENT);
        double lhd = 1.2558;
        if (lineHeight != null)
        {
          lhd = Double.parseDouble(lineHeight);
        }
        cp.setProperty(ODPConvertConstants.CSS_LINE_HEIGHT, MeasurementUtil.formatDecimal(lhd));
        if(!classString.equalsIgnoreCase(""))cp.setProperty(ODPConvertConstants.CSS_TEXT_ALIGN, textAlign);
        if(htmlNode.getNodeName().equalsIgnoreCase("li")){
//        	double fontem = Double.parseDouble(absfontSize)/ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT;
//        	cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE,MeasurementUtil.formatDecimal(fontem)+"em");
        	context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE,Double.parseDouble(absfontSize));
        }
        String styleAttr = cp.getPropertiesAsString();
        if(direction != null) { //space between 'direction:' and 'rtl/ltr' is essential
        	styleAttr = HtmlCSSConstants.DIRECTION + ODPConvertConstants.SYMBOL_COLON +  ODPConvertConstants.SYMBOL_WHITESPACE + 
        				direction + ODPConvertConstants.SYMBOL_SEMICOLON + styleAttr;
        }
        styleAttr += ODPConvertConstants.SYMBOL_WHITESPACE;
        htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, styleAttr);
        
        CSSProperties cps = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
        if (lineHeight != null)
        {
        	cps.setProperty("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT,MeasurementUtil.formatDecimal(Double.parseDouble(lineHeight) / 1.2558));
        }
        if(!m_absfontSize.equalsIgnoreCase(absfontSize)){
        	cps.setProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE,absfontSize);
        }
        m_absmarginLeft = m_absmarginLeft.replace("cm", "");
        if(marginLeft_d != mListMarginLeftD + Double.parseDouble(m_absmarginLeft)){
        //if(Measure.extractNumber(m_absmarginLeft) != Double.valueOf(absmarginLeft)){
        //if(!m_absmarginLeft.equalsIgnoreCase(absmarginLeft)){
            cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, MeasurementUtil.formatDecimal(marginLeft_d*1000,0));
        }
        if(Measure.extractNumber(m_absmarginRight) != Double.valueOf(absmarginRight)){
        //if(!m_absmarginRight.equalsIgnoreCase(absmarginRight)){
        	cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, MeasurementUtil.formatDecimal(marginRight_d*1000,0));
        }
        if(Measure.extractNumber(m_absmarginTop) != Double.valueOf(absmarginTop)){
        //if(!m_absmarginTop.equalsIgnoreCase(absmarginTop)){
        	cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_TOP, MeasurementUtil.formatDecimal(marginTop_d*1000,0));
        }
        if(Measure.extractNumber(m_absmarginBottom)!= Double.valueOf(absmarginBottom)){
        //if(!m_absmarginBottom.equalsIgnoreCase(absmarginBottom)){
        	cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM,MeasurementUtil.formatDecimal(marginBottom_d*1000,0));
        }
        //if(Measure.extractNumber(m_abstextIndent) != Double.valueOf(abstextIndent)){
        //if(!m_abstextIndent.equalsIgnoreCase(abstextIndent)){
        	cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.CSS_TEXT_INDENT, MeasurementUtil.formatDecimal(textIndent_d*1000,0));
        //}
        if(cps.size()>0)
        	htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, cps.getPropertiesAsString());
	  }catch(Exception e){
        log.warning("Eception in "+CLASS+ ".dealwithInlineStyle" + e.getMessage());
      }
	}
	/**
	 * Determine if this is the first <text:p> in the list
	 * 
	 * @param node
	 * @return true if it is the first <text:p>
	 */
	private boolean isFirstTextP(Node node) {
		Node prevSib = node.getPreviousSibling();
		while (prevSib != null) {
			if (prevSib.getNodeName().equals(
					ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH)) {
				return false;
			}
			prevSib = prevSib.getPreviousSibling();
		}

		return true; // we didn't find a text:p previously in the list item

	}
	
	private Map<String, String> getILBeforeStyle(Element htmlNode, ConversionContext context){
		String strClass = htmlNode.getAttribute("class");
		if(strClass == null || strClass.length() == 0)
			return null;
		String[] strings = strClass.split(" ");
		for(int i = 0; i < strings.length; i++){
			if(strings[i].trim().startsWith("IL_")){
				String before = "." + strings[i].trim() + ":before ";
				Map<String, Map<String, String>> cssStyles = null;
				cssStyles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
				if(cssStyles == null ) return null;
				Map<String, String> inLineStyle = cssStyles.get(before);
				if(inLineStyle == null || inLineStyle.isEmpty())
					return null;
				else
					return inLineStyle;
			}
		}
		//new create a IL style
		String id = DOMIdGenerator.generate();
		String ILClassName = "IL_" + id;
		Map<String, Map<String, String>> cssStyles = null;
		cssStyles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
		if(cssStyles == null ) return null;
		Map<String, String> inLineStyle = CSSConvertUtil.getStyleMap("." +ILClassName+":before ", cssStyles);
		strClass += (" " + ILClassName + " ");
		htmlNode.setAttribute("class", strClass);
		return inLineStyle;
	}
	
	
	/**
	 * copy all style to the IL before style map for workaround
	 */
	private void copyFirstSpanStyleToILBefore(Element htmlNode, Element spanNode, ConversionContext context){
		if(spanNode == null || htmlNode == null)
			return;
		Map<String, String> styleMap = getILBeforeStyle(htmlNode, context);
		if(styleMap == null)
			return;
		CSSProperties cp = new CSSProperties(spanNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
		String fontSize =cp.getProperty(ODPConvertConstants.CSS_FONT_SIZE);
		String fontWeight =cp.getProperty(ODPConvertConstants.CSS_FONT_WEIGHT);
		String fontName =cp.getProperty(ODPConvertConstants.CSS_FONT_NAME);
		String fontColor =cp.getProperty(ODPConvertConstants.CSS_FONT_COLOR);
		String fontFamily =cp.getProperty(ODPConvertConstants.CSS_FONT_FAMILY);
		String fontLineHeight =cp.getProperty(ODPConvertConstants.CSS_LINE_HEIGHT);
		String fontStyle =cp.getProperty(ODPConvertConstants.CSS_FONT_STYLE);
//		String fontTextDecoration =cp.getProperty(ODPConvertConstants.CSS_TEXT_DECORATION);
//		if(fontSize != null && fontSize.length()>0){
//			/*String sFontSize = styleMap.get(ODPConvertConstants.CSS_FONT_SIZE);
//			if(sFontSize != null && sFontSize.length()>0){
//				double dFontSize = Measure.extractNumber(sFontSize) * Measure.extractNumber(fontSize);
//				styleMap.put(ODPConvertConstants.CSS_FONT_SIZE, String.valueOf(dFontSize)+"em");
//			}else{*/
//				styleMap.put(ODPConvertConstants.CSS_FONT_SIZE, fontSize);
//			//}
//		}
//		CSSProperties cpListc = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
//		String listAbsFontsize = cpListc.getProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE);
//		if(listAbsFontsize == null) {
//			int outline_index = (Integer) context.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
//			if (outline_index > 0) {
//		        //D31727: [Regression]List font size is not correct after import odp sample file
//				String pmc = getParagraphMasterClassName(context,outline_index);
//				LinkedHashMap<String, String> mprops = new LinkedHashMap<String, String>();
//			    mprops.put(ODPConvertConstants.CSS_ABS_FONT_SIZE, null);
//				CSSConvertUtil.getAttributeValues(context, mprops, pmc);
//				listAbsFontsize = mprops.get(ODPConvertConstants.CSS_ABS_FONT_SIZE);
//				if(listAbsFontsize !=null){
//					listAbsFontsize = listAbsFontsize.replace("pt", "");
//				} else {
//					listAbsFontsize  = String.valueOf(ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT);
//				}
//			}
//		}
//		CSSProperties customCp = new CSSProperties(spanNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
//		String sabsfont = customCp.getProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE);
//		if(sabsfont == null) {
//			sabsfont = listAbsFontsize;
//		}
//		ListLevelDetails listLevelDetails = (ListLevelDetails)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
//		Double spanAbsFontSize = (Double.parseDouble(sabsfont)/ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT) * listLevelDetails.getFontSize() ;
//		fontSize = MeasurementUtil.formatDecimal(spanAbsFontSize)+"em";
//		
//		if(fontSize != null && fontSize.length()>0){
//			styleMap.put(ODPConvertConstants.CSS_FONT_SIZE, fontSize);
//		}
				
		
		if(fontWeight != null && fontWeight.length()>0){
			styleMap.put(ODPConvertConstants.CSS_FONT_WEIGHT, fontWeight);
		}
		if(fontName != null && fontName.length()>0){
			styleMap.put(ODPConvertConstants.CSS_FONT_NAME, fontName);
		}
		if(fontColor != null && fontColor.length()>0){
			styleMap.put(ODPConvertConstants.CSS_FONT_COLOR, fontColor);
		}
		if(fontFamily != null && fontFamily.length()>0){
			styleMap.put(ODPConvertConstants.CSS_FONT_FAMILY, fontFamily);
		}
		if(fontLineHeight != null && fontLineHeight.length()>0){
			styleMap.put(ODPConvertConstants.CSS_LINE_HEIGHT, fontLineHeight);
		}
		if(fontStyle != null && fontStyle.length()>0){
			styleMap.put(ODPConvertConstants.CSS_FONT_STYLE, fontStyle);
		}
//		if(fontTextDecoration != null && fontTextDecoration.length()>0){
//			styleMap.put(ODPConvertConstants.CSS_TEXT_DECORATION, fontTextDecoration);
//		}
		
		
	}
	

}
