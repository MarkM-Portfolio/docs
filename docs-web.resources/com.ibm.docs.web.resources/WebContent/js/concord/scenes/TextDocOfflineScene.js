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

dojo.provide("concord.scenes.TextDocOfflineScene");

dojo.require("dojo.topic");
dojo.require("writer.constants");
dojo.require("writer.template");
dojo.require("concord.util.BidiUtils");
dojo.require("writer.ui.toolbar.Toolbar");
dojo.require("writer.controller.Editor");
dojo.require("writer.global");
dojo.require("concord.editor.PopularFonts");
dojo.require("concord.beans.WebClipboard");

dojo.declare("concord.scenes.TextDocOfflineScene", null, {

	constructor: function(app, sceneInfo) {
		this.app = app;
		this.sceneInfo = sceneInfo || {};
		this.bCarriageReturn = false;
		this.bShowBookMark = false;
		this.bIndicatorAuthor = false;
		this.docType = "text";
		this.editPosition = {};
		this._note = true;
		this.localEdit = true;
		this._loaded = false;	
		
		this.editorContentChanged = false;
		this.sceneInfo.docId = (sceneInfo && sceneInfo.docId)? sceneInfo.docId : "MyNoteId";
	},

	isHTMLViewMode: function() {
		return false;
	},

	isViewCompactMode: function() {
		return false;
	},

	getEditorLeft: function() {
		return 0;
	},

	supportSaveShortCut: function() {
		return true;
	},

	addResizeListener: function() {
	},

	isNote: function() {
		return this._note;
	},

	isShowBookMark: function() {
		return this.bShowBookMark;
	},
	
	isCarriageReturn: function() {
		return bCarriageReturn;
	},

	getEditorStore: function() {
		return;
	},

	isIndicatorAuthor: function() {
		return this.bIndicatorAuthor;
	},

	instanceReady: function() {
		return true;
	},
	
	setFocus : function() {
		this.getEditor().focus();	
	},

	checkNoteSection: function(section) {
		section.pageMargin.header = 0;
		section.pageMargin.footer = 0;
		section.pageMargin.top = 0;
		section.pageMargin.bottom = 0;
		section.pageMargin.left = 60;
		section.pageMargin.right = 40;
		var screenSize = dojo.window.getBox();
		section.pageSize.w = screenSize.w - 20;
		section.pageSize.h = 10000000;
	},

	isTrackAuthor: function() {
		return false;
	},

	getEditor: function() {
		return pe.lotusEditor;
	},

	updateEditor: function() {
	},

	getCurrUserId: function() {
		return null;
	},

	getDocClipBoard: function() {
		if (!this.webClipboard) {
			this.webClipboard = new concord.beans.WebClipboard();
			this.webClipboard.setApp('doc'); 
		}
		return this.webClipboard;
	},
	
	showWarningMessage: function(text, interval,nojaws, key) {	
	},

	hideErrorMessage: function() {	
	},

	setData: function(type, data) {
		if(!data) return;
		
		if(!this.sceneInfo) 
			this.sceneInfo = {};
		if(!this.sceneInfo.docData)
			this.sceneInfo.docData = {};

		// the supported types are "json", "html" and "md"
		if(type == "json")
			this.sceneInfo.docData.json = data;
		else if (type == "html")
			this.sceneInfo.docData.html = data;
		else if (type == "md")
			this.sceneInfo.docData.md = data;
	},

	getData: function(type) {
		var editor = this.getEditor();
		return editor.document.getData(type);
	},

	reset: function() {
		this.editorContentChanged = false;
		
		this.sceneInfo.docId = null;
		DOC_SCENE.docId = null;

		var editor = this.getEditor();		
		// remove cursor
		var selection = editor.getSelection();
		var cursor = selection._cursor._domNode
		var node = null
		if (cursor) {
			node = cursor.parentNode;
			node && node.removeChild(cursor);
		}

		// reset Zoom
		var zoomBtn = dijit.registry.byId("D_t_Zoom");
		zoomBtn && zoomBtn.setLabel("100%");
		editor.execCommand('Zoom', 1);

		// close dialog
		dijit.registry.filter(function(dialog) {
		  return dialog && dialog.declaredClass == 'dijit.Dialog';
		}).forEach(function(dialog) {
		  dialog.onCancel();
		})

		// close find&replace bar
		var finder = dojo.byId('lotus_editor_floating_finder')
		finder && dojo.style(finder, "display", "none");

		editor.reset();

		// FIXME the reset function in Editor.js should be enhanced to restore editor status such as relocating cursor position
		var handler = dojo.topic.subscribe(writer.constants.EVENT.FIRSTTIME_RENDERED,  function(){
			editor.getSelection().moveTo(window.layoutEngine.rootView.getFirstViewForCursor(), 0);
			node && cursor && node.appendChild(cursor);
			handler.remove();
		});
	},
	
	render: function() {
		if (!this._loaded) {
			var header = dojo.byId("header");
			var BidiUtils = new concord.util.BidiUtils();
			if(BidiUtils.isGuiRtl())
				header.setAttribute('dir','rtl');
			dijit.setWaiRole(header, 'main');
			dijit.setWaiState(header, 'label', 'main');
			
			this.createToolbar();
			this.app.lotusEditor = pe.lotusEditor = new writer.controller.Editor();
			
			this._loaded = true;
		}

		this.load();
	},

	createToolbar: function() {
		var toolbarNode = document.createElement("div");
		toolbarNode.setAttribute('id', 'lotus_editor_toolbar');
		toolbarNode.className = 'dijit dijitToolbar docToolbar';
		header.appendChild(toolbarNode);

		this.toolbar = new writer.ui.toolbar.Toolbar();
		writer.global.createToolbar('lotus_editor_toolbar', this.toolbar, null, writer.global.ToolbarConstant.ToolbarMode.ALL);
	},

	load: function(){
		var state = {};
		var allItems = state.content = {};
		var docId = this.sceneInfo.docId;
		var self = this;
		var callback = function(docJson) {
			if(docJson){
				allItems.content = docJson.content;
				allItems.styles = docJson.styles;
				allItems.settings = docJson.settings;
				allItems.numbering = docJson.numbering;
				allItems.relations = docJson.relations;

				if(!(allItems.styles))
					allItems.styles = writer.template.getTemplateJson("styles");
				if(!(allItems.settings))
					allItems.settings = writer.template.getTemplateJson("settings");
				if(!(allItems.numbering))
					allItems.numbering = writer.template.getTemplateJson("numbering");
				if(!allItems.relations)
					allItems.relations = writer.template.getTemplateJson("relations");
				if(!allItems.relations.theme)
					allItems.relations.theme = writer.template.getTemplateJson("theme");
			} else {
				allItems.content = writer.template.getTemplateJson("content");
				allItems.styles = writer.template.getTemplateJson("styles");
				allItems.settings = writer.template.getTemplateJson("settings");
				allItems.numbering = writer.template.getTemplateJson("numbering");
				allItems.relations = writer.template.getTemplateJson("relations");
				
				if(!allItems.relations.theme)
					allItems.relations.theme = writer.template.getTemplateJson("theme");				
			}
			self.loadState(state);
		};
		
 		var docData = this.sceneInfo.docData; 
		if(docData){
			setTimeout(dojo.hitch(this,  function() {
				var docJson = null;
				if(docData.json){
					console.log("Get Json Data: true");
					docJson = JSON.parse(docData.json);
				} else if (docData.html){
					var toJsonFilter = new writer.filter.HtmlToJson();
					var content = toJsonFilter.toJson(docData.html, true);
					docJson = {"content":content};
				} else if (docData.md) {
					// TODO
				}

				callback(docJson);
			}), 0);
		} else {
			this.localEdit && this.getDocDataFromIdxDB(docId, callback);
		}
	},

	getDocDataFromIdxDB: function(docId, callback){
		this.idxDBData = 0;
		var self = this;
		window.db && window.db.get(docId, function(res){
			if(res){
				var docJson = JSON.parse(res.data);
				callback(docJson);
				self.idxDBData = 1;
				console.log("Get Json Data: true");
			} else {
				self.idxDBData = 2;
				console.log("Get Json Data: false");
			}
		});

		var htmlDocId = docId + ".html";
		window.db && window.db.get(htmlDocId, function(html){
			while(true){ 
				if(self.idxDBData) break;
			}
			if(self.idxDBData > 1) {
				var docJson = null;
				if(html && html.data){
					var toJsonFilter = new writer.filter.HtmlToJson();
					var content = toJsonFilter.toJson(html.data, true);
					docJson = {"content":content};
					console.log("No json Data, and get html Data: true");
				} else
					console.log("No json Data, and get html Data: false");

				callback(docJson);
			}
		});
	},

	loadState: function(state) {
		dijit.setWaiRole(dojo.body(), 'application');
		dijit.setWaiState(dojo.body(), "labelledby", "doc_title_text");
		var editorFrame = document.getElementById('editorFrame');
		dijit.setWaiState(editorFrame, 'label', 'Edit Pane for ');
		dijit.setWaiState(editorFrame, 'labelledby', 'doc_title_text');
		var jsonCnt = this._assembleContent(state);
		var editor = this.getEditor();
		editor.currentScene = this;
		editor.setData(jsonCnt);
		editor.startEngine();
		dojo.connect(document, 'onkeypress', this, 'onKeyPress');
	},

	_assembleContent: function(state) {
		var jsonCnt = {}, cnt = state.content;
		jsonCnt.content = cnt.content && cnt.content.body;
		jsonCnt.style = cnt.styles;
		jsonCnt.setting = cnt.settings;
		jsonCnt.numbering = cnt.numbering;
		jsonCnt.relations = cnt.relations;
		
		return jsonCnt;
	},

	printHtml: function() {
		pe.lotusEditor.execCommand('Print');
	},
	
	onKeyPress: function(evt) {
		if (evt.ctrlKey /* && editor.fire('hotkey',evt) */
				|| (dojo.isMac && evt.metaKey)) {
			// #defect 20809
			if (evt.altKey) {
				return;
			}
			if (evt.charCode == 83 || evt.charCode == 115) {
				if (this.supportSaveShortCut())
					this.saveDraft();
				dojo.stopEvent(evt);
			} else if (evt.charCode == 80 || evt.charCode == 112) {
				this.printHtml(pe.lotusEditor);
				dojo.stopEvent(evt);
			}
		} else if (evt.keyCode == dojo.keys.PAGE_DOWN) {
			// 45044 [FF]focus should be on menu when menu pops up
			// and edit window should not receive keyboard messages
			// dojo.stopEvent(evt);
		} else if (evt.keyCode == 27) // ESC
		{
			setTimeout(function() {
				pe.lotusEditor.focus();
			}, 0);
		}
	},
	
	/*
	 * Check whether the content is dirty or not since either last save or autosave,
	 * it is only useful for offline note application.
	 */
	isDirty: function() {
		return this.editorContentChanged;
	},
	
	/*
	 * Set the dirty flag of note content with 'dirty'
	 */
	setDirty: function(dirty) {
		this.editorContentChanged = dirty;
	}
});