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

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Vector;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.IJobChangeEvent;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.core.runtime.jobs.JobChangeAdapter;
import org.eclipse.jface.dialogs.IMessageProvider;
import org.eclipse.jface.operation.IRunnableWithProgress;
import org.eclipse.jface.operation.ModalContext;
import org.eclipse.swt.SWT;
import org.eclipse.swt.accessibility.AccessibleAdapter;
import org.eclipse.swt.accessibility.AccessibleEvent;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.custom.TableEditor;
import org.eclipse.swt.events.KeyEvent;
import org.eclipse.swt.events.KeyListener;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.layout.RowData;
import org.eclipse.swt.layout.RowLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Group;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.List;
import org.eclipse.swt.widgets.Table;
import org.eclipse.swt.widgets.TableColumn;
import org.eclipse.swt.widgets.TableItem;
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
import com.ibm.cic.common.core.model.IFeature;
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

/**
 * For more information, refer to: http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com.ibm.cic.dev.doc/html/extendingIM/main.html
 * http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc.isv/reference/api/agentui/com/ibm/cic/agent/ui/extensions/
 * BaseWizardPanel.html
 * http://capilanobuild.swg.usma.ibm.com:9999/help/topic/com.ibm.cic.agent.ui.doc.isv/reference/api/agentui/com/ibm/cic/
 * agent/ui/extensions/CustomPanel.html
 * 
 */
public class NodeIdentificationPanel extends AbstractCustomConfigPanel
{
  private static final ILogger logger = IMLogger.getLogger(NodeIdentificationPanel.class.getCanonicalName());

  private static final String SAMPLE_URL = "http://example.com";

  private static final int ARBtn_VINDENT = 27;

  int LABEL_WIDTH = 80;

  // define whether the selection happens in left all node list, or component node list
  enum NodeListType {
    ALL_NODE_LIST, COMP_NODE_LIST
  };

  private boolean bNodeListInitialized = false;

  private boolean bPanelReInitialized = false;
  
  private Composite topContainer = null;

  // all application nodes are grouped
  private Group nodeGInfo;

  private Label winNodeLabel;

  private List winNodeLst;

  private Label linuxNodeLabel;

  private List linuxNodeLst;

  // all components are grouped
  private Group compTopGInfo;

  // Conversion
  // private Group convTopGInfo;
  // private Group convBtnGInfo;
  private Composite convTopComposite;

  private Button convAddBtn;

  private Button convRemoveBtn;

  private Table convNodeTable;

  public class TableItemControls
  {
    Text text;

    TableEditor tableEditor;

    public TableItemControls(Text text, TableEditor tableeditor)
    {
      // super();
      this.text = text;
      this.tableEditor = tableeditor;
    }

    public void dispose()
    {
      text.dispose();
      tableEditor.dispose();
    }
  };

  private Composite docsTopComposite;

  private Button docsAddBtn;

  private Button docsRemoveBtn;

  private Table docsNodeTable;

  private Composite viewerTopComposite;

  private Button viewerAddBtn;

  private Button viewerRemoveBtn;

  private Table viewerNodeTable;

  private Composite proxyTopComposite;

  private Button proxyAddBtn;

  private Button proxyRemoveBtn;

  private Table proxyNodeTable;

  // Seperated line
  Label shadow_sep_h;

  // webserver nodes are in its own group
  private Group ihsAllNodeGInfo;

  private Label ihsANodeLabel;

  private List ihsANodeLst;

  private Composite ihsNodeTopComposite;

  private Button ihsAddBtn;

  private Button ihsRemoveBtn;

  private Table ihsNodeTable;

  private Button validateBtn;

  private IStatus dataJobsStatus;

  private DynamicImageViewer canvas;

  private boolean setVarsSucceed = true;

  private Button ihsSrcBtn1;

  private Button ihsSrcBtn2;

  private Text ihsWebURLText;

  private Label ihsWebURLLabel;

  // node list
  Vector<String[]> nodeList = new Vector<String[]>();

  // (nodename,type) => [hostname,ostype,nodetype,nodename,USER_INSTALL_ROOT,WAS_INSTALL_ROOT]
  Map<NodeID, String[]> nodeMapInfo = new HashMap<NodeID, String[]>();

  // (nodename,type) => hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT
  Map<NodeID, String> nodeListInfo = new HashMap<NodeID, String>();

  // Previous feature list
  Map<String, String> featureList = new HashMap<String, String>();

  private Text conversionClusterNameText;

  private Text docsClusterNameText;

  private Text viewerClusterNameText;

  private Text proxyClusterNameText;

  private Map<String, String> conversionClusterServerNamesMap = new HashMap<String, String>();

  private Map<String, String> docsClusterServerNamesMap = new HashMap<String, String>();

  private Map<String, String> viewerClusterServerNamesMap = new HashMap<String, String>();

  private Map<String, String> proxyClusterServerNamesMap = new HashMap<String, String>();

  // for default server name
  private Map<Table, Integer> list2clusterServerCounter = new HashMap<Table, Integer>();

  private Map<Table, String> list2clusterDefaultServerName = new HashMap<Table, String>();

  private Composite clusterNamesTextComposite;

  private static Boolean bValidated = false;

  private StringBuffer existedServerNames = null;

  /**
   * Default constructor
   */
  public NodeIdentificationPanel()
  {
    super(Messages.PanelName$NodeIdentificationPanel); // NON-NLS-1
  }

  private ArrayList<Control> createClusterControls(Composite parent, FormToolkit toolkit, String[] strings, boolean isAppCluster)
  {
    ArrayList<Control> controls = new ArrayList<Control>();

    Composite clusterTopComposite = toolkit.createComposite(parent);
    GridLayout gl = this.createMarginZeroGLayout(2, false);
    clusterTopComposite.setLayout(gl);
    GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    clusterTopComposite.setLayoutData(gridData);

    // two buttons composite
    Composite buttonComposite = toolkit.createComposite(clusterTopComposite);
    gl = createMarginZeroGLayout(1, true);
    buttonComposite.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.verticalIndent = ARBtn_VINDENT;
    buttonComposite.setLayoutData(gridData);

    // Create button in conversion button composite
    createBlankLabel(buttonComposite, "", 1);
    Button addButton = toolkit.createButton(buttonComposite, Messages.Message_NodeIdentificationPanel_AddBtn$Label, SWT.PUSH);
    gridData = new GridData(GridData.CENTER, GridData.CENTER, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 60;
    addButton.setLayoutData(gridData);
    addButton.setToolTipText(strings[1]);
    addClickListener(addButton);
    controls.add(addButton);

    Button removeButton = toolkit.createButton(buttonComposite, Messages.Message_NodeIdentificationPanel_RemoveBtn$Label, SWT.PUSH);
    gridData = new GridData(GridData.CENTER, GridData.CENTER, true, false);
    gridData.horizontalSpan = 1;
    gridData.verticalIndent = 4;
    gridData.minimumWidth = 60;
    removeButton.setLayoutData(gridData);
    removeButton.setToolTipText(strings[2]);
    addClickListener(removeButton);
    controls.add(removeButton);

    Composite clusterComposite = toolkit.createComposite(clusterTopComposite);
    gl = this.createMarginZeroGLayout(1, true);
    gl.marginWidth = 0;
    gl.marginTop = 6;
    clusterComposite.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    clusterComposite.setLayoutData(gridData);

    // header
    Composite clusterListHeaderComposite = toolkit.createComposite(clusterComposite);
    gl = createMarginZeroGLayout(2, true);
    gl.marginWidth = 0;
    clusterListHeaderComposite.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    clusterListHeaderComposite.setLayoutData(gridData);

    // Create "Conversion/Docs/Viewer" label
    Label nodesLabel = toolkit.createLabel(clusterListHeaderComposite, strings[0], SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = LABEL_WIDTH;
    nodesLabel.setLayoutData(gridData);

    // Create "Cluster Name" and text composite
    clusterNamesTextComposite = toolkit.createComposite(clusterListHeaderComposite);
    gl = this.createMarginZeroGLayout(2, false);
    gl.marginWidth = 0;
    clusterNamesTextComposite.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    clusterNamesTextComposite.setLayoutData(gridData);

    // Create "Cluster Name" label
    Label clusterNameLabel = toolkit.createLabel(clusterNamesTextComposite, Messages.Message_NodeIdentificationPanel_ClusterName$lable,
        SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 30;
    clusterNameLabel.setLayoutData(gridData);
    clusterNameLabel.setVisible(isAppCluster);

    // Create "Cluster Name" Text
    Text clusterNameText = toolkit.createText(clusterNamesTextComposite, "");
    gridData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 100;
    clusterNameText.setLayoutData(gridData);
    clusterNameText.setVisible(isAppCluster);
    controls.add(clusterNameText);

    // create cluster Table
    Table clusterNodeTable = createTable(clusterComposite, isAppCluster);
    clusterNodeTable.setToolTipText(strings[3]);
    gridData = new GridData(GridData.FILL, GridData.CENTER, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 40;
    gridData.heightHint = 63;
    clusterNodeTable.setLayoutData(gridData);
    PanelUtil.registerAccRelation(nodesLabel, clusterNodeTable);
    addSelectionListener(clusterNodeTable);
    controls.add(clusterNodeTable);

    if (isAppCluster)
    {
      list2clusterServerCounter.put(clusterNodeTable, 1);
      list2clusterDefaultServerName.put(clusterNodeTable, strings[4]);
    }
    controls.add(clusterTopComposite);
    return controls;
  }

  private Table createTable(Composite parent, boolean isAppCluster)
  {
    Table table = new Table(parent, SWT.BORDER | SWT.MULTI | SWT.FULL_SELECTION);
    table.setHeaderVisible(true);
    table.setLinesVisible(true);

    String[] tableHeader = { Messages.Message_NodeIdentificationPanel_Nodes$lable,
        Messages.Message_NodeIdentificationPanel_ServeNames$lable };
    for (int i = 0; i < tableHeader.length; i++)
    {
      TableColumn tableColumn = new TableColumn(table, SWT.NONE);
      tableColumn.setText(tableHeader[i]);
      tableColumn.setMoveable(true);
      tableColumn.setWidth(200);
      if (!isAppCluster)
      {
        tableColumn.setWidth(400);
        break;
      }
    }

    if (isAppCluster)
    {
      Hashtable<TableItem, TableItemControls> tableControls = new Hashtable<TableItem, TableItemControls>();
      table.setData(tableControls);
    }

    return table;
  }

  private TableItem addRow(Table table, String col1, String col2)
  {
    TableItem item = new TableItem(table, SWT.NONE);
    item.setText(new String[] { col1, col2 });

    bValidated = false;

    if (table == ihsNodeTable)
      return item;

    final TableEditor editor = new TableEditor(table);
    final Text text = new Text(table, SWT.NONE);
    text.setText(item.getText(1));
    editor.grabHorizontal = true;
    editor.setEditor(text, item, 1);

    text.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent e)
      {
        editor.getItem().setText(1, text.getText());

        bValidated = false;
        verifyComplete(false, false);
      }
    });

    TableItemControls cons = new TableItemControls(text, editor);

    Hashtable<TableItem, TableItemControls> tableControls = (Hashtable<TableItem, TableItemControls>) table.getData();
    if (tableControls != null)
      tableControls.put(item, cons);

    return item;
  }

  private void removeRow(Table table, TableItem items[])
  {
    for (int i = 0; i < items.length; i++)
    {
      int index = table.indexOf(items[i]);
      if (index >= 0)
      {
        if (table != ihsNodeTable)
        {
          Hashtable<TableItem, TableItemControls> tableControls = (Hashtable<TableItem, TableItemControls>) table.getData();
          if (tableControls != null)
          {
            TableItemControls cons = tableControls.get(items[i]);
            if (cons != null)
            {
              cons.dispose();
              tableControls.remove(items[i]);
            }
          }
        }

        table.remove(index);

        bValidated = false;
      }
    }
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
  private void createPanelControls(Composite parent, FormToolkit toolkit)
  {
    Locale locale = Locale.getDefault();
    if (locale != null)
    {
      String lang = locale.getLanguage().toLowerCase();
      // el, ja, ja-jp
      if ("el".equals(lang) || "ja".equals(lang) || "ja-jp".equals(lang))
        LABEL_WIDTH = 200;
    }

    // Node Group Top
    nodeGInfo = new Group(parent, SWT.NONE);
    // nodeGInfo.setLayout(parent.getLayout());
    GridLayout gl = new GridLayout(1, true);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 6;
    nodeGInfo.setLayout(gl);
    GridData gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    nodeGInfo.setLayoutData(gridData);
    // *********Component Btn Group Top************/
    // Component Group
    compTopGInfo = new Group(parent, SWT.NONE);
    gl = new GridLayout(1, true);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 2;
    compTopGInfo.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    compTopGInfo.setLayoutData(gridData);

    String[] conversionStrings = { Messages.getString("Message_NodeIdentificationPanel_Conv$label"),
        Messages.getString("Message_NodeIdentificationPanel_ConvAdd$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_ConvRemove$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_Conv$listTip"), Constants.CONV_SERVER };
    ArrayList<Control> cs = createClusterControls(compTopGInfo, toolkit, conversionStrings, true);
    convAddBtn = (Button) cs.get(0);
    convRemoveBtn = (Button) cs.get(1);
    conversionClusterNameText = (Text) cs.get(2);
    convNodeTable = (Table) cs.get(3);
    convTopComposite = (Composite) cs.get(4);
    conversionClusterNameText.setText(Constants.CONV_CLUSTER);
    addModifyListener(conversionClusterNameText);

    String[] docsStrings = { Messages.getString("Message_NodeIdentificationPanel_Docs$label"),
        Messages.getString("Message_NodeIdentificationPanel_DocsAdd$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_DocsRemove$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_Docs$listTip"), Constants.DOCS_SERVER };
    cs = createClusterControls(compTopGInfo, toolkit, docsStrings, true);
    docsAddBtn = (Button) cs.get(0);
    docsRemoveBtn = (Button) cs.get(1);
    docsClusterNameText = (Text) cs.get(2);
    docsNodeTable = (Table) cs.get(3);
    docsTopComposite = (Composite) cs.get(4);
    docsClusterNameText.setText(Constants.DOCS_CLUSTER);
    addModifyListener(docsClusterNameText);

    String[] viewerStrings = { Messages.getString("Message_NodeIdentificationPanel_Viewer$label"),
        Messages.getString("Message_NodeIdentificationPanel_ViewerAdd$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_ViewerRemove$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_Viewer$listTip"), Constants.Viewer_SERVER };
    cs = createClusterControls(compTopGInfo, toolkit, viewerStrings, true);
    viewerAddBtn = (Button) cs.get(0);
    viewerRemoveBtn = (Button) cs.get(1);
    viewerClusterNameText = (Text) cs.get(2);
    viewerNodeTable = (Table) cs.get(3);
    viewerTopComposite = (Composite) cs.get(4);
    viewerClusterNameText.setText(Constants.Viewer_CLUSTER);
    addModifyListener(viewerClusterNameText);

    String[] proxyStrings = { Messages.getString("Message_NodeIdentificationPanel_Proxy$label"),
        Messages.getString("Message_NodeIdentificationPanel_ProxyAdd$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_ProxyRemove$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_Proxy$listTip"), Constants.DOCS_PROXY_SERVER };
    cs = createClusterControls(compTopGInfo, toolkit, proxyStrings, true);
    proxyAddBtn = (Button) cs.get(0);
    proxyRemoveBtn = (Button) cs.get(1);
    proxyClusterNameText = (Text) cs.get(2);
    proxyNodeTable = (Table) cs.get(3);
    proxyTopComposite = (Composite) cs.get(4);
    proxyClusterNameText.setText(Constants.DOCS_PROXY_CLUSTER);
    addModifyListener(proxyClusterNameText);

    // widgets within node group top
    // windows nodes
    winNodeLabel = toolkit.createLabel(nodeGInfo, Messages.Message_NodeIdentificationPanel_WinNodes$Label, SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = LABEL_WIDTH;
    winNodeLabel.setLayoutData(gridData);
    this.winNodeLst = new List(nodeGInfo, SWT.BORDER | SWT.MULTI | SWT.H_SCROLL | SWT.V_SCROLL);
    PanelUtil.registerAccRelation(winNodeLabel, this.winNodeLst);

    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 80;
    gridData.heightHint = 179;
    this.winNodeLst.setLayoutData(gridData);
    PanelUtil.registerAccRelation(winNodeLabel, this.winNodeLst);
    this.addSelectionListener(this.winNodeLst);

    // Linux nodes
    linuxNodeLabel = toolkit.createLabel(nodeGInfo, Messages.Message_NodeIdentificationPanel_LnxNodes$Label, SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = LABEL_WIDTH;
    linuxNodeLabel.setLayoutData(gridData);
    this.linuxNodeLst = new List(nodeGInfo, SWT.BORDER | SWT.MULTI | SWT.H_SCROLL | SWT.V_SCROLL);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 80;
    gridData.heightHint = 180;
    this.linuxNodeLst.setLayoutData(gridData);
    PanelUtil.registerAccRelation(linuxNodeLabel, this.linuxNodeLst);
    this.addSelectionListener(this.linuxNodeLst);

    shadow_sep_h = new Label(parent, SWT.SEPARATOR | SWT.SHADOW_OUT | SWT.HORIZONTAL);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false, 3, 1);
    gridData.verticalIndent = 4;
    shadow_sep_h.setLayoutData(gridData);

    Label optional = new Label(parent, SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false, 3, 1);
    optional.setLayoutData(gridData);
    optional.setText(Messages.Message_NodeIdentificationPanel_IHSHint$Label);

    // Webserver node area
    // webserver nodes Group Top
    ihsAllNodeGInfo = new Group(parent, SWT.NONE);
    gl = new GridLayout(2, false);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 6;
    ihsAllNodeGInfo.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 2;
    ihsAllNodeGInfo.setLayoutData(gridData);

    // Webserver Radio button
    ihsSrcBtn1 = toolkit.createButton(ihsAllNodeGInfo, Messages.Message_NodeIdentificationPanel_IHSSrc1$Label, SWT.RADIO);
    ihsSrcBtn1.setSelection(true);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 2;
    ihsSrcBtn1.setLayoutData(gridData);
    this.addClickListener(ihsSrcBtn1);

    Group group1 = new Group(ihsAllNodeGInfo, SWT.NONE);
    gl = new GridLayout(2, false);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 6;
    group1.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    group1.setLayoutData(gridData);

    Composite group2 = toolkit.createComposite(group1);
    gl = new GridLayout(1, false);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 6;
    gl.marginTop = 8;
    group2.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    group2.setLayoutData(gridData);

    ihsANodeLabel = toolkit.createLabel(group2, Messages.Message_NodeIdentificationPanel_WebNodes$Label, SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = LABEL_WIDTH;
    ihsANodeLabel.setLayoutData(gridData);
    this.ihsANodeLst = new List(group2, SWT.BORDER | SWT.MULTI | SWT.H_SCROLL | SWT.V_SCROLL);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    gridData.minimumWidth = 80;
    gridData.heightHint = 70;
    this.ihsANodeLst.setLayoutData(gridData);
    PanelUtil.registerAccRelation(ihsANodeLabel, this.ihsANodeLst);
    this.addSelectionListener(this.ihsANodeLst);

    // Webserver Top Group
    // ihsNodeTopComposite = new Group(group1, SWT.NONE);
    ihsNodeTopComposite = toolkit.createComposite(group1);
    gl = new GridLayout(1, false);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 2;
    ihsNodeTopComposite.setLayout(gl);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 1;
    ihsNodeTopComposite.setLayoutData(gridData);

    String[] ihsStrings = { Messages.getString("Message_NodeIdentificationPanel_IHS$label"),
        Messages.getString("Message_NodeIdentificationPanel_IHSAdd$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_IHSRemove$btnTip"),
        Messages.getString("Message_NodeIdentificationPanel_IHS$listTip") };
    cs = createClusterControls(ihsNodeTopComposite, toolkit, ihsStrings, false);
    ihsAddBtn = (Button) cs.get(0);
    ihsRemoveBtn = (Button) cs.get(1);
    ihsNodeTable = (Table) cs.get(3);

    Label blankLabel = toolkit.createLabel(ihsAllNodeGInfo, "", SWT.WRAP);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 2;
    gridData.heightHint = 15;
    blankLabel.setLayoutData(gridData);

    ihsSrcBtn2 = toolkit.createButton(ihsAllNodeGInfo, Messages.Message_NodeIdentificationPanel_IHSSrc2$Label, SWT.RADIO);
    gridData = new GridData(GridData.FILL, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 2;
    ihsSrcBtn2.setLayoutData(gridData);
    this.addClickListener(ihsSrcBtn2);

    ihsWebURLText = toolkit.createText(ihsAllNodeGInfo, "", SWT.NONE);
    gridData = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false);
    gridData.horizontalSpan = 2;
    gridData.minimumWidth = 250;
    ihsWebURLText.setLayoutData(gridData);
    ihsWebURLText.setEnabled(false);
    this.ihsWebURLText.addModifyListener(new ModifyListener()
    {
      public void modifyText(ModifyEvent event)
      {
        verifyComplete(false, false);
      }
    });

    // Verification
    Composite vComp = createPanel(parent);

    gl = new GridLayout(1, false);
    vComp.setLayout(gl);
    GridData gdText = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
    Label createClusterLabel = toolkit.createLabel(vComp, Messages.getString("Message_WASInfoPanel_Validate$noteLabel"), SWT.WRAP);
    createClusterLabel.setLayoutData(gdText);

    validateBtn = toolkit.createButton(vComp, Messages.Message_WASInfoPanel_Validate$label, SWT.PUSH);
    gdText = new GridData(GridData.BEGINNING, GridData.BEGINNING, true, false, 1, 1);
    gdText.minimumWidth = 120;
    validateBtn.setLayoutData(gdText);
    validateBtn.setEnabled(false);
    validateBtn.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent e)
      {
        setErrorMessage(null);
        setMessage(Messages.Message_NodeIdentificationPanel_Validating$msg, IMessageProvider.INFORMATION);
        validateBtn.setEnabled(false);
        canvas.setVisible(true);
        verifyComplete(true, true);
      }
    });
    canvas = PanelUtil.createLoadingImg(vComp);
    canvas.setVisible(false);
  }

  private void addModifyListener(final Text t)
  {
    if (t == null)
      return;
    t.addModifyListener(new ModifyListener()
    {
      @Override
      public void modifyText(ModifyEvent arg0)
      {
        bValidated = false;
        verifyComplete(false, false);
      }
    });
  }

  private void addClickListener(final Button button)
  {
    if (button == null)
      return;
    button.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent event)
      {
        doClick((Button) event.widget);
      }
    });

    button.getAccessible().addAccessibleListener(new AccessibleAdapter()
    {
      @Override
      public void getName(AccessibleEvent e)
      {
        e.result = button.getToolTipText();
      }
    });
  }

  private void addSelectionListener(List list)
  {
    if (list == null)
      return;
    list.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent event)
      {
        doSelection((List) event.widget);
      }
    });
  }

  private void addSelectionListener(Table table)
  {
    if (table == null)
      return;
    table.addSelectionListener(new SelectionAdapter()
    {
      public void widgetSelected(SelectionEvent event)
      {
        doSelection((Table) event.widget);
      }
    });
  }

  /*
   * Constructs a new instance of this class given the number of columns, and whether or not the columns should be forced to have the same
   * width. If numColumns has a value less than 1, the layout will not set the size and position of any controls.
   * 
   * @param numColumns the number of columns in the grid
   * 
   * @param makeColumnsEqualWidth whether or not the columns will have equal width
   */
  private GridLayout createMarginZeroGLayout(int numColumns, boolean makeColumnsEqualWidth)
  {
    GridLayout gl = new GridLayout(numColumns, makeColumnsEqualWidth);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    gl.marginBottom = 0;
    gl.marginLeft = 0;
    gl.marginRight = 0;
    return gl;
  }

  private Composite createPanel(Composite parent)
  {
    FormToolkit toolkit = this.getFormToolkit();
    Composite panel = toolkit.createComposite(parent);
    panel.setLayout(new GridLayout(2, false));
    GridData data = new GridData(SWT.BEGINNING, SWT.BEGINNING, true, false, 2, 1);
    data.verticalIndent = 16;
    panel.setLayoutData(data);
    return panel;
  }

  protected void layout(Vector<Control> controls, boolean visible)
  {
    if (controls == null)
      return;
    for (int i = 0; i < controls.size(); i++)
    {
      GridData data = (GridData) controls.get(i).getLayoutData();
      data.exclude = visible;
      controls.get(i).setVisible(!visible);
    }
    resize();
  }
  
  private void relayout()
  {
    if( topContainer == null )
    {
    	return;
    }
    Composite parent = topContainer.getParent();
    ScrolledComposite sParent = (ScrolledComposite) parent.getParent();
    int prefWidth = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).x;
    int prefHeight = topContainer.computeSize(SWT.DEFAULT, SWT.DEFAULT).y;
    sParent.setMinSize(sParent.computeSize(prefWidth, prefHeight));
    topContainer.layout();
  }

  protected void resize()
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

  public boolean shouldSkip()
  {
    // If selected features have been modified,the status should be re-initialized
    ICustomPanelData data = this.getCustomPanelData();
    // if (bPanelReInitialized && IMUtil.isFeatureAddOrRemoved(data))
    // bPanelReInitialized = false;
    IProfile profile = data.getProfile();
    if (profile != null)
    {
      String status = profile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, OFFERING_ID);
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
      {
        // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT
        String nodesInfo = profile.getOfferingUserData(Constants.NODE_HOST_LIST, OFFERING_ID);
        if (!bNodeListInitialized && nodesInfo != null && nodesInfo.trim().length() > 0)
        {
          // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT
          Vector<String> nodesStr = IMUtil.parseListString(nodesInfo, Util.LIST_SEPRATOR);
          for (int i = 0; i < nodesStr.size(); i++)
          {
            String nodeStr = nodesStr.get(i);
            Vector<String> nodeInfoV = IMUtil.parseListString(nodeStr, Constants.SEPARATE_SUB_SUB_CHARS);
            String[] nodeInfoArr = new String[nodeInfoV.size()];
            nodeInfoV.toArray(nodeInfoArr);
            nodeList.add(nodeInfoArr);
            nodeMapInfo.put(new NodeID(Constants.NONE_CLUSTER, nodeInfoArr[3], nodeInfoArr[2]), nodeInfoArr);
            nodeListInfo.put(new NodeID(Constants.NONE_CLUSTER, nodeInfoArr[3], nodeInfoArr[2]), nodeStr);
            if (!nodeInfoArr[2].equalsIgnoreCase(Constants.DEPLOYMENT_MANAGER))
            {
              if (!nodeInfoArr[2].equalsIgnoreCase(Constants.WEB_SERVER))
              {
                if (nodeInfoArr[1].equalsIgnoreCase(Constants.WINDOWS) && winNodeLst != null)
                {
                  winNodeLst.add(nodeInfoArr[3]);
                }
                else if (nodeInfoArr[1].equalsIgnoreCase(Constants.LINUX) && linuxNodeLst != null)
                {
                  linuxNodeLst.add(nodeInfoArr[3]);
                }
                // verifyComplete(false,false);
              }
              else if (linuxNodeLst != null)
              {
                ihsANodeLst.add(nodeInfoArr[3]);
              }
            }
          }
          verifyComplete(false, false);
          bNodeListInitialized = true;
        }

        if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_INSTALL))
        {
          Map<String, String> temp = new HashMap<String, String>();
          IAgentJob[] jobs = data.getAllJobs();
          if (jobs != null)
          {
            IFeature[] iFeatures = jobs[0].getFeaturesArray();
            if (iFeatures != null)
            {
              for (int i = 0; i < iFeatures.length; i++)
              {
                String featureID = iFeatures[i].getSelector().getIdentity().getId();
                temp.put(featureID, featureID);
              }
            }
          }
          if (bPanelReInitialized && featureList.size() > 0)
          {
            if (temp.get(Constants.IBMCONVERSION) != featureList.get(Constants.IBMCONVERSION)
                || temp.get(Constants.IBMDOCS) != featureList.get(Constants.IBMDOCS)
                || temp.get(Constants.IBMVIEWER) != featureList.get(Constants.IBMVIEWER)
                || temp.get(Constants.IBMDOCSPROXY) != featureList.get(Constants.IBMDOCSPROXY))
            {
              bPanelReInitialized = false;
              profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
              this.setPageComplete(false);
              if (!NodeIdentificationPanel.this.isDisposed())
              {
                validateBtn.setEnabled(true);
              }
            }
          }
          if (!bPanelReInitialized)
          {
            controlInvisibleWidgets.clear();
            controlVisibleWidgets.clear();
            if (!IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCONVERSION))
            {
              controlInvisibleWidgets.add(convTopComposite);
              // controlInvisibleWidgets.add(convAddBtn);
              // controlInvisibleWidgets.add(convRemoveBtn);
              // controlInvisibleWidgets.add(convNodeGInfo);
              // controlInvisibleWidgets.add(convNodeLabel);
              // controlInvisibleWidgets.add(convNodeLst);
            }
            else if (convTopComposite != null && !convTopComposite.getVisible())
            {
              controlVisibleWidgets.add(convTopComposite);
              // controlVisibleWidgets.add(convAddBtn);
              // controlVisibleWidgets.add(convRemoveBtn);
              // controlVisibleWidgets.add(convNodeGInfo);
              // controlVisibleWidgets.add(convNodeLabel);
              // controlVisibleWidgets.add(convNodeLst);
            }
            if (!IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMDOCS))
            {
              controlInvisibleWidgets.add(docsTopComposite);
              // controlInvisibleWidgets.add(docsAddBtn);
              // controlInvisibleWidgets.add(docsRemoveBtn);
              // controlInvisibleWidgets.add(docsNodeGInfo);
              // controlInvisibleWidgets.add(docsNodeLabel);
              // controlInvisibleWidgets.add(docsNodeLst);
            }
            else if (docsTopComposite != null && !docsTopComposite.getVisible())
            {
              controlVisibleWidgets.add(docsTopComposite);
              // controlVisibleWidgets.add(docsAddBtn);
              // controlVisibleWidgets.add(docsRemoveBtn);
              // controlVisibleWidgets.add(docsNodeGInfo);
              // controlVisibleWidgets.add(docsNodeLabel);
              // controlVisibleWidgets.add(docsNodeLst);
            }
            if (!IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMVIEWER))
            {
              controlInvisibleWidgets.add(viewerTopComposite);
              // controlInvisibleWidgets.add(viewerAddBtn);
              // controlInvisibleWidgets.add(viewerRemoveBtn);
              // controlInvisibleWidgets.add(viewerNodeGInfo);
              // controlInvisibleWidgets.add(viewerNodeLabel);
              // controlInvisibleWidgets.add(viewerNodeLst);
            }
            else if (viewerTopComposite != null && !viewerTopComposite.getVisible())
            {
              controlVisibleWidgets.add(viewerTopComposite);
              // controlVisibleWidgets.add(viewerAddBtn);
              // controlVisibleWidgets.add(viewerRemoveBtn);
              // controlVisibleWidgets.add(viewerNodeGInfo);
              // controlVisibleWidgets.add(viewerNodeLabel);
              // controlVisibleWidgets.add(viewerNodeLst);
            }
            if (!IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMDOCSPROXY))
            {
              controlInvisibleWidgets.add(proxyTopComposite);
              // controlInvisibleWidgets.add(proxyAddBtn);
              // controlInvisibleWidgets.add(proxyRemoveBtn);
              // controlInvisibleWidgets.add(proxyNodeGInfo);
              // controlInvisibleWidgets.add(proxyNodeLabel);
              // controlInvisibleWidgets.add(proxyNodeLst);
            }
            else if (proxyTopComposite != null && !proxyTopComposite.getVisible())
            {
              controlVisibleWidgets.add(proxyTopComposite);
              // controlVisibleWidgets.add(proxyAddBtn);
              // controlVisibleWidgets.add(proxyRemoveBtn);
              // controlVisibleWidgets.add(proxyNodeGInfo);
              // controlVisibleWidgets.add(proxyNodeLabel);
              // controlVisibleWidgets.add(proxyNodeLst);
            }
            if (controlInvisibleWidgets.size() > 0)
              layout(controlInvisibleWidgets, true);
            if (controlVisibleWidgets.size() > 0)
              layout(controlVisibleWidgets, false);

            bPanelReInitialized = true;
          }
          featureList.clear();
          featureList.putAll(temp);
          temp.clear();
        }
        else if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE))
        {
          if (!bPanelReInitialized)
          {
            controlInvisibleWidgets.clear();
            controlInvisibleWidgets.add(nodeGInfo);
            controlInvisibleWidgets.add(compTopGInfo);
            controlInvisibleWidgets.add(shadow_sep_h);
            if (ihsANodeLst.getItemCount() > 0)
            {
              layout(controlInvisibleWidgets, true);
              bPanelReInitialized = true;
              new UIJob("") //$NON-NLS-1$
              {
                public IStatus runInUIThread(IProgressMonitor monitor)
                {
                  if (!NodeIdentificationPanel.this.isDisposed())
                  {
                    validateBtn.setEnabled(false);
                    canvas.setVisible(false);
                  }
                  return Status.OK_STATUS;
                }
              }.schedule();
            }
            else
            {
              PanelStatusManagementService.remove(this);
              return true;
            }
          }
        }
        else if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_MODIFY))
        {
          boolean bConv = IMUtil.isFeatureAdded(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.IBMCONVERSION);
          boolean bDocs = IMUtil.isFeatureAdded(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.IBMDOCS);
          boolean bViewer = IMUtil.isFeatureAdded(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.IBMVIEWER);
          boolean bProxy = IMUtil.isFeatureAdded(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.IBMDOCSPROXY);
          if (bPanelReInitialized && (bConv || bDocs || bViewer || bProxy))
            bPanelReInitialized = false;
          if (!bPanelReInitialized)
          {
            controlInvisibleWidgets.clear();
            controlVisibleWidgets.clear();
            if (!bConv)
            {
              controlInvisibleWidgets.add(convTopComposite);
              // controlInvisibleWidgets.add(convAddBtn);
              // controlInvisibleWidgets.add(convRemoveBtn);
              // controlInvisibleWidgets.add(convNodeGInfo);
              // controlInvisibleWidgets.add(convNodeLabel);
              // controlInvisibleWidgets.add(convNodeLst);
            }
            else if (convTopComposite != null && !convTopComposite.getVisible())
            {
              controlVisibleWidgets.add(convTopComposite);
              // controlVisibleWidgets.add(convAddBtn);
              // controlVisibleWidgets.add(convRemoveBtn);
              // controlVisibleWidgets.add(convNodeGInfo);
              // controlVisibleWidgets.add(convNodeLabel);
              // controlVisibleWidgets.add(convNodeLst);
            }
            if (!bDocs)
            {
              controlInvisibleWidgets.add(docsTopComposite);
              // controlInvisibleWidgets.add(docsAddBtn);
              // controlInvisibleWidgets.add(docsRemoveBtn);
              // controlInvisibleWidgets.add(docsNodeGInfo);
              // controlInvisibleWidgets.add(docsNodeLabel);
              // controlInvisibleWidgets.add(docsNodeLst);
            }
            else if (docsTopComposite != null && !docsTopComposite.getVisible())
            {
              controlVisibleWidgets.add(docsTopComposite);
              // controlVisibleWidgets.add(docsAddBtn);
              // controlVisibleWidgets.add(docsRemoveBtn);
              // controlVisibleWidgets.add(docsNodeGInfo);
              // controlVisibleWidgets.add(docsNodeLabel);
              // controlVisibleWidgets.add(docsNodeLst);
            }
            if (!bViewer)
            {
              controlInvisibleWidgets.add(viewerTopComposite);
              // controlInvisibleWidgets.add(viewerAddBtn);
              // controlInvisibleWidgets.add(viewerRemoveBtn);
              // controlInvisibleWidgets.add(viewerNodeGInfo);
              // controlInvisibleWidgets.add(viewerNodeLabel);
              // controlInvisibleWidgets.add(viewerNodeLst);
            }
            else if (viewerTopComposite != null && !viewerTopComposite.getVisible())
            {
              controlVisibleWidgets.add(viewerTopComposite);
              // controlVisibleWidgets.add(viewerAddBtn);
              // controlVisibleWidgets.add(viewerRemoveBtn);
              // controlVisibleWidgets.add(viewerNodeGInfo);
              // controlVisibleWidgets.add(viewerNodeLabel);
              // controlVisibleWidgets.add(viewerNodeLst);
            }
            if (!bProxy)
            {
              controlInvisibleWidgets.add(proxyTopComposite);
              // controlInvisibleWidgets.add(proxyAddBtn);
              // controlInvisibleWidgets.add(proxyRemoveBtn);
              // controlInvisibleWidgets.add(proxyNodeGInfo);
              // controlInvisibleWidgets.add(proxyNodeLabel);
              // controlInvisibleWidgets.add(proxyNodeLst);
            }
            else if (proxyTopComposite != null && !proxyTopComposite.getVisible())
            {
              controlVisibleWidgets.add(proxyTopComposite);
              // controlVisibleWidgets.add(proxyAddBtn);
              // controlVisibleWidgets.add(proxyRemoveBtn);
              // controlVisibleWidgets.add(proxyNodeGInfo);
              // controlVisibleWidgets.add(proxyNodeLabel);
              // controlVisibleWidgets.add(proxyNodeLst);
            }
            if (controlInvisibleWidgets.size() > 0)
              layout(controlInvisibleWidgets, true);
            if (controlVisibleWidgets.size() > 0)
              layout(controlVisibleWidgets, false);

            bPanelReInitialized = true;
          }
        }
      }
    }

    PanelStatusManagementService.add(this);
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
    IProfile iProfile = getCustomPanelData().getProfile();
    IAgentJob[] jobs = getCustomPanelData().getAllJobs();
    IAgent iAgent = getCustomPanelData().getAgent();
    if (!(jobs != null && jobs[0].isUpdate()))
    {
      IProfile profile = getCustomPanelData().getProfile();

      if (profile != null)
      {
        String convNodes = profile.getOfferingUserData(Constants.CONV_NODES, OFFERING_ID);
        if (convNodes != null && convNodes.trim().length() > 0)
        {
          // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
          Vector<String[]> nodeList = IMUtil.parseListString(convNodes, Util.LIST_SEPRATOR, Constants.SEPARATE_SUB_SUB_CHARS);
          for (int i = 0; i < nodeList.size(); i++)
            addRow(this.convNodeTable, nodeList.get(i)[3], "");
        }

        String docsNodes = profile.getOfferingUserData(Constants.DOCS_NODES, OFFERING_ID);
        if (docsNodes != null && docsNodes.trim().length() > 0)
        {
          // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
          Vector<String[]> nodeList = IMUtil.parseListString(docsNodes, Util.LIST_SEPRATOR, Constants.SEPARATE_SUB_SUB_CHARS);
          for (int i = 0; i < nodeList.size(); i++)
            addRow(this.docsNodeTable, nodeList.get(i)[3], "");
        }

        String viewerNodes = profile.getOfferingUserData(Constants.VIEWER_NODES, OFFERING_ID);
        if (viewerNodes != null && viewerNodes.trim().length() > 0)
        {
          // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
          Vector<String[]> nodeList = IMUtil.parseListString(viewerNodes, Util.LIST_SEPRATOR, Constants.SEPARATE_SUB_SUB_CHARS);
          for (int i = 0; i < nodeList.size(); i++)
            addRow(this.viewerNodeTable, nodeList.get(i)[3], "");
        }

        String proxyNodes = profile.getOfferingUserData(Constants.DOCS_PROXY_NODES, OFFERING_ID);
        if (proxyNodes != null && proxyNodes.trim().length() > 0)
        {
          // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
          Vector<String[]> nodeList = IMUtil.parseListString(proxyNodes, Util.LIST_SEPRATOR, Constants.SEPARATE_SUB_SUB_CHARS);
          for (int i = 0; i < nodeList.size(); i++)
            addRow(this.proxyNodeTable, nodeList.get(i)[3], "");
        }

        String ihsNodes = profile.getOfferingUserData(Constants.IHS_NODES, OFFERING_ID);
        if (ihsNodes != null && ihsNodes.trim().length() > 0)
        {
          // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
          Vector<String[]> nodeList = IMUtil.parseListString(ihsNodes, Util.LIST_SEPRATOR, Constants.SEPARATE_SUB_SUB_CHARS);
          for (int i = 0; i < nodeList.size(); i++)
            addRow(this.ihsNodeTable, nodeList.get(i)[3], "");
        }

        // verifyComplete(true, false);
      }
    }
  }

  private void SaveServerNames(Map<String, String> src, Map<String, String> dst)
  {
    for (String node : src.keySet())
    {
      dst.put(node, src.get(node));
    }
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
    final Map<String, String[]> map = new LinkedHashMap<String, String[]>();

    // Note: order matters within the map as the order in which they are inserted controls the
    // order in which the validators are called.

    // The following are validated
    // windows nodes
    if (this.winNodeLst != null && this.winNodeLst.getItemCount() > 0)
    {
      String winNodes[] = this.winNodeLst.getItems();
      map.put(Constants.WIN_NODE_LIST, winNodes);
    }
    // linux nodes
    if (this.linuxNodeLst != null && this.linuxNodeLst.getItemCount() > 0)
    {
      String lnxNodes[] = this.linuxNodeLst.getItems();
      map.put(Constants.LINUX_NODE_LIST, lnxNodes);
    }
    // webserver nodes
    if (this.ihsANodeLst != null && this.ihsANodeLst.getItemCount() > 0)
    {
      String webserverNodes[] = this.ihsANodeLst.getItems();
      map.put(Constants.WEBSERVER_NODE_LIST, webserverNodes);
    }

    // Conversion
    if (this.convNodeTable != null && this.convNodeTable.getItemCount() > 0)
    {
      String convNodes[] = new String[convNodeTable.getItemCount()];
      TableItem[] items = convNodeTable.getItems();
      conversionClusterServerNamesMap.clear();
      for (int i = 0; i < items.length; i++)
      {
        convNodes[i] = new String(items[i].getText(0));
        conversionClusterServerNamesMap.put(items[i].getText(0), items[i].getText(1));
      }

      map.put(Constants.CONV_NODES, convNodes);
    }
    // Docs
    if (this.docsNodeTable != null && this.docsNodeTable.getItemCount() > 0)
    {
      String docsNodes[] = new String[docsNodeTable.getItemCount()];
      TableItem[] items = docsNodeTable.getItems();
      docsClusterServerNamesMap.clear();
      for (int i = 0; i < items.length; i++)
      {
        docsNodes[i] = new String(items[i].getText(0));
        docsClusterServerNamesMap.put(items[i].getText(0), items[i].getText(1));
      }

      map.put(Constants.DOCS_NODES, docsNodes);
    }
    // Viewer
    if (this.viewerNodeTable != null && this.viewerNodeTable.getItemCount() > 0)
    {
      String viewerNodes[] = new String[viewerNodeTable.getItemCount()];
      TableItem[] items = viewerNodeTable.getItems();
      viewerClusterServerNamesMap.clear();
      for (int i = 0; i < items.length; i++)
      {
        viewerNodes[i] = new String(items[i].getText(0));
        viewerClusterServerNamesMap.put(items[i].getText(0), items[i].getText(1));
      }

      map.put(Constants.VIEWER_NODES, viewerNodes);
    }
    // Proxy
    if (this.proxyNodeTable != null && this.proxyNodeTable.getItemCount() > 0)
    {
      String proxyNodes[] = new String[proxyNodeTable.getItemCount()];
      TableItem[] items = proxyNodeTable.getItems();
      proxyClusterServerNamesMap.clear();
      for (int i = 0; i < items.length; i++)
      {
        proxyNodes[i] = new String(items[i].getText(0));
        proxyClusterServerNamesMap.put(items[i].getText(0), items[i].getText(1));
      }

      map.put(Constants.DOCS_PROXY_NODES, proxyNodes);
    }
    // Webserver
    if (this.ihsSrcBtn1.getSelection() && this.ihsNodeTable != null && this.ihsNodeTable.getItemCount() > 0)
    {
      String ihsNodes[] = new String[ihsNodeTable.getItemCount()];
      TableItem[] items = ihsNodeTable.getItems();
      for (int i = 0; i < items.length; i++)
      {
        ihsNodes[i] = new String(items[i].getText(0));
      }
      map.put(Constants.IHS_NODES, ihsNodes);
    }
    else if (this.ihsSrcBtn2.getSelection() && this.ihsWebURLText.getText() != null && this.ihsWebURLText.getText().trim() != "")
    {
      String ihsURL[] = new String[1];
      ihsURL[0] = this.ihsWebURLText.getText();
      map.put(Constants.IHS_URL, ihsURL);
    }

    String panelStatus[] = new String[1];
    if (validate)
    {
      panelStatus[0] = Constants.PANEL_STATUS_OK;
      map.put(Constants.NODE_IDENTIFICATION_PANEL, panelStatus);
    }
    else
    {
      panelStatus[0] = Constants.PANEL_STATUS_FAILED;
      map.put(Constants.NODE_IDENTIFICATION_PANEL, panelStatus);
    }

    final ICustomPanelData data = this.getCustomPanelData();
    IAgentJob[] dataJobs = data.getAllJobs();
    final IOffering myOffering = Util.findOffering(dataJobs, OFFERING_ID);
    final NodeTable nodeTable = new NodeTable(this.convNodeTable, this.docsNodeTable, this.viewerNodeTable, this.proxyNodeTable);
    // save to nodeList
    SaveServerNames(conversionClusterServerNamesMap, nodeTable.getConversionClusterServerNamesStringMap());
    SaveServerNames(docsClusterServerNamesMap, nodeTable.getDocsClusterServerNamesStringMap());
    SaveServerNames(viewerClusterServerNamesMap, nodeTable.getViewerClusterServerNamesStringMap());
    SaveServerNames(proxyClusterServerNamesMap, nodeTable.getProxyClusterServerNamesStringMap());
    nodeTable.setConversionClusterName(conversionClusterNameText.getText());
    nodeTable.setDocsClusterName(docsClusterNameText.getText());
    nodeTable.setViewerClusterName(viewerClusterNameText.getText());
    nodeTable.setProxyClusterName(proxyClusterNameText.getText());
    if (async)
    {
      final Job validatingJob = new Job(Messages.Message_WASInfoPanel_Validating$label)
      {
        protected IStatus run(IProgressMonitor monitor)
        {
          dataJobsStatus = NodeIdentificationPanel.this.getAgent().validateOfferingUserData(myOffering, map);
          return Status.OK_STATUS;
        }
      };
      validatingJob.addJobChangeListener(new JobChangeAdapter()
      {
        public void done(IJobChangeEvent e)
        {
          validated(data, dataJobsStatus, map, nodeTable, async);
        }
      });
      validatingJob.schedule();
    }
    else
    {
      dataJobsStatus = this.getAgent().validateOfferingUserData(myOffering, map);
      validated(data, dataJobsStatus, map, nodeTable, async);
    }
  }

  /**
   * @see com.ibm.cic.agent.ui.extensions.BaseWizardPanel#performFinish(org.eclipse.core.runtime.IProgressMonitor)
   */
  @Override
  public IStatus performFinish(IProgressMonitor monitor)
  {
    // TODO: Implement perform finish
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
    topContainer = toolkit.createComposite(parent);

    /*
     * The layout of a composite is very important and defines how widgets will be organized when added to the composite. A GridLayout is
     * very commonly used and adds UI elements left-to-right in columns. The declaration below indicates that the UI elements will be layed
     * out in two columns.
     * 
     * You can read about layouts here: http://www.eclipse.org/articles/article.php?file=Article-Understanding-Layouts/index.html
     * 
     * You can also refer to the java documentation for the specific layout you choose to understand how to configure it.
     */
    GridLayout gl = new GridLayout(2, false);
    gl.verticalSpacing = 0;
    gl.marginHeight = 0;
    topContainer.setLayout(gl);
    /*
     * The parent composite uses a GridLayout. This call is telling the layout for the parent composite to lay the top container out such
     * that it fills all of the available horizontal and vertical space and grabs all available horizontal and vertical space.
     */
    topContainer.setLayoutData(new GridData(SWT.FILL, SWT.FILL, true, true));

    this.createPanelControls(topContainer, toolkit);
    this.setControl(topContainer);
  }

  public void doClick(Button button)
  {
    if (button == convAddBtn)
    {
      String sSelections[] = winNodeLst.getSelection();
      if (sSelections.length > 0)
      {
        addSelectedNodeIntoTable(convNodeTable, sSelections);
        winNodeLst.deselectAll();
      }
    }
    else if (button == convRemoveBtn)
    {
      if (convNodeTable.getSelectionCount() > 0)
      {
        String sSelections[] = new String[convNodeTable.getSelectionCount()];
        TableItem items[] = convNodeTable.getSelection();
        for (int i = 0; i < items.length; i++)
        {
          sSelections[i] = new String(items[i].getText(0));
        }

        addSelectedNodeIntoList(winNodeLst, sSelections);
        removeRow(convNodeTable, items);
      }

    }
    else if (button == docsAddBtn)
    {
      if (winNodeLst.getSelectionCount() > 0)
      {
        // Consistent ostype of node list
        if (docsNodeTable.getItemCount() == 0
            || (docsNodeTable.getItemCount() > 0 && getOSType(docsNodeTable).equalsIgnoreCase(Constants.WINDOWS)))
        {
          String sSelections[] = winNodeLst.getSelection();
          addSelectedNodeIntoTable(docsNodeTable, sSelections);
          winNodeLst.deselectAll();
        }
      }
      else if (linuxNodeLst.getSelectionCount() > 0)
      {
        // Consistent ostype of node list
        if (docsNodeTable.getItemCount() == 0
            || (docsNodeTable.getItemCount() > 0 && getOSType(docsNodeTable).equalsIgnoreCase(Constants.LINUX)))
        {
          String sSelections[] = linuxNodeLst.getSelection();
          addSelectedNodeIntoTable(docsNodeTable, sSelections);
          linuxNodeLst.deselectAll();
        }
      }
    }
    else if (button == docsRemoveBtn)
    {
      if (docsNodeTable.getSelectionCount() > 0)
      {
        String sSelections[] = new String[docsNodeTable.getSelectionCount()];
        TableItem items[] = docsNodeTable.getSelection();
        for (int i = 0; i < items.length; i++)
        {
          sSelections[i] = new String(items[i].getText(0));
        }

        if (getOSType(docsNodeTable).equalsIgnoreCase(Constants.WINDOWS))
        {
          addSelectedNodeIntoList(winNodeLst, sSelections);
        }
        else if (getOSType(docsNodeTable).equalsIgnoreCase(Constants.LINUX))
        {
          addSelectedNodeIntoList(linuxNodeLst, sSelections);
        }
        removeRow(docsNodeTable, items);
      }
    }
    else if (button == viewerAddBtn)
    {
      if (winNodeLst.getSelectionCount() > 0)
      {
        // Consistent ostype of node list
        if (viewerNodeTable.getItemCount() == 0
            || (viewerNodeTable.getItemCount() > 0 && getOSType(viewerNodeTable).equalsIgnoreCase(Constants.WINDOWS)))
        {
          String sSelections[] = winNodeLst.getSelection();
          addSelectedNodeIntoTable(viewerNodeTable, sSelections);
          winNodeLst.deselectAll();
        }
      }
      else if (linuxNodeLst.getSelectionCount() > 0)
      {
        // Consistent ostype of node list
        if (viewerNodeTable.getItemCount() == 0
            || (viewerNodeTable.getItemCount() > 0 && getOSType(viewerNodeTable).equalsIgnoreCase(Constants.LINUX)))
        {
          String sSelections[] = linuxNodeLst.getSelection();
          addSelectedNodeIntoTable(viewerNodeTable, sSelections);
          linuxNodeLst.deselectAll();
        }
      }
    }
    else if (button == viewerRemoveBtn)
    {
      if (viewerNodeTable.getSelectionCount() > 0)
      {
        String sSelections[] = new String[viewerNodeTable.getSelectionCount()];
        TableItem items[] = viewerNodeTable.getSelection();
        for (int i = 0; i < items.length; i++)
        {
          sSelections[i] = new String(items[i].getText(0));
        }

        if (getOSType(viewerNodeTable).equalsIgnoreCase(Constants.WINDOWS))
        {
          addSelectedNodeIntoList(winNodeLst, sSelections);
        }
        else if (getOSType(viewerNodeTable).equalsIgnoreCase(Constants.LINUX))
        {
          addSelectedNodeIntoList(linuxNodeLst, sSelections);
        }
        removeRow(viewerNodeTable, items);
      }

    }
    else if (button == proxyAddBtn)
    {
      if (winNodeLst.getSelectionCount() > 0)
      {
        // Consistent ostype of node list
        if (proxyNodeTable.getItemCount() == 0
            || (proxyNodeTable.getItemCount() > 0 && getOSType(proxyNodeTable).equalsIgnoreCase(Constants.WINDOWS)))
        {
          String sSelections[] = winNodeLst.getSelection();
          addSelectedNodeIntoTable(proxyNodeTable, sSelections);
          winNodeLst.deselectAll();
        }
      }
      else if (linuxNodeLst.getSelectionCount() > 0)
      {
        // Consistent ostype of node list
        if (proxyNodeTable.getItemCount() == 0
            || (proxyNodeTable.getItemCount() > 0 && getOSType(proxyNodeTable).equalsIgnoreCase(Constants.LINUX)))
        {
          String sSelections[] = linuxNodeLst.getSelection();
          addSelectedNodeIntoTable(proxyNodeTable, sSelections);
          linuxNodeLst.deselectAll();
        }
      }
    }
    else if (button == proxyRemoveBtn)
    {
      if (proxyNodeTable.getSelectionCount() > 0)
      {
        String sSelections[] = new String[proxyNodeTable.getSelectionCount()];
        TableItem items[] = proxyNodeTable.getSelection();
        for (int i = 0; i < items.length; i++)
        {
          sSelections[i] = new String(items[i].getText(0));
        }

        if (getOSType(proxyNodeTable).equalsIgnoreCase(Constants.WINDOWS))
        {
          addSelectedNodeIntoList(winNodeLst, sSelections);
        }
        else if (getOSType(proxyNodeTable).equalsIgnoreCase(Constants.LINUX))
        {
          addSelectedNodeIntoList(linuxNodeLst, sSelections);
        }
        removeRow(proxyNodeTable, items);
      }
    }
    else if (button == ihsAddBtn)
    {
      String sSelections[] = ihsANodeLst.getSelection();
      if (sSelections.length > 0)
      {
        addSelectedNodeIntoTable(ihsNodeTable, sSelections);
        ihsANodeLst.deselectAll();
      }
    }
    else if (button == ihsRemoveBtn)
    {
      if (ihsNodeTable.getSelectionCount() > 0)
      {
        String sSelections[] = new String[ihsNodeTable.getSelectionCount()];
        TableItem items[] = ihsNodeTable.getSelection();
        for (int i = 0; i < items.length; i++)
        {
          sSelections[i] = new String(items[i].getText(0));
        }

        addSelectedNodeIntoList(ihsANodeLst, sSelections);
        removeRow(ihsNodeTable, items);
      }
    }
    else if (button == ihsSrcBtn1)
    {
      ihsANodeLst.setEnabled(true);
      ihsWebURLText.setEnabled(false);
      ihsANodeLst.setEnabled(true);
      ihsNodeTable.setEnabled(true);
    }
    else if (button == ihsSrcBtn2)
    {
      ihsANodeLst.setEnabled(false);
      ihsWebURLText.setEnabled(true);
      ihsAddBtn.setEnabled(false);
      ihsRemoveBtn.setEnabled(false);
      ihsNodeTable.setEnabled(false);
    }

    verifyComplete(false, false);
  }

  public void doSelection(Table table)
  {
    if (table.getSelection().length > 0)
    {
      if (table == convNodeTable)
      {
        deSelectionListWidget(NodeListType.COMP_NODE_LIST, false);
        docsRemoveBtn.setEnabled(false);
        viewerRemoveBtn.setEnabled(false);
        proxyRemoveBtn.setEnabled(false);
        // convNodeLst.deselectAll();
        docsNodeTable.deselectAll();
        viewerNodeTable.deselectAll();
        proxyNodeTable.deselectAll();
        ihsNodeTable.deselectAll();
      }
      else if (table == docsNodeTable)
      {
        deSelectionListWidget(NodeListType.COMP_NODE_LIST, false);
        convRemoveBtn.setEnabled(false);
        viewerRemoveBtn.setEnabled(false);
        proxyRemoveBtn.setEnabled(false);
        convNodeTable.deselectAll();
        // docsNodeLst.deselectAll();
        viewerNodeTable.deselectAll();
        proxyNodeTable.deselectAll();
        ihsNodeTable.deselectAll();
      }
      else if (table == viewerNodeTable)
      {
        deSelectionListWidget(NodeListType.COMP_NODE_LIST, false);
        convRemoveBtn.setEnabled(false);
        docsRemoveBtn.setEnabled(false);
        // viewerRemoveBtn.setEnabled(false);
        proxyRemoveBtn.setEnabled(false);
        convNodeTable.deselectAll();
        docsNodeTable.deselectAll();
        // viewerNodeLst.deselectAll();
        proxyNodeTable.deselectAll();
        ihsNodeTable.deselectAll();
      }
      else if (table == proxyNodeTable)
      {
        deSelectionListWidget(NodeListType.COMP_NODE_LIST, false);
        convRemoveBtn.setEnabled(false);
        docsRemoveBtn.setEnabled(false);
        viewerRemoveBtn.setEnabled(false);
        // proxyRemoveBtn.setEnabled(false);
        convNodeTable.deselectAll();
        docsNodeTable.deselectAll();
        viewerNodeTable.deselectAll();
        // proxyNodeLst.deselectAll();
        ihsNodeTable.deselectAll();
      }
      else if (table == ihsNodeTable)
      {
        deSelectionListWidget(NodeListType.COMP_NODE_LIST, true);
      }

      verifyComplete(false, false);
    }
  }

  public void doSelection(List list)
  {
    if (list.getSelection().length > 0)
    {
      // Widget Status
      if (list == winNodeLst)
      {
        deSelectionListWidget(NodeListType.ALL_NODE_LIST, false);
        // winNodeLst.deselectAll();
        linuxNodeLst.deselectAll();
        ihsANodeLst.deselectAll();
      }
      else if (list == linuxNodeLst)
      {
        deSelectionListWidget(NodeListType.ALL_NODE_LIST, false);
        convAddBtn.setEnabled(false);
        winNodeLst.deselectAll();
        // linuxNodeLst.deselectAll();
        ihsANodeLst.deselectAll();
      }
      else if (list == ihsANodeLst)
      {
        deSelectionListWidget(NodeListType.ALL_NODE_LIST, true);
        winNodeLst.deselectAll();
        linuxNodeLst.deselectAll();
        // ihsANodeLst.deselectAll();
      }

      verifyComplete(false, false);
    }
  }

  public void addSelectedNodeIntoList(List list, String contents[])
  {
    if (list != null && contents.length > 0)
    {

      for (int index = 0; index < contents.length; index++)
      {
        if (list.indexOf(contents[index]) == -1)
          list.add(contents[index]);
      }
      list.setSelection(contents);
    }
  }

  private void addSelectedNodeIntoTable(Table table, String contents[])
  {
    if (table != null && contents.length > 0)
    {
      TableItem newItem = null;
      for (int index = 0; index < contents.length; index++)
      {
        boolean found = false;
        TableItem[] items = table.getItems();
        for (int i = 0; i < items.length; i++)
        {
          if (items[i].getText(0).equals(contents[index]))
          {
            found = true;
            newItem = items[i];
            break;
          }
        }
        if (!found)
        {
          if (table != ihsNodeTable)
          {
            int c = list2clusterServerCounter.get(table);
            list2clusterServerCounter.put(table, c + 1);
            String serverName = list2clusterDefaultServerName.get(table) + Integer.toString(c);

            newItem = addRow(table, contents[index], serverName);
          }
          else
          {
            newItem = addRow(table, contents[index], "");
          }
        }
      }

      if (newItem != null)
        table.setSelection(newItem);
    }
  }

  public void deSelectionListWidget(NodeListType srcNLType, boolean bIsWeb)
  {
    if (!bIsWeb)
    {
      if (srcNLType == NodeListType.ALL_NODE_LIST)
      {
        // Component Node List
        convNodeTable.deselectAll();
        docsNodeTable.deselectAll();
        viewerNodeTable.deselectAll();
        proxyNodeTable.deselectAll();
        ihsANodeLst.deselectAll();
        // Btm
        convAddBtn.setEnabled(true);
        docsAddBtn.setEnabled(true);
        viewerAddBtn.setEnabled(true);
        proxyAddBtn.setEnabled(true);

        convRemoveBtn.setEnabled(false);
        docsRemoveBtn.setEnabled(false);
        viewerRemoveBtn.setEnabled(false);
        proxyRemoveBtn.setEnabled(false);
      }
      else if (srcNLType == NodeListType.COMP_NODE_LIST)
      {
        // Whole Node List
        winNodeLst.deselectAll();
        linuxNodeLst.deselectAll();
        ihsANodeLst.deselectAll();

        convAddBtn.setEnabled(false);
        docsAddBtn.setEnabled(false);
        viewerAddBtn.setEnabled(false);
        proxyAddBtn.setEnabled(false);

        convRemoveBtn.setEnabled(true);
        docsRemoveBtn.setEnabled(true);
        viewerRemoveBtn.setEnabled(true);
        proxyRemoveBtn.setEnabled(true);
      }
      ihsAddBtn.setEnabled(false);
      ihsRemoveBtn.setEnabled(false);
    }
    else
    {
      convAddBtn.setEnabled(false);
      docsAddBtn.setEnabled(false);
      viewerAddBtn.setEnabled(false);
      proxyAddBtn.setEnabled(false);

      convRemoveBtn.setEnabled(false);
      docsRemoveBtn.setEnabled(false);
      viewerRemoveBtn.setEnabled(false);
      proxyRemoveBtn.setEnabled(false);

      winNodeLst.deselectAll();
      linuxNodeLst.deselectAll();

      convNodeTable.deselectAll();
      docsNodeTable.deselectAll();
      viewerNodeTable.deselectAll();
      proxyNodeTable.deselectAll();

      if (srcNLType == NodeListType.ALL_NODE_LIST)
      {
        ihsAddBtn.setEnabled(true);
        ihsRemoveBtn.setEnabled(false);
        ihsNodeTable.deselectAll();
      }
      else if (srcNLType == NodeListType.COMP_NODE_LIST)
      {
        ihsAddBtn.setEnabled(false);
        ihsRemoveBtn.setEnabled(true);
        ihsANodeLst.deselectAll();
      }
    }
  }

  public String getOSType(List list)
  {
    if (list != null && list.getItemCount() > 0)
    {
      String sItem = list.getItem(0);
      for (int index = 0; index < nodeList.size(); index++)
      {
        // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT;
        String[] nodeInfo = nodeList.get(index);
        if (nodeInfo[3].equalsIgnoreCase(sItem))
        {
          return nodeInfo[1];
        }
      }
    }

    return null;
  }

  public String getOSType(Table table)
  {
    if (table != null && table.getItemCount() > 0)
    {
      String sItem = table.getItem(0).getText();
      for (int index = 0; index < nodeList.size(); index++)
      {
        // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT;
        String[] nodeInfo = nodeList.get(index);
        if (nodeInfo[3].equalsIgnoreCase(sItem))
        {
          return nodeInfo[1];
        }
      }
    }

    return null;
  }

  private void validated(final ICustomPanelData data, final IStatus dataJobsStatus, final Map<String, String[]> dataMap,
      final NodeTable nodeTable, boolean async)
  {
    if (dataJobsStatus.isOK())
    {
      final IProfile profile = data.getProfile();

      // *** Save the user's input in the profile
      if (dataMap.get(Constants.CONV_NODES) != null)
      {
        profile.setUserData(Constants.CONV_NODES, Messages.getString("Message_NodeIdentificationPanel_Conv$listTip"));
        profile.setOfferingUserData(Constants.CONV_NODES, IMUtil.convertListToString(nodeListInfo, dataMap.get(Constants.CONV_NODES),
            Constants.APPLICATION_SERVER, Constants.NONE_CLUSTER), OFFERING_ID);
        profile.setOfferingUserData(Constants.CONV_SCOPE_NAME, nodeTable.getConversionClusterName(), OFFERING_ID);
      }
      if (dataMap.get(Constants.DOCS_NODES) != null)
      {
        profile.setUserData(Constants.DOCS_NODES, Messages.getString("Message_NodeIdentificationPanel_Docs$listTip"));
        profile.setOfferingUserData(Constants.DOCS_NODES, IMUtil.convertListToString(nodeListInfo, dataMap.get(Constants.DOCS_NODES),
            Constants.APPLICATION_SERVER, Constants.NONE_CLUSTER), OFFERING_ID);
        profile.setOfferingUserData(Constants.DOCS_SCOPE_NAME, nodeTable.getDocsClusterName(), OFFERING_ID);
      }
      if (dataMap.get(Constants.VIEWER_NODES) != null)
      {
        profile.setUserData(Constants.VIEWER_NODES, Messages.getString("Message_NodeIdentificationPanel_Viewer$listTip"));
        profile.setOfferingUserData(Constants.VIEWER_NODES, IMUtil.convertListToString(nodeListInfo, dataMap.get(Constants.VIEWER_NODES),
            Constants.APPLICATION_SERVER, Constants.NONE_CLUSTER), OFFERING_ID);
        profile.setOfferingUserData(Constants.VIEWER_SCOPE_NAME, nodeTable.getViewerClusterName(), OFFERING_ID);
      }
      if (dataMap.get(Constants.DOCS_PROXY_NODES) != null)
      {
        profile.setUserData(Constants.DOCS_PROXY_NODES, Messages.getString("Message_NodeIdentificationPanel_Proxy$listTip"));
        profile.setOfferingUserData(Constants.DOCS_PROXY_NODES, IMUtil.convertListToString(nodeListInfo,
            dataMap.get(Constants.DOCS_PROXY_NODES), Constants.APPLICATION_SERVER, Constants.NONE_CLUSTER), OFFERING_ID);

      }

      String webserver = null;
      if(!IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE))
      {
        profile.setOfferingUserData(Constants.IHS_NODES, "", OFFERING_ID);
        profile.setOfferingUserData(Constants.IHS_SERVER_NAME, "", OFFERING_ID);
      }
      if (dataMap.get(Constants.IHS_NODES) != null || dataMap.get(Constants.IHS_URL) != null)
      {
        profile.setUserData(Constants.CONVERSION_URL, "");
        profile.setUserData(Constants.DOCS_URL, "");
        profile.setUserData(Constants.VIEWER_URL, "");
        profile.setUserData(Constants.IC_FILES_URL, "");
        profile.setUserData(Constants.IC_CONNECTIONS_URL, "");
        profile.setUserData(Constants.IHS_SERVER_NAME, "");

        if (dataMap.get(Constants.IHS_NODES) != null)
        {
          profile.setUserData(Constants.IHS_NODES, Messages.getString("Message_NodeIdentificationPanel_IHS$listTip"));
          profile.setOfferingUserData(Constants.IHS_NODES,
              IMUtil.convertListToString(nodeListInfo, dataMap.get(Constants.IHS_NODES), Constants.WEB_SERVER, Constants.NONE_CLUSTER),
              OFFERING_ID);
          webserver = dataMap.get(Constants.IHS_NODES)[0];
          if (webserver != null)
          {
            String ihs_server_name = nodeMapInfo.get(new NodeID(Constants.NONE_CLUSTER, webserver, Constants.WEB_SERVER))[6];
            profile.setOfferingUserData(Constants.IHS_SERVER_NAME, ihs_server_name, OFFERING_ID);

            String ihs_host_name = nodeMapInfo.get(new NodeID(Constants.NONE_CLUSTER, webserver, Constants.WEB_SERVER))[0];
            webserver = "http://" + ihs_host_name;
          }
        }
        else if (dataMap.get(Constants.IHS_URL) != null)
        {
          webserver = dataMap.get(Constants.IHS_URL)[0];
          if (webserver != null)
            webserver = webserver.trim();
        }

        if (webserver != null && !"".equals(webserver.trim()))
        {
          profile.setOfferingUserData(Constants.CONVERSION_URL, webserver + "/conversion", OFFERING_ID);
          profile.setOfferingUserData(Constants.DOCS_URL, webserver + "/docs", OFFERING_ID);
          profile.setOfferingUserData(Constants.VIEWER_URL, webserver + "/viewer", OFFERING_ID);
          profile.setOfferingUserData(Constants.IC_FILES_URL, webserver + "/files", OFFERING_ID);
          profile.setOfferingUserData(Constants.IC_CONNECTIONS_URL, webserver + "/connections", OFFERING_ID);

          profile.setOfferingUserData(Constants.DOCS_CONV_SERVICE_URL, webserver + "/conversion", OFFERING_ID);
          profile.setOfferingUserData(Constants.SD_VIEWER_FULLY_HOSTNAME, webserver + "/viewer", OFFERING_ID);
          profile.setOfferingUserData(Constants.DOCS_CONN_FILES_URL, webserver + "/files", OFFERING_ID);
        }
        else
        {
          if (profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID) != null)
            profile.removeUserData((new StringBuilder(String.valueOf(Constants.IHS_SERVER_NAME))).append(',').append(OFFERING_ID)
                .toString());
          profile.setOfferingUserData(Constants.CONVERSION_URL, SAMPLE_URL + "/conversion", OFFERING_ID);
          profile.setOfferingUserData(Constants.DOCS_URL, SAMPLE_URL + "/docs", OFFERING_ID);
          profile.setOfferingUserData(Constants.VIEWER_URL, SAMPLE_URL + "/viewer", OFFERING_ID);
          profile.setOfferingUserData(Constants.IC_FILES_URL, SAMPLE_URL + "/files", OFFERING_ID);
          profile.setOfferingUserData(Constants.IC_CONNECTIONS_URL, SAMPLE_URL + "/connections", OFFERING_ID);

          profile.setOfferingUserData(Constants.DOCS_CONV_SERVICE_URL, SAMPLE_URL + "/conversion", OFFERING_ID);
          profile.setOfferingUserData(Constants.SD_VIEWER_FULLY_HOSTNAME, SAMPLE_URL + "/viewer", OFFERING_ID);
          profile.setOfferingUserData(Constants.DOCS_CONN_FILES_URL, SAMPLE_URL + "/files", OFFERING_ID);
        }
      }
      else
      {
        if (profile.getOfferingUserData(Constants.IHS_SERVER_NAME, OFFERING_ID) != null)
          profile.removeUserData((new StringBuilder(String.valueOf(Constants.IHS_SERVER_NAME))).append(',').append(OFFERING_ID).toString());
        profile.setOfferingUserData(Constants.CONVERSION_URL, SAMPLE_URL + "/conversion", OFFERING_ID);
        profile.setOfferingUserData(Constants.DOCS_URL, SAMPLE_URL + "/docs", OFFERING_ID);
        profile.setOfferingUserData(Constants.VIEWER_URL, SAMPLE_URL + "/viewer", OFFERING_ID);
        profile.setOfferingUserData(Constants.IC_FILES_URL, SAMPLE_URL + "/files", OFFERING_ID);
        profile.setOfferingUserData(Constants.IC_CONNECTIONS_URL, SAMPLE_URL + "/connections", OFFERING_ID);

        profile.setOfferingUserData(Constants.DOCS_CONV_SERVICE_URL, SAMPLE_URL + "/conversion", OFFERING_ID);
        profile.setOfferingUserData(Constants.SD_VIEWER_FULLY_HOSTNAME, SAMPLE_URL + "/viewer", OFFERING_ID);
        profile.setOfferingUserData(Constants.DOCS_CONN_FILES_URL, SAMPLE_URL + "/files", OFFERING_ID);
      }
      
      profile.setOfferingUserData(Constants.IC_ADMIN_J2C_ALIAS, "connectionsAdmin", OFFERING_ID);
      profile.setOfferingUserData(Constants.EMPTY_VALUE, "", OFFERING_ID);
      
      new UIJob("") //$NON-NLS-1$
      {
        public IStatus runInUIThread(IProgressMonitor monitor)
        {

          if (bValidated)
          {
            if( dataMap.get(Constants.IHS_NODES) != null  )
            {
              String websvr = dataMap.get(Constants.IHS_NODES)[0];
              if (websvr == null || websvr.equals(""))
              {
                setMessage(Messages.getString("Message_NodeIdentificationPanel_IHSNodeListEmpty$message"), IMessageProvider.ERROR);
                setPageComplete(false);
              }
              else
              {
                setMessage(Messages.getString("Message_NodeIdentificationPanel_ValidationSuccessful$msg"), IMessageProvider.INFORMATION);
                setPageComplete(true);
              }
  
              PanelStatusManagementService.force();
              canvas.setVisible(false);
              return Status.OK_STATUS;
            }
          }

          if (Boolean.valueOf(dataMap.get(Constants.NODE_IDENTIFICATION_PANEL)[0]))
          {
            if (!validateBtn.isDisposed())
            {
              validateBtn.setEnabled(false);
              canvas.setVisible(true);
            }
            // To configure wanted variables
            String invalidClusterName = null;
            String invalidServerName = null;
            try
            {
              invalidClusterName = nodeTable.getInvalidClusterName();
              invalidServerName = nodeTable.getInvalidServerName();
              if (invalidClusterName == null && invalidServerName == null)
              {
                ModalContext.run(new IRunnableWithProgress()
                {
                  public void run(IProgressMonitor monitor) throws InvocationTargetException, InterruptedException
                  {
                    setVarsSucceed = setInstallVars(dataMap, profile, nodeTable);
                    ModalContext.checkCanceled(monitor);
                  }
                }, true, new NullProgressMonitor(), Display.getCurrent());
              }
              else
              {
                setVarsSucceed = false;
              }
            }
            catch (InvocationTargetException e)
            {
              setVarsSucceed = false;
            }
            catch (InterruptedException e)
            {
              setVarsSucceed = false;
            }
            // Update button, dynamic image, message and complete status
            if (!NodeIdentificationPanel.this.isDisposed())
            {
              if (!setVarsSucceed && existedServerNames != null && existedServerNames.length() > 0)
              {
                String err = MessageFormat.format(Messages.Message_NodeIdentificationPanel_ValidationSuccessful$msg5, existedServerNames);
                setErrorMessage(err);
                validateBtn.setEnabled(true);
                canvas.setVisible(false);
                profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
                PanelStatusManagementService.statusNotify();
              }
              else if (!setVarsSucceed && (invalidClusterName == null && invalidServerName == null))
              {
                setErrorMessage(Messages.getString("Message_WASInfoPanel_ValidationQueryData$msg"));
                validateBtn.setEnabled(true);
                canvas.setVisible(false);
                profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
                PanelStatusManagementService.statusNotify();
              }
              else if (invalidClusterName != null)
              {
                String err = MessageFormat.format(Messages.Message_NodeIdentificationPanel_ValidationSuccessful$msg3, invalidClusterName);
                setErrorMessage(err);
                validateBtn.setEnabled(true);
                canvas.setVisible(false);
                profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
                PanelStatusManagementService.statusNotify();
              }
              else if (invalidServerName != null)
              {
                String err = MessageFormat.format(Messages.Message_NodeIdentificationPanel_ValidationSuccessful$msg4, invalidServerName);
                setErrorMessage(err);
                validateBtn.setEnabled(true);
                canvas.setVisible(false);
                profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
                PanelStatusManagementService.statusNotify();
              }
              else
              {
                setErrorMessage(null);
                validateBtn.setEnabled(false);
                canvas.setVisible(false);

                if (ihsANodeLst != null && ihsANodeLst.getItemCount() > 0 && ihsNodeTable != null && ihsNodeTable.getItemCount() == 0)
                  setMessage(Messages.getString("Message_NodeIdentificationPanel_ValidationSuccessful$msg1"), IMessageProvider.WARNING);
                else if (ihsANodeLst != null && ihsANodeLst.getItemCount() == 0)
                  setMessage(Messages.getString("Message_NodeIdentificationPanel_ValidationSuccessful$msg1"), IMessageProvider.WARNING);
                else
                  setMessage(Messages.getString("Message_NodeIdentificationPanel_ValidationSuccessful$msg"), IMessageProvider.INFORMATION);

                bValidated = true;
                setPageComplete(true);
                relayout();	  
                PanelStatusManagementService.statusNotify();
              }
            }
          }
          else
          {
            if (!NodeIdentificationPanel.this.isDisposed())
            {
              validateBtn.setEnabled(true);
              canvas.setVisible(false);
              setErrorMessage(Messages.Message_NodeIdentificationPanel_Validate$Tips);
              setPageComplete(false);
              relayout();	  
              profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
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

          if (!NodeIdentificationPanel.this.isDisposed())
          {
            setErrorMessage(dataJobsStatus.getMessage());
            setPageComplete(false);
            validateBtn.setEnabled(true);
            canvas.setVisible(false);
            relayout();	  
            data.getProfile().setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, Constants.PANEL_STATUS_FAILED, OFFERING_ID);
          }

          return Status.OK_STATUS;
        }
      }.schedule();
    }
  }

  private boolean setInstallVars(final Map<String, String[]> dataMap, final IProfile profile, final NodeTable nodeTable)
  {
    // *** Determine if this is an install or a install_node based on whether or not the application
    // *** was previously installed or not.
    boolean bRet = true;
    ICustomPanelData data = this.getCustomPanelData();
    if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_INSTALL))
    {
      StringBuffer clusterInfo = new StringBuffer();

      String allClusterNames = profile.getOfferingUserData(Constants.ALL_CLUSTER_NAMES, OFFERING_ID);
      if (allClusterNames != null)
      {
        clusterInfo.append(allClusterNames);
      }
      else
      {
        clusterInfo.append("__None__");
      }

      String adminName = profile.getOfferingUserData(Constants.WASADMIN, OFFERING_ID);
      String adminPwd = profile.getOfferingUserData(Constants.PASSWORD_OF_WASADMIN, OFFERING_ID);
      String profilePath = profile.getOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, OFFERING_ID);
      adminPwd = EncryptionUtils.decrypt(adminPwd);
      Map<String, String> values = new HashMap<String, String>();
      try
      {
        IAgentJob[] jobs = data.getAllJobs();
        IFeature[] iFeatures = jobs[0].getFeaturesArray();
        boolean bSuc = false;
        // clustername::::nodename::servername:::nodename::servername;clustername::::nodename::servername:::nodename::servername;

        for (int i = 0; i < iFeatures.length; i++)
        {
          if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(Constants.IBMCONVERSION))
          {
            String conversionClusterName = nodeTable.getConversionClusterName();
            if (nodeTable.getConvItemCount() > 0)
            {
              if (clusterInfo.length() == 0)
              {
                clusterInfo.append(conversionClusterName);
              }
              else
              {
                clusterInfo.append(Util.LIST_SEPRATOR).append(conversionClusterName);
              }

              {
                String nodesIdentified[] = nodeTable.getConvItems();
                StringBuffer nodeInfoStr = new StringBuffer();
                for (int index = 0; index < nodesIdentified.length; index++)
                {
                  String serverName = nodeTable.getConversionClusterServerNamesStringMap().get(nodesIdentified[index]);
                  if (index == 0)
                  {
                    clusterInfo.append(Constants.SEPARATE_CHARS).append(nodesIdentified[index]).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(serverName);
                    nodeInfoStr
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(conversionClusterName);
                  }
                  else
                  {
                    clusterInfo.append(Constants.SEPARATE_SUB_CHARS).append(nodesIdentified[index])
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName);
                    nodeInfoStr.append(Util.LIST_SEPRATOR)
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(conversionClusterName);
                  }
                }
                // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
                values.put(Constants.CONV_NODES, nodeInfoStr.toString());
              }
            }
            else
            {
              return false;
            }
          }
          else if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(Constants.IBMDOCS))
          {
            String docsClusterName = nodeTable.getDocsClusterName();
            if (nodeTable.getDocsItemCount() > 0)
            {
              if (clusterInfo.length() == 0)
              {
                clusterInfo.append(docsClusterName);
              }
              else
              {
                clusterInfo.append(Util.LIST_SEPRATOR).append(docsClusterName);
              }

              {
                String nodesIdentified[] = nodeTable.getDocsItems();
                StringBuffer nodeInfoStr = new StringBuffer();
                for (int index = 0; index < nodesIdentified.length; index++)
                {
                  String serverName = nodeTable.getDocsClusterServerNamesStringMap().get(nodesIdentified[index]);
                  if (index == 0)
                  {
                    clusterInfo.append(Constants.SEPARATE_CHARS).append(nodesIdentified[index]).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(serverName);
                    nodeInfoStr
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(docsClusterName);
                  }
                  else
                  {
                    clusterInfo.append(Constants.SEPARATE_SUB_CHARS).append(nodesIdentified[index])
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName);
                    nodeInfoStr.append(Util.LIST_SEPRATOR)
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(docsClusterName);
                  }
                }
                // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
                values.put(Constants.DOCS_NODES, nodeInfoStr.toString());
              }
            }
            else
            {
              return false;
            }
          }
          else if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(Constants.IBMVIEWER))
          {
            String viewerClusterName = nodeTable.getViewerClusterName();
            if (nodeTable.getViewerItemCount() > 0)
            {
              if (clusterInfo.length() == 0)
              {
                clusterInfo.append(viewerClusterName);
              }
              else
              {
                clusterInfo.append(Util.LIST_SEPRATOR).append(viewerClusterName);
              }

              {
                String nodesIdentified[] = nodeTable.getViewerItems();
                StringBuffer nodeInfoStr = new StringBuffer();
                for (int index = 0; index < nodesIdentified.length; index++)
                {
                  String serverName = nodeTable.getViewerClusterServerNamesStringMap().get(nodesIdentified[index]);
                  if (index == 0)
                  {
                    clusterInfo.append(Constants.SEPARATE_CHARS).append(nodesIdentified[index]).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(serverName);
                    nodeInfoStr
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(viewerClusterName);
                  }
                  else
                  {
                    clusterInfo.append(Constants.SEPARATE_SUB_CHARS).append(nodesIdentified[index])
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName);
                    nodeInfoStr.append(Util.LIST_SEPRATOR)
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(viewerClusterName);
                  }
                }
                // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::servername::clustername;
                values.put(Constants.VIEWER_NODES, nodeInfoStr.toString());
              }
            }
            else
            {
              return false;
            }
          }
          else if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(Constants.IBMDOCSPROXY))
          {
            String proxyClusterName = nodeTable.getProxyClusterName();
            if (nodeTable.getProxyItemCount() > 0)
            {
              if (clusterInfo.length() == 0)
              {
                clusterInfo.append("__is_proxy__").append(proxyClusterName);
              }
              else
              {
                clusterInfo.append(Util.LIST_SEPRATOR).append("__is_proxy__").append(Constants.SEPARATE_CHARS).append(proxyClusterName);
              }

              {
                String nodesIdentified[] = nodeTable.getProxyItems();
                StringBuffer nodeInfoStr = new StringBuffer();
                for (int index = 0; index < nodesIdentified.length; index++)
                {
                  String serverName = nodeTable.getProxyClusterServerNamesStringMap().get(nodesIdentified[index]);
                  if (index == 0)
                  {
                    clusterInfo.append(Constants.SEPARATE_CHARS).append(nodesIdentified[index]).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(serverName);
                    nodeInfoStr
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(proxyClusterName);
                  }
                  else
                  {
                    clusterInfo.append(Constants.SEPARATE_SUB_CHARS).append(nodesIdentified[index])
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName);
                    nodeInfoStr.append(Util.LIST_SEPRATOR)
                        .append(nodeListInfo.get(new NodeID(Constants.NONE_CLUSTER, nodesIdentified[index], Constants.APPLICATION_SERVER)))
                        .append(Constants.SEPARATE_SUB_SUB_CHARS).append(serverName).append(Constants.SEPARATE_SUB_SUB_CHARS)
                        .append(proxyClusterName);
                  }
                }
                // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
                values.put(Constants.DOCS_PROXY_NODES, nodeInfoStr.toString());
              }
            }
            else
            {
              return false;
            }
          }
        }

        allClusterNames = nodeTable.getAllClusterNames();
        if (allClusterNames != null)
        {
          profile.setOfferingUserData(Constants.ALL_CLUSTER_NAMES, allClusterNames, OFFERING_ID);
        }

        if (clusterInfo.length() > 0)
        {
          String scriptPath = IMUtil.getScriptsPath(data.getProfile());
          existedServerNames = new StringBuffer("");
          bSuc = Util.crateClusterAndServer(profilePath, adminName, adminPwd, clusterInfo.toString(), scriptPath, existedServerNames);
        }
        else
        {
          bSuc = true;
        }

        if (bSuc)
        {
          if (values.get(Constants.CONV_NODES) != null)
            profile.setOfferingUserData(Constants.CONV_NODES, values.get(Constants.CONV_NODES), OFFERING_ID);
          if (values.get(Constants.DOCS_NODES) != null)
            profile.setOfferingUserData(Constants.DOCS_NODES, values.get(Constants.DOCS_NODES), OFFERING_ID);
          if (values.get(Constants.VIEWER_NODES) != null)
            profile.setOfferingUserData(Constants.VIEWER_NODES, values.get(Constants.VIEWER_NODES), OFFERING_ID);
          if (values.get(Constants.DOCS_PROXY_NODES) != null)
          {
            profile.setOfferingUserData(Constants.DOCS_PROXY_NODES, values.get(Constants.DOCS_PROXY_NODES), OFFERING_ID);
            profile.setUserData(Constants.DOCS_PROXY_NAME, "");
            profile.setOfferingUserData(Constants.DOCS_PROXY_NAME, nodeTable.getProxyClusterName(), OFFERING_ID);
          }
        }
        else
        {
          logger.log(ILogLevel.ERROR, "Failed to create clusters and servers"); // NON-NLS-1
          bRet = false;
          return bRet;
        }

      }
      catch (IOException e)
      {
        logger.log(ILogLevel.ERROR, "Check if script was failed to run in WebSphere Application Server environment. {0}", e); // NON-NLS-1
        // Note: Tolerate and assume this is the first install in the cluster and full cluster install is required
        bRet = false;
        return bRet;
      }
      catch (InterruptedException e)
      {
        logger.log(ILogLevel.ERROR, "Check if script was failed to run in WebSphere Application Server environment. {0}", e); // NON-NLS-1
        // Note: Tolerate and assume this is the first install in the cluster and full cluster install is required
        bRet = false;
        return bRet;
      }
      // String panelStatus = dataMap.get(Constants.COLLECT_WAS_INFORMATION_PANEL);
      profile.setUserData(Constants.NODE_IDENTIFICATION_PANEL, "");
      profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, dataMap.get(Constants.NODE_IDENTIFICATION_PANEL)[0], OFFERING_ID);
    }
    else
    {
      profile.setUserData(Constants.NODE_IDENTIFICATION_PANEL, "");
      profile.setOfferingUserData(Constants.NODE_IDENTIFICATION_PANEL, dataMap.get(Constants.NODE_IDENTIFICATION_PANEL)[0], OFFERING_ID);
    }

    return bRet;
  }
}

class NodeTable
{
  private int convItemCount = 0;

  private int docsItemCount = 0;

  private int viewerItemCount = 0;

  private int proxyItemCount = 0;

  private String[] convItems = new String[0];

  private String[] docsItems = new String[0];

  private String[] viewerItems = new String[0];

  private String[] proxyItems = new String[0];

  // save server name to map for non-ui thread
  private Map<String, String> conversionClusterServerNamesStringMap = new HashMap<String, String>();

  private Map<String, String> docsClusterServerNamesStringMap = new HashMap<String, String>();

  private Map<String, String> viewerClusterServerNamesStringMap = new HashMap<String, String>();

  private Map<String, String> proxyClusterServerNamesStringMap = new HashMap<String, String>();

  // save cluster name
  private String conversionClusterName;

  private String docsClusterName;

  private String viewerClusterName;

  private String proxyClusterName;

  private String invalidChars[] = { " ", "/", "\\", "*", ",", ":", ";", "=", "+", "?", "|", "<", ">", "&", "%", "\'", "\"", ".", "#", "$",
      "~", "(", ")" };

  private String invalidComb = "]]>";

  public boolean isValid(String name)
  {
    if (name == null)
      return true;
    for (String c : invalidChars)
    {
      if (name.contains(c))
        return false;
    }
    if (name.contains(invalidComb))
      return false;
    return true;
  }

  public String getInvalidInMap(Map<String, String> m)
  {
    String serverName;
    for (String nodeName : m.keySet())
    {
      serverName = m.get(nodeName);
      if (!isValid(serverName))
        return serverName;
    }
    return null;
  }

  public String getInvalidClusterName()
  {
    if (!isValid(conversionClusterName))
      return conversionClusterName;
    if (!isValid(docsClusterName))
      return docsClusterName;
    if (!isValid(viewerClusterName))
      return viewerClusterName;
    if (!isValid(proxyClusterName))
      return proxyClusterName;
    return null;
  }

  public String getInvalidServerName()
  {
    String inv = getInvalidInMap(conversionClusterServerNamesStringMap);
    if (inv != null)
      return inv;
    inv = getInvalidInMap(docsClusterServerNamesStringMap);
    if (inv != null)
      return inv;
    inv = getInvalidInMap(viewerClusterServerNamesStringMap);
    if (inv != null)
      return inv;
    inv = getInvalidInMap(proxyClusterServerNamesStringMap);
    if (inv != null)
      return inv;

    return null;
  }

  public String getAllClusterNames()
  {
    String[] clusters = { conversionClusterName, docsClusterName, viewerClusterName, proxyClusterName };
    String clustersString = "";
    for (String c : clusters)
    {
      if (c != null)
        clustersString += Util.LIST_SUB_SEPRATOR + c;
    }
    if (clustersString != "")
      return clustersString.substring(1);

    return null;
  }

  public String getConversionClusterName()
  {
    return conversionClusterName;
  }

  public void setConversionClusterName(String conversionClusterName)
  {
    this.conversionClusterName = conversionClusterName;
  }

  public String getDocsClusterName()
  {
    return docsClusterName;
  }

  public void setDocsClusterName(String docsClusterName)
  {
    this.docsClusterName = docsClusterName;
  }

  public String getViewerClusterName()
  {
    return viewerClusterName;
  }

  public void setViewerClusterName(String viewerClusterName)
  {
    this.viewerClusterName = viewerClusterName;
  }

  public String getProxyClusterName()
  {
    return proxyClusterName;
  }

  public void setProxyClusterName(String proxyClusterName)
  {
    this.proxyClusterName = proxyClusterName;
  }

  public Map<String, String> getConversionClusterServerNamesStringMap()
  {
    return conversionClusterServerNamesStringMap;
  }

  public Map<String, String> getDocsClusterServerNamesStringMap()
  {
    return docsClusterServerNamesStringMap;
  }

  public Map<String, String> getViewerClusterServerNamesStringMap()
  {
    return viewerClusterServerNamesStringMap;
  }

  public Map<String, String> getProxyClusterServerNamesStringMap()
  {
    return proxyClusterServerNamesStringMap;
  }

  public NodeTable(Table convNodeTable, Table docsNodeTable, Table viewerNodeTable, Table proxyNodeTable)
  {
    if (convNodeTable != null)
    {
      this.convItemCount = convNodeTable.getItemCount();
      // this.convItems = convNodeList.getItems();
      this.convItems = new String[this.convItemCount];
      TableItem[] items = convNodeTable.getItems();
      for (int i = 0; i < items.length; i++)
      {
        this.convItems[i] = new String(items[i].getText(0));
      }
    }
    if (docsNodeTable != null)
    {
      this.docsItemCount = docsNodeTable.getItemCount();
      // this.docsItems = docsNodeList.getItems();
      this.docsItems = new String[this.docsItemCount];
      TableItem[] items = docsNodeTable.getItems();
      for (int i = 0; i < items.length; i++)
      {
        this.docsItems[i] = new String(items[i].getText(0));
      }
    }
    if (viewerNodeTable != null)
    {
      this.viewerItemCount = viewerNodeTable.getItemCount();
      // this.viewerItems = viewerNodeList.getItems();
      this.viewerItems = new String[this.viewerItemCount];
      TableItem[] items = viewerNodeTable.getItems();
      for (int i = 0; i < items.length; i++)
      {
        this.viewerItems[i] = new String(items[i].getText(0));
      }
    }
    if (proxyNodeTable != null)
    {
      this.proxyItemCount = proxyNodeTable.getItemCount();
      // this.proxyItems = proxyNodeList.getItems();
      this.proxyItems = new String[this.proxyItemCount];
      TableItem[] items = proxyNodeTable.getItems();
      for (int i = 0; i < items.length; i++)
      {
        this.proxyItems[i] = new String(items[i].getText(0));
      }
    }
  }

  public int getConvItemCount()
  {
    return convItemCount;
  }

  public int getDocsItemCount()
  {
    return docsItemCount;
  }

  public int getViewerItemCount()
  {
    return viewerItemCount;
  }

  public int getProxyItemCount()
  {
    return proxyItemCount;
  }

  public String[] getConvItems()
  {
    return convItems;
  }

  public String[] getDocsItems()
  {
    return docsItems;
  }

  public String[] getViewerItems()
  {
    return viewerItems;
  }

  public String[] getProxyItems()
  {
    return proxyItems;
  }

}