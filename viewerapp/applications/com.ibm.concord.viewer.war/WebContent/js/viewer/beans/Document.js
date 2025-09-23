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
dojo.provide("viewer.beans.Document");
dojo.require("viewer.beans.PageInfo");
dojo.require("viewer.beans.Event");

dojo.declare("viewer.beans.Document", null, {
	constructor: function(title, type, repository, uri, version, pages){
		this.title = title;
		this.type = type;
		this.repository = repository;
		this.uri = uri;
		this.pages = pages;
		this.version = version;
		this.pagesInfo = new Array();
		this.listeners = new Array();
	},
	
	getTitle: function(){
		return this.title;
	},

	getType: function(){
		return this.type;
	},
	
	getRepository: function(){
		return this.repository;
	},
	
	getUri: function(){
		return this.uri;
	},
	
	getVersion: function(){
		return this.version;
	},
	
	getPages: function(){
		return this.pages;
	},
	
	setPagesInfo: function(info){
		if (info == null)
			return;
		
			var images = info;
			var thumbnails = images.thumbnails;
			var fullImages = images.fullImages;
			var thumbnailUpdated = false;
			var fullImageUpdated = false;
			if (thumbnails){
				for (var key in thumbnails){
					var keyArray = key.split('_');
					var folder = keyArray[0];
					var idx = parseInt(keyArray[1]);
					var thumbnail = null;
					if (!isNaN(idx)){
						if (!this.pagesInfo[idx])
							this.pagesInfo[idx] = new viewer.beans.PageInfo();
						if (!this.pagesInfo[idx].getThumbnailInfo()){
							thumbnail = new viewer.beans.ImageInfo('thumbnail', thumbnails[key].size.w, thumbnails[key].size.h, folder + '/' + thumbnails[key].name);
							this.pagesInfo[idx].setThumbnailInfo(thumbnail);
							thumbnailUpdated = true;
						}
						
					}else{
						console.warn('wrong thumbnail data is got: ' + key);
					}
				}
			}
			if (fullImages){
				for (var key in fullImages){
					var keyArray = key.split('_');
					var folder = keyArray[0];
					var idx = parseInt(keyArray[1]);
					var fullImage = null;
					if (!isNaN(idx)){
						if (!this.pagesInfo[idx])
							this.pagesInfo[idx] = new viewer.beans.PageInfo();
						if (!this.pagesInfo[idx].getFullImageInfo()){
							fullImage = new viewer.beans.ImageInfo('fullImage', fullImages[key].size.w, fullImages[key].size.h, folder + '/' + fullImages[key].name);
							this.pagesInfo[idx].setFullImageInfo(fullImage);
							fullImageUpdated = true;
						}
					}
					else{
						console.warn('wrong fullImage data is got: ' + key);
					}
				}
			}
			
			if (fullImageUpdated || thumbnailUpdated){
				this.pages = this.pagesInfo.length;
				var data = {};
				data.fullImageUpdated = fullImageUpdated;
				data.thumbnailUpdated = thumbnailUpdated;
				var event = new viewer.beans.Event("pageInfoUpdated", data);
				this.notify(event);
			}
	},
	
	getPagesInfo: function(){
		return this.pagesInfo;
	},
		
	addListener: function(listener){
		this.listeners.push(listener);
	},
	
	removeListener: function(listener){
		this.listeners.pop(listener);
	},
	
	notify: function(e){
		if (e.type == "pageInfoUpdated"){
			for(var i=0;i<this.listeners.length;i++){
				if (this.listeners[i].onPageInfoUpdated)
					this.listeners[i].onPageInfoUpdated(e.data);
			}
		}		
	}
	
});