
/**
 * Look for table elements in the html content and paste them into the editor
 * 
 * @param htmlContent
 * @returns
 */
dojo.provide("concord.util.presCopyPasteUtil");

dojo.require("concord.util.browser");

concord.util.presCopyPasteUtil.prepareTables = function(data){
	var htmlContent = data.html;	
	if( !htmlContent || htmlContent.toLowerCase().indexOf('<table') == -1)
		return {'html':htmlContent};	
	
	var tableContent = "";
	var editor = window.pe.scene.getEditor();
	var htmlElement = editor.document.createElement('div');
	htmlElement.$.innerHTML = htmlContent;			
	var tables = htmlElement.getElementsByTag('table');
	//here we will paste all tables in the clipboard data
	for(var t = 0; t < tables.count(); t++){
		var table = tables.getItem(t).$;
		if(PresTableUtil.isMergeCell(table)){
			tableContent += " ";	
			break;
		}
		tableContent += table.outerHTML;		
	}
	//remove tables from html content after pasting them
	dojo.query('table',htmlElement.$).forEach(dojo.destroy);	
	htmlContent = htmlElement.$.innerHTML;
	htmlElement.remove();	
	data[ 'html' ] = htmlContent;
	data[ 'tables'] = tableContent||true;
};
concord.util.presCopyPasteUtil.prepareText = function(data){
	if(data.tables || data.images)
		return;
	var htmlElement = CKEDITOR.document.getById('concordTempPasteDiv');
	htmlElement.setHtml( data.html );
	var isNbsp = CKEDITOR.tools.trim( htmlElement.getText() ).match( /^(?:&nbsp;|\xa0)$/ ) == null?false:true;
	if(!(isNbsp
		|| (htmlElement.$.lastChild && dojo.attr(htmlElement.$.lastChild,'_clipboard_id'))))
	{
		var content = concord.util.presCopyPasteUtil.extractTextLineBreak(htmlElement);
		data['text'] = content;
	}	
	htmlElement.setStyle('display','none');
};
//extract the text and line break
concord.util.presCopyPasteUtil.extractTextLineBreak = function(node){
	var content = '';

	if(PresCKUtil.checkNodeName(node,"#text"))
		content += node.data;
	else if(PresCKUtil.checkNodeName(node,"br"))
		content += '\n';
	var children = null;
	if(node.$)
		children = node.$.childNodes;
	else
		children = node.childNodes;
	for(var i=0; i<children.length;i++){
		var child = children[i];
		var isNeedBr = false;
		if(PresCKUtil.checkNodeName(child,'li','p')){
			var last = null;
			if(child.$)
				last = child.$.lastChild;
			else
				last = child.lastChild;
			if(!PresCKUtil.checkNodeName(last,"br"))
				isNeedBr = true;
			
		}
		content += concord.util.presCopyPasteUtil.extractTextLineBreak(child);
		if(isNeedBr)
			content += '\n';
	}
	return content;
};

concord.util.presCopyPasteUtil.pasteTextInViewMode = function(data, mergeUndo) {
	PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
	var htmlElement = CKEDITOR.document.getById('concordTempPasteDiv');
	htmlElement.setHtml( data.html );
	window.pe.scene.slideEditor.addTextBox(data.text);
	PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
};

concord.util.presCopyPasteUtil.pasteInternalListInViewMode = function(listData) {
	PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
	window.pe.scene.slideEditor.addTextBox(listData,true);
	PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
};

concord.util.presCopyPasteUtil.getContentBoxType = function(node) {
	var drawFrameNode = node.$;
	if (!dojo.hasClass(node.$,'draw_frame'))
		drawFrameNode = dojo.query('div.draw_frame', node.$)[0];
	var contentBoxType = PresConstants.CONTENTBOX_TEXT_TYPE;
	if (drawFrameNode) {
		var presentationClass = dojo.attr(drawFrameNode, 'presentation_class');

		var images = drawFrameNode.getElementsByTagName('img');
		if (images.length >0 || dojo.hasClass(drawFrameNode, 'draw_image'))
			contentBoxType = PresConstants.CONTENTBOX_IMAGE_TYPE;
		
		var tables = drawFrameNode.getElementsByTagName('table');
		if (tables.length >0)
			contentBoxType = PresConstants.CONTENTBOX_TABLE_TYPE;
		
		if (dojo.hasClass(drawFrameNode, 'draw_custom-shape'))
			contentBoxType = PresConstants.CONTENTBOX_SHAPE_TYPE;
	}
	return contentBoxType;
};


concord.util.presCopyPasteUtil.getPastedNodePositionSize = function(mainNode) {
	var styles = dojo.attr(mainNode.$,'style');
	if (!styles)
		return null;
	var inlineStyles = styles.split('\;');
	var topValue,leftValue,widthValue,heightValue;
	for ( var t = 0 ; t < inlineStyles.length; t++)
	{
		var styleValue = inlineStyles[t];
		var styleNameValue = styleValue.split(':');
		var styleName = styleNameValue[0];
		var styleValue = styleNameValue[1];
		if (styleName.match(/top/)){
			topValue = styleValue;
		} else if (styleName.match(/left/)){
			leftValue = styleValue;
		} else if (styleName.match(/width/)){
			widthValue = styleValue;
		} else if (styleName.match(/height/)){
			heightValue = styleValue;
		}
	}
	return {
			top : topValue,
 			left : leftValue,
 			width : widthValue,
 			height : heightValue
 		};
};

concord.util.presCopyPasteUtil.createNewContentBox = function(mainNode, contentBoxType) {
    var newContentBox = null;
    var ckMainNode = PresCKUtil.ChangeToCKNode(mainNode);

    if (ckMainNode == null || contentBoxType == null)
    	return;
    	
    var dataNode = ckMainNode.getChild(0);
    while (dataNode && !PresCKUtil.checkNodeName(dataNode,'div')
    		&& !PresCKUtil.checkNodeName(dataNode,'img')
    		&& !PresCKUtil.checkNodeName(dataNode,'table')){
    	dataNode = dataNode.getNext();
    }
    var ckDataNode = PresCKUtil.ChangeToCKNode(dataNode);
    if (ckDataNode == null)
    	return;
    
    // remove comments
    if(dojo.attr(ckMainNode.$, 'comments') != null)
    {   
    	ckMainNode.removeAttribute('comments');
    }
    if(dojo.attr(ckMainNode.$, 'commentsId') != null)
    {   
    	ckMainNode.removeAttribute('commentsId');
    }
    
    var slideEditor = window.pe.scene.slideEditor;
    slideEditor.setNodeId(ckMainNode.$,PresConstants.CONTENTBOX_PREFIX);
    slideEditor.setNodeId(ckDataNode.$,PresConstants.CONTENTBOX_DATA_PREFIX);

    var positionSize = concord.util.presCopyPasteUtil.getPastedNodePositionSize(ckMainNode);
    if (!positionSize || positionSize == null)
    	return null;
    
    var opts ={
            'CKEDITOR':CKEDITOR,
            'mainNode':ckMainNode.$,
            'CKToolbarSharedSpace': slideEditor.CKToolbarSharedSpace,              
            'contentBoxDataNode':ckDataNode.$,
            'parentContainerNode':slideEditor.mainNode,                    
            'deSelectAll':dojo.hitch(slideEditor,slideEditor.deSelectAll),
            'deSelectAllButMe':dojo.hitch(slideEditor,slideEditor.deSelectAllButMe),
            'initialPositionSize':
            	{'left': parseFloat(positionSize.left),
            	 'top':  parseFloat(positionSize.top),
            	 'width':  parseFloat(positionSize.width),
            	 'height':  parseFloat(positionSize.height)},
            'copyBox': true,
            'isMultipleBoxSelected': dojo.hitch(slideEditor,slideEditor.isMultipleBoxSelected),
            'publishSlideChanged':dojo.hitch(slideEditor,slideEditor.publishSlideChanged),
            'getzIndexCtr': dojo.hitch(slideEditor,slideEditor.getzIndexCtr),
            'setzIndexCtr': dojo.hitch(slideEditor,slideEditor.setzIndexCtr),
            'toggleBringToFront':dojo.hitch(slideEditor,slideEditor.toggleBringToFront),
            'toggleSendToBack':dojo.hitch(slideEditor,slideEditor.toggleSendToBack),                          
            'openAddNewImageDialog':dojo.hitch(slideEditor,slideEditor.openAddNewImageDialog),
            'getActiveDesignTemplate':dojo.hitch(slideEditor,slideEditor.getActiveDesignTemplate),
            'deRegisterContentBox' : dojo.hitch(slideEditor,slideEditor.deRegisterContentBox),
            'deleteSelectedContentBoxes' : dojo.hitch(slideEditor,slideEditor.deleteSelectedContentBoxes),
            'pasteSelectedContentBoxes'  : dojo.hitch(slideEditor,slideEditor.pasteSelectedItems),
            'copySelectedContentBoxes'   : dojo.hitch(slideEditor,slideEditor.copySelectedItems),                                     
            'createIndicatorSytle':dojo.hitch(slideEditor,slideEditor.createIndicatorSytle),      
            'getInLineStyles':dojo.hitch(slideEditor,slideEditor.getInLineStyles),
            'handleMultiBoxSelected': dojo.hitch(slideEditor,slideEditor.handleMultiBoxSelected),
            'getMasterTemplateInfo' : dojo.hitch(slideEditor,slideEditor.getMasterTemplateInfo),
            'checkBoxPosition' : dojo.hitch(slideEditor,slideEditor.checkBoxPosition),
            'addImageContentBox': dojo.hitch(slideEditor,slideEditor.addImageContentBox),
            'contentBoxType': contentBoxType
           };
    
    if (opts.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) {
    	newContentBox = new concord.widgets.txtContentBox(opts);
    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE) {
    	newContentBox = new concord.widgets.imgContentBox(opts);
    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
    	if (PresCKUtil.isConnectorShape(opts.mainNode))
    		newContentBox = new concord.widgets.connectorShapeContentBox(opts);
    	else
    		newContentBox = new concord.widgets.shapeContentBox(opts);
    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) {
    	newContentBox = new concord.widgets.tblContentBox(opts);   
    }
                   
    return newContentBox;
};

concord.util.presCopyPasteUtil.getImageUrl = function(node) {
	if (node == null)
		return null;
	
	var imgNodes = node?node.$.querySelectorAll('img.draw_image'):null;

	if (imgNodes == null || imgNodes.length > 1)
		return null;
	
	var imgUrl = imgNodes[0]?dojo.attr(imgNodes[0], 'src') : '';
	imgUrl = imgUrl.replace(/%20/g,' ');
	return imgUrl;
};

concord.util.presCopyPasteUtil.sortZIndexArray = function(pasteElements){
	var zArray = [];
	if(pasteElements)
	{
		for (var i=0; i<pasteElements.length; i++){
        	var ckNode = new CKEDITOR.dom.element(pasteElements[i]);
        	var zIndex = ckNode.$.style.zIndex;
        	if (!zIndex) {
        		var visibleStyle = dojo.attr( ckNode.$, '_visibleStyle');
        		if (visibleStyle) {
        			var inlineStyles = visibleStyle.split('@');
        			zIndex = inlineStyles.length > 6 ? inlineStyles[6] : 0;
        		}
        	}
        	var zOrder = zIndex?zIndex:0;
        	zArray.push({'index':i,'zIndex':zOrder});
        	dojo.destroy(ckNode);
        }
        zArray.sort(function(a,b){
        	if(a.zIndex == b.zIndex)
        		return 0;
        	else if(a.zIndex < b.zIndex)
        		return -1;
        	else
        		return 1;
        });
	}	
    return zArray;
};

concord.util.presCopyPasteUtil.processDataFromExternalPresentation = function(divNode) {
	if (!divNode || divNode == null)
		return;
	
	if (dojo.hasClass(divNode.$,'draw_frame')){
		dojo.removeClass(divNode.$,'draw_chart_image');
		dojo.removeAttr(divNode.$,'_clipboard_id');
		dojo.removeAttr(divNode.$,'_moz_resizing');
		dojo.removeAttr(divNode.$,'_moz_abspos');
		dojo.removeAttr(divNode.$,'style');
		dojo.removeAttr(divNode.$,'presentation_placeholder_index');
		dojo.removeAttr(divNode.$,'presentation_placeholder');
		dojo.removeAttr(divNode.$,'draw_transform');
		dojo.removeAttr(divNode.$,'clipinfo');
		if (divNode.$.querySelectorAll('table').length>0)
			dojo.attr(divNode.$,'presentation_class','table');
		else if (PresCKUtil.checkNodeName(divNode.$.firstChild,'img'))
			dojo.attr(divNode.$,'presentation_class','graphic');
		else if (divNode.$.querySelectorAll('img.draw_image').length>0 ||
				dojo.hasClass(divNode.$,'draw_image'))
			dojo.attr(divNode.$,'presentation_class','group');
		else
			dojo.removeAttr(divNode.$,'presentation_class');
	}
	
	dojo.query('div', divNode.$).forEach(function(_node){
		if (dojo.hasClass(_node, 'draw_frame')) {
			dojo.removeClass(_node,'draw_chart_image');
			dojo.removeAttr(_node,'_clipboard_id');
			dojo.removeAttr(_node,'_moz_resizing');
			dojo.removeAttr(_node,'_moz_abspos');
			dojo.removeAttr(_node,'style');
			dojo.removeAttr(_node,'presentation_placeholder_index');
			dojo.removeAttr(_node,'presentation_placeholder');
			if (_node.querySelectorAll('table').length==0 &&
					_node.querySelectorAll('img.draw_image').length==0)
				dojo.removeAttr(_node,'presentation_class');
		} else if (dojo.hasClass(_node, 'contentBoxDataNode') ||
				dojo.hasClass(_node, 'table_table')){
			dojo.removeAttr(_node,'style');
			dojo.attr(_node,'style','height: 100%; width: 100%; visibility: visible;');
		} else if (dojo.hasClass(_node,'draw_frame_classes')){
			dojo.style( _node,  {
				'width': '100%',
				'height' : '100%',
				'border' : 'none',
				'padding' : '',
				'padding-left' : '',
				'padding-right' : ''
			});
			dojo.removeAttr(_node,'automatic_color');
			dojo.removeAttr(_node,'pseudo_bg_color');
		} else if (dojo.hasClass(_node,'g_draw_frame')){
			dojo.attr(_node,'style','position:absolute;left:0%;top:0%;width:100%;height:100%;');
		} else if (dojo.hasClass(_node,'draw_text-box')){
			dojo.attr(_node,'style','width:100%;height:100%;');
		} else {
			dojo.attr(_node,'style','display:table;height:100%;width:100%;table-layout:fixed;');
		}
	});
	
	// the font node always been added when paste on IE,
	dojo.query('font', divNode.$).forEach(function(_node){
		var parentNode = _node.parentNode;
		if (!parentNode || parentNode == null)
			return;
		var childNode = _node.firstChild;
		while (childNode) {
			parentNode.insertBefore( childNode, _node );
			childNode = _node.firstChild;
		}
		dojo.destroy(_node);
	});
	
	dojo.query('ul,ol,p,li,span,th,td', divNode.$).forEach(function(_node){
		var ckElem = PresCKUtil.ChangeToCKNode(_node);
		dojo.style( _node,  {
			'-webkit-tap-highlight-color': '',
			'-webkit-text-stroke-width' : '',
			'padding' : '',
			'padding-left' : '',
			'padding-right' : ''
		});
		if (PresCKUtil.checkNodeName(ckElem, 'ul','ol')){
			ckElem.setStyle('padding-left:0%;margin-left:0%;text-indent:0%;');
		}
	});
	
	
	var htmlContent = concord.util.presCopyPasteUtil.cleanStyles(divNode.$.innerHTML);
	htmlContent = concord.util.presCopyPasteUtil.UpdateID(htmlContent);
	htmlContent = concord.util.presCopyPasteUtil.fixTables(htmlContent);
	divNode.$.innerHTML = htmlContent;
	var firstChild = divNode.getChild(0);
	while (firstChild && PresCKUtil.checkNodeName(firstChild,'font')){
		dojo.destroy(firstChild.$);
		firstChild = divNode.getChild(0);
	}
	
	dojo.query('img.draw_image', divNode.$).forEach(function(_node){
		var imgNode = PresCKUtil.ChangeToCKNode(_node);
		var parDivNode = imgNode.getParent();
		if (parDivNode && PresCKUtil.checkNodeName(parDivNode,'div') &&
				parDivNode.hasClass('g_draw_frame')){
			dojo.attr(parDivNode.$,'presentation_class','graphic');
		}
	});
	
	// process hyperlink
	dojo.query('a', divNode.$).forEach(function(_node){
		var ckANode = PresCKUtil.ChangeToCKNode(_node);
		var ckParentNode = ckANode.getParent();
		var insertType = 0; // 0: insert as child, 1: insert after previous, 2: insert before next sibling
		var insertPosNode = ckParentNode;
		if (ckParentNode && PresCKUtil.checkNodeName(ckParentNode, 'span')){
			var textContent = TEXTMSG.getTextContent(ckANode.$);
			TEXTMSG.setTextContent(ckParentNode.$, textContent);
		} else if (ckParentNode && PresCKUtil.checkNodeName(ckParentNode, 'p','li')){
			// if ckANode has previous siblings or poster siblings
			var prevSiblings = ckANode.getPrevious();
			if (prevSiblings) {
				insertType = 1;
				insertPosNode = prevSiblings;
			} else {
				var postSiblings = ckANode.getNext();
				if (postSiblings) {
					insertType = 2;
					insertPosNode = postSiblings;
				}
						
			}
			var spans = dojo.query('span', ckANode.$);
			if (spans.length == 0){
				var textContent = TEXTMSG.getTextContent(ckANode.$);
				var newSpan = CKEDITOR.dom.element.createFromHtml('<span>' + textContent + '</span>');
				switch (insertType){
					case 0: // insert as child
						insertPosNode.$.appendChild(newSpan.$);
						break;
					case 1: // insert after previous
						newSpan.insertAfter(insertPosNode);
						break;
					case 2: // insert before next sibling
						newSpan.insertBefore(insertPosNode);
						break;
				}
			} else {
				for(var j=0; j< spans.length; j++) {
					var ckSpanNode = PresCKUtil.ChangeToCKNode(spans[j]);
					switch (insertType){
					case 0: // insert as child
						insertPosNode.$.appendChild(ckSpanNode.$);
						break;
					case 1: // insert after previous
						ckSpanNode.insertAfter(insertPosNode);
						insertposNode = ckSpanNode;
						break;
					case 2: // insert before next sibling
						ckSpanNode.insertBefore(insertPosNode);
						break;
					}
				}
					
				// process <u><font>
				dojo.query('u',ckSpanNode.$).forEach(function(_node){
					var parentNode = _node.parentNode;
					var textContent = TEXTMSG.getTextContent(_node);
					TEXTMSG.setTextContent(parentNode, textContent);
					dojo.destroy(_node);
				});
			}
		}
		dojo.destroy(_node);
	});
	return divNode;
};

concord.util.presCopyPasteUtil.createNewSlide = function() {
	// new slide page based on current and remove all the objects on it
	var slideSorter = pe.scene.slideSorter;
	var slideEditor = pe.scene.slideEditor;
	var newSlide = slideSorter.createSlide(slideSorter.selectedSlide,null,true);
	slideEditor.loadSlideInEditor(newSlide,true,slideEditor.mainNode.id,null);
	return newSlide;
};

concord.util.presCopyPasteUtil.pasteObjectsFromExternalPres = function(dataNode, docID, objList) {
	var slideEditor = window.pe.scene.slideEditor;
	var slideSorter = window.pe.scene.slideSorter;

	var ckData = PresCKUtil.ChangeToCKNode(dataNode);
	var divs = ckData?ckData.$.querySelectorAll('div.draw_frame'):null;
	objList =[];
	
	if (divs){
		var isMultipleBoxSelected = divs.length > 1 ? true : false;
		var zArray = concord.util.presCopyPasteUtil.sortZIndexArray(divs);
         
		var deviation = {left:0,top:0};
		for (var i=0; i<zArray.length; i++){
		    var objectCopy = null;
		    var node = divs[zArray[i].index];
			
		    var ckNode = new CKEDITOR.dom.element(node);
		    if (PresCKUtil.checkNodeName(ckNode,'div') && ckNode.hasClass('draw_frame') ) {
		    	// skip notes
			    var presentation_class = dojo.attr(ckNode.$,'presentation_class');
			    if (presentation_class == 'notes')
			    	continue;
			    
			    var visibleStyle = dojo.attr(ckNode.$,'_visiblestyle');
		    	// skip background objects, like page-number, footer and datetime
			    if (visibleStyle && (visibleStyle.match(/backgroundobjects/) ||
			    		visibleStyle.match(/emptyPlaceholder/) || visibleStyle.match(/notes/)
			    		|| visibleStyle.match(/footer/) || visibleStyle.match(/page-number/)))
			    	continue;
		    }
		    
		    var contentBoxType = concord.util.presCopyPasteUtil.getContentBoxType(ckNode);
		    if (contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE)
		        continue;
		    
		    if (contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
		    	var tableNode = dojo.query('table', ckNode.$)[0];
		    	if (PresTableUtil.isMergeCell(tableNode))
		    		continue;
		    }
		    
		    ckNode = concord.util.presCopyPasteUtil.processDataFromExternalPresentation(ckNode);
		    
		    PresListUtil._DeCodingDataForBrowser(ckNode, true);
		    ckNode = concord.util.presCopyPasteUtil.removeIndicatorForCopy(ckNode.$);
		    ckNode = concord.util.presCopyPasteUtil.addIndicatorForPaste(ckNode.$);
		    PresListUtil.updateMasterStyles(ckNode);
				
		    var newContentBox = concord.util.presCopyPasteUtil.createNewContentBox(ckNode, contentBoxType);
		    if (newContentBox == null)
		        continue;
			
		    var imgUrl = null;
		    if (contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE) {
		        imgUrl = concord.util.presCopyPasteUtil.getImageUrl(ckNode);
		    }
		    if(i==0){
		        var posLeft = newContentBox.initialPositionSize.left;
		        var posTop = newContentBox.initialPositionSize.top;
		        var posWidth = newContentBox.initialPositionSize.width;
		        var posHeight = newContentBox.initialPositionSize.height;
		        var newPos = slideEditor.getNewPastePosition({left:posLeft,top:posTop,width:posWidth,height:posHeight});
		        deviation.left = newPos.left - posLeft;
		        deviation.top = newPos.top - posTop;
		    }
		    var newinitialPositionSize = newContentBox.initialPositionSize;
		    newinitialPositionSize.left = newinitialPositionSize.left + deviation.left;
		    newinitialPositionSize.top = newinitialPositionSize.top + deviation.top;
		    newContentBox.pasteBox(docID,imgUrl,"", isMultipleBoxSelected, true);
		    slideEditor.registerContentBox(newContentBox);
		    PresCKUtil.updateRelativeValue(newContentBox.contentBoxDataNode);
		    
		    objList = slideEditor.buildMultipleInsertObjList(newContentBox,objList);
		}
		var data = {'nodeList':objList};
		return slideSorter.handleMultipleInsertNodeFrameFromSlideEditor(data,true);
	}
};

concord.util.presCopyPasteUtil.pasteSingleSlideFromExternalPres = function(slideData, docID, objList) {	
	var	newSlide = concord.util.presCopyPasteUtil.createNewSlide();
	
	concord.util.presCopyPasteUtil.pasteObjectsFromExternalPres(slideData, docID, objList);
	return newSlide;
	
};

concord.util.presCopyPasteUtil.pasteDataFromExternalPresentation = function(data, docID) {
//	// query all objects in the clipboard
	var slideEditor = window.pe.scene.slideEditor;
	var slideSorter = window.pe.scene.slideSorter;
	var ckData = dojo.clone(PresCKUtil.ChangeToCKNode(data));
	var drawPages = ckData? ckData.$.querySelectorAll('div.draw_page'):null;
	
	if (drawPages.length > slideSorter.maxPasteSlidesNum){
		slideSorter.showPastedSlideNumCheckMsg();
		return;
	}
	
	// justify the slide number, to keep the max pages rule
	if(slideSorter.officePrezDiv!=null){
		var allSlides = dojo.query('.draw_page',slideSorter.officePrezDiv);
		if(allSlides != null && allSlides.length + drawPages.length> slideSorter.maxSlideNum){
			slideSorter.showSlideNumCheckMsg();
			return;
		}
	}
	
	slideEditor.deSelectAll();
	slideSorter.currentInPaste = true;
	
	// disable multi-page copy&paste
	if (drawPages && drawPages.length >= 1) {
		slideSorter.showPasteMsg();
	}
	// allow browser render paste msg firstly.
	setTimeout(function(){
		concord.util.presCopyPasteUtil.pasteDataFromExternalPresentationPhase2(data, docID, drawPages);
	}, 10);
};

concord.util.presCopyPasteUtil.pasteDataFromExternalPresentationPhase2 = function(data, docID, drawPages)
{
	var slideEditor = window.pe.scene.slideEditor;
	var slideSorter = window.pe.scene.slideSorter;
	var pasteSlides = false;
	var objList = [];
	var msgPairList = []; 
	if (drawPages && drawPages.length >= 1) {
		pasteSlides = true;
		for (i = 0; i<drawPages.length;i++){
			var slideData = drawPages[i];
			var newSlide = concord.util.presCopyPasteUtil.pasteSingleSlideFromExternalPres(slideData, docID, objList);
			msgPairList = SYNCMSG.createInsertNodeMsgPair(newSlide.parentNode, msgPairList);
		}
	} else {
		msgPairList = concord.util.presCopyPasteUtil.pasteObjectsFromExternalPres(data, docID, objList);
	}
	
	if(slideSorter.preListCssStyleMSGList && slideSorter.preListCssStyleMSGList.length>0){				
		msgPairList[0].msg.updates[0].p_iclb=slideSorter.postListCssStyleMSGList;
		msgPairList[0].rMsg.updates[0].p_iclb=slideSorter.preListCssStyleMSGList;
		slideSorter.postListCssStyleMSGList = null;
		slideSorter.preListCssStyleMSGList = null;
	}     
	SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
	if (pasteSlides)
		slideEditor.deSelectAll();
	if(slideSorter.spellChecker && slideSorter.spellChecker.isAutoScaytEnabled()){
		for(var i=0; i<objList.length; i++)
		{
			var nodes = dojo.query("[id=" + objList[i].node.id + "]",slideSorter.spellChecker.document);
			if(nodes && nodes.length)
				slideSorter.spellChecker.checkNodes(nodes[0], nodes[0], null);
		}
	}
	slideSorter.currentInPaste = false;
	slideSorter.hidePasteMsg();
};

/**
 * For table, copy cells and paste as a new table will call this function.
 * @param data
 * @param mergeUndo
 */
concord.util.presCopyPasteUtil.pasteData = function(data, mergeUndo) {
	var atleastOneItemAlreadyPasted = false;
	var tablesHtmlContent = null;
	var imagesHtmlContent = null;
	if(data.tables ===true)
		return;
	if(data.tables)
		tablesHtmlContent = data.tables;		
	if(data.images)
		imagesHtmlContent = data.images;
		
	var editor = window.pe.scene.getEditor();
	if(tablesHtmlContent){
		
		//select multiple objects and ctrlC
		PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
	
		var htmlElement = editor.document.createElement('div');
		htmlElement.$.innerHTML = tablesHtmlContent;
		//D30026: [Regression][Chrome]Copy table from other app to presentation, font size display on thumbnail page  verfy bigger
		dojo.attr(htmlElement.$,'pfs','18');
		//D28077: [Regression][FF]Font size in thumbnail same as font size in pasted cell
		PresCKUtil.updateRelativeValue(htmlElement.$,[PresConstants.ABS_STYLES.FONTSIZE]);
		
		//here we will paste all tables in the clipboard data
		dojo.query('table',htmlElement.$).forEach(function(node){
			
			//if copy cells from other app(e.g. power point/word), then paste in view mode. 
			//there would be no _width/_height, so check them.
			var _width = dojo.attr(node, "_width");
			var tableW = _width ? PresTableUtil.retriveFromAbsWidthValue(parseFloat(_width)) : null;// in px
			var _height = dojo.attr(node, "_height");
			var tableH = _height ? PresTableUtil.retriveFromAbsHeightValue(parseFloat(_height)) : null;// in px
			
			//step1, create draw frame
			var contentBox = window.pe.scene.slideEditor.createDrawFrameNodeForTable(node);
			
			//step2 update margin and indent
			if(contentBox.mainNode){
				//step 2.1, update order is important
				if(tableW && tableH){
					dojo.style(contentBox.mainNode, 'width', contentBox.PxToPercent(tableW, "width") + "%");
					dojo.removeAttr(contentBox.mainNode, '_width');
					dojo.style(contentBox.mainNode, 'height', contentBox.PxToPercent(tableH, "height") + "%");
					dojo.removeAttr(contentBox.mainNode, '_height');
					PresTableUtil.updateRowHeightForCopyPaste(contentBox.contentBoxDataNode, tableH);
					//browser add width to td/th automatically, need to remove it.
					dojo.query("td, th", contentBox.contentBoxDataNode).forEach(function(cell){
						dojo.style(cell, 'width', "");
					});
					
					if (dojo.isIE){
						dojo.style(contentBox.contentBoxDataNode, {
							width : tableW + "px",
							height : tableH + "px"
						});
					}
					
				}else{
					//copy from power point, colgroup from clipboard is not correct, update it.
					//anyway, from word, there is no colgroup from clipboard
					PresTableUtil.updateTableColgroup(contentBox.contentBoxDataNode, true);
					
					//copy from excel, tr height is in px, needs to update.
					PresTableUtil.updateRowHeightToPc(contentBox.contentBoxDataNode);
				}
				
				PresCKUtil.updateRelativeValue(contentBox.mainNode,[PresConstants.ABS_STYLES.TEXTINDENT,PresConstants.ABS_STYLES.MARGINLEFT]);
				PresCKUtil.duplicateListBeforeStyleInSlide(contentBox.mainNode);
				contentBox.updateHandlePositions();
			}
			var divId = node.parentNode.id;
			
			//step3, update sorter
			contentBox.publishInsertNodeFrame(null, true);
			
			//step3, create insert table message
        	var dfNode = PROCMSG._getSorterDocument().getElementById(divId);
        	msgPair = SYNCMSG.createInsertNodeMsgPair(dfNode);
        	if(msgPair instanceof Array){
        		msgPair = msgPair[0];
        	}
			
        	if(msgPair){
         		msgPair = SYNCMSG.addUndoFlag(msgPair, true);
         	}else{
         		console.log("! Failed to create InsertDrawFrameNode message for table.");
         	}
        	
        	PresCKUtil.doUpdateListStyleSheet();
			if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){
				msgPair.msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
				msgPair.rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
				pe.scene.slideSorter.postListCssStyleMSGList = null;
				pe.scene.slideSorter.preListCssStyleMSGList = null;
			}
			
         	//step5, add to undo stack
         	SYNCMSG.sendMessage([msgPair], SYNCMSG.NO_LOCAL_SYNC);
		});
		PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
	}
	
	if(imagesHtmlContent){
		PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
		var htmlElement = editor.document.createElement('div');
		htmlElement.$.innerHTML = imagesHtmlContent;
		//here we will paste all tables in the clipboard data
		dojo.query('img',htmlElement.$).forEach(function(node,index,arr){											
			window.pe.scene.slideEditor.addImageContentBox([dojo.attr(node,'src')],{'width':dojo.style(node,'width'),'height':dojo.style(node,'height')});
		});
		PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
	}		
};

// D26745 : fix the list structure for the paste data on ie, 
// that a extra <p> will be added on ie under <li>
concord.util.presCopyPasteUtil.removePInLi = function(node){
	// fix the list structure copied on ie, that there will be <p> node
	// under list, which is illegal and may result in error
	var pNodes = dojo.query('li > p', node);
	for (var i=0;i<pNodes.length;i++){
		var pNode = pNodes[i];
		var childNodes = pNode.childNodes;
		for (var j=0;j<childNodes.length;j++) {
			var childNode = CKEDITOR.dom.node(childNodes[j]);
			var newNode = childNode.clone(true);
			newNode.insertBefore(CKEDITOR.dom.node(pNode));
		}
		if (childNodes.length > 0){
			dojo.addClass(pNode,'removeThisNode');
		}
	}
	dojo.query('.removeThisNode',node).forEach(dojo.destroy);
};

concord.util.presCopyPasteUtil.prepareBrowserCopyPasteRange = function (_range,editor,doc,evt,mode)
{
	var sel = editor.getSelection();
	var range = null;
	if(!_range)
		range = new CKEDITOR.dom.range( doc );
	else
		range = _range;

	// Create container to paste into
	var pastebin = new CKEDITOR.dom.element( mode == 'text' ? 'textarea' : CKEDITOR.env.webkit && !CKEDITOR.env.mobile? 'body' : 'div', doc );
	pastebin.setAttribute( 'id', 'cke_pastebin' );
	// Safari requires a filler node inside the div to have the content pasted into it. (#4882)
	CKEDITOR.env.webkit && pastebin.append( doc.createText( '\xa0' ) );
	doc.getBody().append( pastebin );
	
 	if (concord.util.browser.isMobile()) {
		pastebin.setStyles({
			position : 'relative',
			top : '-1000px',
			opacity : 0.0,
			overflow : 'hidden'
//			width : '1100px',
//			height : '1px',
//			display : 'none'
		});
 	} else {
 		try{
 			pastebin.setStyles({
 				position : 'absolute',
 				// Position the bin exactly at the position of the selected element
 				// to avoid any subsequent document scroll.
 				top : sel.getStartElement().getDocumentPosition().y + 'px',
 				width : '1px',
 				height : '1px',
 				overflow : 'hidden'
 			});
		}catch(e){
			if (editor.isTable==true && editor.ctrlA==true){
				//for presentation we will not incur scrolling so no need to set top
				pastebin.setStyles(
						{
							position : 'absolute',
							width : '1px',
							height : '1px',
							overflow : 'hidden'
						});
				//we do need to ensure a selection is made
				//since this is ctrla we can set focus to first cell
				// TODO(lijiany): Below code is unnecessary, should be removed in later refector.
				var tbody = PresCKUtil.getDFCNode(editor); 
				var p = tbody.getElementsByTagName('p')[0];
				if (p) {
					var pCK = new CKEDITOR.dom.element(p);
					sel.reset();
					var r = new CKEDITOR.dom.range(editor.document);
					r.setStartBefore( pCK );
					r.setEndAfter( pCK );
					sel.selectRanges(r);
					sel = editor.getSelection();
				}
			}			
		}
	}

	// It's definitely a better user experience if we make the paste-bin pretty unnoticed
	// by pulling it off the screen.
	pastebin.setStyle( editor.config.contentsLangDirection == 'ltr' ? 'left' : 'right', '-1000px' );

	var origRanges = sel.getRanges(); //D14458
	var origRange = origRanges[0];
	// Turn off design mode temporarily before give focus to the paste bin.
	if ( mode == 'text' )
	{
		if ( CKEDITOR.env.ie )
		{
			var ieRange = doc.getBody().$.createTextRange();
			ieRange.moveToElementText( pastebin.$ );
			ieRange.execCommand( 'Paste' );
			evt.data.preventDefault();
		}
		else
		{
			doc.$.designMode = 'off';
			pastebin.$.focus();
		}
	}
	else
	{
		range.setStartAt( pastebin, CKEDITOR.POSITION_AFTER_START );
		range.setEndAt( pastebin, CKEDITOR.POSITION_BEFORE_END );
		range.select( true );
	}
	
	return pastebin;
};


/**
 * This method is used to process data from system clipboard.
 *
 * @param htmlContent
 * @param event
 */
concord.util.presCopyPasteUtil.processClipboardData = function(htmlContent, fromKeypress, elem, bFromExt){
	var editor = window.pe.scene.getEditor();
	var fromExt = bFromExt?true:false;	
	//sometimes copying from Symphony adds some invalid info text at the beginning of the data
	//we want to trip that out.
	if(!bFromExt && (htmlContent.toLowerCase().indexOf("version") == 0)){
		htmlContent = htmlContent.replace(/Version[^<]*/ig,'');
		fromExt = true;
	}
	//check is paste data is from word or if data contains <font tags 
	//assume it is external data and attempt to clean.		
	if(( /(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ ).test( htmlContent ))
		//D26136: [Chrome]copy text and paste, font name and font color are incorrect
		//|| htmlContent.indexOf('<div') != -1 || htmlContent.indexOf('<font') != -1
	{
		//this is a workaround for identifying lists in PowerPoint data
		while(htmlContent.indexOf('mso-special-format') != -1){
			htmlContent = htmlContent.replace('mso-special-format:','concord-list:');
		}			
		
		if(dojo.isChrome || dojo.isSafari){				
			//the cleanWord code is not properly converting lists in MS Word so
			//workaround for now is all lists copied from MS Word will be marked as unordered lists.
			while(htmlContent.indexOf('mso-list:') != -1){
				htmlContent = htmlContent.replace('mso-list:','chrome-list:');
			}					
			//this will be used in presCopyPasteUtil.cleanStyles() to identify it as a list item
		}
		
		htmlContent = CKEDITOR.cleanWord && CKEDITOR.cleanWord( htmlContent, editor );
		if(!bFromExt)
			fromExt = true;
		
		//D27432: [Regression]Empty space is lost after copy from MS Office to IBM docs
		//strip all &nbsp; from htmlContent
//		while(htmlContent.indexOf('&nbsp;') != -1)
//			htmlContent = htmlContent.replace('&nbsp;','');
		
		//find preserved list format from PowerPoint data and convert to attr for conversion to list later.
		while(htmlContent.indexOf('<span style="concord-list:') != -1){
			htmlContent = htmlContent.replace('<span style="concord-list:','<span concordList=');
		}
		//D23562: [Regression][CopyPaste][FF/Chrome] Copy text with blank space from Symphony Documents to concord , the first blank space disappear
		var charValue=String.fromCharCode(10);
		htmlContent = htmlContent.replace(new RegExp(charValue, "gm"), ' ');
	}		
	if(!bFromExt && (htmlContent.indexOf('<table')==0 && htmlContent.indexOf('smartTable') > 0 && htmlContent.indexOf('ibmdocsTable') > 0 )){
		fromExt = false;
	}
	//strip out any newLine chars
	htmlContent = htmlContent.replace(/[\t\n]*/ig,'');
	
	htmlContent = htmlContent.replace( /(<!--.*?-->)/gm, '' );
	
	//re-fix D31262 for D35122: [Regression] Space char before misspelled words is lost after copy from pptx/ppt to IBM Docs.
	//htmlContent = htmlContent.replace(/\>+\s+\<+/g,'><');
	htmlContent = htmlContent.replace(/>+\s+<td/g,'><td');
	htmlContent = htmlContent.replace(/>+\s+<th/g,'><th');
	htmlContent = htmlContent.replace(/>+\s+<tr/g,'><tr');
	htmlContent = htmlContent.replace(/>+\s+<tbody/g,'><tbody');
	htmlContent = htmlContent.replace(/>+\s+<table/g,'><table');
	htmlContent = htmlContent.replace(/>+\s+<\/td/g,'><\/td');
	htmlContent = htmlContent.replace(/>+\s+<\/th/g,'><\/th');
	htmlContent = htmlContent.replace(/>+\s+<\/tr/g,'><\/tr');
	htmlContent = htmlContent.replace(/>+\s+<\/tbody/g,'><\/tbody');
	htmlContent = htmlContent.replace(/>+\s+<\/table/g,'><\/table');
	
	//D16785: [Table][FF][CopyPaste] Copy/Paste the line2 in a cell,the first line is also selected
	//Sometime, the br will be included at the start, remove it.'
	var atstart = htmlContent.indexOf('<br class=\"hideInIE\">');
	if(atstart == 0) htmlContent = htmlContent.replace('<br class=\"hideInIE\">', '');
	
//	To embed pure text in <span> for copied data from ie. 
	if(dojo.isIE){
		var htmlElement = CKEDITOR.document.getById('concordTempPasteDiv');
		htmlElement.setHtml( htmlContent );
		var tmpContent = '';
		var child = htmlElement.$.firstChild;
		while(null != child )
		{
			if(child.nodeType == CKEDITOR.NODE_TEXT)
			{
				var pureData = child.data.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
				tmpContent = tmpContent + '<span>' + pureData + '</span>';
			}
			else
			{
				if (child.nodeType == CKEDITOR.NODE_ELEMENT && 
					(child.nodeName.toLowerCase() == 'ol' || child.nodeName.toLowerCase() == 'ul')){
					concord.util.presCopyPasteUtil.removePInLi(child);
				}
				tmpContent = tmpContent + PresCKUtil.getOuterHtml(child);
			}
			child = child.nextSibling;
		}
		htmlContent = tmpContent;
		htmlElement.setHtml('');
	}
	
	if(dojo.isChrome || dojo.isSafari){
		//this is a workaround for an issue when copying Lists from MSoffice in chrome
		//it wants to put the list items wrapped in a div and strips out anything to indicate it is from msoffice 
		//so the assumption we are making here is anything being pasted in chrome wrapped in a div is a unordered list item.
		//D24412: [Regression[Copy/Paste][Table][Chrome/Safari]The bottom of table border cross the slide in sorter with some lines list, which is inconsistence with in placeholder
		htmlContent = PresCKUtil.fixStyleWebkit(CKEDITOR.document,htmlContent);
		var internalEditModeData = null;
		if (elem)
			internalEditModeData = dojo.query(".list_clipboard_copydata",elem.$ ? elem.$ : elem);
		if(!bFromExt && (htmlContent.indexOf('<div') != -1 && !internalEditModeData))
		    fromExt = true;
		
//		while(htmlContent.indexOf('<div') != -1){
//			htmlContent = htmlContent.replace('<div','<p concordList="bullet" ');
//		}			
	}
	else{
		htmlContent = PresCKUtil.fixPNonWebKit(CKEDITOR.document,htmlContent);
	}
	
	//Some external sources including Symphony require additional processing
	//of the copied HTML for invalid html tags
	htmlContent = concord.util.presCopyPasteUtil.transformFontNodes(htmlContent);
	htmlContent = concord.util.presCopyPasteUtil.convertStyleTags(htmlContent);
	htmlContent = concord.util.presCopyPasteUtil.fixPAlignTags(htmlContent);		
	htmlContent = concord.util.presCopyPasteUtil.cleanStyles(htmlContent, fromExt);
	htmlContent = concord.util.presCopyPasteUtil.UpdateID(htmlContent);
		
	if(fromKeypress || htmlContent.toLowerCase().indexOf('<img') != -1 ||htmlContent.toLowerCase().indexOf('<table') != -1){		
		htmlContent = concord.util.presCopyPasteUtil.fixTables(htmlContent);
		
		// Comment this part. It is for 24441. Have verified the defect
//		if(editor.contentBox && editor.contentBox.contentBoxType&& editor.contentBox.contentBoxType == 'contentBoxTbl'){
//			return {'html':htmlContent};
//		}
		var data = {};
		if(htmlContent===true){
			data[ 'html' ] = " ";
			data.tables = true;
			return data;
		}
		data[ 'html' ] = htmlContent;		
		concord.util.presCopyPasteUtil.prepareTables(data);
		concord.util.presCopyPasteUtil.prepareImages(data);	
		concord.util.presCopyPasteUtil.prepareText(data);
		data[ 'html' ] = concord.util.presCopyPasteUtil.fixExternalData(data.html);
		return data;
	} else {		
		return {'html':htmlContent};
	}
};

concord.util.presCopyPasteUtil.toggleBoxEditModeAndPasteData = function(data, editor, mergeUndo) {
	if(data.tables || data.images){
		//paste any tables or images that came in from system clipboard.
		//first take current box out of edit mode.
		if(editor && editor.contentBox){
			editor.contentBox.deSelectThisBox();
			var contentBox = editor.contentBox.boxRep;
			if(contentBox){
				contentBox = contentBox.unLoadSpare();
				if (contentBox && contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
					contentBox.selectThisBox();
				} 
			}
		}
		//wait for box to toggle edit mode then perform paste for new elements.
		setTimeout(dojo.hitch(this, function () {				
			concord.util.presCopyPasteUtil.pasteData(data,mergeUndo);
		}, 200));						
	}
};

concord.util.presCopyPasteUtil.prepareImages = function(data){	
	var htmlContent = data.html;
	if(!htmlContent || htmlContent.toLowerCase().indexOf('<img') == -1)		
		return;
			
	var editor = window.pe.scene.getEditor();	
	var imgContent = "";	
	var htmlElement = editor.document.createElement('div');
	htmlElement.$.innerHTML = htmlContent;			
	var images = htmlElement.getElementsByTag('img');
	for(var i = 0; i < images.count(); i++){
		var img = images.getItem(i).$;	
		var src = img.src;
		var validImg = src.match(/^data:image\/([\w]+);base64/);
		if(validImg) {
			concord.util.presCopyPasteUtil.uploadImageData(img,src);
			imgContent += img.outerHTML;			 
		}
	}
		
	//remove images from html content after pasting them
	dojo.query('img',htmlElement.$).forEach(dojo.destroy);	
	htmlContent = htmlElement.$.innerHTML;
	htmlElement.remove();	
	data[ 'html' ] = htmlContent;
	if(imgContent.length > 0);
		data[ 'images'] = imgContent;			
};

/**
 * Look for table objects in htmlContent and make them IBM Docs tables
 * 
 * @param htmlContent
 * @returns
 */
concord.util.presCopyPasteUtil.fixTables = function(htmlContent) {
	if(!htmlContent || (htmlContent.toLowerCase().indexOf('<table') < 0))
		return htmlContent;
	
	//chrome will make all the % to px, needs to adjust back
	var editor = window.pe.scene.getEditor();
	var htmlElement = editor.document.createElement('div');
	htmlElement.$.innerHTML = htmlContent;			
	var tables = htmlElement.getElementsByTag('table');
	for(var ti = 0; ti < tables.count(); ti++){
		var table = tables.getItem(ti);
		if(PresTableUtil.isMergeCell(table)){
			htmlContent = " ";
			return true;
		}
		PresTableUtil.changePxToPercentForRowCell(table.$);
		 dojo.query('tr',table.$).forEach(function(row){
			 var cells = row.cells;
			 if(cells && cells.length == 0){
				 dojo.addClass(row,'removeThisNode');
			 }
		 });
		 dojo.query('.removeThisNode',table.$).forEach(dojo.destroy);
		 if(!dojo.attr(table.$,'table_template-name')){
			 dojo.attr(table.$,'table_template-name','st_plain');
			 dojo.addClass(table.$,'st_plain');
		 }
	}
	htmlContent = htmlElement.$.innerHTML;
	htmlElement.remove();
	
	//If internal table, then skip the following formatting.
	if((htmlContent.indexOf('smartTable') > 0) || (htmlContent.indexOf('ibmdocsTable') > 0)){
		return htmlContent;
	}
	
	var htmlElement = editor.document.createElement('div');
	htmlElement.$.innerHTML = htmlContent;			
	var tables = htmlElement.getElementsByTag('table');
	for(var t = 0; t < tables.count(); t++){
		var table = tables.getItem(t).$;
		//merge multiple tbody's into one (our editor does not handle multiple tbody's)
	    //keep a reference to the first tbody (which we will keep).	    
	    var tbody = dojo.query('tbody',table)[0];	    
		var thead = dojo.query('thead',table)[0];
		if(thead){
			//process table header
			dojo.query('th',thead).forEach(function(th,i,arr){
				var td = editor.document.createElement('td');
				var colspan = dojo.attr(th,'colspan');
				if(colspan)
					dojo.attr(td,'colspan',colspan);
				dojo.attr(td,'role','columnheader');
				td.innerHTML = th.innerHTML;
				dojo.place(td,th,'replace');				
			});			
			
			var tbodyTop = tbody.firstChild;			
			while(thead.hasChildNodes()){
				var tr = thead.firstChild;								
				if(tbodyTop)
					dojo.place(tr,tbodyTop,'before');
				else
					tbody.appendChild(tr);
			}
		}
		
		thead && dojo.destroy(thead);
		
		dojo.removeClass(table);		
		dojo.removeAttr(table,'border');
		dojo.removeAttr(table,'height');
		dojo.removeAttr(table,'width');
		dojo.removeAttr(table,'frame');
		dojo.removeAttr(table,'rules');
		//strippig this out for now because sometimes certain styles set this with the
		//intention of using multiple tBody's to seperate different table rows and we don't
		//support that right now,  so the end result is different than the copies source table.
		dojo.removeAttr(table,'bordercolor');
		
		dojo.addClass(table,'table_table');
	    dojo.addClass(table,'smartTable');
	    dojo.addClass(table,'ibmdocsTable');
	    dojo.addClass(table,'st_plain');
	    dijit.setWaiRole(table, 'grid');
	    dojo.attr(table,'cellspacing','0');
	    dojo.attr(table,'cellpadding','0');
	    dojo.attr(table,'table_use-rows-styles','true');
	    dojo.attr(table,'table_use-banding-rows-styles','true');
	    dojo.attr(table,'table_template-name','st_plain');
	    
	    dojo.query('tr',table).forEach(function(row,i,arr){	    	
	    	var numRows = arr.length;		    
	    	dojo.removeClass(row);
	    	dijit.setWaiRole(row, 'row');
	    	dojo.removeAttr(row,'height');
			dojo.removeAttr(row,'width');			
	        dojo.addClass(row,'table_table-row');
	        dojo.attr(row,'table_default-cell-style-name','');
	        //dojo.style(row,'height',(100/numRows)+'%');
	        
	        if (i%2==0) {  //even rows
	        	if ( i != 0)
	        		dojo.addClass(row,'alternateRow');
	        }
	                
	        if (i == numRows - 1) {
	        	dojo.addClass(row,'lastRow');
	        }
	        
	        var cols = row.children;	        
	        dojo.forEach(cols,function(col,j,arr){	
	        	var numCols = arr.length;    		    	
		    	dojo.removeClass(col);
		    	dojo.removeAttr(col,'height');
				dojo.removeAttr(col,'width');
//				dojo.attr(col,'tabindex','0'); //D34602    	
		    	dojo.addClass(col,'table_table-cell');
				var style = concord.util.presCopyPasteUtil.getMergedStyles(table, col);
			    dojo.attr(col,'style',style);			    
		    	if ( j == 0) {
		    		dojo.addClass(col,'firstColumn');
		    	} else if ( j == (arr.length - 1)) {
		    		dojo.addClass(col,'lastColumn');
		    	}
		    	
		    	var role = dojo.attr(col,'role');
		    	if(role == 'columnheader'){
		    		dijit.setWaiRole(col, 'columnheader');
		    		if(!dojo.hasClass(row,'tableHeaderRow'))
		    			dojo.addClass(row,'tableHeaderRow');
		    	} else
		    		dijit.setWaiRole(col, 'gridcell');
		    	
		    	//fix data within table cells which may come in from external sources with
		    	//incorrect structure		    			    	
		    	col.innerHTML = concord.util.presCopyPasteUtil.fixExternalData(col.innerHTML, true);
		    });
		    
		    if(row.parentNode != tbody)
	    		tbody.appendChild(row);
	        
	    });
	    
	    //remove empty tbody elements
	    dojo.query('tbody',table).forEach(function(node,i,arr){
	    	if(node.children.length == 0)
	    		dojo.destroy(node);	
	    });
	    dojo.attr(table,'style','');
	}
	htmlContent = htmlElement.$.innerHTML;
	htmlElement.remove();
	return htmlContent;
};

/**
 * 
 * @param selectedCells
 * @returns clonedTable: ck node
 */
concord.util.presCopyPasteUtil.buildNewTableWithSelectedCells = function(selectedCells){
	if(!selectedCells || selectedCells.length == 0)
		return null;
	
	var sourceTable = selectedCells[0].getAscendant('table');
	var sourceTbody = selectedCells[0].getAscendant('tbody');
	var clonedTable = sourceTable.clone();
	var clonedTbody = sourceTbody.clone();
	
	//step1, handle column width
	var selectedRange = PresTableUtil.getRectangleFromSelection(null, selectedCells),
		minColIndex = selectedRange.minColIndex,
		maxColIndex = selectedRange.maxColIndex,
		minRowIndex = selectedRange.minRowIndex,
		maxRowIndex = selectedRange.maxRowIndex;
	
	var doc = sourceTable.$.ownerDocument,
		newColgrp = doc.createElement("colgroup");
	dojo.attr(newColgrp, "id", MSGUTIL.getUUID());
	
	var colgroup = sourceTable.getFirst();
	
	//In any cases, colgroup must exists, event for the old draft
	if(sourceTable.getChildCount() == 1 && PresCKUtil.checkNodeName(colgroup, "tbody")){
		return null;
	}
	
	var tableW = parseFloat(PresTableUtil.getWidth(sourceTable));
	var total = 0;
	for(var i = minColIndex; i <= maxColIndex; i++){
		var col = colgroup.getChild(i);
		var _width = PresTableUtil.getWidthInPercentFromStyle(col.$.style.cssText);
 		_width = parseFloat((tableW * _width / 100).toFixed(2));
 		total += _width;
 		
 		var newCol = doc.createElement("col");
 		newCol.style.cssText = col.$.style.cssText;
 		dojo.attr(newCol, "id", MSGUTIL.getUUID());
 		newColgrp.appendChild(newCol);
	}
	//keep the absolute value to table, paste will use them to update main node style
	dojo.attr(clonedTable.$, "_width", PresTableUtil.generateAbsWidthValue(total) + "px"); 
	dojo.style(clonedTable.$, "width", "");
	
	//step2, handle row height
	var totalH = 0, rowList = [], _height;
	for(var i = 0, len = selectedCells.length; i < len; i++){
		var cell = selectedCells[i],
			row = cell.getParent(), 
			rowIndex = row.getIndex();
		if(rowList[rowIndex])
			continue;
		
		rowList[rowIndex] = true;
		_height = PresTableUtil.getHeight(row.$);
		_height = PresTableUtil.generateAbsHeightValue(_height);
		totalH += _height;
		dojo.attr(row, "_height", _height); //in px
		
	}
	dojo.attr(clonedTable.$, "_height", totalH + "px");
	dojo.style(clonedTable.$, "height", "");
	
	//step3, 
	//D40051: [FF]Table  export from IBM docs, has background when open in Symphony or AOO 
	var tableTemplateName = clonedTable.getAttribute('table_template-name');
	tableTemplateName && clonedTable.setAttribute('_table_template-name',tableTemplateName);
	
	//step4, Go through all cell and form a cloned complete table tree
	var clonedIndex = dojo.isFF ? minColIndex : 0, 
		cellAbsIndex = -1, clonedCellList = [];
	var map = TableResizeUtil.buildTableMap(sourceTable);
	var clonedRow = null, finishedOneRow = false, cell = null, row = null;
	var selectedCellLen = selectedCells.length;
	if(minRowIndex == maxRowIndex){
		clonedRow = selectedCells[0].getParent().clone();
		for(var i in selectedCells) {
			cell = selectedCells[i].clone(true, true);
			cell.removeStyle('overflow');
			clonedRow.append(cell);
		}
		clonedTbody.append(clonedRow);
	}else{
		var cellIndex = 0;
		for(var i = minRowIndex; i <= maxRowIndex; i++){
			cell = selectedCells[cellIndex];
			if(!cell)
				break;
			row = cell.getParent();
			clonedRow = row.clone();
			cellAbsIndex = map.getCellAbsIndexFromMap(cell);
			for(var j = clonedIndex; j < cellAbsIndex; j++){
				var newCell = row.getChild(j).clone(true, true);
				newCell.setAttribute('id',MSGUTIL.getUUID());
				newCell.removeStyle('overflow');
		   		var oldStyleNode = PresTableUtil.clearCellTextAndKeepStyle(newCell);
				clonedRow.append(newCell);
			}
			
			for(var k = cellAbsIndex; k <= maxColIndex; k++ ){
				
				if(cellIndex < selectedCellLen){
					var tmp = selectedCells[cellIndex];
					if(!tmp)
						break;
					cell = tmp.clone(true, true);
					cell.removeStyle('overflow');
					clonedRow.append(cell);
					cellIndex ++;
				}else{
					var newCell = row.getChild(k).clone(true, true);
					newCell.setAttribute('id',MSGUTIL.getUUID());
					newCell.removeStyle('overflow');
			   		var oldStyleNode = PresTableUtil.clearCellTextAndKeepStyle(newCell);
					clonedRow.append(newCell);
				}
			}
			
			clonedTbody.append(clonedRow);
		}
	}
	
	newColgrp = new CKEDITOR.dom.node(newColgrp);
	clonedTable.append(newColgrp);
	clonedTable.append(clonedTbody);
	return clonedTable;
};

/**
 * This method will take an html string that contains MS style tags for Bold, Italic, and Underline and
 * convert them to their html span equivelents.
 */
concord.util.presCopyPasteUtil.convertStyleTags = function(htmlstr) {	
	if(!htmlstr)
		return htmlstr;
	
	var editor = window.pe.scene.getEditor();
	//look for and replace <u> <b> <i> <strike> with span equivelents.
	// <b = <span style="font-weight:bold;"		
	// <u = <span style="text-decoration:underline;"
	// <i = <span style="font-style:italic;"
	// <strike =<span style="text-decoration:line-through;"
	var styles = ['b','u','i','strike','em','strong'];	
	var htmlElement = editor.document.createElement('div');
	htmlElement.$.innerHTML = htmlstr;
	for(var s = 0; s<styles.length; s++){		
		var elements = htmlElement.getElementsByTag(styles[s]);
		var eCount = elements.count();
		for( var e = eCount-1; e >= 0; e--){
			var element = elements.getItem(e);
			if(element!=null ){
				var span = editor.document.createElement('span');
				if(styles[s]=='b' || styles[s]=='strong'){
					span.$.style.fontWeight = 'bold';
				} else if(styles[s] == 'u'){
					span.$.style.textDecoration = 'underline';
				} else if(styles[s] == 'i' || styles[s]=='em'){
					span.$.style.fontStyle = 'italic';
				} else if(styles[s] == 'strike'){
					span.$.style.textDecoration = 'line-through';
				}
				
				span.$.innerHTML = element.getHtml();
				dojo.place(span.$,element.$,'replace');				
			}
		}			
	}
	
	htmlstr = htmlElement.$.innerHTML;
	htmlElement.remove();
	
	return htmlstr;
};

/**
 * Helper function to determine if a given node is in a Table.
 * 
 * @param node
 * @returns {Boolean}
 */
concord.util.presCopyPasteUtil.isNodeInTable = function(node){
	if(!node)
		return false;
	
	while(node.parentNode){
		if(node.nodeName.toLowerCase() == 'table')
			return true;
		
		node = node.parentNode;		
	}
	
	return false;
};

/**
 * when using em, the browser only get part fontsize info.
 * so before copy action change the em to px.
 * after copy action call this function change px back to em
 */
concord.util.presCopyPasteUtil.convertpxBacktoem = function(dealnode) {
	dojo.query('span,li,p,ul,ol,table,td,tr',dealnode).forEach(function(node){
		var fontSize = dojo.trim(node.style.fontSize);
		var parentNodept = PresFontUtil.getPtFontSize(node.parentNode);
		var classcontent = node.getAttribute('class');
		if(classcontent && classcontent.indexOf('pfs_')>=0 && classcontent.indexOf('_pfs')>0)
		{
				var fontSizeInPt = classcontent.substring(classcontent.indexOf('pfs_')+4,classcontent.indexOf('_pfs'));
				fontSize = fontSizeInPt /parentNodept;
				fontSize = dojo.number.round(fontSize,2);			        
				dojo.attr(node,'pfs',fontSizeInPt);
				dojo.style(node,'fontSize',fontSize+'em');
				classcontent = classcontent.replace(/pfs_.*?_pfs/gi,'').trim();
				dojo.removeClass(node);
				dojo.addClass(node,classcontent);
				return;
		}
		if(fontSize.toLowerCase().indexOf('px') != -1){
			var fontSizeInPx = fontSize.toLowerCase().replace('px','');
			var fontSizeInPt = PresFontUtil.getCalcPtFromPx(fontSizeInPx);
			fontSize = fontSizeInPt /parentNodept;
			fontSize = dojo.number.round(fontSize,2);
			if(fontSizeInPt > 10.25 && fontSizeInPt < 10.75)
		    	fontSizeInPt = 10.5;
			else
				fontSizeInPt = dojo.number.round(fontSizeInPt,0);    
		    dojo.attr(node,'pfs',fontSizeInPt);
			dojo.style(node,'fontSize',fontSize+'em');
		}else if(fontSize.toLowerCase().indexOf('pt') != -1){
			var fontSizeInPt = fontSize.toLowerCase().replace('pt','');
			fontSize = fontSizeInPt /parentNodept;
			fontSize = dojo.number.round(fontSize,2);
			dojo.attr(node,'pfs',fontSizeInPt);
			dojo.style(node,'fontSize',fontSize+'em');
		}
	});	
	dojo.query('li',dealnode).forEach(function(node){
		var linode = node;
		var firstSpan;
		var node= new CKEDITOR.dom.node(node);
        while ( node ) {
            if ( PresCKUtil.checkNodeName(node, 'span') ) {
                firstSpan = node;
                pfs = PresFontUtil.getPtFontSize(node.$);
            }
            node = node.getFirst ? node.getFirst() : null;
            // stop looping if you encounter a sublist
            if (PresCKUtil.checkNodeName(node, 'ol','ul' ) )
            	node = null;
        }
		
	});
};

concord.util.presCopyPasteUtil.UpdateID = function(htmlstr) {
	// D27976: for span, no id needed, and to avoid repeated id value
	// remove the id on pasted span
	if(!htmlstr)
		return htmlstr;
	var editor = window.pe.scene.getEditor();
	var ckNode = new CKEDITOR.dom.element('div', editor.document );	
	ckNode.setHtml('<tempp>'+htmlstr+'</tempp>');
	var filterpasteSpans = dojo.query('span',ckNode.$);
	for(var i = 0; i < filterpasteSpans.length; i++) {
		var fnode = filterpasteSpans[i];
		if(fnode.hasAttribute('id')){
			fnode.removeAttribute('id');
		}
	}
	htmlstr = ckNode.getHtml();
	htmlstr = htmlstr.replace(/<tempp>/, "");
	htmlstr = htmlstr.replace(/<\/tempp>/, "");
	ckNode.remove();
	return htmlstr;	
};

/**
 * Strip out all inline styles except those we want in the editor.
 */
concord.util.presCopyPasteUtil.cleanStyles = function(htmlstr, fromExt) {	
	if(!htmlstr)
		return htmlstr;
	var editor = window.pe.scene.getEditor();
	var ckNode = new CKEDITOR.dom.element('div', editor.document );	

	//S22654 only support copy plaintext from office to presentation now.	
	//D26449: Copy text from MS office 2003 to textbox, titleplace holder style is not correct
	ckNode.setHtml('<tempp>'+htmlstr+'</tempp>');
	PresCKUtil.fixDOMStructure(ckNode.$);
	if(fromExt){		
		var filterpasteElems = dojo.query('span',ckNode.$);
		for(var i = 0; i < filterpasteElems.length; i++) {
			var fnode = filterpasteElems[i];
			if(fnode.hasAttribute('concord-list')||fnode.hasAttribute( 'concordlist')||fnode.hasAttribute('concord-list')||fnode.hasAttribute('chrome-list')
					||(fnode.hasAttribute( 'style') && (dojo.attr(fnode,'style').indexOf('concord-list')>=0||
							dojo.attr(fnode,'style').indexOf('mso-list')>=0 || dojo.attr(fnode,'style').indexOf('chrome-list')>=0))){
				dojo.destroy(fnode);
			}
		}
		if(dojo.isWebKit){
			var filterpasteElems = dojo.query('p',ckNode.$);
			for(var i = 0; i < filterpasteElems.length; i++) {
				var fnode = filterpasteElems[i];
				if((fnode.hasAttribute('concordlist')||fnode.hasAttribute('concord-list')||fnode.hasAttribute('chrome-list')||
						(fnode.hasAttribute( 'style') && (dojo.attr(fnode,'style').indexOf('concord-list')>=0||
								dojo.attr(fnode,'style').indexOf('mso-list')>=0 || dojo.attr(fnode,'style').indexOf('chrome-list')>=0)))
								&& fnode.firstChild &&fnode.childNodes.length>1 && fnode.firstChild.nextSibling.nodeName.toLowerCase() == 'span'){
					dojo.destroy(fnode.firstChild);
				}
			}
		}
		
		htmlstr = ckNode.getHtml();		
		htmlstr = htmlstr.replace(/ concordlist=\".*?\"/gi, "");
		htmlstr = htmlstr.replace(/ concordlist=\'.*?\'/gi, "");
		htmlstr = htmlstr.replace(/:colorscheme colors=\".*?\"/gi, "");
		htmlstr = htmlstr.replace(/:colorscheme colors=\'.*?\'/gi, "");
		htmlstr = htmlstr.replace(/:colorscheme/gi, "");
		htmlstr = htmlstr.replace(/ v:shape=\".*?\">/gi, ">");
		htmlstr = htmlstr.replace(/ v:shape=\'.*?\'>/gi, ">");
		//D26136: [Chrome]copy text and paste, font name and font color are incorrect
//		htmlstr = htmlstr.replace(/ class=".*?\"/gi, "");
//		htmlstr = htmlstr.replace(/ style=\".*?\"/gi, "");
//		htmlstr = htmlstr.replace(/ style=\'.*?\'/gi, "");
		htmlstr = htmlstr.replace(/ id=\".*?\"/gi, "");
		htmlstr = htmlstr.replace(/ id=\'.*?\'/gi, "");
		var charValue=String.fromCharCode(8226);
		htmlstr = htmlstr.replace(new RegExp(charValue, "gm"), '');
		charValue=String.fromCharCode(10);
		htmlstr = htmlstr.replace(new RegExp(charValue, "gm"), '');
		htmlstr = htmlstr.replace(new RegExp('<div.*?>', "gm"), '<p>');
		htmlstr = htmlstr.replace(new RegExp('</div>', "gm"), '</p>');
		htmlstr = htmlstr.replace(new RegExp('<ul.*?>', "gm"), '');
		htmlstr = htmlstr.replace(new RegExp('</ul>', "gm"), '');
		htmlstr = htmlstr.replace(new RegExp('<ol.*?>', "gm"), '');
		htmlstr = htmlstr.replace(new RegExp('</ol>', "gm"), '');
		htmlstr = htmlstr.replace(new RegExp('<li.*?>', "gm"), '<p>');
		htmlstr = htmlstr.replace(new RegExp('</li>', "gm"), '</p>');
		htmlstr = htmlstr.replace(/(<s>)+/gm, "");
		htmlstr = htmlstr.replace(/(<\/s>)+/gm, "");
		htmlstr = htmlstr.replace(/(<span>)+/gm,'<span>');
		htmlstr = htmlstr.replace(/(<\/span>)+/gm,'</span>');
		htmlstr = htmlstr.replace(/(<p>)+/gm,'<p>');
		htmlstr = htmlstr.replace(/(<\/p>)+/gm,'</p>');
		htmlstr = htmlstr.replace(/(<\/span><span>)+/gm, "");
		htmlstr = htmlstr.replace(/(<span><\/span>)+/gm, "");
		htmlstr = htmlstr.replace(/(<p><\/p>)+/gm, "");
		charValue = null;
		ckNode.setHtml(htmlstr);
		//D23587: [IE/Chrome][CopyPaste]Copy text  from MS Documents to concord ,text remain source property except for color
		//htmlstr=htmlstr.replace(/font-size:.*?\em;/gi, 'font-size:1.0em;');
	}
	var pasteElems = dojo.query('span,li,p,ul,ol,table,td,tr',ckNode.$);
	for(var i = 0; i < pasteElems.length; i++) {
		var node = pasteElems[i];
		var fontWeight = node.style.fontWeight;
		var fontStyle = node.style.fontStyle;
		var fontFamily = node.style.fontFamily;
		var textDecoration = node.style.textDecoration; 
		var color = node.style.color;
		var fontSize = node.style.fontSize;
		var verticalAlign = node.style.verticalAlign;
		var textAlign = node.style.textAlign;
		var counterReset = node.style.counterReset;
		var indent = node.style.marginLeft;
		
		var bgcolor = node.style.backgroundColor;
		var bdcolor = node.style.borderColor;
		
		//D26683: [Regression]Javascript is stop work after copy&Paste list paragraph in a table issue 1
		var lineheight = node.style.lineHeight;
		var liststyletype = node.style.listStyleType;
		if((dojo.isChrome || dojo.isSafari) && node.nodeName.toLowerCase() == 'p' && fromExt){
			//workaround for issue with cleanWord list conversion in chrome
			var ns = dojo.attr(node,'style');
			if(ns && (ns != '' || ns != ' ')){
				ns = ns.split(';');
				for(var x = 0; x < ns.length; x++){
					var stylePair = ns[x].replace(/(^\s+|\s+$)/g,'');
					if(stylePair.split(':')[0] == 'chrome-list'){
						//in webKit every list is a UL
						dojo.attr(node,'concordList','bullet');
					}
				}
			}
		}
		
		var font = node.style.font;
		if(dojo.isSafari && font && font.length >0)
		{
			dojo.style(node,'font','');
		}	

		//D32889 new a customized table and copy part of cells,but the copied part table cell border lost.
//		if(htmlstr.indexOf('smartTable') < 0){
//		dojo.removeAttr(node, 'style');
		
		if(PresCKUtil.checkNodeName(node, 'td', 'th')){
			var width = "";
			if(dojo.isFF || dojo.isIE){
				width = dojo.getComputedStyle(node).width; // e.g. "width: 50%;";
			}else{
				var wholeStyle = node.style.cssText;
				var sList = wholeStyle.split(";");
				for(var j = 0, len = sList.length; j < len; j++){
					var styleObject = sList[j].split(":");
					var key = styleObject[0] || "";
					if(dojo.trim(key.toLowerCase()) == "width"){
						width = styleObject[1];  //in chrome, this value is in px
						break;
					}
				}
				
			}
			dojo.removeAttr(node, 'style');
			dojo.style(node, "width", width||'20%');
		}
		
		if(bgcolor && bgcolor.length > 0){
			dojo.style(node,'backgroundColor',bgcolor);
		}
		if(bdcolor && bdcolor.length > 0){
			dojo.style(node,'borderColor',bdcolor);
		}
		
//		}
		if(lineheight && lineheight.length > 0 && lineheight.toLowerCase().indexOf('px') <0){
			dojo.style(node,'lineHeight',lineheight);
		}
		if(liststyletype && liststyletype.length > 0){
			dojo.style(node,'listStyleType',liststyletype);
		}
		if(fontWeight && fontWeight.length > 0){
			dojo.style(node,'fontWeight',fontWeight);
		}
		
		if(fontStyle && fontStyle.length > 0){
			dojo.style(node,'fontStyle',fontStyle);
		}
		
		if(fontFamily && fontFamily.length > 0){
			dojo.style(node,'fontFamily',fontFamily);
		}
				
		if(textDecoration && textDecoration.length > 0){
			dojo.style(node,'textDecoration',textDecoration);
		}
		
		if(color && color.length > 0) {
			dojo.style(node,'color',color);
		}
		
		//D26449: Copy text from MS office 2003 to textbox, titleplace holder style is not correct
		//Sometime the default fontsize doesn't be saved, add it.
		if(fromExt && !fontSize && node.nodeName.toLowerCase() == 'span' && !dojo.hasClass(node,'text_p') &&
				node.parentNode && node.parentNode.nodeName.toLowerCase() != 'span' && !node.parentNode.style.fontSize) fontSize = '18pt';
		if(fontSize && fontSize.length > 0 && parseFloat(fontSize)){
			if(PresCKUtil.checkNodeName(node,'span'))
			{
				dojo.style(node,'fontSize',fontSize);
			}
			else
			{
				var element = new CKEDITOR.dom.element(node);
				element.removeStyle('font-size');
			}	
				
			var absFontSize = PresFontUtil.convertFontsizeToPT(fontSize);
			if(absFontSize!=18.0)
				PresCKUtil.setCustomStyle(node,PresConstants.ABS_STYLES.FONTSIZE,absFontSize);
		}
		
		if(verticalAlign && verticalAlign.length > 0){
			dojo.style(node,'verticalAlign',verticalAlign);
		}	
		
		if(textAlign && textAlign.length > 0){
			dojo.style(node,'textAlign',textAlign);
		}
		//if counterReset is set preserve, otherwise if it is an OL add counterReset style
		if(counterReset && counterReset.length > 0){
			dojo.style(node,'counterReset',counterReset);
		} 
		else if(node.nodeName.toLowerCase() == 'ol'){
			concord.util.presCopyPasteUtil.fixOl(node);
		}

		if(indent && indent.length > 0){
			dojo.style(node,'marginLeft',indent);
		}
		
		//fix list classes for lists copied from msWord
		if(node.nodeName.toLowerCase() == 'li'){
			if(!dojo.hasClass(node,'text_list-item'))
				concord.util.presCopyPasteUtil.fixLi(node);
			else {
				PresListUtil.removeListBeforeClass(node);
			}
		}
		
	}
	
	htmlstr = ckNode.getHtml();
	htmlstr = htmlstr.replace(/<tempp>/, "");
	htmlstr = htmlstr.replace(/<\/tempp>/, "");
	ckNode.remove();
	return htmlstr;
};

concord.util.presCopyPasteUtil.getLstClass = function(node){
	var classes = dojo.getNodeProp(node, 'class');
	if(classes)
	{
		var array = classes.split(' ');
		var idx = 0;
		for(;idx< array.length;idx++)
		{
			if(array[idx].indexOf('lst-') >=0)
			{
				return array[idx];
			}	
		}
	}
	return null;
};

concord.util.presCopyPasteUtil.fixOl = function(node){
	var lstClass = concord.util.presCopyPasteUtil.getLstClass(node);
	if(!lstClass)
	{
		var firstChild = node.firstChild;
		if(firstChild && firstChild.nodeName.toLowerCase() == 'li')
			lstClass = concord.util.presCopyPasteUtil.getLstClass(firstChild);
	}
	if(lstClass)
		dojo.style(node, 'counterReset', lstClass);
	else
		dojo.style(node, 'counterReset', 'lst-n 0');
};

concord.util.presCopyPasteUtil.fixLi = function(node){
	var parent = node.parentNode;
	if(parent.nodeName.toLowerCase() != 'ul' && parent.nodeName.toLowerCase() != 'ol'){				
		//convert li to span not in a list and bad format
		node.outerHTML = node.outerHTML.replace('<li','<span');
		node.outerHTML = node.outerHTML.replace('li>','span>');
	} else {
		dojo.addClass(node, 'text_list-item');
		dojo.addClass(parent,'text_list');
		var hasLstML = false;
		var listClassesStr = dojo.attr( node, 'class');
		if (listClassesStr) {
			var listClasses = listClassesStr.split(' ');
			for ( var j = 0 ; j < listClasses.length; j++) {
				if((listClasses[j].match(/^lst-/) && !listClasses[j].match(/^lst-MR/)) ||
					listClasses[j].match(/^ML_/)) {
					hasLstML = true;
					break;
				}
			}
		}
		if (!hasLstML) {
			if(parent.nodeName.toLowerCase() == 'ol'){	
				dojo.addClass(node, 'lst-n');
				dojo.addClass(parent, 'lst-n');
			} else {						
				dojo.addClass(node, 'lst-c');					
				dojo.addClass(parent, 'lst-c');
			}
		}
	}
};

concord.util.presCopyPasteUtil.getDefaultCellContentHtml = function(text) {
	var content = text ? text : '&nbsp;';
	var editor = window.pe.scene.getEditor();
	var p = new CKEDITOR.dom.element( 'p', editor.document );
 	p.$.innerHTML='<span>'+content+'</span>';
 	p.appendBogus();
 	return p.$.outerHTML;
};

concord.util.presCopyPasteUtil.fixExternalData = function(htmlContent, forTable){	
	if(!htmlContent && forTable){ 		
 		return concord.util.presCopyPasteUtil.getDefaultCellContentHtml();
	} else if(!htmlContent)
		return htmlContent;
	
	var editor = window.pe.scene.getEditor();
	var ckNode = new CKEDITOR.dom.element( 'div', editor.document );
	ckNode.appendHtml(htmlContent);
	
	if(forTable && !PresCKUtil.doesNodeContainText(ckNode.$))
		return concord.util.presCopyPasteUtil.getDefaultCellContentHtml();	
	
	var pasteNodes = ckNode.$.children;	
	
	//handle the case where all we are fixing is text.
	if(pasteNodes.length == 0 && ckNode.getText().length > 0){
		if(forTable){			
 		 	return concord.util.presCopyPasteUtil.getDefaultCellContentHtml(ckNode.getText());
 		 } else
			return '<span>'+ckNode.getText()+'</span>';
	}
			 
	var ulStr = '<ul odf_element="text:list" class="text_list lst-c"></ul>';
	var olStr = '<ol class="text_list lst-n" odf_element="text:list" style="counter-reset: lst-n 0; "></ol>';			
	var ul = CKEDITOR.dom.element.createFromHtml(ulStr);
	var ol = CKEDITOR.dom.element.createFromHtml(olStr);
	var isOL = false;	
	//we need to go through all the nodes and build any ul/ol's we find
	//and also we are flattening nested spans.
	for(var n = 0; n < pasteNodes.length; n++){		
		var node = pasteNodes[n];
		if(dojo.hasClass(node,'removeThisNode'))
			continue;
		
		var bulletNode = dojo.attr(node,'concordList') ? node : dojo.query('[concordList]',node)[0];  		
		if(bulletNode){
			var isOL = dojo.attr(bulletNode,'concordList').indexOf('numbullet') != -1;
			var childCount = node.children.length;
			dojo.addClass(node,'removeThisNode');
			//if MSOffice added a bullet node remove it.
			if(node.firstChild != node.lastChild){
				for(var x = childCount-1; x >= 0; x--){
					var child = node.children[x];					    
				    if(x == 0) {
				    	//remove bullet node				    	
				    	dojo.destroy(child);
				    } else {				    
					    while(child.hasChildNodes() && child.firstChild == child.lastChild && child.firstChild.nodeType != CKEDITOR.NODE_TEXT) {
					    	var style = concord.util.presCopyPasteUtil.getMergedStyles(child, child.firstChild);
					    	child = dojo.place(child.firstChild,child,'replace');
					    	dojo.attr(child,'style',style);						    	
					    }
				    }
				}
			}			
			//convert node to li					
			var li = document.createElement('li');					
			concord.util.HtmlContent.injectRdomIdsForElement(li);
			var liCName = isOL ? CKEDITOR.plugins.liststyles.defaultListStyles.ol : CKEDITOR.plugins.liststyles.defaultListStyles.ul;					   	           
			dojo.addClass(li, 'text_list-item'); // for conversion
			//Wangzhe >>>>==============
			//dojo.addClass( li, liCName );
			//<<<===============
			li.innerHTML = ((node.firstChild == node.lastChild) && node.firstChild.nodeType == CKEDITOR.NODE_TEXT) ? '<span>'+node.innerHTML+'</span>' : node.innerHTML;
						
			dojo.attr(li,'p_text_style-name','');
			dojo.attr(li,'text_p','true');					
			
			var isEnd = (n == pasteNodes.length-1);
			if(!isOL) {				
				if(ol.$.hasChildNodes()){
					//we are starting a new UL flush out old OL
					dojo.place(ol.$,node,'before');							
					ol = CKEDITOR.dom.element.createFromHtml(olStr);
				}						
				ul.$.appendChild(li);
				//if we are at the last node move ul into paste data
				if(isEnd){
					dojo.place(ul.$,node,'before');
				}
			} else {						
				if(ul.$.hasChildNodes()){
					//we are starting a new OL flush out old UL
					dojo.place(ul.$,node,'before');							
					ul = CKEDITOR.dom.element.createFromHtml(ulStr);
				}						
				ol.$.appendChild(li);
				//if we are at the last node move ol into paste data
				if(isEnd){
					dojo.place(ol.$,node,'before');
				}
			}		
		} else {
			//not a bullet, therefore (not)/(is end of) a list
			if(ul.$.hasChildNodes()){
				dojo.place(ul.$,node,'before');				
				ul = CKEDITOR.dom.element.createFromHtml(ulStr);
			} else if(ol.$.hasChildNodes()){
				dojo.place(ol.$,node,'before');				
				ol = CKEDITOR.dom.element.createFromHtml(olStr);					
			}
			
			if(node.nodeType != CKEDITOR.NODE_TEXT && node.nodeName.toLowerCase() == 'p'){
				var childCount = node.children.length;
			    for(var x = childCount-1; x >= 0; x--){
				    var child = node.children[x];				    
				    while(child.hasChildNodes() && 
				    	  (child.firstChild == child.lastChild || (child.childNodes.length == 2 && child.lastChild.childNodes.length == 0)) && 
				    	  child.firstChild.nodeType != CKEDITOR.NODE_TEXT) {
				    	var style = concord.util.presCopyPasteUtil.getMergedStyles(child, child.firstChild);
				    	child = dojo.place(child.firstChild,child,'replace');
				    	dojo.attr(child,'style',style);						    	
				    }
			    }
			    if(childCount == 0 && node.firstChild && node.firstChild.nodeType == CKEDITOR.NODE_TEXT){
			    	//text under p not correct.  wrap in span
			    	var nodeText = node.innerHTML;
			    	node.innerHTML = '<span>'+nodeText+'</span>';
			    } else if(!PresCKUtil.doesNodeContainText(node)){
			    	//remove empty P nodes.
			    	dojo.addClass(node,'removeThisNode');
			    }
			} else if(node.nodeType != CKEDITOR.NODE_TEXT && node.nodeName.toLowerCase() == 'span'){
				while(node.hasChildNodes() && node.firstChild == node.lastChild && node.firstChild.nodeType != CKEDITOR.NODE_TEXT) {			    						
					var style = concord.util.presCopyPasteUtil.getMergedStyles(node, node.firstChild);
			    	node = dojo.place(node.firstChild,node,'replace');
			    	dojo.attr(node,'style',style);						    	
			    }
			    if(forTable){
			    	var p = new CKEDITOR.dom.element( 'p', editor.document );
 					p.$.innerHTML=node.outerHTML;
 					//p.appendBogus();
 					dojo.place(p.$,node,'before');
 					dojo.addClass(node,'removeThisNode'); 					
			    }
			} else if(node.nodeType != CKEDITOR.NODE_TEXT && (node.nodeName.toLowerCase() == 'ol' || node.nodeName.toLowerCase() == 'ul')){
				var listChildCount = node.children.length;
				for(var l = listChildCount-1; l >= 0; l--){
					var listChild = node.children[l];
					if(listChild.nodeName.toLowerCase() != 'li'){
						if(PresCKUtil.doesNodeContainText(listChild)){							
							var li = editor.document.createElement('li');							
							li.$.innerHTML = listChild.outerHTML;							
							listChild = dojo.place(li.$,listChild,'replace');
							concord.util.presCopyPasteUtil.fixLi(listChild);
						} else
							dojo.destroy(listChild);
					}
				}
				
				dojo.query('li',node).forEach(function(n,i,a){
					if(n.firstChild && n.firstChild.nodeType != CKEDITOR.NODE_TEXT && n.firstChild.nodeName.toLowerCase() == 'p'){
						//convert to span.
						var ihtml = n.innerHTML;
						ihtml = ihtml.replace(/<p/ig,'<span');
						ihtml = ihtml.replace(/p>/ig,'span>');
						n.innerHTML = ihtml;
					}					
				});				
			} 
		}
	}	
	dojo.query('.removeThisNode',ckNode.$).forEach(dojo.destroy);
	
	//D21073 apply font-size reduction for sub/super script text
	dojo.query('*[style*=\"vertical-align: super\"],*[style*=\"vertical-align: sub\"]',ckNode.$).forEach(function(node,i,arr){
		dojo.style(node,'fontSize','0.58em');
	});
	
	htmlContent = ckNode.getHtml();
	ckNode.remove();
	return htmlContent;
};

concord.util.presCopyPasteUtil.getMergedStyles = function(node1,node2){			
	var style1 = node1 && dojo.attr(node1,'style') ? dojo.attr(node1,'style').replace(/(^\s+|\s+$)/g,'') : '';
	var style2 = node2 && dojo.attr(node2,'style') ? dojo.attr(node2,'style').replace(/(^\s+|\s+$)/g,'') : '';
	
	if((style1 == ''||style1 == 'null') && (style2 == ''||style2 == 'null'))
		return '';
	else if(style1 == ''||style1 == 'null')
		return style2;
	else if(style2 == ''||style2 == 'null')
		return style1;
	
	var styleArr1 = style1 ? style1.split(';') : [];
	var styleArr2 = style2 ? style2.split(';') : [];
	var mergedStyles = '';
	for(var i = 0; i < styleArr1.length; i++){
		if(styleArr1[i] == ''||styleArr1[i] == 'null')
			continue;
		
		var sName1 = styleArr1[i].split(':')[0]==null?'':styleArr1[i].split(':')[0].replace(/(^\s+|\s+$)/g,'');
		var sValue1 = styleArr1[i].split(':')[1]==null?'':styleArr1[i].split(':')[1].replace(/(^\s+|\s+$)/g,'');
		for(var j = 0; j < styleArr2.length; j++){
			if(styleArr2[j] == '')
				continue;
			
			var sName2 = styleArr2[j].split(':')[0] ==null?'':styleArr2[j].split(':')[0].replace(/(^\s+|\s+$)/g,'');
			var sValue2 = styleArr2[j].split(':')[1]==null?'':styleArr2[j].split(':')[1].replace(/(^\s+|\s+$)/g,'');
			if(sName1 == sName2) {
				if(sValue1 == sValue2)
					mergedStyles += sName2 + ':' + sValue2 + ';';
				else {
					if(sName2=='font-size'){
						 var ndx2 = sValue2.indexOf('em');
				            if (ndx2 >= 0)
				            	sValue2 = sValue2.substring(0, ndx2);
				         var ndx1 = sValue1.indexOf('em');
				            if (ndx1 >= 0)
				            	sValue1 = sValue1.substring(0, ndx1);
				         if(ndx2 >= 0 && ndx1 >= 0)
				        	 mergedStyles += sName2 + ':' + sValue2 * sValue1 + 'em;';
				         else
				        	 mergedStyles += sName2 + ':' + sValue2+';';
					} else if(sName2=='text-decoration'){
						mergedStyles += [sName2, ':', sValue2=="none"?'':sValue2,
										' ', sValue1=="none"?'':sValue1 + ';'].join('');
					} else
						mergedStyles += sName2 + ':' + sValue2 + ';';
				}
				styleArr2[j] = '';
				styleArr1[i] = '';
			}
		}
		if(styleArr1[i] != '')
			mergedStyles += styleArr1[i] + ';';
	}

	for(var k = 0; k < styleArr2.length; k++){
		if(styleArr2[k] != '')
			mergedStyles += styleArr2[k] + ';';
	}
	
	return mergedStyles;
};

concord.util.presCopyPasteUtil.getMergedCustomStyles = function(node1,node2){			
	var style1 = node1 && dojo.attr(node1,'customstyle') ? dojo.attr(node1,'customstyle').replace(/(^\s+|\s+$)/g,'') : '';
	var style2 = node2 && dojo.attr(node2,'customstyle') ? dojo.attr(node2,'customstyle').replace(/(^\s+|\s+$)/g,'') : '';
	
	if((style1 == ''||style1 == 'null') && (style2 == ''||style2 == 'null'))
		return '';
	else if(style1 == ''||style1 == 'null')
		return style2;
	else if(style2 == ''||style2 == 'null')
		return style1;
	
	var styleArr1 = style1 ? style1.split(';') : [];
	var styleArr2 = style2 ? style2.split(';') : [];
	var mergedStyles = '';
	for(var i = 0; i < styleArr1.length; i++){
		if(styleArr1[i] == ''||styleArr1[i] == 'null')
			continue;
		
		var sName1 = styleArr1[i].split(':')[0]==null?'':styleArr1[i].split(':')[0].replace(/(^\s+|\s+$)/g,'');
		var sValue1 = styleArr1[i].split(':')[1]==null?'':styleArr1[i].split(':')[1].replace(/(^\s+|\s+$)/g,'');
		for(var j = 0; j < styleArr2.length; j++){
			if(styleArr2[j] == '')
				continue;
			
			var sName2 = styleArr2[j].split(':')[0] ==null?'':styleArr2[j].split(':')[0].replace(/(^\s+|\s+$)/g,'');
			var sValue2 = styleArr2[j].split(':')[1]==null?'':styleArr2[j].split(':')[1].replace(/(^\s+|\s+$)/g,'');
			if(sName1 == sName2) {
				mergedStyles += sName2 + ':' + sValue2 + ';';
				styleArr2[j] = '';
				styleArr1[i] = '';
			}
		}
		if(styleArr1[i] != '')
			mergedStyles += styleArr1[i] + ';';
	}

	for(var k = 0; k < styleArr2.length; k++){
		if(styleArr2[k] != '')
			mergedStyles += styleArr2[k] + ';';
	}
	
	return mergedStyles;
};

/**
 * This method is used to fix P tags when copying content from external sources 
 * that have the property ALIGN= on the P tag.  Changes it to the proper style setting 
 * for text-align:
 */
concord.util.presCopyPasteUtil.fixPAlignTags = function(htmlstr) {	
	if(!htmlstr || htmlstr.toLowerCase().indexOf('<p') == -1 || htmlstr.toLowerCase().indexOf('align=') == -1)
		return htmlstr;
	
	var editor = window.pe.scene.getEditor();	
	var htmlElement = editor.document.createElement('div');
	htmlElement.$.innerHTML = htmlstr;
	var pElems = htmlElement.getElementsByTag('p');
	var count = pElems.count();
	for(var p = count-1; p >= 0; p--) {
		var pElem = pElems.getItem(p);
		if(!PresCKUtil.doesNodeContainText(pElem.$)){
			dojo.destroy(pElem.$);
		} else if(pElem && dojo.hasAttr(pElem.$,'align')) {
			var align = dojo.attr(pElem.$,'align');
			dojo.removeAttr(pElem.$,'align');
			dojo.style(pElem.$,'textAlign',align.toLowerCase());			
		}
	}
	htmlstr = htmlElement.$.innerHTML;
	htmlElement.remove();
	return htmlstr;

};

/**
 * Handle <font> </font> in data if present.  This will need to be 
 * removed but first need to grab any critical attribute information
 * at the <font> level and move to the <span>
 * At the font element you can have color, face (font family), or size 
 * attributes. Currently only the color is set but will check for all
 * three just in case the behavior changes.
 *		 
 */
concord.util.presCopyPasteUtil.transformFontNodes = function (htmlContent){
	if(htmlContent !=null){
		var editor = window.pe.scene.getEditor();
		if(htmlContent.toLowerCase().indexOf("<font") != -1) {
			// D14643 Grab color, face and size attribute from font level if exists
			var fontElement = null;
			var spanElements = null;
			var isTbody = false;
			var htmlElement = editor.document.createElement('div');
			if(htmlContent.toLowerCase().indexOf("<tbody") == 0) {
				htmlElement.$.innerHTML="<table>"+htmlContent+"</table>";
				isTbody = true;
			}else 
				htmlElement.$.innerHTML = htmlContent;
			
			var fontElements = htmlElement.getElementsByTag('font');
			for( var k=0; k < fontElements.count(); k++){
				fontElement = fontElements.getItem(k);
				//var htmlElement = CKEDITOR.dom.element.createFromHtml(htmlContent);
				// There are 2 formats seen when the <font> element is added
				// 1) <font color=xxx><span><span><...></span></span></font>
				// In this case we want to update all spans within the <font>
				if(fontElement!=null ){
					//get all the spans direct children of the font element
					//check the firstchild is not a text node
					var firstChild = fontElement.getFirst();
					var children = false;
					if(firstChild!=null && firstChild.getName!=null && firstChild.getName().toLowerCase() == "span" ){ //it has span as children, then assume all children are spans
						spanElements = fontElement.getChildren();
						children = true;
					}
					else {
						// 2) <span><font color=xxx></font></span>
						// Just update the parent in this case
						spanElements = fontElement.getParent();
						if(spanElements == null || (spanElements.getName!=null && spanElements.getName().toLowerCase() != "span" )){
							var span = editor.document.createElement('span');
							span.$.innerHTML = fontElement.getOuterHtml();
							fontElement.$.parentNode.replaceChild( span.$, fontElement.$);
							spanElements = span;
						}
					}
					var colorAttr = fontElement.$.getAttribute('color');
					var faceAttr = fontElement.$.getAttribute('face');
					var sizeAttr = fontElement.$.getAttribute('size');
					
					concord.util.presCopyPasteUtil._updateFontElementStylesToSpan('color', colorAttr, children, spanElements);
					if(dojo.isIE != 8 && !dojo.isChrome && !dojo.isSafari) {
						//in IE8 the font size coming in is not accurate and therefore we are discarding it. 
						concord.util.presCopyPasteUtil._updateFontElementStylesToSpan('font-size', sizeAttr, children, spanElements);
					}
					concord.util.presCopyPasteUtil._updateFontElementStylesToSpan('font-family', faceAttr, children, spanElements);
						
				}
			}				
			if(isTbody){
				htmlContent = htmlElement.getFirst().$.innerHTML;
			}else 
			//htmlContent = htmlElement.getOuterHtml();
				htmlContent = htmlElement.$.innerHTML;
			//remove and <font> </font> from data
			htmlContent = htmlContent.replace(/<font[^>]*>|<\/font>/ig,'');			
			htmlElement.remove();
		}			
	}
	return htmlContent;
};

/**
 * copy data:
 * <span aria-labelledby="coid_CSS_1" role="group" class="CSS_1 indicatortag" typeid="CSS_1" type="indicator" style="font-size: 2.4444444444444446em;">SSS</span>
 *
 * @param pasteDate : list_clipboard_copydata div
 */
concord.util.presCopyPasteUtil.removeIndicatorForCopy = function(pasteData){
	
	dojo.query("span", pasteData).forEach(function(spanNode){

		var cls = dojo.trim(spanNode["className"]);
		var spaces = /\s+/;
		var array = cls.split(spaces);
		var newCls = "";
		for(var i=0; i<array.length; i++) {
			var attr = array[i];
			if(attr != "indicatortag" && attr.indexOf("CSS_") == -1) {
				newCls += attr + " ";    					
			}
		}
		if(newCls.length > 0) {        			
			spanNode["className"] = dojo.trim(newCls);;
		}
		else {        			
			spanNode["className"] = "";
		}		
		
		dojo.removeAttr(spanNode, "aria-labelledby");
		dojo.removeAttr(spanNode, "typeid");
		
		if(dojo.isSafari){
			dojo.attr(spanNode, "presnobgcolor", "true");
		}
		
	});
	
	return PresCKUtil.ChangeToCKNode(pasteData);
};

concord.util.presCopyPasteUtil.addIndicatorForPaste = function(pasteData){
	dojo.query("span", pasteData).forEach(function(spanNode){
		if(dojo.isSafari && (dojo.attr(spanNode, "presnobgcolor") == "true")){
			spanNode.style.backgroundColor = "";
		}
		spanNode.style.borderBottom = "";
		var editor = pe.scene.getEditor();
		var userId = editor.user.getId();
		var cssName = "CSS_" + userId;
		dojo.attr(spanNode, "aria-labelledby", "coid_" + cssName);
		dojo.addClass(spanNode, cssName + " indicatortag");
		dojo.attr(spanNode, "typeid", cssName);
	});
	
	return PresCKUtil.ChangeToCKNode(pasteData);
};

/**
 * For IE, certain paste or other actions cause a font element to be generated.
 * If there are attributes on that element they need transferred to the 
 * appropriate span or will be lost.
 * 
 * Currently this includes color, size (font-size), and face (font-family)
 */
concord.util.presCopyPasteUtil._updateFontElementStylesToSpan = function(styleName, styleValue, children, spanElements) {
	if (styleValue) {
		if (children) {
			for (var i = 0; i < spanElements.count(); i++) {
				var spanElement = spanElements.getItem(i);
				if (spanElement && spanElement.nodeType == CKEDITOR.NODE_TEXT && spanElement.getName().toLowerCase() == 'span') {
					spanElement.setStyle(styleName, styleValue);
				}
			}
		}
		else {
			var spanElement = spanElements;
			if (spanElement && spanElement.getName().toLowerCase() == 'span') {
				spanElement.setStyle(styleName, styleValue);
			}
		}
	}
};

concord.util.presCopyPasteUtil.uploadImageData = function(img, data) {
	dojo.requireLocalization("concord.widgets","InsertImageDlg");
	var nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");

	var result = data.match(/^data:image\/([\w]+);base64/);
	if( !result )
		return;
	var imgeType;
	var types = ['bmp', 'jpg', 'jpeg', 'gif', 'png'];
	for( var i= 0; i<types.length; i++ ){
		if( types[i] == result[1] ){
			imgeType = result[1];
			break;
		}
	}
	if( !imgeType )	{
		pe.scene.showWarningMessage(nls.unsupportedImage,2000);
		img.remove();
		return;
	}	
	var servletUrl = CKEDITOR.config.filebrowserImageUploadUrl + "?method=dataUrl";

	pe.scene.showWarningMessage(nls.loading);

	dojo.xhrPost({
		url:servletUrl,
		handleAs: "json",
		load: function( response )
		{
			//set width and height attribute	
			var onLoad = function(event) {
				if(event)
					event.removeListener();
								
				var width = (img.width*100) / dojo.style(window.pe.scene.slideEditor.mainNode,'width');
				var height = (img.height*100) / dojo.style(window.pe.scene.slideEditor.mainNode,'height');
				if(height > 100 || width > 100){
					height = height / (height / 75);
					width = width / (width / 75);
				}
				
				dojo.style(img,'width',width+='%');
				dojo.style(img,'height',height+='%');				
			};
				
			if( img.width && img.height )
				onLoad(null);
			else
				dojo.connect(img, "onload", this, onLoad);
						
			dojo.attr(img,'src',response.uri);			
			pe.scene.hideErrorMessage();
		},
		error: function(error) {
			console.log('An error occurred:' + error);
			pe.scene.hideErrorMessage();
			//dojo.destroy(img);
		},
		sync: true,
		contentType: "text/plain",
		postData: data
	});
};
