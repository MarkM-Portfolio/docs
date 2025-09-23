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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.HierarchicalConfiguration;
import org.apache.commons.configuration.XMLConfiguration;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.json.java.JSONObject;
import com.ibm.lconn.files.spi.remote.Document;
import com.ibm.lconn.files.spi.remote.DocumentService;
import com.ibm.lconn.files.spi.remote.RemoteServiceException;
import com.ibm.lconn.files.spi.remote.ResourceUnavailableException;
import com.ibm.lconn.files.spi.remote.UnauthorizedAccessException;
import com.ibm.websphere.cache.DistributedMap;
import com.ibm.websphere.management.AdminService;
import com.ibm.websphere.management.AdminServiceFactory;

public class LCFilesEJBRepository implements IRepositoryAdapter
{

  private static final Logger LOGGER = Logger.getLogger(LCFilesEJBRepository.class.toString());

  private static final String IBMDOCSTYPEID1 = "00000000-00000-0000-0001-00000000000000";

  private static final String IBMDOCSTYPEID2 = "00000000-0000-0000-0001-000000000000";

  private String serverURL = null;

  private String filePath;

  private String repoId;

  private String LCFilesClusterName;

  private DistributedMap cachedMap = Platform.getDocEntryCacheMap();

  private HashMap<String, DocumentService> tenantDocSrvMap = new HashMap<String, DocumentService>();

  private String cacheHome;

  private String sharedDataName;
  
  private JSONObject repoConfig;

  public DocumentService getDocumentService(String orgId)
  {
    LOGGER.entering(LCFilesEJBRepository.class.getName(), "getDocumentService", orgId);
    DocumentService docSrv = null;
    synchronized (tenantDocSrvMap)
    {
      docSrv = tenantDocSrvMap.get(orgId);
    }

    if (docSrv != null)
    {
      LOGGER.exiting(LCFilesEJBRepository.class.getName(), "getDocumentService", docSrv);
      return docSrv;
    }

    Properties env = new Properties();
    if (serverURL != null)
    {
      env.put(Context.PROVIDER_URL, serverURL);
    }

    FilesClient client = new FilesClient(env, orgId, LCFilesClusterName);
    LOGGER.log(Level.INFO, "Getting document service from " + LCFilesClusterName + " for tenant: " + orgId);
    docSrv = client.getDocumentService();

    if (docSrv != null)
    {
      synchronized (tenantDocSrvMap)
      {
        tenantDocSrvMap.put(orgId, docSrv);
      }
    }

    LOGGER.exiting(LCFilesEJBRepository.class.getName(), "getDocumentService", docSrv);
    return docSrv;
  }

  public void init(JSONObject config)
  {
    repoConfig = config;
    repoId = (String) config.get("id");
    StringBuffer msg = new StringBuffer();

    // In GAD cluster env, we don't need specify the server_url
    // Get server URL
    String server = (String) config.get("server_url");
    if (server != null)
    {
      URL url = null;
      try
      {
        url = new URL(server);
      }
      catch (MalformedURLException e)
      {
        LOGGER.log(Level.SEVERE, "The format of ejb server URL is not valid.");
      }

      if (server != null && url != null)
      {
        serverURL = "corbaloc:iiop:" + url.getHost();
        int port = url.getPort();
        if (port != -1)
        {
          serverURL += ":" + port;
        }
      }
    }
    // Get upload path
    filePath = (String) config.get("files_path");

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

    // Get the cluster name of LC Files
    LCFilesClusterName = getLCFilesClusterName();
    if (LCFilesClusterName == null)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_FILES_CLUSTER);
      LOGGER.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_FILES_CLUSTER, msg.toString()));
    }
    LOGGER.log(Level.INFO, "Files cluster name: " + LCFilesClusterName);
  }

  public boolean impersonationAllowed()
  {
    return false;
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    return getDocument(requester, docUri);
  }

  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    String id = docUri;
    int index = docUri.lastIndexOf(IDocumentEntry.DOC_URI_SEP);
    if (index != -1)
    {
      id = id.substring(index + 1);
    }

    String mimeType;
    String version;
    String title;
    String ext;
    Set<Permission> permission;
    String creator[];
    Document document;
    String relativePath;
    boolean isEncrypt;
    long mediaSize = -1;

    StringBuffer msg = new StringBuffer();

    try
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_INFO_GET_EJB_DOCUMENT);
      msg.append(" The doc id is ");
      msg.append(docUri);

      LOGGER.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_GET_EJB_DOCUMENT, msg.toString()));
      document = this.getDocument(requester.getOrgId(), docUri);
    }
    catch (UnauthorizedAccessException e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_INFO_NO_VIEW_PERMISSION);
      msg.append(" No permission to view ");
      msg.append(". Doc id is ");
      msg.append(docUri);
      msg.append(". User is ");
      msg.append(requester);
      LOGGER.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_NO_VIEW_PERMISSION, msg.toString()));
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION, e);
    }
    catch (ResourceUnavailableException e)
    {
      LOGGER.logp(Level.SEVERE, LCFilesEJBRepository.class.getName(), "getDocument",
          "Resource is not available when getting the document with id " + docUri, e);
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
    }
    catch (Exception e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_GET_DOC_ENTRY);
      msg.append(" Exception when getting document ");
      msg.append(docUri);
      LOGGER.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_GET_DOC_ENTRY, msg.toString()));
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
    }

    if (document != null)
    {
      mimeType = document.getMimeType();
      version = String.valueOf(document.getVersionNumber());
      title = document.getTitle();
      ext = document.getFileExtension();
      permission = converPermission(document.getPermissions());
      creator = new String[4];
      creator[0] = document.getOwner().getExternalId();
      creator[1] = document.getOwner().getName();
      creator[2] = document.getOwner().getEmail();
      creator[3] = document.getOwner().getId().toString();
      relativePath = document.getRelativePath();
      isEncrypt = document.isEncrypted();
      mediaSize = document.getFileSize();

      if (ext.startsWith("."))
      {
        ext = ext.substring(1);
      }

      LOGGER.log(Level.FINEST, "Getting EJB document: docuri: " + docUri + " title: " + title + "size: " + mediaSize);
      Calendar c = Calendar.getInstance();
      c.setTimeInMillis(document.getDateModified().getTime());

      UUID ObjectTypeId = document.getObjectTypeId();
      boolean isIBMDocs = false;
      if (ObjectTypeId != null)
      {
        if (ObjectTypeId.toString().equals(IBMDOCSTYPEID1) || ObjectTypeId.toString().equals(IBMDOCSTYPEID2))
        {
          isIBMDocs = true;
        }
      }
      DocumentEntry docEntry = new DocumentEntry(repoId, id, mimeType, version, title, ext, permission, c, creator, relativePath,
          isEncrypt, mediaSize, isIBMDocs, null);
      // put the docEntry to data cache
      cachedMap.put(id, docEntry);

      return docEntry;
    }
    else
    {
      LOGGER.log(Level.WARNING, "Getting document failure");
    }

    return null;
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesEJBRepository.class.getName(), "getContentStream", docEntry.getDocId());
    StringBuffer msg = new StringBuffer();
    InputStream ins = null;
    String docUri = docEntry.getDocUri();
    String id = docUri;
    int index = docUri.lastIndexOf(IDocumentEntry.DOC_URI_SEP);
    if (index != -1)
    {
      id = id.substring(index + 1);
    }
    try
    {
      DocumentEntry entry = (DocumentEntry) cachedMap.get(id);
      String relativePath;
      if (entry != null)
      {
        relativePath = entry.getRelativePath();
      }
      else
      {
        relativePath = null;
      }
      // cachedMap.remove(id);
      if (relativePath == null)
      {
        Document document = null;
        LOGGER.log(Level.INFO, "The relative path cannot be found in Cache, Get Document from EJB for user(ID:" + requester.getId()
            + ") and DocUri(" + docUri + ") again");
        try
        {
          document = this.getDocument(requester.getOrgId(), docUri);
          if (document != null)
          {
            relativePath = document.getRelativePath();
          }
        }
        catch (RemoteServiceException e)
        {
          msg = new StringBuffer();
          msg.append(ServiceCode.S_SEVERE_GET_EJB_DOCUMENT_ERROR);
          msg.append(" The doc id is ");
          msg.append(docUri);
          LOGGER.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_GET_EJB_DOCUMENT_ERROR, msg.toString()));
          throw new RepositoryAccessException(e);
        }
      }

      LOGGER.log(Level.FINER, "relativePath= " + relativePath + ". " + docEntry.getDocId());
      LOGGER.log(Level.FINER, "filePath= " + filePath + ". " + docEntry.getDocId());

      StringBuffer filesDataRoot = new StringBuffer(filePath);
      if (filePath.indexOf(filePath.length() - 1) != File.separatorChar && relativePath.indexOf(0) != File.separatorChar)
      {
        filesDataRoot.append(File.separatorChar);
      }
      filesDataRoot.append(relativePath);

      LOGGER.log(Level.FINER, "The EJB file path is: " + filesDataRoot);

      File ejbFile = new File(filesDataRoot.toString());
      if (!ejbFile.exists())
      {
        LOGGER.log(Level.WARNING, "Can't find the file folder on EJB server! " + ejbFile.getAbsolutePath());
        throw new FileNotFoundException();
      }
      ins = new FileInputStream(ejbFile);
      LOGGER.log(Level.FINEST, "Path of document " + docUri + ": " + filesDataRoot.toString());
    }
    catch (FileNotFoundException e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_SEVERE_GET_DOCUMENT_FILE_ERROR);
      msg.append(" The doc id is ");
      msg.append(docUri);
      LOGGER.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.SEVERE_GET_DOCUMENT_FILE_ERROR, msg.toString()));
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC, e);
    }

    LOGGER.exiting(LCFilesEJBRepository.class.getName(), "getContentStream", docEntry.getDocId());
    return ins;
  }

  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    return null;
  }

  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {

  }

  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return null;
  }

  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    return null;
  }

  private Document getDocument(String orgId, String docUri) throws RemoteServiceException
  {
    LOGGER.entering(LCFilesEJBRepository.class.getName(), "getDocument", new Object[] { orgId, docUri });

    DocumentService docSrv = this.getDocumentService(orgId);
    if (docSrv == null)
      return null;

    String docId = docUri;
    int idx = docUri.lastIndexOf('@');
    if (idx != -1)
    {
      docId = docUri.substring(idx + 1);
    }
    UUID uuid = UUID.fromString(docId);
    Document res = docSrv.getDocument(uuid);

    LOGGER.entering(LCFilesEJBRepository.class.getName(), "getDocument", res.getId());
    return res;
  }

  private static Set<Permission> converPermission(Set<com.ibm.lconn.files.spi.remote.Permission> permission)
  {
    if (permission.contains(com.ibm.lconn.files.spi.remote.Permission.Edit))
    {
      return Permission.EDIT_SET;
    }
    else if (permission.contains(com.ibm.lconn.files.spi.remote.Permission.View))
    {
      return Permission.VIEW_SET;
    }
    else
    {
      return Permission.EMPTY_SET;
    }
  }

  /**
   * Get the name of the cluster on which the LC Files hosts
   * 
   * @return
   */
  private static String getLCFilesClusterName()
  {
    String retVal;
    final String configFileName = "LotusConnections-config.xml";
    StringBuffer msg = new StringBuffer();

    // Get LotusConnections-config.xml
    File lcConfigFile;
    AdminService wasAdminService = AdminServiceFactory.getAdminService();
    if (System.getProperty("was.install.root") != null)
    {
      String rootPath = System.getProperty("user.install.root");
      String cellName = wasAdminService.getCellName();
      String lcConfigFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
          .append("cells").append(File.separator).append(cellName).append(File.separator).append("LotusConnections-config")
          .append(File.separator).append(configFileName).toString();
      lcConfigFile = new File(lcConfigFilePath);
    }
    else
    {
      String lcConfigFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
          .append("LotusConnections-config").append(File.separator).append(configFileName).toString();
      lcConfigFile = new File(lcConfigFilePath);
    }

    LOGGER.info("LC config files is " + lcConfigFile.getAbsolutePath());

    if (!lcConfigFile.exists())
    {
      msg.append(ServiceCode.S_ERROR_LOTUS_CONNECTIONS_CONFIGURATION);
      LOGGER.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_LOTUS_CONNECTIONS_CONFIGURATION, msg.toString()));
      return null;
    }

    try
    {
      XMLConfiguration xmlConfig = new XMLConfiguration(lcConfigFile.getAbsolutePath());
      HierarchicalConfiguration.Node root = xmlConfig.getRoot();

      Iterator<?> serviceRefListIter = root.getChildren("sloc:serviceReference").iterator();
      HierarchicalConfiguration currCfg = new HierarchicalConfiguration();

      while (serviceRefListIter.hasNext())
      {
        HierarchicalConfiguration.Node node = (HierarchicalConfiguration.Node) serviceRefListIter.next();
        currCfg = new HierarchicalConfiguration();
        currCfg.setRoot(node);
        String servName = currCfg.getString("[@serviceName]");
        if (servName.equalsIgnoreCase("files"))
        {
          // Get Files clusterName
          retVal = currCfg.getString("[@clusterName]");
          return retVal;
        }
      }
    }
    catch (ConfigurationException e)
    {
      return null;
    }
    return null;
  }

  public String getFilesPath()
  {
    return this.filePath;
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
  public JSONObject getRepositoryConfig()
  {
    return repoConfig;
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
    throw new UnsupportedOperationException("EJB repository doesn't support log event.");
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
