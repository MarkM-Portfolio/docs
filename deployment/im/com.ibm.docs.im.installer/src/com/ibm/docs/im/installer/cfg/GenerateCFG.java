/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.cfg;

import java.io.File;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.jface.dialogs.IMessageProvider;
import org.eclipse.osgi.util.NLS;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Label;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.docs.im.installer.common.ui.AbstractCustomConfigPanel;
import com.ibm.docs.im.installer.common.ui.PanelStatusListener;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;

public class GenerateCFG extends AbstractCustomConfigPanel implements PanelStatusListener
{
  private Composite topContainer;

  private Composite convContainer;

  private Composite docsContainer;

  private Composite viewerContainer;

  private Composite docsProxyContainer;

  private Composite docsExtContainer;

  private Composite viewerExtContainer;

  private Label convCfg;

  private Label convNodeCfg;

  private Label docsCfg;

  private Label docsNodeCfg;

  private Label viewerCfg;

  private Label docsProxyCfg;

  private Label docsExtCfg;

  private Label viewerExtCfg;

  private boolean bNeedGenerateCfg = false;
  
  private boolean bListenedPanelStatus = false;
 
  private String tempCfgPath = null;

  public GenerateCFG()
  {
    super(Messages.getString("PanelName$GenerationCFG")); //$NON-NLS-1$
    PanelStatusManagementService.register(this);
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
    if (bNeedGenerateCfg && tempCfgPath!=null)
    {
      // Generate or re-generate cfg.properties/cfg.node.properties
      try
      {        
        IMUtil.storeAllUserData(this.getCustomPanelData().getProfile(),tempCfgPath);
        setErrorMessage(null);        
        if (this.getCustomPanelData().getProfile().getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID)==null)
          setMessage(Messages.getString("Message_Configuration_Generation$msg1"), IMessageProvider.INFORMATION);
        else
          setMessage(Messages.getString("Message_Configuration_Generation$msg0"), IMessageProvider.INFORMATION);
        
        if (bNeedGenerateCfg)
          bNeedGenerateCfg = false;
        
        this.setPageComplete(true);
      }
      catch (Exception e)
      {
        // TODO Auto-generated catch block
        setErrorMessage(Messages.getString("Message_Configuration_Generation$msg3"));
        this.setPageComplete(false);
        e.printStackTrace();
      }
    }
    else if (!bListenedPanelStatus)
    {
      setErrorMessage(Messages.getString("Message_Configuration_Generation$msg2"));      
      this.setPageComplete(false);
    }

    boolean bConv = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.CONVERSION_ID);
    boolean bDoc = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_ID);
    boolean bViewer = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_ID);
    boolean bDocsProxy = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOCS_PROXY_ID);
    boolean bDocsExt = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.DOC_EXT_ID);
    boolean bViewerExt = IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.VIEWER_EXT_ID);
    

    if (bConv)
    {
      updateUI(convContainer, true);
      
      if (convCfg == null)
        convCfg = this.createPlainLabel(convContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
      if (convNodeCfg == null)
        convNodeCfg = this.createPlainLabel(convContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$    

      if (bListenedPanelStatus)
      {
        setLebel(convCfg, Constants.CONV_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, true);
        setLebel(convNodeCfg, Constants.CONV_SRC_DIR, Constants.CONFIG_NODE_PROPERTIES_FILE, true);
      }
      else
      {
        setLebel(convCfg, Constants.CONV_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, false);
        setLebel(convNodeCfg, Constants.CONV_SRC_DIR, Constants.CONFIG_NODE_PROPERTIES_FILE, false);
      }
    }
    else
    {
      updateUI(convContainer, false);
    }

    if (bDoc)
    {
      updateUI(docsContainer, true);
      
      if (docsCfg == null)
        docsCfg = this.createPlainLabel(docsContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
      if (docsNodeCfg == null)
        docsNodeCfg = this.createPlainLabel(docsContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$    
      if (bListenedPanelStatus)
      {
        setLebel(docsCfg, Constants.DOCS_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, true);
        setLebel(docsNodeCfg, Constants.DOCS_SRC_DIR, Constants.CONFIG_NODE_PROPERTIES_FILE, true);
      }
      else
      {
        setLebel(docsCfg, Constants.DOCS_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, false);
        setLebel(docsNodeCfg, Constants.DOCS_SRC_DIR, Constants.CONFIG_NODE_PROPERTIES_FILE, false);
      }
    }
    else
    {
      updateUI(docsContainer, false);
    }

    if (bViewer)
    {
      updateUI(viewerContainer, true);
      
      if (viewerCfg == null)
        viewerCfg = this.createPlainLabel(viewerContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$

      if (bListenedPanelStatus)
      {
        setLebel(viewerCfg, Constants.VIEWER_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, true);
      }
      else
      {
        setLebel(viewerCfg, Constants.VIEWER_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, false);
      }
    }
    else
    {
      updateUI(viewerContainer, false);
    }

    if (bDocsProxy)
    {
      updateUI(docsProxyContainer, true);
      
      if (docsProxyCfg == null)
        docsProxyCfg = this.createPlainLabel(docsProxyContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$      
      if (bListenedPanelStatus)
      {
        setLebel(docsProxyCfg, Constants.DOCS_PROXY_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, true);
      }
      else
      {
        setLebel(docsProxyCfg, Constants.DOCS_PROXY_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, false);
      }
    }
    else
    {
      updateUI(docsProxyContainer, false);
    }

    if (bDocsExt)
    {
      updateUI(docsExtContainer, true);
      
      if (docsExtCfg == null)
        docsExtCfg = this.createPlainLabel(docsExtContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
      if (bListenedPanelStatus)
      {
        setLebel(docsExtCfg, Constants.DOCS_EXT_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, true);
      }
      else
      {
        setLebel(docsExtCfg, Constants.DOCS_EXT_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, false);
      }
    }
    else
    {
      updateUI(docsExtContainer, false);
    }

    if (bViewerExt)
    {
      updateUI(viewerExtContainer, true);
      
      if (viewerExtCfg == null)
        viewerExtCfg = this.createPlainLabel(viewerExtContainer, "", false, VINDENT_PANEL_DEFAULT, 0); //$NON-NLS-1$
      if (bListenedPanelStatus)
      {
        setLebel(viewerExtCfg, Constants.VIEWER_EXT_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, true);
      }
      else
      {
        setLebel(viewerExtCfg, Constants.VIEWER_EXT_SRC_DIR, Constants.CONFIG_PROPERTIES_FILE, false);
      }
    }
    else
    {
      updateUI(viewerExtContainer, false);
    }

    
    if (bNeedGenerateCfg)
      bNeedGenerateCfg = false;

    resize();   
    
    return false;
  }

  private void setLebel(Label control, String compPath, String cfgName, boolean bCfg)
  {
    if (control == null || compPath == null || cfgName == null)
      return;

    StringBuffer labelStr = new StringBuffer();
    if (bCfg)
    {
      //String installationPath = this.getCustomPanelData().getProfile().getInstallLocation();
      if (tempCfgPath != null)
      {
        labelStr.append(tempCfgPath).append(File.separator).append(compPath).append(File.separator).append(Constants.COMP_INSTALL_DIR)
            .append(File.separator).append(cfgName);
      }
      else
      {
        labelStr.append(NLS.bind(Messages.getString("Message_Configuration_Generation$generalLabel"), cfgName));
      }
    }
    else
    {
      labelStr.append(NLS.bind(Messages.getString("Message_Configuration_Generation$generalLabel"), cfgName));
    }

    control.setText(labelStr.toString());
  }

  private void updateUI(Composite container, boolean bVisible)
  {
    if (container.getVisible()!=bVisible)
    {
      GridData data = (GridData) container.getLayoutData();
      data.exclude = !bVisible;
      container.setVisible(bVisible);
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
    tempCfgPath = (new StringBuffer())
        .append(System.getProperty("user.home"))
        .append(File.separator)
        .append("ibm.connections.docs").toString();
    if (this.getCustomPanelData().getProfile().getOfferingUserData(Constants.TEMP_CFG_PATH, OFFERING_ID)!=null)
      this.getCustomPanelData().getProfile().removeUserData((new StringBuilder(String.valueOf(Constants.TEMP_CFG_PATH))).append(',').append(OFFERING_ID).toString());
    
    this.getCustomPanelData().getProfile().setOfferingUserData(Constants.TEMP_CFG_PATH,tempCfgPath,OFFERING_ID);
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
    convContainer = createPanel(parent);
    this.createBoldLabel(convContainer, Messages.getString("Message_NodeIdentificationPanel_Conv$label"), NONE_VINDENT, 1); //$NON-NLS-1$

    docsContainer = createPanel(parent);
    this.createBoldLabel(docsContainer, Messages.getString("Message_NodeIdentificationPanel_Docs$label"), NONE_VINDENT, 1); //$NON-NLS-1$

    viewerContainer = createPanel(parent);
    this.createBoldLabel(viewerContainer, Messages.getString("Message_NodeIdentificationPanel_Viewer$label"), NONE_VINDENT, 1); //$NON-NLS-1$

    docsProxyContainer = createPanel(parent);
    this.createBoldLabel(docsProxyContainer, Messages.getString("Message_NodeIdentificationPanel_Proxy$label"), NONE_VINDENT, 1); //$NON-NLS-1$

    docsExtContainer = createPanel(parent);
    this.createBoldLabel(docsExtContainer, Messages.getString("Message_Configuration_Generation$DocsExt"), NONE_VINDENT, 1); //$NON-NLS-1$

    viewerExtContainer = createPanel(parent);
    this.createBoldLabel(viewerExtContainer, Messages.getString("Message_Configuration_Generation$ViewerExt"), NONE_VINDENT, 1); //$NON-NLS-1$
  }

  private Composite createPanel(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(1, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 1, 1);
    panel.setLayoutData(data);

    return panel;
  }

  private void resize()
  {
    Control control = this.getControl();
    if (control != null)
    {
      Point size = control.getSize();
      Point newSize = new Point(size.x + 1, size.y + 1);
      control.setSize(newSize);
      control.redraw();
    }
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

  private Label createBoldLabel(Composite parent, String message, int vIndent, int fontHeight)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = PanelUtil.createBoldLabel(parent, toolkit, message);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 1, 1);
    if (vIndent > 0)
    {
      gd.verticalIndent = vIndent;
    }
    label.setLayoutData(gd);
    PanelUtil.setFont(label, fontHeight);
    return label;
  }

  @Override
  public void statusUpdate()
  {
    // TODO Auto-generated method stub
    boolean bStatus = PanelStatusManagementService.getInstance().getCompletedStatus();
    if (bListenedPanelStatus != bStatus)
    {
      if (!bListenedPanelStatus)
        bNeedGenerateCfg = true;
      
      bListenedPanelStatus = bStatus;
    }
  }
  
  @Override
  public void forceUpdate()
  {
    bNeedGenerateCfg = true;
  }}
