package com.ibm.docs.viewer.automation;

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.junit.Test;

import com.ibm.docs.viewer.automation.action.AbstractAction;
import com.ibm.docs.viewer.automation.action.DeleteDocCache;
import com.ibm.docs.viewer.automation.action.DeleteThumbnailCache;
import com.ibm.docs.viewer.automation.action.EventInfo;
import com.ibm.docs.viewer.automation.action.GenerateThumbnailEvent;
import com.ibm.docs.viewer.automation.action.GetCellVariable;
import com.ibm.docs.viewer.automation.action.GetSupportedFileFormats;
import com.ibm.docs.viewer.automation.action.GetUserId;
import com.ibm.docs.viewer.automation.action.GetVersionInfo;
import com.ibm.docs.viewer.automation.action.GetViewerConfig;
import com.ibm.docs.viewer.automation.action.IAction;
import com.ibm.docs.viewer.automation.action.LocalUploadFile;
import com.ibm.docs.viewer.automation.action.MailSnoopTest;
import com.ibm.docs.viewer.automation.action.MoveFileToTrash;
import com.ibm.docs.viewer.automation.action.OpenHTMLViewPage;
import com.ibm.docs.viewer.automation.action.OpenImageViewPage;
import com.ibm.docs.viewer.automation.action.OpenPdfPictures;
import com.ibm.docs.viewer.automation.action.PostAttachment;
import com.ibm.docs.viewer.automation.action.PostMailAttachment;
import com.ibm.docs.viewer.automation.action.QueryAttachment;
import com.ibm.docs.viewer.automation.action.QueryCacheStatus;
import com.ibm.docs.viewer.automation.action.QueryJobStatus;
import com.ibm.docs.viewer.automation.action.QueryMailAttachment;
import com.ibm.docs.viewer.automation.action.QueryUploadConverisonDirectory;
import com.ibm.docs.viewer.automation.action.RequestType;
import com.ibm.docs.viewer.automation.action.ResponseData;
import com.ibm.docs.viewer.automation.action.SetViewerConfig;
import com.ibm.docs.viewer.automation.action.UnexpectedHTTPCode;
import com.ibm.docs.viewer.automation.action.UploadConvertRequest;
import com.ibm.docs.viewer.automation.action.UploadFile;
import com.ibm.docs.viewer.automation.action.UploadNewVersion;
import com.ibm.docs.viewer.automation.auth.BasicLoginContext;
import com.ibm.docs.viewer.automation.auth.FormLoginContext;
import com.ibm.docs.viewer.automation.auth.SmartCloudContext;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.docs.viewer.automation.util.ViewType;
import com.ibm.json.java.JSONObject;

/**
 * @author niebomin
 * 
 */
public class ViewerClient
{
  private User user;

  private Server server;

  private HttpClient client;

  private String userId;

  private static ViewerClient instance;

  private static final Logger logger = Logger.getLogger(ViewerClient.class.getName());

  private static boolean loggedIn = false;

  public static final String CACHESTATUS_KEY_EXISTS = "exists";

  public static final String CACHESTATUS_KEY_UPLOADCONVERTING = "uploadConverted";

  public static final String CACHESTATUS_KEY_VALID = "valid";

  public static final String CACHESTATUS_KEY_LOCATION = "location";

  public static final String CACHESTATUS_KEY_THUMBNAILSCACHE = "thumbnailsCache";

  public static final String CACHESTATUS_KEY_THUMBNAILSCONVERSION = "thumbnailsConversion";

  public static final String CACHESTATUS_KEY_SNAPSHOTCACHE = "snapshotCache";

  public static final String CACHESTATUS_KEY_DOCCACHE = "docCache";

  public static final String CACHESTATUS_KEY_RELATIVEPATH = "relativePath";

  public static final Object CACHESTATUS_KEY_LASTMODIFY = "lastModified";

  public static final Object CACHESTATUS_KEY_MIMETYPE = "mimetype";

  public static final Object CACHESTATUS_KEY_MEDIASIZE = "mediaSize";

  public static final Object CACHESTATUS_KEY_DOCINFO = "docInfo";

  public static final String MSIE8 = "msie 8.0";

  public ViewerClient()
  {
  }

  public static ViewerClient getInstance()
  {
    if (instance == null)
    {
      instance = new ViewerClient(ViewerAutomationConfig.getConfig().getServer());
    }

    return instance;
  }

  public static String getRepositoryId()
  {
    return getInstance().server.getRepositoryId();
  }

  ViewerClient(Server server)
  {
    this.server = server;
    initHttpClient();
  }

  public User getCurrentUser()
  {
    return this.user;
  }

  public Map<String, String> openViewPage(String fileId, String repositoryId, String[] params, ViewType type/* boolean isHTML */,
      String userAgent) throws Exception
  {
    OpenImageViewPage act = null;
    switch (type)
      {
        case HTML :
          act = new OpenHTMLViewPage(client, server, fileId, repositoryId, userAgent, params);
          break;
        case IMAGE :
          act = new OpenImageViewPage(client, server, fileId, repositoryId, userAgent, params);
      }
    act.execute();
    return act.getData();
  }

  public Map<String, String> openViewPage(String fileId, String repositoryId, ViewType type/* boolean isHTML */, String userAgent)
      throws Exception
  {
    return openViewPage(fileId, repositoryId, null, type, userAgent);
  }

  public Map<String, String> openViewPage(String fileId, String repositoryId, ViewType type/* boolean isHTML */) throws Exception
  {
    return openViewPage(fileId, repositoryId, null, type, null);
  }

  public Map<String, String> openViewPage(String fileId, String repositoryId, String[] params, ViewType type/* boolean isHTML */)
      throws Exception
  {
    return openViewPage(fileId, repositoryId, params, type, null);
  }

  /**
   * @return document id
   * @throws Exception
   */
  public String uploadDocument(String path) throws Exception
  {
    File f = null;
    if (path == null)
    {
      f = new File("./samples/Page1.pptx");
    }
    else
    {
      f = new File(path);
    }
    IAction act = null;
    switch (ViewerAutomationConfig.getConfig().envType())
      {
        case LOCAL :
          act = new LocalUploadFile(client, server, userId, f);
          break;
        case ONPREMISE :
        case SMARTCLOUD :
          act = new UploadFile(client, server, userId, f);
          break;
        default:
          return null;
      }

    act.execute();

    logger.fine("File uploaded.  Id: " + act.getData());
    Thread.sleep(3000);
    return (String) act.getData();
  }

  // TODO
  public void removeDocument(String fileId) throws Exception
  {
    MoveFileToTrash mtt = null;
    switch (ViewerAutomationConfig.getConfig().envType())
      {
        case LOCAL :
          mtt = new MoveFileToTrash(client, server, fileId, userId);
          break;
        case ONPREMISE :
        case SMARTCLOUD :
          mtt = new MoveFileToTrash(client, server, fileId, userId);
          break;
      }
    mtt.execute();
  }

  private void initHttpClient()
  {
    if (client != null)
    {
      return;
    }
    try
    {
      URL url = new URL(server.getHost());
      client = ClientFactory.createHttpClient(url.getProtocol());
    }
    catch (MalformedURLException e)
    {
      logger.log(Level.SEVERE, "Can't create server URL, please check the config file", e);
    }
  }

  public void login() throws Exception
  {
    login(ViewerAutomationConfig.getConfig().getDefaultUser());
  }

  public void login(User user) throws Exception
  {
    if (!loggedIn)
    {
      this.user = user;
      initHttpClient();
      try
      {
        switch (ViewerAutomationConfig.getConfig().envType())
          {
            case LOCAL :
              BasicLoginContext bcxt = new BasicLoginContext(server, client);
              bcxt.doLogin(this.user);
              logger.info("Logged in.  User id: " + this.user.getId());
              break;
            case ONPREMISE :
              FormLoginContext cxt = new FormLoginContext(server, client);
              cxt.doLogin(this.user);

              GetUserId act = new GetUserId(client, server);
              act.execute();

              userId = act.getData();
              logger.info("Logged in.  User id: " + userId);
              break;
            case SMARTCLOUD :
              SmartCloudContext scxt = new SmartCloudContext(server, client);
              scxt.doLogin(this.user);

              GetUserId sact = new GetUserId(client, server);
              sact.execute();

              userId = sact.getData();
              logger.info("Logged in.  User id: " + userId);

              break;
            default:
              break;

          }
        loggedIn = true;

        StringBuffer sbf = new StringBuffer("Logged in successfully.").append("\n");
        sbf.append("   Server: ").append(server.getHost()).append("\n");
        sbf.append("   User: ").append(user.getId());
        if (this.user.isEntitled())
        {
          sbf.append("(entitled)");
        }
        else
        {
          sbf.append("(non-entitled)");
        }
        sbf.append("\n   Disabled cases are: ").append(user.printDisabledCases());

        logger.info(sbf.toString());

      }
      catch (Exception e)
      {
        logger.logp(Level.SEVERE, ViewerClient.class.getName(), "login", e.getMessage(), e);
        throw e;
      }
    }
  }  

	public String getUserId() throws Exception {
		try {
			GetUserId sact = new GetUserId(client, server);
			sact.execute();

			userId = sact.getData();
			logger.info("Logged in.  User id: " + userId);
		} catch (Exception e) {
			logger.logp(Level.SEVERE, ViewerClient.class.getName(), "getUserId",
					e.getMessage(), e);
			throw e;
		}
		return userId;
	}
	public void setUserId(String userId){
		this.userId = userId;
	}
  //add this function for we get userID from Files, inactive files may not ready for use. so while run 'test' in inactive side, will use this login method.
  //getUserID used for upload files.
  public void loginNoUserId() throws Exception
  {
	  loginNoUserId(ViewerAutomationConfig.getConfig().getDefaultUser());
  }
  public void loginNoUserId(User user) throws Exception
  {
	    if (!loggedIn)
	    {
	      this.user = user;
	      initHttpClient();
	      try
	      {
	        switch (ViewerAutomationConfig.getConfig().envType())
	          {
	            case LOCAL :
	              BasicLoginContext bcxt = new BasicLoginContext(server, client);
	              bcxt.doLogin(this.user);
	              logger.fine("Logged in.  User id: " + this.user.getId());
	              break;
	            case ONPREMISE :
	              FormLoginContext cxt = new FormLoginContext(server, client);
	              cxt.doLogin(this.user);
	              logger.info("Logged in.  User id: " + userId);
	              break;
	            case SMARTCLOUD :
	              SmartCloudContext scxt = new SmartCloudContext(server, client);
	              scxt.doLogin(this.user);
	              logger.info("Logged in.  User id: " + userId);

	              break;
	            default:
	              break;

	          }
	        loggedIn = true;

	        StringBuffer sbf = new StringBuffer("Logged in successfully.").append("\n");
	        sbf.append("   Server: ").append(server.getHost()).append("\n");
	        sbf.append("   User: ").append(user.getId());
	        if (this.user.isEntitled())
	        {
	          sbf.append("(entitled)");
	        }
	        else
	        {
	          sbf.append("(non-entitled)");
	        }
	        sbf.append("\n   Disabled cases are: ").append(user.printDisabledCases());

	        logger.info(sbf.toString());

	      }
	      catch (Exception e)
	      {
	        logger.logp(Level.SEVERE, ViewerClient.class.getName(), "login", e.getMessage(), e);
	        throw e;
	      }
	    }
	  }

  public void logout()
  {
    if (loggedIn)
    {
      client.getConnectionManager().shutdown();
      client = null;
      loggedIn = false;
      logger.log(Level.INFO, "{0} logout successfully.", this.user.getId());
    }
  }

  public String getVersionInfo() throws Exception
  {
    GetVersionInfo gvi = new GetVersionInfo(client, server);
    gvi.execute();
    String product = gvi.getProductName();
    String version = gvi.getViewerVersion();
    String timestamp = gvi.getBuildVersion();
    return (product != null ? product : "viewer") + ":" + (version != null ? version : "") + "(" + (timestamp != null ? timestamp : "")
        + ")";
  }

  public JSONObject SnoopTest(String fileid) throws Exception
  {
    String path = "/api/query/mail/" + fileid + "/snoop";
    MailSnoopTest snoop = new MailSnoopTest(client, server, path, false);
    snoop.execute();

    return snoop.getResponse();
  }
  public void UploadConvertEvent(String repositoryId, String fileId) throws Exception
  {
	    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
	    try
	    {
	      qcs.execute();
	      JSONObject response = qcs.getData();
	      JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_DOCINFO);
	      EventInfo event = new EventInfo();
	      event.minetype = (String) cache.get(CACHESTATUS_KEY_MIMETYPE);
	      event.version = String.valueOf(cache.get(CACHESTATUS_KEY_LASTMODIFY));
	      event.fileSize = String.valueOf(cache.get(CACHESTATUS_KEY_MEDIASIZE));
	      event.modified = event.version;
	      event.request = EventInfo.EventType.UPLOAD_FILE;
	      UploadConvertRequest convertEvent = new UploadConvertRequest(client, server, event,repositoryId, fileId);
	      convertEvent.execute();
	    }
	    catch (Exception e)
	    {
	      throw e;
	    } 
  }

  public String getSanityResult(String fileId) throws Exception
  {
    String path = "/api/query/mail/" + fileId + "/snoop";
    MailSnoopTest snoop = new MailSnoopTest(client, server, path, true);
    snoop.execute();

    JSONObject obj = snoop.getResponse();
    return (String) obj.get("result");
  }

  public boolean queryStatus(String fileId, String jobId, String version, String repositoryId, boolean isHTML, String userAgent)
      throws Exception
  {
    QueryJobStatus qjs = new QueryJobStatus(client, server, fileId, jobId, version, repositoryId, isHTML, userAgent);
    qjs.execute();
    JSONObject response = qjs.getData();
    String status = (String) response.get("status");
    int count = 0;
    while (count < 150 && QueryJobStatus.STATUS_PENDING.equals(status))
    {
      try
      {
        Thread.sleep(1000);
        count++;
        qjs.execute();
        response = qjs.getData();
        status = (String) response.get("status");
      }
      catch (InterruptedException e)
      {
        logger.log(Level.SEVERE, "Loop is terminated.", e);
      }

    }

    if (QueryJobStatus.STATUS_COMPLETE.equals(status))
    {
      logger.info("Conversiion completed succesfully.  File id: " + fileId);
      return true;
    }
    else if (QueryJobStatus.STATUS_ERROR.equals(status))
    {
      logger.log(Level.WARNING, "Failed to convert file: " + fileId);
    }
    return false;
  }

  public boolean queryThumbnailsCacheStatus(String repositoryId, String fileId, int retry, int interval) throws Exception
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    qcs.execute();
    JSONObject response = qcs.getData();

    if (response == null)
      return false;

    JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_THUMBNAILSCACHE);
    boolean existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_EXISTS));
    String path = (String) cache.get(CACHESTATUS_KEY_LOCATION);
    int count = 0;
    while (count < retry && !existed)
    {
      try
      {
        Thread.sleep(interval);
        count++;
        qcs.execute();
        response = qcs.getData();
        cache = (JSONObject) response.get(CACHESTATUS_KEY_THUMBNAILSCACHE);
        existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_EXISTS));
      }
      catch (InterruptedException e)
      {
        logger.log(Level.SEVERE, "Loop is terminated.", e);
      }

    }

    if (existed)
    {
      logger.info("Thumbnails are generated succesfully.  File id: " + fileId + " Path: " + path);
      return true;
    }
    else if (QueryJobStatus.STATUS_ERROR.equals(existed))
    {
      logger.log(Level.WARNING, "Failed to generate thumbnails. File id: " + fileId + " Path: " + path);
    }
    return false;
  }

  public boolean queryThumbSrvConversionStatus(String repositoryId, String fileId, int retry, int interval) throws Exception
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    qcs.execute();
    JSONObject response = qcs.getData();

    if (response == null)
      return false;

    JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_THUMBNAILSCONVERSION);
    boolean existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_EXISTS));
    String path = (String) cache.get(CACHESTATUS_KEY_LOCATION);
    int count = 0;
    while (count < retry && !existed)
    {
      try
      {
        Thread.sleep(interval);
        count++;
        qcs.execute();
        response = qcs.getData();
        cache = (JSONObject) response.get(CACHESTATUS_KEY_THUMBNAILSCONVERSION);
        existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_EXISTS));
      }
      catch (InterruptedException e)
      {
        logger.log(Level.SEVERE, "Loop is terminated.", e);
      }

    }

    if (existed)
    {
      logger.info("One-page thumbnail conversion are generated succesfully.  File id: " + fileId + " Path: " + path);
      return true;
    }
    else if (QueryJobStatus.STATUS_ERROR.equals(existed))
    {
      logger.log(Level.WARNING, "Failed to generate one-page thumbnail conversion. File id: " + fileId + " Path: " + path);
    }
    return false;
  }

  public boolean querySnapshotStatus(String repositoryId, String fileId, int retry, int interval) throws Exception
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    qcs.execute();
    JSONObject response = qcs.getData();

    if (response == null)
      return false;

    boolean existed = false;
    String path = null;

    JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_SNAPSHOTCACHE);
    if (cache != null)
    {
      existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_VALID));
      path = (String) cache.get(CACHESTATUS_KEY_LOCATION);
      int count = 0;
      while (count < retry && !existed)
      {
        try
        {
          Thread.sleep(interval);
          count++;
          qcs.execute();
          response = qcs.getData();
          cache = (JSONObject) response.get(CACHESTATUS_KEY_SNAPSHOTCACHE);
          existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_VALID));
        }
        catch (InterruptedException e)
        {
          logger.log(Level.SEVERE, "Loop is terminated.", e);
        }
      }
    }

    if (existed)
    {
      logger.info("Snapshot are generated succesfully.  File id: " + fileId + " Path: " + path);
      return true;
    }
    else
    {
      logger.log(Level.WARNING, "Snapshot are NOT generated. File id: " + fileId + " Path: " + path);
    }
    return false;
  }

  public boolean queryUploadCacheStatus(String repositoryId, String fileId, int retry, int interval) throws Exception
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    qcs.execute();
    JSONObject response = qcs.getData();
    JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_DOCCACHE);
    boolean existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_UPLOADCONVERTING));
    int count = 0;
    while (count < retry && !existed)
    {
      try
      {
        Thread.sleep(interval);
        count++;
        qcs.execute();
        response = qcs.getData();
        cache = (JSONObject) response.get(CACHESTATUS_KEY_DOCCACHE);
        existed = Boolean.parseBoolean((String) cache.get(CACHESTATUS_KEY_UPLOADCONVERTING));
      }
      catch (InterruptedException e)
      {
        logger.log(Level.SEVERE, "Loop is terminated.", e);
      }

    }

    if (existed)
    {
      logger.info("Upload conversion done succesfully.  File id: " + fileId);
      return true;
    }
    else if (QueryJobStatus.STATUS_ERROR.equals(existed))
    {
      logger.log(Level.WARNING, "Failed to do upload conversion. File id: " + fileId);
    }
    return false;
  }

  public JSONObject queryDocCacheStatus(String repositoryId, String fileId, String userAgent) throws Exception
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId, userAgent);
    qcs.execute();
    JSONObject response = qcs.getData();
    JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_DOCCACHE);
    return cache;
  }

  public JSONObject queryDocCacheStatus(String repositoryId, String fileId) throws Exception
  {
    return queryDocCacheStatus(repositoryId, fileId, null);
  }

  public String queryThumbnailCachePath(String repositoryId, String fileId)
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    try
    {
      qcs.execute();
      JSONObject response = qcs.getData();
      JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_THUMBNAILSCACHE);
      String relativePath = (String) cache.get(CACHESTATUS_KEY_LOCATION);
      return relativePath;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public String queryDocCachePath(String repositoryId, String fileId)
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    try
    {
      qcs.execute();
      JSONObject response = qcs.getData();
      JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_DOCCACHE);
      String relativePath = (String) cache.get(CACHESTATUS_KEY_LOCATION);
      return relativePath;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public void deleteDocCache(String repositoryId, String fileId) throws Exception
  {
    String relativePath = queryDocCachePath(repositoryId, fileId);
    if (relativePath == null)
    {
      throw new IllegalStateException("Relative path for doc cache cannot be null.");
    }
    DeleteDocCache ddc = new DeleteDocCache(client, server, relativePath);
    try
    {
      ddc.execute();
    }
    catch (Exception e)
    {
      throw e;
    }
  }

  public void deleteThumbnailCache(String repositoryId, String fileId) throws Exception
  {
    String relativePath = queryThumbnailCachePath(repositoryId, fileId);
    if (relativePath == null)
    {
      throw new IllegalStateException("Relative path for thumbnails cannot be null.");
    }
    String fullPath = ServerConfigHelper.getInstance().getThumbnailsCacheRoot(repositoryId) + relativePath;
    DeleteThumbnailCache dtc = new DeleteThumbnailCache(client, server, fullPath);
    try
    {
      dtc.execute();
    }
    catch (Exception e)
    {
      throw e;
    }
  }
//generateThumbnailEvent not work for uri changed.
  public void generateThumbnailEvent(String repositoryId, String fileId) throws Exception
  {
    QueryCacheStatus qcs = new QueryCacheStatus(client, server, repositoryId, fileId);
    try
    {
      qcs.execute();
      JSONObject response = qcs.getData();
      JSONObject cache = (JSONObject) response.get(CACHESTATUS_KEY_DOCINFO);
      EventInfo event = new EventInfo();
      event.docId = fileId;
      event.minetype = (String) cache.get(CACHESTATUS_KEY_MIMETYPE);
      // event.relativePath = (String) cache.get(CACHESTATUS_KEY_RELATIVEPATH);
      event.version = String.valueOf(cache.get(CACHESTATUS_KEY_LASTMODIFY));
      event.fileSize = String.valueOf(cache.get(CACHESTATUS_KEY_MEDIASIZE));
      event.modified = event.version;
      event.request = EventInfo.EventType.GENERATE_THUMBNAIL;
      event.repoId = repositoryId;
      GenerateThumbnailEvent gte = new GenerateThumbnailEvent(client, server, event);
      gte.execute();
    }
    catch (Exception e)
    {
      throw e;
    }
  }

  public JSONObject getServerConfig()
  {
    GetViewerConfig gvc = new GetViewerConfig(client, server);
    try
    {
      gvc.execute();
      return gvc.getData();
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to get Viewer config.  " + e.getMessage());
      return null;
    }
  }

  public String getCellVaraiable(String key)
  {
    GetCellVariable gcv = new GetCellVariable(client, server, key);
    try
    {
      gcv.execute();
      return gcv.getData();
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to get cell variable.  " + e.getMessage());
      return null;
    }
  }

  public void setServerConfig(JSONObject config)
  {
    SetViewerConfig svc = new SetViewerConfig(client, server, config);
    try
    {
      svc.execute();
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to set Viewer config.  " + e.getMessage());
    }
  }

  @Test
  public void test()
  {
    logger.info("test");

    boolean succ = true;
    try
    {
      ViewerClient viewer = ViewerClient.getInstance();
      JSONObject config = viewer.getServerConfig();
      System.out.println(config.toString());

      JSONObject htmlConfig = (JSONObject) config.get("HtmlViewerConfig");
      String e = (String) htmlConfig.get("enabled");
      String excludes = (String) htmlConfig.get("exclude");
      htmlConfig.put("enabled", String.valueOf(Boolean.valueOf(e) ? Boolean.FALSE : Boolean.TRUE));
      htmlConfig.put("exclude", excludes + ";sss");
      config.put("HtmlViewerConfig", htmlConfig);

      viewer.setServerConfig(config);

      // viewer.login();
      // String fileId = viewer.uploadDocument("./samples/BTC_ExternalCodeListDescription_16June09.doc");
      // String fileId = viewer.uploadDocument("./samples/charts.ods");
      // viewer.openViewPage("71f8af83-75a1-4cc2-a552-fa80dc37a9b8");
      // Map<String, String> r = viewer.openViewPage(fileId);
      // Map<String, String> r = viewer.openViewPage(fileId, true);
      // succ = viewer.queryStatus(fileId, r.get("jobId"), r.get("version"));
      // viewer.logout();
    }
    catch (Exception e)
    {
      succ = false;
    }

    assertEquals(true, succ);
  }

  public JSONObject getSupportedFileFormats() throws Exception
  {

    GetSupportedFileFormats gsff = new GetSupportedFileFormats(client, server);
    gsff.execute();
    return gsff.getData();

  }

  public JSONObject postAttachment(String path, String uuid) throws Exception
  {
    File f = null;
    if (path == null)
    {
      f = new File("./samples/Page1.pptx");
    }
    else
    {
      f = new File(path);
    }
    PostAttachment vaf = new PostAttachment(client, server, f, uuid);
    vaf.execute();

    logger.fine("File uploaded.  Id: " + vaf.getData());

    return (JSONObject) vaf.getData();
  }

  public JSONObject postMailAttachment(String path, String uuid) throws Exception
  {
    File f = null;
    if (path == null)
    {
      f = new File("./samples/Page1.pptx");
    }
    else
    {
      f = new File(path);
    }
    PostMailAttachment vaf = new PostMailAttachment(client, server, f, uuid);
    vaf.execute();

    logger.fine("File uploaded.  Id: " + vaf.getData());

    return (JSONObject) vaf.getData();
  }

  public boolean openPdfPictures(String url) throws Exception
  {

    OpenPdfPictures act = new OpenPdfPictures(client, server, url);
    act.execute();
    return (Boolean) act.getData();

  }

  public JSONObject attachmentExists(String uuid) throws Exception
  {
    QueryAttachment qfic = new QueryAttachment(client, server, uuid);
    qfic.execute();
    return (JSONObject) qfic.getData();

  }

  public JSONObject mailAttachmentExists(String f, String uuid) throws Exception
  {
    QueryMailAttachment qfic = new QueryMailAttachment(client, server, f, uuid);
    qfic.execute();
    return (JSONObject) qfic.getData();

  }

  public JSONObject queryUploadConversionDirectory(String uri) throws Exception
  {

    QueryUploadConverisonDirectory qucd = new QueryUploadConverisonDirectory(client, server, uri);
    qucd.execute();
    return (JSONObject) qucd.getData();
  }

  public void uploadNewVersion(String fileId, File f) throws Exception
  {
    UploadNewVersion unv = new UploadNewVersion(client, server, fileId, f);
    unv.execute();
  }

  public JSONObject getCacheStatus(final String fileId, final String repoId) throws Exception
  {
    AbstractAction act = new AbstractAction(client, server, RequestType.HTTP_GET)
    {
      JSONObject json;

      @Override
      protected void postExec(ResponseData data) throws Exception
      {
        if (data.getCode() != 200)
        {
          throw new UnexpectedHTTPCode("response code error!");
        }
        json = data.getDataAsJSON();
        if (json.containsKey("error"))
        {
          throw new Exception("Servre responses with error.  Error message: " + json.get("error"));
        }
      }

      @Override
      protected void initRequest(HttpUriRequest request)
      {
        // do nothing
      }

      @Override
      protected String getURI()
      {
        return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/cache/").append(repoId).append("/")
            .append(fileId).toString();
      }

      @Override
      public JSONObject getData()
      {
        return json;
      }
    };
    act.execute();
    return (JSONObject) act.getData();
  }

}
