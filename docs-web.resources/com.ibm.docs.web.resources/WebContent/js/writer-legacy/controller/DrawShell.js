dojo.provide("writer.controller.DrawShell");

dojo.require("writer.controller.EditWindow");
dojo.declare("writer.controller.DrawShell", [], {
		
		_editWindow: null,
		_editor: null,
		_domRect: null,
		getEditor:function(){
			if (this._editor){
				return this._editor;
			}
			throw "no editor in DrawShell";
			return null;
		},
		onEditorResized:function(left){
			this._editor._viewHeight = null;
			
			this.baseLeft=left;
			// update current cursor position.
			this.getSelection().updateSelection(true);
		},
		connect: function( editor ) {
			this._editor = editor; //editor's dom
			this._installRenderEvents();
			
			this.win = concord.util.browser.getEditAreaWindow();
			var doc = concord.util.browser.getEditAreaDocument();
			this._mainNode = doc.body;
			var documentNode = dojo.query('div.document',this._mainNode )[0];
			
			this.baseLeft = documentNode.offsetLeft;
			this.baseTop = documentNode.offsetTop;
			pe.scene.addResizeListener(dojo.hitch(this,this.onEditorResized));
		},
		
		domNode: function( ){
			return this._editor.getEditorDIV();
		},
		
		editor: function(){
			return this._editor;
		},
		//TODO:...
		//{"delX":fixedX-x,"delY":(h-this.h)-y,"index":index,"offsetX":fixedX,"lineH":h,"h":this.h}
		itemByPoint:function(x,y){
			var point = this.clientToLogical({'x': x,'y': y});
			var rootView=window.layoutEngine.rootView;
			var path = rootView.getElementPath(point.x,point.y);		
			var lastpath = path[path.length-1];
			point.x = x+(lastpath.delX || 0);
			point.y = y+(lastpath.delY || 0); 
			var h = lastpath.h;
			this.selectedPath = path;
			this.basePoint= point;
			return this.selectedPath;
		},
		
		getSelectedIdx:function(){
			var sel = this.selectedPath[this.selectedPath.length-1];
			return sel;
		},
		getSelectedRun:function(){
			var run = this.selectedPath[this.selectedPath.length-2];
			return run;
		},
		getSelectedLine:function(){
			var line= this.selectedPath[this.selectedPath.length-3];
			return line;
		},
		getItemPosition:function(item){
			var x = item.getLeft();
			var y = item.getTop();
			return {'x':x ,'y':y };
		},
		getChildPosition:function(item,index){
			var p = item.getChildPosition(index);
			return {'x':p.x,'y':p.y };
		},
		//
		view: function(){
			return window.layoutEngine.rootView;
		},	
		
		_installRenderEvents: function() {
			this._uninstallRenderEvents();
			this._editWindow = new writer.controller.EditWindow({ shell: this}); 
		},

		_uninstallRenderEvents: function() {
			this._editWindow && this._editWindow.destroy();
			this._editWindow = null;
		},

		getEditWindow: function(){
			return this._editWindow;
		},
		
		focus: function()
		{
			this._editWindow && this._editWindow.grabFocus();
		},

		//unit conversion for point
		//Convert Screen unit to that base on editor div.
		screenToClient: function( point ){
			
			if(!concord.util.browser.isMobile() || !this._domRect)
				this._domRect = dojo.position(this.domNode());
			var scale = this._editor.getScale();
//			console.log("screen to client: "+point.y +"/" + this._domRect.y +"/"+scale);
			return (concord.util.browser.contentInIframe())? {
				'x': (point.x - this._domRect.x)/scale,
				'y': (point.y - this._domRect.y)/scale
			} : {
					'x': (point.x)/scale,
					'y': (point.y)/scale
				};
		},
		/**
		 * get input node
		 * @returns
		 */
		getInputNode: function(){
			return this._editWindow._inputNode;
		},
		//Convert unit base on editor div to unit base on document
		clientToLogical: function( point ){
			return {
				'x': point.x - this.baseLeft,
				'y': point.y - this.baseTop
			};
		},
		
		//Convert unit base on document to unit base on editor
		logicalToClient: function( point ){
			return ({
				'x': point.x + this.baseLeft,
				'y': point.y + this.baseTop
			});
			return point;
		},
		logicalToScreen: function( point ){
			if(!concord.util.browser.isMobile() || !this._domRect)
				this._domRect = dojo.position(this.domNode());
			var scale = this._editor.getScale();
			return {
				'x': (point.x + this.baseLeft) * scale + this._domRect.x,
				'y': (point.y + this.baseTop) * scale + this._domRect.y
			};
		}
	});