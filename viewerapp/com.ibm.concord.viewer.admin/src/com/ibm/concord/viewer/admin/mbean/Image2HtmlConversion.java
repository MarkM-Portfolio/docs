package com.ibm.concord.viewer.admin.mbean;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.spi.impl.CacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.HashRule;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.services.event.conversion.UploadConversionService;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;

public class Image2HtmlConversion implements Image2HtmlConversionMBean
{

  private class Img2HTMLFakeUser implements IUser
  {

    private String userId;

    private String orgId;

    public Img2HTMLFakeUser(String userId, String orgId)
    {
      this.userId = userId;
      this.orgId = orgId;
    }

    @Override
    public String getId()
    {
      return this.userId;
    }

    @Override
    public String getProperty(String key)
    {
      if (key.equals(UserProperty.PROP_CUSTOMERID.toString()) || key.equals(UserProperty.PROP_ORGID.toString()))
      {
        return this.orgId;
        // return "testImg2Html";
      }
      else
      {
        return null;
      }
    }

    @Override
    public void setProperty(String key, String value)
    {
      // TODO Auto-generated method stub

    }

    @Override
    public Set<String> listProperties()
    {
      // TODO Auto-generated method stub
      return null;
    }

    @Override
    public IOrg getOrg()
    {
      // TODO Auto-generated method stub
      return null;
    }

  }

  private static final String IMG2HTML_LOCK_FILENAME = "image2html.lck";

  private static final long IMG2HTML_FAILOVER_INTERVAL = 24 * 60 * 60 * 1000;

  public static final Logger LOG = Logger.getLogger(Image2HtmlConversion.class.getName());

  private HashMap<String, String> docId2OrgId = new HashMap<String, String>();

  private String sharedRoot;

  private File img2htmlLockFile;

  boolean keepSearch;

  private int maxQueueSize;

  private boolean cleanImgCache;

  private int logPrintFrequency;

  private long sendReqInterval;

  private boolean ecmEnabled;

  @Override
  public void schedule()
  {
    keepSearch = true;

    ecmEnabled = ViewerConfig.getInstance().getHouseKeepingEnableECM();
    LOG.log(Level.INFO, "ECM is enabled? {0}", ecmEnabled);

    maxQueueSize = ViewerConfig.getInstance().getImg2html_maxQueueSize();
    cleanImgCache = ViewerConfig.getInstance().isImg2html_cleanImgCache();
    logPrintFrequency = ViewerConfig.getInstance().getImg2html_logPrintFrequency();
    sendReqInterval = ViewerConfig.getInstance().getImg2html_sendReqInterval();
    LOG.log(Level.INFO,
        "start Img2HTML mbean with parameters: maxQueueSize={0}, cleanImgCache={1}, logPrintFrequency={2},sendReqInterval={3} ",
        new Object[] { maxQueueSize, cleanImgCache, logPrintFrequency, sendReqInterval });

    sharedRoot = ViewerConfig.getInstance().getSharedDataRoot();
    File cacheHome = new File(sharedRoot);
    if (!cacheHome.exists())
    {
      LOG.log(Level.SEVERE, "Failiure: cache home cannot be found at {0}.", cacheHome);
      return;
    }
    try
    {
      if (acquireLock() && preExcute())
      {
        execute();
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Failiure: unexpected error happened.", e);
    }
    finally
    {
      release();
    }
  }

  private void release()
  {
    releaseLock();
    if (docId2OrgId != null)
    {
      docId2OrgId.clear();
    }
  }

  private boolean acquireLock()
  {
    boolean acquired = false;
    img2htmlLockFile = new File(new File(sharedRoot), IMG2HTML_LOCK_FILENAME);
    if (img2htmlLockFile.exists())
    {
      boolean isFailover = new Date().getTime() - img2htmlLockFile.lastModified() > IMG2HTML_FAILOVER_INTERVAL;
      if (isFailover)
      {
        acquired = img2htmlLockFile.delete();
        if (acquired)
        {
          acquired = true;
          LOG.log(Level.WARNING,
              new String("Image2Html failover occurred, and the time is passed 24 hours, will re-run Image2Html now.").toString());
        }
        else
        {
          LOG.log(Level.SEVERE, "Failed to clean old lock file. Try to clean the lock manually and restart this command again. {0}",
              img2htmlLockFile);
        }
      }
      else
      {
        LOG.log(Level.FINE, "Image2Html is running on another node, this time will be ignored.");
      }
    }
    else
    {
      try
      {
        if (img2htmlLockFile.createNewFile())
        {
          acquired = true;
        }
        else
        {
          LOG.log(Level.FINE, "Failed to create lock file of image2html.lck because Image2Html is already running on another node.");
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, new String("Lock file cannot be created, Image2Html will be ignored this time.").toString());
      }
    }
    return acquired;
  }

  private void releaseLock()
  {
    if (img2htmlLockFile.exists())
    {
      img2htmlLockFile.delete();
    }
  }

  private void execute()
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "execute");

    Set<String> keys = docId2OrgId.keySet();
    int idx = 0;
    boolean DEBUGGER = false;
    ClassLoader previousLoader = null;
    try
    {
      previousLoader = Thread.currentThread().getContextClassLoader();
      Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());

      for (String docUri : keys)
      {
        idx++;
        if (idx == 1 || idx % logPrintFrequency == 0)
        {
          DEBUGGER = true;
        }
        else
        {
          DEBUGGER = false;
        }
        String orgId = docId2OrgId.get(docUri);

        if (DEBUGGER)
        {
          LOG.log(Level.INFO, "IMG2HTML - start to convert No.{0} document: id={1}, orgId={2}, path={3}",
              new Object[] { idx, docUri, orgId });
        }

        UserBean user = createFakeUser(IUser.FAKE_USER_IMG2HTMLADMIN, orgId);

        try
        {
          IDocumentEntry docEntry;
          if (RepositoryServiceUtil.isCCMRepoDoc(docUri))
          {
            RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
                .getService(RepositoryServiceUtil.ECM_FILES_REPO_ID);
            ECMRepository ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
            docEntry = ecmAdapter.getDocumentBySONATA(docUri);
          }
          else
          {
            docEntry = RepositoryServiceUtil.getEntry(user, RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID, docUri);
          }
          if (DEBUGGER)
          {
            StringBuffer buf = new StringBuffer();
            buf.append("docUri=").append(docUri);
            buf.append(" mime=").append(docEntry.getMimeType());
            buf.append(" modified=").append(docEntry.getModified().getTimeInMillis());
            buf.append(" title=").append(docEntry.getTitle());
            buf.append(" ext=").append(docEntry.getExtension());
            buf.append(" version=").append(docEntry.getVersion());
            buf.append(" mediaSize=").append(docEntry.getMediaSize());
            LOG.log(Level.FINER, "IMG2HTML - Init docEntry of {0} document. {1}.", new Object[] { idx, buf });
          }

          UploadConversionService jms = new UploadConversionService(user, docEntry);
          jms.execImg2Html();
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "ERROR: IMG2HTML - Failed to get document entry due to unexcepted error occurred. {0}", e.getMessage());
        }

        Thread.sleep(sendReqInterval);
      }
      LOG.log(Level.INFO, "Success: IMG2HTML - finish to send all {0} requests.", keys.size());
    }
    catch (InterruptedException e)
    {
      LOG.log(Level.SEVERE, "ERROR: IMG2HTML - Thread is interrupted. {0}", e);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "ERROR: IMG2HTML - Unexcepted error occurred. {0}", e);
    }
    finally
    {
      if (previousLoader != null)
      {
        Thread.currentThread().setContextClassLoader(previousLoader);
      }
    }

    LOG.exiting(Image2HtmlConversion.class.getName(), "execute");
  }

  private UserBean createFakeUser(final String userId, final String orgId)
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "createFakeUser", new Object[] { userId, orgId });

    UserBean userBean = new UserBean(new Img2HTMLFakeUser(userId, orgId));

    LOG.exiting(Image2HtmlConversion.class.getName(), "createFakeUser", new Object[] { userBean.getId(), userBean.getCustomerId() });

    return userBean;
  }

  private boolean preExcute()
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "preExcute");
    File cacheHome = new File(sharedRoot);
    if (Platform.getViewerConfig().getIsVerseEnv())
    {
      LOG.log(Level.SEVERE, "Failiure: IMG2HTML - cannot run this command on Viewernext nodes now.");
      LOG.exiting(Image2HtmlConversion.class.getName(), "preExcute false");
      return false;
    }

    File[] orgHome = cacheHome.listFiles();

    for (int i = 0; i < orgHome.length; i++)
    {
      File orgCacheHome = orgHome[i];
      LOG.log(Level.FINE, "Checking path {0}", orgCacheHome);

      if (!orgCacheHome.isDirectory())
      {
        continue;
      }

      String dir = orgCacheHome.getName();

      // Exclude caches under {$shared_root}/preview/ or {$shared_root}/ccm_preview/
      if (!RepositoryServiceUtil.isCCMThumbnailsDirectory(dir) && !RepositoryServiceUtil.isFilesThumbnailsTempDirectory(dir))
      {
        tranverseOrgFolder(orgCacheHome, maxQueueSize);
      }
    }
    if (docId2OrgId != null && !docId2OrgId.isEmpty())
    {
      LOG.exiting(Image2HtmlConversion.class.getName(), "preExcute true");
      return true;
    }
    LOG.exiting(Image2HtmlConversion.class.getName(), "preExcute false");
    return false;
  }

  private void tranverseOrgFolder(File orgCacheHome, int maxQueueSize)
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "tranverseCacheFolder", new Object[] { orgCacheHome, maxQueueSize });

    File[] primaryHashHomes = orgCacheHome.listFiles();
    String orgId = orgCacheHome.getName();
    int count = 0;

    for (File primaryHashHome : primaryHashHomes)
    {
      if (!keepSearch)
      {
        break;
      }
      int primaryHash = HashRule.validateHash(primaryHashHome.getName());
      if (primaryHash >= 0 && primaryHash <= JobUtil.PRIMARY_MAX_SLOT && primaryHashHome.isDirectory())
      {
        File[] secondaryHashHomes = primaryHashHome.listFiles();
        for (File secondaryHashHome : secondaryHashHomes)
        {
          if (!keepSearch)
          {
            break;
          }
          int secondaryHash = HashRule.validateHash(secondaryHashHome.getName());
          if (secondaryHash >= 0 && secondaryHash <= JobUtil.SECONDARY_MAX_SLOT && secondaryHashHome.isDirectory())
          {
            File[] docCacheHomes = secondaryHashHome.listFiles();
            for (File docCacheHome : docCacheHomes)
            {
              String docId = docCacheHome.getName();
              if (ecmEnabled && RepositoryServiceUtil.isCCMRepoDoc(docId))
              {
                docCacheHome = getECMCacheHome(docCacheHome);
              }
              if (isValidImageCache(docCacheHome))
              {
                count++;
                docId2OrgId.put(docId, orgId);

                if (cleanImgCache)
                {
                  FileUtil.cleanDirectory(docCacheHome);
                }
                if (docId2OrgId.size() >= maxQueueSize)
                {
                  keepSearch = false;
                  LOG.log(Level.WARNING, "Success: IMG2HTML - stop tranvese due to reaching the maxQueueSize of {0}.", maxQueueSize);
                }

              }
            }
            if (secondaryHashHome.list().length == 0)
            {
              secondaryHashHome.delete();
            }
          }
        }
        if (primaryHashHome.list().length == 0)
        {
          primaryHashHome.delete();
        }
      }
    }

    LOG.log(Level.INFO, "IMG2HTML - Found {0} valid image caches in directory {1}.", new Object[] { count, orgId });
    LOG.exiting(Image2HtmlConversion.class.getName(), "tranverseCacheFolder");
  }

  private File getECMCacheHome(File docCacheHome)
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "getECMCacheHome", docCacheHome);

    File latestVerDir = null;
    File[] versions = docCacheHome.listFiles(new FileFilter()
    {
      @Override
      public boolean accept(File pathname)
      {
        if (pathname.isDirectory())
        {
          return true;
        }
        return false;
      }

    });
    if (versions.length >= 1)
    {
      Long latestVer = Long.MIN_VALUE;
      for (File version : versions)
      {
        try
        {
          Long curVer = Long.valueOf(version.getName());
          if (curVer > latestVer)
          {
            latestVer = curVer;
            latestVerDir = version;
          }
        }
        catch (NumberFormatException e)
        {
          continue;
        }
      }
    }
    LOG.exiting(Image2HtmlConversion.class.getName(), "getECMCacheHome", latestVerDir);
    return latestVerDir;

  }

  private boolean isValidImageCache(File cacheInstanceHome)
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "isValidImageCache", cacheInstanceHome);

    if (!cacheInstanceHome.exists() || !cacheInstanceHome.isDirectory())
    {
      return false;
    }
    boolean isValid = CacheDescriptor.metaFileValid(new File(cacheInstanceHome, ICacheDescriptor.CACHE_META_FILE_LABEL))
        && CacheDescriptor.metaFileValid(new File(cacheInstanceHome, ICacheDescriptor.RENDITION_META_FILE_LABEL));

    LOG.exiting(Image2HtmlConversion.class.getName(), "isValidImageCache", isValid);
    return isValid;
  }

  @Override
  public void updateSettings(Integer requestInteval, Boolean cleanImgCache)
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "updateSettings", new Object[] { requestInteval, cleanImgCache });

    ViewerConfig.getInstance().setImg2html_sendReqInterval(requestInteval * 1000);
    ViewerConfig.getInstance().setImg2html_cleanImgCache(cleanImgCache);

    LOG.exiting(Image2HtmlConversion.class.getName(), "updateSettings");
  }

  public void updateDebugSettings(Integer printFrequency, Integer stopIdx)
  {
    LOG.entering(Image2HtmlConversion.class.getName(), "updateDebugSettings", new Object[] { printFrequency, stopIdx });

    ViewerConfig.getInstance().setImg2html_logPrintFrequency(printFrequency);
    ViewerConfig.getInstance().setImg2html_maxQueueSize(stopIdx);

    LOG.exiting(Image2HtmlConversion.class.getName(), "updateDebugSettings");
  }

}
