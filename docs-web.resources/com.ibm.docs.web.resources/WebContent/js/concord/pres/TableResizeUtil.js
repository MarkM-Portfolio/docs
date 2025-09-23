dojo.provide("concord.pres.TableResizeUtil");

dojo.declare("concord.pres.TableResizeUtil", null, {
	needsIEHacks : dojo.isIE < 7 ,
	minimumColumnWidth: 20,
    constructor: function() {
    },

    /**
	 * Append the 'px' length unit to the size if it's missing.
	 * @param length
	 */
    pxUnit : function( length )
	{
		return length + ( !length || isNaN( Number( length ) ) ? '' : 'px' );
	},
    
	getWidth: function( el )
	{
		if(!el || !el.$)
			return 0;
		var ret = CKEDITOR.env.ie ? el.$.clientWidth || el.$.offsetWidth : parseFloat( el.getComputedStyle( 'width' ), 10 ); 
		ret = ret.toFixed(2);
		return ret;
	},
	
	getHeight: function(el)
	{
		if(!el || !el.$)
			return 0;
		
		var ret = CKEDITOR.env.ie ? el.$.clientHeight : parseInt( el.getComputedStyle( 'height' ), 10 );//????why clientheight
		if(CKEDITOR.env.ie && ret ==0){
			ret=el.$.offsetHeight;
		}
		return ret;
	},
	
	getBorderWidth: function( element, side )
	{
		var computed = element.getComputedStyle( 'border-' + side + '-width' ),
			borderMap =
			{
				thin: '0px',
				medium: '1px',
				thick: '2px'
			};
	
		if ( computed.indexOf( 'px' ) < 0 )
		{
			// look up keywords
			if ( computed in borderMap && element.getComputedStyle( 'border-style' ) != 'none' )
				computed = borderMap[ computed ];
			else
				computed = 0;
		}
		var r = parseInt( computed, 10 );
		if (r ==0){
			if( parseFloat(computed,10)>0){
				//0.6px is 1 px for browser
				return 1;
			}
		}
		return r;
	},
	
	// Gets the table row that contains the most columns.
	getMasterPillarRow: function( table )
	{
		var $rows = table.$.rows,
			maxCells = 0, cellsCount,
			$elected, $tr;
	
		for ( var i = 0, len = $rows.length ; i < len; i++ )
		{
			$tr = $rows[ i ];
			cellsCount = $tr.cells.length;
	
			if ( cellsCount > maxCells )
			{
				maxCells = cellsCount;
				$elected = $tr;
			}
		}
	
		return $elected;
	},
	
	buildTableColumnPillars: function( table )
	{
		var pillars = [], pillarIndex = -1,
			rtl = (table.getComputedStyle('direction') == "rtl");
		var pillarLeft, pillarRight, pillarWidth;
		// Get the tbody element and position, which will be used to set the
		// top and bottom boundaries.
		var tbody = new CKEDITOR.dom.element( table.$.tBodies[ 0 ] ),
			tbodyPosition = tbody.getDocumentPosition();
		
		PresTableUtil.convertTableColumnWidthsToPx(table);
		var colgrp = dojo.query('colgroup', table.$);
     	if(colgrp.length > 0){
     		colgrp = colgrp[0];
     	}else{
     		return;
     	}
     	
     	var subGrp = colgrp.childNodes;
     	pillarLeft = table.getDocumentPosition().x;
     	for(var i = 0, len = subGrp.length - 1; i < len; i++){
     		pillarIndex = i;
     		var col = new CKEDITOR.dom.element(subGrp[i]);
     		var _width = parseFloat(col.getAttribute("_width"));
     		_width = parseFloat(_width.toFixed(2));
     		pillarLeft += _width;
     		
     		pillars.push({
     			table : table,
     			index : pillarIndex,
     			x : pillarLeft,
     			y : tbodyPosition.y,
     			width : 3,
     			height : tbody.$.offsetHeight,
     			rtl : rtl
     		});
     	}
     	return pillars;
	},
	
	buildTableRowPillar: function(target){
		var exp = /^[0-9]*$/;
		var table = target.getAscendant( 'table', true );
		var td = target.getAscendant( "th",true) || target.getAscendant( "td",true);
		
		var pillars = [];
		if(!td){
			return pillars;
		}
		
		var createRowPillar = function( currentTr, currentTd){
			var rowSpan = currentTd.getAttribute("rowspan");
			if(rowSpan){
				var index = currentTr.getIndex()+parseInt(rowSpan)-1;
				if(index < currentTr.getParent().getChildCount()){
					currentTr = currentTr.getParent().getChild(index);
				}
			}
			
			if(!table)
				return;
			
			//We don't generate pillar for bottom border of last row
			table = (table.$) ? table : new CKEDITOR.dom.node(table);
			var tbody = table.$.getElementsByTagName('tbody');
			tbody = tbody[0];
			var cldTRs = tbody && tbody.getElementsByTagName('tr');
			var lastTr = cldTRs && cldTRs[cldTRs.length - 1];
			
			if(currentTr.$ == lastTr){
				return;
			}
			
			var pillarTop, pillarBottom, pillarHeight;
			var tdPos = currentTd.getDocumentPosition();
			var trPos = currentTr.getDocumentPosition();
			var y = tdPos.y;
			var x = trPos.x;
			pillarTop  = y + currentTd.$.offsetHeight;
			var bottomBorder = TableResizeUtil.getBorderWidth( currentTd, 'bottom' );
			if(!exp.test(bottomBorder)){
				bottomBorder=1;
			}
			pillarHeight = Math.max( bottomBorder, 3 );
			pillars.push( {
				table : table,
				row: currentTr,
				x : x,
				y : pillarTop,
				width : currentTr.$.offsetWidth,
				height : pillarHeight
				} );
		};
		
		var tr = td.getParent();
		createRowPillar( tr, td);
		var prevTr = tr.getPrevious();
		
		if ( prevTr && prevTr.getChild(td.getIndex())){
			createRowPillar( prevTr, prevTr.getChild(td.getIndex()));
		}
		
		return pillars;
	},
	
	getColPillarAtPosition: function( pillars, positionX )
	{
		for ( var i = 0, len = pillars.length ; i < len ; i++ )
		{
			var pillar = pillars[ i ];
	
			if ( positionX >= pillar.x && positionX <= ( pillar.x + pillar.width ) )
				return pillar;
		}
	
		return null;
	},
	
	getRowPillarAtPosition: function( pillars, positionY){
		for ( var i = 0, len = pillars.length ; i < len ; i++ )
		{
			var pillar = pillars[ i ];
			if ( (positionY >= pillar.y && positionY <= ( pillar.y + pillar.height )) ||
					(positionY < pillar.y && positionY >= ( pillar.y - pillar.height )) )
				return pillar;
		}
	
		return null;
	}, 
	
	cancel: function( evt )
	{
		( evt.data || evt ).preventDefault();
	},
	
	columnResizer : function( contentBox, pillarsObj )
	{
		var pillar,
			pillars = pillarsObj,
			document,
			resizer,
			isResizing,
			changeWidth,
			startOffset,
			editor,
			actPair = [],
			divId,
			currentShift;
	
		var leftSideCells, rightSideCells, leftShiftBoundary, rightShiftBoundary;
		if ( contentBox.editModeOn){
			editor = contentBox.editor;
		}
		
		function detach()
		{
			pillar = null;
			isResizing = 0;			
			currentShift = 0;
			changeWidth = 0;
			
			document && document.removeListener( 'mouseup', onMouseUp );
			resizer && resizer.removeListener( 'mousedown', onMouseDown );
			resizer && resizer.removeListener( 'mousemove', onMouseMove );
	
			document && document.getBody().setStyle( 'cursor', 'auto' );

			// Hide the resizer (remove it on IE7 - #5890).
			concord.pres.TableResizeUtil.needsIEHacks ? resizer.remove() : resizer.hide();
			
		}
	
		function updateTableColumnResizer(resizer)
		{
			resizer.setStyles(
				{
					height : TableResizeUtil.pxUnit(pillar.height),
					left : TableResizeUtil.pxUnit(pillar.x)
				});
			return resizer;
		}
		
		function updatePillar(){
			var tableH = PresTableUtil.getHeight(pillar.table.$);
			pillar.height = tableH;
			var colgrp = dojo.query('colgroup', pillar.table.$)[0];
			var subGrp = colgrp.childNodes;
			var len = pillar.index;
			var totalW = 0;
			for(var i = 0; i <= len; i++){
				totalW += parseFloat(subGrp[i].getAttribute("_width"));
			}
			var tableX = pillar.table.getDocumentPosition().x;
			pillar.x = tableX + totalW;
     		console.log("LOG: After the resize, update the pillar since user may not move cusor but directly mouse down to make the next resize.");
		}
		
		function resizeStart(evt)
		{
			divId = contentBox.mainNode.id;
			var msg = SYNCMSG.createPresDelInsertElementAct(divId, "delete");
			if(msg){
				actPair = [];
				actPair.push(msg);
			}
			
			// Before starting to resize, figure out which column to change
			// and the boundaries of this resizing shift.
			var columnIndex = pillar.index,
				leftMinSize = TableResizeUtil.minimumColumnWidth,
				rightMinSize = leftMinSize,
				rtl = pillar.rtl;

			var colgrp = dojo.query('colgroup', pillar.table.$)[0];
			var subGrp = colgrp.childNodes;
	     	if(columnIndex >= 0 && columnIndex < subGrp.length){
	     		var _widthL = parseFloat(dojo.attr(subGrp[columnIndex], "_width")),
	     			_widthR = parseFloat(dojo.attr(subGrp[columnIndex + 1], "_width"));
	     		var leftColW = rtl ? _widthR : _widthL;
	     		var rightColW = rtl ? _widthL : _widthR;
	     		leftMinSize = parseFloat(leftColW.toFixed(2));
	     		rightMinSize = parseFloat(rightColW.toFixed(2));
	     	}

	     	// Cache the resize limit boundaries.
			leftShiftBoundary =  pillar.x - (leftMinSize - TableResizeUtil.minimumColumnWidth); //the very left position resizer can reach
			rightShiftBoundary = pillar.x + rightMinSize - TableResizeUtil.minimumColumnWidth;//the very right position resizer can reach
			
			if(leftMinSize <= TableResizeUtil.minimumColumnWidth){
				leftShiftBoundary = pillar.x;
			}
			
			if(rightMinSize <= TableResizeUtil.minimumColumnWidth){
				rightShiftBoundary = pillar.x;
			}
			
			resizer.setOpacity( 0.5 );
			updateTableColumnResizer(resizer);
			resizer.on( 'mousemove', onMouseMove );
	
			startOffset = pillar.x;
			currentShift = 0;
			isResizing = 1;
			// Prevent the native drag behavior otherwise 'mousemove' won't fire.
			document.on( 'dragstart', TableResizeUtil.cancel );
		}
	
		function resizeEnd()
		{
			isResizing = 0;
	
			resizer.setOpacity( 0 );
	
			if (Math.abs(currentShift) > 2){
				PresCKUtil.normalizeMsgSeq(null, null, null, "beginMerge"); //begin for col resize		
				resizeColumn();
				PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');// end for col resize
				
				updatePillar();
			}
	
			document.removeListener( 'dragstart', TableResizeUtil.cancel );
			
		}
	
		var cancelResize = this.cancelResize= function(){
			isResizing = 0;
			resizer.setOpacity( 0 );
			document.removeListener( 'dragstart', TableResizeUtil.cancel );
			detach();
		};

		function resizeColumn()
		{
			var rtl = pillar.rtl;
			var tmpShift = currentShift,
				colIndex = pillar.index;
			var cbDataNode = contentBox.contentBoxDataNode;
			
			if(contentBox.editModeOn)
				return;

			if(pillar.table.$.id != cbDataNode.id){
				var dfID = pillar.table.getParent().getAttribute('id');
				dfID = dfID.replace("SPR", "");
				contentBox = PresCKUtil.getContentBoxByDrawFrameID(dfID);
				if(!contentBox)
					return;
				cbDataNode = contentBox.contentBoxDataNode;
			}
			
			//step1: convert col width from % to px
			PresTableUtil.convertTableColumnWidthsToPx(cbDataNode); //convert col[colIndex] and col[colIndex + 1] to px
			
			//step2: update col width with currentShift, still px
			//Perform the actual resize to table cells, only for those by side of the pillar.
	    	var colgrp = dojo.query('colgroup', contentBox.contentBoxDataNode);
	     	if(colgrp.length > 0){
	     		colgrp = colgrp[0];
	     		var leftColgrp = colgrp.childNodes[colIndex];
	     		var rightColgrp = colgrp.childNodes[colIndex + 1];
	     		var leftOldWidth = parseFloat(dojo.attr(leftColgrp, "_width"));
	     		var rightOldWidth = parseFloat(dojo.attr(rightColgrp, "_width"));
	     		
	     		var leftNewWidth = leftOldWidth + tmpShift;//TableResizeUtil.pxUnit( Math.max( leftOldWidth + currentShift, TableResizeUtil.minimumColumnWidth ) );
				var rightNewWidth = rightOldWidth - tmpShift;//TableResizeUtil.pxUnit( Math.max( rightOldWidth - currentShift, TableResizeUtil.minimumColumnWidth ) );
				
				if(tmpShift < 0){	//move left
					leftNewWidth = Math.max(leftNewWidth , TableResizeUtil.minimumColumnWidth);
					rightNewWidth = leftOldWidth + rightOldWidth - leftNewWidth;
				}else{	//move right
					rightNewWidth = Math.max(rightNewWidth , TableResizeUtil.minimumColumnWidth);
					leftNewWidth = leftOldWidth + rightOldWidth - rightNewWidth;
				}
				
				dojo.attr(leftColgrp, "_newwidth", leftNewWidth.toFixed(2));
				dojo.attr(rightColgrp, "_newwidth", rightNewWidth.toFixed(2));
	     	}
			
			//step3, convert col width from px to %
			PresTableUtil.convertGivenTableColumnWidthsToPc(cbDataNode, colIndex);
			//step4, update relevant nodes.
			PresCKUtil.updateRelativeValue(contentBox.mainNode,[PresConstants.ABS_STYLES.TEXTINDENT,PresConstants.ABS_STYLES.MARGINLEFT]);
			//update main node height since col resize may change table height.
//			TableResizeUtil.updateResizedTableContentBoxWidth( contentBox);
//			contentBox.updateViewTableSize();
			PresTableUtil.updateDFNodeWithContentHeight(contentBox);
			contentBox.checkMainNodeHeightandUpdate(false);
			contentBox.updateHandlePositions(true);
			
			//step5, 
			contentBox.publishInsertNodeFrame(null, true);
			
			var msg = SYNCMSG.createPresDelInsertElementAct(divId, "insert");
			if(msg){
				actPair.push(msg);
			}
				
			var rnActPair = SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, actPair);
			//step6, add to undo stack
			SYNCMSG.sendMessage([ rnActPair ], SYNCMSG.NO_LOCAL_SYNC);
		}
	
		function onMouseDownExit( evt )
		{
			TableResizeUtil.cancel( evt );
			if ( editor && editor.contentBox){
				editor.contentBox.toggleEditMode(false);
				editor.contentBox.enableColumnResizeMove ( pillar.index);
			}
		}
		
		//resize row/col mouse down
		function onMouseDown( evt )
		{
			TableResizeUtil.cancel( evt );
			
			//D38563 [Regression]Table column width is change when click into a cell
			if(contentBox.mainNode.id.indexOf("SPR") >= 0){
				contentBox = contentBox.unLoadSpare();
				if(pillar.table){
					pillar.table.$ = contentBox.contentBoxDataNode;
				}
			}
			contentBox.disableMenuItemsOnNonEdit();
			resizeStart(evt);
	
			document.on( 'mouseup', onMouseUp, this );
		}
	
		//resize row/col mouse up
		function onMouseUp( evt )
		{
			PresCKUtil.lockInput = false;
			evt.removeListener();
	
			resizeEnd();
			
			//D26761 Can't undo in edit mode after resize row height 
			dojo.isFF && window.pe.scene.setFocusToSlideEditor();	
		}
	
		function onMouseMove( evt )
		{	
			move( evt.data.$.clientX );
		}
	
		if ( editor){
			document = editor.document;
		} else {
			document = new CKEDITOR.dom.document(window.document);
		}
	
		resizer = CKEDITOR.dom.element.createFromHtml(
			'<div data-cke-temp=1 contenteditable=false unselectable=on '+
			'style="position:absolute;cursor:col-resize;' +
				'padding:0;background-color:#004;background-image:none;border:0px none;z-index:10"></div>', document );
		resizer.setOpacity( 0 );
		// Except on IE6/7 (#5890), place the resizer after body to prevent it
		// from being editable.
		if ( !concord.pres.TableResizeUtil.needsIEHacks && document)
			document.getDocumentElement().append( resizer );
	
		this.attachTo = function( targetPillar, exit )
		{
			// Accept only one pillar at a time.
			if ( isResizing )
				return;
	
			// On IE6/7, we append the resizer everytime we need it. (#5890)
			if ( concord.pres.TableResizeUtil.needsIEHacks && document)
			{
				document.getBody().append( resizer );
				currentShift = 0;
			}
	
			pillar = targetPillar;
	
			resizer.setStyles(
				{
					width: TableResizeUtil.pxUnit( targetPillar.width ),
					height : TableResizeUtil.pxUnit( targetPillar.height ),
					left : TableResizeUtil.pxUnit( targetPillar.x ),
					top : TableResizeUtil.pxUnit( targetPillar.y )
				});
	
			// In IE6/7, it's not possible to have custom cursors for floating
			// elements in an editable document. Show the resizer in that case,
			// to give the user a visual clue.
			concord.pres.TableResizeUtil.needsIEHacks && resizer.setOpacity( 0.25 );
	
			if ( exit ){
				resizer.on( 'mousedown', onMouseDownExit, this );
			} else {
				resizer.on( 'mousedown', onMouseDown, this );
			}
	
			if ( document)
				document.getBody().setStyle( 'cursor', 'col-resize' );
	
			// Display the resizer to receive events but don't show it,
			// only change the cursor to resizable shape.
			resizer.show();
		};
	
		this.simulateMouseDownOnResizer = function()
		{
			var target = resizer.$;
			var isToIgnoreCtrlKey = true;
			if( document.$.dispatchEvent && !dojo.isIE) { // W3C
			    var oEvent = document.$.createEvent( "MouseEvents" );
			    oEvent.initMouseEvent("mousedown", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, target);
			    target.dispatchEvent( oEvent );
			} else if( document.$.fireEvent) { // IE
				var eventObj = document.$.createEventObject(null);
				eventObj.ignoreCtrlKey = isToIgnoreCtrlKey;  // for some reason in IE ctrl key from ctrl+z, ctr+v, ctrl+m, etc, sticks to this new event
			    target.fireEvent("onmousedown",eventObj);
			}
		};
		
		var move = this.move = function( posX )
		{
			if ( !pillar )
				return 0;
	
			if ( !isResizing && ( posX < pillar.x || posX > ( pillar.x + pillar.width ) ) )
			{
				detach();
				return 0;
			}
	
			var resizerNewPosition = posX - Math.round( resizer.$.offsetWidth / 2 );
	
			if ( isResizing )
			{
				if ( resizerNewPosition == leftShiftBoundary || resizerNewPosition == rightShiftBoundary )
					return 1;
	
				resizerNewPosition = Math.max( resizerNewPosition, leftShiftBoundary );
				resizerNewPosition = Math.min( resizerNewPosition, rightShiftBoundary );
	
				currentShift = Math.round(resizerNewPosition - startOffset);
			}
			
			resizer.setStyle( 'left', TableResizeUtil.pxUnit( resizerNewPosition ) );

			return 1;
		};
	},
	
	rowResizer: function( contentBox )
	{
		var pillar,
			document,
			resizer,
			isResizing,
			startOffset,
			tablePos,
			editor,
			preSnapshotArray = [],
			currentShift;
		var topShiftBoundary;
		if ( contentBox.editModeOn){
			editor = contentBox.editor;
		}
		
		function createCoeditMessage()
		{
			var msgPairList = [];
			dojo.query('tr', contentBox.contentBoxDataNode).forEach(function(tr, index, arr){
				var prevTrHeight = preSnapshotArray[tr.id];
				var newTrHeight = CKEDITOR.env.ie ? tr.style.getAttribute('height') : tr.style.getPropertyValue('height');
				if ( newTrHeight && newTrHeight != prevTrHeight){
					var dataAttr = {};
					dataAttr.id = tr.id;
    				dataAttr.attributeName = 'style';
					dataAttr.attributeValue = 'height:' + newTrHeight + '; '; 
					var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
					attrObj.oldStyleValue = 'height: ' + prevTrHeight + '; ';
					msgPairList= SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList);
				}
			});
			return msgPairList;
		}
		
		function sendCoeditMessage()
		{
			//TODO, remove if, because editor always be null, so if will never reached.
			if (editor){
				TableResizeUtil.updateResizedTableContentBoxHeight( editor.contentBox);
				contentBox.updateEditModeTableRowHeights();
				PresCKUtil.setPostSnapShot(editor );
		        
		        editor.contentBox.synchAllData(PresCKUtil.getDFCNode(editor), null, null, true);
		        editor.contentBox.publishBoxStyleResizingEnd();
				undoManager.mergeTop2WithReorderedUndo();
			} else {
				var msgPairList = createCoeditMessage();
				if ( msgPairList.length > 0 ){
					PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
					var returnMsgPairList = SYNCMSG.sendMessage(msgPairList, SYNCMSG.SYNC_SORTER, true);
					contentBox.publishBoxStyleResizingEnd();
					PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
					TableResizeUtil.syncCoeditMessageWithEditor( contentBox, returnMsgPairList);
				}
			}
		}
		
		function detach()
		{
			pillar = null;
			currentShift = 0;
			isResizing = 0;
	
			document && document.removeListener( 'mouseup', onMouseUp );
			resizer && resizer.removeListener( 'mousedown', onMouseDown );
			resizer && resizer.removeListener( 'mousemove', onMouseMove );
	
			document && document.getBody().setStyle( 'cursor', 'auto' );
	
			// Hide the resizer (remove it on IE7 - #5890).
			concord.pres.TableResizeUtil.needsIEHacks ? resizer.remove() : resizer.hide();
		}
		
		function resizeStart()
		{
			var topMinSize = Number.MAX_VALUE;
			var row = pillar.row;
			var nextRow = row.getNext();
			row && ( topMinSize = Math.min( topMinSize, TableResizeUtil.getHeight( row ) ) );
			resizer.setOpacity( 0.5 );
			startOffset = parseInt( resizer.getStyle( 'top' ), 10 );
			currentShift = 0;
			isResizing = 1;
			topShiftBoundary =  pillar.y - topMinSize;
			resizer.on( 'mousemove', onMouseMove );
			
			// Prevent the native drag behavior otherwise 'mousemove' won't fire.
			document.on( 'dragstart', TableResizeUtil.cancel );
		}
	
		function resizeEnd()
		{
			isResizing = 0;
	
			resizer.setOpacity( 0 );
	
			currentShift && resizeRow();
	
			document.removeListener( 'dragstart', TableResizeUtil.cancel );
		}
		
		var cancelResize = this.cancelResize= function(){
			isResizing = 0;
			resizer.setOpacity( 0 );
			document.removeListener( 'dragstart', TableResizeUtil.cancel );
			detach();
		};
		
		function resizeRow()
		{
			var table = pillar.table;
			if(!MSGUTIL.isBlockInDomTree(table)){
				return;
			}
			
			//step1, get the change sets
			var changeSets =[];
			var row = pillar.row;
			var oldHeight = TableResizeUtil.getHeight(row);
			var newHeigth = oldHeight+currentShift;
			var changeSet = {"e":row,"oldHeight":oldHeight,"newHeigth":newHeigth,"type":'tr'};
			changeSets.push(changeSet);
			
			//step2, convert row height to px
			if ( editor){
				PresCKUtil.setPreSnapShot(editor);
				editor.contentBox.convertTableRowHeightsToPx();
			} else {
				preSnapshotArray = [];
				dojo.query('tr', contentBox.contentBoxDataNode).forEach(function(tr, index, arr){
					var trHeight = CKEDITOR.env.ie ? tr.style.getAttribute('height') : tr.style.getPropertyValue('height');
                    preSnapshotArray[tr.id] = trHeight;
				});
				contentBox.convertTableRowHeightsToPx();
			}
			var slideEditorMainNode = pe.scene.slideEditor.mainNode;
			var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
			//step3, update row height with change sets
			for(var i=0;i< changeSets.length;i++){
				var changeSet =changeSets[i];
				var trCKNode = changeSet.e;
				trCKNode.setStyle( 'height', TableResizeUtil.pxUnit(changeSet.newHeigth));
				trCKNode.setAttribute('presrowheight', changeSet.newHeigth * 1000 / slideEditorHeightinPX);
				console.info("resize row end, new row " + i + " height is(in px):" + changeSet.newHeigth);
			}
			
			//step4, convert row height to %
			TableResizeUtil.updateResizedTableContentBoxHeight( contentBox);
			contentBox.updateEditModeTableRowHeights();
			contentBox.updateViewTableSize();

			//step5, send message
			sendCoeditMessage();
		}
		
		function onMouseDownExit( evt )
		{
			TableResizeUtil.cancel( evt );
			if ( editor.contentBox){
				editor.contentBox.toggleEditMode(false);
				editor.contentBox.enableRowResizeMove ( pillar.row.getFirst());
			}
		}
		
		function onMouseDown( evt )
		{
			TableResizeUtil.cancel( evt );
			contentBox.disableMenuItemsOnNonEdit();
			resizeStart();
	
			document.on( 'mouseup', onMouseUp, this );
		}
	
		function onMouseUp( evt )
		{
			evt.removeListener();
	
			resizeEnd();
			
			//D26761 Can't undo in edit mode after resize row height 
			dojo.isFF && window.pe.scene.setFocusToSlideEditor();	
		}
	
		function onMouseMove( evt )
		{
			move( evt.data.$.clientY );
		}
	
		if ( editor){
			document = editor.document;
		} else {
			document = new CKEDITOR.dom.document(window.document);
		}
	
		resizer = CKEDITOR.dom.element.createFromHtml(
			'<div data-cke-temp=1 contenteditable=false unselectable=on '+
			'style="position:absolute;cursor:row-resize;' +
				'padding:0;background-color:#004;background-image:none;border:0px none;z-index:10"></div>', document );
		resizer.setOpacity( 0 );
		// Except on IE6/7 (#5890), place the resizer after body to prevent it
		// from being editable.
		if ( !concord.pres.TableResizeUtil.needsIEHacks && document)
			document.getDocumentElement().append( resizer );
	
		this.attachTo = function( targetPillar, exit )
		{
			// Accept only one pillar at a time.
			if ( isResizing )
				return;
	
			// On IE6/7, we append the resizer everytime we need it. (#5890)
			if ( concord.pres.TableResizeUtil.needsIEHacks && document)
			{
				document.getBody().append( resizer );
				currentShift = 0;
			}
	
			pillar = targetPillar;
			tablePos = concord.util.browser.getElementPositionInDocument(pillar.table);
			resizer.setStyles(
				{
					width: TableResizeUtil.pxUnit( targetPillar.width ),
					height : TableResizeUtil.pxUnit( targetPillar.height ),
					left : TableResizeUtil.pxUnit( targetPillar.x ),
					top : TableResizeUtil.pxUnit( targetPillar.y )
				});
	
			// In IE6/7, it's not possible to have custom cursors for floating
			// elements in an editable document. Show the resizer in that case,
			// to give the user a visual clue.
			concord.pres.TableResizeUtil.needsIEHacks && resizer.setOpacity( 0.25 );
	
			if ( exit ){
				resizer.on( 'mousedown', onMouseDownExit, this );
			} else {
				resizer.on( 'mousedown', onMouseDown, this );
			}
	
			if ( document)
				document.getBody().setStyle( 'cursor', 'row-resize' );
	
			// Display the resizer to receive events but don't show it,
			// only change the cursor to resizable shape.
			resizer.show();
			
		};
	
		this.simulateMouseDownOnResizer = function()
		{
			var target = resizer.$;
			var isToIgnoreCtrlKey = true;
			if( document.$.dispatchEvent && !dojo.isIE) { // W3C
			    var oEvent = document.$.createEvent( "MouseEvents" );
			    oEvent.initMouseEvent("mousedown", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, target);
			    target.dispatchEvent( oEvent );
			} else if( document.$.fireEvent) { // IE
				var eventObj = document.$.createEventObject(null);
				eventObj.ignoreCtrlKey = isToIgnoreCtrlKey;  // for some reason in IE ctrl key from ctrl+z, ctr+v, ctrl+m, etc, sticks to this new event
			    target.fireEvent("onmousedown",eventObj);
			}
		};
		
		var move = this.move = function( posY ,formDoc)
		{
			var scrolleY = null;
			if ( !pillar )
				return 0;
			if ( editor && editor.window){
				scrolleY = editor.window.getScrollPosition().y;
			} else {
				scrolleY = new CKEDITOR.dom.window(window).getScrollPosition().y;
			}
			posY=posY+scrolleY;
			if (  !isResizing&&( posY < pillar.y - pillar.height || posY > ( pillar.y + pillar.height ) ) )
			{
				detach();
				return 0;
			}
			var resizerNewPosition = posY - Math.round( resizer.$.offsetHeight / 2 );
	
			if ( isResizing )
			{
				if ( resizerNewPosition == topShiftBoundary  )
					return 1;
	
				resizerNewPosition = Math.max( resizerNewPosition, topShiftBoundary );
	
				currentShift = resizerNewPosition - startOffset;
			}
	
			resizer.setStyle( 'top', TableResizeUtil.pxUnit( resizerNewPosition ) );
			
			return 1;
		};
	},
	
	clearPillarsCache: function( evt )
	{
		var target = evt.data.getTarget();
	
		if ( evt.name == 'mouseout' )
		{
			// Bypass interal mouse move.
			if ( !target.is ( 'table' ) )
				return;
	
			var dest = new CKEDITOR.dom.element( evt.data.$.relatedTarget || evt.data.$.toElement );
			while( dest && dest.$ && !dest.equals( target ) && !dest.is( 'body' ) )
				dest = dest.getParent();
			if ( !dest || dest.equals( target ) )
				return;
		}
	
		target.getAscendant( 'table', 1 ).removeCustomData( '_cke_table_pillars' );
		evt.removeListener();
	},
	
	getPreSnapshot : function ( table){
		var preSnapshot = {};
		preSnapshot.width = [];
		preSnapshot.height = [];
		preSnapshot.marginLeft = [];
		preSnapshot.textindent = [];
		dojo.query('td , th', table ).forEach(function(cell, index, arr){
			var tdWidth = CKEDITOR.env.ie ? cell.style.getAttribute('width') : cell.style.getPropertyValue('width');
            preSnapshot.width[cell.id] = tdWidth;
		});	
		dojo.query('tr', table ).forEach(function(tr, index, arr){
			var trHeight = CKEDITOR.env.ie ? tr.style.getAttribute('height') : tr.style.getPropertyValue('height');
            preSnapshot.height[tr.id] = trHeight;
		});
		dojo.query('li , p', table ).forEach(function(node, index, arr){
			var line  = PresCKUtil.ChangeToCKNode(node);
            preSnapshot.marginLeft[node.id] = line.getStyle('margin-left');
            preSnapshot.textindent[node.id] = line.getStyle('text-indent');
		});	
		return preSnapshot;
	},
	
	createWidthCoeditMessage : function ( table, preSnapshot, msgPairList){
		dojo.query('td , th', table).forEach(function(cell, index, arr){
			var prevTdWidth = preSnapshot.width[cell.id];
			var newTdWidth = CKEDITOR.env.ie ? cell.style.getAttribute('width') : cell.style.getPropertyValue('width');
			if ( newTdWidth && newTdWidth != prevTdWidth){
				var dataAttr = {};
				dataAttr.id = cell.id;
    			dataAttr.attributeName = 'style';
				dataAttr.attributeValue = 'width:' + newTdWidth + '; '; 
				var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
				attrObj.oldStyleValue = 'width: ' + prevTdWidth + '; ';
				msgPairList= SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList);
			}
		});
		
		function  _buildMsg( node, valueName )
		{
			var line = PresCKUtil.ChangeToCKNode(node);
			var bMarginLeft = (valueName == 'margin-left');
			var prevValue = bMarginLeft?preSnapshot.marginLeft[node.id]:preSnapshot.textindent[node.id];
			var newValue = line.getStyle(valueName);
			if ( newValue && newValue != prevValue){
				var dataAttr = {};
				dataAttr.id = node.id;
    			dataAttr.attributeName = 'style';
				dataAttr.attributeValue = valueName + ':' + newValue + '; '; 
				var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
				attrObj.oldStyleValue = valueName + ':' + prevValue + '; '; 
				msgPairList= SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList);
			}
		}	
		
		dojo.query('li , p', table).forEach(function(node){
			 _buildMsg( node, 'margin-left' );
			 _buildMsg( node, 'text-indent' );
		});
		return msgPairList;
	},	
	
	createHeightCoeditMessage: function ( table, preSnapshot, msgPairList){
		dojo.query('tr', table).forEach(function(tr, index, arr){
			var prevTrHeight = preSnapshot.height[tr.id];
			var newTrHeight = CKEDITOR.env.ie ? tr.style.getAttribute('height') : tr.style.getPropertyValue('height');
			if ( newTrHeight && newTrHeight != prevTrHeight){
				var dataAttr = {};
				dataAttr.id = tr.id;
				dataAttr.attributeName = 'style';
				dataAttr.attributeValue = 'height:' + newTrHeight + '; '; 
				var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
				attrObj.oldStyleValue = 'height: ' + prevTrHeight + '; ';
				msgPairList= SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList);
			}
		});
		return msgPairList;
	},	
	
	updateResizedTableContentBoxHeight: function( contentBox){
		if ( contentBox){
			contentBox.updateMainNodeHeightBasedOnPxRowHeights();
			if ( contentBox.editor) contentBox.updateCKBodyHeight();
			contentBox.updateHandlePositions(true);
		}
	},
	
	updateResizedTableContentBoxWidth: function( contentBox){
		if ( contentBox){
			contentBox.updateMainNodeWidthBasedOnDataContent();
			if ( contentBox.editor) contentBox.updateCKBodyWidth();
			contentBox.updateHandlePositions(true);
		}
	},
	
	syncCoeditMessageWithEditor: function( contentBox, returnMsgPairList){
		if ( contentBox.editor ){
			for (var i = 0; i < returnMsgPairList.msgList.length; i++) {
				var msg = returnMsgPairList.msgList[i];
				if ( msg){
					PROCMSG.processMessage(msg, contentBox.editor.document.$, PROCMSG.SECK_DOC, false, true);
				}
			}
		}
	},
	
	/**
	 * Copied from tabletools
	 * Create a two-dimension array that reflects the actual layout of table cells,
	 * with cell spans, with mappings to the original td elements.
	 * @param table {CKEDITOR.dom.element}
	 */
	buildTableMap: function( table )
	{
		var aRows = table.$ ? table.$.rows : table.rows;
	
		// Row and Column counters.
		var r = -1 ;
	
		var aMap = [];
	
		for ( var i = 0 ; i < aRows.length ; i++ )
		{
			r++ ;
			!aMap[r] && ( aMap[r] = [] );
	
			var c = -1 ;
	
			for ( var j = 0 ; j < aRows[i].cells.length ; j++ )
			{
				var oCell = aRows[i].cells[j] ;
	
				c++ ;
				while ( aMap[r][c] )
					c++ ;
	
				var iColSpan = isNaN( oCell.colSpan ) ? 1 : oCell.colSpan ;
				var iRowSpan = isNaN( oCell.rowSpan ) ? 1 : oCell.rowSpan ;
	
				for ( var rs = 0 ; rs < iRowSpan ; rs++ )
				{
					if ( !aMap[r + rs] )
						aMap[r + rs] = [];
	
					for ( var cs = 0 ; cs < iColSpan ; cs++ )
					{
						aMap[r + rs][c + cs] = aRows[i].cells[j] ;
					}
				}
	
				c += iColSpan - 1 ;
			}
		}
		return {
			getMap: function(){
				return aMap;
			},
			getCellAbsIndexFromMap: function(cell){
				var rowIndex = cell.getParent().getIndex();
		 		   if(aMap.length < rowIndex)
		 			   return -1;
		 		   var absRow = aMap[rowIndex];
		 		   
		 		   for(var i = 0, len = absRow.length; i < len; i++){
		 			   if(absRow[i] == cell.$){
		 				   return i;
		 			   }
		 		   }
		 		   return -1;
			}
		};
	}
});

(function(){
	TableResizeUtil = new concord.pres.TableResizeUtil();   
})();