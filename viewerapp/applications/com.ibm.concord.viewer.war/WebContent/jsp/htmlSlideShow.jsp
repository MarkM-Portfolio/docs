<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" 
        import="com.ibm.concord.viewer.spi.beans.IDocumentEntry,com.ibm.concord.viewer.platform.util.ViewerUtil"%>
<%

  String locale = request.getLocale().toString().toLowerCase().replaceAll("_", "-");
  if (locale.equals("zh-sg"))
    locale = "zh-cn";
  else if (locale.equals("zh-hk") || locale.equals("zh-mo"))
    locale = "zh-tw";
  else if (locale.equals("nb")||locale.equals("nb-no")||locale.equals("nn-no")||locale.equals("nn"))
  	locale = "no";
  	
  IDocumentEntry docEntry = (IDocumentEntry) request.getAttribute("doc_entry");
  String title = docEntry.getTitle();
  String contextPath = request.getContextPath();
  String staticResPath =  ViewerUtil.getStaticRootPath();
  String staticRootPath = staticResPath.replace(contextPath, "");
  boolean isIE9=ViewerUtil.isIE9(request.getHeader("User-Agent"));
%>
<html lang='<%=locale%>'>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>
	<%=title%>
	</title>

	<link rel="stylesheet" type="text/css" href="<%= staticResPath %>/js/html/styles/css/concord/common.css"/>
	<link rel="stylesheet" type="text/css" href="<%= staticResPath %>/js/dijit/themes/oneui30/oneui30.css" />
	<link rel="stylesheet" type="text/css" href="<%= staticResPath %>/js/html/styles/css/presentations/presshow.css"/>
	<link rel="stylesheet" type="text/css" href="<%= staticResPath %>/js/html/styles/css/concord/editor.css"/>
	<link rel="stylesheet" type="text/css" href="<%= staticResPath %>/js/html/styles/css/presentations/liststyles.css"/>

	<script>
		var ssObj;
		function launchSlideShow()
		{
			window.top.opener.g_slideShow(this);		
		}

		function windowresize()
		{
			if (typeof ssObj!="undefined"){
				ssObj.setDimensions();
			}
		}

		function closeSlideShow()
		{
			window.top.opener.closeSlideShow();
		}
				
		window.onresize = windowresize;		
	</script>
</head>
<body onload = "launchSlideShow()" onunload = "closeSlideShow()" class="oneui30 concord">
<div id="slideShowContainer"></div>
</body>
</html>