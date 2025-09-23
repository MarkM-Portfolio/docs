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

/*
 * @concord.util.browser
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.util.browser");

concord.util.browser.getBrowserHeight = function() {
	var height = 0;
	
	if(typeof(window.innerHeight) == 'number') 
		height = window.innerHeight;
	else if(document.documentElement && document.documentElement.clientHeight)
		height = document.documentElement.clientHeight;
	else if(document.body && document.body.clientHeight)
		height = document.body.clientHeight;
	return height;
};

concord.util.browser.getBrowserWidth = function(cache) {
	if(cache && pe.scene.getBrowserWidth())
	    return pe.scene.getBrowserWidth();
	    
	var width = 0;
	
	if(typeof(window.innerWidth) == 'number') 
		width = window.innerWidth;
	else if(document.documentElement && document.documentElement.clientWidth)
		width = document.documentElement.clientWidth;
	else if(document.body && document.body.clientWidth)
		width = document.body.clientWidth;
	//Cache browser width
	pe.scene.setBrowserWidth(width);
	return width;
};

concord.util.browser.getEditorSize = function(editorName) {
    var topOfEditor = 0;
    var tempNode = dojo.byId("cke_top_"+editorName);
    while( tempNode ) {
		topOfEditor += tempNode.offsetTop;
		tempNode = tempNode.offsetParent;
	}
    
	var browserHeight = concord.util.browser.getBrowserHeight()-topOfEditor;
	var browserWidth = concord.util.browser.getBrowserWidth();
    
	return { height:browserHeight, width:browserWidth };
};

concord.util.browser.refreshEditorHeight = function(event) {
	
    // Calculate height
	var editor = event.listenerData;
	if(editor == null)
		editor = event;
	var browserSize = concord.util.browser.getEditorSize(editor.name);
	
	// Resize editor
	editor.resize(browserSize.width, browserSize.height);
	
	// Resize and reposition comments sidebar
	if( pe.scene.resizeSidebarDiv )
	  pe.scene.resizeSidebarDiv();	  
};

concord.util.browser.getElementPositionInDocument = function(node) {
    var data = new Object();
    
    var nodePositionX = 0;
	var nodePositionY = 0;
	
	// from current element treverse up and accumulate the top and left offset
	var tempNode = node.$;
	data.width = tempNode.offsetWidth;
	data.height = tempNode.offsetHeight; 	
	while( tempNode )
	{
		nodePositionX += tempNode.offsetLeft;
		nodePositionY += tempNode.offsetTop;
		tempNode = tempNode.offsetParent;
	}
	
	// calculate the final top and left position
	data.top = nodePositionY;
	data.left = nodePositionX;
	
   	return data;
};

concord.util.browser.getElementPosition = function(editor, node) {
    var lNode;

    // offset adujstments
	var offsetX = 0;
	var offsetY = 0;
	var nodePositionX,nodePositionY;
	// reference to the dom node
	var tempNode = node.$;

	// get the actual width and height
	var data = new Object();
	data.width = tempNode.offsetWidth;
	data.height = tempNode.offsetHeight; 
	
	// from current element treverse up and accumulate the top and left offset
	nodePositionX = node.getDocumentPosition().x;
	nodePositionY = node.getDocumentPosition().y;	

	// calculate the offset for the editor on the page
	var editorOffsetTop = editor.container.$.offsetTop;
	var sidebarContainer = dojo.byId( 'll_sidebar_div');
	var editorOffsetLeft = 0;

	
	var toolbarContainer = document.getElementById( 'cke_top_' + editor.name );
	var scrollPosition = editor.window.getScrollPosition();

	// calculate the final top and left position
	var top = nodePositionY + editorOffsetTop + toolbarContainer.clientHeight - scrollPosition.y + offsetY;
	var left = nodePositionX - scrollPosition.x + offsetX + editorOffsetLeft;
	
	
	data.top = top;
	data.left = left;

	return data;
};

concord.util.browser.isNodeOutOfView = function(editor, node) {
	if(!editor || !node || !MSGUTIL.isBlockInDomTree(node))
		return;
	var border = this.getViewBorder(editor);
	if(window.g_concordInDebugMode )
	{
		console.log( 'show editor view border' );
		var doc = editor.document;
		var	indiDiv = doc.createElement('div');
		indiDiv.setAttribute('id', 'border_div');
		indiDiv.$.style.position = 'absolute';
		indiDiv.$.style.zIndex = '1';
		indiDiv.$.style.left = border.left + "px";
		indiDiv.$.style.top = border.top + "px";
		indiDiv.$.style.width = border.right - border.left + "px";
		indiDiv.$.style.height = border.bottom - border.top + "px";
		indiDiv.$.style.border = '1px solid #00ff00';
		indiDiv.$.style.opacity = '0.3';
		indiDiv.$.style.filter='progid:DXImageTransform.Microsoft.Alpha(Opacity=30)';
		indiDiv.$.style.backgroundColor = '#ffffff';
		doc.getBody().append( indiDiv );	
	}
			
	var pos = this.getElementPosition(editor,node);
	if(pos.left<border.left || pos.top<border.top || pos.left+pos.width>border.right || pos.top+pos.height>border.bottom)
	{
		return true;
	}
	
	return false;
};

concord.util.browser.getViewBorder = function(editor)
{
	var toolbarContainer = document.getElementById( 'cke_top_' + editor.name );
	var menubarContainer = document.getElementById('lotus_editor_menubar');
	var headerContainer = document.getElementById('ifRTC');
	var footerContainer = document.getElementById('ifRTC1');
	var headerHeight = 0;
	var footerHeight = 0;
	if(headerContainer)
		headerHeight = headerContainer.offsetHeight;
	if(footerContainer)
		footerHeight = footerContainer.offsetHeight;
	var borderTop = menubarContainer.offsetTop+menubarContainer.offsetHeight+toolbarContainer.offsetHeight + headerHeight;
	var sidebarContainer = dojo.byId( 'll_sidebar_div');
	var borderLeft = sidebarContainer? sidebarContainer.clientWidth : 0;
	var viewSize = editor.window.getViewPaneSize();
	var borderRight = borderLeft + viewSize.width;
	var borderBottom = borderTop + viewSize.height - footerHeight;
	
	return border = {top:borderTop,right:borderRight,left:borderLeft,bottom:borderBottom};
};

concord.util.browser.getIEVersion = function(editor)
{
	// Use the layout engine version to detect the corresponding version of IE
	var version = 0; 
	if (navigator.userAgent.indexOf("Trident/6") >= 0)
		version = 10;
	else if (navigator.userAgent.indexOf("Trident/5") >= 0)
		version = 9;
	else if (navigator.userAgent.indexOf("Trident/4") >= 0)
		version = 8;
	else if (navigator.userAgent.indexOf("Trident/3.1") >= 0)
		version = 7;
	else if (!navigator.userAgent.indexOf("Trident") < 0)
		version = 6;
	
	return version;
};

concord.util.browser.removeImageIndicator = function(doc, node)
{
	// SyncMsg call this function without Document.
	var div = null;
	if(doc)
		div = doc.getElementById( 'concord_image_indicator_border_div' );
	else if(node)
		div = node.querySelector('#concord_image_indicator_border_div');
	if(!div)
		return;
	var parent = div.getParent();
	if(!parent)
		return;
	parent.removeChild(div);
};

concord.util.browser.hideImageIndicator = function(doc)
{
//	var div = doc.getById( 'concord_image_indicator_border_div' );
//	if(!div)
//		return;
//	
//	div.remove();
};

// ONLY for iOS Native Application that use either UIWEBVIEW or WKWEBVIEW
// IOS native app should add 'docsNative' to its user agent string
var _isMobile = undefined;
concord.util.browser.isMobile = function()
{
	if ( typeof(_isMobile) == 'undefined' || _isMobile == undefined) {
		var userAgent = navigator.userAgent.toLowerCase();
		if(userAgent.indexOf('docsNative') != -1 ){
			_isMobile = true;
		} else {
			_isMobile = false;
		}
	}
	
	var bwkWebView = window.webkit && webkit.messageHandlers && webkit.messageHandlers["iconcord"];
	
	return _isMobile || bwkWebView;
};

// Both Andriod and iOS platforms
// Check whether it is opened by browser  
concord.util.browser.isMobileBrowser = function()
{
		var userAgent = navigator.userAgent.toLowerCase();
		if((userAgent.indexOf('ipad') != -1 && userAgent.indexOf('safari') != -1)
				||(userAgent.indexOf('iphone') != -1)
				||(userAgent.indexOf('android') != -1)){
			return true;
		} else {
			return false;
		}
	// TODO: this is a near term solution - make mobile app act as "not" mobile.
	// longer term solution should be completed when mobile document editor adopts WKWebView.
};
 
concord.util.browser.isIOSBrowser = function()
{
		var userAgent = navigator.userAgent.toLowerCase();
		if((userAgent.indexOf('ipad') != -1 && userAgent.indexOf('safari') != -1)
				||(userAgent.indexOf('iphone') != -1)){
			return true;
		} else {
			return false;
		}	
};

concord.util.browser.contentInIframe = function()
{
	return !(concord.util.browser.isMobile());
};

concord.util.browser.getEditAreaDocument = function()
{
	return (concord.util.browser.contentInIframe() ? dojo.byId("editorFrame").contentDocument : window.document);	
};

concord.util.browser.getEditAreaWindow = function()
{
	return (concord.util.browser.contentInIframe() ? dojo.byId("editorFrame").contentWindow : window.document);	
};

concord.util.browser.mobileVersion = function()
{
	var v1 = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
	if( v1 )
	{
		var len = v1.length ;
		if( v1[len - 1] == undefined )
			len --;
		v1 = v1.slice(1, len)
		return v1.join(".");
	}
	else
		return undefined;
}

concord.util.browser.isMobileVersionGreaterOrEqual = function( version )
{
	var v1 = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
	var v2 = version.split(".");
	for( i =0;i<3;i++)
	{
		var value1 = 0;
		var value2 = 0;
		if( v1.length  > i+1 )
			value1 = parseInt( v1[i + 1], 10);
		if( v2.length > i)
			value2 = parseInt( v2[i], 10);
		
		if( value1 < value2 )
			return false;
		else if( value1 > value2 )
			return true;
	}
	// equal
	return true;
}