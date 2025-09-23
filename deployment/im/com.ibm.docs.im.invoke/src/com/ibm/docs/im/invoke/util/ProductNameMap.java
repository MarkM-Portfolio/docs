/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.invoke.util;

import java.util.HashMap;
import java.util.Map;

import com.ibm.docs.im.invoke.internal.Messages;

public class ProductNameMap
{
  private static Map<String, String> productNameMap = new HashMap<String, String>();
  static
  {
    
    productNameMap.put("ProductName", Messages.Message_ProductName);
    productNameMap.put("ComponentNameConversion", Messages.Message_ComponentNameConversion);
    productNameMap.put("ComponentNameEditor", Messages.Message_ComponentNameEditor);
    productNameMap.put("ComponentNameEditorExt", Messages.Message_ComponentNameEditorExt);
    productNameMap.put("ComponentNameEditorProxy", Messages.Message_ComponentNameEditorProxy);
    productNameMap.put("ComponentNameViewer", Messages.Message_ComponentNameViewer);
    productNameMap.put("ComponentNameViewerExt", Messages.Message_ComponentNameViewerExt);
    
    productNameMap.put("HardwareServerNameConversion", Messages.Message_HardwareServerNameConversion);
    productNameMap.put("HardwareServerNameEditor", Messages.Message_HardwareServerNameEditor);
    productNameMap.put("HardwareServerNameProxy", Messages.Message_HardwareServerNameProxy);
    productNameMap.put("HardwareServerNameViewer", Messages.Message_HardwareServerNameViewer);
  }
  public static Map<String, String> get()
  {
    return productNameMap;    
  }
}
