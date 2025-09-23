dojo.provide("websheet.widget.LinkDiv");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet","base");
dojo.declare('websheet.widget.LinkDiv', null,{
		//	summary:
		//		Provide the div to show url when a cell include valid link. 
		//
		//    
		//	description:
		//		The div is an individual node within a sheet, After create it, it can be show 
		// and hide call Show/Hide methods and set the default value with setValue().
		// the boundary is fixed
		//
		// 	
	className : "linkdiv",
    DEFAULT_HEIGHT : 17,
    DEFAULT_WIDTH  : 250,	
    _grid:null,
	_linkDiv: null,
	_link: null,	
	_linkRemove: null,
	_split: null,
	_gotoLink: null,
	_handler:null,
	_handlerRemove:null,
	_connectors:[], //handle keyboard access
	_navItems:[], //navigation items with keyboard ACC.
	_navIndex:-1,
	
	/**
	 * Construct the class with grid parent and border width
	 */
	constructor:function(grid){    
		this._grid = grid;   
        var contentNode = grid.contentViews;
		this._createLinkDivBoxNode(contentNode);	
		this._sheetNode = dojo.byId("sheet_node");		
	},
	
	/**
	 * Create the textarea dom node 
	 */
	_createLinkDivBoxNode:function(content)
	{
     	this._linkDiv = dojo.create('div',null,content);     	
		this._linkDiv.className = this.className;
		//For ACC rpt: LinkDiv should have unique ID. (This may be created several times in different sheets).
		//ID format:  "linkDiv_$SHEETNAME"
		this._linkDiv.id = "linkDiv_" + this._grid.getSheetName();
		this._linkDiv.style.top = "0px";
		this._linkDiv.style.left = "0px";
        this._linkDiv.style.height = this.DEFAULT_HEIGHT+"px";	
		this._linkDiv.style.display = "none";  
		dojo.attr(this._linkDiv, "tabIndex", 0);//make linkdiv focusable
		this._connectors.push(dojo.connect(this._linkDiv, "onkeydown", this, "onKeydown"));
		this._connectors.push(dojo.connect(this._linkDiv, "onkeypress", this, "discard"));
		this._connectors.push(dojo.connect(this._linkDiv, "onkeyup", this, "discard"));
		this._connectors.push(dojo.connect(this._linkDiv, "oncontextmenu", this, "preventContextMenu"));
		content.appendChild(this._linkDiv);
		
	},
	
	/**
	 * Check if the editor is show state. 
	 * return: true  -- it's shown
	 * 			false -- it's hidden
	 */
	isShow:function(){
		if (this._linkDiv.style.display == "")
			return true;
		else
			return false;
	},
	
	/**
	 * Show the inline InputBox when cell is editing mode
	 * isFocus: false -- don't set the focus
	 * 			ture or undefined -- set the focus by default.
	 */	
	show: function(isFocus){	
		this._linkDiv.style.display = "";		
	},
	
	/**
	 * Hide the inline inputbox when cell is leave editing mode
	 * Clear the value and lost focus when hide it.
	 */
	hide: function(){
		this._linkDiv.style.display = "none"; 
		this._linkDiv.value = "";
		this._navIndex = -1;
	},
	
	getShowValue:function(value){
		var max = 36;	
		var showValue = value;
		if(value.length>max)
	   		showValue = value.substring(0,max-10)+"..."+value.substring(value.length-10);
	    return showValue;
	},

	disconnectHandler:function(){
		 if(this._handler){
	    	dojo.disconnect(this._handler);
	    	this._handler=null;	    		    	
	    }
	    if(this._handlerRemove){	    	
	    	dojo.disconnect(this._handlerRemove);
	    	this._handlerRemove=null;	    	
	    }
	},
	/**
	 * Remove the link style of current cell
	 * @param e
	 */
	removeLink: function (e) {
		e.preventDefault();
		e.stopPropagation();			
		this._grid.removeCellLink();
		this.hide();
	},
	
	/**
	 * Set the value to the editor, and adjust the boundary according to the value.
	 * value: the value which be inputed
	 */
	setValue:function(value, isFormula){		
		if(value == null)
			return;	
		
		var regexp = /^((ftp|http|https):\/\/)+/i;
		if(!regexp.test(value))
			 value="http://"+value;	
	    var title=this.getShowValue(value);	
	    title = websheet.Helper.escapeXml(title);
	   	this.disconnectHandler();
	   	if(this._link){
			this._linkDiv.removeChild(this._link);	
			this._linkDiv.removeChild(this._gotoLink);	
			this._link = null;	
			this._gotoLink = null;
		   	this._navItems.length = 0;//delete all the navigation items
	   	}	   	
	   	if(this._linkRemove){			
			this._linkDiv.removeChild(this._linkRemove);
			this._linkDiv.removeChild(this._split);		
			this._linkRemove = null;
			this._split = null;	 
			
	   	}	
	   	var nls = dojo.i18n.getLocalization("websheet","base");	   	
	   	this._gotoLink = dojo.create("span", {innerHTML : nls.LINKDIV_GOTOLINK},this._linkDiv);
	    this._link = dojo.create("a",{href:value, innerHTML:title, target:"_blank",title:value},this._linkDiv);
	    dijit.setWaiState(this._link,'label',nls.LINKDIV_GOTOLINK);
	    dojo.attr(this._link, "tabIndex", 1);
		var openLink = function (e) {
			// stop data grid event dispatcher from handling the event;
			e.stopPropagation();
			var link = this;
			setTimeout(function () {
				link.hide();
			}, 1000);
		};
	   	this._navItems.push(this._link);
		this._handler = dojo.connect(this._link, "onmousedown", dojo.hitch(this,openLink));	
		if(!isFormula && !this._grid.editor.scene.isViewMode()){
			this._split = dojo.create("span", {innerHTML : " - "},this._linkDiv);			   		   
			this._linkRemove = dojo.create("a",{href:"#", innerHTML:nls.LINKDIV_REMOVE},this._linkDiv);
			dijit.setWaiState(this._linkRemove,'label',nls.acc_linkdiv_remove);
			dojo.attr(this._linkRemove, "tabIndex", 2);
			this._handlerRemove=dojo.connect(this._linkRemove,"onmousedown",this, "removeLink");
			this._navItems.push(this._linkRemove);
		}		
	},

	/**
	 * Adjust the position of the linDiv
	 * cellPos: the position information of the cell
	 */	
	adjustPosition:function(cellPos){
		if(!cellPos)
			return;	
		this._linkDiv.style.left = (cellPos.l + cellPos.w) + "px";
		this._linkDiv.style.top = (cellPos.t + cellPos.h) + "px";
	},
	
	//stop right click event to prevent pop-up context menu .
	preventContextMenu: function(e){
		dojo.stopEvent(e);
		var item = this._navItems[this._navIndex];
		if(item) item.focus();
	},
	
	onKeydown: function(e){
		var dk = dojo.keys, item = null;
		switch(e.keyCode){
		case dk.TAB:
			dojo.stopEvent(e);
			this._navIndex = (this._navIndex + 1)%this._navItems.length;
			item = this._navItems[this._navIndex];
			if(item) item.focus();
			break;
		case dk.ESCAPE:			
			dojo.stopEvent(e);
			//hide link if it's shown			
			if(this.isShow()){
				this.hide();					
			}				
//			this._grid.editor._focus();				
			
			break;
		case dk.ENTER:
			dojo.stopEvent(e);
			item = this._navItems[this._navIndex];
			if(item){
				if(item == this._link){
					window.open(item.href);
					this.hide();
				}else if(item == this._linkRemove){
					this.removeLink(e);
				}
			}
		default:
			break;
		}
	},
	discard: function(e){
		dojo.stopEvent(e);//Discard the keypress/keyup event to prevent dojo grid from handling .
	},
	  /**
	   * Destory the editor after parent grid is destory.
	   */
	destroy: function()
	{
		this.disconnectHandler();
		dojo.forEach(this._connectors, dojo.disconnect);
	    if (this._linkDiv )
	    {
	    	dojo.destroy(this._linkDiv);
			delete this._linkDiv;	    	
		}
	}   		 
});		
