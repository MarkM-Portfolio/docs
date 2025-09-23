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

import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.events.SelectionListener;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.widgets.Combo;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractConfigurationPanel;
import com.ibm.docs.im.installer.common.ui.ConvServiceListener;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.ConvConfigService;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class MainPanel extends AbstractConfigurationPanel implements ConvServiceListener
{

  private static final String OFFERING_ID = "com.ibm.docs.im.installer";
  
  private boolean dataInitialed = false;

  // private Text sharedDirectoryText;

  private Text conversionSrvText;

  private Text authServerHostText;

  private Text cleaningCacheText;

  private Text cleaningLatestVerText;

  // private Text installLocationText;

  // private Combo editorInstalledCombo;

  private Combo cacheControlCombo;

  private Combo printSettingCombo;

  private Combo authTypeCombo;

  private Combo multitenancyCombo;

  private Combo uploadConversionCombo;

  private Combo hkCombo;

  private Composite convSrvPanel;

  private Composite authHostNameComp;

  // private Composite editorInstalledPanel;

  private Composite defaultTextPanel;

  private boolean isSameCell = false;

  private boolean isViewerInstalled;

  public MainPanel()
  {
    super(Messages.getString("VIEWER_PANEL_NAME"));
    ConvConfigService.register(this);
  }

  @Override
  protected void handleAdvancedLinkEvent()
  {
    if (isSameCell)
    {
      setPanelVisible(defaultTextPanel, !advancedSettingsVisible);
    }

  }

  protected void createPanelControls(Composite parent, FormToolkit toolkit)
  {

    if (hidePanels == null)
    {
      hidePanels = new ArrayList<Composite>();
    }

    // Advanced settings
    createAdvancedLink(parent);

    // Default text for viewer extension
    defaultTextPanel = createPanel(parent);
    createDescriptionLabel(defaultTextPanel, Messages.getString("MSG_VIEWER_MAINPANEL_DEFAULT_TEXT"));
    setPanelVisible(defaultTextPanel, false);

    // Host Name, Port, and Context Path for IBM Conversion Service
    convSrvPanel = createPanel(parent);
    Label labelForText = createHeaderLabel(convSrvPanel, Messages.getString("MSG_VIEWER_MAINPANEL_CONVERSIONSERVICE_LABEL"));
    createDescriptionLabel(convSrvPanel, Messages.getString("MSG_VIEWER_MAINPANEL_CONVERSIONSERVICE_TEXT"));
    conversionSrvText = toolkit.createText(convSrvPanel, "", SWT.SINGLE | SWT.BORDER);
    conversionSrvText.setLayoutData(createDefaultTextGridData(438));
    PanelUtil.registerAccRelation(labelForText, this.conversionSrvText);
    conversionSrvText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        ConvConfigService.notify(conversionSrvText.getText().trim());
        verifyComplete();
      }
    });

    // Cache Control Setting
    Composite panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_CACHECONTROLSETTING_LABEL"));
    createDescriptionLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_CACHECONTROLSETTING_TEXT"));
    cacheControlCombo = createCombo(panel, new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 1, 200);
    PanelUtil.registerAccRelation(labelForText, this.cacheControlCombo);
    cacheControlCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

    // Print Setting
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_PRINTSETTING_LABEL"));
    printSettingCombo = createCombo(panel, new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 1, 200);
    PanelUtil.registerAccRelation(labelForText, this.printSettingCombo);
    printSettingCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

    // Authentication Type
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("DocsPanel.AUTHORIZATION_TYPE"));
    PanelUtil.createComposedLabel(panel, toolkit, Messages.getString("DocsPanel.AUTHORIZATION_TYPE_TAM"),
        Messages.getString("DocsPanel.AUTHORIZATION_TYPE_TAM_DESC"));
    PanelUtil.createComposedLabel(panel, toolkit, Messages.getString("DocsPanel.AUTHORIZATION_TYPE_FORM"),
        Messages.getString("DocsPanel.AUTHORIZATION_TYPE_FORM_DESC"));
    authTypeCombo = createCombo(panel, new String[] { Constants.AUTH_TYPE_TAM, Constants.AUTH_TYPE_FORM }, 1, 200);
    PanelUtil.registerAccRelation(labelForText, this.authTypeCombo);
    authTypeCombo.setToolTipText(Messages.getString("MSG_VIEWER_MAINPANEL_AUTHTYPE_TIP"));

    authTypeCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        doAuthAction();
      }
    });

    // Authentication Server Host of Docs
    authHostNameComp = createHiddenPanel(parent);
    createHeaderLabel(authHostNameComp, Messages.getString("MSG_VIEWER_MAINPANEL_AUTHSERVERHOST_LABEL"));
    labelForText = createDescriptionLabel(authHostNameComp, Messages.getString("MSG_VIEWER_MAINPANEL_AUTHSERVERHOST_TEXT"));
    createExampleLabel(authHostNameComp, Messages.getString("MSG_VIEWER_MAINPANEL_AUTHSERVERHOST_EXAMPLE"));
    authServerHostText = toolkit.createText(authHostNameComp, null, SWT.SINGLE | SWT.BORDER);
    authServerHostText.setLayoutData(createDefaultTextGridData(320));
    PanelUtil.registerAccRelation(labelForText, this.authServerHostText);
    authServerHostText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // Multitenancy Enablement
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_MULTITENANCY_LABEL"));
    createDescriptionLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_MULTITENANCY_TEXT"));
    multitenancyCombo = createCombo(panel, new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 1, 200);
    PanelUtil.registerAccRelation(labelForText, this.multitenancyCombo);
    multitenancyCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

    // Conversion on File Upload Enablement
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_UPLOADCONVERSION_LABEL"));
    createDescriptionLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_UPLOADCONVERSION_TEXT"));
    uploadConversionCombo = createCombo(panel, new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 0, 200);
    PanelUtil.registerAccRelation(labelForText, this.uploadConversionCombo);
    uploadConversionCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

    // Housekeeping Frequency
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_HOUSEKEEPINGFREQUENCY_LABEL"));
    hkCombo = createCombo(panel,
        new String[] { Messages.getString("Message_Hourly"), Messages.getString("Message_Daily"), Messages.getString("Message_Weekly"),
            Messages.getString("Message_Monthly") }, 2, 200);
    PanelUtil.registerAccRelation(labelForText, this.hkCombo);
    hkCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete();
      }
    });

    // Cleaning Latest Version of a Document Cache
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_CLEANINGCACHE_LABEL"));
    createDescriptionLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_CLEANINGCACHE_TEXT"));
    cleaningCacheText = toolkit.createText(panel, "30", SWT.SINGLE | SWT.BORDER);
    cleaningCacheText.setLayoutData(createDefaultTextGridData(200));
    PanelUtil.registerAccRelation(labelForText, this.cleaningCacheText);
    cleaningCacheText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // Triggering Latest Version Cleaning
    panel = createHiddenPanel(parent);
    labelForText = createHeaderLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_CLEANINGLATESTVERSION_LABEL"));
    createDescriptionLabel(panel, Messages.getString("MSG_VIEWER_MAINPANEL_CLEANINGLATESTVERSION_TEXT"));
    cleaningLatestVerText = toolkit.createText(panel, "256", SWT.SINGLE | SWT.BORDER);
    cleaningLatestVerText.setLayoutData(createDefaultTextGridData(200));
    PanelUtil.registerAccRelation(labelForText, this.cleaningLatestVerText);
    cleaningLatestVerText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

  }

  private void doAuthAction()
  {
    int idx = authTypeCombo.getSelectionIndex();
    boolean visible = false;
    if (authTypeCombo.getItem(idx).equals(Constants.AUTH_TYPE_TAM))
    {
      visible = true;
      verifyComplete();
    }
    else
    {
      authServerHostText.setText("");
    }
    updateTAMUI(visible, authTypeCombo.isVisible());
  }

  public void setAdvancedSettingsVisible(boolean visible)
  {
    super.setAdvancedSettingsVisible(visible);
    boolean isTamVisible = authTypeCombo.getSelectionIndex() == 0;
    updateTAMUI(isTamVisible, visible);
  }

  private void updateTAMUI(boolean visible, boolean isAdvancedVisible)
  {
    // if it is not advanced settings, don't show it even it is now visible because of the selection of "TAM"
    if (visible && !isAdvancedVisible)
      visible = false;
    GridData data = (GridData) authHostNameComp.getLayoutData();
    data.exclude = !visible;
    authHostNameComp.setVisible(visible);
    resize();
    if (visible)
      authServerHostText.setFocus();
  }

  public void update()
  {
    String value = ConvConfigService.getConvURLValue();
    if (!conversionSrvText.getText().trim().equals(value))
    {
      conversionSrvText.setText(value);
    }
  }

  @Override
  public void setInitialData()
  {
    IProfile profile = getCustomPanelData().getProfile();

    if (profile != null)
    {      
      String convServiceURL = profile.getOfferingUserData(Constants.VIEWER_CONVERSION_SERVICE_PATH, OFFERING_ID);
      String controlSetting = profile.getOfferingUserData(Constants.VIEWER_CACHE_CONTROL_SETTING, OFFERING_ID);
      String printSetting = profile.getOfferingUserData(Constants.VIEWER_PRINT_SETTING, OFFERING_ID);
      String authType = profile.getOfferingUserData(Constants.VIEWER_AUTHENTICATION_TYPE, OFFERING_ID);
      String authHost = profile.getOfferingUserData(Constants.VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS, OFFERING_ID);
      String multitenancy = profile.getOfferingUserData(Constants.VIEWER_MULTITENANCY_ENABLEMENT, OFFERING_ID);
      String uploadConv = profile.getOfferingUserData(Constants.VIEWER_ENABLE_UPLOAD_CONVERSION, OFFERING_ID);
      String hkFrequency = profile.getOfferingUserData(Constants.VIEWER_HOUSEKEEPING_FREQUENCY, OFFERING_ID);
      String cleanLstVerCache = profile.getOfferingUserData(Constants.VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE, OFFERING_ID);
      String triggerLstVerCache = profile.getOfferingUserData(Constants.VIEWER_TRIGGERING_LATEST_VERSION_CLEANING, OFFERING_ID);
      dataInitialed = true;

      if (convServiceURL != null && convServiceURL.trim().length() > 0)
      {
        conversionSrvText.setText(convServiceURL);
      }

      if (controlSetting != null && controlSetting.trim().length() > 0)
      {
        if (controlSetting.endsWith(Constants.COMBO_OPTION_YES))
        {
          cacheControlCombo.select(0);
        }
        else
        {
          cacheControlCombo.select(1);
        }
      }

      if (printSetting != null && printSetting.trim().length() > 0)
      {
        if (printSetting.endsWith(Constants.COMBO_OPTION_YES))
        {
          printSettingCombo.select(0);
        }
        else
        {
          printSettingCombo.select(1);
        }
      }

      if (authType != null && authType.trim().length() > 0)
      {
        if (authType.endsWith(Constants.AUTH_TYPE_TAM))
        {
          authTypeCombo.select(0);
        }
        else
        {
          authTypeCombo.select(1);
        }
        doAuthAction();
      }

      if (authHost != null && authHost.trim().length() > 0)
      {
        authServerHostText.setText(authHost);
      }

      if (multitenancy != null && multitenancy.trim().length() > 0)
      {
        if (multitenancy.endsWith(Constants.COMBO_OPTION_TRUE))
        {
          multitenancyCombo.select(0);
        }
        else
        {
          multitenancyCombo.select(1);
        }
      }

      if (uploadConv != null && uploadConv.trim().length() > 0)
      {
        if (uploadConv.endsWith(Constants.COMBO_OPTION_YES))
        {
          uploadConversionCombo.select(0);
        }
        else
        {
          uploadConversionCombo.select(1);
        }
      }

      if (hkFrequency != null && hkFrequency.trim().length() > 0)
      {
        if (hkFrequency.equals(Constants.COMBO_OPTION_HOURLY))
        {
          hkCombo.select(0);
        }
        else if (hkFrequency.equals(Constants.COMBO_OPTION_DAILY))
        {
          hkCombo.select(1);
        }
        else if (hkFrequency.equals(Constants.COMBO_OPTION_WEEKLY))
        {
          hkCombo.select(2);
        }
        else if (hkFrequency.equals(Constants.COMBO_OPTION_MONTHLY))
        {
          hkCombo.select(3);
        }
      }

      if (cleanLstVerCache != null && cleanLstVerCache.trim().length() > 0)
      {
        cleaningCacheText.setText(cleanLstVerCache);
      }

      if (triggerLstVerCache != null && triggerLstVerCache.trim().length() > 0)
      {
        cleaningLatestVerText.setText(triggerLstVerCache);
      }

      verifyComplete();

    }
  }

  private void verifyComplete()
  {
    // String editorInstalled = Constants.COMBO_OPTION_YES;
    // if (editorInstalledCombo.getSelectionIndex() == 1)
    // {
    // editorInstalled = Constants.COMBO_OPTION_NO;
    // }
    String convServicePath = conversionSrvText.getText().trim();
    String cacheSetting = Constants.COMBO_OPTION_NO;
    if (cacheControlCombo.getSelectionIndex() == 0)
    {
      cacheSetting = Constants.COMBO_OPTION_YES;
    }
    String printSetting = Constants.COMBO_OPTION_NO;
    if (printSettingCombo.getSelectionIndex() == 0)
    {
      printSetting = Constants.COMBO_OPTION_YES;
    }
    String authType = Constants.AUTH_TYPE_FORM;
    if (authTypeCombo.getSelectionIndex() == 0)
    {
      authType = Constants.AUTH_TYPE_TAM;
    }
    String authHost = authServerHostText.getText().trim();
    String multitenacy = Constants.COMBO_OPTION_FALSE;
    if (multitenancyCombo.getSelectionIndex() == 0)
    {
      multitenacy = Constants.COMBO_OPTION_TRUE;
    }
    String uploadConversion = Constants.COMBO_OPTION_YES;
    if (uploadConversionCombo.getSelectionIndex() == 1)
    {
      uploadConversion = Constants.COMBO_OPTION_NO;
    }
    String hkFrequency = Constants.COMBO_OPTION_WEEKLY;
    if (hkCombo.getSelectionIndex() == 0)
    {
      hkFrequency = Constants.COMBO_OPTION_HOURLY;
    }
    else if (hkCombo.getSelectionIndex() == 1)
    {
      hkFrequency = Constants.COMBO_OPTION_DAILY;
    }
    else if (hkCombo.getSelectionIndex() == 3)
    {
      hkFrequency = Constants.COMBO_OPTION_MONTHLY;
    }
    String cleanCache = cleaningCacheText.getText().trim();
    String trigger = cleaningLatestVerText.getText().trim();

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] jobs = data.getAllJobs();
    File rootPath = new File(data.getProfile().getInstallLocation(), "Viewer");
    String installPath = rootPath.getAbsolutePath();

    Map<String, String> map = new HashMap<String, String>();
    map.put(Constants.VIEWER_SAME_CELL_AS_CONVERSION, isSameCell ? "true" : "false");
    map.put(Constants.VIEWER_CONVERSION_SERVICE_PATH, convServicePath);
    map.put(Constants.VIEWER_AUTHENTICATION_TYPE, authType);
    map.put(Constants.VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS, authHost);
    map.put(Constants.VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE, cleanCache);
    map.put(Constants.VIEWER_TRIGGERING_LATEST_VERSION_CLEANING, trigger);

    IOffering myOffering = Util.findOffering(jobs, OFFERING_ID);
    IStatus status = this.getAgent().validateOfferingUserData(myOffering, map);
    if (status.isOK() && dataInitialed)
    {
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.VIEWER_INSTALLATION_LOCATION, installPath, OFFERING_ID);
      // profile.setOfferingUserData(Constants.VIEWER_EDITOR_INSTALLED, isSameCell ? Constants.COMBO_OPTION_YES : Constants.COMBO_OPTION_NO,
      // OFFERING_ID);
      profile.setOfferingUserData(Constants.CONVERSION_URL, convServicePath, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_CACHE_CONTROL_SETTING, cacheSetting, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_PRINT_SETTING, printSetting, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_AUTHENTICATION_TYPE, authType, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS, authHost, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_MULTITENANCY_ENABLEMENT, multitenacy, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_ENABLE_UPLOAD_CONVERSION, uploadConversion, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_HOUSEKEEPING_FREQUENCY, hkFrequency, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE, cleanCache, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_TRIGGERING_LATEST_VERSION_CLEANING, trigger, OFFERING_ID);
      profile.setOfferingUserData(Constants.VIEWER_SCOPE, Constants.TOPOLOGY_CLUSTER, OFFERING_ID);      

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

  public boolean shouldSkip()
  {
    ICustomPanelData data = this.getCustomPanelData();
    isViewerInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMVIEWER);
    if (!isViewerInstalled)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }

    boolean curValue = IMUtil.isSameCellWithConversion(data);
    if (isSameCell != curValue)
    {
      isSameCell = curValue;
      if (isSameCell)
      {
        setPanelVisible(defaultTextPanel, !advancedSettingsVisible);
        GridData gridData = (GridData) convSrvPanel.getLayoutData();
        gridData.exclude = true;
        convSrvPanel.setVisible(false);
        resize();
      }
      else
      {
        setPanelVisible(defaultTextPanel, false);
        GridData gridData = (GridData) convSrvPanel.getLayoutData();
        gridData.exclude = false;
        convSrvPanel.setVisible(true);
        topContainer.pack();
        resize();
      }
      verifyComplete();
    }

    PanelStatusManagementService.add(this);
    return false;
  }
}
