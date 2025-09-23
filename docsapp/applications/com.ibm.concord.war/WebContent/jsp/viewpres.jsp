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
-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.spi.beans.IDocumentEntry"%>
	
<%
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	String title = docEntry.getTitle();
	String htmlUri = request.getContextPath() + "/app/pres/"+docEntry.getRepository()+"/"+docEntry.getDocId()+"/view";
 %>
<html>
<head>
<title>
<%= title %>
</title>
<script>

		function init() {
			var htmlUrl = "<%= htmlUri %>";
			window.location = htmlUrl;
		}
		window.onload = init; 
	</script>
</head>
<body >
</body>
</html>