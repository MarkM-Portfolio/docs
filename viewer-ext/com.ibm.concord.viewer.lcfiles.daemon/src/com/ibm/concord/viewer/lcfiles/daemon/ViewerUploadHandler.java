/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lcfiles.daemon;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.lcfiles.daemon.EventInfo.EventType;
import com.ibm.concord.viewer.lcfiles.daemon.EventInfo.RepositoryType;
import com.ibm.concord.viewer.lcfiles.daemon.config.ViewerDaemonConfig;
import com.ibm.connections.spi.events.EventHandler;
import com.ibm.connections.spi.events.EventHandlerException;
import com.ibm.connections.spi.events.EventHandlerInitException;
import com.ibm.connections.spi.events.object.Attachment;
import com.ibm.connections.spi.events.object.Event;
import com.ibm.lconn.events.internal.spi.object.InternalItem;

public class ViewerUploadHandler implements EventHandler
{
  private static final Logger LOG = Logger.getLogger(ViewerUploadHandler.class.toString());

  private ViewerDaemonThread daemonThread;

  private boolean enabled = false;

  private String filenetRepositoryId;

  private static final Map<String, String> VALID_FORMATS = new HashMap<String, String>();

  private static final String MALWARE_SCAN_CLEAN_VALUE = "clean";

  static
  {
    VALID_FORMATS.put("odt", "odt");
    VALID_FORMATS.put("odp", "odp");
    VALID_FORMATS.put("ods", "ods");
    VALID_FORMATS.put("doc", "doc");
    VALID_FORMATS.put("docx", "docx");
    VALID_FORMATS.put("ppt", "ppt");
    VALID_FORMATS.put("pptx", "pptx");
    VALID_FORMATS.put("pdf", "pdf");
    VALID_FORMATS.put("xls", "xls");
    VALID_FORMATS.put("xlsx", "xlsx");
    VALID_FORMATS.put("xlsm", "xlsm");
    VALID_FORMATS.put("dot", "dot"); // templates
    VALID_FORMATS.put("dotx", "dotx");
    VALID_FORMATS.put("ott", "ott");
    VALID_FORMATS.put("xlt", "xlt");
    VALID_FORMATS.put("xltx", "xltx");
    VALID_FORMATS.put("ots", "ots");
    VALID_FORMATS.put("pot", "pot");
    VALID_FORMATS.put("potx", "potx");
    VALID_FORMATS.put("otp", "otp");
    VALID_FORMATS.put("rtf", "rtf");
    VALID_FORMATS.put("txt", "txt");
  }

  private static final Map<String, String> VALID_IMAGE_FORMATS = new HashMap<String, String>();

  static
  {
    VALID_IMAGE_FORMATS.put("jpg", "jpg");
    VALID_IMAGE_FORMATS.put("jpeg", "jpeg");
    VALID_IMAGE_FORMATS.put("png", "png");
    VALID_IMAGE_FORMATS.put("bmp", "bmp");
    VALID_IMAGE_FORMATS.put("gif", "gif");
  }

  public ViewerUploadHandler()
  {
    daemonThread = new ViewerDaemonThread();
    if (ViewerDaemonConfig.getInstance().isIgnoreEvent())
    {
      enabled = false;
    }
    else
    {
      enabled = true;
    }

    filenetRepositoryId = ViewerDaemonConfig.getInstance().getFilenetRepositoryId();
    if (filenetRepositoryId == null)
    {
      filenetRepositoryId = "ICObjectStore";
    }
  }

  public void destroy()
  {
    LOG.entering(ViewerUploadHandler.class.getName(), "destroy()");

    daemonThread.kill();

    LOG.exiting(ViewerUploadHandler.class.getName(), "destroy()");
  }

  /**
   * Check whether the document is an valid IBM viewer document format that need to do uploading convert or not.
   * 
   * @param fileName
   * @return
   */
  private boolean isValidFormat(String fileName)
  {
    if (fileName != null && fileName.length() > 0)
    {
      String name = fileName.toLowerCase();
      int index = name.lastIndexOf(".");
      if (index > -1 && VALID_FORMATS.containsKey(name.substring(index + 1)))
      {
        return true;
      }
    }
    return false;
  }

  private boolean isValidImageFormat(String fileName)
  {
    if (fileName != null && fileName.length() > 0)
    {
      String name = fileName.toLowerCase();
      int index = name.lastIndexOf(".");
      if (index > -1 && VALID_IMAGE_FORMATS.containsKey(name.substring(index + 1)))
      {
        return true;
      }
    }
    return false;
  }

  public void handleEvent(Event event) throws EventHandlerException
  {
    LOG.entering(ViewerUploadHandler.class.getName(), "handleEvent", new Object[]{event.getType().toString(), event.getName(), event.getItem().getID()});
    if (!enabled)
    {
      return;
    }
    String eventType = event.getType().toString();
    String eventName = event.getName().toString();

    if (isValidFormat(event.getItem().getName()) || isValidImageFormat(event.getItem().getName()))
    {
      EventInfo eventInfo = new EventInfo();
      if (eventName.contains(RepositoryType.ECM.name().toLowerCase()))
      {
        eventInfo = getECMEvent(event);
      }
      else
      {
        logProperties(event);
        /**
         * Skip events from Verse. Allowed value of updatedVia is 'files | verse | docs.auto | docs.manual | filesync'.
         */
        String uploadVia = event.getProperties().get("updatedVia");
        if (uploadVia != null && uploadVia.equalsIgnoreCase("verse"))
        {
          if(LOG.isLoggable(Level.FINEST))
          {
            LOG.log(Level.FINEST, "Ignored event {0} from Verse. docId = {1}", new Object[] { eventName, event.getItem().getID() });
          }
          return;
        }
        if (!malwareCheck(event))
        {
          LOG.log(Level.INFO, "Ignored event {0} from unscanned file. docId = {1}", new Object[] { eventName, event.getItem().getID() });
          return;
        }
        String contentUpdated = event.getProperties().get("contentUpdated");
        if (eventType.equals("UPDATE") && (contentUpdated == null || contentUpdated.equals("false")))
        {
          String scanStateUpdated = event.getProperties().get("malwareScanStateUpdated");
          if ("false".equals(scanStateUpdated))
          {
            LOG.log(Level.INFO, "Ignored event {0} whose file content is not changed and malwareScanStateUpdated is false . docId = {1}",
                new Object[] { eventName, event.getItem().getID() });
            return;
          }
        }
        String isEncrypted = event.getProperties().get("isEncrypted");
        if (isEncrypted != null && isEncrypted.equals("true"))
        {
          return;
        }
        eventInfo = getLCFilesEvent(event);
      }
      if (eventInfo.request != EventType.IGNORE
          && (isValidFormat(event.getItem().getName()) || (eventInfo.repoId.equalsIgnoreCase(RepositoryType.ECM.name()) && isValidImageFormat(event
              .getItem().getName()))))
      {
        daemonThread.submitEvent(eventInfo);
      }
    }

    LOG.entering(ViewerUploadHandler.class.getName(), "handleEvent", new Object[]{event.getType().toString(), event.getName(), event.getItem().getID()});
  }

  private void logProperties(Event event)
  {
    if(LOG.isLoggable(Level.FINEST))
    {
      Map<String, String> p = event.getProperties();
      Iterator<String> itor = p.keySet().iterator();
      while (itor.hasNext())
      {
        String k = itor.next();
        String v = p.get(k);
        LOG.log(Level.FINEST, "Properties: " + k + "-" + v);
      }    
    }
  }

  /*
   * To check whether the downloading file associate with files.file.updated event has been well scanned and is clean.
   */
  private boolean malwareCheck(Event event)
  {
    String eventName = event.getName().toString();
    if ("files.file.updated".equals(eventName) || "files.file.created".equals(eventName))
    {
      // no malwareScanState property in On-premise use case and in files.file.created event
      if (event.getProperties().get("malwareScanState") == null)
      {
        return true;
      }
      return MALWARE_SCAN_CLEAN_VALUE.equals(event.getProperties().get("malwareScanState"));
    }
    return true;
  }

  private EventInfo getLCFilesEvent(Event event)
  {
    EventInfo eventInfo = new EventInfo();
    eventInfo.repoId = RepositoryType.LCFILES.name().toLowerCase();
    eventInfo.request = getRequestType(event.getName().toString());
    String temp = event.getItem().getName();
    if (temp.lastIndexOf(".") != -1)
    {
      eventInfo.extention = temp.substring(temp.lastIndexOf(".") + 1);
    }
    eventInfo.actorId = event.getActor().getExtID();
    eventInfo.actorEmail = event.getActor().getEmailAddress();
    eventInfo.actorName = event.getActor().getDisplayName();
    eventInfo.docId = event.getItem().getID();
    eventInfo.modified = String.valueOf(((InternalItem) event.getItem()).getLastUpdate().getTime());
    eventInfo.title = event.getItem().getName();
    eventInfo.relatedCommunityIds = null;
    Set<String> ids = event.getRelatedCommunityIDs();
    Iterator<String> itrStr = ids.iterator();
    while (itrStr.hasNext())
    {
      eventInfo.relatedCommunityIds = itrStr.next();
    }
    Iterator<Attachment> itr = event.getAttachmentData().getAdded().iterator();
    while (itr.hasNext())
    {
      Attachment attach = itr.next();
      eventInfo.relativePath = attach.getFileSystemLocation();
      eventInfo.version = attach.getVersion();
      eventInfo.mimetype = attach.getContentType();
      try
      {
        InputStream st = attach.getInputStream();
        eventInfo.fileSize = String.valueOf(st.available());
        st.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "File Size cannot be read");
      }
    }
    if (eventInfo.version == null || eventInfo.version.equals(""))
    {
      eventInfo.version = event.getProperties().get("versionNumber");
    }
    if (eventInfo.fileSize == null || eventInfo.fileSize.equals(""))
    {
      eventInfo.fileSize = event.getProperties().get("fileSize");
    }
    return eventInfo;
  }

  private EventInfo getECMEvent(Event event)
  {
    EventInfo eventInfo = new EventInfo();
    eventInfo.repoId = RepositoryType.ECM.name().toLowerCase();
    eventInfo.actorId = event.getActor().getExtID();
    eventInfo.actorEmail = event.getActor().getEmailAddress();
    eventInfo.actorName = event.getActor().getDisplayName();
    eventInfo.title = event.getItem().getName();
    eventInfo.relatedCommunityIds = null;
    if (eventInfo.title.lastIndexOf(".") != -1)
    {
      eventInfo.extention = eventInfo.title.substring(eventInfo.title.lastIndexOf(".") + 1);
    }
    eventInfo.request = getRequestType(event.getName().toString());
    if (eventInfo.request == EventType.PURGE_VERSION || eventInfo.request == EventType.GENERATE_THUMBNAIL)
    {
      eventInfo.docId = "idd_" + event.getProperties().get("rollupid") + "@" + filenetRepositoryId;
    }
    else
    {
      eventInfo.docId = "idv_" + event.getProperties().get("rollupid") + "@" + filenetRepositoryId;
    }
    eventInfo.modified = String.valueOf(((InternalItem) event.getItem()).getLastUpdate().getTime());
    return eventInfo;
  }

  private EventType getRequestType(String eventName)
  {
    EventType type = EventType.IGNORE;
    if (eventName.equals("files.command.createthumbnail") || eventName.equals("ecm_files.generate.file.ccm.tool"))
    {
      type = EventType.GENERATE_THUMBNAIL;
    }
    else if (eventName.equals("files.file.updated") || eventName.equals("files.file.created")
        || eventName.equals("ecm_files.add.file.ecm.file.added.to.teamspace"))
    {
      type = EventType.UPLOAD_FILE;
    }
    else if (eventName.equals("ecm_files.post.file.ecm.draft.updated"))
    {
      type = EventType.UPDATE_DRAFT;
    }
    else if (eventName.equals("ecm_files.update.file.ecm.file.checkout"))
    {
      type = EventType.CREATE_DRAFT;
    }
    else if (eventName.equals("ecm_files.post.file.ecm.file.checkin")
        || eventName.equals("ecm_files.approve.file.ecm.review.document.approved"))
    {
      type = EventType.PUBLISH_DRAFT;
    }
    else if (eventName.equals("ecm_files.delete.file.ecm.version.deleted"))
    {
      type = EventType.PURGE_VERSION;
    }
    else if (eventName.equals("files.file.deleted") || eventName.equals("ecm_files.delete.file.ecm.file.deleted"))
    {
      type = EventType.PURGE_ALL;
    }
    else if (eventName.equals("files.file.undeleted") || eventName.equals("ecm_files.update.file.ecm.file.restore"))
    {
      type = EventType.RESTORE_ALL;
    }
    return type;
  }

  public void init() throws EventHandlerInitException
  {
    LOG.entering(ViewerUploadHandler.class.getName(), "init()");

    daemonThread.start();

    LOG.exiting(ViewerUploadHandler.class.getName(), "init()");
  }
}
