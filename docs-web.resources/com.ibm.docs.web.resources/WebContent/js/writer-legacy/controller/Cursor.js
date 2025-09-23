dojo.provide("writer.controller.Cursor");

dojo.require("writer.controller.CursorContext");
dojo.require("concord.util.browser");
dojo.require("writer.ui.widget.CoEditIndicator");
dojo.require("concord.util.user");

dojo.declare("writer.controller.Cursor",
null, {
	// EditShell
	_shell: null,

	// CursorContext
	_context: null,

	// DOM node of the blinking cursor
	_domNode: null,

	_blinkInterval: null,
	
	_blinkable: true,

    _cursorLayer: 1000,
    
    _visible: false,

    _locked: false,
    
    _offsetH : 2,	// Let the cursor looks beautiful like character g,p.
    
    _color: null,
    
    _useId: null,

	constructor: function(createParam) {
		this._shell = createParam.shell;
		this._color = createParam.color;
		this._userId = createParam.userId;
		this._connections = [];
		if (createParam.blinkable === false)
			this._blinkable = false;
		if (this._shell) {
			this._context = new writer.controller.CursorContext( createParam );
			this._domNode = dojo.create("div", null, this._shell.domNode());
			dojo.style(this._domNode, "position", "absolute");
			dojo.style(this._domNode, "zIndex", this._userId ? this._cursorLayer : this._cursorLayer + 1);
			if (this._userId)
			{
				this._connections.push(dojo.connect(this._domNode, "onmouseenter", this, "showCoEditIndicator"));
				this._connections.push(dojo.connect(this._domNode, "onmouseleave", this, "hideCoEditIndicator"));
			}
			if (this._color)
				this._domNode.style.borderLeftColor = this._color;
		}
	},
	
	hideCoEditIndicator: function(e)
	{
		var _that = this;
		clearTimeout(this._hideIndicatorTimer);
		this._hideIndicatorTimer = setTimeout(function(){
			_that.detachCoEditIndicator(true);
		}, 2 * 1000);
	},
	
	posCoEditIndicator: function()
	{
		if (!this._isVisible())
			return;
		
		if (this.coEditIndicator && this.coEditIndicator.domNode && this._domNode)
		{
			this.coEditIndicator.show(this._domNode);
		}
	},

	showCoEditIndicator: function(autoHide)
	{
		if (!pe.scene.isIndicatorAuthor() || !this._userId)
			return;
		
		if (!pe.scene.getUsersColorStatus(this._userId))
			return;
		
		var target = this._domNode;
		
		if (!this._isVisible() || !target || dojo.style(target, "display") == "none" || !target.parentNode)
		{
			return;
		}
		
		clearTimeout(this._hideIndicatorTimer);
		
		if (this.coEditIndicatorAnim)
			this.coEditIndicatorAnim.stop();
		this.coEditIndicatorAnim = null;
		
		if (this.coEditIndicator)
		{
			dojo.style(this.coEditIndicator.domNode, "opacity", 100);
			
			this.coEditIndicator.show(target);
			if (autoHide)
			{
				this.hideCoEditIndicator();
			}
			return;
		}
		
		this.detachCoEditIndicator();

		var userName = concord.util.user.getUserFullName(this._userId);
		if (userName)
		{
			this.coEditIndicator = new writer.ui.widget.CoEditIndicator({
				label: userName,
				userId: this._userId,
				ownerDocument: this._domNode.ownerDocument
			});
			var editorNode = dojo.byId("editor", this._domNode.ownerDocument); 
			if (editorNode)
				editorNode.appendChild(this.coEditIndicator.domNode);
			this.coEditIndicator.show(target);
			if (autoHide)
			{
				this.hideCoEditIndicator();
			}
		}
	},

	detachCoEditIndicator: function(anim)
	{
		clearTimeout(this._hideIndicatorTimer);
		if (this.coEditIndicator)
		{
			if (this.coEditIndicatorAnim)
			{
				if (anim)
				{
					// let it go.
					return;
				}
				else
				{
					this.coEditIndicatorAnim.stop();
					this.coEditIndicatorAnim = null;
				}
			}
			else if(anim)
			{
				var me = this;
				this.coEditIndicatorAnim = dojo.fadeOut({ node: this.coEditIndicator.domNode, onEnd: function(){
					// stop will not trigger onEnd, stop(true) would.
					if (me.coEditIndicator)
						me.coEditIndicator.destroy();
					me.coEditIndicator = null;
					me.coEditIndicatorAnim = null;
				}});
				this.coEditIndicatorAnim.play();
			}
			
			if (!anim)
			{
				if (this.coEditIndicator)
					this.coEditIndicator.destroy();
				this.coEditIndicator = null;
			}
		}
	},
	
	/*
	 * Render
	 */
	updateDOM: function(updateParam) {
		//if(this._shell.getEditor().isReadOnly()){
		//	return;
		//}
		
		if (updateParam) {
			var _domNode = this._domNode;
			window.setTimeout(
					function(){
						var func = updateParam.italic ? "addClass" : "removeClass";
						dojo[func]( _domNode, "italicCursor" );
					}, 0 );

			if (!isNaN(updateParam.length)) {
				dojo.style(this._domNode, "height", (updateParam.length + this._offsetH) + "px");
			}

			if (!isNaN(updateParam.thickness)) {
				if(concord.util.browser.isMobile())
					dojo.style(this._domNode, "borderLeft", updateParam.thickness +"px solid "+ (updateParam.bColor ? updateParam.bColor : "#426bf2"));
				else
					dojo.style(this._domNode, "borderLeft", updateParam.thickness +"px solid " +(updateParam.bColor ? updateParam.bColor : "#000000"));
			}
			
			if (this._color)
				this._domNode.style.borderLeftColor = this._color;
			
			if (updateParam.position) {
				var x = updateParam.position.x + "px";
				var y = updateParam.position.y + "px";
				dojo.style(this._domNode, { "left": x, "top": y });
			}
		} else {
			var cursorInfo = this._context.getCursorInfo();
			if( cursorInfo )
				this.updateDOM(cursorInfo);
		}
	},
	_show: function(){
		if (this._locked)
			return;
		
		dojo.style(this._domNode, "visibility", "visible");
		this._visible = true;
	},
	_hide: function(){
		if (this._locked)
			return;
		
		dojo.style(this._domNode, "visibility", "hidden");
		this._visible = false;
	},
	_isVisible: function(){
		return this._visible;
		//return  dojo.style(this._domNode, "visibility") != "hidden";
	},
	
	lock: function() {
		this._locked = true;
	},
	
	unlock: function() {
		this._locked = false;
	},
	
	show: function( noblink, highlight ) {
		if( !noblink ){
			this._blink();
		}
		else{
			this._quiet();
			if(!this._isVisible())
				this._show();
		}
		if (highlight && this._domNode)
		{
			var blc = "borderLeftColor";
			var n = this._domNode;
			var color = dojo.style(n, blc);
			dojo.style(n, blc, "blue");
			this._blinkable = true;
			this._blink();
			var me = this;
			setTimeout(function(){
				me._quiet();
				me._blinkable = false;
				dojo.style(n, blc, color);
			}, 1500);
		}
	},
	
	getX: function(){
		return this._domNode.style.left;
	},
	getY: function(){
		return this._domNode.style.top;
	},
	hide: function() {
		this._quiet();
		if(this._isVisible())
			this._hide();
	},
	quiet: function(){
		this.show(true);
	},
	_quiet:function(){
		if(this._blinkInterval){
			clearInterval( this._blinkInterval );
			this._blinkInterval = null;
		}
	},

	_blink: function() {
		
		function proc(){
			if( this._isVisible() ){
				this._hide();
			}
			else {
				this._show();
			}
		};
		if( this._blinkInterval )
			clearInterval( this._blinkInterval );
		this._show();
		
		if (this._blinkable)
			this._blinkInterval = setInterval( dojo.hitch( this,proc ), 500);
	},

	/*
	 * Movement
	 */
	moveTo: function(run, index) {
		if (this._context && this._context.moveTo(run, index)) {
			this.updateDOM();
			return true;
		}
		return false;
	},

	/*
	 * Events
	 */
	_onFocus: function(event) {
		this.show();
	},

	_onBlur: function(event) {
		this.hide();
	},
	
	getContext: function() {
		return this._context;
	},
	
	destroy: function()
	{
		this._quiet();
		if (this._connections)
			dojo.forEach(this._connections, dojo.disconnect);
		this._connections = [];
		dojo.destroy(this._domNode);
		this.detachCoEditIndicator();
		this._context = null;
		this._destroyed = true;
	}
	
});
