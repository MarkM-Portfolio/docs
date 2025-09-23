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

dojo.provide("pres.editor.SelectionRange");
dojo.require("pres.editor.EditorUtil");

EditorUtil.POSITION_AFTER_START = 1; // <element>^contents</element> "^text"
EditorUtil.POSITION_BEFORE_END = 2; // <element>contents^</element> "text^"
EditorUtil.POSITION_BEFORE_START = 3; // ^<element>contents</element> ^"text"
EditorUtil.POSITION_AFTER_END = 4; // <element>contents</element>^ "text"

pres.editor.range = function(document)
{
	this.startContainer = null;
	this.startOffset = null;
	this.endContainer = null;
	this.endOffset = null;
	this.collapsed = true;
	this.document = document;
	this._selection = null; // Internal use for range
};

dojo.declare("pres.editor.SelectionRange", null, {

	mDocument: null,
	boxOwner:null,
	
	constructor: function(document)
	{
		this.mDocument = document;
	},

	getRange: function(document)
	{
		if (!document)
			document = this.mDocument;
		var ranges = this._getRanges(document);
		return ranges[0];
	},	

	select: function(range)
	{
		var sel = this._getNativeSel(this.mDocument);
		sel.removeAllRanges();
		if(!range)
			return;
		var nativeRange = this.mDocument.createRange();
		nativeRange.setStart(range.startContainer, range.startOffset);
		nativeRange.setEnd(range.endContainer, range.endOffset);
		// Select the range.
		//try{
			// FIXME IE10 sometimes throws an error here.
			sel.addRange(nativeRange);
		//}
		//catch(e){console.info("add range error " + e);}
	},

	getSelectTxtInfo: function(range)
	{
		function _getLineNode(rangeContainer, rangeOffset)
		{
			var block = EditorUtil.getBlock(rangeContainer);
			if(EditorUtil.is(block, 'div'))
			{
				block = block.childNodes[rangeOffset-1];
			}
			return block;
		}
		
		function _getBaseInfo(range)
		{
			var startLineNode = _getLineNode (range.startContainer,range.startOffset);
			var endLineNode = _getLineNode(range.endContainer,range.endOffset);

			var startlineInfo = EditorUtil.getLineInfo(startLineNode);
			var endlineInfo = EditorUtil.getLineInfo(endLineNode);
			if (!startlineInfo || !endlineInfo)
				return null;
			var rootNode = startlineInfo.line.parentNode;

			return {
				startLineIndex: startlineInfo.index,
				endLineIndex: endlineInfo.index,
				rootNode: rootNode
			};
		}

		if(!range)
			return null;
		
		var sel = _getBaseInfo(range);
		if (!sel)
			return null;

		function _getTextCountBefore(targerNode, parentNode, totalCount)
		{

			function _impletment(tNode)
			{
				var localCount = 0;
				if (tNode === targerNode)
					return {
						found: true,
						count: localCount
					};
				if (EditorUtil.is(tNode, '#text'))
				{
					var textContent = EditorUtil.getText(tNode);
					// ignore 8203 length
					// if (!(textContent.length == 1 && textContent.charCodeAt(0) == 8203))
					localCount += textContent.length;
				}
				// <br class="text_line-break"> as one character, and take one length
				else if (EditorUtil.is(tNode, 'br') && dojo.hasClass(tNode, 'text_line-break'))
				{
					localCount++;
				}
				else if (tNode.firstChild)
				{
					var child = tNode.firstChild;
					while (child)
					{
						var tmp = _impletment(child);
						localCount += tmp.count;
						if (tmp.found)
						{
							return tmp;
						}
						child = child.nextSibling;
					}
				}

				return {
					found: false,
					count: localCount
				};
			}
			var bFind = false;
			var child = parentNode.firstChild;
			while (child)
			{
				if (child === targerNode)
				{
					bFind = true;
					break;
				}
				;
				var tmp = _impletment(child);
				totalCount += tmp.count;
				if (tmp.found)
				{
					bFind = true;
					break;
				}

				child = child.nextSibling;
			}
			return {
				found: bFind,
				count: totalCount
			};
		}

		// make the select in span
		function _TrimSelectionNode(selNode, offset, bStart)
		{
			var lineIndex = bStart ? sel.startLineIndex : sel.endLineIndex;
			var lineTextOffset = 0;// the offset in line, treat one line a whole string, no span
			var focusSpan = null;
			var spanTextOffset = 0;// the offset in focusSpan
			if (EditorUtil.is(selNode, 'span'))
			{
				focusSpan = selNode;
				if (offset > 0)
				{
					for (i = 0; i < offset; i++)
					{
						var textNode = selNode.childNodes[i];
						var textContent = EditorUtil.getText(textNode);
						spanTextOffset += textContent.length;
					}
				}
			}
			else if (EditorUtil.is(selNode, 'p', 'li', 'ul', 'ol'))
			{
				if (bStart && (offset == 0))
				{
					focusSpan = EditorUtil.getFirstVisibleSpanFromLine(selNode);
					lineTextOffset = 0;
					spanTextOffset = 0;
				}
				else
				{
					var bLineChanged = false;
					if (!bStart && (offset == 0))
					{
						lineIndex = lineIndex - 1;
						bLineChanged = true;
					}
					var line = sel.rootNode.childNodes[lineIndex];
					var lineItem = EditorUtil.getLineItem(line);
					if (bLineChanged)
					{
						focusSpan = lineItem.lastChild;
						offset = EditorUtil.getIndex(focusSpan);
					}
					else
						focusSpan = lineItem.childNodes[(offset >= lineItem.childNodes.length) ? lineItem.childNodes.length - 1 : offset];

					var cursorAtSpanStart = false;
					if (EditorUtil.is(focusSpan, 'br'))
					{
						if (focusSpan.previousSibling)
						{
							focusSpan = focusSpan.previousSibling;
						}
						else if (focusSpan.nextSibling)
						{
							focusSpan = focusSpan.nextSibling;
							cursorAtSpanStart = true;
						}
					}

					if (!EditorUtil.is(focusSpan, 'span'))
					{
						cursorAtSpanStart = false;
						// find last span node
						var spanList = dojo.query('span', focusSpan);
						if (spanList.length)
							focusSpan = spanList[spanList.length - 1];
						else
							focusSpan = null;
					}
					var textContent = EditorUtil.getText(focusSpan);
					spanTextOffset = cursorAtSpanStart ? 0 : textContent.length;
				}

			}
			else if (EditorUtil.is(selNode, 'br'))
			{
				if (offset == 0)
					focusSpan = selNode.previousSibling;
				else
					focusSpan = selNode.nextSibling || selNode.previousSibling;

				if (!EditorUtil.is(focusSpan, 'span'))
				{
					focusSpan = null;
					// find last span node
					var spanList = dojo.query('span', focusSpan);
					if (spanList.length)
					{
						var index = spanList.length - 1;
						while (index >= 0)
						{
							var span = spanList[index];
							if (!EditorUtil.isNodeTextEmpty(span))
							{
								focusSpan = span;
								break;
							}
							index--;
						}
					}
				}
				var textContent = EditorUtil.getText(focusSpan);
				spanTextOffset = textContent.length;
			}
			else if (EditorUtil.is(selNode, '#text'))
			{
				var focusSpan = selNode.parentNode;
				var preTextNode = selNode.previousSibling;
				spanTextOffset = Math.min(offset, EditorUtil.getText(focusSpan).length);
				while (preTextNode)
				{
					var textContent = EditorUtil.getText(preTextNode);
					spanTextOffset += textContent.length;
					preTextNode = preTextNode.previousSibling;
				}
			}
			else
			// selection must be high level node
			{
				var ancestor = range.getCommonAncestor(true, true);
				if (EditorUtil.is(selNode, 'div'))
				{
					if(bStart)
					{
						//Uncertain, keep this case until we found it
					}
					else
					{
						var line = selNode.childNodes[offset-1];
						ancestor = EditorUtil.getLineItem(line);
					}
				}
				
				// find last span node
				var spanList = dojo.query('span', ancestor);
				if (spanList.length)
				{
					var bFindFristSpan = false;
					if (bStart && (offset == 0))
						bFindFristSpan = true;
					var index = bFindFristSpan ? 0 : spanList.length - 1;
					while (bFindFristSpan ? index < spanList.length : index >= 0)
					{
						var span = spanList[index];
						if (!EditorUtil.isNodeTextEmpty(span))
						{
							focusSpan = span;
							break;
						}
						index += bFindFristSpan ? 1 : (-1);
					}
				}
				var textContent = EditorUtil.getText(focusSpan);
				spanTextOffset = textContent.length;
			}

			var parentLine = EditorUtil.getAscendant(focusSpan, 'p') || EditorUtil.getAscendant(focusSpan, 'li');
			if(EditorUtil.is(focusSpan.parentNode,'a'))
			{
				var beforeCount = 0;
				var re = _getTextCountBefore(focusSpan, focusSpan.parentNode, 0);
				beforeCount+= re.count;
				re = _getTextCountBefore(focusSpan.parentNode, parentLine, 0);
				lineTextOffset = re.count + beforeCount + spanTextOffset;
			}
			else
			{
				var re = _getTextCountBefore(focusSpan, parentLine, 0);
				lineTextOffset = re.count + spanTextOffset;
			}


			return {
				lineIndex: lineIndex,// which line
				textOffset: spanTextOffset,// This focus span just use for this "get" action, should not use for restore according it
				lineTextOffset: lineTextOffset,// which position in character in line
				focusSpan: focusSpan,// This focus span just use for this "get" action, should not use for restore according it
				atLineStart: (lineTextOffset == 0),
				atLineEnd: (lineTextOffset == EditorUtil.getText(sel.rootNode.childNodes[lineIndex]).length)
			};
		}

		var bCollapsed = range.collapsed;
		try
		{
			var startNode = range.startContainer;
			var startSelection = _TrimSelectionNode(startNode, range.startOffset, true);
			var endSelection = null;
			if (!bCollapsed)
			{
				var endNode = range.endContainer;
				endSelection = _TrimSelectionNode(endNode, range.endOffset, false);
				
				//Need fix one case, we select at the end of preline, we should move to next line
				if(startSelection.atLineEnd && !endSelection.atLineStart)
				{
					startSelection.lineIndex ++ ;
					startSelection.textOffset = 0;
					startSelection.lineTextOffset = 0;
				}
			}
		}
		catch (e)
		{
			console.warn("error in getListSelectionRangeInfo :" + e);
			return null;
		}
		return {
			bCollapsed: bCollapsed,
			startSelection: startSelection,
			endSelection: endSelection,
			root: sel.rootNode
		};
	},

	restoreSelection: function(range, rangeSelection)
	{
		if(dojo.isIE && pe.scene.slideEditor.opcityPanelShow)
			return;
		function _findSpanNode(sel, root)
		{
			if (!sel)
				return null;
			var line = root.childNodes[sel.lineIndex];
			var lineItem = EditorUtil.getLineItem(line);
			var focusSpan = null;
			var textOffset = 0;
			
			if (!lineItem)
				return null;

			var curTotalCount = 0;
			var targetCount = sel.lineTextOffset;

			var nodeList = dojo.query('span,br.text_line-break', lineItem);
			if (nodeList.length)
			{
				var index = 0;
				while (index < nodeList.length)
				{
					var node = nodeList[index];
					var selfLength = 0;
					if (EditorUtil.is(node, 'br'))
					{
						selfLength = 1;
					}
					else
					// span node
					{
						var aList = dojo.query('a', node);
						if(!aList.length)
						{
							var textContent = EditorUtil.getText(node);
							selfLength = textContent.length;
						}
					}

					if ((targetCount >= curTotalCount) && (targetCount <= (curTotalCount + selfLength)))
					{ // we find the node
						focusSpan = node;
						textOffset = targetCount - curTotalCount;
						break;
					}
					curTotalCount += selfLength;

					index++;
				}
			}

			return {node : node,
				textOffset :textOffset};
		}

		if (!rangeSelection)
			return;
		
		if(!range)
		{
			range = new pres.editor.range(this.mDocument);
			range._selection = this;
		}

		function minValue(a, b)
		{
			return (a > b) ? b : a;
		}
		
		var startSpanInfo = _findSpanNode(rangeSelection.startSelection, rangeSelection.root);
		if(!startSpanInfo)
			return;
		var endSpanInfo = _findSpanNode(rangeSelection.endSelection, rangeSelection.root);

		var startSpan = startSpanInfo.node;
		var endSpan = endSpanInfo ? endSpanInfo.node : null;
		var startOffset = startSpanInfo.textOffset;
		var endOffset = endSpanInfo ? endSpanInfo.textOffset : 0;
		if (startSpan)
		{
			if (EditorUtil.is(startSpan, 'br'))
			{
				var node = startSpan.nextSibling;
				if (node)
				{
					startSpan = node;
					startOffset = 0;
				}
				else
				{
					startSpan = startSpan.previousSibling;
					startOffset = EditorUtil.getText(startSpan).length;
				}
			}
			startSpan.normalize();
			var textNode = startSpan.childNodes[0];
			if (!textNode)
				startSpan.innerHTML = '&#8203;';
			startOffset = minValue(EditorUtil.getText(startSpan).length, startOffset);

		}

		if (endSpan)
		{
			if (EditorUtil.is(endSpan, 'br'))
			{
				var node = endSpan.nextSibling;
				if (node)
				{
					endSpan = node;
					endOffset = 0;
				}
				else
				{
					endSpan = endSpan.previousSibling;
					endOffset = EditorUtil.getText(endSpan).length;
				}
			}
			endSpan.normalize();
			var textNode = endSpan.childNodes[0];
			if (!textNode)
				endSpan.innerHTML = '&#8203;';
			endOffset = minValue(EditorUtil.getText(endSpan).length, endOffset);
		}

		if (rangeSelection.bCollapsed && startSpan && startSpan.childNodes)
		{
			range.setStart(startSpan.childNodes[0], startOffset);
			range.setEnd(startSpan.childNodes[0], startOffset);
			range.select();
		}
		else if (startSpan && endSpan && startSpan.childNodes && endSpan.childNodes)
		{
			range.setStart(startSpan.childNodes[0], startOffset);
			range.setEnd(endSpan.childNodes[0], endOffset);
			range.select();
		}
		return range;
	},

	//return null or table cells
	getSelectedTableCells: function()
	{
		
		var _getStartEndTDs = function(range)
		{
			var startTD = null;
			var endTD = null;
			
			var startTD = EditorUtil.getAscendant(range.startContainer, 'td') 
			|| EditorUtil.getAscendant(range.startContainer, 'th');
			
			var endTD = EditorUtil.getAscendant(range.endContainer, 'td') 
			|| EditorUtil.getAscendant(range.endContainer, 'th');
			
			if(!startTD || !endTD)
			{
				if(startTD && !endTD && EditorUtil.is(range.endContainer,'div'))
				{
					var tds = dojo.query("td,th", range.endContainer);
					if(tds.length)
						endTD = tds[tds.length-1];
					else
						endTD = startTD; 
				}
				else if(EditorUtil.is(range.startContainer,'tr'))
				{
					startTD = range.startContainer.childNodes[range.startOffset];
					endTD = startTD;
				}
			}
			
			return {
				startTD : startTD,
				endTD : endTD
			};
			
		};
		
		var ranges = this._getRanges(this.mDocument);
		var len = ranges.length;
		
		var tds = [];

		for(var i = 0 ;i < len; i++)
		{
			var pairTD = _getStartEndTDs(ranges[i]);
			var startTD = pairTD.startTD;
			var endTD = pairTD.endTD;

			if(startTD && dojo.indexOf(tds, startTD) == -1)
				tds.push(startTD);
			if(endTD && endTD != startTD)
			{
				if(dojo.indexOf(tds, endTD) == -1)
					tds.push(endTD);
			}
		}
		
		var minIndex = -1;
		var maxIndex = -1;
		var allTds = null;
		if(tds.length > 0)
		{
			var tbody = tds[0].parentNode.parentNode;
			allTds = dojo.query("td,th", tbody);
						
			dojo.forEach(tds, function(td, i){
				var index = dojo.indexOf(allTds, td);
				if(i == 0)
				{
					minIndex = maxIndex = index;
				}
				else
				{
					if(index < minIndex)
					{
						minIndex = index;
					}
					if(index > maxIndex)
					{
						maxIndex = index;
					}
				}
			});
			
		}
		//We get the selection start and end 
		if((minIndex >=0) && (maxIndex >=0))
		{
			var curTxtBox = this.boxOwner;
			var tableElement = curTxtBox.element;
			var table = tableElement.table;
			var startCellId = allTds[minIndex].id;
			var endCellId = allTds[maxIndex].id;
			tds = [];
			if(minIndex == maxIndex)
			{
				tds.push(table.getCellById(startCellId));
			}
			else
			{				
				var startAbsIndex = table.getAbsCellIndex(startCellId);
				var endAbsIndex = table.getAbsCellIndex(endCellId);
				var startRowIndex = Math.min(startAbsIndex.rowIndex,endAbsIndex.rowIndex);
				var endRowIndex = Math.max(startAbsIndex.rowIndex,endAbsIndex.rowIndex);
				var startColIndex = Math.min(startAbsIndex.colIndex,endAbsIndex.colIndex);
				var endColIndex = Math.max(startAbsIndex.colIndex,endAbsIndex.colIndex);
					
				for(var r=startRowIndex;r<=endRowIndex;r++)
					for(var c=startColIndex;c<=endColIndex;c++)
					{
						var id = table.getCellIDByAbsIndex(r,c);
						tds.push(table.getCellById(id));
					}
			}
			return tds;
		}
				
		return null;
	},
	
	//bOnlyVisibleSpan = true means we only get the node is visible in selection
	//for example : <xxxx|><yy|yy>,the <xxxx> node won't be in selected
	
	//selectedCells is an array to hold selected cell
	//since this data might store in edit mode, so we could get it
	getSelectedNodes : function(bOnlyVisibleSpan,selectedCells)
	{
		var tSpans = [];
		var tParagraphes = [];
		var tBoxes = [];//textboxes
		var cells = selectedCells?selectedCells:this.getSelectedTableCells();
		if(cells && cells.length>1)
		{
			var tableElement = cells[0].parent.parent.parent;//cell.row.table.tableelment
			var domTable = pe.scene.slideEditor.getBoxByElementId(tableElement.id).domNode;
			
			for(var i=0;i<cells.length;i++)
			{
				var domCell = dojo.query("[id="+cells[i].id+"]",domTable)[0];
				var paragraphes = dojo.query('p,ol,ul',domCell);
				tParagraphes = tParagraphes.concat(paragraphes);
				if(!bOnlyVisibleSpan)
				{
					var spans = dojo.query('span',domCell);
					tSpans = tSpans.concat(spans);
				}
				else
				{
					for(var j=0;j<paragraphes.length;j++)
					{
						var para = paragraphes[j];
						var str = EditorUtil.getText(para);
						if(str.length)
						{
							var spans = dojo.query('span',para);
							for(var k=0;k<spans.length;k++)
							{
								var spanStr = EditorUtil.getText(spans[k]);
								if(spanStr.length)
									tSpans.push(spans[k]);
							}
						}
						else //empty line, we get the first span if any
						{
							var span = dojo.query('span',para)[0];
							if(span)
								tSpans.push(span);
						}
							
					}
				}

				tBoxes.push(domCell);
			}
		}
		else
		{
			var selInfo = this.getSelectTxtInfo(this.getRange());
			if(!selInfo)
				return null;
			tBoxes.push(selInfo.root);
			if(selInfo.bCollapsed)
			{
				var span = selInfo.startSelection.focusSpan;
				tSpans.push(span);
				var para = selInfo.root.childNodes[selInfo.startSelection.lineIndex];
				tParagraphes.push(para);
			}
			else
			{
				var sSel = selInfo.startSelection;
				var eSel = selInfo.endSelection;
				if(sSel.lineIndex == eSel.lineIndex)
				{//Same line
					var para = selInfo.root.childNodes[sSel.lineIndex];
					tParagraphes.push(para);
					var span = sSel.focusSpan;
					if(bOnlyVisibleSpan)
					{
						if(sSel.textOffset == EditorUtil.getText(span).length)
							span = span.nextSibling;
					}
					while(span && !(span === eSel.focusSpan))
					{
						if(EditorUtil.is(span,'span'))
						{
							if(!bOnlyVisibleSpan 
									|| bOnlyVisibleSpan && EditorUtil.getText(span).length)
							tSpans.push(span);
						}
						span = span.nextSibling;
					}
					if(!bOnlyVisibleSpan 
							|| bOnlyVisibleSpan && eSel.textOffset)
						tSpans.push(eSel.focusSpan);
				}
				else
				{// not same line
					//start line===================
					var para = selInfo.root.childNodes[sSel.lineIndex];
					tParagraphes.push(para);
					var span = sSel.focusSpan;
					if(bOnlyVisibleSpan)
					{
						if(sSel.textOffset == EditorUtil.getText(span).length)
							span = span.nextSibling;
					}
					while(span)
					{
						if(EditorUtil.is(span,'span'))
						{
							if(!bOnlyVisibleSpan 
									|| bOnlyVisibleSpan && EditorUtil.getText(span).length)
							tSpans.push(span);
						}
						span = span.nextSibling;
					}					
					//middle lines
					for(var i=sSel.lineIndex+1;i<eSel.lineIndex;i++)
					{
						var para = selInfo.root.childNodes[i];
						tParagraphes.push(para);
						
						var spans = dojo.query('span',para);
						if(!bOnlyVisibleSpan)
						tSpans = tSpans.concat(spans);
						else
						{
							var str = EditorUtil.getText(para);
							if(str.length)
							{
								var spans = dojo.query('span',para);
								for(var k=0;k<spans.length;k++)
								{
									var spanStr = EditorUtil.getText(spans[k]);
									if(spanStr.length)
										tSpans.push(spans[k]);
								}
							}
							else //empty line, we get the first span if any
							{
								var span = dojo.query('span',para)[0];
								if(span)
									tSpans.push(span);
							}
						}
					}					
					//end line
					var para = selInfo.root.childNodes[eSel.lineIndex];
					tParagraphes.push(para);
					var span = para.firstChild;
					while(span && !(span === eSel.focusSpan))
					{
						if(EditorUtil.is(span,'span'))
						{
							if(!bOnlyVisibleSpan 
									|| bOnlyVisibleSpan && EditorUtil.getText(span).length)
								tSpans.push(span);
						}
						span = span.nextSibling;
					}
					if(!bOnlyVisibleSpan 
							|| bOnlyVisibleSpan && eSel.textOffset)
					tSpans.push(eSel.focusSpan);
				}
			}
		}
		
		return {
			spans : tSpans,
			paragraphes : tParagraphes,
			textboxes : tBoxes //textboxes
		};
	},

	createTableSelectionBookmarks: function()
	{
		// TODO need ZhengWen help
	},

	restoreTableSelectionBookmarks: function(bookMarks)
	{
		// TODO need ZhengWen help
	},

	// ////////////////////////////////////////////////////////////////////////
	// /below are Internal functions, forbidden use outside
	_getRanges: function(document)
	{
		var sel = this._getNativeSel(document);
		var ranges = [], range;
		if (!sel)
			return ranges;
		if (!sel.rangeCount)
		{
			// range = new CKEDITOR.dom.range( doc );
			// range.moveToElementEditStart( doc.getBody() );
			// ranges.push( range );
		}
		for ( var i = 0; i < sel.rangeCount; i++)
		{
			var nativeRange = sel.getRangeAt(i);
			range = new pres.editor.range(document);
			range.setStart(nativeRange.startContainer, nativeRange.startOffset);
			range.setEnd(nativeRange.endContainer, nativeRange.endOffset);
			range._selection = this;
			ranges.push(range);
		}
		return ranges;
	},

	_getNativeSel: function(document)
	{
		var sel = null;
		if (window.getSelection)
		{
			sel = window.getSelection();
		}
		if (!sel && document.selection)
			sel = document.selection;
		return sel;
	}
});

(function()
{
	// Updates the "collapsed" property for the given range object.
	var updateCollapsed = function(range)
	{
		range.collapsed = (range.startContainer && range.endContainer && range.startContainer === range.endContainer && range.startOffset == range.endOffset);
	};

	pres.editor.range.prototype = {
			
		isSame: function(range)
		{
			if (!range)
				return false;
			return range.startContainer == this.startContainer && range.endContainer == this.endContainer 
				&& range.startOffset == this.startOffset && range.endOffset == this.endOffset
				&& range.collapsed == this.collapsed;
		},
			
		clone: function()
		{
			var clone = new pres.editor.range(this.document);

			clone.startContainer = this.startContainer;
			clone.startOffset = this.startOffset;
			clone.endContainer = this.endContainer;
			clone.endOffset = this.endOffset;
			clone.collapsed = this.collapsed;

			return clone;
		},

		setStart: function(startNode, startOffset)
		{

			this.startContainer = startNode;
			this.startOffset = startOffset;

			if (!this.endContainer)
			{
				this.endContainer = startNode;
				this.endOffset = startOffset;
			}

			updateCollapsed(this);
		},

		setEnd: function(endNode, endOffset)
		{
			this.endContainer = endNode;
			this.endOffset = endOffset;

			if (!this.startContainer)
			{
				this.startContainer = endNode;
				this.startOffset = endOffset;
			}
			updateCollapsed(this);
		},

		setStartAfter: function(node)
		{
			this.setStart(node.parentNode, EditorUtil.getIndex(node) + 1);
		},

		setStartBefore: function(node)
		{
			this.setStart(node.parentNode, EditorUtil.getIndex(node));
		},

		setEndAfter: function(node)
		{
			this.setEnd(node.parentNode, EditorUtil.getIndex(node) + 1);
		},

		setEndBefore: function(node)
		{
			this.setEnd(node.parentNode, EditorUtil.getIndex(node));
		},

		setStartAt: function(node, position)
		{
			switch (position)
			{
				case EditorUtil.POSITION_AFTER_START:
					this.setStart(node, 0);
					break;

				case EditorUtil.POSITION_BEFORE_END:
					if (node.type == EditorUtil.NODE_TEXT)
						this.setStart(node, node.getLength());
					else
						this.setStart(node, node.childNodes.length);
					break;

				case EditorUtil.POSITION_BEFORE_START:
					this.setStartBefore(node);
					break;

				case EditorUtil.POSITION_AFTER_END:
					this.setStartAfter(node);
			}

			updateCollapsed(this);
		},

		setEndAt: function(node, position)
		{
			switch (position)
			{
				case EditorUtil.POSITION_AFTER_START:
					this.setEnd(node, 0);
					break;

				case EditorUtil.POSITION_BEFORE_END:
					if (node.type == EditorUtil.NODE_TEXT)
						this.setEnd(node, node.getLength());
					else
						this.setEnd(node, node.childNodes.length);
					break;

				case EditorUtil.POSITION_BEFORE_START:
					this.setEndBefore(node);
					break;

				case EditorUtil.POSITION_AFTER_END:
					this.setEndAfter(node);
			}

			updateCollapsed(this);
		},

		moveToPosition: function(node, position)
		{
			this.setStartAt(node, position);
			this.collapse(true);
		},

		collapse: function(toStart)
		{
			if (toStart)
			{
				this.endContainer = this.startContainer;
				this.endOffset = this.startOffset;
			}
			else
			{
				this.startContainer = this.endContainer;
				this.startOffset = this.endOffset;
			}

			this.collapsed = true;
		},

		select: function()
		{
			this._selection.select(this);
		},

		/**
		 * Find the node which fully contains the range.
		 * 
		 * @param includeSelf
		 * @param {Boolean}
		 *            ignoreTextNode Whether ignore CKEditorUtil.NODE_TEXT type.
		 */
		getCommonAncestor: function(includeSelf, ignoreTextNode)
		{
			var start = this.startContainer, end = this.endContainer, ancestor;

			if (start === end)
			{
				if (includeSelf && start.nodeType == EditorUtil.NODE_ELEMENT && this.startOffset == this.endOffset - 1)
					ancestor = start.childNodes[this.startOffset];
				else
					ancestor = start;
			}
			else
				ancestor = EditorUtil.getCommonAncestor(start, end);

			return ignoreTextNode && (ancestor.nodeType == EditorUtil.NODE_TEXT) ? ancestor.parentNode : ancestor;
		}
	};

})();
