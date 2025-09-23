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

dojo.provide("concord.concord_sheet_mobile");

dojo.registerModulePath("websheet", "../wseditor/js");
dojo.require("concord.main.App");
dojo.require("concord.net.Session");
dojo.require("concord.beans.EditorStore");
dojo.require("concord.beans.RecentFiles");
dojo.require("concord.scenes.AbstractScene");
dojo.require("concord.widgets.CommentsEventListener");

dojo.require("concord.util.browser");
dojo.require("concord.util.mobileUtil");

dojo.require("websheet.Constant");
dojo.require("websheet.Helper");
dojo.require("websheet.ColumnHelper");
dojo.require("websheet.Cache");
dojo.require("websheet.RangeDataHelper");

dojo.require("websheet.style.StyleCode");

dojo.require("websheet.event.undo.UndoManager");
dojo.require("websheet.event.undo.Message");
dojo.require("websheet.event.Factory");
dojo.require("websheet.event.undo.Event");
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
dojo.require("websheet.event.undo.FreezeEvent");
dojo.require("websheet.event.undo.FilterEvent");
dojo.require("websheet.event.undo.MergeSplitEvent");
dojo.require("websheet.event.undo.UnnamedRangeEvent");
dojo.require("websheet.event.undo.SortRangeEvent");
dojo.require("websheet.event.undo.Range");
dojo.require("websheet.event.undo.RangeList");
dojo.require("websheet.event.undo.UndoRangeList");

dojo.require("websheet.TaskManager");
dojo.require("websheet.ConnectorBase");
dojo.require("concord.chart.controller.ChartProxy");

dojo.require("websheet.listener.NotifyEvent");
dojo.require("websheet.event.DocumentAgent");
dojo.require("websheet.model.IDManager");
dojo.require("websheet.event.IDManagerHelper");
dojo.require("concord.scenes.SheetDocSceneMobile");

dojo.require("websheet.functions.IObject");
dojo.require("websheet.event.OTManagerBase");
dojo.require("websheet.listener.Listener");

// OT module
dojo.require("websheet.event.Transformer");
// chart render
dojo.require("concord.chart.view.DojoChartAdapter");