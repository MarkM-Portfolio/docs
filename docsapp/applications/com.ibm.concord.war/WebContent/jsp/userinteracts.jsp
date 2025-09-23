<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%-- ***************************************************************** --%>
<%--                                                                   --%>
<%-- IBM Confidential                                                  --%>
<%--                                                                   --%>
<%-- IBM Docs Source Materials                                         --%>
<%--                                                                   --%>
<%-- (c) Copyright IBM Corporation 2012. All Rights Reserved.          --%>
<%--                                                                   --%>
<%-- U.S. Government Users Restricted Rights: Use, duplication or      --%>
<%-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. --%>
<%--                                                                   --%>
<%-- ***************************************************************** --%>

<%
String contextPath = request.getContextPath();
String locale = request.getLocale().toString().toLowerCase().replaceAll("_","-");
%>
<html>
<head>
<title></title>
	<link rel="stylesheet" type="text/css" href="/concord/styles/css/lotuslive/skin.css" /> 
	<link rel="stylesheet" type="text/css" href="/concord/styles/css/smartTables/smartTablesExhibit.css">
	<link rel="stylesheet" type="text/css" href="/concord/styles/css/base/core.css">
	<link rel="stylesheet" type="text/css" href="/concord/styles/css/ck/dialog.css">
	<link rel="stylesheet" type="text/css" href="/concord/styles/css/ck/reset.css">
	<link rel="stylesheet" type="text/css" href="/concord/styles/css/defaultTheme/defaultTheme.css" type="text/css" >
	<!-- <script src="https://apps.lotuslive.com/manage/navbar/banner/concord" language="javascript"></script>-->
	
	<script type="text/javascript" src="<%= contextPath %>/js/dojo/dojo.js" djconfig="locale: '<%=locale%>'"></script>
	<script type="text/javascript">
		dojo.require("dojo.i18n");
		dojo.requireLocalization("concord.scenes", "UserInteractScene");
		var resourceBundle = dojo.i18n.getLocalization("concord.scenes", "UserInteractScene");
		document.title = resourceBundle.userinteract_title;
			
		function submitForm() {
			document.getElementById("login").submit();
		}
	</script>
</head>
<body class="tundra">
<div lang="en" dir="ltr" class="cke_editor_editor1_dialog cke_skin_lotus">
	<table style="position: absolute; top: 102px; left: 287px; z-index: 10010;" class="cke_dialog cke_browser_ie cke_browser_quirks cke_browser_ie8 cke_browser_iequirks cke_ltr">
		<tbody>
			<tr>
				<td>
					<div class="cke_dialog_body">
						<div id="joinDialogTitle" class="cke_dialog_title">
						</div>
						<script>document.getElementById("joinDialogTitle").innerHTML = resourceBundle.userinteract_joindialog_title;</script>
						<table class="cke_dialog_contents">
						 <tbody>
						 <tr>
						  <td class="cke_dialog_contents" id="cke_dialog_contents_100" style="width: 450px; height: 100px;">
						   <div style="width: 100%;" class="cke_dialog_ui_vbox cke_dialog_page_contents" id="184_uiElement" name="Upload">
						   	<table cellspacing="0" border="0" align="left" style="width: 100%;">
						   	 <tbody>
						   	 <tr>
						   	  <td class="cke_dialog_ui_vbox_child">
						   	   <div class="cke_dialog_ui_vbox" id="183_uiElement">
						   	    <table cellspacing="0" border="0" align="left" style="width: 100%;">
						   	     <tbody>

						   	      <tr>
						   	       <td class="cke_dialog_ui_vbox_child" style="padding: 0px;">
						   	        <title></title>
						   	        <div id="joinDialogDesc" class="cke_dialog_ui_labeled_label"></div>
						   	        <script>document.getElementById("joinDialogDesc").innerHTML = resourceBundle.userinteract_joindialog_desc;</script>
						   	        <br>
						   	        <div id="joinDialogAsk" class="cke_dialog_ui_labeled_label"></div>
						   	        <script>document.getElementById("joinDialogAsk").innerHTML = resourceBundle.userinteract_joindialog_ask;</script>
						   	        <br>
						   	        <div class="cke_dialog_ui_labeled_content cke_dialog_ui_input_file">
						   	         <!-- <form class="cke_dialog_ui_input_file" target="uploadTargetFrame" enctype="multipart/form-data" method="POST" action="" name="uploadForm">
						   	          <input type="file" name="uploadInputFile" size="60">
						   	         </form> -->
						            <form id="login" method="post" action="<%=response.encodeRedirectURL((String)request.getAttribute("redirectUrl"))%>" name=login>
						               <select id=mode onclick="" width="70px" name="mode" class="cke_dialog_ui_input_select">
							               <option id="modeJoin" selected value="join"></option>
							               <option id="modeView" value="view"></option>
						               </select>
						               <script>
						               		document.getElementById("modeJoin").innerHTML = resourceBundle.userinteract_joindialog_joinmode;
						               		document.getElementById("modeView").innerHTML = resourceBundle.userinteract_joindialog_viewmode;
						               </script>
						
						               <input type="hidden" value="<%=response.encodeRedirectURL((String)request.getAttribute("redirectUrl")) %>" />
						            </form>

						   	         
						   	        </div>
						   	       </td>
						   	      </tr>
						   	      <tr>
						   	       <td class="cke_dialog_ui_vbox_child" style="padding: 0px;">
						   	        <span class="cke_dialog_ui_html" id="182_uiElement"></span>
						   	       </td>
						   	      </tr>
						   	     </tbody></table>
						   	    </div>
						   	   </td>
						   	  </tr>
						   	 </tbody>
						   	</table>
						   </div>
						  </td>
						 </tr>
						 </tbody>
						</table>
						<div class="cke_dialog_footer" id="cke_dialog_footer_100">
						 <table class="cke_dialog_ui_hbox cke_dialog_footer_buttons" id="223_uiElement">
						  <tbody>
						  <tr class="cke_dialog_ui_hbox">
						   <td class="cke_dialog_ui_hbox_first">
						    <a onclick="submitForm()" id="221_uiElement" class="cke_dialog_ui_button cke_dialog_ui_button_ok" hidefocus="true" href="javascript:void(0)" style="-moz-user-select: none;" unselectable="on">
						     <span id="btnOK" class="cke_dialog_ui_button"></span>
						    </a>
						    <script>
						    	document.getElementById("btnOK").innerHTML = resourceBundle.userinteract_joindialog_button;
						    	document.getElementById("221_uiElement").title = resourceBundle.userinteract_joindialog_button;
						    </script>
						   </td>
						  </tr>
						  </tbody>
						 </table>
						</div>
					</div>
				</td>
			   </tr>
			  </tbody>
			 </table>
			 <style>.cke_dialog{visibility:hidden;}</style>
			</div>
</body>
</html>
