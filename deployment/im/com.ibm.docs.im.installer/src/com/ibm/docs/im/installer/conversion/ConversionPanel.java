/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.conversion;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Spinner;
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

public class ConversionPanel extends AbstractCustomConfigPanel
{
  // private static final ILogger logger = IMLogger.getLogger(ConversionPanel.class.getCanonicalName());

  //private static final String DEFAULT_CONV_INSTALL_LOC = "C:/Program Files/IBM/IBMConversion"; // NON-NLS-1 //$NON-NLS-1$
  
  private boolean dataInitialed = false;

  private static final String DEFAULT_CONV_PORT = "8100"; // NON-NLS-1 //$NON-NLS-1$

  private static final String DEFAULT_CPU_NUMBER = "4"; // NON-NLS-1 //$NON-NLS-1$

  private Text conversionLocText;

  private Spinner cpuNumberSpinner;

  private Text portText;

  public ConversionPanel()
  {
    super(Messages.getString("MSG_CONVERSION_NODE_NAME")); //$NON-NLS-1$
  }

  @Override
  public void createControl(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite topContainer = toolkit.createComposite(parent);
    topContainer.setLayout(new GridLayout(2, false));
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));
    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);

  }

  public boolean shouldSkip()
  {
    boolean conversionInstalled = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.CONVERSION_ID);
    
    if (conversionInstalled)
      PanelStatusManagementService.add(this);
    else
      PanelStatusManagementService.remove(this);
    
    return !conversionInstalled;
  }

  /*
   * @type if type equals 0, it is plain font style, else if type equals 1, it is bold font style
   */
  private Label createPlainLabel(Composite parent, String message, boolean keepSpace, boolean isExample, int fontHeight)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = toolkit.createLabel(parent, message, SWT.WRAP);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = 400;
    if (keepSpace)
    {
      gd.verticalIndent = VINDENT_DEFAULT;
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

  private Text createText(Composite parent, String defaultValue, String tooltip, int widthHint)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, SWT.SINGLE | SWT.BORDER); //$NON-NLS-1$
    if (tooltip != null && !"".equals(tooltip))
      widget.setToolTipText(tooltip);
    GridData gd = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    gd.widthHint = widthHint;
    widget.setLayoutData(gd);
    widget.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete();
      }
    });
    return widget;
  }

  protected void createPanelControls(final Composite panel, final FormToolkit toolkit)
  {

    //    this.createBoldLabel(panel, Messages.getString("ConversionPanel.CONF_PROP"), false, 1); //$NON-NLS-1$
    Label labelForText = this.createPlainLabel(panel, Messages.getString("ConversionPanel.INSTALL_LOC_DESC"), true, false, 0); //$NON-NLS-1$ 
    this.createPlainLabel(panel, Messages.getString("ConversionPanel.INSTALL_LOC_EXAMPLE"), false, true, 0); //$NON-NLS-1$ 
    this.conversionLocText = this.createText(panel, "", "", 320); //$NON-NLS-1$ 
    PanelUtil.registerAccRelation(labelForText, this.conversionLocText);

    labelForText = this.createPlainLabel(panel, Messages.getString("MSG_CONVERSION_INSTANCE_NUMBER"), true, false, 0); //$NON-NLS-1$
    this.createPlainLabel(panel, Messages.getString("MSG_CONVERSION_CPU_NUMBER"), false, false, 0); //$NON-NLS-1$
    this.cpuNumberSpinner = new Spinner(panel, SWT.BORDER | SWT.READ_ONLY);
    this.cpuNumberSpinner.setMinimum(1);
    this.cpuNumberSpinner.setMaximum(100);
    this.cpuNumberSpinner.setIncrement(1);
    this.cpuNumberSpinner.setLayoutData(new GridData(SWT.LEFT, SWT.BEGINNING, true, false));
    this.cpuNumberSpinner.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete();
      }
    });
    PanelUtil.registerAccRelation(labelForText, this.cpuNumberSpinner);

    labelForText = this.createPlainLabel(panel, Messages.getString("MSG_CONVERSION_STARTING_PORT"), true, false, 0); //$NON-NLS-1$
    this.createPlainLabel(panel, Messages.getString("MSG_CONVERSION_STARTING_PORT_HINT"), false, false, 0); //$NON-NLS-1$
    this.portText = this.createText(panel, DEFAULT_CONV_PORT, "", 176); //$NON-NLS-1$
    PanelUtil.registerAccRelation(labelForText, this.portText);

  }

  public IStatus performFinish(IProgressMonitor monitor)
  {
    return super.performFinish(monitor);
  }

  public IStatus performCancel(IProgressMonitor monitor)
  {
    return super.performCancel(monitor);
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
      String connLoc = profile.getOfferingUserData(Constants.CONV_INSTALL_LOCATION, OFFERING_ID);
      String cpuNumber = profile.getOfferingUserData(Constants.CONV_CPU_NUMBER, OFFERING_ID);
      String port = profile.getOfferingUserData(Constants.CONV_START_PORT, OFFERING_ID);
      dataInitialed = true;
      
      if (connLoc != null && connLoc.trim().length() > 0)
      {
        this.conversionLocText.setText(connLoc.trim());
      }      
      if (cpuNumber != null && cpuNumber.trim().length() > 0)
      {
        this.cpuNumberSpinner.setSelection(Integer.parseInt(cpuNumber.trim()));
      }
      else
      {
        this.cpuNumberSpinner.setSelection(Integer.parseInt(DEFAULT_CPU_NUMBER));
      }      
      if (port != null && port.trim().length() > 0)
      {
        this.portText.setText(port.trim());
      }
      verifyComplete();
    }
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

    String connLoc = this.conversionLocText.getText().trim();
    map.put(Constants.CONV_INSTALL_LOCATION, connLoc);

    String cpuNumber = this.cpuNumberSpinner.getText().trim();
    map.put(Constants.CONV_CPU_NUMBER, cpuNumber);

    String port = this.portText.getText().trim();
    map.put(Constants.CONV_START_PORT, port);

    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    IStatus dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);

    if (dataJobsStatus.isOK()&& dataInitialed)
    {
      // *** Save the user's input in the profile
      IProfile profile = data.getProfile();
      profile.setOfferingUserData(Constants.CONV_INSTALL_LOCATION, connLoc, OFFERING_ID);
      profile.setOfferingUserData(Constants.CONV_CPU_NUMBER, cpuNumber, OFFERING_ID);
      profile.setOfferingUserData(Constants.CONV_START_PORT, port, OFFERING_ID);

      profile.setOfferingUserData(Constants.CONV_SCOPE, Constants.TOPOLOGY_CLUSTER, OFFERING_ID);      
      profile.setOfferingUserData(Constants.CONV_NODE_NAME, "", OFFERING_ID);
      profile.setOfferingUserData(Constants.CONV_WEBSERVER_NAME, "", OFFERING_ID);
      profile.setOfferingUserData(Constants.SOFTWARE_MODE, Constants.CONV_DEPLOY_TYPE_ONPREMISE, OFFERING_ID);

      profile.setUserData(Constants.CONV_INSTALL_LOCATION, connLoc);
      profile.setUserData(Constants.CONV_CPU_NUMBER, cpuNumber);
      profile.setUserData(Constants.CONV_START_PORT, port);

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
}
