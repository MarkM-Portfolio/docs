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

dojo.provide("pres.widget.Dialog");

dojo.require("dijit.Dialog");
dojo.require("concord.util.dialogs");
dojo.require("concord.util.events");
dojo.require("concord.util.BidiUtils");

dojo.declare("pres.widget.Dialog", dijit.Dialog, {

	constructor: function(opts)
	{
		this.opts = opts;
		if (BidiUtils.isGuiRtl())
			this.dir = 'rtl';
		this.connectArray = [];
	},

	updateDialogButtons: function(okCallBack, cancelCallBack)
	{
		if ((this.okBtn != null) && (okCallBack != null))
		{
			for ( var i = 0; i < this.connectArray.length; i++)
			{
				dojo.disconnect(this.connectArray[i]);
			}
			this.connectArray = [];
			this.connectArray.push(dojo.connect(this.okBtn, "__onClick", this, okCallBack));
		}
		if ((this.cancelBtn != null) && (cancelCallBack != null))
		{
			this.cancelBtn = cancelCallBack;
		}
	},

	addDialogButtons: function()
	{
		var btnArray = (this.opts.presDialogButtons) ? (this.opts.presDialogButtons) : [];
		var buttonsForDialogDiv = null;
		for ( var i = 0; i < btnArray.length; i++)
		{
			if (i == 0)
			{
				if (this.presDialogButtonsSectionNode)
				{
					dojo.destroy(this.presDialogButtonsSectionNode);
					this.presDialogButtonsSectionNode = null;
				}
				buttonsForDialogDiv = this.presDialogButtonsSectionNode = this.ownerDocument.createElement("div");
				dojo.addClass(buttonsForDialogDiv, 'dijitDialogPaneActionBar');
				this.presDialogBodyNode.appendChild(buttonsForDialogDiv);
				dojo.style(buttonsForDialogDiv, {
					'width': (dojo.isIE) ? (this.domNode.clientWidth - 50) + "px" : (this.domNode.offsetWidth - 58) + "px" // 50 is the total padding of the button section and 8 is total padding on this.domNode
				});

				if (this.okBtn)
				{
					this.okBtn.destroyRecursive();
					this.okBtn = null;
				}

				if (btnArray[i].id)
				{
					var okBtn = this.okBtn = new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						id: btnArray[i].id,
						ownerDocument: this.ownerDocument,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1)
					});
				}
				else
				{
					var okBtn = this.okBtn = new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						ownerDocument: this.ownerDocument,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1)
					});
				}

				this.updateDialogButtons(dojo.hitch(this, this.checkOkBtnEnabledBeforeClose, btnArray[i].action));
				okBtn.placeAt(buttonsForDialogDiv); // place in page
			}
			else if (i == 1)
			{
				var cancelSpan = this.ownerDocument.createElement('div');

				if (this.cancelBtn)
				{
					this.cancelBtn.destroyRecursive();
					this.cancelBtn = null;
				}

				if (btnArray[i].id)
				{
					var cancelBtnWidget = this.cancelBtn = new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						id: btnArray[i].id,
						ownerDocument: this.ownerDocument,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1),
						onClick: dojo.hitch(this, this.closeDialog, btnArray[i].action)
					});
				}
				else
				{
					var cancelBtnWidget = this.cancelBtn = new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						ownerDocument: this.ownerDocument,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1),
						onClick: dojo.hitch(this, this.closeDialog, btnArray[i].action)
					});
				}

				cancelBtnWidget.placeAt(buttonsForDialogDiv); // place in page
			}
		}
	},

	checkOkBtnEnabledBeforeClose: function(callback)
	{
		if (this.okBtn.disabled)
		{
			return false;
		}
		else
		{
			this.closeDialog(callback);
		}
	},

	closeDialog: function(callback)
	{
		var keepDialogOpen = false;
		if (callback)
		{
			keepDialogOpen = callback(); // if callback has an error message do not close the dialog and allow user to correct entries to resubmit
		}
		if (((typeof (keepDialogOpen) == "boolean") && keepDialogOpen) || ((typeof (keepDialogOpen) == "object") && keepDialogOpen.paraIncorrect))
		{
			return;
		}
		else
		{
			if (this.opts.destroyOnClose)
			{
				this.hide();
				this.uninitializePresDialog();
				try
				{
					this.destroyRecursive();
				}
				catch (e)
				{
				}
			}
			else
			{
				this.hide();
			}
		}
		setTimeout(dojo.hitch(pe.scene, pe.scene.setFocus), 0);
	},

	uninitializePresDialog: function()
	{
		for ( var i = 0; i < this.connectArray.length; i++)
		{
			dojo.disconnect(this.connectArray[i]);
		}
		this.connectArray = [];
	},

	onCancel: function()
	{
		this.closeDialog();
	},

	destroyToolTips: function()
	{
	},

	uninitialize: function()
	{
		for ( var i = 0; i < this.connectArray.length; i++)
		{
			dojo.disconnect(this.connectArray[i]);
		}
		this.connectArray = [];
		this.inherited(arguments);
	},

	show: function()
	{
		var w = this.dialogWidth || this.presDialogWidth;
		if (w)
		{
			dojo.style(this.domNode, {
				'width': parseFloat(w) + "px"
			});
		}
		var h = this.dialogHeight || this.presDialogHeight;
		if (h)
		{
			dojo.style(this.domNode, {
				'height': parseFloat(h) + "px"
			});
		}
		this.inherited(arguments);
		setTimeout(dojo.hitch(this, "resize"), 0);
	},

	postCreate: function()
	{
		this.inherited(arguments);
		if (this.containerNode && this.id)
		{
			this.containerNode.id = this.id + "_containerNode"; // since dijit doesn't set an id=, lets use our own "convention" to set the id
		}
		this.presDialogBodyNode = this.containerNode;
		if (this.opts.presModal || true)
			dojo.addClass(this.domNode, 'presentationDialog');
		this.addDialogButtons();
	}

});
