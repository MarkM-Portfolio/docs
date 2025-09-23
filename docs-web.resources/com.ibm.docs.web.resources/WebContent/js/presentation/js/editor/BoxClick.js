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

dojo.provide("pres.editor.BoxClick");

dojo.declare("pres.editor.BoxClick", null, {
	
	onClick: function(e)
	{
		if (pe.scene.locker.isLockedByOther(this.element.id))
			return;
		var isCtrl = e.ctrlKey || (dojo.isMac && e.metaKey);
		if (this.status > 0 && !isCtrl && !this.getParent()._mouseMoved)
		{
			this.checkSelection(e);

			if (this.status >= 1)
			{
				var family = this.element.family;
				if (dojo.hasClass(this.mainNode, "layoutClass") && family == "graphic")
				{
					var slideEditor = this.getParent();
					slideEditor.openUpdateImageDialog(this);
				}
			}
		}
		dojo.stopEvent(e);
	},

	cleanupLayoutImage: function(imageUrlArray, pos, imageName, isGallery)
	{
		var pos = {};
		pos.top = parseFloat(this.mainNode.style.top);
		pos.left = parseFloat(this.mainNode.style.left);
		pos.width = parseFloat(this.mainNode.style.width);
		pos.height = parseFloat(this.mainNode.style.height);
		this.getParent().createImageBox(imageUrlArray, pos, imageName, isGallery);
	}
	
});