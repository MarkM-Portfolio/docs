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

dojo.provide("websheet.widget.MenuTooltip");

dojo.require("dijit.Tooltip");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.declare('websheet.widget.MenuTooltip', dijit.Tooltip, {	
	widget: null,
	position: ["below", "above"],
	connected: {c:false},
	title: "",
	ack: "",
	buildRendering: function(){
		this.inherited(arguments);
		this.connectId = [this.widget.domNode];
		if(this.widget.dropDown)
		{
			this.connect(this.widget, "openDropDown", "openDropDown");
		}
		if(this.widget.onClick)
		{
			this.connect(this.widget, "onClick", "openDropDown");
		}
	},
	
	setTitleAck: function(title, ack)
	{
		this.title = title;
		this.ack = ack;
		var html = BidiUtils.isGuiRtl() ? "<div dir='rtl' >" : "<div>";
		html += "<span class='tooltipLabel'>" + websheet.Helper.escapeXml(title) + "</span>";
		if(ack)
			html += "<span class='tooltipAccelKey'>" + websheet.Helper.escapeXml(ack) + "</span>";
		html += "</div>";
		this.attr("label", html);
	},
	
	onShow: function(target, position){
		
		try{
			var master = dijit._masterTT;
			var masterDom = master.domNode;
			if(!dojo.hasClass(masterDom, "menuTooltip"))
				dojo.addClass(masterDom, "menuTooltip");
			if (position[0] == 'after') {
				masterDom.style.left = (parseInt(masterDom.style.left) + 8) + "px";
			} else {
				if(this.onHeader)
				{
					masterDom.style.top = (parseInt(masterDom.style.top) + 6) + "px";					
					var cordsPos = dojo.position(this.widget.domNode);
					var cordsX = cordsPos.x;
					var condsW = Math.floor(cordsPos.w/2) - 4;				
					var tooltipPositionX =  dojo.position(masterDom).x;
					var offset = tooltipPositionX - cordsX;
					if (offset >= 0) {
						master.connectorNode.style.left = "6px";
					} else {
						master.connectorNode.style.left = (condsW - offset) + "px";
					}
				}
				else
				{
					masterDom.style.top = (parseInt(masterDom.style.top) + 6) + "px";
					var cordsX = dojo.position(this.widget.domNode).x;
					var tooltipPositionX =  dojo.position(masterDom).x;
					var offset = tooltipPositionX - cordsX;
					if (offset >= 0) {
						master.connectorNode.style.left = "6px";
					} else {
						master.connectorNode.style.left = (6 - offset) + "px";
					}					
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
	
	_onHover: function(e)
	{
		//remove the role attribute ('alert') for A11Y, restore it in _onUnHover
		try{
			////for dojo 1.9+, it's _masterTT
			if (dijit._masterTT) {
				dijit._masterTT.containerNode.removeAttribute('role');
			}
		}
		catch(e){}
		if(this.widget.dropDown && this.widget._opened)
			return;
		else
		{
			if(!this._showTimer){
				var target = this.widget.domNode;
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
//		{
//			if (dijit._masterTT) {
//				dijit._masterTT.containerNode.setAttribute('role', 'alert');
//			}
//		}catch(e){}
	},
	
	openDropDown: function(){
		this._onUnHover();
	}
	
	
});