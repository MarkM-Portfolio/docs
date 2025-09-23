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
dojo.require("viewer.util.BidiUtils");
dojo.require("dojo.io-query");
dojo.requireLocalization("viewer.widgets", "Zoomer");

dojo.declare(
	"viewer.widgets.PresActions",
	[dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("viewer.widgets", "templates/PresActions.html"),
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
			  var checkRight = e.clientX < this.leftPos+308;
			  var checkBottom = e.clientY < window.innerHeight - 30;
			  var checkTop = e.clientY> window.innerHeight-30-47;
		},
		
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
			
			var cwidth = dojo.marginBox(dojo.byId("contentPane")).w;
			var wwidth = dojo.marginBox(this.domNode).w;
			this.leftPos = (cwidth-wwidth)/2;
			if (BidiUtils.isGuiRtl())
				this.domNode.dir = "rtl";

			this.domNode.style.left= this.leftPos + 'px';
		},
		_onZoomInSelect: function()
		{
			this.manager.zoomer._onZoomInSelect();
		},

		_onZoomOutSelect: function()
		{
			this.manager.zoomer._onZoomOutSelect();
		},
		
		_onFitWidthSelect: function()
		{
			this.manager.setCurrentStyle('compact');
		},
		
		_onPageUp: function(){
			this.manager.pagePicker._onPrevSelect();
		},
		
		_onPageDown: function(){
			this.manager.pagePicker._onNextSelect();
		},
		
		_onSlideShow: function(){
			var u = window.location.href.split('?');      

			var strssUrl = u[0] + '?mode=slideshow';
			if(DOC_SCENE.compactMode)
			{
				strssUrl += ':compact';
			}

			if(typeof(u[1]) != 'undefined')      
			{
				var mime = dojo.queryToObject(u[1]).mime;
				if(typeof(mime) != 'undefined')
				{
						strssUrl += "&mime=" + encodeURIComponent(mime);
				}
			}

			window.open(strssUrl, 'SlideShow', 'height='+screen.height+',width='+screen.width + ',left=0,top=0');			
		}
		
	});