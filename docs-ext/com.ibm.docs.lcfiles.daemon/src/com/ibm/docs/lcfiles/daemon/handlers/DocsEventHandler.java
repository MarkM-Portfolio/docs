/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.lcfiles.daemon.handlers;

import java.util.HashSet;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.connections.spi.events.AbstractEventHandler;
import com.ibm.connections.spi.events.EventHandler;
import com.ibm.connections.spi.events.EventHandlerException;
import com.ibm.connections.spi.events.EventHandlerInitException;
import com.ibm.connections.spi.events.object.Event;
import com.ibm.docs.lcfiles.daemon.config.DocsDaemonConfig;
import com.ibm.docs.lcfiles.daemon.config.LotusConnectionsConfig;

/**
 * Handle the events of Lotus Connections.
 * 
 */
public class DocsEventHandler extends AbstractEventHandler implements EventHandler
{
  private static final Logger LOG = Logger.getLogger(DocsEventHandler.class.getName());

  private static final Map<String, String> VALID_FORMATS = new HashMap<String, String>();

  private DaemonThread daemonThread;

  private boolean isIgnoreEvent = false;

  private static boolean isCCMEnabled = false;

  private static HashSet<String> FILES_DRAFT_CREATE_EVENT_NAMES = new HashSet<String>();

  private static HashSet<String> CCM_DRAFT_CREATE_EVENT_NAMES = new HashSet<String>();

  private static HashSet<String> CCM_DRAFT_DELETE_EVENT_NAMES = new HashSet<String>();

  private static final String FILES_FILE_CREATED = "files.file.created";

  private static final String FILES_FILE_UPDATED = "files.file.updated";

  private static final String MALWARE_SCAN_CLEAN_VALUE = "clean";

  private static final String ECM_FILES_APPROVE_FILE_ECM_REVIEW_DOCUMENT_APPROVED = "ecm_files.approve.file.ecm.review.document.approved";

  private static final String ECM_FILES_POST_FILE_ECM_FILE_CHECKIN = "ecm_files.post.file.ecm.file.checkin";

  private static final String ECM_FILES_DELETE_FILE_ECM_FILE_DELETED = "ecm_files.delete.file.ecm.file.deleted";

  private static final String ECM_FILES_DELETE_FILE_ECM_VERSION_DELETED = "ecm_files.delete.file.ecm.version.deleted";

  private static final String ECM_FILES_UPDATE_FILE_ECM_FILE_CHECKOUT = "ecm_files.update.file.ecm.file.checkout";

  private static final String ECM_FILES_ADD_FILE_ECM_DRAFT_CREATED = "ecm_files.follow.file.ecm.follow.created"; // "ecm_files.add.file.ecm.draft.created";

  private static final String ECM_FILES_ADD_FILE_ECM_FILE_ADDED_TO_TEAMSPACE = "ecm_files.add.file.ecm.file.added.to.teamspace";

  private static final String ECM_FILES_POST_FILE_ECM_DRAFT_UPDATED = "ecm_files.post.file.ecm.draft.updated";

  private static final String ECM_FILES_UPDATE_FILE_ECM_FILE_RESTORE = "ecm_files.update.file.ecm.file.restore";

  static
  {
    VALID_FORMATS.put("odt", "odt");
    VALID_FORMATS.put("odp", "odp");
    VALID_FORMATS.put("ods", "ods");
    VALID_FORMATS.put("doc", "doc");
    VALID_FORMATS.put("docx", "docx");
    VALID_FORMATS.put("ppt", "ppt");
    VALID_FORMATS.put("pptx", "pptx");
    VALID_FORMATS.put("txt", "txt");
    VALID_FORMATS.put("xls", "xls");
    VALID_FORMATS.put("xlsx", "xlsx");

    FILES_DRAFT_CREATE_EVENT_NAMES.add(FILES_FILE_CREATED);
    FILES_DRAFT_CREATE_EVENT_NAMES.add(FILES_FILE_UPDATED);

    CCM_DRAFT_DELETE_EVENT_NAMES.add(ECM_FILES_DELETE_FILE_ECM_FILE_DELETED); // Document deleted
    CCM_DRAFT_DELETE_EVENT_NAMES.add(ECM_FILES_DELETE_FILE_ECM_VERSION_DELETED); // Version or Draft deleted

    // CCM_DRAFT_CREATE_EVENT_NAMES.add(ECM_FILES_UPDATE_FILE_ECM_FILE_CHECKOUT); // check out
    // CCM_DRAFT_CREATE_EVENT_NAMES.add(ECM_FILES_POST_FILE_ECM_FILE_CHECKIN); // upload as version, check in, restore or upload new version
    // trigger check in event
    // CCM_DRAFT_CREATE_EVENT_NAMES.add(ECM_FILES_ADD_FILE_ECM_DRAFT_CREATED); // upload as draft
    CCM_DRAFT_CREATE_EVENT_NAMES.add(ECM_FILES_ADD_FILE_ECM_FILE_ADDED_TO_TEAMSPACE); // upload as version OR draft
    // CCM_DRAFT_CREATE_EVENT_NAMES.add(ECM_FILES_POST_FILE_ECM_DRAFT_UPDATED); // update draft
    // CCM_DRAFT_CREATE_EVENT_NAMES.add(ECM_FILES_UPDATE_FILE_ECM_FILE_RESTORE); // version restore
  }

  /**
   * 
   */
  public DocsEventHandler()
  {
    daemonThread = new DaemonThread();
    isIgnoreEvent = DocsDaemonConfig.getInstance().isIgnoreEvent();
    isCCMEnabled = LotusConnectionsConfig.getInstance().isCCMEnabled();
  }

  /**
   * Check whether the document is an valid IBM Docs document format that need to do uploading convert or not.
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

  public static boolean isValidEvents(String eventName)
  {
    if (isFilesEvents(eventName))
      return true;

    if (isCCMEvents(eventName) && isCCMEnabled)
      return true;

    return false;
  }

  public static boolean isCCMEvents(String eventName)
  {
    if (CCM_DRAFT_DELETE_EVENT_NAMES.contains(eventName))
      return true;
    if (CCM_DRAFT_CREATE_EVENT_NAMES.contains(eventName))
      return true;

    return false;
  }

  public static boolean isFilesEvents(String eventName)
  {
    if (FILES_DRAFT_CREATE_EVENT_NAMES.contains(eventName))
    {
      return true;
    }
    return false;
  }

  public static boolean isDraftCreateEvents(String eventName)
  {
    if (FILES_DRAFT_CREATE_EVENT_NAMES.contains(eventName))
      return true;
    if (CCM_DRAFT_CREATE_EVENT_NAMES.contains(eventName))
      return true;

    return false;
  }

  public static boolean isDraftDeleteEvents(String eventName)
  {
    if (CCM_DRAFT_DELETE_EVENT_NAMES.contains(eventName))
      return true;

    return false;
  }

  /**
   * for event to delete Docs draft, can not be ignored
   * 
   * @param eventName
   * @return
   */
  public static boolean isIgnorableEvents(String eventName)
  {
    if (isDraftDeleteEvents(eventName))
    {
      return false;
    }

    return true;
  }

  /**
   * 
   * @param eventName
   * @return method=value, if deleted a document, value=file, if delete a version, value=version
   */
  public static String getRequestParameters(String eventName)
  {
    if (isDraftDeleteEvents(eventName))
    {
      if (ECM_FILES_DELETE_FILE_ECM_VERSION_DELETED.equalsIgnoreCase(eventName))
      {
        return "?method=version";
      }
      else
      {// "ecm_files.delete.file.ecm.file.deleted"
        return "?method=file";
      }
    }
    else
    {// TODO, identify files and ecm upload convert events here
      return null;
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.connections.spi.events.AbstractEventHandler#init()
   */
  public void init() throws EventHandlerInitException
  {
    LOG.entering(DocsEventHandler.class.getName(), "init()");

    daemonThread.start();

    LOG.exiting(DocsEventHandler.class.getName(), "init()");
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.connections.spi.events.EventHandler#handleEvent(com.ibm.connections.spi.events.object.Event)
   */
  public void handleEvent(Event event) throws EventHandlerException
  {
    LOG.entering(DocsEventHandler.class.getName(), "handleEvent()");

    if (isIgnoreEvent && isIgnorableEvents(event.getName()))
    {
      return;
    }

    if (isValidFormat(event.getItem().getName()))
    {
      EventInfo eventInfo = new EventInfo();
      eventInfo.actorId = event.getActor().getExtID();
      eventInfo.actorEmail = event.getActor().getEmailAddress();
      eventInfo.containerId = event.getContainer().getID();
      eventInfo.eventId = event.getID();
      eventInfo.eventName = event.getName();
      eventInfo.eventTypeName = event.getType().name();
      eventInfo.eventSourceName = event.getSource().getName();
      eventInfo.itemId = isFilesEvents(eventInfo.eventName) ? event.getItem().getID() : event.getProperties().get("rollupid");
      eventInfo.itemName = event.getItem().getName();
      eventInfo.malwareScanState = event.getProperties().get("malwareScanState");

      if (isValidEvents(eventInfo.eventName) && malwareCheck(eventInfo))
      {
        logEventProperties(event);
        daemonThread.submitEvent(eventInfo);
      }
      else
      {
        LOG.log(Level.INFO, "ignored event: " + eventInfo.eventName);
      }
    }

    LOG.exiting(DocsEventHandler.class.getName(), "handleEvent()");
  }

  /*
   * To check whether the downloading file associate with files.file.updated event has been well scanned and is clean.
   */
  private boolean malwareCheck(EventInfo eventInfo)
  {
    // Ignore the event malwareScanStateUpdated
    return (eventInfo.malwareScanState == null || MALWARE_SCAN_CLEAN_VALUE.equals(eventInfo.malwareScanState));
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.connections.spi.events.AbstractEventHandler#destroy()
   */
  public void destroy()
  {
    LOG.entering(DocsEventHandler.class.getName(), "destroy()");

    daemonThread.kill();

    LOG.exiting(DocsEventHandler.class.getName(), "destroy()");
  }

  private void logEventProperties(Event event)
  {
    if (LOG.isLoggable(Level.FINEST))
    {
      LOG.log(Level.FINEST, "logEventProperties:");
      StringBuffer buffer = new StringBuffer();
      buffer.append("Event: " + event.getProperties().toString());
      LOG.log(Level.FINEST, buffer.toString());
    }

  }
}
