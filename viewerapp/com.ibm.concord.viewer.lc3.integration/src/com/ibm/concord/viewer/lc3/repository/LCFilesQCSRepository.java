/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.repository;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.namespace.QName;

import org.apache.abdera.Abdera;
import org.apache.abdera.model.Document;
import org.apache.abdera.model.Element;
import org.apache.abdera.model.Entry;
import org.apache.abdera.model.ExtensibleElement;
import org.apache.abdera.model.Feed;
import org.apache.abdera.parser.stax.FOMFactory;
import org.apache.abdera.parser.stax.FOMParser;
import org.apache.abdera.parser.stax.FOMParserOptions;
import org.apache.abdera.parser.stax.FOMUnsupportedContentTypeException;
import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.lc3.Constants;
import com.ibm.concord.viewer.lc3.util.AutoReleaseHttpConnectionInputStream;
import com.ibm.concord.viewer.lc3.util.LCFilesRepositoryErrorHelper;
import com.ibm.concord.viewer.lc3.util.URLGenerater;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.HttpClientCreator;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LCFilesQCSRepository implements IRepositoryAdapter
{
  private static final Logger LOGGER = Logger.getLogger(LCFilesQCSRepository.class.toString());

  private static final String USER_AGENT = "User-Agent";

  private static final String TD_NAMESPACE = "urn:ibm.com/td";

  private static final String SN_NAMESPACE = "http://www.ibm.com/xmlns/prod/sn";

  private static final String TD_PREFIX = "td";

  private static final String SN_PREFIX = "snx";

  private static final String ERRORCODE = "errorCode";

  private static final String ERRORMESSAGE = "errorMessage";

  private static final String TD_SHARED_WHAT = "sharedWhat";

  private static final String TD_SHARED_WITH = "sharedWith";

  private static final String USER = "user";

  private static final String USERID = "userid";

  private static final String TD_SHARE_PERMISSION = "sharePermission";

  private static final String TD_SCHEME_TYPE = "tag:ibm.com,2006:td/type";

  private static final String TD_TERM_LABEL_DOWNLOAD = "download";

  private static final String TD_DOWNLOAD_TYPE = "downloadType";

  private static final String TD_TERM_LABEL_SHARE = "share";

  private static final String TD_LABEL_LABEL = "label";

  private static final String TD_VERSION_UUID = "versionUuid";

  private static final String HEADER_SLUG = "Slug";

  private static final String APPLICATION_ATOM_XML = "application/atom+xml";

  private static final QName QNAME_ERRORCODE = new QName(TD_NAMESPACE, ERRORCODE, TD_PREFIX);

  private static final QName QNAME_ERRORMESSAGE = new QName(TD_NAMESPACE, ERRORMESSAGE, TD_PREFIX);

  private static final QName QNAME_SHARED_WHAT = new QName(TD_NAMESPACE, TD_SHARED_WHAT, TD_PREFIX);

  private static final QName QNAME_SHARED_WITH = new QName(TD_NAMESPACE, TD_SHARED_WITH, TD_PREFIX);

  private static final QName QNAME_SHARE_PERMISSION = new QName(TD_NAMESPACE, TD_SHARE_PERMISSION, TD_PREFIX);

  private static final QName QNAME_USER = new QName(TD_NAMESPACE, USER, TD_PREFIX);

  private static final QName QNAME_USERID = new QName(SN_NAMESPACE, USERID, SN_PREFIX);

  private static final QName QNAME_LABEL = new QName(TD_NAMESPACE, TD_LABEL_LABEL, TD_PREFIX);

  private static final QName QNAME_ACTION = new QName("http://www.ibm.com/wplc/atom/1.0", "action", "wplc");

  private static final QName QNAME_TIMESTAMP = new QName("http://www.ibm.com/wplc/atom/1.0", "timestamp", "wplc");

  private static final QName QNAME_VERSION_ID = new QName(TD_NAMESPACE, TD_VERSION_UUID, TD_PREFIX);

  private static final QName QNAME_DOWNLOAD_TYPE = new QName(TD_NAMESPACE, TD_DOWNLOAD_TYPE, TD_PREFIX);

  protected MultiThreadedHttpConnectionManager clientsManager;

  protected URL serverUrl;

  protected String userAgent;

  protected String seedlistContextRoot;

  protected String j2cAlias;

  protected Credentials credentials;

  private String qcsContextRoot;

  private static final String S2S_METHOD_LIVE = "conn_live";

  private String s2sMethod;

  protected String repoId;

  protected HttpClient httpclient;

  private String s2stoken;

  private String cacheHome;

  private String sharedDataName;

  private boolean isCacheEncrypted = false;

  private JSONObject repoConfig;

  private String getS2SToken()
  {
    return s2stoken;
  }

  public void init(JSONObject config)
  {
    repoConfig = config;
    if (config.get("server_url") == null)
    {
      throw new IllegalStateException("<server_url> setting is missing from [Lotus Connection Files] repository adapter config.");
    }

    if (config.get("id") == null)
    {
      throw new IllegalStateException("<id> setting is missing from [Lotus Connection Files] repository adapter config.");
    }
    repoId = (String) config.get("id");
    if (S2S_METHOD_LIVE.equals(config.get("s2s_method")))
    {
      LOGGER.log(Level.FINE, "Configured to use shared secret S2S mechanism for ConnectionsLive.");
      s2sMethod = (String) config.get("s2s_method");
      s2stoken = (String) config.get("s2s_token");
      if (s2stoken == null || s2stoken.isEmpty())
      {
        throw new IllegalStateException("Cannot find server to server token in topology file.");
      }
    }
    else
    {
      LOGGER.log(Level.FINE, "Configured to use J2C Alias S2S mechanism for Connections On Premise.");
      if (config.get("j2c_alias") == null && config.get("j2cAlias") == null)
      {
        throw new IllegalStateException("<j2c_alias> setting is missing from [Lotus Connection Files] repository adapter config.");
      }
      j2cAlias = (String) config.get("j2c_alias");
      if (j2cAlias == null)
      {
        j2cAlias = (String) config.get("j2cAlias");
      }
    }

    try
    {
      serverUrl = new URL((String) config.get("server_url"));
      userAgent = ViewerUtil.getUserAgent("Files");
      if (((String) config.get("server_url")).endsWith("/"))
      {
        qcsContextRoot = "form/api";
        seedlistContextRoot = "seedlist/myserver";
      }
      else
      {
        qcsContextRoot = "/form/api";
        seedlistContextRoot = "/seedlist/myserver";
      }
      new URL(serverUrl, qcsContextRoot);
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal URL string when perform initialization of class "
          + LCFilesCMISRepository.class.getSimpleName(), e);
    }

    try
    {
      isCacheEncrypted = Boolean.valueOf(((String) config.get(ConfigConstants.IS_ENCRYPTED)).toLowerCase());
    }
    catch (Exception e)
    {
      // do nothing
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
    // initialize httpclient
    initializeHttpClient(config);

  }

  private void initializeHttpClient(JSONObject config)
  {
    if (S2S_METHOD_LIVE.equals(s2sMethod))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      httpclient = httpClientCreator.create();
    }
    else
    {
      httpclient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
    }
  }

  public boolean impersonationAllowed()
  {
    return true;
  }

  /**
   * Processes the error that occurs when connecting to repository sever.
   * 
   * @param httpMethod
   * @throws RepositoryAccessException
   */
  protected RepositoryAccessException processError(HttpMethod httpMethod)
  {
    if (LOGGER.isLoggable(Level.WARNING))
    {
      LOGGER.warning("[S2S call Response Code]: " + httpMethod.getStatusCode());
    }

    int nErrorCode = RepositoryAccessException.EC_REPO_CANNOT_FILES;
    String errorCode = "";
    String errorMsg = "";
    try
    {
      Document<?> errorDocument = new FOMParser().parse(httpMethod.getResponseBodyAsStream());
      String[] s = extractErrorMessage(errorDocument);
      nErrorCode = LCFilesRepositoryErrorHelper.mapErrorCode(httpMethod.getStatusCode(), s[0]);
      errorCode = s[0];
      errorMsg = s[1];

      if (LOGGER.isLoggable(Level.WARNING))
      {
        LOGGER.warning("[S2S call Response Body]: " + errorDocument.getRoot());
      }
    }
    catch (Exception ex)
    {
      LOGGER.log(Level.WARNING, ex.getMessage(), ex);
    }

    return new RepositoryAccessException(nErrorCode, errorCode, errorMsg);
  }

  protected HttpClient getHttpClient()
  {
    return httpclient;
  }

  protected void setRequestHeaders(HttpMethod method, UserBean requester)
  {
    method.setRequestHeader(USER_AGENT, userAgent);
    if (S2S_METHOD_LIVE.equals(s2sMethod))
    {
      method.setRequestHeader("s2stoken", getS2SToken());
      if (requester != null)
      {
        method.setRequestHeader("onBehalfOf", requester.getEmail());
      }
    }
    else
    {
      if (requester != null && !IUser.FAKE_USER_ID.equals(requester.getId()))
      {
        method.setRequestHeader("X-LConn-RunAs", "userid=" + requester.getId()
            + ",excludeRole=admin, excludeRole=global-moderator, excludeRole=search-admin");
      }
    }
    method.setRequestHeader("X-LConn-RunAs-For", "application");
    if (URLConfig.getIcfilesContext() != null) {
      method.setRequestHeader("x-ibm-icfiles-context", URLConfig.getIcfilesContext());
    }
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    return getDocument(requester, docUri);
  }

  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getDocument[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());

    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }

    HttpClient client = getHttpClient();
    GetMethod getMethod = null;

    IDocumentEntry docEntry = null;

    String[] docIds = DocumentEntry.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.QCS.generateDocumentEntryURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    getMethod = new GetMethod(documentEntryUrl);
    setRequestHeaders(getMethod, requester);

    try
    {
      client.executeMethod(getMethod);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
        docEntry = new DocumentEntry(repoId, entryDocument);
      }
      else
      {
        throw processError(getMethod);
      }
    }
    catch (HttpException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      throw processError(getMethod);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    return docEntry;
  }

  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {
    LOGGER.entering(
        LCFilesQCSRepository.class.getName(),
        (new StringBuilder()).append("addACE[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", ace: ").append(anACE.toJSON()).append("]").toString());

    if (requester == null || docUri == null || anACE == null)
    {
      throw new NullPointerException();
    }

    HttpClient client = getHttpClient();
    PostMethod postMethod = null;

    String[] docIds = DocumentEntry.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];

    Entry entry = new Abdera().getFactory().newEntry();
    entry.addSimpleExtension(QNAME_SHARED_WHAT, docId);
    entry.addAuthor(libId);
    entry.addSimpleExtension(QNAME_SHARE_PERMISSION, URLGenerater.QCS.convert2PermissionString(anACE.getPermissions()));
    // entry.setSummary("");
    // entry.setTitle("");

    ExtensibleElement sharedWithElement = (ExtensibleElement) entry.addExtension(QNAME_SHARED_WITH);
    ExtensibleElement userElement = (ExtensibleElement) entry.addExtension(QNAME_USER);
    Element uriElement = entry.addExtension(QNAME_USERID);
    uriElement.setText(anACE.getPrincipal());
    userElement.addExtension(uriElement);
    sharedWithElement.addExtension(userElement);

    entry.addCategory(TD_SCHEME_TYPE, TD_TERM_LABEL_SHARE, TD_TERM_LABEL_SHARE);

    String shareFeedUrl = URLGenerater.QCS.generateShareFeedURL(serverUrl.toString(), qcsContextRoot);

    postMethod = new PostMethod(shareFeedUrl);
    setRequestHeaders(postMethod, requester);

    try
    {
      postMethod.setRequestEntity(new StringRequestEntity(entry.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(postMethod);
      if (HttpStatus.SC_CREATED == postMethod.getStatusCode())
      {
        ;
      }
      else
      {
        throw processError(postMethod);
      }
    }
    catch (HttpException e)
    {
      LOGGER.log(Level.SEVERE, "addACE failed. {0} {1} {2}", new Object[] { docUri, anACE.toJSON(), e });
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "addACE failed. {0} {1} {2}", new Object[] { docUri, anACE.toJSON(), e });
      throw new RepositoryAccessException(e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      LOGGER.log(Level.SEVERE, "addACE failed. {0} {1} {2}", new Object[] { docUri, anACE.toJSON(), e });
      throw processError(postMethod);
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }

    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "addACE");

  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {

    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getContentStream[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docEntry.getDocUri()).append("]").toString());

    String docUri = docEntry.getDocUri();
    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }

    HttpClient client = getHttpClient();
    GetMethod getMethod = null;

    InputStream is = null;

    String[] docIds = DocumentEntry.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentMediaUrl = URLGenerater.QCS.generateDocumentMediaURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    getMethod = new GetMethod(documentMediaUrl);
    setRequestHeaders(getMethod, requester);

    boolean release = false;
    try
    {
      client.executeMethod(getMethod);
      if (HttpStatus.SC_OK == getMethod.getStatusCode())
      {
        is = new AutoReleaseHttpConnectionInputStream(getMethod.getResponseBodyAsStream(), getMethod);
      }
      else
      {
        release = true;
        throw processError(getMethod);
      }
    }
    catch (HttpException e)
    {
      release = true;
      LOGGER.log(Level.SEVERE, "getContentStream failed. {0} {1}", new Object[] { docUri, e });
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      release = true;
      LOGGER.log(Level.SEVERE, "getContentStream failed. {0} {1}", new Object[] { docUri, e });
      throw new RepositoryAccessException(e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      release = true;
      LOGGER.log(Level.SEVERE, "getContentStream failed. {0} {1}", new Object[] { docUri, e });
      throw processError(getMethod);
    }
    finally
    {
      if (release && getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getContentStream");
    return is;
  }

  protected String encodeHeader(String header)
  {
    String encodedHeader = header;
    try
    {
      StringBuffer buf = new StringBuffer(header.length() * 2);
      buf.append("=?UTF-8?Q?"); //$NON-NLS-1$
      byte[] bytes = header.getBytes("UTF-8"); //$NON-NLS-1$
      int len = bytes.length;
      int i = 0;
      while (i < len)
      {
        buf.append('=');
        int nByte = bytes[i];
        if (nByte < 0)
        {
          nByte += 256;
        }
        buf.append(Integer.toHexString(nByte));
        i++;
      }
      buf.append("?="); //$NON-NLS-1$
      encodedHeader = buf.toString();
    }
    catch (UnsupportedEncodingException e)
    {
      LOGGER.log(Level.FINE, e.getMessage(), e);
    }

    return encodedHeader;
  }

  /**
   * String[] with error code[0] and error message[1].
   * 
   * @param errorDocument
   * @return
   * @throws RepositoryAccessException
   */
  protected String[] extractErrorMessage(Document<?> errorDocument) throws RepositoryAccessException
  {
    String[] s = new String[2];

    Element errorCodeElement = ((ExtensibleElement) errorDocument.getRoot()).getExtension(QNAME_ERRORCODE);
    Element errorMessageElement = ((ExtensibleElement) errorDocument.getRoot()).getExtension(QNAME_ERRORMESSAGE);

    if (errorCodeElement == null || errorMessageElement == null)
    {
      throw new RepositoryAccessException(new IllegalStateException());
    }
    else
    {
      s[0] = errorCodeElement.getText();
      s[1] = errorMessageElement.getText();
      return s;
    }
  }

  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getVersions[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());

    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }

    HttpClient client = getHttpClient();
    GetMethod getMethod = null;

    Vector<IDocumentEntry> result = new Vector<IDocumentEntry>();

    String[] docIds = DocumentEntry.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentVersionFeedUrl = URLGenerater.QCS.generateDocumentVersionFeedURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    getMethod = new GetMethod(documentVersionFeedUrl);
    setRequestHeaders(getMethod, requester);

    try
    {
      client.executeMethod(getMethod);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Feed versions = (Feed) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
        List<Entry> versionEntries = versions.getEntries();
        for (int i = 0; i < versionEntries.size(); i++)
        {
          final Entry versionEntry = (Entry) versionEntries.get(i);
          result.add(new DocumentEntry(repoId)
          {
            public String getDocId()
            {
              return ((Element) (versionEntry.getExtension(Constants.QNAME_TD_UUID))).getText();
            }

            public String getVersion()
            {
              return ((Element) (versionEntry.getExtension(Constants.QNAME_TD_VERSION_LABEL))).getText();
            }
          });
        }
      }
      else
      {
        throw processError(getMethod);
      }
    }
    catch (HttpException e)
    {
      LOGGER.log(Level.SEVERE, "getVersions failed. {0} {1}", new Object[] { docUri, e });
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "getVersions failed. {0} {1}", new Object[] { docUri, e });
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      LOGGER.log(Level.SEVERE, "getVersions failed. {0} {1}", new Object[] { docUri, e });
      throw processError(getMethod);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getVersions");
    return result.toArray(new IDocumentEntry[] {});
  }

  /*
   * This QCS API only supports to get the ACE of personal files.
   * 
   * @see com.ibm.concord.spi.repository.IRepositoryAdapter#getAllACE(com.ibm.concord.spi.beans.UserBean, java.lang.String,
   * java.lang.String, java.lang.String)
   */
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    LOGGER.entering(
        LCFilesQCSRepository.class.getName(),
        (new StringBuilder()).append("getAllACE[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docId: ").append(docEntry.getDocUri()).append("]").toString());

    if (!(docEntry instanceof DocumentEntry))
    {
      throw new IllegalArgumentException("The input parameter 'docEntry' is not valid.");
    }

    String docUri = docEntry.getDocUri();
    String libraryId = ((DocumentEntry) docEntry).getLibraryId();

    Vector<ACE> result = new Vector<ACE>();

    String[] docIds = DocumentEntry.tokens(docUri);
    String userId = docIds[0];
    String docId = docIds[1];

    GetMethod getMethod = null;
    try
    {
      HttpClient client = getHttpClient();
      String permissionsFeedUrl = URLGenerater.QCS
          .generateDocumentPermissionFeedURL(serverUrl.toString(), qcsContextRoot, libraryId, docId);
      getMethod = new GetMethod(permissionsFeedUrl);
      setRequestHeaders(getMethod, requester);
      client.executeMethod(getMethod);

      int nHttpStatus = getMethod.getStatusCode();
      if (nHttpStatus == HttpStatus.SC_OK)
      {
        // Add the document owner into the ACE list, because the returned list do not include the owner.
        result.add(new ACE(userId, Permission.EDIT_SET, Constants.MEMBER_TYPE_USER));

        JSONObject jResults = JSONObject.parse(getMethod.getResponseBodyAsStream());
        JSONArray memberList = (jResults != null) ? (JSONArray) jResults.get("items") : null;
        int len = memberList != null ? memberList.size() : 0;
        for (int i = 0; i < len; i++)
        {
          JSONObject member = (JSONObject) memberList.get(i);
          String memberType = (String) member.get("type");
          String collectionType = (String) member.get("collectionType");
          String memberPermission = (String) member.get("permission");

          // Get the principal id and member type.
          String principalId = null;
          String type = Constants.MEMBER_TYPE_USER;
          if (Constants.MEMBER_TYPE_USER.equalsIgnoreCase(memberType))
          {
            type = Constants.MEMBER_TYPE_USER;
            principalId = (String) member.get("id");
          }
          else if ("collection".equalsIgnoreCase(memberType) && Constants.MEMBER_TYPE_COMMUNITY.equalsIgnoreCase(collectionType))
          {
            type = Constants.MEMBER_TYPE_COMMUNITY;
            principalId = (String) member.get("externalContainerId");
          }
          else
          {
            continue;
          }
          // Get the member's permission.
          Set<Permission> permissionSet;
          if ("Edit".equalsIgnoreCase(memberPermission))
          {
            permissionSet = Permission.EDIT_SET;
          }
          else if ("View".equalsIgnoreCase(memberPermission))
          {
            permissionSet = Permission.VIEW_SET;
          }
          else
          {
            permissionSet = Permission.EMPTY_SET;
          }
          result.add(new ACE(principalId, permissionSet, type));
        }
      }
      else
      {
        throw processError(getMethod);
      }
    }
    catch (HttpException e)
    {
      LOGGER.log(Level.SEVERE, "getAllACE failed. {0} {1} {2}", new Object[] { libraryId, docUri, e });
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "getAllACE failed. {0} {1} {2}", new Object[] { libraryId, docUri, e });
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      LOGGER.log(Level.SEVERE, "getAllACE failed. {0} {1} {2}", new Object[] { libraryId, docUri, e });
      throw processError(getMethod);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getAllACE");
    return result;

  }

  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    if (timestamp == null)
    {
      throw new NullPointerException();
    }

    if (pageSize < 10)
    {
      throw new IllegalArgumentException();
    }

    final String seedListUrl = URLGenerater.QCS.generateSeedListURL(serverUrl.toString(), seedlistContextRoot, timestamp, pageSize);
    final ActionEnum actionE = actionEnum;

    return new Iterator<IDocumentEntry>()
    {
      protected String _uri = seedListUrl;

      protected LinkedList<IDocumentEntry> _result = new LinkedList<IDocumentEntry>();

      private boolean hasNext = true;

      public boolean hasNext()
      {
        if (hasNext)
        {
          return true;
        }
        else
        {
          return false;
        }
      }

      public IDocumentEntry next()
      {
        if (_result.size() == 0 && _uri != null)
        {
          HttpClient client = getHttpClient();
          GetMethod getMethod = new GetMethod(_uri);
          setRequestHeaders(getMethod, null);

          Feed docFeed = null;
          try
          {
            client.executeMethod(getMethod);

            int nHttpStatus = getMethod.getStatusCode();
            if (HttpStatus.SC_OK == nHttpStatus)
            {
              FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
              ro.setFilterRestrictedCharacters(false);
              docFeed = (Feed) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
              if (docFeed.getLink("next") == null && docFeed.getExtension(QNAME_TIMESTAMP) != null)
              {
                _uri = null;
              }
              else
              {
                _uri = docFeed.getLink("next").getHref().toASCIIString();
              }
              List<Entry> docEntries = docFeed.getEntries();
              for (int i = 0; i < docEntries.size(); i++)
              {
                final Entry docEntry = docEntries.get(i);
                String action = docEntry.getExtension(QNAME_ACTION).getAttributeValue("do");
                if (actionE == null)
                {
                  _result.addLast(new DocumentEntry(repoId)
                  {
                    public String getDocId()
                    {
                      return docEntry.getId().toASCIIString();
                    }

                    public String getRepository()
                    {
                      return repoId;
                    }
                  });
                }
                else if ((actionE == ActionEnum.DELETE && "delete".equalsIgnoreCase(action))
                    || (actionE == ActionEnum.INSERT && "insert".equalsIgnoreCase(action))
                    || (actionE == ActionEnum.UPDATE && "update".equalsIgnoreCase(action)))
                {
                  _result.addLast(new DocumentEntry(repoId)
                  {
                    public String getDocId()
                    {
                      return docEntry.getId().toASCIIString();
                    }

                    public String getRepository()
                    {
                      return repoId;
                    }
                  });
                }
                else
                {
                  ;
                }
              }
            }
            else
            {
              throw new IllegalStateException(processError(getMethod));
            }
          }
          catch (HttpException e)
          {
            LOGGER.log(Level.SEVERE, "find failed.", e);
            throw new IllegalStateException(new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e));
          }
          catch (IOException e)
          {
            LOGGER.log(Level.SEVERE, "find failed.", e);
            throw new IllegalStateException(new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e));
          }
          catch (CustomAuthClientRuntimeException e)
          {
            LOGGER.log(Level.SEVERE, "find failed.", e);
            throw new IllegalStateException(processError(getMethod));
          }
          catch (FOMUnsupportedContentTypeException e)
          {
            _uri = null;
            LOGGER.log(Level.WARNING, "Parse Seedlist Response Failed.", e);
            LOGGER.log(Level.WARNING, docFeed.toString());
          }
          finally
          {
            if (getMethod != null)
            {
              getMethod.releaseConnection();
            }
          }

          if (_result.size() != 0)
          {
            return _result.removeFirst();
          }
          else
          {
            return next();
          }
        }
        else if (_result.size() != 0 && _uri != null)
        {
          return _result.removeFirst();
        }
        else if (_result.size() != 0 && _uri == null)
        {
          return _result.removeFirst();
        }
        else
        // _result.size() == 0 && _uri == null
        {
          hasNext = false;
          return null;
        }
      }

      public void remove()
      {
        throw new UnsupportedOperationException();
      }
    };
  }

  private String trimExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = title;
    }
    else
    {
      result = title.substring(0, index);
    }

    return result;
  }

  private String extractExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = "";
    }
    else
    {
      result = title.substring(index + 1);
    }

    return result;
  }

  public String getFilesPath()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public JSONObject getRepositoryConfig()
  {
    return repoConfig;
  }

  public boolean isCacheEncrypt()
  {
    return isCacheEncrypted;
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

  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    LOGGER.entering(
        LCFilesQCSRepository.class.getName(),
        (new StringBuilder()).append("logEvent[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docId: ").append(docUri).append(", versionId: ").append(versionId).append("]").toString());

    if (requester == null || docUri == null || type == null)
    {
      throw new RepositoryAccessException("Requester, docUri and type cannot be null.");
    }

    Entry entry = new Abdera().getFactory().newEntry();
    entry.addCategory(TD_SCHEME_TYPE, TD_TERM_LABEL_DOWNLOAD, TD_TERM_LABEL_DOWNLOAD);
    entry.addSimpleExtension(QNAME_DOWNLOAD_TYPE, type);
    if (versionId != null)
    {
      entry.addSimpleExtension(QNAME_VERSION_ID, versionId);
    }

    String[] docIds = DocumentEntry.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentFeedUrl = URLGenerater.QCS.generateDocumentFeedURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    HttpClient client = getHttpClient();
    PostMethod postMethod = new PostMethod(documentFeedUrl);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);

    try
    {
      postMethod.setRequestEntity(new StringRequestEntity(entry.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(postMethod);

      if (HttpStatus.SC_NO_CONTENT == postMethod.getStatusCode())
      {
        ;
      }
      else if (HttpStatus.SC_OK == postMethod.getStatusCode())
      {
        LOGGER.log(Level.SEVERE, "log event for document failed. {0} {1} {2} {3}",
            new Object[] { docUri, type, versionId, HttpStatus.SC_OK });
      }
      else
      {
        RepositoryAccessException rae = processError(postMethod);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      LOGGER.log(Level.SEVERE, "log event for document failed. {0} {1} {2} {3}", new Object[] { docUri, type, versionId, e });
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      LOGGER.log(Level.SEVERE, "log event for document failed. {0} {1} {2} {3}", new Object[] { docUri, type, versionId, e });
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "logEvent");
    }
  }

  @Override
  public void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("repository doesn't support setThumbnail.");
  }

  @Override
  public String getRepositoryType()
  {
    return RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID;
  }
}
