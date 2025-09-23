/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.ecm;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.xpath.XPath;

import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.client.api.ObjectId;
import org.apache.chemistry.opencmis.client.api.Session;
import org.apache.chemistry.opencmis.commons.data.CmisExtensionElement;
import org.apache.chemistry.opencmis.commons.enums.ExtensionLevel;
import org.apache.chemistry.opencmis.commons.exceptions.CmisObjectNotFoundException;
import org.apache.chemistry.opencmis.commons.spi.CmisBinding;
import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.common.util.Time;
import com.ibm.docs.framework.Components;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.docs.repository.ecm.util.DocumentXMLParser;
import com.ibm.docs.repository.ecm.util.TeamspaceParser;
import com.ibm.json.java.JSONObject;

public class CMISDocumentComposite
{
  private static final Logger logger = Logger.getLogger(CMISDocumentComposite.class.getName());

  private static final String TEAMSPACE_URL = "TeamspaceURL";

  private static final String FNCS_DOCUMENT_URL = "FNCSDocumentURL";

  private static final String FNCS_DRAFT_URL = "FNCSDraftURL";

  private static final String FNCS_DRAFT_QUERY = "?includeRecommendation=true&includeTags=true&includeNotification=true&includeDownloadInfo=true&includeCurrentVersion=true&includeSecurityInheritance=true&acls=true&includeLocked=true&includeLockOwner=true&includeWorkingDraftInfo=true&includeApprovers=true";  
  
  private String docUri;

  private Session session;

  private boolean isAdmin;

  private URL serverUrl;
  
  private String communityServer = null;

  private Document document = null;

  private long contentStreamLength = -1;

  private Document lastMajorDocument = null;

  private long lastMajorContentStreamLength = -1;

  private Document latestVersionDocument = null; // latestVersionDocument may be a major OR minor published version.

  private long latestVersionContentStreamLength = -1;

  private long mediaSize = -1;

  private String mime = null;

  private JSONObject docXMLJson;

  private String ibmDocsState;

  private static ECMRepository repositoryAdapter;
  
  private XPath communityOwnerParser;
  
  static
  {
    IComponent repoComp = Components.getComponent(RepositoryComponent.COMPONENT_ID);
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
    repositoryAdapter = (ECMRepository) service.getRepository(RepositoryConstants.REPO_TYPE_ECM);
  }

  private static Document getDocument(Session session, String objectId) throws RepositoryAccessException
  {
    Document document = null;
    if(objectId.startsWith(RepositoryConstants.REPO_ECM_VERSIONSERIES_PREFIX))
    {
      try
      {
        document = repositoryAdapter.getDraftBySONATA(objectId);
      }
      catch (RepositoryAccessException e1)
      {
        logger.log(Level.WARNING, "Failed to get getDocument via Sonata :" + objectId);
        throw e1;
      }
    }
    else
    {
      ObjectId id = session.createObjectId(objectId);    
      try{
        document = (Document) session.getObject(id); 
      }    
      catch (CmisObjectNotFoundException e)
      {
        logger.log(Level.WARNING, "Failed to get object " + objectId + ". " + e.getMessage());
        throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      }
      catch(Throwable e)
      {
        logger.log(Level.WARNING, "Failed to get getDocument:" + objectId);
      }
    }

    return document;
  }

  public static CMISDocumentComposite getCMISDocumentComposite(String callerId, String docUri, Session session, boolean isAdmin,
      boolean includeXML, String communityServer) throws RepositoryAccessException
  {
    String[] docUris = docUri.split("@");
    Document document = getDocument(session, docUris[0]);
    return new CMISDocumentComposite(document, session, docUri, isAdmin, includeXML, communityServer);
  }

  protected CMISDocumentComposite(Document document, Session session, String docUri, boolean isAdmin, boolean includeXML, String communityServer) throws RepositoryAccessException
  {
    this.docUri = docUri;
    this.session = session;
    this.isAdmin = isAdmin;
    this.document = document;
    this.communityServer = communityServer;

    this.serverUrl = repositoryAdapter.getServerUrl();

    init(includeXML);
  }

  private void init(boolean includeXML) throws RepositoryAccessException
  {
    Time timer = new Time();
    contentStreamLength = document.getContentStreamLength();
    if (contentStreamLength > 0)
    {
      mime = document.getContentStreamMimeType();
      mediaSize = contentStreamLength;
    }
    else
    {
      latestVersionDocument = document.getObjectOfLatestVersion(false);
      if (latestVersionDocument != null)
      {
        latestVersionContentStreamLength = latestVersionDocument.getContentStreamLength();
      }
            
      String versionLabel = document.getVersionLabel();
      double version = 1.1; // assume it's checked out first time, 1.1 is the default version
      try
      {
        version = Double.parseDouble(versionLabel); 
      }
      catch(NumberFormatException e)
      {
        logger.log(Level.WARNING, "Error to parse the version integer:" + versionLabel);
      }      
      if(version >= 1.0)
      {
        try
        {
          lastMajorDocument = document.getObjectOfLatestVersion(true);
        }
        catch (CmisObjectNotFoundException e)
        {
          logger.log(Level.WARNING, "CmisObjectNotFoundException when getObjectOfLatestVersion :");
          throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
        }
        catch (Throwable e)
        {
          logger.log(Level.WARNING, "Unable to read the ECMDocumentEntry publish version :");
        }
        if (lastMajorDocument != null)
        {
          lastMajorContentStreamLength = lastMajorDocument.getContentStreamLength();
        }
      }

      if (latestVersionContentStreamLength > 0)
      {
        mime = latestVersionDocument.getContentStreamMimeType();
        mediaSize = latestVersionContentStreamLength;
      }
      else
      {
        logger
            .warning("Can not initialize the ECMDocumentComposite mime and mediaSize because either contentStreamLength or latestContentStreamLength ie not initialized!");
      }      
    }
    
    logger.log(Level.FINEST, "get CMIS document info takes: " + timer.ellapse());

    if (includeXML)
    {
      ibmDocsState = getIBMDocsState(docUri, session);
      docXMLJson = getDocumentJson(docUri, session, isAdmin);
      logger.log(Level.FINEST, "get FNCS DocumentJson takes: " + timer.ellapse());
    }
  }
  
  public void refresh() throws RepositoryAccessException
  {
    document.refresh();
    init(false);
  }

  public Document getDocument()
  {
    return document;
  }

  public Document getLastMajorDocument()
  {
    return lastMajorDocument;
  }

  public Document getLatestVersionDocument()
  {
    return latestVersionDocument;
  }

  public long getDocumentStreamLength()
  {
    return contentStreamLength;
  }

  public long getLastMajorDocumentStreamLength()
  {
    return lastMajorContentStreamLength;
  }

  public long getLatestVersionDocumentStreamLength()
  {
    return latestVersionContentStreamLength;
  }

  public long getMediaSize()
  {
    return mediaSize;
  }

  public String getMimeType()
  {
    return mime;
  }

  public JSONObject getDocXMLJson()
  {
    return docXMLJson;
  }

  public String getIBMDocsState()
  {
    return ibmDocsState;
  }

  private Properties getTeamspaceProperties(String url)
  {
    URL teamUrl = null;
    try
    {
      teamUrl = new URL(url);
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal URL string when perform getTeamspaceURL of class " + ECMRepository.class.getSimpleName(), e);
    }

    HttpClient client = repositoryAdapter.getHttpClient(isAdmin);

    GetMethod getMethod = new GetMethod(teamUrl.toString());
    HttpState state = new HttpState();
    Cookie[] cookies = CookieHelper.getAllCookies(teamUrl.getHost());
    state.addCookies(cookies);
    try
    {
      int nHttpStatus = client.executeMethod(null, getMethod, state);
      logger.log(Level.INFO, "When get TeamspaceURL document entry, the return code is: " + nHttpStatus);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        TeamspaceParser parser = new TeamspaceParser(getMethod.getResponseBodyAsStream());
        return parser.getProperties();
      }
      else
      {
        logger.log(Level.WARNING, "Error to get the TeamspaceURL document entry {0}, http return code {2}: ",
            new Object[] { teamUrl.toString(), nHttpStatus });
      }
    }
    catch (IOException e)
    {
      logger.log(Level.SEVERE, "Error to get the TeamspaceURL document entry {0}, exception: {1}", new Object[] { teamUrl.toString(), e });
      return null;
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

  private JSONObject getDocumentXMLAsJson(String url, boolean isAdmin)
  {
    // url = "http://bxv7v610.cn.ibm.com/docs/docEntryWithWorkFlow.xml";
    URL teamUrl = null;
    try
    {
      teamUrl = new URL(url);
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal URL string when perform getDocumentXMLAsJson of class "
          + ECMRepository.class.getSimpleName(), e);
    }

    HttpClient client = repositoryAdapter.getHttpClient(isAdmin);
    GetMethod getMethod = new GetMethod(teamUrl.toString());

    try
    {
      int nHttpStatus;
      if (!isAdmin)
      {
        HttpState state = new HttpState();
        Cookie[] cookies = CookieHelper.getAllCookies(teamUrl.getHost());
        state.addCookies(cookies);
        nHttpStatus = client.executeMethod(null, getMethod, state);
      }
      else
      {
        nHttpStatus = client.executeMethod(getMethod);
      }
       
      logger.log(Level.INFO, "When get ECMDocument xml, the return code is: " + nHttpStatus);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        DocumentXMLParser parser = new DocumentXMLParser(getMethod.getResponseBodyAsStream());
        return parser.getJson();
      }
      else
      {
        logger.log(Level.WARNING, "Error to get the DocumentXMLParser document entry {0}, http return code: {1}",
            new Object[] { teamUrl.toString(), nHttpStatus });
      }
    }
    catch (IOException e)
    {
      logger.log(Level.SEVERE, "Error to get the DocumentXMLParser document entry {0}, exception: {1}", new Object[] { teamUrl.toString(),
          e });
      return null;
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

  private String getExtensionProperty(String propertyName)
  {
    List<CmisExtensionElement> extensions = null;
    if (contentStreamLength > 0)
    {
      extensions = document.getExtensions(ExtensionLevel.PROPERTIES);
      if (extensions != null)
      {
        for (CmisExtensionElement ext : extensions)
        {
          String extName = ext.getName();
          if (propertyName.equalsIgnoreCase(extName))
          {
            logger.log(Level.INFO, "Got extension {0} from CCM draft {1} of {2}", new Object[] { propertyName, document.getVersionLabel(),
                document.getVersionSeriesId() });
            return ext.getValue();
          }
        }
      }
    }

    if (lastMajorDocument != null)
    {
      extensions = lastMajorDocument.getExtensions(ExtensionLevel.PROPERTIES);
      if (extensions != null)
      {
        for (CmisExtensionElement ext : extensions)
        {
          String extName = ext.getName();
          if (propertyName.equalsIgnoreCase(extName))
          {
            logger.log(Level.INFO, "Got extension {0} from CCM major version {1} of {2}",
                new Object[] { propertyName, lastMajorDocument.getVersionLabel(), lastMajorDocument.getVersionSeriesId() });
            return ext.getValue();
          }
        }
      }
    }
    else
    {
      logger.log(Level.WARNING, "No major version for CCM draft: " + document.getVersionSeriesId());
    }

    if (latestVersionDocument != null)
    {
      extensions = latestVersionDocument.getExtensions(ExtensionLevel.PROPERTIES);
      if (extensions != null)
      {
        for (CmisExtensionElement ext : extensions)
        {
          String extName = ext.getName();
          if (propertyName.equalsIgnoreCase(extName))
          {
            logger.log(Level.INFO, "Got extension {0} from CCM minor version {1} of {2}", new Object[] { propertyName,
                latestVersionDocument.getVersionLabel(), latestVersionDocument.getVersionSeriesId() });
            return ext.getValue();
          }
        }
      }
    }
    else
    {
      logger.log(Level.WARNING, "No minor version for CCM draft: " + document.getVersionSeriesId());
    }

    return null;
  }

  private String getIBMDocsState(String docUri, Session session)
  {
    String docsState = null;
    String[] docUris = docUri.split("@");
    CmisBinding binding = session.getBinding();
    org.apache.chemistry.opencmis.commons.data.Properties propertiesData = binding.getObjectService().getProperties(docUris[1], docUris[0],
        null, null);

    List<CmisExtensionElement> extElements = propertiesData.getExtensions();
    for (CmisExtensionElement ext : extElements)
    {
      logger.log(Level.FINEST, docUri + " docUri extensions: " + ext.getName() + "=" + ext.getValue().toString());
      String extName = ext.getName();
      if (ECMDocumentEntry.IBM_DOCS_STATE.equalsIgnoreCase(extName))
      {
        docsState = ext.getValue().toString();
        return docsState;
      }
    }
    return null;
  }

  private JSONObject getDocumentJson(String docUri, Session session, boolean isAdmin)
  {
    String teamUrl = getExtensionProperty(TEAMSPACE_URL);
    String fncsDraftUrl = getExtensionProperty(FNCS_DRAFT_URL);
    String fncsDocumentURL = getExtensionProperty(FNCS_DOCUMENT_URL);
    
    logger.log(Level.INFO, "teamUrl is: " +  teamUrl);
    logger.log(Level.INFO, "fncsDraftUrl is: " +  fncsDraftUrl);    
    logger.log(Level.INFO, "fncsDocumentURL is: " +  fncsDocumentURL);    
    
    JSONObject docJson = null;
    if (fncsDraftUrl != null && fncsDraftUrl.length() > 0)
    {
      fncsDraftUrl += FNCS_DRAFT_QUERY  + "&membershipTimestamp=" + System.currentTimeMillis();
      docJson = getDocumentXMLAsJson(fncsDraftUrl , isAdmin);
    }    

    if (docJson == null)
    {
      if (fncsDocumentURL != null && fncsDocumentURL.length() > 0)
      {
        fncsDocumentURL += FNCS_DRAFT_QUERY  + "&membershipTimestamp=" + System.currentTimeMillis();
        docJson = getDocumentXMLAsJson(fncsDocumentURL, isAdmin);
      }
    }
    else if (!docJson.containsKey(DocumentXMLParser.GLOBAL_APPROVAL_PROP))
    {
      JSONObject docJson2 = getDocumentXMLAsJson(fncsDocumentURL, isAdmin);
      if (docJson2.containsKey(DocumentXMLParser.GLOBAL_APPROVAL_PROP))
      {
        docJson.put(DocumentXMLParser.GLOBAL_APPROVAL_PROP, docJson2.get(DocumentXMLParser.GLOBAL_APPROVAL_PROP));
      }
    }

    if (teamUrl != null)
    {
      Properties properties = getTeamspaceProperties(teamUrl);
      if (properties != null)
      {
        if (docJson == null)
        {
          docJson = new JSONObject();
        }
        docJson.put(TeamspaceParser.COMMUNITY_ID, properties.getProperty(TeamspaceParser.COMMUNITY_ID));
        docJson.put(TeamspaceParser.COMMUNITY_TYPE, properties.getProperty(TeamspaceParser.COMMUNITY_TYPE));
        docJson.put(TeamspaceParser.COMPONENT_ID, properties.getProperty(TeamspaceParser.COMPONENT_ID));
        docJson.put(TeamspaceParser.COMPONENT_GENERATOR, properties.getProperty(TeamspaceParser.COMPONENT_GENERATOR));
        docJson.put(TeamspaceParser.DEFAULT_ROLE, properties.getProperty(TeamspaceParser.DEFAULT_ROLE));        
        
        logger.log(Level.INFO, "COMMUNITY_ID is: {0}, COMPONENT_ID is: {1}", new Object[] {properties.getProperty(TeamspaceParser.COMMUNITY_ID), properties.getProperty(TeamspaceParser.COMPONENT_ID)});
      }
      else
      {
        logger.log(Level.WARNING, "Did not get the document teamspace properties: " + getDocument().getId());
      }

      return docJson;
    }
    else
    {
      logger.log(Level.WARNING, "Teamspace URL is null!");
    }

    logger.log(Level.WARNING, "Did not get the document xml as json: " + getDocument().getId());
    return null;
  }

}
