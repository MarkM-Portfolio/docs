/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.widget.MenuTooltip");

dojo.require("dijit.Tooltip");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.declare('pres.widget.MenuTooltip', dijit.Tooltip, {
	
	widget: null,
	node: null,
	position: ["below", "above"],
	connected: {c:false},
	title: "",
	ack: "",
	onHeader: null,
	
	buildRendering: function(){
		this.inherited(arguments);
		this.connectId = [this.node || this.widget.tooltipNode || this.widget.domNode];
		if(this.widget && this.widget.dropDown && this.widget.openDropDown)
		{
			this.connect(this.widget, "openDropDown", "openDropDown");
		}
		if(this.widget && this.widget.onClick)
		{
			this.connect(this.widget, "onClick", "openDropDown");
		}
	},
	
	setTitleAck: function(title, ack)
	{
		this.title = title;
		this.ack = ack;
		var html = BidiUtils.isGuiRtl() ? "<div dir='rtl' >" : "<div>";
		html += "<span class='tooltipLabel'>" + pres.utils.htmlHelper.toHTML(title) + "</span>";
		if(ack)
			html += "<span class='tooltipAccelKey'>" +  pres.utils.htmlHelper.toHTML(ack) + "</span>";
		html += "</div>";
		this.attr("label", html);
	},
	
	onShow: function(target, position){
		
		try{
			var master = dijit._masterTT;
			var masterDom = master.domNode;
			if(!dojo.hasClass(masterDom, "menuTooltip"))
				dojo.addClass(masterDom, "menuTooltip");
			
			// bob, iframe cause the height wrong calculation, fixed.
			var banner = dojo.byId("banner");
			if(position[0] == "after") {
			  masterDom.style.left = (parseInt(masterDom.style.left) + 8) + "px";
			  masterDom.style.top = dojo.contentBox(banner).h + (parseInt(masterDom.style.top)) + "px";
			} else if(position[0] == "before") {
			  masterDom.style.top = dojo.contentBox(banner).h + (parseInt(masterDom.style.top)) + "px";
			} else {
			  if(this.onHeader)
			  {
				  masterDom.style.top = (parseInt(masterDom.style.top) + 6) + "px";
				  var cordsPos = dojo.position(this.widget.domNode);
				  var cordsX = cordsPos.x;
				  var condsW = Math.floor(cordsPos.w/2) - 4;
				  var tooltipPositionX =  dojo.position(masterDom).x;
				  var offset = tooltipPositionX - cordsX;
				  if(offset >= 0)
				    master.connectorNode.style.left = "6px";
				  else
				    master.connectorNode.style.left = (condsW - offset) + "px";				  
			  }	  				
			  else
			  {
				  masterDom.style.top = dojo.contentBox(banner).h + (parseInt(masterDom.style.top) + 6) + "px";  
				  var cordsX = dojo.position(this.widget.domNode).x;
				  var tooltipPositionX =  dojo.position(masterDom).x;
				  var offset = tooltipPositionX - cordsX;
				  if(offset >= 0)
				    master.connectorNode.style.left = "6px";
				  else
				    master.connectorNode.style.left = (6 - offset) + "px";
			  }			    
 			}
		}
		catch(e){}
		
		if(this.connected.c == false && dijit._masterTT)
		{
			dojo.connect(dijit._masterTT, "_onHide", function(){
				var masterDom = dijit._masterTT.domNode;
				dojo.removeClass(masterDom, "menuTooltip");
			});
			this.connected.c = true;
		}
	},
	
	_onHover: function(target)
	{
		//remove the role attribute ('alert') for A11Y, restore it in _onUnHover
		try{
			////for dojo 1.9+, it's _masterTT
			dijit._masterTT.containerNode.removeAttribute('role');
		}
		catch(e){}
		if(this.widget && this.widget.dropDown && this.widget._opened)
			return;
		else
		{
			if(!this._showTimer){
				this._showTimer = this.defer(function(){ this.open(target); }, this.showDelay);
			}
		}
	},
	
	_onUnHover: function()
	{
		this.inherited(arguments);
//51011: [A11Y] JAWS doesn't read the tooltip until exiting the menu item 'Publish Automatically'		
//		try
//		//for dojo 1.9+
//		{dijit._masterTT.containerNode.setAttribute('role', 'alert');}catch(e){}
	},
	
	openDropDown: function(){
		this._onUnHover();
	}
	
	
});