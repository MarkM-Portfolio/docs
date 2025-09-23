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

dojo.provide("concord.concord_sheet_widgets");

dojo.registerModulePath("websheet", "../wseditor/js");

// sidebar component
dojo.require("concord.widgets.sidebar.SideBar");

// dialogs
dojo.require("concord.widgets.LotusTextButton");
dojo.require("concord.widgets.LotusTextSelect");
dojo.require("concord.widgets.LotusUploader");
dojo.require("concord.widgets.print.sheetPrintToPdf");
dojo.require("concord.widgets.SaveDialog");
dojo.require("concord.widgets.PublishDialog");
dojo.require("concord.widgets.PreferencesDialog");
dojo.require("websheet.dialog.allFormulas");
dojo.require("websheet.dialog.InsertImageDlg");
dojo.require("concord.widgets.ImagePropertyDialog");
dojo.require("websheet.dialog.ImportDialog");
//dojo.require("websheet.widget.RangeViewer");
dojo.require("websheet.dialog.nameRange");
dojo.require("websheet.dialog.newName");
//dojo.require("concord.widgets.spreadsheetTemplates.Dialog");
dojo.require("concord.widgets.shareDocument");
dojo.require("concord.widgets.ProfileTypeAhead");
dojo.require("websheet.dialog.sortRange");
dojo.require("websheet.dialog.sortRangeConflict");
dojo.require("websheet.sort.RangeSorting");
dojo.require("websheet.dialog.spreadsheetSettings");
dojo.require("websheet.dialog.FindAndReplaceDlg");
dojo.require("websheet.widget.FindReplaceHandler");
dojo.require("websheet.widget.ImagePropHandler");
dojo.require("websheet.widget.NavigatorHandler");
dojo.require("concord.chart.dialogs.ChartTypesDlg");
dojo.require("concord.chart.dialogs.ChartPropDlg");
//dojo.require("websheet.widget.ImageDiv");
//dojo.require("websheet.widget.ChartDiv");