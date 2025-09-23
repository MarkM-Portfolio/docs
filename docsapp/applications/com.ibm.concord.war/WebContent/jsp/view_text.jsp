<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><!--  
 * @view page mode
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
--><%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<html>
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
<%@include file="app_view.jsp" %>
<title><%=title %></title>
<!-- 
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/styles/css/smartTables/smartTablesExhibit.css">

 -->
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/styles/css/document/view_document.css">

<link rel="stylesheet" type="text/css" href="<%=contextPath %>/js/document/ckplugins/concordtemplates/templates/css/concordstyles.css" type="text/css" >
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/js/document/ckplugins/concordtemplates/templates/css/print.css" type="text/css" >

<link rel="stylesheet" type="text/css" href="<%= contextPath %>/js/dijit/themes/oneui30/oneui30.css">
<link rel="stylesheet" type="text/css" href="<%=contextPath %>/js/document/ckeditor/contents.css">
<style type="text/css">
img.cke_flash {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/flash/images/placeholder.png");
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
img.cke_anchor {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/link/images/anchor.gif");
    background-position: center center;
    background-repeat: no-repeat;
    border: 1px solid #A9A9A9;
    height: 18px;
    width: 18px;
    display: none;
}
a.cke_anchor {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/link/images/anchor.gif");
    background-position: 0 center;
    background-repeat: no-repeat;
    border: 1px solid #A9A9A9;
    padding-left: 18px;
}
hr.cke_pagebreak {
    background: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/pagebreak/images/pagebreak.gif") no-repeat scroll center center transparent;
    border-bottom: 1px dotted #999999;
    border-top: 1px dotted #999999;
    clear: both;
    display: block;
    float: none;
    height: 7px;
    width: 100%;
    display: none;
}
.cke_show_blocks p, .cke_show_blocks div, .cke_show_blocks pre, .cke_show_blocks address, .cke_show_blocks blockquote, .cke_show_blocks h1, .cke_show_blocks h2, .cke_show_blocks h3, .cke_show_blocks h4, .cke_show_blocks h5, .cke_show_blocks h6 {
    background-repeat: no-repeat;
    border: 1px dotted gray;
    padding-left: 8px;
    padding-top: 8px;
}
.cke_show_blocks p {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_p.png");
}
.cke_show_blocks div {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_div.png");
}
.cke_show_blocks pre {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_pre.png");
}
.cke_show_blocks address {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_address.png");
}
.cke_show_blocks blockquote {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_blockquote.png");
}
.cke_show_blocks h1 {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_h1.png");
}
.cke_show_blocks h2 {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_h2.png");
}
.cke_show_blocks h3 {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_h3.png");
}
.cke_show_blocks h4 {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_h4.png");
}
.cke_show_blocks h5 {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_h5.png");
}
.cke_show_blocks h6 {
    background-image: url("<%=contextPath %>/js/document/ckeditor/_source/plugins/showblocks/images/block_h6.png");
}
</style>

<script type="text/javascript" src="<%=contextPath %>/js/concord/widgets/viewTextForHtmlPrint.js"></script>
<script type="text/javascript" src="<%=contextPath %>/js/concord/widgets/nls/viewTextForHtmlPrint.js"></script>
<script type="text/javascript" src="<%=contextPath %>/js/concord/util/uri.js"></script>
<script type="text/javascript">

	dojo.require("concord.widgets.viewTextForHtmlPrint");
	dojo.require("concord.widgets.smartTable");
	dojo.require("concord.main.App");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("concord.widgets","viewTextForHtmlPrint");
	dojo.requireLocalization("concord.widgets","menubar");
	dojo.require("dijit.Dialog");
	dojo.require("dijit.MenuBar");
	dojo.require("dijit.PopupMenuBarItem");
	dojo.require("dijit.Menu");
	dojo.require("dijit.MenuItem");
	dojo.require("dijit.PopupMenuItem");
	dojo.require("dijit.form.Button");
	dojo.require("concord.util.uri"); //for printpdf
	dojo.require("concord.util.dialogs");//for about
	
	
//Update the link tags <a> and set target to "_blank" to open in a new window:
//get all the link <a> tags from docContentDivElement
//and assign setAttribute target
	function replaceHref(){
		var linkTags = document.getElementsByTagName("a");
		if(linkTags !=null && linkTags.length > 0){
			for(var i=0; i < linkTags.length; i++){
	       		var cksh = linkTags.item(i).getAttribute("_cke_saved_href");
	        	var href = linkTags.item(i).getAttribute("href");
	        	if( cksh &&cksh.indexOf('http')==0)
				{//decode URI
					cksh = decodeURI(cksh);
					linkTags.item(i).setAttribute("_cke_saved_href", cksh);
			 	}
			 	
				if( href && href.indexOf('http')==0)
				{//decode URI
				   href = decodeURI(href);
				   linkTags.item(i).setAttribute("href", href);
				}
	        	if(cksh && href && href.indexOf("javascript:void(0)") >= 0){
	            	linkTags.item(i).setAttribute("href", cksh);
	        	}
				if(linkTags.item(i).getAttribute("class") && linkTags.item(i).getAttribute("class").indexOf('lotusAction') < 0) {
					linkTags.item(i).setAttribute("target", "_blank");
				}
				var onclick =  linkTags.item(i).getAttribute("_cke_pa_onclick");
				if( onclick ){
					linkTags.item(i).setAttribute("onclick", onclick);
				}
			}
		}
	}

	function exportToPDF(){
		var uri = concord.util.uri.getPrintPDFUri(g_Repository, g_DocUri, g_draft);
	 	window.open( uri );
	}

	function openTextHtmlPrintWindow(printWindow){
			var printView = new concord.widgets.viewTextForHtmlPrint(printWindow);
			printView.loadData();	
	}

	function printHtml(){				
		window.open(window.location.href + '?mode=htmlprint',
				'TextHtmlPrint', 'height='+screen.height+',width=1024px,resizable=yes,menubar=yes,location=no,statusbar=no,scrollbars=yes');
	}
	
	function helpOverview(){
		window.open( concord.main.App.HELP_URL );
	}
	
	function helpAbout(){
		concord.util.dialogs.alert(concord_version);
	}
	
	function init(){
		replaceHref();
		
		//smartTableVar = new concord.widgets.smartTable('smartTableVar');
		//smartTableVar.init();	
	}
	window.onload = init;
	
	dojo.addOnLoad(function(){
		var dojoStr = dojo.i18n.getLocalization("concord.widgets","smartTable");
		var menuStr = dojo.i18n.getLocalization("concord.widgets","menubar");
		var nls = dojo.i18n.getLocalization("concord.util","dialogs");
	
//		dojo.byId("productName").innerHTML = nls.productName;
		dojo.byId("showHideColumns").innerHTML = dojoStr.showHideColumns;
		dojo.byId("smartTableDes").innerHTML = dojoStr.description;
		dijit.byId("cancelBtn").attr("label", dojoStr.cancelButton);
		dijit.byId("OKNodeSaveBtn").attr("label", dojoStr.okButton);
		dijit.byId("fileMenuBarItem").attr("label", menuStr.fileMenu);
		dijit.byId("exportToPDFItem").attr("label", menuStr.fileMenu_ExportAsPDF);
		dijit.byId("printItem").attr("label", menuStr.fileMenu_Print);
		dijit.byId("helpMenuBarItem").attr("label", menuStr.helpMenu);
		dijit.byId("overviewItem").attr("label", menuStr.helpMenu_Overview);
		dijit.byId("aboutItem").attr("label", menuStr.helpMenu_About);
		document.body.className =  document.body.className + " " + bodyClass;
		if( bodyWidth != "" )
			dojo.byId("viewhtml").style.width = bodyWidth;
		});
</script>
<link rel="SHORTCUT ICON" href="<%= contextPath %>/images/ibmdocs_product_16.ico" />
</head>
<body class="oneui30 lotusui30" style="background:#EEEEEE;">
<div id="wrapper">
	<jsp:include page="view_text_banner.jsp">
		<jsp:param value="<%=contextPath %>" name="contextPath" />
		<jsp:param value="<%=title %>" name="title" />
	</jsp:include>
	<jsp:include page="view_text_menu.html"></jsp:include>
</div>
<div id="viewbody" style="width: 100%; height: 100%; background-color: #EEEEEE;">
	<div id="viewhtml" style="background-color: #FFFFFF;border: 1px solid black;margin: 20px auto 40px;min-height: 1100px;padding: 0.7874in;width: 6.9252in !important;word-wrap: break-word;">
		<jsp:include page="view_text_content.jsp">
			<jsp:param value="<%=cacheDir %>" name="cacheDir" />
		</jsp:include>
	</div>
</div>
</body>
</html>