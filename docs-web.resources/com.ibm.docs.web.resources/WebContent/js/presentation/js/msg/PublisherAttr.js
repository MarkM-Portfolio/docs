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

dojo.provide("pres.msg.PublisherAttr");
dojo.require("concord.pres.MsgUtil");
dojo.require("concord.text.StyleMsg");
dojo.declare("pres.msg.PublisherAttr", null, {

	createAttributeMsgPair: function(nodeId, attrName, newAttrValue, pairList, oldAttrValue)
	{
		var msgPairList = (pairList == null) ? [] : pairList;
		var msgActs = [this.createAttributeMsgActs(nodeId, attrName, oldAttrValue, newAttrValue)];
		msgPairList.push(this.createMessage(MSGUTIL.msgType.Attribute, msgActs));
		return msgPairList;
	},

	createAttributeMsgActs: function(nodeId, attrName, oldAttrValue, newAttrValue)
	{

		var oldAttrs = {};
		var newAttrs = {};

		oldAttrs[attrName] = oldAttrValue;
		newAttrs[attrName] = newAttrValue;

		// Let's prevent resizeablecontainerSelected attribute to pass
		if (oldAttrs[attrName] != null && oldAttrs[attrName].indexOf("resizableContainerSelected") > 0)
		{
			oldAttrs[attrName] = oldAttrs[attrName].replace('resizableContainerSelected', 'resizableContainer');
			newAttrs[attrName] = newAttrs[attrName].replace('resizableContainerSelected', 'resizableContainer');
		}

		return this.createAttributeAct(nodeId, newAttrs, null, oldAttrs, null);
	},

	_normalizeStyles: function(styles)
	{
		styles = dojo.clone(styles);
		if (styles && dojo.isString(styles))
			styles = MSGUTIL.getStyleParas(styles);
		// normallize text-decoration
		if (styles && styles['text-decoration'] != null && styles['text-decoration'] != 'none')
		{
			var values = styles['text-decoration'].split(/\s+/);
			for ( var i = 0; i < values.length; i++)
			{ // only surport strikethrough and underline
				if (MSGUTIL.isTextDecorationStyle(values[i]))
					styles[values[i]] = "1";
			}
			delete styles['text-decoration'];
		}
		return styles;
	},

	_createSingleAttributeAct: function(target, t, atts, styles)
	{
		var tid = (target && target.$) ? target.getId() : target;

		var act = {};
		act.t = t;
		act.tid = tid;
		if (styles)
			act.s = styles;
		// if( element )
		// act.e = element;
		if (atts)
			act.a = atts;

		// check block and get index
		act.isb = true;
		act.bid = tid;
		
		var obj = pe.scene.doc.find(tid);
		
		act.p_isnasw = obj && obj instanceof pres.model.Slide;
		act.p_isnad = obj && obj instanceof pres.model.Element;

		/*
		 * var node = (target && target.$) ? target : window['pe'].scene.getEditor().document.getById(target); if (node) { var block = MSGUTIL.getBlock(node); if (!block.equals(node)) { act.isb = false; act.bid = block.getId(); act.idx = MSGUTIL.transOffsetRelToAbs(node, 0, block); act.len = MSGUTIL.getNodeLength(node); } }
		 */
		return act;
	},

	createAttributeActForResizing: function(target, styles, oldstyles, flag)
	{
		styles = this._normalizeStyles(styles);
		oldstyles = this._normalizeStyles(oldstyles);

		var act = this._createSingleAttributeAct(target, "sbt", null, styles);
		var rAct = this._createSingleAttributeAct(target, "sbt", null, oldstyles);
		var actPair = {
			"act": act,
			"rAct": rAct
		};
		if (flag)
		{
			actPair.act.flag = flag;
			actPair.rAct.flag = flag;
		}
		return actPair;
	},

	createAttributeAct: function(target, atts, styles, oldatts, oldstyles, flag)
	{
		if (!oldstyles)
			oldstyles = {};

		styles = this._normalizeStyles(styles);
		oldstyles = this._normalizeStyles(oldstyles);
		for ( var style in styles)
		{
			if (!MSGUTIL.isStyleExist(oldstyles, style))
				oldstyles[style] = "";
		}
		styles && MSGUTIL.checkNullValues(styles);
		oldstyles && MSGUTIL.checkNullValues(oldstyles);
		!flag && styles && oldstyles && MSGUTIL.checkSameValues(styles, oldstyles);
		atts && MSGUTIL.checkNullValues(atts);
		oldatts && MSGUTIL.checkNullValues(oldatts);
		atts && oldatts && MSGUTIL.checkSameValues(atts, oldatts);

		var act = this._createSingleAttributeAct(target, "sbt", atts, styles);
		var rAct = this._createSingleAttributeAct(target, "sbt", oldatts, oldstyles);
		var actPair = {
			"act": act,
			"rAct": rAct
		};
		if (flag)
		{
			actPair.act.flag = flag;
			actPair.rAct.flag = flag;
		}
		return actPair;
	}

});