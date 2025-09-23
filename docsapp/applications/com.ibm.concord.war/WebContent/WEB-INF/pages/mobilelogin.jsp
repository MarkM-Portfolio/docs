<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"
    import= "java.net.URLEncoder,
    		com.ibm.concord.platform.util.I18nUtil,
    		com.ibm.concord.platform.util.ConcordUtil"%>
<%
String contextPath = request.getContextPath();

String loginUri = request.getContextPath() + "/j_security_check";
boolean loginFailed = Boolean.valueOf(request.getParameter("error")).booleanValue();
String redirectUrl = (String)request.getAttribute("redirect");
if (redirectUrl != null)
{
  redirectUrl = URLEncoder.encode(redirectUrl, "utf-8");
}else{
	//we force it to goto /docs/app/files
	//String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+contextPath+"/";
	//redirectUrl = URLEncoder.encode(basePath +"app/files","utf-8");
}
String locale = I18nUtil.getFallbackLocale(request);
String PRODUCT_NAME = I18nUtil.getProductName(request);
//root path of static files
String staticRootPath = ConcordUtil.getStaticRootPath();
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Login <%=PRODUCT_NAME%></title>
<link rel="SHORTCUT ICON" href="<%= contextPath + staticRootPath %>/images/ibmdocs_product_16.ico" />

<style type="text/css">
html,body{
	width: 100%;
	height: 100%;
	margin: 0;
	padding 0;
}
body.lotusui {
	color:#FFFFFF !important;
	font:75%/1.5em Arial,Helvetica,sans-serif #FFFFFF;
	background: #000000 url('<%= contextPath + staticRootPath %>/images/lc3/texture_mobilebg.png') repeat center;
}
.lotusui_login .lotusLoginBoxWide {
	width:400px;
	-webkit-border-radius: 5px;
	border-radius: 5px;
}

.lotusui_login .lotusLoginBox {
	background-color:#333333;
	border:2px solid #222222;
	-webkit-box-shadow: 2px 2px 3px #111111;
	box-shadow: 2px 2px 3px #111111;
	
	 border-radius: 0 0 5px;
    -webkit-border-bottom-right-radius: 5px;
    -webkit-border-bottom-left-radius: 5px;
	margin:60px auto 10px;
	padding:0;
}

.lotusContent .lotusErrorBox {
	-moz-box-shadow:0 2px 10px #999999;
	-webkit-box-shadow: 0px 2px 8px #999999
}

.lotusui_login .lotusLoginContent {
	padding:10px 15px 10px 20px;
	position:relative;
}

.lotusui p {
	margin:5px 0 0;
}

.lotusui a, .lotusui a:visited {
	color:#105CB6;
	text-decoration:none;
}
.lotusui_login .lotusLoginBox .lotusLoginTitle{
	width: 100%;
	height: 32px;
	background-color: #111111;
	-webkit-border-top-left-radius: 5px;
	-webkit-border-top-right-radius: 5px;
	border-radius: 0 0 5px;
	background-image: -webkit-gradient(linear, left top, left 50%, from(#777777), to(#000000));
	background-image: -moz-linear-gradient(top, #777777 , #000000 50%);
}
.lotusLoginTitle .lotusLogo{
	margin: 0px auto 0px;
	padding-top: 5px;
	text-align: center !important;
}
.lotusLoginTitle .lotusAltText{
	
	font-weight:bold;
}
.lotusui_login .lotusLoginBoxWide .lotusLoginForm {
	padding:15px 0px;
	background-color:transparent;
	position:relative;
	margin: 7px;
}


.lotusui button, .lotusui input, .lotusui select {
	font-family:Arial,Helvetica,sans-serif;
	font-size:1em;
}

.lotusLoginForm .lotusFormError {
	font-weight:bold;
	margin-bottom:5px;
	color:#FF0000;
}

.lotusLoginForm p {
	clear:none;
	margin:10px 0 0;
	padding:0;
	width:auto;
}
.lotusLoginForm .lotusFormField {
	margin-bottom:10px;
}

.lotusui_login .lotusLoginForm label {
	font-family:Arial,Helvetica,sans-serif;
	font-size:1em;
	margin-bottom:3px;
	color:#EEEEEE;
	display:block;
	width:99%;
	letter-spacing: 1px;
}

.lotusui_login .lotusLoginForm .lotusText {
	width:  330px;
	height: 30px;
}

.lotusLoginForm .lotusText, .lotusLoginForm textarea, .lotusLoginForm select {
	border:1px solid #AAAAAA;
	padding:2px;
}

.lotusui_login .lotusLoginForm .lotusBtnContainer {
	margin-top:20px;
	width: 99%;
	overflow:hidden;
	white-space:nowrap;
}

.lotusBtn, .lotusFormButton, .lotusBtnImg {
	border-width:0;
	font-weight:bold;
	text-align:center !important;
}
input.lotusBtn, button.lotusBtn {
	margin-right:5px;
}
input.lotusBtn, button.lotusBtn, input.lotusFormButton, button.lotusFormButton {
	cursor:pointer;
	display: block;
	width: 280px;
	margin: 2px 25px 2px;
}
.lotusBtn a, input.lotusBtn, button.lotusBtn, input.lotusFormButton, button.lotusFormButton, .lotusBtnImg {
	background-color: #0080ab;
	background-image: -moz-linear-gradient(top,#1170ac ,#0080ab 50%);
	background-image: -webkit-gradient(linear, left top, left 50%, from(#1170ac), to(#0080ab));
	text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
	-webkit-box-shadow: 4px 4px 6px #111111;
	-webkit-border-radius: 5px;
	border-radius: 5px;
}
.lotusBtn a, input.lotusBtn, button.lotusBtn, input.lotusFormButton, button.lotusFormButton, .lotusBtnImg {
	background-color:#F1F1F1;
	font-size: 1.0em;
	color: #FFFFFF !important;
	line-height:1.7em;
}
</style>

<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/dojo/dojo.js"></script>
<script type="text/javascript" src="<%= contextPath + staticRootPath %>/js/concord/concord_text.js"></script>

<script type="text/javascript">
	dojo.require("dojo.i18n");
	dojo.require("dojo.string");
	dojo.require("concord.util.strings");
	dojo.requireLocalization("concord.scenes", "LoginScene");
	var djConfig = {
			baseUrl: "./",
			parseOnLoad: true,
			isDebug: false,
			locale: "<%=locale%>"
		};
	dojo.locale = "<%=locale%>"; 
	var resourceBundle = dojo.i18n.getLocalization("concord.scenes", "LoginScene");
	dojo.addOnLoad(function(){
		document.title = dojo.string.substitute(resourceBundle.login_title, { 'productName' : concord.util.strings.getProdName() });
		try {document.getElementById("mobileUserName").focus();} catch (e) {};
	});
	
	var events = [];
	var params = [location.href];
	events.push({"name":"login", "params":params});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	
</script>
</head>

<body class="lotusui lotusui_login">
<div class="lotusLoginBox lotusLoginBoxWide">
		<div class="lotusLoginTitle">
			<div class="lotusLogo" ><span class="lotusAltText"><%=PRODUCT_NAME%> Login</span></div>
		</div>
      <div class="lotusLoginContent">
         <form class="lotusLoginForm" role="main" method="post" action="<%=loginUri %>">
			<%
				if (redirectUrl != null)
				{
			%>
				<input id="redirect" type="hidden" name="redirect" value="<%=redirectUrl %>"/>
			<%
				}
			 %>
            
			<%
				if (loginFailed)
				{
			 %>
            <div role="alert" id="loginError" class="lotusFormError"></div><script>document.getElementById("loginError").innerHTML = resourceBundle.login_error;</script>
			 <%}%>
            
            <p class="lotusFormField">
               <label id="lblMobileUserName" for="mobileUserName"></label><script>document.getElementById("lblMobileUserName").innerHTML = resourceBundle.login_label_username;</script>
               <input id="mobileUserName" autocapitalize="off" autocorrect="off" autocomplete="off" aria-required="true" aria-invalid="true" class="lotusText" name="j_username" type="text" />
            </p>
            <p class="lotusFormField">
               <label id="lblMobilePassword" for="mobilePassword"></label><script>document.getElementById("lblMobilePassword").innerHTML = resourceBundle.login_label_password;</script>
               <input id="mobilePassword" aria-required="true" aria-invalid="true" class="lotusText" name="j_password" type="password" autocomplete="off" />
            </p>
            <div class="lotusBtnContainer"><input id="btnLogin" class="lotusBtn lotusBtnSpecial" value="" type="submit" /></div><script>document.getElementById("btnLogin").value = resourceBundle.login_button;</script>
         </form>
      </div>
</div>
</body>
</html>