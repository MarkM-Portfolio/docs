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

dojo.provide("websheet.AutoFilter.FilterButton");
dojo.require("websheet.AutoFilter.FilterMenu");
dojo.require("websheet.widget.DropDownButton");

dojo.declare('websheet.AutoFilter.FilterButton', [websheet.widget.DropDownButton],{
	index: 0, //column index	
	
	constructor: function()
	{
		this.showLabel = false;
		this._stopClickEvents = true;
		this._stopMouseDownEvents = true;
		this.toolbar = pe.lotusEditor.getToolbar();
	},
	
	getFilterMenu: function()
	{
		return this.editor.getAutoFilterHdl().getFilterMenu();
	},
	//For ACC
	closeDropDown: function(/*Boolean*/ focus){
		this.inherited(arguments);
		if (this.domNode) {
			dijit.removeWaiState(this.domNode, "expanded");
			dojo.removeClass(this.domNode, "dropDownExpanded");
		}
		(!this._opened && this.focusNode)&& dijit.setWaiState(this.focusNode, "expanded", "false");
	},
	
	
	//For ACC
	openDropDown: function(timeout)
	{
		if(this.editor.isCurrentSheetProtected())
			return;
		
		if(timeout)
		{
			this.inherited(arguments);
			dijit.removeWaiState(this.domNode, "expanded");
			this._opened && dijit.setWaiState(this.focusNode, "expanded", "true");
			dojo.removeClass(this.domNode, "dropDownExpanded");
			this._opened && dojo.addClass(this.domNode, "dropDownExpanded");
			
			//here to make the filterMenu has class dijitMenuPopup
			dojo.removeClass(this.dropDown._popupWrapper,"Popup");
			dojo.addClass(this.dropDown._popupWrapper,"dijitMenuPopup");
			
		}
		else
		{
			this.dropDown.workingLabel.style.display = "";
			setTimeout(dojo.hitch(this,"openDropDown", true),200);
		}
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		dojo.addClass(this.domNode,"filterHeader");
		
		this.dropDown = this.getFilterMenu();//new websheet.AutoFilter.FilterMenu();
		//
		var task = this.editor.getTaskMan();
		if(!this.dropDown._appending && !this.dropDown._destroyed)
		{
			this.dropDown._appending = task.addTask(this.dropDown, "_cachingItems", [], task.Priority.Normal);
		}
		//50806: [A11Y][HTML][Viewer] Pressing Tab should not focus on filter buttons
		dojo.attr(this.focusNode, 'tabindex', '-1');
	}
	
});