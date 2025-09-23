define([
	"dojo/dom-construct",
	"dojo/dom-style",
	"writer/controller/Cursor"
], function (domConstruct, domStyle, Cursor) {

	describe("writer.test.ut.indicator.cursor", function() {
		
		concord.util.user.getUserFullName = function(){
			return "aaa";
		}
		
		it("cursor init", function(){
			
			var shell = {};
			var shellDom = domConstruct.create("div", {}, document.body);
			shell.domNode = function(){
				return shellDom;
			}
			var cursor = new Cursor({
				userId: "xx",
				color: "#303030",
				blinkable: false,
				shell: shell
			});
			
			expect(cursor._blinkable).toEqual(false);
			expect(cursor._userId).toEqual("xx");
			
			cursor.show();
			expect(domStyle.get(cursor._domNode, "display")).toEqual("block");
			expect(domStyle.get(cursor._domNode, "visibility")).toEqual("visible");
			
			cursor.hide();
			expect(domStyle.get(cursor._domNode, "visibility")).toEqual("hidden");
		});
		
		it("cursor co-editor-indicator", function(){
			var shell = {};
			var shellDom = domConstruct.create("div", {id: "editor"}, document.body);
			shell.domNode = function(){
				return shellDom;
			}
			var cursor = new Cursor({
				userId: "xx",
				color: "#303030",
				blinkable: false,
				shell: shell
			});
			
			cursor.hide();
			
			cursor.showCoEditIndicator();
			expect(cursor.coEditIndicator == null).toEqual(true);
			
			cursor.show();
			
			cursor.showCoEditIndicator();
			expect(cursor.coEditIndicator == null).toEqual(false);
			expect(cursor.coEditIndicator.domNode.parentNode).toEqual(shellDom);
			
			cursor.posCoEditIndicator();
			cursor.detachCoEditIndicator()
			expect(cursor.coEditIndicatorAnim == null).toEqual(true);
			expect(cursor.coEditIndicator).toEqual(null);
			
			cursor.showCoEditIndicator();
			cursor.detachCoEditIndicator(true);
			expect(cursor.coEditIndicator == null).toEqual(false);
			expect(cursor.coEditIndicatorAnim == null).toEqual(false);
			
			cursor.destroy();
			expect(cursor.coEditIndicator == null).toEqual(true);
			expect(cursor.coEditIndicatorAnim == null).toEqual(true);
		});
		
	});

});