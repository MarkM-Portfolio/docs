
dojo.provide("websheet.widget.CommonPane");

dojo.declare("websheet.widget.CommonPane", null ,{
	
	domNode:      null,
	_headerNode:  null,
	_closeBtn:	  null,
	_contentNode: null,
	sidePaneMgr:   null,
	
	constructor: function(domNode)
	{
		this.domNode = domNode;
		this.sidePaneMgr = pe.scene.editor.getPaneMgr(); 
		var height = this.sidePaneMgr.getHeight();
		var width = this.sidePaneMgr.getWidth() + "px";
		dojo.style(this.domNode, {
			"display"  : "none",
			"position" : "absolute",
			"left"    : BidiUtils.isGuiRtl() ? "0px" : "auto",
			"right"   : BidiUtils.isGuiRtl() ? "auto" : "0px",
			"background-color": "#F1F1F1",
			"height" : height,
			"width"	 : width
		});
	},
	
	buildAll: function()
	{
		this._createHeader();
		this._createContent();
		this._registerEvents();
	},
	
	_createHeader: function()
	{
		this._headerNode = dojo.create("div",null, this.domNode);
		dojo.addClass(this._headerNode,"commonSidePaneHeader");
		
		this._closeBtn = dojo.create("div",{tabindex:0}, this._headerNode);
		dojo.addClass(this._closeBtn, "closePaneBtn");
		var closeDiv = dojo.create("div",null,this._closeBtn);
		dojo.addClass(closeDiv,"closePaneIcon");
		
		this._createTitle();
	},
	
	_createTitle: function()
	{
		
	},
	_createContent: function()
	{
//		var panel = dojo.create("div",{innerHTML:"TestACL"},this.domNode);
	},
	
	_registerEvents: function()
	{
		dojo.connect(this._closeBtn, dijit.a11yclick, dojo.hitch(this, this.close));
	},
	
	resizeSidebar: function()
	{
		var height = this.sidePaneMgr.getHeight();
		var width = this.sidePaneMgr.getWidth() + "px";
		dojo.style(this.domNode, {
			"height" : height,
			"width"	 : width
		});
	},
	
	isCollapsed: function()
	{			
		return this.domNode.style.display == 'none';
	},
	
	grapFocus: function()
	{
		if(this.isCollapsed()) return;
		this.domNode.focus();
	},
	
	toggle: function()
	{
		if(this.isCollapsed())
			this.open();
		else
			this.close();
	},
	
	open: function()
	{
		dojo.publish(this.sidePaneMgr.openTopic,[{sidePane:this}]);
//		this.sidePaneMgr.notify("open", this);
		this.domNode.style.display = "";
		var curWidth = this.sidePaneMgr.getWidth();
		pe.scene.sidebarResized(curWidth);
		this.resizeSidebar();
	},
	
	close: function()
	{
		var orgWidth = this.sidePaneMgr.getWidth();
		dojo.publish(this.sidePaneMgr.closeTopic, [{sidePane:this}]);
//		this.sidePaneMgr.notify("close", this);
		this.domNode.style.display = 'none';
		var curWidth = this.sidePaneMgr.getWidth();
		if(curWidth != orgWidth)
		{
			pe.scene.sidebarResized(curWidth);
		}
		setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
	}
});