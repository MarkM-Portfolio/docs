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

dojo.provide("pres.msg.ReceiverAttr");
dojo.require("concord.pres.MsgUtil");
dojo.require("concord.text.StyleMsg");
dojo.declare("pres.msg.ReceiverAttr", null, {

	_checkSuspiciousStyles: function(styles)
	{
		if (!styles)
			return false;

		var acf = concord.util.acf;
		for ( var name in styles)
		{
			if (acf.suspiciousAttribute(name, styles[name]))
			{
				LOG.log("malicious Attribute fragment detected: " + name + " :" + styles[name]);
				return true;
			}
		}

		return false;
	},

	updateAttributes: function(act)
	{
		var isFromUndo = (act.undoFlag != null) ? act.undoFlag : false;
		var isRollBack = (act.rollBack) ? act.rollBack : false;

		var eventSource = {
			msg: true,
			undo: isFromUndo,
			rollback: isRollBack
		};

		if (act.s)
		{
			// style
			var element = pe.scene.doc.find(act.bid);
			if (element && element instanceof pres.model.Element)
			{
				var slide = element.parent;
				for ( var name in act.s)
				{
					if (name == "top")
						element.t = parseFloat(act.s.top) * slide.h / 100.0;
					else if (name == "left")
						element.l = parseFloat(act.s.left) * slide.w / 100.0;
					else if (name == "width")
						element.w = parseFloat(act.s.width) * slide.w / 100.0;
					else if (name == "height")
						element.h = parseFloat(act.s.height) * slide.h / 100.0;
					else if (name == "z-index")
						element.z = parseFloat(act.s["z-index"]) || 0;
				}

				// Should update frame pos before update main position
				// because getPosition style will be based on frame position
				if (element.family == 'group' && element.svg)
					element.updateShapeFrmLT(element.l, element.t);
				
				element.attr("style", element.getFinalStyle());
				dojo.publish("/element/style/changed", [element, eventSource]);
			}
		}
		if (act.a)
		{
			if (act.shapeid)
			{
				var shape = pe.scene.doc.find(act.shapeid);
				if (!shape)
					return;
				var fill = shape.find(act.bid);
				if (!fill)
					return;
				for ( var name in act.a)
				{
					fill.attrs[name] = act.a[name];
				}
				if (act.bgbd == 'bg')
					dojo.publish("/shape/bgfill/changed", [shape, eventSource]);
				else if(act.bgbd =='op')
					dojo.publish("/shape/opacityfill/changed", [shape, eventSource]);
				else if(act.lineStyleName)
				{
					dojo.publish("/shape/linestyle/changed", [shape, eventSource, act.lineStyleName]);
				}
				else
					dojo.publish("/shape/borderfill/changed", [shape, eventSource]);
				return;
			}

			var slide = pe.scene.doc.find(act.bid);
			if (!slide)
				return;
			if (slide instanceof pres.model.Slide)
			{
				for ( var name in act.a)
				{
					slide.attrs[name] = act.a[name];
				}
				dojo.publish("/slide/attr/changed", [slide, eventSource]);
			}
			else if (slide instanceof pres.model.Element)
			{
				for ( var name in act.a)
				{
					slide.attrs[name] = act.a[name];
				}
				dojo.publish("/element/attr/changed", [slide, eventSource]);
			}
		}

	}
});