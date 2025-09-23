dojo.provide("concord.widgets.mSlideShow");

dojo.requireLocalization("concord.widgets","slideShow");
dojo.declare("concord.widgets.mSlideShow",[concord.widgets.slideShow], {
	
	slideShowDataEvt: null,
	pageHeight: "21",
	pageWidth: "28",

	//avoid calling the constructor from the super class
	"-chains-" : {
		constructor: "manual"
	},
	
	constructor: function(){
		this.myRotator = false;
		this.fullScreenMessageShown = true;
		
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slideShow");
		
		var ph = dojo.byId('slideEditorContainer').children[0].getAttribute('pageheight');
		var pw = dojo.byId('slideEditorContainer').children[0].getAttribute('pagewidth');
		
		if (ph && pw && ph!="null" && pw!="null")
		{
			this.pageHeight = ph;
			this.pageWidth = pw;
		}
		//default width and height.
		this.slideWidth = 1024;
		this.slideHeight = 768;
	},
	
	configEvents: function(slideData){
		this.slideShowDataEvt = concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		
		var eventData = [{eventName: concord.util.events.slideShowEvents_eventName_getSlidesForShow}];
		concord.util.events.publish(concord.util.events.slideShowEvents, eventData);
	},
	
	unsubscribeEvents: function(){
		dojo.unsubscribe(this.slideShowDataEvt);
	},
	
	runSlideShow: function(data){

		this.slides = new Array();
		var sorterSlides = data.slides;
		sorterSlides = dojo.clone(sorterSlides);
	
		for (var i=0; i<sorterSlides.length; i++)
		{
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = "";
			tempDiv.innerHTML = sorterSlides[i];
			this.slides.push(tempDiv.firstChild);
		}
		
		for(var i=0; i<this.slides.length; i++)
		{
			var slide = this.slides[i];
			slide.style.height = '100%';
			slide.style.width = '100%';
		}		
		
		this.slideContainer = dojo.byId('slideShowContainer');
		
		//dojo.connect(this.slideContainer, 'onclick',dojo.hitch(this, this.slideShowClick, this));
		this.setDimensions();
		this.configUserEvts();
		
		this.slideContainer.innerHTML ='';
		this.slideContainer.style.border = '1px solid #cccccc';
		this.slideContainer.style.position = 'fixed';

		if (this.fromCurrSlide)
			this.currSlide = (data.currSelectedSlideNumber) - 1; 
		else 
			this.currSlide = 0;
		
		this.showSlide();
		//this.activateMenu();
	},
	
	slideShowClick: function(slideShowObj)
	{
		this.showNextSlide();
	},
	
	showNextSlide: function()
	{
		if (this.currSlide < (this.slides.length)) {
			this.currSlide++;
		}
		this.showSlide();
	},

	showPrevSlide: function()
	{
		if (this.currSlide > 0)
			this.currSlide--;
		this.showSlide();		
	},
	
	setDimensions: function(){
		var slideShowDiv = dojo.byId('slideShowContainer');
		//var height = 768;
		//var width = 1024;
		//will change to actual page height and width.
		slideShowDiv.style.height =  this.slideHeight + 'px';
		slideShowDiv.style.width =  this.slideWidth + 'px';
		slideShowDiv.style.position = 'absolute';
		slideShowDiv.style.left = '0px';
		slideShowDiv.style.top = '0px';
		slideShowDiv.style.border = '0px';
		slideShowDiv.style.backgroundColor = '#eeeeee';
	},
	
	showEndOfShowMessage: function () {
		this.slideContainer.innerHTML = '';
		this.slideContainer.innerHTML = '<div id="slide_EndOfShow" class="draw_page PM1_concord Mdp1" style="height: 100%; width: 100%; background-color:#FFFFFF; text-align: center; color:#000000; font-weight: bold;font-family:'+window.pe.scene.defaultBrowserFonts+';" presentation_presentation-page-layout-name="blank"><br/>'+this.STRINGS.endofShowMobile+'</div>';
	},
	
	showSlide: function(totalSlides /*ignore*/ , slideContent/* ignore*/)
	{
		this.setDimensions();
		
		if (this.currSlide == this.slides.length) {
			this.showEndOfShowMessage();
//			return;
		} else {
			var slide = this.slides[this.currSlide];
			var slideIndex = this.currSlide;
			//destroy speaker notes nodes so they are not included in the slide show
			if( this.projectorMode )
			{
				dojo.query('[presentation_class = "notes"]', slide).forEach(function(node, index, arr){
					concord.util.mobileUtil.showSpeakerNote(node, slideIndex)
					dojo.destroy(node);				
				});
			}
			

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
	    	if(! concord.util.mobileUtil.disablePresEditing )
	    	{
	    		var layoutClassElms = dojo.query('.layoutClassSS',slide);
				var hasBackGroundColor = false;
				for (var i = 0; i< layoutClassElms.length; i++) {
					hasBackGroundColor = false;

					//determine if any sub nodes have a background color
					dojo.query("div", layoutClassElms[i]).forEach(function(node, index, arr){
						if (node.style.backgroundColor != "") {
							hasBackGroundColor = true;	
						}
					});	

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
	    	}
			
			if (false){
				var tempDiv = document.createElement('div');
				tempDiv.appendChild(slide);
				this.slideTransition(tempDiv,smil_type,smil_subtype,smil_direction);
			} else {
				this.slideContainer.innerHTML = "";
				this.slideContainer.appendChild(slide);
				this.slideContainer.firstChild.style.display = 'block';
				this.slideContainer.firstChild.style.margin = '0px';
				
			}
		}

//		var header = dojo.byId("header");
//		header.style.display = 'none';	
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
		
	slideShowConnectArray: [],
	
	configUserEvts: function() {
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

