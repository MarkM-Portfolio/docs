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
dojo.provide("viewer.widgets.PresActions");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("viewer.widgets.LotusTextButton");
dojo.require("concord.util.BidiUtils");

dojo.declare(
	"viewer.widgets.PresActions",
	[dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("viewer.widgets", "templates/PresActions.html"),
		widgetsInTemplate: true,
		percentage: 0,
		manager: null,
		isZoomed: false,
		leftPos: 0,
		
		hide: function(){
			var fadeArgs = {
			        node: this.domNode,
			        duration: 1000,
			      };
			dojo.fadeOut(fadeArgs).play();
		},
		
		show: function(){
			var fadeArgs = {
			        node: this.domNode,
			        duration: 1000,
			      };
			dojo.fadeIn(fadeArgs).play();	
		},
		
		isMouseOnActions: function(e){
			  var checkLeft = e.clientX > this.leftPos;
			  var checkRight = e.clientX < this.leftPos+308;
			  var checkBottom = e.clientY < window.innerHeight - 30;
			  var checkTop =e.clientY> window.innerHeight-30-47;
			  return checkLeft && checkRight && checkBottom && checkTop;
		},
		
		postMixInProperties: function()
		{
			var _nlsResources = dojo.i18n.getLocalization("viewer.scenes", "Scene");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		postCreate: function()
		{	
			this.inherited(arguments);
		},
		position: function(){
			var wwidth = dojo.marginBox(this.domNode).w;
			var editor = pe.scene.editor;
			if (pe.scene.isViewCompactMode()||!editor) {
				var cwidth = dojo.style(document.body, 'width');
				this.leftPos = (cwidth-wwidth)/2;
			} else {
				this.leftPos = editor.l + (editor.w-wwidth)/2;
			}
			this.domNode.style.left= this.leftPos + 'px';
			if (BidiUtils.isGuiRtl())
				this.domNode.dir = "rtl";
			this._onWindowResized();
		},
		
		_onZoomInSelect: function()
		{
			this.isZoomed=true;
			if (pe.scene.isViewCompactMode()) {
				var sorter = pe.scene.slideSorter;
				sorter.viewCompactScaleRate = sorter.viewCompactScaleRate * 1.1;
				sorter.fitInWindow();
			} else {
				var oldscale = pe.scene.slideEditor.getZoomScale();
				this.manager.zoom(Math.round(oldscale * 1.1));
			}
		},

		_onZoomOutSelect: function()
		{
			this.isZoomed=true;
			if (pe.scene.isViewCompactMode()) {
				var sorter = pe.scene.slideSorter;
				sorter.viewCompactScaleRate = sorter.viewCompactScaleRate * 0.9;
				sorter.fitInWindow();
			} else {
				var oldscale = pe.scene.slideEditor.getZoomScale();
				this.manager.zoom(Math.round(oldscale * 0.9));
			}
		},
		
		_onWindowResized: function(){
			if(this.isZoomed){
				return;
			}
			this._onFitWidthSelect();
		},
		
		_onFitWidthSelect: function()
		{
			this.isZoomed=false;
			if (pe.scene.isViewCompactMode()) {
				var sorter = pe.scene.slideSorter;
				sorter.viewCompactScaleRate = 1;
				sorter.fitInWindow();
			} else {
				this.manager.zoomFit();
			}
		},
		
		_onPageUp: function(){
			this.getFocus();	
			pe.scene.slideSorter.focusPrev();
			pe.scene.slideSorter.getCurrentThumb().domNode.scrollIntoView();
			this.pageUp.focus();
		},
		
		_onPageDown: function(){
			this.getFocus();			
			pe.scene.slideSorter.focusNext();
			pe.scene.slideSorter.getCurrentThumb().domNode.scrollIntoView();
			this.pageDown.focus();
		},
		
		_onSlideShow: function(){
			pe.scene.launchSlideShow(true);
		},
		
		getFocus: function()
		{
			var currentThumb = pe.scene.slideSorter.getCurrentThumb();
			pe.scene.slideSorter.set("focusedChild", currentThumb);
		},
		_onFocusPageUp: function(){
			dijit.Tooltip.show(this.lablePageUp,this.pageUp.domNode,["below"]);
		},
		_onBlurPageUp: function(){
			dijit.Tooltip.hide(this.pageUp.domNode);
		},
		_onFocusPageDown: function(){
			dijit.Tooltip.show(this.lablePageDown,this.pageDown.domNode,["below"]);
		},
		_onBlurPageDown: function(){
			dijit.Tooltip.hide(this.pageDown.domNode);
		},
		_onFocusZoomOut: function(){
			dijit.Tooltip.show(this.labelZoomOut,this.zoomOut.domNode,["below"]);
		},
		_onBlurZoomOut: function(){
			dijit.Tooltip.hide(this.zoomOut.domNode);
		},
		_onFocusFitWidth: function(){
			dijit.Tooltip.show(this.labelReset,this.fitWidth.domNode,["below"]);
		},
		_onBlurFitWidth: function(){
			dijit.Tooltip.hide(this.fitWidth.domNode);
		},
		_onFocusZoomIn: function(){
			dijit.Tooltip.show(this.labelZoomIn,this.zoomIn.domNode,["below"]);
		},
		_onBlurZoomIn: function(){
			dijit.Tooltip.hide(this.zoomIn.domNode);
		},
		_onFocusSlideShow: function(){
			dijit.Tooltip.show(this.labelPlay,this.slideShow.domNode,["below"]);
		},
		_onBlurSlideShow: function(){
			dijit.Tooltip.hide(this.slideShow.domNode);
		}
		
	});