/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.database;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.accessibility.AccessibleAdapter;
import org.eclipse.swt.accessibility.AccessibleEvent;
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
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractCustomConfigPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.DynamicImageViewer;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class DatabasePanel extends AbstractCustomConfigPanel
{
  // private static final ILogger logger = IMLogger.getLogger(DatabasePanel.class.getCanonicalName());

  // private static final String DEFAULT_DB_NAME = "CONCORD"; // NON-NLS-1

  // private static final String DEFAULT_JDBC_PATH = "/opt/ibm/db2/V9.7/java"; // NON-NLS-1

  // private static final String DEFAULT_DB_PORT = "50000"; // NON-NLS-1

  private String[] dbtypes = new String[] { Constants.DB_PRODUCT_NAME_DB2, Constants.DB_PRODUCT_NAME_ORACLE,
      Constants.DB_PRODUCT_NAME_SQLSERVER };

  private Text userName;

  private Text password;

  private Text dbserverText;

  private Combo productCombo;

  private Text dbnameText;

  private Text jdbcpathText;

  private Text dbportText;

  // private Button validateBtn;

  private DynamicImageViewer canvas;

  private Map<String, String> dataMap;

  private Label nameSidLabel;

  private Label descLabel;

  private Composite topContainer;

  private ArrayList<Composite> noneUpgradePanels;

  private ArrayList<Composite> upgradePanels;

  private boolean isUpgraded = false;

  public DatabasePanel()
  {
    super(Messages.getString("DatabasePanel_DB_SERVER_NODE")); //$NON-NLS-1$
    dataMap = new HashMap<String, String>();
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
    boolean docsInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);
    if (!docsInstalled)
    {
      cleanProfileData();
      PanelStatusManagementService.remove(this);
      return true;
    }

    ICustomPanelData data = this.getCustomPanelData();
    boolean newIsUpgraded = IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE);
    // IProfile profile = data.getProfile();
    // && (IMUtil.isUpgradeFromVersion(data.getAllJobs(), data.getAgent(), profile, Constants.VERSION_105) || IMUtil.isUpgradeFromVersion(
    // data.getAllJobs(), data.getAgent(), profile, Constants.VERSION_106));
    if (isUpgraded != newIsUpgraded)
    {
      isUpgraded = newIsUpgraded;
      updateUI();
      verifyComplete(false, false);
    }

    PanelStatusManagementService.add(this);
    return false;
  }

  private void updateUI()
  {
    for (int i = 0; i < noneUpgradePanels.size(); i++)
    {
      GridData data = (GridData) noneUpgradePanels.get(i).getLayoutData();
      data.exclude = isUpgraded;
      noneUpgradePanels.get(i).setVisible(!isUpgraded);
    }
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

  public void dispose()
  {
    if (this.canvas != null)
    {
      this.canvas.stopAnimationTimer();
      this.canvas.dispose();
    }
    super.dispose();
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
      String dbServerUrl = profile.getOfferingUserData(Constants.DB_SERVER_HOST_URL, OFFERING_ID);
      if (dbServerUrl != null && dbServerUrl.trim().length() > 0)
      {
        this.dbserverText.setText(dbServerUrl.trim());
      }

      String name = profile.getOfferingUserData(Constants.DB_USER_NAME, OFFERING_ID);
      if (name != null && name.trim().length() > 0)
      {
        this.userName.setText(name.trim());
      }

      String dbPassword = profile.getOfferingUserData(Constants.DB_PASSWORD, OFFERING_ID);
      if (dbPassword != null && dbPassword.trim().length() > 0)
      {
        dbPassword = EncryptionUtils.decrypt(dbPassword);
        this.password.setText(dbPassword.trim());
      }

      String dbProductName = profile.getOfferingUserData(Constants.DB_PRODUCT_NAME, OFFERING_ID);
      if (dbProductName != null && dbProductName.trim().length() > 0)
      {
        for (int i = 0; i < dbtypes.length; i++)
        {
          if (dbtypes[i].equalsIgnoreCase(dbProductName))
          {
            this.productCombo.select(i);
            dbChangedAction();
            break;
          }
        }
      }

      String docsDatabase = profile.getOfferingUserData(Constants.DB_DOCS_DATABASE, OFFERING_ID);
      if (docsDatabase != null && docsDatabase.trim().length() > 0)
      {
        this.dbnameText.setText(docsDatabase.trim());
      }

      String dbJDBCPath = profile.getOfferingUserData(Constants.DB_JDBC_PATH, OFFERING_ID);
      if (dbJDBCPath != null && dbJDBCPath.trim().length() > 0)
      {
        this.jdbcpathText.setText(dbJDBCPath.trim());
      }

      String dbServerPort = profile.getOfferingUserData(Constants.DB_SERVER_PORT, OFFERING_ID);
      if (dbServerPort != null && dbServerPort.trim().length() > 0)
      {
        this.dbportText.setText(dbServerPort.trim());
      }

      this.userName.setFocus();
      verifyComplete(false, false);
    }
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

  protected void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    if (noneUpgradePanels == null)
    {
      noneUpgradePanels = new ArrayList<Composite>();
    }
    if (upgradePanels == null)
    {
      upgradePanels = new ArrayList<Composite>();
    }

    Composite container = createPanel(parent, false);
    //this.createBoldLabel(parent, Messages.getString("DatabasePanel_GENERAL_INFO"), true, 1); //$NON-NLS-1$
    Label labelForText = this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_SERVER"), false, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_HOSTNAME"), false, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_HOSTNAME_EXAMPLE"), false, true, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.dbserverText = this.createText(container, "", "", 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.dbserverText);

    container = createPanel(parent, true);
    //this.createBoldLabel(parent, Messages.getString("DatabasePanel_DB_CREDENTIAL"), false, 1); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_ADMIN_CREDENTIAL"), true, false, 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.userName = this.createText(container, "", "", 200); //$NON-NLS-1$
    this.userName.setMessage(Messages.getString("DatabasePanel_USERNAME")); //$NON-NLS-1$
    this.userName.getAccessible().addAccessibleListener(new AccessibleAdapter()
    {
      @Override
      public void getName(AccessibleEvent e)
      {
        e.result = Messages.getString("DatabasePanel_USERNAME_JAWSTIP");
      }
    });

    this.password = this.createPassword(container, "", 200); //$NON-NLS-1$
    this.password.setMessage(Messages.getString("DatabasePanel_PASSWORD")); //$NON-NLS-1$
    this.password.getAccessible().addAccessibleListener(new AccessibleAdapter()
    {
      @Override
      public void getName(AccessibleEvent e)
      {
        e.result = Messages.getString("DatabasePanel_PASSWORD_JAWSTIP");
      }
    });

    container = createPanel(parent, false);
    labelForText = this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_PRODUCT"), true, false, 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.productCombo = this.createCombo(container, ""); //$NON-NLS-1$
    this.productCombo.setItems(dbtypes);
    this.productCombo.select(0);
    PanelUtil.registerAccRelation(labelForText, this.productCombo);

    labelForText = this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_NAME"), true, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.nameSidLabel = labelForText;
    this.descLabel = this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_NAME_DESC"), false, true, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_NAME_DESC2"), false, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.dbnameText = this.createText(container, "", "", 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.dbnameText);

    labelForText = this.createPlainLabel(container, Messages.getString("DatabasePanel_JDBC_PATH"), true, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_JDBC_PATH_DESC"), false, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_JDBC_PATH_EXAMPLE"), false, true, 0, VINDENT_DEFAULT); //$NON-NLS-1$    
    this.jdbcpathText = this.createText(container, "", Messages.getString("DatabasePanel_JDBC_PATH_TIP"), 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.jdbcpathText);

    this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_PORT"), true, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_PORT_DESC"), false, false, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    // PanelUtil.createComposedLabel(parent, toolkit,
    //        Messages.getString("DatabasePanel_DB_TYPE_DB2"), Messages.getString("DatabasePanel_DB2_DEFAULT_PORT")); //$NON-NLS-1$ //$NON-NLS-2$
    //    PanelUtil.createComposedLabel(parent, toolkit, Messages.getString("DatabasePanel_DB_PORT_ORACLE"), //$NON-NLS-1$
    //        Messages.getString("DatabasePanel_ORACLE_DEFAULT_PORT")); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("DatabasePanel_DB_PORT_DESC2"), false, true, 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.dbportText = this.createText(container, "", "", 150); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.dbportText);

    final Composite comp = createPanel(parent);
    //this.validateBtn = this.createButton(comp, Messages.getString("Message_Validate$label")); //$NON-NLS-1$
    canvas = PanelUtil.createLoadingImg(comp);
    canvas.setVisible(false);

    this.productCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        dbChangedAction();
        verifyComplete(false, false);
      }
    });
    /*
     * this.validateBtn.addSelectionListener(new SelectionAdapter() { public void widgetSelected(SelectionEvent e) {
     * validateBtn.setEnabled(false); canvas.setVisible(true); Job vjob = new Job("Verify Database Connection") {//$NON-NLS-1$ protected
     * IStatus run(IProgressMonitor monitor) { // validate here boolean isConnected = false; try { isConnected =
     * IMUtil.isDBConnected(dataMap); } catch (Exception e) { logger.log(ILogLevel.ERROR,
     * "Can not validate the database connection successfully", e); // NON-NLS-1 } final boolean connected = isConnected;
     * Display.getDefault().asyncExec(new Runnable() { public void run() { if (connected) { validateBtn.setEnabled(false);
     * canvas.setVisible(false); setErrorMessage(null); setMessage(Messages.getString("DatabasePanel_DB_VALIDATE_SUCCESS"), 0);
     * //$NON-NLS-1$ setPageComplete(true); } else { validateBtn.setEnabled(false); canvas.setVisible(false);
     * setErrorMessage(Messages.getString("DatabasePanel_DB_VALIDATE_ERROR")); //$NON-NLS-1$ setPageComplete(false); } } }); return
     * Status.OK_STATUS; }
     * 
     * public boolean shouldSchedule() { return !validateBtn.isDisposed(); }
     * 
     * public boolean shouldRun() { return !validateBtn.isDisposed(); } }; vjob.schedule(); } });
     */
  }

  private void dbChangedAction()
  {
    if (productCombo.getSelectionIndex() == 0)
    {
      nameSidLabel.setText(Messages.getString("DatabasePanel_DB_NAME"));
      descLabel.setText(Messages.getString("DatabasePanel_DB_NAME_DESC"));
    }
    else if (productCombo.getSelectionIndex() == 2)
    {
      nameSidLabel.setText(Messages.getString("DatabasePanel_DB_NAME"));
      descLabel.setText(Messages.getString("DatabasePanel_DB_SQLSERVER_NAME_DESC"));

    }
    else
    {
      nameSidLabel.setText(Messages.getString("DatabasePanel_DB_SID"));
      descLabel.setText(Messages.getString("DatabasePanel_DB_SID_DESC"));
    }
    nameSidLabel.getParent().layout(true);
  }

  /*
   * @type if type equals 0, it is plain font style, else if type equals 1, it is bold font style
   */
  private Label createPlainLabel(Composite parent, String message, boolean keepSpace, boolean isExample, int fontHeight, int vIndent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = toolkit.createLabel(parent, message, SWT.WRAP);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = 400;
    if (keepSpace)
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

  // private void createBoldLabel(Composite parent, String message, boolean keepSpace, int fontHeight)
  // {
  // FormToolkit toolkit = this.getFormToolkit();
  // Label label = PanelUtil.createBoldLabel(parent, toolkit, message);
  // GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
  // if (keepSpace)
  // {
  // gd.verticalIndent = 20;
  // }
  // label.setLayoutData(gd);
  // PanelUtil.setFont(label, fontHeight);
  // }
  private Composite createPanel(Composite parent, boolean upgraded)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    data.exclude = false;
    if (upgraded)
    {
      upgradePanels.add(panel);
    }
    else
    {
      noneUpgradePanels.add(panel);
    }
    panel.setLayoutData(data);
    return panel;
  }

  private Text createPassword(Composite parent, String tooltip, int widthHint)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, "", SWT.SINGLE | SWT.BORDER | SWT.PASSWORD); //$NON-NLS-1$
    if (tooltip != null && !"".equals(tooltip))
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

  private Text createText(Composite parent, String defaultValue, String tooltip, int widthHint)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, SWT.SINGLE | SWT.BORDER);
    if (tooltip != null && !"".equals(tooltip))
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

  // private Button createButton(Composite parent, String text)
  // {
  // FormToolkit toolkit = this.getFormToolkit();
  // Button validateBtn = toolkit.createButton(parent, text, SWT.HORIZONTAL);
  // GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, false, false, 1, 1);
  // gd.widthHint = 120;
  // validateBtn.setLayoutData(gd);
  // validateBtn.setEnabled(false);
  // return validateBtn;
  // }
  //
  private Composite createPanel(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    data.verticalIndent = VINDENT_DEFAULT;
    panel.setLayoutData(data);
    return panel;
  }

  private void resetPanelTag()
  {
    ICustomPanelData data = this.getCustomPanelData();
    IProfile profile = data.getProfile();
    profile.setOfferingUserData(Constants.DB_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
    profile.setUserData(Constants.DB_PANEL, Constants.PANEL_STATUS_FAILED);
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
    this.resetPanelTag();

    String serverHost = this.dbserverText.getText().trim();
    dataMap.put(Constants.DB_SERVER_HOST_URL, serverHost);

    String nameValue = this.userName.getText().trim();
    dataMap.put(Constants.DB_USER_NAME, nameValue);

    String dbPassword = this.password.getText().trim();
    dbPassword = EncryptionUtils.encrypt(dbPassword);
    dataMap.put(Constants.DB_PASSWORD, dbPassword);

    String prodDBName = this.productCombo.getText().trim();
    dataMap.put(Constants.DB_PRODUCT_NAME, prodDBName);

    String dbName = this.dbnameText.getText().trim();
    dataMap.put(Constants.DB_DOCS_DATABASE, dbName);

    String jdbcPath = this.jdbcpathText.getText().trim();
    dataMap.put(Constants.DB_JDBC_PATH, jdbcPath);

    String dbServerPort = this.dbportText.getText().trim();
    dataMap.put(Constants.DB_SERVER_PORT, dbServerPort);

    dataMap.put(Constants.DB_IS_DOCS_UPGRADED, (isUpgraded ? "true" : "false"));

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();
    IProfile profile = data.getProfile();
    IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    IStatus dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, dataMap);

    if (dataJobsStatus.isOK())
    {
      // *** Save the user's input in the profile
      profile.setOfferingUserData(Constants.DB_SERVER_HOST_URL, serverHost, OFFERING_ID);
      profile.setOfferingUserData(Constants.DB_USER_NAME, nameValue, OFFERING_ID);
      profile.setOfferingUserData(Constants.DB_PASSWORD, dbPassword, OFFERING_ID);
      profile.setOfferingUserData(Constants.DB_PRODUCT_NAME, prodDBName, OFFERING_ID);
      profile.setOfferingUserData(Constants.DB_DOCS_DATABASE, dbName, OFFERING_ID);
      profile.setOfferingUserData(Constants.DB_JDBC_PATH, jdbcPath, OFFERING_ID);
      profile.setOfferingUserData(Constants.DB_SERVER_PORT, dbServerPort, OFFERING_ID);

      profile.setOfferingUserData(Constants.DB_PANEL, Constants.PANEL_STATUS_OK, OFFERING_ID);

      profile.setUserData(Constants.DB_SERVER_HOST_URL, serverHost);
      profile.setUserData(Constants.DB_USER_NAME, nameValue);
      profile.setUserData(Constants.DB_PASSWORD, dbPassword);
      profile.setUserData(Constants.DB_PRODUCT_NAME, prodDBName);
      profile.setUserData(Constants.DB_DOCS_DATABASE, dbName);
      profile.setUserData(Constants.DB_JDBC_PATH, jdbcPath);
      profile.setUserData(Constants.DB_SERVER_PORT, dbServerPort);

      profile.setUserData(Constants.DB_PANEL, Constants.PANEL_STATUS_OK);
      //setMessage("", 0); //$NON-NLS-1$
      // setErrorMessage(Messages.getString("DatabasePanel_DB_VALIDATE_INFO"));
      canvas.setVisible(false);
      setErrorMessage(null);
      setMessage(Messages.getString("DatabasePanel_DB_SIMPLE_VALIDATE_INFO"), 0); //$NON-NLS-1$

      if (isPageComplete() && PanelStatusManagementService.getInstance().getCompletedStatus())
        PanelStatusManagementService.getInstance().force();
      else
      {
        setPageComplete(true);
        PanelStatusManagementService.statusNotify();
      }
      // this.validateBtn.setEnabled(true);
    }
    else
    {
      profile.setOfferingUserData(Constants.DB_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
      profile.setUserData(Constants.DB_PANEL, Constants.PANEL_STATUS_FAILED);
      setErrorMessage(dataJobsStatus.getMessage());
      setPageComplete(false);
      PanelStatusManagementService.statusNotify();
    }
  }

  private void cleanProfileData()
  {
    IProfile profile = getCustomPanelData().getProfile();
    if (profile == null)
      return;

    if (profile.getOfferingUserData(Constants.DB_SERVER_HOST_URL, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_SERVER_HOST_URL))).append(',').append(OFFERING_ID).toString());

    if (profile.getOfferingUserData(Constants.DB_USER_NAME, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_USER_NAME))).append(',').append(OFFERING_ID).toString());
    if (profile.getOfferingUserData(Constants.DB_PASSWORD, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_PASSWORD))).append(',').append(OFFERING_ID).toString());

    if (profile.getOfferingUserData(Constants.DB_PRODUCT_NAME, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_PRODUCT_NAME))).append(',').append(OFFERING_ID).toString());

    if (profile.getOfferingUserData(Constants.DB_DOCS_DATABASE, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_DOCS_DATABASE))).append(',').append(OFFERING_ID).toString());

    if (profile.getOfferingUserData(Constants.DB_JDBC_PATH, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_JDBC_PATH))).append(',').append(OFFERING_ID).toString());

    if (profile.getOfferingUserData(Constants.DB_SERVER_PORT, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_SERVER_PORT))).append(',').append(OFFERING_ID).toString());

    if (profile.getOfferingUserData(Constants.DB_PANEL, OFFERING_ID) != null)
      profile.removeUserData((new StringBuilder(String.valueOf(Constants.DB_PANEL))).append(',').append(OFFERING_ID).toString());
  }

}
