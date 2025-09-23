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
%>
<html lang='<%=locale%>'>
<head>
	<title>
	<%=title%>
	</title>
	<link rel="stylesheet" type="text/css" href="<%=staticResPath%>/js/viewer/css/slideshow.css"/>
	<script type="text/javascript" src="<%=staticResPath%>/js/dojo/dojo.js" 
 				djConfig="parseOnLoad: true, isDebug:false, locale:'<%=locale%>'"></script>
 	<script type="text/javascript" src="<%=staticResPath%>/js/viewer/viewer.js"></script>
 	<script>
 		dojo.require("viewer.widgets.SlideShow");
 		
 		var contextPath = "<%=contextPath%>";
 		var staticResPath = "<%=staticResPath%>";
 		var g_locale = "<%=locale%>";
 		var slideshow;
		function launchSlideShow()
		{
			slideshow= new viewer.widgets.SlideShow(window);
			slideshow.launchSlideShow();
		}
		function windowresize()
		{
			slideshow.windowresize();
		}

		function closeSlideShow()
		{
			slideshow.closeSlideShow();
		}
		//event listener
	</script>
</head>
<body onload = "launchSlideShow()" onunload = "closeSlideShow()" style="overflow:hidden;background: none repeat scroll 0% 0% rgb(0, 0, 0);">
<div id="slideShowContainer" role="main">
<img height="100%" width="100%" id="normalContentImg" src="" alt=""></img>
</div>
</body>
</html>