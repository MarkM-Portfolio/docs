<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.platform.util.ConcordUtil,
		com.ibm.concord.spi.beans.IDocumentEntry,
		com.ibm.json.java.JSONObject,
		com.ibm.json.java.JSONArray,
		com.ibm.concord.session.SessionConfig,
		org.apache.commons.lang.StringEscapeUtils,
		com.ibm.concord.services.rest.handlers.PeopleHandler,
		com.ibm.concord.platform.util.JSONUtil,
		com.ibm.concord.platform.Platform,
		com.ibm.docs.framework.IComponent"%>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
<title>HCL Docs Note Editor</title>

<%
 	String contextPath = request.getContextPath();
	String staticRootPath = ConcordUtil.getStaticRootPath();
 	int hbInterval = SessionConfig.getHeartBeatInterval()*1000;
 	int hbTimeout = SessionConfig.getHeartBeatTimeout()*1000;
 	int hbRetry = SessionConfig.getHeartBeatRetryCount();
 	String jobId = StringEscapeUtils.escapeHtml(request.getAttribute("jobId").toString());
	// Get the web message adapter id and shared mode from concord configuration file.
	String webMsgAdapterId = "";
	boolean sharedMode = false;
 	IComponent webMsgComponent = Platform.getComponent("com.ibm.concord.platform.webmsg");
	JSONObject webMsgCompConfig = webMsgComponent != null ? webMsgComponent.getConfig(): null;
	JSONObject adapterJson = webMsgCompConfig != null ? (JSONObject) webMsgCompConfig.get("adapter") : null;
	if (adapterJson != null)
	{
		Object idObj = adapterJson.get("id");
		if (idObj instanceof String)
		{
			webMsgAdapterId = (String) idObj;
		}
		JSONObject adapterConfig = (JSONObject) adapterJson.get("config");
		Object modeObj = adapterConfig != null ? adapterConfig.get("sharedmode") : null;
		if ((modeObj instanceof String) && ((String)modeObj).equalsIgnoreCase("true"))
		{
			sharedMode = true;
		}
	}
	// Get the context path of rtc4web_server.war.
	String rtcContextPath = Platform.getRtcContextPath();
	String entitleStr = "";
	Object entitleObj = request.getAttribute("IBMDocs_Entitlements");
	if (entitleObj instanceof JSONArray)
	{
		JSONArray entitleArray = (JSONArray) entitleObj;
		entitleStr = entitleArray.toString();
	}
	int maxImgSize = 8192;
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	String repository = docEntry.getRepository();
	String docId = docEntry.getDocId();
%>

<script type="text/javascript"
	src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>

<script type="text/javascript">
	var g_locale = navigator.userLanguage || navigator.language; // FIXME
	var contextPath = "<%= contextPath %>";
	var jobId = "<%= jobId %>";
	var repository = "<%= repository %>";
	var docId = "<%= docId %>";
	var g_bidiOn = "false";
	var staticRootPath = "<%= staticRootPath %>";
	var DOC_SCENE = {};
	var g_customizedFonts = {};
	var g_hbInterval = <%= hbInterval %>;
	var g_hbTimeout = <%= hbTimeout %>;
	var g_hbRetry = <%= hbRetry %>;
	var g_authUser = JSON.parse('<%= JSONUtil.escape(PeopleHandler.parseRequestUser(request).toString())%>');
	var g_maxImgSize = <%= maxImgSize %>;
	var g_EntitlementsStr = '<%= entitleStr %>';
	var g_reloadLog = false;

	var CONFIG_POLLER = {};
	CONFIG_POLLER.webMsgAdapterId = "<%=webMsgAdapterId%>";
	CONFIG_POLLER.isSharedMode = ("<%=sharedMode%>".toLowerCase() == "true");
	CONFIG_POLLER.isRtc4Web = (CONFIG_POLLER.webMsgAdapterId.toLowerCase() == "rtc4web");
	CONFIG_POLLER.rtcContextPath = "<%=rtcContextPath%>";
</script>

<script type="text/javascript" src="<%=  contextPath + staticRootPath %>/js/concord/concord_RTE_plus.js"></script>

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
	dojo.require("writer.htmlEditorOnline");

	var app = writer.htmlEditorOnline;
	
	if (window != window.top)
		window.addEventListener('message', msgHandler);

	dojo.addOnLoad(function() {
		app.init({"contextPath": contextPath, "docId": docId, "repository": repository, "staticRootPath": staticRootPath, "jobId": jobId});
		setTimeout(edit, 0);
	});

	dojo.addOnWindowUnload(function() {
		if (window != window.top) {
			app.save(true);
			app.exit();
		}
	});

	function edit() {
		app.render();
	}

	function msgHandler(e) {
		var origin = "file://";
		if (e.origin == origin && e.data.id) {
			switch (e.data.action) {
				case 'autoSave':
					if (app.isDirty()) {
						if (window != window.top) {
							parent.postMessage({id: e.data.id, action: 'autoSave'}, origin);
							app.save()
						}
					}
					break;
				case 'save':
					app.save(true);
					break;
				case 'quit':
					app.save(true)
					app.exit();
					setTimeout(function() {
						parent.postMessage({id: e.data.id, action: 'quit'}, origin);
					}, 1000);
					break;
				case 'publishHtml':
					var type = 'html';
					var targetType = e.data.state.type;
					if (targetType == 'file') type = 'json';
					var content = app.getData(type);
					setTimeout(function(){
						parent.postMessage({id: e.data.id, state: e.data.state, action: 'publishHtml', content: content}, origin);
					}, 1000);
					break;
				default:
					break;
			}
		}
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
