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

dojo.provide("concord.chart.widget.TabContainer");

dojo.require("dijit.layout.TabContainer");
dojo.declare("concord.chart.widget.TabContainer", [dijit.layout.TabContainer], {

	 selectChild : function(/* dijit._Widget|String */page, /* Boolean */animate) {
		// summary:
		// Show the given widget (which must be one of my children)
		// page:
		// Reference to child widget or id of child widget
		page = dijit.byId(page);
		if(page.disabled)
			return false;
		
		var ret = this.inherited(arguments);
		this._removeInvalidState();
		return ret;
	},
	
	/**
	 * For RPT compliance, dojo tab role do not have aria-pressed state(this is for buttons).
	 */
	_removeInvalidState: function(){
		for( tabId in this.tablist.pane2button){
			var tab = this.tablist.pane2button[tabId];
			tab && tab.focusNode && dijit.removeWaiState(tab.focusNode, "pressed");
		}
	}
});