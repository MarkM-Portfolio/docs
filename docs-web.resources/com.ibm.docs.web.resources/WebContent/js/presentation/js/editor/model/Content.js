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

dojo.provide("pres.editor.model.Content");
dojo.require("dojo.i18n");
dojo.require("pres.editor.model.TxtCell");

dojo.declare("pres.editor.model.Content", null, {

	mSelection: null,// To store selection
	mTxtCells: null,// To store all editing text and table cells model
	mSelectTxtCells: null, // To store selected cells, the value is from mTxtCells
	boxOwner: null,
	renderInfo: null,// To recode render information

	constructor: function()
	{
		this.DefPlaceholderString = dojo.i18n.getLocalization("concord.widgets", "slidesorter");
		this.boxOwner = null;
		this.mTxtCells = [];
		this.mSelectTxtCells = [];
		this.renderInfo = {
			enableIndicator: false
		};
	},

	destroy: function()
	{
		dojo.forEach(this.mTxtCells, function(tc, i)
		{
			tc.destroy();
		});
		this.boxOwner = null;
		this.mTxtCells = [];
		this.mSelectTxtCells = [];// if length >0 means we select in table
		this.renderInfo = {
			enableIndicator: false
		};
	},

	// Wrapper
	build: function(rootBox,bNewCreated)
	{
		var dom = rootBox.getEditNode();
		var tlines = dojo.query('ol,ul,p', dom);
		if (!tlines.length)
		{
			console.error("content.build could not find a paragraph from :" + dom);
			return;
		}
		this.mTxtCells = [];
		this.mSelectTxtCells = [];
		this.boxOwner = rootBox;
		var dom_containerNode = tlines[0].parentNode;
		if (EditorUtil.is(dom_containerNode, 'td', 'th'))
		{
			// we are in a table
			// build whole table as text model
			// find all td and th cell
			var tCells = dojo.query('td,th', dom);
			var tableElement = rootBox.element;
			var table = tableElement.table;
			for ( var i = 0; i < tCells.length; i++)
			{
				var txtCell = new pres.editor.model.TxtCell();
				txtCell.domID = tCells[i].id;
				txtCell.build(tCells[i], table.getCellById(txtCell.domID), true,null,bNewCreated);
				this.mTxtCells.push(txtCell);
			}
		}
		else
		{
			// textbox
			var txtCell = new pres.editor.model.TxtCell();
			txtCell.domID = dom_containerNode.id;
			txtCell.build(dom_containerNode, rootBox,null,null,bNewCreated);
			this.mTxtCells.push(txtCell);
		}
	},

	// the paragraphs all the children of rootDivDomNode
	render: function(targetCellModels,bForce)
	{
		var cellList = targetCellModels?targetCellModels:this.mTxtCells;

		for ( var i = 0; i < cellList.length; i++)
		{
			cellList[i].render(this.renderInfo,bForce);
		}
	},
	
	getModelCellsByDomId : function(idList)
	{
		var modelCells = [];
		for ( var i = 0; i < idList.length; i++)
		{
			for(var j = 0;j< this.mTxtCells.length ; j++)
			{
				if(idList[i] == this.mTxtCells[j].domID)
				{
					modelCells.push(this.mTxtCells[j]);
				}
			}
		}
	},

	// return a <div> node with <p/ol/ul> inside
	// the <div> is new dom fragment node, no relation ship with other dom node
	getSelectedContentModel: function()
	{
		var result = {};
		var dom_Root = null;
		var textCell = null;
		if (this.mSelectTxtCells.length > 1)
		{
			// for table cells selection
			var sElement = this.boxOwner.element;
			var sTable = sElement.table;
			var sCell = this.mSelectTxtCells[0];
			var eCell = this.mSelectTxtCells[this.mSelectTxtCells.length - 1];
			var startAbsIndex = sTable.getAbsCellIndex(sCell.domID);
			var endAbsIndex = sTable.getAbsCellIndex(eCell.domID);
			var startRowIndex = Math.min(startAbsIndex.rowIndex, endAbsIndex.rowIndex);
			var endRowIndex = Math.max(startAbsIndex.rowIndex, endAbsIndex.rowIndex);
			var startColIndex = Math.min(startAbsIndex.colIndex, endAbsIndex.colIndex);
			var endColIndex = Math.max(startAbsIndex.colIndex, endAbsIndex.colIndex);
			var tElement = sElement.clone();
			var tTable = tElement.table;
			var newcolWidths = [];
			var newW = 0;
			for ( var c = startColIndex; c <= endColIndex; c++)
			{
				var cw = parseFloat(tTable.colWidths[c]);
				newcolWidths.push(cw);
				newW += cw;
			}
			tTable.colWidths = newcolWidths;
			tElement.w = newW;
			var newRows = [];
			var newH = 0;
			for ( var r = startRowIndex; r <= endRowIndex; r++)
			{
				var row = tTable.rows[r];
				newH += parseFloat(row.h);
				var nCells = [];
				var orgCells = [];
				var trMap = sTable.map[r];
				var oj = 0;
				for(var j=0;j<trMap.length;j++){
					var trId = trMap[j];
					var oCell = row.cells[oj]||[];
					var oTrid = oCell.id;
					if(trId  == oTrid){
						orgCells.push(row.cells[oj]);
						oj ++;
					}
					else
					{
						orgCells.push(null);
					}
				}
				
				for ( var c = startColIndex; c <= endColIndex; c++)
				{
					var ncell = orgCells[c];
					nCells.push(ncell);
				}
				row.cells = nCells;
				newRows.push(row);
			}
			tTable.rows = newRows;
			tElement.h = newH;
			tElement.attr("style", tElement.getFinalStyle());
			var tHtml = tElement.getHTML();
			dom_Root = document.createElement('div');
			dom_Root.innerHTML = tHtml;
			result.dom = dom_Root;
			result.json = tElement;
			result.istable = true;
		}
		else if (this.mSelectTxtCells.length == 1)
		{
			var textCell = this.mSelectTxtCells[0];
		}
		else
		{
			var textCell = this.mTxtCells[0];
		}

		if (textCell)
		{
			dom_Root = textCell.renderSelectionAsDom();
			result.dom = dom_Root;
			result.json = textCell.getSelectionAsModel();
		}

		return result;
	},
	
	buildModelfromHtml : function(htmlContent)
	{
		if(!htmlContent)
			return null;
		var domRoot =  document.createElement('div');
		domRoot.innerHTML = htmlContent;
		var txtCell = new pres.editor.model.TxtCell();
		txtCell.txtBoxInfo = {
				verticalAligment: null,// textbox vertical-align //top/middle/bottom /null
				isTableCell: false,
				isPlaceholder: false,
				isSpeakerNotes: false,
				masterPageName: null,
				layoutName: null,
				placeholderType: null,
				placeholderIndex: null,
				absWidth: 10000,// unit is cmm (cm*1000)
				absHeight: 5000
			};
		txtCell.build(domRoot,null,null,true);
		
		var cloneHyperlinkStoreMap = [];
		for(var key in txtCell._hyperlinkStoreMap)
		{
			var node = txtCell._hyperlinkStoreMap[key];
			cloneHyperlinkStoreMap.push({id:key,html:node.outerHTML});
		}
		
		return {
			paragraphs : txtCell.paragraphs,
			hyperlinkmap : cloneHyperlinkStoreMap
		};
	},

	insertModel : function(jsonModel)
	{ 
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			//insert model into table
			//TODO
		}
		else
		{
			focusTxtCell.insertModel(jsonModel);		
		}
	},

	clearSelection: function()
	{
		this.mSelection = null;
		var textCell =  this.getFocusTxtCell();
		if (textCell)
		{
			textCell.selection.start.lineIndex = null;
			textCell.selection.start.lineTextOffset = null;
			textCell.selection.end.lineIndex = null;
			textCell.selection.end.lineTextOffset = null;
		}
	},

	updateSelection: function(selInfo)
	{
		function _getCellByID(id, cnt)
		{
			for ( var i = 0; i < cnt.mTxtCells.length; i++)
			{
				if (cnt.mTxtCells[i].domID == id)
					return cnt.mTxtCells[i];
			}
			return null;
		}

		this.mSelectTxtCells = [];
		if (selInfo.cells && selInfo.bCellUnit)
		{
			this.mSelection = {
				cells: selInfo.cells
			};

			for ( var i = 0; i < selInfo.cells.length; i++)
			{
				if (selInfo.cells[i])
				{
					var txtCell = _getCellByID(selInfo.cells[i].id, this);
					if (txtCell)
					{
						txtCell.selectAll();
						this.mSelectTxtCells.push(txtCell);
					}
				}
			}
		}
		else
		{
			// Txt selection
			var txtCell = this.mTxtCells[0];
			if (selInfo.cells && selInfo.cells.length == 1)
			{
				txtCell = _getCellByID(selInfo.cells[0].id, this);
				this.mSelectTxtCells.push(txtCell);
			}

			if(selInfo.startSelection)
				this.mSelection = txtCell.updateTxtSelection(selInfo);

			if (selInfo.cells && selInfo.cells.length == 1)
			{
				if(!this.mSelection)
				{
					this.mSelection = {
							cells: selInfo.cells
						};
				}
				else
					this.mSelection.cells = selInfo.cells;
			}

		}
	},
	
	updateSelectionByNaviKey : function(keyCode,keyboardStatus)
	{
		var txtCell =  this.getFocusTxtCell();
		if (!txtCell)
			return false;
		
		var para =  txtCell.paragraphs[txtCell.selection.start.lineIndex];
		if(!para)
			return false;
		
		if(dojo.isFF && keyboardStatus)
		{
			if(keyboardStatus.shiftKey)
				if(keyCode == dojo.keys.UP_ARROW 
				 ||keyCode == dojo.keys.DOWN_ARROW )
				{
					var bGoNextLine = (keyCode == dojo.keys.DOWN_ARROW);
					var focusParaIndex = bGoNextLine?
							txtCell.selection.start.lineIndex+1
							:txtCell.selection.start.lineIndex-1;
					var focusPara = txtCell.paragraphs[focusParaIndex];
					if(!focusPara)
						return true;
				}
		}
		
		if(dojo.isIE && keyboardStatus)
		{
			if(!keyboardStatus.shiftKey)
				if(keyCode == dojo.keys.UP_ARROW 
				 ||keyCode == dojo.keys.DOWN_ARROW )
				{
					var bGoNextLine = (keyCode == dojo.keys.DOWN_ARROW);
					var focusParaIndex = bGoNextLine?
							txtCell.selection.start.lineIndex+1
							:txtCell.selection.start.lineIndex-1;
					var focusPara = txtCell.paragraphs[focusParaIndex];
					if(!focusPara)
						return false;
					var str = focusPara.strContent;
					str = str.replace('\x20','');//" "
					str = str.replace('u200B','');//8203
					str = str.replace('\u00a0','');//nbsp
					if(str.length != 0)
						return false;
	
					txtCell.selection.start.lineIndex = focusParaIndex;
					var offset = txtCell.selection.start.lineTextOffset;
					txtCell.selection.start.lineTextOffset = offset>focusPara.strContent.length?focusPara.strContent.length:offset;
					
					txtCell.selection.bCollapsed=true;
					txtCell.selection.end.lineIndex = null;
					txtCell.selection.end.lineTextOffset = null;
					return true;
				}
			if(!keyboardStatus.shiftKey)
				if(keyCode == dojo.keys.RIGHT_ARROW 
				 ||keyCode == dojo.keys.LEFT_ARROW )
				{
					var bGoNextLine = (keyCode == dojo.keys.RIGHT_ARROW);
					var curPara = txtCell.paragraphs[txtCell.selection.start.lineIndex];
					var focusParaIndex = bGoNextLine?
							txtCell.selection.start.lineIndex+1
							:txtCell.selection.start.lineIndex-1;
					var focusPara = txtCell.paragraphs[focusParaIndex];
					if(!focusPara)
						return false;
					if(bGoNextLine)//down
					{
						if(txtCell.selection.start.lineTextOffset!=curPara.strContent.length)
							return false;
					}
					else//up
					{
						if(txtCell.selection.start.lineTextOffset!=0)
							return false;
					}
					
					txtCell.selection.start.lineIndex = focusParaIndex;
					var offset = txtCell.selection.start.lineTextOffset;
					txtCell.selection.start.lineTextOffset = bGoNextLine?0:focusPara.strContent.length;
					
					txtCell.selection.bCollapsed=true;
					txtCell.selection.end.lineIndex = null;
					txtCell.selection.end.lineTextOffset = null;
					return true;
				}
		}
		
		return false;

	},
	
	updateSelectionByMouse : function(clickTimes,mouseEvent)
	{
		function _isSplitChar(strChar)
		{
			var splitChar = ['\u00a0','\x20'];//'nbsp',' '
			for(var t=0;t<splitChar.length;t++)
			{
				if(strChar == splitChar[t])
					return true;
			}
			return false;
		}
		
		var txtCell = this.getFocusTxtCell();
		if (!txtCell)
			return false;
		var selInfo = txtCell.getViewSelectionInfo();
		if(!selInfo)
			return false;
		var para = txtCell.paragraphs[selInfo.startSelection.lineIndex];
		if (!para)
			return false;
		//double click, select word
		if(clickTimes == 2)
		{
			//Get the string from paragraph
			var str = para.strContent;
			//Get all softbreak offset
			var softBreakOffset = [];
			var totalLength = 0;
			for(var i=0;i<para.spanList.length;i++)
			{
				var span = para.spanList[i];
				if(span.bSoftBreak)
				{
					softBreakOffset[totalLength] = true;
				}
				totalLength+=span.length;
			}
			var startOffset = 0;
			var endOffset = str.length;
			for(var i=selInfo.startSelection.lineTextOffset;i<str.length;i++)
			{
				if(_isSplitChar(str.charAt(i)) || softBreakOffset[i])
				{
					endOffset = i;
					break;
				}
			}
			for(var i=selInfo.startSelection.lineTextOffset;i>=0;i--)
			{
				if(_isSplitChar(str.charAt(i)) || softBreakOffset[i])
				{
					startOffset = i+1;
					break;
				}
			}			
			
			selInfo.bCollapsed = (startOffset == endOffset)?true:false;
			selInfo.startSelection.lineTextOffset = startOffset;
			selInfo.endSelection = {
					lineIndex : selInfo.startSelection.lineIndex,
					lineTextOffset : endOffset
					};
			
			txtCell.updateTxtSelection(selInfo);
			return true;
		}
		else if(clickTimes >= 3)
		{
			//Trible click, select entire paragraph
			selInfo.bCollapsed = (para.strContent.length == 0)?true:false;
			selInfo.startSelection.lineTextOffset = 0;
			selInfo.endSelection = {
					lineIndex : selInfo.bCollapsed?null:selInfo.startSelection.lineIndex,
					lineTextOffset : selInfo.bCollapsed?null:para.strContent.length};
			txtCell.updateTxtSelection(selInfo);
			return true;
		}
		return false;
	},

	selectAll: function()
	{
		if (this.mSelectTxtCells.length > 0)
		{
			var curTxtBox = this.boxOwner;
			var tableElement = curTxtBox.element;
			var table = tableElement.table;

			// in table
			var modelCells = [];

			this.mSelectTxtCells = [];
			for ( var i = 0; i < this.mTxtCells.length; i++)
			{
				var txtCell = this.mTxtCells[i];
				txtCell.selectAll();
				modelCells.push(table.getCellById(txtCell.domID));
				this.mSelectTxtCells.push(txtCell);
			}

			this.mSelection = {
				cells: modelCells
			};
		}
		else
		// textbox
		{
			this.mTxtCells[0].selectAll();
		}
	},

	getSelection: function()
	{
		return this.mSelection;
	},
	
	getFocusTxtCell : function()
	{
		var txtCell = null;
		if (this.mSelectTxtCells.length > 1)
		{
			 return null;
		}
		else if (this.mSelectTxtCells.length == 1)
		{
			txtCell = this.mSelectTxtCells[0];
		}
		else
		{
			txtCell = this.mTxtCells[0];
		}
		
		return txtCell;
	},

	getViewTxtSelectionInfo: function()
	{
		var txtCell = this.getFocusTxtCell();
		if(!txtCell)
			return null;
		return txtCell.getViewSelectionInfo();
	},

	moveCursorToEditStart: function()
	{
		var txtCell =  this.getFocusTxtCell();

		if (txtCell)
		{
			txtCell.selection.start.lineIndex = 0;
			txtCell.selection.start.lineTextOffset = 0;
			txtCell.selection.end.lineIndex = null;
			txtCell.selection.end.lineTextOffset = null;
			txtCell.selection.bCollapsed=true;
		}
	},

	handleTabKey: function(bShift)
	{
		if (this.mSelectTxtCells.length > 1)
		{
			return;
		}
		var focusTxtCell =  this.getFocusTxtCell();
		focusTxtCell.handleTabKey(bShift);
	},
	
	handleSpaceKey: function()
	{
		if (this.mSelectTxtCells.length > 1)
		{
			return;
		}
		var focusTxtCell =  this.getFocusTxtCell();
		focusTxtCell.handleSpaceKey();
	},

	insertString: function(str, userId)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			this.handleDetete(false);
			focusTxtCell = this.mSelectTxtCells[0];
		}
		focusTxtCell.insertString(str, userId);
	},

	handleDetete: function(isBackSpace)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.handleDetete(false);
			});
			focusTxtCell = this.mSelectTxtCells[0];

			// update selection ......
			this.mSelectTxtCells = [];
			this.mSelectTxtCells.push(focusTxtCell);

			var cs = this.mSelection.cells;
			var len = cs.length;
			for ( var i = 0; i < len; i++)
			{
				if (cs[i].id == focusTxtCell.domID)
				{
					this.mSelection = {
						cells: [cs[i]]
					};
					break;
				}
			}
		}
		else
		{
			focusTxtCell.handleDetete(isBackSpace);
		}
	},

	handleEnter: function(bSoftBreak)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			this.handleDetete(false);
			focusTxtCell = this.mSelectTxtCells[0];
		}
		else
			focusTxtCell.handleEnter(bSoftBreak);
	},

	// if targetListClass == null, it means we need disable list
	toggleListStyle: function(targetListClass, bNumbering)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.toggleListStyle(targetListClass, bNumbering);
			});
		}
		else
			focusTxtCell.toggleListStyle(targetListClass, bNumbering);
	},

	indentList: function(isIndent)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.indentList(isIndent);
			});
		}
		else
			focusTxtCell.indentList(isIndent);
	},

	setLineSpaceValue:function(spaceValue)
	{		
		var focusTxtCell = this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells,function(tCell)
			{
				tCell.setLineSpaceValue(spaceValue);
			});
		}
		else
		{
			focusTxtCell.setLineSpaceValue(spaceValue);
		}
	},
	
	setHorizontalAlignment: function(align)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.setHorizontalAlignment(align);
			});
		}
		else
			focusTxtCell.setHorizontalAlignment(align);
	},

	setVerticalAlignment: function(align)
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.setVerticalAlignment(align);
			});
		}
		else
			focusTxtCell.setVerticalAlignment(align);
	},
	
	setTextDirection: function(direction)
	{
		var focusTxtCell = (this.mSelectTxtCells.length == 1) ? this.mSelectTxtCells[0] : this.mTxtCells[0];
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.setTextDirection(direction);
			});
		}
		else
			focusTxtCell.setTextDirection(direction);
	},
	
	doSpellCheck : function(forceAllCell)
	{
		if(forceAllCell)
		{
			dojo.forEach(this.mTxtCells, function(tCell)
					{
						tCell.doSpellCheck();
					});
		}
		else
		{
			var focusTxtCell =  this.getFocusTxtCell();
			if (this.mSelectTxtCells.length > 1)
			{
				dojo.forEach(this.mSelectTxtCells, function(tCell)
				{
					tCell.doSpellCheck();
				});
			}
			else
				focusTxtCell.doSpellCheck();
		}
	},
	
	stopSpellCheck : function()
	{
		dojo.forEach(this.mTxtCells, function(tCell)
				{
					tCell.stopSpellCheck();
				});
	},
	
	isSpellCheckComplete : function(forceAllCell)
	{
		var re = true;
		if(forceAllCell)
		{
			dojo.forEach(this.mTxtCells, function(tCell)
					{
						var t = tCell.isSpellCheckComplete();
						if(!t)
							re = t;
					});
		}
		else
		{
			var focusTxtCell =  this.getFocusTxtCell();
			if (this.mSelectTxtCells.length > 1)
			{
				dojo.forEach(this.mSelectTxtCells, function(tCell)
				{
					var t = tCell.isSpellCheckComplete();
					if(!t)
						re = t;
				});
			}
			else
				re = focusTxtCell.isSpellCheckComplete();
		}
		

		return re;
	},
	
	getCurEditingSpanModel : function()
	{
		if (this.mSelectTxtCells.length > 1)
			return null;
		var focusTxtCell =  this.getFocusTxtCell();
		return focusTxtCell.getCurEditingSpanModel();
	},
	
	// replace wrong word with suggestions , all: indicates all or just current selection word
	replaceWithSuggestion: function(sugg, all)
	{
		if (this.mSelectTxtCells.length > 1)
			return null;
		var focusTxtCell =  this.getFocusTxtCell();
		
		var re = focusTxtCell.replaceWithSuggestion(sugg, all);

		return re;
	},

	setTextStyle: function(styleName, styleValue)
	{
		var re = null;
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				tCell.setTextStyle(styleName, styleValue, true);
			});
			
			re = true;
		}
		else
			re = focusTxtCell.setTextStyle(styleName, styleValue, true);
		return re;
	},
	
	insertChangeHyperLink : function(strHyperlink,insertStr)
	{		
		var re = null;
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			//multi cell selection
			dojo.forEach(this.mSelectTxtCells, function(tCell)
			{
				var t = tCell.insertChangeHyperLink(strHyperlink,insertStr);
				if(!re)
					re = t;
			});
		}
		else
		{
			re = focusTxtCell.insertChangeHyperLink(strHyperlink,insertStr);
		}
		return re;
	},
	
	isEmptyPlaceHolder:function()
	{
		var focusTxtCell =  this.getFocusTxtCell();
		if (this.mSelectTxtCells.length > 1)
		{
			return false;
		}
		else
		{
			if(!focusTxtCell.txtBoxInfo.isPlaceholder)
				return false;
			
			for(var i=0;i<focusTxtCell.paragraphs.length;i++)
			{
				var para = focusTxtCell.paragraphs[i];
				if(para.strContent.length>0)
					return false;
			}
			
		}
		return true;
	},
	
	restoreDefaultPlaceHolder:function()
	{
		var focusTxtCell = this.mTxtCells[0];
		
		var presClass = focusTxtCell.txtBoxInfo.placeholderType;
		if(!presClass || 
				!(
						(presClass == 'title')
						||(presClass == 'subtitle')
						||(presClass == 'notes')
						||(presClass == 'outline')
						||(presClass == 'graphic')
						)
		)
		return;
		var classType = null;
		var strPlaceHodler = null;
		switch(presClass)
		{
			case 'title':
				classType = pres.constants.CONTENT_BOX_TITLE_CLASS;
				strPlaceHodler = this.DefPlaceholderString.layout_clickToAddTitle;
				break;
			case 'subtitle':
				classType = pres.constants.CONTENT_BOX_SUBTITLE_CLASS;
				if(this.boxOwner.element.parent.attrs['presentation_presentation-page-layout-name'] == "ALT32")
					strPlaceHodler = this.DefPlaceholderString.layout_clickToAddOutline;
				else
					strPlaceHodler = this.DefPlaceholderString.layout_clickToAddText;
				break;
			case 'outline':
				classType = pres.constants.CONTENT_BOX_OUTLINE_CLASS;
				strPlaceHodler = this.DefPlaceholderString.layout_clickToAddOutline;
				break;
			case 'graphic':
				classType = pres.constants.CONTENT_BOX_GRAPHIC_CLASS;
				strPlaceHodler = this.DefPlaceholderString.layout_doubleClickToAddGraphics;
				break;
			case 'notes':
				classType = pres.constants.CONTENT_BOX_NOTES_CLASS;
				strPlaceHodler = this.DefPlaceholderString.layout_clickToAddSpeakerNotes;
				break;
		}
		
		var para = focusTxtCell.paragraphs[0];
		focusTxtCell.paragraphs = [];
		focusTxtCell.paragraphs.push(para);
		para.clsPreserve.push(classType);
		para.clsPreserve.push('defaultContentText');
		para.strContent = strPlaceHodler;
		para.renderDirty = true;
		var span = para.spanList[0];
		span.hyperLinkId = null;
		para.spanList = [];
		para.spanList.push(span);
		span.length = strPlaceHodler.length;
		span.bSoftBreak = false;
		focusTxtCell.renderDirty = true;
	},
	
	getCurHyperLink : function(bOnlyCheckCollapsed)
	{
		//<a alt="" class="text_a" target="_new" id="a_id_212" xlink_href="ppaction://hlinkshowjump?jump=previousslide"
		//<a alt="" class="text_a" target="_new" id="a_id_219" xlink_href="slide3.xml"  >
		//<a alt="" class="text_a" target="_new" id="a_id_207" href="http://www.asd.com/">
		//<a alt="" class="text_a" target="_new" id="a_id_220" href="mailto:qwe@cn.com?subject=aavv">
		var focusTxtCell =  this.getFocusTxtCell();
		if(!focusTxtCell)
			return null;
		return focusTxtCell.getCurHyperLink(bOnlyCheckCollapsed);
	}

});
