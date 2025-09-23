<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" 
        import="com.ibm.concord.platform.util.ConcordUtil, 
                com.ibm.concord.spi.beans.IDocumentEntry"%>
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

<%
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	String title = docEntry.getTitle();
	String contextPath = request.getContextPath();	
	String staticRootPath = ConcordUtil.getStaticRootPath();
	String x_ua_value = ConcordUtil.getXUACompatible(request);
%>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
	<title>
	<%= title %>
	</title>
	<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/concord/common.css"/>
	<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/js/dijit/themes/oneui30/oneui30.css" />
	<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/presentations/presshow.css"/>
	<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/concord/editor.css"/>
	<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/presentations/liststyles.css"/>
	
<%
	// D15968 Disable liststyles_ie8_slideshow.css, liststyles.css is now unified for all browsers and view modes. The check for 
	// for IE8 is left in case we need it for something else.
	//String userAgent = request.getHeader( "User-Agent" );
	//if (userAgent != null && userAgent.indexOf( "MSIE 8" ) != -1) {
	// 
	//}
%>

	
	<script>
		var ssObj;
		function launchSlideShow()
		{
			window.top.opener.g_slideShow(this);		
		}

		function windowresize()
		{
			if (typeof ssObj!="undefined"){
				ssObj.setDimensions();
			}
		}

		function closeSlideShow()
		{
			window.top.opener.closeSlideShow();
		}
				
		window.onresize = windowresize;		
	</script>
</head>
<body onload = "launchSlideShow()" onunload = "closeSlideShow()" class="oneui30 concord">
<div id="slideShowContainer"></div>
</body>
</html>
