/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

/*
 * This file contains function from original code base
 * After we have full model, should remove this file
 * and provide new function base
 */

dojo.provide("pres.clipboard.BaseCopyPasteUtil");
dojo.require("concord.pres.PresCKUtil");
// dojo.require("concord.pres.ListUtil");
dojo.require("pres.editor.EditorUtil");
dojo.require("pres.editor.EditorUtilList");
dojo.require("pres.utils.a11yUtil");

dojo.declare("pres.clipboard.BaseCopyPasteUtil", null, {

	editorutil: new pres.editor.EditorUtil(),
	editorutillist: new pres.editor.EditorUtilList(),

	_getVisibleStyleStringForLineItem: function(_node)
	{
		var computedStyle = dojo.getComputedStyle(_node);

		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;

		// style properties
		var styleAttr = dojo.attr(_node, 'style');
		visibleStyle += styleAttr;
		visibleStyle += splitor;

		var align = computedStyle.textAlign;
		visibleStyle += align;
		visibleStyle += splitor;

		// margin-top
		var helper = pres.utils.helper;
		var marginTop = helper.pxToPercent(parseFloat(computedStyle.marginTop), null, false);
		visibleStyle += marginTop;
		// visibleStyle += '%';
		visibleStyle += splitor;
		// margin-bottom
		var marginBottom = helper.pxToPercent(parseFloat(computedStyle.marginBottom), null, false);
		visibleStyle += marginBottom;
		// visibleStyle += '%';
		visibleStyle += splitor;

		// margin-left
		var marginLeft = helper.pxToPercent(parseFloat(computedStyle.marginLeft), null, true);
		visibleStyle += marginLeft;
		// visibleStyle += '%';
		visibleStyle += splitor;
		// margin-right
		var marginRight = helper.pxToPercent(parseFloat(computedStyle.marginRight), null, true);
		visibleStyle += marginRight;
		// visibleStyle += '%';
		visibleStyle += splitor;

		var level = dojo.attr(_node, 'level');
		visibleStyle += level;
		visibleStyle += splitor;

		var startnumber = dojo.attr(_node, 'startnumber');
		visibleStyle += startnumber;
		visibleStyle += splitor;

		var values = dojo.attr(_node, 'values');
		visibleStyle += values;
		visibleStyle += splitor;
		return visibleStyle;
	},

	_getVisibleStyleStringForImage: function(_node)
	{
		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;

		var styleStr = dojo.attr(_node, 'style');
		visibleStyle += styleStr;
		visibleStyle += splitor;

		var src = _node.src;
		visibleStyle += src;
		visibleStyle += splitor;

		return visibleStyle;
	},

	_getVisibleStyleStringForTable: function(_node)
	{

		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;

		var tbdc = dojo.attr(_node, 'table_border_color');
		visibleStyle += tbdc;
		visibleStyle += splitor;

		var tbgc = dojo.attr(_node, 'table_background_color');
		visibleStyle += tbgc;
		visibleStyle += splitor;

		var tac = dojo.attr(_node, 'table_alt_color');
		visibleStyle += tac;
		visibleStyle += splitor;

		var tsc = dojo.attr(_node, 'table_summary_color');
		visibleStyle += tsc;
		visibleStyle += splitor;

		var thc = dojo.attr(_node, 'table_header_color');
		visibleStyle += thc;
		visibleStyle += splitor;

		var tubs = dojo.attr(_node, 'table_use-border-styles');
		visibleStyle += tubs;
		visibleStyle += splitor;

		var tubcs = dojo.attr(_node, 'table_use-banding-columns-styles');
		visibleStyle += tubcs;
		visibleStyle += splitor;

		var tulcs = dojo.attr(_node, 'table_use-last-column-styles');
		visibleStyle += tulcs;
		visibleStyle += splitor;

		var tufcs = dojo.attr(_node, 'table_use-first-column-styles');
		visibleStyle += tufcs;
		visibleStyle += splitor;

		var tulrs = dojo.attr(_node, 'table_use-last-row-styles');
		visibleStyle += tulrs;
		visibleStyle += splitor;

		var tufrs = dojo.attr(_node, 'table_use-first-row-styles');
		visibleStyle += tufrs;
		visibleStyle += splitor;

		var tubrs = dojo.attr(_node, 'table_use-banding-rows-styles');
		visibleStyle += tubrs;
		visibleStyle += splitor;

		var turs = dojo.attr(_node, 'table_use-rows-styles');
		visibleStyle += turs;
		visibleStyle += splitor;

		return visibleStyle;
	},

	_getVisibleStyleStringForTr: function(_node)
	{

		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;

		var styleStr = dojo.attr(_node, 'style');
		visibleStyle += styleStr;
		visibleStyle += splitor;

		var preRowHeight = dojo.attr(_node, 'presrowheight');
		visibleStyle += preRowHeight;
		visibleStyle += splitor;

		return visibleStyle;
	},

	_getVisibleStyleStringForTd: function(_node)
	{

		var computedStyle = dojo.getComputedStyle(_node);

		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;

		var bgColor = computedStyle.backgroundColor;
		visibleStyle += bgColor;
		visibleStyle += splitor;
		var helper = pres.utils.helper;
		var paddingLeft = helper.pxToPercent(parseFloat(computedStyle.paddingLeft), null, true);
		visibleStyle += paddingLeft;
		visibleStyle += '%';
		visibleStyle += splitor;

		var paddingRight = helper.pxToPercent(parseFloat(computedStyle.paddingRight), null, true);
		visibleStyle += paddingRight;
		visibleStyle += '%';
		visibleStyle += splitor;

		var paddingTop = helper.pxToPercent(parseFloat(computedStyle.paddingTop), null, false);
		visibleStyle += paddingTop;
		visibleStyle += '%';
		visibleStyle += splitor;

		var paddingBottom = helper.pxToPercent(parseFloat(computedStyle.paddingBottom), null, false);
		visibleStyle += paddingRight;
		visibleStyle += '%';
		visibleStyle += splitor;

		var vertAlign = computedStyle.verticalAlign;
		visibleStyle += vertAlign;
		visibleStyle += splitor;
		
		var textAlign = computedStyle.textAlign;
		visibleStyle += textAlign;
		visibleStyle += splitor;

		return visibleStyle;
	},

	_getVisibleStyleStringForDrawFrameClasses: function(_node)
	{

		var computedStyle = dojo.getComputedStyle(_node);
		
		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;
		// background properties

		var bgColor = computedStyle.backgroundColor;
		visibleStyle += bgColor;
		visibleStyle += splitor;

		var bgPosition = computedStyle.backgroundPosition;
		visibleStyle += bgPosition;
		visibleStyle += splitor;

		var bgRepeated = computedStyle.backgroundRepeat;
		visibleStyle += bgRepeated;
		visibleStyle += splitor;

		var bgSize = computedStyle.backgroundSize;
		visibleStyle += bgSize;
		visibleStyle += splitor;

		var wordWrap = computedStyle.wordWrap;
		visibleStyle += wordWrap;
		visibleStyle += splitor;

		var vertAlign = computedStyle.verticalAlign;
		visibleStyle += vertAlign;
		visibleStyle += splitor;

		//49869: [MVC]After copy paste a title with background the background will lost in paste object
		var styleStr = dojo.attr(_node,'style');
		var styleArray = EditorUtil.turnStyleStringToArray(styleStr);
		var cbgColor = styleArray['background-color'];
		if(!cbgColor)
			cbgColor = 'no';
		visibleStyle += cbgColor;
		visibleStyle += splitor;
			
		
		return visibleStyle;
	},

	_getVisibleStyleStringForDrawFrame: function(_node)
	{

		var computedStyle = dojo.getComputedStyle(_node);

		var splitor = '@';
		var visibleStyle = "sys_vs" + splitor;

		var positionValue = dojo.style(_node, 'position');
		visibleStyle += positionValue;
		visibleStyle += splitor;

		var topValue = dojo.style(_node, 'top');
		visibleStyle += topValue;
		visibleStyle += splitor;

		var leftValue = dojo.style(_node, 'left');
		visibleStyle += leftValue;
		visibleStyle += splitor;

		var widthValue = dojo.style(_node, 'width');
		visibleStyle += widthValue;
		visibleStyle += splitor;

		var heightValue = dojo.style(_node, 'height');
		visibleStyle += heightValue;
		visibleStyle += splitor;

		var zIndex = dojo.style(_node, 'zIndex');
		visibleStyle += zIndex;
		visibleStyle += splitor;

		var bgObjectes = dojo.attr(_node, 'draw_layer');
		visibleStyle += bgObjectes;
		visibleStyle += splitor;

		var emptyPlaceholder = PresCKUtil.checkEmptyPlaceholder(_node) ? 'emptyPlaceholder' : '';
		var emptyPlaceholder = '';
		visibleStyle += emptyPlaceholder;
		visibleStyle += splitor;

		var presClass = dojo.attr(_node, 'presentation_class');
		visibleStyle += presClass;
		visibleStyle += splitor;

		return visibleStyle;
	},

	_getVisibleStyleStringForSpan: function(_node)
	{

		var computedStyle = dojo.getComputedStyle(_node);

		// get font size
		// we need to get font size through the get absValue,
		// since it may have acurrency issue if we use computed style
		var fontSize = PresCKUtil.getAbsoluteValue(_node, PresConstants.ABS_STYLES.FONTSIZE);
		if (!fontSize || fontSize.length == 0)
		{
			// if could not get abs value, it means the html structure wrong, leave the font size blank
			console.info("Failed to get the abs-font-size, so use the computed font size instead");
			fontSize = PresFontUtil.convertFontsizeToPT(computedStyle.fontSize);
		}
		fontSize = parseInt(fontSize * 100);

		// get other font sytle, include: font weight, font style, font family
		var splitor = '@';
		var visibleString = "sys_vs" + splitor;
		visibleString += fontSize;
		visibleString += splitor;
		var fontWeight = parseInt(computedStyle.fontWeight);
		if (fontWeight == 400)
			fontWeight = 'normal';
		else if (fontWeight == 700)
			fontWeight = 'bold';
		else
			fontWeight = computedStyle.fontWeight;
		visibleString += fontWeight;
		visibleString += splitor;
		visibleString += computedStyle.fontStyle;
		visibleString += splitor;
		visibleString += computedStyle.fontFamily;
		visibleString += splitor;
		visibleString += PresCKUtil.normalizeColorValue(computedStyle.color);
		visibleString += splitor;
		visibleString += computedStyle.textDecoration;
		visibleString += splitor;
		var lineHeight = parseFloat(_node.style.lineHeight);
		if(!isNaN(lineHeight))
			visibleString += lineHeight;
		else
			visibleString += "";
		return visibleString;
	},

	_EncodeDomNode: function(domNode)
	{
		if (!domNode)
			return;

		var nodeId = dojo.attr(domNode, 'id');
		var prefixedNodeId = pres.utils.a11yUtil.addPrefixId(nodeId);
		var srcDiv = dojo.byId(prefixedNodeId);
		if (srcDiv)
		{
			var nodeName = domNode.nodeName;
			var visibleStr;
			if (nodeName.toLowerCase() == 'div')
			{
				if (dojo.hasClass(domNode, 'draw_frame'))
				{
					visibleStr = this._getVisibleStyleStringForDrawFrame(srcDiv);
				}
				else if (dojo.hasClass(domNode, 'draw_frame_classes'))
				{
					visibleStr = this._getVisibleStyleStringForDrawFrameClasses(srcDiv);
				}
				else
				{

				}
			}
			else if (nodeName.toLowerCase() == 'table')
			{
				visibleStr = this._getVisibleStyleStringForTable(srcDiv);
			}
			else if (nodeName.toLowerCase() == 'td' || nodeName.toLowerCase() == 'th')
			{
				visibleStr = this._getVisibleStyleStringForTd(srcDiv);
			}
			else if (nodeName.toLowerCase() == 'li' || nodeName.toLowerCase() == 'p')
			{
				visibleStr = this._getVisibleStyleStringForLineItem(srcDiv);
			}
			else if (nodeName.toLowerCase() == 'span')
			{
				visibleStr = this._getVisibleStyleStringForSpan(srcDiv);
			}
			else if (nodeName.toLowerCase() == 'colgroup')
			{
				for ( var i = 0, len = srcDiv.childNodes.length; i < len; i++)
				{
					var col = srcDiv.childNodes[i];
					var _width = PresTableUtil.getWidthInPercentFromStyle(col.style.cssText);
					dojo.attr(col, "_width", _width);
				}
			}
			else if (nodeName.toLowerCase() == 'tr')
			{
				visibleStr = this._getVisibleStyleStringForTr(srcDiv);
			}
			else if (nodeName.toLowerCase() == 'img')
			{
				visibleStr = this._getVisibleStyleStringForImage(srcDiv);
			}
			else
			{

			}

			if (visibleStr)
				dojo.attr(domNode, '_visibleStyle', visibleStr);
		}
		if (domNode.nodeName.toLowerCase() == 'ol')
		{
			var numberType = dojo.attr(domNode,'numbertype');
			if(numberType && numberType!='')
			{
				var visibleStr = "sys_vs@" + numberType;
				dojo.attr(domNode, '_visibleStyle', visibleStr);				
			}
		}
		var childNodes = domNode.childNodes;
		dojo.forEach(childNodes, function(child)
		{
			this._EncodeDomNode(child);
		}, this);
	},

	_EnCodingDataForBrowser: function(clipBoardData)
	{
		return this._EncodeDomNode(clipBoardData);
	},

	/**
	 * For IE, certain paste or other actions cause a font element to be generated. If there are attributes on that element they need transferred to the appropriate span or will be lost. Currently this includes color, size (font-size), and face (font-family)
	 */
	_updateFontElementStylesToSpan: function(styleName, styleValue, children, spanElements)
	{
		if (styleValue)
		{
			if (children)
			{
				for ( var i = 0; i < spanElements.count(); i++)
				{
					var spanElement = spanElements.getItem(i);
					if (spanElement && spanElement.getName().toLowerCase() == 'span')
					{
						spanElement.setStyle(styleName, styleValue);
					}
				}
			}
			else
			{
				var spanElement = spanElements;
				if (spanElement && spanElement.getName().toLowerCase() == 'span')
				{
					spanElement.setStyle(styleName, styleValue);
				}
			}
		}
	},

	/**
	 * Handle <font> </font> in data if present. This will need to be removed but first need to grab any critical attribute information at the <font> level and move to the <span> At the font element you can have color, face (font family), or size attributes. Currently only the color is set but will check for all three just in case the behavior changes.
	 */
	transformFontNodes: function(htmlContent)
	{
		if (htmlContent != null)
		{
			var editor = pe.scene.slideEditor;
			if (htmlContent.toLowerCase().indexOf("<font") != -1)
			{
				// D14643 Grab color, face and size attribute from font level if exists
				var fontElement = null;
				var spanElements = null;
				var isTbody = false;
				var htmlElement = document.createElement('div');
				if (htmlContent.toLowerCase().indexOf("<tbody") == 0)
				{
					htmlElement.innerHTML = "<table>" + htmlContent + "</table>";
					isTbody = true;
				}
				else
					htmlElement.innerHTML = htmlContent;

				var fontElements = htmlElement.getElementsByTag('font');
				for ( var k = 0; k < fontElements.count(); k++)
				{
					fontElement = fontElements.getItem(k);
					// var htmlElement = CKEDITOR.dom.element.createFromHtml(htmlContent);
					// There are 2 formats seen when the <font> element is added
					// 1) <font color=xxx><span><span><...></span></span></font>
					// In this case we want to update all spans within the <font>
					if (fontElement != null)
					{
						// get all the spans direct children of the font element
						// check the firstchild is not a text node
						var firstChild = fontElement.getFirst();
						var children = false;
						if (firstChild != null && firstChild.getName != null && firstChild.getName().toLowerCase() == "span")
						{ // it has span as children, then assume all children are spans
							spanElements = fontElement.getChildren();
							children = true;
						}
						else
						{
							// 2) <span><font color=xxx></font></span>
							// Just update the parent in this case
							spanElements = fontElement.getParent();
							if (spanElements == null || (spanElements.getName != null && spanElements.getName().toLowerCase() != "span"))
							{
								var span = editor.document.createElement('span');
								span.$.innerHTML = fontElement.getOuterHtml();
								fontElement.$.parentNode.replaceChild(span.$, fontElement.$);
								spanElements = span;
							}
						}
						var colorAttr = fontElement.$.getAttribute('color');
						var faceAttr = fontElement.$.getAttribute('face');
						var sizeAttr = fontElement.$.getAttribute('size');

						this._updateFontElementStylesToSpan('color', colorAttr, children, spanElements);
						if (dojo.isIE != 8 && !dojo.isChrome && !dojo.isSafari)
						{
							// in IE8 the font size coming in is not accurate and therefore we are discarding it.
							this._updateFontElementStylesToSpan('font-size', sizeAttr, children, spanElements);
						}
						this._updateFontElementStylesToSpan('font-family', faceAttr, children, spanElements);

					}
				}
				if (isTbody)
				{
					htmlContent = htmlElement.getFirst().$.innerHTML;
				}
				else
					htmlContent = htmlElement.innerHTML;
				// remove and <font> </font> from data
				htmlContent = htmlContent.replace(/<font[^>]*>|<\/font>/ig, '');
				dojo.destroy(htmlElement);
			}
		}
		return htmlContent;
	},

	_DecodeVisibleStyleForTable: function(tlNode, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(tlNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}

		var styles = ['sys_vs', 'table_border_color', 'table_background_color', 'table_alt_color', 'table_summary_color', 'table_header_color', 'table_use-border-styles', 'table_use-banding-columns-styles', 'table_use-last-column-styles', 'table_use-first-column-styles', 'table_use-last-row-styles', 'table_use-first-row-styles', 'table_use-banding-rows-styles', 'table_use-rows-styles'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t > 0 && t <= 13)
					{
						if (!inlineStyles[t].match(/null/))
							dojo.attr(tlNode, styles[t], inlineStyles[t]);
					}
				}
			}
		}
		tlNode.removeAttribute('_visibleStyle');
	},

	_DecodeVisibleStyleForTr: function(trNode, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(trNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}
		var styles = ['sys_vs', 'style', 'presrowheight'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t > 0 && t <= 2)// row height
					{
						dojo.attr(trNode, styles[t], inlineStyles[t]);
					}
				}
			}
		}
		trNode.removeAttribute('_visibleStyle');
	},

	_DecodeVisibleStyleForImage: function(imgNode, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(imgNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}
		var styles = ['sys_vs', 'style', 'src'];
		var imgUrl;
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t == 1)// row height
					{
						dojo.attr(imgNode, styles[t], inlineStyles[t]);
					}
					else if (t == 2)
					{
						imgUrl = inlineStyles[t];
					}
				}
			}
		}
		imgNode.removeAttribute('_visibleStyle');
		return imgUrl;
	},

	_DecodeVisibleStyleForTd: function(tdNode, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(tdNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}
		var styles = ['sys_vs', 'backgroundColor', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'verticalAlign'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				dojo.style(tdNode, 'backgroundImage', 'none');
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t == 1)
					{
						if (inlineStyles[t].match(/transparent/))
							dojo.style(tdNode, styles[t], '');
						else
							dojo.style(tdNode, styles[t], inlineStyles[t]);
					}
					else if (t > 1 && t < 7)
					{
						dojo.style(tdNode, styles[t], inlineStyles[t]);
					}
					else
					{
						// TODO for other properties
					}
				}
			}
		}
		tdNode.removeAttribute('_visibleStyle');
	},

	_DecodeVisibleStyleForLineItem: function(lineItem, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(lineItem, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}
		var styles = ['sys_vs', 'style', 'textAlign', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t > 1 && t < 7)
					{
						var styleAttr = dojo.attr(lineItem, 'style');
						if ((styleAttr && !styleAttr.match(styles[t])) || styleAttr == '' || styleAttr == null)
							dojo.style(lineItem, styles[t], inlineStyles[t]);
					}
					else if (t == 1)
					{
						// for style, restore it first
						if (!inlineStyles[t].match(/null/))
							dojo.attr(lineItem, 'style', inlineStyles[t]);
					}
					else if (t == 7)
					{
						dojo.attr(lineItem, 'level', inlineStyles[t]);
					}
					else if (t == 8)
					{
						dojo.attr(lineItem, 'startnumber', inlineStyles[t]);
					}
					else if (t == 9)
					{
						dojo.attr(lineItem, 'values', inlineStyles[t]);
					}					
				}
				//disable copy lineHeight>2.5116 to odp
				if((DOC_SCENE.extension.toLowerCase() == "odp" || (DOC_SCENE.extension.toLowerCase() == "pptx" && DOC_SCENE.isOdfDraft)) && dojo.style(lineItem,'lineHeight') > 2.5116 )
				{
					dojo.style(lineItem, 'lineHeight', '2.5116');
					EditorUtil.setCustomStyle(lineItem, 'abs-line-height', '2');
				}
			}
		}
		lineItem.removeAttribute('_visibleStyle');
	},

	_DecodeVisibleStyleForDrawFrameClass: function(divNode, bOnlyRemove)
	{

		var visibleStyles = dojo.attr(divNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}

		var styles = ['sys_vs', 'backgroundColor', 'backgroundPosition', 'backgroundRepeated', 'backgroundSize', 'wordWrap', 'verticalAlign','custBackgroundColor'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				dojo.style(divNode, 'background', '');
				dojo.style(divNode, 'backgroundImage', 'none');
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t > 0 && t < 7)
					{
						dojo.style(divNode, styles[t], inlineStyles[t]);
					}
					else
					{
						// TODO for other properties
					}
				}
				
				//48731: [MVC][Regression]The gradient fill color will lost after copy paste gradient fill placeholder
				var prcls = '';
				if(pe.cleanMasterClass && this.isOnlyRemove())
				{
					var orgclss = dojo.attr(divNode,'class');
					var orgclsss = orgclss.split(' ');
					for ( var j = 0; j < orgclsss.length; j++)
					{
						if(orgclsss[j].match(/^pr_/g))
						{
							prcls = orgclsss[j];
							break;
						}
					}
				}
				dojo.attr(divNode,'class','draw_frame_classes');
				if(prcls)
				{
					dojo.style(divNode, 'background', '');
					dojo.style(divNode, 'backgroundImage', '');
					dojo.addClass(divNode,prcls);
				}
				//49869: [MVC]After copy paste a title with background the background will lost in paste object
				var hasCustbackgroundColor = inlineStyles[7]||'';
				if(hasCustbackgroundColor!='no')
					dojo.style(divNode, 'backgroundColor', hasCustbackgroundColor);
			}
		}
		divNode.removeAttribute('_visibleStyle');
	},

	_DecodeVisibleStyleForDrawFrame: function(divNode, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(divNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}
		var styles = ['sys_vs', 'position', 'top', 'left', 'width', 'height', 'zIndex', 'draw_layer'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			if (!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1; t < inlineStyles.length; t++)
				{
					if (t > 0 && t <= 6)
					{
						dojo.style(divNode, styles[t], inlineStyles[t]);
					}
					else if (t == 7)
					{
						dojo.attr(divNode, styles[t], inlineStyles[t]);
					}
				}
			}
		}
		divNode.removeAttribute('_visibleStyle');
	},

	_DecodingVisibleStyle: function(spanNode, bOnlyRemove)
	{
		var visibleStyles = dojo.attr(spanNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null)
		{
			return;
		}
		var styles = ['sys_vs', 'fontSize', 'fontWeight', 'fontStyle', 'fontFamily', 'color', 'textDecoration', 'lineHeight'];
		if (visibleStyles.match(/^sys_vs@/))
		{
			var inlineStyles = visibleStyles.split('@');
			for ( var t = 1; t < inlineStyles.length; t++)
			{
				if (t == 1)
				{
					var absFontSize = parseInt(inlineStyles[t]);
					absFontSize = absFontSize / 100;
					PresCKUtil.setCustomStyle(spanNode, PresConstants.ABS_STYLES.FONTSIZE, absFontSize);
				}
				else if(t == 7)
				{
					//disable copy lineHeight > 2.5116 to odp
					if((DOC_SCENE.extension.toLowerCase() == "odp" || (DOC_SCENE.extension.toLowerCase() == "pptx" && DOC_SCENE.isOdfDraft)) && inlineStyles[t] > 2.5116 )
					{
						dojo.style(spanNode, 'lineHeight', '2.5116');
						EditorUtil.setCustomStyle(spanNode, 'abs-line-height', '2');
					}
					else
						dojo.style(spanNode, styles[t], inlineStyles[t]);
				}
				else
					dojo.style(spanNode, styles[t], inlineStyles[t]);
			}
		}
		dojo.style(spanNode, 'backgroundImage', '');
		spanNode.removeAttribute('_visibleStyle');
	},

	//
	// Add image to document. Called when pasting image and group to canvas to add image file to document.
	// url is the image's fully qualified url.
	// e.g. 'http://hostname:port/concord/app/doc/concord.storage/abc.odp/edit/Pictures/key.png'
	//
	addImageToDoc: function(url)
	{
		var newUri = null;
		if (url != null && url.length > 0)
		{
			var servletUrl = concord.util.uri.getPasteAttachmentURL();
			var obj = {};
			obj.uri = url;

			var sData = dojo.toJson(obj);
			var response, ioArgs;
			dojo.xhrPost({
				url: servletUrl,
				handleAs: "json",
				handle: function(r, io)
				{
					response = r;
					ioArgs = io;
					newUri = response.uri;
				},
				sync: true,
				contentType: "text/plain",
				postData: sData
			});
			return (newUri != null) ? newUri : null;
		}
	},

	_DecodeDomNode: function(domNode, bOnlyRemove)
	{
		if (!domNode)
			return;

		var nodeName = domNode.nodeName;
		if (nodeName.toLowerCase() == 'div')
		{
			if (dojo.hasClass(domNode, 'draw_frame'))
			{
				this._DecodeVisibleStyleForDrawFrame(domNode, bOnlyRemove);
			}
			else if (dojo.hasClass(domNode, 'draw_frame_classes'))
			{
				this._DecodeVisibleStyleForDrawFrameClass(domNode, bOnlyRemove);
			}
			else
			{

			}
		}
		else if (nodeName.toLowerCase() == 'table')
		{
			var tableTemplateName = dojo.attr(domNode, '_table_template-name');
			tableTemplateName && dojo.attr(domNode, '_table_template-name', tableTemplateName);
			domNode.removeAttribute('_table_template-name');
			this._DecodeVisibleStyleForTable(domNode, bOnlyRemove);
		}
		else if (nodeName.toLowerCase() == 'td' || nodeName.toLowerCase() == 'th')
		{
			this._DecodeVisibleStyleForTd(domNode, bOnlyRemove);
		}
		else if (nodeName.toLowerCase() == 'li' || nodeName.toLowerCase() == 'p')
		{
			if(pe.keepViewStyle)
			{
				this.editorutillist._removeListClass(domNode, false, false, true, false, true);
				if(!this.editorutillist._hasListClass(domNode))
				{
					this.editorutillist.setDefaultListType(domNode);
				}
				PresCKUtil.updateRelativeValue(domNode);
			} 
			else if (!bOnlyRemove)
			{
				if(this.editorutillist.isListCreatedByDocs(domNode))
				{
					this.editorutillist._removeListClass(domNode, false, true, true, false);
				}
				else
				{
					this.editorutillist._removeListClass(domNode, true, true, true, false);
					this.editorutillist.setDefaultListType(domNode);	
				}
				PresCKUtil.updateRelativeValue(domNode);
			}
			this._DecodeVisibleStyleForLineItem(domNode, bOnlyRemove);
		}
		else if (nodeName.toLowerCase() == 'ol' || nodeName.toLowerCase() == 'ul')
		{
			if (dojo.isWebKit)
			{
				domNode.removeAttribute('style');
			}
			var visibleStyles = dojo.attr(domNode, '_visibleStyle');
			if (visibleStyles)
			{
				if (visibleStyles.match(/^sys_vs@/))
				{
					var inlineStyles = visibleStyles.split('@');
					dojo.attr(domNode, 'numbertype', inlineStyles[1]);
				}
				domNode.removeAttribute('_visibleStyle');
			}
		}
		else if (nodeName.toLowerCase() == 'span')
		{
			this._DecodingVisibleStyle(domNode, bOnlyRemove);
			if (!bOnlyRemove)
			{
				PresCKUtil.updateRelativeValue(domNode);
				var html = domNode.innerHTML;
				// D33788 [Regression][B2B][Safari]Empty space is lost after copy&paste
				// TODO, workaround to fix this defect, needs more investigation
				if (dojo.isSafari)
				{
					// prevent the span without text but with child in case there is child for copy data
					// In safari 5.1.7, (span, div). don't match the if condition, so this scenario could go right. paste table data as a whole object
					// scenario: copy cells from a table, paste them in view mode. issue: paste result is text other than table.
					if (domNode.childElementCount > 0)
						return;
					var ret = [];
					for ( var i = 0, len = html.length; i < len; i++)
					{
						var eachCh = html.charAt(i);
						var charCode = eachCh.charCodeAt(0);
						if (charCode == 8203 || charCode == 65279)
						{
							i++;
							var nextCH = html.charAt(i);
							var next = nextCH.charCodeAt(0);
							if (next == 32 || next == 160)
								ret.push("&nbsp;");
							else
							{
								if ((next != 8203) && (next != 65279))
								{
									ret.push(nextCH);
								}
							}
						}
						else
						{
							ret.push(eachCh);
						}
					}
					html = ret.join("");
				}
				html = html.replace(/&nbsp;/g, ' ');
				html = html.replace(/  /g, ' &nbsp;');

				if (html.length == 1 && (html.charCodeAt(0) == 32 || (html.charCodeAt(0) == 160)))
					domNode.innerHTML = " ";
				else
					domNode.innerHTML = html;
			}
		}
		else if (nodeName.toLowerCase() == 'colgroup')
		{
			var subGrp = domNode.childNodes, total = 0;
			for ( var i = 0, len = subGrp.length; i < len; i++)
			{
				var subNode = subGrp[i];
				// D41838, copy from excel, colgroup contains a text node.
				if (!PresCKUtil.checkNodeName(subNode, "col"))
					continue;
				var _width = parseFloat(dojo.attr(subNode, '_width'));
				total += _width;
			}
			var total1 = 0;
			for ( var i = 0, len = subGrp.length - 1; i < len; i++)
			{
				var subNode = subGrp[i];
				// D41838, copy from excel, colgroup contains a text node.
				if (!PresCKUtil.checkNodeName(subNode, "col"))
					continue;
				var _width = parseFloat(dojo.attr(subNode, '_width'));
				_width = parseFloat(_width / total * 100).toFixed(2);
				total1 += parseFloat(_width);
				dojo.style(subNode, "width", _width + "%");
				dojo.removeAttr(subNode, "_width");
			}
			if (PresCKUtil.checkNodeName(subGrp[i], "col"))
			{
				var _width = parseFloat(dojo.attr(subGrp[i], '_width'));
				dojo.style(subGrp[i], "width", (100 - total1) + "%");
				dojo.removeAttr(subGrp[i], "_width");
			}
		}
		else if (nodeName.toLowerCase() == 'tr')
		{
			this._DecodeVisibleStyleForTr(domNode, bOnlyRemove);
		}
		else if (nodeName.toLowerCase() == 'img')
		{
			// should upload the image and get the image url
			var imgUrl = this._DecodeVisibleStyleForImage(domNode, bOnlyRemove);
			if (imgUrl)
			{
				var newUrl = this.addImageToDoc(imgUrl);
				dojo.attr(domNode, 'src', newUrl);
			}
		}
		else
		{

		}
		var childNodes = domNode.childNodes;
		dojo.forEach(childNodes, function(child)
		{
			this._DecodeDomNode(child, bOnlyRemove);
		}, this);

		if (nodeName.toLowerCase() == 'div' && !bOnlyRemove)
		{
			this.editorutil.updateListValue(domNode);
		}
		if(nodeName.toLowerCase() == 'li' && !bOnlyRemove)
		{
			EditorUtil.prepareStylesforILBefore(domNode);
		}
	},

	_DeCodingDataForBrowser: function(clipBoardData, bOnlyRemove)
	{

		// custome style
		// abs-margin-left
		// abs-font-size
		// level,startnumber,numbertype,values
		// <ol>,numbertype
		// var domClipBoardData = clipBoardData.$ ? clipBoardData.$ : clipBoardData;
		// In IE9, a <font> will be added as parent or child of a span
		// When content is extracted from clipboard by browser.
		// Here remove it
		// 
		var newHtml = this.transformFontNodes(clipBoardData.innerHTML);
		if (newHtml && newHtml.length > 0 && (clipBoardData.innerHTML !== newHtml))
		{
			var div = document.createElement("div");
			if (newHtml.toLowerCase().indexOf("<tbody") == 0 && dojo.isIE <= 9)
			{
				div.innerHTML = "<table>" + newHtml + "</table>";
				clipBoardData.innerHTML = '';
				clipBoardData.appendChild(div.firstChild.firstChild);
				dojo.destroy(div);
			}
			else
				clipBoardData.innerHTML = newHtml;
			// IE9 table.innerHTML is read only.
			// Excepe for supported table nodes(tr, td..), other related table nodes
			// innerHTML is also read only. Cannot count them
			// So here just constraint ie 9 or smaller
		}

		this._DecodeDomNode(clipBoardData, bOnlyRemove);
	}

});