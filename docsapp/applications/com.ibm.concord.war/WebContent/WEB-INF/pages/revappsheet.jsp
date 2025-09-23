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
			com.ibm.concord.services.rest.handlers.PeopleHandler"%>
<% 
	String locale = I18nUtil.getFallbackLocale(request);
	String PRODUCT_NAME = I18nUtil.getProductName(request);
	String x_ua_value = ConcordUtil.getXUACompatible(request);
%>			
<html lang ="<%=locale%>">
<head>
<title><%=PRODUCT_NAME%></title>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<%
	String contextPath = request.getContextPath();
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
	
    String lotusLiveCss = LLIntegrationUtil.getThemeUrl(null);
    JSONObject authUser = PeopleHandler.parseRequestUser(request);
    String userId = (String)authUser.get("id");
    String lastVisitSheet = UserDocCacheUtil.getCache(userId,docEntry.getDocId(),"sheet");
    String docMimeType = request.getAttribute("doc_mimeType").toString();
%>

<jsp:include page="/WEB-INF/pages/revapp.jsp"></jsp:include>

<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>

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
</script>

<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/antlr/antlr3-all-min.js"></script>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/parser/LexerParser.js"></script>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/concord/concord_sheet.js"></script>

<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath %>/images/ibmdocs_product_16.ico" />
<style type="text/css">
.tundra .dojoxGridCell {
	outline: medium none;
}
</style>

<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/websheet/sheet_main.css">
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/js/wseditor/css/concord_sheet.css">

<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/base.css">
<link rel="stylesheet" type="text/css" href="<%=lotusLiveCss%>">
<!-- this is theme url from SmartCloud, no side impact for on-promise env -->
<link rel="stylesheet" type="text/css" href="/theming/theme/css">
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
		var h, WorksheetHeight,width;		
		var foumularIndentW = 330;//254; 
		h = dojo.byId("sheet_node");
		var size;
		
		WorksheetHeight = concord.util.browser.getBrowserHeight()- getHeaderHeight() + "px";
				
		var sidebar = pe.scene && pe.scene.getSidebar();		
		var sidebarDiv = dojo.byId('ll_sidebar_div');
		var sidebarWidth = 0;
//		if( sidebarDiv && sidebar && !sidebar.isHidden() )
		if( sidebarDiv && sidebar )
		{//sidebar shown
			if(sidebar.isCollapsed())
			{//sidebar collapsed
				sidebarWidth = sidebar.getMinWidth();
			}
		  else
			{// sidebar expanded
				sidebarWidth = sidebar.getMaxWidth();
			}
			try{
				sidebarDiv.style.height = WorksheetHeight;
			}catch(e){				
			}
		}
		
		try{
			h.style.width = concord.util.browser.getBrowserWidth()-sidebarWidth+"px";
			h.style.height = WorksheetHeight;
		}catch(e){				
		}
		
		var container = dojo.byId('websheet_layout_WorksheetContainer_0');
		if (container) {
			try{
				container.style.height = WorksheetHeight;	
			}catch(e){				
			}
		    container.style.width = h.style.width;	    			    
		}

		var formulaBar = dojo.byId("formulaInputLine");
		if (formulaBar) {
			try{
				formulaBar.style.width = concord.util.browser.getBrowserWidth()-foumularIndentW + "px";
			}catch(e){				
			}
		}
			
		if(sidebarDiv)
		{
		  	if(dojo.isIE)
		  	{
		  		setTimeout( function() { concord.widgets.sidebar.SideBar.resizeSidebar(); }, 200 );
		  	}
		    else
		    {
		  	  concord.widgets.sidebar.SideBar.resizeSidebar();
		    }
		}
		
	}
	dojo.connect(window, "onresize", resize);
}	
</script>

<script type="text/javascript">
var formulaLexerParserPath = "<%= contextPath + staticRootPath %>/js/parser/FormulaLexerParser.js";
if(dojo.isIE)
{
	// IE need to load the js first.
	// IE8, sometimes, the stop script dialog will popup, leave some time for browser breath during script downloading and executing.
	setTimeout(function(){
		var head = document.getElementsByTagName("head")[0];
		var script = dojo.create("script", {src: formulaLexerParserPath}, head);
		script.onreadystatechange = function(e){
			if (script.readyState == "loaded" || script.readyState == "complete") {  
				setTimeout(global_init, 0);
    		} 
		}
	}, 0);
}
else
{
	global_init();
}
</script>

</head>
<body class="oneui30 lotusui30 lotusliveui lotusliveui30 onpremise" style="overflow-y: hidden" spellcheck="false">

<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper"></div>
<div id="footer" role="complementary"></div>
</body>
</html>
