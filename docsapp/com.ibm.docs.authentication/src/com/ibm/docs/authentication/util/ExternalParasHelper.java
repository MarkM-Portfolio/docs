package com.ibm.docs.authentication.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.docs.common.util.RequestParser;

public class ExternalParasHelper
{ 
  private static final Logger LOG = Logger.getLogger(ExternalParasHelper.class.getName());  
  
  public static final String STATE_SEPARATOR = "-";
  
  public static final String REPOSITORY = "repository";
  
  public static final String FILE_ID = "file_id";
  
  public static final String OAUTH = "oauth2";
  
  public static final String CODE = "code";
  
  public static final String STATE = "state";
  
  public static final String EDIT = "edit";
  
  public static final String ATTR_ERROR_CODE = "error_code";
  
  public static int EC_REPO_NOPERMISSION = 1000; //RepositoryAccessException.EC_REPO_NOPERMISSION
  
  public static int EC_REPO_NOEDITPERMISSION = 1002; //RepositoryAccessException.EC_REPO_NOEDITPERMISSION
  
  public static String[] getRepoAndFile(HttpServletRequest request)
  {    
    String repoAndFile[] = new String[] {null, null};
    String file = request.getParameter(STATE);
    if (file != null) {
      LOG.log(Level.INFO, "Got the parameter 'state' : " + file);
      try
      {
        file = URLDecoder.decode(file, "UTF-8");
      }
      catch (UnsupportedEncodingException e)
      {
        LOG.log(Level.SEVERE, "Error to decode string: ", e);
      }
      catch (Exception e) {
        LOG.log(Level.SEVERE, "Error to decode string: ", e);
      }
      
      int index = file.indexOf(STATE_SEPARATOR);
      if (index > 0) {
        repoAndFile[0] = file.substring(0, index);
        repoAndFile[1] = file.substring(index+1);
        LOG.log(Level.INFO, "Got the repository id: {0} and file id: {1} from request parameter 'state'.", repoAndFile);
      }
      else {
        LOG.log(Level.WARNING, "Incorrect state: " + file);
      }
      return repoAndFile;
    }
       
    String fileId = request.getParameter(FILE_ID);
    String repoId = request.getParameter(REPOSITORY);
    if (fileId != null && repoId != null) {
      repoAndFile[0] = repoId;
      repoAndFile[1] = fileId;
      LOG.log(Level.INFO, "Got the repository id: {0} and file id: {1} from request parameter 'repository' and 'file_id'.", repoAndFile);
      return repoAndFile;
    }
    
    RequestParser requestParser = new RequestParser(request);        
    fileId = requestParser.getDocUri();
    repoId = requestParser.getRepoId();
    String actionType = requestParser.getActionType();
    if (EDIT.equalsIgnoreCase(actionType)) {
      if (fileId != null && repoId != null) {
        repoAndFile[0] = repoId;
        repoAndFile[1] = fileId;
        LOG.log(Level.INFO, "Got the repository id: {0} and file id: {1} from request parser.", repoAndFile);
        return repoAndFile;
      }
    }
    
    return repoAndFile;
  }
  
  public static String getOAuthCode(HttpServletRequest request)
  {
    String authCode = request.getParameter(CODE);
    if (authCode != null)
    {
      LOG.log(Level.INFO, "Got OAuth2 code from request parameters: " + CODE);
      return authCode;
    }
    else
    {
      authCode = request.getHeader(CODE);
      if (authCode != null)
      {
        LOG.log(Level.INFO, "Got OAuth2 code from request header: " + CODE);
        return authCode;
      }
    }

    LOG.log(Level.FINEST, "Did not get OAuth2 code!");
    return null;
  }
}
