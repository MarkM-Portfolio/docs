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

dojo.provide("concord.widgets.dimmer");


dojo.declare('concord.widgets.dimmer', null, {
	dimmer: null,
	id: "welcome_dimmer",
	
	constructor: function(args){
		this._createDimmer();
	},		
		
	show: function()
	{
		dojo.removeClass(this.dimmer,"hidden");
	},
	
	isShown: function()
	{
		return !dojo.hasClass(this.dimmer,"hidden");
	},
	
	hide: function()
	{
		if(!dojo.hasClass(this.dimmer, "hidden")){
			dojo.addClass(this.dimmer,"hidden");
		}
	},
		
	_createDimmer: function()
	{
		this.dimmer = dojo.byId(this.id);
		if (!this.dimmer)
		{
			this.dimmer = document.createElement("div");
			this.dimmer.id = this.id;
			dojo.addClass(this.dimmer,"dimmer hidden");			
			document.body.appendChild(this.dimmer);
		}
	}
});