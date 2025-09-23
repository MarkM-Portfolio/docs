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
dojo.provide("viewer.beans.PageInfo");

dojo.require("viewer.beans.ImageInfo");

dojo.declare("viewer.beans.PageInfo", null, {
	thumbnailInfo: null,
	fullImageInfo: null,
	setThumbnailInfo: function(thumbnailInfo){
		this.thumbnailInfo = thumbnailInfo;
	},
	
	getThumbnailInfo: function(){
		return this.thumbnailInfo;
	},
	
	setFullImageInfo: function(fullImageInfo){
		this.fullImageInfo = fullImageInfo;
	},
	
	getFullImageInfo: function(){
		return this.fullImageInfo;
	},
	
	getScaledThumbnailHeight: function(width){
		if (this.thumbnailInfo){
			return this.thumbnailInfo.getScaledHeight(width);
		}else if (this.fullImageInfo){
			return this.fullImageInfo.getScaledHeight(width);
		}else{
			return 0;
		}
	},

	getScaledThumbnailWidth: function(height){
		if (this.thumbnailInfo){
			return this.thumbnailInfo.getScaledWidth(height);
		}else if (this.fullImageInfo){
			return this.fullImageInfo.getScaledWidth(height);
		}else{
			return 0;
		}
	},

	
	getScaledFullImageHeight: function(width){
		if (this.fullImageInfo){
			return this.fullImageInfo.getScaledHeight(width);
		}else if (this.thumbnailInfo){
			return this.thumbnailInfo.getScaledHeight(width);
		}else{
			return 0;
		}
	},
	
	getScaledFullImageWidth: function(height){
		if (this.fullImageInfo){
			return this.fullImageInfo.getScaledWidth(height);
		}else if (this.thumbnailInfo){
			return this.thumbnailInfo.getScaledWidth(height);
		}else{
			return 0;
		}
	}

});