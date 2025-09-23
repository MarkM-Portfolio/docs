/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.external.repository.rest;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.StringPart;

import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.docs.viewer.external.util.ConfigHelper;
import com.ibm.json.java.JSONObject;


public class ExternalRestRepository implements IRepositoryAdapter
{
  private static final Logger LOG = Logger.getLogger(ExternalRestRepository.class.getName());

  private static final String URI_PATTERN = "{ID}";
  
  private static final String LARGE_THUMBNAIL_NAME = "tl_image";

  ConfigHelper configHelper;

  protected void setRequestHeaders(HttpMethod method, UserBean requester, String docUri, JSONObject config)
  {
    configHelper.setRequestHeaders(method, requester, docUri, config);
  }

  @Override
  public void init(JSONObject config)
  {
    LOG.log(Level.INFO, "Initial the configuration for ExternalRestRepository");
    configHelper = new ConfigHelper(config);
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mine) throws RepositoryAccessException
  {
    IDocumentEntry docEntry = null;
    GetMethod getMethod = null;

    try
    {
      String documentEntryUrl = configHelper.getServerMetaUrl().replace(URI_PATTERN, URLEncoder.encode(docUri, "UTF-8"));
      getMethod = new GetMethod(documentEntryUrl);
      setRequestHeaders(getMethod, requester, docUri, null);
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, getMethod, state);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        InputStream is = getMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          docEntry = new RestDocumentEntry(configHelper.getRepoId(), this.getRepositoryType(), configHelper.getRepoHomeUrl(), responseObj);
        }
        else
        {
          LOG.log(Level.WARNING, "Returned stream is null when get meta for: " + docUri);
        }
      }
      else
      {
        RepositoryAccessException rae = processError(getMethod);
        throw rae;
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "getDocument encountered error: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      LOG.log(Level.WARNING, "getDocument encountered error: " + e);
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      throw rae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOG.exiting(ExternalRestRepository.class.getName(), "getDocument");
    return docEntry;
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();

    InputStream is = null;
    GetMethod getMethod = null;
    boolean release = false;
    try
    {
      String documentMediaUrl = configHelper.getServerGetUrl().replace(URI_PATTERN, URLEncoder.encode(docUri, "UTF-8"));
      getMethod = new GetMethod(documentMediaUrl);
//      JSONObject headerConfig = new JSONObject();
//      headerConfig.put(OAuth2Helper.ADMIN_ROLE, "true");
//      setRequestHeaders(getMethod, requester, docEntry.getDocUri(), headerConfig);
//      getMethod.setRequestHeader("token", "toscana");
      setRequestHeaders(getMethod, requester, docEntry.getDocUri(), null);
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, getMethod, state);
      if (HttpStatus.SC_OK == getMethod.getStatusCode())
      {
        is = new AutoReleaseHttpConnectionInputStream(getMethod.getResponseBodyAsStream(), getMethod);
      }
      else
      {
        RepositoryAccessException rae = processError(getMethod);
        // rae.getData().put("docUri", docUri);
        release = true;
        throw rae;
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "getContentStream encountered error: " + e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      release = true;
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
    	LOG.log(Level.WARNING, "getContentStream encountered error: " + e);
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      release = true;
      throw rae;
    }
    finally
    {
      if (release)
      {
        getMethod.releaseConnection();
      }
    }
    LOG.exiting(ExternalRestRepository.class.getName(), "getContentStream");
    return is;
  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public boolean impersonationAllowed()
  {
    // TODO Auto-generated method stub
    return false;
  }

  protected RepositoryAccessException processError(HttpMethod httpMethod)
  {
    int status = httpMethod.getStatusCode();
    if (LOG.isLoggable(Level.WARNING))
    {
      LOG.log(Level.WARNING, "[S2S call Response Code]: {0}", status);
    }

    int nErrorCode = RepositoryAccessException.EC_REPO_CANNOT_FILES;
    if (status == HttpStatus.SC_UNAUTHORIZED || status == HttpStatus.SC_FORBIDDEN) {
      nErrorCode = RepositoryAccessException.EC_REPO_NOPERMISSION;
    }
    String errorCode = "";
    String errorMsg = "";
    String errorBody = "";
    try
    {
      errorBody = httpMethod.getResponseBodyAsString();
      if (LOG.isLoggable(Level.WARNING))
      {
        LOG.log(Level.WARNING, "[S2S call Response Body]: {0}", errorBody);
      }
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "[S2S call Response Body]: {0} {1} {2}", new Object[] { errorBody, ex.getMessage(), ex });
    }
    finally
    {

    }

    RepositoryAccessException rae = new RepositoryAccessException(nErrorCode, errorCode, errorMsg);
    // rae.setStatusCode(nErrorCode);
    return rae;
  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub

  }

  @Override
  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getFilesPath()
  {
    return null;    
  }

  @Override
  public JSONObject getRepositoryConfig()
  {
    throw new UnsupportedOperationException();
  }
  
  @Override
  public boolean isCacheEncrypt()
  {
    // TODO Auto-generated method stub
    return false;
  }


  @Override
  public String getCacheHome()
  {
    return configHelper.getCacheHome();
  }

  @Override
  public String getSharedDataName()
  {
    return configHelper.getSharedDataName();
  }

  @Override
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    throw new UnsupportedOperationException("REST repository doesn't support log event.");
  }
  
  @Override
  public void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException
  {    
    LOG.log(Level.INFO, "Set thumbnail for : " + docUri);    
    
    String repoId = this.configHelper.getRepoId();
    
    ThumbnailDescriptor desp = new ThumbnailDescriptor(docUri, lastMod, repoId);
    
    
    PostMethod postMethod = null; 
    try
    {
      String documentEntryUrl = configHelper.getThumbnailSetUrl().replace(URI_PATTERN, URLEncoder.encode(docUri, "UTF-8"));
      postMethod = new PostMethod(documentEntryUrl);
      HttpState state = new HttpState();
//      JSONObject headerConfig = new JSONObject();
//      headerConfig.put(OAuth2Helper.ADMIN_ROLE, "true");
//      setRequestHeaders(postMethod, requester, docUri, headerConfig);
//      postMethod.setRequestHeader("token", "toscana");
      setRequestHeaders(postMethod, requester, docUri, null);
      FileFilter thumbnalFilter = new FileFilter()
      {
        public boolean accept(File file)
        {
          if (file.getName().contains(LARGE_THUMBNAIL_NAME))
          {
            return true;
          }
          return false;
        }
      };
      File[] thumbnails = new File(desp.getThumbnailServiceURI()).listFiles(thumbnalFilter);
      
      if (thumbnails.length == 0)
      {
        throw new IOException("Can not find thumbnail image file for " + docUri);
      }      
      
      Part[] parts = {
          new StringPart("Content-Disposition", "form-data"),
          new StringPart("Content-Type", "image/jpg"),
          new StringPart("X-Thumbnail-Size", "large"),
          new StringPart("X-Thumbnail-Width", "500"),
          new StringPart("X-Thumbnail-Height", "375"),
          new FilePart("file", thumbnails[0])
      };      
      MultipartRequestEntity reqEntity = new MultipartRequestEntity(parts, postMethod.getParams());
      
      postMethod.setRequestEntity(reqEntity);      
      postMethod.addRequestHeader("Content-Type", reqEntity.getContentType());
      
      configHelper.getHttpClient().executeMethod(null, postMethod, state);
      
      int status = postMethod.getStatusCode();
      
      if (status >= 400) {
        String errorBody = postMethod.getResponseBodyAsString();
        LOG.log(Level.WARNING, "Post thumbnail method status code : " + String.valueOf(status) + ", error message : " + errorBody);
      }
    }
    catch (IOException e)
    {      
      LOG.log(Level.WARNING, "setThumbnail encountered error: " + e);
    }
    finally
    {
      if (postMethod != null)
        postMethod.releaseConnection();
    }
  }
  
  @Override
  public String getRepositoryType()
  {
    String repoType = configHelper.getRepoType();
    return repoType != null ? repoType : RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE;
  }    
}
