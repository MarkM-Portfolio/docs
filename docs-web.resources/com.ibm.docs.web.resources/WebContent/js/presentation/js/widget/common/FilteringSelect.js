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

dojo.provide("pres.widget.common.FilteringSelect");
dojo.require("dijit.form.FilteringSelect");

dojo.declare("pres.widget.common.FilteringSelect", dijit.form.FilteringSelect, {
	
	_startSearch: function(/*String*/ key){
		// summary:
		//		Starts a search for elements matching key (key=="" means to return all items),
		//		and calls _openResultList() when the search completes, to display the results.
		if(!this.dropDown){
			var popupId = this.id + "_popup",
				dropDownConstructor = dojo.isString(this.dropDownClass) ?
					dojo.getObject(this.dropDownClass, false) : this.dropDownClass;
			this.dropDown = new dropDownConstructor({
				onChange: dojo.hitch(this, this._selectOption),
				ownerDocument: this.ownerDocument,
				_focusManager: this._focusManager,
				id: popupId,
				dir: this.dir,
				textDir: this.textDir
			});
		}
		
		this._lastInput = key; // Store exactly what was entered by the user.
		dijit.form._SearchMixin.prototype._startSearch.apply(this, arguments);
	}
	
});