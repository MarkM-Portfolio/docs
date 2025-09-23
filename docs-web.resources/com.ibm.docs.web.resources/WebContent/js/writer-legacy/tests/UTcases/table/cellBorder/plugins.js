dojo.provide("writer.tests.UTcases.table.cellBorder.plugins");
dojo.require("writer.plugins.Table");
dojo.require("writer.msg.MessageHelper");
describe('writer.tests.UTcases.table.cellBorder.plugins', function() {
    var loadTestData = function() {
        var jsonData = [{
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
            "trs": [{ // row 1
                "t": "tr",
                "tcs": [{
                    "t": "tc",
                    "tcPr": {
                        "gridSpan": {
                            "val": 1
                        },
                        "vMerge": {
                            "val": "restart"
                        }
                    },
                    "ps": [{
                            "t": "p",
                            "id": "id_001010101",
                            "fmt": [{
                                "t": "r",
                                "rt": "rPr",
                                "s": "0",
                                "l": "0"
                            }],
                            "c": ""
                    }],
                    "id": "id_0010101"
                }, {
                    "t": "tc",
                    "tcPr": {
                        "gridSpan": {
                            "val": 2
                        }
                    },
                    "ps": [{
                            "t": "p",
                            "id": "id_001010201",
                            "fmt": [{
                                "t": "r",
                                "rt": "rPr",
                                "s": "0",
                                "l": "0"
                            }],
                            "c": ""
                    }],
                    "id": "id_0010102"
                }],
                "id": "id_00101"
            }, { // row2
                "t": "tr",
                "tcs": [{
                    "tcPr": {
                        "vMerge": {}
                    },
                    "ps": [{
                            "t": "p",
                            "id": "id_001020101",
                            "fmt": [{
                                "t": "r",
                                "rt": "rPr",
                                "s": "0",
                                "l": "0"
                            }],
                            "c": ""
                    }],
                    "t": "tc",
                    "id": "id_0010201"
                }, {
                    "t": "tc",
                    "ps": [{
                            "t": "p",
                            "id": "id_001020201",
                            "fmt": [{
                                "t": "r",
                                "rt": "rPr",
                                "s": "0",
                                "l": "0"
                            }],
                            "c": ""
                    }],
                    "id": "id_0010202"
                }, {
                    "t": "tc",
                    "ps": [{
                            "t": "p",
                            "id": "id_001020301",
                            "fmt": [{
                                "t": "r",
                                "rt": "rPr",
                                "s": "0",
                                "l": "0"
                            }],
                            "c": ""
                    }],
                    "id": "id_0010203"
                }],
                "id": "id_00102"
            }],
            "id": "id_001"
        }];
        pe.lotusEditor.relations = new writer.model.Relations({});
        pe.lotusEditor.number = new writer.model.Numbering({});
        pe.lotusEditor.styles = new writer.model.style.Styles({});
        pe.lotusEditor.styles.createCSSStyle();
        pe.lotusEditor.setting = new writer.model.Settings({});
        pe.lotusEditor.relations.loadContent();
        pe.scene = {
            coedit: false,
            cursorDecEnabled: false,
            session: {
                createMessage: concord.net.Session.prototype.createMessage,
                sendMessage: function() {
                },
                isSingleMode: function() {
                    return true;
                },
                waitingList: [],
                updateHeaderFooter: function() {}
            }
        };
        pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
    };
    var loadPlugin = function(){
        return new writer.plugins.Table({
            editor: pe.lotusEditor
        });
    };
    var testSetBorder = function(pos,msg) {
    	spyOn(pe.scene.session, "sendMessage");
        var table = pe.lotusEditor.document.byId("id_001");
        var cells = [];
        var row = table.rows.getFirst();
        while(row){
            cells = cells.concat(row.cells.nodes);
            row = row.next();
        }
        var border = {
            "style": "solid",
            "color": "ff0000",
            "width": "3pt"
        };
        var plugin = loadPlugin();
        plugin.setCellBorder(cells, border, pos);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith(msg);
    };

    beforeEach(function() {
        loadTestData();
    });
  
    it('set none border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"left":{"sz":"0pt","color":"ff0000","val":"none"},"right":{"sz":"0pt","color":"ff0000","val":"none"},"top":{"sz":"0pt","color":"ff0000","val":"none"},"bottom":{"sz":"0pt","color":"ff0000","val":"none"}}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"left":{"sz":"0pt","color":"ff0000","val":"none"},"right":{"sz":"0pt","color":"ff0000","val":"none"},"top":{"sz":"0pt","color":"ff0000","val":"none"},"bottom":{"sz":"0pt","color":"ff0000","val":"none"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"left":{"sz":"0pt","color":"ff0000","val":"none"},"right":{"sz":"0pt","color":"ff0000","val":"none"},"top":{"sz":"0pt","color":"ff0000","val":"none"},"bottom":{"sz":"0pt","color":"ff0000","val":"none"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"left":{"sz":"0pt","color":"ff0000","val":"none"},"right":{"sz":"0pt","color":"ff0000","val":"none"},"top":{"sz":"0pt","color":"ff0000","val":"none"},"bottom":{"sz":"0pt","color":"ff0000","val":"none"}}},"tbId":"id_001"}]}];
        testSetBorder("clear", msg);
    });

    it('set all border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"right":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"right":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"right":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"right":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("all",msg);
    });

    it('set inner border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"right":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"right":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("inner",msg);
    });

    it('set inside horizontal border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("horizontal",msg);
    });

    it('set inside vertical border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"right":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"right":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("vertical",msg);
    });

    it('set outer border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"right":{"sz":"3pt","color":"ff0000","val":"single"},"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"right":{"sz":"3pt","color":"ff0000","val":"single"},"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("outer",msg);
    });

    it('set left border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"left":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("left",msg);
    });

    it('set right border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"right":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"right":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("right",msg);
    });

    it('set top border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{"top":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
    	testSetBorder("top",msg);
    });

    it('set bottom border', function() {
    	var msg = [{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{"bottom":{"sz":"3pt","color":"ff0000","val":"single"}}},"tbId":"id_001"}]}];
        testSetBorder("bottom",msg);
    });

    it('merged cell should fix cellBorder', function() {
        var startCell = pe.lotusEditor.document.byId("id_0010101");
        var endCell = pe.lotusEditor.document.byId("id_0010203");
        var plugin = loadPlugin();
        spyOn(pe.scene.session,"sendMessage");
        plugin.mergeCells(startCell,endCell);
        expect(pe.scene.session.sendMessage).toHaveBeenCalledWith([{"type":"tb","mc":"c","updates":[{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010102","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010101","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010202","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"tid":"id_0010203","t":"sa","at":{"spread":true,"border":{}},"tbId":"id_001"},{"t":"tmc","sc":0,"sr":0,"nr":2,"nc":3,"tid":"id_001","tbId":"id_001"},{"t":"dr","fc":{},"idx":1,"tid":"id_001","tbId":"id_001"},{"t":"dc","cnt":[{"hMerged":true}],"fc":{},"idx":1,"tid":"id_001","tbId":"id_001"},{"t":"dc","cnt":[{"hMerged":true}],"fc":{},"idx":1,"tid":"id_001","tbId":"id_001"},{"tid":"id_001","t":"sa","at":{"cols":[{"t":"gridCol","w":"NaNpt"}]},"tbId":"id_001"}]}]);
    });

    it('split cell should mark related cell changed', function() {
        var cell1 = pe.lotusEditor.document.byId("id_0010101");
        var cell2 = pe.lotusEditor.document.byId("id_0010102");
        var cell3 = pe.lotusEditor.document.byId("id_0010202");
        var cell4 = pe.lotusEditor.document.byId("id_0010203");
        var plugin = loadPlugin();
        spyOn(cell3,"markCheckBorder");
        plugin.splitCell(cell1,2,1);
        plugin.splitCell(cell2,1,2);
        plugin.splitCell(cell4,1,2);
        plugin.splitCell(cell2,2,1);
        expect(cell3.markCheckBorder).toHaveBeenCalled();
    });
});
