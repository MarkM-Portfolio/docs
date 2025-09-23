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

dojo.provide("websheet.view._ViewClientModel");

// client model components for formula cell & number format cell
dojo.require("websheet.parse.FormulaParseHelper");
dojo.require("websheet.parse.tokenList");
dojo.require("websheet.parse.tokenType");
dojo.require("websheet.parse.token");
dojo.require("websheet.parse.referenceToken");
dojo.require("websheet.Helper");
dojo.require("websheet.functions.Formulas");
dojo.require("websheet.functions.Util");
dojo.require("websheet.config.config");
dojo.require("websheet.style.StyleCode");
dojo.require("websheet.style.StyleManager");
dojo.require("websheet.model.Cell");
dojo.require("websheet.model.Column");
dojo.require("websheet.model.Row");
dojo.require("websheet.model.Document");
dojo.require("websheet.model.Sheet");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.Constant");
dojo.require("websheet.Utils");
dojo.require("websheet.model.RecoverManager");

window.g_partialLevel = websheet.Constant.PartialLevel.SHEET;

dojo.require("websheet.model.IDManager");
dojo.require("websheet.model.PartialManager");
dojo.require("websheet.listener.NotifyEvent");
dojo.require("websheet.listener.BroadCaster");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.parse.Reference");
dojo.require("websheet.parse.ReferenceList");
dojo.require("websheet.i18n.Number");
dojo.require("websheet.i18n.numberRecognizer");
dojo.require("websheet.Constant");
dojo.require("websheet.Math");
