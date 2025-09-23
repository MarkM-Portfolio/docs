<%@page import="com.ibm.concord.spi.beans.IDocumentEntry,
				com.ibm.concord.platform.util.ConcordUtil,
				com.ibm.concord.platform.Platform,
				com.ibm.json.java.JSONObject"%><%
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	request.setCharacterEncoding("utf-8");
	String title = docEntry.getTitle();
      boolean isDraft = ((Boolean) request.getAttribute("draft")).booleanValue();
      String base;
      if (isDraft)
      {
      	base = request.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/view/draft";
      }
      else
      {
      	base = request.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/view";
      }
	String contextPath = request.getContextPath();
	String staticRootPath = ConcordUtil.getStaticRootPath();
	String locale = request.getLocale().toString().toLowerCase().replaceAll("_", "-");
	String cacheDir = (String) request.getAttribute("cacheDir");
	String viewdocMode = request.getAttribute("doc_mode").toString();
	String help_URL = "http://infolib.lotus.com/resources/lotuslive/symphony/tp3/tp3_lotuslive_symphony.pdf";
	JSONObject helpConfig = Platform.getConcordConfig().getSubConfig("Help");
	if (helpConfig != null) 
		help_URL = (String) helpConfig.get("contents_url");
%>
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

<script type="text/javascript" src="<%=contextPath + staticRootPath%>/js/dojo/dojo.js" djConfig="parseOnLoad: true"></script>
<script type="text/javascript">
	g_baseUrl = "<%=base %>";
	g_draft = "<%=isDraft%>";
	g_locale = "<%=locale %>";
	contextPath = "<%=contextPath %>";
	djConfig = {
		locale: "<%= locale %>"
	};
	dojo.locale = "<%= locale %>";
	g_Repository = "<%=docEntry.getRepository()%>";
	g_DocUri = "<%=docEntry.getDocUri()%>";
	g_DocMode = "<%= viewdocMode %>";
	g_help_URL = "<%= help_URL %>";
	clearFormatCookie();
	
	function clearFormatCookie()
	{
		dojo.require("dojo.cookie");
		var cookiePath = contextPath + "/app/doc/" + g_Repository + "/" + g_DocUri + "/view";
		var cookie = dojo.cookie("deepdetect");
		if(cookie != null)
		{
			var json = dojo.fromJson(cookie);
			if(json != null)
			{
				var view = json.view[g_DocUri];
				if(view != null)
				{
					view.correctFormat = null;
					dojo.cookie("deepdetect", dojo.toJson(json), {path : cookiePath});
				}
			}
		}
	}
</script>

