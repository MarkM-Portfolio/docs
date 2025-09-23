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

import java.util.HashMap;
import java.util.Map;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentServiceProvider implements IDocumentServiceProvider
{
  private static final Logger LOG = Logger.getLogger(DocumentServiceProvider.class.getName());

  private JSONObject mimeTypesMap;

  private Map<String, IDocumentService> providersMap = new HashMap<String, IDocumentService>();

  public DocumentServiceProvider(JSONObject config)
  {
    mimeTypesMap = (JSONObject) config.get("mime-types");
    JSONArray providerArr = (JSONArray) config.get("providers");
    for (int i = 0; i < providerArr.size(); i++)
    {
      JSONObject pJson = (JSONObject) providerArr.get(i);
      String name = (String) pJson.get("name");
      String clazz = (String) pJson.get("class");
      JSONObject subConfig = (JSONObject) pJson.get("config");
      try
      {
        IDocumentService service = (IDocumentService) Class.forName(clazz).newInstance();
        providersMap.put(name, service);
        service.init(subConfig);
      }
      catch (IllegalAccessException e)
      {
        LOG.log(Level.WARNING, "error loading document service: " + clazz, e);
      }
      catch (InstantiationException e)
      {
        LOG.log(Level.WARNING, "error loading document service: " + clazz, e);
      }
      catch (ClassNotFoundException e)
      {
        LOG.log(Level.WARNING, "error loading document service: " + clazz, e);
      }
    }
  }

  public IDocumentService getDocumentService(String mimeType)
  {
    if (mimeType == null)
    {
      LOG.log(Level.WARNING, "Failed to getDocumentService due to null mime type.");
      return null;
    }
    // add compatibility for x-vnd.oasis.opendocument
    CharSequence cs = "x-vnd.oasis.opendocument";
    if (mimeType.contains(cs))
      mimeType = mimeType.replace("x-", "");

    String name = (String) mimeTypesMap.get(mimeType);
    return providersMap.get(name);
  }

  public String getDocumentType(String mimeType)
  {
    return (String) mimeTypesMap.get(mimeType);
  }

  public boolean supportedDocumentService(String type)
  {
    return (providersMap.get(type) != null);
  }

  public IDocumentService getDocumentServiceByType(String type)
  {
    return providersMap.get(type);
  }
}
