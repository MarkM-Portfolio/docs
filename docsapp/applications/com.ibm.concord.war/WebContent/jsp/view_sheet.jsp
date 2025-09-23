<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
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

<!--
 * @view page mode
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
--><%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"
	import="com.ibm.concord.spreadsheet.SpreadsheetConfig,
	        com.ibm.concord.platform.util.JSONUtil,
	        com.ibm.concord.services.rest.handlers.PeopleHandler,
	        com.ibm.json.java.JSONArray" 
%>
<html>
<head>
<%@include file="app_view.jsp" %>
<title><%=title %></title>
<script type="text/javascript" src="<%=contextPath%>/js/antlr/antlr3-all-min.js"></script>
<script type="text/javascript" src="<%=contextPath%>/js/parser/LexerParser.js"></script>
<script type="text/javascript" src="<%=contextPath %>/js/concord/concord_sheet_view.js"></script>
<link rel="SHORTCUT ICON" href="<%= contextPath %>/images/ibmdocs_product_16.ico" />
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/styles/css/websheet/sheet_view.css" />
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/js/wseditor/css/concord_sheet.css" />
<%
int maxSheetRows = SpreadsheetConfig.getMaxSheetRows();
String entitleStr = "";
Object entitleObj = request.getAttribute("IBMDocs_Entitlements");
if (entitleObj instanceof JSONArray)
{
	JSONArray entitleArray = (JSONArray) entitleObj;
	entitleStr = entitleArray.toString();
}
//can't get attribute IBMDocs_Entitlements. Haven't find the reason till now, fake this string.
entitleStr = "[{\"booleanValue\":true,\"name\":\"coedit\"}, {\"booleanValue\":true,\"name\":\"assignment\"}]";
%>
<script type="text/javascript">
	window.g_maxSheetRows = "<%= maxSheetRows %>";
	var g_authUser = JSON.parse('<%= JSONUtil.escape(PeopleHandler.parseRequestUser(request).toString())%>');
	var g_EntitlementsStr = '<%= entitleStr %>';
</script>
</head>
<body class="oneui30 lotusui30" onresize="resize()">
<div id="wrapper">
	<jsp:include page="banner.jsp">
		<jsp:param value="<%=contextPath %>" name="contextPath" />
		<jsp:param value="<%=title %>" name="title" />
	</jsp:include>
	<jsp:include page="view_sheet_menu.html"></jsp:include>
	<jsp:include page="view_sheet_content.jsp">
		<jsp:param value="<%=cacheDir %>" name="cacheDir" />
	</jsp:include>
</div>

<div id="message"><img id="messageImg" src="" /><span id="messageText"></span><div class="clear"></div></div>
</body>
</html>