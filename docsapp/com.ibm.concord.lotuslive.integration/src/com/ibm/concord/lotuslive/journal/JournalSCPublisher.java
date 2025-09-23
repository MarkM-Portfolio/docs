package com.ibm.concord.lotuslive.journal;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Calendar;
import java.util.UUID;
import java.util.logging.FileHandler;
import java.util.logging.Filter;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalHelper.Actor;
import com.ibm.concord.platform.journal.JournalHelper.Entity;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.runtime.ServerName;

public class JournalSCPublisher implements IJournalAdapter
{
  private static final Logger LOG = Logger.getLogger(JournalSCPublisher.class.getName());
  private static final Logger JOURNAL_LOG = Logger.getLogger("IBM_DOCS_JOURNAL");

  private static String location;

  static
  {
    location = ServerName.getDisplayName() == null ? "UnknownServer" : ServerName.getDisplayName();
    try
    {
      location = location + "@" + InetAddress.getLocalHost().getHostAddress();
    }
    catch (UnknownHostException e)
    {
      location = location + "@UnknownAddress";
    }
  }

  private JSONObject config;
  private Calendar prev;
  private int interval;

  public void init(JSONObject config)
  {
    prev = init(config, Calendar.getInstance());
  }

  public void publish(Object[] msgBody)
  {
    Calendar now = Calendar.getInstance();
    boolean cond1 = now.get(Calendar.MINUTE) - prev.get(Calendar.MINUTE) >= interval;
    boolean cond2 = now.get(Calendar.HOUR_OF_DAY) != prev.get(Calendar.HOUR_OF_DAY)
        && (now.get(Calendar.MINUTE) + 60) - prev.get(Calendar.MINUTE) >= interval;
    if (cond1 || cond2)
    {
      prev = init(config, now);
      LOG.log(Level.INFO, "Journal log rotates to new timestamp {0}", now.getTimeInMillis());
    }

    JOURNAL_LOG.log(Level.FINEST, "{0}{1}{2}{3}{4}{5}{6}{7}", msgBody);
  }

  public void uninit()
  {
    synchronized (JOURNAL_LOG)
    {
      Handler[] handlers = JOURNAL_LOG.getHandlers();
      if (handlers.length > 0)
      {
        handlers[0].flush();
        handlers[0].close();
        JOURNAL_LOG.removeHandler(handlers[0]);
      }
    }
  }

  private Calendar init(JSONObject config, Calendar rotateTimestamp)
  {
    FileHandler journalHandle = null;
    String journalDirPath = (String) config.get("dir_path");
    String journalRotateFileSize = (String) config.get("size");
    String journalRotateFileCount = (String) config.get("count");
    String journalRotateInterval = (String) config.get("interval");

    try
    {
      if (journalRotateFileSize == null || Integer.parseInt(journalRotateFileSize) < 5)
      {
        journalRotateFileSize = "20";
        LOG.log(Level.CONFIG, "journal_size setting not found or illegal value found, [5, ~] is acceptable, set to default 20(MBs).");
      }
    }
    catch (NumberFormatException e)
    {
      journalRotateFileSize = "20";
      LOG.log(Level.CONFIG, "journal_size illegal value found, set to default 20(MBs).");
    }

    try
    {
      if (journalRotateFileCount == null || Integer.parseInt(journalRotateFileCount) < 10)
      {
        journalRotateFileCount = "50";
        LOG.log(Level.CONFIG, "journal_count setting not found or illegal value found, [10, ~] is acceptable, set to default 50.");
      }
    }
    catch (NumberFormatException e)
    {
      journalRotateFileCount = "50";
      LOG.log(Level.CONFIG, "journal_count illegal value found, set to default 50.");
    }

    try
    {
      if (journalRotateInterval == null || Integer.parseInt(journalRotateInterval) < 5 || Integer.parseInt(journalRotateInterval) > 60)
      {
        journalRotateInterval = "30";
        LOG.log(Level.CONFIG, "journal_interval setting not found or illegal value found, [5, 60] is acceptable, set to default 30(mins).");
      }
    }
    catch (NumberFormatException e)
    {
      journalRotateInterval = "30";
      LOG.log(Level.CONFIG, "journal_interval illegal value found, set to default 30(mins).");
    }
    interval = Integer.parseInt(journalRotateInterval);

    try
    {
      String serverName = ServerName.getDisplayName() == null ? "UnknownServer" : ServerName.getDisplayName();
      if (journalDirPath == null)
      {
        String installRoot = ConcordConfig.getInstance().getInstallRoot();
        String defaultLogDir = installRoot == null ? System.getProperty("user.install.root").concat(File.separator).concat("logs")
            : installRoot;
        if (defaultLogDir == null)
        {
          journalDirPath = "%t/";
          journalDirPath += "journal" + File.separator + serverName + File.separator;
          new File(journalDirPath).mkdirs();
        }
        else
        {
          journalDirPath = defaultLogDir;
          if (!journalDirPath.endsWith(File.separator))
          {
            journalDirPath += File.separator;
          }
          journalDirPath += "journal" + File.separator + serverName + File.separator;
          new File(journalDirPath).mkdirs();
        }
      }
      else
      {
        if (!journalDirPath.endsWith(File.separator))
        {
          journalDirPath += File.separator;
        }
        journalDirPath += "journal" + File.separator + serverName + File.separator;
        new File(journalDirPath).mkdirs();
      }

      journalHandle = new FileHandler(journalDirPath + "journal_docs_%u_%g_" + rotateTimestamp.getTimeInMillis() + ".log",
          Integer.parseInt(journalRotateFileSize) * 1024 * 1024, Integer.parseInt(journalRotateFileCount), true);
      journalHandle.setFormatter(new SC_JSON_Formatter());

      synchronized (JOURNAL_LOG)
      {
        Handler[] allHandlers = JOURNAL_LOG.getHandlers();
        if (allHandlers.length > 0)
        {
          allHandlers[0].flush();
          allHandlers[0].close();
          JOURNAL_LOG.removeHandler(allHandlers[0]);
        }
        JOURNAL_LOG.addHandler(journalHandle);
        JOURNAL_LOG.setFilter(new SC_JSON_Filter());
        JOURNAL_LOG.setLevel(Level.ALL);
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Locating journal file failed.", e);
    }

    this.config = config;

    return rotateTimestamp;
  }

  class SC_JSON_Formatter extends Formatter
  {
    public String format(LogRecord r)
    {
      JSONObject journalRecord = new JSONObject();

      journalRecord.put("date", r.getMillis());
      journalRecord.put("location", location);

      Object[] params = r.getParameters();
//      journalRecord.put("component", params[0].toString());
      journalRecord.put("component", "DOCS");

      if (params[1] instanceof Actor)
      {
        long subscriberId;
        try
        {
          subscriberId = Long.valueOf(((Actor) params[1]).getSubscriberId());
        }
        catch (NumberFormatException e)
        {
          subscriberId = Integer.MIN_VALUE;
        }

        Actor theActor = (Actor) params[1];
        JSONObject theActorInJSON = new JSONObject();
        theActorInJSON.put("subscriberId", subscriberId != Integer.MIN_VALUE ? subscriberId : theActor.getSubscriberId());
        try
        {
          theActorInJSON.put("customerId", Integer.parseInt(theActor.getCustomerId()));
        }
        catch (NumberFormatException e)
        {
          theActorInJSON.put("customerId", 0);
        }
        theActorInJSON.put("email", theActor.getEmail() == null ? "" : theActor.getEmail());
        journalRecord.put("actor", theActorInJSON);
      }
      else
      {
        journalRecord.put("actor", params[1].toString());
      }

      journalRecord.put("action", params[2].toString());

      if (params[3] instanceof Entity)
      {
        Entity objEntity = (Entity) params[3];
        JSONObject theEntityInJSON = new JSONObject();
        theEntityInJSON.put("type", objEntity.getType() == null ? "" : objEntity.getType().toString());
        theEntityInJSON.put("name", objEntity.getName() == null ? "" : objEntity.getName());
        theEntityInJSON.put("id", objEntity.getId() == null ? "" : objEntity.getId());
        try
        {
          theEntityInJSON.put("customerId", Integer.parseInt(objEntity.getCustomerId()));
        }
        catch (NumberFormatException e)
        {
          theEntityInJSON.put("customerId", 0);
        }
        journalRecord.put("object", theEntityInJSON);
      }
      else
      {
        journalRecord.put("object", params[3] == null ? null : params[3].toString());
      }

      if (params[4] instanceof Entity)
      {
        Entity targetEntity = (Entity) params[4];
        JSONObject theEntityInJSON = new JSONObject();
        theEntityInJSON.put("type", targetEntity.getType() == null ? "" : targetEntity.getType().toString());
        theEntityInJSON.put("name", targetEntity.getName() == null ? "" : targetEntity.getName());
        theEntityInJSON.put("id", targetEntity.getId() == null ? "" : targetEntity.getId());
        try
        {
          theEntityInJSON.put("customerId", Integer.parseInt(targetEntity.getCustomerId()));
        }
        catch (NumberFormatException e)
        {
          theEntityInJSON.put("customerId", 0);
        }
        journalRecord.put("target", theEntityInJSON);
      }
      else
      {
        journalRecord.put("target", params[4] == null ? null : params[4].toString());
      }

      journalRecord.put("outcome", params[5].toString());
      journalRecord.put("extra", params[6] == null ? null : params[6].toString());
      journalRecord.put("reason", params[7] == null ? null : params[7].toString());
      return journalRecord.toString() + System.getProperty("line.separator");
    }
  }

  class SC_JSON_Filter implements Filter
  {
    public boolean isLoggable(LogRecord record)
    {
      if (!Level.FINEST.equals(record.getLevel()))
      {
        return false;
      }

      if (record.getParameters().length != 8)
      {
        LOG.log(Level.WARNING, "Bad Journal Entry Length: {0}", record.getMessage().length());
        return false;
      }

      if (record.getParameters()[0] == null)
      {
        LOG.log(Level.WARNING, "Bad Journal Entry. Component is {0}.", record.getParameters()[0]);
        return false;
      }

      if (record.getParameters()[1] == null)
      {
        LOG.log(Level.WARNING, "Bad Journal Entry. Actor is {0}.", record.getParameters()[1]);
        return false;
      }

      if (record.getParameters()[2] == null)
      {
        LOG.log(Level.WARNING, "Bad Journal Entry. Action is {0}.", record.getParameters()[2]);
        return false;
      }

      if (record.getParameters()[5] == null)
      {
        LOG.log(Level.WARNING, "Bad Journal Entry. Outcome is {0} ", record.getParameters()[5]);
        return false;
      }

      return true;
    }
  }

  public static void main(String[] args)
  {
    JournalSCPublisher pub = new JournalSCPublisher();
    try
    {
      {
        JSONObject mockConfig = new JSONObject();
        mockConfig.put("dir_path", "c:\\sc_journal_log\\");
        mockConfig.put("size", "10");
        mockConfig.put("count", "50");
        mockConfig.put("interval", "8");
        pub.init(mockConfig);
      }

      int count = Integer.MAX_VALUE;
      do
      {
        pub.publish(new Object[] { JournalHelper.Component.DOCS_EDITOR, UUID.randomUUID(), JournalHelper.Action.CREATE, UUID.randomUUID(),
            null, JournalHelper.Outcome.SUCCESS, null, null });
        pub.publish(new Object[] { JournalHelper.Component.DOCS_EDITOR, UUID.randomUUID(), JournalHelper.Action.EXPORT, UUID.randomUUID(),
            null, JournalHelper.Outcome.FAILURE, null, null });
        pub.publish(new Object[] { JournalHelper.Component.DOCS_EDITOR, UUID.randomUUID(), JournalHelper.Action.IMPORT, UUID.randomUUID(),
            null, JournalHelper.Outcome.SUCCESS, null, null });
        pub.publish(new Object[] { JournalHelper.Component.DOCS_EDITOR, UUID.randomUUID(), JournalHelper.Action.PUBLISH, UUID.randomUUID(),
            null, JournalHelper.Outcome.SUCCESS, null, null });
        pub.publish(new Object[] { JournalHelper.Component.DOCS_EDITOR, UUID.randomUUID(), JournalHelper.Action.EXPORT, UUID.randomUUID(),
            null, JournalHelper.Outcome.FAILURE, null, null });

        Thread.sleep(10);
      }
      while (--count > 0);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      pub.uninit();
    }
  }
}
