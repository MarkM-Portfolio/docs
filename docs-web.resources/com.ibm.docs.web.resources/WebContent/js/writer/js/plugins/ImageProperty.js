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
    "dojo/_base/lang",
    "dojo/i18n!concord/widgets/nls/ImagePropHandler",
    "dojo/_base/declare",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/topic",
    "concord/widgets/ImagePropertyDialog",
    "writer/common/tools",
    "writer/constants",
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "writer/util/ViewTools"
], function(lang, i18nImagePropHandler, declare, i18nmenubar, topic, ImagePropertyDialog, tools, constants, msgCenter, Plugin, ViewTools) {

    var ImageProperty = declare("writer.plugins.ImageProperty", Plugin, {
        init: function() {
            var that = this;
            var imagePropCmd = {
                exec: function() {
                    var imageHandler = {
                        editor: pe.lotusEditor,
                        _selectedImg: null,
                        getImageInfo: function() {
                            var data = {};
                            this._selectedImg = that.getSelectedImg();
                            if (this._selectedImg) {
                                data.isSupportAlt = true;
                                data.Alt = this._selectedImg.description || "";
                                data.width = tools.toPxValue(this._selectedImg.width);
                                data.height = tools.toPxValue(this._selectedImg.height);
                                data.MaxWidth = 2112; // 22 in
                                data.MaxHeight = 2112; // 22 in
                            }
                            return data;
                        },

                        setImageInfo: function(width, height, border, alt) {
                            var img = that.getSelectedImg();
                            if (img && this._selectedImg != img) {
                                // The selected image was changed by other co-editor.
                                return;
                            }

                            var msgs = [],
                                msg;
                            if (alt != img.description) {
                                msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(img, null, null, {
                                    'descr': alt
                                }, {
                                    'descr': img.description
                                })]);
                                msgs.push(msg);

                                img.setDescription(alt);
                            }

                            width = tools.toCmValue(width + "px");
                            height = tools.toCmValue(height + "px");

                            var oldWidth = tools.toCmValue(img.width);
                            var oldHeight = tools.toCmValue(img.height);

                            if (width != oldWidth || height != oldHeight) {
                                var newSz = {},
                                    oldSz = {};
                                newSz.cx = width + "cm";
                                newSz.cy = height + "cm";
                                img.setSize(newSz);

                                oldSz.cx = oldWidth + "cm";
                                oldSz.cy = oldHeight + "cm";
                                msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(img, null, null, {
                                    'size': newSz
                                }, {
                                    'size': oldSz
                                })]);
                                msgs.push(msg);
                            }

                            msgCenter.sendMessage(msgs);
                        }
                    };

                    var nls = i18nImagePropHandler;
                    if (!this.dlg)
                        this.dlg = new ImagePropertyDialog(imageHandler, nls.dialogtitle, null, null);
                    this.dlg.show();
                }
            };

            this.editor.addCommand("imageProp", imagePropCmd);
            this.addContextMenu();
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.selectionChangeHandler));
        },

        getSelectedImg: function() {
            var imageView = ViewTools.getCurrSelectedImage();
            if (imageView)
                return imageView.model;

            return null;
        },

        selectionChangeHandler: function() {
            var img = this.getSelectedImg();
            pe.lotusEditor.getCommand('imageProp').setState(img == null ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
        },

        addContextMenu: function() {
            var nls = i18nmenubar;
            var ctx = this.editor.ContextMenu;
            var menuItem = {
                name: 'imageProperty',
                commandID: 'imageProp',
                label: nls.formatMenu_ImageProperties,
                group: 'image',
                order: 'ImageProperty',
                disabled: false
            };
            if (ctx && ctx.addMenuItem) {
                ctx.addMenuItem(menuItem.name, menuItem);
            }

            var that = this;
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var img = that.getSelectedImg();
                var ret = {};
                if (img) {
                    ret.imageProperty = menuItem;
                    return ret;
                } else
                    return;
            });
        }
    });
    return ImageProperty;
});
