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

dojo.provide("pres.msg.PublisherInsDelJson");
dojo.declare("pres.msg.PublisherInsDelJson", null, {

	putSlideSelection: function(msgPairList, oldSlideIds, newSlideIds)
	{
		if (msgPairList != null)
		{
			for ( var i = 0; i < msgPairList.length; i++)
			{
				var msg = msgPairList[i].msg;
				var rMsg = msgPairList[i].rMsg;
				for ( var j = 0; j < msg.updates.length; j++)
				{
					msg.updates[j].slideIds = newSlideIds;
					rMsg.updates[j] && (rMsg.updates[j].slideIds = oldSlideIds);
				}
			}
		}
	},
	
	createDeleteElementAct: function(obj, index)
	{
		var act = this._createDeleteElementAct(obj, index);
		var rActs = [];
		var rA = this._createInsertElementAct(obj, index);
		rActs.push(rA);

		var rAct = {};
		rAct.actions = rActs;
		return {
			"act": act,
			"rAct": rAct
		};
	},

	createInsertElementAct: function(obj, index)
	{
		var act = this._createInsertElementAct(obj, index);
		var rAct = this._createDeleteElementAct(obj, index);
		return {
			"act": act,
			"rAct": rAct
		};
	},

	_createDeleteElementAct: function(obj, index)
	{
		var act = {};
		act.t = MSGUTIL.actType.deleteElement; // type
		act.idx = index;
		act.len = 1;
		act.isb = true;
		act.elist = [];
		act.p_nid = obj.wrapperId || obj.id;
		act.tid = (obj instanceof pres.model.Slide) ? pe.scene.doc.id : obj.parent.id;
		act.p_type = (obj instanceof pres.model.Slide) ? "slide" : "element";
		act.p_isnasw = obj instanceof pres.model.Slide;
		act.p_isnad = obj instanceof pres.model.Element;
		act.p_osc = pe.scene.doc.slides.length;
		return act;
	},

	_createInsertElementAct: function(obj, index)
	{
		var act = {};
		act.t = MSGUTIL.actType.insertElement; // type
		act.idx = index;
		act.len = 1;
		act.isb = true;
		act.elist = [];
		act.s = "";
		act.p_obj = obj.toJson();
		act.p_nid = obj.wrapperId || obj.id;
		act.tid = (obj instanceof pres.model.Slide) ? pe.scene.doc.id : obj.parent.id;
		act.p_type = (obj instanceof pres.model.Slide) ? "slide" : "element";
		act.p_isnasw = obj instanceof pres.model.Slide;
		act.p_isnad = obj instanceof pres.model.Element;
		act.p_osc = pe.scene.doc.slides.length;
		return act;
	}

});