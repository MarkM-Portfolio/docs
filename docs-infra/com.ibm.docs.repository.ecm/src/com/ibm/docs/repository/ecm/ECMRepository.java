/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.ecm;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
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

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;

import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.client.api.Folder;
import org.apache.chemistry.opencmis.client.api.ObjectId;
import org.apache.chemistry.opencmis.client.api.Session;
import org.apache.chemistry.opencmis.client.api.SessionFactory;
import org.apache.chemistry.opencmis.client.runtime.SessionFactoryImpl;
import org.apache.chemistry.opencmis.commons.PropertyIds;
import org.apache.chemistry.opencmis.commons.SessionParameter;
import org.apache.chemistry.opencmis.commons.data.Ace;
import org.apache.chemistry.opencmis.commons.data.Acl;
import org.apache.chemistry.opencmis.commons.data.ContentStream;
import org.apache.chemistry.opencmis.commons.data.PropertyData;
import org.apache.chemistry.opencmis.commons.data.PropertyInteger;
import org.apache.chemistry.opencmis.commons.enums.Action;
import org.apache.chemistry.opencmis.commons.enums.BindingType;
import org.apache.chemistry.opencmis.commons.enums.VersioningState;
import org.apache.chemistry.opencmis.commons.spi.BindingsObjectFactory;
import org.apache.chemistry.opencmis.commons.spi.CmisBinding;
import org.apache.chemistry.opencmis.commons.spi.Holder;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.IOUtils;
import org.xml.sax.SAXException;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.common.util.Time;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.ecm.util.CMISSSOSONATAAuthenticationProvider;
import com.ibm.docs.repository.ecm.util.VersionHistoryCMISParser;
import com.ibm.json.java.JSONObject;

public class ECMRepository implements IRepositoryAdapter
{
  private static final Logger LOGGER = Logger.getLogger(ECMRepository.class.getName());

  private URL serverUrl;

  private String ecmContextRoot;

  private String repoId;

  private static String navigatorServer;

  private static String communityServer;

  private static String fncmisServer;

  private static String cmisGetAllVersions;

  private static String fncsServer;

  private static String ecm_j2c_alias;

  private static String login_url;

  private static String objectStoreName;

  private HttpClient sonataClient;

  private HttpClient apacheClient;

  private final int UNKNOWN_STREAM_LENGTH = -1;

  private JSONObject config;

  public void init(JSONObject config)
  {
    this.config = config;
    if (config.get("server_url") == null)
    {
      LOGGER.log(Level.SEVERE, "<server_url> setting is missing from repository adapter config.");
    }

    if (config.get("id") == null)
    {
      LOGGER.log(Level.SEVERE, "<id> setting is missing from repository adapter config.");
    }

    repoId = (String) config.get("id");
    if (repoId == null || repoId.isEmpty())
    {
      repoId = RepositoryConstants.REPO_TYPE_ECM;
    }

    try
    {
      navigatorServer = (String) config.get("navigator_server_url");
      communityServer = (String) config.get("community_server_url");
      fncmisServer = (String) config.get("server_url");
      fncsServer = (String) config.get("fncs_server_url");
      ecm_j2c_alias = (String) config.get("j2c_alias");
      if (fncmisServer == null || fncmisServer.isEmpty())
      {
        fncmisServer = "http://localhost/fncmis";
      }
      if (fncmisServer.endsWith("/"))
      {
        ecmContextRoot = fncmisServer + "resources/Service";
        cmisGetAllVersions = fncmisServer + "resources/{0}/Allversions/{1}";
      }
      else
      {
        ecmContextRoot = fncmisServer + "/resources/Service";
        cmisGetAllVersions = fncmisServer + "/resources/{0}/Allversions/{1}";
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

      if (fncsServer == null || fncsServer.isEmpty())
      {
        fncsServer = "http://localhost/dm";
      }
      if (fncsServer.endsWith("/"))
      {
        login_url = fncsServer + "atom/people/feed?self=true";
      }
      else
      {
        login_url = fncsServer + "/atom/people/feed?self=true";
      }
      // TODO: objectStoreName should come from LCC.xml in the future
      objectStoreName = (String) config.get("object_store");
      if (objectStoreName == null || objectStoreName.isEmpty())
      {
        objectStoreName = "ICObjectStore"; // default object store name
      }

      serverUrl = new URL(ecmContextRoot);
    }
    catch (MalformedURLException e)
    {
      LOGGER.log(Level.SEVERE, "Illegal URL string when perform initialization of class ");
    }

    if (serverUrl == null)
    {
      try
      {
        serverUrl = new URL("http://localhost/fncmis/resources/Service");
      }
      catch (MalformedURLException e1)
      {
      }
    }
  }

  private String getCallerId(UserBean requester)
  {
    if (requester != null)
    {
      return requester.getId();
    }

    return ecm_j2c_alias;
  }

  private Session createSession(UserBean user, String repositoryId)
  {
    Time timer = new Time();
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameters = new HashMap<String, String>();
    parameters.put(SessionParameter.USER, user.getId());
    parameters.put(SessionParameter.ATOMPUB_URL, serverUrl.toString());
    parameters.put(SessionParameter.REPOSITORY_ID, repositoryId);
    parameters.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameters.put(SessionParameter.COOKIES, "true");
    parameters.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, "com.ibm.docs.repository.ecm.util.CMISSSOAuthenticationProvider");
    Session session = factory.createSession(parameters);
    LOGGER.log(Level.FINEST, "createSession takes: ", timer.ellapse());
    return session;
  }

  private Session createSessionBySONATA(String username, String repositoryId)
  {
    SessionFactory factory = SessionFactoryImpl.newInstance();
    Map<String, String> parameters = new HashMap<String, String>();
    parameters.put(SessionParameter.USER, username);
    parameters.put(SessionParameter.ATOMPUB_URL, serverUrl.toString());
    parameters.put(SessionParameter.REPOSITORY_ID, repositoryId);
    parameters.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
    parameters.put(SessionParameter.COOKIES, "true");
    parameters.put(SessionParameter.AUTHENTICATION_PROVIDER_CLASS, "com.ibm.docs.repository.ecm.util.CMISSSOSONATAAuthenticationProvider");
    Session session = factory.createSession(parameters);
    return session;
  }

  private Document getDocument(Session session, String objectId)
  {
    ObjectId id = session.createObjectId(objectId);
    Document document = (Document) session.getObject(id);
    return document;
  }

  /**
   * Get the draft Document from the version series ID by Sonata
   *
   * @param versionSeriesId
   * @return Document
   * @throws RepositoryAccessException
   */
  public Document getDraftBySONATA(String versionSeriesId) throws RepositoryAccessException
  {
    if (ecm_j2c_alias == null || ecm_j2c_alias.isEmpty())
    {
      LOGGER.log(Level.WARNING, "SONATA j2calias is null!!!");
      return null;
    }

    HttpClient httpClient = getHttpClientBySONATA();
    GetMethod getMethod = new GetMethod(MessageFormat.format(cmisGetAllVersions, objectStoreName, versionSeriesId));
    try
    {
      int nHttpStatus = httpClient.executeMethod(getMethod);
      LOGGER.log(Level.FINE, "Run getDraftBySONATA, the return code is: " + nHttpStatus);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        VersionHistoryCMISParser parser = new VersionHistoryCMISParser();
        String id = parser.getDraftId(getMethod.getResponseBodyAsStream());
        Session session = createSessionBySONATA(ecm_j2c_alias, objectStoreName);
        Document document = (Document) session.getObject(id);
        return document;
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

  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    Time timer = new Time();
    if (requester == null || docUri == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("getDocument[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    IDocumentEntry docEntry = null;
    try
    {
      String[] docUris = docUri.split("@");
      Session session = createSession(requester, docUris[1]);
      CMISDocumentComposite docComposite = CMISDocumentComposite.getCMISDocumentComposite(getCallerId(requester), docUri, session, false,
          true, communityServer);
      docEntry = new ECMDocumentEntry(requester, repoId, docUri, docComposite, communityServer, navigatorServer, fncsServer);
    }
    catch (RepositoryAccessException e)
    {
      throw e;
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getDocument failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }

    LOGGER.log(Level.FINEST, docUri + " getDocument takes: ", timer.ellapse());
    LOGGER.exiting(ECMRepository.class.getName(), "getDocument");
    return docEntry;
  }

  /**
   * docUri is the version series id, used by upload convert
   */
  public IDocumentEntry getDocument(String docUri) throws RepositoryAccessException
  {
    if (docUri == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("getDocument[uid: ").append(ecm_j2c_alias).append(", orgId: ").append(", docUri: ").append(docUri)
            .append("]").toString());

    IDocumentEntry docEntry = null;
    try
    {
      String versionSeriesId = RepositoryConstants.REPO_ECM_VERSIONSERIES_PREFIX + docUri;
      Document document = getDraftBySONATA(versionSeriesId);
      Session session = createSessionBySONATA(ecm_j2c_alias, objectStoreName);
      String lastDocUri = document.getId() + RepositoryConstants.REPO_ECM_URI_POSTFIX + objectStoreName;
      String versionSeriesUri = versionSeriesId + RepositoryConstants.REPO_ECM_URI_POSTFIX + objectStoreName;
      CMISDocumentComposite docComposite = new CMISDocumentComposite(document, session, lastDocUri, true, true, communityServer);
      docEntry = new ECMDocumentEntry(repoId, versionSeriesUri, docComposite);
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("get content stream of document failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      LOGGER.exiting(ECMRepository.class.getName(), "getDocument");
    }

    return docEntry;
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return getContentStream(requester, docEntry, true);
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException
  {
    String[] docUris = docEntry.getDocUri().split("@");
    Session session = null;
    if (requester == null)
    {
      session = createSessionBySONATA(ecm_j2c_alias, docUris[1]);
    }
    else
    {
      session = createSession(requester, docUris[1]);
    }
    return getContentStream(requester, docEntry, session, logDownload);
  }

  private InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, Session session, boolean logDownload)
      throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();
    if (docUri == null)
    {
      throw new NullPointerException();
    }

    if (requester != null)
    {
      LOGGER.entering(ECMRepository.class.getName(), (new StringBuilder()).append("getContentStream[uid: ").append(requester.getId())
          .append(", orgId: ").append(requester.getOrgId()).append(", docUri: ").append(docUri).append("]").toString());
    }
    else
    {
      LOGGER.entering(ECMRepository.class.getName(),
          (new StringBuilder()).append("getContentStream[uid: ").append(", orgId: ").append(", docUri: ").append(docUri).append("]")
              .toString());
    }

    InputStream is = null;
    try
    {
      CMISDocumentComposite docComposite = (docEntry instanceof ECMDocumentEntry) ? ((ECMDocumentEntry) docEntry).getCMISDocumentComposite() : ((ECMDocumentEntry) docEntry.getRepoDocEntry()).getCMISDocumentComposite();
      Time timer = new Time();
      if (docComposite.getDocumentStreamLength() > 0)
      {
        is = docComposite.getDocument().getContentStream().getStream();
      }
      else if (docComposite.getLatestVersionDocumentStreamLength() > 0)
      {
        is = docComposite.getLatestVersionDocument().getContentStream().getStream();
      }
      else if (docComposite.getLastMajorDocumentStreamLength() > 0)
      {
        is = docComposite.getLastMajorDocument().getContentStream().getStream();
      }
      else
      {
        is = null;
      }
      LOGGER.log(Level.FINEST, docUri + " getContentStream() takes: " + timer.ellapse());
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("get content stream of document failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      LOGGER.exiting(ECMRepository.class.getName(), "getContentStream");
    }
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
    return setContentStream(requester, docEntry, is, null, versionSummary, null, overwrite);
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary, String docLabel)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, docLabel, null, false);
  }

  private IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      String docLabel, String mime, boolean overwrite) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null || is == null)
    {
      throw new NullPointerException();
    }
    String docUri = docEntry.getDocUri();
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("setContentStream[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    try
    {
      String[] docUris = docUri.split("@");
      Session session = createSession(requester, docUris[1]);

      CMISDocumentComposite docComposite = (docEntry instanceof ECMDocumentEntry) ? ((ECMDocumentEntry) docEntry).getCMISDocumentComposite() : ((ECMDocumentEntry) docEntry.getRepoDocEntry()).getCMISDocumentComposite();
      Document document = docComposite.getDocument();
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
        document.setContentStream(contentStream, true);
        document.updateProperties(parameters);
        docComposite.refresh();
        return new ECMDocumentEntry(requester, repoId, docUri, docComposite, communityServer, navigatorServer, fncsServer);
      }
      else
      {
        ObjectId newId = null;
        newId = document.checkIn(true, parameters, contentStream, versionSummary);
        session.clear();
        document = (Document) session.getObject(newId);
        docComposite.refresh();
        ECMDocumentEntry entry = new ECMDocumentEntry(requester, repoId, docUri, docComposite, communityServer, navigatorServer, fncsServer);
        return entry;
      }
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
      LOGGER.exiting(ECMRepository.class.getName(), "setContentStream");
    }
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle(), media.getMimeType(), false);
  }

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle(), media.getMimeType(), overwrite);
  }

  public IDocumentEntry setIBMdocsType(UserBean requester, IDocumentEntry docEntry, boolean createVersion) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null)
    {
      throw new NullPointerException();
    }

    String docUri = docEntry.getDocUri();
    String label = docEntry.getTitle();
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("setIBMdocsType[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    IDocumentEntry newDocEntry = docEntry;
    try
    {
      String[] docUris = docUri.split("@");
      Session session = createSession(requester, docUris[1]);
      CMISDocumentComposite docComposite = (docEntry instanceof ECMDocumentEntry) ? ((ECMDocumentEntry) docEntry).getCMISDocumentComposite() : ((ECMDocumentEntry) docEntry.getRepoDocEntry()).getCMISDocumentComposite();
      CmisBinding binding = session.getBinding();
      BindingsObjectFactory bof = binding.getObjectFactory();
      Holder<String> objectId = new Holder<String>(docUris[0]);

      PropertyInteger docsState = bof.createPropertyIntegerData(ECMDocumentEntry.CIB_IBM_DOCS_STATE, BigInteger.valueOf(1));
      List<PropertyData<?>> propertiesList = new ArrayList<PropertyData<?>>();
      propertiesList.add(docsState);
      org.apache.chemistry.opencmis.commons.data.Properties properties = bof.createPropertiesData(propertiesList);
      binding.getObjectService().updateProperties(docUris[1], objectId, null, properties, null);
      docComposite.refresh();

      newDocEntry = new ECMDocumentEntry(requester, repoId, docUri, docComposite, communityServer, navigatorServer, fncsServer);
    }
    catch (Throwable e)
    {
      LOGGER.log(Level.WARNING, "Failed to setIBMdocsType: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("setIBMdocsType failed");
      rae.getData().put("folderUri", docUri);
      rae.getData().put("docLabel", label);
      throw rae;
    }
    finally
    {
      LOGGER.exiting(ECMRepository.class.getName(), "setIBMdocsType");
    }

    return newDocEntry;
  }

  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException
  {
    String docUri = docEntry != null ? docEntry.getDocUri() : null;
    if (requester == null || docUri == null || newLabel == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("renameDocument[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docEntry.getDocUri()).append("]").toString());

    try
    {
      String[] docUris = docUri.split("@");
      String mime = docEntry.getMimeType();
      Session session = createSession(requester, docUris[1]);
      CMISDocumentComposite docComposite = (docEntry instanceof ECMDocumentEntry) ? ((ECMDocumentEntry) docEntry).getCMISDocumentComposite() : ((ECMDocumentEntry) docEntry.getRepoDocEntry()).getCMISDocumentComposite();
      Map<String, String> parameters = new HashMap<String, String>();
      parameters.put(PropertyIds.NAME, newLabel);
      parameters.put(PropertyIds.CONTENT_STREAM_FILE_NAME, newLabel);
      parameters.put(PropertyIds.CONTENT_STREAM_MIME_TYPE, mime);
      docComposite.getDocument().updateProperties(parameters);

      // mime can only be changed after reset contentStream, this is FileNet limitation
      InputStream inputStream = null;
      if (docComposite.getDocumentStreamLength() > 0)
      {
        inputStream = docComposite.getDocument().getContentStream().getStream();
      }
      else if (docComposite.getLatestVersionDocumentStreamLength() > 0)
      {
        inputStream = docComposite.getLatestVersionDocument().getContentStream().getStream();
      }
      if (inputStream != null)
      {
        ContentStream contentStream = session.getObjectFactory().createContentStream(newLabel, UNKNOWN_STREAM_LENGTH, mime, inputStream);
        docComposite.getDocument().setContentStream(contentStream, true);
      }
      else
      {
        LOGGER.warning("The contentStream is null when rename document to " + newLabel);
      }

      docComposite.refresh();
      IDocumentEntry newDocEntry = new ECMDocumentEntry(requester, repoId, docUri, docComposite, communityServer, navigatorServer,
          fncsServer);
      return newDocEntry;
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
      LOGGER.exiting(ECMRepository.class.getName(), "renameDocument");
    }
  }

  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    if (requester == null || docEntry == null)
    {
      throw new NullPointerException();
    }

    String docUri = docEntry.getDocUri();

    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("getVersions[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    try
    {
      String[] docUris = docUri.split("@");
      Session session = createSession(requester, docUris[1]);
      Document document = getDocument(session, docUris[0]);
      List<Document> versionEntries = document.getAllVersions();
      List<IDocumentEntry> documentEntries = new ArrayList<IDocumentEntry>();
      for (int i = 0; i < versionEntries.size(); i++)
      {
        Document documentEntry = versionEntries.get(i);
        String vDocUri = documentEntry.getId() + "@" + docUris[1];
        CMISDocumentComposite vDocComposite = (docEntry instanceof ECMDocumentEntry) ? ((ECMDocumentEntry) docEntry).getCMISDocumentComposite() : ((ECMDocumentEntry) docEntry.getRepoDocEntry()).getCMISDocumentComposite();
        documentEntries.add(new ECMDocumentEntry(requester, repoId, vDocUri, vDocComposite, communityServer, navigatorServer, fncsServer));
      }
      return documentEntries.toArray(new IDocumentEntry[] {});
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
      LOGGER.exiting(ECMRepository.class.getName(), "getVersions");
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
    if (requester == null || folderUri == null || docLabel == null || is == null)
    {
      throw new NullPointerException();
    }
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("createDocument[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docLabel: ").append(docLabel).append("]").toString());
    try
    {
      // folderUri: folder@repository
      String[] folderUris = folderUri.split("@");
      Session session = createSession(requester, folderUris[1]);
      ObjectId id = session.createObjectId(folderUris[0]);
      Folder folder = (Folder) session.getObject(id);

      if (folder == null)
      {
        LOGGER.log(Level.WARNING, "Folder: " + folderUris + " does not exist!");
        return null;
      }

      Set<Action> actions = folder.getAllowableActions().getAllowableActions();
      if (!actions.contains(Action.CAN_CREATE_DOCUMENT))
      {
        LOGGER.log(Level.WARNING, "User: " + requester.getId() + "have no permission to create document in folder: " + folderUri);
        return null;
      }

      String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(docLabel);

      byte[] content = IOUtils.toByteArray(is);
      ByteArrayInputStream stream = new ByteArrayInputStream(content);
      ContentStream contentStream = session.getObjectFactory()
          .createContentStream(docLabel, Long.valueOf(content.length), mimeType, stream);
      Map<String, String> parameters = new HashMap<String, String>();
      parameters.put(PropertyIds.NAME, docLabel);
      parameters.put(PropertyIds.OBJECT_TYPE_ID, ECMDocumentEntry.CMIS_DOCUMENT_ID);
      Document document = folder.createDocument(parameters, contentStream, VersioningState.CHECKEDOUT);
      Map<String, String> newparameters = new HashMap<String, String>();
      newparameters.put(ECMDocumentEntry.IBM_DOCS_STATE, "1");
      document = (Document) document.updateProperties(newparameters);
      String docUri = document.getId() + "@" + folderUris[1];
      CMISDocumentComposite docComposite = CMISDocumentComposite.getCMISDocumentComposite(getCallerId(requester), docUri, session, false,
          true, communityServer);
      return new ECMDocumentEntry(requester, repoId, docUri, docComposite, communityServer, navigatorServer, fncsServer);
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("create document failed");
      rae.getData().put("folderUri", folderUri);
      rae.getData().put("docLabel", docLabel);
      throw rae;
    }
    finally
    {
      LOGGER.exiting(ECMRepository.class.getName(), "createDocument");
    }
  }

  public void deleteDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    LOGGER.entering(ECMRepository.class.getName(),
        (new StringBuilder()).append("deleteDocument[uid: ").append(requester.getId()).append(", orgId: ").append(requester.getOrgId())
            .append(", docUri: ").append(docUri).append("]").toString());

    try
    {
      String[] docUris = docUri.split("@");
      Session session = createSession(requester, docUris[1]);
      Document document = getDocument(session, docUris[0]);
      document.delete(true);
    }
    catch (Throwable e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("delete document failed");
      rae.getData().put("docUri", docUri);
      throw rae;
    }

    LOGGER.exiting(ECMRepository.class.getName(), "deleteDocument");
  }

  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  public void addACE(UserBean requester, IDocumentEntry docEntry, ACE anACE) throws RepositoryAccessException
  {
    // Used by shared from Docs, but will not realize share in HCL Docs side, so no need this API.
    throw new UnsupportedOperationException("CCM/ICN integration don't realize share feature from HCL Docs side,no need this API.");
  }

  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    Vector<ACE> result = new Vector<ACE>();
    String[] folderUris = docEntry.getDocUri().split("@");
    try
    {
      Session session = createSession(requester, folderUris[1]);
      ObjectId id = session.createObjectId(folderUris[0]);
      Acl acl = session.getAcl(id, true);
      if (acl != null)
      {
        String alias = CMISSSOSONATAAuthenticationProvider.getJ2ASUserName(ecm_j2c_alias);
        List<Ace> aces = acl.getAces();
        for (Ace ace : aces)
        {
          String principalId = ace.getPrincipalId();
          if (principalId != null && !principalId.equalsIgnoreCase(alias))
          {
            List<String> permissions = ace.getPermissions();
            Set<Permission> permissionSet;
            if (permissions.contains(ECMDocumentEntry.PERMISSION_CMIS_ALL))
            {
              permissionSet = Permission.PUBLISH_SET;
            }
            else if (permissions.contains(ECMDocumentEntry.PERMISSION_CMIS_WRITE))
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
            // TODO: CMIS will provide more information to identify a single user or a community
            String type = RepositoryConstants.MEMBER_TYPE_USER;
            result.add(new ACE(principalId, permissionSet, type));
          }
        }
      }
    }
    catch (ConfigurationException e)
    {
      LOGGER.severe("Exception happens while getAllACE: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getAllACE of document failed");
      rae.getData().put("docUri", folderUris);
      throw rae;
    }
    catch (IOException e)
    {
      LOGGER.severe("Exception happens while getAllACE: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getAllACE of document failed");
      rae.getData().put("docUri", folderUris);
      throw rae;
    }
    catch (Throwable e)
    {
      LOGGER.severe("Exception happens while getAllACE: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getAllACE of document failed");
      rae.getData().put("docUri", folderUris);
      throw rae;
    }
    return result;
  }

  public boolean impersonationAllowed()
  {
    return false;
  }

  public IDocumentEntry lockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // ECM doesn't support this now.
    return docEntry;
  }

  public IDocumentEntry unlockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // ECM doesn't support this now.
    return docEntry;
  }

  public HashMap<String, String> getBidiPreferences(UserBean requester) throws RepositoryAccessException
  {
    // ECM doesn't support this now.
    return new HashMap<String, String>();
  }

  public Iterator<IDocumentEntry> getSeedList(String since, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    // ECM doesn't support this now.
    return new Iterator<IDocumentEntry>()
    {
      public boolean hasNext()
      {
        return false;
      }

      public IDocumentEntry next()
      {
        return null;
      }

      public void remove()
      {
        throw new UnsupportedOperationException();
      }
    };
  }

  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    // ECM doesn't support this now.
    throw new UnsupportedOperationException("ECM repository desn't support log event.");
  }

  public String getFolderUri(UserBean caller, String communityUuid) throws RepositoryAccessException
  {
    // For ECM, folder URI should be supplied by parameter "community" in document creation request.
    throw new UnsupportedOperationException("ECM repository desn't support get folder URI.");
  }

  public IDocumentEntry[] getOwnedDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    // ECM doesn't support this now. This API only used by mobile in /api/reposvr/${repoId}/library/mine/feed,
    // so need realize for mobile in future.
    throw new UnsupportedOperationException("ECM repository desn't support getOwnedDocuments API.");
  }

  public IDocumentEntry[] getPermissiveDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    // ECM doesn't support this now. This API only used by mobile in /reposvr/([^/]+)/collection/([^/]+)/feed,
    // so need realize for mobile in future.
    throw new UnsupportedOperationException("ECM repository desn't support getPermissiveDocuments API.");
  }

  public URL getServerUrl()
  {
    return serverUrl;
  }

  public HttpClient getHttpClient(boolean isAdmin)
  {
    if (isAdmin)
    {
      return getHttpClientBySONATA();
    }
    else
    {
      if (apacheClient == null)
      {
        JSONObject config = new JSONObject();
        HttpClientCreator httpClientCreator = new HttpClientCreator();
        httpClientCreator.config(config);
        apacheClient = httpClientCreator.create();
      }
      return apacheClient;
    }
  }

  public HttpClient getHttpClientBySONATA()
  {
    if (ecm_j2c_alias == null)
    {
      LOGGER.log(Level.SEVERE, "Failed to get http client because the filenetAdmin is not defined!");
    }
    if (sonataClient == null)
    {
      sonataClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(ecm_j2c_alias);
      ((ServerToServerHttpClient) sonataClient).set_authHeaderChecking(false);
    }
    return sonataClient;
  }

  public Map<String, List<String>> getSONATAHeaders()
  {
    Map<String, List<String>> sonataCookieHeader = new HashMap<String, List<String>>();
    HttpClient httpClient = getHttpClientBySONATA();
    GetMethod getMethod = new GetMethod(login_url.toString());
    try
    {
      int nHttpStatus = httpClient.executeMethod(getMethod);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        Header[] cookie = getMethod.getRequestHeaders("Cookie");
        ArrayList<String> list = new ArrayList<String>();
        for (int i = 0; i < cookie.length; i++)
        {
          list.add(cookie[i].getValue());
        }
        sonataCookieHeader.put("Cookie", list);
      }
      else
      {
        LOGGER.log(Level.SEVERE, "Failed to get http header by SONATA, return code: ", nHttpStatus);
      }
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

    return sonataCookieHeader;
  }

  public JSONObject getConfig()
  {
    return config;
  }

  @Override
  public String getRepoType()
  {
    return RepositoryConstants.REPO_TYPE_ECM;
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
