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

dojo.provide("concord.beans.Event");

dojo.declare("concord.beans.Event",null,{
	
	constructor: function(type){
		this.type = type;
		this.source = new Array();
	},
	
	setSource: function(source){
		this.source = source;
	},
	
	getSource: function(){
		return this.source;
	},
	
	getType: function(){
		return this.type;
	}
	
});