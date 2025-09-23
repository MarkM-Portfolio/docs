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
dojo.provide("viewer.scenes.PdfJsDocScene");

dojo.require("viewer.scenes.PdfDocScene");
dojo.require("viewer.widgets.NavigatorBarManager");
if ((!dojo.isIE || dojo.isIE>=9) && (typeof DOC_SCENE !== 'undefined') && DOC_SCENE.isPDFJsViewMode && (DOC_SCENE.isPDFJsViewMode == "true")){
dojo["require"]("pdfjs.web.compatibility");
dojo["require"]("pdfjs.pdf");
dojo["require"]("viewer.pdfJs.pdfJsViewer");
}

dojo.declare("viewer.scenes.PdfJsDocScene",
			[viewer.scenes.PdfDocScene], {

	pdfJsViewer: null,

	constructor: function(){
		this.pdfJsViewer = new viewer.pdfJs.pdfJsViewer(this, this.DEFAULT_STYLE);
		dojo.connect(document, "onkeydown", this, this._onKeyDown);
		dojo.connect(document, "oncontextmenu", this, function(e) {
			e.preventDefault();
			e.stopPropagation();
		});
		if (DOC_SCENE.isPDFCopyDisabled) {
			dojo.connect(document, "oncopy", this, function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}
	},	
	
	_onKeyPress: function(e){
		if (e.keyCode == dojo.keys.HOME && e.keyChar != '!'){
			this.setCurrentPage(1);
		}
		else if (e.keyCode == dojo.keys.END && e.keyChar != '"'){
			this.setCurrentPage(this.doc.getPages());
		}else
			this.inherited(arguments);
	},
	
	_onKeyDown: function(e) {
	   if (((dojo.isMac && e.metaKey) || e.ctrlKey) && (e.keyCode == 67 || e.keyCode == 88) && DOC_SCENE.isPDFCopyDisabled) {
		   e.preventDefault();
		   e.stopPropagation();
       }
	},

	show:function(){
		var cb = dojo.hitch(this,"postDocLoad");
		this.pdfJsViewer.openFile(cb);
	},
	
	_showFile: function() {
		this.render(this.defaultMode);  // by default, normal view should be created
		this.preparePrintArea();
		this.stage();
		dojo.query("body").removeClass("loadingBeforeJsLoad");
	},
	
	switchMode: function(mode, style){
		this.currentMode = mode;
		var toolbarPane = dijit.byId('toolbarPane');
		if (toolbarPane) {
			for (var i in this.supportedMode){
				if (this.supportedMode[i] == mode)
					dijit.byId('T_Mode_'+this.supportedMode[i]).attr('checked', true);
				else
					dijit.byId('T_Mode_'+this.supportedMode[i]).attr('checked', false);
			}
		}

		var bShown = false;
		for (var i in this.views){
			if (i != mode)
				dojo.style(this.views[i].domNode, 'display', 'none');
			else{
				dojo.style(this.views[i].domNode, 'display', 'block');
				bShown = true;
			}
		}

		if (!bShown){
			var widget = null;
			if(this.compactMode){
				widget = this.createContentWidget('Continuous');
			}
			else {
				widget = this.createContentWidget(mode);
			}
			if (widget)
				this.views[mode] = widget;
		}else{
			if (style)
				this.setCurrentStyle(style);
		}
//		if (!this.thumbnailView)
//			this.createThumbnailWidget();
	},
	
	postDocLoad: function(pagesCount){
		this.doc.pages = pagesCount;
		this._showFile();
	},
	
	_postCreateContentWidget: function(){
		var actions = this.createActions();
		var pageIndicator = this.createPageIndicator();
		var manager=new viewer.widgets.NavigatorBarManager(actions,pageIndicator);
		manager.registerEvents();
		if (this.doc.getPages()!=0){
			if (this.currentPage == 0){
				this.setCurrentPage(1);
			}else{
				dojo.publish(viewer.util.Events.PAGE_SELECTED, [this.currentPage]);
			}
		}
	},
	
	createPageIndicator: function() {
		var indicator = new viewer.widgets.PageIndicator({
			id: "T_PageIndicator",
			pageNum: this.doc.getPages(),
			viewManager: this
		});
		dojo.body().appendChild(indicator.domNode);
		
		//indicator position
		var box = dojo.byId('continuousView');
		var div = box.childNodes[1];
		var l = dojo.marginBox(box).w;
		var w = div.clientWidth;
		var left = div.offsetLeft + w/2 - indicator.domNode.clientWidth/2;
		if (l - left - 20 < indicator.domNode.clientWidth) { // this is for sheet compact mode
			left = l - indicator.domNode.clientWidth - 60;
		}
		indicator.domNode.style.left = left + 'px';
		var header = dijit.byId('headerPane');
		if (header && header._contentBox.h > 0) {
			indicator.domNode.style.top = header._contentBox.t + header._contentBox.h + indicator.domNode.offsetTop + 'px';  
		}
		return indicator;
	},
	
	
	createContinuousWidget: function(){
		var cb = dojo.hitch(this,"_postCreateContentWidget");
		this.pdfJsViewer.showFile(cb);
	},
	
	createThumbnailWidget: function(){
		// do nothing, pdfjs view don't need thumbnail view
	},

	createHeaderImg : function() 
	{
		var div = document.createElement("div");
		div.setAttribute("alt", "");
		div.setAttribute("class", "commonsprites commonsprites-doc16 lotusIcon");
		
		return div;
	},
	
	getClientAreaPos: function() 
	{
		var box = dojo.byId('continuousView');
		var div = box.childNodes[1];
		var w = div.clientWidth;
		return {x:div.offsetLeft + w/2, y:0};
	}
});