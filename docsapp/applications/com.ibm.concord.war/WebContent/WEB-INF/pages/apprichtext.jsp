<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.platform.util.ConcordUtil,
			com.ibm.json.java.JSONObject,
			com.ibm.json.java.JSONArray"%>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
<title>IBM DOCS Rich Text Editor</title>

<%
 	String contextPath = request.getContextPath();
	String staticRootPath = ConcordUtil.getStaticRootPath();
%>
<script type="text/javascript"
	src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>

<script type="text/javascript">
	var g_locale = navigator.userLanguage || navigator.language;
	var contextPath = "<%= contextPath %>";
	var g_bidiOn = "false";
	var staticRootPath = "<%= staticRootPath %>";
	var DOC_SCENE = {};
	var g_customizedFonts = {};
	var g_maxImgSize = 8192;
</script>

<script type="text/javascript" src="<%=  contextPath + staticRootPath %>/js/concord/concord_RTE.js"></script>

<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/document/document_main.css">
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/js/writer/css/concord_document.css">
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/base.css">
<style type='text/css'>
	html,body{height:100%;}
	.wrapper{height:95%;}
	#editorFrame {height: 100%!important;}
</style>

<script type="text/javascript">
	dojo.registerModulePath("writer", "../writer/js");
	dojo.require("writer.htmlEditor");

	var app = NoteApp; // NoteApp is available only after writer.htmlEditor is required
	var docId = "1"; // FIXME
	if (window.location.search != "") {
		// open docs note in browser with url like 'localhost:8080/note?id=1'
		docId=/([^&]+)/.exec(window.location.search)[1];
	}
	
	dojo.addOnLoad(function() {
		app.init({"contextPath": contextPath, "docId": docId});
		setTimeout(edit, 0);
	});

	dojo.addOnWindowUnload(function() {
		app.exit();
	});

	function edit() {
		window.db && window.db.get(id, function(arg) {
			if (arg) {
				var data = arg.data;
				data && app.setData('json', data);
			}
		});
		app.render();
	}

</script>

</head>
<body class="oneui30 lotusui30 lotusui30_body onpremise" style="overflow:hidden;">
<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper" >
	<div id="ll_sidebar_div" style="float:left;height:100%;"></div>
	<iframe id='editorFrame' frameborder = "0" allowtransparency="true" tabindex="-1" style="width:100%; height:1000px;background-color:#FFFFFF;" role="region" title="editor Frame">
	</iframe>
	<div style="visibility: hidden;">
	<iframe id="measureFrame" style="position:absolute; bottom:10000px; right:10000px;">
	</iframe>
	</div>
</div>
<div id="footer" role="complementary"></div>

</body>
</html>