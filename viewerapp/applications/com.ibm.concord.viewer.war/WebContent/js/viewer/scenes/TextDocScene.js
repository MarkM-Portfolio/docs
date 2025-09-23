/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.scenes.TextDocScene");

dojo.require("viewer.scenes.BasicDocScene");
dojo.declare("viewer.scenes.TextDocScene", 
			[viewer.scenes.BasicDocScene], {
		
	constructor: function(){
	},
	
	getTitleImageName: function(){
		if(g_env!="smart_cloud")
			return "ibmdocs_wordprocessing_32.png";
		else
			return "ibmdocs_textdocument_24.png";
	},
	showHelp: function(){
		var regEx = new RegExp("^((https|http|)?:\/\/)[^\s]+");
		if(regEx.test(gText_help_URL)){
			window.open(gText_help_URL);
		}
		else{
			window.open(window.location.protocol+'//'+window.location.host  + gText_help_URL + this.helpTail);
		}
	}
});