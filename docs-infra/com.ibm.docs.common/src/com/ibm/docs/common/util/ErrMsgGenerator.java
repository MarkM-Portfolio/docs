package com.ibm.docs.common.util;

import java.io.IOException;
import java.util.Calendar;
import java.util.HashMap;

import com.ibm.docs.common.util.JsonMapConverter;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.runtime.ServerName;

public class ErrMsgGenerator
{
  private static HashMap<String, String> map = new HashMap<String, String>();

  private static HashMap<String, String> jobServerMap = new HashMap<String, String>();

  public static synchronized void register(String job_id, String ServerName)
  {
    jobServerMap.put(job_id, ServerName);
  }

  public static synchronized void deregister(String job_id)
  {
    jobServerMap.remove(job_id);
  }

  private static void refrash()
  {
    map.put("docs_server", ServerName.getFullName());

    map.put("datetime", Calendar.getInstance().getTime().toString());
  }

  public static synchronized String generate(String file_id, String job_id)
  {
    refrash();
    if (file_id != null)
    {
      map.put("file_id", file_id);
    }
    if (job_id != null)
    {
      map.put("conversion_server", jobServerMap.get(job_id));
      jobServerMap.remove(job_id);
    }
    JSONObject json = JsonMapConverter.convert(map);
    String result = "";
    try
    {
      result = json.serialize();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return result;
  }
}
