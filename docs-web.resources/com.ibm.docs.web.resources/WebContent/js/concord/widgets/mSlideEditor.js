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
 * @mSlideEditor.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
 */

dojo.provide("concord.widgets.mSlideEditor");

dojo.declare("concord.widgets.mSlideEditor", [concord.widgets.slideEditor], {
	// Overloaded Functions:
	//  init: function()
	// 	unloadCurrentSlide: function(destroyNotes)
	// 	loadCommentsWhenLoadSlide: function()
	//  loadSpeakerNotesWhenLoadSlide: function()
	//  addSlideCommentIcon: function()
	//  continueWidgitizeContent: function(createSpare, publish, selectBox, family, objDom, node)
	//  openAddNewImageDialog: function(callbackOnOK,inFocusCallBack)
	//  mHandleCoeditAddSlideCommentIcon: function(slideId)
	//  updateMouseDownForMultiSelectMove: function(e)
	//  handlesMultiSelectMouseMove: function(selectedBoxArray,x,y,sender,resizing,e)
	//  handleClickOnSlideEditor: function(e)
	//  handleSlideSelectedEvent:function(data)
	//  deSelectAll: function()
 	// Overloaded Properties:

    processHandleCursorOnEdit : false,
    contentBoxTypeMap : {},
    selectedCommentsId : null,

    init: function(){
    	this.inherited(arguments);
    	if(concord.util.mobileUtil.disablePresEditing)
    		dojo.removeClass(document.body,"user_indicator"); 
    	this.contentBoxTypeMap[PresConstants.CONTENTBOX_TEXT_TYPE] = 1;
    	this.contentBoxTypeMap[PresConstants.CONTENTBOX_TABLE_TYPE] = 2;
    	this.contentBoxTypeMap[PresConstants.CONTENTBOX_IMAGE_TYPE] = 3;
    	this.contentBoxTypeMap[PresConstants.CONTENTBOX_GROUP_TYPE] = 4;
    },
    
    unloadCurrentSlide: function(destroyNotes){
		// MOBILE - BEGIN - save draft on unload
    	//console.log('MOBILE mSlideEditor unloadCurrentSlide save draft');
    	var slideComments = window.pe.scene.slideComments;
		if (slideComments && slideComments.isActive()) {
			if (slideComments.getMode() == slideComments.EDIT_MODE) {
				slideComments.saveDraft();
				slideComments.resetContainer();
			}
		}
		// MOBILE - END
			
        //Kill ckeditor for all content boxes
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	var notNotes = this.CONTENT_BOX_ARRAY[i].contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE;
                         	
        	if (this.CONTENT_BOX_ARRAY[i].isWidgitized &&!destroyNotes){
	            this.CONTENT_BOX_ARRAY[i].makeNonEditable();
	        	if(notNotes){
	        		this.mainNode.removeChild(this.CONTENT_BOX_ARRAY[i].mainNode);
	        	}
	            this.CONTENT_BOX_ARRAY[i].destroyContentBox();
        	}else{
        		if (this.CONTENT_BOX_ARRAY[i].isWidgitized && notNotes){
    	            this.CONTENT_BOX_ARRAY[i].makeNonEditable();
    	        		if(this.CONTENT_BOX_ARRAY[i].mainNode!=null && this.CONTENT_BOX_ARRAY[i].mainNode.parent!=null){
    	        			this.mainNode.removeChild(this.CONTENT_BOX_ARRAY[i].mainNode);
    	        		}
    	            this.CONTENT_BOX_ARRAY[i].destroyContentBox();
        		}else{
        			if (!this.tempRefToLastNotes)
        				this.tempRefToLastNotes = [];
        			this.tempRefToLastNotes.push(this.CONTENT_BOX_ARRAY[i]);
        		}
        	}
        }
    	selectedCommentsId = null;
    },

    loadSpeakerNotesWhenLoadSlide: function(){
		this.showSpeakerNotes = false;
        this.showHideSpeakerNotes();
    },
    
	addSlideCommentIcon: function() {
		var ic = this.getSlideCommentIcon();
		if (!ic) {
			ic = this.slideCommentIcon = document.createElement('img');
			dojo.addClass(ic,'slidecomment');
			ic.src = window.contextPath + window.staticRootPath + '/images/comment_note_plus.png';
			var STRINGS = dojo.i18n.getLocalization("concord.widgets","contentBox");
			dojo.attr(ic,'title',STRINGS.tooltip_comment); //Defect 37321
			this.mainNode.appendChild(ic);		
		}
	    
		dojo.style(ic,{
			'position':'absolute',
			'right': '0',
			'margin': '-37px auto',
			'width': "32px",
			'height': "32px",
			'border':'none',
			'cursor':'pointer'
		});		
		
		this.slideCommentIconConnect = dojo.connect(ic,'onclick', dojo.hitch(window.pe.scene,"enterCommentingViewMode"));
	},
	
	openAddNewImageDialog: function(callbackOnOK,inFocusCallBack){
		var events = [];
		events.push({"name":"presImageDialog", "params":[]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},
	
	registerContentBox: function(contentBox){
		this.inherited(arguments);
		if(contentBox && contentBox.mainNode)
			concord.util.mobileUtil.presObject.processMessage(contentBox.mainNode.id,MSGUTIL.actType.insertElement);
	},
	
	deRegisterContentBox: function(contentBox){
		if(contentBox && contentBox.mainNode)
			concord.util.mobileUtil.presObject.processMessage(contentBox.mainNode.id,MSGUTIL.actType.deleteElement);
		this.inherited(arguments);
	},
	
	refreshAllPositionFromSorter: function(){
		// do nothing for mobile
	},
	
	// handle co-edit add slide comment event - comment created via mobile
    mHandleCoeditAddSlideCommentIcon: function(slideId){
    	var slideComments = window.pe.scene.slideComments;
    	if (this.mainNode.id == slideId && (!slideComments || (slideComments && !slideComments.isActive())))
           	this.initSlideCommentIcon();
    },
    
    decorateOneTouchEvent: function(e) {
		e.touches && e.touches[0] && dojo.mixin(e, e.touches[0]);
	},

    handleSelfFocusRemoved:function(){
        if(concord.util.mobileUtil.isKeyboardShow)
			concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"hideKeyboard","params":[]}]);
    	this.inherited(arguments);
    },
    
    deSelectAll: function(e){
    	if(this.processHandleCursorOnEdit)
			return;
		var sender = null;
		if (e ){sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target; }
		if(sender && dojo.hasClass(sender,'imgcomment'))
			return;
    	this.inherited(arguments);
    },
    
    getSlideInfo: function(){
		var info = {};
		info["t"] = this.mainNode.offsetTop;
		info["l"] = this.mainNode.offsetLeft;
		info["w"] = this.mainNode.offsetWidth;
		info["h"] = this.mainNode.offsetHeight;
		var cbArray = this.CONTENT_BOX_ARRAY;
		var contentBoxs = [];
		for(var i=0; i<cbArray.length; i++)
		{
			if(!cbArray[i].mainNode)
				continue;
			var type = this.contentBoxTypeMap[cbArray[i].contentBoxType];
			if(!type)
				continue;
			var contentBox = {};
			contentBox['t'] = cbArray[i].mainNode.offsetTop;
			contentBox['l'] = cbArray[i].mainNode.offsetLeft;
			contentBox['w'] = cbArray[i].mainNode.offsetWidth;
			contentBox['h'] = cbArray[i].mainNode.offsetHeight;
			contentBox['z'] = dojo.style(cbArray[i].mainNode,'zIndex');
			contentBox['id'] = cbArray[i].mainNode.id;
			contentBox['boxtype'] = type;
			if(cbArray[i].commentsId)
				contentBox['commentsId'] =  cbArray[i].commentsId;
			if(this.selectedCommentsId && 
					cbArray[i].commentsId.indexOf(this.selectedCommentsId) >= 0)
					contentBox['needSelect'] = this.selectedCommentsId;
			if(cbArray[i].isBoxLocked && cbArray[i].isBoxLocked())
				contentBox['lock'] = 1;
			contentBoxs.push(contentBox);
		}
		info['contentBoxs'] = contentBoxs;
		return info;
    },
    
    getCurrentSlideId:function(){
    	return this.mainNode.id;
    },
    loadSlideInEditor: function(slideDom,widigitizeFlag, slideId, fromAction){
    	if (this.mainNode.id != slideId)
    		return;
    	this.inherited(arguments);
		// delete/Dup/Insert slide will notify Editor reload
		// so that send the current slide id message to Native
		// to set the selected slide in Sorter.
    	concord.util.mobileUtil.changeSlide(this.mainNode.id, fromAction && fromAction == "mClick");
    },
    
    createSpareBox: function(){
    	if(concord.util.mobileUtil.disablePresEditing)
    		return true;
    	else
    		return this.inherited(arguments);
    },
    
    createSpareGrpContentBox: function(){
    	if(concord.util.mobileUtil.disablePresEditing)
    		return true;
    	else
    		return this.inherited(arguments);
    },
    
    createSpareTableContentBox: function (){
    	if(concord.util.mobileUtil.disablePresEditing)
    		return true;
    	else
    		return this.inherited(arguments);
    },
    
    openLockMessageDialog: function(id,userList){
		var curTime = new Date().getTime();					
		var timeLapse = curTime - this.openLockMessageDialogTmStamp;
		this.openLockMessageDialogTmStamp = curTime;
		if (timeLapse > 500){	
			concord.util.mobileUtil.showErrorMessageWithJSON({ title: this.STRINGS.slidesInUse, messageKey: "keySlidesInUse" });   
		}
    },
    
    handleCoeditZindexConflict: function(data) {
    	this.widgitizeAllExceptNotes();
    	this.inherited(arguments);
    },
    
	widgitizeAllExceptNotes: function()
	{
		 for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
        	 if(!this.CONTENT_BOX_ARRAY[i].isWidgitized && this.CONTENT_BOX_ARRAY[i].contentBoxType!=PresConstants.CONTENTBOX_NOTES_TYPE)
             	this.widgitizeObject(this.CONTENT_BOX_ARRAY[i]);
		 }
	},
	
	// object level widgitize.
    widgitizeContent0: function(){
    	//console.log("widgitizing Content..");
        var boxCandidateArray = dojo.query('.draw_frame',this.mainNode);
        
        for (var i=0; i<boxCandidateArray.length; i++){
            var objDom = boxCandidateArray[i];
            if (dojo.hasClass(objDom,'isSpare')){ //if createSpare is false but the drawframe class has isSpare then we are processing a spare that is already widgitized but waiting for makeReal to occur. Do not widgitize again
            	continue;
            }
            // Let's determined if it is a text box or image or table
            //TODO: Need to finetune how this function recognizes the various types. May need to get children to
            // determine family.
            //var contentObj = null;
            var family = this.getFamily(objDom);
            //6042, we separate the actual widgitize code just in case we need to break down each widgitize process into different set timeout for performance increase
            if(objDom!=null){
            	var objDomId = objDom.id;
            	if(this.hasComments(objDom))   // widgitize object if have comment.
            		 this.continueWidgitizeContent(false, false, false, family, objDom, null);
            	else
            		this.continueWidgitizeContent0(family, objDom);
                
            }
        }
        if(i > 0){
            console.log("widgitizing done");
            dojo.attr(this.mainNode, "isWidgitized", true);
            //window.pe.scene.hideErrorMessage();
            this.hidePreparingSlideMsg();
        }

    },
    
    // object level widgitize, do not initialize instance at first time, add a dummy instance instead.
    continueWidgitizeContent0: function( family, objDom ){
	    //console.log("widgitizingComponent family:"+ family + "slideId:"+ this.mainNode.id);
	    //console.log("inside widgitizingComponent i:"+i+" length:"+boxCandidateArray.length);
	    var contentObj = null;
	    //var objDom = dojo.byId(objDomId);
	    var opts = {
	    		'family':family,
	    		'CKEDITOR':window.CKEDITOR,
                'CKToolbarSharedSpace': this.CKToolbarSharedSpace,
                'mainNode':objDom,
                'contentBoxDataNode':objDom.children[0],
                'parentContainerNode':this.mainNode,
                'contentBoxType': null,
                'deSelectAll':dojo.hitch(this,this.deSelectAll),
                'deSelectAllButMe':dojo.hitch(this,this.deSelectAllButMe),
                'initialPositionSize':{'left':objDom.style.left,'top':objDom.style.top,'width':objDom.style.width,'height':objDom.style.height},
                'isSpare':false,
                'isMultipleBoxSelected':dojo.hitch(this,this.isMultipleBoxSelected),
                'publishSlideChanged':dojo.hitch(this,this.publishSlideChanged),
                'getzIndexCtr':dojo.hitch(this,this.getzIndexCtr),  
                'setzIndexCtr':dojo.hitch(this,this.setzIndexCtr),
                'toggleBringToFront':dojo.hitch(this,this.toggleBringToFront),
                'toggleSendToBack':dojo.hitch(this,this.toggleSendToBack),                  
                'openAddNewImageDialog': dojo.hitch(this,this.openAddNewImageDialog),
                'deRegisterContentBox' : dojo.hitch(this,this.deRegisterContentBox),
                'getActiveDesignTemplate' : dojo.hitch(this,this.getActiveDesignTemplate),
                'deleteSelectedContentBoxes' : dojo.hitch(this,this.deleteSelectedContentBoxes),
                'pasteSelectedContentBoxes'  : dojo.hitch(this,this.pasteSelectedItems),
                'copySelectedContentBoxes'   : dojo.hitch(this,this.copySelectedItems),                 
                'createIndicatorSytle':dojo.hitch(this,this.createIndicatorSytle),
                'getInLineStyles':dojo.hitch(this,this.getInLineStyles),
                'getMasterTemplateInfo' : dojo.hitch(this,this.getMasterTemplateInfo),
                'checkBoxPosition' : dojo.hitch(this,this.checkBoxPosition),
                'addImageContentBox': dojo.hitch(this,this.addImageContentBox),
                'handleMultiBoxSelected':dojo.hitch(this, this.handleMultiBoxSelected)};
	    //if(objDom!=null){
	    switch(family)
	    {
		    case 'graphic':
		    	opts.contentBoxType = PresConstants.CONTENTBOX_IMAGE_TYPE;
		        opts.contentBoxDataNode = this.findContentDataNode(objDom);
		        opts.isSpare = false;
		        break;
		    case 'notes':
		    	 opts.contentBoxType = PresConstants.CONTENTBOX_NOTES_TYPE;
		            opts.contentBoxDataNode = this.findContentDataNode(objDom);
		            break;
		    case 'text':
		    	opts.contentBoxType = PresConstants.CONTENTBOX_TEXT_TYPE;
	            opts.contentBoxDataNode = this.findContentDataNode(objDom);
	            break;
		    case 'textMobile':
		    	 opts.contentBoxType = PresConstants.CONTENTBOX_TEXT_TYPE;
		            opts.contentBoxDataNode = this.findContentDataNode(objDom);
		            opts.isSpare = false;
		            break;
		    case 'table':
		    	 opts.contentBoxType = PresConstants.CONTENTBOX_TABLE_TYPE;
		            opts.isSpare = false;
		            break;
		    case 'group':
		    	opts.contentBoxType = PresConstants.CONTENTBOX_GROUP_TYPE;
	            opts.contentBoxDataNode = this.findContentDataNode(objDom);
	            opts.isBoxShape = dojo.attr(opts.contentBoxDataNode.parentNode, "ungroupable") == "yes" ? true : false;
	            opts.initialPositionSize.position = objDom.style.position;
	            opts.isSpare = false;
	            opts.addImageContentBox = null;
	            break;
	        default:
	        	return;
	    }
	    this.registerContentBox0(opts);
	    this.updateZIndexForDummyObject(opts);
    },
    
    widgitizeContent: function(node,publish,selectBox,createSpare){
    	if(concord.util.mobileUtil.disablePresEditing)
    		return;
    	if(!node && !publish && !selectBox && !createSpare)
    		this.widgitizeContent0();
    	else
    		this.inherited(arguments);
    },
    
    // register contentbox using dummy instance, replaced it after widgitized.
    registerContentBox0: function(opts){           
        if (opts.mainNode){
        	if(this.hasComments(opts.mainNode)){ //D13306
        		this.updateCommentIconPosition(opts.mainNode);        		
        	}
            opts.cbIdx = this.CONTENT_BOX_ARRAY.length;
            this.CONTENT_BOX_ARRAY.push(opts);
        }
    },
	
	_postWidgitize: function(contentObj)
	{
     	 //Let's check for early spills if data is text data is assigned an unreasonable height
         //No need to do this for grouped box
         if ((!dojo.hasClass(contentObj.mainNode, 'g_draw_frame')) && ((contentObj.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE)||(contentObj.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE)||
         				(contentObj.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)) && 
         				(!contentObj.opts.copyBox) && dojo.style(contentObj.parentContainerNode,'display')!='none'){
	            if (!contentObj.checkResizeHeightLimits() || (contentObj.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE && contentObj.mainNode.style.height == "5%")){
	            	contentObj.updateMainNodeHeightBasedOnDataContent();
	            }
         }

         if(contentObj.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE ){
        	 contentObj.setPresRowHeight(true);
		}
	},

	// dummy instance touched, to widgitize the object.
	widgitizeObject: function(opts)
	{
    	var contentBox = this._widgitize(opts);
    	if(!contentBox) return null;
    	this._postWidgitize(contentBox);
		return contentBox;
	},
	
	_widgitize: function(opts)
	{
		var family = opts.family;
		var contentObj;
		switch(family)
	    {
		    case 'graphic':
		        contentObj = new concord.widgets.imgContentBox(opts); 
		        break;
		    case 'notes':
		    	contentObj = new concord.widgets.notesContentBox(opts); 
		    	contentObj.fixSpeakerNotesEditWindow();
		            break;
		    case 'text':
		    	contentObj = new concord.widgets.txtContentBox(opts); 
	            break;
		    case 'table':
		    	contentObj = new concord.widgets.tblContentBox(opts);
		    	var objDom = opts.mainNode;
		         if(CKEDITOR.env.webkit){//D28955
		        	var mainNodeHeight = dojo.getComputedStyle(objDom).height;
		        	var dataNodeHeight = dojo.getComputedStyle(contentObj.contentBoxDataNode).height;
		        	if(parseFloat(mainNodeHeight) - parseFloat(dataNodeHeight) > 10){
			        	var heightVal = contentObj.getDataTotalHeight(true);
			     		dojo.style(objDom,{
			     			'height':contentObj.PxToPercent(heightVal,'height')+"%"
			     		});
		        	}
		         }
		            break;
		    case 'group':
		    	contentObj = new concord.widgets.grpContentBox(opts);
	            break;
	        default:
	        	return null;
	    }
	    // replace dummy instance with widgitized object.
		this.CONTENT_BOX_ARRAY[opts.cbIdx] = contentObj;
		return contentObj;
	},
	
    hasComments: function(mainNode)
	{
		return (dojo.attr(mainNode, 'comments') == 'true');
	},
	
	updateCommentIconPosition: function(mainNode){
		var ic = this.getCommentIconNodes(mainNode);
		if(ic && ic.length>0) {			
			var icSize = PresConstants.COMMENT_ICON_SIZE;
			var borderSize = dojo.style(mainNode,'borderTopWidth');
			var handleAdjust = icSize/2;
			for(var i=0;i<ic.length;i++) {
				if(borderSize <= 0)
					var topPos = i * icSize;
				else
					var topPos = i * icSize - borderSize;
				
				dojo.style(ic[i],{
					'position':'absolute',
					'top': (topPos+2)+"px",
					'left': (mainNode.offsetWidth-borderSize)+"px",
					'width': icSize + "px",
	    			'height':icSize + "px"
				});
			}
		}				
		ic = null;
	},
	
	updateZIndexForDummyObject: function(opts)
	{
		if (!dojo.hasClass(opts.mainNode, 'g_draw_frame') && 
				( !dojo.style(opts.mainNode,'zIndex') || !opts.mainNode.style.zIndex || dojo.style(opts.mainNode,'zIndex') == 'auto' ) )
		{
			 var tmpZ = this.maxZindex;
			 if (tmpZ <= 0) tmpZ = 500;	// start from 500 so we have enough room to handle multiple sendtoback
			 tmpZ = parseInt(tmpZ)+5;
			 this.maxZindex = tmpZ;
			 dojo.style(opts.mainNode,{'zIndex':tmpZ});
			 
			 // Set the zIndex counter and publish to the slide sorter.  This is necessary for
			 // any new slide generated as the initial title and outline content boxes do not
			 // have z-order specified in the slide sorter
			 opts.setzIndexCtr(tmpZ);
			 var aNewBox = (opts.newBox || dojo.hasClass(opts.mainNode,'newbox'));
			 if (!aNewBox){	// don't publish if newbox	or if creatingFromLayout
				 this.publishBoxAttrChanged(null, opts.mainNode.id, true, false);
			 }
		 }
	},
	
	publishBoxAttrChanged: function(attributeName,nodeId,sendCoeditMsg,addToUndo){
		if (typeof addToUndo ==undefined || addToUndo==null){
			addToUndo=true;
		}
		
		
		var sndCoeditMsg = (sendCoeditMsg) ? true : false;
		var id = (nodeId)? nodeId : this.mainNode.id;
		var node = dojo.byId(id);
		var attrName  = (attributeName)? attributeName :'style';
		
		var ckNode = new CKEDITOR.dom.node(node);
		var attrValue = ckNode.getAttribute(attrName);
		
		if(attrValue) {
			attrValue = attrValue.replace('resizableContainerSelected','resizableContainer');
		
	 		var eventData = [{'eventName': concord.util.events.LocalSync_eventName_attributeChange,
	 						  'id':id,'attributeName':attrName,'attributeValue':attrValue,
	 						  'sendCoeditMsg':sndCoeditMsg,'addToUndo':addToUndo,
	 						  'posChange': false}]; // posChange = true: draw frame position changed.
	 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		}
		
		if ( !ckNode.getParent()){ // this.adjustPositionForBorder() returns a clone, clean the node if it is a clone
			dojo.destroy(node);
		}	
		ckNode = null;
		node = null;
	},
	
	getCommentIconNodes: function(mainNode){
		return dojo.query(".imgcomment",mainNode);
	},
	
    selectBoxWithComment:function(data){
    	if(data!=null && data.commentsId!=null)
    		this.selectedCommentsId = data.commentsId;
    	this.inherited(arguments);
    },
	toggleBringToFront: function(){
		this.widgitizeAllExceptNotes();
		this.inherited(arguments);
	},
	
    toggleSendToBack: function(){
    	this.widgitizeAllExceptNotes();
		this.inherited(arguments);
	},
	
	loadCommentsWhenLoadSlide: function(){
    	if(g_presentationMode && concord.util.mobileUtil.disablePresEditing)
    		return;

    	this.inherited(arguments);
	}
});
