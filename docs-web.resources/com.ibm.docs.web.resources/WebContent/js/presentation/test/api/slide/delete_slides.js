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

dojo.provide("pres.test.api.slide.delete_slides");
dojo.require("pres.test.api.utils.util");

apiTest(function() {
	describe("pres.test.api.slide.delete_slides", function() {
		it.asyncly("delete continuous slides", function() {
			var sorter = pe.scene.slideSorter;
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			var uiLength = children.length;
			var length = doc.getSlides().length;

			sorter.selectItems(1, 2);
			sorter.deleteSlides();
			// Model
			expect(doc.getSlides().length).toBe(length - 2);
			// UI
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength - 2);
			// Undo
			pres.test.api.utils.util.undo();
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength);
			// Test reload UI.
			return softReload(function() {
				var sorter = pe.scene.slideSorter;
				var children = sorter.getChildren();
				expect(children.length).toBe(uiLength);
			});
		});
		it.asyncly("delete uncontinuous slides", function() {
			var sorter = pe.scene.slideSorter;
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			var uiLength = children.length;
			var length = doc.getSlides().length;

			sorter.selectItemsByIndex([ 1, 3 ]);
			sorter.deleteSlides();
			// Model
			expect(doc.getSlides().length).toBe(length - 2);
			// UI
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength - 2);
			// Undo
			pres.test.api.utils.util.undo();
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength);
			// Redo
			pres.test.api.utils.util.redo();
			var children = sorter.getChildren();
			expect(children.length).toBe(uiLength - 2);
			// Test reload UI.
			return softReload(function() {
				var sorter = pe.scene.slideSorter;
				var children = sorter.getChildren();
				expect(children.length).toBe(uiLength - 2);
			});
		});
	});
});