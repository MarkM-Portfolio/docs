<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
<%@page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<%@page import="com.ibm.concord.spi.beans.IDocumentEntry,
				com.ibm.concord.platform.util.ConcordUtil"%>
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
    String urlBase = request.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri();
    String base = urlBase + "/edit";
	String contextPath = request.getContextPath();
	String staticRootPath = ConcordUtil.getStaticRootPath();
	String locale = request.getLocale().toString().toLowerCase().replaceAll("_", "-");
	String dirAttr = (locale.startsWith("he") || locale.startsWith("iw") || locale.startsWith("ar")) ? " dir='rtl' " : "";
	String helpFileName = "help_16" + (locale.startsWith("ar") ? "_rtl" : "") + ".png";
	String x_ua_value = ConcordUtil.getXUACompatible(request);	
%>
<html lang ="<%=locale%>">
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><%=title%></title>
<script type="text/javascript" src="<%=contextPath + staticRootPath%>/js/dojo/dojo.js" djConfig="parseOnLoad: true"></script>

<script type="text/javascript">
	g_baseUrl = "<%=base %>";
	g_locale = "<%=locale %>";
	contextPath = "<%=contextPath %>";
	djConfig = {
		locale: "<%= locale %>"
	};
	dojo.locale = "<%= locale %>";
	g_Repository = "<%=docEntry.getRepository()%>";
	g_DocUri = "<%=docEntry.getDocUri()%>";

</script>

<link type="text/css" rel="stylesheet" href="style.css" />
<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/writer/writer.css"/>
<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/js/dijit/themes/oneui30/oneui30.css"/>
<style type="text/css">
.paging>div{
	border: none !important;
}
.carriageNode{
	visibility:hidden
} 
.headerTitle{
	visibility:hidden
} 
.header{
	visibility:hidden
} 
.footer{
	visibility:hidden
} 
.footerTitle{
	visibility:hidden
} 
@media print{
	@page {
		margin: 0
	}
	.textHtmlPrintPage {
		border-bottom: none
	}
	.paging {
		-webkit-print-color-adjust: exact;
		color-adjust: exact;
	}
}
form {
    border: 1px dotted #FF0000;
    padding: 2px;
}
.writer .comments{
	border: none !important; 
	background: none !important;
}
.anchorIndicator {
	visibility:hidden;
}
#_ImgResizeDiv {
	visibility:hidden;
}
.tableResizer {
	visibility:hidden;
}
.cellSelection {
	visibility:hidden;
}
.textSelection {
	visibility:hidden;
}
.delete-triangle {
	visibility:hidden;
}
.Toc {
	border: none !important;
}
.Toc .hasLink {
	background: none !important
}
</style>
<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/document/htmlprint.css"/>

<script type="text/javascript">
		
   	function launchPrintView(path) {
		window.top.opener.openTextHtmlPrintWindow(this);
	}

	function showHelp() {
		//
	}

	function closePrintView() {
		//
	}
</script>
<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath%>/images/ibmdocs_product_16.ico" />
</head>
<body class="" onload = "launchPrintView()" onunload = "closePrintView()" style="background:#FFFFFF;margin:0pt;padding:0pt;">
<div id="textHtmlPrintToolbar" class="oneui30 lotusui30 omitFromHtmlPrint" <%=dirAttr%>>
	<div id="textHtmlPrintButton"><img tabindex="1" id="print_btn" alt="Print" src="<%=contextPath + staticRootPath%>/images/print_16.png"/></div>
	<%--  <div id="textHtmlPrintHelpButton"><img tabindex="2" id="help_btn" alt="Help button of Print" src="<%=contextPath + staticRootPath%>/images/<%=helpFileName%>"/></div>  --%>
</div>

<div id="viewbody" class="textHtmlPrintFrame" role="application" aria-label="text print">
	<div id="viewhtml" class="textHtmlPrintDiv" style="background-color: #FFFFFF;width: 6.9252in;">
	</div>
</div>
</body>
</html>