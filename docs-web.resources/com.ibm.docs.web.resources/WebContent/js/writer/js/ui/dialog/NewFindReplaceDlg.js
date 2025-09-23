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
    "dojo/keys",
    "dojo/fx",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/i18n!writer/ui/dialog/nls/FindReplaceDlg",
    "dojo/on",
    "dojo/query",
    "dojo/topic",
    "concord/util/BidiUtils",
    "writer/constants",
    "writer/ui/toolbar/Toolbar",
    "writer/util/ModelTools",
    "dijit/registry",
    "dijit/_base/wai",
    "writer/global"
], function(keys, fx, domAttr, domStyle, domConstruct, lang, dom, i18nFindReplaceDlg, on, query, topic, BidiUtilsModule, constants, Toolbar, ModelTools, registry, wai, global) {

    var NewFindReplaceDlg = function(obj) {
        this.input = null;
        this.show = false;
        this.replaceInput = null;
        this.isDefaultFindValue = true;
        this.isDefaultReplaceValue = true;
        this._init(obj);
        this.bidiTextDir = (!window.BidiUtils.isBidiOn() ? "" : window.BidiUtils.getTextDir());
    };

    NewFindReplaceDlg.prototype = {
        find_hdl: function() {},
        replace_hdl: function() {},
        replaceall_hdl: function() {},
        onhide_hdl: function() {},
        resize_hdl: function() {},
        onload_hdl: function() {},
        onshow_hdl: function() {},
        onKeyDown: function(evt) {
            if (evt.charCode == keys.ENTER || evt.keyCode == keys.ENTER) {
                this.navigate_hdl('next');
                evt.preventDefault(), evt.stopPropagation();
            }
        },
        freshTotalNum: function(idx, offset, len) {
            if (len == -1) { // this happen the no input text to find, should clear the totalNum area
                domStyle.set(this.inputDiv, 'width', '100%');
                domStyle.set(this.totalNum, 'width', '0');
                this.totalNum.innerHTML = "";
                return;
            }
            if (len == 0) {
                domStyle.set(this.inputDiv, 'width', '100%');
                domStyle.set(this.totalNum, 'width', '0');
                this.totalNum.innerHTML = BidiUtils.isArabicLocale() ? "&nbsp;&nbsp;\u0660" : "&nbsp;&nbsp;0";
            } else {
                var curr = ((idx + 1) > 0 ? idx + 1 : 1);
                curr = curr + offset;
                if (curr != len) {
                    curr = curr % len;
                    if (curr == 0)
                        curr = 1;
                }
                var lenStr = len;
                if (BidiUtils.isArabicLocale()) {
                	curr = BidiUtils.convertArabicToHindi(curr + "");
                	lenStr = BidiUtils.convertArabicToHindi(lenStr + "");
                }
                this.totalNum.innerHTML = curr + " / " + lenStr;
            }
            var size = len + "";
            size = size.length;
            var base = 15;
            if (size == 1)
                base = 20;
            domStyle.set(this.inputDiv, 'width', (100 - (size * base)) + "%");
            domStyle.set(this.totalNum, 'width', size * base + "%");

        },
        _init: function(obj) {
            this._loadNls();
            lang.mixin(this, obj);
            topic.subscribe(constants.EVENT.SHOWTOTALNUM, lang.hitch(this, this.freshTotalNum));
            topic.subscribe(constants.EVENT.FOCUSBACKFINDDLG, lang.hitch(this, this.focusBack));
        },

        focusBack: function() {
            var that = this;
            setTimeout(function() {
                    that.input && that.input.focus();
                },
                0);
        },

        _loadNls: function() {
            if (!this.nls)
                this.nls = i18nFindReplaceDlg;
        },

        setDefaultValue: function(isDefaultValue, type) {
            if (type == 'find')
                this.isDefaultFindValue = isDefaultValue;
            else
                this.isDefaultReplaceValue = isDefaultValue;
        },
        connectClickEvt: function(input, defaultValue, type) {
            var isDefaultValue;
            on(input, "focus", lang.hitch(this, function() {
                if ((type == "find" ? this.isDefaultFindValue : this.isDefaultReplaceValue) && input.value == defaultValue) {
                    input.value = "";
                    domStyle.set(input, "fontStyle", "normal");
                    domStyle.set(input, "color", "");
                    this.setDefaultValue(false, type);
                }
            }));

            on(input, "blur", lang.hitch(this, function() {
                if (input.value.length == 0) {
                    input.value = defaultValue;
                    domStyle.set(input, "fontStyle", "italic");
                    domStyle.set(input, "color", "gray");
                    this.setDefaultValue(true, type);
                }
            }));
        },

        getBarPositionInfo: function() {
            // based on the page
            //			var viewTools = writer.util.ViewTools;
            //			var selection = pe.lotusEditor.getSelection();
            //			var currPage = null;
            //			if (selection){
            //				var ranges = selection.getRanges();
            //				var range = ranges && ranges[0];
            //				if (range){
            //					var startView = range.getStartView();
            //					if(!startView) return null;
            //					if (startView.obj){
            //						startView = startView.obj;
            //					}
            //					currPage = viewTools.getPage(startView);
            //					var rect =currPage.domNode.getBoundingClientRect();
            //					return {left:rect.left, width:rect.width};//pe.lotusEditor.setting.getMaxSectionPageWidth()					
            //				}
            //			}
            //			return null;

            // base on the edit frame
            var rect = dom.byId("editorFrame").getBoundingClientRect();
            return {
                left: 0,
                width: rect.width - 17
            };
        },

        onResized: function() {
            var me = this;
            if (!me.show)
                return;
            setTimeout(function() {
                if (me.show) {
                    me.resize_hdl();
                    me.onEditorResized();
                }
            }, 100);
        },

        onEditorResized: function() {
            var pos = this.getBarPositionInfo();
            this.floatingFinderNode.style.width = pos.width + "px";
        },

        createFloatingFinder: function(type) {
            var pos = this.getBarPositionInfo();
            var id = "lotus_editor_floating_finder";
            var height;
            height = "40px";

            var parent = dom.byId("mainNode");
            var editFrame = dom.byId("editorFrame");
            var paggings = query("paging");

            var floatLeft = "float:left;";
            var style = "left:" + pos.left;
            var dirAttr = "";
            if (window.BidiUtils.isGuiRtl()) {
                floatLeft = "float:right;";
                style = "right:" + pos.left;
                dirAttr = "rtl";
            }
            style += "px;bottom:-2px;width:" + (pos.width - 2) + "px;position:absolute;border:1px solid #AAAAAA;box-shadow:0 0 5PX #AAAAAA;";
            this.floatingFinderNode = domConstruct.create("div", {
                "id": id,
                "style": style,
                "class": "dijit dijitToolbar docToolbar"
            });
            if (dirAttr.length > 0)
                domAttr.set(this.floatingFinderNode, "dir", dirAttr);


            parent.insertBefore(this.floatingFinderNode, dom.byId("ll_sidebar_div"));

            // Input span
            style = floatLeft + (window.BidiUtils.isGuiRtl() ? "margin:4px 8px 4px 0;" : "margin:4px 0 4px 8px;");
            style += "width:143px;height:22px;border:1px solid #AAAAAA;";
            var inputSpan = domConstruct.create("div", {
                "style": style
            });

            // Input
            style = "position:relative;height:22px;width:100%; border:0px solid;";
            id = "lotus_editor_floating_finder_input";
            this.inputDiv = domConstruct.create("div", {
                "style": floatLeft
            });
            var attrInputParams = {
                "id": id,
                "style": style
            };
            if (window.BidiUtils.isBidiOn())
                attrInputParams.dir = this.bidiTextDir;
            this.input = domConstruct.create("input", attrInputParams);
            on(this.input, "keyup", lang.hitch(this, function() {
                if (this.bidiTextDir == 'contextual')
                    this.input.dir = window.BidiUtils.calculateDirForContextual(this.input.value);
                this.find_hdl();
            }));


            on(this.input, "keydown", lang.hitch(this, this.onKeyDown));
            this.connectClickEvt(this.input, this.nls.findInFile, "find");
            // TotalNum node
            style = "position:relative;background:white;height:22px;line-height:22px;color:#AAAAAA;text-align:center;" +
                window.BidiUtils.isGuiRtl() ? "float:left;" : "float:right;";

            id = "lotus_editor_floating_finder_totalNum";
            this.totalNum = domConstruct.create("div", {
                "id": id,
                "style": style
            });
            this.inputDiv.appendChild(this.input);
            inputSpan.appendChild(this.inputDiv);
            inputSpan.appendChild(this.totalNum);
            this.floatingFinderNode.appendChild(inputSpan);

            this.lefttoolbar = new Toolbar();
            global.createFindReplaceToolbar(this.floatingFinderNode, this.lefttoolbar, "left");
            on(registry.byId("D_t_Find_Prev"), "Click", lang.hitch(this, this.navigate_hdl, 'pre')); //
            on(registry.byId("D_t_Find_Next"), "Click", lang.hitch(this, this.navigate_hdl, 'next'));


            style = floatLeft + "position:relative;width:143px;height:22px;border:0px solid;margin:4px 0;";
            var replaceSpan = domConstruct.create("div", {
                "style": style
            });
            // Input replace word
            style = "position:relative;height:20px;width:98%;font-style:italic;color:gray;";
            id = "lotus_editor_floating_replace_input";
            var attrReplaceInputParams = {
                "id": id,
                "style": style,
                "value": this.nls.inputReplace
            };
            if (window.BidiUtils.isBidiOn()) {
                if (this.bidiTextDir == 'contextual')
                    attrReplaceInputParams.dir = window.BidiUtils.calculateDirForContextual(this.nls.inputReplace);
                else
                    attrReplaceInputParams.dir = this.bidiTextDir;
            }
            this.replaceInput = domConstruct.create("input", attrReplaceInputParams);
            if (this.bidiTextDir == 'contextual') {
                on(this.replaceInput, "keyup", lang.hitch(this, function() {
                    this.replaceInput.dir = window.BidiUtils.calculateDirForContextual(this.replaceInput.value);
                }));
            }
            this.connectClickEvt(this.replaceInput, this.nls.inputReplace, "replace");
            replaceSpan.appendChild(this.replaceInput);
            this.floatingFinderNode.appendChild(replaceSpan);


            this.centertoolbar = new Toolbar();
            global.createFindReplaceToolbar(this.floatingFinderNode, this.centertoolbar, "center");
            on(registry.byId("D_t_Replace"), "Click", lang.hitch(this, this.replace_hdl)); //
            on(registry.byId("D_t_ReplaceAll"), "Click", lang.hitch(this, this.replaceall_hdl));


            this.righttoolbar = new Toolbar();
            global.createFindReplaceToolbar(this.floatingFinderNode, this.righttoolbar, "right");

            on(registry.byId("D_t_MatchCase"), "Click", lang.hitch(this, function() {
                this.find_hdl({
                    "find": true
                });
            }));
            on(registry.byId("D_t_MatchWord"), "Click", lang.hitch(this, function() {
                this.find_hdl({
                    "find": true
                });
            }));
            on(registry.byId("D_t_FindBarClose"), "Click", lang.hitch(this, function() {
                this.onhide_hdl();
                fx.wipeOut({
                    node: this.floatingFinderNode
                }).play();
            }));

            pe.scene.addResizeListener(lang.hitch(this, this.onEditorResized));
            on(window, "resize", lang.hitch(this, this.onResized));

            wai.setWaiState(dom.byId("lotus_editor_floating_finder_input"), "label", this.nls.findInFile);
            wai.setWaiState(dom.byId("lotus_editor_floating_replace_input"), "label", this.nls.inputReplace);
            var that = this;
            on(this.floatingFinderNode, "keydown", lang.hitch(this, function(evt) {
                if (evt.charCode == keys.ESCAPE || evt.keyCode == keys.ESCAPE) {
                    this.onhide_hdl();
                    fx.wipeOut({
                        node: this.floatingFinderNode
                    }).play();
                    evt.preventDefault(), evt.stopPropagation();
                }
                if (evt.charCode == keys.TAB || evt.keyCode == keys.TAB) {
                    var target = evt.target || evt.srcElement;
                    if (evt.shiftKey) {
                        if (target.id == "D_t_FindBarClose") {
                            dom.byId("D_t_MatchCase").focus();
                            evt.preventDefault(), evt.stopPropagation();
                        } else if (target.id == "lotus_editor_floating_finder_input") {
                            dom.byId("D_t_FindBarClose").focus();
                            evt.preventDefault(), evt.stopPropagation();
                        }
                    } else {
                        if (target.id == "D_t_MatchCase") {
                            dom.byId("D_t_FindBarClose").focus();
                            evt.preventDefault(), evt.stopPropagation();
                        } else if (target.id == "D_t_FindBarClose") {
                            dom.byId("lotus_editor_floating_finder_input").focus();
                            evt.preventDefault(), evt.stopPropagation();
                        }
                    }
                }
            }));
            this.onshow_hdl();
        }
    }


    NewFindReplaceDlg.show = function(type, obj) {
        var range = pe.lotusEditor.getSelection().getRanges()[0];
        var contents = "";
        if (ModelTools.isValidSel4Find())
            contents = range.extractContents();
        var findValue;
        if (!this.dlg) {
            this.dlg = new NewFindReplaceDlg(obj);
            this.dlg.createFloatingFinder(type);
            return;
        } else if (this.dlg.isDefaultFindValue) {
            this.dlg.input.value = "";
            domStyle.set(this.dlg.input, "fontStyle", "normal");
            domStyle.set(this.dlg.input, "color", "");
            this.dlg.setDefaultValue(false, "find");
        }

        var dlg = this.dlg;
        domStyle.set(dlg.floatingFinderNode, "display", "");
        dlg.show = true;
        dlg.resize_hdl();
        var findValue;
        dlg.input.focus();
        dlg.setDefaultValue(false, "find");
        if (contents && contents.length > 0 && contents[0].c != dlg.input.value) {
            findValue = contents[0].c;
            dlg.input.value = findValue.trim();
        } else
            findValue = dlg.input.value;
        if (!findValue || findValue.length == 0) {
            return;
        }
        dlg.find_hdl();
    };

    return NewFindReplaceDlg;
});
