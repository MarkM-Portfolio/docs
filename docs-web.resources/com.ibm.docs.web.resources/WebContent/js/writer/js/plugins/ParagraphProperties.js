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
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/topic",
    "concord/util/BidiUtils",
    "writer/common/RangeIterator",
    "writer/constants",
    "writer/core/Event",
    "writer/msg/msgCenter",
     "writer/msg/msgHelper",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "dojo/i18n!concord/widgets/nls/toolbar",
    "dijit/registry",
    "dijit/MenuSeparator",
    "dijit/MenuItem",
    "dijit/_base/wai",
    "writer/global"
], function(lang, declare, domClass, domConstruct, topic, BidiUtilsModule, RangeIterator, constants, Event, msgCenter, msgHelper, Plugin, ModelTools, i18ntoolbar, registry, MenuSeparator, MenuItem, wai, global) {


    getPprConfig = function() {
        return [{
                name: "justifyleft",
                pPr: {
                    'align': 'left'
                },
                type: "Align",
                shortcut: constants.KEYS.CTRL + constants.KEYS.SHIFT + 76 /*L*/
            }, {
                name: "justifycenter",
                pPr: {
                    'align': 'centered'
                },
                type: "Align",
                shortcut: constants.KEYS.CTRL + constants.KEYS.SHIFT + 69 /*E*/
            }, {
                name: "justifyright",
                pPr: {
                    "align": "right"
                },
                type: "Align",
                shortcut: constants.KEYS.CTRL + constants.KEYS.SHIFT + 82 /*R*/
            }, {
                name: "justifyblock",
                pPr: {
                    'align': 'justified'
                },
                type: "Align",
                shortcut: constants.KEYS.CTRL + constants.KEYS.SHIFT + 74 /*J*/
            }, {
                name: "paraProp"
            }, {
                name: "parapagebreak",
                pPr: {
                    'pageBreakBefore': true
                },
                type: "Pagination"
            }, {
                name: "keeplines",
                pPr: {
                    'keepLines': true
                },
                type: "Pagination"
            }, {
                name: "widowcontrol",
                pPr: {
                    'widowControl': true
                },
                type: "Pagination",
            }, {
                name: "bidiltr",
                pPr: {
                    'direction': 'ltr'
                },
                type: "Dir"
            }, {
                name: "bidirtl",
                pPr: {
                    'direction': 'rtl'
                },
                type: "Dir"
            },
            //	        {
            //	        	name:"Border",
            //	        	pPr:{},
            //	        	type:"Border"
            //	        },
            {
                name: "LineSpacing1",
                pPr: {
                    "lineRule": "auto",
                    "line": "1.0"
                },
                type: "LineSpacing"
            }, {
                name: "LineSpacing115",
                pPr: {
                    "lineRule": "auto",
                    "line": "1.15"
                },
                type: "LineSpacing"
            }, {
                name: "LineSpacing15",
                pPr: {
                    "lineRule": "auto",
                    "line": "1.5"
                },
                type: "LineSpacing"
            }, {
                name: "LineSpacing2",
                pPr: {
                    "lineRule": "auto",
                    "line": "2.0"
                },
                type: "LineSpacing"
            }, {
                name: "LineSpacing25",
                pPr: {
                    "lineRule": "auto",
                    "line": "2.5"
                },
                type: "LineSpacing"
            }, {
                name: "LineSpacing3",
                pPr: {
                    "lineRule": "auto",
                    "line": "3.0"
                },
                type: "LineSpacing"
            }
        ];
    };
    var borderStyle = {
        "val": "single",
        "sz": "0.75pt",
        "space": "1",
        "color": "auto"
    };

    var ParagraphProperties = declare("writer.plugins.ParagraphProperties", Plugin, {
        borderTypes: {
            "BottomBorder": {
                pBdr: {
                    "bottom": borderStyle
                }
            },
            "TopBorder": {
                pBdr: {
                    "top": borderStyle
                }
            },
            "LeftBorder": {
                pBdr: {
                    "left": borderStyle
                }
            },
            "RightBorder": {
                pBdr: {
                    "right": borderStyle
                }
            },
            "NoBorder": {
                pBdr: null
            },
            "AllBorders": {
                pBdr: {
                    "top": borderStyle,
                    "left": borderStyle,
                    "bottom": borderStyle,
                    "right": borderStyle
                }
            }
        },
        borderStyles: {},
        initialSelection: true,
        bindBorders: function(menu, sizestyles, isCtx) {
            var nls = this.nls;
            for (var item in this.borderTypes) {
                var resourceKey = "selectBorder_" + item;
                var newId = isCtx ? "ctx" : "D";
                newId += "_i_Border_" + item;
                if (item == "NoBorder")
                    menu.addChild(new MenuSeparator());
                menu.addChild(new MenuItem({
                    id: newId,
                    _data: item,
                    iconClass: "dijitEditorIcon dijitEditorIconSelectAll",
                    label: nls[resourceKey],
                    onClick: function() {
                        pe.lotusEditor.execCommand("Border", this._data);
                    }
                }));
                sizestyles[item] = this.borderTypes[item];
            };
            if (isCtx) {
                this._ctxSubMenuFHCreated = true;
            }
            this._subMenuFH = menu;
            return menu;
        },

        init: function() {
            var that = this;
            this.nls = i18ntoolbar;
            //		var borderMenu = registry.byId("D_m_Border");
            //		var borderstyle = this.borderStyles;
            //		this.bindBorders(borderMenu,borderstyle);

            var paraPprCmd = function(pPr, type) {
                this._ = {
                    "pPr": pPr,
                    "type": type
                };
            };

            var commands = getPprConfig();
            for (var i = 0; i < commands.length; i++) {
                var command = commands[i];
                this.editor.addCommand(command.name, new paraPprCmd(command.pPr, command.type), command.shortcut); /*B*/
            }

            paraPprCmd.prototype.exec = function(data) {
                var selection = pe.lotusEditor.getSelection();
                var ranges = selection.getRanges();
                var isPara = false,
                    isText = false;
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[i];
                    var startPos = range.getStartParaPos().index,
                        endPos = range.getEndParaPos().index;
                    if (startPos == 0 && pe.lotusEditor.getSelectedParagraph()[i].getLength() === endPos)
                        var isPara = true;
                    else if (range.isCollapsed())
                        var isColl = true;
                    else
                        var isText = true;
                }
                //			var style = borderstyle[data];
                var msgs = [],
                    msg;
                var isAlign = (this._.type == "Align");
                var isSpacing = (this._.type == "LineSpacing");
                var isBorder = (this._.type == "Border");
                var isPagination = (this._.type == "Pagination");

                var paras = pe.lotusEditor.getSelectedParagraph();
                for (var i = 0; i < paras.length; i++) {
                    if (isAlign)
                        msg = paras[i].setAlignment(this._.pPr['align']);
                    else if (isPagination) {
                        var value;
                        var state = this.getState();
                        if (state != constants.CMDSTATE.TRISTATE_ON)
                            value = true;
                        else
                            value = false;

                        var prop = this._.pPr;
                        for (var key in prop) {
                            if (key == "pageBreakBefore") {
                                msg = paras[i].setPageBreakBefore(value);
                            } else if (key == "keepLines") {
                                msg = paras[i].setKeepLines(value);
                            } else if (key == "widowControl") {
                                msg = paras[i].setWidowControl(value);
                            }
                        }
                    } else if (window.BidiUtils.isBidiOn() && this._.type == "Dir") {
                        var direction = this._.pPr['direction'];
                        if (pe.lotusEditor.setting.isOdtImport()) {
                            if (direction == 'rtl')
                                direction = 'rl-tb';
                            else if (direction == 'ltr')
                                direction = 'lr-tb';
                        }
                        if (paras[i].getDirectProperty().getDirection() != direction) {
                            msg = paras[i].setDirection(direction);
                            msgHelper.mergeMsgs(msgs, msg);
                            if (paras[i].getDirectProperty().getAlign() != 'centered')
                                msg = paras[i].setAlignment(this._.pPr['direction'] == "rtl" ? "right" : "left");
                            else
                                msg = null;
                        }
                    }
                    //				else if(isBorder)
                    //				{
                    //					if(isPara){
                    //						var border = style['pBdr'];
                    //						var paraBorder = paras[i].getBorder();
                    //
                    //						
                    //						var borderNums = function(border){
                    //							var borderData = 0;
                    //							for(var data in border){
                    //								borderData++;
                    //							}
                    //							switch(borderData)
                    //							{
                    //								case 0:
                    //									borderData = "NoBorder";
                    //									break;
                    //								case 1:
                    //									borderData = "SingleBorder";
                    //									break;
                    //								case 4:
                    //									borderData = "AllBorder";
                    //									break;
                    //								default:
                    //									borderData = "MixBorder";
                    //							}
                    //							return borderData;
                    //						};
                    //		
                    //						
                    //						var borderClone = dojo.clone(paraBorder);
                    //							
                    //						if(!borderClone)
                    //							borderClone = {};
                    //						
                    //						if(borderNums(border) == "AllBorder"){
                    //							if(borderNums(borderClone) == "AllBorder")
                    //								borderClone = null;
                    //							else
                    //								borderClone = border;
                    //						}
                    //						else if(borderNums(border) == "NoBorder"){
                    //							borderClone = null;
                    //						}
                    //						else{
                    //							for(var item in border){
                    //								if(borderClone[item])
                    //									delete borderClone[item];
                    //								else
                    //									borderClone[item] = border[item];
                    //							}
                    //						}
                    //						msg = paras[i].setBorder(borderClone);
                    //					}
                    //					if(isText)
                    //					{
                    //						var textBorderStyle;
                    //						if(data != "NoBorder")
                    //							textBorderStyle = borderStyle;
                    //						else
                    //							textBorderStyle = null;
                    //						
                    //						var textBorderStyle = new writer.style({'bdr':textBorderStyle});
                    //						textBorderStyle.applyStyle();
                    //							
                    //					}
                    //				}
                    else if (isSpacing) {
                        var lineRule = this._.pPr['lineRule'];
                        var value = this._.pPr['line'];
                        if (lineRule == "auto") {
                            lineRule = "relative";
                        } else if (lineRule == "exact") {
                            lineRule = "absolute";
                        }
                        msg = paras[i].setLineSpacing(value.toString(), lineRule);
                    } else
                        continue;
                    msgHelper.mergeMsgs(msgs, msg);
                }

                msgCenter.sendMessage(msgs);

                var func = selectionChangeHandler;
                setTimeout(function() {
                    func();
                }, 0);

                return true;
            };

            var selectionChangeHandler = function() {
                var editor = pe.lotusEditor;
                var maxParagraphCount = 100;
                var paraFuncArea = true;
                var paras = editor.getSelectedParagraph(maxParagraphCount);
                var direction = null,
                    align = null,
                    lineSpacing = null,
                    pageBreak = null,
                    keepLines = null,
                    widowControl = null,
                    paraProp;
                var isSameDirection = true,
                    isSameAlign = true,
                    isSameLineSpacing = true;
                var isSamePageBreak = true,
                    isSameKeepLines = true,
                    isSameWidowControl = true;
                // Get alignment and line spacing value from selection
                for (var i = 0;
                    (isSameDirection || isSameAlign || isSameLineSpacing || isSamePageBreak || isSameKeepLines || isSameWidowControl) && i < paras.length; i++) {

                    paraFuncArea = paraFuncArea && ModelTools.isInDocPara(paras[i]);
                    paraProp = paras[i].directProperty;
                    if (!isSameAlign)
                        align = "";
                    else if (!align)
                        align = paraProp.getAlign();
                    else if (align != paraProp.getAlign())
                        isSameAlign = false;

                    if (!isSameLineSpacing)
                        lineSpacing = "";
                    else if (!lineSpacing)
                        lineSpacing = paraProp.getLineSpaceValue();
                    else if (lineSpacing != paraProp.getLineSpaceValue())
                        isSameLineSpacing = false;

                    if (!isSamePageBreak)
                        pageBreak = "";
                    else if (!pageBreak)
                        pageBreak = paraProp.isPageBreakBefore();
                    else if (pageBreak != paraProp.isPageBreakBefore())
                        isSamePageBreak = false;

                    if (!isSameKeepLines)
                        keepLines = "";
                    else if (!keepLines)
                        keepLines = paraProp.isKeepLines();
                    else if (keepLines != paraProp.isKeepLines())
                        isSameKeepLines = false;

                    if (!isSameWidowControl)
                        widowControl = "";
                    else if (!widowControl)
                        widowControl = paraProp.isWidowControl();
                    else if (widowControl != paraProp.isWidowControl())
                        isSameWidowControl = false;


                    if (window.BidiUtils.isBidiOn()) {
                        if (!isSameDirection)
                            direction = "";
                        else if (!direction)
                            direction = paraProp.getDirection();
                        else if (direction != paraProp.getDirection())
                            isSameDirection = false;
                    }
                }

                // Update alignment and line spacing command status.
                var alignStatus = "";
                if (isSameAlign) {
                    switch (align) {
                        case "left":
                            alignStatus = 'justifyleft';
                            break;
                        case "right":
                            alignStatus = 'justifyright';
                            break;
                        case "centered":
                            alignStatus = 'justifycenter';
                            break;
                        case "justified":
                            alignStatus = 'justifyblock';
                            break;
                        default:
                            alignStatus = 'justifyblock';
                            break;
                    }
                }

                if (!paraFuncArea)
                    editor.getCommand('paraProp').setState(constants.CMDSTATE.TRISTATE_DISABLED);
                else
                    editor.getCommand('paraProp').setState(constants.CMDSTATE.TRISTATE_OFF);


                var cmd, cmdName, state;
                for (var i = 0; i < commands.length; i++) {
                    cmdName = commands[i].name;
                    cmd = editor.getCommand(cmdName);
                    if (!cmd) continue;
                    state = constants.CMDSTATE.TRISTATE_OFF;
                    if (commands[i].type == "Align") {
                        if (alignStatus == cmdName)
                            state = constants.CMDSTATE.TRISTATE_ON;
                        cmd.setState(state);

                        if (alignStatus) {
                            var widget = registry.byId("D_t_Align");
                            var configs = global.getAlignConfig();
                            for (var j = 0; j < configs.length; j++) {
                                var config = configs[j];
                                if (config.command == alignStatus) {
                                    widget.set("title", config.title);
                                    widget.set("label", config.label);
                                    wai.setWaiState(widget.titleNode, "label", config.label);
                                    widget.set("iconClass", config.iconClass);
                                    break;
                                }
                            }
                        };
                    } else if (window.BidiUtils.isBidiOn() && commands[i].type == "Dir") {
                        if (isSameDirection && direction == commands[i].pPr.direction)
                            state = constants.CMDSTATE.TRISTATE_ON;
                        cmd.setState(state);

                        var widget = registry.byId("D_t_Direction");
                        var isRtlDir = direction == 'rtl';
                        if ((isRtlDir ^ (widget.iconClass == "cke_button_bidirtl")) || this.initialSelection) {
                            this.initialSelection = false;
                            var nls = i18ntoolbar;
                            var lbl = isRtlDir ? nls.rtlDirectionTip : nls.ltrDirectionTip
                            widget.set("title", lbl);
                            widget.set("label", lbl);
                            wai.setWaiState(widget.titleNode, "label", lbl);
                            widget.set("iconClass", isRtlDir ? "cke_button_bidirtl" : "cke_button_bidiltr");

                            var indent = registry.byId('D_t_Indent'),
                                outdent = registry.byId('D_t_Outdent'),
                                bulletList = registry.byId('D_t_BulletList'),
                                numberList = registry.byId('D_t_NumberList');
                            if (isRtlDir) {
                                domConstruct.place(outdent.domNode, indent.domNode, window.BidiUtils.isGuiRtl() ? "after" : "before");

                                domClass.remove(indent.iconNode, 'indentIcon');
                                domClass.add(indent.iconNode, 'outdentIcon');
                                domClass.remove(outdent.iconNode, 'outdentIcon');
                                domClass.add(outdent.iconNode, 'indentIcon');

                                domClass.add(bulletList.iconNode, 'rtl');
                                domClass.add(numberList.iconNode, 'rtl');
                            } else {
                                domConstruct.place(outdent.domNode, indent.domNode, window.BidiUtils.isGuiRtl() ? "before" : "after");

                                domClass.remove(indent.iconNode, 'outdentIcon');
                                domClass.add(indent.iconNode, 'indentIcon');
                                domClass.remove(outdent.iconNode, 'indentIcon');
                                domClass.add(outdent.iconNode, 'outdentIcon');

                                domClass.remove(bulletList.iconNode, 'rtl');
                                domClass.remove(numberList.iconNode, 'rtl');
                            }
                        }
                    } else if (commands[i].type == "LineSpacing") {
                        if (isSameLineSpacing && lineSpacing == commands[i].pPr.line)
                            state = constants.CMDSTATE.TRISTATE_ON;
                        cmd.setState(state);
                    } else if (commands[i].type == "Pagination") {

                        var prop = commands[i].pPr;
                        for (key in prop) {
                            if (key == "pageBreakBefore") {
                                if (isSamePageBreak) {
                                    if (commands[i].pPr.pageBreakBefore == pageBreak)
                                        state = constants.CMDSTATE.TRISTATE_ON;
                                    else
                                        state = constants.CMDSTATE.TRISTATE_OFF;
                                }
                            } else if (key == "keepLines") {
                                if (isSameKeepLines) {
                                    if (commands[i].pPr.keepLines == keepLines)
                                        state = constants.CMDSTATE.TRISTATE_ON;
                                    else
                                        state = constants.CMDSTATE.TRISTATE_OFF;
                                }
                            } else if (key == "widowControl") {
                                if (isSameWidowControl) {
                                    if (commands[i].pPr.widowControl == widowControl)
                                        state = constants.CMDSTATE.TRISTATE_ON;
                                    else
                                        state = constants.CMDSTATE.TRISTATE_OFF;
                                }
                            }
                        }
                        cmd.setState(state);
                    }
                }
            };

            //register selection change event
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, selectionChangeHandler));
        }
    });

    return ParagraphProperties;
});
