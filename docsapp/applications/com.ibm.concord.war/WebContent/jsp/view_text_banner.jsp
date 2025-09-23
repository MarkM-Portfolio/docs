<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %><%
	request.setCharacterEncoding("utf-8");
	String contextPath = request.getParameter("contextPath");
	String title = request.getParameter("title");
%>
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

<link rel="stylesheet" type="text/css" href="<%=contextPath %>/js/dojo/resources/dojo.css">
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/styles/css/base/core.css">
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/styles/css/defaultTheme/defaultTheme.css">
<style type="text/css">
	.smartTable caption, th{
		text-align:center;
	}
</style>
<div id="webPreviewBanner" class="lotusTitleBar2">
	<div class="lotusRightCorner"><div class="lotusInner"> 
		<div class="lotusTitleBarContent">
			<h2 id="fileName" class="lotusHeading" title="<%=title %>"><img class="lotusIcon" src="/concord/images/ibmdocs_wordprocessing_32.png" /><span class="lotusText"><strong><%=title %></strong></span></h2></div>
		</div>
	</div>
</div>
