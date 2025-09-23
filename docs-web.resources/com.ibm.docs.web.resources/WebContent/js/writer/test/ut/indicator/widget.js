define([
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"writer/ui/widget/CoEditIndicator"
], function (domClass, domConstruct, domStyle, CoEditIndicator) {

	describe("writer.test.ut.indicator.widget", function() {
			
		it("widget init", function(){
			var widget = new CoEditIndicator({userId:"xx"});
			expect(widget.userId).toEqual("xx")
			expect(widget.domNode.parentNode).toEqual(document.body);
		});
		
		it("widget init not for cursor", function(){
			var widget = new CoEditIndicator({userId:"xx", forCursor: false});
			expect(widget.userId).toEqual("xx")
			expect(widget.forCursor).toEqual(false)
			expect(domClass.contains(widget.domNode, "forLine")).toEqual(true);
			expect(widget.domNode.parentNode).toEqual(document.body);
		});
		
		it("widget show and hide", function(){
			var widget = new CoEditIndicator({userId:"xx"});
			var span = domConstruct.create("div", {style:{
				position:"absolute",
				top: "10px",
				left: "10px",
				width: "200px",
				height: "200px"
			}}, document.body);
			
			widget.show(span);
			expect(domStyle.get(widget.domNode, "display")).toEqual("block");
			widget.hide();
			expect(domStyle.get(widget.domNode, "display")).toEqual("none");
			span.style.display = "none";
			widget.show(span);
			expect(domStyle.get(widget.domNode, "display")).toEqual("none");
			widget.destroy();
		});
		
		it("widget show and hide for line", function(){
			var widget = new CoEditIndicator({userId:"xx", forCursor: false});
			var span = domConstruct.create("div", {style:{
				position:"absolute",
				top: "10px",
				left: "10px",
				width: "200px",
				height: "200px"
			}}, document.body);
			widget.show(span, span);
			expect(domStyle.get(widget.domNode, "display")).toEqual("block");
			widget.hide();
			expect(domStyle.get(widget.domNode, "display")).toEqual("none");
			span.style.display = "none";
			widget.show(span, span);
			expect(domStyle.get(widget.domNode, "display")).toEqual("none");
			widget.destroy();
		});
		
		
	});

});