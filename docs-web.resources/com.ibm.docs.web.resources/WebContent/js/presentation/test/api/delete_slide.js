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

dojo.provide("pres.test.api.delete_slide");

apiTest(function()
{
	describe("pres.test.api.delete_slide", function()
	{
		it.asyncly("delete slide 0", function()
		{
			var sorter = pe.scene.slideSorter;
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			var uiLength = children.length;
			var length = doc.getSlides().length;
			var slide = doc.getSlides()[0];
			
			sorter.selectItems(1,1);
			sorter.deleteSlides();

			// Model
			expect(doc.getSlides().length).toBe(length - 1);
			var isSlideDeleted = dojo.every(doc.getSlides(), function(s){
				return s != slide;
			});
			expect(isSlideDeleted).toBe(true);
			
			// UI
//			children = sorter.getChildren();
			expect(children.length).toBe(uiLength - 1);
			var isSlideDeletedUI = dojo.every(children, function(thumb){
				return thumb.slide != slide;
			});
			
			expect(isSlideDeletedUI).toBe(true);
			
			// Test reload UI.
			return softReload(function(){
				var sorter = pe.scene.slideSorter;
				var children = sorter.getChildren();
				expect(children.length).toBe(uiLength - 1);
			});
		});

		it("test2", function(){
			expect(1).toBe(1);
		});
		
		/*
		it("undo delete slide 0", function()
		{
			var doc = pe.scene.doc;
			var length = doc.getSlides().length;
			var sorter = pe.scene.slideSorter;
			var children = sorter.getChildren();
			var uiLength = children.length;
			
			var c = pres.constants;
			dojo.publish("/command/exec", [c.CMD_UNDO]);

			var children = sorter.getChildren();
			
			expect(doc.getSlides().length).toBe(length + 1);
			expect(children.length).toBe(uiLength + 1);
		});
		*/
	});

});