dojo.provide("concord.widgets.slideShow");
dojo.require("concord.widgets.presentationDialog");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","slideShow");
dojo.declare("concord.widgets.slideShow",null, {

	slideSorter:null,
	slideStylesData: null,
	slideShowDoc: null,
	slides: null,
	slideContainer: null,
	currSlide: null,
	fromCurrSlide: null,
	slideShowWindow: null,
	slideDataEvent: null,
	presDocURLLocation: null,
	pageHeight: "21",
	pageWidth: "28",
	slideWidth: null,
	slideHeight: null,
	sssUserInviteeList: [],
	connectGridArray:[],
	
	constructor: function(ssWindow){
		this.slideShowWindow = ssWindow;
		this.slideShowDoc = ssWindow.document;
		if (CKEDITOR.env.hc)
			dojo.addClass(this.slideShowDoc.body,'dijit_a11y');
		this.presDocURLLocation = ssWindow.top.opener.location;
		
		this.myRotator = false;
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slideShow");
		this.tipMessage = false;
		this.errorMessageDiv = null;
		
		var ph = dojo.byId('slideEditorContainer').children[0].getAttribute('pageheight');
		var pw = dojo.byId('slideEditorContainer').children[0].getAttribute('pagewidth');
		
		if (ph && pw && ph!="null" && pw!="null")
		{
			this.pageHeight = ph;
			this.pageWidth = pw;
		}
		
		//oneUI30 class added to body need to overwrite background color here
		var bodyNode = ssWindow.document.body;
		dojo.style(bodyNode,{
			backgroundColor:"#000000"
		});
		ssWindow.onresize = dojo.hitch(this,this.setDimensions);
	},

	configEvents: function(slideData){
		g_slideShowDataEvt = concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		
		var eventData = [{eventName: concord.util.events.slideShowEvents_eventName_getSlidesForShow}];
		concord.util.events.publish(concord.util.events.slideShowEvents, eventData);
	},
	
	showTipMessage: function(fullscreen)
	{
		this.tipMessage = true;	
		var interval = 5000;
		var text = (fullscreen) ? this.STRINGS.fullScreen : dojo.string.substitute( this.STRINGS.sharedSlideShowTip,["TAB key"]);
		if (dojo.isFF && fullscreen) {
			if (navigator.platform.indexOf("Mac") != -1) {
				text = this.STRINGS.fullScreenFFMac;
			}
		}
		var className = "lotusMessage lotusInformation";
		var bodyNode = dojo.query('body', this.slideShowDoc);
		bodyNode = bodyNode[0];	
		this.errorMessageDiv = dojo.create("div", {id: "lotus_error_message"}, bodyNode);
		this.errorMessageDiv.className = className;
		var firstChild = dojo.create("img", null, this.errorMessageDiv);
		firstChild.setAttribute( 'src', window.contextPath + window.staticRootPath + '/images/information.png');
		firstChild.setAttribute( 'alt', this.STRINGS.aria_fullScreen_icon);
		firstChild.style.cssText = 'float: left;margin-top: 5px;';
		var secondChild = dojo.create("span", null, this.errorMessageDiv);
		if (BidiUtils.isGuiRtl())
			secondChild.setAttribute ('dir','rtl');
		secondChild.innerHTML = text;
		secondChild.style.cssText = 'float: left; margin-top: 12px;';
		var messageWidth = this.errorMessageDiv.offsetWidth;
		var left = ( this.slideWidth - messageWidth ) / 2;
		left = left + parseFloat(bodyNode.style.marginLeft);
		this.errorMessageDiv.style.cssText = 'left:' + left + 'px;margin-top: 10px;top:0px;display:inline-block;position:absolute;z-index:200;font-family:'+window.pe.scene.defaultBrowserFonts+';';
		//16011: [GVT]The JPN backslash ¥ (U+005C) is not shown correctly after start slide show.		
		var fscreen = fullscreen;
		if( interval ) {
			setTimeout(dojo.hitch(this,function() {
				if (fscreen){ //Now let's show sss tip
					this.hideErrorMessage();
					
					//If userDiv section for sss exists let's display message.
					var userDiv = dojo.query(".userOption", this.slideShowDoc.body);
					if(userDiv && userDiv.length>0){
						this.showTipMessage(false);
					}
					return;
				}				
				if(!this.slideShowWindow.top.closed){
					this.hideErrorMessage();
				}								
			}),interval);
		}		
	},
	
	hideErrorMessage: function() {
		if (this.errorMessageDiv) {
			this.errorMessageDiv.style.display = 'none';
			dojo.destroy(this.errorMessageDiv);
			this.errorMessageDiv = null;
		}
	},
	
	slideShowClick: function(slideShowObj, evt)
	{
		// If it is a hyper link, just return, do not go to next slide
		if (PresCKUtil.bEnableHLink) {
			var targetSpan = evt.target != null ? evt.target : evt.srcElement;
			if (targetSpan) {
				var hyperLink = dojo.attr(targetSpan, PresConstants.HYPER_LINK_STYLE.HLINK_TARGET);
				if (hyperLink)
					return;
			}
		}
		
		slideShowObj.showNextSlide();					
	},

	slideTransition: function(tempDiv,smil_type,smil_subtype,smil_direction)
	{
		 //Slide transition will break userDiv
		var userDiv = dojo.query(".userOption", this.slideShowDoc.body);

		var reInsertDialogNode=null;		
		if (this.ssCoviewSelectUsersDialog && this.ssCoviewSelectUsersDialog.domNode!=null){
			reInsertDialogNode =  concord.util.HtmlContent.temporarilyDetachElement(this.ssCoviewSelectUsersDialog.domNode);
		}

		var reInsertUserDiv=null;		
		if(userDiv && userDiv.length>0){
			reInsertUserDiv =  concord.util.HtmlContent.temporarilyDetachElement(userDiv[0]);
		}
		 
		var windowHasPanes = false;
		var pane0 = "";
		var pane1 = "";
		
		dojo.query("#pane1", this.slideContainer).forEach(function(node, index, arr){
			windowHasPanes = true;
			pane0 = node.innerHTML;
		});
		
		if (windowHasPanes) {
			pane1 = tempDiv.innerHTML;
		} else {
			pane0 = this.slideContainer.innerHTML;
			pane1 = tempDiv.innerHTML;
		}
		
		var transitionToUse = "";
		
		if (smil_type == "slideWipe") {
			if (smil_subtype == "fromTop") {
				transitionToUse	= "dojox.widget.rotator.slideDown";	
			} else if (smil_subtype == "fromRight") {
				transitionToUse	= "dojox.widget.rotator.slideLeft";
			} else if (smil_subtype == "fromBottom") {
				transitionToUse	= "dojox.widget.rotator.slideUp";
			} else if (smil_subtype == "fromLeft") {
				transitionToUse	= "dojox.widget.rotator.slideRight";
			} else
				//the default transition if the transition is not supported
				transitionToUse	= "dojox.widget.rotator.fade";
		} else if (smil_type == "pushWipe") {
			if (smil_subtype == "fromTop") {
				transitionToUse	= "dojox.widget.rotator.panDown";	
			} else if (smil_subtype == "fromRight") {
				transitionToUse	= "dojox.widget.rotator.panLeft";
			} else if (smil_subtype == "fromBottom") {
				transitionToUse	= "dojox.widget.rotator.panUp";
			} else if (smil_subtype == "fromLeft") {
				transitionToUse	= "dojox.widget.rotator.panRight";
			} else
				//the default transition if the transition is not supported
				transitionToUse	= "dojox.widget.rotator.fade";
		} else if (smil_type == "fade") {
			transitionToUse	= "dojox.widget.rotator.crossFade";	
		} else if (smil_type == "barWipe") {
			if (smil_subtype == "topToBottom" && (smil_direction == "none" || smil_direction == "forward")) {
				transitionToUse	= "dojox.widget.rotator.wipeDown";	
			} else if (smil_subtype == "leftToRight" && (smil_direction == "none" || smil_direction == "forward")) {
				transitionToUse	= "dojox.widget.rotator.wipeLeft";
			} else if (smil_subtype == "topToBottom" && smil_direction == "reverse") {
				transitionToUse	= "dojox.widget.rotator.wipeUp";
			} else if (smil_subtype == "leftToRight" && smil_direction == "reverse") {
				transitionToUse	= "dojox.widget.rotator.wipeRight";
			} else
				//the default transition if the transition is not supported
				transitionToUse	= "dojox.widget.rotator.fade";
		} else {
			//the default transition if the transition is not supported
			transitionToUse	= "dojox.widget.rotator.fade";
		}
		
		if (this.myRotator) {
			dojo.query("#pane0", this.slideContainer).forEach(function(node, index, arr){
				dojo.destroy(node);
			});
			dojo.query("#pane1", this.slideContainer).forEach(function(node, index, arr){
				dojo.destroy(node);
			});
						
			this.myRotator.destroy();
			
			//create a new slideShowContainer div tag
			var bodyNode = "";
			dojo.query('body', this.slideShowDoc).forEach(function(node, index, arr){
				bodyNode = node;
			});
			
			dojo.create("div", {id: "slideShowContainer"}, bodyNode);
			
			//now reset this.slideContainer
			this.slideContainer = dojo.query('#slideShowContainer', this.slideShowDoc);			
			this.slideContainer = this.slideContainer[0];
			this.setDimensions();
			
			this.slideContainer.innerHTML ='';
			this.slideContainer.style.position = 'relative';		
//			this.slideContainer.style.border = '1px solid #cccccc';
			this.slideContainer.style.position = 'fixed';
		} else {
			dojo.empty(this.slideContainer);
		}
		
		this.myRotator = new dojox.widget.Rotator({
            panes: [{
                className: "pane0",
                innerHTML: pane0
            },
            {
                className: "pane1",
                transition: transitionToUse,
                transitionParams: "duration: 1000",
                innerHTML: pane1            
            }]
        },
        
        dojo.byId(this.slideContainer));


		//now set the id's of the panes
		dojo.query(".pane0", this.slideContainer).forEach(function(node, index, arr){
			dojo.attr(node, "id", "pane0");
		});
		
		dojo.query(".pane1", this.slideContainer).forEach(function(node, index, arr){
			dojo.attr(node, "id", "pane1");
		});

		//set the height and width for the panes correctly		
		var paneWidth = dojo.style(this.slideContainer, "width");
		var paneHeight = dojo.style(this.slideContainer, "height");
		
		dojo.query("#pane0", this.slideContainer).style("height", ""+paneHeight+"px");
		dojo.query("#pane0", this.slideContainer).style("width", ""+paneWidth+"px");
		dojo.query("#pane1", this.slideContainer).style("height", ""+paneHeight+"px");
		dojo.query("#pane1", this.slideContainer).style("width", ""+paneWidth+"px");
		
		pane0 = dojo.query("#pane0", this.slideContainer)[0];
		pane1 = dojo.query("#pane1", this.slideContainer)[0];
		
		pane0 = dojo.query("div", pane0)[0];
		pane1 = dojo.query("div", pane1)[0];
		//don't do the transition if the user is on the last slide and presses next
		//don't do the transition if the user is on the first slide and presses back
		if ((pane0 == undefined)) {
			dojo.publish('slideShowContainer/rotator/control', ['next']);
		} else {
			if (pane0.id != pane1.id) {
				dojo.publish('slideShowContainer/rotator/control', ['next']);
			}	
		}
		if (PresCKUtil.bEnableHLink)
			this.attachCmdForHyperLink(pane1);
		
		if (reInsertUserDiv!=null || reInsertDialogNode!=null){
			setTimeout(function() {
				//TODO: need to attach these functions after transition ends.
				if (reInsertUserDiv!=null){
					reInsertUserDiv();
				}
				if (reInsertDialogNode!=null){
					reInsertDialogNode();
				}
			},2000);
		}
	},

	showEndOfShowMessage: function () {
		this.slideContainer.innerHTML = '<div id="slide_EndOfShow" class="draw_page PM1_concord Mdp1" style="height: 100%; width: 100%; background-color:#FFFFFF; text-align: center; color:#000000; font-weight: bold;font-family:'+window.pe.scene.defaultBrowserFonts+';" presentation_presentation-page-layout-name="blank"' + (BidiUtils.isGuiRtl() ? 'dir="rtl"' : '') + '><br/>'+this.STRINGS.endofShow+'</div>';
	},
	
	clickHyperLink: function(evt) {
		var targetSpan = evt.target != null ? evt.target : evt.srcElement;
		if (!targetSpan)
			return;

		// Open the link with its url (http or mailto)
		window.open(dojo.attr(targetSpan, PresConstants.HYPER_LINK_STYLE.HLINK_TARGET), "_new");

		// The link has not been visited yet
		if (dojo.hasClass(targetSpan, 'nlink')) {
			dojo.addClass(targetSpan, 'vlink');
			dojo.removeClass(targetSpan, 'nlink');
			var id = dojo.attr(targetSpan, 'id');
			if (id) {
				// Update model info
				var currSlide = this.slides[this.currSlide];
				if (currSlide) {
					var dataSpans = dojo.query('span[id' + '=' + id + ']', currSlide);
					if (dataSpans && dataSpans.length ==1 && dojo.attr(dataSpans[0], PresConstants.HYPER_LINK_STYLE.HLINK_TARGET)) {
						dojo.addClass(dataSpans[0], 'vlink');
						dojo.removeClass(dataSpans[0], 'nlink');
					}
				}
			}
		}
	},
	
	hoverHyperLink: function(evt) {
		var targetSpan = evt.target != null ? evt.target : evt.srcElement;
		if (targetSpan && targetSpan.style.cursor !== 'pointer')
			targetSpan.style.cursor = 'pointer';
	},
	
	attachCmdForHyperLink: function(domSlideShowNode) {
		if (!domSlideShowNode)
			return;
		var slideDataDoc = this;
		if (slideDataDoc) {
			dojo.query('span[' + PresConstants.HYPER_LINK_STYLE.HLINK_TARGET + ']',
				domSlideShowNode).forEach( function(node) {
				dojo.connect(node,'onclick', dojo.hitch(slideDataDoc, slideDataDoc.clickHyperLink));
				dojo.connect(node,'onmouseover', dojo.hitch(slideDataDoc, slideDataDoc.hoverHyperLink));
			});
		}
	},
	
	//
	// totalSlides and slideContent Parameters are only used when current user has joined a shared slideshow
	//
	showSlide: function(totalSlides, slideContent)
	{
		if (this.currSlide == this.slides.length) {
			this.showEndOfShowMessage();
			return;
		}
		
		var slide = this.slides[this.currSlide];
		var tempDiv = null;
		
		if (slideContent!=null){
			 tempDiv = document.createElement('div');
			 tempDiv.innerHTML = slideContent;
			 slide = tempDiv.firstChild;
		}
		//D30211: slide margin become very big in slide show mode.
		dojo.removeClass(slide,'PM1');
		
		//destroy speaker notes nodes so they are not included in the slide show
        dojo.query('[presentation_class = "notes"]', slide).forEach(function(node, index, arr){
        	dojo.destroy(node);	
        });
        
        dojo.query('[contentEditable]', slide).forEach(function(node){
        	dojo.removeAttr(node,"contentEditable");	
        });
        
        if(dojo.isIE)
        {
            dojo.query('[class = "hideInIE"]', slide).forEach(function(node, index, arr){
            	dojo.destroy(node);	
            });	
        }
        
        slide.style.fontSize = '1.0em';
		
		var smil_type = dojo.attr(slide, 'smil_type');
		var smil_subtype = dojo.attr(slide, 'smil_subtype');
		var smil_direction = dojo.attr(slide, 'smil_direction');
		
		if (smil_direction == null) {
			smil_direction = "none";
		}
				
		if (smil_type == "none") {
			smil_type = null;
		}

		//if a node is layoutClassSS hide it unless it has a background color
		var layoutClassElms = dojo.query('.layoutClassSS',slide);
		var hasBackGroundColor = false;
		for (var i = 0; i< layoutClassElms.length; i++) {
			hasBackGroundColor = false;

			//determine if any sub nodes have a background color
			dojo.query("div", layoutClassElms[i]).forEach(function(node, index, arr){
				if (node.style.backgroundColor != "" && node.style.backgroundColor != "transparent" ) {
					hasBackGroundColor = true;	
				}
			});	
			// D16705 make sure text box outline is not visible in slide show
			layoutClassElms[i].style.outlineStyle = 'none';
			// D18740 remove border of default textbox
			dojo.removeClass(layoutClassElms[i], 'layoutClassSS');
			
			//only hide the node if there is no background color
			if (hasBackGroundColor == false) {
				layoutClassElms[i].style.display = 'none';
			} else {
				//if a node has background color do not display default text
				dojo.query(".defaultContentText", layoutClassElms[i]).forEach(function(node, index, arr){
					node.innerHTML = "";
				});
			}	
		}
		
		if (tempDiv == null){
			tempDiv = document.createElement('div');
			tempDiv.appendChild(slide);			
		}
		
		var timeoutTimer = 0;
		if (smil_type) {
			this.slideTransition(tempDiv,smil_type,smil_subtype,smil_direction);
			timeoutTimer = 2000;
		} else {
			this.slideContainer.innerHTML = tempDiv.innerHTML;
			if (PresCKUtil.bEnableHLink)
				this.attachCmdForHyperLink(this.slideContainer);
		}
		
		//ssWindow.coView		
		setTimeout(dojo.hitch(this, function(){
			if (this.slideShowWindow.top.opener && this.slideShowWindow.top.opener.pe.scene.coView==true ){
				//Let's get slide content
				var slideContent = tempDiv.innerHTML;				
				this.slideShowWindow.top.opener.pe.scene.sendCoeditSlideShowCoViewMode(this.currSlide,this.slides.length,slideContent);
				//update slide number in bottom right of slideshow			
				var sp =dojo.query("#slideNumCoview",this.slideShowWindow.document.body);
				if (sp && sp.length >0){
					var message = this.slideShowWindow.top.opener.pe.scene.nls.slideShowCoviewSlidesOf;
					var slideNumber = ((parseInt(this.currSlide)+1) <= this.slides.length) ? (parseInt(this.currSlide)+1) : this.slides.length;
		            message = dojo.string.substitute(message,[slideNumber+"",this.slides.length+""]);	
		            sp[0].innerHTML = message;
				}
			}			
		}),timeoutTimer);
		
		
		if (this.tipMessage == false) {
			if (dojo.isWebKit) {
				if (navigator.platform.indexOf("Mac") == -1) {
					var fullscreenTip = true;
					this.showTipMessage(fullscreenTip);
				}
			} else {
				var fullscreenTip = true;
				this.showTipMessage(fullscreenTip);
			}
		} else {
			this.hideErrorMessage();
		}	
	},
	
	showNextSlide: function()
	{
		if ((this.slideShowWindow.top.opener && this.slideShowWindow.top.opener.pe.scene.joinedOtherUserCoview!=null) || 
			(this.ssCoviewSelectUsersDialog && this.ssCoviewSelectUsersDialog.domNode!=null && this.ssCoviewSelectUsersDialog.domNode.style.display!='none')) {
			return;
		}
		
		if (this.currSlide < (this.slides.length)) {
			this.currSlide++;
		}
		this.showSlide();
	},

	showPrevSlide: function()
	{
		if ((this.slideShowWindow.top.opener && this.slideShowWindow.top.opener.pe.scene.joinedOtherUserCoview!=null) || 
			(this.ssCoviewSelectUsersDialog && this.ssCoviewSelectUsersDialog.domNode!=null && this.ssCoviewSelectUsersDialog.domNode.style.display!='none')) {
			return;
		}
		if (this.currSlide > 0)
			this.currSlide--;
		this.showSlide();		
	},
	
	setDimensions: function(){
		// set slide height and width
		var browserHeight = this.getBrowserHeight(this.slideShowWindow);
		var browserWidth = this.getBrowserWidth(this.slideShowWindow);
		
		if (this.pageHeight >= this.pageWidth)
    	{        	
        	this.slideHeight = browserHeight;  // slideEditorHeight minus the top and bottom 20px margins
        	this.slideWidth = this.slideHeight * concord.util.resizer.getRatio(this.pageWidth, this.pageHeight);;            
            
            if (this.slideWidth > browserWidth) 
            {            	
            	this.slideWidth = browserWidth;
            	this.slideHeight = this.slideWidth * concord.util.resizer.getRatio(this.pageHeight, this.pageWidth);                                
            }
    	}    	
    	else
    	{        	
        	this.slideWidth = browserWidth;
        	this.slideHeight = this.slideWidth * concord.util.resizer.getRatio(this.pageHeight, this.pageWidth);            
            if (this.slideHeight > browserHeight) 
            {            	
            	this.slideHeight = browserHeight;
            	this.slideWidth = this.slideHeight * concord.util.resizer.getRatio(this.pageWidth, this.pageHeight);            	
            }
    	}
		
		var windowBodymargin = (browserWidth - this.slideWidth)/2;
		this.slideShowDoc.body.style.marginLeft = windowBodymargin + 'px';
		
		this.slideContainer.style.height = this.slideHeight + 'px';
		this.slideContainer.style.width = this.slideWidth + 'px';
		
		var fontSize = PresCKUtil.getBasedFontSize(this.slideHeight,this.pageHeight);
		
		this.slideContainer.style.fontSize = fontSize + 'px';
		
		//make sure the panes are the correct size if they exist
		pane0 = dojo.query("#pane0", this.slideContainer)[0];
		pane1 = dojo.query("#pane1", this.slideContainer)[0];
		if (pane0) {
			if ((pane0.style.height != this.slideContainer.style.height) || (pane0.style.width != this.slideContainer.style.width)) {
				pane0.style.height = this.slideContainer.style.height;
				pane0.style.width = this.slideContainer.style.width;
				pane0.style.clip = "rect(0px, " + this.slideContainer.style.width + ", " + this.slideContainer.style.height + ", 0px)";
			}
		}
		if (pane1) {
			if ((pane1.style.height != this.slideContainer.style.height) || (pane1.style.width != this.slideContainer.style.width)) {
				pane1.style.height = this.slideContainer.style.height;
				pane1.style.width = this.slideContainer.style.width;
				pane1.style.clip = "rect(0px, " + this.slideContainer.style.width + ", " + this.slideContainer.style.height + ", 0px)";
			}
		}	
		
		//Let's update user option div
		var userOption = dojo.query("#userOption",this.slideShowDoc.body);
		if (userOption && userOption.length>0){
			//slideNumDiv[0].style.width = this.slideWidth+"px";
			userOption[0].style.width = (this.slideContainer.offsetWidth + 2)+"px";
			userOption[0].style.top = (this.slideContainer.offsetHeight - window.pe.scene.userDivHeight)+"px";				
		}
	},
	
	keyDown: function(slideShowObj, ev)
	{
		if (ev && ev.target &&  ev.target.nodeName.toLowerCase()=='input'){
			return;
		}
		if(ev.keyCode == 13 || ev.keyCode == 39 || ev.keyCode == 34 || ev.keyCode == 40 || ev.keyCode == 32){
			if (dojo.hasClass(ev.target,'imgPlusIcon')){
				var mainScene = this.slideShowWindow.top.opener.pe.scene;
				if (mainScene){
					mainScene.openSlideShowCoviewInProgress(this.slideShowWindow,ev.target,ev);
					return;
				}				
			}
			
			if (dojo.hasClass(ev.target,'imgUserIcon')){
				var mainScene = this.slideShowWindow.top.opener.pe.scene;
				if (mainScene){
					mainScene.toggleUserList(null,null,ev);
					return;
				}				
			}
			
			slideShowObj.showNextSlide();
			ev.stopPropagation();
			if (ev.preventDefault) // prevents event from firing twice in FF
	            ev.preventDefault();
		}
		else if (ev.keyCode == 37 || ev.keyCode == 38 || ev.keyCode == 8 || ev.keyCode == 33){
			slideShowObj.showPrevSlide();
			ev.stopPropagation();
			if (ev.preventDefault) // prevents event from firing twice in FF
	            ev.preventDefault();
		}
		else if (ev.keyCode == 27){
			this.slideShowWindow.top.close();
			ev.stopPropagation();
			if (ev.preventDefault) // prevents event from firing twice in FF
	            ev.preventDefault();
		}else if (ev.keyCode == 9){ //TAB key			
			var userDiv = dojo.query(".userOption",window.pe.scene.ssObject.slideShowDoc.body);
			if (userDiv && userDiv.length>0){
				if (dojo.hasClass(ev.target,'imgUserIcon')){
					if (ev.shiftKey==false){ //moving forward not backward
						userDiv[0].style.opacity="1";
					}else{ // moving backwards
							userDiv[0].style.opacity="0";							
					}					
					return;
				}
				if (dojo.hasClass(ev.target,'imgPlusIcon')){
					if (ev.shiftKey==false){ //moving forward not backward
						userDiv[0].style.opacity="0";
					} else{ //moving backwards
						userDiv[0].style.opacity="1";
					}
					return;
				}
				//Going from body to sssbar
				if (userDiv[0].style.opacity=="0"){
					userDiv[0].style.opacity="1";
				}
			}
		}		
	},
	
	wheelScroll: function(ev){				
		var scroll;
		scroll = ev[(!dojo.isMozilla ? "wheelDelta" : "detail")];
		
		if(ev.wheelDelta){
			scroll = scroll/120;
		} else if(ev.detail) {
			scroll = -scroll/3;
		}
		
		if(scroll < 0){
			this.showNextSlide();
		} else{
			this.showPrevSlide();
		}
		
		if (ev.preventDefault) // prevents event from firing twice in FF
            ev.preventDefault();
			
	},
	
	addIdForHyperLinkSpan: function(domSlideDataNode) {
		if (!domSlideDataNode)
			return;
		dojo.query('span[' + PresConstants.HYPER_LINK_STYLE.HLINK_TARGET + ']',
			domSlideDataNode).forEach( function(node) {
			var id = dojo.attr(node, 'id');
			if (!id)
				concord.util.HtmlContent.injectRdomIdsForElement(node);
		});
	},
	
	runSlideShow: function(data){
		//16011: [GVT]The JPN backslash ¥ (U+005C) is not shown correctlly after start slide show.
		this.slideShowWindow.top.opener.concord.util.HtmlContent.addI18nClassToBody(this.slideShowDoc.body);
		
		this.slides = new Array();
		var sorterSlides = data.slides;
		sorterSlides = dojo.clone(sorterSlides);
		this.slideShowWindow.ssObj = this;
		
		dojo.connect(this.slideShowDoc, 'onclick',dojo.hitch(this, this.slideShowClick, this));
		dojo.connect(this.slideShowDoc, 'onkeydown',dojo.hitch(this, this.keyDown, this));
		
		if (!dojo.isMozilla){
			dojo.connect(this.slideShowDoc, 'onmousewheel',dojo.hitch(this, this.wheelScroll));
		} else {
			dojo.connect(this.slideShowWindow, 'DOMMouseScroll',dojo.hitch(this, this.wheelScroll));
		}
				
		for (var i=0; i<sorterSlides.length; i++)
		{
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = sorterSlides[i];
			if (PresCKUtil.bEnableHLink)
				this.addIdForHyperLinkSpan(tempDiv.firstChild);
			this.slides.push(tempDiv.firstChild);
		}
		
		for(var i=0; i<this.slides.length; i++)
		{
			var slide = this.slides[i];
			slide.style.height = '100%';
			slide.style.width = '100%';
			
			var images = dojo.query('img.draw_image', slide);
			
			var presURL = this.presDocURLLocation.href;
			presURL = presURL.substring(0,presURL.lastIndexOf('/') + 1);
			
			for (var j=0; j<images.length; j++){
				var imgURL = images[j].getAttribute('src');
				if (imgURL && (imgURL.indexOf('data:image/') == -1)) {
					if(imgURL.indexOf('http://') == 0){
						var ssWinURL = this.slideShowWindow.location.href;
						imgURL = imgURL.substring(ssWinURL.lastIndexOf('/') + 1);
					
					}
					imgURL = presURL + imgURL;
				
					images[j].setAttribute('src',imgURL);
				}
			}
		}		

		// add css files
		var cssFilesArray = data.linkElements;

		var headTag = this.slideShowDoc.getElementsByTagName("head")[0];

		for (var i=0; i< cssFilesArray.length;i++)
		{
			//var linkTag = dojo.clone(cssFilesArray[i])
			var linkTag = this.slideShowDoc.createElement('link');
			this.copyLinkAttributes(cssFilesArray[i], linkTag);
			
			if (headTag){
				if (this.slideShowDoc.createStyleSheet){
					this.slideShowDoc.createStyleSheet(linkTag.href);
				}else{
					headTag.appendChild(linkTag);
				}
			}	
		}
		
		// add inline styles
		var inLineStyles = data.styleElements;
		
		var headTag = this.slideShowDoc.getElementsByTagName("head")[0];

		for (var i=0; i< inLineStyles.length;i++){
			var style;
			
			if (dojo.isIE)
			{
				style = this.slideShowDoc.createStyleSheet();
				style.cssText = ""+inLineStyles[i].innerHTML+"";
			}
			else
			{
				style = this.slideShowDoc.createElement('style');
				style.innerHTML = inLineStyles[i].innerHTML;
				
				if (headTag)
					headTag.appendChild(style);
			}
		}

		this.slideContainer = dojo.query('#slideShowContainer', this.slideShowDoc);
		
		if(this.slideContainer.length == 0)
			return;
		
		this.slideContainer = this.slideContainer[0];
		
		this.setDimensions();
		
		this.slideContainer.innerHTML ='';
		this.slideContainer.style.position = 'relative';		
//		this.slideContainer.style.border = '1px solid #cccccc';
		this.slideContainer.style.position = 'fixed';

		if (this.fromCurrSlide)
			this.currSlide = (data.currSelectedSlideNumber) - 1; 
		else 
			this.currSlide = 0;
		
		this.showSlide();
		//this.activateMenu();

		
	},
	
	handleSubscriptionEvents : function(data){
		if(data!=null){
			if (data.eventName==concord.util.events.slideSorterEvents_eventName_slideShowData){	
				this.runSlideShow(data);
			}
		}
	},
	
	unsubscribeEvents: function(){
		if (this.myRotator) {
			this.myRotator.destroy();
		}
		if (this.slideDataEvent)
			dojo.unsubscribe(g_slideShowDataEvt);
	},

	getBrowserHeight: function(ssWindow) 
	{
		var height = 0;
				
		if(typeof(ssWindow.innerHeight) == 'number') 
			height = ssWindow.innerHeight;
		else if(ssWindow.document.documentElement && ssWindow.document.documentElement.clientHeight)
			height = ssWindow.document.documentElement.clientHeight;
		else if(ssWindow.document.body && ssWindow.document.body.clientHeight)
			height = ssWindow.document.body.clientHeight;

		return height;
	},
	
	getBrowserWidth: function(ssWindow) 
	{
		var width = 0;
		
		if(typeof(ssWindow.innerWidth) == 'number') 
			width = ssWindow.innerWidth;
		else if(ssWindow.document.documentElement && ssWindow.document.documentElement.clientWidth)
			width = ssWindow.document.documentElement.clientWidth;
		else if(ssWindow.document.body && ssWindow.document.body.clientWidth)
			width = ssWindow.document.body.clientWidth;
		
		return width;
	},
	
	
	copyLinkAttributes: function (from, to)
	{
		dojo.attr(to,'class',dojo.attr(from,'class'));
		dojo.attr(to,'rel',dojo.attr(from,'rel'));
		var href = dojo.attr(from,'href');
		dojo.attr(to,'href',href);
		var type = dojo.attr(from,'type');
		//D31523: [SlideShow]Slide background is black in slide show, but it is white after we change master style to block then back to default
		if(!type && href.endsWith('.css')){
			type = 'text/css';
		}
		dojo.attr(to,'type',type);
	},
	
	//
	// Shared Slide Show ended dialog
	//
	sssEndedDialog: function(userObj,message) {
		var mainScene = this.slideShowWindow.top.opener.pe.scene;
        //Let's destroy the underlay if it exists       
		  if (!dojo.isIE){
	            if (dijit._underlay!=null){
	            	dijit._underlay.destroy();
	            	dijit._underlay=null;
	            }        	
	        }
		this.sssEndDialog  = new concord.widgets.presentationDialog({
			  'ownerDocument': this.slideShowWindow.document,
	          'id': 'sssEndDialog_'+new Date().getTime(),
	          'aria-describedby': 'sssEndDialog_containerNode',
	          'title': mainScene.nls.slideShowCoviewEnded,
	          'content':message,
	          'presDialogHeight': '175',
	          'presDialogWidth' : '360',
	          'presDialogTop'   : (this.slideShowWindow.screen.height/2) - 115,
	          'presDialogLeft'  : (this.slideShowWindow.screen.width/2) - 150,   
	          'heightUnit':'px',
	          'presModal': dojo.isIE? false :true,
	          'destroyOnClose':true,
	          'presDialogButtons' : [{'label':mainScene.slideEditor.STRINGS.ok,'action':dojo.hitch(this,function(){	        	  																									
																									        	  if (!dojo.isIE){
																									                  if (dijit._underlay!=null){
																									                  	dijit._underlay.destroy();
																									                  	dijit._underlay=null;
																									                  }        	
																									              }
	        	  																							     this.slideShowWindow.top.close();
	        	  																						})}]        
	        });
		this.sssEndDialog.startup();
		this.sssEndDialog.show();

		
		this.sssEndDialog.domNode.style.height='auto';
		//This will prevent the zIndex from being updated to 0 which will cause the dialog to fall behind the content.
		this.sssEndDialog.getMaxZindex = dojo.hitch(this.sssEndDialog,function(){ return 9999; });
       
    },		
	
	//
	// opens invitation for slide show coview
	//
	openSlideShowCoviewSelectUsersDialog: function(){
		var mainScene = this.slideShowWindow.top.opener.pe.scene;
		var userObj = mainScene.authUser;
		var tmsStmp = new Date().getTime();
        var widgetId= "P_d_slideShowCoviewSelectUsersAdd_"+tmsStmp;
        var contentId = "P_d_slideShowCoviewSelectUsersAdd_MainDiv_"+tmsStmp;
        var title = mainScene.nls.slideShowCoviewAddTitle;  
        //Let's destroy the underlay if it exists  
        if (!dojo.isIE){
            if (dijit._underlay!=null){
            	dijit._underlay.destroy();
            	dijit._underlay=null;
            }        	
        }
        this.ssCoviewSelectUsersDialog = new concord.widgets.presentationDialog({
          'id': widgetId,
          'title': title,
          'aria-describedby': contentId,
          'content': "<div id='"+contentId+"' style='padding:0 15px 15px; height:150px;'> </div>",
          'presDialogHeight': (dojo.isIE)? '310' :'306',
          'presDialogWidth' : '455',
          'presDialogTop'   : (this.slideShowWindow.screen.height/2) - 200,
          'presDialogLeft'  : (this.slideShowWindow.screen.width/2) - 225,   
          'heightUnit':'px',
          'presModal': dojo.isIE? false :true,
          'destroyOnClose':true,
          'presDialogButtons' : [
                                       {'label':mainScene.slideEditor.STRINGS.ok,'id':'ssCoviewSelectUsersAdd_okButton_'+tmsStmp,	                                                 
                                        'action':dojo.hitch(this,this.processSelectedUsers)},
                                       {'label':mainScene.slideEditor.STRINGS.cancel,'id':'ssCoviewSelectUsersAdd_cancelButton_'+tmsStmp,
                                        'action':dojo.hitch(this,function(){ 
                                        									this.sssUserInviteeList=[];
                                        									this.editorGrid.destroyRecursive(); 
                                        									 this.editorGrid=null;                                         									
                                        									  if (!dojo.isIE){
                                        								            if (dijit._underlay!=null){
                                        								            	dijit._underlay.destroy();
                                        								            	dijit._underlay=null;
                                        								            }        	
                                        								        }			 
                                        })}
                                       ]	                  
        });
        this.ssCoviewSelectUsersDialog.startup();
        this.ssCoviewSelectUsersDialog.getMaxZindex = dojo.hitch(this.ssCoviewSelectUsersDialog,function(){ return 9999; });
        this.ssCoviewSelectUsersDialog.show();
        // fix for defect 15588 need to move this to presentation.css
  		this.ssCoviewSelectUsersDialog.domNode.style.backgroundColor='#cccccc';
  		this.ssCoviewSelectUsersDialog.domNode.style.height='auto';

  		// Now let's insert content to the dialog
        var dialogContentDiv = dojo.byId(contentId);
        
        //Add dialog paragraph
        var p = dojo.doc.createElement("p");
        var pText = mainScene.nls.slideShowCoviewMessage;  
        dojo.style(p,{
        	marginBottom:"10px"
        });
        
        p.appendChild(dojo.doc.createTextNode(pText));
        
        dialogContentDiv.appendChild(p);
        dialogContentDiv.appendChild(dojo.doc.createElement("br"));                
                
//        ADD USER TABLE
        var userDivWidth = "250";
        var inputBoxDiv = dojo.doc.createElement("div");
        inputBoxDiv.className = "userFilterBar";	
        dojo.style(inputBoxDiv,{
        	"marginBottom":"10px",
        	"marginLeft": "15px",
        	"marginTop":"8px",
        	"position":"relative",
            "top": "-22px",
        	"width":"258px",
        	"color":"#CCCCCC"
        });
        
        
        dialogContentDiv.appendChild(inputBoxDiv);
        this.addSearchBar(inputBoxDiv);
//			ADD USER LIST 	        

        var userDiv = dojo.doc.createElement("div");
        userDiv.className="userList";
        dojo.style(userDiv,{
        	"padding":"5px",
        	"border":"1px solid #CCCCCC",
        	"height":"102px",
        	"overflowX":"hidden",
        	"outline":"none",
        	"width":userDivWidth+"px",	        	
        	"overflowY":"auto",
        	"position":"relative",
        	"top":"-25px",
        	"left":"13px"
        });
        dialogContentDiv.appendChild(userDiv);

		var rootEditor = dojo.doc.createElement( 'div' );
		rootEditor.id = "sssObjGridMain_ssAdd";	
		rootEditor.className = 'editorCss';
		
		var newEditor = dojo.doc.createElement( 'div' );
		newEditor.id = "sssEditorMain_ssAdd";
		userDiv.appendChild(rootEditor);
		
		
        var formatters = {
                // GRID FORMATTERS
                "legend": function(value, idx){
                    if (value && value.length) {
                        //if there is a value, it is a color code, so create something centered for it.  
                        var nls = dojo.i18n.getLocalization("concord.widgets.sidebar","SideBar"); 	
                        var ariaLabel = dojo.string.substitute(nls.editorColor,[value[2]]);                                       
                        return '<span aria-label="'+ariaLabel+'"'+ 'title="'+nls.editorTitle+'"'+'style="width:12px;height:12px;display:inline-block;background-color: ' + value[0] + ';border: 1px solid '+ value[1]+';"></span>';
                    }
                    return "";
                },
                "checkBoxFunc": function(value, idx){
                	if ( value && value.length && (mainScene.authUser.getId() != value[0])){	                		
                		return '<input id = '+idx+' class="gridCheckBox" type="checkbox" style="width: auto" >';
                	}
                	return"";
                }
            };
		
        var editorConfig = {
                layout: {
                	
                    defaultCell: {
                        headerStyles: 'padding: 0',
                        styles: 'text-align: left;padding:4px 1px 4px 9px;'
                    },
                    cells: [
                    {
                        fields: ['userId','displayName'],
                        width: '5%',
                        styles: "text-align: center;",
                        editable: true,                  
                        formatter: formatters["checkBoxFunc"]
                    },	                    	                   
                            
                     {
                        field: "displayName",
                        width: '95%',
                        cellStyles: 'font-style: normal;font-family:Arial, Helvetica, sans-serif; cursor:default;text-align: left',
                        cellClasses: 'defaultColumn',
                        headerStyles: 'text-align: center;'
                    }
 
                    ]
                }
            };
        var userData = mainScene.getEditorStore().getClonedEditors();
        
        userData.items.shift(); // Remove first entry which should be the current user. May need to harden
        
        userData.items = this.removeJoinedUsers(userData.items); // Need to remove users who are not currently in the document
        
        var dataStore = new dojo.data.ItemFileReadStore({ 	
        	data: userData
    	});
        
       
		// create a new grid:
        var editorGrid = this.editorGrid =  new dojox.grid.DataGrid({	        	
            store: dataStore,
            autoHeight: true,
            selectionMode: 'multiple',
            rowSelector:false,
            onCellClick: dojo.hitch(this, function(e){ this.handleRowClick(e.rowIndex);}),
            onRowClick: dojo.hitch(this, function(e){ /*TBD*/}),
            onKeyDown: dojo.hitch(this.editorGrid, function(ssObject,tmsStmp,dialogObject,e) {
	            
	    		if(e.altKey || e.metaKey){
	    			return;
	    		}
	    		var dk = dojo.keys;
	    		var colIdx;
	    		switch(e.keyCode){
	    			case dk.ESCAPE:
	    				this.edit.cancel();
	    				break;
	    			case dk.SPACE:
	    			case dk.ENTER:
	    				ssObject.handleRowClick(this.focus.rowIndex);
	    				break;
	    			case dk.TAB:
	    				dojo.stopEvent(e);
	    				this.rows.setOverRow(-2);
	    				if (e.shiftKey){	    					
	    					if (window.pe.scene.ssObject.searchBoxObj && window.pe.scene.searchBoxObj.focusNode){				  
	    						window.pe.scene.ssObject.searchBoxObj.focusNode.focus();
	    						window.pe.scene.ssObject.searchBoxObj.focusNode.select();
	    					}		
	    				}else{
	    					  var okBtn = dojo.query('#ssCoviewSelectUsersAdd_okButton_'+tmsStmp,dialogObject.domNode);	
	    					  if (okBtn && okBtn.length>0){
	    						  okBtn[0].focus();	 		  
	    					  }
	    				}	    					    				
	    				break;
	    			case dk.LEFT_ARROW:
	    			case dk.RIGHT_ARROW:
	    				if(!this.edit.isEditing()){
	    					var keyCode = e.keyCode;  // IE seems to lose after stopEvent when modifier keys
	    					dojo.stopEvent(e);
	    					colIdx = this.focus.getHeaderIndex();
	    					if (colIdx >= 0 && (e.shiftKey && e.ctrlKey)){
	    						this.focus.colSizeAdjust(e, colIdx, (keyCode == dk.LEFT_ARROW ? -1 : 1)*5);
	    					}
	    					else{
	    						var offset = (keyCode == dk.LEFT_ARROW) ? 1 : -1;
	    						if(dojo._isBodyLtr()){ offset *= -1; }
	    						this.focus.move(0, offset);
	    					}
	    				}
	    				break;
	    			case dk.UP_ARROW:
	    				if(!this.edit.isEditing() && this.focus.rowIndex !== 0){
	    					dojo.stopEvent(e);		    					
	    					var curRow = ssObject.editorGrid.rows.overRow;
	    					if (curRow>0){
	    						ssObject.editorGrid.focus.setFocusIndex((curRow-1), 1);
	    					}	    					    
	    					//this.focus.move(-1, 0);
	    				}
	    				break;
	    			case dk.DOWN_ARROW:
	    				if(!this.edit.isEditing() && this.focus.rowIndex+1 != this.rowCount){
	    					dojo.stopEvent(e);
	    					var chkInput = dojo.query(".gridCheckBox",ssObject.editorGrid.domNode);
	    					var curRow = ssObject.editorGrid.rows.overRow;
	    					if ((chkInput.length-1) >= 0 && curRow<(chkInput.length-1)){
	    						ssObject.editorGrid.focus.setFocusIndex((curRow+1), 1);
	    					}
	    					//this.focus.move(1, 0);
	    				}
	    				break;
	    			case dk.PAGE_UP:
	    				if(!this.edit.isEditing() && this.focus.rowIndex !== 0){
	    					dojo.stopEvent(e);
	    					if(this.focus.rowIndex != this.scroller.firstVisibleRow+1){
	    						this.focus.move(this.scroller.firstVisibleRow-this.focus.rowIndex, 0);
	    					}else{
	    						this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex-1));
	    						this.focus.move(this.scroller.firstVisibleRow-this.scroller.lastVisibleRow+1, 0);
	    					}
	    				}
	    				break;
	    			case dk.PAGE_DOWN:
	    				if(!this.edit.isEditing() && this.focus.rowIndex+1 != this.rowCount){
	    					dojo.stopEvent(e);
	    					if(this.focus.rowIndex != this.scroller.lastVisibleRow-1){
	    						this.focus.move(this.scroller.lastVisibleRow-this.focus.rowIndex-1, 0);
	    					}else{
	    						this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex+1));
	    						this.focus.move(this.scroller.lastVisibleRow-this.scroller.firstVisibleRow-1, 0);
	    					}
	    				}
	    				break;
	    			default:
	    				break;
	    		}
	           },this,tmsStmp,this.ssCoviewSelectUsersDialog),
            structure: editorConfig.layout,
            onCellFocus: dojo.hitch(this.editorGrid, function(inCell, inRowIndex){
            						this.edit.cellFocus(inCell, inRowIndex);
            						this.rows.setOverRow(inRowIndex);
            			 }),
            onSelected:  dojo.hitch(this,"handleRowClick")
        }, newEditor);
        
        rootEditor.appendChild(this.editorGrid.domNode);
        
      //
      // Need to overwrite certain functions that use document instead of dojo.doc this causes problems when loading the dialog in another window
      //
      this.editorGrid.scroller.createPageNode = dojo.hitch(this.editorGrid.scroller, function(){
    		  var p = dojo.doc.createElement('div');
    		  dojo.attr(p,"role","presentation");
    		  p.style.position = 'absolute';
    		  //p.style.width = '100%';
    		  p.style[dojo._isBodyLtr() ? "left" : "right"] = '0';
    		  return p;    		    
      });
      
      for (var indx =0; indx<this.editorGrid.views.views.length;indx++){
    	  var view = this.editorGrid.views.views[indx];
    	  
    	  view.createRowNode = dojo.hitch(view, function(inRowIndex){
    		  var node = dojo.doc.createElement("div");
    		  node.className = this.classTag + 'Row';
    		  if (this instanceof dojox.grid._RowSelector){
    			  dojo.attr(node,"role","presentation");
    		  }else{
    			  dojo.attr(node,"role","row");
    			  if (this.grid.selectionMode != "none") {
    				  dojo.attr(node, "aria-selected", "false"); //rows can be selected so add aria-selected prop
    			  }
    		  }
    		  node[dojox.grid.util.gridViewTag] = this.id;
    		  node[dojox.grid.util.rowIndexTag] = inRowIndex;
    		  this.rowNodes[inRowIndex] = node;
    		  return node;     
    	  });
    	  
    	  view.focus = dojo.hitch(view, function(){
	  			if(dojo.isIE || dojo.isWebKit || dojo.isOpera){	  				
	  				try{
	  					this.hiddenFocusNode.focus();
	  				}catch(e){
	  					
	  				}
	  			}else{
	  				this.scrollboxNode.focus();
	  			}
  		  });
      }
      
      this.editorGrid.scroller.createPageNode = dojo.hitch(this.editorGrid.scroller, function(){
		  var p = dojo.doc.createElement('div');
		  dojo.attr(p,"role","presentation");
		  p.style.position = 'absolute';
		  //p.style.width = '100%';
		  p.style[dojo._isBodyLtr() ? "left" : "right"] = '0';
		  return p;    		    
      });      
      
      this.editorGrid.startup();
      //Let's update joined users
      this.updateSelectedUsers();
      
      //We should also remove non active users 
      //this.editorGrid.filter({observerMode:new RegExp("off|on")});  //Turn this back on when we support observer mode
      
      //Formatting 
      var ctDiv = dojo.query(".dojoxGridContent",editorGrid.domNode);
      if (ctDiv && ctDiv.length>0 && ctDiv[0].firstChild)
    	  ctDiv[0].firstChild.style.position ="";
      
      var chkBoxes = dojo.query(".dojoxGridHiddenFocus", editorGrid.domNode);
	  for (var i=0; i<chkBoxes.length; i++){
		  chkBoxes[i].style.display = "none";
	  }
      
	  var headerGrid = dojo.query(".dojoxGridHeader",this.editorGrid.domNode);
	  if (headerGrid.length>0){
		  headerGrid[0].style.display='none';
	  }

	  var headerGrid = dojo.query(".dojoxGridMasterHeader",this.editorGrid.domNode);
	  if (headerGrid.length>0){
		  headerGrid[0].style.display='none';
	  }	  
	  
	  dojo.connect(this.editorGrid,"sizeChange",this.editorGrid,function(){
								  if (this.editorGrid){
								      var ctDiv = dojo.query(".dojoxGridContent",this.editorGrid.domNode);
								      if (ctDiv && ctDiv.length>0 && ctDiv[0].firstChild)
								    	  ctDiv.firstChild.style.position ="";
								      var chkBoxes = dojo.query(".dojoxGridHiddenFocus", editorGrid.domNode);
									  for (var i=0; i<chkBoxes.length; i++){
										  chkBoxes[i].style.display = "none";
									  }
								      
									  var headerGrid = dojo.query(".dojoxGridHeader",this.editorGrid.domNode);
									  if (headerGrid.length>0){
										  headerGrid[0].style.display='none';
									  }

									  var headerGrid = dojo.query(".dojoxGridMasterHeader",this.editorGrid.domNode);
									  if (headerGrid.length>0){
										  headerGrid[0].style.display='none';
									  }	  								  }
					});
	  
	  dojo.connect(this.editorGrid,"_fetch",this.editorGrid,dojo.hitch(this,"updateSelectedUsers"));	
	  
	  dojo.connect(this.editorGrid.rows,"setOverRow",this,"focusAfterRowover");
	  
	  if(this.dialogEventClick){
		 dojo.disconnect(this.dialogEventClick); 
	  }
	  this.dialogEventClick = dojo.connect(this.ssCoviewSelectUsersDialog.domNode,'onclick', function(e){if (e){e.stopPropagation(); e.preventDefault();}});
	
	  var dialogObject= this.ssCoviewSelectUsersDialog;

	  setTimeout(function(){		
		  var filterNode = dojo.query("input",dialogObject.domNode);
		  if (filterNode && filterNode.length>0){	
			  dojo.attr(filterNode[0], 'tabindex', '1');			  
			  filterNode[0].focus();
		  }		
		  
		  var okBtn = dojo.query('#ssCoviewSelectUsersAdd_okButton_'+tmsStmp,dialogObject.domNode);	
		  if (okBtn && okBtn.length>0){
			  dojo.attr(okBtn[0], 'tabindex', '50');			  
		  }
		  
		  var cancelbtn = dojo.query('#ssCoviewSelectUsersAdd_cancelButton_'+tmsStmp,dialogObject.domNode);
		  if (cancelbtn && cancelbtn.length>0){
			  dojo.attr(cancelbtn[0], 'tabindex', '55');	
		  }		
		  
		  dojo.connect(cancelbtn[0],'onkeydown',dojo.hitch(this, function(e){				  
			  if(e.altKey || e.metaKey){
	    			return;
	    		}
			  if (e.keyCode == dojo.keys.TAB){
				  e.stopPropagation();
				  e.preventDefault();
				  filterNode[0].focus();
			  }
		  }));		  
		  
	  },200);	  
	},
	
	processSelectedUsers: function(){
		var mainScene = this.slideShowWindow.top.opener.pe.scene;		
		mainScene.sendCoeditSlideShowCoViewStart(this.currSlide,this.slides.length,this.slideContainer.innerHTML,this.sssUserInviteeList);
		//now we need to update the scene's list with new users added
		for (var i=0; i<this.sssUserInviteeList.length; i++){
			var id = this.sssUserInviteeList[i];
			if (PresCKUtil.isInArray(mainScene.sssUserInviteeList,id)<0){
				mainScene.sssUserInviteeList.push(id);
			}
		}						
		  if (!dojo.isIE){
	            if (dijit._underlay!=null){
	            	dijit._underlay.destroy();
	            	dijit._underlay=null;
	            }        	
	      }
	},
		
	//
	// As the user mouses over the row we need to focus that row
	//
	focusAfterRowover: function(){
		console.log("focusAfterRowover "+this.editorGrid.rows);
		var row = this.editorGrid.rows.overRow;
		if (row >= 0){
			var inCell = this.editorGrid.getCell(1);
			var inRowIndex = row;
			// SetFocus Index without the call to grid.onCellFocus
			// summary:
			//	focuses the given grid cell
			// inCell: object
			//	grid cell object
			// inRowIndex: int
			//	grid row index
			if(inCell && !this.editorGrid.focus.isFocusCell(inCell, inRowIndex)){
				this.editorGrid.focus.tabbingOut = false;
				if (this.editorGrid.focus._colHeadNode){
					this.editorGrid.focus.blurHeader();
				}
				this.editorGrid.focus._colHeadNode = this.editorGrid.focus._colHeadFocusIdx = null;
				this.editorGrid.focus.focusGridView();
				this.editorGrid.focus._focusifyCellNode(false);
				this.editorGrid.focus.cell = inCell;
				this.editorGrid.focus.rowIndex = inRowIndex;
				this.editorGrid.focus._focusifyCellNode(true);
			}  
		}
	},
	
	
	handleRowClick: function(e){		
		var item = this.editorGrid.getItem(e);
		var chkBx = dojo.query(".gridCheckBox",this.editorGrid.domNode);
		if (chkBx.length <=e){
			return;
		} 
		chkBx = chkBx[e];
		this.editorGrid.focus.rowIndex = e;
		var index = PresCKUtil.isInArray(this.sssUserInviteeList,item.userId);
		if (!chkBx.checked){
			//let's check the check box				
			chkBx.checked=true;	
			if (index<0){// if not there then add
				this.sssUserInviteeList.push(item.userId);
			}
		}else{
			chkBx.checked= false;
			if (index>=0){// if there then remove
				this.sssUserInviteeList.splice(index,1);
			}
		}
	},	
	
	//
	// removes inactive users from the data list
	//
	removeJoinedUsers: function(items){
		var mainScene = this.slideShowWindow.top.opener.pe.scene;
		var joinedUsers = mainScene.joinedMyCoview;
		if (items!=null){
			var tmpArr =[];
			var size = items.length-1;
			for (var i=size; i>=0; i--){
				var obj = items[i];
				if (!joinedUsers[obj.userId]){
					tmpArr.unshift(obj);
				}					
			}
			return tmpArr;
		}
	},
		
	//
	// This updates the list of selected users in the dialog
	//
	updateSelectedUsers: function(){	
		var mainScene = this.slideShowWindow.top.opener.pe.scene;
		
		for(var i=0; i<this.connectGridArray.length; i++){
             dojo.disconnect(this.connectGridArray[i]);        
        }
		this.connectGridArray=[];
		var chkInput = dojo.query(".gridCheckBox",this.editorGrid.domNode);
		for (var x=0; x < chkInput.length; x++){
			var rowIndex =x;
			var item = this.editorGrid.getItem(rowIndex);
			var itemId = item.userId;
							
			//
			// Whenever we mousedown on the input check we need to send focus to col1 of that row
			//
			this.connectGridArray.push(dojo.connect(chkInput[x],'onmousedown',dojo.hitch(this,function(node,e){
				e.preventDefault();
				e.stopPropagation();
				this.handleRowClick(node.id);
				//we need to ensure that the focus is on the sibling of the parent
				node.parentNode.nextSibling.focus();					
			},chkInput[x])));
			
			//
			// Whenever input check is focussed we need to send focus to col1 of that row
			//
			this.connectGridArray.push(dojo.connect(chkInput[x],'onfocus',dojo.hitch(this,function(node,rowIndex,e){
				e.preventDefault();
				e.stopPropagation();
				this.editorGrid.focus.setFocusIndex(rowIndex, 1);    
			},chkInput[x],x)));
							
			//
			// Whenever col1 receives the focus we need to invoke focus manager
			//
			var col0  = chkInput[x].parentNode;
			var col1 = col0.nextSibling;
			this.connectGridArray.push(dojo.connect(col1,'onfocus',dojo.hitch(this,function(col1,rowIndex,e){
				e.preventDefault();
				e.stopPropagation();
				this.editorGrid.focus.setFocusIndex(rowIndex, 1);   			
			},col1,x)));				
						
			if (PresCKUtil.isInArray(this.sssUserInviteeList,itemId)>-1){			
				//this user was selected let's set check box
				chkInput[x].checked = true;
			} else{
				chkInput[x].checked = false;
			}
		}
		this.updateGridRowTabIndex();
	},
	
	
	
	
	//
	// This updates the tabindex of the first row
	//
	updateGridRowTabIndex: function(){
		var chk = dojo.query(".gridCheckBox",this.editorGrid.domNode);
		if (chk && chk.length >0){
			var col0 = chk[0].parentNode;
			var col1=col0.nextSibling;
			if (col1 && col1.nodeName.toLowerCase()=='td'){ 
				dojo.attr(col1,'tabindex',5);
			}				
		}
	},		
	//
	// Add search bar for share slide show (sss) dialog
	//
	addSearchBar: function(main){
		//Add search bar		
		var mainScene = this.slideShowWindow.top.opener.pe.scene;
		
		var id = 'sss_SearchBoxID_'+ new Date().getTime();
		var searchBoxTitle = mainScene.nls.slideShowCoviewDialogInput;
	
		var searchDivSection = this.searchDivSection = dojo.doc.createElement("div");
		main.appendChild(searchDivSection);
		searchDivSection.id = 'searchDivSection_'+ new Date().getTime();			
		if (dijit.byId(id) ==null){
			var message = mainScene.nls.slideShowCoviewDialogInput;
			this.searchBoxObj = new dijit.form.TextBox({'id': 'searchBox_'+id, 'trim':true, 'maxLength':'100', 'value':message}, searchDivSection); 
			this.searchBoxObj.startup();
			dojo.addClass(this.searchBoxObj.domNode,'userNameFilter');
			dojo.attr( this.searchBoxObj.focusNode, 'tabindex', 10);
			dojo.attr( this.searchBoxObj.focusNode, 'title', searchBoxTitle);
			if (this.searchBarEvt){
				dojo.disconnect(this.searchBarEvt);
			}
			this.searchBarEvt = dojo.connect(this.searchBoxObj.domNode,"onkeydown",this.searchBoxObj, function(event){
				 if (!this.firstClick){
			    	   this.setValue("");
			    	   this.firstClick=true;
			    	   this.domNode.style.color ="#000000";
			       } 
				});
			
			if (this.searchBarEvt2){
				dojo.disconnect(this.searchBarEvt2);
			}				
			this.searchBarEvt2 = dojo.connect(this.searchBoxObj.domNode,"onkeyup",this,dojo.hitch(this,"getUserKeyStroke",this.searchBoxObj));			
			
			dojo.connect(this.searchBoxObj.domNode,"onclick",null,function(e){if (e){e.stopPropagation(); e.preventDefault();} this.focus();});
			// WAI-ARIA role for searchbox set to role="search"
			if (this.searchBoxObj && this.searchBoxObj.domNode && this.searchBoxObj.domNode.children && this.searchBoxObj.domNode.children.length > 0) {
				dijit.setWaiRole(this.searchBoxObj.domNode.children[0],'search');
				dijit.setWaiState(this.searchBoxObj.domNode.children[0],'label',searchBoxTitle);
			}
		}
				
		dojo.style(this.searchBoxObj.domNode,'width','100%');			
	},
	//
	//Gets the user keystroke for the shared slide show dialog
	//
	getUserKeyStroke: function(searchBoxObj,e){
		 var text = searchBoxObj.getValue();
		 //if (text.length>0){
			 this.editorGrid.filter({ displayName:"*"+text+"*" });
		 //}			
	}
});

