/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.ecm;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractConfigurationPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class ECMIntegrationPanel extends AbstractConfigurationPanel
{

  private static final String OFFERING_ID = "com.ibm.docs.im.installer";

  private Text fncmisText;

  private Text fncsText;

  private Text j2cAliasText;

  private Text communitiesText;

  private Text navigatorText;

  private Composite aliasPanel;

  private Composite communityPanel;

  private Composite navigatorPanel;

  private boolean isECMInstalled;

  private boolean isCCMInstalled;

  enum CMType {
    CCM, ECM, CCMECM
  };

  public ECMIntegrationPanel()
  {
    super(Messages.getString("MSG_ECM_INTEGRATION_PANEL_NAME"));
  }

  @Override
  protected void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    // ECM Integration
    // Composite panel = createPanel(parent);
    // createLabelAsBoldStyle(panel, toolkit, Messages.getString("MSG_ECM_INTEGRATION_PANEL_NAME"));

    // Basic Description
    Composite panel = createPanel(parent);
    createDescriptionLabel(panel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_DESCRIPTION"));

    // FNCMIS
    panel = createPanel(parent);
    Label labelForText = createDescriptionLabel(panel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_FNCMIS_LABEL"));
    createExampleLabel(panel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_FNCMIS_TEXT"));
    fncmisText = toolkit.createText(panel, "", SWT.SINGLE | SWT.BORDER);
    fncmisText.setLayoutData(createDefaultTextGridData(400));
    PanelUtil.registerAccRelation(labelForText, this.fncmisText);
    fncmisText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // FNCS
    panel = createPanel(parent);
    labelForText = createDescriptionLabel(panel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_FNCS_LABEL"));
    createExampleLabel(panel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_FNCS_TEXT"));
    fncsText = toolkit.createText(panel, "", SWT.SINGLE | SWT.BORDER);
    fncsText.setLayoutData(createDefaultTextGridData(400));
    PanelUtil.registerAccRelation(labelForText, this.fncsText);
    fncsText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // Navigator
    navigatorPanel = createPanel(parent);
    labelForText = createDescriptionLabel(navigatorPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_NAVIGATOR_LABEL"));
    createExampleLabel(navigatorPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_NAVIGATOR_TEXT"));
    navigatorText = toolkit.createText(navigatorPanel, "", SWT.SINGLE | SWT.BORDER);
    navigatorText.setLayoutData(createDefaultTextGridData(400));
    PanelUtil.registerAccRelation(labelForText, this.navigatorText);
    navigatorText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // J2C alias
    aliasPanel = createPanel(parent);
    labelForText = createDescriptionLabel(aliasPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_J2CALIAS_LABEL"));
    createDescriptionLabel(aliasPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_J2CALIAS_TEXT"));
    createExampleLabel(aliasPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_J2CALIAS_EXAMPLE"));
    j2cAliasText = toolkit.createText(aliasPanel, "", SWT.SINGLE | SWT.BORDER);
    j2cAliasText.setLayoutData(createDefaultTextGridData(400));
    PanelUtil.registerAccRelation(labelForText, this.j2cAliasText);
    j2cAliasText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

    // IBM Connections communities
    communityPanel = createPanel(parent);
    labelForText = createDescriptionLabel(communityPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_COMMUNITY_LABEL"));
    createExampleLabel(communityPanel, Messages.getString("MSG_ECM_INTEGRATION_PANEL_COMMUNITY_TEXT"));
    communitiesText = toolkit.createText(communityPanel, "", SWT.SINGLE | SWT.BORDER);
    communitiesText.setLayoutData(createDefaultTextGridData(400));
    PanelUtil.registerAccRelation(labelForText, this.communitiesText);
    communitiesText.addModifyListener(new ModifyListener()
    {

      public void modifyText(ModifyEvent arg0)
      {
        verifyComplete();
      }
    });

  }

  @Override
  public void setInitialData()
  {
    IProfile profile = getCustomPanelData().getProfile();

    if (profile != null)
    {
      String fncmis = profile.getOfferingUserData(Constants.ECM_FNCMIS_URL, OFFERING_ID);
      String fncs = profile.getOfferingUserData(Constants.ECM_FNCS_URL, OFFERING_ID);
      String navigator = profile.getOfferingUserData(Constants.ECM_NAVIGATOR_URL, OFFERING_ID);
      String alias = profile.getOfferingUserData(Constants.ECM_J2C_ALIAS, OFFERING_ID);
      String communites = profile.getOfferingUserData(Constants.ECM_COMMUNITIES_URL, OFFERING_ID);

      if (fncmis != null && fncmis.trim().length() > 0)
      {
        fncmisText.setText(fncmis);
      }

      if (fncs != null && fncs.trim().length() > 0)
      {
        fncsText.setText(fncs);
      }

      if (navigator != null && navigator.trim().length() > 0)
      {
        navigatorText.setText(navigator);
      }

      if (alias != null && alias.trim().length() > 0)
      {
        j2cAliasText.setText(alias);
      }

      if (communites != null && communites.trim().length() > 0)
      {
        communitiesText.setText(communites);
      }

      verifyComplete();

    }
  }

  private void verifyComplete()
  {
    String fncmisURL = fncmisText.getText().trim();
    String fncsURL = fncsText.getText().trim();
    String navigatorURL = navigatorText.getText().trim();
    String j2cAlias = j2cAliasText.getText().trim();
    String communitiesuRL = communitiesText.getText().trim();

    Map<String, String> map = new HashMap<String, String>();
    map.put(Constants.ECM_FNCMIS_URL, fncmisURL);
    map.put(Constants.ECM_FNCS_URL, fncsURL);
    map.put(Constants.ECM_NAVIGATOR_URL, navigatorURL);
    map.put(Constants.ECM_J2C_ALIAS, j2cAlias);
    map.put(Constants.ECM_COMMUNITIES_URL, communitiesuRL);

    map.put(Constants.CCM_INSTALLED, (isCCMInstalled ? "true" : "false"));
    map.put(Constants.ECM_INSTALLED, (isECMInstalled ? "true" : "false"));

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] jobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(jobs, OFFERING_ID);
    IStatus status = this.getAgent().validateOfferingUserData(myOffering, map);
    if (status.isOK())
    {
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.ECM_FNCMIS_URL, fncmisURL, OFFERING_ID);
      profile.setOfferingUserData(Constants.ECM_FNCS_URL, fncsURL, OFFERING_ID);
      profile.setOfferingUserData(Constants.ECM_NAVIGATOR_URL, navigatorURL, OFFERING_ID);
      profile.setOfferingUserData(Constants.ECM_J2C_ALIAS, j2cAlias, OFFERING_ID);
      profile.setOfferingUserData(Constants.ECM_COMMUNITIES_URL, communitiesuRL, OFFERING_ID);

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

  @Override
  public boolean shouldSkip()
  {
    com.ibm.cic.agent.ui.extensions.ICustomPanelData data = getCustomPanelData();
    boolean isUpgraded = IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE);
    if (isUpgraded)
    {
      PanelStatusManagementService.remove(this);
      return true;
    }
    boolean newIsECMInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMECM)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMST) || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICECM)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICCCMECM);
    boolean newIsCCMInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCCM)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICCCMECM);
    if (!newIsECMInstalled && !newIsCCMInstalled)
    {
      PanelStatusManagementService.remove(this);
      cleanProfileData(CMType.CCMECM);
      return true;
    }
    else if (!newIsECMInstalled)
    {
      cleanProfileData(CMType.ECM);
    }
    else if (!newIsCCMInstalled)
    {
      cleanProfileData(CMType.CCM);
    }

    if (isECMInstalled != newIsECMInstalled || isCCMInstalled != newIsCCMInstalled)
    {
      isECMInstalled = newIsECMInstalled;
      isCCMInstalled = newIsCCMInstalled;
      updateUI();
    }

    PanelStatusManagementService.add(this);
    return false;
  }

  private void updateUI()
  {

    GridData data = (GridData) aliasPanel.getLayoutData();
    data.exclude = !isCCMInstalled;
    aliasPanel.setVisible(isCCMInstalled);

    data = (GridData) communityPanel.getLayoutData();
    data.exclude = !isCCMInstalled;
    communityPanel.setVisible(isCCMInstalled);

    boolean visible = (!isCCMInstalled || isECMInstalled);
    data = (GridData) navigatorPanel.getLayoutData();
    data.exclude = !visible;
    navigatorPanel.setVisible(visible);

    this.resize();
    verifyComplete();
  }

  private void cleanProfileData(CMType type)
  {
    IProfile profile = getCustomPanelData().getProfile();
    if (profile == null)
      return;

    if (type == CMType.CCM)
    {
      if (profile.getOfferingUserData(Constants.ECM_COMMUNITIES_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_COMMUNITIES_URL))).append(',').append(OFFERING_ID)
            .toString());
    }
    else if (type == CMType.ECM)
    {
      if (profile.getOfferingUserData(Constants.ECM_NAVIGATOR_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_NAVIGATOR_URL))).append(',').append(OFFERING_ID).toString());
    }
    else
    {
      if (profile.getOfferingUserData(Constants.ECM_FNCMIS_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_FNCMIS_URL))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.ECM_FNCS_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_FNCS_URL))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.ECM_NAVIGATOR_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_NAVIGATOR_URL))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.ECM_J2C_ALIAS, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_J2C_ALIAS))).append(',').append(OFFERING_ID).toString());
      if (profile.getOfferingUserData(Constants.ECM_COMMUNITIES_URL, OFFERING_ID) != null)
        profile.removeUserData((new StringBuilder(String.valueOf(Constants.ECM_COMMUNITIES_URL))).append(',').append(OFFERING_ID)
            .toString());
    }
  }
}
