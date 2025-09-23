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

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.Element;
import org.apache.abdera.model.Entry;
import org.apache.abdera.model.ExtensibleElement;
import org.apache.abdera.parser.stax.FOMFactory;
import org.apache.abdera.parser.stax.FOMParser;
import org.apache.abdera.parser.stax.FOMParserOptions;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class LCFilesCMISRepository extends LCFilesQCSRepository
{
  private static final Logger LOGGER = Logger.getLogger(LCFilesCMISRepository.class.toString());

  private String cmisContextRoot;

  public void init(JSONObject config)
  {
    super.init(config);

    if (((String) config.get("server_url")).endsWith("/"))
    {
      cmisContextRoot = "form/cmis";
    }
    else
    {
      cmisContextRoot = "/form/cmis";
    }
  }

  /**
   * It is NOT SAFE to mixture use IDocumentEntry returned from LCFilesQCSRepository::getDocument() and
   * LCFilesCMISRepository::createDocument(). Typical case as below, there are two dina gap between the Entries return from createDocument
   * and getDocument.
   * 
   * Below case does not happened if both using QCS based get/create or CMIS based get/create.
   * 
   * [5/31/11 13:41:16:308 CST] 0000004b SystemOut O 1306820498926
   * [5/31/11 13:41:16:308 CST] 0000004b SystemOut O 1306820498924
   */
  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is,
      Boolean isExternal, Boolean propagate, MediaOptions options) throws RepositoryAccessException
  {
    if (requester == null || folderUri == null || docLabel == null || is == null)
    {
      throw new NullPointerException();
    }
    if (checkFileExist(requester, folderType, folderUri, docLabel))
    {
      LOGGER.log(Level.WARNING, "Can not create duplicate document name {0} in folder {1}", new Object[]{docLabel, folderUri});
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_DUPLICATED_TITLE);
      rae.getData().put("folderType", folderType);
      rae.getData().put("folderUri", folderUri);
      rae.getData().put("docLabel", docLabel);
      throw rae;
    }

    return super.createDocument(requester, folderUri, folderType, docLabel, is, isExternal, propagate, options);

  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is)
      throws RepositoryAccessException
  {
    return createDocument(requester, folderUri, folderType, docLabel, is, null, null, null);
  }
  
  /**
   * 
   * @param requester
   * @param folderType
   *          specifies the library type, for personal files, it should be "personalFiles", for community files, it should be
   *          "communityFiles".
   * @param folderUri
   *          specifies the folder URI, for personal files, it should be {user id}, for community files, it should be
   *          {widgetId}!{communityId}.
   * @param title
   *          specifies the file name
   * @return
   * @throws RepositoryAccessException
   */
  private String adjustTitle(UserBean requester, String folderType, String folderUri, String title) throws RepositoryAccessException
  {
    long count = 1;
    String adjustLabel = title;
    while (checkFileExist(requester, folderType, folderUri, adjustLabel))
    {
      if (count == 1)
      {
        count = System.currentTimeMillis();
      }

      String suffix = "_" + count + "." + AbstractDocumentEntry.extractExt(title);
      int lenSuffix = suffix.getBytes().length;
      adjustLabel = AbstractDocumentEntry.trimExt(title);
      if (adjustLabel.getBytes().length + lenSuffix > 252)
        adjustLabel = adjustLabel.substring(0, adjustLabel.length() - ("_" + count).length()) + suffix;
      else
        adjustLabel = adjustLabel + suffix;
      count++;
    }
    return adjustLabel;
  }

  /**
   * 
   * @param caller
   * @param folderType
   *          specifies the library type, for personal files, it should be "personalFiles", for community files, it should be
   *          "communityFiles".
   * @param folderUri
   *          specifies the folder URI, for personal files, it should be {user id}, for community files, it should be
   *          {widgetId}!{communityId}.
   * @param docLabel
   *          specifies the file name
   * @return
   * @throws RepositoryAccessException
   */
  private boolean checkFileExist(UserBean caller, String folderType, String folderUri, String docLabel) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesCMISRepository.class.getName(), (new StringBuilder()).append("checkFileExist[uid: ").append(caller.getId())
        .append(", orgId: ").append(caller.getOrgId()).append(", docLabel: ").append(docLabel).append("]").toString());
    
    GetMethod getMethod = null;

    String documentEntryUrl = URLGenerater.CMIS.generateDocumentEntryURLFromLabel(serverUrl.toString(), cmisContextRoot, folderType,
        folderUri, encodeTitle(docLabel));

    getMethod = new GetMethod(documentEntryUrl);
    setRequestHeaders(getMethod, caller);

    try
    {
      client.executeMethod(getMethod);

      int statusCode = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == statusCode)
      {
        return true;
      }
      else if (HttpStatus.SC_NOT_FOUND == statusCode)
      {
        return false;
      }
      else
      {
        if (LOGGER.isLoggable(Level.WARNING))
        {
          LOGGER.warning("[S2S call Response Code]: " + getMethod.getStatusCode());
        }

        RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
        rae.getData().put("folderType", folderType);
        rae.getData().put("folderUri", folderUri);
        rae.getData().put("docLabel", docLabel);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
      rae.setDefaultErrDetail("checkFileExist failed.");
      rae.getData().put("folderType", folderType);
      rae.getData().put("folderUri", folderUri);
      rae.getData().put("docLabel", docLabel);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      return false;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
      LOGGER.exiting(LCFilesCMISRepository.class.getName(), "checkFileExist");
    }
  }

  private String encodeTitle(String title)
  {
    try
    {
      String newTitle = URLEncoder.encode(title, "UTF8");
      return newTitle.replaceAll("[+]", "%20");
    }
    catch (UnsupportedEncodingException e)
    {
      LOGGER.log(Level.WARNING, "Unsupported Encoding Type", e);
    }
    return null;
  }

  protected String encodeHeader(String header)
  {
    String encodedHeader = header;
    try
    {
      StringBuffer buf = new StringBuffer(header.length() * 2);
      buf.append("=?UTF-8?Q?"); //$NON-NLS-1$
      byte[] bytes = header.getBytes("UTF-8"); //$NON-NLS-1$
      int len = bytes.length;
      int i = 0;
      while (i < len)
      {
        buf.append('=');
        int nByte = bytes[i];
        if (nByte < 0)
        {
          nByte += 256;
        }
        buf.append(Integer.toHexString(nByte));
        i++;
      }
      buf.append("?="); //$NON-NLS-1$
      encodedHeader = buf.toString();
    }
    catch (UnsupportedEncodingException e)
    {
      LOGGER.log(Level.WARNING, e.getMessage(), e);
    }

    return encodedHeader;
  }

  /**
   * FIXME, Need to investigate why below commented out implementation does not work, later.
   */
  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException
  {
    return super.renameDocument(requester, docEntry, newLabel);
  }

  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException
  {
    return super.restoreVersion(requester, docUri, versionId);
  }

  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return super.getVersions(requester, docEntry);
  }

  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesCMISRepository.class.getName(), "getAllACE", new Object[] { requester.getId(), docEntry.getDocUri() });

    String docUri = docEntry.getDocUri();
    String libraryType = docEntry.getLibraryType();

    // Get the ACE for personal file through QCS APIs, do not support to get ACE for communities file through QCS APIs.
    if (Constants.LIB_TYPE_PERSONAL.equalsIgnoreCase(libraryType))
    {
      Vector<ACE> acl = super.getAllACE(requester, docEntry);
      LOGGER.exiting(LCFilesCMISRepository.class.getName(), "getAllACE");
      return acl;
    }

    // Get the ACE for communities file through CMIS APIs.
    Vector<ACE> result = new Vector<ACE>();
    
    GetMethod getMethod = null;

    String[] docIds = URLGenerater.tokens(docUri);
    // String libId = docIds[0];
    String libId = docEntry.getCreator()[0];
    String docId = docIds[1];
    String documentEntryUrl = URLGenerater.CMIS.generateDocumentEntryURL(serverUrl.toString(), cmisContextRoot, libId, docId);

    getMethod = new GetMethod(documentEntryUrl);
    setRequestHeaders(getMethod, requester);

    try
    {
      client.executeMethod(getMethod);
      int statusCode = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == statusCode)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();

        ExtensibleElement objElem = (ExtensibleElement) entryDocument.getExtension(Constants.QNAME_OBJECT);
        ExtensibleElement aclElem = (ExtensibleElement) objElem.getExtension(Constants.QNAME_ACL);

        if (aclElem != null)
        {
          List<Element> allACL = aclElem.getElements();
          Iterator<Element> iter = allACL.iterator();
          while (iter.hasNext())
          {
            Set<Permission> permissionSet;
            Element elem = iter.next();
            ExtensibleElement permissionElem = ((ExtensibleElement) elem).getExtension(Constants.QNAME_PERMISSION);
            ExtensibleElement principalElem = ((ExtensibleElement) elem).getExtension(Constants.QNAME_PRINCIPAL);
            Element principalIdElem = principalElem.getExtension(Constants.QNAME_PRINCIPAL_ID);
            String principalId = principalIdElem == null ? "" : principalIdElem.getText();
            {
              String permission = permissionElem == null ? null : permissionElem.getText();
              if ("cmis:all".equals(permission))
              {
                permissionSet = Permission.EDIT_SET;
              }
              else if ("cmis:read".equals(permission))
              {
                permissionSet = Permission.VIEW_SET;
              }
              else if ("snx:editor".equals(permission))
              {
                permissionSet = Permission.EDIT_SET;
              }
              else
              {
                permissionSet = Permission.EMPTY_SET;
              }
            }

            // If the ACE has the element "email", then this ACE should be an user.
            Element emailElem = principalElem.getExtension(Constants.QNAME_EMAIL);
            String type = emailElem != null ? Constants.MEMBER_TYPE_USER : Constants.MEMBER_TYPE_COMMUNITY;

            result.add(new ACE(principalId, permissionSet, type));
          }
        }

        return result;
      }
      else
      {
        if (LOGGER.isLoggable(Level.WARNING))
        {
          LOGGER.warning("[S2S call Response Code]: " + getMethod.getStatusCode());
          LOGGER.warning("[S2S call Response Body]: " + getMethod.getResponseBodyAsString());
        }

        RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOPERMISSION);
        rae.getData().put("libraryType", libraryType);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getAllACE failed");
      rae.getData().put("libraryType", libraryType);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getAllACE failed");
      rae.getData().put("libraryType", libraryType);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
        LOGGER.exiting(LCFilesCMISRepository.class.getName(), "getAllACE");
      }
    }

  }

  // private String getRoleString(Set<Permission> permissions)
  // {
  // Iterator<Permission> iter = permissions.iterator();
  // boolean hasEdit = false;
  // while (iter.hasNext())
  // {
  // Permission permission = iter.next();
  // if (permission == Permission.EDIT)
  // {
  // hasEdit = true;
  // break;
  // }
  // }
  // if (hasEdit)
  // {
  // return "snx:editor";
  // }
  // else
  // {
  // return "cmis:read";
  // }
  // }

  // private Entry createEntry(String docId, String title)
  // {
  // Entry result = Abdera.getNewFactory().newEntry();
  // result.setTitle(title);
  //
  // Factory factory = Abdera.getNewFactory();
  // ExtensibleElement propertiesElement = factory.newExtensionElement(Constants.QNAME_PROPERTIES);
  // ExtensibleElement objectElement = factory.newExtensionElement(Constants.QNAME_OBJECT);
  // objectElement.addExtension(propertiesElement);
  // result.addExtension(objectElement);
  //
  // {
  // ExtensibleElement nameElement = factory.newExtensionElement(Constants.QNAME_PROPERTY_STRING);
  // nameElement.setAttributeValue("propertyDefinitionId", "cmis:name");
  // nameElement.addExtension(Constants.QNAME_VALUE).setText(title);
  // propertiesElement.addExtension(nameElement);
  //
  // ExtensibleElement objIdElement = factory.newExtensionElement(Constants.QNAME_PROPERTY_ID);
  // objIdElement.setAttributeValue("propertyDefinitionId", "cmis:objectId");
  // objIdElement.addExtension(Constants.QNAME_VALUE).setText("snx:file!" + docId);
  // propertiesElement.addExtension(objIdElement);
  //
  // ExtensibleElement objTypeIdElement = factory.newExtensionElement(Constants.QNAME_PROPERTY_ID);
  // objTypeIdElement.setAttributeValue("propertyDefinitionId", "cmis:objectTypeId");
  // objTypeIdElement.addExtension(Constants.QNAME_VALUE).setText("snx:file");
  // propertiesElement.addExtension(objTypeIdElement);
  //
  // ExtensibleElement streamNameElement = factory.newExtensionElement(Constants.QNAME_PROPERTY_STRING);
  // streamNameElement.setAttributeValue("propertyDefinitionId", "cmis:contentStreamFileName");
  // streamNameElement.addExtension(Constants.QNAME_VALUE).setText(title);
  // propertiesElement.addExtension(streamNameElement);
  // }
  //
  // return result;
  // }
  public Iterator<IDocumentEntry> getSeedList(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    return super.getSeedList(timestamp, pageSize, actionEnum);
  }
}
