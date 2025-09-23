dojo.provide("writer.model.style.Style");
writer.model.style.Style=function(source,id){
	//this.styles = source;
	this.jsonData = source;
	this.styleId = id;
	this.init(id);
},
writer.model.style.Style.prototype={
	init:function(id)
	{
		if(!this.jsonData)
			return;
		
		this.type = this.jsonData.type;
		this._paraProperty = this.jsonData.pPr && new writer.model.prop.ParagraphProperty(this.jsonData.pPr, null);
		this._textProperty = this.jsonData.rPr && new writer.model.prop.TextProperty(this.jsonData.rPr, null);
		
		// Set default font size to default Docs
		// For sample file FillableSAP-QAPP.docx
		var textStyle = this.jsonData.rPr;
		if(id == writer.model.defaultStyle && textStyle && !textStyle["font-size"])
		{
			textStyle["font-size"] = "10pt";
		}	
		
		this.isDefault = this.jsonData["default"];
		this.name = this.jsonData.name || "";
		// TODO Add ref to parent
		this.parentId = this.jsonData.basedOn;
		this.link = this.jsonData.link;
		this.next = this.jsonData.next;
		this.autoRedefine = this.jsonData.autoRedefine;
		this.displayName = this.aliases;
		this.referers = new common.Container(this);
		this.refId = "SC_"+ (pe.lotusEditor.styleIndex++);		
	},
	/**
	 * to json data
	 */
	toJson: function(){
		
		var jsonData = {};
		this.type && ( jsonData.type = this.type );
		if (this._paraProperty)
			jsonData.pPr = this._paraProperty.toJson();
		if (this._textProperty)
			jsonData.rPr = this._textProperty.toJson();
		this.isDefault && (jsonData["default"] = this.isDefault);
		this.name && (jsonData.name = this.name);
		this.parentId && (jsonData.basedOn = this.parentId);
		this.link && (jsonData.link = this.link);
		this.next && (jsonData.next = this.next);
		this.autoRedefine && (jsonData.autoRedefine = this.autoRedefine);
		return jsonData;
	},
	getName: function()
	{
		return this.name;
	},
	getStyleId: function()
	{
		return this.styleId;
	},
	getMergedTextProperty: function()
	{
		if( !this._mergedTextProperty )
		{	
			var parentTextProp = null;
			if(this.parentId)
			{
				var parentStyle = pe.lotusEditor.getRefStyle(this.parentId);
				parentTextProp = parentStyle && parentStyle.getMergedTextProperty();	
			}	
			
			if(this._textProperty && parentTextProp && parentTextProp != "empty")
				this._mergedTextProperty = parentTextProp.merge(this._textProperty, true);
			else if(this._textProperty)
				this._mergedTextProperty = this._textProperty.clone();
			else if(parentTextProp && parentTextProp != "empty")
				this._mergedTextProperty = parentTextProp.clone();
			else
				this._mergedTextProperty = "empty"; 
		}
		return this._mergedTextProperty;
	},
	
	/**
	 * For style inherit
	 * @returns {String}
	 */
	getParagraphProperty: function()
	{
		if( !this._mergedParaProperty )
		{	
			var parentProp = null;
			if(this.parentId)
			{
				var parentStyle = pe.lotusEditor.getRefStyle(this.parentId);
				parentProp = parentStyle && parentStyle.getParagraphProperty();	
			}	
			
			if(this._paraProperty && parentProp && parentProp != "empty")
				this._mergedParaProperty = parentProp.merge(this._paraProperty);
			else if(this._paraProperty)
				this._mergedParaProperty = this._paraProperty.clone();
			else if(parentProp && parentProp != "empty")
				this._mergedParaProperty = parentProp.clone();
			else
				this._mergedParaProperty = "empty"; 
		}
		
		return this._mergedParaProperty;
	},
	setList: function(numId, level)
	{
		this.clearCache();
		this._paraProperty = this._paraProperty || new writer.model.prop.ParagraphProperty(null, null);
		var msg = (numId == -1) ? this._paraProperty.removeList(true) : this._paraProperty.setList(numId, level);
		if(msg)
		{
			var act = msg.msg.updates[0];
			var rAct = msg.rMsg.updates[0];				
			act.styleId = rAct.styleId = this.styleId;
			var actPair = {"act": act, "rAct": rAct};
			msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Style, [actPair] ,WRITER.MSGCATEGORY.Style );
		}	
		
		return msg;
	},
	addReferer:function(referer){
		!this.referers.contains(referer)&&this.referers.append(referer);
	},
	removeReferer:function(referer){
		this.referers.remove(referer);
	},
	updateReferers:function(){
		this.referers.forEach(function(referer){
			referer.styleChanged&&referer.styleChanged();
		});
		layoutEngine.rootModel.update();
	},
	createCSSStyle:function(str){
		if(!str)
		{
			str = this.toCSSString();
			if(!str||str.length==0){
				delete this.refId;
				return;
			}
			str = "."+this.refId+"{"+str+"}";
		}
		var doc = layoutEngine.editor.getEditorDoc();
		var styleSheet = doc.styleSheets[0];
		if(!this._CSRuleIndex){
			this._CSRuleIndex = styleSheet.cssRules.length;
		}
		str = writer.util.FontTools.fallbackFontsInCss(str);
		styleSheet.insertRule(str,this._CSRuleIndex);
	},
	updateCSSStyle:function(str){
		var doc = layoutEngine.editor.getEditorDoc();
		var styleSheet = doc.styleSheets[0];
		if(this._CSRuleIndex){
			styleSheet.deleteRule(this._CSRuleIndex);
		}
		this.createCSSStyle(str);
	},
	toCSSString:function(){
		var textProperty = this.getMergedTextProperty();
		var str = "";
		if(textProperty!="empty"){
			var style = textProperty.style;
			for(var n in style){
				if(n == "text-decoration")
					continue;
				str += n+":"+style[n]+";";
			}
		}
		return str;
	},
	clearCache:function(){
		delete this._mergedTextProperty;
		delete this._mergedParaProperty;
	}
	
};