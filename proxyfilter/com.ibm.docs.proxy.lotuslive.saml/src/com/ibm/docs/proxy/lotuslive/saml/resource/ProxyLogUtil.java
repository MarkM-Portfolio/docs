/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.proxy.lotuslive.saml.resource;

import java.text.MessageFormat;
import java.util.ResourceBundle;

public class ProxyLogUtil
{
  public static String get(String key, Object... parameters)
  {
    ResourceBundle resourceBundle = ResourceBundle.getBundle("com.ibm.docs.proxy.lotuslive.saml.resource.message");
    String msg = MessageFormat.format(resourceBundle.getString(key), parameters);
    if (msg == null)
    {
      msg = "missing key [" + key + "]";
    }
    return msg;
  }

  public static String get(String key)
  {
    ResourceBundle resourceBundle = ResourceBundle.getBundle("com.ibm.docs.proxy.lotuslive.saml.resource.message");
    String msg = resourceBundle.getString(key);
    if (msg == null)
    {
      msg = "missing key [" + key + "]";
    }
    return msg;
  }
}
