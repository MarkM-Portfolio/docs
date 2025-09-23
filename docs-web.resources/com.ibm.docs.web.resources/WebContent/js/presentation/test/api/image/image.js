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

dojo.provide("pres.test.api.image.image");
dojo.require("pres.handler.ElementHandler");


apiTest(function() {
	describe("res.test.api.image.image", function() {
		it.asyncly("insert image", function() {
			var sorter = pe.scene.slideSorter;
			var doc = pe.scene.doc;
			var children = sorter.getChildren();
			sorter.selectItems(0, 0);
			var slide = pe.scene.slideEditor.slide;

			
			var params={
					gallery: true,
					name: "Arrow 01 Gray",
					pos: null,
					url: "Pictures/Arrow01_Gray.png"
					};
			setTimeout(function(){
				pres.handler.ElementHandler.boxToCreateImage(slide,params);
			}, 500);
			
			
//			// Model
//			expect(doc.getSlides().length).toBe(length + 1);
//			// UI
//			var children = sorter.getChildren();
//			expect(children.length).toBe(uiLength + 1);
//			// Undo
//			var c = pres.constants;
//			dojo.publish("/command/exec", [ c.CMD_UNDO ]);
//			var children = sorter.getChildren();
//			expect(children.length).toBe(uiLength);
//			// Redo
//			dojo.publish("/command/exec", [ c.CMD_REDO ]);
//			var children = sorter.getChildren();
//			expect(children.length).toBe(uiLength + 1);
//
//			// Test reload UI.
//			return softReload(function() {
//				var sorter = pe.scene.slideSorter;
//				var children = sorter.getChildren();
//				expect(children.length).toBe(uiLength + 1);
//			});
		});

	});
});