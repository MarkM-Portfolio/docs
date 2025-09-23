<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.json.java.JSONObject,
	    	com.ibm.json.java.JSONArray,
			com.ibm.concord.config.ConcordConfig,
			com.ibm.concord.spi.task.IActivityAdapter,
			com.ibm.concord.session.SessionConfig,
			com.ibm.concord.platform.util.ConcordUtil,
			com.ibm.concord.platform.util.LLIntegrationUtil,
			com.ibm.concord.platform.util.JSONUtil,
			com.ibm.concord.platform.util.I18nUtil,
			com.ibm.concord.services.rest.handlers.RecentFilesHandler,
			com.ibm.concord.services.rest.handlers.PeopleHandler"%>
<% 
	String locale = I18nUtil.getFallbackLocale(request);
	String PRODUCT_NAME = I18nUtil.getProductName(request);
	String x_ua_value = ConcordUtil.getXUACompatible(request);
%>			
<html lang ="<%=locale%>">
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
<title><%=PRODUCT_NAME%></title>

<%	
	
 	String contextPath = request.getContextPath();
 	String authMethod = "";
 	String authUrl = "";
 	String filerUrl = "";
 	String activitiesUrl = "";
 	int hbInterval = SessionConfig.getHeartBeatInterval()*1000;
 	int hbTimeout = SessionConfig.getHeartBeatTimeout()*1000;
 	int hbRetry = SessionConfig.getHeartBeatRetryCount();
 	int maxCharacter = 0;
 	int maxHtmlSize = 0;
 	int maxImgSize = 8192;
 	String logLevel = "none";
 	int logSize = 0;
 	
	String activities = ConcordUtil.getActivitiesUrl();

	JSONObject compConfig = ConcordConfig.getInstance().getSubConfig("component");
	JSONArray compsObj = (JSONArray)compConfig.get("components");
	for(int i=0;i<compsObj.size();i++){
	    JSONObject jo =(JSONObject)compsObj.get(i);
	    Object id = jo.get("id");
	    if("com.ibm.concord.document.services".equals(id.toString()))
	    {
	    	JSONObject configObj = (JSONObject)jo.get("config");
	    	if(configObj != null)
	    	{
	    		JSONArray providersObj = (JSONArray)configObj.get("providers");
	    		if(providersObj != null)
	    		{
	    			for(int j=0; j<providersObj.size();j++)
	    			{
	    				JSONObject provider = (JSONObject)providersObj.get(j);
	    				Object name = provider.get("name");
	    				if(name != null && "text".equals(name))
	    				{
	    					JSONObject textConfig = (JSONObject)provider.get("config");
	    					if(textConfig == null)
	    						break;
	    					
	    					JSONObject limits = (JSONObject)textConfig.get("limits");
	    					if(limits == null)
	    						break;
	    					
	    					Object characterCnt = limits.get("max-character-count");
	    					if(characterCnt != null)
	    					{
	    						String cnt = characterCnt.toString();
	    						maxCharacter = 1024 * Integer.parseInt(cnt);
	    					}
	    					
	    					Object maxSize = limits.get("max-html-size");
	    					if(maxSize != null)
	    					{
	    						String size = maxSize.toString();
	    						maxHtmlSize = 1024 * Integer.parseInt(size);
	    					}
	    					
	    					Object maxImageSize = limits.get("max-image-size");
	    					if( maxImageSize != null )
	    					{
	    					
	    						maxImgSize = Integer.parseInt(maxImageSize.toString());
	    					}
	    					
	    					break;
	    				}
	    			}
	    		}
	    	}
	    }
	}
	
	JSONObject logConfig = ConcordConfig.getInstance().getSubConfig("log");
	if (logConfig != null)
	{
		Object level = logConfig.get("level");
		if (level != null)
			logLevel = level.toString();
		Object size = logConfig.get("size");
		if (size != null)
			logSize = Integer.parseInt(size.toString());
	}
	
	//root path of static files
String staticRootPath = ConcordUtil.getStaticRootPath();
	
	//String lotusLiveCss = contextPath + staticRootPath + "/styles/css/lotusliveui.css";
    String lotusLiveCss = LLIntegrationUtil.getThemeUrl(null);
%>

<jsp:include page="/WEB-INF/pages/revapp.jsp"></jsp:include>

<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>

<script type="text/javascript">
	var contextPath = "<%= contextPath %>";
	var g_authUser = JSON.parse('<%= JSONUtil.escape(PeopleHandler.parseRequestUser(request).toString())%>');
	var g_recentFiles = JSON.parse('<%= JSONUtil.escape(RecentFilesHandler.parseRecentFilesRequest(request).toString())%>');
	var g_customizedFonts = JSON.parse('<%= JSONUtil.escape(I18nUtil.getCustomizedFonts().toString())%>');
	var g_activitiesUrl = "<%=activities%>";
	var g_hbInterval = <%= hbInterval %>;
	var g_hbTimeout = <%= hbTimeout %>;
	var g_hbRetry = <%= hbRetry %>;
	var g_maxCharacterCount = <%= maxCharacter %>;
	var g_maxHtmlSize = <%= maxHtmlSize %>;
	var g_maxImgSize = <%= maxImgSize %>;
	var g_concordInDebugMode = false;
	var g_locale = "<%= locale %>";
	var g_activity = false;
	var djConfig = {
		baseUrl: "./",
		parseOnLoad: true,
		isDebug: false,
		locale: "<%= locale %>"
		};
	dojo.locale = "<%= locale %>";
	if(g_concordInDebugMode)
		djConfig.isDebug = true;
		
	var settings = JSON.parse('<%=JSONUtil.escape(PeopleHandler.getRequestUserSettings(request, "text").toString())%>');	
	//for view mode
	var g_viewPageWindow;  //a pointer to the new window opened where the view mode is displayed
	var g_viewPageHtmlContent="";  // to hold the html string to pass into the view mode window to be displayed, comments and tasks are cleaned
	var staticRootPath = "<%= staticRootPath %>";	
	var g_logLevel = "<%= logLevel %>";
	var g_logSize = "<%= logSize %>";
</script>


<script type="text/javascript" src="<%=  contextPath + staticRootPath %>/js/concord/concord_text.js"></script>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/document/ckeditor/ckeditor.js"></script>

<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath %>/images/ibmdocs_product_16.ico" />

<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/document/document_main.css">
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/js/writer/css/concord_document.css">
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/base.css">
<link rel="stylesheet" type="text/css" href="<%=lotusLiveCss%>">
<!-- this is theme url from SmartCloud, no side impact for on-promise env -->
<link rel="stylesheet" type="text/css" href="/theming/theme/css">

<!-- own styles -->
<script type="text/javascript">
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
		function onFontResize( e, args ){
			if(args[0].iDelta != 0 && pe.scene.resizeSidebarDiv ){
				pe.scene.resizeSidebarDiv(true);   
			}
		}
		// id of element to check for and insert control
		FontResizeDetector.TARGET_ELEMENT_ID = 'header';
		FontResizeDetector.addEventListener(onFontResize,null );		
	});
	dojo.addOnUnload(function() {
		concord.main.App.onUnload(window);
		FontResizeDetector.stopDetector();
	});
	dojo.addOnWindowUnload(function() {
		concord.main.App.onWindowUnload(window);
	});
	
</script>

</head>
<body class="lotusliveui lotusliveui30 oneui30 lotusui30 onpremise" style="overflow:hidden;">
<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper"></div>
<div id="footer" role="complementary"></div>
</body>
</html>
