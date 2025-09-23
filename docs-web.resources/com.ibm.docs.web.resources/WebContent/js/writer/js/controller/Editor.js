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
    "dojo/topic",
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/i18n!writer/nls/lang",
    "dojo/i18n!concord/scenes/nls/Scene",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/aspect",
    "dojo/query",
    "dojox/html/metrics",
    "concord/util/browser",
    "writer/constants",
    "writer/controller/EditShell",
    "writer/core/Command",
    "writer/plugins/PluginsLoader",
    "writer/util/RangeTools",
    "writer/common/MeasureText",
    "writer/msg/msgCenter",
    "writer/controller/LayoutEngine",
    "writer/common/RangeIterator",
    "writer/track/trackChange",
    "writer/global"
], function(topic, declare, domStyle, domClass, array, dom, lang, has, i18nlang, i18nScene, domConstruct, on, aspect, query, metrics, browser, constants, EditShell, Command, PluginsLoader, RangeTools, MeasureText, msgCenter, LayoutEngine, RangeIterator, trackChange, global) {

    var Editor = declare("writer.controller.Editor", null, {
        constructor: function() {
            this._viewModel = pe.scene.isHTMLViewMode();
            this._commands = [];
            this.editorHandlers = [];
            this.defaultStyle = {};
            this.dropdwonState = {
                "color": "auto",
                "backgroundColor": "auto"
            };
            this._enableCommand = ['find', "left", "to_left", "left_ctrl", "to_left_ctrl", "right", "to_right", "right_ctrl", "to_right_ctrl",
                "up", "to_up", "down", "to_down", "pageup", "pagedown", "to_pageup", "to_pagedown",
                "home", "to_home", "home_ctrl", "to_home_ctrl", "end", "end_ctrl", "to_end", "to_end_ctrl", "selectAll"
            ];
            this.init();
        },
        _shell: null,

        styleIndex: 1, // Only use for generate css.
        _pluginsLoader: null,
        _scale: 1,
        padding: 10,

        _viewModel: false,

        init: function() {
            this._css = ["/styles/css/writer/writer.css"];
            this._keystrokes = {};
            this.lists = {}; // Record all lists
            this.placeholder = {};
            this.getEditorDIV();

            this.renderPlaceholder();

            metrics.initOnFontResize();

            var handler = topic.subscribe(constants.EVENT.FIRSTTIME_RENDERED, lang.hitch(this, this._regEvent));
            this.editorHandlers.push(handler);

            if (!this._viewModel || !window.g_disableCopy){
            	this._enableCommand.push('copy');
            }

            this._pluginsLoader = new PluginsLoader(this);
            this._pluginsLoader.loadAll(this._viewModel);

            pe.scene.addResizeListener(lang.hitch(this, this.onEditorResized));

            if(window.g_docTrackEnabled && !(pe.scene.isNote() || this._viewModel))
                trackChange.init();
        },
        getScale: function() {
            return this._scale;
        },
        setScale: function(scale) {
            this._scale = scale;
        },
        isReadOnly: function() {
            return this._viewModel;
        },
        _regEvent: function() {
            // Load document in editor will trigger this event one time
            // After Render to register the zoom change event.
            aspect.after(metrics, "onFontResize", lang.hitch(this, "textSizeChanged"), true);
        },
        textSizeChanged: function() {
            global.fontResizeState++;

            // Clean measure text cache.
            MeasureText.cleanCache();

            this.getSelection().updateSelection();
        },

        isHeaderFooterEditing: function() {
            var mode = this._shell && this._shell.getEditMode();
            return (mode == constants.EDITMODE.HEADER_FOOTER_MODE);
        },
        isFootnoteEditing: function() {
            var mode = this._shell && this._shell.getEditMode();
            return (mode == constants.EDITMODE.FOOTNOTE_MODE);
        },
        isEndnoteEditing: function() {
            var mode = this._shell && this._shell.getEditMode();
            return (mode == constants.EDITMODE.ENDNOTE_MODE);
        },
        isContentEditing: function() {
            var mode = this._shell.getEditMode();
            return (mode == constants.EDITMODE.EDITOR_MODE);
        },
        setData: function(json) {
            //content, setting, relations, style, numbering are in json
            if (!json.setting) {
                console.log("WARNING:setting is null");
                json.setting = {};
            }
            if (!json.numbering) {
                console.log("WARNING:numbering is null");
                json.numbering = {};
            }

            if (!json.relations) {
                console.log("WARNING:relations is null");
                json.relations = {};
            }
            if (!json.content) {
            	pe.scene.showErrorMessage(i18nScene.contentCorruptErrMsg);
                throw {name: "ERROR", message: "ERROR: content is null!!", error_code: "1603"};
            }

            if (!json.style) {
                console.log("WARNING:style is null");
                json.style = {};
            }

            this.source = json;
        },

        getEditorDIV: function() {
            if (!this._editorDiv) {
                if (browser.contentInIframe()) {
                    var cssString = '<style type="text/css"></style>';
                    var data =
                        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                        '<html xmlns="http://www.w3.org/1999/xhtml"><head>' + cssString +
                        '</head>' +
                        '<body id="editorBody" class="bodyClass"><div id="editor" class="writer" style="position:absolute; left:0px; padding:' + this.padding + 'px"></div></body>' +
                        '</html>';
                    var doc = dom.byId("editorFrame").contentWindow.document;
                    doc.open();
                    doc.write(data);
                    doc.close();
                    if (pe.scene.isViewCompactMode()) {
                        domStyle.set(doc.body, 'background', 'none transparent');
                    }
                    this._editorDiv = dom.byId("editor", doc);

                    var head = doc.getElementsByTagName("head")[0];
                    array.forEach(this._css, function(css) {
                        domConstruct.create("link", {
                            className: "ckstyle",
                            type: "text/css",
                            rel: "stylesheet",
                            href: contextPath + staticRootPath + css
                        }, head);
                    });
                    domConstruct.create("link", {
                        className: "ckstyle",
                        type: "text/css",
                        rel: "stylesheet",
                        href: contextPath + staticRootPath + '/js/dijit/themes/oneui30/oneui30.css'
                    }, head);
                    
                    var iframe = dom.byId("editorFrame");
                    var win = iframe.contentWindow;
                    var iframeFocusMgr = new dijit.FocusManager();
		            iframeFocusMgr.tag = "iframe";
		            iframeFocusMgr.registerWin(win);
		            dijit.a11yclick.initDocument(win.document);
                    pe.scene.iframeFocusMgr = iframeFocusMgr;
                    
                } else {
                    var data = '<div id="editor" class="writer" style="position:absolute; left:0px; padding:' + this.padding + 'px"></div>';
                    var doc = dom.byId("editorFrame");
                    doc.innerHTML = data;
                    this._editorDiv = dom.byId("editor");
                }
            }
            return this._editorDiv;
        },

        /**
         * The function will render a place holder after editor was created.
         */
        renderPlaceholder: function() {
            var nls = i18nlang;
            pe.scene.showWarningMessage(i18nScene.loadMsg);
			var bNote = pe.scene.isNote();
            var height = bNote ? "100%;" : "1122px;";
            var left = pe.scene.getEditorLeft();
            this.placeholder.rootNode = domConstruct.create("div", {
                "class": "document editingBody",
                "style": "position: absolute; left: " + left + "px; height:" + height
            });
            this.placeholder.w = 768;

            var pgLeft = (pe.scene.isShowNaviPanel && pe.scene.isShowNaviPanel()) ? 0 : -12 ;
            var pageNode = domConstruct.create("div", {
                "class": "paging",
                "style": "position: absolute; left: " + pgLeft + "px; top: 0px; width: " + this.placeholder.w + "px; height:" + height
            }, this.placeholder.rootNode);

            if (!bNote) {
                domConstruct.create("div", {
                    "style": "position: absolute; z-index: -20001; width: 24px; height: 24px; top: 72px; left: 96px; border-right: 1px solid  #ADADAD; border-bottom: 1px solid #ADADAD;"
                }, pageNode);
                domConstruct.create("div", {
                    "style": "position: absolute; z-index: -20001; width: 24px; height: 24px; top: 72px; left: 673.733px; border-left: 1px solid #ADADAD; border-bottom: 1px solid #ADADAD;"
                }, pageNode);
                domConstruct.create("div", {
                    "style": "position: absolute; z-index: -20001; width: 24px; height: 24px; left: 96px; top: 1026.53px; border-top: 1px solid #ADADAD; border-right: 1px solid #ADADAD;"
                }, pageNode);
                domConstruct.create("div", {
                    "style": "position: absolute; z-index: -20001; width: 24px; height: 24px; left: 673.733px; top: 1026.53px; border-top: 1px solid #ADADAD; border-left: 1px solid #ADADAD;"
                }, pageNode);
            }


    		if (bNote)
	    		pageNode.style.overflow = "hidden";

            var editorDiv = this.getEditorDIV();
            editorDiv.appendChild(this.placeholder.rootNode);
        },
        
        adjustPlaceHolder: function(maxSectPW) {
        	if(pe.scene.isNote())
        		return;

        	if(!maxSectPW)
        		maxSectPW = this.setting.getMaxSectionPageWidth();
        	if(maxSectPW > 794) {
        		var pgNode = this.placeholder.rootNode.firstChild;
        		pgNode.style.width = maxSectPW + "px";
        		this.placeholder.w = maxSectPW;
        	}
        },

        removePlaceHolder: function() {
            if (this.placeholder.rootNode) {
                var parent = this.placeholder.rootNode.parentNode;
                parent && parent.removeChild(this.placeholder.rootNode);
                delete this.placeholder.rootNode;
            }
        },

        getEditorDoc: function() {
            if (!this._editorDoc) {
                var doc = browser.getEditAreaDocument();
                this._editorDoc = doc;
            }
            return this._editorDoc;
        },
        focus: function() {
        	if (this._shell)
        		this._shell.focus();
            //      var inputIframe = dojo.query("iframe.inputWrapper")[0];
            //      inputIframe&&inputIframe.focus();
        },
        startEngine: function() {
            //      console.groupCollapsed && console.groupCollapsed("========== Open document process. =============");
            //      var begin = new Date();
            if (!this.layoutEngine) {
                this.layoutEngine = new LayoutEngine(this);
                window.layoutEngine = this.layoutEngine;
                this._shell = new EditShell();
                this._shell.connect(this);
                //
                layoutEngine.start();
            } else {
                // Reload
                this._cleanState();
                layoutEngine.start();
            }
            //      var end = new Date();
            //      console.info("Total time:" + (end-begin));
            //      console.groupEnd && console.groupEnd();
        },
        /**
         * reset the layout and render .
         */
        reset: function() {
            var node = this.getEditorDIV();
            var cursor;
            var body;
            array.forEach(node.childNodes, function(n) {
                if (domClass.contains(n, "editingBody"))
                    body = n;
                else if (domClass.contains(n, "cursor"))
                    cursor = n;
            });
            if (body)
                node.removeChild(body);
            pe.lotusEditor.relations.notesManager.resetView();
            this.layoutEngine.layoutDocument();
            this.layoutEngine.renderDocument();
            // topic.publish(constants.EVENT.LOAD_READY);
            if (cursor)
                node.appendChild(cursor);
            pe.lotusEditor.getShell().enterEditorMode();
        },
        getSelection: function() {
            return this._shell && this._shell.getSelection();
        },
        getSelectedParagraph: function(maxCount) {
            var paras = [];
            var selection = this.getSelection();
            if (!selection) {
                return paras;
            }
            var ranges = selection.getRanges();
            if (!ranges) {
                return paras;
            }
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                if (range && RangeTools.ifContainOnlyOneTextBox(range)) {
                    paras = paras.concat(range.startModel.obj.getParagraphs());
                } else {
                    var it = new RangeIterator(range, maxCount);
                    var para = null;
                    // TODO Select paragraphs in table
                    while (para = it.nextParagraph()) {
                        if (para.modelType == constants.MODELTYPE.PARAGRAPH)
                            paras.push(para);
                    }
                }

            }
            return paras;
        },
        getShell: function() {
            return this._shell;
        },
        /**
         * 
         * @param commandName
         * @param data
         * @returns true for success; false for failure
         */
        execCommand: function(commandName, data) {
            var command = this.getCommand(commandName);

            var returnValue = false;
            if (command && (command.state != constants.CMDSTATE.TRISTATE_DISABLED && command.state != constants.CMDSTATE.TRISTATE_HIDDEN)) {
                try {
                    topic.publish(constants.EVENT.BEFORE_EXECCOMMAND, commandName);
                    returnValue = command.execute(data);
                } catch (e) {
                    var errorData = "Execute command: " + commandName + " throw exception: " + e;
                    console.error(errorData);
                    // var evalFn = function($$$$){return(eval($$$$))};
                    // concord.text.tools.printExceptionStack("Exception when
                    // execute a command: "+ commandName + ' ' + e,evalFn);
                    // returnValue = false;
                    this.sendLog(errorData, command.isCritical);
                }
            }

            return returnValue;
        },

        /**
         * The arguments can be 
         *      Object : Model  
         *      String : Object ID
         *      Null :  Current selected object
         */
        printModel: function(model) {
            var obj = null;
            if (!model) {
                var paras = this.getSelectedParagraph();
                obj = paras.length > 0 ? paras[0] : null;
            } else if (typeof model == "string") {
                obj = this.document.byId(model);
            } else if (typeof model == "object") {
                obj = model;
            }

            if (obj) {
                window.debugModel = obj;
                if (obj.modelType == constants.MODELTYPE.PARAGRAPH)
                    console.info(JSON.stringify(obj.toJson(undefined, undefined, true)));
                else
                    console.info(JSON.stringify(obj.toJson()));
            }
        },

        /**
         * The arguments can be 
         *      Object : Model
         *      String : Object ID
         *      Null :  Current selected object
         */
        printView: function(model) {

        },

        /**
         * Sent client log to server.
         * @param logData
         * @param isCritical is true will force client reload
         */
        sendLog: function(logData, isCritical) {
            //      var sel = this._getFakeSelection();
            //      logData += ". \n With selection:" + sel;

            var logMsg = msgCenter.sendLogMessage(logData);
            var session = pe.scene.session;
            if (isCritical) {
                var inArray = function(arr, obj) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] == obj)
                            return true;
                    }
                };

                // Force send to server.
                var sendFunc = function() {
                    var sendSuccess = true;
                    if (inArray(session.sendoutList, logMsg) || inArray(session.waitingList, logMsg))
                        sendSuccess = false;

                    if (sendSuccess)
                        session.reload();
                    else {
                        concord.net.Sender.send();
                        setTimeout(function() {
                            sendFunc();
                        }, 500);
                    }
                };

                sendFunc();
            }
        },

        /**
         * Adds a command definition to the document.
         * @param {String} commandName The indentifier name of the command.
         * @param commandDef the command definition, should have exec function
         * @param keyCombine the short cut key for this command, optional
         * @example
         * var styleCommand = function( style )
            {
                this.style = new writer.style(style);
            };
            styleCommand.prototype.exec = function( )
            {
            };
         * editor.addCommand( 'bold', new styleCommand({ 'font-weight':'bold' }));
         */
        addCommand: function(commandName, commandDef, keyCombine) {
            this._commands[commandName] = new Command(this, commandDef, commandName);
            if (this._viewModel && this._enableCommand.indexOf(commandName) < 0) {
                this._commands[commandName].disable();
            }
            if (keyCombine) {
                this.setKeyStroke(keyCombine, commandName);
            }

        },
        /**
         * Gets one of the registered commands. Note that, after registering a
         * command definition with addCommand, it is transformed internally
         * into an instance of {@link writer,core.Command}, which will be then
         * returned by this function.
         * @param {String} commandName The name of the command to be returned.
         * This is the same used to register the command with addCommand.
         * @returns {writer.core.Command} The command object identified by the
         * provided name.
         */
        getCommand: function(commandName) {
            return this._commands[commandName];
        },

        setKeyStroke: function(keyCombine, commandName) {
            if (!keyCombine || !commandName) {
                throw "keycombine and commandName can't be null when setting keystroke";
            }
            this._keystrokes[keyCombine] = commandName;
        },
        /**
         * Get the one of the registered command by the key combination. 
         * @param keyCombination The key combination.
         * @returns {writer.core.Command} The command object which connected with key combination
         * 
         */
        getKeyStroke: function(keyCombine) {
            return this._keystrokes[keyCombine];
        },


        prepareEditor: function() {

        },
        getDomDocument: function() {
            if (!this.domDocument)
            {
            	var win = query('div.document', this._editorDiv)[0];
            	if (win)
            		this.domDocument = win.ownerDocument;
            }
            return this.domDocument;
        },
        //End

        onEditorResized: function() {
            this._viewWidth = null;
            this._viewHeight = null;
            this.cleanScrollCache();
        },

        /*
         * get view height
         */
        getViewHeight: function() {
            if (!this._viewHeight) {
                if (browser.isMobile()) {
                    this._viewHeight = window.innerHeight;
                } else {
                    var doc = this.getDomDocument();
                    if (!doc)
                    	return 0;
                    this._viewHeight = doc.documentElement.clientHeight;
                }
            }
            return this._viewHeight;
        },

        getViewWidth: function() {
            if (!this._viewWidth) {
                var doc = this.getDomDocument();
                if (!doc)
                	return 0;
                this._viewWidth = doc.documentElement.clientWidth;
            }
            return this._viewWidth;
        },

        /*
         * get Window
         */
        getWindow: function() {
            var doc = this.getDomDocument();
            if (!doc)
            	return null;
            return doc.parentWindow || doc.defaultView;
        },
        /*
         * get scroll pos
         */
        getScrollPosition: function() {
            if (browser.isMobile())
                return document.body.scrollTop;
            // ios browser: edit use mobile div to scroll; view use browser scroll
            if (browser.isIOSBrowser()) {
                var ifameDiv = dojo.byId("mobileIframeDiv");
                if (ifameDiv) {
                    return ifameDiv.scrollTop;
                } else {
                    return document.body.scrollTop;
                }
            }
            if (this._scrollTop || this._scrollTop == 0)
                return this._scrollTop;

            var doc = this.getDomDocument();
            if (!doc)
            	return 0;

            this._scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;

            return this._scrollTop;
        },

        getScrollPositionH: function() {
            if (browser.isMobile())
                return document.body.scrollLeft;
            // ios browser: edit use mobile div to scroll; view use browser scroll
            if (browser.isIOSBrowser()) {
                var ifameDiv = dojo.byId("mobileIframeDiv");
                if (ifameDiv) {
                    return ifameDiv.scrollLeft;
                } else {
                    return document.body.scrollLeft;
                }
            }
            if (this._scrollLeft || this._scrollLeft == 0)
                return this._scrollLeft;

            var doc = this.getDomDocument();

            if (!doc)
            	return 0;

            this._scrollLeft = doc.documentElement.scrollLeft || doc.body.scrollLeft;

            return this._scrollLeft;
        },
        
        hasScrollBar: function(type){
        	var b = false, r = false;
        	var doc = this.getDomDocument();
        	if(doc) {
            	if(!type || type == 'w'){
            		var sw = doc.documentElement.scrollWidth || doc.body.scrollWidth;
            		var cw = doc.documentElement.clientWidth || doc.body.clientWidth;
            		if(sw > cw)
            			b = true;
            	}

            	if(!type || type == 'h'){
            		var sh = doc.documentElement.scrollHeight || doc.body.scrollHeight;
            		var ch = doc.documentElement.clientHeight || doc.body.clientHeight;
            		if(sh > ch)
            			r = true;
            	}
        	}
        	if(type){
        		if(type == 'w')
        			return b;
        		else
        			return r;
        	}

        	return b && r;
        },

        addStyelReferer: function(styleId, referer) {
            var style = this.getRefStyle(styleId);
            style && style.addReferer(referer);
        },
        getRefStyle: function(id) {
            return this.styles && this.styles.getStyle(id);
        },
        getDefaultTextStyle: function() {
            return this.styles && this.styles.getDefaultTextStyle();
        },
        getDefaultParagraphStyle: function() {
            return this.styles && this.styles.getDefaultParagraphStyle();
        },
        getDefaultListStyle: function() {
            return this.styles && this.styles.getDefaultListStyle();
        },
        getDefaultTableStyle: function() {
            return this.styles && this.styles.getDefaultTableStyle();
        },
        getDocMergedDefaultTextStyle: function() {
        	return this.styles && this.styles.getDocMergedDefaultTextStyle();
        },

        createStyle: function(styleName, jsonData) {
            var msg = null;
            var refStyle = this.getRefStyle(styleName);
            if (!refStyle) {
                jsonData = jsonData || this.defaultStyle[styleName];
                if (!jsonData)
                    throw "The style " + styleName + " no default json data.";
                //          var style = new writer.model.style.Style( dojo.clone(jsonData),styleName );
                var style = this.styles.createStyle(lang.clone(jsonData), styleName);
                this.styles.addStyle(styleName, style);
                msg = msgCenter.createMsg(constants.MSGTYPE.Style, [msgCenter.createAddStyleAct(styleName, jsonData)], constants.MSGCATEGORY.Style);
            }
            return msg;
        },

        cleanScrollCache: function() {
            this._scrollTop = null;
            this._scrollLeft = null;
        },

        _clearSubDomnode: function() {
            if (!this._editorDiv)
                return;

            var i = 0;
            while (i < this._editorDiv.childNodes.length) {
                var child = this._editorDiv.childNodes[i];

                if (child.className.indexOf("document editingBody") >= 0) {
                    // only remove editingBody nodes
                    this._editorDiv.removeChild(child);
                } else {
                    ++i;
                }
            }
        },

        _cleanState: function() {
            this.updateManager.clear();

            window._IDCache.cleanCache();

            pe.lotusEditor.undoManager.reset();

            this.lists = {};

            this._viewHeight = null;
            this._viewWidth = null;
            this.domDocument = null;

            this._clearSubDomnode();
            this.cleanScrollCache();
        },
        /**
         * The function will reset all status.
         * When the content changed will 
         */
        restoreState: function() {
            for (var i = 0; i < this.editorHandlers.length; i++)
                this.editorHandlers[i].remove();

            this.editorHandlers = [];

            this._cleanState();
        },
        /**
         * get plugin for call
         */
        getPlugin: function(name) {
            return this._pluginsLoader.getPlugin(name);
        }
    });

    return Editor;
});
