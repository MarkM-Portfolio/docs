<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
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
		<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no"/> 
		<meta name="apple-mobile-web-app-capable" content="yes" /> 
		<meta name="apple-mobile-web-app-status-bar-style" content="black" /> 
		<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<title><%=PRODUCT_NAME%></title>

<%
	boolean isDraft = true;
	if (request.getAttribute("draft") != null)
	{
		isDraft = ((Boolean) request.getAttribute("draft")).booleanValue();
	}
	String jobId = (String)request.getAttribute("jobId");
	boolean isOdfDraft = false;
	if (request.getAttribute("odfdraft") != null)
	{
		isOdfDraft = ((Boolean) request.getAttribute("odfdraft")).booleanValue();
	}
 	String contextPath = request.getContextPath();
 	int hbInterval = SessionConfig.getHeartBeatInterval()*1000;
 	int hbTimeout = SessionConfig.getHeartBeatTimeout()*1000;
 	int hbRetry = SessionConfig.getHeartBeatRetryCount();
 	int maxImgSize = 8192;

 	String activities = ConcordUtil.getActivitiesUrl();
    	
	JSONObject compConfig = ConcordConfig.getInstance().getSubConfig("component");
	JSONArray compsObj = (JSONArray)compConfig.get("components");
	for(int i=0;i<compsObj.size();i++){
	    JSONObject jo =(JSONObject)compsObj.get(i);
	    Object id = jo.get("id");
	    if("com.ibm.concord.platform.task".equals(id.toString())){
	        JSONObject configObj = (JSONObject)jo.get("config");
	        if(configObj!=null){
			} 
	    }
	    else if("com.ibm.concord.document.services".equals(id.toString())){
	         	
	    	JSONObject configObj = (JSONObject)jo.get("config");
	    	if(configObj != null)
	    	{
	         	// Because of the common backend framework, the image file size is the same so we will use the limit from the 
	         	JSONArray providersObj = (JSONArray)configObj.get("providers");
	    		if(providersObj != null)
	    		{
	    			for(int j=0; j<providersObj.size();j++)
	    			{
	    				JSONObject provider = (JSONObject)providersObj.get(j);
	    				Object name = provider.get("name");
	    				if(name != null && "pres".equals(name))
	    				{
	    				
	    					JSONObject presConfig = (JSONObject)provider.get("config");
	    					if(presConfig == null)
	    						break;
	    					
	    					JSONObject limits = (JSONObject)presConfig.get("limits");
	    					if(limits == null)
	    						break;
	
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
	//root path of static files
	String staticRootPath = ConcordUtil.getStaticRootPath();
	
	//String lotusLiveCss = contextPath + staticRootPath + "/styles/css/lotusliveui.css";
	UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
	String lotusLiveCss = LLIntegrationUtil.getThemeUrl(user == null ? null : user.getId());
%>


<jsp:include page="/WEB-INF/pages/app.jsp"></jsp:include>

<script type="text/javascript">
	DOC_SCENE.isOdfDraft = <%= isOdfDraft %>;
	var contextPath = "<%= contextPath %>";
	var g_authUser = JSON.parse('<%= JSONUtil.escape(PeopleHandler.parseRequestUser(request).toString())%>');
	var g_recentFiles = JSON.parse('<%= JSONUtil.escape(RecentFilesHandler.parseRecentFilesRequest(request).toString())%>');
	var g_customizedFonts = JSON.parse('<%= JSONUtil.escape(I18nUtil.getCustomizedFonts().toString())%>');
	var g_activitiesUrl = "<%=activities%>";
	var g_hbInterval = <%= hbInterval %>;
	var g_hbTimeout = <%= hbTimeout %>;
	var g_hbRetry = <%= hbRetry %>;
	var g_maxImgSize = <%= maxImgSize %>;
	var g_concordInDebugMode = false;
	var g_presentationMode = true;
	var g_mobileFlag = false;
	var g_slideShow = null;
	var g_slideShowDataEvt = null;
	var g_htmlPrintDataEvt = null;
	var g_draft = "<%=isDraft%>";
	var g_jobId = "<%=jobId%>";
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
		
	var settings = JSON.parse('<%=JSONUtil.escape(PeopleHandler.getRequestUserSettings(request, "pres").toString())%>');	  	
		
	//for view mode
	var g_viewPageWindow;  //a pointer to the new window opened where the view mode is displayed
	var g_viewPageHtmlContent="";  // to hold the html string to pass into the view mode window to be displayed, comments and tasks are cleaned

	var staticRootPath = "<%= staticRootPath %>";	
	var g_hasNewFeature = <%= NewFeaturesUtil.hasPresNewFeatures()%>;
	
</script>


<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath %>/images/ibmdocs_presentations_16.ico" />
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/js/dijit/themes/oneui30/oneui30.css" />
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/base.css" />
<!-- this is theme url from SmartCloud, no side impact for on-promise env -->
<link rel="stylesheet" type="text/css" href="<%=lotusLiveCss%>" />
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/presentation2/all.css"/>

<script type="text/javascript">
try {
	if ((window.opener && window.opener.jasmine)) {
		// is running in jasmine environment
		// issue a dojo script load for jasmine code
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/util/jasmine-1.3.1/jasmine.js'></scr"+"ipt>");
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/util/jasmine-1.3.1/jasmine-html.js'></scr"+"ipt>");
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/concord/tests/jasmine_startup.js'></scr"+"ipt>");
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/concord/tests/jasmine_api_test_support.js'></scr"+"ipt>");
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/concord/tests/jasmine_doh_adapter.js'></scr"+"ipt>");
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/presentation/test/utils.js'></scr"+"ipt>");
		document.write("<scr"+"ipt type='text/javascript' src='<%= contextPath + staticRootPath %>/js/presentation/test/apiutils.js'></scr"+"ipt>");
		
		if (window.parent.startTimer) {
			// in perf API test, record start timer
			window.parent.startTimer("loading");
		}
		
		var _jasmineDeferred = new dojo.Deferred();
	}
} catch (e) {
	;
}
</script>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/concord/concord_pres.js"></script>
</head>
<body class="oneui30 lotusui30 lotusui30_body scloud3 concord onpremise">
<div id="banner" role="banner"></div>
<div id="header"></div>
<div id="mainNode" class="wrapper"></div>
<div id="footer" role="complementary"></div>
</body>
</html>
