/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.invoke.internal;

import java.util.MissingResourceException;
import java.util.ResourceBundle;

import org.eclipse.osgi.util.NLS;

import com.ibm.docs.im.invoke.util.ProductNameMap;
import com.ibm.docs.im.invoke.util.StringTemplate;
public class Messages extends NLS
{

  private static final String BUNDLE_NAME = "com.ibm.docs.im.invoke.internal.messages"; //$NON-NLS-1$
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
  public static String Message_InvalidNumberOfParameters$uuid;

  public static String Message_InvalidNumberOfParameters$useraction;

  public static String Message_InvalidNumberOfParameters$explanation;

  public static String Message_InvalidNumberOfParameters$message;

  public static String Message_FileDoesNotExist$uuid;

  public static String Message_FileDoesNotExist$useraction;

  public static String Message_FileDoesNotExist$explanation;

  public static String Message_FileDoesNotExist$message;

  public static String Message_FileNotWritable$uuid;

  public static String Message_FileNotWritable$useraction;

  public static String Message_FileNotWritable$explanation;

  public static String Message_FileNotWritable$message;

  public static String Message_InvalidArgument_EmptyString$uuid;

  public static String Message_InvalidArgument_EmptyString$useraction;

  public static String Message_InvalidArgument_EmptyString$explanation;

  public static String Message_InvalidArgument_EmptyString$message;
  
  public static String Message_ProductName;
  
  public static String Message_ComponentNameConversion;
  public static String Message_ComponentNameEditor;
  public static String Message_ComponentNameEditorExt;
  public static String Message_ComponentNameEditorProxy;
  public static String Message_ComponentNameViewer;
  public static String Message_ComponentNameViewerExt;

  public static String Message_HardwareServerNameConversion;
  public static String Message_HardwareServerNameEditor;
  public static String Message_HardwareServerNameProxy;
  public static String Message_HardwareServerNameViewer;
  
}
