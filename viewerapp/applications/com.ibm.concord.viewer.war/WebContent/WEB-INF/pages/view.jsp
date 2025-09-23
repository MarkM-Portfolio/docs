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
			com.ibm.concord.viewer.platform.util.DocumentTypeUtils,
			com.ibm.concord.viewer.platform.util.ViewerUtil,
			com.ibm.concord.viewer.spi.beans.UserBean,
			com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter,
			com.ibm.concord.viewer.services.rest.DomainHandler,
			java.util.HashMap"%>
<%
  String locale = ViewerUtil.getFallbackLocale(request);
  String contextPath = request.getContextPath();
  String staticResPath = ViewerUtil.getStaticRootPath();
  String x_ua_value = ViewerUtil.getXUACompatible(request); 
//  String buildVersion = ViewerUtil.getBuildVersion();
  String buildVersion = ViewerUtil.getAboutText();

  String docType = request.getAttribute("doc_type").toString();
  String jobId = request.getAttribute("jobId") == null ? null : request.getAttribute("jobId").toString();
  IDocumentEntry docEntry = (IDocumentEntry) request.getAttribute("doc_entry");
  String pageNum = request.getAttribute("length") == null ? "0" : request.getAttribute("length").toString();
  String title = docEntry.getTitle();
  
  String viewer_config = null;
  int retryCount=60;
  if (request.getAttribute("viewer_config") != null)
  {
    viewer_config = request.getAttribute("viewer_config").toString();
  } 

 boolean isPDFJsViewMode = false;
 if(request.getAttribute("isPDFJsViewMode") != null)
 	isPDFJsViewMode = request.getAttribute("isPDFJsViewMode").toString().equalsIgnoreCase("YES") ? true : false;

  String data = null;
  data = request.getAttribute("data") == null ? null : request.getAttribute("data").toString();

  boolean isDocsEnabled = request.getAttribute("attr_is_docs_enabled").toString().equalsIgnoreCase("YES") ? true : false;
  String dosURI = (String) request.getAttribute("attr_docs_uri");
  boolean isDocsSupportType = request.getAttribute("attr_is_doctype_supported_by_docs").toString().equalsIgnoreCase("YES") ? true : false;
  boolean isDocsEditor = request.getAttribute("attr_is_docs_editor").toString().equalsIgnoreCase("YES") ? true: false;      
  String description = ViewerUtil.getDescription();
  String shortcutIcon = "images/ibmdocs_product_16.ico";
  if (docType.equals("text"))
    shortcutIcon = "images/ibmdocs_wordprocessing_16.png";
  else if (docType.equals("sheet"))
    shortcutIcon = "images/ibmdocs_spreadsheets_16.png";
  else if (docType.equals("pres"))
    shortcutIcon = "images/ibmdocs_presentations_16.png";
  else if (docType.equals("pdf"))
    shortcutIcon = "images/pdf_filetype_16.png";
  String text_helpurl="/help/topic/com.ibm.lotus.connections.files.help/documents_viewer_Files.html";  
  String sheet_helpurl="/help/topic/com.ibm.lotus.connections.files.help/spreadsheets_viewer_Files.html";        
  String pres_helpurl="/help/topic/com.ibm.lotus.connections.files.help/presentations_viewer_Files.html";
  String deploy_env="";
  
  JSONObject helpConfig = Platform.getViewerConfig().getSubConfig("Help");
  if (helpConfig != null){ 
	if(helpConfig.get("text_helpurl") != null)
		text_helpurl = (String) helpConfig.get("text_helpurl");
	if(helpConfig.get("sheet_helpurl") != null)  
		sheet_helpurl = (String) helpConfig.get("sheet_helpurl");
	if(helpConfig.get("pres_helpurl") != null)		  
		pres_helpurl = (String) helpConfig.get("pres_helpurl");
  }
  
  JSONObject envConfig=Platform.getViewerConfig().getSubConfig("deployment");
  if(envConfig!=null&&envConfig.get("env") != null){
  	deploy_env=(String) envConfig.get("env");
  }
  boolean isSC=deploy_env.equalsIgnoreCase("smart_cloud");
  JSONObject proxyErrorRetry=Platform.getViewerConfig().getSubConfig("ProxyErrorRetry");
  if(proxyErrorRetry!=null&&proxyErrorRetry.get("count") != null){
  	retryCount=Integer.valueOf((String)proxyErrorRetry.get("count"));
  }
  
  boolean enablePrintBtn=true;
  boolean enableVersionBtn=true;
  boolean enableHelpBtn=true;
  boolean compactMode = false;
  boolean focusWindow = true;
  
  if(Constant.SMART_CLOUD.equals(deploy_env))
  	enableVersionBtn=false;
  HashMap<String, Boolean> parameters = (HashMap<String, Boolean>)request.getAttribute("parameters");
  if(parameters != null)
  {
    enablePrintBtn = parameters.get("print") == null ? enablePrintBtn : parameters.get("print").booleanValue();
    enableHelpBtn = parameters.get("help") == null ? enableHelpBtn : parameters.get("help").booleanValue();
    isDocsEnabled = parameters.get("edit") == null ? isDocsEnabled : (isDocsEnabled && parameters.get("edit").booleanValue());
    
    compactMode = parameters.get("compact");
    focusWindow = parameters.get("focusWindow");
  }
  
  UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
  JSONObject authUser = user.toJSON();
  JSONObject reviewData = (JSONObject) request.getAttribute("review");
  JSONObject featureConfig = Platform.getViewerConfig().getFeatureConfig();
  String loadingClassName = ("mail".equals(docEntry.getRepository())||compactMode == false)?"loadingBeforeJsLoad":"";
  if(DocumentTypeUtils.XLSM_MIMETYPE.equals(docEntry.getMimeType()))
    isDocsEnabled = false;
  
  JSONObject domainJson = DomainHandler.getDomainList();
%>
<html lang='<%=locale%>'>
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>
<%=title%>
</title>
<link rel="SHORTCUT ICON" href="<%=staticResPath%>/<%=shortcutIcon%>" />
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/dijit/themes/oneui30/oneui30.css" media="screen, projection">
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/html/css/widgets.css" media="screen, projection">
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/styles/css/compact.css" media="screen, projection">
<%
  if (isPDFJsViewMode)
  {
%>
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/viewer/css/pdfJs/pdfJsViewer.css" media="screen, projection">
<% 
  }
%>
<%
  if (enablePrintBtn)
  {
%>
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/viewer/css/print.css" media="print">
<%
  }
  else
  {
%>
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/viewer/css/noprint.css" media="print">
<% 
  }
%>
<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/styles/css/base.css" media="screen, projection">
<jsp:include page="/WEB-INF/pages/product.jsp"></jsp:include>

</head>
<body class="compactMode oneui30 lotusui30 lotusui30_body scloud3 <%= loadingClassName %>">
     <div dojoType="dijit.layout.BorderContainer" role="main" design="headline" gutters="false" id="mainContainer"
         style="top: 0px; bottom: 0px; left: 0px; right: 0px; position: absolute;" liveSplitters="false" aria-label="Main Container">
             
              <div dojoType="dijit.layout.ContentPane" region="top"
              style="height: 69px" splitter="false" id="headerPane">
			  	   <div id="headerBorderContainer" dojoType="viewer.widgets.ExBorderContainer" design="headline" gutters="false"
  				       style="top: 0px; bottom: 0px; left: 0px; right: 0px; position: absolute; display: block" liveSplitters="false">
  				        <div dojoType="dijit.layout.ContentPane" role="banner" region="top"
              				style="height: 41px" splitter="false" id="titlePane"></div>
              			<div dojoType="dijit.layout.ContentPane" role="toolbar" region="bottom"
              				style="height: 29px" splitter="false" id="toolbarPane"></div>
  				   </div>
			  </div>
              <div dojoType="dijit.layout.ContentPane" role="region"  aria-label="thumbnail pane" region="leading"
	              style="width:230px" splitter="true" id="thumbnailPane">
        	 </div>  
         
         <div dojoType="dijit.layout.ContentPane" role="region"  aria-label="content pane" region="center" id="contentPane"></div> 
    </div>
    <div id="print">
    </div>
<script type="text/javascript" src="<%=staticResPath%>/js/dojo/dojo.js" 
 				djConfig="parseOnLoad: true, fontSizeWatch:true,isDebug:false, locale:'<%=locale%>'"></script>
<script>
    var DOC_SCENE = {};
    DOC_SCENE.isPDFJsViewMode = "<%=isPDFJsViewMode%>";
</script>

<script type="text/javascript" src="<%=staticResPath%>/js/viewer/viewer.js"></script>

<script type="text/javascript">
	var contextPath = "<%=contextPath%>";
	var staticResPath = "<%=staticResPath%>";
	var viewer_build = "<%=description%>";
	var viewer_version = "<%=buildVersion%>";
	var viewerConfig = eval('(<%=viewer_config%>)');
	var g_concordInDebugMode = false;
	if(g_concordInDebugMode)
		djConfig.isDebug = true;

	DOC_SCENE.type = "<%=docType%>";
	DOC_SCENE.repoUri = "<%=docEntry.getRepository()%>";
	DOC_SCENE.docUri = "<%=docEntry.getDocUri()%>";
	if(DOC_SCENE.isPDFJsViewMode == "true"){
		DOC_SCENE.repository = DOC_SCENE.repoUri;
		DOC_SCENE.uri = DOC_SCENE.docUri;
	}
	DOC_SCENE.title = "<%=docEntry.getTitle()%>";
	DOC_SCENE.version = <%=String.valueOf(docEntry.getModified().getTimeInMillis())%>;
	DOC_SCENE.mediaSize = <%=docEntry.getMediaSize()%>;
	DOC_SCENE.pageNum = <%=pageNum%>;
	DOC_SCENE.jobId = ("<%=jobId%>"=="null") ? null : "<%=jobId%>";
	DOC_SCENE.images = eval('(<%=data%>)');
	DOC_SCENE.isDocsEnabled = "<%=isDocsEnabled%>";
	DOC_SCENE.docsURI = "<%=dosURI%>";
	DOC_SCENE.isDocsSupportType = "<%=isDocsSupportType%>";
	DOC_SCENE.isDocsEditor = "<%= isDocsEditor %>";
	DOC_SCENE.reviewData = <%= reviewData %>;
	DOC_SCENE.fileDetailPage = "<%= docEntry.getFileDetailsURL() %>";
	DOC_SCENE.compactMode = "<%= compactMode %>" === "true";
	DOC_SCENE.focusWindow = "<%=focusWindow%>" == "true";
	var gText_help_URL = "<%= text_helpurl %>";
	var gSheet_help_URL = "<%= sheet_helpurl %>";
	var gPres_help_URL = "<%= pres_helpurl %>";
	var g_locale = "<%= locale %>";
	var g_env="<%= deploy_env%>";
	var g_retryCount="<%= retryCount%>";
	
	var g_enablePrintBtn="<%= enablePrintBtn%>";
    var g_enableVersionBtn="<%= enableVersionBtn%>";
    var g_enableHelpBtn="<%= enableHelpBtn%>";
    
    var g_authUser = <%= authUser %>;
  	var g_featureConfig = <%= featureConfig %>;
  	var g_whiteDomains = <%= domainJson %>;
  	
	dojo.require("viewer.main.App");
	dojo.require("dojo.cookie");
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.ContentPane");
	dojo.addOnLoad(function() {
		viewer.main.App.onLoad(window, 'viewer.main.App');
		dojo.query("body").removeClass("loadingBeforeJsLoad");
	});
	dojo.addOnUnload(function() {
		viewer.main.App.onUnload(window);
	});
	dojo.addOnWindowUnload(function() {
		viewer.main.App.onWindowUnload(window);
	});
	
</script> 
</body>
</html>