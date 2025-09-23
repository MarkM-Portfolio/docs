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

dojo.provide("viewer.util.browser");

viewer.util.browser.getBrowserHeight = function() {
	var height = 0;
	
	if(typeof(window.innerHeight) == 'number') 
		height = window.innerHeight;
	else if(document.documentElement && document.documentElement.clientHeight)
		height = document.documentElement.clientHeight;
	else if(document.body && document.body.clientHeight)
		height = document.body.clientHeight;

	return height;
};

viewer.util.browser.getBrowserWidth = function() {
	var width = 0;
	
	if(typeof(window.innerWidth) == 'number') 
		width = window.innerWidth;
	else if(document.documentElement && document.documentElement.clientWidth)
		width = document.documentElement.clientWidth;
	else if(document.body && document.body.clientWidth)
		width = document.body.clientWidth;
	
	return width;
};

viewer.util.browser.getEditorSize = function(editorName) {
    var topOfEditor = 0;
    var tempNode = dojo.byId("cke_top_"+editorName);
    while( tempNode ) {
		topOfEditor += tempNode.offsetTop;
		tempNode = tempNode.offsetParent;
	}
    
	var browserHeight = viewer.util.browser.getBrowserHeight()-topOfEditor;
	var browserWidth = viewer.util.browser.getBrowserWidth();
    
	return { height:browserHeight, width:browserWidth };
};

viewer.util.browser.getElementPosition = function(node, offsetX, offsetY) {
    var data = new Object();
    
    var nodePositionX = 0;
	var nodePositionY = 0;
	
	// from current element treverse up and accumulate the top and left offset
	var tempNode = node;
	while( tempNode )
	{
		nodePositionX += tempNode.offsetLeft;
		nodePositionY += tempNode.offsetTop;
		tempNode = tempNode.offsetParent;
	}
	
	// calculate the final top and left position
	data.top = nodePositionY + offsetY;
	data.left = nodePositionX + offsetX;
	
   	return data;
};
