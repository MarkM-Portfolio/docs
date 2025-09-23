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

dojo.provide("concord.draftTab");

dojo.require("lconn.core.uiextensions");
dojo.require("lconn.files.scenes.AbstractSection");
dojo.require("concord.global");

(function() {
	dojo.provide("com.ibm.concord.lcext.DraftSection");
	dojo.declare("com.ibm.concord.lcext.DraftSection", lconn.files.scenes.AbstractSection, {
		constructor : function(app, scene) {
			this.id = "draft";
			this.htmlId = "concord_draft";
			this.app = app;
			this.scene = scene;
			this.hidden = false;
		},

		/*
		 * Generate the name of the tab. The item being displayed is passed to
		 * this method.
		 */
		getName : function(app, file) {
			return concord.global.nls.draft_tab_title;
		},

		/*
		 * Only valid for IBMDocs file's editors
		 */
		isValid : function(file, opt) {
			var extension = file.getExtension();
			var edit_format = {
				"ppt" : 1,
				"otp" : 1,
				"odp" : 1,
				"ods" : 1,
				"ots" : 1,
				"xls" : 1,
				"txt" : 1,
				"csv" : 1,
				"docx" : 1,
				"doc" : 1,
				"odt" : 1,
				"ott" : 1,
				"pptx" : 1,
				"xlsx" : 1,
				"xlsm" : 1
			};
			if (concord.global.isEditor(file) && (!file.isEncrypted()) && extension && edit_format[extension.toLowerCase()]) {
				if (concord.global.isIBMDocFile(file)) {
					return true;
				}
			}
			return false;
		},

		/*
		 * Called to display the body of the tab. d - the HTML document for this
		 * tab div - the container for the contents of the tab file - the item
		 * this tab is related to section - Equivalent to *this* opt - Contains
		 * references to the app and the scene
		 */
		render : function(d, div, file, section, opt) {
			var app = opt.app;
			var routes = app.routes;
			var scene = opt.scene;
			var user = scene.user;
			var nls = app.nls.ABOUT_FILE;
			var isExpanded = scene.isExpanded(section.id);
			var extension = file.getExtension();
			var edit_format = {
				"ppt" : 1,
				"odp" : 1,
				"ods" : 1,
				"xls" : 1,
				"txt" : 1,
				"csv" : 1,
				"docx" : 1,
				"doc" : 1,
				"odt" : 1,
				"pptx" : 1,
				"xlsx" : 1,
				"xlsm" : 1
			};
			// only valid for IBMDocs file
			if (concord.global.isEditor(file) && extension && (!file.isEncrypted()) && edit_format[extension.toLowerCase()]) {
				if (!concord.global.isIBMDocFile(file)) {
					return false;
				}
			} else {
				return false;
			}
			var chkurl = concord.global.getDocDraftURL(file);
			var userID = app.getAuthenticatedUserId();
			var resp, ioArgs;
			concord.global.xhrGet({
				url : chkurl,
				filesUserId : userID,
				handleAs : "json",
				preventCache : true,
				handle : function(r, io) {
					resp = r;
					ioArgs = io;
				},
				sync : true
			});

			// For document that not editing by IBM Docs, 404 is returned
			if (resp instanceof Error) {
				var divb = d.createElement("div");
				divb.innerHTML = concord.global.nls.draft_not_found;
				div.appendChild(divb);
				return;
			}

			var dft_dirty = resp.dirty;
			var dft_basever = resp.base_version;
			var dft_created = resp.created;
			var dft_lastedit = resp.modified;
			var dft_curedit = resp.editors;
			var dft_lasteditor = resp.lasteditor;
			// draft has been published
			if (!dft_dirty && dft_curedit.length <= 0) {
				var divm = d.createElement("div");
				divm.innerHTML = concord.global.nls.draft_published;
				div.appendChild(divm);
			}

			var divb = d.createElement("div");
			divb.className = "lotusChunk qkrVersions";
			var divt = d.createElement("div");
			divb.appendChild(divt);
			var table = d.createElement("table");
			table.cellSpacing = table.cellPadding = 0;
			table.className = "lotusTable";
			dijit.setWaiRole(table, "presentation");
			var tbody = d.createElement("tbody");

			var tr = d.createElement("tr");
			tr.className = "lotusFirst";
			var tdIcon = dojo.create("td", {}, tr);
			tdIcon.className = "lotusNowrap";
			var imagIcon = d.createElement("img");

			var DraftIconURL = concord.global.getIconBaseURL()+"ibmdocs_product_16.png";
			imagIcon.className = lconn.core.utilities.getFileIconClassName('.odt', 16);
			// Explictly remove the original background image defined in that
			// css class.
			dojo.style(imagIcon, "backgroundImage", "url(" + dijit._Widget.prototype._blankGif + ")");
			imagIcon.src = DraftIconURL;

			// fix png transparent problem using blank.gif
			/*
			 * var blankGif =
			 * (dojo.getObject("dijit._Widget.prototype._blankGif") ||
			 * "blank.gif").toString(); imagIcon.src = blankGif;
			 */
			tdIcon.appendChild(imagIcon);
			var tdDate = dojo.create("td", {}, tr);
			tdDate.className = "lotusNowrap";
			var convert_dft_lastedit = lconn.share.util.misc.date.convertAtomDate(dft_lastedit);
			df = new lconn.share.util.DateFormat(convert_dft_lastedit);
			formated_date_text = df.formatByAge(concord.global.nls.LABEL_DRAFT_TAB_EDIT);
			tdDate.appendChild(d.createTextNode(formated_date_text));
			if ("" != dft_lasteditor.id) {
				var tdEditor = dojo.create("td", {}, tr);
				tdEditor.className = "lotusNowrap";
				// for last draft editing
				var lasteditor = d.createElement("a");
				lasteditor.appendChild(d.createTextNode(dft_lasteditor.displayName));
				dft_lasteditor.name = dft_lasteditor.displayName;
				lconn.files.scenehelper.generateUserLink(app, routes, dft_lasteditor, lasteditor);
				tdEditor.appendChild(lasteditor);
			}
			var tdLink = dojo.create("td", {
				style : {
					width : "100%"
				}
			}, tr);
			// tdLink.className = 'lotusNowrap';
			var link_str = concord.global.getDocEditURL(file.getId());
			dojo.create('a', {
				href : link_str,
				target : "_blank",
				title : concord.global.nls.draft_edit_link,
				innerHTML : concord.global.nls.draft_edit_link
			}, tdLink);
			tbody.appendChild(tr);
			table.appendChild(tbody);
			divt.appendChild(table);
			div.appendChild(divb);
		}
	});


	// Register custom draft tab for a file, add a new "Custom Tab" to the file
	// summary page.
	lconn.core.uiextensions.add("lconn/files/tabs/file", function(s, tabs, app, scene) {
		if (concord.global.showConcordEntry()) {
			// In community files widget, the draft tab may be added more than one
			// time, so check if the tab exists or not firstly, please see detail in
			// defect 45730.
			try {
				var bHasAdded = false;
				var len = (typeof tabs != 'undefined') ? tabs.length : 0;
				for ( var index = len - 1; index >= 0; index--) {
					var sClassName = tabs[index].declaredClass;
					if ("com.ibm.concord.lcext.DraftSection" == sClassName) {
						bHasAdded = true;
						break;
					}
				}
				if (!bHasAdded) {
					tabs.push(new com.ibm.concord.lcext.DraftSection(app, scene));
				}
			} catch (e) {
				console.log("Error happens when adding tab to files UI: ", e);
			}
		}
	});
})();
