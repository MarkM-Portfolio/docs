package com.ibm.docs.viewer.external.util;


import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.platform.util.ViewerUtil;

public class ExternalParasHelper
{ 
  private static final Logger LOG = Logger.getLogger(ExternalParasHelper.class.getName());
  
  public static final String EXTERNAL_AUTH_KEY = "external.cmis";
  
  public static final String EXTERNAL_AUTH_REST = "external.rest";
  
  public static final String STATE_SEPARATOR = "-";
  
  public static final String REPOSITORY = "repository";
  
  public static final String FILE_ID = "file_id";
  
  public static final String OAUTH = "oauth2";
  
  public static String CODE_KEY = "code";
  
  public static final String STATE = "state";
  
  public static final String EDIT = "edit";
  
  public static final String ATTR_ERROR_CODE = "error_code";
  
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
        LOG.log(Level.FINE, "Got the repository id: {0} and file id: {1} from request parameter 'state'.", repoAndFile);
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
    
    repoAndFile = ViewerUtil.getRepoAndFile(request);        
    if (repoAndFile[0] != null && repoAndFile[1] != null)
    {
      LOG.log(Level.INFO, "Got the repository id: {0} and file id: {1} from request parser.", repoAndFile);
      return repoAndFile;
    }
    else{
      LOG.severe("Failed to get fileId and repoId!");
    }
    return repoAndFile;
  }
  
  public static String getOAuthCode(HttpServletRequest request)
  {
    String authCode = request.getParameter(CODE_KEY);
    if (authCode != null)
    {
      LOG.log(Level.INFO, "Got OAuth2 code from request parameters: " + CODE_KEY);
      return authCode;
    }
    else
    {
      authCode = request.getHeader(CODE_KEY);
      if (authCode != null)
      {
        LOG.log(Level.INFO, "Got OAuth2 code from request header: " + CODE_KEY);
        return authCode;
      }
    }

    return null;
  }
}