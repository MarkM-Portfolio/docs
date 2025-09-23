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
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "writer/model/Toc",
    "writer/plugins/Plugin",
    "concord/util/BidiUtils",
    "writer/model/Paragraph",
    "writer/constants",
    "writer/msg/msgHelper",
    "writer/msg/msgCenter",
    "writer/common/tools",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "dojo/i18n!writer/nls/lang"
], function(declare, array, lang, topic, Toc, Plugin, BidiUtils, Paragraph, constants, msgHelper, msgCenter, tools, ModelTools, ViewTools, i18nlang) {

    var TocPlugin = declare("writer.plugins.Toc", Plugin, {
        /**
         * check cmd status when selection change
         */
        onSelectionChange: function() {
            var viewTools = ViewTools;
            var selection = pe.lotusEditor.getSelection();
            var range = selection.getRanges()[0];
            if (!range) {
                this.editor.getCommand('createTOC').setState(constants.CMDSTATE.TRISTATE_DISABLED);
                return;
            }

            var startView = range.getStartView();
            var startViewObj = startView && startView.obj;
            var toc = this.getSelectedToc();
            var enable = (toc == null),
                plugin;

            if (toc != selection.hightToc) {
                if (selection.hightToc)
                    selection.hightToc.highLight(false);
                if (toc)
                    toc.highLight(true);
                selection.hightToc = toc;
            }

            if (enable) {
                // check textbox
                var textbox = ViewTools.getTextBox(startViewObj);
                if (textbox)
                    enable = false;
            }
            var editMode = pe.lotusEditor.getShell().getEditMode();
            if (editMode == constants.EDITMODE.FOOTNOTE_MODE || editMode == constants.EDITMODE.ENDNOTE_MODE) {
                enable = false;
            }
            if (enable) {
                //check table
                plugin = this.editor.getPlugin("Table");
                if (plugin) {
                    var res = plugin.getStateBySel(this.editor.getSelection());
                    enable = !res.isInTable;
                }
            }
            if (enable) { //check header footer
                plugin = this.editor.getPlugin("HeaderFooter");
                if (plugin)
                    enable = !(plugin.getCurrentHeaderFooter && plugin.getCurrentHeaderFooter());
            }
            var bInFootnotes = false;
            var bInEndnotes = false;
            plugin = this.editor.getPlugin("Footnotes");
            if (plugin) {
                bInFootnotes = plugin.isInFootnotes();
            }
            plugin = this.editor.getPlugin("Endnotes");
            if (plugin) {
                bInEndnotes = plugin.isInEndnotes();
            }
            enable = enable && !bInFootnotes && !bInEndnotes;
            this.editor.getCommand('createTOC').setState(enable ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
        },
        /**
         * get selected toc
         * @returns
         */
        getSelectedToc: function(selection) {
            if (!selection)
                selection = this.editor.getSelection();
            var ranges = selection.getRanges();
            if (ranges.length == 1) {
                var range = ranges[0];
                var ancestor = range.getCommonAncestor(true);
                if (ancestor) {
                    return (ancestor.modelType == constants.MODELTYPE.TOC) ? ancestor : ModelTools.getParent(ancestor, constants.MODELTYPE.TOC);
                }
            }
            return null;
        },
        /**
         * is hint in toc
         * @param hint
         * @returns
         */
        isInToc: function(hint) {
            return ModelTools.isInToc(hint);
        },

        init: function() {
            var editor = this.editor,
                plugin = this;
            //Commands
            var deleteTOCCmd = {
                exec: function() {
                    var toc = plugin.getSelectedToc();
                    if (toc) {
                        var selection = editor.getSelection(),
                            ranges = selection.getRanges();
                        var msgs = [];
                        ModelTools.removeBlock(toc, ranges[0], msgs);

                        toc.parent.update();
                        pe.lotusEditor.updateManager.update();
                        msgCenter.sendMessage(msgs);
                    }
                }
            };

            function getTocTabLength() {
                var selection = editor.getSelection(),
                    ranges = selection.getRanges();
                var viewPos = ranges[0].getStartView();

                var pxLength = ViewTools.getBody(viewPos.obj).getWidth() - 0.5;
                return tools.toPtValue(pxLength + "px") + "pt";
            }

            function updatePageNumber(para, msgs) {
                var styleId = para.getStyleId();
                if (!styleId || styleId == "TOCHeading")
                    return;

                var filterFunc = function(m) {
                    return m.isPageRef && m.isPageRef();
                };
                var oldText = para.text;
                var delAct, insAct;
                var parent = para.parent;
                var pageNumber = ModelTools.getNext(para, filterFunc, true, para);

                if (pageNumber) {
                    delAct = msgCenter.createDeleteElementAct(para);
                    pageNumber.update(false, false);
                }
                if (para.text != oldText) { //replace toc item
                    var newJson = para.toJson(0, null, true);
                    newJson.id = msgHelper.getUUID(); // Change ID to avoid OT
                    var newPara = new Paragraph(newJson, parent, true);
                    parent.insertAfter(newPara, para);
                    parent.remove(para);
                    insAct = msgCenter.createInsertElementAct(newPara);
                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [delAct, insAct]));
                }
            }

            function updateTocNumber(toc) {
                var container = toc.container;
                var msgs = [];

                container.forEach(function(para) {
                    updatePageNumber(para, msgs);
                });
                if (msgs.length) {
                    toc.parent.update();
                    msgCenter.sendMessage(msgs);
                }
            }

            function getAnchorId(heading) { //"_Toc...."
                var start_bm = ModelTools.getChild(heading, function(model) {
                    if (model.modelType == constants.MODELTYPE.BOOKMARK && model.t == "s")
                        return true;
                });

                var bmId;
                if (!start_bm) {
                    bmId = msgHelper.getUUID();
                    start_bm = {
                        "rt": "bmk",
                        "t": "s",
                        "id": bmId,
                        "name": "_Toc" + msgHelper.getUUID()
                    };
                    ModelTools.insertInlineObject(start_bm, heading, 0, false);
                }
                // Do not create end bookmark now
                //          else 
                //              bmId = start_bm.id;
                //          
                //          var end_bm = writer.util.ModelTools.getChild( heading, function( model ){
                //              if( model.modelType == writer.constants.MODELTYPE.BOOKMARK && model.t == "e" )
                //                  return true;
                //          } );
                //          if( !end_bm )
                //          { //create book marks for heading
                //              var end_bm = {
                //                      "rt" : "bmk",
                //                      "t" : "e",
                //                      "id" : bmId
                //              };
                //              writer.util.ModelTools.insertInlineObject( end_bm, heading, heading.text.length, false );
                //          }
                return start_bm.name;
            }

            function createTOCItemJson(para, paraStyles, tocField, bfirst) {
                var styleId = para.getStyleId(),
                    itemStyleId;

                var anchorId = getAnchorId(para),
                    pageNumber = "1";

                var text = para.getVisibleText().trim();
                if (para.listSymbols)
                    text = para.listSymbols.txt + text;
                text = text.replace(/\t/gi, " ").replace(/\r/gi, "").replace(/\u0001/gi, "");
                if (!paraStyles) {
                    if (styleId == "Caption")
                        itemStyleId = "TableofFigures";
                    else {
                        var level = para.getOutlineLvl();
                        if (level != null) //heading 
                            itemStyleId = "TOC" + (level + 1);
                        else
                            return null;
                    }

                    paraStyles = {
                        "styleId": itemStyleId,
                        "tabs": [{
                            "t": "tab",
                            "val": "right",
                            "leader": "dot",
                            "pos": getTocTabLength()
                        }]
                    };
                } else {
                    // Defect 35104. Update paragraph style Id  
                    if (styleId == "Caption")
                        itemStyleId = "TableofFigures";
                    else {
                        var level = para.getOutlineLvl();
                        if (level != null) //heading 
                            itemStyleId = "TOC" + (level + 1);
                        else
                            return null;
                    }

                    paraStyles.styleId = itemStyleId;
                }

                var textlength = text.length;
                if ((para.directProperty.getDirection() == 'rtl') && (para.directProperty.getAlign() == 'right')) {
                    paraStyles.direction = pe.lotusEditor.setting.isOdtImport() ? 'rl-tb' : 'rtl';
                } else {
                    paraStyles.direction = 'ltr';
                }
                var obj = {
                    "t": "p",
                    "id": msgHelper.getUUID(),
                    "rPr": {
                        "rFonts": {
                            "eastAsiaTheme": "majorEastAsia",
                            "asciiTheme": "minorHAnsi",
                            "cstheme": "minorBidi",
                            "hAnsiTheme": "minorHAnsi"
                        },
                        "preserve": {}
                    },
                    "pPr": paraStyles,
                    "c": text + "\t" + pageNumber,
                    "fmt": [],
                    "s": 0
                };
                obj.l = obj.c.length;


                //add hyper link
                //link contains heading text + 
                var textFmt = {
                        "style": {
                            "styleId": "Hyperlink",
                            "preserve": {}
                        },
                        "rt": "rPr",
                        "s": '0',
                        "l": '' + textlength
                    },
                    tabFmt = {
                        "style": {
                            "preserve": {
                                "webHidden": "1"
                            }
                        },
                        "tab": {
                            "t": "tab"
                        },
                        "rt": "rPr",
                        "s": '' + textlength,
                        "l": '1'
                    },
                    pageFieldFmt = {
                        "rt": "fld",
                        "s": textlength + 1,
                        "l": 1,
                        "fld": ModelTools.createFieldInstrTextJson(" PAGEREF " + anchorId + " \\h ", textlength + 1, 1),
                        "id": msgHelper.getUUID(),
                        "fmt": [{
                            "style": {
                                "preserve": {
                                    "webHidden": "1"
                                }
                            },
                            "rt": "rPr",
                            "s": "" + (textlength + 1),
                            "l": '1'
                        }]
                    },
                    linkfmt = {
                        "rt": "hyperlink",
                        "history": "1",
                        "anchor": anchorId,
                        "id": msgHelper.getUUID(),
                        "s": '0',
                        "l": '' + (textlength + 2),
                        "fmt": [textFmt, tabFmt, pageFieldFmt]
                    };

                if (bfirst || tocField) {
                    if (!tocField || !tocField.fld) {
                        var string = " TOC \\o \"1-5\" \\h \\z \\u ";
                        tocField = [{
                            "fldType": "begin",
                            "l": "0",
                            "rt": "fld",
                            "s": "0",
                            "t": "r"
                        }, {
                            "fldType": "instrText",
                            "instrText": {
                                "attr_pre": {
                                    "space": "xml"
                                },
                                "space": "preserve",
                                "t": string
                            },
                            "l": "0",
                            "rt": "fld",
                            "s": "0",
                            "t": "r"
                        }, {
                            "fldType": "separate",
                            "l": "0",
                            "rt": "fld",
                            "s": "0",
                            "t": "r"
                        }];
                    } else
                        tocField = tocField.fld;

                    var fieldfmt = {
                        "fld": tocField,
                        "fmt": [],
                        "l": "" + (textlength + 2),
                        "rt": "fld",
                        "s": "0",
                        "t": "r"
                    };
                    fieldfmt.fmt.push(linkfmt);
                    obj.fmt.push(fieldfmt);
                } else {
                    obj.fmt.push(linkfmt);
                }

                return obj;
            }

            function createEmptyTocJson() {
                return {
                    "t": "p",
                    "id": msgHelper.getUUID(),
                    "rsidR": "00794EB5",
                    "rsidRDefault": "00794EB5",
                    "fmt": [{
                        "t": "fldSimple",
                        "id": msgHelper.getUUID(),
                        "instr": " TOC \\o \"1-5\" \\h \\z \\u ",
                        "fmt": [{
                            "t": "r",
                            "rt": "rPr"
                        }]
                    }]
                };
            }

            function createEndTocFieldJson() {
                return {
                    "c": "",
                    "fmt": [{
                        "fld": [{
                            "fldType": "end",
                            "l": "0",
                            "rt": "fld",
                            "s": "0",
                            "style": {
                                "font-weight": "bold",
                                "preserve": {
                                    "bCs": "1",
                                    "noProof": {}
                                },
                                "t": "rPr"
                            },
                            "t": "r"
                        }],
                        "fmt": [],
                        "l": "0",
                        "rt": "fld",
                        "t": "r"
                    }],
                    "id": msgHelper.getUUID(),
                    "rsidR": "00E30472",
                    "rsidRDefault": "00E30472",
                    "t": "p"
                };
            };

            function createContentsJson(headings) {
                var nls = i18nlang;
                var tocHeadingText = nls.toc.title;
                var contents = [{
                    "t": "p",
                    "id": msgHelper.getUUID(),
                    "pPr": {
                        "styleId": "TOCHeading",
                        "numPr": {
                            "numId": {
                                "val": -1
                            },
                            "ilvl": {
                                "val": 0
                            }
                        },
                        "outlineLvl": {
                            "val": -1
                        }
                    },
                    "c": tocHeadingText,
                    "fmt": [{
                        "rt": "rPr",
                        "s": "0",
                        "l": "" + tocHeadingText.length
                    }]
                }];
                if (headings.length == 0) {
                    contents.push(createEmptyTocJson());
                } else {
                    var i = 0;
                    if ((headings[0].directProperty.getDirection() == 'rtl') && (headings[0].directProperty.getAlign() == 'right')) {
                        contents[0].pPr.direction = pe.lotusEditor.setting.isOdtImport() ? 'rl-tb' : 'rtl';
                        contents[0].pPr.align = pe.lotusEditor.setting.isOdtImport() ? 'right' : 'left';
                    } else {
                        contents[0].pPr.direction = 'ltr';
                    }
                    array.forEach(headings, function(item) {
                        var obj = createTOCItemJson(item, null, null, i == 0);
                        obj && contents.push(obj) && i++;
                    });
                    //append an empty paragraph which has an end field
                    contents.push(createEndTocFieldJson());
                }

                return contents;
            }

            function createTocStyles() {
                var tocHeading = {
                    "type": "paragraph",
                    "name": "TOC Heading",
                    "basedOn": "Heading1",
                    "next": "Normal",
                    "uiPriority": "39",
                    "semiHidden": "1",
                    "unhideWhenUsed": "1",
                    "qFormat": "1",
                    "pPr": {
                        "outlineLvl": {
                            "val": "9"
                        }
                    },
                    "rPr": {
                        "preserve": {
                            "lang": {
                                "bidi": "en-US"
                            }
                        }
                    }
                };
                var toc1Style = {
                    "type": "paragraph",
                    "name": "toc 1",
                    "basedOn": "Normal",
                    "next": "Normal",
                    "autoRedefine": "1",
                    "uiPriority": "39",
                    "unhideWhenUsed": "1",
                    "qFormat": "1",
                    "pPr": {
                        "space": {
                            "after": "5.0pt"
                        }
                    },
                    "rPr": {
                        "rFonts": {
                            "ascii": "Calibri",
                            "eastAsia": "宋体",
                            "hAnsi": "Calibri",
                            "cs": "Times New Roman"
                        }
                    }
                };
                var toc2Style = {
                    "type": "paragraph",
                    "name": "toc 2",
                    "basedOn": "Normal",
                    "next": "Normal",
                    "autoRedefine": "1",
                    "uiPriority": "39",
                    "unhideWhenUsed": "1",
                    "qFormat": "1",
                    "pPr": {
                        "space": {
                            "after": "5.0pt"
                        },
                        "indent": {
                            "left": "11.0pt"
                        }
                    },
                    "rPr": {
                        "rFonts": {
                            "ascii": "Calibri",
                            "eastAsia": "宋体",
                            "hAnsi": "Calibri",
                            "cs": "Times New Roman"
                        }
                    }
                };
                var toc3Style = {
                    "type": "paragraph",
                    "name": "toc 3",
                    "basedOn": "Normal",
                    "next": "Normal",
                    "autoRedefine": "1",
                    "uiPriority": "39",
                    "unhideWhenUsed": "1",
                    "qFormat": "1",
                    "pPr": {
                        "space": {
                            "after": "5.0pt"
                        },
                        "indent": {
                            "left": "22.0pt"
                        }
                    },
                    "rPr": {
                        "rFonts": {
                            "ascii": "Calibri",
                            "eastAsia": "宋体",
                            "hAnsi": "Calibri",
                            "cs": "Times New Roman"
                        }
                    }
                };
                var toc4Style = {
                    "type": "paragraph",
                    "name": "toc 4",
                    "basedOn": "Normal",
                    "next": "Normal",
                    "autoRedefine": "1",
                    "uiPriority": "39",
                    "unhideWhenUsed": "1",
                    "qFormat": "1",
                    "pPr": {
                        "space": {
                            "after": "5.0pt"
                        },
                        "indent": {
                            "left": "33.0pt"
                        }
                    },
                    "rPr": {
                        "rFonts": {
                            "ascii": "Calibri",
                            "eastAsia": "宋体",
                            "hAnsi": "Calibri",
                            "cs": "Times New Roman"
                        }
                    }
                };
                var toc5Style = {
                    "type": "paragraph",
                    "name": "toc 5",
                    "basedOn": "Normal",
                    "next": "Normal",
                    "autoRedefine": "1",
                    "uiPriority": "39",
                    "unhideWhenUsed": "1",
                    "qFormat": "1",
                    "pPr": {
                        "space": {
                            "after": "5.0pt"
                        },
                        "indent": {
                            "left": "44.0pt"
                        }
                    },
                    "rPr": {
                        "rFonts": {
                            "ascii": "Calibri",
                            "eastAsia": "宋体",
                            "hAnsi": "Calibri",
                            "cs": "Times New Roman"
                        }
                    }
                };
                var styles = [{
                    "name": "Normal",
                    "json": null // Use default Normal JSON data. 
                }, {
                    "name": "Heading1",
                    "json": null // Use default Heading JSON data. 
                }, {
                    "name": "Hyperlink",
                    "json": null
                }, {
                    "name": "TOCHeading",
                    "json": tocHeading
                }, {
                    "name": "TOC1",
                    "json": toc1Style
                }, {
                    "name": "TOC2",
                    "json": toc2Style
                }, {
                    "name": "TOC3",
                    "json": toc3Style
                }, {
                    "name": "TOC4",
                    "json": toc4Style
                }, {
                    "name": "TOC5",
                    "json": toc5Style
                }, {
                    "name": "TOC6",
                    "json": toc5Style
                }];
                var msgs = [],
                    msg;
                for (var i = 0; i < styles.length; i++) {
                    msg = editor.createStyle(styles[i].name, styles[i].json);
                    msg && msgs.push(msg);
                }

                msgCenter.sendMessage(msgs);
            }
            /**
             * create table of content
             */
            function createToc() {
                var msgs = [];
                //split para first
                var nextPara = editor.getShell().split();

                //Create TOC styles
                createTocStyles();
                var contents = createContentsJson(ModelTools.getOutlineParagraphs());
                var id = msgHelper.getUUID();
                var tocJson = {
                    "t": "sdt",
                    "id": id,
                    "sdtPr": {
                        "rPr": {
                            "space": {
                                "val": "0.0pt"
                            },
                            "text-transform": {
                                "val": "0"
                            },
                            "preserve": {
                                "szCs": "11.0pt",
                                "lang": {
                                    "bidi": "ar-SA"
                                }
                            },
                            "font-size": "11.0pt"
                        },
                        "docPartObj": {
                            "docPartGallery": {
                                "val": "Table of Contents"
                            },
                            "docPartUnique": {}
                        }
                    },
                    "sdtContent": contents,
                    "sdtEndPr": {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "bold"
                            }
                        }
                    }
                };

                msgs = []
                var toc = new Toc(tocJson, editor.document);
                nextPara.parent.insertBefore(toc, nextPara);
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(toc)]));

                var selection = pe.lotusEditor.getSelection();
                var range = selection.getRanges()[0];
                range.moveToEditStart(nextPara);
                selection.selectRanges([range]);

                nextPara.parent.update(true);
                msgCenter.sendMessage(msgs);
                updateTocNumber(toc);
            };

            var createTOCCmd = {
                exec: function() {
                    console.log("createTOCCmd");
                    msgCenter.beginRecord();
                    try {
                        createToc();
                    } catch (e) {
                        console.error("error in createTOCCmd !!!");
                        console.error(e.message);
                    }
                    msgCenter.endRecord();
                }
            };

            var updatePageNumberCmd = {
                exec: function() {
                    var toc = plugin.getSelectedToc();
                    if (toc) {
                        updateTocNumber(toc);
                    }
                }
            };

            function getLinkAnchor(para) {
                var link = ModelTools.getNext(para, constants.MODELTYPE.LINK, true, para);
                if (link)
                    return link.anchor;
                else {
                    var anchor;
                    var pageField = ModelTools.getNext(para, function(m) {
                        if (m.modelType == constants.MODELTYPE.FIELD) {
                            var instr = m.getInstrText();
                            var ret = instr && instr.t && instr.t.match(/\s*PAGEREF\s+(\w+)\s+/i);
                            anchor = ret && ret[1];
                            return !!anchor;
                        }
                    }, true, para);
                    return anchor;
                }
            }

            function createNewTabs(para, tabs) {
                tabs = tabs || para.getDirectProperty().toJson().tabs;
                if (!tabs) {
                    var styleId = para.getStyleId();
                    var refStyle = editor.getRefStyle(styleId);
                    if (refStyle) {
                        tabs = refStyle.getParagraphProperty().toJson().tabs;
                    }
                }
                var ret = tabs;
                if (tabs && tabs.length) {
                    var tablist = para.text.match(/\t/gi);
                    var index = tablist && (tablist.length - 1);
                    if (index != null && index >= 0) {
                        var tab = tabs[index];
                        if (tab) {
                            tab.pos = getTocTabLength();
                            tab.val = "right";
                        } else {
                            tab = {
                                "t": "tab",
                                "val": "right",
                                "leader": "dot",
                                "pos": getTocTabLength()
                            }
                        }
                        ret = [tab];
                    }
                }
                return ret;
            };

            function updateReferencePara(para, msgs, bfirst, heading, oldTocSetting) {
                var anchor = getLinkAnchor(para);
                var parent = para.parent;
                if (anchor) {
                    var doc = window.layoutEngine.rootModel,
                        bm;

                    function filterfunc(model) {
                        return (model.modelType == constants.MODELTYPE.BOOKMARK && model.name == anchor);
                    }
                    if (heading) {
                        bm = ModelTools.getNext(heading, filterfunc, true, heading);
                    } else {
                        bm = ModelTools.getNext(doc, filterfunc, true);
                    }

                    if (bm) { //update
                        function filterFunc(m) {
                            if (m.modelType == constants.MODELTYPE.FIELD) {
                                var instrText = m.getInstrText();
                                if (instrText && instrText.t && instrText.t.indexOf("TOC") && instrText.t.match(/"(\d+)-(\d+)"/))
                                    return true;
                            }
                        }
                        var tocField = ModelTools.getNext(para, filterFunc, true, para);
                        if (tocField)
                            tocField = tocField.toJson();
                        var pDR = para.directProperty.toJson();
                        pDR.tabs = createNewTabs(para, pDR.tabs) || oldTocSetting.tabs;

                        var newjson = createTOCItemJson(bm.parent, pDR, tocField, bfirst);
                        if (newjson) {
                            var delAct = msgCenter.createDeleteElementAct(para);
                            var newPara = new Paragraph(newjson, parent, true);
                            parent.insertAfter(newPara, para);
                            parent.remove(para);
                            var insAct = msgCenter.createInsertElementAct(newPara);
                            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [delAct, insAct]));
                            return newPara;
                        }
                    }
                }
                //remove invalid toc item
                var act = msgCenter.createDeleteElementAct(para);
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [act]));
                parent.remove(para);
                return null;
            }

            function hasAnchorBmk(para, anchor) {
                return ModelTools.getNext(para, function(model) {
                    if (model.modelType == constants.MODELTYPE.BOOKMARK && model.name == anchor)
                        return true;
                }, true, para) != null;

            }
            /**
             * get toc template 
             * {
             *   'maxLevel': ...
             *   'tabs': ...
             * }
             * @param toc
             */
            function getTocSetting(toc) {
                var ret = {};
                ret["maxLevel"] = toc.getMaxLevel();
                ret["minLevel"] = toc.getMinLevel();
                var container = toc.container;
                container.forEach(function(para) {
                    var styleId = para.getStyleId();
                    if (styleId && styleId.match(/TOC[1-6]/) && !ret["tabs"]) {
                        ret["tabs"] = createNewTabs(para);
                        return false;
                    }
                });
                return ret;
            }

            function updateTOC() { //....
                var toc = plugin.getSelectedToc();
                if (toc) {
                    var selection = pe.lotusEditor.getSelection();
                    if (selection.hightToc) //remove hight light
                        delete selection.hightToc;

                    var oldTocSetting = getTocSetting(toc);
                    var headings = ModelTools.getOutlineParagraphs(oldTocSetting["maxLevel"]);

                    createTocStyles();

                    var container = toc.container;
                    var msgs = [],
                        lastItem;
                    //remove paras 
                    var lastPara, deletedParas = [];
                    var endField, tocField = toc.getTocField(),
                        endFieldPara;
                    container.forEach(function(para) {
                        //remove para
                        if (para.getStyleId() != "TOCHeading") {
                            var field = ModelTools.getChild(para, constants.MODELTYPE.FIELD);
                            if (field && field.isTOCEnd()) {
                                endField = field;
                                endFieldPara = para;
                            } else {
                                //do not remove paragraph contains end field
                                //for conversion export
                                deletedParas.push(para);
                            }
                        } else
                            lastPara = para;
                    });
                    //for migration code
                    var next_para = toc.next();
                    if (next_para && ModelTools.getChild(next_para, constants.MODELTYPE.FIELD)) {
                        //remove next end field 
                        var act = msgCenter.createDeleteElementAct(next_para);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [act]));
                        next_para.parent.remove(next_para);
                    }

                    for (var i = 0; i < deletedParas.length; i++) {
                        var act = msgCenter.createDeleteElementAct(deletedParas[i]);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [act]));
                        toc.remove(deletedParas[i]);
                    }


                    for (var i = 0; i < headings.length; i++) { //update headings 
                        var tocItemJson = createTOCItemJson(headings[i], null, (i == 0) ? tocField : null, i == 0);
                        if (oldTocSetting.tabs)
                            tocItemJson.pPr.tabs = oldTocSetting.tabs;

                        var newPara = new Paragraph(tocItemJson, toc, true);

                        if (lastPara)
                            toc.insertAfter(newPara, lastPara);
                        else
                            toc.insertBefore(newPara, toc.getByIndex(0));

                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                        lastPara = newPara;
                    }

                    var newPara = null;
                    if (headings.length == 0) {
                        // then create an empty paragraph which contains a simple toc field.
                        if (endFieldPara) {
                            var act = msgCenter.createDeleteElementAct(endFieldPara);
                            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [act]));
                            toc.remove(endFieldPara);
                        }
                        newPara = new Paragraph(createEmptyTocJson(), toc, true);
                    } else if (!endField) {
                        // create empty paragraph which contains an end toc field.
                        newPara = new Paragraph(createEndTocFieldJson(), toc, true);
                    }
                    if (newPara) {
                        //append empty para
                        toc.insertAfter(newPara, lastPara);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                    }

                    if (msgs.length) {
                        var range = selection.getRanges()[0];
                        range.moveToEditStart(toc);
                        selection.selectRangesBeforeUpdate([range]);

                        msgCenter.sendMessage(msgs);
                        toc.parent.update();
                    }

                    try {
                        updateTocNumber(toc);
                    } catch (e) {
                        console.log(e.message);
                    }
                    //
                }
            }

            var updateTOCCmd = {
                exec: function() {
                    msgCenter.beginRecord();
                    try {
                        updateTOC();
                    } catch (e) {
                        console.error("updateTOCCmd error: " + e.message);
                    }

                    msgCenter.endRecord();
                }
            };

            editor.addCommand('createTOC', createTOCCmd);
            editor.addCommand('deleteTOC', deleteTOCCmd);
            editor.addCommand('updatePageNumber', updatePageNumberCmd);
            editor.addCommand('updateTOC', updateTOCCmd);
            //Context menu
            var nls = i18nlang;
            var cmds = {
                updateToc: {
                    label: nls.toc.update,
                    commandID: 'updateTOC',
                    group: 'tableofcontents',
                    order: 'updateTOC',
                    name: 'updateToc'
                },

                deleteToc: {
                    label: nls.toc.del,
                    commandID: 'deleteTOC',
                    group: 'tableofcontents',
                    order: 'deleteTOC',
                    name: 'deleteToc'
                },
                pageNumber: {
                    label: nls.toc.pageNumber,
                    commandID: 'updatePageNumber',
                    group: 'update',
                    order: 'updatePageNumber',
                    name: 'pageNumber'
                },
                entireTable: {
                    label: nls.toc.entireTable,
                    commandID: 'updateTOC',
                    group: 'update',
                    order: 'updateEntireTOC',
                    name: 'entireTable'
                }
            };

            var ctx = this.editor.ContextMenu;
            if (ctx && ctx.addMenuItem) {
                for (var k in cmds)
                    ctx.addMenuItem(cmds[k].name, cmds[k]);
            }
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var toc = plugin.getSelectedToc();
                if (toc)
                    if (toc.getTocField()) {
                        return {
                            updateToc: {
                                getSubItems: function() {
                                    return {
                                        pageNumber: false,
                                        entireTable: false
                                    };
                                }
                            },
                            deleteToc: false
                        };
                    } else {
                        return {
                            deleteToc: false
                        };
                    } else
                    return {};
            });
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));

            //Table of Figures
            topic.subscribe(constants.EVENT.UPDATE_REFERENCE, lang.hitch(this, function(type) {
                if (type == "TableofFigures") {

                    var doc = window.layoutEngine.rootModel;
                    var paras = [],
                        msgs = [];

                    function isTableOfFigure(model) {
                        if (model.modelType == constants.MODELTYPE.PARAGRAPH && model.getStyleId() == type)
                            return true;
                    }
                    var para = ModelTools.getNext(doc, isTableOfFigure, true);

                    while (para) {
                        paras.push(para);
                        para = ModelTools.getNext(para, isTableOfFigure, false);
                    };
                    var newPara, newParas = [];
                    for (var i = 0; i < paras.length; i++) { // update one paragraph
                        newPara = updateReferencePara(paras[i], msgs);
                        newPara && newParas.push(newPara);
                    }
                    doc.update();
                    //update number
                    for (var i = 0; i < newParas.length; i++) { // update one paragraph
                        updatePageNumber(newParas[i], msgs);
                    }
                    doc.update();
                    msgCenter.sendMessage(msgs);
                }
            }));
        }
    });
    return TocPlugin;
});
