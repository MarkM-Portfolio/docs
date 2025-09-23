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

dojo.provide("concord.concord_sheet_extras");

dojo.registerModulePath("websheet", "../wseditor/js");
// spell check
dojo.require("websheet.widget.ScSpellCheckDlgHandler");
dojo.require("concord.spellcheck.SpellCheckDlgHandler");
dojo.require("concord.spellcheck.scaytservice");
dojo.require("concord.spellcheck.SpellCheckDlg");

//ACL module
dojo.require("websheet.ACL.UserMultiSelector");
dojo.require("websheet.ACL.PermissionWidget");
dojo.require("websheet.ACL.UserIconList");
dojo.require("websheet.ACL.PermissionItem");
dojo.require("websheet.ACL.PermissionPane");
dojo.require("websheet.ACL.BehaviorCheckHandler");
dojo.require("websheet.ACL.UserHandler");
dojo.require("websheet.ACL.ViewHandler");
dojo.require("websheet.ACL.PermissionController");

// task assignment
//dojo.require("concord.beans.TaskService");
//dojo.require("concord.beans.Activity");
//dojo.require("concord.task.AbstractTaskHandler");
//dojo.require("concord.task.TaskStoreProxy");
//dojo.require("websheet.collaboration.TaskHandler");
//dojo.require("websheet.collaboration.TaskFrame");
//dojo.require("websheet.dialog.assignTask");
//dojo.require("concord.widgets.selectActivityDialog");
//dojo.require("concord.widgets.taskAssignmentDlg");
//dojo.require("concord.widgets.deleteTaskDlg");

//DataValidation
dojo.require("websheet.DataValidation.DataSelectionHelper");
dojo.require("websheet.DataValidation.DataValidationHandler");
dojo.require("websheet.DataValidation.ValidationPane");
dojo.require("websheet.DataValidation.ValidationWarning");
dojo.require("websheet.DataValidation.ValidationWidget");

// OT module
//dojo.require("websheet.event.Transformer");
// csv export
dojo.require("websheet.datasource.Exporter");
// chart render
dojo.require("concord.chart.view.DojoChartAdapter");
