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

dojo.provide("pres.handler.SlideHandler");

dojo.require("pres.constants");
dojo.require("pres.model.Document");
dojo.require("pres.msg.Publisher");
dojo.require("pres.utils.htmlHelper");
dojo.require("pres.handler.SlideHandlerCreate");
dojo.require("pres.handler.SlideHandlerLayout");
dojo.require("pres.handler.SlideHandlerTransition");
dojo.requireLocalization("concord.widgets", "slidesorter");
dojo.requireLocalization("concord.task", "PresTaskHandler");

dojo.declare("pres.handler.SlideHandler", [pres.handler.SlideHandlerCreate, pres.handler.SlideHandlerLayout,
		pres.handler.SlideHandlerTransition], {

	constructor: function()
	{
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets", "slidesorter");
	},

	selectionChanged: function(thumbs)
	{
		var ids = [];
		dojo.forEach(thumbs, function(s)
		{
			ids.push(s.slide.id);
		});
		var msgPub = pe.scene.msgPublisher;
		var msgPairList = [msgPub.createSlidesSelectedMsg(ids)];
		msgPub.sendMessage(msgPairList);
		var currentUserId = pe.authenticatedUser ? pe.authenticatedUser.getId() : null;
		if (currentUserId)
			pe.scene.locker.updateLockOnSlideSelected(currentUserId, ids);
	},

	moveSlides: function(thumbs, targetIndex, before)
	{
		var ids = [];
		var slides = dojo.map(thumbs, function(t)
		{
			var slide = t.slide;
			ids.push(slide.wrapperId);
			return slide;
		});

		var okToMove = dojo.every(slides, function(s)
		{
			return !pe.scene.locker.isSlideOrContentLocked(s.id);
		});

		if (!okToMove)
		{
			pe.scene.openLockMessageDialog(slides);
			return;
		}

		var obj = pe.scene.doc.moveSlides(slides, targetIndex, before);
		if (!obj)
			return;

		var msgPub = pe.scene.msgPublisher;
		var msg = this.createMsg4MoveSlides(obj.deleted, obj.inserted);
		var currentSlideIds = pe.scene.slideSorter.getSelectedIds();
		msgPub.putSlideSelection(msg, ids, currentSlideIds);
		msgPub.sendMessage(msg);
	},

	createMsg4MoveSlides: function(deletedSlides, insertedSlides)
	{
		var msgPub = pe.scene.msgPublisher;

		var acts = [];
		dojo.forEach(deletedSlides, function(deleted)
		{
			var slide = deleted[0];
			var index = deleted[1];
			var deleteAct = msgPub.createDeleteElementAct(slide, index);
			acts.push(deleteAct);
		});

		acts.reverse();

		dojo.forEach(insertedSlides, function(inserted)
		{
			var slide = inserted[0];
			var index = inserted[1];
			var insertAct = msgPub.createInsertElementAct(slide, index);
			acts.push(insertAct);
		});

		var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.MoveSlide, acts)];
		msgPub.addMoveFlag(msgPairList);
		msgPub.setHasInsertDeleteSameElementInMsgListFlag(msgPairList, true);

		return msgPairList;
	},

	createMsg4DeleteSlides: function(slides)
	{
		var allSlides = pe.scene.doc.slides;
		var allLength = allSlides.length;
		var msgPub = pe.scene.msgPublisher;
		var msgPairList = [];

		dojo.forEach(slides, function(s)
		{
			var index = dojo.indexOf(allSlides, s);
			var act = msgPub.createDeleteElementAct(s, index, true);
			msgPairList.push(act);
		});

		msgPairList.reverse();

		msgPairList = [msgPub.createMessage(MSGUTIL.msgType.Element, msgPairList)];

		return msgPairList;
	},

	createMsg4InsertSlides: function(slides)
	{
		var acts = [];

		var msgPub = pe.scene.msgPublisher;
		var allSlides = pe.scene.doc.slides;

		dojo.forEach(slides, function(s)
		{
			var index = dojo.indexOf(allSlides, s);
			var act = msgPub.createInsertElementAct(s, index);
			acts.push(act);
		});

		msgPairList = [msgPub.createMessage(MSGUTIL.msgType.Element, acts)];
		return msgPairList;
	},

	deleteSlides: function(thumbs)
	{
		var ids = [];
		var slides = dojo.map(thumbs, function(t)
		{
			var slide = t.slide;
			ids.push(slide.wrapperId);
			return slide;
		});

		var allSlides = pe.scene.doc.slides;
		var allLength = allSlides.length;

		if (slides.length >= allLength)
			return;

		var noLock = dojo.every(slides, function(s)
		{
			return !pe.scene.locker.isSlideOrContentLocked(s.id);
		});

		if (!noLock)
		{
			pe.scene.openLockMessageDialog(slides);
			return;
		}

		var noTask = dojo.every(slides, function(s)
		{
			return !s.taskContainer;
		});

		if (!noTask)
		{
			var nls = dojo.i18n.getLocalization("concord.task", "PresTaskHandler");
			pe.scene.showErrorMessage(slides.length == 1 ? nls.STR_SLIDE_DELETE_ERROR : nls.STR_SLIDE_DELETE_ERRORS, 10000);
			return;
		}

		var msg = this.createMsg4DeleteSlides(slides);
		var eventSource = {
			msg: false,
			undo: false,
			rollback: false
		};
		pe.scene.doc.deleteSlides(slides, eventSource);
		var currentSlideIds = pe.scene.slideSorter.getSelectedIds();
		pe.scene.msgPublisher.putSlideSelection(msg, ids, currentSlideIds);
		pe.scene.msgPublisher.sendMessage(msg);
	},
	duplicateSlides: function(selectedThumbs)
	{
		//copy
		pe.pasteSlideInSameFile = true;
		var pasteSlides = [];
		var copypasteutil = pe.scene.hub.commandHandler.copyHandler.copypasteutil;
		dojo.forEach(selectedThumbs, function(thumb)
		{
			var slide = thumb.slide;
			var encodedJson = copypasteutil.getEncodedJson(slide);
			pasteSlides.push(encodedJson);
		}, this);
		var elems = [];
		//paste
		dojo.forEach(pasteSlides, function(slide)
		{
			var decodedSlide = copypasteutil.getDecodedJson(slide, true);
			var pastedSlide = decodedSlide;
			var sld = new pres.model.Slide(pastedSlide);
			pres.utils.helper.setIDToModel(sld, true);
			var noMTable = [];
			dojo.forEach(sld.elements, function(elem)
			{
				if (!(elem.family == 'table' && elem.table && elem.table.hasMerge()))
				{
					noMTable.push(elem);
				}
			}, noMTable);
			sld.elements = noMTable;
			elems.push(sld);
		}, this);
		delete pe.pasteSlideInSameFile;
		var thumbs = pe.scene.slideSorter.getChildren();
		var index = dojo.indexOf(thumbs, selectedThumbs[selectedThumbs.length - 1]);
		dojo.publish("/sorter/to/paste", [elems, index + 1]);
		
	},
	pasteSlides: function(slides, startIndex)
	{
		if (!slides)
			return;

		var allSlides = pe.scene.doc.getSlides();
		var len = allSlides.length;
		if (len + slides.length > pres.constants.MAX_SLIDE_NUM)
		{
			this.showSlideNumCheckMsg();
			return;
		}

		var pasteSlides = [];
		var index = startIndex;

		dojo.forEach(slides, function(slide)
		{
			slide.attachParent();
			pe.scene.doc.insertSlide(slide, index, null);
			pasteSlides.push(slide);
			index = index + 1;
		});

		var msg = this.createMsg4InsertSlides(pasteSlides);

		// select all pasted slides
		var sorter = pe.scene.slideSorter;
		var endIndex = startIndex + slides.length - 1;

		var currentSlideIds = sorter.getSelectedIds();
		sorter.selectItems(startIndex, endIndex);
		var currentSlideIds2 = sorter.getSelectedIds();

		pe.scene.msgPublisher.putSlideSelection(msg, currentSlideIds, currentSlideIds2);
		pe.scene.msgPublisher.sendMessage(msg);
	},

	showSlideNumCheckMsg: function()
	{
		// #42084 if total slide number is greater than certain number, needs to show warning message to the user
		var msgStr = this.STRINGS.slides_toolarge_warning;
		var numCheckMsg = dojo.string.substitute(msgStr, [pres.constants.MAX_SLIDE_NUM]);
		window.pe.scene.showWarningMessage(numCheckMsg, 10000); // show message with interval time 10 sec for msg expiration, message will be hidden as soon as widgitized finished or timeout is cleared
	}

});