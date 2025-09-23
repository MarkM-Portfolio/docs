/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.common.ui;

import java.util.ArrayList;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.events.DisposeEvent;
import org.eclipse.swt.events.DisposeListener;
import org.eclipse.swt.graphics.Font;
import org.eclipse.swt.graphics.FontData;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Combo;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Label;
import org.eclipse.ui.forms.events.HyperlinkAdapter;
import org.eclipse.ui.forms.events.HyperlinkEvent;
import org.eclipse.ui.forms.widgets.FormToolkit;
import org.eclipse.ui.forms.widgets.Hyperlink;

import com.ibm.cic.agent.core.api.IAgent;
import com.ibm.cic.agent.ui.api.IAgentUI;
import com.ibm.cic.agent.ui.extensions.CustomPanel;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelUtil;

public abstract class AbstractConfigurationPanel extends CustomPanel
{

  protected boolean advancedSettingsVisible = false;

  protected ArrayList<Composite> hidePanels;

  protected Composite topContainer;

  protected FormToolkit toolkit;

  public static final String OFFERING_ID = "com.ibm.docs.im.installer"; // NON-NLS-1

  public AbstractConfigurationPanel(String panelId)
  {
    super(panelId);
  }

  @Override
  public void createControl(Composite parent)
  {
    toolkit = this.getFormToolkit();

    /*
     * Create a new composite where all of the widgets in our panel will be added to.
     */
    topContainer = toolkit.createComposite(parent);

    /*
     * The layout of a composite is very important and defines how widgets will be organized when added to the composite. A GridLayout is
     * very commonly used and adds UI elements left-to-right in columns. The declaration below indicates that the UI elements will be layed
     * out in two columns.
     * 
     * You can read about layouts here: http://www.eclipse.org/articles/article .php?file=Article-Understanding-Layouts/index.html
     * 
     * You can also refer to the java documentation for the specific layout you choose to understand how to configure it.
     */
    topContainer.setLayout(new GridLayout(2, false));

    /*
     * The parent composite uses a GridLayout. This call is telling the layout for the parent composite to lay the top container out such
     * that it fills all of the available horizontal and vertical space and grabs all available horizontal and vertical space.
     */
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, false));

    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);

  }

  protected abstract void createPanelControls(Composite topContainer2, FormToolkit toolkit2);

  @Override
  public IStatus performFinish(IProgressMonitor arg0)
  {
    return Status.OK_STATUS;
  }

  /**
   * Utility method to obtain IAgent instance.
   * 
   * @return IAgent instance
   */
  protected IAgent getAgent()
  {
    IAdaptable adaptable = this.getInitializationData();
    return (IAgent) adaptable.getAdapter(IAgent.class);
  }

  /**
   * Utility method to obtain FormToolkit instance, which will be used to create UI components for this panel.
   * 
   * @return
   */
  protected FormToolkit getFormToolkit()
  {
    IAdaptable adaptable = this.getInitializationData();
    IAgentUI agentUI = (IAgentUI) adaptable.getAdapter(IAgentUI.class);
    return agentUI.getFormToolkit();
  }

  protected GridData createDefaultTextGridData(int width)
  {
    GridData data = new GridData(GridData.BEGINNING, GridData.FILL, false, false, 2, 1);
    data.widthHint = width;
    return data;
  }
  
  protected GridData createTextGridData(int width)
  {
    GridData data = new GridData(GridData.BEGINNING, GridData.FILL, false, false, 1, 1);
    data.widthHint = width;
    return data;
  }

  protected Composite createHiddenPanel(Composite parent)
  {
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.FILL, SWT.BEGINNING, true, false, 2, 1);
    data.exclude = true;
    panel.setLayoutData(data);
    hidePanels.add(panel);
    return panel;
  }

  protected Composite createPanel(Composite parent)
  {
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(1, true));
    GridData data = new GridData(GridData.FILL, GridData.FILL, true, false);
    data.horizontalSpan = 2;
    panel.setLayoutData(data);
    return panel;
  }
  
  protected Composite createExtPanel(Composite parent)
  {
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(GridData.FILL, GridData.FILL, true, false);
    data.horizontalSpan = 2;
    panel.setLayoutData(data);
    return panel;
  }

  protected Composite createPanel(Composite parent, int horizontalIndent, int verticalIndent)
  {
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(1, true));
    GridData data = new GridData(GridData.FILL, GridData.FILL, true, false);
    data.horizontalSpan = 2;
    data.horizontalIndent = horizontalIndent;
    data.verticalIndent = verticalIndent;
    panel.setLayoutData(data);
    return panel;
  }

  protected Label createLabelAsBoldStyle(Composite parent, FormToolkit toolkit, String msg)
  {
    Label label = toolkit.createLabel(parent, msg);
    setFontBold(label);
    return label;

  }

  protected Combo createCombo(Composite parent, String[] items, int defaultSelectionIdx, int width)
  {
    Combo combo = new Combo(parent, SWT.READ_ONLY);
    combo.setItems(items);
    combo.select(defaultSelectionIdx);
    GridData data = new GridData(GridData.BEGINNING, GridData.FILL, true, false, 2, 1);
    data.widthHint = width;
    combo.setLayoutData(data);
    return combo;
  }

  protected void setFontBold(Control control)
  {
    FontData fontData = control.getFont().getFontData()[0];
    final Font font = new Font(control.getDisplay(), new FontData(fontData.getName(), fontData.getHeight(), SWT.BOLD));
    control.setFont(font);
    control.addDisposeListener(new DisposeListener()
    {

      @Override
      public void widgetDisposed(DisposeEvent arg0)
      {
        font.dispose();

      }
    });
  }

  protected Label createHeaderLabel(Composite panel, String msg)
  {
    return createLabel(panel, msg, 1);
  }

  protected Label createDescriptionLabel(Composite panel, String msg)
  {
    return createLabel(panel, msg, 0);
  }

  private Label createLabel(Composite panel, String msg, int fontHeight)
  {
    Label label = toolkit.createLabel(panel, msg, SWT.WRAP);
    PanelUtil.setFont(label, fontHeight);
    GridData data = new GridData(GridData.FILL, GridData.FILL, true, false, 2, 1);
    data.widthHint = 500;
    label.setLayoutData(data);
    return label;
  }

  private Label createLabelWithCourierNewFont(Composite panel, String msg, int fontHeight)
  {
    Label label = toolkit.createLabel(panel, msg, SWT.WRAP);
    PanelUtil.setCourierNewFont(label, fontHeight);
    GridData data = new GridData(GridData.FILL, GridData.FILL, true, false, 2, 1);
    data.widthHint = 500;
    label.setLayoutData(data);
    return label;
  }

  protected Label createExampleLabel(Composite panel, String msg)
  {
    return createLabelWithCourierNewFont(panel, msg, 0);

  }

  protected void setAdvancedSettingsVisible(boolean visible)
  {
    this.advancedSettingsVisible = visible;
    for (int i = 0; i < hidePanels.size(); i++)
    {
      GridData data = (GridData) hidePanels.get(i).getLayoutData();
      data.exclude = !advancedSettingsVisible;
      hidePanels.get(i).setVisible(advancedSettingsVisible);
    }
    resize();
  }

  protected void createAdvancedLink(Composite parent)
  {
    final Hyperlink advancedLink = toolkit.createHyperlink(parent, Messages.getString("MSG_CONVERSION_ADVANCED_SETING"), SWT.WRAP); //$NON-NLS-1$
    GridData gd = new GridData(GridData.END, GridData.END, true, false, 2, 1);
    advancedLink.setLayoutData(gd);
    advancedLink.addHyperlinkListener(new HyperlinkAdapter()
    {
      public void linkActivated(HyperlinkEvent e)
      {
        advancedSettingsVisible = !advancedSettingsVisible;
        advancedLink.setText(advancedSettingsVisible ? Messages.getString("MSG_CONVERSION_BASIC_SETING") : Messages
            .getString("MSG_CONVERSION_ADVANCED_SETING"));
        advancedLink.getParent().layout(true);
        handleAdvancedLinkEvent();
        setAdvancedSettingsVisible(advancedSettingsVisible);
      }

    });
  }

  protected void handleAdvancedLinkEvent()
  {
    // TODO Auto-generated method stub

  }

  protected void resize()
  {
    Composite parent = topContainer.getParent();
    ScrolledComposite sParent = (ScrolledComposite) parent.getParent();
    int prefWidth = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).x;
    int prefHeight = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).y;
    sParent.setMinSize(sParent.computeSize(prefWidth, prefHeight));
    sParent.setOrigin(0, 0);
    topContainer.layout();
  }

  protected void setPanelVisible(Composite panel, boolean visible)
  {
    GridData gridData = (GridData) panel.getLayoutData();
    gridData.exclude = !visible;
    panel.setVisible(visible);
  }
}
