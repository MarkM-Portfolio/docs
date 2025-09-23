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

dojo.provide("pres.loader.PartialLoader");
dojo.require("pres.model.Document");

pres.loader.PartialLoader = {

	cancel: function()
	{
		this.dfd && this.dfd.cancel();
	},

	start: function(chunkId)
	{
		this.cancel();
		var criteria = {
			"inPartial": true,
			"format": pe.scene.loadFormat,
			"chunkId": chunkId,
			"initSlide": pe.scene.loadInitSlide
		};
		this.dfd = new dojo.Deferred();
		
		var net = pe.scene.session || concord.net.HtmlViewConnector;
		net.getPartial(dojo.hitch(this, this._loaded), criteria);
		return this.dfd;
	},

	_loaded: function(state)
	{
		var status = state.content.status;

		if (status == "OK")
		{
			this.dfd && this.dfd.resolve([state.content.html, state.content.json]);
		}
		else
		{
			this.dfd && this.dfd.reject();
		}
	}

};