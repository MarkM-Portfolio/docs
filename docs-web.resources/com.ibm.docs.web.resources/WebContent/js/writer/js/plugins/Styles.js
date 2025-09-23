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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/topic",
    "writer/plugins/Plugin",
    "writer/common/RangeIterator",
    "writer/core/Range",
    "writer/constants",
    "writer/core/Event",
    "writer/msg/msgCenter",
    "writer/util/HelperTools",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/plugins/Style"
], function(array, declare, lang, i18nmenubar, topic, Plugin, RangeIterator, Range, constants, Event, msgCenter, HelperTools, ModelTools, RangeTools, Style) {

    var Styles = declare("writer.plugins.Styles", Plugin, {
        getStylesConfig: function() {
            return [{
                    name: "bold",
                    style: {
                        'font-weight': 'bold'
                    },
                    shortcut: constants.KEYS.CTRL + 66 /*B*/
                }, {
                    name: "italic",
                    style: {
                        'font-style': 'italic'
                    },
                    shortcut: constants.KEYS.CTRL + 73 /*i*/
                }, {
                    name: "underline",
                    style: {
                        'u': {
                            "val": "single"
                        }
                    },
                    removeStyle: {
                        'u': {
                            "val": "none"
                        }
                    }, // Remove Style
                    shortcut: constants.KEYS.CTRL + 85 /*u*/
                }, {
                    name: "strike",
                    style: {
                        'strike': '1'
                    },
                    removeStyle: {
                        'strike': '-1'
                    } // Remove Style
                }, {
                    name: "ForeColor",
                    style: {
                        'color': ''
                    }
                }, {
                    name: "HighlightColor",
                    style: {
                        'background-color': ''
                    }
                }, {
                    name: "superscript",
                    style: {
                        'vertical-align': 'super'
                    },
                    shortcut: constants.KEYS.CTRL + 190 /*.*/
                }, {
                    name: 'subscript',
                    style: {
                        'vertical-align': 'sub'
                    },
                    shortcut: constants.KEYS.CTRL + 188 /*,*/
                }
                //              {
                //                  name:"heading",
                //                  style:{'styleId':'Normal'}
                //              }
            ];
        },

        init: function() {
            var styleCommand = function(commandDef, removeDef) {
                this.style = new Style(commandDef, removeDef);
            };

            styleCommand.prototype.checkActive = function(model) {
                var styleDef = this.style._.definition;
                var style = model.getComputedStyle();
                if (!style) {
                    return constants.CMDSTATE.TRISTATE_OFF;
                }
                for (var key in styleDef) {
                    var isUnderline = isStrike = false;
                    if (key == "u") {
                        key = "text-decoration";
                        isUnderline = true;
                    } else if (key == "strike") {
                        //                  transfrom underline and strike to text-decoration.
                        key = "text-decoration";
                        isStrike = true;
                    }

                    var value = style[key] && lang.trim(style[key]);
                    if (key == "font-weight" && value >= 700) {
                        value = "bold";
                    }
                    var values = value && value.split(" ");
                    if (values && values.length > 1) {
                        if (array.some(values, function(item) {
                                if (isUnderline)
                                    return item == "underline";
                                else if (isStrike)
                                    return item == "line-through";
                                else
                                    return item === lang.trim(styleDef[key]);
                            })) {
                            return constants.CMDSTATE.TRISTATE_ON;
                        }
                    }
                    if (isUnderline)
                        return (value == "underline") ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_OFF;
                    else if (isStrike)
                        return (value == "line-through") ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_OFF;
                    else if (value != lang.trim(styleDef[key])) {
                        return constants.CMDSTATE.TRISTATE_OFF;
                    }
                }
                return constants.CMDSTATE.TRISTATE_ON;
            };

            styleCommand.prototype.exec = function(data) {
                var state = this.getState();
                if (state == constants.CMDSTATE.TRISTATE_ON || data == "autoColor")
                    this.style.applyStyle(data, true);
                else if (state == constants.CMDSTATE.TRISTATE_OFF)
                    this.style.applyStyle(data);
                var func = selectionChangeHandler;
                // to Fix 44775: Set B/I/U for an image, then the toolbar status is wrong,
                // reset style toggle buttons's state to make setState always update button state
                pe.lotusEditor.getCommand('bold').setState(undefined);
                pe.lotusEditor.getCommand('italic').setState(undefined);
                pe.lotusEditor.getCommand('underline').setState(undefined);
                pe.lotusEditor.getCommand('strike').setState(undefined);
                setTimeout(function() {
                    func();
                }, 0);
            };


            var commands = this.getStylesConfig();

            for (var i = 0; i < commands.length; i++) {
                var command = commands[i];
                this.editor.addCommand(command.name, new styleCommand(command.style, command.removeStyle), command.shortcut); /*B*/
            }
            var collectState = function(resulted, run) {
                var finished = true;
                for (var i in commands) {
                    if (resulted[i] === true) {
                        continue;
                    }
                    finished = false;
                    var command = pe.lotusEditor.getCommand(commands[i].name);
                    var nextstate = command.checkActive(run);
                    if (nextstate != constants.CMDSTATE.TRISTATE_ON) {
                        command.setState(nextstate);
                        resulted[i] = true;
                    } else {
                        //temp state
                        resulted[i] = 2;
                    }
                }
                return finished;
            };

            var selectionChangeHandler = function() {
                //          console.log("selectionchange handler is called");
                var selection = pe.lotusEditor.getSelection();
                var ranges = selection.getRanges();
                if (ranges.length == 1 && RangeTools.ifContainOnlyOneDrawingObj(ranges[0])) {
                    for (var i in commands) {
                        var command = pe.lotusEditor.getCommand(commands[i].name);
                        command.setState(constants.CMDSTATE.TRISTATE_OFF);
                    }
                    return;
                }
                var resulted = [];
                var helperTools = HelperTools;
                for (var i = 0; i < ranges.length; i++) {
                    // for style operation, need change range sometimes, for example, if selection is textBox, need reset range to its inner paragraphs to calculate style button state
                    var range = RangeTools.getStyleOperationRange(ranges[i]);
                    var maxParagraphCount = 100;
                    var iterator = new RangeIterator(range, maxParagraphCount);
                    var next;
                    var startPos = range.getStartParaPos();
                    var isCollapsed = range.isCollapsed();
                    var endPos = isCollapsed ? null : range.getEndParaPos(); // isCollapsed will ignore it.
                    while (next = iterator.nextModel()) {
                        var tools = ModelTools;
                        if (next && next.modelType === constants.MODELTYPE.PARAGRAPH) {
                            var run = next.container.getFirst();
                            while (run) {
                                if (run.isTrackDeleted()){}
                                else if (tools.isLinkOrField(run)) {
                                    var runInLink = run.container.getFirst();
                                    while (runInLink) {
                                        if (runInLink.isTrackDeleted()){}
                                        else if (helperTools.isInSelection(runInLink, isCollapsed, startPos, endPos) && true == collectState(resulted, runInLink))
                                            break;
                                        runInLink = runInLink.next();
                                    }

                                } else if (tools.isImage(run) || tools.isBookMark(run)) {
                                    if (isCollapsed) {
                                        var ret = run.paragraph.getInsertionTarget(startPos.index);
                                        if (ret && ret.follow && true == collectState(resulted, ret.follow)) {
                                            break;
                                        }
                                    }
                                } else if ((helperTools.isInSelection(run, isCollapsed, startPos, endPos)) && true == collectState(resulted, run))
                                    break;
                                run = run.next();
                            }

                        } else {
                            if (next.isTrackDeleted()){}
                            else if (tools.isLinkOrField(next)) {
                                var runInLink = next.container.getFirst();
                                while (runInLink) {
                                    if (runInLink.isTrackDeleted()){}
                                    else if (helperTools.isInSelection(runInLink, isCollapsed, startPos, endPos) && true == collectState(resulted, runInLink))
                                        break;
                                    runInLink = runInLink.next();
                                }
                            } else if (tools.isImage(next) || tools.isBookMark(next)) {
                                if (isCollapsed) {
                                    var ret = next.paragraph.getInsertionTarget(startPos.index);
                                    if (ret && ret.follow && true == collectState(resulted, ret.follow)) {
                                        break;
                                    }
                                }
                            } else if (helperTools.isInSelection(next, isCollapsed, startPos, endPos) && true == collectState(resulted, next))
                                break;
                        }

                    }
                }
                for (var i in commands) {
                    if (resulted[i] == 2) {
                        var command = pe.lotusEditor.getCommand(commands[i].name);
                        command.setState(constants.CMDSTATE.TRISTATE_ON);
                    }
                }

            };
            //register selection change event
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, selectionChangeHandler));
        }
    });

    return Styles;
});
