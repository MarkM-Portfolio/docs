/* *************************************************************** */
/*                                                                 */
/* HCL Confidential                                                */
/*                                                                 */
/* OCO Source Materials                                            */
/*                                                                 */
/* Copyright HCL Technologies Limited 2012, 2020                   */
/*                                                                 */
/* The source code for this program is not published or otherwise  */
/* divested of its trade secrets, irrespective of what has been    */
/* deposited with the U.S. Copyright Office.                       */
/*                                                                 */
/* *************************************************************** */
dojo.provide("pres.clipboard.PasteHandler");
dojo.require("pres.clipboard.ClipboardHandler");
dojo.declare("pres.clipboard.PasteHandler", pres.clipboard.ClipboardHandler, {

	handle: function(e, eventText, eventHtml, divHtml)
	{
		if (e && (e.type == "keydown" || e.type == "paste"))
		{
			try{
				this.onPasteByKey(eventText, eventHtml, divHtml);
			}catch(e){
				console.log("==onPasteByKey:onPasteByKey==error:"+e);
				delete pe.inCopyPasteAction;
				delete pe.copyPasteIssueCases;
			}
		}
		else
		{
			this.showNotSupportDialog("paste");
		}
	},

	/*
	 * pasteJsonData : used for automation test, if have pasteJsonData, then use it directly
	 */
	onPasteByKey: function(pasteText, pasteHtml, pasteBin, pasteJsonData)
	{
		console.log("==onPasteByKey:onPasteByKey==S2");
		console.info("onPaste eventText: " + pasteText);// + "\n eventHTML: " + pasteHtml + " \n divHtml: " + pasteBin.innerHTML);
		var needBContentModelforExternal = false;
		var isExternalmode = false;
		var pasteJson;
		if (pasteJsonData)
			pasteJson = pasteJsonData;
		else
		{
			// TODO:ZY current not support system clipboard
			if (dojo.query('div.presCopyPaste', pasteBin).length > 0)
			{
				pasteJson = this.storage.getData();
			}
			else
			{
				if (pasteText && !dojo.isIE && !dojo.isFF && !dojo.isEdge)
				{
					if ((pasteHtml == pasteText) || !pasteHtml)
					{
						isExternalmode = true;
						var ps = pasteText.split('\n');
						pasteHtml = '';
						for ( var i = 0; i < ps.length; i++)
						{
							var content = ps[i] ? ps[i] : '&nbsp;';
							content = concord.util.acf.escapeXml(content);
							pasteHtml += '<p><span>' + content + '</span></p>';
						}
					}
					pasteBin.innerHTML = pasteHtml;
					var bcontent = pasteBin.innerHTML;
					if (!bcontent)
					{
						pasteBin.innerHTML = pasteHtml;
					}
				}

				// need to parse content in System clicboard to json model.
				// table to element, image in FF to element. others to text
				var docUUId = window.pe.scene.bean.getUri();
				var id = "pres_" + new Date().valueOf();
				pasteJson = {
					id: id,
					_docUUID: docUUId,
					_copyType: "copyObjects",
					arr: []
				};
				var result = this.pasteImages(pasteBin, pasteJson);
				if (result == 'noimages')
				{
					if (this.sizeLimitationCheck(pasteBin))
					{
						return false;
					}
					this.copypasteutil.processClipboardData(pasteBin);
					result = this.pasteTables(pasteBin, pasteJson);
					if (result == 'notables')
					{
						pasteJson._copyType = "copyTexts";
						var htmlContent = pasteBin.innerHTML;
						if (!htmlContent)
							return false;
						// TODO paste TEXT
						// var contentModel = EditorUtil.buildmContentModelfromHtml(htmlContent);
						// var encodedJson = this.copypasteutil.getEncodedJson(contentModel);
						// pasteJson.arr.push(encodedJson);
						this.curEditingBox = pe.scene.editor.getEditingBox();
						if (this.curEditingBox)
						// paste content to textbox
						{
							var editor = this.curEditingBox.editor;
							var decodedParagraphs = editor.mContentModel.buildModelfromHtml(htmlContent);
							var encodedJson = this.copypasteutil.getEncodedJson(decodedParagraphs);
							pasteJson.arr.push(encodedJson);
						}
						else
						{
							needBContentModelforExternal = true;
						}
					}
				}
			}
		}

		if (!pasteJson)
			return false;

		var pasteType = pasteJson._copyType;
		var sourceDocUUID = pasteJson._docUUID;

		var newSlide = null;
		var isFromExternalPresentationFile = !(sourceDocUUID == window.pe.scene.bean.getUri());
		if (isFromExternalPresentationFile)
			this.copypasteutil.setExternalMode("within_pres");
		else
			this.copypasteutil.setExternalMode("within_file");

		if (pasteType == 'copyObjects')
		{
			console.info("==onPasteByKey:copyObjects==S3");
			// paste objects on current slide
			var elems = [];
			var deviation = {
				l: 0,
				t: 0
			};
			var hasDeviation = false;

			var zArray = this.copypasteutil.sortZIndexArray(pasteJson.arr);
			for ( var i = 0; i < zArray.length; i++)
			{
				var element = pasteJson.arr[zArray[i].index];

				var decodedElement = this.copypasteutil.getDecodedJson(element, !isFromExternalPresentationFile);
				var elem = null;
				var blockPaste = false;
				if (decodedElement.emptyPlaceholder)
				{
					blockPaste = true;
				}
				else if (decodedElement.family == 'table' && decodedElement.table)
				{
					elem = new pres.model.TableElement(decodedElement);
					blockPaste = elem.table.hasMerge();
				}
				else if (decodedElement.family == 'group')
				{
					elem = new pres.model.ShapeElement(decodedElement);
				}
				else
					elem = new pres.model.Element(decodedElement);
				if(elem){
					var blockRotated = (pres.utils.htmlHelper.extractStyle(elem.attrs.style)["transform"]) && (DOC_SCENE.extension != "pptx" || (DOC_SCENE.extension == "pptx" && DOC_SCENE.isOdfDraft));
					blockPaste = blockRotated || blockPaste || (isFromExternalPresentationFile && (pres.utils.shapeUtil.isShape(elem) || (elem.attrs['class'] && elem.attrs['class'].indexOf('draw_custom-shape') > 0)));
				}
				if (!blockPaste)
				// Disable paste merge table.
				{
					if (!hasDeviation)
					{
						hasDeviation = true;
						var orgL = elem.l;
						var orgT = elem.t;
						elem = pe.scene.slideEditor.getNewPastePosition(elem);
						deviation.l = elem.l - orgL;
						deviation.t = elem.t - orgT;
					}
					else
					{
						elem.l += deviation.l;
						elem.t += deviation.t;
					}

					// Update shape frm model
					if (pres.utils.shapeUtil.isShape(elem) && elem.svg)
					{
						elem.svg.updateShapeFrmLT(elem.l, elem.t);
					}

					pres.utils.helper.setIDToModel(elem, true);
					elems.push(elem);
				}
			}
			dojo.publish("/box/to/paste", [elems]);
			pasteBin.blur();
			pasteBin.focus();
			if(dojo.isSafari < 6)
			{
			//D47322: [MVC][Regression][Safari5]After copy/paste a object, focus on the new paste object, cut not work
			//The pasteBin doesn't get the focus so can't receive the copy/paste event. fix it here.
				setTimeout(dojo.hitch(this, function()
				{
					pasteBin.blur();
					pasteBin.focus();
				}, 300));
			}
		}
		else if (pasteType == 'copySlides')
		{
			console.info("==onPasteByKey:copySlides==S3");
			if (isFromExternalPresentationFile)
			{
				// copy slides move elements to new
				var selectedSlide = pe.scene.slideEditor.slide;
				var newSlide = selectedSlide.toJson(true);
				newSlide = this.copypasteutil.removeEditableObjects(newSlide);
				pe.pasteSlideInSameFile = false;
			}
			else
			{
				pe.pasteSlideInSameFile = true;
			}
			// paste slides after current slide
			var elems = [];
			dojo.forEach(pasteJson.arr, function(slide)
			{
				var decodedSlide = this.copypasteutil.getDecodedJson(slide, !isFromExternalPresentationFile);
				var pastedSlide = decodedSlide;
				if (isFromExternalPresentationFile && newSlide)
				{
					pastedSlide = dojo.clone(newSlide);
					dojo.forEach(decodedSlide.elements, function(elem)
					{
						if (elem.family != 'background' && elem.family != 'page-number' && elem.family != 'date-time' && elem.family != 'footer' && elem.family != 'header' && !elem.emptyPlaceholder)
							pastedSlide.elements.push(elem);
					}, pastedSlide);
				}
				var sld = new pres.model.Slide(pastedSlide);
				pres.utils.helper.setIDToModel(sld, true);
				var noMTable = [];
				dojo.forEach(sld.elements, function(elem)
				{
					var isMergeTable = (elem.family == 'table' && elem.table && elem.table.hasMerge());
					var isShapeCrossfile = (isFromExternalPresentationFile && (pres.utils.shapeUtil.isShape(elem) || (elem.attrs['class'] && elem.attrs['class'].indexOf('draw_custom-shape') > 0)));
					if (!(isMergeTable || isShapeCrossfile))
					{
						noMTable.push(elem);
					}
				}, noMTable);
				sld.elements = noMTable;
				elems.push(sld);
			}, this);
			var selectedThumbs = pe.scene.slideSorter.selectedThumbs;
			var thumbs = pe.scene.slideSorter.getChildren();
			var index = dojo.indexOf(thumbs, selectedThumbs[selectedThumbs.length - 1]);
			dojo.publish("/sorter/to/paste", [elems, index + 1]);
			delete pe.pasteSlideInSameFile;
			pasteBin.blur();
			pasteBin.focus();
		}
		else if (pasteType == 'copyTexts')
		{
			console.info("==onPasteByKey:copyTexts==S3");
			this.curEditingBox = pe.scene.editor.getEditingBox();
			if (pasteJson.istable)
			// paste table to cells or view.
			{
				pe.scene.fixedTableFontsize = true;
				var toCell = false;
				if (this.curEditingBox && this.curEditingBox.element.table && pasteJson.arr.length == 1)
					toCell = true;
				if (!toCell && !isFromExternalPresentationFile)
					pe.keepViewStyle = true;
				var elems = [];
				var deviation = {
					l: 0,
					t: 0
				};
				var hasDeviation = false;
				dojo.forEach(pasteJson.arr, function(element)
				{
					var decodedElement = this.copypasteutil.getDecodedJson(element, !isFromExternalPresentationFile);
					var elem = new pres.model.TableElement(decodedElement);
					if (!elem.table.hasMerge())
					{
						if (!hasDeviation)
						{
							hasDeviation = true;
							var orgL = elem.l;
							var orgT = elem.t;
							elem = pe.scene.slideEditor.getNewPastePosition(elem);
							deviation.l = elem.l - orgL;
							deviation.t = elem.t - orgT;
						}
						else
						{
							elem.l += deviation.l;
							elem.t += deviation.t;
						}
						pres.utils.helper.setIDToModel(elem, true);
						elems.push(elem);
					}
				}, this);
				delete pe.keepViewStyle;
				delete pe.scene.fixedTableFontsize;
				if (toCell)
				{
					var cells = this.curEditingBox.editor.getSelectedTableCells();
					if (!this.curEditingBox.element.table.hasMerge())
						dojo.publish("/table/to/paste/cell", [this.curEditingBox.element, cells, elems]);
				}
				else
					dojo.publish("/box/to/paste", [elems]);
			}
			else
			{
				pe.updateListStyleFromPaste = true;
				if (this.curEditingBox)
				// paste content to textbox
				{
					var cattr = this.curEditingBox.element.attrs;
					var isplaceholder = cattr.presentation_placeholder && (cattr.presentation_class == 'outline');
					var decodedParagraphs = this.copypasteutil.getDecodedJson(pasteJson.arr[0], !isExternalmode, isplaceholder);
					if (this.curEditingBox.element.isNotes)
					{
						var paragraphs = decodedParagraphs.paragraphs;
						dojo.forEach(paragraphs, function(para)
						{
							var spanlist = para.spanList;
							para.lineHeight = 1.2558;
							dojo.forEach(spanlist, function(span)
							{
								span.fontSize = 18;
								span.lineHeight = 1.2558;
								span.fontColor = "#000000";
								span.fontName = "Arial, Helvetica, sans-seri";
							}, this);
						}, this);
					}

					var editor = this.curEditingBox.editor;
					editor.mContentModel.insertModel(decodedParagraphs);
					editor.updateView();
					this.curEditingBox.notifyUpdate();
				}
				else
				// paste content to view box element
				{
					pe.scene.slideEditor.deSelectAll();
					var htmlContent = pasteBin.innerHTML;
					var decodedParagraphs = null;
					if(needBContentModelforExternal)
					{
						if (!htmlContent)
							return false;
					}
					var pos = {
							t:100,
							l:100,
							w:500,
							h:100
						};
					var params = {
						pos: pos
					};
					var elementHandler = pe.scene.hub.elementHandler;
					var element = elementHandler.boxToCreateTextBox(pe.scene.slideEditor.slide, params);
					element = pe.scene.slideEditor.getNewPastePosition(element);
					var slide = pe.scene.slideEditor.slide;
					var index = slide.elements.length;
					element.z = slide.getMaxZ() + 5;
					slide.insertElement(element, index);
					viewC = pe.scene.slideEditor.getChildren();
					var box = viewC.pop();
					var editor = box.editor;
					editor.mContentModel.build(box);
					if(needBContentModelforExternal)
					{
						decodedParagraphs = editor.mContentModel.buildModelfromHtml(htmlContent);
						var encodedJson = this.copypasteutil.getEncodedJson(decodedParagraphs);
						pasteJson.arr.push(encodedJson);
					}
					decodedParagraphs = this.copypasteutil.getDecodedJson(pasteJson.arr[0], !isFromExternalPresentationFile, false);
					if(decodedParagraphs.paragraphs.length == 0)
					{
						slide.deleteElement(element);
					}
					else
					{
						var mselection = editor.mContentModel.mTxtCells[0].selection.start;
						mselection.lineIndex = 0;
						mselection.lineTextOffset = 0;
						editor.mContentModel.insertModel(decodedParagraphs);
						editor.boxOwner = box;
						editor.updateView();
						var content = box.getContent();
						element.setContent(content);
						var msgPub = pe.scene.msgPublisher;
						var act = [msgPub.createInsertElementAct(element, index)];
						var msg = [msgPub.createMessage(MSGUTIL.msgType.Element, act)];
						msgPub.sendMessage(msg);
						box.enterSelection();
					}
					pasteBin.blur();
					pasteBin.focus();
					if(dojo.isSafari < 6)
					{
					//D47322: [MVC][Regression][Safari5]After copy/paste a object, focus on the new paste object, cut not work
					//The pasteBin doesn't get the focus so can't receive the copy/paste event. fix it here.
						setTimeout(dojo.hitch(this, function()
						{
							pasteBin.blur();
							pasteBin.focus();
						}, 300));
					}
				}
				delete pe.updateListStyleFromPaste;
			}
		}
	},
	sizeLimitationCheck: function(pastebin)
	{
		if (pastebin.innerHTML.length > 100 * 1024)
		{
			var tnls = dojo.i18n.getLocalization("concord.widgets", "CKResource");
			var msg = tnls.clipboard.pasteMaxMsg;
			this.showPasteTextErrorDialog(msg);
			return true;
		}
		return false;
	},
	/**
	 * upload image data
	 *
	 * @param img
	 * @param data
	 */
	uploadImageData: function(data)
	{
		dojo.requireLocalization("concord.widgets", "InsertImageDlg");
		var nls = dojo.i18n.getLocalization("concord.widgets", "InsertImageDlg");

		var result = data.match(/^data:image\/([\w]+);base64/);
		if (!result)
			return null;
		var imgeType;
		var types = ['bmp', 'jpg', 'jpeg', 'gif', 'png'];
		for ( var i = 0; i < types.length; i++)
		{
			if (types[i] == result[1])
			{
				imgeType = result[1];
				break;
			}
		}
		if (!imgeType)
		{
			pe.scene.showWarningMessage(nls.unsupportedImage, 2000);
			return null;
		}
		var servletUrl = concord.util.uri.getEditAttRootUri() + "?method=dataUrl";
		;

		pe.scene.showWarningMessage(nls.loading);
		var newUri;

		dojo.xhrPost({
			url: servletUrl,
			handleAs: "json",
			load: function(response)
			{
				newUri = response.uri;
				pe.scene.hideErrorMessage();
			},
			error: function(error)
			{
				console.log('An error occurred:' + error);
				pe.scene.hideErrorMessage();
				ret = null;
			},
			sync: true,
			contentType: "text/plain",
			postData: data
		});
		return newUri;
	},
	pasteImages: function(pastebin, pasteJson)
	{
		var result = false;
		var htmlContent = pastebin.innerHTML;
		if (!htmlContent || htmlContent.toLowerCase().indexOf('<img') == -1)
			return "noimages";
		var imgContent = "";
		var images = pastebin.getElementsByTagName('img');
		for ( var i = 0; i < images.length; i++)
		{
			var img = images[i];
			var src = img.src;
			// moving pos here to fix DOCS-8 IE issue with tiny pastes
			var pos = {};
			if (dojo.isIE) {
			  pos.top = parseFloat('25%');
			  pos.left = parseFloat('25%');
			  pos.width = parseFloat(img.width);
			  pos.height = parseFloat(img.height);
			}
			var validImg = src.match(/^data:image\/([\w]+);base64/);
			if (validImg)
			{
				var newUri = this.uploadImageData(src);
				if (newUri)
				{
					img.src = newUri;
					// keep this here for non-IE pastes
					if (!dojo.isIE) {
					  pos.top = parseFloat("25%");
					  pos.left = parseFloat("25%");
					  pos.width = parseFloat(img.width);
					  pos.height = parseFloat(img.height);
					}
					var imgUtil = pres.utils.imageUtil;
					var parser = pres.model.parser;
					var params = {
						url: newUri,
						pos: pos
					};
					var node = imgUtil.createImage(params);
					var slide = pe.scene.slideEditor.slide;
					var elem = parser.parseElement(slide, node);
					dojo.destroy(node);
					var encodedJson = this.copypasteutil.getEncodedJson(elem);
					pasteJson.arr.push(encodedJson);
					result = true;
				}
			}
		}
		return result;
	},
	pasteTables: function(pastebin, pasteJson)
	{
		var result = false;
		var htmlContent = pastebin.innerHTML;
		if (!htmlContent || htmlContent.toLowerCase().indexOf('<table') == -1)
			return "notables";
		var tableUtil = pres.utils.tableUtil;
		var tableContent = "";

		dojo.attr(pastebin, 'pfs', '18');
		PresCKUtil.updateRelativeValue(pastebin, [PresConstants.ABS_STYLES.FONTSIZE]);

		var tables = pastebin.getElementsByTagName('table');
		// here we will paste all tables in the clipboard data
		for ( var t = 0; t < tables.length; t++)
		{
			var table = tables[t];
			if (tableUtil.isMergeCell(table))
			{
				// do nothing.
			}

			var hasWdith = false;
			var colgrp = dojo.query('colgroup', table);
			var colws = [];
			var tw = 0.0;
			if (colgrp.length == 1)
			{
				var cols = colgrp[0].children;
				for ( var i=0;i<cols.length;i++)
				{
					var col = cols.item(i);
					var style = dojo.attr(col, 'style').toLowerCase();
					var wi = style.indexOf('width');
					if (wi > -1)
					{
						hasWdith = true || hasWdith;
						var wb = style.substring(wi + 6);
						colw = wb.split(';')[0];
						if (colw.indexOf('px') > 0)
						{
							colw = parseFloat(colw) * 0.75 * 2.54 / 72; // CM
						}
						else
						{
							colw = 100 * 0.75 * 2.54 / 72; // set to a default one
						}
						colws[i] = colw;
						tw += colw;
					}
				}

				for ( var i=0;i<cols.length;i++)
				{
					var col = cols.item(i);
					var cwp = colws[i] * 100 / tw;
					dojo.attr(col, 'style', 'width:' + cwp + '%');
				}
			}

			// build table element.
			var dfnode = this.createDrawFrameNodeForTable(table,tw);
			!hasWdith && PresTableUtil.updateTableColgroup(table, true);
			// copy from excel, tr height is in px, needs to update.
			PresTableUtil.updateRowHeightToPc(table);

			var elem = pres.model.parser.parseElement(pe.scene.slideEditor.slide, dfnode);
			dojo.destroy(dfnode);
			var encodedJson = this.copypasteutil.getEncodedJson(elem);
			pasteJson.arr.push(encodedJson);
			result = true;
		}
		return result;
	},
	createDrawFrameNodeForTable: function(table,tableWdith)
	{
		var DEFAULT_TABLE_HEIGHT = 5; // in %
		var DEFAULT_TABLE_WIDTH = 80; // in %
		if(tableWdith)
		{
			DEFAULT_TABLE_WIDTH = tableWdith * 100 / pe.scene.slideEditor.slide.w;
		}

		var DEFAULT_TABLE_TOP = 25; // in %
		var DEFAULT_TABLE_LEFT = 16.45; // in %
		if (table != null)
		{
			var drawFrame = document.createElement('div');
			dojo.addClass(drawFrame, 'draw_frame newbox');
			var t = DEFAULT_TABLE_TOP;
			var l = DEFAULT_TABLE_LEFT;
			var w = DEFAULT_TABLE_WIDTH;
			var h = DEFAULT_TABLE_HEIGHT;
			dojo.attr(drawFrame, 'presentation_class', 'table');
			dojo.attr(drawFrame, 'pfs', '18');
			dojo.attr(drawFrame, 'draw_layer', 'layout');
			dojo.attr(drawFrame, 'text_anchor-type', 'paragraph');
			dojo.style(drawFrame, {
				'position': 'absolute',
				'top': t + "%",
				'left': l + "%",
				'height': DEFAULT_TABLE_HEIGHT + "%",
				'width': w + "%"
			});

			var dataNode = table;
			drawFrame.appendChild(dataNode);
			dojo.style(dataNode, {
				'height': '100%',
				'width': '100%'
			});
			dojo.addClass(dataNode, 'contentBoxDataNode'); // Add here so we can process during widgitize component
			this.copypasteutil.buildNewID(drawFrame);
			return drawFrame;
		}
	},

	prepareText: function(pastebin)
	{
		// TODO
		return false;
	}

});
