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

dojo.provide("pres.handler.ImagePropertyHandler");
dojo.require("concord.widgets.ImagePropertyDialog");
dojo.requireLocalization("concord.widgets", "ImagePropHandler");

dojo.declare("pres.handler.ImagePropertyHandler", null, {
	box: null,
	dlg: null,
	dialogtitle: null,

	constructor: function(selectedBox)
	{
		this.box = selectedBox;
		this.nls = dojo.i18n.getLocalization("concord.widgets", "ImagePropHandler");
	},

	showDlg: function()
	{
		if (!this.dlg)
		{
			this.dlg = new concord.widgets.ImagePropertyDialog(this, this.nls.dialogtitle, null, null);
		}
		this.dlg.show();
	},

	setSelectedBox: function(selectedBox)
	{
		this.box = selectedBox;
	},

	getImageInfo: function()
	{
		// get image information
		var currentWidth = dojo.style(this.box.mainNode, 'width');
		var currentHeight = dojo.style(this.box.mainNode, 'height');

		var altText = "";

		var images = dojo.query("img", this.box.mainNode);
		if (images && images.length > 0)
		{
			altText = dojo.attr(images[0], 'alt');
		}

		return {
			Alt: altText,
			width: currentWidth,
			height: currentHeight,
			isSupportAlt: true,
			isSupportRatio: true,
			checkRatio: true
		};
	},

	setImageInfo: function(width, height, border, alt)
	{
		var helper = pres.utils.helper;
		var newWidth = helper.pxToPercent(width, null, true) + "%";
		var newHeight = helper.pxToPercent(height, null, false) + "%";

		dojo.style(this.box.mainNode, 'width', newWidth);
		dojo.style(this.box.mainNode, 'height', newHeight);

		var images = dojo.query("img", this.box.mainNode);
		if (images && images.length > 0)
		{
			dojo.attr(images[0], 'alt', alt);
		}

		var element = this.box.element;
		var slide = this.box.element.parent;

		var data = {content: this.box.getContent()};
		var msgPub = pe.scene.msgPublisher;

		var newW = parseFloat(newWidth) * slide.w / 100.0;
		var newH = parseFloat(newHeight) * slide.h / 100.0;

		data.w = newW;
		data.h = newH;

		var msg = [msgPub.createReplaceMsg(element, data)];
		msgPub.sendMessage(msg);

		element.updateWH(data.w, data.h);
		element.setContent(data.content);
	}
});
