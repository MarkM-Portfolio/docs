dojo.provide("writer.model.Model");
writer.MODELTYPE = {
	DOCUMENT: "document",
	HEADERFOOTER: "headerfooter",
	PARAGRAPH: "paragraph",
	TABLE:"table.table",
	ROW:"table.row",
	CELL:"table.cell",
	TEXT : "run.text",
	LIST: "list",

	// image
	IMAGE: "run.image",			// Inline image
	TBIMAGE: "run.tbImage",		// top&bottom image
	SQIMAGE: "run.sqImage",		// square image
	FLIMAGE: "run.floatImage",	// float image
	SIMPLEIMAGE: "run.simpleImage",	// simple image in canvas/group
	
	// textbox/shape
	TXBX: "run.txbx",			// inline textbox
	FLTXBX: "run.floatTxbx",	// float textbox
	SQTXBX: "run.sqTxbx",		// square text box
	TBTXBX: "run.tbTxbx",		// top&bottom text box
	SIMPLETXBX: "run.simpleTxbx",	// simpleTxbx in canvas/group

	// canvas/group
	CANVAS: "run.canvas",		// inline canvas
	FLCANVAS: "run.floatCanvas",// float canvas
	SQCANVAS: "run.sqCanvas",	// square canvas
	TBCANVAS: "run.tbCanvas",	// top&bottom canvas
	SIMPLECANVAS: "run.simpleCanvas",	// simpleCanvas in canvas/group

	// Alternate Content Run
	ALTCONTENT: "run.altContent",

	//TOC
	TOC: "toc",

	LINK: "run.hyperlink",
	RFOOTNOTE:"run.rfootNote",
	RENDNOTE:"run.rendNote",
	FIELD: "run.field",
	FOOTNOTE:"footnote",
	ENDNOTE:"endnote",
	NOTEITEM:"noteitem",
	PAGENUMBER: "run.pageNumber", //only in header/footer
		
	BOOKMARK: "run.bookMark"
};

writer.model.Model=function(){
	this.refId = null;
	this._viewers = null;
};
writer.model.Model.prototype={
	viewConstructors:{
	},
	isCompoundModel: function()
	{
		var mType = this.modelType;
		if(mType == 'table' || mType == 'tr' || mType == 'tc' )// tr/tc
		{
			return true;
		}
		return false;
	},
//	byId: function()
//	{
//		return null;
//	},
	_initView:function(ownerId){
		var cont = new common.Container(this);
    		this._viewers = this._viewers || {};
    		this._viewers[ownerId] = cont;
		return cont;
	},
	preLayout:function(ownerId,clearState){
		if(!ownerId){
			console.error("the ownerId must be needed");
			return null;
		}
		clearState&&this.clearState&&this.clearState();
		var constructor = this.viewConstructors[this.modelType];
		
		this._initView(ownerId);
		var viewer = new constructor(this, ownerId );
		this.addViewer(viewer,ownerId);
		return viewer;
	},
	addViewer:function(viewer,ownerId,after){
		if(!ownerId){
			console.error("the ownerId must be needed");
			return null;
		}
		var viewers = this.getViews(ownerId);
		if(!viewers){
			viewers = this._initView(ownerId);
		}
		if(after){
			viewers.insertAfter(viewer,after);
		}else{
			viewers.append(viewer);
		}		
		this.addViewerCallBack(viewer);
	},
	removeViewer:function(viewer,ownerId){
		ownerId = ownerId||viewer.getOwnerId();
		if(!ownerId){
			console.error("something Error");
			return;
		}
		var viewers = this.getViews(ownerId);
		if(!viewers){
			console.error("something Error");
			return 
		}
		viewers.remove(viewer);
		if (viewers.isEmpty())
			delete this._viewers[ownerId];
	},
	addViewerCallBack:function(view){
    	
    },
    getViews:function(ownerId){
    	if(!this._viewers)
    		return null;
    	var viewer = this._viewers[ownerId];
    	if (!viewer) return null;
    	else return viewer;
    },
    getRelativeViews:function(ownerId){
    	return this._viewers[ownerId];
    },
    getAllViews:function(){
    	return this._viewers;
    },
    getOwnerId:function(view){
    	if(view){
    		for(var ownerId in this._viewers){
    			if(this._viewers[ownerId].contains(view)){
    				return ownerId;
    			}
    		}
    	}
    	return null;
    },
    getParent: function(){
    	return this.parent;
    },
	firstChild: function(){
		if (!this.container){
			return null;
		}
		return this.container.getFirst();
	},
	lastChild: function(){
		if (!this.container){
			return null;
		}
		return this.container.getLast();
	},
	
	nextChild: function( m ){
		if (!this.container){
			return null;
		}
		return this.container.next(m);
	},
	
	previousChild: function( m ){
		if (!this.container){
			return null;
		}
		return this.container.prev( m );
	},
	
	next: function(){
		if (!this.parent){
			return null;
		}
		return this.parent.nextChild( this);
	},
	previous: function(){
		if (!this.parent){
			return null;
		}
		
		return this.parent.previousChild(this);
	},
    broadcast:function(message, param){
		if (!this._viewers)
			return;

		if (this._viewers.isContainer) {
			var view = this._viewers.getFirst();
			while(view){
				try{
					view.listener&&view.listener(message,param);
					view = this._viewers.next(view);
				}catch( e ){
					console.log( e.message );
					view = null;
				}
			}
		} else {
			for(var ownerId in this._viewers){
				var viewers = this._viewers[ownerId];
				var view = viewers.getFirst();
				while(view){
					try{
						view.listener&&view.listener(message,param);
						view = viewers.next(view);
					}catch( e ){
						console.log( e.message );
						view = null;
					}
				}
    		}
		}
    },
    
    // For performance reason, change function call to inline.
    _isValid: function(prop)
    {
    	if(prop && prop != 'empty')
    		return true;
    	return false;
    },
    
    getMergedTextProperty: function(){
    	if(!this.mergedTextProperty){
    		if(this.modelType == writer.MODELTYPE.DOCUMENT || this.modelType == writer.MODELTYPE.HEADERFOOTER
    				||this.modelType==writer.MODELTYPE.FOOTNOTE||this.modelType==writer.MODELTYPE.ENDNOTE)
			{
    			// Get default style 
    			var styleTextProp = null;
    			if (window.layoutEngine && window.layoutEngine.rootModel){
    				var editor = pe.lotusEditor;
    				var docDefaultStyle = editor.getRefStyle(writer.model.defaultStyle);
//    				var paraDefaultStyle = editor.getDefaultParagraphStyle();
    				var textDefaultStyle = editor.getDefaultTextStyle();
    				
    				var docDefaultTextProp = docDefaultStyle && docDefaultStyle != "empty" && docDefaultStyle.getMergedTextProperty();
//    				var paraDefaultTextProp = paraDefaultStyle && paraDefaultStyle != "empty" && paraDefaultStyle.getMergedTextProperty();
    				var textDefaultTextProp = textDefaultStyle && textDefaultStyle != "empty" && textDefaultStyle.getMergedTextProperty();
    				
    				var that = this;
    				var mergeTextProp = function(srcTextProp, destTextProp)
    				{
    					if(srcTextProp && srcTextProp != "empty")
        				{
        					if(destTextProp && destTextProp != "empty")
        						return srcTextProp.merge(destTextProp, true);
        					else
        						return srcTextProp;
        				}
        				else if(destTextProp && destTextProp != "empty")	
        					return destTextProp;
    					return null;
    				};
    				
//    				styleTextProp = mergeTextProp(docDefaultTextProp, paraDefaultTextProp);
    				styleTextProp = mergeTextProp(docDefaultTextProp, textDefaultTextProp);
    			}
    			
    			var textProp = this.textProperty;
    			if(styleTextProp && styleTextProp != "empty" && textProp)
    			{
    				this.mergedTextProperty = styleTextProp.merge(textProp, true);
    			}
    			else if(textProp || (styleTextProp && styleTextProp != "empty"))
    				this.mergedTextProperty = (textProp || styleTextProp).clone();
    			else
    				this.mergedTextProperty = "empty";	//Empty merged object
			}
    		else
    		{
    			var parent = this.parent;
    			// Defect 43306, Don't get parent's text property for text box object.
    			// Can't forbidden paragraph's css. 
//    			if(writer.util.ModelTools.isTextBox(this))
//    				parent = writer.util.ModelTools.getDocument(this);
    				
    			var parentTextProp = parent && parent.getMergedTextProperty();
    			
    			var style = null;
    			if (window.layoutEngine && window.layoutEngine.rootModel){
    				//TODO: header/footer style
    				if(this.getStyleId())
        				style = pe.lotusEditor.getRefStyle(this.getStyleId());
        			//else
        			//	style = pe.lotusEditor.getDefaultTextStyle();
    			}
    			
    			var styleTextProp = style && style.getMergedTextProperty();
    			var textProp = this.textProperty;
    			if(styleTextProp && styleTextProp != "empty" && textProp)
    			{
    				this.mergedTextProperty = styleTextProp.merge(textProp, true);
    			}
    			else if(textProp || (styleTextProp && styleTextProp != "empty"))
    				this.mergedTextProperty = (textProp || styleTextProp).clone();
    			else
    				this.mergedTextProperty = "empty";	//Empty merged object 
    			
    			if( parentTextProp && parentTextProp != "empty" )
    			{
    				if(this.mergedTextProperty == "empty")
    					this.mergedTextProperty = parentTextProp.clone();
    				else
    					this.mergedTextProperty = parentTextProp.merge(this.mergedTextProperty);
    			}    			
    			
    		}
    		
    	}
    	return this.mergedTextProperty;
    },
    
    getCSSStyle:function(){
    	var style = null;
		if (window.layoutEngine && window.layoutEngine.rootModel){
			if(this.getStyleId()){
				style = pe.lotusEditor.getRefStyle(this.getStyleId());
			}else{
    			style = pe.lotusEditor.getDefaultTextStyle();
			}
		}
		var str = " ";
		if(style && style.refId){
			str +=style.refId;
		}
		
		var defaultStyle = this.getDefaultStyle && this.getDefaultStyle();
		if(defaultStyle && defaultStyle.refId)
			str += (" " + defaultStyle.refId);
		return str;
    },
    getStyle:function(){
    	if(!this.mergedStyle){
    		this.mergedStyle =this.textProperty;
			if(this.mergedStyle == "empty"||!this.mergedStyle){
	    		this.mergedStyle={};
	    	}else{
	    		this.mergedStyle = this.mergedStyle.getStyle();
	    	}
    	}
    	return this.mergedStyle;
	},
	getComputedStyle:function(){
		if(!this.mergedComputedStyle){
			if(!this.parent){
				return null;
			}
			var parentTextProperty = this.parent.getMergedTextProperty();
			if(parentTextProperty && parentTextProperty != "empty"){
				this.ParentBGColor = parentTextProperty.getStyle()['background-color'];
			}
			if(parentTextProperty && this.textProperty){
				this.mergedComputedStyle = this.textProperty.getComputedStyle(parentTextProperty);
			}else{
				var s = (parentTextProperty||this.textProperty);
				if(s&&s.getStyle){
					this.mergedComputedStyle = s.getStyle();
				}
			}
		}
		
		return this.mergedComputedStyle;
	},
	clearCache:function(){
		delete this.mergedStyle;
		delete this.mergedTextProperty;
		delete this.mergedComputedStyle;
		delete this.ParentBGColor;
	},
	clearAllCache:function(){
		this.clearCache();
		this.container && this.container.forEach(function(c){
			if(c && c.clearAllCache )
				c.clearAllCache();
		});
	},
	createSubModel:function(json){
		return g_modelFactory.createModel(json, this);
		
	},
	getStyleId:function(){
		// Must override function
		console.error("Need implement the get styleId function in model!");
	},
	getItemByIndex:function(index){
		return this.container.getByIndex(index);
	}
};