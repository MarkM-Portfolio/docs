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

dojo.provide("pres.editor.BoxEditor");
dojo.require("pres.editor.SelectionRange");
dojo.require("pres.editor.EditorUtil");
dojo.require("pres.editor.model.Content");

dojo.declare("pres.editor.BoxEditor", null, {
		
	NOT_HANDLED : 0,
	HANDLED_CONTENT_CHANGED : 1,
	HANDLED_CONTENT_NO_CHANGE : 2,
	
	mSelection:null,//Selection object
	mContentModel:new pres.editor.model.Content(),//Store content model
	boxOwner:null,//parent object owner

	constructor: function()
	{
		this.mSelection = new pres.editor.SelectionRange(document);
		this.mContentModel.renderInfo.enableIndicator = true;
	},
	
	getRange: function()
	{
		return this.mSelection.getRange();
	},
	
	getSelectedTableCells: function()
	{
		var sel = this.mContentModel.getSelection();
		if(sel && sel.cells)
			return sel.cells;
		return null;
	},
	
	getSelectInfo : function()
	{
		var selInfo = null;
		var selCells = this.mContentModel.getSelection();
		if(selCells && selCells.cells && (selCells.cells.length>1))
		{
			selInfo = {cellIds : null};
			selInfo.cellIds = [];
			for(var i=0;i<selCells.cells.length;i++)
			{
				selInfo.cellIds.push(selCells.cells[i].id);
			}
		}
		else
		{
			selInfo = {txtId : null, txtSelInfo : null};
			var focusTxtCell = this.mContentModel.getFocusTxtCell();
			if(focusTxtCell)
			{
				selInfo.txtId = focusTxtCell.domID;
				var txtSelInfo = focusTxtCell.getViewSelectionInfo();
				if(txtSelInfo)
				{
					selInfo.txtSelInfo = {
							bCollapsed: txtSelInfo.bCollapsed,
							start_lineIndex: txtSelInfo.startSelection.lineIndex,
							start_textOffset: txtSelInfo.startSelection.textOffset,
							start_lineTextOffset: txtSelInfo.startSelection.lineTextOffset,
							end_lineIndex: txtSelInfo.endSelection?txtSelInfo.endSelection.lineIndex:null,
							end_textOffset: txtSelInfo.endSelection?txtSelInfo.endSelection.textOffset:null,
							end_lineTextOffset: txtSelInfo.endSelection?txtSelInfo.endSelection.lineTextOffset:null
					} ;
				}
				
			}
		}
		return selInfo;
	},
	
	restoreSelectInfo : function(_selInfo)
	{
		if(!_selInfo)
			return;
		var selInfo = null;
		var tableElement = this.boxOwner.element;
		var table = tableElement.table;
		if(table && _selInfo.cellIds)
		{
			var cells = [];
			for(var i=0;i<_selInfo.cellIds.length;i++)
			{
				if (_selInfo.cellIds[i])
				{
					var c = table.getCellById(_selInfo.cellIds[i]);
					if (c)
						cells.push(c);
				}
			}
			selInfo = {cells : cells,
					bCellUnit : true};
		}
		else if(_selInfo.txtId)
		{
			selInfo = {bCollapsed : _selInfo.txtSelInfo.bCollapsed,
					startSelection : {
						lineIndex : _selInfo.txtSelInfo.start_lineIndex,
						textOffset : _selInfo.txtSelInfo.start_textOffset,
						lineTextOffset : _selInfo.txtSelInfo.start_lineTextOffset
					},
					endSelection : _selInfo.txtSelInfo.bCollapsed?null:{
						lineIndex : _selInfo.txtSelInfo.end_lineIndex,
						textOffset : _selInfo.txtSelInfo.end_textOffset,
						lineTextOffset : _selInfo.txtSelInfo.end_lineTextOffset
						}
					};
			if(table)
			{
				selInfo.cells = [table.getCellById(_selInfo.txtId)];
			}
		}
		
		if(!selInfo)
			return;
		this.mContentModel.updateSelection(selInfo);
	},

	fixInvaildWhiteSpace:function(rootNode)
	{
		var spanList = dojo.query("span",rootNode);
		for ( var i = 0; i < spanList.length; i++)
		{
			var span = spanList[i];
			var innerHtml = span.innerHTML;
			if (innerHtml == '\x20\u200B')//" &#8203"
			{
				span.innerHTML = '\u00a0';//&#nbsp;
			}
			else 
			{
				//Try to remove 8203, and 65279
				var no8203Str = innerHtml.replace('\u200B','').replace('\uFEFF','');
				if(no8203Str.length > 0 && innerHtml != no8203Str) 
					span.innerHTML = no8203Str;
			}
		}
	},
	
	clearInvalidTextNode:function(rootNode)
	{
		var deleteList = [];
		for ( var i = 0; i < rootNode.childNodes.length; i++)
		{
			var child = rootNode.childNodes[i];
			if(EditorUtil.is(child,"#text") && !EditorUtil.is(child.parentNode,'span'))
			{
				deleteList.push(child);
			}
		}
		
		for ( var i = 0; i < deleteList.length; i++)
		{
			dojo.destroy(deleteList[i]);
		}
		
		for ( var i = 0; i < rootNode.childNodes.length; i++)
		{
			var child = rootNode.childNodes[i];
			this.clearInvalidTextNode(child);
		}

	},
	
	processEnterEmptyPlaceHolder : function(rootNode)
	{
		var queryString = "." + pres.constants.CONTENT_BOX_TITLE_CLASS 
		+ ",." + pres.constants.CONTENT_BOX_SUBTITLE_CLASS 
		+ ",." + pres.constants.CONTENT_BOX_OUTLINE_CLASS 
		+ ",." + pres.constants.CONTENT_BOX_GRAPHIC_CLASS
		+ ",." + pres.constants.CONTENT_BOX_NOTES_CLASS;
		var defaultTextLines = dojo.query(queryString, rootNode);
		if(defaultTextLines.length>0)
		{
			var defaultLine = defaultTextLines[0];
			var childs = defaultLine.childNodes;
			var defaultSpan = dojo.query('span', defaultLine)[0];
			
			var needDestroySpan = [];
			for ( var i = 0; i < childs.length; i++)
			{
				if(!(childs[i] === defaultSpan))
				{
					needDestroySpan.push(childs[i]);
				}
			}
			
			for ( var i = 0; i < needDestroySpan.length; i++)
			{
				var node = needDestroySpan[i];
				needDestroySpan[i] = null;
				dojo.destroy(node);
			}
			
			
			defaultSpan.innerHTML = '\u200B';
			
			var dom_br = document.createElement('br');
			dojo.addClass(dom_br, 'hideInIE');
			defaultLine.appendChild(dom_br);

			if (dojo.hasClass(defaultLine, pres.constants.CONTENT_BOX_TITLE_CLASS))
			{
				dojo.removeClass(defaultLine,pres.constants.CONTENT_BOX_TITLE_CLASS);
			}
			else if (dojo.hasClass(defaultLine, pres.constants.CONTENT_BOX_SUBTITLE_CLASS))
			{
				dojo.removeClass(defaultLine, pres.constants.CONTENT_BOX_SUBTITLE_CLASS);
			}
			else if (dojo.hasClass(defaultLine, pres.constants.CONTENT_BOX_OUTLINE_CLASS))
			{
				dojo.removeClass(defaultLine, pres.constants.CONTENT_BOX_OUTLINE_CLASS);
			}
			if (dojo.hasClass(defaultLine, pres.constants.CONTENT_BOX_GRAPHIC_CLASS))
			{
				dojo.removeClass(defaultLine, pres.constants.CONTENT_BOX_GRAPHIC_CLASS);
			}
			if (dojo.hasClass(defaultLine, pres.constants.CONTENT_BOX_NOTES_CLASS))
			{
				dojo.removeClass(defaultLine, pres.constants.CONTENT_BOX_NOTES_CLASS);
			}
			
			dojo.removeClass(defaultLine, "defaultContentText");
			
			if(EditorUtil.is(defaultLine,'li'))
				defaultLine = defaultLine.parentNode;
			var textBoxDiv = defaultLine.parentNode.parentNode.parentNode;
			dojo.removeClass(textBoxDiv, "layoutClassSS");
		}
	},
	
	moveCursorToEditStart : function()
	{
		this.mContentModel.moveCursorToEditStart();
	},
	
	_dumpPendingInput : function()
	{
		var handled = false;
		var _pendingInput = null;
		var userId = null;
		if (pe.authenticatedUser)
			userId = pe.authenticatedUser.getId();
		
		if(this._IMEWorking)
		{
			if(this.compositionUpdateStr)
			{
				_pendingInput = this.compositionUpdateStr;
			}
			this.compositionUpdateStr = null;
			this._IMEWorking = false;
		}
		
		if(!_pendingInput)
		{
			_pendingInput = this.pendingInput;
			this.pendingInput = null;
		}
		
		if(_pendingInput)
		{
			clearInterval(pe.scene.editor._IMEPendingInputTimer);
			this.mContentModel.insertString(_pendingInput,userId);
			handled = true;
		}
		
		return handled;
	},
	
	processExitEmptyPlaceHolder : function(rootNode)
	{
		var handled = this._dumpPendingInput();

		clearTimeout(this._spellCheck);
		this._spellCheck = null;
		
		if(this.mContentModel.isEmptyPlaceHolder())
		{
			this.mContentModel.restoreDefaultPlaceHolder();
			var textBoxDiv = rootNode.firstElementChild;
			dojo.addClass(textBoxDiv, "layoutClassSS");
			return true;
		}
		else
		{
			
			// if a node has background color do not display default text
			dojo.query(".defaultContentText", rootNode).forEach(function(node, index, arr)
			{
				handled = true;
				dojo.removeClass(node, "defaultContentText");
			});
			return handled;
		}
	},
	
	//gather style from selected nodes
	_gatherSelectionStyles : function(onFormatpainter)
	{
		var isBold = function(v){
			v = (v + "").toLowerCase(); 
			if(v == "bold" || v== "bolder" || v == "700" || v=="800" || v == "900")
				return true;
			//else if(v == "normal" || v == "400")
				return false;
		};
		
		var isItalic = function(v){
			v = (v + "").toLowerCase(); 
			if(v == "italic")
				return true;
			else
				return false;
		};
		
		var _cleanQuotes = function(stringVal){
			if(stringVal!=null){ //clean the pair of quotes in the beginning and end
				if((stringVal.indexOf("'")==0 && stringVal.indexOf("'", stringVal.length - 1) != -1)) {
					stringVal = stringVal.replace(/^'/g, "").replace(/'$/g, "").replace(/','/g,",");
					
				}else if(stringVal.indexOf('"')==0 && stringVal.indexOf('"', stringVal.length - 1) != -1){
					stringVal = stringVal.replace(/^"/g, "").replace(/"$/g, "").replace(/','/g,",");
				}
			}
			return stringVal;
			
		};
		
		var _toProperCase = function(str){
			
			var lowerName = str.toLowerCase();
			//Special Case
			switch(lowerName)
			{
				case "comic sans ms":return "Comic Sans MS";
				case "trebuchet ms": return "Trebuchet MS";
			}
			
			str = str.replace(/\w\S*/g, function(txt){
				return txt.substring(0,1).toUpperCase() + txt.substring(1).toLowerCase();
			});
			return str;
		};
		
		var getFontFamily = function(cpuStyleValue)
		{
			if(cpuStyleValue){
				cpuStyleValue = _cleanQuotes(cpuStyleValue);
				if (cpuStyleValue.indexOf(',') > 0){
					cpuStyleValue = cpuStyleValue.substring(0, cpuStyleValue.indexOf(','));
					// substring will have added an additional quote to the end of the font name (if it
					// was a quoted string to begin with).  Remove the extra quote.
					cpuStyleValue = cpuStyleValue.replace(/"/g, ""); //#14257 and 14320, there is extra quote at the front of the font name, need to clean any extra quote
				}
				
				// Safari and Chrome return both double and single quotes for the
				// font family.  Clean up the single quotes.
				if (dojo.isWebKit && cpuStyleValue.indexOf("'") == 0) {
					cpuStyleValue = cpuStyleValue.replace(/'/g, "");
				}
				
				cpuStyleValue = _toProperCase(cpuStyleValue);
				return cpuStyleValue;
			}
		};
		
		//We only get visible selected nodes
		var cells = this.getSelectedTableCells();
		var selectedNodes = this.mSelection.getSelectedNodes(true,cells);
		
		
		var tBold = ""; //true/false/null
		var tItalic = "";//true/false/null
		var tUnderLinde = ""; //true/false/null
		var tFontFamily = ""; //[value]/null
		var tFontSize = ""; //[value]/null
		var tFontColor = "";//[value]/null
		var tList = ""; //"bullet"/"numbering"/null
		var tListClass = [];//[value]/null, only work when "tList" is not null
		var tIndent = ""; //true/false
		var tOutdent = ""; //true/false
		var tnumbertype = "";
		var tlevel = ""; // [1-9]
		var tabs_indent = "";
		var tabs_marginLeft = "";
		var tTextAligment= "";
		var tHorizontalAlign = "";//left/center/right/null
		var tTextDirection = "";//ltr/rtl/null
		var tVerticalAlign = "";//top/middle/bottom/null
		var tBkgColor = "";//[value]/null,
		var tStrikeThrough = "";//true/false/null
		var tSuperSubScript = "";//super/sub/null
		var tLineHeight = "";
		var mutilPara = false;
		var mutilBox = false;
		if(selectedNodes)
		{
			var spans = selectedNodes.spans;
			for(var i=0;i<spans.length;i++)
			{
				var computedStyle = dojo.getComputedStyle(spans[i]);
				if(tBold!=null)
				{
					var newValue = isBold(computedStyle.fontWeight);
					if(tBold === "")
						tBold = newValue;
					else if(tBold != newValue)
						tBold = null;
				}
				 if(tItalic!=null)
				{
					var newValue = isItalic(computedStyle.fontStyle);
					if(tItalic === "")
						tItalic = newValue;
					else if(tItalic != newValue)
						tItalic = null;
				}
				 if(tUnderLinde!=null)
				{
					var newValue = computedStyle.textDecoration.indexOf('underline')>=0?true:false;
					if(tUnderLinde === "")
						tUnderLinde = newValue;
					else if(tUnderLinde != newValue)
						tUnderLinde = null;
				}
				if(tStrikeThrough!=null)
				{
					var newValue = computedStyle.textDecoration.indexOf('line-through')>=0?true:false;
					if(tStrikeThrough === "")
						tStrikeThrough = newValue;
					else if(tStrikeThrough != newValue)
						tStrikeThrough = null;
				}
				var selfSuperSubScript = null;
				if(tSuperSubScript!=null)
				{
					var newValue = computedStyle.verticalAlign;
					selfSuperSubScript = newValue.toLowerCase();
					if(tSuperSubScript === "")
						tSuperSubScript = newValue;
					else if(tSuperSubScript != newValue)
						tSuperSubScript = null;
				}				 
				if(tFontFamily!=null)
				{
					var newValue = getFontFamily(computedStyle.fontFamily);
					if(tFontFamily === "")
						tFontFamily = newValue;
					else if(tFontFamily != newValue)
						tFontFamily = null;
				}
				 if(tFontSize!=null)
				{
					var newValue = EditorUtil.getAbsoluteValue(spans[i], EditorUtil.ABS_STYLES.FONTSIZE);
					if(newValue){
						// round font size
						if(newValue > 10.25 && newValue < 10.75)
						{
							newValue = 10.5;
						}
						else
							newValue = dojo.number.round(newValue * 1, 0);
						var vSpanCustomValue = EditorUtil.getCustomStyle(spans[i], EditorUtil.ABS_STYLES.FONTSIZE);
						if(vSpanCustomValue 
								&& (selfSuperSubScript == "super" || selfSuperSubScript == "sub"))
						{							
							newValue = dojo.number.round(vSpanCustomValue/0.58);
						}
					}
					if(tFontSize === "")
						tFontSize = newValue;
					else if(tFontSize != newValue)
						tFontSize = null;
					
				}
				if(tHorizontalAlign!=null)
				{
					var newValue = computedStyle.textAlign;
					(newValue == "inherit") && (newValue = "left");
					if(tHorizontalAlign === "")
						tHorizontalAlign = newValue;
					else if(tHorizontalAlign != newValue)
						tHorizontalAlign = null;
				}
				if(tTextDirection!=null)
				{
					var newValue = computedStyle.direction;
					if(tTextDirection === "")
						tTextDirection = newValue;
					else if(tTextDirection != newValue)
						tTextDirection = null;
				}
				if(tFontColor!=null)
				{
					var newValue = computedStyle.color;
					if(tFontColor === "")
						tFontColor = newValue;
					else if(tFontColor != newValue)
						tFontColor = null;
				}
				if(tTextAligment!=null) {
					var newValue = computedStyle.textAlign;
					if(tTextAligment === "")
						tTextAligment = newValue;
					else if(tTextAligment != newValue)
						tTextAligment = null;
				}
				if (onFormatpainter) {
					break;
				}
			}		
			var paragraphes = selectedNodes.paragraphes;
			for(var i=0;i<paragraphes.length;i++)
			{
				var lineItem = EditorUtil.getLineItem(paragraphes[i]);
				if(tList!=null)
				{
					var newValue = null;
					var parent = lineItem.parentNode;
					if(EditorUtil.is(parent,'ol')) {
						newValue = 'numbering';
						tnumbertype = EditorUtil.getAttribute(parent,'numbertype');
					} else if(EditorUtil.is(parent,'ul'))
						newValue = 'bullet';
					
					if(tList === "")
						tList = newValue;
					else if(tList != newValue)
						{
							tList = null;
							tListClass = null;
						}
					
					if(tList!=null)
					{
						var regx = /^lst-/g;
						var regxLst_MR = /^lst-MR-/g;
						//get "lst-" class
						var cls = EditorUtil.getAttribute(lineItem,'class');
						
						if (cls == undefined || cls == null){
							cls = " ";
						}
						var listClasses = cls.split(' ');
						for ( var j = 0 ; j < listClasses.length; j++)
						{
							if ( !listClasses[j].match(regxLst_MR) )
							{
								if (listClasses[j].match(regx))
								{
									tListClass.push(listClasses[j]);
								}
							}
						}
					}
						
				}
				var level = parseInt(EditorUtil.getAttribute(lineItem, 'level'), 10);
				if(isNaN(level))
					level = 1;
				
				if(tIndent!=null)
				{
					var newValue = (level<9)?true:false;
					if(tIndent === "")
						tIndent = newValue;
					if(newValue)
						tIndent = newValue;
				}
				if(tOutdent!=null)
				{
					var newValue = (level>=2)?true:false;
					if(tOutdent === "")
						tOutdent = newValue;
					if(newValue)
						tOutdent = newValue;
				}
				tlevel = level;
				tabs_marginLeft = EditorUtil.getCustomStyle(lineItem, EditorUtil.ABS_STYLES.MARGINLEFT);
				tabs_indent = EditorUtil.getCustomStyle(lineItem, EditorUtil.ABS_STYLES.TEXTINDENT);
				if (onFormatpainter && paragraphes.length>1) {
					mutilPara = true;
					break;
				}
			}

			for (var i=0;i<paragraphes.length;i++)
			{
				var lineItem = EditorUtil.getLineItem(paragraphes[i]);	
				if (tLineHeight!= null)
				{	
					var absLineValue = "";
					var newValue = "";
					var tempValue = "";
					tempValue = lineItem.style.lineHeight;
					var adjustValue = pres.constants.LINESPACE_ADJUST_VALUE;
					if (tempValue == "" || tempValue == null)
					{
						var lineClassAttr = EditorUtil.getAttribute(lineItem, 'class');
						var regIfUploadSlide = /.*?MP_.*?/;
						if (regIfUploadSlide.test(lineClassAttr))
						{
							var classNameToRead = "";
							var tempStrs = lineClassAttr.split(" ");
							for (var j=0;j<tempStrs.length;j++)
							{
								if (regIfUploadSlide.test(tempStrs[j]))
									classNameToRead = tempStrs[j];
							}
							absLineValue = EditorUtil.getAbsModuleValue(classNameToRead, "abs-line-height");
							if (!absLineValue || isNaN(absLineValue) || absLineValue=="")
							{
								tempValue = EditorUtil.getAbsModuleValue(classNameToRead, "line-height");
								if (!tempValue || isNaN(tempValue) || tempValue == "")
								{
									if (EditorUtil.is(lineItem, 'li'))
									{
										tempValue = pres.constants.LINESPACE_DEFAULT_BULLET_TEXT;
										newValue = Math.round(parseFloat(tempValue)/parseFloat(adjustValue)*100)/100;
									}
									else
									{
										tempValue = pres.constants.LINESPACE_DEFAULT_NORMAL_TEXT;
										newValue = Math.round(parseFloat(tempValue)/parseFloat(adjustValue)*100)/100;
									}
								}
								else
								{
									newValue = Math.round(parseFloat(tempValue)/parseFloat(adjustValue)*100)/100;
								}
							}
							else
							{
								newValue = parseFloat(absLineValue);
							}
						}else if (EditorUtil.is(lineItem, 'li'))
						{
							tempValue = pres.constants.LINESPACE_DEFAULT_BULLET_TEXT;
							newValue = Math.round(parseFloat(tempValue)/parseFloat(adjustValue)*100)/100;
						}
						else
						{
							tempValue = pres.constants.LINESPACE_DEFAULT_NORMAL_TEXT;
							newValue = Math.round(parseFloat(tempValue)/parseFloat(adjustValue)*100)/100;
						}
					}
					else
					{
						newValue = Math.round(parseFloat(tempValue)/parseFloat(adjustValue)*100)/100;
					}
					if (tLineHeight === "")
						tLineHeight = newValue.toString();
					else if (tLineHeight != newValue)
						tLineHeight = null;	
				}
				if (onFormatpainter && paragraphes.length>1) {
					break;
				}
			}

			var boxes = selectedNodes.textboxes;
			var isTable = this.boxOwner.element.family == "table";
			for(var i=0;i<boxes.length;i++)
			{
				var box = boxes[i];
				var cellSelectedClasses = null;
				
				if (isTable)
				{
					if (dojo.hasClass(box, "cellselected"))
						cellSelectedClasses = EditorUtil.removeTabelCellSelectionClass(box);
				}
				
				var computedStyle = dojo.getComputedStyle(box);
				if(tVerticalAlign!=null)
				{
					var newValue = computedStyle.verticalAlign;
					(newValue == "baseline") && (newValue = "top");
					if(tVerticalAlign === "")
						tVerticalAlign = newValue;
					else if(tVerticalAlign != newValue)
						tVerticalAlign = null;
				}
				if(tBkgColor!=null)
				{
					var newValue = computedStyle.backgroundColor;
					if(tBkgColor === "")
						tBkgColor = newValue;
					else if(tBkgColor != newValue)
						tBkgColor = null;
				}
				
				if (cellSelectedClasses)
					// restore it back.
					for(var c=0;c<cellSelectedClasses.length;c++)
						dojo.addClass(box, cellSelectedClasses[c]);
				if (onFormatpainter && boxes.length>1) {
					mutilBox = true;
					break;
				}
			}
		}
		
		//Specail case handle
		var focusTxtCell = this.mContentModel.getFocusTxtCell();
		if(focusTxtCell 
				&& focusTxtCell.txtBoxInfo.isPlaceholder 
				&& focusTxtCell.txtBoxInfo.placeholderType == 'title')
		{
			tIndent = false;
			tOutdent = false;
		}
		
		//null means the value are not same for all nodes
		return {
			bold : tBold, //true/false/null
			italic : tItalic,//true/false/null
			underline : tUnderLinde,//true/false/null
			fontFamily : tFontFamily,//value/null
			fontSize : tFontSize,//value/null
			fontColor : tFontColor,
			list : tList,//"bullet"/"numbering"/null
			listClass :tListClass,//[value]/null, only work when "tList" is not null
			horizontalAlign : tHorizontalAlign,
			textDirection : tTextDirection,
			verticalAlign : tVerticalAlign,
			strikeThrough : tStrikeThrough,//true/false/null
			superSubScript : tSuperSubScript,//super/sub/null
			level: tlevel, //[1-9]
			abs_marginLeft: tabs_marginLeft,
			abs_indent: tabs_indent,
			numbertype: tnumbertype,
			textAligment: tTextAligment,
			mutilPara: mutilPara,
			mutilBox: mutilBox,
			indent : tIndent,//true/false/null
			outdent : tOutdent,//true/false/null
			backgroundColor : tBkgColor,
			lineHeight : tLineHeight
		};
	},

	//////////////////////////
	buildModel:function(box,bNewCreated)
	{
		this.boxOwner = box;
		this.mSelection.boxOwner = box;
		this.mContentModel.build(box,bNewCreated);
	},
	
	renderTableSelection : function()
	{		
		var rootDom = this.boxOwner.getEditNode();
		
		//Clear cell selection if any
		EditorUtil.removeTabelCellSelectionClass(rootDom);
		
		var	cells = this.getSelectedTableCells();
		var renderCellSelBkg = false;
		if(cells)
		{
			if( cells.length>1)
			{	
				renderCellSelBkg = true;
			}
			else //cell == 1
			{
				var selInfo = this.mContentModel.getViewTxtSelectionInfo();
				if(!selInfo)
				{
					renderCellSelBkg = true;
				}
			}
		}
		
		if(renderCellSelBkg)
		{
			var rangeSpan = null;
			dojo.forEach(cells,function(cell){
				if (cell)
				{
					var id = cell.id;
					var dom = dojo.query('[id='+id+']',rootDom)[0];
					if(dom)
					{
						if(!rangeSpan)
							rangeSpan = dojo.query('span',dom)[0];
						EditorUtil.addTabelCellSelectionClass(dom);
					}
				}
			});
			if(rangeSpan)
			{
				var range = {startContainer:rangeSpan,startOffset:0,endContainer:rangeSpan,endOffset:0};
				this.mSelection.select(range);
			}
			else
			{
				this.mSelection.select(null);	
			}
			return true;
		}

		return false;
	},
	
	isBrowserSelWorks : function()
	{
		var range = this.getRange();
		if(range)
			return true;
		return false;
	},
	
	renderSelection : function()
	{
		if(this._IMEWorking)
			return;
		if(!this.renderTableSelection())
		{
			var selInfo = this.mContentModel.getViewTxtSelectionInfo();
			if(selInfo)
			{
				try
				{
					this.mSelection.restoreSelection(this.getRange(), selInfo);
				}
				catch(e)
				{
					//Sometimes we could not set the range during to focus lost or browser stop setting
					//try it later
					clearInterval(this._selectionRender);
					var countTimes = 100;
					this._selectionRender = setInterval(dojo.hitch(this, function()
					{
						var result = true;
						try
						{
							countTimes--;
							if (document.activeElement)
								document.activeElement.blur();
							this.mSelection.restoreSelection(this.getRange(), selInfo);;
						}
						catch(e)
						{
							result = false;
						}
						
						if(result || countTimes<=0)
						{
							clearInterval(this._selectionRender);
						}
					}), 50);
				}
			}
		}
	},
	
	clearSelection:function(bRemoveBrowserSel)
	{
		if(this._IMEWorking)
			return;
		
		this.selectionUpdaing = true;
		this.mContentModel.clearSelection();
		if(bRemoveBrowserSel)
			this.mSelection.select(null);
	},
	
	//if bForce = true, means it will refresh the root dom node completely
	//if targetModel = null, means will render all root dom node (depend on dirty flag)
	renderModel:function(targetModel,bForce)
	{
		if(this.delateRender)
		{
			this.delateRender = false;
			clearTimeout(this._timerRender);
			this._timerRender = setTimeout(dojo.hitch(this, function()
					{
				this.mContentModel.render(targetModel,bForce);
					}), 100);
			
			return;
		}
		this.mContentModel.render(targetModel,bForce);
	},
	
	updateView : function()
	{
		if(this.boxOwner.mouseUpEventTicket)
			return;
		if(this.delateUpdateView)
		{
			this.delateUpdateView = false;
			clearTimeout(this._timerUpdateView);
			this._timerUpdateView = setTimeout(dojo.hitch(this, function()
			{
				this.renderModel();
				this.renderSelection();
			}), 10);
			
			return;
		}
		this.renderModel();
		this.renderSelection();
	},
	
	//Note : this function could not work for table yet
	selectAll: function ()
	{	
		this.mContentModel.selectAll();
		this.renderSelection();
		dojo.publish("/content/selection/changed", []);
	},
	
	updateSelection : function(rr,tablecells)
	{
		if(this._IMEWorking)
			return;
		
		this.selectionUpdaing = false;
		var cells = this.mSelection.getSelectedTableCells();
		if(tablecells)
			cells = tablecells;
		var selInfo = null;
		if(cells && cells.length>1)
		{
			//multiple cell selection
			selInfo = {cells : cells,
					bCellUnit : true};
		}
		else 
		{
			var range = rr || this.getRange();
			if(range)
			{
				selInfo = this.mSelection.getSelectTxtInfo(range);
				if(cells&& cells.length == 1)
				{
					if(selInfo)
						selInfo.cells = cells;
					else
						selInfo = {cells : cells,
							bCellUnit : true};
				}
			}
		}		
		
		if(!selInfo)
			return false;
		this.mContentModel.updateSelection(selInfo);
		if(this._lastSelectionInfo)
		{
			if ((selInfo.cells && selInfo.cells.length == 1)
				&& (this._lastSelectionInfo.cells && this._lastSelectionInfo.cells.length == 1))
			{
				var preCell = this._lastSelectionInfo.cells[0];
				var curCell = selInfo.cells[0];
				if(preCell.id != curCell.id)
				{
					this.onCellSelChange(preCell,curCell);
				}
			}
		}
		this._lastSelectionInfo = selInfo;
		dojo.publish("/content/selection/changed", []);
		return true;
	},
	
	//cell selection change
	onCellSelChange : function(preCell,curCell)
	{
		pe.onCellSelChange = true;
		var tableElement = this.boxOwner.element;
		var table = tableElement.table;
		if(table)
		{
			var index = table.getAbsCellIndex(curCell.id);
			var domcell=dojo.byId(curCell.id);
			var text = null;
			if(domcell)
				text = domcell.textContent||"";
			text = text.replace(/\u200b/g, "").replace(/\u00a0/g, "").replace(" ", "");
			if(text.length==0)
				text = pe.presStrs.acc_blank;
			var readText = text + dojo.string.substitute(pe.presStrs.acc_inTable, [index.rowIndex+1,index.colIndex+1]);
			pe.scene.slideEditor && pe.scene.slideEditor.announce(readText);
		}
	},
	
	updateSelectionByNaviKey : function(keyCode,keyboardStatus)
	{
		return this.mContentModel.updateSelectionByNaviKey(keyCode,keyboardStatus);
	},
	
	updateSelectionByMouse : function(clickTimes,mouseEvent)
	{
		return this.mContentModel.updateSelectionByMouse(clickTimes,mouseEvent);
	},
	
	lockIMEEditingModel : function(bLock)
	{
		this._IMEWorking = bLock;
		var focusTxtCell = this.mContentModel.getFocusTxtCell();
		if(focusTxtCell)
			return focusTxtCell.domID;
		return null;
	},
		
	//Edit actions >>>>>>>>>>==========================
	//If success return true, otherwise return false
	//type is 'ol' or 'ul'
	toggleListStyle : function(targetListClass,type)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			//Otherwise run our own code
			this.mContentModel.toggleListStyle(targetListClass,(type=='ol'));
		}
		catch(e)
		{
			console.error(e);
			return false;
		}

		this.updateView();
		this._isModified = true;
		return true;
	},
	
	
	inputString:function(str,inputMethod, bForce)
	{
		if(!bForce && !this.isBrowserSelWorks())
			return false;
		this.pendingInput = null;

		var userId = null;
		if (pe.authenticatedUser)
			userId = pe.authenticatedUser.getId();
		try{
			this.lastInputMethod = inputMethod;
			this.mContentModel.insertString(str,userId);
		}
		catch(e)
		{
			console.error(e);
			return false;
		}

		this.updateView();
		this.doSpellCheck();
		this._isModified = true;
		return true;
	},
	
	//Handle enter for model
	HandleEnter:function(bSoftBreak)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.handleEnter(bSoftBreak);
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.updateView();
		this.doSpellCheck();
		this._isModified = true;
		return true;
	},
	
	//Handle delete for model
	HandleDelete:function(isBackspace)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.handleDetete(isBackspace);
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.updateView();
		this.doSpellCheck();
		this._isModified = true;
		return true;
	},
	
	handleTabKey : function(bShift)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.handleTabKey(bShift);
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.updateView();
		this.doSpellCheck();
		this._isModified = true;
		return true;
	},
	
	handleSpaceKey : function()
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.handleSpaceKey();
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.updateView();
		this.doSpellCheck();
		this._isModified = true;
		return true;
	},
	
	// isIndent = true : indent list
	// isIndent = false : outdent list
	indentList:function (isIndent)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.indentList(isIndent);
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.updateView();
		this._isModified = true;
		return true;
	},
	
	setParagraphDirection:function (direction)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.setTextDirection(direction);
		}
		catch(e){
			console.error(e);
			return false;
		}
		this.updateView();
		this._isModified = true;
		return true;
	},

	setParagraphAlignment:function (algin,bHorizontal)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			if(bHorizontal)
				this.mContentModel.setHorizontalAlignment(algin);
			else
				this.mContentModel.setVerticalAlignment(algin);
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.updateView();
		this._isModified = true;
		return true;
	},
	
	setLineSpacing:function(lineSpaceValue)
	{
		if(!this.isBrowserSelWorks())
			return false;
		try{
			this.mContentModel.setLineSpaceValue(lineSpaceValue);
		}
		catch(e)
		{
			console.log("exception when call Content model:"+e.message);
			return false;
		}
		this.updateView();
		this._isModified = true;
		return true;
	},
	
	//Set style for
	setTextStyle : function(styleName,styleValue)
	{
		if(styleName=="font_name" && styleValue=="Calibri"){
			styleValue = "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif";
		}
		if(!this.isBrowserSelWorks())
			return false;
		try{
			var re = this.mContentModel.setTextStyle(styleName,styleValue);
			if(re)
			{
				this.updateView();
				this._isModified = true;
				return true;
			}
		}
		catch(e)
		{
			console.error(e);
			return false;
		}
		this.renderSelection();
		this._isModified = true;
		return false;
	},
	//<<<==============================================
	
	doSpellCheck : function(forceAllCell)
	{
		//return;//close this function temporally
		if(this._spellCheck)
		{
			this.stopSpellCheck();
		}
		
		if(this._IMEWorking)
			return;
		
		var enableSpellCheck = pe.settings && pe.settings.getAutoSpellCheck();
		if(!enableSpellCheck)
		{
			return;
		}
		
		pres.spellCheckService.bReadyForCheck = true; 
		
		this._spellCheck = setTimeout(dojo.hitch(this, function()
		{
			this.mContentModel.doSpellCheck(forceAllCell);
			clearInterval(this._spellCheckRender);
			var tryTimes = 100;
			this._spellCheckRender = setInterval(dojo.hitch(this, function()
			{
				if(!this._IMEWorking 
					&& pres.spellCheckService.bReadyForCheck && !this.boxOwner.mouseUpEventTicket
					&&	this.mContentModel.isSpellCheckComplete(forceAllCell))
				{
					this.updateView();
					if (dojo.isFF)
						this.boxOwner.focus();
					clearInterval(this._spellCheckRender);
					pres.spellCheckService.bReadyForCheck = false;
				}
				tryTimes -- ;
				if(tryTimes<0)
					clearInterval(this._spellCheckRender);
			}), 50);
		}), 500);
	},
	
	stopSpellCheck : function()
	{
		clearTimeout(this._spellCheck);
		this._spellCheck = null;
		clearInterval(this._spellCheckRender);
		this._spellCheckRender = null;
		this.mContentModel.stopSpellCheck();
		pres.spellCheckService.bReadyForCheck = false;
	},
	
	pauseSpellCheck : function()
	{
		this._lastSpellCheckStatus = pres.spellCheckService.bReadyForCheck;
		this.stopSpellCheck();
	},
	
	resumeSpellCheck : function()
	{
		if(this._lastSpellCheckStatus)
			this.doSpellCheck();
	},
	
	//>>>>>>>>>>>===================
	//Get current hyper link string
	getCurHyperLink : function(bOnlyCheckCollapsed)
	{
		return this.mContentModel.getCurHyperLink(bOnlyCheckCollapsed);
	},
	
	insertHyperLink : function(strHyperlink,insertStr)
	{
		if(this.mContentModel.insertChangeHyperLink(strHyperlink,insertStr))
		{
			this.updateView();
			this._isModified = true;
			return true;
		}
		return false;
	},
	
	///>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	//IME input Control
	IME_StartInput : function()
	{
		this.paraIMEDom = null;
		var txtCell = this.mContentModel.getFocusTxtCell();
		if(!txtCell)
			return;
		var preIMEselInfo =  txtCell.getViewSelectionInfo();
		if(!preIMEselInfo 
				|| (!preIMEselInfo.bCollapsed 
						&& (preIMEselInfo.startSelection.lineIndex != preIMEselInfo.startSelection.lineIndex)
					)
			)
			return;
		var paraModelInputStart = txtCell.paragraphs[preIMEselInfo.startSelection.lineIndex];
		if(preIMEselInfo.endSelection && (preIMEselInfo.endSelection.lineIndex!=null))
			var paraModelInputEnd = txtCell.paragraphs[preIMEselInfo.startSelection.lineIndex];
		this.paraIMEDom = dojo.query("[id='" + paraModelInputStart.id + "']", preIMEselInfo.root)[0];
		if(!this.paraIMEDom)
			return;
		this.IMEstartTxtOffset = preIMEselInfo.startSelection.lineTextOffset;
		this.IMEendTxtOffset = preIMEselInfo.bCollapsed 
		? (paraModelInputStart.strContent.length - this.IMEstartTxtOffset)
		: (paraModelInputEnd.strContent.length - preIMEselInfo.endSelection.lineTextOffset);
		//Let browser input ...
	},
		 	
	IME_FinishInput : function(bKeepIMEDom)
	{
		if(!this.paraIMEDom)
			return null;
		//After finished input
		//Get the input line
		var txtCell = this.mContentModel.getFocusTxtCell();
		//Get the text from it.
		var allString = txtCell._extractParagraphText(this.paraIMEDom);
		if(!bKeepIMEDom)
			this.paraIMEDom = null;
		var endOffset = allString.length - this.IMEendTxtOffset;
		if(endOffset)
		//Get the browser input
		var inputString = allString.substring(this.IMEstartTxtOffset,endOffset);

		return inputString;
	}	
	
});