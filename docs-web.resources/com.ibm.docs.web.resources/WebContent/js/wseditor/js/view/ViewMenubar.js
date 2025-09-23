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

dojo.provide("websheet.view.ViewMenubar");
dojo.require('dijit.MenuBar');
dojo.require('dijit.MenuBarItem');
dojo.require('dijit.Menu');
dojo.require('dijit.MenuItem');
dojo.require('dijit.PopupMenuBarItem');
dojo.require('dijit.PopupMenuItem');

dojo.registerModulePath("concord", "../concord");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("websheet", "base");

translateMenu = function() {
	var nls = dojo.i18n.getLocalization("concord.widgets", "menubar");
	dijit.byId("fileMenuBarItem").attr("label", nls.fileMenu);
	dijit.byId("exportToPDFItem").attr("label", nls.fileMenu_ExportAsPDF);
	dijit.byId("printItem").attr("label", nls.fileMenu_Print);

	dijit.byId("viewMenuBarItem").attr("label", nls.viewMenu);
	dijit.byId("gridLineItem").attr("label", nls.viewMenu_GridLines);

	dijit.byId("helpMenuBarItem").attr("label", nls.helpMenu);
	dijit.byId("overviewItem").attr("label", nls.helpMenu_Overview);
	dijit.byId("aboutItem").attr("label", nls.helpMenu_About);
}

exportToPDF = function() {
	if (!window.g_printDlg) {
		dojo.require("concord.util.uri");
		dojo.require("concord.main.App");
		dojo.require("concord.widgets.concordDialog");
		dojo.require("concord.widgets.print.sheetPrintToPdf");
		var nls = dojo.i18n.getLocalization("websheet","base");
		window.g_printDlg = new concord.widgets.print.sheetPrintToPdf({
			// dummy base
			saveDraft: function() {}
		}, nls.pageSetup);
	}
	
	g_printDlg.show();
}

triggerGridLines = function() {
	var n = g_sheetContainer.domNode;
	if (dijit.byId("gridLineItem").attr("checked")) {
		dojo.addClass(n, "noGridLines");
	} else {
		dojo.removeClass(n, "noGridLines");
	}
}


helpOverview = function() {
	window.open("about:blank");
}

helpAbout = function() {
	dojo.require("concord.util.dialogs");
	concord.util.dialogs.alert( concord_version );
}
