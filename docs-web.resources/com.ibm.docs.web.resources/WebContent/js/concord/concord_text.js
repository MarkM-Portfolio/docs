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

dojo.provide("concord.concord_text");
dojo.registerModulePath("writer", "../writer/js");
dojo.require("concord.dijit_extra");
dojo.require("concord.main.App");
//classes from writer

dojo.require("writer.global");
dojo.require("writer.core.Range");
dojo.require("writer.controller.Editor");

//end
dojo.require("concord.net.Session");
dojo.require("concord.beans.EditorStore");
dojo.require("concord.beans.RecentFiles");
dojo.require("concord.scenes.AbstractScene");
dojo.require("concord.scenes.TextDocScene");
dojo.require("concord.scenes.TextDocSceneMobile");
dojo.require("concord.beans.User");
dojo.require("concord.beans.Profile");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.beans.Participant");
dojo.require("concord.beans.Task");
dojo.require("concord.beans.TaskAction");
dojo.require("concord.beans.TaskService");
dojo.require("concord.editor.EditorExtend");
dojo.require("concord.editor.PopularFonts");
dojo.require("concord.util.browser");
dojo.require("concord.util.mobileUtil");
dojo.require("concord.util.date");
dojo.require("concord.util.beta");
dojo.require("concord.util.unit");
dojo.require("concord.util.dialogs");
dojo.require("concord.widgets.EncryptPwdValidatorDlg");
dojo.require("concord.widgets.DraftConflictOptsDlg");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("concord.widgets.LotusTextSelect");
dojo.require("concord.widgets.LotusUploader");
dojo.require("concord.widgets.ProfileTypeAhead");
//dojo.require("concord.widgets.smartTable");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.widgets.tablePropertiesDlg");
//dojo.require("concord.widgets.concordTemplateGalleryDialog");
dojo.require("concord.widgets.spreadsheetTemplates.Dialog");
dojo.require("concord.widgets.SaveDialog");
dojo.require("concord.widgets.PublishDialog");
dojo.require("concord.widgets.PreferencesDialog");
dojo.require("concord.widgets.shareDocument");
dojo.require("concord.widgets.print.textPrintToPdf");
//dojo.require("concord.widgets.insertDate");
dojo.require("concord.widgets.viewTextForHtmlPrint");
//dojo.require("concord.widgets.insertTime");
dojo.require("concord.widgets.FindReplaceDlg");
//dojo.require("concord.widgets.InsertTableDlg");
dojo.require("concord.widgets.InsertImageDlg");
dojo.require("concord.widgets.ImagePropertyDialog");
dojo.require("concord.widgets.LinkDialog");
dojo.require("concord.widgets.specialcharDlg");
dojo.require("concord.widgets.TemplatedDialog");
dojo.require("concord.widgets.taskAssignmentDlg");
dojo.require("concord.widgets.deleteTaskDlg");
dojo.require("concord.widgets.selectActivityDialog");
dojo.require("concord.widgets.taskHistoryDlg");
dojo.require("concord.widgets.FileDeepDetectDialog");
dojo.require("concord.widgets.sidebar.SideBar");
dojo.require("concord.widgets.colorPickerDialog");
dojo.require("concord.widgets.print.textPrintToPdf");
dojo.require("concord.task.AbstractTaskHandler");
//dojo.require("concord.task.TextTaskHandler");
dojo.require("concord.task.CachedTask");
//dojo.require("concord.text.TextMsg");
//dojo.require("concord.text.tools");
dojo.require("concord.spellcheck.scaytservice");
dojo.require("concord.i18n.Collation");
dojo.require("concord.i18n.ClassName");
dojo.require("dojox.html.entities");
dojo.require("dijit.Tooltip");
dojo.require("dijit.Calendar");
dojo.require("dijit.Dialog");	
dojo.require("dijit.TitlePane");
dojo.require("dijit.MenuBar");
dojo.require("dijit.MenuBarItem");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.ColorPalette");
dojo.require("dijit.ProgressBar");
dojo.require("dijit.InlineEditBox");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout._TabContainerBase");
dojo.require("dijit.layout.TabController");
dojo.require("dijit.layout.ScrollingTabController");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form._FormSelectWidget");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form._DateTimeTextBox");
//dojo.require("concord.text.ListUtil");
//dojo.require("concord.text.CopyPasteUtil");
dojo.require("concord.text.Log");
dojo.requireLocalization("concord.scenes","Scene");
dojo.require("concord.widgets.HtmlViewerLoadingPage");

dojo.requireLocalization("concord.spellcheck", "spellcheckUI");
dojo.requireLocalization("concord.widgets","toolbar");
dojo.requireLocalization("concord.widgets","menubar");
dojo.requireLocalization("concord.widgets","toc");
dojo.requireLocalization("concord.widgets","CKResource");
dojo.requireLocalization("concord.widgets","outlineDlg");
dojo.requireLocalization("concord.widgets","tblContentBox");  // For smart table style
dojo.requireLocalization("concord.widgets","ImagePropHandler");
dojo.requireLocalization("dijit","common");
dojo.requireLocalization("dijit.form","validate");

var ProfilePool = new concord.beans.ProfilePool();

dojo.require("concord.util.acf");


dojo.require("writer.json"); 