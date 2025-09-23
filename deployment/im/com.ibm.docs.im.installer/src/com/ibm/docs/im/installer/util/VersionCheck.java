/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.json.java.JSONObject;

public class VersionCheck
{
  private static final ILogger LOG = IMLogger.getLogger(VersionCheck.class.getName());

  private static final String CONV_ERROR_CODE = "1000";// Conversion version is too old to be upgraded.

  private static final String CONV_ERROR_CODE2 = "1001";// Conversion version.txt does not exist.

  private static final String DOCS_ERROR_CODE = "2000";// Docs version is too old to be upgraded.

  private static final String DOCS_ERROR_CODE2 = "2001";// Docs version.txt does not exist.

  private static final String VIEWER_ERROR_CODE = "3000";// Viewer version is too old to be upgraded.

  private static final String VIEWER_ERROR_CODE2 = "3001";// Viewer version.txt does not exist.

  private static final String VIEWEREXT_ERROR_CODE = "4000";// Viewer extension version is too old to be upgraded.

  private static final String VIEWEREXT_ERROR_CODE2 = "4001";// Viewer extension version.txt does not exist.

  private static final String PROXY_ERROR_CODE = "5000";// Proxy version is too old to be upgraded.

  private static final String PROXY_ERROR_CODE2 = "5001";// Proxy version.txt does not exist.

  private static final String DOCSEXT_ERROR_CODE = "6000";// Docs extension version is too old to be upgraded.

  private static final String DOCSEXT_ERROR_CODE2 = "6001";// Docs extension version.txt does not exist.

  private static final String VERSION_DIR = "version";

  private static final String FILENAME = "version.txt";

  private static final String BUILD_VERSION = "build_version";

  private static final String Conv_version_path = "Conversion" + File.separator + "version";

  private static final String Docs_version_path = "Docs" + File.separator + "version";

  private static final String Viewer_version_path = "Viewer" + File.separator + "version";

  private static final String ViewerExt_version_path = "ViewerExt" + File.separator + "version";

  private static final String Proxy_version_path = "DocsProxy" + File.separator + "proxy" + File.separator + "version";

  private static final String DocsExt_version_path = "DocsExt" + File.separator + "version";
  
  private static final String PROXY = "proxy";

  private static final String SEPARATER = " , ";

  private static final String SPLITTER = "\\.";

  private static final int ERROR_TYPE1 = 1;

  private static final int ERROR_TYPE2 = 2;

  private static final int VERSION_GAP = 2; // 1.0.7 Docs install package only supports the upgrade of version 1.0.5 and 1.0.6.

  public enum VersionEnv {
    CONV_FAILED, DOCS_FAILED, VIEWER_FAILED, VIEWER_EXT_FAILED, PROXY_FAILED, DOCS_EXT_FAILED, ERROR, OK
  };

  private ICustomPanelData data;

  private Map<VersionEnv, Map<String, String>> errorMap;

  public VersionCheck(ICustomPanelData data)
  {
    this.data = data;
    errorMap = new LinkedHashMap<VersionEnv, Map<String, String>>();
  }

  /**
   * Obtain the error message after validating versions of pre-installed components.
   * 
   * @param theMap
   *          , the error map
   * @return the error message
   */
  public static String getErrorMessages(Map<VersionEnv, Map<String, String>> theMap)
  {
    StringBuffer errorBuffer = new StringBuffer();
    StringBuffer errorT1Buffer = new StringBuffer();
    StringBuffer errorT2Buffer = new StringBuffer();
    StringBuffer type2Message = new StringBuffer();

    int type2Counter = 0;
    if (theMap != null)
    {
      Iterator<VersionEnv> features = theMap.keySet().iterator();
      while (features.hasNext())
      {
        VersionEnv feature = features.next();
        Map<String, String> valueMap = theMap.get(feature);
        Iterator<String> errorIt = valueMap.keySet().iterator();
        while (errorIt.hasNext())
        {
          String keyCode = errorIt.next();
          String param = valueMap.get(keyCode);
          String error = getErrorMessage(keyCode, param);

          int errorType = getErrorType(keyCode);
          if (errorType == ERROR_TYPE1)
          {
            errorT1Buffer.append(error);
            errorT1Buffer.append(" ");
          }
          else if (errorType == ERROR_TYPE2)
          {
            type2Counter++;
            errorT2Buffer.append(error);
            errorT2Buffer.append(SEPARATER);
          }
        }
      }

      if (!errorT1Buffer.toString().equals(""))
      {
        errorT1Buffer.append("\n").append(Messages.getString("VersionCheck.EXPLANATION"));
      }

      if (type2Counter != 0)
      {
        int lastIndext = errorT2Buffer.length();
        errorT2Buffer.delete(lastIndext - 3, lastIndext);
        if (type2Counter == 1)
        {
          type2Message.append(MessageFormat.format(Messages.getString("VersionCheck.SINGLE_NONE"),
              new Object[] { errorT2Buffer.toString() }));
        }
        else
        {
          type2Message
              .append(MessageFormat.format(Messages.getString("VersionCheck.MULTI_NONE"), new Object[] { errorT2Buffer.toString() }));
        }
        type2Message.append("\n");
      }

    }
    errorBuffer.append(type2Message).append(errorT1Buffer.toString());
    return errorBuffer.toString();
  }

  /**
   * To validate all selected features to check whether the versions are satisfied the requirement.
   * 
   * @return version status
   */
  public VersionEnv validate()
  {

    boolean convSelected = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.CONVERSION_ID);
    if (convSelected)
    {
      vCheck(Constants.CONV_LOCAL_DIR, VersionEnv.CONV_FAILED);
    }
    boolean docsSelected = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.DOCS_ID);
    if (docsSelected)
    {
      vCheck(Constants.DOCS_LOCAL_DIR, VersionEnv.DOCS_FAILED);
    }
    boolean viewerSelected = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.VIEWER_ID);
    if (viewerSelected)
    {
      vCheck(Constants.VIEWER_LOCAL_DIR, VersionEnv.VIEWER_FAILED);
    }
    boolean viewerExtSelected = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.VIEWER_EXT_ID);
    if (viewerExtSelected)
    {
      vCheck(Constants.VIEWER_EXT_LOCAL_DIR, VersionEnv.VIEWER_EXT_FAILED);
    }
    boolean proxySelected = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.DOCS_PROXY_ID);
    if (proxySelected)
    {
      StringBuffer proxyBuffer= new StringBuffer(Constants.DOCS_PROXY_LOCAL_DIR);
      proxyBuffer.append(File.separator);
      proxyBuffer.append(PROXY);
      
      vCheck(proxyBuffer.toString(), VersionEnv.PROXY_FAILED);
    }
    boolean docsExtSelected = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.DOC_EXT_ID);
    if (docsExtSelected)
    {
      vCheck(Constants.DOCS_EXT_LOCAL_DIR, VersionEnv.DOCS_EXT_FAILED);
    }

    return isVersionValidated() ? VersionEnv.OK : VersionEnv.ERROR;
  }

  /**
   * To Obtain the error map, which holds all error information after parsing version.txt files.
   * 
   * @return
   */
  public Map<VersionEnv, Map<String, String>> getErrors()
  {
    return errorMap;
  }

  private static int getErrorType(String error)
  {
    int errorCode = Integer.parseInt(error);
    if (errorCode % 1000 == 0)
      return ERROR_TYPE1;
    return ERROR_TYPE2;
  }

  private static String getErrorMessage(String error, String param)
  {
    int errorCode = Integer.parseInt(error);
    switch (errorCode)
      {
        case 1000 :
          return MessageFormat.format(Messages.getString("VersionCheck.CONV_NONE_MATCH"), new Object[] { param });
        case 2000 :
          return MessageFormat.format(Messages.getString("VersionCheck.DOCS_NONE_MATCH"), new Object[] { param });
        case 3000 :
          return MessageFormat.format(Messages.getString("VersionCheck.VIEWER_NONE_MATCH"), new Object[] { param });
        case 4000 :
          return MessageFormat.format(Messages.getString("VersionCheck.VIEWEREXT_NONE_MATCH"), new Object[] { param });
        case 5000 :
          return MessageFormat.format(Messages.getString("VersionCheck.PROXY_NONE_MATCH"), new Object[] { param });
        case 6000 :
          return MessageFormat.format(Messages.getString("VersionCheck.DOCSEXT_NONE_MATCH"), new Object[] { param });

        default:
          return param;
      }
  }

  private boolean isVersionValidated()
  {
    return (errorMap.size() == 0);
  }

  private void vCheck(String feature, VersionEnv versionStatus)
  {
    String versionPath = data.getProfile().getInstallLocation() + File.separator + feature + File.separator + VERSION_DIR + File.separator
        + FILENAME;
    File versionFile = new File(versionPath);
    if (versionFile != null && versionFile.isFile())
    {
      LOG.info("version.txt is localted in " + versionFile.getAbsolutePath());
      if (!versionFile.exists())
      {
        return;
      }
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(versionFile);
        JSONObject buildInfo = JSONObject.parse(fis);
        Object bvObj = buildInfo.get(BUILD_VERSION);
        LOG.info("Docs biuld info:" + buildInfo.toString());
        boolean valid = isValid(bvObj.toString());
        if (!valid)
        {
          Map<String, String> errorCode = new HashMap<String, String>();
          if (VersionEnv.CONV_FAILED == versionStatus)
            errorCode.put(CONV_ERROR_CODE, bvObj.toString());
          else if (VersionEnv.DOCS_FAILED == versionStatus)
            errorCode.put(DOCS_ERROR_CODE, bvObj.toString());
          else if (VersionEnv.VIEWER_FAILED == versionStatus)
            errorCode.put(VIEWER_ERROR_CODE, bvObj.toString());
          else if (VersionEnv.VIEWER_EXT_FAILED == versionStatus)
            errorCode.put(VIEWEREXT_ERROR_CODE, bvObj.toString());
          else if (VersionEnv.PROXY_FAILED == versionStatus)
            errorCode.put(PROXY_ERROR_CODE, bvObj.toString());
          else if (VersionEnv.DOCS_EXT_FAILED == versionStatus)
            errorCode.put(DOCSEXT_ERROR_CODE, bvObj.toString());
          errorMap.put(versionStatus, errorCode);
        }
      }
      catch (IOException e)
      {
        LOG.warning("io error when reading " + versionFile.getAbsolutePath() + e.getLocalizedMessage());
      }
      finally
      {
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
        	  LOG.warning("io error when closing " + versionFile.getAbsolutePath() + e.getLocalizedMessage());
          }
        }
      }
    }
    else
    {
      Map<String, String> errorCode = new HashMap<String, String>();
      if (VersionEnv.CONV_FAILED == versionStatus)
        errorCode.put(CONV_ERROR_CODE2, Conv_version_path);
      else if (VersionEnv.DOCS_FAILED == versionStatus)
        errorCode.put(DOCS_ERROR_CODE2, Docs_version_path);
      else if (VersionEnv.VIEWER_FAILED == versionStatus)
        errorCode.put(VIEWER_ERROR_CODE2, Viewer_version_path);
      else if (VersionEnv.VIEWER_EXT_FAILED == versionStatus)
        errorCode.put(VIEWEREXT_ERROR_CODE2, ViewerExt_version_path);
      else if (VersionEnv.PROXY_FAILED == versionStatus)
        errorCode.put(PROXY_ERROR_CODE2, Proxy_version_path);
      else if (VersionEnv.DOCS_EXT_FAILED == versionStatus)
        errorCode.put(DOCSEXT_ERROR_CODE2, DocsExt_version_path);
      errorMap.put(versionStatus, errorCode);
    }
  }

  private boolean isValid(String buildVersion)
  {
    if (buildVersion == null)
      return false;

    String[] versions = buildVersion.split(SPLITTER);
    if (versions.length < 3)
      return false;
    try
    {
      int version = Integer.parseInt(versions[0]) * 100 + Integer.parseInt(versions[1]) * 10 + Integer.parseInt(versions[2]);
      int installVersion = getOfferingVersion();
      int gap = installVersion - version;
      if (gap >= 0 && gap <= VERSION_GAP)
      {
        return true;
      }
      else if(installVersion == 200 && ( version == 106 || version == 107) )
      {
        return true;        
      }
      else if(installVersion == 201 && version == 107 )
      {
        return true;        
      }      
    }
    catch (Exception e)
    {
      LOG.warning("io error when parsing string " + e.getLocalizedMessage());
    }
    return false;
  }

  /*
   * If current version is 1.0.7.xxx , the returned result is 107
   * 
   * @return
   */
  private int getOfferingVersion()
  {
    int version = -1;
    String currentVersion = IMUtil.getOfferingVersion(data.getAllJobs(), data.getAgent(), data.getProfile());
    if (currentVersion != null)
    {
      String[] versions = currentVersion.split(SPLITTER);
      if (versions.length < 3)
        return version;
      try
      {
        version = Integer.parseInt(versions[0]) * 100 + Integer.parseInt(versions[1]) * 10 + Integer.parseInt(versions[2]);
      }
      catch (Exception e)
      {
        version = -1;
        LOG.warning("io error when parsing string " + e.getLocalizedMessage());
      }

    }
    return version;
  }
}
