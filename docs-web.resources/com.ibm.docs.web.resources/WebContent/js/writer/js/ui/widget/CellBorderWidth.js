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
    "dojo/on",
    "dojo/aspect",
    "dojo/_base/declare",
    "dojo/i18n!writer/ui/widget/nls/CellBorder",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text!writer/templates/Size.html",
    "dojo/topic",
    "dijit/Menu",
    "dijit/_Templated",
    "dijit/_Widget",
    "dijit/CheckedMenuItem",
    "dijit/MenuItem",
    "dijit/form/DropDownButton",
    "writer/util/CellBorderTools",
    "dijit/focus",
    "dijit/_base/wai",
    "dijit/typematic"
], function(keys, on, aspect, declare, i18nCellBorder, domAttr, domClass, array, lang, template, topic, Menu, _Templated, _Widget, CheckedMenuItem, MenuItem, DropDownButton, CellBorderTools, focusUtils, wai, typematic) {

    var CellBorderWidth = declare("writer.ui.widget.CellBorderWidth", DropDownButton, {

        baseClass: "dijitDropDownButton cellBorderWidth",
        templateString: template,
        items: CellBorderTools.getItems(false),

        __onClick: function() {
            if (this._opened)
                return;
            this.inherited(arguments);
        },

        _onInputMouseDown: function(e) {
            if (this.disabled)
                e.preventDefault(), e.stopPropagation();
        },

        _onInputChange: function(evt) {
            var inputValue = this.inputNode.value;
            if (BidiUtils.isArabicLocale())
            	inputValue = BidiUtils.convertHindiToArabic(inputValue + "");

            var v = parseFloat(inputValue);
            if (!v || v <= 0)
                return;
            var max = CellBorderTools.getLast(this._isLimited);
            if (v > max) {
                v = max;
                if (BidiUtils.isArabicLocale())
                	max = BidiUtils.convertArabicToHindi(max + "");

                this.inputNode.value = max;
            }
            if (v != this.get("value")) {
                this.set("value", v);
            }
        },

        _onInputKeyDown: function(evt) {
            var keyCode = evt.keyCode;

            var inputValue = this.inputNode.value;
            if (BidiUtils.isArabicLocale())
            	inputValue = BidiUtils.convertHindiToArabic(inputValue + "");

            if (keyCode == keys.RIGHT_ARROW || keyCode == keys.LEFT_ARROW) {
                evt.stopPropagation();
            } else if (keyCode == keys.DOWN_ARROW || keyCode == keys.UP_ARROW) {
                var v = parseFloat(inputValue);
                if (!v || v <= 0)
                    v = 0;
                evt.preventDefault(), evt.stopPropagation();
                if (keyCode == keys.DOWN_ARROW) {
                    var fontSize = CellBorderTools.getNext(v, this._isLimited);
                    if (fontSize == v)
                        fontSize = CellBorderTools.getFirst(this._isLimited);
                    if (fontSize != v)
                        this.set("value", fontSize);

                    setTimeout(lang.hitch(this, function() {
                        this.inputNode.select();
                    }), 0);
                }
                if (keyCode == keys.UP_ARROW) {
                    var fontSize = CellBorderTools.getPrev(v, this._isLimited);
                    if (fontSize == v)
                        fontSize = CellBorderTools.getLast(this._isLimited);
                    if (fontSize != v)
                        this.set("value", fontSize);
                    setTimeout(lang.hitch(this, function() {
                        this.inputNode.select();
                    }), 0);
                }
            } else if (keyCode == keys.ESCAPE) {
                this.set("value", this._origValue);

                this.inputNode.blur();
                this.focusNode.focus();
            } else if (keyCode == keys.ENTER && this._opened) {
                var v = parseFloat(inputValue);
                if (isNaN(v))
                    return;
                var first = CellBorderTools.getFirst(this._isLimited);
                var last = CellBorderTools.getLast(this._isLimited);

                if (v < first)
                    v = first;

                if (v > last)
                    v = last;

                this.set("value", v);

                this.inputNode.blur();
                this.focusNode.focus();
                this.closeDropDown();
            }
        },

        _onButtonKeyDown: function( /* Event */ evt) {
            // summary:
            // Handler for right arrow key when focus is on left part of button
            if (evt.keyCode == keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]) {

                var handled = false;
                if (!this.fontSizeUpDisabled) {
                    this.fontSizeUpWrapper.focus();
                    handled = true;
                } else if (!this.fontSizeDownDisabled) {
                    this.fontSizeDownWrapper.focus();
                    handled = true;
                }

                if (handled)
                    evt.preventDefault(), evt.stopPropagation();
            }
        },

        openDropDown: function() {
            if (this.dropDown && !this.dropDown.onOpenConnected) {
                this.dropDown.onOpenConnected = true;
                aspect.after(this.dropDown, "onOpen", lang.hitch(this, function() {
                    var dom = this.dropDown._popupWrapper;
                    if (dom) {
                        if (!domClass.contains(dom, "toolbarPopup"))
                            domClass.add(dom, "toolbarPopup");
                    }
                    this.dropDown.focusChild = function() {};
                    this.dropDownOpened();
                }));
            }
            this.inherited(arguments);
        },

        closeDropDown: function() {
            this.inherited(arguments);
        },

        _onDropDownMouseDown: function() {
            if (this._opened)
                return;
            this.inherited(arguments);
        },

        _onDropDownMouseUp: function() {
            this.inherited(arguments);
            if (this._focusDropDownTimer)
                this._focusDropDownTimer.remove();
        },

        dropDownClosed: function() {
            var v = this.get("value");
            var setted = false;
            if (v !== this._origValue) {
                var first = CellBorderTools.getFirst(this._isLimited);
                var last = CellBorderTools.getLast(this._isLimited);

                if (v < first)
                    v = first;

                if (v > last)
                    v = last;

                setted = true;
                this.set("value", v);
                this.onChange && this.onChange(this.get("value"));
            }

            if (!setted) {
                this.set("value", this.get("value"));
            }

            this._origValue = CellBorderTools.getFirst(this._isLimited);

            // pe.scene.slideEditor.borderStylePanelShow = false;
        },

        dropDownOpened: function() {
            //tab focus on lineweight button, arrow_down focus on first child node, equal to focus lineweight dropdown,
            // then focus on inputNode , will cause lineweight dropdown's onBlur, call restoreIframe.
            var inputValue = this.inputNode.value;
            if (BidiUtils.isArabicLocale())
            	inputValue = BidiUtils.convertHindiToArabic(inputValue + "");

            this._origValue = parseFloat(inputValue) || CellBorderTools.getFirst(this._isLimited);
            setTimeout(lang.hitch(this, function() {
                if (this._opened) {
                    this.inputNode.focus();
                    this.inputNode.select();
                }
            }), 200);
        },

        focus: function(pos) {
            if (pos == "end") {
                var handled = false;
                if (!this.fontSizeUpDisabled) {
                    this.fontSizeUpWrapper.focus();
                    handled = true;
                } else if (!this.fontSizeDownDisabled) {
                    this.fontSizeDownWrapper.focus();
                    handled = true;
                }
                if (!handled)
                    this.focusNode.focus();
            } else
                this.focusNode.focus();
        },

        _onUpArrowKeyDown: function( /* Event */ evt) {
            // summary:
            // Handler for left arrow key when focus is on right part of button
            if (evt.keyCode == keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]) {
                focusUtils.focus(this.focusNode);
                evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.keyCode == keys.DOWN_ARROW) {
                if (!this.fontSizeDownDisabled) {
                    this.fontSizeDownWrapper.focus();
                    evt.preventDefault(), evt.stopPropagation();
                }
            }
        },

        _onDownArrowKeyDown: function( /* Event */ evt) {
            // summary:
            // Handler for left arrow key when focus is on right part of button
            if (evt.keyCode == keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]) {
                focusUtils.focus(this.titleNode);
                evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.keyCode == keys.UP_ARROW) {
                if (!this.fontSizeUpDisabled) {
                    this.fontSizeUpWrapper.focus();
                    evt.preventDefault(), evt.stopPropagation();
                }
            }
        },

        checkStatus: function() {
            var value = parseFloat(this.get("value"));
            var first = CellBorderTools.getFirst(this._isLimited);
            var last = CellBorderTools.getLast(this._isLimited);

            this.fontSizeUpDisabled = false;
            this.fontSizeDownDisabled = false;

            if (!value) {
                this.fontSizeUpDisabled = false;
                this.fontSizeDownDisabled = false;
            } else {
                if (value <= first)
                    this.fontSizeDownDisabled = true;
                if (value >= last)
                    this.fontSizeUpDisabled = true;
            }
            domClass.toggle(this.fontSizeUpWrapper, "dijitDisabled", this.fontSizeUpDisabled);
            domClass.toggle(this.fontSizeDownWrapper, "dijitDisabled", this.fontSizeDownDisabled);
        },

        _setDisabledAttr: function(d) {
            this.inherited(arguments);
            this.checkStatus();

            this.disabled = d;
            if (d)
                domClass.add(this.domNode, 'opacityPanelcover');
            else
                domClass.remove(this.domNode, 'opacityPanelcover');
        },

        _setLabelAttr: function(value) {
            this.inherited(arguments);
            this.containerNode.innerHTML = "";
            var content = value;
            if (BidiUtils.isArabicLocale())
            	content = BidiUtils.convertArabicToHindi(content + "");

            this.containerNode.value = content;
            this.checkStatus();
        },

        createDropDown: function() {
            var menu = new Menu({
                ownerDocument: this.ownerDocument,
                _focusManager: this._focusManager,
                id: this.id + "_popup",
                dir: window.BidiUtils.isGuiRtl() ? 'rtl' : ''
            });
            domClass.add(menu.domNode, "lotusActionMenu toolbarMenu");
            var _mItem = null;
            var me = this;
            if (this.items) {
                for (var i = 0; i < this.items.length; ++i) {
                    var label = this.items[i] + "";
                    if (BidiUtils.isArabicLocale())
                    	label = BidiUtils.convertArabicToHindi(label);

                    var clazz = this.checkable ? CheckedMenuItem : MenuItem;
                    menu.addChild(_mItem = new clazz({
                        label: label,
                        value: this.items[i],
                        onMouseDown: function() {
                            //pe.scene.slideEditor.borderStylePanelShow = true;
                            me.inputNode.blur();
                            me._clickItem(this);
                        },
                        dir: window.BidiUtils.isGuiRtl() ? 'rtl' : ''
                    }));
                    if (this.decorator)
                        this.decorator(_mItem, i, label);
                    wai.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
                }
            }
            aspect.after(menu, "onClose", lang.hitch(this, function() {
                this.dropDownClosed();
            }));
            return menu;
        },

        _clickItem: function(item) {
            this.dropDown.getChildren().forEach(function(t) {
                t.set("checked", false);
                t.set("selected", false);
            });
            item.set("checked", true);
            this.dropDown.selectedChild = item;
            this.set("value", item.value);
            this.onChange && this.onChange(item.value);
        },

        up: function() {
            if (this.fontSizeUpDisabled)
                return;
            if (this.disabled)
                return;
            var nextvalue = CellBorderTools.getNextValue(this.value, this._isLimited, true);
            this._setValueAttr(nextvalue);
            !this._opened && this.onChange && this.onChange(nextvalue);
        },

        down: function() {
            if (this.fontSizeDownDisabled)
                return;
            if (this.disabled)
                return;
            var nextvalue = CellBorderTools.getNextValue(this.value, this._isLimited, false);
            this._setValueAttr(nextvalue);
            !this._opened && this.onChange && this.onChange(nextvalue);
        },

        _getValueAttr: function() {
            return this.value;
        },

        _setValueAttr: function(value) {
            var oldValue = this.get("value");
            this.value = value;
            if (BidiUtils.isArabicLocale())
            	this.set("label", BidiUtils.convertArabicToHindi(value + ""));
            else
            	this.set("label", value);

            if (this.dropDown) {
                array.forEach(this.dropDown.getChildren(), (function(item) {
                    if (item.value == value) {
                        item.set("checked", true);
                        item.set("selected", true);
                    } else {
                        item.set("checked", false);
                        item.set("selected", false);
                    }
                }));
            }
        },

        setLimited: function(isLimited) {
            if (this._isLimited == isLimited)
                return;
            this._isLimited = isLimited;
            var max = CellBorderTools.getLast(this._isLimited);
            this.items = CellBorderTools.getItems(this._isLimited);
            this.dropDown.destroy();
            this.dropDown = this.createDropDown();
            if (this.value > max)
                this.value = max;
            this.set('value', this.value);
        },

        postCreate: function() {
            this.inherited(arguments);
            this.dropDown = this.createDropDown();
            this.value = 1;
            this._setValueAttr(1);
            this.connect(this.fontSizeUpDown, "onmousedown", function(e) {
                e.preventDefault(), e.stopPropagation();
            });
            this.connect(this.fontSizeUpDown, "onclick", function(e) {
                e.preventDefault(), e.stopPropagation();
            });

            this.connect(this.fontSizeUpWrapper, "onkeydown", function(e) {
                if (e.keyCode == keys.ENTER || e.keyCode == keys.SPACE) {
                    e.preventDefault(), e.stopPropagation();
                    this.up();
                }
            });

            this.connect(this.fontSizeDownWrapper, "onkeydown", function(e) {
                if (e.keyCode == keys.ENTER || e.keyCode == keys.SPACE) {
                    e.preventDefault(), e.stopPropagation();
                    this.down();
                }
            });

            typematic.addMouseListener(this.fontSizeUpWrapper, this, function(count) {
                if (count >= 0) {
                    // this.fontSizeUpTip._onUnHover();
                    this.up();
                }
            }, 0.9, 500);

            typematic.addMouseListener(this.fontSizeDownWrapper, this, function(count) {
                if (count >= 0) {
                    // this.fontSizeDownTip._onUnHover();
                    this.down();
                }
            }, 0.9, 500);

            var nls = i18nCellBorder;
            domAttr.set(this.fontSizeUpWrapper, {
                "title": nls.increaseBorderWidthTip,
                "role": "button"
            });
            domAttr.set(this.fontSizeDownWrapper, {
                "title": nls.decreaseBorderWidthTip,
                "role": "button"
            });
        }
    });
    return CellBorderWidth;
});
