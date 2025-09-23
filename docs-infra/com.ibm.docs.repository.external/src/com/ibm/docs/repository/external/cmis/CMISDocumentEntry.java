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

import java.util.Calendar;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.commons.enums.Action;

import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class CMISDocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private static final Logger LOG = Logger.getLogger(CMISDocumentEntry.class.getName());

  private UserBean user;
  
  public static final String PERMISSION_CMIS_ALL = "cmis:all";

  public static final String PERMISSION_CMIS_WRITE = "cmis:write";

  public static final String PERMISSION_CMIS_READ = "cmis:read";
  
  public static final String DEFAULT_ROLE_OWNER = "ROLE_OWNER";

  private String docUri;

  private Document pwcDocument;

  private Document lastMajorDoc;

  private String repoId;

  private String docId;

  private String title;

  private String ext;

  private String mime;

  private String description;

  private Calendar modified;

  private String[] modifier;

  private String[] creator;

  private String versionLabel;

  private Set<Permission> permissions;

  private long mediaSize = -1;

  private String pwcId; // private work copy ID, this is the new ID after check in. it should be same as docId.

  private String versionSeriesId; // the ECM document's version series ID, unical for a document

  private String versionSeriesUri;

  private String repoHomeUrl;

  private boolean forceCheckOut = true;

  protected CMISDocumentEntry(UserBean user, String repoId, String docUri, String repoHomeUrl, Document document)
  {
    this.user = user;
    this.repoId = repoId;
    this.docUri = docUri;
    this.repoHomeUrl = repoHomeUrl;

    init(document);
  }

  protected CMISDocumentEntry(UserBean user, String repoId, String docUri, String repoHomeUrl, Document document, boolean forceCheckOut)
  {
    this.user = user;
    this.repoId = repoId;
    this.docUri = docUri;
    this.repoHomeUrl = repoHomeUrl;
    this.forceCheckOut = forceCheckOut;

    init(document);
  }

  private void init(Document document)
  {
    String[] docUris = docUri.split(RepositoryConstants.REPO_ECM_URI_POSTFIX);
    docId = docUris[0];

    try
    {
      lastMajorDoc = document.getObjectOfLatestVersion(true);
    }
    catch (Throwable e)
    {
      LOG.log(Level.INFO, "Error to get CMIS major version: " + e);
    }

    boolean isCheckedOut = document.isVersionSeriesCheckedOut();
    if (lastMajorDoc == null && !isCheckedOut)
    {
      LOG.log(Level.SEVERE, "There is no major version and checkout version for {0} !!! ", docId);
      return;
    }

    Document workDoc = lastMajorDoc != null ? lastMajorDoc : document;
    if (isCheckedOut)
    {
      pwcId = workDoc.getVersionSeriesCheckedOutId();
    }
    else if (forceCheckOut)
    {
      workDoc.checkOut();
      workDoc.refresh();
      pwcId = workDoc.getVersionSeriesCheckedOutId();
    }
    else
    {
      workDoc = document;
    }
    if (pwcId == null)
    {
      LOG.log(Level.WARNING, "Error to get PWC Document ID for: " + docId);
    }

    List<Document> docsList = workDoc.getAllVersions();
    for (int i = 0; i < docsList.size(); i++)
    {
      Document doc = (Document) docsList.get(i);
      if (doc.getId().equalsIgnoreCase(pwcId)) // !!!isPrivateWorkingCopy() can not be used!!!
      {
        pwcDocument = doc;
        break;
      }
    }
    if (pwcDocument == null)
    {
      LOG.log(Level.SEVERE, "Error to get last PWC Document for: " + docId);
    }

    if (pwcDocument != null)
    {
      mediaSize = pwcDocument.getContentStreamLength();
      if(mediaSize <= 0)
        mediaSize = workDoc.getContentStreamLength();
      
      mime = pwcDocument.getContentStreamMimeType();
      if (mime == null)
        mime = workDoc.getContentStreamMimeType();
      
      Set<Action> actions = pwcDocument.getAllowableActions().getAllowableActions();      
      permissions = convert2PermissionSet(actions);      
      
      workDoc = pwcDocument;
    }
    else
    {
      permissions = Permission.EDIT_SET;
      mediaSize = workDoc.getContentStreamLength();
      mime = workDoc.getContentStreamMimeType();
    }
        
    String name = workDoc.getName();
    if (FormatUtil.isUnknownMime(mime))
    {// unknown mime, try to correct it via ext name
      mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(name);
    }
    title = AbstractDocumentEntry.trimExt(name);
    ext = AbstractDocumentEntry.extractExt(name);
    description = workDoc.getDescription();
    versionLabel = workDoc.getVersionLabel();
    modified = workDoc.getLastModificationDate();
    modifier = new String[] { workDoc.getLastModifiedBy(), workDoc.getLastModifiedBy(), null };
    creator = new String[] { workDoc.getCreatedBy(), workDoc.getCreatedBy(), null, IMemberBase.DEFAULT_ORG_ID };
    versionSeriesId = workDoc.getVersionSeriesId();
    if (docUris.length > 1 && docUris[1] != null)
    {
      versionSeriesUri = versionSeriesId + RepositoryConstants.REPO_ECM_URI_POSTFIX + docUris[1];
    }
    else
    {
      versionSeriesUri = versionSeriesId;
    }
    
    LOG.log(Level.INFO, "CMISDocument Name: {0}, MIME: {1}, Size: {2} ", new Object[] {name, mime, mediaSize});
  }

  public String getDocUri()
  {
    return docUri;
  }

  public String getDocId()
  {
    return docId;
  }

  public String getMimeType()
  {
    return mime;
  }

  public String getTitle()
  {
    return title;
  }

  public String getRepository()
  {
    return repoId;
  }

  public String getExtension()
  {
    return ext;
  }

  public String getDescription()
  {
    return description;
  }

  public String getFileDetailsURL()
  {
    return repoHomeUrl;
  }
  
  public String getFilesListURL()
  {
    return repoHomeUrl;
  }

  public String getVersion()
  {
    return versionLabel;
  }

  public Calendar getModified()
  {
    return modified;
  }

  public String[] getModifier()
  {
    return modifier;
  }

  public long getMediaSize()
  {
    return mediaSize;
  }

  public String[] getCreator()
  {
    return creator;
  }

  public Set<Permission> getPermission()
  {
    return permissions;
  }

  public boolean getIsSharable()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public String getCommunityId()
  {
    // TODO Auto-generated method stub
    return "";
  }

  public String getCommunityType()
  {
    return null;
  }

  public String getCommunityUrl()
  {
    return null;
  }

  public boolean isPublished()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public boolean isEncrypt()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public boolean isLocked()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public String[] getLockOwner()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public void setMimeType(String mimeType)
  {
    mime = mimeType;
  }

  public String getDocumentId()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getCategory()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getLibraryId()
  {
    return null;
  }

  public String getLibraryType()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public String getLibraryGenerator()
  {
    return null;
  }

  public boolean isExternal()
  {
    // TODO Auto-generated method stub
    return false;
  }

  public String getTitleWithExtension()
  {
    if (title == null)
      title = "";
    if (ext == null)
      ext = "";
    return title + "." + ext;
  }

  /**
   * ECM/CCM interfaces
   */
  public boolean getIsPublishable()
  {
    return Permission.PUBLISH.hasPermission(permissions);
  }

  public String getFncsServer()
  {
    return null;
  }

  public String getPrivateWorkCopyId()
  {
    return pwcId;
  }

  public JSONObject getGlobalApproval()
  {
    return null;
  }

  public JSONArray getApprovers()
  {
    return null;
  }

  public String getVersionSeriesId()
  {
    return versionSeriesId;
  }

  public String getVersionSeriesUri()
  {
    return versionSeriesUri;
  }

  public String getContentHash()
  {
    return String.valueOf(getMediaSize());
  }

  public IDocumentEntry getRepoDocEntry()
  {
    return null;
  }

  public Document getPWCDocument()
  {
    return pwcDocument;
  }

  public Document getLastMajorDocument()
  {
    return lastMajorDoc;
  }

  private Set<Permission> convert2PermissionSet(Set<Action> actions)
  {
    if (actions.contains(Action.CAN_CHECK_IN) || actions.contains(Action.CAN_CANCEL_CHECK_OUT))
    {
      return Permission.PUBLISH_SET;
    }
    if (/* CMIS Owner */
    actions.contains(Action.CAN_DELETE_OBJECT) || actions.contains(Action.CAN_APPLY_ACL)
        || actions.contains(Action.CAN_DELETE_CONTENT_STREAM) ||
        /* CMIS editor */
        actions.contains(Action.CAN_CHECK_OUT) || actions.contains(Action.CAN_ADD_OBJECT_TO_FOLDER)
        || actions.contains(Action.CAN_REMOVE_OBJECT_FROM_FOLDER) || actions.contains(Action.CAN_MOVE_OBJECT)
        || actions.contains(Action.CAN_UPDATE_PROPERTIES) || actions.contains(Action.CAN_SET_CONTENT_STREAM))
    {
      return Permission.EDIT_SET;
    }
    if (/* CMIS reader */
    actions.contains(Action.CAN_GET_CONTENT_STREAM) || actions.contains(Action.CAN_GET_PROPERTIES) || actions.contains(Action.CAN_GET_ACL)
        || actions.contains(Action.CAN_GET_OBJECT_PARENTS) || actions.contains(Action.CAN_GET_ALL_VERSIONS))
    {
      return Permission.VIEW_SET;
    }
    return Permission.EMPTY_SET;
  }
}
