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

dojo.provide("pres.widget.SorterDndSource");
dojo.require("dojo.dnd.Source");
dojo.declare("pres.widget.SorterDndSource", dojo.dnd.Source, {

	// mouse event processors
	onMouseMove: function(e)
	{
		//not allow user drag slide in sorter while in partial load.
		if(!pe.scene.isLoadFinished())
			return;
		// summary:
		// event processor for onmousemove
		// e: Event
		// mouse event
		if (this.isDragging && this.targetState == "Disabled")
		{
			return;
		}
		dojo.dnd.Source.superclass.onMouseMove.call(this, e);
		var m = dojo.dnd.manager();
		if (!this.isDragging)
		{
			if (this.mouseDown && this.isSource && (Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay))
			{
				var nodes = this.getSelectedNodes();
				if (nodes.length)
				{
					m.startDrag(this, nodes, this.copyState(dojo.isCopyKey(e), true));
				}
			}
		}
		if (this.isDragging)
		{
			// calculate before/after
			var before = false;
			if (this.current)
			{
				if (!this.targetBox || this.targetAnchor != this.current)
				{
					this.targetBox = dojo.position(this.current, true);
				}
				if (this.horizontal)
				{
					before = (e.pageX - this.targetBox.x) < (this.targetBox.w / 2);
				}
				else
				{
					before = (e.pageY - this.targetBox.y) < (this.targetBox.h / 2);
				}
			}
			if (this.current != this.targetAnchor || before != this.before)
			{
				this._markTargetAnchor(before);
				// just update this line, PRES TEAM, BOB
				m.canDrop(this.current && m.source == this);
			}
		}
	},

	onDndSourceOver: function(source)
	{
		// summary:
		// topic event processor for /dnd/source/over, called when detected a current source
		// source: Object
		// the source which has the mouse over it
		if (this != source)
		{
			this.mouseDown = false;
			if (this.targetAnchor)
			{
				this._unmarkTargetAnchor();
			}
		}
		else if (this.isDragging)
		{
			var m = dojo.dnd.manager();
			// just update this line, PRES TEAM, BOB
			m.canDrop(this.targetState != "Disabled" && (this.current && m.source == this));
		}
	}
});