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

dojo.provide("pres.widget.Editor");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");

dojo.require("pres.widget.SlideEditor");
dojo.require("pres.widget.NotesEditor");

dojo.require("dijit.layout.BorderContainer");

dojo.declare("pres.widget.Editor", [dijit.layout.BorderContainer, dijit._Templated], {

	widgetsInTemplate: true,
	gutters: false,
	index: 0,
	slide: null,

	buildRendering: function()
	{
		this.templateString = dojo.cache("pres", "templates/Editor.html");
		this.inherited(arguments);
	},

	toggleNotes: function(show)
	{
		if (this.notesEditor)
			this[show ? "addChild" : "removeChild"](this.notesEditor);
	},
	
	deSelectAll: function()
	{
		this.slideEditor.deSelectAll();
		this.notesEditor.deSelectAll();
	},

	getEditingBox: function()
	{
		var box = this.slideEditor.getEditingBox();
		if (box)
			return box;
		box = this.notesEditor.getEditingBox();
		return box;
	},

	watchHeight: function()
	{
		if (!this.notesEditor)
			return;
		var h = dojo.style(this.domNode, "height");
		var maxHeight = h / 2 - 10;
		this.notesEditor.set("maxSize", maxHeight);
		var notesDom = this.notesEditor.domNode;
		var h = dojo.style(notesDom, "height");
		if (h > maxHeight)
		{
			notesDom.style.height = maxHeight + "px";
		}
	},

	postCreate: function()
	{
		this.inherited(arguments);
		
		pe.scene.editor = this;
		var mainDoc = this.domNode.ownerDocument;
		var spellchecker = null;
		if (typeof mainDoc.spellchecker == 'undefined'){
			spellchecker = new concord.spellcheck.scaytservice(mainDoc, true); 
			spellchecker = mainDoc.spellchecker;					
			spellchecker.enableAutoScayt(window.spellcheckerManager.bAutoScaytEnabled);
		}
		pe.scene.spellChecker = this.spellChecker = spellchecker;
		
		this.subscribe("/thumbnail/selected", function(thumbnail)
		{
			var slide = thumbnail.slide;
			if (thumbnail.slide != this.slide || this.slideId != thumbnail.slide.id)
				this.render(thumbnail);
			else
			{
				this.slideEditor.deSelectAll();
				this.notesEditor.deSelectAll();
				if (pe.scene.isMobile)
					concord.util.mobileUtil.clickCurrentSlide(thumbnail);
			}
		});
		
		this.updateUserColors();
		
		if (pe.scene.isHTMLViewMode())
		{
			this.toggleNotes(false);
			return;
		}
		
		if (pe.scene.isMobile)
			this.toggleNotes(false);
		
		this.connect(this, "resize", this.watchHeight);
		this.subscribe("/data/reset", this.reset);
		this.subscribe("/sorter/order/changed", this.updatePageNumber);
		this.subscribe("/user/color/show", this.updateUserColors);
		this.subscribe("/msg/before/send/pending", this.sendPendingUpdate);
		this.subscribe("/menu/context/open", function()
		{
			// console.info("open menu context, disable spellcheck");
			var box = this.getEditingBox();
			var enableSpellCheck = pe.settings && pe.settings.getAutoSpellCheck();
			if (box && box.editor && enableSpellCheck)
				box.editor.pauseSpellCheck();
		});
		this.subscribe("/menu/context/close", function()
		{
			// console.info("close menu context, resume spellcheck");
			var box = this.getEditingBox();
			var enableSpellCheck = pe.settings && pe.settings.getAutoSpellCheck();
			if (box && box.editor && enableSpellCheck)
				box.editor.resumeSpellCheck();
		});
	},
	
	resetSpellChecker: function()
	{
		spellcheckerManager.wordArray = new dojox.collections.ArrayList();
		spellcheckerManager.misWordArray = new dojox.collections.Dictionary();
		this.spellChecker.resetOneNode(this.domNode, true);
	},

	updateUserColors: function()
	{
		var spaces = /\s+/;
		var classNames = this.domNode.className.split(spaces);
		var classNames2 = "";
		dojo.forEach(classNames, function(cn)
		{
			if (cn.indexOf("SHOW_") != 0)
				classNames2 += cn + " ";
		});
		for ( var userId in pe.scene._userColorMap)
		{
			var on = pe.scene._userColorMap[userId];
			if (on)
				classNames2 += "SHOW_USER_" + userId + " ";
		}
		dojo.attr(this.domNode, "class", dojo.trim(classNames2));
	},
	
	sendPendingUpdate: function()
	{
		var boxes = [this.slideEditor.getEditingBox(), this.notesEditor.getEditingBox()];
		dojo.forEach(boxes, function(box){
			if (box && box._hasUpdate)
				box.notifyUpdate({sync:true});
		});
	},

	reset: function()
	{
		this.slideEditor.clean();
		if (this.notesEditor)
			this.notesEditor.clean();
	},

	updatePageNumber: function()
	{
		this.slideEditor.updateHeaderFooter(true);
		if (this.notesEditor)
			this.notesEditor.updateHeaderFooter(true);
	},

	render: function(thumbnail)
	{
		clearTimeout(pe.scene.editorRenderTimer);
		pe.scene.editorRenderTimer = setTimeout(dojo.hitch(this, function()
		{
			this.slide = thumbnail.slide;
			this.slideId = this.slide.id;
			this.slideEditor.render(this.slide);
			if (this.notesEditor && !pe.scene.isMobile)
				this.notesEditor.render(this.slide);
			var enableSpellCheck = pe.settings && pe.settings.getAutoSpellCheck();
			if(enableSpellCheck)
			{
				if (window.spellcheckerManager)
					window.spellcheckerManager.enableAutoScayt(true);
				this.resetSpellChecker();
			}
			delete pe.scene.editorRenderTimer;
		}), 100);
	},

	destroy: function()
	{
		this.spellChecker.removeAllNodes();
		this.spellChecker = null;
		this.inherited(arguments);
	}

});
