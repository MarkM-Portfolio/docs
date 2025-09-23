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
dojo.provide("html.widgets.Zoomer");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("viewer.widgets.LotusTextButton");
dojo.require("viewer.util.BidiUtils");
dojo.requireLocalization("viewer.widgets", "Zoomer");

dojo.declare(
	"html.widgets.Zoomer",
	[dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("html.widgets", "templates/Zoomer.html"),
		widgetsInTemplate: true,
		percentage: 0,
		manager: null,
		
		postMixInProperties: function()
		{
			var _nlsResources = dojo.i18n.getLocalization("viewer.scenes", "Scene");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		postCreate: function()
		{	
			dojo.connect(window, "onresize", this, "position");
			this.inherited(arguments);
		},
		position: function(){
			var cwidth=dojo.marginBox(dojo.byId("contentPane")).w;
			var wwidth=dojo.marginBox(this.domNode).w;
			var mleft=(cwidth-wwidth)/2;
			var thumbnailw=dojo.marginBox(dojo.byId("thumbnailPane")).w;
			var leftStr = (mleft+thumbnailw)+"px";
			if (BidiUtils.isGuiRtl())
				this.domNode.style.right=leftStr;
			else
				this.domNode.style.left=leftStr;
		},
		_onZoomInSelect: function()
		{
			this.manager.zoomIn();
		},

		_onZoomOutSelect: function()
		{
			this.manager.zoomOut();
		},
		
		_onFitWidthSelect: function()
		{
			this.manager.fitWidth();
		}
		
	});