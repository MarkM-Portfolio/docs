package com.ibm.docs.viewer.automation.config;

import java.io.File;

import javax.print.attribute.standard.Severity;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ServerConfigHelper
{
  public enum RepositoryType {
    LOCAL("viewer.storage"), VERSE_ATTACHMENT("mail"), VERSE_FILES_LINK("vsfiles"), FILES("lcfiles"), CCM("ecm"), INOTES("tempstorage");

    private String id;

    RepositoryType(String id)
    {
      this.id = id;
    }

    public String getId()
    {
      return id;
    }
  }

  private static ServerConfigHelper instance;

  private static final String HTML_VIEW_KEY = "HtmlViewerConfig";

  private static final String SNAPSHOT_MODE_KEY = "snapshot_mode";

  private static String localCacheRoot;

  private static String sharedCacheRoot;

  private JSONObject config;

  public static ServerConfigHelper getInstance()
  {
    if (instance == null)
    {
      instance = new ServerConfigHelper();
    }
    return instance;
  }

  public ServerConfigHelper()
  {
    config = ViewerClient.getInstance().getServerConfig();
  }

  public boolean enableHTMLView(boolean htmlEnable, boolean snapshotEnable)
  {
    try
    {
      JSONObject htmlConfig = (JSONObject) config.get(HTML_VIEW_KEY);
      String e = (String) htmlConfig.get("enabled");
      String sm = (String) htmlConfig.get(SNAPSHOT_MODE_KEY);
      if (!Boolean.valueOf(e).equals(htmlEnable) || !Boolean.valueOf(sm).equals(snapshotEnable))
      {
        htmlConfig.put("enabled", String.valueOf(htmlEnable));
        htmlConfig.put(SNAPSHOT_MODE_KEY, String.valueOf(snapshotEnable));
        config.put(HTML_VIEW_KEY, htmlConfig);
        ViewerClient.getInstance().setServerConfig(config);
      }
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  public boolean isHTMLView() throws Exception
  {
    JSONObject htmlConfig = (JSONObject) config.get(HTML_VIEW_KEY);
    String e = (String) htmlConfig.get("enabled");
    return Boolean.valueOf(e);
  }

  public JSONObject getComponentConfig(String cid)
  {
    JSONObject component = (JSONObject) config.get("component");
    JSONArray components = (JSONArray) component.get("components");
    JSONObject repositories = null;
    for (int i = 0; i < components.size(); i++)
    {
      JSONObject obj = (JSONObject) components.get(i);
      String id = (String) obj.get("id");
      if (id.equals(cid))
      {
        repositories = obj;
      }
    }
    JSONObject repConfig = (JSONObject) repositories.get("config");
    return repConfig;
  }

  public JSONObject getRepositoryConfig(String repoId)
  {
    JSONObject repConfig = getComponentConfig("com.ibm.concord.viewer.platform.repository");
    JSONArray adapters = (JSONArray) repConfig.get("adapters");
    JSONObject repository = null;
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject obj = (JSONObject) adapters.get(i);
      String id = (String) obj.get("id");
      if (id.equals(repoId))
      {
        repository = obj;
      }
    }
    JSONObject adapterConfig = (JSONObject) repository.get("config");
    return adapterConfig;
  }

  public String getThumbnailsCacheRoot(String repoId)
  {
    String path = null;
    if (RepositoryType.FILES.getId().equals(repoId))
    {
      JSONObject adapterConfig = getRepositoryConfig(repoId);
      path = (String) adapterConfig.get("files_path");
    }
    else
    {
      path = getViewerCacheRoot(repoId);
    }
    return path;
  }

  public String getViewerCacheRoot(String repoId)
  {
    try
    {
      JSONObject adapterConfig = getRepositoryConfig(repoId);
      String cacheType = (String) adapterConfig.get("cache_type");
      if (cacheType != null && cacheType.equals("local"))
      {
        if (localCacheRoot == null)
        {
          localCacheRoot = ViewerClient.getInstance().getCellVaraiable("VIEWER_LOCAL_DATA_ROOT");
        }
        return localCacheRoot + File.pathSeparator + "fake_filer";
      }
      else
      {
        if (sharedCacheRoot == null)
        {
          sharedCacheRoot = ViewerClient.getInstance().getCellVaraiable("VIEWER_SHARED_DATA_ROOT");
        }
        return sharedCacheRoot + File.separator + "fake_filer";
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return "C:\\IBM\\Viewer\\shared\\data\\fake_filer";
    }

  }
}
