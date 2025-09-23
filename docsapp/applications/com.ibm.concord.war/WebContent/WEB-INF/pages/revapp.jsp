<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.platform.util.ConcordUtil,
			com.ibm.concord.spi.beans.IDocumentEntry,
			com.ibm.json.java.JSONObject,
			com.ibm.json.java.JSONArray,
			com.ibm.concord.platform.Platform"%>
<%
	String help_URL = "http://infolib.lotus.com/resources/lotuslive/symphony/tp3/tp3_lotuslive_symphony.pdf";
	String text_helpurl = "/help/topic/com.ibm.help.ibmdocs.doc/text/document/documents_frame.html";
	String sheet_helpurl = "/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/spreadsheet/spreadsheets_frame.html";
	String pres_helpurl = "/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/presentation/presentations_frame.html";    
    String version = ConcordUtil.getBuildDescription() + " " + ConcordUtil.getBuildNumber();
    IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	String docType = request.getAttribute("doc_type").toString();
	String docMode = request.getAttribute("doc_mode").toString(); 
	boolean isCloudTypeahead = false;
	JSONObject typeahead = Platform.getConcordConfig().getSubConfig("typeahead");
	if (typeahead != null)
	{
		String value = (String) typeahead.get("is_cloud");
		isCloudTypeahead = "true".equalsIgnoreCase(value);
	}
 %>
<script type="text/javascript">
	var DOC_SCENE = {};
	DOC_SCENE.type = "<%= docType %>";
	DOC_SCENE.mode = "<%= docMode %>";
	DOC_SCENE.repository = "<%= docEntry.getRepository() %>";
	DOC_SCENE.uri = "<%= docEntry.getDocUri() %>";
	DOC_SCENE.title = "<%= docEntry.getTitle() %>";	
	var g_help_URL = "<%= help_URL %>";
	var gText_help_URL = "<%= text_helpurl %>";
	var gSheet_help_URL = "<%= sheet_helpurl %>";
	var gPres_help_URL = "<%= pres_helpurl %>";
	var gIs_cloud = <%= isCloudTypeahead %>;
	var g_revision_enabled = true;
	var concord_version = "<%= version %>";
	var g_EntitlementsStr = '[{"booleanValue":false,"name":"coedit"}, {"booleanValue":false,"name":"assignment"}]';	
		
</script>

