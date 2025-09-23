/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.auth;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpMessage;

import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.spi.exception.AuthenticationException;
import com.ibm.docs.framework.IComponent;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;

public class S2SCallHelper
{
  private static final Logger LOG = Logger.getLogger(S2SCallHelper.class.getName());

  private static final String CONFIG_S2S = "s2s_token";

  public static final String CONFIG_S2S_NAME = "token";
  
  private static final String SERVICE_NAME = "conversionService";

  private static String code;

  static
  {
    try
    {
      IComponent component = Platform.getComponent(ConversionComponentImpl.COMPONENT_ID);
      JSONObject serviceCfg = (JSONObject)component.getConfig().get(SERVICE_NAME);
      String value = (String)serviceCfg.get(CONFIG_S2S);
      code = new BASE64Encoder().encode(value.getBytes());
      LOG.info("s2s token from docs to conversion server is " + code);
    }
    catch (Exception e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.S2S_CALL_CONFIG_ERROR, "Unable to get s2s security token", e);
    }
  }

  /**
   * @deprecated
   */
  public void setToken(HttpMessage msg) throws AuthenticationException
  {
    if (code != null)
    {
      msg.setHeader(CONFIG_S2S_NAME, code);
    }
    else
    {
      LOG.severe("Unable to set s2s call auth token");
      throw new AuthenticationException("Unable to set s2s call auth token");
    }
  }
  
  public static String getToken()
  {
    return code;
  }
}
