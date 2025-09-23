/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.external.repository.cmis;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.client.api.ObjectId;
import org.apache.chemistry.opencmis.client.api.Repository;
import org.apache.chemistry.opencmis.client.api.Session;
import org.apache.chemistry.opencmis.client.api.SessionFactory;
import org.apache.chemistry.opencmis.client.runtime.SessionFactoryImpl;
import org.apache.chemistry.opencmis.commons.SessionParameter;
import org.apache.chemistry.opencmis.commons.enums.BindingType;
import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.docs.common.cmisproviders.J2CAliasAuthenticationProvider;
import com.ibm.docs.common.cmisproviders.OAuth2AuthenticationProvider;
import com.ibm.docs.common.cmisproviders.S2STokenAuthenticationProvider;
import com.ibm.docs.common.oauth.OAuth2Util;
import com.ibm.docs.common.util.J2CAliasHelper;
import com.ibm.docs.viewer.external.util.Constants;
import com.ibm.json.java.JSONObject;
import org.apache.chemistry.opencmis.commons.exceptions.CmisPermissionDeniedException;


public class ExternalCMISRepository implements IRepositoryAdapter
{
  private static final Logger LOG = Logger.getLogger(ExternalCMISRepository.class.getName());

  private Hashtable<String, Session> sessions = new Hashtable<String, Session>();

  private String docsEndpoint;

  private String repoHomeUrl;

  private String s2sMethod;

  private String cmisAtomPub;

  private String objectStore;

  private String cmisAuthClass;

  private String oauth2Client;

  private String oauth2Secret;

  private String oauth2Endpoint;

  private String j2cAlias;

  private String s2sToken;

  private String s2sTokenKey;

  private String onBehalfKey;

  private String customerId;

  private JSONObject customizedAuthParas;

  private String cacheHome;

  private String sharedDataName;

  /**
   * Used by UT/FVT
   * 
   * @param userId
   * @param psw
   * @param atomPubUrl
   * @param objectStore
   * @return
   */
  private Session createUserSession(String userId, String psw, String atomPubUrl, String objectStore)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameter = new HashMap<String, String>();
    parameter.put(SessionParameter.USER, userId);
    parameter.put(SessionParameter.PASSWORD, psw);
    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    Session session = null;
    if (objectStore != null && objectStore.length() > 0)
    {
      parameter.put(SessionParameter.REPOSITORY_ID, objectStore);
      session = factory.createSession(parameter);
    }
    else
    {
      Repository repository = factory.getRepositories(parameter).get(0);
      if (repository == null)
      {
        LOG.log(Level.SEVERE, "Failed to get the repository!");
      }
      session = repository.createSession();
    }
    return session;
  }

  private Session createSSOCookieSession(String userId, String atomPubUrl, String objectStore)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameter = new HashMap<String, String>();
    parameter.put(SessionParameter.USER, userId);
    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameter.put(SessionParameter.COOKIES, "true");
    parameter.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, cmisAuthClass);
    Session session = null;
    if (objectStore != null && objectStore.length() > 0)
    {
      parameter.put(SessionParameter.REPOSITORY_ID, objectStore);
      session = factory.createSession(parameter);
    }
    else
    {
      Repository repository = factory.getRepositories(parameter).get(0);
      if (repository == null)
      {
        LOG.log(Level.SEVERE, "Failed to get the repository!");
      }
      session = repository.createSession();
    }
    return session;
  }

  private Session createJ2CAliasSession(UserBean user, String alias, String atomPubUrl, String objectStore)
  {
    Session session = null;
    SessionFactory factory = SessionFactoryImpl.newInstance();

    Map<String, String> parameter = new HashMap<String, String>();

    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());

    parameter.put(SessionParameter.COOKIES, "true");
    parameter.put(SessionParameter.USER, alias);
    parameter.put(J2CAliasAuthenticationProvider.J2C_URL, atomPubUrl);
    parameter.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, cmisAuthClass);
    parameter.put(J2CAliasAuthenticationProvider.ON_BEHALF_OF_KEY, onBehalfKey);
    parameter.put(J2CAliasAuthenticationProvider.ON_BEHALF_OF_VALUE, user.getEmail());

    if (objectStore != null && objectStore.length() > 0)
    {
      parameter.put(SessionParameter.REPOSITORY_ID, objectStore);
      session = factory.createSession(parameter);
    }
    else
    {
      Repository repository = factory.getRepositories(parameter).get(0);
      if (repository == null)
      {
        LOG.log(Level.SEVERE, "Failed to get the repository!");
      }
      session = repository.createSession();
    }

    return session;
  }

  private Session createS2STokenSession(UserBean user, String token, String tokenKey, String atomPubUrl, String objectStore)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameter = new HashMap<String, String>();
    parameter.put(S2STokenAuthenticationProvider.S2S_TOKEN, token);
    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameter.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, cmisAuthClass);
    parameter.put(S2STokenAuthenticationProvider.ON_BEHALF_OF_KEY, onBehalfKey);
    parameter.put(S2STokenAuthenticationProvider.S2S_TOKEN_KEY, tokenKey);
    parameter.put(S2STokenAuthenticationProvider.ON_BEHALF_OF_VALUE, user.getEmail());
    Session session;
    if (objectStore != null && objectStore.length() > 0)
    {
      parameter.put(SessionParameter.REPOSITORY_ID, objectStore);
      session = factory.createSession(parameter);
    }
    else
    {
      Repository repository = factory.getRepositories(parameter).get(0);
      if (repository == null)
      {
        LOG.log(Level.SEVERE, "Failed to get the repository!");
      }
      session = repository.createSession();
    }
    return session;
  }

  private Session createCustomizedSession(UserBean user, String atomPubUrl, String objectStore)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameter = new HashMap<String, String>();

    boolean bUser = false;
    if (customizedAuthParas != null)
    {
      Set<?> keys = customizedAuthParas.keySet();
      Iterator<?> iterator = keys.iterator();
      while (iterator.hasNext())
      {
        String key = iterator.next().toString();
        String value = (String) customizedAuthParas.get(key);
        parameter.put(key, value);
        if (SessionParameter.USER.equalsIgnoreCase(key) && value != null)
        {
          bUser = true;
        }
      }
    }
    if (!bUser)
    {
      parameter.put(SessionParameter.USER, user.getId());
    }
    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    if (cmisAuthClass != null && cmisAuthClass.length() > 0)
      parameter.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, cmisAuthClass);
    Session session;
    if (objectStore != null && objectStore.length() > 0)
    {
      parameter.put(SessionParameter.REPOSITORY_ID, objectStore);
      session = factory.createSession(parameter);
    }
    else
    {
      Repository repository = factory.getRepositories(parameter).get(0);
      if (repository == null)
      {
        LOG.log(Level.SEVERE, "Failed to get the repository!");
      }
      session = repository.createSession();
    }
    return session;
  }

  private Session createOAuth2Session(String user, String authCode, String clientId, String clientSecret, String atomPubUrl,
      String objectStore, String redirectUri, String oAuthTokenEndpoint)
  {
    Session session;
    SessionFactory factory = SessionFactoryImpl.newInstance();

    Map<String, String> parameter = new HashMap<String, String>();

    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());

    parameter.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, cmisAuthClass);
    parameter.put(SessionParameter.OAUTH_TOKEN_ENDPOINT, oAuthTokenEndpoint);
    parameter.put(SessionParameter.OAUTH_CLIENT_ID, clientId);
    parameter.put(SessionParameter.OAUTH_CLIENT_SECRET, clientSecret);
    parameter.put(SessionParameter.OAUTH_REDIRECT_URI, redirectUri);
    parameter.put(OAuth2AuthenticationProvider.OAUTH_USERID, user);

    if (authCode != null)
    {
      parameter.put(SessionParameter.OAUTH_CODE, authCode);
    }

    if (objectStore != null && objectStore.length() > 0)
    {
      parameter.put(SessionParameter.REPOSITORY_ID, objectStore);
      session = factory.createSession(parameter);
    }
    else
    {
      Repository repository = factory.getRepositories(parameter).get(0);
      if (repository == null)
      {
        LOG.log(Level.SEVERE, "Failed to get the repository!");
      }
      session = repository.createSession();
    }
    return session;
  }

  private String getObjectIdFromUri(String uri)
  {
    String[] uris = uri.split("@");
    return uris[0];
  }

  private Session createSession(UserBean user, String docUri) throws RepositoryAccessException
  {
    Session session = (Session) user.getObject("session");
    if (session == null) // session need be reused by same user because OAuth2 code will be expired
    {
      String[] uris = docUri.split("@");
      String store = (uris.length > 1 && uris[1] != null) ? uris[1] : objectStore;
      if (s2sMethod.equalsIgnoreCase(Constants.S2S_METHOD_OAUTH2))
      {
        String authCode = (String) user.getProperty(Constants.AUTH_CODE);
        String userId = OAuth2Util.getRefreshTokenUserId(customerId, user.getId());
        if (authCode != null)
        {
          session = createOAuth2Session(userId, authCode, oauth2Client, oauth2Secret, cmisAtomPub, store, docsEndpoint, oauth2Endpoint);
          LOG.log(Level.INFO, "Created session based on OAuth2 code when create session for user {0} for document {1}",
              new Object[] { user.getId(), docUri });
        }
        else
        {
          session = createOAuth2Session(userId, null, oauth2Client, oauth2Secret, cmisAtomPub, store, docsEndpoint, oauth2Endpoint);
          LOG.log(Level.INFO, "Created session based on OAuth2 refresh token when create session for user {0} for document {1}",
              new Object[] { user.getId(), docUri });
        }

      }
      else if (s2sMethod.equalsIgnoreCase(Constants.S2S_METHOD_J2CALIAS))
      {
        session = createJ2CAliasSession(user, j2cAlias, cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on j2c_alias when create session for user {0} for document {1}",
            new Object[] { user.getId(), docUri });
      }
      else if (s2sMethod.equalsIgnoreCase(Constants.S2S_METHOD_COOKIE))
      {
        session = createSSOCookieSession(user.getId(), cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on client cookies when create session for user {0} for document {1}", new Object[] {
            user.getId(), docUri });
      }
      else if (s2sMethod.equalsIgnoreCase(Constants.S2S_METHOD_S2STOKEN))
      {
        session = createS2STokenSession(user, s2sToken, s2sTokenKey, cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on s2s token when create session for user {0} for document {1}",
            new Object[] { user.getId(), docUri });
      }
      else if (s2sMethod.equalsIgnoreCase(Constants.S2S_METHOD_USER))
      {
        String[] pairs = J2CAliasHelper.getJ2ASUserName(user.getDisplayName());
        if (pairs[0] == null || pairs[1] == null)
        {
          pairs = J2CAliasHelper.getJ2ASUserName(user.getShortName());
        }
        if (pairs[0] == null || pairs[1] == null)
        {
          pairs = J2CAliasHelper.getJ2ASUserName(user.getId());
        }
        if (pairs[0] == null || pairs[1] == null)
        {
          LOG.log(Level.SEVERE, "Failed to get user from J2C alias.");
          throw new RepositoryAccessException("Failed to get user from J2C alias");
        }
        session = createUserSession(pairs[0], pairs[1], cmisAtomPub, store);
      }
      else
      {
        session = createCustomizedSession(user, cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on customized class when create session for user {0} for document {1}", new Object[] {
            user.getId(), docUri });
      }
      user.setObject("session", session);
      return session;
    }
    return session;
  }

  private Document getDocument(Session session, String objectId)
  {
    ObjectId id = session.createObjectId(objectId);
    Document document = (Document) session.getObject(id);
    return document;
  }

  @Override
  public void init(JSONObject config)
  {
    s2sMethod = (String) config.get(Constants.KEY_S2SMETHOD);
    cmisAuthClass = (String) config.get(Constants.KEY_CMIS_AUTH_CLASS);
    cmisAtomPub = (String) config.get(Constants.KEY_CMIS_ATOM_PUB);
    objectStore = (String) config.get(Constants.KEY_CMIS_OBJECT_STORE);
    docsEndpoint = (String) config.get(Constants.KEY_DOCS_CALLBACK_URL);
    repoHomeUrl = (String) config.get(Constants.KEY_REPOSITORY_HOME_URL);
    customizedAuthParas = (JSONObject) config.get(Constants.KEY_CMIS_AUTH_CLASS_PARAS);

    CacheType type = CacheType.NFS;
    try
    {
      type = CacheType.valueOf(((String) config.get(ConfigConstants.CACHE_TYPE)).toUpperCase());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Cache_type is not configured or the value is not accepted. The default value of nfs is used.");
    }

    cacheHome = ViewerConfig.getInstance().getDataRoot(type);

    sharedDataName = ViewerConfig.getInstance().getSharedDataName(type);

    if (s2sMethod == null)
    {
      s2sMethod = Constants.S2S_METHOD_CUSTOMIZED;
    }

    LOG.log(Level.INFO,
        "CMIS AtomPub is: {0}, CMIS ObjectStore is: {1}, CMIS auth class is: {2}, Docs CallBack Endpoint is: {3}, Repository home is: {4}",
        new Object[] { cmisAtomPub, objectStore, cmisAuthClass, docsEndpoint, repoHomeUrl });
    if (Constants.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      customerId = (String) config.get(Constants.KEY_OAUTH2_CUSTOMER_ID);
      if (customerId == null)
      {
        LOG.warning("customer_id is not defined!!!");
      }
      String[] pair = J2CAliasHelper.getJ2ASUserName(Constants.VIEWER_OAUTH_J2CALIAS_PREFIX + config.get("id"));
      if (StringUtils.isNotBlank(pair[0]) && StringUtils.isNotBlank(pair[1]))
      {
        oauth2Client = pair[0];
        oauth2Secret = pair[1];
      }
      else
      {
        LOG.warning("Oauth2 j2c alias is not defined!!!");
      }
      oauth2Endpoint = (String) config.get(Constants.KEY_OAUTH2_ENDPOINT);
      if (oauth2Endpoint == null || oauth2Endpoint.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing OAuth2 necessary parameters: oauth2_endpoint !!!");
      }
      if (oauth2Client == null || oauth2Client.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing OAuth2 necessary parameters: oauth2_client_id !!!");
      }
      if (oauth2Secret == null || oauth2Secret.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing OAuth2 necessary parameters: oauth2_client_secret !!!");
      }
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.OAuth2AuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for oauth2");
      }

      LOG.log(Level.INFO, "OAuth2 endpoint is: " + oauth2Endpoint);
    }
    else if (Constants.S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod))
    {// Sonata J2C_ALIAS only support WebSpere server
      j2cAlias = (String) config.get(Constants.S2S_METHOD_J2CALIAS);
      onBehalfKey = (String) config.get(Constants.KEY_ONBEHALFOF_HEADER);
      if (onBehalfKey == null)
      {
        onBehalfKey = Constants.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.J2CAliasAuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for j2c_alias");
      }
      if (j2cAlias == null || j2cAlias.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing j2c_alias necessary parameters: j2c_alias");
      }
    }
    else if (Constants.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod))
    {
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.viewer.external.repository.cmis.provider.ViewerSSOCookieAuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for cookies sso");
      }
    }
    else if (Constants.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      s2sToken = (String) config.get(Constants.S2S_METHOD_S2STOKEN);
      s2sTokenKey = (String) config.get(Constants.KEY_TOKEN_HEADER);
      onBehalfKey = (String) config.get(Constants.KEY_ONBEHALFOF_HEADER);
      LOG.log(Level.INFO, "onBehalfKey is: {0}, token key is: ", new Object[] { onBehalfKey, s2sTokenKey });
      if (s2sTokenKey == null || s2sTokenKey.length() == 0)
      {
        s2sTokenKey = Constants.S2STOKEN_DEFAULT_KEY;
      }
      if (onBehalfKey == null)
      {
        onBehalfKey = Constants.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.S2STokenAuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for cookies sso");
      }
      if (s2sToken == null || s2sToken.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing s2s_token necessary parameters: s2s_token");
      }
    }
    else if (Constants.S2S_METHOD_USER.equalsIgnoreCase(s2sMethod))
    {

    }
    else
    {
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        LOG.log(Level.WARNING, "No auth class defined for CMIS call method: " + s2sMethod);
      }
    }
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    IDocumentEntry docEntry = null;
    try
    {
      Session session = createSession(requester, docUri);
      Document document = getDocument(session, getObjectIdFromUri(docUri));
      docEntry = new CMISDocumentEntry(requester, Constants.REPO_KEY_EXTERNAL_CMIS, docUri, repoHomeUrl, document);
    }
    catch (CmisPermissionDeniedException e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      throw exp;
    }
    catch (Exception e) {
      RepositoryAccessException exp = new RepositoryAccessException(e);
      throw exp;
    }
    return docEntry;
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    InputStream is = null;
    Document document = null;

    try
    {
      CMISDocumentEntry cmisDocEntry = null;
      if (docEntry instanceof CMISDocumentEntry)
      {
        cmisDocEntry = ((CMISDocumentEntry) docEntry);
      }
      else
      {
        LOG.log(Level.SEVERE, "docEntry {0} is not instance of CMISDocumentEntry!!!", docEntry.getDocUri());
      }

      document = cmisDocEntry.getLastMajorDocument();
      if (document != null)
      {
        is = document.getContentStream().getStream();
      }
    }
    catch (CmisPermissionDeniedException e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      throw exp;
    }
    catch (Exception e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_DEFAULT);
      throw exp;
    }    
    return is;
  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    LOG.log(Level.INFO,
        (new StringBuilder()).append("getVersions[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    try
    {
      String[] docUris = docUri.split(Constants.REPO_ECM_URI_POSTFIX);
      Session session = createSession(requester, docUri);
      Document document = getDocument(session, docUris[0]);
      List<Document> versionEntries = document.getAllVersions();
      List<IDocumentEntry> documentEntries = new ArrayList<IDocumentEntry>();
      for (int i = 0; i < versionEntries.size(); i++)
      {
        Document documentEntry = versionEntries.get(i);
        String vDocUri = documentEntry.getId();
        if (docUris[1] != null)
        {
          vDocUri += Constants.REPO_ECM_URI_POSTFIX + docUris[1];
        }
        documentEntries.add(new CMISDocumentEntry(requester, Constants.REPO_KEY_EXTERNAL_CMIS, vDocUri, repoHomeUrl, documentEntry));
      }
      return documentEntries.toArray(new IDocumentEntry[] {});
    }
    catch (CmisPermissionDeniedException e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      throw exp;
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      throw rae;
    }
    finally
    {
      LOG.log(Level.INFO, "getVersions");
    }
  }

  @Override
  public boolean impersonationAllowed()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public void addACE(UserBean requester, String docUri, com.ibm.concord.viewer.spi.beans.ACE anACE)
      throws com.ibm.concord.viewer.spi.exception.RepositoryAccessException
  {
    // TODO Auto-generated method stub

  }

  @Override
  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, com.ibm.concord.viewer.spi.beans.ActionEnum actionEnum)
      throws com.ibm.concord.viewer.spi.exception.RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getFilesPath()
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public JSONObject getRepositoryConfig()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isCacheEncrypt()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
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
    throw new UnsupportedOperationException("CMIS repository doesn't support log event.");
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
