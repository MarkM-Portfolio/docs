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
dojo.provide("websheet.dialog.NavigatorDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("dijit.Tree");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.tree.ForestStoreModel");

//dojo.requireLocalization("websheet.dialog","NavigatorDlg");

dojo.declare("websheet.dialog.NavigatorDlg", [concord.widgets.concordDialog], {
	_connects: null,
	handler: null, // navigator handler
	constructor: function() {	
		this.dialog.attr("title", this.concordTitle);
	},	
	
	createContent: function (contentDiv) {
		this.handler = this.editor._navigatorHdl;
		this.treeContent = dojo.create('div', null, contentDiv);
		this.treeContent.style.height= "300px";
		this.treeContent.style.width= "200px";
		// add scrollbar if the tree is higher than tree Content Div
		this.treeContent.style.overflow = 'auto';
		this.initTree();
		},	
		
	disconnectstHandler:function(){	 
		if(this._connects){
			dojo.forEach(this._connects, dojo.disconnect);
			this._connects = null;
		}
	},
	
	reset: function(){
		this.initTree();
	},
	
	initTree: function(){
		if(this.treeWidget){			
			this.disconnectstHandler();
			this.treeWidget.destroy();
			this.treeWidget = null;
		}
		var dataStore = this.handler.getTreeStore();
	    var myModel = new dijit.tree.ForestStoreModel({
	        store: dataStore,
	        childrenAttrs: ["children"]
	    });
	   var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	   this.treeWidget = new dijit.Tree({				
			dir: dirAttr,				
			model: myModel,
			openOnDblClick:true,
			showRoot:false
		});
	   
	   this.treeWidget.startup();	  
	   this.treeWidget.placeAt(this.treeContent);
	   if(!this._connects)
		   this._connects=[];
	   this._connects.push(dojo.connect(this.treeWidget, "onDblClick", dojo.hitch(this,this.doDoubleClick)));		   
	   this._connects.push(dojo.connect(this.treeWidget, "onKeyPress", dojo.hitch(this,this.doKeyPress)));
	   this._connects.push(dojo.connect(this.treeWidget, "focusNode", dojo.hitch(this,this.doTreeFocus)));
	   this._connects.push(dojo.connect(this.treeWidget, "_onNodePress", dojo.hitch(this, this.doDoubleClick)));
	   /*Disable tree node multi-selection*/
	   this.treeWidget.dndController.singular =  true;
	},
	
	doDoubleClick: function(item, e)
	{
		if(e.keyCode == dojo.keys.ENTER)
			item = item.item;
		if(item)
			this.handler.selectDrawFrame(item,false);
	},
	
 	doKeyPress: function(e){
		var keyCode = e.keyCode;
		if(keyCode == dojo.keys.ENTER){
			this.hide();
		}
	},
	
	doTreeFocus: function(node)
	{
		if(node && node.isTreeNode)
			this.selectNode = node;
	},
	
	setFocus: function(){
		if(this.getOkBtn()){			
			this.getOkBtn().focus();			
		}
	},
	show: function () {
		this.inherited(arguments);
		setTimeout(dojo.hitch(this, this.setFocus),250);	
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_NavigatorDlg";
		this.treeWidgetId = "S_d_NavigatorDlgTree";
	},
	
	returnFocus : function(){
		this.inherited(arguments);
		if(this.selectNode)
			this.handler.selectDrawFrame(this.selectNode.item,true);
		this.selectNode = null;
	}
});
