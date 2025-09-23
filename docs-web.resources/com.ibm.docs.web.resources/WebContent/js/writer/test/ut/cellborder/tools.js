define([
	"writer/model/Document",
	"writer/model/Numbering",
	"writer/model/Relations",
	"writer/model/Settings",
	"writer/model/style/Styles",
	"writer/util/CellBorderTools",
	"writer/util/TableTools"
], function (Document, Numbering, Relations, Settings, Styles, CellBorderTools, TableTools) {
	describe('writer.test.ut.cellborder.tools', function() {
	    describe('CellBorderTools', function() {
	        var tools = CellBorderTools;
	        var min = tools.LINE_WIDTH_ITEMS[0],
	            limitedMax = 3,
	            max = 6;
	
	        it('previous of minimun is limited maximun', function() {
	            expect(tools.getNextValue(min, true, false)).toEqual(limitedMax);
	            expect(tools.getNextValue(min, false, false)).toEqual(max);
	        });
	
	        it('previous of a number larger than maximun is maximun', function() {
	            expect(tools.getNextValue(limitedMax + 1, true, false)).toEqual(limitedMax);
	            expect(tools.getNextValue(max + 1, false, false)).toEqual(max);
	        });
	
	        it('previous of integer i between minimun and maximun is (i-1) ', function() {
	            expect(tools.getNextValue(min + 0.1, true, false)).toEqual(min);
	            expect(tools.getNextValue(min + 5.1, false, false)).toEqual(4.5);
	        });
	
	        it('previous of noninteger i between minimun and maximun is Math.floor(i)', function() {
	            expect(tools.getNextValue(min + 1.5, true, false)).toEqual(1.5);
	            expect(tools.getNextValue(min + 13.5, false, false)).toEqual(max);
	        });
	
	        it('next of a number less than minimun is minimun', function() {
	            expect(tools.getNextValue(min - 0.5, true, true)).toEqual(min);
	            expect(tools.getNextValue(min - 0.5, false, true)).toEqual(min);
	        });
	
	        it('next of maximun is minimun', function() {
	            expect(tools.getNextValue(limitedMax, true, true)).toEqual(min);
	            expect(tools.getNextValue(max, false, true)).toEqual(min);
	        });
	
	        it('next of i between minimun and maximun is (floor(i) + 1)', function() {
	            expect(tools.getNextValue(min + 1.5, true, true)).toEqual(min + 2);
	            expect(tools.getNextValue(min + 1.5, false, true)).toEqual(min + 2);
	        });
	    });
	
	    describe('TableTools', function() {
	
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
	                        "tcPr":{
	                           "gridSpan": {
	                                "val": 1
	                            },
	                            "vMerge": {
	                                "val": "restart"
	                            } 
	                        },
	                        "id": "id_0010101"
	                    },{
	                        "t": "tc",
	                        "tcPr":{
	                           "gridSpan": {
	                                "val": 2
	                            }
	                        },
	                        "id": "id_0010102"
	                    }],
	                    "id": "id_00101"
	                }, { // row2
	                    "t": "tr",
	                    "tcs": [{
	                        "tcPr": {
	                            "vMerge":{}
	                        },
	                        "t": "tc",
	                        "id": "id_0010201"
	                    },{
	                        "t": "tc",
	                        "id": "id_0010202"
	                    },{
	                        "t":"tc",
	                        "id":"id_0010203"
	                    }],
	                    "id": "id_00102"
	                }],
	                "id": "id_001"
	            }];
	            pe.lotusEditor.relations = new Relations({});
	            pe.lotusEditor.number = new Numbering({});
	            pe.lotusEditor.styles = new Styles({});
	            pe.lotusEditor.styles.createCSSStyle();
	            pe.lotusEditor.setting = new Settings({});
	            pe.lotusEditor.relations.loadContent();
	            pe.lotusEditor.document = new Document(jsonData, pe.lotusEditor.layoutEngine);
	        };
	
	        beforeEach(function() {
	            loadTestData();
	        });
	
	        var tools = TableTools;
	
	        it('getBorderChangeSet should get the changes between old and new border', function() {
	            var oldBorder = {
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
	                "h": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                },
	                "bottom": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                },
	                "v": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                },
	                "right": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                }
	            };
	
	            var newBorder = {
	                "bottom": {
	                    "val": "double",
	                    "color": "ff0000",
	                    "sz": "1pt"
	                }
	            };
	            expect(tools.getBorderChangeSet(oldBorder, newBorder)).toEqual({
	                "top": {
	                    auto: true
	                },
	                "left": {
	                    auto: true
	                },
	                "right": {
	                    auto: true
	                },
	                "bottom": {
	                    "val": "double",
	                    "color": "ff0000",
	                    "sz": "1pt"
	                },
	                h: {
	                    auto: true
	                },
	                v: {
	                    auto: true
	                }
	            });
	        });
	
	        it('mergeBorderChangeSet should change set changeSet to the oldBorder', function() {
	            var oldBorder = {
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
	                "h": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                },
	                "bottom": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                },
	                "v": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                },
	                "right": {
	                    "val": "single",
	                    "color": "000000",
	                    "sz": "1pt"
	                }
	            };
	
	            var changeSet = {
	                "top": {
	                    auto: true
	                },
	                "left": {
	                    auto: true
	                },
	                "right": {
	                    auto: true
	                },
	                "bottom": {
	                    "val": "double",
	                    "color": "ff0000",
	                    "sz": "1pt"
	                },
	                h: {
	                    auto: true
	                },
	                v: {
	                    auto: true
	                }
	            };
	
	            expect(tools.mergeBorderChangeSet(oldBorder, changeSet)).toEqual({
	                "bottom": {
	                    "val": "double",
	                    "color": "ff0000",
	                    "sz": "1pt"
	                }
	            });
	        });
	
	        it('changeBorders should return cells will be changed and it\'s changePart', function() {
	            var table = pe.lotusEditor.document.byId("id_001");
	            var changes = tools.changeBorders(table,{val:"single",sz:"3pt",color:"ff0000"},[{row:1,col:1},{row:1,col:2}],[{row:0,col:1},{row:1,col:1}]);
	            expect(changes.length).toEqual(4);
	        });
	    });
	});

});