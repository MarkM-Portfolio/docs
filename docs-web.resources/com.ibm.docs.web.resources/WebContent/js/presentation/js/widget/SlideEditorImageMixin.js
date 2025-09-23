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

dojo.provide("pres.widget.SlideEditorImageMixin");

dojo.require("pres.editor.Box");
dojo.require("pres.widget.MenuContext");
dojo.require("pres.constants");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("concord.widgets.InsertImageDialog");

dojo.declare("pres.widget.SlideEditorImageMixin", null, {

	uninitialize: function()
	{
		this.inherited(arguments);
		this.newImageDialogObj && this.newImageDialogObj.destroy();
	},

	createImageBox: function(imageUrlArray, pos, imageName, isGallery)
	{
		for(var num = 0; num < imageUrlArray.length; num++)
		{
			var params = {
				url: imageUrlArray[num],
				pos: pos,
				name: imageName,
				gallery: isGallery
			};
			this.createBox("image", params);
		}
	},

	updateImageBox: function(imageUrlArray, pos, imageName, isGallery)
	{
		var box = this._currentImageBox;
		var pos = {};
		if (box && box.element && box.element.parent == this.slide)
		{
			pos.top = parseFloat(box.mainNode.style.top);
			pos.left = parseFloat(box.mainNode.style.left);
			pos.width = parseFloat(box.mainNode.style.width);
			pos.height = parseFloat(box.mainNode.style.height);
		}

		for(var num = 0; num < imageUrlArray.length; num++)
		{
			var params = {
				url: imageUrlArray[num],
				pos: pos,
				name: imageName,
				gallery: isGallery,
				box: box
			};
			dojo.publish("/box/to/replace", ["image", params]);
		}
	},

	openUpdateImageDialog: function(box)
	{
		this._currentImageBox = box;
		this.openCreateImageDialog(true, dojo.hitch(this, this.updateImageBox));
	},

	openCreateImageDialog: function(forCreate, callback)
	{
		// TODO, the TAB key seems not so OK in new stream.
		var callbackOnOK = forCreate ? dojo.hitch(this, callback) : null;
		if (!forCreate)
			this.deSelectAll();
		if (!this.newImageDialogObj)
		{
			var dlgDiv = document.createElement('div');
			dlgDiv.id = 'presentationDialog';
			document.body.appendChild(dlgDiv);
			var lang = this.slideNode.lang ? this.slideNode.lang : "en";
			var params = {
				resizable: false,
				dockable: false,
				numElements: 40,
				lang: lang,
				uploadUrl: concord.util.uri.getEditAttRootUri(),
				callback: callbackOnOK
			};
			var formParams = {
				"name": "uploadForm",
				"method": "POST",
				"encType": "multipart/form-data"
			};
			this.newImageDialogObj = new concord.widgets.InsertImageDialog(this, this.nls.imageDialog.titleInsert, this.nls.imageDialog.insertImageBtn, null, params, formParams);
		}
		this.newImageDialogObj._callback = callbackOnOK;
		this.newImageDialogObj.show();
	}

});
