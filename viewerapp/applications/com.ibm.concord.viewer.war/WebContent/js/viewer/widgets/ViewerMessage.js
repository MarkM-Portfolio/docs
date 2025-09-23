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
dojo.provide("viewer.widgets.ViewerMessage");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.requireLocalization("viewer.widgets", "ViewerMessage");

dojo.declare("viewer.widgets.ViewerMessage", [dijit._Widget, dijit._Templated], {

	information : null,

	padding : 5,

	type : 0,

	imgPath : null,

	closeImgPath : '/images/close_sel.gif',

	className : null,

	parentDiv : null,	

	templateString : dojo.cache("viewer.widgets", "templates/ViewerMessage.html"),

	constructor : function(args) {
		dojo.mixin(this, args);
		this.inherited(arguments);
	},

	postMixInProperties : function() {
		var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "ViewerMessage");
		dojo.mixin(this, _nlsResources);

		/**
		 * type = 0, 1, 2 (info, warning, error)
		 * Overwrite parent's function because document is using
		 * lotus success for information
		 */

		switch (this.type) {
			case 0:
				this.imgPath = '/images/information.png';
				this.className = 'lotusMessage lotusInfo';
				break;
			case 1:
				this.imgPath = '/images/warning.png';
				this.className = 'lotusMessage lotusWarning';
				break;
			case 2:
			default:
				this.imgPath = '/images/error.png';
				this.className = 'lotusMessage';
		}
		
		this.imgPath = staticResPath + this.imgPath;
		this.closeImgPath = staticResPath + this.closeImgPath;
		
		this.inherited(arguments);

	},

	postCreate : function() {
		dojo.connect(this.viewer_message_exit_img, 'click', this, this.closeMessage);
	},

	closeMessage : function() {
		if(this.domNode)
			dojo.destroy(this.domNode);
	},
	showMessage : function() {

		if(this.parentDiv != null) {
			
			//margin
			dojo.style(this.domNode, {
				margin : this.padding + 'px'
			});
			dojo.addClass(this.domNode, this.className);
			dojo.place(this.domNode, this.parentDiv.domNode, "first");
		}
	}
});
