<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"
    import="com.ibm.concord.platform.util.ConcordUtil,
    com.ibm.concord.platform.util.I18nUtil,
    com.ibm.docs.directory.beans.UserBean"%>
<%
  /**
   * The following are the error information from web.xml configuration  
  Object errCode = (Integer)request.getAttribute("javax.servlet.error.status_code");
  String message = (String)request.getAttribute("javax.servlet.error.message");
  Object errException = request.getAttribute("javax.servlet.error.exception_type");
  String uri = (String)request.getAttribute("javax.servlet.error.request_uri");
  String servletName = (String)(String)request.getAttribute("javax.servlet.error.servlet_name");
  */
  
  Object errCode = request.getAttribute("error_code");
  if (errCode == null)
  {
    errCode = request.getParameter("error");
  }
  
  String errMsg = (String)request.getAttribute("error_msg");
  
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
  String locale = I18nUtil.getFallbackLocale(request);
  String PRODUCT_NAME = I18nUtil.getProductName(request);
  String x_ua_value = ConcordUtil.getXUACompatible(request);
  //root path of static files
  String staticRootPath = ConcordUtil.getStaticRootPath();

  String sizeLimit = null;
  if (request.getAttribute("doc_size_limit") != null)
  {
    sizeLimit = request.getAttribute("doc_size_limit").toString();
  }
  String mobileErrorMessage = null;
  if (request.getAttribute("mobile_error_message") != null)
  {
  	mobileErrorMessage = request.getAttribute("mobile_error_message").toString();
  }
  
  String correctFormat = "";
  if (request.getAttribute("correct_format") != null)
  {
  	correctFormat = request.getAttribute("correct_format").toString();
  }  
  String problem_id = "";
  if (request.getAttribute("problem_id") != null)
  {
    problem_id = request.getAttribute("problem_id").toString();
  }
  
  UserBean userBean = (UserBean)request.getAttribute("request.user");
  String docId = (String)request.getAttribute("fileid");
  ConcordUtil.processLeaveData(userBean, docId);
  
  response.setStatus(ConcordUtil.getHttpStatusByErrorCode(iCode));
  
%>

<html lang ="<%=locale%>">
<head>
<meta http-equiv="X-UA-Compatible" content="<%=x_ua_value%>">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><%=PRODUCT_NAME%></title>
<link rel="SHORTCUT ICON" href="<%=contextPath + staticRootPath%>/images/ibmdocs_product_16.ico" />

<link rel="stylesheet" type="text/css" href="<%=contextPath + staticRootPath%>/styles/css/concord/error.css">

<script type="text/javascript" src="<%=contextPath + staticRootPath%>/js/dojo/dojo.js"></script>
<script type="text/javascript">

	var djConfig = {
		baseUrl: "./",
		parseOnLoad: true,
		isDebug: false,
		locale: "<%=locale%>"
	};
	dojo.locale = "<%=locale%>";
	var contextPath = "<%=contextPath%>";
	var staticRootPath = "<%=staticRootPath%>";
	var errorCode = "<%=iCode%>";
	var errorMsg = "<%=errMsg%>";
	var errorData = null;
	var sizeLimit = <%=sizeLimit%>;
	if (sizeLimit != null && sizeLimit != "")
	{
		errorData = {};
		errorData.sizeLimit = sizeLimit;
	}
	var mobileErrorMessage = <%=mobileErrorMessage%>;
	if (mobileErrorMessage != null && mobileErrorMessage != "")
	{
		errorData = {};
		errorData.mobileErrorMessage = mobileErrorMessage;
	}
	var correctFormat = "<%=correctFormat%>";
	if (correctFormat != null && correctFormat != "")
	{
		errorData = {};
		errorData.correct_format = correctFormat;
	}
	
	var problem_id = "<%=problem_id%>";
	if (problem_id != null && problem_id != "")
	{
		if(errorData != null)
		{
			errorData.problem_id = problem_id;
		}
		else
		{
			errorData = {};
			errorData.problem_id = problem_id;
		}	
	}
	function init()
	{
		concord.scenes.ErrorScene.renderError(errorCode, errorData,errorMsg);
	}
</script>
<script type="text/javascript" src="<%=contextPath + staticRootPath%>/js/concord/scenes/ErrorScene.js"></script>

</head>

<body id="body" class="lotusui" onload="init();" role="main">

<div id="lotusFrame" class="lotusFrame">
	<div class="lotusErrorBox lotusError">
		<div class="lotusErrorContent">
			<img src="<%=contextPath + staticRootPath%>/images/iconWarningLarge.gif">
			<div class="lotusErrorForm" role="alert">
				<h1 id="scene-title"></h1>
				<p></p>
			</div>
		</div>
	</div>
</div>
</body>
</html>