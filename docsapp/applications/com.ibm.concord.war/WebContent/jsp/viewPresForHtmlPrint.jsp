<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.spi.beans.IDocumentEntry,
			com.ibm.concord.platform.util.ConcordUtil"%>
	
<%
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	String title = docEntry.getTitle();
	String contextPath = request.getContextPath();
	String staticRootPath = ConcordUtil.getStaticRootPath();
	String locale = request.getLocale().toString().toLowerCase().replaceAll("_", "-");
	String dirAttr = (locale.startsWith("he") || locale.startsWith("iw") || locale.startsWith("ar")) ? " dir='rtl' " : "";
	String helpFileName = "help_16" + (locale.startsWith("ar") ? "_rtl" : "") + ".png";
	String x_ua_value = ConcordUtil.getXUACompatible(request);
%>
<html lang ="<%=locale%>">
<%-- ***************************************************************** --%>
<%--                                                                   --%>
<%-- IBM Confidential                                                  --%>
<%--                                                                   --%>
<%-- IBM Docs Source Materials                                         --%>
<%--                                                                   --%>
<%-- (c) Copyright IBM Corporation 2012. All Rights Reserved.          --%>
<%--                                                                   --%>
<%-- U.S. Government Users Restricted Rights: Use, duplication or      --%>
<%-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. --%>
<%--                                                                   --%>
<%-- ***************************************************************** --%>

<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
	<title>
	<%= title %>
	</title>
	<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/concord/common.css"/>
	<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/js/dijit/themes/oneui30/oneui30.css"/>
	<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/presentations/htmlprint.css"/>
	<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/presentations/documentContent.css"/>
	<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/presentations/liststyles.css"/>
	<script>
		var g_locale = window.top.opener.g_locale; 
	</script>
	<script type="text/javascript" src="<%=contextPath + staticRootPath%>/js/dojo/dojo.js"></script>
	<script>
		
		var djConfig = {
			baseUrl: "./",
			parseOnLoad: true,
			isDebug: false,
			locale: g_locale
			};
		
		dojo.locale = g_locale;
	    dojo.require("dijit.form.Select");
	    dojo.requireLocalization("concord.widgets", "toolbar");
	    
	    var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
	    var printView = null;
	    var contentSelect = null;
	    var contentSelectConn = null;
	    var numImagesLoaded = 0;
	    var allImagesLoaded = false;
	    var showSlidesTimeout = null;
		
		function createContentSelectBox() {         	
         	var selectBox =  new dijit.form.Select({
    			id: "presHtmlPrintSelect",
    			options: [
      				{ label: nls.slides, value: 'slides', selected: true },
      				{ label: nls.slidesWithNotes, value: 'slidesWithNotes' }
    			]
  			});
			<%
				if (dirAttr.length() > 1){
			%>			
		dojo.mixin(selectBox,{
			_getMenuItemForOptionCallOrig: dijit.form.Select.prototype._getMenuItemForOption,
			_getMenuItemForOption: function(option){
				var w = this._getMenuItemForOptionCallOrig(option);
				w.containerNode.align = 'right';
				w.containerNode.dir = 'rtl';
				return w;
			}
		});
			 <%
			 	}
			  %>			
			return selectBox;
		};
		
		function dummyFunction(param) {
			printView.dummyFunction(param);
		};
		
		function imageLoaded() {
			// track the number of loaded images and enable the toolbar when there are no missing ones
			numImagesLoaded++;
			if (printView && numImagesLoaded >= printView.numImages) {
				printView.showToolbar();
				allImagesLoaded = true;
			}
			
			// we need to call a dummy function in order for IE to execute the onload handler
			dummyFunction("param");
			//console.log('loaded '+numImagesLoaded+' of '+printView.numImages+'images');
		};
		
		function changeContent() {
			// Hide or show the speaker notes and header/footer
			if (contentSelect.value == 'slides')
				printView.switchToSlideView();
			else if (contentSelect.value == 'slidesWithNotes')
				printView.switchToNotesView();
				
			// need to reset the id because dijit Select gets rid of it
			// and we need this for wai-aria
            var selectLabels = dojo.query('.dijitSelectLabel', contentSelect.domNode);
        	if (selectLabels && selectLabels.length > 0) {
        		dojo.attr(selectLabels[0], 'id', 'printlayoutoption');
        	}
				
		};
			
		function startLaunchingPrintView() {
			//16011: [GVT]The JPN backslash ¥ (U+005C) is not shown correctlly after start slide show.
			window.top.opener.concord.util.HtmlContent.addI18nClassToBody(document.body);
		
			// Display a message while slides are being loaded
			var loadingMsgDiv = document.getElementById('presHtmlPrintLoadingMsg');
			loadingMsgDiv.innerHTML = nls.preparingSlides;
			
			// Load the slides
			setTimeout( dojo.hitch(this, function() {
    			launchPrintView();
			}), 100);
			
			// As a fallback enable the toolbar in 15 seconds even if it is not certain
			// that all images have loaded
			showSlidesTimeout = setTimeout( dojo.hitch(this, function() {
    			if (!allImagesLoaded) {
    				printView.showToolbar();
    				console.log('Slide contents failed to load in 15 seconds.');
    			}
			}), 15000);
		};
			
		function launchPrintView() {
			// Add page content select box
        	var contentSelectDiv = document.getElementById('presHtmlPrintContentSelectDiv');
        	contentSelect = createContentSelectBox();
        	contentSelectDiv.appendChild(contentSelect.domNode);
        	
        	// Set up wai/aria
        	dojo.attr(contentSelect.domNode, 'aria-label', nls.printLayoutOptionLabel);
        	dojo.attr(contentSelect.domNode, 'aria-describedby', 'printlayoutoption');
        	var selectLabels = dojo.query('.dijitSelectLabel', contentSelect.domNode);
        	if (selectLabels && selectLabels.length > 0) {
        		dojo.attr(selectLabels[0], 'id', 'printlayoutoption');
        	}
        	
        	
			// Create the viewPresForHtmlPrint widget in this window, it will load the slides and configure button events.
			numLoadedImages = 0;
			printView = window.top.opener.openPresHtmlPrintWindow(this);
			if(printView.numImages == 0){
				clearTimeout(showSlidesTimeout);
				printView.showToolbar();
				allImagesLoaded = true;
			}
			
			// Combobox events have to be handled in scope of this script
			contentSelectConn = dojo.connect(contentSelect, 'onChange', dojo.hitch(this, "changeContent"));
		};

		function closePrintView() {
			dojo.disconnect(contentSelectConn);
		};
	</script>
</head>
<body class="oneui30 lotusui30" onload = "startLaunchingPrintView()" onunload = "closePrintView()" style="background:#FFFFFF;" aria-busy="true">
<div id="presHtmlPrintLoadingMsg" class="omitFromHtmlPrint presHtmlPrintLoadingMsg">...</div>
<div id="presHtmlPrintToolbar" class="omitFromHtmlPrint presHtmlPrintToolbarSlidesLoading" <%=dirAttr%> >
	<div id="presHtmlPrintButton"><img style="cursor: inherit;" src="<%=contextPath + staticRootPath%>/images/print_16.png"/></div>
	<div id="presHtmlPrintContentSelectDiv"></div>
	<div id="presHtmlPrintHelpButton"><img style="cursor: inherit;" src="<%=contextPath + staticRootPath%>/images/<%=helpFileName%>"/></div>	
</div>
</body>
</html>
