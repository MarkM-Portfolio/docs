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

dojo.provide("writer.ui.dialog.NewFindReplaceDlg");
dojo.require("dojo.fx");
dojo.require("writer.ui.toolbar.Toolbar");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("writer.ui.dialog","FindReplaceDlg");

writer.ui.dialog.NewFindReplaceDlg = function(obj){
	this.input = null;
	this.show = false;
	this.replaceInput = null ;
	this.isDefaultFindValue = true;
	this.isDefaultReplaceValue = true;
	this._init(obj);
	this.bidiTextDir = (!BidiUtils.isBidiOn() ? "" : BidiUtils.getTextDir());
};
writer.ui.dialog.NewFindReplaceDlg.prototype ={
		find_hdl : function(){},
		replace_hdl : function(){},
		replaceall_hdl : function(){},
		onhide_hdl : function(){},
		resize_hdl : function(){},
		onload_hdl : function(){},
		onshow_hdl : function(){},
		onKeyDown: function(evt){
			var keys = dojo.keys;
			if(evt.charCode == keys.ENTER || evt.keyCode == keys.ENTER){
				this.navigate_hdl('next');
				dojo.stopEvent(evt);
			}
		},
		freshTotalNum : function(idx, offset, len){
			if(len == -1){// this happen the no input text to find, should clear the totalNum area
				 dojo.style( this.inputDiv, 'width','100%');
				 dojo.style( this.totalNum, 'width','0');
				 this.totalNum.innerHTML = "";
				 return;
			 }
			 if(len == 0)
			 {
				 dojo.style( this.inputDiv, 'width','100%');
				 dojo.style( this.totalNum, 'width','0');
				 this.totalNum.innerHTML = "&nbsp;&nbsp;0";
			 }
			 else
			 {
				 var curr = ((idx + 1)>0?idx + 1:1);
				 curr = curr + offset;
				 if(curr !=  len){
					 curr =	curr%len;
					 if(curr == 0)
						 curr = 1;
				 }
				 this.totalNum.innerHTML = curr +" / "+len;
			 }
			 var size = len+"";
			 size = size.length;
			 var base = 15;
			 if(size == 1)
				 base = 20;
			 dojo.style( this.inputDiv, 'width',(100-(size*base))+"%");
			 dojo.style( this.totalNum, 'width',size*base+"%");

		 },
		_init: function(obj)
		{
			this._loadNls();
			dojo.mixin( this, obj);
			dojo.subscribe(writer.EVENT.SHOWTOTALNUM, this, this.freshTotalNum);
			dojo.subscribe(writer.EVENT.FOCUSBACKFINDDLG, this, this.focusBack);
		},

		focusBack: function(){
			var that = this;
			setTimeout(function() {
				that.input && that.input.focus();
			},
			0);
		},

		_loadNls :function (){
			if(!this.nls)
				this.nls = dojo.i18n.getLocalization("writer.ui.dialog","FindReplaceDlg");
		},

		setDefaultValue : function(isDefaultValue,type){
			if(type == 'find')
				this.isDefaultFindValue = isDefaultValue;
			else
				this.isDefaultReplaceValue = isDefaultValue;
		},
		connectClickEvt : function(input,defaultValue,type){
			var isDefaultValue;
			dojo.connect( input, "onfocus", this, function(){
				if((type == "find"?this.isDefaultFindValue:this.isDefaultReplaceValue) && input.value == defaultValue)
				{
					input.value = "";
					dojo.style(input, "fontStyle", "normal");
					dojo.style(input, "color", "");
					this.setDefaultValue(false, type);
				}
			} );
		
			dojo.connect( input, "onblur", this, function(){
				if(input.value.length == 0)
				{
					input.value = defaultValue;
					dojo.style(input, "fontStyle", "italic");
					dojo.style(input, "color", "gray");
					this.setDefaultValue(true, type);
				}
			} );
		},

		getBarPositionInfo: function(){
			// based on the page
//			var viewTools = writer.util.ViewTools;
//			var selection = pe.lotusEditor.getSelection();
//			var currPage = null;
//			if (selection){
//				var ranges = selection.getRanges();
//				var range = ranges && ranges[0];
//				if (range){
//					var startView = range.getStartView();
//					if(!startView) return null;
//					if (startView.obj){
//						startView = startView.obj;
//					}
//					currPage = viewTools.getPage(startView);
//					var rect =currPage.domNode.getBoundingClientRect();
//					return {left:rect.left, width:rect.width};//pe.lotusEditor.setting.getMaxSectionPageWidth()					
//				}
//			}
//			return null;
			
			// base on the edit frame
			var rect = dojo.byId("editorFrame").getBoundingClientRect();
			return {left:0, width:rect.width-17};
		},

		onResized: function()
		{
			var me = this;
			if (!me.show)
				return;
			setTimeout(function(){
				if(me.show){
					me.resize_hdl();
					me.onEditorResized();
				}
			}, 100);
		},
		
		onEditorResized: function(){
			var pos = this.getBarPositionInfo();
			this.floatingFinderNode.style.width = pos.width + "px";
		},
		
		createFloatingFinder : function(type)
		{
			var pos = this.getBarPositionInfo();
			var id = "lotus_editor_floating_finder";
			var height;		
			height = "40px";			

			var parent = dojo.byId("mainNode");
			var editFrame = dojo.byId("editorFrame");
			var paggings = dojo.query("paging");

			var floatLeft = "float:left;";
			var style = "left:"+pos.left;
			var dirAttr = "";
			if(BidiUtils.isGuiRtl()) {
				floatLeft = "float:right;";
				style = "right:"+pos.left;
				dirAttr = "rtl";
			} 
			style += "px;bottom:-2px;width:"+( pos.width - 2)+"px;position:absolute;border:1px solid #AAAAAA;box-shadow:0 0 5PX #AAAAAA;";
		    this.floatingFinderNode = dojo.create("div", {"id": id,"style":style,"class":"dijit dijitToolbar docToolbar"});
		    if (dirAttr.length > 0)
		    	dojo.attr(this.floatingFinderNode, "dir", dirAttr);


		    parent.insertBefore(this.floatingFinderNode, dojo.byId("ll_sidebar_div"));

		    // Input span
		    style = floatLeft + (BidiUtils.isGuiRtl() ? "margin:4px 8px 4px 0;" : "margin:4px 0 4px 8px;");
		    style += "width:143px;height:22px;border:1px solid #AAAAAA;";
		    var inputSpan = dojo.create("div", {"style":style});

		    // Input
		    style = "position:relative;height:22px;width:100%; border:0px solid;";
		    id = "lotus_editor_floating_finder_input";
		    this.inputDiv = dojo.create("div", {"style":floatLeft});
		    var attrInputParams = {"id": id,"style":style};
		    if (BidiUtils.isBidiOn())
		    	attrInputParams.dir = this.bidiTextDir;
		    this.input = dojo.create("input", attrInputParams);
		    dojo.connect( this.input, "onkeyup",dojo.hitch(this,function(){
		    	if (this.bidiTextDir == 'contextual')
		    		this.input.dir = BidiUtils.calculateDirForContextual(this.input.value);
	    		this.find_hdl();
		    }));
 

		    dojo.connect( this.input, "onkeydown",dojo.hitch(this, this.onKeyDown) );
		    this.connectClickEvt(this.input,this.nls.findInFile,"find");
		    // TotalNum node
		    style = "position:relative;background:white;height:22px;line-height:22px;color:#AAAAAA;text-align:center;" +
				BidiUtils.isGuiRtl() ? "float:left;" : "float:right;";

		    id = "lotus_editor_floating_finder_totalNum";
		    this.totalNum = dojo.create("div", {"id": id,"style":style});
		    this.inputDiv.appendChild(this.input);
		    inputSpan.appendChild(this.inputDiv);
		    inputSpan.appendChild(this.totalNum);
		    this.floatingFinderNode.appendChild(inputSpan);

		    this.lefttoolbar = new writer.ui.toolbar.Toolbar();
			createFindReplaceToolbar(this.floatingFinderNode,this.lefttoolbar,"left");
			dojo.connect(dijit.byId("D_t_Find_Prev"), "onClick",dojo.hitch(this, this.navigate_hdl,'pre'));//
			dojo.connect(dijit.byId("D_t_Find_Next"), "onClick",dojo.hitch(this, this.navigate_hdl,'next'));


			style = floatLeft + "position:relative;width:143px;height:22px;border:0px solid;margin:4px 0;";
		    var replaceSpan = dojo.create("div", {"style":style});
		    // Input replace word
		    style = "position:relative;height:20px;width:98%;font-style:italic;color:gray;";
		    id = "lotus_editor_floating_replace_input";
		    var attrReplaceInputParams = {"id": id,"style":style,"value":this.nls.inputReplace};
		    if (BidiUtils.isBidiOn()) {
		    	if (this.bidiTextDir == 'contextual')
		    		attrReplaceInputParams.dir = BidiUtils.calculateDirForContextual(this.nls.inputReplace);
		    	else
		        	attrReplaceInputParams.dir = this.bidiTextDir;
		    }
		    this.replaceInput = dojo.create("input", attrReplaceInputParams);
		    if (this.bidiTextDir == 'contextual'){
		    	dojo.connect( this.replaceInput, "onkeyup",dojo.hitch(this,function(){
		    		this.replaceInput.dir = BidiUtils.calculateDirForContextual(this.replaceInput.value);
		    	}));
		    }
		    this.connectClickEvt(this.replaceInput,this.nls.inputReplace,"replace");
		    replaceSpan.appendChild(this.replaceInput);
		    this.floatingFinderNode.appendChild(replaceSpan);


		    this.centertoolbar = new writer.ui.toolbar.Toolbar();
			createFindReplaceToolbar(this.floatingFinderNode,this.centertoolbar,"center");
			dojo.connect(dijit.byId("D_t_Replace"), "onClick",dojo.hitch(this, this.replace_hdl));//
			dojo.connect(dijit.byId("D_t_ReplaceAll"), "onClick",dojo.hitch(this, this.replaceall_hdl));


			this.righttoolbar = new writer.ui.toolbar.Toolbar();
			createFindReplaceToolbar(this.floatingFinderNode,this.righttoolbar,"right");

			dojo.connect(dijit.byId("D_t_MatchCase"), "onClick",dojo.hitch(this, function(){
		        	this.find_hdl({"find":true});
				}
			));
			dojo.connect(dijit.byId("D_t_MatchWord"), "onClick",dojo.hitch(this, function(){
		        	this.find_hdl({"find":true});
				}));
			dojo.connect(dijit.byId("D_t_FindBarClose"), "onClick",dojo.hitch(this, function(){
		    	this.onhide_hdl();		    
		    	 dojo.fx.wipeOut({ node: this.floatingFinderNode }).play();
			}));

			pe.scene.addResizeListener(dojo.hitch(this,this.onEditorResized));
			dojo.connect(window, "onresize", this, this.onResized);
			
		    dijit.setWaiState(dojo.byId("lotus_editor_floating_finder_input"), "label", this.nls.findInFile);		
		    dijit.setWaiState(dojo.byId("lotus_editor_floating_replace_input"), "label", this.nls.inputReplace);
		    var that = this;
		    dojo.connect(this.floatingFinderNode,"onkeydown",this,function(evt){
				var keys = dojo.keys;
				if(evt.charCode == keys.ESCAPE || evt.keyCode == keys.ESCAPE){
					this.onhide_hdl();
					dojo.fx.wipeOut({ node: this.floatingFinderNode }).play();
					dojo.stopEvent(evt);
				}
				if(evt.charCode == keys.TAB || evt.keyCode == keys.TAB){				
					var target = evt.target || evt.srcElement;
					if(evt.shiftKey){
						if(target.id =="D_t_FindBarClose"){
							dojo.byId("D_t_MatchCase").focus();
							dojo.stopEvent(evt);
						}else if(target.id =="lotus_editor_floating_finder_input"){
							dojo.byId("D_t_FindBarClose").focus();
							dojo.stopEvent(evt);
						}
					}else{
						if(target.id =="D_t_MatchCase"){
							dojo.byId("D_t_FindBarClose").focus();
							dojo.stopEvent(evt);
						}else if(target.id =="D_t_FindBarClose"){
							dojo.byId("lotus_editor_floating_finder_input").focus();
							dojo.stopEvent(evt);
						}
					}
				}
			});
		    this.onshow_hdl();
		}
	}


writer.ui.dialog.NewFindReplaceDlg.show = function(type,obj)
{
	var range = pe.lotusEditor.getSelection().getRanges()[0];
	var contents = "";
	if(writer.util.ModelTools.isValidSel4Find())
		contents = range.extractContents();
	var findValue;
	if(!this.dlg)
	{
		this.dlg = new writer.ui.dialog.NewFindReplaceDlg(obj);
		this.dlg.createFloatingFinder(type);
		return;
	}
	else if(this.dlg.isDefaultFindValue)
	{
		this.dlg.input.value = "";
		dojo.style(this.dlg.input, "fontStyle", "normal");
		dojo.style(this.dlg.input, "color", "");
		this.dlg.setDefaultValue(false,"find");
	}

	var dlg = this.dlg;
	dojo.style(dlg.floatingFinderNode, "display", "");
	dlg.show = true;
	dlg.resize_hdl();
	var findValue;
	dlg.input.focus();
	dlg.setDefaultValue(false,"find");
	if(contents && contents.length > 0 && contents[0].c != dlg.input.value)
	{
		findValue = contents[0].c;
		dlg.input.value = findValue.trim();
	}
	else
		findValue = dlg.input.value;
	if (!findValue || findValue.length == 0){		
		return;
	}
    dlg.find_hdl();
};
