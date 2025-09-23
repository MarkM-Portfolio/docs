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

dojo.provide("websheet.model.BasicModel");
dojo.declare("websheet.model.BasicModel",null,{
	
	/*
	 * check whether this object can be merged with given model, the object would be row, column or styleCell model
	 */
	/*boolean*/isMergable:function(/*BasicModel*/model){
		return true;
	},

	/*
	 * check whether this object is equal to the given model
	 */
	/*boolean*/isEqual:function(/*BasicModel*/model) {
		return true;
	}
});