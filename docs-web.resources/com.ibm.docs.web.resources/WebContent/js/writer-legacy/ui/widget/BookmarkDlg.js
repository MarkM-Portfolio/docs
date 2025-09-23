/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("writer.ui.widget.BookmarkDlg");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.require("writer.util.ModelTools");
dojo.require("dijit.Tree");
dojo.require("dijit.tree.ObjectStoreModel");
dojo.require("dojo.store.Memory");
dojo.require("writer.util.BookmarkTools");
dojo.require("dijit.form.ValidationTextBox");

dojo.requireLocalization("writer.ui.widget","BookmarkDlg");

dojo.declare('writer.ui.widget.BookmarkDlg', [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	nls: null,
	lang: null,
	markDomNode: null,
	MODE : {
		SHOW: 0,
		EDIT: 1,
		CREATE: 2
	},
	bookmarkName: "",
	bookmarkModel: null,
	inserPosition: null,
	editMode: false,
	line: null,
	zIndex : 100,
	bookmarkList: null,
	bookmarkStore: null,
	
	templateString: dojo.cache("writer.ui.widget", "templates/bookmark.html"),
	
	constructor: function(args){
		this.lang = g_locale || navigator.userLanguage || navigator.language;
	},
	
	postMixInProperties: function()
	{
		this.inherited(arguments);
		this.nls = dojo.i18n.getLocalization("writer.ui.widget","BookmarkDlg");
	},
	
	postCreate: function(){	
		this._init();
		this.inherited(arguments);
		pe.scene.addResizeListener(dojo.hitch(this,this.onEditorResized));
		if (BidiUtils.isGuiRtl()) {
			dojo.addClass(this.PopupNode, 'rtl');
			this.inputTextBox.set('dir', 'rtl');
		}
	},	
	
	_init: function(){
		
		var dlg = this, nls = this.nls;
		
		this.inputDom = dojo.byId("C_i_InputBox");
		this.connect( this.inputDom, "onkeydown", function( e ){
				if( ( dojo.keys.ENTER == e.keyCode ) && ( !dlg.okNode.disabled ) ){
					dojo.stopEvent(e);
					dlg._setFocus( dlg.okNode );
					window.setTimeout( function(){
						dlg.onOk();
					}, 200 );
				}
		});	
		
		if( this.inputTextBox ){
			
			this.inputNode = this.inputTextBox.domNode;
			var inputTextBox = this.inputTextBox;
			if (BidiUtils.isBidiOn()){
				var textDir = BidiUtils.getTextDir();

				if (textDir == 'contextual'){
					dojo.connect(this.inputNode, 'onkeyup', dojo.hitch(this, function(){
						this.inputNode.dir = BidiUtils.calculateDirForContextual(this.inputTextBox.get('value'));
					}));
				} else {
	        			this.inputNode.dir = textDir;
				}
			}
			this.inputTextBox.validator = function(){
				var newName = this.getValue();
				var isValid = writer.util.BookmarkTools.isBookmarkNameValid( newName );
				if( isValid ){
					if (BidiUtils.isBidiOn() && (BidiUtils.getTextDir() == 'contextual'))
						this.domNode.dir = BidiUtils.calculateDirForContextual(newName);

					var allBookmarks = writer.util.ModelTools.getAllBookMarks();
					for( var i= 0; i< allBookmarks.length; i++ ){
						if(  !dlg.bookmarkModel || (allBookmarks[i].name != dlg.bookmarkModel.name) ){
							if( allBookmarks[i].name.toLowerCase() == newName.toLowerCase() ){
								this.invalidMessage = nls.error_msg_exist;
								return false;
							}
						}
					}
				}
				else{
					this.invalidMessage = nls.error_msg_invalid;
				}
				//dlg.okNode.disabled = !isValid;
				return isValid;
			};
		}
		// Window resize
		dojo.connect( window, 'onresize', this, '_onResize');
		
		this._initButtons();
		this._accHandler();
		
	},
	_createContent: function(){
	},
	
	_initButtons: function(){	
		this.okNode.innerHTML = this.nls.okBtn;
		this.cancelNode.innerHTML = this.nls.cancelBtn;
		this.editNode.innnerHTML = this.nls.editBtn;
		this.removeNode.innerHTML = this.nls.removeBtn;
	},
	
	_accHandler: function(){
	},
	
	/*******************************************************************************************************************
	 * events
	 */
	_onStickyKeyDown: function(e){
		e = e || window.event;		
		var target = e.srcElement||e.target;
		var keyCode = e.keyCode;		
		if(dojo.keys.TAB == keyCode){
			if( !e.shiftKey ){
				if(target == this.cancelNode || target == this.removeNode ){
					dojo.stopEvent(e);					
					if( this.editMode == this.MODE.SHOW )
						this.bookmarkList.focus();
					else
						this._setFocus(this.inputDom);
				}
			}
			else{
				if(target == this.inputDom ){
					dojo.stopEvent(e);
					this._setFocus(this.removeNode );
				}
				else if( this.bookmarkList && this.bookmarkList.domNode && this.bookmarkList.domNode.contains(target) ){
					dojo.stopEvent(e);
					this._setFocus(this.removeNode );
				}
			}
		}
		else if(dojo.keys.ESCAPE == keyCode){
			this.onCancel();
		}		
	},
    /**
     * key down
     */
	_onKeyDown: function(e){
		e = e || window.event;
		var key = (e.keyCode ? e.keyCode : e.which);
		if(key == 115 && (e.ctrlKey || e.metaKey)){
			if (e.preventDefault) 
				e.preventDefault();
			return;
		}            
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode != dojo.keys.ENTER && e.keyCode != dojo.keys.SPACE) return;   
		this._onclick(e);
	},
	/**
	 * on click
	 */
	_onclick: function(event){
		var key = event.keyCode || event.charCode;
        
		var target = event.target;
		if (target == null) 
			target = event.srcElement; 	
		if(target == this.cancelNode){  
			this.onCancel();
		}else if(target == this.okNode){
			this.onOk();
		}else if( target == this.removeNode){
			this.onRemove();
		}else if( target == this.editNode ){
			this.onEdit();
		}
	},
	/**
	 * paste
	 * @param event
	 */
	_pasteHandler: function(event){
		if(this.bReadOnly)
			return;   	
	},    
	/** end ****************************************************************************************************************/
	
	isShown: function(){
		return !dojo.hasClass(this.PopupNode,"hidden");
	},
	_getMessageCategory: function( bmk ){
		var notes;
		if( writer.util.ModelTools.isInHeaderFooter(bmk))
			return WRITER.MSGCATEGORY.Relation;
		else if( notes = writer.util.ModelTools.getNotes( bmk ) ){
			if( notes.modelType == writer.MODELTYPE.FOOTNOTE )
				return  WRITER.MSGCATEGORY.Footnotes;
			else 
				return WRITER.MSGCATEGORY.Endnotes;
		}
	},
	onOk: function(){
		var name = this.getBookmarkName();
		if( !this.inputTextBox.isValid() ){
			this.inputTextBox.focus();
			return;
		}
		if( this.editMode == this.MODE.EDIT ){
			if( name != this.bookmarkModel.name ){
				var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [WRITER.MSG.createSetAttributeAct( this.bookmarkModel,null,null,{'name':name },{'name': this.bookmarkModel.name } )], this._getMessageCategory(this.bookmarkModel),"bm" );
				WRITER.MSG.sendMessage( [msg] );
				var oldName = this.bookmarkModel.name;
				writer.util.BookmarkTools.renameBookmark( name, this.bookmarkModel );
				var bookmarkNames = this.markDomNode.id;
				if( bookmarkNames ){
					var names = bookmarkNames.split(",");
					for( var i=0; i< names.length; i++ ){
						if(names[i] == oldName )
							names[i] = name;
					}
					this.markDomNode.id = names.join(",");
				}
				this.hide();
			}
			else
				this.onCancel();
		}
		else if( this.editMode == this.MODE.CREATE ){
			if( name && name != ""){
				var bm = {
						"rt" : "bmk",
						"t" : "s",
						"id" :  WRITER.MSG_HELPER.getUUID(),
						"name" : name
					};
				dojo.destroy( this.markDomNode);
				writer.util.ModelTools.insertInlineObject( bm, this.inserPosition.obj, this.inserPosition.index , false);
				this.hide();
			}
			else{
				this.onCancel();
			}
		}
	},
	/*
	 * on remove 
	 * 
	 */
	onRemove: function(){
		var bookMarkModel;
		switch( this.editMode ){
		case this.MODE.SHOW:
			var name = this.bookmarkList.selectedItem && this.bookmarkList.selectedItem.name;
			if( name )
				bookMarkModel = writer.util.ModelTools.getBookMark( name );
			break;
		case this.MODE.EDIT:
			bookMarkModel = this.bookmarkModel;
			break;
		}
		if(  bookMarkModel ){
			var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Text, [WRITER.MSG.createDeleteInlineObjAct( bookMarkModel )], this._getMessageCategory(bookMarkModel),"bm" );
			WRITER.MSG.sendMessage( [msg] );
			var para = bookMarkModel.paragraph;
			para.removeObject(  bookMarkModel );
			para.buildRuns();
			para.markDirty();
			para.parent.update();
			this.hide();
		}
		this.hide();
	},
	
	onEdit: function(){
		if( this.editMode == this.MODE.SHOW ){
			var name = this.bookmarkList.selectedItem && this.bookmarkList.selectedItem.name;
			if( name ){
				var targetline;
				if( this.row ){
					this.row.cells.forEach( function( cell ){
						cell.container.forEach( function( p ){
							p.lines.forEach( function(line){
								if( line.bookMarkDomNode){
									var id = line.bookMarkDomNode.id;
									var names = id.split(",");
									for( var i=0; i< names.length; i++  ){
										if( names[i] == name ){
											targetline = line;
										}
									}
								}
								if( targetline ) return false;
							});
							if( targetline ) return false;
						});
						if( targetline ) return false;
					});
					this.line = targetline;
				}
				this._editSingleBookmark( name );
			}
		}
		else 
			console.error( "In wrong mode !!");
	},
	/**
	 * set bookmark name
	 * for toc
	 */
	setBookmarkName: function( name ){
		this.inputTextBox.setValue(  name );
	},
	/**
	 * get bookmark name
	 */
	getBookmarkName: function( ){
		return this.inputTextBox.getValue();
	},
	/**
	 * is name valid book mark name
	 * contains only 0-9,a-z,A-Z
	 * not begin with 0-9
	 * @returns
	 */
//	isNameValid: function(){
//		var newName = this.getValue();
//		var isValid = writer.util.BookmarkTools.isBookmarkNameValid( newName );
//		if( isValid ){
//			var allBookmarks = writer.util.ModelTools.getAllBookMarks();
//			for( var i= 0; i< allBookmarks.length; i++ ){
//				if( allBookmarks[i].name == newName )
//					return false;
//			}
//		}
//		return isValid;
//	},
	
	onCancel: function(){
		if( this.editMode == this.MODE.CREATE )
			dojo.destroy( this.markDomNode);
		
		this.hide();
		
	},
	
	hideNode: function(node){
		if( node.domNode )
				node = node.domNode;
		if(node && !dojo.hasClass(node,"hidden")){dojo.addClass(node,"hidden");};
	},
	
	showNode: function(node){
		dojo.removeClass(node,"hidden");
	},
	/*
	 * @param noAnimation, if noAnimation is true, don't show animation effect 
	 */
	createBookmark: function( selection ){
		selection.scrollIntoView();
		this.editMode = this.MODE.CREATE;
		var line = this._getLineFromSelection(selection);
		if( line ){
			this.line = line;
			this.markDomNode = writer.util.BookmarkTools.createMarkNode( line );
			dojo.style( this.markDomNode, "display", "block");
		}
		else{
			console.error("Can not create bookmark in this selection!!");
			return;
		}
		
		this.bookmarkName = "";
		this.bookmarkModel = null;
		
		var ranges = selection.getRanges();	
		var text = "";
		if(ranges.length == 1 && ranges[0].isCollapsed()){
			var wordRange = selection && selection.getWordRange();
			if( wordRange ){
				var startPos = wordRange.getStartParaPos();
				var endPos = wordRange.getEndParaPos();
				var para = startPos.obj;
				text = para.text.substring( startPos.index,  endPos.index );
			}
		}else {
			dojo.forEach(ranges,function(range){
				dojo.forEach(range.extractContents(),function(content){
					text += content.c;
				});
			});
		}
		text = text.replace("\u0001","");
		this.bookmarkName = dojo.trim( text );
		this.inserPosition = ranges[0].getStartParaPos();
			
		window.setTimeout(
			dojo.hitch(this, function(){
				this.showNode(this.cancelNode);
				this.hideNode(this.removeNode);
				
				this.showNode(this.okNode);
				this.hideNode(this.editNode);
				
				this.showNode(this.inputNode);
				this.hideNode(this.listWrapper );
				
				this.setBookmarkName( this.bookmarkName || "" );
				this.show();
			}),
			200
		);			
	},
	
	selectionChangeHandler: function(){
		if (this.showing)
		{
			if (this.markDomNode && this.markDomNode.parentNode && this.markDomNode.parentNode.parentNode)
			{
				var line = this._getLineFromSelection(pe.lotusEditor.getSelection());
				if (this.line == line)
					this._locate();
				else
					this.onCancel();
			}
			else
				this.onCancel();
		}
	},
	/**
	 * edit bookmark mode
	 * @param id
	 */
	_editSingleBookmark: function( id ){
		if(BidiUtils.isBidiOn())
			id = BidiUtils.removeUCC(id);

		this.editMode = this.MODE.EDIT;
		var paragraph = this.line.parent.model;
		var bookMarkRun;
		paragraph.container.forEach( function( run ){
			if( run.modelType == writer.MODELTYPE.BOOKMARK && (run.id == id || run.name == id )){
				bookMarkRun = run;
				return false;
			}
		});
		
		if( !bookMarkRun ){
			console.error( "invalid mark node");
			return;
		}
		
		this.bookmarkName = bookMarkRun.name;
		this.bookmarkModel = bookMarkRun;
		window.setTimeout(
				dojo.hitch(this, function(){
					this.hideNode(this.cancelNode);
					this.showNode(this.removeNode);
					dojo.attr(this.removeNode, "style", "");
					this.showNode(this.okNode);
					this.hideNode(this.editNode);
					
					this.showNode(this.inputNode);
					this.hideNode(this.listWrapper );
					
				//	this.okNode.disabled = true;
					this.setBookmarkName( this.bookmarkName || "" );
					this.show();
				}),
				200
		);
	},
	/**
	 * show bookmarks
	 * @param bmNames
	 */
	_showBookmarks: function( bmNames ){
		this.editMode = this.MODE.SHOW;
		
		
		if( this.listWrapper ){
			this.hideNode(this.listWrapper);
			if( this.bookmarkList ){
				this.bookmarkList.destroy();
				dojo.destroy( this.bookmarkList.domNode );
			}
			var data = [{"id":"root","name":"root"}];
			for ( var i=0; i< bmNames.length; i++ ){
				data.push( {"id": bmNames[i], "name": bmNames[i],"parent":"root"});
			}
			
			this.bookmarkStore = new dojo.store.Memory({
				"data": data,
				"getChildren": function( object ){
					var obj = this.query({parent:object.id});
					var bidi = BidiUtils.isBidiOn();
					for(var i = 0; i < obj.length; i++){
						obj[i].label = bidi ? BidiUtils.addEmbeddingUCC(obj[i].name) : obj[i].name;
					}
					return obj;
				}
			});
			var treemodel = new dijit.tree.ObjectStoreModel({
				"store": this.bookmarkStore,
				"query":{"id":"root"},
				"labelAttr": "label"
			});
			
			var dlg = this;
			
			function setNodePos( node, top ){
				if(top > 11)
					top -= 7;
				else
					top = 4;
				dojo.style( node,{
					"marginTop": top+"px"}
					);
				dlg.showNode(node);
			}
			function alignButtons( node ){
				var top = node.domNode.offsetTop;
				setNodePos( dlg.editNode, top );
				setNodePos( dlg.removeNode, top );
			}
			this.bookmarkList = new dijit.Tree( {
				getIconClass:function(){
					return "";
				},
				"aria-label": this.nls.bookmarklist,
				autoExpand: true,
				showRoot:false, 
				onOpen: function(item)
				{
					if (item.id == "root")
						setTimeout(function(){
							dlg._locate();
						}, 500);
				},
				focusNode: function( node ){
					var scrollLeft = this.domNode.scrollLeft;
					this.focusChild(node);
					this.domNode.scrollLeft = scrollLeft;
					this._setSelectedNodeAttr( node );
				},
				_onNodeMouseEnter: function(node){
					alignButtons( node );
					this._setSelectedNodeAttr( node );
				},
				model: treemodel});
			this.bookmarkList.startup();
			this.bookmarkList.placeAt( this.listWrapper );
			this.bookmarkList.set('selectedItems', [bmNames[0]]);
			alignButtons ( this.bookmarkList.getNodesByItem( bmNames[0])[0]);
		}
		
		
		window.setTimeout(
				dojo.hitch(this, function(){
					this.hideNode(this.cancelNode);
					//this.hideNode(this.removeNode);
				
					//this.hideNode(this.editNode);
					this.hideNode(this.okNode);
					
					this.hideNode(this.inputNode);
					this.showNode(this.listWrapper );
					
					this.setBookmarkName( this.bookmarkName || "" );
					//this.bookmarkList.focus();
					this.show();
				}),
				200
		);
	},
	/**
	 * get line from bookmark
	 * @param selection
	 * @returns
	 */
	_getLineFromSelection: function( selection ){
		 return writer.util.ModelTools.getLineFromSelection( selection );
	},
	/**
	 * edit bookmark
	 */
	editBookmark: function( line, selection ){
		if( !line  ){
			if( selection ){
				line = this._getLineFromSelection(selection);
			}
		}
		if( !line ){
			console.error("no text line in the selection!!");
			return;
		}
		this.markDomNode = line.bookMarkDomNode;
		this.line = line;
		if( !this.markDomNode ){
			console.error( "invalid mark node!!!");
			return;
		}
		//init bookmark model and name 
		var bmNames = [];
		
		function getBmNames( domNode ){
			var id = domNode.id;
			var names = [];
			if( id && id != "")
				names = id.split(",");
			else
				console.error("no bookmark refer to this domNode");
			return  names;
		}
		
		var rowId = dojo.attr( this.markDomNode, "row_id");
		var topPos = dojo.attr( this.markDomNode,"line_top");
		if( rowId ){
			var row = writer.util.ViewTools.getRow( line );
			this.row = row;
			if( row ){
				dojo.query("img[row_id = \""+ rowId +"\"]", row.domNode ).forEach( function( node ){
					if( dojo.attr( node,"line_top") == topPos )
						bmNames = bmNames.concat( getBmNames( node ));
				});
			}
		}
		else{
			this.row = null;
			bmNames = getBmNames(  this.markDomNode );
		}
		if( bmNames.length > 1 ){
			 return this._showBookmarks( bmNames );
		}
		else if( bmNames.length == 1 )
			this._editSingleBookmark(bmNames[0]);
		
	},
	
	close: function(notChangeFocus){
		if(!this.isShown())
			return;
		
		if( this.editMode == this.MODE.CREATE )
			dojo.destroy( this.markDomNode);
		
		this.hide(notChangeFocus);
	},
	
	onBlur: function()
	{
	   this.close();
	},
	
	/**
	 * show 
	 */
	show: function(){
		if(pe.lotusEditor.popupPanel && this != pe.lotusEditor.popupPanel ){
			pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close(true);
		}
		pe.lotusEditor.popupPanel = this;
		
		
		this._locate();
		this._selectionChangeEvtConnect = dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.selectionChangeHandler);
		this._scrollConnector = dojo.connect(concord.util.browser.getEditAreaWindow(), 'onscroll', this, function(){
			this.onCancel();
		});
		dojo.removeClass(this.PopupNode,"hidden");
		this._initFocus();
		this.showing = true;
	},
	
	/**
	 * hide 
	 */
	hide: function(notChangeFocus){
		dojo.addClass(this.PopupNode,"hidden");
		if( this.markDomNode && !this.editMode){
			dojo.style(this.markDomNode,"display","");
		}
		dojo.unsubscribe( this._selectionChangeEvtConnect );
		dojo.disconnect( this._scrollConnector );
		!notChangeFocus && pe.lotusEditor.focus();
		this.showing = false;
	},
	
	_initFocus: function(){
		if( this.editMode == this.MODE.SHOW )
			this._setFocus(this.editNode);
		else if( this.editMode == this.MODE.CREATE && this.inputTextBox.getValue())
			this._setFocus(this.okNode);
		else
			this.inputTextBox.focus();
	},
	
	/**
	 * set focus
	 * @param node
	 */
	_setFocus: function(node){
		window.setTimeout(
				dojo.hitch(this, function(){
					if(node) {
						node.focus();
					}
				}),50
		);		
	},
	/***********************************************************
	 * layout
	 */
	/**
	 * Calculate the popup dialog's position
	 * @param rectified, which is for reply action
	 */
	_locate: function(){
		if( this.markDomNode ){
			var left = 0,
				top = 0;
			var tmpNode = this.markDomNode;
			while( tmpNode && tmpNode.id != "editor" ){
				if( dojo.style( tmpNode, "position") != "static" ) {
					left += tmpNode.offsetLeft;
				}
				tmpNode = tmpNode.parentNode;
			}
			var offsetTop = dojo.byId("mainNode").offsetTop;
			var lineTop =  this.line.getTop()
			top = lineTop + offsetTop + 43;
			if (BidiUtils.isGuiRtl()) {
				dojo.removeClass(this.PopupNode,"hidden");
				left += pe.scene.sidebar.domNode.offsetWidth - dojo.style(this.PopupNode,"width");
			} else {
				left -= 28;
			}
			var scrollH = pe.lotusEditor.getScrollPositionH();
			top -= pe.lotusEditor.getScrollPosition();
			left -= scrollH;
			var offset = 0;
			if( !scrollH && left < 0 ){
				offset = left;
				left = 0;
			}
			var height = dojo.marginBox(this.PopupNode).h;
			var scrollHeight = dojo.byId("mainNode").scrollHeight;

			dojo.style(this.PopupNode,"left",left +"px");
			var useDown = false;
			if (top + height > offsetTop + scrollHeight)
			{
				top -= height + 43;
				useDown = true;
			}
			dojo.style(this.PopupNode,"top", top +"px");
			this._locateArrow( offset, useDown);
		}
		else
			this.hide( offset );
			
	},
	/**
	 * @param arrowup
	 * @param leftPos
	 * @param rectified
	 * @param isShown
	 */
	_locateArrow: function( offset, useDown ){
		
		var iconDx = 10; //revise value
		var iconDy = 10; //revise value
		
		var boxHeight = this.PopupNode.clientHeight;
		var boxWidth = dojo.style(this.PopupNode,"width");
		
		dojo.attr(this.arrowNode,"src",contextPath + window.staticRootPath + '/images/bookmark_'+(useDown?'down':'up')+'_arrow.png');
		dojo.addClass(this.arrowNode,"arrowup");
		if (useDown)
		{
			dojo.style(this.arrowNode,"top",boxHeight + "px");
		}
		else
		{
			dojo.style(this.arrowNode,"top","-14px");
		}
		dojo.style(this.arrowNode,"postion","absolute");
		var left = offset + (BidiUtils.isGuiRtl() ? boxWidth - iconDx : 30);

		dojo.attr(this.arrowNode,'alt','');
		dojo.style(this.arrowNode,"left",left +"px");
		dojo.style(this.arrowNode,"display", "block" );
	},
	/**
	 * relocate bookmark panel 
	 * when browser resize
	 */
	_onResize: function(){
		this._locate();
	}
	/************************end *********************************************/
	});
