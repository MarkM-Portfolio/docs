/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.docs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Combo;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.events.HyperlinkAdapter;
import org.eclipse.ui.forms.events.HyperlinkEvent;
import org.eclipse.ui.forms.widgets.FormToolkit;
import org.eclipse.ui.forms.widgets.Hyperlink;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractCustomConfigPanel;
import com.ibm.docs.im.installer.common.ui.ConvServiceListener;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.ConvConfigService;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class DocsPanel extends AbstractCustomConfigPanel implements ConvServiceListener
{
  // private static final ILogger logger = IMLogger.getLogger(DocsPanel.class.getCanonicalName());

  // private static final String DEFAULT_SERVER_INSTALL_LOC = "/opt/IBM/ConnectionsDocs/Docs"; // NON-NLS-1

  private static final String DEFAULT_CONV_DOMAIN = "http://conversion.yourdomain.com/conversion"; // NON-NLS-1

  private static final String DEFAULT_CONN_ADMIN = "connectionsAdmin"; // NON-NLS-1

  private String[] authorizationChoices = new String[] { Constants.DOCS_AUTHORIZATION_FORM, Constants.DOCS_AUTHORIZATION_TAM,
      Constants.DOCS_AUTHORIZATION_SAML };

  private Text installLocText;

  private Text connFilesURLText;
  
  private boolean dataInitialed = false;

  private Text connConnectionsURLText;

  private Text convServiceURLText;

  private Text connsAdminText;

  private Text tamHostText;

  private Combo authorizationCombo;

  private Combo multitenancyCombo;

  // private Combo nodeJSCombo;

  private Composite topContainer;

  private Composite tamContainer;

  private Hyperlink advancedLink;

  private ArrayList<Composite> advancePanels;

  private ArrayList<Composite> sameCellPanels;

  private ArrayList<Composite> sameICCellPanels;

  private ArrayList<Composite> icnPanels;

  private boolean advancedSettingsVisible = false;

  private boolean isAdvancedSettingsShown = false;

  private boolean docsInstalled = true;

  private boolean viewerInstalled = true;

  private boolean isSameCell = true;

  private boolean isICSameCell = true;

  private boolean isIntergrateWithNoNConnections = false;

  public DocsPanel()
  {
    super(Messages.getString("DocsPanel.DOCS_NODE")); //$NON-NLS-1$
    ConvConfigService.register(this);
  }

  public IStatus performFinish(IProgressMonitor monitor)
  {
    return super.performFinish(monitor);
  }

  public IStatus performCancel(IProgressMonitor monitor)
  {
    return super.performCancel(monitor);
  }

  public boolean shouldSkip()
  {
    boolean newDocInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);
    if (!newDocInstalled)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }
    boolean newViewerInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_ID);
    boolean newIsSameCell = IMUtil.isSameCellWithConversion(this.getCustomPanelData());
    boolean newIsICSameCell = IMUtil.isSameCellWithIC(this.getCustomPanelData().getProfile());
    boolean newIsCN = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_ECM_ID);
    boolean newIsCNST = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_STANDALONE_ST_ID);
    boolean newIs3rd = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMTPI);
    boolean newisIntergrateWithNoNConnections = (newIsCN || newIsCNST || newIs3rd);
    boolean changed = false;
    if (docsInstalled != newDocInstalled || viewerInstalled != newViewerInstalled || isSameCell != newIsSameCell
        || isICSameCell != newIsICSameCell || isIntergrateWithNoNConnections != newisIntergrateWithNoNConnections)
    {
      docsInstalled = newDocInstalled;
      viewerInstalled = newViewerInstalled;
      isSameCell = newIsSameCell;
      isICSameCell = newIsICSameCell;
      isIntergrateWithNoNConnections = newisIntergrateWithNoNConnections;
      changed = true;
    }

    updateUI();

    if (changed)
    {
      for (int i = 0; i < sameICCellPanels.size(); i++)
      {
        boolean visible = !isICSameCell && !isIntergrateWithNoNConnections;
        GridData data = (GridData) sameICCellPanels.get(i).getLayoutData();
        data.exclude = !visible;
        sameICCellPanels.get(i).setVisible(visible);
      }

      for (int i = 0; i < sameCellPanels.size(); i++)
      {
        GridData data = (GridData) sameCellPanels.get(i).getLayoutData();
        data.exclude = isSameCell;
        sameCellPanels.get(i).setVisible(!isSameCell);
      }

      if (isAdvancedSettingsShown)
      {
        layoutICN(true);
      }
      resize();
    }

    PanelStatusManagementService.add(this);
    return false;
  }

  private void updateUI()
  {
    IProfile profile = getCustomPanelData().getProfile();
    if (profile != null)
    {
      boolean changed = false;
      if (isICSameCell && !isIntergrateWithNoNConnections)
      {
        String connFilesUrl = profile.getOfferingUserData(Constants.IC_FILES_URL, OFFERING_ID);
        String value = this.connFilesURLText.getText();
        if (connFilesUrl != null && connFilesUrl.trim().length() > 0 && !connFilesUrl.trim().equals(value))
        {
          this.connFilesURLText.setText(connFilesUrl.trim());
          changed = true;
        }
        String connectionUrl = profile.getOfferingUserData(Constants.IC_CONNECTIONS_URL, OFFERING_ID);
        value = this.connConnectionsURLText.getText();
        if (connectionUrl != null && connectionUrl.trim().length() > 0 && !connectionUrl.trim().equals(value))
        {
          this.connConnectionsURLText.setText(connectionUrl.trim());
          changed = true;
        }
      }
      String convServiceUrl = profile.getOfferingUserData(Constants.CONVERSION_URL, OFFERING_ID);
      String value = this.convServiceURLText.getText();
      if (convServiceUrl != null && convServiceUrl.trim().length() > 0 && !convServiceUrl.trim().equals(value))
      {
        this.convServiceURLText.setText(convServiceUrl.trim());
        changed = true;
      }
      if (changed)
      {
        verifyComplete(false, false);
      }
    }
  }

  public void update()
  {
    String value = ConvConfigService.getConvURLValue();
    if (!convServiceURLText.getText().trim().equals(value))
    {
      convServiceURLText.setText(value);
    }
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
      String installLoc = profile.getOfferingUserData(Constants.DOCS_INSTALL_LOCATION, OFFERING_ID);
      if (installLoc != null && installLoc.trim().length() > 0)
      {
        this.installLocText.setText(installLoc.trim());
      }
      String connFilesUrl = profile.getOfferingUserData(Constants.DOCS_CONN_FILES_URL, OFFERING_ID);
      if (connFilesUrl != null && connFilesUrl.trim().length() > 0)
      {
        this.connFilesURLText.setText(connFilesUrl.trim());
      }
      String connectionUrl = profile.getOfferingUserData(Constants.DOCS_CONNECTION_URL, OFFERING_ID);
      if (connectionUrl != null && connectionUrl.trim().length() > 0)
      {
        this.connConnectionsURLText.setText(connectionUrl.trim());
      }
      String convServiceUrl = profile.getOfferingUserData(Constants.DOCS_CONV_SERVICE_URL, OFFERING_ID);
      if (convServiceUrl != null && convServiceUrl.trim().length() > 0)
      {
        this.convServiceURLText.setText(convServiceUrl.trim());
      }
      String connAmdin = profile.getOfferingUserData(Constants.DOCS_CONN_ADMIN, OFFERING_ID);
      if (connAmdin != null && connAmdin.trim().length() > 0)
      {
        this.connsAdminText.setText(connAmdin.trim());
      }
      String tamHost = profile.getOfferingUserData(Constants.DOCS_TAM_HOST, OFFERING_ID);
      if (tamHost != null && tamHost.trim().length() > 0)
      {
        this.tamHostText.setText(tamHost.trim());
      }
      String authorization = profile.getOfferingUserData(Constants.DOCS_AUTHORIZATION, OFFERING_ID);
      if (authorization != null && authorization.trim().length() > 0)
      {
        for (int i = 0; i < authorizationChoices.length; i++)
        {
          if (authorizationChoices[i].equalsIgnoreCase(authorization))
          {
            this.authorizationCombo.select(i);
            doAuthAction();
            break;
          }
        }
      }
      String multitenancy = profile.getOfferingUserData(Constants.DOCS_MULTITENANCY, OFFERING_ID);
      if (multitenancy != null && multitenancy.trim().length() > 0)
      {
        if (Constants.COMBO_OPTION_TRUE.equalsIgnoreCase(multitenancy))
        {
          this.multitenancyCombo.select(0);
        }
        else
        {
          this.multitenancyCombo.select(1);
        }
      }
      dataInitialed = true;
      verifyComplete(false, false);
    }
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

    String installValue = this.installLocText.getText().trim();
    map.put(Constants.DOCS_INSTALL_LOCATION, installValue);

    String connFilesUrl = this.connFilesURLText.getText().trim();
    map.put(Constants.DOCS_CONN_FILES_URL, connFilesUrl);

    String connectionUrl = this.connConnectionsURLText.getText().trim();
    map.put(Constants.DOCS_CONNECTION_URL, connectionUrl);

    String convServiceUrl = this.convServiceURLText.getText().trim();
    map.put(Constants.DOCS_CONV_SERVICE_URL, convServiceUrl);

    String connAmdin = this.connsAdminText.getText().trim();
    map.put(Constants.DOCS_CONN_ADMIN, connAmdin);

    String tamHost = this.tamHostText.getText().trim();
    map.put(Constants.DOCS_TAM_HOST, tamHost);

    String authorization = this.authorizationCombo.getText().trim();
    map.put(Constants.DOCS_AUTHORIZATION, authorization);

    switch (this.multitenancyCombo.getSelectionIndex())
      {
        case 0 :
          map.put(Constants.DOCS_MULTITENANCY, Constants.COMBO_OPTION_TRUE);
          break;
        case 1 :
          map.put(Constants.DOCS_MULTITENANCY, Constants.COMBO_OPTION_FALSE);
          break;
      }
    map.put(Constants.SD_SAME_IC_CESS, (isICSameCell ? "true" : "false"));
    map.put(Constants.SD_IS_ICN, (isIntergrateWithNoNConnections ? "true" : "false"));
    // String nodeJS = this.nodeJSCombo.getText().trim();
    // map.put(Constants.DOCS_NODEJS, nodeJS);

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    IStatus dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);

    if (dataJobsStatus.isOK()&& dataInitialed)
    {
      // *** Save the user's input in the profile
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.DOCS_INSTALL_LOCATION, installValue, OFFERING_ID);
      if (isIntergrateWithNoNConnections)
      {
        connFilesUrl = profile.getOfferingUserData(Constants.IC_FILES_URL, OFFERING_ID);
        if (connFilesUrl == null || "".equals(connFilesUrl))
        {
          connFilesUrl = "http://connections.example.com/files";
        }
        connectionUrl = profile.getOfferingUserData(Constants.IC_CONNECTIONS_URL, OFFERING_ID);
        if (connectionUrl == null || "".equals(connectionUrl))
        {
          connectionUrl = "http://connections.example.com/connections";
        }
      }
      profile.setOfferingUserData(Constants.DOCS_CONN_FILES_URL, connFilesUrl, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_CONNECTION_URL, connectionUrl, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_CONV_SERVICE_URL, convServiceUrl, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_CONN_ADMIN, connAmdin, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_TAM_HOST, tamHost, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_AUTHORIZATION, authorization, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_NODEJS, Constants.COMBO_OPTION_FALSE, OFFERING_ID);

      profile.setOfferingUserData(Constants.DOCS_SCOPE, Constants.TOPOLOGY_CLUSTER, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_NODE_NAME, "", OFFERING_ID);
      profile.setOfferingUserData(Constants.SOFTWARE_MODE, Constants.CONV_DEPLOY_TYPE_ONPREMISE, OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_WEBSERVER_NAME, "", OFFERING_ID);
      profile.setOfferingUserData(Constants.NON_JOB_MGR_NAME, Constants.COMBO_OPTION_FALSE, OFFERING_ID);

      switch (this.multitenancyCombo.getSelectionIndex())
        {
          case 0 :
            profile.setUserData(Constants.DOCS_MULTITENANCY, Constants.COMBO_OPTION_TRUE);
            profile.setOfferingUserData(Constants.DOCS_MULTITENANCY, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
            break;
          case 1 :
            profile.setUserData(Constants.DOCS_MULTITENANCY, Constants.COMBO_OPTION_FALSE);
            profile.setOfferingUserData(Constants.DOCS_MULTITENANCY, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
            break;
        }

      profile.setUserData(Constants.DOCS_INSTALL_LOCATION, installValue);
      profile.setUserData(Constants.DOCS_CONN_FILES_URL, connFilesUrl);
      profile.setUserData(Constants.DOCS_CONNECTION_URL, connectionUrl);
      profile.setUserData(Constants.DOCS_CONV_SERVICE_URL, convServiceUrl);
      profile.setUserData(Constants.DOCS_CONN_ADMIN, connAmdin);
      profile.setUserData(Constants.DOCS_TAM_HOST, tamHost);
      profile.setUserData(Constants.DOCS_AUTHORIZATION, authorization);
      profile.setUserData(Constants.DOCS_NODEJS, Constants.COMBO_OPTION_FALSE);

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

  @Override
  public void createControl(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    topContainer = toolkit.createComposite(parent);
    topContainer.setLayout(new GridLayout(1, false));
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, false));
    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);
  }

  protected void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    if (advancePanels == null)
    {
      advancePanels = new ArrayList<Composite>();
    }
    if (sameCellPanels == null)
    {
      sameCellPanels = new ArrayList<Composite>();
    }
    if (sameICCellPanels == null)
    {
      sameICCellPanels = new ArrayList<Composite>();
    }
    if (icnPanels == null)
    {
      icnPanels = new ArrayList<Composite>();
    }

    Composite container = createPanel(parent, false);
    this.createAdvancedLink(container, toolkit);
    //    this.createBoldLabel(container, Messages.getString("DocsPanel.CONFIG_PROP"), NONE_VINDENT, 1); //$NON-NLS-1$
    Label labelForText = this
        .createPlainLabel(container, Messages.getString("DocsPanel.INSTALL_LOC_DESC"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.INSTALL_LOC_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.installLocText = this.createText(container, "", "", false, 320); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.installLocText);

    //    this.createPlainLabel(container, Messages.getString("DocsPanel.SHARED_DATA_DIR"), true); //$NON-NLS-1$
    //    this.createPlainLabel(container, Messages.getString("DocsPanel.SHARED_DATA_DIR_DESC"), false); //$NON-NLS-1$
    //    this.createPlainLabel(container, Messages.getString("DocsPanel.SHARED_DATA_DIR_EXAMPLE"), false); //$NON-NLS-1$ 
    //    this.sharedDataLocText = this.createText(container, DEFAULT_SHARED_DATA_LOC, Messages.getString("DocsPanel.SHARED_DATA_DIR_TIP"), 546); //$NON-NLS-1$
    container = createSameCellPanel(parent, true);
    labelForText = this.createPlainLabel(container, Messages.getString("DocsPanel.FILES_SERVER_URL"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.FILES_SERVER_URL_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.FILES_SERVER_URL_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.connFilesURLText = this.createText(container, "", "", false, 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.connFilesURLText);

    labelForText = this.createPlainLabel(container, Messages.getString("DocsPanel.CONN_URL"), false, VINDENT_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.CONN_URL_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.CONN_URL_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.connConnectionsURLText = this.createText(container, "", "", false, 400); //$NON-NLS-1$   
    PanelUtil.registerAccRelation(labelForText, this.connConnectionsURLText);

    container = createSameCellPanel(parent, false);

    labelForText = this.createPlainLabel(container, Messages.getString("DocsPanel.CONV_URL"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.CONV_URL_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.CONV_URL_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.convServiceURLText = this.createText(container, DEFAULT_CONV_DOMAIN, "", true, 400); //$NON-NLS-1$  
    PanelUtil.registerAccRelation(labelForText, this.convServiceURLText);
    convServiceURLText.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        ConvConfigService.notify(convServiceURLText.getText().trim());
        verifyComplete(false, false);
      }
    });
    container = createPanel(parent, true);
    icnPanels.add(container);
    labelForText = this.createPlainLabel(container, Messages.getString("DocsPanel.J2C_CONFIG"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.J2C_CONFIG_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.J2C_CONFIG_DESC2"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.connsAdminText = this.createText(container, DEFAULT_CONN_ADMIN, "", false, 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.connsAdminText);

    container = createPanel(parent, true);
    labelForText = this.createPlainLabel(container, Messages.getString("DocsPanel.AUTHORIZATION_TYPE"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    PanelUtil.createComposedLabel(container, toolkit,
        Messages.getString("DocsPanel.AUTHORIZATION_TYPE_TAM"), Messages.getString("DocsPanel.AUTHORIZATION_TYPE_TAM_DESC")); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.createComposedLabel(container, toolkit,
        Messages.getString("DocsPanel.AUTHORIZATION_TYPE_FORM"), Messages.getString("DocsPanel.AUTHORIZATION_TYPE_FORM_DESC")); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.createComposedLabel(container, toolkit,
        Messages.getString("DocsPanel.AUTHORIZATION_TYPE_SAML"), Messages.getString("DocsPanel.AUTHORIZATION_TYPE_SAML_DESC")); //$NON-NLS-1$ //$NON-NLS-2$
    this.authorizationCombo = this.createCombo(container, Messages.getString("DocsPanel.AUTHORIZATION_TYPE_TIP")); //$NON-NLS-1$
    this.authorizationCombo.setItems(authorizationChoices);
    this.authorizationCombo.select(0);
    PanelUtil.registerAccRelation(labelForText, this.authorizationCombo);

    this.tamContainer = createPanel(parent, true);

    labelForText = this.createPlainLabel(tamContainer, Messages.getString("DocsPanel.AUTHORIZATION_HOST"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(tamContainer, Messages.getString("DocsPanel.AUTHORIZATION_HOST_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(tamContainer, Messages.getString("DocsPanel.AUTHORIZATION_HOST_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    //this.createPlainLabel(tamContainer, Messages.getString("DocsPanel.AUTHORIZATION_HOST_DESC3"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    //this.createPlainLabel(tamContainer, Messages.getString("DocsPanel.AUTHORIZATION_HOST_DESC4"), false, NONE_VINDENT, 0); //$NON-NLS-1$

    this.tamHostText = this.createText(tamContainer, "", "", false, 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.tamHostText);

    container = createPanel(parent, true);
    icnPanels.add(container);
    labelForText = this.createPlainLabel(container, Messages.getString("DocsPanel.MULTITENANCY"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DocsPanel.MULTITENANCY_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.multitenancyCombo = this.createCombo(container, ""); //$NON-NLS-1$
    this.multitenancyCombo.setItems(new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }); //$NON-NLS-1$ //$NON-NLS-2$
    this.multitenancyCombo.select(1);
    PanelUtil.registerAccRelation(labelForText, this.multitenancyCombo);

    this.multitenancyCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete(false, false);
      }
    });
    //    this.createPlainLabel(container, Messages.getString("DocsPanel.NODEJS_CONFIG"), true); //$NON-NLS-1$
    //    this.nodeJSCombo = this.createCombo(container, Messages.getString("DocsPanel.NODEJS_CONFIG")); //$NON-NLS-1$
    // this.nodeJSCombo.setItems(truefalseChoices);
    // this.nodeJSCombo.select(0);

    this.authorizationCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        doAuthAction();
        verifyComplete(false, false);
      }
    });

  }

  private void doAuthAction()
  {
    customLayout();
    Composite parent = topContainer.getParent();
    ScrolledComposite sParent = (ScrolledComposite) parent.getParent();
    sParent.showControl(multitenancyCombo);
  }

  private Composite createPanel(Composite parent, boolean isAdvanced)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    if (isAdvanced)
    {
      data.exclude = true;
    }
    panel.setLayoutData(data);
    if (isAdvanced)
    {
      advancePanels.add(panel);
    }
    return panel;
  }

  private Composite createSameCellPanel(Composite parent, boolean isIC)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    if (isIC)
    {
      data.exclude = this.isICSameCell;
    }
    else
    {
      data.exclude = this.isSameCell;
    }
    panel.setLayoutData(data);
    if (isIC)
    {
      sameICCellPanels.add(panel);
    }
    else
    {
      sameCellPanels.add(panel);
    }
    return panel;
  }

  private void createAdvancedLink(final Composite parent, FormToolkit toolkit)
  {
    advancedLink = toolkit.createHyperlink(parent, Messages.getString("MSG_CONVERSION_ADVANCED_SETING"), SWT.WRAP); //$NON-NLS-1$
    GridData gd = new GridData(GridData.END, GridData.END, true, false, 2, 1);
    advancedLink.setLayoutData(gd);
    advancedLink.addHyperlinkListener(new HyperlinkAdapter()
    {
      public void linkActivated(HyperlinkEvent e)
      {
        advancedLink.setText(!advancedSettingsVisible ? Messages.getString("MSG_CONVERSION_BASIC_SETING") : Messages
            .getString("MSG_CONVERSION_ADVANCED_SETING"));
        advancedLink.getParent().layout(true);
        layout();
        advancedSettingsVisible = !advancedSettingsVisible;
        isAdvancedSettingsShown = advancedSettingsVisible;
        if (advancedSettingsVisible)
        {
          connsAdminText.setFocus();
        }
        else
        {
          installLocText.setFocus();
        }
      }
    });
  }

  private void layout()
  {
    for (int i = 0; i < advancePanels.size(); i++)
    {
      GridData data = (GridData) advancePanels.get(i).getLayoutData();
      data.exclude = advancedSettingsVisible;
      advancePanels.get(i).setVisible(!advancedSettingsVisible);
    }
    layoutICN(false);
    customLayout();
  }

  private void layoutICN(boolean onlyByICN)
  {
    for (int i = 0; i < icnPanels.size(); i++)
    {
      boolean visible = onlyByICN ? !isIntergrateWithNoNConnections : (!advancedSettingsVisible && !isIntergrateWithNoNConnections);
      GridData data = (GridData) icnPanels.get(i).getLayoutData();
      data.exclude = !visible;
      icnPanels.get(i).setVisible(visible);
    }
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

  private void customLayout()
  {
    boolean visible = authorizationCombo.isVisible();
    boolean isTam = (authorizationCombo.getSelectionIndex() == 1);
    GridData stData = (GridData) tamContainer.getLayoutData();
    if (visible)
    {
      if (isTam)
      {
        stData.exclude = false;
        tamContainer.setVisible(true);
        this.tamHostText.setFocus();
      }
      else
      {
        stData.exclude = true;
        tamContainer.setVisible(false);
      }
    }
    else
    {
      stData.exclude = true;
      tamContainer.setVisible(false);
    }
    resize();
  }

  private Label createPlainLabel(Composite parent, String message, boolean isExample, int vIndent, int fontHeight)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = toolkit.createLabel(parent, message, SWT.WRAP);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = 400;
    if (vIndent > 0)
    {
      gd.verticalIndent = vIndent;
    }
    label.setLayoutData(gd);
    if (isExample)
    {
      PanelUtil.setCourierNewFont(label, fontHeight);
    }
    else
    {
      PanelUtil.setFont(label, fontHeight);
    }
    return label;
  }

  // private Label createBoldLabel(Composite parent, String message, int vIndent, int fontHeight)
  // {
  // FormToolkit toolkit = this.getFormToolkit();
  // Label label = PanelUtil.createBoldLabel(parent, toolkit, message);
  // GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
  // if (vIndent > 0)
  // {
  // gd.verticalIndent = vIndent;
  // }
  // label.setLayoutData(gd);
  // PanelUtil.setFont(label, fontHeight);
  // return label;
  // }

  private Text createText(Composite parent, String defaultValue, String tooltip, boolean byOwn, int widthHint)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, SWT.SINGLE | SWT.BORDER); //$NON-NLS-1$
    if (tooltip != null && !"".equals(tooltip))
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    if (widthHint > 0)
      gd.widthHint = widthHint;
    widget.setLayoutData(gd);
    if (!byOwn)
    {
      widget.addModifyListener(new ModifyListener()
      {
        public void modifyText(ModifyEvent event)
        {
          verifyComplete(false, false);
        }
      });
    }
    return widget;
  }

  private Combo createCombo(Composite parent, String tooltip)
  {
    Combo widget = new Combo(parent, SWT.SINGLE | SWT.BORDER | SWT.READ_ONLY);
    if (tooltip != null && !"".equals(tooltip))
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = 200;
    widget.setLayoutData(gd);
    return widget;
  }

}