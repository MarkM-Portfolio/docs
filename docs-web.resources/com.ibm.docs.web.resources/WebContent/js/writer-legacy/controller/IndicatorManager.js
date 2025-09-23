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
dojo.provide("writer.controller.IndicatorManager");
dojo.require("writer.util.ModelTools");
writer.controller.IndicatorManager = function(){
	this.tools = writer.util.ModelTools;
	var createIndicatorCSS = function(){
		this.addIndicatorClass();
		if(this.addIndicatorClassHdl){
			dojo.unsubscribe(this.addIndicatorClassHdl);
			delete this.addIndicatorClassHdl;
		}
	};
	// subscribe FIRSTTIME_RENDERED to add revision css dynamically
	this.addIndicatorClassHdl = dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED, this, createIndicatorCSS);
	this.userSelections = {};
	
	pe.scene.addResizeListener(dojo.hitch(this,this.onEditorResized));

	dojo.subscribe(writer.EVENT.COEDIT_STOPPED, this, this.clearUserSelections);
	dojo.subscribe(writer.EVENT.COEDIT_USER_LEFT, this, this.clearUserSelections);
	dojo.subscribe(writer.EVENT.COEDIT_COLOR_UPDATE, this, this.drawUserSelections);
};

writer.controller.IndicatorManager.prototype = {
	
	onEditorResized: function()
	{
		var me = this;
		setTimeout(function(){
			me.drawUserSelections();
		},10);
	},
	
	clearUserSelections: function(user)
	{
		if (user)
		{
			var userId = user.getId();
			this.destroyUserSelection(userId);
			delete this.userSelections[userId];
		}
		else
		{
			for (var userId in this.userSelections)
			{
				this.destroyUserSelection(userId);
			}
			this.userSelections = [];
		}
	},
	
	
	addIndicatorClass: function(para){
		if(!pe.scene.editors)
			return;
		
	    // referenced the spell check style implementation
    	var items = pe.scene.editors.editorContainer && pe.scene.editors.editorContainer.items;
    	var doc = concord.util.browser.getEditAreaDocument();
    	this.document = doc;
		var head = null;
		var css = null;
		dojo.query('head', doc).some(function(oNode){
				head = oNode;
				return true;
			});
		dojo.query('style[type=\"text/css\"][id="indicatorCss"]', head).some(function(oNode){
					css = oNode;
					if(dojo.isIE && dojo.isIE < 11){
	    				css.styleSheet.cssText = "";
	    			}else{
	    				 css.innerHTML = "";
	    			}
					 return true;
				});

		if(items &&  items.length >0){
			var curUser = items[0];
			var curId = curUser.getEditorId();
			for(var i = 0; i< items.length; i++){
	    		var userId = items[i].getEditorId();
	    		var isTurnOn = false;
	    		
	    		var indciator =  curUser.getIndicator(userId);
				if(!indciator) {
					if(curId == userId) {
						isTurnOn = false; // hide color shading for current user by default
					}
					else {
						isTurnOn = true;  // show color shading for co-editors by default
					}
				}else{
					if(indciator=="show")
						isTurnOn = true;
				}
	    		
	    		if(para && para.isTurnOn != undefined && para.userId == userId){
	    			isTurnOn = para.isTurnOn;
	    		}
	    		
	    		if (!pe.scene._usersColorStatus)
	    			pe.scene._usersColorStatus = {};
	    		pe.scene._usersColorStatus[userId] = isTurnOn;
	    		
	    		if(isTurnOn){
	    			if (!css){
	    				if(dojo.isIE){
	    					css = document.createElement('style');
	    					css.setAttribute('type', 'text/css');
	    					css.id = "indicatorCss";
	    					head.appendChild(css);
	    				}
	    				else{
	    					css =doc.createElement("style");
	    					css.type = "text/css";
	    					css.id = "indicatorCss";
	    					head.appendChild(css);
	    				}
	    			}
	    			var color = pe.scene.getEditorStore().getUserCoeditColor(userId);
//	    			var newClass = ".indicatorEnabled .ind" + userId + " {  background-color:" + color + " !important;}";// background-color:" + color + " !important;
	    						 //+ ".indicatorEnabled .ind_img_" + name + " { border-bottom :1px solid " + color + " !important;}";
	    			
	    			var newClass = ".indicatorEnabled .ind" + userId + " {  border-bottom: 2px dotted " + color + " !important;}";
	    			newClass += " .coEditToolip_" + userId + " .dijitTooltipContainer, .coEditToolip_"  + userId+ " .dijitTooltipContents::before  {background-color:" + color + " !important;}";
	    			
	    			
	    			if(dojo.isIE && dojo.isIE < 11){
	    				var cssStr = css.styleSheet.cssText +newClass ;	    				
	    				css.styleSheet.cssText = cssStr;
	    			}else{
	    				 var cssStr = css.innerHTML + newClass ;	    				
	    				 css.innerHTML = cssStr;
	    			}
				}
	    	}
		}else{
			console.log("item ==null or lenght  is 0 ")
		}
    	

    	this.IndicatorAuthor();
	},

	turnOnUserIndicator: function(para){
		this.addIndicatorClass(para);
	},

	createTextFmt: function(para, text, index){
		var followRun = para.getInsertionTarget(index).follow;
		var cnt = {};
		if(followRun){
			// get the textRun which style should be followed
			var followLink = ( followRun.modelType == writer.MODELTYPE.LINK );
			if( followLink ){
				followRun =  followRun.hints.getLast();
			}
			var fmt = followRun.toJson(index, text.length);
			if(fmt.br)
				delete fmt.br;
			if(fmt.tab)
				delete fmt.tab;
			if(fmt.ptab)
				delete fmt.ptab;
			if( followLink && index == ( followRun.start + followRun.length )&& fmt.style && fmt.style.styleId == "Hyperlink")
				delete fmt.style.styleId;
			
			cnt.fmt = [fmt];
		}
		else
			cnt.fmt = [{"rt":"rPr", "s":index, "l": text.length}];
		cnt.s = index;
		cnt.c = text;
		cnt.l = text.length;
		for(var i =0; i < cnt.fmt.length; i++){
			cnt.fmt[i].e_a = pe.scene.getCurrUserId();
		}

		return cnt;
	},

	IndicatorAuthor: function(){
		if(pe.scene.isIndicatorAuthor()){
			if(!dojo.hasClass(this.document.body,"indicatorEnabled"))
				dojo.addClass(this.document.body, "indicatorEnabled");
		}
		else{
			if(dojo.hasClass(this.document.body,"indicatorEnabled"))
				dojo.removeClass(this.document.body, "indicatorEnabled");
		}
	},

	getIndicatorClass: function(mRun){
		if(!mRun.author){
			return "";
		}else if(mRun.modelType == writer.MODELTYPE.TEXT)
			return " ind" + mRun.author;
		else if(this.tools.isImage(mRun)){
			return " ind_img_" + mRun.author;
		}
	},
	
	updateUserSelections: function(userId, category, orphan, ranges)
	{
		if (!this.userSelections[userId])
			this.userSelections[userId] = {};
		dojo.mixin(this.userSelections[userId], {c:category, ranges: ranges, userId: userId, orphan:orphan, t: new Date()});
	},
	
	destroyUserSelection: function(userId)
	{
		var loc = this.userSelections[userId];
		if (loc)
		{
			var selection = loc.selection;
			if (selection)
			{
				if (selection._cursor)
					selection._cursor.destroy();
				selection.destroy();
				loc.selection = null;
			}
		}
	},
	
	drawUserSelectionsDelayed: function()
	{
		var me = this;
		clearTimeout(this._drawUserTimer);
		this._drawUserTimer = setTimeout(function(){
			me.drawUserSelections();
		}, 100);
	},
	
	drawUserSelections: function()
	{
		var editor = pe.lotusEditor;
		
		clearTimeout(this._drawUserTimer);
		
		if (!this._lastDrawTime)
			this._lastDrawTime = 0;
		
		if (!pe.scene.isIndicatorAuthor())
		{
			for (var userId in this.userSelections)
			{
				this.destroyUserSelection(userId);
			}
			return;
		}
		
		for (var userId in this.userSelections)
		{
			var sObj = this.userSelections[userId];
			var t = sObj.t;
			
			if (!pe.scene.getUsersColorStatus(userId))
			{
				this.destroyUserSelection(userId);
				continue;
			}
			
			var mc = sObj.c;
			
			var msgModel;
			var msgCat = WRITER.MSGCATEGORY;
			switch(mc)
			{
				case msgCat.Style:
					msgModel = editor.styles;
					break;
				case msgCat.List:
					msgModel = editor.number;
					break;
				case msgCat.Setting:
					msgModel = editor.setting;
					break;
				case msgCat.Relation:
					msgModel = editor.relations;
					break;
				case msgCat.Footnotes:
				case msgCat.Endnotes:
					msgModel = editor.relations;
					break;
				default:
					msgModel = editor.document;
					break;
			}
			if (msgModel)
			{
				var ranges = sObj.ranges;
				var rangeObjs = [];
				dojo.forEach(ranges, function(ra){
					
					var startModel = msgModel.byId(ra.startParaId);
					var endModel = ra.collpased ? startModel : msgModel.byId(ra.endParaId);
					var startView = null;
					var endView = null;
					var rootView = null;
					if (startModel)
					{
						if (!ra.rId)
						{
							startView = writer.util.RangeTools.toViewPosition(startModel, ra.startParaIndex);
						}
						else
						{
							// find view by rootView's model id and pageNumber
							var rootModel = msgModel.byId(ra.rId);
							var allViews = rootModel.getAllViews();
							for(var ownerId in allViews){
								var viewers = allViews[ownerId];
								var firstView = viewers.getFirst();
								if (firstView && firstView.page && firstView.page.pageNumber == ra.pageNumber)
								{
									rootView = firstView;
									break;
								}
							}
							if (rootView)
							{
								startView = writer.util.RangeTools.toViewPosition(startModel, ra.startParaIndex, rootView);
							}
						}
					}
					if (ra.collapsed)
					{
						endView = startView;
					}
					else if (endModel)
					{
						if (!ra.rId)
						{
							endView = writer.util.RangeTools.toViewPosition(endModel, ra.endParaIndex);
						}
						else if(rootView)
						{
							endView = writer.util.RangeTools.toViewPosition(endModel, ra.endParaIndex, rootView);
						}
					}
					if (startView && endView)
					{
						var range = new writer.core.Range( startView, endView, rootView);
						rangeObjs.push(range);
					}
				});
				if (rangeObjs.length)
				{
					var shell = pe.lotusEditor._shell;
					if (shell)
					{
						var color = pe.scene.getEditorStore().getUserCoeditColor(userId);
						
						try
						{
							if (!sObj.selection)
								sObj.selection = new writer.controller.Selection({color: color, userId: userId, shell:shell, coEditIndicator:true});
							
							sObj.selection.selectRanges(rangeObjs);
							
							var cursor = sObj.selection._cursor;
							if (cursor)
							{
								var isOrphan = sObj.orphan;
								if (!sObj.orphan)
								{
									cursor.showCoEditIndicator(true);
									sObj.orphan = true;
								}
								else
								{
									if (sObj.t > this._lastDrawTime)
										cursor.detachCoEditIndicator();
								}
								
								sObj.lastOrphan = isOrphan;
							}
						}
						catch(e){}
					}
				}
				else if(sObj.selection)
				{
					if (sObj.selection._cursor)
						sObj.selection._cursor.destroy();
					sObj.selection.destroy();
					sObj.selection = null;
				}
			}
		}
		this._lastDrawTime = new Date();
	}

};
