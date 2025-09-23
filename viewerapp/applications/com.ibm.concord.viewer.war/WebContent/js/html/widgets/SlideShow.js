/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("html.widgets.SlideShow");

dojo.requireLocalization("viewer.widgets","SlideShow");
dojo.declare("html.widgets.SlideShow",null, {

	slideShowWindow: null,
	slideShowDoc: null,
	slides:null,
	cssText:null,
	index:0,
	errorMessageDiv:null,
	container:null,
	imageId:"normalContentImg",
	PAGE_MARGIN:0,
	pageHeight:0,
	pageWidth:0,
	pageUnits:'',
	pageOrientation:'',
	FONTSIZE_BASELINE: 22.5,
	PPICONSTATNT: 96,
	INTOCMCONVERTOR: 2.54,
	isIE9:false,
	
	constructor: function(ssWindow,slides,cssText,isIE9){
		this.slideShowWindow = ssWindow;
		this.slideShowDoc = ssWindow.document;
		this.presDocURLLocation = ssWindow.top.opener.location;
		this.STRINGS = dojo.i18n.getLocalization("viewer.widgets","SlideShow");
		this.errorMessageDiv = null;
		this.slides=slides;
		this.cssText=cssText;
		this.container=this.slideShowWindow.document.getElementById('slideShowContainer');
		this.isIE9=isIE9;
			
		dojo.connect(this.slideShowWindow, 'onresize',dojo.hitch(this, this.windowresize));
		dojo.connect(this.slideShowDoc, 'onclick',dojo.hitch(this, this.slideShowClick));
		dojo.connect(this.slideShowDoc, 'onkeydown',dojo.hitch(this, this.keyDown));
		
		if (!dojo.isMozilla){
			dojo.connect(this.slideShowDoc, 'onmousewheel',dojo.hitch(this, this.wheelScroll));
		} else {
			dojo.connect(this.slideShowWindow, 'DOMMouseScroll',dojo.hitch(this, this.wheelScroll));
		}
	},

	launchSlideShow: function()
	{
		this.container.innerHTML=this.slides[0];
		var baseURI=viewer.util.uri.getHTMLDocPageRoot();
		viewer.util.uri.injectCssStyle(this.slideShowDoc, baseURI+'office_styles.css?sid='+DOC_SCENE.snapshotId, false);
		viewer.util.uri.injectCssStyle(this.slideShowDoc, baseURI+'office_automatic_styles.css?sid='+DOC_SCENE.snapshotId, false);
		for(var i=0;i<this.cssText.length;i++)
		{
			viewer.util.uri.createStyleNode(null,this.cssText[i],this.slideShowDoc);
		}
		if(this.isIE9)
			viewer.util.uri.moveCSS2End(document,'concordslidesorter');
		else
			viewer.util.uri.moveCSS2End(document,'slideshow');
		this.setDimensions();
		this.showFullScreenMessage();
	},
	windowresize:function()
	{
		this.setDimensions();
	},

	closeSlideShow:function()
	{
		this.slideShowWindow.close();
	},
	
	showPre: function()
	{
		this.index=this.index>0?this.index-1:0;
		for(var i=0;i<this.container.children.length;i++)
		{
			this.container.removeChild(this.container.children[i]);
		}
		this.container.innerHTML=this.slides[this.index];
		this.setDimensions();
	},
	showNext: function()
	{
		for(var i=0;i<this.container.children.length;i++)
		{
			this.container.removeChild(this.container.children[i]);
		}
		if(this.slides[this.index+1] == undefined){
			this.showEndOfShowMessage();
			return;
		}
		else{
			this.index=this.index+1;
			this.container.innerHTML=this.slides[this.index];
		}
		this.setDimensions();
	},
	
	keyDown: function(ev)
	{
		if(ev.keyCode == dojo.keys.ENTER || ev.keyCode == dojo.keys.RIGHT_ARROW || ev.keyCode == dojo.keys.PAGE_DOWN || ev.keyCode == dojo.keys.DOWN_ARROW || ev.keyCode == dojo.keys.SPACE){
			this.showNext();
			ev.stopPropagation();
		}
		else if (ev.keyCode == dojo.keys.LEFT_ARROW || ev.keyCode == dojo.keys.UP_ARROW || ev.keyCode == dojo.keys.BACKSPACE || ev.keyCode == dojo.keys.PAGE_UP){
			this.showPre();
			ev.stopPropagation();
		}
		else if (ev.keyCode == dojo.keys.ESCAPE){
			this.closeSlideShow();
			ev.stopPropagation();
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
			this.showNext();
		} else{
			this.showPre();
		}
		if (ev.preventDefault) // prevents event from firing twice in FF
	        ev.preventDefault();
	},
	
	slideShowClick: function(ev)
	{
		this.showNext();
		ev.stopPropagation();
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
	
	setDimensions: function(){
		var browserWidth = this.getBrowserWidth(this.slideShowWindow);
		var browserHeight = this.getBrowserHeight(this.slideShowWindow);
		
    	var presEditor = this.container;
    	dojo.style(presEditor,'height',browserHeight+'px');
    	dojo.style(presEditor,'width',browserWidth+'px');
    	
    	var slide=presEditor.children[0];
        var slideEditorHeight = this.slideEditorHeight = parseFloat(slide.parentNode.offsetHeight);
        var slideEditorWidth = this.slideEditorWidth = parseFloat(slide.parentNode.offsetWidth);
        var slideHeight, slideWidth, leftRightMargin, topbottomMargin;
        var pageSizeRatio;
        if(slide != null) 
		{
        	var pageHeight = dojo.attr(slide, 'pageheight');
			var pageWidth = dojo.attr(slide, 'pagewidth');
			var pageUnits = dojo.attr(slide, 'pageunits');
			var pageOrientation = dojo.attr(slide, 'orientation');
			if (pageHeight != null && pageHeight != "null" && pageWidth != null && pageWidth != "null") 
			{
				this.pageHeight = pageHeight;
				this.pageWidth = pageWidth;
			}
			if (pageUnits != null) 
				this.pageUnits = pageUnits;
			if (pageOrientation != null) 
				this.pageOrientation = pageOrientation;
			
		}
    	if (this.pageHeight >= this.pageWidth)
    	{
        	pageSizeRatio = this.pageWidth/this.pageHeight;
        	slideHeight = slideEditorHeight - this.PAGE_MARGIN*2; 
        	slideWidth = slideHeight * pageSizeRatio;
            leftRightMargin = (slideEditorWidth - slideWidth) / 2;
            slide.style.marginTop = this.PAGE_MARGIN+'px';
            slide.style.marginBottom = this.PAGE_MARGIN+'px';
            slide.style.marginLeft = leftRightMargin + 'px';
            slide.style.marginRight =  leftRightMargin + 'px';
            
            if (slideWidth > slideEditorWidth) 
            {
            	pageSizeRatio = this.pageHeight/this.pageWidth;

            	slideWidth = slideEditorWidth - this.PAGE_MARGIN*2;
            	slideHeight = slideWidth * pageSizeRatio;
            	
                topbottomMargin = (slideEditorHeight - slideHeight) / 2;
                slide.style.marginTop = topbottomMargin + 'px';
                slide.style.marginBottom = topbottomMargin + 'px';
                slide.style.marginLeft = this.PAGE_MARGIN+'px';
                slide.style.marginRight =  this.PAGE_MARGIN+'px';
                leftRightMargin = this.PAGE_MARGIN+'px';
            }
    	}
    	else
    	{
        	pageSizeRatio = this.pageHeight/this.pageWidth;
        	slideWidth = slideEditorWidth - this.PAGE_MARGIN*2;
        	slideHeight = slideWidth * pageSizeRatio;
        	
            topbottomMargin = (slideEditorHeight - slideHeight) / 2;
			slide.style.marginTop = topbottomMargin  + 'px';
            slide.style.marginBottom = topbottomMargin + 'px';
            slide.style.marginLeft =  this.PAGE_MARGIN+'px';
            slide.style.marginRight = this.PAGE_MARGIN+'px';
            leftRightMargin = this.PAGE_MARGIN;
            // Check to see if width is larger then the current editor window
            if (slideHeight > (slideEditorHeight  - this.PAGE_MARGIN*2)) 
            {
            	pageSizeRatio = this.pageWidth/this.pageHeight;
            	
            	slideHeight = slideEditorHeight - this.PAGE_MARGIN*2;
            	slideWidth = slideHeight * pageSizeRatio;
            	
                leftRightMargin = (slideEditorWidth - slideWidth) / 2;
                slide.style.marginTop = this.PAGE_MARGIN+'px';
                slide.style.marginBottom = this.PAGE_MARGIN+'px';
                slide.style.marginLeft = leftRightMargin + 'px';
                slide.style.marginRight =  leftRightMargin + 'px';
                topbottomMargin = this.PAGE_MARGIN;
            }
    	}
    	
        slide.style.height = slideHeight-2 + 'px';
        slide.style.width = slideWidth -2  + 'px';
        
        var fontSize = this.getBasedFontSize(slideHeight,this.pageHeight);       
        slide.style.fontSize = fontSize + 'px';
     },
     
     getBasedFontSize: function(slideHeight,pageHeight){
         var fontSize = (slideHeight * this.FONTSIZE_BASELINE)/
     	((pageHeight*this.PPICONSTATNT)/this.INTOCMCONVERTOR);
         fontSize = dojo.number.round(fontSize,2);
         if(dojo.isIE)
         {
             fontSize = Math.floor(fontSize + .5);
         }
         return fontSize;        
     },
	showFullScreenMessage: function()
	{
		var interval = 3000;
		var text = this.STRINGS.fullScreen;
		var className = "lotusMessage lotusInformation";
		var bodyNode = dojo.query('body', this.slideShowDoc);
		bodyNode = bodyNode[0];	
		this.errorMessageDiv = dojo.create("div", {id: "lotus_error_message"}, bodyNode);
		this.errorMessageDiv.className = className;
		var firstChild = dojo.create("img", null, this.errorMessageDiv);
		firstChild.setAttribute( 'src', staticResPath + '/images/information.png');
		firstChild.style.cssText = 'float: left;margin-top: 5px;';
		var secondChild = dojo.create("span", null, this.errorMessageDiv);
		secondChild.innerHTML = text;
		secondChild.style.cssText = 'float: left; margin-top: 12px;'
		var browserWidth = this.getBrowserWidth(this.slideShowWindow);
		//var messageWidth = dojox.html.metrics.getTextBox(text, null, className).w;
		
		messageWidth=dojo.marginBox(this.errorMessageDiv).w
		var left = ( browserWidth - messageWidth ) / 2;
		this.errorMessageDiv.style.cssText = 'left:' + left + 'px;margin-top: 10px;top:0px;display:inline-block;position:absolute;z-index:200;font-family:arial,sans-serif;';
		if( interval ) {
			setTimeout( dojo.hitch(this, this.hideErrorMessage), interval );
		}
	},
	hideErrorMessage: function() {
		if (this.errorMessageDiv) {
			this.errorMessageDiv.style.display = 'none';
			dojo.destroy(this.errorMessageDiv);
			this.errorMessageDiv = null;
		}
	},
	showEndOfShowMessage: function() {
		this.container.innerHTML= '<div id="slide_EndOfShow" style="height: 100%; width: 100%; background-color:#FFFFFF; text-align: center; color:#000000; font-weight: bold; font-family: arial,sans-serif;" ><br/>'+this.STRINGS.endofShow+'</div>';
	}
});

