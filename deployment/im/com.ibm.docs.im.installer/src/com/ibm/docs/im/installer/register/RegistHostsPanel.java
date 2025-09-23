/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.register;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Vector;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.IJobChangeEvent;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.core.runtime.jobs.JobChangeAdapter;
import org.eclipse.jface.dialogs.IMessageProvider;
import org.eclipse.jface.operation.IRunnableWithProgress;
import org.eclipse.jface.operation.ModalContext;
import org.eclipse.osgi.util.NLS;
import org.eclipse.swt.SWT;
import org.eclipse.swt.accessibility.AccessibleAdapter;
import org.eclipse.swt.accessibility.AccessibleEvent;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.MouseAdapter;
import org.eclipse.swt.events.MouseEvent;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Group;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.widgets.FormToolkit;
import org.eclipse.ui.progress.UIJob;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ILogLevel;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.cic.common.core.model.IFeature;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractCustomConfigPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.DynamicImageViewer;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

/**
 * For more information, refer to: http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com.ibm.cic.dev.doc/html/extendingIM/main.html
 * http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc.isv/reference/api/agentui/com/ibm/cic/agent/ui/extensions/
 * BaseWizardPanel.html
 * http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc.isv/reference/api/agentui/com/ibm/cic/
 * agent/ui/extensions/CustomPanel.html
 * 
 */
public class RegistHostsPanel extends AbstractCustomConfigPanel
{
  private static final ILogger logger = IMLogger.getLogger(RegistHostsPanel.class.getCanonicalName());

  static private String LOCALNODE = "localnode";

  private boolean bHostListInitialized = false;

  private boolean bPreviousNodeIdentifiedStatus = false;
  
  private Composite topContainer;  
  
  // Conversion
  private Group convGInfo;

  private Label convComDescLabel;

  private Map<String, Vector<Label>> convSrvHostList = new HashMap<String, Vector<Label>>();

  private Map<Label, Vector<Text>> convSrvUserPWDList = new HashMap<Label, Vector<Text>>();

  private Vector<Label> convEmptyLabels = new Vector<Label>();

  // Docs
  private Group docsGInfo;

  private Label docsComDescLabel;

  private Map<String, Vector<Label>> docsSrvHostList = new HashMap<String, Vector<Label>>();

  private Map<Label, Vector<Text>> docsSrvUserPWDList = new HashMap<Label, Vector<Text>>();

  private Vector<Label> docsEmptyLabels = new Vector<Label>();

  // Webserver
  private Group ihsGInfo;

  private Label ihsComDescLabel;

  private Map<String, Vector<Label>> ihsSrvHostList = new HashMap<String, Vector<Label>>();

  private Map<Label, Vector<Text>> ihsSrvUserPWDList = new HashMap<Label, Vector<Text>>();

  private Vector<Label> ihsEmptyLabels = new Vector<Label>();

  // Local
  private Group localGInfo;

  private Label ilocalComDescLabel;

  private Map<String, Vector<Label>> localSrvHostList = new HashMap<String, Vector<Label>>();

  private Map<Label, Vector<Text>> localSrvUserPWDList = new HashMap<Label, Vector<Text>>();

  private Button convApplAllBtn;

  private Button convResetBtn;

  private Button docsApplAllBtn;

  private Button docsResetBtn;

  private Button ihsApplAllBtn;

  private Button ihsResetBtn;

  private Button validateBtn;

  private Button sudoBtn;

  private boolean isSudo;

  private IStatus dataJobsStatus;

  // Previous feature list
  private Map<String, String> featureList = new HashMap<String, String>();
  
  private boolean isIHSIdentified = false;

  private boolean setVarsSucceed = true;

  private String failedHosts = null;

  private DynamicImageViewer canvas; 
  
  private boolean convNodesModified = false;
  private boolean docsNodesModified = false;
  private boolean ihsNodesModified = false;
  private boolean weburl = false;
  
  
  /**
   * Default constructor
   */
  public RegistHostsPanel()
  {
    super(Messages.getString("PanelName$RegistHostsPanel")); // NON-NLS-1    
  }

  /**
   * TODO: Implement this method
   * 
   * @param parent
   *          Parent composite. A top level composite to hold the UI components being created is already created createControl(Composite)
   *          method. In this method, create only those UI components that need to be placed on this panel.
   * 
   * @param toolkit
   *          Use the toolkit to create UI components.
   */
  private void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    toolkit.createLabel(parent, Messages.getString("Message_EnrollHostsPanel_Top$Label")); //$NON-NLS-1$
    // Conversion
    convGInfo = new Group(parent, SWT.NONE);
    GridLayout gl = new GridLayout(4, true);

    convGInfo.setLayout(gl);
    GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    convGInfo.setLayoutData(gridData);

    this.createBoldLabel(convGInfo, Messages.getString("Message_NodeIdentificationPanel_Conv$label"), true, 1); //$NON-NLS-1$

    convComDescLabel = toolkit.createLabel(convGInfo, Messages.getString("Message_EnrollHostsPanel_Comp$Desc"));
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    convComDescLabel.setLayoutData(gridData);
    // Docs
    docsGInfo = new Group(parent, SWT.NONE);
    gl = new GridLayout(4, true);

    docsGInfo.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    docsGInfo.setLayoutData(gridData);

    // docsCompLabel = toolkit.createLabel(docsGInfo, Messages.getString("Message_EnrollHostsPanel_DocsComp$label"));
    this.createBoldLabel(docsGInfo, Messages.getString("Message_EnrollHostsPanel_DocsComp$label"), true, 1); //$NON-NLS-1$
    // gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    // gridData.horizontalSpan = 4;
    // docsCompLabel.setLayoutData(gridData);

    docsComDescLabel = toolkit.createLabel(docsGInfo, Messages.getString("Message_EnrollHostsPanel_Comp$Desc"));
    //docsComDescLabel = this.createBoldLabel(docsGInfo, Messages.getString("Message_EnrollHostsPanel_Comp$Desc"), true); //$NON-NLS-1$
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    docsComDescLabel.setLayoutData(gridData);
    // Webserver
    ihsGInfo = new Group(parent, SWT.NONE);
    gl = new GridLayout(4, true);

    ihsGInfo.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    ihsGInfo.setLayoutData(gridData);

    // ihsCompLabel = toolkit.createLabel(ihsGInfo, Messages.getString("Message_EnrollHostsPanel_IHSComp$label"));
    this.createBoldLabel(ihsGInfo, Messages.getString("Message_EnrollHostsPanel_IHSComp$label"), true, 1); //$NON-NLS-1$
    // gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    // gridData.horizontalSpan = 4;
    // ihsCompLabel.setLayoutData(gridData);

    ihsComDescLabel = toolkit.createLabel(ihsGInfo, Messages.getString("Message_EnrollHostsPanel_Comp$Desc"));
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    ihsComDescLabel.setLayoutData(gridData);
    // Local
    localGInfo = new Group(parent, SWT.NONE);
    gl = new GridLayout(4, true);
    // gl.verticalSpacing = 0;
    // gl.marginHeight = 0;
    // gl.marginBottom = 1;
    localGInfo.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    localGInfo.setLayoutData(gridData);

    // localCompLabel = toolkit.createLabel(localGInfo, Messages.getString("Message_EnrollHostsPanel_LocalComp$label"));
    this.createBoldLabel(localGInfo, Messages.getString("Message_EnrollHostsPanel_LocalComp$label"), true, 1); //$NON-NLS-1$
    // gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    // gridData.horizontalSpan = 4;
    // localCompLabel.setLayoutData(gridData);

    ilocalComDescLabel = toolkit.createLabel(localGInfo, Messages.getString("Message_EnrollHostsPanel_Comp$Desc"));
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 4;
    ilocalComDescLabel.setLayoutData(gridData);

    // To create composite for sudo checkbox
    Composite sudoComp = toolkit.createComposite(parent);
    sudoComp.setLayout(new GridLayout(4, false));
    GridData data = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 4, 1);
    data.verticalIndent = 8;
    sudoComp.setLayoutData(data);
    // To create sudo checkbox
    sudoBtn = toolkit.createButton(sudoComp, Messages.getString("Message_EnrollHostsPanel_Sudo$label"), SWT.CHECK | SWT.WRAP);
    GridData sudoData = new GridData(GridData.FILL, GridData.FILL, true, false, 1, 1);
    sudoBtn.setLayoutData(sudoData);
    isSudo = false;
    sudoBtn.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        if (sudoBtn.getSelection())
        {
          isSudo = true;
        }
        else
        {
          isSudo = false;
        }
        verifyComplete(false, false);
      }
    });
    // Verification
    Composite vComp = createPanel(parent);
    validateBtn = toolkit.createButton(vComp, Messages.Message_WASInfoPanel_Validate$label, SWT.PUSH);
    GridData gdText = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
    gdText.minimumWidth = 120;
    validateBtn.setLayoutData(gdText);
    validateBtn.setEnabled(false);
    validateBtn.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        setErrorMessage(null);
        setMessage(Messages.getString("Message_EnrollHostsPanel_Validating$msg"), IMessageProvider.INFORMATION);
        validateBtn.setEnabled(false);
        canvas.setVisible(true);
        verifyComplete(true, true);
      }
    });
    canvas = PanelUtil.createLoadingImg(vComp);
    canvas.setVisible(false);

  }

  private Composite createPanel(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    data.verticalIndent = 6;
    panel.setLayoutData(data);
    return panel;
  }

  private void createBoldLabel(Composite parent, String message, boolean keepSpace, int fontHeight)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = PanelUtil.createBoldLabel(parent, toolkit, message);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 4, 1);
    if (keepSpace)
    {
      gd.verticalIndent = 5;
    }
    label.setLayoutData(gd);
    PanelUtil.setFont(label, fontHeight);
  }

  private boolean matchNodes(String nodes, Vector<Label> vec)
  {
      Vector<String> nodesStr = IMUtil.parseListString(nodes, Util.LIST_SEPRATOR);
      if (nodesStr.size() != vec.size())
    	  return false;
      
      for (int i = 0; i < nodesStr.size(); i++)
      {
        String nodeStr = nodesStr.get(i);
        Vector<String> nodeInfoV = IMUtil.parseListString(nodeStr, Constants.SEPARATE_SUB_SUB_CHARS);
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        String node = nodeInfoArr[0];
        boolean found = false;
        for(int j = 0; j < vec.size(); j++)
        {
        	Label label = (Label)vec.get(j);
        	String host = label.getText();
        	if (node.equals(host))
        	{
        		found = true;
        		break;
        	}
        }
        if (!found)
        	return false;
      }
      
      return true;
  }
        
  private boolean isNodesModified(IProfile profile)
  {	  
	  boolean ret = false;
	  convNodesModified = false;
	  docsNodesModified = false;
	  ihsNodesModified = false;
	  String conv = profile.getOfferingUserData(Constants.CONV_NODES, OFFERING_ID);
	  if (convSrvHostList.size() > 0 )
	  {
		  Vector<Label> labels = convSrvHostList.get(Constants.IBMCONVERSION);
		  if (!matchNodes(conv, labels))
		  {
			  convNodesModified = true;
			  ret = true;
		  }		  
	  }
	  else if (conv != null)
	  {
		  convNodesModified = true;
		  ret = true;
	  }
	  
	  String docs = profile.getOfferingUserData(Constants.DOCS_NODES, OFFERING_ID);
	  if (docsSrvHostList.size() > 0 )
	  {
		  Vector<Label> labels = docsSrvHostList.get(Constants.IBMDOCS);
		  if (!matchNodes(docs, labels))
		  {
			  docsNodesModified = true;
			  ret = true;
		  }		  
	  }
	  else if (docs != null)
	  {
		  docsNodesModified = true;
		  ret = true;			  		  
	  }
	  
	  boolean tmp = weburl;
	  String ihs = profile.getOfferingUserData(Constants.IHS_NODES, OFFERING_ID);
	  if (ihs != null && !ihs.equals(""))
	  {
		  weburl = false;
	  }
	  else
	  {
		  weburl = true;
	  }
	  if (tmp != weburl)
	  {
		  ihsNodesModified = true;
		  ret = true;  
	  }	  
	  else
	  {
		  if (ihsSrvHostList.size() > 0 )
		  {
			  Vector<Label> labels = ihsSrvHostList.get(Constants.WEBSERVER);
			  if (!matchNodes(ihs, labels))
			  {
				  ihsNodesModified = true;
				  ret = true;
			  }		  
		  }
		  else if (ihs != null)
		  {
			  ihsNodesModified = true;
			  ret = true;			  		  			  		  
		  }
	  }
	  
	  if (ihsNodesModified == false && ihs != null && !ihs.equals("") && !ihsGInfo.getVisible())
	  {
		  ihsNodesModified = true;
		  ret = true;	
	  }
	  
	  return ret;
  }
  public boolean shouldSkip()
  {
    // If selected features have been modified,the status should be re-initialized
    ICustomPanelData data = this.getCustomPanelData();
    // if (bHostListInitialized && IMUtil.isFeatureAddOrRemoved(data))
    // bHostListInitialized = false;
    IProfile profile = data.getProfile();
    if (profile != null)
    {
      String status = null;
      controlInvisibleWidgets.clear();
      controlVisibleWidgets.clear();
      if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_INSTALL))
      {
        status = profile.getOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, OFFERING_ID);
        boolean bNodeIdentified = false;
        if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        {
          bNodeIdentified = true;
          Map<String, String> temp = new HashMap<String, String>();
          IAgentJob[] jobs = data.getAllJobs();
          if (jobs != null)
          {
            IFeature[] iFeatures = jobs[0].getFeaturesArray();
            if (iFeatures != null)
            {
              for (int i = 0; i < iFeatures.length; i++)
              {
                String featureID = iFeatures[i].getSelector().getIdentity().getId();
                temp.put(featureID, featureID);
              }
            }
          }
          boolean isIHS = profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID) != null;
          
          if (bHostListInitialized && featureList.size() > 0)
          {            
            if (temp.get(Constants.IBMCONVERSION) != featureList.get(Constants.IBMCONVERSION)
                || temp.get(Constants.IBMDOCS) != featureList.get(Constants.IBMDOCS)
                || isIHS!=isIHSIdentified || bNodeIdentified !=bPreviousNodeIdentifiedStatus )
            {
              bHostListInitialized = false;              
            }
          }          
          
          isIHSIdentified = isIHS;
          
          if (bHostListInitialized)
          {
        	  bHostListInitialized = !isNodesModified(profile);
          }
          
          if (!bHostListInitialized)
          {
            controlInvisibleWidgets.clear();
            controlVisibleWidgets.clear();
            // Conversion
            String nodesInfo = null;
            if (IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCONVERSION))
            {
              if (convNodesModified)
              {
                  if (convSrvUserPWDList.size() > 0)
                  {
                    clearWidgets(convSrvUserPWDList);
                    convSrvUserPWDList.clear();
                  }
                  if (convSrvHostList.size() > 0)
                  {
                    Vector<Control> controls = new Vector<Control>(convSrvHostList.get(Constants.IBMCONVERSION));
                    layout(controls, true);
                    convSrvHostList.clear();
                  }
                  
                  if (convEmptyLabels.size()>0)
                  {
                    Vector<Control> controls = new Vector<Control>(convEmptyLabels);
                    layout(controls, true);
                    convEmptyLabels.clear();
                  }
                  
                  if (convApplAllBtn != null)
                  {
                	  GridData gdata = (GridData) convApplAllBtn.getLayoutData();
                	  gdata.exclude = true;            	  
                	  convApplAllBtn.setVisible(false);            	  
                  }

                  if (convResetBtn != null)
                  {
                	  GridData gdata = (GridData) convResetBtn.getLayoutData();
                	  gdata.exclude = true;            	  
                	  convResetBtn.setVisible(false);            	  
                  }
                  
                  if (convGInfo != null)
                    controlVisibleWidgets.add(convGInfo);
                  nodesInfo = profile.getOfferingUserData(Constants.CONV_NODES, OFFERING_ID);
                  createDynamicWidgets(nodesInfo, Constants.IBMCONVERSION);
              }
            }
            else
            {
              if (convGInfo != null)
              {
                if (convGInfo.getVisible())
                  controlInvisibleWidgets.add(convGInfo);
                // else
                // controlVisibleWidgets.add(convGInfo);
              }
            }
            // Docs
            if (IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMDOCS))
            {
              if (docsNodesModified)
              {
                  if (docsSrvUserPWDList.size() > 0)
                  {
                    clearWidgets(docsSrvUserPWDList);
                    docsSrvUserPWDList.clear();
                  }
                  if (docsSrvHostList.size() > 0)
                  {
                    Vector<Control> controls = new Vector<Control>(docsSrvHostList.get(Constants.IBMDOCS));
                    layout(controls, true);
                    docsSrvHostList.clear();
                  }
                  
                  if (docsEmptyLabels.size()>0)
                  {
                    Vector<Control> controls = new Vector<Control>(docsEmptyLabels);
                    layout(controls, true);
                    docsEmptyLabels.clear();
                  }
                  
                  if (docsApplAllBtn != null)
                  {
                	  GridData gdata = (GridData) docsApplAllBtn.getLayoutData();
                	  gdata.exclude = true;            	  
                	  docsApplAllBtn.setVisible(false);            	  
                  }

                  if (docsResetBtn != null)
                  {
                	  GridData gdata = (GridData) docsResetBtn.getLayoutData();
                	  gdata.exclude = true;            	  
                	  docsResetBtn.setVisible(false);            	  
                  }
                  
                  if (docsGInfo != null)
                    controlVisibleWidgets.add(docsGInfo);
                  nodesInfo = profile.getOfferingUserData(Constants.DOCS_NODES, OFFERING_ID);
                  createDynamicWidgets(nodesInfo, Constants.IBMDOCS);            	  
              }
            }
            else
            {
              if (docsGInfo != null)
              {
                if (docsGInfo.getVisible())
                  controlInvisibleWidgets.add(docsGInfo);
                // else
                // controlVisibleWidgets.add(docsGInfo);
              }
            }
            // Webserver
            nodesInfo = profile.getOfferingUserData(Constants.IHS_NODES, OFFERING_ID);
            String aa = profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID);
            if (nodesInfo != null && !nodesInfo.equals("") 
            		&& profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID) != null
            		&& !profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID).equals(""))
            {
              if (ihsNodesModified)
              {
                  if (ihsSrvUserPWDList.size() > 0)
                  {
                    clearWidgets(ihsSrvUserPWDList);
                    ihsSrvUserPWDList.clear();
                  }
                  if (ihsSrvHostList.size() > 0)
                  {
                    Vector<Control> controls = new Vector<Control>(ihsSrvHostList.get(Constants.WEBSERVER));
                    layout(controls, true);
                    ihsSrvHostList.clear();
                  }
                  
                  if (ihsEmptyLabels.size()>0)
                  {
                    Vector<Control> controls = new Vector<Control>(ihsEmptyLabels);
                    layout(controls, true);
                    ihsEmptyLabels.clear();
                  }
                  
                  if (ihsApplAllBtn != null)
                  {
                	  GridData gdata = (GridData) ihsApplAllBtn.getLayoutData();
                	  gdata.exclude = true;            	  
                	  ihsApplAllBtn.setVisible(false);            	  
                  }

                  if (ihsResetBtn != null)
                  {
                	  GridData gdata = (GridData) ihsResetBtn.getLayoutData();
                	  gdata.exclude = true;            	  
                	  ihsResetBtn.setVisible(false);            	  
                  }
                  
                  if (ihsGInfo != null)
                    controlVisibleWidgets.add(ihsGInfo);
                  createDynamicWidgets(nodesInfo, Constants.WEBSERVER);            	  
              }
            }
            else
            {
              if (ihsGInfo != null)
              {
                if (ihsGInfo.getVisible())
                  controlInvisibleWidgets.add(ihsGInfo);
                // else
                // controlVisibleWidgets.add(ihsGInfo);
              }
            }
            // Local
            if (localSrvHostList.size() == 0)
            {
              if (localGInfo != null)
                controlVisibleWidgets.add(localGInfo);
              String localhost = profile.getOfferingUserData(Constants.LOCAL_HOST_NAME, OFFERING_ID);
              createDynamicWidgets(localhost, LOCALNODE);
            }
            if (controlInvisibleWidgets.size() > 0)
            {
              layout(controlInvisibleWidgets, true);
            }
            if (controlVisibleWidgets.size() > 0)
            {
              layout(controlVisibleWidgets, false);
            }

            bHostListInitialized = true;
            featureList.clear();
            featureList.putAll(temp);
            temp.clear();
          }
        }
        bPreviousNodeIdentifiedStatus = bNodeIdentified;
      }
      else if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE))
      {
        status = profile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, OFFERING_ID);
        String status2 = profile.getOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, OFFERING_ID);
        if ((status2 != null && status2.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
            && (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK)))
        {
          boolean bConv = IMUtil.isFeatureAdded(data.getProfileJobs(), data.getAgent(), data.getProfile(), Constants.IBMCONVERSION);
          boolean bDocs = IMUtil.isFeatureAdded(data.getProfileJobs(), data.getAgent(), data.getProfile(), Constants.IBMDOCS);
          if (bHostListInitialized && (bConv || bDocs))
            bHostListInitialized = false;
          if (!bHostListInitialized)
          {
            controlInvisibleWidgets.clear();
            controlVisibleWidgets.clear();
            // Conversion
            String nodesInfo = null;
            boolean bConvSel = IMUtil.isFeatureSelected(data.getProfileJobs(), Constants.IBMCONVERSION);
            if (bConvSel)
            {
              if (convSrvUserPWDList.size() > 0)
              {
                clearWidgets(convSrvUserPWDList);
                convSrvUserPWDList.clear();
              }
              if (convSrvHostList.size() > 0)
              {
                Vector<Control> controls = new Vector<Control>(convSrvHostList.get(Constants.IBMCONVERSION));
                layout(controls, true);
                convSrvHostList.clear();
              }
              
              if (convGInfo != null)
                controlVisibleWidgets.add(convGInfo);
              
              nodesInfo = profile.getOfferingUserData(Constants.CONV_NODES, OFFERING_ID);
              createDynamicWidgets(nodesInfo, Constants.IBMCONVERSION);
            }
            else
            {
              if (convGInfo != null)
              {
                if (convGInfo.getVisible())
                  controlInvisibleWidgets.add(convGInfo);
                else
                  controlVisibleWidgets.add(convGInfo);
              }
            }
            // Docs
            boolean bDocsSel = IMUtil.isFeatureSelected(data.getProfileJobs(), Constants.IBMDOCS);
            if (bDocsSel)
            {
              if (docsSrvUserPWDList.size() > 0)
              {
                clearWidgets(docsSrvUserPWDList);
                docsSrvUserPWDList.clear();
              }
              if (docsSrvHostList.size() > 0)
              {
                Vector<Control> controls = new Vector<Control>(docsSrvHostList.get(Constants.IBMDOCS));
                layout(controls, true);
                docsSrvHostList.clear();
              }
              
              if (docsGInfo != null)
                controlVisibleWidgets.add(docsGInfo);
              
              nodesInfo = profile.getOfferingUserData(Constants.DOCS_NODES, OFFERING_ID);
              createDynamicWidgets(nodesInfo, Constants.IBMDOCS);
            }
            else
            {
              if (docsGInfo != null)
              {
                if (docsGInfo.getVisible())
                  controlInvisibleWidgets.add(docsGInfo);
                else
                  controlVisibleWidgets.add(docsGInfo);
              }
            }
            // Webserver
            nodesInfo = profile.getOfferingUserData(Constants.IHS_NODES, OFFERING_ID);
            if (nodesInfo != null)
            {
              if (ihsSrvUserPWDList.size() > 0)
              {
                clearWidgets(ihsSrvUserPWDList);
                ihsSrvUserPWDList.clear();
              }
              if (ihsSrvHostList.size() > 0)
              {
                Vector<Control> controls = new Vector<Control>(ihsSrvHostList.get(Constants.WEBSERVER));
                layout(controls, true);
                ihsSrvHostList.clear();
              }
              
              if (ihsGInfo != null)
                controlVisibleWidgets.add(ihsGInfo);
              
              createDynamicWidgets(nodesInfo, Constants.WEBSERVER);
            }
            else
            {
              if (ihsGInfo != null)
              {
                if (ihsGInfo.getVisible())
                  controlInvisibleWidgets.add(ihsGInfo);
                else
                  controlVisibleWidgets.add(ihsGInfo);
              }
            }
            // Local
            if (localSrvHostList.size() == 0)
            {
              if (localGInfo != null)
                controlVisibleWidgets.add(localGInfo);
              
              String localhost = profile.getOfferingUserData(Constants.LOCAL_HOST_NAME, OFFERING_ID);
              createDynamicWidgets(localhost, LOCALNODE);
            }
            if (controlInvisibleWidgets.size() > 0)
            {
              layout(controlInvisibleWidgets, true);
            }
            if (controlVisibleWidgets.size() > 0)
            {
              layout(controlVisibleWidgets, false);
            }
            bHostListInitialized = true;
          }
        }
      }
      else if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_MODIFY))
      {
        status = profile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, OFFERING_ID);
        String status2 = profile.getOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, OFFERING_ID);
        if ((status2 != null && status2.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
            || (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK)))
        {
          boolean bConv = IMUtil.isFeatureAdded(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.IBMCONVERSION);
          boolean bDocs = IMUtil.isFeatureAdded(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.IBMDOCS);
          if (bHostListInitialized && (bConv || bDocs))
            bHostListInitialized = false;
          if (!bHostListInitialized)
          {
            controlInvisibleWidgets.clear();
            controlVisibleWidgets.clear();
            // Conversion
            String nodesInfo = null;
            if (bConv)
            {
              if (convSrvUserPWDList.size() > 0)
              {
                clearWidgets(convSrvUserPWDList);
                convSrvUserPWDList.clear();
              }
              if (convSrvHostList.size() > 0)
              {
                Vector<Control> controls = new Vector<Control>(convSrvHostList.get(Constants.IBMCONVERSION));
                layout(controls, true);
                convSrvHostList.clear();
              }
              
              if (convGInfo != null)
                controlVisibleWidgets.add(convGInfo);
              
              nodesInfo = profile.getOfferingUserData(Constants.CONV_NODES, OFFERING_ID);
              createDynamicWidgets(nodesInfo, Constants.IBMCONVERSION);
            }
            else
            {
              if (convGInfo != null)
              {
                if (convGInfo.getVisible())
                  controlInvisibleWidgets.add(convGInfo);
                else
                  controlVisibleWidgets.add(convGInfo);
              }
            }
            // Docs
            if (bDocs)
            {
              if (docsSrvUserPWDList.size() > 0)
              {
                clearWidgets(docsSrvUserPWDList);
                docsSrvUserPWDList.clear();
              }
              if (docsSrvHostList.size() > 0)
              {
                Vector<Control> controls = new Vector<Control>(docsSrvHostList.get(Constants.IBMDOCS));
                layout(controls, true);
                docsSrvHostList.clear();
              }
              
              if (docsGInfo != null)
                controlVisibleWidgets.add(docsGInfo);
              
              nodesInfo = profile.getOfferingUserData(Constants.DOCS_NODES, OFFERING_ID);
              createDynamicWidgets(nodesInfo, Constants.IBMDOCS);
            }
            else
            {
              if (docsGInfo != null)
              {
                if (docsGInfo.getVisible())
                  controlInvisibleWidgets.add(docsGInfo);
                else
                  controlVisibleWidgets.add(docsGInfo);
              }
            }
            // Webserver
            nodesInfo = profile.getOfferingUserData(Constants.IHS_NODES, OFFERING_ID);
            if (nodesInfo != null)
            {
              if (ihsSrvUserPWDList.size() > 0)
              {
                clearWidgets(ihsSrvUserPWDList);
                ihsSrvUserPWDList.clear();
              }
              if (ihsSrvHostList.size() > 0)
              {
                Vector<Control> controls = new Vector<Control>(ihsSrvHostList.get(Constants.WEBSERVER));
                layout(controls, true);
                ihsSrvHostList.clear();
              }
              
              if (ihsGInfo != null)
                controlVisibleWidgets.add(ihsGInfo);
              
              createDynamicWidgets(nodesInfo, Constants.WEBSERVER);
            }
            else
            {
              if (ihsGInfo != null)
              {
                if (ihsGInfo.getVisible())
                  controlInvisibleWidgets.add(ihsGInfo);
                else
                  controlVisibleWidgets.add(ihsGInfo);
              }
            }
            // Local
            if (localSrvHostList.size() == 0)
            {
              if (localGInfo != null)
                controlVisibleWidgets.add(localGInfo);
              
              String localhost = profile.getOfferingUserData(Constants.LOCAL_HOST_NAME, OFFERING_ID);
              createDynamicWidgets(localhost, LOCALNODE);
            }
            if (controlInvisibleWidgets.size() > 0)
            {
              layout(controlInvisibleWidgets, true);
            }
            if (controlVisibleWidgets.size() > 0)
            {
              layout(controlVisibleWidgets, false);
            }
            bHostListInitialized = true;
          }
        }
      }
      else
      {
        PanelStatusManagementService.remove(this);
        return true;
      }
    }

    PanelStatusManagementService.add(this);
    return false;
  }

  public void clearWidgets(Map<Label, Vector<Text>> widgets)
  {
    for (Iterator ite = widgets.entrySet().iterator(); ite.hasNext();)
    {
      Map.Entry entry = (Map.Entry) ite.next();
      Object values = entry.getValue();
      // if (values!=null && values instanceof Vector<Text>)
      if (values != null)
      {
        Vector<Text> user_pwd = (Vector<Text>) values;
        Vector<Control> controls = new Vector<Control>(user_pwd);
        layout(controls, true);
      }
    }
  }

  public void createDynamicWidgets(String nodesInfo, String comp)
  {
    if (nodesInfo == null || comp == null)
      return;
    // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::servername::clustername;
    FormToolkit toolkit = this.getFormToolkit();
    if (comp.equalsIgnoreCase(Constants.IBMCONVERSION))
    {
      Vector<String> nodesStr = IMUtil.parseListString(nodesInfo, Util.LIST_SEPRATOR);
      Vector<Label> labels = new Vector<Label>();
      for (int i = 0; i < nodesStr.size(); i++)
      {
        Vector<Text> texts = new Vector<Text>();
        String nodeStr = nodesStr.get(i);
        Vector<String> nodeInfoV = IMUtil.parseListString(nodeStr, Constants.SEPARATE_SUB_SUB_CHARS);
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        if (convGInfo != null)
        {
          String labelStr = nodeInfoArr[0];// + " for " + nodeInfoArr[4];
          final Label label = toolkit.createLabel(convGInfo, labelStr);
          labels.add(label);
          GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          label.setLayoutData(gridData);

          final Text user = toolkit.createText(convGInfo, "", SWT.SINGLE | SWT.BORDER);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          user.setLayoutData(gridData);
          user.setMessage(Messages.getString("DatabasePanel_USERNAME")); //$NON-NLS-1$

          if (i == 0)
          {
            user.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                // Object key = event.display.getData("lastAscii");
                // key = event.display.getData("lastKey");
                synCredentialInfo(label, user.getText(), true);
                // Text text = (Text)event.widget;
                // text.setSelection(text.getText().length());
                verifyComplete(false, false);
              }
            });
          }
          else
          {
            user.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, user.getText(), true);
                verifyComplete(false, false);
              }
            });
          }
          user.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_User$ACCTip"), label.getText()); //$NON-NLS-1$              
            }
          });
          texts.add(user);
          final Text pwd = toolkit.createText(convGInfo, "", SWT.SINGLE | SWT.BORDER | SWT.PASSWORD);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          pwd.setLayoutData(gridData);
          pwd.setMessage(Messages.getString("DatabasePanel_PASSWORD")); //$NON-NLS-1$
          if (i == 0)
          {
            pwd.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, pwd.getText(), false);
                verifyComplete(false, false);
              }
            });
          }
          else
          {
            pwd.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, pwd.getText(), false);
                verifyComplete(false, false);
              }
            });
          }
          pwd.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_UserPWD$ACCTip"), label.getText()); //$NON-NLS-1$ 
            }
          });
          texts.add(pwd);
          convSrvUserPWDList.put(label, texts);
          if (nodesStr.size() > 1)
          {
            if (i == 0)
            {
              convApplAllBtn = toolkit.createButton(convGInfo, Messages.getString("Message_EnrollHostsPanel_ApplyToAll$Btn"), SWT.PUSH);
              gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
              gridData.widthHint = 120;
              convApplAllBtn.setLayoutData(gridData);
              convApplAllBtn.setToolTipText(Messages.getString("Message_EnrollHostsPanel_ApplyAll$Tip"));
              convApplAllBtn.addMouseListener(new MouseAdapter()
              {
                public void mouseDown(MouseEvent arg0)
                {
                  sameUserPwd(Constants.IBMCONVERSION);
                  verifyComplete(false, false);
                }
              });
            }
            else if (i == 1)
            {
              convResetBtn = toolkit.createButton(convGInfo, Messages.getString("Message_EnrollHostsPanel_Reset$Btn"), SWT.PUSH);
              gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
              gridData.widthHint = 120;
              convResetBtn.setLayoutData(gridData);
              convResetBtn.setToolTipText(Messages.getString("Message_EnrollHostsPanel_Reset$Tip"));
              convResetBtn.addMouseListener(new MouseAdapter()
              {
                public void mouseDown(MouseEvent arg0)
                {
                  reset(Constants.IBMCONVERSION);
                  verifyComplete(false, false);
                }
              });
            }
            else
            {              
              convEmptyLabels.add(createLabel(convGInfo, ""));
            }
          }
          else
          {            
            convEmptyLabels.add(createLabel(convGInfo, ""));
          }
        }
      }
      convSrvHostList.put(Constants.IBMCONVERSION, labels);
    }
    else if (comp.equalsIgnoreCase(Constants.IBMDOCS))
    {
      Vector<String> nodesStr = IMUtil.parseListString(nodesInfo, Util.LIST_SEPRATOR);
      Vector<Label> labels = new Vector<Label>();
      for (int i = 0; i < nodesStr.size(); i++)
      {
        Vector<Text> texts = new Vector<Text>();
        String nodeStr = nodesStr.get(i);
        Vector<String> nodeInfoV = IMUtil.parseListString(nodeStr, Util.LIST_SUB_SEPRATOR);
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        if (docsGInfo != null)
        {
          String labelStr = nodeInfoArr[0];// + " for " + nodeInfoArr[4];
          final Label label = toolkit.createLabel(docsGInfo, labelStr);
          labels.add(label);
          GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          label.setLayoutData(gridData);

          final Text user = toolkit.createText(docsGInfo, "", SWT.SINGLE | SWT.BORDER);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          user.setLayoutData(gridData);
          user.setMessage(Messages.getString("DatabasePanel_USERNAME")); //$NON-NLS-1$
          if (i == 0)
          {
            user.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                // Object key = event.display.getData("lastAscii");
                // key = event.display.getData("lastKey");
                synCredentialInfo(label, user.getText(), true);
                // Text text = (Text)event.widget;
                // text.setFocus();
                verifyComplete(false, false);
              }
            });
          }
          else
          {
            user.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, user.getText(), true);
                verifyComplete(false, false);
              }
            });
          }
          user.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_User$ACCTip"), label.getText()); //$NON-NLS-1$
            }
          });
          texts.add(user);
          final Text pwd = toolkit.createText(docsGInfo, "", SWT.SINGLE | SWT.BORDER | SWT.PASSWORD);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          pwd.setLayoutData(gridData);
          pwd.setMessage(Messages.getString("DatabasePanel_PASSWORD")); //$NON-NLS-1$
          if (i == 0)
          {
            pwd.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, pwd.getText(), false);
                verifyComplete(false, false);
              }
            });
          }
          else
          {
            pwd.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, pwd.getText(), false);
                verifyComplete(false, false);
              }
            });
          }
          pwd.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_UserPWD$ACCTip"), label.getText()); //$NON-NLS-1$ 
            }
          });
          texts.add(pwd);
          docsSrvUserPWDList.put(label, texts);
          if (nodesStr.size() > 1)
          {
            if (i == 0)
            {
              docsApplAllBtn = toolkit.createButton(docsGInfo, Messages.getString("Message_EnrollHostsPanel_ApplyToAll$Btn"), SWT.PUSH);
              gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
              gridData.widthHint = 120;
              docsApplAllBtn.setLayoutData(gridData);
              docsApplAllBtn.setToolTipText(Messages.getString("Message_EnrollHostsPanel_ApplyAll$Tip"));
              docsApplAllBtn.addMouseListener(new MouseAdapter()
              {
                public void mouseDown(MouseEvent arg0)
                {
                  sameUserPwd(Constants.IBMDOCS);
                  verifyComplete(false, false);
                }
              });
            }
            else if (i == 1)
            {
              docsResetBtn = toolkit.createButton(docsGInfo, Messages.getString("Message_EnrollHostsPanel_Reset$Btn"), SWT.PUSH);
              gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
              gridData.widthHint = 120;
              docsResetBtn.setLayoutData(gridData);
              docsResetBtn.setToolTipText(Messages.getString("Message_EnrollHostsPanel_Reset$Tip"));
              docsResetBtn.addMouseListener(new MouseAdapter()
              {
                public void mouseDown(MouseEvent arg0)
                {
                  reset(Constants.IBMDOCS);
                  verifyComplete(false, false);
                }
              });
            }
            else
            {              
              docsEmptyLabels.add(createLabel(docsGInfo, ""));
            }
          }
          else
          {            
            docsEmptyLabels.add(createLabel(docsGInfo, ""));
          }
        }
      }
      docsSrvHostList.put(Constants.IBMDOCS, labels);
    }
    else if (comp.equalsIgnoreCase(Constants.WEBSERVER))
    {
      Vector<String> nodesStr = IMUtil.parseListString(nodesInfo, Util.LIST_SEPRATOR);
      Vector<Label> labels = new Vector<Label>();
      for (int i = 0; i < nodesStr.size(); i++)
      {
        Vector<Text> texts = new Vector<Text>();
        String nodeStr = nodesStr.get(i);
        Vector<String> nodeInfoV = IMUtil.parseListString(nodeStr, Util.LIST_SUB_SEPRATOR);
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        if (ihsGInfo != null)
        {
          String labelStr = nodeInfoArr[0];// + " for " + nodeInfoArr[4];
          final Label label = toolkit.createLabel(ihsGInfo, labelStr);
          labels.add(label);
          GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          label.setLayoutData(gridData);

          final Text user = toolkit.createText(ihsGInfo, "", SWT.SINGLE | SWT.BORDER);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          user.setLayoutData(gridData);
          user.setMessage(Messages.getString("DatabasePanel_USERNAME")); //$NON-NLS-1$
          if (i == 0)
          {
            user.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, user.getText(), true);
                verifyComplete(false, false);
              }
            });
          }
          else
          {
            user.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, user.getText(), true);
                verifyComplete(false, false);
              }
            });
          }
          user.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_User$ACCTip"), label.getText()); //$NON-NLS-1$
            }
          });
          texts.add(user);
          final Text pwd = toolkit.createText(ihsGInfo, "", SWT.SINGLE | SWT.BORDER | SWT.PASSWORD);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          pwd.setLayoutData(gridData);
          pwd.setMessage(Messages.getString("DatabasePanel_PASSWORD")); //$NON-NLS-1$
          if (i == 0)
          {
            pwd.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, pwd.getText(), false);
                verifyComplete(false, false);
              }
            });
          }
          else
          {
            pwd.addModifyListener(new ModifyListener()
            {
              public void modifyText(ModifyEvent event)
              {
                synCredentialInfo(label, pwd.getText(), false);
                verifyComplete(false, false);
              }
            });
          }
          pwd.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_UserPWD$ACCTip"), label.getText()); //$NON-NLS-1$ 
            }
          });
          texts.add(pwd);
          ihsSrvUserPWDList.put(label, texts);
          if (nodesStr.size() > 1)
          {
            if (i == 0)
            {
              ihsApplAllBtn = toolkit.createButton(ihsGInfo, Messages.getString("Message_EnrollHostsPanel_ApplyToAll$Btn"), SWT.PUSH);
              gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
              gridData.widthHint = 120;
              ihsApplAllBtn.setLayoutData(gridData);
              ihsApplAllBtn.setToolTipText(Messages.getString("Message_EnrollHostsPanel_ApplyAll$Tip"));
              ihsApplAllBtn.addMouseListener(new MouseAdapter()
              {
                public void mouseDown(MouseEvent arg0)
                {
                  sameUserPwd(Constants.WEBSERVER);
                  verifyComplete(false, false);
                }
              });
            }
            else if (i == 1)
            {
              ihsResetBtn = toolkit.createButton(ihsGInfo, Messages.getString("Message_EnrollHostsPanel_Reset$Btn"), SWT.PUSH);
              gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
              gridData.widthHint = 120;
              ihsResetBtn.setLayoutData(gridData);
              ihsResetBtn.setToolTipText(Messages.getString("Message_EnrollHostsPanel_Reset$Tip"));
              ihsResetBtn.addMouseListener(new MouseAdapter()
              {
                public void mouseDown(MouseEvent arg0)
                {
                  reset(Constants.WEBSERVER);
                  verifyComplete(false, false);
                }
              });
            }
            else
            {              
              ihsEmptyLabels.add(createLabel(ihsGInfo, ""));
            }
          }
          else
          {            
            ihsEmptyLabels.add(createLabel(ihsGInfo, ""));
          }
        }
      }
      ihsSrvHostList.put(Constants.WEBSERVER, labels);
    }
    else if (comp.equalsIgnoreCase(LOCALNODE))
    {
      // IProfile profile = getCustomPanelData().getProfile();
      // if (profile != null)
      {
        // String localhost = profile.getOfferingUserData(Constants.LOCAL_HOST_NAME, OFFERING_ID);
        if (localGInfo != null)
        {
          Vector<Label> labels = new Vector<Label>();
          final Label label = toolkit.createLabel(localGInfo, nodesInfo);
          labels.add(label);
          GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          label.setLayoutData(gridData);
          Vector<Text> texts = new Vector<Text>();
          final Text user = toolkit.createText(localGInfo, "", SWT.SINGLE | SWT.BORDER);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          user.setLayoutData(gridData);
          user.setMessage(Messages.getString("DatabasePanel_USERNAME")); //$NON-NLS-1$
          user.addModifyListener(new ModifyListener()
          {
            public void modifyText(ModifyEvent event)
            {
              synCredentialInfo(label, user.getText(), true);
              verifyComplete(false, false);
            }
          });
          user.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_User$ACCTip"), label.getText()); //$NON-NLS-1$
            }
          });
          texts.add(user);
          final Text pwd = toolkit.createText(localGInfo, "", SWT.SINGLE | SWT.BORDER | SWT.PASSWORD);
          gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
          gridData.horizontalSpan = 1;
          pwd.setLayoutData(gridData);
          pwd.setMessage(Messages.getString("DatabasePanel_PASSWORD")); //$NON-NLS-1$
          pwd.addModifyListener(new ModifyListener()
          {
            public void modifyText(ModifyEvent event)
            {
              synCredentialInfo(label, pwd.getText(), false);
              verifyComplete(false, false);
            }
          });
          pwd.getAccessible().addAccessibleListener(new AccessibleAdapter()
          {
            @Override
            public void getName(AccessibleEvent e)
            {
              e.result = MessageFormat.format(Messages.getString("Message_EnrollHostsPanel_UserPWD$ACCTip"), label.getText()); //$NON-NLS-1$ 
            }
          });
          texts.add(pwd);
          createBlankLabel(localGInfo, "", 1);
          localSrvHostList.put(LOCALNODE, labels);
          localSrvUserPWDList.put(label, texts);
        }
      }
    }
  }

  public void synCredentialInfo(Label label, String value, boolean bUOrPwd)
  {
    if (label == null || value == null)
      return;

    boolean bStart = false;
    // Conversion
    Vector<Label> lablels = convSrvHostList.get(Constants.IBMCONVERSION);
    // for(Iterator ite = convSrvUserPWDList.entrySet().iterator(); ite.hasNext();)
    if (lablels != null)
    {
      for (int i = 0; i < lablels.size(); i++)
      {
        // Map.Entry entry = (Map.Entry) ite.next();
        // Label key = (Label)(entry.getKey());
        Label key = lablels.get(i);
        if (label == key)
        {
          bStart = true;
        }
        else if (bStart && key.getText().equals(label.getText()))
        {
          Vector<Text> user_pwd = convSrvUserPWDList.get(key);
          // Object values = entry.getValue();
          // if (values!=null)
          {
            // Vector<Text> user_pwd = (Vector<Text>)values;
            if (bUOrPwd)
              user_pwd.get(0).setText(value);// user name
            else
              user_pwd.get(1).setText(value);// password
          }
        }
      }
    }
    // Docs
    lablels = docsSrvHostList.get(Constants.IBMDOCS);
    // for(Iterator ite = docsSrvUserPWDList.entrySet().iterator(); ite.hasNext();)
    if (lablels != null)
    {
      for (int i = 0; i < lablels.size(); i++)
      {
        // Map.Entry entry = (Map.Entry) ite.next();
        // Label key = (Label)(entry.getKey());
        Label key = lablels.get(i);
        if (label == key)
        {
          bStart = true;
        }
        else if (bStart && key.getText().equals(label.getText()))
        {
          Vector<Text> user_pwd = docsSrvUserPWDList.get(key);
          // Object values = entry.getValue();
          // if (values!=null)
          {
            // Vector<Text> user_pwd = (Vector<Text>)values;
            if (bUOrPwd)
              user_pwd.get(0).setText(value);// user name
            else
              user_pwd.get(1).setText(value);// password
          }
        }
      }
    }
    // Webserver
    lablels = ihsSrvHostList.get(Constants.WEBSERVER);
    // for(Iterator ite = ihsSrvUserPWDList.entrySet().iterator(); ite.hasNext();)
    if (lablels != null)
    {
      for (int i = 0; i < lablels.size(); i++)
      {
        // Map.Entry entry = (Map.Entry) ite.next();
        // Label key = (Label)(entry.getKey());
        Label key = lablels.get(i);
        if (label == key)
        {
          bStart = true;
        }
        else if (bStart && key.getText().equals(label.getText()))
        {
          Vector<Text> user_pwd = ihsSrvUserPWDList.get(key);
          // Object values = entry.getValue();
          // if (values!=null)
          {
            // Vector<Text> user_pwd = (Vector<Text>)values;
            if (bUOrPwd)
              user_pwd.get(0).setText(value);// user name
            else
              user_pwd.get(1).setText(value);// password
          }
        }
      }
    }
    // Local
    lablels = localSrvHostList.get(LOCALNODE);
    // for(Iterator ite = localSrvUserPWDList.entrySet().iterator(); ite.hasNext();)
    if (lablels != null)
    {
      for (int i = 0; i < lablels.size(); i++)
      {
        // Map.Entry entry = (Map.Entry) ite.next();
        // Label key = (Label)(entry.getKey());
        Label key = lablels.get(i);
        if (label == key)
        {
          bStart = true;
        }
        else if (bStart && key.getText().equals(label.getText()))
        {
          Vector<Text> user_pwd = localSrvUserPWDList.get(key);
          // Object values = entry.getValue();
          // if (values!=null)
          {
            // Vector<Text> user_pwd = (Vector<Text>)values;
            if (bUOrPwd)
              user_pwd.get(0).setText(value);// user name
            else
              user_pwd.get(1).setText(value);// password
          }
        }
      }
    }
  }

  public void sameUserPwd(String component)
  {
    if (component == null)
      return;

    String user = null;
    String pwd = null;
    // Conversion
    if (component.equalsIgnoreCase(Constants.IBMCONVERSION))
    {
      Vector<Label> lablels = convSrvHostList.get(Constants.IBMCONVERSION);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        if (i == 0)
        {
          user = convSrvUserPWDList.get(key).get(0).getText();
          pwd = convSrvUserPWDList.get(key).get(1).getText();
        }
        else
        {
          convSrvUserPWDList.get(key).get(0).setText(user);
          convSrvUserPWDList.get(key).get(1).setText(pwd);
        }
      }
    }
    // Docs
    else if (component.equalsIgnoreCase(Constants.IBMDOCS))
    {
      Vector<Label> lablels = docsSrvHostList.get(Constants.IBMDOCS);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        if (i == 0)
        {
          user = docsSrvUserPWDList.get(key).get(0).getText();
          pwd = docsSrvUserPWDList.get(key).get(1).getText();
        }
        else
        {
          docsSrvUserPWDList.get(key).get(0).setText(user);
          docsSrvUserPWDList.get(key).get(1).setText(pwd);
        }
      }
    }
    // Webserver
    else if (component.equalsIgnoreCase(Constants.WEBSERVER))
    {
      Vector<Label> lablels = ihsSrvHostList.get(Constants.WEBSERVER);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        if (i == 0)
        {
          user = ihsSrvUserPWDList.get(key).get(0).getText();
          pwd = ihsSrvUserPWDList.get(key).get(1).getText();
        }
        else
        {
          ihsSrvUserPWDList.get(key).get(0).setText(user);
          ihsSrvUserPWDList.get(key).get(1).setText(pwd);
        }
      }
    }
    // Local
    else if (component.equalsIgnoreCase(LOCALNODE))
    {
      Vector<Label> lablels = localSrvHostList.get(LOCALNODE);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        if (i == 0)
        {
          user = localSrvUserPWDList.get(key).get(0).getText();
          pwd = localSrvUserPWDList.get(key).get(1).getText();
        }
        else
        {
          localSrvUserPWDList.get(key).get(0).setText(user);
          localSrvUserPWDList.get(key).get(1).setText(pwd);
        }
      }
    }
  }

  public void reset(String component)
  {
    if (component == null)
      return;

    // Conversion
    if (component.equalsIgnoreCase(Constants.IBMCONVERSION))
    {
      Vector<Label> lablels = convSrvHostList.get(Constants.IBMCONVERSION);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        convSrvUserPWDList.get(key).get(0).setText("");
        convSrvUserPWDList.get(key).get(1).setText("");
      }
    }
    // Docs
    else if (component.equalsIgnoreCase(Constants.IBMDOCS))
    {
      Vector<Label> lablels = docsSrvHostList.get(Constants.IBMDOCS);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        docsSrvUserPWDList.get(key).get(0).setText("");
        docsSrvUserPWDList.get(key).get(1).setText("");
      }
    }
    // Webserver
    else if (component.equalsIgnoreCase(Constants.WEBSERVER))
    {
      Vector<Label> lablels = ihsSrvHostList.get(Constants.WEBSERVER);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        ihsSrvUserPWDList.get(key).get(0).setText("");
        ihsSrvUserPWDList.get(key).get(1).setText("");
      }
    }
    // Local
    else if (component.equalsIgnoreCase(LOCALNODE))
    {
      Vector<Label> lablels = localSrvHostList.get(LOCALNODE);
      for (int i = 0; i < lablels.size(); i++)
      {
        Label key = lablels.get(i);
        localSrvUserPWDList.get(key).get(0).setText("");
        localSrvUserPWDList.get(key).get(1).setText("");
      }
    }
  }

  protected void layout(Vector<Control> controls, boolean visible)
  {
    if (controls == null)
      return;
    for (int i = 0; i < controls.size(); i++)
    {
      GridData data = (GridData) controls.get(i).getLayoutData();
      data.exclude = visible;
      controls.get(i).setVisible(!visible);
    }
    resize();
    relayout();
  }

  protected void resize()
  {
    Control control = this.getControl();
    if (control != null)
    {
      Point size = control.getSize();
      Point newSize = new Point(size.x + 1, size.y + 1);
      control.setSize(newSize);
      control.redraw();
    }
    /*
     * Control topContainer = this.getControl(); if (topContainer != null) { Composite parent = topContainer.getParent(); ScrolledComposite
     * sParent = (ScrolledComposite) parent.getParent(); int prefWidth = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).x; int
     * prefHeight = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).y; sParent.setMinSize(sParent.computeSize(prefWidth, prefHeight));
     * sParent.setOrigin(0, 0); }
     */
  }
  private void relayout()
  {
    if( topContainer == null )
    {
        return;
    }
    Composite parent = topContainer.getParent();
    ScrolledComposite sParent = (ScrolledComposite) parent.getParent();
    int prefWidth = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).x;
    int prefHeight = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).y;
    sParent.setMinSize(sParent.computeSize(prefWidth, prefHeight));
    topContainer.layout();
  }

  /**
   * TODO: Implement this method
   * 
   * This method will initialize the values of the panel if a profile already exists. A profile exists if (1) the user provides an input
   * response file or (2) the panel is being displayed during the modify, update, or uninstall flow.
   */
  @Override
  public void setInitialData()
  {
    /*
     * IProfile profile = getCustomPanelData().getProfile(); if (profile != null) {
     * 
     * 
     * verifyComplete(true,false); }
     */
  }

  /**
   * TODO: Implement this method
   * 
   * This private method is responsible for performing the validation of the widgets on this panel and, either, displaying an error message
   * or setting the page to complete. This method should be called by a widget's listener to reevaluate the completeness of the page when a
   * change is made to the widget's value.
   */
  private void verifyComplete(boolean validate, final boolean async)
  {
    final Map<String, String[]> map = new LinkedHashMap<String, String[]>();

    if (!validate)
      reEnableValidate();

    // The following are validated
    // Conversion
    Vector<Label> labels = convSrvHostList.get(Constants.IBMCONVERSION);
    if (labels != null)
    {
      for (int i = 0; i < labels.size(); i++)
      {
        Label label = labels.get(i);
        Vector<Text> texts = convSrvUserPWDList.get(label);
        String userpwd[] = { texts.get(0).getText(), texts.get(1).getText() };
        map.put(label.getText(), userpwd);
      }
    }
    // Docs
    labels = docsSrvHostList.get(Constants.IBMDOCS);
    if (labels != null)
    {
      for (int i = 0; i < labels.size(); i++)
      {
        Label label = labels.get(i);
        Vector<Text> texts = docsSrvUserPWDList.get(label);
        String userpwd[] = { texts.get(0).getText(), texts.get(1).getText() };
        map.put(label.getText(), userpwd);
      }
    }
    // Webserver
    labels = ihsSrvHostList.get(Constants.WEBSERVER);
    if (labels != null)
    {
      for (int i = 0; i < labels.size(); i++)
      {
        Label label = labels.get(i);
        Vector<Text> texts = ihsSrvUserPWDList.get(label);
        String userpwd[] = { texts.get(0).getText(), texts.get(1).getText() };
        map.put(label.getText(), userpwd);
      }
    }
    // Local
    labels = localSrvHostList.get(LOCALNODE);
    if (labels != null)
    {
      Label label = labels.get(0);
      Vector<Text> texts = localSrvUserPWDList.get(label);
      String userpwd[] = { texts.get(0).getText(), texts.get(1).getText() };
      map.put(label.getText(), userpwd);
    }

    String panelStatus[] = new String[1];
    if (validate)
    {
      panelStatus[0] = Constants.PANEL_STATUS_OK;
      map.put(Constants.ENROLL_HOST_PANEL, panelStatus);
    }
    else
    {
      panelStatus[0] = Constants.PANEL_STATUS_FAILED;
      map.put(Constants.ENROLL_HOST_PANEL, panelStatus);
    }

    final ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IProfile profile = data.getProfile();
    if (profile != null)
    {
      // map.put(Constants.SOAP_PORT,profile.getOfferingUserData(Constants.SOAP_PORT, OFFERING_ID));
      // map.put(Constants.NODE_HOST_LIST,profile.getOfferingUserData(Constants.NODE_HOST_LIST, OFFERING_ID));
    }

    final IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    if (async)
    {
      final Job validatingJob = new Job(Messages.getString("Message_Validating$label"))
      {
        protected IStatus run(IProgressMonitor monitor)
        {
          dataJobsStatus = RegistHostsPanel.this.getAgent().validateOfferingUserData(myOffering, map);
          return Status.OK_STATUS;
        }
      };
      validatingJob.addJobChangeListener(new JobChangeAdapter()
      {
        public void done(IJobChangeEvent e)
        {
          validated(data, dataJobsStatus, map, async);
        }
      });
      validatingJob.schedule();
    }
    else
    {
      dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);
      validated(data, dataJobsStatus, map, async);
    }
  }

  /**
   * Re-enable the Validate button (set the text back to Validate)
   */
  private void reEnableValidate()
  {
    validateBtn.setText(Messages.getString("Message_Validate$label"));
    validateBtn.setEnabled(true);
  }

  /**
   * @see com.ibm.cic.agent.ui.extensions.BaseWizardPanel#performFinish(org.eclipse.core.runtime.IProgressMonitor)
   */
  @Override
  public IStatus performFinish(IProgressMonitor monitor)
  {
    // TODO: Implement perform finish
    return Status.OK_STATUS;
  }

  /**
   * @see com.ibm.cic.agent.ui.extensions.CustomPanel#createControl(org.eclipse.swt.widgets.Composite)
   */
  @Override
  public void createControl(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();

    /*
     * Create a new composite where all of the widgets in our panel will be added to.
     */
    topContainer = toolkit.createComposite(parent);

    /*
     * The layout of a composite is very important and defines how widgets will be organized when added to the composite. A GridLayout is
     * very commonly used and adds UI elements left-to-right in columns. The declaration below indicates that the UI elements will be layed
     * out in two columns.
     * 
     * You can read about layouts here: http://www.eclipse.org/articles/article.php?file=Article-Understanding-Layouts/index.html
     * 
     * You can also refer to the java documentation for the specific layout you choose to understand how to configure it.
     */
    GridLayout gl = new GridLayout(4, false);
    // gl.verticalSpacing = 0;
    // gl.marginHeight = 0;
    topContainer.setLayout(gl);

    /*
     * The parent composite uses a GridLayout. This call is telling the layout for the parent composite to lay the top container out such
     * that it fills all of the available horizontal and vertical space and grabs all available horizontal and vertical space.
     */
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));

    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);
  }

  private void validated(final ICustomPanelData data, final IStatus dataJobsStatus, final Map<String, String[]> dataMap, boolean async)
  {
    if (dataJobsStatus.isOK())
    {
      final IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.SUDO_ENABLED, String.valueOf(isSudo), OFFERING_ID);

      new UIJob("") //$NON-NLS-1$
      {
        public IStatus runInUIThread(IProgressMonitor monitor)
        {
          if (Boolean.valueOf(dataMap.get(Constants.ENROLL_HOST_PANEL)[0]))
          {
            if (!validateBtn.isDisposed())
            {
              validateBtn.setEnabled(false);
              canvas.setVisible(true);
            }
            // To configure wanted variables
            try
            {
              ModalContext.run(new IRunnableWithProgress()
              {
                public void run(IProgressMonitor monitor) throws InvocationTargetException, InterruptedException
                {
                  Map<String, String> registerResults = setInstallVars(dataMap, profile);
                  int iCount = 1;
                  failedHosts = null;
                  for (Iterator ite = registerResults.entrySet().iterator(); ite.hasNext();)
                  {
                    Map.Entry entry = (Map.Entry) ite.next();
                    String hostname = entry.getKey().toString();
                    Object value = entry.getValue();
                    if (value != null && !Boolean.valueOf(value.toString()))
                    {
                      if (iCount == 1)
                        failedHosts = hostname;
                      else
                        failedHosts = failedHosts + "," + hostname;

                      iCount = iCount + 1;
                    }
                  }
                  if (failedHosts != null)
                    setVarsSucceed = false;
                  else
                    setVarsSucceed = true;

                  ModalContext.checkCanceled(monitor);
                }
              }, true, new NullProgressMonitor(), Display.getCurrent());
            }
            catch (InvocationTargetException e)
            {
              setVarsSucceed = false;
            }
            catch (InterruptedException e)
            {
              setVarsSucceed = false;
            }
            if (!RegistHostsPanel.this.isDisposed())
            {
              if (setVarsSucceed)
              {
                setErrorMessage(null);
                validateBtn.setEnabled(false);
                canvas.setVisible(false);
                setMessage(Messages.getString("Message_EnrollHostsPanel_ValidationSuccessful$msg"), IMessageProvider.INFORMATION);
                setPageComplete(true);
                PanelStatusManagementService.statusNotify();
              }
              else
              {
                setErrorMessage(NLS.bind(Messages.getString("Message_EnrollHostsPanel_Enroll$msg"), failedHosts));
                validateBtn.setEnabled(true);
                canvas.setVisible(false);
                PanelStatusManagementService.statusNotify();
              }
            }
          }
          else
          {
            if (!RegistHostsPanel.this.isDisposed())
            {
              validateBtn.setEnabled(true);
              canvas.setVisible(false);
              setErrorMessage(Messages.getString("Message_EnrollHostsPanel_Validate$Tips"));
              setPageComplete(false);
              PanelStatusManagementService.statusNotify();
            }
          }
          return Status.OK_STATUS;
        }
      }.schedule();
    }
    else
    {
      new UIJob("") //$NON-NLS-1$
      {
        public IStatus runInUIThread(IProgressMonitor monitor)
        {
          if (!RegistHostsPanel.this.isDisposed())
          {
            setErrorMessage(dataJobsStatus.getMessage());
            validateBtn.setEnabled(true);
            canvas.setVisible(false);
            setPageComplete(false);
          }

          return Status.OK_STATUS;
        }
      }.schedule();
    }

  }

  private Map<String, String> setInstallVars(final Map<String, String[]> dataMap, final IProfile profile)
  {
    // *** Determine if this is an install or a install_node based on whether or not the application
    // *** was previously installed or not.
    {
      String adminName = profile.getOfferingUserData(Constants.WASADMIN, OFFERING_ID);
      String adminPwd = profile.getOfferingUserData(Constants.PASSWORD_OF_WASADMIN, OFFERING_ID);
      String profilePath = profile.getOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, OFFERING_ID);
      adminPwd = EncryptionUtils.decrypt(adminPwd);
      Map<String, String> results = new HashMap<String, String>();
      try
      {
        // NODE_HOST::::hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT;
        String nodesInfo = profile.getOfferingUserData(Constants.NODE_HOST_LIST, OFFERING_ID);
        if (nodesInfo != null && nodesInfo.trim().length() > 0)
        {
          Vector<String[]> nodeInfo = IMUtil.parseListString(nodesInfo, Util.LIST_SEPRATOR, Constants.SEPARATE_SUB_SUB_CHARS);
          Map<String, String[]> hostInfo = new HashMap<String, String[]>();
          for (int i = 0; i < nodeInfo.size(); i++)
            // hostname => [hostname,ostype,nodetype,nodename,USER_INSTALL_ROOT,WAS_INSTALL_ROOT]
            hostInfo.put(nodeInfo.get(i)[0], nodeInfo.get(i));

          // hostname:username:password:ostype;
          String targets = "";
          int nCount = 1;
          for (Iterator ite = dataMap.entrySet().iterator(); ite.hasNext();)
          {
            Map.Entry entry = (Map.Entry) ite.next();
            String hostname = entry.getKey().toString();
            if (!hostname.equalsIgnoreCase(Constants.ENROLL_HOST_PANEL))
            {
              Object values = entry.getValue();
              if (values != null && values instanceof String[])
              {
                String user = ((String[]) values)[0];
                String pwd = ((String[]) values)[1];
                String osType = "";
                if (hostInfo.get(hostname) != null && hostInfo.get(hostname).length > 1)
                {
                  osType = hostInfo.get(hostname)[1];
                }
                if (nCount == 1)
                {
                  targets = hostname + Util.LIST_SUB_SEPRATOR + user + Util.LIST_SUB_SEPRATOR + pwd + Util.LIST_SUB_SEPRATOR + osType;
                }
                else
                {
                  targets = targets + Util.LIST_SEPRATOR + hostname + Util.LIST_SUB_SEPRATOR + user + Util.LIST_SUB_SEPRATOR + pwd
                      + Util.LIST_SUB_SEPRATOR + osType;
                }
              }
            }
            nCount = nCount + 1;
          }
          // hostname:username:password:ostype;
          String scriptPath = IMUtil.getScriptsPath(this.getCustomPanelData().getProfile());
          String sudoEnabled = profile.getOfferingUserData(Constants.SUDO_ENABLED, Constants.OFFERING_ID);
          results = Util.prepareJobTarget(profilePath, adminName, adminPwd, targets, scriptPath, sudoEnabled);
        }
      }
      catch (IOException e)
      {
        logger.log(ILogLevel.ERROR, "Check if failed to enroll target host. {0}", e); // NON-NLS-1
        // Note: Tolerate and assume this is the first install in the cluster and full cluster install is required
      }
      catch (InterruptedException e)
      {
        logger.log(ILogLevel.ERROR, "Check if failed to enroll target host. {0}", e); // NON-NLS-1
        // Note: Tolerate and assume this is the first install in the cluster and full cluster install is required
      }
      catch(Exception e)
      {
        logger.log(ILogLevel.ERROR, "Check if failed to enroll target host. {0}", e); // NON-NLS-1
      }
      profile.setUserData(Constants.ENROLL_HOST_PANEL, "");
      profile.setOfferingUserData(Constants.ENROLL_HOST_PANEL, dataMap.get(Constants.ENROLL_HOST_PANEL)[0], OFFERING_ID);

      return results;
    }
  }

}