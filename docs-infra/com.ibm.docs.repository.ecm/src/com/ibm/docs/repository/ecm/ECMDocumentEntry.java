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

import java.io.InputStream;
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

import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.commons.enums.Action;
import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.w3c.dom.NodeList;

import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.common.util.Time;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.ecm.util.DocumentXMLParser;
import com.ibm.docs.repository.ecm.util.TeamspaceParser;
import com.ibm.docs.repository.ecm.util.URLGenerater;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ECMDocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private static final String ROLE_CONTRIBUTOR = "Contributor";

  private static final String ROLE_EDITOR = "Editor";

  private static final String OWNER_XPATH_STRING = "/feed/entry/contributor/userid/text()[1]";
  
  private static final String MEMBER_XPATH_STRING = "/entry/contributor/userid/text()[1]";

  private static final Logger logger = Logger.getLogger(ECMDocumentEntry.class.getName());

  private static final String LIBRARY_TYPE = "ecmFiles";

  static final String IBM_DOCS_STATE_YES = "1";

  static final String IBM_DOCS_STATE = "IBMDocsState"; //"ClbIBMDocsState", "cmisra:ClbIBMDocsState", "IBMDocsState";
  
  static final String CIB_IBM_DOCS_STATE = "ClbIBMDocsState";

  static final String CMIS_DOCUMENT_ID = "cmis:document";

  public static final String PERMISSION_CMIS_ALL = "cmis:all";

  public static final String PERMISSION_CMIS_WRITE = "cmis:write";

  public static final String PERMISSION_CMIS_READ = "cmis:read";

  private static final String APPROVAL_PROCESS_BASIC = "BasicApproval";

  private final boolean isSharable = false;

  private String repoId;

  private String docId;

  private String docUri;

  private String title;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String[] modifier;

  private String[] creator;

  private String[] lockOwner;

  private String versionLabel;

  private Set<Permission> permissions;

  private long mediaSize = -1;

  private String libraryId;

  private String typeId;

  private boolean isPublished;

  private boolean isEncrypt = false;

  private boolean isLocked = false;

  private boolean isExternal = false;

  private String communityId;

  private String communityType;
  
  private JSONArray communityOwnerIds = new JSONArray();
  
  private boolean isCurrentUseraMember = false;
  
  private String defaultRole;

  private String libraryGenerator;

  private String pwcId; // private work copy ID, this is the new ID after check in. it should be same as docId.

  private String versionSeriesId; // the ECM document's version series ID, unical for a document
  
  private String versionSeriesUri;

  private String navigatorServer;

  private String communityServer;

  private String fncsServer;

  private JSONObject docXMLJson;

  private UserBean user;

  private boolean isWorkflow;

  private String checkoutUser;
  
  private CMISDocumentComposite docComposite;
  
  private XPath communityOwnerParser;

  protected ECMDocumentEntry(String repoId)
  {
    this.repoId = repoId;
  }

  protected ECMDocumentEntry(UserBean cuser, String repoId, String docUri, CMISDocumentComposite docComposite, String commServer,
      String navServer, String fnServer)
  {
    Time timer = new Time(); 
    navigatorServer = navServer;
    communityServer = commServer;
    fncsServer = fnServer;
    this.docComposite = docComposite;    
    user = cuser;
    
    initDocXML();
    init(repoId, docUri);

    Set<Action> actions = docComposite.getDocument().getAllowableActions().getAllowableActions();
    // The URL may contains an obsolete CMIS draft ID, check if it's aligned with the PWC ID
    if (!docId.equalsIgnoreCase(pwcId))
    {
      permissions = Permission.VIEW_SET;
      logger.log(Level.INFO, "permission is: Permission.VIEW_SET");
    }
    else
    {
      permissions = convert2PermissionSet(actions);
    }
    logger.log(Level.FINEST, "ECMDocumentEntry takes: ", timer.ellapse());
  }

  protected ECMDocumentEntry(String repoId, String docUri, CMISDocumentComposite docComposite)
  {
    this.docComposite = docComposite;
    initDocXML();
    init(repoId, docUri);
    permissions = Permission.EDIT_SET;
  }
  
  private void initDocXML()
  {
    docXMLJson = docComposite.getDocXMLJson();
    if (docXMLJson != null)
    {
      try
      {

        if (docXMLJson.containsKey(DocumentXMLParser.LOCKED) && docXMLJson.containsKey(DocumentXMLParser.LOCK_OWNER))
        {
          isLocked = ((Boolean) docXMLJson.get(DocumentXMLParser.LOCKED)).booleanValue();
          JSONObject obj = (JSONObject) docXMLJson.get(DocumentXMLParser.LOCK_OWNER);
          if (obj != null)
          {
            lockOwner = new String[3];
            lockOwner[0] = (String) obj.get(DocumentXMLParser.CCM_USER_UID);
            lockOwner[1] = (String) obj.get(DocumentXMLParser.CCM_USER_EMAIL);
            lockOwner[2] = (String) obj.get(DocumentXMLParser.CCM_USER_NAME);
            logger.log(Level.INFO, "lockOwner is: " + lockOwner[0]);
          }
        }
        
        JSONObject objAuthor = (JSONObject) docXMLJson.get(DocumentXMLParser.AUTHOR);
        if (objAuthor != null)
        {
          creator = new String[4];
          creator[0] = (String) objAuthor.get(DocumentXMLParser.CCM_USER_UID);
          creator[1] = (String) objAuthor.get(DocumentXMLParser.CCM_USER_EMAIL);
          creator[2] = (String) objAuthor.get(DocumentXMLParser.CCM_USER_NAME);
          creator[3] = IMemberBase.DEFAULT_ORG_ID;
          logger.log(Level.INFO, "creator is: " + creator[0]);
        }
        
        JSONObject objModifier = (JSONObject) docXMLJson.get(DocumentXMLParser.MODIFIER);
        if (objModifier != null)
        {
          modifier = new String[3];
          modifier[0] = (String) objModifier.get(DocumentXMLParser.CCM_USER_UID);
          modifier[1] = (String) objModifier.get(DocumentXMLParser.CCM_USER_EMAIL);
          modifier[2] = (String) objModifier.get(DocumentXMLParser.CCM_USER_NAME); 
          logger.log(Level.INFO, "modifier is: " + modifier[0]);
        }        

        JSONObject approvalProps = (JSONObject) docXMLJson.get(DocumentXMLParser.GLOBAL_APPROVAL_PROP);
        if (approvalProps != null)
        {
          String approvalProcess = (String) approvalProps.get(DocumentXMLParser.APPROVAL_PROCESS);
          if (APPROVAL_PROCESS_BASIC.equalsIgnoreCase(approvalProcess))
          {
            isWorkflow = true;
          }
        }

        
       
        communityId = (String) docXMLJson.get(TeamspaceParser.COMMUNITY_ID);
        communityType = (String) docXMLJson.get(TeamspaceParser.COMMUNITY_TYPE);
        libraryId = (String) docXMLJson.get(TeamspaceParser.COMPONENT_ID);
        libraryGenerator = (String) docXMLJson.get(TeamspaceParser.COMPONENT_GENERATOR);
        
        communityOwnerIds = this.getCommunityInfo("&role=owner&", OWNER_XPATH_STRING); 
        isCurrentUseraMember = !this.getCommunityInfo("&userid=" + user.getId() + "&", MEMBER_XPATH_STRING).isEmpty();
        defaultRole =  (String) docXMLJson.get(TeamspaceParser.DEFAULT_ROLE);

      }
      catch (Throwable e)
      {
        logger.log(Level.WARNING, "Unable to read the ECMDocumentEntry information:", e);
      }
    }
  }
  
  // parse community members
  
  private class NSResolver implements NamespaceContext{

    @Override
    public String getNamespaceURI(String prefix)
    {
      if(prefix.equals("snx"))        
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
  
private JSONArray getCommunityInfo(String queryString, String xpathString){
    
    JSONArray memberJson = new JSONArray();
    if( communityId != null )
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
        logger.log(Level.INFO, "Get community Members request state code: " +  String.valueOf(nHttpStatus));
        if (HttpStatus.SC_OK == nHttpStatus)
        {
            InputStream is = getMethod.getResponseBodyAsStream();        
            DocumentBuilder docBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            final org.w3c.dom.Document ownersDocument = docBuilder.parse(is);            
            NodeList nodes = (NodeList) getCommunityOwnerParser().evaluate(xpathString, ownersDocument, XPathConstants.NODESET);
            for( int i = 0; i < nodes.getLength(); i++ ) {
              String t = nodes.item(i).getNodeValue();
              memberJson.add(t);
            }
            logger.log(Level.INFO, "Community members query result: " +  memberJson.toString());
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

  private void init(String repoId, String docUri)
  {
    Document document = docComposite.getDocument();
    long draftStreamSize = document.getContentStreamLength();
    String[] docUris = docUri.split(RepositoryConstants.REPO_ECM_URI_POSTFIX);
    this.repoId = repoId;
    this.docUri = docUri;
    docId = docUris[0];
    String name = document.getName();
    title = AbstractDocumentEntry.trimExt(name);
    mime = (docComposite.getDocumentStreamLength() > 0) ? document.getContentStreamMimeType() : docComposite.getLatestVersionDocument().getContentStreamMimeType();
    ext = AbstractDocumentEntry.extractExt(name);
    if (FormatUtil.isUnknownMime(mime))
    {// unknown mime, try to correct it via ext name
      mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(name);
    }
    if (ext != null && ext.equalsIgnoreCase("csv"))
    {
      if (mime == null || FormatUtil.containsCSV(mime))
      {
        mime = FormatUtil.CSV_MIMETYPE;
      }
    }
    description = document.getDescription();
    mediaSize = (docComposite.getDocumentStreamLength() > 0) ? document.getContentStreamLength() : docComposite.getLatestVersionDocument().getContentStreamLength();
    checkoutUser = docComposite.getDocument().getVersionSeriesCheckedOutBy();

    modified = document.getLastModificationDate();
    if(modifier == null)
    {
      modifier = new String[] { document.getLastModifiedBy(), document.getLastModifiedBy(), null }; 
    }    
    if(creator == null)
    {// should come from the XML document, reset it if not find in the XML
      creator = new String[] { document.getCreatedBy(), document.getCreatedBy(), null, IMemberBase.DEFAULT_ORG_ID };
    }
    versionLabel = document.getVersionLabel();

    pwcId = document.getVersionSeriesCheckedOutId();
    versionSeriesId = document.getVersionSeriesId();
    versionSeriesUri = versionSeriesId + RepositoryConstants.REPO_ECM_URI_POSTFIX + docUris[1];
    
    typeId = docComposite.getIBMDocsState();
    // If it's an ibmdocs document and the document's size is not 0, then it has been published.
    if ((typeId != null) && (typeId.equalsIgnoreCase(IBM_DOCS_STATE_YES)) && (mediaSize != 0))
    {
      isPublished = true;
    }
    else
    {
      isPublished = false;
    }            
  }

  public String getLibraryType()
  {
    return LIBRARY_TYPE;
  }

  public String getLibraryGenerator()
  {
    return libraryGenerator;
  }

  public String getLibraryId()
  {
    return libraryId;
  }

  public String getDocId()
  {
    return docId;
  }

  public String getDocUri()
  {
    return docUri;
  }

  public String getMimeType()
  {
    return mime;
  }

  public String getTitle()
  {
    return title;
  }

  public String getTitleWithExtension()
  {
    if (title == null)
      title = "";
    if (ext == null)
      ext = "";
    return title + "." + ext;
  }

  public String getRepository()
  {
    return repoId;
  }

  public String getCommunityId()
  {
    if (communityId != null)
      return communityId;

    return "";
  }

  public String getCommunityType()
  {
    return communityType;
  }

  public String getCommunityUrl()
  {
    return communityServer;
  }

  public String getExtension()
  {
    return ext;
  }

  public String getDescription()
  {
    return description;
  }

  public Calendar getModified()
  {
    return modified;
  }

  public String[] getModifier()
  {
    return modifier;
  }

  public String[] getCreator()
  {
    return creator;
  }

  public String getFncsServer()
  {
    return fncsServer;
  }

  public String getPrivateWorkCopyId()
  {
    return pwcId;
  }

  public JSONObject getGlobalApproval()
  {
    if (docXMLJson != null)
    {
      return (JSONObject) docXMLJson.get(DocumentXMLParser.GLOBAL_APPROVAL_PROP);
    }
    return null;
  }

  public JSONArray getApprovers()
  {
    if (docXMLJson != null)
    {
      return (JSONArray) docXMLJson.get(DocumentXMLParser.APPROVERS);
    }
    return null;
  }

  public Set<Permission> getPermission()
  {
    return permissions;
  }

  public long getMediaSize()
  {
    return mediaSize;
  }

  public String getVersion()
  {
    return versionLabel;
  }

  public boolean getIsSharable()
  {
    return isSharable;
  }

  public boolean getIsPublishable()
  {
    return Permission.PUBLISH.hasPermission(this.getPermission());
  }

  /**
   * Whether this document is allowed to be shared with people outside organization.
   */
  public boolean isExternal()
  {
    return isExternal;
  }

  /**
   * if the document size is 0 and with ibm docs title means it has not published.
   */
  public boolean isPublished()
  {
    return isPublished;
  }

  /**
   * if the document is encrypt
   */
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

  /**
   * get lock owner info: id, name and email.
   */
  public String[] getLockOwner()
  {
    return lockOwner;
  }

  public String getFileDetailsURL()
  {
    String urlStr = "";
    if (communityId != null && communityId.length() > 0)
    {
      try
      {
        URL url = new URL(URLGenerater.generateCCMFeedURL(communityServer, communityId, libraryId, versionSeriesId));
        urlStr = url.toString();
      }
      catch (MalformedURLException e)
      {
        logger.log(Level.SEVERE, "Unable to get CCM details page URL:", e);
        urlStr = "/communities";
      }
    }
    else
    {
      try
      {
        URL url = new URL(navigatorServer);
        urlStr = url.toString();
      }
      catch (MalformedURLException e)
      {
        logger.log(Level.WARNING, "Unable to get ECM details page URL:", e);
        urlStr = "/navigator";
      }      
    }
    return urlStr;
  }
  
  public String getFilesListURL()
  {
    String urlStr = "";
    if (communityId != null && communityId.length() > 0)
    {
      try
      {
        URL url = new URL(URLGenerater.generateCCMFeedURL(communityServer, communityId, libraryId, null));
        urlStr = url.toString();
      }
      catch (MalformedURLException e)
      {
        logger.log(Level.SEVERE, "Unable to get CCM details page URL:", e);
        urlStr = "/communities";
      }
    }
    else
    {
      try
      {
        URL url = new URL(navigatorServer);
        urlStr = url.toString();
      }
      catch (MalformedURLException e)
      {
        logger.log(Level.WARNING, "Unable to get ECM details page URL:", e);
        urlStr = "/navigator";
      }      
    }
    return urlStr;
  }

  public void setMimeType(String mimeType)
  {
    mime = mimeType;
  }

  /**
   * 
   * @return ECM document's version Series ID
   */

  public String getVersionSeriesId()
  {
    return this.versionSeriesId;
  }
  
  public String getVersionSeriesUri()
  {
    return this.versionSeriesUri;
  }
  
  public String getContentHash()
  {
    return String.valueOf(getMediaSize());
  }
  
  public CMISDocumentComposite getCMISDocumentComposite()
  {
    return docComposite;
  }

  private Set<Permission> convert2PermissionSet(Set<Action> actions)
  {
    logger.log(Level.INFO, "Current user is: id " + user.getId());
    //logger.log(Level.INFO, "checkoutUser is: " + checkoutUser);
    logger.log(Level.INFO, "isWorkflow is: " + String.valueOf(isWorkflow));
    logger.log(Level.INFO, "Permission actions set is: " + actions.toString());

    if (isWorkflow)
    {
      if (checkoutUser != null)
      {        
        if ( checkoutUser.equalsIgnoreCase(user.getId()) || checkoutUser.equalsIgnoreCase(user.getEmail())
            || checkoutUser.equalsIgnoreCase(user.getDistinguishName()) || checkoutUser.equalsIgnoreCase(user.getDisplayName()) || checkoutUser.equalsIgnoreCase(user.getShortName())
            || checkoutUser.equalsIgnoreCase(user.getProperty(IMemberBase.PROP_PRINCIPALID)))
        {
          logger.log(Level.INFO, "permission is: Permission.PUBLISH_SET");
          return Permission.PUBLISH_SET;
        }
      }
      
      if( communityOwnerIds.contains(user.getId()) )
      {        
        logger.log(Level.INFO, "Current user is a community owner, permission is: Permission.EDIT_SET");        
        return Permission.EDIT_SET;        
      }

      String uId = user.getId();      
      if (uId != null && lockOwner!= null && uId.equalsIgnoreCase(lockOwner[0]))
      {// draft lock owner
        logger.log(Level.INFO, "lockOwner permission is: Permission.PUBLISH_SET");
        return Permission.PUBLISH_SET;
      }
      
      if( creator != null && user.getId().equalsIgnoreCase(creator[0]))
      {
        logger.log(Level.INFO, "Current user is a document owner. permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }       
      
      if (communityId != null && communityId.length() > 0)
      {
         logger.log(Level.INFO, "We have community info, skip cmis check, EMPTY_SET returned");
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
        logger.log(Level.INFO, "permission is: Permission.VIEW_SET");
        return Permission.VIEW_SET;
      }
      logger.log(Level.INFO, "permission is: Permission.EMPTY_SET");
      return Permission.EMPTY_SET;
    }
    else
    {
      if (actions.contains(Action.CAN_CHECK_IN) || actions.contains(Action.CAN_CANCEL_CHECK_OUT))
      {        
        if (checkoutUser != null)
        {
          if (checkoutUser.equalsIgnoreCase(user.getId()) || checkoutUser.equalsIgnoreCase(user.getEmail())
              || checkoutUser.equalsIgnoreCase(user.getDistinguishName()) || checkoutUser.equalsIgnoreCase(user.getDisplayName()) || checkoutUser.equalsIgnoreCase(user.getShortName())
              || checkoutUser.equalsIgnoreCase(user.getProperty(IMemberBase.PROP_PRINCIPALID)))
          {
            logger.log(Level.INFO, "permission is: Permission.PUBLISH_SET");
            return Permission.PUBLISH_SET;
          }
        }
        logger.log(Level.INFO, "permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }
      
      if( communityOwnerIds.contains(user.getId()) )
      {        
        logger.log(Level.INFO, "Current user is a community owner, permission is: Permission.EDIT_SET");        
        return Permission.EDIT_SET;        
      }      
      
      String uId = user.getId();      
      if (uId != null && lockOwner != null && uId.equalsIgnoreCase(lockOwner[0]))
      {// draft lock owner
        logger.log(Level.INFO, "lockOwner permission is: Permission.PUBLISH_SET");
        return Permission.PUBLISH_SET;
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
         logger.log(Level.INFO, "We have community info, skip cmis check, EMPTY_SET returned");
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
          logger.log(Level.INFO, "permission is: Permission.VIEW_SET");
          return Permission.VIEW_SET;
        }
        
        logger.log(Level.INFO, "Grant edit permision for cmis privilege.");
        logger.log(Level.INFO, "permission is: Permission.EDIT_SET");
        return Permission.EDIT_SET;
      }
      if (/* CMIS reader */
      actions.contains(Action.CAN_GET_CONTENT_STREAM) || actions.contains(Action.CAN_GET_PROPERTIES)
          || actions.contains(Action.CAN_GET_ACL) || actions.contains(Action.CAN_GET_OBJECT_PARENTS)
          || actions.contains(Action.CAN_GET_ALL_VERSIONS))
      {
        logger.log(Level.INFO, "permission is: Permission.VIEW_SET");
        return Permission.VIEW_SET;
      }
      logger.log(Level.INFO, "permission is: Permission.EMPTY_SET");
      return Permission.EMPTY_SET;
    }
  }
}
