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

dojo.provide("concord.pres.PresTableUtil");
dojo.require("concord.pres.TableResizeUtil");
dojo.declare("concord.pres.PresTableUtil", null, {
    /**
     * Select two cells in diff browsers: e.g. cell(2,1):"abc", cell(2,2):"123". 
     * Before calling this function, the selection would be:
     * in FF: two ranges
     * 		range0: startContainer: tr(offset: 0); endContainer:tr(offset:1)
     * 		range1: startContainer: tr(offset: 0); endContainer:tr(offset:1)
     * in Chrome/Safari: one range
     * 		startContainer: textnode(offset: 0); endContainer: textnode(offset:1)
     * in IE: one range
     * 		startContainer: span(offset: 0); endContainer: span(offset:1)
     * 
     * Note, if all cells in table selected, needs to set editor.isctrlA to true
     * @param editor
     */
    fixRangeForTable: function(editor,target,isRightClick){
    	if(!editor || !target)
    		return;
    	
    	var sel = editor.getSelection();
    	if(!sel)
    		return;
    	
    	var ranges = sel.getRanges();
    	var range = ranges[0];
    	if(range.collapsed)
    		return;
    	
    	//sc and ec can be any tag(tbody, td, textnode...)
    	var sc = range.startContainer, ec = range.endContainer, sOffset = range.startOffset, eOffset = range.endOffset;
    	var fullTable = 0;
    	
    	var sTD = sc.getAscendant("th", true) || sc.getAscendant("td", true);
    	if(!sTD){
    		var subSTD = PresCKUtil.getFirstElementNode(sc.$, "th") || PresCKUtil.getFirstElementNode(sc.$, "td");
    		var tdNode = new CKEDITOR.dom.element(subSTD);
    		if(!tdNode){
    			console.log("Table was interrupted.");
    			return;
    		}
    		sTD = tdNode;
    		fullTable += 1;
    	}else if(PresTableUtil.isFirstOrLastCellInTable(sTD, true)){
    		fullTable += 1;
    	}
    	
    	var	eTD = ec.getAscendant("th", true) || ec.getAscendant("td", true);
    	if(!eTD){
    		var subETD = PresCKUtil.getLastElementNode(ec.$, "th") || PresCKUtil.getLastElementNode(ec.$, "td");
    		var etdNode =new CKEDITOR.dom.element(subETD);
    		if(!etdNode){
    			console.log("Table was interrupted.");
    			return;
    		}
    		eTD = etdNode;
    		fullTable += 1;
    	}else if(PresTableUtil.isFirstOrLastCellInTable(eTD)){
    		fullTable += 1;
    	}
    	
    	if(sTD.$ == eTD.$)
    		return;
    	
    	var targetRange = new CKEDITOR.dom.range(editor.document);
    	var tableNode = sTD.getAscendant("table", true);
    	if(fullTable == 2){
    		editor.ctrlA = true;
    		var clds = tableNode.getChildCount();
    		if(clds == 2){
    			var firstCld = tableNode.getChild(0), secdCld = tableNode.getChild(1);
    			if(PresCKUtil.checkNodeName(firstCld, "colgroup") && PresCKUtil.checkNodeName(secdCld, "tbody")){
    				targetRange.setStart(secdCld, 0);
    				targetRange.setEnd(secdCld, secdCld.getChildCount());
    			}
    		}else{
    			return;
    		}
    		
    	}else{
    		if(CKEDITOR.env.webkit && isRightClick){//D29020
    			range.shrink(CKEDITOR.SHRINK_ELEMENT,false);
    			targetRange = range;
    		}else{
        		var childNum = eTD.getChildCount();
        		targetRange.setStart(sTD, 0);
        		targetRange.setEnd(eTD, childNum);
    		}
    	}
    	targetRange.select();
    	
    	//step3: set selectedSTCell
    	//only set selectedSTCell to the first cell of the range, not sure why this, just follow the old rule
    	editor.execCommand('makeSmartTableCellActive', true);
    	
    	return [targetRange];
    },
    
    shrinkSelectionToTD: function(editor, NotSelect){
    	if(!editor)
    		return;
    	var sel = editor.getSelection();
		var range = sel && sel.getRanges()[0];
		var sTD = range.startContainer.getAscendant("td");
		if(!sTD)
			return;
		
		var childNum = sTD.getChildCount();
		var targetRange = new CKEDITOR.dom.range(editor.document);
		targetRange.setStart(sTD, 0);
		targetRange.setEnd(sTD, childNum);
		if(!NotSelect){
			targetRange.select();
			//set selectedSTCell and don't set cursor
			editor.execCommand('makeSmartTableCellActive', true);
		} 
		return targetRange;
    },
    
    moveCursorForDeleteRows: function(editor, rowIndexForCursor){
    	if (!editor || !editor.contentBox.isEditModeOn())
    		return;
    	
    	var tables =dojo.query('.smartTable',editor.document.$.body);
    	if(tables.length == 0)
    		return;
    	
    	// first cell is always the default selected if there is no other selected cell
    	var targetRow = tables[0].rows[rowIndexForCursor];
    	if(!targetRow)
    		return;
    	
    	var firstTd = targetRow.firstChild; 
    	
    	if(firstTd && PresCKUtil.checkNodeName(firstTd, "td", "th")){
    		var ckNode = new CKEDITOR.dom.node(firstTd);
    		var range = new CKEDITOR.dom.range(editor.document);
    		var lastSpan = PresTableUtil.getFristOrLastSpanFromNode(ckNode, true);
    		range.moveToPosition(lastSpan, CKEDITOR.POSITION_BEFORE_END);
			range.select();		
    		
    		editor.execCommand('makeSmartTableCellActive');
    		PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
    		//D14848
    		PresCKUtil.adjustToolBarForList(editor);
    	}
    },

    getFristOrLastSpanFromNode: function(node, getLast){
		if(!node)
			return null;
		
		node = node.$ || node;
		var spanList = node.getElementsByTagName('span');
		var spanListLen = spanList.length;
		var retSpan = null;
		if(getLast){
			retSpan = (spanListLen > 0) && spanList[spanListLen - 1];
		}else{
			retSpan = (spanListLen > 0) && spanList[0];
		}
		retSpan = retSpan && (new CKEDITOR.dom.node(retSpan));
		return retSpan;
	},
	// see the selected table has merge cell or not, table is a DOM table node
	isMergeCell: function(table){
    	if(!table)
			return false;
    	table = table.$ || table;
		var rows = table.rows;
		if(!rows)
			return false;
		for( var i = 0; i < rows.length; i++ )
		{
			var row = rows.item(i);			
			var cells = row.cells;
			if(cells)
				{
					for( var j = 0; j < cells.length; j++ )
					{
						var cell = cells.item(j);
						if( cell.colSpan > 1 || cell.rowSpan > 1 )
							return true;
					}
				}
		}
		return false;
    },
    /**
     * Pre handle of arrow key event:
     * When enter this function ,cursor is already move to position, we only need to skip 8203 here. 
     * @param editor
     * @param event
     */
    handleArrowKeyInTable: function(editor, event){
    	if(!editor || !editor.isTable || !event)
    		return false;

    	var key = event.$.keyCode;
    	if((key < 37) || (key > 40))
    		return false;
    	
    	var selection = editor.getSelection();
		var range = selection.getRanges()[0];
		
		if(!range.collapsed)
			return false;

		var fromCell = range.startContainer.getAscendant('td',true) || range.startContainer.getAscendant('th',true);
		var txt = null;
		var toCell = null;
		var retFlg = false;
		var guardNode = fromCell.getParent().getParent(); //set the tbody node as the guard.
		
		
		if(key === 39){ //arrow right
			
			var touchENode = range.getTouchedEndNode();
			var rBoundary = PresTableUtil.checkBoundaryOfTD(touchENode, range.endOffset, true); //check current position is the end of current td
			if(rBoundary){
				toCell = fromCell.getNextSourceNode(true, CKEDITOR.NODE_ELEMENT, guardNode);
				if(toCell){
					if(PresCKUtil.checkNodeName(toCell, "tr")){
						toCell = toCell.getFirst();
					}
					var firstSpan = PresTableUtil.getFristOrLastSpanFromNode(toCell);
					firstSpan && range.moveToPosition(firstSpan, CKEDITOR.POSITION_AFTER_START);
				}
				range.select();
				retFlg = true;
			}else{
				retFlg = false;
			}
			
		}else if(key === 37){ //arrow left
			var touchSNode = range.getTouchedStartNode();
			var lBoundary = PresTableUtil.checkBoundaryOfTD(touchSNode, range.startOffset);
			if(lBoundary){
				toCell = fromCell.getPreviousSourceNode(true, CKEDITOR.NODE_ELEMENT, guardNode);
				if(PresCKUtil.checkNodeName(toCell, "tr")){
					toCell = toCell.getLast();
				}
				var lastSpan = PresTableUtil.getFristOrLastSpanFromNode(toCell, true);
				lastSpan && range.moveToPosition(lastSpan, CKEDITOR.POSITION_BEFORE_END);
				range.select();		
				retFlg = true;
			}else{
				retFlg = false;
			}
			
		}else if(key === 38){ //arrow up
			
			var fromCellIndex = fromCell.getIndex();
			var PrevRow = fromCell.getParent().getPrevious();
			toCell = PrevRow && PrevRow.getChild(fromCellIndex);
			
			var scEle = range.startContainer.getAscendant("span", true);
			var firstSpan = PresTableUtil.getFristOrLastSpanFromNode(fromCell);
			var isFirstSpan = scEle && (scEle.$ == firstSpan.$);
			
			if(!isFirstSpan){
				retFlg = false;
			}else{
				if(toCell){
					var lastSpan = PresTableUtil.getFristOrLastSpanFromNode(toCell, true);
					lastSpan && range.moveToPosition(lastSpan, CKEDITOR.POSITION_BEFORE_END);
					range.select();		
				}
				retFlg = true;
			}
			
		}else if(key === 40){ //arrow down
			
			var fromCellIndex = fromCell.getIndex();
			var nextRow = fromCell.getParent().getNext();
			toCell = nextRow && nextRow.getChild(fromCellIndex);
			
			var scEle = range.startContainer.getAscendant("span", true);
			var lastSpan = PresTableUtil.getFristOrLastSpanFromNode(fromCell, true);
			var isLastSpan = scEle && (scEle.$ == lastSpan.$);
			
			if(!isLastSpan){
				retFlg = false;
			}else{
				if(toCell){
					var firstSpan = PresTableUtil.getFristOrLastSpanFromNode(toCell);
					firstSpan && range.moveToPosition(firstSpan, CKEDITOR.POSITION_AFTER_START);
					range.select();
				}
				retFlg = true;
			}
		}else{
			retFlg = false;
		}
		
		if(retFlg){
			editor.execCommand('makeSmartTableCellActive', true); //don't move cursor
			PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
			PresCKUtil.adjustToolBarForList(editor);
			var isNewTextContent = dojo.query(".newTextContent", editor.contentBox.mainNode);
			if (isNewTextContent.length == 0) {
				editor.contentBox.editorAdjust();
			}
		}
		return retFlg;
    },
    
    isFirstOrLastCellInTable: function(tdNode, isFirst){
    	var tableNode = tdNode.getAscendant("table", true);
    	var rows = tableNode.$.rows;
    	var compareCell = null;
    	if(isFirst){
    		compareCell = rows[0].cells[0];
    	}else{
    		var lastRow = rows[rows.length - 1];
    		var lenCell = lastRow.cells.length;
    		compareCell = lastRow.cells[lenCell - 1];
    	}
    	
    	if(compareCell && tdNode && (compareCell == tdNode.$))
    		return true;
    	
    	return false;
    },
    
    /**
     * Check current selection actually equal to a td.
     * This function only works in edit mode.
     * @returns
     */
    isSelectionEqualToTD: function(editor){
    	if(!editor.contentBox.isEditModeOn())
    		return false;
    		
    	var sel = editor.getSelection();
    	var ranges = sel && sel.getRanges();
    	if(ranges.length > 1)
    		return false;
    	var range = ranges[0];
    	
    	//selection is tbody or higher, this check may incorrect if in view mode
    	if(PresCKUtil.checkNodeName(range.startContainer,"tbody", "table"))
    		return false;
    	
    	//selection is tr node
    	if(PresCKUtil.checkNodeName(range.startContainer,"tr") && (range.endOffset - range.startOffset === 1))
    		return true;
    	
    	//selection is td node
    	if(range.collapsed && PresCKUtil.checkNodeName(range.startContainer,"td") && (range.endOffset - range.startOffset === 1))
    		return true;
    	
    	var touchSNode = range.getTouchedStartNode(), touchENode = range.getTouchedEndNode();
    	//selection is inside td node
    	var lBoundary = PresTableUtil.checkBoundaryOfTD(touchSNode, range.startOffset, false);
    	var rBoundary = PresTableUtil.checkBoundaryOfTD(touchENode, range.endOffset, true); 
    	if(lBoundary && rBoundary){
    		return true;
    	}
    	
    	return false;
    },
    
    checkBoundaryOfTD: function(node, offset, isEnd){
		var td = node.getAscendant('th', true) || node.getAscendant('td', true);
		if(!td)
			return false;
		var navNode = isEnd ? td.getLast() : td.getFirst();
		var cldNum = -1;
		var txt = TEXTMSG.getTextContent(td.$);
		if(txt && (txt.length === 1) && (txt.charCodeAt(0) === 8203))
			return true;
		
		
		if(dojo.isChrome || dojo.isSafari){
			
			var validateNode = function(node){
				//empty text nodes may create by browser, so need to skip them
				while(node){
					if(PresCKUtil.checkNodeName(node, '#text')){
						var dataV = node.getText();
						if(dataV.length === 0){
							node = node.getPrevious();
						}else{
							break;
						}
					}else{
						break;
					}
				}
				return node;
			};
			
			node = validateNode(node);
			navNode = validateNode(navNode);
		}
		
		while(navNode){
			if(isEnd){
				if(dojo.isChrome || dojo.isSafari){
					navNode = validateNode(navNode);
				}
				
				if(PresCKUtil.checkNodeName(navNode,"br"))
					navNode = navNode.getPrevious();
				
				if(node.$ == navNode.$){
					if(node.type == CKEDITOR.NODE_TEXT){
						cldNum = node.getLength();
					}
					else{
						cldNum = node.getChildCount();
					}
					if(offset == cldNum)
						return true;
				}
				
				navNode = (navNode.type == CKEDITOR.NODE_ELEMENT) ? navNode.getLast() : null;
			}else{
				if(node.$ == navNode.$){
					if(offset === 0)
						return true;
				}
				navNode = (navNode.type == CKEDITOR.NODE_ELEMENT) ? navNode.getFirst() : null;
			}
		}
		return false;
	},
	
	/**
	 * Use relative value to calculate an absolute value
	 * @param relativeValue
	 * @returns
	 */
	generateAbsWidthValue: function(relativeValue){
		if(isNaN(relativeValue) || relativeValue < 0)
			return relativeValue;
		
		var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorWidthinPX = dojo.isIE ? slideEditorMainNode.offsetWidth: dojo.style(slideEditorMainNode, 'width');
    	
		return relativeValue * 1000 / slideEditorWidthinPX;
	},
	
	/**
	 * Use absolute value to calculate the relative value 
	 * according to current slide editor height
	 * @param absValue
	 * @returns
	 */
	retriveFromAbsWidthValue: function(absValue){
		if(isNaN(absValue) || absValue < 0)
			return absValue;
		
		var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorWidthinPX = dojo.isIE ? slideEditorMainNode.offsetWidth: dojo.style(slideEditorMainNode, 'width');
    	
		return absValue * slideEditorWidthinPX / 1000;
	},
	
	/**
	 * Use relative value to calculate an absolute value
	 * @param relativeValue
	 * @returns
	 */
	generateAbsHeightValue: function(relativeValue){
		if(isNaN(relativeValue) || relativeValue < 0)
			return relativeValue;
		
		var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
    	
		return relativeValue * 1000 / slideEditorHeightinPX;
	},
	
	/**
	 * Use absolute value to calculate the relative value 
	 * according to current slide editor height
	 * @param absValue
	 * @returns
	 */
	retriveFromAbsHeightValue: function(absValue){
		if(isNaN(absValue) || absValue < 0)
			return absValue;
		
		var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
    	
		return absValue * slideEditorHeightinPX / 1000;
	},
	
	updateDFNodeWithContentHeight:function(contentBox){
		
		if(!contentBox)
			return;
		
		var totalH = 0;
		var tableNode = null;
		if(contentBox.editor && contentBox.editModeOn){
			tableNode = dojo.query('table',contentBox.editor.document.$.body)[0]; //from editing actions
		}else{
			tableNode = contentBox.contentBoxDataNode; //from resize row/col
		}
		var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
		dojo.query('tr', tableNode).forEach(function(tr){
		    var presRowH = parseFloat( slideEditorHeightinPX * dojo.attr(tr, 'presrowheight') / 1000);
			var actRowH = PresTableUtil.getTRHeightByContent(tr);
			if(presRowH > actRowH)
				totalH += presRowH;
			else
				totalH += actRowH;
		});
		totalH += contentBox.getHeight_adjust(tableNode);
		
		dojo.style(contentBox.mainNode, 'height', contentBox.PxToPercent(totalH, 'height') + "%");
		if(contentBox.editor && contentBox.editModeOn){
			var ckBody = contentBox.editor.document.getBody().$;
			dojo.style(ckBody, 'height', totalH + "px");
		}else{
			//D39731 [IE][B2B][Regression]After adjust column width, all the row height is changed
			//since table node height and width in px now, then we need to adjust it specifically
			if(dojo.isIE){
				contentBox.adjustContentDataSize();
			}
		}
		PresTableUtil.setRowHeightWithPresValue(tableNode); 
		contentBox.updateHandlePositions(true);
	},
	
	/**
	 * col resizing end will call this function
	 * @param contentBox
	 */
	updateViewDFNodeWithContentHeight:function(contentBox){
		
		if(!contentBox)
			return;
		
		var tableNode = contentBox.contentBoxDataNode;
		var totalH = PresTableUtil.setRowHeightWithPresValue(tableNode);
		totalH += contentBox.getHeight_adjust(tableNode);
		
		dojo.style(contentBox.mainNode, 'height', contentBox.PxToPercent(totalH, 'height') + "%");
		contentBox.updateHandlePositions(true);
	},
	
	/**
	 * This function update ckbody height with saved presrowheight, 
	 * then the later delete operation would be as expected.
	 * @param contentBox
	 * @param cell
	 * @returns
	 */
	resetCKBodyHeight: function(contentBox,bNotNeedUndo){
		if(!contentBox || !contentBox.editor)
			return;
		
		var ckBody = contentBox.editor.document.getBody().$;
		var table = dojo.query("table", ckBody)[0];
		
		var totalRowH = PresTableUtil.setRowHeightWithPresValue(table);

		//update ckbody height
		dojo.style(ckBody, 'height', totalRowH + "px");
		
		contentBox.editorAdjust(null,null,bNotNeedUndo);
		
	},
	
	/**
	 * 
	 * @param table
	 * @param directUpdate : true, called from resize col, then to update row height anyway.
	 * @returns {Number}
	 */
	setRowHeightWithPresValue: function(table){
		if(!table)
			return;
		
		//step1, get total row height
		var totalRowH = 0;
		var rowList = [],
			prhList = [], realHList = [];
		var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
		dojo.query("tr", table).forEach(function(tr){
			var tmpH = parseFloat(slideEditorHeightinPX * dojo.attr(tr, "presrowheight") / 1000); //initial or resized row height
			var realH = PresTableUtil.getTRHeightByContent(tr);
			totalRowH += (realH > tmpH) ? realH : tmpH;
			rowList.push(tr);
			prhList.push(tmpH);
			realHList.push(realH);
		});
		
		//step2, update row height
		var i, len, tr, tmpH, realH;
		for(i = 0, len = rowList.length; i < len; i++){
			tr = rowList[i];
			tmpH = prhList[i]; //resized row height or inital height
			realH = realHList[i]; //current row height
			if(tmpH > realH){
				dojo.style(tr, 'height', (tmpH/totalRowH)*100 + "%");
			}
			else{
				dojo.style(tr, 'height', (realH/totalRowH)*100 + "%");
			}
		}
		
		return totalRowH;
	},
	
	/**
	 * This function convert percentage row height to px
	 * @param smartTable
	 */
	convertRowHeightToPx: function(smartTable){
		var tableHeightStyle = smartTable.$.offsetHeight;
		var rows = smartTable.$.rows;
		var rowHeight = null, arrHeight = [], totalHeight = 0;
		for(var i = 0, rowLen = rows.length; i < rowLen; i++){
			var rowHeightStyle = dojo.isIE ? rows[i].style.getAttribute('height') : rows[i].style.getPropertyValue('height');
			if ( tableHeightStyle && rowHeightStyle && rowHeightStyle.search( PresConstants.PERCENTAGE_REGEX ) != -1 ){
				var pctValue = parseFloat(rowHeightStyle);
				rowHeight = (pctValue * tableHeightStyle)/100;
			} else {
				rowHeight = rows[i].offsetHeight; 
			}
			rows[i].style.height = rowHeight + "px";
 		}
	},
	
	updateRowHeightForCopyPaste: function(table, tableH){
		if(!table)
			return;
		var tableHeight = 0;
		if(!tableH || tableH < 0){
			tableHeight = PresTableUtil.getHeight(table);
		}else{
			tableHeight = tableH;
		}
		
		var table = table.$ || table; 
		var rows = table.rows, total = 0;
		for(var i = 0, rowLen = rows.length - 1; i < rowLen; i++){
			var row = rows[i];
			var _height = parseFloat(dojo.attr(rows[i], "_height"));
			_height = PresTableUtil.retriveFromAbsHeightValue(_height);
			var height = (_height / tableHeight) * 100;
			dojo.style(row, "height", height + "%");
			total += height;
			dojo.removeAttr(row, "_height");
 		}
		
		var row = rows[i];
//		var _height = parseFloat(dojo.attr(rows[i], "_height"));
		dojo.style(row, "height", (100 - total) + "%");
		dojo.removeAttr(row, "_height");
	},
	
	updateRowHeightToPc: function(table){
		if(!table)
			return;
		var tableHeight = PresTableUtil.getHeight(table);
		
		var table = table.$ || table; 
		var rows = table.rows, total = 0;
		for(var i = 0, rowLen = rows.length - 1; i < rowLen; i++){
			var row = rows[i];
			var _height = PresTableUtil.getHeight(rows[i]);
			var height = (_height / tableHeight) * 100;
			dojo.style(row, "height", height + "%");
			total += height;
 		}
		
		var row = rows[i];
		dojo.style(row, "height", (100 - total) + "%");
		dojo.removeAttr(row, "_height");
	},
	
    /**
     * convert col[colIndex], col[colIndex + 1] ...  col[colIndex + count - 1] to px
     * @param colIndex
     * @param Count
     */
    convertTableColumnWidthsToPx: function(table){
    	table = table.$ || table;
    	var tableW = PresTableUtil.getWidth(table);
    	var colgrp = dojo.query('colgroup', table);
     	if(colgrp.length > 0){
     		colgrp = colgrp[0];
     	}else{
     		PresTableUtil.updateTableColgroup(table);
     		colgrp = dojo.query('colgroup', table)[0];
     	}
     	
     	if(!colgrp)
     		return;
     	
     	var subGrp = colgrp.childNodes;
     	var total = 0;
     	for(var i = 0, len = subGrp.length - 1; i < len; i++){
     		var subNode = subGrp[i];
     		var _width = PresTableUtil.getWidthInPercentFromStyle(subNode.style.cssText);
     		_width = (tableW * _width / 100).toFixed(2);
     		dojo.attr(subNode, "_width", _width);
     		total += parseFloat(_width);
     	}
     	dojo.attr(subGrp[i], "_width", (tableW - total).toFixed(2));
    },
    
    /**
     * Convert col width from px to percentage
     * @param smartTable
     * @param tableWidth
     */
    convertTableColumnWidthsToPc:function(table, tableWidth){
    	table = table.$ || table;
    	var colgrp = dojo.query('colgroup', table);
     	if(colgrp.length > 0){
     		colgrp = colgrp[0];
     		var tableW = tableWidth || PresTableUtil.getWidth(table);
     		var subGrp = colgrp.childNodes;
     		var total1 = 0;
     		for(var i = 0, len = subGrp.length - 1; i < len; i++){
     			var subNode = subGrp[i];
     			var _width = parseFloat(dojo.attr( subNode,'_width'));
     			var newW = (_width / tableW) * 100;
     			newW = newW.toFixed(2);
     			total1 += parseFloat(newW);
     			dojo.style(subNode, "width", newW + "%");
     			dojo.removeAttr(subNode, "_width");
     		}
 			//treat last column differently to make the sum of each column width equal to 100%
 			dojo.style(subGrp[i], "width", (100 - total1).toFixed(2) + "%");
 			dojo.removeAttr(subGrp[i], "_width");
     	}
    },
    
    /**
     * 
     * @param touchedColIndex: 
     * 			col index from colgroup, means the right col of touched col should be 
     * 			adjust at last to make sure all the col width sum up to 100%
     */
    convertGivenTableColumnWidthsToPc:function(table, touchedColIndex){
    	table = table.$ || table;
    	var colgrp = dojo.query('colgroup', table);
     	if(colgrp.length > 0){
     		colgrp = colgrp[0];
     		var subGrp = colgrp.childNodes;
     		if((touchedColIndex >=0) && (touchedColIndex < subGrp.length - 1)){
     			var total1 = 0;
     			for(var i = 0, len = subGrp.length; i < len; i++){
     				if(i == touchedColIndex || i == touchedColIndex + 1)
     					continue;
     				var tmp = PresTableUtil.getWidthInPercentFromStyle(subGrp[i].style.cssText);
     				if(!tmp)
     					return;
         			total1 += tmp;
     			}
     			var touchedCol = subGrp[touchedColIndex], nextCol = subGrp[touchedColIndex + 1];
     			
     			//calculate new percent width for touched col 
     			var widthTouched = PresTableUtil.getWidthInPercentFromStyle(touchedCol.style.cssText);
     			if(!widthTouched)
     				return;
     			var _width = parseFloat(dojo.attr(touchedCol, "_width")),
     				_newwidth = parseFloat(dojo.attr(touchedCol, "_newwidth"));
     			
     			var newWTouched = ((_newwidth * widthTouched) / _width).toFixed(2);
     			dojo.style(touchedCol, "width", newWTouched + "%");
     			
     			//calculate new percent width for right col of touched col
 				dojo.style(nextCol, "width", (100 - total1 - newWTouched).toFixed(2) + "%");
 				
 				dojo.attr(touchedCol, "_width" , _newwidth);
 				dojo.removeAttr(touchedCol, "_newwidth");
 				dojo.attr(nextCol, "_width" , dojo.attr(nextCol, "_newwidth"));
 				dojo.removeAttr(nextCol, "_newwidth");
     		}
     	}
    },
    
    getWidthInPercentFromStyle: function(styleText){
    	var ret = styleText.replace(/\s+/, "").match(/^width:[0-9]+(.[0-9]+)?/);
    	if(!ret)
    		return null;
    	ret = parseFloat(ret[0].replace(/width:/, ""));
    	return ret;
    },
    
    /**
     * return column absolute width(in px) by it's percentage defined in cell.cssText.
     * @param cell(both ck or native node)
     * @return column width in px
     */
    getColumnAbsWidthByPercent: function(cell, map){
    	if(!cell)
    		return 0;
    	cell = cell.$ ? cell : new CKEDITOR.dom.node(cell);
    	
    	table = cell.getAscendant("table");
    	var tableW = PresTableUtil.getWidth(table);
    	var colgrp = dojo.query('colgroup', table.$);
     	if(colgrp.length > 0){
     		colgrp = colgrp[0];
     	}else{
     		PresTableUtil.updateTableColgroup(table);
     		colgrp = dojo.query('colgroup', table.$)[0];
     	}
     	
     	if(!colgrp)
     		return 0;
     	
     	var map = map || TableResizeUtil.buildTableMap(table);
     	var cellAbsIndex = map.getCellAbsIndexFromMap(cell);
     	if(cellAbsIndex < 0)
     		return 0;
     	
     	var col = colgrp.childNodes[cellAbsIndex];
     	var _width = PresTableUtil.getWidthInPercentFromStyle(col.style.cssText);
     	if(_width){
     		_width = (tableW * _width / 100).toFixed(2);
     		return parseFloat(_width);
     	}else{
     		return 0;
     	}
    },
    
    /**
     * justify whether it's 1x1 table
     * @param table
     * @returns true, is single cell table. false, is not single cell table
     */ 
    isSingleCellTable: function(table) {
    	var rows = table.$ ? table.$.rows : table.rows;
    	if (rows && rows.length == 1) {
    		var cells = rows[0]? rows[0].cells : null;
    		if (cells && cells.length == 1) {
    			return true;
    		}
    	}
    	return false;
    },
	
    /**
     * 
     * @param table
     * @returns colNum, starts from 1.
     */
    getAbsoluteColumnNum: function(table){
    	var rows = table.$ ? table.$.rows : table.rows;
    	if(rows.length < 1)
    		return -1;
		var cells = rows[0].cells;
		var colNum = 0;
		for(var j = 0, lenC = cells.length; j < lenC; j++){
			var cell = cells[j];
			var colspan = parseInt(cell.getAttribute('colspan') || 1);
			colNum += colspan;
		}
    	return colNum;
    },
    
    /*
     * return an object contains the min and max col index of current selection in table
     * prerequist: no discrete selection in table, the range always in a shape of rectange. 
     */
    getRectangleFromSelection: function(editor, selectedCells)
    {
    	if(!editor && !selectedCells)
    		return null;
    	
		var selectedCells = selectedCells || editor.getSelectedTableCells(editor, true);
		var minColIndex = Number.MAX_VALUE, maxColIndex = 0;
		var minRowIndex = Number.MAX_VALUE, maxRowIndex = 0;
		var table = selectedCells[0].getAscendant("table");
    	if(!table)
    		return -1;
		var map = TableResizeUtil.buildTableMap(table);
		for ( var i = 0, len = selectedCells.length; i < len; i++) {
			var cell = selectedCells[i];
			var cellAbsIndex = map.getCellAbsIndexFromMap(cell);
			if (cellAbsIndex == -1)
				return -1;
			var colspan = parseInt(cell.getAttribute('colspan') || 1);
			minColIndex = Math.min(cellAbsIndex, minColIndex);
			maxColIndex = Math.max(maxColIndex, cellAbsIndex + colspan - 1);
			
			var rowIndex = cell.getParent().getIndex();
			minRowIndex = Math.min(rowIndex, minRowIndex); 
			maxRowIndex = Math.max(maxRowIndex, rowIndex);
		}
		
		return {
			"minColIndex" : minColIndex,
			"maxColIndex" : maxColIndex,
			"minRowIndex" : minRowIndex,
			"maxRowIndex" : maxRowIndex
		};
    },
    
	getPresNodeHeight: function(node){
		try{
//			if(dojo.isIE)
//				return parseFloat(node.offsetHeight);
//			else{
				var cpdStyle = dojo.getComputedStyle(node);
				//if cpdSyle is null, then node.offsetHeight should be 0.
				var ret = cpdStyle ? cpdStyle.height : node.offsetHeight;
				return parseFloat(ret);
//			}
		}catch(e){
			console.log("PresTableUtil.getPresNodeHeight failed.");
			return 0;
		}
	},
	
	getTDHeightByContent: function(td){
		var tdH = 0;
		
		//D33970: Clear contents of one cell,row height changes larger.
		//We don't count merged cell height in
		var rowspan = parseInt(td.getAttribute('rowspan'));
		if(rowspan > 1)
			return tdH;
		
		var clds = td.childNodes; //valid child nodes should be P/UL/OL
		for(var i = 0, len = clds.length; i < len; i++){
			tdH += parseFloat(clds[i].offsetHeight);
		}
		
		var computedStyle = dojo.getComputedStyle(td);
		
		tdH += parseFloat(computedStyle[PresConstants.STYLES.BORDERTOPWIDTH]);
		tdH += parseFloat(computedStyle[PresConstants.STYLES.BORDERBOTTOMWIDTH]);
		tdH += parseFloat(computedStyle[PresConstants.STYLES.PADDINGTOP]);
		tdH += parseFloat(computedStyle[PresConstants.STYLES.PADDINGBOTTOM]);
		tdH += parseFloat(computedStyle[PresConstants.STYLES.MARGINTOP]);
		tdH += parseFloat(computedStyle[PresConstants.STYLES.MARGINBOTTOM]);
		return tdH;
	},
	
	getTRHeightByContent: function(tr){
		var realH = 0;
		dojo.query("td, th", tr).forEach(function(td){
			var tdH = PresTableUtil.getTDHeightByContent(td);
			realH = (realH > tdH) ? realH : tdH; 
		});
		
		return realH;
	},
	
 	//
 	//adds table with first character typed by user
 	//
 	reGenTableWithOldStyle: function(editor,firstEntry){
 		var body = editor.document.$.body;
 		var table = body.firstChild;
 		var firstChild = null;
 		dojo.query('td, th', table).forEach(function(td, index){
 			PresCKUtil.recreateDefaultCell(td, true);//keep old style from the first span in cell
 			if(index == 0)
 				firstChild = td;
 			
 		});

 		firstChild && editor.contentBox.moveCursorPositionToLastNodeOfTableCell(firstChild, editor.getSelection());		
 	},
 	
 	createTableFromMenu: function(slideEditor, retCB){
 		var ret = slideEditor.createTable();
 		if((typeof ret == 'boolean') || ret.paraIncorrect)
 			return ret;
 		
        var divId = ret && ret.tableDFId;
        if(!divId){
        	console.log("! Failed to create draw frame node for table.");
        	return null;
        }
        
        //insert table in sorter
        var contentObj = ret.tblContentBox;
        if(contentObj){
        	contentObj.publishInsertNodeFrame(null, true);
        }
        
        var dfNode = PROCMSG._getSorterDocument().getElementById(divId);
        var msgPair = SYNCMSG.createInsertNodeMsgPair(dfNode);
        
        SYNCMSG.sendMessage(msgPair, SYNCMSG.NO_LOCAL_SYNC);
        
        //for automation, return contentbox
        if(retCB)
        	return contentObj;
        	
        return false; //means not keep the dialog open, called in presentationDialog.closeDialog
 	},
 	
 	/**
 	 * 1, Create the event data for insert a new table from menu and toolbar.
 	 * or 2, Apply style to existing table
 	 * @param tableStyleClass
 	 * @param removeAllInlineCustomStyles
 	 * @param applyNonEditModeStyle
 	 */
 	
 	createTableAndWidgtize: function(tableStyleClass, removeAllInlineCustomStyles, applyNonEditModeStyle){
 		//console.log( "Smart table has not been selected or not in edit mode");
		var addTableStyleData = {
				eventType: "addTableStyle",
				tableStyleClass: tableStyleClass,
				applyNewTableStyle:  function( tables, tableStyleClass){
					var msgPairs = [];
					var editMode = false;
					var sendMsg = true;
					if (tables instanceof Array) {
						for (var i = 0; i < tables.length; i++){
							if ( i == tables.length - 1 ){
								sendMsg = true;
							} else {
								sendMsg = false;
							}
							removeAllInlineCustomStyles && removeAllInlineCustomStyles( tables[i], msgPairs, editMode );
							applyNonEditModeStyle && applyNonEditModeStyle(tables[i], msgPairs, tableStyleClass, sendMsg);
						}
					} else {
						sendMsg = true;
						removeAllInlineCustomStyles && removeAllInlineCustomStyles( tables[i], msgPairs, editMode );
						applyNonEditModeStyle && applyNonEditModeStyle(tables, msgPairs, tableStyleClass, sendMsg);
					}
				}
		};		
		
		// D28319 After undo only one table style change back if we change multi-table style
		// if multiple table selected, needs to merge the messages.
		PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_addTableStyle, addTableStyleData: addTableStyleData}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
 	},
 	
 	createCustomTableAndWidgtize: function(customStyleClasses, applyNonEditModeCustomStyling){
 		var addTableStyleData = {
				eventType: "addCustomTableStyle",
				tableStyleClass: customStyleClasses,
				applyNewTableStyle:  function( tables, customStyleClasses){
					if (tables instanceof Array) {
						for (var i = 0; i < tables.length; i++){
							if ( i == tables.length - 1 ){
								sendMsg = true;
							} else {
								sendMsg = false;
							}
							applyNonEditModeCustomStyling && applyNonEditModeCustomStyling(tables[i], customStyleClasses, sendMsg);
						}
					} else {
						sendMsg = true;
						applyNonEditModeCustomStyling && applyNonEditModeCustomStyling(tables, customStyleClasses);
					}								
				}
		};							
 		
 		PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_addCustomTableStyle, addTableStyleData: addTableStyleData}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
        PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
 	},
 	/**
 	 * posible cell node strcture: 
 	 * 1, <td><p><span/><br/></p></td>
 	 * 2, <td><ul/ol><li><span/><br/></li></ul/ol></td>
 	 * 3, <td><a><span/><br/></a></td>
 	 * 4, <td><ul/ol><li><a><span/><br/></a></li></ul/ol></td>
 	 * 5, <td><ul/ol><li><span><a><span/><br/></a></span></li></ul/ol></td>
 	 * @param cell
 	 * @returns
 	 */
 	emptyCellTextAndKeepStyle: function(cell){
 		if(!cell)
 			return null;
 		
 		cell = (cell.$) ? cell : new CKEDITOR.dom.node(cell);
 		var sonNode = cell.getFirst();
		if(!sonNode)
			return null;
		
		var oldP = dojo.clone(sonNode); // oldP actually could be p/ul/ol
		oldP.setAttribute("id", MSGUTIL.getUUID());
		if(PresCKUtil.checkNodeName(oldP, 'ol', 'ul')){ 
			//In this case, oldP is actually OL/UL node
			var oldLi = dojo.clone(oldP.getFirst());
			oldLi.setAttribute("id", MSGUTIL.getUUID());
			var oldSpan = dojo.clone(oldLi.getFirst());
			if(oldSpan){
				oldSpan.setAttribute("id", MSGUTIL.getUUID());
				oldSpan.setHtml('&#8203;');
				oldLi.setHtml(oldSpan.getOuterHtml());
				oldLi.appendBogus();
			}
			oldP.setHtml(oldLi.getOuterHtml());
		}else{
			var oldSpan = dojo.clone(oldP.getFirst());
			if(oldSpan){
				oldSpan.setAttribute("id", MSGUTIL.getUUID());
				oldSpan.setHtml('&#8203;');
				oldP.setHtml(oldSpan.getOuterHtml());
				oldP.appendBogus();
			}
		}
		
		return oldP;
 	},
 	
 	clearCellTextAndKeepStyle: function(cell){
 		if(!cell)
 			return null;
 		
 		cell = (cell.$) ? cell : new CKEDITOR.dom.node(cell);
 		var sonNode = cell.getFirst();
		if(!sonNode)
			return null;
		
		sonNode.setAttribute("id", MSGUTIL.getUUID());
		if(PresCKUtil.checkNodeName(sonNode, 'ol', 'ul')){ 
			//In this case, oldP is actually OL/UL node
			var liNode = sonNode.getFirst();
			liNode.setAttribute("id", MSGUTIL.getUUID());
			var spanNode = liNode.getFirst().clone(true, true);
			if(spanNode){
				spanNode.setAttribute("id", MSGUTIL.getUUID());
				spanNode.setHtml('&#8203;');
				liNode.setHtml(spanNode.getOuterHtml());
				liNode.appendBogus();
				sonNode.setHtml(liNode.getOuterHtml());
			}
		}else{
			var spanNode = sonNode.getFirst().clone(true, true);
			if(spanNode){
				spanNode.setAttribute("id", MSGUTIL.getUUID());
				spanNode.setHtml('&#8203;');
				sonNode.setHtml(spanNode.getOuterHtml());
				sonNode.appendBogus();
			}
		}
		cell.setHtml(sonNode.getOuterHtml());
		return sonNode;
 	},
 	
 	copyStyleForCells: function(sourceCell, targetCell){
 		if(!sourceCell || !targetCell)
 			return;
 			
 		sourceCell = (sourceCell.$) ? sourceCell : new CKEDITOR.dom.node(sourceCell);
 		targetCell = (targetCell.$) ? targetCell : new CKEDITOR.dom.node(targetCell);
 		
 		var sourceStyle = PresTableUtil.emptyCellTextAndKeepStyle(sourceCell);
 		sourceStyle.replace(targetCell.getFirst());
 		targetCell.setStyle('backgroundColor', sourceCell.getStyle('backgroundColor'));
 	},
 	
 	/**
 	 * return: 
 	 * 	true, update colgroup successfully; 
 	 * 	false, table structure broken, don't generate colgroup for this kind of table.
 	 */
 	updateTableColgroup: function(table, forceUpdate)
 	{
 		table = table.$ || table;
 		var colgrp = dojo.query('colgroup', table);
 		if(colgrp.length == 1){
 			if(!forceUpdate)
 				return true;
 			else
 				dojo.destroy(colgrp[0]);
 		}
 		
 		//step1, 
 		var mapBK = TableResizeUtil.buildTableMap(table).getMap();
 		if(mapBK.length < 1)
 			return false;
 		var rowCnt = mapBK.length, colAbsNum = mapBK[0].length; 
 		
		//step2, get the min width of each col
		var retWidthList = [], totalW = 0;
		for(var i = 0; i < colAbsNum; i++){
			var retWidth = Number.MAX_VALUE;
			for(var j = 0, len1 = mapBK.length; j < len1; j++){
				var cell = mapBK[j][i];
				if(!cell)
					continue;
				var width = parseFloat(cell.offsetWidth)||20;
				retWidth = Math.min(retWidth, width);
			}
			retWidthList.push(retWidth);
			totalW += retWidth;
		}
		
		//step3, create colgroup and get width in percentage.
		var doc = table.ownerDocument;
		var total1 = 0,
			colgrp = doc.createElement("colgroup");
		for(var i = 0; i < colAbsNum - 1; i++){
			var colNode = doc.createElement("col");
			dojo.attr(colNode, "id", MSGUTIL.getUUID());
			var widthPc = (((retWidthList[i]||20) / totalW) * 100).toFixed(2);
			total1 += parseFloat(widthPc);
			dojo.style(colNode, "width", widthPc + "%");
			colgrp.appendChild(colNode);
		}
		//in order to make sum of each col width equal to 100%, so there is a trick for the last column width
		var colNode = doc.createElement("col");
		dojo.attr(colNode, "id", MSGUTIL.getUUID());
		dojo.style(colNode, "width", (100 - total1).toFixed(2) + "%");
		colgrp.appendChild(colNode);
		
		dojo.attr(colgrp, "id", MSGUTIL.getUUID());
		table.insertBefore(colgrp, table.firstChild);
		
		//step4, remove witdth from TDs/THs.
		dojo.forEach(dojo.query('td, th', table), function(cell){
			dojo.style(cell, "width", "");
		});
		
		return true;
 	},
 	
 	getWidth: function( node )
	{
		if(!node)
			return 0;
		node = node.$ || node;
		if(dojo.isIE){
			return node.clientWidth || node.offsetWidth;
		}else{
			var ret = parseFloat( dojo.getComputedStyle(node)['width'], 10 ); 
				ret = ret.toFixed(2);
			return ret;
		}
	},
	
	getHeight: function(node)
	{
		if(!node)
			return 0;
		node = node.$ || node;
		if(dojo.isIE){
			return node.clientHeight || node.offsetHeight;
		}else{
			return Math.round(parseFloat( dojo.getComputedStyle(node)['height'], 10 ));
		}
	},

 	changePxToPercentForRowCell: function(table){
 		var rows = table.rows;
		var rowHList = [];
		var totalH = 0;
		var len = rows.length;
		
		if(len === 1){
			dojo.style(rows[0], "height", "100%");
		}else{
			for(var ri = 0; ri < len; ri++){
				var row = rows[ri];
				var rH = PresTableUtil.getHeight(row);
				rH = isNaN(rH) ? 10 : rH || 10;
				rowHList.push(rH);
				totalH += rH;
			}
			
			for(var ri = 0, len = rows.length; ri < len; ri++){
				var row = rows[ri];
				var rH = (rowHList[ri]/totalH) * 100;
				dojo.style(row, "height", rH + "%");
			}
		}
		
		var cells = rows[0].cells;
		var cellWList = [];
		var totalCellW = 0;
		var lenC = cells.length;
		if(lenC === 1){
			dojo.style(cells[0], "width", "100%");
		}else{
			for(var ci = 0; ci < lenC; ci++){
				var cell = cells[ci];
				var cW = parseFloat(dojo.style(cell, 'width') || "");
				cW = isNaN(cW) ? 0 : cW;
				cellWList.push(cW);
				totalCellW += cW;
			}
			
			for(var ci = 0, len = cells.length; ci < len; ci++){
				var cell = cells[ci];
				var cW = (cellWList[ci]/totalCellW) * 100;
				dojo.style(cell, "width", cW + "%");
			}
		}
		
		return table;
 	}
    
});

(function(){
	PresTableUtil = new concord.pres.PresTableUtil();
})();