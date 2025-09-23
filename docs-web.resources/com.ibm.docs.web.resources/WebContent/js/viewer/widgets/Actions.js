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
dojo.provide("viewer.widgets.Actions");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Tooltip");
dojo.require("viewer.widgets.LotusTextButton");
dojo.require("concord.util.BidiUtils");

dojo.declare(
	"viewer.widgets.Actions",
	[dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("viewer.widgets", "templates/Actions.html"),
		widgetsInTemplate: true,
		percentage: 0,
		manager: null,
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
			  var checkRight = e.clientX < this.leftPos+240;
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
			var cwidth = dojo.style(document.body, 'width');
			var wwidth = dojo.marginBox(this.domNode).w;
			this.leftPos = (cwidth-wwidth)/2;
			if (BidiUtils.isGuiRtl())
				this.domNode.dir = "rtl";

			this.domNode.style.left= this.leftPos + 'px';
		},
		
		_onZoomInSelect: function()
		{
			var viewCompactScaleRate = pe.lotusEditor.getScale() * 1.1;
			pe.lotusEditor.getCommand('Zoom').setState( writer.TRISTATE_ON);
			pe.lotusEditor.execCommand("Zoom", viewCompactScaleRate);
			this.zoomIn.focus();
		},

		_onZoomOutSelect: function()
		{
			var viewCompactScaleRate = pe.lotusEditor.getScale() * 0.9;
			pe.lotusEditor.getCommand('Zoom').setState( writer.TRISTATE_ON);
			pe.lotusEditor.execCommand("Zoom", viewCompactScaleRate);
			this.zoomOut.focus();
		},
		
		_onReset: function()
		{
			pe.lotusEditor.execCommand("Zoom", 1.0);
		},
		
		_onFitWidthSelect: function()
		{
			var containerW = pe.lotusEditor.getViewWidth();
			var curPage = pe.lotusEditor.currFocusePage;
			var pageW = curPage.getWidth();
			var editorLeft = pe.scene.getEditorLeft(true);
			var padding = 20;	// The padding from CSS
			var viewCompactScaleRate = (containerW - padding * 2) / (pageW);
			pe.lotusEditor.getCommand('Zoom').setState( writer.TRISTATE_ON);		
			pe.lotusEditor.execCommand("Zoom", viewCompactScaleRate);
		},
		
		_onPageUp: function(){
			//pe.lotusEditor.execCommand("pageup", null);
			var curPage = pe.lotusEditor.currFocusePage;
			var offset = curPage.getHeight();
			var wnd = pe.lotusEditor.getWindow();
			var padding = 20;
			wnd.scrollBy(0, -(offset + padding) * pe.lotusEditor.getScale() );
		},
		
		_onPageDown: function(){
			//pe.lotusEditor.execCommand("pagedown", null);
			var curPage = pe.lotusEditor.currFocusePage;
			var offset = curPage.getHeight();
			var wnd = pe.lotusEditor.getWindow();
			var padding = 20;	// The padding from CSS
			wnd.scrollBy(0, (offset + padding) * pe.lotusEditor.getScale() );
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
		}
		
	});