package com.ibm.docs.viewer.automation;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map.Entry;
import java.util.logging.Level;

import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig.SC_CASES;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class User
{
  private String id;

  private String password;

  private boolean entitled;

  private LinkedList<SC_CASES> disabledCases;

  private static final String ID = "id";

  private static final String PASSWORD = "password";

  private static final String ENTITLED = "entitled";

  private static final String OBJ_DISABLED_CASES = "disabled_case";

  public User(String id, String password, boolean entitled)
  {
    this.id = id;
    this.password = password;
    this.entitled = entitled;
  }

  public User(JSONObject usrObj)
  {
    this((String) usrObj.get(ID), (String) usrObj.get(PASSWORD), Boolean.valueOf((String) usrObj.get(ENTITLED)));
    JSONArray cases = (JSONArray) usrObj.get(OBJ_DISABLED_CASES);
    if (cases != null && !cases.isEmpty())
    {
      SC_CASES[] allCases = SC_CASES.values();
      for (SC_CASES cs : allCases)
      {
        String key = cs.name().toLowerCase();
        if (cases.contains(key))
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

  public String getId()
  {
    return id;
  }

  public void setId(String id)
  {
    this.id = id;
  }

  public String getPassword()
  {
    return password;
  }

  public void setPassword(String password)
  {
    this.password = password;
  }

  public boolean isEntitled()
  {
    return entitled;
  }

  public boolean isEnabled(SC_CASES cs)
  {
    if (disabledCases != null && disabledCases.contains(cs))
    {
     return  false;
    }
    return true;
  }

  public String printDisabledCases()
  {
    StringBuffer sbf = new StringBuffer();
    if (disabledCases == null)
    {
      sbf.append("none.");
    }
    else
    {
      for (SC_CASES cs : disabledCases)
      {
        sbf.append("\n   ->").append(cs.name());
      }
    }
    return sbf.toString();
  }
}
