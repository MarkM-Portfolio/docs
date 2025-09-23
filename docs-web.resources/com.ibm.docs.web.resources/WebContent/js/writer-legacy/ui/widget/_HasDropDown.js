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

dojo.provide("writer.ui.widget._HasDropDown");
dojo.require("dijit._HasDropDown");

dojo.declare("writer.ui.widget._HasDropDown", [dijit._HasDropDown], {
	closeDropDown: function(/*Boolean*/ focus){
		this.inherited(arguments);
		dijit.removeWaiState(this.domNode, "expanded");
	},
	openDropDown: function(){
		this.inherited(arguments);
		dijit.removeWaiState(this.domNode, "expanded");
	}
});