/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.external.cmis;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
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
import org.apache.chemistry.opencmis.commons.PropertyIds;
import org.apache.chemistry.opencmis.commons.SessionParameter;
import org.apache.chemistry.opencmis.commons.data.Ace;
import org.apache.chemistry.opencmis.commons.data.Acl;
import org.apache.chemistry.opencmis.commons.data.ContentStream;
import org.apache.chemistry.opencmis.commons.enums.BindingType;
import org.apache.chemistry.opencmis.commons.exceptions.CmisPermissionDeniedException;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.cmisproviders.J2CAliasAuthenticationProvider;
import com.ibm.docs.common.cmisproviders.OAuth2AuthenticationProvider;
import com.ibm.docs.common.cmisproviders.S2STokenAuthenticationProvider;
import com.ibm.docs.common.oauth.OAuth2Util;
import com.ibm.docs.common.util.J2CAliasHelper;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.dao.ICustomerCredentialDAO;
import com.ibm.docs.directory.external.util.ExternalConstant;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONObject;

public class ExternalCMISRepository implements IRepositoryAdapter
{
  private static final Logger LOG = Logger.getLogger(ExternalCMISRepository.class.getName());

  private final int UNKNOWN_STREAM_LENGTH = -1;

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

  private String OAuthListenerClazz;

  private JSONObject customizedAuthParas;
  
  private JSONObject config;
  
  private ICustomerCredentialDAO ccDAO;  

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
    parameter.put(S2STokenAuthenticationProvider.S2S_TOKEN_KEY, tokenKey);    
    parameter.put(SessionParameter.ATOMPUB_URL, atomPubUrl);
    parameter.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameter.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, cmisAuthClass);
    parameter.put(S2STokenAuthenticationProvider.ON_BEHALF_OF_KEY, onBehalfKey);
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
    parameter.put(OAuth2AuthenticationProvider.OAUTH_TOKEN_LISTENER_CLASS, OAuthListenerClazz);

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

  private Session createSession(UserBean user, String docUri)
  {
    Session session = (Session) user.getObject("session");
    if (session == null) // session need be reused by same user because OAuth2 code will be expired
    {
      String[] uris = docUri.split("@");
      String store = (uris.length > 1 && uris[1] != null) ? uris[1] : objectStore;
      if (s2sMethod.equalsIgnoreCase(ExternalConstant.S2S_METHOD_OAUTH2))
      {
        String authCode = (String) user.getProperty(ExternalConstant.AUTH_CODE);
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
      else if (s2sMethod.equalsIgnoreCase(ExternalConstant.S2S_METHOD_J2CALIAS))
      {
        session = createJ2CAliasSession(user, j2cAlias, cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on j2c_alias when create session for user {0} for document {1}",
            new Object[] { user.getId(), docUri });
      }
      else if (s2sMethod.equalsIgnoreCase(ExternalConstant.S2S_METHOD_COOKIE))
      {
        session = createSSOCookieSession(user.getId(), cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on client cookies when create session for user {0} for document {1}", new Object[] {
            user.getId(), docUri });
      }
      else if (s2sMethod.equalsIgnoreCase(ExternalConstant.S2S_METHOD_S2STOKEN))
      {
        session = createS2STokenSession(user, s2sToken, s2sTokenKey, cmisAtomPub, store);
        LOG.log(Level.INFO, "Created session based on s2s token when create session for user {0} for document {1}",
            new Object[] { user.getId(), docUri });
      }
      else if (s2sMethod.equalsIgnoreCase(ExternalConstant.S2S_METHOD_USER))
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

  public IDocumentEntry getDocument(String objectId)
  {
    throw new UnsupportedOperationException("CMIS repository doesn't support getDocument without UserBean.");
  }

  public InputStream getContentStream(String objectId)
  {
    throw new UnsupportedOperationException("CMIS repository doesn't support getContentStream without UserBean.");
  }

  @Override
  public void init(JSONObject config)
  {
    this.config = config;
    s2sMethod = (String) config.get(ExternalConstant.KEY_S2SMETHOD);
    cmisAuthClass = (String) config.get(ExternalConstant.KEY_CMIS_AUTH_CLASS);
    cmisAtomPub = (String) config.get(ExternalConstant.KEY_CMIS_ATOM_PUB);
    objectStore = (String) config.get(ExternalConstant.KEY_CMIS_OBJECT_STORE);
    docsEndpoint = (String) config.get(ExternalConstant.KEY_DOCS_CALLBACK_URL);
    repoHomeUrl = (String) config.get(ExternalConstant.KEY_REPOSITORY_HOME_URL);
    OAuthListenerClazz = (String) config.get(ExternalConstant.KEY_OAUTH_LISTNER_CLASS);
    customizedAuthParas = (JSONObject) config.get(ExternalConstant.KEY_CMIS_AUTH_CLASS_PARAS);
    if (OAuthListenerClazz == null)
    {
      OAuthListenerClazz = "com.ibm.concord.dao.db2.OAuthTokenDAOImpl";
    }
    if (s2sMethod == null)
    {
      s2sMethod = ExternalConstant.S2S_METHOD_CUSTOMIZED;
    }

    LOG.log(Level.INFO,
        "CMIS AtomPub is: {0}, CMIS ObjectStore is: {1}, CMIS auth class is: {2}, Docs CallBack Endpoint is: {3}, Repository home is: {4}",
        new Object[] { cmisAtomPub, objectStore, cmisAuthClass, docsEndpoint, repoHomeUrl });
    if (ExternalConstant.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      customerId = (String) config.get(ExternalConstant.KEY_OAUTH2_CUSTOMER_ID);
      if (customerId == null)
      {
        LOG.severe("customer_id is not defined!!!");
      }
      oauth2Client = getCustomerCredentialDAO().get(customerId, ExternalConstant.KEY_OAUTH2_CLIENT_ID);
      oauth2Secret = getCustomerCredentialDAO().get(customerId, ExternalConstant.KEY_OAUTH2_CLIENT_SECRET);

      oauth2Endpoint = (String) config.get(ExternalConstant.KEY_OAUTH2_ENDPOINT);
      if (oauth2Endpoint == null || oauth2Endpoint.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing OAuth2 necessary parameters: oauth2_endpoint !!!");
      }
      if (oauth2Client == null || oauth2Client.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing OAuth2 necessary parameters: oauth2_client_id !!!");
      }
      if (oauth2Secret == null || oauth2Secret.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing OAuth2 necessary parameters: oauth2_client_secret !!!");
      }
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.OAuth2AuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for oauth2");
      }

      LOG.log(Level.INFO, "OAuth2 endpoint is: {0}, OAuth listener is: {1}", new Object[] { oauth2Endpoint, OAuthListenerClazz });
    }
    else if (ExternalConstant.S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod))
    {// Sonata J2C_ALIAS only support WebSpere server
      j2cAlias = (String) config.get(ExternalConstant.S2S_METHOD_J2CALIAS);
      onBehalfKey = (String) config.get(ExternalConstant.KEY_ONBEHALFOF_HEADER);
      if (onBehalfKey == null)
      {
        onBehalfKey = ExternalConstant.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.J2CAliasAuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for j2c_alias");
      }
      if (j2cAlias == null || j2cAlias.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing j2c_alias necessary parameters: j2c_alias");
      }
    }
    else if (ExternalConstant.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod))
    {
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.SSOCookieAuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for cookies sso");
      }
    }
    else if (ExternalConstant.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      s2sToken = (String) config.get(ExternalConstant.S2S_METHOD_S2STOKEN);
      s2sTokenKey = (String) config.get(ExternalConstant.KEY_TOKEN_HEADER);
      onBehalfKey = (String) config.get(ExternalConstant.KEY_ONBEHALFOF_HEADER);
      LOG.log(Level.INFO, "onBehalfKey is: {0}, token key is: ", new Object[] { onBehalfKey, s2sTokenKey });
      if (s2sTokenKey == null || s2sTokenKey.length() ==0)
      {
        s2sTokenKey = ExternalConstant.S2STOKEN_DEFAULT_KEY;
      }
      if (onBehalfKey == null)
      {
        onBehalfKey = ExternalConstant.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        cmisAuthClass = "com.ibm.docs.common.cmisproviders.S2STokenAuthenticationProvider";
        LOG.log(Level.INFO, "Use default CMIS auth class for cookies sso");
      }
      if (s2sToken == null || s2sToken.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing s2s_token necessary parameters: s2s_token");
      }
    }
    else if (ExternalConstant.S2S_METHOD_USER.equalsIgnoreCase(s2sMethod))
    {

    }
    else
    {
      if (cmisAuthClass == null || cmisAuthClass.length() <= 0)
      {
        LOG.log(Level.SEVERE, "No auth class defined for CMIS call method: " + s2sMethod);
      }
    }
  }

  private synchronized ICustomerCredentialDAO getCustomerCredentialDAO()
  {
    if (ccDAO == null)
    {
      ccDAO = (ICustomerCredentialDAO) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID)
          .getService(ICustomerCredentialDAO.class);
    }

    return ccDAO;
  }
  
  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    IDocumentEntry docEntry = null;
    try {
      Session session = createSession(requester, docUri);
      Document document = getDocument(session, getObjectIdFromUri(docUri));
      docEntry = new CMISDocumentEntry(requester, RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS, docUri, repoHomeUrl, document);
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
    
    try {
      IDocumentEntry repoDocEntry = docEntry.getRepoDocEntry();
      CMISDocumentEntry cmisDocEntry = null;
      if (repoDocEntry != null && repoDocEntry instanceof CMISDocumentEntry)
      {
        cmisDocEntry = ((CMISDocumentEntry) repoDocEntry);
      }
      else if (docEntry instanceof CMISDocumentEntry)
      {
        cmisDocEntry = ((CMISDocumentEntry) docEntry);
      }
      else
      {
        LOG.log(Level.SEVERE, "docEntry {0} is not instance of CMISDocumentEntry!!!", docEntry.getDocUri());
      }
  
      document = (cmisDocEntry.getPWCDocument() != null && cmisDocEntry.getPWCDocument().getContentStreamLength() > 0) ? cmisDocEntry
          .getPWCDocument() : cmisDocEntry.getLastMajorDocument();
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
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException
  {
    return getContentStream(requester, docEntry);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, null);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, null, versionSummary, null, overwrite);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary, String docLabel)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, docLabel, null, false);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle(), media.getMimeType(), false);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle(), media.getMimeType(), overwrite);
  }

  private IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      String docLabel, String mime, boolean overwrite) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null || is == null)
    {
      throw new NullPointerException();
    }
    String docUri = docEntry.getDocUri();
    LOG.log(Level.INFO,
        (new StringBuilder()).append("setContentStream[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    try
    {
      Session session = createSession(requester, docEntry.getDocUri());
      Document document = null;
      IDocumentEntry repoDocEntry = docEntry.getRepoDocEntry();
      if (repoDocEntry != null && repoDocEntry instanceof CMISDocumentEntry)
      {
        document = ((CMISDocumentEntry) repoDocEntry).getPWCDocument() != null ? ((CMISDocumentEntry) repoDocEntry).getPWCDocument()
            : ((CMISDocumentEntry) repoDocEntry).getLastMajorDocument();
      }
      else if (docEntry instanceof CMISDocumentEntry)
      {
        document = ((CMISDocumentEntry) repoDocEntry).getPWCDocument() != null ? ((CMISDocumentEntry) repoDocEntry).getPWCDocument()
            : ((CMISDocumentEntry) repoDocEntry).getLastMajorDocument();
      }
      else
      {
        LOG.log(Level.SEVERE, "docEntry {0} is not instance of CMISDocumentEntry!!!", docEntry.getDocUri());
      }

      String name = (docLabel != null) ? docLabel : docEntry.getTitleWithExtension();
      if (mime == null)
      {
        mime = docEntry.getMimeType();
      }
      ContentStream contentStream = session.getObjectFactory().createContentStream(name, UNKNOWN_STREAM_LENGTH, mime, is);
      Map<String, String> parameters = new HashMap<String, String>();
      parameters.put(PropertyIds.CONTENT_STREAM_FILE_NAME, name);
      parameters.put(PropertyIds.CONTENT_STREAM_MIME_TYPE, mime);
      if (docLabel != null)
      {
        parameters.put(PropertyIds.NAME, docLabel);
      }
      if (overwrite)
      {
        document.setContentStream(contentStream, true, true);
        document.updateProperties(parameters);
        document.refresh();
        return new CMISDocumentEntry(requester, RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS, docUri, repoHomeUrl, document);
      }
      else
      {
        ObjectId newId = null;
        newId = document.checkIn(true, parameters, contentStream, versionSummary);
        document = (Document) session.getObject(newId);
        return new CMISDocumentEntry(requester, RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS, docUri, repoHomeUrl, document, false);
      }

    }
    catch (CmisPermissionDeniedException e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      throw exp;
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("setContentStream failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      LOG.log(Level.INFO, "setContentStream");
    }
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
    throw new UnsupportedOperationException("CMIS repository doesn't support createDocument.");
  }

  @Override
  public IDocumentEntry setIBMdocsType(UserBean requester, IDocumentEntry docEntry, boolean createVersion) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("CMIS repository doesn't support setIBMdocsType.");
  }

  @Override
  public void deleteDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("CMIS repository doesn't support deleteDocument.");
  }

  @Override
  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException
  {
    String docUri = docEntry != null ? docEntry.getDocUri() : null;
    if (requester == null || docUri == null || newLabel == null)
    {
      throw new NullPointerException();
    }
    LOG.entering(ExternalCMISRepository.class.getName(),
        (new StringBuilder()).append("renameDocument[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docEntry.getDocUri()).append("]").toString());

    try
    {
      Session session = createSession(requester, docEntry.getDocUri());
      InputStream is = null;
      Document document = null;

      IDocumentEntry repoDocEntry = docEntry.getRepoDocEntry();
      CMISDocumentEntry cmisDocEntry = null;
      if (repoDocEntry != null && repoDocEntry instanceof CMISDocumentEntry)
      {
        cmisDocEntry = ((CMISDocumentEntry) repoDocEntry);
      }
      else if (docEntry instanceof CMISDocumentEntry)
      {
        cmisDocEntry = ((CMISDocumentEntry) docEntry);
      }
      else
      {
        LOG.log(Level.SEVERE, "docEntry {0} is not instance of CMISDocumentEntry!!!", docEntry.getDocUri());
      }

      document = (cmisDocEntry.getPWCDocument() != null && cmisDocEntry.getPWCDocument().getContentStreamLength() > 0) ? cmisDocEntry
          .getPWCDocument() : cmisDocEntry.getLastMajorDocument();
      if (document != null)
      {
        is = document.getContentStream().getStream();
      }
      
      String mime = docEntry.getMimeType();
      Map<String, String> parameters = new HashMap<String, String>();
      parameters.put(PropertyIds.NAME, newLabel);
      parameters.put(PropertyIds.CONTENT_STREAM_FILE_NAME, newLabel);
      parameters.put(PropertyIds.CONTENT_STREAM_MIME_TYPE, mime);
      document.updateProperties(parameters);

      // mime can only be changed after reset contentStream, this is FileNet limitation
      if (is != null)
      {
        ContentStream contentStream = session.getObjectFactory().createContentStream(newLabel, UNKNOWN_STREAM_LENGTH, mime, is);
        document.setContentStream(contentStream, true);
        document.refresh();
        return new CMISDocumentEntry(requester, RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS, docUri, repoHomeUrl, document, false);
      }      
      return docEntry;
    }
    catch (CmisPermissionDeniedException e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      throw exp;
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("renameDocument failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      LOG.exiting(ExternalCMISRepository.class.getName(), "renameDocument");
    }
  }

  @Override
  public IDocumentEntry lockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // Does not support...
    return docEntry;
  }

  @Override
  public IDocumentEntry unlockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // Does not support...
    return docEntry;
  }

  @Override
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    throw new UnsupportedOperationException("CMIS repository doesn't support log event.");
  }

  @Override
  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();

    LOG.log(Level.INFO,
        (new StringBuilder()).append("getVersions[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    try
    {
      String[] docUris = docUri.split(RepositoryConstants.REPO_ECM_URI_POSTFIX);
      Session session = createSession(requester, docEntry.getDocUri());
      Document document = getDocument(session, docUris[0]);
      List<Document> versionEntries = document.getAllVersions();
      List<IDocumentEntry> documentEntries = new ArrayList<IDocumentEntry>();
      for (int i = 0; i < versionEntries.size(); i++)
      {
        Document documentEntry = versionEntries.get(i);
        String vDocUri = documentEntry.getId();
        if (docUris[1] != null)
        {
          vDocUri += RepositoryConstants.REPO_ECM_URI_POSTFIX + docUris[1];
        }
        documentEntries.add(new CMISDocumentEntry(requester, RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS, vDocUri, repoHomeUrl,
            documentEntry));
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
      rae.setDefaultErrDetail("getVersions failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      LOG.log(Level.INFO, "getVersions");
    }
  }

  @Override
  public void addACE(UserBean requester, IDocumentEntry docEntry, ACE anACE) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("External CMIS repository dosn't support addACE.");
  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    Vector<ACE> result = new Vector<ACE>();
    String[] folderUris = docEntry.getDocUri().split("@");
    try
    {
      Session session = createSession(requester, docEntry.getDocUri());
      ObjectId id = session.createObjectId(folderUris[0]);
      Acl acl = session.getAcl(id, true);
      if (acl != null)
      {
        List<Ace> aces = acl.getAces();
        for (Ace ace : aces)
        {
          String principalId = ace.getPrincipalId();
          if (principalId != null && !principalId.equalsIgnoreCase(CMISDocumentEntry.DEFAULT_ROLE_OWNER))
          {
            List<String> permissions = ace.getPermissions();
            Set<Permission> permissionSet;
            if (permissions.contains(CMISDocumentEntry.PERMISSION_CMIS_ALL))
            {
              permissionSet = Permission.PUBLISH_SET;
            }
            else if (permissions.contains(CMISDocumentEntry.PERMISSION_CMIS_WRITE))
            {
              permissionSet = Permission.EDIT_SET;
            }
            else if (permissions.contains(CMISDocumentEntry.PERMISSION_CMIS_READ))
            {
              permissionSet = Permission.VIEW_SET;
            }
            else
            {
              permissionSet = Permission.EMPTY_SET;
            }
            String type = RepositoryConstants.MEMBER_TYPE_USER;
            result.add(new ACE(principalId, permissionSet, type));
          }
        }
      }
    }
    catch (CmisPermissionDeniedException e) {
      RepositoryAccessException exp = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      throw exp;
    }
    catch (Throwable e)
    {
      LOG.severe("Exception happens while getAllACE: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getAllACE of document failed");
      rae.getData().put("docUri", folderUris);
      throw rae;
    }
    return result;
  }

  @Override
  public IDocumentEntry[] getOwnedDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IDocumentEntry[] getPermissiveDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Iterator<IDocumentEntry> getSeedList(String since, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public boolean impersonationAllowed()
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public String getFolderUri(UserBean caller, String communityUuid) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public JSONObject getConfig()
  {
    return config;
  }

  @Override
  public String getRepoType()
  {
    return RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS;
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
