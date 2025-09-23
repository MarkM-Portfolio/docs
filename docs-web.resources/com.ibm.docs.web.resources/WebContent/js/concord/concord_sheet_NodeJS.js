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

dojo.provide("concord.concord_sheet_NodeJS");

dojo.require("websheet.TaskManager");
dojo.require("websheet.parse.tokenBase");
dojo.require("websheet.parse.tokenList");
dojo.require("websheet.parse.tokenType");
dojo.require("websheet.parse.token");
dojo.require("websheet.parse.RefToken");
dojo.require("websheet.parse.UpdateRefToken");
dojo.require("websheet.parse.referenceToken");
dojo.require("websheet.parse.ReferenceList");
dojo.require("websheet.ColumnHelper");
dojo.require("websheet.Helper");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.Constant");
dojo.require("websheet.Math");
dojo.require("websheet.i18n.numberRecognizer");
dojo.require("websheet.i18n.Number");
dojo.require("websheet.BrowserHelper");
dojo.require("websheet.functions.IObject");
dojo.require("websheet.functions.Formulas");
dojo.require("websheet.functions.Util");

dojo.require('websheet.JsProxyModel.Document');
dojo.require('websheet.JsProxyModel.Cell');
dojo.require('websheet.JsProxyModel.Sheet');
dojo.require('websheet.JsProxyModel.IDManager');
dojo.require('websheet.JsProxyModel.Reference');
dojo.require('websheet.JsProxyModel.Calculator');
dojo.require('websheet.JsProxyModel.PartialCalcManager');
dojo.require('websheet.JsProxyModel.ReferenceList');
// setting for Nodes.js
websheet.functions.Object.JS = false;
