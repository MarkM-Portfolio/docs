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

dojo.provide("pres.test.api.slide.move_slides");
dojo.require("pres.test.api.utils.util");

apiTest(function() {
	describe("pres.test.api.slide.move_slides", function() {
		it.asyncly("move slide up", function() {
			var sorter = pe.scene.slideSorter;
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			var children2 = children[1];
			var slide = doc.getSlides()[1];
			// move slide up
			sorter.selectItems(1, 1, 0);
			sorter.moveSlidesDir(true);
			// Model
			expect(doc.getSlides()[0] == slide).toBe(true);
			// UI
			var sorter = pe.scene.slideSorter;
			var children = sorter.getChildren();
			expect(children2 == children[0]).toBe(true);

			// Undo
			pres.test.api.utils.util.undo();
			var children = sorter.getChildren();
			expect(children2 == children[0]).toBe(false);

			// Test reload UI.
			return softReload(function() {
				var sorter = pe.scene.slideSorter;
				var children = sorter.getChildren();
				expect(children2 == children[0]).toBe(false);
			});
		});
		it.asyncly("move slide down", function() {
			var sorter = pe.scene.slideSorter;
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			var children2 = children[1];
			var slide = doc.getSlides()[1];
			// move slide down
			sorter.selectItems(0, 0);
			sorter.moveSlidesDir(false);
			// Model
			expect(doc.getSlides()[0] == slide).toBe(true);
			// UI
			var sorter = pe.scene.slideSorter;
			var children = sorter.getChildren();
			expect(children2 == children[0]).toBe(true);

			// Undo
			pres.test.api.utils.util.undo();
			var children = sorter.getChildren();
			expect(children2 == children[0]).toBe(false);

			// Test reload UI.
			return softReload(function() {
				var sorter = pe.scene.slideSorter;
				var children = sorter.getChildren();
				expect(children2 == children[0]).toBe(false);
			});

		});
		it.asyncly("drag and drop to move one slide before target slide",
				function() {
					var sorter = pe.scene.slideSorter;
					var doc = pe.scene.doc;
					var children = sorter.getChildren();
					var children2 = children[1];
					var slide = doc.getSlides()[1];
					// move one slide before target slide
					sorter.selectItems(1, 1, 0);
					sorter.moveSlides(3, true);
					expect(doc.getSlides()[2] == slide).toBe(true);
					// UI
					var sorter = pe.scene.slideSorter;
					var children = sorter.getChildren();
					expect(children2 == children[2]).toBe(true);

				});
		it.asyncly("drag and drop to move multi slides after target slide",
				function() {
					var sorter = pe.scene.slideSorter;
					var doc = pe.scene.doc;
					var children = sorter.getChildren();
					var children2 = children[1];
					var children22 = children[0];
					var slide = doc.getSlides()[1];
					var slide2 = doc.getSlides()[0];
					// move multi slides after target slide
					sorter.selectItems(0, 1, 0);
					sorter.moveSlides(3, false);
					expect(doc.getSlides()[3] == slide).toBe(true);
					expect(doc.getSlides()[2] == slide2).toBe(true);
					// UI
					var sorter = pe.scene.slideSorter;
					var children = sorter.getChildren();
					expect(children2 == children[3]).toBe(true);
					expect(children22 == children[2]).toBe(true);
				});
	});
});