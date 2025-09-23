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

dojo.provide("concord.widgets.slideEditorView");
dojo.require("concord.util.events");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","slideEditor");

dojo.declare("concord.widgets.slideEditorView",concord.widgets.slideEditor, {
	//
	// Initializes the slide editor
	//	
	init: function(){
		//console.log("slideEditor:init","Entry");	
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slideEditor");
		//Create main Node	
		this.mainNode = document.createElement('div');
		this.parentContainerNode.appendChild(this.mainNode);
		dojo.addClass(this.mainNode,this.SLIDE_EDITOR_CLASS);
		// Add dojo tundra class to body
//		if (!dojo.hasClass(document.body,'tundra')) {
//			dojo.addClass(document.body,'tundra');
//		}
		//this.addContextMenu();
		//dojo.connect(this.mainNode,'onclick',dojo.hitch(this,this.handleClickOnSlideEditor));
		
		//dojo.connect(window,'onkeypress',dojo.hitch(this,this.keypressHandle));		
		this.subscribeToEvents();
		//this.setDefaultMouseDown();
		//var body = document.body;
   		//dojo.addClass(body,"user_indicator");
 		//dojo.connect(this,"runAutoFix",this,"runAutoFixCollision"); // run auto fix collision after runauto fix executes
	},
	//
	// List of events slide sorter is listening to
	//
	subscribeToEvents: function(){
		concord.util.events.subscribe(concord.util.events.presSceneEvents_Resize, null, dojo.hitch(this,this.handleSubscriptionEventsForPresDocScene_Resize));
		concord.util.events.subscribe(concord.util.events.presSceneEvents_Render, null, dojo.hitch(this,this.handleSubscriptionEventsForPresDocScene_Render));
		concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForSorter));
		concord.util.events.subscribe(concord.util.events.presMenubarEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForPresToolBar));
		concord.util.events.subscribe(concord.util.events.presToolbarEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForPresToolBar));
		concord.util.events.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForKeyPress));
		//concord.util.events.subscribe(concord.util.events.coeditingEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForCoedit));
		//concord.util.events.subscribe(concord.util.events.commenttingEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForComments));
		//concord.util.events.subscribe(concord.util.events.presentationFocus, null, dojo.hitch(this,this.handleSubscriptionForFocusEvent));
	},
	//
	// Handle events from pub/sub model from Slide Sorter
	//
	handleSubscriptionEventsForSorter: function(data){
		
		if (data.eventName=='slideSelected')	{
			this.loadSlideInEditor(data.slideSelected);
			this.adjustContentBoxPositions();
		} else if (data.eventName=='slideSorterReady'){
			var cssFilesArray = data.cssFiles;
			var layoutHtmlDiv = this.layoutHtmlDiv = data.layoutHtmlDiv;
			this.activeDesignTemplate.cssStylesOnSorterReady = [];
			/*TEmporarily commented
			//Inject CSS files in our document
			for (var i=0; i<cssFilesArray.length; i++){
				var cssNode = this.injectCssStyle(cssFilesArray[i]);
				if (cssNode)
					this.activeDesignTemplate.cssStylesOnSorterReady.push(cssNode);
			}
			*/
						
			//add link element in our document
			var linkElems = data.linkElements;				
			var headTag = window.document.getElementsByTagName("head")[0];
			var linksInDoc = dojo.query("link", window.document);
			for (var i=0; i< linkElems.length;i++){
				var link = dojo.clone(linkElems[i]);
				//check if the link is already available
				
				var isExist = false;
				if(linksInDoc!=null && linksInDoc.length>0){
					for(var j=linksInDoc.length-1; j >=0; j--){
						var hrefInDoc = linksInDoc[j].href;
						var idx =hrefInDoc.indexOf(link.href);
						if(idx >=0){
							isExist = true;
							break;
						}
					}
				}
				if(!isExist){
					this.injectCssStyle(link.href, false)
					/*
					if (headTag){
						if (window.document.createStyleSheet){
							window.document.createStyleSheet(link.href);
						}else{
							headTag.appendChild(link);
						}
					}
					*/
				}
			}
			//add inline styles in our document
			var inLineStyles = this.inLineStyles = data.styleElements;				
			var headTag = window.document.getElementsByTagName("head")[0];				
			for (var i=0; i< inLineStyles.length;i++){
				var style = dojo.clone(inLineStyles[i]);
				var isExist = false;
				var styleId = style.id;
				if(styleId!=null && styleId.length>0){
					var styleIdInDoc = document.getElementById(styleId);
					if(styleIdInDoc!=null){
						isExist = true;
					}
				}
				
				if (headTag && !isExist)
					headTag.appendChild(style);
			}
		} 
		
	},
	//
	// Handle events from pub/sub model from Slide PresDocScene
	handleSubscriptionEventsForPresDocScene_Resize: function(data){
		this.setUIDimensions();	
	},
	
	handleSubscriptionEventsForPresDocScene_Render: function(data){
		this.setUIDimensions();			
		this.mainNode.style.display="block";
		this.adjustContentBoxPositions();
		if (dojo.isIE) this.adjustAllContentDataSize();
		if (this.editorShadow)
			this.editorShadow.resize();
		else {
			var editorShadow = this.editorShadow = new dojox.fx.Shadow({ node:this.mainNode, shadowThickness: 10, shodowOffset:10}); 			
			editorShadow.startup();
		}
	},	
	//
	// Load a slide in the slide editor
	//
	loadSlideInEditor: function(slideDom){	
		this.cleanUpConnections;
		this.mainNode.innerHTML = slideDom.innerHTML;
		this.mainNode.id = slideDom.id;
		//this.widgitizeContent();
		//clean slide editor specific items
		this.removeEditModeRelatedClasses(this.mainNode);
		
		var editorShadow = this.editorShadow = new dojox.fx.Shadow({ node:this.mainNode, shadowThickness: 10, shodowOffset:10}); 			
		editorShadow.startup();	
		this.drawPageLoadedDom = slideDom;
		this.drawPageLoadedClasses = slideDom.className;
		this.mainNode.className ='slideEditor';
		dojo.addClass(this.mainNode,this.drawPageLoadedClasses);	
		dojo.attr(this.mainNode,'presentation_presentation-page-layout-name',slideDom.getAttribute('presentation_presentation-page-layout-name'));
		dojo.attr(this.mainNode,'draw_master-page-name',slideDom.getAttribute('draw_master-page-name'));
	},
	removeEditModeRelatedClasses:function(slideNode){
		if(slideNode!=null){
			var  drawFrameNodeArray = dojo.query('.draw_frame',slideNode);		
			this.removeClasses(drawFrameNodeArray,'resizableContainerSelected');
		}
	}
	
	
	
});