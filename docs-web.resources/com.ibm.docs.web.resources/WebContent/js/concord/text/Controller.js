dojo.provide("concord.text.Controller");

dojo.declare("concord.text.Controller", null, {
	
	_layoutEditor: null,
	_ckEditor: null,
	_document: null,
	_view: null,
	constructor: function( layoutEditor, ckEditor, document){
		this._ckEditor = ckEditor;	
		this._layoutEditor = layoutEditor;
		pe.lotusEditor = layoutEditor;
		this._document = document;
		this._view = dojo.byId("editor",document);
		var controller = this;
		layoutEditor.onLayoutFinish = function(){
			controller._editorProcessFinished();
		};
		layoutEditor.onLayoutProgress = function(){
			controller._editorProcessing();
		};
		layoutEditor.onUpdate = function(){
			controller._editorupdated();
		};
		// setup editor
    //  dojo.connect(layoutEditor, "onLoad", this, this._editorLoaded);
        dojo.connect(layoutEditor, "onUpdate", this, this._editorupdated);
        dojo.connect(layoutEditor, "onLayoutProgress", this, this._editorProcessing);
        dojo.connect(layoutEditor, "onLayoutFinish", this, this._editorProcessFinished);
        dojo.connect(layoutEditor,"onCommand", this, this._onCommand );
	},
	
	_editorupdated: function(){
		console.log('updated');
		this._layoutEditor.updateView();
	},
	
	_editorLoaded: function(){
		this._layoutEditor.layoutContent();	
		//this.layoutContent();
	},
	
	_editorProcessing: function( layoutitem ){
		//layoutitem.update();
		//this._layoutEditor.show( { domNode: this._view } ); 
		this._layoutEditor.showContent( { domNode: this._view }); 
	},
	
	_editorProcessFinished: function(){
		
		this._layoutEditor.showContent( { domNode: this._view }); 
	//	this._layoutEditor.show( { domNode: this._view  } );
	},
	_createInsertTextAct: function( sourceItem, text, index )
	{
		function createAct( paragraph, text, index )
		{
			if(text == null || text == "")
				return null;
			console.log('input text: '+text);
			var act= {};		
			act.tid = paragraph.id;	// target id
			act.idx = index;	// index
			act.t = MSGUTIL.actType.insertText;	// type
			act.len = text.length;				// length
			
			var nodelist = [{'t': text,'ip':0}];
			act.cnt = nodelist;	// content	
			return act;
		}
		var dom = sourceItem.storage();
		var paragraph;
		if( dom.id){
			paragraph = new CKEDITOR.dom.element( dom, this._document);
		}
		else {
			paragraph = MSGUTIL.getBlock( new CKEDITOR.dom.element( dom, this._document) );
		}
		var f = sourceItem.first() || sourceItem;
		if( f ) {
			var offset = MSGUTIL.transOffsetRelToAbs( new CKEDITOR.dom.element( f.storage(), this._document),0,paragraph );
			index +=offset;
		}
	
		var act = createAct(paragraph.$, text, index);
		var rAct = null;
		if(act)
		{
			rAct = {};
			rAct.tid = act.tid;					// target id
			rAct.t = MSGUTIL.actType.deleteText;	// Type
			rAct.idx = act.idx;
			rAct.len = act.len;		
		}
		return {"act": act, "rAct": rAct};
	},
	_onCommand: function( command ){
		console.log( command.action );
		switch( command.action )
		{
		case "text":
			if (command.paragraph)
	        {
				var run = command.paragraph;
				var sourceItem = run.getSourceItem();
				var domNode = run.getStorage();
				var actPair = this._createInsertTextAct(sourceItem, command.text, command.index);
				if( actPair.act ){
					PROCMSG.insertText(  this._ckEditor.document.$, actPair.act);
					this._input = true;
					SYNCMSG.sendMessage([SYNCMSG.createMessage(MSGUTIL.msgType.Text, [actPair])]);
					this._input = false;
					if( sourceItem.updateText()){
						run.onTextInserted(command.index, command.text.length);
						run.layout();
					}
					else
					{
						console.error('text is not inserted');
						break;
					}
					if( run.getWidth() <= run.maxWidth() )
					{
						run.update();
						this._layoutEditor.moveCursorTo( run,command.index+command.text.length);
					}
					else
					{
						console.log('no line wrap');
						var line = run.getLine();
						if( line ){
							var paraGraph = line.getParagraph();
							if(paraGraph){
								var oldHeight = paraGraph.getHeight();
								paraGraph.setSizeDirty();
								paraGraph.layout();
								paraGraph.update();
								var newHeight = paraGraph.getHeight();
								var offsetY = newHeight - oldHeight;
								
								var lastP = paraGraph, next;
								while( next = lastP.next()){
									lastP = next;
									next.move( 0, offsetY );
								}
								
								if( lastP._container.maxHeight() < lastP.getBottom()){
								//	console.log('enter next page!');
									console.profile('page wrap');
									var body = lastP._container;
									var root = body.getRoot();
									body.format(paraGraph);
								//	console.profileEnd('page wrap');
								}
								var layoutitem = sourceItem.layoutItem();
								while( layoutitem && !this._layoutEditor.moveCursorTo( layoutitem,command.index+command.text.length)){
									layoutitem = layoutitem.getFollower();
								}
								
							}
						}
					}
				}
			};
			break;
		}
	},
	load: function()
	{
		this._layoutEditor.open( { document:  this._ckEditor.document.$} );
	},
	
	update: function()
	{
	   // update from document
	   this._layoutEditor.update();
	   this._layoutEditor.contentView().update();
	//   this._layoutEditor._model.update();
	},
	
	processMsg : function( msgs ){
		console.log('processMsg');
		if( !this._input )
			this.update();
	}

});