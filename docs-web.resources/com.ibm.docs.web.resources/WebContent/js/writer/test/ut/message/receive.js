define([
    "dojo/_base/array",
    "writer/common/tools",
    "concord/xcomments/Comments",
    "writer/controller/UpdateManager",
    "writer/model/Document",
    "writer/model/Numbering",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles",
    "writer/model/table/Row",
    "writer/msg/msgCenter",
    "writer/msg/msgHandler",
    "writer/plugins/UndoManager"
], function(array, tools, Comments, UpdateManager, Document, Numbering, Relations, Settings, Styles, Row, msgCenter, msgHandlerModule, UndoManager) {

    describe("writer.tests.UTcase.message.receive", function() {
        var loadTestData = function() {
            var jsonData = {
                "body": [{
                    "t": "p",
                    "id": "id_001",
                    "c": "hello",
                    "fmt": [{
                        "rt": "rPr",
                        "s": "0",
                        "l": "5"
                    }]
                }, {
                    "tblPr": {
                        "tblBorders": {
                            "top": {
                                "val": "single",
                                "color": "000000",
                                "sz": "1pt"
                            },
                            "left": {
                                "val": "single",
                                "color": "000000",
                                "sz": "1pt"
                            },
                            "insideV": {
                                "val": "single",
                                "color": "000000",
                                "sz": "1pt"
                            },
                            "bottom": {
                                "val": "single",
                                "color": "000000",
                                "sz": "1pt"
                            },
                            "insideH": {
                                "val": "single",
                                "color": "000000",
                                "sz": "1pt"
                            },
                            "right": {
                                "val": "single",
                                "color": "000000",
                                "sz": "1pt"
                            }
                        }
                    },
                    "tblGrid": [{
                        "t": "gridCol",
                        "w": "478.5pt"
                    }],
                    "t": "tbl",
                    "trs": [{
                        "trPr": {
                            "trHeight": "23.499999999999996pt",
                            "tblHeader": "1"
                        },
                        "t": "tr",
                        "tcs": [{
                            "tcPr": {
                                "tcW": {
                                    "w": 9570,
                                    "type": "dxa"
                                }
                            },
                            "ps": [{
                                "c": "",
                                "t": "p",
                                "id": "id_002010101",
                                "fmt": [{
                                    "style": "",
                                    "rt": "rPr",
                                    "s": "0",
                                    "l": "0"
                                }]
                            }],
                            "t": "tc",
                            "id": "id_0020101"
                        }],
                        "id": "id_00201"
                    }],
                    "id": "id_002"
                }]
            };
            tools.DPI.x = 96;
            pe.lotusEditor.relations = new Relations({});
            pe.lotusEditor.number = new Numbering({});
            pe.lotusEditor.styles = new Styles({});
            pe.lotusEditor.styles.createCSSStyle();
            pe.lotusEditor.setting = new Settings({});
            pe.lotusEditor.relations.loadContent();
            pe.lotusEditor.document = new Document(jsonData.body, pe.lotusEditor.layoutEngine);
            pe.lotusEditor.lists = [];
            pe.lotusEditor.focus = function() {};
            pe.lotusEditor.isReadOnly = function() {
                return false;
            };
            pe.lotusEditor.getSelection = function() {
                return {
                    store: function() {},
                    restore: function() {},
                    getRanges: function() {
                        return []
                    },
                    updateSelection: function() {},
                    updateHeaderFooter: function() {},
                    selectRangesBeforeUpdate: function() {},
                    restoreBeforeUpdate: function() {}
                };
            };
            pe.lotusEditor.getScrollPosition = function() {}
            var edit = {
                editor: pe.lotusEditor
            };
            pe.scene = {
                coedit: false,
                cursorDecEnabled: false,
                session: {
                    createMessage: function(isControl, asControl) {
                        var msg = new Object();
                        if (isControl) {
                            msg.isCtrl = true;
                        }
                        if (asControl) {
                            msg.asCtrl = true;
                        }
                        return msg;
                    },
                    sendMessage: function(test, test2) {
                        console.log(test);
                    },
                    isSingleMode: function() {
                        return true;
                    },
                    waitingList: [],
                    sendoutList: [],
                    commentsProxy: {
                        msgReceived: function() {}
                    }
                },
                getSession: function() {
                    return this.session;
                }
            };
            pe.lotusEditor.getRanges = function() {
                return [];
            };
            var undoManager = new UndoManager(edit);
            undoManager.init();
            pe.lotusEditor.updateManager = new UpdateManager();
            return pe.lotusEditor.document;
        };

        var testRecive = function(msg) {
            var msgHandler = msgHandlerModule;
            return msgHandler.receiveMessage(msg);
        };

        var loadTestPara = function() {
            var paraObj = pe.lotusEditor.document.byId('id_001');
            paraObj._viewers = [];
            return paraObj;
        };

        var loadTestTable = function() {
            return pe.lotusEditor.document.byId('id_002');
        }

        beforeEach(function() {
            loadTestData();
            loadTestPara();
        });

        afterEach(function() {});

        it('Insert & Delelte & Replace Key', function() {
            // insert header
            var insertMsg = {
                "mc": "r",
                "updates": [{
                    "c": {
                        "t": "hdr",
                        "content": [{
                            "pPr": {},
                            "c": "",
                            "t": "p",
                            "rPr": {},
                            "id": "id_003",
                            "fmt": []
                        }]
                    },
                    "t": "ik",
                    "path": "",
                    "k": "rId10"
                }],
                "type": "k"
            };
            spyOn(pe.lotusEditor.relations, "insertRelation").andCallThrough();
            testRecive(insertMsg);
            expect(pe.lotusEditor.relations.insertRelation)
                .toHaveBeenCalledWith(insertMsg.updates[0].k, insertMsg.updates[0].c);
            // TODO: replace header is not exactly right
            var replaceMsgs = [{
                "mc": "st",
                "updates": [{
                    "c": {
                        "cols": {
                            "space": "21.2500pt"
                        },
                        "dh": "rId10",
                        "t": "sectPr",
                        "pgMar": {
                            "top": "56.7pt",
                            "left": "56.7pt",
                            "bottom": "56.7pt",
                            "footer": "49.60",
                            "gutter": "0pt",
                            "right": "56.7pt",
                            "header": "42.55"
                        },
                        "id": "sect001", // default
                        "pgSz": {
                            "w": "595.3pt",
                            "h": "841.9pt"
                        }
                    },
                    "t": "rk",
                    "path": "sects",
                    "k": "sect001" //default
                }],
                "type": "k"
            }, {
                "mc": "r",
                "updates": [{
                    "t": "it",
                    "len": 4,
                    "cnt": {
                        "c": "test",
                        "fmt": [{
                            "style": "",
                            "rt": "rPr",
                            "s": "0",
                            "l": "4"
                        }]
                    },
                    "idx": 0,
                    "tid": "id_003"
                }],
                "type": "t",
            }];
            array.forEach(replaceMsgs, function(msg) {
                testRecive(msg);
            });

            // delete
            var deleteMsg = {
                "mc": "r",
                "updates": [{
                    "t": "dk",
                    "path": "",
                    "k": "rId10"
                }],
                "type": "k"
            };
            spyOn(pe.lotusEditor.relations, "deleteRelation").andCallThrough();
            testRecive(deleteMsg);
            expect(pe.lotusEditor.relations.deleteRelation).toHaveBeenCalledWith("rId10");
        });
        /*
            it('Add List & Change Indent & Change Start & Change Style', function() {
                var addMsgs = [{
                    "mc": "l",
                    "updates": [{
                        "imgs": {},
                        "t": "al",
                        "cnt": {
                            "lvl": [{
                                "pPr": {
                                    "indent": {
                                        "hanging": "21.0pt",
                                        "left": "21.0pt"
                                    }
                                },
                                "start": {
                                    "val": "1"
                                },
                                "t": "lvl",
                                "numFmt": {
                                    "val": "decimal"
                                },
                                "ilvl": "0",
                                "lvlText": {
                                    "val": "%1."
                                }
                            }],
                            "multiLevelType": {
                                "val": "hybridMultilevel"
                            }
                        },
                        "nid": "0",
                        "aid": "0"
                    }],
                    "type": "l",
                }, {
                    "mc": "c",
                    "updates": [{
                        "st": {
                            "numId": "0",
                            "ilvl": 0,
                            "subType": "para",
                            "type": "numPr"
                        },
                        "t": "sa",
                        "tid": "id_001"
                    }],
                    "type": "a"
                }];
	
                expect(pe.lotusEditor.lists.length).toEqual(0);
                dojo.forEach(addMsgs, function(msg) {
                    testRecive(msg);
                })
                expect(pe.lotusEditor.lists.length).toEqual(1);
                var list = pe.lotusEditor.lists[0];
                var indentMsg = {
                    "mc": "l",
                    "updates": [{
                        "t": "il",
                        "cnt": {
                            "leftChange": "21pt"
                        },
                        "nid": "id_001",
                        "tid": "id_001",
                        "id": "id_001"
                    }],
                    "type": "l",
                };
                testRecive(indentMsg);
                expect(list.absNum.getNumDefinition()[0].getParaProperty().getIndentLeft()).toEqual(42);
	
                var changeStart = {
                    "mc": "l",
                    "updates": [{
                        "lvl": 0,
                        "t": "cs",
                        "cnt": {
                            "val": 2,
                            "lvl": 0
                        },
                        "nid": "id_001",
                        "tid": "id_001",
                        "id": "id_001"
                    }],
                    "type": "l"
                };
                testRecive(changeStart);
                expect(list.absNum.getNumDefinition()[0].start).toEqual(2);
	
                var changeTypeMsg = {
                    "mc": "l",
                    "updates": [{
                        "lvl": 0,
                        "t": "ct",
                        "cnt": {
                            "lvl": 0,
                            "lvlPicBulletId": "",
                            "numFmt": "lowerLetter",
                            "lvlJc": "",
                            "lvlText": "%1)"
                        },
                        "nid": "id_001",
                        "tid": "id_001",
                        "id": "id_001"
                    }],
                    "type": "l"
                };
                testRecive(changeTypeMsg);
                expect(list.absNum.getNumDefinition()[0].numFmt).toEqual("lowerLetter");
            });*/

        it('Insert & Delte Text', function() {
            // Insert
            var msg = {
                "mc": "c",
                "updates": [{
                    "t": "it",
                    "len": 1,
                    "cnt": {
                        "c": "a",
                        "fmt": [{
                            "style": {
                                "background-color": "autoColor"
                            },
                            "rt": "rPr",
                            "s": "5",
                            "l": "1"
                        }]
                    },
                    "idx": 5,
                    "tid": "id_001"
                }],
                "type": "t"
            };
            var paraObj = window._IDCache.getById("id_001");
            spyOn(paraObj, "insertRichText");
            testRecive(msg);
            expect(paraObj.insertRichText).toHaveBeenCalled();
            // Delete
            var msg = {
                "cmdId": "backSpace",
                "mc": "c",
                "updates": [{
                    "t": "dt",
                    "len": 1,
                    "idx": 5,
                    "tid": "id_001"
                }],
                "type": "t"
            };
            spyOn(paraObj, "deleteText");
            testRecive(msg);
            expect(paraObj.deleteText).toHaveBeenCalled();
        });

        it('Insert & Delete Element', function() {
            // Insert
            var msg = {
                "cmdId": "enter",
                "mc": "c",
                "updates": [{
                    "t": "ie",
                    "cnt": {
                        "pPr": {
                            "indent": {
                                "firstLine": "21pt"
                            }
                        },
                        "c": "",
                        "rPr": {
                            "background-color": "autoColor"
                        },
                        "t": "p",
                        "id": "id_003",
                        "fmt": [{
                            "style": {
                                "background-color": "autoColor"
                            },
                            "rt": "rPr",
                            "s": "0",
                            "l": "0"
                        }]
                    },
                    "idx": 0,
                    "tid": "body"
                }],
                "type": "e"
            };
            spyOn(pe.lotusEditor.document, 'insertBefore').andCallThrough();
            testRecive(msg);
            expect(pe.lotusEditor.document.insertBefore).toHaveBeenCalled();
            // Delete
            msg = {
                "cmdId ": " undo_enter ",
                "mc": "c",
                "updates": [{
                    "t": "de",
                    "idx": 0,
                    "tid": "body"
                }],
                "type": "e"
            };
            spyOn(pe.lotusEditor.document, 'remove').andCallThrough();
            testRecive(msg);
            expect(pe.lotusEditor.document.remove).toHaveBeenCalled();
        });

        it('SetAttribute', function() {
            var table = loadTestTable();
            // change cell style
            var msg = {
                "mc": "c",
                "updates": [{
                    "st": {
                        "t": "background-color",
                        "v": "0000ff",
                        "cnt": {
                            "color": "auto",
                            "fill": "0000ff"
                        },
                        "type": "cellColor"
                    },
                    "t": "sa",
                    "tbId": "id_002",
                    "tid": "id_0020101"
                }, {
                    "at": {
                        "rowH": "42.75pt"
                    },
                    "t": "sa",
                    "tbId": "id_002",
                    "tid": "id_00201"
                }],
                "type": "tb"
            };
            var row = table.getParent().byId("id_00201");
            var cell = table.getParent().byId("id_0020101");
            spyOn(cell, "changeStyle").andCallThrough();
            testRecive(msg);
            expect(cell.changeStyle).toHaveBeenCalledWith("background-color", "0000ff");
            expect(cell.getColor()["background-color"]).toEqual("0000ff");
            expect(row.h).toEqual(57);
        });

        it('SetTextAttribute', function() {
            var msg = {
                "mc": "c",
                "updates": [{
                    "st": {
                        "u": {
                            "val": "single"
                        }
                    },
                    "t": "sta",
                    "len": 3,
                    "idx": 0,
                    "tid": "id_001"
                }],
                "type": "ta"
            };
            var target = window._IDCache.getById('id_001');
            spyOn(target, 'splitRuns').andCallThrough();
            testRecive(msg);
            expect(target.splitRuns).toHaveBeenCalledWith(0, 3);
        });

        it('Insert & Delete Section', function() {
            var para = window._IDCache.getById("id_001");
            // add section break
            var msgs = [{
                "mc": "c",
                "updates": [{
                    "st": {
                        "subType": "para",
                        "type": "secId",
                        "secId": "id_0000id_001"
                    },
                    "t": "sa",
                    "tid": "id_001"
                }],
                "type": "a",
            }, {
                "mc": "st",
                "updates": [{
                    "t": "iSec",
                    "cnt": {
                        "cols": {
                            "space": "21.2500pt"
                        },
                        "t": "sectPr",
                        "pgMar": {
                            "top": "56.7pt",
                            "left": "56.7pt",
                            "gutter": "0pt",
                            "footer": "49.60pt",
                            "bottom": "56.7pt",
                            "right": "56.7pt",
                            "header": "42.55pt"
                        },
                        "id": "id_0000id_001",
                        "pgSz": {
                            "w": "595.3pt",
                            "h": "841.9pt"
                        }
                    },
                    "idx": 0,
                    "tid": "id_0000id_001"
                }],
                "type": "sec"
            }];
            spyOn(pe.lotusEditor.setting, "insertSection").andCallThrough();
            spyOn(para, "setSectionId").andCallThrough();
            array.forEach(msgs, function(msg) {
                testRecive(msg);
            });
            expect(para.setSectionId).toHaveBeenCalledWith("id_0000id_001");
            expect(pe.lotusEditor.setting.insertSection).toHaveBeenCalled();

            // delete the section break
            msgs = [{
                "cmdId": "backSpace",
                "mc": "st",
                "updates": [{
                    "t": "deSec",
                    "tid": "id_0000id_001"
                }],
                "type": "sec"
            }, {
                "cmdId": "backSpace",
                "mc": "c",
                "updates": [{
                    "st": {
                        "subType": "para",
                        "type": "secId",
                        "secId": ""
                    },
                    "t": "sa",
                    "tid": "id_001"
                }],
                "type": "a"
            }];
            spyOn(pe.lotusEditor.setting, "deleteSection").andCallThrough();
            array.forEach(msgs, function(msg) {
                testRecive(msg);
            });
            expect(para.setSectionId).toHaveBeenCalledWith(null);
            expect(pe.lotusEditor.setting.deleteSection).toHaveBeenCalledWith("id_0000id_001");

        });

        it('Add & Reply & Delete Comment', function() {
            var insertMsgs = [{
                "mc": "r",
                "updates": [{
                    "c": {
                        "t": "comment",
                        "content": [{
                            "c": "add Comment",
                            "t": "p",
                            "attr_pre": {
                                "textId": "w14",
                                "paraId": "w14"
                            },
                            "fmt": [{
                                "style": {
                                    "t": "rPr",
                                    "styleId": "CommentReference"
                                },
                                "rt": "rPr",
                                "s": 0,
                                "t": "r",
                                "l": 0,
                                "fmt": [{
                                    "t": "annotationRef"
                                }]
                            }, {
                                "rt": "rPr",
                                "s": 0,
                                "t": "r",
                                "l": 11
                            }]
                        }],
                        "id": "4c09b191-34bb-44a7-8f45-8ca9dc273946",
                        "date": "2015-09-29T13:36:46.664Z",
                        "author": "test"
                    },
                    "t": "ia",
                    "path": "comments",
                    "k": "4c09b191-34bb-44a7-8f45-8ca9dc273946"
                }],
                "type": "k"
            }, {
                "mc": "c",
                "updates": [{
                    "t": "acmt",
                    "len": 4,
                    "idx": 0,
                    "cid": "4c09b191-34bb-44a7-8f45-8ca9dc273946",
                    "tid": "id_001"
                }],
                "type": "tm"
            }];
            spyOn(pe.scene.session.commentsProxy, "msgReceived");
            spyOn(pe.lotusEditor.relations, "insertComment").andCallThrough();
            array.forEach(insertMsgs, function(msg) {
                testRecive(msg);
            });
            expect(pe.scene.session.commentsProxy.msgReceived).toHaveBeenCalled();
            expect(pe.lotusEditor.relations.insertComment).toHaveBeenCalled();
            //reply
            var replyMsg = {
                "mc": "r",
                "updates": [{
                    "t": "ucmt",
                    "v": "1",
                    "k": "done",
                    "idx": 0,
                    "tid": "4c09b191-34bb-44a7-8f45-8ca9dc273946"
                }],
                "type": "tm"
            };
            spyOn(pe.lotusEditor.relations, "updateComment");
            testRecive(replyMsg);
            expect(pe.lotusEditor.relations.updateComment)
                .toHaveBeenCalledWith("4c09b191-34bb-44a7-8f45-8ca9dc273946", 0, "done", "1");

            //insert again
            array.forEach(insertMsgs, function(msg) {
                testRecive(msg);
            });

            //delete
            var deleteMsgs = [{
                "mc": "c",
                "updates": [{
                    "t": "dcmt",
                    "cid": "4c09b191-34bb-44a7-8f45-8ca9dc273946",
                    "tid": "id_001"
                }],
                "type": "tm"
            }, {
                "mc": "r",
                "updates": [{
                    "t": "da",
                    "path": "comments",
                    "k": "4c09b191-34bb-44a7-8f45-8ca9dc273946"
                }],
                "type": "k",
            }];
            spyOn(pe.lotusEditor.relations, "delComment").andCallThrough();
            array.forEach(deleteMsgs, function(msg) {
                testRecive(msg);
            });
            expect(pe.lotusEditor.relations.delComment).toHaveBeenCalledWith("4c09b191-34bb-44a7-8f45-8ca9dc273946");
        });

        it('Insert & Delete Row', function() {
            var table = loadTestTable();
            //insert row
            var msg = {
                "mc": "c",
                "updates": [{
                    "t": "ir",
                    "tbId": "id_002",
                    "cnt": {
                        "trPr": {
                            "trHeight": "23.499999999999996pt"
                        },
                        "t": "tr",
                        "tcs": [{
                            "tcPr": {
                                "tcW": {
                                    "w": 9570,
                                    "type": "dxa"
                                }
                            },
                            "ps": [{
                                "c": "",
                                "t": "p",
                                "id": "id_1d1d5759a10f",
                                "fmt": [{
                                    "style": "",
                                    "rt": "rPr",
                                    "s": "0",
                                    "l": "0"
                                }]
                            }],
                            "t": "tc",
                            "id": "id_1e8b07a42485"
                        }],
                        "id": "id_5674809a0a27"
                    },
                    "idx": 1,
                    "tid": "id_002"
                }],
                "type": "tb"
            };
            spyOn(table, 'insertRow').andCallThrough();
            spyOn(table, 'update');
            testRecive(msg);
            expect(table.insertRow).toHaveBeenCalled();
            // delete row
            msg = {
                "mc": "c",
                "updates": [{
                    "t": "dr",
                    "tbId": "id_002",
                    "idx": 0,
                    "fc": {},
                    "tid": "id_002"
                }],
                "type": "tb",
            };
            spyOn(table, "deleteRow").andCallThrough();
            testRecive(msg);
            expect(table.deleteRow).toHaveBeenCalled();
        });

        it('set head repeat attr', function() {
            var table = loadTestTable();
            var row = table.byId("id_00201");
            var msg = {
                "mc": "c",
                "type": "tb",
                "updates": [{
                    "at": {
                        "tblHeader": "none"
                    },
                    "t": "sa",
                    "tbId": "id_002",
                    "tid": "id_00201"
                }],
            };
            spyOn(row, "setTblHeaderRepeat").andCallThrough();
            spyOn(table, 'update');
            testRecive(msg);
            expect(row.setTblHeaderRepeat).toHaveBeenCalled();
        });

        it('Insert & Delete Column', function() {
            var table = loadTestTable();
            spyOn(pe.lotusEditor, "getSelection").andReturn({
                store: function() {},
                restore: function() {},
                getRanges: function() {
                    return [{
                        getStartModel: function() {
                            return {
                                obj: null
                            };
                        }
                    }]
                },
                selectRangesBeforeUpdate: function() {},
                restoreBeforeUpdate: function() {}
            });
            //insert column
            var msg = {
                "mc": "c",
                "updates": [{
                    "t": "ic",
                    "tbId": "id_002",
                    "cnt": [{
                        "cnt": {
                            "ps": [{
                                "pPr": "",
                                "c": "",
                                "t": "p",
                                "rPr": "",
                                "id": "id_cc16af55e7b2",
                                "fmt": []
                            }],
                            "t": "tc",
                            "id": "id_178d3304b6a2"
                        }
                    }, {
                        "cnt": {
                            "ps": [{
                                "pPr": "",
                                "c": "",
                                "t": "p",
                                "rPr": "",
                                "id": "id_a0f1908c32ac",
                                "fmt": []
                            }],
                            "t": "tc",
                            "id": "id_72a1ffc86ecf"
                        }
                    }],
                    "idx": 1,
                    "tid": "id_002"
                }],
                "type": "tb",
            };

            spyOn(table, "insertColumn").andCallThrough();
            spyOn(table, 'update');
            testRecive(msg);
            expect(table.insertColumn).toHaveBeenCalled();
            //delete column
            msg = {
                "mc": "c",
                "updates": [{
                    "t": "dc",
                    "tbId": "id_002",
                    "cnt": [{
                        "cnt": {
                            "tcPr": {
                                "tcW": {
                                    "w": 4785,
                                    "type": "dxa"
                                }
                            },
                            "ps": [{
                                "c": "",
                                "t": "p",
                                "id": "id_a0f1908c32ac",
                                "fmt": [{
                                    "style": "",
                                    "rt": "rPr",
                                    "s": "0",
                                    "l": "0"
                                }]
                            }],
                            "t": "tc",
                            "id": "id_72a1ffc86ecf"
                        }
                    }],
                    "idx": 1,
                    "fc": {},
                    "tid": "id_002"
                }],
                "type": "tb"
            };
            spyOn(table, "deleteColumn").andCallThrough();
            testRecive(msg);
            expect(table.deleteColumn).toHaveBeenCalled();
        });

        it('Split & Merge Cells', function() {
            var table = loadTestTable();
            // Split
            var msg = {
                "mc": "c",
                "updates": [{
                    "sc": 0,
                    "nr": 1,
                    "t": "tsc",
                    "nc": 1,
                    "tbId": "id_002",
                    "cnt": [],
                    "tid": "id_002",
                    "sr": 0
                }],
                "type": "tb",
            };
            spyOn(table, "splitCell");
            testRecive(msg);
            expect(table.splitCell).toHaveBeenCalledWith(0, 0, 1, 1, []);
            // Merge
            msg = {
                "mc": "c",
                "updates": [{
                    "sc": 0,
                    "nr": 1,
                    "t": "tmc",
                    "nc": 2,
                    "tbId": "id_002",
                    "tid": "id_002",
                    "sr": 0
                }],
                "type": "tb"
            };
            spyOn(table, "mergeCell");
            testRecive(msg);
            expect(table.mergeCell).toHaveBeenCalledWith(0, 0, 1, 2);
        });

        xit('SetParaTask', function() {

        });

        xit('SetTableTask', function() {

        });

        xit('Add & Remove EvenOdd', function() {

        });

        xit('Insert & Delete Element in footnotes', function() {

        });
        xit('Insert & Delete Element in endnotes', function() {

        });

    });

});
