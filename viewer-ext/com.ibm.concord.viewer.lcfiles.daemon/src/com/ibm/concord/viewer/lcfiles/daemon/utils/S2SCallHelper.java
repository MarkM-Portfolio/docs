/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lcfiles.daemon.utils;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.lcfiles.daemon.config.ViewerDaemonConfig;
import com.ibm.misc.BASE64Decoder;
import com.ibm.misc.BASE64Encoder;

public class S2SCallHelper
{
  private static final Logger LOG = Logger.getLogger(S2SCallHelper.class.getName());

  public static final String CONFIG_S2S_NAME = "s2stoken";

  private static String code = null;

  private static String token;

  static
  {
    try
    {
      token = ViewerDaemonConfig.getInstance().getS2SToken();
      code = new BASE64Encoder().encode(token.getBytes());
      LOG.log(Level.FINE, "s2s token from News daemon to viewer server is initialized.");
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Unable to get s2s security token", e);
    }
  }

  public static String getToken()
  {
    return token;
  }

  public static String getEncodedToken()
  {
    return code;
  }
}
