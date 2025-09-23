/**
 * 
 *//* ***************************************************************** */
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
define([
        "dojo/_base/lang",
        'writer/constants',
        'writer/RTE',
		'concord/scenes/TextDocOfflineScene'], 
		function(lang, constants, RTE, TextDocOfflineScene) {

    	var editor = lang.mixin(lang.getObject("writer.htmlEditor", true), {
    		scene:null,

		    setEnv: function(param) {
		    	var contextpath = param ? param.contextPath : "";
		    	var rootpath = (param && param.staticRootPath) ? param.staticRootPath : "";
		    	var docId = param ? param.docId : null;
		    	var repository = param ? param.repository : null;
		    	var jobId = param ? param.jobId : null;
		    	var dbName = param ? param.dbName : null;
		    	var dbVersion = param ? parseInt(param.dbVersion) : null;
		    	
				window.g_bidiOn = "false"; // FIXME
				window.g_locale = this.normalizeLocale(navigator.userLanguage || navigator.language);
				window.contextPath = contextpath;
				window.staticRootPath = rootpath;
				window.DOC_SCENE = {};
				window.g_customizedFonts = {};
				window.g_maxImgSize = 8192; // FIXME
				
				if (docId != null && (typeof docId == "string") && docId.length != 0)
		        	DOC_SCENE.docId = docId;
		        if (repository != null)
		        	DOC_SCENE.repository = repository;
		        if (jobId != null)
		        	DOC_SCENE.jobId = jobId;
		        	
		        if (dbName != null && dbVersion != null)
		        	window.db && window.db.init(dbName, dbVersion);
		    },

			// The same normalization as I18nUtil.java
			normalizeLocale: function(locale) {
				// replace "_ with "-" and change to lower case
				locale = locale.toLowerCase().replace(/_/g, "-");		
				
				if (locale == "zh-hk" || locale == "zh-mo" || locale == "zh-hant-tw")
					locale = "zh-tw";
				else if (locale == "zh-sg" || locale == "zh" || locale == "zh-hans-cn")
					locale = "zh-cn";
				else if (locale == "nb" || locale == "nb-no" || locale == "nn-no" || locale == "nn")
					locale = "no";
				else if (locale == "ja-jp")
					locale = "ja";
				else if (locale == "ko" || locale == "ko-kp")
					locale = "ko-kr";
				else if (locale == "en")
					locale = "en-us";
				else if (locale.indexOf("iw") == 0)
					locale = "he";
				else if (locale == "in" || locale == "id-id" || locale == "in-id")
					locale = "id";
				else if (locale.indexOf("sr") == 0)
					locale = "sr-latn";
				
				return locale;
			},
			
			/*
			 * Initialize this editor, create offline scene object
			 */
		    init: function(param) {
		    	this.setEnv(param);
		    	
				this.app = window.pe = {};
				this.scene = window.pe.scene = new TextDocOfflineScene(this, window.DOC_SCENE);
				
				if (this.scene.isNote()) {
					var me = this;
					me._noteSub = dojo.subscribe(constants.EVENT.LOAD_READY, function() {
						dojo.connect(window, "onresize", me, "_resizeNote");
						dojo.unsubscribe(me._noteSub);
					});
			    }
		    },

			_resizeNote: function() {
				clearTimeout(this._noteRelayoutTimer);
				
				var scene = this.scene;
				this._noteRelayoutTimer = setTimeout(function() {
					scene.checkNoteSection(scene.noteSection);
					var editor = scene.getEditor();
					editor.layoutEngine.rootView.updateSection(scene.noteSection, null);
				}, 200);
			},

			/*
			 * Create toolbar once, load data content into document model and render it
			 */
			render: function() {
				this.scene.render();
			},

			/*
			 * Set data that will be loaded into document model later
			 */
			setData: function(type, docData) {
				this.scene.setData(type, docData);
			},

			/*
			 * Serialize document model into string content for either html or json type
			 * return the content in string
			 */
			getData: function(type) {
				return this.scene.getData(type);
			},
			
			/*
			 * Reset scene and document model, set correct docId
			 */
			setDocId: function(id) {
				if (!id || (typeof id != "string") || id.length == 0)
					return;
				
				this.scene.reset();
				
				DOC_SCENE.docId = id;
				this.scene.sceneInfo = {docId: id};
			},
			
			/*
			 * Set Dirty as false, and
			 * RTE: Save json content to browser indexDB
			 * Note App: post content as message to parent window with bSerialized being true
			 */
		    save: function(bSerialized) {
		    	var editor = this.scene.getEditor();
		        editor.execCommand('saveOffline', bSerialized);
		    },
		    
		    /*
		     * Check whether the content is dirty or not since either last save or autosave
		     */
		    isDirty: function() {
		    	return this.scene.isDirty();
		    },
		    
		    /*
		     * Exit this editor
		     */
		    exit: function() {
				dojo.publish(constants.EVENT.BEFORELEAVE)
		    }
    	});

    	return editor;
});