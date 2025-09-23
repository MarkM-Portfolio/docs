dojo.provide("writer.util.SectionTools");
dojo.require("writer.util.ViewTools");

writer.util.SectionTools = {

	updateHFSelection: function(isHeader, pageNumber)
	{
		var selection = pe.lotusEditor.getSelection();
		var scrollTop = pe.lotusEditor.getScrollPosition();
		selection.addHeaderFooterSelection(scrollTop, isHeader, pageNumber);
	},

	/**
	 * get current section in the location of view.
	 * @param item: arbitrary view
	 */
	getCurrentSection: function(item){
		var page = writer.util.ViewTools.getPage(item);
		
		if (!page)
			return null;
			
		var section = page.getSection();
		return section;
	},
	
	/**
	 * get current section id in the location of view.
	 * @param item: arbitrary view
	 */
	getCurrentSecId: function(item){
		var section = writer.util.SectionTools.getCurrentSection(item);
		return section ? section.getId() : "";
	},
	
	/**
	 * insert section in setting model, and send message
	 * @param sect:		section content.
	 * @param idx:		index to insert.
	 * @param msgs:		message to send.
	 */
	insertSection: function(sect, idx, msgs) {
		var setting = pe.lotusEditor.setting;
		setting.insertSection(sect, idx);
		if (msgs)
		{
			var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Section,  [WRITER.MSG.createInsertSectionAct(sect, idx)],WRITER.MSGCATEGORY.Setting )
			msgs.push(msg);
		}
	},
	
	/**
	 * delete section in setting model, and send message, by secId
	 * @param block:	view that contains section property.
	 * @param msgs:		message to send.
	 */
	deleteSection: function(block,msgs){
		var directProperty = block.getDirectProperty&&block.getDirectProperty();
		if(directProperty &&directProperty.getSectId()){
			var ret = pe.lotusEditor.setting.deleteSection(directProperty.getSectId())
			msgs.push(WRITER.MSG.createMsg( WRITER.MSGTYPE.Section,  [WRITER.MSG.createDeleteSectionAct( ret.sect ,ret.idx)],WRITER.MSGCATEGORY.Setting ));
		}
	},
	
	/**
	 * generate new section id
	 */
	getNewSectionId: function(){
		var id = "id_0000" + WRITER.MSG_HELPER.getUUID();
		return id;
	},
	
	/**
	 * get previous section that header/footer linked to
	 * return section means linked to itself
	 */
	getHFSectionLinkedTo: function(section, type) {
		var setting = pe.lotusEditor.setting;

		if (section.getHeaderFooterByType(type))
			return section;
		
		var idx = setting.getSectionIndex(section.getId());
		var preSection = null;
		for (i = idx; i >=0; --i)
		{
			preSection = setting.getSectionByIndex(i);
			if (!preSection)
				return section;
			
			if (preSection.getHeaderFooterByType(type))
				return preSection;
		}
		
		return section;
	},
	
	/**
	 * is different first page in this header/footer
	 */
	isHFDiffFirstPage: function(targetView){
		var page = writer.util.ViewTools.getPage(targetView);
		var currentSec = page && page.section;
		if (!currentSec)
			return false;
		
		return currentSec.firstDifferent ? true : false;
	},
	
	/**
	 * is different odd/even pages in this header/footer
	 */
	isHFDiffOddEvenPages: function(){
		var setting = pe.lotusEditor.setting;
		return setting.isDiffOddEvenPages();
	},
	
	/**
	 * is linked to previous
	 */
	isHFLinkedToPrevious: function(targetView){
		var page = writer.util.ViewTools.getPage(targetView);
		var currentSec = page && page.section;
		if (!currentSec)
			return false;
		
		var linkedSec = currentSec;
		if (page.isDiffFirstPage)
		{
			if (targetView.isHeader)
				linkedSec = writer.util.SectionTools.getHFSectionLinkedTo(currentSec, writer.HF_TYPE.FIRST_HEADER);
			else
				linkedSec = writer.util.SectionTools.getHFSectionLinkedTo(currentSec, writer.HF_TYPE.FIRST_FOOTER);
		}
		else if (page.isEvenPage)
		{
			if (targetView.isHeader)
				linkedSec = writer.util.SectionTools.getHFSectionLinkedTo(currentSec, writer.HF_TYPE.EVEN_HEADER);
			else
				linkedSec = writer.util.SectionTools.getHFSectionLinkedTo(currentSec, writer.HF_TYPE.EVEN_FOOTER);
		}
		else
		{
			if (targetView.isHeader)
				linkedSec = writer.util.SectionTools.getHFSectionLinkedTo(currentSec, writer.HF_TYPE.DEFAULT_HEADER);
			else
				linkedSec = writer.util.SectionTools.getHFSectionLinkedTo(currentSec, writer.HF_TYPE.DEFAULT_FOOTER);
		}
		
		return (linkedSec != currentSec);
	},
	
	/**
	 * set different first page in current header/footer
	 * @param targetView: current target header/footer view
	 */
	setHFDifferentFirstPage: function(targetView){
		var msgList = [];
	
		var setting = pe.lotusEditor.setting;
		var page = writer.util.ViewTools.getPage(targetView);
		var currentSec = page && page.section;
		if (!currentSec)
		{
			console.error("cannot find current section!");
			return;
		}
		
		var oldSecJson = currentSec.toJson();
		
		if (!writer.util.SectionTools.isHFDiffFirstPage(targetView))
		{
			// create new first page header and footer
			if (!currentSec.firstHeader)
			{
				var fhId = pe.lotusEditor.relations.createHeaderFooter(msgList, true);
				currentSec.firstHeader = fhId;
				//fhView = page.insertHeaderFooter(msgList, fhId, true);
			}
			
			if (!currentSec.firstFooter)
			{
				var ffId = pe.lotusEditor.relations.createHeaderFooter(msgList, false);
				currentSec.firstFooter = ffId;
				//ffView = page.insertHeaderFooter(msgList, ffId, true);
			}
		
			// set first page mark in section
			currentSec.firstDifferent = {};
			var actPair = WRITER.MSG.createReplaceKeyAct(currentSec.getId(), oldSecJson, currentSec.toJson(), WRITER.KEYPATH.Section);
			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [actPair], WRITER.MSGCATEGORY.Setting);
			// Send the message first to do OT 
//			msgList.unshift(msg);	// Can't update in another client.
			msgList.push(msg);
		}
		else
		{
			// remove firstPage tag from this section
			currentSec.firstDifferent = null;
			var actPair = WRITER.MSG.createReplaceKeyAct(currentSec.getId(), oldSecJson, currentSec.toJson(), WRITER.KEYPATH.Section);
			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [actPair], WRITER.MSGCATEGORY.Setting);
			msgList.push(msg);
		}
		
		// send message
		if (msgList.length>0)
			WRITER.MSG.sendMessage( msgList );

		// update
		writer.util.SectionTools.updateHFSelection(targetView.isHeader, page.pageNumber);
		while (currentSec)
		{
			pe.lotusEditor.layoutEngine.rootView.updateSection(currentSec, false);
			currentSec = setting.getNextSection(currentSec.getId());
		}
	},
	
	/**
	 * set different odd & even pages in current header/footer
	 * @param targetView: current target header/footer view
	 */
	setHFOddEvenPages: function(targetView, bSendMsg){
		/* 	
			1) default -> diffOddEven:	iterate every section, if the section contains dh or
										df, we must ensure to add eh and ef.
			2) diffOddEven -> default:	just remove eh and ef.
		*/
		var msgList = [];
		
		var setting = pe.lotusEditor.setting;
		if (writer.util.SectionTools.isHFDiffOddEvenPages())
		{
			setting.setDiffOddEvenPages(false);

			if (bSendMsg)
			{
				var msg = WRITER.MSG.createMsg(WRITER.MSGTYPE.Setting,  [WRITER.MSG.createRemoveEvenOddAct()],WRITER.MSGCATEGORY.Setting);
				msgList.push(msg);
			}
		}
		else
		{
			// save settings
			setting.setDiffOddEvenPages(true);
			if (bSendMsg)
			{
				var msg = WRITER.MSG.createMsg(WRITER.MSGTYPE.Setting,  [WRITER.MSG.createAddEvenOddAct()],WRITER.MSGCATEGORY.Setting);
				msgList.push(msg);
			}
		
			// check every section, if has dh, df, then create eh, ef
			for (var i = 0; i < setting.getSectionLength(); ++i)
			{
				var sec = setting.getSectionByIndex(i);
				var oldSecJson = sec.toJson();
				
				// add even header
				if (sec.defaultHeader && !sec.evenHeader)
				{
					var ehId = pe.lotusEditor.relations.createHeaderFooter(msgList, true);
					sec.evenHeader = ehId;
				}
				
				// add even footer
				if (sec.defaultFooter && !sec.evenFooter)
				{
					var efId = pe.lotusEditor.relations.createHeaderFooter(msgList, false);
					sec.evenHeader = efId;
				}
				
				// save section
				if (bSendMsg)
				{
					var actPair = WRITER.MSG.createReplaceKeyAct(sec.getId(), oldSecJson, sec.toJson(), WRITER.KEYPATH.Section);
					var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [actPair], WRITER.MSGCATEGORY.Setting);
//					msgList.unshift(msg);
					msgList.push(msg);
				}
			}
		}
		
		// send message
		if (msgList.length>0)
			WRITER.MSG.sendMessage( msgList );
		
		// update
		if (bSendMsg)
		{
			var page = writer.util.ViewTools.getPage(targetView);
			var pageNumber = page ? page.pageNumber : null;
			writer.util.SectionTools.updateHFSelection(targetView.isHeader, pageNumber);
		}
		for (var i = 0; i < setting.getSectionLength(); ++i)
		{
			var changedSec = setting.getSectionByIndex(i);
			pe.lotusEditor.layoutEngine.rootView.updateSection(changedSec, false);
		}
	},
	
	/**
	 * set link to previous in current header/footer
	 * @param targetView: current target header/footer view
	 */
	setHFLinkToPrevious: function(targetView){
		/* 
			link -> unlink:	create relative header/footer in this section
			unlink -> link: remove relative header/footer in this section
		*/
		var page = writer.util.ViewTools.getPage(targetView);
		var currentSec = page && page.section;
		if (!currentSec)
			return false;
		
		var msgList = [];
		
		var setting = pe.lotusEditor.setting;
		var hfType;
		
		var oldSecJson = currentSec.toJson();
		
		if (page.isDiffFirstPage)
		{
			if (targetView.isHeader)
				hfType = writer.HF_TYPE.FIRST_HEADER;
			else
				hfType = writer.HF_TYPE.FIRST_FOOTER;
		}
		else if (page.isEvenPage)
		{
			if (targetView.isHeader)
				hfType = writer.HF_TYPE.EVEN_HEADER;
			else
				hfType = writer.HF_TYPE.EVEN_FOOTER;
		}
		else
		{
			if (targetView.isHeader)
				hfType = writer.HF_TYPE.DEFAULT_HEADER;
			else
				hfType = writer.HF_TYPE.DEFAULT_FOOTER;
		}
		
		var headerfooter = currentSec.getHeaderFooterByType(hfType);
		
		if (!headerfooter)
		{
			// unlink to previous
			var hfId = pe.lotusEditor.relations.createHeaderFooter(msgList, targetView.isHeader);
			currentSec.setHeaderFooterByType(hfType, hfId);
		}
		else
		{
			// link to previous
			currentSec.setHeaderFooterByType(hfType, null);
		}
		
		// save section
		var actPair = WRITER.MSG.createReplaceKeyAct(currentSec.getId(), oldSecJson, currentSec.toJson(), WRITER.KEYPATH.Section);
		var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [actPair], WRITER.MSGCATEGORY.Setting);
//		msgList.unshift(msg);
		msgList.push(msg);
		
		// send message
		if (msgList.length>0)
			WRITER.MSG.sendMessage( msgList );
		
		// update
		writer.util.SectionTools.updateHFSelection(targetView.isHeader, page.pageNumber);
		while (currentSec)
		{
			pe.lotusEditor.layoutEngine.rootView.updateSection(currentSec, false);
			currentSec = setting.getNextSection(currentSec.getId());
		}
	},

	insertHeaderFooter: function(page, isHeader)
	{
		var setting = pe.lotusEditor.setting;

		var shell = pe.lotusEditor._shell;
		var headerfooter = isHeader? page.getHeader() : page.getFooter();
		if (headerfooter){
			console.log("header/footer is already there");
			shell.moveToHeaderFooter(headerfooter);
		}else{
			//create a new header/footer in relations
			var msgList = [];
			var headerFooterID = pe.lotusEditor.relations.createHeaderFooter(msgList, isHeader);
			//insert header/footer to the pages and update layout
			headerfooter = page.insertHeaderFooter(msgList, headerFooterID, isHeader);
			//render all headers/footers in these pages
			pe.lotusEditor.layoutEngine.rootView.update();

			// update next sections
			var index = setting.getSectionIndex(page.getSection().getId());
			if (index >= 0)
			{
				for (var i = index + 1; i < setting.getSectionLength(); ++i)
				{
					var changedSec = setting.getSectionByIndex(i);
					pe.lotusEditor.layoutEngine.rootView.updateSection(changedSec, false);
				}
			}

			if (headerfooter){
				shell.moveToHeaderFooter(headerfooter, true);
			}
			if (msgList.length>0){
				WRITER.MSG.sendMessage( msgList );
			}
			
		}
	},

	/*
	 * delete a header/footer frome section
	 */
	deleteHeaderFooter: function(section, hfToDelete, isHeader)
	{
		var msgList = [];

		// clear header/footer in section
		var t = writer.HF_TYPE.INVALID;
		var linkedSection = section;
		for (var i = writer.HF_TYPE.BEGIN; i < writer.HF_TYPE.END; ++i)
		{
			var linkedSection = writer.util.SectionTools.getHFSectionLinkedTo(section, i);
			var hf = linkedSection.getHeaderFooterByType(i);
			if (hf == hfToDelete)
			{
				t = i;
				break;
			}
		}

		var oldSecJson = linkedSection.toJson();

		if (writer.HF_TYPE.isValid(t))
			linkedSection.setHeaderFooterByType(t, null);

		if( !pe.lotusEditor.undoManager.inUndoRedo() ){
			var actPair = WRITER.MSG.createReplaceKeyAct(linkedSection.getId(), oldSecJson, linkedSection.toJson(), WRITER.KEYPATH.Section);
			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [actPair], WRITER.MSGCATEGORY.Setting);
			msgList.push(msg);
		}

		// delete header/footer from relation
		pe.lotusEditor.relations.removeHeaderFooter(msgList, hfToDelete, isHeader);

		// send message
		if (msgList.length>0 && !pe.lotusEditor.undoManager.inUndoRedo())
			WRITER.MSG.sendMessage( msgList );

		// update
		var setting = pe.lotusEditor.setting;
		var index = setting.getSectionIndex(linkedSection.getId());
		if (index >= 0)
		{
			for (var i = index; i < setting.getSectionLength(); ++i)
			{
				var changedSec = setting.getSectionByIndex(i);
				pe.lotusEditor.layoutEngine.rootView.updateSection(changedSec);
			}
			//pe.lotusEditor.layoutEngine.rootView.updateSection(linkedSection);
			//pe.lotusEditor.layoutEngine.rootView.updateSection(section);
		}
		else
		{
			// something error!
			console.log("something error while delete header/footer");
			pe.lotusEditor.reset();
		}
	}
};