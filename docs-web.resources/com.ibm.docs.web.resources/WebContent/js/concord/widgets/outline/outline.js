dojo.provide("concord.widgets.outline.outline");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets.outline","outline");


dojo.declare("concord.widgets.outline.outline", null, {
	/**
	 * constructor function
	 */
	constructor: function ()
	{
		this.nls = dojo.i18n.getLocalization("concord.widgets.outline","outline");
		this.dirty = true;
	},
	/**
	 * create outline panel
	 * @param page
	 */
	createOutlineWin: function( page )
	{
		var mainNode = dojo.byId('mainNode');
		if( !page || page.pageNumber != 1 )
			return;
		//first page created
		var togglebar = dojo.byId("togglebar");
		if(!togglebar )
		{
			var togglebar=dojo.create('div',null,mainNode);
			this.togglebar = togglebar;
			
		    togglebar.id = "togglebar";
		    togglebar.className = 'toggleOutline';
		    togglebar.title = this.nls.toggle;
			dojo.connect(togglebar,'onclick',dojo.hitch(this, this.toggelPanel));
		    this.placeToggleBtn( page );
		}
		
	},
	/**
	 * set toggle position and size
	 * @param page
	 */
	placeToggleBtn: function( page )
	{
		var togglebar = this.togglebar;
	    var top = concord.util.browser.getBrowserHeight()- 30;
	    this.top = top;
	    dojo.style(togglebar, {
			"top": top + "px"
		});	
	    
	    if( !page )
	    {
	    	var doc = concord.util.browser.getEditAreaDocument();
	    	page = dojo.query("div.paging",doc)[0];
	    }
	    else if ( page.domNode )
	    	page =  page.domNode;
	    
	    if( page )
	    {
	    	this.margin = page.offsetParent.offsetLeft + dojo.style(page,"left");
	    	this.left = this.margin + dojo.style(page, "width");
			dojo.style(togglebar, "left", ( this.left - 9 ) + "px");		
	    }
	},
	/**
	 * is panel visible ?
	 * @returns
	 */
	isPanelVisbile: function(){
		
		 return dojo.style( this.outlinePanel, "display")!="none";
	},
	/**
	 * show panel
	 */
	showPanel: function(){
		dojo.style(this.outlinePanel, "display","");
		this.onShow();
	},
	/**
	 * after show
	 */
	onShow: function(){
		//if( this.dirty )
		//TODO:
		{
			this._updatelistOuline();
			this.dirty = false;
			//dojo.style( this.togglebar, "display", "none");
		}
	},
	/**
	 * scroll down
	 */
	onDown: function(){
		
		if( !this.listPane )
			return;
		var lastChild  = this.listPane.lastChild;
		if( !lastChild )
			return;
		
		var firstChild = this.listPane.firstChild;
		
		var viewHeight = this.listPane.clientHeight;
		var contentHeight  = lastChild.offsetTop + lastChild.clientHeight - firstChild.offsetTop;
		
		var scrollTop = dojo.style( firstChild, "marginTop" )||0;
		if( ( viewHeight - scrollTop ) < contentHeight )
		{
			if( !this._index ) this._index = 0;
			this._index++;
			this.scrollTo( this._index );
		}
	},
	/**
	 * scroll to index 
	 * @param index
	 */
	scrollTo: function( index )
	{
		var firstChild = this.listPane.firstChild;
		if( !firstChild )
			return;
		var firstVisible = this.listPane.children[ index ];
		var offset = firstVisible.offsetTop - firstChild.offsetTop;
		firstVisible && dojo.style( firstChild, "marginTop", ( this._contentTop - offset )+"px" );
	},
	/**
	 * scroll up
	 */
	onUp: function(){
		if( !this.listPane )
			return;
		var firstChild = this.listPane.firstChild;
		if( !firstChild )
			return;
		var scrollTop = dojo.style( firstChild, "marginTop" )||0;
		if( !scrollTop || !this._index )
			return;
		this._index--;
		this.scrollTo( this._index );
	},
	/**
	 * hide panel
	 */
	hidePanel: function(){
		dojo.style(this.outlinePanel, "display", "none");
		dojo.style( this.togglebar, "display", "");
	},
	
	/**
	 * create list control
	 * @param panel
	 */
	_createList: function( panel )
	{
		 this.listPane = dojo.create('div',null,panel);
		 this.listPane.className = 'contentList';
	},

	/**
	 * for drag/drop panel
	 * @param element
	 */
	_moveElement: function(element)
	{
		var oldX = oldY = newX = newY = null;
		var startX = startY = 0;
		var pos = {};
		var parentNode = element.parentNode;

		var that = this;
		var mouseMove = function(event) { 
			// Avoid mouse up in other place cause the mouse move handler can't be released.
			if(!that._mouseDown && that._mouseMoveHandler)
			{
				that._mouseDown = false;
				dojo.disconnect(that._mouseMoveHandler);
				that._mouseMoveHandler = null;
				return;
			}	
			
			newX = event.clientX;
			newY = event.clientY;
			pos.x = ((newX - oldX + startX) + "px");
			pos.y = ((newY - oldY + startY) + "px");
			dojo.style(parentNode, {
	        	"left": pos.x,
	        	"top": pos.y
			});
		};
		
		var mouseUp = function(event) {
			that._mouseDown = false;
			if(that._mouseMoveHandler)
			{
				dojo.disconnect(that._mouseMoveHandler);
				that._mouseMoveHandler = null;
			}
			
			if(that._mouseUpHandler)
			{
				dojo.disconnect(that._mouseUpHandler);
				that._mouseUpHandler = null;
			}
			
			dojo.cookie("floatingNavigationPosition", dojo.toJson(pos));
		};
		
		var mouseDown = function(event) {
			that._mouseDown = true;
			if(!that._mouseMoveHandler)
				that._mouseMoveHandler = dojo.connect(document, "onmousemove", mouseMove);
			
			if(!that._mouseUpHandler)
				that._mouseUpHandler = dojo.connect(element, "onmouseup", mouseUp);
			
			var position = concord.util.browser.getElementPositionInDocument( { $: parentNode} );
			startX = position.left;
			startY = position.top;
			oldX = event.clientX;
			oldY = event.clientY;
		};
		
		that._mouseDownHandler = dojo.connect(element, "onmousedown", mouseDown);
	},
	
	_pandelWidth:  200,
	_btnWidth: 16,
	/**
	 * create panel div
	 */
	_createPanel: function()
	{
		var mainNode = dojo.byId('mainNode');
		this.outlinePanel = dojo.create('div',null,mainNode);
		this.outlinePanel.id = "outlinePanel";
		this.outlinePanel.className = 'outlinePanel';
		var outlinePanel = this.outlinePanel;
		//<span class="title">'+ this.nls.title+'</span>
		outlinePanel.innerHTML = '<div class="hd"><div class="up"></div><div>';	//<span class="act"><div class="close"></div></span>
		this.title = outlinePanel.firstChild;
		this._moveElement(this.title);
	//  var closeBtn = dojo.query(".close", outlinePanel )[0];
	//	dojo.connect(closeBtn,'onclick',dojo.hitch(this, this.hidePanel));
		
		this._createList(outlinePanel);
		this.placePanel();
		
		var margin = ( this._pandelWidth - this._btnWidth )/2 + "px";
		
		var upBtn = this.title.firstChild;
		dojo.connect( upBtn,"onclick",dojo.hitch(this, this.onUp));
		dojo.style( upBtn, { "marginLeft" : margin,  "marginRight": margin });
		
		var footerdiv = dojo.create("div",null,this.outlinePanel);
		footerdiv.className = "ft";
		footerdiv.innerHTML = '<div class="down"></div>';
		var downBtn = footerdiv.firstChild;
		dojo.style( downBtn, { "marginLeft" : margin,  "marginRight":margin } );
		dojo.connect( downBtn,"onclick",dojo.hitch(this, this.onDown));
		
		pe.scene.addResizeListener(dojo.hitch(this,this.resize));
	},
	
	placePanel: function()
	{
		var outlinePanel = this.outlinePanel,
			mainNode = outlinePanel.parentNode;
			width = this._pandelWidth, 
			left = mainNode.clientWidth - width - 20,
			topP = 154,
			height = this.top - topP;
			
		if( left > this.left )
			left = this.left;
		
		dojo.style(outlinePanel, { 
			"left": left + "px"
			, "top":  topP + "px"
			, "width": width + "px" 
			, "height": height + "px"
		} );
		
		//place content list
		 var panelWidth = dojo.style( outlinePanel, "width")
		 	,panelHeight = dojo.style( outlinePanel, "height");
		 dojo.style(this.listPane, "height", ( panelHeight - 40  ) + "px");
	},
	/**
	 * on browser resize
	 */
	resize: function()
	{
		this.placeToggleBtn();
		this.placePanel();
	},
	/**
	 * update outline text 
	 */
	_updatelistOuline: function(){
		var paras = writer.util.ModelTools.getOutlineParagraphs( 3 );
		this.listPane.innerHTML = "";
		
		dojo.forEach( paras, 
			dojo.hitch(this,this._insertOutlinePara)
		);
		
		var firstChild = this.listPane.firstChild;
		if( firstChild )
		{
			this._index = 0;
			this._contentTop = dojo.style( firstChild, "marginTop" )||0;
		}
	},
	
	/**
	 * insert paragraph
	 * @param para
	 */
	_insertOutlinePara: function( para )
	{
		if( para.text == "" || !para.text )
			return;
		
		var level = para.getOutlineLvl();
		
		var item = dojo.create('h'+( level + 1 ),null,this.listPane);
		item.innerHTML = para.text;
		item.className = 'outlinePara';
		dojo.connect(item,'onclick', function(){
			var editor = pe.lotusEditor;
			editor.focus();
			var pos = {"obj": para, "index": 0 };
			var range = new writer.core.Range( pos, pos );
			var selection = editor.getSelection();
			selection.selectRanges([range]);
			selection.scrollIntoView();
		});
	},
	/**
	 * show/hide panel
	 */
	toggelPanel: function(){
		if(this.outlinePanel==null){
			this._createPanel();
			this.onShow();
		}
		else 
		{
			(this.isPanelVisbile()) ? this.hidePanel() : this.showPanel();
		}
	}
});