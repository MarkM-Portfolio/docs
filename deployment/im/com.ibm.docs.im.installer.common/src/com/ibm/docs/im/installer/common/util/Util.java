/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2012.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.common.util;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringReader;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.Socket;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.Vector;
import java.util.regex.Matcher;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Platform;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ILogLevel;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.internal.Messages;

public class Util
{
  private static final ILogger logger = IMLogger.getLogger(Util.class.getCanonicalName());

  public static final String VERSION_PATTERN = ".*'?(\\d+){1}\\.(\\d+){1}\\.(\\d+){1}\\.(\\d+){1}'?.*"; // NON-NLS-1

  public static final String PROCESS_EXIT_CODE = "EXIT_CODE"; // NON-NLS-1

  public static final String PROCESS_STD_OUT = "STD_OUT"; // NON-NLS-1

  public static final String PROCESS_STD_ERR = "STD_ERR"; // NON-NLS-1

  public static final String WAS_INFO = "was_user_pwd_dir";

  public static final String LINE_SEPRATOR = "\n"; // NON-NLS-1

  public static final String LIST_SEPRATOR = ";"; // NON-NLS-1

  public static final String LIST_SUB_SEPRATOR = ":"; // NON-NLS-1

  public static final int VALID_PORT_NUMBER_LOWEST = 1;

  public static final int VALID_PORT_NUMBER_HIGHEST = 65535;

  public static final String LOOPBACK = "127.0.0.1"; // NON-NLS-1

  public static final boolean LOCAL_DEBUG_MODE = true;

  private final static String FILE_SEPARATOR = System.getProperty("file.separator"); // NON-NLS-1

  private static Random random;

  static
  {
    random = new Random();
    random.setSeed(System.currentTimeMillis());
  }

  private Util()
  {
    ;
  }

  /**
   * Validate was admin,password
   * 
   * @param String
   *          admin,String pwd,String wasInstallRoot
   * 
   * @return boolean
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public final static boolean isDmgr(String adminName, String adminPwd, String wasInstallRoot, String scriptDir) throws IOException,
      InterruptedException
  {
    if (adminName == null || adminPwd == null || wasInstallRoot == null || scriptDir == null)
    {
      throw new NullPointerException();
    }
    logger.debug("isDmgr->START: {0} {1} {2}", new Object[] { wasInstallRoot, adminName, adminPwd }); // NON-NLS-1

    Vector<String> results = new Vector<String>();
    // String sGetSoapCMD = Util.class.getClass().getResource("/").getPath();
    String adminTask = scriptDir + "isDmgr.py";
    Map<String, String> exitResult = executeAdminTask(wasInstallRoot, adminName, adminPwd, adminTask); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String dmgrStr = null;
        while ((dmgrStr = br.readLine()) != null && dmgrStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (dmgrStr != null)
        {
          // dmgrStr = dmgrStr.substring(1, dmgrStr.length() - 1);
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          dmgrStr = dmgrStr.replace(token, " ");
          String[] rets = dmgrStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0 && rets[1].equalsIgnoreCase("true"))
          {
            results.add(rets[0] + LIST_SEPRATOR + rets[1]);
          }
          else
          {
            logger.error("isDmgr->isDmgr.py: Can not find any dgmr node {0}.", new Object[] { exitResult.toString() }); // NON-NLS-1
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("isDmgr->isDmgr.py: Can not find any dgmr node {0}.", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("isDmgr->END: {0}", new Object[] { results.toArray(new String[results.size()]) }); // NON-NLS-1

    if (results.size() > 0)
      return true;
    else
      return false;
  }

  /**
   * Validate was admin,password
   * 
   * @param String
   *          admin,String pwd,String wasInstallRoot
   * 
   * @return boolean
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public final static Map<String, String> verifyWASAdminPassword(String adminName, String adminPwd, String wasInstallRoot, String scriptDir)
      throws IOException, InterruptedException
  {
    if (adminName == null || adminPwd == null || wasInstallRoot == null || scriptDir == null)
    {
      throw new NullPointerException();
    }
    logger.debug("verifyWASAdminPassword->START: {0} {1} {2}", new Object[] { wasInstallRoot, adminName, adminPwd }); // NON-NLS-1

    String adminTask = scriptDir + "verifyWASAdminPWD.py";
    // String sGetSoapCMD = Util.class.getClass().getResource("/").getPath();
    Map<String, String> exitResult = executeAdminTask(wasInstallRoot, adminName, adminPwd, adminTask); // NON-NLS-1 NON-NLS-2

    logger.debug("verifyWASAdminPassword->END: {0}", new Object[] { exitResult.values() }); // NON-NLS-1

    return exitResult;
  }

  /**
   * Get SOAP port
   * 
   * @return int
   */
  public final static int getSOAP(String adminName, String adminPwd, String wasInstallRoot, boolean isDmgr, String scriptDir)
      throws IOException, InterruptedException
  {
    int soapPort = 8879;

    if (adminName == null || adminPwd == null || wasInstallRoot == null || scriptDir == null)
    {
      throw new NullPointerException();
    }
    logger.debug("getSOAP->START: {0} {1} {2} {3}", new Object[] { wasInstallRoot, adminName, adminPwd, isDmgr }); // NON-NLS-1

    Vector<String> results = new Vector<String>();
    // String sGetSoapCMD = Util.class.getClass().getResource("/").getPath();
    String adminTask = null;
    String scriptFile = null;
    if (isDmgr)
    {
      adminTask = scriptDir + "get_dmgr_soap_port.py";
      scriptFile = "get_dmgr_soap_port.py";
    }
    else
    {
      adminTask = scriptDir + "get_appsrv_soap_port.py";
      scriptFile = "get_appsrv_soap_port.py";
    }

    Map<String, String> exitResult = executeAdminTask(wasInstallRoot, adminName, adminPwd, adminTask); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          // retStr = retStr.substring(1, retStr.length() - 1);
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          // String[] servers = serversStr.split("\\s+"); // Split by whitespace NON-NLS-1
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0 && rets[1].equalsIgnoreCase("Successfully"))// for (String server : servers)
          {
            soapPort = Integer.valueOf(rets[1]);
            results.add(rets[0] + LIST_SEPRATOR + rets[1]);
          }
          else
          {
            logger.error("getSOAP->" + scriptFile + " failed to get SOAP: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("getSOAP->" + scriptFile + ": failed to get SOAP: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("getSOAP->END: {0}", new Object[] { results.toArray(new String[results.size()]) }); // NON-NLS-1

    return soapPort;
  }

  /**
   * verify was info, including user,pw,and was installation directory, along geting soap
   * 
   * @return int
   */
  public final static Map<String, String> verifyWASInfo(String adminName, String adminPwd, String wasInstallRoot, String scriptDir)
      throws IOException, InterruptedException
  {
    int soapPort = 8879;

    if (adminName == null || adminPwd == null || wasInstallRoot == null || scriptDir == null)
    {
      throw new NullPointerException();
    }
    logger.debug("verifyWASInfo->START: {0} {1} {2}", new Object[] { wasInstallRoot, adminName, adminPwd }); // NON-NLS-1

    // Vector<String> results = new Vector<String>();
    Map<String, String> results = new HashMap<String, String>();
    // String sGetSoapCMD = Util.class.getClass().getResource("/").getPath();
    String adminTask = scriptDir + "get_dmgr_soap_port.py";
    String scriptFile = "get_dmgr_soap_port.py";

    Map<String, String> exitResult = executeAdminTask(wasInstallRoot, adminName, adminPwd, adminTask); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null)// && retStr.trim().startsWith("WASX"))
        {
          // NON-NLS-1
          // ; // Skip the WAS message line(s)
          if (retStr != null)
          {
            if (retStr.trim().startsWith("WASX"))
            {
              if (retStr.indexOf("because of an authentication failure") >= 0
                  || retStr.indexOf("Ensure that user and password are correct on the command line") >= 0)
              {
                logger.error("verifyWASInfo->" + scriptFile + " wrong user or password: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
                results.put(WAS_INFO, "false");
              }
            }
            else
            {
              // retStr = retStr.substring(1, retStr.length() - 1);
              String token = "\\n"; // NON-NLS-1
              if (Platform.OS_WIN32.equals(Platform.getOS()))
                token = "\\r\\n"; // NON-NLS-1
              retStr = retStr.replace(token, " ");
              // String[] servers = serversStr.split("\\s+"); // Split by whitespace NON-NLS-1
              String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
              if (rets.length > 0)
              {
                results.put(rets[0], rets[1]);
              }
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("verifyWASInfo->" + scriptFile + ": failed to get SOAP: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("verifyWASInfo->END: {0}", new Object[] { results.values().toArray(new String[results.size()]) }); // NON-NLS-1

    return results;
  }

  /**
   * verify was info, including user,pw,and was installation directory, along geting soap
   * 
   * @return int
   */
  public final static Map<String, String> getDeploymentEnvInfo(String adminName, String adminPwd, String wasInstallRoot, String apps[],
      String scriptDir) throws IOException, InterruptedException
  {
    int soapPort = 8879;

    if (adminName == null || adminPwd == null || wasInstallRoot == null || apps == null || scriptDir == null)
    {
      throw new NullPointerException();
    }
    logger.debug("getDeploymentEnvInfo->START: {0} {1} {2} {3}", new Object[] { wasInstallRoot, adminName, adminPwd, apps }); // NON-NLS-1

    // Vector<String> results = new Vector<String>();
    Map<String, String> results = new HashMap<String, String>();
    // String sGetSoapCMD = Util.class.getClass().getResource("/").getPath();
    String adminTask = scriptDir + "get_topology_info.py";
    String scriptFile = "get_topology_info.py";

    Map<String, String> exitResult = executeAdminTask(wasInstallRoot, adminName, adminPwd, adminTask, apps); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null)// && retStr.trim().startsWith("WASX"))
        {
          // NON-NLS-1
          // ; // Skip the WAS message line(s)
          if (retStr != null)
          {
            if (retStr.trim().startsWith("WASX"))
            {
              if (retStr.indexOf("because of an authentication failure") >= 0
                  || retStr.indexOf("Ensure that user and password are correct on the command line") >= 0)
              {
                logger.error("verifyWASInfo->" + scriptFile + " wrong user or password: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
                results.put(WAS_INFO, "false");
              }
            }
            else
            {
              // retStr = retStr.substring(1, retStr.length() - 1);
              String token = "\\n"; // NON-NLS-1
              if (Platform.OS_WIN32.equals(Platform.getOS()))
                token = "\\r\\n"; // NON-NLS-1
              retStr = retStr.replace(token, " ");
              // String[] servers = serversStr.split("\\s+"); // Split by whitespace NON-NLS-1
              String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
              if (rets.length > 0)
              {
                results.put(rets[0], rets[1]);
              }
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("verifyWASInfo->" + scriptFile + ": failed to get SOAP: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("verifyWASInfo->END: {0}", new Object[] { results.values().toArray(new String[results.size()]) }); // NON-NLS-1

    return results;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @return Vector - the list of cluster members in the form: nodeName:serverName
   * 
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Vector<String> getAppNodes(String profilePath, String adminName, String adminPwd, String scriptDir) throws IOException,
      InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getClusterMembers->START: {0} {1} {2}", // NON-NLS-1
        new Object[] { profilePath, adminName, adminPwd });

    Vector<String> results = new Vector<String>();
    String adminTask = scriptDir + "get_app_nodes.py";
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0)// for (String server : servers)
          {
            // NODE_HOST::::hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT;
            String node_host_str = rets[1];
            String[] nodes_hosts = node_host_str.split(Util.LIST_SEPRATOR);
            for (String node_host : nodes_hosts)
            {
              // String[] nodehost = node_host.split(":");
              // results.add(nodehost[0] + LIST_SEPRATOR + nodehost[1]);
              results.add(node_host);
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("getAppNodes->get_app_nodes.py: Can not find any node {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("getAppNodes->END: {0}", new Object[] { results.toArray(new String[results.size()]) }); // NON-NLS-1

    return results;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param clusterName
   *          Cluster name to be created
   * @return boolean - true or false
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static boolean crateCluster(String profilePath, String adminName, String adminPwd, String clusterName, String scriptDir)
      throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || clusterName == null || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("crateCluster->START: {0} {1} {2} {3}", // NON-NLS-1
        new Object[] { profilePath, adminName, adminPwd, clusterName });

    boolean bSuccessful = false;
    // String adminTask = "C:\\tmp\\iserver\\pythonScripts\\create_cluster_and_server.py" + " " + clusterName;
    String adminTask = scriptDir + "create_cluster_and_server.py";
    String args[] = new String[2];
    args[0] = "Cluster";
    args[1] = clusterName;
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask, args); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0)// for (String server : servers)
          {
            // CreatedCluster/ExistedCluster::::clustername/None
            String retClustername = rets[1];
            if (retClustername.equalsIgnoreCase(clusterName))
              bSuccessful = true;
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("crateCluster->create_cluster_and_server.py: failed to create cluster {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("crateCluster->END: {0}", new Object[] { bSuccessful }); // NON-NLS-1

    return bSuccessful;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param clusterName
   *          Cluster name to create server
   * @param nodename
   *          node name to create server
   * @param servername
   *          server name to be created
   * @return boolean - true or false
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static boolean crateClusterServer(String profilePath, String adminName, String adminPwd, String clusterName, String nodename,
      String servername, String scriptDir) throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || clusterName == null || nodename == null || servername == null
        || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("crateClusterServer->START: {0} {1} {2}", // NON-NLS-1
        new Object[] { clusterName, nodename, servername });

    boolean bSuccessful = false;
    // String adminTask = "C:\\tmp\\iserver\\pythonScripts\\create_cluster_and_server.py" + " " + clusterName + " " + nodename + " " +
    // servername;
    String adminTask = scriptDir + "create_cluster_and_server.py";
    String args[] = new String[4];
    args[0] = "Server";
    args[1] = clusterName;
    args[2] = nodename;
    args[3] = servername;
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask, args); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0)// for (String server : servers)
          {
            // CreatedServer/ExistedServer::::servername/None
            String retServername = rets[1];
            if (retServername.equalsIgnoreCase(servername))
              bSuccessful = true;
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("crateClusterServer->create_cluster_and_server.py: failed to create server {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("crateClusterServer->END: {0}", new Object[] { bSuccessful }); // NON-NLS-1

    return bSuccessful;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param clusterName
   *          & nodename & servername list
   * 
   * @return boolean - true or false
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static boolean crateClusterAndServer(String profilePath, String adminName, String adminPwd, String encodedInfo, String scriptDir, StringBuffer serverNames)
      throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || encodedInfo == null || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("crateClusterAndServer->START: {0}", // NON-NLS-1
        new Object[] { encodedInfo });

    boolean bSuccessful = false;
    // String adminTask = "C:\\tmp\\iserver\\pythonScripts\\create_cluster_and_server.py" + " " + clusterName + " " + nodename + " " +
    // servername;
    String adminTask = scriptDir + "create_cluster_and_server.py";
    String args[] = new String[2];
    args[0] = "clusterserver";
    args[1] = encodedInfo;
    // clustername::::nodename::servername:::nodename::servername;clustername::::nodename::servername:::nodename::servername;
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask, args); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0 && !rets[1].equalsIgnoreCase("None"))
          {
            bSuccessful = true;
            // CreatedServer/ExistedServer::::servername/None
            while ((retStr = br.readLine()) != null)
            {
              if (retStr.trim().startsWith("ExistedServer::::"))
              {
                if (serverNames.length() == 0)
                {
                  serverNames.append("'").append(retStr.trim().substring(17)).append("'");
                }
                else
                {
                  serverNames.append(",'").append(retStr.trim().substring(17)).append("'");
                }

                bSuccessful = false;
              }
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("crateClusterAndServer->create_cluster_and_server.py: failed to create server {0}",
          new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("crateClusterAndServer->END: {0}", new Object[] { bSuccessful }); // NON-NLS-1

    return bSuccessful;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param hostname
   *          Target server host name to register
   * @param username
   *          OS account used to register host
   * @param userPwd
   *          password of username above
   * @param osType
   *          windows or linux
   * @return boolean - true or false
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Map<String, String> prepareJobTarget(String profilePath, String adminName, String adminPwd, String targetInfo, String scriptDir, String sudoEnabled)
      throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || targetInfo == null || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("prepareJobTarget->START: {0}", // NON-NLS-1
        new Object[] { targetInfo });

    Map<String, String> results = new HashMap<String, String>();
    String adminTask = scriptDir + "prepare_job_targets.py";
    String args[] = new String[2];
    // hostname:username:password:ostype;
    args[0] = sudoEnabled;
    args[1] = targetInfo;
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask, args); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0 && !rets[1].isEmpty())// for (String server : servers)
          {
            // PrepareJobTarget::::hostname:True/False;hostname:True/False;
            String[] Targets = rets[1].split(Util.LIST_SEPRATOR);
            for (String target : Targets)
            {
              String[] status = target.split(Util.LIST_SUB_SEPRATOR);
              results.put(status[0], status[1]);              
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("prepareJobTarget->prepare_job_targets.py: failed to parepare target {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("prepareJobTarget->END: {0}", new Object[] { results.values().toArray(new String[results.size()]) }); // NON-NLS-1

    return results;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param clusterName
   *          Cluster name to create server
   * @param nodename
   *          node name to create server
   * @param servername
   *          server name to be created
   * @return boolean - true or false
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static String getNodeVariable(String profilePath, String adminName, String adminPwd, String nodename, String varname,
      String scriptDir) throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || nodename == null || varname == null || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getNodeVariable->START: {0} {1}", // NON-NLS-1
        new Object[] { nodename, varname });

    String sVarValue = null;
    String adminTask = scriptDir + "get_node_variable.py";
    String args[] = new String[2];
    args[0] = nodename;
    args[1] = varname;
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask, args); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0)// for (String server : servers)
          {
            // CreatedServer/ExistedServer::::servername/None
            String retVarValue = rets[1];
            if (!retVarValue.equalsIgnoreCase("NONE"))
              sVarValue = retVarValue;
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("getNodeVariable->get_node_variable.py: failed to get variable value {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("getNodeVariable->END: {0}", new Object[] { sVarValue }); // NON-NLS-1

    return sVarValue;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * 
   * @return String - local host name
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static String getLocalHost(String profilePath, String adminName, String adminPwd, String scriptDir) throws IOException,
      InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getLocalHost->START: {0} {1} {2}", // NON-NLS-1
        new Object[] { profilePath, adminName, adminPwd });

    String sVarValue = null;
    String adminTask = scriptDir + "get_local_host.py";
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          String[] rets = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (rets.length > 0)// for (String server : servers)
          {
            // "LOCAL_HOST::::"+nodehostname
            sVarValue = rets[1];
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("getLocalHost->get_local_host.py: failed to get local hostname{0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("getLocalHost->END: {0}", new Object[] { sVarValue }); // NON-NLS-1

    return sVarValue;
  }

  /**
   * Get the app node list of the cell managed
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * 
   * @return String - local host name
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Map<String, String> getClusterInfoForApps(String profilePath, String adminName, String adminPwd, String apps[],
      String scriptDir) throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || apps == null || apps.length == 0 || scriptDir == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getClusterInfoForApps->START: {0}", // NON-NLS-1
        new Object[] { apps });

    Map<String, String> returns = new HashMap<String, String>();
    String sVarValues = null;
    String adminTask = scriptDir + "get_cluster_info_for_app.py";
    Map<String, String> exitResult = executeAdminTask(profilePath, adminName, adminPwd, adminTask, apps); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null && retStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (retStr != null)
        {
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          retStr = retStr.replace(token, " ");
          // ClusterInfo::::app:::cluster::node,server:node,server:node,server;
          String[] retAppss = retStr.split(Constants.SEPARATE_CHARS); // Split by whitespace NON-NLS-1
          if (retAppss.length > 0)
          {
            String[] rets = retAppss[1].split(Util.LIST_SEPRATOR);
            for (String entry : rets)
            {
              String appcluster[] = entry.split(Constants.SEPARATE_SUB_CHARS);
              returns.put(appcluster[0], appcluster[1]);
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("getClusterInfoForApps->get_cluster_info_for_app.py: failed to get cluster for apps {0}",
          new Object[] { apps.toString() }); // NON-NLS-1
    }

    logger.debug("getClusterInfoForApps->END: {0}", new Object[] { returns.values().toArray() }); // NON-NLS-1

    return returns;
  }

  
  /**
   * verify was info, including user,pw,and was installation directory, along geting soap
   * 
   * @return int
   */
  public final static boolean validateNFS(String adminName, String adminPwd, String wasInstallRoot, String nfsInfo[], String scriptDir)
      throws IOException, InterruptedException
  {
    if (adminName == null || adminPwd == null || wasInstallRoot == null || nfsInfo == null || scriptDir == null)
    {
      throw new NullPointerException();
    }
    logger.debug("validateNFS->START: {0} {1} {2} {3}", new Object[] { wasInstallRoot, adminName, adminPwd, nfsInfo }); // NON-NLS-1

    boolean bRet = false;
    
    String adminTask = scriptDir + "remote_validate_job.py";
    String scriptFile = "remote_validate_job.py";

    Map<String, String> exitResult = executeAdminTask(wasInstallRoot, adminName, adminPwd, adminTask, nfsInfo); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String retStr = null;
        while ((retStr = br.readLine()) != null)// && retStr.trim().startsWith("WASX"))
        {
          // NON-NLS-1
          // ; // Skip the WAS message line(s)

          if (retStr != null)
          {
            // retStr = retStr.substring(1, retStr.length() - 1);
            String token = "\\n"; // NON-NLS-1
            if (Platform.OS_WIN32.equals(Platform.getOS()))
              token = "\\r\\n"; // NON-NLS-1
            retStr = retStr.replace(token, " ");
            if (retStr.indexOf("jobmanager task for Conversion nfs check complete successfully") != -1
                || retStr.indexOf("jobmanager task for Docs nfs check complete successfully") != -1
                || retStr.indexOf("jobmanager task for Conversion and Docs nfs check complete successfully") != -1)
            {
              bRet = true;
              break;
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("validateNFS->" + scriptFile + ": failed to get SOAP: {0}", new Object[] { exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("validateNFS->END: {0}", new Object[] { bRet }); // NON-NLS-1

    return bRet;
  }
  
  /**
   * Determines if the Installer is in Local Debug Mode
   * 
   * @return boolean
   */
  public final static boolean isLocalDebugMode()
  {
    return LOCAL_DEBUG_MODE;
  }

  /**
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable
   *          Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable, PrintWriter writer)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        if (writer != null)
        {
          String closeInformationMessage = Messages.bind("Exception occurred while closing a resource: {0}", e.getLocalizedMessage()); //$NON-NLS-1$
          writer.println(closeInformationMessage);
        }
        else
        {
          logger.debug("Exception occurred while closing a resource: {0}", new Object[] { e.getLocalizedMessage() }); // NON-NLS-1
        }
      }
    }
  }

  /**
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable
   *          Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Socket closeable, PrintWriter writer)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        if (writer != null)
        {
          String closeInformationMessage = Messages.bind("Exception occurred while closing a resource: {0}", e.getLocalizedMessage()); //$NON-NLS-1$
          writer.println(closeInformationMessage);
        }
        else
        {
          logger.debug("Exception occurred while closing a resource: {0}", new Object[] { e.getLocalizedMessage() }); // NON-NLS-1
        }
      }
    }
  }

  /**
   * Determines if a port number is valid
   * 
   * @param port
   *          Port number
   * @return boolean True/False
   */
  public static boolean isPortValid(int port)
  {
    if ((port < VALID_PORT_NUMBER_LOWEST) || (port > VALID_PORT_NUMBER_HIGHEST))
    {
      return false;
    }
    return true;
  }

  /**
   * Determines if a port is currently in use on the Loopback IP address
   * 
   * @param port
   *          Port number
   * @return boolean True/False
   */
  public static boolean isLoopbackPortInUse(int port)
  {
    Socket socket = null;
    try
    {
      socket = new Socket();
      socket.bind(new InetSocketAddress(InetAddress.getByName(LOOPBACK), port));
      return false;
    }
    catch (Exception e)
    {
      logger.debug("Exception occurred while binding to port {0}: ", new Object[] { port, e.getLocalizedMessage() }); // NON-NLS-1
    }
    finally
    {
      closeResource(socket, null);
    }
    return true;
  }

  /**
   * Check if the hostName is local to this node (localhost or loopback or a local interface)
   * 
   * @param hostName
   *          - hostname or IP address
   * @return true (if local), false (if non-local)
   * @throws UnknownHostException
   *           - if hostName cannot be resolved
   */
  public static boolean isAddressLocal(String hostName) throws UnknownHostException
  {
    // Get the InetAddress using the hostname or IP address
    InetAddress address = InetAddress.getByName(hostName);

    // First check if it is localhost or a loopback address
    if (address.isAnyLocalAddress() || address.isLoopbackAddress())
      return true;

    // Next check if the address is defined on one of our interfaces
    try
    {
      return NetworkInterface.getByInetAddress(address) != null;
    }
    catch (SocketException e)
    {
      return false;
    }
  }

  public static IOffering findOffering(IAgentJob[] jobs, String offeringId)
  {
    for (IAgentJob job : jobs)
    {
      IOffering offering = job.getOffering();
      if (offering != null && offering.getIdentity().getId().equals(offeringId) == true)
      {
        return offering;
      }
    }
    return null;
  }

  public static boolean checkMinimumVersionString(Matcher checkedVersion, Matcher minimumVersion)
  {
    if (!checkedVersion.matches() || !minimumVersion.matches())
    {
      throw new IllegalArgumentException();
    }

    for (int i = 1; i < Math.min(checkedVersion.groupCount(), minimumVersion.groupCount()) + 1; i++)
    {
      if (checkedVersion.group(i).compareTo(minimumVersion.group(i)) > 0)
      {
        return true;
      }
      else if (checkedVersion.group(i).compareTo(minimumVersion.group(i)) < 0)
      {
        return false;
      }
      else
      {
        continue;
      }
    }
    return true;
  }

  public static String evalVersion(Matcher checkedVersion)
  {
    if (!checkedVersion.matches())
    {
      throw new IllegalArgumentException();
    }

    StringBuffer result = new StringBuffer();
    for (int i = 1; i < checkedVersion.groupCount() + 1; i++)
    {
      result.append(checkedVersion.group(i)).append('.');
    }
    return result.toString().substring(0, result.length() - 1);
  }

  /**
   * Builds the command string to run the specified WAS command
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param type
   *          Command type
   * 
   * @return String Command String
   */
  public static String getExecPath(String profilePath, int type)
  {
    if (profilePath == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getWsadminExecPath->START: {0} {1}", new Object[] { profilePath, type }); // NON-NLS-1

    String execName = null;
    switch (type)
      {
        case 0 :
          execName = "wsadmin"; // NON-NLS-1
          break;
        case 1 :
          execName = "startServer"; // NON-NLS-1
          break;
        case 2 :
          execName = "stopServer"; // NON-NLS-1
          break;
      }

    if (execName == null)
    {
      logger.error("Can not find the executable for type {0}.", type); // NON-NLS-1
      throw new NullPointerException();
    }

    String execPath = null;
    if (Platform.OS_LINUX.equals(Platform.getOS()))
    {
      File wsadminExec = new File(new File(profilePath, "bin"), execName + ".sh"); // NON-NLS-1 // NON-NLS-2
      execPath = wsadminExec.getPath();
    }
    else if (Platform.OS_WIN32.equals(Platform.getOS()))
    {
      File wsadminExec = new File(new File(profilePath, "bin"), execName + ".bat"); // NON-NLS-1 // NON-NLS-2
      execPath = wsadminExec.getPath();
    }
    else
    {
      execPath = null;
    }

    logger.debug("getWsadminExecPath-END: {0}", new Object[] { execPath }); // NON-NLS-1

    return execPath;
  }

  /**
   * Builds the command string to check the WAS Server status
   * 
   * @param profilePath
   *          Path to the WAS profile
   * 
   * @return String Command String
   */
  private static String getServerStatusExecPath(String profilePath)
  {
    if (profilePath == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getServerStatusExecPath->START: {0}", new Object[] { profilePath }); // NON-NLS-1

    String serverStatusExecPath = null;
    if (Platform.OS_LINUX.equals(Platform.getOS()))
    {
      File wsadminExec = new File(new File(profilePath, "bin"), "serverStatus.sh"); // NON-NLS-1 // NON-NLS-2
      serverStatusExecPath = wsadminExec.getPath();
    }
    else if (Platform.OS_WIN32.equals(Platform.getOS()))
    {
      File wsadminExec = new File(new File(profilePath, "bin"), "serverStatus.bat"); // NON-NLS-1 // NON-NLS-2
      serverStatusExecPath = wsadminExec.getPath();
    }
    else
    {
      serverStatusExecPath = null;
    }

    logger.debug("getServerStatusExecPath-END: {0}", new Object[] { serverStatusExecPath }); // NON-NLS-1

    return serverStatusExecPath;
  }

  /**
   * Check the server running status.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param serverName
   *          WAS Server instance name or the Deployment Manager instance name
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @return Map with results from the executed command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Map<String, String> checkServerStatus(String profilePath, String serverName, String adminName, String adminPwd)
      throws IOException, InterruptedException
  {
    if (profilePath == null || serverName == null || adminName == null || adminPwd == null)
    {
      throw new NullPointerException();
    }

    logger.debug("checkServerStatus->START: {0} {1} {2}", new Object[] { profilePath, adminName, adminPwd }); // NON-NLS-1

    String serverStatusExecPath = getServerStatusExecPath(profilePath);

    if (serverStatusExecPath == null)
    {
      throw new NullPointerException();
    }

    Map<String, String> exitResult = new HashMap<String, String>();
    String[] commandArgs = new String[6];
    commandArgs[0] = serverStatusExecPath;
    commandArgs[1] = serverName;
    commandArgs[2] = "-username"; // NON-NLS-1
    commandArgs[3] = adminName;
    commandArgs[4] = "-password"; // NON-NLS-1
    commandArgs[5] = adminPwd;

    logger.debug("Validate profile connectivity by executing command: {0}", new Object[] { commandArgs }); // NON-NLS-1

    Process p = Runtime.getRuntime().exec(commandArgs);
    exitResult = Util.waitToRetrieveProcessResult(p);

    logger.debug("checkServerStatus->END: {0}", new Object[] { exitResult.values() }); // NON-NLS-1

    return exitResult;
  }

  /**
   * Get the members of the specified cluster.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param clusterName
   *          Cluster to list
   * @param returnNodeName
   *          true if the node name associated with the members are to be returned
   * @return Vector - the list of cluster members in the form: nodeName:serverName
   * 
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Vector<String> getClusterMembers(String profilePath, int dmgrSoapPort, String adminName, String adminPwd,
      String clusterName, boolean returnNodeName) throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || clusterName == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getClusterMembers->START: {0} {1} {2} {3}", // NON-NLS-1
        new Object[] { profilePath, dmgrSoapPort, adminName, adminPwd });

    Vector<String> results = new Vector<String>();
    Map<String, String> exitResult = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd,
        "AdminConfig.list('ClusterMember',AdminConfig.getid('/ServerCluster:" + clusterName + "/'))"); // NON-NLS-1 NON-NLS-2

    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      BufferedReader br = null;
      BufferedReader br2 = null;
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String serversStr = null;
        while ((serversStr = br.readLine()) != null && serversStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (serversStr != null)
        {
          serversStr = serversStr.substring(1, serversStr.length() - 1);
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          serversStr = serversStr.replace(token, " ");
          String[] servers = serversStr.split("\\s+"); // Split by whitespace NON-NLS-1
          for (String server : servers)
          {
            String serverName = server.substring(0, server.indexOf("(cells/")); // NON-NLS-1
            if (returnNodeName)
            {
              Map<String, String> exitResult2 = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd,
                  "AdminConfig.showAttribute('" + server + "', 'nodeName')"); // NON-NLS-1 NON-NLS-2

              if (Integer.valueOf(exitResult2.get(PROCESS_EXIT_CODE)) == 0)
              {
                br2 = new BufferedReader(new StringReader(exitResult2.get(PROCESS_STD_OUT)));
                br2.readLine(); // The first line is useless, so just leave it off.
                String nodeName = br2.readLine();
                nodeName = nodeName.substring(1, nodeName.length() - 1);
                results.add(nodeName + LIST_SEPRATOR + serverName);
              }
              else
              {
                logger.error("getClusterMembers->getNodeName: Can not find the node name for the server {0}. {1}", new Object[] { server,
                    exitResult2.toString() });
                results.clear();
                break;
              }
            }
            else
            {
              results.add("" + LIST_SEPRATOR + serverName);
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
        closeResource(br2, null);
      }
    }
    else
    {
      logger.error("getClusterMembers->getServerName: Can not find any cluster member for the cluster {0}. {1}", new Object[] {
          clusterName, exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("getClusterMembers->END: {0}", new Object[] { results.toArray(new String[results.size()]) }); // NON-NLS-1

    return results;
  }

  /**
   * Determine if the specified server cluster exists.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param clusterName
   *          Cluster to check
   * @return IStatus - Status.OK_STATUS if the cluster exists, an error status if an error occurred.
   * 
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static IStatus isServerClusterByName(String profilePath, int dmgrSoapPort, String adminName, String adminPwd, String clusterName)
      throws IOException, InterruptedException
  {

    IStatus resultStatus = Status.OK_STATUS;
    if (profilePath == null || adminName == null || adminPwd == null || clusterName == null)
    {
      throw new NullPointerException();
    }

    logger.debug("isServerClusterByName->START: {0} {1} {2} {3}", // NON-NLS-1
        new Object[] { profilePath, dmgrSoapPort, adminName, adminPwd });

    boolean clusterExists = false;
    Map<String, String> exitResult = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd,
        "AdminConfig.list('ServerCluster',AdminConfig.getid('/ServerCluster:" + clusterName + "/'))"); // NON-NLS-1 NON-NLS-2

    BufferedReader br = null;
    try
    {
      if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String serverClusterStr = null;
        while ((serverClusterStr = br.readLine()) != null && serverClusterStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (serverClusterStr != null)
        {
          serverClusterStr = serverClusterStr.substring(1, serverClusterStr.length() - 1);
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          serverClusterStr = serverClusterStr.replace(token, " ");
          String[] serverClusters = serverClusterStr.split("\\s+"); // Split by whitespace NON-NLS-1
          for (String serverCluster : serverClusters)
          {
            String serverClusterName = serverCluster.substring(0, serverCluster.indexOf("(cells/")); // NON-NLS-1
            if (serverClusterName.equalsIgnoreCase(clusterName))
            {
              clusterExists = true;
              break;
            }
          }
        }
      }
      else
      {
        logger.error("isServerClusterByName: Can not find cluster {0}. {1}", new Object[] { clusterName, exitResult.toString() }); // NON-NLS-1
        // Return the appropriate error based on the messages in std-out
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String serverClusterStr = null;
        while ((serverClusterStr = br.readLine()) != null)
        {
          if (serverClusterStr.contains("WASX7246E") || serverClusterStr.contains("ADMN0022E") || serverClusterStr.contains("ADMU0002E"))
          {
            logger.log(ILogLevel.ERROR, "Authentication failed to check the cluster exists. {0}", new Object[] { exitResult.values() }); // NON-NLS-1
            resultStatus = IMStatuses.ERROR.get(Messages.getString("Message_AdminPwdValFailed$uuid"), Messages.getString("Message_AdminPwdValFailed$explanation"),
                Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message"));
            break;
          }
          else if (serverClusterStr.contains("WASX7070E") || serverClusterStr.contains("WASX8011W"))
          {
            logger.log(ILogLevel.ERROR, "Configuration service is not available. {0}", new Object[] { exitResult.values() }); // NON-NLS-1
            resultStatus = IMStatuses.ERROR.get(Messages.getString("Message_AdminTaskFailed$uuid"), Messages.getString("Message_AdminTaskFailed$explanation"),
                Messages.getString("Message_AdminTaskFailed$useraction"), 0, Messages.getString("Message_AdminTaskFailed$message"));
            break;
          }
        }
      }
    }
    finally
    {
      closeResource(br, null);
    }

    if (resultStatus == Status.OK_STATUS && !clusterExists)
    {
      // Cluster doesn't exist
      logger.log(ILogLevel.ERROR, "Cluster not found. {0}", new Object[] { exitResult.values() }); // NON-NLS-1
      resultStatus = IMStatuses.ERROR.get(Messages.getString("Message_AdminClusterValidateFailed$uuid"),
          Messages.getString("Message_AdminClusterValidateFailed$explanation"), Messages.getString("Message_AdminClusterValidateFailed$useraction"), 0,
          Messages.getString("Message_AdminClusterValidateFailed$message"));
    }
    logger.debug("isServerClusterByName->END: {0}", new Object[] { clusterExists }); // NON-NLS-1
    return resultStatus;
  }

  /**
   * Determine if the specified application is installed.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param applicationName
   *          Application to check
   * @return boolean - true if the application is installed, false if it is not or if an error occurred.
   * 
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static boolean isApplicationInstalled(String profilePath, int dmgrSoapPort, String adminName, String adminPwd,
      String applicationName) throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null || applicationName == null)
    {
      throw new NullPointerException();
    }

    logger.debug("isApplicationInstalled->START: {0} {1} {2} {3}", // NON-NLS-1
        new Object[] { profilePath, dmgrSoapPort, adminName, adminPwd });

    boolean applicationInstalled = false;
    Map<String, String> exitResult = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd, "AdminApp.list()"); // NON-NLS-1

    BufferedReader br = null;
    if (Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE)) == 0)
    {
      try
      {
        br = new BufferedReader(new StringReader(exitResult.get(PROCESS_STD_OUT)));
        String installedApplicationsStr = null;
        while ((installedApplicationsStr = br.readLine()) != null && installedApplicationsStr.trim().startsWith("WASX"))
          // NON-NLS-1
          ; // Skip the WAS message line(s)
        if (installedApplicationsStr != null)
        {
          installedApplicationsStr = installedApplicationsStr.substring(1, installedApplicationsStr.length() - 1);
          String token = "\\n"; // NON-NLS-1
          if (Platform.OS_WIN32.equals(Platform.getOS()))
            token = "\\r\\n"; // NON-NLS-1
          installedApplicationsStr = installedApplicationsStr.replace(token, " ");
          String[] applications = installedApplicationsStr.split("\\s+"); // Split by whitespace NON-NLS-1
          for (String application : applications)
          {
            if (application.equalsIgnoreCase(applicationName))
            {
              applicationInstalled = true;
              break;
            }
          }
        }
      }
      finally
      {
        closeResource(br, null);
      }
    }
    else
    {
      logger.error("isApplicationInstalled: Can not obtain list of applications {0}. {1}",
          new Object[] { applicationName, exitResult.toString() }); // NON-NLS-1
    }

    logger.debug("isApplicationInstalled->END: {0}", new Object[] { applicationInstalled }); // NON-NLS-1

    return applicationInstalled;
  }

  /**
   * Verify that we are able to mount and unmount the remote path. Additionally, verify we can successfully write a file to it. Note: this
   * method will always return with the remote path unmounted.
   * 
   * NOTE: this method is currently only written to support Windows.
   * 
   * @param localPath
   *          - the local path used to access the file from the client
   * @param remoteHost
   *          - the server containing the remote share. This method is not intended to be used for localhost.
   * @param remotePath
   *          - the remote path which will be mounted to the local path.
   * @return resultStatus - Status.OK_STATUS if successful, IStatus containing an error if an error occurs.
   */
  public static IStatus verifyMount(String localPath, String remoteHost, String remotePath)
  {
    if (localPath == null || remotePath == null)
    {
      throw new NullPointerException();
    }

    IStatus resultStatus = Status.OK_STATUS;
    logger.debug("verifyMount->START: {0} {1}", // NON-NLS-1
        new Object[] { localPath, remotePath });

    // First check if the localPath exists. If it already exists, return an error.
    File localFile = new File(localPath);
    if (localFile.exists())
      return IMStatuses.ERROR.get(Messages.Message_SharedDataDirectoryExist$uuid, Messages.Message_SharedDataDirectoryExist$explanation,
          Messages.Message_SharedDataDirectoryExist$useraction, 0, Messages.Message_SharedDataDirectoryExist$message, localFile.getPath());
    File[] roots = File.listRoots();
    for (File root : roots)
    {
      if (root.equals(localFile))
      {
        return IMStatuses.ERROR
            .get(Messages.Message_SharedDataDirectoryExist$uuid, Messages.Message_SharedDataDirectoryExist$explanation,
                Messages.Message_SharedDataDirectoryExist$useraction, 0, Messages.Message_SharedDataDirectoryExist$message,
                localFile.getPath());
      }
    }

    // Next attempt to mount the remote directory.
    // NOTE: Sysnative is a Windows alias for accessing \system32 (64 bit system commands, executables, and dll's)
    // from a 32 bit process. Since we are using a 32 bit version of IM, we need to use this to prevent
    // windows from redirecting \system32 to \sysWOW64. mount and umount only exist in \system32. If
    // we start supporting 64 bit IM, this will need to be handled differently.
    String systemPath = System.getenv("SYSTEMROOT") + "\\Sysnative\\"; // NON-NLS-1
    Process p;
    Map<String, String> exitResult;
    String[] commandArgs = new String[9];
    commandArgs[0] = systemPath + "mount.exe"; // NON-NLS-1
    commandArgs[1] = "-o"; // NON-NLS-1
    commandArgs[2] = "mtype=soft"; // NON-NLS-1
    commandArgs[3] = "retry=10"; // NON-NLS-1
    commandArgs[4] = "timeout=6"; // NON-NLS-1
    commandArgs[5] = "casesensitive=yes"; // NON-NLS-1
    commandArgs[6] = "anon"; // NON-NLS-1
    commandArgs[7] = remoteHost + ":" + remotePath; // NON-NLS-1
    commandArgs[8] = localPath;

    try
    {
      p = Runtime.getRuntime().exec(commandArgs);
      exitResult = Util.waitToRetrieveProcessResult(p);
    }
    catch (Exception e)
    {
      logger.error("verifyMount: Unable to mount the remote path {0}. {1}", new Object[] { remotePath, e.getMessage() }); // NON-NLS-1
      return IMStatuses.ERROR.get(Messages.Message_MountCommandFailed$uuid, Messages.Message_MountCommandFailed$explanation,
          Messages.Message_MountCommandFailed$useraction, 0, Messages.Message_MountCommandFailed$message);
    }

    String resultMessage = null;
    int processExitCode = Integer.valueOf(exitResult.get(PROCESS_EXIT_CODE));
    if (processExitCode == 0)
    {
      // Mount was successful. Attempt to write a random file to it to verify we can write.
      resultStatus = testWrite(localPath);

      // Unmount the remote directory
      commandArgs = new String[2];
      commandArgs[0] = systemPath + "umount.exe"; // NON-NLS-1
      commandArgs[1] = localPath;

      try
      {
        Process p2 = Runtime.getRuntime().exec(commandArgs);
        Map<String, String> exitResult2 = Util.waitToRetrieveProcessResult(p2);
        if (Integer.valueOf(exitResult2.get(PROCESS_EXIT_CODE)) != 0)
        {
          logger.error("verifyMount: Unable to unmount local path {0}. {1}", new Object[] { localPath, exitResult.toString() }); // NON-NLS-1
        }
      }
      catch (Exception e)
      {
        logger.error("verifyMount: Unable to unmount local path {0}. {1}", new Object[] { localPath, e.getMessage() }); // NON-NLS-1
      }
    }
    else
    {
      logger.error("verifyMount: Unable to mount the remote path {0}. {1}", new Object[] { remotePath, exitResult.toString() }); // NON-NLS-1
      if (processExitCode == 9009)
      {
        // Mount command has not been installed. Required pre-requisite is missing.
        resultStatus = IMStatuses.ERROR.get(Messages.Message_MountCommandNotInstalled$uuid,
            Messages.Message_MountCommandNotInstalled$explanation, Messages.Message_MountCommandNotInstalled$useraction, 0,
            Messages.Message_MountCommandNotInstalled$message);
      }
      else
      {
        // Mount command is installed but we are unable to mount the remote path.
        resultStatus = IMStatuses.ERROR.get(Messages.Message_MountCommandFailed$uuid, Messages.Message_MountCommandFailed$explanation,
            Messages.Message_MountCommandFailed$useraction, 0, Messages.Message_MountCommandFailed$message);
      }
    }

    logger.debug("verifyMount->END: {0}", new Object[] { resultMessage }); // NON-NLS-1

    return resultStatus;
  }

  /**
   * Test if we are able to create and write to a file on the specified localPath. The localPath may either be on the local file system or
   * mounted to a remote file system. This will write a randomly named file to verify we will be able to write to it.
   * 
   * @param localPath
   *          - the path to write the test file to.
   * @return resultStatus - Status.OK_STATUS if successful, IStatus containing an error if an error occurs.
   */
  public static IStatus testWrite(String localPath)
  {
    IStatus resultStatus = Status.OK_STATUS;
    if (localPath == null)
    {
      throw new NullPointerException();
    }

    long rid = 0;
    rid = System.currentTimeMillis() + random.nextInt();
    String fileName = "TEST" + Long.toHexString(rid);
    File cfgFile = new File(localPath + FILE_SEPARATOR + fileName);
    try
    {
      boolean success = cfgFile.createNewFile();
      if (success)
      {
        // Able to create the file, now verify we can write to it
        if (!cfgFile.canWrite())
        {
          // Unable to write to a file on the share
          logger.error("testWrite: Unable to write file {0}.", new Object[] { cfgFile.getAbsolutePath() }); // NON-NLS-1
          return IMStatuses.ERROR.get(Messages.Message_WriteFileFailed$uuid, Messages.Message_WriteFileFailed$explanation,
              Messages.Message_WriteFileFailed$useraction, 0, Messages.Message_WriteFileFailed$message);
        }
      }
      else
      {
        // Unable to create a file on the share
        logger.error("testWrite: Unable to create file {0}.", new Object[] { cfgFile.getAbsolutePath() }); // NON-NLS-1
        return IMStatuses.ERROR.get(Messages.Message_CreateFileFailed$uuid, Messages.Message_CreateFileFailed$explanation,
            Messages.Message_CreateFileFailed$useraction, 0, Messages.Message_CreateFileFailed$message);
      }
    }
    catch (Exception e)
    {
      // Unable to create a file on the share
      logger.error("testWrite: Unable to create file {0}. {1}", new Object[] { cfgFile.getAbsolutePath(), e.getMessage() }); // NON-NLS-1
      return IMStatuses.ERROR.get(Messages.Message_CreateFileFailed$uuid, Messages.Message_CreateFileFailed$explanation,
          Messages.Message_CreateFileFailed$useraction, 0, Messages.Message_CreateFileFailed$message);
    }
    finally
    {
      try
      {
        cfgFile.delete();
      }
      catch (Exception e)
      {
        logger.error("testWrite: Unable to delete file {0}. {1}", new Object[] { cfgFile.getAbsolutePath(), e.getMessage() }); // NON-NLS-1
      }
    }

    return resultStatus;
  }

  /**
   * Perform SOAP connection validation and check the node version of the server.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param nodeName
   *          WAS Node name
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @return Map with results from the executed command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Map<String, String> checkNodeVersion(String profilePath, int dmgrSoapPort, String nodeName, String adminName,
      String adminPwd) throws IOException, InterruptedException
  {
    if (profilePath == null || nodeName == null || adminName == null || adminPwd == null)
    {
      throw new NullPointerException();
    }

    logger.debug("checkNodeVersion->START: {0} {1} {2} {3} {4}", // NON-NLS-1
        new Object[] { profilePath, dmgrSoapPort, nodeName, adminName, adminPwd });

    Map<String, String> exitResult = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd,
        "AdminTask.getNodeBaseProductVersion('[-nodeName " + nodeName + "]')"); // NON-NLS-1

    logger.debug("checkNodeVersion->END: {0}", new Object[] { exitResult.values() }); // NON-NLS-1

    return exitResult;
  }

  /**
   * Perform SOAP connection validation and check if the node is federated.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @return Map with results from the executed AdminTask.isFederated() command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Map<String, String> isFederated(String profilePath, int dmgrSoapPort, String adminName, String adminPwd)
      throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null)
    {
      throw new NullPointerException();
    }

    logger.debug("isFederated->START: {0} {1} {2} {3}", // NON-NLS-1
        new Object[] { profilePath, dmgrSoapPort, adminName, adminPwd });

    Map<String, String> exitResult = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd, "AdminTask.isFederated()"); // NON-NLS-1

    logger.debug("isFederated->END: {0}", new Object[] { exitResult.values() }); // NON-NLS-1

    return exitResult;
  }

  /**
   * Perform SOAP connection validation and check if there is a dmgr in this deployment. If there is a dmgr, where is it (hostname, port,
   * and name).
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @return Map with results from the executed AdminTask.isFederated() command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  public static Map<String, String> getDmgrProperties(String profilePath, int dmgrSoapPort, String adminName, String adminPwd)
      throws IOException, InterruptedException
  {
    if (profilePath == null || adminName == null || adminPwd == null)
    {
      throw new NullPointerException();
    }

    logger.debug("getDmgrProperties->START: {0} {1} {2} {3}", // NON-NLS-1
        new Object[] { profilePath, dmgrSoapPort, adminName, adminPwd });

    Map<String, String> exitResult = executeAdminTask(profilePath, dmgrSoapPort, adminName, adminPwd, "AdminTask.getDmgrProperties()"); // NON-NLS-1

    logger.debug("getDmgrProperties->END: {0}", new Object[] { exitResult.values() }); // NON-NLS-1

    return exitResult;
  }

  /**
   * Perform SOAP connection validation and execute the requested WAS AdminTask.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param dmgrSoapPort
   *          SOAP Port
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param adminTask
   *          WAS AdminTask to perform
   * @return Map with results from the executed adminTask command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  private static Map<String, String> executeAdminTask(String profilePath, int dmgrSoapPort, String adminName, String adminPwd,
      String adminTask) throws IOException, InterruptedException
  {
    String wsadminExecPath = getExecPath(profilePath, 0);

    if (wsadminExecPath == null)
    {
      throw new NullPointerException();
    }

    Map<String, String> exitResult = new HashMap<String, String>();
    String[] commandArgs = new String[13];
    commandArgs[0] = wsadminExecPath;
    commandArgs[1] = "-lang"; // NON-NLS-1
    commandArgs[2] = "jython"; // NON-NLS-1
    commandArgs[3] = "-conntype"; // NON-NLS-1
    commandArgs[4] = "SOAP"; // NON-NLS-1
    commandArgs[5] = "-user"; // NON-NLS-1
    commandArgs[6] = adminName;
    commandArgs[7] = "-password"; // NON-NLS-1
    commandArgs[8] = adminPwd;
    commandArgs[9] = "-port"; // NON-NLS-1
    commandArgs[10] = String.valueOf(dmgrSoapPort);
    commandArgs[11] = "-c"; // NON-NLS-1
    if (Platform.OS_LINUX.equals(Platform.getOS()))
    {
      commandArgs[12] = adminTask;
    }
    else if (Platform.OS_WIN32.equals(Platform.getOS()))
    {
      commandArgs[12] = "\"" + adminTask + "\""; // NON-NLS-1
    }
    else
    {
      commandArgs[12] = adminTask;
    }

    logger.debug("Executing command: {0}", new Object[] { commandArgs }); // NON-NLS-1

    Process p = Runtime.getRuntime().exec(commandArgs);
    exitResult = Util.waitToRetrieveProcessResult(p);

    return exitResult;

  }

  /**
   * Perform SOAP connection validation and execute the requested WAS AdminTask.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param adminTask
   *          WAS AdminTask to perform
   * @return Map with results from the executed adminTask command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  private static Map<String, String> executeAdminTask(String profilePath, String adminName, String adminPwd, String adminTask)
      throws IOException, InterruptedException
  {
    String wsadminExecPath = getExecPath(profilePath, 0);

    if (wsadminExecPath == null)
    {
      throw new NullPointerException();
    }

    Map<String, String> exitResult = new HashMap<String, String>();
    String[] commandArgs = new String[9];
    commandArgs[0] = wsadminExecPath;
    commandArgs[1] = "-lang"; // NON-NLS-1
    commandArgs[2] = "jython"; // NON-NLS-1
    commandArgs[3] = "-user"; // NON-NLS-1
    commandArgs[4] = adminName;
    commandArgs[5] = "-password"; // NON-NLS-1
    commandArgs[6] = adminPwd;
    commandArgs[7] = "-f"; // NON-NLS-1
    commandArgs[8] = adminTask;

    logger.debug("Executing command: {0}", new Object[] { commandArgs }); // NON-NLS-1

    Process p = Runtime.getRuntime().exec(commandArgs);
    exitResult = Util.waitToRetrieveProcessResult(p);

    return exitResult;

  }

  /**
   * Perform SOAP connection validation and execute the requested WAS AdminTask.
   * 
   * @param profilePath
   *          Path to the WAS profile
   * @param adminName
   *          WAS Administrator ID
   * @param adminPwd
   *          WAS Administrator password
   * @param adminTask
   *          WAS AdminTask to perform
   * @return Map with results from the executed adminTask command
   * 
   *         { "EXIT_CODE": "0" }
   * 
   *         or
   * 
   *         { "PROCESS_EXIT_CODE": "2", "STD_OUT" : "......", "STD_ERR" : "......" }
   * 
   * @throws IOException
   * @throws InterruptedException
   */
  private static Map<String, String> executeAdminTask(String profilePath, String adminName, String adminPwd, String adminTask,
      String args[]) throws IOException, InterruptedException
  {
    String wsadminExecPath = getExecPath(profilePath, 0);

    if (wsadminExecPath == null)
    {
      throw new NullPointerException();
    }

    Map<String, String> exitResult = new HashMap<String, String>();
    int nLength = 9 + args.length;
    String[] commandArgs = new String[nLength];
    commandArgs[0] = wsadminExecPath;
    commandArgs[1] = "-lang"; // NON-NLS-1
    commandArgs[2] = "jython"; // NON-NLS-1
    commandArgs[3] = "-user"; // NON-NLS-1
    commandArgs[4] = adminName;
    commandArgs[5] = "-password"; // NON-NLS-1
    commandArgs[6] = adminPwd;
    commandArgs[7] = "-f"; // NON-NLS-1
    commandArgs[8] = adminTask;

    for (int i = 0; i < args.length; i++)
    {
      commandArgs[9 + i] = args[i];
    }
    logger.debug("Executing command: {0}", new Object[] { commandArgs }); // NON-NLS-1

    Process p = Runtime.getRuntime().exec(commandArgs);
    exitResult = Util.waitToRetrieveProcessResult(p);

    return exitResult;

  }

  /**
   * Waits for the specified process to complete and processes the Standard Output and Error streams
   * 
   * @param process
   *          Process to retrieve results from
   * 
   * @return Map with results from the executed command
   */
  private static Map<String, String> waitToRetrieveProcessResult(Process process) throws IOException, InterruptedException
  {
    Map<String, String> result = new HashMap<String, String>();

    final StringBuffer stdErr = new StringBuffer();
    final BufferedReader brError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
    Thread errorReaderThread = startReaderThread(brError, stdErr);

    final StringBuffer stdOut = new StringBuffer();
    final BufferedReader brInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
    Thread outReaderThread = startReaderThread(brInput, stdOut);

    try
    {
      result.put(PROCESS_EXIT_CODE, Integer.toString(process.waitFor()));
      result.put(PROCESS_STD_ERR, stdErr.toString());
      result.put(PROCESS_STD_OUT, stdOut.toString());

      stopReaderThread(errorReaderThread);
      stopReaderThread(outReaderThread);
    }
    catch (InterruptedException e)
    {
      throw e;
    }

    return result;
  }

  /**
   * Starts a reader thread for reading the results from a process
   * 
   * @param br
   *          BufferedReader to read from
   * @param buffer
   *          Buffer to read results into
   * 
   * @return Thread Started reader thread
   */
  private static Thread startReaderThread(final BufferedReader br, final StringBuffer buffer)
  {
    Thread thread = new Thread()
    {
      @Override
      public void run()
      {
        String line;
        try
        {
          while ((line = br.readLine()) != null)
          {
            buffer.append(line).append(LINE_SEPRATOR);
          }
        }
        catch (IOException e)
        {
          throw new Error(e);
        }
        finally
        {
          closeResource(br, null);
        }
      }
    };

    thread.start();
    return thread;
  }

  /**
   * Stops a reader thread if it is still running
   * 
   * @param thread
   *          Thread to stop
   */
  private static void stopReaderThread(final Thread thread)
  {
    if (thread != null && thread.isAlive())
    {
      thread.interrupt();
    }
  }
}
