/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.integration;

import java.net.MalformedURLException;
import java.net.URL;
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
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IMStatuses;
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

public class ThirdPartyPanel extends AbstractCustomConfigPanel
{
  private String[] repotypes = new String[] { Constants.REPO_CMIS, Constants.REPO_REST };

  private String[] authtypes = new String[] { Constants.AUTH_OAUTH2, Constants.AUTH_J2C, Constants.AUTH_S2S, Constants.AUTH_COOKIE };

  private Composite topContainer;

  private Combo repositoryTypeCombo;

  private Composite cmisPanel;

  private Text atomUrlField;

  private Text objectStoreField;

  private Composite restPanel;

  private Composite restSetPanel;

  private Text metaUrlField;

  private Text getUrlField;

  private Text setUrlField;

  private Combo authCombo;

  private Text oauthEndPointField;

  private Text j2cAliasField;

  private Text asUserField;

  private Text s2sTokeyKeyField;

  private Text s2sTokeyValueField;

  private Text userProfilesField;

  private Text repoHomeField;

  private Composite oauthPanel;

  private Composite j2cAliasPanel;

  private Composite s2sTokenPanel;

  private Composite asUserPanel;

  private boolean docsInstalled = true;

  private boolean viewerInstalled = true;

  public ThirdPartyPanel()
  {
    super(Messages.getString("ThirdPartyPanel_NAME")); //$NON-NLS-1$
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
      String atomPub = profile.getOfferingUserData(Constants.EXTERNAL_CMIS_ATOM_PUB, OFFERING_ID);
      if (atomPub != null && atomPub.trim().length() > 0)
      {
        this.atomUrlField.setText(atomPub.trim());
        repositoryTypeCombo.select(0);
        showCMISOrRest();
      }
      String objectStore = profile.getOfferingUserData(Constants.EXTERNAL_OBJECT_STORE, OFFERING_ID);
      if (objectStore != null && objectStore.trim().length() > 0)
      {
        this.objectStoreField.setText(objectStore.trim());
      }
      String metaUrl = profile.getOfferingUserData(Constants.EXTERNAL_META_URL, OFFERING_ID);
      if (metaUrl != null && metaUrl.trim().length() > 0)
      {
        this.metaUrlField.setText(metaUrl.trim());
        repositoryTypeCombo.select(1);
        showCMISOrRest();
      }
      String restGetUrl = profile.getOfferingUserData(Constants.EXTERNAL_GET_CONTENT_URL, OFFERING_ID);
      if (restGetUrl != null && restGetUrl.trim().length() > 0)
      {
        this.getUrlField.setText(restGetUrl.trim());
      }
      String restSetUrl = profile.getOfferingUserData(Constants.EXTERNAL_SET_CONTENT_URL, OFFERING_ID);
      if (restSetUrl != null && restSetUrl.trim().length() > 0)
      {
        this.setUrlField.setText(restSetUrl.trim());
      }

      String authMethod = profile.getOfferingUserData(Constants.EXTERNAL_S2S_METHOD, OFFERING_ID);
      if (authMethod != null && authMethod.trim().length() > 0)
      {
        for (int i = 0; i < authtypes.length; i++)
        {
          if (authtypes[i].equalsIgnoreCase(authMethod))
          {
            this.authCombo.select(i);
            showAuthElements();
            break;
          }
        }
      }

      String oauth = profile.getOfferingUserData(Constants.EXTERNAL_OAUTH_ENDPOINT, OFFERING_ID);
      if (oauth != null && oauth.trim().length() > 0)
      {
        this.oauthEndPointField.setText(oauth.trim());
      }
      String j2c_alias = profile.getOfferingUserData(Constants.EXTERNAL_J2C_ALIAS, OFFERING_ID);
      if (j2c_alias != null && j2c_alias.trim().length() > 0)
      {
        this.j2cAliasField.setText(j2c_alias.trim());
      }
      String tokenKey = profile.getOfferingUserData(Constants.EXTERNAL_TOKEN_KEY, OFFERING_ID);
      if (tokenKey != null && tokenKey.trim().length() > 0)
      {
        this.s2sTokeyKeyField.setText(tokenKey.trim());
      }
      String tokenValue = profile.getOfferingUserData(Constants.EXTERNAL_S2S_TOKEN, OFFERING_ID);
      if (tokenValue != null && tokenValue.trim().length() > 0)
      {
        this.s2sTokeyValueField.setText(tokenValue.trim());
      }
      String asUser = profile.getOfferingUserData(Constants.EXTERNAL_AS_USER_KEY, OFFERING_ID);
      if (asUser != null && asUser.trim().length() > 0)
      {
        this.asUserField.setText(asUser.trim());
      }

      String userProfile = profile.getOfferingUserData(Constants.EXTERNAL_PROFILES_URL, OFFERING_ID);
      if (userProfile != null && userProfile.trim().length() > 0)
      {
        this.userProfilesField.setText(userProfile.trim());
      }
      String repoHome = profile.getOfferingUserData(Constants.EXTERNAL_REPOSITORY_HOME, OFFERING_ID);
      if (repoHome != null && repoHome.trim().length() > 0)
      {
        this.repoHomeField.setText(repoHome.trim());
      }

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

  protected void createPanelControls(final Composite parent, final FormToolkit toolkit)
  {
    Composite repository = createPanel(parent, true);

    this.createPlainLabel(repository, Messages.getString("ThirdPartyPanel_REPO_TYPE"), 0, VINDENT_DEFAULT); //$NON-NLS-1$
    Label labelForText = this.createPlainLabel(repository, Messages.getString("ThirdPartyPanel_REPO_TYPE_DESC"), 0, NONE_VINDENT); //$NON-NLS-1$
    repositoryTypeCombo = this.createCombo(repository, ""); //$NON-NLS-1$
    repositoryTypeCombo.setItems(repotypes);
    repositoryTypeCombo.select(0);
    PanelUtil.registerAccRelation(labelForText, repositoryTypeCombo);
    repositoryTypeCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        showCMISOrRest();
        verifyComplete(false, false);
      }
    });
    // CMIS configurations
    cmisPanel = createPanel(parent, true);
    labelForText = this.createPlainLabel(cmisPanel, Messages.getString("ThirdPartyPanel_CMIS_ATOM_URL"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(cmisPanel, Messages.getString("ThirdPartyPanel_CMIS_ATOM_EXAMPLE"), 0, NONE_VINDENT);
    atomUrlField = this.createText(cmisPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, atomUrlField);

    this.createPlainLabel(cmisPanel, Messages.getString("ThirdPartyPanel_CMIS_OBJECT_STORE"), 0, VINDENT_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(cmisPanel, Messages.getString("ThirdPartyPanel_CMIS_OBJECT_STORE_DESC"), 0, NONE_VINDENT); //$NON-NLS-1$
    objectStoreField = this.createText(cmisPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, objectStoreField);

    // REST configuration
    restPanel = createPanel(parent, false); // by default, don't show this rest panel
    labelForText = this.createPlainLabel(restPanel, Messages.getString("ThirdPartyPanel_REST_META_URL"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(restPanel, Messages.getString("ThirdPartyPanel_REST_META_EXAMPLE"), 0, NONE_VINDENT);
    this.createPlainLabel(restPanel, Messages.getString("ThirdPartyPanel_REST_ID_DESC"), 0, NONE_VINDENT); //$NON-NLS-1$
    //this.createPlainLabel(restPanel, Messages.getString("ThirdPartyPanel_REST_META_EXAMPLE"), true, 0, NONE_VINDENT); //$NON-NLS-1$
    metaUrlField = this.createText(restPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, metaUrlField);

    labelForText = this.createPlainLabel(restPanel, Messages.getString("ThirdPartyPanel_REST_GET_URL"), 0, VINDENT_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(restPanel, Messages.getString("ThirdPartyPanel_REST_GET_EXAMPLE"), 0, NONE_VINDENT);
    getUrlField = this.createText(restPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, getUrlField);

    restSetPanel = createPanel(parent, false);
    labelForText = this.createPlainLabel(restSetPanel, Messages.getString("ThirdPartyPanel_REST_SET_URL"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createExampleLabel(restSetPanel, Messages.getString("ThirdPartyPanel_REST_SET_EXAMPLE"), 0, NONE_VINDENT);
    setUrlField = this.createText(restSetPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, setUrlField);

    Composite authComp = createPanel(parent, true);
    labelForText = this.createPlainLabel(authComp, Messages.getString("ThirdPartyPanel_AUTH"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    this.createPlainLabel(authComp, Messages.getString("ThirdPartyPanel_AUTH_DESC"), //$NON-NLS-1$
        0, NONE_VINDENT);
    authCombo = this.createCombo(authComp, ""); //$NON-NLS-1$
    authCombo.setItems(authtypes);
    authCombo.select(0);
    PanelUtil.registerAccRelation(labelForText, authCombo);
    authCombo.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        showAuthElements();
        verifyComplete(false, false);
      }
    });
    // oauth2 configuration
    oauthPanel = createPanel(parent, true);
    this.createPlainLabel(oauthPanel, Messages.getString("ThirdPartyPanel_OAUTH_EP"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(oauthPanel, Messages.getString("ThirdPartyPanel_OAUTH_EP_DESC"), 0, NONE_VINDENT); //$NON-NLS-1$
    this.createExampleLabel(oauthPanel, Messages.getString("ThirdPartyPanel_OAUTH_EP_EXAMPLE"), 0, NONE_VINDENT);
    oauthEndPointField = this.createText(oauthPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, oauthEndPointField);
    // j2c_alias configuration
    j2cAliasPanel = createPanel(parent, false);
    this.createPlainLabel(j2cAliasPanel, Messages.getString("ThirdPartyPanel_J2C_ALIAS"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(j2cAliasPanel, Messages.getString("ThirdPartyPanel_J2C_ALIAS_DESC"), 0, //$NON-NLS-1$
        NONE_VINDENT);
    this.createExampleLabel(j2cAliasPanel, Messages.getString("ThirdPartyPanel_J2C_ALIAS_EXAMPLE"), 0, NONE_VINDENT);
    j2cAliasField = this.createText(j2cAliasPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, j2cAliasField);
    // s2s_token configuration
    s2sTokenPanel = createPanel(parent, false);
    this.createPlainLabel(s2sTokenPanel, Messages.getString("ThirdPartyPanel_S2S_TOKEY_KEY"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(s2sTokenPanel, Messages.getString("ThirdPartyPanel_S2S_TOKEY_DESC"), //$NON-NLS-1$
        0, NONE_VINDENT);
    this.createExampleLabel(s2sTokenPanel, Messages.getString("ThirdPartyPanel_S2S_TOKEN_EXAMPLE"), 0, NONE_VINDENT);
    s2sTokeyKeyField = this.createText(s2sTokenPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, s2sTokeyKeyField);
    labelForText = this.createPlainLabel(s2sTokenPanel, Messages.getString("ThirdPartyPanel_S2S_TOKEN_VALUE"), 0, VINDENT_DEFAULT); //$NON-NLS-1$
    s2sTokeyValueField = this.createText(s2sTokenPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, s2sTokeyValueField);
    // as-user configuration
    asUserPanel = createPanel(parent, false);
    this.createPlainLabel(asUserPanel, Messages.getString("ThirdPartyPanel_AS_USER"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(asUserPanel, Messages.getString("ThirdPartyPanel_AS_USER_DESC"), 0, //$NON-NLS-1$
        NONE_VINDENT);
    this.createExampleLabel(asUserPanel, Messages.getString("ThirdPartyPanel_AS_USER_EXAMPLE"), 0, NONE_VINDENT);
    asUserField = this.createText(asUserPanel, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, asUserField);

    // Repository home configuration
    Composite repoHome = createPanel(parent, true);
    this.createPlainLabel(repoHome, Messages.getString("ThirdPartyPanel_PROFILES_URL"), 0, VINDENT_PANEL_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(repoHome, Messages.getString("ThirdPartyPanel_PROFILES_URL_DESC"), 0, //$NON-NLS-1$
        NONE_VINDENT);
    this.createExampleLabel(repoHome, Messages.getString("ThirdPartyPanel_PROFILES_URL_EXAMPLE"), 0, NONE_VINDENT);
    userProfilesField = this.createText(repoHome, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, userProfilesField);

    this.createPlainLabel(repoHome, Messages.getString("ThirdPartyPanel_REPO_HOME"), 0, VINDENT_DEFAULT); //$NON-NLS-1$
    labelForText = this.createPlainLabel(repoHome, Messages.getString("ThirdPartyPanel_REPO_HOME_DESC"), 0, //$NON-NLS-1$
        NONE_VINDENT);
    this.createExampleLabel(repoHome, Messages.getString("ThirdPartyPanel_REPO_HOME_EXAMPLE"), 0, NONE_VINDENT);
    repoHomeField = this.createText(repoHome, "", "", 400); //$NON-NLS-1$ //$NON-NLS-2$
    PanelUtil.registerAccRelation(labelForText, repoHomeField);

  }

  public boolean shouldSkip()
  {
    boolean selected = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMTPI);
    boolean newdocsInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);
    boolean newviewerInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_ID);
    if (!selected || (!newdocsInstalled && !newviewerInstalled))
    {
      PanelStatusManagementService.remove(this);
      return true;
    }

    if (docsInstalled != newdocsInstalled || viewerInstalled != newviewerInstalled)
    {
      docsInstalled = newdocsInstalled;
      viewerInstalled = newviewerInstalled;
      this.updateUI();
    }
    PanelStatusManagementService.add(this);
    return false;
  }

  private void updateUI()
  {
    this.showRestSet();
  }

  private void showAuthElements()
  {
    int value = authCombo.getSelectionIndex();
    switch (value)
      {
        case 0 :
          updateOauth(true);
          updateJ2CAlias(false);
          updateS2SToken(false);
          updateAsUser(false);
          break;
        case 1 :
          updateOauth(false);
          updateJ2CAlias(true);
          updateS2SToken(false);
          updateAsUser(true);
          break;
        case 2 :
          updateOauth(false);
          updateJ2CAlias(false);
          updateS2SToken(true);
          updateAsUser(true);
          break;
        case 3 :
          updateOauth(false);
          updateJ2CAlias(false);
          updateS2SToken(false);
          updateAsUser(false);
        default:
          break;
      }

    this.resize();

    switch (value)
      {
        case 0 :
          oauthEndPointField.setFocus();
          break;
        case 1 :
          j2cAliasField.setFocus();
          break;
        case 2 :
          s2sTokeyKeyField.setFocus();
          break;
        case 3 :
        default:
          break;
      }
  }

  private void updateOauth(boolean visible)
  {
    GridData oauthdata = (GridData) oauthPanel.getLayoutData();
    oauthdata.exclude = !visible;
    oauthPanel.setVisible(visible);
  }

  private void updateJ2CAlias(boolean visible)
  {
    GridData j2cdata = (GridData) j2cAliasPanel.getLayoutData();
    j2cdata.exclude = !visible;
    j2cAliasPanel.setVisible(visible);
  }

  private void updateS2SToken(boolean visible)
  {
    GridData s2sdata = (GridData) s2sTokenPanel.getLayoutData();
    s2sdata.exclude = !visible;
    s2sTokenPanel.setVisible(visible);
  }

  private void updateAsUser(boolean visible)
  {
    GridData asuserdata = (GridData) asUserPanel.getLayoutData();
    asuserdata.exclude = !visible;
    asUserPanel.setVisible(visible);
  }

  private void showCMISOrRest()
  {
    boolean isRest = (repositoryTypeCombo.getSelectionIndex() == 1);

    GridData cmisdata = (GridData) cmisPanel.getLayoutData();
    cmisdata.exclude = isRest;
    cmisPanel.setVisible(!isRest);

    GridData restdata = (GridData) restPanel.getLayoutData();
    restdata.exclude = !isRest;
    restPanel.setVisible(isRest);
    if (isRest)
    {
      metaUrlField.setFocus();
    }
    else
    {
      atomUrlField.setFocus();
    }

    this.showRestSet();
    this.resize();
  }

  private void showRestSet()
  {
    boolean isRest = (repositoryTypeCombo.getSelectionIndex() == 1);
    GridData restSetData = (GridData) restSetPanel.getLayoutData();
    boolean visible = isRest && docsInstalled;
    restSetData.exclude = !visible;
    restSetPanel.setVisible(visible);
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
    gdmsg.verticalIndent = vIndent + 2;
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

  private Combo createCombo(Composite parent, String tooltip)
  {
    Combo widget = new Combo(parent, SWT.SINGLE | SWT.BORDER | SWT.READ_ONLY);
    if (tooltip != null && !"".equals(tooltip)) //$NON-NLS-1$
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = 200;
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
  private void verifyComplete(boolean validate, final boolean async)
  {
    Map<String, String> map = new HashMap<String, String>();

    int indexr = repositoryTypeCombo.getSelectionIndex();
    String repoType = repotypes[indexr];
    map.put(Constants.EXTERNAL_REPOSITORY_TYPE, repoType);

    String atomUrl = this.atomUrlField.getText().trim();
    map.put(Constants.EXTERNAL_CMIS_ATOM_PUB, atomUrl);

    String objectStore = this.objectStoreField.getText().trim();
    map.put(Constants.EXTERNAL_OBJECT_STORE, objectStore);

    String metaUrl = this.metaUrlField.getText().trim();
    map.put(Constants.EXTERNAL_META_URL, metaUrl);

    String getUrl = this.getUrlField.getText().trim();
    map.put(Constants.EXTERNAL_GET_CONTENT_URL, getUrl);

    String setUrl = this.setUrlField.getText().trim();
    if (docsInstalled)
    {
      map.put(Constants.EXTERNAL_SET_CONTENT_URL, setUrl);
    }
    map.put(Constants.SD_DOCS_INSTALLED, (docsInstalled ? "true" : "false"));

    int index = authCombo.getSelectionIndex();
    String authMethod = authtypes[index];
    map.put(Constants.EXTERNAL_S2S_METHOD, authMethod);

    String oauth = this.oauthEndPointField.getText().trim();
    map.put(Constants.EXTERNAL_OAUTH_ENDPOINT, oauth);

    String j2c_alias = this.j2cAliasField.getText().trim();
    map.put(Constants.EXTERNAL_J2C_ALIAS, j2c_alias);

    String tokenKey = this.s2sTokeyKeyField.getText().trim();
    map.put(Constants.EXTERNAL_TOKEN_KEY, tokenKey);

    String tokenValue = this.s2sTokeyValueField.getText().trim();
    map.put(Constants.EXTERNAL_S2S_TOKEN, tokenValue);

    String asUser = this.asUserField.getText().trim();
    map.put(Constants.EXTERNAL_AS_USER_KEY, asUser);

    String userProfile = this.userProfilesField.getText().trim();
    map.put(Constants.EXTERNAL_PROFILES_URL, userProfile);

    String repoHome = this.repoHomeField.getText().trim();
    map.put(Constants.EXTERNAL_REPOSITORY_HOME, repoHome);

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    IStatus dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);

    if (dataJobsStatus.isOK())
    {
      // *** Save the user's input in the profile
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.EXTERNAL_CMIS_ATOM_PUB, atomUrl, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_OBJECT_STORE, objectStore, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_META_URL, metaUrl, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_GET_CONTENT_URL, getUrl, OFFERING_ID);
      if (docsInstalled)
      {
        profile.setOfferingUserData(Constants.EXTERNAL_SET_CONTENT_URL, setUrl, OFFERING_ID);
      }

      profile.setOfferingUserData(Constants.EXTERNAL_S2S_METHOD, authMethod, OFFERING_ID);

      profile.setOfferingUserData(Constants.EXTERNAL_OAUTH_ENDPOINT, oauth, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_J2C_ALIAS, j2c_alias, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_TOKEN_KEY, tokenKey, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_S2S_TOKEN, tokenValue, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_AS_USER_KEY, asUser, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_PROFILES_URL, userProfile, OFFERING_ID);
      profile.setOfferingUserData(Constants.EXTERNAL_REPOSITORY_HOME, repoHome, OFFERING_ID);
      // Docs' call back url
      StringBuffer sb = new StringBuffer();
      String docs_url = profile.getOfferingUserData(Constants.DOCS_URL, OFFERING_ID);
      if (docs_url == null || docs_url.equals(""))
        docs_url = "https://abc.com/docs";
      sb.append(docs_url).append("/driverscallback");
      profile.setOfferingUserData(Constants.DOCS_CALL_BACK_URL, sb.toString(), OFFERING_ID);
      // Viewer's call back url
      StringBuffer vsb = new StringBuffer();
      String viewer_url = profile.getOfferingUserData(Constants.VIEWER_URL, OFFERING_ID);
      if (viewer_url == null || viewer_url.equals(""))
        viewer_url = "https://abc.com/viewer";
      vsb.append(viewer_url).append("/driverscallback");
      profile.setOfferingUserData(Constants.VIEWER_CALL_BACK_URL, vsb.toString(), OFFERING_ID);

      String custom_id = getDomainName(atomUrl, metaUrl);
      profile.setOfferingUserData(Constants.EXTERNAL_CUSTOMER_ID, custom_id, OFFERING_ID);

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

  private String getDomainName(String atomUrl, String metaUrl)
  {
    try
    {
      if (atomUrl != null && !"".equals(atomUrl))
      {
        URL url = new URL(atomUrl);
        return url.getHost();
      }
      else if (metaUrl != null && !"".equals(metaUrl))
      {
        URL url = new URL(metaUrl);
        return url.getHost();
      }
    }
    catch (MalformedURLException e)
    {
      e.printStackTrace();
    }
    return "";
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
