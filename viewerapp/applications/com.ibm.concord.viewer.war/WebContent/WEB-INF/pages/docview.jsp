<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<!--  
/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
-->
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.viewer.spi.beans.IDocumentEntry,
			com.ibm.json.java.JSONObject,
			com.ibm.concord.viewer.platform.Platform,
			com.ibm.concord.viewer.platform.util.Constant,
			com.ibm.concord.viewer.platform.util.ViewerUtil,
			com.ibm.concord.viewer.config.HTMLViewConfig,
			com.ibm.concord.viewer.spi.beans.UserBean,
			com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter,
			com.ibm.concord.viewer.services.rest.DomainHandler,
			java.util.HashMap"%>
<%
  String locale = ViewerUtil.getFallbackLocale(request);
  String contextPath = request.getContextPath();
  String staticResPath = ViewerUtil.getHTMLStaticRootPath();
  String jobId = request.getAttribute("jobId") == null ? null : request.getAttribute("jobId").toString();
  int maxCharacter = 0;
  int maxHtmlSize = 4096*1024;
  int maxImgSize = 8192*1024;
  //maxImgSize = HTMLViewConfig.getMaxImgSize();
  //maxHtmlSize = HTMLViewConfig.getMaxTextSize();
  //maxCharacter= HTMLViewConfig.getMaxTextSize();
  int hbTimeout=HTMLViewConfig.getHBTimeout();
  boolean disableCopy = HTMLViewConfig.isCopyDisabled();
  JSONObject watermark = HTMLViewConfig.getWatermark();
  
  String deploy_env="";
  JSONObject envConfig=Platform.getViewerConfig().getSubConfig("deployment");
  if(envConfig!=null&&envConfig.get("env") != null){
  	deploy_env=(String) envConfig.get("env");
  }
  boolean isSC=deploy_env.equalsIgnoreCase("smart_cloud");
  
  String loginUri = request.getContextPath() + "/j_security_check";
  String docType = request.getAttribute("doc_type").toString();
  String docMode = request.getAttribute("doc_mode").toString();
  String docSizeLimit = HTMLViewConfig.getMaxSize();
  boolean jobLive = (request.getAttribute("jobLive") != null);
  IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
  String title = docEntry.getTitle();
  String docMimeType = docEntry.getMimeType();
  String version = ViewerUtil.getDescription() + " " + ViewerUtil.getBuildVersion();
  String build=ViewerUtil.getDescription();
  UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
  JSONObject authUser=user.toJSON();
  String repository = docEntry.getRepository();
  String resoursePath=contextPath+staticResPath;
  String staticRootPath = ViewerUtil.getStaticRootPath();
  String snapshotId = request.getAttribute("snapshotId") == null ? null : request.getAttribute("snapshotId").toString();
  boolean hasTrack = ((Boolean)request.getAttribute("hasTrack")).booleanValue();
  
  boolean isDocsEnabled = request.getAttribute("attr_is_docs_enabled").toString().equalsIgnoreCase("YES") ? true : false;
  String dosURI = (String) request.getAttribute("attr_docs_uri");
  boolean isDocsSupportType = request.getAttribute("attr_is_doctype_supported_by_docs").toString().equalsIgnoreCase("YES") ? true : false;
  boolean isDocsEditor = request.getAttribute("attr_is_docs_editor").toString().equalsIgnoreCase("YES") ? true: false;
  String x_ua_value = ViewerUtil.getXUACompatible(request);   
  String viewer_config = null;
  if (request.getAttribute("viewer_config") != null)
  {
    viewer_config = request.getAttribute("viewer_config").toString();
  }
  JSONObject reviewData = (JSONObject) request.getAttribute("review");
  
  boolean compactMode = false;
  boolean focusWindow = true;
  
  HashMap<String, Boolean> parameters = (HashMap<String, Boolean>)request.getAttribute("parameters");
  if(parameters != null)
  {
    isDocsEnabled = parameters.get("edit") == null ? isDocsEnabled : (isDocsEnabled && parameters.get("edit").booleanValue());
    compactMode = parameters.get("compact");
    focusWindow = parameters.get("focusWindow");
  }
  JSONObject featureConfig = Platform.getViewerConfig().getFeatureConfig();
  String loadingClassName = ("mail".equals(docEntry.getRepository())||compactMode == false)?"loadingBeforeJsLoad":"";
  
  boolean isIOSMobile = ViewerUtil.isIOSMobileRequest(request);

  JSONObject domainJson = DomainHandler.getDomainList();
  
  String viewportContent = "width=device-width, initial-scale=1.0, user-scalable=yes";
  if (ViewerUtil.isMobileBrowser(request)) {
	  viewportContent = "width=device-width, initial-scale=1.0, minimum-scale=0.6, maximum-scale=3.0, user-scalable=yes";
  }
%>
<html lang ="<%=locale%>">
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="<%=viewportContent%>" />
<title>
<%=title%>
</title>

<jsp:include page="/WEB-INF/pages/product.jsp"></jsp:include>
<link rel="SHORTCUT ICON" href="<%=resoursePath%>/images/ibmdocs_wordprocessing_16.ico" />
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/styles/css/document/document_main.css">
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/js/writer/css/concord_document.css">
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/css/textdocument.css">

<%
if (isIOSMobile){
%>
<link type="text/css" rel="stylesheet" href="<%=resoursePath%>/styles/css/writer/writer.css"/>
<link type="text/css" rel="stylesheet" href="<%=resoursePath%>/js/dijit/themes/oneui30/oneui30.css"/>
<%} %>

<!-- this is theme url from SmartCloud, no side impact for on-promise env -->
</head>
<body class="compactMode oneui30 lotusui30 lotusui30_body scloud3 <%= loadingClassName %>" style="overflow:hidden;">
<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper">
<%
  if (!isIOSMobile)
  {
%>
	<iframe id='editorFrame' frameborder = "0" allowtransparency="true" tabindex="-1" style="width:100%; height:100%" title="editor Frame">
	</iframe>
<%
  }else{
%>
	<div id="editorFrame" tabindex="-1" style="width:100%; height:100%">
<%
  }
%>
  <div  style="visibility: hidden;">
    <iframe id="measureFrame" style="position:absolute; bottom:10000px; right:10000px;">
    </iframe>
  </div>
</div>
<div id="footer" role="complementary"></div>
<script type="text/javascript" src="<%=resoursePath%>/js/dojo/dojo.js" 
 				djConfig="parseOnLoad: true, fontSizeWatch:true,isDebug:false, locale:'<%=locale%>'"></script>
<script type="text/javascript">
	var staticRootPath = "<%= staticResPath %>";
	var contextPath ="<%=contextPath%>";
	var g_auth = "localviewer"; 
	var g_bidiOn = "true";
	var g_bidiTextDir = "false";
	var g_authUser = <%= authUser %>;
	var g_featureConfig = <%= featureConfig %>;
	var g_hasNewFeature = false;
	var viewerConfig = eval('(<%=viewer_config%>)');
	var DOC_SCENE = {};
	DOC_SCENE.type = "<%= docType %>";
	DOC_SCENE.mode = "<%= docMode %>";
	DOC_SCENE.docSizeLimit = viewerConfig.text["max-size"];
	DOC_SCENE.repository = "<%= docEntry.getRepository() %>";
	DOC_SCENE.uri = "<%= docEntry.getDocUri() %>";
	DOC_SCENE.docUri = "<%=docEntry.getDocUri()%>";
	DOC_SCENE.title = "<%= docEntry.getTitle() %>";
	DOC_SCENE.jobId = "<%=jobId%>";
	DOC_SCENE.jobLive = "<%=jobLive%>";
	DOC_SCENE.startTs = (new Date()).getTime();
	DOC_SCENE.snapshotId = "<%= snapshotId %>";
	DOC_SCENE.version = <%=String.valueOf(docEntry.getModified().getTimeInMillis())%>;
	
	DOC_SCENE.isDocsEnabled = "<%=isDocsEnabled%>";
	DOC_SCENE.docsURI = "<%=dosURI%>";
	DOC_SCENE.isDocsSupportType = "<%=isDocsSupportType%>";
	DOC_SCENE.isDocsEditor = "<%= isDocsEditor %>";
	DOC_SCENE.reviewData = <%= reviewData %>;
	DOC_SCENE.extension = "<%= docEntry.getExtension() %>";
	DOC_SCENE.fileDetailPage = "<%= docEntry.getFileDetailsURL() %>";
	DOC_SCENE.compactMode = "<%= compactMode %>" === "true";
	DOC_SCENE.focusWindow = "<%=focusWindow%>" == "true";
	DOC_SCENE.hasTrack = "<%=hasTrack%>" == "true";
	
	var g_help_URL = '';
	var gText_help_URL = '';
	var gSheet_help_URL = '';
	var gPres_help_URL = '';
	var g_lastSheet = '';
	var g_sessionT = '';
	var g_recentFiles='';
	var g_revision_enabled =false;
	var gIs_cloud = "<%= isSC %>" === "true";
	var g_concordInDebugMode = false;
	var g_enableSetChart = false;
	var mt_enabled = "false";
	var login_retry = "false";
	var g_DEBUG = true;
	var gTPRepoName = "";
	
	var concord_version = "<%= version %>";
	var viewer_version=concord_version;
	var viewer_build="<%= build %>";
	var g_EntitlementsStr = '[{"booleanValue":false,"name":"coedit"}, {"booleanValue":false,"name":"assignment"}]';
	var loginUri = "<%=loginUri%>";
	var g_customizedFonts = JSON.parse('<%= HTMLViewConfig.escape(HTMLViewConfig.getCustomizedFonts().toString())%>');
	var	g_docMimeType = "<%= docMimeType %>";	
	var g_hbTimeout = <%=hbTimeout%>;
    var g_locale = "<%=locale%>";
	
	var g_maxCharacterCount = <%= maxCharacter %>;
	var g_maxHtmlSize = <%= maxHtmlSize %>;
	var g_maxImgSize = <%= maxImgSize %>;
	
		//for view mode
	var g_viewPageWindow;  //a pointer to the new window opened where the view mode is displayed
	var g_viewPageHtmlContent="";  // to hold the html string to pass into the view mode window to be displayed, comments and tasks are cleaned
	var g_activitiesUrl='';	
	/*var g_activity='';
	var g_BetasStr='';
	var g_hbInterval='';*/
	var settings={};
	settings.toolbar='hide';
	settings.menubar='hide';
	settings.show_indicator="no";	
	settings.show_unsupported_feature="no";	
	settings.show_welcome="no";
	settings.auto_spellcheck="no";
	var g_activity = false;
	var g_BetasStr = '';
	var g_hbInterval = g_hbTimeout;
	var docType= "<%=docType%>";
	var g_whiteDomains = <%= domainJson %>.domain_list;
	var g_disableCopy = <%= disableCopy %>;
	var g_watermark = <%= watermark%>;
</script>


<script type="text/javascript" src="<%=resoursePath%>/js/concord/concord_text.js"></script>

<!-- own styles -->
<script type="text/javascript">
	dojo.require("concord.main.App");
	dojo.require("dojo.cookie");
	
	dojo.addOnLoad(function() {
		concord.main.App.onLoad(window, 'concord.main.App');
		if(g_locale.indexOf('ja') != -1)
			dojo.query("body").addClass("lotusJapanese");
		if(g_locale.indexOf('ko') != -1)
			dojo.query("body").addClass("lotusKorean");
		if(!gIs_cloud){
			dojo.query("body").addClass("onpremise");
		}
		dojo.query("body").removeClass("loadingBeforeJsLoad");
		//function onFontResize( e, args ){
		//	if(args[0].iDelta != 0 && pe.scene.resizeSidebarDiv ){
		//		pe.scene.resizeSidebarDiv(true);   
		//	}
		//}
		////   id of element to check for and insert control
		//FontResizeDetector.TARGET_ELEMENT_ID = 'header';
		//FontResizeDetector.addEventListener(onFontResize,null );		
	});
	dojo.addOnUnload(function() {
		concord.main.App.onUnload(window);
		//FontResizeDetector.stopDetector();
	});
	dojo.addOnWindowUnload(function() {
		concord.main.App.onWindowUnload(window);
	});
</script>
</body>
</html>
