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
dojo.provide("html.widgets.LoadingPage");
dojo.require("dijit.Dialog");
dojo.require("viewer.util.BidiUtils");
dojo.declare("html.widgets.LoadingPage", [dijit.DialogUnderlay],{
	
	templateString: "<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay viewerLoadingUnderlay' data-dojo-attach-point='node'><img data-dojo-attach-point='img' alt='Loading' src=''></img></div></div>",
	
	constructor: function(){
		this.inherited( arguments );
		dojo.connect(window, "onresize", this, "resize");
	},
	layout: function(){
		// summary:
		//		Sets the background to the size of the viewport
		//
		// description:
		//		Sets the background to the size of the viewport (rather than the size
		//		of the document) since we need to cover the whole browser window, even
		//		if the document is only a few lines long.
		// tags:
		//		private

		var is = this.node.style,
			os = this.domNode.style,
			imgstyle=this.img.style;

		// hide the background temporarily, so that the background itself isn't
		// causing scrollbars to appear (might happen when user shrinks browser
		// window and then we are called to resize)
		os.display = "none";

		// then resize and show
		var viewport = dojo.window.getBox(this.ownerDocument);
		os.top = viewport.t + "px";
		os.left = viewport.l + "px";
		is.width = viewport.w + "px";
		is.height = viewport.h + "px";
		this.img.src = window.staticResPath + "/js/html/images/loading.gif";
		var marginLeftStr = (viewport.w-16)/2+"px";
		if (BidiUtils.isGuiRtl()){
			imgstyle.marginRight= marginLeftStr;
		} else {
			imgstyle.marginLeft= marginLeftStr;
		}
		imgstyle.marginTop=(viewport.h-16)/2+"px";
		os.display = "block";
	},
	resize: function(){

		var is = this.node.style,
			os = this.domNode.style,
			imgstyle=this.img.style;

		var viewport = dojo.window.getBox(this.ownerDocument);
		os.top = viewport.t + "px";
		os.left = viewport.l + "px";
		is.width = viewport.w + "px";
		is.height = viewport.h + "px";
		imgstyle.marginLeft=(viewport.w-16)/2+"px";
		imgstyle.marginTop=(viewport.h-16)/2+"px";
	}
});
