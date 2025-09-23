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
 * @mSlideSorter.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mSlideSorter");
dojo.require("concord.widgets.slidesorter");
dojo.require("concord.pres.mobile.snapshot.SnapshotMgr");
dojo.require("concord.pres.mobile.mSlideSorterOpt");
dojo.require("concord.widgets.presSourceMobile");
dojo.declare("concord.widgets.mSlideSorter", [concord.widgets.slidesorter], {

	snapshotMgr:null,
	slideSorterOpt:null,
	// update css for mobile
	initSlideSorter: function(){
		this.concordSlideSorterCssUrl = window.contextPath + window.staticRootPath + "/styles/css/presentations/concordslidesorter_mobile.css";
		this.inherited(arguments);
        // for partial rendering
        this.initSlideNum = 1;
	},
	
	setScrollEvents: function() {
		//this.inherited(arguments);
		//this.connectArray['touchend']=dojo.connect(this.editor.document.getWindow().$,'touchend',dojo.hitch(this, this.scrolling));
	},
	
    contentDomHandle: function() {
    	// add font fallback css
    	concord.util.mobileUtil.addCSSforFontFallback(this.editor);
    	concord.util.mobileUtil.appendStyleText(this.editor, "body.mobileAutoHeight{height:auto !important;}");
    	
    	// For three list that with Wingdings font.
    	concord.util.mobileUtil.appendStyleText(this.editor, ".concord li.lst-ra:before{content: '\\25BA' '';font-family: Arial !important;}");
    	concord.util.mobileUtil.appendStyleText(this.editor, ".concord li.lst-cm:before{content: '\\2714' ' ';font-family: Arial !important;}");
    	concord.util.mobileUtil.appendStyleText(this.editor, ".concord li.lst-ta:before{content: '\\2794' ' ';font-family: Arial !important;}");

    	if( concord.util.mobileUtil.disablePresEditing )
    		concord.util.mobileUtil.appendStyleText(this.editor, ".layoutClassSS{ outline: none !important; border: none !important; }");

    	
		this.snapshotMgr = new concord.pres.mobile.snapshot.SnapshotMgr(this);
    	this.slideSorterOpt = new concord.pres.mobile.mSlideSorterOpt(this,this.snapshotMgr);
    	this.inherited(arguments);
    	if( concord.util.mobileUtil.disablePresEditing )
    	{
    		concord.util.mobileUtil.appendStyleTextWithStyleId(this.editor,"lastMobileRutimeStyle", ".layoutClassSS{ outline: none !important; border: none !important; }");
    	}
    	this.slideCssAppliedCtr = 145; // await the css applied to prevent the big image loaded.
    },
    
    createUtilAndTransDiv:function(slideElement, slideNum){
    	// no need create div
    },
    
	prepareForSlide: function(slideElement, slideNum) {
		this.inherited(arguments);
		var transitionName = this.getTransitionType(slideElement);
		this.snapshotMgr.insertSlide(slideNum - 1,transitionName,false);
	},
	/**
	 * please note this func will be called by Timer
	 */
	getMoreSlide: function(start, end, inc) {
		this.inherited(arguments);
		
		/**
		 * below can enable partial snapshot
		 */
		// end < 5 means the first 5 slides will quickly be snapshot.
		// this.snapshotMgr.getDirtyLength() >= this.snapshotMgr.getCntMax()
		//TODO: adjust the interval of snapshot
		console.log("get more from"+start+" to "+end);

		this.snapshotMgr.preStart();

	},
	
    postContentLoaded: function() {
     	this.cleanRedundantString();
    	// load for master
    	this.loadForMaster();
    	
    	// create spellChecker
    	this.spellChecker = window.spellcheckerManager.createSpellchecker(this.editor.document.getWindow().$.frameElement, false, true);
    	var autoScayt = this.spellChecker.isAutoScaytEnabled();
    
        // loop for each slide
        for (var i=0; i<this.slides.length; i++) {
            // register for event
        	var disconnectArray = this.connectArray[this.slides[i].id];        	
//        	  disconnectArray.push(dojo.connect(this.slides[i], 'oncontextmenu', dojo.hitch(this,this.oncontextmenuFunc)));
//            disconnectArray.push(dojo.connect(this.slides[i].parentNode, 'onclick', dojo.hitch(this,this.slideWrapperOnClickFunc)));
            
            // set all draw-page <div>'s to be hidden for jaws - otherwise jaws will try to read the contents in the slide sorter
            dijit.setWaiState(this.slides[i], 'hidden', 'true');
            
            // dnd
//            dojo.addClass(this.slides[i].parentNode, 'dojoDndItem');
            
            // spell check
            if (autoScayt) {
            	this.spellChecker.checkNodes(this.slides[i], this.slides[i], null);
            }
        }

    	this.processForTask();

//     	// dojo.withDoc(this.editor.document.$, dojo.hitch(this,this.handleDndSrc), null);
//        this.slideSorterDndSource = new concord.widgets.presSource(this.officePrezDiv, {delay:5});
//        
//        // contextMenu on slidesorter
//     	this.slideSorterContextMenu = new concord.widgets.slideSorterContextMenu();
//    	if (this.slideSorterContextMenu != null) {
//    		this.slideSorterContextMenu.initialize(this, this.slides[0]);
//    	   //initialize slide sorter context menu
//    	   this.slideSorterContextMenu.bindContextMenuToSlide( this.selectedSlide );
//    	}
    	
        // add contextMenu on slideEditor
        // window.pe.scene.slideEditor.addContextMenu(); // no need for Mobile
        
        // set flag for loadfinished
		pe.scene.bLoadFinished = true;
		
		// user join
		pe.scene.dealWithUserJoinInLoading();
		
		// need to widgitize the selected slide before apply co-editing message
		var slideId = window.pe.scene.slideEditor.mainNode.id;
		window.pe.scene.slideEditor.loadSlideInEditor(this.selectedSlide, true, slideId);
		pe.scene.dealWithCemsgInLoading();

		// publish selected slide after co-editing
		this.publishAllSlidesDoneLoading();
		pe.scene.bCommandIgnored = false;

		this.snapshotMgr.preStart(); // for file with only one slide, getMoreSlide won't be called.
    },
    
	prepPresContent:function(presContentHtmlStr){
		this.inherited(arguments);
		concord.util.mobileUtil.totalSlide(this.getTotalSlideNum());
//		if(presContentHtmlStr == null){
//			presContentHtmlStr = this.presHtmlContent;
//		}
//		return presContentHtmlStr;
	},
	getIdbyIdx:function(idx){
		if(idx != undefined){
			var slide = this.slides[idx];
			if(slide)
				return slide.id;
		}
	 },
	/**
	 * 
	 * @param id
	 * @param start  search fast
	 * @returns
	 */
	getIdxbyId:function(id,start){
		if(start == undefined || start == null)
			start = 0;
		for(var i =start,len = this.slides.length;i<len;i++){
			var slide = this.slides[i];
			if(slide.id == id)
				return i;
		}
		
		for(var i =0;i<start;i++){
			var slide = this.slides[i];
			if(slide.id == id)
				return i;
		}
		
	},
	getTotalSlideNum:function(){
		var total = -1;
		if(this.contentHandler!=null && this.contentHandler.totalSlideNum !=null && this.contentHandler.totalSlideNum > 0){
			total = this.contentHandler.totalSlideNum;
		}
		return total;
	},
//	
	// retain all slides
	scrolling: function (e, isFromCoedit){
		
	},
	
	// retain all slides
	getAllSlidesContentHTML: function(){
		var slides = this.getAllSlides();
		var slidesContentHtmlArray = [];

		for(var i=0; i<slides.length; i++){
			var slideElem = slides[i];
			this.disableAnchorInSorter(slideElem);
			// clone slideElem so we don't modify the master DOM
			var slideClone = dojo.clone(slideElem);
			this.disableCoeditStylesInSlideshow(slideClone);
			var slideWrapper = document.createElement('div');
			slideWrapper.appendChild(slideClone);
			var slideHtml = slideWrapper.innerHTML;
			slidesContentHtmlArray.push(slideHtml);
		}
		return slidesContentHtmlArray;
	},
	
	disableAnchorInSorter:function(slideElem){
		if(slideElem!=null){
			var textAnchors = dojo.query('a', slideElem);
	        for (var j=0; j < textAnchors.length; j++){
	        	textAnchors[j].onclick = function() {return false; };
		       	textAnchors[j].href = "javascript:void(0)";
		       	dojo.attr(textAnchors[j], "disabled", "disabled");
	        }
		}
	},
	
	disableCoeditStylesInSlideshow:function(slideElem){
		if(slideElem!=null){
			var coeditSpans = dojo.query('.indicatortag', slideElem);
	        for (var j=0; j < coeditSpans.length; j++){
	        	var classes = coeditSpans[j].className.split(" ");
	        	var newClasses = "";
	            for (var i = 0; i < classes.length; i++) {
	                if (classes[i].indexOf('CSS_') < 0) {
	                    newClasses += classes[i] + " ";
	                }
	            }
	            coeditSpans[j].className = newClasses;
	        }
		}
	},
	
	publishAllSlidesDoneLoading: function(isFromContentReset){ 
		//send event to native side for enable navigation items.
		var events = [];
		var params = [];
		events.push({"name":"presLoaded", "params":[]});
//		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
		
		var ph = dojo.byId('slideEditorContainer').children[0].getAttribute('pageheight');
		var pw = dojo.byId('slideEditorContainer').children[0].getAttribute('pagewidth');
		
		if (ph && pw && ph!="null" && pw!="null")
		{
			params = [];
			params.push(pw);
			params.push(ph);

			events.push({"name":"setSlideDimensions", "params":params});
		}
		// post event.
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);

		this.inherited(arguments);
	},
	
	simulateSlideClick: function(slide, isToIgnoreCtrlKey, fromAction){
		this.inherited(arguments);
    },
    
    /**************disable dojo.DND******************/
    cancelDnd: function(isLocked){
    	// do nothing
    },
    disconnectDNDEvent: function(){
    	// do nothing
    },
    reconnectDNDEvent: function(){
    	// do nothing
    },
    postSlideDeleteDNDHandle: function(){
    	// do nothing
    },
    applyDojoDND: function(newSlide){
    	// do nothing
    },
    dndStart : function (sIdx){
		// for reset the selected array
    	var params = {sSlides:[]};
    	if(sIdx >=0){
    		this.snapshotMgr.updateSlide(sIdx, true); // update the moved slide for co-editing and undo data
			params.sSlides.push(this.slides[sIdx]);
		}
	    // check if there is locked slide,
    	return this.slideSorterOpt.dndStart(params);
    },
    dndDrop : function (){
    	//this.slideSorterOpt.dndDrop(startIdx,endIdx,size);
    },
    dndCancel : function (){
    	this.slideSorterOpt.dndCancel();
    },
    // 0 base
    dndDropAfter : function (sIdx,eIdx,size){
    	this.slideSorterOpt.dndDrop(sIdx,eIdx,size);
    	this.slideSorterOpt.dndDropAfter();
	},
	ontouchstartFunc: function(evt){
		//this.slideSorterDndSource.onTouchStart(evt);
	},
	ontouchendFunc: function(evt){
		//this.slideSorterDndSource.onTouchEnd(evt);
	},

	/**************disable dojo.DND******************/
	
	prepareNewSlide:function(newSlide){
        //remove selected slide style if any
        this.deselectSlide(newSlide);
        //connect events
        this.connectEvents(newSlide);
	},

	/****************** UI Start********************/
	createSlideUtilDiv: function(slideElemArray){
		  
	},
    addSelectedClass:function(node){
    	// do nothing
    },
    updateContextMenuOptions: function() {
    	
    },
    getUserNamebyId:function(userId) {
    	var users  = window['pe'].scene.getUsersFromLockArray();
    	for (var idx in users){
    		if (users[idx]["id"] == userId) {
    			return users[idx]["disp_name"];
    		}
    	}
    },
    updateCoeditSlideIndicator:function(userId, element){
    	 if(userId!=null && element!=null){
             //get the color from CKEDITOR.indicators
             var indicators = CKEDITOR.indicators;
             var userCss = "CSS_" + userId;

             var indicator=indicators[userCss];
             if(indicator!=null){
                 var cssElement=document.getElementById(userCss);
                 if(cssElement!=null){
                     var cssString = cssElement.innerHTML.toLowerCase();
                     if(cssString == "" && cssElement.styleSheet){
                         cssString = cssElement.styleSheet.cssText;
                     }
                     var bgIndex = cssString.indexOf("background");
                     if(bgIndex >=0){
                         var bgString = cssString.substring(bgIndex);
                         var colonIdx = bgString.indexOf(":");
                         var semicolonIdx = bgString.indexOf(";");
                         if(semicolonIdx <0){
                             semicolonIdx = bgString.indexOf("}");
                         }
                         var color = bgString.substring(colonIdx+1, semicolonIdx);
                         color =dojo.string.trim(color);
                         var idx = this.getIdxbyId(element.id, 0);
                         var name = this.getUserNamebyId(userId);
                         concord.util.mobileUtil.updateCoeditSlideIndicator(idx,color,name);
                         //console.info("updateCoeditSlideIndicator:userId:"+ userId+" color:"+color);
                     }
                 }
             }
    	 }
    },
    removeSlideCoeditIndicator:function(slideElem){
    	var idx = this.getIdxbyId(slideElem.id, null);
    	concord.util.mobileUtil.removeSlideCoeditIndicator(idx);
    },
	/****************** UI End********************/
	
	/****************** Events Start****************/
	handleOnclickEvt:function(evt){
		this.slideSorterOpt.handleOnclickEvt(evt);
	},
	
	// no need add the class
	selectSlide:function(slideElem){
        var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(slideElem);
        if(idxInMultiSelectSlides <0){
            this.multiSelectedSlides.push(slideElem);
            //this.selectedSlide = slideElem;  //This.selectedSlide only set when user single click a slide (the slide that opens in slideEditor)
        }
        this.updateContextMenuOptions();
    },

	/****************** Events End****************/
	
	/******** co-editing and undo/redo*********/
    handleCoeditInsertSlideWrapper:function(data){
        if(data!=null){
            if(data.slideElemWrapper !=null){
                var slideElemWrapper = data.slideElemWrapper;
                var slideParent = data.slideWrapperParent;
                var slideElems = dojo.query(".draw_page", slideElemWrapper);
                if(slideElems!=null && slideElems.length>0){
                    var slideElem = slideElems[0];
                    if(slideParent!=null){
                        this.prepareNewSlide(slideElem);
                        this.refreshSlidesObject();
                        this.removeDndInsertImgs(data.slideElemWrapper);
                        // remove slideUtil on Mobile
                        var slideWrapperArray = [data.slideElemWrapper];
                        this.removeSlideUtilDiv(slideWrapperArray);

                        if(data.isFromUndo == true){
                            this.simulateSlideClick(slideElem);
                        }
                        // Update date time fields
                        //this.updateHeaderFooterDateTimeFields(slideElem);
                        this.addSlideToContentObj(slideElem);
                        var isFromCoedit = true;
                        this.scrolling(null, true);       

                        // add browser-specific class to slide wrapper.
                        // this class should NOT be coedited!
                        this.addBrowserClassToWrapper( slideElem );
                    }
                }
            }
        }
    },
    
	handleSubscriptionEventsCoediting: function(data){
		this.inherited(arguments);
		if(data.eventName== concord.util.events.coeditingEvents_eventName_processMessageInsertSlide){
        
        }else if(data.eventName== concord.util.events.coeditingEvents_eventName_processMessageInsertSlideWrapper){
        	var slideElemWrapper = data.slideElemWrapper;
            var slideElems = dojo.query(".draw_page", slideElemWrapper);
            if(slideElems!=null && slideElems.length>0){
                var slideElem = slideElems[0];
                var transitionName = this.getTransitionType(slideElem);
        		this.snapshotMgr.insertSlide(data.idx, transitionName, true);
        		this.refreshSlideLockIndicators(); // refresh indicator after insert slide.
        		if(data.isFromUndo)
        			this.snapshotMgr.preStart();
        		else
        			this.snapshotMgr.startUptSlideTimer(2000); // await all insert action finish in co-editing
            }
        }else if(data.eventName == concord.util.events.coeditingEvents_eventName_processMessageDeleteSlide){
        	this.snapshotMgr.deleteSlide(data.idx); // delete the dirty slide and update all idx in dirtySlide
        }
	},	
	/************ Editor update ********/
	// insert/delete node will publish the EditorEvent and send co-editing message directly
	handleSubscriptionEventsSlideEditor : function(data){
		this.inherited(arguments);
		var bStartTimer = false;
		var selectedId = window.pe.scene.slideEditor.mainNode.id;
		
		// for mobile attribute change will processMessage
//		 if (data.eventName==concord.util.events.LocalSync_eventName_attributeChange || data.eventName==concord.util.events.LocalSync_eventName_multiBoxAttributeChange){  // move,resize,stylechange
//			 if(data.ObjList || data.flag == "Resizing"){ // only move/resize objects
//				 this.snapshotMgr.updateSlide(this.getIdxbyId(selectedId), true);
//				 bStartTimer = true;
//			 }
//		 }else 
			 
			 
	     if(data.eventName == concord.util.events.slideEditorEvents_eventName_insertNodeFrame || data.eventName == concord.util.events.slideEditorEvents_eventName_multipleInsertNodeFrame){
			 this.snapshotMgr.updateSlide(this.getIdxbyId(selectedId), true);
			 bStartTimer = true;
		 }else if(data.eventName == concord.util.events.slideEditorEvents_eventName_deleteNodeFrame || data.eventName == concord.util.events.slideEditorEvents_eventName_multipleDeleteNodeFrame){
			 this.snapshotMgr.updateSlide(this.getIdxbyId(selectedId), true);
			 bStartTimer = true;
		 }else if (data.eventName==concord.util.events.slideEditorEvents_eventName_slideTransitionApplied){
			 
		 }else if (data.eventName==concord.util.events.slideEditorEvents_eventName_templateDesignApplied){
			 
		 }else if (data.eventName==concord.util.events.slideEditorEvents_eventName_applyLayout){
			 this.snapshotMgr.updateSlide(this.getIdxbyId(selectedId), true);
			 bStartTimer = true;
		 }else if(data.eventName==concord.util.events.slideEditorEvents_eventName_boxEditMode){
			 
		 }
		 
		 if(bStartTimer){
			 this.snapshotMgr.startUptSlideTimer(5000);
		 }
	},
	deleteSlidesForUnLoad: function(){
		return;
	}
});