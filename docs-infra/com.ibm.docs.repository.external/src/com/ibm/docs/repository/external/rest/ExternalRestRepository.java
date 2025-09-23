/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.external.rest;

import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.httpclient.methods.multipart.ByteArrayPartSource;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.io.IOUtils;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.docs.common.oauth.OAuth2Helper;
import com.ibm.docs.common.util.Time;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.external.util.ConfigHelper;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import org.apache.commons.httpclient.methods.StringRequestEntity;

public class ExternalRestRepository implements IRepositoryAdapter
{
  private static final Logger LOG = Logger.getLogger(ExternalRestRepository.class.getName());

  private static final String URI_PATTERN = "{ID}";
  
  private static final String RESPONSE_KEY_CODE = "code";

  ConfigHelper configHelper;
  
  private JSONObject config;

  private void setRequestHeaders(HttpMethod method, UserBean requester, String docUri)
  {
    configHelper.setRequestHeaders(method, requester, docUri);
  }

  @Override
  public void init(JSONObject config)
  {
    this.config = config;
    LOG.log(Level.INFO, "Initial the configuration for ExternalRestRepository");
    configHelper = new ConfigHelper(config);
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    IDocumentEntry docEntry = null;

    String documentEntryUrl = configHelper.getServerMetaUrl().replace(URI_PATTERN, docUri);
    GetMethod getMethod = new GetMethod(documentEntryUrl);
    setRequestHeaders(getMethod, requester, docUri);

    try
    {
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, getMethod, state);
      int nHttpStatus = getMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        InputStream is = getMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          docEntry = new RestDocumentEntry(configHelper.getRepoId(), this.getRepoType(), configHelper.getRepoHomeUrl(), responseObj);
        }
        else
        {
          LOG.log(Level.WARNING, "Returned stream is null when get meta for: " + docUri);
        }
      }
      else
      {
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
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
  public IDocumentEntry getDocument(String docUri) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("REST repository desn't support getDocument without UserBean.");
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return getContentStream(requester, docEntry, true);
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();
    String documentMediaUrl = configHelper.getServerGetUrl().replace(URI_PATTERN, docUri);

    InputStream is = null;
    GetMethod getMethod = new GetMethod(documentMediaUrl);
    setRequestHeaders(getMethod, requester, docEntry.getDocUri());
    Time time = new Time();
    boolean release = false;
    try
    {
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, getMethod, state);
      if (HttpStatus.SC_OK == getMethod.getStatusCode())
      {
        is = new AutoReleaseHttpConnectionInputStream(getMethod.getResponseBodyAsStream(), getMethod);
      }
      else
      {
        RepositoryAccessException rae = processError(getMethod);
        rae.getData().put("docUri", docUri);
        release = true;
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("getContentStream failed");
      rae.getData().put("docUri", docUri);
      release = true;
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      RepositoryAccessException rae = processError(getMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
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
    LOG.info("It takes " + time.ellapse() + " ms to get the content of " + docUri);
    LOG.exiting(ExternalRestRepository.class.getName(), "getContentStream");
    return is;
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, null);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, is, versionSummary, null);
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary)
      throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle());
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    return setContentStream(requester, docEntry, media.getStream(), versionSummary, media.getTitle());
  }

  @Override
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary, String docLabel)
      throws RepositoryAccessException
  {    
    LOG.entering(ExternalRestRepository.class.getName(), "setContentStream", new Object[]{requester.getId(), docEntry.getDocUri(), docLabel});
    String docUri = docEntry.getDocUri();
    String documentMediaUri = configHelper.getServerSetUrl().replace(URI_PATTERN, docUri);

    PostMethod postMethod = new PostMethod(documentMediaUri);
    setRequestHeaders(postMethod, requester, docEntry.getDocUri());
    IDocumentEntry newDocEntry = null;
    Time time = new Time();
    try
    {
      byte[] bytes = IOUtils.toByteArray(is);
      Part[] parts = new Part[] { new FilePart(docLabel, new ByteArrayPartSource(docLabel, bytes)) };
      MultipartRequestEntity entity = new MultipartRequestEntity(parts, postMethod.getParams());
      postMethod.setRequestEntity(entity);

      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, postMethod, state);
      LOG.info("It takes " + time.ellapse() + " ms to update the content of " + docUri);
      int status = postMethod.getStatusCode();
      if (HttpStatus.SC_OK == status || // 200
          HttpStatus.SC_CREATED == status || // 201
          HttpStatus.SC_ACCEPTED == status || // 202
          HttpStatus.SC_NON_AUTHORITATIVE_INFORMATION == status || // 203
          HttpStatus.SC_NO_CONTENT == status || // 204
          HttpStatus.SC_RESET_CONTENT == status || // 205
          HttpStatus.SC_PARTIAL_CONTENT == status) // 206
      {
        InputStream ris = postMethod.getResponseBodyAsStream();
        String content = IOUtils.toString(ris);
        if(LOG.isLoggable(Level.FINER))
        {
          LOG.log(Level.FINER, "the content of response body is " + content);              
        }
        JSONObject responseObj = JSONObject.parse(content);
        JSONArray jsonArray = (JSONArray) responseObj.get("entries");
        JSONObject json = (JSONObject) jsonArray.get(0);

        IDocumentEntry repoDocEntry = docEntry.getRepoDocEntry();
        String newFileName = null;
        if (repoDocEntry != null && repoDocEntry instanceof RestDocumentEntry)
        {
          ((RestDocumentEntry) repoDocEntry).update(json);
          newFileName = repoDocEntry.getTitleWithExtension();
          newDocEntry = docEntry;
        }
        else if (docEntry instanceof RestDocumentEntry)
        {
          ((RestDocumentEntry) docEntry).update(json);
          newFileName = docEntry.getTitleWithExtension();
          newDocEntry = docEntry;
        }
        else
        {
          LOG.log(Level.WARNING, "docEntry: {0} is not instanceof RestDocumentEntry!!!", new Object[] { docEntry.getDocUri() });
        }
        if(newFileName != null && !docLabel.equalsIgnoreCase(newFileName))
        {
          newDocEntry = renameDocument(requester, docEntry, docLabel);
        }
        return newDocEntry;
      }
      else
      {
        LOG.log(Level.SEVERE, "failed to update document content for " + docUri + " with status code " + status);
        RepositoryAccessException exp = processError(postMethod);
        exp.getData().put("docUri", docUri);
        throw exp;
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "failed to update document content for " + docUri, e);
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail(rae.getErrMsg());
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    catch (CustomAuthClientRuntimeException e)
    {
      LOG.log(Level.SEVERE, "failed to update document content for " + docUri, e);
      RepositoryAccessException rae = processError(postMethod);
      rae.initCause(e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
      LOG.exiting(ExternalRestRepository.class.getName(), "setContentStream", new Object[]{requester.getId(), docEntry.getDocUri(), docLabel});
    }
  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is)
      throws RepositoryAccessException
  {
    return createDocument(requester, folderUri, folderType, docLabel, is, null, null, null);
  }

  @Override
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is,
      Boolean isExternal, Boolean propagate, MediaOptions options) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("REST repository doesn't support createDocument.");
  }

  @Override
  public IDocumentEntry setIBMdocsType(UserBean requester, IDocumentEntry docEntry, boolean createVersion) throws RepositoryAccessException
  {
    return docEntry;
  }

  @Override
  public void deleteDocument(UserBean requester, String docUri) throws RepositoryAccessException
  {
    throw new UnsupportedOperationException("REST repository doesn't support deleteDocument.");
  }

  @Override
  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException
  {  
    String docUri = docEntry != null ? docEntry.getDocUri() : null;
    if (docUri == null || newLabel == null)
    {
      throw new NullPointerException();
    }

    IDocumentEntry newDocEntry = null;  
    
    String documentEntryUrl = configHelper.getServerMetaUrl().replace(URI_PATTERN, docUri);
    PutMethod putMethod = new PutMethod(documentEntryUrl);
    
    try
    {
      
      JSONObject jsonObject = new JSONObject();
      jsonObject.put("name", newLabel);                   
      StringRequestEntity requestEntity = new StringRequestEntity(
          jsonObject.toString(),
          "application/json",
          "UTF-8");      
      putMethod.setRequestEntity(requestEntity);    
      
      setRequestHeaders(putMethod, requester, docUri);
      
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, putMethod, state);
      int nHttpStatus = putMethod.getStatusCode();

      if (HttpStatus.SC_OK == nHttpStatus)
      {         
        InputStream is = putMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          newDocEntry = new RestDocumentEntry(configHelper.getRepoId(), this.getRepoType(), configHelper.getRepoHomeUrl(), responseObj);
        }
        else
        {
          LOG.log(Level.WARNING, "Returned stream is null when rename: " + docUri);
        }       
        
      }
      else if (HttpStatus.SC_CONFLICT == putMethod.getStatusCode())
      {
        RepositoryAccessException rae = processError(putMethod);
        if ("item_name_in_use".equals(rae.getRepoErrCode()))
        {
          int count = 1;
          int i = newLabel.lastIndexOf('.');
          int j = newLabel.lastIndexOf('_');
          if (i > j && j > 0 && Pattern.matches("\\d+", newLabel.substring(j + 1, i)))
          {
            count = Integer.valueOf(newLabel.substring(j + 1, i)) + 1;
            newLabel = newLabel.substring(0, j) + newLabel.substring(i);
          }

          String adjustLabel = newLabel;
          String suffix = "_" + count + "." + extractExt(newLabel);
          int lenSuffix = suffix.getBytes().length;
          adjustLabel = trimExt(newLabel);
          if (adjustLabel.getBytes().length + lenSuffix > 252)
            adjustLabel = adjustLabel.substring(0, adjustLabel.length() - ("_" + count).length()) + suffix;
          else
            adjustLabel = adjustLabel + suffix;

          return renameDocument(requester, docEntry, adjustLabel);
        }
        else
        {
          rae.getData().put("docUri", docEntry.getDocUri());
          rae.getData().put("newLabel", newLabel);
          throw rae;
        }
      }
      else
      {
        RepositoryAccessException rae = processError(putMethod);
        rae.getData().put("docUri", docEntry.getDocUri());
        rae.getData().put("newLabel", newLabel);
        throw rae;
      }
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(e);
      rae.setDefaultErrDetail("rename document failed");
      rae.getData().put("docUri", docEntry.getDocUri());
      rae.getData().put("newLabel", newLabel);
      throw rae;
    }
    finally
    {
      if (putMethod != null)
      {
        putMethod.releaseConnection();
      }
    }

    return newDocEntry;    
  }

  @Override
  public IDocumentEntry lockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return docEntry;
  }

  @Override
  public IDocumentEntry unlockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return docEntry;
  }

  @Override
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    throw new UnsupportedOperationException("REST repository doesn't support log event.");
  }

  @Override
  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException
  {    
    PostMethod promoteVerionMethod = null;    

    try
    {      
      
      String promoteVerionUrl = configHelper.getServerMetaUrl().replace(URI_PATTERN, docUri) + "/versions/current";
      promoteVerionMethod = new PostMethod(promoteVerionUrl);
      
      JSONObject jsonObject = new JSONObject();
      jsonObject.put("type", "file_version");
      jsonObject.put("id", versionId);               
      StringRequestEntity requestEntity = new StringRequestEntity(
          jsonObject.toString(),
          "application/json",
          "UTF-8");      
      promoteVerionMethod.setRequestEntity(requestEntity);
      
      setRequestHeaders(promoteVerionMethod, requester, docUri);      
      
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, promoteVerionMethod, state);
      int nHttpStatus = promoteVerionMethod.getStatusCode();         
      if (201 != nHttpStatus)
      {                
        RepositoryAccessException rae = processError(promoteVerionMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }      
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (promoteVerionMethod != null)
      {
        promoteVerionMethod.releaseConnection();
      }    
    }

    LOG.exiting(ExternalRestRepository.class.getName(), "restoreVersion");  
        
    return getDocument(requester, docUri);
  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {    
    
    Vector<IDocumentEntry> result = new Vector<IDocumentEntry>();
    
    String docUri = docEntry.getDocUri();    
    
    GetMethod getDocMethod = null;
    GetMethod getVersionMethod = null;

    try
    {
      String documentEntryUrl = configHelper.getServerMetaUrl().replace(URI_PATTERN, docUri);
      getDocMethod = new GetMethod(documentEntryUrl);
      setRequestHeaders(getDocMethod, requester, docUri);    
      
      JSONObject docInforesponseObj = null;
      HttpState state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, getDocMethod, state);
      int nHttpStatus = getDocMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        InputStream is = getDocMethod.getResponseBodyAsStream();
        if (is != null)
        {
          docInforesponseObj = JSONObject.parse(is);                 
        }
        else
        {
          LOG.log(Level.WARNING, "Returned stream is null when get meta for: " + docUri);          
        }
      }
      else
      {        
        RepositoryAccessException rae = processError(getDocMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }         
      
      result.add(new RestVersionDocumentEntry(configHelper.getRepoId(), this.getRepoType(), configHelper.getRepoHomeUrl(), docInforesponseObj));
      
      String documentEntryVersionUrl = configHelper.getServerMetaUrl().replace(URI_PATTERN, docUri) + "/versions";
      getVersionMethod = new GetMethod(documentEntryVersionUrl);
      setRequestHeaders(getVersionMethod, requester, docUri);   
      
      state = new HttpState();
      configHelper.getHttpClient().executeMethod(null, getVersionMethod, state);
      nHttpStatus = getVersionMethod.getStatusCode();
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        InputStream is = getVersionMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          JSONArray entries = (JSONArray) responseObj.get("entries");
          for( int i = 0; i < entries.size(); i++ )
          {
            RestVersionDocumentEntry versionDocEntry = new RestVersionDocumentEntry(configHelper.getRepoId(), this.getRepoType(),configHelper.getRepoHomeUrl(), docInforesponseObj);            
            JSONObject versionEntry = (JSONObject) entries.get(i);
            versionDocEntry.updateVersion(versionEntry);            
            result.add(versionDocEntry);
          }          
        }
        else
        {
          LOG.log(Level.WARNING, "Returned stream is null when get meta for: " + docUri);          
        }
      }
      else
      {
        RepositoryAccessException rae = processError(getVersionMethod);
        rae.getData().put("docUri", docUri);
        throw rae;
      }      
    }
    catch (IOException e)
    {
      RepositoryAccessException rae = new RepositoryAccessException(RepositoryAccessException.EC_REPO_CANNOT_FILES, e);
      rae.getData().put("docUri", docUri);
      throw rae;
    }
    finally
    {
      if (getVersionMethod != null)
      {
        getVersionMethod.releaseConnection();
      }
      
      if (getVersionMethod != null)
      {
        getVersionMethod.releaseConnection();
      }      
    }

    LOG.exiting(ExternalRestRepository.class.getName(), "getVersions");    
    return result.toArray(new IDocumentEntry[] {});
  }

  @Override
  public void addACE(UserBean requester, IDocumentEntry docEntry, ACE anACE) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub

  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IDocumentEntry[] getOwnedDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IDocumentEntry[] getPermissiveDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Iterator<IDocumentEntry> getSeedList(String since, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
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

  @Override
  public String getFolderUri(UserBean caller, String communityUuid) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public JSONObject getConfig()
  {
    return config;
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
      JSONObject responseObj = JSONObject.parse(errorBody);
      errorCode = (String) responseObj.get(RESPONSE_KEY_CODE);
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "[S2S call Response Body]: {0} {1} {2}", new Object[] { errorBody, ex.getMessage(), ex });
    }
    finally
    {

    }

    RepositoryAccessException rae = new RepositoryAccessException(nErrorCode, errorCode, errorMsg);
    rae.setStatusCode(nErrorCode);
    return rae;
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

  @Override
  public String getRepoType()
  {
    if( config.containsKey("repo_type") )
    {
      return config.get("repo_type").toString();
    }
    return RepositoryConstants.REPO_TYPE_EXTERNAL_REST;
  }

  @Override
  public void processLeaveData(UserBean user, String repoId, String docId, JSONObject data)
  {
    OAuth2Helper helper = null;
    String helperID = "oauth2helper" + "@" + docId;
    LOG.log(Level.FINEST, "process leave data for " + docId);
    if (user != null) {        
      helper = (OAuth2Helper) user.getObject(helperID);      
    }
    if (helper != null) {
      LOG.log(Level.FINEST, "find OAuth2Helper instance to delete token:" + helperID);
      helper.deleteToken();
      user.setObject(helperID, null);
    }
  }

  @Override
  public void notifyServerEvent(JSONObject msg)
  {
    String url = configHelper.getNotificationUrl();
    if( url != null )
    {      
      try
      {
        PostMethod postMethod = new PostMethod(url);           
        StringRequestEntity requestEntity;
        String msgString = msg.toString();
        LOG.log(Level.FINE, "Start nofity message: " + msgString);
        requestEntity = new StringRequestEntity(
            msgString,
            "application/json",
            "UTF-8");
        postMethod.setRequestEntity(requestEntity);        
        setRequestHeaders(postMethod, null, null);        
        HttpState state = new HttpState();
        configHelper.getHttpClient().executeMethod(null, postMethod, state);          
        int nHttpStatus = postMethod.getStatusCode();
        if (HttpStatus.SC_OK != nHttpStatus)
        {
          LOG.log(Level.FINE, "Post notification message failed!. Http status code: " + String.valueOf(nHttpStatus));
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Post notification message failed!. With Exception. ", e);
      }       
    }

  }
}
