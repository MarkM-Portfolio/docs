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
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/topic",
    "writer/constants",
    "concord/util/browser",
    "writer/controller/IndicatorManager",
    "writer/controller/UpdateManager",
    "writer/model/Numbering",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles",
    "writer/model/Document",
    "writer/track/trackChange",
    "writer/util/HelperTools"
], function(declare, lang, has, topic, constants, browser, IndicatorManager, UpdateManager, Numbering, Relations, Settings, Styles, Document, trackChange, HelperTools) {

    var LayoutEngine = declare("writer.controller.LayoutEngine", null, {
        constructor: function(editor) {
            this.editor = editor;
            this.init();
        },
        init: function() {
            this.initEnv();
        },
        start: function() {
            topic.publish(constants.EVENT.BEFORE_LOAD);
            this.loadDocument();
            setTimeout(lang.hitch(this, function() {
            	this.layoutDocument();
                this.renderDocument();
                setTimeout(function() {
                    topic.publish(constants.EVENT.FIRSTTIME_RENDERED);
                }, 200);
            }), 0);
        },
        initEnv: function() {

        },
        loadDocument: function() {
            // Use this flag to check if style has load finished. 
            // Avoid other place waiting the STYLE_LOADED event.
            this.styleLoaded = false;
            var docJson = this.editor.source;
            this.editor.indicatorManager = new IndicatorManager();
            this.editor.relations = new Relations(docJson.relations);
            this.editor.number = new Numbering(docJson.numbering);
            this.editor.styles = new Styles(docJson.style);
            this.editor.styles.createCSSStyle();
            topic.publish(constants.EVENT.STYLE_LOADED);

            this.editor.setting = new Settings(docJson.setting);
            trackChange.on = this.editor.setting.isTrackChangeOn();
            var maxSectPW = this.editor.setting.getMaxSectionPageWidth();
            this.editor.adjustPlaceHolder(maxSectPW);

            (browser.isMobile() || (browser.isMobileBrowser() && pe.scene && pe.scene.isHTMLViewMode())) && 
              concord.util.mobileUtil.viewport.init(maxSectPW + 20, screen.width);
            this.editor.updateManager = new UpdateManager();

            var enabledViewWaterMark = this.editor._viewModel && window.g_watermark && window.g_watermark.enabled 
            		&& (window.g_watermark.enabled.toLowerCase() == "true");
            enabledViewWaterMark && HelperTools.setViewWaterMark(this.editor, docJson);
            this.relationsLoading = true;
            this.editor.relations.loadContent();
            delete this.relationsLoading;
            this.contentLoading = true;
            this.editor.document = this.rootModel = new Document(docJson.content, this);
            this.contentLoaded = true;
            delete this.contentLoading;
            this.styleLoaded = true;
            this.editor.source = null;
        },
        layoutDocument: function() {
            this.rootView = this.rootModel.preLayout("rootView");
            topic.subscribe(constants.EVENT.UPDATEDELETESECTION, lang.hitch(this.rootView, "deleteSection"));
            topic.subscribe(constants.EVENT.UPDATEINSERTSECTION, lang.hitch(this.rootView, "insertSection"));
            topic.publish(constants.EVENT.PREMEASURE);
            this.rootView.layout(null, null, true);
        },
        renderDocument: function() {
            this.rootView.render();
            if (this.rootView.pages.length() == 0) {
                this.rootView.addPage();
            }

            this.editor.removePlaceHolder();
        },
        partialLayout: function() {
            var len = 4;
            var totalLen = this._getDataSouceLen();
            for (var i = 0; i < totalLen; i = i + len) {
                var e = this._getPartialDataSource(i, len);
                this.rootModel.append(e);
            }
        },
        _getPartialDataSource: function(begin, len) {
            var ret = [];
            for (var i = 0; i < len && i < this._getDataSouceLen(); i++) {
                ret.push(this.editor.source.content[i]);
            }
            return ret;
        },
        _getDataSouceLen: function() {
            return this.editor.source.content.length;
        }

    });

    return LayoutEngine;
});
