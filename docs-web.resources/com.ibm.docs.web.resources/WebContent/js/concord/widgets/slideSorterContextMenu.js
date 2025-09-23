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

dojo.provide("concord.widgets.slideSorterContextMenu");

dojo.require("concord.widgets.presMenu");
dojo.require("dijit.Menu");
dojo.require("concord.task.TaskUtil");

dojo.declare("concord.widgets.slideSorterContextMenu", concord.widgets.presMenu, {
    currentSlideNode : null,

    constructor: function(){
        this.contentMenuId = new Date().getTime();
        this._createSlide = "ctx_"+this.contentMenuId+"_createSlide";
        this._deleteSlide = "ctx_"+this.contentMenuId+"_deleteSlide";
        this._slideLayout = "ctx_"+this.contentMenuId+"_slideLayout";
        this._slideTemplate = "ctx_"+this.contentMenuId+"_slideTemplate";
        this._moveUp = "ctx_"+this.contentMenuId+"_moveUp";
        this._moveDown = "ctx_"+this.contentMenuId+"_moveDown";
        this._cut = "ctx_"+this.contentMenuId+"_cut";
        this._copy = "ctx_"+this.contentMenuId+"_copy";
        this._pasteBefore = "ctx_"+this.contentMenuId+"_pasteBefore";
        this._pasteAfter = "ctx_"+this.contentMenuId+"_pasteAfter";
        this._assign = "ctx_"+this.contentMenuId+"_assign";
        this._assignSlide = "ctx_"+this.contentMenuId+"_assignSlide";
        this._deleteAssigned = "ctx_"+this.contentMenuId+"_deleteAssigned";        
        this._showAll = "ctx_"+this.contentMenuId+"_showAll";
        this._hideAll = "ctx_"+this.contentMenuId+"_hideAll";
        if(BidiUtils.isGuiRtl())
		this.dir = 'rtl';
    },

    initialize: function(slidesorter, currentslide){
        this.slideSorter = slidesorter;
        this.currentSlideNode = currentslide;
        this.bindDomNode(currentslide);

        // Do not created context menu for slide sorter
        // in view draft mode
        if (!window.pe.scene.isViewDraftMode()) {
	        dojo.addClass(this.domNode,"lotusActionMenu");
	        this.createContextMenuChildren();
	
	        dojo.connect(this, "onKeyDown", dojo.hitch(this, this.contextMenuKeyHandler));
	        dojo.connect(this, "onKeyUp", dojo.hitch(this, this.contextMenuKeyHandler));
	        dojo.connect(this, "onKeyPress", dojo.hitch(this, this.contextMenuKeyHandler));
        }
    },

    // Stop all keys (except ESC) from being handled when it is pressed while on the slidesorter context menu.
    // This allows the context menu to still handle keys "normally", but stops us from doing our default action
    // such as "create a new slide" when the enter key is pressed on the slidesorter area.
    contextMenuKeyHandler: function(evt) {
        if (evt.keyCode != dojo.keys.ESCAPE){
            dojo.stopEvent(evt);
        }
    },

    bindContextMenuToSlide: function ( slideElem ){
        if (this.currentSlideNode) {
            this.unBindDomNode(this.currentSlideNode);
        }
        this.currentSlideNode = slideElem;
        this.bindDomNode(slideElem);
        var ctxMenuStatus = this.slideSorter.contextMenuStatusArray[ slideElem.id ];
        if ( ctxMenuStatus){
            for ( var menuItemId in ctxMenuStatus){
                if( menuItemId && ctxMenuStatus.hasOwnProperty(menuItemId)){
                    var isToHide = ctxMenuStatus[menuItemId].isToHide;
                    var paramObj = ctxMenuStatus[menuItemId].paramObj;
                    this.updateContextMenuItem( menuItemId, paramObj, isToHide);
                }
            }
        }
        this.updateContextMenuActions();
        this.updateContextMenuOptions();
    },

    destroyWidgetbyId: function(id){
        var widget = dijit.byId(id);
        if (widget!=null){
            widget.destroyRecursive();
            return true;
        } else
            return false;
    },

    createContextMenuChildren: function (){
        //Below check is unlikely to be true. Just to be safe.
        if(this.destroyWidgetbyId(this._createSlide)){
            this.destroyWidgetbyId(this._deleteSlide);
            this.destroyWidgetbyId(this._slideLayout);
            this.destroyWidgetbyId(this._slideTemplate);
            this.destroyWidgetbyId(this._moveUp);
            this.destroyWidgetbyId(this._moveDown);
            this.destroyWidgetbyId(this._cut);
            this.destroyWidgetbyId(this._copy);
            this.destroyWidgetbyId(this._pasteBefore);
            this.destroyWidgetbyId(this._pasteAfter);	
            this.destroyWidgetbyId(this._assign);	
        }

        this.addChild(new dijit.MenuItem({
            id:this._createSlide,
            label: this.slideSorter.STRINGS.ctxMenu_CREATE_SLIDE,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.createSlide,this.currentSlideNode),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuSeparator());

        var memLeakObjArray = [];
        memLeakObjArray.push({'type':'menu', 'obj':this});
        if (this.slideSorter.ctxMemLeakHash[this.contentMenuId]==null){
            this.slideSorter.ctxMemLeakHash[this.contentMenuId]=memLeakObjArray;
        }

        this.addChild(new dijit.MenuItem({
            id:this._slideLayout,
            label:this.slideSorter.STRINGS.ctxMenu_SLIDE_LAYOUT,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.showLayoutDialog),
            dir: this.dir
        }));

//        this.addChild(new dijit.MenuItem({
//            id:this._slideTemplate,
//            label:this.slideSorter.STRINGS.ctxMenu_SLIDE_TEMPLATES,
//            onClick:dojo.hitch(this.slideSorter,this.slideSorter.showDesignDialog)
//        }));

        this.addChild(new dijit.MenuItem({
            label:this.slideSorter.STRINGS.ctxMenu_SLIDE_TRANSITION,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.showSlideTransitionDialog),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuSeparator());

        this.addChild(new dijit.MenuItem({
            id:this._deleteSlide,
            label:this.slideSorter.STRINGS.ctxMenu_DELETE_SLIDE,
            //onClick:dojo.hitch(this,this.deleteSlide,node.parentNode)
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.deleteSlides),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuItem({
            id:this._moveUp,
            label:this.slideSorter.STRINGS.ctxMenu_MOVE_UP,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.moveSlideUp,this.currentSlideNode.parentNode),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuItem({
            id:this._moveDown,
            label:this.slideSorter.STRINGS.ctxMenu_MOVE_DOWN,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.moveSlideDown,this.currentSlideNode.parentNode),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuSeparator());

        this.addChild(new dijit.MenuItem({
            id:this._cut,
            label:this.slideSorter.STRINGS.ctxMenu_CUT,
            onClick: dojo.hitch(window.pe.scene,window.pe.scene.showMenusErrorMsg,"cut"),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuItem({
            id:this._copy,
            label:this.slideSorter.STRINGS.ctxMenu_COPY,
            onClick: dojo.hitch(window.pe.scene,window.pe.scene.showMenusErrorMsg,"copy"),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuItem({
            id:this._pasteBefore,
            label:this.slideSorter.STRINGS.ctxMenu_PASTE_BEFORE,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.pasteSlides,this.slideSorter.PASTE_BEFORE),
            dir: this.dir
        }));

        this.addChild(new dijit.MenuItem({
            id:this._pasteAfter,
            label:this.slideSorter.STRINGS.ctxMenu_PASTE_AFTER,
            onClick:dojo.hitch(this.slideSorter,this.slideSorter.pasteSlides,this.slideSorter.PASTE_AFTER),
            dir: this.dir
        }));
        this.addChild(new dijit.MenuSeparator());
        
        if(window.pe.scene.bAssignment){
        	var assignMenu = new dijit.Menu();
			dojo.addClass(assignMenu.domNode,"lotusActionMenu");
			assignMenu.domNode.style.display ='none';
			document.body.appendChild(assignMenu.domNode);
		
        	var assignMItem = new dijit.MenuItem({
        		id: this._assignSlide,
        		label: this.slideSorter.STRINGS.ctxMenu_AssignTheSlide,
        		onClick:concord.task.TaskUtil.publishAssignSlides,
			dir: this.dir
        	});	

        	assignMenu.addChild(assignMItem);
        
        	var deleteMItem = new dijit.MenuItem({
        		id: this._deleteAssigned,
        		label: this.slideSorter.STRINGS.ctxMenu_DeleteTask,
        		onClick:concord.task.TaskUtil.publishUnassign,
			dir: this.dir
        	});	
        	assignMenu.addChild(deleteMItem);
                        
        	var saSlide = new dijit.MenuItem({
        		id: this._showAll,
        		label: this.slideSorter.STRINGS.ctxMenu_SHOW_ALL,
        		onClick: concord.task.TaskUtil.publishShowAllAssignments,
			dir: this.dir
        	});
        	assignMenu.addChild(saSlide);
        
			var haSlide = new dijit.MenuItem({
        		id: this._hideAll,
        		label: this.slideSorter.STRINGS.ctxMenu_HIDE_ALL,
        		onClick: concord.task.TaskUtil.publishHideAllAssignments,
        		dir: this.dir
        	});
        	assignMenu.addChild(haSlide);    
	
			var pMItem = new dijit.PopupMenuItem(
			{
				id: this._assign,
				label: this.slideSorter.STRINGS.ctxMenu_Assign,
				popup: assignMenu,
				dir: this.dir
			});
			dojo.style( pMItem.arrowWrapper, 'visibility', '' );
		
			this.addChild(pMItem);	        	
        }
        
        //T15714 Let's disable paste option if pasting content from another document
        dojo.connect(this,'onOpen',this,'chckPasteFromOtherDoc');
    },

    // T15714
    // Disables context menus paste if clipboard content is from other document
    //
    chckPasteFromOtherDoc: function(){
        var pasteMenuBefore = dijit.byId(this._pasteBefore);
        var pasteMenuAfter = dijit.byId(this._pasteAfter);
        if (pasteMenuAfter ==null || pasteMenuBefore==null){
            return;
        }
        if (!window.pe.scene.isUserInEditMode() &&
            window.pe.scene.checkClipboardFromOtherDoc()){			
            pasteMenuAfter.attr('disabled',true);
            pasteMenuBefore.attr('disabled',true);
            return;			
        }		
        pasteMenuAfter.attr('disabled',false);
        pasteMenuBefore.attr('disabled',false);
    },	

    updateContextMenuOptions: function() {
        if (window.pe.scene.isViewDraftMode())
            return;

        var slideNumber = this.slideSorter.getSlideNumber(this.currentSlideNode);

        var selectAll = this.slideSorter.multiSelectedSlides.length === this.slideSorter.slides.length;
        dijit.byId(this._deleteSlide).setDisabled(selectAll);
        dijit.byId(this._cut).setDisabled(selectAll);

        //Disable move up move down first
        dijit.byId(this._moveUp).setDisabled(true);
        dijit.byId(this._moveDown).setDisabled(true);
        
        //Enable move up move down only if just one slide is selected
        // defect 32521 disable move up/down menue items if the slide is selected/viewed by others
        if(!selectAll && this.slideSorter.multiSelectedSlides.length === 1&&!this.slideSorter.isMultiSlidesHaveLockedSlide()){
            if ( slideNumber != 1) {
                dijit.byId(this._moveUp).setDisabled(false);
            }
            
            if ( slideNumber != this.slideSorter.slides.length ) {
                dijit.byId(this._moveDown).setDisabled(false);
            }
        }
    },

    updateContextMenuItem: function( menuItemToUpdateId,paramObj,isToHide) {
        if (window.pe.scene.isViewDraftMode())
            return;

        var myMenuItem = dijit.byId("ctx_" + this.contentMenuId + menuItemToUpdateId);
        if(myMenuItem!=null){

            for(keyParam in paramObj){
                if(keyParam == "popup"){
                    //destroy the old popup
                    if (myMenuItem.popup!=null) myMenuItem.popup.destroy();
                }
                myMenuItem[keyParam]= paramObj[keyParam];
                if(keyParam == "disabled"){
                    myMenuItem.setDisabled(paramObj[keyParam]);
                }
                if(keyParam == "label"){
                    myMenuItem.setLabel(paramObj[keyParam]);
                }

            }
            if(isToHide){
                dojo.style(myMenuItem.domNode, "display", "none");
            }else{
                dojo.style(myMenuItem.domNode, "display", "");
            }
            this.startup();
            this.slideSorter.publishSlideSelectedTaskMenu();
        }
    },

    updateContextMenuActions: function(){
        if (window.pe.scene.isViewDraftMode())
            return;
        var createSlideMenuItem = dijit.byId(this._createSlide);
        if ( createSlideMenuItem){
            createSlideMenuItem.onClick = dojo.hitch(this.slideSorter,this.slideSorter.createSlide,this.currentSlideNode);
        }
        var moveUpMenuItem = dijit.byId(this._moveUp);
        if ( moveUpMenuItem){
            moveUpMenuItem.onClick = dojo.hitch(this.slideSorter,this.slideSorter.moveSlideUp,this.currentSlideNode.parentNode);
        }
        var moveDownMenuItem = dijit.byId(this._moveDown);
        if ( moveDownMenuItem){
            moveDownMenuItem.onClick = dojo.hitch(this.slideSorter,this.slideSorter.moveSlideDown,this.currentSlideNode.parentNode);
        }
    },

    updateContextTaskMenu: function (params){
        if (window.pe.scene.isViewDraftMode())
            return;

        if(window.pe.scene.bAssignment){
        	var isEnabled = params.isEnabled;
        	var isTasked = params.isTasked;
        	var assignMenuItem = dijit.byId(this._assign);
        	if(!isEnabled) { 
        		assignMenuItem.setDisabled(true);
        		return;
        	}else{
        		assignMenuItem.setDisabled(false);
        	}
        	var widget =  dijit.byId(this._assignSlide);
        	if(widget){                   
        		dojo.style(widget.domNode, "display", isTasked ? "none":""); 
        	}
        	widget =  dijit.byId(this._deleteAssigned);
        	if(widget){                   
        		dojo.style(widget.domNode, "display", isTasked ? "":"none"); 
        	}
        }
    }
});
