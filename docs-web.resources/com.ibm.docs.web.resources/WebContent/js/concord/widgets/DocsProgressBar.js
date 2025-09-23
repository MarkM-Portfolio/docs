/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.widgets.DocsProgressBar");
dojo.require("dijit.ProgressBar");
dojo.requireLocalization("concord.widgets","DocsProgressBar");

dojo.declare("concord.widgets.DocsProgressBar", [dijit.ProgressBar], {	
	/*
	 * Override report method
	 */
	report:function(percent){
		var _perecent = dojo.number.format(percent, { type: "percent", places: this.places, locale: this.lang });
		var nls = dojo.i18n.getLocalization("concord.widgets","DocsProgressBar");
		return dojo.string.substitute(nls.PercentLabel, [_perecent]);
	}	
});