/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.im.installer.was;

import java.io.IOException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.swt.SWT;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.ui.forms.events.HyperlinkAdapter;
import org.eclipse.ui.forms.events.HyperlinkEvent;
import org.eclipse.ui.forms.widgets.FormToolkit;
import org.eclipse.ui.forms.widgets.Hyperlink;
import com.ibm.cic.agent.core.api.ILogLevel;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.docs.im.installer.common.ui.AbstractConfigurationPanel;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelStatusManagementService;
import com.ibm.docs.im.installer.util.PanelUtil;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.events.SelectionListener;

/**
 * For more information, refer to: http://capilanobuild.swg.usma.ibm.com:9999/help /topic/com.ibm.cic.dev.doc/html/extendingIM/main.html
 * http://capilanobuild.swg .usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc
 * .isv/reference/api/agentui/com/ibm/cic/agent/ui/extensions/ BaseWizardPanel.html
 * http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com .ibm.cic.agent.ui.doc.isv/reference/api/agentui/com/ibm/cic/
 * agent/ui/extensions/CustomPanel.html
 *
 */
public class PreCheckPanel extends AbstractConfigurationPanel
{
  private static final ILogger logger = IMLogger.getLogger(PreCheckPanel.class.getCanonicalName());

  private static String IC_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/install_ibm_connections.html";

  private static String OS_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/operating_system_configuration.html";

  private static String PYTHON_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/installing_python.html";

  private static String WAS_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/installing_ibm_websphere_application_server.html";

  private static String NFS_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/config_docs_shared_storage_container.html";

  private static String DB_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/preparing_the_ibmdocs_database_infrastructure.html";

  private static String LANG_DEPLOYMENT_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/install_additional_language_packs.html";

  private static String GUIDE_URL = "https://help.hcltechsw.com/docs/v2.0.1/onprem/install_guide/guide/text/overview.html";

  private Button uacBtn;
  /**
   * Default constructor
   */
  public PreCheckPanel()
  {
    super(Messages.getString("PanelName$PreCheckPanel")); // NON-NLS-1
    PanelStatusManagementService.clean();
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
  protected void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    // TODO: Use this method to create controls inside the parent.
    this.createPlainLabel(parent, Messages.getString("Message_PrecheckPanel_Top$label"), true); //$NON-NLS-1$
    this.createBoldLabel(parent, Messages.getString("Message_PrecheckPanel_Label$label"), false); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item1$desc"), IC_DEPLOYMENT_URL); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item2$desc"), OS_DEPLOYMENT_URL); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item3$desc"), PYTHON_DEPLOYMENT_URL); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item4$desc"), WAS_DEPLOYMENT_URL); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item5$desc"), NFS_DEPLOYMENT_URL); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item6$desc"), DB_DEPLOYMENT_URL); //$NON-NLS-1$
    this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_item7$desc"), LANG_DEPLOYMENT_URL); //$NON-NLS-1$
    //this.createPlainLabel(parent, Messages.getString("Message_PrecheckPanel_bottom1$desc"), true, 2); //$NON-NLS-1$
    //this.createLink(parent, toolkit, Messages.getString("Message_PrecheckPanel_bottom2$desc"), url, 1); //$NON-NLS-1$
    Label label = toolkit.createLabel(parent, Messages.getString("Message_PrecheckPanel_bottom1$desc"));
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 1, 1);
    label.setLayoutData(gd);
    Hyperlink link = toolkit.createHyperlink(parent, Messages.getString("Message_PrecheckPanel_bottom2$desc"), SWT.WRAP); //$NON-NLS-1$
    gd = new GridData(GridData.FILL, GridData.BEGINNING, true, false, 1, 1);
    link.setLayoutData(gd);
    link.addHyperlinkListener(new HyperlinkAdapter()
    {
      public void linkActivated(HyperlinkEvent e)
      {
        try
        {
          String OS = System.getProperty("os.name").toLowerCase();
          if (OS != null && OS.indexOf("linux") >= 0)
          {
            String[] browsers = { "firefox", "opera", "konqueror", "epiphany", "mozilla", "netscape" };
            String browser = null;
            for (int count = 0; count < browsers.length && browser == null; count++)
            {
              if (Runtime.getRuntime().exec(new String[] { "which", browsers[count] }).waitFor() == 0)
              {
                browser = browsers[count];
              }
            }
            if (browser != null)
            {
              Runtime.getRuntime().exec(new String[] { browser, GUIDE_URL });
            }
          }
          else
          {
            Runtime.getRuntime().exec("cmd.exe /c start " + GUIDE_URL);
          }
        }
        catch (IOException ex)
        {
          logger.log(ILogLevel.ERROR, "Can not open the link", ex); // NON-NLS-1
        }
        catch (InterruptedException e1)
        {
          // TODO Auto-generated catch block
          e1.printStackTrace();
        }
      }
    });

    this.createBoldLabel(parent, Messages.getString("Message_PrecheckPanel_UAC$label"), false); //$NON-NLS-1$
    uacBtn = toolkit.createButton(parent, Messages.getString("Message_PrecheckPanel_UACClosed$label"), SWT.CHECK);
    uacBtn.setSelection(false);
    uacBtn.addSelectionListener(new SelectionListener()
    {
		@Override
		public void widgetDefaultSelected(SelectionEvent e) {
			// TODO Auto-generated method stub

		}

		@Override
		public void widgetSelected(SelectionEvent e) {
			if (uacBtn.getSelection())
				setPageComplete(true);
			else
				setPageComplete(false);
		}
    });
  }

  private void createBoldLabel(Composite parent, String message, boolean keepSpace)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = PanelUtil.createBoldLabel(parent, toolkit, message);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 1, 1);
    if (keepSpace)
    {
      gd.verticalIndent = 20;
    }
    label.setLayoutData(gd);
  }

  private void createPlainLabel(Composite parent, String message, boolean keepSpace)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Label label = toolkit.createLabel(parent, message, SWT.WRAP);
    GridData gd = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 1, 1);
    gd.widthHint = 400;
    if (keepSpace)
    {
      gd.verticalIndent = 10;
    }
    label.setLayoutData(gd);
  }

  private void createLink(final Composite parent, FormToolkit toolkit, String msg, final String url)
  {
    final Hyperlink advancedLink = toolkit.createHyperlink(parent, msg, SWT.WRAP); //$NON-NLS-1$
    GridData gd = new GridData(GridData.FILL, GridData.BEGINNING, true, false, 1, 1);
    gd.horizontalIndent = 20;
    advancedLink.setLayoutData(gd);
    advancedLink.addHyperlinkListener(new HyperlinkAdapter()
    {
      public void linkActivated(HyperlinkEvent e)
      {
        try
        {
          String OS = System.getProperty("os.name").toLowerCase();
          if (OS != null && OS.indexOf("linux") >= 0)
          {
            String[] browsers = { "firefox", "opera", "konqueror", "epiphany", "mozilla", "netscape" };
            String browser = null;
            for (int count = 0; count < browsers.length && browser == null; count++)
            {
              if (Runtime.getRuntime().exec(new String[] { "which", browsers[count] }).waitFor() == 0)
              {
                browser = browsers[count];
              }
            }
            if (browser != null)
            {
              Runtime.getRuntime().exec(new String[] { browser, url });
            }
          }
          else
          {
            Runtime.getRuntime().exec("cmd.exe /c start " + url);
          }
        }
        catch (IOException ex)
        {
          logger.log(ILogLevel.ERROR, "Can not open the link", ex); // NON-NLS-1
        }
        catch (InterruptedException e1)
        {
          // TODO Auto-generated catch block
          e1.printStackTrace();
        }
      }
    });
  }

  public boolean shouldSkip()
  {
    return false;
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
	this.setPageComplete(false);
	if (!checkPython())
	{
		setErrorMessage(Messages.getString("Message_PrecheckPanel_PythonCheckFailed"));
		this.setPageComplete(false);
		uacBtn.setEnabled(false);
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
    /*
     * Create a new composite where all of the widgets in our panel will be added to.
     */
    Composite topContainer = toolkit.createComposite(parent);

    /*
     * The layout of a composite is very important and defines how widgets will be organized when added to the composite. A GridLayout is
     * very commonly used and adds UI elements left-to-right in columns. The declaration below indicates that the UI elements will be layed
     * out in two columns.
     *
     * You can read about layouts here: http://www.eclipse.org/articles/article .php?file=Article-Understanding-Layouts/index.html
     *
     * You can also refer to the java documentation for the specific layout you choose to understand how to configure it.
     */
    GridLayout gl = new GridLayout(1, false);
    topContainer.setLayout(gl);
    /*
     * The parent composite uses a GridLayout. This call is telling the layout for the parent composite to lay the top container out such
     * that it fills all of the available horizontal and vertical space and grabs all available horizontal and vertical space.
     */
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));

    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);
  }

  private boolean checkPython()
  {
	  try
	  {
		  Process p = Runtime.getRuntime().exec("python --version");
		  if (p != null)
		  {
			  p.waitFor();
			  return true;
		  }
	  }
	  catch(Exception e)
	  {
		  logger.log(ILogLevel.ERROR, "Check python failed", e); // NON-NLS-1
	  }

	  return false;
  }
}
