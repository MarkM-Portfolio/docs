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

dojo.provide("concord.chart.widget.DropDownButton");

dojo.require("dijit.form.DropDownButton");
dojo.declare("concord.chart.widget.DropDownButton", [dijit.form.DropDownButton], {
	closeDropDown: function(/*Boolean*/ focus){
		this.inherited(arguments);
		dijit.removeWaiState(this.domNode, "expanded");
		(!this._opened)&& dijit.setWaiState(this.focusNode, "expanded", "false");
		dojo.removeClass(this.domNode, "dropDownExpanded");
	},
	
	openDropDown: function()
	{
		this.inherited(arguments);
		dijit.removeWaiState(this.domNode, "expanded");
		this._opened && dijit.setWaiState(this.focusNode, "expanded", "true");
		dojo.removeClass(this.domNode, "dropDownExpanded");
		this._opened && dojo.addClass(this.domNode, "dropDownExpanded");
	}
});