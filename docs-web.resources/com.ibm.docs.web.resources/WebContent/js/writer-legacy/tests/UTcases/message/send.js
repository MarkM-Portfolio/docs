dojo.provide("writer.tests.UTcases.message.send");
dojo.require("concord.net.Session");
dojo.require("writer.controller.UpdateManager");
dojo.require("writer.plugins.UndoManager");

describe("writer.tests.UTcases.message.send", function() {
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
                        "trHeight": "23.50",
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
        common.tools.DPI.x = 96;
        pe.lotusEditor.relations = new writer.model.Relations({});
        pe.lotusEditor.number = new writer.model.Numbering({});
        pe.lotusEditor.styles = new writer.model.style.Styles({});
        pe.lotusEditor.styles.createCSSStyle();
        pe.lotusEditor.setting = new writer.model.Settings({});
        pe.lotusEditor.relations.loadContent();
        pe.lotusEditor.document = new writer.model.Document(jsonData.body, pe.lotusEditor.layoutEngine);
        pe.lotusEditor.isFootnoteEditing = function() {
            return false;
        };
        pe.lotusEditor.isEndnoteEditing = function() {
            return false;
        };
        var edit = {
            editor: pe.lotusEditor
        };
        var undoManager = new writer.plugins.UndoManager(edit);
        undoManager.init();
        pe.lotusEditor.updateManager = new writer.controller.UpdateManager();
        pe.lotusEditor.getSelection = function() {
            return {
                store: function() {},
                restore: function() {},
                getRanges: function() {
                    return [];
                },
                selectRangesBeforeUpdate: function() {},
                restoreBeforeUpdate: function() {}
            };
        };
        pe.scene = {
            coedit: false,
            cursorDecEnabled: false,
            session: {
                createMessage: concord.net.Session.prototype.createMessage,
                sendMessage: function(test, test2) {
                    console.log(test);
                },
                isSingleMode: function() {
                    return true;
                },
                waitingList: [],
                updateHeaderFooter: function() {}
            }
        };

        return pe.lotusEditor.document;
    };

    var loadTestPara = function() {
        return pe.lotusEditor.document.byId('id_001');
    };

    var loadTestTable = function() {
        return pe.lotusEditor.document.byId('id_002');
    }

    beforeEach(function() {
        loadTestData();
        spyOn(pe.scene.session, "sendMessage").andCallFake(function(msgList) {
            console.log("@test@->", msgList);
        });
    });

    afterEach(function() {

    });

    it('Send log message', function() {
        var logData = "this is a log";
        var msg = WRITER.MSG.sendLogMessage(logData);
        expect(msg).toEqual({
            client_log: "this is a log",
            type: "client_log",
            data: ""
        });
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msg);
    });

    it('Send msg with notes', function() {
        var para = loadTestPara();
        WRITER.MSG.sendNotesMessage(
            WRITER.MSG.createMsg(
                WRITER.MSGTYPE.Text, [WRITER.MSG.createInsertTextAct(1, 2, para)],
                WRITER.MSGCATEGORY.Endnotes)
        );
        var actPair = WRITER.MSG.createInsertTextAct(2, 3, para);
        var msgs = [WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair])];
        WRITER.MSG.sendMessage(msgs);
        var msgList = [{
            "type": "t",
            "mc": "c",
            "updates": [{
                "tid": "id_001",
                "idx": 2,
                "len": 3,
                "t": "it",
                "cnt": {
                    "fmt": [{
                        "rt": "rPr",
                        "s": "2",
                        "l": "3"
                    }],
                    "c": "llo"
                }
            }]
        }, {
            "type": "t",
            "mc": "en",
            "updates": [{
                "tid": "id_001",
                "idx": 1,
                "len": 2,
                "t": "it",
                "cnt": {
                    "fmt": [{
                        "rt": "rPr",
                        "s": "1",
                        "l": "2"
                    }],
                    "c": "el"
                }
            }]
        }];
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msgList);
    });
    it("Send insert text message", function() {
        var para = loadTestPara();
        var actPair = WRITER.MSG.createInsertTextAct(1, 2, para);
        var msgs = [WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair])];
        WRITER.MSG.sendMessage(msgs);
        var msgList = [{
            'type': 't',
            'mc': 'c',
            'updates': [{
                'tid': 'id_001',
                'idx': 1,
                'len': 2,
                't': 'it',
                'cnt': {
                    'fmt': [{
                        'rt': 'rPr',
                        's': '1',
                        'l': '2'
                    }],
                    'c': 'el'
                }
            }]
        }];
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msgList);
    });

    it('Send delete text message', function() {
        var para = loadTestPara();
        var actPair = WRITER.MSG.createDeleteTextAct(2, 3, para);
        var msgs = [WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair])];
        WRITER.MSG.sendMessage(msgs);
        var msgList = [{
            'type': 't',
            'mc': 'c',
            'updates': [{
                'tid': 'id_001',
                'idx': 2,
                'len': 3,
                't': 'dt'
            }]
        }];
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msgList);
    });

    it('Send page count message', function() {
        var msg = WRITER.MSG.createPageCountMsg(2);
        pe.scene.session.sendMessage(msg)
        expect(msg).toEqual({
            "mc": "mt",
            "type": "mt",
            "updates": [{
                "t": "pc",
                "pc": 2
            }]
        });
    });

    it('Send insert & delete section message', function() {
        var defaultSect = {
            "id": "sect001",
            "pgSz": {
                "w": "8in",
                "h": "11in"
            },
            "pgMar": {
                "left": "1.25in",
                "right": "1.25in",
                "top": "1in",
                "bottom": "1in",
                "header": "0.5in"
            },
            "cols": {
                "space": "0.5in",
                "num": 1
            }
        };
        var sect = new writer.model.Section(defaultSect);
        var idx = 0;
        var msgs = [
            WRITER.MSG.createMsg(WRITER.MSGTYPE.Section, [WRITER.MSG.createInsertSectionAct(sect, idx)], WRITER.MSGCATEGORY.Setting),
            WRITER.MSG.createMsg(WRITER.MSGTYPE.Section, [WRITER.MSG.createDeleteSectionAct(sect, idx)], WRITER.MSGCATEGORY.Setting)
        ];
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([{
            "type": "sec",
            "mc": "st",
            "updates": [{
                "tid": "sect001",
                "cnt": {
                    "t": "sectPr",
                    "id": "sect001",
                    "cols": {
                        "space": "0.5in",
                        "num": 1
                    },
                    "pgMar": {
                        "left": "90pt",
                        "right": "90pt",
                        "top": "72pt",
                        "bottom": "72pt",
                        "header": "36pt",
                        "footer": "0pt"
                    },
                    "pgSz": {
                        "w": "576pt",
                        "h": "792pt"
                    }
                },
                "t": "iSec",
                "idx": 0
            }]
        }, {
            "type": "sec",
            "mc": "st",
            "updates": [{
                "tid": "sect001",
                "t": "deSec"
            }]
        }]);
    });

    it('Send insert & delete element message', function() {
        var para = loadTestPara();
        var msgs = [
            WRITER.MSG.createMsg(WRITER.MSGTYPE.Element, [WRITER.MSG.createInsertElementAct(para)]),
            WRITER.MSG.createMsg(WRITER.MSGTYPE.Element, [WRITER.MSG.createDeleteElementAct(para, 0)])
        ];
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([{
            "type": "e",
            "mc": "c",
            "updates": [{
                "tid": "body",
                "idx": 0,
                "cnt": {
                    "fmt": [{
                        "rt": "rPr",
                        "s": "0",
                        "l": "5"
                    }],
                    "c": "hello",
                    "t": "p",
                    "id": "id_001"
                },
                "t": "ie"
            }]
        }, {
            "type": "e",
            "mc": "c",
            "updates": [{
                "t": "de",
                "idx": 0,
                "tid": "body"
            }]
        }]);
    });

    it('Send add & update & delete comment message', function() {
        var json_comment = {
            "t": "comment",
            "id": "comment_001",
            "index": 0,
            "date": "2015-09-30T10:54:16.510Z",
            "done": "0",
            "author": "test",
            "uid": "TEST_UID",
            "content": [{
                "attr_pre": {
                    "paraId": "w14",
                    "textId": "w14"
                },
                "c": "test",
                "fmt": [{
                    "fmt": [{
                        "t": "annotationRef"
                    }],
                    "l": 0,
                    "rt": "rPr",
                    "s": 0,
                    "style": {
                        "styleId": "CommentReference",
                        "t": "rPr"
                    },
                    "t": "r"
                }, {
                    "s": 0,
                    "rt": "rPr",
                    "t": "r",
                    "l": 4
                }],
                "t": "p"
            }]
        };
        var msgs = [
            WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [WRITER.MSG.createInsertArrayAct("comment_001", json_comment, "comments")], WRITER.MSGCATEGORY.Relation),
            WRITER.MSG.createMsg(WRITER.MSGTYPE.TextComment, [WRITER.MSG.addCommentAct("id_001", "comment_001", 0, 3, null, null)], WRITER.MSGCATEGORY.Content),
            WRITER.MSG.createMsg(WRITER.MSGTYPE.TextComment, [WRITER.MSG.createUpdateCommentAct("comment_001", 0, {
                name: "done",
                oldval: "0",
                val: "1"
            }), WRITER.MSGCATEGORY.Relation]),
            WRITER.MSG.createMsg(WRITER.MSGTYPE.TextComment, [WRITER.MSG.delCommentAct("id_001", "comment_001", 0, 3)], WRITER.MSGCATEGORY.Content),
            WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [WRITER.MSG.createDeleteArrayAct("comment_001", json_comment, "comments")], WRITER.MSGCATEGORY.Relation)
        ];
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(
            [{
                "type": "k",
                "mc": "r",
                "updates": [{
                    "t": "ia",
                    "k": "comment_001",
                    "c": json_comment,
                    "path": "comments"
                }]
            }, {
                "type": "tm",
                "mc": "c",
                "updates": [{
                    "tid": "id_001",
                    "cid": "comment_001",
                    "t": "acmt",
                    "idx": 0,
                    "len": 3
                }]
            }, {
                "type": "tm",
                "mc": "c",
                "updates": [{
                    "tid": "comment_001",
                    "k": "done",
                    "v": "1",
                    "idx": 0,
                    "t": "ucmt"
                }]
            }, {
                "type": "tm",
                "mc": "c",
                "updates": [{
                    "tid": "id_001",
                    "cid": "comment_001",
                    "t": "dcmt"
                }]
            }, {
                "type": "k",
                "mc": "r",
                "updates": [{
                    "t": "da",
                    "k": "comment_001",
                    "path": "comments"
                }]
            }]
        );
    });

    it('Send insert & delete row message', function() {
        var table = loadTestTable();
        var newRowJson = {
            "id": "id_00202",
            "tcs": [{
                "t": "tc",
                "ps": [{
                    "fmt": [],
                    "t": "p",
                    "id": "id_0020101",
                    "c": ""
                }],
                "id": "id_0020201"
            }]
        };
        var newRow = new writer.model.table.Row(newRowJson, table);
        table.insertRow(newRow, table.byId("id_00201"));
        var msgs = [WRITER.MSG.createTableMsg(table.id, [WRITER.MSG.createInsertRowAct(newRow)])];

        var act = WRITER.MSG.createDeleteRowAct(newRow, {});
        table.deleteRow(newRow, {});
        msgs.push(WRITER.MSG.createTableMsg(table.id, [act]));
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([{
            "type": "tb",
            "mc": "c",
            "updates": [{
                "tid": "id_002",
                "cnt": {
                    "tcs": [{
                        "t": "tc",
                        "id": "id_0020201",
                        "tcPr": {
                            "tcW": {
                                "w": 9570,
                                "type": "dxa"
                            }
                        },
                        "ps": [{
                            "fmt": [{
                                "rt": "rPr",
                                "s": "0",
                                "l": "0"
                            }],
                            "c": "",
                            "t": "p",
                            "id": "id_0020101"
                        }]
                    }],
                    "t": "tr",
                    "id": "id_00202"
                },
                "t": "ir",
                "idx": 1,
                "tbId": "id_002"
            }]
        }, {
            "type": "tb",
            "mc": "c",
            "updates": [{
                "t": "dr",
                "fc": {},
                "idx": 1,
                "tid": "id_002",
                "tbId": "id_002"
            }]
        }]);
    });

    it('Send row head repeat message', function() {
        var table = loadTestTable();
        var row = table.byId("id_00201");

        var msg = [],acts = [];
        var oldObj,newObj;
        if(row.isTblHeaderRepeat() == true){
            oldObj = {"tblHeader" : true};  
            newObj = {"tblHeader" : "none"};
            value = "none";
        }
        else{
            oldObj = {"tblHeader" : "none"};    
            newObj = {"tblHeader" : true};
            value = true;
        }
        row.setTblHeaderRepeat(false);
        acts.push(WRITER.MSG.createSetAttributeAct(row, null, null, newObj, oldObj));
                // table.update();
        if(table)
            WRITER.MSG.sendMessage( [WRITER.MSG.createTableMsg(table.id,acts)] );
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([{
                "type": "tb",
                "mc": "c",
                "updates": [{
                    "tid": "id_00201",
                    "t": "sa",
                    "at": {
                        "tblHeader": "none"
                    },
                    "tbId": "id_002"
                }]
            }]);
        });

    it('Send insert & delete column message', function() {
        var table = loadTestTable();
        var newCells = [{
            cnt: {
                "t": "tc",
                "ps": [{
                    "fmt": [],
                    "t": "p",
                    "id": "id_002010201",
                    "c": ""
                }],
                "id": "id_0020102"
            }
        }];
        var msgs = [];
        var act = WRITER.MSG.createInsertColumn(table, 1, newCells);
        table.insertColumn(1, newCells);
        msgs.push(WRITER.MSG.createTableMsg(table.id, [act]));
        act = WRITER.MSG.createDeleteColumn(table, 1, newCells, {});
        table.deleteColumn(1, newCells, {});
        msgs.push(WRITER.MSG.createTableMsg(table.id, [act]));
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([{
            "type": "tb",
            "mc": "c",
            "updates": [{
                "t": "ic",
                "cnt": newCells,
                "idx": 1,
                "tid": "id_002",
                "tbId": "id_002"
            }]
        }, {
            "type": "tb",
            "mc": "c",
            "updates": [{
                "t": "dc",
                "cnt": newCells,
                "fc": {},
                "idx": 1,
                "tid": "id_002",
                "tbId": "id_002"
            }]
        }]);
    });

    it('Send split & merge cells message', function() {
        var table = loadTestTable();
        var msgs = [];
        var act = WRITER.MSG.createSplitCellsAct(table, 0, 0, 1, 2, 1, 1, [table.byId("id_0020101")]);
        msgs.push(WRITER.MSG.createTableMsg(table.id, [act]));
        act = WRITER.MSG.createMergeCellsAct(table, 0, 0, 1, 1, 1, 2, [table.byId("id_0020101")]);
        msgs.push(WRITER.MSG.createTableMsg(table.id, [act]));
        WRITER.MSG.sendMessage(msgs);
        expect(msgs[0].msg.updates[0].t).toEqual(WRITER.ACTTYPE.SplitCells);
        expect(msgs[1].msg.updates[0].t).toEqual(WRITER.ACTTYPE.MergeCells);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([msgs[0].msg, msgs[1].msg]);
    });

    it("After beginRecord, the message will not be sent until endRecord.", function() {
        var para = loadTestPara();
        WRITER.MSG.beginRecord();
        var actPair = WRITER.MSG.createInsertTextAct(1, 2, para);
        var msgs = [WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair])];
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).not.toHaveBeenCalled();
        var actPair2 = WRITER.MSG.createInsertTextAct(2, 3, para);
        var msgs2 = [WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair2])];
        WRITER.MSG.sendMessage(msgs2);
        expect(pe.scene.session.sendMessage).not.toHaveBeenCalled();
        WRITER.MSG.endRecord();
        var msgList = [{
            'type': 't',
            'mc': 'c',
            'updates': [{
                'tid': 'id_001',
                'idx': 1,
                'len': 2,
                't': 'it',
                'cnt': {
                    'fmt': [{
                        'rt': 'rPr',
                        's': '1',
                        'l': '2'
                    }],
                    'c': 'el'
                }
            }]
        }, {
            'type': 't',
            'mc': 'c',
            'updates': [{
                'tid': 'id_001',
                'idx': 2,
                'len': 3,
                't': 'it',
                'cnt': {
                    'fmt': [{
                        'rt': 'rPr',
                        's': '2',
                        'l': '3'
                    }],
                    'c': 'llo'
                }
            }]
        }];
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msgList);
    });

    it('Compress continuous insert text message', function() {
        var para = loadTestPara();
        para.text += "A";
        var actPair = WRITER.MSG.createInsertTextAct(5, 1, para);
        var msg = [WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair])];
        WRITER.MSG.sendMessage(msg);
        pe.scene.session.waitingList.push("not important");
        para.text += "B";
        var actPair2 = WRITER.MSG.createInsertTextAct(6, 1, para);
        var msgs = [
            WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair2])
        ];

        var msgList = [{
            "type": "t",
            "mc": "c",
            "updates": [{
                "tid": "id_001",
                "idx": 5,
                "len": 2,
                "t": "it",
                "cnt": {
                    "fmt": [],
                    "c": "AB"
                }
            }]
        }];
        WRITER.MSG.sendMessage(msgs);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msgList);
    });
});