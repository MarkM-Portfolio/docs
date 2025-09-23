/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */

package com.ibm.docs.im.installer.vfeature.internal;

import java.util.MissingResourceException;
import java.util.ResourceBundle;
import org.eclipse.osgi.util.NLS;
import com.ibm.docs.im.installer.common.util.ProductNameMap;
import com.ibm.docs.im.installer.common.util.StringTemplate;


public class Messages
{
  private static final String BUNDLE_NAME = "com.ibm.docs.im.installer.vfeature.internal.messages"; //$NON-NLS-1$

  private static final ResourceBundle RESOURCE_BUNDLE = ResourceBundle.getBundle(BUNDLE_NAME);

  static
  {
    NLS.initializeMessages(BUNDLE_NAME, Messages.class);
  }

  private Messages()
  {
  }

  public static String getString(String key)
  {
    try
    {
      String rawString = RESOURCE_BUNDLE.getString(key);
      StringTemplate stringTemplate = new StringTemplate(rawString);      
      return stringTemplate.substitute(ProductNameMap.get()); 
    }
    catch (MissingResourceException e)
    {
      return '!' + key + '!';
    }
  }
}
