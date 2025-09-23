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

dojo.provide("concord.beans.Activity");

dojo.declare("concord.beans.Activity", null, {
	id: null,
	title: null,
	
	constructor: function(id, title){
		this.id = id;
		this.title = title;
	},
	
	getId: function(){
		return this.id;
	},

	getTitle: function(){
		return this.title;
	}
	
});