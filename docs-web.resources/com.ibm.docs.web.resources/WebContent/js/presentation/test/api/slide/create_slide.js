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

dojo.provide("pres.test.api.slide.create_slide");
dojo.require("pres.test.api.utils.util");

apiTest(function() {
	describe("pres.test.api.slide.create_slide", function() {
		it.asyncly("insert slide after slide2", function() {
			var sorter = app.pe.scene.slideSorter;
			var doc = app.pe.scene.doc;
			var children = sorter.getChildren();
			var uiLength = children.length;
			var length = doc.getSlides().length;

			sorter.selectItems(1, 1, 0);
			sorter.createSlide();
			// Model
			expect(doc.getSlides().length).toBe(length + 1);
			// UI
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength + 1);
			// Undo
			pres.test.api.utils.util.undo();
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength);
			// Redo
			pres.test.api.utils.util.redo();
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength + 1);

			// Test reload UI.
			pres.test.api.utils.util.reload();

			var checkAfterRealod = function () {
				var sorter = app.pe.scene.slideSorter;
				var children = sorter.getChildren();
				expect(children.length).toBe(uiLength + 1);
				
			};
			return pres.test.api.utils.util.verifyWhenLoadFinished(checkAfterRealod);
			
			
//			return softReload(function() {
//				var sorter = pe.scene.slideSorter;
//				var children = sorter.getChildren();
//				expect(children.length).toBe(uiLength + 1);
//			});
		});
		//enable it after dev fix undefined error.
		xit.asyncly("Slide number limitation is 75", function() {
			var sorter = pe.scene.slideSorter;
			sorter.selectItems(0, 0);
			for ( var x = 0; x <= 69; x++) {
				sorter.createSlide();
			}
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			var uiLength = children.length;
			var length = doc.getSlides().length;
			expect(uiLength).toBe(75);
			expect(length).toBe(75);
		});
	});
});