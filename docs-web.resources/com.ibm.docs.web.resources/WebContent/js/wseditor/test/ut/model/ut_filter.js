dojo.provide("websheet.tests.ut.model.ut_filter");

describe("websheet.test.ut.model.ut_filter", function()
{
	var _document = websheet.model.ModelHelper.getDocumentObj();
	var styleManager = _document._styleManager;

	// dummy default cell style
	styleManager._dcs 
		= websheet.style.DefaultStyleCode
		= styleManager.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE]
		= builders.style().defaultStyle().finish();
	
	websheet.Constant.init();
	
	var MIXED = _document.CellType.MIXED;
	var filter = null;

	beforeEach(function() {
		utils.bindDocument(_document);
		
		var parsedRef = new  websheet.parse.ParsedRef("st0",1,1,5,2,websheet.Constant.RANGE_MASK);
		var	range = new websheet.parse.Area(parsedRef, "filter0");
		range.setUsage("FILTER");
		
		filter = new websheet.AutoFilter.Filter(range, websheet.Main);
	});
	
	afterEach(function() {
		styleManager._hashCodeIdMap = {};
		styleManager.styleMap = {};
		
		utils.unbindDocument();
	});
	
	it("Prepare data for filter - basic data", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [[5],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[8],["ah"]]).done();
		filter.prepareData();
		
		var item0 = {};
		item0["30"] = {data:30,sv:"30",type:"number",rowids:[2]};
		item0["5"] = {data:5,sv:"5",type:"number",rowids:[3]};
		item0["8"] = {data:8,sv:"8",type:"number",rowids:[5]};
		item0[""]  = {data:"",sv:"",type:"string",rowids:[4]};
		
		var item1 = {};
		item1["ah"] = {data:"ah",sv:"ah",type:"string",rowids:[3,5], dir:"ltr"};
		item1["gd"] = {data:"gd",sv:"gd",type:"string",rowids:[2], dir:"ltr"};
		item1["qas"] = {data:"qas",sv:"qas",type:"string",rowids:[4], dir:"ltr"};
		var expectRes = [item0,item1];
		
		expect(filter._keywordsRecord).toEqual(expectRes);
	});
	
	it("Prepare data for filter - repeate", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30]])
		                          .row([3,1], [])
		                          .row(5, [[8]]).done();
		
		var parsedRef = new  websheet.parse.ParsedRef("st0",1,1,5,1,websheet.Constant.RANGE_MASK);
		
		var	range = new websheet.parse.Area(parsedRef, "filter0");
		range.setUsage("FILTER");
		
		filter = new websheet.AutoFilter.Filter(range, websheet.Main);
		
		var item = {};
		item["30"] = {data:30,sv:"30",type:"number",rowids:[2]};
		item["8"] = {data:8,sv:"8",type:"number",rowids:[5]};
		item[""]  = {data:"",sv:"",type:"string",rowids:[3,4]};
		
		var expectRes = [item];
	
		filter.prepareData();
		
		expect(filter._keywordsRecord).toEqual(expectRes);
	});
	
	it("Match rule - no rule", function()
	{
		var item = {data:8,sv:"8",type:"number"};
		var ret = filter.match(item, null);
		expect(ret).toBe(true);
		
	});
	
	it("Match rule - keyword - number", function()
	{
		var item = {data:8,sv:"8"};
		var ret = filter.match(item, {keys:{"4":1, "8":1}});
		expect(ret).toBe(true);
	});
	
	it("Match rule - keyword - number format", function()
	{
		var item = {data:8,sv:"$8"};
		var ret = filter.match(item, {keys:{"4":1, "$8":1}});
		expect(ret).toBe(true);
		
	});
	
	it("Match rule - keyword - text", function()
	{
		var item = {data:"asdf",sv:"asdf"};
		var ret = filter.match(item, {keys:{"asdf":1, "8":1}});
		expect(ret).toBe(true);
	});
	
	it("Match rule - equals - number", function()
	{
		var item = {data:5,sv:"5"};
		var rule = {rules:[{v:"5"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - equals - number format", function(){
		var item = {data:5,sv:"$5"};
		var rule = {rules:[{v:"5"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(false);
	});
	
	it("Match rule - equals - number format - 1", function(){
		var item = {data:5,sv:"$5"};
		var rule = {rules:[{v:"$5"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - equals - number with text", function(){
		var item = {data:5,sv:"$5"};
		var rule = {rules:[{v:"abc"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(false);
	});
	
	it("Match rule - equals - text", function(){
		var item = {data:"ab",sv:"ab"};
		var rule = {rules:[{v:"ab"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - equals - text - wildcart ? ", function(){
		var item = {data:"ab",sv:"ab"};
		var rule = {rules:[{v:"a?"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
		
		var rule = {rules:[{v:"a??"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(false);
		
		var item = {data:"cab",sv:"cab"};
		var rule = {rules:[{v:"?a?"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - doesn't equals - number", function(){
		var item = {data:5,sv:"5"};
		var rule = {rules:[{v:"6",op:"!="}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - doesn't equals - number format", function(){
		var item = {data:5,sv:"$5"};
		var rule = {rules:[{v:"5",op:"!="}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(false);
	});
	
	it("Match rule - doesn't equals - text", function(){
		var item = {data:"abc",sv:"abc"};
		var rule = {rules:[{v:"abcd",op:"!="}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - > - number", function(){
		var item = {data:5,sv:"5"};
		var rule = {rules:[{v:"4",op:">"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - > - text", function(){
		var item = {data:"abd",sv:"abd"};
		var rule = {rules:[{v:"aad",op:">"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - > - number - text", function(){
		var item = {data:"abd",sv:"abd"};
		var rule = {rules:[{v:"5",op:">"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(false);
	});
	
	it("Match rule - < - number", function(){
		var item = {data:5,sv:"5"};
		var rule = {rules:[{v:"6",op:"<"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - < - text", function(){
		var item = {data:"abd",sv:"abd"};
		var rule = {rules:[{v:"cad",op:"<"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - contians", function(){
		var item = {data:"abd",sv:"abd"};
		var rule = {rules:[{v:"*a*"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - contians - number", function(){
		var item = {data:500,sv:"500"};
		var rule = {rules:[{v:"*5*"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(false);
	});
	
	it("Match rule - start with", function(){
		var item = {data:"fffa",sv:"fffa"};
		var rule = {rules:[{v:"f*"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - end with", function(){
		var item = {data:"fffa",sv:"fffa"};
		var rule = {rules:[{v:"*a"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - and", function(){
		var item = {data:5,sv:"5"};
		var rule = {and:1, rules:[{v:"4", op:">"},{v:"6", op:"<"}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Match rule - or", function(){
		var item = {data:5,sv:"5"};
		var rule = {rules:[{v:"8", op:">"},{v:"5", op:"<="}]};
		var ret = filter.match(item, rule);
		filter.cleanRuleCache(rule);
		expect(ret).toBe(true);
	});
	
	it("Prepare status when click a filter header - no rule", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[8],["ah"]]).done();
		
		var stat1 = filter._prepareStatus(1,false);
		
		var expectRes = {show:[],hidden:[]};
		expectRes.show.push({data:8,sv:"8",type:"number",rowids:[5],checked:true});
		expectRes.show.push({data:30,sv:"30",type:"number",rowids:[2],checked:true});
		expectRes.show.push({data:"ah",sv:"ah",type:"string",rowids:[3],checked:true, dir:"ltr"});
		expectRes.show.push({data:"",sv:"",type:"string",rowids:[4],checked:true});
		
		expect(stat1).toEqual(expectRes);
	});
	
	it("Prepare status when click a filter header - with rule", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[8],["ah"]]).done();
		
		filter._rules = {1:{keys:{"30":1,"":1,"8":1}},2:{keys:{"gd":1,"ah":1}}};
		filter.init();
		var stat1 = filter._prepareStatus(1,false);
		var expectRes = {show:[],hidden:[]};
		expectRes.show.push({data:8,sv:"8",type:"number",rowids:[5],checked:true});
		expectRes.show.push({data:30,sv:"30",type:"number",rowids:[2],checked:true});
		expectRes.show.push({data:"ah",sv:"ah",type:"string",rowids:[3],checked:false, dir:"ltr"});
		
		expectRes.hidden.push({data:"",sv:"",type:"string",rowids:[4]});
		expect(stat1).toEqual(expectRes);
	});
	
	it("New rule - keyword", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[8],["ah"]]).done();
		
		var stat1 = filter.init();
		
		var data = {col:1,set:{keys:["8","30"]},s:[],h:[]};
		filter.updateRule(data, true);
		
		expect(filter._rules).toEqual({1:{keys:{"30":1,"8":1}}});
		
		expect(data.h).toEqual([3,4]);
	});
	
	it("New rule - keyword - mutiple column", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[8],["ah"]]).done();
		
		var stat1 = filter.init();
		
		var data = {col:1,set:{keys:["8","30"]},s:[],h:[]};
		filter.updateRule(data, true);
		
		var data = {col:2,set:{keys:["ah"]},s:[],h:[]};
		filter.updateRule(data, true);
		
		expect(filter._rules).toEqual({1:{keys:{"30":1,"8":1}},2:{keys:{"ah":1}}});
		
		expect(data.h).toEqual([2]);
	});
	
	it("change keyword", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[8],["ah"]]).done();
		
		var stat1 = filter.init();
		
		var data = {col:1,set:{keys:["8","30"]},s:[],h:[]};
		filter.updateRule(data, true);
		
		var data = {col:1,add:[""],del:["8"],s:[],h:[]};
		filter.updateRule(data, true);
		
		expect(filter._rules).toEqual({1:{keys:{"30":1,"":1}}});
		
		expect(data.h).toEqual([5]);
		expect(data.s).toEqual([4]);
	});
	
	it("New rule - custom filter", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[2], ["gd"]])
		                          .row(6, [[8],["ah"]]).done();
		
		var stat1 = filter.init();
		
		var data = {col:1,set:{and:1,rules:[{v:2,"op":">="},{v:30,op:"<"}]},s:[],h:[]};
		filter.updateRule(data, true);
		
		expect(data.h).toEqual([2,3,4]);
	});
	
	it("New rule - custom filter - multiple columns", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[2], ["gd"]])
		                          .row(6, [[8],["ah"]]).done();
		
		var stat1 = filter.init();
		
		var data = {col:1,set:{and:1,rules:[{v:2,"op":">="},{v:30,op:"<"}]},s:[],h:[]};
		filter.updateRule(data, true);
		expect(data.h).toEqual([2,3,4]);
		
		var data = {col:2,set:{rules:[{v:"a*"}]},s:[],h:[]};
		filter.updateRule(data, true);
		expect(data.h).toEqual([5]);
	});
	
	it("change - custom filter", function(){
		var sheet = builders.sheet(_document).row(1, [])
		                          .row(2, [[30], ["gd"]])
		                          .row(3, [["ah"],["ah"]])
		                          .row(4, [,["qas"]])
		                          .row(5, [[2], ["gd"]])
		                          .row(6, [[8],["ah"]]).done();
		
		var stat1 = filter.init();
		
		var data = {col:1,set:{and:1,rules:[{v:2,"op":">="},{v:30,op:"<"}]},s:[],h:[]};
		filter.updateRule(data, true);
		
		var data = {col:1,set:{and:1,rules:[{v:3,"op":">"}]},s:[],h:[]};
		filter.updateRule(data, true);
		
		expect(data.s).toEqual([2]);
		expect(data.h).toEqual([5]);
	});
});