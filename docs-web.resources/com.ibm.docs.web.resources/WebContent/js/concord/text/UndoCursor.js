dojo.provide("concord.text.UndoCursor");
dojo.require("concord.text.MsgUtil");

dojo.declare("concord.text.UndoCursor",null,{
	editor: null,
	doc: null,
	lastAct: null,
	_tar: null,
	_index: null,
	_type: null,
	constructor: function( editor,doc,msg ){
		this.editor = editor;	
		this.doc = doc;
		
		this._tar = null;
		this._index = null;
		this._type = null;
		
		var acts = msg.as || msg.updates;
		
		this.lastAct = null;
		
		var actType = MSGUTIL.actType;
		for( var i= acts.length-1 ; ( i >=0 && !this.lastAct ); i-- )
		{
			var act = acts[i];	
			switch(act.t)
			{
				case actType.insertText:
				case actType.deleteText:
				case actType.insertElement:
				case actType.deleteElement:
				case actType.setStyle:
				case actType.removeStyle:
				case actType.setAttributes:
			//	case actType.UpdateListValue:
				case actType.ChangeListType:
					this.lastAct = act;
			}
		}
	},
	setTextIndexRange: function( tid, index )
	{
		this.type = "text";
		var tar = this.doc.getElementById( tid );
		this._tar = tar && new CKEDITOR.dom.element( tar );
		this._index = index;
		this.saveTarget();
		
	},
	setElementRange: function( tid, index  )
	{
		this.type = "element";
		var tar = this.doc.getElementById( tid );
		this._tar = tar && new CKEDITOR.dom.element( tar );
		this._index = index;
		this.saveTarget();
		
	},
	saveTarget: function( tar )
	{
		if( this._tar )
		{
			this._parent =this._tar.getParent();
			this._pIndex = this._tar.getIndex();
		}
	},
	getTarget: function()
	{
		if( !this._tar )
			return null;
		if( !MSGUTIL.isBlockInDomTree( this._tar ))
		{
			this._index = this._pIndex;
			this._tar = this._parent;
		}
		return this._tar;
	},
	storeCursor : function()
	{
		var act = this.lastAct;
		var actType = MSGUTIL.actType;
		if(  act ){
			switch( act.t ){
				case actType.insertText:
					this.setTextIndexRange( act.tid, act.idx + act.len );
					break;
				case actType.deleteText:
					this.setTextIndexRange( act.tid, act.idx );
					break;
				case actType.setStyle:
				case actType.removeStyle:
					this.setTextIndexRange( act.tid, act.i + act.l);
					break;
				case actType.deleteElement:
				case actType.insertElement:
				case actType.setAttributes:
				case actType.UpdateListValue:
				case actType.ChangeListType:
					this.setElementRange( act.tid, act.idx );
					break;
				default:
					break;
				
			}
		}
	},
	restoreCursor: function()
	{
		var tar = this.getTarget();
		if( !tar )
			return;
		if( tar.getName()!=='body' )
		{
			tar.scrollIntoView( true );
		}
		else
		{
			var element = tar.getChild( this._index );
			element && element.scrollIntoView( true );
		}
		var sel = this.editor.getSelection();
		if( !sel )
			return;
			
		var range = sel.getRanges()[0];
		switch ( this.type )
		{
			case "text":
			{
				var c = MSGUTIL.getInsertPos( tar, this._index);
				range.setStart( c.container,  c.offset  );
				break;
			}
			case "element":
			{
				if( this._index == null )
					range.setStartBefore( tar );
				else
				{
					if( tar.is("tbody"))
					{
						var row = tar.getChild( this._index ) || tar.getLast();
						range.moveToElementEditStart( row );
					}
					else
						range.setStart( tar, this._index );
				}
					
				break;
			}
		}		
		range.collapse( true );
		concord.text.tools.fixRange(this.editor,range);
		sel.selectRanges( [range]);
		
	}
});