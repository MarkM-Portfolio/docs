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

dojo.provide("websheet.Toolbar");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.Menu");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require("websheet.ColorPalette");
dojo.require("dijit.Dialog");
dojo.require("websheet.Helper");
dojo.require("websheet.model.ModelHelper");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("websheet.config.ToolbarConfig");
dojo.require("concord.util.BidiUtils");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","toolbar");
websheet.Toolbar = {
	editor:null,
	multiSelCellFlag: true,
	colorPalleteList:null,
	selectFormatItem:"",
	toolbarMenuCheckState:{},
	postCreate: function() {
		var scene = window["pe"].scene;	// this happens prior to setBas, so have to access with global variable
		if(!scene.isViewMode()){
			  dojo.connect(dijit.byId('S_t_SpellCheck'), "onClick", dojo.hitch(this, this.dispatchCmd, ""));
			  if (websheet.Utils.isSocialEnabled()) {
				  var tb = dijit.byId('S_t_CreateAssignment');
				  if(tb)
					  dojo.connect(tb, "onClick", dojo.hitch(this, this.dispatchCmd, "this.assignTask()"));
			  }
//			  dojo.connect(dijit.byId('S_t_Submit'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.submitTask()"));
			  dojo.connect(dijit.byId('S_t_SortAscending'), "onClick", dojo.hitch(this, this.dispatchCmd, ""));
			  dojo.connect(dijit.byId('S_t_SortDescending'), "onClick", dojo.hitch(this, this.dispatchCmd, ""));
			  
			  dojo.connect(dijit.byId('S_t_Font'), "onClick", dojo.hitch(this, this.dispatchCmd, ""));
			  dojo.connect(dijit.byId('S_i_Eight'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(8)"));
			  dojo.connect(dijit.byId('S_i_Nine'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(9)"));
			  dojo.connect(dijit.byId('S_i_Ten'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(10)"));
			  dojo.connect(dijit.byId('S_i_Eleven'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(11)"));
			  dojo.connect(dijit.byId('S_i_Twelve'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(12)"));
			  dojo.connect(dijit.byId('S_i_Fourteen'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(14)"));
			  dojo.connect(dijit.byId('S_i_Sixteen'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(16)"));
			  dojo.connect(dijit.byId('S_i_Eighteen'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(18)"));
			  dojo.connect(dijit.byId('S_i_Twenty'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.fontSize(20)"));
			  dojo.connect(dijit.byId('S_i_TwentyTwo'), "onClick", dojo.hitch(this,this.dispatchCmd, "this.fontSize(22)"));
			  dojo.connect(dijit.byId('S_i_TwentyFour'), "onClick", dojo.hitch(this,this.dispatchCmd, "this.fontSize(24)"));
			  dojo.connect(dijit.byId('S_t_Bold'), "onClick", dojo.hitch(this,this.dispatchCmd, "this.Bold()"));
			  dojo.connect(dijit.byId('S_t_Italic'), "onClick", dojo.hitch(this,this.dispatchCmd, "this.Italic()"));
			  dojo.connect(dijit.byId('S_t_Underline'), "onClick", dojo.hitch(this,this.dispatchCmd, "this.Underline()"));
			  dojo.connect(dijit.byId('S_t_Strikethrough'), "onClick", dojo.hitch(this,this.dispatchCmd, "this.Strikethrough()"));
			  dojo.connect(dijit.byId('S_m_FontColor'), "onChange", dojo.hitch(this, this.dispatchCmd, "this.fontcolorChg()"));
			  dojo.connect(dijit.byId('S_m_BackgroundColor'), "onChange", dojo.hitch(this, this.dispatchCmd, "this.BgColor()"));
//			  dojo.connect(dijit.byId('S_m_BorderColor'), "onChange", dojo.hitch(this, this.dispatchCmd, "this.Border4oneColor()"));
			  dojo.connect(dijit.byId('S_t_Currency'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.formatCurrency()"));
			  dojo.connect(dijit.byId('S_t_Percent'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.formatPercent()"));
			  dojo.connect(dijit.byId('S_t_DecreaseDecimal'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.decreaseDecimal()"));
			  dojo.connect(dijit.byId('S_t_IncreaseDecimal'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.increaseDecimal()"));
			  dojo.connect(dijit.byId('S_t_FormatPainter'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.formatPainter(false)"));
			  dojo.connect(dijit.byId('S_t_FormatPainter'), "onDblClick", dojo.hitch(this, this.dispatchCmd, "this.formatPainter(true)"));

//			  dojo.connect(dijit.byId('S_t_LeftAlign'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.AlignLeft()"));
			  dojo.connect(dijit.byId('S_t_MergeSplitCell'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.mergeCell()"));
		
			  var widget = dijit.byId('S_t_MergeSplitCell');
			  widget && dojo.addClass(widget.domNode,"lotusDijitButtonImg");
			  
			  dojo.connect(dijit.byId('S_t_InsertChart'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.insertChart()", true));
			  widget = dijit.byId('S_t_InsertChart');
			  widget && dojo.addClass(widget.domNode, "lotusDijitButtonImg");
			  
			  widget = dijit.byId('S_t_Percent');
			  widget && dojo.addClass(widget.domNode, "lotusDijitButtonImg");
			  widget = dijit.byId('S_t_Currency');
			  widget && dojo.addClass(widget.domNode, "lotusDijitButtonImg textToolbarButton");
			  widget = dijit.byId('S_t_DecreaseDecimal');
			  widget && dojo.addClass(widget.domNode, "lotusDijitButtonImg");
			  widget = dijit.byId('S_t_IncreaseDecimal');
			  widget && dojo.addClass(widget.domNode, "lotusDijitButtonImg");
		}
		
		if(!scene.isObserverMode()){
			dojo.connect(dijit.byId('S_t_Undo'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.undo()"));
			dojo.connect(dijit.byId('S_t_Redo'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.redo()"));
			dojo.connect(dijit.byId('S_t_WrapText'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.wrapText()"));
			dojo.connect(dijit.byId('S_t_InstantFilter'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.setInstantFilter()"));
			dojo.addClass(dijit.byId('S_t_Undo').domNode,"lotusDijitButtonImg");
			dojo.addClass(dijit.byId('S_t_Redo').domNode,"lotusDijitButtonImg");
		}
	},
	
	setBase: function(editor) {
		this.editor = editor;
	},
	
	dispatchCmd:function(method, bFocus){
		if(this.editor.getNameRangeHdl().isEditingNamedRange() || this.editor.getChartHdl().isEditingChart())
    		return;
		try{
			if(!this.editor.getCurrentGrid()){
				eval(method);
			}else{
		    	var sheetName = this.editor.getCurrentGrid().getSheetName();
		        var grid = this.editor.getController().getGrid(sheetName);
		        var formulaBar = this.editor.getFormulaBar();
		        var inlineEditor = grid.getInlineEditor();
		        if(formulaBar && formulaBar.isFormulaInputLineKeyDown)
		        {
		        	formulaBar.exitEditing();
		        	var value = formulaBar.getFormulaInputLineValue();
		        	inlineEditor.editingStart();
		        	inlineEditor.setValue(value);
		        }
		        if(inlineEditor.isEditing() && !inlineEditor.isCovered()){
		        	inlineEditor.apply();
		        }
				eval(method);
			}
			if(method.indexOf("formatPainter") == -1){				
				this.editor._formatpainter.clear();
			}
			if("boolean" != typeof bFocus || !bFocus)
				this.editor.focus2Grid();
		}catch(e)
		{
            if (djConfig.isDebug) {
                console.debug(e);
            }
		}
	},
	
	checkToolbarById: function(toolbarId, bCheck) {
		if(this.toolbarMenuCheckState[toolbarId] == bCheck){
			return;
		}
		this.toolbarMenuCheckState[toolbarId] = bCheck; 
		var widget = dijit.byId(toolbarId);
		if (widget) {
			if (true != bCheck) {
				bCheck = false;
			}
			widget.attr("checked", bCheck);
		}
	},
	
	disableToolbarById: function(toolbarId, bDisabled) {
		var widget = dijit.byId(toolbarId);
		if(true != bDisabled)
			bDisabled = false;
		if(widget){
			widget.attr("disabled", bDisabled);
			if (bDisabled){
				widget.setAttribute('class','websheet_toolbar_grayout');
			}else{
				widget.setAttribute('class','');
			}
		}
	},
	disableUndoRedoIcon: function() {
		this.disableToolbarById("S_t_Undo", true);
		this.disableToolbarById("S_t_Redo", true);
		if( undefined != window["pe"].sheetUndoMenuItem)
			window["pe"].menuItemDisabled(window["pe"].sheetUndoMenuItem, true);
		if( undefined != window["pe"].sheetRedoMenuItem)
			window["pe"].menuItemDisabled(window["pe"].sheetRedoMenuItem, true);
	},

	enableUndoRedoIcon: function() {
		this.disableToolbarById("S_t_Undo", false);
		this.disableToolbarById("S_t_Redo", false);
		if( undefined != window["pe"].sheetUndoMenuItem)
			window["pe"].menuItemDisabled(window["pe"].sheetUndoMenuItem, false);
		if( undefined != window["pe"].sheetRedoMenuItem)
			window["pe"].menuItemDisabled(window["pe"].sheetRedoMenuItem, false);
	},
	
	refreshUndoRedoIcon: function() {
		var undoManager = this.editor.getUndoManager();
		var u = undoManager.hasUndo();
		var r = undoManager.hasRedo();
		this.disableToolbarById("S_t_Undo", !u);
		this.disableToolbarById("S_t_Redo", !r);
		if( undefined != window["pe"].sheetUndoMenuItem)
			window["pe"].menuItemDisabled(window["pe"].sheetUndoMenuItem, !u);
		if( undefined != window["pe"].sheetRedoMenuItem)
			window["pe"].menuItemDisabled(window["pe"].sheetRedoMenuItem, !r);
	},
	
	disableImagePropertyDlg: function(disabled) {
		if (disabled == false) {
			// enabling the dialog
			if (this.editor.scene.isViewMode()) {
				// if current scene disables edit, make it disabled
				disabled = true;
			}
		}
		
		this.disableToolbarById("S_i_ImageProperties", disabled);		    
    },
    
    disableFilterIcon: function(disabled){
    	if (!disabled) {
    		// check state, if can enable filter
    		if (!this.editor.scene.isObserverMode() && !websheet.model.ModelHelper.isSheetProtected()) {
    			// can work
    			;
    		} else {
    			// can't work, remain disabled
    			disabled = true;
    		}
    	}
		this.disableToolbarById("S_i_InstantFilter", disabled);
		this.disableToolbarById("S_t_InstantFilter", disabled);         
    },
        	
	disableSortIcon: function(){
		this.disableToolbarById("S_t_SortAscending", true);
		this.disableToolbarById("S_t_SortDescending", true);
		if( undefined != window["pe"].sortAsc)
			window["pe"].menuItemDisabled(window["pe"].sortAsc, true);
		if( undefined != window["pe"].sortDesc)
			window["pe"].menuItemDisabled(window["pe"].sortDesc, true);
	},
	
//	enableSortIcon: function(){
//		this.disableToolbarById("S_t_SortAscending", false);
//		this.disableToolbarById("S_t_SortDescending", false);
//		if( undefined != window["pe"].sortAsc)
//			window["pe"].sortAsc.attr('disabled',false);
//		if( undefined != window["pe"].sortDesc)
//			window["pe"].sortDesc.attr('disabled',false);
//	},
	
//	refreshMergeCellIcon: function(state)
//	{
//		this.disableToolbarById('S_t_MergeSplitCell',(this.editor.scene.isViewMode() || websheet.model.ModelHelper.isSheetProtected())? true : state);
//	},
	
	disableMultiSelCell: function() {
		if( this.multiSelCellFlag) {

		}
	    this.multiSelCellFlag = false;
	},
	
	enableMultiSelCell:function()
	{
		if( !this.multiSelCellFlag) {

		}
		this.multiSelCellFlag = true;
	},
	
	disableTaskToolBar: function(){
		var taskHdl = this.editor.getTaskHdl();
		if (taskHdl)
			taskHdl.enableTaskCmds(false);
		else{
			//Task toolbar button
			if (websheet.Utils.isSocialEnabled()) {
				//The same list as updateCommandState in the TaskHandler 
				this.disableToolbarById("S_t_CreateAssignment", true);
				// Team menu item
				window["pe"].menuItemDisabled(window["pe"].assignCellsMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].removeCellAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].removeCompletedAssignmentMenuItem, true);        	
				window["pe"].menuItemDisabled(window["pe"].editAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].reopenAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].reassignAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].markAssignmentCompleteMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].approveAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].returnAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].aboutAssignmentMenuItem, true);
			}
		}
	},
	
	enableTaskToolBar: function(){
		var taskHdl = this.editor.getTaskHdl();
		if (taskHdl)
			taskHdl.enableTaskCmds(true);
		else {
			if (websheet.Utils.isSocialEnabled()) {
				this.disableToolbarById("S_t_CreateAssignment", false);
				// Team menu item
				window["pe"].menuItemDisabled(window["pe"].assignCellsMenuItem, false);
				window["pe"].menuItemDisabled(window["pe"].removeCellAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].removeCompletedAssignmentMenuItem, false);        	
				window["pe"].menuItemDisabled(window["pe"].editAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].reopenAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].reassignAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].markAssignmentCompleteMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].approveAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].returnAssignmentMenuItem, true);
				window["pe"].menuItemDisabled(window["pe"].aboutAssignmentMenuItem, true);				
			}
		}
	},
	disable: function(disabled){		
		var n = dojo.byId("lotus_editor_toolbar");
		if(disabled){
			dojo.addClass(n,"websheet_toolbar_grayout");
		}else{
			dojo.removeClass(n,"websheet_toolbar_grayout");
		}
		
	},
	
	customFragmentDoc:function(){
		//toolbar button
		this.disableToolbarById("S_t_InsertDeleteRow", true);
		this.disableToolbarById("S_t_InsertDeleteCol", true);
//		this.disableToolbarById("Lotus_Concord_Submit", false);
		//menubar item
		window["pe"].menuItemDisabled(window["pe"].insertRowItem,true);
		window["pe"].menuItemDisabled(window["pe"].insertColItem,true);
		window["pe"].menuItemDisabled(window["pe"].deleteRowItem,true);
		window["pe"].menuItemDisabled(window["pe"].deleteColItem,true);
		window["pe"].menuItemDisabled(window["pe"].insertSheetItem,true);
		window["pe"].menuItemDisabled(window["pe"].deleteSheetItem,true);
		
		//submit button in header
		var submitBtn = dijit.byId("SubmitTaskInHeader");
		if( null == submitBtn)
		{
			this.editor.scene.createSubmitInHeader();
			submitBtn = dijit.byId("SubmitTaskInHeader");
		}
		dojo.connect(submitBtn, "onClick", dojo.hitch(this.editor, "submitTask"));
	},
	
	disableSubmitToolBar:function(){
//		this.disableToolbarById("Lotus_Concord_Submit", true);
	},
	
	enableSubmitToolBar:function(){
//		this.disableToolbarById("Lotus_Concord_Submit", false);
	},
	
	disableShowFormulaBar:function(){
		window["pe"].FormulaBarMenuItem && window["pe"].menuItemDisabled(window["pe"].FormulaBarMenuItem,true);
	},
	
	enableShowFormulaBar:function(){
		window["pe"].FormulaBarMenuItem && window["pe"].menuItemDisabled(window["pe"].FormulaBarMenuItem, false);
	},
	save: function() {
		this.editor.execCommand(commandOperate.SAVEDRAFT);
	},	
	undo: function()
	{
		this.editor.execCommand(commandOperate.UNDO);
	},
	
	redo: function()
	{
		this.editor.execCommand(commandOperate.REDO);
	},
	
	mergeCell: function()
	{
		this.editor.execCommand(commandOperate.MERGECELL);
	},
	
	wrapText: function()
	{
		this.editor.execCommand(commandOperate.WRAPTEXT);
	},
	insertRow: function() {
		this.editor.execCommand(commandOperate.INSERTROW);
	},
	
	insertColumn: function() {
		this.editor.execCommand(commandOperate.INSERTCOLUMN);
	},

	deleteRow: function() {
		this.editor.execCommand(commandOperate.DELETEROW);
	},
	
	deleteColumn: function() {
		this.editor.execCommand(commandOperate.DELETECOLUMN);
	},
	
	assignTask: function(){
		this.editor.execCommand(commandOperate.ASSIGNTASK);
	},
	
	submitTask: function(){
		this.editor.execCommand(commandOperate.SUBMITTASK);
	},
	
	numberFormat: function(format){
		this.editor.execCommand(commandOperate.NUMBERFORMAT, [format]);
	},
	
	formatPercent: function(){
		var wcs = websheet.Constant.Style;
		var format = {}; format[wcs.FORMATTYPE] = "percent", format[wcs.FORMATCODE] = "0.00%", format[wcs.FORMAT_FONTCOLOR] = "";
		this.numberFormat(format);
	},
	
	formatCurrency: function(){
		var wcs = websheet.Constant.Style;
		var format = {};
		format[wcs.FORMATTYPE] = "currency", format[wcs.FORMATCODE] = "#,##0.00", format[wcs.FORMAT_FONTCOLOR] = "";
		format[wcs.FORMATCURRENCY] = websheet.i18n.Number.getLocaleIso();
		this.numberFormat(format);
	},

	decreaseDecimal: function() {
		var format = websheet.Utils.getDecimalFormat(this.editor);
		format && this.editor.execCommand(commandOperate.SETSTYLE, [{"format": format}]);
	},
	
	increaseDecimal: function() {
		var format = websheet.Utils.getDecimalFormat(this.editor, true);
		format && this.editor.execCommand(commandOperate.SETSTYLE, [{"format": format}]);
	},
	
	formatPainter: function(isDblClick) {
		var widget = dijit.byId("S_t_FormatPainter");
		if(!widget)
			return;
		var checked = widget.attr("checked");
		if(isDblClick){
			checked = true;
			widget.attr("checked",true);
		}
		this.editor.execCommand(commandOperate.FORMAT, [{"checked": checked, "dblclick": isDblClick}]);
	},
	
	fontSize: function(size){
		this.editor.execCommand(commandOperate.FONTSIZE, [size]);
	},

	fontcolorChg:function(){
		var fontcolor = dijit.byId("S_m_FontColor");
		var color = fontcolor.value;
		if (color == null) {
			color = "";
		}
		var style = {}; style[websheet.Constant.Style.COLOR] = color;
		this.editor.execCommand(commandOperate.SETSTYLE, [{"font": style}]);
	},
    Bold: function(){
    	this.editor.execCommand(commandOperate.BOLD);
    },
	Italic:function(){
    	this.editor.execCommand(commandOperate.ITALIC);
	},
	Underline:function(){
    	this.editor.execCommand(commandOperate.UNDERLINE);
	},
	Strikethrough:function(){
    	this.editor.execCommand(commandOperate.STRIKE);
	},
	AlignLeft:function(){
    	this.editor.execCommand(commandOperate.ALIGNLEFT);
	},
	AlignCenter:function(){
    	this.editor.execCommand(commandOperate.ALIGNCENTER);
	},
	AlignRight:function(){
    	this.editor.execCommand(commandOperate.ALIGNRIGHT);
	},
	AlignTop:function(){
    	this.editor.execCommand(commandOperate.ALIGNTOP);
	},
	AlignMiddle:function(){
    	this.editor.execCommand(commandOperate.ALIGNMIDDLE);
	},
	AlignBottom:function(){
    	this.editor.execCommand(commandOperate.ALIGNBOTTOM);
	},
	BgColor:function(){
		var color = dijit.byId("S_m_BackgroundColor");
		var value = color.value;
		if (value == null) {
			value = "";
		}
		var bg = {}; bg[websheet.Constant.Style.BACKGROUND_COLOR] = value;
        this.editor.execCommand(commandOperate.SETSTYLE, [bg]);
	},
    BorderColor: function(position, value){
    	this.editor.execCommand(commandOperate.BORDERCOLOR, [position, value]);
    },
    
    Border4oneColor: function(){
    	var color = dijit.byId("S_m_BorderColor");
    	var border = {};
    	var wcs = websheet.Constant.Style;
    	var v = color.value;
    	if (null == v){
    		border[wcs.BORDER_LEFT] = 0;
    		border[wcs.BORDER_RIGHT] = 0;
    		border[wcs.BORDER_BOTTOM] = 0;
    		border[wcs.BORDER_TOP] = 0;
    		this.BorderColor(border);
    	} else {
    		border[wcs.BORDER_LEFT] = 1;
    		border[wcs.BORDER_RIGHT] = 1;
    		border[wcs.BORDER_BOTTOM] = 1;
    		border[wcs.BORDER_TOP] = 1;
    		var color = {};
    		color[wcs.BORDER_LEFT_COLOR] = v;
    		color[wcs.BORDER_RIGHT_COLOR] = v;
    		color[wcs.BORDER_BOTTOM_COLOR] = v;
    		color[wcs.BORDER_TOP_COLOR] = v;
    		this.BorderColor(border, color);
    	}
    },

    BorderCustomizeColor: function(){    	
    	var color = dijit.byId("S_m_BorderColor");
   	  	var colorvalue = "#000000"; 
        if	(null!=color.value)
            colorvalue = color.value;
        
        this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type:BORDERCUSTOMIZE.CUSTOMIZECOLOR, color:colorvalue}]);
    },
    
    updateBorderTypeMenu:function(){    
    	var aBtn = dijit.byId("S_t_AllBorders");
    	if (!aBtn) return;
    	
    	var iBtn = dijit.byId("S_t_InnerBorders");
    	var hBtn = dijit.byId("S_t_HorizontalBorders");		
		var vBtn = dijit.byId("S_t_VerticalBorders");
		var oBtn = dijit.byId("S_t_OuterBorders");
		var lBtn = dijit.byId("S_t_LeftBorder");
		var tBtn = dijit.byId("S_t_TopBorder");
		var rBtn = dijit.byId("S_t_RightBorder");		
		var bBtn = dijit.byId("S_t_BottomBorder");
		var	cBtn = dijit.byId("S_t_ClearBorders");			
		var bs = this.editor.getBorderStyle();
		if(BORDERTYPE.ALLBORDERS == bs.bordertype){			
			aBtn = null;					
		}else if(BORDERTYPE.INNERBORDERS == bs.bordertype){	    		
			iBtn = null;
		}else if(BORDERTYPE.HORIZONTALBORDERS == bs.bordertype){	    		
			hBtn = null;					
		}else if(BORDERTYPE.VERTICALBORDERS == bs.bordertype){	    		
			vBtn = null;			
		}else if(BORDERTYPE.OUTERBORDERS == bs.bordertype){
			oBtn = null;
		}else if(BORDERTYPE.LEFTBORDER == bs.bordertype){	    		
			lBtn = null;					
		}else if(BORDERTYPE.TOPBORDER == bs.bordertype){	    		
			tBtn = null;				
		}else if(BORDERTYPE.RIGHTBORDER == bs.bordertype){	    		
			rBtn = null;				
		}else if(BORDERTYPE.BOTTOMBORDER == bs.bordertype){	    		
			bBtn = null;					
		}else if(BORDERTYPE.CLEARBORDERS == bs.bordertype){	    		
			cBtn = null;							
		}
		
		if(aBtn)
			aBtn.attr("checked", false);
		if(iBtn)
			iBtn.attr("checked", false);
		if(hBtn)
			hBtn.attr("checked", false);
		if(vBtn)
			vBtn.attr("checked", false);
		if(oBtn)
			oBtn.attr("checked", false);
		if(lBtn)
			lBtn.attr("checked", false);
		if(tBtn)
			tBtn.attr("checked", false);
		if(rBtn)
			rBtn.attr("checked", false);
		if(bBtn)
			bBtn.attr("checked", false);
		if(cBtn)
			cBtn.attr("checked", false);
    },
    
    updateBorderStyleMenu: function(setSelect){
    	var tSolidBtn = dijit.byId("S_t_BorderStyle_ThickSolid");
    	if (!tSolidBtn) return;
    	
    	var tdashedBtn = dijit.byId("S_t_BorderStyle_ThickDashed");
    	var tDottedBtn = dijit.byId("S_t_BorderStyle_ThickDotted");	
    	var solidBtn = dijit.byId("S_t_BorderStyle_ThinSolid");
    	var dashedBtn = dijit.byId("S_t_BorderStyle_ThinDashed");
    	var dottedBtn = dijit.byId("S_t_BorderStyle_ThinDotted");    	
		var bs = this.editor.getBorderStyle();
	    if(BORDERSTYLE.THINSOLID == bs.borderStyle){			
			if(setSelect)
				solidBtn.attr("checked", true);
			solidBtn = null;
			
		}else if(BORDERSTYLE.THINDASHED == bs.borderStyle){
			if(setSelect)
				dashedBtn.attr("checked", true);
			dashedBtn = null;
		}else if(BORDERSTYLE.THINDOTTED == bs.borderStyle){
			if(setSelect)
				dottedBtn.attr("checked", true);
			dottedBtn = null;
		}else if(BORDERSTYLE.THICKSOLID == bs.borderStyle){
			if(setSelect)
				tSolidBtn.attr("checked", true);
			tSolidBtn = null;
		}else if(BORDERSTYLE.THICKDASHED == bs.borderStyle){
			if(setSelect)
				tdashedBtn.attr("checked", true);
			tdashedBtn = null;
		}else if(BORDERSTYLE.THICKDOTTED == bs.borderStyle){			
			if(setSelect)
				tDottedBtn.attr("checked", true);
			tDottedBtn = null;
		}
	    
	    if(tSolidBtn)
	    	tSolidBtn.attr("checked", false);
	    if(tdashedBtn)
	    	tdashedBtn.attr("checked", false);	
	    if(tDottedBtn)
	    	tDottedBtn.attr("checked", false);
	    if(solidBtn)
	    	solidBtn.attr("checked", false);
	    if(dashedBtn)
	    	dashedBtn.attr("checked", false);
	    if(dottedBtn)
	    	dottedBtn.attr("checked", false);
    },

	CreateComments: function(){
		this.editor.execCommand(commandOperate.CREATECOMMENTS);
    },

	setInstantFilter: function(){
		this.editor.execCommand(commandOperate.INSTANTFILTER);
    },
	
    insertChart: function(){
    	this.editor.execCommand(commandOperate.INSERTCHART);
    },
    
	syncFilterMenuState: function(checked){
		//change tool bar state.
		if(checked && websheet.model.ModelHelper.isSheetProtected())
			checked = false;
		
		this.checkToolbarById("S_i_InstantFilter", checked);
		this.checkToolbarById("S_t_InstantFilter", checked);
	},
	    
	_connectPallete:function(id,methodName){
		dojo.connect(dijit.byId(id),"onChange",
	             dojo.hitch(this,this.dispatchCmd, methodName));
	},
	
	_connectQuickFormula: function()
	{
		var quickFormulas = window["pe"].quickFormulas;
		for(var i = 0; i < quickFormulas.length; i++)
		{
			var id = "S_i_QuickFormula" + quickFormulas[i];
			var formulaMenuItem = dijit.byId(id);
			var method = "";
			switch (quickFormulas[i]) {
				case "SUM":
					method = "this.editor.execCommand(commandOperate.SUMFORMULA)";
					break;
				case "AVERAGE":
					method = "this.editor.execCommand(commandOperate.AVERAGEFORMULA)";
					break;
				case "COUNT":
					method = "this.editor.execCommand(commandOperate.COUNTFORMULA)";
					break;
				case "MAX":
					method = "this.editor.execCommand(commandOperate.MAXFORMULA)";
					break;
				case "MIN":
					method = "this.editor.execCommand(commandOperate.MINFORMULA)";
					break;
				default:
					break;
			}
			dojo.connect(formulaMenuItem, "onClick", dojo.hitch(this,this.dispatchCmd,method ));
		}
	},
	
	_connectFormat: function(bDropDown) {
		var dropdown = bDropDown ? "DropDown" : "";
		var formatMenu = dijit.byId("S_m_Number" + dropdown);
		var formatMenuItem = formatMenu.getChildren();
		var currencyPopup = "CurrencyPopup"; //TODO
		var currencyByCodePopup = "CurrencyByCodePopup"; //TODO
		var datePopup = "DatePopup";
		var me = this;
		if (bDropDown){
			//just repsond to toolbar dropdown, not menu.
			//ref '_connectFocusEvent' function. 
			formatMenu.focus = function(){me.dispatchCmd("this.focusNumberFormat('"+formatMenu.id+"')", true);};
		}
		//distinguish the main format menu from the popup menu like more currencies..
		//because some format attributes must be deleted like format.symbol
	    var formatSelectFlag = "mainFormatMenu";
	    window.formatConnects = [];
	    for(var i = 0 ;i<formatMenuItem.length;i++){
			selectFormatItem = formatMenuItem[i].value;
			if(selectFormatItem){
				if(selectFormatItem == currencyPopup || selectFormatItem == currencyByCodePopup){
					var currencyPopMenu = formatMenuItem[i].popup.getChildren();
					for(var j = 0; j<currencyPopMenu.length; j++){
						selectFormatItem = currencyPopMenu[j].value;
						formatConnects.push(dojo.connect(currencyPopMenu[j], "onClick",
							dojo.hitch(this,this.dispatchCmd, "this.numberFormat(window['pe'].MoreCurrency['"+selectFormatItem+"'])")));
				    }
				}
				else if(selectFormatItem == datePopup){
					var datePopMenu = formatMenuItem[i].popup.getChildren();
					for(var j = 0; j<datePopMenu.length; j++){
						selectFormatItem = datePopMenu[j].value;
						formatConnects.push(dojo.connect(datePopMenu[j], "onClick",
							dojo.hitch(this,this.dispatchCmd, "this.numberFormat(window['pe'].MoreDate['"+selectFormatItem+"'])")));
					}
				}
				else{
					formatConnects.push(dojo.connect(formatMenuItem[i], "onClick",
						dojo.hitch(this,this.dispatchCmd, "this.numberFormat(window['pe'].formatItem['"+selectFormatItem+"'])")));
				}
			}
		}
	},
	
	//connect focus method, and it will be call back when open drop down
	_connectFocusEvent:function(node, dropDown, focusMethod){
		var me = this;
		// dropdown on open will call focus function, and by default focus function will move to the first item
		// override it with our own focusMethod.
		dojo.connect(node, "openDropDown", this, function(){me.dispatchCmd(focusMethod, true);});
		dropDown.autoFocus = false;
	},
	
	focusDirection:function(){
		this.editor.focusDirection();
	},

	toggleSheetDirection:function(){
		this.editor.toggleSheetDirection();
	},
	
	focusAlign:function(){
		this.editor.focusAlign();
	},
	
	focusVAlign:function(){
		this.editor.focusVAlign();
	},

	focusFontName:function(){
		this.editor.focusFontName();
	},
	
	focusFontSize:function(){
		this.editor.focusFontSize();
	},
	
	focusNumberFormat:function(menu){
		this.editor.focusNumberFormat(menu);
	},
	
	createChart:function(){			
		this.editor.createChart();
	},
		
	applyStyle: function(/* StyleCode */ style) {
		// this method is used to update toolbar button status based on style, 
		// but toolbar does not show under view mode, so need do nothing 
		if(this.editor.scene.isViewMode()) return;
		
		var widget = dijit.byId("S_t_Bold");
		if(widget && widget.disabled)
			return;
		
		var styleMgr = this.editor.getDocumentObj()._getStyleManager();
		var attrs = styleMgr.getUIAttrs(style);

		var Style = websheet.Constant.Style;
		this.checkToolbarById("S_t_Bold", attrs[Style.BOLD]);
		this.checkToolbarById("S_t_Italic", attrs[Style.ITALIC]);
		this.checkToolbarById("S_t_Underline", attrs[Style.UNDERLINE]);
		this.checkToolbarById("S_t_Strikethrough", attrs[Style.STRIKETHROUGH]);
		this.checkToolbarById("S_t_WrapText", attrs[Style.WRAPTEXT]);
		// wrap text on menu
		window["pe"].wrapText.attr("checked", attrs[Style.WRAPTEXT] === true);
		this.checkToolbarById("S_t_Currency", attrs[Style.FORMATTYPE] == "currency");
		this.checkToolbarById("S_t_Percent", attrs[Style.FORMATTYPE] == "percent");
		
		this.updateAlignState(attrs[Style.TEXT_ALIGN]);
		this.updateVAlignState(attrs[Style.VERTICAL_ALIGN]);
		
		if (BidiUtils.isBidiOn())
			this.updateDirectionState(attrs[Style.DIRECTION]);
		
		this.setFontSizeLabel(attrs[Style.SIZE]);
		
		var fontName = attrs[Style.FONTNAME];
		if (!fontName) {
			var fonts = concord.editor.PopularFonts.getLangSpecFontArray();
			fontName = fonts[0];
		}
		this.setFontNameLabel(fontName);
	},
	
	updateAlignState: function(align)
	{
		var widget = dijit.byId("S_t_Align");
		if (!widget) return;
		
		var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		if(align == "center"){
			widget.attr("title", nls.centerTip);
			widget.attr("label", nls.centerTip);
			dijit.setWaiState(widget.titleNode, "label", nls.centerTip);
			widget.set("iconClass","websheetToolbarIcon alignCenterIcon");
		}
		else if(align === "right"){
			widget.attr("title", nls.rightAlignTip);
			widget.attr("label", nls.rightAlignTip);
			dijit.setWaiState(widget.titleNode, "label", nls.rightAlignTip);
			widget.set("iconClass","websheetToolbarIcon alignRightIcon");
		}else{
			widget.attr("title", nls.leftAlignTip);
			widget.attr("label", nls.leftAlignTip);
			dijit.setWaiState(widget.titleNode, "label", nls.leftAlignTip);
			widget.set("iconClass","websheetToolbarIcon alignLeftIcon");
		}
	},
	
	updateVAlignState: function(valign)
	{
		var widget = dijit.byId("S_t_VAlign");
		if (!widget) return;
		
		var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		if(valign == "top"){
			widget.attr("title", nls.topAlignTip);
			widget.attr("label", nls.topAlignTip);
			dijit.setWaiState(widget.titleNode, "label", nls.topAlignTip);
			widget.set("iconClass","websheetToolbarIcon alignTopIcon");
		}else if(valign == "middle"){
			widget.attr("title", nls.middleAlignTip);
			widget.attr("label", nls.middleAlignTip);
			dijit.setWaiState(widget.titleNode, "label", nls.middleAlignTip);
			widget.set("iconClass","websheetToolbarIcon alignMiddleIcon");
		}else{
			widget.attr("title", nls.bottomAlignTip);
			widget.attr("label", nls.bottomAlignTip);
			dijit.setWaiState(widget.titleNode, "label", nls.bottomAlignTip);
			widget.set("iconClass","websheetToolbarIcon alignBottomIcon");
		}
	},

	updateDirectionState: function(direction)
	{
		var widget = dijit.byId("S_t_Direction");
		if (!widget) return;

		if(!direction) 
			widget.set("iconClass","autoDirectionIcon");
		else if(direction === "rtl")
			widget.set("iconClass","rtlDirectionIcon");
		else
			widget.set("iconClass","ltrDirectionIcon");		
	},

	updateSheetDirectionState: function(isMirrored)
	{
		var widget = dijit.byId("S_t_MirrorSheet");
		widget && widget.set("iconClass", isMirrored ? "sheetRtlDirectionIcon" : "sheetLtrDirectionIcon");
	},

	setFontNameLabel: function(iFontName)
	{
		if(iFontName)
			iFontName = iFontName.replace(/[<>'"]/g, "");
		
		if(!iFontName)
		{
			var fonts = concord.editor.PopularFonts.getLangSpecFontArray();
			iFontName = fonts[0];
		}
		
		var w = dijit.byId("S_t_FontName");
		w && w.attr("label", iFontName);
	},
	
	setFontSizeLabel: function(iSize) {
		var w = dijit.byId("S_t_FontSize");
		var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		iSize = parseFloat(iSize) || 10;
		if (BidiUtils.isArabicLocale()) {
			iSize = BidiUtils.convertArabicToHindi(iSize + "");
		}
		w && w.attr("label", iSize + "");
	},
	
	isShow: function()
	{
		var node = dojo.byId("lotus_editor_toolbar");
		return dojo.style(node, "display") != "none";
	},
	
	/* show/hide toolbar */
	toggle: function(bPreventStatus)
	{
		var n = dojo.byId("lotus_editor_toolbar");
		var display = dojo.style(n, "display");
		var toolbarSetting;
		
		// it would occur prior to setBase, have to access with global variables here
		var settings = window["pe"].settings;
		var scene = window["pe"].scene;
		
		if (display == "none")
		{
			dojo.style(n, "display", "");
			toolbarSetting = settings.TOOLBAR_BASIC;
			var h = dojo.marginBox(n).h;
			scene.setHeightDelta(-h);
		}
		else
		{
			var h = dojo.marginBox(n).h;
			dojo.style(n, "display", "none");
			toolbarSetting = settings.TOOLBAR_NONE;
			scene.setHeightDelta(h);
		}
		
		if (settings && !bPreventStatus) {
			settings.setToolbar(toolbarSetting);
		}
	}
};
dojo.declare("websheet.Toolbar", null, websheet.Toolbar);
