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

dojo.provide("websheet.view.SheetContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("concord.scenes", "Scene");

createSheetContainer = function(node) {
	// compute height
	var height = getSheetContainerHeight();
	var c = new dijit.layout.TabContainer({
		tabPosition: "bottom",
		style: "height: " + height + "px",
		useSlider: true,
		useMenu: false,
		"class": "fullString"
	}, node);

	dojo.connect(c, "selectChild", function(child) {
		var index = child.attr("sheetIndex");
		var sheet = g_sheets[index];
		if (!sheet.loaded) {
			var contentUrl = g_baseUrl + "/content-" + sheet["id"] + ".html";
			var nls = dojo.i18n.getLocalization("concord.scenes", "Scene");
			pe.base.showMessage(nls.loadMsg, 0);
			dojo.xhrGet({
				url: contentUrl,
				preventCache: true,
				timeout: 30000,
				handle: function(r, io) {
					var n = child.domNode;
					n.innerHTML = r;
					// get <script> tag and eval()
					dojo.query("script", n).forEach(function(n) {
						var s = n.innerHTML;
						dojo.eval(s);
					});
					
					sheet.loaded = true;
					// for ff, add a clear div after table
					if (dojo.isFF || dojo.isSafari) {
						dojo.place(dojo.create("div", { "class": "clear" }), child.domNode);
					}
					pe.base.onNewSheetLoaded(sheet["id"]);
					pe.base.hideMessage();
				}
			});
		}
	});
	
	c.startup();
	
	return c;
};

getSheetContainerHeight = function() {
	var bodyBox = dojo.marginBox(dojo.body());
	var titleBox = dojo.marginBox(dojo.byId("banner"));
	var menuBox = dojo.marginBox(dijit.byId("mainMenu").domNode);
	return bodyBox.h - titleBox.h - menuBox.h;
};
