/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.conversion;

import java.io.File;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class ConversionComponentImpl extends Component
{
  
  public static final String COMPONENT_ID = "com.ibm.concord.platform.conversion";
  
  private IConversionService conService;
  
  protected void init(JSONObject config) throws InitializationException
  {
    String path =  ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "conversion";
    File file = new File(path);
    if (!file.exists())
    {
      file.mkdirs();
    }
    config.put("path", path);
    conService = ConversionService.getConversionService(config);
  }

  public Object getService(Class<?> clazz)
  {
    if(clazz == IConversionService.class)
    {
      return conService;
    }
    return null;
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }

}
