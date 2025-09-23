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

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListHeaderElement;
import org.odftoolkit.odfdom.dom.element.text.TextPElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.ListLevelDetails;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertorFactory;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

public class TextListElementConvertor extends GeneralContentHtmlConvertor {
	private static final String CLASS = TextListElementConvertor.class.getName();

	private static final Logger log = Logger.getLogger(CLASS);

	@SuppressWarnings("restriction")
	@Override
	protected void doConvertHtml(ConversionContext context, Node odfElement,
			Element htmlParent) {
		log.fine("Entering Import " + CLASS + ".doConvertHtml");

		double oldParentSize = (Double) context
				.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
		String oldListType = (String) context
				.get(ODPConvertConstants.CONTEXT_TEXTLIST_PARENT_TYPE);
		Object oldTextlistHeaderFlag = context
				.get(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
		Object oldListItemLevelDetails = context
				.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
		Object oldTextListStyleName = context
				.get(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME);

		int outline_index = 0;

		Object contextObj = context
				.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
		
		if (contextObj != null) {
			// This is not root, get level index
			outline_index = (Integer) contextObj;
		} else{
			// This is the html div root for list
			context.put(ODPConvertConstants.HTML_ELEMENT_LIST_ROOT, htmlParent);
		}

		context.put(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX,
				outline_index + 1);
		ListLevelDetails levelDetails = null;
		String odfListStyleName = null;

		// find the list style name (e.g L23)
		odfListStyleName = ((OdfElement) odfElement)
				.getAttribute(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME);
		odfListStyleName = ODPConvertStyleMappingUtil
				.getCanonicalStyleName(odfListStyleName);

		if (odfListStyleName == null || odfListStyleName.length() == 0) {
			odfListStyleName = (String) context
					.get(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME);
			if (odfListStyleName == null || odfListStyleName.length() == 0) {
				odfListStyleName = "L_DEFAULT";
			}
		}
		context.put(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME,
				odfListStyleName);
		Node listLevelStyles = null;
		//Node listMasterLevelStyle = null;
		if (!odfListStyleName.equals("L_DEFAULT")) {
			// create object to hold the details for this list level
			listLevelStyles = getListLevelStyleNode(context, odfListStyleName,
					outline_index);
			
			levelDetails = new ListLevelDetails(listLevelStyles, odfListStyleName); 
			// go get the info from the list styles
			context.put(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS,
					levelDetails);
		} else {
			// List style is unknown. Create default level details
			levelDetails = new ListLevelDetails(null, odfListStyleName);
			context.put(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS,
					levelDetails);
		}

		// Set local flag to indicate if this is just a text:list-header element.
		// This method also sets a
		// flag in the context referenced when processing the child nodes
		isOnlyTextListHeader(context, odfElement);

		if (!odfElement.hasChildNodes())
			return;

		NodeList childNodes = odfElement.getChildNodes();

		for (int i = 0; i < childNodes.getLength(); i++) {
			Node itemNode = childNodes.item(i);

			new TextListChildElementConvertor()
					.convert(context, itemNode, htmlParent);

		}

		if (outline_index == 0) {
			context.remove(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
			context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME);
			context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
			context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_PARENT_TYPE);
			context.remove(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
		} else {
			context
					.put(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX, outline_index);
			context.put(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG,
					oldTextlistHeaderFlag);
			context
					.put(ODPConvertConstants.CONTEXT_TEXTLIST_PARENT_TYPE, oldListType);
			context.put(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS,
					oldListItemLevelDetails);
			context.put(ODPConvertConstants.CONTEXT_TEXTLIST_STYLE_BASE_NAME,
					oldTextListStyleName);
		}

		context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
	}

	/**
	 * Determine if this list holds only a <text:list-header> and no list item
	 * entries
	 * 
	 * @param Element
	 *          ODF element
	 * 
	 * @returns true if there are only child(ren) that are <text:list-header>
	 *          elements false if there are zero children, or has a child that is
	 *          something other than a <text:list-header>
	 */
	private boolean isOnlyTextListHeader(ConversionContext context,
			Node odfElement) {
		boolean b = false;

		// first check if we have already determined if this list contains a list
		// header, it will
		// be null the first time thru a list
		Object contextObj = context
				.get(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
		if (contextObj != null) {
			b = (Boolean) contextObj;
		} else
		// need to loop thru list
		{
			// look thru the list when we have a text:list-header for any
			// text-elements
			if (containsTextListHeader(odfElement)) 
				// first make sure this list has a <text:list-header> in it
			{
				if (!containsTextContentAny(odfElement))
					// check for text, that is not part of the <text:list-header>
					b = true; // doesn't contain text, so we only have a list header
			}

			context.put(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG, b); 
			// save it in the context so we don't do this again
		}

		return b;
	}

	/**
	 * See if the list has a <text:list-header> element.
	 * 
	 * @param odfElement
	 *          - <text:list> element to start scanning
	 * 
	 * @return boolean - true if the odf element contains a <text:list-header>
	 *         element
	 */
	private boolean containsTextListHeader(Node odfElement) {
		boolean containsTLH = false;

		NodeList items = odfElement.getChildNodes();
		for (int i = 0; i < items.getLength() && !containsTLH; i++) {
			Node item = items.item(i);
			if (item instanceof TextListHeaderElement) {
				containsTLH = true;
			} else {
				if (containsTextListHeader(item)) // child contains text list header
					containsTLH = true; // don't need to process anymore children
			}
		}

		return containsTLH;

	}

	/**
	 * Determine if there is any child node within the entire list/sub-list that
	 * contains text that is NOT part of text:list-header element. We use this to
	 * determine if we can convert a text:list-header to be
	 * <p>
	 * instead of as a
	 * <ul>
	 * /
	 * <li>
	 */
	@SuppressWarnings("restriction")
	private boolean containsTextContentAny(Node node) {
		boolean containsText = false;
		if (node.hasChildNodes()) {
			NodeList items = node.getChildNodes();
			for (int i = 0; i < items.getLength() && !containsText; i++) {
				Node item = items.item(i);
				if (item instanceof TextPElement) {
					if (((TextPElement) item).getTextContent().length() > 0)
						return true;
				} else if (item instanceof TextListHeaderElement) {
					// loop thru any children to see if there is a text:list within this
					// text:list-header
					if (item.hasChildNodes()) {
						NodeList headerChildren = item.getChildNodes();
						for (int j = 0; j < headerChildren.getLength() && !containsText; j++) {
							Node headerChild = headerChildren.item(j);
							// we only care about <text:list> children
							if (headerChild instanceof TextListElement) {
								containsText = containsTextContentAny(headerChild);
							}
						}
					}
				} else {
					containsText = containsTextContentAny(item);
				}
			}
		}
		return containsText;
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
	 * Return a node for the <text:list-level-style-xxx> element
	 * 
	 * @param context
	 *          ConversionContext
	 * 
	 * @param odfListStyleName
	 *          Name of list style to find (e.g. Lxx)
	 * 
	 * @param listLevel
	 *          level of the list to find
	 * 
	 * @return Node null if node is not found for the style
	 */
	private Node getListLevelStyleNode(ConversionContext context,
			String odfListStyleName, int listLevel) {
		Node listLevelNode = null;

		List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(
				context, odfListStyleName);
		if (nodeList != null && nodeList.size() > 0) {
			// Should only be a single style with this name
			Node listStyle = nodeList.get(0);
			NodeList listLevels = listStyle.getChildNodes();

			int level = listLevel;
			if (listLevels.getLength() < level) // shouldn't ever happen, but just to
																					// be safe
				level = 0;

			listLevelNode = listLevels.item(level);
		}
		return listLevelNode;
	}
	

	


}
