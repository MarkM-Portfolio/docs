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

dojo.provide("pres.mobile.SlideShow");
dojo.require("pres.mobile.mobileUtilAdapter");
dojo.require("pres.widget.SlideShow");
 
dojo.declare("pres.mobile.SlideShow", pres.widget.SlideShow, {
	
	slideShowDataEvt: null,
	pageHeight: "21",
	pageWidth: "28",
	
	configEvents: function(){
		
	},

	constructor: function(){
		this.myRotator = false;
		this.fullScreenMessageShown = true;
		this.slideShowConnectArray = [];
	},
	
	setDimensions: function(){
		if(!this.slideContainer)
			return;

		var browserHeight = 768;
		var browserWidth = 1024;
		
		if (this.projectorMode)
		{
			browserHeight = 900;
			browserWidth = 1200;
		}
		
		if (this.mSlideHeight)
			browserHeight = this.mSlideHeight;
		if (this.mSlideWidth)
			browserWidth = this.mSlideWidth;
		
		if (this.pageHeight >= this.pageWidth)
		{
			this.slideHeight = browserHeight; // slideEditorHeight minus the top and bottom 20px margins
			this.slideWidth = this.slideHeight * concord.util.resizer.getRatio(this.pageWidth, this.pageHeight);

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
		
		var marginWidth = (browserWidth - this.slideWidth) / 2;
		var marginHeight = (browserHeight - this.slideHeight) / 2;
		
		var fontSize = PresCKUtil.getBasedFontSize(this.slideHeight, this.pageHeight);

		this.slideContainer.style.fontSize = fontSize + 'px';
		
		this.slideContainer.style.backgroundColor = '#ffffff';
		this.slideContainer.style.border = '0px';
		this.slideContainer.style.position = 'absolute';
		this.slideContainer.style.top =  '0px';
		this.slideContainer.style.left = '0px';
		
		this.slideContainer.style.marginTop =  marginHeight + 'px';
		this.slideContainer.style.marginLeft = marginWidth + 'px';
		
		this.slideContainer.style.height = this.slideHeight + 'px';
		this.slideContainer.style.width = this.slideWidth + 'px';
	},
	
	showEndOfShowMessage: function () {
		this.slideContainer.innerHTML = '';
		this.slideContainer.innerHTML = '<div id="slide_EndOfShow" class="draw_page PM1_concord Mdp1" style="height: 100%; width: 100%; background-color:#FFFFFF; text-align: center; color:#000000; font-weight: bold;font-family:'+window.pe.scene.defaultBrowserFonts+';" presentation_presentation-page-layout-name="blank"><br/>'+this.STRINGS.endofShowMobile+'</div>';
	},
	
	showSlide: function(totalSlides /*ignore*/ , slideContent/* ignore*/)
	{
		this.setDimensions();
		if (!this.currSlide)
			this.currSlide = 0;
		if (this.currSlide == this.slides.length) {
			this.showEndOfShowMessage();
//			return;
		} else {
			var slide = this.slides[this.currSlide];
			var slideIndex = this.currSlide;
			if (slideContent != null)
			{
				tempDiv = document.createElement('div');
				tempDiv.innerHTML = slideContent;
				slide = tempDiv.firstChild;
			}
			
			//destroy speaker notes nodes so they are not included in the slide show
			dojo.query('[presentation_class = "notes"]', slide).forEach(dojo.hitch( this, function(node, index, arr){
				if( this.projectorMode )
					concord.util.mobileUtil.showSpeakerNote(node, slideIndex);

				dojo.destroy(node);				
			}));

			var slideShowHeight = this.slideContainer.offsetHeight;
			var fontSize = this.getFontSize(slideShowHeight);		        		        
			slide.style.fontSize = fontSize + 'px';
			//D30211: slide margin become very big in slide show mode.
			dojo.removeClass(slide,'PM1');
			
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
			// if a node is layoutClassSS hide it unless it has a background color
			var layoutClassElms = dojo.query('.layoutClassSS', slide);
			var hasBackGroundColor = false;
			for ( var i = 0; i < layoutClassElms.length; i++)
			{
				hasBackGroundColor = false;

				// determine if any sub nodes have a background color
				dojo.query("div", layoutClassElms[i]).forEach(function(node, index, arr)
				{
					if (node.style.backgroundColor != "" && node.style.backgroundColor != "transparent")
					{
						hasBackGroundColor = true;
					}
				});
				// D16705 make sure text box outline is not visible in slide show
				layoutClassElms[i].style.outlineStyle = 'none';
				// D18740 remove border of default textbox
				dojo.removeClass(layoutClassElms[i], 'layoutClassSS');

				// only hide the node if there is no background color
				if (hasBackGroundColor == false)
				{
					layoutClassElms[i].style.display = 'none';
				}
				else
				{
					// if a node has background color do not display default text
					dojo.query(".defaultContentText", layoutClassElms[i]).forEach(function(node, index, arr)
					{
						node.innerHTML = "";
					});
				}
			}
	    	
			this.slideContainer.innerHTML = "";
			this.slideContainer.appendChild(slide);
			this.slideContainer.firstChild.style.display = 'block';
			this.slideContainer.firstChild.style.margin = '0px';
			
			pres.utils.shapeUtil.scaleShapeForZoom(this.slideContainer, this.slideContainer.offsetHeight, false);
		}

		setTimeout( dojo.hitch(this, this.postSwithSlideEvent, smil_type, smil_subtype, smil_direction ), 0);
	},
	
	postSwithSlideEvent: function(smil_type,smil_subtype,smil_direction)
	{
		var events = [];
		var params = [];
		params.push(pe.scene.ssObject.currSlide);
		params.push(pe.scene.ssObject.slides.length);
		if (smil_type) {
			params.push(smil_type,smil_subtype,smil_direction);
		}
		events.push({"name":"buildSlide", "params":params});
		
		// post event.
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},
	
	touchStart: function(event)
	{
		this.startTouchX = event.touches[0].pageX;
		this.touchMove = false;
	},
	
	touchMoveFunc: function(event)
	{
		event.preventDefault();
		this.touchMove = true;
		this.endTouchX = event.touches[0].pageX;
	},
	
	touchEnd: function(event)
	{
		if (this.touchMove)
		{
			if (this.endTouchX - this.startTouchX < 0)
				this.showNextSlide();
			else
				this.showPrevSlide();
		}
	},

	gestureEnd: function(event) {
		var sceneObj = window.pe.scene; 
		if (event.scale < 1.0) {
			sceneObj.closeSlideShow();
		}
		sceneObj.exitSlideShow();
	},
		
	destroy: function()
	{
		this.inherited(arguments);
		if(!this.slideShowConnectArray)
			 this.slideShowConnectArray = [];
		 for(var i=0; i<this.slideShowConnectArray.length; i++){
	           dojo.disconnect(this.slideShowConnectArray[i]);       
	      }
	      this.slideShowConnectArray = [];
	},
	
	configUserEvts: function() {
		if(!this.slideShowConnectArray)
			 this.slideShowConnectArray = [];
		
        for(var i=0; i<this.slideShowConnectArray.length; i++){
            dojo.disconnect(this.slideShowConnectArray[i]);       
        }
        this.slideShowConnectArray = [];
        
        this.slideContainer = dojo.byId('slideShowContainer');
        if (this.slideContainer) {
            this.slideShowConnectArray.push(dojo.connect(this.slideContainer,'touchstart', dojo.hitch(this,this.touchStart)));
            this.slideShowConnectArray.push(dojo.connect(this.slideContainer,'touchmove', dojo.hitch(this,this.touchMoveFunc)));
            this.slideShowConnectArray.push(dojo.connect(this.slideContainer,'touchend', dojo.hitch(this,this.touchEnd)));
            this.slideShowConnectArray.push(dojo.connect(this.slideContainer,'gestureend', dojo.hitch(this,this.gestureEnd)));
        }
	},
	
	getFontSize: function(height)
	{
		var fontSize = (height * 20)/((this.pageHeight*96)/2.54);
		return fontSize;		
	}	 
	 
});