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

dojo.provide("websheet.clipboard.CutMixin");
dojo.declare("websheet.clipboard.CutMixin", null,
{
    _cutting: false,
    
    cut: function(event) {
    	this._cutting = true;
    	this.setSelect(true);
    	this.copy(event, true);
    }

});