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

dojo.provide("pres.editor.BoxMouseMove");
dojo.require("pres.utils.tableResizeUtil");

dojo.declare("pres.editor.BoxMouseMove", null, {

	onMouseMove: function(e)
	{
		var div = this.domNode;
		if(e.touches && e.touches.length != 1) {
			this._mouseMoved = false;
			return;
		}
		if (pe.scene.locker.isLockedByOther(this.element.id))
		{
			div.style.cursor = "default";
			return;
		}
		
		var pos = dojo.coords(div);
		var posX = e.clientX;
		var posY = e.clientY;
		var border = pres.constants.BOX_BORDER;
		
		var sender = e.target;
		var posInResizer = sender && dojo.hasClass(sender, "resize-handler");
		var posInBorder = sender && (sender.className && dojo.isString(sender.className) && (sender.className == "resize-wrapper" || sender.className.indexOf("resize-box-out") > -1)) || ((sender == this.domNode || sender == this.domNode.firstElementChild) && dojo.hasClass(div.firstElementChild, "layoutClassSS"));
		var posOnText = sender && sender.tagName.toLowerCase() == "span";
		if (pe.scene.slideEditor._draged)
		{
			div.style.cursor = "default";
		}
		else if (posInResizer || posInBorder || this.element.family == "graphic")
		{
			div.style.cursor = "move";
		}
		else if (this.status == 2)
		{
			div.style.cursor = "text";
		}
		else
		{
			if (posOnText || (this.element.family != "graphic" && dojo.hasClass(div.firstElementChild, "layoutClassSS")))
				div.style.cursor = "text";
			else
				div.style.cursor = "move";
		}
		
		if(this.status == 2)
			this.showCoEditTooltip(e);
		if(pe.scene.hub.formatpainterStyles) {
			div.style.cursor = "url('" + window.contextPath + window.staticRootPath + "/images/painter32.cur'),auto";
		}
		this._mouseMoved = true;
		
	}

});