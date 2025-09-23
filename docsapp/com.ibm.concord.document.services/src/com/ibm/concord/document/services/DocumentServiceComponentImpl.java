/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services;

import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author leidb@cn.ibm.com
 *
 */
public class DocumentServiceComponentImpl extends Component
{
  public static final String COMPONENT_ID = "com.ibm.concord.document.services";

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
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }

}
