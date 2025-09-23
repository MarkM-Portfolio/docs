package com.ibm.docs.viewer.automation;

import com.ibm.json.java.JSONObject;

public class Server
{
  private static final String HOST = "host";
  
  private static final String CTX_ROOT = "context_root";

  private static final String LOGIN_URI = "loginURI";

  private static final String ENV = "env";

  private static final String REPOSITORY_ID = "repositoryId";
  
  private static final String NODE_NUM = "nodenum";
  
  private static final String REPEAT_NUM = "repeat";

  private String host;
  
  private String ctxroot;

  private String env;

  private String repositoryId;
  
  private int nodenum = 2;
  
  private int repeat = 10;

  public Server(String host, String ctx_root, String loginURI, String env, String repositoryId, int nodenum, int repeat)
  {
    super();
    this.host = host;
    this.ctxroot = ctx_root;
    if (this.ctxroot == null || this.ctxroot.length() == 0)
    	this.ctxroot = "/viewer";
    if (!this.ctxroot.startsWith("/"))
    	this.ctxroot = "/"+this.ctxroot;
    this.loginURI = loginURI;
    this.env = env;
    this.repositoryId = repositoryId;
    this.nodenum = nodenum;
    this.repeat = repeat;
  }

  public Server(JSONObject obj)
  {
    this((String) obj.get(HOST), (String)obj.get(CTX_ROOT), (String) obj.get(LOGIN_URI), (String) obj.get(ENV), (String) obj.get(REPOSITORY_ID), 
    		null == obj.get(NODE_NUM)? 2:((Long)obj.get(NODE_NUM)).intValue(), null == obj.get(REPEAT_NUM)? 10:((Long)obj.get(REPEAT_NUM)).intValue());
  }
  
  private String loginURI;

  public String getHost()
  {
    return host;
  }
  
  public String getCtxRoot()
  {
	  return ctxroot;
  }

  public String getLoginURI()
  {
    return loginURI;
  }

  public String getEnv()
  {
    return env;
  }

  public String getRepositoryId()
  {
    return repositoryId;
  }

  public int getRepeatNum()
  {
	  return this.nodenum*this.repeat;
  }
}
