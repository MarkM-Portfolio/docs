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


dojo.provide("concord.task.CachedTask");
dojo.require("concord.beans.Task");
//dojo.require("dojo.i18n");
//dojo.requireLocalization("concord.task", "CachedTask");

dojo.declare("concord.task.CachedTask", [concord.beans.Task], {
	constructor: function(){
	},
	
    isCached: function(){
		return true;
	}
	
});