<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.json.java.JSONObject, 
			com.ibm.json.java.JSONArray,
			com.ibm.concord.config.ConcordConfig,
			com.ibm.concord.spi.task.IActivityAdapter,
			com.ibm.concord.session.SessionConfig,
			com.ibm.concord.spi.beans.IDocumentEntry,
			com.ibm.docs.authentication.AuthenticationConfig,
			com.ibm.concord.spreadsheet.SpreadsheetConfig,
			com.ibm.concord.platform.util.ConcordUtil,
			com.ibm.concord.platform.util.LLIntegrationUtil,
			com.ibm.concord.platform.util.JSONUtil,
			com.ibm.concord.platform.util.I18nUtil,
			com.ibm.concord.platform.util.UserDocCacheUtil,
			com.ibm.concord.services.rest.handlers.RecentFilesHandler,
			com.ibm.docs.authentication.IAuthenticationAdapter,
			com.ibm.docs.directory.beans.UserBean,			
			com.ibm.concord.services.rest.handlers.PeopleHandler,
			com.ibm.concord.util.NewFeaturesUtil"%>
<% 
	String locale = I18nUtil.getFallbackLocale(request);
	String PRODUCT_NAME = I18nUtil.getProductName(request);
	String x_ua_value = ConcordUtil.getXUACompatible(request);	
%>		
<html lang ="<%=locale%>">
<head>
<meta id="viewport" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<title><%=PRODUCT_NAME%></title>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<%
	String contextPath = request.getContextPath();
	String sSetChart = request.getParameter("setchart");
	boolean enableSetChart = "true".equals(sSetChart);
	String authMethod = "";
	String authUrl = "";
	String filerUrl = "";
	String activitiesUrl = "";
	int hbInterval = SessionConfig.getHeartBeatInterval() * 1000;
	int hbTimeout = SessionConfig.getHeartBeatTimeout() * 1000;
	int hbRetry = SessionConfig.getHeartBeatRetryCount();
	int maxSheetRows = SpreadsheetConfig.getMaxSheetRows();
	int partialLevel = SpreadsheetConfig.getPartialLevel();
	int partialRowCnt = SpreadsheetConfig.getPartialRowCnt();
	int maxImgSize = SpreadsheetConfig.getMaxImgSize();
	int maxTextSize = SpreadsheetConfig.getMaxTextSize();
	boolean debug = SpreadsheetConfig.getDebugEnabled();
	boolean enalbeACL = SpreadsheetConfig.hasACLEnabled();
	String activities = ConcordUtil.getActivitiesUrl(); 
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	if (AuthenticationConfig.getAuthenticationAdapterClass(docEntry.getRepository()).equalsIgnoreCase(
					"com.ibm.concord.auth.l2.L2LocalIntegrationAuth")) {
		authMethod = "l2";
	} else if (AuthenticationConfig.getAuthenticationAdapterClass(docEntry.getRepository()).equalsIgnoreCase(
					"com.ibm.concord.auth.l3.L3ReverseProxyAuth")) {
		authMethod = "l3";
		authUrl = "/l3base/ui/inside";
	} else {
		authMethod = "localtest";
		authUrl = "/concord/authenticated";
	}

	//root path of static files
	String staticRootPath = ConcordUtil.getStaticRootPath();
	
	//String lotusLiveCss = contextPath + staticRootPath + "/styles/css/lotusliveui.css";
	UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
	String lotusLiveCss = LLIntegrationUtil.getThemeUrl(user == null ? null : user.getId());
	JSONObject authUser = PeopleHandler.parseRequestUser(request);
	String userId = (String)authUser.get("id");
	String lastVisitSheet = UserDocCacheUtil.getCache(userId,docEntry.getDocId(),"sheet");
	String docMimeType = request.getAttribute("doc_mimeType").toString();
%>

<jsp:include page="/WEB-INF/pages/app.jsp"></jsp:include>

<script type="text/javascript">
	var contextPath = "<%=contextPath%>";
	var g_auth = "<%=authMethod%>";
	var g_authUser = JSON.parse('<%= JSONUtil.escape(authUser.toString())%>');
	var g_recentFiles = JSON.parse('<%= JSONUtil.escape(RecentFilesHandler.parseRecentFilesRequest(request).toString())%>');
	var g_customizedFonts = JSON.parse('<%= JSONUtil.escape(I18nUtil.getCustomizedFonts().toString())%>');
	var g_authUrl = "<%=authUrl%>";
	var g_activitiesUrl = "<%=activities%>";
	var	g_docMimeType = "<%= docMimeType %>";	
	var g_hbInterval = <%=hbInterval%>;
	var g_hbTimeout = <%=hbTimeout%>;
	var g_hbRetry = <%=hbRetry%>;
    var g_locale = "<%=locale%>";
	var g_maxSheetRows = <%=maxSheetRows%>;
	var g_partialLevel = <%=partialLevel%>;
	var g_partialRowCnt = <%=partialRowCnt%>;
	var g_maxImgSize = "<%=maxImgSize%>";
	var g_maxTextSize = "<%=maxTextSize%>";
	var g_samlCheckInterval = 1500000;
	var g_concordInDebugMode = false;
	var g_DEBUG = <%=debug %>;
	var g_activity = false;
	var g_lastSheet = '<%=JSONUtil.escape(lastVisitSheet)%>';
	var g_enableSetChart = <%=enableSetChart%>;
	
	var g_enableACL = <%=enalbeACL%>;
	var djConfig = {
		baseUrl: "./",
		parseOnLoad: true,
		isDebug: g_DEBUG,
		locale: "<%= locale %>"
		};
	dojo.locale = "<%= locale %>";

	if(g_concordInDebugMode)
		djConfig.isDebug = true;
			
	var settings = JSON.parse('<%=JSONUtil.escape(PeopleHandler.getRequestUserSettings(request, "sheet").toString())%>');
	
	var staticRootPath = "<%= staticRootPath %>";
	var g_hasNewFeature = <%= NewFeaturesUtil.hasSheetNewFeatures()%>;
</script>

<script type="text/javascript">
	var userAgent = navigator.userAgent.toLowerCase();
	var _isMobile = false;
	//if(userAgent.indexOf('ipad') != -1 && userAgent.indexOf('mobile') != -1 && userAgent.indexOf('safari') == -1)
	//	_isMobile = true;
	
	if(!_isMobile){
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/concord/concord_sheet.js'></scr"+"ipt>");
		
		document.write("<link rel='SHORTCUT ICON' href='<%= contextPath + staticRootPath %>/images/ibmdocs_spreadsheets_16.ico'/>");
		
		document.write("<link rel='stylesheet' type='text/css' href='<%= contextPath + staticRootPath %>/styles/css/websheet/sheet_main.css'>");
		document.write("<link rel='stylesheet' type='text/css' href='<%= contextPath + staticRootPath %>/js/wseditor/css/concord_sheet.css'>");
		
		document.write("<link rel='stylesheet' type='text/css' href='<%= contextPath + staticRootPath %>/styles/css/base.css'>");
		
		/*<!-- this is theme url from SmartCloud, no side impact for on-promise env -->*/
		document.write("<link rel='stylesheet' type='text/css' href='<%=lotusLiveCss%>'>");
	}
	else{
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/concord/concord_sheet_mobile.js'></scr"+"ipt>");
	}
</script>

<style type="text/css">
.tundra .dojoxGridCell {
	outline: medium none;
}
</style>
<style type="text/css">
.divstyle {
	z-index: 100;
	position: absolute;
	background-color: #999999;
}
</style>

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
		if (BidiUtils.isGuiRtl())
            dojo.query("body").addClass("dijitRtl");
		//if(!gIs_cloud){
		//	dojo.query("body").addClass("onpremise");
		//}   			
	});
	dojo.addOnUnload(function() {
		concord.main.App.onUnload(window);
	});
	dojo.addOnWindowUnload(function() {
		concord.main.App.onWindowUnload(window);
	});
	if(concord.util.browser.isMobileBrowser()) {
		document.addEventListener('visibilitychange', function() {
			if (document.visibilityState == 'hidden') {
				pe.scene.saveDraft(true);
			}
		});
	}
	/**
	 * the value should be sum of banner, menubar, toolbar and formular bar
	 * Same with method getHeaderHeight in SheetDocScene.js, need change both together
	 * @returns
	 */
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
    			
    	var formulaBarDiv = dojo.byId("formulaBar_node");
    	if(formulaBarDiv){
	    	if (dojo.isIE)
				height += formulaBarDiv.offsetHeight;
			else
				height += formulaBarDiv.clientHeight;
    	}
    	
    	return height;
    };

	function resize() {
		var sheetNode = dojo.byId("sheet_node"),
			container = dijit.byId('websheet_layout_WorksheetContainer_0'),
			formulaBar = dojo.byId("formulaInputLine"),
			foumularIndentW = 330,
			paneMgr = pe.scene.editor.paneMgr,
			sidebarWidth = paneMgr.getWidth(),
			worksheetHeight = concord.util.browser.getBrowserHeight()- getHeaderHeight() + "px",
			worksheetWidth = concord.util.browser.getBrowserWidth()- sidebarWidth + "px";
		
		try{
			sheetNode.style.width = worksheetWidth;
			sheetNode.style.height = worksheetHeight;
			
			if (container) 
			{
				pe.scene.editor.setWorksheetHeight();
		    	container.domNode.style.width = worksheetWidth;
		    	container.resize();
			}
			
			if(formulaBar)
			{
				formulaBar.style.width = concord.util.browser.getBrowserWidth()-foumularIndentW + "px";
			}
			
			paneMgr.updateHeight(worksheetHeight);
			paneMgr.updateWidth(sidebarWidth + "px");
			paneMgr.resize();
		}catch(e)
		{
			console.log(e);
		}
	};
	dojo.connect(window, "onresize", resize);
	if(window.orientation != undefined) {
		dojo.connect(window, "onorientationchange", function(){
			resize();
		});
		
		//var viewport = document.getElementById("viewport");
		//var scale = 1 / window.devicePixelRatio;
		//viewport.content = "width=device-width, initial-scale=" + scale + ", maximum-scale=" + scale + ", user-scalable=no";
	}
	
}	
</script>

<script type="text/javascript">
	global_init();
</script>

</head>
<body class="oneui30 lotusui30 lotusui30_body onpremise" style="overflow-y: hidden" spellcheck="false">

<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper"></div>
<div id="footer" role="complementary"></div>
</body>
</html>
