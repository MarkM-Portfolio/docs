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

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Calendar;
import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import java.io.InputStream;
import org.w3c.dom.NodeList;
import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.commons.enums.Action;
import org.apache.chemistry.opencmis.commons.exceptions.CmisObjectNotFoundException;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IReviewable;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.docs.viewer.ecm.members.ECMMembersModel;
import com.ibm.docs.viewer.ecm.members.ECMUserImpl;
import com.ibm.docs.viewer.ecm.util.DocumentXMLParser;
import com.ibm.docs.viewer.ecm.util.TeamspaceParser;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.viewer.platform.util.HttpClientCreator;
import org.apache.commons.httpclient.Cookie;
import com.ibm.docs.viewer.ecm.util.CookieHelper;
import org.apache.commons.httpclient.HttpStatus;

public class ECMDocumentEntry extends AbstractDocumentEntry implements IDocumentEntry, IReviewable
{
  public static final String PERMISSION_CMIS_ALL = "cmis:all";

  public static final String PERMISSION_CMIS_WRITE = "cmis:write";

  public static final String PERMISSION_CMIS_READ = "cmis:read";

  public static final String IBM_DOCS_ID = "cmis:ibmdocs";

  public static final String IBM_DOCS_STATE = "cmisra:IBMDocsState";

  private String repoType;

  private String docId;

  private String docUri;

  private String title;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String typeId;

  private long mediaSize = -1;

  private String[] modifier;

  private String[] creator;

  private String versionLabel;

  private Set<Permission> permissions;

  private final boolean isSharable = false;

  private boolean isEncrypt = false;

  private boolean isPublished;

  private String versionSeriesId;

  private String pwcId; // private work copy ID, this is the new ID after check in

  private String latestMajorVerId;

  private boolean isMajorVersion;

  private boolean isLatestVersion;

  private String contentStreamUri;

  private String[] lockOwner;

  private boolean isLocked = false;

  private boolean isWorkflow = false;

  private JSONObject globalApprovalProperties;

  private JSONArray approvers;

  private String communityServer;

  private String communityId;

  private String communityType;

  private String libraryGenerator;

  private String libraryId;

  private String checkoutUser;

  private UserBean user;

  public static final String IBM_DOCS_STATE_YES = "1";

  private static final String APPROVAL_PROCESS_BASIC = "BasicApproval";

  private XPath communityOwnerParser;

  private boolean isCurrentUseraMember = false;

  private JSONArray communityOwnerIds = new JSONArray();
  
  private String defaultRole;
  
  private static final String ROLE_EDITOR = "Editor";
  
  private static final String ROLE_CONTRIBUTOR = "Contributor";

  private static final String OWNER_XPATH_STRING = "/feed/entry/contributor/userid/text()[1]";

  private static final String MEMBER_XPATH_STRING = "/entry/contributor/userid/text()[1]";

  private static final Logger logger = Logger.getLogger(ECMDocumentEntry.class.toString());

  public ECMDocumentEntry(UserBean user, String repository, String repoId, Document document) throws RepositoryAccessException
  {
    init(user, repository, repoId, document);
  }

  public ECMDocumentEntry(String repository, String repoId, Document document) throws RepositoryAccessException
  {
    init(null, repository, repoId, document);
  }

  public ECMDocumentEntry(UserBean user, String repository, String repoId, Document document, JSONObject extension, String communityServer)
      throws RepositoryAccessException
  {
    this(user, repository, repoId, document);
    
    this.communityServer = communityServer;
    
    if (extension != null)
    {
      init2(extension);    
    }
    
  }

  public ECMDocumentEntry(String docUri, Calendar modified)
  {
    this.docUri = docUri;
    this.modified = modified;
    this.repoType = RepositoryServiceUtil.ECM_FILES_REPO_ID;
  }

  private void init(UserBean requester, String repository, String repoId, Document document)
  {
    StringBuffer msg = new StringBuffer();
    msg.append("Init document entry as below:");

    user = requester;
    repoType = repository;
    isMajorVersion = document.isMajorVersion();
    isLatestVersion = document.isLatestVersion();
    mediaSize = document.getContentStreamLength();
    docId = document.getId();
    docUri = docId + "@" + repoId;
    versionLabel = document.getVersionLabel();
    versionSeriesId = document.getVersionSeriesId();
    Object stateObj = document.getProperty(IBM_DOCS_STATE);
    typeId = (stateObj != null) ? stateObj.toString() : null;
    String name = document.getName();
    title = DocumentEntryHelper.trimExt(name);
    ext = DocumentEntryHelper.extractExt(name);
    description = document.getDescription();
    checkoutUser = document.getVersionSeriesCheckedOutBy();
    contentStreamUri = docUri;

    // If it's an ibmdocs document and the document's size is not 0, then it has been published.
    if ((typeId != null) && (typeId.equalsIgnoreCase(IBM_DOCS_ID)) && (mediaSize != 0))
    {
      isPublished = true;
    }
    else
    {
      isPublished = false;
    }
    modified = document.getLastModificationDate();
    modifier = new String[] { document.getLastModifiedBy(), document.getLastModifiedBy(), null };
    creator = new String[] { document.getCreatedBy(), document.getCreatedBy(), null, ECMMembersModel.DEFAULT_ORG_ID };
    if (user != null)
    {
      Set<Action> actions = document.getAllowableActions().getAllowableActions();
      permissions = convert2PermissionSet(actions);
    }
    else
    {
      permissions = Permission.VIEW_SET;
    }

    String checkoutId = document.getVersionSeriesCheckedOutId();
    if (pwcId != null)
    {
      pwcId = checkoutId + "@" + repoId;
    }

    // get lastestMajorId
    if (isMajorVersion && isLatestVersion)
    {
      latestMajorVerId = docUri;
    }
    else if (!isMajorVersion && Float.valueOf(versionLabel) < 1)
    {
      latestMajorVerId = null;
    }
    else
    {
      Document lastestDoc = document.getObjectOfLatestVersion(true);
      latestMajorVerId = lastestDoc.getId() + "@" + repoId;
    }

    mime = document.getContentStreamMimeType();
    // checked-out without any content updated
    if (!isMajorVersion && mime == null)
    {
      Document docObj = null;
      try
      {
        docObj = document.getObjectOfLatestVersion(true);
        msg.append("\n\t- Draft without mime, read from latest major version.");
      }
      catch (CmisObjectNotFoundException e)
      {
        docObj = document.getObjectOfLatestVersion(false);
        msg.append("\n\t- Draft without mime, read from latest version");
      }
      mime = docObj.getContentStreamMimeType();
      mediaSize = docObj.getContentStreamLength();
      contentStreamUri = docObj.getId() + "@" + repoId;
    }

    mime = mime.toLowerCase();

    msg.append("\n\t- docId:").append(docId);
    msg.append("\n\t- title:").append(title);
    msg.append("\n\t- mime:").append(mime);
    msg.append("\n\t- mediaSize:").append(mediaSize);
    msg.append("\n\t- versionLabel:").append(versionLabel);
    msg.append("\n\t- versionSeriesId:").append(versionSeriesId);
    msg.append("\n\t- pwcId:").append(pwcId);
    msg.append("\n\t- checkoutId:").append(checkoutId);
    msg.append("\n\t- isMajorVersion:").append(isMajorVersion);
    msg.append("\n\t- isLatestVersion:").append(isLatestVersion);
    msg.append("\n\t- contentStreamUri:").append(contentStreamUri);
    logger.log(Level.FINER, msg.toString());

  }

  private void init2(JSONObject json)
  {
    if (json != null)
    {
      try
      {
        // Object typeObj = json.get(IBM_DOCS_STATE);
        // typeId = typeObj != null ? typeObj.toString() : null;

        isLocked = ((Boolean) json.get(DocumentXMLParser.LOCKED)).booleanValue();
        JSONObject obj = (JSONObject) json.get(DocumentXMLParser.LOCK_OWNER);
        if (obj != null)
        {
          lockOwner = new String[3];
          lockOwner[0] = (String) obj.get(DocumentXMLParser.LOCK_OWNER_UID);
          lockOwner[1] = (String) obj.get(DocumentXMLParser.LOCK_OWNER_EMAIL);
          lockOwner[2] = (String) obj.get(DocumentXMLParser.LOCK_OWNER_NAME);
        }

        JSONObject approvalProps = (JSONObject) json.get(DocumentXMLParser.GLOBAL_APPROVAL_PROP);
        if (approvalProps != null)
        {
          String approvalProcess = (String) approvalProps.get(DocumentXMLParser.APPROVAL_PROCESS);
          if (APPROVAL_PROCESS_BASIC.equalsIgnoreCase(approvalProcess))
          {
            isWorkflow = true;
          }
        }

        globalApprovalProperties = (JSONObject) json.get(DocumentXMLParser.GLOBAL_APPROVAL_PROP);

        approvers = (JSONArray) json.get(DocumentXMLParser.APPROVERS);

        communityId = (String) json.get(IReviewable.COMMUNITY_ID);
        communityType = (String) json.get(IReviewable.COMMUNITY_TYPE);
        libraryId = (String) json.get(COMPONENT_ID);
        libraryGenerator = (String) json.get(IReviewable.COMPONENT_GENERATOR);

        communityOwnerIds = this.getCommunityInfo("&role=owner&", OWNER_XPATH_STRING);
        isCurrentUseraMember = !this.getCommunityInfo("&userid=" + user.getId() + "&", MEMBER_XPATH_STRING).isEmpty();
        defaultRole =  (String) json.get(TeamspaceParser.DEFAULT_ROLE);
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "Unable to read the ECMDocumentEntry information:", e);
      }
    }
  }

  public JSONArray getApprovers()
  {
    return approvers;
  }

  public JSONObject getGlobalApprovalProperties()
  {
    return globalApprovalProperties;
  }

  @Override
  public boolean hasViewPermission()
  {
    if (!isMajorVersion)
    {
      RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
          .getService(RepositoryServiceUtil.ECM_FILES_REPO_ID);
      ECMRepository adapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
      String[] validIds = null;
      try
      {
        validIds = adapter.verifyACL(new String[] { docId }, false);
      }
      catch (RepositoryAccessException e)
      {
        logger.log(Level.WARNING, "Falied to verify ecm ACL - {0}:{1} Requester:{2}. Ids:{3} ",
            new Object[] { e.getStatusCode(), e.getErrorMsg(), user.getId(), docId });
      }
      if (validIds == null)
      {
        return false;
      }
    }
    else if (!Permission.VIEW.hasPermission(permissions))
    {
      return false;
    }
    return true;
  }

  public String getMime()
  {
    return mime;
  }

  /**
   * if the document size is 0 and with ibm docs title means it has not published.
   */
  public boolean isPublished()
  {
    return isPublished;
  }

  private Set<Permission> convert2PermissionSet(Set<Action> actions)
  {
    if (isWorkflow)
    {
      if (checkoutUser != null)
      {
        if (checkoutUser.equalsIgnoreCase(user.getId()) || checkoutUser.equalsIgnoreCase(user.getEmail())
            || checkoutUser.equalsIgnoreCase(user.getDistinguishName()) || checkoutUser.equalsIgnoreCase(user.getDisplayName())
            || checkoutUser.equalsIgnoreCase(user.getShortName())
            || checkoutUser.equalsIgnoreCase(user.getProperty(ECMUserImpl.PROP_PRINCIPALID)))
        {
          logger.log(Level.FINER, "permission is: Permission.EDIT_SET");
          return Permission.EDIT_SET;
        }
      }

      if (communityOwnerIds.contains(user.getId()))
      {
        logger.log(Level.INFO, "Current user is a community owner");
        logger.log(Level.INFO, "permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }

      String uId = user.getId();
      String lockId = lockOwner[0];
      if (uId != null && uId.equalsIgnoreCase(lockId))
      {// draft lock owner
        logger.log(Level.FINER, "permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }

      if (communityId != null && communityId.length() > 0)
      {
        logger.log(Level.INFO, "We have community info, skip cmis check");
        return Permission.EMPTY_SET;
      }

      if (/* CMIS Owner */
      actions.contains(Action.CAN_DELETE_OBJECT) || actions.contains(Action.CAN_APPLY_ACL)
          || actions.contains(Action.CAN_DELETE_CONTENT_STREAM) ||
          /* CMIS editor */
          actions.contains(Action.CAN_CHECK_OUT) || actions.contains(Action.CAN_ADD_OBJECT_TO_FOLDER)
          || actions.contains(Action.CAN_REMOVE_OBJECT_FROM_FOLDER) || actions.contains(Action.CAN_MOVE_OBJECT)
          || actions.contains(Action.CAN_UPDATE_PROPERTIES) || actions.contains(Action.CAN_SET_CONTENT_STREAM) ||
          /* CMIS reader */
          actions.contains(Action.CAN_GET_CONTENT_STREAM) || actions.contains(Action.CAN_GET_PROPERTIES)
          || actions.contains(Action.CAN_GET_ACL) || actions.contains(Action.CAN_GET_OBJECT_PARENTS)
          || actions.contains(Action.CAN_GET_ALL_VERSIONS))
      {
        logger.log(Level.FINER, "permission is: Permission.VIEW_SET");
        return Permission.VIEW_SET;
      }
      logger.log(Level.FINER, "permission is: Permission.EMPTY_SET");
      return Permission.EMPTY_SET;
    }
    else
    {      
      if (actions.contains(Action.CAN_CHECK_IN) || actions.contains(Action.CAN_CANCEL_CHECK_OUT))
      {
        logger.log(Level.FINER, "permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }         
      
      if(isCurrentUseraMember)
      {
        logger.log(Level.INFO, "Current user is a community member");
        logger.log(Level.INFO, "Default role for the library is: " + defaultRole);
        if( defaultRole == ROLE_EDITOR )
        {          
          logger.log(Level.INFO, "permission is: Permission.EDIT_SET");
          return Permission.EDIT_SET;
        }
        else if(defaultRole == ROLE_CONTRIBUTOR && ( creator != null && user.getId().equalsIgnoreCase(creator[0])))
        {
          logger.log(Level.INFO, "permission is: Permission.EDIT_SET");
          return Permission.EDIT_SET;
        }        
      }      
      
      if (communityId != null && communityId.length() > 0)
      {
         logger.log(Level.INFO, "We have community info, skip cmis check");
         return Permission.EMPTY_SET;        
      }
      
      if (/* CMIS Owner */
      actions.contains(Action.CAN_DELETE_OBJECT) || actions.contains(Action.CAN_APPLY_ACL)
          || actions.contains(Action.CAN_DELETE_CONTENT_STREAM) ||
          /* CMIS editor */
          actions.contains(Action.CAN_CHECK_OUT) || actions.contains(Action.CAN_ADD_OBJECT_TO_FOLDER)
          || actions.contains(Action.CAN_REMOVE_OBJECT_FROM_FOLDER) || actions.contains(Action.CAN_MOVE_OBJECT)
          || actions.contains(Action.CAN_UPDATE_PROPERTIES) || actions.contains(Action.CAN_SET_CONTENT_STREAM))
      {
        if (actions.contains(Action.CAN_CHECK_OUT))
        {// not a draft
          logger.log(Level.FINER, "permission is: Permission.VIEW_SET");
          return Permission.VIEW_SET;
        }
        logger.log(Level.FINER, "permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }
      if (/* CMIS reader */
      actions.contains(Action.CAN_GET_CONTENT_STREAM) || actions.contains(Action.CAN_GET_PROPERTIES) || actions.contains(Action.CAN_GET_ACL)
          || actions.contains(Action.CAN_GET_OBJECT_PARENTS) || actions.contains(Action.CAN_GET_ALL_VERSIONS))
      {
        logger.log(Level.FINER, "permission is: Permission.VIEW_SET");
        return Permission.VIEW_SET;
      }
      logger.log(Level.FINER, "permission is: Permission.EMPTY_SET");
      return Permission.EMPTY_SET;
    }

  }

  @Override
  public String getDocUri()
  {
    return docUri;
  }

  public String getVersionSeriesId()
  {
    return versionSeriesId;
  }

  @Override
  public String getDocId()
  {
    return docUri;
  }

  @Override
  public String getMimeType()
  {
    return mime;
  }

  @Override
  public String getTitle()
  {
    return title;
  }

  @Override
  public String getRepository()
  {
    return repoType;
  }

  @Override
  public String getExtension()
  {
    return ext;
  }

  @Override
  public String getDescription()
  {
    return description;
  }

  @Override
  public String getVersion()
  {
    return versionLabel;
  }

  @Override
  public Calendar getModified()
  {
    return modified;
  }

  @Override
  public String[] getModifier()
  {
    return modifier;
  }

  @Override
  public long getMediaSize()
  {
    return mediaSize;
  }

  @Override
  public String[] getCreator()
  {
    return creator;
  }

  @Override
  public Set<Permission> getPermission()
  {
    return permissions;
  }

  @Override
  public boolean getIsSharable()
  {
    return isSharable;
  }

  @Override
  public void setMimeType(String mimeType)
  {
    mime = mimeType;
  }

  @Override
  public boolean isEncrypt()
  {
    return isEncrypt;
  }

  /**
   * if the document is locked
   */
  public boolean isLocked()
  {
    return isLocked;
  }

  public boolean isWorkflow()
  {
    return isWorkflow;
  }

  public boolean isLatestVersion()
  {
    return isLatestVersion;
  }

  @Override
  public boolean isIBMDocs()
  {
    return (typeId != null) && (typeId.equalsIgnoreCase(IBM_DOCS_STATE_YES));
  }

  public String getPrivateWorkCopyId()
  {
    return pwcId;
  }

  public boolean isDraft()
  {
    return !isMajorVersion;
  }

  public String getContentStreamUri()
  {
    return contentStreamUri;
  }

  public String getLatestMajorVersionId()
  {
    return latestMajorVerId;
  }

  @SuppressWarnings("serial")
  @Override
  public JSONObject getLockOwner()
  {
    if (lockOwner == null)
    {
      return new JSONObject();
    }
    else
    {
      return new JSONObject()
      {
        {
          put(IReviewable.LOCK_OWNER_UID, lockOwner[0]);
          put(IReviewable.LOCK_OWNER_EMAIL, lockOwner[1]);
          put(IReviewable.LOCK_OWNER_NAME, lockOwner[2]);
        }
      };
    }
  }

  @SuppressWarnings("serial")
  @Override
  public JSONObject getCommunityInfo()
  {
    return new JSONObject()
    {
      {
        put(IReviewable.COMMUNITY_ID, communityId);
        put(IReviewable.COMMUNITY_TYPE, communityType);
        put(IReviewable.COMMUNITY_URL, communityServer);
      }
    };
  }

  @SuppressWarnings("serial")
  @Override
  public JSONObject getLibraryInfo()
  {
    return new JSONObject()
    {
      {
        put(IReviewable.COMPONENT_GENERATOR, libraryGenerator);
        put(IReviewable.COMPONENT_ID, libraryId);
      }
    };
  }

  public String getFileDetailsURL()
  {
    URL url = null;
    if (communityId != null && communityId.length() > 0)
    {
      try
      {
        StringBuffer sb = null;
        if (communityServer != null)
        {
          sb = new StringBuffer(communityServer);
          if (communityServer.endsWith("/"))
            sb.append("service/html/widgetview?communityUuid=");
          else
            sb.append("/service/html/widgetview?communityUuid=");
        }
        else
        {
          sb = new StringBuffer("/communities/service/html/widgetview?communityUuid=");
        }
        sb.append(communityId);
        sb.append("&componentId=");
        sb.append(libraryId);
        sb.append("&hash=file={");
        String uuid = docId.replace("idd_", "");
        sb.append(uuid);
        sb.append("}");
        url = new URL(sb.toString());
      }
      catch (MalformedURLException e)
      {
        throw new IllegalStateException(
            "Illegal URL string when initialize CCM of getFileDetailsURL in " + ECMDocumentEntry.class.getSimpleName(), e);
      }
      return url.toString();
    }
    else
    {
      return null;
    }
  }

  private class NSResolver implements NamespaceContext
  {

    @Override
    public String getNamespaceURI(String prefix)
    {
      if (prefix.equals("snx"))
      {
        return "http://www.ibm.com/xmlns/prod/sn";
      }
      else
      {
        return XMLConstants.NULL_NS_URI;
      }
    }

    @Override
    public String getPrefix(String arg0)
    {
      return null;
    }

    @Override
    public Iterator getPrefixes(String arg0)
    {
      return null;
    }

  };

  public XPath getCommunityOwnerParser()
  {
    if (this.communityOwnerParser == null)
    {
      this.communityOwnerParser = XPathFactory.newInstance().newXPath();
      this.communityOwnerParser.setNamespaceContext(new NSResolver());
    }
    return this.communityOwnerParser;
  }

  private JSONArray getCommunityInfo(String queryString, String xpathString)
  {

    JSONArray memberJson = new JSONArray();
    if (communityId != null)
    {
      String url = communityServer + "/service/atom/community/members?communityUuid=" + communityId + queryString + "ps=1000";

      logger.log(Level.INFO, "Community Members URL: " + url);

      GetMethod getMethod = null;

      try
      {
        URL communityOwenerURL = new URL(url);
        JSONObject config = new JSONObject();
        HttpClientCreator httpClientCreator = new HttpClientCreator();
        httpClientCreator.config(config);
        HttpClient client = httpClientCreator.create();
        getMethod = new GetMethod(url);
        HttpState state = new HttpState();
        Cookie[] cookies = CookieHelper.getAllCookies(communityOwenerURL.getHost());
        state.addCookies(cookies);

        int nHttpStatus = client.executeMethod(null, getMethod, state);
        logger.log(Level.INFO, "Get community Members request state code: " + String.valueOf(nHttpStatus));
        if (HttpStatus.SC_OK == nHttpStatus)
        {
          InputStream is = getMethod.getResponseBodyAsStream();
          DocumentBuilder docBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
          final org.w3c.dom.Document ownersDocument = docBuilder.parse(is);
          NodeList nodes = (NodeList) getCommunityOwnerParser().evaluate(xpathString, ownersDocument, XPathConstants.NODESET);
          for (int i = 0; i < nodes.getLength(); i++)
          {
            String t = nodes.item(i).getNodeValue();
            memberJson.add(t);
          }
          logger.log(Level.INFO, "Community members query result: " + memberJson.toString());
          return memberJson;
        }
        else
        {
          logger.log(Level.INFO, "Can not get Community members!");
        }
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "Can not get Community members!", e);
      }
      finally
      {
        if (getMethod != null)
        {
          getMethod.releaseConnection();
        }
      }
    }
    return memberJson;
  }
}
