/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.docs;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractCustomConfigPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class SharedStoragePanel extends AbstractCustomConfigPanel
{
  private boolean convInstalled = true;

  private boolean docsInstalled = true;

  private boolean viewerInstalled = true;

  private boolean isSameCell = true;

  private boolean isSameNode = true;

  private boolean isCN = false;

  private boolean isCNS = false;

  private Text docsSharedLocalPathText;

  private Text docsServerDataLocText;

  private Text viewerSharedLocalPathText;

  private Text uploadPathText;

  private Text viewerServerDataLocText;
  
  private Text docsServerDataLocOnViewerText;

  private Composite topContainer;

  private Composite docsMountPointComp;

  private Composite viewerMountPointComp;

  private Composite docsMountPathComp;

  private Composite viewerMountPathComp;
  
  private Composite docsMountPathOnViewerComp;  

  private Composite viewerUploadComp;

  public SharedStoragePanel()
  {
    super(Messages.getString("SharedStoragePanel.SHARED_STORAGE_SERVER_NODE")); //$NON-NLS-1$    
  }

  /**
   * Give initial default data in the user interface.
   * 
   * This method will initialize the values of the panel if a profile already exists. A profile exists if (1) the user provides an input
   * response file or (2) the panel is being displayed during the modify, update, or uninstall flow.
   */
  public void setInitialData()
  {

    IProfile profile = getCustomPanelData().getProfile();
    if (profile != null)
    {
      initFeatureData();

      String serverLoc = profile.getOfferingUserData(Constants.SD_DOCS_SHARED_LOCAL_PATH, OFFERING_ID);
      if (serverLoc != null && serverLoc.trim().length() > 0)
      {
        this.docsSharedLocalPathText.setText(serverLoc.trim());
      }

      String sharedDataLoc = profile.getOfferingUserData(Constants.SD_DOCS_SERVER_DATA_LOC, OFFERING_ID);
      if (sharedDataLoc != null && sharedDataLoc.trim().length() > 0)
      {
        this.docsServerDataLocText.setText(sharedDataLoc.trim());
      }

      String viewerServerLoc = profile.getOfferingUserData(Constants.SD_VIEWER_SHARED_LOCAL_PATH, OFFERING_ID);
      if (viewerServerLoc != null && viewerServerLoc.trim().length() > 0)
      {
        this.viewerSharedLocalPathText.setText(viewerServerLoc.trim());
      }

      String uploadFPath = profile.getOfferingUserData(Constants.SD_UPLOAD_FILES_PATH, OFFERING_ID);
      if (uploadFPath != null && uploadFPath.trim().length() > 0)
      {
        this.uploadPathText.setText(uploadFPath.trim());
      }

      String viewerSharedDataLoc = profile.getOfferingUserData(Constants.SD_VIEWER_SERVER_DATA_LOC, OFFERING_ID);
      if (viewerSharedDataLoc != null && viewerSharedDataLoc.trim().length() > 0)
      {
        this.viewerServerDataLocText.setText(viewerSharedDataLoc);
      }

      String docsSharedDataLocOnViewer = profile.getOfferingUserData(Constants.SD_DOCS_SERVER_DATA_LOC_ON_VIEWER, OFFERING_ID);
      if (docsSharedDataLocOnViewer != null && docsSharedDataLocOnViewer.trim().length() > 0)
      {
        this.docsServerDataLocOnViewerText.setText(docsSharedDataLocOnViewer);
      }      
      
      verifyComplete(false, false);
    }
  }

  private void initFeatureData()
  {
    convInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.CONVERSION_ID);
    docsInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMDOCS);
    viewerInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMVIEWER);
    isCN = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_ECM_ID);
    isCNS = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_STANDALONE_ST_ID);
  }

  @Override
  public void createControl(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    topContainer = toolkit.createComposite(parent);
    topContainer.setLayout(new GridLayout(2, false));
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);

  }

  protected void createPanelControls(final Composite parent, final FormToolkit toolkit)
  {
    Composite mountComp = createPanel(parent, true);
    Label header = this.createPlainLabel(mountComp, Messages.getString("SharedStoragePanel.MOUNT_POINTS"), 1, VINDENT_DEFAULT); //$NON-NLS-1$
    PanelUtil.setFontBold(header);

    docsMountPointComp = createPanel(parent, true);
    Label labelForText = this.createPlainLabel(docsMountPointComp, Messages.getString("MSG_CONVERSION_LOC_DOCS_SERVER"), 0,
        VINDENT_PANEL_DEFAULT);
    this.createExampleLabel(docsMountPointComp, Messages.getString("MSG_CONVERSION_LOC_DOCS_SERVER_E"), 0, NONE_VINDENT); //$NON-NLS-1$
    this.docsSharedLocalPathText = this.createText(docsMountPointComp, "", Messages.getString("MSG_CONVERSION_LOC_DOCS_SERVER_TIP"), 320); //$NON-NLS-1$ 
    PanelUtil.registerAccRelation(labelForText, this.docsSharedLocalPathText);

    viewerMountPointComp = createPanel(parent, true);
    labelForText = this.createPlainLabel(viewerMountPointComp,
        Messages.getString("MSG_CONVERSION_LOC_VIEWER_SERVER"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(viewerMountPointComp, Messages.getString("MSG_CONVERSION_LOC_VIEWER_SERVER_E"), 0, NONE_VINDENT); //$NON-NLS-1$
    this.viewerSharedLocalPathText = this.createText(viewerMountPointComp,
        "", Messages.getString("MSG_CONVERSION_LOC_VIEWER_SERVER_TIP"), 320); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.viewerSharedLocalPathText);

    docsMountPathComp = createPanel(parent, true);
    labelForText = this.createPlainLabel(docsMountPathComp,
        Messages.getString("SharedStoragePanel.SHARED_DATA_DIR_DESC"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(docsMountPathComp, Messages.getString("SharedStoragePanel.SHARED_DATA_DIR_EXAMPLE"), 0, NONE_VINDENT); //$NON-NLS-1$ 
    this.docsServerDataLocText = this.createText(docsMountPathComp, "", "", 546); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.docsServerDataLocText);

    viewerMountPathComp = this.createPanel(parent, true);
    labelForText = this.createPlainLabel(viewerMountPathComp,
        Messages.getString("MSG_VIEWER_MAINPANEL_SHAREDDIRECTORY_TEXT"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(viewerMountPathComp, Messages.getString("MSG_VIEWER_MAINPANEL_SHAREDDIRECTORY_TEXT_E"), 0, NONE_VINDENT); //$NON-NLS-1$ 
    this.viewerServerDataLocText = this.createText(viewerMountPathComp, "", "", 546); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.viewerServerDataLocText);
    
    docsMountPathOnViewerComp = this.createPanel(parent, viewerInstalled);
    labelForText = this.createPlainLabel(docsMountPathOnViewerComp,
        Messages.getString("MSG_VIEWER_MAINPANEL_SHAREDDOCSDIRECTORY_TEXT"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(docsMountPathOnViewerComp, Messages.getString("MSG_VIEWER_MAINPANEL_SHAREDDOCSDIRECTORY_TEXT_E"), 0, NONE_VINDENT); //$NON-NLS-1$ 
    this.docsServerDataLocOnViewerText = this.createText(docsMountPathOnViewerComp, "", "", 546); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.docsServerDataLocOnViewerText);    

    viewerUploadComp = this.createPanel(parent, viewerInstalled && !isSameNode);
    labelForText = this.createPlainLabel(viewerUploadComp, Messages.getString("SharedStoragePanel.FILE_PATH"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(viewerUploadComp, Messages.getString("SharedStoragePanel.VIEWER_FILEPATH_HINT"), 0, NONE_VINDENT); //$NON-NLS-1$
    this.createPlainLabel(viewerUploadComp, Messages.getString("SharedStoragePanel.VIEWER_FILEPATH_HINT2"), 0, NONE_VINDENT);//$NON-NLS-1$
    this.createExampleLabel(viewerUploadComp, Messages.getString("SharedStoragePanel.VIEWER_FILEPATH_E"), 0, NONE_VINDENT);//$NON-NLS-1$
    this.uploadPathText = this.createText(viewerUploadComp, "", "", 320); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.uploadPathText);

  }

  public boolean shouldSkip()
  {
    boolean newconvInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.CONVERSION_ID);
    boolean newdocsInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);
    boolean newviewerInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_ID);
    if (!(newconvInstalled || newdocsInstalled || newviewerInstalled))
    {
      return true;
    }
    boolean newIsSameCell = IMUtil.isSameCellWithIC(this.getCustomPanelData().getProfile());
    boolean newIsSameNode = IMUtil.isViewerSameNodeWithIC(this.getCustomPanelData().getProfile());
    boolean newIsCN = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_ECM_ID);
    boolean newIsCNS = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_STANDALONE_ST_ID);

    if (docsInstalled != newdocsInstalled || viewerInstalled != newviewerInstalled || convInstalled != newconvInstalled
        || isSameCell != newIsSameCell || isSameNode != newIsSameNode || isCN != newIsCN || isCNS != newIsCNS)
    {
      docsInstalled = newdocsInstalled;
      viewerInstalled = newviewerInstalled;
      convInstalled = newconvInstalled;
      isSameCell = newIsSameCell;
      isSameNode = newIsSameNode;
      isCN = newIsCN;
      isCNS = newIsCNS;
      this.updateUI();
      verifyComplete(false, false);
    }
    return false;
  }

  private void updateUI()
  {
    ICustomPanelData panelData = this.getCustomPanelData();	  
    boolean visible = (docsInstalled && convInstalled) && IMUtil.isVisible(panelData, Constants.VERSION_106); // C+D or C+D+V
    GridData data = (GridData) docsMountPointComp.getLayoutData();
    data.exclude = !visible;
    docsMountPointComp.setVisible(visible);

    visible = (convInstalled && !isCN && !isCNS) && IMUtil.isVisible(panelData, Constants.VERSION_106); // C or C+D ? or C+V or C+D+V
    data = (GridData) viewerMountPointComp.getLayoutData();
    data.exclude = !visible;
    viewerMountPointComp.setVisible(visible);

    visible = docsInstalled && IMUtil.isVisible(panelData, Constants.VERSION_106);
    data = (GridData) docsMountPathComp.getLayoutData();
    data.exclude = !visible;
    docsMountPathComp.setVisible(visible);

    visible = viewerInstalled && IMUtil.isVisible(panelData, Constants.VERSION_106);
    data = (GridData) viewerMountPathComp.getLayoutData();
    data.exclude = !visible;
    viewerMountPathComp.setVisible(visible);

    visible = (viewerInstalled && !isSameNode) && IMUtil.isVisible(panelData, Constants.VERSION_106);
    data = (GridData) viewerUploadComp.getLayoutData();
    data.exclude = !visible;
    viewerUploadComp.setVisible(visible);
    
    visible = docsInstalled && viewerInstalled && IMUtil.isVisible(panelData, "2.0.0");
    if (visible)
    	panelData.getProfile().setOfferingUserData(Constants.VIEWER_EDITOR_INSTALLED, Constants.COMBO_OPTION_YES, OFFERING_ID);
    else
    	panelData.getProfile().setOfferingUserData(Constants.VIEWER_EDITOR_INSTALLED, Constants.COMBO_OPTION_NO, OFFERING_ID);    	
    data = (GridData) docsMountPathOnViewerComp.getLayoutData();
    data.exclude = !visible;
    docsMountPathOnViewerComp.setVisible(visible);        

    resize();
  }

  private void resize()
  {
    Composite parent = topContainer.getParent();
    ScrolledComposite sParent = (ScrolledComposite) parent.getParent();
    int prefWidth = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).x;
    int prefHeight = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).y;
    sParent.setMinSize(sParent.computeSize(prefWidth, prefHeight));
    sParent.setOrigin(0, 0);
    topContainer.layout();
  }

  /**
   * To create a composite so as to place controls
   * 
   * @param parent
   *          , parent composite
   * @param isAdvanced
   *          , if true, it contains advanced configuration
   * @return created composite
   */
  private Composite createPanel(Composite parent, boolean isShown)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    if (!isShown)
    {
      data.exclude = true;
    }
    panel.setLayoutData(data);
    return panel;
  }

  private void createExampleLabel(Composite parent, String message, int fontHeight, int vIndent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = toolkit.createLabel(parent, Messages.getString("EXAMPLE"), SWT.WRAP);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, false, false, 1, 1);
    gd.verticalIndent = vIndent;
    label.setLayoutData(gd);

    Label msgLabel = toolkit.createLabel(parent, message, SWT.WRAP);
    GridData gdmsg = new GridData(SWT.FILL, SWT.BEGINNING, false, false, 1, 1);
    gdmsg.widthHint = 400;
    gdmsg.verticalIndent = vIndent;
    msgLabel.setLayoutData(gdmsg);
    PanelUtil.setCourierNewFont(msgLabel, fontHeight);
  }

  /*
   * @type if type equals 0, it is plain font style, else if type equals 1, it is bold font style
   */
  private Label createPlainLabel(Composite parent, String message, int fontHeight, int vIndent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = toolkit.createLabel(parent, message, SWT.WRAP);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = 400;
    gd.verticalIndent = vIndent;
    label.setLayoutData(gd);
    PanelUtil.setFont(label, fontHeight);
    return label;
  }

  private Text createText(Composite parent, String defaultValue, String tooltip, int widthHint)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, SWT.SINGLE | SWT.BORDER);
    if (tooltip != null && !"".equals(tooltip)) //$NON-NLS-1$
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = widthHint;
    widget.setLayoutData(gd);
    widget.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete(false, false);
      }
    });
    return widget;
  }

  /**
   * Validate user input here.
   * 
   * This private method is responsible for performing the validation of the widgets on this panel and, either, displaying an error message
   * or setting the page to complete. This method should be called by a widget's listener to reevaluate the completeness of the page when a
   * change is made to the widget's value.
   */
  private void verifyComplete(boolean validate, final boolean async)
  {
    Map<String, String> map = new HashMap<String, String>();

    String docsLocalPath = this.docsSharedLocalPathText.getText().trim();
    String sharedDataLoc = this.docsServerDataLocText.getText().trim();
    map.put(Constants.SD_DOCS_SHARED_LOCAL_PATH, docsLocalPath);
    map.put(Constants.SD_DOCS_SERVER_DATA_LOC, sharedDataLoc);

    String viewerFullyHName = null;
    if (convInstalled && isSameCell)
    {
      viewerFullyHName = this.getCustomPanelData().getProfile().getOfferingUserData(Constants.VIEWER_URL, OFFERING_ID);
      if (viewerFullyHName == null)
      {
        viewerFullyHName = "";
      }
    }
    else
    {
      viewerFullyHName = "";
    }

    String viewerLocalPath = this.viewerSharedLocalPathText.getText().trim();
    String uploadFPath = this.uploadPathText.getText().trim();
    String viewerSharedDataLoc = this.viewerServerDataLocText.getText().trim();
    String docsSharedDataLocOnViewer = this.docsServerDataLocOnViewerText.getText().trim();    
    map.put(Constants.SD_VIEWER_SHARED_LOCAL_PATH, viewerLocalPath);
    map.put(Constants.SD_VIEWER_FULLY_HOSTNAME, viewerFullyHName);
    map.put(Constants.SD_UPLOAD_FILES_PATH, uploadFPath);
    map.put(Constants.SD_VIEWER_SERVER_DATA_LOC, viewerSharedDataLoc);
    map.put(Constants.SD_DOCS_SERVER_DATA_LOC_ON_VIEWER, docsSharedDataLocOnViewer);      

    map.put(Constants.SD_CONV_INSTALLED, (convInstalled ? "true" : "false"));
    map.put(Constants.SD_DOCS_INSTALLED, (docsInstalled ? "true" : "false"));
    map.put(Constants.SD_VIEWER_INSTALLED, (viewerInstalled ? "true" : "false"));
    map.put(Constants.SD_VIEWER_SAME_IC_NODE, (isSameNode ? "true" : "false"));
    map.put(Constants.SD_IS_ICN, ((isCN || isCNS) ? "true" : "false"));

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    IStatus dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);

    if (dataJobsStatus.isOK())
    {
      // *** Save the user's input in the profile
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.SD_DOCS_SHARED_LOCAL_PATH, docsLocalPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.SD_DOCS_SERVER_DATA_LOC, sharedDataLoc, OFFERING_ID);

      profile.setOfferingUserData(Constants.SD_VIEWER_SHARED_LOCAL_PATH, viewerLocalPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.SD_VIEWER_FULLY_HOSTNAME, viewerFullyHName, OFFERING_ID);
      profile.setOfferingUserData(Constants.SD_UPLOAD_FILES_PATH, uploadFPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.SD_VIEWER_SERVER_DATA_LOC, viewerSharedDataLoc, OFFERING_ID);
      profile.setOfferingUserData(Constants.SD_DOCS_SERVER_DATA_LOC_ON_VIEWER, docsSharedDataLocOnViewer, OFFERING_ID);      

      setErrorMessage(null);

      if (isPageComplete() && PanelStatusManagementService.getInstance().getCompletedStatus())
        PanelStatusManagementService.getInstance().force();
      else
      {
        setPageComplete(true);
        PanelStatusManagementService.statusNotify();
      }
    }
    else
    {
      setErrorMessage(dataJobsStatus.getMessage());
      setPageComplete(false);
      PanelStatusManagementService.statusNotify();
    }

  }

  public IStatus performFinish(IProgressMonitor monitor)
  {
    return super.performFinish(monitor);
  }

  public IStatus performCancel(IProgressMonitor monitor)
  {
    return super.performCancel(monitor);
  }
}
