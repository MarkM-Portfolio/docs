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

dojo.provide("pres.msg.ReceiverInsDel");
dojo.require("pres.model.Document");
dojo.require("pres.model.TableElement");
dojo.require("pres.model.ShapeElement");
dojo.declare("pres.msg.ReceiverInsDel", null, {

	deleteElement: function(act, batch, batchLast)
	{
		if (!act.isb)
			return;

		var isFromUndo = (act.undoFlag != null) ? act.undoFlag : false;
		var isRollBack = (act.rollBack) ? act.rollBack : false;

		var doc = pe.scene.doc;
		var targetId = act.tid;
		var target = doc.find(targetId);
		if (!target)
			return;

		var ele = doc.find(act.p_nid);
		if (!ele)
			return;

		if (act.p_iclb)
		{
			//pe.scene.doc.updateListBeforeStyles(act.p_iclb);
		}

		var eventSource = {
			msg: true,
			undo: isFromUndo,
			rollback: isRollBack
		};

		if (ele instanceof pres.model.Slide)
		{
			eventSource.batch = batch;
			eventSource.batchLast = batchLast;
			eventSource.slideIds = act.slideIds;
			doc.deleteSlide(ele, eventSource);
		}
		else if (ele instanceof pres.model.Element)
		{
			var slide = target;
			slide.deleteElement(ele, eventSource);
		}

		else if (act.p_isnat)
		{
			// TODO
			var slideId = act.p_sid;
			var removedSlide = null;
			var slide = dojo.filter(doc.slides, function(s)
			{
				return s.id == slideId;
			})[0];
			if (slide)
			{
				if (slide.taskContainer && slide.taskContainer.id == act.p_nid)
				{
					slide.taskContainer == null;
					dojo.publish("/msg/delete/task", [slide.taskContainer, eventSource]);
				}
			}
		}

	},

	insertElement: function(act, batch, batchLast)
	{
		var doc = pe.scene.doc;
		var targetId = act.tid;
		var target = doc.find(targetId);
		if (!target)
			return;
		var isFromUndo = (act.undoFlag != null) ? act.undoFlag : false;
		var isRollBack = (act.rollBack) ? act.rollBack : false;
		var eventSource = {
			msg: true,
			undo: isFromUndo,
			rollback: isRollBack
		};
		var presObj = act.p_obj;
		if (!presObj)
			return;

		if (act.p_iclb)
		{
			//pe.scene.doc.updateListBeforeStyles(act.p_iclb);
		}

		if (presObj.type == "slide")
		{
			eventSource.batch = batch;
			eventSource.batchLast = batchLast;
			eventSource.slideIds = act.slideIds;
			var slide = new pres.model.Slide();
			slide.id = presObj.id;
			slide.wrapperId = presObj.wrapperId;
			slide.w = presObj.w;
			slide.h = presObj.h;
			slide.attrs = presObj.attrs;
			if (presObj.elements)
			{
				dojo.forEach(presObj.elements, function(ele)
				{
					var element = null;
					if (ele.family == "group")
						element = new pres.model.ShapeElement(ele);
					else if (ele.family == "table")
						element = new pres.model.TableElement(ele);
					else
						element = new pres.model.Element(ele);
					delete element.type;
					delete element.parentId;
					element.parent = slide;
					slide.elements.push(element);
				});
			}

			var index = act.idx;
			try{
				doc.insertSlide(slide, index, eventSource);
			} catch (e){
				// Insert Slide action is from remote that mean server & other client's data is fine.
				// So just reload the issue client, no need pass the issue to session to reload all clients.
				if (g_reloadLog){
					LOG.level = 'report';
					LOG.log("My user id is: " + pe.authenticatedUser.getName());
					LOG.log("Need reload the content, action is insertSlide,error is "+e.message);
					LOG.log("Message action is "+ dojo.toJson(act));
					LOG.report();
				}
				pe.scene.session.reload();
			}
		}
		else if (presObj.type == "element")
		{
			var element = null;
			if (presObj.family == "group")
				element = new pres.model.ShapeElement(presObj);
			else if (presObj.family == "table")
				element = new pres.model.TableElement(presObj);
			else
				element = new pres.model.Element(presObj);
			delete element.type;
			delete element.parentId;
			var slide = target;
			var index = act.idx;
			slide.insertElement(element, index, eventSource);
		}

		else if (act.p_isnad)
		{
			// element
			// slide
			var slideId = act.p_sid;
			var slide = doc.find(slideId);
			var dom = dojo.create("div", {
				style: {
					"display": "none"
				},
				innerHTML: act.s
			}, dojo.body());

			var element = parser.parseElement(slide, dom.childNodes[0]);
			dojo.destroy(dom);
			if (element)
			{
				var index = act.idx;
				slide.elements.splice(act.idx, 0, element);
				dojo.publish("/element/inserted", [element, eventSource]);
			}
		}

		else if (act.p_isnat)
		{
			// task div
		}

	}
});