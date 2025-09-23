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

dojo.provide("pres.editor.NotesBox");
dojo.require("pres.editor.Box");

dojo.declare("pres.editor.NotesBox", [pres.editor.Box], {

	onBoxSelected: function(box)
	{
		if (box != this)
			this.exitSelection();
	},

	onBoxEditing: function(box)
	{
		if (box != this)
			this.exitSelection();
	},

	onClick: function(e)
	{
		this.clickOnContent(e);
	},

	clickOnContent: function(e)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		if (pe.scene.locker.isLockedByOther(this.element.id))
			return;
		if (this.status != this.STATUS_EDITING)
		{
			this.enterEdit(this.editor.getRange());
		}
	},

	onKey: function(e)
	{
	},

	showHandles: function()
	{
	},

	hideHandles: function()
	{
	},

	onMouseMove: function(e)
	{
		var div = this.domNode;
		if (pe.scene.locker.isLockedByOther(this.element.id))
		{
			div.style.cursor = "default";
			return;
		}
		else
		{
			div.style.cursor = "text";
		}
		
		if(this.status == 2)
			this.showCoEditTooltip(e);
		if(pe.scene.hub.formatpainterStyles) {
			div.style.cursor = "url('" + window.contextPath + window.staticRootPath + "/images/painter32.cur'),auto";
		}
	},

	clickOnBorder: function(e)
	{
	}

});