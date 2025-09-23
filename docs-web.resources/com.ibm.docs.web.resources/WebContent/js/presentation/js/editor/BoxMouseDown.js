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

dojo.provide("pres.editor.BoxMouseDown");
dojo.require("pres.utils.tableResizeUtil");

dojo.declare("pres.editor.BoxMouseDown", null, {

	onMouseDown: function(e)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		this._mouseMoved = false;
		if(dojo.isIE || pe.scene.isMobileBrowser())
		{
			if(!this._mouseClickTimes)
			{
				this._mouseClickTimes = 1;
			}
			else 
				this._mouseClickTimes ++ ;
			clearTimeout(this._mouseDownTimer);
			this._mouseDownTimer = setTimeout(dojo.hitch(this, function()
			{
				this._mouseClickTimes = null;
			}), 300);
			this._ImplMouseClick(e);
		}
		else
		{
			this._mouseClickTimes = e.detail;
			this._ImplMouseClick(e);
		}

	},
	
	_ImplMouseClick : function(e)
	{
		if(e.touches && e.touches.length != 0) {
			return;
		}
		var tblUtil = pres.utils.tableResizeUtil;
		if (tblUtil.resizeStart)
			return;
		if (pe.scene.locker.isLockedByOther(this.element.id))
			return;

		var isCtrl = e.ctrlKey || (dojo.isMac && e.metaKey);
		var multipleSelected = this.getParent().getSelectedBoxes().length > 1;
		var isActive = this.status > 0;

		// If I am active, and other is active too, you do not have ctrl key, you may want to drag to move
		if (!isCtrl && isActive && multipleSelected)
			return;

		var rightMouse = e && e.which && e.which == 3;
		if (this.status != this.STATUS_EDITING && !rightMouse)
		{
			dojo.query('a', this.domNode).forEach(function(_node)
			{
				var hyperLink = EditorUtil.getAttribute(_node,"href");
				if(hyperLink)
				{
					EditorUtil.removeAttribute(_node,"href");
					EditorUtil.setAttribute(_node,"xhref",hyperLink);
				}
			});
			
			if (pe.scene.hub.formatpainterStyles) {
				this.clickOnContent(e, true);
			}
		}
		if(e.currentTarget && e.currentTarget.style && e.currentTarget.style.cursor === 'text'){
			this.clickOnContent(e, true);
		}
		this.checkSelection(e);

		var hasCell = false;

		if (this.element.family == "table")
		{
			var cells = this.editor.getSelectedTableCells();
			hasCell = cells && cells.length > 1;
		}

		if (this.editor.updateSelectionByMouse(this._mouseClickTimes,e))
		{
			e.stopPropagation();
			dojo.stopEvent(e);
			this.editor.renderSelection();
			return;
		}
		else if (!(rightMouse && hasCell))
			this.editor.clearSelection();

		// if (e.which == 1)
		{
			this._mouseDown = true;
			this.mouseUpEventTicket = true;
			dojo.disconnect(this._bodyMouseUp);
			this._bodyMouseUp = dojo.connect(dojo.body(), "onmouseup", this, function(e)
			{
				dojo.disconnect(this._bodyMouseUp);
				if (this._mouseDown)
				{
					this._mouseDown = false;
					this.onMouseUp(e, true);
				}
			});
		}
	},

	checkSelection: function(e)
	{
		var pos = dojo.coords(this.domNode);
		var posX = e.clientX;
		var posY = e.clientY;
		this.mouseDownTime = 0;
		var me = this;
		var ctrl = (e.ctrlKey || (dojo.isMac && e.metaKey));
		if (!ctrl)
		{
			dojo.forEach(this.getParent().getChildren(), function(box)
			{
				if (me != box)
					box.exitSelection();
			});
		}
		else
		{
			dojo.forEach(this.getParent().getChildren(), function(box)
			{
				if (me != box && box.status == me.STATUS_EDITING)
				{
					box.exitEdit();
				}
			});

			if (this.status == this.STATUS_SELECTED)
			{
				this.exitSelection();
				return;
			}
		}

		if (ctrl && this.status == this.STATUS_EDITING)
			return;

		var selectedBox = this.getParent().getSelectedBoxes();
		var offset = 6;
		var border = pres.constants.BOX_BORDER;
		var sender = e.target;

		var posInResizer = sender && dojo.hasClass(sender, "resize-handler");
		var posInBorder = sender && sender.className && dojo.isString(sender.className)
			&& (sender.className == "resize-wrapper" || sender.className.indexOf("resize-box-out") > -1);

		var rightMouse = e.which && e.which == 3;

		if (this.status == this.STATUS_EDITING && !(posInBorder || posInResizer) && !rightMouse)
		{
			// click on content inside while editing
			e.stopPropagation();
			return;
		}
		else if ((rightMouse && selectedBox.length > 1) || ctrl || posInBorder || posInResizer)
		{
			this.clickOnBorder(e, posInResizer);
		}
		else if (this.status < 2)
		{
			this.mouseDownTime = new Date();
			this.clickOnBorder(e);
		}
	},

	clickOnBorder: function(e, posInResizer)
	{
		if (this.status != this.STATUS_SELECTED)
		{
			this.exitEdit();
			this.enterSelection();
		}
		this.focus();
		if (posInResizer && dojo.isIE)
		{
			// in some cases, when click on resizer, IE will jump focus to body..
			clearTimeout(this._IEFocusTimer);
			this._IEFocusTimer = setTimeout(dojo.hitch(this, function(){
				if (this.status == this.STATUS_SELECTED && document.activeElement == document.body && !this._destroyed)
				{
					this.focus();
				}
			}), 0);
		}
	},

	clickOnContent: function(e, focus)
	{
		if (pe.scene.locker.isLockedByOther(this.element.id))
			return;
		var me = this;
		var rightMouse = e && e.which && e.which == 3;
		var target = e.target;
		var clickOnText = target && target.tagName.toLowerCase() == "span";
		dojo.forEach(this.getParent().getChildren(), function(box)
		{
			if (me != box)
			{
				box.exitSelection();
			}
		});
		if (this.status != this.STATUS_EDITING && !rightMouse)
		{
			var range = this.editor.getRange();
			this.enterEdit(focus ? range : null);
		}
		
		if (clickOnText && this.status == this.STATUS_EDITING && !rightMouse)
		{
			// in some cases, when click on resizer, IE will jump focus to body..
			clearTimeout(this._linkPopTimer);
			this._linkPopTimer = setTimeout(dojo.hitch(this, function(){
				if (this._mouseClickTimes == 1 && this.editor.getCurHyperLink())
				{
					var slideEditor = this.getParent();
					slideEditor.createLink(true);
				}
			}), 400);
		}

	}

});
