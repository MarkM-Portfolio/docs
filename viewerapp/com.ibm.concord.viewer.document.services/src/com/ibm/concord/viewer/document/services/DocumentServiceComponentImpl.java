/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.services;

import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.json.java.JSONObject;

/**
 * @author leidb@cn.ibm.com
 *
 */
public class DocumentServiceComponentImpl extends Component
{
  public static final String COMPONENT_ID = "com.ibm.concord.viewer.document.services";

  private IDocumentServiceProvider serviceProvider;
  
  protected void init(JSONObject config) throws InitializationException
  {
    serviceProvider = new DocumentServiceProvider(config);
  }
  
  public Object getService(Class<?> clazz)
  {
    if(IDocumentServiceProvider.class == clazz)
    {
      return serviceProvider;
    }
    return null;
  }

  public Object getService(String id)
  {
   throw new UnsupportedOperationException("Not implemented yet.");
  }

}
