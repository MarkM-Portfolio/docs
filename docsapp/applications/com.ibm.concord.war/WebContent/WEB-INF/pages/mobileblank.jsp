<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8" 
	import= "com.ibm.concord.platform.util.I18nUtil,
			 com.ibm.concord.platform.util.ConcordUtil,
			 com.ibm.concord.platform.util.JSONUtil,
			 com.ibm.json.java.JSONArray,
			 com.ibm.concord.services.rest.handlers.PeopleHandler"%>
<%
String contextPath = request.getContextPath();
String staticRootPath = ConcordUtil.getStaticRootPath();
String locale = I18nUtil.getFallbackLocale(request);
String PRODUCT_NAME = I18nUtil.getProductName(request);
// Get the entitlement information for this user.
String entitleStr = "";
Object entitleObj = request.getAttribute("IBMDocs_Entitlements");
if (entitleObj instanceof JSONArray)
{
	JSONArray entitleArray = (JSONArray) entitleObj;
	entitleStr = entitleArray.toString();
}
%>    		
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/concord/concord_text.js"></script>

<script type="text/javascript">
	dojo.require("dojo.cookie");
	dojo.require("concord.util.browser");
	dojo.require("concord.util.mobileUtil");
	dojo.require("concord.util.uri");
	dojo.require("concord.beans.Document");
	
	var contextPath = "<%= contextPath %>";
	var g_locale = "<%= locale %>";
	var g_authUser = JSON.parse('<%= JSONUtil.escape(PeopleHandler.parseRequestUser(request).toString())%>');	
	var g_EntitlementsStr = '<%= entitleStr %>';
	window.pe = new concord.main.App();
	window.pe.authenticatedUser = window.pe.loadAuthentication();
	window.pe.overrideXhr();
	DOC_SCENE = {};
	
	try
	{
		var events = [];
		var params = [];
		events.push({"name":"blankInit", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
	catch(err)
	{
		alert(err.message);
	}
</script>
<title><%=PRODUCT_NAME%></title>
</head>
<body>

</body>
</html>