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

dojo.provide("pres.widget.MenuContext");
dojo.require("dijit.Menu");
dojo.require("pres.widget.MenuMixin");
dojo.require("concord.util.BidiUtils");

dojo.declare("pres.widget.MenuContext", [dijit.Menu, pres.widget.MenuMixin], {

	postMixInProperties: function()
	{
		this.dir = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.inherited(arguments);
	},

	focus: function()
	{
		if (pe.scene.isMobileBrowser())
		{
			return;
		}
		
		this.inherited(arguments);
		this.renderBoxSelection();
	},

	renderBoxSelection: function()
	{
		// to be overrided.
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		// sometimes, click on menu, it clicked into the box in the background, not sure why....
		this.connect(this.domNode, "onmousedown", function(e){
			dojo.stopEvent(e);
		});
	},
	
	onOpen: function()
	{
		this.inherited(arguments);
		if (pe.scene.isMobileBrowser())
		{
			if (this.mobileTouch)
				dojo.disconnect(this.mobileTouch);
			setTimeout(dojo.hitch(this, function(){
				if (this.activated){
					this.mobileTouch = dojo.connect(document.body, "ontouchstart", this, function(e){
						var target = e.target;
						if (this.activated && !dojo.isDescendant(target, this.domNode))
							setTimeout(dojo.hitch(this, function(){
								if (this.activated)
									this._onBlur();
							}), 250);
					});
				}
			}), 100);
		}
		
		dojo.publish("/menu/context/open", []);
	},
	
	onClose: function()
	{
		if (this.mobileTouch)
			dojo.disconnect(this.mobileTouch);
		this.inherited(arguments);
		dojo.publish("/menu/context/close", []);
	}

});