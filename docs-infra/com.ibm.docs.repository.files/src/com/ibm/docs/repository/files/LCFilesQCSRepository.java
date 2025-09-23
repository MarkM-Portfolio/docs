/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.files;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

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
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.InputStreamRequestEntity;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.io.IOUtils;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.util.ConnectionsUtil;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.common.util.Time;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LCFilesQCSRepository implements IRepositoryAdapter
{
  private static final Logger LOGGER = Logger.getLogger(LCFilesQCSRepository.class.toString());

  private static final String TD_NAMESPACE = "urn:ibm.com/td";

  private static final String SN_NAMESPACE = "http://www.ibm.com/xmlns/prod/sn";

  private static final String TD_PREFIX = "td";

  private static final String SN_PREFIX = "snx";

  private static final String IBM_DOCS_ID = "00000000-00000-0000-0001-00000000000000";

  private static final String ERRORCODE = "errorCode";

  private static final String ERRORMESSAGE = "errorMessage";

  private static final String TD_SHARED_WHAT = "sharedWhat";

  private static final String TD_SHARED_WITH = "sharedWith";

  private static final String USER = "user";

  private static final String USERID = "userid";

  private static final String TD_SHARE_PERMISSION = "sharePermission";

  private static final String TD_DOWNLOAD_TYPE = "downloadType";

  private static final String TD_SCHEME_TYPE = "tag:ibm.com,2006:td/type";

  private static final String TD_TERM_LABEL_SHARE = "share";

  private static final String TD_TERM_LABEL_DOWNLOAD = "download";

  private static final String TD_LABEL_LABEL = "label";

  private static final String TD_VERSION_UUID = "versionUuid";

  private static final String TD_TYPE_ID = "objectTypeId";

  private static final String TD_CREATE_VERSION = "createVersion";

  private static final String HEADER_SLUG = "Slug";

  private static final String USER_AGENT = "User-Agent";

  private static final String APPLICATION_ATOM_XML = "application/atom+xml";

  private static final QName QNAME_ERRORCODE = new QName(TD_NAMESPACE, ERRORCODE, TD_PREFIX);

  private static final QName QNAME_ERRORMESSAGE = new QName(TD_NAMESPACE, ERRORMESSAGE, TD_PREFIX);

  private static final QName QNAME_SHARED_WHAT = new QName(TD_NAMESPACE, TD_SHARED_WHAT, TD_PREFIX);

  private static final QName QNAME_SHARED_WITH = new QName(TD_NAMESPACE, TD_SHARED_WITH, TD_PREFIX);

  private static final QName QNAME_SHARE_PERMISSION = new QName(TD_NAMESPACE, TD_SHARE_PERMISSION, TD_PREFIX);

  private static final QName QNAME_DOWNLOAD_TYPE = new QName(TD_NAMESPACE, TD_DOWNLOAD_TYPE, TD_PREFIX);

  private static final QName QNAME_USER = new QName(TD_NAMESPACE, USER, TD_PREFIX);

  private static final QName QNAME_USERID = new QName(SN_NAMESPACE, USERID, SN_PREFIX);

  private static final QName QNAME_LABEL = new QName(TD_NAMESPACE, TD_LABEL_LABEL, TD_PREFIX);

  private static final QName QNAME_TYPE_ID = new QName(TD_NAMESPACE, TD_TYPE_ID, TD_PREFIX);

  private static final QName QNAME_CREATE_VERSION = new QName(TD_NAMESPACE, TD_CREATE_VERSION, TD_PREFIX);

  private static final QName QNAME_ACTION = new QName("http://www.ibm.com/wplc/atom/1.0", "action", "wplc");

  private static final QName QNAME_TIMESTAMP = new QName("http://www.ibm.com/wplc/atom/1.0", "timestamp", "wplc");

  private static final QName QNAME_VERSION_ID = new QName(TD_NAMESPACE, TD_VERSION_UUID, TD_PREFIX);

  protected HttpClient client;

  protected URL serverUrl;

  protected String userAgent;

  protected String seedlistContextRoot;

  protected String j2cAlias;

  protected Credentials credentials;

  private String qcsContextRoot;

  private static final String S2S_METHOD_LIVE = "conn_live";

  private String s2sMethod;

  private String s2sToken;

  protected String repoId;

  private JSONObject config;

  protected String getS2SToken()
  {
    // SharedSettings settings = SharedSettings.getInstance();
    // return settings.getProperty("s2stoken");
    return s2sToken;
  }

  public void init(JSONObject config)
  {
    this.config = config;
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
      LOGGER.log(Level.INFO, "Configured to use shared secret S2S mechanism for ConnectionsLive.");
      s2sMethod = (String) config.get("s2s_method");
      s2sToken = (String) config.get("s2s_token");
      if (s2sToken == null || s2sToken.isEmpty())
      {
        throw new IllegalStateException("Cannot find server to server token in config file.");
      }
    }
    else
    {
      LOGGER.log(Level.INFO, "Configured to use J2C Alias S2S mechanism for Connections On Premise.");
      if (config.get("j2c_alias") == null)
      {
        throw new IllegalStateException("<j2c_alias> setting is missing from [Lotus Connection Files] repository adapter config.");
      }
      j2cAlias = (String) config.get("j2c_alias");
    }

    try
    {
      serverUrl = new URL((String) config.get("server_url"));
      userAgent = ConnectionsUtil.getUserAgent("Files");
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

    // initialize the HttpClient
    if (S2S_METHOD_LIVE.equals(s2sMethod))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
    }
    else
    {
      client = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
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
      LOGGER.log(Level.WARNING, "[S2S call Response Code]: {0}", httpMethod.getStatusCode());
    }

    int nErrorCode = RepositoryAccessException.EC_REPO_CANNOT_FILES;
    String errorCode = "";
    String errorMsg = "";
    String errorBody = "";
    ByteArrayInputStream bais = null;
    Document<?> errorDocument = null;
    try
    {
      bais = new ByteArrayInputStream(IOUtils.toByteArray(httpMethod.getResponseBodyAsStream()));
      errorBody = bais.toString();
      errorDocument = new FOMParser().parse(bais);
      String[] s = extractErrorMessage(errorDocument);
      nErrorCode = LCFilesRepositoryErrorHelper.mapErrorCode(httpMethod.getStatusCode(), s[0]);
      errorCode = s[0];
      errorMsg = s[1];

      if (LOGGER.isLoggable(Level.WARNING))
      {
        LOGGER.log(Level.WARNING, "[S2S call Response Body]: {0}", errorDocument.getRoot());
      }
    }
    catch (Throwable ex)
    {
      LOGGER.log(Level.WARNING, "[S2S call Response Body]: {0} {1} {2}", new Object[] { errorBody, ex.getMessage(), ex });
    }
    finally
    {
      if (bais != null)
      {
        try
        {
          bais.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Exception happens when close response body stream: ", e);
        }
      }
    }

    RepositoryAccessException rae = new RepositoryAccessException(nErrorCode, errorCode, errorMsg);
    rae.setStatusCode(nErrorCode);
    return rae;
  }

  protected boolean isConnLive()
  {
    return S2S_METHOD_LIVE.equals(s2sMethod);
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
      else
      {
        method.setRequestHeader("onBehalfOf", "bssadmin@us.ibm.com");
      }
    }
    else
    {
      if (requester != null)
      {
        method.setRequestHeader("X-LConn-RunAs", "userid=" + requester.getId()
            + ",excludeRole=admin, excludeRole=global-moderator, excludeRole=org-admin, excludeRole=search-admin");
      }
    }
    method.setRequestHeader("X-LConn-RunAs-For", "application");
    if (URLConfig.getIcfilesContext() != null)
      method.setRequestHeader("x-ibm-icfiles-context", URLConfig.getIcfilesContext());
  }

  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    if (requester != null)
      LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getDocument[uid: ").append(requester.getId())
          .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());
    else
      LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getDocument[user: admin, docId: ").append(docUri)
          .append("]").toString());

    if (docUri == null)
    {
      throw new NullPointerException();
    }

    IDocumentEntry docEntry = null;

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.QCS.generateDocumentEntryURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    GetMethod getMethod = new GetMethod(documentEntryUrl);
    if (requester != null)
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
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getDocument");
    return docEntry;
  }

  public IDocumentEntry getDocument(String docUri) throws RepositoryAccessException
  {
    return getDocument(null, docUri);
  }

  public void addACE(UserBean requester, IDocumentEntry docEntry, ACE anACE) throws RepositoryAccessException
  {
    LOGGER.entering(
        LCFilesQCSRepository.class.getName(),
        (new StringBuilder()).append("addACE[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", ace: ").append(anACE.toJSON()).append("]").toString());

    if (requester == null || docEntry == null || anACE == null)
    {
      throw new NullPointerException();
    }

    String[] docIds = URLGenerater.tokens(docEntry.getDocUri());
    // String libId = docIds[0];
    String libId = docEntry.getCreator()[0];
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

    PostMethod postMethod = new PostMethod(shareFeedUrl);
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
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("docUri", docEntry.getDocUri());
        rae.getData().put("ACE", anACE.toJSON());
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("addACE failed");
      rae.getData().put("docUri", docEntry.getDocUri());
      rae.getData().put("ACE", anACE.toJSON());
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.setDefaultErrDetail("addACE failed");
      rae.getData().put("docUri", docEntry.getDocUri());
      rae.getData().put("ACE", anACE.toJSON());
      throw rae;
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
    return getContentStream(requester, docEntry, true);
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException
  {
    if (docEntry == null)
    {
      throw new NullPointerException();
    }

    String docUri = docEntry.getDocUri();

    if (requester != null)
      LOGGER.entering(LCFilesQCSRepository.class.getName(),
          (new StringBuilder()).append("getContentStream[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
              .append(", docId: ").append(docUri).append(", logDownload: ").append(logDownload).append("]").toString());
    else
      LOGGER.entering(LCFilesQCSRepository.class.getName(),
          (new StringBuilder()).append("getContentStream[user: admin, docId: ").append(docUri).append(", logDownload: ")
              .append(logDownload).append("]").toString());

    InputStream is = null;

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    /**
     * 57896 : ignore parameter of logDownload and set it to false
     */
    String documentMediaUrl = URLGenerater.QCS.generateDocumentMediaURL(serverUrl.toString(), qcsContextRoot, libId, docId, false);

    GetMethod getMethod = new GetMethod(documentMediaUrl);
    if (requester != null)
      setRequestHeaders(getMethod, requester);
    Time time = new Time();
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
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("docUri", docUri);
        release = true;
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getContentStream failed");
      rae.getData().put("docUri", docUri);
      release = true;
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      release = true;
      throw rae;
    }
    finally
    {
      if (release)
      {
        getMethod.releaseConnection();
      }
    }
    LOGGER.info("It takes " + time.ellapse() + " ms to get the content of " + docId);

    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getContentStream");
    return is;
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, null);
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, null, overwrite);
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary, String docLabel)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, docLabel, false);
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      String docLabel, boolean overwrite) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null || is == null)
    {
      throw new NullPointerException();
    }

    String docUri = docEntry.getDocUri();
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("setContentStream[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentMediaUri = URLGenerater.QCS.generateUploadEntryAsReplaceURL(serverUrl.toString(), qcsContextRoot, libId, docId,
        versionSummary, overwrite, docEntry.getModified().getTimeInMillis());

    LOGGER.log(Level.INFO, "Files REST url is: " + documentMediaUri);

    PostMethod postMethod = new PostMethod(documentMediaUri);
    setRequestHeaders(postMethod, requester);
    postMethod.setRequestHeader("X-Method-Override", "PUT");
    postMethod.setContentChunked(false);
    if (docLabel != null)
    {
      postMethod.setRequestHeader(HEADER_SLUG, encodeHeader(docLabel));
    }
    postMethod.setRequestEntity(new InputStreamRequestEntity(is));
    Time time = new Time();
    try
    {
      client.executeMethod(postMethod);
      if (HttpStatus.SC_OK == postMethod.getStatusCode())
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro).getRoot();
        LOGGER.exiting(LCFilesQCSRepository.class.getName(), "setContentStream");
        return new DocumentEntry(repoId, entryDocument);
      }
      else
      {
        RepositoryAccessException exp = processError(postMethod);
        if (exp.getStatusCode() == -1)
        {
          return null;
        }
        else
        {
          exp.getData().put("docUri", docUri);
          throw exp;
        }
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("setContentStream failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.info("It takes " + time.ellapse() + " ms to update the content of " + docId);
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "setContentStream");
    }
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle());
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle(), overwrite);
  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is)
      throws RepositoryAccessException
  {
    return createDocument(requester, folderUri, folderType, docLabel, is, null, null, null);
  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is,
      Boolean isExternal, Boolean propagate, MediaOptions options) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("createDocument[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docLabel: ").append(docLabel).append("]").toString());

    if (requester == null || folderUri == null || docLabel == null || is == null)
    {
      throw new NullPointerException();
    }

    String containerFeedUri = URLGenerater.QCS.generateUploadMediaAsCreateURL(serverUrl.toString(), qcsContextRoot, folderUri, folderType,
        isExternal, propagate, options);

    PostMethod postMethod = new PostMethod(containerFeedUri);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);
    postMethod.setRequestHeader(HEADER_SLUG, encodeHeader(docLabel));
    postMethod.setRequestEntity(new InputStreamRequestEntity(is, MimeTypeUtil.MIME_TYPE_MAP.getContentType(docLabel)));

    try
    {
      client.executeMethod(postMethod);
      if (HttpStatus.SC_CREATED == postMethod.getStatusCode())
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro).getRoot();
        LOGGER.exiting(LCFilesQCSRepository.class.getName(), "createDocument");
        return new DocumentEntry(repoId, entryDocument);
      }
      else
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("folderUri", folderUri);
        rae.getData().put("docLabel", docLabel);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("create document failed");
      rae.getData().put("folderUri", folderUri);
      rae.getData().put("docLabel", docLabel);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.setDefaultErrDetail("create document failed");
      rae.getData().put("folderUri", folderUri);
      rae.getData().put("docLabel", docLabel);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "createDocument");
    }
  }

  public IDocumentEntry setIBMdocsType(UserBean requester, IDocumentEntry docEntry, boolean createVersion) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("setIBMdocsType[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docEntry != null ? docEntry.getDocUri() : "empty")
        .append("]").toString());

    String docUri = docEntry != null ? docEntry.getDocUri() : null;
    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }

    IDocumentEntry newDocEntry = null;

    Entry entry = new Abdera().getFactory().newEntry();
    Element typeNameElement = entry.addExtension(QNAME_TYPE_ID);
    typeNameElement.setText(IBM_DOCS_ID);

    Element createVersionElement = entry.addExtension(QNAME_CREATE_VERSION);
    createVersionElement.setText(Boolean.toString(createVersion));

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.QCS.generateDocumentEntryURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    PostMethod postMethod = new PostMethod(documentEntryUrl);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);
    postMethod.setRequestHeader("X-Method-Override", "PUT");

    try
    {
      postMethod.setRequestEntity(new StringRequestEntity(entry.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(postMethod);

      if (HttpStatus.SC_OK == postMethod.getStatusCode())
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro).getRoot();
        LOGGER.exiting(LCFilesQCSRepository.class.getName(), "setIBMdocsType");
        newDocEntry = new DocumentEntry(repoId, entryDocument);
      }
      else
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("docUri", docEntry.getDocUri());
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("set IBMdocs type failed");
      rae.getData().put("docUri", docEntry.getDocUri());
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docEntry.getDocUri());
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "setIBMdocsType");
    }

    return newDocEntry;
  }

  public void deleteDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("deleteDocument[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());

    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.QCS.generateDocumentEntryURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    PostMethod postMethod = new PostMethod(documentEntryUrl);
    setRequestHeaders(postMethod, requester);

    postMethod.setContentChunked(false);
    postMethod.setRequestHeader("X-Method-Override", "DELETE");

    try
    {
      client.executeMethod(postMethod);
      int nHttpStatus = postMethod.getStatusCode();
      if (HttpStatus.SC_NO_CONTENT != nHttpStatus)
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "deleteDocument");
    }
  }

  public IDocumentEntry lockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("lockDocument[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docEntry.getDocId()).append("]").toString());

    String docUri = docEntry.getDocUri();
    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentLockUrl = URLGenerater.QCS.generateDocumentLockURL(serverUrl.toString(), qcsContextRoot, libId, docId, true);

    PostMethod postMethod = new PostMethod(documentLockUrl);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);

    try
    {
      client.executeMethod(postMethod);
      if (HttpStatus.SC_NO_CONTENT != postMethod.getStatusCode())
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("libId", libId);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
      return getDocument(requester, docUri);
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.getData().put("libId", libId);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("libId", libId);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "lockDocument");
    }
  }

  public IDocumentEntry unlockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("unlockDocument[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docEntry.getDocUri()).append("]").toString());

    String docUri = docEntry.getDocUri();
    String[] docIds = URLGenerater.tokens(docEntry.getDocUri());
    String libId = docIds[0];
    String docId = docIds[1];
    String documentLockUrl = URLGenerater.QCS.generateDocumentLockURL(serverUrl.toString(), qcsContextRoot, libId, docId, false);

    PostMethod postMethod = new PostMethod(documentLockUrl);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);
    postMethod.setRequestHeader("X-Method-Override", "DELETE");

    try
    {
      client.executeMethod(postMethod);
      int nHttpStatus = postMethod.getStatusCode();
      if (HttpStatus.SC_NO_CONTENT != nHttpStatus)
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
      return getDocument(requester, docUri);
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "unlockDocument");
    }
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
      throw new RepositoryAccessException(new IllegalStateException("errorCodeElement or errorMessageElement is null"));
    }
    else
    {
      s[0] = errorCodeElement.getText();
      s[1] = errorMessageElement.getText();
      return s;
    }
  }

  public String getFolderUri(UserBean requester, String communityUuid) throws RepositoryAccessException
  {
    if (requester == null)
      throw new NullPointerException();

    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getFolderUri[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", communityUuid: ").append(communityUuid).append("]").toString());

    if (communityUuid == null)
      return null;

    GetMethod getMethod = null;
    String folderId = null;
    String communityLibraryFeed = URLGenerater.QCS.generateCommunityLibraryFeedURL(serverUrl.toString(), qcsContextRoot, communityUuid);

    LOGGER.info("feedurl: " + communityLibraryFeed);

    getMethod = new GetMethod(communityLibraryFeed);
    setRequestHeaders(getMethod, requester);

    try
    {
      client.executeMethod(getMethod);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Feed data = (Feed) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
        folderId = ((Element) (data.getExtension(Constants.QNAME_TD_UUID))).getText();
      }
      else
      {
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("communityUuid", communityUuid);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("communityUuid", communityUuid);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("communityUuid", communityUuid);
      throw rae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "communityUuid");

    return folderId;
  }

  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("renameDocument[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docEntry.getDocUri()).append("]").toString());

    String docUri = docEntry != null ? docEntry.getDocUri() : null;
    if (requester == null || docUri == null || newLabel == null)
    {
      throw new NullPointerException();
    }

    IDocumentEntry newDocEntry = null;

    Entry entry = new Abdera().getFactory().newEntry();
    entry.setTitle(newLabel);
    Element labelElement = entry.addExtension(QNAME_LABEL);
    labelElement.setText(newLabel);

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.QCS.generateDocumentEntryURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    PostMethod postMethod = new PostMethod(documentEntryUrl);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);
    postMethod.setRequestHeader("X-Method-Override", "PUT");

    try
    {
      postMethod.setRequestEntity(new StringRequestEntity(entry.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(postMethod);

      if (HttpStatus.SC_OK == postMethod.getStatusCode())
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro).getRoot();
        LOGGER.exiting(LCFilesQCSRepository.class.getName(), "renameDocument");
        newDocEntry = new DocumentEntry(repoId, entryDocument);
      }
      else if (HttpStatus.SC_CONFLICT == postMethod.getStatusCode())
      {
        RepositoryAccessException rae = processError(postMethod);
        if ("ItemExists".equals(rae.getRepoErrCode()))
        {
          int count = 1;
          int i = newLabel.lastIndexOf('.');
          int j = newLabel.lastIndexOf('_');
          if (i > j && j > 0 && Pattern.matches("\\d+", newLabel.substring(j + 1, i)))
          {
            count = Integer.valueOf(newLabel.substring(j + 1, i)) + 1;
            newLabel = newLabel.substring(0, j) + newLabel.substring(i);
          }

          String adjustLabel = newLabel;
          String suffix = "_" + count + "." + extractExt(newLabel);
          int lenSuffix = suffix.getBytes().length;
          adjustLabel = trimExt(newLabel);
          if (adjustLabel.getBytes().length + lenSuffix > 252)
            adjustLabel = adjustLabel.substring(0, adjustLabel.length() - ("_" + count).length()) + suffix;
          else
            adjustLabel = adjustLabel + suffix;

          return renameDocument(requester, docEntry, adjustLabel);
        }
        else
        {
          rae.getData().put("docUri", docEntry.getDocUri());
          rae.getData().put("newLabel", newLabel);
          throw rae;
        }
      }
      else
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("docUri", docEntry.getDocUri());
        rae.getData().put("newLabel", newLabel);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("rename document failed");
      rae.getData().put("docUri", docEntry.getDocUri());
      rae.getData().put("newLabel", newLabel);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docEntry.getDocUri());
      rae.getData().put("newLabel", newLabel);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesQCSRepository.class.getName(), "renameDocument");
    }

    return newDocEntry;
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
      throw new NullPointerException();
    }

    Entry entry = new Abdera().getFactory().newEntry();
    entry.addCategory(TD_SCHEME_TYPE, TD_TERM_LABEL_DOWNLOAD, TD_TERM_LABEL_DOWNLOAD);
    entry.addSimpleExtension(QNAME_DOWNLOAD_TYPE, type);
    if (versionId != null)
    {
      entry.addSimpleExtension(QNAME_VERSION_ID, versionId);
    }

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentFeedUrl = URLGenerater.QCS.generateDocumentFeedURL(serverUrl.toString(), qcsContextRoot, libId, docId);

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
        rae.getData().put("docUri", docUri);
        rae.getData().put("type", type);
        rae.getData().put("versionId", versionId);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("log event for document failed");
      rae.getData().put("docUri", docUri);
      rae.getData().put("type", type);
      rae.getData().put("versionId", versionId);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      rae.getData().put("type", type);
      rae.getData().put("versionId", versionId);
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

  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("restoreVersion[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append(", versionId: ").append(versionId)
        .append("]").toString());

    if (requester == null || docUri == null || versionId == null)
    {
      throw new NullPointerException();
    }

    IDocumentEntry docEntry = null;

    Entry entry = new Abdera().getFactory().newEntry();
    Element versionIdElement = entry.addExtension(QNAME_VERSION_ID);
    versionIdElement.setText(versionId);

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.QCS.generateDocumentEntryURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    PostMethod postMethod = new PostMethod(documentEntryUrl);
    setRequestHeaders(postMethod, requester);
    postMethod.setContentChunked(false);
    postMethod.setRequestHeader("X-Method-Override", "PUT");

    try
    {
      postMethod.setRequestEntity(new StringRequestEntity(entry.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(postMethod);

      if (HttpStatus.SC_OK == postMethod.getStatusCode())
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro).getRoot();
        docEntry = new DocumentEntry(repoId, entryDocument);
      }
      else
      {
        RepositoryAccessException rae = processError(postMethod);
        rae.getData().put("docUri", docUri);
        rae.getData().put("versionId", versionId);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("restore version failed");
      rae.getData().put("docUri", docUri);
      rae.getData().put("versionId", versionId);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      rae.getData().put("versionId", versionId);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }
    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "restoreVersion");
    return docEntry;
  }

  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null)
    {
      throw new NullPointerException();
    }

    String docUri = docEntry.getDocUri();

    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getVersions[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());

    Vector<IDocumentEntry> result = new Vector<IDocumentEntry>();

    String[] docIds = URLGenerater.tokens(docUri);
    String libId = docIds[0];
    String docId = docIds[1];
    String documentVersionFeedUrl = URLGenerater.QCS.generateDocumentVersionFeedURL(serverUrl.toString(), qcsContextRoot, libId, docId);

    GetMethod getMethod = new GetMethod(documentVersionFeedUrl);
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
          Entry versionEntry = (Entry) versionEntries.get(i);
          result.add(new DocumentEntry(repoId, versionEntry));
        }
      }
      else
      {
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      throw rae;
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
   * @see com.ibm.concord.spi.repository.IRepositoryAdapter#getAllACE(com.ibm.concord .spi.beans.UserBean, java.lang.String,
   * java.lang.String, java.lang.String)
   */
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    LOGGER.entering(
        LCFilesQCSRepository.class.getName(),
        (new StringBuilder()).append("getAllACE[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docId: ").append(docEntry.getDocUri()).append("]").toString());

    String docUri = docEntry.getDocUri();
    String libraryId = docEntry.getLibraryId();

    Vector<ACE> result = new Vector<ACE>();

    String[] docIds = URLGenerater.tokens(docUri);
    // String userId = docIds[0];
    String userId = docEntry.getCreator()[0];
    String docId = docIds[1];

    GetMethod getMethod = null;
    try
    {
      String permissionsFeedUrl = URLGenerater.QCS
          .generateDocumentPermissionFeedURL(serverUrl.toString(), qcsContextRoot, libraryId, docId);
      getMethod = new GetMethod(permissionsFeedUrl);
      setRequestHeaders(getMethod, requester);
      client.executeMethod(getMethod);

      int nHttpStatus = getMethod.getStatusCode();
      if (nHttpStatus == HttpStatus.SC_OK)
      {
        // Add the document owner into the ACE list, because the
        // returned list do not include the owner.
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
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("libraryId", libraryId);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("libraryId", libraryId);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("libraryId", libraryId);
      rae.getData().put("docUri", docUri);
      throw rae;
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

  public IDocumentEntry[] getOwnedDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesQCSRepository.class.getName(), (new StringBuilder()).append("getOwnedDocuments[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append("]").toString());

    if (requester == null || pageSize <= 0 || pageNumber <= 0)
    {
      throw new NullPointerException();
    }

    Vector<IDocumentEntry> result = new Vector<IDocumentEntry>();

    String ownedDocumentFeedUrl = URLGenerater.QCS.generateOwnedDocumentsFeedURL(serverUrl.toString(), qcsContextRoot, requester.getId(),
        pageSize, pageNumber);

    GetMethod getMethod = new GetMethod(ownedDocumentFeedUrl);
    setRequestHeaders(getMethod, requester);

    try
    {
      client.executeMethod(getMethod);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Feed documents = (Feed) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
        List<Entry> documentEntries = documents.getEntries();
        for (int i = 0; i < documentEntries.size(); i++)
        {
          Entry documentEntry = (Entry) documentEntries.get(i);
          result.add(new DocumentEntry(repoId, documentEntry));
        }

        if (documents.getLink("next") == null)
        {
          result.add(null);
        }
      }
      else
      {
        throw processError(getMethod);
      }
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      throw rae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getOwnedDocuments");
    return result.toArray(new IDocumentEntry[] {});
  }

  public IDocumentEntry[] getPermissiveDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    LOGGER.entering(
        LCFilesQCSRepository.class.getName(),
        (new StringBuilder()).append("getPermissiveDocuments[uid: ").append(requester.getId()).append(", orgId: ")
            .append(requester.getOrgId()).append("]").toString());

    if (requester == null || pageSize <= 0 || pageNumber <= 0)
    {
      throw new NullPointerException();
    }

    Vector<IDocumentEntry> result = new Vector<IDocumentEntry>();

    String permissiveFeedUrl = URLGenerater.QCS.generatePermissiveDocumentsFeedURL(serverUrl.toString(), qcsContextRoot, requester.getId(),
        pageSize, pageNumber);

    GetMethod getMethod = new GetMethod(permissiveFeedUrl);
    setRequestHeaders(getMethod, requester);

    try
    {
      client.executeMethod(getMethod);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Feed documents = (Feed) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
        List<Entry> documentEntries = documents.getEntries();
        for (int i = 0; i < documentEntries.size(); i++)
        {
          Entry documentEntry = (Entry) documentEntries.get(i);
          result.add(new DocumentEntry(repoId, documentEntry));
        }

        if (documents.getLink("next") == null)
        {
          result.add(null);
        }
      }
      else
      {
        throw processError(getMethod);
      }
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      throw rae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    LOGGER.exiting(LCFilesQCSRepository.class.getName(), "getPermissiveDocuments");
    return result.toArray(new IDocumentEntry[] {});
  }

  public Iterator<IDocumentEntry> getSeedList(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
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
                  final String id = docEntry.getId().toASCIIString();
                  _result.addLast(new DocumentEntry(repoId)
                  {
                    public String getDocId()
                    {
                      return id;
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
                  final String id = docEntry.getId().toASCIIString();
                  _result.addLast(new DocumentEntry(repoId)
                  {
                    public String getDocId()
                    {
                      return id;
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

  public HashMap<String, String> getBidiPreferences(UserBean requester) throws RepositoryAccessException
  {
    return new HashMap<String, String>();
  }

  public JSONObject getConfig()
  {
    return config;
  }

  @Override
  public String getRepoType()
  {
    return RepositoryConstants.REPO_TYPE_FILES;
  }

  @Override
  public void processLeaveData(UserBean user, String repoId, String docId, JSONObject data)
  {
    // TODO Auto-generated method stub

  }

  @Override
  public void notifyServerEvent(JSONObject msg)
  {
    // TODO Auto-generated method stub

  }
}
