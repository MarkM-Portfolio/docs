/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.feature.WelcomeDlg");
dojo.require("concord.util.strings");
dojo.require("concord.widgets.dimmer");

dojo.requireLocalization("concord.feature","usertour");

dojo.declare('concord.feature.WelcomeDlg', [dijit._Widget,dijit._Templated], {
	nls: null,
	templateString: dojo.cache("concord", "templates/welcome.html"),
	docType: null,
	dimmer: null,
	_connects: [],
	
	constructor: function(args){
		this.nls = dojo.i18n.getLocalization("concord.feature","usertour");
		this.docType = args.docType;		
	},		
	
	postCreate: function(){	
		this.inherited(arguments);
		this._createIcn();
		this._createContent();
		this._createBtn();
		this.dimmer = new concord.widgets.dimmer();
	},
	
	show: function(){		
		setTimeout(
			dojo.hitch(this, function(){
				this._show();
				this.setFocus();
			}),
			200
		);	
	},
	
	_show: function()
	{
		dojo.removeClass(this.welcomeNode,"hidden");
		this.dimmer.show();
		this._connects.push(dojo.connect(this.dimmer.dimmer, "onclick", this, "_clickDimmer"));
		var left = ( this.dimmer.dimmer.clientWidth - this.welcomeNode.clientWidth ) / 2;
		var top = ( this.dimmer.dimmer.clientHeight - this.welcomeNode.clientHeight ) / 2;
		dojo.style(this.welcomeNode,"left",left +"px");
		dojo.style(this.welcomeNode,"top",top +"px");
	},
	
	isShown: function()
	{
		return !dojo.hasClass(this.welcomeNode,"hidden");
	},
	
	setFocus: function(){
		if(pe.scene.docType == "pres"){
			pe.scene.setFocusComponent('dialogs');
		}
		var node = this.featureNode;
		setTimeout(
			function(){
				 if(node) node.focus();	
			}, 500);
	},
	
	_createIcn: function()
	{		
		var tourimg = dojo.create("div", null, this.imgNode);
		dojo.addClass(tourimg, "tourimg");
		if(this.docType == "pres")
		{
			dojo.addClass(tourimg, "tourimgPresentation");
		}
		else if(this.docType == "sheet")
		{
			dojo.addClass(tourimg, "tourimgSpreadsheet");
		}
		else
		{
			dojo.addClass(tourimg, "tourimgDocument");
		}		
		
		var tourterm = dojo.create("div", null, this.imgNode);	
		tourterm.innerHTML = this.nls.Welcome;
		dojo.addClass(tourterm, "welcomeTerm");
	},
	
	_createContent: function()
	{
		var container = dojo.create("div", {id : "welcome"}, this.featureNode);
		dojo.addClass(container,"fcontent");
			
		var introMsg = dojo.string.substitute(this.nls.TEXT_INTRODUCTION, { 'productName' : concord.util.strings.getProdName()});		
		if(this.docType == "pres")
		{
			introMsg = dojo.string.substitute(this.nls.PRES_INTRODUCTION, { 'productName' : concord.util.strings.getProdName()});
		}
		else if(this.docType == "sheet")
		{
			introMsg = dojo.string.substitute(this.nls.SHEET_INTRODUCTION, { 'productName' : concord.util.strings.getProdName()});
		}
		
		var node = dojo.create("div", null, container);
		node.innerHTML = introMsg;
		dojo.addClass(node,"fdesc");
		
		var question = dojo.create("div", null, container);
		question.innerHTML = this.nls.Want;	
		dojo.addClass(question,"fquestion");
		if (BidiUtils.isGuiRtl())
			dojo.attr(this.welcomeNode, 'dir', 'rtl');
	},
	
	_createBtn: function()
	{		
		var notNow = dojo.create('span', {label: this.nls.NotNow}, this.leftBtnNode);
		notNow.innerHTML = this.nls.NotNow;	
		
		var showMe = dojo.create('span', {label: this.nls.Tour}, this.rightBtnNode);
		showMe.innerHTML = this.nls.Tour;
	},
	
	_notNow: function()
	{
		this._hideMe();
		this._showTour(true);
	},
	
	_showMeAround: function()
	{		
		this._hideMe();
		this._showTour(false);
	},
	
	_showTour: function(last)
	{
		pe && pe.settings && pe.settings.setShowWelcome(false);
		setTimeout(
				dojo.hitch(this, function(){
					concord.feature.FeatureController.showTourDlg(last);
				}),
				20
		);		
	},
	
	_hideMe: function()
	{
		if(!dojo.hasClass(this.welcomeNode, "hidden")){
			dojo.addClass(this.welcomeNode,"hidden");	
		}
		this.dimmer.hide();
		dojo.forEach(this._connects, dojo.disconnect);
		this._connects = [];
	},
	
	_clickDimmer: function(e)
	{
		this.setFocus();
	},
	
	_onKeyDown: function(e)
	{
		e = e || window.event;
		var key = (e.keyCode ? e.keyCode : e.which);
		if(key == 115 && (e.ctrlKey || e.metaKey)){
			if (e.preventDefault) e.preventDefault();
			return;
		}      
		
		if (e.altKey || e.ctrlKey || e.metaKey) return;

		var target = e.target;
		if (target == null) 
			target = e.srcElement;
		
		var isEnterKeys = (key == dojo.keys.ENTER || key == dojo.keys.SPACE);
		
		if(isEnterKeys){			
			if(target == this.leftBtnNode || dojo.isDescendant(target, this.leftBtnNode)){
				this._notNow();
			}
			else if(target == this.rightBtnNode || dojo.isDescendant(target, this.rightBtnNode)){
				this._showMeAround();
			}
		}
		else if(key == dojo.keys.TAB)
		{ // keep tab event within the dialog
			if((target == this.leftBtnNode || dojo.isDescendant(target, this.leftBtnNode)) && e.shiftKey)
			{	
				this.rightBtnNode.focus();
				e.stopPropagation();
				e.preventDefault();
			}
			else if((target == this.rightBtnNode || dojo.isDescendant(target, this.rightBtnNode)) && !e.shiftKey)
			{
				this.leftBtnNode.focus();
				e.stopPropagation();
				e.preventDefault();
			}	
		}
		else if(key == dojo.keys.ESCAPE)
		{
			this._notNow();
		}
		else
		{
			e.stopPropagation();
			e.preventDefault();
		}
	},
	
	_onclick: function(event)
	{
		var target = event.target;
		if (target == null) 
			target = event.srcElement; 
		if(target == this.leftBtnNode || dojo.isDescendant(target, this.leftBtnNode))
		{
			this._notNow();
		}
		else if(target == this.rightBtnNode || dojo.isDescendant(target, this.rightBtnNode))
		{
			this._showMeAround();
		}
	},
	
	_onBlur: function(by){
		this.inherited(arguments);
		//this._hideMe();
	}
});