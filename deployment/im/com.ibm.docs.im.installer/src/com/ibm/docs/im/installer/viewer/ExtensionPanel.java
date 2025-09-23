/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.viewer;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Combo;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.DirectoryDialog;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractConfigurationPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class ExtensionPanel extends AbstractConfigurationPanel
{

  private static final String OFFERING_ID = "com.ibm.docs.im.installer";

  private Text docsExtInstallationPath;

  private Text docsExtDaemonSharedPath;

  private Combo docsExtIgnoreEventCombo;

  private Text docsExtICVersionText;

  private Combo viewerExtUploadConversionCombo;

  private Composite docsExtPanel;

  private Composite docsExtIEPanel;

  private Composite sepPanel;

  private Composite viewerExtPanel;

  private Composite viewerExtIEPanel;

  private boolean isViewerExtInstalled = true;

  private boolean isDocsExtInstalled = true;

  private Composite defaultTextPanel;

  private Composite daemonSharedPathPanel;

  private Composite connExtPathPanel;

  private Composite connVersionPanel;

  private Composite basicDesPanel;

  private Composite extensionFooterNotePanel;

  public ExtensionPanel()
  {
    super(Messages.getString("MSG_SERVEREXTENSION_PANEL_NAME"));
  }

  @Override
  protected void handleAdvancedLinkEvent()
  {
    if (!isDocsExtInstalled && isViewerExtInstalled)
    {
      setPanelVisible(defaultTextPanel, !advancedSettingsVisible);
    }
  }

  protected void createPanelControls(final Composite parent, final FormToolkit toolkit)
  {

    if (hidePanels == null)
    {
      hidePanels = new ArrayList<Composite>();
    }
    // Advanced settings
    createAdvancedLink(parent);

    // Docs Server Extension
    docsExtPanel = createPanel(parent);
    Label label = createLabelAsBoldStyle(docsExtPanel, toolkit, Messages.getString("MSG_SERVEREXTENSION_PANEL_NAME"));
    GridData dData = new GridData(GridData.FILL, GridData.FILL, true, false, 2, 1);
    label.setLayoutData(dData);

    // Basic Description
    basicDesPanel = createPanel(parent);
    createDescriptionLabel(basicDesPanel, Messages.getString("MSG_DOCS_EXTENSION_BASIC_DESCRIPTION"));

    // IBM Connections Extension Directory
    connExtPathPanel = createExtPanel(parent);
    Label labelForText = createHeaderLabel(connExtPathPanel, Messages.getString("MSG_DOCS_EXTENSION_INSTALLATIONPATH_LABEL"));
    // createDescriptionLabel(connExtPathPanel, Messages.getString("MSG_DOCS_EXTENSION_INSTALLATIONPATH_TEXT"));
    createExampleLabel(connExtPathPanel, Messages.getString("MSG_DOCS_EXTENSION_INSTALLATIONPATH_WIN_EXAMPLE"));
    createExampleLabel(connExtPathPanel, Messages.getString("MSG_DOCS_EXTENSION_INSTALLATIONPATH_LINUX_EXAMPLE"));
    docsExtInstallationPath = toolkit.createText(connExtPathPanel, "", SWT.SINGLE | SWT.BORDER);
    PanelUtil.registerAccRelation(labelForText, this.docsExtInstallationPath);

    docsExtInstallationPath.setLayoutData(createTextGridData(418));
    docsExtInstallationPath.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    Button extInsBrowse = new Button(connExtPathPanel, SWT.PUSH);
    extInsBrowse.setText(Messages.Message_WASInfoPanel_WASInstallRootBrowser$Label);
    GridData browseGridData = new GridData(GridData.BEGINNING, GridData.CENTER, true, false, 1, 1);
    extInsBrowse.setLayoutData(browseGridData);
    extInsBrowse.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent event)
      {
        String dirName = new DirectoryDialog(parent.getShell()).open();
        if (dirName != null)
        {
          docsExtInstallationPath.setText(dirName);
        }
      }
    });
    // Daemon Shared Path
    daemonSharedPathPanel = createExtPanel(parent);
    labelForText = createHeaderLabel(daemonSharedPathPanel, Messages.getString("MSG_DOCS_EXTENSION_DAEMONSHAREDPATH_LABEL"));
    // createDescriptionLabel(daemonSharedPathPanel, Messages.getString("MSG_DOCS_EXTENSION_DAEMONSHAREDPATH_TEXT"));
    createExampleLabel(daemonSharedPathPanel, Messages.getString("MSG_DOCS_EXTENSION_DAEMONSHAREDPATH_WIN_EXAMPLE"));
    createExampleLabel(daemonSharedPathPanel, Messages.getString("MSG_DOCS_EXTENSION_DAEMONSHAREDPATH_LINUX_EXAMPLE"));
    docsExtDaemonSharedPath = toolkit.createText(daemonSharedPathPanel, "", SWT.SINGLE | SWT.BORDER);
    PanelUtil.registerAccRelation(labelForText, this.docsExtDaemonSharedPath);

    docsExtDaemonSharedPath.setLayoutData(createTextGridData(418));
    docsExtDaemonSharedPath.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    Button demInsBrowse = new Button(daemonSharedPathPanel, SWT.PUSH);
    demInsBrowse.setText(Messages.Message_WASInfoPanel_WASInstallRootBrowser$Label);
    GridData demGridData = new GridData(GridData.BEGINNING, GridData.CENTER, true, false, 1, 1);
    demInsBrowse.setLayoutData(demGridData);
    demInsBrowse.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent event)
      {
        String dirName = new DirectoryDialog(parent.getShell()).open();
        if (dirName != null)
        {
          docsExtDaemonSharedPath.setText(dirName);
        }
      }
    });

    // Docs Extension FooterNote
    extensionFooterNotePanel = createPanel(parent);
    createDescriptionLabel(extensionFooterNotePanel, Messages.getString("MSG_DOCS_EXTENSION_FOOTERNOTE"));

    // Ignore Event
    docsExtIEPanel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(docsExtIEPanel, Messages.getString("MSG_DOCS_EXTENSION_IGNORE_EVENT_LABEL"));
    createDescriptionLabel(docsExtIEPanel, Messages.getString("MSG_DOCS_EXTENSION_IGNORE_EVENT_TEXT"));
    docsExtIgnoreEventCombo = createCombo(docsExtIEPanel,
        new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 1, 200);
    PanelUtil.registerAccRelation(labelForText, this.docsExtIgnoreEventCombo);
    docsExtIgnoreEventCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

    
    // Version of IBM Connections
    connVersionPanel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(connVersionPanel, Messages.getString("MSG_DOCS_EXTENSION_ICVERSION_LABEL"));
    createDescriptionLabel(connVersionPanel, Messages.getString("MSG_DOCS_EXTENSION_ICVERSION_TEXT"));
    createExampleLabel(connVersionPanel, Messages.getString("MSG_DOCS_EXTENSION_ICVERSION_EXAMPLE"));
    docsExtICVersionText = toolkit.createText(connVersionPanel, "5.0", SWT.SINGLE | SWT.BORDER);
    docsExtICVersionText.setLayoutData(createDefaultTextGridData(150));
    PanelUtil.registerAccRelation(labelForText, this.docsExtICVersionText);
    docsExtICVersionText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // Separator
    sepPanel = createHiddenPanel(parent);
    Label seprator = toolkit.createSeparator(sepPanel, SWT.HORIZONTAL);
    GridData sepData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    sepData.verticalIndent = 10;
    seprator.setLayoutData(sepData);

    // Default text for viewer extension
    defaultTextPanel = createPanel(parent);
    createDescriptionLabel(defaultTextPanel, Messages.getString("MSG_VIEWER_EXTENSION_DEFAULT_TEXT"));
    setPanelVisible(defaultTextPanel, false);

    // Viewer Server Extension
    viewerExtPanel = createHiddenPanel(parent);
    Label viewerExtLabel = createLabelAsBoldStyle(viewerExtPanel, toolkit, Messages.getString("MSG_VIEWER_EXTENSION_NAME"));
    GridData vData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    vData.verticalIndent = 10;
    viewerExtLabel.setLayoutData(vData);

    // Upload conversion
    viewerExtIEPanel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(viewerExtIEPanel, Messages.getString("MSG_VIEWER_EXTENSION_ENABLEUPLOAD_LABEL"));
    createDescriptionLabel(viewerExtIEPanel, Messages.getString("MSG_VEIWER_EXTPANEL_UPLOADCONVERSION_DESC"));
    viewerExtUploadConversionCombo = createCombo(viewerExtIEPanel,
        new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 0, 200);
    PanelUtil.registerAccRelation(labelForText, this.viewerExtUploadConversionCombo);
    viewerExtUploadConversionCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

   
  }
  @Override
  public IStatus performFinish(IProgressMonitor arg0)
  {
    return Status.OK_STATUS;
  }

  public boolean shouldSkip()
  {
    ICustomPanelData data = this.getCustomPanelData();
    boolean isUpgraded = IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE);
    if (isUpgraded)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }
    
    boolean newIsViewerExtInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMVIEWEREXT);
    boolean newIsDocsExtInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMDOCEXT);

    if (IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCCM) || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICCCMECM))
    {
      data.getProfile().setOfferingUserData(Constants.DOCS_EXT_IC_CCM_ENABLED, "True", OFFERING_ID);
    }
    else
    {
      data.getProfile().setOfferingUserData(Constants.DOCS_EXT_IC_CCM_ENABLED, "False", OFFERING_ID);
    }

    if (!newIsViewerExtInstalled && !newIsDocsExtInstalled)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }

    if (isViewerExtInstalled != newIsViewerExtInstalled || isDocsExtInstalled != newIsDocsExtInstalled)
    {
      isViewerExtInstalled = newIsViewerExtInstalled;
      isDocsExtInstalled = newIsDocsExtInstalled;

      if (!isDocsExtInstalled)
      {
        // setPanelVisible(docsExtPanel, false);
        setPanelVisible(basicDesPanel, false);
        // setPanelVisible(connExtPathPanel, false);
        // setPanelVisible(daemonSharedPathPanel, false);
        setPanelVisible(extensionFooterNotePanel, false);
        removeHiddenPanel(docsExtIEPanel);
        // removeHiddenPanel(docsExtATPanel);
        // removeHiddenPanel(docsExtJ2CPanel);
        removeHiddenPanel(connVersionPanel);
      }
      else
      {
        // setPanelVisible(docsExtPanel, true);
        setPanelVisible(basicDesPanel, true);
        // setPanelVisible(connExtPathPanel, true);
        // setPanelVisible(daemonSharedPathPanel, true);
        setPanelVisible(extensionFooterNotePanel, true);
        addHiddenPanel(docsExtIEPanel);
        // addHiddenPanel(docsExtATPanel);
        // addHiddenPanel(docsExtJ2CPanel);
        addHiddenPanel(connVersionPanel);
      }
      if (!isViewerExtInstalled)
      {
        removeHiddenPanel(viewerExtPanel);
        removeHiddenPanel(viewerExtIEPanel);
        // removeHiddenPanel(viewerExtATPanel);
        // removeHiddenPanel(viewerExtJ2CPanel);
      }
      else
      {
        addHiddenPanel(viewerExtPanel);
        addHiddenPanel(viewerExtIEPanel);
        // addHiddenPanel(viewerExtATPanel);
        // addHiddenPanel(viewerExtJ2CPanel);
      }

      if (isViewerExtInstalled && !isDocsExtInstalled)
      {
        setPanelVisible(defaultTextPanel, !advancedSettingsVisible);
      }
      else
      {
        setPanelVisible(defaultTextPanel, false);
      }
      if (isDocsExtInstalled && isViewerExtInstalled)
      {
        addHiddenPanel(sepPanel);
      }
      else
      {
        removeHiddenPanel(sepPanel);
      }

      resize();

      verifyComplete();
    }

    PanelStatusManagementService.add(this);
    return false;
  }

  private void addHiddenPanel(Composite panel)
  {
    if (!hidePanels.contains(panel))
    {
      hidePanels.add(panel);
      GridData gridData = (GridData) panel.getLayoutData();
      gridData.exclude = false;
      panel.setVisible(advancedSettingsVisible);
    }
  }

  private void removeHiddenPanel(Composite panel)
  {
    if (hidePanels.contains(panel))
    {
      hidePanels.remove(panel);
      setPanelVisible(panel, false);
    }
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
    IProfile profile = getCustomPanelData().getProfile();

    if (profile != null)
    {
      String icInstallPath = profile.getOfferingUserData(Constants.DOCS_EXT_IC_INSTALLATION_PATH, OFFERING_ID);
      String sharedPath = profile.getOfferingUserData(Constants.DOCS_EXT_SHARED_PATH, OFFERING_ID);
      String docsIgnoreEvent = profile.getOfferingUserData(Constants.DOCS_EXT_IGNORE_EVENT, OFFERING_ID);
      String docsauthType = profile.getOfferingUserData(Constants.DOCS_EXT_AUTH_TYPE, OFFERING_ID);
      String docsAlias = profile.getOfferingUserData(Constants.DOCS_EXT_J2C_ALIAS, OFFERING_ID);
      String icVer = profile.getOfferingUserData(Constants.DOCS_EXT_IC_VERSION, OFFERING_ID);
      String viewerIgnoreEvent = profile.getOfferingUserData(Constants.VIEWER_EXT_IGNORE_EVENT, OFFERING_ID);
      String viewerAuthType = profile.getOfferingUserData(Constants.VIEWER_EXT_AUTH_TYPE, OFFERING_ID);
      String viewerAlias = profile.getOfferingUserData(Constants.VIEWER_EXT_J2C_ALIAS, OFFERING_ID);

      if (icInstallPath != null && icInstallPath.trim().length() > 0)
      {
        docsExtInstallationPath.setText(icInstallPath);
      }

      if (sharedPath != null && sharedPath.trim().length() > 0)
      {
        docsExtDaemonSharedPath.setText(sharedPath);
      }

      if (docsIgnoreEvent != null && docsIgnoreEvent.trim().length() > 0)
      {
        if (docsIgnoreEvent.endsWith(Constants.COMBO_OPTION_TRUE))
        {
          docsExtIgnoreEventCombo.select(1);
        }
        else
        {
          docsExtIgnoreEventCombo.select(0);
        }
      }
      else
      {
        docsExtIgnoreEventCombo.select(0);
      }

      if (icVer != null && icVer.trim().length() > 0)
      {
        docsExtICVersionText.setText(icVer);
      }

      if (viewerIgnoreEvent != null && viewerIgnoreEvent.trim().length() > 0)
      {
        if (viewerIgnoreEvent.endsWith(Constants.COMBO_OPTION_YES))
        {
          viewerExtUploadConversionCombo.select(0);
        }
        else
        {
          viewerExtUploadConversionCombo.select(1);
        }
      }
      else
      {
        viewerExtUploadConversionCombo.select(0);
      }

      verifyComplete();
    }
  }

  private void verifyComplete()
  {
    String docsExtInstallPath = docsExtInstallationPath.getText().trim();
    String docsExtdaemonSharedPath = docsExtDaemonSharedPath.getText().trim();
    String docsExtJ2CAlias = "docsAdmin";
    String docsExtIgnoreEvent = Constants.COMBO_OPTION_FALSE;
    if (docsExtIgnoreEventCombo.getSelectionIndex() == 1)
    {
      docsExtIgnoreEvent = Constants.COMBO_OPTION_TRUE;
    }
    String docsExtAuthType = Constants.AUTH_TYPE_BASIC;
    String docsExtConnVersion = docsExtICVersionText.getText().trim();
    String viewerExtJ2cAlias = "viewerAdmin";
    String viewerExtUploadConv = Constants.COMBO_OPTION_YES;
    if (viewerExtUploadConversionCombo.getSelectionIndex() == 1)
    {
      viewerExtUploadConv = Constants.COMBO_OPTION_NO;
    }
    String viewerExtAuthType = Constants.AUTH_TYPE_BASIC;

    Map<String, String> map = new HashMap<String, String>();
    map.put(Constants.DOCS_EXT_INSTALLED, isDocsExtInstalled ? "true" : "false");
    map.put(Constants.VIEWER_EXT_INSTALLED, isViewerExtInstalled ? "true" : "false");
    map.put(Constants.DOCS_EXT_IC_INSTALLATION_PATH, docsExtInstallPath);
    map.put(Constants.DOCS_EXT_SHARED_PATH, docsExtdaemonSharedPath);
    map.put(Constants.DOCS_EXT_J2C_ALIAS, docsExtJ2CAlias);
    map.put(Constants.DOCS_EXT_IC_VERSION, docsExtConnVersion);
    map.put(Constants.VIEWER_EXT_J2C_ALIAS, viewerExtJ2cAlias);

    map.put(Constants.DOCS_EXT_AUTH_TYPE, docsExtAuthType);
    map.put(Constants.VIEWER_EXT_AUTH_TYPE, viewerExtAuthType);

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] jobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(jobs, OFFERING_ID);
    IStatus status = this.getAgent().validateOfferingUserData(myOffering, map);
    if (status.isOK())
    {
      IProfile profile = data.getProfile();
      File parent = new File(data.getProfile().getInstallLocation());
      File docsDir = new File(parent, Constants.DOC_EXT_ID.substring(3));
      String docsExtPath = docsDir.getAbsolutePath();
      File viewerDir = new File(parent, Constants.VIEWER_EXT_ID.substring(3));
      String viewerExtPath = viewerDir.getAbsolutePath();

      profile.setOfferingUserData(Constants.DOCS_EXT_INSTALL_ROOT, docsExtPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_EXT_IC_INSTALLATION_PATH, docsExtInstallPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_EXT_SHARED_PATH, docsExtdaemonSharedPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_EXT_J2C_ALIAS, docsExtJ2CAlias, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_EXT_IGNORE_EVENT, docsExtIgnoreEvent, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_EXT_AUTH_TYPE, docsExtAuthType, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_EXT_IC_VERSION, docsExtConnVersion, OFFERING_ID);

      if (IMUtil.isFeatureSelected(jobs, Constants.IBMCCM) || IMUtil.isFeatureSelected(jobs, Constants.IBMICCCMECM))
      {
        profile.setOfferingUserData(Constants.DOCS_EXT_IC_CCM_ENABLED, "True", OFFERING_ID);
      }
      else
      {
        profile.setOfferingUserData(Constants.DOCS_EXT_IC_CCM_ENABLED, "False", OFFERING_ID);
      }

      profile.setOfferingUserData(Constants.VIEWER_EXT_INSTALL_ROOT, viewerExtPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_EXT_J2C_ALIAS, viewerExtJ2cAlias, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_EXT_IGNORE_EVENT, viewerExtUploadConv, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_EXT_AUTH_TYPE, viewerExtAuthType, OFFERING_ID);

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
      setErrorMessage(status.getMessage());
      setPageComplete(false);
      PanelStatusManagementService.statusNotify();
    }
  }
}
