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
dojo.provide("viewer.beans.ImageInfo");

dojo.declare("viewer.beans.ImageInfo", null, {
	constructor: function(type, width, height, filepath){
		this.type = type;
		this.width = width;
		this.height = height;
		this.ratio = this.height/this.width;
		this.filepath = filepath;
	},
		
	getType: function(){
		return this.type;
	},
	
	getPageWidth: function(){
		return this.width;
	},
	
	getPageHeight: function(){
		return this.height;
	},
	
	getFilepath: function(){
		return this.filepath;
	},
		
	getScaledHeight: function(scaledWidth){
		if (scaledWidth == this.width)
			return this.height;
		else
			return this.ratio * scaledWidth;
	},
	
	getScaledWidth: function(scaledHeight){
		if (scaledHeight == this.height)
			return this.width;
		else
			return scaledHeight/this.ratio;
	}

});