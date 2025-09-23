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
dojo.provide("viewer.widgets.SlideShow");
dojo.require("viewer.util.BidiUtils");
dojo.requireLocalization("viewer.widgets","SlideShow");
dojo.declare("viewer.widgets.SlideShow",null, {

	slideShowWindow: null,
	slideShowDoc: null,
	data:null,
	index:0,
	pageHeight: "21",
	pageWidth:"28",
	errorMessageDiv:null,
	container:null,
	imageId:"normalContentImg",
	
	constructor: function(ssWindow){
		this.slideShowWindow = ssWindow;
		this.slideShowDoc = ssWindow.document;
		this.presDocURLLocation = ssWindow.top.opener.location;
		this.STRINGS = dojo.i18n.getLocalization("viewer.widgets","SlideShow");
		this.errorMessageDiv = null;
		this.data=ssWindow.top.opener.pe.scene.doc.getPagesInfo();
		this.container=dojo.byId("slideShowContainer");
			
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
		var image=dojo.byId(this.imageId);
		var src=this.getImageURIByIndex(this.index);
		image.setAttribute("src",src);	
		image.setAttribute("alt",this.STRINGS.slidealt+" "+1);
		this.setDimensions(this.index);
		this.showFullScreenMessage();
	},
	windowresize:function()
	{
		this.setDimensions(this.index);
	},

	closeSlideShow:function()
	{
		this.slideShowWindow.top.close();
	},
	getImageURIByIndex: function(i)
	{
		var pageroot=this.slideShowWindow.top.opener.pe.scene.getPageRoot();
		var imagepath=this.data[i].getFullImageInfo().getFilepath();
		var uri= pageroot+"/"+imagepath;
		if(this.slideShowWindow.top.opener.DOC_SCENE.compactMode){
			uri+="?mode=compact";
		}
		return uri;
	},
	
	showPre: function()
	{
		var image;
		if(this.index == this.data.length)
		{
			this.container.innerHTML='';
			image=dojo.create("img",{
				src: '/images/viewer/blank.gif',
				width:"100%",
				height:"100%",
				"id":this.imageId
			}, this.container);
		}
		else
		{
			image=dojo.byId(this.imageId);
		}
		this.index=this.index>0?this.index-1:0;
		var src=this.getImageURIByIndex(this.index);
		image.setAttribute("src",src);	
		image.setAttribute("alt",this.STRINGS.slidealt+" "+(this.index+1));	
		this.setDimensions(this.index);
	},
	showNext: function()
	{
		if (this.index >= this.data.length-1) {
			this.showEndOfShowMessage();
			this.index=this.data.length;
			return;
		}
		var image=dojo.byId(this.imageId);
		this.index=this.index<this.data.length-1?this.index+1:this.data.length-1;
		var src=this.getImageURIByIndex(this.index);
		image.setAttribute("src",src);	
		image.setAttribute("alt",this.STRINGS.slidealt+" "+(this.index+1));	
		this.setDimensions(this.index);
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
	
	setDimensions: function(index){
		var id=index;
		id=(id==this.data.length?id-1:id);
		var browserHeight = this.getBrowserHeight(this.slideShowWindow);
		var browserWidth = this.getBrowserWidth(this.slideShowWindow);
		var imageWidth=this.data[id].getFullImageInfo().width;
		var imageHeight=this.data[id].getFullImageInfo().height;
		var slideHeight,slideWidth;
		if (imageHeight/browserHeight>imageWidth/browserWidth)
		{        	
	    	slideHeight = browserHeight;  
	    	slideWidth = slideHeight*imageWidth/imageHeight; 
		}    	
		else
		{        	
	    	slideWidth = browserWidth;
	    	slideHeight = slideWidth*imageHeight/imageWidth;            
		}
		
		var windowBodymargin = (browserWidth - slideWidth)/2;
		this.slideShowDoc.body.style.marginLeft = windowBodymargin + 'px';
		var fontSize = this.getFontSize(slideHeight);		        		        
		this.container.style.height = slideHeight + 'px';
		this.container.style.width = slideWidth + 'px';
		this.container.style.fontSize = fontSize + 'px';
		
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
		var floatDir = "left";
		if (BidiUtils.isGuiRtl())
			floatDir = "right";
		firstChild.style.cssText = 'float: ' + floatDir + ' ;margin-top: 5px;';
		var secondChild = dojo.create("span", null, this.errorMessageDiv);
		secondChild.innerHTML = text;
		secondChild.style.cssText = 'float: left; margin-top: 12px;'
		var browserWidth = this.getBrowserWidth(this.slideShowWindow);
		var messageWidth = dojox.html.metrics.getTextBox(text, null, className).w;
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
	},
	getFontSize: function(height)
	{
		var fontSize = (height * 24)/((this.pageHeight*96)/2.54);
		return fontSize;	
	}
});

