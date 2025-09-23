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
dojo.provide("html.scenes.PresDocScene");

dojo.require("html.scenes.AbstractScene");
dojo.require("html.widgets.SlideSorter");
dojo.require("html.widgets.PagePicker");
dojo.require("html.widgets.Zoomer");
dojo.require("viewer.widgets.FloatBox");
dojo.require("viewer.util.BidiUtils");

dojo.declare("html.scenes.PresDocScene", 
			[html.scenes.AbstractScene], {

	currentPage: 1,
	slides: [],
	cssText:[],
	pageHeight:0,
	pageWidth:0,
	pageUnits:'',
	pageOrientation:'',
	FONTSIZE_BASELINE: 22.5,
	PPICONSTATNT: 96,
	INTOCMCONVERTOR: 2.54,
	PAGE_MARGIN:75,
	headerNodes:[],
	slideShowObj : null,
	mode: 'slideMode',//'normalMode'
	outofdate: false,
	fitwidth:true,
	DEFAULT_SCALE: 0.92,
	scales:['0.25','0.50','0.75','1.00','1.25','1.50'],
	
	constructor: function(){
		dojo.connect(document, 'onkeypress',this,this._onKeyPress);
	},
	
	getTitleImageName: function(){
		if(g_env!="smart_cloud")
			return "ibmdocs_presentations_32.png";
		else
			return "ibmdocs_presentation_24.png";
	},

	insertPrintButton: function(toolbar){
		var button = new dijit.form.Button({
			id: "T_Print",
			title: this.nls.labelPrint,
			iconClass: "printIcon",
			showLabel: false,
			label: this.nls.labelPrint,
			onClick: dojo.hitch(this, function(){
				this.print();
	    	})
		});
		button.attr('disabled', true);
		dojo.addClass(button.domNode,"lotusDijitButtonImg");
		toolbar.addChild(button);	
	},
	switchMode: function(mode)
	{
	},
	insertModeButton: function(toolbar){
		// play mode
		var button = new dijit.form.Button({
			id: "T_Mode_Play",
			title: this.nls.labelPlay,
			showLabel: false,
		    label: this.nls.labelPlay,
			iconClass: "normalPlayIcon",
			onClick: dojo.hitch(this,'slideShow')
		});
		button.attr('disabled', true);
		dojo.addClass(button.domNode,"lotusDijitButtonImg");
		toolbar.addChild(button);	
		this.insertSeprater(toolbar);
	},
	slideShow: function(){//_onButtonClick	
		g_slideShow = function(ssWindow,slides,headerNodes,isIE9) {
			var slideShow;
			this.slideShowObj=slideShow = new html.widgets.SlideShow(ssWindow,slides,headerNodes,isIE9);
			ssWindow.focus();
			slideShow.launchSlideShow();
		};
		closeSlideShow =  function() {
			this.slideShowObj.closeSlideShow();
		};
		windowsResize =  function() {
			this.slideShowObj.setDimensions();
		};
		var strssUrl = window.location.href + '?mode=slideshow';
		var ssWindow = window.open(strssUrl,
				'SlideShow', 'height='+screen.height+',width='+screen.width + ',left=0,top=0');
		ssWindow.focus();
		ssWindow.moveTo(0,0);
    },
	showHelp: function(){
		window.open(window.location.protocol+'//'+window.location.host + gPres_help_URL + this.helpTail);
	},
	loadData: function(){
		var baseURI=viewer.util.uri.getHTMLDocPageRoot();
		var url='';
		if(DOC_SCENE.snapshotId!='null')
		{
			url=baseURI+'content.html?sid='+DOC_SCENE.snapshotId;
			viewer.util.uri.injectCssStyle(window.document, baseURI+'office_styles.css?sid='+DOC_SCENE.snapshotId, false);
			viewer.util.uri.injectCssStyle(window.document, baseURI+'office_automatic_styles.css?sid='+DOC_SCENE.snapshotId, false);
		}else{
			url=baseURI+'content.html';
			viewer.util.uri.injectCssStyle(window.document, baseURI+'office_styles.css', false);
			viewer.util.uri.injectCssStyle(window.document, baseURI+'office_automatic_styles.css', false);
		}
		
	  	dojo.xhrGet
		(
			{
				url: url,
				handleAs: "text",
				handle: dojo.hitch(this, this._loadData),
				sync: false,
				preventCache: true
			}
		);

	},
	_loadData: function(response,ioArgs)
	{
		this._checkSnapshotStatus(response,ioArgs);
		var content=response;
		content=content.replace(/[\r\n]*/ig,'').replace("fontsizeinpts=", "pfs=").replace(/layoutClassSS/ig,"");
		//Stage 1, Get the css
		var styleRegexp=/<style.*?>(.*?)<\/style>/ig;
		styleRegexp.lastIndex=0;
		var index=0;
		var match=styleRegexp.exec(content);
		while(match!=null)
		{
			var styleText=match[0].replace(/<style.*?>/ig,'').replace(/<\/style>/ig,'');
			this.cssText[index]=viewer.util.uri.addSidToStyleImage(styleText);
			index++;
			match=styleRegexp.exec(content);
		}
		//Stage 2, Get the slides
		var slideReg=/<\s*div[^<]*\s*class\s*=\s*['"][^<]*slideWrapper[^<]*['"][^<]*>/ig;
		var match=slideReg.exec(content);
		var start=0;
		index=0;
		while (match != null) {
			start=match.index+match[0].length;
			match = slideReg.exec(content);
			if(match!=null)
			{
				var slide=content.substring( start, match.index-6);
				this.slides[index]=viewer.util.uri.addSidToContentImage(slide);
				index++;
			}
		}
		var lastSlide=content.substring( start, content.length-26);
		this.slides[index]=viewer.util.uri.addSidToContentImage(lastSlide);
		this.hideErrorMessage();
		this.bg.hide();
		dijit.byId('html_play_btn').setDisabled(false);
		dijit.byId('html_print_btn').setDisabled(false);
		if(dijit.byId('html_edit_btn'))
			dijit.byId('html_edit_btn').setDisabled(false);
		
		this.createThumbnailWidget();
		
		for(var i=0;i<this.cssText.length;i++)
		{
			viewer.util.uri.createStyleNode(null,this.cssText[i],document);
		}
		if(isIE9)
			viewer.util.uri.moveCSS2End(document,'concordslidesorter');
		else
			viewer.util.uri.moveCSS2End(document,'presview');
		this.numberOfRetry=15;
		this.createZoomer();
		this.showUnsupportInfo();
	},
	createZoomer:function(){
		var zoomer = new html.widgets.Zoomer({
			id: "T_Zoomer",
			manager: this
		});
		dojo.body().appendChild(zoomer.domNode);
		zoomer.position();
	},
	monitorSnapshotStatus: function(img){
		console.log("Missing image"+img.src);
		if(this.outofdate)
			return;
		var url=img.src;
		dojo.xhrGet
		(
			{
				url: url,
				handleAs: "text",
				handle: dojo.hitch(this, this._checkSnapshotStatus),
				sync: false,
				preventCache: true
			}
		);
	},
	_checkSnapshotStatus: function(response,ioArgs){
		if(response.status==507)
		{
		   this.outofdate=true;
		   this._showReloadWidget();
		}
	},
	_showReloadWidget: function(){
		   var link='<a href="javascript:void(0)" onclick="pe.scene.refreshPage()">'+this.nls.openLatestFile+'</a>';
		   var text=dojo.string.substitute(this.nls.updatePresentation,[link]);
		   this.showHtmlViewerInfoMessage(text);
	},
	refreshPage: function(){
		window.location.reload();
	},
	createThumbnailWidget: function(){
		var thumbnailPane = dijit.byId('thumbnailPane');
		this.thumbnailView = new html.widgets.SlideSorter({id: "thumbnailView",
			size: this.slides.length,
			slides: this.slides,
			tabIndex: 0,
			selectedIndex: -1,
			viewManager: this
			});
		dojo.addClass(thumbnailPane.domNode,'htmlthumbnail');
		thumbnailPane.setContent(this.thumbnailView.domNode);
		if (BidiUtils.isGuiRtl())
			dojo.attr(thumbnailPane,'dir','rtl');
		this.thumbnailView.createContent();
		this.thumbnailView.updatePage(1);
		dojo.publish(viewer.util.Events.PAGE_INFO_UPDATED, [this.slides.length]);
		dojo.publish(viewer.util.Events.PAGE_SELECTED, [1]);
	},
	_onKeyPress: function(e){
		if ((e.keyCode == dojo.keys.PAGE_UP||e.keyCode==dojo.keys.LEFT_ARROW||e.keyCode==dojo.keys.UP_ARROW) && e.keyChar != '!'){
			this.setCurrentPage(this.currentPage - 1);
			e.preventDefault();
		}
		else if ((e.keyCode == dojo.keys.PAGE_DOWN||e.keyCode==dojo.keys.RIGHT_ARROW||e.keyCode==dojo.keys.DOWN_ARROW) && e.keyChar != '"'){
			this.setCurrentPage(this.currentPage + 1);
			e.preventDefault();
		}
		else if(dojo.isIE && e.ctrlKey && (e.charOrCode == '+'||e.charOrCode == '-'))
		{
			this.updateUI();
		}
	},

	setCurrentPage: function(pageNum){
		if (!pageNum)
			pageNum = 1;
		if (this.currentPage != pageNum){
			if (pageNum >= 1 && pageNum <= this.slides.length){
				this.currentPage = pageNum;
				dojo.publish(viewer.util.Events.PAGE_SELECTED, [this.currentPage]);
			}
		}
	},
	setCurrentScale: function(newScale){
		if (this.scale != newScale){
			this.scale = newScale;
			console.log('scale is changed to ' + newScale);
			if(this.scale>1.1)
			{
				var normalContentView=dojo.byId("normalView");
		 		dojo.style(normalContentView,'height',this.scale*100+'%');
		 		dojo.style(normalContentView,'width',this.scale*100+'%');
		 		this.PAGE_MARGIN=5;
			}
			else
			{
				if(this.scale>0.9)
					this.PAGE_MARGIN=50;
				else
					this.PAGE_MARGIN=100;
				var normalContentView=dojo.byId("normalView");
		 		dojo.style(normalContentView,'height','100%');
		 		dojo.style(normalContentView,'width','100%');
			}
			this.setUIDimensions();
			dojo.publish(viewer.util.Events.SCALE_CHANGED, [newScale]);
		}
	},
     setSlideEditorLocation:function(){
    	var presEditor = dojo.byId("normalView");
    	var slide=presEditor.children[0];
    	var slideHeight  = parseFloat(slide.offsetHeight);
        var slideWidth  = parseFloat(slide.offsetWidth);
        var slideEditorHeight  = parseFloat(slide.parentNode.offsetHeight);
        var slideEditorWidth  = parseFloat(slide.parentNode.offsetWidth);
        var marginLeft=(slideEditorWidth-slideWidth)/2;
        var marginTop=(slideEditorHeight-slideHeight)/2;
        if(marginLeft<0 || marginTop<0)
        {
        	dojo.byId("normalView").style.overflow="";
        	slide.style.overflow="hidden";
        }
        else
        {
        	dojo.byId("normalView").style.overflow="hidden";
        	slide.style.overflow="";
        }
        if(marginTop<0)
        	marginTop=0;
        if(marginLeft<0)
        	marginLeft=0;
        	
        slide.style.marginTop = marginTop+'px';
        slide.style.marginBottom = marginTop+'px';
        slide.style.marginLeft = marginLeft + 'px';
        slide.style.marginRight =  marginLeft + 'px';
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

 	createContentWidget: function(){
 		var contentContainer = dijit.byId("contentPane");
 		var normalContentView=dojo.create('div');
 		dojo.attr(normalContentView,'id','normalView');
 		dojo.attr(normalContentView,'tabindex','0');
 		dojo.style(normalContentView,'display','block');
 		dojo.style(normalContentView,'height','100%');
 		dojo.style(normalContentView,'width','100%');
 		dojo.style(normalContentView,'overflow','hidden');
 		contentContainer.setContent(normalContentView);
 		return normalContentView;
 	},
	insertPageButton: function(toolbar){
		var pagePicker = new html.widgets.PagePicker({
			id: "T_ModePagePicker",
			pageNum: this.slides.length,
			viewManager: this
		});
	   
		dojo.style(pagePicker.domNode, 'display', 'inline-block');
		dojo.style(pagePicker.domNode, 'vertical-align', 'middle');
		toolbar.addChild(pagePicker);
	},
	print: function()
	{
		var container=dojo.byId('print');
		var pageCount=this.slides.length;
		for(var i=0;i<pageCount;i++)
		{
			var pageWrapper=dojo.create('div');
			dojo.style(pageWrapper,'height','480px');
			dojo.style(pageWrapper,'width','640px');
			dojo.addClass(pageWrapper,'concord presHtmlPrintSlide');
			//pageWrapper.appendChild(dojo.clone(this.slides[i]));
			pageWrapper.innerHTML=this.slides[i];
			container.appendChild(pageWrapper);
			//
			var ppageHeight,ppageWidth,ppageUnits,ppageOrientation;
			
	    	var slide=pageWrapper.children[0];
	    	dojo.removeClass(slide,'slideSelected');
	        var slideEditorHeight = 480;
	        var slideEditorWidth  = 640;
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
					ppageHeight = pageHeight;
					ppageWidth = pageWidth;
				}
				if (pageUnits != null) 
					ppageUnits = pageUnits;
				if (pageOrientation != null) 
					ppageOrientation = pageOrientation;
				
			}
	    	if (ppageHeight >= ppageWidth)
	    	{
	        	pageSizeRatio = ppageWidth/ppageHeight;
	        	slideHeight = slideEditorHeight; 
	        	slideWidth = slideHeight * pageSizeRatio;
	            leftRightMargin = (slideEditorWidth - slideWidth) / 2;
	            slide.style.marginTop = '0px';
	            slide.style.marginBottom = '0px';
	            slide.style.marginLeft = leftRightMargin + '0px';
	            slide.style.marginRight =  leftRightMargin + '0px';
	            
	            if (slideWidth > slideEditorWidth) 
	            {
	            	pageSizeRatio = ppageHeight/ppageWidth;

	            	slideWidth = slideEditorWidth;
	            	slideHeight = slideWidth * pageSizeRatio;
	            	
	                topbottomMargin = (slideEditorHeight - slideHeight) / 2;
	                slide.style.marginTop = topbottomMargin + 'px';
	                slide.style.marginBottom = topbottomMargin + 'px';
	                slide.style.marginLeft = '0px';
	                slide.style.marginRight = '0px';
	                leftRightMargin = '0px';
	            }
	    	}
	    	else
	    	{
	        	pageSizeRatio = ppageHeight/ppageWidth;
	        	slideWidth = slideEditorWidth;
	        	slideHeight = slideWidth * pageSizeRatio;
	        	
	            topbottomMargin = (slideEditorHeight - slideHeight) / 2;
				slide.style.marginTop = topbottomMargin  + 'px';
	            slide.style.marginBottom = topbottomMargin + 'px';
	            slide.style.marginLeft =  '0px';
	            slide.style.marginRight = '0px';
	            leftRightMargin = 0;
	            // Check to see if width is larger then the current editor window
	            if (slideHeight > slideEditorHeight) 
	            {
	            	pageSizeRatio = ppageWidth/ppageHeight;
	            	
	            	slideHeight = slideEditorHeight;
	            	slideWidth = slideHeight * pageSizeRatio;
	            	
	                leftRightMargin = (slideEditorWidth - slideWidth) / 2;
	                slide.style.marginTop = '0px';
	                slide.style.marginBottom = '0px';
	                slide.style.marginLeft = leftRightMargin + 'px';
	                slide.style.marginRight =  leftRightMargin + 'px';
	                topbottomMargin = 0;
	            }
	    	}
	    	
	        slide.style.height = slideHeight-2 + 'px';
	        slide.style.width = slideWidth -2  + 'px';
	        
	        var fontSize = this.getBasedFontSize(slideHeight,ppageHeight);       
	        slide.style.fontSize = fontSize + 'px';
	        
			if(i!=(pageCount-1))
			{
				var pageBreaker=dojo.create('p');
				pageBreaker.innerHTML='<br clear="all" style="page-break-before: always;">';
				container.appendChild(pageBreaker);
			}
		}
		window.print();
		dojo.empty(container);
	},
	
	postionButton:function(toolbar)
	{
		var buttons = toolbar.getChildren();
		var pagePicker = dijit.byId("T_ModePagePicker");
		pagePicker.pageInput._refreshState();
		var right=4;
		if(dojo.isWebKit||dojo.isChrome)
			right=8;
		for(var i=buttons.length-1;i>0;i--){
			if(buttons[i].id=="T_ModePagePicker")
			{
				var preNode=buttons[i-1].domNode;
				var left=dojo.marginBox(preNode).l+dojo.marginBox(preNode).w;
				var calcWidth=dojo.marginBox(toolbar.domNode).w-right-left;
				if(calcWidth>130)
					dojo.style(pagePicker.domNode,"width",calcWidth+"px");
				else
					dojo.style(pagePicker.domNode,"width","130px");
				break;
			}
			else
			{
				right+=dojo.marginBox(buttons[i].domNode).w;
			}
		}
	},
	showUnsupportInfo: function(){
		var baseURI=viewer.util.uri.getHTMLDocPageRoot();
		var url='';
		if(DOC_SCENE.snapshotId!='null')
		{
			url=baseURI+'result.json?sid='+DOC_SCENE.snapshotId;
		}else{
			url=baseURI+'result.json';
		}
		var xhrArgs = {
				url: url,
				handleAs: "json",
				preventCache: true,
				load: function(data) {
					var unsupportList = data.errCodes;
					if ((unsupportList) && (unsupportList instanceof Array) && (unsupportList.length > 0))
					{
						var unsupported=[];
						for(var i=0;i<unsupportList.length;i++)
						{
							for(var j=0;j< viewerConfig.pres["unsupported-feature"].length;j++)
							{
								if(unsupportList[i].description == viewerConfig.pres["unsupported-feature"][j])
									unsupported.push(unsupportList[i].description);
							}
						}
						pe.scene.showUnsupportedTextMessage(unsupported,10000);
					}
				},
				error: function(error) {
					console.log('Error returned while loading result.json :' + error);
				}
			};
			dojo.xhrGet(xhrArgs);
	},
	showUnsupportedTextMessage: function(array, interval){
		if(array.indexOf("Animation") != -1)
			this._showMessage(this.nls.htmlviewerlimitation, interval, 3);
	},
	zoomIn: function(){
		this.fitwidth=false;
		for(var i=0;i<=this.scales.length;i++){
			if(this.scales[i]>this.scale&& Math.abs(this.scale-this.scales[i])>0.075){
				this.scale=this.scales[i];
				break;
			}
		}
		pe.scene.setUIDimensions();
		if(this.scale>=1.5){
			dijit.byId("html_zoomIn_btn").setDisabled(true);
		}else{
			dijit.byId("html_zoomOut_btn").setDisabled(false);
		}
	},
	zoomOut: function(){
		this.fitwidth=false;
		for(var i=this.scales.length;i>=0;i--){
			if(this.scales[i]<this.scale && Math.abs(this.scale-this.scales[i])>0.125){
				this.scale=this.scales[i];
				break;
			}
		}
		pe.scene.setUIDimensions();
		if(this.scale<=0.25){
			dijit.byId("html_zoomOut_btn").setDisabled(true);
		}else{
			dijit.byId("html_zoomIn_btn").setDisabled(false);
		}
	},
	fitWidth: function(){
		this.fitwidth=true;
		this.scale=0.92;
		pe.scene.setUIDimensions();
		dijit.byId("html_zoomOut_btn").setDisabled(false);
		dijit.byId("html_zoomIn_btn").setDisabled(false);
	},
	setUIDimensions: function(){
    	var presEditor = dojo.byId("normalView");
    	var slide=presEditor.children[0];
    	var slideEditorHeight = this.slideEditorHeight = parseFloat(dojo.byId("contentPane").offsetHeight);
        var slideEditorWidth = this.slideEditorWidth = parseFloat(dojo.byId("contentPane").offsetWidth);
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

			if(this.fitwidth)
				this.scale=this.DEFAULT_SCALE;
			
			pageSizeRatio = this.pageWidth/this.pageHeight;
			if(slideEditorWidth/slideEditorHeight>=pageSizeRatio)
			{
				slideHeight=slideEditorHeight*this.scale;
				slideWidth=slideHeight*pageSizeRatio;
			}else{
				slideWidth=slideEditorWidth*this.scale;
				slideHeight=slideWidth/pageSizeRatio;
			}
			topbottomMargin=(slideEditorHeight-slideHeight)/2;
			leftRightMargin=(slideEditorWidth-slideWidth)/2;
			if(leftRightMargin<0||topbottomMargin<0){
				dojo.byId("normalView").style.overflow="";
				slide.style.overflow="hidden";
			}else{
				dojo.byId("normalView").style.overflow="hidden";
				slide.style.overflow="";
			}
			if(topbottomMargin<0)
				topbottomMargin=0;
			if(leftRightMargin<0)
				leftRightMargin=0;
			
			slide.style.marginTop = topbottomMargin+'px';
            slide.style.marginBottom = topbottomMargin+'px';
            slide.style.marginLeft = leftRightMargin + 'px';
            slide.style.marginRight =  leftRightMargin + 'px';
            slide.style.height = slideHeight-2 + 'px';
            slide.style.width = slideWidth -2  + 'px';
            var fontSize = this.getBasedFontSize(slideHeight,this.pageHeight);       
            slide.style.fontSize = fontSize + 'px';
            if(this.thumbnailView)
            	this.thumbnailView.calculateCurrentPage();
		}
     },
     getScale:function(){
     	var presEditor = dojo.byId("normalView");
      	var slide=presEditor.children[0];
      	var slideHeight  = parseFloat(slide.offsetHeight);
         var slideWidth  = parseFloat(slide.offsetWidth);
         var slideEditorHeight  = parseFloat(slide.parentNode.offsetHeight);
         var slideEditorWidth  = parseFloat(slide.parentNode.offsetWidth);
				
         if(slideEditorWidth/slideEditorHeight>this.pageWidth/this.pageHeight)
         	this.scale=slideHeight/slideEditorHeight;
         else
         	this.scale=slideWidth/slideEditorWidth;
         
         if(this.scale>0.25 && Math.abs(this.scale-0.25)>0.125){
        	 dijit.byId("html_zoomOut_btn").setDisabled(false);
         }
         if(this.scale<1.5 && Math.abs(this.scale-1.5)>0.125){
        	 dijit.byId("html_zoomIn_btn").setDisabled(false);
         }
      }
});