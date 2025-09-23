<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"
    import= "java.net.URLEncoder,
    		com.ibm.concord.platform.util.I18nUtil,
    		com.ibm.concord.platform.util.ConcordUtil,
    		com.ibm.docs.authentication.IAuthenticationAdapter,
			com.ibm.docs.directory.beans.UserBean"%>
<%
String contextPath = request.getContextPath();
String locale = I18nUtil.getFallbackLocale(request);
//root path of static files
String staticRootPath = ConcordUtil.getStaticRootPath();
UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
String user_displayName = "";
if(user != null){
	user_displayName = user.getDisplayName();
}
String repoId = (String)request.getAttribute("repoId");
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Files</title>
<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath %>/images/ibmdocs_product_16.ico" />
<link rel="stylesheet" type="text/css" href="<%= contextPath + staticRootPath %>/styles/css/mobile/files.css" />
<style type="text/css">
html,body{
	width: 100%;
	height: 100%;
	margin: 0;
	border: 0;
}
</style>

<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>
<script type="text/javascript">
	dojo.require("dojo.i18n");
	dojo.requireLocalization("mobile.widget", "MobileFilesScene");
	//global js-object
	var fileContext = window.FILES_CONTEXT || (window.FILES_CONTEXT={});
	fileContext.repoId = "<%=repoId%>";
	fileContext.contextPath = "<%=contextPath%>";
	fileContext.staticRootPath = "<%=staticRootPath%>";
	fileContext.resourceBundle = dojo.i18n.getLocalization("mobile.widget", "MobileFilesScene");
	var user = fileContext.user || (fileContext.user={});
	user.userName = "<%=user_displayName%>";
</script>
<script type="text/javascript"><!--

	var djConfig = {
			baseUrl: "./",
			parseOnLoad: true,
			isDebug: false,
			locale: "<%=locale%>"
		};
	dojo.locale = "<%=locale%>"; 
	dojo.require("mobile.scene.MobileFilesScene");
	function updateOrientation(){
		console.log("window.orientation "+window.orientation);
		mobileFilesScene && mobileFilesScene.orientationChanged();
	}
	function windowResize(){
		mobileFilesScene.resize();
	}
	dojo.addOnLoad(function(){
		//buildFileMenuItems();
		mobileFilesScene = new mobile.scene.MobileFilesScene(fileContext.contextPath);
		mobileFilesScene.startup();
		if(typeof(window.orientation) == "undefined"){
			window.onresize = windowResize;
		}
	});
</script>
</head>

<body class="lotusui" onorientationchange="updateOrientation();">
<div class="lotusui_files">
	<div class="lotusui_banner" id="files_banner_node"></div>
	<div class="lotusui_main" id="files_main_node">
		<div id="lotus_leftc" class="lotusui_leftControl"></div>
		<div id="lotus_cnt" class="lotusui_content" >
			<div id="lotus_filesCnt">
				<script>document.write(FILES_CONTEXT.resourceBundle.files_welcome);</script>
			</div>
		</div>
		<div id="placeHolder" class="clear"></div>
	</div>
	<div class="lotusui_foot" id="files_footer_node"></div>
</div>
</body>
</html>
