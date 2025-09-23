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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.abdera.i18n.iri.IRI;
import org.apache.abdera.model.AtomDate;
import org.apache.abdera.model.Element;
import org.apache.abdera.model.Entry;
import org.apache.abdera.model.ExtensibleElement;
import org.apache.abdera.model.Link;

import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.util.MimeTypeUtil;

public class DocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  private String repoId;

  private String docId;

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

  private String libraryType;

  private String libraryId;

  private String typeId;

  private boolean isSharable = true;

  private String communityId;

  private String widgetId;

  private String fileDetailsURL;
  
  private String fileListURL;

  private boolean isPublished;

  private boolean isEncrypt = false;

  private boolean isLocked = false;

  private boolean isExternal = false;

  protected DocumentEntry(String repoId)
  {
    this.repoId = repoId;
  }

  public DocumentEntry(String repoId, Entry rawData)
  {
    this.repoId = repoId;
    if (docId == null)
    {
      docId = ((Element) (rawData.getExtension(Constants.QNAME_TD_UUID))).getText();
    }

    if (typeId == null)
    {
      Element e = (Element) (rawData.getExtension(Constants.QNAME_TYPE_ID));
      if (e == null)
        typeId = null;
      else
        typeId = e.getText();
    }

    if (title == null)
    {
      String label = ((Element) (rawData.getExtension(Constants.QNAME_TD_LABEL))).getText();

      title = AbstractDocumentEntry.trimExt(label);
    }

    if (mime == null)
    {
      String label = ((Element) (rawData.getExtension(Constants.QNAME_TD_LABEL))).getText();

      mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(label.toLowerCase());
    }

    if (ext == null)
    {
      String label = ((Element) (rawData.getExtension(Constants.QNAME_TD_LABEL))).getText();

      ext = AbstractDocumentEntry.extractExt(label);
    }

    if (fileDetailsURL == null)
    {
      Link link = rawData.getLink("via");
      if (link != null)
      {
        fileDetailsURL = link.getHref().toString();
      }
      else
      {
        // change from Files, via link may be removed and replaced by alternate link.
        link = rawData.getAlternateLink();
        if (link != null)
        {
          fileDetailsURL = link.getHref().toString();
        }
      }
    }

    if (description == null)
    {
      description = rawData.getSummary();
    }

    if (modified == null)
    {
      modified = AtomDate.valueOf(((Element) rawData.getExtension(Constants.QNAME_TD_MODITIED)).getText()).getCalendar();
    }

    if (modifier == null)
    {
      ExtensibleElement modifierElem = (ExtensibleElement) rawData.getExtension(Constants.QNAME_TD_MODIFIER);
      String modifierId = ((Element) modifierElem.getExtension(Constants.QNAME_SN_USERID)).getText();
      String modifierName = ((Element) modifierElem.getExtension(Constants.QNAME_ATOM_NAME)).getText();
      String modifierEmail = null;
      if (modifierElem.getExtension(Constants.QNAME_ATOM_EMAIL) != null)
      {
        modifierEmail = ((Element) modifierElem.getExtension(Constants.QNAME_ATOM_EMAIL)).getText();
      }
      modifier = new String[] { modifierId, modifierName, modifierEmail };
    }

    if (creator == null)
    {
      String creatorId = (((Element) rawData.getAuthor().getExtension(Constants.QNAME_SN_USERID))).getText();
      String creatorName = rawData.getAuthor().getName();
      String creatorEmail = null;
      if (rawData.getAuthor().getEmail() != null)
      {
        creatorEmail = rawData.getAuthor().getEmail();
      }
      String creatorOrgId = null;
      if ((Element) rawData.getAuthor().getExtension(Constants.QNAME_SN_ORGID) != null)
      {
        creatorOrgId = (((Element) rawData.getAuthor().getExtension(Constants.QNAME_SN_ORGID))).getText();
      }
      creator = new String[] { creatorId, creatorName, creatorEmail, creatorOrgId };
    }

    if (permissions == null)
    {
      Element permissionsExt = (Element) rawData.getExtension(Constants.QNAME_TD_PERMISSIONS);
      if (permissionsExt != null)
      {
        permissions = convert2PermissionSet(permissionsExt.getText());
      }
      else
      {
        permissions = Permission.EMPTY_SET;
      }
    }

    if (mediaSize == -1)
    {
      mediaSize = rawData.getEnclosureLink().getLength();
      // If it's an ibmdocs document and the document's size is not 0, then it has been published.
      if ((typeId != null) && (typeId.equalsIgnoreCase(Constants.IBM_DOCS_ID) || typeId.equalsIgnoreCase(Constants.IBM_DOCS_ID2))
          && (mediaSize != 0))
        isPublished = true;
      else
        isPublished = false;

      // isPublished = (mediaSize == 0) ? false : true;
    }

    if (versionLabel == null)
    {
      versionLabel = ((Element) (rawData.getExtension(Constants.QNAME_TD_VERSION_LABEL))).getText();
    }

    // Gets the library type of this document, such as: "communityFiles" or "personalFiles".
    Element libTypeElement = (Element) (rawData.getExtension(Constants.QNAME_TD_LIBTYPE));
    if (libTypeElement != null)
      libraryType = libTypeElement.getText();

    // Gets the library id of this document.
    libraryId = ((Element) (rawData.getExtension(Constants.QNAME_TD_LIBID))).getText();

    // If the document's library type is "communityFiles", then it's community owned file and can not be shared.
    if (libraryType != null)
      isSharable = !Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(libraryType);
    else
      isSharable = false;

    Element externalElement = (Element) rawData.getExtension(Constants.QNAME_SN_IS_EXTERNAL);
    if (externalElement != null)
    {
      isExternal = externalElement.getText().equalsIgnoreCase("true");
    }

    Element encryptElement = (Element) rawData.getExtension(Constants.QNAME_SN_ENCRYPT);
    if (encryptElement != null)
    {
      isEncrypt = encryptElement.getText().equalsIgnoreCase("true");
    }

    ExtensibleElement lockElement = rawData.getExtension(Constants.QNAME_TD_LOCK);
    if (lockElement != null)
    {
      String lockType = lockElement.getAttributeValue("type");
      if (lockType != null && "HARD".equalsIgnoreCase(lockType))
      {
        isLocked = true;
        ExtensibleElement ownerElement = lockElement.getExtension(Constants.QNAME_TD_OWNER);
        String ownerId = ((Element) ownerElement.getExtension(Constants.QNAME_SN_USERID)).getText();
        String ownerName = ((Element) ownerElement.getExtension(Constants.QNAME_ATOM_NAME)).getText();
        String ownerEmail = null;
        if (ownerElement.getExtension(Constants.QNAME_ATOM_EMAIL) != null)
        {
          ownerEmail = ((Element) ownerElement.getExtension(Constants.QNAME_ATOM_EMAIL)).getText();
        }
        lockOwner = new String[] { ownerId, ownerName, ownerEmail };
      }

    }

    // If this file is a community file, then get the community id and widget id.
    if (libraryType != null && Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(libraryType))
    {
      String beginStr1 = "communityUuid=";
      String beginStr2 = "fullpageWidgetId%3D";
      Link link = rawData.getAlternateLink();
      IRI iri = link != null ? link.getHref() : null;
      String iriQuery = iri != null ? iri.getASCIIQuery() : null;
      String iriFragment = iri != null ? iri.getASCIIFragment() : null;
      int index1 = iriQuery != null ? iriQuery.indexOf(beginStr1) : -1;
      if (index1 > -1)
      {
        communityId = iriQuery.substring(index1 + beginStr1.length());
      }
      int index2 = -1;
      if (iriFragment != null)
      {
        index2 = iriFragment.indexOf(beginStr2);
        if (index2 == -1)
        {
          index2 = iriFragment.indexOf("fullpageWidgetId=");
          beginStr2 = "fullpageWidgetId=";
        }
      }
      int index3 = -1;
      if (iriFragment != null)
      {
        index3 = iriFragment.indexOf("%26file%3D");
        if (index3 == -1)
        {
          index3 = iriFragment.indexOf("&file=");
        }
      }
      if (index2 > -1 && index3 > -1)
      {
        widgetId = iriFragment.substring(index2 + beginStr2.length(), index3);
      }    
      
      int indexFileId = fileDetailsURL.indexOf("&file=");
      if (indexFileId == -1)
      {
        indexFileId = fileDetailsURL.indexOf("%26file%3D");
      }
      if (indexFileId > -1)
      {
        fileListURL = fileDetailsURL.substring(0, indexFileId);
      }
      else
      {
        StringBuilder sb = new StringBuilder();
        int indexFiles = fileDetailsURL.indexOf(Constants.FILES);
        if (indexFiles > 0)
        {
          String context = fileDetailsURL.substring(0, fileDetailsURL.indexOf(Constants.FILES));
          sb.append(context);
        }
        else
        {
          String context = fileDetailsURL.substring(0, fileDetailsURL.indexOf("/", 8));
          sb.append(context);
        }
        sb.append("/communities/service/html/communityview?communityUuid=");
        sb.append(communityId);
        if (widgetId != null && widgetId.length() > 0)
        {
          sb.append("#fullpageWidgetId=");
          sb.append(widgetId);
        }
        fileListURL = sb.toString();
      }
    }
    else
    {
      String context = fileDetailsURL.substring(0, fileDetailsURL.indexOf(Constants.FILES) + Constants.FILES.length());
      StringBuilder sb = new StringBuilder(context);
      sb.append("/app");
      fileListURL = sb.toString();
    }
  }

  public DocumentEntry(String repoId, Entry rawData, String executor)
  {
    this.repoId = repoId;
    Entry docEntry = rawData;
    ExtensibleElement objElem = (ExtensibleElement) docEntry.getExtension(Constants.QNAME_OBJECT);
    if (objElem != null)
    {
      ExtensibleElement propsElem = (ExtensibleElement) objElem.getExtension(Constants.QNAME_PROPERTIES);
      if (propsElem != null)
      {
        List<Element> propertyList = getElements(propsElem);
        for (Iterator<Element> iter = propertyList.iterator(); iter.hasNext();)
        {
          ExtensibleElement propertyElement = (ExtensibleElement) iter.next();
          String id = propertyElement.getAttributeValue("propertyDefinitionId");
          if ("cmis:objectId".equals(id))
          {
            Element valueElement = propertyElement.getExtension(Constants.QNAME_VALUE);
            String value = valueElement == null ? null : valueElement.getText();
            docId = value.substring("snx:file!".length());
          }
          else if ("cmis:name".equals(id))
          {
            Element valueElement = propertyElement.getExtension(Constants.QNAME_VALUE);
            String value = valueElement == null ? null : valueElement.getText();
            title = AbstractDocumentEntry.trimExt(value);
            ext = AbstractDocumentEntry.extractExt(value);
          }
          else if ("cmis:contentStreamMimeType".equals(id))
          {
            /*
             * Mime types are not always kept precisely in file repository system, so that Concord server needs to override its original
             * mime type.
             */
            // Element valueElement = propertyElement.getExtension(QNAME_VALUE);
            // String value = valueElement == null ? null : valueElement.getText();
            // mime = value;
            mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType((getTitle() + "." + getExtension()).toLowerCase());
          }
          else if ("snx:summary".equals(id))
          {
            Element valueElement = propertyElement.getExtension(Constants.QNAME_VALUE);
            String value = valueElement == null ? null : valueElement.getText();
            description = value;
          }
          // else if ("cmis:creationDate".equals(id))
          // {
          // Element valueElement = propertyElement.getExtension(Constants.QNAME_VALUE);
          // String value = valueElement == null ? null : valueElement.getText();
          // created = AtomDate.valueOf(value).getCalendar();
          // }
          else if ("cmis:lastModificationDate".equals(id))
          {
            Element valueElement = propertyElement.getExtension(Constants.QNAME_VALUE);
            String value = valueElement == null ? null : valueElement.getText();
            modified = AtomDate.valueOf(value).getCalendar();
          }
          else if ("cmis:createdBy".equals(id))
          {
            creator = new String[4];

            Element userIdElem = propertyElement.getExtension(Constants.QNAME_SN_USERID);
            creator[0] = userIdElem == null ? null : userIdElem.getText();

            Element userNameElement = propertyElement.getExtension(Constants.QNAME_ATOM_NAME);
            creator[1] = userNameElement == null ? null : userNameElement.getText();

            Element userEmailElem = propertyElement.getExtension(Constants.QNAME_ATOM_EMAIL);
            creator[2] = userEmailElem == null ? null : userEmailElem.getText();

            creator[3] = null; // TODO, there is no CMIS call to here, so ignore setting creator org id.
          }
          else if ("cmis:lastModifiedBy".equals(id))
          {
            modifier = new String[3];

            Element userIdElem = propertyElement.getExtension(Constants.QNAME_SN_USERID);
            modifier[0] = userIdElem == null ? null : userIdElem.getText();

            Element userNameElement = propertyElement.getExtension(Constants.QNAME_ATOM_NAME);
            modifier[1] = userNameElement == null ? null : userNameElement.getText();

            Element userEmailElem = propertyElement.getExtension(Constants.QNAME_ATOM_EMAIL);
            modifier[2] = userEmailElem == null ? null : userEmailElem.getText();
          }
          else if ("cmis:versionLabel".equals(id))
          {
            Element valueElement = propertyElement.getExtension(Constants.QNAME_VALUE);
            String value = valueElement == null ? null : valueElement.getText();
            versionLabel = value;
          }
          else
          {
            ;
          }
        }
      }

      // ExtensibleElement aclElem = (ExtensibleElement) objElem.getExtension(Constants.QNAME_ACL);
      // if (aclElem != null)
      // {
      // ExtensibleElement permissionElem = aclElem.getExtension(Constants.QNAME_PERMISSION);
      // ExtensibleElement principalElem = permissionElem.getExtension(Constants.QNAME_PRINCIPAL);
      // Element principalIdElem = principalElem.getExtension(Constants.QNAME_PRINCIPAL_ID);
      // String principalId = principalIdElem == null ? "" : principalIdElem.getText();
      // if (principalId.equals(executor))
      // {
      // Element permissionValueElem = permissionElem.getExtension(Constants.QNAME_PERMISSION);
      // String permission = permissionValueElem == null ? null : permissionValueElem.getText();
      // if ("cmis:all".equals(permission))
      // {
      // permissions = Permission.EDIT_SET;
      // }
      // else if ("cmis:read".equals(permission))
      // {
      // permissions = Permission.VIEW_SET;
      // }
      // else if ("snx:editor".equals(permission))
      // {
      // permissions = Permission.EDIT_SET;
      // }
      // else
      // {
      // permissions = Permission.EMPTY_SET;
      // }
      // }
      // }
      // else
      // {
      // permissions = Permission.EMPTY_SET;
      // }

      permissions = Permission.EMPTY_SET;
    }
  }

  public String getLibraryType()
  {
    return this.libraryType;
  }

  public String getLibraryId()
  {
    return this.libraryId;
  }

  /**
   * Get the community id that the document belong to.
   * 
   * @return
   */
  public String getCommunityId()
  {
    if(this.communityId != null)
      return this.communityId;
    return "";
  }

  /**
   * Get the community widget id that the document belong to.
   * 
   * @return
   */
  protected String getWidgetId()
  {
    return this.widgetId;
  }

  public String getDocId()
  {
    return docId;
  }

  public String getDocUri()
  {
    return /* getCreator()[0] + DOC_URI_SEP + */getDocId();
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

  public Set<Permission> getPermission()
  {
    return permissions;
  }

  public long getMediaSize()
  {
    return mediaSize;
  }

  private static List<Element> getElements(ExtensibleElement element)
  {
    Element child = element.getFirstChild();
    List<Element> l = new ArrayList<Element>();

    do
    {
      l.add(child);
      child = child.getNextSibling();
    }
    while (child != null);

    return l;
  }

  private Set<Permission> convert2PermissionSet(String permissions)
  {
    permissions = ", ".concat(permissions).concat(",");

    if (permissions.indexOf(", Edit,") != -1)
    {
      return Permission.EDIT_SET;
    }
    else if (permissions.indexOf(", View,") != -1)
    {
      return Permission.VIEW_SET;
    }
    else
    {
      return Permission.EMPTY_SET;
    }
  }

  public String getVersion()
  {
    return versionLabel;
  }

  /**
   * If the document's library type is "communityFiles", then it's community owned file and can not be shared.
   */
  public boolean getIsSharable()
  {
    return isSharable;
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

  // return the link of this document on Files
  public String getFileDetailsURL()
  {
    return fileDetailsURL;
  }
  
  public String getFilesListURL()
  {
    return fileListURL;
  }

  public void setMimeType(String mimeType)
  {
    this.mime = mimeType;
  }
  
  public String getVersionSeriesId()
  {
    return null;
  }
  
  public String getVersionSeriesUri()
  {
    return null;
  }  
}
