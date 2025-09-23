package com.ibm.concord.viewer.cache.spi.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.config.WASConfigHelper;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;

public class SnapshotDescriptor extends CacheDescriptor
{
  private static final Logger logger = Logger.getLogger(SnapshotDescriptor.class.getName());

  private static final String PAGE_SETTINGS_FILE_PATH = "page-settings.js";

  private static boolean isSmartCloud;

  private static String draftHome;

  private static String snapshotDirName;

  private static final String RESULT_FILE_LABEL = "result.json";

  private static final String ID_KEY = "snapshot_timestamp";

  private static final String READABLE_TAG = "readable.tag";

  private String localWorkingDir;

  private String sid;

  static
  {
    String deployment = ViewerUtil.getDeployment();
    isSmartCloud = deployment != null && deployment.equalsIgnoreCase(Constant.SMART_CLOUD);
    JSONObject config = Platform.getViewerConfig().getSubConfig("docs_integration");
    if (isSmartCloud && !Platform.getViewerConfig().getIsVerseEnv())
    {
      // read it from WAS var
      draftHome = WASConfigHelper.getCellVariable("EDITOR_DRAFT_HOME") + File.separator + "data";
    }
    else
    {
      // on-premise and viewernext environment, for lcfiles repository, read it from config file
      draftHome = (String) config.get("shared_data_root");
    }
    draftHome = draftHome + File.separator + "draft";
    snapshotDirName = (String) config.get("snapshot_dir");

    logger.log(Level.FINE, "Editor draft home: '{0}'.  Read from {1}", new Object[] { draftHome, isSmartCloud ? "sc" : "on-prem" });
  }

  public SnapshotDescriptor(UserBean user, IDocumentEntry docEntry)
  {
    this.sid = null;
    this.userId = user.getId();
    this.customId = ViewerUtil.getFileOwnerOrgId(docEntry, user);
    String hash[] = HashRule.getHash(getViewContext(), docEntry, null);
    primaryHash = hash[0];
    secondaryHash = hash[1];
    cacheURI = ViewerUtil.pathConnect(Arrays.asList(new String[] { draftHome, customId, "draft", primaryHash, secondaryHash,
        docEntry.getDocUri(), snapshotDirName }));
    docUri = docEntry.getDocUri();
    repositoryId = docEntry.getRepository();
    cacheHome = getCacheHomeByRepoId(repositoryId);
    Map<String, String> params = getLocalCacheParams(getViewContext(), docEntry, cacheHome, user.getCustomerId(), userId);
    this.localWorkingDir = params.get(LOCAL_PATH);

    // this.accessible();

    logger.log(Level.FINE, "Cache location: {0}.  Id: {1}.", new String[] { cacheURI, docUri });
  }

  @Override
  public String getRelativeURI()
  {
    if (File.separator.equals("/"))
    {
      String s1 = cacheURI.replace("\\", "/");
      String s2 = draftHome.replace("\\", "/");
      String s = s1.substring(s2.length());
      return s;
    }
    else
    {
      String s1 = cacheURI.replace("/", "\\");
      String s2 = draftHome.replace("/", "\\");
      String s = s1.substring(s2.length());
      return s;
    }

  }

  public String getWorkingDir()
  {
    return this.localWorkingDir;
  }

  public String getMediaURI()
  {
    return getInternalURI();
  }

  public String getHtmlURI()
  {
    return getInternalURI();
  }

  @Override
  public boolean accessible()
  {
    logger.entering(SnapshotDescriptor.class.getName(), "accessible");

    File snapshotDir = new File(getInternalURI()).getParentFile();
    File readableFlag = new File(snapshotDir, READABLE_TAG);
    boolean exists = NFSFileUtil.nfs_assertExistsFile(readableFlag, 0);

    logger.entering(SnapshotDescriptor.class.getName(), "accessible", new Object[] { exists, readableFlag.getAbsolutePath() });
    return exists;
  }

  public boolean getACLFromDraftCache()
  {
    if (!accessible())
    {
      logger.log(Level.INFO, "Snapshot is not accessible. acl=false. {0}", this.docUri);
      return false;
    }

    boolean hasACL = false;
    File snapshotMedia = new File(getInternalURI());
    File pageSettings = new File(snapshotMedia, PAGE_SETTINGS_FILE_PATH);
    if (!FileUtil.nfs_assertExistsFile(pageSettings, FileUtil.NFS_RETRY_SECONDS))
    {
      logger.log(Level.INFO, "page_settings.js is not accessible. acl=false. {0}", this.docUri);
      return false;
    }

    InputStream inputStream;
    try
    {
      inputStream = new FileInputStream(pageSettings);
      JSONObject json = JSONObject.parse(new AutoCloseInputStream(inputStream));
      if (json.containsKey("hasACL"))
      {
        hasACL = Boolean.parseBoolean(json.get("hasACL").toString());
      }
    }

    catch (IOException e)
    {
      logger.log(Level.SEVERE, "Get Draft Section (As JSONObject) Failed. {0} {1}", new Object[] { pageSettings, e });
    }
    return hasACL;
  }

  public boolean getTrackFromDraftCache()
  {
    if (!accessible())
    {
      logger.log(Level.INFO, "Snapshot is not accessible. hastrack=false. {0}", this.docUri);
      return false;
    }

    boolean hasTrack = false;
    File snapshotMedia = new File(getInternalURI());
    File pageSettings = new File(snapshotMedia, PAGE_SETTINGS_FILE_PATH);
    if (!FileUtil.nfs_assertExistsFile(pageSettings, FileUtil.NFS_RETRY_SECONDS))
    {
      logger.log(Level.INFO, "page_settings.js is not accessible. hastrack=false. {0}", this.docUri);
      return false;
    }

    InputStream inputStream;
    try
    {
      inputStream = new FileInputStream(pageSettings);
      JSONObject json = JSONObject.parse(new AutoCloseInputStream(inputStream));
      if (json.containsKey("hasTrack"))
      {
    	  hasTrack = Boolean.parseBoolean(json.get("hasTrack").toString());
      }
    }

    catch (IOException e)
    {
      logger.log(Level.SEVERE, "Get Draft Section (As JSONObject) Failed. {0} {1}", new Object[] { pageSettings, e });
    }
    return hasTrack;
  }

  public String getSidFromDraftCache(boolean forceUpdate)
  {
    logger.entering(SnapshotDescriptor.class.getName(), "getSidfromDraftCache", new Object[] { this.docUri, forceUpdate });

    if (!forceUpdate && sid != null && !sid.isEmpty())
    {
      logger.exiting(SnapshotDescriptor.class.getName(), "getSidfromDraftCache - Not update", new String[] { this.docUri, this.sid });
      return sid;
    }

    sid = null;

    if (!accessible())
    {
      logger.exiting(SnapshotDescriptor.class.getName(), "getSidfromDraftCache - Not accessible", new String[] { this.docUri, this.sid });
      return sid;
    }

    File resultJson = new File(getInternalURI(), RESULT_FILE_LABEL);
    if (FileUtil.nfs_assertExistsFile(resultJson, FileUtil.NFS_RETRY_SECONDS))
    {
      try
      {
        JSONObject o = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(resultJson)));
        sid = String.valueOf(o.get(ID_KEY));
      }
      catch (Exception e)
      {
        logger.fine("Error reading sid.  SNAPSHOT URI: " + resultJson.getAbsolutePath());
      }
    }
    else
    {
      logger.warning("Cannot reading sid.  SNAPSHOT URI: " + resultJson.getAbsolutePath() + " doesn't exist.");
    }

    logger.exiting(SnapshotDescriptor.class.getName(), "getSidfromDraftCache - Read from eidtor", new String[] { this.docUri, this.sid });
    return sid;
  }

  @Override
  public boolean isValid()
  {
    logger.entering(SnapshotDescriptor.class.getName(), "isValid", docUri);

    boolean exists = false;
    if (accessible())
    {
      File result = new File(getInternalURI(), RESULT_FILE_LABEL);
      if (FileUtil.nfs_assertExistsFile(result, FileUtil.NFS_RETRY_SECONDS))
      {
        try
        {
          // try to parse the json
          JSONObject o = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(result)));
          exists = Boolean.valueOf(String.valueOf(o.get("isSuccess")));
        }
        catch (FileNotFoundException e)
        {
          logger.fine(e.getMessage());
        }
        catch (IOException e)
        {
          logger.fine(e.getMessage());
        }
      }
    }
    logger.exiting(SnapshotDescriptor.class.getName(), "isValid", exists);
    return exists;
  }

  @Override
  public ViewContext getViewContext()
  {
    return ViewContext.VIEW_HTML_SS;
  }

}
