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
			com.ibm.concord.viewer.platform.util.DocumentTypeUtils,
			com.ibm.concord.viewer.config.HTMLViewConfig,
			com.ibm.concord.viewer.spi.beans.UserBean,
			com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter,
			com.ibm.concord.viewer.services.rest.DomainHandler,
			java.util.HashMap"%>
<%
  String locale = ViewerUtil.getFallbackLocale(request);
  String contextPath = request.getContextPath();
  String staticResPath = ViewerUtil.getHTMLStaticRootPath();
  String staticRootPath = ViewerUtil.getStaticRootPath();
  String jobId = request.getAttribute("jobId") == null ? null : request.getAttribute("jobId").toString();
  int maxSheetRows = HTMLViewConfig.getMaxSheetRows();
  int partialLevel = HTMLViewConfig.getPartialLevel();
  int partialRowCnt = HTMLViewConfig.getPartialRowCnt();
  int maxImgSize = HTMLViewConfig.getMaxImgSize();
  int maxTextSize = HTMLViewConfig.getMaxTextSize();
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
  String textDir = request.getAttribute("_textDirection").toString();
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
  
  String resoursePath=contextPath+staticResPath;
  String snapshotId = request.getAttribute("snapshotId") == null ? null : request.getAttribute("snapshotId").toString();
  boolean hasACL = ((Boolean)request.getAttribute("hasACL")).booleanValue();
  
  boolean isDocsEnabled = request.getAttribute("attr_is_docs_enabled").toString().equalsIgnoreCase("YES") ? true : false;
  String dosURI = (String) request.getAttribute("attr_docs_uri");
  boolean isDocsSupportType = request.getAttribute("attr_is_doctype_supported_by_docs").toString().equalsIgnoreCase("YES") ? true : false;
  boolean isDocsEditor = request.getAttribute("attr_is_docs_editor").toString().equalsIgnoreCase("YES") ? true: false;
  String x_ua_value = ViewerUtil.getXUACompatible(request); 
  boolean isIE9=ViewerUtil.isIE9(request.getHeader("User-Agent"));   
  String viewer_config = null;
  if (request.getAttribute("viewer_config") != null)
  {
    viewer_config = request.getAttribute("viewer_config").toString();
  }
  JSONObject reviewData = (JSONObject) request.getAttribute("review");
  JSONObject featureConfig = Platform.getViewerConfig().getFeatureConfig();
  boolean compactMode = false;
  boolean focusWindow = true;
  
  HashMap<String, Boolean> parameters = (HashMap<String, Boolean>)request.getAttribute("parameters");
  if(parameters != null)
  {
    isDocsEnabled = parameters.get("edit") == null ? isDocsEnabled : (isDocsEnabled && parameters.get("edit").booleanValue());
    compactMode = parameters.get("compact");
    focusWindow = parameters.get("focusWindow");
  }
  if(DocumentTypeUtils.XLSM_MIMETYPE.equals(docMimeType))
    isDocsEnabled = false;
  String loadingClassName = ("mail".equals(docEntry.getRepository())||compactMode == false)?"loadingBeforeJsLoad":"";
  
  JSONObject domainJson = DomainHandler.getDomainList();

  String viewportContent = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  if (ViewerUtil.isMobileBrowser(request)) {
	  viewportContent = "width=device-width, initial-scale=1.0, minimum-scale=0.6, maximum-scale=3.0, user-scalable=yes";
  }
%>
 
<html lang='<%=locale%>'>
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="<%=viewportContent%>"/>
<title>
<%=title%>
</title>
<jsp:include page="/WEB-INF/pages/product.jsp"></jsp:include>

<link rel="SHORTCUT ICON" href="<%=resoursePath%>/images/ibmdocs_spreadsheets_16.ico" />
<%
  if (isIE9)
  {
%>
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/styles/css/websheet/sheet_main.css">
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/js/wseditor/css/concord_sheet.css">
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/styles/css/base.css">
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/css/textdocument.css">
<%
  }else{
%>
<link rel="stylesheet" type="text/css" href="<%=resoursePath%>/css/sheetview.css">
<%
  }
%>


</head>
<body class="compactMode oneui30 lotusui30 lotusui30_body scloud3 <%= loadingClassName %>" style="overflow-y: hidden" spellcheck="false">

<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper"></div>
<div id="footer" role="complementary"></div>
<script type="text/javascript" src="<%=resoursePath%>/js/dojo/dojo.js" 
 				djConfig="parseOnLoad: true, fontSizeWatch:true,isDebug:false, locale:'<%=locale%>'"></script>
<script type="text/javascript">
	var staticRootPath = "<%= staticResPath %>";
	var contextPath ="<%=contextPath%>";
	var g_auth = "localtest"; 
	var g_bidiOn = "false";
	var g_bidiTextDir = "<%= textDir %>";
	var g_authUser = <%= authUser %>;
	var g_featureConfig = <%= featureConfig %>;
	var g_hasNewFeature = false;
	var gTPRepoName = "";
	var DOC_SCENE = {};
	DOC_SCENE.type = "<%= docType %>";
	DOC_SCENE.mode = "<%= docMode %>";
	DOC_SCENE.docSizeLimit = "<%= docSizeLimit %>";
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
	DOC_SCENE.fileDetailPage = "<%= docEntry.getFileDetailsURL() %>";
	DOC_SCENE.compactMode = "<%= compactMode %>" === "true";
	DOC_SCENE.focusWindow = "<%=focusWindow%>" == "true";
	DOC_SCENE.hasACL = "<%=hasACL%>" == "true";
	
	var g_enableACL = false;
	var g_help_URL = '';
	var gText_help_URL = '';
	var gSheet_help_URL = '';
	var gPres_help_URL = '';
	var g_lastSheet = '';
	var g_sessionT = '';
	
	var g_revision_enabled =false;
	var gIs_cloud = "<%= isSC %>" === "true";
	var g_concordInDebugMode = false;
	var g_enableSetChart = false;
	var mt_enabled = "false";
	var login_retry = "false";
	var g_DEBUG = true;
	
	var concord_version = "<%= version %>";
	var viewer_version=concord_version;
	var viewer_build="<%= build %>";
	var g_EntitlementsStr = '[{"booleanValue":false,"name":"coedit"}, {"booleanValue":false,"name":"assignment"}]';
	var loginUri = "<%=loginUri%>";
	var g_customizedFonts = JSON.parse('<%= HTMLViewConfig.escape(HTMLViewConfig.getCustomizedFonts().toString())%>');
	var	g_docMimeType = "<%= docMimeType %>";	
	var g_hbTimeout = <%=hbTimeout%>;
    var g_locale = "<%=locale%>";
	var g_maxSheetRows = <%=maxSheetRows%>;
	var g_partialLevel = <%=partialLevel%>;
	var g_partialRowCnt = <%=partialRowCnt%>;
	var djConfig = {
		baseUrl: "./",
		parseOnLoad: true,
		isDebug: g_DEBUG,
		locale: "<%=locale%>"
		};
	dojo.locale = "<%=locale%>";
	var settings={};
	settings.toolbar='hide';
	settings.menubar='hide';
	settings.show_indicator="no";	
	settings.show_unsupported_feature="no";	
	settings.show_welcome="no";
	settings.auto_spellcheck="no";
	var docType= "<%=docType%>";
	var viewerConfig = eval('(<%=viewer_config%>)');

	var g_whiteDomains = <%= domainJson %>;
	var g_disableCopy = <%= disableCopy %>;
	var g_watermark = <%= watermark%>;
</script>

<script type="text/javascript" src="<%=resoursePath%>/js/concord/concord_sheet_view.js"></script>
<script type="text/javascript">
function global_init(){
	dojo.require("concord.main.App");
	dojo.require("dojo.cookie");
	dojo.require("concord.util.BidiUtils");
	dojo.addOnLoad(function() {
		concord.main.App.onLoad(window, 'concord.main.App');
		if(g_locale.indexOf('ja') != -1)
			dojo.query("body").addClass("lotusJapanese");
		if(g_locale.indexOf('ko') != -1)
			dojo.query("body").addClass("lotusKorean");
		if (BidiUtils.isGuiRtl()){
			dojo.query("body").addClass("dijitRtl");
		}
		if(!gIs_cloud){
			dojo.query("body").addClass("onpremise");
		}   
		dojo.query("body").removeClass("loadingBeforeJsLoad");
	});
	dojo.addOnUnload(function() {
		concord.main.App.onUnload(window);
	});
	dojo.addOnWindowUnload(function() {
		concord.main.App.onWindowUnload(window);
	});
	/**
	 * the value should be sum of banner, menubar, toolbar and formular bar
	 * Same with method getHeaderHeight in SheetDocScene.js, need change both together
	 * @returns
	 */
	function getBrowserHeight() {
		var height = 0;
		if(typeof(window.innerHeight) == 'number') 
			height = window.innerHeight;
		else if(document.documentElement && document.documentElement.clientHeight)
			height = document.documentElement.clientHeight;
		else if(document.body && document.body.clientHeight)
			height = document.body.clientHeight;
		return height;
	};
	function getBrowserWidth(cache) {
		if(cache && pe.scene.getBrowserWidth())
		    return pe.scene.getBrowserWidth();
		var width = 0;
		if(typeof(window.innerWidth) == 'number') 
			width = window.innerWidth;
		else if(document.documentElement && document.documentElement.clientWidth)
			width = document.documentElement.clientWidth;
		else if(document.body && document.body.clientWidth)
			width = document.body.clientWidth;
		pe.scene.setBrowserWidth(width);
		return width;
	};
    function getHeaderHeight() {   	
    	var height = 0;
    	var bannerDiv = dojo.byId("banner");
    	if(bannerDiv){
	    	if (dojo.isIE)
				height += bannerDiv.offsetHeight;
			else
				height += bannerDiv.clientHeight;
    	}
    	var menubarDiv = dojo.byId("lotus_editor_menubar");
    	if(menubarDiv){
	    	if (dojo.isIE)
				height += menubarDiv.offsetHeight;
			else
				height += menubarDiv.clientHeight;
    	}
    	var toolbarDiv = dojo.byId("lotus_editor_toolbar");
    	if(toolbarDiv){
	    	if (dojo.isIE)
				height += toolbarDiv.offsetHeight;
			else
				height += toolbarDiv.clientHeight;
    	}
    	return height;
    };
    function resize() {
        if (!pe.scene.bMobileBrowser) {
            var h, WorksheetHeight;
            h = dojo.byId("sheet_node");

            WorksheetHeight = getBrowserHeight()- getHeaderHeight() + "px";
            try{
                h.style.width = getBrowserWidth()+"px";
                h.style.height = WorksheetHeight;
            }catch(e){
            }

            var container = dojo.byId('websheet_layout_WorksheetContainer_0');
            if (container) {
                try{
                    pe.lotusEditor.setWorksheetHeight();
                }catch(e){
                }
                container.style.width = h.style.width;
            }
        }
    }
    dojo.connect(window, "onresize", resize);
	
}	
</script>
<script type="text/javascript">
	global_init();
</script>
</body>
</html>