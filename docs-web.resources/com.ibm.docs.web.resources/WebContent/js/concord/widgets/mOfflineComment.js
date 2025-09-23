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
 * @mSlideComments.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mOfflineComment");

dojo.declare("concord.widgets.mOfflineComment", null, {
	id: null,
	slideId: null,
	content: null,
	img: null,

	constructor: function(id, slideId, content, img) {
		if (id)
			this.id = id;
		
		if (slideId)
			this.slideId = slideId;
		
		if (content)
			this.content = content;		

		if (img)
			this.img = img;
	},

	getId: function() {
		return this.id;
	},
	
	setId: function(id) {
		this.id = id;
	},
	
	getSlideId: function() {
		return this.slideId;
	},
	
	setSlideId: function(slideId) {
		this.slideId = slideId;
	},
	
	getContent: function() {
		return this.content;
	},
	
	setContent: function(content) {
		this.content = content;
	},
	
	getImg: function() {
		return this.img;
	},
	
	setImg: function(img) {
		this.img = img;
	}
});