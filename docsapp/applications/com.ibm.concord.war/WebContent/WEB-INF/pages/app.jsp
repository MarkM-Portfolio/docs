<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="com.ibm.concord.session.SessionConfig,
			com.ibm.concord.document.services.autopublish.AutoPublishUtil,
			com.ibm.concord.document.services.DocumentPageSettingsUtil,
			com.ibm.concord.spi.beans.IDocumentEntry,
			com.ibm.json.java.JSONObject,
			com.ibm.json.java.JSONArray,
			org.apache.commons.lang.StringEscapeUtils,
			com.ibm.concord.platform.Platform,
			com.ibm.docs.framework.IComponent,
			com.ibm.concord.revision.service.RevisionComponent,
			com.ibm.concord.services.rest.handlers.PeopleHandler,
			com.ibm.concord.services.rest.handlers.DomainHandler,
			com.ibm.concord.platform.util.ConcordUtil,
			com.ibm.docs.repository.RepositoryServiceUtil,
			com.ibm.docs.repository.IRepositoryAdapter,
			com.ibm.docs.authentication.IAuthenticationAdapter,
			com.ibm.docs.directory.beans.UserBean,
			java.util.HashMap"%>
<%
	String loginUri = request.getContextPath() + "/j_security_check";
	String docType = StringEscapeUtils.escapeHtml(request.getAttribute("doc_type").toString());
	String docMode = StringEscapeUtils.escapeHtml(request.getAttribute("doc_mode").toString());
	String docSizeLimit = StringEscapeUtils.escapeHtml(request.getAttribute("doc_size_limit").toString());
	String jobId = StringEscapeUtils.escapeHtml(request.getAttribute("jobId").toString());
	boolean jobLive = (request.getAttribute("jobLive") != null);
	boolean upgradeConvert = request.getAttribute("upgradeConvert") == null ? false : (Boolean) request.getAttribute("upgradeConvert");
	boolean isDraftOutOfDate = request.getAttribute("isDraftOutOfDate") == null ? false : (Boolean) request.getAttribute("isDraftOutOfDate");
	boolean showACLWarning = request.getAttribute("showACLWarning") == null ? false : (Boolean) request.getAttribute("showACLWarning");
	boolean hasACL = request.getAttribute("hasACL") == null ? false : (Boolean) request.getAttribute("hasACL");
	boolean hasTrack = request.getAttribute("hasTrack") == null ? false : (Boolean) request.getAttribute("hasTrack");
	boolean showTrackWarning = request.getAttribute("showTrackWarning") == null ? false : (Boolean) request.getAttribute("showTrackWarning");
	boolean hasConflictLock = request.getAttribute("hasConflictLock") == null ? false : (Boolean) request.getAttribute("hasConflictLock");
	boolean sessionClosing = (request.getAttribute("sessionClosing") != null);
	boolean convertingToODF = (request.getAttribute("convertingToODF") != null);
	boolean mt_enabled = (Boolean) request.getAttribute("mt_enabled");
	boolean login_retry = (Boolean) request.getAttribute("login_retry");
	IDocumentEntry docEntry = (IDocumentEntry)request.getAttribute("doc_entry");
	boolean mobileOfflineMode = request.getAttribute("mobileOfflineMode") == null?false:(Boolean)request.getAttribute("mobileOfflineMode");
	String bidiOn = StringEscapeUtils.escapeHtml(request.getAttribute("bidiOn").toString());
	String bidiTextDir = StringEscapeUtils.escapeHtml(request.getAttribute("bidiTextDir").toString());
	UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
	
	String sessionConfig = SessionConfig.toJSON().toString();
	
	// Get the web message adapter id and shared mode from concord configuration file.
	String webMsgAdapterId = "";
	boolean sharedMode = false;
 	IComponent webMsgComponent = Platform.getComponent("com.ibm.concord.platform.webmsg");
	JSONObject webMsgCompConfig = webMsgComponent != null ? webMsgComponent.getConfig(): null;
	JSONObject adapterJson = webMsgCompConfig != null ? (JSONObject) webMsgCompConfig.get("adapter") : null;
	if (adapterJson != null)
	{
		Object idObj = adapterJson.get("id");
		if (idObj instanceof String)
		{
			webMsgAdapterId = (String) idObj;
		}
		JSONObject adapterConfig = (JSONObject) adapterJson.get("config");
		Object modeObj = adapterConfig != null ? adapterConfig.get("sharedmode") : null;
		if ((modeObj instanceof String) && ((String)modeObj).equalsIgnoreCase("true"))
		{
			sharedMode = true;
		}
	}
	// Get the context path of rtc4web_server.war.
	String rtcContextPath = Platform.getRtcContextPath();
	
	//read if revision enabled
	RevisionComponent component = (RevisionComponent)Platform.getComponent("com.ibm.concord.platform.revision");
	boolean bRevision = (component != null) ? component.isEanbled():false;
	
	String repository = docEntry.getRepository();
	String repositoryType = docEntry.getRepositoryType();
	String text_helpurl = Platform.getConcordConfig().getTextHelpUrl(repository, repositoryType);
	String sheet_helpurl = Platform.getConcordConfig().getSheetHelpUrl(repository, repositoryType);
	String pres_helpurl = Platform.getConcordConfig().getPresHelpUrl(repository, repositoryType);
	String ecm_help_root = Platform.getConcordConfig().getECMHelpUrl(repository, repositoryType);
	
	String repoName =  ConcordUtil.getExternalRepositoryName(repository);
	boolean isCommentExternal = Platform.getConcordConfig().isCommentExternal();
	String atUsersUri = Platform.getConcordConfig().getMentionUsersUri();
	String atNotificationUri = Platform.getConcordConfig().getMentionNotificationUri();
	
	boolean isCloudTypeahead = Platform.getConcordConfig().isCloudTypeAhead();
	String betasStr = Platform.getConcordConfig().getBetasStr();
		
	String version = ConcordUtil.getBuildDescription() + " " + ConcordUtil.getBuildNumber();
	String versionNumber = ConcordUtil.getVersion(); 
	boolean reloadLog = Platform.getConcordConfig().isReloadLog();	
	
	// Get the entitlement information for this user.
	String entitleStr = "";
	Object entitleObj = request.getAttribute("IBMDocs_Entitlements");
	if (entitleObj instanceof JSONArray)
	{
		JSONArray entitleArray = (JSONArray) entitleObj;
		entitleStr = entitleArray.toString();
	}
	
	JSONObject gkFeatures = new JSONObject();
	Object gkObj = request.getAttribute("IBMDocs_GateKeeper");
	if (gkObj != null && gkObj instanceof JSONObject)
	{
		JSONObject gkjson = (JSONObject) gkObj;
		gkFeatures = gkjson;
	}
	JSONObject domainJson = DomainHandler.getDomainList();

	String editMode = StringEscapeUtils.escapeHtml(request.getParameter("mode"));
 %>
<script type="text/javascript"
	src="<%= request.getContextPath() + ConcordUtil.getStaticRootPath() %>/js/dojo/dojo.js"></script>

<script type="text/javascript">
	var DOC_SCENE = {};
	DOC_SCENE.type = "<%= docType %>";
	DOC_SCENE.mode = "<%= docMode %>";
	DOC_SCENE.docSizeLimit = "<%= docSizeLimit %>";
	DOC_SCENE.repository = "<%= docEntry.getRepository() %>";
	DOC_SCENE.repositoryType = "<%= docEntry.getRepositoryType() %>";
	DOC_SCENE.uri = "<%= docEntry.getDocUri() %>";
	DOC_SCENE.docId = "<%= docEntry.getDocId() %>";
	DOC_SCENE.ownerId = "<%= docEntry.getCreator()[0] %>";
	DOC_SCENE.pwcId = "<%= docEntry.getPrivateWorkCopyId() %>";	
	DOC_SCENE.extension = "<%= ConcordUtil.getFileRealExtension(docEntry.getMimeType()) %>";
	DOC_SCENE.title = "<%= docEntry.getTitle() %>";
	DOC_SCENE.fileDetailsURL = "<%= docEntry.getFileDetailsURL() %>";
	DOC_SCENE.filesListURL = "<%= docEntry.getFilesListURL() %>";
	DOC_SCENE.isLocked = <%= docEntry.isLocked() %>;
	DOC_SCENE.repoModifier = "<%= docEntry.getModifier()[0] %>";
	DOC_SCENE.repoModified = <%= docEntry.getModified().getTimeInMillis() %>;
	DOC_SCENE.isDraftOutOfDate = <%= isDraftOutOfDate %>;
	DOC_SCENE.showACLWarning = <%= showACLWarning %>;
	DOC_SCENE.hasACL = <%= hasACL %>;
	DOC_SCENE.hasTrack = <%= hasTrack %>;
	DOC_SCENE.showTrackWarning = <%= showTrackWarning %>;
	DOC_SCENE.hasConflictLock = <%= hasConflictLock %>;
	DOC_SCENE.isPublishable = <%= docEntry.getIsPublishable() %>;
	DOC_SCENE.communityID = "<%= docEntry.getCommunityId() %>";
	DOC_SCENE.communityType = "<%= docEntry.getCommunityType() %>";
	DOC_SCENE.communityUrl = "<%= docEntry.getCommunityUrl() %>";
	DOC_SCENE.libraryID = "<%= docEntry.getLibraryId() %>";
	DOC_SCENE.libraryGenerator = "<%= docEntry.getLibraryGenerator() %>";
	DOC_SCENE.fncsServerUrl = "<%= docEntry.getFncsServer() %>";
	DOC_SCENE.jobId = "<%= jobId %>";
	DOC_SCENE.jobLive = "<%= jobLive %>";
	DOC_SCENE.upgradeConvert = "<%= upgradeConvert %>";
	DOC_SCENE.sessionClosing = "<%= sessionClosing %>";
	DOC_SCENE.convertingToODF = "<%= convertingToODF %>";
	DOC_SCENE.editMode = "<%= editMode %>";
	
	var SESSION_CONFIG = JSON.parse('<%= sessionConfig %>');
	DOC_SCENE.startTs = (new Date()).getTime();

	var CONFIG_POLLER = {};
	CONFIG_POLLER.webMsgAdapterId = "<%=webMsgAdapterId%>";
	CONFIG_POLLER.isSharedMode = ("<%=sharedMode%>".toLowerCase() == "true");
	CONFIG_POLLER.isRtc4Web = (CONFIG_POLLER.webMsgAdapterId.toLowerCase() == "rtc4web");
	CONFIG_POLLER.rtcContextPath = "<%=rtcContextPath%>";
	
	var g_revision_enabled = <%= bRevision %>;
	var gECM_help_root = "<%= ecm_help_root %>";
	var gText_help_URL = "<%= text_helpurl %>";
	var gSheet_help_URL = "<%= sheet_helpurl %>";
	var gPres_help_URL = "<%= pres_helpurl %>";
	var gIs_cloud = <%= isCloudTypeahead %>;
	var g_isCommentExternal = <%= isCommentExternal %>;
	var g_atUsersUri = "<%= atUsersUri %>";
	var g_atNotificationUri = "<%= atNotificationUri %>";
	var gTPRepoName = "<%= repoName %>";
	var concord_version = "<%= version %>";
	var g_version = "<%= versionNumber %>";
	var g_EntitlementsStr = '<%= entitleStr %>';
	var g_GatekeeperFeatures = <%= gkFeatures %>;
	var g_BetasStr = '<%= betasStr %>';	
	var loginUri = "<%=loginUri%>";
	var mt_enabled = <%= mt_enabled %>;
	var login_retry = "<%=login_retry%>";	
	var g_mobileOfflineMode = <%= mobileOfflineMode%>;
	var g_bidiOn = "<%= bidiOn%>";
	var g_bidiTextDir = "<%= bidiTextDir%>";
	var g_reloadLog = <%= reloadLog %>;
	var g_autopublish_set = <%= AutoPublishUtil.isAutoPublish(docEntry) %>;
	var g_enable_auto_publish = <%= AutoPublishUtil.isFeatureEnabled() %>;
	var g_prodName = "<%= ConcordUtil.getProductName() %>";
	var g_whiteDomains = <%= domainJson %>;
	window.renderParams = <%= Platform.getConcordConfig().getSubConfig("socialConfig") %>;
</script>