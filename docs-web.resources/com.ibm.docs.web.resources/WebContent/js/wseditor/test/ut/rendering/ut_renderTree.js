dojo.provide("websheet.test.ut.rendering.renderTree");

/**
 * UT suite covering functions in Number.js
 */

describe("Ut for RenderTree, module websheet/grid/_Tree", function() {
	var tree;
	beforeEach(function() {
		 tree = new websheet.grid._Tree();
	});
	
	afterEach(function() {
	});
	it("_Tree, interface test, initialize", function() {
		expect(tree.root()).toBeTruthy();
	});
	it("_Tree interface test. root() returns the root node of the tree", function () {
		expect(tree.root().type).toBe('root');
	});
	it("_Tree interface test. Initial status, children should be empty", function () {
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
	});
	it("_Tree. insert() does nothing by default", function () {
		tree.insert({fake_node : "this is just a test"});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
	});
	it("_Tree. invalidate() clear the child nodes", function () {
		tree.insert({fake_node : "this is just a test"});
		tree.invalidate();
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
	});
});
describe("Ut for RenderTree, module websheet/grid/_TextTree", function() {
	var tree;
	beforeEach(function() {
		 tree = new websheet.grid._TextTree();
	});
	
	afterEach(function() {
	});
	it("_TextTree. we can insert text nodes to _TextTree", function () {
		var tree = new websheet.grid._TextTree();
		tree.insert({
			type : "text",
			value : "Hello World!"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
	});
	it("_TextTree. we can remove text nodes from textTree", function () {
		var tree = new websheet.grid._TextTree();
		tree.insert({
			type : "text",
			value : "Hello World!"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		tree.invalidate();
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
	});
});
describe("Ut for RenderTree, module websheet/grid/_TextTree", function() {
	var tree;
	beforeEach(function() {
		 tree = new websheet.grid._TextTree();
	});
	
	afterEach(function() {
	});
	it("_TextTree. we can insert text nodes to _TextTree", function () {
		tree.insert({
			font : "Arial",
			color : "#00ff00",
			value : "a green cell"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
	});
	it("_TextTree. different cells are grouped by font in the first level", function () {
		tree.insert({
			font : "Arial",
			color : "#00ff00",
			value : "a green cell with arial font"
		});
		tree.insert({
			font : "Arial",
			color : "#ff0000",
			value : "a red cell with arial font"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
	});
	it("_TextTree. different cells are grouped by font in the first level, and font color in the second level", function () {
		tree.insert({
			font : "Arial",
			color : "#00ff00",
			value : "a green cell with arial font"
		});
		tree.insert({
			font : "Arial",
			color : "#ff0000",
			value : "a red cell with arial font"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		var fontnode = tree.root().children[0];
		var colors = fontnode.children;
		expect(colors).toBeTruthy();
		expect(colors.length).toBe(2);
	});
	it("_TextTree. different cells with different fonts", function () {
		tree.insert({
			font : "Arial",
			color : "#00ff00",
			value : "a green cell with arial font"
		});
		tree.insert({
			font : "Calibri",
			color : "#ff0000",
			value : "a red cell with Calibri font"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(2);
	});
	it("_TextTree. we can remove text nodes from textTree", function () {
		var tree = new websheet.grid._TextTree();
		tree.insert({
			type : "text",
			value : "Hello World!"
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		tree.invalidate();
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
	});
});
describe("Ut for RenderTree, module websheet/grid/_UserIndicatorTree", function() {
	var tree;
	beforeEach(function() {
		 tree = new websheet.grid._UserIndicatorTree();
	});
	
	afterEach(function() {
	});
	it("_UserIndicatorTree. we can insert indicate nodes to _UserIndicatorTree", function () {
		tree.insert({
			user : "user1",
			
			children : [{row : 1, col :1}]
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
	});
	it("_UserIndicatorTree. different users are grouped by there id", function () {
		tree.insert({
			user : "user1",
			children : [{row : 1, col :1}]
		});
		tree.insert({
			user : "user2",
			children : [{row : 1, col :1}]
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(2);
	});
	it("_UserIndicatorTree. one user may change more then two cell nodes", function () {
		tree.insert({
			user : "user1",
			children : [{row : 1, col :1}]
		});
		tree.insert({
			user : "user1",
			children : [{row : 1, col :2}]
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		var user = tree.root().children[0];
		expect(user.children).toBeTruthy();
		expect(user.children.length).toBe(2);
	});
	it("_UserIndicatorTree. we can merge two tree to one tree", function () {
		tree.insert({
			user : "user1",
			children : [{row : 1, col :1}]
		});
		var another = new websheet.grid._UserIndicatorTree();
		another.insert({
			user : "user2",
			children : [{row : 1, col :1}]
		});
		tree.merge(another);
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(2);
	});
	it("_UserIndicatorTree. we can remove text nodes from _UserIndicatorTree", function () {
		tree.insert({
			user : "user1",
			children : [{row : 1, col :1}]
		});
		tree.insert({
			user : "user2",
			children : [{row : 1, col :1}]
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(2);
		tree.invalidate();
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
	});
});
describe("Ut for RenderTree, module websheet/grid/_BackgroundTree", function() {
	var tree;
	beforeEach(function() {
		 tree = new websheet.grid._BackgroundTree();
		 tree.setDefaultStyle("#ffffff");
	});
	
	afterEach(function() {
	});
	it("_BackgroundTree. background tree has a default background color", function () {
		if (!tree._bInHighContrastMode) {
			expect(tree.root().children).toBeTruthy();
			expect(tree.root().children.length).toBe(0);
		}
	});
	it("_BackgroundTree. background tree has a default background color, and default color will generate a node when in high contrast mode", function () {
		if (!tree._bInHighContrastMode) {
			tree._bInHighContrastMode = true;
		}
		tree.setDefaultStyle("#00ff00");
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		expect(tree._bFillDefaultColor).toBe(true);
	});
	it("_BackgroundTree. background tree are grouped with colors", function () {
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 2,
			endCol : 2
		});
		tree.insert({
			color : "#0000ff",
			row : 1,
			col : 2,
			endCol : 2
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(2);
	});
	it("_BackgroundTree.cell nodes with same color will be merged together to a big single cell node", function () {
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 2,
			endCol : 2
		});
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 3,
			endCol : 3
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		var node = tree.root().children[0].children[0];
		expect(node.row).toBe(1);
		expect(node.col).toBe(2);
		expect(node.endCol).toBe(3);
	});
	it("_BackgroundTree. When we need to fill in default background color nodes, we will generate a 'dfNodeList' when insert ndoes", function () {
		tree._bFillDefaultColor = true;
		tree.setRange({
			startRow : 1,
			endRow : 5,
			startCol : 1,
			endCol : 5
		});
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 2,
			endCol : 2
		});
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 3,
			endCol : 3
		});
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(1);
		var node = tree.root().children[0].children[0];
		expect(node.row).toBe(1);
		expect(node.col).toBe(2);
		expect(node.endCol).toBe(3);
		expect(tree.dfNodeList.length).toBe(1);
	});
	it("_BackgroundTree. A more detailed case to verify the default node list.", function () {
		tree._bFillDefaultColor = true;
		tree.setRange({
			startRow : 1,
			endRow : 2,
			startCol : 1,
			endCol : 3
		});
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 1,
			endCol : 2
		});
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 3,
			endCol : 3
		});
		tree.setEndRow(2);
		expect(tree.dfNodeList.length).toBe(1);
		var node = tree.dfNodeList[0];
		expect(node.row).toBe(2);
		expect(node.col).toBe(1);
		expect(node.endCol).toBe(3);
	});
	it("_BackgroundTree. clear all the nodes in the background tree, default nodes will also be cleared", function () {
		tree.insert({
			color : "#00ff00",
			row : 1,
			col : 2,
			endCol : 2
		});
		tree.invalidate();
		expect(tree.root().children).toBeTruthy();
		expect(tree.root().children.length).toBe(0);
		expect(tree.dfNodeList.length).toBe(0);
	});
});
describe("Ut for RenderTree, module websheet/grid/_BorderTree", function() {
	var tree;
	var _document = new websheet.model.Document();
	var _sheet = new websheet.model.Sheet(_document,"os1","sheet1", {offGridLine: true});
	var ROWS = 3, COLUMNS = 3;
	var _range = {startRow: 1, endRow: ROWS, startCol: 1, endColumn: COLUMNS};	
	var fakeStyle = {
			hasBorderStyle : function () {
				return true;
			},
			_attributes: {
				t : "thick",
				b : "thick",
				l : "thick",
				r : "thick",
				bc : "#00ff00",
				bs : "solid"
			}
	};

	beforeEach(function() {
		 tree = new websheet.grid._BorderTree();
	});
	
	afterEach(function() {
	});
	
	it("_BorderTree. we can insert border nodes to _BorderTree on sheet gridlines off", function () {
		_sheet.setOffGridLines(true);
		tree.setRange(_range);
		tree.setSheet(_sheet);				
		for (var i=1; i<=ROWS; i++) {
			for (var j=1; j<=COLUMNS; j++) {
				var node = {
						cellStyle : fakeStyle,
						row : i,
						col : j,
						top : false,
						right : false,
						bottom : false,
						left : false
					};	
				tree.insert(node);
			}
		}
		tree.setEndRow(ROWS);
		expect(tree.root().children).toBeTruthy();
		expect(tree.vtNodeList.length).toBe(5);
		expect(tree.hzNodeList.length).toBe(5);			
		expect(tree.dfHzNodeList.length).toBe(0);
		expect(tree.dfVtNodeList.length).toBe(0);		
	});
	
	it("_BorderTree. we can insert border nodes to _BorderTree on sheet gridlines on", function () {
		_sheet.setOffGridLines(false);
		tree.setRange(_range);
		tree.setSheet(_sheet);		
		tree.invalidate();
		for (var i=1; i<=ROWS; i++) {
			for (var j=1; j<=COLUMNS; j++) {
				var node = {
						cellStyle : fakeStyle,
						row : i,
						col : j,
						top : false,
						right : false,
						bottom : false,
						left : false
					};	
				tree.insert(node);
			}
		}
		tree.setEndRow(ROWS);
		expect(tree.root().children).toBeTruthy();
		expect(tree.vtNodeList.length).toBe(5);
		expect(tree.hzNodeList.length).toBe(5);		
		expect(tree.dfHzNodeList.length).toBe(5);
		expect(tree.dfVtNodeList.length).toBe(0);
	});		
	
	it("_BorderTree. invalidate() to remove all the cell borders", function () {
		var borderNode = {
				cellStyle : fakeStyle,
				row : 1,
				col : 1,
				top : false,
				right : false,
				bottom : false,
				left : false
			};
		tree.insert(borderNode);
		tree.invalidate();
		expect(tree.dfHzNodeList.length).toBe(0);
		expect(tree.dfVtNodeList.length).toBe(0);
		expect(tree.hzNodeList.length).toBe(0);
		expect(tree.vtNodeList.length).toBe(0);
	});	
});