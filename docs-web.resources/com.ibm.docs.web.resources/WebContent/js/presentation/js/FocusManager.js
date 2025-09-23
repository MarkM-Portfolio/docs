/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.FocusManager");
dojo.require("pres.constants");
dojo.require("concord.feature.FeatureController");

dojo.declare("pres.FocusManager", null, {

	virtualFocus: 1, // default in sorter.

	VIRTUAL_FOCUS_OTHER: 0,

	VIRTUAL_FOCUS_SORTER: 1,
	VIRTUAL_FOCUS_EDITOR: 2,
	VIRTUAL_FOCUS_SLIDE_EDITOR: 2.1,
	VIRTUAL_FOCUS_NOTES_EDITOR: 2.2,
	VIRTUAL_FOCUS_BOX: 3,
	VIRTUAL_FOCUS_SLIDE_BOX: 3.1,
	VIRTUAL_FOCUS_NOTES_BOX: 3.2,
	VIRTUAL_FOCUS_SIDEBAR: 4,

	isFocusInSorter: function()
	{
		return this.virtualFocus == this.VIRTUAL_FOCUS_SORTER;
	},

	isFocusInSideBar: function()
	{
		return this.virtualFocus == this.VIRTUAL_FOCUS_SIDEBAR;
	},

	isDialogShowing: function()
	{
		if (pe.scene.isHTMLViewMode() && document.activeElement){
			var viewFrame = EditorUtil.getAscendant(document.activeElement,'iframe');
			//if the focus doesn't in viewer-frame, it's maybe in comments keep the focus.
			//52125: [Safari] Cannot focus out of the viewer iframe if conversion fails
			if(viewFrame && !dojo.hasClass(viewFrame,'viewer-frame'))
				return true;
		}
		var commentsPop = false;
		try
		{
			var pWidget = concord.widgets.sidebar.PopupCommentsCacher.getCachedWidget();
			if (pWidget && pWidget.isShown())
			{
				commentsPop = true;
			}
			if (concord.feature.FeatureController && concord.feature.FeatureController.isWidgetShown())
			{
				return true;
			}
		}
		catch (e)
		{
		}

		if ((dijit.Dialog._dialogStack && dijit.Dialog._dialogStack.length > 1) || commentsPop || dijit.popup._stack.length > 0)
			return true;
		else if (pe.scene.slideEditor.linkPanelShow)
		{
			var box = pe.scene.editor.getEditingBox();
			if (!box)
				return true;
			else if (document.activeElement && dojo.isDescendant(document.activeElement, box.domNode))
				return false;
			return true;
		}

		return false;
	},

	getVirtualFocus: function()
	{
		return this.virtualFocus;
	},

	setVirtualFocus: function(vf)
	{
		this.virtualFocus = vf;
	},

	getCopyBin: function()
	{
		return this.isCopyPasteIssueCases() ? this.pasteBin : this.copyBin;
	},

	getPasteBin: function()
	{
		return this.pasteBin;
	},

	loadImage: function(src)
	{
		return new Promise(function (resolve, reject) {
			var img = new Image();
			img.addEventListener("load", function(){resolve(img)});
			img.addEventListener("error", function(){reject(err)});
			img.src = src;
		});
	},

	onPaste: function(e)
	{
		console.log("==FocusManager:onPaste==S1");
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;

		var pasteText = "";
		var pasteHtml = "";

		if (window.clipboardData)
		{
			pasteText = window.clipboardData.getData('Text');
		}
		else if (e.clipboardData)
		{
			pasteText = e.clipboardData.getData("text/plain");
			pasteHtml = e.clipboardData.getData("text/html") || pasteText;
		}
		// DOCS-8 fix for paste image support for Chrome, Safari
		if ((dojo.isChrome || dojo.isSafari) && (pasteHtml === "" && pasteText === "")) {
			if ((e.clipboardData.items[0]) && (e.clipboardData.items[0].kind === 'file')) {
				var self = this;
				var imageblob = null;
				imageblob = e.clipboardData.items[0].getAsFile();
				if (imageblob !== null) {
					var reader = new FileReader();
					reader.onload = function(event) {
						var imgSrc = event.target.result;
						self.loadImage(imgSrc)
						.then(pasteHtml = self.pasteBin.innerHTML = "<img src='"+imgSrc+"' alt=''>")
						.catch(function(err) { console.error(err); });
					};
					reader.readAsDataURL(imageblob);
				}
			}
		}
		window.oldg_noimprove = window.g_noimprove;
		window.g_noimprove = true;
		if(concord.util.acf.suspiciousHtml(pasteHtml)){
		    return;
		}
		var c = pres.constants;

		setTimeout(dojo.hitch(this, function()
		{
			if (pe.copyPasteIssueCases)
			{
				pe.copyPasteIssueCases = false;
				this.pasteBin.innerHTML = pasteHtml;
			}
			if (this.pasteBeforeFocus && this.pasteBeforeFocus != this.pasteBin)
				this.pasteBeforeFocus.focus();
			if (dojo.isChrome)
			{
				this.pasteBin.innerHTML = pasteHtml;
			}
			dojo.publish("/command/exec", [c.CMD_PASTE, e, pasteText, pasteHtml, this.pasteBin]);
			delete pe.inCopyPasteAction;
			this.pasteBin.innerHTML = "";
			console.log("==FocusManager:onPaste:setTimeOut==S_End");
			window.g_noimprove = window.oldg_noimprove;
		}),600);
	},
	// Safari and Firefix 30 on MAC has issue(focus change will make copy.paste events be lost) to use pastebin directly, using the clipboard api for them.
	isCopyPasteIssueCases: function()
	{
		var useApi = dojo.isSafari || (dojo.isMac && dojo.isFF == 30) || false;
		return useApi;
	},
	onCopyPasteIssueCasesCopyCut: function(e)
	{
		if ((dojo.isMac && dojo.isFF == 30))
		{
			var c = pres.constants;
			if (e.type == "cut")
				dojo.publish("/command/exec", [c.CMD_CUT, e]);
			else
				dojo.publish("/command/exec", [c.CMD_COPY, e]);
		}
		e.preventDefault();
		var setStatus = e.clipboardData.setData('text/html', this.pasteBin.innerHTML);
		console.log("==FocusManager:onCopyPasteIssueCasesCopyCut:set content to clipboardData==S3:" + setStatus);
	},
	onCopyPasteIssueCasesBeforeCopy: function(e)
	{
		var c = pres.constants;
		dojo.publish("/command/exec", [c.CMD_COPY, e]);
	},

	onCopyPasteIssueCasesBeforeCut: function(e)
	{
		var c = pres.constants;
		dojo.publish("/command/exec", [c.CMD_CUT, e]);
	},

	checkFocusOutOnMouseUp: function()
	{
		if (this.isCopyPasteIssueCases())
			this.onFocusOut();
	},

	constructor: function()
	{
		if (!dojo.stopEventHacked)
		{
			dojo.stopEventHacked = true;
			dojo.connect(dojo, "stopEvent", function(e)
			{
				if (e)
					e.stopped = true;
			});
		}

		var body = document.body;
		this.banner = dojo.byId("banner");

		if (pe.scene.isMobile)
			return;

		if (DOC_SCENE.focusWindow === false)
			dijit.focus.watch("curNode", function(){
				pe.scene.windowFocused = true;
			});
		else
		{
			pe.scene.windowFocused = true;
		}

		if (this.isCopyPasteIssueCases())
			// for Safari Only. // TODO
			dojo.connect(document.documentElement, "focusout", this, "onFocusOut");
		else if (!dojo.isFF)
		{
			dojo.connect(pe.scene.slideSorter.domNode, "focusin", this, "onSorterFocusIn");
			if (pe.scene.editor)
				dojo.connect(pe.scene.editor.domNode, "focusin", this, "onEditorFocusIn");
			if (pe.scene.presApp.sideBar)
				dojo.connect(pe.scene.presApp.sideBar.domNode, "focusin", this, "onSideBarFocusIn");
		}
		else
		{
			pe.scene.slideSorter.domNode.addEventListener('focus', dojo.hitch(this, this.onSorterFocusIn), true);
			if (pe.scene.editor)
				pe.scene.editor.domNode.addEventListener('focus', dojo.hitch(this, this.onEditorFocusIn), true);
			if (pe.scene.presApp.sideBar)
				pe.scene.presApp.sideBar.domNode.addEventListener('focus', dojo.hitch(this, this.onSideBarFocusIn), true);
		}

		var viewmode = pe.scene.isHTMLViewMode();

		dojo.subscribe("/box/enter/edit", this, "onBoxEdit");
		dojo.connect(body, "onkeydown", this, "onKeyDown");

		if (!viewmode)
		{
			if (!pe.scene.isMobileBrowser())
			{
				dojo.connect(body, "onkeypress", this, "onKeyPress");
			}
			else
			{
				dojo.connect(body, "input", this, "onInput");
			}
			dojo.connect(body, "onkeyup", this, "onKeyUp");
			if (dojo.isIE)
			{
				// IE9 started to support addEventListener, and composition events can only been hooked by addEventListener
				body.addEventListener("compositionstart", dojo.hitch(this, "onCompositionStart"), false);
				body.addEventListener("compositionupdate", dojo.hitch(this, "onCompositionUpdate"), false);
				body.addEventListener("compositionend", dojo.hitch(this, "onCompositionEnd"), false);
			} else {
				dojo.connect(body, "oncompositionstart", this, "onCompositionStart");
				dojo.connect(body, "oncompositionend", this, "onCompositionEnd");
				dojo.connect(body, "oncompositionupdate", this, "onCompositionUpdate");
				if(pe.scene.isWebkitApp)
					dojo.connect(body,"textInput","onTextInput");
				else if (dojo.isWebKit)
					dojo.connect(body,"textInput", this, "onTextInput");
			}

			if (pe.scene.isMobileBrowser())
				dojo.connect(document, "onselectionchange", this, "onselectionchange");

			if (dojo.isSafari)
			{
				dojo.connect(body, "onmousedown", this, function(e){
					var target = e.target;
					var commentsPop = false;
					var pWidget = null;
					try
					{
						pWidget = concord.widgets.sidebar.PopupCommentsCacher.getCachedWidget();
						if (pWidget && pWidget.isShown())
						{
							commentsPop = true;
						}
					}
					catch (e)
					{
					}

					if (commentsPop)
					{
						if (dojo.isDescendant(target, pWidget.domNode))
						{
							// ignore
						}
						else
						{
							pe.scene.hideComments();
						}
					}
				});
			}
		}

		this.pasteBin = dojo.create("div", {
			className: "pasteBin",
			tabIndex: -1,
			contentEditable: true
		}, document.body);

		this.copyBin = dojo.create("div", {
			className: "copyBin pasteBin",
			tabIndex: -1
		}, document.body);

		if (!pe.scene.isMobileBrowser())
		{
			if (this.isCopyPasteIssueCases())
			{
				// for Mac Safari
				dojo.connect(this.pasteBin, "onbeforecopy", dojo.hitch(this, "onCopyPasteIssueCasesBeforeCopy"));
				dojo.connect(this.pasteBin, "oncopy", dojo.hitch(this, "onCopyPasteIssueCasesCopyCut"));
				if (!viewmode)
				{
					dojo.connect(this.pasteBin, "onbeforecut", dojo.hitch(this, "onCopyPasteIssueCasesBeforeCut"));
					dojo.connect(this.pasteBin, "oncut", dojo.hitch(this, "onCopyPasteIssueCasesCopyCut"));
				}
			}

			if (!viewmode)
			{
				dojo.connect(this.pasteBin, "onpaste", this, function(e)
				{
					this.onPaste(e);
				});
			}

			dojo.connect(this.pasteBin, "onkeydown", this, function(e)
			{
				var code = e.charCode || e.keyCode;
				var c = code >= 32 ? String.fromCharCode(code) : "";
				// in [Polish] IME, right "alt" key will also enable "e.ctrlkey"
				if (!((e.ctrlKey || (dojo.isMac && e.metaKey)) && !e.altKey && c == "v" || c == "V" || c == "c" || c == "C" || c == "x" || c == "X"))
				{
					if (this.virtualFocus == this.VIRTUAL_FOCUS_SORTER)
					{
						pe.scene.slideSorter.onKey(e);
					}
					if (this.virtualFocus == this.VIRTUAL_FOCUS_SLIDE_EDITOR)
					{
						pe.scene.slideEditor.onKey(e);
					}
					if (this.virtualFocus == this.VIRTUAL_FOCUS_NOTES_EDITOR)
					{
						pe.scene.notesEditor && pe.scene.notesEditor.onKey(e);
					}
					if (!e.stopped)
					{
						// still not stopped, bubble up to me.
						// this.onKeyDown(e);
					}
				}
				else if (!this.isCopyPasteIssueCases())
				{
					var cons = pres.constants;
					if (c == "c" || c == "C")
					{
						dojo.publish("/command/exec", [cons.CMD_COPY, e]);
					}
					else if (!viewmode && (c == "x" || c == "X"))
					{
						dojo.publish("/command/exec", [cons.CMD_CUT, e]);
					}
				}

			});
		}
	},
	onTextInput: function(event)
	{
//		console.log("onTextInput_" + event.data);
		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished() || pe.toReadContent)
			return;
		if (pe.IMEWorking || this.textInputEventLock)
			return;
		var currentBox = pe.scene.editor.getEditingBox();
		if (!currentBox)
			return;
		this._inputStringIntoTxtBox(event.data, 'IME_onTextInput');
		dojo.stopEvent(event);
	},

	onselectionchange: function()
	{
		var box = pe.scene.editor.getEditingBox();
		var viewmode = pe.scene.isHTMLViewMode();
		if (box)
		{
			if (box.editor)
			{
				var range = box.editor.getRange();
				if (this._pRange && this._pRange.isSame(range))
				{
					return;
				}
				else
				{
					this._pRange = range;
					box.editor.updateSelection();
				}
			}
		}
	},

	onBoxEdit: function()
	{
		var inNotesEditMode = pe.scene.notesEditor && pe.scene.notesEditor.getEditingBox();
		if (inNotesEditMode)
			this.setVirtualFocus(this.VIRTUAL_FOCUS_NOTES_BOX);
		else
			this.setVirtualFocus(this.VIRTUAL_FOCUS_SLIDE_BOX);
	},

	onSideBarFocusIn: function(e)
	{
		pe.scene.hideComments();
		var box = pe.scene.editor.getEditingBox();
		box && box.exitEdit();
		this.setVirtualFocus(this.VIRTUAL_FOCUS_SIDEBAR);
	},

	onSorterFocusIn: function(e)
	{
//		console.log("onSorterFocusIn" +  e.data);
		pe.scene.hideComments();
		var inSlideEditMode = pe.scene.slideEditor.getEditingBox();
		if (inSlideEditMode)
		{
			this.setVirtualFocus(this.VIRTUAL_FOCUS_SLIDE_BOX);
		}
		else
		{
			var inNotesEditMode = pe.scene.notesEditor && pe.scene.notesEditor.getEditingBox();
			if (inNotesEditMode)
				this.setVirtualFocus(this.VIRTUAL_FOCUS_NOTES_BOX);
			else
			{
				this.setVirtualFocus(this.VIRTUAL_FOCUS_SORTER);
			}
		}
	},

	onEditorFocusIn: function(e)
	{
//		console.log("onEditorFocusIn" +  e.data);
		pe.scene.hideComments();
		var inSlideEditMode = pe.scene.slideEditor.getEditingBox();
		if (inSlideEditMode)
		{
			this.setVirtualFocus(this.VIRTUAL_FOCUS_SLIDE_BOX);
		}
		else
		{
			var inNotesEditMode = pe.scene.notesEditor && pe.scene.notesEditor.getEditingBox();
			if (inNotesEditMode)
				this.setVirtualFocus(this.VIRTUAL_FOCUS_NOTES_BOX);
			else
			{
				var focus = document.activeElement;
				var isFocusInSlideEditor = dojo.isDescendant(focus, pe.scene.slideEditor.domNode);
				var isFocusInNotesEditor = pe.scene.notesEditor && dojo.isDescendant(focus, pe.scene.notesEditor.domNode);
				if (isFocusInSlideEditor)
					this.setVirtualFocus(this.VIRTUAL_FOCUS_SLIDE_EDITOR);
				else if (isFocusInNotesEditor)
					this.setVirtualFocus(this.VIRTUAL_FOCUS_NOTES_EDITOR);
				else
					this.setVirtualFocus(this.VIRTUAL_FOCUS_EDITOR);
			}
		}
	},

	onFocusOut: function(e)
	{
//		console.log("onFocusOut" +  e.data);
		this._foTimer = setTimeout(dojo.hitch(this, function()
		{
			var focus = document.activeElement;
			if (focus == this.pasteBin)
				return;
			var viewmode = pe.scene.isHTMLViewMode();

			var box = pe.scene.editor.getEditingBox();

			var isFocusInBody = !focus || focus == document.body;
			var isDialogShowing = this.isDialogShowing();
			var isFocusInBanner = !isDialogShowing && !isFocusInBody && dojo.isDescendant(focus, this.banner);
			var isFocusInToolbar = !isDialogShowing && !isFocusInBody && pe.scene.hub.app.toolbar && dojo.isDescendant(focus, pe.scene.hub.app.toolbar.domNode.parentNode);
			var isFocusInEditor = !isDialogShowing && !isFocusInBody && !isFocusInBanner && !isFocusInToolbar && dojo.isDescendant(focus, pe.scene.editor.domNode);
			var isFocusInSorter = !isDialogShowing && !isFocusInBody && !isFocusInBanner && !isFocusInToolbar && !isFocusInEditor && dojo.isDescendant(focus, pe.scene.slideSorter.domNode);
			var isFocusInSlideEditor = isFocusInEditor && dojo.isDescendant(focus, pe.scene.slideEditor.domNode);
			var isFocusInNotesEditor = isFocusInEditor && pe.scene.notesEditor && dojo.isDescendant(focus, pe.scene.notesEditor.domNode);
			var isFocusInSideBar = dojo.isDescendant(focus, pe.scene.presApp.sideBar.domNode);
			var isFocusInBox = false;

			if (box && isFocusInSideBar)
			{
				box.exitEdit();
				box = null;
				this.setVirtualFocus(this.VIRTUAL_FOCUS_SIDEBAR);
			}

			if (box)
			{
				isFocusInBox = focus && dojo.isDescendant(focus, box.domNode);
				this.setVirtualFocus(this.VIRTUAL_FOCUS_BOX);
				if (box.element.isNotes)
					this.setVirtualFocus(this.VIRTUAL_FOCUS_NOTES_BOX);
				else
					this.setVirtualFocus(this.VIRTUAL_FOCUS_SLIDE_BOX);
			}
			else if (isFocusInEditor)
			{
				if (isFocusInSlideEditor)
					this.setVirtualFocus(this.VIRTUAL_FOCUS_SLIDE_EDITOR);
				else if (isFocusInNotesEditor)
					this.setVirtualFocus(this.VIRTUAL_FOCUS_NOTES_EDITOR);
				else
					this.setVirtualFocus(this.VIRTUAL_FOCUS_EDITOR);
			}
			else if (isFocusInSorter)
				this.setVirtualFocus(this.VIRTUAL_FOCUS_SORTER);
			else
				this.setVirtualFocus(this.VIRTUAL_FOCUS_SIDEBAR);
			if (!pe.scene.isMobileBrowser() && !isDialogShowing && !isFocusInBox && !isFocusInSideBar && (isFocusInBody || isFocusInEditor || isFocusInSorter))
			{
				if (dojo.some(pe.scene.slideEditor.getChildren(), function(box){
					return box._mouseDown;
				}) || (pe.scene.notesEditor && dojo.some(pe.scene.notesEditor.getChildren(), function(box){
					return box._mouseDown;
				})))
				{
					// console.info("_hasMouseDown")
					return;
				}
				// console.info("i am sorry, grab focus...")
				this.pasteBin.blur();
				this.pasteBin.focus();
				if ((dojo.isMac && dojo.isFF == 30))
				{
					// D47753: [MVC][Regression]Can't copy paste object on MAC Firefox
					// FF doesn't have beforecopy event, so prepare the temp data here. without the data, there will be no copy/cut event be fired.
					var docUUId = window.pe.scene.bean.getUri();
					var id = "pres_" + new Date().valueOf();
					var htmlContent = "<div id='" + id + "' _docUUID='" + docUUId + "' class='presCopyPaste copyObjects'><div class='copyBinDiv'>&nbsp;</div>";
					this.pasteBin.innerHTML = htmlContent;
					try
					{
						var sel = window.getSelection();
						sel.removeAllRanges();
						var range = document.createRange();
						range.selectNodeContents(this.pasteBin);
						sel.addRange(range);
					}
					catch (e)
					{
					}
				}
			}
		}), 0);
	},

	onKeyDown: function(e)
	{
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;

//		console.log("onKeyDown_charcode[" + e.charCode + "],keyCode[" + e.keyCode +"],code["+ e.code + "]," + e.composed);
		var code = e.charCode || e.keyCode;
		if (code == 27) {
			// push Esc button, clean format Painter
			pe.scene.slideEditor.cleanFormatPainter();
		}
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox && currentBox.editor)
		{
			if (pe.scene.slideEditor.linkPanelShow)
			{
				pe.scene.slideEditor.closeLink();
				if (e.keyCode == dojo.keys.ESCAPE)
					return;
			}
			if (currentBox.impl_OnKeyDown(e))
			{
				return;
			}
		}

		var c = pres.constants;
		var handled = false;

		var focus = document.activeElement;

		var isFocusInPasteBin = focus == this.pasteBin;
		var isFocusInInput = focus && focus.tagName.toLowerCase() == "input" || focus.tagName.toLowerCase() == "textarea";

		var isFocusInControl = isFocusInPasteBin || !isFocusInInput;
		var cc = code >= 32 ? String.fromCharCode(code) : '';
		var viewmode = pe.scene.isHTMLViewMode();

		// in [Polish] IME, right "alt" key will also enable "e.ctrlkey"
		if (this.virtualFocus <= this.VIRTUAL_FOCUS_NOTES_BOX && ((dojo.isMac && e.metaKey) || e.ctrlKey) && !e.altKey)
		{
			switch (cc)
			{
				case "a":
				case "A":
					if (isFocusInControl)
						dojo.publish("/command/exec", [c.CMD_SELECT_ALL]);
					handled = true;
					dojo.stopEvent(e);
					break;
				case "z":
				case "Z":
					if (isFocusInControl && !viewmode)
					{
						pe.inUndoRedo = true;
						dojo.publish("/command/exec", [c.CMD_UNDO]);
						setTimeout(dojo.hitch(this, function()
						{
							delete pe.inUndoRedo;
						}, 300));
					}
					handled = true;
					break;
				case "y":
				case "Y":
					if (isFocusInControl && !viewmode)
					{
						pe.inUndoRedo = true;
						dojo.publish("/command/exec", [c.CMD_REDO]);
						setTimeout(dojo.hitch(this, function()
						{
							delete pe.inUndoRedo;
						}, 300));
					}
					handled = true;
					break;
				case "x":
				case "X":
					if(!viewmode)
					{
						console.log('==FocusManager: c.CMD_CUT==S0');
						pe.inCopyPasteAction = true;
						pe.inCutAction = true;
						handled = true;
						if (!this.isCopyPasteIssueCases())
						{
							dojo.publish("/command/exec", [c.CMD_CUT, e]);
						}
						else
						{
							pe.copyPasteIssueCases = true;
							this.pasteBin.contentEditable = true;
						}
					}
					handled = true;
					break;
				case "c":
				case "C":
					console.log('==FocusManager: c.CMD_COPY==S0');
					pe.inCopyPasteAction = true;
					handled = true;
					if (!this.isCopyPasteIssueCases())
					{
						dojo.publish("/command/exec", [c.CMD_COPY, e]);
					}
					else
					{
						pe.copyPasteIssueCases = true;
						this.pasteBin.contentEditable = true;
					}
					break;
				case "v":
				case "V":
					if(!viewmode)
					{
						console.log('==FocusManager: c.CMD_Paste==S0');
						pe.inCopyPasteAction = true;
						handled = true;
						if (!this.isCopyPasteIssueCases())
						{
							this.pasteBeforeFocus = document.activeElement;
							this.pasteBin.focus();
						}
						else
						{
							pe.copyPasteIssueCases = true;
							this.pasteBin.contentEditable = true;
						}
					}
					handled = true;
					break;
			}
		}
		else if (e.altKey)
		{
			// alt + f10 , move focus to tool bar
			if (e.keyCode == dojo.keys.F10)
			{
				if (isFocusInControl)
					pe.scene.presApp.focusToolbar();
				handled = true;
				dojo.stopEvent(e);

			}
			else
			{
				// alt + shift + f, move focus to menu bar
				if (e.shiftKey && (cc == "f" || cc == "F" || e.keyCode == 70))
				{
					if (isFocusInControl)
						pe.scene.presApp.focusMenuBar();
					handled = true;
					dojo.stopEvent(e);
				}
			}
		}
		else if (e.shiftKey)
		{
			// shift + F2, move focus to comment sidebar
			if (e.keyCode == dojo.keys.F2)
			{
				pe.scene.editor.deSelectAll();
				if (this.isFocusInSorter())
				{
					pe.scene.slideEditor.focus();
				}
				else if (!this.isFocusInSideBar())
				{
					pe.scene.presApp.focusSidebar();
				}
				else
				{
					pe.scene.slideSorter.focus();
					var ctb = pe.scene.slideSorter.getCurrentThumb();
					var index = dojo.indexOf(pe.scene.slideSorter.getChildren(), ctb) + 1;
					var readStr = dojo.string.substitute(pe.presStrs.acc_slide, [index]) + pe.presStrs.acc_selected;
					pe.scene.slideEditor && pe.scene.slideEditor.announce(readStr);
				}
				dojo.stopEvent(e);
				handled = true;
			}

			// shift + F7, move focus to speaker notes
			if (e.keyCode == dojo.keys.F7)
			{
				pe.scene.editor.deSelectAll();

				var focus = document.activeElement;
				var isFocusInNotesEditor = pe.scene.notesEditor && dojo.isDescendant(focus, pe.scene.notesEditor.domNode);
				if (isFocusInNotesEditor)
				{
					pe.scene.slideEditor.domNode.focus();
					var box = pe.scene.slideEditor.getChildren()[0];
					if (box)
						box.enterSelection();
				}
				else
				{
					var notesEditor = pe.scene.notesEditor;
					notesEditor.domNode.focus();
					notesEditor.box.enterEdit();
				}
				handled = true;
				dojo.stopEvent(e);
			}
		}
		if (e.ctrlKey && e.shiftKey)
		{
			pe.toReadContent = true;
			setTimeout(dojo.hitch(this, function()
			{
				delete pe.toReadContent;
			}), 10);
			if (cc == 1)
			{
				if (!pe.scene.slideEditor.readIndicator())
				{//read indicator in slide.
					pe.scene.slideSorter.readIndicators();
				}
			}

			else if (cc == 2)
				pe.scene.slideEditor.readLine();
		}
		if (!handled)
		{
			var sorter = pe.scene.slideSorter;
			var editor = pe.scene.slideEditor;

			if (!viewmode && e.keyCode == dojo.keys.ENTER && isFocusInControl && editor.inDragCreateMode)
			{
				dojo.stopEvent(e);
				editor.createBoxWithDrag();
			}

			else if (sorter && this.virtualFocus < this.VIRTUAL_FOCUS_BOX && editor.getSelectedBoxes().length == 0)
			{
				sorter.handleKeyFromBody(e);
			}
		}
	},

	checkShortCut: function(e)
	{
		var handled = false;
		var c = pres.constants;
		var viewmode = pe.scene.isHTMLViewMode();
		if (viewmode)
			return false;
		// in [Polish] IME, right "alt" key will also enable "e.ctrlkey"
		if (((dojo.isMac && e.metaKey) || e.ctrlKey) && !e.altKey)
		{
			var focus = document.activeElement;

			var isFocusInPasteBin = focus == this.pasteBin;
			var isFocusInInput = focus && focus.tagName.toLowerCase() == "input" || focus.tagName.toLowerCase() == "textarea";

			var isFocusInControl = isFocusInPasteBin || !isFocusInInput;
			var code = e.charCode || e.keyCode;
			var cc = code >= 32 ? String.fromCharCode(code) : '';
			switch (cc)
			{
				case "p":
				case "P":
					if (isFocusInControl)
						dojo.publish("/command/exec", [c.CMD_PRINT]);
					handled = true;
					dojo.stopEvent(e);
					break;
				case "s":
				case "S":
					if (isFocusInControl)
						dojo.publish("/command/exec", [c.CMD_SAVE]);
					handled = true;
					dojo.stopEvent(e);
					break;
				case "m":
				case "M":
					if (isFocusInControl)
						dojo.publish("/command/exec", [c.CMD_SLIDE_CREATE]);
					handled = true;
					dojo.stopEvent(e);
					break;
			}
		}
		return handled;
	},

	onKeyPress: function(e)
	{
		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox && currentBox.editor)
		{
			if (currentBox.impl_OnKeyPress(e))
				return;
		}
		this.checkShortCut(e);
	},

	onKeyUp: function(e)
	{
//		console.log("onKeyUp_charcode[" + e.charCode + "],keyCode[" + e.keyCode +"],code["+ e.code + "]," + e.composed);

		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox && currentBox.editor)
		{
			if (currentBox.impl_OnKeyUp(e))
				return;
		}
	},

	onCompositionStart: function(event)
	{
		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;
		pe.IMEWorking = true;
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox && currentBox.editor)
		{
//			console.log("onCompositionStart_" +  event.data);
			this.IMEStartEditingModelID = currentBox.editor.lockIMEEditingModel(true);
			currentBox.editor.IME_StartInput();
			if(!currentBox.editor.compositionendEventinputString)
				currentBox.editor.compositionendEventinputString = '';
		}

	},
	onCompositionEnd: function(event)
	{
		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;
		pe.IMEWorking = false;
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox && currentBox.editor)
		{
			var inputString = currentBox.editor.IME_FinishInput();
//			console.log("onCompositionEnd_" + inputString);
//			console.log("onCompositionEnd_event.data:" + event.data);
//			console.log("onCompositionEnd_compositionUpdateStr:" + currentBox.editor.compositionUpdateStr);
			if (dojo.isIE >= 10  || dojo.isWebKit) {
				this._inputStringIntoTxtBox(inputString, 'IME_onCompositionEnd');
			} else {
				currentBox.editor.compositionendEventinputString += (event.data||currentBox.editor.compositionUpdateStr||'');
				inputString = currentBox.editor.compositionendEventinputString;
				this._inputStringIntoTxtBox(inputString, 'IME_onCompositionEnd');
			}
		}
		dojo.stopEvent(event);
	},
	onCompositionUpdate: function(event)
	{
		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return;
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox && currentBox.editor)
		{
			if (dojo.isIE >= 10) {
				currentBox.editor.compositionUpdateStr = currentBox.editor.IME_FinishInput(true);
			} else {
//				console.log("onCompositionUpdate_" +  event.data);
				currentBox.editor.compositionUpdateStr = event.data;
			}
		}

	},

	onInput: function(e)
	{
//		console.log("onInput:" + e.data);
		if (pe.IMEWorking || this.textInputEventLock)
			return;
		var currentBox = pe.scene.editor.getEditingBox();
		if (!currentBox)
			return;

		console.warn("something bad happened here, need to rebuild model...");
	},


	_inputStringIntoTxtBox: function(inputString, inputMethod)
	{
//		console.log("insert into box:" + inputString + " ,inputMethod:" + inputMethod);
		if (pe.inCopyPasteAction || pe.copyPasteIssueCases || pe.inUndoRedo)
		{
			return false;
		}
		if (this.virtualFocus > this.VIRTUAL_FOCUS_NOTES_BOX)
			return false;
		if (this.isDialogShowing() || !pe.scene.isLoadFinished())
			return false;

		var currentBox = pe.scene.editor.getEditingBox();
		if (!currentBox || !currentBox.editor)
			return false;

		if (currentBox.status != currentBox.STATUS_EDITING)
			return false;

		var curID = currentBox.editor.lockIMEEditingModel(false);
		if (curID && this.IMEStartEditingModelID && (this.IMEStartEditingModelID != curID))
			return false;
		this.IMEStartEditingModelID = null;
		currentBox.editor.compositionUpdateStr = null;
		currentBox.editor.pendingInput = inputString;
		if (inputString && inputString.length>0) {
			clearInterval(pe.scene.editor._IMEPendingInputTimer);
			pe.scene.editor._IMEPendingInputTimer = setInterval(dojo.hitch(this, function()
			{
				if (!currentBox.editor.selectionUpdaing)
				{
					if (!pe.IMEWorking)
					{
//						console.log("insert into editor:" + inputString + " ,inputMethod:" + inputMethod);
						currentBox.editor.inputString(inputString, inputMethod, true);
						currentBox.editor.pendingInput = null;
						currentBox.editor.compositionendEventinputString = '';
						currentBox.notifyUpdate();
					}
					clearInterval(pe.scene.editor._IMEPendingInputTimer);
				}
			}), 0);
		}
		return true;
	}
});
