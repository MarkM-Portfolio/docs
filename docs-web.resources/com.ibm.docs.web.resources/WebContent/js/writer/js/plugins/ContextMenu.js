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
    "dojo/dom-style",
    "dojo/topic",
    "concord/util/BidiUtils",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/ui/menu/Menu",
    "writer/ui/widget/ListStyle",
    "writer/ui/widget/ColorPalette",
    "dijit/registry",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dijit/MenuSeparator",
    "dijit/PopupMenuItem",
    "dijit/popup"
], function(declare, domStyle, topic, BidiUtils, constants, Plugin, Menu, ListStyle, ColorPalette, registry, MenuItem, CheckedMenuItem, MenuSeparator, PopupMenuItem, popupUtil) {

    var ContextMenu = declare("writer.plugins.ContextMenu", Plugin, {
        _menuItemsOrderNum: {
            // comment
            "toggleCommentsCmd": 1,
            // filter
            "cut": 1,
            "copy": 2,
            "paste": 3,
            /*******table*********/
            "deleteTable": 1,
            "tableProperty": 2,
            "Column": 3,
            "Row": 4,
            "Cell": 5,

            "insertColBfr": 1,
            "insertColAft": 2,
            "moveColBfr": 3,
            "moveColAft": 4,
            "deleteCol": 5,

            "insertRowAbove": 1,
            "insertRowBelow": 2,
            "moveRowAbove": 3,
            "moveRowBelow": 4,
            "deleteRow": 5,

            "splitH": 1,
            "splitV": 2,
            "mergeCells": 3,

            /*******list*********/
            "restartList": 1,
            "continueList": 2,
            "separateList": 3,
            "joinList": 4,
            "setNumberingVal": 5,

            /*******link*********/
            "openlink": 1,
            "link": 2,
            "unlink": 3,

            /*******style*********/
            'fontstyle': 1,
            'bold': 2,
            'italic': 3,
            'underline': 4,
            'strike': 5,
            'color': 6,
            'highlightcolor': 7,
            'backcolor': 8,
            'subscript': 9,
            'superscript': 10,

            /*******font*********/
            'fontfamily': 2,
            'fontsize': 4,
            'fontheading': 3,

            /*******toc*********/
            'updateTOC': 1,
            'deleteTOC': 2,

            'updatePageNumber': 2,
            'updateEntireTOC': 1,

            /********field********/
            "updateField": 5,

            /******textbox********/
            'textboxProperty': 1,

            /******image********/
            'WrapText': 1,

            'ImageProperty': 1,

            'ImgInline': 1,
            'ImgSquare': 2,
            'ImgTopBottom': 3,
            'ImgBehind': 4,
            'ImgInFront': 5,
            'ImgMoreWrap': 6,

            'BothSides': 7,
            'LeftOnly': 8,
            'RightOnly': 9,
            'LargestOnly': 10,

            /******HeaderFooter******/
            'HeaderFooter': 1,

            'DiffFirst': 1,
            'DiffOddEven': 2,
            'LinkToPre': 3

        },
        _menuItemsGroupNum: {
            "menu_separator": -100, //group NO. for menu separator



            //recommended rule: subGroup = parentGroup * 100 + order
            "tableofcontents": 1,
            "update": 101,
            "filter": 2,
            "cut": 201,
            "copy": 202,
            "paste": 203,
            "sc_suggestion": 3,
            "sc_action": 4,
            "deleteTable": 5,
            "table": 6,
            "Column": 501,
            "Row": 502,
            "Cell": 503,
            "list": 7,

            "link": 8,

            "font": 9,



            "style": 10,

            "field": 11,

            "image": 12,
            "WrapText": 1201,
            "hdrftr": 13,
            "HeaderFooter": 1301,
            "toggleCommentsCmd": 14,
            "textbox": 15

        },
        /**
         * array of callbacks who subscribe the contextmenu event
         * 
         */
        listeners: [],
        closeListeners: [],
        _menuItems: {},
        _menuSeparators: [],

        init: function() {
            this.editor.ContextMenu = this;
        },

        /**
         * add items (create or just display) with info to context menu.
         * @param items with information.
         * @param menu in which add menu items.
         */
        _addInfoItems2Menu: function(itemobjs, parent) {
            if (!itemobjs) return;
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            var lastGroup = -1,
                newMenuItem = null,
                subWidget = null,
                itemobj, i;
            var fromIdx = 0; //check if the current item has been created from 'fromIdx'
            var groupCfg = this._menuItemsGroupNum;
            for (i = 0; i < itemobjs.length; i++) {
                itemobj = itemobjs[i].itemInfo;
                var itemName = itemobj.name;
                var isCreated = false;
                //created already, just display
                if (this._menuItems[itemName].menu) {
                    isCreated = true;
                    this._setMenuItemDisplay(this._menuItems[itemName].menu);
                    this._menuItems[itemName].menu.setDisabled(itemobj.disabled);
                }
                //menu separator between groups.
                if (groupCfg[itemobj.group] !== lastGroup && lastGroup !== -1) {
                    /**
                     * get the menu separator following the specific group
                     * @param parent menu
                     * @param the group name 
                     * @param the start index of search 
                     */
                    function getMenuSeparatorAft(parent, groupNum, fromIdx) {
                        var children = parent.getChildren();
                        for (var i = fromIdx; i < children.length; i++) {
                            var currentGroupNum = groupCfg[children[i].group];
                            if (currentGroupNum != groupNum) {
                                if (currentGroupNum == groupCfg["menu_separator"]) {
                                    return children[i];
                                } else {
                                    return;
                                }

                            }
                        }
                    }
                    var lastChildIndex = parent.getIndexOfChild(itemobjs[i - 1].menu);
                    if (!lastChildIndex) {
                        console.log("can not find last child");
                    }
                    var nextSprt = getMenuSeparatorAft(parent, lastGroup, lastChildIndex + 1);
                    if (!nextSprt) { //the menu separator need to be created
                        var newSprt = new MenuSeparator();
                        newSprt.group = "menu_separator";
                        this._menuSeparators.push(newSprt);
                        parent.addChild(newSprt, lastChildIndex + 1);
                        fromIdx = lastChildIndex + 1;
                    } else { //the menu separator has been created already , just display
                        this._setMenuItemDisplay(nextSprt);
                    }

                }
                if (itemobj.subWidget) { //with sub items, handle the sub items
                    if (isCreated) {
                        subWidget = this._menuItems[itemName].sub;
                    } else {
                        switch (itemobj.subWidget) {
                            case "menu":
                                {
                                    subWidget = new Menu({
                                        dir: dirAttr
                                    });
                                    break;
                                }
                            case "liststyle":
                                { //list style widget.
                                    subWidget = new ListStyle();
                                    break;
                                }
                            case "tables":
                                {
                                    break;
                                }
                            case "color":
                                {
                                    subWidget = new ColorPalette(itemobj.args);
                                    break;
                                }
                            default:
                                subWidget = itemobj.subWidget;
                                break;
                        }
                        this._menuItems[itemName].sub = subWidget;
                        itemobj.popup = subWidget;
                        itemobj.dir = dirAttr;
                        newMenuItem = new PopupMenuItem(itemobj);
                    }
                    if (itemobj.subWidget === "menu") { //add menu item recursively.
                        arguments.callee.call(this, itemobj.subItems, subWidget);
                    }
                } else { //without sub items
                    if (!isCreated) {
                        itemobj.dir = dirAttr;
                        if (itemobj.isCheckedMenu)
                            newMenuItem = new CheckedMenuItem(itemobj);
                        else
                            newMenuItem = new MenuItem(itemobj);
                    }
                }
                if (!isCreated) { //not yet created, insert into parent menu
                    this._menuItems[itemName].menu = newMenuItem;
                    var index = this._getInsertPosition(parent, itemobj.group, itemobj.order, fromIdx);
                    parent.addChild(newMenuItem, index);
                    fromIdx = index;
                }
                lastGroup = this._menuItemsGroupNum[itemobj.group];
            }
        },
        /**
         * reset all of the menu items display = 'none'
         */
        _resetCtxMenu: function() {
            for (var i in this._menuItems) {
                var menuItem = this._menuItems[i];
                menuItem.menu && domStyle.set(menuItem.menu.domNode, "display", "none");
            }
            for (var j in this._menuSeparators) {
                var menuSprt = this._menuSeparators[j];
                domStyle.set(menuSprt.domNode, "display", "none");
            }
        },
        /**
         * set menu item from hidden to display
         * @param menu item to be displayed
         */
        _setMenuItemDisplay: function(menu) {
            domStyle.set(menu.domNode, "display", "");
        },
        /**
         * get the position index to insert child menu item in parent menu
         * @param parent menu
         * @param the group name of the menu item to be inserted
         * @param the order name of the menu item to be inserted
         * @param the start index of search 
         */
        _getInsertPosition: function(parent, group, order, fromIdx) {
            var groupCfg = this._menuItemsGroupNum,
                orderCfg = this._menuItemsOrderNum;
            var children = parent.getChildren();
            var prior = null;
            for (var i = fromIdx; i < children.length; i++) {
                var child = children[i];
                if ((groupCfg[group] < groupCfg[child.group]) ||
                    (groupCfg[group] == groupCfg[child.group] && orderCfg[order] < orderCfg[child.order]) ||
                    (groupCfg[child.group] === groupCfg["menu_separator"] && prior && groupCfg[group] == groupCfg[prior.group])
                ) {
                    break;
                }
                prior = child;
            }
            if (!prior) {
                return 0;
            } else {
                return parent.getIndexOfChild(prior) + 1;
            }
        },
        /**
         * alter items from listener to object with all information recursively. 
         * @param listener's items object array.
         * @param listener item's parent
         * @return nested array of object with info.
         */
        _alterListenerItemsInfo: function(listenerItems, parent) {
            if (!listenerItems) return;
            if (parent) parent.subItems = [];
            else parent = [];
            for (var itemName in listenerItems) {
                var obj = this._menuItems[itemName];
                if (!obj) {
                    console.log('warning!!');
                }
                var itemobj = this._menuItems[itemName].itemInfo,
                    item = listenerItems[itemName];
                if (!itemobj) continue;
                if (typeof(item) === 'object') {
                    itemobj.disabled = item.disabled;
                    if (item.getSubItems)
                        itemobj.getSubItems = item.getSubItems;
                    if (item.subWidget) {
                        itemobj.subWidget = item.subWidget;
                        itemobj.args = item.args;
                    }
                } else {
                    itemobj.disabled = item;
                }
                if (itemobj.getSubItems) {
                    itemobj.subWidget = "menu";
                    arguments.callee.call(this, itemobj
                        .getSubItems(), itemobj);
                } else {
                    if (!itemobj.onClick)
                        itemobj.onClick = item.onClick ? item.onClick : new Function(
                            'pe.lotusEditor.execCommand(\'' + itemobj.commandID + '\');');
                }
                if (parent.subItems)
                    parent.subItems.push(obj);
                else
                    parent.push(obj);
            }
            return parent;
        },

        /**
         * those who calls to subscribe contextmenu event. 
         */
        addListener: function(func) {
            this.listeners.push(func);
        },
        addCloseListener: function(func) {
            this.closeListeners.push(func);
        },

        addMenuItem: function(name, item) {
            if (!(item && (item.commandID || item.onClick) /*&& item.label*/ && item.group && item.order))
                throw 'item object lacks needed property in ContextMenu.addMenuItem';
            if (!item.label)
                console.warn('A menu item label is missing, will use "undefined" instead.');
            this._menuItems[name] = {};
            this._menuItems[name].itemInfo = item;
        },

        removeMenuItems: function(type) {
            var contextMenu = registry.byId('ctx');
            for (var i in this._menuItems) {
                if (this._menuItems[i].itemInfo.type == type) {
                    var itemobj = this._menuItems[i];
                    if (contextMenu && itemobj.menu) {
                        contextMenu.removeChild(itemobj.menu);
                        itemobj.menu.destroyRecursive(false);
                        delete itemobj.menu;
                    }
                    delete this._menuItems[i];
                }
            }
        },

        removeListener: function() {
            // TODO
        },
        /**
         * show context menu.
         * @param event.target Element.
         * @param selection from EditShell.getSelection
         * @param absolute coordinate x and y.
         */
        show: function(target, selection, x, y) {
            var listenerItems = [],
                listeners = this.listeners,
                closelisteners = this.closeListeners,
                menuId = 'ctx';
            var contextMenu = registry.byId(menuId);

            //create only when initializing
            if (!contextMenu) {
                contextMenu = new Menu({
                    id: menuId,
                    dir: window.BidiUtils.isGuiRtl() ? 'rtl' : ''
                });
            }
            popupUtil.moveOffScreen(contextMenu);
            //get listeners' sorted items by group.
            for (var i = 0; i < listeners.length; i++) {
                var group = listeners[i](target, selection);
                if (!group) {
                    continue;
                }
                var t = this._alterListenerItemsInfo(group, null);
                listenerItems = listenerItems.concat(t);
            }

            //sort items recursively by 'group' then by 'order'. 
            var orders = this._menuItemsOrderNum,
                groups = this._menuItemsGroupNum;
            listenerItems.sort(function(a, b) {
                if (a.itemInfo.subItems) a.itemInfo.subItems.sort(arguments.callee);
                if (b.itemInfo.subItems) b.itemInfo.subItems.sort(arguments.callee);
                var orderA = orders[a.itemInfo.order],
                    orderB = orders[b.itemInfo.order],
                    groupA = groups[a.itemInfo.group],
                    groupB = groups[b.itemInfo.group];
                if (!orderA || !orderB || !groupA || !groupB) {
                    console.log('group or order not configed...');
                }
                return groupA == groupB ? orderA - orderB : groupA - groupB;
            });

            //create menuItem or just display when they are created already
            this._addInfoItems2Menu(listenerItems, contextMenu);

            contextMenu.startup();
            var that = this;
            var pu = popupUtil;
            pu.open({
                x: x,
                y: y,
                popup: contextMenu,
                onExecute: function() {
                    pe.lotusEditor.getSelection()._cursor.show();
                    pu.close(contextMenu);
                },
                onCancel: function() {
                    pu.close(contextMenu);
                },
                onClose: function() {
                    pu.close(contextMenu);
                    that._resetCtxMenu();
                    //get close listeners
                    for (var i = 0; i < closelisteners.length; i++) {
                        closelisteners[i]();
                    }
                    delete contextMenu.onBlur;
                    pe.lotusEditor.focus();
                }
            });
            topic.publish(constants.EVENT.CANCELRESIZE);
            contextMenu.focus();
            setTimeout(function() {
                contextMenu.onBlur = function() {
                    pe.lotusEditor._shell.dismissContextMenu();
                };
            }, 500);
        }
    });
    return ContextMenu;
});
