dojo.provide("writer.tests.UTcases.indicator.widget");
dojo.require("writer.ui.widget.CoEditIndicator");

describe("writer.tests.UTcases.indicator.widget", function() {
	
	var loadTestData = function(){
		
		var jsonData = {"body":[{"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]}]};
		
		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		pe.lotusEditor.styles = new writer.model.style.Styles({});
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		pe.lotusEditor.relations.loadContent();
		pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
		
		pe.lotusEditor.getScale = function(){
			return 1;
		}
		
		return pe.lotusEditor.document;
	};
	
	beforeEach(function() {
		loadTestData();
	});
	
	afterEach(function() {
		
	});
	
	it("widget init", function(){
		var widget = new writer.ui.widget.CoEditIndicator({userId:"xx"});
		expect(widget.userId).toEqual("xx")
		expect(widget.domNode.parentNode).toEqual(dojo.body());
	});
	
	it("widget init not for cursor", function(){
		var widget = new writer.ui.widget.CoEditIndicator({userId:"xx", forCursor: false});
		expect(widget.userId).toEqual("xx")
		expect(widget.forCursor).toEqual(false)
		expect(dojo.hasClass(widget.domNode, "forLine")).toEqual(true);
		expect(widget.domNode.parentNode).toEqual(dojo.body());
	});
	
	it("widget show and hide", function(){
		var widget = new writer.ui.widget.CoEditIndicator({userId:"xx"});
		var span = dojo.create("div", {style:{
			position:"absolute",
			top: "10px",
			left: "10px",
			width: "200px",
			height: "200px"
		}}, dojo.body());
		
		widget.show(span);
		expect(dojo.style(widget.domNode, "display")).toEqual("block");
		widget.hide();
		expect(dojo.style(widget.domNode, "display")).toEqual("none");
		span.style.display = "none";
		widget.show(span);
		expect(dojo.style(widget.domNode, "display")).toEqual("none");
		widget.destroy();
	});
	
	it("widget show and hide for line", function(){
		var widget = new writer.ui.widget.CoEditIndicator({userId:"xx", forCursor: false});
		var span = dojo.create("div", {style:{
			position:"absolute",
			top: "10px",
			left: "10px",
			width: "200px",
			height: "200px"
		}}, dojo.body());
		widget.show(span, span);
		expect(dojo.style(widget.domNode, "display")).toEqual("block");
		widget.hide();
		expect(dojo.style(widget.domNode, "display")).toEqual("none");
		span.style.display = "none";
		widget.show(span, span);
		expect(dojo.style(widget.domNode, "display")).toEqual("none");
		widget.destroy();
	});
	
	
});