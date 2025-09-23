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
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.InputStreamRequestEntity;
import org.apache.commons.httpclient.methods.PutMethod;

import com.ibm.concord.viewer.lc3.Constants;
import com.ibm.concord.viewer.lc3.util.URLGenerater;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.json.java.JSONObject;

public class LCFilesCMISRepository extends LCFilesQCSRepository
{
  private static final Logger LOGGER = Logger.getLogger(LCFilesCMISRepository.class.toString());

  private String cmisContextRoot;

  public LCFilesCMISRepository()
  {
    super();
  }

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
   * Delegate call to LCFilesQCSRepository, since we need to leverage QCS to query user-doc-permission, and further adopting impersonation.
   * 
   * Query resource permission is not mandatory part of CMIS, so may need to deep dive into Lotus Connections CMIS service to know if any
   * extension to CMIS could be used as the base of this interface implementation.
   */
  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    return super.getDocument(requester, docUri);
  }

  /**
   * FIXME, Need to investigate why below commented out implementation does not work, later.
   */
  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {
    super.addACE(requester, docUri, anACE);
  }

  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return super.getContentStream(requester, docEntry);
  }

  public IDocumentEntry setContentStream(UserBean requester, String docUri, InputStream is) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesCMISRepository.class.getName(), (new StringBuilder()).append("setContentStream[uid: ").append(requester.getId())
        .append(", orgId: ").append(requester.getOrgId()).append(", docId: ").append(docUri).append("]").toString());

    if (requester == null || docUri == null || is == null)
    {
      throw new NullPointerException();
    }

    HttpClient client = getHttpClient();
    PutMethod putMethod = null;

    int index = docUri.indexOf(IDocumentEntry.DOC_URI_SEP);
    String libId = docUri.substring(0, index);
    String docId = docUri.substring(index + 1);

    String documentMediaUri = URLGenerater.CMIS.generateUploadMediaAsReplaceURL(serverUrl.toString(), cmisContextRoot, libId, docId);

    putMethod = new PutMethod(documentMediaUri);
    setRequestHeaders(putMethod, requester);
    putMethod.setContentChunked(false);
    putMethod.setRequestEntity(new InputStreamRequestEntity(is));

    try
    {
      client.executeMethod(putMethod);
      int statusCode = putMethod.getStatusCode();
      if (HttpStatus.SC_OK == statusCode)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(false);
        Entry entryDocument = (Entry) new FOMParser().parse(putMethod.getResponseBodyAsStream(), ro).getRoot();
        return new DocumentEntry(repoId, entryDocument, null);
      }
      else
      {
        if (LOGGER.isLoggable(Level.WARNING))
        {
          LOGGER.warning("[S2S call Response Code]: " + putMethod.getStatusCode());
        }

        throw new RepositoryAccessException(statusCode);
      }
    }
    catch (HttpException e)
    {
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      throw new RepositoryAccessException(e);
    }
    finally
    {
      if (putMethod != null)
      {
        putMethod.releaseConnection();
      }
    }
  }

  /**
   * 
   * @param requester
   * @param type
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
  private String adjustTitle(UserBean requester, String type, String folderUri, String title) throws RepositoryAccessException
  {
    int count = 1;
    String adjustLabel = title;
    while (checkFileExist(requester, type, folderUri, adjustLabel))
    {
      String suffix = "_" + count + "." + extractExt(title);
      int lenSuffix = suffix.length();
      adjustLabel = trimExt(title);
      if (adjustLabel.length() + lenSuffix > 252)
        adjustLabel = adjustLabel.substring(0, 251 - lenSuffix) + suffix;
      else
        adjustLabel = adjustLabel + suffix;
      count++;
    }
    return adjustLabel;
  }

  /**
   * 
   * @param caller
   * @param type
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
  private boolean checkFileExist(UserBean caller, String folderType, String folderUri, String docLabel) throws RepositoryAccessException
  {
    LOGGER.entering(LCFilesCMISRepository.class.getName(), (new StringBuilder()).append("checkFileExist[uid: ").append(caller.getId())
        .append(", orgId: ").append(caller.getOrgId()).append(", docLabel: ").append(docLabel).append("]").toString());

    HttpClient client = getHttpClient();
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
        try
        {
          FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
          ro.setFilterRestrictedCharacters(false);
          Entry entryDocument = (Entry) new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro).getRoot();
          String fileName = entryDocument.getTitle();
          if (fileName.equals(docLabel))
          {
            return true;
          }
          else
          {
            return false;
          }
        }
        catch (Exception e)
        {
          return false;
        }
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

        throw new RepositoryAccessException(statusCode);
      }
    }
    catch (HttpException e)
    {
      LOGGER.log(Level.SEVERE, "checkFileExist failed. {0} {1} {2} {3}", new Object[] { folderType, folderUri, docLabel, e });
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "checkFileExist failed. {0} {1} {2} {3}", new Object[] { folderType, folderUri, docLabel, e });
      throw new RepositoryAccessException(e);
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

  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    return super.getVersions(requester, docUri);
  }

  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    if (!(docEntry instanceof DocumentEntry))
      LOGGER.entering(LCFilesCMISRepository.class.getName(), "getAllACE", new Object[] { requester.getId(), docEntry.getDocUri() });

    if (!(docEntry instanceof DocumentEntry))
    {
      throw new IllegalArgumentException("The input parameter 'docEntry' is not valid.");
    }

    String docUri = docEntry.getDocUri();
    String libraryType = ((DocumentEntry) docEntry).getLibraryType();

    // Get the ACE for personal file through QCS APIs, do not support to get ACE for communities file through QCS APIs.
    if (Constants.LIB_TYPE_PERSONAL.equalsIgnoreCase(libraryType))
    {
      Vector<ACE> acl = super.getAllACE(requester, docEntry);
      LOGGER.exiting(LCFilesCMISRepository.class.getName(), "getAllACE");
      return acl;
    }

    // Get the ACE for communities file through CMIS APIs.
    Vector<ACE> result = new Vector<ACE>();

    HttpClient client = getHttpClient();
    GetMethod getMethod = null;

    String[] docIds = DocumentEntry.tokens(docUri);
    String libId = docIds[0];
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

        throw new RepositoryAccessException(statusCode);
      }
    }
    catch (HttpException e)
    {
      LOGGER.log(Level.SEVERE, "getAllACE failed. {0} {1} {2}", new Object[] { libraryType, docUri, e });
      throw new RepositoryAccessException(e);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "getAllACE failed. {0} {1} {2}", new Object[] { libraryType, docUri, e });
      throw new RepositoryAccessException(e);
    }
    catch (CustomAuthClientRuntimeException e)
    {
      LOGGER.log(Level.SEVERE, "getAllACE failed. {0} {1} {2}", new Object[] { libraryType, docUri, e });
      throw new RepositoryAccessException(e);
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

  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    return super.find(timestamp, pageSize, actionEnum);
  }
}
