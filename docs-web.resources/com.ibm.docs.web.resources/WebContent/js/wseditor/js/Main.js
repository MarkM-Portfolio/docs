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

dojo.provide("websheet.Main");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("websheet.Constant");
//dojo.require("websheet.Toolbar");
dojo.require("websheet.layout.WorksheetContainer");
dojo.require("websheet.layout.CollaboratorContainer");
dojo.require("dojo.fx.easing");
dojo.require("dojox.layout.ExpandoPane");
dojo.require("websheet.Controller");
dojo.require("websheet.Helper");
dojo.require("websheet.Connector");
dojo.require("websheet.event.Transformer");
dojo.require("websheet.style.StyleCode");
dojo.require("websheet.model.PartialManager");
dojo.require("websheet.model.PartialCalcManager");
dojo.require("websheet.CalcManager");
dojo.require("websheet.model.Column");
dojo.require("websheet.model.Row");
dojo.require("websheet.model.Cell");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.model.SetRangeHelper");
dojo.require("websheet.event.undo.UndoManager");
//dojo.require("websheet.collaboration.TaskHandler");
dojo.require("websheet.widget.AutoFilterHandler");
dojo.require("websheet.widget.NameRangeHandler");
dojo.require("websheet.collaboration.CommentsHandler");
dojo.require("websheet.Clipboard");
dojo.require("websheet.FormatPainter");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("websheet.Utils");
dojo.require("concord.util.browser");
dojo.require("concord.util.dialogs");
dojo.require("concord.util.uri");
dojo.require("dojox.uuid.generateRandomUuid");
dojo.require("websheet.functions.FormulaTranslate");
dojo.require("websheet.BorderStyle");
dojo.requireLocalization("websheet","base");
dojo.requireLocalization("concord.scenes", "ErrorScene");
dojo.requireLocalization("concord.widgets","CKResource");
dojo.require("concord.util.BidiUtils");
dojo.require("websheet.widget.PaneManager");
dojo.require("concord.util.mobileUtil");
dojo.declare("websheet.Main", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: dojo.cache("websheet", "templates/Base.html"),
    widgetsInTemplate: true,
    collaboratorContainer: null,
    _connector: null,
    controller: null,
    _eventHdl: null,
    _undoManager: null,
    _partialManager: null,
    _partialCalcManager: null,
    _calcManager: null,
    _clipboard: null,
    _formatpainter: null,
    _painter: null,
    enableFormulaAutoComplete:true,
    saveDlg: null,
    importDlg: null,    
    allFormulaDlg: null,
    insertImageDlg: null,
    printOptsDlg : null,
    prefSettingsDlg : null,
    sortDialog : null,
    filebrowserImageUploadUrl: "",
    filebrowserTextFileUploadUrl: "",
    urlUploaderUrl : "",
    scene: null, // SheetDocScene
    settings: null, // window["pe"].settings
    maxRow: 0, // the maxinum numebr of rows in one sheet
    partialLevel: websheet.Constant.PartialLevel.ROW,
    mobileBridge: concord.util.mobileUtil.jsObjCBridge,
    
    _currentSheetId: null, // the sheet id of the current sheet, it would be used in several callbacks 
    					   // of sheet related dialog such as rename, move, delete
	_needFocus: true, // if this flag is false, then when call focus2grid, it would do nothing
	setFocusFlag: function(state) {
		this._needFocus = state;
	},
    toolbarNode:null,
    /**
     * Comments Handler
     */
    _commentsHdl: null,
    
    _nameHdl: null,
    
    /**
     * Task Handler
     */
    _taskHdl: null,
    /**
     * Chart Handler
     */
    _chartHdl: null,
    /**
     * Find and replace
     */
    _freezeHdl: null,
    
    /**
     * ACL handler
     */
    _aclHandler: null,
    
    _findReplaceHdl : null,
    _imageHdl: null,
    _shapeHdl: null,
    _drawFrameHdl: null,
    
    _autoFilterHdl: null,
    formulaBar:null,
    nls:null,
    commentsActImg	:	window.contextPath + window.staticRootPath + "/styles/css/websheet/img/withComment2.gif",
    commentsInactImg:	window.contextPath + window.staticRootPath + "/styles/css/websheet/img/withComment1.gif",
    coeditImg		:	window.contextPath + window.staticRootPath + "/styles/css/websheet/img/ico_coedit.gif",
    unsupportedImg	: 	window.contextPath + window.staticRootPath + "/styles/css/websheet/img/ico_notice1.gif",
    
    autoComplete: true,
    
    lockIcon : window.contextPath + window.staticRootPath + "/styles/css/websheet/img/sheetLock.png",
    
    constructor: function(args){
        websheet.Constant.init();
        websheet.functions.Formulas.init();
        dojo.mixin(this, args);
        
        if(this.settings && !this.settings.getIndicator()) {
        	this.hasColorShading = false;
        	if(window["pe"].coeditingIndicatorMenuItem)
        		window["pe"].coeditingIndicatorMenuItem.attr("checked", false);
        } else 
        	this.hasColorShading = true;
        
        if (dojo.isFunction(this.onLoad)) {
            try {
                this.onLoad.call(this);
            } 
            catch (e) {
                console.error('Error running custom onLoad code');
            }
        }
        this._connector = new websheet.Connector({controller: this.getController(), editor: this});
		this._undoManager = new websheet.event.undo.UndoManager(this);        
        if(args.toolBar)
    	    this.setToolbar(args.toolBar);
    	if(args.formulaBar)
    	    this.setFormulaBar(args.formulaBar);
		this._clipboard = new websheet.Clipboard(this);
		this._formatpainter = new websheet.FormatPainter(this);
		this.paneMgr = new websheet.widget.PaneManager();
		this.nls = dojo.i18n.getLocalization("websheet","base");
		if (this.settings)
			this.autoComplete = this.settings.getAutoComplete();
    },
    
    postCreate: function(){
    	websheet.model.ModelHelper.setEditor(this);
        this.getWorksheetContainer().setBase(this);
        this.getCollaboratorContainer().setBase(this);
        this.getToolbar() && this.getToolbar().setBase(this);
        this.getFormulaBar() && this.getFormulaBar().setBase(this);
        websheet.event.DocumentAgent.setBase(this);
        this.setWorksheetHeight();
		concord.util.events.subscribe(concord.util.events.doc_header_dom_changed, this, function()
		{
			this.setWorksheetHeight();
			this.getWorksheetContainer().resize();
		});
		if (concord.util.browser.isMobile() && pe.scene.bJSMobileApp) {
			// for sheet context menu in mobile
			var self = this;
			var sheetTabList = this.getWorksheetContainer().tablist.tablistWrapper;
			dojo.connect(sheetTabList,"ontouchstart", function(e){
				if (e.touches.length === 2)
				  return;
				self.bodyTouchNode = e.target;
				self.bodyTouchStartEvent = e;
			});
			dojo.connect(sheetTabList, dojox.gesture.tap, function(e){
			});
			dojo.connect(sheetTabList, dojox.gesture.tap.hold, function(e){
				self.popupSheetContextMenu(e);
			});
			dojo.connect(sheetTabList,"ontouchend", function(e){
				if (e.touches.length === 2)
				  return;
				dojo.stopEvent(e);
			});
		}
    },
    

	getSheetContextMenu: function()
	{
		if(!this.sheetContextMenu) {
			this.sheetContextMenu = dijit.byId("sheet_context_menu");
		}
		return this.sheetContextMenu;
	},
	
	popupSheetContextMenu: function(e)
	{
		this.getSheetContextMenu()._scheduleOpen(this.bodyTouchNode,null, {x: this.bodyTouchStartEvent.pageX, y: this.bodyTouchStartEvent.pageY});
	},
	
    getConnector: function(){
        return this._connector;
    },
    
    getEventHdl: function(){
    	if (!this._eventHdl) {
    		this._eventHdl = new websheet.event.Transformer();
    	}
    	return this._eventHdl;
    },

    getUndoManager: function() {
    	return this._undoManager;
    },
        
    getTaskMan: function() {
    	return this.getDocumentObj()._taskMgr;
    },
    
    getPaneMgr: function() {
    	return this.paneMgr;
    },
    getPartialManager: function() {
    	if(!this._partialManager){
    		this._partialManager = new websheet.model.PartialManager(this.partialLevel);
    	}
    	return this._partialManager;
    },
    
    getPartialCalcManager: function() {
    	if(!this._partialCalcManager){
    		this._partialCalcManager = new websheet.model.PartialCalcManager(
    				{controller:this.getController()});
    	}
    	return this._partialCalcManager;
    },
    
    getInstanseOfPCM:function()
    {
    	return new websheet.model.PartialCalcManager({controller:this.getController()});
    },
    
    getCalcManager: function() {
    	if(!this._calcManager){
    		this._calcManager = new websheet.CalcManager({controller:this.getController()});
    	}
    	return this._calcManager;
    },
    
    getRowHeaderWidth: function(){
    	if(this._headerWidth != null)
    		return this._headerWidth;
    	else
    		return (this._headerWidth = parseInt(this.getCurrentGrid().geometry.GRID_HEADER_WIDTH));
    },
    
	getTaskHdl: function(/*boolean*/bCreate){
		return null;
		if (!bCreate) return this._taskHdl;
		
		if (!this._taskHdl && websheet.Utils.isSocialEnabled()) {
			 dojo["require"]("concord.concord_sheet_extras");
            this._taskHdl = new websheet.collaboration.TaskHandler(this);
            this._taskHdl.loadTasks();
        }
		return this._taskHdl;
	},
	
	getNameRangeHdl: function(){
		if (!this._nameHdl) {
            this._nameHdl = new websheet.widget.NameRangeHandler(this);
        }
		return this._nameHdl;
	},
	
    getCommentsHdl: function(){
		 if (!this._commentsHdl) {
            this._commentsHdl = new websheet.collaboration.CommentsHandler(this);
        }
		return this._commentsHdl;
	},
	
	getDataValidationHdl: function(bCreate){
		if(!this._dataValidationHdl && bCreate){
			dojo["require"]("concord.concord_sheet_extras");
			this._dataValidationHdl = new websheet.DataValidation.DataValidationHandler(this);
		}
		return this._dataValidationHdl;
	},
	
	getImageHdl: function() {
		if (!this._imageHdl) {
			this._imageHdl = new websheet.widget.ImageHandler(this);
			if(!this._drawFrameMgr)
				this._drawFrameMgr = new websheet.widget.DrawFrameManager();
			this._drawFrameMgr.addHandler(this._imageHdl);
		}
		return this._imageHdl;
	},
	
	getShapeHdl: function() {
		if (!this._shapeHdl) {
			this._shapeHdl = new websheet.widget.ShapeHandler(this);
			if(!this._drawFrameMgr)
				this._drawFrameMgr = new websheet.widget.DrawFrameManager();
			this._drawFrameMgr.addHandler(this._shapeHdl);
		}
		return this._shapeHdl;
	},
	
	getACLHandler: function(){
		if(!this._aclHandler)
		{
			dojo["require"]("concord.concord_sheet_extras");
			this._aclHandler = new websheet.ACL.PermissionController(this);
		}
		return this._aclHandler;
	},
	
	hasACLHandler: function()
	{
		return g_enableACL && !!this._aclHandler;
	},
	
	hasACLInDoc: function()
	{
		if(this.hasACLHandler())
		{
			var aclHandler = this.getACLHandler();
			return aclHandler.hasValidPermission();
		}	
		return false;
	},
	
    imageProperties: function(handler){
    	var imgRanges = handler.getSelectedDrawFramesInCurrSheet();
    	var controller = this.getController();
    	var docObj = this.getDocumentObj();
    	if(imgRanges.length !=0 ){
    		var imageRange = imgRanges[0];	 
    		var sheetName = this.getCurrentGrid().getSheetName();		
    		var grid = controller.getGrid(sheetName);
    		handler.scrollFrameIntoView(imageRange, true);
    		var imageDiv = handler.getDrawFrameDivbySheetName(sheetName, imageRange.getId());
    		if(!this._imagePropHdl){				
 				dojo["require"]("concord.concord_sheet_widgets");	 							
		    		this._imagePropHdl = new websheet.widget.ImagePropHandler(this,grid, imageRange, imageDiv);
 		    }else{
 		    	this._imagePropHdl.updateImageRange(grid, imageRange, imageDiv); 		    	
 		    }
 		    this._imagePropHdl.showDlg(); 				
    	}	 	
    },
    
    chartProperties: function()
    {
    	var chartHdl = this.getChartHdl();
    	chartHdl.chartProperties();
    },
    
	navigator: function(){
		if(!this._navigatorHdl){			
			dojo["require"]("concord.concord_sheet_widgets");		
			this._navigatorHdl = new websheet.widget.NavigatorHandler(this);
		}
		this._navigatorHdl.showDlg();	
	},
    
	getChartHdl : function(){
		if (!this._chartHdl) {
            this._chartHdl = new websheet.widget.ChartHandler(this);
            if(!this._drawFrameMgr)
            	this._drawFrameMgr = new websheet.widget.DrawFrameManager();
            this._drawFrameMgr.addHandler(this._chartHdl);
        }
		return this._chartHdl;
	},
	
	getAutoFilterHdl : function(){
		if(!this._autoFilterHdl)
        	this._autoFilterHdl = new websheet.widget.AutoFilterHandler(this);
		return this._autoFilterHdl;
	},
	
	getDrawFrameHdl : function(){
		if(!this._drawFrameMgr)
        	this._drawFrameMgr = new websheet.widget.DrawFrameManager();
		return this._drawFrameMgr;
	},
	
	getDrawFrameHdlByUsage: function(usage) {
		switch(usage){
		case websheet.Constant.RangeUsage.IMAGE:
			return this.getImageHdl();
		case websheet.Constant.RangeUsage.SHAPE:
			return this.getShapeHdl();
		case websheet.Constant.RangeUsage.CHART:
			return this.getChartHdl();
		default:
			return this.getDrawFrameHdl();
		}
	},
	
	getFindReplaceHdl:function(){
		if(!this._findReplaceHdl){
			dojo["require"]("concord.concord_sheet_widgets");
			this._findReplaceHdl = new websheet.widget.FindReplaceHandler(this);
			this._findReplaceHdl.startListening(this.getController());			
		}
		return this._findReplaceHdl;
	},
	
	getFreezeHdl: function(){
		if(!this._freezeHdl){
			this._freezeHdl = new websheet.widget.FreezeHandler(this);
			this._freezeHdl.startListening(this.getController());	
		}
		return this._freezeHdl;
	},
	
	/*
	 * The convenient function to get document model
	 */
	/*Model*/getDocumentObj: function() {
		return this.getController().getDocumentObj();
	},
	
	/*
	 * The convenient function to get controller
	 */
	/*controller*/getController: function() {
        if (!this.controller) {
            this.controller = new websheet.Controller({
                editor: this
            });
        }
        return this.controller;
	},
	
	reset: function() {
		// Summary: reset this model environment before loadDocument(), all other components that keeps reference of document object
		// 	needs to clear it to null. Also needs to clear handlers or other objects to null in condition. This function also calls Controller
		//	reset() to clear grids related objects, etc.
        this._calcManager = null;
        this._partialManager = null;
        this._partialCalcManager = null;
        this.getTaskMan()._clean();
        websheet.model.ModelHelper.docObj = null;
        this.getController()._documentObj = null;
        // for social assignments, TaskHandler needs to be reset
        this._taskHdl = null;
        this.getController()._list = [];
        if (this.getController()._inlineEditor) {
        	this.getController().getInlineEditor().startListening(this.getController());
        }
        if(this._drawFrameMgr)
        	this._drawFrameMgr.reset();
        if(this._freezeHdl)
        	this._freezeHdl.reset();
        this._chartHdl = null;
        this._imageHdl = null;
        this._shapeHdl = null;
        this._drawFrameMgr = null;
        this._freezeHdl = null;
        this._commentsHdl = null;
        this._autoFilterHdl = null;
        this._dcs = null;
        websheet.style.DefaultStyleCode = null;
	},
    
    loadDocument: function(documentObj, criteria, bJoin){
    	// Summary: Accepts document JSON and init, or partial init document model by it.
    	// Details: The function is called from SheetDocScene to init document from the document JSON that 
    	//		it has got from server side. The document is set via Controller.setDocumentObj().
    	//		After document data is all set(loaded), this.postLoad() is called, which will start the calculation.
    	//		If the criteria sheet has rows left after the first load, according to configuration, another request
    	//		for the remaining data is request before setDocumentObj(). Another Controller.setDocument() is scheduled after 
    	//		the 2nd request is respond.
    	// Topics published: Several topics are published via dojo.publish to broadcast state of document loading. Other components
    	//		can dojo.subscribe() interesting topics. Since load document is a heavy task, DO NOT do heavy job in dojo.subscribe()s.
    	//			/websheet/moreDocumentLoad/<sheetName> ( int startRow )
    	//				Publishes if more document data is needed, after the request for more document data is issued.
    	//				Since one(probably the only) important subscriber for the topic is grid, the grids are only constructed
    	//				after at least one setDocumentObj() returns, so this topic is published after the first setDocumentObj().
    	//				Parameter:
    	//					startRow: the row where the remaining row starts
    	//			/websheet/moreDocumentLoaded/<sheetName>
    	//				Publishes iff after moreDocumentLoad is published, the remaining document data is fully downloaded, and
    	//				docuemnt model is fully constructed
        if (bJoin) {
        	this.reset();
        	this.getStatusBar().startListening(this.getController());
            this._initialLoadDocument(documentObj, criteria, bJoin);
        }
    },
    
    _initialLoadDocument: function(documentObj, criteria, bJoin) {
    	// called from callback for session.join() or session.getPartial(), for first load the document,
    	// will call setDocumentObj(), send request for more document content and publish appropriate topics
        var criteriaSheetId = criteria.sheet;
        
        var hasMoreContent = false;
        var moreContentStarts = null;
        if (criteriaSheetId && documentObj.meta && documentObj.meta.hasMoreContent) {
        	// criteria sheet has more rows to go
        	var criteriaSheetMeta = documentObj.meta.sheets[criteriaSheetId];
        	if (criteriaSheetMeta) {
        		// criteria sheet max row, always use g_partialRowCnt since criteria max row could be not accure.
        		var criteriaSheetMaxRow = /* criteriaSheetMeta.maxrow */ window.g_partialRowCnt;
        		// request for rows from maxrow + 1 till the end
        		var criteriaForMore = this.getPartialManager().getPartialCriteria(criteriaSheetId, criteriaSheetMaxRow);
        		if (criteriaForMore) {
        			// attach chunkId, although chunkId is enough to get remaining content, we still attach other information
        			// and get criteria via PartialManager, in case anything went wrong, like server cleaned draft temp
        			var chunkId = documentObj["chunkId"];
        			if (chunkId != null) {
        				criteriaForMore["chunkId"] = chunkId;
        			}
        			//Firefox bug, _onMoreDocumentLoaded call back can be called before setDocumentObj finished, Defect 45555
        			// we need postpone it 
        			if(!dojo.isFF)
        				this.scene.partialLoad(dojo.hitch(this, "_onMoreDocumentLoaded"), criteriaForMore);
        			hasMoreContent = true;
        			moreContentStarts = criteriaSheetMaxRow + 1;
        		} 
        	}
        	// else we are in mess
        } else {
        	// no more content to go
    		// enable editing, if document finishes loading
        	var tm = this.getTaskMan();
        	tm.addTask(this, "_enableEdit", [], tm.Priority.Normal,
    				/* isPaused */ false, /* interval */ 0, /* comparator */ this._enableEditComp);
        	tm.addTask(this, "_processPendingMessage", [], tm.Priority.PostLoadProcessMessage,
    				/* isPaused */ false, /* interval */ 0, /* comparator */ this._processPendingMessageComp);
        	tm.start();
        }
        
        // call setDocument() to load the document JSON
        this.getController().setDocumentObj(documentObj, criteria, bJoin);
        if (this._dcs == null) {
        	// safe to get default cell style here
        	var wsstyle = websheet.Constant.Style;
        	var dcs = this._dcs = websheet.style.DefaultStyleCode;
			this._dbB = dcs.getAttr(wsstyle.BOLD);
			this._dbI = dcs.getAttr(wsstyle.ITALIC);
			this._dbU = dcs.getAttr(wsstyle.UNDERLINE);
			this._dbST = dcs.getAttr(wsstyle.STRIKETHROUGH);
			this._dbWrap = dcs.getAttr(wsstyle.WRAPTEXT);
        }

        if (hasMoreContent) {
        	var metaSheets = documentObj.meta.sheets;
        	if (criteriaSheetId && metaSheets) {
        		var criteriaSheetName = metaSheets[criteriaSheetId].sheetname;
        		// publish topic, use task to make it in another timer,
        		// if any exception happens in any subscriber, it will not break this timer's execution.
            	this.getTaskMan().addTask(dojo, "publish", ["/websheet/moreDocumentLoad/" + criteriaSheetName, [ moreContentStarts ]], this.getTaskMan().Priority.Normal);
            	
            	if(dojo.isFF)
    				this.scene.partialLoad(dojo.hitch(this, "_onMoreDocumentLoaded"), criteriaForMore);
        	}
        	// else we are in a mess
        }
    },
    
    _enableEdit: function() {
    	// delegate to this.scene.enableEdit, pre-check document loading flag
    	if (!this.getDocumentObj().isLoading) {
    		this.scene.enableEdit();
    	}
    },
    
    _processPendingMessageComp: function(selfTask, inQueueTask) {
    	// comparator that keeps only one _enableEdit exists in task Q
    	if (inQueueTask.task == "_processPendingMessage") {
    		// don't add itself
    		return 1;
    	} else {
    		return 0;
    	}
    },
    
    _enableEditComp: function(selfTask, inQueueTask) {
    	// comparator that keeps only one _enableEdit exists in task Q
    	if (inQueueTask.task == "_enableEdit") {
    		// don't add itself
    		return 1;
    	} else {
    		return 0;
    	}
    },
    
    _onMoreDocumentLoaded: function(result, criteria) {
    	var tm = this.getTaskMan();
    	if (tm.protect(this, "_onMoreDocumentLoaded", [result, criteria], tm.Priority.LoadDocument)) {
    		return;
    	}

		tm.addRootTask(this, "_processPendingMessage", [], tm.Priority.PostLoadProcessMessage,
				/* isPaused */ false, /* interval */ 0, /* comparator */ this._processPendingMessageComp);
		tm.addRootTask(this, "_enableEdit", [], tm.Priority.Normal,
				/* isPaused */ false, /* interval */ 0, /* comparator */ this._enableEditComp);
		var criteriaSheet = this.getDocumentObj().getSheetById(criteria.sheet);
		if (criteriaSheet) {
			tm.addRootTask(dojo, "publish", ["/websheet/moreDocumentLoaded/" + criteriaSheet._name], tm.Priority.Normal);
		}
		this.getController().setDocumentObj(result.content, criteria);
		tm.start();
    },
    
    getCollaboratorContainer: function(){     
		if(this.collaboratorContainer==null){
			this.collaboratorContainer =new websheet.layout.CollaboratorContainer();
		}
         return this.collaboratorContainer;
    },
    
    getWorksheetContainer: function(){
        return this.worksheetContainerNode;
    },

    getCurrentGrid: function () {
    	if (this.worksheetContainerNode == null) return null;
    	return this.worksheetContainerNode.getCurrentWorksheet();
    },
    
    getToolbar: function(sheetName){
        return this.toolbarNode;
    },
    
	getFormulaBar: function() {
		return this.formulaBar;
	},
	
	getStatusBar: function() {
		return this.statusBar;
	},
	
	setStatusBar: function(statusBar) {
		this.statusBar = statusBar;
	},
	
	setFormulaBar: function(formulaBar) {
		this.formulaBar = formulaBar;
	},

    setToolbar:function(toolBar){
    	this.toolbarNode = toolBar;
    },

    setWorksheetHeight: function () {
    	var height = concord.util.browser.getBrowserHeight() - this.scene.getHeaderHeight() - this.scene.getStatusBarHeight();
    	try{
    		dojo.byId('websheet_layout_WorksheetContainer_0').style.height = height + 'px';
    		var stb = this.getStatusBar();
    		if(stb)
    			stb.relocate();
    	}catch(e){}
    },
	
	/**
	 * Prompt warning message 
	 * 1. when edited cell referred to unsupported formula cell/cells
	 * 2. when input unsupported formula to cell which is referred by other cell/cells
	 */
	showRefUnsupFormulaCellWarning: function(cell){
		var bRef, bReffed;
		if (cell && cell.isFormula()){
			var err = cell.getError();
			if(err && err.errorCode == 1003)
				bRef = true;
			if (err && err.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
				bReffed = cell._getImpactCells().length != 0;
		}
		if(bRef)
			this.scene.showWarningMessage(this.nls.REF_TO_UNSUPPORTED_FORMULA_CELL_MSG, 5000);
		else if (bReffed) {
			this.scene.showWarningMessage(this.nls.UNSUPPORTED_FORMULA_CELL_REFED, 5000);
		}
	},
	
    /** Check if the column number is beyond max columns index(1024), 
     * show the warning message on top of view.
     */
	showColumnsBeyondWarning: function(bLoad, sheetName, startCol, endCol) {
		var docObj = this.getDocumentObj();
		var maxColIndex = websheet.Constant.MaxColumnIndex;
		if(bLoad){
			if(sheetName){
				var sheet = docObj.getSheet(sheetName);
				var initMaxColIndex = sheet.initMaxColIndex;
				if(initMaxColIndex && initMaxColIndex > maxColIndex){
					var warningMessage = "";
					warningMessage = dojo.string.substitute(this.nls.BEYOND_COLUMNS_NUMBER_SHEET_MSG,[sheetName, maxColIndex]);
					this.scene.showWarningMessage( warningMessage, 10000 );
					return true;
				}
			} else {
				// called from setDocumentObj and sheetName not set, no this usage, do nothing and return
				return false;
			}
		} else {
			var helper = websheet.model.ModelHelper;
			if(sheetName){
				var sheet = docObj.getSheet(sheetName);
				var lastColIndex = helper.getValidLastCol(sheet);
				// document not exceed now, check for inserting
				if(startCol <= lastColIndex){
					var addedCols = endCol - startCol + 1;
					if(lastColIndex + addedCols > maxColIndex){
						var warningMessage = dojo.string.substitute(this.nls.BEYOND_COLUMNS_BY_INSERT_COLUMNS_MSG,[maxColIndex]);
						this.scene.showWarningMessage(warningMessage, 5000);
						return true;
					}
				}
			} else {
				// not called from setDocumentObj, no sheetName, used for publish() check
				var sheets = docObj.getSheets();
				var len = sheets.length;
				var partialMgr = websheet.model.ModelHelper.getPartialManager();
				var names = "";
				for(var i = 0; i < len; i++) {
					var lastColIndex = 0;
					if(partialMgr.isComplete(sheets[i].getId())){
						var lastColIndex = helper.getValidLastCol(sheets[i]);
					} else
						lastColIndex = sheets[i].initMaxColIndex;
					
					if(lastColIndex > maxColIndex){
						names += sheets[i].getSheetName();
						names += ",";
					}
				}
				if (names.length > 0 ) {
					bBeyond = true;
					if (names.charAt(names.length-1) == ",")
						names = names.substring(0, names.length - 1);
					var warningMessage = dojo.string.substitute(this.nls.BEYOND_COLUMNS_NUMBER_SHEET_MSG,[names, maxColIndex]);
					this.scene.showWarningMessage(warningMessage, 5000);
					return true;
				}	
			}
		}
		
		return false;
	},	
	
	/**
	 * Prompt warning message 
	 * 1. when inserting rows resulted in the last row with data exceed 100000
	 * 2. when load a draft, if there are rows with data beyond the 100000th row
	 * 3. when publish a draft,  if there are rows with data beyond the 100000th row
	 * bLoad: when is called after document is load
	 */
	showRowsBeyondWarning: function(bLoad, sheetName, startRow, endRow) {
		var bBeyond = false;
		var docObj = this.getDocumentObj();
		
		var helper = websheet.model.ModelHelper;
		if (bLoad) {
			// if called from setDocumentObj
			if (sheetName) {
				// sheetName is set
				var sheet = docObj.getSheet(sheetName);
				var lastRowIndex = sheet.initMaxRowIndex;
				if(lastRowIndex > this.maxRow) {
					bBeyond = true;
					var warningMessage = dojo.string.substitute(this.nls.BEYOND_ROWS_MSG,[sheetName, this.maxRow]);
					this.scene.showWarningMessage(warningMessage, 5000);
				} 
			} else {
				// called from setDocumentObj and sheetName not set, no this usage, do nothing and return
				bBeyond = false;
			}
		} else {
			if (sheetName) {
				// not called from setDocumentObj, with sheetName set, used for insertRow warning 
				var sheet = docObj.getSheet(sheetName);
				var lastRowIndex = helper.getValidLastRow(sheet);
				// document not exceed now, check for inserting
				if(startRow <= lastRowIndex){
					var addedRows = endRow - startRow + 1;
					if(lastRowIndex + addedRows > this.maxRow){
						bBeyond = true;
						var warningMessage = dojo.string.substitute(this.nls.BEYOND_ROWS_BY_INSERT_ROWS_MSG,[this.maxRow]);
						this.scene.showWarningMessage(warningMessage, 5000);
					}
				}
			} else {
				// not called from setDocumentObj, no sheetName, used for publish() check
				var sheets = docObj.getSheets();
				var len = sheets.length;
				var partialMgr = websheet.model.ModelHelper.getPartialManager();
				var names = "";
				for(var i = 0; i < len; i++) {
					var lastRowIndex = 0;
					if(partialMgr.isComplete(sheets[i].getId())){
						var lastRowIndex = helper.getValidLastRow(sheets[i]);
					} else
						lastRowIndex = sheets[i].initMaxRowIndex;
					
					if(lastRowIndex > this.maxRow){
						names += sheets[i].getSheetName();
						names += ",";
					}
				}
				if (names.length > 0 ) {
					bBeyond = true;
					if (names.charAt(names.length-1) == ",")
						names = names.substring(0, names.length - 1);
					var warningMessage = dojo.string.substitute(this.nls.BEYOND_ROWS_MSG,[names, this.maxRow]);
					this.scene.showWarningMessage(warningMessage, 5000);
				}				
			}
		}
		return bBeyond;
	},
	
    /**
     * @param {String} reference a textual cell reference
     */
    lockCell: function(reference, borderColor, userId) {
    	var parsedRef = websheet.Helper.parseRef(reference);
    	if (!parsedRef) {
    		return;
    	}
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
    	if (sheetName == parsedRef.sheetName) {
    		grid.renderer.renderLockCell(parsedRef.startRow - 1, parsedRef.startCol, borderColor);
    		grid.insertCellInfo(parsedRef.startRow - 1, parsedRef.startCol, 'locked', true);
    	}
    },
    
    /**
     * set default background color after other collaborator either cancel or finish editing on this cell
     * @param {String} reference a textual cell reference
     */
    releaseCell: function(reference, userId){
    	var parsedRef = websheet.Helper.parseRef(reference);
    	if (!parsedRef) {
    		return;
    	}
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
    	if (sheetName == parsedRef.sheetName) {
    		grid.renderer.renderReleaseCell(parsedRef.startRow - 1, parsedRef.startCol);
    		grid.insertCellInfo(parsedRef.startRow - 1, parsedRef.startCol, 'locked', false);
    	}
    },
    
    /**
     * This method is used to move the foucs out Grid.
     * Where the focus move to based on the target parameter
     * @param target
     */
    switchFocusOutGrid: function(target, evt){    	
		switch (target) {		
	    case ACCOperate.FOCUSMENUBAR:
	    	var menubar = dijit.byId('S_m');
	    	var menu = dijit.byId('S_i_File');
	    	if(menubar && menu && menu.domNode && menu.domNode.style.display != "none"){
	    		menubar.onItemClick(menu, evt);
	    	}
	     	break;
	    case ACCOperate.FOCUSNAMEBOX:
	    	var formulaBar = this.getFormulaBar();
	    	if(formulaBar && formulaBar.isShow &&(!formulaBar.nameBoxNode.disabled)){
	    		formulaBar.nameBoxNode.focus();
	    	}
	     	break;
	    case ACCOperate.FOCUSSIDEBAR:
		    if(	window["pe"].sidebarMenuItem.attr("checked")== true){
		    	// call side bar interface to set focus
		    	var sidebar = this.scene.getSidebar();
		    	if(sidebar)
		    		sidebar.setSidebarFocus();
		    }
	     	break;
	    case ACCOperate.FOCUSTOOLBAR:
	    	var toolBar = dijit.byId('S_t');
	    	if(toolBar){
	    		if(this.settings.getToolbar() != this.settings.TOOLBAR_NONE){
	    			toolBar.focus();
	    		}
	    	}
	    	break;
	    default:
	        break;
	    }
    },
    
    execCommand: function(command, args){
    	// Summary:
    	//		Accepts all local UI actions and route to appropriate actors or perform it in-place.
    	// Description:
    	//		Accepts all local UI actions and route to appropriate actors or perform it in-place.
    	//		This function may be delayed into TaskManager as a deferred task. Callers can't depend on the action
    	//		perfoms at once.
    	//		Callers also need to handle exections thrown from action functions
    	//  command: string
    	//		The command, a constant defined in window.commandOperate
    	//  args: array
    	//		An array of the parameters used for action implementations
    	// Returns:
    	//		TaskManager.taskDef:
    	//			Deferred taskDef object. If the action is deferred
    	//		null:
    	//			Most of the cases.
    	//		misc:
    	//			Any other values that certain actions need.
    	var commop = window.commandOperate;
    	if(command === commop.COPY || command === commop.PASTE || command === commop.CUT)
    	{
    		if(!args || args.length == 0 || !args[0])
    		{
    			//do not support copy/paste from context menu;
    			{
    			    var type = "copy";
    				if(command === commop.PASTE)
    					type = "paste";
    				if(command === commop.CUT)
    					type = "cut";
    				var nls = dojo.i18n.getLocalization("concord.widgets", "CKResource"); 
    				var os = dojo.isMac ? 'OnMac' : '';
    				setTimeout(function(){
    					// set timeout to make the menu disappear first.
    					alert( nls.clipboard[ type + 'Error' + os ] );		// Show cutError or copyError.
    				}, 0);
    				return;
    			}
    		}
    	}
    	
    	if(this.isProtectedStyleOpt(command, args))
    		return;
    	
    	if(this.isProtectedForbiddenOpt(command, args)){
    		this.protectedWarningDlg();
    		return;
    	}
    	
    	if(this.isACLForbiddenOpt(command, args))
    		return;
    	
    	if(args && args[0] && (command === commop.COPY || command === commop.PASTE || command === commop.CUT))
    	{
    		//console.info("copy paste with short-cuts, Had to run in Sync mode to enable copy event grab data to system clipboard");
    		if(this.getTaskMan().isRunning(this.getTaskMan().Priority.BaseCommands, true) || this.getNameRangeHdl().isEditingNamedRange() || this.getChartHdl().isEditingChart())
    		{
    			// TODO
    			// alert("Some actions is running now, please retry it later");
    			return;
    		}
    		
    		if(command == commop.PASTE)
    		{
    			this.paste(args);
    			return;
    		}
    		this._clipboard.exitSelect(true);
    		if(command == commop.CUT)
    		{
    			this.cut(args);
    		}
    		else if(command == commop.COPY)
    		{
    			this.copy(args);
    		}
    		return;
    	}
    	
    	switch (command) {
		// let some operations (operations that available to observer mode) execute in all cases
        case commop.NEWDOCUMENT:
//        case commop.NEWDOCUMENTTEMPLATE:
        case commop.NEWSPREADSHEET:
	    case commop.NEWPRESENTATION:
//        case commop.NEWSPREADSHEETFROMTEMPLATE:
        case commop.ABOUT:
        case commop.COPY:
        case commop.FORMAT:
		case commop.FIND:
		case commop.REPLACE:
		case commop.SHOWORHIDETOOLBAR:
        case commop.SHOWORHIDETASK:
        case commop.NAVIGATOR:
        case commop.UserIndicator:
    	case commop.SHOWORHIDESIDEBAR:
		case commop.SHOWORHIDEFORMULA:
		case commop.AUTOCOMPLETE:
		case commop.SHOWUNSUPP:
        case commop.SELECTSHEET:
        case commop.CELLEDIT:
        	break;
		default:
			var tm = this.getTaskMan();
   	    	var task = tm.protect(this, "execCommand", [command, args], tm.Priority.BaseCommands);
        	if (task != null) {
        		return task;
        	}
        	var doc = this.getDocumentObj();
        	if (doc.isLoading || doc.getPartialLoading())
        	{
        		tm.addTaskWithDeltaLevel(this, "execCommand", [command, args], tm.Priority.PendingBaseCommands, 0)
        		tm.start();
        		return;
        	}
        	break;
    	}
    	
    	if ( (this.getNameRangeHdl().isEditingNamedRange() || this.getChartHdl().isEditingChart()) && 
    		(command != commop.INSERTRANGE && command != commop.SETRANGEINFO && command != commop.DELETERANGE && command != commop.SETCHARTINFO))
    		return;
    	
    	var sheetName = this.getCurrentGrid().getSheetName();
        var grid = this.getController().getGrid(sheetName);
        var ret = null;
        args = args || [];
        switch (command) {
            case commop.UNDO:
            case commop.REDO:
	    	case commop.PASTE:
	    	case commop.FORMAT:
	    	case commop.PAINT:
	    	case commop.CONPAINT:
	    	case commop.CLEAR:
	    	case commop.CLEARRANGE:
	    	case commop.FILLRANGE:
            case commop.DELETEROW:
            case commop.DELETECOLUMN:
			case commop.CELLEDIT:
            case commop.INSERTROW:
            case commop.INSERTROWBELOW:
            case commop.INSERTCOLUMN:
            case commop.INSERTCOLUMNAFTER:
            case commop.INSERTCELL:
            case commop.INSERTCELLDOWN:
            case commop.DELETECELL:
            case commop.DELETECELLUP:
			case commop.SUMFORMULA:
			case commop.AVERAGEFORMULA:
			case commop.COUNTFORMULA:
			case commop.MAXFORMULA:
			case commop.MINFORMULA:
			case commop.DEFAULTSTYLE:
			case commop.SETSTYLE:
	    	case commop.SHOWROW:
	    	case commop.HIDEROW:
	    	case commop.SHOWCOLUMN:
	    	case commop.HIDECOLUMN:
		    case commop.FILTERROWS:
		    	this._calcManager.pauseTasks();
            	break;
        	default:
        		break;
        }
        
        if(command != commop.CELLEDIT &&  grid && grid.isEditing())
        	grid.apply();
		
        if(this._releaseCutRect(command)){
			this._clipboard.exitSelect(true);
        }
        this.suspendGridUpdate(sheetName);
        var noDrawFrameSelected = !this.hasDrawFrameSelected();
        switch (command) {
			/*******  FILE  ***********/
            case commop.NEWDOCUMENT:
            	this._needFocus = false;
            	this.newDocument();
            	break;
//            case commop.NEWDOCUMENTTEMPLATE:
//            	this._needFocus = false;
//            	this.newDocumentFromTemplate();
//            	break;
            case commop.NEWSPREADSHEET:
            	this._needFocus = false;
            	this.newSpreadSheet();
            	break;
		    case commop.NEWPRESENTATION:
		    	this._needFocus = false;
	    		this.newPresentation();
	    		break;
//            case commop.NEWSPREADSHEETFROMTEMPLATE:
//            	this._needFocus = false;
//            	this.newSpreadSheetFromTemplate();
//            	break;
            case commop.IMPORT:
            	this._needFocus = false;
            	this.importFromFile(false);
            	break; 	
            case commop.SAVE:
            	this._needFocus = false;
            	this.save();
            	break;
            case commop.SAVEDRAFT:
            	this._needFocus = true;
            	this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
            	this.saveDraft();
            	break;
            case commop.SAVEVERSION:
            	this._needFocus = false;
            	this.saveDraft(true);
            	break;
            case commop.SETAUTOPUBLISH:
            	var checked = window["pe"].autoPublishMenuItem.attr("checked");
            	pe.scene.switchAutoPublish(checked);
            	break;
            case commop.SAVEAS:
            	this._needFocus = false;
            	this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
            	this.saveAs();
            	break;
            case commop.PUBLISHDIALOG:
            	this._needFocus = false;
            	this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
            	this.showPublishDialog();
            	break;
			case commop.SFRDIALOG:
            	this._needFocus = false;
            	//this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
            	this.showSFRDialog();
            	break;
            case commop.DISCARDDRAFT:
            	this._needFocus = false;
				this.discardDraft();
				break;
	        case commop.SPREADSHEETSETTINGS:
	        	this._needFocus = false;
	            this.spreadsheetSettings();
	            break;
		    case commop.SHAREWITH:
		    	this._needFocus = false;
				this.shareWith();
				break;
            case commop.EXPORTTOPDF:
            	this._needFocus = false;
            	this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
            	this.exportToPDF();
            	break;
            case commop.EXPORTTOCSV:
            	this._needFocus = false;
            	this.exportToCSV();
            	break;       
            case commop.SHOWREVISION:
            	dojo["require"]("concord.concord_sheet_widgets");
            	var self = this;
            	setTimeout(function(){
            		self.scene.viewRevision();
		    	}, 0);         
            	break;            	
			/*******  EDIT  ***********/
            case commop.UNDO:
            	this.undo();
            	break;
            case commop.REDO:
            	this.redo();
            	break;
            case commop.COPY:
            	this._needFocus = true;
	    		this.copy(args);
	    		break;
	    	case commop.PASTE:
	    		this.paste(args);
	    		break;
	    	case commop.CUT:
	    		this._needFocus = true;
	    		this.cut(args);
	    		break;
	    	case commop.FORMAT:
	    		this._format(args);
	    		break;
	    	case commop.PAINT:
	    		this._paint(args, false);
	    		break;
	    	case commop.CONPAINT:
	    		this._paint(args, true);
	    		break;
	    	case commop.CLEAR:
	    		this.clear(args[0], args[1], args[2], args[3], args[4]);
	    		break;
	    	case commop.STARTAUTOFILL:
	    		this.startAutofill();
	    		break;
	    	case commop.CLEARRANGE:
	    		this.clearRange(args[0], args[1], args[2], args[3]);
	    		break;
	    	case commop.FILLRANGE:
	    		this.fillRange(args[0], args[1]);
	    		break;
            case commop.DELETESHEET:
            	this._needFocus = false;
                this.deleteSheet(args[0]);
                break;
            case commop.HIDESHEET:
            	this._needFocus = false;
            	this.hideSheet();
            	break;
            case commop.UNHIDESHEET:
            	this._needFocus = false;
            	this.unhideSheet(args[0]);
            	break;
            case commop.RENAMESHEET:
            	this._needFocus = false;
                this.renameSheet(args[0]);
                break;
            case commop.MOVESHEET:
            	this._needFocus = false;
                this.moveSheet(args[0]);
                break;
            case commop.MOVERANGE:
            	this._needFocus = false;
            	this.moveRange(args[0], args[1], args[2]);
            	break;
            case commop.DELETEROW:
                this.deleteRows(args[0], args[1]);
                break;
            case commop.DELETECOLUMN:
                this.deleteColumns(args[0], args[1]);
                break;
            case commop.DELETECELL:
                this.moveCells4InsertOrDel(true, false, args[0], args[1], args[2], args[3]);
                break;
            case commop.DELETECELLUP:
                this.moveCells4InsertOrDel(true, true, args[0], args[1], args[2], args[3]);
                break;
            case commop.SELECTSHEET:
            	this.selectSheet();
            	break;
			case commop.FIND:
			case commop.REPLACE:
				this._needFocus = false;
				this.findAndReplace();
				break;
			case commop.CELLEDIT:
				var grid = this.getController()._grids[args[0]/*sheetName*/];
				ret = grid.doApplyCellEdit(args[1]/*value*/, args[2]/*inRowIndex*/, args[3]/*inColIndex*/);
				break;
			case commop.DELETEFRAME:
				// delete image and chart
				this.getDrawFrameHdl().delSelectedDrawFrames(this.getCurrentGrid().getSheetName());
				break;
			case commop.DELETEIMAGE:
				var sheetId = args[0];
				var imgs = args[1];
				var imgHandler = this.getImageHdl();
				for (var i = 0; i < imgs.length; i++) {
					var range = imgs[i];
					if (range) {
						var imgDiv = imgHandler.getDrawFrameDivbySheetName(range.getSheetName(), range.getId());
						imgDiv.delImage();
					}
				}
				break;
			case commop.RESIZEIMAGE:
				this.getImageHdl().setDrawFrame(args[0], args[1], args[2]);
				break;
			case commop.MOVEIMAGE:
				this.getImageHdl().setDrawFrame(args[0], args[1], args[2]);
				break;
			/*******  VIEW  ***********/
    		case commop.SHOWORHIDETOOLBAR:
    			this.getToolbar() && this.getToolbar().toggle();
				break;
            case commop.SHOWORHIDETASK:
            	this.showOrHideTask();
            	break;
            case commandOperate.NAVIGATOR:
            	this._needFocus = false;
            	this.navigator();
            	break;            	
            case commop.UserIndicator:
            	this.showOrHideUserIndicator();
            	break;
	    	case commop.SHOWORHIDESIDEBAR:
	    		dojo["require"]("concord.concord_sheet_widgets");
	    		this.scene.toggleSideBar();
    			break;
    		case commop.SHOWORHIDEFORMULA:
    			var formulaBar = this.getFormulaBar();
				formulaBar && formulaBar.toggle();
				break;
    		case commop.SHOWORHIDEACL:
    			this.getACLHandler().toggleViewACL();
    			break;
			case commop.AUTOCOMPLETE:
				this.toggleAutoComplete();
				break;
			case commop.SHOWUNSUPP:
				this.settings.setShowUnsupportedFeature(window["pe"].showUnsupportMenuItem.checked);
				break;
			case commop.FREEZEWINDOW:
				this._needFocus = true;
				ret = this.freezeWindow(args[0]);
				break;
			case commop.SELECTCOMMENT:
				this._needFocus = true;
				ret = this.selectComment(args[0]);
				break;
			case commop.SHOWORHIDEGRIDLINES:
				this.showOrHideGridLines();
				break;				
			/*******  INSERT  ***********/
            case commop.INSERTSHEET:
            	this._needFocus = false;
                this.insertSheet(args[0]);
                break;
             case commop.INSERTIMAGE:
            	this._needFocus = false;
                this.insertImage(args?args[0]:undefined);
                break;
             case commop.INSERTCHART:
            	this._needFocus = false;
 				this.createChart();
 				break;
            case commop.INSERTROW:
                ret = this.insertRows(false, args[0], args[1]);
                break;
            case commop.INSERTROWBELOW:
                ret = this.insertRows(true, args[0], args[1]);
                break;
            case commop.INSERTCOLUMN:
                ret = this.insertColumns(false, args[0], args[1]);
                break;
            case commop.INSERTCOLUMNAFTER:
                ret = this.insertColumns(true, args[0], args[1]);
                break;
            case commop.INSERTCELL:
                ret = this.moveCells4InsertOrDel(false, false, args[0], args[1], args[2], args[3]);
                break;
            case commop.INSERTCELLDOWN:
                ret = this.moveCells4InsertOrDel(false, true, args[0], args[1], args[2], args[3]);
                break;
			case commop.ALLFORMULAS:				
				this.allFormulas();
				break;
			case commop.SUMFORMULA:
				this.quickFormula("SUM");
				break;
			case commop.AVERAGEFORMULA:
				this.quickFormula("AVERAGE");
				break;
			case commop.COUNTFORMULA:
				this.quickFormula("COUNT");
				break;
			case commop.MAXFORMULA:
				this.quickFormula("MAX");
				break;
			case commop.MINFORMULA:
				this.quickFormula("MIN");
				break;
			 case commop.NAMERANGE:
            	this._needFocus = false;
                this.namerange();
                break;
             case commop.MANAGERANGE:
            	this._needFocus = false;
                this.managerange();
                break;
			/*******  FORMAT  ***********/
			case commop.DEFAULTSTYLE:
				noDrawFrameSelected && this.setDefaultStyle();
				break;
			case commop.SETSTYLE:
				var style = args[0];
				if (noDrawFrameSelected && style) {
					this.SetStyle({style:style});
				}
				break;
            case commop.ITALIC:
            	noDrawFrameSelected && this.FontStyle(commop.ITALIC);
                break;
            case commop.UNDERLINE:
            	noDrawFrameSelected && this.FontStyle(commop.UNDERLINE);
                break;
            case commandOperate.IMAGEPROPERTIES:
            	this._needFocus = false;
            	var drawFrameHdl = this.getDrawFrameHdl();
				var drawFrameRanges = drawFrameHdl.getSelectedDrawFramesInCurrSheet();
				if (drawFrameRanges.length != 0) {
					var hdl = this.getDrawFrameHdlByUsage(drawFrameRanges[0].usage);
			 		this.imageProperties(hdl);
			 	}
                break;
            case commandOperate.CHARTPROPERTIES:
            	this._needFocus = false;
            	this.chartProperties();
                break;
            case commop.EXPORTTODEFAULT:
            	this._needFocus = false;
            	this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
            	this.scene.exportToDefault();
            	break;
            case commop.STRIKE:
            	noDrawFrameSelected && this.FontStyle(commop.STRIKE);
                break;
            case commop.BOLD:
            	noDrawFrameSelected && this.FontStyle(commop.BOLD);
                break;
            case commop.FONT:
            	noDrawFrameSelected && this.Font(args);
                break;
            case commop.FONTSIZE:
            	noDrawFrameSelected && this.FontSize(args);
                break;
            case commop.FONTCOLOR:
            	noDrawFrameSelected && this.FontColor(args);
                break;   
            case commop.SETBORDERSTYLE:
            	// 50529: [Regression] border dlg should not  disappear after click one kind of border style since i wanna continue to set color
            	this._needFocus = false;
            	noDrawFrameSelected && this.SetBorderStyle();
                break;
            case commop.CHANGEROWHEIGHT:
            	this._needFocus = false;
            	this.setRowHeight(args[0], args[1], args[2]);
                break;
            case commop.CHANGECOLUMNWIDTH:
            	this._needFocus = false;
            	this.setColumnWidth(args[0], args[1], args[2], args[3]);
                break;
	    	case commop.SHOWROW:
	    		noDrawFrameSelected && this.showRows(args[0], args[1]);
	    		break;
	    	case commop.HIDEROW:
	    		noDrawFrameSelected && this.hideRows(args[0], args[1]);
	    		break;
	    	case commop.SHOWCOLUMN:
	    		noDrawFrameSelected && this.showHideColumns(true, args[0], args[1]);
	    		break;
	    	case commop.HIDECOLUMN:
	    		noDrawFrameSelected && this.showHideColumns(false, args[0], args[1]);
	    		break;
			case commop.ALIGNLEFT:
				noDrawFrameSelected && this.Align(commop.ALIGNLEFT);
				break;
			case commop.ALIGNRIGHT:
				noDrawFrameSelected && this.Align(commop.ALIGNRIGHT);
				break;
			case commop.ALIGNCENTER:
				noDrawFrameSelected && this.Align(commop.ALIGNCENTER);
				break;
			case commop.ALIGNTOP:
				noDrawFrameSelected && this.Valign(commop.ALIGNTOP);
				break;
			case commop.ALIGNBOTTOM:
				noDrawFrameSelected && this.Valign(commop.ALIGNBOTTOM);
				break;
			case commop.ALIGNMIDDLE:
				noDrawFrameSelected && this.Valign(commop.ALIGNMIDDLE);
				break;
			case commop.MERGECELL:
				if (noDrawFrameSelected) {
					ret = this.mergeCell();
				}
				break;
			case commop.WRAPTEXT:
				noDrawFrameSelected && this.wrapText();
				break;				
			/*******  DATA  ***********/
		    case commop.SORTRANGE:
		    	this._needFocus = false;
	            this.sortRangeDialog();
	            break;
		    case commop.INSTANCESORT:
		    	this._needFocus = false;
	            ret = this.sortRange(args[0], args[1]);
	            break;
		    case commop.INSTANTFILTER:		    	
	            this.setInstantFilter(args[0]);
	            break;	            
		    case commop.FILTERROWS:
		    	var grid = this.getCurrentGrid();
		    	var filter = this.getAutoFilterHdl().getFilter(grid.sheetName);
		    	filter && filter.apply(args[0], args[1]);
	            break;
		    case commop.DOWNLOADCHART:
		    	this.getChartHdl().downloadSelChart();
		    	break;
		    case commop.VALIDATION:
		    	this.getDataValidationHdl(true).setValidation();
	            break;
	        case commop.ACCESSPERMISSION:
		    	var permissionPane = this.getACLHandler().getPermissionPane(true);
		    	permissionPane.open();
		    	if(args.bSheet || args.bRange)
		    	{
			    	permissionPane.openPermissionWidget(args);	
			    	this._needFocus = false;
		    	}	
		    	break;
		    case commop.DELETEACL:
		    	this.getACLHandler().deleteAllPermissions();
		    	break;
			/*******  TEAM  ***********/
	    	case commop.CREATECOMMENTS:
	    		this._needFocus = false;
	    		this.createComments();
	    		break;
            case commop.LTRDIRECTION:
            	noDrawFrameSelected && this.Direction("ltr");
            	break;
            case commop.RTLDIRECTION:
            	noDrawFrameSelected && this.Direction("rtl");
            	break;
            case commop.AUTODIRECTION:
            	noDrawFrameSelected && this.Direction("");
            	break;
            case commop.LTRSHEETDIRECTION:
            	noDrawFrameSelected && this.SheetDirection(false);
            	break;
            case commop.RTLSHEETDIRECTION:
            	noDrawFrameSelected && this.SheetDirection(true);
            	break;
            case commop.ASSIGNTASK:
            	this._needFocus = false;
            	this.assignTask();
            	break;
            case commop.MARKASSIGNCOMPLETE:
            	this.doAssignmentAction(commop.MARKASSIGNCOMPLETE);
            	break;
            case commop.SUBMITTASK:
            	this.getTaskMan().sync(this.getTaskMan().Priority.PublishMessage);
        		this.submitTask();
            	break;
            case commop.RETURNASSIGNMENT:
            	this.doAssignmentAction(commop.RETURNASSIGNMENT);
            	break;
            case commop.REMOVECOMPLETEDASSIGN:
            	this.removeCompletedAssign();
            	break;
            case commop.APPROVEASSIGNMENT:
            	this.doAssignmentAction(commop.APPROVEASSIGNMENT );
            	break;
            case commop.ABOUTASSIGN:
            	this.doAssignmentAction(commop.ABOUTASSIGN);
            	break;
            case commop.DELETETASK:
            	this.doAssignmentAction(commop.DELETETASK);
            	break;
            case commop.EDITASSIGNMENT:
            	this.doAssignmentAction(commop.EDITASSIGNMENT);
            	break;
            case commop.REOPENASSIGNMENT:
            	this.doAssignmentAction(commop.REOPENASSIGNMENT);
            	break;
            case commop.REASSIGNASSIGNMENT:
            	this.doAssignmentAction(commop.REASSIGNASSIGNMENT);
            	break;
            case commop.SELECTACTIVITY:
            	this.selectActivity();
            	break;
			/*******  TOOLS  ***********/
            case commop.SPELLCHECK:
            	dojo["require"]("concord.concord_sheet_extras");
            	this.getController().getInlineEditor().preventCover();
            	this.scene.doSpellCheck();
            	break;
            case commop.PREFERENCES:
            	dojo["require"]("concord.concord_sheet_widgets");
            	this.scene.showPreferencesDailog();
            	break;
            /*******  HELP  ***********/
			case commop.ABOUT:		
				this._needFocus = false;		
				this.scene.aboutConcord();
				break;
			case commop.NEWFEATURES:		
				this._needFocus = false;		
				this.scene.showNewFeatures();
				break;
			case commop.USERTOUR:		
				this._needFocus = false;		
				this.scene.showNewUserTour();
				break;				
			case commop.BORDERCUSTOMIZE:				
				this.CustomizeBorder(args[0], grid.isMirrored);
				this._needFocus = false;
				break;
			case commop.NUMBERFORMAT:
				this.numberFormat(args[0]);
				this._needFocus = false;
				break;
			case commop.INSERTRANGE:
				this.insertRange(args[0], args[1], args[2], args[3], args[4], args[5]);
				this._needFocus = false;
				break;
			case commop.DELETERANGE:
				this.deleteRange(args[0], args[1], args[2], args[3], args[4], args[5]);
				this._needFocus = false;
				break;
			case commop.DELETERANGESBYRANGE:
				this.deleteRangesByRange(args[0], args[1], args[2], args[3], args[4]);
				this._needFocus = false;
				break;
			case commop.SETRANGEINFO:
				this.setRangeInfo(args[0], args[1], args[2], args[3], args[4]);
				this._needFocus = false;
				break;
			case commop.SETCHARTINFO:
				this.setChartInfo(args[0], args[1], args[2]);
				this._needFocus = false;
				break;
            default:
                break;
        }
        // resume update as a task, since some of the commands are running as a task
        // 
        var tm = this.getTaskMan();
		tm.addTask(this, "resumeGridUpdate", [sheetName], tm.Priority.Normal);
		tm.addTask(grid, "requestWidgetsUpdate", [], tm.Priority.Normal);
		tm.start();
        this.focus2Grid();
        this._needFocus = true;
        return ret;
    },
    

    /*void*/protectedWarningDlg: function(){
    	if(!dijit.byId("C_d_MessageBox")){
			var dlg = new concord.widgets.MessageBox(this, this.nls.PROTECTED, null, false, {message: this.nls.PROTECTION_FORBIDDEN_MESSAGE});
			dlg.show();
    	}
    },
   
	/*boolean*/isProtectedStyleOpt: function(command){
		var commop = window.commandOperate;
    	var bProtected = false;
    	switch (command) {
			case commop.DEFAULTSTYLE:
 			case commop.SETSTYLE:
 	        case commop.ITALIC:
 	        case commop.UNDERLINE:
 	        case commop.STRIKE:
 	        case commop.BOLD:
 	        case commop.FONT:
 	        case commop.FONTSIZE:
 	        case commop.FONTCOLOR:
 	        case commop.SETBORDERSTYLE:
 	        case commop.ALIGNLEFT:
 			case commop.ALIGNRIGHT:
 			case commop.ALIGNCENTER:
 			case commop.WRAPTEXT:
 				bProtected = websheet.model.ModelHelper.isSheetProtected();
 				if(!bProtected && this.hasACLHandler())
 				{
 					var bhChecker = this.getACLHandler()._behaviorCheckHandler;
 					var addr = this.getCurrentGrid().selection.selector().getSelectedRangeAddress();
 					bProtected = !bhChecker.canCurUserEditRange(addr);
 				}	
 				break;
 			default:
 				break;
    	}
		return bProtected;
	},   
   
     //can't check paste, it also dependens the cotent in clipboard. But not the selected range.
    /*boolean*/isProtectedForbiddenOpt: function(command, args){
    	var commop = window.commandOperate;
    	var mhelper = websheet.model.ModelHelper;
        switch (command) {
        	case commop.CELLEDIT:
        		var sheetName = args[0];
        		var inRowIndex = args[2];// 0 based
    			var inColIndex = args[3];
    			return mhelper.isCellProtected(sheetName, inRowIndex + 1,  inColIndex);
        		break;
        	case commop.FILLRANGE:
        		var target = args[1];
        		return mhelper.isRangeProtected(target.sheetName, target.startRow, target.endRow, target.startCol, target.endCol, true);
        		break;
     	  	case commop.CUT:
     	   	case commop.CLEAR:
     	   	case commop.STARTAUTOFILL:
     	   	case commop.ALLFORMULAS:
     		case commop.SPELLCHECK:
     	   		return this._isCurrSelectProtected();
     	   		break;
     		default:
     			return false;
     			break;
        }
     },
     
     isACLForbiddenOpt: function(command, args)
     {
    	 if(!this.hasACLHandler()) return false;
    	 var commop = window.commandOperate;
    	 var addr = null;
         switch (command) 
         {
	     	case commop.CELLEDIT:
	     		var sheetName = args[0];
	     		var rIndex = args[2] + 1;
	 			var cIndex = args[3];
	 			addr = websheet.Helper.getAddressByIndex(sheetName,rIndex,cIndex,null,rIndex,cIndex,{refMask:websheet.Constant.RANGE_MASK});
	     		break;
	     	case commop.FILLRANGE:
	     		var target = args[1];
	     		addr = websheet.Helper.getAddressByIndex(target.sheetName,target.startRow,target.startCol,null,target.endRow,target.endCol,{refMask:websheet.Constant.RANGE_MASK});
	     		break;
	     	case commop.CLEARRANGE:
	         	var grid = this.getCurrentGrid();
	        	var sheetName = grid.getSheetName();
	        	addr = websheet.Helper.getAddressByIndex(sheetName,args[0],args[2],null,args[1],args[3],{refMask:websheet.Constant.RANGE_MASK});
	     		break;
	     	case commop.INSTANCESORT:
	     		var parsedRef = websheet.Helper.parseRef(args[0]);
	     		addr = websheet.Helper.getAddressByIndex(parsedRef.sheetName,parsedRef.startRow,null,null,parsedRef.endRow,null,{refMask:websheet.Constant.ROWS_MASK});
	     		break;
	  	  	case commop.CUT:
	  	    	var imageHdl = this.getImageHdl();
	  	    	var imgRanges = imageHdl.getSelectedDrawFramesInCurrSheet();
	  	    	if(imgRanges.length != 0) return false;
		  	  	var chartHdl = this.getChartHdl();
		  	    var chartRanges = chartHdl.getSelectedDrawFramesInCurrSheet();
		  	    if(chartRanges.length != 0)	return false;
	  	   	case commop.CLEAR:
	  	   	case commop.ALLFORMULAS:
	  			var selector = this.getCurrentGrid().selection.selector();
	  			addr = selector.getSelectedRangeAddress();
	  	   		break;
	  		default:
	  			return false;
	  			break;
	     }
         if(addr)
        	 return this.isACLForbiddenArea(addr);
     },
     
     isACLForbiddenArea: function(addr)
     {
 		if(this.hasACLHandler())
		{
			var bhChecker = this.getACLHandler()._behaviorCheckHandler;
			if(!bhChecker.canCurUserEditRange(addr))
			{
				bhChecker.cannotEditWarningDlg();
				return true;
			}
		}
 		return false;
     },
     
    /*boolean*/isCurrentSheetProtected: function()
     {
		var sheetName = this.getCurrentGrid().getSheetName();
     	return this.getDocumentObj().isSheetProtected(sheetName);
     },
     
     _isCurrSelectProtected: function()
     {
    	var grid = this.getCurrentGrid();
		var sheetName = grid.sheetName; 
     	var doc = this.getDocumentObj();
        if(!doc.isSheetProtected(sheetName))
        	return false;
     	
        var sheet = doc.getSheet(sheetName);
        var selector = grid.selection.activeSelector();
      	var selected = grid.selection.getFocusedCell();
      	var range = selector.getRangeInfo();
      	var selectType = selector.getSelectType();
      	switch(selectType)
     	{
     		case websheet.Constant.Cell:
     			var rowIdx = selected.focusRow + 1;
     	 		var colIdx = selected.focusCol;
     	 		return sheet.isCellProtected(rowIdx, colIdx);
     			break;
     		case websheet.Constant.Column:
     		case websheet.Constant.ColumnRange:
     			return sheet.isColumnProtected(selected.focusCol,range.endCol);
     			break;
     		case websheet.Constant.Range:
     			var rowIdx = selected.focusRow + 1;
     	 		var colIdx = selected.focusCol;
     	 		var endRowIdx = range.endRow;
     	 		var endColIdx = range.endCol;
     	 		return sheet.isRangeProtected(rowIdx, endRowIdx, colIdx, endColIdx);
     			break;
     		case websheet.Constant.Row:
     		case websheet.Constant.RowRange:
     			var rowIdx = selected.focusRow + 1;
     			var endRowIdx = range.endRow;
     			return sheet.isRowProtected(rowIdx,endRowIdx);
     			break;
     		default:
 				return false;
 				break;
     	}
     },
    
    //list all the operations that will not interrupt copy/cut
    _releaseCutRect: function(command){
    	var flg = true;
    	var commop = window.commandOperate;
    	switch(command){
    		case commop.NEWSPREADSHEET:
//    		case commop.NEWSPREADSHEETFROMTEMPLATE:
    		case commop.NEWDOCUMENT:
//    		case commop.NEWDOCUMENTTEMPLATE:
    		case commop.NEWPRESENTATION:
    		case commop.SAVEDRAFT:
    		case commop.UNDO:
    		case commop.REDO:
    		case commop.COPY:
    		case commop.CUT:
    		case commop.PASTE:
    		case commop.FORMAT:
    		case commop.PAINT:
    		case commop.CONPAINT:
    		case commop.SELECTSHEET:
    		case commop.DELETESHEET:
    		case commop.RENAMESHEET:
    		case commop.MOVESHEET:
    		case commop.FIND:
    		case commop.REPLACE:
    		case commop.DELETEIMAGE:
    		case commop.RESIZEIMAGE:
    		case commop.MOVEIMAGE:
    		case commop.SHOWORHIDETOOLBAR:
    		case commop.SHOWORHIDESIDEBAR:
    		case commop.SHOWORHIDEFORMULA:
    		case commop.SHOWORHIDETASK:
    		case commop.UserIndicator:
    		case commop.SHOWUNSUPP:
    		case commop.NAVIGATOR:
    		case commop.INSERTSHEET:
    		case commop.INSERTIMAGE:
    		case commop.CHANGEROWHEIGHT:
    		case commop.CHANGECOLUMNWIDTH:
    		case commop.HIDEROW:
    		case commop.SHOWROW:
    		case commop.HIDECOLUMN:
    		case commop.SHOWCOLUMN:
    		case commop.IMAGEPROPERTIES:
    		case commop.SPELLCHECK:
    		case commop.PREFERENCES:
    		case commop.ABOUT:
    		case commop.FREEZEWINDOW:
    		case commop.SELECTCOMMENT:
    		case commop.INSERTRANGE:
    		case commop.SETRANGEINFO:
    		case commop.DELETERANGE:
    		case commop.DELETERANGESBYRANGE:
    		case commop.SETCHARTINFO:
    			flg = false;
    			break;
    		default:
    			break;
    	}
    	return flg;
    },
    
    exportToPDF: function() {
    	if( !this.printOptsDlg ) {
    		dojo["require"]("concord.concord_sheet_widgets");
    		this.printOptsDlg = new concord.widgets.print.sheetPrintToPdf(this, this.nls.pageSetup);
    	}
    	// force save draft
    	if (!this.scene.isDocViewMode()) this.scene.saveDraft();
    	this.printOptsDlg.show();
    },
    
    showOrHideUserIndicator: function() {
    	// TODO use checked box value instead
    	this.hasColorShading = window["pe"].coeditingIndicatorMenuItem.attr("checked");
    	if(this.settings) {
    		this.settings.settings.show_indicator = this.hasColorShading ? 'yes' : 'no';
    		this.settings.setIndicator(this.hasColorShading);
    	}
    	this.getCurrentGrid().requestUpdate();
    },
    
    turnOnUserIndicator: function(isTurnOn, userId){
    	var grid = this.getCurrentGrid();
    	grid.renderer.turnOnUserIndicator(isTurnOn, userId);
    },
    
    getCSVExporter: function()
    {
    	return new websheet.datasource.Exporter(this);
    },
    
    exportToCSV: function() {
		var sheetName = this.getCurrentGrid().getSheetName();
		// check whether this sheet exists or not in co-edit mode
		dojo["require"]("concord.concord_sheet_extras");
		var exporter = this.getCSVExporter();
		var locale = this.scene.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
		// make csv locale-insenstive, always use ","
		var sep = /* bundle["decimal"]=="," ? ";" : */ ",";
		var para = {writerArgs: {separator: sep }};
		var localnls = this.nls;
		exporter.exportSheet(sheetName, "csv", para, dojo.hitch(this, function(str){
			this.scene.exportToHttpRespWriter(this, sheetName, "csv", str);
		}));
    }, 

//	newDocumentFromTemplate: function() {
//		this.scene.createTextDoc(this, true);
//	},
	
	newDocument: function() {
		this.scene.createTextDoc(this, false);
	},
    
	newSpreadSheet: function() {
		this.scene.createSheetDoc(this);
	},
	
//	newSpreadSheetFromTemplate: function() {
//		this.scene.createSheetDocFromTemplate(this);
//	},
	
	newPresentation: function() {
		this.scene.createPresDoc(this);
	},
	
	importFromFile: function(isHide) {
		var dlg = null;
		if(isHide)
		{
			dlg = this.getImportDialog(isHide);
		}
		else if(!this.importDlg){
			this.importDlg = this.getImportDialog(isHide);
			dlg = this.importDlg;
		}
		else
			dlg = this.importDlg;
        dlg.show();
        dlg.setFocus();
    },
    
    getImportDialog: function (isHide)
    {
		dojo["require"]("concord.concord_sheet_widgets");
		var params = {
			uploadUrl: this.filebrowserTextFileUploadUrl,
			isHidden: isHide
		};
		var formParams = {
			"name":"uploadForm",
			"method":"POST",			
	    	"enctype":"multipart/form-data"	
		};	
		return new websheet.dialog.ImportDialog(this,this.nls.importFile,this.nls.importAction,null,params,formParams);
    },
    	
    save: function() {
		if( !this.saveDlg ) {
			dojo["require"]("concord.concord_sheet_widgets");
			this.saveDlg = new concord.widgets.SaveDialog(this, this.nls.saveDoc);
		}
		this.saveDlg.show();
    },
    
    saveAs: function() {
    	this.scene.saveAsDoc(this);
    },
    
    showPublishDialog: function(){
    	this.scene.inlineEditorApply();
    	if( !this.scene.publishDlg ) {
    		dojo["require"]("concord.concord_sheet_widgets");
			var okLabel = this.nls.publishOkLabel;
			var titleLabel = this.nls.publishDoc;
			if(this.scene.showCheckinMenu())	
			{
				okLabel = this.nls.yesLabel;
				titleLabel = this.nls.checkinLabel;
			}		
			this.scene.publishDlg = new concord.widgets.PublishDialog(this, titleLabel, okLabel );
    	}
    	this.scene.publishDlg.show();
    },
    showSFRDialog: function () 
    {
    	this.scene.submitForReview();
    },
    
    saveDraft: function(isPublish) {
    	this.scene.saveDraft(null, isPublish);
    },
    
    publish: function(data, callback) {
		this.showRowsBeyondWarning() || this.showColumnsBeyondWarning();
		
		var _data = {}; 
    	if(data != null)
			dojo.mixin(_data, data); 
		this.scene.publish(_data, callback);
    },
        
	discardDraft: function(){
    	dojo["require"]("concord.util.dialogs");
    	concord.util.dialogs.showDiscardDlg();
	},
	
	spreadsheetSettings: function() {
	    if (!this.prefSettingsDlg) {
	    	dojo["require"]("concord.concord_sheet_widgets");
	    	this.prefSettingsDlg = new websheet.dialog.spreadsheetSettings(this, this.nls.spreadsheetSettings, this.nls.saveSetting);
	    }
	    this.prefSettingsDlg.show();
	},
	
	shareWith: function(){
		dojo["require"]("concord.concord_sheet_widgets");
		this.scene.shareWith(this);
	},
	
	sortRangeDialog: function() {
		if(this.sortDialog==null) {
			dojo["require"]("concord.concord_sheet_widgets");
			this.sortDialog = new websheet.dialog.sortRange(this, this.nls.sortRange);
		}
		this.sortDialog.show();
	},
	
	/*
	 * @param bCreate true if create one instant filter in this sheet
 	 */
	setInstantFilter: function(/*boolean*/bCreate)
	{
		var grid = this.getCurrentGrid();
		var sheetName = grid.getSheetName();

		if (bCreate === undefined) {
			bCreate = !this.getAutoFilterHdl().getFilter(sheetName);
		}
		
		//add filter
		if(bCreate)
		{
			var selector = grid.selection.selector();
			var addr = selector.getSelectedRangeAddress();
			var rangeAddr = websheet.Utils.getRangeAddr4Chart(addr);
			if(selector.selectingCell())
				rangeAddr = addr;
			this.getAutoFilterHdl().createFilter(rangeAddr);
		}
		else //remove filter
		{
			this.getAutoFilterHdl().removeFilter(sheetName);
		}
	},

	setChartInfo: function(rangeAddr, attrs, reverseAttrs) {
		this.getController().setChartInfo(rangeAddr, attrs);
		
		var event = new websheet.event.SetChart(rangeAddr, attrs);
		var reverse = new websheet.event.Reverse(event, rangeAddr, reverseAttrs);
		this.sendMessage(event, reverse);
	},

	allFormulas: function()
	{
		if(this._isCurrSelectProtected()){
			this.protectedWarningDlg();
			return;
		}
		var Dlg = this.getAllFormulasDlg();
		Dlg.show();
	},
	
	getAllFormulasDlg:function(){
		if( !this.allFormulaDlg ) {
			dojo["require"]("concord.concord_sheet_widgets");
			this.allFormulaDlg = new websheet.dialog.allFormulas(this,this.nls.allFormula);
		}
		return this.allFormulaDlg;
	},
	
	namerange: function()
	{
		this.getNameRangeHdl().showNewNrDlg();
	},
	
	managerange: function()
	{
		this.getNameRangeHdl().showNrDlg();
	},
	
    undo: function()
    {
    	// todo, what about short-cuts ? 
    	var toolbar = this.getToolbar();
    	if (toolbar) toolbar.disableUndoRedoIcon();
    	
		var tm = this.getTaskMan();
		
		tm.addTask(this._undoManager, "undo", null, tm.Priority.UndoRedo);
		if (toolbar) tm.addTask(toolbar, "refreshUndoRedoIcon", null, tm.Priority.UndoRedo);
		
		tm.start();
		
		this.focus2GridDOM();
    },
    
    redo: function()
    {
    	var toolbar = this.getToolbar();
    	if (toolbar) toolbar.disableUndoRedoIcon();
		
		var tm = this.getTaskMan();
		
		tm.addTask(this._undoManager, "redo", null, tm.Priority.UndoRedo);
		if (toolbar) tm.addTask(toolbar, "refreshUndoRedoIcon", null, tm.Priority.UndoRedo);
		
		tm.start();
    },

	// sheet name validator callback for renaming sheet
    _sheetNameValidator: function(editor, sheetName) {
		var errMsg = null;
		nls = dojo.i18n.getLocalization("websheet", "base");
		var name = editor.getCurrentGrid().getSheetName();
		if (!sheetName || sheetName == '')
			errMsg = nls.INPUT_NEW_SHEETNAME_MSG;
		else if (!websheet.Helper.isValidSheetName(sheetName))
			errMsg = dojo.string.substitute(nls.INVALID_SHEETNAME_MSG,["'" + sheetName + "'"]);
		else if (sheetName != name && editor.getDocumentObj().isSheetExist(sheetName))
			// if it is the sheet name of other sheets, report error
			errMsg = dojo.string.substitute(nls.EXISTING_SHEETNAME_MSG,["'" + sheetName + "'"]);
		else if (websheet.Utils.getStringDisplayLength(sheetName) > websheet.Constant.MaxSheetNameLen)
			errMsg = dojo.string.substitute(nls.TOO_LONG_SHEETNAME_MSG, [websheet.Constant.MaxSheetNameLen]);
		
		return errMsg;
	},
	
	// sheet name validator callback for inserting sheet
    _sheetNameValidatorForInsert: function(editor, sheetName) {
		var errMsg = null;
		nls = dojo.i18n.getLocalization("websheet", "base");
		if (!sheetName || sheetName == '')
			errMsg = nls.INPUT_NEW_SHEETNAME_MSG;
		else if (!websheet.Helper.isValidSheetName(sheetName))
			errMsg = dojo.string.substitute(nls.INVALID_SHEETNAME_MSG,["'" + sheetName + "'"]);
		else if (editor.getDocumentObj().isSheetExist(sheetName))
			errMsg = dojo.string.substitute(nls.EXISTING_SHEETNAME_MSG,["'" + sheetName + "'"]);
		else if (websheet.Utils.getStringDisplayLength(sheetName) > websheet.Constant.MaxSheetNameLen)
			errMsg = dojo.string.substitute(nls.TOO_LONG_SHEETNAME_MSG, [websheet.Constant.MaxSheetNameLen]);
		
		return errMsg;
	},
	
    renameSheet: function(sheetName) {
    	if (sheetName != null) {
    		// the sheetName is validated by native control
    		var docObj = this.getDocumentObj();
			this._currentSheetId = docObj.getSheetId(this.getCurrentGrid().getSheetName());
    		this._renameSheet(this, sheetName);
    		return;
    	}
    	
        var sheetName = this.getCurrentGrid().getSheetName();
		var params = {
			message: this.nls.enter_new_sheetname,
			defvalue: sheetName,
			callback: this._renameSheet,
			validator: this._sheetNameValidator
		};
		var docObj = this.getDocumentObj();
		this._currentSheetId = docObj.getSheetId(sheetName);
		var dlg = new concord.widgets.InputBox(this, this.nls.RENAME_SHEET, null, true, params );
		dlg.show();
    },
    
    // callback from input box
    _renameSheet: function(editor, newSheetName) {
    	editor._calcManager.pauseTasks();
		var docObj = editor.getDocumentObj();
        var sheet = docObj.getSheetById(editor._currentSheetId);
        if(!sheet)
        {
        	console.log("the sheet has been deleted by the other client");
        	return;
        }
        
    	var sheetName = sheet.getSheetName();
    	editor._clipboard.exitSelect(true);
    	editor._doRenameSheet(editor, sheetName, newSheetName);
    },
    
    // it will be called from js api
    _doRenameSheet: function(editor, sheetName, newSheetName) {
    	if (sheetName == newSheetName) return; // not case sensitive
    	
        editor.getController().renameSheet(sheetName, newSheetName);
        var attrUpdates = {};
        attrUpdates.sheetname = newSheetName;
        var event = new websheet.event.SetSheet(sheetName,attrUpdates);
    	attrUpdates.sheetname = sheetName;
	    var reverse = new websheet.event.Reverse(event, newSheetName, attrUpdates);
	    editor.sendMessage (event, reverse);
    },
    
    moveSheet: function(sheetIndex) {
       	var docObj = this.getDocumentObj();
    	if (sheetIndex != null) {
    		// the sheetIndex is validated by native control
			this._currentSheetId = docObj.getSheetId(this.getCurrentGrid().getSheetName());
    		this._moveSheet(this, sheetIndex);
    		return;
    	}
    	
        var _validator = function(editor, sheetIndex) {
			nls = dojo.i18n.getLocalization("websheet", "base");
			if (sheetIndex == undefined || sheetIndex == '') {
				return nls.INPUT_NEW_SHEETINDEX_MSG;
			}
			if (!websheet.Helper.isNumeric(sheetIndex)) {
				return nls.INVALID_SHEET_INDEX_MSG;
			}
			sheetIndex = parseFloat(sheetIndex);
			if (!websheet.Helper.isInt(sheetIndex)) {
				return nls.INVALID_SHEET_INDEX_MSG;
			}
			var docObj = editor.getDocumentObj();
			var unhide_sheetCount = docObj.getVisibleSheetsCount();
			if (sheetIndex < 1 || sheetIndex > unhide_sheetCount) {
				return dojo.string.substitute(nls.INPUT_VALID_SHEETINDEX_MSG, [unhide_sheetCount]);
			}
			var sheet = docObj.getSheet(sheetName);
			if(!sheet) return null;
			var index = docObj.getSheetTabIndex(sheetName);
			if (index == sheetIndex) {
				return nls.INPUT_NEW_SHEETINDEX_MSG;
			}
			
			return null;
		};

        var sheetName = this.getCurrentGrid().getSheetName();
        var sheet = docObj.getSheet(sheetName);
        sheetIndex = docObj.getSheetTabIndex(sheetName);
		var sheetArray = docObj.getVisibleSheets();
		var sheetCount = sheetArray.length;
		if (sheetCount == 1) {
			var dlg = new concord.widgets.MessageBox(this, this.nls.MOVE_SHEET, null, false, 
										{message: this.nls.MOVE_ONLY_ONE_SHEET_MSG});
			dlg.show();
			return;
		}
		
		var params = {
			message: this.nls.enter_sheet_index_for_move,
			defvalue: sheetIndex,
			callback: this._moveSheet,
			validator: _validator
		};
	
		this._currentSheetId = sheet.getId();
		var dlg = new concord.widgets.InputBox(this, this.nls.MOVE_SHEET, null, true, params );
		dlg.show();
		/**Usability :Show sheet index when move sheet*/
		dlg.hide = function(){//clean up
			this._destroy();
			dojo.forEach(this.editor._multipleTooltipMaster, function(master){
				master.hide(master.aroundNode);
			});
			this.editor._multipleTooltipMaster = [], this.editor._sheetBound = null;
		};
		if(!this._multipleTooltipMaster) this._multipleTooltipMaster = [];
		var sheet_node = dojo.byId("sheet_node");
		this._sheetBound = sheet_node.getBoundingClientRect();
		dojo.forEach(sheetArray, dojo.hitch(this, function(sheet, index){
			this._multipleTooltipMaster.push(new dijit._MasterTooltip());
			var sheetNameDom = dojo.byId("worksheetTabcontainer_" + sheet.getId());
			var bound = sheetNameDom.getBoundingClientRect(), attatchPos = bound.left;
			if(attatchPos < this._sheetBound.right && attatchPos > this._sheetBound.left){
				this._multipleTooltipMaster[index].show(index + 1, sheetNameDom, ["above"]);
			}
		}));
    },
    
    moveRange: function(/*string*/functionCopy, /*array*/argsArray, /*boolean*/custmizedCleanUp)
    {
    	// summary:
    	//		Move range leverage clipboard's 'cut from internal clipboard' routine to make its purpose.
    	//		The functionCopy is the copy method that should be used according to the source range.
    	//		The argsArray is arguments the copy method( which functionCopy indicates) used. 
    	// 		See _SelectRectangle's onMoveStop for more details about moveRange.
    	var clipboard = this._clipboard;
    	if(clipboard[functionCopy] == null) return;
    	var signal = dojo.aspect.around(clipboard, functionCopy, function(original){
    		return function() {
    			var storage;
    			var _onCopy = clipboard._onCopy;
    			clipboard._cutting = true;
    			clipboard._onCopy = function(content){
    				storage = content;
    				clipboard._storage._cleanData(storage);
    			};
    			original.apply(clipboard, arguments);
    			clipboard._onCopy = _onCopy;
    			clipboard._pasteFromInternalClipBoard(storage);
    			if (!custmizedCleanUp) {
    				// for some kinds of special 'move range', they need to clear this flag on themselves 
    				clipboard._cutting = false;
    			}
    			signal.remove();
    		};
    	});
    	clipboard[functionCopy].apply(clipboard, argsArray);
    },
    
    // call back from input box
    _moveSheet: function(editor, moveTabIndex){
    	moveTabIndex = parseInt (moveTabIndex);
        var docObj = editor.getDocumentObj();
        var sheet = docObj.getSheetById(editor._currentSheetId);
        if(!sheet)
        {
        	console.log("the sheet has been deleted by the other client");
        	return;
        }
        
        var sheetName = sheet.getSheetName();
        var sheetTabIndex = docObj.getSheetTabIndex(sheetName);
        if(sheetTabIndex == moveTabIndex) return;
        var moveIndex = docObj.getSheetIndexByTabIndex(moveTabIndex);
        if (moveIndex == 0) return;
        var sheetIndex = sheet.getIndex();
        var controller = editor.getController();        
        controller.moveSheet(sheetName, moveIndex, true);//do not move grid now
        
        var content = {};
		var areaMgr = docObj.getAreaManager();
		var undoCells = areaMgr.getCells4DeleteUndo(); //the second parameter is not true because in predelete the range row/col/sheet id has already been changed by changeByType
		content.cells = websheet.Utils.getImpactCellsValue(null,undoCells,websheet.Constant.Sheet);
		content.areas = areaMgr.getRanges4DeleteUndo();//NOTE: only comment
		
        var refValue = sheetName + "|" + sheetIndex;
        var attrUpdates = {delta: moveIndex-parseInt(sheetIndex)};
        var event = new websheet.event.MoveSheet(refValue,attrUpdates);
        refValue = sheetName + "|" + moveIndex;
		attrUpdates.delta = 0 - attrUpdates.delta;
		
		var reverse = new websheet.event.Reverse(event, refValue, attrUpdates, content);
		editor.sendMessage (event, reverse);
		//send message before move grid,so that after get partial document, no message will be sent
		controller._moveSheet(sheet, moveIndex, sheetName);
    },
    
    hideSheet: function(){
    	if (!this.getCurrentGrid()) return;
    	
		var docObj = this.getDocumentObj();
	    var sheetCount = docObj.getVisibleSheetsCount();
	    if (sheetCount <= 1) {
			var dlg = new concord.widgets.MessageBox(this, this.nls.HIDE_SHEET, null, false, 
										{message: this.nls.HIDE_ONLY_ONE_SHEET_MSG});
			dlg.show();
			return;	
	    }

	    var sheetName = this.getCurrentGrid().getSheetName();
	    this._hideSheet(sheetName);
    },
    
    _hideSheet: function(sheetName) {
		var docObj = this.getDocumentObj();
    	var sheet = docObj.getSheet(sheetName);
    	if (!sheet)
    		return;
 	    if (!sheet.isSheetVisible())
 	    	return;
 	    
	    var sheetCount = docObj.getVisibleSheetsCount();
	    var refValue = sheetName + "|" + sheetCount;
	    var controller = this.getController();
	    controller.hideSheet(sheetName);
	    		
		var new_status = websheet.Constant.SHEET_VISIBILITY_ATTR.HIDE;
		var old_status = websheet.Constant.SHEET_VISIBILITY_ATTR.SHOW;
	    var attrUpdates = {};
        attrUpdates.visibility = new_status;
        var event = new websheet.event.SetSheet(refValue,attrUpdates);
    	attrUpdates.visibility = old_status;
	    var reverse = new websheet.event.Reverse(event, sheetName, attrUpdates);
	    this.sendMessage (event, reverse);		
    },
    
    unhideSheet: function(sheetName){
    	var docObj = this.getDocumentObj();
    	var sheet = docObj.getSheet(sheetName);
    	if (!sheet){
    		return;
    	}    	
 	    if (sheet.isSheetVisible())
 	    	return;
    	
    	var sheetCount = docObj.getVisibleSheetsCount();
    	var refValue = sheetName + "|" + sheetCount;
    	var controller = this.getController();
	    controller.unhideSheet(sheetName, false);
	    
	    var new_status = websheet.Constant.SHEET_VISIBILITY_ATTR.SHOW;;
		var old_status = websheet.Constant.SHEET_VISIBILITY_ATTR.HIDE;;
	    var attrUpdates = {};
        attrUpdates.visibility = new_status;
        var event = new websheet.event.SetSheet(refValue,attrUpdates);
    	attrUpdates.visibility = old_status;
	    var reverse = new websheet.event.Reverse(event, sheetName, attrUpdates);
	    this.sendMessage (event, reverse);
    },

    deleteSheet: function(sheetName){
	    var docObj = this.getDocumentObj();
    	if (sheetName != null) {
    		// the sheetName is validated by native control
    		var sheet = docObj.getSheet(sheetName);
    		this._currentSheetId = sheet.getId();
			this._deleteSheet(this, true);
    		return;
    	}

    	if (!this.getCurrentGrid()) return;
        var sheetCount = docObj.getVisibleSheetsCount();
        if (sheetCount <= 1) {
			var dlg = new concord.widgets.MessageBox(this, this.nls.DELETE_SHEET, null, false, 
										{message: this.nls.DELETE_ONLY_ONE_SHEET_MSG});
			dlg.show();
			return;	
        }

        var sheetName = this.getCurrentGrid().getSheetName();
        var canDelete = true;
        //the sheet might contains Task
       	var taskHdl = this.getTaskHdl();
       	if (taskHdl) canDelete = taskHdl.preDeleteRange(2, sheetName);
        if (!canDelete) return;
 
        var sheet = docObj.getSheet(sheetName);		
		if (BidiUtils.isBidiOn())
			sheetName = BidiUtils.addEmbeddingUCC(sheetName);
		sheetName = "<span>" + websheet.Helper.escapeXml(sheetName, null, true) + "</span>";
		var confirmMsg = dojo.string.substitute(this.nls.DELETE_SHEET_CONFIRM_MSG, [sheetName]);
		var params = {
			message: confirmMsg,
			callback: this._deleteSheet
		};
		
		this._currentSheetId = sheet.getId();
		
		var dlg = new concord.widgets.ConfirmBox(this, this.nls.DELETE_SHEET, null, true, params);
		dlg.show();
    },
    
    // call back from confirm box
 	_deleteSheet: function (editor, bDelete) {
 		if (!bDelete) return;
 		editor._calcManager.pauseTasks();
 		
 		var docObj = editor.getDocumentObj();
 		// FIXME should have concordDialog to show warning message
 		var sheetCount = docObj.getVisibleSheetsCount();
        if (sheetCount == 1) {
			console.log("The only one sheet can't be deleted!");
			return;	
        }
 		var sheet = docObj.getSheetById(editor._currentSheetId);
        if (!sheet) {
        	console.log("This sheet has been deleted by co-edit user");
        	return;
        }
        var sheetName = sheet.getSheetName();
 		var sheetIndex = sheet.getIndex();
 		var sheetCount = docObj.getVisibleSheetsCount();
        var refValue = sheetName + "|" + sheetIndex + "|" + sheetCount;
 		var controller = editor.getController();
 		
 		var sheetId = sheet.getId();
 		var uuid = websheet.Helper.newGuid();
 		
 		controller.deleteSheet(sheetName, true,uuid);//bNotDeleteGrid=true
 		
 		var content = {};
 		var areaMgr = docObj.getAreaManager();
 		var undoCells = areaMgr.getCells4DeleteUndo(); //the second parameter is not true because in predelete the range row/col/sheet id has already been changed by changeByType
 		content.cells = websheet.Utils.getImpactCellsValue(sheetName,undoCells,websheet.Constant.Sheet);
		content.areas = areaMgr.getRanges4DeleteUndo();//NOTE: only comment
		content.cRanges = areaMgr.getChartSequenceRefs4DeleteUndo();
		content.shareRanges = areaMgr.getSharedRefs4DeleteUndo();
			
		var event = new websheet.event.DeleteSheet(refValue,{uuid:uuid});
		//Append the named range into content after delete rows 
		var sheetJson = {sheetname:sheetName,sheetindex:sheetIndex};//websheet.model.ModelHelper.toSheetJSON(sheet);
        var sheetMeta = {sheetid:sheetId};//websheet.Utils.getSheetMeta(sheetId);
        sheetJson.meta = sheetMeta;
        sheetJson.isUndo = true; // a flag for undoManager to use
        sheetJson.uuid = uuid;
    	var reverse = new websheet.event.Reverse (event, sheetName, sheetJson, content);

		editor.sendMessage (event, reverse, null, true);
		//send message before delete grid,so that after get partial document, no message will be sent
		controller._deleteSheet(sheetName);
    },
    
    // if url is given, it is called from mobileUtil.processNativeUploadImageEvent
    // it means the image is already uploaded to server, and given url is the server url for this image
    insertImage: function(url){
    	if (url && concord.util.browser.isMobile()) {
    		this.getImageHdl().insertImage(url, null, null, true);
    		this.publishForMobile({"name":"dismissImageUploadDialog", "params":[]});
    		return;
    	}
        if( !this.insertImageDlg ) {
			dojo["require"]("concord.concord_sheet_widgets");
			var params = {
				uploadUrl: this.filebrowserImageUploadUrl
			};
			var formParams = {
				"name":"uploadForm",
				"method":"POST",			
		    	"enctype":"multipart/form-data"	
			};	 
			this.insertImageDlg = new websheet.dialog.InsertImageDlg(this,this.nls.insertImage,this.nls.insertImageBtn,null,params,formParams);
		}		
		this.insertImageDlg.show();
    },
    
    insertSheet: function(sheetName) {
    	if (sheetName != null) {
    		// the sheetName is validated by native control
			this._insertSheet(this, sheetName);
    		return;
    	}
    	
		var params = {
			message: this.nls.enter_new_sheetname,
			defvalue: "",
			callback: this._insertSheet,
			validator: this._sheetNameValidatorForInsert
		};
		var dlg = new concord.widgets.InputBox(this, this.nls.INSERT_SHEET, null, true, params );
		dlg.show();
    },
    
    // call back from input box
    _insertSheet: function(editor, sheetName, afterSheet){
        // create sheet
    	editor._calcManager.pauseTasks();
    	var sheet, controller = editor.getController(), docObj = editor.getDocumentObj();
    	if (!afterSheet) {
    		sheet = editor.getCurrentGrid().getSheetName();
    	} else {
    		sheet = afterSheet;
    	}
        if (!sheet) return;
        
        var sheetObj = docObj.getSheet(sheet);
        var sheetIndex = sheetObj.getIndex() + 1;
	    controller.addSheet(sheetName, sheetIndex);
	    var attrUpdates = {};
	    attrUpdates.sheetname = sheetName;
	    attrUpdates.sheetindex = sheetIndex;

	    var event = new websheet.event.InsertSheet(sheetName, attrUpdates);
		var refValue = sheetName + "|" + sheetIndex + "|" + sheetIndex;
		var reverse = new websheet.event.Reverse (event, refValue, attrUpdates);
		editor.sendMessage (event, reverse);

		setTimeout(function(){
			 // delay some time for dialog dismiss and then get proper focus.
			 editor.getWorksheetContainer().showWorksheet(sheetName);
		}, 100);
    },
    
    /*
     * the row index is 1-based
     */
    _clearRows: function(sheetName, startRowIndex, endRowIndex)
    {
    	var sheet = this.getDocumentObj().getSheet(sheetName);
    	var refValue;
		if (endRowIndex == undefined) endRowIndex = startRowIndex;
		var params = {refMask: websheet.Constant.ROWS_MASK};
		if (startRowIndex == endRowIndex)
			refValue=websheet.Helper.getAddressByIndex(sheetName, parseInt(startRowIndex), null,null,null,null,params);
    	else
			refValue=websheet.Helper.getAddressByIndex(sheetName, parseInt(startRowIndex), null,null,parseInt(endRowIndex),null,params);
    	
        var rowData = websheet.Utils.getRowsValue(sheet,startRowIndex,endRowIndex);
		if (!rowData) rowData = new Object();
		this.getController().clearRows(sheetName,startRowIndex,endRowIndex);

        var event = new websheet.event.ClearRow(refValue);
        var reverse = new websheet.event.Reverse (event, refValue, null, rowData);
        this.sendMessage (event, reverse);
    },
    
    /*
     * clear the data of range, keep the style
     * all index is 1-based, col index is number
     */
    clearRange: function(startRowIndex, endRowIndex, startColIndex, endColIndex) 
    {
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
    	
    	if (startRowIndex == null) {
    	   	var selector = grid.selection.selector();
        	var range = selector.getRangeInfo();
        	startRowIndex = range.startRow;
        	endRowIndex = range.endRow;
        	startColIndex = range.startCol;
        	endColIndex = range.endCol;
    	}

    	this._clearRange(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex);
    },
    
    _clearRange: function(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex) {
    	var oldRange = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex, {
    		includeColumnStyle: false,
    		includeStyle: false,
    		includeValue: true
    	});
    	
    	this.getController().clearRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex);
    	var startCol = websheet.Helper.getColChar(startColIndex);
    	var endCol = websheet.Helper.getColChar(endColIndex);
    	var refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startCol,null,endRowIndex,endCol);
    	var event = new websheet.event.ClearUnnameRange(refValue);
    	var reverse = new websheet.event.Reverse (event, refValue, {rows:oldRange});
    	this.sendMessage (event, reverse);
    },
    
    startAutofill: function() 
    {
    	if(concord.util.browser.isMobile()) {
	    	var grid = this.getCurrentGrid();
	    	var selector = grid.selection.selector();
	    	selector.setSelectionMode(false);
    	}
    },
    
    clear: function(selectType, startRowIndex, endRowIndex, startColIndex, endColIndex)
    {
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
    	
    	if (selectType == null) {
    	   	var selector = grid.selection.selector();
        	selectType = selector.getSelectType();
        	var range = selector.getRangeInfo();
        	startRowIndex = range.startRow;
        	endRowIndex = range.endRow;
        	startColIndex = range.startCol;
        	endColIndex = range.endCol;
        	
        	if (selectType == websheet.Constant.Column || selectType == websheet.Constant.ColumnRange) {
    			startRowIndex = 1;
    			endRowIndex = this.maxRow;
        	}
    	}
    	
    	switch(selectType)
    	{
    		case websheet.Constant.Cell:
    			this._clearCell(sheetName, startRowIndex, startColIndex);
    			break;
    		case websheet.Constant.Column:
    		case websheet.Constant.ColumnRange:
    		case websheet.Constant.Range:
    			this.clearRange(startRowIndex, endRowIndex, startColIndex, endColIndex);
    			break;
    		case websheet.Constant.Row:
    		case websheet.Constant.RowRange:
    			this._clearRows(sheetName, startRowIndex, endRowIndex);
    			break;
    	}
    },
    
    /*
     * delete rows, the row index is 1-based
     */
    deleteRows: function(startRowIndex, endRowIndex)
    {
     	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();

    	if (startRowIndex == null) {
    		var selector = grid.selection.select();
    		startRowIndex = selector._startRowIndex;
    		endRowIndex = selector._endRowIndex;
    		if(startRowIndex > endRowIndex)
    		{
    			var idx = startRowIndex;
    			startRowIndex = endRowIndex;
    			endRowIndex = idx;
    		}
    		if(!selector.selectingRows())
    		{
    			startRowIndex = selector.focusRow;
    			endRowIndex = startRowIndex;
    		}
    		startRowIndex++;
    		endRowIndex++;
    	}
        
    	var canDelete = true;
    	var taskHdl = this.getTaskHdl();
    	if (taskHdl) canDelete = taskHdl.preDeleteRange(0, sheetName, startRowIndex,endRowIndex);
    	if (!canDelete) return;
    	
    	var content = {};
    	var params = {refMask: websheet.Constant.ROWS_MASK};
		var refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,endRowIndex,null,params);
		var doc = this.getDocumentObj();
		var sheet = doc.getSheet(sheetName);
		var filterContent = null;
		var uuid = dojox.uuid.generateRandomUuid();
		//Append the cells into content before delete rows
		//in case that there are formulas do not need update before delete
		var rowsJson = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, /* start column */ 1,
					endRowIndex, /* end column */ websheet.Constant.MaxColumnIndex,
					{ includeColumnStyle: false, forRow: true, bRawValue: true, bUpdateFormula: true});
 		var attrUpdates = {uuid: uuid};
		var event = new websheet.event.DeleteRow(refValue,attrUpdates);
		var reverse = null;
		var	idMap = websheet.Utils.getRowsId(sheet, startRowIndex, endRowIndex);

		this.getController().deleteRows(sheetName, startRowIndex, endRowIndex, uuid);
			
		var areaMgr = doc.getAreaManager();
		var undoCells = areaMgr.getCells4DeleteUndo();
		content.cells = websheet.Utils.getImpactCellsValue(sheetName,undoCells,websheet.Constant.Row);
		content.areas = areaMgr.getRanges4DeleteUndo();
		content.cRanges = areaMgr.getChartSequenceRefs4DeleteUndo();
		content.filter = this.getAutoFilterHdl().getAndResetReverseMsg();
		content.shareRanges = areaMgr.getSharedRefs4DeleteUndo();
			
	    var freezeHdl = this.getFreezeHdl();
	    var restoreInfo = freezeHdl.getRestoreInfo();
	    if(restoreInfo)
	    {
	      	content.freeze = restoreInfo[sheetName];
	    }
		this.getTaskMan().addTask(this, "moveSelectRectFocusVisible", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
		this.getTaskMan().start();
		var attr = {};
		attr.rows = rowsJson;
		attr.meta = idMap;
		attr.uuid = uuid;
		reverse = new websheet.event.Reverse (event, refValue, attr, content);
		this.sendMessage (event, reverse);
    },
    
    /*
     * before delete row sheet, generate the reverse
     * param@{sheet} : sheet model
     * param@ uuid: the unique action id for the deleted sheet
     * return reverse event
     */
    preGetReverse4DeleteSheet: function(sheet,uuid)
    {
    	var sheetName = sheet.getSheetName();
    	var sheetIndex = sheet.getIndex();
		var doc = this.getDocumentObj();
		var sheet = doc.getSheet(sheetName);
		var sheetId = sheet.getId();

		var sheetJson = {sheetname:sheetName,sheetindex:sheetIndex};//websheet.model.ModelHelper.toSheetJSON(sheet);
        var sheetMeta = {sheetid:sheetId};//websheet.Utils.getSheetMeta(sheetId);
        sheetJson.meta = sheetMeta;
        sheetJson.isUndo = true; // a flag for undoManager to use
        sheetJson.uuid = uuid;
        
        var event = new websheet.event.DeleteSheet(sheetName);
        return {event:event, refValue:sheetName, attr:sheetJson};
    },
    
    /*
     * before delete row from startRowIndex to endRowIndex, generate the reverse
     * param@{sheet} : sheet model
     * param@{startRowIndex} : integer , 1 base
     * param@{endRowIndex} : integer , 1 base
     * return reverse event
     */
    preGetReverse4DeleteRows: function(sheet, startRowIndex, endRowIndex, bNotCollectCell)
    {
    	var refValue = null;
    	var sheetName = sheet.getSheetName();
    	var params = {refMask: websheet.Constant.ROWS_MASK};
		if (startRowIndex == endRowIndex)
			refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,null,null,params);
    	else
			refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,endRowIndex,null,params);
		/**************broadcast pre delete event*************/
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREDELETE;
		source.refType = websheet.Constant.OPType.ROW;
		source.refValue = new websheet.parse.ParsedRef(sheetName, startRowIndex, -1, endRowIndex, -1, websheet.Constant.ROWS_MASK);
		source.uuid = dojox.uuid.generateRandomUuid();
		var e = new websheet.listener.NotifyEvent(type, source);
		var undoManager = this.getUndoManager();
		var undoRangeList = undoManager.getMsgTransformer().getRangeList();
		undoRangeList.preDelete(source, true, e);
		/*************end pre delete**************************/	
	
		if(!bNotCollectCell){
		//Append the cells into content after delete rows 		
			var rowsJson = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, /* start column */ 1,
									endRowIndex, /* end column */ websheet.Constant.MaxColumnIndex, 
									{ includeColumnStyle: false, forRow: true ,bRawValue: true, bUpdateFormula: true});
			var idMap = websheet.Utils.getRowsId(sheet, startRowIndex, endRowIndex);
		}
		var attrUpdates = {uuid: source.uuid};
		var event = new websheet.event.DeleteRow(refValue,attrUpdates);
		var attr = {};
		if(!bNotCollectCell){
			attr.rows = rowsJson;
			attr.meta = idMap;
		}
		attr.uuid = source.uuid;
		return {event:event, refValue:refValue, attr:attr};
    },
    
 	 /*
     * before delete row from scIndex to ecIndex, generate the reverse
     * param@{sheet} : sheet model
     * param@{scIndex} : integer , 1 base
     * param@{ecIndex} : integer , 1 base
     * return reverse event
     */
    preGetReverse4DeleteColumns: function(sheet, scIndex, ecIndex, bNotCollectCell)
    {
    	var sheetName = sheet.getSheetName();
    	var refValue = null;
    	var params = {refMask: websheet.Constant.COLS_MASK};
		var refValue=websheet.Helper.getAddressByIndex(sheetName, null, scIndex,null,null,ecIndex,params);
		/**************broadcast pre delete event*************/
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREDELETE;
		source.refType = websheet.Constant.OPType.COLUMN;
		source.refValue = new websheet.parse.ParsedRef(sheetName, -1, scIndex, -1, ecIndex, websheet.Constant.COLS_MASK);
		source.uuid = dojox.uuid.generateRandomUuid();
		var e = new websheet.listener.NotifyEvent(type, source);
		var undoManager = this.getUndoManager();
		var undoRangeList = undoManager.getMsgTransformer().getRangeList();
		undoRangeList.preDelete(source, true, e);
		/*************end pre delete**************************/
		
		if(!bNotCollectCell)
			var colJson = websheet.model.ModelHelper.toColsJSON(sheetName, scIndex, ecIndex);
		else
			var colJson = {};
		var attrUpdates = {uuid: source.uuid};
        var event = new websheet.event.DeleteColumn(refValue,attrUpdates);
        colJson.uuid = source.uuid;
        return {event:event, refValue:refValue, attr:colJson};
    },
    
    postGetReverse4DeleteAction: function(sheetName, info, /*websheet.Constant.Row etc.*/deleteType){
    	var content = info.content;
    	if(!content) {
    		content = {};
    		info.content = content;
    	}
    	var doc = this.getDocumentObj();
    	var areaMgr = doc.getAreaManager();
		var undoCells = areaMgr.getCells4DeleteUndo();
		content.cells = websheet.Utils.getImpactCellsValue(sheetName,undoCells,deleteType);
		content.areas = areaMgr.getRanges4DeleteUndo();
		content.cRanges = areaMgr.getChartSequenceRefs4DeleteUndo();
		content.shareRanges = areaMgr.getSharedRefs4DeleteUndo();
		//TODO: chartSequence related reference should be set as cRanges, set to event._data?
		//TODO: filter handler
        var freezeHdl = this.getFreezeHdl();
        var restoreInfo = freezeHdl.getRestoreInfo();
        if(restoreInfo)
        {
        	content.freeze = restoreInfo[sheetName];
        }
        content.filter = this.getAutoFilterHdl().getAndResetReverseMsg();
		var reverse = new websheet.event.Reverse (info.event, info.refValue, info.attr,info.content);
		return reverse.getMessage();
    },
    /**
     * insert rows
     * @param bInsertBelow	true if insert row below the selected rows
     * 						false if insert row above the selected rows
     */
    /*boolean*/insertRows: function(bInsertBelow, startRowIndex, endRowIndex)
    {
        var grid = this.getCurrentGrid();
        var sheetName = grid.getSheetName();
        var oldEndRowIdx = endRowIndex;
		var deltaCount = 0;
        
        if (startRowIndex == null) {
        	var selector = grid.selection.selector();
        	var rangeInfo = selector.getRangeInfo();
        	startRowIndex = rangeInfo.startRow - 1;
        	oldEndRowIdx = endRowIndex = rangeInfo.endRow - 1;
	    
        	if(selector.selectingColumns())
        		return;
        	if(selector.selectingRows())
        	{   // FIXME how to do it through native control?
        		var filter = this.getAutoFilterHdl().getFilter(sheetName);
        		if(filter)
        		{
        			//check if row is filtered
        			var rowsdata = websheet.model.ModelHelper.getRows(rangeInfo, true, true);
        			var rows;
        			if (rowsdata){
        				rows = rowsdata.data;
        			}
        			if (rows){
        				var length = rows.length;
        				for (var i=0; i<length; i++){
        					if (rows[i] && rows[i]._visibility == websheet.Constant.ROW_VISIBILITY_ATTR.FILTER)
        						deltaCount++;
        				}
        			}
        		}
        	}

        	startRowIndex++;
        	endRowIndex++;
        	oldEndRowIdx++;
        	endRowIndex -= deltaCount;
        
        	if(endRowIndex < startRowIndex){
        		endRowIndex = startRowIndex;
        	}
        }
        
        if (bInsertBelow) {
        	deltaCount = endRowIndex - startRowIndex;
        	startRowIndex = oldEndRowIdx + 1;
        	endRowIndex = startRowIndex + deltaCount;
        }
        
		if(this.showRowsBeyondWarning(false, sheetName, startRowIndex, endRowIndex))
			return false;
		
		this.getController().insertRows(sheetName, startRowIndex,endRowIndex);
		this.getTaskMan().addTask(this, "moveSelectRectFocusVisible", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
		this.getTaskMan().start();
		var doc = this.getDocumentObj();
	    var sheet = doc.getSheet(sheetName);
	    var params = {refMask: websheet.Constant.ROWS_MASK};
		var	refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,endRowIndex,null,params);
		var event = new websheet.event.InsertRow(refValue);
		var areaMgr = doc.getAreaManager();
		var content = {};
		content.shareRanges = areaMgr.getSharedRefs4InsertUndo();
		var reverse = new websheet.event.Reverse (event, refValue, null, content);
		this.sendMessage(event, reverse);
		
		return true;
    },
	
    /*
     * show hidden rows
     */
	showRows:function(startRowIndex, endRowIndex){
        var grid = this.getCurrentGrid();
        var sheetName = grid.getSheetName();
        
        if (startRowIndex == null) {
        	var selector = grid.selection.select();
        	if(selector.selectingColumns())
        		return;
        	startRowIndex = selector._startRowIndex;
        	endRowIndex = selector._endRowIndex;
        	if(startRowIndex > endRowIndex)
        	{
        		var idx = startRowIndex;
        		startRowIndex = endRowIndex;
        		endRowIndex = idx;
        	}
        }
        
	    //show warning message if the will be show row contains the filtered row by range filter
	    var doc = this.getDocumentObj();
		var areaMgr = doc.getAreaManager();
		var sheet = doc.getSheet(sheetName);
		var sheetId = sheet.getId();
    	var rangeFilters = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.RANGEFILTER, sheetName);
	    if(rangeFilters && rangeFilters.length > 0){
	      //must only one filter
	      var result = websheet.Helper.compareRange({sheetName:sheetName, startRow:startRowIndex, endRow:endRowIndex, startCol:1, endCol:1024}, 
	    		  rangeFilters[0]._getRangeInfo());
	      if(result != -1 && result != websheet.Constant.RangeRelation.NOINTERSECTION)
	    	  this._showRangeFilterMessage({sheet: sheetId}, doc);
	    }
	    var hiddenArray = websheet.Utils.getHiddenArray4Show(sheetName,startRowIndex,endRowIndex);
	    if(hiddenArray.length == 0){//no hidden rows in this range, check top hidden rows
	    	if (websheet.Utils.checkTopBoundaryHiddenRows(startRowIndex)){
				//show row from first rows
				//get the hidden row again with new range.
	    		hiddenArray = websheet.Utils.getHiddenArray4Show(sheetName,0,startRowIndex);
				startRowIndex = hiddenArray[0].startRowIndex;
				endRowIndex = hiddenArray[0].endRowIndex;
			}
	    }
	    if(hiddenArray.length == 0)
	    	return;
	    
	    var freezeRow = dojo.some(hiddenArray, function(item){
	    	if(item.startRowIndex < this.freezeRow)
	    		return true;
	    }, grid);

	    this.getController().showRows(sheetName, hiddenArray);
        var params = {refMask: websheet.Constant.ROWS_MASK};
        refValue=websheet.Helper.getAddressByIndex(sheetName, parseInt(startRowIndex)+1, null,null,parseInt(endRowIndex)+1,null,params);
        var attrs = {};
        attrs.visibility = websheet.Constant.ROW_VISIBILITY_ATTR.SHOW;
        var reverseContent = new Array();
        for(var k=0 ; k<hiddenArray.length ; k++){
          	var reRefValue=websheet.Helper.getAddressByIndex(sheetName, parseInt(hiddenArray[k].startRowIndex)+1, null,null,parseInt(hiddenArray[k].endRowIndex)+1,null,params);
        	reverseContent.push(reRefValue);
        }
        var reAttrs = {};
        reAttrs.visibility = websheet.Constant.ROW_VISIBILITY_ATTR.HIDE;
        var event = new websheet.event.SetRow(refValue, attrs);
        var reverse = new websheet.event.Reverse(event, refValue, reAttrs , reverseContent);
        this.sendMessage (event,reverse);
	},
	
	/*
	 * hide rows
	 */
	hideRows:function(startRowIndex, endRowIndex){
        var grid = this.getCurrentGrid();
        var sheetName = grid.getSheetName();
        
		if (startRowIndex == undefined || endRowIndex == undefined){
	        var selector = grid.selection.selector();
	        if(selector.selectingColumns())
	        	return;
		    var range = selector.getRangeInfo();
		    startRowIndex = range.startRow - 1;
		    endRowIndex = range.endRow - 1;
		}
		
		var hiddenArray = websheet.Utils.getHiddenArray4Hide(sheetName, startRowIndex, endRowIndex);
		var freezeRow = dojo.some(hiddenArray, function(item){
		    	if(item.startRowIndex < this.freezeRow)
		    		return true;
		    }, grid);
		
		this.getController().hideRows(sheetName, startRowIndex, endRowIndex, hiddenArray, true);//set focus to next visible row
        var params = {refMask: websheet.Constant.ROWS_MASK};
        refValue=websheet.Helper.getAddressByIndex(sheetName, parseInt(startRowIndex)+1, null,null,parseInt(endRowIndex)+1,null,params);
        var attrs = {};
        attrs.visibility = websheet.Constant.ROW_VISIBILITY_ATTR.HIDE;
        var reAttrs = {};
        reAttrs.visibility = websheet.Constant.ROW_VISIBILITY_ATTR.SHOW;
        var reverseContent = new Array();
        for(var k=0 ; k<hiddenArray.length ; k++){
        	var reRefValue=websheet.Helper.getAddressByIndex(sheetName, parseInt(hiddenArray[k].startRowIndex)+1, null,null,parseInt(hiddenArray[k].endRowIndex)+1,null,params);
        	reverseContent.push(reRefValue);
        }
        var event = new websheet.event.SetRow(refValue, attrs);
        var reverse = new websheet.event.Reverse(event, refValue, reAttrs, reverseContent);
        this.sendMessage (event,reverse);
	},
	
	/*
	 * show or hide columns
	 */
	showHideColumns: function(bShow, startColIndex, endColIndex){
        var grid = this.getCurrentGrid();
        var sheetName = grid.getSheetName();

		if(startColIndex == undefined || endColIndex == undefined){
	        var selector = grid.selection.selector();
	        var range = selector.getRangeInfo();
	        startColIndex = range.startCol;
		    endColIndex = range.endCol;
			if(selector.selectingRows() || selector.selectingSheet())
		    	return;
		}
		
	    var attrs = {};
	    var _ATTR = websheet.Constant.COLUMN_VISIBILITY_ATTR;
	    attrs.visibility = bShow ? _ATTR.SHOW : _ATTR.HIDE;
		var params = {bSetFocus: true};
	    var utils = websheet.Utils;
	    var dataArray = null;
        if(bShow)
        {
        	var searchEnd = endColIndex + 1, maxCol = websheet.Constant.MaxColumnIndex;
        	while (grid.geometry.colWidth(searchEnd) <= 0 && searchEnd < maxCol) {
        		searchEnd++;
        	}
        	if (searchEnd >= maxCol) {
        		endColIndex = maxCol;
        	}
        	//Reference, 49278, to make sure there's a way to show out the un-selectable hidden columns (the last few invisible columns);
        	var hiddenArray = utils.getHiddenColsArray(sheetName,startColIndex,endColIndex);
        	if(hiddenArray.length == 0 && utils.checkTopHiddenCols(sheetName,startColIndex-1))
        	{
        		endColIndex = startColIndex -1;
        		startColIndex = 1; 
        		hiddenArray.push({startIndex: startColIndex, endIndex : endColIndex});
        	}	
        	if(hiddenArray.length == 0 ) return;
        	dataArray = hiddenArray;
        }	
        else
        {
        	dataArray = utils.getShowColsArray(sheetName,startColIndex,endColIndex);
        }	
        this.getController().setColumns (sheetName, startColIndex, endColIndex, attrs, params);
    	var refValue = websheet.Helper.getAddressByIndex(sheetName, null, startColIndex,null,null,endColIndex,{refMask: websheet.Constant.COLS_MASK});
    	var event = new websheet.event.SetColumn(refValue, attrs);
    	
    	var reverseInfo = [];
    	for(var i = 0; i < dataArray.length; i++)
    	{
    		var reRefValue = websheet.Helper.getAddressByIndex(sheetName, null, dataArray[i].startIndex,null,null,dataArray[i].endIndex,{refMask: websheet.Constant.COLS_MASK});
    		reverseInfo.push(reRefValue);
    	}
    	var reAttrs = {visibility : (bShow ? _ATTR.HIDE : _ATTR.SHOW)};
    	var reverse = new websheet.event.Reverse(event, refValue, reAttrs, reverseInfo);
    	this.sendMessage (event,reverse);
	},
	
	/*
	 * insert columns
	 * @param bInsertAfter	true if insert columns after the selected columns
	 * 						false if insert columns before the selected columns
	 */
    /*boolean*/insertColumns: function(bInsertAfter, startIndex, endIndex){
    	var grid = this.getCurrentGrid(), sheetName = grid.sheetName;
        
    	if (startIndex == null) {
    		var selector = grid.selection.selector();
    		//when select all, could insert columm a-az
    		if(((selector.selectingRows() && ! selector.selectingSheet()) || selector.selectingRow()))
    			return;
        
    		startIndex = selector._startColIndex;
    		endIndex = selector._endColIndex;
    		if (startIndex > endIndex) {
    			startIndex ^= endIndex;
    			endIndex ^= startIndex;
    			startIndex ^= endIndex;
    		}
    	}
    	
    	if (bInsertAfter) {
    		var delta = endIndex - startIndex;
    		startIndex = endIndex + 1;
    		endIndex = startIndex + delta;
    	}
    	
        if(websheet.Utils.isLastHiddenCol(sheetName,startIndex)) return;
        if(this.showColumnsBeyondWarning(false, sheetName, startIndex, endIndex))
			return false;
        
        this.getController().insertColumns(sheetName, startIndex, endIndex);
        //move select rect into view 
        this.getTaskMan().addTask(this, "moveSelectRectFocusVisible", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
        this.getTaskMan().start();
        var params = {refMask: websheet.Constant.COLS_MASK};
        var refValue = websheet.Helper.getAddressByIndex(sheetName, null, startIndex, null, null, endIndex, params);
        var event = new websheet.event.InsertColumn(refValue);
        var areaMgr = this.getDocumentObj().getAreaManager();
        var content = {};
        content.shareRanges = areaMgr.getSharedRefs4InsertUndo();
		var reverse = new websheet.event.Reverse (event, refValue, null, content);
		this.sendMessage (event, reverse);
		
		return true;
    },
    
    deleteColumns: function(startIdx, endIdx){
		var grid = this.getCurrentGrid();
   		var sheetName = grid.sheetName;
    
    	if (startIdx == null) {
    		startIdx = endIdx = grid.selection.getFocusedCol();
    		var selector = grid.selection.selector(), selectType = selector.getSelectType();
    		if(selectType == websheet.Constant.Column || selectType == websheet.Constant.ColumnRange ||
        		((selectType == websheet.Constant.RowRange && selector._startRowIndex == 0 && selector._endRowIndex == this.maxRow - 1)))
    		{
    			var s = selector._startColIndex, e = selector._endColIndex;
    			if(s > e){s ^= e;e ^= s;s ^= e;}
    			startIdx = s, endIdx = e;
    		}
        
    		if(websheet.Utils.isLastHiddenCol(sheetName, startIdx)) return;
    	}
        
        var doc = this.getDocumentObj();
        var params = {refMask: websheet.Constant.COLS_MASK};
        var refValue = websheet.Helper.getAddressByIndex(sheetName, null, startIdx, null, null, endIdx, params);
        //column might contain Task
        //deleteType == 1 means delete column
		var canDelete = true;
		var taskHdl = this.getTaskHdl();
		if (taskHdl) canDelete = taskHdl.preDeleteRange(1, sheetName, startIdx, endIdx);
		if(!canDelete) return;
		
		var eventData = websheet.model.ModelHelper.toColsJSON(sheetName, startIdx, endIdx);
		
		var uuid = dojox.uuid.generateRandomUuid();
		this.getController().deleteColumns(sheetName, startIdx, endIdx, uuid);

		var areaMgr = doc.getAreaManager();
		var content = {};
		var undoCells = areaMgr.getCells4DeleteUndo();
		content.cells = websheet.Utils.getImpactCellsValue(sheetName,undoCells,websheet.Constant.Column);
		content.areas = areaMgr.getRanges4DeleteUndo();
		content.cRanges = areaMgr.getChartSequenceRefs4DeleteUndo();
		content.shareRanges = areaMgr.getSharedRefs4DeleteUndo();
        var freezeHdl = this.getFreezeHdl();
        var restoreInfo = freezeHdl.getRestoreInfo();
        if(restoreInfo)
        {
        	content.freeze = restoreInfo[sheetName];
        }
        var filterMsg = this.getAutoFilterHdl().getAndResetReverseMsg();
        content.filter = filterMsg;
        
        //move select rect into view
        this.getTaskMan().addTask(this, "moveSelectRectFocusVisible", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
        this.getTaskMan().start();
		var attrUpdates = {uuid: uuid};
        var event = new websheet.event.DeleteColumn(refValue,attrUpdates);
        if(filterMsg)
        {
        	//TODOL should move to Factory.deleteColumn?
        	var msgJson = this.getFilterMsg4DeleteCol(filterMsg, refValue);
        	if(msgJson)
        		event.getMessage().updates.push(msgJson);
        }	
        eventData.uuid = uuid;
		var reverse = new websheet.event.Reverse (event, refValue, eventData, content);
		this.sendMessage (event, reverse);
    },
    
    /**
     * Used in delete event for server side to show rows because filter rule removed.
     * The filter action used in reverse event is created in factory.
     * @param filterMsg
     * @param dltColRef : the delte col refValue
     * @returns
     */
    getFilterMsg4DeleteCol: function(filterMsg,dltColRef)
    {
    	if(!filterMsg) return;
    	
    	var updates = filterMsg instanceof websheet.event._event ? filterMsg.getMessage().updates : filterMsg  ;
    	var update = updates[0];
    	//this means the whole filter been deleted
    	if(update && update.action == websheet.Constant.Event.ACTION_INSERT)
    		return null;
    	
    	//get the show rows
    	var s = [];
    	var len = updates.length;
    	for(var i = 0; i < len; i++)
    	{
    		var update = updates[i];
    		if(update.data && update.data.h)
    			s = s.concat( update.data.h);
    	}	
    	if(s.length == 0 ) return;
    	s.sort(function(a,b){return a-b;});
    	//get the correct refValue for the filter after delete column
    	var dltColParseRef =  websheet.Helper.parseRef(dltColRef);
    	var filterRef = websheet.Helper.parseRef(update.reference.refValue);
    	var sc = filterRef.startCol, ec = filterRef.endCol;
    	var dltSc = dltColParseRef.startCol, dltEc = dltColParseRef.endCol;
    	dltEc = dltEc ? dltEc : dltSc;
    	var dltCnt = dltEc - dltSc + 1;
    	if(sc >= dltSc && sc <= dltEc)
    		sc = dltSc;
    	else if( sc > dltEc)
    		sc -= dltCnt;
    	
    	if(ec >= dltSc && ec <= dltEc)
    		ec = dltSc -1;
    	else if( ec > dltEc)
    		ec -= dltCnt;
    	
    	var filterRefValue = websheet.Helper.getAddressByIndex(filterRef.sheetName, filterRef.startRow, sc,null,filterRef.endRow,ec);
    	var attrs = {rangeid: update.data.rangeid, s: s, usage: websheet.Constant.RangeUsage.FILTER};
    	var event = new websheet.event.Filter(filterRefValue, attrs);
    	return event.getMessage().updates[0];
    },
    
    /*
	 * move cells for insert cells or delete cells
	 * @param bDelete	true if delete cells
	 * 					false if insert cells
	 * @param bShiftUpDown	true if insert/delete cells and shift the selected cells down/up
	 * 						false if insert/delete cells and shift the selected cells right/left
	 */
    moveCells4InsertOrDel: function(bDelete, bShiftUpDown, rowIndex, endRowIndex, colIndex, endColIndex){
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
    	
    	if (rowIndex == null) {
    	   	var selector = grid.selection.selector();
        	var range = selector.getRangeInfo();
        	rowIndex = range.startRow;
        	endRowIndex = range.endRow;
        	colIndex = range.startCol;
        	endColIndex = range.endCol;
    	}
    	
    	var rowNum = endRowIndex - rowIndex + 1;
    	var colNum = endColIndex - colIndex + 1;
    	
    	var sheet = this.getDocumentObj().getSheet(sheetName);
    	
    	var validLastRowIndex = websheet.model.ModelHelper.getValidLastRow(sheet);
    	var validLastColIndex = websheet.model.ModelHelper.getValidLastCol(sheet);
		
    	var maxColIdx = websheet.Constant.MaxColumnIndex;
    	
    	var cbRowIndex = rowIndex;
    	var cbColIndex = colIndex;
    	var cbEndRowIndex = endRowIndex;
    	var cbEndColIndex = endColIndex;
    	
    	var tRowIndex = rowIndex;
    	var tColIndex = colIndex;
    	var tEndRowIndex = endRowIndex;
    	var tEndColIndex = endColIndex;
    	
    	var moveEmpty = false;
    	if(bDelete){
        	if(bShiftUpDown){
        		cbRowIndex = endRowIndex + 1;
        		cbEndRowIndex = validLastRowIndex;
        		// Expand the cut/paste range for correcting the range referred by formulas.
        		cbEndRowIndex += websheet.Constant.Expand4ShiftCell;
        		if(cbEndRowIndex - cbRowIndex + 1 < rowNum)
        			cbEndRowIndex = cbRowIndex + rowNum - 1;

        		tEndRowIndex = tRowIndex + cbEndRowIndex - cbRowIndex;
        	}else{
        		cbColIndex = endColIndex + 1;
        		if(cbColIndex > maxColIdx){
        			//bClearNum = colNum;
        			cbEndColIndex = cbColIndex;
        		}else{
	        		cbEndColIndex = validLastColIndex;
	        		// Expand the cut/paste range for correcting the range referred by formulas.
	        		cbEndColIndex += websheet.Constant.Expand4ShiftCell;
	        		if(cbEndColIndex - cbColIndex + 1 < colNum)
	        			cbEndColIndex = cbColIndex + colNum - 1;
	        		
	        		if(cbEndColIndex > maxColIdx)
	        			cbEndColIndex = maxColIdx;
	        		if(cbEndColIndex - cbColIndex + 1 > colNum)
	        			tEndColIndex = tColIndex + cbEndColIndex - cbColIndex;
        		}
        	}
    	}else{
    		if(bShiftUpDown){
    			cbEndRowIndex = cbEndRowIndex < validLastRowIndex ? validLastRowIndex : cbEndRowIndex;
    			if(cbEndRowIndex + rowNum > this.maxRow){
    				var maxRowIndex4Show = websheet.model.ModelHelper.getMaxRowIndex(sheet, colIndex, endColIndex, false);
    				if(endRowIndex <= maxRowIndex4Show){
    					if(maxRowIndex4Show + rowNum > this.maxRow){
        					var warningMessage = dojo.string.substitute(this.nls.BEYOND_ROWS_BY_INSERT_CELLS_MSG,[this.maxRow]);
        					var dlg = new concord.widgets.MessageBox(this, null, null, false, {message: warningMessage});
        					dlg.show();
        	    			return;
    					}
    					cbEndRowIndex = maxRowIndex4Show;
    				}else if(cbRowIndex > maxRowIndex4Show){//The cells need to move are all empty cells
						moveEmpty = true;
						cbEndRowIndex = endRowIndex;
    				}
    				else{//cbRowIndex to maxRowIndex4Show are not empty cells
						// maxRowIndex4Show to endRowIndex are empty cells
						// move cbRowIndex to maxRowIndex4Show to endRowIndex + 1;
						// check beyond firstly.
						rowNum = maxRowIndex4Show - cbRowIndex + 1;
						if(endRowIndex + rowNum > this.maxRow){
							var warningMessage = dojo.string.substitute(this.nls.BEYOND_ROWS_BY_INSERT_CELLS_MSG,[this.maxRow]);
	    					var dlg = new concord.widgets.MessageBox(this, null, null, false, {message: warningMessage});
	    					dlg.show();
	    	    			return;
						}
						cbEndRowIndex = maxRowIndex4Show;
					}
    			}
    			// Expand the cut/paste range for correcting the range referred by formulas.
	    		cbEndRowIndex += websheet.Constant.Expand4ShiftCell;
	    		if(moveEmpty){
	    			if(cbEndRowIndex > this.maxRow)
	    				cbEndRowIndex = this.maxRow;
	    			tEndRowIndex = cbEndRowIndex;
	    		}else{
    				tRowIndex = endRowIndex + 1;
    				var maxCbNum = this.maxRow - tRowIndex + 1;
    				if(cbEndRowIndex - cbRowIndex + 1 > maxCbNum)
    	    			cbEndRowIndex = cbRowIndex + maxCbNum - 1;
    				tEndRowIndex = tRowIndex + cbEndRowIndex - cbRowIndex;
    			}
    		}else{
    			cbEndColIndex = cbEndColIndex < validLastColIndex ? validLastColIndex : cbEndColIndex;
    			if(cbEndColIndex + colNum > maxColIdx){
    				var maxColIndex4Show = websheet.model.ModelHelper.getMaxColIndex4Show(sheetName, rowIndex, endRowIndex);
    				var cols = sheet._columns;
    				var maxColIndex4Style = 1;
    				for(var i = cols.length - 1; i >= 0; i--){
    					var col = cols[i];
    					if(col._styleId != null)
    					{
    						maxColIndex4Style = col.getIndex();
    						if(col.getRepeatedNum() < websheet.Constant.ThresColRepeatNum)
    							maxColIndex4Style += col.getRepeatedNum();
    						break;
    					}
    				}
    				maxColIndex4Show = maxColIndex4Style > maxColIndex4Show ? maxColIndex4Style:maxColIndex4Show;
    				
    				if(endColIndex < maxColIndex4Show){
    					if(maxColIndex4Show + colNum > maxColIdx){
        					var warningMessage = dojo.string.substitute(this.nls.BEYOND_COLUMNS_BY_INSERT_CELLS_MSG,[maxColIdx]);
        					var dlg = new concord.widgets.MessageBox(this, null, null, false, {message: warningMessage});
        					dlg.show();
        	    			return;
        				}
        				cbEndColIndex = maxColIndex4Show;
    				}else if(cbColIndex > maxColIndex4Show){
    					moveEmpty = true;
    					cbEndColIndex = endColIndex;
    				}else{
    					colNum = maxColIndex4Show - cbColIndex + 1;
    					if(endColIndex + colNum > maxColIdx){
    						var warningMessage = dojo.string.substitute(this.nls.BEYOND_COLUMNS_BY_INSERT_CELLS_MSG,[maxColIdx]);
        					var dlg = new concord.widgets.MessageBox(this, null, null, false, {message: warningMessage});
        					dlg.show();
        	    			return;
    					}
    					cbEndColIndex = maxColIndex4Show;
    				}
    			}
    			// Expand the cut/paste range for correcting the range referred by formulas.
	    		cbEndColIndex += websheet.Constant.Expand4ShiftCell;
	    		if(moveEmpty){
	    			if(cbEndColIndex > maxColIdx)
	    				cbEndColIndex = maxColIdx;
	    			tEndColIndex = cbEndColIndex;
	    		}else{
	    			tColIndex = endColIndex + 1;
	    			var maxCbNum = maxColIdx - tColIndex + 1;
	    			if(cbEndColIndex - cbColIndex + 1 > maxCbNum)
	    				cbEndColIndex = cbColIndex + maxCbNum - 1;
	    			tEndColIndex = tColIndex + cbEndColIndex - cbColIndex;
	    		}
    		}
    	}
    	
    	var mergeCells = websheet.Utils.getMergeCellInfo(sheetName, cbRowIndex, cbEndRowIndex ,cbColIndex, cbEndColIndex);
    	var rangeInfo = {sheetName:sheetName, startRow:cbRowIndex, endRow:cbEndRowIndex, startCol:cbColIndex, endCol:cbEndColIndex};
    	for(var i = 0; i < mergeCells.length; i++){
    		var result = websheet.Helper.compareRange(websheet.Helper.parseRef(mergeCells[i]), rangeInfo);
    		if(result == websheet.Constant.RangeRelation.INTERSECTION){
    			var dlg = new concord.widgets.MessageBox(this, null, null, false, {message: this.nls.INSERT_DELETE_CELLS_CANCEL});
				dlg.show();
    			return;
    		}
    	}
    	    	
    	//		Leverage clipboard's 'cut from internal clipboard' routine to make its purpose.
    	//		The argsArray is arguments the copy method( which functionCopy indicates) used. 
    	var argsArray = [{}, sheetName, cbRowIndex, cbEndRowIndex, cbColIndex, cbEndColIndex];
    	var clipboard = this._clipboard;
    	if(clipboard['_copyRange'] == null) return;
    	var signal = dojo.aspect.around(clipboard, '_copyRange', function(original){
    		return function() {
    			try{
	    			var storage;
	    			var _onCopy = clipboard._onCopy;
	    			clipboard._cutting = true;
	    			clipboard._onCopy = function(content){
	    				storage = content;
	    				clipboard._storage._cleanData(storage);
	    			};
	    			original.apply(clipboard, arguments);
	    			clipboard._onCopy = _onCopy;
	    			clipboard._pasteRange(storage.data, sheetName, tRowIndex, tEndRowIndex, tColIndex, tEndColIndex, cbRowIndex, cbColIndex, cbEndRowIndex, cbEndColIndex, sheetName);
    			} catch(e){
	    			
    			} finally{
    				clipboard._cutting = false;
	    			signal.remove();
    			}
    		};
    	});
    	clipboard['_copyRange'].apply(clipboard, argsArray);
		var sr = grid.selection.selector();
		sr.selectRange(null, null, endRowIndex -1, endColIndex);
    },
    
    selectSheet: function() {
    	this.getCurrentGrid().selection.select().selectAll();
    },
    
    copy: function(args) {
    	var event;
    	if (args) 
    		event = args[0];
		this._clipboard.copy(event);		
    },
    
    cut: function(args) {
    	var event;
    	if (args)
    		event = args[0];
		this._clipboard.cut(event);
    },
    
    paste: function(args) {
    	var event;
    	if (args) 
    		event = args[0];
		this._clipboard.paste(event);
    	this._moveSelectRectFocusVisible();
    },
    
    _format: function(args) {
    	var event = null;
    	if(args)
    		event = args[0];
    	if(!event.checked){
    		this._formatpainter.clear();
    		dojo.disconnect(this._painter);
    		return;
    	}
    	this._formatpainter.setStyleCursor();
    	this._formatpainter.format(event);
    	dojo.disconnect(this._painter); // release the connect caused by double click
    	this._painter = dojo.connect(this.domNode, "mouseup", dojo.hitch(this, "execCommand", ((event.dblclick) ? commandOperate.CONPAINT : commandOperate.PAINT)));
    },
    
    _paint: function(e, isConPaint){
    	//No grid property or mouse middle/right click
    	if(!e.grid || e.button !== 0){
    		return;
    	}
    	try{
    		this._formatpainter.paint(e);
    	} catch (err){
    		console.log(err);
    	}
    	if(!isConPaint){
    		dojo.disconnect(this._painter);
    		this._formatpainter.clear();
    	}
    	this._moveSelectRectFocusVisible();
    },
    
    _moveSelectRectFocusVisible: function() {
    	this.getTaskMan().addTask(this, "moveSelectRectFocusVisible", [], null, false, 0, function (newTask, taskInQueue) {
    		if (newTask.task == taskInQueue.task) {
    			return -1; // remove the old task in queue, keep the new task;
    		}
    	});
    	this.getTaskMan().start();
    },

    //  insert unnamed ranges by default, they are chart, image, comment and filter
    //  insert named range if bNamedRange is true
    /*void*/insertRange: function(rangeId, rangeAddr, attrs, reverseAttrs, reverseContent, bNamedRange) {
    	this.getController().insertRange(rangeId, rangeAddr, attrs);

    	var event = null;
    	if (bNamedRange)
    		event = new websheet.event.InsertRange(rangeAddr, attrs);
    	else
    		event = new websheet.event.InsertUnnameRange(rangeAddr, attrs);
		var reverse = new websheet.event.Reverse(event, rangeAddr, reverseAttrs, reverseContent);
		this.sendMessage(event, reverse);
    },

    // delete unnamed ranges by default, they are chart, image, comment and filter
    // delete named range if bNamedRange is true
    /*void*/deleteRange: function(rangeId, rangeAddr, attrs, reverseAttrs, reverseContent, bNamedRange) {
    	this.getController().deleteRange(rangeId, attrs.usage);
    	
    	var event = null;
    	if (bNamedRange)
    		event = new websheet.event.DeleteRange(rangeAddr, attrs);
    	else
    		event = new websheet.event.DeleteUnnameRange(rangeAddr, attrs);
		var reverse = new websheet.event.Reverse(event, rangeAddr, reverseAttrs, reverseContent);
		this.sendMessage(event, reverse);
    },
    
    // set the property of unnamed ranges by default, they are chart, image and comment
    // set the property of named range if bNamedRange is true
    /*void*/setRangeInfo: function(rangeAddr, attrs, reverseAddr, reverseAttrs, bNamedRange) {
    	this.getController().setRangeInfo(rangeAddr, attrs);
    	
    	var event = null;
    	if (bNamedRange)
    		event = new websheet.event.SetRange(rangeAddr, attrs);
    	else
    		event = new websheet.event.SetUnnameRange(rangeAddr, attrs);
		var reverse = null;
		if (reverseAttrs)
			reverse = new websheet.event.Reverse(event, reverseAddr, reverseAttrs);
		this.sendMessage(event, reverse);
    },

    // remove or split impacted validation ranges
    /*void*/deleteRangesByRange: function(rangeAddr, attrs, reverseAddr, reverseAttrs, reverseContent) {
		this.getController().deleteRangeByRef(rangeAddr, attrs.usage);
		
		var event = new websheet.event.DeleteUnnameRange(rangeAddr, attrs);
		var reverse = null;
		if (reverseAttrs)
			reverse = new websheet.event.Reverse(event, reverseAddr, reverseAttrs, reverseContent);
		this.sendMessage(event, reverse);
    },
    
	/*
	 * Returns:
	 * 1: sort is completed
	 * -1: error happened
	 * -2: set range part of sorting is executed async, but sort results are completed
	 */	
	 sortRange: function(refValue, sortData) {
		var ret = 0;
		
		try {
			ret = this.getController().sortRange(refValue, sortData);
			switch (ret) {
				case 1:
					// compelted
					// rangeSorting.sendSortRangeMsg(sortData);
					break;
				case -2:
					// executing async
					break;
				default:
					// never here
					;
			}
		} catch(e) {
			ret = -1;	
		}
		return ret;
    },

    Font: function(args){
    	var name = args[0];
    	if (!name) return;
    	var fontStyle = {}; fontStyle[websheet.Constant.Style.FONTNAME] = name;
        var styleChange = {"font": fontStyle};
        this.SetStyle({style:styleChange});
    },

    FontSize: function(args){
    	var size = args[0];
    	if (!size) return;
    	var fontStyle = {}; fontStyle[websheet.Constant.Style.SIZE] = size;
        var styleChange = {"font": fontStyle};
        this.SetStyle({style:styleChange});
    },
    
    FontColor: function(args){
    	var color = args[0];
    	if(!color) return;
    	var fontStyle = {}; fontStyle[websheet.Constant.Style.COLOR] = color;
    	var styleChange = {"font": fontStyle};
        this.SetStyle({style:styleChange});
    },

    wrapText: function()
    {
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.sheetName;
		if(grid) 
		{
			var selected = grid.selection.getFocusedCell();
			var rowIndex = selected.focusRow;
			var colIndex = selected.focusCol;
			var docObj = this.getDocumentObj();
	        var styleManager = docObj._getStyleManager();
	        var styleId = docObj.getCellStyleId(sheetName, rowIndex + 1, colIndex);
	        var styleCode = styleManager.getStyleById(styleId);
	        var styleChangeJson = {};
	        var bWrap = styleManager.getAttr(styleCode, websheet.Constant.Style.WRAPTEXT);
	        if(bWrap) {
	        	styleChangeJson[websheet.Constant.Style.WRAPTEXT] = false;
	        } else {
	        	styleChangeJson[websheet.Constant.Style.WRAPTEXT] = true;
	        }
	        
	        this.SetStyle({style:styleChangeJson});
		}
    },
    
    toggleAutoComplete: function()
    {
    	this.autoComplete = !this.autoComplete;
    	if(this.settings) 
    		this.settings.setAutoComplete(this.autoComplete);	
    },
    
    quickFormula: function(formulaName)
    {
    	var controller = this.getController();
        var sheetName = this.getCurrentGrid().getSheetName();
        if(this.hasDrawFrameSelected()) return;
		var grid = controller.getGrid(sheetName);
		if(!grid) return;
		var selector = grid.selection.activeSelector();
		if(!selector)	return;
		var selectType = selector.getSelectType();
		var range = selector.getRangeInfo();
		var selected = grid.selection.getFocusedCell();
		var value = null;
		var rowIndex = 0;
		var colIndex = 0;
		formulaName = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(formulaName);
		switch(selectType)
		{
			//just set the formula on the selected cell
			case websheet.Constant.Cell:
				value = "=" + formulaName + "()";
				rowIndex = selected.focusRow + 1;
				colIndex = selected.focusCol;
				break;
			//set the formula to the first cell of next row, except for the select row range contain the largest row(100000)
			case websheet.Constant.Row:
			case websheet.Constant.RowRange:
				var minRowIndex = range.startRow;
				var maxRowIndex = range.endRow;
				rowIndex = (maxRowIndex >= this.maxRow) ? minRowIndex : (maxRowIndex + 1);
				colIndex = 1;
				break;
			//set to the first cell of the column
			case websheet.Constant.Column:
			case websheet.Constant.ColumnRange:
				rowIndex = 1;
				colIndex = selected.focusCol;
				break;
			// if the range only contian one row and the max column less than the AZ, then set the formula to the next column cell
			// else set the formula to the next row cell
			case websheet.Constant.Range:
				var minRIndex = range.startRow;
				var maxRIndex = range.endRow;
				var minCIndex = range.startCol;
				var maxCIndex = range.endCol;
				if(minRIndex == maxRIndex && maxCIndex < websheet.Constant.MaxColumnIndex)
				{
					rowIndex = minRIndex;
					colIndex = maxCIndex + 1;
				}
				else
				{
					rowIndex = (maxRIndex < this.maxRow) ? maxRIndex + 1 : minRIndex;
					colIndex = minCIndex;
				}
				break;
			default:
				break;
		}
		if(!value)
			value = "=" + formulaName + "(" + selector.getSelectedRangeAddress(false, true, false, false, true) +")";

		if(websheet.model.ModelHelper.isCellProtected(sheetName, rowIndex, colIndex)){
			this.protectedWarningDlg();
    		return;
		}
		
		var refValue = websheet.Helper.getCellAddr(sheetName, rowIndex, colIndex);
    	if(this.isACLForbiddenArea(refValue)) return;
    	
		this.setFocus(refValue, true);
		var inlineEditor = grid.getInlineEditor();
		inlineEditor.editingStart();
		inlineEditor.setValue(value);
		setTimeout(dojo.hitch({}, function(inlineEditor, position){
			inlineEditor.setCursor(position);
			inlineEditor.getInputTextSelection(true);
		}, inlineEditor, value.length - 1));
    },

    FontStyle: function(style) {
		var grid = this.getCurrentGrid();
        var sheetName = grid.getSheetName();
		if(grid) {
			var rowIndex = grid.selection.getFocusedRow();
			var colIndex = grid.selection.getFocusedCol();
			if(rowIndex != undefined && colIndex != undefined) {
				var docObj = this.getDocumentObj();
		        var styleManager = docObj._getStyleManager();
		        var styleId = docObj.getCellStyleId(sheetName, rowIndex + 1, colIndex);
		        var styleCode = styleManager.getStyleById(styleId);

		        var styleChange = {};
		        var change = styleChange.font = {};
        
		        var wcs = websheet.Constant.Style;
		        if (styleCode == null) {
		        	// current cell is null, set "style" is to change default cell style to the opposite
		            if (style == "italic") {
		                change[wcs.ITALIC] = !this._dbI;
		            }
		            if (style == "underline") {
		                change[wcs.UNDERLINE] = !this._dbU;
		            }
		            if (style == "strike") {
		                change[wcs.STRIKETHROUGH] = !this._dbST;
		            }
		            if (style == "bold") {
		                change[wcs.BOLD] = !this._dbB;
		            }
		        } else {
		            // styleCode merge
		        	var bStyle = null;
		            if (style == "italic") {
		        		bStyle = styleManager.getAttr(styleCode, wcs.ITALIC);
						change[wcs.ITALIC] = !bStyle;
		            } else if (style == "bold") {
		        		bStyle = styleManager.getAttr(styleCode, wcs.BOLD);
						change[wcs.BOLD] = !bStyle;
		            } else if (style == "underline") {
		        		bStyle = styleManager.getAttr(styleCode, wcs.UNDERLINE);
						change[wcs.UNDERLINE] = !bStyle;
		            } else if (style == "strike") {
		        		bStyle = styleManager.getAttr(styleCode, wcs.STRIKETHROUGH);
						change[wcs.STRIKETHROUGH] = !bStyle;
		            }
		            // else no styles
		        }

		        this.SetStyle( { style:styleChange } );
			}
		}
    },
    
    Align: function(position){
        var styleChange = {};
        styleChange[websheet.Constant.Style.TEXT_ALIGN] = position;
        //When set the text align in Docs, need to set the indent to 0.
        styleChange.indent = 0;      
        this.SetStyle({style:styleChange});
    },
    Valign: function(position){
        var styleChange = {};
        styleChange[websheet.Constant.Style.VERTICAL_ALIGN] = position;
        this.SetStyle({style:styleChange});
    },
    
    getBorderStyle: function(){
		if(!this._borderStyle){
			this._borderStyle = new websheet.BorderStyle(this);
		}
		return this._borderStyle;
	},
	
    /**
     * This function is used to set border/border color/border style
     * args is map, its format like one of below
     *  {type:BORDERCUSTOMIZE.CUSTOMIZECOLOR, color:{}}
     *  {type:BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle:BORDERSTYLE.THINSOLID}
     *  {type:BORDERCUSTOMIZE.CUSTOMIZEBORDER,  borderType:BORDERTYPE.ALLBORDERS}
     */
    CustomizeBorder: function(args, isMirrored){
    	if (isMirrored) {
    		if (args.borderType == BORDERTYPE.LEFTBORDER)
    			args.borderType = BORDERTYPE.RIGHTBORDER;
    		else if (args.borderType == BORDERTYPE.RIGHTBORDER)
    			args.borderType = BORDERTYPE.LEFTBORDER;
    	}
    	this.getBorderStyle().CustomizeBorder(args);
    },  
    
    numberFormat: function(format){
		//special treatment with "EUR": if locale is EURO country then
		var wcs = websheet.Constant.Style;
		var curr = format[wcs.FORMATCURRENCY] && format[wcs.FORMATCURRENCY].toUpperCase();
		if (!curr) {
			format[wcs.FORMATCURRENCY] = "";
		}
		var formatC = dojo.clone(format);
		if(curr == "EUR"){
			var locale = this.scene.getLocale().toLowerCase();
			var lang = locale.split("-")[0];
			var map = websheet.i18n.Number.EUROCountry;
			formatC[wcs.FORMATCURRENCY] = map[locale] || map[lang] || formatC[wcs.FORMATCURRENCY]; //if current locale is belongs to euro, then change the currency code
		}
		this.execCommand(commandOperate.SETSTYLE, [{ "format": formatC }]);
	},
    
    getSelectRectInfo: function() {
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
        var docObj = this.getDocumentObj();
        var selector = grid.selection.selector();
        var range = selector.getRangeInfo();
        this.moveSelectRectFocusVisible(selector);     	
        var rowIndex = range.startRow;
        var colIndex = range.startCol;
        var selectType = selector.getSelectType();        
        var startRowIndex = rowIndex;
        var endRowIndex = selector ? (range.endRow) : startRowIndex;
        var startColIndex = range.startCol;
    	var endColIndex = range.endCol;
        return {selectRect:selector, selectType : selectType,
        		startRowIndex:startRowIndex, endRowIndex:endRowIndex, startColIndex:startColIndex ,endColIndex:endColIndex, 
        		rowIndex:rowIndex, colIndex:colIndex, 
        		sheetName: sheetName};
    },

   SetBorderStyle: function(){
       var rectInfo = this.getSelectRectInfo();
       var selectType = rectInfo.selectType;
       var startRowIndex = rectInfo.startRowIndex;
       var endRowIndex = rectInfo.endRowIndex;
       var selectRect = rectInfo.selectRect;
       var rowIndex = rectInfo.rowIndex;
       var colIndex = rectInfo.colIndex;
       var startColIndex = rectInfo.startColIndex;
       var endColIndex = rectInfo.endColIndex;
       var sheetName = rectInfo.sheetName;
       var style;
	   switch (selectType) {
	       case websheet.Constant.RowRange:
	       case websheet.Constant.Row:
	       		style = this.getBorderStyle().preSetBorderStyle(selectType,
	       						{sheetName:sheetName, startRowIndex:startRowIndex, endRowIndex:endRowIndex, startColIndex: 1, endColIndex:websheet.Constant.MaxColumnIndex});
	       		break;
	       case websheet.Constant.Column:
	       case websheet.Constant.ColumnRange:	   
	    	    if(startColIndex == endColIndex && websheet.Utils.isLastHiddenCol(sheetName,endColIndex))
	       			return;
	    	    
	       		switch(this.getBorderStyle().bordertype){
//	       			case BORDERTYPE.ALLBORDERS:
	       			case BORDERTYPE.CLEARBORDERS:
	       				style = this.getBorderStyle().preSetBorderStyle(selectType,
	       						{sheetName: sheetName,startRowIndex:startRowIndex, endRowIndex:endRowIndex,startColIndex:startColIndex,endColIndex:endColIndex});
		     			break;
	       			default:
	       				style = this.getBorderStyle().preSetBorderStyle(selectType,
	  							{sheetName: sheetName,startRowIndex:startRowIndex, endRowIndex:endRowIndex,startColIndex:startColIndex,endColIndex:endColIndex});
	       				break;
	       		}
	       		break;
	       case websheet.Constant.Cell:
	    	   	style = this.getBorderStyle().preSetBorderStyle(selectType, rectInfo);
	    	   	break;
	       case websheet.Constant.Range:
	    	   	style = this.getBorderStyle().preSetBorderStyle(selectType,
	    	   					{sheetName: sheetName, startRowIndex:startRowIndex, endRowIndex:endRowIndex,startColIndex:startColIndex,endColIndex:endColIndex});
	       	   	break;
	       default:
	       	  	break;
       }
       this.SetStyle(style);
   },

    Direction: function(direction){
        var styleChange = {};
        styleChange[websheet.Constant.Style.DIRECTION] = direction;
        this.SetStyle({style:styleChange});
    },
    
    SheetDirection: function(isMirrored, bUndo){
    	var sheetName = this.getCurrentGrid().getSheetName();		
    	var grid = this.getController().getGrid(sheetName);
    	if (isMirrored != grid.isMirrored) {
    		this.scene.showWarningMessage(this.nls.TOGGLE_SHEET_DIRECTION_WARNING, 10000);
    		grid.isMirrored = isMirrored;
    		if (isMirrored){ 
		        grid.hScrollNode.dir = 'rtl';
		        dojo.addClass(grid.contentViews, 'rtl');	
		        dojo.place(grid.lbSubviewNode, grid.rbSubviewNode, "after");
		        dojo.place(grid.ltSubviewNode, grid.rtSubviewNode, "after");

		        grid.yScrollNode.style.left = '0px';
		        grid.xScrollNode.style.left = grid.yScrollNode.offsetWidth + 'px'; 
		        grid.basicLayer.style.left = grid.widgetLayer.style.left = grid.contentViews.style.left =
		        	grid.yScrollNode.offsetWidth + 'px';
		        grid.basicLayer.style.position = "absolute"; 

		        grid.basicLayer.height = grid.boxSizing.h
		        grid.basicLayer.width = grid.boxSizing.w
    		} else {
		        grid.hScrollNode.dir = 'ltr';
		        dojo.removeClass(grid.contentViews, 'rtl');
		        grid.getBasicLayerContext().setTransform(1, 0, 0, 1, 0, 0);
		        grid.getWidgetLayerContext().setTransform(1, 0, 0, 1, 0, 0);

		        dojo.place(grid.lbSubviewNode, grid.rbSubviewNode, "before");
		        dojo.place(grid.ltSubviewNode, grid.rtSubviewNode, "before");

		        grid.yScrollNode.style.left = grid.boxSizing.w + 'px';
		        grid.xScrollNode.style.left = '0px'; 
		        grid.basicLayer.style.left = grid.widgetLayer.style.left = grid.contentViews.style.left = '0px';
		        grid.basicLayer.style.position = "static"; 
    		}
    		grid.updateStage();
    		this.getToolbar() && this.getToolbar().updateSheetDirectionState(isMirrored);

    		if(!bUndo) {
		        var attrUpdates = {};
		        attrUpdates.dir = isMirrored ? 'rtl' : 'ltr';
		        var e = new websheet.event.SetSheet(sheetName,attrUpdates);
		        attrUpdates.isMirrored = !isMirrored;
		        attrUpdates.dir = !isMirrored ? 'rtl' : 'ltr';
		        var reverse = new websheet.event.Reverse(e,sheetName,attrUpdates);
		        this.sendMessage(e, reverse);
    		}
    	}
    },

    /**
     *set style operation,row start from 0 
     */
    SetStyle: function(styleinfo, bReplaceStyle) {
    	var style = styleinfo.style;
    	var styles = []; // used to collect styles json
    	if(style)
    		styles.push(style);
    	if(styleinfo.styles) // only border style have styles
    		styles = styles.concat(styles,styleinfo.styles);
        var controller = this.getController();
        var docObj = this.getDocumentObj();
        var styleMgr = docObj._getStyleManager();
    	var mhelper = websheet.model.ModelHelper;
    	var utils = websheet.Utils;
        var bUpdateChart = false;
        var bdefaultStyle = false;
        if(style && style.id && style.id == websheet.Constant.Style.DEFAULT_CELL_STYLE)
        	bdefaultStyle = true;
        var strBUndoDefault = websheet.Constant.bUndoDefault;
        
        var rectInfo = this.getSelectRectInfo();
        var selectType = rectInfo.selectType;
        var startRowIndex = rectInfo.startRowIndex;
        var endRowIndex = rectInfo.endRowIndex;
        var rowIndex = rectInfo.rowIndex;
        var colIndex = rectInfo.colIndex;
        var startColIndex = rectInfo.startColIndex;
        var endColIndex = rectInfo.endColIndex;
    	var sheetName = rectInfo.sheetName;
    	// the start/end row/col index might be changed by styleinfo if it is set border style, because the range might be enlarged due to the adjacent cell's border change
    	startRowIndex = styleinfo.startRow || startRowIndex;
    	startColIndex = styleinfo.startCol || startColIndex;
    	endRowIndex = styleinfo.endRow || endRowIndex;
    	endColIndex = styleinfo.endCol || endColIndex;
    	// js api can use styleinfo to specify selection information
    	selectType = styleinfo.selectType || selectType;
    	rowIndex = styleinfo.rowIndex || rowIndex;
    	colIndex = styleinfo.colIndex || colIndex;
    	sheetName = styleinfo.sheetName || sheetName;
    	
    	//pre format get the format js file first
    	if (style && style[websheet.Constant.Style.FORMAT])
    	{
    		websheet.Helper.preFormat(style);
    	}
    	//if seletc the whole sheet, make the style set on the columns
    	if(selectType == websheet.Constant.RowRange && 1 == startRowIndex && endRowIndex == this.maxRow)
    	{
    		selectType = websheet.Constant.ColumnRange;
    		startColIndex = 1, endColIndex = websheet.Constant.MaxColumnIndex;
    	}	
        var reverseInfo = {};
        var refValue = null;
        var hasFilteredRows = false;
        if (!styleinfo.json){
        	hasFilteredRows = websheet.Utils.hasFilteredRows( {sheetName: sheetName, startRow: startRowIndex,
        		endRow: endRowIndex, startCol: startColIndex, endCol: endColIndex});
        }
        switch (selectType) {
        case websheet.Constant.RowRange:
        case websheet.Constant.Row:
        	var rowJson = {};
        	var params = {refMask: websheet.Constant.ROWS_MASK};
        	refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,endRowIndex,null,params);
        	var attr;
        	if(styleinfo.oldRangeStyle){
        		reverseInfo = styleinfo.oldRangeStyle;
        	}else{
				var rowsDeltaStyle = mhelper.toRangeJSON(sheetName, startRowIndex, 1, endRowIndex, websheet.Constant.MaxColumnIndex,
												{ includeValue: false,  computeDelta: true, style: style, ignoreFilteredRows: hasFilteredRows});
				if (style[websheet.Constant.Style.FORMAT])
	        		bUpdateChart = true;
	        	else if (style.id && utils.isJSONContainValue(rowsDeltaStyle, utils.hasFormat))
					bUpdateChart = true;
	        	reverseInfo = {rows: rowsDeltaStyle};
        	}

        	if(styleinfo.json){
        		attr = rowJson = styleinfo.json;
        	} else {
        		rowJson.style = style;
        		var cellsJson = {
    	        		"A": {
    	        			"style": style,
    	        			"rn": websheet.Constant.MaxColumnIndex - 1
    	        		}
    	        };
        		var rowsMeta = {};
        		if (hasFilteredRows) {
        			// filtered row exists
        			rowsMeta = websheet.Helper.cloneJSON(reverseInfo.rows);
                	for (var rowIdx in rowsMeta) {
                		if (rowsMeta.hasOwnProperty(rowIdx))
                			rowsMeta[rowIdx].cells = cellsJson;
                	}
                	attr = {rows: rowsMeta};
        		} else {
        			rowsMeta[startRowIndex] = {cells: cellsJson};
        	        if (startRowIndex != endRowIndex) {
        	        	rowsMeta[startRowIndex].rn = endRowIndex - startRowIndex;
        	        }
            		attr = {style: style};
        		}
            	rowJson.rows = rowsMeta;
        	}

        	controller.setRows(sheetName, startRowIndex, endRowIndex, rowJson, bReplaceStyle, false, bUpdateChart);
        	if(styles) 
        		utils.clearUselessStyleAttr(styles,websheet.Constant.Style.HASH_CODE);
        	reverseInfo[strBUndoDefault] = bdefaultStyle; 
        	var event = new websheet.event.SetRow(refValue, attr);
        	var reverse = new websheet.event.Reverse(event, refValue, {}, reverseInfo);
        	this.sendMessage(event, reverse);
        	break;
        case websheet.Constant.Column:
        case websheet.Constant.ColumnRange:
        	if(startColIndex == endColIndex && websheet.Utils.isLastHiddenCol(sheetName,endColIndex))
        	{
        		return;
        	}	
        	// for border type is not ALLBorder or ClearBorder, the style should add to cell, so use Row operation instead of column operation
        	if(styleinfo.json && styleinfo.oldRangeStyle)
        	{
          		var rowJson = styleinfo.json;
          		var oldRangeStyle = styleinfo.oldRangeStyle;
        		controller.setRows(sheetName, startRowIndex, endRowIndex, rowJson, bReplaceStyle);
            	if(styles) 
            		utils.clearUselessStyleAttr(styles,websheet.Constant.Style.HASH_CODE);
            	var params = {refMask: websheet.Constant.ROWS_MASK};
            	refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,endRowIndex,null,params);
            	reverseInfo = oldRangeStyle;
            	reverseInfo[strBUndoDefault] = bdefaultStyle;
            	var event = new websheet.event.SetRow(refValue, rowJson);
            	var reverse = new websheet.event.Reverse(event, refValue, {}, reverseInfo);
            	this.sendMessage(event, reverse);
          	}
          	else
          	{
				var rowsStyleDelta = mhelper.toRangeJSON(sheetName, 1, startColIndex, websheet.Constant.MaxRowNum, endColIndex,
					{includeColumnStyle: hasFilteredRows, includeValue: false, computeDelta: true, style: style, forColumn: true, ignoreFilteredRows: hasFilteredRows});
		        var sheet = docObj.getSheet(sheetName);
				// construct undo data
				var reverseInfo = {};
				reverseInfo["rows"] = rowsStyleDelta;
				reverseInfo["columns"] = mhelper.getDeltaColsStyleJson(sheet,startColIndex,endColIndex,style);
				reverseInfo[strBUndoDefault] = bdefaultStyle;
				
	        	if (style[websheet.Constant.Style.FORMAT]) 
	        		bUpdateChart = true;
	        	else if (style.id && utils.isJSONContainValue(rowsStyleDelta, utils.hasFormat))
					bUpdateChart = true;
	        	
	        	var params = {};
	        	params.updateGrid = true;
	        	params.bReplaceStyle = bReplaceStyle;
	        	params.bSetFocus = true;
	        	params.bUpdateChart = bUpdateChart;

				var colJson = {};
				var attr;
				if (hasFilteredRows) {
		        	var rowsMeta = {};
	    			for (var rowIdx in reverseInfo.rows) {
	    				if (reverseInfo.rows.hasOwnProperty(rowIdx)){
	    					if (reverseInfo.rows[rowIdx].visibility) {
	    						rowsMeta[rowIdx] = websheet.Helper.cloneJSON(reverseInfo.rows[rowIdx]);
	    						delete rowsMeta[rowIdx].visibility;
	        				}
	    				}
					}
					colJson.rows = rowsMeta;
					var columnsMeta = {};
	    			var sStartCol = websheet.Helper.getColChar(startColIndex);
	    			columnsMeta[sStartCol] = {
	    				"style": style,
	    				"rn": endColIndex - startColIndex 
	    			};
	    			colJson.columns = columnsMeta;
	    			attr = websheet.Helper.cloneJSON(colJson);
				} else {
					attr = colJson = {style: style};
				}
 
	        	controller.setColumns(sheetName, colIndex, endColIndex, colJson, params);
	        	if(styles)
	        		utils.clearUselessStyleAttr(styles,websheet.Constant.Style.HASH_CODE);

	        	var params = {refMask: websheet.Constant.COLS_MASK};
	        	refValue = websheet.Helper.getAddressByIndex(sheetName, null, colIndex,null,null,endColIndex,params);
	        	var event = new websheet.event.SetColumn(refValue, attr);
	        	var reverse = new websheet.event.Reverse(event, refValue, {}, reverseInfo);
	        	this.sendMessage (event, reverse);
          	}
        	break;
        case websheet.Constant.Cell:
        	// for border type is not ClearBorder or inner/horizontal/vertical border, then it has been collected by preSetBorder
        	if(styleinfo.json && styleinfo.oldRangeStyle){
        		var rangeJson = styleinfo.json;
            	var reverseInfo = {rows:styleinfo.oldRangeStyle};
            	
                refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColIndex, null, endRowIndex, endColIndex);
            	controller.setRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, {forReplace:bReplaceStyle, bUpdateChart: bUpdateChart});
        		
            	reverseInfo[strBUndoDefault] = bdefaultStyle;
            	var event = new websheet.event.SetUnnameRange(refValue, rangeJson);
               	var reverse = new websheet.event.Reverse (event, refValue,reverseInfo);
               	this.sendMessage (event, reverse);
        	} else {
	        	var styleId = docObj.getCellStyleId (sheetName, rowIndex, colIndex);
	        	var oldCellStyle = null;
	        	if (styleId) {
	        		oldCellStyle = styleMgr.getStyleById (styleId);
	        	} else {
	        		var colModel = docObj.getColumn (sheetName, colIndex, true);
	        		var colStyle = colModel ? colModel.getStyle() : null;
	        		if (colStyle)
	        			oldCellStyle = colStyle;
	        	}
				var oldStyleJSON = (oldCellStyle)? oldCellStyle.toJSON():null;
	        	var delta = styleMgr.getDelta(oldStyleJSON, style);
	        	if (style[websheet.Constant.Style.FORMAT] || (delta && delta[websheet.Constant.Style.FORMAT])) 
	        		bUpdateChart = true;
	        	// if style id is provided, or bReplaceStyle is set, go to set cell style
	        	controller.setCellStyle(sheetName, rowIndex, colIndex, style, bReplaceStyle, bUpdateChart);	
	        	if(delta) reverseInfo = {"style": delta};
	        	reverseInfo[strBUndoDefault] = bdefaultStyle;
	        	var attrUpdates = {"style": style};
	        	refValue = websheet.Helper.getCellAddr(sheetName, rowIndex, colIndex);
	        	var event = new websheet.event.SetCell (refValue, attrUpdates);
	        	var reverse = new websheet.event.Reverse (event, refValue, reverseInfo);
	        	this.sendMessage(event, reverse);
        	}
        	break;
        case websheet.Constant.Range:
        	var rangeJson = {};
        	var oldRangeStyle={};
        	var attr;
        	
        	var sStartCol = websheet.Helper.getColChar(startColIndex);
            refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, sStartCol,null,endRowIndex,websheet.Helper.getColChar(endColIndex));
        	if(styleinfo.oldRangeStyle){
        		oldRangeStyle = styleinfo.oldRangeStyle;
        		reverseInfo = oldRangeStyle;
        	}else{
	        	//get style delta change
	        	oldRangeStyle = mhelper.toRangeJSON(sheetName, startRowIndex, startColIndex, endRowIndex,  endColIndex,
	        							{ includeValue: false, computeDelta: true, style: style, ignoreFilteredRows: hasFilteredRows} );
	        	reverseInfo = {rows:oldRangeStyle};
        	}
        	if(styleinfo.json){
        		attr = rangeJson = styleinfo.json;
    		}else{
				var cellsJson = {};
	        	cellsJson[sStartCol] = {style: style};
	        	if (endColIndex > startColIndex) {
    				cellsJson[sStartCol].rn = endColIndex - startColIndex ;
    			}
	        	
    			if (hasFilteredRows) {
        			var rowsMeta = websheet.Helper.cloneJSON(reverseInfo.rows);
            		for (var rowIdx in rowsMeta) {
            			if (rowsMeta.hasOwnProperty(rowIdx))
            				rowsMeta[rowIdx].cells = cellsJson;
            		}
            		rangeJson.rows = rowsMeta;
        			attr = rangeJson;
    			} else {
    				rangeJson[startRowIndex] = {cells: cellsJson};
    	        	if (endRowIndex > startRowIndex) {
        				rangeJson[startRowIndex].rn = endRowIndex - startRowIndex;
        			}
    				attr = {style: style};
    			}
	        	if (style[websheet.Constant.Style.FORMAT])
            		bUpdateChart = true;
            	else if (style.id && utils.isJSONContainValue(oldRangeStyle, utils.hasFormat))
    				bUpdateChart = true;
    		}
    		controller.setRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, {forReplace:bReplaceStyle, bUpdateChart: bUpdateChart});
        	if(styles) 
        		utils.clearUselessStyleAttr(styles,websheet.Constant.Style.HASH_CODE);
    		
        	reverseInfo[strBUndoDefault] = bdefaultStyle;
        	var event = new websheet.event.SetUnnameRange(refValue, attr);
           	var reverse = new websheet.event.Reverse (event, refValue,reverseInfo);
           	this.sendMessage (event, reverse);
        	break;
        default:
        	break;
        }
        
        controller.validateSheet (sheetName);
        var cellStyle = mhelper.getStyleCode (sheetName, rowIndex, colIndex, BidiUtils.isBidiOn());
        this.applyUIStyle(cellStyle);
    },

    _clearCell:function(sheetName, rowIndex, colIndex) {
        var cell = this.getDocumentObj().getCell(sheetName, rowIndex, colIndex);
        var reference = websheet.Helper.getCellAddr(sheetName, rowIndex, colIndex);
        if (!cell) return;
        
       	var reverseInfo = {v: cell.getRawValue()};
       	var tarr = cell.serializeTokenArray();
       	if (tarr && tarr.length > 0) {
       		reverseInfo.tarr = tarr;
       	}
		if(cell.getLink(true))
   			reverseInfo.link= cell.getLink();
		this.getController().setCell(sheetName, rowIndex, colIndex, "", null, /* client id, set null to remove it */ null);
    	var grid = this.getCurrentGrid();
		grid.updateRow(rowIndex - 1);
		var formulaBar = this.getFormulaBar();
       	formulaBar && formulaBar.setFormulaInputLineValue("");

		var attrUpdates = {"v":""};
		var event = new websheet.event.SetCell(reference, attrUpdates);
		var reverse = new websheet.event.Reverse(event, reference, reverseInfo);
		this.sendMessage (event, reverse);
    },
    /**
     * fill the target Range according to the source Range data
     * and send set range event
     */
    fillRange:function(sourceRange, targetRange)
    {
    	websheet.parse.FormulaParseHelper.enableCache();
    	
    	var sheetName = targetRange.sheetName;
    	var controller = this.getController();
    	
    	// range larger than 6 x 5000, stop script
    	var result = websheet.Utils.fillRange(sourceRange, targetRange);
    	
    	var rangeData = result.newData;
    	var oldRangeData = result.oldData;
    	var expandRange = result.expandRange;
       
        var startRow = targetRange.startRow;
        var startCol = targetRange.startCol;
        var endRow = targetRange.endRow;
        var endCol = targetRange.endCol;
        
        this._bFillLargeRange = ((endRow - startRow + 1) * (endCol - startCol + 1) > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE);
        if (this._bFillLargeRange)
        {
        	var scene = this.scene;
			var sceneNls = scene.nls;
			scene.showWarningMessage(sceneNls.browserWorkingMsg);
			var nextCB = dojo.hitch(this, this._postFillRange, sheetName, startRow, endRow, startCol, endCol, result);
        	controller.asyncSetRange(sheetName, startRow, endRow, startCol, endCol, rangeData,
        		{ ignoreFilteredRow: true, callback: dojo.hitch(this, this.addRangesByJSON, result.newDVs, nextCB)});
        }
        else
        {
	    	controller.setRange(sheetName, startRow, endRow, startCol, endCol, rangeData, { ignoreFilteredRow:true });
	    	this.addRangesByJSON(result.newDVs);
	    	this._postFillRange(sheetName, startRow, endRow, startCol, endCol, result);
        }
    },
    
    /*
     * Fill a selected range with the topmost/leftmost cell(s)
     * @param directon  
     *          down - fill down
     *          right - fill right
     */
    directionFill:function(direction)
    {
    	var grid = this.getCurrentGrid();
    	var selector = grid.selection.selector();
    	if (!selector.isShow())  // grid is not focused
    		return;
    	
    	var rangeInfo = selector.getRangeInfo();
    	var numRows = rangeInfo.endRow - rangeInfo.startRow + 1;
    	var numCols = rangeInfo.endCol - rangeInfo.startCol + 1;  
    	var maxNumCells =  	websheet.Constant.MaxCopyCells;
    	if (numRows * numCols > maxNumCells) {
    		var msg = dojo.string.substitute(this.nls.FILL_RANGE_MAX_MSG, [maxNumCells]);
    	    this.scene.showErrorMessage(msg, 5000);
    	    return;
    	}

        var source = null;
        var target = null;
        if (direction ==  websheet.Constant.DIRECTION.DOWN) {
        	if (rangeInfo.startRow == rangeInfo.endRow) // the selection is a single row
        		return;
        	source = new websheet.parse.ParsedRef(rangeInfo.sheetName, rangeInfo.startRow, 
            			rangeInfo.startCol, rangeInfo.startRow, rangeInfo.endCol, websheet.Constant.RANGE_MASK);
            target = new websheet.parse.ParsedRef(rangeInfo.sheetName, rangeInfo.startRow + 1, 
            			rangeInfo.startCol, rangeInfo.endRow, rangeInfo.endCol, websheet.Constant.RANGE_MASK); 
        } else if (direction == websheet.Constant.DIRECTION.RIGHT){
        	if (rangeInfo.startCol == rangeInfo.endCol) // a single column
        		return;
            source = new websheet.parse.ParsedRef(rangeInfo.sheetName, rangeInfo.startRow, 
            			rangeInfo.startCol, rangeInfo.endRow, rangeInfo.startCol, websheet.Constant.RANGE_MASK);
            target = new websheet.parse.ParsedRef(rangeInfo.sheetName, rangeInfo.startRow, 
            			rangeInfo.startCol + 1, rangeInfo.endRow, rangeInfo.endCol, websheet.Constant.RANGE_MASK); 
        }
       	this.execCommand(commandOperate.FILLRANGE, [source, target]);
    },
    
    addRangesByJSON: function(rangesJSON, callBack)
    {
    	if(rangesJSON){
	    	var len = rangesJSON.length;
	    	for(var i = 0; i < len; i ++){
	    		var rangeJSON = rangesJSON[i];
				var ref = rangeJSON.refValue;
				var data = rangeJSON.data;
				this.controller.insertRange(data.rangeid, ref, data);
				if(data.usage == websheet.Constant.RangeUsage.COMMENTS){
					this.getCommentsHdl().publishInsCmtsMsg(data.rangeid, data.data.items);
				}
	    	}
    	}
    	if(callBack)
    		callBack();
    },
    
    _postFillRange: function(sheetName, startRow, endRow, startCol, endCol, fillRangeResult)
    {
    	var rangeData = fillRangeResult.newData;
    	var oldRangeData = fillRangeResult.oldData;
    	var expandRange = fillRangeResult.expandRange;
    	var newDVs = fillRangeResult.newDVs;
    	var oldDVs = fillRangeResult.oldDVs;
    	
    	var refValue = null;
    	var sc = websheet.Helper.getColChar(startCol);
		var ec = sc;
		if(endCol > startCol)
			ec = websheet.Helper.getColChar(endCol);
		if( (endRow > startRow) || (sc !== ec) )
			refValue=websheet.Helper.getAddressByIndex(sheetName, startRow, sc,null,endRow,ec); 
		//TODO: server side just check the refType by refValue,
		//if it is refValue is cell pattern, it will be recognized as the cell ref
		//this can be solved when server recognize the ref by refType and refValue
		//and later setCell can support bR=true in server side
		else
			refValue=websheet.Helper.getAddressByIndex(sheetName, startRow, sc,null,startRow,sc);
		
        var event = new websheet.event.SetUnnameRange(refValue, {rows:rangeData, dvs: newDVs, bR:true,ignoreFilteredRow:true});
        
        var sc1 = websheet.Helper.getColChar(expandRange.startCol);
		var ec1 = websheet.Helper.getColChar(expandRange.endCol);;
        var refValue1=websheet.Helper.getAddressByIndex(sheetName, expandRange.startRow, sc1,null,expandRange.endRow,ec1);
        this._toDVJSON4Msg(oldDVs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
       	var reverse = new websheet.event.Reverse (event, refValue1, {rows:oldRangeData, dvs: oldDVs, bR:true});
       	this.sendMessage (event, reverse, null, this._bFillLargeRange);
       	
       	websheet.parse.FormulaParseHelper.disableCache();
       	if (this._bFillLargeRange)
       	{
	       	this._bFillLargeRange = false;
			this.scene.hideErrorMessage();
       	}
    },
    
    setDefaultStyle:function() {
    	var style = {id: websheet.Constant.Style.DEFAULT_CELL_STYLE};
        this.SetStyle({style:style});
    },
    
    /*boolean*/mergeCell: function()
    {
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();
        var controller = this.getController();
        var selector = grid.selection.selector();
        if(!selector) return false;
        
        var address = selector.getSelectedRangeAddress(false, true, false, false, true);
        var parsedRef = websheet.Helper.parseRef(address);
        var srIndex = parsedRef.startRow;
        var erIndex = parsedRef.endRow;
        if(!erIndex) erIndex = srIndex;
        var scIndex = parsedRef.startCol;
        var ecIndex = parsedRef.endCol;
        if(!ecIndex || ecIndex < 0) ecIndex = scIndex;
        
        var selectType = selector.getSelectType();
        if(selectType == websheet.Constant.Row || selectType == websheet.Constant.RowRange)
        {
        	ecIndex = websheet.Constant.MaxColumnIndex;
        }
        else if(selectType == websheet.Constant.Column ||selectType == websheet.Constant.ColumnRange )
        {
        	srIndex = 1;
        	erIndex = this.maxRow;
        }
        
		var reference=websheet.Helper.getAddressByIndex(sheetName, srIndex, scIndex,null,erIndex,ecIndex);        	
        var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,srIndex,erIndex,scIndex,ecIndex);
        // if contain no merged cells, then merge cell
        var event = null;
        var reverse = null;
        if(mergeCellInfo.length == 0)
        {
        	if (selectType == websheet.Constant.Cell) // don't try to merge one single cell
        		return false;
        	// ignore top left cell
        	var bMergeAlways = this.isMobile();
        	if(!bMergeAlways && websheet.Utils.isRangeContainValue(sheetName,srIndex,erIndex,scIndex,ecIndex, true))
	        {
	    		var params = {
	    			message: this.nls.mergeCellConfirm,
	    			callback: this._mergeCell
	    		};
	    		
	    		var dlg = new concord.widgets.ConfirmBox(this, this.nls.MERGE_CELL, null, true, params);
	    		dlg.show();
	    		return false;
        	} else {
        		selector.selectRange(srIndex - 1, scIndex, null, null, true);
        		selector.selectRange(null, null, erIndex - 1, ecIndex, true);
        		selector.focusCol = scIndex;
        		
        		var rangeJson = websheet.model.ModelHelper.toRangeJSON(sheetName, srIndex, scIndex, erIndex, ecIndex);
        		var dvsJson = websheet.model.ModelHelper.getJSONByUsage(sheetName, srIndex, scIndex, erIndex, ecIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
        		this._toDVJSON4Msg(dvsJson, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
            	var attrs = { rows: rangeJson, dvs: dvsJson, bR: true};
            	
        		controller.mergeCells(sheetName,srIndex,erIndex,scIndex,ecIndex);
        	
        		event = new websheet.event.MergeCells(reference);
        		reverse = new websheet.event.Reverse (event, reference,attrs,{});
        		selector.selectCell(srIndex - 1, scIndex, true);
        	}
        }
        // if contain merged cells, split these merge cells
        else
        {
        	var dvsJson = websheet.model.ModelHelper.getJSONByUsage(sheetName, srIndex, scIndex, erIndex, ecIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    		this._toDVJSON4Msg(dvsJson, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
        	var attrs = { rows: null, dvs: dvsJson, bR: true};
        	controller.splitCells(sheetName,srIndex,erIndex,scIndex,ecIndex);
        	event = new websheet.event.SplitCells(reference);
        	reverse = new websheet.event.Reverse (event, reference,attrs,mergeCellInfo);
        }
        this.getTaskMan().addTask(this, "moveSelectRectFocusVisible", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
        this.getTaskMan().start();
		if(event) {
			this.sendMessage (event,reverse);
			return true;
		}
		
		return false;
    },
    
    _toDVJSON4Msg: function(oriJSON, usage, preId)
    {
    	if(oriJSON){
    		for(var i = 0; i < oriJSON.length; i ++){
    			var json = oriJSON[i];
    			json.data = {data: json.data,
    					rangeid:preId + dojox.uuid.generateRandomUuid(),
    					usage:usage};
    		}
    	}
    	return oriJSON;
    },
    
    // callback from confirm box
    _mergeCell: function (editor, bMerge) {
    	if (!bMerge) return;
    	
    	var event, reverse;
    	var grid = editor.getCurrentGrid();
 		var sheetName = grid.sheetName;
 		var docObj = editor.getDocumentObj();
 		var controller = editor.getController();
        var selector = grid.selection.selector();

        var address = selector.getSelectedRangeAddress();
        var parsedRef = websheet.Helper.parseRef(address);
        var srIndex = parsedRef.startRow;
        var erIndex = parsedRef.endRow;
        if(!erIndex) erIndex = srIndex;
        var scIndex = parsedRef.startCol;
        var ecIndex = parsedRef.endCol;
        if(!ecIndex || ecIndex < 0) ecIndex = scIndex;
        
        var selectType = selector.getSelectType();
        if(selectType == websheet.Constant.Row || selectType == websheet.Constant.RowRange)
        	ecIndex = websheet.Constant.MaxColumnIndex;
        	
 		var reference=websheet.Helper.getAddressByIndex(sheetName, srIndex, scIndex,null,erIndex,ecIndex);
 		
 		selector.selectRange(srIndex - 1, scIndex, erIndex - 1, ecIndex, true);
    	selector.focusCol = scIndex;
    	
    	var rangeJson = websheet.model.ModelHelper.toRangeJSON(sheetName, srIndex, scIndex, erIndex, ecIndex);
    	var dvsJson = websheet.model.ModelHelper.getJSONByUsage(sheetName, srIndex, scIndex, erIndex, ecIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
		editor._toDVJSON4Msg(dvsJson, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    	var attrs = { rows: rangeJson, dvs: dvsJson, bR: true};
		
    	controller.mergeCells(sheetName,srIndex,erIndex,scIndex,ecIndex);
    	
    	event = new websheet.event.MergeCells(reference);
    	reverse = new websheet.event.Reverse (event, reference,attrs,{});
    	
    	editor.sendMessage (event,reverse);
    },
    
    moveSelectRectFocusVisible: function(selector){
    	var grid = this.getCurrentGrid();
    	if(!selector){
    		var imageHdl = this.getImageHdl();
	    	var imgRanges = imageHdl.getSelectedDrawFramesInCurrSheet();
	    	//Move focus to image
	    	if(imgRanges.length !=0 ){
	    		var imageRange = imgRanges[0];	    		
    			imageHdl.setFocus(imageRange);    		
	    			return;
	    	}
        	selector = grid.selection.selector();
    	}
    	var sc = grid.scroller;	
    	// if select rect all not in view, scroll focus cell
    	if(!sc.isRowInVisibleArea(selector._startRowIndex) && !sc.isRowInVisibleArea(selector._endRowIndex)){
    		sc.scrollToRow(Math.min(selector._startRowIndex, selector._endRowIndex));
    	}
    	if(!sc.isRowInVisibleArea(selector.focusRow)){
    		sc.scrollToRow(selector.focusRow);
    	}	
    },
    
    showUnsupFeatureDlg: function(list)
    {
    	if(!list) return;
    	var dlg = new websheet.dialog.unsupportFeatureNotification(this, this.nls.CONVERT_NOTIFY, null, false, list);
    	dlg.show();
    },
    
    doAssignmentAction: function(actionType)
    {
    	var taskHdl = this.getTaskHdl();
    	if (!taskHdl) return;

    	var taskBean = taskHdl.getSelectedTask();
		if(actionType == commandOperate.ABOUTASSIGN){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_ABOUT);
		}
		else if(actionType == commandOperate.EDITASSIGNMENT){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_EDIT);
		}
		else if(actionType == commandOperate.REOPENASSIGNMENT){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_REOPEN);
		}
		else if(actionType == commandOperate.REASSIGNASSIGNMENT){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_REASSIGN);
		}
		else if(actionType == commandOperate.RETURNASSIGNMENT){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_REJECT);
		}
		else if(actionType == commandOperate.MARKASSIGNCOMPLETE){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_WORKDONE);
		}
		else if(actionType == commandOperate.APPROVEASSIGNMENT){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_APPROVE);
		}
		else if(actionType == commandOperate.DELETETASK){
			taskHdl.doAction(taskBean,concord.beans.TaskService.ACTION_REMOVE);
		}
    },
    
	removeCompletedAssign: function() {
    	var taskHdl = this.getTaskHdl();
        if (typeof taskHdl != 'undefined') {
            taskHdl.deleteTasks('complete');
        }
    },
    
    createComments: function() {
    	this.scene.toggleCommentsCmd();
    },
    
    assignTask: function() {
    	var taskHdl = this.getTaskHdl(true);
    	if (taskHdl) taskHdl.createTask();
    },
    
    deleteTask: function(){
    	var taskHdl = this.getTaskHdl();
    	if (taskHdl) taskHdl.deleteTask();
    },
    
    showOrHideTask:function(){
    	var taskHdl = this.getTaskHdl();
    	if (taskHdl) taskHdl.toggleShow();
    },
    
    submitTask: function() {
    	var taskHdl = this.getTaskHdl();
    	if (taskHdl) {
    		var docObj = this.getDocumentObj();
    		return taskHdl.submitTask(docObj.masterDoc ,docObj.fragSectionId);
    	}
    },
    
    selectActivity: function(){
    	var taskHdl = this.getTaskHdl();
    	if (taskHdl) taskHdl.selectActivity();
    },
    
    // the grid would be refreshed in scenraios that the current page has many hidden rows, 
    // the rows after the hidden rows will be loaded at following timer and their content 
    // should be refreshed
    _checkCurrentGrid: function(sheetName)
    {
    	if(!sheetName)
    	{
    		var currSheet = this.getCurrentGrid();
    		if(!currSheet) return;
    		sheetName = currSheet.getSheetName();
    	}
    	var controller = this.getController();
		var grid = controller.getGrid(sheetName);	
    	var loadSRIndex = 1;
    	var loadERIndex = websheet.Constant.PartialRowCnt;
    	var firstVRIndex = grid.scroller.firstVisibleRow + 1;
    	var lastVRIndex = grid.scroller.lastVisibleRow + 1;
    	// all the rows current show has already loaded when first load
    	if(lastVRIndex <= loadERIndex) return;
    	this._updateGrid();
    },

    //show the warning message right after the content load finished
    _showPostLoadWarningMessage:function(criteria, doc){
    	var bExceed = this._showExceedMessage(criteria, doc);
    	this._showRangeFilterMessage(criteria, doc, bExceed ? 5000:0);
    },
    
    //sheet contains the range filter(we do not support it) and there are rows filtered by this range filter
	//should show warning message
    _showRangeFilterMessage:function(criteria, doc, timeout){
    	if(criteria){
	    	var areaMgr = doc.getAreaManager();
	    	var firstVisibleSheet = doc.getFirstVisibleSheet();
	    	var sheetId = firstVisibleSheet._id;
	    	if(criteria.sheet)
				sheetId = criteria.sheet;
	    	var sheet = doc.getSheetById(sheetId);
	    	var sheetName = sheet.getSheetName();
	    	var filter = this.getAutoFilterHdl().getFilter(sheetName);
	    	var showMsg = filter && filter._bNoSupportFilter && !this.scene.isHTMLViewMode();
	    	var rangeFilters = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.RANGEFILTER, sheetName);
	    	showMsg = showMsg || (rangeFilters && rangeFilters.length > 0);
	    	if(showMsg){
	    		if(sheet.initFilterRow){
	    			var warningMessage = "";
					warningMessage = dojo.string.substitute(this.nls.RANGEFILTER_WITHFILTERROW_SHEET_MSG,[sheetName]);
					setTimeout(dojo.hitch(this.scene, "showWarningMessage", warningMessage, 10000), timeout);
	    		}
	    	}
    	}
    },
    
    _showExceedMessage:function(criteria, doc){
    	var bExceed = false;
    	// show beyond rows and columns message
    	if (criteria != null) {
    		var sheetName;
    		var maxColIndex;
    		if(criteria.sheet == null){
    			var firstVisibleSheet = doc.getFirstVisibleSheet();
    			sheetName = firstVisibleSheet._name;
    		} 
    		else {
    			var sheetTemp = doc.getSheetById(criteria.sheet);
    			if(sheetTemp != null){
    				sheetName = sheetTemp._name;
    			}
			}
    		bExceed = this.showRowsBeyondWarning(true, sheetName);
    		bExceed |= this.showColumnsBeyondWarning(true, sheetName);
    	}
    	return bExceed;
    },
    
    renderPartial:function(result, criteria){
		var doc = this.getDocumentObj();
		if (doc.isLoading && this._connector._paritalPendingList.length > 0) {
			// document is loading and has pending messages, we can't let the function continue
			// since it will flush pending messages before document loads complete, queue the function call
			var tm = this.getTaskMan();
			var t = tm.addRootTask(this, "renderPartial", [result, criteria], tm.PostLoadProcessMessage, /* isPaused */ false, /* interval */ 0,
					/* comparator */ this._renderPartialComp);
			// pause the task and wait until any document finishes loading, that we resume the task renderPartial
			t.pause("/websheet/documentLoaded");
			
			tm.start();
			return;
		}
		
		doc.setPartialLoading(criteria.sheet, false);
		var sheet = doc.getSheetById(criteria.sheet);
		if(sheet)
			sheet.setDirty(false);
		var serverSeq = -1;
    	try{
			//get the server seq of partial doc
			if (!this.scene.isDocViewMode()) {
    			if(result.seq)
					serverSeq = result.seq;
    			this._processPendingMessage(serverSeq);//process all the message not greater than server seq
			}
    		
    		this._initialLoadDocument(result.content, criteria);
    		
    		if(!doc.isLoading && !doc.getPartialLoading()){//make sure that all the partial loading is done
    			this.getPartialManager().notify();//call all the postponed event
    		}
			//render the page
    		this._updateGrid(criteria);
		}catch(e){
			console.error("render partial error", e);
		}finally{
			if(!doc.isLoading) {//else the pending message will be processed in postRender
				if (!this.scene.isDocViewMode())
					this._processPendingMessage();//process all the remaining message
			}
			this.setFocusFlag(true);
		}
    },
    
    _renderPartialComp: function(selfTask, inQueueTask) {
    	// when render partial exists, it should replace other "processPendingMessages" functions since
    	// in renderPartial functions it will call processPendingMessages with its server sequence.
    	if (inQueueTask.task == "_processPendingMessage") {
    		return -1;
    	} else {
    		return 0;
    	}
    },
    
    _updateGrid:function(criteria, bNotFocus){
    	var sheet = null;
    	if (criteria) {
    		var sId = criteria.sheet;//new added attr after send partial loading request
    		if (sId) {
    			sheet = this.getDocumentObj().getSheetById(sId);
    		}
    	}
    	if (!sheet)	{
    		sheet = this.getCurrentGrid();
    	}
		var grid = this.getController().getGrid(sheet.getSheetName());
		if (grid) {
			// renderPartial, invalidate all the rows height and re-calculate them later when update;
			// the previous measure may not be accurate if the sheet is not fully loaded;
			grid.geometry.invalidateRow();
			grid.requestUpdate();
		}
		if (!bNotFocus) {
			this.focus2Grid();
		}
    },
    
    leaveSession: function() {
    	// fire 'release' event in co-edit mode
    	var grid = this.getCurrentGrid();
    	if(!grid)
    		return;
    	var sheetName = grid.getSheetName();
    	var inlineEditor = this.getController().getInlineEditor();
    	if(inlineEditor.isEditing() && this.scene.coedit)
    	{
    		var editSheet = inlineEditor.getEditSheet();
    		var editRow = inlineEditor.getEditRowIndex(), editCol = inlineEditor.getEditColIndex();
    		if(editRow >= 0)
    		{
    			var refValue = websheet.Helper.getCellAddr(editSheet,editRow ,editCol);
    			this.sendMessage (new websheet.event.Release(refValue));
    		}
    	}
        this.scene.setLeaveData({leftSheet: sheetName});
    },
    
	// Set focus to one specific cell in data grid with select rect. 
	// Recommend to set bSync = false.
	focus2Grid: function(bSync) {
		if(!this._needFocus || this.scene.isModalDialogShown()) return;
		if(this._chartHdl && this._chartHdl.isEditingChart()) return;
		if (bSync) {
			this._focus();
		} else {
			setTimeout(dojo.hitch(this, "_focus"), 10);
		}
	},
	
	// Set focus to grid's DOM Node
	focus2GridDOM: function()
	{
		if (!this._needFocus || this.scene.isModalDialogShown()) {
			return;
		}
		//// html grid//////
		var grid = this.getCurrentGrid();
		if (grid) {
			grid.focus();
		}
		//// html grid end//////
	},
	
	_focus:function(){
		if (!this._needFocus || this.scene.isModalDialogShown()) {
			return;
		}
		var controller = this.getController();
		var inlineEditor = controller.getInlineEditor();
		//do not focus when editing, it may stuck rapid move & edit.
		if (inlineEditor && inlineEditor.isEditing()) {
			return;
		}
		var curSheet = this.getCurrentGrid();
		if(!curSheet)
			return;
    	var sheetName = curSheet.getSheetName();
    	var grid = controller.getGrid(sheetName);
    	var selector = grid.selection.activeSelector();
    	grid.selection.initialFocus();
    	var drawFrameHdl = this.getDrawFrameHdl();
    	var ranges = drawFrameHdl.getSelectedDrawFramesInCurrSheet();
    	if (ranges.length > 0) {
    		selector.hide();
    	} else if(!selector.isShow()) {
    		selector.render();
    	}

    	// focus to inline editor to handle IME input keyboard stroke
    	inlineEditor.waitForInput();
	},
	
	moveFocusTo: function(refValue, bSync){
		var parsedRef = websheet.Helper.parseRef(refValue);
		if(!parsedRef)
			return;
		var sheetObj = this.getDocumentObj().getSheet(parsedRef.sheetName);
		if (sheetObj && !sheetObj.isSheetVisible())
			this.scene.showWarningMessage(this.nls.FOCUS_TO_HIDDEN_SHEET, 5000);
		else
			this.setFocus(refValue, bSync);
	},
	/*
	 * set focus when apply undo or redo event
	 */
 	setFocus: function (refValue, bSync, focusHiddenCell) {
 		var parsedRef = websheet.Helper.parseRef(refValue);
		if (!parsedRef) {
			return;
		}
		
		var workSheetContainer = this.getWorksheetContainer();
        if (!workSheetContainer.isCurrentWorksheet(parsedRef.sheetName)) {
              workSheetContainer.showWorksheet(parsedRef.sheetName);
        }
 		var focusCellInfo = websheet.Utils.getCoverCellInfo(parsedRef.sheetName, parsedRef.startCol, parsedRef.startRow, false, focusHiddenCell);
 		// the focus cell had been hiden, lookforward the show cell
 		var sheetName = focusCellInfo.sheetName;
 		var rowIndex = focusCellInfo.row;
 		var colIndex = focusCellInfo.col;
 		var controller = this.getController();
 		var grid = controller.getGrid(sheetName);
 		if(!grid) return;
 		
 		if (rowIndex > this.maxRow || colIndex > websheet.Constant.MaxColumnIndex) {
 			return;
 		}
 		grid.selection.doCellFocus(rowIndex - 1, colIndex, true, bSync);
	},

	//set focus on the drop down widget when it is opened
	focusNumberFormat:function(menu){
		//get current focus cell
		var controller = this.getController();
		var sheetName = this.getCurrentGrid().getSheetName();
		var grid = controller.getGrid(sheetName);
		if (grid) {
			var rowIndex = grid.selection.getFocusedRow();
			var colIndex = grid.selection.getFocusedCol();
			var category;
			var code;
			var currency;
			var wcs = websheet.Constant.Style;
			var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, rowIndex + 1, colIndex);
			var styleManager = this.getDocumentObj()._styleManager;
			var tmpCate = styleManager.getAttr(styleCode, wcs.FORMATTYPE);      		
			var cateArray = (tmpCate != null && tmpCate.length > 0) ? tmpCate.split(";", 4) : null;
			var tmpCode = styleManager.getAttr(styleCode, wcs.FORMATCODE);
			var codeArray = (tmpCode != null && tmpCode.length > 0) ? tmpCode.split(";", 4) : null;
			var tmpCur = styleManager.getAttr(styleCode, wcs.FORMATCURRENCY);
			var curArray = (tmpCur != null && tmpCur.length > 0) ? tmpCur.split(";", 4) : null;
			var currentCell = this.getDocumentObj().getCell(sheetName, rowIndex + 1, colIndex);	
			var calValue = (currentCell && currentCell.getCalculatedValue()) || null;
			code = codeArray ? codeArray[0] : "";
			category = cateArray ? cateArray[0] : "";
			currency = curArray ? curArray[0] : "";
			
			if(calValue){
				if(currentCell.isNumber()){
					if(calValue == 0 && codeArray && codeArray.length >= 3){
						code = codeArray[2];
						category = cateArray[2]
						currency = curArray[2];
					}else if(calValue < 0 && codeArray && codeArray.length >= 2){
						code = codeArray[1];
						category = cateArray[1]
						currency = curArray[1];
					} 
				}else if(currentCell.isString() && codeArray && codeArray.length == 4){ //codeArray == null
					code = codeArray[3];
					category = cateArray[3];
					currency = curArray[3];
				}
			}
			
			if ((code != null && code.length > 0) || (category != null && category.length > 0) || (currency != null && currency.length > 0)) {
				//searching with category and code
				var formatMenu = dijit.byId(menu);
				var formatMenuItem = formatMenu.getChildren();
				var currencyPopup = "CurrencyPopup"; //TODO
				var currencyByCodePopup = "CurrencyByCodePopup"; //TODO
				var datePopup = "DatePopup";
				
				//category is number,currency,percent,date,time,
				for(var i = 0 ;i<formatMenuItem.length;i++){
					var selectFormatItem = formatMenuItem[i].value;
					if(selectFormatItem){
						if((category == "currency") && ((selectFormatItem == currencyPopup || selectFormatItem == currencyByCodePopup))){
							var currencyPopMenu = formatMenuItem[i].popup.getChildren();
							for(var j = 0; j<currencyPopMenu.length; j++){
								selectFormatItem = currencyPopMenu[j].value;
								var formatItem = window['pe'].MoreCurrency[selectFormatItem];	
								if (formatItem == undefined) continue;		
								if ((formatItem[wcs.FORMATTYPE] == category) 
										&& (formatItem[wcs.FORMATCODE] == code)
										&& (formatItem[wcs.FORMATCURRENCY] == currency)){//found it
									formatMenu.focusChild(formatMenuItem[i]);												
									formatMenuItem[i].focus();
									return;
								}
							}
						}
						else if(((category == "date") || (category == "time")) 
								&& (selectFormatItem == datePopup)){
							var datePopMenu = formatMenuItem[i].popup.getChildren();
							for(var j = 0; j<datePopMenu.length; j++){
								selectFormatItem = datePopMenu[j].value;
								var formatItem = window['pe'].MoreDate[selectFormatItem];	
								if (formatItem == undefined) continue;
								if ((formatItem[wcs.FORMATTYPE] == category) 
										&& (formatItem[wcs.FORMATCODE] == code)){//found it
									formatMenu.focusChild(formatMenuItem[i]);	
									formatMenuItem[i].focus();
									return;
								}
							}
						}
						else{
							var formatItem = window['pe'].formatItem[selectFormatItem];	
							if (formatItem == undefined) continue;
							if ((formatItem[wcs.FORMATTYPE] == category) 
									&& (formatItem[wcs.FORMATCODE] == code)
									&& ((formatItem[wcs.FORMATTYPE] == undefined) || (formatItem[wcs.FORMATTYPE] == currency))){//found it
								formatMenu.focusChild(formatMenuItem[i]);
								formatMenuItem[i].focus();
								return;
							}
						}
					}
				}
			}
			
			//select first item.
			var formatMenu = dijit.byId(menu);
			var formatMenuItem = formatMenu.getChildren();
			if(formatMenuItem && formatMenuItem.length > 0){
				formatMenu.focusChild(formatMenuItem[0]);
				formatMenuItem[0].focus();
			}
		}
	},
	
	focusDirection: function()
	{
		var widget = dijit.byId("S_t_Direction");
		if (!widget) return;
		
		var toolbarIconClass = widget.get("iconClass");
		var menu = dijit.byId('S_m_Direction_toolbar');
		dojo.forEach(menu.getChildren(), function(c){c._setSelected(false); });
		var child = dijit.byId('S_t_AutoDirection');
		if(toolbarIconClass.indexOf("rtlDirectionIcon") >= 0)
			child = dijit.byId('S_t_RtlDirection');		
		else if(toolbarIconClass.indexOf("ltrDirectionIcon") >= 0)
			child = dijit.byId('S_t_LtrDirection');
		setTimeout( function(){ menu.focusChild(child); }, 0);
	},

	toggleSheetDirection: function()
	{
		var widget = dijit.byId("S_t_MirrorSheet");
		if (!widget) return;
		
		var toolbarIconClass = widget.get("iconClass");
		var menu = dijit.byId('S_m_MirrorSheet_toolbar');
		dojo.forEach(menu.getChildren(), function(c) {c._setSelected(false);});
		var child = (toolbarIconClass.indexOf("rtlDirectionIcon") >= 0) ?
			dijit.byId('S_t_RtlSheetDirection') : dijit.byId('S_t_LtrSheetDirection');

		setTimeout( function(){ menu.focusChild(child);}, 0);
	},

	focusAlign: function()
	{
		var widget = dijit.byId("S_t_Align");
		if (!widget) return;
		
		var toolbarIconClass = widget.get("iconClass");
		var menu = dijit.byId('S_m_Align_toolbar');
		dojo.forEach(menu.getChildren(), function(c){ c._setSelected(false); });
		var child = dijit.byId('S_t_LeftAlign');
		if(toolbarIconClass.indexOf("alignCenterIcon") >= 0)
			child = dijit.byId('S_t_CenterAlign');
		else if(toolbarIconClass.indexOf("alignRightIcon") >= 0)
			child = dijit.byId('S_t_RightAlign');
		setTimeout( function(){ menu.focusChild(child); }, 0);
	},
	
	focusVAlign: function()
	{
		var widget = dijit.byId("S_t_VAlign");
		if (!widget) return;
		
		var toolbarIconClass = widget.get("iconClass");
		var menu = dijit.byId('S_m_VAlign_toolbar');
		dojo.forEach(menu.getChildren(), function(c){ c._setSelected(false); });
		var child = dijit.byId('S_t_BottomAlign');
		if(toolbarIconClass.indexOf("alignTopIcon") >= 0)
			child = dijit.byId('S_t_TopAlign');
		else if(toolbarIconClass.indexOf("alignMiddleIcon") >= 0)
			child = dijit.byId('S_t_MiddleAlign');
		setTimeout( function(){ menu.focusChild(child); }, 0);
	},

	focusFontName: function(forMenu)
	{
		var fonts = concord.editor.PopularFonts.getLangSpecFontArray();
		
		//get current focus cell, get the font size style
		var controller = this.getController();
		var sheetName = this.getCurrentGrid().getSheetName();
		var grid = controller.getGrid(sheetName);
		if(grid){
			var rowIndex = grid.selection.getFocusedRow();
			var colIndex = grid.selection.getFocusedCol();
			var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, rowIndex + 1, colIndex);
			var fontName = this.getDocumentObj()._styleManager.getAttr(styleCode, websheet.Constant.Style.FONTNAME);
			if(fontName == null || fontName.length == 0) {
				fontName = fonts[0];
			}
			var postfix = "_toolbar";
			if(forMenu === true)
				postfix = "";
			//focus the menu item
			var fontNameMenu = dijit.byId('S_m_FontName' + postfix);
			var subMenuChildId = "S_i_FONT_" +websheet.Helper.trim(fontName).replace(/ /g,"_") + postfix;
			dojo.forEach(fontNameMenu.getChildren(), function(c){
				c.attr("checked", false);
				c._setSelected(false);
			});
			var widget = dijit.byId(subMenuChildId);
			if(widget)
			{
				setTimeout(function(){
					fontNameMenu.focusChild(widget);
					widget.focus();
				}, 0);
				widget.attr("checked", true);
			}else{
				setTimeout(function(){
					fontNameMenu.focusFirstChild();
					fontNameMenu.getChildren()[0].focus();	
				}, 0);
			}
		}
	},
	
	//set focus on the drop down widget when it is opened
	focusFontSize:function(){
		//get current focus cell, get the font size style
		var controller = this.getController();
		var sheetName = this.getCurrentGrid().getSheetName();
		var grid = controller.getGrid(sheetName);
		if (grid) {
			var rowIndex = grid.selection.getFocusedRow();
			var colIndex = grid.selection.getFocusedCol();
			var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, rowIndex + 1, colIndex);
			fontSize = this.getDocumentObj()._styleManager.getAttr(styleCode, websheet.Constant.Style.SIZE);
			if (fontSize == null) {
				fontSize = 10;
			}
			//focus the menu item
			var fontSizeMenu = dijit.byId('S_m_FontSize');
			dojo.forEach(fontSizeMenu.getChildren(), function(c){
				c.attr("checked", false);
				c._setSelected(false);
			});
			var subMenu = null;
			var hasValidSize = true;
			switch(fontSize)
			{
			case 8:
				subMenu = dijit.byId('S_i_Eight');
				break;
			case 9:
				subMenu = dijit.byId('S_i_Nine');
				break;
			case 10:
				subMenu = dijit.byId('S_i_Ten');
				break;
			case 11:
				subMenu = dijit.byId('S_i_Eleven');
				break;
			case 12:
				subMenu = dijit.byId('S_i_Twelve');
				break;
			case 14:
				subMenu = dijit.byId('S_i_Fourteen');
				break;
			case 16:
				subMenu = dijit.byId('S_i_Sixteen');
				break;
			case 18:
				subMenu = dijit.byId('S_i_Eighteen');
				break;
			case 20:
				subMenu = dijit.byId('S_i_Twenty');
				break;
			case 22:
				subMenu = dijit.byId('S_i_TwentyTwo');
				break;
			case 24:
				subMenu = dijit.byId('S_i_TwentyFour');
				break;
			default:
				hasValidSize = false;
			subMenu = dijit.byId('S_i_Eight');
			break;
			}
			if(subMenu)
			{
				setTimeout(function(){
					fontSizeMenu.focusChild(subMenu);
					subMenu.focus();
				}, 0);
				if(hasValidSize)
					subMenu.attr("checked", true);
			}
		}
	},
	
	// reset number format icon, drop down and grid content
	// and reset the sum and average label when switch locale
	resetNumberFormat: function () {
		if(!this.scene.isViewMode()){		
			// quick formula menu item	
			var quickFormulas = window["pe"].quickFormulas;
			var label = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(quickFormulas[0]);
			if(window["pe"].quickFormulaSum){
				label = label.toUpperCase();
				window["pe"].quickFormulaSum.setLabel(label);
			}
			if(window["pe"].formulaSumItem){
				//label = label.substring(0,1).toUpperCase()+ label.substring(1,label.length).toLowerCase();
				window["pe"].formulaSumItem.setLabel(label);
			}
			label = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(quickFormulas[1]);
			if(window["pe"].quickFormulaAvg){
				label = label.toUpperCase();
				window["pe"].quickFormulaAvg.setLabel(label);
			}
			if(window["pe"].formulaAvgItem){
				//label = label.substring(0,1).toUpperCase()+ label.substring(1,label.length).toLowerCase();
				window["pe"].formulaAvgItem.setLabel(label);
			}
			label = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(quickFormulas[2]);
			if(window["pe"].quickFormulaCount){
				label = label.toUpperCase();
				window["pe"].quickFormulaCount.setLabel(label);
			}
			if(window["pe"].formulaCountItem){
				//label = label.substring(0,1).toUpperCase()+ label.substring(1,label.length).toLowerCase();
				window["pe"].formulaCountItem.setLabel(label);
			}
			label = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(quickFormulas[3]);
			if(window["pe"].quickFormulaMax){
				label = label.toUpperCase();
				window["pe"].quickFormulaMax.setLabel(label);
			}
			if(window["pe"].formulaMaxItem){
				//label = label.substring(0,1).toUpperCase()+ label.substring(1,label.length).toLowerCase();
				window["pe"].formulaMaxItem.setLabel(label);
			}
			label = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(quickFormulas[4]);
			if(window["pe"].quickFormulaMin){
				label = label.toUpperCase();
				window["pe"].quickFormulaMin.setLabel(label);
			}
			if(window["pe"].formulaMinItem){
				//label = label.substring(0,1).toUpperCase()+ label.substring(1,label.length).toLowerCase();
				window["pe"].formulaMinItem.setLabel(label);
			}
			// currency icon
			var icon = dijit.byId("S_t_Currency");
			if (icon) icon.setLabel(websheet.i18n.Number.getCurrencySymbolPerLocale());
			
			// number format dropdown
			var widget = dijit.byId("S_t_NumberFormat");
			if (widget && widget instanceof websheet.widget.DropDownButton && !dojo.isString(widget.dropDown)) {
				widget.destroyDescendants();
				widget.dropDown = "S_m_NumberDropDown";
	
				numberItem = [];
				currencyItem = [];
				percentItem = [];
				dateItem = [];
				timeItem = [];
				moreDateItem = [];
			}
			
			// number format menu
			if (window["pe"].numberSubMenu.bPopulated) {
				window["pe"].numberSubMenu.destroyDescendants();
				window["pe"].numberSubMenu.bPopulated = false;
			}
			
			dojo.forEach(window.formatConnects, dojo.disconnect);
			window.formatConnects = null;
			window.bNumberFormatted = false;
		}
		
		var grid = this.getCurrentGrid();
		grid.requestUpdate();
	},
	
	/*
	 * send message to channel and put its reverse message to undo list and update toolbar icon
	 * @param event      the event to be sent
	 * @param reverse    its reverse event
 	 * @param attrs 	 the attribute map that will be put into message body but not under 'updates'
 	 * @param bAsync	 set to true to async send the message in timer
	 */
	sendMessage: function (event, reverse, attrs, bAsync) {
		// protect is deleted since if protect() in execCommand() then no need to protect() any internal functions
		// of a user action.
		// the origin protect() is not correct here anyway.
 		var m = event.getMessage();
 		if(attrs && attrs.atomic)
 			m.atomic = attrs.atomic;
 		
 		if (bAsync) {
 	 		var tm = this.getTaskMan();
 	 		var conn = this._connector;
 	 		var id = null;

 	 		if (reverse)
 			{
 				var rm = reverse.getMessage();
 				if(attrs && attrs.atomic)
 		 			rm.atomic = attrs.atomic;
 				var um = this._undoManager;
 				var action = um.addAction(rm, m, /* will async make undo action later, but not in addAction */ true);
 				id = action.id;
 				tm.addTask(um, "_transformAction", [rm, m, action], tm.Priority.TransformAction);
 			}
 	 		tm.addTask(conn, "publish", [m, id, null, attrs], tm.Priority.PublishMessage);
 	 		tm.start();
 		} else {
 			var id = null;
 			
 			if (reverse)
 			{
 				var rm = reverse.getMessage();
 				if(attrs && attrs.atomic)
 		 			rm.atomic = attrs.atomic;
 				var action = this.getUndoManager().addAction(rm, m);
 				id = action.id;
 			}
 			this.getConnector().publish(m, id, null, attrs); 	
 		}
	},

	/*
	 * process incoming message in co-edit model: transform this message and apply it to model and grid
	 * @param message   the incoming message  
	 */
	processMessage: function (message) {
		var doc = this.getDocumentObj();
		var connector = this.getConnector();
		var tm = this.getTaskMan();
		// if document is loading, or is in partial-loading,
		// or Controller is in async, hold the message
		// since we are blocking message in session now, should never be here
		if (doc.isLoading || doc.getPartialLoading() || tm.isRunning(tm.Priority.Trivial))
		{
			if (doc.isLoading || doc.getPartialLoading()) {
				console.log("received message during document loading, pend it");
				// the pending messages will be executed after document load, so no need to add process task
			} else {
				console.warn("pending but received message, should be blocked in session.");
				// add task to process the pending messages after all tasks are done
				tm.addTask(this, "_processPendingMessage", [], tm.Priority.Trivial);
			}
			
			connector.pushPendingMessage(message);
		}
		else
		{
			var updates = message.updates;
			var event = updates[0];
			var wse = websheet.Constant.Event;
			if (event.action != wse.RELEASE && event.action != wse.LOCK) {
				this._calcManager.pauseTasks();
			}
			connector.processMessage(message);
		}
	},
	
	_processPendingMessage:function(serverSeq){
		// trigger connector to process pending message received during load.
		// the function will not double check document loading and taskManager state, callers
		// need to make sure that everything is done and client state is ready to
		// process the messages
		this.getConnector().processPendingMessage(serverSeq);
	},
	
	createChart : function(){
		this.getChartHdl().showCreateChartDlg(); 
	},
			
	findAndReplace: function()
	{
		this.getFindReplaceHdl().find();	
	},
	
	/**
     * Set the row height for current selection row(s), 1 based row indexes.
     */
    setRowHeight: function(startRow, endRow, /*Number or Object*/heights){
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();

    	var rowsJson = {}, event, reverse;
    	var oldRows = websheet.model.ModelHelper.getRowsHeight(sheetName, startRow, endRow);
    	if(typeof heights == 'number')
    	{
    		(rowsJson[startRow] = {})[websheet.Constant.Style.HEIGHT] = heights;
    		if(endRow > startRow)
    			rowsJson[startRow].rn = endRow - startRow;
    	}
    	else
    	{
    		rowsJson = heights;
    	}
        //1, set height to local row model
    	this.getController().setRowsHeight(sheetName, startRow, endRow, rowsJson);

        //2, send update message to server
        var params = {refMask: websheet.Constant.ROWS_MASK};
        var refValue=websheet.Helper.getAddressByIndex(sheetName, startRow, null, null, endRow, null, params);
        
        var event = new websheet.event.SetRow(refValue, {rows : rowsJson, bRow : true});
        var reverse = new websheet.event.Reverse(event, refValue, {rows :oldRows, bRow : true});
        this.sendMessage (event, reverse);
    },
    
	setColumnWidth: function(/* Integer */sColIndex,  /* Integer */eColIndex, /*Number or Object*/width,  mode){
		// For backward-compatibility and to make the API easy to use, the 'width' can be an Number or an (JSON)Object, 
		// if it's a Number, set the given width for all the columns from start to end 
		// if it's an Object, it should contain the widths for each columns from start to end (if not given, the column width will keep unchanged).
    	var grid = this.getCurrentGrid();
    	var sheetName = grid.getSheetName();

        var reverseInfo = {};
        reverseInfo.columns = websheet.model.ModelHelper.getColsWidth(sheetName,sColIndex,eColIndex);
        
        var params = {refMask: websheet.Constant.COLS_MASK};
 	    var reference = websheet.Helper.getAddressByIndex(sheetName, null, sColIndex, null, null, eColIndex,params);
 	    
 	    var event, reverse;
 	    if(typeof width == 'number')
 	    {
 	    	var colsJson = {}; 
 	    	colsJson[websheet.Constant.Style.WIDTH] = width;
 	    	this.getController().setColumns(sheetName, sColIndex, eColIndex, colsJson, mode);
 	    	event = new websheet.event.SetColumn(reference,colsJson);
 	    	reverse = new websheet.event.Reverse(event, reference, null, reverseInfo);
 	    }
 	    else
 	    {
 	    	this.getController().setColumns(sheetName, sColIndex, eColIndex, {columns : width}, mode);
 	        event = new websheet.event.SetColumn(reference, {columns : width});
 	   	    reverse = new websheet.event.Reverse(event, reference, null, reverseInfo);;
 	    }
    	this.sendMessage (event, reverse);
	},

	/**
	 * Freeze the window at the given position, (local user operations sent from here).
	 * rowPosition, freeze/split window at which row, 1 based, so 0 means window will not be vertically frozen.
	 * colPosition, Ditto, 0 means no frozen area in horizontal direction.
	 * @parm {row: rowPosition, col: colPosition}
	 */
	freezeWindow: function(parm){
		var sheetName = this.getCurrentGrid().getSheetName();
        var controller = this.getController();
        var grid = controller.getGrid(sheetName);
        var sheetObj = this.getDocumentObj().getSheet(sheetName); 
        var freezeInfo = sheetObj.getFreezePos();
        var oldRowPosition = freezeInfo.row || 0, oldColPosition = freezeInfo.col || 0;
        var rowPosition = parm.row >= 0 ? parm.row : oldRowPosition;
        var colPosition = parm.col >= 0 ? parm.col : oldColPosition;
        
        //1, set to local model
        var result = controller.freezeWindow(sheetName, rowPosition, colPosition, false, parm.reviseMerge);
        if(!result.success)	return;
        var event, reverse, rangeType = websheet.Constant.RangeType;
        if(result.row >= 0){//ROW ADJUSTMENT
        	if(!parm.reviseMerge){
        		//reverse event ref type and value
            	var _refType = oldRowPosition > 0 ? rangeType.ROW : rangeType.SHEET,
            		_refValue = _refType == rangeType.SHEET ? sheetName :  
            			websheet.Helper.getAddressByIndex(sheetName, oldRowPosition > 0 ? oldRowPosition : null, null, null, null, null,{refMask: websheet.Constant.ROWS_MASK});
            	reverse	= new websheet.event.FreezeWindow(_refValue, _refType == rangeType.SHEET ? {row:true}:{});
        	}
        	//event ref type and value
        	var	refType	 = result.row > 0 ? rangeType.ROW : rangeType.SHEET,
        		refValue = refType == rangeType.SHEET ? sheetName :
        			websheet.Helper.getAddressByIndex(sheetName, result.row > 0 ? result.row : null, null, null, null, null,{refMask: websheet.Constant.ROWS_MASK});
        	
        	event	= new websheet.event.FreezeWindow(refValue,  refType  == rangeType.SHEET ? {row:true}:{});
        }else if(result.col >= 0){//COLUMN ADJUSTMENT
        	if(!parm.reviseMerge){
        		//reverse event ref type and value
            	var _refType = oldColPosition > 0 ? rangeType.COLUMN : rangeType.SHEET,
            		_refValue = _refType == rangeType.SHEET ? sheetName :
            			websheet.Helper.getAddressByIndex(sheetName, null, oldColPosition > 0 ? oldColPosition : null, null, null, null,{refMask: websheet.Constant.COLS_MASK});
            	reverse	= new websheet.event.FreezeWindow(_refValue, _refType == rangeType.SHEET ? {col:true}:{});
        	}
        	//event 
            var	refType	 = result.col > 0 ? rangeType.COLUMN : rangeType.SHEET,
            	refValue = refType == rangeType.SHEET ? sheetName :
            		websheet.Helper.getAddressByIndex(sheetName, null, result.col > 0 ? result.col : null, null, null, null,{refMask: websheet.Constant.COLS_MASK});
            
            event = new websheet.event.FreezeWindow(refValue,  refType  == rangeType.SHEET ? {col:true}:{});
        }
        this.sendMessage (event, reverse);
        return result.success;
	},
	
	selectComment: function(commentId) {
		pe.scene.commentsSelected(commentId);
	},
	
	enableUI: function(enabled) {
		var taskHdl = this.scene.getTaskHdl();
		var taskFrame;
		if (taskHdl) taskFrame = taskHdl.getTaskFrame(taskHdl.focusTask);
		if (taskFrame) 
			taskFrame.toggleTaskInfo(!enabled);
		concord.util.events.publish(concord.util.events.commentButtonDisabled,[enabled]);
		var menubar = dijit.byId('S_m');
		if (menubar)
			dojo.forEach(menubar.getChildren(), function(c){c.attr("disabled", enabled); c._setSelected(false);});
		var formulaBar = this.getFormulaBar();
		if (formulaBar) formulaBar.disable(enabled);
		var toolbar = this.getToolbar();
		if (toolbar) toolbar.disable(enabled);
		var grid = this.getCurrentGrid();
		var selector = grid.selection.selector();
		if(enabled){
			this.getDrawFrameHdl().unSelectDrawFrames(grid.sheetName);
			selector.hide();
    		grid.removeContextMenu();
		}
		else{
			selector.render();
		}
	},
	
	/**
	 * If there's chart or image selected in CURRENT sheet.
	 * @returns
	 */
	hasDrawFrameSelected: function(){
		var grid = this.getCurrentGrid();
		if(grid){
			var sheetName = grid.getSheetName();
	        return this.getDrawFrameHdl().hasSelectedDrawFrames(sheetName);
		}
		return false;
	},
	
	suspendGridUpdate: function (sheetName) {
		// Summary:
		//		Suspend data grid lazy update;
		var grids = this.getController()._grids;
		var grid;
		if (sheetName != null && (grid = grids[sheetName])) {
			grid.suspendUpdate();
		} else {
			for (var sheet in grids) {
				grid = grids[sheet];
				grid.suspendUpdate();
			}
		}
	},
	
	resumeGridUpdate: function (sheetName) {
		var grids = this.getController()._grids;
		var grid;
		if (sheetName != null && (grid = grids[sheetName])) {
			grid.resumeUpdate();
		} else {
			for (var sheet in grids) {
				grid = grids[sheet];
				grid.resumeUpdate();
			}
		}
	},
	
	/*
	 * get the maxinum number of rows in one sheet
	 */
	/*int*/getMaxRow: function() {
		return this.maxRow;
	},

	//////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////
	////////// PUT MOBILE ENABLEMENT CODE BELOW //////////////////
	//////////////////////////////////////////////////////////////
	/*
	 * sync the style on toolbar for current focus cell  
	 */
	/*void*/applyUIStyle: function(styleCode) {
        var toolbar = this.getToolbar();
        if (toolbar) toolbar.applyStyle(styleCode);
        
		var styleMgr = this.getDocumentObj()._getStyleManager();
		var attrs = styleMgr.getUIAttrs(styleCode);
		this.publishForMobile({"name":"focusCell", "params":[attrs]});
	},
	
	/*boolean*/isMobile: function() {
		return concord.util.browser.isMobile();
	},
	
	/*void*/publishForMobile: function(event) {
		if (this.isMobile())
			this.mobileBridge.postEvents(event);
	},
	
	////////////////////////////////////////////////
	///////////Callback from mobile//////////////////
	////////////////////////////////////////////////
	/*object*/getCellEditValue: function(sheetName, rowIndex, colIndex) {
		var doc = this.getDocumentObj();
		var cell = doc.getCell(sheetName, rowIndex, colIndex, websheet.Constant.CellType.MIXED);
		var ret = {value: ""};
		if (cell) {
			ret.value = cell.getEditValue();
			if (cell.hasLink()) {
				ret.link = cell.getLink();
			}
		}
		return dojo.toJson(ret);
	},
	
	/*array*/getTypeAheadCellList: function(sheetName, rowIndex, colIndex) {
		// the row index here is 0-based
		return dojo.toJson(websheet.Utils.getTypeAheadCellList(sheetName, rowIndex - 1, colIndex));
	},
	
	/*object*/fitContentForRows: function(startRow, endRow) {
		var grid = this.getCurrentGrid();
		return dojo.toJson(grid.fitContentForRows(startRow, endRow, true));
	},
	
	/*object*/fitContentForColumns: function(startCol, endCol) {
		var grid = this.getCurrentGrid();
		return dojo.toJson(grid.fitContentForColumnsInSync(startCol, endCol));
	},
	
	/*object*/prepareFilterData: function(sheetName, colIndex) {
		var filter = this.getAutoFilterHdl().getFilter(sheetName);
		var data = null;
		if (filter) {
			data = {keys: filter._prepareStatus(colIndex), endRow: filter._expandRow};
			var rule = filter.getRule(colIndex);
			if (rule) data.rules = rule;
		}
		
		return dojo.toJson(data);
	},

	/*object*/gataValidationListData: function(rangeId, rowIndex, colIndex) {
		var data = null;
		var doc = this.getDocumentObj();
		var validation = doc.getAreaManager().getRangeByUsage(rangeId, websheet.Constant.RangeUsage.DATA_VALIDATION);
		if (validation) data = validation.getListInSync(validation, rowIndex, colIndex);
		
		return dojo.toJson(data);
	},

	/*void*/toggleChartDataSourceHighlight: function(chartId, /*boolean*/isTurnOn) {
		// summary:
		//		Highlight chart data source
		var chartHdl = this.getChartHdl();
		if (isTurnOn) {
			chartHdl.highLightDataSource(chartId);
		} else {
			chartHdl.unHighLightDataSource(chartId);
		}
	},

	/*boolean*/generateChart: function(range, chartInfo) {
		var chartHdl = this.getChartHdl();
		var data = {address: range, type: "auto"};
		var result = chartHdl.createChart(chartInfo, data);
		if (result.err != 0) return false;
		
		chartHdl.generateChart(result.chart, true);
		
		return true;
	},
	
	// the same logic as applyRangeSort in RangeSorting
	/*boolean*/isRangeSortable:function(/*boolean*/bFilter, rangeInfo) {
		var expandInfo = websheet.Utils.getExpandRangeInfo(rangeInfo);
		// for normal range/column sort, we check this, but for filter sort, we do not.
		if (!bFilter && (expandInfo.startCol < rangeInfo.startCol || expandInfo.endCol > rangeInfo.endCol)) {
			return false;
		}
		return websheet.Utils.isSortableRange(expandInfo);
	},
	
	/*boolean*/isRangeContainValue: function(sheetName, startRow, endRow, startCol, endCol) {
		return websheet.Utils.isRangeContainValue(sheetName, startRow, endRow, startCol, endCol, true);
	},
	
	/*
	 * Specify which formula result will be displayed on status bar
	 */
	/*void*/configStatusBar: function(/*string*/formulaName) {
		this.getStatusBar().setConfig(formulaName);
	},
	
	/*void*/calculateRowHeight: function (requests) {
		// summary:
		//		request = {sheetName, startRow, endRow};
		if (requests) {
			var grid = this.getController().getGrid(requests.sheetName);
			if (!grid) {
				return;
			}
			var calculation = requests.request;
			for (var request in calculation) {
				var start = request.startRow - 1;
				var end = request.endRow - 1;
				grid.geometry.preciseRowHeight(start, end);
			}
			grid.geometry.publishRowsUpdate(true);
		}
	},
	
	/*array*/getCachedMentionList:function () {
		if (!this.cachedMentionList) {
			this.cachedMentionList = [];
		}
		if (this.cachedMentionList.length == 0 ){		 
			var url = concord.util.uri.getDocUri() + '?method=getUserList&permission=edit';
			var response, ioArgs;
			var callback = function(r, io) {response = r; ioArgs = io;};			
			dojo.xhrGet({
				url: url,
				timeout: 5000,
				handleAs: "json",
				handle: callback,
				sync: true,
				preventCache: true,
				noStatus: true
			});				
			if (response instanceof Error) {
				console.log('getCachedMentionList: Cannnot get editors from server');
			}				
			if(response){
				cachedMentionList = response.items;	
			}
		}
		return dojo.toJson(cachedMentionList);
	},
	
	/*object*/moveFocus: function (direction) {
		// summary:
		//		Move the 'focused cell' in data grid, based on current focused cell;
		// direction:
		//		string, should be "up", "down", "left" or "right"
		// returns:
		//		New focused cell address after move, in json format
		//		Structure:
		//			{ row : 12, column : 4} 
		//		notice: both row and column should be 1-based index, 
		var grid = this.getCurrentGrid();
		if (grid) {
			var result = grid.selection.navigate(direction);
			return dojo.toJson(result);
		}
	},
	
	/*void*/notifyMentionedUsers:function (userid, mentions, content) {
		// summary:
		//		Send mention request to server to send emails to mentioned users in comments;
		// mentions: []
		//		Array of userId
		// userid: string
		//		current user id
		// content: string
		//		Content of the comment
		var idArray = new Array();
		for(var i=0; i< mentions.length; i++){
			var id = mentions[i];
			if(id !== userid){//Filter owner
				var obj ={};
				obj.id = id;
				idArray.push(obj);
			}
		}
		if (idArray.length == 0 ) return;
		var url = concord.util.uri.getMentionUri();
		var response, ioArgs;
		var link = window.location.href;
		var sData = dojo.toJson({"userIds":idArray, "commentId":dojox.uuid.generateRandomUuid(), "link": link, "content": content});
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: false,
			contentType: "text/plain",
			postData: sData
		});	
	},
	
    /*void*/lockEditCell: function(sheetName, row, column) {
    	if(!this.scene.coedit) return;
    	var refValue = websheet.Helper.getCellAddr(sheetName,row, column);
    	var event = new websheet.event.Lock(refValue);
		this.sendMessage(event);
    },
    
    /*void*/releaseLockedCell: function(sheetName, row, column) {
    	if(!this.scene.coedit) return;
    	var refValue = websheet.Helper.getCellAddr(sheetName, row, column);
    	this.sendMessage (new websheet.event.Release(refValue));
    },
    
	/*void*/select: function (selection) {
		// summary:
		//		Use select cell, range, row, row range, column or column range;
		if (selection) {
			var sheet = selection.sheetName;
			var grid = this.getController().getGrid(sheet);
			if (!grid) {
				return;
			}
			var selector = grid.selection.select();
			selector.selectionStart();
			if (selection.bRow) {
				//to select row or rows
				selector.selectRow(selection.startRow - 1, (selection.endRow || selection.startRow) - 1);
			} else if (selection.bCol) {
				// column
				selector.selectColumn(selection.startCol, selection.endCol || selection.endCol);
			} else if (selection.bCell) {
				// single cell
				selector.selectCell(selection.startRow - 1, selection.startCol);
			} else if (selection.bRange) {
				// range
				selector.selectRange(selection.startRow - 1, selection.startCol, selection.endRow - 1, selection.endCol);
			} else {
				selector.selectSheet();
			}
			selector.selectionComplete();
			grid.requestWidgetsUpdate(true);
		}
	},

	/*void*/doCellFocus: function(sheetName, row, col) {
		var grid = this.getController().getGrid(sheetName);
		if (grid) {
			grid.selection.doCellFocus(row - 1, col, true, true);	
		}
	},

	/*void*/selectWorkSheet: function (sheetName) {
		if (sheetName) {
			var grid = this.getController().getGrid(sheetName);
			var container = this.getWorksheetContainer();
			if (!grid || !container) {
				return;
			}
			container.selectChild(grid);
			// notify the mobile when target grid is loaded
			// selectChild will triger 'resize' of the new grid,
			// we'll request an update after gir has been resized, like this:
			// resize: function () 
			// 		...(resizing)...
			// 		this.requestUpdate().then(dojo.hitch(this, function () {
			//			...
			//			...
			//			endResize();
			//		});
			//	thus we're waiting on this call of 'endResize' to notify the mobile side to make the update;
			var self = this;
			var signal = dojo.aspect.after(grid, "endResize", function (){
				signal.remove();
				// switch to new sheet, we're sending: 
				// 1. target sheet name
				// 2. selector focus on the target sheet
				// 3. vision information, first visible row, last visible row, first visible column, last visible column, scroll left, scroll top
				// 4. ... anything else ?
				var event = grid.scroller.getCurrentVision();
				// there're 
				// {
				//		sheetName : 
				//		fr : 
				//		lr : 
				//		fc : 
				//		lc : 
				//		scrollLeft: 
				//		scrollTop: 
				//	}
				//  we need to add, 'focusedRow, focusedCol', and the selecting range
				var selected = grid.selection.selector().getRangeInfo();
				var focused = grid.selection.getFocusedCell();
				event.row = focused.focusRow;
				event.col = focused.focusCol;
				event.startRow = selected.startRow;
				event.endRow = selected.endRow;
				event.startCol = selected.startCol;
				event.endCol = selected.endCol;
				// send out
//				self.publishForMobile({"name" : "selectSheet", "params": [event]});
			});
		}
	},
	
	/*void*/continuousScrollSelection: function (scroll) {
		if (scroll) {
			var grid = this.getController().getGrid(scroll.sheetName);
			if (!grid) {
				return;
			}
			var selector = grid.selection.selector();
			selector.selectionStart();
			if (selector.isSelecting()) {
				grid.selection.selector().scrollingSelectionStart(scroll.direction);
			}
		}
	},
	
	/*void*/stopScrollSelection: function (scroll) {
		if (scroll) {
			var grid = this.getController().getGrid(scroll.sheetName);
			if (!grid) {
				return;
			}
			var selector = grid.selection.selector();
			if (selector.isScrolling()) {
				grid.selection.selector().scrollingSelectionStop();
				selector.selectionComplete();
			}
		}
	},

	/*boolean*/scrollToRow: function (sheetName, rowIndex) {
		var grid = this.getController().getGrid(sheetName);
		if (!grid) return false;
		
		// the index is 0-based
		return grid.scroller.scrollToRow(rowIndex - 1);
	},

	/*boolean*/scrollToColumn: function (sheetName, columnIndex) {
		var grid = this.getController().getGrid(sheetName);
		if (!grid) return false;
		
		return grid.scroller.scrollToColumn(columnIndex);
	},

	/*void*/scrollPage: function (scroll) {
		if (scroll) {
			var grid = this.getController().getGrid(scroll.sheetName);
			if (!grid) {
				return;
			}
			grid.scrollByDirection(scroll.direction, scroll.offset);
		}
	},
	
	/*void*/scrollByDirection: function (scroll) {
		if (scroll) {
			var grid = this.getController().getGrid(scroll.sheetName);
			if (!grid) {
				return;
			}
			var scroller = grid.scroller;
			if (scroll.direction == websheet.Constant.DIRECTION.UP) {
				scroller.setScrollTop(Math.max(scroller.scrollTop - scroll.offset || 50, 0));
			} else if (scroll.direction == websheet.Constant.DIRECTION.DOWN) {
				scroller.setScrollTop(Math.max(scroller.scrollTop + scroll.offset || 50, 0));
			} else if (scroll.direction == websheet.Constant.DIRECTION.LEFT) {
				scroller.setScrollLeft(Math.max(scroller.scrollLeft - scroll.offset || 100, 0));
			} else {
				scroller.setScrollLeft(Math.max(scroller.scrollLeft + scroll.offset || 100, 0));
			}
		}
	},
	
	/*void*/showOrHideGridLines: function()
	{
		var sheetName = this.getCurrentGrid().getSheetName();
		var sheet = this.getDocumentObj().getSheet(sheetName);
		if(sheet){
			var shown = !sheet.getOffGridLines();
			this.getController().showGridLines(sheetName, !shown);	    	
			// generate and send message
		    var refValue = sheetName;	    		
		    var attrUpdates = {};
	        attrUpdates.offGridLine = shown;
	        var event = new websheet.event.SetSheet(refValue,attrUpdates);
	    	attrUpdates.offGridLine = !shown;
		    var reverse = new websheet.event.Reverse(event, sheetName, attrUpdates);
		    this.sendMessage (event, reverse);		
		}
	}	
});