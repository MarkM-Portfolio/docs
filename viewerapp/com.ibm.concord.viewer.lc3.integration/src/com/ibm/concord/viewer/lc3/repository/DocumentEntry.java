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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.i18n.iri.IRI;
import org.apache.abdera.model.AtomDate;
import org.apache.abdera.model.Element;
import org.apache.abdera.model.Entry;
import org.apache.abdera.model.ExtensibleElement;
import org.apache.abdera.model.Link;

import com.ibm.concord.viewer.lc3.Constants;
import com.ibm.concord.viewer.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.util.MimeTypeUtil;

public class DocumentEntry extends AbstractDocumentEntry implements IDocumentEntry
{
  public static Logger LOG = Logger.getLogger(DocumentEntry.class.getName());

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

  private String libraryType;

  private String libraryId;

  private boolean isSharable = true;

  private String communityId;

  private String widgetId;

  private String relativePath;

  private boolean isEncrypt = false;

  private boolean isIBMDocs = true;

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

    if (mime == null)
    {
      mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(rawData.getTitle().toLowerCase());
    }

    if (title == null)
    {
      String label = rawData.getTitle();

      title = trimExt(label);
    }

    if (ext == null)
    {
      String label = rawData.getTitle();

      ext = extractExt(label);
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
      creator = new String[] { creatorId, creatorName, creatorEmail };
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
    }

    if (versionLabel == null)
    {
      versionLabel = ((Element) (rawData.getExtension(Constants.QNAME_TD_VERSION_LABEL))).getText();
    }

    // Gets the library type of this document, such as: "communityFiles" or "personalFiles".
    libraryType = ((Element) (rawData.getExtension(Constants.QNAME_TD_LIBTYPE))).getText();

    // Gets the library id of this document.
    libraryId = ((Element) (rawData.getExtension(Constants.QNAME_TD_LIBID))).getText();

    // If the document's library type is "communityFiles", then it's community owned file and can not be shared.
    isSharable = !Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(libraryType);
    Element encryptElement = (Element) rawData.getExtension(Constants.QNAME_SN_ENCRYPT);
    if (encryptElement != null)
    {
      isEncrypt = encryptElement.getText().equalsIgnoreCase("true");
    }
    // If this file is a community file, then get the community id and widget id.
    if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(libraryType))
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
      int index2 = iriFragment != null ? iriFragment.indexOf(beginStr2) : -1;
      int index3 = iriFragment != null ? iriFragment.indexOf("%26file%3D") : -1;
      if (index2 > -1 && index3 > -1)
      {
        widgetId = iriFragment.substring(index2 + beginStr2.length(), index3);
      }
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
            title = trimExt(value);
            ext = extractExt(value);
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
            mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(getTitle() + "." + getExtension().toLowerCase());
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
            creator = new String[3];

            Element userIdElem = propertyElement.getExtension(Constants.QNAME_SN_USERID);
            creator[0] = userIdElem == null ? null : userIdElem.getText();

            Element userNameElement = propertyElement.getExtension(Constants.QNAME_ATOM_NAME);
            creator[1] = userNameElement == null ? null : userNameElement.getText();

            Element userEmailElem = propertyElement.getExtension(Constants.QNAME_ATOM_EMAIL);
            creator[2] = userEmailElem == null ? null : userEmailElem.getText();
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

  public DocumentEntry(String repoId, String docId, String mimeType, String version, String title, String ext, Set<Permission> permission,
      Calendar modified, String[] creator, String relativePath, boolean isEncrypt, long mediaSize, boolean isIBMDocs, String communityIds)
  {
    this.repoId = repoId;
    this.docId = docId;
    this.mime = mimeType;
    this.versionLabel = version;
    this.title = title;
    this.ext = ext;
    this.permissions = permission;
    this.modified = modified;
    this.creator = creator;
    this.relativePath = relativePath;
    this.isEncrypt = isEncrypt;
    this.mediaSize = mediaSize;
    this.isIBMDocs = isIBMDocs;
    this.communityId = communityIds;

    if (LOG.isLoggable(Level.FINE))
    {
      StringBuffer buf = new StringBuffer("Creator:");
      for (String v : creator)
      {
        buf.append(" ").append(v);
      }
      buf.append(". Permissions: ");
      for (Permission m : permissions)
      {
        buf.append(" ").append(m.name());
      }
      buf.append(". RepoId: ").append(repoId);
      buf.append(". DocId: ").append(docId);
      buf.append(". Mime: ").append(mime);
      buf.append(". VersionLabel: ").append(versionLabel);
      buf.append(". Title: ").append(title);
      buf.append(". Modified: ").append(modified.getTimeInMillis());
      buf.append(". RelativePath: ").append(relativePath);
      buf.append(". IsEncrypt: ").append(isEncrypt);
      buf.append(". MediaSize: ").append(mediaSize);
      buf.append(". IsIBMDocs: ").append(isIBMDocs);
      buf.append(". communityId: ").append(communityId);
      LOG.log(Level.FINE, "DocumentEntry is {0}", buf.toString());
    }

  }

  protected String getLibraryType()
  {
    return this.libraryType;
  }

  protected String getLibraryId()
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
    return this.communityId != null ? this.communityId : "";
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
    if (permissions.indexOf("Edit") != -1)
    {
      return Permission.EDIT_SET;
    }
    else if (permissions.indexOf("View") != -1)
    {
      return Permission.VIEW_SET;
    }
    else
    {
      return Permission.EMPTY_SET;
    }
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
   * if the document is encrypt
   */
  public boolean isEncrypt()
  {
    return isEncrypt;
  }

  public void setMimeType(String mimeType)
  {
    this.mime = mimeType;
  }

  public static String[] tokens(String docUri)
  {
    int index = docUri.indexOf(IDocumentEntry.DOC_URI_SEP);
    String libId = null;
    String docId = null;
    if (index != -1)
    {
      libId = docUri.substring(0, index);
      docId = docUri.substring(index + 1);
    }
    else
    {
      libId = null;
      docId = docUri;
    }
    return new String[] { libId, docId };
  }

  public String getRelativePath()
  {
    return relativePath;
  }

  public boolean isIBMDocs()
  {
    return isIBMDocs;
  }

  @Override
  public boolean hasViewPermission()
  {
    return Permission.VIEW.hasPermission(getPermission());
  }

  @Override
  public String getFileDetailsURL()
  {
    return null;
  }
}
