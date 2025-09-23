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

/*
 * SlideContent, an object about slide content
 */

dojo.provide("concord.widgets.SlideContent");

dojo.declare("concord.widgets.SlideContent", null, {
	slideInnerHtml:"",
	slideId:"",
	isLoaded: false,
	wasLoaded: false,
	
	constructor: function(slideInnerHtmlStr, slideId, isLoadedVal, wasLoadedVal) {
		// only save slideInnerHtml --- children under draw_page
		if (slideInnerHtmlStr) {
			var editor = window.pe.scene.getEditor();
			var ckNode = new CKEDITOR.dom.element('div', editor.document );	
			
			if (ckNode) {
				ckNode.setHtml(slideInnerHtmlStr);
				//S38884: Clean fixDOMStructure to improve performance 
				PresCKUtil.fixDOMStructure(ckNode.$);
				this.slideInnerHtml = ckNode.getHtml();
			} else {
				this.slideInnerHtml = slideInnerHtmlStr;
			}
			
			ckNode.remove();
		}
		
		this.slideId = slideId || '';
		this.isLoaded = isLoadedVal;
		this.wasLoaded = wasLoadedVal;
	},
	
	setIsLoaded:function(isLoadedVal){
			this.isLoaded = isLoadedVal;
	},
	getIsLoaded:function(){
		return this.isLoaded;
	},
	setWasLoaded: function(wasLoadedVal){
		this.wasLoaded = wasLoadedVal;
	},
	getWasLoaded:function(){
		return this.wasLoaded;
	},

	getSlideInnerHtml:function(){
		return this.slideInnerHtml; //for temporary, actual function needs to parse slideWrapperHtml and get the slide Inner Html
	},
	
	setSlideInnerHtml: function(slideInnerHtml) {
		if (this.slideInnerHtml != slideInnerHtml) {
		  this.slideInnerHtml = slideInnerHtml;
		}
	},

	//from slideWrapperHtml, set the slideId
	setSlideId:function( slideId){
		this.slideId = slideId;
	}

});
