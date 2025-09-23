/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("viewer.widgets.ExBorderContainer");
dojo.require("dijit.layout.BorderContainer");

dojo.declare("viewer.widgets.ExBorderContainer", [dijit.layout.BorderContainer], 
{
	//For 9477. IE can't receive resize event when user zoom the page, this is a work around.
	//After user change the browser window size, the resize function will set the width attribute as a fixed value.
	//Then this fixed value will hinder resize on IE. Using the same method with 4411, we clear the style width after the header is resized.
	resize: function(newSize, currentSize){
		this.inherited(arguments);
		var headerBorderContainer = dojo.byId('headerBorderContainer');
		dojo.style(headerBorderContainer, 'width', '');
	}
});