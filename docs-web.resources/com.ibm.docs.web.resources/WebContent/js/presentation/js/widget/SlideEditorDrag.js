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

dojo.provide("pres.widget.SlideEditorDrag");

dojo.declare("pres.widget.SlideEditorDrag", null, {

	inDragCreateMode: false,
	
	getStartEndPos: function()
	{
		if (!this._startEndPos)
		{
			this._startEndPos = {};
		}
		return this._startEndPos;
	},

	getDragDiv: function()
	{
		if (!this._dragDiv)
		{
			this._dragDiv = dojo.create("div", {
				"className": "drag"
			}, this.domNode);
		}
		return this._dragDiv;
	},

	toggleDragCreateMode: function(value, fromEvent)
	{
		var event = "/drag/create/mode";
		if (value)
		{
			this.deSelectAll();
			if(value !== true && value !== false)
				this._shapeCreateType = value;
			else
				this._shapeCreateType = null;
			if (!this.inDragCreateMode)
			{
				this.prepareCoverForNewBox();
				this.toggleCoverNode(true);
				this.inDragCreateMode = true;
				if (!fromEvent)
					dojo.publish(event, [true, this._shapeCreateType]);
			}
		}
		else if (this.inDragCreateMode)
		{
			this.toggleCoverNode(false);
			// this._mouseDown = this._draged = this._moveMouseDown = this._dragedOnCover = false;
			this.inDragCreateMode = false;
			if (!fromEvent)
				dojo.publish(event, [false]);
		}
	},

	toggleCoverNode: function(visible)
	{
		if (this.coverNode)
			this.coverNode.style.display = visible ? "" : "none";
	},

	prepareCoverForNewBox: function()
	{
		if (!this.coverNode)
		{
			this.coverNode = dojo.create("div", {
				"dojoAttachPoint": "coverNode",
				style: {
					"background": "white",
					"border": "none",
					"position": "absolute",
					"overflow": "visible",
					"zIndex": 16666666,
					"cursor": "crosshair",
					"opacity": 0
				}
			}, this.containerNode);

			this.coverNodeEvents = [];

			if (pe.scene.isMobileBrowser())
			{
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "ontouchstart", this, "onMouseDown"));
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "ontouchend", this, "onMouseUp"));
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "ontouchmove", this, "onMouseMove"));
			}
			else
			{
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "onMouseDown", this, "onMouseDown"));
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "onMouseUp", this, "onMouseUp"));
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "onMouseLeave", this, "onMouseLeave"));
				this.coverNodeEvents.push(dojo.connect(this.coverNode, "onMouseMove", this, "onMouseMove"));
			}


			dojo.marginBox(this.coverNode, dojo.contentBox(this.containerNode));
		}
	}

});