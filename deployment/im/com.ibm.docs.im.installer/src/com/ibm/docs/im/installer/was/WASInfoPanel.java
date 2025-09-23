/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.was;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Vector;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.core.runtime.Platform;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.IJobChangeEvent;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.core.runtime.jobs.JobChangeAdapter;
import org.eclipse.jface.dialogs.IMessageProvider;
import org.eclipse.jface.operation.IRunnableWithProgress;
import org.eclipse.jface.operation.ModalContext;
import org.eclipse.osgi.util.NLS;
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.DirectoryDialog;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.eclipse.ui.forms.widgets.FormToolkit;
import org.eclipse.ui.progress.UIJob;

import com.ibm.cic.agent.core.api.IAgent;
import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ILogLevel;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.ui.extensions.ICustomPanelData;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.ui.AbstractCustomConfigPanel;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.NodeID;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.DynamicImageViewer;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;
import com.ibm.docs.im.installer.util.PythonCheck;
import com.ibm.docs.im.installer.util.PythonCheck.PythonInfo;
import com.ibm.docs.im.installer.util.VersionCheck;
import com.ibm.docs.im.installer.util.VersionCheck.VersionEnv;
import com.ibm.docs.im.installer.util.WasConfigService;

/**
 * For more information, refer to: http://capilanobuild.swg.usma.ibm.com:9999/help /topic/com.ibm.cic.dev.doc/html/extendingIM/main.html
 * http://capilanobuild.swg .usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc .isv/reference/api/agentui
 * /com/ibm/cic/agent/ui/extensions/BaseWizardPanel.html http://capilanobuild.swg .usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc
 * .isv/reference/api/agentui/com/ibm/cic/agent/ui/extensions/CustomPanel.html
 * 
 */
public class WASInfoPanel extends AbstractCustomConfigPanel
{

  private static final ILogger logger = IMLogger.getLogger(WASInfoPanel.class.getCanonicalName());

  private Text wasAdmin;

  private Text wasAdminPW;

  private Text wasInstallRoot;

  private Button validateBtn;

  private IStatus dataJobsStatus;

  private DynamicImageViewer canvas;

  enum WASEnv {
    NONE, NONE_DMGR, IC_SERVICES_UNAVAILABLE, OK
  };

  private WASEnv setVarsSucceed = WASEnv.NONE;

  private VersionEnv versionStatus = null;
  
  private PythonInfo pythonStatus = null;
  
  private PythonCheck pythonCheck = null;

  private Map<VersionEnv, Map<String, String>> errorMap = null;

  private String MSG_WAS_Env = null;

  // NodeID => hostname:ostype:nodetype:nodename:USER_INSTALL_ROOT
  private Map<NodeID, String> nodeListInfo = new HashMap<NodeID, String>();

  private boolean bReset4Upgrade = false;

  /**
   * Default constructor
   */
  public WASInfoPanel()
  {
    super(Messages.PanelName$WASInfoPanel); // NON-NLS-1
    PanelStatusManagementService.add(this);
  }

  /**
   * TODO: Implement this method
   * 
   * @param parent
   *          Parent composite. A top level composite to hold the UI components being created is already created createControl(Composite)
   *          method. In this method, create only those UI components that need to be placed on this panel.
   * 
   * @param toolkit
   *          Use the toolkit to create UI components.
   */
  private void createPanelControls(final Composite parent, FormToolkit toolkit)
  {

    //this.createBoldLabel(parent, Messages.getString("Message_WASInfoPanel_Top$label1"), 0, 1); //$NON-NLS-1$
    this.createPlainLabel(parent, Messages.getString("Message_WASInfoPanel_Top$label2"), false, NONE_VINDENT, 0); //$NON-NLS-1$

    Label labelForText = this.createPlainLabel(parent, Messages.getString("Message_WASInfoPanel_Admin$dmgrLabel"), false, NONE_VINDENT, 0); //$NON-NLS-1$

    this.wasAdmin = createText(parent, "", "", 200, SWT.SINGLE | SWT.BORDER); //$NON-NLS-1$
    this.wasAdmin.setMessage(Messages.getString("DatabasePanel_USERNAME")); //$NON-NLS-1$	
    PanelUtil.registerAccRelation(labelForText, this.wasAdmin);

    labelForText = this.createPlainLabel(parent, Messages.getString("Message_WASInfoPanel_AdminPwd$dmgrLabel"), false, VINDENT_DEFAULT, 0); //$NON-NLS-1$
    this.wasAdminPW = createText(parent, "", "", 200, SWT.SINGLE | SWT.BORDER | SWT.PASSWORD); //$NON-NLS-1$
    this.wasAdminPW.setMessage(Messages.getString("DatabasePanel_PASSWORD")); //$NON-NLS-1$	
    PanelUtil.registerAccRelation(labelForText, this.wasAdminPW);

    //this.createBoldLabel(parent, Messages.getString("Message_WASInfoPanel_General$label"), VINDENT_DEFAULT, 1); //$NON-NLS-1$
    labelForText = this.createPlainLabel(parent, Messages.getString("Message_WASInfoPanel_WASInstallRoot$dirLabel"), false,
        VINDENT_DEFAULT, 0);
    this.createPlainLabel(parent, Messages.getString("Message_WASInfoPanel_WASInstallRoot$dsc"), true, NONE_VINDENT, 0);

    this.wasInstallRoot = toolkit.createText(parent, "", SWT.SINGLE | SWT.BORDER); //$NON-NLS-1$
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 1, 1);
    gd.widthHint = 400;
    gd.verticalIndent = 2;
    this.wasInstallRoot.setLayoutData(gd);
    PanelUtil.registerAccRelation(labelForText, this.wasInstallRoot);
    this.wasInstallRoot.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete(false, false);
      }
    });

    Button browse = new Button(parent, SWT.PUSH);
    browse.setText(Messages.Message_WASInfoPanel_WASInstallRootBrowser$Label);
    GridData browseGridData = new GridData(GridData.BEGINNING, GridData.CENTER, true, false, 1, 1);
    browse.setLayoutData(browseGridData);
    browse.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent event)
      {
        String dirName = new DirectoryDialog(parent.getShell()).open();
        if (dirName != null)
        {
          wasInstallRoot.setText(dirName);
        }
      }
    });

    Composite vComp = createPanel(parent);
    validateBtn = toolkit.createButton(vComp, Messages.Message_WASInfoPanel_Validate$label, SWT.PUSH);
    GridData gdText = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
    gdText.minimumWidth = 120;
    validateBtn.setLayoutData(gdText);
    validateBtn.setEnabled(false);
    validateBtn.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        setErrorMessage(null);
        setMessage(Messages.Message_WASInfoPanel_Validating$msg, IMessageProvider.INFORMATION);
        validateBtn.setEnabled(false);
        canvas.setVisible(true);
        verifyComplete(true, true);
      }
    });
    canvas = PanelUtil.createLoadingImg(vComp);
    canvas.setVisible(false);
  }

  private Composite createPanel(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    data.verticalIndent = VINDENT_DEFAULT;
    panel.setLayoutData(data);
    return panel;
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

  private Text createText(Composite parent, String defaultValue, String tooltip, int widthHint, int style)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Text widget = toolkit.createText(parent, defaultValue, style);
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

  /**
   * TODO: Implement this method
   * 
   * This method will initialize the values of the panel if a profile already exists. A profile exists if (1) the user provides an input
   * response file or (2) the panel is being displayed during the modify, update, or uninstall flow.
   */
  @Override
  public void setInitialData()
  {
    IProfile iProfile = getCustomPanelData().getProfile();
    IAgentJob[] jobs = getCustomPanelData().getAllJobs();
    IAgent iAgent = getCustomPanelData().getAgent();
  
    if (iProfile != null)
    {    
      
      String installationRoot = iProfile.getInstallLocation();
      
      String configFileConversion  = null;
      String configFileConversionNode  = null;
      boolean shouldLoadPropertiesConversion = false;
      
      String configFileDocs  = null;
      String configFileDocsNode  = null;
      boolean shouldLoadPropertiesDocs = false;

      String configFileViewer  = null;
      boolean shouldLoadPropertiesViewer = false;      
      
      String configFileDocsExt  = null;
      boolean shouldLoadPropertiesDocsExt = false;      
      
      String configFileViewerExt  = null;
      boolean shouldLoadPropertiesViewerExt = false;     
      
      String configFileProxy = null;
      boolean shouldLoadPropertiesProxy = false;     
      
      boolean fix107IgnoreEventIssue = false;
    
     if(jobs != null)
     {
       if(jobs[0].isUpdate())
       {
         // only upgrade from 106 will load old properties, other upgrade will load value from installed profile
         if( IMUtil.isUpgradeFromVersion(jobs, iAgent, iProfile, Constants.VERSION_106))
         {
           if (IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMCONVERSION))
           {
             shouldLoadPropertiesConversion = true;
             configFileConversion = installationRoot + File.separator + Constants.CONV_LOCAL_DIR + File.separator + Constants.CONFIG_NODE_PROPERTIES_FILE;
           }
           
           if (IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMDOCS))
           {
             shouldLoadPropertiesDocs = true;
             configFileDocs = installationRoot + File.separator + Constants.DOCS_LOCAL_DIR + File.separator + Constants.CONFIG_NODE_PROPERTIES_FILE;                         
           }
           
           if(IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMVIEWER))
           {
             shouldLoadPropertiesViewer = true;
             configFileViewer = installationRoot + File.separator + Constants.VIEWER_LOCAL_DIR + File.separator
                 + Constants.CONFIG_PROPERTIES_FILE;      
             
             shouldLoadPropertiesViewerExt = true;
             configFileViewerExt = installationRoot + File.separator + Constants.VIEWER_EXT_LOCAL_DIR + File.separator
                 + Constants.CONFIG_PROPERTIES_FILE;               
           }
           if (IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMDOCSPROXY))
           {
             shouldLoadPropertiesProxy = true;
             configFileProxy = (new StringBuffer()).append(installationRoot).append(File.separator).append(Constants.DOCS_PROXY_LOCAL_DIR)
                 .append(File.separator).append(Constants.DOCS_PROXY_SUB_DIR).append(File.separator).append(Constants.CONFIG_PROPERTIES_FILE)
                 .toString();                         
           }
           if (IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMDOCEXT))
           {            
             shouldLoadPropertiesDocsExt = true;            
             configFileDocsExt = installationRoot + File.separator + Constants.DOCS_EXT_LOCAL_DIR + File.separator
                 + Constants.CONFIG_PROPERTIES_FILE;            
           }                               
         }  
         
         if( IMUtil.isUpgradeFromVersion(jobs, iAgent, iProfile, Constants.VERSION_107))
         {
           if (IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMDOCEXT))
           {            
             shouldLoadPropertiesDocsExt = true;            
             configFileDocsExt = installationRoot + File.separator + Constants.DOCS_EXT_LOCAL_DIR + File.separator
                 + Constants.CONFIG_PROPERTIES_FILE;            
           }      
           
           if(IMUtil.isFeatureInstalled(jobs, iAgent, iProfile, Constants.IBMVIEWER))
           {             
             shouldLoadPropertiesViewerExt = true;
             configFileViewerExt = installationRoot + File.separator + Constants.VIEWER_EXT_LOCAL_DIR + File.separator
                 + Constants.CONFIG_PROPERTIES_FILE;               
           }
           fix107IgnoreEventIssue = true;
         }         
       }
       else if(jobs[0].isInstall())
       {
         String defaultConfigDirectoryPath = (new StringBuffer()).append(System.getProperty("user.home")).append(File.separator).append("ibm.connections.docs").toString();
         File defaultConfigDirectory = new File(defaultConfigDirectoryPath);
         

         if( defaultConfigDirectory.exists() && defaultConfigDirectory.isDirectory() )
         {
           String pathTemplate = (new StringBuffer()).append(defaultConfigDirectoryPath)
               .append(File.separator).append("%s").append(File.separator)
               .append("installer").append(File.separator).append(Constants.CONFIG_PROPERTIES_FILE).toString();
           String pathTemplateNode = (new StringBuffer()).append(defaultConfigDirectoryPath)
               .append(File.separator).append("%s").append(File.separator)
               .append("installer").append(File.separator).append(Constants.CONFIG_NODE_PROPERTIES_FILE).toString();
           
               
           if (IMUtil.isFeatureSelected(jobs, Constants.IBMCONVERSION))
           {
             shouldLoadPropertiesConversion = true;
             configFileConversion = String.format(pathTemplate, Constants.CONV_SRC_DIR);
             configFileConversionNode = String.format(pathTemplateNode, Constants.CONV_SRC_DIR);
           }   
           if (IMUtil.isFeatureSelected(jobs, Constants.IBMDOCS))
           {
             shouldLoadPropertiesDocs = true;
             configFileDocs = String.format(pathTemplate, Constants.DOCS_SRC_DIR);       
             configFileDocsNode = String.format(pathTemplateNode, Constants.DOCS_SRC_DIR);       
           }          
           if (IMUtil.isFeatureSelected(jobs, Constants.IBMVIEWER))
           {
             shouldLoadPropertiesViewer = true;
             configFileViewer = String.format(pathTemplate, Constants.VIEWER_SRC_DIR);            
           }                  
           if (IMUtil.isFeatureSelected(jobs, Constants.IBMVIEWEREXT))
           {
             shouldLoadPropertiesViewerExt = true;
             configFileViewerExt = String.format(pathTemplate, Constants.VIEWER_EXT_SRC_DIR);            
           }          
           if (IMUtil.isFeatureSelected(jobs, Constants.IBMDOCSPROXY))
           {
             shouldLoadPropertiesProxy = true;
             configFileProxy = String.format(pathTemplate, Constants.DOCS_PROXY_SRC_DIR);            
           }
           if (IMUtil.isFeatureSelected(jobs, Constants.IBMDOCEXT))
           {
             shouldLoadPropertiesDocsExt = true;
             configFileDocsExt = String.format(pathTemplate, Constants.DOCS_EXT_SRC_DIR);            
           }             
           
         }         
       }
     }     

        
      if(shouldLoadPropertiesConversion)
      {          
        try
        {
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_CONV_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_CONVERSION_SHARED_DATA_ROOT_REMOTE, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_DOCS_SHARED_STORAGE_REMOTE_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_VIEWER_SHARED_STORAGE_REMOTE_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_CONVERSION_SHARED_DATA_ROOT_REMOTE_VIEWER, "\\", "/");          
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_VIEWER_SHARED_STORAGE_LOCAL_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_VIEWER_SHARED_DATA_NAME, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_DOCS_SHARED_STORAGE_LOCAL_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversion, Constants.PROP_KEY_CONVERSION_SHARED_DATA_ROOT, "\\", "/");

          IMUtil.replaceStringByStr(configFileConversionNode, Constants.PROP_KEY_CONV_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileConversionNode, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");
        
          IMUtil.loadUserData(Constants.IBMCONVERSION, configFileConversion, iProfile);
          IMUtil.readOneProperty2Profile(configFileConversionNode, iProfile, 
              Constants.PROP_KEY_CONV_INSTALL_ROOT, Constants.CONV_INSTALL_LOCATION, "", Constants.OFFERING_ID);
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      
      if (shouldLoadPropertiesDocs)
      {
        
        try
        {
          IMUtil.replaceStringByStr(configFileDocs, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileDocs, Constants.PROP_KEY_DOCS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileDocs, Constants.PROP_KEY_DB_JDBC_DRIVER_PATH, "\\", "/");

          IMUtil.replaceStringByStr(configFileDocsNode, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileDocsNode, Constants.PROP_KEY_DOCS_INSTALL_ROOT, "\\", "/");

          IMUtil.loadUserData(Constants.IBMDOCS, configFileDocs, iProfile);
          IMUtil.readOneProperty2Profile(configFileDocsNode, iProfile, 
              Constants.PROP_KEY_DOCS_INSTALL_ROOT, Constants.DOCS_INSTALL_LOCATION, "", Constants.OFFERING_ID);          
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }

      if (shouldLoadPropertiesViewer)
      {
        try
        {
          IMUtil.replaceStringByStr(configFileViewer, Constants.PROP_KEY_VIEWER_FILES_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileViewer, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileViewer, Constants.PROP_KEY_VIEWER_INSTALL_ROOT, "\\", "/");          
          IMUtil.loadUserData(Constants.IBMVIEWER, configFileViewer, iProfile);
          

        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      
      if( shouldLoadPropertiesViewerExt )
      {                    
        try
        {
          IMUtil.replaceStringByStr(configFileViewerExt, Constants.PROP_KEY_EXT_IC_EXT_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileViewerExt, Constants.PROP_KEY_EXT_DEAMON_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileViewerExt, Constants.PROP_KEY_EXT_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileViewerExt, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");          
          if( fix107IgnoreEventIssue )
          {
            IMUtil.readOneProperty2Profile(configFileViewerExt, iProfile, 
                Constants.PROP_KEY_ENABLE_UPLOAD_CONVERSION, Constants.VIEWER_EXT_IGNORE_EVENT, "", Constants.OFFERING_ID);
          }
          else
          {
            IMUtil.loadUserData(Constants.IBMVIEWEREXT, configFileViewerExt, iProfile);
          }
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
     
      }
      // Docs Proxy
      if (shouldLoadPropertiesProxy)
      {
        try
        {          
          IMUtil.replaceStringByStr(configFileProxy, Constants.PROP_KEY_DOCS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileProxy, Constants.PROP_KEY_WAS_PROXY_INSTALL_ROOT, "\\", "/");
          IMUtil.loadUserData(Constants.IBMDOCSPROXY, configFileProxy, iProfile);
        }
        catch (IOException e)
        {  
          e.printStackTrace();
        }
      }
      
      // Docs Ext
      if (shouldLoadPropertiesDocsExt)
      {
        try
        {
          IMUtil.replaceStringByStr(configFileDocsExt, Constants.PROP_KEY_WAS_INSTALL_ROOT, "\\", "/");
          IMUtil.replaceStringByStr(configFileDocsExt, Constants.PROP_KEY_EXT_IC_EXT_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileDocsExt, Constants.PROP_KEY_EXT_DEAMON_PATH, "\\", "/");
          IMUtil.replaceStringByStr(configFileDocsExt, Constants.PROP_KEY_EXT_INSTALL_ROOT, "\\", "/");
          
          
          if( fix107IgnoreEventIssue )
          {
            IMUtil.readOneProperty2Profile(configFileDocsExt, iProfile, 
                Constants.PROP_KEY_IGNORE_EVENT, Constants.DOCS_EXT_IGNORE_EVENT, "", Constants.OFFERING_ID);
          }
          else
          {
            IMUtil.loadUserData(Constants.IBMDOCEXT, configFileDocsExt, iProfile);
          }          
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      
      // init some consts
      iProfile.setOfferingUserData(Constants.FILES_SCOPE, Constants.TOPOLOGY_CLUSTER, OFFERING_ID);
      
      String wasProfile = iProfile.getOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, OFFERING_ID);
      
      String admin = iProfile.getOfferingUserData(Constants.WASADMIN, OFFERING_ID);
      if (admin != null && admin.trim().length() > 0)
      {
        this.wasAdmin.setText(admin.trim());
      }

      String adminPW = iProfile.getOfferingUserData(Constants.PASSWORD_OF_WASADMIN, OFFERING_ID);
      if (adminPW != null && adminPW.trim().length() > 0)
      {
        adminPW = EncryptionUtils.decrypt(adminPW);
        this.wasAdminPW.setText(adminPW.trim());
      }
      
      if (wasProfile != null && wasProfile.trim().length() > 0)
      {
        this.wasInstallRoot.setText(wasProfile.trim());
      }

      verifyComplete(false, false);
    }
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
   * TODO: Implement this method
   * 
   * This private method is responsible for performing the validation of the widgets on this panel and, either, displaying an error message
   * or setting the page to complete. This method should be called by a widget's listener to reevaluate the completeness of the page when a
   * change is made to the widget's value.
   */
  private void verifyComplete(boolean validate, final boolean async)
  {
    final Map<String, String> map = new LinkedHashMap<String, String>();
    // Note: order matters within the map as the order in which they are
    // inserted controls the
    // order in which the validators are called.

    // The following are validated
    String admin = this.wasAdmin.getText().trim();
    map.put(Constants.WASADMIN, admin);

    String adminPW = this.wasAdminPW.getText().trim();
    map.put(Constants.PASSWORD_OF_WASADMIN, EncryptionUtils.encrypt(adminPW));

    String profileDir = this.wasInstallRoot.getText().trim();
    map.put(Constants.LOCAL_WAS_INSTALL_ROOT, profileDir);

    if (validate)
    {
      map.put(Constants.COLLECT_WAS_INFORMATION_PANEL, Constants.PANEL_STATUS_OK);
    }
    else
    {
      map.put(Constants.COLLECT_WAS_INFORMATION_PANEL, Constants.PANEL_STATUS_FAILED);
    }

    final ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();

    IProfile profile = data.getProfile();
    if (profile != null)
    {
      // map.put(Constants.SOAP_PORT,profile.getOfferingUserData(Constants.SOAP_PORT,
      // OFFERING_ID));
      // map.put(Constants.NODE_HOST_LIST,profile.getOfferingUserData(Constants.NODE_HOST_LIST,
      // OFFERING_ID));
    }

    final IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    if (async)
    {
      final Job validatingJob = new Job(Messages.Message_WASInfoPanel_Validating$label)
      {
        protected IStatus run(IProgressMonitor monitor)
        {
          dataJobsStatus = WASInfoPanel.this.getAgent().validateOfferingUserData(myOffering, map);
          return Status.OK_STATUS;
        }
      };
      validatingJob.addJobChangeListener(new JobChangeAdapter()
      {
        public void done(IJobChangeEvent e)
        {
          validated(data, dataJobsStatus, map, async);
        }
      });
      validatingJob.schedule();
    }
    else
    {
      dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);
      validated(data, dataJobsStatus, map, async);
    }
  }

  /**
   * @see com.ibm.cic.agent.ui.extensions.BaseWizardPanel#performFinish(org.eclipse.core.runtime.IProgressMonitor)
   */
  @Override
  public IStatus performFinish(IProgressMonitor monitor)
  {
    return Status.OK_STATUS;
  }

  /**
   * @see com.ibm.cic.agent.ui.extensions.CustomPanel#createControl(org.eclipse.swt.widgets.Composite)
   */
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

  private void validated(final ICustomPanelData data, final IStatus dataJobsStatus, final Map<String, String> dataMap, boolean async)
  {
    if (dataJobsStatus.isOK())
    {
      final IProfile profile = data.getProfile();

      profile.setOfferingUserData(Constants.WASADMIN, dataMap.get(Constants.WASADMIN), OFFERING_ID);
      profile.setOfferingUserData(Constants.PASSWORD_OF_WASADMIN, dataMap.get(Constants.PASSWORD_OF_WASADMIN), OFFERING_ID);
      profile.setOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, dataMap.get(Constants.LOCAL_WAS_INSTALL_ROOT), OFFERING_ID);
      profile.setOfferingUserData(Constants.KEY_FOR_EMPTY_VALUE, "", OFFERING_ID);
      profile.setOfferingUserData(Constants.DOCS_CONTEXT_ROOT, "/docs", OFFERING_ID);
      

      new UIJob("") //$NON-NLS-1$
      {
        public IStatus runInUIThread(IProgressMonitor monitor)
        {
          if (Boolean.valueOf(dataMap.get(Constants.COLLECT_WAS_INFORMATION_PANEL)))
          {

            if (!WASInfoPanel.this.isDisposed())
            {
              // Update button and dynamic image
              if (!validateBtn.isDisposed())
              {
                validateBtn.setEnabled(false);
                canvas.setVisible(true);
              }
              errorMap = null; // clean the error map
              final boolean isUpgraded = IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE);
              try
              {
                ModalContext.run(new IRunnableWithProgress()
                {
                  public void run(IProgressMonitor monitor) throws InvocationTargetException, InterruptedException
                  {
                    pythonStatus = null;
                    if (Platform.OS_WIN32.equals(Platform.getOS()))
                    {
                      pythonCheck = new PythonCheck();                      
                      pythonStatus = pythonCheck.validate();
                      if (pythonStatus != PythonInfo.OK)
                      {                        
                        ModalContext.checkCanceled(monitor);
                        return;
                      }
                    }
                    
                    if (isUpgraded)
                    {
                      VersionCheck checker = new VersionCheck(data);
                      versionStatus = checker.validate();
                      if (versionStatus != VersionEnv.OK)
                      {
                        errorMap = checker.getErrors();
                        ModalContext.checkCanceled(monitor);
                        return;
                      }
                    }
                    else
                    {
                      versionStatus = VersionEnv.OK;
                    }
                    
                    // To configure wanted variables
                    setVarsSucceed = setInstallVars(dataMap, profile);
                    ModalContext.checkCanceled(monitor);
                  }
                }, true, new NullProgressMonitor(), Display.getCurrent());
              }
              catch (InvocationTargetException e)
              {
                if ( Platform.OS_WIN32.equals(Platform.getOS()) && !PythonCheck.getPythonFound() && pythonStatus==null)
                { 
                  pythonStatus = PythonInfo.OSPATH;
                  PythonCheck.setPythonFound(true);
                }
                setVarsSucceed = WASEnv.NONE;
              }
              catch (InterruptedException e)
              {
                setVarsSucceed = WASEnv.NONE;
              }
              // Update button, dynamic image, message and complete status
              if (!WASInfoPanel.this.isDisposed())
              {
                if (versionStatus == VersionEnv.ERROR)
                {
                  if (errorMap != null)
                  {
                    setErrorMessage(VersionCheck.getErrorMessages(errorMap));
                    validateBtn.setEnabled(true);
                    canvas.setVisible(false);
                    return Status.OK_STATUS;
                  }

                }
                if (pythonStatus!=null && pythonStatus!=PythonInfo.OK)
                {
                  setErrorMessage(pythonCheck.getErrorMessages(pythonStatus));
                  validateBtn.setEnabled(true);
                  canvas.setVisible(false);
                  return Status.OK_STATUS;
                }
                  
                if (setVarsSucceed == WASEnv.NONE)
                {
                  setErrorMessage(Messages.getString("Message_WASInfoPanel_ValidationQueryData$msg2"));
                  validateBtn.setEnabled(true);
                  canvas.setVisible(false);
                }
                else if (setVarsSucceed == WASEnv.NONE_DMGR)
                {
                  setErrorMessage(Messages.getString("Message_WASInfoPanel_NoneDmgr$msg"));
                  validateBtn.setEnabled(true);
                  canvas.setVisible(false);
                }
                else if (setVarsSucceed == WASEnv.IC_SERVICES_UNAVAILABLE)
                {
                  setErrorMessage(MSG_WAS_Env);
                  validateBtn.setEnabled(true);
                  canvas.setVisible(false);
                }
                else
                {
                  validateBtn.setEnabled(false);
                  canvas.setVisible(false);
                  setErrorMessage(null);
                  setMessage(Messages.Message_WASInfoPanel_ValidationSuccessful$msg, IMessageProvider.INFORMATION);
                  WasConfigService.doService();
                  setPageComplete(true);
                  PanelStatusManagementService.statusNotify();
                }
              }
            }
          }
          else
          {
            if (!WASInfoPanel.this.isDisposed())
            {
              validateBtn.setEnabled(true);
              canvas.setVisible(false);
              setErrorMessage(Messages.Message_WASInfoPanel_Validate$Tips);
              setPageComplete(false);
              PanelStatusManagementService.statusNotify();
            }
          }
          return Status.OK_STATUS;
        }
      }.schedule();
    }
    else
    {
      new UIJob("") //$NON-NLS-1$
      {
        public IStatus runInUIThread(IProgressMonitor monitor)
        {
          if (!WASInfoPanel.this.isDisposed())
          {
            setErrorMessage(dataJobsStatus.getMessage());
            setPageComplete(false);
            validateBtn.setEnabled(true);
            canvas.setVisible(false);
            PanelStatusManagementService.statusNotify();
          }
          return Status.OK_STATUS;
        }
      }.schedule();
    }

  }

  private WASEnv setInstallVars(final Map<String, String> dataMap, final IProfile profile)
  {
    // *** Determine if this is an install or a install_node based on
    // whether or not the application
    // *** was previously installed or not.
    WASEnv bRet = WASEnv.OK;
    {
      String profilePath = dataMap.get(Constants.LOCAL_WAS_INSTALL_ROOT);
      String adminName = dataMap.get(Constants.WASADMIN);
      String adminPwd = dataMap.get(Constants.PASSWORD_OF_WASADMIN);
      adminPwd = EncryptionUtils.decrypt(adminPwd);

      try
      {
        // Constants.TOPOLOGY_CLUSTER;
        ICustomPanelData data = this.getCustomPanelData();
        if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_INSTALL))
        {
          String apps[] = { Constants.IC_COMMON, Constants.IC_FILES, Constants.IC_NEWS };
          String scriptPath = IMUtil.getScriptsPath(data.getProfile());
          Map<String, String> envInfo = Util.getDeploymentEnvInfo(adminName, adminPwd, profilePath, apps, scriptPath);
          if (!isDmgr(envInfo.get("dmgrNode")))
            return WASEnv.NONE_DMGR;
          setDmgrSoap(envInfo.get("SOAP"), profile);
          setSameCellWithIC(envInfo.get("SameCellWithIC"), profile);
          setNodesInfo(envInfo.get("NODE_HOST"), profile);
          setLocalHostInfo(envInfo.get("LOCAL_HOST"), profile);
          setCellName(envInfo.get("CellName"), profile);

          // achieve IBM Connections cluster info through Common,Files and News
          parseICAppClusterInfo(envInfo.get("ClusterInfo"), profile);

          if (IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCONNECTIONS)
              || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMCCM)
              || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMICECM)
              || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMICCCMECM))
            if (IMUtil.isSameCellWithIC(profile) && !isICServicesStatus(envInfo.get("ICServices")))
              return WASEnv.IC_SERVICES_UNAVAILABLE;
        }
        else if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE)
            && (IMUtil.isUpgradeFromVersion(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.VERSION_105) || IMUtil
                .isUpgradeFromVersion(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.VERSION_106)))
        {
          String apps[] = { Constants.IDOCS_CONVERSION_APP, Constants.IDOCS_DOCS_APP, Constants.IDOCS_VIEWER_APP, Constants.IC_COMMON,
              Constants.IC_FILES, Constants.IC_NEWS };
          String scriptPath = IMUtil.getScriptsPath(data.getProfile());
          Map<String, String> envInfo = Util.getDeploymentEnvInfo(adminName, adminPwd, profilePath, apps, scriptPath);
          if (!isDmgr(envInfo.get("dmgrNode")))
            return WASEnv.NONE_DMGR;
          setDmgrSoap(envInfo.get("SOAP"), profile);
          setSameCellWithIC(envInfo.get("SameCellWithIC"), profile);
          setNodesInfo(envInfo.get("NODE_HOST"), profile);
          setLocalHostInfo(envInfo.get("LOCAL_HOST"), profile);
          setCellName(envInfo.get("CellName"), profile);

          if (IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCONNECTIONS)
              || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMCCM)
              || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMICECM)
              || IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), Constants.IBMICCCMECM))
            if (IMUtil.isSameCellWithIC(profile) && !isICServicesStatus(envInfo.get("ICServices")))
              return WASEnv.IC_SERVICES_UNAVAILABLE;

          // app:::cluster::node,server:node,server:node,server:...
          String appcluster = getAppClusterInfo(envInfo.get("ClusterInfo"), profile, Constants.IDOCS_CONVERSION_APP);
          // cluster::node,server:node,server:node,server;
          if (appcluster != null)
          {
            String[] cluster = appcluster.split(Constants.SEPARATE_SUB_SUB_CHARS);
            String[] clusterServers = cluster[1].split(Util.LIST_SUB_SEPRATOR);
            String nodeInfo = "";
            for (String cServer : clusterServers)
            {
              String[] nodeServers = cServer.split(",");
              if (nodeInfo.isEmpty())
              {

                nodeInfo = nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER,nodeServers[0],Constants.APPLICATION_SERVER)) + Constants.SEPARATE_SUB_SUB_CHARS + nodeServers[1]
                    + Constants.SEPARATE_SUB_SUB_CHARS + cluster[0];
              }
              else
              {

                nodeInfo = nodeInfo + Util.LIST_SEPRATOR + nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER,nodeServers[0],Constants.APPLICATION_SERVER)) + Constants.SEPARATE_SUB_SUB_CHARS + nodeServers[1]
                    + Constants.SEPARATE_SUB_SUB_CHARS + cluster[0];
              }
            }
            // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
            profile.setUserData(Constants.CONV_NODES, "");
            profile.setOfferingUserData(Constants.CONV_NODES, nodeInfo, OFFERING_ID);
          }
          appcluster = getAppClusterInfo(envInfo.get("ClusterInfo"), profile, Constants.IDOCS_DOCS_APP);
          if (appcluster != null)
          {
            String[] cluster = appcluster.split(Constants.SEPARATE_SUB_SUB_CHARS);
            String[] clusterServers = cluster[1].split(Util.LIST_SUB_SEPRATOR);
            String nodeInfo = "";
            for (String cServer : clusterServers)
            {
              String[] nodeServers = cServer.split(",");
              if (nodeInfo.isEmpty())
              {
                nodeInfo = nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER,nodeServers[0],Constants.APPLICATION_SERVER)) + Constants.SEPARATE_SUB_SUB_CHARS + nodeServers[1]
                    + Constants.SEPARATE_SUB_SUB_CHARS + cluster[0];
              }
              else
              {
                nodeInfo = nodeInfo + Util.LIST_SEPRATOR + nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER,nodeServers[0],Constants.APPLICATION_SERVER)) + Constants.SEPARATE_SUB_SUB_CHARS + nodeServers[1]
                    + Constants.SEPARATE_SUB_SUB_CHARS + cluster[0];
              }
            }
            // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
            profile.setUserData(Constants.DOCS_NODES, "");
            profile.setOfferingUserData(Constants.DOCS_NODES, nodeInfo, OFFERING_ID);
          }
          appcluster = getAppClusterInfo(envInfo.get("ClusterInfo"), profile, Constants.IDOCS_VIEWER_APP);
          if (appcluster != null)
          {
            String[] cluster = appcluster.split(Constants.SEPARATE_SUB_SUB_CHARS);
            String[] clusterServers = cluster[1].split(Util.LIST_SUB_SEPRATOR);
            String nodeInfo = "";
            for (String cServer : clusterServers)
            {
              String[] nodeServers = cServer.split(",");
              if (nodeInfo.isEmpty())
              {
                nodeInfo = nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER,nodeServers[0],Constants.APPLICATION_SERVER)) + Constants.SEPARATE_SUB_SUB_CHARS + nodeServers[1]
                    + Constants.SEPARATE_SUB_SUB_CHARS + cluster[0];
              }
              else
              {
                nodeInfo = nodeInfo + Util.LIST_SEPRATOR + nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER,nodeServers[0],Constants.APPLICATION_SERVER)) + Constants.SEPARATE_SUB_SUB_CHARS + nodeServers[1]
                    + Constants.SEPARATE_SUB_SUB_CHARS + cluster[0];
              }
            }
            // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
            profile.setUserData(Constants.VIEWER_NODES, "");
            profile.setOfferingUserData(Constants.VIEWER_NODES, nodeInfo, OFFERING_ID);
          }

          // achieve IBM Connections cluster info through Common,Files and News
          parseICAppClusterInfo(envInfo.get("ClusterInfo"), profile);
        }
        // ****************************************************************/
      }
      catch (IOException e)
      {
        logger.log(ILogLevel.ERROR, "Check if application was installed failed. {0}", e); // NON-NLS-1
        // Note: Tolerate and assume this is the first install in the
        // cluster and full cluster install is required
      }
      catch (InterruptedException e)
      {
        logger.log(ILogLevel.ERROR, "Check if application was installed failed. {0}", e); // NON-NLS-1
        // Note: Tolerate and assume this is the first install in the
        // cluster and full cluster install is required
      }

      profile.setUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, "");
      profile.setOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, dataMap.get(Constants.COLLECT_WAS_INFORMATION_PANEL),
          OFFERING_ID);
    }

    return bRet;
  }

  public boolean isDmgr(String dmgrInfo)
  {
    if (dmgrInfo == null)
      return false;

    boolean bRet = true;

    if (!Boolean.valueOf(dmgrInfo))
    {
      // setErrorMessage(Messages.getString("Message_WASInfoPanel_NoneDmgr$msg"));
      bRet = false;
    }

    return bRet;
  }

  public void setDmgrSoap(String soapInfo, IProfile profile)
  {
    if (soapInfo != null && profile != null)
    {
      int soapPort = Integer.valueOf(soapInfo);
      if (soapPort > 0)
      {
        // *** Set the status message for cluster node type of install
        profile.setOfferingUserData(Constants.SOAP_PORT, String.valueOf(soapPort), OFFERING_ID);
      }
    }
  }

  public void setSameCellWithIC(String sameCellIC, IProfile profile)
  {
    if (sameCellIC != null && profile != null)
    {
      profile.setOfferingUserData(Constants.SAME_CELL_WITH_IC, sameCellIC, OFFERING_ID);
    }
  }

  public void setCellName(String cellname, IProfile profile)
  {
    if (cellname == null || profile == null)
      return;

    profile.setUserData(Constants.CELL_NAME, "");
    profile.setOfferingUserData(Constants.CELL_NAME, cellname, OFFERING_ID);
  }

  public void setNodesInfo(String nodesInfo, IProfile profile)
  {
    if (nodesInfo == null || profile == null)
      return;

    // NODE_HOST::::hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::;
    String[] nodes_hosts = nodesInfo.split(Util.LIST_SEPRATOR);
    for (String node_host : nodes_hosts)
    {
      // nodehostlist.append(node_host).append(Util.LIST_SEPRATOR);
      Vector<String> nodeInfoV = IMUtil.parseListString(node_host, Constants.SEPARATE_SUB_SUB_CHARS);
      String[] nodeInfoArr = new String[nodeInfoV.size()];
      nodeInfoV.toArray(nodeInfoArr);
      nodeListInfo.put(new NodeID(Constants.NONE_CLUSTER,nodeInfoArr[3],nodeInfoArr[2]), node_host);
    }
    profile.setOfferingUserData(Constants.NODE_HOST_LIST, nodesInfo, OFFERING_ID);
  }

  public void setLocalHostInfo(String hostInfo, IProfile profile)
  {
    if (hostInfo == null || profile == null)
      return;
    // String[] rets = hostInfo.split(Constants.SEPARATE_CHARS);

    // if (rets.length > 0 )
    {
      profile.setUserData(Constants.LOCAL_HOST_NAME, "");
      profile.setOfferingUserData(Constants.LOCAL_HOST_NAME, hostInfo, OFFERING_ID);
    }
  }

  public boolean isICServicesStatus(String icServicesInfo)
  {
    if (icServicesInfo == null)
      return false;

    // Files:false/true;Common:false/true;News:false/true
    String[] services = icServicesInfo.split(Util.LIST_SEPRATOR);
    String sRet = null;
    for (String service : services)
    {
      String[] serviceInfo = service.split(Util.LIST_SUB_SEPRATOR);
      if (serviceInfo.length > 1 && !Boolean.valueOf(serviceInfo[1]))
      {
        if (sRet == null)
        {
          sRet = serviceInfo[0];
        }
        else
        {
          sRet = sRet + "," + serviceInfo[0];
        }
      }
    }
    if (sRet != null)
    {
      // setErrorMessage(NLS.bind(Messages.getString("Message_WASInfoPanel_ICServicesStatus"), sRet));
      MSG_WAS_Env = NLS.bind(Messages.getString("Message_WASInfoPanel_ICServicesStatus$msg"), sRet);
      return false;
    }

    return true;
  }

  public String getAppClusterName(String appsInfo, IProfile profile, String appName)
  {

    if (appsInfo == null || profile == null || appName == null)
      return null;

    String clustername = null;
    // app:::cluster::node,server:node,server:node,server:...
    String[] appsInfoArr = appsInfo.split(Util.LIST_SEPRATOR);
    for (String appInfo : appsInfoArr)
    {
      String[] appArr = appInfo.split(Constants.SEPARATE_SUB_CHARS);
      if (appArr[0].equalsIgnoreCase(appName))
      {
        String[] clusterInfo = appArr[1].split(Constants.SEPARATE_SUB_SUB_CHARS);
        clustername = clusterInfo[0];
      }
    }

    return clustername;
  }

  public String getAppClusterInfo(String appsInfo, IProfile profile, String appName)
  {

    if (appsInfo == null || profile == null || appName == null)
      return null;

    String clusterInfo = null;
    // app:::cluster::node,server:node,server:node,server:...
    String[] appsInfoArr = appsInfo.split(Util.LIST_SEPRATOR);
    for (String appInfo : appsInfoArr)
    {
      String[] appArr = appInfo.split(Constants.SEPARATE_SUB_CHARS);
      if (appArr[0].equalsIgnoreCase(appName))
      {
        clusterInfo = appArr[1];
      }
    }

    return clusterInfo;
  }

  public void parseICAppClusterInfo(String appClusterInfo, IProfile profile)
  {
    if (appClusterInfo == null || profile == null)
      return;
    // app:::cluster::node,server:node,server:node,server:...
    String appcluster = getAppClusterInfo(appClusterInfo, profile, Constants.IC_COMMON);
    // cluster::node,server:node,server:node,server:...
    if (appcluster != null)
    {
      String[] cluster = appcluster.split(Constants.SEPARATE_SUB_SUB_CHARS);
      profile.setUserData(Constants.IC_COMMON_CLUSTER, "");
      profile.setOfferingUserData(Constants.IC_COMMON_CLUSTER, cluster[0], OFFERING_ID);

      profile.setOfferingUserData(Constants.IC_COMMON_CLUSTER_INFO, Constants.IC_COMMON + Constants.SEPARATE_SUB_CHARS + appcluster,
          OFFERING_ID);
    }
    appcluster = getAppClusterInfo(appClusterInfo, profile, Constants.IC_FILES);
    if (appcluster != null)
    {
      String[] cluster = appcluster.split(Constants.SEPARATE_SUB_SUB_CHARS);
      profile.setUserData(Constants.IC_FILES_CLUSTER, "");
      profile.setOfferingUserData(Constants.IC_FILES_CLUSTER, cluster[0], OFFERING_ID);

      profile.setOfferingUserData(Constants.IC_FILES_CLUSTER_INFO, Constants.IC_FILES + Constants.SEPARATE_SUB_CHARS + appcluster,
          OFFERING_ID);
    }
    appcluster = getAppClusterInfo(appClusterInfo, profile, Constants.IC_NEWS);
    if (appcluster != null)
    {
      String[] cluster = appcluster.split(Constants.SEPARATE_SUB_SUB_CHARS);
      profile.setUserData(Constants.IC_NEWS_CLUSTER, "");
      profile.setOfferingUserData(Constants.IC_NEWS_CLUSTER, cluster[0], OFFERING_ID);

      profile.setOfferingUserData(Constants.IC_NEWS_CLUSTER_INFO, Constants.IC_NEWS + Constants.SEPARATE_SUB_CHARS + appcluster,
          OFFERING_ID);
    }
  }

  public boolean shouldSkip()
  {
    IProfile iProfile = getCustomPanelData().getProfile();
    IAgentJob[] jobs = getCustomPanelData().getAllJobs();
    IAgent iAgent = getCustomPanelData().getAgent();
    if (!bReset4Upgrade
        && jobs != null
        && jobs[0].isUpdate()
        && (IMUtil.isUpgradeFromVersion(jobs, iAgent, iProfile, Constants.VERSION_105) || IMUtil.isUpgradeFromVersion(jobs, iAgent,
            iProfile, Constants.VERSION_106)))
    {
      // Reset status of panels
      String status = iProfile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, OFFERING_ID);
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        iProfile.setOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
      status = iProfile.getOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, OFFERING_ID);
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        iProfile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
      status = iProfile.getOfferingUserData(Constants.ENROLL_HOST_PANEL, OFFERING_ID);
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        iProfile.setOfferingUserData(Constants.ENROLL_HOST_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);

      bReset4Upgrade = true;
    }

    this.writeInfoForScript();
    
    if(PanelStatusManagementService.isSelectedFeaturesChanged(jobs[0].getFeaturesArray()))
      PanelStatusManagementService.force();      
    
    return false;
  }

  public void writeInfoForScript()
  {
    IProfile profile = getCustomPanelData().getProfile();
    String[] elements = { Constants.CONVERSION_ID, Constants.DOCS_ID, Constants.VIEWER_ID, Constants.DOCS_PROXY_ID, Constants.DOC_EXT_ID, Constants.VIEWER_EXT_ID };
    String componentList = "";
    for (String s : elements)
    {
      if (IMUtil.isFeatureSelected(this.getCustomPanelData().getAllJobs(), s))
      {
        componentList += "," + s;
      }
    }
    if (!componentList.isEmpty())
    {
      profile.setOfferingUserData(Constants.COMPONENT_LIST, componentList.substring(1), OFFERING_ID);
    }
    ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] jobs = data.getAllJobs();

    profile.setOfferingUserData(Constants.DEPLOY_TYPE, IMUtil.getDeployType(jobs), OFFERING_ID);
    String offeringVersion = IMUtil.getOfferingVersion(jobs, data.getAgent(), profile);
    profile.setOfferingUserData(Constants.OFFERING_VERSION, offeringVersion, OFFERING_ID);

  }

}
