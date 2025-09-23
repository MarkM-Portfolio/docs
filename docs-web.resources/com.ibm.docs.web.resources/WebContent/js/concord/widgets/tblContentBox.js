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
 * @tblContentBox.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.tblContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.mContentBox");
dojo.require("concord.widgets.presCellPropertiesDlg");

dojo.requireLocalization("concord.widgets","tblContentBox");
dojo.requireLocalization("concord.widgets","presPropertyDlg");
dojo.declare("concord.widgets.tblContentBox", [concord.util.browser.isMobile() ? concord.widgets.mContentBox : concord.widgets.contentBox], {
	
	constructor: function(opts) {
		//console.log("tblContentBox:constructor","Entry");
		if (opts){
			this.imageUrl = (this.opts.imageUrl)? this.opts.imageUrl : this.DEFAULT_IMAGE_URL;
		}
		this.init();
		//console.log("tblContentBox:constructor","Exit");
	},

	contentType: null,
	attachedStyleStateChange: false,
	DEFAULT_IMAGE_URL: "",
	DEFAULT_TEXT_CONTENT: "",
	imageUrl: null,
	cellPropertiesDlg : null,
	eventListeners : [],
	colResizer: null,
	trResizer: null,
	resizeOnmouseMoveConnect : null,
	defaultPosition	:{'left':'200','top':'300','width':'200','height':'200'}, // Default position when object in created in px
	
	init: function(){
		//console.log("tblContentBox:init","Entry");
		this.defaultPosition.left = this.PercentToPx("50", 'width')- (this.defaultPosition.width/2) ;
		this.defaultPosition.top = this.PercentToPx("50", 'height')- (this.defaultPosition.height/2) ;
		this.inherited(arguments);
		this.contentBoxType = PresConstants.CONTENTBOX_TABLE_TYPE;
		this.subscribeToEvents();
		this.setPresRowHeight();
		//console.log("tblContentBox:init","Exit");
	},
	
	subscribeToEvents: function(){
	  // unsubscribe if we're already subscribed...
	  this._unsubscribeEvents( );
	  
	  this.eventListeners.push(
		concord.util.events.subscribe(concord.util.events.presMenubarEvents, null, dojo.hitch(this,this.handleSubscriptionEvents))
	  );
	},
	
	handleSubscriptionEvents: function(data){
		if (data.eventName==concord.util.events.presMenubarEvents_eventName_moveSTRowUp){
			if (this.editModeOn){
				this.editor.execCommand('moveSTRowUp');
			}
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_moveSTRowDown){
			if (this.editModeOn){
				this.editor.execCommand('moveSTRowDown');
			}
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_AddSTRowAbv){
			if (this.editModeOn){
				this.editor.execCommand('insertRowBefore', data.rowNum);
			}
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_AddSTRowBlw){
			if (this.editModeOn){
				this.editor.execCommand('insertRowAfter', data.rowNum);
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_DelSTRow){
			if (this.editModeOn){
				this.editor.execCommand('delCurrRow');
				// menu items may become shown or hidden
				this.enableMenuItemsOnEdit();
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_AddSTColBfr){
			if (this.editModeOn){
				this.editor.execCommand('insertColBefore', data.colNum);
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_AddSTColAft){
			if (this.editModeOn){
				this.editor.execCommand('insertColAfter', data.colNum);
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_moveSTColLeft){
			if (this.editModeOn){
				this.editor.execCommand('moveSTColLeft');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_moveSTColRight){
			if (this.editModeOn){
				this.editor.execCommand('moveSTColRight');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_moveSTColRight){
			if (this.editModeOn){
				this.editor.execCommand('moveSTColRight');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_sortSTColAsc){
			if (this.editModeOn){
				this.editor.execCommand('sortSTColAsc');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_sortSTColDesc){
			if (this.editModeOn){
				this.editor.execCommand('sortSTColDesc');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_DelSTCol){
			if (this.editModeOn){
				this.editor.execCommand('delCurrCols');
				// menu items may become shown or hidden
				this.enableMenuItemsOnEdit();
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_clearCellContent){
			if (this.editModeOn){
				this.editor.execCommand('clearSTCellContent');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_leftAlignCellContent){
			if (this.editModeOn){
				this.editor.execCommand('leftAlignSTCellContent');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_centerAlignCellContent){
			if (this.editModeOn){
				this.editor.execCommand('centerAlignSTCellContent');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_rightAlignCellContent){
			if (this.editModeOn){
				this.editor.execCommand('rightAlignSTCellContent');
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_hidetablecaption){
			if (this.editModeOn){
				this.changeDivHeightToTableHeight();
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_showtablecaption){
			if (this.editModeOn){
				this.changeDivHeightToTableHeight();
			}
		}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_addtablerow){
			if (this.editModeOn){
				this.changeTableHeight(data.height, data.diffHeight);
			}
		}
		else if (data.eventName==concord.util.events.presMenubarEvents_eventName_deletetablerow){
			if (this.editModeOn){
				this.changeTableHeight(data.height, data.diffHeight);
			}
		}else if(data.eventName==concord.util.events.presMenubarEvents_eventName_changedrawframesize){
				//change the table and drawframe width in edit mode
			this.changeDrawFrameWidth(data);
		}
		else if (data.eventName==concord.util.events.presMenubarEvents_eventName_changesize){
			//synchronize the column(s) and draw frame width to sorter and server.
			this.synchWidth(data);
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_addTableStyle){
			this.addTableStyle(data);
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_addCustomTableStyle){
			this.addCustomTableStyle(data);
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_customTableDialogLaunched){
			this.customTableDialogLaunched(data);
		} else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchCellPropertyDlg){
			this.launchCellPropertiesDialog(data);
		}
		else if (data.eventName==concord.util.events.presMenubarEvents_eventName_ResizeSTCol) {
		  if (this.editModeOn) {
			if ( dojo.isIE){
				// fix for defect 46764	[IE][Table]Resize table column not work when use menu
				document.onmousedown=this.MOUSEDOWN;
			}
		    this.editor.execCommand('presResizeColToggle');
		  }
		}
		
	},
	
	/**
	 * called in two scenarios:
	 * 1, create a new table(plain or style), do NOT need to create message here
	 * 2, apply style to existing table, do need to create rn message here
	 * @param data
	 */
	addTableStyle:function(data){
		var tableArray = [];
		if ( this.isSpare != true && this.contentBoxDataNode != null && this.boxSelected){
			tableArray.push( this.contentBoxDataNode);
			this.mainNode.focus();
			if (this.editor && this.editor.document!=null){
				var tblInCk =  dojo.query('table',this.editor.document.$.body)[0];
				if ( tblInCk.id == this.contentBoxDataNode.id){
					tableArray.push( tblInCk);
				}
			}
			
			if(tableArray.length > 0){
				var msgPair = [];
				var divId = this.mainNode.id;
				var msg = null;
				if(divId.indexOf("SPR") >= 0)
					return;
				
				//Do not need to create rn message for create new table(which should be an ie message)
				if(!data.isNewTable){
					msg = SYNCMSG.createPresDelInsertElementAct(divId, "delete");
					msg && msgPair.push(msg);
				}
				
				//apply the style to table
				var executeAddTableStyle = dojo.hitch(data.addTableStyleData, "applyNewTableStyle", tableArray,
						data.addTableStyleData.tableStyleClass);
				executeAddTableStyle();
				
				//update sorter
				this.publishInsertNodeFrame(null, true);
				
				if(!data.isNewTable){
					msg = SYNCMSG.createPresDelInsertElementAct(divId, "insert");
					msg && msgPair.push(msg);

					msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, msgPair);
					SYNCMSG.sendMessage([msgPair], SYNCMSG.NO_LOCAL_SYNC);
				}
				
			}
		}
	},
	addCustomTableStyle:function(data){
		var tableArray = [];
		if ( this.isSpare != true && this.contentBoxDataNode != null && this.boxSelected){
			tableArray.push( this.contentBoxDataNode);
			this.mainNode.focus();
			if (this.editor && this.editor.document!=null){
				var tblInCk =  dojo.query('table',this.editor.document.$.body)[0];
				if ( tblInCk.id == this.contentBoxDataNode.id){
					tableArray.push( tblInCk);
				}
			}
			
			if(tableArray.length > 0){
				var msgPair = [];
				var divId = this.mainNode.id;
				var msg = null;
				//D42731: [IE][FF]Need repair after enable then disable border color via custom table dialog
				if(divId.indexOf("SPR") >= 0)
					return;
				//Do not need to create rn message for create new table(which should be an ie message)
				if(!data.isNewTable){
					msg = SYNCMSG.createPresDelInsertElementAct(divId, "delete");
					msg && msgPair.push(msg);
				}
				
				//apply the style to table
				var executeAddTableStyle = dojo.hitch(data.addTableStyleData, "applyNewTableStyle", tableArray,
						data.addTableStyleData.tableStyleClass, data.addTableStyleData.tableCaption );
				executeAddTableStyle();
				
				//update sorter
				this.publishInsertNodeFrame(null, true);
				
				if(!data.isNewTable){
					msg = SYNCMSG.createPresDelInsertElementAct(divId, "insert");
					msg && msgPair.push(msg);
		
					msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, msgPair);
					SYNCMSG.sendMessage([msgPair], SYNCMSG.NO_LOCAL_SYNC);
				}
				
			}
		}
	},
	customTableDialogLaunched:function(data){
		if ( this.contentBoxDataNode != null && this.boxSelected){
			var initializeDialogData = dojo.hitch(data.tableStyleData, "initializeDialogData", this.contentBoxDataNode);
			initializeDialogData();
		}
	},
	
	launchCellPropertiesDialog:function(data){
		if ( !this.spr && this.contentBoxDataNode != null && this.boxSelected){
				if(this.cellPropertiesDlg==null){
					this.cellPropertiesDlg=new concord.widgets.presCellPropertiesDlg(this,dojo.i18n.getLocalization("concord.widgets","presPropertyDlg").cellTitle, null, null);
				}
				this.cellPropertiesDlg.show();
		}
	},
	//synchronize the column(s) and draw frame width to sorter and server.
	synchWidth:function(data){
		if ( data.adjustTotalHeight){
			this._update();
		}
		if(!data.isApplied)
			{
				data.isApplied = this.handleAttributeChange("cs");
				if(data.isApplied)
				{
					this.changeColWidth(data.content);
					var msgs = SYNCMSG.endRecord();
					if(msgs.length > 0) {
						SYNCMSG.sendMessage(msgs);
					}
				}
			}
	},
	//Change the draw frame and column(s) width for edit and view mode without send msg
	//Only for resize column width.
	changeDrawFrameWidth:function(data){
		if ( data.st.id == this.contentBoxDataNode.id ){
			if(!data.isApplied) {
				var node = dojo.byId(this.mainNode.id);
				if(node!=null){
					var totalwidth = data.st.offsetWidth;
					dojo.style(data.st,{
						'width':totalwidth+data.diffWidth+"px"
					});
					//reset the view mode table width
					dojo.style(this.contentBoxDataNode,{
					  'width':totalwidth+data.diffWidth+"px"
					});
					data.isApplied = true;
				}
			}
			this.changeDivWidthToTableWidth(data.st);
		}
	},
	//synchronize the column(s) width to server
	changeColWidth: function(content){
		var actList = [];
		var firstRow = content[0].obj.getParent();
   		var noOfCols = firstRow.getChildCount();
   		var diffWidth = 0;
   		var idArray = {};
   		for(var i = 0;i < content.length;i++)
   		{
   			idArray[content[i].obj.getId()] = content[i].oldWidth;
   			diffWidth += parseFloat(content[i].obj.getStyle('width')) - parseFloat(content[i].oldWidth);
   		}
   		//var oldTableWidth = firstRow.$.offsetWidth - diffWidth;
   		var oldTableWidth = firstRow.$.offsetParent.offsetWidth - diffWidth;
   		for(var j=0; j<noOfCols; j++){
   			var curCell = firstRow.getChild(j);
   			var oldColWidth;
   			if(idArray[curCell.getId()])
   				oldColWidth = parseFloat(idArray[curCell.getId()]);
   			else
   				oldColWidth = parseFloat(curCell.getStyle('width'));
   			actList.push(SYNCMSG.createAttributeAct( curCell.getId(), null,
   			//'width:' + (parseFloat(curCell.getStyle('width'))/firstRow.$.offsetWidth)*100+"%" + ';',
   			'width:' + parseFloat(curCell.getStyle('width'))+"%" + ';',
   			//null,'width:' +(oldColWidth/oldTableWidth)*100+"%"+';'));
   			null,'width:' +oldColWidth+"%"+';'));
   		}
   		var msgPairs = [];
   		msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, actList));
   		SYNCMSG.sendMessage(msgPairs);
	},
	
	//synchronize the column(s) width to server for insert or delete column(s)
	//Height also needs to be taken into account as the content of a cell could wrap
	changeTableWidth: function(widths,diffWidth,currentTableWidth, currentTableHeight){

		if (this.editor){
			//console.log("tableWidth --> " + currentTableWidth + ", height --> " + currentTableHeight);
			var totalwidth=0;
				for(var i=0;i< widths.length;i++){
					totalwidth=totalwidth+widths[i];
				}
				
				var tblInCK =  dojo.query('table',this.editor.document.$.body)[0];
				//reset the edit mode table width
				dojo.style(tblInCK,{
					'width':currentTableWidth+"px"
				});
				//console.log("width style for CK " + dojo.style(tblInCK, 'width'));
				//reset the view mode table width
				dojo.style(this.contentBoxDataNode,{
					'width':currentTableWidth+"px"
				});
				
				//reset the edit mode table height
				dojo.style(tblInCK,{
					'height':currentTableHeight+"px"
				});
				//reset the view mode table height
				dojo.style(this.contentBoxDataNode,{
					'height':currentTableHeight+"px"
				});

				//after div width is resized reset the width of the table back to percentage
				dojo.style(tblInCK,{
					'width':'100%'
				});
				dojo.style(this.contentBoxDataNode,{
					'width':'100%'
				});
				
				//after div height is resized reset the height of the table back to percentage
				dojo.style(tblInCK,{
					'height':'100%'
				});
				dojo.style(this.contentBoxDataNode,{
					'height':'100%'
				});

				var rows=tblInCK.rows;
				var actList = [];
				var i = 0; // only do 1st row.  Issue with colspans??
				for(var j=0;j<rows[i].childNodes.length;j++)
				{
					var cellW = widths[j] || PresConstants.MIN_COL_WIDTH;
					dojo.style(rows[i].childNodes[j],'width',((cellW/totalwidth)*100)+"%");
				}
				
				var heightVal = this.getDataTotalHeight(true);
				dojo.style(this.mainNode,{
					'height':this.PxToPercent(heightVal,'height')+"%"
				});
				
				this.updateHandlePositions(true);
		}
	},
	//synchronize the row(s) height to server for insert or delete row(s)
	changeTableHeight: function(heights,diffHeight){
			
		if (this.editor){
			var totalheight=0;
				for(var i=0;i< heights.length;i++){
					totalheight=totalheight+heights[i];
				}
				
				var tblInCK =  dojo.query('table',this.editor.document.$.body)[0];
				//reset the edit mode table height
				dojo.style(tblInCK,{
					'height':totalheight+"px"
				});
				
				//reset the view mode table height
				dojo.style(this.contentBoxDataNode,{
					'height':totalheight+"px"
				});
				this.changeDivHeightToTableHeight(false);
				//after div height is resized reset the width of the table back to percentage
				dojo.style(tblInCK,{
					'height':'100%'
				});
				dojo.style(this.contentBoxDataNode,{
					'height':'100%'
				});
				
				var rows=tblInCK.rows;
				var actList = [];
				for(var i=0;i< rows.length;i++){
					dojo.style(rows[i],'height',((heights[i]/totalheight)*100)+"%");
				}

		}
	},
	//Change the draw frame width in edit mode and view mode
	changeDivWidthToTableWidth: function(smartTable, NotAdjustBorder){
		var node = dojo.byId(this.mainNode.id);
		if(node!=null){
			if(this.parentNode==null)
				this.parentContainerNode = node.parentNode;
			var tbl;
			if(smartTable!=undefined)
				tbl = smartTable;
			else
				tbl = dojo.query('table',this.editor.document.$.body)[0];
			var widthVal = tbl.offsetWidth;
			dojo.style(this.mainNode,{
				'width':this.PxToPercent(widthVal,'width')+"%"
			});
			this._update();
		}
	},
	//Change the draw frame height in edit mode and view mode
	changeDivHeightToTableHeight: function(NotAdjustBorder){
		
		var heightVal = this.getDataTotalHeight(true);
		dojo.style(this.mainNode,{
			'height':this.PxToPercent(heightVal,'height')+"%"
		});
		
		this._update();
	},
	_update:function(notUpdatePresRowHeight){	
		if (dojo.isIE) this.adjustContentDataSize();
		if ( this.editor){
			this.updateCKBodyHeight();			
			this.updateCKBodyWidth();
			this.updateEditSizeToFitMainContainer();
			if(!notUpdatePresRowHeight){
				this._updatePresRowHeight(true);
			}
		}
		
		this._updateTableOnEditResize();
		
		this.updateHandlePositions(true);
			
		this.updateTableSize(true);
	},
	
	/**
	 * This API should be called when:
	 * 	1, resized by contentbox handlers
	 *  2, resized by row/col handlers
	 *  3, resized by preContentBoxPropDlg
	 *  
	 * And, pls be noted that resized by presCellPropertiesDlg not going here to udpate presrowheight.
	 * presrowheight is "1000 * trHeight(px) / slideEditorMainNode Page Height(px)"
	 * @param updatePresRowHeight
	 */
	_updatePresRowHeight: function(updatePresRowHeight){
		
		if(updatePresRowHeight){
			
			var rowMap = {};
			if(concord.util.browser.isMobile())
				this.contentBoxDataNode.style.display = "";
			//step1, update spre table
			var slideEditorMainNode = pe.scene.slideEditor.mainNode;
			var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
			dojo.query('tr', this.contentBoxDataNode).forEach(function(tr){
				var trH = dojo.isIE? tr.offsetHeight : dojo.style(tr, "height");
				var rowId = tr.id;
				dojo.attr(tr, {
					'presrowheight': trH * 1000 / slideEditorHeightinPX
				});
				rowMap[rowId] = trH;
			});
			if(concord.util.browser.isMobile())
				this.contentBoxDataNode.style.display = "none";
			
			//step2, update view mode table
			var dfNodeId = this.mainNode.id + "SPR";
			var viewDFNode = dojo.byId(dfNodeId); //view mode table node
			if(viewDFNode){
				dojo.query('tr', viewDFNode).forEach(function(tr){
					var rowId = tr.id;
					rowId = rowId.replace("SPR", "");
					dojo.attr(tr, {
						'presrowheight': rowMap[rowId] * 1000 / slideEditorHeightinPX
					});
				});
			}
			
			//step3, update edit mode table
			var editTable = this.editor && this.editor.document.getBody().$.firstChild;
			if(editTable){
				dojo.query('tr', editTable).forEach(function(tr){
					var rowId = tr.id;
					dojo.attr(tr, {
						'presrowheight': rowMap[rowId] * 1000 / slideEditorHeightinPX
					});
				});
			}
		}
		
		this.updateViewTableSize();
	},
	
	/**
	 * 
	 * @param table
	 */
	updateViewTableNodeWithCKNode: function(){
		if(!this.isEditModeOn())
			return;
		
		try{
			var viewTable = this.contentBoxDataNode.firstChild;
			var editTable = this.editor.document.$.body.firstChild;
			var clonedTable = dojo.clone(editTable);
			this.contentBoxDataNode.replaceChild(clonedTable,viewTable);
		}catch(e){
			console.log("Err: update view table failed!");
		}
	},
	
	//synchronize the draw frame attributes to server.
	handleAttributeChange: function(type){
		var id = this.mainNode.id;
		var attrName  = 'style';
		
		var node = dojo.byId(id);
		if(node!=null){
		if(type=='cs')
			SYNCMSG.beginRecord();
		if (type != 'cs')
		  node = this.adjustPositionForBorder(node,true);
				
		var attrValue = dojo.attr(node,attrName);
		if ((dojo.isIE) && (attrValue.cssText)) {
			attrValue = attrValue.cssText;
		}
		if (attrValue && attrValue.charAt(attrValue.length-1) != ';')
			attrValue = attrValue + ";";
 		var data = {'id':id,'attributeName':'style','attributeValue':attrValue};
		var attrObj = SYNCMSG.getAttrValues(data,PROCMSG._slideSorter.editor.document.$);
		//send coedit
		act = SYNCMSG.createAttributeActForResizing(data.id, attrObj.newAttrValue, attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue,type);
		var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,[act]);
		var msgPairsList = [];
		msgPairsList.push(msg);
		SYNCMSG.sendMessage(msgPairsList, SYNCMSG.SYNC_SORTER);
		return true;
		}
		return false;
	},
	// fix for defect 5920 use contentBox method instead of overriding
	//getBorderAdjustment: function( onExit ) {
	//  return 0;
	//},
	// Sets the data of the contentBox. This needs to be implemented by the subclass
	setContentData: function(){
		//console.log("tblContentBox:setContentData","Entry");
		if (this.createFromLayout){
			this.isEmptyCBPlaceholder=true;
			dojo.addClass(this.mainNode,'layoutClass');
			var dataNode = this.contentBoxDataNode = document.createElement('div');
			this.mainNode.appendChild(dataNode);
				
				var defaultImg = document.createElement('img');
				defaultImg.src = this.DEFAULT_IMAGE_URL;
				dojo.addClass(defaultImg,'defaultContentImage');
				dataNode.appendChild(defaultImg);
				//Adding inline style here so that it can be also applied when this contentBOx is in slide sorter
				dojo.style(defaultImg,{
					'position':'absolute',
					'border':'0 none',
					'left':'39%',
					'top':'39%',
					'margin':'0',
					'opacity':'0.5',
					'padding':0,
					'height':'25%',
					'width':'25%'
				});
				dojo.setAttribute(defaultImg,'alt', '');
				
				var divTxt = document.createElement('div');
				divTxt.appendChild(document.createTextNode(this.DEFAULT_TEXT_CONTENT));
				dojo.addClass(divTxt,'defaultContentText');
				//Adding inline style here so that it can be also applied when this contentBOx is in slide sorter
				dojo.style(divTxt,{
					'position':'absolute',
					'border':'0',
					'padding':'0',
					'text-align':'center',
					'top':'5%',
					'width':'100%'
				});
				dataNode.appendChild(divTxt);
				this.updateBorder();
				this.updatedClassesForODP(this.layoutInfo.layoutFamily);
		} else if (this.newBox){
			var dataNode = this.contentBoxDataNode = document.createElement('img');
			this.mainNode.appendChild(dataNode);
			dataNode.src = this.imageUrl;
			this.updatedClassesForODP("graphic");
		}
	
		//console.log("tblContentBox:setContentData","Exit");
	},
	
	/**
	 * In chrome/safari, double/triple click in the spare space of a cell would make two cell highlighted
	 * (current cell and next one either in the same row or the next row)
	 * Three situations to handle: 4*4 table
	 * 1, dbclick/triple in cell(2,1) ~ cell(2,3)
	 * 2, dbclick/triple in last cell of a row, like cell(2,4) 
	 * 3, dbclick/triple in spare space of cell(4,4)
	 * 
	 * This function adjust broswer behavior to meet user expectation.
	 */
	selectThisBox: function(e, commentId){
		if(e && e.data && e.data.$ && (dojo.isChrome || dojo.isSafari)){
			
			//in FF: clickCount = [1,2,3] (1: single click; 2: dbclick; 3: triple click;)
			//in chrome/safari: clickCount = [1,2,3,4,5,....]
			var clickCount = e.data.$.detail; 
			if((clickCount >= 2))
				PresTableUtil.shrinkSelectionToTD(this.editor);
		}
		this.inherited(arguments);
	},

	//
	// Sets border and resize nodes around box to show that it has been deselected
	//
	deSelectThisBox: function(e){
		this.disableRowColumnResize();
		this.inherited(arguments);
	},

/*
	//
	// handles cleaning up after editor closes
	//
	processEditorClose: function(){
		this.inherited(arguments);
		this.cleanTableNode();
	},
	
	//
	// This places tbody and colgroup children back under content data node
	// and gets rid of the temp table node
	//
	cleanTableNode: function(){
//		var colGroup = dojo.query('colgroup',this.mainNode)[0];
//		this.contentBoxDataNode.appendChild(colGroup);

		var tbody = dojo.query('tbody',this.mainNode)[0];
		this.contentBoxDataNode.appendChild(tbody);
		
		var tables = dojo.query('table',this.mainNode);
		try{
			tables[1].parentNode.removeChild(tables[1]);
		}catch(e){
		}
		
		
	},
	*/
	//
	// Updates Table size while in editing
	//
	updateTableSize: function(){
		if (this.editor){
			var tblInCK =  dojo.query('table',this.editor.document.$.body)[0];
			dojo.style(tblInCK,{
				'height': this.getTableHeightPercent(true),
				'width' :'100%'
			});
			tblInCK = null;
		}
	},
	updateViewTableSize: function(){
		if (dojo.isIE) return;
		var tbl =  this.contentBoxDataNode;
			dojo.style(tbl,{
				'height': this.getTableHeightPercent(),
				'width' : '100%'
			});
			tbl = null;
	},
	

	getTableHeightPercent: function(inCK){
		var tbl;
		if(inCK)
			tbl =  dojo.query('table',this.editor.document.$.body)[0];
		else
			tbl=this.contentBoxDataNode;
			
		
		var children = tbl.children;
		for(var i=0; i<children.length; i++){
			
			if(children[i].nodeName=='CAPTION')  {
					var captionHeight=children[i].offsetHeight;
					//no matter if the table in CK, the table height should same with mainNode
					var mainNodeHeight=dojo.style(this.mainNode,'height');
					return  (((mainNodeHeight-captionHeight)/mainNodeHeight)*100)+'%';
					//return mainNodeHeight-captionHeight +'px'
			}
			
		}
		tbl = null;
		children = null;
		return '100%';
		
	},
	keydownHandler:function(event){
		this.inherited(arguments);
		var keystroke = event && event.data.getKeystroke();
		//CK3621 CTRL+A will be handled by another component
	    //if ( keystroke == CKEDITOR.CTRL + 65 ) //CTRL+A
	    //{
	      //var eventData = [ { eventName: concord.util.events.needSolveEvents_CtrlAPressed, event: event, editor: this.editor } ];
	      //concord.util.events.publish(concord.util.events.needSolveEvents, eventData);
	      //return;
	    //}
		    
		switch ( keystroke )
		{
			// LEFT-ARROW
			case 37 :
				var eventData = [ { eventName: concord.util.events.needSolveEvents_tableLeftArrowPressed, event:event, editor:this.editor } ];
				concord.util.events.publish(concord.util.events.needSolveEvents, eventData);
				break;
			// UP-ARROW
			case 38 :
				var eventData = [ { eventName: concord.util.events.needSolveEvents_tableUpArrowPressed, event:event, editor:this.editor } ];
				concord.util.events.publish(concord.util.events.needSolveEvents, eventData);
				//if(isFirstRow(editor))
				//	event.data.preventDefault();
				break;
			// RIGHT-ARROW
			case 39 :
				var eventData = [ { eventName: concord.util.events.needSolveEvents_tableRightArrowPressed, event:event, editor:this.editor } ];
				concord.util.events.publish(concord.util.events.needSolveEvents, eventData);
				break;
			// DOWN-ARROW
			case 40 :
				var eventData = [ { eventName: concord.util.events.needSolveEvents_tableDownArrowPressed, event:event, editor:this.editor } ];
				concord.util.events.publish(concord.util.events.needSolveEvents, eventData);
				break;
			
			default :
				// Do not stop not handled events.
				return;
			}
	},
	
	getLastVisibleNodeInCell:function(cell){
			var visibleChild=cell.getLast();
				   	  			 
  			while(visibleChild)
  			{
  				if(visibleChild.type == CKEDITOR.NODE_TEXT && (visibleChild.getLength()!=0)){
  					break;
  				}
  				if(visibleChild.type == CKEDITOR.NODE_TEXT || visibleChild.is('br')|| (!visibleChild.isVisible())){
   	  				if(visibleChild.hasPrevious())
   	  					visibleChild=visibleChild.getPrevious();
   	  				else{
   	  					visibleChild=null;
   	  					break;
   	  				}
   	  			}else if(visibleChild.is('p')){
   	  				 var tmp=this.getLastVisibleNodeInCell(visibleChild);
				   	  if(tmp)
					  {
					  	return tmp;
					  }else{
					  	if(visibleChild.hasPrevious())
   	  						visibleChild=visibleChild.getPrevious();
   	  					else{
   	  						visibleChild=null;
   	  						break;
   	  					}
					  }
   	  			}else{
   	  				break;
   	  			}
  			}
  			
  			return visibleChild;
	},
	
	getDataTotalHeight: function(inCK){
		var tbl = null;
		var editModeTbl = null;
		var totalDataHeight = 0;
		if ( this.editModeOn && this.editor){
			editModeTbl = dojo.query('table',this.editor.document.$.body)[0];
		}
		if ( (this.contentBoxDataNode.offsetHeight == 0 || inCK ) && editModeTbl){
			tbl = editModeTbl;
		} else {
			tbl = this.contentBoxDataNode;
		}		
		totalDataHeight += tbl.offsetHeight;
//		totalDataHeight += dojo.style(tbl, 'height');
		return totalDataHeight;
	},
	
	
	//
	// Enable menu items for this content box when editing (to be implemented by subclasses types)
	//
	enableMenuItemsOnEdit: function(){
		var tblInCK =  dojo.query('table',this.editor.document.$.body)[0];
		var numRows = tblInCK.rows? tblInCK.rows.length : 0;
		var numCols = numRows > 0? tblInCK.rows[0].childNodes.length : 0;
		var eventData = [{
			'eventName': concord.util.events.crossComponentEvents_eventName_enableTableEditingMenuItems,
			'numRows': numRows,
			'numCols' : numCols
		}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		tblInCK = null;
 		
 		var textStyleEventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextStyleMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, textStyleEventData);	
 		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextPropertyMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableIncreaseIndentMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableDecreaseIndentMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextFontPropertyMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);


 		concord.util.presToolbarMgr.togglePrevNextSlideButton();
    	concord.util.presToolbarMgr.toggleBGFillColorButton('on');
    	concord.util.presToolbarMgr.toggleVerticalAlignButton('on');
 		concord.util.presToolbarMgr.toggleFontEditButtons('on');
 		concord.util.presToolbarMgr.toggleInsertMoveRowButton('on');
 		concord.util.presToolbarMgr.toggleInsertMoveColButton('on');
 		
 		if (!this.attachedStyleStateChange) {
 			// watch for changes to superscript style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_superscript_base), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to subscript style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_subscript_base), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to strikethrough style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_strike), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to bold style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_bold), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });

 	        // watch for changes to italic style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_italic), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to underline style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_underline), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        this.attachedStyleStateChange = true;
 		}
	},
	
	//
	// Disable menu items for this content box when editing (to be implemented by subclasses types)
	//
	disableMenuItemsOnNonEdit: function(){
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTableEditingMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		
	 	eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableCopyCutMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		
	 	var textStyleEventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextStyleMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, textStyleEventData);
 
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextPropertyMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableIncreaseIndentMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableDecreaseIndentMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	
    	concord.util.presToolbarMgr.toggleBGFillColorButton('off');
		concord.util.presToolbarMgr.toggleFontEditButtons('off');
 		concord.util.presToolbarMgr.toggleInsertMoveRowButton('off');
 		concord.util.presToolbarMgr.toggleInsertMoveColButton('off');
	},
	
	deleteContentBox: function(publish){
		this.inherited(arguments);
		if(dojo.isIE){
			concord.util.presToolbarMgr.toggleFontEditButtons(CKEDITOR.TRISTATE_DISABLED);
			concord.util.presToolbarMgr.toggleToolbarButtonState("cke_button_numberedlist", CKEDITOR.TRISTATE_DISABLED);
			concord.util.presToolbarMgr.toggleToolbarButtonState("cke_button_bulletedlist", CKEDITOR.TRISTATE_DISABLED);
		}
	},
	
			
	
	//
	// Enable menu items for this content box when selected (to be implemented by subclasses types)
	//
	enableMenuItemsOnSelect: function(){
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTableSelectionMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		this.enableRowColumnResize();
 		this.inherited(arguments);
	},
	
	//
	// Disable menu items for this content box when not selected (to be implemented by subclasses types)
	//
	disableMenuItemsOnDeSelect: function(){
		//console.log('about to send table selection enabled');
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTableSelectionMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		this.disableRowColumnResize();
 		this.inherited(arguments);
	},

	//
	// Update attribute change from coedit.
	//
	updateCoeditAttributeChange: function(data) {
	  this.inherited(arguments);
	  var eventData = [ { 'eventName' : concord.util.events.slideEditorEvents_eventName_attributeChange } ];
	  concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	},
	
	/**
	 * Overrides 'contentBox.getContentEditNode()' to get the current TD.
	 * 
	 * The returned node is a DOM node.
	 */
	getContentEditNode: function() {
		var selectedCells = this.editor.getSelectedTableCells( this.editor);
		if ( selectedCells && selectedCells.length == 1 ){
			return selectedCells[0].$;
		} else if ( selectedCells && selectedCells.length > 1){
	        return this.inherited( arguments );
	    } else {	    
	    	// if no TD/cell contains the 'selectedSTCell' class, then get the first TD/cell
	    	selectedCells = dojo.query( 'td', this.editor.document.$.body );
	    	if (selectedCells && selectedCells.length >= 1){
	    		return selectedCells[0];
	    	}
	    }	    
	    // if still no TD/cell, then use the default behavior (i.e. return the root of the content box)
	    return this.inherited( arguments );
	},
	
	/**
	 * Overrides 'contentBox.cleanupNode()' to cleanup the TD, too.
	 * 
	 * The specified 'node' is a DOM node and should be a clone (if you don't want to lose any
	 * styles/classes/attributes in your slide editor instance).
	 */
	cleanupNode: function( node ) {
	    this.inherited( arguments );   
	},
	
	SuperscriptText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('superscript');
		}
	},
	
	SubscriptText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('subscript');
		}
	},
	
	strikethroughText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('strike');
		}
	},
	
	boldText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('bold');
		}
	},
	
	italicText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('italic');
		}
	},

	underlineText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('underline');
		}
	},
	
	_unsubscribeEvents : function() {
	  var l = this.eventListeners.length;
	  for (var i = 0; i < l; i++)
	  {
	    list = this.eventListeners[i];
	    dojo.unsubscribe( list );
	  }
	  this.eventListeners = [];
	},
	
    //
    // Completely annihilate this contentBox from memory
    //
    destroyContentBox: function() {
      if ( this.boxSelected ){
          // D25461, need to disable both icons on toolbar and menu items
          this.disableMenuItemsOnNonEdit();

          // TODO: may be duplicated with deleteContentBox()
    	  this.disableMenuItemsOnDeSelect();
      }
	  this._unsubscribeEvents( );
	  this.inherited(arguments);
    },
    
    //
    // Clean focus cells on a node
    //
    cleanSelectedSTCells: function(node){
    	dojo.removeClass(node,'selectedSTCell');
    	if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
   	  		dojo.query('.selectedSTCell',node).removeClass('selectedSTCell');
    	}
    },
    
    //set absolute row height(in px) for internal use
    setPresRowHeight: function(forceSet, table){
    	if(!this.contentBoxDataNode)
    		return;
    	var rowList = null;
    	if(!table){
    		rowList = this.contentBoxDataNode.rows; //	HTMLCollection
    	}else{
    		table = table.$ || table;
    		rowList = table.rows;
    	}
    	var slideEditorMainNode = pe.scene.slideEditor.mainNode;
		var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
    	for(var i = 0, len = rowList.length ; i < len ; i++){
    		var tr = rowList[i];
    		
    		//don't set presrowheight if already exists
    		if(dojo.hasAttr(tr, 'presrowheight') && !forceSet)
    			return;
    		
    		var rowH = dojo.isIE ? tr.offsetHeight: dojo.style(tr, 'height');
    		dojo.attr(tr, {'presrowheight': rowH * 1000 / slideEditorHeightinPX});
    	}
    },
    
    convertTableRowHeightsToPx: function(){
    	var convertRowHeightToPx = function( table){
			if ( table){
	    		var rows=table.rows;
	    		console.info("Before resize row, set row height to px!");
	    		for(var i=0;i< rows.length;i++){
	   				var rowHeight = dojo.isIE ? rows[i].offsetHeight: dojo.style(rows[i], 'height');
	   				dojo.style( rows[i],  {
						'height': rowHeight+ "px",
						'maxHeight': ''
					});
	   				console.info("Row " + i + " with new height is:" + rowHeight + "px");
	    		}
			}
    	};
    	if ( this.editModeOn){
    		var editModeTbl =  dojo.query('table',this.editor.document.$.body)[0];
    		convertRowHeightToPx(editModeTbl);
    	} else {
    		convertRowHeightToPx(this.contentBoxDataNode);
    	}
    },
    
    updateMainNodeHeightBasedOnPxRowHeights: function(){
    	var contentBox = this;
    	var updateMainNodeHeight = function( table){
        	var heightVal = 0;
    		if ( table){
	    		var rows=table.rows;
	    		for(var i=0;i< rows.length;i++){
	    			var rowHeight = dojo.isIE ? rows[i].style.getAttribute('height') : rows[i].style.getPropertyValue('height');
	    			if ( rowHeight && rowHeight.toLowerCase().indexOf('px')){
	    				heightVal += parseFloat(rowHeight);
	    			} else {
	    				// row height is not in px so immeditely return
	    				return;
	    			}
	    		}
			}
			if ( heightVal){
				dojo.style(contentBox.mainNode,{
					'height':contentBox.PxToPercent(heightVal,'height')+"%"
				});
				var tableActualHeight = dojo.isIE < 9 ? table.offsetHeight: dojo.style(table, 'height');
				var mainNodeActualHeight = dojo.isIE < 9 ? contentBox.mainNode.offsetHeight: dojo.style(contentBox.mainNode, 'height');
				// defect 20955 table will not get smaller than certain size if it has content so make sure that main node is not smaller than table
				if ( mainNodeActualHeight < tableActualHeight ){
					dojo.style(contentBox.mainNode,{
						'height':contentBox.PxToPercent(tableActualHeight,'height')+"%"
					});
				}
			}
    	};
    	if ( this.editModeOn){
    		var editModeTbl =  dojo.query('table',this.editor.document.$.body)[0];
    		updateMainNodeHeight(editModeTbl);
    	} else {
    		updateMainNodeHeight(this.contentBoxDataNode);
    	}
	},
    
    updateMainNodeWidthBasedOnDataContent: function(){
    	var contentBox = this;
    	var updateMainNodeWidth = function( table){
			if ( table){
				var widthVal = dojo.isIE ? table.offsetWidth: dojo.style(table, 'width');
				dojo.style(contentBox.mainNode,{
					'width':contentBox.PxToPercent(widthVal,'width')+"%"
				});

		    	var tableActualHeight = dojo.isIE ? table.offsetHeight: dojo.style(table, 'height');
				var mainNodeActualHeight = dojo.isIE ? contentBox.mainNode.offsetHeight: dojo.style(contentBox.mainNode, 'height');
				// defect 21316 sometimes changing table width might cause height to change when there is data in the table 
				// make sure that main node is not smaller than table
				if ( mainNodeActualHeight < tableActualHeight ){
					contentBox.updateEditModeTableRowHeights();
					contentBox.updateMainNodeHeightBasedOnDataContent();
				}
			}
    	};
    	if ( this.editModeOn){
			var editModeTbl =  dojo.query('table',this.editor.document.$.body)[0];
    		updateMainNodeWidth(editModeTbl);
    	} else {
    		updateMainNodeWidth(this.contentBoxDataNode);
    	}
	},
	
    updateEditModeTableRowHeights: function(){
    	var table = null;
    	if ( this.editModeOn){
			table =  dojo.query('table',this.editor.document.$.body)[0];
    	} else {
    		table = this.contentBoxDataNode;
    	}
    	
    	if(!table)
    		return;
    	
    	var rows = table.rows;
		var totalheight=0;
    	var rowHeights = this._getEditModeTableRowHeightArray( table);
		for(var i=0;i< rowHeights.length;i++){
			totalheight = totalheight+rowHeights[i];
		}
		
		for(var i=0;i< rows.length;i++){
			dojo.style( rows[i],  {
				'height': ((rowHeights[i]/totalheight)*100)+ "%",
				'maxHeight': ''
			});
		}
    },
    
    _getEditModeTableRowHeightArray: function( table){
    	var arrHeight = new Array();
    	if ( table){
    		var rows = table.rows;
    		for(var i=0;i< rows.length;i++){
   				var rowHeight = rows[i].offsetHeight; 
    			arrHeight.push(rowHeight);
    		}
			rows = null;
    	}
    	table = null;
    	return arrHeight;
    },
    
    getVerticalAlignment : function( noFocus){
    	var selectedCells = [];
    	var alignmentArray = [];
    	var getComputedVerticalAlignment = function( node){
    		var computedStyle = dojo.getComputedStyle(node);
        	if ( computedStyle.verticalAlign && computedStyle.verticalAlign == 'baseline' ){
        		return 'top';
        	} else if ( computedStyle.verticalAlign) {
        		return computedStyle.verticalAlign;
        	}
    	};
    	if ( this.isEditModeOn() && this.editor){
    		if ( noFocus){
    			selectedCells = this.getNoFocusSelectedCells();
    		} else {
    			selectedCells = this.editor.getSelectedTableCells( this.editor);
    		}
    		for ( var i = 0; i < selectedCells.length; i++){
    			alignmentArray.push( getComputedVerticalAlignment(selectedCells[i].$));
    		}
    	} else {
    		selectedCells = this.contentBoxDataNode && dojo.query('td, th', this.contentBoxDataNode);
    		for ( var i = 0; i < selectedCells.length; i++){
    			alignmentArray.push( getComputedVerticalAlignment(selectedCells[i]));
    		}
    	}    	

    	var currentAlignment = null;
    	if ( alignmentArray.length > 0){
	        currentAlignment = alignmentArray[0];
	    	for ( var j = 0; j < alignmentArray.length; j++){
	    		if ( currentAlignment != alignmentArray[j]){
	    			currentAlignment = null;
	    			break;
	    		}
	    	}
        }
        return currentAlignment;
    },
    
    getNoFocusSelectedCells:function(){
    	var selectedCells = [];
    	if ( this.isEditModeOn() && this.editor){
    		var selection = this.editor.getSelection();
    		var ranges = selection.getRanges();
    		for (var i=0; i<ranges.length; i++){
    			var range = ranges[ i ];
    			var iter = range.createIterator();
    			var next;
    			while ( next = iter.getNextParagraph() ) {
    				var selectedCell = next.getAscendant('td',true) || next.getAscendant('th',true);
    				if ( selectedCell){
    					selectedCells.push( selectedCell);
    				}
    			}
    		}
    	}
    	return selectedCells;
    },
    
    // get node that will contain the aria information
    getAriaNode:function(drawFrame){
    	return this.contentBoxDataNode;    
    },


    // get ID of the node that labels the contents of the textbox
    getAriaContentsID:function(ariaNode){
    	return this.contentBoxDataNode.id;    
    },
    
    // default aria role (if not already set)
    getAriaRole:function(){
 	   return "";   // tables don't have a role (yet)
    }, 

    enableColumnResizeMove : function ( pillarIndex){
		if (window.pe.scene.slideEditor.SINGLE_CK_MODE && this.boxRep!=null){ // this is a spare in it is representing a box
			contentBox = this.boxRep.unLoadSpare();
			contentBox.enableColumnResizeMove(pillarIndex);
			return;
		}    	
		var table = new CKEDITOR.dom.node(this.contentBoxDataNode);
		var pillars = TableResizeUtil.buildTableColumnPillars(table);
		var pillar = pillars ? pillars[ pillarIndex] : null;
		if ( pillar ) {
			!this.colResizer && ( this.colResizer = new TableResizeUtil.columnResizer( this, pillars ) );
			this.colResizer.attachTo( pillar );
			this.colResizer.simulateMouseDownOnResizer();
			this.enableRowColumnResize();
		}
    },
    
    enableRowResizeMove : function ( evtTarget){
    	if(!evtTarget)
    		return;
		if (window.pe.scene.slideEditor.SINGLE_CK_MODE && this.boxRep!=null){ // this is a spare in it is representing a box
			contentBox = this.boxRep.unLoadSpare();
			contentBox.enableRowResizeMove(evtTarget);
			return;
		}  
		var cell = dojo.byId(evtTarget.getId());
		var pillars = TableResizeUtil.buildTableRowPillar(new CKEDITOR.dom.node(cell));
		var pillar = pillars ? pillars[ 0 ] : null;
		if ( pillar ) {
			!this.trResizer && ( this.trResizer = new TableResizeUtil.rowResizer( this ) );
			this.trResizer.attachTo( pillar );
			this.trResizer.simulateMouseDownOnResizer();
			this.enableRowColumnResize();
		}		
    },
    
    enableRowColumnResize : function(){
		if(concord.util.browser.isMobileBrowser()){
			return;
		}
		var contentBox = this;
		var colResizer = this.colResizer;
		var trResizer = this.trResizer;
		var mouseDown = false;
		var mouseResizeArea = new CKEDITOR.dom.node (pe.scene.slideEditor.mainNode);
		dojo.isIE > 8 && mouseResizeArea.on('mousedown',function(){
			mouseDown =true;
		});
		dojo.isIE > 8 && mouseResizeArea.on('mouseup',function(){
			mouseDown =false;
		});

		var resizeOnmouseMoveConnect = dojo.connect(pe.scene.slideEditor.mainNode,'onmousemove', function( evt ){
			//S36075
			var slideEditor = pe.scene.slideEditor;
			if(slideEditor.isMultipleBoxSelected())
				return;
			
			// If we're already attached to a pillar, simply move the
			// resizer.
			if ( colResizer && colResizer.move( evt.clientX) )
			{
				TableResizeUtil.cancel( evt );
				return;
			}
			if ( trResizer && trResizer.move( evt.clientY,true) )
			{
				TableResizeUtil.cancel( evt );
				return;
			}
			if(mouseDown){
				return;
			}

			// Considering table, tr, td, tbody but nothing else.
			var target = new CKEDITOR.dom.node(evt.target),
				table,
				pillars;

			if ( !target.is( 'table' ) && !target.getAscendant( 'tbody', 1 ) )
				return;

			table = target.getAscendant( 'table', 1 );
			if ( table){
				if(!table.hasClass( 'smartTable'))
					return;
				//S36075, disable view mode resizing
				var tblId = table.$.id, moveOn = false;
				for(var i = 0, len = slideEditor.CONTENT_BOX_ARRAY.length; i < len; i++){
				var cb = slideEditor.CONTENT_BOX_ARRAY[i];
				if(cb.contentBoxDataNode.id == tblId && cb.boxSelected){
					moveOn = true;
					break;
				}
			}
			
			if(!moveOn)
				return;
			}

			var scrollPos = new CKEDITOR.dom.window(window).getScrollPosition();
			pillars = TableResizeUtil.buildTableColumnPillars(table);
			var pillar = pillars && TableResizeUtil.getColPillarAtPosition( pillars, evt.clientX + scrollPos.x);
			if ( pillar ) {
				!colResizer && ( colResizer = new TableResizeUtil.columnResizer( contentBox, pillars ) );
				colResizer.attachTo( pillar );
			} else{
				pillars = TableResizeUtil.buildTableRowPillar(target);
				pillar = TableResizeUtil.getRowPillarAtPosition( pillars, evt.clientY + scrollPos.y);
				if ( pillar )
				{
					!trResizer && ( trResizer = new TableResizeUtil.rowResizer( contentBox ) );
					trResizer.attachTo( pillar );
				}
			}
		});
		if ( !this.resizeOnmouseMoveConnect){
			this.resizeOnmouseMoveConnect = resizeOnmouseMoveConnect;
			this.connectArray.push(this.resizeOnmouseMoveConnect);
		} else {
			this.disableRowColumnResize();
			this.resizeOnmouseMoveConnect = resizeOnmouseMoveConnect;
			this.connectArray.push(this.resizeOnmouseMoveConnect);
		}
    },
    checkMainNodeHeightandUpdate: function(updateHandler){
		 if(Math.abs((this.getMainNodeHeightBasedOnDataContent()+this.getHeight_adjust()-this.mainNode.offsetHeight))>1 ){
			this.updateMainNodeHeightBasedOnDataContent();
			if (dojo.isIE){
				this.adjustContentDataSize();
			}
			updateHandler && this.updateHandlePositions();
		}
	},
    disableRowColumnResize: function(){
    	for(var i=0; i< this.connectArray.length; i++){
    		if ( this.resizeOnmouseMoveConnect == this.connectArray[i] ){
    			dojo.disconnect(this.connectArray[i]);
    			this.connectArray.splice(i, 1);
                i--;
    		}
		}
    	this.resizeOnmouseMoveConnect = null;
    }
});
