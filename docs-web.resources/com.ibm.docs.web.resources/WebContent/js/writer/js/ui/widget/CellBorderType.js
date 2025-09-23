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
    "dojo/_base/array",
    "dojo/i18n!writer/ui/widget/nls/CellBorder",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/dom-class",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/aspect",
    "dojo/query",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/form/DropDownButton",
    "writer/util/CellBorderTools",
    "dijit/_base/wai"
], function(keys, array, i18nCellBorder, lang, has, domClass, declare, domConstruct, on, aspect, query, Menu, MenuItem, DropDownButton, CellBorderTools, wai) {
    var CellBorderType = declare("writer.ui.widget.CellBorderType", DropDownButton, {

        baseClass: "dijitDropDownButton cellBorderType",
        iconClass: "solid",

        constructor: function() {
            this.inherited(arguments);
            var constant = CellBorderTools.Constant.BORDER_STYLE;
            var nls = i18nCellBorder;
            this._children = [{
                icon: "solid",
                value: constant.SOLID,
                label: nls.border_type_solid
            }, {
                icon: "dashed",
                value: constant.DASHED,
                label: nls.border_type_dashed
            }, {
                icon: "dotted",
                value: constant.DOTTED,
                label: nls.border_type_dotted
            }, {
                icon: "double",
                value: constant.DOUBLE,
                label: nls.border_type_double
            }];
        },
        _getNextTypeValue: function(value) {
            var i = 0;
            while (i < this._children.length) {
                if (this._children[i].value === value)
                    break;
                ++i;
            }
            if (i == this._children.length)
                throw new Error("value not found");
            return this._children[(i + 1) % this._children.length].value;
        },
        _getPreTypeValue: function(value) {
            var i = 0;
            while (i < this._children.length) {
                if (this._children[i].value === value)
                    break;
                ++i;
            }
            if (i == this._children.length)
                throw new Error("value not found");
            return this._children[(i + this._children.length - 1) % this._children.length].value;
        },
        createDropDown: function() {
            var menu = new Menu({
                id: this.id + "_popup"
            });
            domClass.add(menu.domNode, "lotusActionMenu toolbarMenu cellBorderType");
            var me = this;
            if (this._children) {
                for (var i = 0; i < this._children.length; ++i) {
                    var c = this._children[i];
                    var value = c.value || c.icon;
                    var iconClass = "dijitToolbarIcon " + c.icon;
                    var _mItem = new MenuItem({
                        iconClass: iconClass,
                        value: value,
                        cmd: me.cmd,
                        title: c.label,
                        onMouseDown: function() {
                            //pe.scene.slideEditor.borderStylePanelShow = true;
                            me._onMouseDown(this);
                        }
                    });
                    menu.addChild(_mItem);
                    query(".dijitMenuItemLabel,.dijitMenuItemAccelKey,.dijitMenuArrowCell",
                            _mItem.domNode)
                        .forEach(function(dom) {
                            domConstruct.destroy(dom);
                        });
                    wai.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
                }
            }
            aspect.after(menu, "onClose", lang.hitch(this, function() {
                this.dropDownClosed();
            }));
            return menu;
        },

        _onMouseDown: function(item) {
            if (item.disabled)
                return;
            if (item.value) {
                this.value = this.valueNode.value = item.value;
                this.selectNode(this.value);
                this.focusChild = item;
            }
        },

        _getValueAttr: function() {
            return this.value;
        },

        _setValueAttr: function(value) {
            this.valueNode.value = this.value = value;
            this.selectNode(value);
        },

        dropDownClosed: function() {
            var v = this.get("value");
            if (v !== this._origValue) {
                this._origValue = v;
                this.onChange && this.onChange();
            }
            // pe.scene.slideEditor.borderStylePanelShow = false;
        },

        selectNode: function(nodevalue) {
            this.set("iconClass", "dijitToolbarIcon " + nodevalue);
            this.iconNode.innerHTML = "";
            var me = this;
            array.forEach(this.dropDown.getChildren(), (function(item) {
                if (item.value == nodevalue || (item.iconClass && item.iconClass.replace("dijitToolbarIcon ", "").trim() == nodevalue)) {
                    item.set("selected", true);
                    domClass.add(item.domNode, "dijitMenuItemSelected");
                    me.focusChild = item;
                } else {
                    item.set("selected", false);
                    domClass.remove(item.domNode, "dijitMenuItemSelected");
                }
            }));
        },

        dropDownOpened: function() {
            this._origValue = this.value;
            //for up and down key control
            setTimeout(lang.hitch(this, function() {
                if (this._opened) {
                    this.focusNode && this.focusNode.focus();
                }
            }), 200);
        },

        openDropDown: function() {
            domClass.remove(this.domNode, "lineTypeBtnFocus");
            if (this.dropDown && !this.dropDown.onOpenConnected) {
                this.dropDown.onOpenConnected = true;
                aspect.after(this.dropDown, "onOpen", lang.hitch(this, function() {
                    var dom = this.dropDown._popupWrapper;
                    if (dom) {
                        if (!domClass.contains(dom, "toolbarPopup"))
                            domClass.add(dom, "toolbarPopup");
                    }
                    //prevent focusing on first child. Always focus on buttonNode.
                    this.dropDown.focusChild = function() {};
                    this.dropDownOpened();
                }));
            }
            this.inherited(arguments);
            var me = this;
            (has("ie") || has("trident")) && this.dropDown.domNode.parentNode.addEventListener("scroll", function(evt) {
                pe.panelScrolling = true;
                pe.linePanelHasTimer && clearTimeout(pe.linePanelHasTimer);
                pe.linePanelHasTimer = setTimeout(lang.hitch(this, function() {
                    me.focus();
                }), 10);
            });
        },

        closeDropDown: function() {
            if (pe.panelScrolling) {
                pe.panelScrolling = false;
                return;
            } else {
                this.inherited(arguments);
            }
        },
        _onKey: function(e) {
            if (this._opened && e && e.keyCode == keys.ESCAPE) {
                this.set("value", this._origValue);
                this.valueNode.focus();
            }
            this.inherited(arguments);
        },
        postCreate: function() {
            this.inherited(arguments);
            // this.containerNode.remove();
            this.dropDown = this.createDropDown();
            this.valueNode.value = this.value = this._children[0].value;
            this.selectNode(this.valueNode.value);
            // All key operation written on buttonNode. Only MouseDown() written on dropDown menuItem.
            this.connect(this._buttonNode, "onkeydown", function(evt) {

                var keyCode = evt.keyCode;
                if (keyCode == keys.RIGHT_ARROW || keyCode == keys.LEFT_ARROW) {
                    evt.stopPropagation();
                } else if (keyCode == keys.DOWN_ARROW || keyCode == keys.UP_ARROW) {
                    var cur_value = this.valueNode.value;
                    evt.stopPropagation();
                    if (keyCode == keys.DOWN_ARROW) {
                        var dashValue = this._getNextTypeValue(cur_value);
                        if (dashValue != cur_value)
                            this.set('value', dashValue);
                    }
                    if (keyCode == keys.UP_ARROW) {
                        var dashValue = this._getPreTypeValue(cur_value);
                        if (dashValue != cur_value)
                            this.set('value', dashValue);
                    }
                } else if (keyCode == keys.ESCAPE) {
                    this.set("value", this._origValue);
                    this.valueNode.focus();
                } else if (keyCode == keys.ENTER && this._opened) {
                    this.value = this.valueNode.value;
                    this.closeDropDown();
                }
            });
        }
    });
    return CellBorderType;
});
