/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.draft;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.spi.draft.IDraftStorageAdapterFactory;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

public class DraftComponent extends Component
{
  private static final Logger LOGGER = Logger.getLogger(DraftComponent.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.platform.draft";

  private static final String RECYCLE_LATENCY_KEY = "recycle_latency_in_min";

  public static int recycleLatency = 15;
  private String draftHome;

  private IDraftStorageAdapterFactory draftRepositoryProviderFactory;

  protected void init(JSONObject config) throws InitializationException
  {
    try
    {
      JSONObject obj = (JSONObject)config.get("adapter");
      String className = (String)obj.get("class");
      draftRepositoryProviderFactory = (IDraftStorageAdapterFactory)Class.forName(className).newInstance();

      if (config.get(RECYCLE_LATENCY_KEY) != null)
      {
        int recycleLatency = Integer.parseInt((String) config.get(RECYCLE_LATENCY_KEY));
        if (recycleLatency < 0)
        {
          throw new IllegalArgumentException("recycle_latency_in_min for DraftComponent must be greater than zero.");
        }
        else
        {
          DraftComponent.recycleLatency = recycleLatency;
        }
      }
      draftHome = ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "draft";
      LOGGER.log(Level.CONFIG, "draft_home: " + draftHome);
      
      
    }
    catch(Exception e)
    {
      throw new IllegalStateException(e);
    }
  }

  public String getDraftHome()
  {
    return draftHome;
  }
  
  public Object getService(Class<?> clazz)
  {
    if(clazz == IDraftStorageAdapterFactory.class)
    {
      return draftRepositoryProviderFactory;
    }

    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }
}
