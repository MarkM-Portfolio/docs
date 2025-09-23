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

dojo.provide("pres.editor.model.TxtCell");
dojo.require("pres.editor.model.Paragraph");
dojo.require("pres.editor.model.Span");
dojo.require("pres.editor.model.Selection");
dojo.require("pres.editor.EditorUtil");

dojo.declare("pres.editor.model.TxtCell", null, {

	SOFTBREAKCHAR: '^',

	// contentData
	paragraphs: null, // the paragraph model
	dom_rootNode: null,
	selection: null,
	txtBoxInfo: null,
	// {
	// isTableCell: isTableCell,
	// isPlaceholder: isPlaceholder,
	// masterPageName: masterPageName,
	// layoutName: layoutName,
	// placeholderType: placeholderType,
	// placeholderIndex: placeholderIndex,
	// absWidth: absWidth,// unit is cmm (cm*1000)
	// absHeight: absHeight// unit is cmm (cm*1000)
	// }
	domID: null,// store dom node id
	renderDirty: null,// dirty flag for render
	deletedLineIds: null,// restore the deleted line ids,
	// and used for render result,
	// we could delete the view dom node directly according to these ids
	masterStyles: null,// To store master page text style,only work for placeholder
	// this is an array, one level is one data item in array
	// masterStyles[0] = level 1
	// masterStyles[1] = level 2
	// .....
	// masterStyles[n] = level n+1
	/*
	 * oneItem : { listStyle_color listStyle_fontFamily listStyle_fontSize listStyle_fontBold //Bold,fontWeight listStyle_fontItalic //Italic,fontStyle textStyle_color textStyle_fontFamily textStyle_fontSize textStyle_fontBold //Bold,fontWeight textStyle_fontItalic //Italic,fontStyle }
	 */

	_hyperlinkStoreMap: null,// To store hyperlink dom node
	// map[uuid] = dom<a>

	constructor: function()
	{

		this.paragraphs = [];
		this.selection = new pres.editor.model.Selection();
		this.renderDirty = false;
		this.deletedLineIds = [];
		this.masterStyles = null;
		this._hyperlinkStoreMap = [];
	},

	destroy: function()
	{
		for ( var i = 0; i < this.paragraphs.length; i++)
		{
			var para = this.paragraphs[i];
			para.spanList = [];
		}
		this.paragraphs = [];
		this.dom_rootNode = null;
		this.boxOwnerElement = null;
		this.masterStyles = null;
		this._hyperlinkStoreMap = [];
	},

	_extractParagraphText: function(dom_para)
	{
		var str_SoftBreak = this.SOFTBREAKCHAR;
		var para = EditorUtil.clone(dom_para, true);
		dojo.query('br', para).forEach(function(_node)
		{
			if (dojo.hasClass(_node, 'text_line-break'))
			{
				var dom_span = document.createElement('span');
				EditorUtil.setText(dom_span, str_SoftBreak);
				EditorUtil.replace(dom_span, _node);
			}
		});
		var str = EditorUtil.getText(para);
		dojo.destroy(para);
		return str;
	},

	selectAll: function()
	{
		if (!this.dom_rootNode)
			return;
		this.selection.bCollapsed = false;
		this.selection.start.lineIndex = 0;
		this.selection.start.lineTextOffset = 0;
		this.selection.end.lineIndex = this.paragraphs.length - 1;
		this.selection.end.lineTextOffset = this.paragraphs[this.selection.end.lineIndex].strContent.length;
		if ((this.selection.end.lineIndex == 0) && (this.selection.end.lineTextOffset == 0))
		{
			this.selection.bCollapsed = true;
			this.selection.end.lineIndex = null;
			this.selection.end.lineTextOffset = null;
		}
	},
	
	isEmpty : function()
	{
		for(var i=0;i<this.paragraphs.length;i++)
		{
			if(this.paragraphs[i].strContent.length>0)
				return false;
		}
		return true;
	},

	_getTxtBoxInfo: function(modelObj, txtRootDomNode, bIsTabelCell)
	{
		var txtBoxInfo = {
			verticalAligment: null,// textbox vertical-align //top/middle/bottom /null
			isTableCell: null,
			isPlaceholder: null,
			isSpeakerNotes: null,
			masterPageName: null,
			layoutName: null,
			placeholderType: null,
			placeholderIndex: null,
			absWidth: null,// unit is cmm (cm*1000)
			absHeight: null
		// unit is cmm (cm*1000)
		};

		txtBoxInfo.verticalAligment = EditorUtil.getStyle(txtRootDomNode, "vertical-align");

		if (bIsTabelCell)
		{
			var cell = modelObj;
			txtBoxInfo.isTableCell = true;
			txtBoxInfo.absWidth = cell.getWidth(true) * 1000;
		}
		else
		{
			var box = modelObj;
			txtBoxInfo.isSpeakerNotes = box.element.isNotes;
			txtBoxInfo.isTableCell = false;
			var dom_DrawFrameContainer = box.domNode;
			var dom_PageNode = dom_DrawFrameContainer.parentNode;

			txtBoxInfo.masterPageName = dojo.attr(dom_PageNode, 'draw_master-page-name');
			txtBoxInfo.layoutName = dojo.attr(dom_PageNode, 'presentation_presentation-page-layout-name');
			txtBoxInfo.placeholderType = dojo.attr(dom_DrawFrameContainer, 'presentation_class');
			txtBoxInfo.placeholderIndex = dojo.attr(dom_DrawFrameContainer, "presentation_placeholder_index");
			txtBoxInfo.placeholderIndex = parseInt(txtBoxInfo.placeholderIndex);

			txtBoxInfo.isPlaceholder = dojo.attr(dom_DrawFrameContainer, "presentation_placeholder");
			if (!txtBoxInfo.isPlaceholder || txtBoxInfo.isPlaceholder != 'true')
				txtBoxInfo.isPlaceholder = false;
			else
				txtBoxInfo.isPlaceholder = true;
			txtBoxInfo.absWidth = box.element.w * 1000;
		}

		return txtBoxInfo;
	},

	_parseNumber: function(strValue, nType)
	{
		if (!nType)
			nType = 'int';
		nType = nType.toLowerCase();
		var number = null;
		if (nType == 'int')
		{
			number = Math.round(parseFloat(strValue));

		}
		else if (nType == 'float')
		{
			number = parseFloat(strValue);

		}

		if (isNaN(number))
			number = null;

		return number;
	},

	_buildMasterStyle: function()
	{
		if (!this.txtBoxInfo.isPlaceholder)
			return;
		// TODO, hold code now
		this.masterStyles = [];
		for ( var level = 1; level < 10; level++)
		{
			var mc = this._getMasterClasses(level);
			var mStyleInfo = {
				listStyle_color: null,
				listStyle_fontFamily: null,
				listStyle_fontSize: null,
				listStyle_fontBold: null, // Bold,fontWeight
				listStyle_fontItalic: null, // Italic,fontStyle
				textStyle_color: null,
				textStyle_fontFamily: null,
				textStyle_fontSize: null,
				textStyle_fontBold: null, // Bold,fontWeight
				textStyle_fontItalic: null
			// Italic,fontStyle
			};

			mStyleInfo.listStyle_color = EditorUtil.convertToHexColor(EditorUtil.getAbsModuleValue(mc.listClass + PresConstants.LIST_BEFORE, EditorUtil.ABS_STYLES.LISTCOLOR));

			mStyleInfo.listStyle_fontFamily = EditorUtil.getAbsModuleValue(mc.listClass + PresConstants.LIST_BEFORE, EditorUtil.ABS_STYLES.LISTFAMILY);

			mStyleInfo.listStyle_fontSize = EditorUtil.getAbsModuleValue(mc.listClass + PresConstants.LIST_BEFORE, EditorUtil.ABS_STYLES.LISTSCALE);

			this.masterStyles.push(mStyleInfo);
		}
	},

	// Wrapper
	// Building mode according div dom node
	// the paragraphs all the children of rootDivDomNode
	build: function(rootDomNode, modelObj, bIsTabelCell, bFromPaste,bNewCreated)
	{
		var _this = this;
		function _buildDomSpan(dom_SpanNode, para, hyperLinkId, aHypherlinkStyleSpan)
		{
			// var preDomSpan = dom_SpanNode.previousSibling;
			var postDomSpan = dom_SpanNode.nextSibling;
			var str = EditorUtil.getText(dom_SpanNode);
			
			if (EditorUtil.is(dom_SpanNode, 'br'))
			{
				// ignore the <br class="hideInIE">
				if (!dojo.hasClass(dom_SpanNode, 'text_line-break') && (para && para.spanList.length!=0))
					return null;
				str = "^";//BR replace character
			}
			
			if (!bEmptyLine && !str.length)
			{
				// ignore the span which has span behind it
				if (postDomSpan && !EditorUtil.is(postDomSpan, 'br'))
					return null;
			}

			var span = new pres.editor.model.Span();
			span.length = str.length;
			span.hyperLinkId = hyperLinkId;
			if (EditorUtil.is(dom_SpanNode, 'span'))
			{
				span.importClass(dojo.attr(dom_SpanNode, 'class'));
				span.fontSize = _this._parseNumber(EditorUtil.getCustomStyle(dom_SpanNode, EditorUtil.ABS_STYLES.FONTSIZE), 'float');
				if(span.fontSize == null)
				{
					if(aHypherlinkStyleSpan && aHypherlinkStyleSpan.fontSize!= null)
					{
						span.fontSize = aHypherlinkStyleSpan.fontSize;
					}
					else if (para &&para.fontSize != null)
					{
						span.fontSize = para.fontSize;
					}
				}

				span.viewfontSize = _this._parseNumber(EditorUtil.getAbsoluteValue(dom_SpanNode, EditorUtil.ABS_STYLES.FONTSIZE), 'float');
				if(bFromPaste && !span.fontSize && span.viewfontSize)
				{
					span.fontSize = span.viewfontSize;
				}
				span.lineHeight = _this._parseNumber(EditorUtil.getStyle(dom_SpanNode, "line-height"), 'float');
				span.fontName = EditorUtil.getStyle(dom_SpanNode, "font-family");
				span.fontColor = EditorUtil.getStyle(dom_SpanNode, "color");
				span.textShadow = EditorUtil.getStyle(dom_SpanNode, "text-shadow");
				span.id = dom_SpanNode.id;

				var v = EditorUtil.getStyle(dom_SpanNode, "font-weight");
				if(v && v.length)
					span.fontBold = (v == "bold" || v == "bolder" || v == "700" || v == "800" || v == "900");
				
				v = EditorUtil.getStyle(dom_SpanNode, "font-style");
				if(v && v.length)
					span.fontItalic = (v == 'italic');
				
				v = EditorUtil.getStyle(dom_SpanNode, "text-decoration");
				if(v && v.length)
				{
					v = v.toLowerCase();
					var index = v.indexOf('underline');
					span.fontUnderLine = (index != -1);
					
					var index = v.indexOf('line-through');
					span.fontStrikeThrough = (index != -1);
				}



				//=============================
				v = EditorUtil.getStyle(dom_SpanNode, "vertical-align");
				if(v && v.length)
				{
					v = v.toLowerCase();
					span.fontSuperSubScript = null;
					var index = v.indexOf('super');
					if (index != -1)
						span.fontSuperSubScript = "super";
	
					if (span.fontSuperSubScript == null)
					{
						var index = v.indexOf('sub');
						if (index != -1)
							span.fontSuperSubScript = "sub";
					}
					if (span.fontSuperSubScript == null)
					{
						var index = v.indexOf('baseline');
						if (index != -1)
							span.fontSuperSubScript = "baseline";
					}
				}

				if ((span.fontSuperSubScript == "super" || span.fontSuperSubScript == "sub")&& span.fontSize)
				{
					span.fontSize = span.fontSize / 0.58;
				}
				
				//===============================
				v = EditorUtil.getStyle(dom_SpanNode, "text-transform");
				if(v && v.length)
				{
					v = v.toLowerCase();
					span.upperLowerCase = null;
					var index = v.indexOf('upper');
					if (index != -1)
						span.upperLowerCase = true;
	
					if (span.upperLowerCase == null)
					{
						var index = v.indexOf('lower');
						if (index != -1)
							span.upperLowerCase = false;
					}				
				}
				

				v = EditorUtil.getAttribute(dom_SpanNode, 'typeid');
				if (v && v.length > 0)
				{
					v = v.replace("CSS_", '');
					span.userId = v;
				}

			}
			else if (dojo.hasClass(dom_SpanNode, 'text_line-break'))
			{
				span.length = 1;// soft-break as a visible character
				span.bSoftBreak = true;
			}
			if (para)
			{
				var lastSpan = para.spanList[para.spanList.length - 1];
				if (!lastSpan || span.bSoftBreak)
				{
					if (span.bSoftBreak)
					{
						if (!lastSpan || lastSpan.bSoftBreak)
						{
							var fillSpan = new pres.editor.model.Span();
							fillSpan.length = 0;
							para.spanList.push(fillSpan);
						}

					}
					para.spanList.push(span);
				}
				else
				{
					// this span has same style like previous span, we need merge it
					if (lastSpan.isEqualWithoutContent(span))
					{
						lastSpan.length += span.length;
						span = lastSpan;
					}
					else
						para.spanList.push(span);
				}
			}
			return span;

		}// function _buildDomSpan

		function _buildHyperLinkNode(aNode, para, styleSpan)
		{
			
			var hyperLinkId = EditorUtil.getUUID();
			_this._hyperlinkStoreMap[hyperLinkId] = EditorUtil.clone(aNode, null, true);
			
			for ( var i = 0; i < aNode.childNodes.length; i++)
			{
				var dom_SpanNode = aNode.childNodes[i];
				if (EditorUtil.is(dom_SpanNode, 'span', '#text', 'br'))
				{
					var span = _buildDomSpan(dom_SpanNode, para, hyperLinkId, styleSpan);
					if (!span)
						continue;
					if (styleSpan)
						span.copyStyle(styleSpan, true);
				}
			}
		}// function _buildHyperLinkNode

		function _getAbsLineValue(_this, dom_LineItem, styleName, bForce)
		{
			if (_this.txtBoxInfo.isPlaceholder && !bForce)
				return _this._parseNumber(EditorUtil.getCustomStyle(dom_LineItem, styleName));
			var reValue = _this._parseNumber(EditorUtil.getAbsoluteValue(dom_LineItem, styleName));
			if (reValue != null)
				return reValue;
			if(bNewCreated)//still not find, we just return null
				return null;
			
			var relStyleName = null;
			switch (styleName)
			{
				case EditorUtil.ABS_STYLES.TEXTINDENT:
					relStyleName = 'text-indent';
					break;
				case EditorUtil.ABS_STYLES.MARGINLEFT:
					relStyleName = 'margin-left';
					break;
				// case EditorUtil.ABS_STYLES.MARGINRIGHT:
				// relStyleName = 'margin-right';
				// break;
			}
			if (!relStyleName)
				return null;
			var fViewValue = EditorUtil._percentToFloat(EditorUtil.getStyle(dom_LineItem, relStyleName));
			if (fViewValue == null || isNaN(fViewValue))
			{
				if(!(bFromPaste || bNewCreated))
					fViewValue = 0.0;
				else
					return null;
			}
			reValue = fViewValue * _this.txtBoxInfo.absWidth;
			return reValue;
		}// function _getAbsLineValue

		this.destroy();
		if (!rootDomNode)
			return;

		// row = cell.parent
		// table = row.parent
		// tableElement = table.parent
		if (modelObj)
			this.boxOwnerElement = bIsTabelCell ? (modelObj.parent.parent.parent) : modelObj.element;

		// try to find the last rootDomNode, such as td or div
		var tlines = dojo.query('ol,ul,p', rootDomNode);
		if (tlines.length)
			this.dom_rootNode = tlines[0].parentNode;
		else
			this.dom_rootNode = rootDomNode;

		if (modelObj)
			this.txtBoxInfo = this._getTxtBoxInfo(modelObj, this.dom_rootNode, bIsTabelCell);

		// this._buildMasterStyle();

		for ( var i = 0; i < this.dom_rootNode.childNodes.length; i++)
		{
			var dom_Node = this.dom_rootNode.childNodes[i];
			var isParagraph = EditorUtil.is(dom_Node, 'p', 'ol', 'ul');
			var isTextNode = EditorUtil.is(dom_Node, '#text', 'span');
			if (!isParagraph && !isTextNode)
				continue;
			var strContent = isParagraph ? this._extractParagraphText(dom_Node) : EditorUtil.getText(dom_Node);
			if (isTextNode && strContent.length == 0)
				continue;
			var para = new pres.editor.model.Paragraph();
			para.strContent = strContent;
			para.fixBlankSpace();

			if (isTextNode)
			{
				var span = new pres.editor.model.Span();
				span.length = para.strContent.length;
				para.spanList.push(span);
				para.isVirtualParagraph = true;
			}
			else
			{
				var dom_LineItem = EditorUtil.getLineItem(dom_Node);
				para.id = dom_LineItem.id;
				// avoid duplicate line ID
				for ( var e = 0; e < this.paragraphs.length; e++)
				{
					if (para.id == this.paragraphs[e].id)
					{
						para.id = EditorUtil.getUUID();
						break;
					}
				}

				para.level = parseInt(EditorUtil.getAttribute(dom_LineItem, 'level'), 10);
				if (isNaN(para.level))
					para.level = 1;
				para.marginLeft = _getAbsLineValue(this, dom_LineItem, EditorUtil.ABS_STYLES.MARGINLEFT);
				para.marginRight = _getAbsLineValue(this, dom_LineItem, EditorUtil.ABS_STYLES.MARGINRIGHT);
				para.indent = _getAbsLineValue(this, dom_LineItem, EditorUtil.ABS_STYLES.TEXTINDENT);

				if (para.indent && (para.marginLeft == null))
					para.marginLeft = _getAbsLineValue(this, dom_LineItem, EditorUtil.ABS_STYLES.MARGINLEFT, true);
				else if ((para.indent == null) && para.marginLeft)
					para.indent = _getAbsLineValue(this, dom_LineItem, EditorUtil.ABS_STYLES.TEXTINDENT, true);

				para.fontSize = this._parseNumber(EditorUtil.getCustomStyle(dom_LineItem, EditorUtil.ABS_STYLES.FONTSIZE));

				para.importClass(dojo.attr(dom_LineItem, 'class'), this.txtBoxInfo ? this.txtBoxInfo.isPlaceholder : false);
				para.lineHeight = this._parseNumber(EditorUtil.getStyle(dom_LineItem, "line-height"), 'float');
				para.textAligment = EditorUtil.getStyle(dom_LineItem, "text-align");
				para.direction = EditorUtil.getStyle(dom_LineItem, "direction");
				if(para.direction == "rtl" && para.marginLeft) {
					para.marginRight = para.marginLeft;
					para.marginLeft = null;
				}
				para.marginTop = EditorUtil.getStyle(dom_LineItem, "margin-top");
				para.marginBottom = EditorUtil.getStyle(dom_LineItem, "margin-bottom");
				para.odp_oldstylename = EditorUtil.getAttribute(dom_LineItem, "_oldstylename");
				para.odp_oldlevel = EditorUtil.getAttribute(dom_LineItem, "_oldlevel");

				if (EditorUtil.is(dom_Node, 'ul'))
				{
					para.listType = 'bullet';
				}
				else if (EditorUtil.is(dom_Node, 'ol'))
				{
					para.listType = EditorUtil.getAttribute(dom_Node, 'numberType');
					para.startNumber = this._parseNumber(EditorUtil.getAttribute(dom_LineItem, 'startNumber'));
				}

				// Build spans===============================
				var bEmptyLine = (para.strContent.length == 0) ? true : false;
				for ( var j = 0; j < dom_LineItem.childNodes.length; j++)
				{
					var dom_SpanNode = dom_LineItem.childNodes[j];
					if(EditorUtil.is(dom_SpanNode,'#text')){
						var hyperLinkNodes = [];
					}
					else
						var hyperLinkNodes = dojo.query('a', dom_SpanNode);
					if ((hyperLinkNodes.length == 0) && EditorUtil.is(dom_SpanNode, 'span', '#text', 'br'))
					{
						var span = _buildDomSpan(dom_SpanNode, para);
						if (!span)
							continue;
					}
					else
					// Handling hyperlink
					{
						if (EditorUtil.is(dom_SpanNode, 'a'))
						{
							// <a>
							// <span>
							// </a>
							_buildHyperLinkNode(dom_SpanNode, para);
						}
						else
						{
							// <span>
							// <a>
							// <span>
							// </a>
							// <span>
							var styleSpan = _buildDomSpan(dom_SpanNode);
							if (!styleSpan)
								continue;
							for ( var h = 0; h < hyperLinkNodes.length; h++)
							{
								_buildHyperLinkNode(hyperLinkNodes[h], para, styleSpan);
							}
						}
					}
				}
			}
			if (!para.id)
				para.id = EditorUtil.getUUID();
			var lastSpan = para.spanList[para.spanList.length - 1];
			if (!lastSpan || lastSpan.bSoftBreak)
			{
				var fillSpan = new pres.editor.model.Span();
				fillSpan.length = 0;
				para.spanList.push(fillSpan);
			}
			
			//Clear invalid span
			para.clearInvalidSpan();
			
			this.paragraphs.push(para);
		}
	},

	_getAbsValueFromClasses: function(classList, styleName)
	{
		var vValue = null;
		// The order in lc is very import
		// it could ensure we first seach lst, then master
		// the order reference function EditorUtil.getListClass in pres/ListUtil.js
		for ( var p in classList)
		{
			var className = classList[p];
			vValue = EditorUtil.getAbsModuleValue(className, styleName);
			if (vValue)
			{// if has,return it
				break;
			}
			// if not found, we try find "xxx:before"
			className = className + PresConstants.LIST_BEFORE;
			vValue = EditorUtil.getAbsModuleValue(className, styleName);
			if (vValue)
			{// if has,return it
				break;
			}
		}
		if (vValue)
		{
			switch (styleName)
			{
				case EditorUtil.ABS_STYLES.TEXTINDENT:
				case EditorUtil.ABS_STYLES.MARGINLEFT:
				case EditorUtil.ABS_STYLES.FONTSIZE:
					vValue = this._parseNumber(vValue, 'int');
					break;
			}
		}

		return vValue;
	},

	_getLineClassesForView: function(para)
	{
		var lineClass = [];
		// Add master class
		// Change Class if it in placeholder
		if (this.txtBoxInfo.isPlaceholder)
		{
			var masterClasses = this._getMasterClasses(para.level);
			if (para.listType)
			{
				lineClass.push(masterClasses.listClass);
			}
			lineClass.push(masterClasses.paragraphClass);
			lineClass.push(masterClasses.textClass);
		}

		// Apply list Class ====================================
		// Add Customize class
		// for(var k=0;k<para.clsCustom.length;k++)
		if (para.clsCustom)
			lineClass.push(para.clsCustom);

		// Add Inline class
		for ( var k = 0; k < para.clsInLine.length; k++)
			lineClass.push(para.clsInLine[k]);

		// Add unsupport preserved class for the line
		var classString = lineClass.join(" ");
		for ( var k = 0; k < para.clsPreserve.length; k++) {
			var pattern = new RegExp("\\b" + para.clsPreserve[k] + "\\b");
			if (!pattern.test(classString))
				lineClass.push(para.clsPreserve[k]);
		}
		return lineClass;
	},

	_getSpanClassesForView: function(span)
	{
		var spanClass = [];

		// Add unsupport preserved class for the line
		for ( var k = 0; k < span.clsPreserve.length; k++)
			spanClass.push(span.clsPreserve[k]);

		return spanClass;
	},

	// get absolute value for line, and search its class
	_getAbsValueForLine: function(para, styleName)
	{
		var selfAbsValue = null;
		// Self value
		switch (styleName)
		{
			case EditorUtil.ABS_STYLES.TEXTINDENT:
				if (para.indent != null)
					selfAbsValue = para.indent;
				break;
			case EditorUtil.ABS_STYLES.MARGINLEFT:
				if (para.marginLeft != null || para.marginRight != null)
					selfAbsValue = (para.direction == "rtl") ? para.marginRight : para.marginLeft;
				break;
			case EditorUtil.ABS_STYLES.FONTSIZE:
				if (para.fontSize != null)
					selfAbsValue = para.fontSize;
				break;
		}
		// Class value
		if (selfAbsValue == null)
		{
			var listClasses = this._getLineClassesForView(para);
			selfAbsValue = this._getAbsValueFromClasses(listClasses, styleName);
		}
		// Fixup value
		if (selfAbsValue == null)
		{
			switch (styleName)
			{
				case EditorUtil.ABS_STYLES.MARGINLEFT:
					selfAbsValue = 1270 * (para.level - 1);
					break;
			}
		}
		return selfAbsValue;
	},

	// update relative value
	_updateViewValueForLine: function(para, dom_lineItem)
	{
		var abs_styleNames = [EditorUtil.ABS_STYLES.MARGINLEFT, EditorUtil.ABS_STYLES.TEXTINDENT];
		for ( var i = 0; i < abs_styleNames.length; i++)
		{
			var selfAbsValue = this._getAbsValueForLine(para, abs_styleNames[i]);
			var relStyleName = null;
			var margin = (para.direction == "rtl") ? 'margin-right' : 'margin-left';
			switch (abs_styleNames[i])
			{
				case EditorUtil.ABS_STYLES.TEXTINDENT:
					relStyleName = 'text-indent';
					break;
				case EditorUtil.ABS_STYLES.MARGINLEFT:
					relStyleName = margin;
					break;
			}

			if (selfAbsValue == null || !relStyleName)
				continue;

			switch (abs_styleNames[i])
			{
				case EditorUtil.ABS_STYLES.TEXTINDENT:
				case EditorUtil.ABS_STYLES.MARGINLEFT:
				{

					var fRelValue = selfAbsValue / this.txtBoxInfo.absWidth * 100.0; // %
					// keep text-indent could not exceed marging-left
					// otherwise, the text or bullet will move out the textbox
					if (relStyleName == margin)
					{
						var preTextIndentValue = EditorUtil.getStyle(dom_lineItem, 'text-indent');
						var fPreTextIndentValue = EditorUtil._percentToFloat(preTextIndentValue) * 100;
						if ((fRelValue + fPreTextIndentValue) < 0.0)
						{
							var needFixTextIndentValue = fRelValue * (-1.0);
							var value = needFixTextIndentValue + '%';
							EditorUtil.setStyle(dom_lineItem, 'text-indent', value);
						}
					}
					else if (relStyleName == 'text-indent')
					{
						var preMarginLeftValue = EditorUtil.getStyle(dom_lineItem, margin);
						var fPreMarginLeftValue = EditorUtil._percentToFloat(preMarginLeftValue) * 100;
						if ((fRelValue + fPreMarginLeftValue) < 0.0)
							fRelValue = fPreMarginLeftValue * (-1.0);
					}

					var relStyleValue = fRelValue + '%';
					EditorUtil.setStyle(dom_lineItem, relStyleName, relStyleValue);

					break;
				}
			}
		}
	},

	_updateListBeforeForView: function(paraInfo)
	{
		function _filterFontFamily(fontFamliy)
		{
			var reFF = 'calibri';
			fontFamliy = fontFamliy.toLowerCase();
			var fontFamilyArray = [{key:'arial',fontName:'arial'}
			,{key:'arial',fontName:'arial'}
			,{key:'calibri',fontName:'calibri'}
			,{key:'comic',fontName:'comic_sans_ms'}
			,{key:'courier',fontName:'courier_new'}
			,{key:'constantia',fontName:'constantia'}
			,{key:'georgia',fontName:'georgia'}
			,{key:'impact',fontName:'impact'}
			,{key:'lucida',fontName:'lucida_sans_unicode'}
			,{key:'symbol',fontName:'symbol'}
			,{key:'tahoma',fontName:'tahoma'}
			,{key:'times',fontName:'times_new_roman'}
			,{key:'trebuchet',fontName:'trebuchet_ms'}
			,{key:'verdana',fontName:'verdana'}
			,{key:'webdings',fontName:'webdings'}
			,{key:'wingdings',fontName:'wingdings'}
			
			];
			var index = 9999;
			for(var i=0;i<fontFamilyArray.length;i++)
			{
				var pair = fontFamilyArray[i];
				var curIndex = fontFamliy.indexOf(pair.key);
				if(curIndex==0)
				{
					return pair.fontName;
				}
				else if(curIndex>0 && (curIndex<index))
				{
					reFF = pair.fontName;
					index = curIndex;
				}
			}		
			return reFF;
		}
		
		var para = paraInfo.para;
		var liNode = paraInfo.liNode;
		if (!para.listBeforeStyle || !para.listType)
			return;

		var firstSpan = EditorUtil.getFirstVisibleSpanFromLine(liNode);
		var computedStyle = null;
		firstSpan && (computedStyle = dojo.getComputedStyle(firstSpan));
		// Update from view ======================================
		if (para.listBeforeStyle.fontSize == null || pe.updateListStyleFromPaste)
		{
			var fontSize = EditorUtil.getAbsoluteValue(firstSpan, EditorUtil.ABS_STYLES.FONTSIZE);
			para.listBeforeStyle.fontSize = fontSize;
		}
		if (pe.updateListStyleFromPaste || pe.paraFirstTextChange)
		{
			if (!firstSpan)
			{
				para.listBeforeStyle.color = null;
				para.listBeforeStyle.fontFamily = null;
			}
			else
			{
				var color = EditorUtil.convertToHexColor(computedStyle.color);
				color = color.substring(1, color.length);
				color = color.toUpperCase();
				para.listBeforeStyle.color = color;
			}
			delete pe.paraFirstTextChange;
		}
		
		if (para.listType == 'bullet')
		{
			var listClassesString = dojo.attr(liNode, 'class');
			var fontFamily = null;
			if (listClassesString.indexOf('lst-ta') >= 0)
			{
				fontFamily = 'Wingdings';
			}
			else if (listClassesString.indexOf('lst-ra') >= 0 || listClassesString.indexOf('lst-cm') >= 0)
			{
				fontFamily = 'Webdings';
			}
			else if (listClassesString.indexOf('lst-d') >= 0 || listClassesString.indexOf('lst-da') >= 0)
			{
				fontFamily = 'Times New Roman';
			}
			else if (listClassesString.indexOf('lst-a') >= 0)
			{
				fontFamily = 'Symbol';
			}
			else if (listClassesString.indexOf('lst-ps') >= 0)
			{
				fontFamily = 'Impact';
			}
			else if (listClassesString.indexOf('lst-c') >= 0 || listClassesString.indexOf('ML_defaultMaster_Content_outline_1') >= 0)
			{
				fontFamily = 'Arial';
			}
			if(fontFamily)
				para.listBeforeStyle.fontFamily = fontFamily;
		}
		else
		// numbering
		{
			computedStyle && (para.listBeforeStyle.fontFamily = computedStyle.fontFamily);
		}
		
		if(pe.updateListStyleFromPaste)
		{
			if (!firstSpan)
			{
				para.listBeforeStyle.fontItalic = null;
				para.listBeforeStyle.fontBold = null;
			}
			else
			{
				var v = EditorUtil.getStyle(firstSpan, "font-weight");
				para.listBeforeStyle.fontBold = (v == "bold" || v == "bolder" || v == "700" || v == "800" || v == "900");
				v = EditorUtil.getStyle(firstSpan, "font-style");
				para.listBeforeStyle.fontItalic = (v == 'italic');
			}
		}

		// =========================
		var addedPreDef = false;
		if (para.listBeforeStyle.color != null)
		{
			var cls = 'LC_' + para.listBeforeStyle.color;
			dojo.addClass(liNode, cls);
			addedPreDef = true;
		}

		if (this.txtBoxInfo.isSpeakerNotes)
		{
			var cls = 'LS_18';
			dojo.addClass(liNode, cls);
			addedPreDef = true;
		}
		else if (para.listBeforeStyle.fontSize != null)
		{
			var fontSize = Math.round(para.listBeforeStyle.fontSize);
			if(fontSize>200)
				fontSize = 200;//Since we only has CSS to support fontsize <= 200
			var cls = 'LS_' + fontSize;
			dojo.addClass(liNode, cls);
			addedPreDef = true;
		}

		if (para.listBeforeStyle.fontFamily != null)
		{
			var cls = 'LF_' + _filterFontFamily( para.listBeforeStyle.fontFamily);
			dojo.addClass(liNode, cls);
			addedPreDef = true;
		}
		if (para.listBeforeStyle.fontBold != null)
		{
			var cls = 'LB_' + (para.listBeforeStyle.fontBold ? 'TRUE' : 'FALSE');
			dojo.addClass(liNode, cls);
			addedPreDef = true;
		}
		if (para.listBeforeStyle.fontItalic != null)
		{
			var cls = 'LI_' + (para.listBeforeStyle.fontItalic ? 'TRUE' : 'FALSE');
			dojo.addClass(liNode, cls);
			addedPreDef = true;
		}
		
		// Add Inline class
		if(!addedPreDef)
			for ( var k = 0; k < para.clsInLineCS.length; k++)
				dojo.addClass(liNode, para.clsInLineCS[k]);

	},

	// get absolute value for line, and search its class
	_getAbsValueForSpan: function(span, styleName, para)
	{
		var selfAbsValue = null;
		// Self value
		switch (styleName)
		{
			case EditorUtil.ABS_STYLES.FONTSIZE:
				if (span.fontSize)
					selfAbsValue = span.fontSize;
				break;
		}
		// Class value
		if (selfAbsValue == null)
		{
			var spanClasses = this._getSpanClassesForView(span);
			selfAbsValue = this._getAbsValueFromClasses(spanClasses, styleName);
		}
		// Parent line value
		if (selfAbsValue == null)
		{
			selfAbsValue = this._getAbsValueForLine(para, styleName);
		}
		// Fixup value
		if (selfAbsValue == null)
		{
			switch (styleName)
			{
				case EditorUtil.ABS_STYLES.FONTSIZE:
					selfAbsValue = pe.scene.doc.fontSize || 18;
					var cBox = pe.scene.slideEditor.getEditingBox();
					if(cBox)
					{
						if(cBox.element.table)
							selfAbsValue = 18;
					}
					break;
			}
		}
		return selfAbsValue;
	},

	_updateViewValueForSpan: function(span, dom_Span, para)
	{
		var abs_styleNames = [EditorUtil.ABS_STYLES.FONTSIZE];
		for ( var i = 0; i < abs_styleNames.length; i++)
		{
			var selfAbsValue = this._getAbsValueForSpan(span, abs_styleNames[i], para);
			var relStyleName = null;
			switch (abs_styleNames[i])
			{
				case EditorUtil.ABS_STYLES.FONTSIZE:
					relStyleName = 'font-size';
					break;
			}

			switch (abs_styleNames[i])
			{
				case EditorUtil.ABS_STYLES.FONTSIZE:
					var relStyleValue = this.txtBoxInfo.isSpeakerNotes ? 1 : parseFloat(selfAbsValue) / 18.0;
					if (span.fontSuperSubScript == "super" || span.fontSuperSubScript == "sub")
						relStyleValue = relStyleValue * 0.58;
					EditorUtil.setStyle(dom_Span, relStyleName, relStyleValue + 'em');
					break;
			}
		}
	},

	renderSelectionAsDom: function()
	{
		if (this.selection.bCollapsed)
		{
			return null;
		}
		else
		{
			var dom_Root = document.createElement('div');
			if (this.selection.start.lineIndex == this.selection.end.lineIndex)
			{
				var domPara = this._renderOneLine(this.paragraphs[this.selection.start.lineIndex], null, this.selection.start.lineTextOffset, this.selection.end.lineTextOffset);
				dom_Root.appendChild(domPara);
			}
			else
			{
				var domPara = this._renderOneLine(this.paragraphs[this.selection.start.lineIndex], null, this.selection.start.lineTextOffset, null);
				dom_Root.appendChild(domPara);

				for ( var i = this.selection.start.lineIndex + 1; i <= (this.selection.end.lineIndex - 1); i++)
				{
					domPara = this._renderOneLine(this.paragraphs[i]);
					dom_Root.appendChild(domPara);
				}

				domPara = this._renderOneLine(this.paragraphs[this.selection.end.lineIndex], null, null, this.selection.end.lineTextOffset);
				dom_Root.appendChild(domPara);

			}

			return dom_Root;
		}
	},

	// return domPara
	_renderOneLine: function(para, renderInfo, startTextOffset, endTextOffset)
	{
		var dom_para = null;
		var dom_lineItem = null;
		var bNeedUseMasterNumbering = false;
		
		var temp_hyperlinkStoreMap = [];
		
		if (para.listType == null)
		{
			// paragraph
			dom_para = document.createElement('p');
			dom_lineItem = dom_para;
		}
		else if (para.listType == 'bullet')
		{
			// bullet
			dom_para = document.createElement('ul');
			dom_lineItem = document.createElement('li');
			dom_para.appendChild(dom_lineItem);
			dojo.addClass(dom_para, 'concordList');
			EditorUtil.setAttribute(dom_para, 'role', 'list');
			EditorUtil.injectRdomIdsForElement(dom_para);
		}
		else
		{
			// numbering
			dom_para = document.createElement('ol');
			dom_lineItem = document.createElement('li');
			dom_para.appendChild(dom_lineItem);
			EditorUtil.setAttribute(dom_para, 'numberType', para.listType);
			EditorUtil.setAttribute(dom_para, 'role', 'list');
			EditorUtil.setAttribute(dom_lineItem, 'startNumber', para.startNumber);
			EditorUtil.injectRdomIdsForElement(dom_para);
			if(!para.lastIndentTargetPara
					&& (!para.clsCustom || para.clsCustom.length == 0)
				)
				bNeedUseMasterNumbering = true;
		}

		if (dom_lineItem != null)
		{
			dom_lineItem.id = para.id;

			// EditorUtil.injectRdomIdsForElement(dom_lineItem);
			// Apply list style ========================================
			EditorUtil.setAttribute(dom_lineItem, 'level', para.level);
			var lineClasses = this._getLineClassesForView(para);
			// Add class
			for ( var k = 0; k < lineClasses.length; k++)
			{
				var cls = lineClasses[k];
				dojo.addClass(dom_lineItem, cls);
				if(bNeedUseMasterNumbering && cls.match(/^ML_/g))
				{
					var numInfo = EditorUtil.getMasterNumberingInfo(cls);
					if(numInfo)
					{
						EditorUtil.setAttribute(dom_para, 'numberType', numInfo.numberType);
						EditorUtil.setAttribute(dom_lineItem, 'startNumber', numInfo.startNumber);
					}
				}
			}
			var margin = (para.direction == "rtl") ? para.marginRight : para.marginLeft;
			if (margin != null)
				EditorUtil.setCustomStyle(dom_lineItem, EditorUtil.ABS_STYLES.MARGINLEFT, margin);
			if (para.marginRight != null)
				EditorUtil.setCustomStyle(dom_lineItem, EditorUtil.ABS_STYLES.MARGINRIGHT, para.marginRight);
			if (para.indent != null)
				EditorUtil.setCustomStyle(dom_lineItem, EditorUtil.ABS_STYLES.TEXTINDENT, para.indent);
			if (para.fontSize != null)
				EditorUtil.setCustomStyle(dom_lineItem, EditorUtil.ABS_STYLES.FONTSIZE, para.fontSize);
			// line node deson't allow fontsize style. remove it font-size style here.
			EditorUtil.removeStyle(dom_lineItem, 'font-size');

			if (para.lineHeight != null)
			{
				EditorUtil.setStyle(dom_lineItem, "line-height", para.lineHeight);//set html line value
			}
			
			if (para.absLineHeight != null && !isNaN(parseFloat(para.absLineHeight)))
				EditorUtil.setCustomStyle(dom_lineItem,"abs-line-height", para.absLineHeight);//set abs-value for pptxConversion
			else
			{
			 	if(!isNaN(parseFloat(para.lineHeight)))
			 	{
			 		para.absLineHeight = Math.round(parseFloat(para.lineHeight)*100/1.2558)/100;
					EditorUtil.setCustomStyle(dom_lineItem,"abs-line-height", para.absLineHeight);
			 	}
			}
			
			if (para.textAligment != null)
				EditorUtil.setStyle(dom_lineItem, "text-align", para.textAligment);
			if (para.direction != null)
				EditorUtil.setStyle(dom_lineItem, "direction", para.direction);

			if (para.marginTop != null)
				EditorUtil.setStyle(dom_lineItem, "margin-top", para.marginTop);
			if (para.marginBottom != null)
				EditorUtil.setStyle(dom_lineItem, "margin-bottom", para.marginBottom);

			if (para.odp_oldstylename != null)
				EditorUtil.setAttribute(dom_lineItem, "_oldstylename", para.odp_oldstylename);
			if (para.odp_oldlevel != null)
				EditorUtil.setAttribute(dom_lineItem, "_oldlevel", para.odp_oldlevel);

			this._updateViewValueForLine(para, dom_lineItem);

			// render text span ==============================
			var bEnableAddEmptySpan = false;
			if (para.strContent.length == 0)
				bEnableAddEmptySpan = true;

			var startSpanInfo = para.getSpanByLineTextOffset(startTextOffset);
			var endSpanInfo = para.getSpanByLineTextOffset(endTextOffset);

			var si = startSpanInfo ? startSpanInfo.index : 0;
			var ei = endSpanInfo ? endSpanInfo.index + 1 : para.spanList.length;
			var hyperlinkContinueId = false;
			for (j = si; j < ei; j++)
			{
				var span = para.spanList[j];
				if (span.bSoftBreak)
				{
					var dom_br = document.createElement('br');
					dojo.addClass(dom_br, 'text_line-break');
					
					if(hyperlinkContinueId)
					{
						var domHyperNode = temp_hyperlinkStoreMap[hashID];
						if(domHyperNode)
						{
							domHyperNode.appendChild(dom_br);
							continue;
						}
					}
					dom_lineItem.appendChild(dom_br);
				}
				else
				{
					var dom_span = document.createElement('span');

					var str = para.getSpanText(j);
					if (str.length)
					{
						var stoff = 0;// start text offset
						var etoff = str.length;// end text offset
						if (startSpanInfo && j == startSpanInfo.index)
						{
							stoff = startSpanInfo.offset;
						}
						if (endSpanInfo && j == endSpanInfo.index)
						{
							etoff = endSpanInfo.offset;
						}
						str = str.substring(stoff, etoff);
						
						//Change first space to nbsp
						if(j == si && (str.indexOf(" ")==0))
						{
							str = '\xa0' + str.substring(1);
						}
						EditorUtil.setText(dom_span, str);
					}
					else
					{
						var preSpan = para.spanList[j - 1];
						var nextSpan = para.spanList[j + 1];
						if (bEnableAddEmptySpan)
						{
							dom_span.innerHTML = '&#8203;';
							bEnableAddEmptySpan = false;
						}
						else if ((nextSpan && nextSpan.bSoftBreak) || !nextSpan && preSpan && preSpan.bSoftBreak)
						{
							// we keep the empty span which just before the softbreak
							dom_span.innerHTML = '&#8203;';
						}
						else
						{
							dojo.destroy(dom_span);
							continue;
						}
					}

					var spanClasses = this._getSpanClassesForView(span);
					// Add class
					for ( var k = 0; k < spanClasses.length; k++)
						dojo.addClass(dom_span, spanClasses[k]);

					// Render indicator
					if (renderInfo && renderInfo.enableIndicator && span.userId != null)
					{
						var aria = "coid_CSS_" + span.userId;
						var typeid = "CSS_" + span.userId;
						dojo.addClass(dom_span, typeid);
						dojo.addClass(dom_span, "indicatortag");
//						EditorUtil.setAttribute(dom_span, 'aria-labelledby', aria);
//						EditorUtil.setAttribute(dom_span, 'role', 'group');
						EditorUtil.setAttribute(dom_span, 'typeid', typeid);
						EditorUtil.setAttribute(dom_span, 'type', 'indicator');
					}

					dom_lineItem.appendChild(dom_span);
					if (span.id)
						dom_span.id = span.id;
					else
					{
						EditorUtil.injectRdomIdsForElement(dom_span);
						span.id = dom_span.id;
					}
					if (span.fontSize != null)
					{
						var fSize = span.fontSize;
						if (span.fontSuperSubScript == "super" || span.fontSuperSubScript == "sub")
							fSize = fSize * 0.58;
						EditorUtil.setCustomStyle(dom_span, EditorUtil.ABS_STYLES.FONTSIZE, fSize);
					}

					if (span.textShadow != null)
					{
						EditorUtil.setStyle(dom_span, "text-shadow", span.textShadow);
					}

					if (span.lineHeight != null)
					{
						EditorUtil.setStyle(dom_span, "line-height", span.lineHeight);
					}
					if (span.fontName != null)
					{
						EditorUtil.setStyle(dom_span, "font-family", span.fontName);
					}
					if (span.fontBold!= null)
						EditorUtil.setStyle(dom_span, "font-weight", (span.fontBold?'bold':'normal'));
					
					if (span.fontItalic!= null)
						EditorUtil.setStyle(dom_span, "font-style", (span.fontItalic?'italic':'normal'));

					var tdStyle = "";
					if (span.fontUnderLine)
						tdStyle += 'underline ';
					if (span.fontStrikeThrough)
						tdStyle += 'line-through ';
					if (tdStyle.length)
						EditorUtil.setStyle(dom_span, "text-decoration", tdStyle);
					// if we remove the style by user action
					else if(span.fontUnderLine == false || span.fontStrikeThrough == false)
						EditorUtil.setStyle(dom_span, "text-decoration", "none");

					if (span.fontColor != null)
						EditorUtil.setStyle(dom_span, "color", span.fontColor);

					if (span.fontSuperSubScript != null)
					{
						EditorUtil.setStyle(dom_span, "vertical-align", span.fontSuperSubScript);
					}
					
					if (span.upperLowerCase != null)
					{
						EditorUtil.setStyle(dom_span, "text-transform", span.upperLowerCase ? 'uppercase' : 'lowercase');
					}

					this._updateViewValueForSpan(span, dom_span, para);
					if (span.hyperLinkId)
					{
						// this span is a hyperlink
						// we need restore it
						var mapNode = this._hyperlinkStoreMap[span.hyperLinkId];
						if(mapNode)
						{
							var url = EditorUtil.getAttribute(mapNode,"href");
							if(!url)
								url = EditorUtil.getAttribute(mapNode,"xlink_href");
							if(!url)
								url="";
							url = url.toLowerCase();
							var hashID = EditorUtil.getStrHashCode(url);
							
							var domHyperNode = null;
							if(hashID === hyperlinkContinueId)
							{
								domHyperNode = temp_hyperlinkStoreMap[hashID];
							}
							if(!domHyperNode)
							{
								domHyperNode = EditorUtil.clone(mapNode, null, true);
								domHyperNode.id = EditorUtil.getUUID();
								EditorUtil.insertBefore(domHyperNode, dom_span);
								hyperlinkContinueId = hashID;
								temp_hyperlinkStoreMap[hyperlinkContinueId] = domHyperNode;
							}
							if(domHyperNode)
								domHyperNode.appendChild(dom_span);		
						}
						else
						{
							hyperlinkContinueId = null;
						}
					}
					else
						hyperlinkContinueId = null;

					if (span.misspell)
					{
						dojo.addClass(dom_span, "misspellWord");
						EditorUtil.setAttribute(dom_span, 'misword', span.misspell);
					}
				}
			}

			var dom_br = document.createElement('br');
			dojo.addClass(dom_br, 'hideInIE');
			dom_lineItem.appendChild(dom_br);
		}
		para.renderDirty = false;

		return dom_para;
	},

	// the paragraphs all the children of rootDivDomNode
	render: function(renderInfo,bForce)
	{
		if (!bForce && !this.renderDirty)
			return;

		// FirstCheck whether only one paragraph is changed
		var nDirtyParagraphs = 0;
		var uniqueDirtypara = null;
		for ( var i = 0; i < this.paragraphs.length; i++)
		{
			var para = this.paragraphs[i];
			if (bForce || para.renderDirty)
			{
				nDirtyParagraphs++;
				uniqueDirtypara = para;
				if (nDirtyParagraphs > 1)
				{
					uniqueDirtypara = null;
					break;
				}
			}
		}

		for ( var i = 0; i < this.deletedLineIds.length; i++)
		{
			// Try find the line from dom
			var domLine = dojo.query("[id='" + this.deletedLineIds[i] + "']", this.dom_rootNode)[0];
			// if found replace this paragraph only
			if (domLine)
			{
				var domPara = domLine;
				if (EditorUtil.is(domLine, 'li'))
					domPara = domLine.parentNode;
				dojo.destroy(domPara);
			}
		}

		var dolistBeforeLines = [];
		var bNeedUpdateListValue = false;
		if (nDirtyParagraphs != 0)
		{
			var domLine = uniqueDirtypara ? dojo.query("[id='" + uniqueDirtypara.id + "']", this.dom_rootNode)[0] : null;
			// For only one change, we just replace this node
			if ((nDirtyParagraphs == 1) && domLine)
			{
				var para = uniqueDirtypara;
				var newDomPara = this._renderOneLine(para, renderInfo);
				if (para.listType)
				{
					dolistBeforeLines.push({
						para: para,
						liNode: newDomPara.firstChild
					});
				}
				if (EditorUtil.is(domLine, 'li'))
					domLine = domLine.parentNode;
				EditorUtil.replace(newDomPara, domLine);
				bNeedUpdateListValue = true;
			}
			else
			{
				var newDomCloneRoot = EditorUtil.clone(this.dom_rootNode, null, true);
				for ( var i = 0; i < this.paragraphs.length; i++)
				{
					var para = this.paragraphs[i];
					if (!bForce && !para.renderDirty)
					{
						// Try find the line from dom
						var domLine = dojo.query("[id='" + para.id + "']", this.dom_rootNode)[0];
						// if found still use the dom
						if (domLine)
						{
							if (EditorUtil.is(domLine, 'li'))
								domLine = domLine.parentNode;
							domLine = EditorUtil.clone(domLine, true, true);
							newDomCloneRoot.appendChild(domLine);
							continue;
						}
						// if not found, continue to render
					}
					var dom_para = this._renderOneLine(para, renderInfo);
					newDomCloneRoot.appendChild(dom_para);
					if (para.listType)
					{
						dolistBeforeLines.push({
							para: para,
							liNode: dom_para.firstChild
						});
					}
				}

				EditorUtil.replace(newDomCloneRoot, this.dom_rootNode);
				var curEditingBox = pe.scene.slideEditor.getEditingBox();
				if (curEditingBox)
					curEditingBox.regCopyPasteIssueCasesEvents();
				this.dom_rootNode = newDomCloneRoot;
				bNeedUpdateListValue = true;
			}
		}

		if (this.txtBoxInfo.verticalAligment)
			EditorUtil.setStyle(this.dom_rootNode, "vertical-align", this.txtBoxInfo.verticalAligment);

		// Clear all deleted lines id
		this.deletedLineIds = [];

		if (bNeedUpdateListValue)
		{
			EditorUtil.updateListValue(this.dom_rootNode);
		}

		for ( var i = 0; i < dolistBeforeLines.length; i++)
			this._updateListBeforeForView(dolistBeforeLines[i]);

		this.renderDirty = false;
	},

	handleTabKey: function(bShift)
	{
		if (this.selection.start.lineTextOffset === 0 || ((this.selection.end.lineTextOffset - this.selection.start.lineTextOffset) > 0))
		{
			this.indentList(!bShift);
		}
		else
		{
			this.insertString("    ");
		}
	},
	
	_CheckChangeHyperLink : function(bSpace)
	{
		if(this.selection.bCollapsed)
		{
			var para = this.paragraphs[this.selection.start.lineIndex];
			if (!para)
				return null;
			var originalStartOffset = this.selection.start.lineTextOffset;
			var checkStartOffset = originalStartOffset + (bSpace?-1:0);
			var forwardStr = para.strContent.substring(0, checkStartOffset);
			var indexSpace = forwardStr.lastIndexOf(" ");
			var word = forwardStr.substring(indexSpace+1);
			var bUrl = (word.lastIndexOf(".")>0)?dojox.validate.isUrl(word):false;
			var bEmail = dojox.validate.isEmailAddress(word);
			if(bUrl || bEmail)
			{
				var old_Sel_bCollapsed = this.selection.bCollapsed;
				var old_Sel_LineStart = this.selection.start.lineIndex;
				var old_Sel_LineEnd = this.selection.end.lineIndex;
				var old_Sel_OffStart = this.selection.start.lineTextOffset;
				var old_Sel_OffEnd = this.selection.end.lineTextOffset;
				
				this.selection.bCollapsed = false;
				this.selection.end.lineIndex = this.selection.start.lineIndex;
				this.selection.end.lineTextOffset = checkStartOffset;
				this.selection.start.lineTextOffset = indexSpace+1;
				
				
				var retval = this.getCurEditingSpanModel(true);
				var hyperlinkDomID = null;
				if(retval && retval.spanList)
				{
					for(var i=0;i<retval.spanList.length;i++)
					{
						var span = retval.spanList[i];
						
						if(!hyperlinkDomID && span.hyperLinkId)
						{
							hyperlinkDomID = span.hyperLinkId;
						}
						
						if(hyperlinkDomID && hyperlinkDomID!=span.hyperLinkId)
						{
							this.selection.bCollapsed = old_Sel_bCollapsed;
							this.selection.start.lineIndex = old_Sel_LineStart;
							this.selection.end.lineIndex = old_Sel_LineEnd;
							this.selection.start.lineTextOffset = old_Sel_OffStart;
							this.selection.end.lineTextOffset = old_Sel_OffEnd;
							return null;
						}
					}
				}

				if(!hyperlinkDomID)
				{
					if(bUrl)
					{
						var index = word.indexOf("://");
						if(index<0)
							word = "http://" + word;	
						this.insertChangeHyperLink(word);
					}
					else//Email
					{
						var mail = "mailto:"+word +"?subject=";
						this.insertChangeHyperLink(mail);
					}
				}

				this.selection.bCollapsed = true;
				this.selection.start.lineTextOffset = originalStartOffset;
				this.selection.end.lineIndex = null;
				this.selection.end.lineTextOffset = null;
				
			}
		}
	},
	
	handleSpaceKey: function()
	{
		this.insertString(" ");
		this._CheckChangeHyperLink(true);
	},

	// Get master classes for one paragraph
	_getMasterClasses: function(level)
	{
		// ML_[masterName]_[layoutFamily]_[Index]_[level]	
		var classAppednStr = "";
		if( this.txtBoxInfo.placeholderType == 'notes')
			classAppednStr = this.txtBoxInfo.placeholderType + '_' + level;
		else
			classAppednStr = this.txtBoxInfo.masterPageName 
			+ '_' + this.txtBoxInfo.placeholderType 
			+ '_' + (this.txtBoxInfo.placeholderIndex ? (this.txtBoxInfo.placeholderIndex + '_') : '') + level;
		
		var reML = 'ML_' + classAppednStr;
		var reMP = 'MP_' + classAppednStr;
		var reMT = 'MT_' + classAppednStr;

		// Comment the following code for return master class any way
		if (!EditorUtil.hasMasterClass(reML) && !EditorUtil.hasMasterClass(reML + ":before") && !EditorUtil.hasMasterClass(reMP) && !EditorUtil.hasMasterClass(reMT))
		{
			// All missing we need turn a default master
			// build default master
			reML = 'ML_default' + this.txtBoxInfo.placeholderType + '_' + level;
			reMP = 'MP_default' + this.txtBoxInfo.placeholderType + '_' + level;
			reMT = 'MT_default' + this.txtBoxInfo.placeholderType + '_' + level;
		}

		return {
			listClass: reML,
			paragraphClass: reMP,
			textClass: reMT
		};
	},

	updateTxtSelection: function(selInfo)
	{
		this.selection.bCollapsed = selInfo.bCollapsed;
		this.selection.start.lineIndex = selInfo.startSelection.lineIndex;
		this.selection.start.lineTextOffset = selInfo.startSelection.lineTextOffset;
		if (selInfo.endSelection)
		{
			this.selection.end.lineIndex = selInfo.endSelection.lineIndex;
			this.selection.end.lineTextOffset = selInfo.endSelection.lineTextOffset;
		}
		else
		{
			this.selection.end.lineIndex = null;
			this.selection.end.lineTextOffset = null;
		}
		this.tempCollapsedStyleSpan = null;
		return this.selection;
	},

	getViewSelectionInfo: function()
	{
		if (!this.selection || this.selection.start.lineIndex == null)
			return null;

		var para = this.paragraphs[this.selection.start.lineIndex];
		if (!para)
			return null;

		var startInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset);
		if (!startInfo)
			return null;

		var startSelection = {
			lineIndex: this.selection.start.lineIndex,// which line
			textOffset: startInfo.offset,
			lineTextOffset: this.selection.start.lineTextOffset
		// which position in character in line
		};

		var endSelection = null;
		if (this.selection.end.lineIndex != null)
		{
			para = this.paragraphs[this.selection.end.lineIndex];
			if (!para)
				return null;
			var endInfo = para.getSpanByLineTextOffset(this.selection.end.lineTextOffset);
			if (!endInfo)
				return null;

			endSelection = {
				lineIndex: this.selection.end.lineIndex,// which line
				textOffset: endInfo.offset,
				lineTextOffset: this.selection.end.lineTextOffset
			// which position in character in line
			};
		}

		return {
			bCollapsed: this.selection.bCollapsed,
			startSelection: startSelection,
			endSelection: endSelection,
			root: this.dom_rootNode
		};
	},

	getSelectionAsModel: function()
	{
		var cloneHyperlinkStoreMap = [];
		for(var key in this._hyperlinkStoreMap)
		{
			var node = this._hyperlinkStoreMap[key];
			cloneHyperlinkStoreMap.push({id:key,html:node.outerHTML});
		}
		
		var newParagraph = [];
		if (this.selection.bCollapsed)
		{
			// TODO, add empty span in the location
			return {
				paragraphs: newParagraph,
				hyperlinkmap : cloneHyperlinkStoreMap
			};
		}
		else
		{
			if (this.selection.start.lineIndex == this.selection.end.lineIndex)
			{
				var orp = this.paragraphs[this.selection.start.lineIndex];
				var newPara = orp.getSelectionModel(this.selection.start.lineTextOffset, this.selection.end.lineTextOffset);
				newPara.isVirtualParagraph = true;// means we only select the text in this paragraph
				newParagraph.push(newPara);
				if(this.selection.start.lineTextOffset ==0 && orp.strContent.length == this.selection.end.lineTextOffset)
					newPara.isVirtualParagraph = false;//if select whole line then deal as paragraph
			}
			else
			{
				var newPara = this.paragraphs[this.selection.start.lineIndex].getSelectionModel(this.selection.start.lineTextOffset, null);
				newParagraph.push(newPara);

				for ( var i = this.selection.start.lineIndex + 1; i <= (this.selection.end.lineIndex - 1); i++)
				{
					newPara = this.paragraphs[i].getSelectionModel(null, null);
					newParagraph.push(newPara);
				}

				newPara = this.paragraphs[this.selection.end.lineIndex].getSelectionModel(null, this.selection.end.lineTextOffset);
				newParagraph.push(newPara);
			}
		}
		return {
			paragraphs: newParagraph,
			hyperlinkmap : cloneHyperlinkStoreMap
		};
	},

	// insertModel {para/span}
	insertModel: function(jsonModel)
	{
		if (!jsonModel 
				|| !jsonModel.paragraphs 
				|| !jsonModel.paragraphs[0] 
				|| !jsonModel.paragraphs[0].spanList 
				|| !jsonModel.paragraphs[0].spanList[0])
			return;
		
		var hylnkMap = jsonModel.hyperlinkmap;
		if(hylnkMap)
		{
			for(var i=0;i<hylnkMap.length;i++)
			{
				var n = hylnkMap[i];//id:key,html:node.outerHTML
				var atRoot = document.createElement('div');
				atRoot.innerHTML = n.html;
				this._hyperlinkStoreMap[n.id] = EditorUtil.clone(atRoot.firstChild, null, true);
				dojo.destroy(atRoot);
			}
			
			for ( var i = 0; i < jsonModel.paragraphs.length; i++)
			{
				var para = jsonModel.paragraphs[i];
				if(para.spanList)
				{
					for ( var j = 0; j < para.spanList.length; j++)
					{
						var span = para.spanList[j];
						if(span.hyperLinkId && span.fontColor)
						{	//Try to remove color which same as hyperlink color
							var color = EditorUtil.convertToHexColor(span.fontColor);
							color = color.toLowerCase();
							if(color == "#4178be")
							{
								span.fontColor = null;
								span.fontUnderLine = null;
							}
						}
					}
				}
			}
		}		

		if (jsonModel.paragraphs[0].isVirtualParagraph)
		{
			// insert span into current line
			if (!this.selection.bCollapsed)
				this._deleteSelection();

			var para = this.paragraphs[this.selection.start.lineIndex];
			var jsonPara = jsonModel.paragraphs[0];
			var offset = this.selection.start.lineTextOffset;
			var splitInfo = para.splitSpan(offset);

			var newSpanList = [];

			for ( var i = 0; i < splitInfo.postIndex; i++)
				newSpanList.push(para.spanList[i]);

			for ( var i = 0; i < jsonPara.spanList.length; i++)
			{
				var newSpan = new pres.editor.model.Span();
				jsonPara.spanList[i].lineHeight ="";
				newSpan.clone(jsonPara.spanList[i]);
				newSpanList.push(newSpan);
			}

			for ( var i = splitInfo.postIndex; i < para.spanList.length; i++)
				newSpanList.push(para.spanList[i]);

			para.strContent = (para.strContent.substring(0, offset) + jsonPara.strContent + para.strContent.substring(offset));
			para.spanList = newSpanList;
			para.renderDirty = true;
			this.selection.start.lineTextOffset += jsonPara.strContent.length;
			if (this.selection.start.lineTextOffset > para.strContent.length)
				this.selection.start.lineTextOffset = para.strContent.length;
		}
		else
		{
			// insert paragraphs into current line list
			var orgParaEmpty = false;
			this.handleEnter();
			var orgPara = this.paragraphs[this.selection.start.lineIndex - 1];
			if (orgPara.strContent.length == 0)
				orgParaEmpty = true;
			var newParaList = [];
			var focusPara = this.paragraphs[this.selection.start.lineIndex];
			for ( var i = 0; i < this.selection.start.lineIndex - 1; i++)
				newParaList.push(this.paragraphs[i]);
			if (!orgParaEmpty)
				newParaList.push(orgPara);
			
			var bEnableFollowStyle = true;
			//if the insert paragraph has any list, we do not follow the list style
			for ( var i = 0; i < jsonModel.paragraphs.length; i++)
			{
				var p = jsonModel.paragraphs[i];
				if((p.listType!=null) && (p.level == focusPara.level))
				{
					bEnableFollowStyle = false;
					break;
				}
			}
			
			for ( var i = 0; i < jsonModel.paragraphs.length; i++)
			{
				var newPara = new pres.editor.model.Paragraph();
				newPara.clone(jsonModel.paragraphs[i]);
				newPara.renderDirty = true;
				newPara.id = EditorUtil.getUUID();
				if (bEnableFollowStyle 
						&& focusPara.listType 
						&& !newPara.listType
						&& newPara.level == focusPara.level)
				{
					newPara.listType = focusPara.listType;
					newPara.listBeforeStyle.color = focusPara.listBeforeStyle.color;
					newPara.listBeforeStyle.fontSize = focusPara.listBeforeStyle.fontSize;
					newPara.listBeforeStyle.fontFamily = focusPara.listBeforeStyle.fontFamily;
					newPara.listBeforeStyle.fontBold = focusPara.listBeforeStyle.fontBold;
					newPara.listBeforeStyle.fontItalic = focusPara.listBeforeStyle.fontItalic;
					newPara.updateListBeforeDataFromSpan();
				}
				else
				{
					newPara.listBeforeStyle.color = null;
					newPara.listBeforeStyle.fontSize = null;
					newPara.listBeforeStyle.fontFamily = null;
					newPara.listBeforeStyle.fontBold = null;
					newPara.listBeforeStyle.fontItalic = null;
				}
				newParaList.push(newPara);
			}
			// empty line will be created by this.handleEnter(), do not add it to model.
			if (focusPara.strContent.length > 0)
				newParaList.push(focusPara);

			for ( var i = this.selection.start.lineIndex + 1; i < this.paragraphs.length; i++)
				newParaList.push(this.paragraphs[i]);

			this.paragraphs = newParaList;
			// put cursor to the end of last pasted paragraph
			this.selection.start.lineIndex += (jsonModel.paragraphs.length - 1);
			orgParaEmpty && (this.selection.start.lineIndex--);
			this.selection.start.lineTextOffset = this.paragraphs[this.selection.start.lineIndex].strContent.length;
		}
		
		
		
		this.renderDirty = true;
	},

	// ================= [ALL ACTION FUNCTIONS BELOW] ==========================
	//return the span model be inserted if success
	insertString: function(str, userId, bindStyle)
	{
		var len = str.length;
		if (!len)
			return null;
		if (!this.selection.bCollapsed)
		{
			this._deleteSelection();
		}

		var para = this.paragraphs[this.selection.start.lineIndex];
		if (!para)
			return null;
		var offset = this.selection.start.lineTextOffset;

		// Find the focus span
		var spanInfo = para.getSpanByLineTextOffset(offset);
		if(!spanInfo){
			console.error("Can not find the focus span!");
			return;
		} 
		var focusSpan = spanInfo.spanNode;
		var nextSpan = para.spanList[spanInfo.index + 1];
		
		var bStopContinueHyperLinkInput = false;	
		if(focusSpan.length == spanInfo.offset)
		{	//at a span end
			if(focusSpan.hyperLinkId)//current span has hyperlink
			{
				if(!nextSpan // no next span
					||nextSpan.bSoftBreak // next span is br
					|| nextSpan.hyperLinkId == null //no hyperlink
						)
				{
					bStopContinueHyperLinkInput = true;
				}
			}
		}

		
		if (spanInfo.spanNode.bSoftBreak)
		{
			// we input at the soft<br> end, we need create a span
			focusSpan = new pres.editor.model.Span();
			focusSpan.copyStyle(spanInfo.spanNode);
			para.insertSpan(this.selection.start.lineTextOffset ? spanInfo.index + 1 : spanInfo.index, focusSpan);
			focusSpan.userId = userId;
			focusSpan.length += len;
		}
		else if (!bindStyle 
				&& (focusSpan.userId == userId) 
				&& !this.tempCollapsedStyleSpan
				&& !bStopContinueHyperLinkInput
				)
				
		{
			focusSpan.length += len;
		}
		else
		{
			// we need break the span, and add new span to hold user id
			var splitInfo = para.splitSpan(offset);
			focusSpan = new pres.editor.model.Span();
			if (this.tempCollapsedStyleSpan)
			{
				(offset == 0) && (pe.paraFirstTextChange = true);
				focusSpan.copyStyle(this.tempCollapsedStyleSpan);
				this.tempCollapsedStyleSpan = null;
			}
			else
				focusSpan.copyStyle(splitInfo.postSpan);
			if(bStopContinueHyperLinkInput)//do not continue hyperlink, if at a hyperlink node end
				focusSpan.hyperLinkId = null;
			para.insertSpan(splitInfo.postIndex, focusSpan);
			focusSpan.userId = userId;
			focusSpan.length += len;
			
			if(bindStyle)
			{
				if(bindStyle.hyperlink && bindStyle.hyperlink.length>0)
				{
					var hyperLinkId = this._appendHyperLinkToMap(bindStyle);
					focusSpan.hyperLinkId = hyperLinkId;
				}
			}
			
		}
		para.strContent = (para.strContent.substring(0, offset) + str + para.strContent.substring(offset));
		para.fixBlankSpace();

		this.selection.start.lineTextOffset += len;

		if(len>1)//input more than char, so not keyboard input
			para.clearInvalidSpan();
		
		para.renderDirty = true;
		this.renderDirty = true;
		return focusSpan;
	},
	
	_appendHyperLinkToMap : function(link)
	{
		//{hyperlink:strHyperlink,xlinkPrefix:xlinkPrefix}
		
		if(!link || !link.hyperlink || !link.hyperlink.length)
			return null;
		
		var hyperLinkId = EditorUtil.getUUID();
		//build Hyperlink
		var domHyperNode = document.createElement('a');

		if(link.xlinkPrefix && link.xlinkPrefix.length)
		{
			EditorUtil.removeAttribute(domHyperNode,"href");
			EditorUtil.setAttribute(domHyperNode,"xlink_href",link.xlinkPrefix + link.hyperlink);
		}
		else
		{
			EditorUtil.removeAttribute(domHyperNode,"xlink_href");
			EditorUtil.setAttribute(domHyperNode,"href",link.hyperlink);
		}
		
		this._hyperlinkStoreMap[hyperLinkId] = domHyperNode;
		return hyperLinkId;
	},	

	_deleteSelection: function()
	{
		if (this.selection.bCollapsed)
			return;
		var startLineIndex = this.selection.start.lineIndex;
		var endLineIndex = this.selection.end.lineIndex;
		var startTextOffset = this.selection.start.lineTextOffset;
		var endTextOffset = this.selection.end.lineTextOffset;

		var startPara = this.paragraphs[startLineIndex];
		startPara.renderDirty = true;
		var endPara = this.paragraphs[endLineIndex];
		endPara.renderDirty = true;

		if (startLineIndex == endLineIndex)
		{
			// delete in same line
			startPara.removeText(startTextOffset, endTextOffset - startTextOffset);

			var startSpanInfo = startPara.getSpanByLineTextOffset(startTextOffset);
			var endSpanInfo = startPara.getSpanByLineTextOffset(endTextOffset);
			if (startSpanInfo.index === endSpanInfo.index)
			{
				// delete same span
				var span = startSpanInfo.spanNode;
				span.length = span.length - (endTextOffset - startTextOffset);
			}
			else
			{
				var startSpan = startSpanInfo.spanNode;
				startSpan.length = startSpanInfo.offset;
				var endSpan = endSpanInfo.spanNode;
				endSpan.length = endSpan.length - endSpanInfo.offset;
				startPara.spanList.splice(startSpanInfo.index + 1, endSpanInfo.index - startSpanInfo.index - 1);
			}
		}
		else
		{
			// delete in different line=================
			// delete the back part of start line
			startPara.strContent = startPara.strContent.substring(0, startTextOffset);
			var startSpanInfo = startPara.getSpanByLineTextOffset(startTextOffset);
			var startSpan = startSpanInfo.spanNode;
			startSpan.length = startSpanInfo.offset;
			startPara.spanList.splice(startSpanInfo.index + 1, startPara.spanList.length - startSpanInfo.index - 1);

			// delete the front part of end line
			endPara.strContent = endPara.strContent.substring(endTextOffset);
			var endSpanInfo = endPara.getSpanByLineTextOffset(endTextOffset);
			var endSpan = endSpanInfo.spanNode;
			endSpan.length = endSpan.length - endSpanInfo.offset;
			endPara.spanList.splice(0, endSpanInfo.index);

			// merge end line to start line
			startPara.strContent = startPara.strContent + endPara.strContent;
			startPara.spanList = startPara.spanList.concat(endPara.spanList);

			// delete the lines between them, including end line
			for ( var i = startLineIndex + 1; i <= endLineIndex; i++)
			{
				this.deletedLineIds.push(this.paragraphs[i].id);
			}
			this.paragraphs.splice(startLineIndex + 1, endLineIndex - startLineIndex);

		}

		this.selection.bCollapsed = true;
		this.selection.end.lineIndex = null;
		this.selection.end.lineTextOffset = null;
		this.renderDirty = true;
		if(this.selection.start.lineTextOffset == 0)
		{
			startPara.listBeforeStyle.color = null;
			startPara.listBeforeStyle.fontSize = null;
		}
		startPara.clearInvalidSpan();
	},

	handleDetete: function(isBackSpace)
	{
		var _curLineIndex = this.selection.start.lineIndex;
		var curPara = this.paragraphs[_curLineIndex];
		if(!curPara)
			return false;
		//Store first visible span style
		var firstSpan = curPara.spanList[0];
		for(var i=0;i<curPara.spanList.length;i++)
		{
			var span = curPara.spanList[i];
			if(span.length && !span.bSoftBreak)
			{
				firstSpan = span;
				break;
			}
		}

		function _postDelete(_this)
		{
			//restore first visible span style
			var para = _this.paragraphs[_this.selection.start.lineIndex];
			if(para.strContent.length==0)
			{
				para.spanList = [firstSpan];
			}
			
			para.fixBlankSpace();
			
			//for empty span remove it hyperlink
			for(var i=0;i<para.spanList.length;i++)
			{
				var span = para.spanList[i];
				if(span.length==0)
				{
					span.hyperLinkId = null;
				}
			}
		}
		
		if (!this.selection.bCollapsed)
		{
			this._deleteSelection();
			_postDelete(this);
			return true;
		}

		curPara.renderDirty = true;
		if (isBackSpace)
		{
			var action = null;
			if (this.selection.start.lineTextOffset == 0)
			{
				// we at line start
				if (curPara.listType == null)
				{
					action = "GotoPreviousLine";
				}
				else
				// it is a list, disable the list
				{
					action = "DisableList";
				}
			}
			else
			{
				action = "BackspaceText";
			}
		}
		else
		{
			if ((curPara.strContent.length == 0) && (curPara.listType == null))
			{
				action = "RemoveLine";
			}
			else if (this.selection.start.lineTextOffset == curPara.strContent.length)
			{
				// we at line end
				action = "NextLineUp";
			}
			else
			{
				action = "DeleteText";
			}

		}

		switch (action)
		{
			case 'DisableList':
				this._disableList([_curLineIndex]);
				break;
			case 'NextLineUp':
				this._MergeLine(_curLineIndex, true);
				break;
			case 'GotoPreviousLine':
				this._MergeLine(_curLineIndex, false);
				break;
			case 'BackspaceText':
				this._deleteLineText(true);
				break;
			case 'DeleteText':
				this._deleteLineText(false);
				break;
			case 'RemoveLine':
				this._RemoveLine(_curLineIndex);
				break;
			default:
				break;
		}
		this.renderDirty = true;
		if(this.selection.start.lineTextOffset == 0)
		{
			curPara.listBeforeStyle.color = null;
			curPara.listBeforeStyle.fontSize = null;
		}
		_postDelete(this);
		return true;
	},

	// disable the paragraph, if it is a list
	// parameter is a group of paragraph index
	_disableList: function(paraList)
	{
		for ( var i = 0; i < paraList.length; i++)
		{
			var para = this.paragraphs[paraList[i]];
			para.disableList();
			para.renderDirty = true;
		}
		this.renderDirty = true;
	},

	_RemoveLine: function(lineIndex)
	{
		if (lineIndex == this.paragraphs.length - 1)
			return;
		var para = this.paragraphs[lineIndex];
		this.selection.start.lineTextOffset = 0;
		this.deletedLineIds.push(para.id);
		this.paragraphs.splice(lineIndex, 1);
		this.selection.end.lineIndex = null;
		this.selection.end.lineTextOffset = null;
		this.renderDirty = true;
	},

	// bMergeNextLine = true, merge the line behind current line
	// otherwise, merge the line previous current line
	_MergeLine: function(lineIndex, bMergeNextLine)
	{
		var prePara = null;
		var nextPara = null;
		if (bMergeNextLine)
		{
			if (lineIndex == this.paragraphs.length - 1)
				return;
			prePara = this.paragraphs[lineIndex];
			nextPara = this.paragraphs[lineIndex + 1];
		}
		else
		{

			if (lineIndex == 0)
				return;
			prePara = this.paragraphs[lineIndex - 1];
			nextPara = this.paragraphs[lineIndex];
		}

		this.selection.start.lineTextOffset = prePara.strContent.length;
		prePara.strContent += nextPara.strContent;
		prePara.spanList = prePara.spanList.concat(nextPara.spanList);
		nextPara.spanList = null;
		this.deletedLineIds.push(nextPara.id);
		this.paragraphs.splice(bMergeNextLine ? lineIndex + 1 : lineIndex, 1);

		this.selection.start.lineIndex = bMergeNextLine ? lineIndex : lineIndex - 1;
		// this.selection.start.lineTextOffset = prePara.strContent.length;
		this.selection.end.lineIndex = null;
		this.selection.end.lineTextOffset = null;
		prePara.renderDirty = true;
		this.renderDirty = true;
	},

	_deleteLineText: function(isBackSpace)
	{
		var para = this.paragraphs[this.selection.start.lineIndex];
		var spanInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset, !isBackSpace, true);

		if(!spanInfo){
			console.error("Can not find the focus span!");
			return;
		} 

		var focusSpan = spanInfo.spanNode;
		var focusSpanIndex = spanInfo.index;

		if (spanInfo.spanNode.length == 0)
		{
			if (isBackSpace)
			{
				for ( var i = spanInfo.index; i >= 0; i--)
				{
					if (para.spanList[i].length > 0)
					{
						focusSpanIndex = i;
						focusSpan = para.spanList[i];
						break;
					}
				}
			}
			else
			{
				for ( var i = spanInfo.index; i < para.spanList.length; i++)
				{
					if (para.spanList[i].length > 0)
					{
						focusSpanIndex = i;
						focusSpan = para.spanList[i];
						break;
					}
				}
			}
		}

		focusSpan.length -= 1;
		if (focusSpan.length <= 0)
		{
			// process all span nodes, remove other emptyn
			if (para.spanList.length > 1) // ensure we not remove the only one span
				para.spanList.splice(focusSpanIndex, 1);
		}

		if (isBackSpace)
			para.removeText(this.selection.start.lineTextOffset - 1, 1);
		else
			para.removeText(this.selection.start.lineTextOffset, 1);

		if (isBackSpace)
			this.selection.start.lineTextOffset -= 1;
		
		if(this.selection.start.lineTextOffset == 0)
			pe.paraFirstTextChange = true;
		
		this.selection.end.lineIndex = null;
		this.selection.end.lineTextOffset = null;
		this._removeInvalidSpan([para]);
		para.renderDirty = true;
		this.renderDirty = true;
	},

	_removeInvalidSpan: function(paraList)
	{
		for ( var i = 0; i < paraList.length; i++)
		{
			var newSpans = [];
			var para = paraList[i];
			for ( var k = 0; k < para.spanList.length; k++)
			{
				if (para.spanList[k].length > 0)
				{
					newSpans.push(para.spanList[k]);
				}
				else
				{
					var postSpan = para.spanList[k + 1];
					if (!postSpan || postSpan.bSoftBreak)
					{
						newSpans.push(para.spanList[k]);
					}
				}
			}
			para.spanList = newSpans;
		}
	},

	handleEnter: function(bSoftBreak)
	{
		// First delete the range selection
		if (!this.selection.bCollapsed)
		{
			this._deleteSelection();
		}
		
		this._CheckChangeHyperLink(false);
		
		var para = this.paragraphs[this.selection.start.lineIndex];
		para.renderDirty = true;
		// Break current span
		// <foucs|Span> ===> <focus><Span>
		var splitInfo = para.splitSpan(this.selection.start.lineTextOffset);
		// return {
		// preSpan : focusSpanInfo.spanNode,
		// preIndex : focusSpanInfo.index,
		// postSpan : newSpan,
		// postIndex : focusSpanInfo.index + 1
		// };

		// var spanInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset);
		// Then we could break the line
		if (bSoftBreak)
		{
			var brSpan = new pres.editor.model.Span();
			brSpan.length = 1;
			brSpan.bSoftBreak = true;
			brSpan.copyStyle(splitInfo.preSpan);
			para.insertSpan(splitInfo.postIndex, brSpan);
			if (splitInfo.preSpan.bSoftBreak)
			{
				var span = new pres.editor.model.Span();
				span.length = 0;
				span.copyStyle(splitInfo.preSpan);
				para.insertSpan(splitInfo.postIndex + 1, span);
			}
			else if (splitInfo.postSpan.bSoftBreak)
			{
				var span = new pres.editor.model.Span();
				span.length = 0;
				span.copyStyle(brSpan);
				para.insertSpan(splitInfo.postIndex + 1, span);
			}

			para.insertText(this.selection.start.lineTextOffset, this.SOFTBREAKCHAR);
			this.selection.start.lineTextOffset++;
		}
		else
		// hard break, create new line
		{
			var newPara = new pres.editor.model.Paragraph();
			newPara.copyStyle(para);
			newPara.id = EditorUtil.getUUID();
			newPara.renderDirty = true;
			// Move the node from focus line
			for ( var i = splitInfo.postIndex; i < para.spanList.length; i++)
			{
				var span = para.spanList[i];
				if((i==splitInfo.postIndex) && (span.length==0))
					span.hyperLinkId = null;
				newPara.spanList.push(span);
			}
			// remove the old span from focus line
			para.spanList.splice(splitInfo.postIndex, para.spanList.length - splitInfo.postIndex);

			newPara.strContent = para.strContent.substring(this.selection.start.lineTextOffset);
			para.strContent = para.strContent.substring(0, this.selection.start.lineTextOffset);

			this.selection.start.lineIndex++;
			this.selection.start.lineTextOffset = 0;
			this._insertParagraph(this.selection.start.lineIndex, newPara);
		}
		this._removeInvalidSpan([para]);
		this.renderDirty = true;
	},
	// insert paragraph just at the paragraphs[index] node, after insert, it at the "index"
	// if index == paragraphs.length, we insert at last, equal to .push()
	_insertParagraph: function(index, para)
	{
		if (index == this.paragraphs.length)
			this.paragraphs.push(para);
		else
			this.paragraphs.splice(index, 0, para);
		para.renderDirty = true;
		this.renderDirty = true;
	},

	_getSelectedParagraphs: function()
	{
		var paraList = [];
		var endIndex = this.selection.end.lineIndex ? this.selection.end.lineIndex : this.selection.start.lineIndex;
		for ( var i = this.selection.start.lineIndex; i <= endIndex; i++)
		{
			paraList.push(this.paragraphs[i]);
		}
		return paraList;
	},

	// if targetListClass == null, it means we need disable list
	toggleListStyle: function(targetListClass, bNumbering)
	{
		var paraList = this._getSelectedParagraphs();
		if (paraList.length == 0)
			return;

		if (targetListClass == false || targetListClass == null)
		{
			for ( var i = 0; i < paraList.length; i++)
			{
				paraList[i].disableList();
				paraList[i].renderDirty = true;
			}
		}
		else
		{
			if (targetListClass == true)
				targetListClass = bNumbering ? 'lst-n' : 'lst-c';

			for ( var i = 0; i < paraList.length; i++)
			{
				paraList[i].setCustomList(targetListClass, bNumbering,this.txtBoxInfo.isPlaceholder);
				paraList[i].renderDirty = true;
			}
		}
		this.renderDirty = true;
	},

	getParagraphIndex: function(para)
	{
		var len = this.paragraphs.length;
		for ( var i = 0; i < len; i++)
			if (this.paragraphs[i] === para)
				return i;
		return -1;
	},

	indentList: function(isIndent)
	{
		function _findTargetParagraph(para, txtCell)
		{
			var targetPara = null;
			var newLevel = para.level + (isIndent ? 1 : -1);
			if (newLevel <= 0)
				newLevel = 1;
			if (newLevel >= 9)
				newLevel = 9;
			if (newLevel == para.level)
				return null;

			var sourceIndex = txtCell.getParagraphIndex(para);

			// Look forward
			for ( var i = sourceIndex - 1; i >= 0; i--)
			{
				var tPara = txtCell.paragraphs[i];
				if(tPara.multipleSelected)
					continue;
				if (tPara.level < newLevel)
					break;
				if ((tPara.level == newLevel) && (tPara.listType && para.listType || (!tPara.listType) && (!para.listType)) && !tPara.isHiddenList)
				{
					targetPara = tPara;
					break;
				}
			}

			// Look backward
			if (!targetPara)
			{
				var len = txtCell.paragraphs.length;
				for ( var i = sourceIndex + 1; i < len; i++)
				{
					var tPara = txtCell.paragraphs[i];
					if(tPara.multipleSelected)
						continue;
					if (tPara.level < newLevel)
						break;
					if ((tPara.level == newLevel) && (tPara.listType && para.listType || (!tPara.listType) && (!para.listType)) && !tPara.isHiddenList)
					{
						targetPara = tPara;
						break;
					}
				}
			}
			if(!targetPara)
				return null;
			
			var para = new pres.editor.model.Paragraph();
			para.copyStyle(targetPara);
			if(targetPara.direction != txtCell.paragraphs[sourceIndex].direction) {
				para.direction = txtCell.paragraphs[sourceIndex].direction;
				para.textAligment = txtCell.paragraphs[sourceIndex].textAligment;
			}
			return para;
		}
		;

		if (this.txtBoxInfo.isPlaceholder && this.txtBoxInfo.placeholderType == 'title')
			return;

		var paraList = this._getSelectedParagraphs();
		
		for ( var i = 0; i < paraList.length; i++)
		{
			paraList[i].multipleSelected = true;
		}

		// Find Target paragraph
		var targetParas = [];
		for ( var i = 0; i < paraList.length; i++)
		{
			var tPara = _findTargetParagraph(paraList[i], this);
			targetParas.push(tPara);
		}

		for ( var i = 0; i < paraList.length; i++)
		{
			paraList[i].multipleSelected = null;
			paraList[i].indentList(isIndent, targetParas[i], this.txtBoxInfo.isPlaceholder);
			targetParas[i] = null;
		}		
		targetParas = null;
		
		this.renderDirty = true;
	},

	setLineSpaceValue : function(spaceValue)
	{
		var paraList = this._getSelectedParagraphs();
		var adjustValue = parseFloat(pres.constants.LINESPACE_ADJUST_VALUE);		
		for ( var i = 0; i < paraList.length; i++)
		{
			//safari doesn't support lineHeight value like 1.2558e-7 translate to 0.01 accuracy
			var spaceValueFloat = Math.round(parseFloat(spaceValue)*100)/100;
			var spaceValueAdjust = spaceValueFloat*adjustValue;
			paraList[i].lineHeight = spaceValueAdjust;
			paraList[i].absLineHeight = spaceValueFloat;// for conversion
			paraList[i].renderDirty = true;
			paraList[i].setSpanLineSpaceValue(spaceValueAdjust);
		}
		this.renderDirty = true;
	},
	
	setHorizontalAlignment: function(align)
	{
		if (!(align == 'left') && !(align == 'center') && !(align == 'right'))
			return;

		var paraList = this._getSelectedParagraphs();

		for ( var i = 0; i < paraList.length; i++)
		{
			paraList[i].textAligment = align;
			paraList[i].renderDirty = true;
		}
		this.renderDirty = true;
	},

	setVerticalAlignment: function(align)
	{
		if (!(align == 'top') && !(align == 'middle') && !(align == 'bottom'))
			return;
		this.txtBoxInfo.verticalAligment = align;
		this.renderDirty = true;
	},

	setTextDirection: function(direction)
	{
		if (!(direction == 'ltr') && !(direction == 'rtl'))
			return;

		var paraList = this._getSelectedParagraphs();
		for ( var i = 0; i < paraList.length; i++)
		{
			paraList[i].direction = direction;
			paraList[i].textAligment = (direction == 'rtl') ? 'right' : 'left';
			if(paraList[i].marginLeft && direction == 'rtl') {
				paraList[i].marginRight = paraList[i].marginLeft;
				paraList[i].marginLeft = null;
			} else if(paraList[i].marginRight && direction == 'ltr') {
 				paraList[i].marginLeft = paraList[i].marginRight;
				paraList[i].marginRight = null;
			}
			paraList[i].renderDirty = true;
		}
		this.renderDirty = true;
	},

	setTextStyle: function(styleName, styleValue, bForceRender)
	{
		if (this.selection.bCollapsed)
		{
			var para = this.paragraphs[this.selection.start.lineIndex];
			para.renderDirty = bForceRender;
			if(para.strContent.length == 0)
			{
				para.setTextStyle(null, null, styleName, styleValue);
				this.renderDirty = bForceRender;
				return bForceRender;
			}
			else
			{
				var spanInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset);
				if(!this.tempCollapsedStyleSpan)
				{
					this.tempCollapsedStyleSpan = new pres.editor.model.Span();
					this.tempCollapsedStyleSpan.copyStyle(spanInfo.spanNode);
				}
				this.tempCollapsedStyleSpan.setStyle(styleName, styleValue);
				return false;
			}
		}
		else
		{
			this.tempCollapsedStyleSpan = null;
			var cleanParaList = [];
			if (this.selection.start.lineIndex == this.selection.end.lineIndex)
			{
				var para = this.paragraphs[this.selection.start.lineIndex];
				para.setTextStyle(this.selection.start.lineTextOffset, this.selection.end.lineTextOffset, styleName, styleValue);
				cleanParaList.push(para);
			}
			else
			{
				var para = this.paragraphs[this.selection.start.lineIndex];
				para.setTextStyle(this.selection.start.lineTextOffset, null, styleName, styleValue);
				cleanParaList.push(para);
				para = this.paragraphs[this.selection.end.lineIndex];
				para.setTextStyle(null, this.selection.end.lineTextOffset, styleName, styleValue);
				cleanParaList.push(para);
				for ( var i = this.selection.start.lineIndex + 1; i <= (this.selection.end.lineIndex - 1); i++)
				{
					para = this.paragraphs[i];
					para.setTextStyle(null, null, styleName, styleValue);
					cleanParaList.push(para);
				}
			}
			
					
			this._removeInvalidSpan(cleanParaList);
			this.renderDirty = true;
			return true;
		}
	},
	
	insertChangeHyperLink : function(strHyperlink,insertStr)
	{
		if(strHyperlink && strHyperlink.length == 0)
			strHyperlink = null;
		var xlinkPrefix = "";
		if(strHyperlink && strHyperlink.indexOf(EditorUtil.STR_XLINK) == 0)
		{
			strHyperlink = strHyperlink.replace( EditorUtil.STR_XLINK,"");
			if (strHyperlink == "previousslide" 
				|| strHyperlink == "nextslide" 
					|| strHyperlink == "firstslide" 
						|| strHyperlink == "lastslide")
			{
				xlinkPrefix = "ppaction://hlinkshowjump?jump=";
			}
			else
				xlinkPrefix = "slideaction://?";
		}
		//Behavior define :
		//If cursor is collapsed
		//	When cursor at a hyperlink node, we change its hyperlink
		//			When strHyperlink = null, we disable the hyperlink
		//  When cursor at no hyperlink node, we insert a hyperlink
		if(this.selection.bCollapsed)
		{
			var para = this.paragraphs[this.selection.start.lineIndex];
			if (!para)
				return false;
			var startSpanInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset);
			if (!startSpanInfo)
				return false;
			
			var focusSpan = startSpanInfo.spanNode;
			
			//Has hyperlink
			if(focusSpan.hyperLinkId)
			{
				if(strHyperlink)
				{  //Change hyperlink node
					var domHyperNode = this._hyperlinkStoreMap[focusSpan.hyperLinkId];
					if(xlinkPrefix == "")
					{
						EditorUtil.removeAttribute(domHyperNode,"xlink_href");
						EditorUtil.setAttribute(domHyperNode,"href",strHyperlink);
					}
					else
					{
						EditorUtil.removeAttribute(domHyperNode,"href");
						EditorUtil.setAttribute(domHyperNode,"xlink_href",xlinkPrefix + strHyperlink);
					}

					para.renderDirty = true;
				}
				else
				{ //Remove hyperlink
					var hyperLinkId = focusSpan.hyperLinkId;
					for(var i=0;i<para.spanList.length;i++)
					{
						if(para.spanList[i].hyperLinkId == hyperLinkId)
						{
							para.spanList[i].hyperLinkId = null;
							para.renderDirty = true;
						}
					}
				}
			}
			//Insert hyperlink
			else
			{
				if(strHyperlink)
				{
					var str = "";
					if(insertStr && insertStr.length )
					{ //Has insert string,use it as inserted text
						str = insertStr;
					}
					else
					{
						//not has visible str, we need extract from hyperlink
						str = strHyperlink;
						var mailInfo = EditorUtil.extractEmailLinkInfo(str);
						if(mailInfo)
						{
							str = mailInfo.address;
						}
					}
					
					
					this.insertString(str,null,{hyperlink:strHyperlink,xlinkPrefix:xlinkPrefix});
				}
				else
					return false;
			}
		}
		else //range selection
		{
			var hyperlinkId = this._appendHyperLinkToMap({hyperlink:strHyperlink,xlinkPrefix:xlinkPrefix});
			this.setTextStyle("hyperlinkid", hyperlinkId);
		}
		
		this.mergeHyperLink();
		
		this.renderDirty = true;
		return true;
	},
	
	//Merge same hyperlink
	mergeHyperLink : function()
	{
		var startLine = this.selection.start.lineIndex;
		var endLine =  this.selection.end.lineIndex;
		if(!endLine)
			endLine = startLine;

		for(var i=startLine;i<=endLine;i++)
		{
			var para = this.paragraphs[i];
			para.mergeHyperLink(this._hyperlinkStoreMap);
		}
	},

	// Spell Check =================================================
	doSpellCheck: function()
	{
		for ( var i = 0; i < this.paragraphs.length; i++)
		{
			this.paragraphs[i].doSpellCheck();
		}
	},
	
	stopSpellCheck : function()
	{
		for ( var i = 0; i < this.paragraphs.length; i++)
		{
			this.paragraphs[i].stopSpellCheck();
		}
	},

	isSpellCheckComplete: function()
	{
		var re = true;
		for ( var i = 0; i < this.paragraphs.length; i++)
		{
			var t = this.paragraphs[i].isSpellCheckComplete();
			if (!t)
			{
				re = false;
				break;
			}
		}

		if (re)
			this.renderDirty = true;

		return re;
	},
	
	//get current cursor focus span model
	//if bSupportRange = true, will return {start,end} two nodea if they not same
	getCurEditingSpanModel : function(bSupportRange)
	{
		if(bSupportRange && !this.selection.bCollapsed)
		{
			var startLineIndex = this.selection.start.lineIndex;
			var startOffset = this.selection.start.lineTextOffset;
			var endLineIndex = this.selection.end.lineIndex;
			var endOffset = this.selection.end.lineTextOffset;
			
			var startPara = this.paragraphs[startLineIndex];
			if (!startPara)
				return null;
			var endPara = this.paragraphs[endLineIndex];
			if (!endPara)
				return null;
			var startSpanInfo = startPara.getSpanByLineTextOffset(startOffset,true);
			if (!startSpanInfo)
				return null;
			var endSpanInfo = endPara.getSpanByLineTextOffset(endOffset);
			if (!endSpanInfo)
				return null;
			
			var spanList = [];
			//Same line
			if(startLineIndex == endLineIndex)
			{
				for(var i = startSpanInfo.index;i<=endSpanInfo.index;i++)
				{
					var span = startPara.spanList[i];
					if(span.length && !span.bSoftBreak)
						spanList.push(span);
				}
			}
			else //different line
			{
				//start
				for(var i = startSpanInfo.index;i<startPara.spanList.length;i++)
				{
					var span = startPara.spanList[i];
					if(span.length && !span.bSoftBreak)
						spanList.push(span);
				}
				//middle
				for(var i = startLineIndex+1;
					i<endLineIndex;
					i++)
				{
					var para = this.paragraphs[i];
					for(var j=0;j<para.spanList.length;j++)
					{
						var span = para.spanList[j];
						if(span.length && !span.bSoftBreak)
							spanList.push(span);
					}
				}
				//end
				for(var i = 0;i<=endSpanInfo.index;i++)
				{
					var span = endPara.spanList[i];
					if(span.length && !span.bSoftBreak)
						spanList.push(span);
				}
			}

			var retval = {
					start:startSpanInfo.spanNode,
					end:endSpanInfo.spanNode,
					spanList:spanList
					};
			if(startSpanInfo.index == endSpanInfo.index)
			{
				retval.end = null;
			}
			return retval;
		}
		else
		{
			var para = this.paragraphs[this.selection.start.lineIndex];
			if (!para)
				return null;
			var startSpanInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset);
			if (!startSpanInfo)
				return null;

			var span  = startSpanInfo.spanNode;
			if(dojo.isSafari)
			{
				if(span.length == startSpanInfo.offset)
				{
					startSpanInfo = para.getSpanByLineTextOffset(this.selection.start.lineTextOffset+1);
					if (startSpanInfo)
					{
						span  = startSpanInfo.spanNode;
					}
				}
			}		
			
			return span;
		}
		return null;

	},
	
	// replace wrong word with suggestions , all: indicates all or just current selection word
	replaceWithSuggestion: function(sugg, all)
	{
		var re = null;
		if(all)
		{
			var span = this.getCurEditingSpanModel();
			if(!span)
				return re;
			var wrongWord = span.misspell;
			for ( var i = 0; i < this.paragraphs.length; i++)
			{
				var t = this.paragraphs[i].replaceWithSuggestion(sugg,this.selection.start.lineTextOffset,wrongWord);
				if(!re)
					re = t.re;
			}
		}
		else
		{
			var para = this.paragraphs[this.selection.start.lineIndex];
			if (!para)
				return null;
			re = para.replaceWithSuggestion(sugg,this.selection.start.lineTextOffset);
			if(re.re)
			{
				this.selection.start.lineTextOffset = re.txtOffset;
				this.selection.bCollapsed = true;
				this.selection.end.lineIndex = null;
				this.selection.end.lineTextOffset = null;
			}
		}
		this.renderDirty = re;
		return re;
	},
	
	getCurHyperLink : function(bOnlyCheckCollapsed)
	{
		var retval = this.getCurEditingSpanModel(true);
		if(!retval)
			return null;
		var hyperlinkDomID = null;
		
		if(bOnlyCheckCollapsed)
		{
			hyperlinkDomID = retval.hyperLinkId;
		}
		else
		{
			var lastHashId = null;
			if(retval.spanList)
				for(var i=0;i<retval.spanList.length;i++)
				{
					var span = retval.spanList[i];
					var hashID = null;
					if(span.hyperLinkId)
					{						
						var mapNode = this._hyperlinkStoreMap[span.hyperLinkId];
						if(mapNode)
						{
							var url = EditorUtil.getAttribute(mapNode,"href");
							if(!url)
								url = EditorUtil.getAttribute(mapNode,"xlink_href");
							if(!url)
								url="";
							url = url.toLowerCase();
							hashID = EditorUtil.getStrHashCode(url);
						}
					}
					
					if(!hyperlinkDomID && hashID)
					{
						hyperlinkDomID = span.hyperLinkId;
					}
					
					if(lastHashId && lastHashId!=hashID)
						return null;
					
					lastHashId = hashID;
				}
			else
				hyperlinkDomID = retval.hyperLinkId;
		}
		
		if(!hyperlinkDomID)
			return null;
		
		var domHyperNode = this._hyperlinkStoreMap[hyperlinkDomID];
		var strURL = EditorUtil.getAttribute(domHyperNode,"href");
		if(strURL && strURL.length)
			return strURL;
		strURL = EditorUtil.STR_XLINK + EditorUtil.getAttribute(domHyperNode,"xlink_href");
			return strURL;
	}

});
