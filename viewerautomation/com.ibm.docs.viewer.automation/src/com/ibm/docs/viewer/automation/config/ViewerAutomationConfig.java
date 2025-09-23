package com.ibm.docs.viewer.automation.config;

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.Test;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.docs.viewer.automation.User;
import com.ibm.docs.viewer.automation.util.EnvironmentType;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ViewerAutomationConfig
{
  private JSONObject config = null;

  private Server server;

  private User defaultUser;

  private LinkedList<User> users;

  private static final String OBJ_SERVER = "server";

  private static final String OBJ_CLIENT = "client";

  private static final String OBJ_CURRENTUSER = "currentUser";

  private static final String OBJ_USERS = "users";

  private static final String OBJ_PROXY = "proxy";

  private static ViewerAutomationConfig instance = null;

  private static final Logger logger = Logger.getLogger(ViewerAutomationConfig.class.getName());

  private static final String OBJ_ENABLED = "enabled";

  private static final String OBJ_HTMLVIEW = "htmlview";

  private static final String OBJ_ENABLE_FULLVIEWER = "enable_fullviewer";

  private static final String OBJ_EXCLUDE = "exclude";

  private static final String OBJ_FILEVIEWER = "fileviewer";

  private static final String OBJ_CASES = "cases";

  private LinkedList<SC_CASES> disabledCases;

  private JSONObject proxy;

  private boolean proxyEnabled;

  private boolean htmlEnabled;

  private boolean fullViewerEnabled;

  private String[] excludes;

  private int repeat = 30;

  private Boolean snapshotEnabled;

  private Boolean fileViewerEnabled;

  public enum SC_CASES {
    VIEW_ATTACH_DOC, VIEW_ATTACH_PPT, VIEW_ATTACH_XLS, VIEW_ATTACH_DOCX, VIEW_ATTACH_PPTX, VIEW_ATTACH_XLSX, VIEW_ATTACH_ODT, VIEW_ATTACH_ODS, VIEW_ATTACH_ODP, VIEW_ATTACH_PDF, VIEW_FILES, VIEW_FILELINK_IN_VERSE, VERSE_CALLFLOW, THUMBNAILS_ON_UPLOAD, SNOOP
  }

  ViewerAutomationConfig(InputStream is)
  {
    try
    {
      config = JSONObject.parse(is);

      // init server
      JSONObject serverConfig = (JSONObject) config.get(OBJ_SERVER);
      server = new Server(serverConfig);
      repeat = server.getRepeatNum();

      // init cases
      JSONObject cases = (JSONObject) config.get(OBJ_CASES);
      if (cases != null)
      {
        SC_CASES[] allCases = SC_CASES.values();
        for (SC_CASES cs : allCases)
        {
          String key = cs.name().toLowerCase();
          if (cases.containsKey(key))
          {
            Boolean v = Boolean.valueOf((String) cases.get(key));
            if (!v)
            {
              if (disabledCases == null)
              {
                disabledCases = new LinkedList<SC_CASES>();
              }
              disabledCases.add(cs);
            }
          }
        }
      }

      // init users
      JSONArray usrArray = (JSONArray) config.get(OBJ_USERS);
      Iterator iterator = usrArray.iterator();
      while (iterator.hasNext())
      {
        JSONObject usrObj = (JSONObject) iterator.next();
        User user = new User(usrObj);

        if (Boolean.valueOf((String) usrObj.get(OBJ_CURRENTUSER)))
        {
          defaultUser = user;
        }
        if (users == null)
        {
          users = new LinkedList<User>();
        }
        users.add(user);
      }

      // init proxy
      proxy = (JSONObject) config.get(OBJ_PROXY);
      if (proxy != null)
      {
        proxyEnabled = Boolean.getBoolean((String) proxy.get(OBJ_ENABLED));
        fullViewerEnabled = Boolean.valueOf((String) proxy.get(OBJ_ENABLE_FULLVIEWER));
        fileViewerEnabled = Boolean.valueOf((String) proxy.get(OBJ_FILEVIEWER));

        JSONObject htmlViewConfig = (JSONObject) proxy.get(OBJ_HTMLVIEW);
        htmlEnabled = Boolean.valueOf((String) htmlViewConfig.get(OBJ_ENABLED));
        String value = (String) htmlViewConfig.get(OBJ_EXCLUDE);
        if (value != null && !value.trim().isEmpty())
        {
          excludes = value.split(";");
        }
      }

      StringBuffer buf = new StringBuffer("");
      buf.append("\n   Proxy configuration is ").append(proxyEnabled ? " enabled." : " disabled.");
      buf.append("\n   Full viewer is ").append(fullViewerEnabled ? "enabled." : "disabled.");
      buf.append("\n   Html is ").append(htmlEnabled ? "enabled" : "disabled");
      if (excludes == null)
      {
        buf.append(".");
      }
      else
      {
        buf.append(", exludes");
        for (String e : excludes)
        {
          buf.append(" ").append(e);
        }
      }
      buf.append("\n   Disabled cases are:");
      if (disabledCases != null)
      {
        for (SC_CASES cs : disabledCases)
        {
          buf.append("\n   ->").append(cs.name());
        }
      }
      else
      {
        buf.append(" none.");
      }
      logger.log(Level.INFO, buf.toString());
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Unable to init automation configuration.", e);
      System.exit(-1);
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Unable to init automation configuration.", e);
      System.exit(-1);
    }
  }

  public boolean getProxyEnabled()
  {
    return proxyEnabled;
  }

  public boolean getHTMLView()
  {
    return htmlEnabled;
  }

  public boolean getSnapshotEnabled()
  {
    return snapshotEnabled;
  }

  public boolean getFileViewerEnabled()
  {
    return fileViewerEnabled;
  }

  public boolean getFullViewerEnabled()
  {
    return fullViewerEnabled;
  }

  public boolean isExcluded(String title)
  {
    String ext = title.substring(title.lastIndexOf(".") + 1);
    if (excludes != null)
    {
      for (String e : excludes)
      {
        if (ext.equalsIgnoreCase(e))
        {
          return true;
        }
      }
    }

    return false;
  }

  public Server getServer()
  {
    return server;
  }

  public LinkedList<User> getUsers()
  {
    return users;
  }

  public User getDefaultUser()
  {
    return defaultUser;
  }

  public static void create(String path) throws Exception
  {
    instance = null;
    File configFile = new File(path);
    if (!configFile.exists() || configFile.isDirectory())
    {
      String msg = path + " does not exist or it is a directory.";
      logger.warning(msg);
      throw new InvalidParameterException(msg);
    }

    try
    {
      instance = new ViewerAutomationConfig(new FileInputStream(configFile));
      // logConfiguration();
    }
    catch (FileNotFoundException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
  }

  private static void logConfiguration()
  {
    StringBuffer sbf = new StringBuffer();
    sbf.append("   Server: ").append(instance.getServer().getHost()).append("\n");
    sbf.append("   USer: ").append(instance.getDefaultUser().getId());
    if (instance.getDefaultUser().isEntitled())
    {
      sbf.append(" (entitled).");
    }
    else
    {
      sbf.append(" (non-entitled).");
    }
    logger.info(sbf.toString());
  }

  public static void createDefault()
  {
    instance = new ViewerAutomationConfig(ViewerAutomationConfig.class.getResourceAsStream("config_pipeline.json"));
//    logConfiguration();
  }

  public static ViewerAutomationConfig getConfig()
  {
    if (instance == null)
    {
      createDefault();
    }
    return instance;
  }

  public String getUserAgent()
  {
    return (String) ((JSONObject) config.get(OBJ_CLIENT)).get("agent");
  }

  public String getSampleBase()
  {
    return (String) config.get("sample_base");
  }

  public String getContextRoot()
  {
    JSONObject serverConfig = (JSONObject) config.get(OBJ_SERVER);
    return (String) serverConfig.get("contextroot");
  }

  public EnvironmentType envType()
  {
    if (server.getEnv().equals("local"))
      return EnvironmentType.LOCAL;
    else if (server.getEnv().equals("onpremise"))
      return EnvironmentType.ONPREMISE;
    else if (server.getEnv().equals("smartcloud"))
      return EnvironmentType.SMARTCLOUD;
    else
      return null;

  }

  public int getSnoopRepeatNum()
  {
    return this.repeat;
  }

  @Test
  public void testDefaultConfigServer()
  {
    Server s = ViewerAutomationConfig.getConfig().getServer();
    assertEquals("host information", s.getHost(), "https://docs10.cn.ibm.com");
    assertEquals("login uri information", s.getLoginURI(), "/files/j_security_check");
  }

  @Test
  public void testDefaultConfigUser()
  {
    User u = ViewerAutomationConfig.getConfig().getDefaultUser();
    assertEquals("user id", "docs67", u.getId());
    assertEquals("password", "passw0rd", u.getPassword());
  }

  @Test
  public void testDefaultConfigAgent()
  {
    String s = ViewerAutomationConfig.getConfig().getUserAgent();
    assertEquals("user id", "Mozilla/5.0 (Windows NT 5.1; rv:18.0) Gecko/20100101 Firefox/16.0", s);
  }

  public boolean isEnabled(SC_CASES cs)
  {
    if (disabledCases != null && disabledCases.contains(cs))
    {
      return false;
    }
   
    return true;
  }
}
