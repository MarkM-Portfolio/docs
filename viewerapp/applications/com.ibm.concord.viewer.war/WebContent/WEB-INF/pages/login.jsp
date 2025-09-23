<!--
/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
-->
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"
    import= "java.net.URLEncoder,com.ibm.concord.viewer.platform.util.ViewerUtil"%>
<%
  String contextPath = request.getContextPath();
  String staticResPath =  ViewerUtil.getStaticRootPath();
  String loginUri = request.getContextPath() + "/j_security_check";
  boolean loginFailed = Boolean.valueOf(request.getParameter("error")).booleanValue();
  String redirectUrl = (String) request.getAttribute("redirect");
  redirectUrl = URLEncoder.encode(redirectUrl, "utf-8");
  String locale = ViewerUtil.getFallbackLocale(request);
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang='<%=locale%>'>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title></title>
<link rel="SHORTCUT ICON" href="<%=staticResPath%>/images/ibmdocs_product_16.ico" />

<style type="text/css">
.lotusBanner {
	background-color:#000000;
	background-image:-moz-linear-gradient(center top , #525252 0%, #000000 100%);
	padding:0 10px;
	overflow:hidden;
	text-align:left;
}
body.lotusui {
	color:#222222;
	font:75%/1.5em Arial,Helvetica,sans-serif;
}

.lotusLogin2 .lotusBanner .lotusLogo {
	padding-bottom:6px;
}
.lotusBanner .lotusLogo {
	margin-left:5px;
	margin-top:7px;
	float:left;
	margin-right:20px;
}
.lotusui .lotusLogo, .lotusLoginLogo {
	height:18px;
	width:104px;
}

.lotusLogin2 .lotusLoginBoxWide {
	width:725px;
}

.lotusLogin2 .lotusLoginBox {
	background-color:#FFFFFF;
	border:1px solid #CCCCCC;
	margin:30px auto 10px;
	padding:0;
}

.lotusContent, .lotusLoginBox, .lotusErrorBox {
	-moz-box-shadow:0 2px 10px #EEEEEE;
}

.lotusLogin2 .lotusLoginBoxWide .lotusLoginContent {
	padding-left:25px;
}
.dijitRtl.lotusLogin2 .lotusLoginBoxWide .lotusLoginContent {
	padding-right:25px;
	direction: rtl;
}

.lotusLogin2 .lotusLoginContent {
	padding:20px 25px 20px 40px;
	position:relative;
}

.lotusLogin2 .lotusDescription {
	float:left;
	margin-top:25px;
	padding-left:5px;
	width:205px;
}
.dijitRtl.lotusLogin2 .lotusDescription {
	float:right;
	padding-right:5px;
	padding-left:0;
}

.lotusLogin2 .lotusLoginBox h2 {
	font-size:1.1em;
	font-weight:bold;
	line-height:1.3em;
	margin:20px 0 5px;
}

.lotusui h2 {
	color:#444444;
	padding:0;
}

.lotusui p {
	margin:5px 0 0;
}

.lotusui a, .lotusui a:visited {
	color:#105CB6;
	text-decoration:none;
}

.lotusLogin2 .lotusLoginBoxWide .lotusLoginForm {
	border-color:-moz-use-text-color -moz-use-text-color -moz-use-text-color #CCCCCC;
	border-style:none none none solid;
	border-width:0 0 0 1px;
	margin-left:245px;
	padding-left:40px;
}

.dijitRtl.lotusLogin2 .lotusLoginBoxWide .lotusLoginForm {
	border-color:-moz-use-text-color #CCCCCC -moz-use-text-color -moz-use-text-color;
	border-style:none solid none none;
	border-width:0 1px 0 0;
	margin-right:245px;
	padding-right:40px;
	margin-left:0;
	padding-left:0;
}
.lotusLogin2 .lotusForm2 {
	background-color:transparent;
}
.lotusLogin2 .lotusLoginForm {
	padding:20px 0;
	position:relative;
}
.lotusForm2 {
	margin:0;
}

.lotusLogin2 .lotusLoginBox h1 {
	font-size:1.83333em;
	font-weight:normal;
	margin-bottom:25px;
}
.lotusui h1 {
	color:#444444;
	line-height:1.2em;
	margin:0;
	padding:0;
}

.lotusui button, .lotusui input, .lotusui select {
	font-family:Arial,Helvetica,sans-serif;
	font-size:1em;
}

.lotusLogin2 .lotusForm2 .lotusFormError {
	margin-bottom:-10px;
}
.lotusForm2 .lotusFormError {
	font-weight:bold;
	margin-bottom:5px;
}
.lotusFormError {
	color:#FF0000;
}

.lotusLogin2 .lotusLoginForm p {
	clear:none;
	margin:15px 0 0;
	padding:0;
	width:auto;
}
.lotusForm2 .lotusFormField {
	margin-bottom:10px;
}

.lotusLogin2 .lotusLoginForm label {
	margin-bottom:3px;
}
.lotusForm2 label {
	color:#222222;
	display:block;
	font-weight:bold;
	width:99%;
}

.lotusLogin2 .lotusLoginForm .lotusText {
	width:20em;
}
.lotusForm2 .lotusText {
	width:99%;
}
.lotusForm2 .lotusText, .lotusForm2 textarea, .lotusForm2 select {
	border:1px solid #AAAAAA;
	padding:1px;
}

.lotusui .lotusRight {
	float:right;
	text-align:right;
}
.dijitRtl.lotusui .lotusRight {
	float:left;
	text-align:left;
}

.lotusLogin2 .lotusLoginForm img {
	margin-top:25px;
}
.lotusui .lotusIBMLogo {
	background-repeat:no-repeat;
	height:23px;
	width:64px;
}
.lotusui img {
	border:0 none;
	vertical-align:middle;
}

.lotusui .lotusAltText {
	display:block;
	color:#FFF;
}

.lotusLogin2 .lotusLoginForm .lotusBtnContainer {
	margin-top:25px;
}
.lotusBtnContainer {
	margin-bottom:0;
	overflow:hidden;
	padding-bottom:0;
	white-space:nowrap;
}

.lotusBtn a, input.lotusBtn, button.lotusBtn, input.lotusFormButton, button.lotusFormButton, .lotusBtnImg {
	-moz-border-radius:2px 2px 2px 2px;
	border:1px solid #AAAAAA;
	color:#000000 !important;
}
input.lotusBtn, button.lotusBtn {
	margin-right:5px;
}
input.lotusBtn, button.lotusBtn, input.lotusFormButton, button.lotusFormButton {
	cursor:pointer;
	padding:2px 7px 3px;
}
.lotusBtn a, input.lotusBtn, button.lotusBtn, .lotusFormButton {
	font-size:0.9em;
	line-height:1.7em;
}
.lotusBtn a, input.lotusBtn, button.lotusBtn, input.lotusFormButton, button.lotusFormButton, .lotusBtnImg {
	background-color:#F1F1F1;
	background-image:-moz-linear-gradient(center top , #FFFFFF 0%, #EBEBEB 100%);
}
.lotusui button, .lotusui input, .lotusui select {
	font-family:Arial,Helvetica,sans-serif;
}
.lotusBtn, .lotusFormButton, .lotusBtnImg {
	border-width:0;
	font-weight:bold;
	text-align:center !important;
}

.lotusLogin2 .lotusLegal {
	color:#666666;
	margin:0 auto;
	text-align:center;
}

.lotusLegal .lotusLicense {
	color:#666666;
}
table.lotusLegal td {
	padding:5px;
	vertical-align:middle;
}
table.lotusLegal td {
	font-size:0.8em;
	line-height:1.2em;
}
</style>

<jsp:include page="/WEB-INF/pages/product.jsp"></jsp:include>

<script type="text/javascript" src="<%=staticResPath%>/js/dojo/dojo.js" djconfig="locale: '<%=locale%>'"></script>
<script type="text/javascript">
	dojo.require("dojo.i18n");
	dojo.require("dojo.string");
	dojo.requireLocalization("viewer.scenes", "LoginScene");
	var resourceBundle = dojo.i18n.getLocalization("viewer.scenes", "LoginScene");
	document.title = dojo.string.substitute(resourceBundle.login_title, { 'productName' : window.g_prodName });
</script>
</head>

<body class="lotusui lotusLogin2" onload="load();">
<div class="lotusBanner" role="banner">
	<div class="lotusLogo" id="lotusLogo"><span class="lotusAltText">HCL Connections</span></div>
</div>
<div class="lotusLoginBox lotusLoginBoxWide" role="main">
      <div class="lotusLoginContent">
         <div class="lotusDescription">

            <h2 id="h2WhatIs"></h2><script>document.getElementById("h2WhatIs").innerHTML =  dojo.string.substitute(resourceBundle.login_whatis_symphony, { 'productName' : window.g_prodName });</script>
            <p id="pFindOut"></p><script>document.getElementById("pFindOut").innerHTML = dojo.string.substitute(resourceBundle.login_find_out, ['<a href="http://www-306.ibm.com/software/lotus/products/connections/">ibm.com</a>']);</script>
            <h2 id="h2HaveQuest"></h2><script>document.getElementById("h2HaveQuest").innerHTML = resourceBundle.login_have_question;</script>
            <p><a href="http://www.lotus.com/ldd/lcwiki.nsf" id="hrefTry"></a></p><script>document.getElementById("hrefTry").innerHTML = dojo.string.substitute(resourceBundle.login_try_documentation, { 'productName' : window.g_prodName });</script>
         </div>
         <form class="lotusForm2 lotusLoginForm" role="main" method="post" action="<%=loginUri%>">

            <h1 id="h1Welcome"></h1><script>document.getElementById("h1Welcome").innerHTML = dojo.string.substitute(resourceBundle.login_welcome, { 'productName' : window.g_prodName });</script>

			<%
			  if (redirectUrl != null)
			  {
			%>
			<input id="redirect" type="hidden" name="redirect" value="<%=redirectUrl%>"/>
			<%
			  }
			%>

			<%
            			  if (loginFailed)
            			  {
            			%>
            <div role="alert" id="loginError" class="lotusFormError"></div><script>document.getElementById("loginError").innerHTML = resourceBundle.login_error;</script>
			 <%
			   }
			 %>

            <p class="lotusFormField">
               <label id="lblUserName" for="username"></label><script>document.getElementById("lblUserName").innerHTML = resourceBundle.login_label_username;</script>
               <input id="username" aria-required="true" aria-invalid="true" class="lotusText" name="j_username" type="text">
            </p>
            <p class="lotusFormField">
               <label id="lblPassword" for="password"></label><script>document.getElementById("lblPassword").innerHTML = resourceBundle.login_label_password;</script>
               <input id="password" aria-required="true" aria-invalid="true" class="lotusText" name="j_password" type="password" autocomplete="off">
            </p>

            <span class="lotusRight" aria-hidden="true"><img role="presentation" src="<%=staticResPath%>/images/lc3/blank.gif" alt="" class="lotusIBMLogo"><span class="lotusAltText">IBM</span></span>
            <div class="lotusBtnContainer"><input id="btnLogin" class="lotusBtn lotusBtnSpecial" value="" type="submit"></div><script>document.getElementById("btnLogin").value = resourceBundle.login_button;</script>
         </form>
      </div>
</div>
<!--table class="lotusLegal lotusLoginBoxWide">
<tbody><tr><td id="tdLotusLicense" class="lotusLicense"></td></tr></tbody><script>document.getElementById("tdLotusLicense").innerHTML = '';</script>
</table-->

<script type="text/javascript">
function load() {
	var lang = document.documentElement.lang;
	if (lang =='he' || lang == 'ar')
		dojo.query("body").addClass("dijitRtl");
	try {document.getElementById("username").focus();} catch (e) {};

}

</script>
</body>
</html>
