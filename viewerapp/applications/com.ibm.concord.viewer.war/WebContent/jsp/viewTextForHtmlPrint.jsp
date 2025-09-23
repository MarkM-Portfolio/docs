<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
<%@page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<%@page import="com.ibm.concord.viewer.spi.beans.IDocumentEntry,
				com.ibm.concord.viewer.platform.util.ViewerUtil"%>
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
	String locale = request.getLocale().toString().toLowerCase().replaceAll("_", "-");
  	String staticResPath =  ViewerUtil.getStaticRootPath();
  	String snapshotId = request.getAttribute("snapshotId") == null ? null : request.getAttribute("snapshotId").toString();
  	String version=String.valueOf(docEntry.getModified().getTimeInMillis());
%>
<html lang ="<%=locale%>">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><%=title%></title>
<script type="text/javascript" src="<%=staticResPath%>/js/dojo/dojo.js" djConfig="parseOnLoad: true"></script>

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

<link type="text/css" rel="stylesheet" href="<%=version%>/style.css?sid=<%=snapshotId%>" />
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/html/js/document/ckeditor/contents.css"/>
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/html/js/document/ckplugins/concordtemplates/templates/css/concordstyles.css" type="text/css" />
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/html/js/document/ckplugins/concordtemplates/templates/css/print.css" type="text/css" />
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/html/js/dijit/themes/oneui30/oneui30.css"/>
<style type="text/css">
img.cke_flash {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/flash/images/placeholder.png");
    background-position: center center;
    background-repeat: no-repeat;
    border: 1px solid #A9A9A9;
    height: 80px;
    width: 80px;
}
form {
    border: 1px dotted #FF0000;
    padding: 2px;
}

.cke_show_blocks p, .cke_show_blocks div, .cke_show_blocks pre, .cke_show_blocks address, .cke_show_blocks blockquote, .cke_show_blocks h1, .cke_show_blocks h2, .cke_show_blocks h3, .cke_show_blocks h4, .cke_show_blocks h5, .cke_show_blocks h6 {
    background-repeat: no-repeat;
    border: 1px dotted gray;
    padding-left: 8px;
    padding-top: 8px;
}
.cke_show_blocks p {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_p.png");
}
.cke_show_blocks div {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_div.png");
}
.cke_show_blocks pre {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_pre.png");
}
.cke_show_blocks address {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_address.png");
}
.cke_show_blocks blockquote {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_blockquote.png");
}
.cke_show_blocks h1 {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_h1.png");
}
.cke_show_blocks h2 {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_h2.png");
}
.cke_show_blocks h3 {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_h3.png");
}
.cke_show_blocks h4 {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_h4.png");
}
.cke_show_blocks h5 {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_h5.png");
}
.cke_show_blocks h6 {
    background-image: url("<%=staticResPath%>/js/html/js/document/ckeditor/_source/plugins/showblocks/images/block_h6.png");
}
</style>
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/html/styles/css/document/htmlprint.css"/>

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
<link rel="SHORTCUT ICON" href="<%=staticResPath%>/js/html/images/ibmdocs_product_16.ico" />
</head>
<body class="" onload = "launchPrintView()" onunload = "closePrintView()" style="background:#FFFFFF;margin:0pt;padding:0pt;">
<div id="textHtmlPrintToolbar" class="oneui30 lotusui30 omitFromHtmlPrint">
	<div id="textHtmlPrintButton"><img tabindex="1" id="print_btn" alt="Print" src="<%=staticResPath%>/js/html/images/print_16.png"/></div>
	<div id="textHtmlPrintHelpButton"><img tabindex="2" id="help_btn" alt="Help button of Print" src="<%=staticResPath%>/js/html/images/help_16.png"/></div>
</div>

<div id="viewbody" class="textHtmlPrintFrame" role="application" aria-label="text print">
	<div id="viewhtml" class="textHtmlPrintDiv" style="background-color: #FFFFFF;width: 6.9252in;">
	</div>
</div>
</body>
</html>