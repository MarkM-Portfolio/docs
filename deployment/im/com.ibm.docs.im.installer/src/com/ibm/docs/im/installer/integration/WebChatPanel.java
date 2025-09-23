/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.integration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
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
import com.ibm.docs.im.installer.common.ui.WASServiceListener;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;
import com.ibm.docs.im.installer.util.WasConfigService;

public class WebChatPanel extends AbstractCustomConfigPanel implements WASServiceListener
{
  // private static final ILogger logger =
  // IMLogger.getLogger(WebChatPanel.class.getCanonicalName());

  private static final String DEFAULT_ATTEMPTS_TIMES = "20"; // NON-NLS-1

  private static final String DEFAULT_ATTEMPTS_DURATION = "500"; // NON-NLS-1

  private String[] cmTypes = new String[] { "Connections Chat and Meetings", "Stand-alone Sametime" };// NON-NLS-1 // NON-NLS-2

  private Combo installChoiceCombo;

  private Combo cmTypeCombo;

  private Text serverDomainText;

  // private Text connConfigLocText;

  private Text connAttemptsText;

  private Text connAttemptsTimeText;

  private Text stServerURLText;

  private Text sslServerURLText;

  private Hyperlink advancedLink;

  private Composite topContainer;

  private Composite basicSTContainer;

  // private Composite connectionsComp;

  private Composite standaloneComp;

  private ArrayList<Composite> advancePanels;

  private boolean advancedSettingsVisible = false;

  private boolean connInstalled = true;

  private boolean stInstalled = false;

  private boolean docsInstalled = true;

  enum STType {
    LCST, STSD, LCSTSD
  };

  public WebChatPanel()
  {
    super(Messages.getString("WebChatPanel.NODE")); //$NON-NLS-1$
    WasConfigService.register(this);
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
    boolean isUpgraded = IMUtil.isDeployType(this.getCustomPanelData().getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE);
    if (isUpgraded)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }
    boolean newConnInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_CONNECTIONS_ID)
        || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_CCM_ID)
        || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_IC_ECM_ID)
        || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_IC_CCM_ECM_ID);
    boolean newStInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_STANDALONE_ST_ID);
    boolean newDocsInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);

    if (connInstalled != newConnInstalled || stInstalled != newStInstalled || docsInstalled != newDocsInstalled)
    {
      connInstalled = newConnInstalled;
      stInstalled = newStInstalled;
      docsInstalled = newDocsInstalled;
      this.updateUI();
    }

    if (newConnInstalled && newDocsInstalled)
    {
      // clean STSD, enable LCST
      cleanProfileData(STType.STSD);
    }
    else if (newStInstalled && newDocsInstalled)
    {
      // clean LCST, enable STSD
      cleanProfileData(STType.LCST);
    }
    else if ((!newConnInstalled && !newStInstalled && newDocsInstalled) || !newDocsInstalled)
    {
      cleanProfileData(STType.LCSTSD);
    }

    if (!((newConnInstalled && newDocsInstalled) || (newStInstalled && newDocsInstalled)))
    {
      PanelStatusManagementService.remove(this);
      return true;
    }

    PanelStatusManagementService.add(this);
    return false;
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
      boolean showAdvanced = false;

      String installValue = profile.getOfferingUserData(Constants.WC_INSTALL_CHOICE, OFFERING_ID);
      if (installValue != null && installValue.trim().length() > 0)
      {
        if (Constants.COMBO_OPTION_TRUE.equalsIgnoreCase(installValue))
        {
          // this.installChoiceCombo.select(0);
          showAdvanced = true;
        }
        // else
        // {
        // this.installChoiceCombo.select(1);
        // }
      }

      String cmInstalled = profile.getOfferingUserData(Constants.WC_INSTALL_TYPE_CM, OFFERING_ID);
      if (cmInstalled != null && cmInstalled.trim().length() > 0)
      {
        if (Constants.COMBO_OPTION_FALSE.equalsIgnoreCase(cmInstalled))
          this.cmTypeCombo.select(1);
        else
          this.cmTypeCombo.select(0);
      }

      String serverDomain = profile.getOfferingUserData(Constants.WC_SERVER_DOMAIN, OFFERING_ID);
      if (serverDomain != null && serverDomain.trim().length() > 0)
      {
        this.serverDomainText.setText(serverDomain.trim());
      }

      // String connConfigLoc =
      // profile.getOfferingUserData(Constants.WC_CONN_CONFIG_LOCATION,
      // OFFERING_ID);
      // if (connConfigLoc != null && connConfigLoc.trim().length() > 0)
      // {
      // this.connConfigLocText.setText(connConfigLoc.trim());
      // }

      String connAttemps = profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS, OFFERING_ID);
      if (connAttemps != null && connAttemps.trim().length() > 0)
      {
        this.connAttemptsText.setText(connAttemps.trim());
      }

      String connAttemptsTime = profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS_TIME, OFFERING_ID);
      if (connAttemptsTime != null && connAttemptsTime.trim().length() > 0)
      {
        this.connAttemptsTimeText.setText(connAttemptsTime.trim());
      }

      String stServerUrl = profile.getOfferingUserData(Constants.WC_ST_SERVER_URL, OFFERING_ID);
      if (stServerUrl != null && stServerUrl.trim().length() > 0)
      {
        this.stServerURLText.setText(stServerUrl.trim());
      }

      String sslServerUrl = profile.getOfferingUserData(Constants.WC_SSL_SERVER_URL, OFFERING_ID);
      if (sslServerUrl != null && sslServerUrl.trim().length() > 0)
      {
        this.sslServerURLText.setText(sslServerUrl.trim());
      }
      if (showAdvanced)
      {
        selectedHandler(true);
      }
      else
      {
        verifyComplete();
      }
    }
  }

  private void updateUI()
  {
    // update Connections configuration (.xml)
    // if (this.connConfigLocText != null)
    // {
    // TODO
    // }

    if (connInstalled)
    {
      if (cmTypeCombo.getSelectionIndex() != 0)
      {
        cmTypeCombo.select(0);
        this.customLayout();
      }
      return;
    }
    if (stInstalled)
    {
      cmTypeCombo.select(1);
      this.customLayout();
    }
  }

  @Override
  public void createControl(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    topContainer = toolkit.createComposite(parent);
    topContainer.setLayout(new GridLayout(1, false));
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);
  }

  protected void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    if (advancePanels == null)
    {
      advancePanels = new ArrayList<Composite>();
    }
    Composite container = createPanel(parent, false);
    this.createAdvancedLink(container, toolkit);
    
       
    String connAttemptsTime = DEFAULT_ATTEMPTS_DURATION;
    String connAttemps = DEFAULT_ATTEMPTS_TIMES;
    ICustomPanelData data = this.getCustomPanelData();    
    IProfile profile = data.getProfile();    
    if( profile != null )
    {
      connAttemptsTime = profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS_TIME, OFFERING_ID);
      if (connAttemptsTime == null || connAttemptsTime.trim().length() == 0)
      {
        connAttemptsTime = DEFAULT_ATTEMPTS_DURATION;
      }  
      else
      {
        connAttemptsTime = connAttemptsTime.trim();
      }
      
      connAttemps = profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS, OFFERING_ID);
      if (connAttemps == null || connAttemps.trim().length() == 0)
      {
        connAttemps = DEFAULT_ATTEMPTS_TIMES;
      }
      else
      {
        connAttemps = connAttemps.trim();
      }
            
    }    

    //this.createBoldLabel(container, Messages.getString("WebChatPanel.CM_INTEGRATION"), NONE_VINDENT, 1); //$NON-NLS-1$
    // Label labelForText = this
    //        .createPlainLabel(container, Messages.getString("WebChatPanel.CM_INTEGRATION_DESC"), false, VINDENT_DEFAULT, 0); //$NON-NLS-1$
    this.installChoiceCombo = this.createCombo(container, "", 200); //$NON-NLS-1$
    this.installChoiceCombo.setItems(new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") });
    this.installChoiceCombo.select(0);
    this.installChoiceCombo.setVisible(false);

    this.basicSTContainer = createPanel(parent, false);
    // labelForText = this.createPlainLabel(this.basicSTContainer,
    //        Messages.getString("WebChatPanel.CM_DEPLOYED_TYPE"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.cmTypeCombo = this.createCombo(this.basicSTContainer, "", 0); //$NON-NLS-1$
    this.cmTypeCombo.setItems(cmTypes);
    this.cmTypeCombo.select(0);
    this.cmTypeCombo.setVisible(false);

    Label labelForText = this.createPlainLabel(this.basicSTContainer,
        Messages.getString("WebChatPanel.CM_SERVER"), false, VINDENT_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(this.basicSTContainer, Messages.getString("WebChatPanel.CM_SERVER_DESC"), false, NONE_VINDENT, 0);//$NON-NLS-1$
    this.createPlainLabel(this.basicSTContainer, Messages.getString("WebChatPanel.CM_SERVER_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.serverDomainText = this.createText(this.basicSTContainer, "", "", 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.serverDomainText);

    this.basicSTContainer.setVisible(true);

    // this.connectionsComp = createPanel(parent, true);
    // labelForText = this.createPlainLabel(connectionsComp,
    //    Messages.getString("WebChatPanel.LOC_CONN_CONFIG"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    //this.createPlainLabel(connectionsComp, Messages.getString("WebChatPanel.LOC_CONN_CONFIG_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    //this.connConfigLocText = this.createText(connectionsComp, "", "", 400); //$NON-NLS-1$
    // PanelUtil.registerAccRelation(labelForText, this.connConfigLocText);

    this.standaloneComp = createPanel(parent, true);
    labelForText = this.createPlainLabel(standaloneComp, Messages.getString("WebChatPanel.ST_SERVER"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    //this.createPlainLabel(standaloneComp, Messages.getString("WebChatPanel.ST_SERVER_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(standaloneComp, Messages.getString("WebChatPanel.ST_SERVER_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.stServerURLText = this.createText(standaloneComp, "", "", 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.stServerURLText);

    labelForText = this.createPlainLabel(standaloneComp, Messages.getString("WebChatPanel.SSL_SERVER"), false, VINDENT_DEFAULT, 0); //$NON-NLS-1$
    //this.createPlainLabel(standaloneComp, Messages.getString("WebChatPanel.SSL_SERVER_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.createPlainLabel(standaloneComp, Messages.getString("WebChatPanel.SSL_SERVER_EXAMPLE"), true, NONE_VINDENT, 0); //$NON-NLS-1$
    this.sslServerURLText = this.createText(standaloneComp, "", "", 400); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.sslServerURLText);

    container = createPanel(parent, true);
    labelForText = this.createPlainLabel(container, Messages.getString("WebChatPanel.ATTEMPTS_NUM"), false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
    this.createPlainLabel(container, Messages.getString("WebChatPanel.ATTEMPTES_NUM_DESC"), false, NONE_VINDENT, 0); //$NON-NLS-1$
    this.connAttemptsText = this.createText(container, connAttemps, "", 86); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.connAttemptsText);
    
    labelForText = this.createPlainLabel(container, Messages.getString("WebChatPanel.ATTEMPTS_TIME"), false, VINDENT_DEFAULT, 0); //$NON-NLS-1$
    this.connAttemptsTimeText = this.createComposteFieldLabel(container, connAttemptsTime,
        "", 86, Messages.getString("WebChatPanel.ATTEMPTS_TIME_UNIT")); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, this.connAttemptsTimeText);

    // this.installChoiceCombo.addSelectionListener(new SelectionAdapter()
    // {
    // public void widgetSelected(SelectionEvent e)
    // {
    // boolean visible = (installChoiceCombo.getSelectionIndex() == 0);
    // selectedHandler(visible);
    // }
    // });
    // this.cmTypeCombo.addSelectionListener(new SelectionAdapter()
    // {
    // public void widgetSelected(SelectionEvent e)
    // {
    // customLayout();
    // verifyComplete();
    // }
    // });

    this.customLayout();
  }

  private void selectedHandler(boolean visible)
  {
    if (advancedLink.getVisible() == visible)
      return;

    advancedLink.setVisible(visible);
    basicSTContainer.setVisible(visible);
    if (visible)
    {
      if (advancedSettingsVisible)
      {
        layout(true);
      }
      else
      {
        layout(false);
      }
    }
    else
    {
      layout(false);
    }
    verifyComplete();
  }

  private void customLayout()
  {
    boolean installed = (installChoiceCombo.getSelectionIndex() == 0);
    boolean isConn = (cmTypeCombo.getSelectionIndex() == 0);
    GridData stData = (GridData) standaloneComp.getLayoutData();
    // GridData connData = (GridData) connectionsComp.getLayoutData();
    if (installed)
    {
      if (isConn)
      {
        stData.exclude = true;
        standaloneComp.setVisible(false);
        // connData.exclude = false;
        // connectionsComp.setVisible(true);
        // connConfigLocText.setFocus();
      }
      else
      {
        stData.exclude = false;
        standaloneComp.setVisible(true);
        // connData.exclude = true;
        // connectionsComp.setVisible(false);
        stServerURLText.setFocus();
      }

    }
    else
    {
      stData.exclude = true;
      standaloneComp.setVisible(false);
      // connData.exclude = true;
      // connectionsComp.setVisible(false);
    }
    resize();
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

  private void createAdvancedLink(final Composite parent, FormToolkit toolkit)
  {
    advancedLink = toolkit.createHyperlink(parent, Messages.getString("MSG_CONVERSION_ADVANCED_SETING"), SWT.WRAP); //$NON-NLS-1$
    GridData gd = new GridData(GridData.END, GridData.FILL, true, false, 2, 1);
    advancedLink.setLayoutData(gd);
    advancedLink.setVisible(true);
    advancedLink.addHyperlinkListener(new HyperlinkAdapter()
    {
      public void linkActivated(HyperlinkEvent e)
      {
        advancedLink.setText(!advancedSettingsVisible ? Messages.getString("MSG_CONVERSION_BASIC_SETING") : Messages
            .getString("MSG_CONVERSION_ADVANCED_SETING"));
        advancedLink.getParent().layout(true);
        layout();
        advancedSettingsVisible = !advancedSettingsVisible;
        verifyComplete();
      }
    });
  }

  private void layout(boolean visible)
  {
    for (int i = 0; i < advancePanels.size(); i++)
    {
      GridData data = (GridData) advancePanels.get(i).getLayoutData();
      data.exclude = !visible;
      advancePanels.get(i).setVisible(visible);
    }
    this.customLayout();
  }

  private void layout()
  {
    for (int i = 0; i < advancePanels.size(); i++)
    {
      GridData data = (GridData) advancePanels.get(i).getLayoutData();
      data.exclude = advancedSettingsVisible;
      advancePanels.get(i).setVisible(!advancedSettingsVisible);
    }
    this.customLayout();
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

  // private Label createBoldLabel(Composite parent, String message, int
  // vIndent, int fontHeight)
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

  private Text createComposteFieldLabel(Composite parent, String defaultValue, String tooltip, int widthHint, String labelValue)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, SWT.SINGLE | SWT.BORDER); //$NON-NLS-1$
    widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, false, false, 1, 1);
    gd.widthHint = widthHint;
    widget.setLayoutData(gd);
    widget.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete();
      }
    });
    Label label = toolkit.createLabel(parent, labelValue, SWT.WRAP);
    // Must create a new instance of GridData
    gd = new GridData(SWT.FILL, SWT.FILL, false, false, 1, 1);
    label.setLayoutData(gd);
    return widget;
  }

  private Text createText(Composite parent, String defaultValue, String tooltip, int widthHint)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, SWT.SINGLE | SWT.BORDER); //$NON-NLS-1$
    if (tooltip != null && !"".equals(tooltip))
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = widthHint;
    widget.setLayoutData(gd);
    // widget.addFocusListener(new FocusListener()
    // {
    // @Override
    // public void focusGained(FocusEvent arg0)
    // {
    //
    // }
    //
    // @Override
    // public void focusLost(FocusEvent arg0)
    // {
    // verifyComplete(false, false);
    // }
    // });
    widget.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete();
      }
    });
    return widget;
  }

  private Combo createCombo(Composite parent, String tooltip, int widthHint)
  {
    Combo widget = new Combo(parent, SWT.SINGLE | SWT.BORDER | SWT.READ_ONLY);
    if (tooltip != null && !"".equals(tooltip))
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    if (widthHint > 0)
    { // Don't set widthHint value
      gd.widthHint = widthHint;
    }
    gd.exclude = true;
    widget.setLayoutData(gd);
    return widget;
  }

  /**
   * Validate user input here.
   * 
   * This private method is responsible for performing the validation of the widgets on this panel and, either, displaying an error message
   * or setting the page to complete. This method should be called by a widget's listener to reevaluate the completeness of the page when a
   * change is made to the widget's value.
   */
  private void verifyComplete()
  {
    Map<String, String> map = new HashMap<String, String>();

    String installValue = Constants.COMBO_OPTION_FALSE;
    boolean bConnInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_CONNECTIONS_ID)
        || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_CCM_ID)
        || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_IC_ECM_ID)
        || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_IC_CCM_ECM_ID);
    boolean newStInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.INTEGRATION_WITH_STANDALONE_ST_ID);
    if (bConnInstalled || newStInstalled)
    {
      installValue = Constants.COMBO_OPTION_TRUE;
      map.put(Constants.WC_INSTALL_CHOICE, Constants.COMBO_OPTION_TRUE);
    }
    else
    {
      map.put(Constants.WC_INSTALL_CHOICE, Constants.COMBO_OPTION_FALSE);
    }

    String installType = Constants.ST_CONNECTIONS_CM;
    switch (cmTypeCombo.getSelectionIndex())
      {
        case 0 :
          map.put(Constants.WC_INSTALL_TYPE, Constants.ST_CONNECTIONS_CM);
          break;
        case 1 :
          installType = Constants.ST_STANDALONE_CM;
          map.put(Constants.WC_INSTALL_TYPE, Constants.ST_STANDALONE_CM);
          break;
      }

    String serverDomain = this.serverDomainText.getText().trim();
    map.put(Constants.WC_SERVER_DOMAIN, serverDomain);

    // String connConfigLoc = this.connConfigLocText.getText().trim();
    // map.put(Constants.WC_CONN_CONFIG_LOCATION, connConfigLoc);

    String connAttemps = this.connAttemptsText.getText().trim();
    map.put(Constants.WC_CONN_ATTEMPTS, connAttemps);

    String connAttemptsTime = this.connAttemptsTimeText.getText().trim();
    map.put(Constants.WC_CONN_ATTEMPTS_TIME, connAttemptsTime);

    String stServerUrl = this.stServerURLText.getText().trim();
    map.put(Constants.WC_ST_SERVER_URL, stServerUrl);

    String sslServerUrl = this.sslServerURLText.getText().trim();
    map.put(Constants.WC_SSL_SERVER_URL, sslServerUrl);

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    IStatus dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);

    if (dataJobsStatus.isOK())
    {
      // *** Save the user's input in the profile
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.WC_INSTALL_CHOICE, installValue, OFFERING_ID);

      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE, installType, OFFERING_ID);

      if (Constants.ST_CONNECTIONS_CM.equals(installType))
      {
        profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_CM, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
        profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_ST, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
      }
      else if (Constants.ST_STANDALONE_CM.equals(installType))
      {
        profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_CM, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
        profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_ST, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
      }
      profile.setOfferingUserData(Constants.WC_SERVER_DOMAIN, serverDomain, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_CONN_ATTEMPTS, connAttemps, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_CONN_ATTEMPTS_TIME, connAttemptsTime, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_ST_SERVER_URL, stServerUrl, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_SSL_SERVER_URL, sslServerUrl, OFFERING_ID);

      profile.setOfferingUserData(Constants.WC_USE_INITIAL_NAME, Constants.COMBO_OPTION_FALSE, OFFERING_ID);

      profile.setUserData(Constants.WC_INSTALL_CHOICE, installValue);
      profile.setUserData(Constants.WC_INSTALL_TYPE, installType);
      profile.setUserData(Constants.WC_SERVER_DOMAIN, serverDomain);

      profile.setUserData(Constants.WC_CONN_ATTEMPTS, connAttemps);
      profile.setUserData(Constants.WC_CONN_ATTEMPTS_TIME, connAttemptsTime);
      profile.setUserData(Constants.WC_ST_SERVER_URL, stServerUrl);
      profile.setUserData(Constants.WC_SSL_SERVER_URL, sslServerUrl);
      // String status =
      // profile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL,
      // OFFERING_ID);
      // if (status != null &&
      // status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
      // String icCFGXML = null;
      // if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_INSTALL)
      // || (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_MODIFY) && IMUtil.isFeatureAdded(data.getAllJobs(),
      // data.getAgent(), data.getProfile(), Constants.DOCS_ID)))
      // {
      // String status = profile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, OFFERING_ID);
      // if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
      // {
      // String nodesInfo = profile.getOfferingUserData(Constants.NODE_HOST_LIST, OFFERING_ID);
      // String localNodeHostName = profile.getOfferingUserData(Constants.LOCAL_HOST_NAME, OFFERING_ID);
      // if (nodesInfo != null && nodesInfo.trim().length() > 0 && localNodeHostName != null && localNodeHostName.trim().length() > 0)
      // {
      // icCFGXML = getICXml(nodesInfo, localNodeHostName, profile);
      // }
      // }
      // }
      // else if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE))
      // {
      // if ((IMUtil.isUpgradeFromVersion(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.VERSION_105) || IMUtil
      // .isUpgradeFromVersion(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.VERSION_106)))
      // {
      // String status = profile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, OFFERING_ID);
      // if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
      // {
      // String nodesInfo = profile.getOfferingUserData(Constants.NODE_HOST_LIST, OFFERING_ID);
      // String localNodeHostName = profile.getOfferingUserData(Constants.LOCAL_HOST_NAME, OFFERING_ID);
      // if (nodesInfo != null && nodesInfo.trim().length() > 0 && localNodeHostName != null && localNodeHostName.trim().length() > 0)
      // {
      // icCFGXML = getICXml(nodesInfo, localNodeHostName, profile);
      // }
      // }
      // }
      // }
      //
      // if (icCFGXML != null)
      // {
      // profile.setOfferingUserData(Constants.WC_CONN_CONFIG_LOCATION, icCFGXML, OFFERING_ID);
      // profile.setUserData(Constants.WC_CONN_CONFIG_LOCATION, icCFGXML);
      // }
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

  public String getICXml(String nodeInfoStr, String hostname, IProfile profile)
  {
    if (nodeInfoStr == null || hostname == null || profile == null)
      return null;

    String icCFGXML = null;
    if (nodeInfoStr != null && nodeInfoStr.trim().length() > 0)
    {

      Vector<String> nodesStr = IMUtil.parseListString(nodeInfoStr, Util.LIST_SEPRATOR);
      for (int i = 0; i < nodesStr.size(); i++)
      {
        String nodeStr = nodesStr.get(i);
        Vector<String> nodeInfoV = IMUtil.parseListString(nodeStr, Constants.SEPARATE_SUB_SUB_CHARS);
        // [hostname,ostype,nodetype,nodename,USER_INSTALL_ROOT,WAS_INSTALL_ROOT]
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        // The profile path is null for webserver
        if (nodeInfoArr[0].equalsIgnoreCase(hostname) && !nodeInfoArr[2].equalsIgnoreCase(Constants.WEB_SERVER))
        {
          icCFGXML = nodeInfoArr[4];
          if (nodeInfoArr[1].equalsIgnoreCase(Constants.WINDOWS))
          {
            icCFGXML = icCFGXML + "\\config\\cells\\" + profile.getOfferingUserData(Constants.CELL_NAME, OFFERING_ID)
                + "\\LotusConnections-config";
          }
          else
          {
            icCFGXML = icCFGXML + "/config/cells/" + profile.getOfferingUserData(Constants.CELL_NAME, OFFERING_ID)
                + "/LotusConnections-config";
          }
          break;
        }
      }
    }

    return icCFGXML;
  }

  @Override
  public void doWASService()
  {
    verifyComplete();
  }

  private void cleanProfileData(STType type)
  {
    IProfile profile = getCustomPanelData().getProfile();
    if (profile == null)
      return;

    if (type == STType.LCST)
    {
      profile.setOfferingUserData(Constants.WC_INSTALL_CHOICE, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_CM, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_ST, Constants.COMBO_OPTION_TRUE, OFFERING_ID);

      if (profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_CONN_ATTEMPTS))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS_TIME, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_CONN_ATTEMPTS_TIME))).append(',').append(OFFERING_ID)
            .toString());
    }
    else if (type == STType.STSD)
    {
      profile.setOfferingUserData(Constants.WC_INSTALL_CHOICE, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_CM, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_ST, Constants.COMBO_OPTION_FALSE, OFFERING_ID);

      if (profile.getOfferingUserData(Constants.WC_ST_SERVER_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_ST_SERVER_URL))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.WC_SSL_SERVER_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_SSL_SERVER_URL))).append(',').append(OFFERING_ID).toString());
    }
    else
    {
      profile.setOfferingUserData(Constants.WC_INSTALL_CHOICE, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_CM, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_ST, Constants.COMBO_OPTION_FALSE, OFFERING_ID);

      if (profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_CONN_ATTEMPTS))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.WC_CONN_ATTEMPTS_TIME, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_CONN_ATTEMPTS_TIME))).append(',').append(OFFERING_ID)
            .toString());

      if (profile.getOfferingUserData(Constants.WC_SERVER_DOMAIN, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_SERVER_DOMAIN))).append(',').append(OFFERING_ID).toString());

      profile.setOfferingUserData(Constants.WC_USE_INITIAL_NAME, Constants.COMBO_OPTION_FALSE, OFFERING_ID);

      profile.setOfferingUserData(Constants.WC_INSTALL_TYPE_ST, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
      if (profile.getOfferingUserData(Constants.WC_ST_SERVER_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_ST_SERVER_URL))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.WC_SSL_SERVER_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.WC_SSL_SERVER_URL))).append(',').append(OFFERING_ID).toString());
    }
  }
}
