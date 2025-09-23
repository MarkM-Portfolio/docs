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

dojo.provide("concord.widgets.slidesorterView");

dojo.require("concord.widgets.slidesorter");
dojo.require("concord.util.HtmlContent");
dojo.require("concord.util.events");

dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","slidesorter");


dojo.declare("concord.widgets.slidesorterView", concord.widgets.slidesorter, {
	
	// The variable name of the instance of this class needs to be stored because 
	// the row styler needs to call a row styling function that is part of this class.
	// The call is made from the exhibit so it needs a global variable name 
	/*
	constructor: function(divContainerIdStr, ckeditor, presHtmlContent, ckeditorToolbarId,  getFocusComponent, currentScene)
	{

		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slidesorter");
		this.presHtmlContent = presHtmlContent;
		this.divContainerId = divContainerIdStr;
		////this.presBean = presDocBean;
		//this.authUser = authUser;
		this.currentScene = currentScene;
		this.ckeditorToolbarContainerId = ckeditorToolbarId;
		this.CKEDITOR = ckeditor;
		this.ckeditorInstanceName = "editor1";
		this.slideSorterPageClassName="PM1_concord"; //the name of the class/style for slidesorter slide level (draw_page), to show the sldiein thumbnail style
		this.masterHtmlDivId= "masterHtmlDiv";
		this.layoutHtmlDivId= "layoutHtmlDiv";
		//this.messageDivId= "messageDiv";
		this.getFocusComponent = getFocusComponent;
		//making sure getElementsByClassName function is available to use
		this.setGetElementsByClassNameFunc();
		//initialize the slide sorter, loading the presentationhtml in a ckeditor instance
		this.initSlideSorterView();
		//init notification tool
		//this.notifyTool = new concord.widgets.notifyTool(this,this.currentScene);

		console.log("slidesorter:end constructor");
	},
	*/
	/*
	setGetElementsByClassNameFunc:function(){
		if (document.getElementsByClassName == undefined) {
			document.getElementsByClassName = function(className)
			{
				var hasClassName = new RegExp("(?:^|\\s)" + className + "(?:$|\\s)");
				var allElements = document.getElementsByTagName("*");
				var results = [];

				var element;
				for (var i = 0; (element = allElements[i]) != null; i++) {
					var elementClass = element.className;
					if (elementClass && elementClass.indexOf(className) != -1 && hasClassName.test(elementClass))
						results.push(element);
				}
				return results;
			}
		}
	},
	*/
	initSlideSorter: function(){
		var slideSorterDiv = document.getElementById(this.divContainerId);
		slideSorterDiv.style.visibility="hidden";
		//slideSorterDiv.style.display="none";
		
		var txtArea = document.createElement("textarea");
		slideSorterDiv.appendChild(txtArea);
		txtArea.value=this.presHtmlContent;
		//set id and name
		txtArea.id = this.ckeditorInstanceName;
		txtArea.name = this.ckeditorInstanceName;
		
		//create slidesorter footer div to be put at the end later
		var slideSorterToolDiv = document.createElement("div");
		slideSorterToolDiv.id=this.slideSorterToolDivId;
		//slideSorterToolDiv.setAttribute("class", "slideSorterTool");
		//slideSorterToolDiv.innerHTML="TOOL DIV HERE";
		slideSorterToolDiv.style.visibility="hidden";
		slideSorterDiv.appendChild(slideSorterToolDiv);
		
		this.buildSlideSorterTool();
		
		//create hidden div for master html
		var masterHiddenDiv = document.createElement("div");
		masterHiddenDiv.id=this.masterHtmlDivId;
		masterHiddenDiv.style.visibility="hidden";
		masterHiddenDiv.style.display="none";
		slideSorterDiv.appendChild(masterHiddenDiv);
		//load master html
		//var masterHTMLUrl=concord.util.uri.getEditAttUri("master.html");
		//var masterStyleUrl = concord.util.uri.getEditAttUri("office_styles.css");
		var masterStyleUrl =null;
		if(masterStyleUrl !=null){
			var paramIdx = masterStyleUrl.indexOf("?");
			if(paramIdx >=0){
				masterStyleUrl = masterStyleUrl.substring(0, paramIdx);
			}
		}
		//this.loadMasterHtml(masterHTMLUrl, masterStyleUrl);
		
		//create hidden div for layout html
		var layoutHiddenDiv = document.createElement("div");
		layoutHiddenDiv.id=this.layoutHtmlDivId;
		layoutHiddenDiv.style.visibility="hidden";
		layoutHiddenDiv.style.display="none";
		slideSorterDiv.appendChild(layoutHiddenDiv);
		//load presentation layout html
		//var layoutHTMLUrl=concord.util.uri.getEditAttUri("presentation_layout.html");
		var layoutHTMLUrl=this.layoutHtmlDocUrl;
		this.loadPresLayoutHtml(layoutHTMLUrl);
		
		//instantiating CKEditor
		var divContainerHeight = slideSorterDiv.offsetHeight;
		var ckeditor_height = divContainerHeight;
		if(divContainerHeight == ""){
			ckeditor_height = "0";
		}

		if(divContainerHeight != null && divContainerHeight !=""){
			var divContainerHeightInt = divContainerHeight;
			var slideSorterToolHeight = slideSorterToolDiv.offsetHeight;
			var slideSorterToolDivHeightInt = slideSorterToolHeight;
			ckeditor_height = divContainerHeightInt - slideSorterToolDivHeightInt;
		}



		var remove = null;
		remove = 'coediting,contextmenu,clipboard,elementspath,scayt,menubutton,maximize,resize,task,comments,concordtoolbar,messages,menubar,fixedwidthpage, browserresizehandler,dialog,maximize,sourcearea,smarttables,enterkey,concordscayt,concordlink,concordfindreplace';

		this.editor= this.CKEDITOR.replace(txtArea,
				{
					height: ckeditor_height,
					sharedSpaces :
					{
						top : this.ckeditorToolbarContainerId
					},
					theme: 'presentation',
					//extraPlugins: 'concordslidesorter',
					// Removes the maximize plugin as it's not usable
					// in a shared toolbar.
					// Removes the resizer as it's not usable in a
					// shared elements path.
					removePlugins : remove,
					contentsCss: [],
					resize_enabled: false,
					fullPage : true
					});
					
		this.editor.on( 'instanceReady', dojo.hitch(this,function()
		{
		    concord.util.events.subscribe(concord.util.events.presSceneEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		    concord.util.events.subscribe(concord.util.events.presSceneEvents_Resize, null, dojo.hitch(this,this.handleSubscriptionEvents_PresScene_Resize));
		    concord.util.events.subscribe(concord.util.events.presSceneEvents_Render, null, dojo.hitch(this,this.handleSubscriptionEvents_PresScene_Render));
            concord.util.events.subscribe(concord.util.events.presMenubarEvents, null, dojo.hitch(this,this.handleSubscriptionEventsPresMenuBar));
			concord.util.events.subscribe(concord.util.events.presToolbarEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
			concord.util.events.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
			concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
			concord.util.events.subscribe(concord.util.events.slideShowEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
			//concord.util.events.subscribe(concord.util.events.presentationFocus, null, dojo.hitch(this,this.handleSubscriptionForFocusEvent));
			
			//Take care of Co-editing
	    	//set up CKEDITOR variables
			this.editor.docBean = this.presBean;
			this.editor.user = this.authUser;
			this.editor.currentScene = this.currentScene;
	    	//load hidden iframe of compared dom tree
			//this.currentScene.session.start();
			//send events that slideSorter is ready
			var eventData = [{eventName: concord.util.events.slideSorterEvents_eventName_onCKEInstanceReady,editorName:this.ckeditorInstanceName}];
			concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
			
			this.clearCKAriaRoles();
			this.editor.on( 'selectionChange', dojo.hitch(this,function()
			{
				concord.util.presToolbarMgr.toggleFontEditButtons('off');
				concord.util.presToolbarMgr.toggleCommenttButton('off');
				concord.util.presToolbarMgr.toggleBGFillColorButton('off');
				concord.util.presToolbarMgr.toggleBorderColorButton('off');
			})
			);
	})
	);
			
	this.editor.on( 'contentDom', dojo.hitch(this,function()
		{		
			//turn design mode off
			if(dojo.isIE){
				this.editor.document.$.body.contentEditable = false;
			}else{
				this.editor.document.$.designMode = "off";
			}
			
			this.editor.document.getBody().disableContextMenu();
			
			//handle placeholders
			//var officePresDiv= this.editor.document.$.getElementById("office_prez");
			var officePresDiv= this.editor.document.$.body;
			this.handlePlaceHolders(officePresDiv);
			
			//inject concordslidesorter.css
			concord.util.uri.injectCSS (this.editor.document.$,this.concordSlideSorterCssUrl,false);

			//wrap each slide in a container div
			this.createSlideWrappers();
			//add events
			var thumbnails = dojo.query('.draw_page', this.editor.document.$);
			this.slides = thumbnails;
			
			for (var i=0; i<thumbnails.length; i++)
			{
				this.connectEvents(thumbnails[i]);
				//this.addContextMenu(thumbnails[i]);
				this.deselectSlide(thumbnails[i]);
			}
			//delete any leftover dnd placeholder img
			var dndPosImgs = dojo.query(".dndDropPosBefore, .dndDropPosAfter", this.editor.document.$);
			for(var i=0; i<dndPosImgs.length;i++){
				dojo.destroy(dndPosImgs[i]);
			}
			
			this.selectedSlide = thumbnails[0];
			
			//add class to selected slide
			dojo.addClass(this.selectedSlide,'slideSelected');
			dojo.removeClass(this.selectedSlide,'slideOver');
			
			this.multiSelectedSlides = new Array();
			
			var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(this.selectedSlide);
			if(idxInMultiSelectSlides <0){
				this.multiSelectedSlides.push(this.selectedSlide);
			}
			
			
			//display the slidenumber in the slidesorter too
			var slideNumberDiv = document.getElementById(this.slideNumberDivId);
			this.displaySlideNumber(this.selectedSlide, slideNumberDiv);
			
			//get style elements
			var styleNodeList = concord.util.HtmlContent.getStyleElements(this.editor.document.$);
			var styleElementsArray = new Array();
			for(var i = 0; i< styleNodeList.length; i++){
				if(!dojo.hasAttr(styleNodeList[i],"cke_temp")){
					styleElementsArray.push(styleNodeList[i].cloneNode(true));
				}
			}
			//get link elements
			var linkNodeList = concord.util.HtmlContent.getLinkElements(this.editor.document.$);
			var linkElementsArray = new Array();
			for(var i = 0; i< linkNodeList.length; i++){
				var href = linkNodeList[i].getAttribute("href");
				var src = linkNodeList[i].getAttribute("src");
				if(href!=null){
					var concordSlideSorterCssIdx = href.indexOf(this.concordSlideSorterCssUrl);
					if(concordSlideSorterCssIdx<0){
						linkElementsArray.push(linkNodeList[i].cloneNode(true));
					}
				}
				else if(src!=null){
					var concordSlideSorterCssIdx = src.indexOf(this.concordSlideSorterCssUrl);
					if(concordSlideSorterCssIdx<0){
						linkElementsArray.push(linkNodeList[i].cloneNode(true));
					}
					
				}
			}
			//var layoutHtmlDiv = document.getElementById(this.layoutHtmlDivId);
			var layoutHtmlDiv = null;
			//send events that slideSorter is ready
			var eventData = [{eventName: 'slideSorterReady',cssFiles:['office_styles.css','office_automatic_styles.css'],styleElements:styleElementsArray,linkElements:linkElementsArray,layoutHtmlDiv:layoutHtmlDiv,editorName:this.ckeditorInstanceName}];
			//concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);

			
			concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
			// publish slide selected when toRender event
			//publish event for co-editing and slidesorter
			this.publishSlideSelectedEvent(this.selectedSlide);
		})
	);
	},

	buildSlideSorterTool: function(){
		var slideSorterToolDiv = document.getElementById(this.slideSorterToolDivId);
		
		var tbl = document.createElement('table');
		tbl.style.width = '100%';
		tbl.style.border = '0px';
		tbl.cellPadding = 0;
		tbl.cellSpacing = 0;
		dojo.addClass(tbl, "slideSorterTool");
			var tbody = document.createElement('tbody');
				var tr = document.createElement('tr');
				//tr.style.width = '100%';
				
				
					var td1 = document.createElement('td');
						//td1.style.width = '100%';
						
						//insert a div for slide number
						var slideNumberDiv = document.createElement("span");
						slideNumberDiv.id=this.slideNumberDivId;
						//dojo.addClass(slideNumberDiv,"slideSorterTool");
						slideNumberDiv.innerHTML=this.STRINGS.slideNumberHere;
						slideNumberDiv.style.visibility="hidden";
						if(dojo.isIE){
							slideNumberDiv.style.styleFloat = 'left';
						}else{
							slideNumberDiv.style.cssFloat = 'left';
						}
						
						slideNumberDiv.style.margin = '0px';
						//slideNumberDiv.style.width = '100%';
						slideNumberDiv.style.textAlign = 'left';
						td1.appendChild(slideNumberDiv);
						
					tr.appendChild(td1);
					/*
					var td2 = document.createElement('td');
						td2.style.width = '40%';
						td2.style.textAlign = 'right';
						
						//insert a div for buttons
						var slideSorterToolsDiv = document.createElement("span");
						slideSorterToolsDiv.id=this.slideSorterToolsId;
						slideSorterToolsDiv.style.display = 'none';
						dojo.addClass(slideSorterToolsDiv,"slideSorterTool");
						if(dojo.isIE){
							slideSorterToolsDiv.style.styleFloat = 'right';
						}else{
							slideSorterToolsDiv.style.cssFloat = 'right';
						}
							
						slideSorterToolsDiv.style.width = '100%';
						slideSorterToolsDiv.style.paddingRight = '2px';
						td2.appendChild(slideSorterToolsDiv);
						slideSorterToolDiv.style.textAlign = 'right';
						/*
						//insert show slides assign to me icon
						var showAssignedToMeImgNode = document.createElement("img");
						showAssignedToMeImgNode.setAttribute("id","showMySlidesIcon");
						showAssignedToMeImgNode.setAttribute("src",window.contextPath + window.staticRootPath + "/images/myassigned_18_light.png");
						showAssignedToMeImgNode.setAttribute("align","right");
						showAssignedToMeImgNode.setAttribute("alt",this.STRINGS.task.SHOW_MY_ASSIGNMENTS);
						showAssignedToMeImgNode.onclick=dojo.hitch(this,this.showMyAssignments);
						showAssignedToMeImgNode.style.cursor= 'pointer';
						showAssignedToMeImgNode.style.padding = '2px 0px 2px 0px';
						showAssignedToMeImgNode.border = '0';
						showAssignedToMeImgNode.align = 'ABSMIDDLE';
						slideSorterToolsDiv.appendChild(showAssignedToMeImgNode);
						
						//insert show all assignments
						var showAllAssignmentsImgNode = document.createElement("img");
						showAllAssignmentsImgNode.setAttribute("id","toggleAssignmentIcon");
						showAllAssignmentsImgNode.setAttribute("src",window.contextPath + window.staticRootPath + "/images/assignments_18_dark.png");
						showAllAssignmentsImgNode.setAttribute("align","right");
						showAllAssignmentsImgNode.setAttribute("alt",this.STRINGS.task.SHOW_ALL_ASSIGNMENTS);
						showAllAssignmentsImgNode.onclick=dojo.hitch(this, this.hideAllAssignments);
						showAllAssignmentsImgNode.style.cursor= 'pointer';
						showAllAssignmentsImgNode.style.padding = '2px 0px 2px 0px';
						showAllAssignmentsImgNode.border = '0';
						showAllAssignmentsImgNode.align = 'ABSMIDDLE';
						slideSorterToolsDiv.appendChild(showAllAssignmentsImgNode);
						
						/*need to be hidden for now until it is decided to enabled again*/
						 //this is deferred until release 2
						//insert show assignment Summary
						/*
						var showAssignmentSumImgNode = document.createElement("img");
						showAssignmentSumImgNode.setAttribute("id","showAssignmentSumIcon");
						showAssignmentSumImgNode.setAttribute("src",window.contextPath + window.staticRootPath + "/images/summary_18_light.png");
						showAssignmentSumImgNode.setAttribute("align","right");
						showAssignmentSumImgNode.setAttribute("alt",this.STRINGS.task.SHOW_ASSIGNMENT_SUMMARY);
						showAssignmentSumImgNode.onclick=dojo.hitch(this, this.showAssignmentSummary);
						showAssignmentSumImgNode.style.cursor= 'pointer';
						showAssignmentSumImgNode.style.padding = '2px 0px 2px 0px';
						showAssignmentSumImgNode.border = '0';
						showAssignmentSumImgNode.align = 'ABSMIDDLE';
						slideSorterToolsDiv.appendChild(showAssignmentSumImgNode);
						*/
						
						
					//tr.appendChild(td2);
				tbody.appendChild(tr);
			tbl.appendChild(tbody);
		slideSorterToolDiv.appendChild(tbl);

		
		
	},
	
	handleSubscriptionEvents_PresScene_Resize : function(data){
        this.setUIDimensions();
    },

	handleSubscriptionEvents_PresScene_Render : function(data){
        var slideSorterDiv = document.getElementById(this.divContainerId);
        var slideSorterToolDiv = document.getElementById(this.slideSorterToolDivId);
        this.setUIDimensions();
        //apply background image div from background Image CSS here
        //so that we already sure all the CSS has been applied and ready to process
        for (var i=0; i<this.slides.length; i++)
        {
            concord.util.HtmlContent.addBackgroundImgFromCssToDiv(this.slides[i], this.editor.document.getWindow().$, this.editor.document.$);
            //may need to save content dom after adding bgimage from css to div here.
        }
        //publish event for co-editing and slideeditor in toRender event
        //to make sure all the necessary css has been applied and the DOM can be processed
        this.publishSlideSelectedEvent(this.selectedSlide);
        
        this.currentScene.showSlideSorter();    //wj
        slideSorterDiv.style.visibility="visible";
        //slideSorterDiv.style.display="block";
        slideSorterToolDiv.style.visibility="visible";
        //dojo.byId(this.slideSorterToolsId).style.display = 'block';
        var eventData = [{eventName: 'slideSorterFinalRendered'}];
        concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
    },

	handleSubscriptionEvents : function(data){
		if(data!=null){
			if (data.eventName==concord.util.events.keypressHandlerEvents_eventName_keypressEvent){
				this.keypressHandle(data);
			}	
			else if (data.eventName == concord.util.events.slideShowEvents_eventName_getSlidesForShow){
				this.handleSlideShowRequest();
			}
		}
	},
	keypressHandle:function(data){		
		if (this.getFocusComponent() != concord.util.events.PRES_MENUBAR_COMPONENT && this.getFocusComponent() != concord.util.events.PRES_TOOLBAR_COMPONENT){
			var e = data.e;
			if (data.eventAction==this.DOWN_ARROW || data.eventAction==this.PAGE_DOWN || data.eventAction==this.RIGHT_ARROW){
				 this.selectNextSlide();
			 } else if (data.eventAction==this.UP_ARROW || data.eventAction==this.PAGE_UP || data.eventAction==this.LEFT_ARROW){
				 this.selectPreviousSlide();
			 }else if (data.eventAction==this.HOME){
				 this.selectFirstSlide();
			 }else if (data.eventAction==this.END){
				 this.selectLastSlide();
			 }		 
		}
		
	}

	
});