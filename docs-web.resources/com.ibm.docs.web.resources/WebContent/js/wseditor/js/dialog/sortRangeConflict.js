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

dojo.provide("websheet.dialog.sortRangeConflict");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet.dialog","sortRangeConflict");

dojo.declare("websheet.dialog.sortRangeConflict", [concord.widgets.concordDialog], {	
	
	
	constructor: function() {
		var title = dojo.i18n.getLocalization("websheet.dialog","sortRangeConflict").STR_TITLE_SORTING_CONFLICT;
		this.dialog.attr("title", title);
	},
	setDialogID: function() {
		// Overridden
		this.dialogId ="S_d_sortRangeConflict";
		return;
	},
	createContent: function (contentDiv) {
		var doc = dojo.doc;
		var questionDiv = dojo.create('div', null, contentDiv);
		var textNode = doc.createTextNode(dojo.i18n.getLocalization("websheet.dialog","sortRangeConflict").STR_SORT_RANGE_CONFLICT_WITH_CELL_EDITING);
		questionDiv.appendChild(textNode);
		dojo.addClass (questionDiv, "concordDialogBold");
	},
	
	onOk: function (editor) {
		if( this.params.callback ){
			if(editor._tmpSortRangeData){
				var rangeSorting = editor._tmpSortRangeData.rangeSorting;
				var sortData = editor._tmpSortRangeData.sortData;
				this.params.callback(rangeSorting,sortData);
				editor._tmpSortRangeData = undefined;
			}
		}
		return true;
	},
	hide: function(){
		this._destroy();
	},
	onCancel: function (editor) {
		editor._tmpSortRangeData = undefined;
		return true;
	}

});