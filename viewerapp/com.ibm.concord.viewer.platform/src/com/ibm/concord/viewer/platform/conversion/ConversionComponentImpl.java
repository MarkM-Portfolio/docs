/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import java.io.File;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class ConversionComponentImpl extends Component
{

  public static final String COMPONENT_ID = "com.ibm.concord.viewer.platform.conversion";

  private IConversionService conService;

  protected void init(JSONObject config) throws InitializationException
  {
    // String path = ViewerConfig.getInstance().getSharedDataRoot() + File.separator + "conversion";
    // File file = new File(path);
    // if (!file.exists())
    // {
    // file.mkdirs();
    // }
    // config.put("path", path);
    conService = ConversionService.getConversionService(config);
  }

  public Object getService(Class<?> clazz)
  {
    if (clazz == IConversionService.class)
    {
      return conService;
    }
    return null;
  }

  public Object getService(String id)
  {
   throw new UnsupportedOperationException("Not implemented yet.");
  }

}
