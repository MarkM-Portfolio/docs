/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.service;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.platform.revision.IRevisionMetaAdapterFactory;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.IRevisionStorageAdapterFactory;
import com.ibm.docs.framework.Component;
import com.ibm.json.java.JSONObject;

public class RevisionComponent extends Component
{
  private static final Logger LOGGER = Logger.getLogger(RevisionComponent.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.platform.revision";

  private String revisionHome = "";

  private IRevisionStorageAdapterFactory storageAdatper;

  private IRevisionMetaAdapterFactory metadataAdapter;
  
  private boolean enabled = false;
  
  @Override
  protected void init(JSONObject config)
  {
    try
    {
      JSONObject adapters = (JSONObject) config.get("adapter");
      JSONObject storageAdapter = (JSONObject) adapters.get("storage-adapter");
      JSONObject metaAdapter = (JSONObject) adapters.get("meta-adapter");
      Object jEnabled = config.get("enabled");

      try
      {
        String storageClassName = (String) storageAdapter.get("class");
        storageAdatper = (IRevisionStorageAdapterFactory)Class.forName(storageClassName).newInstance();
        String metaClassName = (String) metaAdapter.get("class");
        metadataAdapter = (IRevisionMetaAdapterFactory)Class.forName(metaClassName).newInstance();
        if (jEnabled != null) {
        	enabled = Boolean.valueOf(jEnabled.toString()).booleanValue();
        }          
        else { // if did not read from configure file, put default value in it, which may be used by other components
        	this.getConfig().put("enabled", String.valueOf(this.enabled));
        }
      }
      catch (Exception e)
      {
        throw new IllegalStateException(e);
      }

      revisionHome = ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "revision";
      LOGGER.log(Level.CONFIG, "revision_home: " + revisionHome);    }
    catch(Throwable e)
    {
      LOGGER.log(Level.SEVERE, "component " + COMPONENT_ID + " initialization failed ", e);
    }
  }

  public boolean isEanbled()
  {
    return this.enabled;
  }
  
  public String getRevisionHome()
  {
    return revisionHome;
  }
  
  public Object getService(Class<?> clazz)
  {
    if(clazz == IRevisionService.class)
    {
      return RevisionService.getInstance();
    }

    return super.getService(clazz);
  }
  

  protected IRevisionStorageAdapterFactory getStorageAdapterFactory()
  {
    return storageAdatper;
  }

  protected IRevisionMetaAdapterFactory getMetadataAdapter()
  {
    return metadataAdapter;
  }

  @Override
  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }

}
