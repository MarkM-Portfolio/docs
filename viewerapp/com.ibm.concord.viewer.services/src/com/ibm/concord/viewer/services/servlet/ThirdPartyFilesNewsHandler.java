/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.servlet;

import java.util.Calendar;
import java.util.Date;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import com.ibm.concord.viewer.job.HousekeepingJob;
import com.ibm.concord.viewer.job.HousekeepingJob.HouseKeepingType;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.news.INewsHandler;
import com.ibm.docs.viewer.external.repository.rest.RestDocumentEntry;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.WorkException;
import com.ibm.websphere.cache.DistributedMap;

/**
 * @author linfeng_li
 * 
 */
public class ThirdPartyFilesNewsHandler implements INewsHandler
{

  private Logger LOG = Logger.getLogger(LCFilesNewsHandler.class.getName());

  private static final String USERNAME = "userid";

  private static final String DOCUMENT = "docId";

  private static final String EXTENSION = "extension";

  private static final String DISPLAYNAME = "displayname";

  private static final String EMAIL = "email";

  private static final String RELATIVEPATH = "relativepath";

  private static final String MODIFIED = "modified";

  private static final String MIMETYPE = "mimetype";

  public static final String RELATEDCOMMUNITYIDS = "relatedcommunityids";

  private static final String TITLE = "title";

  private static final String VERSION = "version";

  private static final String FILESIZE = "fileSize";

  private static final String REPOSITORY = "repository";

  private HttpServletRequest request;

  private UserBean user;

  private IDocumentEntry docEntry;

  private EventType req;

  private String docId;

  private String repoId;

  public ThirdPartyFilesNewsHandler(HttpServletRequest request, EventType type, String docId, String repoId)
  {
    this.request = request;
    this.user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    this.req = type;
    this.docId = docId;
    this.repoId = repoId;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.news.INewsHandler#getDocumentEntry()
   */
  @Override
  public IDocumentEntry getDocumentEntry() throws RepositoryAccessException
  {
    LOG.entering(this.getClass().getName(), "getDocumentEntry");
    docEntry = this.getEntry(request, user);
    LOG.exiting(this.getClass().getName(), "getDocumentEntry");
    return docEntry;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.news.INewsHandler#processNewsEvent()
   */
  @Override
  public void processNewsEvent() throws RepositoryAccessException
  {
    LOG.entering(this.getClass().getName(), "processNewsEvent", req);
    switch (req)
      {
        case PURGE_SANITY :
          startSanityFilesHouseKeepingJob(user, docEntry, HouseKeepingType.PURGESANITY);
          break;
      }
    LOG.exiting(this.getClass().getName(), "processNewsEvent");
  }

  /**
   * @param request
   * @param user
   * @return
   */
  private IDocumentEntry getEntry(HttpServletRequest request, UserBean user)
  {
    LOG.entering(this.getClass().getName(), "getEntry");
    String mimeType = request.getParameter(MIMETYPE);
    String version = request.getParameter(VERSION);
    String title = request.getParameter(TITLE);
    String ext = request.getParameter(EXTENSION);
    Calendar modified = Calendar.getInstance();
    String mod = request.getParameter(MODIFIED);
    String relatedCommunityIds = request.getParameter(RELATEDCOMMUNITYIDS);
    if (mimeType == null)
    {
      if (ext == null && title != null)
      {
        ext = DocumentEntryHelper.extractExt(title);
        LOG.log(Level.FINER, "Extracted extension is {1}. DocId is {0}", new String[] { docId, ext });
      }
      if (ext != null)
      {
        if (ext.startsWith("."))
        {
          ext = ext.substring(1);
        }
        if (FormatUtil.EXT2MIMETYPE.containsKey(ext))
        {
          mimeType = FormatUtil.EXT2MIMETYPE.get(ext);
          LOG.log(Level.INFO, "Map extension {0} to mimetype {1}. DocId is {2}", new String[] { ext, mimeType, docId });
        }
      }
    }
    if (mod != null)
    {
      modified.setTimeInMillis(Long.parseLong(mod));
    }
    else
    {
      modified.setTimeInMillis(0);
    }
    String creator[] = new String[4];
    creator[0] = (String) request.getParameter(USERNAME);
    creator[1] = (String) request.getParameter(DISPLAYNAME);
    creator[2] = (String) request.getParameter(EMAIL);
    creator[3] = (String) request.getParameter(USERNAME);

    String relativePath = (String) request.getParameter(RELATIVEPATH);
    Set<Permission> permission = Permission.EDIT_SET;
    JSONObject permissions = new JSONObject();
    permissions.put("read", "true");
    boolean isEncrypt = false;
    long mediaSize = 0;
    try
    {
      mediaSize = Long.parseLong(request.getParameter(FILESIZE));
    }
    catch (NumberFormatException e)
    {
      mediaSize = 0;
      LOG.warning("Invalid media size!!!");
    }
    boolean isIBMDocs = false;
    StringBuffer sb = new StringBuffer();
    sb.append("\n");
    sb.append("Repos:" + this.repoId);
    sb.append("\n");
    sb.append("docId:" + docId);
    sb.append("\n");
    sb.append("mimetype:" + mimeType);
    sb.append("\n");
    sb.append("version:" + version);
    sb.append("\n");
    sb.append("title:" + title);
    sb.append("\n");
    sb.append("FileExt:" + ext);
    sb.append("\n");
    sb.append("Modified:" + modified);
    sb.append("\n");
    sb.append("RelativePath:" + relativePath);
    sb.append("\n");
    sb.append("Create0:" + creator[0]);
    sb.append("\n");
    sb.append("Create1:" + creator[1]);
    sb.append("\n");
    sb.append("Create2:" + creator[2]);
    sb.append("\n");
    sb.append("Create3:" + creator[3]);
    sb.append("\n");
    if (user != null)
    {
      sb.append("customid:" + user.getCustomerId());
      sb.append("\n");
      sb.append("getOrgId:" + user.getOrgId());
      sb.append("\n");
      sb.append("id:" + user.getId());
      sb.append("\n");
      sb.append("id:" + user.toString());
      sb.append("\n");
    }
    sb.append("mediaSize:" + mediaSize);
    sb.append("\n");

    LOG.log(Level.FINE, sb.toString());
    JSONObject json = new JSONObject();
    json.put("id", docId);
    Date modifieDate = new Date(modified.getTimeInMillis());
    Calendar modifyCalendar = Calendar.getInstance();
    modifyCalendar.setTime(modifieDate);
    String modifyXmlDateTime = DatatypeConverter.printDateTime(modifyCalendar);
    json.put("modified_at", modifyXmlDateTime);
    json.put("version", version);
    json.put("size", mediaSize);
    JSONObject creatorJson = new JSONObject();
    creatorJson.put("id", user.getId());
    creatorJson.put("name", creator[0]);
    creatorJson.put("email", creator[2]);
    creatorJson.put("org", user.getOrgId());
    json.put("created_by", creatorJson);
    json.put("mime", mimeType);
    json.put("name", docId);
    json.put("permissions", permissions);
    RestDocumentEntry docEntry = new RestDocumentEntry(this.repoId, RepositoryServiceUtil.getRepoTypeFromId(this.repoId), null, json);
    DistributedMap cachedMap = Platform.getDocEntryCacheMap();
    cachedMap.put(docId, docEntry);
    LOG.exiting(this.getClass().getName(), "getEntry");
    return docEntry;
  }

  /**
   * @param user
   * @param docEntry
   * @param type
   */
  private void startSanityFilesHouseKeepingJob(UserBean user, IDocumentEntry docEntry, HouseKeepingType type)
  {
    LOG.entering(this.getClass().getName(), "startSanityFilesHouseKeepingJob", docEntry.getDocId());
    try
    {
      LOG.log(Level.FINE, "Start to schedule the sanity housekeeping job.");
      JSONObject userJsonObject = new JSONObject();
      userJsonObject.put(UserBean.ID.toString(), user.getId());
      userJsonObject.put(UserBean.ORG_ID.toString(), user.getOrgId());
      userJsonObject.put(UserBean.CUSTOMER_ID.toString(), user.getCustomerId());
      userJsonObject.put(UserBean.EMAIL.toString(), user.getEmail());
      userJsonObject.put("modified", this.request.getParameter("modified"));
      Platform.getWorkManager().startWork(new HousekeepingJob(userJsonObject.toString(), docEntry, type));
    }
    catch (WorkException e)
    {
      LOG.log(Level.WARNING, "Failed to start sanity housekeeping job. DocId: " + docEntry.getDocId() + ".", e);
    }
    catch (IllegalArgumentException e)
    {
      LOG.log(Level.WARNING, "Failed to start sanity housekeeping job. DocId: " + docEntry.getDocId() + ".", e);
    }
    LOG.exiting(this.getClass().getName(), "startSanityFilesHouseKeepingJob");
  }
}
