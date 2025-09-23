/*
 *+------------------------------------------------------------------------+
\ *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.server;

import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.widgets.Combo;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.docs.im.installer.common.ui.AbstractConfigurationPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class RestartSettingPanel extends AbstractConfigurationPanel
{

  private Combo restartConnCombo;

  private Combo restartWebServersCombo;

  private Label hintLabel;

  private Composite wasPanel;

  private Composite connPanel;

  private boolean docsInstalled = true;

  private boolean viewerInstalled = true;

  private boolean convInstalled = true;

  private boolean docsExtInstalled = true;

  private boolean viewerExtInstalled = true;
  
  private boolean bWebserver = false;
  
  public RestartSettingPanel()
  {
    super(Messages.getString("RESTARTSETTINGS_PANEL_NAME"));    
  }

  @Override
  protected void createPanelControls(Composite parent, FormToolkit toolkit2)
  {
    Composite hintPanel = createPanel(parent);
    hintLabel = this.createDescriptionLabel(hintPanel, Messages.getString("RESTARTSETTINGS_PANEL_ALL_HINT"));
    // Web Servers
    wasPanel = createPanel(parent);
    Label webServersLabel = createLabelAsBoldStyle(wasPanel, toolkit, Messages.getString("RESTARTSETTINGS_PANEL_WEBSERVERS_LABEL"));
    GridData webSerData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    webSerData.verticalIndent = 4;
    webServersLabel.setLayoutData(webSerData);

    // Restart web servers
    // panel = createPanel(parent);
    Label labelForText = createHeaderLabel(wasPanel, Messages.getString("RESTARTSETTINGS_PANEL_RESTARTWEBSERVERS_LABEL"));
    // createDescriptionLabel(panel, Messages.getString("RESTARTSETTINGS_PANEL_RESTARTWEBSERVERS_TEXT"));
    String tooltip = Messages.getString("RESTARTSETTINGS_PANEL_RESTARTWEBSERVERS_TEXT");
    restartWebServersCombo = createCombo(wasPanel, new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 1,
        200);
    PanelUtil.registerAccRelation(labelForText, this.restartWebServersCombo);
    restartWebServersCombo.setToolTipText(tooltip);
    restartWebServersCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete(false);
      }
    });

    // Connections
    connPanel = createPanel(parent);
    Label restartConnLabel = createLabelAsBoldStyle(connPanel, toolkit, Messages.getString("RESTARTSETTINGS_PANEL_CONNECTIONS_LABEL"));
    GridData connData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    connData.verticalIndent = 4;
    restartConnLabel.setLayoutData(connData);

    // Restart Connections
    // panel = createPanel(parent);
    labelForText = createHeaderLabel(connPanel, Messages.getString("RESTARTSETTINGS_PANEL_RESTARTCONNECTIONS_LABEL"));
    restartConnCombo = createCombo(connPanel, new String[] { Messages.getString("Message_Yes"), Messages.getString("Message_No") }, 1, 200);
    PanelUtil.registerAccRelation(labelForText, this.restartConnCombo);
    restartConnCombo.setToolTipText(tooltip);
    restartConnCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        verifyComplete(false);
      }
    });
  }

  @Override
  public void setInitialData()
  {
    IProfile profile = getCustomPanelData().getProfile();

    if (profile != null)
    {
      String rsWebSever = profile.getOfferingUserData(Constants.RESTART_WEB_SERVERS, OFFERING_ID);
      String rsConn = profile.getOfferingUserData(Constants.RESTART_CONNECTIONS, OFFERING_ID);
      if (rsWebSever != null && rsWebSever.trim().length() > 0)
      {
        if (rsWebSever.equals(Constants.COMBO_OPTION_TRUE))
        {
          restartWebServersCombo.select(0);
        }
        else
        {
          restartWebServersCombo.select(1);
        }
      }

      if (rsConn != null && rsConn.trim().length() > 0)
      {
        if (rsConn.equals(Constants.COMBO_OPTION_TRUE))
        {
          restartConnCombo.select(0);
        }
        else
        {
          restartConnCombo.select(1);
        }
      }
      verifyComplete(true);

    }
  }

  private void verifyComplete(boolean init)
  {
    ICustomPanelData data = this.getCustomPanelData();
    IProfile profile = data.getProfile();
    switch (restartWebServersCombo.getSelectionIndex())
      {
        case 0 :
          profile.setOfferingUserData(Constants.RESTART_WEB_SERVERS, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
          break;
        case 1 :
          profile.setOfferingUserData(Constants.RESTART_WEB_SERVERS, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
          break;
      }
    switch (restartConnCombo.getSelectionIndex())
      {
        case 0 :
          profile.setOfferingUserData(Constants.RESTART_CONNECTIONS, Constants.COMBO_OPTION_TRUE, OFFERING_ID);
          break;
        case 1 :
          profile.setOfferingUserData(Constants.RESTART_CONNECTIONS, Constants.COMBO_OPTION_FALSE, OFFERING_ID);
          break;
      }
    if (!init)
    {
      PanelStatusManagementService.getInstance().force();
    }
    
    setErrorMessage(null);
    setPageComplete(true);
    PanelStatusManagementService.statusNotify();
  }

  public boolean shouldSkip()
  {
    boolean newDocInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);
    boolean newViewerInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_ID);
    boolean newConvInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.CONVERSION_ID);
    boolean newDocsExtInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOC_EXT_ID);
    boolean newViewerExtInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_EXT_ID);
    if (!newDocInstalled && !newViewerInstalled && !newConvInstalled && !newDocsExtInstalled && !newViewerExtInstalled)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }

    boolean bNewWebserver = isWebServerConfigured();
    //After feature selection, the panel visible/invisible can not be controled.
    //that means bNewWebserver can not be used to control the panel visible or invisible
    /*if (!newDocsExtInstalled && !newViewerExtInstalled && !bNewWebserver)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }*/

    if (docsInstalled != newDocInstalled || viewerInstalled != newViewerInstalled || convInstalled != newConvInstalled
        || docsExtInstalled != newDocsExtInstalled || viewerExtInstalled != newViewerExtInstalled)
    {
      docsInstalled = newDocInstalled;
      viewerInstalled = newViewerInstalled;
      convInstalled = newConvInstalled;
      docsExtInstalled = newDocsExtInstalled;
      viewerExtInstalled = newViewerExtInstalled;
      updateUI();
    }else if (!bNewWebserver || bNewWebserver!=bWebserver )
    {
      String status = this.getCustomPanelData().getProfile().getOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.OFFERING_ID);      
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
      {
        bWebserver = bNewWebserver;
        updateUI();
      }
    }

    PanelStatusManagementService.add(this);
    return false;
  }

  private boolean isWebServerConfigured()
  {
    ICustomPanelData data = this.getCustomPanelData();
    IProfile profile = data.getProfile();
    String webServer = profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID);
    if (webServer != null && webServer.trim().length() > 0)
    {
      return true;
    }
    return false;
  }

  private void updateUI()
  {

    boolean showWasRestarted = (docsInstalled || viewerInstalled || convInstalled) && isWebServerConfigured();
    boolean showConnRestarted = docsExtInstalled || viewerExtInstalled;

    if (showWasRestarted && showConnRestarted)
    {
      hintLabel.setText(Messages.getString("RESTARTSETTINGS_PANEL_ALL_HINT"));
    }
    else if (showWasRestarted)
    {
      hintLabel.setText(Messages.getString("RESTARTSETTINGS_PANEL_WEB_HINT"));
    }
    else if (showConnRestarted)
    {
      hintLabel.setText(Messages.getString("RESTARTSETTINGS_PANEL_CONN_HINT"));
    }
    hintLabel.getParent().layout(true);

    GridData data = (GridData) wasPanel.getLayoutData();
    data.exclude = !showWasRestarted;
    wasPanel.setVisible(showWasRestarted);

    data = (GridData) connPanel.getLayoutData();
    data.exclude = !showConnRestarted;
    connPanel.setVisible(showConnRestarted);
  }
}
