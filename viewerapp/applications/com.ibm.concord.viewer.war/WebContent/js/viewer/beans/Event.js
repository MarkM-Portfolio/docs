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
dojo.provide("viewer.beans.Event");

dojo.declare("viewer.beans.Event",null,{
	
	constructor: function(type, data){
		this.type = type;
		this.data = data;
	},
		
	getType: function(){
		return this.type;
	},
	
	getData: function(){
		return this.data;
	}
	
});