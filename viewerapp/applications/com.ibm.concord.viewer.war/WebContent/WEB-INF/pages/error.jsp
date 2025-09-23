<!--  
/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" import="com.ibm.concord.viewer.platform.util.ViewerUtil,
    							com.ibm.json.java.JSONObject,
    							com.ibm.concord.viewer.services.rest.DomainHandler,
    							com.ibm.concord.viewer.platform.Platform"%>
    
<%
  Object errCode = request.getAttribute("error_code");
  if (errCode == null)
  {
    errCode = request.getParameter("error");
  }

  int iCode = 0;
  if (errCode != null)
  {
    try
    {
      iCode = Integer.parseInt(errCode.toString());
    }
    catch (NumberFormatException e)
    {
    }
  }

  String problemId = null;
  if (request.getAttribute("problem_id") != null)
  {
    problemId = request.getAttribute("problem_id").toString();
  }
  else if (request.getParameter("id") != null)
  {
    problemId = request.getParameter("id");
  }

  String contextPath = request.getContextPath();
  String staticResPath =  ViewerUtil.getStaticRootPath();
  String locale = ViewerUtil.getFallbackLocale(request);
  String x_ua_value = ViewerUtil.getXUACompatible(request); 
  Object supported_browsers_msg = request.getAttribute("supported_browser_list");
  if (supported_browsers_msg == null)
  {
    supported_browsers_msg = "";
  }
  
  String viewer_config = null;
  if (request.getAttribute("viewer_config") != null)
  {
    viewer_config = request.getAttribute("viewer_config").toString();
  } 
  Object docType = request.getAttribute("doc_type");
  Object docExtension = null ;
  if (request.getAttribute("doc_extension") != null)
  {
  	docExtension = request.getAttribute("doc_extension");
  }
  JSONObject featureConfig = Platform.getViewerConfig().getFeatureConfig();
  
  JSONObject domainJson = DomainHandler.getDomainList();
  
  String problem_id = "";
  if (request.getAttribute("problem_id") != null)
  {
    problem_id = request.getAttribute("problem_id").toString();
  }
  
  response.setStatus(ViewerUtil.getHttpStatusByErrorCode(iCode));
%>

<html lang='<%=locale%>'>
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Viewer</title>
<link rel="SHORTCUT ICON" href="<%=staticResPath%>/images/ibmdocs_product_16.ico" />

<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/viewer/css/error.css">
<jsp:include page="/WEB-INF/pages/product.jsp"></jsp:include>
<script type="text/javascript" src="<%=staticResPath%>/js/dojo/dojo.js" djconfig="locale: '<%=locale%>'"></script>
<script type="text/javascript" src="<%=staticResPath%>/js/viewer/scenes/ErrorScene.js"></script>
<script type="text/javascript">
	var contextPath = "<%=contextPath%>";
	var staticResPath = "<%=staticResPath%>";
	var errorCode = "<%=iCode%>";
	var docType= "<%=docType%>";
	var supported_browsers_msg = "<%=supported_browsers_msg%>";	
	var viewerConfig = eval('(<%=viewer_config%>)');
	var DOC_SCENE = {};
	var g_featureConfig = <%= featureConfig %>;
	DOC_SCENE.type = "<%=docType%>";
	DOC_SCENE.extension = "<%=docExtension%>";
	var g_whiteDomains = <%= domainJson %>;
	
	var errorData = null;
	var problem_id = "<%=problem_id%>";
	if (problem_id != null && problem_id != "")
	{
		errorData = {};
		errorData.problem_id = problem_id;
	}

	
	function init()
	{
		var lang = document.documentElement.lang;
		if (lang =='he' || lang == 'ar')
			dojo.query("body").addClass("dijitRtl");
		viewer.scenes.ErrorScene.renderError(errorCode, supported_browsers_msg, errorData);
	}
</script>

</head>

<body id="body" class="lotusui" onload="init();">

<div id="lotusFrame" class="lotusFrame" role="main">
	<div class="lotusErrorBox lotusError">
		<div class="lotusErrorContent">
			<img src="<%=staticResPath%>/images/iconWarningLarge.gif" role="presentation" alt="">
			<div class="lotusErrorForm">
				<h1 id="scene-title"></h1>
				<p></p>
			</div>
		</div>
	</div>
</div>
</body>
</html>