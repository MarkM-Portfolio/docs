/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.concord_sheet");

dojo.registerModulePath("websheet", "../wseditor/js");
dojo.require("concord.dijit_extra");
dojo.require("concord.main.App");
dojo.require("concord.net.Session");
dojo.require("concord.beans.EditorStore");
dojo.require("concord.beans.RecentFiles");
dojo.require("concord.scenes.AbstractScene");
dojo.require("dojox.cometd");
dojo.require("websheet.view.Settings");
dojo.require("concord.scenes.SheetDocScene");
dojo.require("concord.util.browser");
dojo.require("concord.util.mobileUtil");
dojo.require("concord.util.date");
dojo.require("concord.util.beta");
dojo.require("concord.util.unit");
dojo.require("dijit.Tooltip");
dojo.require("dijit.Dialog");	
dojo.require("dijit.TitlePane");
dojo.require("dijit.MenuBar");
dojo.require("dijit.MenuBarItem");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.MenuSeparator");
dojo.require("dijit.ProgressBar");
dojo.require("dijit.InlineEditBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.TextBox");

dojo.require("concord.util.uri");
dojo.require("concord.util.acf");
dojo.require("concord.beans.Document");
dojo.require("concord.beans.User");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.widgets.EncryptPwdValidatorDlg");
dojo.require("concord.widgets.DraftConflictOptsDlg");

dojo.require("websheet.parse.tokenBase");
dojo.require("websheet.parse.tokenList");
dojo.require("websheet.parse.tokenType");
dojo.require("websheet.parse.token");
dojo.require("websheet.parse.RefToken");
dojo.require("websheet.parse.UpdateRefToken");
dojo.require("websheet.parse.referenceToken");
dojo.require("websheet.parse.SharedFormulaRefBase");
dojo.require("websheet.parse.SharedFormulaRef4RulesObj");
dojo.require("websheet.parse.SharedFormulaRef4DV");
dojo.require("websheet.parse.SharedFormulaRef4CF");
dojo.require("websheet.parse.SharedReferenceRef");
dojo.require("websheet.Helper");
dojo.require("websheet.BrowserHelper");
dojo.require("websheet.Toolbar");
dojo.require("websheet.widget.FormulaBar");
dojo.require("websheet.event.DocumentAgent");
dojo.require("websheet.functions.Util");
dojo.require("websheet.functions.IObject");
dojo.require("websheet.layout.WorksheetContainer");
dojo.require("websheet.Collaborator");
dojo.require("websheet.layout.CollaboratorContainer");
dojo.require("websheet.Controller");
dojo.require("websheet.api");
dojo.require("websheet.ConnectorBase");
dojo.require("websheet.Connector");
dojo.require("websheet.collaboration.CommentsHandler");
dojo.require("websheet.widget.PaneManager");
dojo.require("websheet.widget.NameRangeHandler");
dojo.require("websheet.widget.DrawFrameHandler");
dojo.require("websheet.widget.ImageHandler");
dojo.require("websheet.widget.ShapeHandler");
dojo.require("websheet.widget.DrawFrameManager");
dojo.require("websheet.widget.FreezeHandler");
dojo.require("websheet.widget.ChartHandler");
dojo.require("websheet.widget.StatusBar");
dojo.require("websheet.Main");
dojo.require("websheet.event.undo.Event");
dojo.require("websheet.event.undo.Message");
dojo.require("websheet.event.undo.MessageTransformer");
dojo.require("websheet.event.undo.SetCellEvent");
dojo.require("websheet.event.undo.RowEvent");
dojo.require("websheet.event.undo.RowEvents");
dojo.require("websheet.event.undo.ColumnEvent");
dojo.require("websheet.event.undo.ColumnEvents");
dojo.require("websheet.event.undo.SheetEvents");
dojo.require("websheet.event.undo.ChartEvents");
dojo.require("websheet.event.undo.RangeEvents");
dojo.require("websheet.event.undo.UndoRangeList");
dojo.require("websheet.event.undo.UndoManager");
dojo.require("websheet.event.undo.FreezeEvent");
dojo.require("websheet.event.undo.SortRangeEvent");
dojo.require("websheet.event.undo.Range");
dojo.require("websheet.event.undo.RangeList");

dojo.require("websheet.style.StyleCode");
dojo.require("websheet.style.StyleManager");
dojo.require("websheet.Menubar");
dojo.require("websheet.model.RulesObject.RuleVal");
dojo.require("websheet.model.RulesObject.RulesObj");
dojo.require("websheet.model.RulesObject.RuleDataCache");
dojo.require("websheet.model.RulesObject.ConditionalFormat");
dojo.require("websheet.model.RulesObject.ConditionalCriteria");
dojo.require("websheet.model.RulesObject.ConditionalFvos");
dojo.require("websheet.model.RulesObject.DataValidation");
dojo.require("websheet.model.RulesObject.DummyFormulaCell");
dojo.require("websheet.model.BasicModel");
dojo.require("websheet.model._cell");
dojo.require("websheet.model.Cell");
dojo.require("websheet.model.StyleCell");
dojo.require("websheet.model.CoverInfo");
dojo.require("websheet.model.Column");
dojo.require("websheet.model.Row");
dojo.require("websheet.model.Range");
dojo.require("websheet.model.Document");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.model.SetRangeHelper");
dojo.require("websheet.model.RecoverManager");
dojo.require("websheet.model.PartialCalcManager");
dojo.require("websheet.CalcManager");
dojo.require("concord.widgets.FileDeepDetectDialog");
dojo.require("websheet.dialog.unsupportFeatureNotification");

dojo.require("websheet.Constant");
dojo.require("websheet.widget.DropDownButton");
dojo.require("websheet.config.ToolbarConfig");
dojo.require("websheet.config.config");
dojo.require("websheet.config.ContextMenuConfig");
dojo.require("websheet.model.IDManager");
dojo.require("websheet.event.Factory");
dojo.require("websheet.listener.NotifyEvent");
dojo.require("websheet.listener.BroadCaster");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.parse.Reference");
dojo.require("websheet.parse.AreaManager");
dojo.require("websheet.parse.FormulaLexer");
dojo.require("websheet.parse.FormulaParser");
dojo.require("websheet.sort.Sorter");
dojo.require("websheet.event.OTManagerBase");
dojo.require("websheet.event.OTManager");
dojo.require("websheet.i18n.numberRecognizer");
dojo.require("websheet.i18n.Number");
dojo.require("websheet.functions._textHelper");
dojo.require("websheet.Utils");
dojo.require("websheet.functions.Formulas");
dojo.require("websheet.style.CFStyleManager");

var ProfilePool = new concord.beans.ProfilePool();