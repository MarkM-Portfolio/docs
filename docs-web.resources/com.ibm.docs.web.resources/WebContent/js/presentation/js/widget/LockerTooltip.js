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

dojo.provide("pres.widget.LockerTooltip");

dojo.require("dijit.Tooltip");
dojo.declare('pres.widget.LockerTooltip', dijit.Tooltip, {

	connected: {
		c: false
	},
	userId: null,
	forNotes: false,
	forCoEdit: false,

	// fixed position to reduce effort.
	position: [{
		aroundCorner: "TR",
		corner: "ML"
	}],

	positionRtl: [{
		aroundCorner: "TL",
		corner: "MR"
	}],

	postCreate: function()
	{
		if (this.forCoEdit)
			this.positionRtl = [{
				aroundCorner: "BL",
				corner: "MR"
			}];

			this.position = [{
				aroundCorner: "BR",
				corner: "ML"
			}];
		this.inherited(arguments);
	},

	open: function(/* DomNode */target)
	{
		// summary:
		// Display the tooltip; usually not called directly.
		// tags:
		// private

		if (this._showTimer)
		{
			this._showTimer.remove();
			delete this._showTimer;
		}

		var content = this.getContent(target);
		if (!content)
		{
			return;
		}
		var parent = target.parentNode; //shensis 50712
		this.dir = parent && dojo.style(parent, 'direction');
		var pos = (this.dir == 'rtl') ? this.positionRtl : this.position;
		this.show(content, target, pos, !this.isLeftToRight(), this.textDir);

		this._connectNode = target; // _connectNode means "tooltip currently displayed for this node"
		this.onShow(target, pos);
	},

	close: function()
	{
		// summary:
		// Hide the tooltip or cancel timer for show of tooltip
		// tags:
		// private

		if (this._connectNode)
		{
			// if tooltip is currently shown
			this.hide(this._connectNode);
			delete this._connectNode;
			this.onHide();
		}
		if (this._showTimer)
		{
			// if tooltip is scheduled to be shown (after a brief delay)
			this._showTimer.remove();
			delete this._showTimer;
		}
	},

	addLockerClass: function()
	{
		var masterDom = this.connected._masterTT.domNode;
		masterDom.className = "dijitTooltip";
		dojo.addClass(masterDom, "locker_tooltip locker_tooltip_" + this.userId);
		if (this.forCoEdit)
			dojo.addClass(masterDom, "locker_coedit_tooltip");
		else if (this.forNotes)
			dojo.addClass(masterDom, "locker_tooltip_notes");

		if(this.dir == 'rtl')
			dojo.addClass(this.connected._masterTT.domNode, this.dir);
		
		var node = this.connected._masterTT.containerNode;
		
		if (node && !this.forCoEdit)
		{
			var role = dojo.attr(node, "role");
			if (role)
			{
				this._role = role;
				dojo.removeAttr(node, "role");
			}
		}
	},

	show: function(innerHTML, aroundNode, position, rtl, textDir)
	{
		if (!this.connected._masterTT)
		{
			this.connected._masterTT = new dijit._MasterTooltip({

			});

			var editor = pe.scene.slideEditor;
			editor.lockerMasterTooltip = this.connected._masterTT;
			dojo.connect(editor, "onScroll", function()
			{
				var tt = editor.lockerMasterTooltip;
				if (tt.isShowingNow)
					tt.hide(tt.aroundNode);
			});
		}
		this.connect(this.connected._masterTT, "orient", this.addLockerClass);
		this.addLockerClass();
		return this.connected._masterTT.show(innerHTML, aroundNode, position, rtl, textDir);
	},

	hide: function(aroundNode)
	{
		var mt = this.connected._masterTT;
		var node = mt.containerNode;
		if (node && this._role)
			dojo.attr(node, "role", this._role);
		mt.hide(aroundNode);
		mt.fadeIn.stop();
		mt.fadeOut.stop();
		mt._onDeck = null;
		mt._onHide();
	}

});