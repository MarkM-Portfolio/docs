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

dojo.provide("pres.test.api.slide.copyPaste_slide");
dojo.require("pres.test.api.utils.slideUtil");
dojo.require("pres.test.api.utils.util");

apiTest(function()
{
	describe("pres.test.api.slide.copyPaste_slide", function()
	{
		it("copy paste 1 slide in one file.", function()
		{
			var sorter = app.pe.scene.slideSorter;
			var doc = app.pe.scene.doc;
			var children = sorter.getChildren();
			var uiLength = children.length;
			var length = doc.getSlides().length;
			var slideEditor = app.pe.scene.slideEditor;
			var modelSlideLength = doc.getSlides().length;
			var slide = doc.getSlides()[0];
			
			var copyHandler = app.pe.scene.hub.commandHandler.copyHandler;
			sorter.selectItemsByIndex([0]);
			
			var copiedObject = copyHandler.copySelectedItems();

			//after copy, before paste
			var elementsOnEditorCopied = pres.test.api.utils.slideUtil.getEditorElements(slideEditor);
			var notesEditor = app.pe.scene.notesEditor;
			var notesNodeCopied = pres.test.api.utils.slideUtil.getEditorElements(notesEditor);
			sorter.selectItemsByIndex([3]);
			var pasteHandler = app.pe.scene.hub.commandHandler.pasteHandler;
			
			pasteHandler.onPasteByKey(null, null, null, copiedObject.copyJson);
			
			var pastedSlide = doc.getSlides()[4];
			// Model
			expect(doc.getSlides().length).toBe(length + 1);
			expect(pastedSlide.getElements().length).toBe(slide.getElements().length);
			var sourceElements = slide.getElements();
			var pastedElements = pastedSlide.getElements();
			
			var bIsAllElementsPaste = pres.test.api.utils.util.compareElements(sourceElements, pastedElements);
			expect(bIsAllElementsPaste).toBe(true);

		
			
			//UI check
			var elementsOnEditorPasted = pres.test.api.utils.slideUtil.getEditorElements(slideEditor);
			var elementsCopiedLength = elementsOnEditorCopied.length;
			var elemetesPastedLength = elementsOnEditorPasted.length;
			expect(elementsCopiedLength).toBe(elementsOnEditorPasted.length);
			var elementsOnEditorPasted = pres.test.api.utils.slideUtil.getEditorElements(slideEditor);
			var bIsAllElemetnsOnUIPasted = pres.test.api.utils.util.compareNodes(elementsOnEditorCopied, elementsOnEditorPasted);
			expect(bIsAllElemetnsOnUIPasted).toBe(true);
			var notesNodePasted = pres.test.api.utils.slideUtil.getEditorElements(notesEditor);
			var bIsNotesPasted = pres.test.api.utils.util.compareDomNode(notesNodeCopied[0], notesNodePasted[0]);
			expect(true).toBe(bIsNotesPasted);
			
			pres.test.api.utils.util.reload();

			var checkAfterRealod = function () {
				doc = app.pe.scene.doc;
				expect(doc.getSlides().length).toBe(length + 1);
				sorter = app.pe.scene.slideSorter;
				sorter.selectItemsByIndex([4]);
				var pastedSlideAfterF5 = doc.getSlides()[4];
				var pastedElementsModelAfterF5 = pastedSlideAfterF5.getElements();
				var bIsAllElementsPasteF5 = pres.test.api.utils.util.compareElements(pastedElementsModelAfterF5, pastedElements);
			    expect(bIsAllElementsPasteF5).toBe(true);
				
			};
			return pres.test.api.utils.util.verifyWhenLoadFinished(checkAfterRealod);
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
	}, 20*1000);

});