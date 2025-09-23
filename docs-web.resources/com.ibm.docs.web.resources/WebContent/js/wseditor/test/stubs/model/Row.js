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

dojo.provide("websheet.test.stubs.model.Row");
dojo.provide("websheet.model.Row");

dojo.declare("websheet.model.Row",websheet.functions.Row,{
	_doc: null,

	constructor: function(parent) {
		this._parent = parent;
		this._valueCells = [];
		this._doc = parent._parent;
	}
});