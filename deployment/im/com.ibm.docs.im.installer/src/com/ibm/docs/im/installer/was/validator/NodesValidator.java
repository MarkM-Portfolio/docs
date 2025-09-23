/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2012.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.was.validator;

import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IAgent;
import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.internal.Messages;

public class NodesValidator extends UserDataValidator
{
  public NodesValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    IStatus status = null;
    IAdaptable adaptable = getAdaptable();
    ICustomPanelData data = (ICustomPanelData) adaptable.getAdapter(ICustomPanelData.class);
    IAgentJob[] jobs = data != null ? data.getAllJobs() : null;
    IAgent iAgent = data != null ? data.getAgent() : null;
    IProfile iProfile = data != null ? data.getProfile() : null;
    if (iProfile != null)
    {
      String sts = iProfile.getOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.OFFERING_ID);
      if (sts != null && sts.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        return Status.OK_STATUS;
    }

    if (IMUtil.isDeployType(jobs, Constants.IM_DEPLOYMENT_TYPE_INSTALL))
    {
      Object winNodesObj = map.get(Constants.WIN_NODE_LIST);
      Object linuxNodesObj = map.get(Constants.LINUX_NODE_LIST);

      int winNodesLength = 0;
      int lnxNodesLength = 0;
      if (winNodesObj != null || linuxNodesObj != null)
      {
        if (winNodesObj != null && winNodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
        {
          winNodesLength = ((String[]) winNodesObj).length;
        }
        if (linuxNodesObj != null && linuxNodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
        {
          lnxNodesLength = ((String[]) linuxNodesObj).length;
        }
      }
      // String linuxNodes[] = (String[])linuxNodesObj;
      if (winNodesLength == 0 && lnxNodesLength == 0)
      {
        return IMStatuses.ERROR.get(Messages.Message_NodeIdentificationPanel_NodeListEmpty$uuid,
            Messages.Message_NodeIdentificationPanel_NodeListEmpty$explanation,
            Messages.Message_NodeIdentificationPanel_NodeListEmpty$useraction, 0,
            Messages.Message_NodeIdentificationPanel_NodeListEmpty$message);
      }

      if (IMUtil.isFeatureSelected(jobs, Constants.IBMCONVERSION))
      {
        status = handleConvData(map);
        if (!status.isOK())
          return status;
      }

      if (IMUtil.isFeatureSelected(jobs, Constants.IBMDOCS))
      {
        status = handleDocsData(map);
        if (!status.isOK())
          return status;
      }

      if (IMUtil.isFeatureSelected(jobs, Constants.IBMVIEWER))
      {
        status = handleViewerData(map);
        if (!status.isOK())
          return status;
      }

      if (IMUtil.isFeatureSelected(jobs, Constants.IBMDOCSPROXY))
      {
        status = handleProxyData(map);
        if (!status.isOK())
          return status;
      }

      // check web server
      {
        status = handleIHSData(map);
        if (!status.isOK())
          return status;
      }

    }
    else if (IMUtil.isDeployType(jobs, Constants.IM_DEPLOYMENT_TYPE_UPDATE))
    {
      //Only check web server during upgrade
      status = handleIHSData(map);
      if (!status.isOK())
        return status;
    }
    else if (IMUtil.isDeployType(jobs, Constants.IM_DEPLOYMENT_TYPE_MODIFY))
    {
      boolean bConv = IMUtil.isFeatureAdded(jobs, iAgent, iProfile, Constants.IBMCONVERSION);
      if (bConv)
      {
        status = handleConvData(map);
        if (!status.isOK())
          return status;
      }

      boolean bDocs = IMUtil.isFeatureAdded(jobs, iAgent, iProfile, Constants.IBMDOCS);
      if (bDocs)
      {
        status = handleDocsData(map);
        if (!status.isOK())
          return status;
      }

      boolean bViewer = IMUtil.isFeatureAdded(jobs, iAgent, iProfile, Constants.IBMVIEWER);
      if (bViewer)
      {
        status = handleViewerData(map);
        if (!status.isOK())
          return status;
      }

      boolean bProxy = IMUtil.isFeatureAdded(jobs, iAgent, iProfile, Constants.IBMDOCSPROXY);
      if (bProxy)
      {
        status = handleProxyData(map);
        if (!status.isOK())
          return status;
      }
    }

    return Status.OK_STATUS;
  }

  public IStatus handleConvData(Map map)
  {
    Object nodesObj = map.get(Constants.CONV_NODES);
    int nodesLength = 0;

    if (nodesObj != null && nodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
    {
      nodesLength = ((String[]) nodesObj).length;
    }
    // String linuxNodes[] = (String[])linuxNodesObj;
    if (nodesLength == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_NodeIdentificationPanel_ConvNodeListEmpty$uuid"),
          Messages.getString("Message_NodeIdentificationPanel_ConvNodeListEmpty$explanation"),
          Messages.getString("Message_NodeIdentificationPanel_ConvNodeListEmpty$useraction"), 0,
          Messages.getString("Message_NodeIdentificationPanel_ConvNodeListEmpty$message"));
    }

    return Status.OK_STATUS;
  }

  public IStatus handleDocsData(Map map)
  {
    Object nodesObj = map.get(Constants.DOCS_NODES);
    int nodesLength = 0;

    if (nodesObj != null && nodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
    {
      nodesLength = ((String[]) nodesObj).length;
    }
    // String linuxNodes[] = (String[])linuxNodesObj;
    if (nodesLength == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_NodeIdentificationPanel_DocsNodeListEmpty$uuid"),
          Messages.getString("Message_NodeIdentificationPanel_DocsNodeListEmpty$explanation"),
          Messages.getString("Message_NodeIdentificationPanel_DocsNodeListEmpty$useraction"), 0,
          Messages.getString("Message_NodeIdentificationPanel_DocsNodeListEmpty$message"));
    }

    return Status.OK_STATUS;
  }

  public IStatus handleViewerData(Map map)
  {
    Object nodesObj = map.get(Constants.VIEWER_NODES);
    int nodesLength = 0;

    if (nodesObj != null && nodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
    {
      nodesLength = ((String[]) nodesObj).length;
    }
    // String linuxNodes[] = (String[])linuxNodesObj;
    if (nodesLength == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_NodeIdentificationPanel_ViewerNodeListEmpty$uuid"),
          Messages.getString("Message_NodeIdentificationPanel_ViewerNodeListEmpty$explanation"),
          Messages.getString("Message_NodeIdentificationPanel_ViewerNodeListEmpty$useraction"), 0,
          Messages.getString("Message_NodeIdentificationPanel_ViewerNodeListEmpty$message"));
    }

    return Status.OK_STATUS;
  }

  public IStatus handleProxyData(Map map)
  {
    Object nodesObj = map.get(Constants.DOCS_PROXY_NODES);
    int nodesLength = 0;

    if (nodesObj != null && nodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
    {
      nodesLength = ((String[]) nodesObj).length;
    }
    // String linuxNodes[] = (String[])linuxNodesObj;
    if (nodesLength == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_NodeIdentificationPanel_ProxyNodeListEmpty$uuid"),
          Messages.getString("Message_NodeIdentificationPanel_ProxyNodeListEmpty$explanation"),
          Messages.getString("Message_NodeIdentificationPanel_ProxyNodeListEmpty$useraction"), 0,
          Messages.getString("Message_NodeIdentificationPanel_ProxyNodeListEmpty$message"));
    }

    return Status.OK_STATUS;
  }

  public IStatus handleIHSData(Map map)
  {
    Object nodesObj = map.get(Constants.IHS_NODES);
    int nodesLength = 0;
    String webserver = "";

    if (nodesObj != null && nodesObj instanceof String[])
    {
      nodesLength = ((String[]) nodesObj).length;
    }

    Object urlObj = map.get(Constants.IHS_URL);
    if (urlObj != null)
    {
      webserver = ((String[]) urlObj)[0];
      if (webserver != null)
        webserver = webserver.trim();
    }

    if (nodesLength == 0 && webserver.equals(""))
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_NodeIdentificationPanel_IHSNodeListEmpty$uuid"),
          Messages.getString("Message_NodeIdentificationPanel_IHSNodeListEmpty$explanation"),
          Messages.getString("Message_NodeIdentificationPanel_IHSNodeListEmpty$useraction"), 0,
          Messages.getString("Message_NodeIdentificationPanel_IHSNodeListEmpty$message"));
    }

    return Status.OK_STATUS;
  }

  public IStatus checkQueriedWebserverNodes(Map map)
  {
    Object nodesObj = map.get(Constants.WEBSERVER_NODE_LIST);
    int nodesLength = 0;

    if (nodesObj != null && nodesObj instanceof String[])// && (linuxNodesObj==null || linuxNodesObj instanceof String[] ))
    {
      nodesLength = ((String[]) nodesObj).length;
    }
    // String linuxNodes[] = (String[])linuxNodesObj;
    if (nodesLength == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_NodeIdentificationPanel_WebNodeListEmpty$uuid"),
          Messages.getString("Message_NodeIdentificationPanel_WebNodeListEmpty$explanation"),
          Messages.getString("Message_NodeIdentificationPanel_WebNodeListEmpty$useraction"), 0,
          Messages.getString("Message_NodeIdentificationPanel_WebNodeListEmpty$message"));
    }

    return Status.OK_STATUS;
  }
}
