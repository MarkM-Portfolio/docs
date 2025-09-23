<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.platform.util.ConcordUtil,
	com.ibm.concord.platform.util.LLIntegrationUtil,
	com.ibm.concord.platform.util.I18nUtil,
	com.ibm.concord.platform.util.ConcordUtil,
	java.net.URLEncoder,
	com.ibm.docs.authentication.IAuthenticationAdapter,
	com.ibm.docs.directory.beans.UserBean,	
	org.apache.commons.lang.StringEscapeUtils"%>
<%
	String locale = I18nUtil.getFallbackLocale(request);
	String x_ua_value = ConcordUtil.getXUACompatible(request);
%>
<html lang ="<%=locale%>">
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<%
  String contextPath = request.getContextPath();
  String secureToken = request.getSession().getAttribute("secureToken").toString();
  String taskId = request.getAttribute("jobId").toString();
  String repoId = request.getAttribute("repoId").toString();
  String docUri = request.getAttribute("docUri").toString();
  String mode = request.getAttribute("mode").toString();
  String isDraft = request.getAttribute("draft").toString();
  String asFormat = StringEscapeUtils.escapeHtml(request.getAttribute("asFormat").toString());
  boolean isAsFormat = (request.getAttribute("asFormat") != null);
  //root path of static files
  String staticRootPath = ConcordUtil.getStaticRootPath();
  //String lotusLiveCss = contextPath + staticRootPath + "/styles/css/lotusliveui.css";
  UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
  String lotusLiveCss = LLIntegrationUtil.getThemeUrl(user == null ? null : user.getId());
  String deepDetectKey = URLEncoder.encode("export_deepdetect_" + docUri + "_" + asFormat, "UTF-8");
  String dirAttr = (locale.startsWith("he") || locale.startsWith("ar")) ? " dir='rtl' " : "";
%>

<title></title>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>
<script type="text/javascript">

	var djConfig = {
		baseUrl: "./",
		parseOnLoad: true,
		isDebug: false,
		locale: "<%=locale%>"
	};
	dojo.locale = "<%= locale %>";
	var staticRootPath = "<%= staticRootPath %>";	
	var contextPath = "<%=contextPath%>";
	
	var VIEW_CONTEXT = {};
	
	VIEW_CONTEXT.secureToken = "<%=secureToken%>"; 
	VIEW_CONTEXT.taskId = "<%=taskId%>";
	VIEW_CONTEXT.repoId = "<%=repoId%>";
	VIEW_CONTEXT.docUri = "<%=docUri%>";
	VIEW_CONTEXT.mode = "<%=mode%>";
	VIEW_CONTEXT.isDraft = "<%=isDraft%>";
	VIEW_CONTEXT.asFormat = "<%=asFormat%>";
	VIEW_CONTEXT.isAsFormat = "<%=isAsFormat%>";
	VIEW_CONTEXT.staticRootPath = "<%=staticRootPath%>";
	
	dojo.addOnLoad(function(){
		dojo.require("concord.scenes.ViewScene");
		var scene = new concord.scenes.ViewScene();
		scene.init();
	});
</script>

<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath %>/images/ibmdocs_product_16.ico" />
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/concord/export.css">
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/concord/export_common.css">
<link rel="stylesheet" type="text/css" href="<%=lotusLiveCss%>">

<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/concord/concord_view.js"></script>

</head>

<body id="body" class="oneui30 lotusui30" style="overflow-y: hidden">
<div id="lotusFrame" class="lotusFrame">
	<div class="lotusErrorBox lotusError">
		<div class="lotusErrorContent"  <%=dirAttr%>>
			<img id="loading" src="<%= contextPath + staticRootPath %>/images/loading32.gif" alt="">
			<div id="form" class="lotusErrorForm">
				<h1 id="scene-title"></h1>
				<p id="scene-message"></p>
				<p id="scene-action"></p>
			</div>
		</div>
	</div>
</div>
</body>
</html>
