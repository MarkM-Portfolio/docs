package com.ibm.concord.viewer.services.servlet;

import java.util.Calendar;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.job.HousekeepingJob;
import com.ibm.concord.viewer.job.HousekeepingJob.HouseKeepingType;
import com.ibm.concord.viewer.lc3.repository.DocumentEntry;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.AuthenticationComponentImpl;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.services.event.conversion.UploadConversionService;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.news.INewsHandler;
import com.ibm.websphere.asynchbeans.WorkException;
import com.ibm.websphere.cache.DistributedMap;

public class LCFilesNewsHandler implements INewsHandler
{

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

  private Logger log = Logger.getLogger(LCFilesNewsHandler.class.getName());

  private HttpServletRequest request;

  private UserBean user;

  private IDocumentEntry docEntry;

  private EventType req;
  
  private String docId;
  
  private String repoId;

  public LCFilesNewsHandler(HttpServletRequest request, EventType type, String docId, String repoId)
  {
    this.request = request;
    this.user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    this.req = type;
    this.docId=docId;
    this.repoId=repoId;
  }

  @Override
  public IDocumentEntry getDocumentEntry()
  {
    docEntry = this.getEntry(request, user);
    return docEntry;
  }

  @Override
  public void processNewsEvent()
  {
    switch (req)
      {
        case GENERATE_THUMBNAIL :
          ThumbnailService4Doc thums = new ThumbnailService4Doc(user, docEntry);
          thums.exec();
          break;
        case PURGE_ALL :
          startFilesHouseKeepingJob(user, docEntry, HouseKeepingType.PURGEALL);
          break;
        case UPLOAD_FILE :
          startFilesHouseKeepingJob(user, docEntry, HouseKeepingType.PURGEOUTDATED);
          UploadConversionService jms = new UploadConversionService(user, docEntry);
          jms.exec();
          break;
      }

  }

  private IDocumentEntry getEntry(HttpServletRequest request, UserBean user)
  {
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
        log.log(Level.FINER, "Extracted extension is {1}. DocId is {0}", new String[] { docId, ext });
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
          log.log(Level.INFO, "Map extension {0} to mimetype {1}. DocId is {2}", new String[] { ext, mimeType, docId });
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
    boolean isEncrypt = false;
    long mediaSize = 0;
    try
    {
      mediaSize = Long.parseLong(request.getParameter(FILESIZE));
    }
    catch (NumberFormatException e)
    {
      mediaSize = 0;
      log.warning("Invalid media size!!!");
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

    log.log(Level.FINE, sb.toString());
    IDocumentEntry docEntry = new DocumentEntry(this.repoId, this.docId, mimeType, version, title, ext, permission, modified, creator,
        relativePath, isEncrypt, mediaSize, isIBMDocs, relatedCommunityIds);
    DistributedMap cachedMap = Platform.getDocEntryCacheMap();
    cachedMap.put(docId, docEntry);
    return docEntry;
  }

  private void startFilesHouseKeepingJob(UserBean user, IDocumentEntry docEntry, HouseKeepingType type)
  {
    try
    {
      log.log(Level.FINE, "Start to schedule the housekeeping job.");
      Platform.getWorkManager().startWork(new HousekeepingJob(user.getCustomerId(), docEntry, type));
    }
    catch (WorkException e)
    {
      log.log(Level.WARNING, "Failed to start housekeeping job. DocId: " + docEntry.getDocId() + ".", e);
    }
    catch (IllegalArgumentException e)
    {
      log.log(Level.WARNING, "Failed to start housekeeping job. DocId: " + docEntry.getDocId() + ".", e);
    }
  }

}
