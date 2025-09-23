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
    "dojo/dom-attr",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/text!writer/templates/LinkPanel.html",
    "dojo/topic",
    "dijit/_Templated",
    "dijit/_Widget",
    "dijit/form/ComboBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Select",
    "concord/util/acf",
    "concord/util/BidiUtils",
    "concord/util/browser",
    "concord/util/events",
    "writer/constants",
    "writer/util/BookmarkTools",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "dojo/i18n!writer/ui/widget/nls/LinkPanel",
    "dijit/focus",
    "dijit/a11y",
    "dojox/validate"
], function(keys, domAttr, declare, lang, dom, domClass, domConstruct, on, template, topic, _Templated, _Widget, ComboBox, FilteringSelect, Select, acf, BidiUtilsModule, browser, events, constants, BookmarkTools, ModelTools, ViewTools, i18nLinkPanel, focusUtils, a11y, validateTool) {

    var LinkPanel = declare("writer.ui.widget.LinkPanel", [_Widget, _Templated], {

        widgetsInTemplate: true,
        templateString: template,
        enableRemove: false,
        needText: false,

        link: "",
        subject: "",
        type: "website",
        anchor: null,

        postMixInProperties: function() {
            this.inherited(arguments);
            this.strs = i18nLinkPanel;
        },

        show: function(isFromMouse) {
            if (pe.lotusEditor.popupPanel && this != pe.lotusEditor.popupPanel) {
                pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close(true);
            }

            var me = this;
            setTimeout(function() {
                me.domNode.style.display = "";
                me.locate();
                !isFromMouse && me.focus();
            }, 100);
        },

        isShow: function() {
            return this.domNode.style.display == "";
        },
        //link: url/mail/bookmark
        //enableRemove: modify a existing hyperlink
        initData: function(linkInfo) {
            //		var disabled = linkInfo.type ? true : false;
            //		this.select.setDisabled(disabled);

            this.type = linkInfo.type || "website"; //type:"website"/"email"/"slide"
            if (linkInfo.anchor)
                this.type = "bookmark";
            this.link = linkInfo.link || "";
            this.subject = linkInfo.subject || ""; //subject: mail-subject, not use for other case
            this.selectedElement = linkInfo.selectedElement; //selected element

            //Fill bookmarks
            var oldName = this.selectedElement && this.selectedElement.anchor;
            var bms = ModelTools.getAllBookMarks();
            var options = [],
                isNameValid = false;

            for (var i = 0; i < bms.length; i++) {
                var name = acf.escapeXml(bms[i].name);
                var namelabel = window.BidiUtils.isBidiOn() ? window.BidiUtils.addEmbeddingUCC(name) : name;
                if (!BookmarkTools.isNeedShow(bms[i]))
                    continue;
                if (name == oldName)
                    isNameValid = true;
                options.push({
                    label: namelabel,
                    value: name
                });
            }
            //init bookmarks
            if (this.bmkSelect)
                domConstruct.destroy(this.bmkSelect.domNode);
            if (!isNameValid) //no linked bookmark
                options.push({
                label: oldName,
                value: oldName
            });

            this.bmkSelect = new Select({
                baseClass: "dijitSelect dijitValidationTextBox bookmarkSelect",
                dir: (window.BidiUtils.isGuiRtl() ? 'rtl' : ''),
                onBlur: function() {
                    this._isLoaded = false;
                },
                options: options,
                _addOptionItem: function( /*_FormSelectWidget.__SelectOption*/ option) {
                    if (this.dropDown) {
                        if (!option.selected)
                            this.dropDown.addChild(this._getMenuItemForOption(option));
                    }
                }
            });

            this.bookmarksWrapper.appendChild(this.bmkSelect.domNode);
            domAttr.set(this.bmkSelect.domNode, "aria-label", this.strs.bookmark_list);
            this.bmkSelect.startup();
            this.connect(this.bmkSelect, "onChange", this.onBmSelectChange);
            this.selectBookmark = oldName;
            if (!this.selectBookmark && options.length)
                this.selectBookmark = options[0].value;
            this.onBmSelectChange(this.selectBookmark);
            //End

            //when user create a new link, the text is the visible text (if empty, it will be the hyperlink string)
            // If is collapsed and create link need display text.
            var selection = pe.lotusEditor.getSelection();
            var range = selection.getRanges()[0];

            if (range && range.isCollapsed() && !linkInfo.type && (this.type == "email" || this.type == "website"))
                this.needText = true;
            else
                this.needText = false;

            this.enableRemove = linkInfo.selectedElement || false;

            this.removeButton.disabled = !this.enableRemove;

            this.select.set('value', this.type);
            if (this.type == 'bookmark')
                this.bmkSelect.set("value", linkInfo.anchor);
            else
                this.linkInput.set('value', this.link);

            if (options.length <= 1)
                this.bmkSelect.disabled = true;

            this.textInput.value = "";

            this.subjectInput.value = this.subject;
            this.textBox.style.display = this.needText ? "" : "none";
            if (this.needText)
                this.textInput.value = linkInfo.text || "";

            if (window.BidiUtils.isBidiOn()) {
                this.linkInput.focusNode.dir = 'ltr';
                var textDir = window.BidiUtils.getTextDir();
                if (textDir == 'contextual') {
                    on(this.textInput, "keyup", lang.hitch(this, function() {
                        this.textInput.dir = window.BidiUtils.calculateDirForContextual(this.textInput.value);
                    }));
                    on(this.subjectInput, "keyup", lang.hitch(this, function() {
                        this.subjectInput.dir = window.BidiUtils.calculateDirForContextual(this.subjectInput.value);
                    }));
                } else {
                    this.textInput.dir = this.subjectInput.dir = textDir;
                }
            }
            this.onLinkChange();
        },

        isLinkValid: function() {
            var value = this.linkInput.getValue();
            return (this.type == "website" && lang.trim(value)) || (this.type == "email" && validateTool.isEmailAddress(value) || (this.type == "bookmark" && this.selectBookmark != ""));
        },

        _getFocusItems: function() {
            var elems = a11y._getTabNavigable(this.domNode);
            this._firstFocusItem = elems.lowest || elems.first;
            this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
        },

        focus: function() {
            if (this.type != "bookmark")
                this.linkInput.focus();
            else {
                this.bmkSelect.focus();
                //			this.select.focus();
            }
        },

        _onKey: function( /* Event */ evt) {
            if (evt.keyCode == keys.ENTER) {
                this.doneLink();
                evt.stopPropagation();
                evt.preventDefault();
            } else if (evt.keyCode == keys.TAB) {
                this._getFocusItems(this.domNode);
                var node = evt.target;
                if (this._firstFocusItem == this._lastFocusItem) {
                    // don't move focus anywhere, but don't allow browser to move focus off of dialog either
                    evt.stopPropagation();
                    evt.preventDefault();
                } else if (node == this._firstFocusItem && evt.shiftKey) {
                    // if we are shift-tabbing from first focusable item in dialog, send focus to last item
                    focusUtils.focus(this._lastFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                } else if (node == this._lastFocusItem && !evt.shiftKey) {
                    // if we are tabbing from last focusable item in dialog, send focus to first item
                    focusUtils.focus(this._firstFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            } else if (evt.keyCode == keys.ESCAPE) {
                this.close();
                evt.stopPropagation();
                evt.preventDefault();
            }
        },

        onBlur: function() {
            this.close();
        },

        gotoLink: function(e) {
            if (e)
                e.preventDefault(), e.stopPropagation();

            if (this.type != "bookmark") {
                var url = this.linkInput.getValue();
                var index = url.indexOf("://");
                var href = url;
                if (index <= 0)
                    href = "http://" + url;
                if (acf.suspiciousAttribute("href", href) || acf.suspiciousHtml(href)) {
                    // not allow to open
                } else {
                    window.open(href);
                }
            } else if (this.selectBookmark) {
                if (this.selectedElement)
                    topic.publish(constants.EVENT.OPENLINK, this.selectedElement, this.selectBookmark);
                else
                    topic.publish(constants.EVENT.OPENLINK, {
                        "anchor": this.selectBookmark
                    });
            }
            this.close();
        },

        postCreate: function() {
            this.inherited(arguments);
            this.connect(this.domNode, "onkeydown", "_onKey");
            if (window.BidiUtils.isGuiRtl())
                domClass.add(this.domNode, 'rtl');

            this.linkInput.intermediateChanges = true;
            this.removeButton.disabled = !this.enableRemove;
            this.doneButton.disabled = true;
            this.gotoButton.disabled = true;

            var s = new Select({
                baseClass: "dijitSelect dijitValidationTextBox linkSelect",
                dir: (window.BidiUtils.isGuiRtl() ? 'rtl' : ''),
                onBlur: function() {
                    this._isLoaded = false;
                },
                options: [{
                    label: this.strs.link_website,
                    value: "website",
                    selected: true
                }, {
                    label: this.strs.link_email,
                    value: "email"
                }, {
                    label: this.strs.link_bookmark,
                    value: "bookmark"
                }],
                _addOptionItem: function( /*_FormSelectWidget.__SelectOption*/ option) {
                    if (this.dropDown) {
                        if (!option.selected) {
                            this.dropDown.addChild(this._getMenuItemForOption(option));
                        }
                    }
                }
            });
            domAttr.set(s.domNode, "aria-label", this.strs.link_types);
            this.connect(s, "onChange", this.onSelectChange);
            this.connect(this.linkInput, "onChange", this.onLinkChange);
            this.select = s;
            this.selectWrapper.appendChild(s.domNode);
            s.startup();
            this.onSelectChange(this.type);
        },

        onSubmit: function(e) {
            e && e.preventDefault(), e.stopPropagation();
            var valid = this.onLinkChange();
            if (valid)
                this.doneLink();
        },

        onLinkChange: function() {
            var valid = this.isLinkValid();
            this.doneButton.disabled = !valid;
            this.gotoButton.disabled = !valid;
            return valid;
        },
        onBmSelectChange: function(value) {
            var oldBookmark = this.selectedElement && this.selectedElement.anchor;
            this.doneButton.disabled = (value == oldBookmark || value == "" || !value);
            this.selectBookmark = value;
            (this.doneButton.disabled) ? this.removeButton.focus(): this.doneButton.focus();

        },
        onSelectChange: function(v) {
            this.type = v;

            this.subjectBox.style.display = v == "email" ? "" : "none";
            this.textBox.style.display = this.needText ? "" : "none";

            var linkText = this.strs.link_open;
            if (v == "email")
                linkText = this.strs.link_mailto;
            else if (v == "bookmark")
                linkText = this.strs.link_goto;

            this.gotoButton.innerHTML = linkText;

            if (v == "bookmark") {
                this.bookmarksWrapper.style.display = "";
                this.linkInput.domNode.style.display = "none";
                this.gotoButton.style.display = "";
                this.bmkSelect.focus();
                this.doneButton.disabled = !this.selectBookmark;
                this.gotoButton.disabled = !this.selectBookmark;
                if (this.selectBookmark)
                    this.onBmSelectChange(this.selectBookmark);
            } else {
                this.gotoButton.style.display = "";
                this.linkInput.domNode.style.display = "";
                this.linkInput.focus();
                this.bookmarksWrapper.style.display = "none";
                this.onLinkChange();
            }

            var accStr = v == "email" ? this.strs.mail_input : this.strs.link_input;
            domAttr.set(this.linkInput.focusNode, "aria-label", accStr);
        },

        close: function(isMenuOpen) {
            if (this.isShow()) {
                this.domNode.style.display = "none";
                !isMenuOpen && pe.lotusEditor.focus();
            }
        },

        removeLink: function(e) {
            if (e)
                e.preventDefault(), e.stopPropagation();
            this.onRemove();
        },

        doneLink: function() {
            var data = {
                type: this.type,
                //			link: this.linkInput.getValue(),
                //			subject: this.subjectInput.value || "",
                //			text: this.textInput.value || "",
                selectedElement: this.selectedElement
            };
            if (this.needText)
                data.text = this.textInput.value || "";
            if (this.type == "bookmark") {
                data.anchor = this.selectBookmark || this.bmkSelect.value;
            } else if (this.type == "website") {
                data.link = this.linkInput.getValue();
            } else if (this.type == "email") {
                data.link = this.linkInput.getValue();
                data.subject = this.subjectInput.value || "";
            }

            this.onDone(data);
        },
        onRemove: function() {},
        onDone: function(data) {},

        locate: function() {
            var editor = pe.lotusEditor;
            var panelHeight = this.domNode.clientHeight;
            var selection = editor.getSelection();

            var pos = {
                eventname: events.comments_queryposition,
                filled: false
            };
            events.publish(events.comments_queryposition, [pos]);
            if (pos.filled) {
                var top = pos.y;
                var left = pos.x;
                if (isNaN(top) || isNaN(left)) {
                    var line = ViewTools.getLineFromSelection(selection);
                    if (line) {
                        top = line.getTop() + dom.byId("mainNode").offsetTop;
                        left = line.getLeft();
                        if ((line.left == 0) && line._isParaAlignRight)
                            left += line.w;

                        top -= pe.lotusEditor.getScrollPosition();
                        left -= pe.lotusEditor.getScrollPositionH();
                    } else {
                        console.error("wrong position!!");
                        return;
                    }
                }
                var offSet = 20;
                top += offSet;
                var scale = editor.getScale();

                var wnd = browser.isMobile() ? window : editor.getWindow();
                var viewHeight = editor.getViewHeight();
                var y = (top + panelHeight) * scale - 80;
                if (y > viewHeight) {
                    var nScroll = y - viewHeight;
                    wnd.scrollBy(0, nScroll);
                    top -= nScroll;
                }

                //if( top+ panelHeight +wnd.document.body.scrollTop > wnd.document.body.scrollHeight )
                //	top = wnd.document.body.scrollHeight - ( panelHeight +wnd.document.body.scrollTop ) + offSet;
                var linkDiv = this.domNode.parentNode;
                linkDiv.style.top = top + "px";
                linkDiv.style.left = left + "px";
            }
        }

    });
    return LinkPanel;
});
