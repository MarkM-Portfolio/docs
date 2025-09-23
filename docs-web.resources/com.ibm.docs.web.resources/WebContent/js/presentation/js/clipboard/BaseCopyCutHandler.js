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

dojo.provide("pres.clipboard.BaseCopyCutHandler");
dojo.require("pres.clipboard.ClipboardHandler");

dojo.declare("pres.clipboard.BaseCopyCutHandler", pres.clipboard.ClipboardHandler, {

	setContent: function(json, html, isCut)
	{
		var focusMgr = pe.scene.hub.focusMgr;
		this.copyBin = focusMgr.getCopyBin();
		this.copyBin.innerHTML = html;
		this.copyBin.contentEditable = true;
		this.focusBefore = document.activeElement;
		if (pe.safariEditingCopyCut)
		{
			delete pe.safariEditingCopyCut;
		}
		else
			this.selectRange(this.copyBin);
		this.storage.setData(json);
		console.log("==BaseCopyCutHandler:setContent to copyBin==S2");
		setTimeout(dojo.hitch(this, this.focusBack), 10);
	},

	copySelectedItems: function(isCut)
	{
		if (!pe.inCutAction)
			isCut = false;
		else
		{
			delete pe.inCutAction;
		}
		console.log("==BaseCopyCutHandler:copySelectedItems==S1");
		var focusMgr = pe.scene.hub.focusMgr;
		var vf = focusMgr.getVirtualFocus();
		var slideEidtor = pe.scene.slideEditor;
		var slideSorter = pe.scene.slideSorter;
		var docUUId = window.pe.scene.bean.getUri();
		var jsonContent = '';
		var htmlContent = '';
		this.curEditingBox = null;
		// Here is for copy content in editing mode
		if (vf == focusMgr.VIRTUAL_FOCUS_SLIDE_BOX || vf == focusMgr.VIRTUAL_FOCUS_NOTES_BOX)
		{
			this.curEditingBox = pe.scene.editor.getEditingBox();
			if (this.curEditingBox)
			{
				clearTimeout(this.resumeSpellCheckTimeout);
				this.curEditingBox.editor.pauseSpellCheck();
				this.curEditingBox.editor.updateView();
				var id = "pres_" + new Date().valueOf();
				htmlContent = "<div id='" + id + "' _docUUID='" + docUUId + "' class='presCopyPaste copyTexts'><div class='copyBinDiv'>&nbsp;</div>";
				jsonContent = {
					id: id,
					_docUUID: docUUId,
					_copyType: "copyTexts",
					arr: []
				};
				if(this.curEditingBox.element.table)
					pe.scene.fixedTableFontsize = true;
				// prepare content data by selection range.
				var sModel = this.curEditingBox.editor.mContentModel.getSelectedContentModel();
				if (sModel.istable)
				{
					jsonContent.istable = true;
				}
				var tmpDiv = sModel.dom;
				if (tmpDiv)
				{
					tmpDiv = this.copypasteutil.getEncodedHtmlDom(tmpDiv);
					this.copypasteutil.buildNewID(tmpDiv);
					htmlContent += tmpDiv.innerHTML;
					dojo.destroy(tmpDiv);
				}
				var tmpJosn = sModel.json;
				if (tmpJosn)
				{
					var encodedJson = this.copypasteutil.getEncodedJson(tmpJosn);
					jsonContent.arr.push(encodedJson);
				}
				if(this.curEditingBox.element.table)
					delete pe.scene.fixedTableFontsize;
				htmlContent += "</div><div class='copyBinDiv'>&nbsp;</div>";
				if(isCut)
				{
					if(jsonContent.istable)
					{
						dojo.publish("/command/exec", ['table_clear_cell']);
					}
					else
					{
						var textCell = null;
						var editor = this.curEditingBox.editor;
						if (editor.mContentModel.mSelectTxtCells.length == 1)
						{
							textCell = editor.mContentModel.mSelectTxtCells[0];
						}
						else
						{
							textCell = editor.mContentModel.mTxtCells[0];
						}
						if(textCell)
						{
							if(jsonContent.arr[0] && jsonContent.arr[0].paragraphs.length!=0){
								textCell.handleDetete(false);
								editor.updateView();
								this.curEditingBox.notifyUpdate();	
							}
						}
					}
				}
				this.setContent(jsonContent, htmlContent, isCut);
				this.resumeSpellCheckTimeout = setTimeout(dojo.hitch(this, this.curEditingBox.editor.resumeSpellCheck), 500);
			}
		}
		else
		{
			// here is for copy objects or slides, if no selectedBoxs then copy slide
			if (vf == focusMgr.VIRTUAL_FOCUS_SLIDE_EDITOR)
			{
				var boxes = slideEidtor.getSelectedBoxes();
				if (boxes.length > 0)
				{
					var id = "pres_" + new Date().valueOf();
					htmlContent = "<div id='" + id + "' _docUUID='" + docUUId + "' class='presCopyPaste copyObjects'><div class='copyBinDiv'>&nbsp;</div>";
					jsonContent = {
						id: id,
						_docUUID: docUUId,
						_copyType: "copyObjects",
						arr: []
					};
					dojo.forEach(boxes, function(box)
					{
						var ele = box.element;
						var h = ele.getHTML();
						
						// Change ids for shape for chrome. Add a "_copy" suffix
						// Because those html will be put into copybin
						// and then pasteBin when paste. In the end of paste,
						// pastBin.innerHTML will be given a empty string
						// This will destroy all defs in shape svg
						// and in chrome copied shape object fill will be impacted.
						var shapeUtil = pres.utils.shapeUtil;
						if (!dojo.isIE && shapeUtil.isShape(ele))
						{
							var tmpDom = dojo.create("div", {}, null);
							tmpDom.innerHTML = h;
							pres.utils.shapeUtil.fixShapeIds(tmpDom.childNodes[0]);
							h = tmpDom.innerHTML;
							dojo.destroy(tmpDom);
						}
						
						htmlContent += h;

						var encodedJson = this.copypasteutil.getEncodedJson(ele);
						jsonContent.arr.push(encodedJson);
					}, this);

					htmlContent += "</div><div class='copyBinDiv'>&nbsp;</div>";
					isCut && dojo.publish("/box/to/delete", [boxes]);
					this.setContent(jsonContent, htmlContent, isCut);
				}
				else
				{
					vf = focusMgr.VIRTUAL_FOCUS_SORTER;
				}
			}
			if (vf == focusMgr.VIRTUAL_FOCUS_SORTER)
			{
				var thumbs = slideSorter.getSelectedThumbs();
				var slides = dojo.map(thumbs, function(t)
				{
					return t.slide;
				});
				if (isCut && slideSorter.isSelectionLocked())
				{
					pe.scene.openLockMessageDialog(slides);
					return;
				}
				var id = "pres_" + new Date().valueOf();
				htmlContent = "<div id='" + id + "' _docUUID='" + docUUId + "' class='presCopyPaste copySlides'><div class='copyBinDiv'>&nbsp;</div>";
				jsonContent = {
					id: id,
					_docUUID: docUUId,
					_copyType: "copySlides",
					arr: []
				};
				dojo.forEach(thumbs, function(thumb)
				{
					var slide = thumb.slide;
					var h = slide.getHTML();
					htmlContent += h;

					var encodedJson = this.copypasteutil.getEncodedJson(slide);
					jsonContent.arr.push(encodedJson);
				}, this);

				htmlContent += "</div><div class='copyBinDiv'>&nbsp;</div>";
				if (isCut)
				{
					dojo.publish("/sorter/to/delete", [thumbs]);
				}
				this.setContent(jsonContent, htmlContent, isCut);
			}
		}

		return {
			copyJson: jsonContent,
			copyHtml: htmlContent
		};
	},

	focusBack: function()
	{
		if (!pe.scene.hub.focusMgr.isCopyPasteIssueCases())
		{
			this.copyBin && (this.copyBin.contentEditable = false);
			this.focusBefore && this.focusBefore.focus();
		}
		delete pe.copyPasteIssueCases;
		delete pe.inCutAction;
		delete pe.inCopyPasteAction;
		this.curEditingBox && this.curEditingBox.editor.renderSelection();
		console.log("==BaseCopyCutHandler:focusBack==S_End");
	},

	selectRange: function(node)
	{
		if (dojo.isSafari)
			node.focus();
		else if (document.activeElement)
			document.activeElement.blur();
		if (document.createRange && window.getSelection)
		{
			var sel = window.getSelection();
			try
			{
				sel.removeAllRanges();
			}
			catch (e)
			{
			}
			var range = document.createRange();
			try
			{
				range.selectNodeContents(node);
			}
			catch (e)
			{
				range.selectNode(node);
			}
			sel.addRange(range);
		}
		else if (document.body.createTextRange)
		{
			var range = document.body.createTextRange();
			range.moveToElementText(node);
			range.select();
		}
	}

});