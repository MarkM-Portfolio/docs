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

dojo.provide("concord.feature.NewUserTourDlg");
dojo.require("concord.feature.FeatureDlg");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.widgets.LotusTextButton");

dojo.requireLocalization("concord.feature","usertour");

dojo.declare('concord.feature.NewUserTourDlg', [concord.feature.FeatureDlg], {
	
	constructor: function(args){
		this.nls = dojo.i18n.getLocalization("concord.feature","usertour");
	},
	
	_featuresEquals: function(ids)
	{
		if(ids.length != this.featureIDs.length)
			return false;
		
		for(var i=0; i<this.featureIDs.length; i++)
		{
			if(ids[i] != this.featureIDs[i])
				return false;
		}
		return true;
	},
	
	showLastTour: function()
	{
		this.show(this.fNumber - 1);
	},
	
	setFeatureIDs: function(ids)
	{
		if(!this._featuresEquals(ids))
		{
			this.featureIDs = ids;
			dojo.empty(this.featureNode);
			dojo.empty(this.lightNode);
			this._createContent();	
		}
	}
});