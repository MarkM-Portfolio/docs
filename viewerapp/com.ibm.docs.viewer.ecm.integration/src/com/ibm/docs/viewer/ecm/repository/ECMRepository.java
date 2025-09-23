/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.viewer.ecm.repository;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;

import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.client.api.ObjectId;
import org.apache.chemistry.opencmis.client.api.Session;
import org.apache.chemistry.opencmis.client.api.SessionFactory;
import org.apache.chemistry.opencmis.client.runtime.SessionFactoryImpl;
import org.apache.chemistry.opencmis.commons.SessionParameter;
import org.apache.chemistry.opencmis.commons.data.Ace;
import org.apache.chemistry.opencmis.commons.data.Acl;
import org.apache.chemistry.opencmis.commons.data.CmisExtensionElement;
import org.apache.chemistry.opencmis.commons.enums.BindingType;
import org.apache.chemistry.opencmis.commons.enums.ExtensionLevel;
import org.apache.chemistry.opencmis.commons.exceptions.CmisObjectNotFoundException;
import org.apache.chemistry.opencmis.commons.exceptions.CmisUnauthorizedException;
import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.xml.sax.SAXException;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.HttpClientCreator;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IReviewable;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.connections.httpClient.ByteOrderMarkSkipper;
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.connections.httpClient.WASAdminService;
import com.ibm.docs.viewer.ecm.members.ECMUserImpl;
import com.ibm.docs.viewer.ecm.util.CommunityMemberParser;
import com.ibm.docs.viewer.ecm.util.CookieHelper;
import com.ibm.docs.viewer.ecm.util.DocumentXMLParser;
import com.ibm.docs.viewer.ecm.util.ECMResponseParser;
import com.ibm.docs.viewer.ecm.util.TeamspaceParser;
import com.ibm.docs.viewer.ecm.util.VersionHistoryCMISParser;
import com.ibm.json.java.JSONObject;

public class ECMRepository implements IRepositoryAdapter
{
  private URL fncmisServiceUrl;

  private String ecmContextRoot;

  private String thumbAuthContextRoot;

  private String repoId;

  private String filePath;

  private URL thumbAuthUrl;

  private URL thumbAnonymousAuthUrl;

  private HttpClient sonataHttpClient;

  private HttpClient apacheHttpClient;

  private Map<String, List<String>> sonataCookieHeader = new HashMap<String, List<String>>();

  private String communityServer;

  private String cmisGetAllVersions;

  private String cacheHome;

  private String sharedDataName;

  private String memberServiceUrl;

  public static final Logger LOGGER = Logger.getLogger(ECMRepository.class.toString());

  private static final String AMPERSAND_CHAR = "&";

  private static final String regex = "\\{(\\w{8})-(\\w{4})-(\\w{4})-(\\w{4})-(\\w{12})\\}";

  // private static final String TEAMSPACE_URL = "TeamspaceURL";

  private static final String FNCS_DOCUMENT_URL = "FNCSDocumentURL";

  private static final String FNCS_DRAFT_URL = "FNCSDraftURL";

  private static final String TEAMSPACE_URL = "TeamspaceURL";

  private static final String CLASS_NAME = ECMRepository.class.toString();

  @Override
  public void init(JSONObject config)
  {
    if (config.get("fncmis_server_url") == null)
    {
      throw new IllegalStateException("<fncmis_server_url> setting is missing from repository adapter config.");
    }

    if (config.get("fncs_server_url") == null)
    {
      throw new IllegalStateException("<fncs_server_url> setting is missing from repository adapter config.");
    }

    if (config.get("id") == null)
    {
      throw new IllegalStateException("<id> setting is missing from repository adapter config.");
    }

    repoId = (String) config.get("id");

    try
    {
      ecmContextRoot = (String) config.get("fncmis_server_url");
      thumbAuthContextRoot = (String) config.get("fncs_server_url");

      // CMIS API to get all versions
      if (ecmContextRoot.endsWith("/"))
      {
        cmisGetAllVersions = ecmContextRoot + "resources/{0}/Allversions/{1}";
      }
      else
      {
        cmisGetAllVersions = ecmContextRoot + "/resources/{0}/Allversions/{1}";
      }

      // cmis service url
      if (ecmContextRoot.endsWith("/"))
      {
        ecmContextRoot += "resources/Service";
      }
      else
      {
        ecmContextRoot += "/resources/Service";
      }
      
      String autoPub = (String) config.get("atom_pub");
      if(autoPub != null)
      {
        ecmContextRoot = autoPub;
      }            

      String allVersion = (String) config.get("all_version");
      if(allVersion != null)
      {
        cmisGetAllVersions = allVersion;
      }               
      
      fncmisServiceUrl = new URL(ecmContextRoot);

      // fncs vcl check url
      if (thumbAuthContextRoot.endsWith("/"))
      {
        thumbAuthContextRoot += "atom/seedlist/security/filter?";
      }
      else
      {
        thumbAuthContextRoot += "/atom/seedlist/security/filter?";
      }
      thumbAuthUrl = new URL(thumbAuthContextRoot);

      thumbAnonymousAuthUrl = new URL(thumbAuthContextRoot.replace("atom", "atom/anonymous"));

      communityServer = (String) config.get("community_server_url");

      if (communityServer.endsWith("/"))
      {
        memberServiceUrl = communityServer + "service/atom/community/members?";
      }
      else
      {
        memberServiceUrl = communityServer + "/service/atom/community/members?";
      }
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal URL string when perform initialization of class " + ECMRepository.class.getSimpleName(), e);
    }

    CacheType type = CacheType.NFS;
    try
    {
      type = CacheType.valueOf(((String) config.get(ConfigConstants.CACHE_TYPE)).toUpperCase());
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Cache_type is not configured or the value is not accepted. The default value of nfs is used.");
    }
    cacheHome = ViewerConfig.getInstance().getDataRoot(type);
    sharedDataName = ViewerConfig.getInstance().getSharedDataName(type);
    filePath = this.cacheHome + File.separator + "ccm_preview";
    HttpClientCreator httpClientCreator = new HttpClientCreator();
    httpClientCreator.config(config);
    apacheHttpClient = httpClientCreator.create();
  }

  @Override
  public boolean impersonationAllowed()
  {
    return false;
  }

  private Session createSession(UserBean user, String repositoryId)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameters = new HashMap<String, String>();
    parameters.put(SessionParameter.USER, user.getId());
    parameters.put(SessionParameter.ATOMPUB_URL, fncmisServiceUrl.toString());
    parameters.put(SessionParameter.REPOSITORY_ID, repositoryId);
    parameters.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameters.put(SessionParameter.COOKIES, "true");
    parameters.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, "com.ibm.docs.viewer.ecm.util.CMISSSOAuthenticationProvider");
    Session session = factory.createSession(parameters);
    return session;
  }

  private Session createSessionBySONATA(String username, String repositoryId)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameters = new HashMap<String, String>();
    parameters.put(SessionParameter.USER, username);
    parameters.put(SessionParameter.ATOMPUB_URL, fncmisServiceUrl.toString());
    parameters.put(SessionParameter.REPOSITORY_ID, repositoryId);
    parameters.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameters.put(SessionParameter.COOKIES, "true");
    parameters.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, "com.ibm.docs.viewer.ecm.util.CMISSSOSONATAAuthenticationProvider");
    Session session = factory.createSession(parameters);
    return session;
  }

  private Document getDocument(Session session, String objectId) throws RepositoryAccessException
  {
    try
    {
      ObjectId id = session.createObjectId(objectId);
      Document document = (Document) session.getObject(id);
      return document;
    }
    catch (CmisObjectNotFoundException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
    }
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    return getDocument(requester, docUri);
  }

  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("getDocument[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    String[] docUris = docUri.split("@");

    Session session = createSession(requester, docUris[1]);
    Document document = getDocument(session, docUris[0]);

    if (docUri.startsWith("idv_"))
    {
      try
      {
        Document lastestDoc = document.getObjectOfLatestVersion(true);
        document = getDocument(session, lastestDoc.getId());
      }
      catch (CmisObjectNotFoundException e)
      {
        throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
      }
    }
    JSONObject ext = getDocumentExt(requester, docUri, session, document);

    IDocumentEntry docEntry = new ECMDocumentEntry(requester, repoId, docUris[1], document, ext, this.communityServer);

    LOGGER.exiting(ECMRepository.class.getName(), "getDocument");
    return docEntry;
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null)
    {
      throw new NullPointerException();
    }

    ECMDocumentEntry ecmEntry = (ECMDocumentEntry) docEntry;
    String docUri = ecmEntry.getContentStreamUri();
    String usrId = requester.getId();

    String[] docUris = docUri.split("@");
    if (usrId.equals(IUser.ECM_DEFAULT_USER_ID) || usrId.equals(IUser.FAKE_USER_IMG2HTMLADMIN))
    {
      LOGGER.log(Level.FINE,
          (new StringBuilder()).append("getContentStreamBySONATA [uid: ").append(usrId).append(", orgId: ").append(requester.getOrgId())
              .append(", docUri: ").append(docUri).append("]").toString());
      Document document = getCMISDocumentBySONATA(docUris[0], docUris[1]);
      return document.getContentStream().getStream();
    }
    else
    {
      LOGGER.log(
          Level.FINE,
          (new StringBuilder()).append("getContentStream [uid: ").append(usrId).append(", orgId: ").append(requester.getOrgId())
              .append(", docUri: ").append(docUri).append("]").toString());
      InputStream stream = null;
      try
      {
        Session session = createSession(requester, docUris[1]);
        Document document = getDocument(session, docUris[0]);
        stream = document.getContentStream().getStream();
      }
      catch (Exception e)
      {
        LOGGER.log(Level.SEVERE, "Failed to get content stream.", e);
        throw new RepositoryAccessException(e);
      }
      return stream;
    }
  }

  @SuppressWarnings("unchecked")
  private JSONObject getDocumentExt(UserBean requester, String docUri, Session session, Document document)
  {
    LOGGER.entering(CLASS_NAME, "getDocumentExt", new Object[] { docUri });

    String fncsDocUrl = null, fncsDraftUrl = null;

    List<CmisExtensionElement> extensions = null;
    if (document.getContentStreamLength() > 0)
    {
      extensions = document.getExtensions(ExtensionLevel.PROPERTIES);
      LOGGER.log(Level.INFO, "Got extension from CCM draft " + document.getVersionLabel() + " of " + document.getVersionSeriesId());
    }
    else
    {
      Document documentMajor = null;
      try
      {
        documentMajor = document.getObjectOfLatestVersion(true);
      }
      catch (Exception e)
      {
        LOGGER.log(Level.WARNING, "No major version for CCM draft: " + document.getVersionSeriesId());
      }
      if (documentMajor != null)
      {
        extensions = documentMajor.getExtensions(ExtensionLevel.PROPERTIES);
        LOGGER.log(Level.INFO,
            "Got extension from CCM major version " + documentMajor.getVersionLabel() + " of " + documentMajor.getVersionSeriesId());
      }
      else
      {
        Document documentMinor = document.getObjectOfLatestVersion(false);
        if (documentMinor != null)
        {
          extensions = documentMinor.getExtensions(ExtensionLevel.PROPERTIES);
          LOGGER.log(Level.INFO,
              "Got extension from CCM minor version " + documentMinor.getVersionLabel() + " of " + documentMinor.getVersionSeriesId());
        }
        else
        {
          LOGGER.log(Level.SEVERE,
              "Can not get extension from CCM draft " + document.getVersionLabel() + " of" + document.getVersionSeriesId());
        }
      }
    }

    String teamURL = null;

    if (extensions != null)
    {
      for (CmisExtensionElement ext : extensions)
      {
        String extName = ext.getName();

        if (TEAMSPACE_URL.equalsIgnoreCase(extName))
        {
          teamURL = ext.getValue();
          LOGGER.log(Level.FINE, "Team space URL: {0}.", ext.getValue());
        }
        else if (FNCS_DRAFT_URL.equalsIgnoreCase(extName))
        {
          fncsDraftUrl = ext.getValue();
          LOGGER.log(Level.FINE, "FNCS_DRAFT_URL: {0}.", ext.getValue());
        }
        else if (FNCS_DOCUMENT_URL.equalsIgnoreCase(extName))
        {
          fncsDocUrl = ext.getValue();
          LOGGER.log(Level.FINE, "FNCSDocumentURL : {0}.", ext.getValue());
        }
      }
    }

    JSONObject json = null;
    String docXMLUrl = (fncsDraftUrl != null && fncsDraftUrl.length() > 0) ? fncsDraftUrl : fncsDocUrl;
    if (docXMLUrl == null || docXMLUrl.length() == 0)
    {
      LOGGER.log(Level.WARNING, "Did not get the document URL path: " + document.getId());
      return null;
    }
    else
    {
      docXMLUrl += "?acls=true&includeRecommendation=true&includeTags=true&includeNotification=true&includeDownloadInfo=true&includeCurrentVersion=true&includeSecurityInheritance=true&includeLocked=true&includeLockOwner=true&includeParentDocumentInfo=true&includeApprovers=true";
      json = getDocumentXMLAsJson(docXMLUrl, new DocumentXMLParser());
    }

    if (teamURL != null)
    {
      JSONObject teamProperties = getDocumentXMLAsJson(teamURL, new TeamspaceParser());
      if (teamProperties != null)
      {
        if (json == null)
        {
          json = new JSONObject();
        }

        json.putAll(teamProperties);
      }
      else
      {
        LOGGER.log(Level.WARNING, "Did not get the document teamspace properties: " + document.getId());
      }
    }

    LOGGER.entering(CLASS_NAME, "getDocumentExt", json);
    return json;

  }

  public JSONObject getCommunityMemberType(UserBean user, IReviewable entry)
  {
    LOGGER.entering(ECMRepository.CLASS_NAME, "getMemberType", user.getId());

    JSONObject memberType = null;
    if (memberServiceUrl != null)
    {
      String id = (String) entry.getCommunityInfo().get(IReviewable.COMMUNITY_ID);
      String url = memberServiceUrl + "?communityUuid=" + id + "&userid=" + user.getId();
      memberType = getDocumentXMLAsJson(url, new CommunityMemberParser());
      LOGGER.exiting(ECMRepository.CLASS_NAME, "getMemberType", memberType);
    }

    return memberType;
  }

  private JSONObject getDocumentXMLAsJson(String url, ECMResponseParser parser)
  {
    LOGGER.entering(ECMRepository.class.getName(), "getDocumentXMLAsJson", url);

    // url = "http://bxv7v610.cn.ibm.com/docs/docEntryWithWorkFlow.xml";

    URL teamUrl = null;
    try
    {
      teamUrl = new URL(url);
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal teamUrl string when perform getDocumentXMLAsJson of class "
          + ECMRepository.class.getSimpleName(), e);
    }

    GetMethod getMethod = new GetMethod(teamUrl.toString());
    HttpState state = new HttpState();
    Cookie[] cookies = CookieHelper.getAllCookies(teamUrl.getHost());
    state.addCookies(cookies);
    JSONObject ret = null;
    try
    {
      int nHttpStatus = apacheHttpClient.executeMethod(null, getMethod, state);
      LOGGER.log(Level.FINE, "When getting xml, the return code is: " + nHttpStatus);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        /* DocumentXMLParser */parser.setInputStream(getMethod.getResponseBodyAsStream());

        ret = parser.getJson();
      }
      else
      {
        LOGGER.log(Level.WARNING, "Error to get the document entry, http return code: " + nHttpStatus);
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "Error to get the document entry." + e);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOGGER.exiting(ECMRepository.class.getName(), "getDocumentXMLAsJson", ret);
    return ret;
  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }

    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("getVersions[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    String[] docUris = docUri.split("@");
    Session session = createSession(requester, docUris[1]);
    Document document = getDocument(session, docUris[0]);
    List<Document> versionEntries = document.getAllVersions();
    List<IDocumentEntry> documentEntries = new ArrayList<IDocumentEntry>();
    for (int i = 0; i < versionEntries.size(); i++)
    {
      Document documentEntry = versionEntries.get(i);
      documentEntries.add(new ECMDocumentEntry(requester, repoId, docUris[1], documentEntry));
    }

    LOGGER.exiting(ECMRepository.class.getName(), "getVersions");
    return documentEntries.toArray(new IDocumentEntry[] {});
  }

  public HttpClient getHttpClentBySONATA()
  {
    if (sonataHttpClient == null)
    {
      sonataHttpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(ViewerConfig.getInstance().getEcmJ2cAlias());
      ((ServerToServerHttpClient) sonataHttpClient).set_authHeaderChecking(false);
    }
    return sonataHttpClient;
  }

  @Override
  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {
    // Used by shared from Docs, but will not realize share in IBM Viewer side, so no need this API.
    throw new UnsupportedOperationException("CCM/ICN integration don't realize share feature from IBM Docs side,no need this API.");

  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    Vector<ACE> result = new Vector<ACE>();
    String[] folderUris = docEntry.getDocUri().split("@");
    Session session = createSession(requester, folderUris[1]);
    ObjectId id = session.createObjectId(folderUris[0]);
    Acl acl = session.getAcl(id, true);
    if (acl != null)
    {
      List<Ace> aces = acl.getAces();
      for (Ace ace : aces)
      {
        String principalId = ace.getPrincipalId();
        if (principalId != null)
        {
          List<String> permissions = ace.getPermissions();
          Set<Permission> permissionSet;
          /**
           * if(permissions.contains(ECMDocumentEntry.PERMISSION_CMIS_ALL)) { permissionSet = Permission.PUBLISH_SET; } else
           **/
          if (permissions.contains(ECMDocumentEntry.PERMISSION_CMIS_WRITE))
          {
            permissionSet = Permission.EDIT_SET;
          }
          else if (permissions.contains(ECMDocumentEntry.PERMISSION_CMIS_READ))
          {
            permissionSet = Permission.VIEW_SET;
          }
          else
          {
            permissionSet = Permission.EMPTY_SET;
          }
          String type = ECMUserImpl.MEMBER_TYPE_USER;
          result.add(new ACE(principalId, permissionSet, type));
        }
      }
    }
    return result;
  }

  @Override
  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    return null;
  }

  @Override
  public String getFilesPath()
  {
    return filePath;
  }

  @Override
  public JSONObject getRepositoryConfig()
  {
    throw new UnsupportedOperationException();
  }

  public URL getThumbnailAuthUrl()
  {
    return thumbAuthUrl;
  }

  public URL getThumbnailAnonymousAuthUrl()
  {
    return thumbAnonymousAuthUrl;
  }

  private String[] parseDocumentIds(String input)
  {
    Matcher m = Pattern.compile(regex).matcher(input);
    ArrayList<String> sids = new ArrayList<String>();
    while (m.find())
    {
      StringBuffer s = new StringBuffer("idd_");
      s.append(m.group(1)).append("-").append(m.group(2)).append("-").append(m.group(3)).append("-").append(m.group(4)).append("-")
          .append(m.group(5));
      sids.add(s.toString());
    }
    if (sids.size() > 0)
    {
      String[] array = new String[sids.size()];
      return sids.toArray(array);
    }
    return null;

  }

  public String[] verifyACL(String[] ids, boolean anonymousMode) throws RepositoryAccessException
  {
    StringBuffer reqParams = new StringBuffer();
    String reqParamsStr = "";
    try
    {
      for (String id : ids)
      {
        id = id.replace("idd_", "");
        reqParams.append("sid=");
        String query = URLEncoder.encode("{" + id + "}", "UTF-8");
        reqParams.append(query);
        reqParams.append(AMPERSAND_CHAR);
      }
      reqParamsStr = reqParams.toString();
      int idx = reqParamsStr.lastIndexOf(AMPERSAND_CHAR);
      if (idx > 0)
      {
        reqParamsStr = reqParamsStr.substring(0, idx);
      }
    }
    catch (UnsupportedEncodingException e)
    {
      LOGGER.log(Level.SEVERE, e.getLocalizedMessage());
    }

    URL seedListUrl = thumbAuthUrl;
    if (anonymousMode)
    {
      seedListUrl = thumbAnonymousAuthUrl;
    }
    GetMethod getMethod = new GetMethod(seedListUrl.toString() + reqParamsStr);
    try
    {
      HttpState state = new HttpState();
      Cookie[] cookies = CookieHelper.getAllCookies(seedListUrl.getHost());
      state.addCookies(cookies);
      int status = apacheHttpClient.executeMethod(null, getMethod, state);
      if (HttpStatus.SC_OK == status)
      {
        String result = getMethod.getResponseBodyAsString();
        if (result != null && !result.isEmpty())
        {
          return parseDocumentIds(result);
        }
      }
      else
      {
        throw new RepositoryAccessException(status, "", getMethod.getStatusText());
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, e.getMessage());
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    return null;
  }

  public IDocumentEntry[] getVersionsBySONATA(String docUri) throws RepositoryAccessException
  {
    LOGGER.entering(ECMRepository.class.getName(), (new StringBuilder()).append("getVersionsBySONATA[docUri: ").append(docUri).append("]")
        .toString());

    String[] docUris = docUri.split("@");
    Document document = getCMISDocumentBySONATA(docUris[0], docUris[1]);
    List<Document> versionEntries = document.getAllVersions();
    List<IDocumentEntry> documentEntries = new ArrayList<IDocumentEntry>();
    for (int i = 0; i < versionEntries.size(); i++)
    {
      Document documentEntry = versionEntries.get(i);
      documentEntries.add(new ECMDocumentEntry(repoId, docUris[1], documentEntry));
    }

    LOGGER.exiting(ECMRepository.class.getName(), "getVersionsBySONATA");
    return documentEntries.toArray(new IDocumentEntry[] {});
  }

  public IDocumentEntry getDocumentBySONATA(String docUri) throws RepositoryAccessException
  {
    LOGGER.entering(ECMRepository.class.getName(), (new StringBuilder()).append("getDocumentBySONATA[docUri: ").append(docUri).append("]")
        .toString());

    String[] docUris = docUri.split("@");
    Document document = getCMISDocumentBySONATA(docUris[0], docUris[1]);

    LOGGER.exiting(ECMRepository.class.getName(), "getDocumentBySONATA");
    return new ECMDocumentEntry(repoId, docUris[1], document);
  }

  private Document getCMISDocumentBySONATA(String docId, String repoId) throws RepositoryAccessException
  {
    String username = null;
    try
    {
      username = getJ2ASUserName();
      Session session = createSessionBySONATA(username, repoId);
      return getDocument(session, docId);
    }
    catch (CmisObjectNotFoundException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
    }
    catch (CmisUnauthorizedException e)
    {
      LOGGER.log(Level.FINE, "CMIS UnAuthorized: need to retrieve the cookie by SONATA.");
      sonataCookieHeader = null;
      Session session = createSessionBySONATA(username, repoId);
      return getDocument(session, docId);
    }
    catch (ConfigurationException e)
    {
      LOGGER.log(Level.SEVERE, e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
  }

  private String getJ2ASUserName() throws ConfigurationException, IOException
  {
    String userInstallRoot = System.getProperty("user.install.root");
    String cellName = WASAdminService.getCellName();
    String configFilePath = userInstallRoot + java.io.File.separator + "config" + java.io.File.separator + "cells" + java.io.File.separator
        + cellName + java.io.File.separator + "security.xml";
    File configFile = new File(configFilePath);

    Configuration config = ByteOrderMarkSkipper.loadConfigFile(configFile);
    for (int j = 0;; j++)
    {
      String alias = config.getString("authDataEntries(" + j + ")[@alias]");
      if (alias == null || alias.length() == 0)
        break;
      if (alias.equals(ViewerConfig.getInstance().getEcmJ2cAlias()))
      {
        return config.getString("authDataEntries(" + j + ")[@userId]");
        // password = config.getString("authDataEntries(" + j + ")[@password]");
      }
    }
    return null;
  }

  public Map<String, List<String>> getSONATAHeaders()
  {
    if (sonataCookieHeader == null)
    {
      HttpClient httpClient = getHttpClentBySONATA();
      GetMethod getMethod = new GetMethod(thumbAuthUrl.toString());
      sonataCookieHeader = new HashMap<String, List<String>>();
      try
      {
        httpClient.executeMethod(getMethod);
        Header[] cookie = getMethod.getRequestHeaders("Cookie");
        ArrayList<String> list = new ArrayList<String>();
        for (int i = 0; i < cookie.length; i++)
        {
          list.add(cookie[i].getValue());
        }
        sonataCookieHeader.put("Cookie", list);
      }
      catch (HttpException e)
      {
        LOGGER.log(Level.SEVERE, "Failed to get http header by SONATA. ", e.getLocalizedMessage());
      }
      catch (IOException e)
      {
        LOGGER.log(Level.SEVERE, "Failed to get http header by SONATA. " + e.getLocalizedMessage());
      }
      finally
      {
        if (getMethod != null)
        {
          getMethod.releaseConnection();
        }
      }
    }
    return sonataCookieHeader;
  }

  public IDocumentEntry getDraftBySONATA(String docUri) throws RepositoryAccessException
  {
    HttpClient httpClient = getHttpClentBySONATA();
    String[] ids = docUri.split("@");
    GetMethod getMethod = new GetMethod(MessageFormat.format(cmisGetAllVersions, ids[1], ids[0]));
    try
    {
      int nHttpStatus = httpClient.executeMethod(getMethod);
      LOGGER.log(Level.FINE, "Run getDraftBySONATA, the return code is: " + nHttpStatus);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        VersionHistoryCMISParser parser = new VersionHistoryCMISParser();
        String id = parser.getDraftId(getMethod.getResponseBodyAsStream());
        return getDocumentBySONATA(id + "@" + docUri.split("@")[1]);
      }
    }
    catch (HttpException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to get draft by SONATA. ", e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to get draft by SONATA. ", e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
    catch (XPathExpressionException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to get draft by SONATA. ", e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
    catch (ParserConfigurationException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to get draft by SONATA. ", e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
    catch (SAXException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to get draft by SONATA. ", e.getLocalizedMessage());
      throw new RepositoryAccessException(e);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    return null;
  }

  public boolean isCacheEncrypt()
  {
    return false;
  }

  @Override
  public String getCacheHome()
  {
    return cacheHome;
  }

  @Override
  public String getSharedDataName()
  {
    return sharedDataName;
  }

  @Override
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    // ECM doesn't support this now.
    throw new UnsupportedOperationException("ECM repository desn't support log event.");

  }

  @Override
  public void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("repository doesn't support setThumbnail.");     
  }

  @Override
  public String getRepositoryType()
  {
    return RepositoryServiceUtil.ECM_FILES_REPO_ID;
  }
}
